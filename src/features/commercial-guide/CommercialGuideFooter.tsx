import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Compass } from "lucide-react";
import { useCommercialGuide } from "./CommercialGuideProvider";

export function CommercialGuideFooter() {
  const { reviewed, setReviewed, bookmarks, announce, startWalkthrough } = useCommercialGuide();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-5 py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{bookmarks.length} bookmark{bookmarks.length === 1 ? "" : "s"}</Badge>
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
