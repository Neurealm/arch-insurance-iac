/**
 * Stage 3.5.4.2 — the single cross-screen entry point into the Graph Explorer.
 *
 * Rendered from the Capability Explorer table, the Entity Drawer and the
 * Recommendation Center. It is a router `Link`, not a full navigation, so the
 * Capability Intelligence provider stays mounted and `analyzeGraph()` is not
 * re-executed.
 */

import { Link } from "react-router-dom";
import { Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { exploreRelationshipsLabel, graphExplorerLink } from "../graph/exploreLink";

export function ExploreRelationshipsLink({
  nodeId,
  entityLabel,
  variant = "button",
  className,
  linkText,
}: {
  nodeId: string;
  entityLabel?: string;
  variant?: "button" | "inline";
  className?: string;
  /** Optional visible text override, e.g. "Explore from X, plus 6 …". */
  linkText?: string;
}) {
  return (
    <Link
      to={graphExplorerLink(nodeId)}
      data-testid="explore-relationships"
      data-node-id={nodeId}
      aria-label={exploreRelationshipsLabel(entityLabel)}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex items-center gap-1.5 rounded text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variant === "button" && "border border-border px-2 py-1 hover:bg-muted",
        className,
      )}
    >
      <Network aria-hidden="true" className="h-3.5 w-3.5" />
      <span>{linkText ?? "Explore relationships"}</span>
    </Link>
  );
}
