import { describe, expect, it, vi, beforeEach } from "vitest";

const rpc = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: (...args: unknown[]) => rpc(...args) },
}));

import { resolveContextualAudio, caeQueryKey } from "./contextualAudioService";

const OK_PAYLOAD = {
  status: "ok",
  narrative: {
    callId: "CAE.COMMERCIAL.EBITDA.001",
    title: "Commercial EBITDA Explanation",
    description: "Neutral explanation.",
    moduleKey: "COMMERCIAL",
    topicKey: "EBITDA",
    audience: "all",
    scopeType: "section",
    scopeReference: "commercial.pnl.ebitda",
  },
  version: {
    versionNo: 1,
    sourceText: "Source text.",
    speechText: "Speech text.",
    transcriptText: "Source text.",
    estimatedDurationSeconds: 22,
    publishedAt: "2026-07-27T00:00:00Z",
  },
  speechProfile: {
    profileKey: "executive_explainer",
    displayName: "Executive Explainer",
    locale: "en-US",
    fallbackLocale: "en",
    preferredVoiceNames: [],
    rate: "0.95",
    pitch: "1.00",
    volume: "1.00",
  },
  pronunciationRules: [
    { matchText: "EBITDA", matchType: "word", replacementText: "e bit dah", priority: 10 },
  ],
  placement: null,
};

function resolveWith(payload: unknown) {
  rpc.mockResolvedValueOnce({ data: payload, error: null });
}

beforeEach(() => rpc.mockReset());

describe("resolveContextualAudio", () => {
  it("1. returns a typed success for a valid published narrative", async () => {
    resolveWith(OK_PAYLOAD);
    const result = await resolveContextualAudio("CAE.COMMERCIAL.EBITDA.001");

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.narrative.title).toBe("Commercial EBITDA Explanation");
    expect(result.version.versionNo).toBe(1);
    expect(result.version.speechText).toBe("Speech text.");
    expect(result.version.transcriptText).toBe("Source text.");
    expect(result.version.estimatedDurationSeconds).toBe(22);
    expect(result.speechProfile.rate).toBe(0.95);
    expect(result.speechProfile.locale).toBe("en-US");
    expect(result.pronunciationRules).toHaveLength(1);
    expect(result.placement).toBeNull();
    expect(rpc).toHaveBeenCalledWith("audio_resolve_call", {
      _call_id: "CAE.COMMERCIAL.EBITDA.001",
      _placement_key: null,
    });
  });

  it("2. rejects an invalid call ID format before any network call", async () => {
    const result = await resolveContextualAudio("commercial.ebitda.1");
    expect(result.status).toBe("invalid_call_id");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("3. reports narrative_not_found for an unknown call ID", async () => {
    resolveWith({ status: "narrative_not_found", message: "No narrative exists for this call ID." });
    const result = await resolveContextualAudio("CAE.COMMERCIAL.UNKNOWN.999");
    expect(result.status).toBe("narrative_not_found");
  });

  it("4. reports no_published_version for a draft-only narrative", async () => {
    resolveWith({ status: "no_published_version", message: "draft only" });
    const result = await resolveContextualAudio("CAE.PLATFORM.HOME.001");
    expect(result.status).toBe("no_published_version");
  });

  it("5. reports narrative_unavailable for a retired narrative", async () => {
    resolveWith({ status: "narrative_unavailable", message: "retired" });
    const result = await resolveContextualAudio("CAE.PLATFORM.HOME.001");
    expect(result.status).toBe("narrative_unavailable");
  });

  it("6. reports unauthorized for a cross tenant request", async () => {
    resolveWith({ status: "unauthorized", message: "other tenant" });
    const result = await resolveContextualAudio("CAE.COMMERCIAL.EBITDA.001");
    expect(result.status).toBe("unauthorized");
  });

  it("7. reports unauthorized for a user without audio access", async () => {
    resolveWith({ status: "unauthorized", message: "no permission" });
    const result = await resolveContextualAudio("CAE.RUNOPS.SERVICE_HEALTH.001");
    expect(result.status).toBe("unauthorized");
  });

  it("8. reports invalid_speech_configuration when no profile resolves", async () => {
    resolveWith({ status: "invalid_speech_configuration", message: "missing profile" });
    const result = await resolveContextualAudio("CAE.AVEP.REQUIREMENTS_INTAKE.001");
    expect(result.status).toBe("invalid_speech_configuration");

    resolveWith({ ...OK_PAYLOAD, speechProfile: null });
    const degraded = await resolveContextualAudio("CAE.AVEP.REQUIREMENTS_INTAKE.001");
    expect(degraded.status).toBe("invalid_speech_configuration");
  });

  it("9. reports no_published_version when no active version resolves", async () => {
    resolveWith({ status: "no_published_version", message: "no active version" });
    const result = await resolveContextualAudio("CAE.AGENTS.ORCHESTRATION.001");
    expect(result.status).toBe("no_published_version");
  });

  it("10. reports unsupported_context for an invalid or disabled placement", async () => {
    const blank = await resolveContextualAudio("CAE.AGENTS.ORCHESTRATION.001", "   ");
    expect(blank.status).toBe("unsupported_context");
    expect(rpc).not.toHaveBeenCalled();

    resolveWith({ status: "unsupported_context", message: "disabled placement" });
    const disabled = await resolveContextualAudio("CAE.AGENTS.ORCHESTRATION.001", "cae.disabled");
    expect(disabled.status).toBe("unsupported_context");
  });

  it("passes a placement key through and returns placement metadata", async () => {
    resolveWith({
      ...OK_PAYLOAD,
      placement: {
        placementKey: "cae.commercial.ebitda",
        buttonLabel: "Listen",
        displayVariant: "icon",
        routePattern: "/commercial/pnl",
        pageKey: "commercial_pnl",
        sectionKey: "ebitda",
        componentKey: null,
        sortOrder: 1,
      },
    });
    const result = await resolveContextualAudio("CAE.COMMERCIAL.EBITDA.001", "cae.commercial.ebitda");
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.placement?.placementKey).toBe("cae.commercial.ebitda");
    expect(rpc).toHaveBeenCalledWith("audio_resolve_call", {
      _call_id: "CAE.COMMERCIAL.EBITDA.001",
      _placement_key: "cae.commercial.ebitda",
    });
  });

  it("scopes cache keys by tenant so tenants cannot share cached audio", () => {
    expect(caeQueryKey("tenant-a", "CAE.PLATFORM.HOME.001")).not.toEqual(
      caeQueryKey("tenant-b", "CAE.PLATFORM.HOME.001"),
    );
  });
});
