import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { planStatusTone } from "../../remediationPresentation";
import {
  FIXTURE_EVIDENCE_LABEL,
  REPOSITORY_EVIDENCE_LABEL,
  type ReviewPackage,
} from "../../review/reviewPackage";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  blocked: "Blocked",
  "ready-for-review": "Ready for review",
};

/**
 * Stage 3.5.4.4 — executive review summary.
 *
 * The conclusion is derived only from the canonical plan status. No count on
 * this card can promote or demote the engine's verdict.
 */
export function ReviewSummaryCard({ pkg }: { pkg: ReviewPackage }) {
  const s = pkg.summary;
  return (
    <Card data-testid="review-summary" data-status={s.planStatus} data-evidence={s.evidenceSource}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base" id="review-summary-heading">
            Review summary
          </CardTitle>
          <StatusBadge
            value={s.planStatus}
            tone={planStatusTone(s.planStatus)}
            label={`Plan status: ${STATUS_LABEL[s.planStatus] ?? s.planStatus}`}
          />
          <StatusBadge
            value={s.evidenceSource}
            tone={s.evidenceSource === "real-graph" ? "info" : "warning"}
            label={s.evidenceSource === "real-graph" ? REPOSITORY_EVIDENCE_LABEL : FIXTURE_EVIDENCE_LABEL}
          />
          <StatusBadge value="read-only" tone="neutral" label="Read only — no approval decision is recorded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs text-muted-foreground">
        <p className="text-sm text-foreground" data-testid="readiness-conclusion">
          {s.conclusion}
        </p>

        <dl className="grid gap-x-6 gap-y-1 md:grid-cols-2" data-testid="review-summary-facts">
          <Fact label="Plan" value={s.planId} mono />
          <Fact label="Simulation" value={s.simulationId} mono />
          <Fact label="Canonical graph hash" value={s.canonicalGraphHash} mono />
          <Fact label="Overlay hash" value={s.overlayHash} mono />
          <Fact label="Recommendation" value={s.recommendationTitle ?? s.recommendationId ?? "Not recorded"} />
          <Fact label="Proposal" value={s.proposalId ?? "Not recorded"} mono />
          <Fact label="Workstreams" value={String(s.workstreamCount)} />
          <Fact label="Execution steps" value={String(s.stepCount)} />
          <Fact label="Patch specifications" value={String(s.patchCount)} />
          <Fact label="Blockers" value={String(s.blockerCount)} />
          <Fact
            label="Artifact mappings"
            value={`${s.mapping.resolved} resolved / ${s.mapping.unresolved} unresolved of ${s.mapping.total}${
              s.mapping.completenessPercent === null ? "" : ` (${s.mapping.completenessPercent}% complete)`
            }`}
          />
          <Fact
            label="Approvals"
            value={`${s.approval.resolved} resolved / ${s.approval.unresolved} unresolved of ${s.approval.total} (${s.approval.blocking} blocking)`}
          />
          <Fact
            label="Validation"
            value={`${s.validation.total} checkpoints, ${s.validation.blocking} blocking, ${s.validation.withCommand} with a repository command`}
          />
          <Fact label="Rollback" value={s.rollback.label} />
          <Fact label="Highest risk" value={s.highestRisk} />
          <Fact
            label="Readiness gates"
            value={`${pkg.gateSummary.passed} passed, ${pkg.gateSummary.blocked} blocked, ${pkg.gateSummary.warning} warning, ${pkg.gateSummary.notApplicable} not applicable`}
          />
        </dl>

        <p>
          The canonical plan status is authoritative. The gate matrix below summarises the engine's
          result; it never overrides it.
        </p>

        {s.recommendationId && (
          <p>
            <Link
              className="underline underline-offset-2"
              to={`/platform/capability-intelligence/recommendations?recommendation=${encodeURIComponent(s.recommendationId)}`}
              data-testid="link-source-recommendation"
            >
              Open the source recommendation
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1">
      <dt className="font-medium text-foreground">{label}:</dt>
      <dd className={mono ? "font-mono text-[11px]" : undefined}>{value}</dd>
    </div>
  );
}
