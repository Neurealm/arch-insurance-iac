/**
 * CAE.100 — global integration validation.
 *
 * These tests exercise the capability the way the application mounts it:
 * boundary -> provider -> routed pages, with the shared components consumed
 * from the public module surface (`@/platform/cae`).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";

const resolveMock = vi.fn();
vi.mock("./contextualAudioService", () => ({
  resolveContextualAudio: (...args: unknown[]) => resolveMock(...args),
}));

const authCallbacks: Array<(event: string) => void> = [];
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (cb: (event: string) => void) => {
        authCallbacks.push(cb);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
  },
}));

import { ContextualAudioProvider, useContextualAudio } from "./ContextualAudioProvider";
import { ContextualAudioErrorBoundary } from "./ContextualAudioErrorBoundary";
import { AudioEnrichmentButton } from "./components/AudioEnrichmentButton";
import { CAE_FLAG_STORAGE_KEY } from "./featureFlags";

// --- speech engine double ---------------------------------------------------
let spoken: string[] = [];
let cancelCount = 0;
let liveUtterances: Array<{ onstart?: () => void; onend?: () => void }> = [];

class FakeUtterance {
  text: string;
  rate = 1; pitch = 1; volume = 1; lang = "en-US"; voice: unknown = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) { this.text = text; }
}

function installSpeech() {
  spoken = []; cancelCount = 0; liveUtterances = [];
  const synth = {
    speaking: false,
    paused: false,
    speak(u: FakeUtterance) {
      spoken.push(u.text);
      liveUtterances.push(u as never);
      synth.speaking = true;
      u.onstart?.();
    },
    cancel() { cancelCount += 1; synth.speaking = false; },
    pause() { synth.paused = true; },
    resume() { synth.paused = false; },
    getVoices: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true, writable: true });
  Object.defineProperty(window, "SpeechSynthesisUtterance", { value: FakeUtterance, configurable: true, writable: true });
  return synth;
}

function okPayload(callId: string, title: string) {
  return {
    status: "ok" as const,
    narrative: { callId, title, description: null, moduleKey: "COMMERCIAL", topicKey: "T", audience: "all", scopeType: "page" },
    version: {
      versionNumber: 1,
      sourceText: `${title} source`,
      speechText: `${title} spoken`,
      transcriptText: `${title} transcript`,
      estimatedDurationSeconds: 12,
    },
    speechProfile: { rate: 1, pitch: 1, volume: 1, locale: "en-US", voiceHint: null },
    pronunciationRules: [],
    placement: null,
  };
}

function Page({ callIds }: { callIds: string[] }) {
  const navigate = useNavigate();
  return (
    <div>
      {callIds.map((id) => (
        <AudioEnrichmentButton key={id} callId={id} label={`Hear ${id}`} showTranscript={false} />
      ))}
      <button type="button" onClick={() => navigate("/other")}>Go elsewhere</button>
    </div>
  );
}

/** A module that ships no audio placements at all. */
function PlainModule() {
  return <div>Plain module content</div>;
}

function renderApp(initial = "/one") {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <ContextualAudioErrorBoundary>
        <ContextualAudioProvider>
          <Routes>
            <Route path="/one" element={<Page callIds={["CAE.COMMERCIAL.ALPHA.001", "CAE.COMMERCIAL.BETA.002"]} />} />
            <Route path="/other" element={<PlainModule />} />
          </Routes>
        </ContextualAudioProvider>
      </ContextualAudioErrorBoundary>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  installSpeech();
  resolveMock.mockReset();
  resolveMock.mockImplementation(async (callId: string) => okPayload(callId, callId));
  window.localStorage.clear();
  authCallbacks.length = 0;
});

afterEach(() => { vi.restoreAllMocks(); });

describe("CAE.100 global integration", () => {
  it("1. plays audio from an isolated fixture through the global provider", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: /Hear CAE\.COMMERCIAL\.ALPHA\.001/i }));
    await waitFor(() => expect(spoken).toHaveLength(1));
    expect(spoken[0]).toContain("spoken");
  });

  it("2. only one narrative can play, even across buttons and routes", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: /Hear CAE\.COMMERCIAL\.ALPHA\.001/i }));
    await waitFor(() => expect(spoken).toHaveLength(1));

    await user.click(screen.getByRole("button", { name: /Hear CAE\.COMMERCIAL\.BETA\.002/i }));
    await waitFor(() => expect(spoken).toHaveLength(2));
    // the first narrative was hard-stopped before the second started
    expect(cancelCount).toBeGreaterThan(0);
    expect(window.speechSynthesis.speaking).toBe(true);

    const before = cancelCount;
    await user.click(screen.getByRole("button", { name: /Go elsewhere/i }));
    await screen.findByText("Plain module content");
    // route change cancelled the active utterance and nothing new started
    expect(cancelCount).toBeGreaterThan(before);
    expect(spoken).toHaveLength(2);
  });

  it("3. provider cleanup runs on sign out and on unmount", async () => {
    const user = userEvent.setup();
    const view = renderApp();
    await user.click(screen.getByRole("button", { name: /Hear CAE\.COMMERCIAL\.ALPHA\.001/i }));
    await waitFor(() => expect(spoken).toHaveLength(1));

    const afterPlay = cancelCount;
    await act(async () => { authCallbacks.forEach((cb) => cb("SIGNED_OUT")); });
    expect(cancelCount).toBeGreaterThan(afterPlay);

    const afterSignOut = cancelCount;
    view.unmount();
    expect(cancelCount).toBeGreaterThan(afterSignOut);
  });

  it("4. a module with no audio placements renders unaffected and issues no requests", async () => {
    render(
      <MemoryRouter initialEntries={["/other"]}>
        <ContextualAudioErrorBoundary>
          <ContextualAudioProvider>
            <Routes><Route path="/other" element={<PlainModule />} /></Routes>
          </ContextualAudioProvider>
        </ContextualAudioErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByText("Plain module content")).toBeInTheDocument();
    expect(resolveMock).not.toHaveBeenCalled();
    expect(spoken).toHaveLength(0);
  });

  it("5. unauthorized or cross-tenant resolutions never speak", async () => {
    resolveMock.mockResolvedValue({ status: "unauthorized", message: "Not available for your access level." });
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: /Hear CAE\.COMMERCIAL\.ALPHA\.001/i }));
    await waitFor(() => expect(resolveMock).toHaveBeenCalled());
    expect(spoken).toHaveLength(0);
    // the client never supplies tenant or user identity: only call id + placement
    expect(resolveMock).toHaveBeenCalledWith("CAE.COMMERCIAL.ALPHA.001", null);
  });

  it("6. the feature flag removes every audio affordance without breaking pages", () => {
    window.localStorage.setItem(CAE_FLAG_STORAGE_KEY, "false");
    renderApp();
    expect(screen.queryByRole("button", { name: /Hear CAE/i })).toBeNull();
    expect(screen.getByRole("button", { name: /Go elsewhere/i })).toBeInTheDocument();
  });

  it("7. a fault inside the audio subtree degrades to an inert controller, not a crash", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    let shouldThrow = true;
    function Exploding() {
      if (shouldThrow) { shouldThrow = false; throw new Error("audio subtree fault"); }
      return <ConsumerProbe />;
    }
    function ConsumerProbe() {
      const audio = useContextualAudio();
      return <div>{`inert:${String(!audio.isSupported && audio.state === "idle")}`}</div>;
    }
    render(
      <MemoryRouter>
        <ContextualAudioErrorBoundary>
          <ContextualAudioProvider>
            <Exploding />
          </ContextualAudioProvider>
        </ContextualAudioErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByText("inert:true")).toBeInTheDocument();
    spy.mockRestore();
  });
});
