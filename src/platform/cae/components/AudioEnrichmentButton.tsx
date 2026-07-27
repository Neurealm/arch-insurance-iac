import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  FileText,
  Headphones,
  Loader2,
  Pause,
  Play,
  Square,
  VolumeX,
} from "lucide-react";
import { useContextualAudio } from "../ContextualAudioProvider";
import { resolveContextualAudio } from "../contextualAudioService";
import { TranscriptPanel } from "./TranscriptPanel";
import { friendlyCaeMessage, useCaeCallState, type CaeUserState } from "./useCaeCallState";

export type AudioEnrichmentDisplayVariant = "default" | "outline" | "ghost" | "compact";

export type AudioEnrichmentButtonProps = {
  callId: string;
  placementId?: string | null;
  label?: string;
  displayVariant?: AudioEnrichmentDisplayVariant;
  showTranscript?: boolean;
  disabled?: boolean;
  className?: string;
};

const STATE_TEXT: Record<CaeUserState, string> = {
  idle: "Not playing",
  loading: "Loading narration",
  playing: "Playing narration",
  paused: "Narration paused",
  unavailable: "Narration unavailable",
  error: "Narration error",
  unsupported: "Narration not supported in this browser",
};

function buttonVariant(variant: AudioEnrichmentDisplayVariant) {
  if (variant === "compact") return "ghost" as const;
  return variant;
}

/**
 * Reusable "Hear More" affordance.
 *
 * Contains no speech logic of its own: play, pause, resume and stop are all
 * delegated to the single global ContextualAudioProvider, which guarantees
 * that only one narrative can ever play across NeuGAIN.io.
 */
export function AudioEnrichmentButton({
  callId,
  placementId,
  label = "Hear More",
  displayVariant = "outline",
  showTranscript = true,
  disabled = false,
  className,
}: AudioEnrichmentButtonProps) {
  const audioEnabled = useContextualAudioEnabled();
  const audio = useContextualAudio();

  const userState = useCaeCallState(callId);
  const headingId = useId();

  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<{
    title: string | null;
    text: string | null;
    durationSeconds: number | null;
  } | null>(null);
  const fetchedRef = useRef(false);

  const isMine = audio.callId === callId;
  const isLoading = userState === "loading";
  const isPlaying = userState === "playing";
  const isPaused = userState === "paused";
  const isActive = isPlaying || isPaused;
  const isUnsupported = userState === "unsupported";
  const statusMessage = friendlyCaeMessage(userState, isMine ? audio.error : null);
  const compact = displayVariant === "compact";

  // Transcript resolution is independent of playback so reading never
  // interrupts audio that another component started.
  const loadTranscript = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setTranscriptLoading(true);
    setTranscriptError(null);
    try {
      const result = await resolveContextualAudio(callId, placementId ?? null);
      if (result.status === "ok") {
        setTranscript({
          title: result.narrative.title,
          text: result.version.transcriptText,
          durationSeconds: result.version.estimatedDurationSeconds,
        });
      } else {
        setTranscriptError(result.message);
      }
    } catch {
      setTranscriptError("We could not load the transcript. Please try again.");
    } finally {
      setTranscriptLoading(false);
    }
  }, [callId, placementId]);

  useEffect(() => {
    fetchedRef.current = false;
    setTranscript(null);
    setTranscriptError(null);
  }, [callId, placementId]);

  // Reuse the already resolved payload when this button owns it.
  useEffect(() => {
    if (!transcriptOpen) return;
    if (isMine && audio.resolved) {
      fetchedRef.current = true;
      setTranscript({
        title: audio.resolved.narrative.title,
        text: audio.resolved.version.transcriptText,
        durationSeconds: audio.resolved.version.estimatedDurationSeconds,
      });
      return;
    }
    void loadTranscript();
  }, [transcriptOpen, isMine, audio.resolved, loadTranscript]);

  const primaryDisabled = disabled || isLoading || isUnsupported;

  const handlePrimary = () => {
    if (primaryDisabled) return;
    if (isPlaying) {
      audio.pause();
      return;
    }
    if (isPaused) {
      audio.resume();
      return;
    }
    void audio.play(callId, placementId ?? null);
  };

  const primaryLabel = isLoading
    ? "Loading"
    : isPlaying
      ? "Pause"
      : isPaused
        ? "Resume"
        : label;

  const primaryAccessibleName = isLoading
    ? `Loading ${label} narration`
    : isPlaying
      ? `Pause narration: ${audio.title ?? label}`
      : isPaused
        ? `Resume narration: ${audio.title ?? label}`
        : `${label}. Play narration`;

  const PrimaryIcon = isLoading ? Loader2 : isPlaying ? Pause : isPaused ? Play : Headphones;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        type="button"
        variant={buttonVariant(displayVariant)}
        size={compact ? "sm" : "default"}
        className="min-h-11 gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={handlePrimary}
        disabled={primaryDisabled}
        aria-label={primaryAccessibleName}
        aria-busy={isLoading || undefined}
        data-cae-state={userState}
      >
        {isUnsupported ? (
          <VolumeX className="h-4 w-4" aria-hidden="true" />
        ) : (
          <PrimaryIcon className={cn("h-4 w-4", isLoading && "animate-spin")} aria-hidden="true" />
        )}
        <span>{isUnsupported ? label : primaryLabel}</span>
      </Button>

      {isActive && (
        <Button
          type="button"
          variant="ghost"
          size={compact ? "sm" : "default"}
          className="min-h-11 gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => audio.stop()}
          aria-label={`Stop narration: ${audio.title ?? label}`}
        >
          <Square className="h-4 w-4" aria-hidden="true" />
          <span>Stop</span>
        </Button>
      )}

      {showTranscript && (
        <Button
          type="button"
          variant="ghost"
          size={compact ? "sm" : "default"}
          className="min-h-11 gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => setTranscriptOpen(true)}
          disabled={disabled}
          aria-label={`Read transcript: ${label}`}
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          <span>Transcript</span>
        </Button>
      )}

      {/* Status is text, never colour alone, and is announced politely. */}
      <span
        role="status"
        aria-live="polite"
        className={cn(
          "inline-flex items-center gap-1 text-xs",
          userState === "error" || userState === "unavailable"
            ? "text-destructive"
            : "text-muted-foreground",
        )}
        data-testid={`cae-status-${callId}`}
      >
        {(userState === "error" || userState === "unavailable") && (
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {statusMessage ?? STATE_TEXT[userState]}
      </span>

      <Dialog open={transcriptOpen} onOpenChange={setTranscriptOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Narration transcript</DialogTitle>
            <DialogDescription>
              The full text of this narration, readable without audio.
            </DialogDescription>
          </DialogHeader>
          <TranscriptPanel
            headingId={headingId}
            title={transcript?.title ?? audio.title ?? label}
            transcript={transcript?.text ?? null}
            estimatedDurationSeconds={transcript?.durationSeconds ?? null}
            isSpeechUnavailable={isUnsupported}
            isLoading={transcriptLoading}
            error={transcriptError}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AudioEnrichmentButton;
