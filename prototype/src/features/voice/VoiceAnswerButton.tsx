import type { Conversation as ConversationSession } from "@elevenlabs/client";
import {
  ArrowsClockwiseIcon,
  InfoIcon,
  KeyboardIcon,
  MicrophoneIcon,
  PaperPlaneRightIcon,
  ThumbsUpIcon,
  WaveformIcon,
} from "@phosphor-icons/react";
import { Swirl } from "loading-dev";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  findRecommendedOffers,
  serializeOfferRecommendations,
  type VoiceSearchTopic,
} from "../offers/offer-search";
import type { Offer } from "../offers/use-offers";
import { getVoiceSessionOptions, requestMicrophoneAccess } from "./voice-session";

type VoiceAnswerButtonProps = {
  isHidden?: boolean;
  offers: Offer[];
  onActiveChange: (isActive: boolean) => void;
  onRecommendations: (offers: Offer[]) => void;
  onStatusMessage: (message: string) => void;
};

type SearchOffersParameters = {
  topic?: VoiceSearchTopic;
  age?: number;
};

type ConversationMode = "text" | "voice";

type SuggestionReply = {
  id: "different" | "details" | "like";
  label: string;
  message: string;
  icon: typeof ThumbsUpIcon;
};

type UmamiWindow = Window & {
  umami?: {
    track: (eventName: string, data?: Record<string, string>) => void;
  };
};

const VOICE_TOPICS = new Set<VoiceSearchTopic>([
  "ai",
  "robotics",
  "coding",
  "gaming",
  "making",
  "puzzles",
  "all",
]);
const VOICE_OPEN_SOUND_URL = "/assets/bobby-voice-open.mp3";
const VOICE_CLOSE_SOUND_URL = "/assets/bobby-voice-close.mp3";
const SUGGESTION_REPLIES: SuggestionReply[] = [
  {
    id: "like",
    label: "Gefällt mir",
    message: "Das gefällt mir.",
    icon: ThumbsUpIcon,
  },
  {
    id: "different",
    label: "Zeig etwas anderes",
    message: "Zeig mir bitte etwas anderes.",
    icon: ArrowsClockwiseIcon,
  },
  {
    id: "details",
    label: "Erzähl mehr",
    message: "Erzähl mir bitte mehr darüber.",
    icon: InfoIcon,
  },
];

function trackEvent(eventName: string, data?: Record<string, string>) {
  (window as UmamiWindow).umami?.track(eventName, data);
}

function playVoiceSound(audio: HTMLAudioElement | null, sound: "open" | "close") {
  if (!audio) return;
  audio.currentTime = 0;
  void audio.play().catch(() => {
    trackEvent("voice_sound_error", { sound });
  });
}

function getFriendlyError(error: unknown) {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Das Mikrofon ist blockiert. Erlaube den Mikrofonzugriff und versuche es erneut.";
  }
  if (error instanceof DOMException && error.name === "NotFoundError") {
    return "Kein Mikrofon gefunden. Du kannst stattdessen ein Bild auswählen.";
  }
  return "Der Sprachmodus ist gerade nicht verfügbar. Du kannst stattdessen ein Bild auswählen.";
}

function getSetupErrorCode(error: unknown) {
  if (error instanceof DOMException) return error.name;
  if (error instanceof Error && /^[a-z_]+$/.test(error.message)) return error.message;
  return "unknown";
}

export function VoiceAnswerButton({
  isHidden = false,
  offers,
  onActiveChange,
  onRecommendations,
  onStatusMessage,
}: VoiceAnswerButtonProps) {
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "disconnecting"
  >("disconnected");
  const [errorMessage, setErrorMessage] = useState("");
  const [userSubtitle, setUserSubtitle] = useState("");
  const [agentSubtitle, setAgentSubtitle] = useState("");
  const [conversationMode, setConversationMode] = useState<ConversationMode | null>(null);
  const [typedMessage, setTypedMessage] = useState("");
  const [typedMessageError, setTypedMessageError] = useState("");
  const [areSuggestionRepliesVisible, setAreSuggestionRepliesVisible] = useState(false);
  const conversationRef = useRef<ConversationSession | null>(null);
  const conversationModeRef = useRef<ConversationMode | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const offersRef = useRef(offers);
  const pendingRecommendationsRef = useRef<Offer[]>([]);
  const hasPendingSuggestionReplyRef = useRef(false);
  const openSoundRef = useRef<HTMLAudioElement | null>(null);
  const closeSoundRef = useRef<HTMLAudioElement | null>(null);
  const isActive = connectionStatus !== "disconnected";

  const handleOfferSearch = (parameters: SearchOffersParameters) => {
    const topic = parameters.topic && VOICE_TOPICS.has(parameters.topic) ? parameters.topic : "all";
    const age =
      Number.isInteger(parameters.age) && parameters.age !== undefined && parameters.age >= 0 && parameters.age <= 17
        ? parameters.age
        : undefined;
    const recommendations = findRecommendedOffers(offersRef.current, { topic, age });
    pendingRecommendationsRef.current = recommendations;
    hasPendingSuggestionReplyRef.current = recommendations.length > 0;
    if (recommendations.length > 0) onRecommendations(recommendations);
    onStatusMessage("Bobby sucht passende Angebote.");
    trackEvent("voice_offer_search_completed", {
      result_count: String(recommendations.length),
      topic,
    });
    return serializeOfferRecommendations(recommendations);
  };

  const handleDisconnect = () => {
    const disconnectedMode = conversationModeRef.current;
    openSoundRef.current?.pause();
    playVoiceSound(closeSoundRef.current, "close");
    conversationRef.current = null;
    conversationModeRef.current = null;
    setConversationMode(null);
    setConnectionStatus("disconnected");
    setTypedMessage("");
    setTypedMessageError("");
    setAreSuggestionRepliesVisible(false);
    hasPendingSuggestionReplyRef.current = false;
    const recommendations = pendingRecommendationsRef.current;
    pendingRecommendationsRef.current = [];
    onStatusMessage(
      recommendations.length > 0
        ? `${recommendations.length} passende Angebote werden angezeigt.`
        : "Unterhaltung beendet.",
    );
    trackEvent("voice_answer_stopped", {
      has_results: String(recommendations.length > 0),
      mode: disconnectedMode ?? "unknown",
    });
  };

  useEffect(() => {
    onActiveChange(isActive);
  }, [isActive, onActiveChange]);

  useEffect(() => {
    offersRef.current = offers;
  }, [offers]);

  useEffect(() => {
    if (conversationMode === "text" && connectionStatus === "connected") {
      textInputRef.current?.focus();
    }
  }, [connectionStatus, conversationMode]);

  useEffect(() => {
    const openSound = new Audio(VOICE_OPEN_SOUND_URL);
    const closeSound = new Audio(VOICE_CLOSE_SOUND_URL);
    openSound.preload = "auto";
    closeSound.preload = "auto";
    openSoundRef.current = openSound;
    closeSoundRef.current = closeSound;

    return () => {
      for (const audio of [openSound, closeSound]) {
        audio.pause();
        audio.currentTime = 0;
      }
      openSoundRef.current = null;
      closeSoundRef.current = null;
    };
  }, []);

  useEffect(
    () => () => {
      void conversationRef.current?.endSession();
    },
    [],
  );

  const handleEndSession = async () => {
    if (connectionStatus !== "connected") return;

    setConnectionStatus("disconnecting");
    try {
      await conversationRef.current?.endSession();
    } catch {
      conversationRef.current = null;
      conversationModeRef.current = null;
      setConversationMode(null);
      setConnectionStatus("disconnected");
      const message = "Die Unterhaltung konnte nicht sauber beendet werden. Versuche es bitte erneut.";
      setErrorMessage(message);
      onStatusMessage(message);
      trackEvent("voice_answer_error", { stage: "disconnect" });
    }
  };

  const handleStartSession = async (mode: ConversationMode) => {
    if (isActive) return;

    conversationModeRef.current = mode;
    setConversationMode(mode);
    setConnectionStatus("connecting");
    setErrorMessage("");
    setUserSubtitle("");
    setAgentSubtitle("");
    setTypedMessage("");
    setTypedMessageError("");
    setAreSuggestionRepliesVisible(false);
    hasPendingSuggestionReplyRef.current = false;
    pendingRecommendationsRef.current = [];
    onStatusMessage(mode === "voice" ? "Mikrofon wird vorbereitet." : "Bobby wird verbunden.");
    trackEvent("voice_answer_started", { mode });

    try {
      const sessionOptions = await getVoiceSessionOptions();
      await requestMicrophoneAccess();
      const { Conversation, stripAudioTags } = await import("@elevenlabs/client");
      conversationRef.current = await Conversation.startSession({
        ...sessionOptions,
        textOnly: false,
        clientTools: { search_offers: handleOfferSearch },
        onConversationCreated: (conversation) => {
          conversationRef.current = conversation;
          if (mode === "text") conversation.setMicMuted(true);
        },
        onConnect: () => {
          playVoiceSound(openSoundRef.current, "open");
          setConnectionStatus("connected");
          setErrorMessage("");
          onStatusMessage(mode === "voice" ? "Ich höre zu. Sprich jetzt." : "Schreibe Bobby eine Nachricht.");
          trackEvent("voice_answer_connected", { mode });
        },
        onDisconnect: handleDisconnect,
        onError: () => {
          console.error("[voice] ElevenLabs conversation failed");
          const message = "Der Sprachmodus wurde unterbrochen. Du kannst stattdessen ein Bild auswählen.";
          setErrorMessage(message);
          onStatusMessage(message);
          trackEvent("voice_answer_error", { stage: "conversation" });
        },
        onMessage: ({ message, role }) => {
          const subtitle = stripAudioTags(message).trim();
          if (!subtitle) return;
          if (role === "user") {
            setUserSubtitle(subtitle);
            setAgentSubtitle("Bobby denkt nach.");
            return;
          }
          setAgentSubtitle(subtitle);
          if (hasPendingSuggestionReplyRef.current) {
            hasPendingSuggestionReplyRef.current = false;
            setAreSuggestionRepliesVisible(true);
          }
          if (conversationModeRef.current === "text") {
            requestAnimationFrame(() => textInputRef.current?.focus());
          }
        },
        onModeChange: ({ mode }) => {
          onStatusMessage(
            mode === "speaking"
              ? "Bobby spricht."
              : conversationModeRef.current === "text"
                ? "Schreibe Bobby eine Nachricht."
                : "Ich höre zu. Sprich jetzt.",
          );
        },
        onGuardrailTriggered: () => {
          onStatusMessage("Darauf kann Bobby nicht antworten. Wähle bitte ein Entdecker-Thema.");
          trackEvent("voice_guardrail_triggered");
        },
      });
    } catch (error) {
      conversationRef.current = null;
      conversationModeRef.current = null;
      setConversationMode(null);
      setConnectionStatus("disconnected");
      const message = getFriendlyError(error);
      setErrorMessage(message);
      onStatusMessage(message);
      trackEvent("voice_answer_error", { stage: "setup", reason: getSetupErrorCode(error) });
    }
  };

  const sendConversationMessage = (message: string, visibleMessage = message) => {
    if (connectionStatus !== "connected" || !conversationRef.current) {
      const error = "Bobby ist noch nicht bereit. Versuche es gleich noch einmal.";
      setErrorMessage(error);
      onStatusMessage(error);
      return false;
    }

    try {
      conversationRef.current.sendUserMessage(message);
      setUserSubtitle(visibleMessage);
      setAgentSubtitle("Bobby denkt nach.");
      onStatusMessage("Bobby denkt nach.");
      return true;
    } catch {
      const error = "Die Nachricht konnte nicht gesendet werden. Versuche es bitte erneut.";
      setErrorMessage(error);
      onStatusMessage(error);
      trackEvent("voice_answer_error", { stage: "text_send" });
      return false;
    }
  };

  const handleTextSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = typedMessage.trim();
    if (!message) {
      setTypedMessageError("Schreibe zuerst eine Nachricht.");
      textInputRef.current?.focus();
      return;
    }
    if (conversationMode !== "text") return;
    if (!sendConversationMessage(message)) return;

    setTypedMessage("");
    setTypedMessageError("");
    setAreSuggestionRepliesVisible(false);
    trackEvent("text_answer_sent");
  };

  const handleSuggestionReply = (reply: SuggestionReply) => {
    if (!sendConversationMessage(reply.message, reply.label)) return;

    setAreSuggestionRepliesVisible(false);
    trackEvent("suggestion_reply_sent", { reply: reply.id });
  };

  const activeLabel =
    connectionStatus === "connecting"
      ? "Bobby wird verbunden"
      : connectionStatus === "disconnecting"
        ? "Bobby wird beendet"
        : "Unterhaltung beenden";

  return (
    <div className={`voice-control${isActive ? " voice-control-active" : ""}`} hidden={isHidden}>
      {isActive && (
        <div aria-live="polite" className="voice-subtitles">
          {userSubtitle ? (
            <p>
              <strong>Du:</strong> {userSubtitle}
            </p>
          ) : null}
          {agentSubtitle ? (
            <p>
              <strong>Bobby:</strong> {agentSubtitle}
            </p>
          ) : null}
          {!userSubtitle && !agentSubtitle && (
            <p className="voice-subtitles-placeholder">
              {connectionStatus === "connecting" ? "Bobby wird verbunden." : "Bobby hört zu."}
            </p>
          )}
        </div>
      )}
      {areSuggestionRepliesVisible && connectionStatus === "connected" && (
        <div aria-label="Antwortmöglichkeiten" className="voice-suggestion-replies" role="group">
          {SUGGESTION_REPLIES.map((reply) => {
            const ReplyIcon = reply.icon;

            return (
              <button key={reply.id} onClick={() => handleSuggestionReply(reply)} type="button">
                <ReplyIcon aria-hidden="true" size={22} weight="bold" />
                <span>{reply.label}</span>
              </button>
            );
          })}
        </div>
      )}
      {connectionStatus === "disconnected" ? (
        <div className="voice-actions">
          <button
            className="voice-button"
            data-umami-event="voice_answer_toggled"
            data-umami-event-mode="voice"
            onClick={() => void handleStartSession("voice")}
            type="button"
          >
            <MicrophoneIcon aria-hidden="true" size={28} weight="regular" />
            <span>Antwort sagen</span>
          </button>
          <button
            className="voice-button"
            data-umami-event="voice_answer_toggled"
            data-umami-event-mode="text"
            onClick={() => void handleStartSession("text")}
            type="button"
          >
            <KeyboardIcon aria-hidden="true" size={28} weight="regular" />
            <span>Antwort tippen</span>
          </button>
        </div>
      ) : (
        <>
          {conversationMode === "text" && connectionStatus === "connected" && (
            <form className="voice-text-form" onSubmit={handleTextSubmit}>
              <label htmlFor="bobby-message">Nachricht an Bobby</label>
              <div className="voice-text-row">
                <input
                  aria-describedby={typedMessageError ? "bobby-message-error" : undefined}
                  aria-invalid={typedMessageError ? true : undefined}
                  autoComplete="off"
                  id="bobby-message"
                  inputMode="text"
                  maxLength={500}
                  name="bobby-message"
                  onChange={(event) => {
                    setTypedMessage(event.target.value);
                    setTypedMessageError("");
                    conversationRef.current?.sendUserActivity();
                  }}
                  onFocus={() => conversationRef.current?.sendUserActivity()}
                  placeholder="Zum Beispiel: Ich mag Roboter"
                  ref={textInputRef}
                  required
                  type="text"
                  value={typedMessage}
                />
                <button className="voice-send-button" type="submit">
                  <PaperPlaneRightIcon aria-hidden="true" size={24} weight="bold" />
                  <span>Senden</span>
                </button>
              </div>
              {typedMessageError && (
                <p className="voice-text-error" id="bobby-message-error">
                  {typedMessageError}
                </p>
              )}
            </form>
          )}
          <button
            className="voice-button voice-end-button"
            disabled={connectionStatus !== "connected"}
            onClick={() => void handleEndSession()}
            type="button"
          >
            <span aria-hidden="true" className="voice-icon-stack">
              {connectionStatus === "connecting" ? (
                <Swirl duration={1200} size={28} />
              ) : (
                <WaveformIcon size={28} weight="bold" />
              )}
            </span>
            <span>{activeLabel}</span>
          </button>
        </>
      )}
      {errorMessage && (
        <p className="voice-error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
