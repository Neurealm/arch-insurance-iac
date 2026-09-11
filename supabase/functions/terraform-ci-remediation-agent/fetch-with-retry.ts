// Extracted from index.ts so it's importable by a test without pulling in
// index.ts's top-level Deno.serve(...) call (which would try to bind a port
// during a unit test).

export const OPENAI_TIMEOUT_MS = 45_000;
export const OPENAI_MAX_RETRIES = 1;

const wait = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

/** Distinguishes an HTTP-level failure worth retrying (429/5xx) from one that
 *  will not succeed on retry (4xx) -- caught and reclassified in fetchWithRetry. */
export class RetryableFetchError extends Error {}

/**
 * A single unbounded fetch previously meant a hung OpenAI response could
 * hold the whole edge function open until the platform's own timeout killed
 * it -- silently burning one of the agent's three total repair attempts for
 * nothing. Bounds each try to OPENAI_TIMEOUT_MS and retries only genuinely
 * transient failures (timeout, network error, 429, 5xx); a 4xx (bad
 * request, auth failure) is rethrown immediately since retrying it wastes
 * time and attempts without any chance of succeeding.
 */
export async function fetchWithRetry(url: string, init: RequestInit): Promise<unknown> {
  let lastError: Error = new Error("Coding model request failed.");
  for (let attempt = 0; attempt <= OPENAI_MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (response.ok) return await response.json();
      // Surface the model provider's own error body (truncated), not just
      // the bare status code, so a production failure is debuggable.
      const detail = (await response.text().catch(() => "")).slice(0, 500);
      const message = `Coding model request failed (${response.status}): ${detail || "no response body"}`;
      if (response.status === 429 || response.status >= 500) throw new RetryableFetchError(message);
      throw new Error(message);
    } catch (cause) {
      const timedOut = cause instanceof DOMException && cause.name === "AbortError";
      const retryable = timedOut || cause instanceof RetryableFetchError || cause instanceof TypeError;
      if (!retryable) throw cause;
      lastError = timedOut ? new Error(`Coding model request timed out after ${OPENAI_TIMEOUT_MS}ms.`) : (cause as Error);
      if (attempt === OPENAI_MAX_RETRIES) throw lastError;
      await wait(1_000 * 2 ** attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}
