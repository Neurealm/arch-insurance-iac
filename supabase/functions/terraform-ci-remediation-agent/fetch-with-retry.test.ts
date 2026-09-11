import { assert, assertEquals, assertRejects } from "jsr:@std/assert@1.0.14";
import { fetchWithRetry } from "./fetch-with-retry.ts";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status });
}

function withMockedFetch(impl: typeof fetch, run: () => Promise<void>) {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  return run().finally(() => { globalThis.fetch = original; });
}

Deno.test("returns the parsed body on the first successful attempt", async () => {
  let calls = 0;
  await withMockedFetch(
    (() => { calls += 1; return Promise.resolve(jsonResponse(200, { ok: true })); }) as typeof fetch,
    async () => {
      const result = await fetchWithRetry("https://example.test", {});
      assertEquals(result, { ok: true });
      assertEquals(calls, 1);
    },
  );
});

Deno.test("retries once on a 500 and then succeeds", async () => {
  let calls = 0;
  await withMockedFetch(
    (() => {
      calls += 1;
      if (calls === 1) return Promise.resolve(new Response("server exploded", { status: 503 }));
      return Promise.resolve(jsonResponse(200, { ok: true }));
    }) as typeof fetch,
    async () => {
      const result = await fetchWithRetry("https://example.test", {});
      assertEquals(result, { ok: true });
      assertEquals(calls, 2);
    },
  );
});

Deno.test("retries on 429 up to the retry budget then throws with the response body", async () => {
  let calls = 0;
  await withMockedFetch(
    (() => { calls += 1; return Promise.resolve(new Response("rate limited, slow down", { status: 429 })); }) as typeof fetch,
    async () => {
      const error = await assertRejects(() => fetchWithRetry("https://example.test", {}));
      assert(error instanceof Error);
      assert(error.message.includes("429"));
      assert(error.message.includes("rate limited, slow down"));
      assertEquals(calls, 2); // initial attempt + 1 retry, per OPENAI_MAX_RETRIES
    },
  );
});

Deno.test("does not retry a 4xx client error", async () => {
  let calls = 0;
  await withMockedFetch(
    (() => { calls += 1; return Promise.resolve(new Response("bad request: invalid schema", { status: 400 })); }) as typeof fetch,
    async () => {
      const error = await assertRejects(() => fetchWithRetry("https://example.test", {}));
      assert(error instanceof Error);
      assert(error.message.includes("400"));
      assertEquals(calls, 1); // no retry attempted
    },
  );
});

Deno.test("retries a network-level failure (TypeError) then rethrows after the budget", async () => {
  let calls = 0;
  await withMockedFetch(
    (() => { calls += 1; return Promise.reject(new TypeError("network unreachable")); }) as typeof fetch,
    async () => {
      const error = await assertRejects(() => fetchWithRetry("https://example.test", {}));
      assert(error instanceof TypeError);
      assertEquals(calls, 2);
    },
  );
});

Deno.test("treats an aborted request (timeout) as retryable", async () => {
  // Simulates what happens once fetchWithRetry's own timeout fires and calls
  // controller.abort() -- without waiting the real 45s for that to occur,
  // the fetch call simply rejects with the same AbortError shape.
  let calls = 0;
  await withMockedFetch(
    (() => {
      calls += 1;
      if (calls === 1) return Promise.reject(new DOMException("The operation was aborted.", "AbortError"));
      return Promise.resolve(jsonResponse(200, { ok: true }));
    }) as typeof fetch,
    async () => {
      const result = await fetchWithRetry("https://example.test", {});
      assertEquals(result, { ok: true });
      assertEquals(calls, 2);
    },
  );
});
