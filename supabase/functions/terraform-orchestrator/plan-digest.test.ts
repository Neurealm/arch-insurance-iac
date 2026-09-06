import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { digest } from "./plan-digest.ts";

const ABC_SHA256 = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";

describe("HCP evidence SHA-256 compatibility", () => {
  it("retains the standard UTF-8 string digest", async () => {
    assert.equal(await digest("abc"), ABC_SHA256);
  });
  it("retains the standard empty digest", async () => {
    assert.equal(await digest(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });
  it("hashes ArrayBuffer and Uint8Array input identically", async () => {
    const bytes = new Uint8Array([97, 98, 99]);
    assert.equal(await digest(bytes), ABC_SHA256);
    assert.equal(await digest(bytes.buffer), ABC_SHA256);
  });
  it("does not include bytes outside an input view", async () => {
    const bytes = new Uint8Array([0, 97, 98, 99, 255]);
    assert.equal(await digest(bytes.subarray(1, 4)), ABC_SHA256);
    assert.deepEqual([...bytes], [0, 97, 98, 99, 255]);
  });
  it("copies shared-backed views before passing them to Web Crypto", async () => {
    const bytes = new Uint8Array(new SharedArrayBuffer(3));
    bytes.set([97, 98, 99]);
    assert.equal(await digest(bytes), ABC_SHA256);
  });
  it("keeps the JSON plan hash compatible with UTF-8 SHA-256", async () => {
    const plan = JSON.stringify({ label: "VM review – 東京", resource_changes: [] });
    assert.equal(await digest(plan), createHash("sha256").update(plan, "utf8").digest("hex"));
  });
});
