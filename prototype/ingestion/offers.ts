export const OFFER_TOPICS = ["ai", "robotics", "coding", "gaming", "making"] as const;
export const OFFER_PROVIDERS = ["aim", "experimenta", "hdf", "ipai"] as const;
export const OFFER_AVAILABILITIES = ["available", "waitlist", "full", "unknown"] as const;

export type OfferTopic = (typeof OFFER_TOPICS)[number];
export type OfferProvider = (typeof OFFER_PROVIDERS)[number];
export type OfferAvailability = (typeof OFFER_AVAILABILITIES)[number];

export type OfferScheduleEntry = {
  date: string;
  startTime: string | null;
  endTime: string | null;
  timezone: "Europe/Berlin";
};

export type Offer = {
  schemaVersion: 1;
  id: string;
  provider: OfferProvider;
  sourceId: string;
  sourceUrl: string;
  title: string;
  description: string;
  topics: OfferTopic[];
  age: {
    min: number | null;
    max: number | null;
  };
  schedule: OfferScheduleEntry[];
  location: {
    name: string;
  };
  price: {
    type: "free" | "paid" | "unknown";
    amountCents?: number;
    currency: "EUR";
  };
  availability: OfferAvailability;
  importedAt: string;
};

export type OfferCatalog = {
  schemaVersion: 1;
  generatedAt: string;
  offers: Offer[];
};

const BERLIN_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function classifyOfferTopics(value: string, defaultTopics: readonly OfferTopic[] = []) {
  const normalizedValue = value.toLocaleLowerCase("de-DE");
  const topics = new Set<OfferTopic>();

  if (/\bki\b|künstliche intelligenz|machine learning|chatgpt/.test(normalizedValue)) topics.add("ai");
  if (/robot|first lego league/.test(normalizedValue)) topics.add("robotics");
  if (
    /programmier|coding|python|scratch|mikrocontroller|microcontroller|datenbank|webseite|\bweb-?app\b|(?:entwickel|programmier)\w*\s+(?:eine\s+)?app|\bcode\b/.test(
      normalizedValue,
    )
  ) {
    topics.add("coding");
  }
  if (/gaming|game design|spieleentwicklung|minecraft|roblox/.test(normalizedValue)) topics.add("gaming");
  if (/maker faire|solarmobil/.test(normalizedValue)) topics.add("making");
  for (const defaultTopic of defaultTopics) topics.add(defaultTopic);

  return [...topics];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNullableAge(value: unknown): value is number | null {
  return value === null || (Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 99);
}

function isIsoTimestamp(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

export function validateOffer(value: unknown): asserts value is Offer {
  if (!isRecord(value)) throw new Error("Offer must be an object");
  if (value.schemaVersion !== 1) throw new Error("Offer schemaVersion must be 1");
  if (!isNonEmptyString(value.id)) throw new Error("Offer id is required");
  if (!OFFER_PROVIDERS.includes(value.provider as OfferProvider)) throw new Error("Offer provider is invalid");
  if (!isNonEmptyString(value.sourceId)) throw new Error("Offer sourceId is required");
  if (value.id !== `${value.provider}:${value.sourceId}`) throw new Error("Offer id must match provider and sourceId");
  if (!isNonEmptyString(value.sourceUrl)) throw new Error("Offer sourceUrl is required");

  const sourceUrl = new URL(value.sourceUrl);
  if (sourceUrl.protocol !== "https:") throw new Error("Offer sourceUrl must use HTTPS");
  if (!isNonEmptyString(value.title)) throw new Error("Offer title is required");
  if (!isNonEmptyString(value.description)) throw new Error("Offer description is required");

  if (!Array.isArray(value.topics) || value.topics.length === 0) throw new Error("Offer topics are required");
  if (value.topics.some((topic) => !OFFER_TOPICS.includes(topic as OfferTopic))) {
    throw new Error("Offer contains an invalid topic");
  }

  if (!isRecord(value.age) || !isNullableAge(value.age.min) || !isNullableAge(value.age.max)) {
    throw new Error("Offer age is invalid");
  }
  if (value.age.min !== null && value.age.max !== null && value.age.min > value.age.max) {
    throw new Error("Offer minimum age must not exceed maximum age");
  }

  if (!Array.isArray(value.schedule) || value.schedule.length === 0) {
    throw new Error("Offer schedule is required");
  }
  for (const entry of value.schedule) {
    if (!isRecord(entry)) throw new Error("Offer schedule entry must be an object");
    if (!isNonEmptyString(entry.date) || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
      throw new Error("Offer schedule date is invalid");
    }
    if (entry.startTime !== null && (typeof entry.startTime !== "string" || !/^\d{2}:\d{2}$/.test(entry.startTime))) {
      throw new Error("Offer schedule startTime is invalid");
    }
    if (entry.endTime !== null && (typeof entry.endTime !== "string" || !/^\d{2}:\d{2}$/.test(entry.endTime))) {
      throw new Error("Offer schedule endTime is invalid");
    }
    if (entry.timezone !== "Europe/Berlin") throw new Error("Offer schedule timezone is invalid");
  }

  if (!isRecord(value.location) || !isNonEmptyString(value.location.name)) {
    throw new Error("Offer location is required");
  }
  if (!isRecord(value.price) || !["free", "paid", "unknown"].includes(String(value.price.type))) {
    throw new Error("Offer price is invalid");
  }
  if (value.price.currency !== "EUR") throw new Error("Offer price currency must be EUR");
  if (value.price.type === "paid" && (!Number.isInteger(value.price.amountCents) || Number(value.price.amountCents) <= 0)) {
    throw new Error("Paid offers require a positive amountCents value");
  }
  if (!OFFER_AVAILABILITIES.includes(value.availability as OfferAvailability)) {
    throw new Error("Offer availability is invalid");
  }
  if (!isIsoTimestamp(value.importedAt)) throw new Error("Offer importedAt is invalid");
}

export function assertUniqueOffers(offers: readonly Offer[]) {
  const seenIds = new Set<string>();
  for (const offer of offers) {
    validateOffer(offer);
    if (seenIds.has(offer.id)) throw new Error(`Duplicate offer id: ${offer.id}`);
    seenIds.add(offer.id);
  }
}

function getBerlinDateTime(now: Date) {
  const parts = BERLIN_DATE_TIME_FORMATTER.formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

export function filterUpcomingOffers(offers: readonly Offer[], now: Date) {
  if (Number.isNaN(now.getTime())) throw new Error("Upcoming offer filter requires a valid date");
  const current = getBerlinDateTime(now);
  let removedOfferCount = 0;
  let removedScheduleCount = 0;

  const upcomingOffers = offers.flatMap((offer) => {
    const schedule = offer.schedule.filter((entry) => {
      if (entry.date > current.date) return true;
      if (entry.date < current.date) return false;
      const lastKnownTime = entry.endTime ?? entry.startTime;
      return lastKnownTime === null || lastKnownTime >= current.time;
    });
    removedScheduleCount += offer.schedule.length - schedule.length;
    if (schedule.length === 0) {
      removedOfferCount += 1;
      return [];
    }
    return [{ ...offer, schedule }];
  });

  return { offers: upcomingOffers, removedOfferCount, removedScheduleCount };
}
