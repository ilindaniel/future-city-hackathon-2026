import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import serveHandler from "serve-handler";

const API_PATH = "/api/voice/session";
const ELEVENLABS_SIGNED_URL_ENDPOINT =
  "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url";
const DEFAULT_RATE_LIMIT = {
  windowMs: 10 * 60 * 1_000,
  maxPerClient: 30,
  maxGlobal: 300,
};

type Fetch = typeof fetch;

type ServerLogger = Pick<Console, "error" | "info">;

type RateLimitOptions = {
  windowMs: number;
  maxPerClient: number;
  maxGlobal: number;
};

type BobbyServerOptions = {
  apiKey?: string;
  agentId?: string;
  now?: () => number;
  publicDirectory?: string;
  rateLimit?: Partial<RateLimitOptions>;
  upstreamFetch?: Fetch;
  logger?: ServerLogger;
};

type RateLimitResult =
  | { isAllowed: true }
  | { isAllowed: false; retryAfterSeconds: number };

function getFirstHeaderValue(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return rawValue?.split(",", 1)[0]?.trim();
}

function getClientKey(request: IncomingMessage) {
  const forwardedAddress = getFirstHeaderValue(request.headers["x-forwarded-for"]);
  return `${request.socket.remoteAddress ?? "unknown"}:${forwardedAddress ?? "unknown"}`;
}

function createRateLimiter(options: RateLimitOptions, now: () => number) {
  let windowStartedAt = now();
  let globalCount = 0;
  const clientCounts = new Map<string, number>();

  return (clientKey: string): RateLimitResult => {
    const currentTime = now();
    if (currentTime - windowStartedAt >= options.windowMs) {
      windowStartedAt = currentTime;
      globalCount = 0;
      clientCounts.clear();
    }

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((windowStartedAt + options.windowMs - currentTime) / 1_000),
    );
    const clientCount = clientCounts.get(clientKey) ?? 0;
    if (globalCount >= options.maxGlobal || clientCount >= options.maxPerClient) {
      return { isAllowed: false, retryAfterSeconds };
    }

    globalCount += 1;
    clientCounts.set(clientKey, clientCount + 1);
    return { isAllowed: true };
  };
}

function setSecurityHeaders(response: ServerResponse) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "same-origin");
  response.setHeader("Permissions-Policy", "microphone=(self)");
  response.setHeader("X-Frame-Options", "DENY");
}

function sendJson(response: ServerResponse, status: number, value: object) {
  response.statusCode = status;
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(value));
}

function isAllowedOrigin(request: IncomingMessage) {
  const origin = getFirstHeaderValue(request.headers.origin);
  const forwardedHost = getFirstHeaderValue(request.headers["x-forwarded-host"]);
  const host = forwardedHost ?? getFirstHeaderValue(request.headers.host);
  if (!origin || !host) return false;

  try {
    const originUrl = new URL(origin);
    return (originUrl.protocol === "https:" || originUrl.protocol === "http:") && originUrl.host === host;
  } catch {
    return false;
  }
}

function hasUnexpectedBody(request: IncomingMessage) {
  const contentLength = Number(request.headers["content-length"] ?? "0");
  return !Number.isFinite(contentLength) || contentLength > 0 || request.headers["transfer-encoding"] !== undefined;
}

function isAgentId(value: string) {
  return /^(agent|seng)_[a-zA-Z0-9]+$/.test(value);
}

function isElevenLabsSignedUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "wss:" &&
      url.hostname === "api.elevenlabs.io" &&
      url.pathname === "/v1/convai/conversation"
    );
  } catch {
    return false;
  }
}

async function requestSignedUrl({
  agentId,
  apiKey,
  upstreamFetch,
  logger,
}: {
  agentId: string;
  apiKey: string;
  upstreamFetch: Fetch;
  logger: ServerLogger;
}) {
  const endpoint = new URL(ELEVENLABS_SIGNED_URL_ENDPOINT);
  endpoint.searchParams.set("agent_id", agentId);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await upstreamFetch(endpoint, {
      method: "GET",
      headers: {
        accept: "application/json",
        "xi-api-key": apiKey,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      logger.error("voice_session_upstream_failed", { status: response.status });
      return undefined;
    }

    const value = (await response.json()) as unknown;
    if (
      typeof value !== "object" ||
      value === null ||
      !("signed_url" in value) ||
      !isElevenLabsSignedUrl(value.signed_url)
    ) {
      logger.error("voice_session_upstream_invalid_response");
      return undefined;
    }

    return value.signed_url;
  } catch (error) {
    logger.error("voice_session_upstream_error", {
      errorType: error instanceof Error ? error.name : "UnknownError",
    });
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}

export function createBobbyServer(options: BobbyServerOptions = {}) {
  const apiKey = options.apiKey ?? process.env.ELEVENLABS_API_KEY?.trim();
  const agentId = options.agentId ?? process.env.ELEVENLABS_AGENT_ID?.trim();
  const logger = options.logger ?? console;
  const now = options.now ?? Date.now;
  const publicDirectory = options.publicDirectory ?? path.resolve(process.cwd(), "dist/client");
  const upstreamFetch = options.upstreamFetch ?? fetch;
  const rateLimitOptions = { ...DEFAULT_RATE_LIMIT, ...options.rateLimit };
  const checkRateLimit = createRateLimiter(rateLimitOptions, now);

  return createServer(async (request, response) => {
    setSecurityHeaders(response);
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;

    if (pathname === API_PATH) {
      if (request.method !== "POST") {
        response.setHeader("Allow", "POST");
        sendJson(response, 405, { error: "method_not_allowed" });
        return;
      }
      if (!isAllowedOrigin(request)) {
        sendJson(response, 403, { error: "origin_not_allowed" });
        return;
      }
      if (hasUnexpectedBody(request)) {
        sendJson(response, 400, { error: "request_body_not_allowed" });
        return;
      }
      if (!apiKey || !agentId || !isAgentId(agentId)) {
        logger.error("voice_session_server_not_configured");
        sendJson(response, 503, { error: "voice_service_unavailable" });
        return;
      }

      const rateLimit = checkRateLimit(getClientKey(request));
      if (!rateLimit.isAllowed) {
        response.setHeader("Retry-After", rateLimit.retryAfterSeconds);
        sendJson(response, 429, { error: "too_many_requests" });
        return;
      }

      const signedUrl = await requestSignedUrl({ agentId, apiKey, upstreamFetch, logger });
      if (!signedUrl) {
        sendJson(response, 502, { error: "voice_service_unavailable" });
        return;
      }

      sendJson(response, 200, { signedUrl });
      return;
    }

    if (pathname.startsWith("/api/")) {
      sendJson(response, 404, { error: "not_found" });
      return;
    }

    try {
      await serveHandler(request, response, {
        public: publicDirectory,
        directoryListing: false,
        rewrites: [{ source: "**", destination: "/index.html" }],
      });
    } catch (error) {
      logger.error("static_server_error", {
        errorType: error instanceof Error ? error.name : "UnknownError",
      });
      if (!response.headersSent) sendJson(response, 500, { error: "server_error" });
      else response.end();
    }
  });
}

function parsePort(value: string | undefined) {
  const port = Number(value ?? "4173");
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer from 1 to 65535");
  }
  return port;
}

const isEntryPoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isEntryPoint) {
  const port = parsePort(process.env.PORT);
  createBobbyServer().listen(port, "0.0.0.0", () => {
    console.info("bobby_server_started", { port });
  });
}
