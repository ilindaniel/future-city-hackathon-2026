import type { Offer } from "./use-offers";

export type VoiceSearchTopic = "ai" | "robotics" | "coding" | "gaming" | "making" | "puzzles" | "all";

export type OfferSearchParameters = {
  topic: VoiceSearchTopic;
  age?: number;
};

const BERLIN_CLOCK = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Europe/Berlin",
});

const AVAILABILITY_ORDER: Record<Offer["availability"], number> = {
  available: 0,
  unknown: 1,
  waitlist: 2,
  full: 3,
};

function getBerlinNow(now: Date) {
  const parts = new Map(BERLIN_CLOCK.formatToParts(now).map((part) => [part.type, part.value]));
  return {
    date: `${parts.get("year")}-${parts.get("month")}-${parts.get("day")}`,
    time: `${parts.get("hour")}:${parts.get("minute")}`,
  };
}

export function getNextOfferSchedule(offer: Offer, now = new Date()) {
  const berlinNow = getBerlinNow(now);
  return offer.schedule.find((schedule) => {
    if (schedule.date > berlinNow.date) return true;
    if (schedule.date < berlinNow.date) return false;
    return schedule.startTime === null || schedule.startTime >= berlinNow.time;
  });
}

function matchesTopic(offer: Offer, topic: VoiceSearchTopic) {
  if (topic === "all") return true;
  if (topic !== "puzzles") return offer.topics.includes(topic);
  const text = `${offer.title} ${offer.description}`.toLocaleLowerCase("de-DE");
  return /rätsel|aufgabe|problem|logisch|diagramm|daten|detektiv/.test(text);
}

function matchesAge(offer: Offer, age: number | undefined) {
  if (age === undefined) return true;
  if (offer.age.min !== null && age < offer.age.min) return false;
  if (offer.age.max !== null && age > offer.age.max) return false;
  return true;
}

export function findRecommendedOffers(
  offers: Offer[],
  parameters: OfferSearchParameters,
  now = new Date(),
) {
  return offers
    .filter((offer) => offer.availability !== "full")
    .filter((offer) => getNextOfferSchedule(offer, now) !== undefined)
    .filter((offer) => matchesTopic(offer, parameters.topic))
    .filter((offer) => matchesAge(offer, parameters.age))
    .sort((left, right) => {
      const availabilityDifference =
        AVAILABILITY_ORDER[left.availability] - AVAILABILITY_ORDER[right.availability];
      if (availabilityDifference !== 0) return availabilityDifference;

      const leftSchedule = getNextOfferSchedule(left, now);
      const rightSchedule = getNextOfferSchedule(right, now);
      const scheduleDifference = `${leftSchedule?.date}T${leftSchedule?.startTime ?? "00:00"}`.localeCompare(
        `${rightSchedule?.date}T${rightSchedule?.startTime ?? "00:00"}`,
      );
      if (scheduleDifference !== 0) return scheduleDifference;
      return left.title.localeCompare(right.title, "de-DE");
    })
    .slice(0, 3);
}

export function serializeOfferRecommendations(offers: Offer[], now = new Date()) {
  return JSON.stringify({
    count: offers.length,
    offers: offers.map((offer) => {
      const schedule = getNextOfferSchedule(offer, now);
      return {
        id: offer.id,
        title: offer.title,
        provider: offer.provider,
        date: schedule?.date,
        startTime: schedule?.startTime,
        location: offer.location.name,
        ageMin: offer.age.min,
        ageMax: offer.age.max,
        priceType: offer.price.type,
        amountCents: offer.price.amountCents,
        availability: offer.availability,
        sourceUrl: offer.sourceUrl,
      };
    }),
  });
}
