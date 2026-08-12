import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";

const resolveContextualAudioMock = vi.fn();
const authCallbacks: Array<(event: string) => void> = [];

vi.mock("./contextualAudioService", () => ({
  resolveContextualAudio: (...args: unknown[]) => resolveContextualAudioMock(...args),
  caeQueryKey: () => ["cae"],
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (cb: (event: string) => void) => {
        authCallbacks.push(cb);
        return { data: { subscription: { unsubscribe: () => undefined } } };
      },
    },
  },
}));

import { ContextualAudioProvider, useContextualAudio } from "./ContextualAudioProvider";
import { selectVoice, stripSpeechMarkup, prepareSpeechText } from "./speech";

// ---------------------------------------------------------------------------
// SpeechSynthesis test double
// ---------------------------------------------------------------------------

type FakeUtterance = {
  text: string;
  voice: unknown;
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onstart: (() => void) | null;
};

const spoken: FakeUtterance[] = [];
let cancelCount = 0;
let pauseCount = 0;
let resumeCount = 0;
let voiceList: Array<{ name: string; lang: string }> = [];

class FakeUtteranceImpl implements FakeUtterance {
  text: string;
  voice: unknown = null;
  lang = "";
  rate = 1;
  pitch = 1;
  volume = 1;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onstart: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

function installSpeech() {
  spoken.length = 0;
  cancelCount = 0;
  pauseCount = 0;
  resumeCount = 0;
  const listeners: Record<string, Array<() => void>> = {};
  (window as unknown as Record<string, unknown>).SpeechSynthesisUtterance = FakeUtteranceImpl;
  (window as unknown as Record<string, unknown>).speechSynthesis = {
    speak: (u: FakeUtterance) => {
      spoken.push(u);
    },
    cancel: () => {
      cancelCount += 1;
    },
    pause: () => {
      pauseCount += 1;
    },
    resume: () => {
      resumeCount += 1;
    },
    getVoices: () => voiceList,
    addEventListener: (type: string, cb: () => void) => {
      (listeners[type] ??= []).push(cb);
    },
    removeEventListener: () => undefined,
  };
}

function removeSpeech() {
  delete (window as unknown as Record<string, unknown>).SpeechSynthesisUtterance;
  delete (window as unknown as Record<string, unknown>).speechSynthesis;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function payload(callId: string, overrides: Record<string, unknown> = {}) {
  return {
    status: "ok",
    narrative: {
      callId,
      title: `Title for ${callId}`,
      description: null,
      moduleKey: "COMMERCIAL",
      topicKey: "EBITDA",
      audience: "all",
      scopeType: "page",
      scopeReference: null,
    },
    version: {
      versionNo: 1,
      sourceText: "Source.",
      speechText: "<p>EBITDA improved.</p><break time=\"400ms\"/>Good news.",
      transcriptText: "EBITDA improved. Good news.",
      estimatedDurationSeconds: 30,
      publishedAt: "2026-07-27T00:00:00Z",
    },
    speechProfile: {
      profileKey: "executive_explainer",
      displayName: "Executive Explainer",
      locale: "en-US",
      fallbackLocale: "en",
      preferredVoiceNames: ["Samantha"],
      rate: 0.95,
      pitch: 1,
      volume: 1,
    },
    pronunciationRules: [
      { matchText: "EBITDA", matchType: "word", replacementText: "e bit dah", priority: 10 },
    ],
    placement: null,
    ...overrides,
  };
}

let api: ReturnType<typeof useContextualAudio>;

function Probe() {
  api = useContextualAudio();
  return (
    <div>
      <span data-testid="state">{api.state}</span>
      <span data-testid="callId">{api.callId ?? "-"}</span>
      <span data-testid="title">{api.title ?? "-"}</span>
      <span data-testid="duration">{api.estimatedDurationSeconds ?? "-"}</span>
      <span data-testid="transcript">{api.transcript ?? "-"}</span>
      <span data-testid="error">{api.error ?? "-"}</span>
      <span data-testid="supported">{String(api.isSupported)}</span>
      <span data-testid="voice">{api.activeVoiceName ?? "-"}</span>
    </div>
  );
}

function Navigator() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate("/other")}>
      go
    </button>
  );
}

function renderProvider() {
  return render(
    <MemoryRouter initialEntries={["/start"]}>
      <ContextualAudioProvider>
        <Routes>
          <Route
            path="/start"
            element={
              <>
                <Probe />
                <Navigator />
              </>
            }
          />
          <Route path="/other" element={<Probe />} />
        </Routes>
      </ContextualAudioProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  resolveContextualAudioMock.mockReset();
  authCallbacks.length = 0;
  voiceList = [
    { name: "Daniel", lang: "en-GB" },
    { name: "Samantha", lang: "en-US" },
    { name: "Amélie", lang: "fr-FR" },
  ];
  installSpeech();
  window.localStorage.clear();
});

afterEach(() => removeSpeech());

// ---------------------------------------------------------------------------

describe("ContextualAudioProvider state transitions", () => {
  it("1. moves idle → loading → playing → ended and exposes narrative metadata", async () => {
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    renderProvider();

    expect(screen.getByTestId("state").textContent).toBe("idle");

    await act(async () => {
      await api.play("CAE.COMMERCIAL.EBITDA.001");
    });

    expect(screen.getByTestId("state").textContent).toBe("playing");
    expect(screen.getByTestId("callId").textContent).toBe("CAE.COMMERCIAL.EBITDA.001");
    expect(screen.getByTestId("title").textContent).toBe("Title for CAE.COMMERCIAL.EBITDA.001");
    expect(screen.getByTestId("duration").textContent).toBe("30");
    expect(screen.getByTestId("transcript").textContent).toBe("EBITDA improved. Good news.");
    expect(spoken).toHaveLength(1);

    await act(async () => {
      spoken[0].onend?.();
    });
    expect(screen.getByTestId("state").textContent).toBe("ended");
  });

  it("2. supports pause, resume, stop, and restart", async () => {
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    renderProvider();

    await act(async () => {
      await api.play("CAE.COMMERCIAL.EBITDA.001");
    });

    act(() => api.pause());
    expect(screen.getByTestId("state").textContent).toBe("paused");
    expect(pauseCount).toBe(1);

    act(() => api.resume());
    expect(screen.getByTestId("state").textContent).toBe("playing");
    expect(resumeCount).toBe(1);

    act(() => api.stop());
    expect(screen.getByTestId("state").textContent).toBe("ready");
    expect(cancelCount).toBeGreaterThan(0);

    await act(async () => {
      await api.restart();
    });
    expect(screen.getByTestId("state").textContent).toBe("playing");
    expect(spoken).toHaveLength(2);
  });

  it("3. surfaces a clear error state and never speaks on failure", async () => {
    resolveContextualAudioMock.mockResolvedValue({
      status: "unauthorized",
      message: "You do not have access to this narrative.",
    });
    renderProvider();

    await act(async () => {
      await api.play("CAE.COMMERCIAL.EBITDA.001");
    });

    expect(screen.getByTestId("state").textContent).toBe("error");
    expect(screen.getByTestId("error").textContent).toBe(
      "You do not have access to this narrative.",
    );
    expect(spoken).toHaveLength(0);
  });
});

describe("concurrent playback prevention", () => {
  it("4. starting a second narrative stops the first — only one utterance is live", async () => {
    resolveContextualAudioMock.mockImplementation(async (id: string) => payload(id));
    renderProvider();

    await act(async () => {
      await api.play("CAE.COMMERCIAL.EBITDA.001");
    });
    const cancelsAfterFirst = cancelCount;

    await act(async () => {
      await api.play("CAE.PLATFORM.HOME.001");
    });

    expect(cancelCount).toBeGreaterThan(cancelsAfterFirst);
    expect(screen.getByTestId("callId").textContent).toBe("CAE.PLATFORM.HOME.001");
    expect(spoken).toHaveLength(2);
    // The superseded utterance can no longer drive state.
    await act(async () => {
      spoken[0].onend?.();
    });
    expect(screen.getByTestId("state").textContent).toBe("playing");
  });

  it("5. repeated selection of the same narrative restarts instead of overlapping", async () => {
    resolveContextualAudioMock.mockImplementation(async (id: string) => payload(id));
    renderProvider();

    await act(async () => {
      await api.play("CAE.COMMERCIAL.EBITDA.001");
      await api.play("CAE.COMMERCIAL.EBITDA.001");
      await api.play("CAE.COMMERCIAL.EBITDA.001");
    });

    expect(resolveContextualAudioMock).toHaveBeenCalledTimes(1);
    expect(spoken).toHaveLength(3);
    expect(cancelCount).toBeGreaterThanOrEqual(3);
    expect(screen.getByTestId("state").textContent).toBe("playing");
  });
});

describe("lifecycle stop behavior", () => {
  it("6. route change stops playback and clears the controller", async () => {
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    renderProvider();

    await act(async () => {
      await api.play("CAE.COMMERCIAL.EBITDA.001");
    });
    const before = cancelCount;

    await act(async () => {
      screen.getByRole("button", { name: "go" }).click();
    });

    await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("idle"));
    expect(cancelCount).toBeGreaterThan(before);
    expect(screen.getByTestId("callId").textContent).toBe("-");
  });

  it("7. sign out stops playback", async () => {
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    renderProvider();

    await act(async () => {
      await api.play("CAE.COMMERCIAL.EBITDA.001");
    });
    const before = cancelCount;

    await act(async () => {
      authCallbacks.forEach((cb) => cb("SIGNED_OUT"));
    });

    expect(screen.getByTestId("state").textContent).toBe("idle");
    expect(cancelCount).toBeGreaterThan(before);
  });

  it("8. tenant switch stops playback", async () => {
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    renderProvider();

    await act(async () => {
      await api.play("CAE.COMMERCIAL.EBITDA.001");
    });
    const before = cancelCount;

    await act(async () => {
      window.dispatchEvent(new Event("platform:tenant-changed"));
    });

    expect(screen.getByTestId("state").textContent).toBe("idle");
    expect(cancelCount).toBeGreaterThan(before);
  });

  it("9. unmounting the provider cancels active speech", async () => {
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    const view = renderProvider();

    await act(async () => {
      await api.play("CAE.COMMERCIAL.EBITDA.001");
    });
    const before = cancelCount;

    view.unmount();
    expect(cancelCount).toBeGreaterThan(before);
  });
});

describe("browser support fallback", () => {
  it("10. unsupported browsers report isSupported=false and still expose the transcript", async () => {
    removeSpeech();
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    renderProvider();

    expect(screen.getByTestId("supported").textContent).toBe("false");

    await act(async () => {
      await api.play("CAE.COMMERCIAL.EBITDA.001");
    });

    expect(screen.getByTestId("state").textContent).toBe("ready");
    expect(screen.getByTestId("transcript").textContent).toBe("EBITDA improved. Good news.");
    expect(spoken).toHaveLength(0);
  });
});

describe("voice selection and fallback", () => {
  it("11. uses the profile preferred voice when present", async () => {
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    renderProvider();
    await act(async () => {
      await api.play("CAE.COMMERCIAL.EBITDA.001");
    });
    expect(screen.getByTestId("voice").textContent).toBe("Samantha");
  });

  it("12. falls back to locale, then language, then the device default", () => {
    const profile = { locale: "en-US", fallbackLocale: "en", preferredVoiceNames: ["Missing"] };
    const localeOnly = [{ name: "US Voice", lang: "en-US" }] as unknown as SpeechSynthesisVoice[];
    expect(selectVoice(localeOnly, profile)?.name).toBe("US Voice");

    const languageOnly = [{ name: "GB Voice", lang: "en-GB" }] as unknown as SpeechSynthesisVoice[];
    expect(selectVoice(languageOnly, profile)?.name).toBe("GB Voice");

    const foreignOnly = [{ name: "FR Voice", lang: "fr-FR" }] as unknown as SpeechSynthesisVoice[];
    expect(selectVoice(foreignOnly, profile)).toBeNull();
    expect(selectVoice([], profile)).toBeNull();
  });

  it("13. an explicit user preference overrides the profile and playback still works when it is missing", async () => {
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    renderProvider();

    act(() => api.setPreferredVoiceName("Daniel"));
    await act(async () => {
      await api.play("CAE.COMMERCIAL.EBITDA.001");
    });
    expect(screen.getByTestId("voice").textContent).toBe("Daniel");

    act(() => api.setPreferredVoiceName("Nonexistent Voice"));
    await act(async () => {
      await api.restart();
    });
    // Falls back to the profile preferred voice rather than failing.
    expect(screen.getByTestId("voice").textContent).toBe("Samantha");
    expect(screen.getByTestId("state").textContent).toBe("playing");
  });

  it("14. handles asynchronously populated voice lists", async () => {
    voiceList = [];
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    renderProvider();

    // Voices arrive after mount, as real browsers do.
    voiceList = [{ name: "Samantha", lang: "en-US" }];
    await act(async () => {
      await api.play("CAE.COMMERCIAL.EBITDA.001");
    });
    expect(screen.getByTestId("voice").textContent).toBe("Samantha");
  });
});

describe("speech markup handling", () => {
  it("15. never reads markup aloud and applies pronunciation rules", async () => {
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    renderProvider();

    await act(async () => {
      await api.play("CAE.COMMERCIAL.EBITDA.001");
    });

    const text = spoken[0].text;
    expect(text).not.toMatch(/[<>]/);
    expect(text).not.toContain("break");
    expect(text).toContain("e bit dah");

    expect(stripSpeechMarkup('<emphasis level="strong">Hi</emphasis>')).toBe("Hi");
    expect(prepareSpeechText("<p>ARR</p>", [
      { matchText: "ARR", matchType: "word", replacementText: "annual recurring revenue", priority: 1 },
    ])).toContain("annual recurring revenue");
  });
});
