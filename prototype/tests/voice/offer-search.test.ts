import assert from "node:assert/strict";
import test from "node:test";
import {
  findRecommendedOffers,
  getNextOfferSchedule,
  serializeOfferRecommendations,
} from "../../src/features/offers/offer-search.ts";
import type { Offer, OfferTopic } from "../../src/features/offers/use-offers.ts";

const NOW = new Date("2026-11-14T11:00:00.000Z");

function makeOffer({
  id,
  topic = "robotics",
  date = "2026-11-14",
  startTime = "13:00",
  ageMin = 6,
  ageMax = 12,
  availability = "available",
}: {
  id: string;
  topic?: OfferTopic;
  date?: string;
  startTime?: string;
  ageMin?: number | null;
  ageMax?: number | null;
  availability?: Offer["availability"];
}): Offer {
  return {
    id,
    provider: "aim",
    sourceId: id,
    sourceUrl: `https://example.test/${id}`,
    title: `Angebot ${id}`,
    description: "Ein passendes Angebot für Kinder.",
    topics: [topic],
    age: { min: ageMin, max: ageMax },
    schedule: [{ date, startTime, endTime: null, timezone: "Europe/Berlin" }],
    location: { name: "Heilbronn" },
    price: { type: "free", currency: "EUR" },
    availability,
  };
}

test("ignores an offer whose start time already passed today", () => {
  const pastOffer = makeOffer({ id: "past", startTime: "11:30" });
  const futureOffer = makeOffer({ id: "future", startTime: "12:30" });

  assert.equal(getNextOfferSchedule(pastOffer, NOW), undefined);
  assert.equal(getNextOfferSchedule(futureOffer, NOW)?.startTime, "12:30");
});

test("matches topic and age without returning full offers", () => {
  const offers = [
    makeOffer({ id: "match", topic: "robotics", ageMin: 8, ageMax: 12 }),
    makeOffer({ id: "too-old", topic: "robotics", ageMin: 13, ageMax: 16 }),
    makeOffer({ id: "wrong-topic", topic: "gaming" }),
    makeOffer({ id: "full", topic: "robotics", availability: "full" }),
  ];

  assert.deepEqual(
    findRecommendedOffers(offers, { topic: "robotics", age: 10 }, NOW).map((offer) => offer.id),
    ["match"],
  );
});

test("returns at most three available offers before waitlist offers", () => {
  const offers = [
    makeOffer({ id: "waitlist", startTime: "12:10", availability: "waitlist" }),
    makeOffer({ id: "available-2", startTime: "14:00" }),
    makeOffer({ id: "available-1", startTime: "13:00" }),
    makeOffer({ id: "unknown", startTime: "12:30", availability: "unknown" }),
    makeOffer({ id: "available-3", startTime: "15:00" }),
  ];

  assert.deepEqual(
    findRecommendedOffers(offers, { topic: "robotics" }, NOW).map((offer) => offer.id),
    ["available-1", "available-2", "available-3"],
  );
});

test("serializes only the small public result needed by Bobby", () => {
  const offer = makeOffer({ id: "result" });
  const value = JSON.parse(serializeOfferRecommendations([offer], NOW)) as {
    count: number;
    offers: Array<Record<string, unknown>>;
  };

  assert.equal(value.count, 1);
  assert.equal(value.offers[0]?.title, offer.title);
  assert.equal("description" in (value.offers[0] ?? {}), false);
  assert.equal("schedule" in (value.offers[0] ?? {}), false);
});
