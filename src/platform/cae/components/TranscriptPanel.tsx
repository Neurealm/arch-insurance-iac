import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

export type TranscriptPanelProps = {
  title?: string | null;
  transcript: string | null;
  estimatedDurationSeconds?: number | null;
  /** Shown when the browser cannot speak, so the text is the primary content. */
  isSpeechUnavailable?: boolean;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  /** Heading id, so a dialog or region can be labelled by it. */
  headingId?: string;
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs} sec`;
  return `${mins} min ${secs.toString().padStart(2, "0")} sec`;
}

/**
 * Readable transcript for a contextual narrative.
 *
 * Purely presentational: it never speaks, never resolves, and can therefore be
 * used for accessibility fallback, unsupported browsers, or side-by-side
 * reading while audio plays elsewhere.
 */
export function TranscriptPanel({
  title,
  transcript,
  estimatedDurationSeconds,
  isSpeechUnavailable = false,
  isLoading = false,
  error = null,
  className,
  headingId,
}: TranscriptPanelProps) {
  return (
    <section
      className={cn("space-y-3", className)}
      aria-labelledby={headingId}
      aria-busy={isLoading || undefined}
    >
      <header className="flex flex-wrap items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2 id={headingId} className="text-sm font-semibold text-foreground">
          {title?.trim() ? title : "Transcript"}
        </h2>
        {typeof estimatedDurationSeconds === "number" && estimatedDurationSeconds > 0 && (
          <span className="text-xs text-muted-foreground">
            Estimated listening time {formatDuration(estimatedDurationSeconds)}
          </span>
        )}
      </header>

      {isSpeechUnavailable && (
        <p className="rounded-md border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
          Spoken narration is not available in this browser. The full text is provided below.
        </p>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading transcript…</p>}

      {!isLoading && error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && (
        <div className="max-h-[50vh] overflow-y-auto pr-1">
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
            {transcript?.trim() ? transcript : "No transcript is available for this narration."}
          </p>
        </div>
      )}
    </section>
  );
}

export default TranscriptPanel;
