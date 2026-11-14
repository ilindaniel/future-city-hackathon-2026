import { readFile } from "node:fs/promises";
import { OFFER_TOPICS, type OfferTopic } from "./offers.ts";

export type AimSourceConfig = {
  id: string;
  provider: "aim";
  enabled: boolean;
  url: string;
  defaultTopic: OfferTopic | null;
};

export type ExperimentaSourceConfig = {
  id: string;
  provider: "experimenta";
  enabled: boolean;
  url: string;
};

export type HdfSourceConfig = {
  id: string;
  provider: "hdf";
  enabled: boolean;
  url: string;
};

export type OfferSourceConfig = AimSourceConfig | ExperimentaSourceConfig | HdfSourceConfig;

export type SourceConfig = {
  sources: OfferSourceConfig[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAimSource(value: unknown): AimSourceConfig {
  if (!isRecord(value)) throw new Error("Source must be an object");
  if (typeof value.id !== "string" || !/^[a-z0-9-]+$/.test(value.id)) {
    throw new Error("Source id must use lowercase letters, numbers, and hyphens");
  }
  if (value.provider !== "aim") throw new Error(`Unsupported provider for source ${value.id}`);
  if (typeof value.enabled !== "boolean") throw new Error(`Source ${value.id} requires an enabled flag`);
  if (typeof value.url !== "string") throw new Error(`Source ${value.id} requires a URL`);

  const url = new URL(value.url);
  if (url.protocol !== "https:" || !["aim-akademie.org", "www.aim-akademie.org"].includes(url.hostname)) {
    throw new Error(`Source ${value.id} must use an official aim HTTPS URL`);
  }
  if (value.defaultTopic !== null && !OFFER_TOPICS.includes(value.defaultTopic as OfferTopic)) {
    throw new Error(`Source ${value.id} has an invalid default topic`);
  }

  return {
    id: value.id,
    provider: "aim",
    enabled: value.enabled,
    url: url.toString(),
    defaultTopic: value.defaultTopic as OfferTopic | null,
  };
}

function parseExperimentaSource(value: unknown): ExperimentaSourceConfig {
  if (!isRecord(value)) throw new Error("Source must be an object");
  if (typeof value.id !== "string" || !/^[a-z0-9-]+$/.test(value.id)) {
    throw new Error("Source id must use lowercase letters, numbers, and hyphens");
  }
  if (value.provider !== "experimenta") throw new Error(`Unsupported provider for source ${value.id}`);
  if (typeof value.enabled !== "boolean") throw new Error(`Source ${value.id} requires an enabled flag`);
  if (typeof value.url !== "string") throw new Error(`Source ${value.id} requires a URL`);

  const url = new URL(value.url);
  if (url.protocol !== "https:" || !["experimenta.science", "www.experimenta.science"].includes(url.hostname)) {
    throw new Error(`Source ${value.id} must use an official experimenta HTTPS URL`);
  }

  return {
    id: value.id,
    provider: "experimenta",
    enabled: value.enabled,
    url: url.toString(),
  };
}

function parseHdfSource(value: unknown): HdfSourceConfig {
  if (!isRecord(value)) throw new Error("Source must be an object");
  if (typeof value.id !== "string" || !/^[a-z0-9-]+$/.test(value.id)) {
    throw new Error("Source id must use lowercase letters, numbers, and hyphens");
  }
  if (value.provider !== "hdf") throw new Error(`Unsupported provider for source ${value.id}`);
  if (typeof value.enabled !== "boolean") throw new Error(`Source ${value.id} requires an enabled flag`);
  if (typeof value.url !== "string") throw new Error(`Source ${value.id} requires a URL`);

  const url = new URL(value.url);
  if (url.protocol !== "https:" || !["hdf-hn.de", "www.hdf-hn.de"].includes(url.hostname)) {
    throw new Error(`Source ${value.id} must use an official Haus der Familie HTTPS URL`);
  }

  return { id: value.id, provider: "hdf", enabled: value.enabled, url: url.toString() };
}

export function parseSourceConfig(value: unknown): SourceConfig {
  if (!isRecord(value) || !Array.isArray(value.sources)) throw new Error("Source config requires a sources array");

  const sources = value.sources.map((source) => {
    if (!isRecord(source)) throw new Error("Source must be an object");
    if (source.provider === "aim") return parseAimSource(source);
    if (source.provider === "experimenta") return parseExperimentaSource(source);
    if (source.provider === "hdf") return parseHdfSource(source);
    throw new Error(`Unsupported provider for source ${String(source.id ?? "unknown")}`);
  });
  const sourceIds = new Set<string>();
  for (const source of sources) {
    if (sourceIds.has(source.id)) throw new Error(`Duplicate source id: ${source.id}`);
    sourceIds.add(source.id);
  }

  return { sources };
}

export async function loadSourceConfig(filePath: string) {
  const rawConfig = await readFile(filePath, "utf8");
  return parseSourceConfig(JSON.parse(rawConfig) as unknown);
}
