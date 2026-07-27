import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const resolveContextualAudioMock = vi.fn();

vi.mock("../contextualAudioService", () => ({
  resolveContextualAudio: (...args: unknown[]) => resolveContextualAudioMock(...args),
  caeQueryKey: () => ["cae"],
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
    },
  },
}));

import { ContextualAudioProvider } from "../ContextualAudioProvider";
import { AudioEnrichmentButton } from "./AudioEnrichmentButton";
import { AudioPlaybackControls } from "./AudioPlaybackControls";
import { TranscriptPanel } from "./TranscriptPanel";

// --- SpeechSynthesis double --------------------------------------------------

const spoken: Array<{ text: string; onend: (() => void) | null }> = [];
let cancelCount = 0;
let pauseCount = 0;
let resumeCount = 0;

class FakeUtterance {
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
  (window as unknown as Record<string, unknown>).SpeechSynthesisUtterance = FakeUtterance;
  (window as unknown as Record<string, unknown>).speechSynthesis = {
    speak: (u: { text: string; onend: (() => void) | null }) => spoken.push(u),
    cancel: () => {
      cancelCount += 1;
    },
    pause: () => {
      pauseCount += 1;
    },
    resume: () => {
      resumeCount += 1;
    },
    getVoices: () => [{ name: "Samantha", lang: "en-US" }],
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  };
}

function removeSpeech() {
  delete (window as unknown as Record<string, unknown>).SpeechSynthesisUtterance;
  delete (window as unknown as Record<string, unknown>).speechSynthesis;
}

function payload(callId: string) {
  return {
    status: "ok",
    narrative: {
      callId,
      title: `Narrative ${callId}`,
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
      speechText: "Margins improved.",
      transcriptText: "Margins improved this quarter.",
      estimatedDurationSeconds: 45,
      publishedAt: "2026-07-27T00:00:00Z",
    },
    speechProfile: {
      profileKey: "executive_explainer",
      displayName: "Executive Explainer",
      locale: "en-US",
      fallbackLocale: "en",
      preferredVoiceNames: [],
      rate: 1,
      pitch: 1,
      volume: 1,
    },
    pronunciationRules: [],
    placement: null,
  };
}

function renderWithProvider(ui: React.ReactNode) {
  return render(
    <MemoryRouter>
      <ContextualAudioProvider>{ui}</ContextualAudioProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  resolveContextualAudioMock.mockReset();
  installSpeech();
});
afterEach(() => removeSpeech());

// -----------------------------------------------------------------------------

describe("AudioEnrichmentButton states", () => {
  it("1. renders the idle state with the default Hear More label", () => {
    renderWithProvider(<AudioEnrichmentButton callId="CAE.COMMERCIAL.EBITDA.001" />);
    const button = screen.getByRole("button", { name: /Hear More\. Play narration/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Hear More");
    expect(screen.getByRole("status")).toHaveTextContent("Not playing");
  });

  it("2. shows a loading state that blocks duplicate requests", async () => {
    let release: (value: unknown) => void = () => undefined;
    resolveContextualAudioMock.mockImplementation(
      () => new Promise((resolve) => (release = resolve)),
    );
    const user = userEvent.setup();
    renderWithProvider(<AudioEnrichmentButton callId="CAE.COMMERCIAL.EBITDA.001" />);

    await user.click(screen.getByRole("button", { name: /Play narration/i }));

    const loading = screen.getByRole("button", { name: /Loading Hear More narration/i });
    expect(loading).toBeDisabled();
    await user.click(loading).catch(() => undefined);
    expect(resolveContextualAudioMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      release(payload("CAE.COMMERCIAL.EBITDA.001"));
    });
  });

  it("3. transitions idle → playing → paused → resumed and exposes Stop while active", async () => {
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    const user = userEvent.setup();
    renderWithProvider(<AudioEnrichmentButton callId="CAE.COMMERCIAL.EBITDA.001" />);

    await user.click(screen.getByRole("button", { name: /Play narration/i }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Playing narration"));
    expect(screen.getByRole("button", { name: /^Pause narration/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Stop narration/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Pause narration/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Narration paused");
    expect(pauseCount).toBe(1);

    await user.click(screen.getByRole("button", { name: /^Resume narration/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Playing narration");
    expect(resumeCount).toBe(1);

    await user.click(screen.getByRole("button", { name: /^Stop narration/i }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Not playing"));
    expect(cancelCount).toBeGreaterThan(0);
  });

  it("4. renders an unavailable state in plain language for an unknown call ID", async () => {
    resolveContextualAudioMock.mockResolvedValue({
      status: "narrative_not_found",
      message: "No narration exists for this content yet.",
    });
    const user = userEvent.setup();
    renderWithProvider(<AudioEnrichmentButton callId="CAE.COMMERCIAL.MISSING.999" />);

    await user.click(screen.getByRole("button", { name: /Play narration/i }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "No narration exists for this content yet.",
      ),
    );
    // Not colour alone: an icon plus text conveys the failure.
    expect(screen.getByRole("status").querySelector("svg")).toBeTruthy();
  });

  it("5. renders a friendly error state when resolution throws", async () => {
    resolveContextualAudioMock.mockRejectedValue(new Error("boom: pg 500 relation missing"));
    const user = userEvent.setup();
    renderWithProvider(<AudioEnrichmentButton callId="CAE.COMMERCIAL.EBITDA.001" />);

    await user.click(screen.getByRole("button", { name: /Play narration/i }));
    await waitFor(() => expect(screen.getByRole("status").textContent ?? "").toMatch(/not available|could not/i));
    expect(screen.getByRole("status").textContent).not.toMatch(/pg 500/);
  });

  it("6. renders the unsupported browser state and keeps the transcript reachable", async () => {
    removeSpeech();
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    const user = userEvent.setup();
    renderWithProvider(<AudioEnrichmentButton callId="CAE.COMMERCIAL.EBITDA.001" />);

    expect(screen.getByRole("button", { name: /Hear More\. Play narration/i })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(/browser cannot play narration/i);

    await user.click(screen.getByRole("button", { name: /Read transcript/i }));
    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findByText("Margins improved this quarter.")).toBeInTheDocument();
  });
});

describe("transcript access", () => {
  it("7. opens the transcript without starting playback", async () => {
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    const user = userEvent.setup();
    renderWithProvider(<AudioEnrichmentButton callId="CAE.COMMERCIAL.EBITDA.001" />);

    await user.click(screen.getByRole("button", { name: /Read transcript/i }));
    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findByText("Margins improved this quarter.")).toBeInTheDocument();
    expect(spoken).toHaveLength(0);
    expect(screen.getByRole("status")).toHaveTextContent("Not playing");
  });

  it("8. TranscriptPanel is readable standalone and reports duration", () => {
    render(
      <TranscriptPanel
        title="Quarterly summary"
        transcript="Revenue grew."
        estimatedDurationSeconds={95}
        isSpeechUnavailable
      />,
    );
    expect(screen.getByRole("heading", { name: "Quarterly summary" })).toBeInTheDocument();
    expect(screen.getByText("Revenue grew.")).toBeInTheDocument();
    expect(screen.getByText(/1 min 35 sec/)).toBeInTheDocument();
    expect(screen.getByText(/not available in this browser/i)).toBeInTheDocument();
  });
});

describe("concurrent playback across components", () => {
  it("9. starting the second button stops the first — only one is active", async () => {
    resolveContextualAudioMock.mockImplementation(async (id: string) => payload(id));
    const user = userEvent.setup();
    renderWithProvider(
      <>
        <AudioEnrichmentButton callId="CAE.COMMERCIAL.EBITDA.001" label="Hear A" />
        <AudioEnrichmentButton callId="CAE.PLATFORM.HOME.001" label="Hear B" />
      </>,
    );

    await user.click(screen.getByRole("button", { name: /Hear A\. Play narration/i }));
    await waitFor(() =>
      expect(screen.getByTestId("cae-status-CAE.COMMERCIAL.EBITDA.001")).toHaveTextContent(
        "Playing narration",
      ),
    );

    await user.click(screen.getByRole("button", { name: /Hear B\. Play narration/i }));
    await waitFor(() =>
      expect(screen.getByTestId("cae-status-CAE.PLATFORM.HOME.001")).toHaveTextContent(
        "Playing narration",
      ),
    );
    expect(screen.getByTestId("cae-status-CAE.COMMERCIAL.EBITDA.001")).toHaveTextContent(
      "Not playing",
    );
    expect(cancelCount).toBeGreaterThan(0);
  });
});

describe("AudioPlaybackControls", () => {
  it("10. exposes semantic play, pause and stop buttons bound to the shared controller", async () => {
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    const user = userEvent.setup();
    renderWithProvider(
      <AudioPlaybackControls callId="CAE.COMMERCIAL.EBITDA.001" label="EBITDA briefing" />,
    );

    const group = screen.getByRole("group", { name: /Playback controls for EBITDA briefing/i });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Stop EBITDA briefing/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Play EBITDA briefing/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Pause EBITDA briefing/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /Stop EBITDA briefing/i })).toBeEnabled();
  });
});

describe("accessibility contract", () => {
  it("11. is fully keyboard operable with semantic buttons and a live region", async () => {
    resolveContextualAudioMock.mockResolvedValue(payload("CAE.COMMERCIAL.EBITDA.001"));
    const user = userEvent.setup();
    renderWithProvider(<AudioEnrichmentButton callId="CAE.COMMERCIAL.EBITDA.001" />);

    await user.tab();
    const primary = screen.getByRole("button", { name: /Hear More\. Play narration/i });
    expect(primary).toHaveFocus();
    expect(primary.tagName).toBe("BUTTON");
    expect(primary).toHaveAttribute("type", "button");

    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Playing narration"));

    const live = screen.getByRole("status");
    expect(live).toHaveAttribute("aria-live", "polite");

    // Every rendered control has a non-empty accessible name.
    for (const button of screen.getAllByRole("button")) {
      expect((button.getAttribute("aria-label") ?? button.textContent ?? "").trim().length).toBeGreaterThan(0);
    }
  });
});
