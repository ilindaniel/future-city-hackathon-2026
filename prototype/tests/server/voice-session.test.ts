import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { createBobbyServer } from "../../server/railway.ts";

const SIGNED_URL =
  "wss://api.elevenlabs.io/v1/convai/conversation?agent_id=agent_test&conversation_signature=test";

type TestServerOptions = Parameters<typeof createBobbyServer>[0];

async function withServer(
  options: TestServerOptions,
  run: (baseUrl: string) => Promise<void>,
) {
  const server = createBobbyServer(options);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function createUpstreamFetch(
  handler: (input: URL | RequestInfo, init?: RequestInit) => Response | Promise<Response>,
) {
  return handler as typeof fetch;
}

const silentLogger = {
  error() {},
  info() {},
};

test("returns a temporary signed URL without exposing the API key", async () => {
  let receivedApiKey: string | null = null;
  let receivedAgentId: string | null = null;
  const upstreamFetch = createUpstreamFetch((input, init) => {
    receivedApiKey = new Headers(init?.headers).get("xi-api-key");
    receivedAgentId = new URL(input.toString()).searchParams.get("agent_id");
    return Response.json({ signed_url: SIGNED_URL });
  });

  await withServer(
    { apiKey: "secret-test-key", agentId: "agent_test", upstreamFetch, logger: silentLogger },
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/voice/session`, {
        method: "POST",
        headers: { origin: baseUrl },
      });

      assert.equal(response.status, 200);
      const responseBody = await response.json();
      assert.deepEqual(responseBody, { signedUrl: SIGNED_URL });
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal(receivedApiKey, "secret-test-key");
      assert.equal(receivedAgentId, "agent_test");
      assert.equal(JSON.stringify(responseBody).includes("secret-test-key"), false);
    },
  );
});

test("rejects cross-origin session requests", async () => {
  let upstreamCalls = 0;
  const upstreamFetch = createUpstreamFetch(() => {
    upstreamCalls += 1;
    return Response.json({ signed_url: SIGNED_URL });
  });

  await withServer(
    { apiKey: "test", agentId: "agent_test", upstreamFetch, logger: silentLogger },
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/voice/session`, {
        method: "POST",
        headers: { origin: "https://attacker.example" },
      });

      assert.equal(response.status, 403);
      assert.equal(upstreamCalls, 0);
    },
  );
});

test("accepts only POST without a request body", async () => {
  await withServer(
    { apiKey: "test", agentId: "agent_test", logger: silentLogger },
    async (baseUrl) => {
      const getResponse = await fetch(`${baseUrl}/api/voice/session`, {
        headers: { origin: baseUrl },
      });
      const bodyResponse = await fetch(`${baseUrl}/api/voice/session`, {
        method: "POST",
        headers: { origin: baseUrl },
        body: "unexpected",
      });

      assert.equal(getResponse.status, 405);
      assert.equal(getResponse.headers.get("allow"), "POST");
      assert.equal(bodyResponse.status, 400);
    },
  );
});

test("returns a safe error when the server is not configured", async () => {
  await withServer({ apiKey: "", agentId: "", logger: silentLogger }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/voice/session`, {
      method: "POST",
      headers: { origin: baseUrl },
    });

    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "voice_service_unavailable" });
  });
});

test("does not pass an invalid upstream response to the browser", async () => {
  const upstreamFetch = createUpstreamFetch(() =>
    Response.json({ signed_url: "wss://attacker.example/session" }),
  );

  await withServer(
    { apiKey: "test", agentId: "agent_test", upstreamFetch, logger: silentLogger },
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/voice/session`, {
        method: "POST",
        headers: { origin: baseUrl },
      });

      assert.equal(response.status, 502);
      assert.deepEqual(await response.json(), { error: "voice_service_unavailable" });
    },
  );
});

test("rate-limits repeated session requests", async () => {
  const upstreamFetch = createUpstreamFetch(() => Response.json({ signed_url: SIGNED_URL }));

  await withServer(
    {
      apiKey: "test",
      agentId: "agent_test",
      upstreamFetch,
      logger: silentLogger,
      rateLimit: { maxPerClient: 1 },
    },
    async (baseUrl) => {
      const request = () =>
        fetch(`${baseUrl}/api/voice/session`, {
          method: "POST",
          headers: { origin: baseUrl },
        });
      const firstResponse = await request();
      const secondResponse = await request();

      assert.equal(firstResponse.status, 200);
      assert.equal(secondResponse.status, 429);
      assert.ok(Number(secondResponse.headers.get("retry-after")) >= 1);
    },
  );
});
