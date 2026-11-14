import useSWR from "swr";

export type OfferTopic = "ai" | "robotics" | "coding" | "gaming" | "making";

export type Offer = {
  id: string;
  provider: "aim" | "experimenta" | "hdf" | "ipai";
  sourceId: string;
  sourceUrl: string;
  title: string;
  description: string;
  topics: OfferTopic[];
  age: { min: number | null; max: number | null };
  schedule: Array<{
    date: string;
    startTime: string | null;
    endTime: string | null;
    timezone: "Europe/Berlin";
  }>;
  location: { name: string };
  price: { type: "free" | "paid" | "unknown"; amountCents?: number; currency: "EUR" };
  availability: "available" | "waitlist" | "full" | "unknown";
};

type OfferCatalog = {
  schemaVersion: 1;
  generatedAt: string;
  offers: Offer[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOffer(value: unknown): value is Offer {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.provider === "string" &&
    typeof value.sourceId === "string" &&
    typeof value.sourceUrl === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    Array.isArray(value.topics) &&
    isRecord(value.age) &&
    Array.isArray(value.schedule) &&
    value.schedule.length > 0 &&
    isRecord(value.location) &&
    isRecord(value.price) &&
    typeof value.availability === "string"
  );
}

async function fetchOfferCatalog(url: string) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Angebote konnten nicht geladen werden: HTTP ${response.status}`);

  const value = (await response.json()) as unknown;
  if (!isRecord(value) || value.schemaVersion !== 1 || typeof value.generatedAt !== "string" || !Array.isArray(value.offers)) {
    throw new Error("Der Angebotskatalog hat ein unbekanntes Format.");
  }
  if (!value.offers.every(isOffer)) throw new Error("Der Angebotskatalog enthält ungültige Angebote.");
  return value as OfferCatalog;
}

export function useOffers() {
  return useSWR("/data/offers.json", fetchOfferCatalog, {
    errorRetryCount: 2,
    revalidateOnFocus: false,
  });
}
