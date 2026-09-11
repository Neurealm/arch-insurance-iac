import { assert, assertEquals } from "jsr:@std/assert@1.0.14";
import { hmacSha256Hex, timingSafeEqual, verifyHmacSignatureHeader } from "./webhook-auth.ts";

Deno.test("timingSafeEqual accepts identical strings and rejects any difference", () => {
  assertEquals(timingSafeEqual("shared-secret", "shared-secret"), true);
  assertEquals(timingSafeEqual("shared-secret", "shared-secreT"), false);
  assertEquals(timingSafeEqual("short", "much-longer-value"), false);
  assertEquals(timingSafeEqual("", ""), true);
});

Deno.test("hmacSha256Hex produces a stable, verifiable digest", async () => {
  const digest = await hmacSha256Hex("my-secret", "the request body");
  assert(/^[0-9a-f]{64}$/.test(digest), digest);
  assertEquals(digest, await hmacSha256Hex("my-secret", "the request body"));
  assert(digest !== await hmacSha256Hex("different-secret", "the request body"));
  assert(digest !== await hmacSha256Hex("my-secret", "a tampered body"));
});

Deno.test("verifyHmacSignatureHeader accepts a correctly signed GitHub-style header", async () => {
  const body = '{"action":"completed","workflow_run":{"head_branch":"ai-draft/vm-os-disk-expand-9162761e"}}';
  const digest = await hmacSha256Hex("wh-secret", body);
  assertEquals(await verifyHmacSignatureHeader(`sha256=${digest}`, "wh-secret", body), true);
});

Deno.test("verifyHmacSignatureHeader rejects a tampered body, wrong secret, or missing/malformed header", async () => {
  const body = '{"ok":true}';
  const digest = await hmacSha256Hex("wh-secret", body);
  assertEquals(await verifyHmacSignatureHeader(`sha256=${digest}`, "wh-secret", '{"ok":false}'), false);
  assertEquals(await verifyHmacSignatureHeader(`sha256=${digest}`, "wrong-secret", body), false);
  assertEquals(await verifyHmacSignatureHeader(null, "wh-secret", body), false);
  assertEquals(await verifyHmacSignatureHeader("", "wh-secret", body), false);
  assertEquals(await verifyHmacSignatureHeader("not-even-hex", "wh-secret", body), false);
});

Deno.test("verifyHmacSignatureHeader tolerates a bare hex digest with no 'sha256=' prefix", async () => {
  // GitHub always sends the prefix; some other webhook senders don't --
  // accepting either is deliberate leniency, not a bug.
  const body = '{"ok":true}';
  const digest = await hmacSha256Hex("wh-secret", body);
  assertEquals(await verifyHmacSignatureHeader(digest, "wh-secret", body), true);
  assertEquals(await verifyHmacSignatureHeader(digest.toUpperCase(), "wh-secret", body), true);
});
