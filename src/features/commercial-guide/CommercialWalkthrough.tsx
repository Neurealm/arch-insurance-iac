import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, BookOpen } from "lucide-react";
import { useCommercialGuide } from "./CommercialGuideProvider";

/** Lightweight in-app walkthrough over existing `data-guide-target` sections. */
export function CommercialWalkthrough() {
  const { guide, walkthroughIndex, moveWalkthrough, exitWalkthrough, setOpen } = useCommercialGuide();
  if (!guide || walkthroughIndex === null) return null;

  const targets = guide.showOnPageTargets;
  const step = targets[walkthroughIndex];
  if (!step) return null;

  return (
    <div
      role="dialog"
      aria-label="Page walkthrough"
      className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,32rem)] -translate-x-1/2 rounded-lg border border-border bg-card p-4 shadow-lg"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Step {walkthroughIndex + 1} of {targets.length}
      </p>
      <h2 className="mt-0.5 text-sm font-semibold text-foreground">{step.label}</h2>
      {step.description && <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => moveWalkthrough(-1)}
            disabled={walkthroughIndex === 0}
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" aria-hidden />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => moveWalkthrough(1)}
            disabled={walkthroughIndex === targets.length - 1}
          >
            Next
            <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              exitWalkthrough();
              setOpen(true);
            }}
          >
            <BookOpen className="mr-1 h-3.5 w-3.5" aria-hidden />
            Open Guide
          </Button>
          <Button variant="ghost" size="sm" onClick={exitWalkthrough}>
            <X className="mr-1 h-3.5 w-3.5" aria-hidden />
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
}
