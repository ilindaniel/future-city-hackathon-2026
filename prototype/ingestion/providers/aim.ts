import { load } from "cheerio";
import {
  classifyOfferTopics,
  type Offer,
  type OfferAvailability,
  type OfferTopic,
  validateOffer,
} from "../offers.ts";
import type { AimSourceConfig } from "../source-config.ts";

export type AimListItem = {
  sourceId: string;
  sourceUrl: string;
  title: string;
  audiences: string[];
};

export type FetchHtml = (url: string) => Promise<string>;

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isAimHostname(hostname: string) {
  return hostname === "aim-akademie.org" || hostname === "www.aim-akademie.org";
}

function parseGermanDate(value: string) {
  const match = value.match(/\b(\d{2})\.(\d{2})\.(\d{4})\b/);
  if (!match) throw new Error(`Could not parse aim date: ${value}`);
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function parseTimeRange(value: string) {
  const match = value.match(/\b(\d{1,2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}))?/);
  return {
    startTime: match?.[1]?.padStart(5, "0") ?? null,
    endTime: match?.[2]?.padStart(5, "0") ?? null,
  };
}

function parseAge(value: string) {
  const normalizedValue = value.replace(/[–—]/g, "-");
  const range = normalizedValue.match(/\b(?:von\s+)?(\d{1,2})\s*(?:-|bis)\s*(\d{1,2})\s*Jahr/i);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };

  const minimum = normalizedValue.match(/\bab\s+(\d{1,2})\s*Jahr/i);
  if (minimum) return { min: Number(minimum[1]), max: null };

  return { min: null, max: null };
}

function isChildFacingListItem(item: AimListItem) {
  const age = parseAge(item.title);
  const hasChildAudience = item.audiences.some((audience) =>
    /schüler|jugendliche|^kinder(?:\b|\s|\/)/i.test(audience),
  );
  return hasChildAudience || age.min !== null || age.max !== null;
}

function parseAvailability(value: string): OfferAvailability {
  const normalizedValue = value.toLocaleLowerCase("de-DE");
  if (/warteliste|nachrück/.test(normalizedValue)) return "waitlist";
  if (/ausgebucht|belegt|nicht buchbar|geschlossen/.test(normalizedValue)) return "full";
  if (/\bfrei\b/.test(normalizedValue)) return "available";
  return "unknown";
}

function parsePrice(value: string): Offer["price"] {
  const normalizedValue = value.toLocaleLowerCase("de-DE");
  if (/\bkeine\b|kostenfrei|gebührenfrei|\b0[,.]00\b/.test(normalizedValue)) {
    return { type: "free", currency: "EUR" };
  }

  const amount = normalizedValue.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})|\d+(?:[.,]\d{2}))\s*(?:€|eur)/i);
  if (!amount) return { type: "unknown", currency: "EUR" };

  const rawAmount = amount[1];
  if (!rawAmount) return { type: "unknown", currency: "EUR" };
  const numericAmount = Number(rawAmount.replace(/\./g, "").replace(",", "."));
  return { type: "paid", amountCents: Math.round(numericAmount * 100), currency: "EUR" };
}

export function parseAimListPage(html: string, baseUrl: string): AimListItem[] {
  const $ = load(html);
  const items: AimListItem[] = [];

  $(".kufer-content-kursliste-kurs").each((index, element) => {
    const course = $(element);
    const link = course.find("h2 a").first();
    const sourceId = cleanText(course.find(".kufer-content-kursliste-knr").first().text());
    const href = link.attr("href");
    const title = cleanText(link.text());
    const audiences = course
      .find(".text-small .badge")
      .map((_, audience) => cleanText($(audience).text()))
      .get()
      .filter(Boolean);

    if (!sourceId || !href || !title) throw new Error(`Aim list item ${index + 1} is missing required data`);

    const sourceUrl = new URL(href, baseUrl);
    if (!isAimHostname(sourceUrl.hostname)) throw new Error(`Aim course ${sourceId} links to an unexpected host`);
    items.push({ sourceId, sourceUrl: sourceUrl.toString(), title, audiences });
  });

  if (items.length === 0) throw new Error("Aim list page contained no courses");

  const sourceIds = new Set<string>();
  for (const item of items) {
    if (sourceIds.has(item.sourceId)) throw new Error(`Aim list contains duplicate course ${item.sourceId}`);
    sourceIds.add(item.sourceId);
  }

  return items;
}

export function parseAimDetailPage(
  html: string,
  sourceUrl: string,
  importedAt: string,
  defaultTopics: readonly OfferTopic[],
): Offer | null {
  const $ = load(html);
  const titleElement = $("h1.h2").first();
  const title = cleanText(titleElement.text());
  const sourceId = cleanText($(".kufer-content-kursdetails-knr").last().text()).replace(/^Kursnummer:\s*/i, "");
  const description = titleElement
    .parent()
    .children("p")
    .map((_, element) => cleanText($(element).text()))
    .get()
    .filter(Boolean)
    .join(" ");

  if (!title || !sourceId || !description) throw new Error("Aim detail page is missing title, course number, or description");

  const schedule: Offer["schedule"] = [];
  $("#coursesDateTable tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;

    const dateText = cleanText(cells.eq(0).text());
    const timeText = cleanText(cells.eq(1).text());
    const { startTime, endTime } = parseTimeRange(timeText);
    schedule.push({
      date: parseGermanDate(dateText),
      startTime,
      endTime,
      timezone: "Europe/Berlin",
    });
  });

  const location = cleanText($("#coursesDateTable tbody tr").first().find("td").eq(2).text());
  const availability = parseAvailability(cleanText($(".kufer-content-kursdetails-status .kw_ampel").first().text()));
  const costHeading = $("h3, h5")
    .filter((_, element) => /^Kosten:?$/i.test(cleanText($(element).text())))
    .first();
  const costText = cleanText(costHeading.parent().text()).replace(/^Kosten:\s*/i, "");
  const age = parseAge(`${title} ${description}`);
  const topics = classifyOfferTopics(`${title} ${description.slice(0, 500)}`, defaultTopics);
  if (topics.length === 0) return null;

  const offer: Offer = {
    schemaVersion: 1,
    id: `aim:${sourceId}`,
    provider: "aim",
    sourceId,
    sourceUrl,
    title,
    description,
    topics,
    age,
    schedule,
    location: { name: location },
    price: parsePrice(costText),
    availability,
    importedAt,
  };

  validateOffer(offer);
  return offer;
}

export async function fetchAimHtml(url: string) {
  const requestedUrl = new URL(url);
  if (!isAimHostname(requestedUrl.hostname)) throw new Error("Refusing to fetch a non-aim host");

  const response = await fetch(requestedUrl, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "accept-language": "de-DE,de;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) throw new Error(`Aim request failed with HTTP ${response.status}`);
  if (!isAimHostname(new URL(response.url).hostname)) throw new Error("Aim request redirected to an unexpected host");
  return response.text();
}

export async function importAimSource(
  source: AimSourceConfig,
  options: {
    fetchHtml?: FetchHtml;
    importedAt?: string;
  } = {},
) {
  const result = await importAimSources([source], options);
  return result.offers;
}

export async function importAimSources(
  sources: readonly AimSourceConfig[],
  options: {
    fetchHtml?: FetchHtml;
    importedAt?: string;
  } = {},
) {
  const fetchHtml = options.fetchHtml ?? fetchAimHtml;
  const shouldLogProgress = options.fetchHtml === undefined;
  const importedAt = options.importedAt ?? new Date().toISOString();
  const mergedItems = new Map<
    string,
    AimListItem & {
      defaultTopics: Set<OfferTopic>;
    }
  >();

  for (const source of sources) {
    const listHtml = await fetchHtml(source.url);
    const listItems = parseAimListPage(listHtml, source.url);
    for (const item of listItems) {
      const existingItem = mergedItems.get(item.sourceId);
      if (existingItem) {
        if (source.defaultTopic) existingItem.defaultTopics.add(source.defaultTopic);
        existingItem.audiences = [...new Set([...existingItem.audiences, ...item.audiences])];
        continue;
      }

      mergedItems.set(item.sourceId, {
        ...item,
        defaultTopics: new Set(source.defaultTopic ? [source.defaultTopic] : []),
      });
    }
  }

  const offers: Offer[] = [];
  const items = [...mergedItems.values()].filter(isChildFacingListItem);
  const batchSize = 3;

  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    const batchOffers = await Promise.all(
      batch.map(async (item) => {
        try {
          const detailHtml = await fetchHtml(item.sourceUrl);
          const offer = parseAimDetailPage(detailHtml, item.sourceUrl, importedAt, [...item.defaultTopics]);
          if (!offer) return null;
          if (offer.sourceId !== item.sourceId) {
            throw new Error(`Detail course number does not match list item ${item.sourceId}`);
          }
          return offer;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown course import failure";
          throw new Error(`Aim course ${item.sourceId} failed: ${message}`);
        }
      }),
    );

    offers.push(...batchOffers.filter((offer): offer is Offer => offer !== null));
    const processedCount = Math.min(index + batchSize, items.length);
    if (shouldLogProgress && (processedCount % 15 === 0 || processedCount === items.length)) {
      console.log(`[offers] processed ${processedCount}/${items.length} unique aim courses`);
    }
  }

  return {
    offers,
    discoveredCount: mergedItems.size,
    childFacingCount: items.length,
    skippedCount: mergedItems.size - offers.length,
  };
}
