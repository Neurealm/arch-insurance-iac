import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RelatedPageGuide } from "./types";
import { GuidePending } from "./CommercialGuideSection";

export function CommercialGuideRelatedPages({
  pages,
  onNavigate,
}: {
  pages: RelatedPageGuide[];
  onNavigate?: () => void;
}) {
  if (pages.length === 0) return <GuidePending label="Related pages pending validation" />;
  return (
    <ul className="space-y-1">
      {pages.map((p) => (
        <li key={p.pageId}>
          <Link
            to={p.route}
            onClick={onNavigate}
            className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted"
          >
            <span className="min-w-0 truncate">{p.label}</span>
            <span className="flex shrink-0 items-center gap-1.5">
              <Badge variant="outline" className="text-[10px]">{p.relationship}</Badge>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
