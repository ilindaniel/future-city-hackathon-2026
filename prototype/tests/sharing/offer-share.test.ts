import assert from "node:assert/strict";
import test from "node:test";
import {
  buildParentOfferUrl,
  normalizeSharedOfferIds,
  parseParentOfferIds,
} from "../../src/features/sharing/offer-share.ts";

test("buildParentOfferUrl encodes selected offer IDs", () => {
  const url = new URL(buildParentOfferUrl("https://bobby.heilbronn.app", ["aim:robotics", "hdf/kids 1"]));

  assert.equal(url.pathname, "/parent");
  assert.deepEqual(url.searchParams.getAll("offer"), ["aim:robotics", "hdf/kids 1"]);
});

test("parseParentOfferIds removes empty and duplicate IDs", () => {
  assert.deepEqual(parseParentOfferIds("?offer=aim-1&offer=&offer=aim-1&offer=hdf-2"), ["aim-1", "hdf-2"]);
});

test("normalizeSharedOfferIds limits untrusted URLs", () => {
  const offerIds = Array.from({ length: 20 }, (_, index) => `offer-${index}`);

  assert.equal(normalizeSharedOfferIds(offerIds).length, 12);
  assert.deepEqual(normalizeSharedOfferIds([" valid ", "x".repeat(161)]), ["valid"]);
});
