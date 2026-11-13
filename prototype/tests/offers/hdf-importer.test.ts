import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateOffer } from "../../ingestion/offers.ts";
import { importHdfSource, parseHdfCourseFeed } from "../../ingestion/providers/hdf.ts";
import { parseSourceConfig, type HdfSourceConfig } from "../../ingestion/source-config.ts";

const fixturePath = fileURLToPath(new URL("../fixtures/hdf-courses.json", import.meta.url));
const importedAt = "2026-11-13T20:00:00.000Z";
const source: HdfSourceConfig = {
  id: "hdf-digital-family-workshop",
  provider: "hdf",
  enabled: true,
  url: "https://hdf-hn.de/kufer-api.php?endpoint=kurse",
};

test("normalizes and filters the Haus der Familie course feed", async () => {
  const json = await readFile(fixturePath, "utf8");
  const result = parseHdfCourseFeed(json, importedAt);

  assert.equal(result.discoveredCount, 3);
  assert.equal(result.childFacingCount, 2);
  assert.equal(result.offers.length, 1);
  const offer = result.offers[0];
  assert.ok(offer);
  assert.equal(offer.id, "hdf:261H207006");
  assert.equal(
    offer.sourceUrl,
    "https://hdf-hn.de/kurs/maerchenhaft-mit-scratchjunior-eine-geschichte-programmieren-das-mutige-tier-261H207006/",
  );
  assert.deepEqual(offer.topics, ["coding"]);
  assert.deepEqual(offer.age, { min: 4, max: 7 });
  assert.deepEqual(offer.price, { type: "paid", amountCents: 1000, currency: "EUR" });
  assert.equal(offer.availability, "waitlist");
  assert.deepEqual(offer.schedule, [
    { date: "2026-12-05", startTime: "09:30", endTime: "11:00", timezone: "Europe/Berlin" },
  ]);
  assert.equal(JSON.stringify(offer).includes("private@example.com"), false);
  validateOffer(offer);
});

test("imports Haus der Familie through an injected HTTP reader", async () => {
  const json = await readFile(fixturePath, "utf8");
  const result = await importHdfSource(source, {
    importedAt,
    fetchText: async (url) => {
      assert.equal(url, source.url);
      return json;
    },
  });

  assert.equal(result.offers.length, 1);
});

test("rejects non-official Haus der Familie source hosts", () => {
  assert.throws(
    () =>
      parseSourceConfig({
        sources: [
          {
            id: "hdf-courses",
            provider: "hdf",
            enabled: true,
            url: "https://example.com/courses.json",
          },
        ],
      }),
    /official Haus der Familie HTTPS URL/,
  );
});
