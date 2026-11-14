import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  BrainIcon,
  CalendarBlankIcon,
  CodeIcon,
  GameControllerIcon,
  MapPinIcon,
  PuzzlePieceIcon,
  RobotIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef } from "react";
import type { InterestId } from "../../App";
import { getNextOfferSchedule } from "./offer-search";
import { type Offer, useOffers } from "./use-offers";

type OfferResultsProps = {
  interest: InterestId | "all" | "voice";
  offerIds?: string[];
  onBack: () => void;
  onOfferOpen: (offer: Offer) => void;
};

const INTEREST_COPY: Record<InterestId | "all" | "voice", { heading: string; empty: string; icon: Icon; tone: OfferTone }> = {
  ai: {
    heading: "KI entdecken",
    empty: "Gerade gibt es keine passenden KI-Angebote.",
    icon: BrainIcon,
    tone: "ai",
  },
  coding: {
    heading: "Programmieren entdecken",
    empty: "Gerade gibt es keine passenden Programmier-Angebote.",
    icon: CodeIcon,
    tone: "coding",
  },
  robots: {
    heading: "Roboter entdecken",
    empty: "Gerade gibt es keine passenden Roboter-Angebote.",
    icon: RobotIcon,
    tone: "robotics",
  },
  games: {
    heading: "Spiele entdecken",
    empty: "Gerade gibt es keine passenden Spiele-Angebote.",
    icon: GameControllerIcon,
    tone: "gaming",
  },
  building: {
    heading: "Ideen bauen",
    empty: "Gerade gibt es keine passenden Bau-Angebote.",
    icon: CodeIcon,
    tone: "coding",
  },
  puzzles: {
    heading: "Kniffliges entdecken",
    empty: "Gerade gibt es keine passenden Rätsel-Angebote.",
    icon: PuzzlePieceIcon,
    tone: "puzzles",
  },
  all: {
    heading: "Alle Angebote",
    empty: "Gerade sind keine Angebote verfügbar.",
    icon: BrainIcon,
    tone: "ai",
  },
  voice: {
    heading: "Bobbys Vorschläge",
    empty: "Bobby hat gerade keine passenden Angebote gefunden.",
    icon: BrainIcon,
    tone: "ai",
  },
};

type OfferTone = "robotics" | "ai" | "coding" | "gaming" | "puzzles";

type OfferVisual = {
  icon: Icon;
  label: string;
  tone: OfferTone;
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
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    offer.price.amountCents / 100,
  );
}

function formatAvailability(offer: Offer) {
  if (offer.availability === "available") return "Plätze frei";
  if (offer.availability === "waitlist") return "Warteliste";
  if (offer.availability === "full") return "Ausgebucht";
  return null;
}

function getOfferVisual(offer: Offer): OfferVisual {
  const text = `${offer.title} ${offer.description}`.toLocaleLowerCase("de-DE");
  if (offer.topics.includes("gaming")) return { icon: GameControllerIcon, label: "Spiele", tone: "gaming" };
  if (offer.topics.includes("robotics") || /robot/.test(text)) return { icon: RobotIcon, label: "Robotik", tone: "robotics" };
  if (offer.topics.includes("ai")) return { icon: BrainIcon, label: "KI", tone: "ai" };
  if (offer.topics.includes("coding")) return { icon: CodeIcon, label: "Programmieren", tone: "coding" };
  if (offer.topics.includes("making")) return { icon: CodeIcon, label: "Bauen", tone: "coding" };
  return { icon: PuzzlePieceIcon, label: "Knifflig", tone: "puzzles" };
}

export function OfferResults({ interest, offerIds, onBack, onOfferOpen }: OfferResultsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { data, error, isLoading, mutate } = useOffers();
  const interestCopy = INTEREST_COPY[interest];
  const InterestIcon = interestCopy.icon;
  const offers = useMemo(() => {
    const currentOffers = data?.offers.filter((offer) => getNextOfferSchedule(offer) !== undefined) ?? [];
    if (offerIds) {
      const offersById = new Map(currentOffers.map((offer) => [offer.id, offer]));
      return offerIds.flatMap((id) => {
        const offer = offersById.get(id);
        return offer ? [offer] : [];
      });
    }
    return currentOffers.filter((offer) => matchesInterest(offer, interest));
  }, [data, interest, offerIds]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [interest]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);

  return (
    <div className="offer-results">
      <div className="offer-results-header">
        <button aria-label="Zurück zur Auswahl" className="back-button" onClick={onBack} type="button">
          <ArrowLeftIcon aria-hidden="true" size={24} weight="bold" />
        </button>
        <span aria-hidden="true" className="offer-results-icon" data-offer-tone={interestCopy.tone}>
          <InterestIcon size={32} weight="duotone" />
        </span>
        <div className="offer-results-title">
          <h1 ref={headingRef} tabIndex={-1}>
            {interestCopy.heading}
          </h1>
          {!isLoading && !error && <p>{offers.length} Angebote</p>}
        </div>
      </div>

      {isLoading && <p className="offer-message">Angebote werden geladen...</p>}

      {error && (
        <div className="offer-message offer-error" role="alert">
          <WarningCircleIcon aria-hidden="true" size={32} weight="duotone" />
          <p>Die Angebote konnten gerade nicht geladen werden.</p>
          <button onClick={() => void mutate()} type="button">
            Erneut laden
          </button>
        </div>
      )}

      {!isLoading && !error && offers.length === 0 && <p className="offer-message">{interestCopy.empty}</p>}

      {!isLoading && !error && offers.length > 0 && (
        <ul className="offer-list">
          {offers.map((offer) => {
            const age = formatAge(offer);
            const price = formatPrice(offer);
            const availability = formatAvailability(offer);
            const offerVisual = getOfferVisual(offer);
            const OfferIcon = offerVisual.icon;
            return (
              <li key={offer.id}>
                <a
                  className="offer-link"
                  data-offer-tone={offerVisual.tone}
                  href={offer.sourceUrl}
                  onClick={() => onOfferOpen(offer)}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span aria-hidden="true" className="offer-topic-icon">
                    <OfferIcon size={28} weight="duotone" />
                  </span>
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
                      <span>
                        <CalendarBlankIcon aria-hidden="true" size={18} />
                        {formatDate(offer)}
                      </span>
                      <span>
                        <MapPinIcon aria-hidden="true" size={18} />
                        {offer.location.name}
                      </span>
                    </span>
                    <span className="offer-facts">
                      {age && <span>{age}</span>}
                      {price && <span>{price}</span>}
                      {availability && (
                        <span className="offer-availability" data-availability={offer.availability}>
                          {availability}
                        </span>
                      )}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
