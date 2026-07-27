/**
 * CAE.100 — global error handling.
 *
 * A fault inside the audio controller must degrade narration only. The page
 * keeps rendering and consumers receive an inert controller.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// The provider fails hard while probing the speech engine.
vi.mock("./speech", () => ({
  getSpeechSynthesis: () => null,
  isSpeechSupported: () => {
    throw new Error("speech engine probe failed");
  },
  loadVoices: async () => [],
  prepareSpeechText: (t: string) => t,
  selectVoice: () => null,
}));

vi.mock("./contextualAudioService", () => ({
  resolveContextualAudio: async () => ({ status: "narrative_not_found", message: "none" }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) },
  },
}));

import { ContextualAudioRoot } from "./ContextualAudioErrorBoundary";
import { useContextualAudio } from "./ContextualAudioProvider";
import { AudioEnrichmentButton } from "./components/AudioEnrichmentButton";

function Probe() {
  const audio = useContextualAudio();
  return <div>{`inert:${String(!audio.isSupported && audio.state === "idle" && audio.callId === null)}`}</div>;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  // React rethrows boundary-handled errors to window in development; the
  // boundary has already handled it, so it must not fail the test run.
  window.addEventListener("error", (event) => event.preventDefault());
});

describe("CAE.100 global error handling", () => {
  it("keeps the page alive and exposes an inert controller when the provider faults", () => {
    render(
      <MemoryRouter>
        <ContextualAudioRoot>
          <h1>Module content</h1>
          <Probe />
          <AudioEnrichmentButton callId="CAE.COMMERCIAL.ALPHA.001" label="Hear More" showTranscript={false} />
        </ContextualAudioRoot>
      </MemoryRouter>,
    );

    // Page content survived the audio fault.
    expect(screen.getByRole("heading", { name: "Module content" })).toBeInTheDocument();
    // Consumers see the inert controller, so nothing can start speaking.
    expect(screen.getByText("inert:true")).toBeInTheDocument();
    // The affordance renders in its unsupported state rather than crashing.
    expect(screen.getByRole("button", { name: /Hear More/i })).toBeDisabled();
  });
});
