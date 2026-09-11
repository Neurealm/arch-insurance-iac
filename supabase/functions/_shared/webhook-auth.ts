// Shared primitives for verifying inbound webhooks (ServiceNow, GitHub, and
// any future source): a timing-safe shared-secret comparison, and HMAC-SHA256
// signature verification over a raw request body.

/** A plain `!==` on a shared secret leaks timing information about how many
 *  leading characters matched. The strings here are short (a header value
 *  vs. an env var), so the risk is minor, but it costs nothing to close. */
export function timingSafeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Verifies a `sha256=<hex>`-style signature header (GitHub's
 * X-Hub-Signature-256 convention; also usable for any HMAC-over-raw-body
 * webhook) computed with the given secret over the exact raw request body.
 */
export async function verifyHmacSignatureHeader(header: string | null, secret: string, rawBody: string): Promise<boolean> {
  const signature = (header ?? "").startsWith("sha256=") ? (header as string).slice(7) : (header ?? "");
  if (!signature) return false;
  const expected = await hmacSha256Hex(secret, rawBody);
  return timingSafeEqual(signature.toLowerCase(), expected);
}
