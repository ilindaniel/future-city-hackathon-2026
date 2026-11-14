import {
  BrainIcon,
  CheckCircleIcon,
  CodeIcon,
  GameControllerIcon,
  HouseIcon,
  ListBulletsIcon,
  MagnifyingGlassIcon,
  PuzzlePieceIcon,
  RobotIcon,
  StackIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { OfferResults } from "./features/offers/OfferResults";
import { type Offer, useOffers } from "./features/offers/use-offers";
import { ShareOfferDialog } from "./features/sharing/ShareOfferDialog";
import { buildParentOfferUrl, parseParentOfferIds } from "./features/sharing/offer-share";
import { VoiceAnswerButton } from "./features/voice/VoiceAnswerButton";

export type InterestId = "ai" | "coding" | "games" | "robots" | "building" | "puzzles";

type Interest = {
  id: InterestId;
  label: string;
  shortLabel?: string;
  icon: Icon;
};

type AppScreen = "child" | "entry" | "parent";

type UmamiWindow = Window & {
  umami?: {
    track: (eventName: string, data?: Record<string, string>) => void;
  };
};

const INTERESTS: Interest[] = [
  { id: "ai", label: "KI", icon: BrainIcon },
  { id: "coding", label: "Programmieren", shortLabel: "Coding", icon: CodeIcon },
  { id: "games", label: "Spiele", icon: GameControllerIcon },
  { id: "robots", label: "Roboter", icon: RobotIcon },
  { id: "building", label: "Bauen", icon: StackIcon },
  { id: "puzzles", label: "Rätseln", icon: PuzzlePieceIcon },
];

function getScreenFromLocation(): AppScreen {
  if (window.location.pathname.startsWith("/parent")) return "parent";
  if (window.location.pathname.startsWith("/child")) return "child";
  return "entry";
}

function trackEvent(eventName: string, data?: Record<string, string>) {
  (window as UmamiWindow).umami?.track(eventName, data);
}

function PixelScene() {
  return (
    <div aria-hidden="true" className="pixel-scene">
      <img alt="" className="scene-layer scene-background" fetchPriority="high" src="/assets/heilbronn-pixel-background.png" />
      <img alt="" className="scene-layer scene-clouds" src="/assets/heilbronn-pixel-clouds.png" />
      <div className="water-shimmer" />
      <img alt="" className="scene-layer scene-grass" src="/assets/heilbronn-pixel-grass.png" />
    </div>
  );
}

function Brand() {
  return (
    <div className="wordmark glass">
      <span>Bobby</span>
      <small>eine KI-Ente</small>
    </div>
  );
}

export function App() {
  const [screen, setScreen] = useState<AppScreen>(getScreenFromLocation);
  const [selectedInterest, setSelectedInterest] = useState<InterestId | null>(null);
  const [visibleOffers, setVisibleOffers] = useState<InterestId | "all" | "voice" | null>(null);
  const [voiceOfferIds, setVoiceOfferIds] = useState<string[]>([]);
  const [selectedOfferIds, setSelectedOfferIds] = useState(() => new Set(parseParentOfferIds(window.location.search)));
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [parentSearchQuery, setParentSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState("Wähle ein Thema. Sprich oder tippe deine Antwort.");
  const { data: offerCatalog } = useOffers();

  const shareUrl = useMemo(
    () => buildParentOfferUrl(window.location.origin, selectedOfferIds),
    [selectedOfferIds],
  );

  useEffect(() => {
    const handlePopState = () => {
      setScreen(getScreenFromLocation());
      setSelectedOfferIds(new Set(parseParentOfferIds(window.location.search)));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = (nextScreen: AppScreen, url?: string) => {
    const nextUrl = url ?? (nextScreen === "entry" ? "/" : `/${nextScreen}`);
    window.history.pushState({}, "", nextUrl);
    setScreen(nextScreen);
    if (nextScreen === "child") setVisibleOffers(null);
    if (nextScreen === "parent") setSelectedOfferIds(new Set(parseParentOfferIds(new URL(nextUrl, window.location.origin).search)));
    window.scrollTo({ top: 0 });
    trackEvent("screen_opened", { screen: nextScreen });
  };

  const handleInterestSelect = (interest: Interest) => {
    setSelectedInterest(interest.id);
    setVisibleOffers(interest.id);
    setStatusMessage(`${interest.label}: Hier sind passende Angebote.`);
    trackEvent("child_interest_selected", { interest: interest.id });
    trackEvent("offer_list_opened", { interest: interest.id });
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

  const handleToggleOffer = (offer: Offer) => {
    setSelectedOfferIds((currentOfferIds) => {
      const nextOfferIds = new Set(currentOfferIds);
      const isSelected = nextOfferIds.has(offer.id);
      if (isSelected) nextOfferIds.delete(offer.id);
      else if (nextOfferIds.size < 12) nextOfferIds.add(offer.id);
      else {
        setStatusMessage("Du kannst bis zu 12 Angebote merken.");
        return currentOfferIds;
      }
      trackEvent(isSelected ? "offer_unliked" : "offer_liked", { provider: offer.provider, source_id: offer.sourceId });
      return nextOfferIds;
    });
  };

  const handleVoiceRecommendations = useCallback((offers: Offer[]) => {
    setSelectedInterest(null);
    setVoiceOfferIds(offers.map((offer) => offer.id));
    setVisibleOffers("voice");
  }, []);

  const handleOpenParentView = () => {
    const parentUrl = buildParentOfferUrl(window.location.origin, selectedOfferIds);
    handleNavigate("parent", new URL(parentUrl).pathname + new URL(parentUrl).search);
  };

  const handleParentAction = () => {
    if (selectedOfferIds.size > 0) {
      setIsShareOpen(true);
      trackEvent("parent_share_opened", { offer_count: String(selectedOfferIds.size) });
      return;
    }
    handleOpenParentView();
  };

  if (screen === "entry") {
    return (
      <main className="bobby-app entry-screen">
        <PixelScene />
        <header className="topbar"><Brand /></header>
        <section className="entry-panel glass" aria-labelledby="entry-title">
          <h1 id="entry-title">Wer bist du?</h1>
          <div className="role-grid">
            <article className="role-card">
              <div className="role-picture role-picture-child">
                <img alt="" src="/assets/kiko-mallard.png" />
              </div>
              <button className="button button-block" onClick={() => handleNavigate("child")} type="button">
                Ich bin ein Kind
              </button>
            </article>
            <article className="role-card">
              <div className="role-picture role-picture-adult">
                <HouseIcon aria-hidden="true" size={88} weight="duotone" />
              </div>
              <button className="button button-bobby button-block" onClick={() => handleNavigate("parent")} type="button">
                Ich bin erwachsen
              </button>
            </article>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "parent") {
    const sharedOfferIds = parseParentOfferIds(window.location.search);
    return (
      <main className="bobby-app parent-screen">
        <header className="topbar parent-topbar">
          <Brand />
          <button className="icon-button" onClick={() => handleNavigate("child")} type="button">Zu Bobby</button>
        </header>
        <div className="parent-layout">
          <section className="parent-section">
            <OfferResults
              emptyMessage="Noch keine gemerkten Angebote. Ihr Kind kann Angebote bei Bobby mit einem Herz markieren."
              heading="Das gefällt Ihrem Kind"
              interest="all"
              isEmbedded
              offerIds={sharedOfferIds}
              onOfferOpen={handleOfferOpen}
              variant="parent"
            />
            <p className="parent-privacy-note">Dieser Link enthält nur gemerkte Angebote. Bobby überträgt kein Gespräch und keine Tonaufnahme.</p>
          </section>
          <section className="parent-section">
            <div className="parent-section-heading">
              <div>
                <h2>Alle Angebote</h2>
                <p>Finden Sie passende Angebote in Heilbronn.</p>
              </div>
              <label className="search-field">
                <span>Angebote suchen</span>
                <span className="search-input-wrap">
                  <MagnifyingGlassIcon aria-hidden="true" size={20} />
                  <input
                    autoComplete="off"
                    onChange={(event) => setParentSearchQuery(event.target.value)}
                    placeholder="Zum Beispiel Roboter"
                    type="search"
                    value={parentSearchQuery}
                  />
                </span>
              </label>
            </div>
            <OfferResults
              emptyMessage="Dazu gibt es gerade kein Angebot. Versuchen Sie einen anderen Suchbegriff."
              heading="Angebote"
              interest="all"
              isEmbedded
              onOfferOpen={handleOfferOpen}
              searchQuery={parentSearchQuery}
              variant="parent"
            />
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="bobby-app child-screen">
      <PixelScene />
      <header className="topbar">
        <Brand />
        <nav aria-label="Hauptnavigation" className="topbar-actions">
          <button aria-label="Alle Angebote" className="icon-button" disabled={isVoiceActive} onClick={handleAllOffers} type="button">
            <ListBulletsIcon aria-hidden="true" className="mobile-nav-icon" size={22} weight="bold" />
            <span className="nav-label">Alle Angebote</span>
          </button>
          <button
            aria-label={selectedOfferIds.size > 0 ? `Für Eltern, ${selectedOfferIds.size} gemerkt` : "Für Eltern"}
            className="icon-button"
            disabled={isVoiceActive && selectedOfferIds.size === 0}
            onClick={handleParentAction}
            type="button"
          >
            <UsersThreeIcon aria-hidden="true" className="mobile-nav-icon" size={22} weight="bold" />
            <span className="nav-label">Für Eltern{selectedOfferIds.size > 0 ? ` (${selectedOfferIds.size})` : ""}</span>
            {selectedOfferIds.size > 0 && <span className="nav-count">{selectedOfferIds.size}</span>}
          </button>
        </nav>
      </header>

      <section
        aria-label={visibleOffers ? "Angebote" : undefined}
        aria-labelledby={!visibleOffers && !isVoiceActive ? "discovery-question" : undefined}
        className={visibleOffers ? "browse-panel child-workspace-results glass" : "child-cluster"}
      >
        {visibleOffers ? (
          <OfferResults
            interest={visibleOffers}
            offerIds={visibleOffers === "voice" ? voiceOfferIds : undefined}
            onBack={handleOffersBack}
            onOfferOpen={handleOfferOpen}
            onToggleOffer={handleToggleOffer}
            selectedOfferIds={selectedOfferIds}
          />
        ) : !isVoiceActive ? (
            <div className="discovery-card glass">
              <h1 id="discovery-question">Was möchtest du entdecken?</h1>
              <div aria-label="Interessen" className="interest-list" role="group">
                {INTERESTS.map((interest) => {
                  const InterestIcon = interest.icon;
                  const isSelected = selectedInterest === interest.id;
                  return (
                    <button
                      aria-label={interest.label}
                      aria-pressed={isSelected}
                      className="interest-button"
                      data-interest={interest.id}
                      key={interest.id}
                      onClick={() => handleInterestSelect(interest)}
                      type="button"
                    >
                      <span className="interest-icon-wrap">
                        <InterestIcon aria-hidden="true" size={36} weight="duotone" />
                        <CheckCircleIcon aria-hidden="true" className="selected-icon" size={20} weight="fill" />
                      </span>
                      <span className="interest-label">{interest.label}</span>
                      {interest.shortLabel && <span className="interest-short-label">{interest.shortLabel}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
        ) : null}

        <div
          aria-hidden="true"
          className="mascot-stage"
          hidden={visibleOffers !== null && visibleOffers !== "voice"}
        >
          <div className="mascot-shadow" />
          <img alt="" className="mascot-sprite mascot-idle" src={isVoiceActive ? "/assets/kiko-mallard-speaking.png" : "/assets/kiko-mallard.png"} />
          {!isVoiceActive && <img alt="" className="mascot-sprite mascot-blink" src="/assets/kiko-mallard-blink.png" />}
        </div>

        <VoiceAnswerButton
          isCompact={visibleOffers === "voice"}
          isHidden={visibleOffers !== null && visibleOffers !== "voice"}
          offers={offerCatalog?.offers ?? []}
          onActiveChange={setIsVoiceActive}
          onRecommendations={handleVoiceRecommendations}
          onStatusMessage={setStatusMessage}
        />
      </section>

      <ShareOfferDialog isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} shareUrl={shareUrl} />
      <p aria-live="polite" className="sr-only" role="status">{statusMessage}</p>
    </main>
  );
}
