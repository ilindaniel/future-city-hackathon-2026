import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { assertUniqueOffers, validateOffer } from "../../ingestion/offers.ts";
import {
  importAimSource,
  importAimSources,
  parseAimDetailPage,
  parseAimListPage,
} from "../../ingestion/providers/aim.ts";
import { parseSourceConfig, type AimSourceConfig } from "../../ingestion/source-config.ts";

const listFixturePath = fileURLToPath(new URL("../fixtures/aim-list.html", import.meta.url));
const detailFixturePath = fileURLToPath(new URL("../fixtures/aim-detail.html", import.meta.url));
const importedAt = "2026-11-13T20:00:00.000Z";
const source: AimSourceConfig = {
  id: "aim-coding",
  provider: "aim",
  enabled: true,
  url: "https://www.aim-akademie.org/kurse?topic=coding",
  defaultTopic: "coding",
};

test("parses stable aim course identifiers and links", async () => {
  const html = await readFile(listFixturePath, "utf8");
  assert.deepEqual(parseAimListPage(html, source.url), [
    {
      sourceId: "271420SG",
      sourceUrl: "https://www.aim-akademie.org/kurse/kurs/Talking-Plants/271420SG",
      title: "Talking Plants - Programmiere deine Pflanze (12-16 Jahre)",
      audiences: ["Schüler/in"],
    },
  ]);
});

test("normalizes an aim detail page into the shared offer schema", async () => {
  const html = await readFile(detailFixturePath, "utf8");
  const offer = parseAimDetailPage(
    html,
    "https://www.aim-akademie.org/kurse/kurs/Talking-Plants/271420SG",
    importedAt,
    ["coding"],
  );

  assert.ok(offer);
  assert.deepEqual(offer.age, { min: 12, max: 16 });
  assert.deepEqual(offer.topics, ["coding"]);
  assert.deepEqual(offer.price, { type: "free", currency: "EUR" });
  assert.equal(offer.availability, "available");
  assert.equal(offer.location.name, "Bildungscampus");
  assert.deepEqual(offer.schedule, [
    { date: "2027-03-10", startTime: "16:00", endTime: "19:15", timezone: "Europe/Berlin" },
    { date: "2027-03-11", startTime: "16:00", endTime: "18:00", timezone: "Europe/Berlin" },
  ]);
  validateOffer(offer);
});

test("imports an aim source through an injected HTTP reader", async () => {
  const [listHtml, detailHtml] = await Promise.all([
    readFile(listFixturePath, "utf8"),
    readFile(detailFixturePath, "utf8"),
  ]);

  const offers = await importAimSource(source, {
    importedAt,
    fetchHtml: async (url) => (url === source.url ? listHtml : detailHtml),
  });

  assert.equal(offers.length, 1);
  assert.equal(offers[0]?.id, "aim:271420SG");
});

test("rejects duplicate offer identifiers", async () => {
  const html = await readFile(detailFixturePath, "utf8");
  const offer = parseAimDetailPage(
    html,
    "https://www.aim-akademie.org/kurse/kurs/Talking-Plants/271420SG",
    importedAt,
    ["coding"],
  );

  assert.ok(offer);
  assert.throws(() => assertUniqueOffers([offer, offer]), /Duplicate offer id/);
});

test("deduplicates overlapping aim sources before fetching details", async () => {
  const [listHtml, detailHtml] = await Promise.all([
    readFile(listFixturePath, "utf8"),
    readFile(detailFixturePath, "utf8"),
  ]);
  const secondSource: AimSourceConfig = {
    ...source,
    id: "aim-junior-academy",
    url: "https://www.aim-akademie.org/kurse?topic=junior",
    defaultTopic: null,
  };
  let detailFetchCount = 0;

  const result = await importAimSources([source, secondSource], {
    importedAt,
    fetchHtml: async (url) => {
      if (url === source.url || url === secondSource.url) return listHtml;
      detailFetchCount += 1;
      return detailHtml;
    },
  });

  assert.equal(result.discoveredCount, 1);
  assert.equal(result.childFacingCount, 1);
  assert.equal(result.offers.length, 1);
  assert.equal(detailFetchCount, 1);
});

test("excludes adult-only aim courses before fetching details", async () => {
  const listHtml = (await readFile(listFixturePath, "utf8"))
    .replace(" (12-16 Jahre)", "")
    .replace("Schüler/in", "Pädagogische Fachkraft in Kindertagespflege");
  const adultSource: AimSourceConfig = {
    ...source,
    id: "aim-digital-education",
    defaultTopic: null,
  };
  let detailFetchCount = 0;

  const result = await importAimSources([adultSource], {
    importedAt,
    fetchHtml: async (url) => {
      if (url === adultSource.url) return listHtml;
      detailFetchCount += 1;
      throw new Error("Adult course details must not be fetched");
    },
  });

  assert.equal(result.discoveredCount, 1);
  assert.equal(result.childFacingCount, 0);
  assert.equal(result.offers.length, 0);
  assert.equal(detailFetchCount, 0);
});

test("excludes broad-source courses outside the selected topics", async () => {
  const html = (await readFile(detailFixturePath, "utf8"))
    .replaceAll("Talking Plants - Programmiere deine Pflanze, bis sie spricht (12-16 Jahre)", "Aquarellmalerei (12-16 Jahre)")
    .replace("Was wäre, wenn deine Pflanze plötzlich Nachrichten schicken könnte?", "Male mit Wasserfarben auf Papier.")
    .replace("Du programmierst Sensoren und lernst Coding mit echten Pflanzen.", "Du lernst Farben und Pinsel kennen.");

  const offer = parseAimDetailPage(
    html,
    "https://www.aim-akademie.org/kurse/kurs/Aquarellmalerei/271420SG",
    importedAt,
    [],
  );

  assert.equal(offer, null);
});

test("ignores topic keywords found only in a late lecturer biography", async () => {
  const biography = `${"Mathematik und Spieltheorie. ".repeat(24)}Die Dozentin arbeitet außerdem mit KI-Verfahren.`;
  const html = (await readFile(detailFixturePath, "utf8"))
    .replaceAll("Talking Plants - Programmiere deine Pflanze, bis sie spricht (12-16 Jahre)", "Kinderuni: Wie Mathematik die Welt verbessert (8-12 Jahre)")
    .replace("Was wäre, wenn deine Pflanze plötzlich Nachrichten schicken könnte?", "Entdecke Mathematik in Spielen und Entscheidungen.")
    .replace("Du programmierst Sensoren und lernst Coding mit echten Pflanzen.", biography);

  const offer = parseAimDetailPage(
    html,
    "https://www.aim-akademie.org/kurse/kurs/Kinderuni/271420SG",
    importedAt,
    [],
  );

  assert.equal(offer, null);
});

test("rejects non-official aim source hosts", () => {
  assert.throws(
    () =>
      parseSourceConfig({
        sources: [
          {
            id: "aim-coding",
            provider: "aim",
            enabled: true,
            url: "https://example.com/courses",
            defaultTopic: "coding",
          },
        ],
      }),
    /official aim HTTPS URL/,
  );
});
