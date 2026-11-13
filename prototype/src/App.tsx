import {
  CheckCircleIcon,
  GameControllerIcon,
  MicrophoneIcon,
  PuzzlePieceIcon,
  RobotIcon,
  SpeakerHighIcon,
  StackIcon,
  WaveformIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type InterestId = "robots" | "games" | "building" | "puzzles";

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
  { id: "robots", label: "Roboter", icon: RobotIcon },
  { id: "games", label: "Spiele", icon: GameControllerIcon },
  { id: "building", label: "Bauen", icon: StackIcon },
  { id: "puzzles", label: "Rätseln", icon: PuzzlePieceIcon },
];

const QUESTION = "Was möchtest du entdecken?";

function trackEvent(eventName: string, data?: Record<string, string>) {
  (window as UmamiWindow).umami?.track(eventName, data);
}

export function App() {
  const [selectedInterest, setSelectedInterest] = useState<InterestId | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Wähle ein Bild oder antworte mit deiner Stimme.");

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleInterestSelect = (interest: Interest) => {
    setSelectedInterest(interest.id);
    setIsListening(false);
    setStatusMessage(`${interest.label} ausgewählt.`);
    trackEvent("child_interest_selected", { interest: interest.id });
  };

  const handleListenToggle = () => {
    setIsListening((currentValue) => {
      const nextValue = !currentValue;
      setStatusMessage(nextValue ? "Ich höre zu. Sprich jetzt." : "Sprachantwort beendet.");
      trackEvent(nextValue ? "voice_answer_started" : "voice_answer_stopped");
      return nextValue;
    });
  };

  const handleQuestionReplay = () => {
    if (!("speechSynthesis" in window)) {
      setStatusMessage("Die Sprachausgabe ist in diesem Browser nicht verfügbar.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(QUESTION);
    utterance.lang = "de-DE";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    setStatusMessage("Die Frage wird vorgelesen.");
    trackEvent("question_replayed");
  };

  const handlePrototypeNavigation = (label: string) => {
    setStatusMessage(`${label} wird im nächsten Prototyp-Schritt ergänzt.`);
    trackEvent("prototype_navigation_selected", { destination: label });
  };

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
        <span className="pixel-brand">Bobby</span>
        <nav aria-label="Hauptnavigation" className="pixel-nav">
          <button aria-current="page" className="nav-button nav-button-active" type="button">
            Entdecken
          </button>
          <button onClick={() => handlePrototypeNavigation("Alle Angebote")} type="button">
            Alle Angebote
          </button>
          <button onClick={() => handlePrototypeNavigation("Für Eltern")} type="button">
            Für Eltern
          </button>
        </nav>
      </header>

      <section aria-labelledby="discovery-question" className="pixel-panel">
        <div className="question-row">
          <h1 id="discovery-question">{QUESTION}</h1>
          <button
            aria-label="Frage anhören"
            className="speaker-button"
            data-umami-event="question_replayed"
            onClick={handleQuestionReplay}
            type="button"
          >
            <SpeakerHighIcon aria-hidden="true" size={28} weight="regular" />
          </button>
        </div>

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

        <button
          aria-pressed={isListening}
          className="voice-button"
          data-umami-event="voice_answer_toggled"
          onClick={handleListenToggle}
          type="button"
        >
          <span aria-hidden="true" className="voice-icon-stack">
            <MicrophoneIcon className="voice-icon voice-icon-idle" size={28} weight="regular" />
            <WaveformIcon className="voice-icon voice-icon-active" size={28} weight="bold" />
          </span>
          <span>{isListening ? "Zuhören beenden" : "Antwort sagen"}</span>
        </button>

        <p aria-live="polite" className="sr-only" role="status">
          {statusMessage}
        </p>
      </section>

      <div aria-hidden="true" className="mascot-stage" data-mascot>
        <div className="mascot-shadow" />
        <img
          alt=""
          className="mascot-sprite mascot-idle"
          src={isListening ? "/assets/kiko-mallard-speaking.png" : "/assets/kiko-mallard.png"}
        />
        {!isListening && (
          <img alt="" className="mascot-sprite mascot-blink" src="/assets/kiko-mallard-blink.png" />
        )}
      </div>
    </main>
  );
}
