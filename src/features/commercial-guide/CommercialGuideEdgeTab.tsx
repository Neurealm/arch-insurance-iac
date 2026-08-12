import { BookOpen } from "lucide-react";
import { useCommercialGuide } from "./CommercialGuideProvider";

/**
 * Persistent right-edge trigger for the Commercial Guide drawer.
 * Purely a second entry point — it reuses the same drawer state.
 */
export function CommercialGuideEdgeTab() {
  const { guide, open, setOpen, walkthroughIndex } = useCommercialGuide();
  if (!guide || open || walkthroughIndex !== null) return null;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-haspopup="dialog"
      aria-label={`Open ${guide.guideTitle}`}
      className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-2 rounded-l-md border border-r-0 border-primary/30 bg-primary px-2 py-3 text-primary-foreground shadow-lg transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex print:hidden"
    >
      <span className="flex flex-col items-center gap-2">
        <BookOpen className="h-4 w-4" aria-hidden />
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ writingMode: "vertical-rl" }}
        >
          Guide
        </span>
      </span>
    </button>
  );
}
