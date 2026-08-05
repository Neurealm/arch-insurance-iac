import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, type StatusTone } from "@/platform/components/StatusBadge";
import { BoundedList } from "../remediation/BoundedList";
import type { BlockerAnalysis, BlockerSeverity } from "../../review/reviewPackage";

const SEVERITY_TONE: Record<BlockerSeverity, StatusTone> = {
  critical: "critical",
  high: "warning",
  medium: "info",
};

/**
 * Stage 3.5.4.4 — structured blocker analysis.
 *
 * Grouped by canonical blocker kind, bounded per group, and expanded
 * independently: opening one category never opens another. Individual blockers
 * are never announced — the concise workflow summary already covers that.
 */
export function BlockerAnalysisPanel({ analysis }: { analysis: BlockerAnalysis }) {
  return (
    <Card
      data-testid="blocker-analysis"
      data-total={analysis.totalBlockers}
      data-categories={analysis.totalCategories}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm" id="blocker-analysis-heading">
          Blocker analysis ({analysis.totalBlockers})
        </CardTitle>
        <p className="text-xs text-muted-foreground" data-testid="blocker-total">

          {analysis.totalBlockers} blocker{analysis.totalBlockers === 1 ? "" : "s"} across{" "}
          {analysis.totalCategories} categor{analysis.totalCategories === 1 ? "y" : "ies"}. Highest
          severity: {analysis.highestSeverity ?? "none"}. Dominant categor
          {analysis.dominantKinds.length === 1 ? "y" : "ies"}:{" "}
          {analysis.dominantKinds.length > 0 ? analysis.dominantKinds.join(", ") : "none"}.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis.groups.length === 0 && (
          <p className="text-xs text-muted-foreground" data-testid="blocker-analysis-empty">
            This plan carries no blocker.
          </p>
        )}
        {analysis.groups.map((group) => (
          <section
            key={group.kind}
            aria-labelledby={`blocker-group-${group.kind}`}
            data-testid={`blocker-group-${group.kind}`}
            data-count={group.count}
            className="rounded border border-border p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h4 id={`blocker-group-${group.kind}`} className="text-xs font-semibold text-foreground">
                {group.kind}
              </h4>
              <StatusBadge
                value={group.severity}
                tone={SEVERITY_TONE[group.severity]}
                label={`Severity: ${group.severity}`}
              />
              <StatusBadge value="count" tone="neutral" label={`${group.count} blocker(s)`} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{group.explanation}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Required resolution:</span>{" "}
              {group.requiredResolution}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Affects {group.affectedWorkstreamIds.length} workstream(s),{" "}
              {group.affectedStepIds.length} step(s), {group.affectedPatchIds.length} patch(es) and{" "}
              {group.affectedArtifacts.length} artifact(s).
            </p>
            <div className="mt-2">
              <BoundedList
                items={group.blockers}
                label={`${group.kind} blockers`}
                testId={`blocker-list-${group.kind}`}
                keyFor={(b) => b.id}
                renderItem={(b) => (
                  <div className="text-xs text-muted-foreground" data-testid="review-blocker">
                    <span className="font-mono text-[11px]">{b.id}</span> — {b.statement}
                  </div>
                )}
              />
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
