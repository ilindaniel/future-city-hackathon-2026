import { load } from "cheerio";
import { classifyOfferTopics, type Offer, type OfferScheduleEntry, validateOffer } from "../offers.ts";
import type { ExperimentaSourceConfig } from "../source-config.ts";

const EXPERIMENTA_HOSTS = ["experimenta.science", "www.experimenta.science"];
const DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const TIME_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

type ParsedEvent = {
  sourceId: string;
  sourceUrl: string;
  title: string;
  description: string;
  groups: string[];
  schedule: OfferScheduleEntry[];
};

export type FetchHtml = (url: string) => Promise<string>;

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isExperimentaHostname(hostname: string) {
  return EXPERIMENTA_HOSTS.includes(hostname);
}

function parseGroups(value: string | undefined) {
  if (!value) return [];
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed) || parsed.some((group) => typeof group !== "string")) {
    throw new Error("Experimenta event contains invalid groups");
  }
  return parsed;
}

function parseAge(groups: readonly string[], value: string) {
  const minimumFromGroup = groups
    .map((group) => group.match(/^ab-(\d{1,2})-jahren$/)?.[1])
    .find((age) => age !== undefined);
  const normalizedValue = value.replace(/[–—]/g, "-");
  const range = normalizedValue.match(/\b(\d{1,2})\s*(?:-|bis)\s*(\d{1,2})\s*Jahr/i);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };

  const minimumFromText = normalizedValue.match(/\bab\s+(\d{1,2})\s*Jahr/i)?.[1];
  return {
    min: minimumFromGroup ? Number(minimumFromGroup) : minimumFromText ? Number(minimumFromText) : null,
    max: null,
  };
}

function isChildFacing(groups: readonly string[], value: string) {
  return (
    groups.some((group) => /^ab-\d{1,2}-jahren$|familien|grundschule|jugendliche|schueler/.test(group)) ||
    /\b(?:ab\s+)?\d{1,2}\s*(?:-|bis)\s*\d{1,2}\s*Jahr|\bab\s+\d{1,2}\s*Jahr/i.test(value)
  );
}

function formatDate(timestamp: number) {
  const parts = DATE_FORMATTER.formatToParts(new Date(timestamp * 1_000));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function parseSchedule(sourceUrl: URL, timeText: string, fallbackTimestamp: string | undefined): OfferScheduleEntry {
  const timestampValue = sourceUrl.searchParams.get("termin") ?? fallbackTimestamp;
  const timestamp = Number(timestampValue);
  if (!Number.isInteger(timestamp) || timestamp <= 0) throw new Error("Experimenta event contains an invalid date");

  const range = timeText.match(/\b(\d{1,2}:\d{2})\s*bis\s*(\d{1,2}:\d{2})\s*Uhr/i);
  return {
    date: formatDate(timestamp),
    startTime: range?.[1]?.padStart(5, "0") ?? TIME_FORMATTER.format(new Date(timestamp * 1_000)),
    endTime: range?.[2]?.padStart(5, "0") ?? null,
    timezone: "Europe/Berlin",
  };
}

function getCanonicalSourceUrl(href: string, baseUrl: string) {
  const sourceUrl = new URL(href, baseUrl);
  if (!isExperimentaHostname(sourceUrl.hostname)) throw new Error("Experimenta event links to an unexpected host");
  sourceUrl.search = "";
  sourceUrl.hash = "";
  return sourceUrl.toString();
}

export function parseExperimentaCalendarPage(html: string, baseUrl: string, importedAt: string) {
  const $ = load(html);
  const events = new Map<string, ParsedEvent>();
  let discoveredOccurrenceCount = 0;

  $(".veranstaltungen-card").each((index, element) => {
    const card = $(element);
    const eventReference = card.attr("data-event");
    const sourceId = eventReference?.match(/^(\d+)(?:-|$)/)?.[1];
    const title = cleanText(card.find("h5").first().text());
    const description = cleanText(card.find(".veranstaltungen-card-content p").first().text());
    const href = card.find("a.link-intern").first().attr("href");
    if (!sourceId || !title || !description || !href) {
      throw new Error(`Experimenta event ${index + 1} is missing required data`);
    }

    const occurrenceUrl = new URL(href, baseUrl);
    if (!isExperimentaHostname(occurrenceUrl.hostname)) throw new Error(`Experimenta event ${sourceId} links to an unexpected host`);
    const sourceUrl = getCanonicalSourceUrl(href, baseUrl);
    const groups = parseGroups(card.attr("data-groups"));
    const schedule = parseSchedule(occurrenceUrl, cleanText(card.text()), card.attr("data-date-start"));
    discoveredOccurrenceCount += 1;

    const existingEvent = events.get(sourceId);
    if (existingEvent) {
      if (existingEvent.title !== title || existingEvent.sourceUrl !== sourceUrl) {
        throw new Error(`Experimenta event ${sourceId} has inconsistent repeated data`);
      }
      existingEvent.groups = [...new Set([...existingEvent.groups, ...groups])];
      const scheduleKey = `${schedule.date}|${schedule.startTime}|${schedule.endTime}`;
      if (!existingEvent.schedule.some((entry) => `${entry.date}|${entry.startTime}|${entry.endTime}` === scheduleKey)) {
        existingEvent.schedule.push(schedule);
      }
      return;
    }

    events.set(sourceId, { sourceId, sourceUrl, title, description, groups, schedule: [schedule] });
  });

  if (events.size === 0) throw new Error("Experimenta calendar contained no events");

  const offers: Offer[] = [];
  let childFacingCount = 0;
  for (const event of events.values()) {
    const searchableText = `${event.title} ${event.description.slice(0, 500)}`;
    if (!isChildFacing(event.groups, searchableText)) continue;
    childFacingCount += 1;
    const topics = classifyOfferTopics(searchableText);
    if (topics.length === 0) continue;

    event.schedule.sort((left, right) => {
      const dateDifference = left.date.localeCompare(right.date);
      return dateDifference || String(left.startTime).localeCompare(String(right.startTime));
    });
    const offer: Offer = {
      schemaVersion: 1,
      id: `experimenta:${event.sourceId}`,
      provider: "experimenta",
      sourceId: event.sourceId,
      sourceUrl: event.sourceUrl,
      title: event.title,
      description: event.description,
      topics,
      age: parseAge(event.groups, searchableText),
      schedule: event.schedule,
      location: { name: "experimenta Heilbronn" },
      price: { type: "unknown", currency: "EUR" },
      availability: "unknown",
      importedAt,
    };
    validateOffer(offer);
    offers.push(offer);
  }

  return {
    offers,
    discoveredEventCount: events.size,
    discoveredOccurrenceCount,
    childFacingCount,
    skippedCount: events.size - offers.length,
  };
}

export async function fetchExperimentaHtml(url: string) {
  const requestedUrl = new URL(url);
  if (!isExperimentaHostname(requestedUrl.hostname)) throw new Error("Refusing to fetch a non-experimenta host");

  const response = await fetch(requestedUrl, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "accept-language": "de-DE,de;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Experimenta request failed with HTTP ${response.status}`);
  if (!isExperimentaHostname(new URL(response.url).hostname)) {
    throw new Error("Experimenta request redirected to an unexpected host");
  }
  return response.text();
}

export async function importExperimentaSource(
  source: ExperimentaSourceConfig,
  options: { fetchHtml?: FetchHtml; importedAt?: string } = {},
) {
  const fetchHtml = options.fetchHtml ?? fetchExperimentaHtml;
  const importedAt = options.importedAt ?? new Date().toISOString();
  const html = await fetchHtml(source.url);
  return parseExperimentaCalendarPage(html, source.url, importedAt);
}
