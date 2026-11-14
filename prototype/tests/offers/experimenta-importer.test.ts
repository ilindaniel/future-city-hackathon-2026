import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateOffer } from "../../ingestion/offers.ts";
import { importExperimentaSource, parseExperimentaCalendarPage } from "../../ingestion/providers/experimenta.ts";
import { parseSourceConfig, type ExperimentaSourceConfig } from "../../ingestion/source-config.ts";

const fixturePath = fileURLToPath(new URL("../fixtures/experimenta-calendar.html", import.meta.url));
const importedAt = "2026-11-13T20:00:00.000Z";
const source: ExperimentaSourceConfig = {
  id: "experimenta-events",
  provider: "experimenta",
  enabled: true,
  url: "https://www.experimenta.science/besuchen/veranstaltungen/",
};

test("merges recurring experimenta calendar entries into one offer", async () => {
  const html = await readFile(fixturePath, "utf8");
  const result = parseExperimentaCalendarPage(html, source.url, importedAt);

  assert.equal(result.discoveredOccurrenceCount, 8);
  assert.equal(result.discoveredEventCount, 6);
  assert.equal(result.childFacingCount, 5);
  assert.equal(result.offers.length, 4);
  const offer = result.offers[0];
  assert.ok(offer);
  assert.equal(offer.id, "experimenta:74891");
  assert.equal(offer.sourceUrl, "https://www.experimenta.science/besuchen/veranstaltungskalender/meine-freundin-roxy/");
  assert.deepEqual(offer.topics, ["robotics"]);
  assert.deepEqual(offer.age, { min: 6, max: null });
  assert.deepEqual(offer.schedule, [
    { date: "2026-11-14", startTime: "11:30", endTime: "12:05", timezone: "Europe/Berlin" },
    { date: "2026-11-17", startTime: "09:30", endTime: "10:05", timezone: "Europe/Berlin" },
  ]);
  validateOffer(offer);
  assert.deepEqual(
    result.offers.slice(1).map(({ id, topics }) => ({ id, topics })),
    [
      { id: "experimenta:38214", topics: ["robotics"] },
      { id: "experimenta:28151", topics: ["making"] },
      { id: "experimenta:75251", topics: ["making"] },
    ],
  );
});

test("imports experimenta through an injected HTTP reader", async () => {
  const html = await readFile(fixturePath, "utf8");
  const result = await importExperimentaSource(source, {
    importedAt,
    fetchHtml: async (url) => {
      assert.equal(url, source.url);
      return html;
    },
  });

  assert.equal(result.offers.length, 4);
  assert.equal(result.offers[0]?.title, "Meine Freundin Roxy");
});

test("rejects non-official experimenta source hosts", () => {
  assert.throws(
    () =>
      parseSourceConfig({
        sources: [
          {
            id: "experimenta-events",
            provider: "experimenta",
            enabled: true,
            url: "https://example.com/events",
          },
        ],
      }),
    /official experimenta HTTPS URL/,
  );
});
