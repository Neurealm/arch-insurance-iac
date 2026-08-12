import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Pause, Play, Square } from "lucide-react";
import { useContextualAudio } from "../ContextualAudioProvider";
import { useCaeCallState, type CaeUserState } from "./useCaeCallState";

export type AudioPlaybackControlsProps = {
  callId: string;
  placementId?: string | null;
  /** Accessible name prefix, e.g. the narrative title. */
  label?: string;
  size?: "sm" | "default";
  className?: string;
  disabled?: boolean;
};

/**
 * Transport controls (play / pause / resume / stop) for one call ID.
 *
 * All speech behaviour lives in the global ContextualAudioProvider; this
 * component only renders semantic buttons bound to that single controller.
 */
export function AudioPlaybackControls({
  callId,
  placementId,
  label = "narration",
  size = "sm",
  className,
  disabled = false,
}: AudioPlaybackControlsProps) {
  const audio = useContextualAudio();
  const userState: CaeUserState = useCaeCallState(callId);

  const isBusy = userState === "loading";
  const isPlaying = userState === "playing";
  const isPaused = userState === "paused";
  const isActive = isPlaying || isPaused;
  const blocked = disabled || userState === "unsupported";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={cn("flex items-center gap-2", className)} role="group" aria-label={`Playback controls for ${label}`}>
      {!isPlaying ? (
        <Button
          type="button"
          size={size}
          variant="outline"
          className="min-h-9 gap-2"
          disabled={blocked || isBusy}
          aria-label={isPaused ? `Resume ${label}` : `Play ${label}`}
          onClick={() => (isPaused ? audio.resume() : void audio.play(callId, placementId ?? null))}
        >
          {isBusy ? (
            <Loader2 className={cn(iconSize, "animate-spin")} aria-hidden="true" />
          ) : (
            <Play className={iconSize} aria-hidden="true" />
          )}
          <span>{isBusy ? "Loading" : isPaused ? "Resume" : "Play"}</span>
        </Button>
      ) : (
        <Button
          type="button"
          size={size}
          variant="outline"
          className="min-h-9 gap-2"
          disabled={blocked}
          aria-label={`Pause ${label}`}
          onClick={() => audio.pause()}
        >
          <Pause className={iconSize} aria-hidden="true" />
          <span>Pause</span>
        </Button>
      )}

      <Button
        type="button"
        size={size}
        variant="ghost"
        className="min-h-9 gap-2"
        disabled={blocked || !isActive}
        aria-label={`Stop ${label}`}
        onClick={() => audio.stop()}
      >
        <Square className={iconSize} aria-hidden="true" />
        <span>Stop</span>
      </Button>
    </div>
  );
}

export default AudioPlaybackControls;
