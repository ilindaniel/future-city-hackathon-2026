import {
  BrainIcon,
  CheckCircleIcon,
  CodeIcon,
  GameControllerIcon,
  PuzzlePieceIcon,
  RobotIcon,
  StackIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";
import { OfferResults } from "./features/offers/OfferResults";
import { type Offer, useOffers } from "./features/offers/use-offers";
import { VoiceAnswerButton } from "./features/voice/VoiceAnswerButton";

export type InterestId = "ai" | "coding" | "games" | "robots" | "building" | "puzzles";

type Interest = {
  id: InterestId;
  label: string;
  icon: Icon;
};

type UmamiWindow = Window & {
  umami?: {
    track: (eventName: string, data?: Record<string, string>) => void;
  };
};

const INTERESTS: Interest[] = [
  { id: "ai", label: "KI", icon: BrainIcon },
  { id: "coding", label: "Programmieren", icon: CodeIcon },
  { id: "games", label: "Spiele", icon: GameControllerIcon },
  { id: "robots", label: "Roboter", icon: RobotIcon },
  { id: "building", label: "Bauen", icon: StackIcon },
  { id: "puzzles", label: "Rätseln", icon: PuzzlePieceIcon },
];

const QUESTION = "Was möchtest du entdecken?";

function trackEvent(eventName: string, data?: Record<string, string>) {
  (window as UmamiWindow).umami?.track(eventName, data);
}

export function App() {
  const [selectedInterest, setSelectedInterest] = useState<InterestId | null>(null);
  const [visibleOffers, setVisibleOffers] = useState<InterestId | "all" | "voice" | null>(null);
  const [voiceOfferIds, setVoiceOfferIds] = useState<string[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Wähle ein Thema. Sprich oder tippe deine Antwort.");
  const { data: offerCatalog } = useOffers();

  const handleInterestSelect = (interest: Interest) => {
    setSelectedInterest(interest.id);
    setVisibleOffers(interest.id);
    setStatusMessage(`${interest.label}: Hier sind passende Angebote.`);
    trackEvent("child_interest_selected", { interest: interest.id });
    trackEvent("offer_list_opened", { interest: interest.id });
  };

  const handlePrototypeNavigation = (label: string) => {
    setStatusMessage(`${label} wird im nächsten Prototyp-Schritt ergänzt.`);
    trackEvent("prototype_navigation_selected", { destination: label });
  };

  const handleAllOffers = () => {
    setSelectedInterest(null);
    setVisibleOffers("all");
    setStatusMessage("Alle Angebote werden angezeigt.");
    trackEvent("offer_list_opened", { interest: "all" });
  };

  const handleOffersBack = () => {
    setVisibleOffers(null);
    setStatusMessage("Wähle ein Thema. Sprich oder tippe deine Antwort.");
    trackEvent("offer_list_closed");
  };

  const handleOfferOpen = (offer: Offer) => {
    trackEvent("offer_opened", {
      interest: visibleOffers ?? "all",
      provider: offer.provider,
      source_id: offer.sourceId,
    });
  };

  const handleVoiceRecommendations = useCallback((offers: Offer[]) => {
    setSelectedInterest(null);
    setVoiceOfferIds(offers.map((offer) => offer.id));
    setVisibleOffers("voice");
  }, []);

  return (
    <main className="pixel-discovery">
      <div aria-hidden="true" className="pixel-scene">
        <img
          alt=""
          className="scene-layer scene-background"
          fetchPriority="high"
          src="/assets/heilbronn-pixel-background.png"
        />
        <img alt="" className="scene-layer scene-clouds" src="/assets/heilbronn-pixel-clouds.png" />
        <div className="water-shimmer" />
        <img alt="" className="scene-layer scene-grass" src="/assets/heilbronn-pixel-grass.png" />
      </div>

      <header className="pixel-header">
        <div className="pixel-brand-lockup">
          <span className="pixel-brand">Bobby</span>
          <span className="ai-disclosure">ist eine KI</span>
        </div>
        <nav aria-label="Hauptnavigation" className="pixel-nav">
          <button aria-current="page" className="nav-button nav-button-active" type="button">
            Entdecken
          </button>
          <button disabled={isVoiceActive} onClick={handleAllOffers} type="button">
            Alle Angebote
          </button>
          <button disabled={isVoiceActive} onClick={() => handlePrototypeNavigation("Für Eltern")} type="button">
            Für Eltern
          </button>
        </nav>
      </header>

      <section
        aria-label={visibleOffers ? "Angebote" : undefined}
        aria-labelledby={visibleOffers ? undefined : "discovery-question"}
        className={`pixel-panel${visibleOffers ? " pixel-panel-results" : ""}`}
      >
        {visibleOffers ? (
          <OfferResults
            interest={visibleOffers}
            offerIds={visibleOffers === "voice" ? voiceOfferIds : undefined}
            onBack={handleOffersBack}
            onOfferOpen={handleOfferOpen}
          />
        ) : (
          <>
            <h1 id="discovery-question">{QUESTION}</h1>

            {!isVoiceActive && (
              <div aria-label="Interessen" className="interest-list" role="group">
                {INTERESTS.map((interest) => {
                  const InterestIcon = interest.icon;
                  const isSelected = selectedInterest === interest.id;

                  return (
                    <button
                      aria-pressed={isSelected}
                      className="interest-button"
                      data-interest={interest.id}
                      data-umami-event="child_interest_selected"
                      data-umami-event-interest={interest.id}
                      key={interest.id}
                      onClick={() => handleInterestSelect(interest)}
                      type="button"
                    >
                      <span className="interest-icon-wrap">
                        <InterestIcon aria-hidden="true" size={44} weight="duotone" />
                        <CheckCircleIcon
                          aria-hidden="true"
                          className="selected-icon"
                          size={22}
                          weight="fill"
                        />
                      </span>
                      <span>{interest.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

          </>
        )}

        <VoiceAnswerButton
          isHidden={visibleOffers !== null && visibleOffers !== "voice"}
          offers={offerCatalog?.offers ?? []}
          onActiveChange={setIsVoiceActive}
          onRecommendations={handleVoiceRecommendations}
          onStatusMessage={setStatusMessage}
        />

        <p aria-live="polite" className="sr-only" role="status">
          {statusMessage}
        </p>
      </section>

      <div aria-hidden="true" className="mascot-stage" data-mascot>
        <div className="mascot-shadow" />
        <img
          alt=""
          className="mascot-sprite mascot-idle"
          src={isVoiceActive ? "/assets/kiko-mallard-speaking.png" : "/assets/kiko-mallard.png"}
        />
        {!isVoiceActive && (
          <img alt="" className="mascot-sprite mascot-blink" src="/assets/kiko-mallard-blink.png" />
        )}
      </div>
    </main>
  );
}
