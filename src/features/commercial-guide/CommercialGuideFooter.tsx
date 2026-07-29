import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Compass, ChevronLeft, ChevronRight } from "lucide-react";
import { useCommercialGuide } from "./CommercialGuideProvider";
import { COMMERCIAL_GUIDE_REGISTRY } from "./content";

export function CommercialGuideFooter() {
  const { guide, reviewed, setReviewed, bookmarks, announce, startWalkthrough } = useCommercialGuide();
  const navigate = useNavigate();

  const index = guide ? COMMERCIAL_GUIDE_REGISTRY.findIndex((g) => g.pageId === guide.pageId) : -1;
  const previous = index > 0 ? COMMERCIAL_GUIDE_REGISTRY[index - 1] : null;
  const next =
    index >= 0 && index < COMMERCIAL_GUIDE_REGISTRY.length - 1
      ? COMMERCIAL_GUIDE_REGISTRY[index + 1]
      : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-5 py-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{bookmarks.length} bookmark{bookmarks.length === 1 ? "" : "s"}</Badge>
        <nav aria-label="Guide navigation" className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={!previous}
            aria-label={previous ? `Previous guide: ${previous.pageTitle}` : "No previous guide"}
            onClick={() => {
              if (!previous) return;
              navigate(previous.route);
              announce(`Opened ${previous.pageTitle} guide.`);
            }}
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" aria-hidden />
            Previous
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!next}
            aria-label={next ? `Next guide: ${next.pageTitle}` : "No next guide"}
            onClick={() => {
              if (!next) return;
              navigate(next.route);
              announce(`Opened ${next.pageTitle} guide.`);
            }}
          >
            Next
            <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden />
          </Button>
        </nav>
        <span className="hidden sm:inline">Session only — resets on refresh.</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={startWalkthrough}>
          <Compass className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Start walkthrough
        </Button>
        <Button
          size="sm"
          variant={reviewed ? "secondary" : "default"}
          aria-pressed={reviewed}
          onClick={() => {
            const next = !reviewed;
            setReviewed(next);
            announce(next ? "Guide marked as reviewed." : "Review mark removed.");
          }}
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          {reviewed ? "Reviewed" : "Mark as Reviewed"}
        </Button>
      </div>
    </div>
  );
}
