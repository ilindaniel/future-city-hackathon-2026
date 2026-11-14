const MAX_SHARED_OFFERS = 12;

export function normalizeSharedOfferIds(offerIds: Iterable<string>) {
  const normalizedOfferIds: string[] = [];
  const seenOfferIds = new Set<string>();

  for (const offerId of offerIds) {
    const normalizedOfferId = offerId.trim();
    if (!normalizedOfferId || normalizedOfferId.length > 160 || seenOfferIds.has(normalizedOfferId)) continue;
    normalizedOfferIds.push(normalizedOfferId);
    seenOfferIds.add(normalizedOfferId);
    if (normalizedOfferIds.length === MAX_SHARED_OFFERS) break;
  }

  return normalizedOfferIds;
}

export function buildParentOfferUrl(origin: string, offerIds: Iterable<string>) {
  const url = new URL("/parent", origin);
  for (const offerId of normalizeSharedOfferIds(offerIds)) url.searchParams.append("offer", offerId);
  return url.toString();
}

export function parseParentOfferIds(search: string) {
  return normalizeSharedOfferIds(new URLSearchParams(search).getAll("offer"));
}
