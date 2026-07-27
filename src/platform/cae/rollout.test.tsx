/**
 * CAE.105 — initial rollout validation.
 *
 * Validates the three live placements exactly as pages use them: only a call ID
 * and a placement key cross the boundary, playback is delegated to the global
 * provider, and a disabled placement cannot render narration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";

const resolveMock = vi.fn();
vi.mock("./contextualAudioService", () => ({
  resolveContextualAudio: (...args: unknown[]) => resolveMock(...args),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) },
  },
}));

import { ContextualAudioRoot } from "./ContextualAudioErrorBoundary";
import { AudioEnrichmentButton } from "./components/AudioEnrichmentButton";

/** The rollout matrix, mirrored from the audio_placements rows. */
const PLACEMENTS = [
  {
    callId: "CAE.COMMERCIAL.DEAL_OVERVIEW.001",
    placementId: "CAE.PLACE.COMMERCIAL.OVERVIEW.DEAL_SUMMARY",
    file: "src/commercial/pages/CommercialOverview.tsx",
  },
  {
    callId: "CAE.COMMERCIAL.EBITDA.001",
    placementId: "CAE.PLACE.COMMERCIAL.PNL.EBITDA",
    file: "src/commercial/pages/CommercialPnl.tsx",
  },
  {
    callId: "CAE.RUNOPS.SERVICE_HEALTH.001",
    placementId: "CAE.PLACE.RUNOPS.SERVICES.HEALTH",
    file: "src/runops/pages/ServicePortfolio.tsx",
  },
] as const;

// --- speech engine double ---------------------------------------------------
let spoken: string[] = [];
let cancelCount = 0;
let pauseCount = 0;
let resumeCount = 0;

class FakeUtterance {
  text: string;
  rate = 1; pitch = 1; volume = 1; lang = "en-US"; voice: unknown = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) { this.text = text; }
}

function installSpeech() {
  spoken = []; cancelCount = 0; pauseCount = 0; resumeCount = 0;
  const synth = {
    speaking: false,
    paused: false,
    speak(u: FakeUtterance) { spoken.push(u.text); synth.speaking = true; u.onstart?.(); },
    cancel() { cancelCount += 1; synth.speaking = false; },
    pause() { pauseCount += 1; synth.paused = true; },
    resume() { resumeCount += 1; synth.paused = false; },
    getVoices: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true, writable: true });
  Object.defineProperty(window, "SpeechSynthesisUtterance", { value: FakeUtterance, configurable: true, writable: true });
}

function okPayload(callId: string) {
  return {
    status: "ok" as const,
    narrative: { callId, title: `${callId} title`, description: null, moduleKey: "COMMERCIAL", topicKey: "T", audience: "all", scopeType: "page" },
    version: {
      versionNumber: 1,
      sourceText: `${callId} source`,
      speechText: `${callId} spoken`,
      transcriptText: `${callId} transcript`,
      estimatedDurationSeconds: 20,
    },
    speechProfile: { rate: 1, pitch: 1, volume: 1, locale: "en-US", voiceHint: null },
    pronunciationRules: [],
    placement: null,
  };
}

function RolloutPage() {
  const navigate = useNavigate();
  return (
    <div>
      {PLACEMENTS.map((p) => (
        <AudioEnrichmentButton key={p.placementId} callId={p.callId} placementId={p.placementId} />
      ))}
      <button type="button" onClick={() => navigate("/elsewhere")}>Go elsewhere</button>
    </div>
  );
}

function renderRollout() {
  return render(
    <MemoryRouter initialEntries={["/rollout"]}>
      <ContextualAudioRoot>
        <Routes>
          <Route path="/rollout" element={<RolloutPage />} />
          <Route path="/elsewhere" element={<div>Other page</div>} />
        </Routes>
      </ContextualAudioRoot>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  installSpeech();
  resolveMock.mockReset();
  resolveMock.mockImplementation(async (callId: string) => okPayload(callId));
  window.localStorage.clear();
});

afterEach(() => { vi.restoreAllMocks(); });

describe("CAE.105 rollout placements", () => {
  it("every page passes only its call ID and placement key", () => {
    for (const p of PLACEMENTS) {
      const src = readFileSync(p.file, "utf8");
      expect(src).toContain(`callId="${p.callId}"`);
      expect(src).toContain(`placementId="${p.placementId}"`);
      // no narrative text, voice settings, or speech logic inside the page
      expect(src).not.toMatch(/speechSynthesis|SpeechSynthesisUtterance|rate=\{|pitch=\{/);
    }
  });

  it("renders one Hear More control per placement", () => {
    renderRollout();
    expect(screen.getAllByRole("button", { name: "Hear More" })).toHaveLength(PLACEMENTS.length);
  });

  it("plays, pauses, resumes and stops a placement narrative", async () => {
    const user = userEvent.setup();
    renderRollout();
    const [first] = screen.getAllByRole("button", { name: "Hear More" });
    await user.click(first);
    await waitFor(() => expect(spoken).toHaveLength(1));
    expect(resolveMock).toHaveBeenCalledWith(PLACEMENTS[0].callId, PLACEMENTS[0].placementId);

    await user.click(screen.getByRole("button", { name: /Pause narration/i }));
    await waitFor(() => expect(pauseCount).toBe(1));
    await user.click(screen.getByRole("button", { name: /Resume narration/i }));
    await waitFor(() => expect(resumeCount).toBe(1));

    const before = cancelCount;
    await user.click(screen.getByRole("button", { name: /Stop narration/i }));
    await waitFor(() => expect(cancelCount).toBeGreaterThan(before));
  });

  it("plays only one placement narrative at a time and stops on navigation", async () => {
    const user = userEvent.setup();
    renderRollout();
    const buttons = screen.getAllByRole("button", { name: "Hear More" });
    await user.click(buttons[0]);
    await waitFor(() => expect(spoken).toHaveLength(1));
    await user.click(buttons[1]);
    await waitFor(() => expect(spoken).toHaveLength(2));
    expect(cancelCount).toBeGreaterThan(0);
    expect(spoken[1]).toContain(PLACEMENTS[1].callId);

    const before = cancelCount;
    await user.click(screen.getByRole("button", { name: /Go elsewhere/i }));
    await screen.findByText("Other page");
    expect(cancelCount).toBeGreaterThan(before);
    expect(spoken).toHaveLength(2);
  });

  it("exposes the transcript for a placement without starting playback", async () => {
    const user = userEvent.setup();
    renderRollout();
    const [transcriptButton] = screen.getAllByRole("button", { name: /transcript/i });
    await user.click(transcriptButton);
    expect(await screen.findByText(`${PLACEMENTS[0].callId} transcript`)).toBeInTheDocument();
    expect(spoken).toHaveLength(0);
  });

  it("a disabled placement resolves as unsupported context and never speaks", async () => {
    resolveMock.mockResolvedValue({
      status: "unsupported_context",
      message: "The requested placement is unknown, disabled, or not bound to this narrative.",
    });
    const user = userEvent.setup();
    renderRollout();
    const [first] = screen.getAllByRole("button", { name: "Hear More" });
    await user.click(first);
    await waitFor(() => expect(resolveMock).toHaveBeenCalled());
    expect(spoken).toHaveLength(0);
  });

  it("an unauthorized caller gets no narration for a placement", async () => {
    resolveMock.mockResolvedValue({ status: "unauthorized", message: "You do not have access to this narrative." });
    const user = userEvent.setup();
    renderRollout();
    await user.click(screen.getAllByRole("button", { name: "Hear More" })[2]);
    await waitFor(() => expect(resolveMock).toHaveBeenCalledWith(PLACEMENTS[2].callId, PLACEMENTS[2].placementId));
    expect(spoken).toHaveLength(0);
  });
});
