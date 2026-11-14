import { classifyOfferTopics, type Offer, type OfferAvailability, type OfferScheduleEntry, validateOffer } from "../offers.ts";
import type { HdfSourceConfig } from "../source-config.ts";

const HDF_HOSTS = ["hdf-hn.de", "www.hdf-hn.de"];

export type FetchText = (url: string) => Promise<string>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(record: Record<string, unknown>, key: string, courseLabel: string) {
  const value = record[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Haus der Familie course ${courseLabel} requires ${key}`);
  }
  return value.trim();
}

function optionalString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase("de-DE")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseAge(value: string) {
  const normalizedValue = value.replace(/[–—]/g, "-");
  const range = normalizedValue.match(/\b(\d{1,2})\s*(?:-|bis)\s*(\d{1,2})\s*Jahr/i);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };
  const minimum = normalizedValue.match(/\bab\s+(\d{1,2})\s*Jahr/i);
  return { min: minimum ? Number(minimum[1]) : null, max: null };
}

function isChildFacing(course: Record<string, unknown>, text: string) {
  const categories = isRecord(course.kategorien) ? Object.values(course.kategorien) : [];
  return (
    categories.some(
      (category) => typeof category === "string" && /kindergartenkind|schulkinder|jugendliche|kinder\b/i.test(category),
    ) || /\bKinder\b|\b\d{1,2}\s*(?:-|bis)\s*\d{1,2}\s*Jahr/i.test(text)
  );
}

function parseSchedule(value: unknown, courseNumber: string) {
  if (!Array.isArray(value)) throw new Error(`Haus der Familie course ${courseNumber} requires Termine`);
  const schedule: OfferScheduleEntry[] = [];

  for (const entry of value) {
    if (!isRecord(entry)) throw new Error(`Haus der Familie course ${courseNumber} has an invalid Termin`);
    const status = optionalString(entry, "termin_status");
    if (/abgesagt|storniert|entfällt/i.test(status)) continue;
    const date = requiredString(entry, "tag", courseNumber);
    const startTime = optionalString(entry, "zeitvon").slice(0, 5) || null;
    const endTime = optionalString(entry, "zeitbis").slice(0, 5) || null;
    schedule.push({ date, startTime, endTime, timezone: "Europe/Berlin" });
  }

  const uniqueSchedule = new Map(schedule.map((entry) => [`${entry.date}|${entry.startTime}|${entry.endTime}`, entry]));
  return [...uniqueSchedule.values()].sort((left, right) => {
    const dateDifference = left.date.localeCompare(right.date);
    return dateDifference || String(left.startTime).localeCompare(String(right.startTime));
  });
}

function parsePrice(value: string): Offer["price"] {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return { type: "unknown", currency: "EUR" };
  if (amount === 0) return { type: "free", currency: "EUR" };
  return { type: "paid", amountCents: Math.round(amount * 100), currency: "EUR" };
}

function parseAvailability(value: string): OfferAvailability {
  if (value === "1" || value === "2") return "available";
  if (value === "3") return "waitlist";
  return "unknown";
}

function parseCourse(value: unknown, importedAt: string): { offer: Offer | null; isChildFacing: boolean } {
  if (!isRecord(value)) throw new Error("Haus der Familie course must be an object");
  const courseNumber = requiredString(value, "knr", "unknown");
  const title = requiredString(value, "haupttitel", courseNumber);
  const subtitle = optionalString(value, "hauptuntertitel");
  const description = optionalString(value, "web_info") || requiredString(value, "inhalt", courseNumber);
  const searchableText = `${title} ${subtitle} ${description}`;
  if (!isChildFacing(value, searchableText)) return { offer: null, isChildFacing: false };

  const topics = classifyOfferTopics(searchableText);
  const schedule = parseSchedule(value.termine, courseNumber);
  if (topics.length === 0 || schedule.length === 0) return { offer: null, isChildFacing: true };

  const offer: Offer = {
    schemaVersion: 1,
    id: `hdf:${courseNumber}`,
    provider: "hdf",
    sourceId: courseNumber,
    sourceUrl: `https://hdf-hn.de/kurs/${slugify(title)}-${courseNumber}/`,
    title,
    description,
    topics,
    age: parseAge(`${subtitle} ${description}`),
    schedule,
    location: { name: requiredString(value, "ort", courseNumber) },
    price: parsePrice(optionalString(value, "gebnorm")),
    availability: parseAvailability(optionalString(value, "status")),
    importedAt,
  };
  validateOffer(offer);
  return { offer, isChildFacing: true };
}

export function parseHdfCourseFeed(json: string, importedAt: string) {
  const parsed = JSON.parse(json) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Haus der Familie course feed must be an array");
  if (parsed.length === 0) throw new Error("Haus der Familie course feed contained no courses");

  const offers: Offer[] = [];
  const courseNumbers = new Set<string>();
  let childFacingCount = 0;
  for (const course of parsed) {
    const result = parseCourse(course, importedAt);
    if (result.isChildFacing) childFacingCount += 1;
    if (!result.offer) continue;
    if (courseNumbers.has(result.offer.sourceId)) throw new Error(`Duplicate Haus der Familie course ${result.offer.sourceId}`);
    courseNumbers.add(result.offer.sourceId);
    offers.push(result.offer);
  }

  return {
    offers,
    discoveredCount: parsed.length,
    childFacingCount,
    skippedCount: parsed.length - offers.length,
  };
}

export async function fetchHdfCourseFeed(url: string) {
  const requestedUrl = new URL(url);
  if (!HDF_HOSTS.includes(requestedUrl.hostname)) throw new Error("Refusing to fetch a non-Haus der Familie host");

  const response = await fetch(requestedUrl, {
    headers: { accept: "application/json", "accept-language": "de-DE,de;q=0.9" },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Haus der Familie request failed with HTTP ${response.status}`);
  if (!HDF_HOSTS.includes(new URL(response.url).hostname)) {
    throw new Error("Haus der Familie request redirected to an unexpected host");
  }
  return response.text();
}

export async function importHdfSource(
  source: HdfSourceConfig,
  options: { fetchText?: FetchText; importedAt?: string } = {},
) {
  const fetchText = options.fetchText ?? fetchHdfCourseFeed;
  const importedAt = options.importedAt ?? new Date().toISOString();
  return parseHdfCourseFeed(await fetchText(source.url), importedAt);
}
