import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioEnrichmentButton } from "../components/AudioEnrichmentButton";
import { AudioPlaybackControls } from "../components/AudioPlaybackControls";
import { TranscriptPanel } from "../components/TranscriptPanel";
import { useContextualAudio } from "../ContextualAudioProvider";

/**
 * Internal development fixture for the CAE component set.
 *
 * Not referenced by any production navigation and registered only when the
 * app runs in development mode.
 */
const SCENARIOS = [
  {
    key: "valid",
    title: "1. Valid narrative playback",
    description: "A published narrative resolves and plays through the global controller.",
    callId: "CAE.COMMERCIAL.EBITDA.001",
  },
  {
    key: "unknown",
    title: "2. Unknown call ID",
    description: "A call ID that does not exist resolves to an unavailable state.",
    callId: "CAE.COMMERCIAL.DOES_NOT_EXIST.999",
  },
  {
    key: "unavailable",
    title: "3. Unavailable narrative",
    description: "A malformed call ID is rejected before any request is made.",
    callId: "CAE.badmodule.topic.1",
  },
] as const;

export default function CaeComponentFixture() {
  const audio = useContextualAudio();
  const [simulateUnsupported, setSimulateUnsupported] = useState(false);

  const supportBanner = useMemo(
    () =>
      audio.isSupported && !simulateUnsupported
        ? "Browser speech synthesis detected."
        : "Browser speech synthesis unavailable — transcript fallback is the primary path.",
    [audio.isSupported, simulateUnsupported],
  );

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Contextual Audio Enrichment — component fixture
        </h1>
        <p className="text-sm text-muted-foreground">
          Internal development harness. Not part of production navigation.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold tracking-tight">Controller state</h2>
          <CardDescription>{supportBanner}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>State: {audio.state}</p>
          <p>Active call ID: {audio.callId ?? "none"}</p>
          <p>Active title: {audio.title ?? "none"}</p>
          <p>Voice: {audio.activeVoiceName ?? "device default"}</p>
        </CardContent>
      </Card>

      {SCENARIOS.map((scenario) => (
        <Card key={scenario.key}>
          <CardHeader>
            <h2 className="text-base font-semibold tracking-tight">{scenario.title}</h2>
            <CardDescription>
              {scenario.description} ({scenario.callId})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AudioEnrichmentButton callId={scenario.callId} />
            <AudioPlaybackControls callId={scenario.callId} label={scenario.title} />
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold tracking-tight">4. Unsupported browser state</h2>
          <CardDescription>
            Removes SpeechSynthesis from this window to exercise the fallback path. Reload to
            restore.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => {
              delete (window as unknown as Record<string, unknown>).speechSynthesis;
              setSimulateUnsupported(true);
            }}
          >
            Simulate unsupported browser
          </Button>
          <TranscriptPanel
            title="Unsupported browser fallback"
            transcript={audio.transcript ?? "Load a narrative above to see its transcript here."}
            isSpeechUnavailable={simulateUnsupported || !audio.isSupported}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold tracking-tight">5. Concurrent playback attempt</h2>
          <CardDescription>
            Two buttons target different narratives. Starting either one stops the other.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <AudioEnrichmentButton callId="CAE.COMMERCIAL.EBITDA.001" label="Hear More (A)" />
          <AudioEnrichmentButton callId="CAE.PLATFORM.HOME.001" label="Hear More (B)" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold tracking-tight">6. Transcript access without playback</h2>
          <CardDescription>
            The transcript button resolves text independently of the speech controller.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AudioEnrichmentButton
            callId="CAE.RUNOPS.SERVICE_HEALTH.001"
            label="Hear More"
            displayVariant="compact"
          />
        </CardContent>
      </Card>
    </main>
  );
}
