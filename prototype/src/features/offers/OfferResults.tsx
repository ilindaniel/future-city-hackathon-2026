import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  CalendarBlankIcon,
  HeartIcon,
  MapPinIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef } from "react";
import type { InterestId } from "../../App";
import { getNextOfferSchedule } from "./offer-search";
import { type Offer, useOffers } from "./use-offers";

type OfferResultsProps = {
  emptyMessage?: string;
  interest: InterestId | "all" | "voice";
  offerIds?: string[];
  heading?: string;
  isEmbedded?: boolean;
  onBack?: () => void;
  onOfferOpen?: (offer: Offer) => void;
  onToggleOffer?: (offer: Offer) => void;
  searchQuery?: string;
  selectedOfferIds?: ReadonlySet<string>;
  variant?: "child" | "parent";
};

type OfferTone = "robotics" | "ai" | "coding" | "gaming" | "puzzles";

type OfferVisual = {
  label: string;
  tone: OfferTone;
};

const INTEREST_COPY: Record<
  InterestId | "all" | "voice",
  { heading: string; empty: string }
> = {
  ai: { heading: "KI entdecken", empty: "Gerade gibt es kein passendes KI-Angebot." },
  coding: {
    heading: "Programmieren entdecken",
    empty: "Gerade gibt es kein passendes Programmier-Angebot.",
  },
  robots: {
    heading: "Roboter entdecken",
    empty: "Gerade gibt es kein passendes Roboter-Angebot.",
  },
  games: { heading: "Spiele entdecken", empty: "Gerade gibt es kein passendes Spiele-Angebot." },
  building: { heading: "Ideen bauen", empty: "Gerade gibt es kein passendes Bau-Angebot." },
  puzzles: {
    heading: "Kniffliges entdecken",
    empty: "Gerade gibt es kein passendes Rätsel-Angebot.",
  },
  all: { heading: "Alle Angebote", empty: "Gerade sind keine Angebote verfügbar." },
  voice: {
    heading: "Bobbys Vorschläge",
    empty: "Bobby hat gerade kein passendes Angebot gefunden.",
  },
};

const PROVIDER_LABELS: Record<Offer["provider"], string> = {
  aim: "aim",
  experimenta: "experimenta",
  hdf: "Haus der Familie",
  ipai: "IPAI",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

function matchesInterest(offer: Offer, interest: InterestId | "all" | "voice") {
  if (interest === "all" || interest === "voice") return true;
  const text = `${offer.title} ${offer.description}`.toLocaleLowerCase("de-DE");
  if (interest === "ai") return offer.topics.includes("ai");
  if (interest === "coding") return offer.topics.includes("coding");
  if (interest === "robots") return offer.topics.includes("robotics") || /robot/.test(text);
  if (interest === "games") return offer.topics.includes("gaming");
  if (interest === "building") return offer.topics.includes("making");
  return /rätsel|aufgabe|problem|logisch|diagramm|daten/.test(text);
}

function matchesSearch(offer: Offer, searchQuery: string) {
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("de-DE");
  if (!normalizedQuery) return true;
  return `${offer.title} ${offer.description} ${offer.location.name} ${PROVIDER_LABELS[offer.provider]}`
    .toLocaleLowerCase("de-DE")
    .includes(normalizedQuery);
}

function formatDate(offer: Offer) {
  const nextDate = getNextOfferSchedule(offer);
  if (!nextDate) return "Termin folgt";
  const date = DATE_FORMATTER.format(new Date(`${nextDate.date}T12:00:00+01:00`));
  return nextDate.startTime ? `${date}, ${nextDate.startTime} Uhr` : date;
}

function formatAge(offer: Offer) {
  if (offer.age.min === null && offer.age.max === null) return null;
  if (offer.age.min !== null && offer.age.max !== null) return `${offer.age.min}-${offer.age.max} Jahre`;
  if (offer.age.min !== null) return `Ab ${offer.age.min} Jahren`;
  return `Bis ${offer.age.max} Jahre`;
}

function formatPrice(offer: Offer) {
  if (offer.price.type === "free") return "Kostenlos";
  if (offer.price.type === "unknown" || offer.price.amountCents === undefined) return null;
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(offer.price.amountCents / 100);
}

function formatAvailability(offer: Offer) {
  if (offer.availability === "available") return "Plätze frei";
  if (offer.availability === "waitlist") return "Warteliste";
  if (offer.availability === "full") return "Ausgebucht";
  return null;
}

function getOfferVisual(offer: Offer): OfferVisual {
  const text = `${offer.title} ${offer.description}`.toLocaleLowerCase("de-DE");
  if (offer.topics.includes("gaming")) return { label: "Spiele", tone: "gaming" };
  if (offer.topics.includes("robotics") || /robot/.test(text)) return { label: "Robotik", tone: "robotics" };
  if (offer.topics.includes("ai")) return { label: "KI", tone: "ai" };
  if (offer.topics.includes("coding")) return { label: "Programmieren", tone: "coding" };
  if (offer.topics.includes("making")) return { label: "Bauen", tone: "coding" };
  return { label: "Knifflig", tone: "puzzles" };
}

export function OfferResults({
  emptyMessage,
  heading,
  interest,
  isEmbedded = false,
  offerIds,
  onBack,
  onOfferOpen,
  onToggleOffer,
  searchQuery = "",
  selectedOfferIds = new Set(),
  variant = "child",
}: OfferResultsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { data, error, isLoading, mutate } = useOffers();
  const interestCopy = INTEREST_COPY[interest];
  const offers = useMemo(() => {
    const currentOffers = data?.offers.filter((offer) => getNextOfferSchedule(offer) !== undefined) ?? [];
    const filteredOffers = offerIds
      ? offerIds.flatMap((id) => {
          const offer = currentOffers.find((candidate) => candidate.id === id);
          return offer ? [offer] : [];
        })
      : currentOffers.filter((offer) => matchesInterest(offer, interest));
    return filteredOffers.filter((offer) => matchesSearch(offer, searchQuery));
  }, [data, interest, offerIds, searchQuery]);

  useEffect(() => {
    if (onBack) headingRef.current?.focus();
  }, [interest, onBack]);

  useEffect(() => {
    if (!onBack) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);

  return (
    <section className={`offer-results offer-results-${variant}${isEmbedded ? " offer-results-embedded" : ""}`}>
      <div className="offer-results-header">
        {onBack && (
          <button aria-label="Zurück zur Auswahl" className="icon-button back-button" onClick={onBack} type="button">
            <ArrowLeftIcon aria-hidden="true" size={24} weight="bold" />
          </button>
        )}
        <div className="offer-results-title">
          <h1 ref={headingRef} tabIndex={onBack ? -1 : undefined}>
            {heading ?? interestCopy.heading}
          </h1>
          {!isLoading && !error && <p>{offers.length} {offers.length === 1 ? "Angebot" : "Angebote"}</p>}
        </div>
      </div>

      {isLoading && <p className="offer-message">Angebote werden geladen...</p>}

      {error && (
        <div className="offer-message offer-error" role="alert">
          <WarningCircleIcon aria-hidden="true" size={32} weight="duotone" />
          <p>Die Angebote konnten gerade nicht geladen werden.</p>
          <button className="button button-quiet" onClick={() => void mutate()} type="button">
            Erneut laden
          </button>
        </div>
      )}

      {!isLoading && !error && offers.length === 0 && <p className="offer-message">{emptyMessage ?? interestCopy.empty}</p>}

      {!isLoading && !error && offers.length > 0 && (
        <ul className="offer-list">
          {offers.map((offer) => {
            const age = formatAge(offer);
            const price = variant === "parent" ? formatPrice(offer) : null;
            const availability = formatAvailability(offer);
            const offerVisual = getOfferVisual(offer);
            const isSelected = selectedOfferIds.has(offer.id);

            return (
              <li key={offer.id}>
                <article className="offer-card" data-offer-tone={offerVisual.tone}>
                  <a
                    className="offer-link"
                    href={offer.sourceUrl}
                    onClick={() => onOfferOpen?.(offer)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="offer-content">
                      <span className="offer-title-row">
                        <strong>{offer.title}</strong>
                        <ArrowSquareOutIcon aria-hidden="true" size={22} weight="bold" />
                      </span>
                      <span className="offer-labels">
                        <span className="offer-topic-label">{offerVisual.label}</span>
                        <span className="offer-provider">{PROVIDER_LABELS[offer.provider]}</span>
                      </span>
                      <span className="offer-meta">
                        <span><CalendarBlankIcon aria-hidden="true" size={18} />{formatDate(offer)}</span>
                        <span><MapPinIcon aria-hidden="true" size={18} />{offer.location.name}</span>
                      </span>
                      <span className="offer-facts">
                        {age && <span>{age}</span>}
                        {price && <span>{price}</span>}
                        {availability && (
                          <span className="offer-availability" data-availability={offer.availability}>{availability}</span>
                        )}
                      </span>
                    </span>
                  </a>
                  {onToggleOffer && (
                    <button
                      aria-label={isSelected ? `${offer.title} nicht mehr merken` : `${offer.title} merken`}
                      aria-pressed={isSelected}
                      className="offer-like-button"
                      onClick={() => onToggleOffer(offer)}
                      type="button"
                    >
                      <HeartIcon aria-hidden="true" size={24} weight={isSelected ? "fill" : "bold"} />
                    </button>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
