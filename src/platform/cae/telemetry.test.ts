import { describe, expect, it, vi, beforeEach } from "vitest";
import { classifyBrowser, errorCategoryFromStatus, recordAudioEvent } from "./telemetry";
import { ratePct } from "./admin/AudioAnalytics";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: vi.fn() },
}));

describe("CAE telemetry (CAE.110)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("never throws when the analytics RPC rejects", async () => {
    (supabase.rpc as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network down"));
    await expect(recordAudioEvent("playback_started", { callId: "X" })).resolves.toBeUndefined();
  });

  it("never throws when the analytics RPC returns an error payload", async () => {
    (supabase.rpc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ error: { message: "denied" } });
    await expect(recordAudioEvent("playback_completed", { callId: "X" })).resolves.toBeUndefined();
  });

  it("sends only identifiers and counts, never narrative text", async () => {
    const rpc = supabase.rpc as unknown as ReturnType<typeof vi.fn>;
    rpc.mockResolvedValue({ error: null });
    await recordAudioEvent("playback_started", { callId: "CAE.A", placementKey: "P", durationMs: 1200 });
    const payload = JSON.stringify(rpc.mock.calls[0]?.[1] ?? {});
    expect(payload).not.toMatch(/transcript|resolved_text|narrative_text/i);
    expect(payload).toContain("CAE.A");
  });

  it("classifies failure statuses into stable diagnostic categories", () => {
    expect(errorCategoryFromStatus("not_found")).toBeTruthy();
    expect(errorCategoryFromStatus("forbidden")).toBeTruthy();
    expect(errorCategoryFromStatus("not_found")).not.toEqual(errorCategoryFromStatus("forbidden"));
  });

  it("reports a browser capability class", () => {
    expect(typeof classifyBrowser()).toBe("string");
  });

  it("computes rates safely with no activity", () => {
    expect(ratePct(0, 0)).toBe(0);
    expect(ratePct(3, 4)).toBe(75);
  });
});
