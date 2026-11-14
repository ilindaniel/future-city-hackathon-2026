type VoiceSessionOptions = { signedUrl: string } | { agentId: string };

function isAgentId(value: string) {
  return /^agent_[a-zA-Z0-9]+$/.test(value);
}

function isSignedUrl(value: string) {
  try {
    return new URL(value).protocol === "wss:";
  } catch {
    return false;
  }
}

export async function getVoiceSessionOptions(): Promise<VoiceSessionOptions> {
  const configuredSessionUrl = import.meta.env.VITE_ELEVENLABS_SESSION_URL?.trim();
  const sessionUrl = configuredSessionUrl || (import.meta.env.PROD ? "/api/voice/session" : "");

  if (sessionUrl) {
    const response = await fetch(sessionUrl, {
      method: "POST",
      headers: { accept: "application/json" },
      cache: "no-store",
      credentials: "omit",
    });
    if (!response.ok) throw new Error("voice_session_request_failed");

    const value = (await response.json()) as unknown;
    if (
      typeof value !== "object" ||
      value === null ||
      !("signedUrl" in value) ||
      typeof value.signedUrl !== "string" ||
      !isSignedUrl(value.signedUrl)
    ) {
      throw new Error("voice_session_response_invalid");
    }
    return { signedUrl: value.signedUrl };
  }

  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID?.trim();
  if (import.meta.env.DEV && agentId && isAgentId(agentId)) return { agentId };

  throw new Error("voice_session_not_configured");
}

export async function requestMicrophoneAccess() {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error("microphone_not_supported");
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  for (const track of stream.getTracks()) track.stop();
}
