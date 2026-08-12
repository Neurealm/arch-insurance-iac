/**
 * Stage 3.5.4.4 — Change Review Readiness and Approval Requirements.
 *
 * Screen 5. Read-only, session-local and presentation-only.
 *
 * What this screen does: it explains whether the current change-plan preview is
 * ready to enter a formal review, and exactly what stands in the way.
 *
 * What it deliberately does not do: it records no approval decision, offers no
 * approve, reject, waive, execute or apply control, resolves no artifact
 * mapping, assigns no person to a role, persists nothing, writes nothing to
 * Supabase or the repository, and never mutates the canonical graph.
 *
 * It also runs no engine. "Prepare review package" constructs a presentation
 * model over results the Remediation Workspace already produced; it never
 * regenerates a proposal, re-validates, re-simulates or builds a second plan.
 */

import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { EmptyState } from "@/platform/components/States";
import { useCapabilityIntelligence } from "../CapabilityIntelligenceProvider";
import {
  RECOMMENDATION_PARAM,
  RemediationWorkspaceProvider,
  useOptionalRemediationWorkspace,
  useRemediationWorkspace,
} from "../RemediationWorkspaceProvider";
import {
  buildReviewPackage,
  NO_PACKAGE_MESSAGE,
  REVIEW_PACKAGE_PREPARED_ANNOUNCEMENT,
  REVIEW_READ_ONLY_NOTICE,
  type ReviewPackage,
} from "../review/reviewPackage";
import { ReviewSummaryCard } from "../components/review/ReviewSummaryCard";
import { GateMatrixTable } from "../components/review/GateMatrixTable";
import { BlockerAnalysisPanel } from "../components/review/BlockerAnalysisPanel";
import { ArtifactMappingPanel } from "../components/review/ArtifactMappingPanel";
import { ApprovalMatrixPanel } from "../components/review/ApprovalMatrixPanel";
import { EvidencePackagePanel } from "../components/review/EvidencePackagePanel";
import {
  RollbackReadinessPanel,
  ValidationReadinessPanel,
} from "../components/review/ValidationRollbackPanel";
import {
  PatchReviewPanel,
  WorkstreamReviewPanel,
} from "../components/review/PatchWorkstreamPanel";

import { remediationLink } from "../review/reviewLink";


/**
 * The remediation route group mounts one shared provider. This screen still
 * tolerates being rendered without it (a direct unit render, for example) by
 * mounting its own — but it never mounts a second one on top of an existing
 * session, which would fork the state the whole stage depends on.
 */
export default function ChangeReviewReadiness() {
  const existing = useOptionalRemediationWorkspace();
  const { snapshot } = useCapabilityIntelligence();
  if (existing) return <ReviewBody />;
  if (!snapshot) return <EmptyState title="No analysis available" />;
  return (
    <RemediationWorkspaceProvider recommendations={snapshot.intelligence.recommendations}>
      <ReviewBody />
    </RemediationWorkspaceProvider>
  );
}

function ReviewBody() {
  const workspace = useRemediationWorkspace();
  const [searchParams] = useSearchParams();
  const [pkg, setPkg] = useState<ReviewPackage | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const recommendationParam = searchParams.get(RECOMMENDATION_PARAM);
  const backHref = remediationLink(recommendationParam ?? workspace.recommendation?.id ?? null);


  const plan = workspace.plan;

  /**
   * Explicit, and cheap: this is a grouping pass over results that already
   * exist. Memoized on the identity of those results so expanding a bounded
   * list, opening the entity drawer or navigating to the Graph Explorer never
   * rebuilds it.
   */
  const prepared = useMemo(() => {
    if (!plan) return null;
    return buildReviewPackage({
      plan,
      drift: workspace.drift,
      simulation: workspace.simulation,
      recommendation: workspace.recommendation,
      proposal: workspace.proposal,
      canonicalGraphHash: workspace.canonicalGraphHash,
      simulationStale: workspace.simulationStale,
      planStale: workspace.planStale,
      proposalEligibility: workspace.simulationEligibility,
      evidenceSource: "real-graph",
    });
  }, [
    plan,
    workspace.drift,
    workspace.simulation,
    workspace.recommendation,
    workspace.proposal,
    workspace.canonicalGraphHash,
    workspace.simulationStale,
    workspace.planStale,
    workspace.simulationEligibility,
  ]);

  const prepare = useCallback(() => {
    if (!prepared) return;
    setPkg(prepared);
    setAnnouncement(REVIEW_PACKAGE_PREPARED_ANNOUNCEMENT(prepared));
  }, [prepared]);

  const staleShown = pkg !== null && prepared !== null && pkg !== prepared;

  return (
    <div className="space-y-5">
      <p className="sr-only" role="status" aria-live="polite" data-testid="review-announcement">
        {announcement}
      </p>
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        data-testid="review-blocker-announcement"
      >
        {workspace.blockerAnnouncement}
      </p>
      <p className="sr-only" role="alert" data-testid="review-error-announcement">
        {workspace.errorAnnouncement}
      </p>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">
              <h2 className="text-base font-semibold">Change review readiness</h2>
            </CardTitle>
            <StatusBadge value="read-only" tone="neutral" label="Read only" />
            <StatusBadge value="no-approval" tone="neutral" label="No approval decision is recorded" />
            <StatusBadge value="session-local" tone="neutral" label="Session local" />
            <Link
              className="ml-auto text-xs underline underline-offset-2"
              to={backHref}
              data-testid="back-to-remediation"
            >
              Back to the Remediation Workspace
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>{REVIEW_READ_ONLY_NOTICE}</p>
          <p className="font-mono text-[11px]">
            Canonical graph hash: {workspace.canonicalGraphHash}
          </p>
        </CardContent>
      </Card>

      {!plan ? (
        <NoCurrentPackage backHref={backHref} />
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Prepare review package</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={prepare} data-testid="prepare-review-package">
                  {pkg ? "Refresh review package" : "Prepare review package"}
                </Button>
                {staleShown && (
                  <StatusBadge
                    value="stale"
                    tone="warning"
                    label="The underlying plan changed — refresh the review package"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground" data-testid="prepare-explanation">
                Preparing a review package groups results that already exist. It runs no engine: no
                proposal is regenerated, no validation or simulation is re-run, and no second change
                plan is created. A blocked plan produces a blocked review package.
              </p>
            </CardContent>
          </Card>

          {pkg && <ReviewPackageBody pkg={pkg} />}
        </>
      )}
    </div>
  );
}

/**
 * Change plans are session-local by design and are not persisted anywhere.
 * A direct refresh therefore has nothing to show — and nothing was lost.
 */
function NoCurrentPackage({ backHref }: { backHref: string }) {
  return (
    <Card data-testid="no-review-package">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">No current review package</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        <p role="status" data-testid="no-review-package-message">
          {NO_PACKAGE_MESSAGE}
        </p>
        <p>
          Nothing was lost: change plans are never persisted, so a refresh simply starts a new local
          session. The workflow actions that must be completed are, in order:
        </p>
        <ol className="list-decimal pl-5" data-testid="required-actions">
          <li>Select a recommendation.</li>
          <li>Generate proposals.</li>
          <li>Resolve any required parameters.</li>
          <li>Validate the proposal.</li>
          <li>Run the simulation.</li>
          <li>Generate the change-plan preview.</li>
        </ol>
        <p>
          <Link className="underline underline-offset-2" to={backHref} data-testid="no-package-back-link">
            Return to the Remediation Workspace
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function ReviewPackageBody({ pkg }: { pkg: ReviewPackage }) {
  const resolvedArtifactPaths = useMemo(
    () =>
      new Set(
        pkg.mappingViews
          .filter((v) => v.mapping.resolved)
          .map((v) => v.mapping.selected?.path)
          .filter((p): p is string => Boolean(p)),
      ),
    [pkg.mappingViews],
  );

  const approvalIdsByWorkstream = useMemo(() => {
    const map = new Map<string, readonly string[]>();
    for (const w of pkg.workstreams) {
      for (const step of w.steps) map.set(step.id, w.workstream.requiredApprovalIds);
    }
    return map;
  }, [pkg.workstreams]);

  return (
    <div className="space-y-5" data-testid="review-package" data-status={pkg.summary.planStatus}>
      <ReviewSummaryCard pkg={pkg} />
      <GateMatrixTable gates={pkg.gates} summary={pkg.gateSummary} />
      <BlockerAnalysisPanel analysis={pkg.blockers} />
      <ArtifactMappingPanel groups={pkg.mappingGroups} summary={pkg.mappingSummary} />
      <ApprovalMatrixPanel groups={pkg.approvalGroups} summary={pkg.approvalSummary} />
      <ValidationReadinessPanel readiness={pkg.validation} />
      <RollbackReadinessPanel readiness={pkg.rollback} />
      <PatchReviewPanel
        patches={pkg.patches}
        mappingResolvedFor={(patch) =>
          patch.artifact.path !== null && resolvedArtifactPaths.has(patch.artifact.path)
        }
        approvalIdsFor={(patch) => approvalIdsByWorkstream.get(patch.stepId) ?? []}
      />
      <WorkstreamReviewPanel workstreams={pkg.workstreams} />
      <EvidencePackagePanel sections={pkg.evidenceSections} />
    </div>
  );
}
