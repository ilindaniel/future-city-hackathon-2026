import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertUniqueOffers, filterUpcomingOffers, type Offer, type OfferCatalog } from "./offers.ts";
import { importAimSources } from "./providers/aim.ts";
import { importExperimentaSource } from "./providers/experimenta.ts";
import { importHdfSources } from "./providers/hdf.ts";
import { loadSourceConfig } from "./source-config.ts";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(projectRoot, "config", "offer-sources.json");
const outputPath = path.join(projectRoot, "public", "data", "offers.json");

function getFirstScheduleDate(offer: Offer) {
  const firstScheduleEntry = offer.schedule[0];
  if (!firstScheduleEntry) throw new Error(`Offer ${offer.id} has no schedule`);
  return firstScheduleEntry.date;
}

async function main() {
  const generatedAt = new Date().toISOString();
  const config = await loadSourceConfig(configPath);
  const enabledSources = config.sources.filter((source) => source.enabled);
  if (enabledSources.length === 0) throw new Error("No offer sources are enabled");

  const offers: Offer[] = [];
  const aimSources = enabledSources.filter((source) => source.provider === "aim");
  if (aimSources.length > 0) {
    console.log(`[offers] importing ${aimSources.length} aim sources`);
    const aimResult = await importAimSources(aimSources, { importedAt: generatedAt });
    offers.push(...aimResult.offers);
    console.log(
      `[offers] found ${aimResult.discoveredCount} unique aim courses, ${aimResult.childFacingCount} child-facing courses, and excluded ${aimResult.skippedCount} unrelated courses`,
    );
  }

  const experimentaSources = enabledSources.filter((source) => source.provider === "experimenta");
  for (const source of experimentaSources) {
    console.log(`[offers] importing experimenta calendar ${source.id}`);
    const experimentaResult = await importExperimentaSource(source, { importedAt: generatedAt });
    offers.push(...experimentaResult.offers);
    console.log(
      `[offers] found ${experimentaResult.discoveredEventCount} unique experimenta events across ${experimentaResult.discoveredOccurrenceCount} calendar entries, ${experimentaResult.childFacingCount} child-facing events, and excluded ${experimentaResult.skippedCount} unrelated events`,
    );
  }

  const hdfSources = enabledSources.filter((source) => source.provider === "hdf");
  if (hdfSources.length > 0) {
    console.log(`[offers] importing ${hdfSources.length} Haus der Familie feeds`);
    const hdfResult = await importHdfSources(hdfSources, { importedAt: generatedAt });
    offers.push(...hdfResult.offers);
    console.log(
      `[offers] found ${hdfResult.discoveredCount} Haus der Familie course entries, ${hdfResult.childFacingCount} child-facing entries, excluded ${hdfResult.skippedCount} unrelated entries, and merged ${hdfResult.duplicateCount} duplicate offers`,
    );
  }

  const upcomingResult = filterUpcomingOffers(offers, new Date(generatedAt));
  console.log(
    `[offers] removed ${upcomingResult.removedScheduleCount} past dates and ${upcomingResult.removedOfferCount} offers with no upcoming dates`,
  );
  assertUniqueOffers(upcomingResult.offers);
  upcomingResult.offers.sort((left, right) => {
    const dateDifference = getFirstScheduleDate(left).localeCompare(getFirstScheduleDate(right));
    return dateDifference || left.title.localeCompare(right.title, "de-DE");
  });

  const catalog: OfferCatalog = {
    schemaVersion: 1,
    generatedAt,
    offers: upcomingResult.offers,
  };
  const temporaryPath = `${outputPath}.tmp`;

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  await rename(temporaryPath, outputPath);
  console.log(`[offers] wrote ${upcomingResult.offers.length} offers to public/data/offers.json`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown import failure";
  console.error(`[offers] import failed: ${message}`);
  process.exitCode = 1;
});
