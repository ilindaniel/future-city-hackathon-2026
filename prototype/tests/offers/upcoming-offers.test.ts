import assert from "node:assert/strict";
import test from "node:test";
import { classifyOfferTopics, filterUpcomingOffers, type Offer } from "../../ingestion/offers.ts";

const baseOffer: Offer = {
  schemaVersion: 1,
  id: "aim:example",
  provider: "aim",
  sourceId: "example",
  sourceUrl: "https://www.aim-akademie.org/example",
  title: "Example course",
  description: "Example description",
  topics: ["coding"],
  age: { min: 8, max: 12 },
  schedule: [],
  location: { name: "Heilbronn" },
  price: { type: "free", currency: "EUR" },
  availability: "available",
  importedAt: "2026-11-13T20:00:00.000Z",
};

test("keeps AI, robotics, and making as separate topics", () => {
  assert.deepEqual(classifyOfferTopics("Künstliche Intelligenz verstehen"), ["ai"]);
  assert.deepEqual(classifyOfferTopics("Roboter programmieren"), ["robotics", "coding"]);
  assert.deepEqual(classifyOfferTopics("First Lego League Explore"), ["robotics"]);
  assert.deepEqual(classifyOfferTopics("Maker Faire und Solarmobilbauwettbewerb"), ["making"]);
});

test("removes past dates and keeps future dates on a recurring offer", () => {
  const offer: Offer = {
    ...baseOffer,
    schedule: [
      { date: "2026-11-12", startTime: "10:00", endTime: "12:00", timezone: "Europe/Berlin" },
      { date: "2026-11-13", startTime: "18:00", endTime: "20:00", timezone: "Europe/Berlin" },
      { date: "2026-11-14", startTime: "10:00", endTime: "12:00", timezone: "Europe/Berlin" },
    ],
  };

  const result = filterUpcomingOffers([offer], new Date("2026-11-13T16:00:00.000Z"));

  assert.equal(result.removedScheduleCount, 1);
  assert.equal(result.removedOfferCount, 0);
  assert.deepEqual(result.offers[0]?.schedule, offer.schedule.slice(1));
  assert.equal(offer.schedule.length, 3);
});

test("removes an offer after its final event has finished in Berlin", () => {
  const offer: Offer = {
    ...baseOffer,
    schedule: [{ date: "2026-11-13", startTime: "15:00", endTime: "17:00", timezone: "Europe/Berlin" }],
  };

  const result = filterUpcomingOffers([offer], new Date("2026-11-13T17:00:00.000Z"));

  assert.equal(result.offers.length, 0);
  assert.equal(result.removedScheduleCount, 1);
  assert.equal(result.removedOfferCount, 1);
});

test("keeps an untimed event for the full current day", () => {
  const offer: Offer = {
    ...baseOffer,
    schedule: [{ date: "2026-11-13", startTime: null, endTime: null, timezone: "Europe/Berlin" }],
  };

  const result = filterUpcomingOffers([offer], new Date("2026-11-13T22:30:00.000Z"));

  assert.equal(result.offers.length, 1);
  assert.equal(result.removedScheduleCount, 0);
});
