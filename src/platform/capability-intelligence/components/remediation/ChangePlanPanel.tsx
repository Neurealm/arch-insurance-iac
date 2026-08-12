import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { confidenceLabel } from "../../presentation";
import { driftTone, planStatusTone, severityTone } from "../../remediationPresentation";
import { PLAN_READINESS_CRITERIA, type EligibilityVerdict } from "../../remediation/eligibility";
import { BoundedList } from "./BoundedList";
import type { ChangePlan, DriftReport } from "@/modules/graph/change-plan/index";


const STATUS_LABEL: Record<string, string> = {
  draft: "Draft — no blocker and no executable patch",
  blocked: "Blocked — unresolved conditions prevent review",
  "ready-for-review": "Ready for review",
};

/**
 * Stage 7 — the controlled change plan.
 *
 * The plan is a specification, never an execution. Patches describe intent with
 * typed operations and selectors; they contain no source code and are never
 * applied by this workspace or by anything downstream of it.
 *
 * Only the engine's own status token is rendered. The panel never promotes a
 * blocked plan, never resolves an artifact and never assigns an approver.
 */
export function ChangePlanPanel({
  plan,
  drift,
  eligibility,
  busy,
  stale,
  onBuild,
  evidenceSource = "real-graph",
  reviewHref,
}: {
  plan: ChangePlan | null;
  drift: DriftReport | null;
  eligibility: EligibilityVerdict;
  busy: boolean;
  /** Inputs changed after this plan was generated. */
  stale?: boolean;
  onBuild: () => void;
  /** Where the rendered plan came from. Fixtures are labelled as fixtures. */
  evidenceSource?: "real-graph" | "fixture";
  /**
   * Stage 3.5.4.4 — read-only route to the Change Review Readiness screen.
   * Offered only when a plan exists; it navigates, and does nothing else.
   */
  reviewHref?: string;
}) {
  return (
    <div className="space-y-4" data-testid="change-plan-stage">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={onBuild}
          disabled={!eligibility.eligible || busy}
          data-testid="build-change-plan"
        >
          {busy ? "Planning…" : plan ? "Rebuild change plan" : "Build change plan"}
        </Button>
        {plan && reviewHref && (
          <Button asChild variant="outline" size="sm">
            <Link to={reviewHref} data-testid="review-readiness-link">
              Review readiness
            </Link>
          </Button>
        )}
        {stale && plan && (
          <StatusBadge value="stale" tone="warning" label="Inputs changed — rebuild to refresh" />
        )}
      </div>


      <p className="text-xs text-muted-foreground" data-testid="plan-gate-reason">
        {eligibility.reason}
      </p>

      <p className="text-xs text-muted-foreground">
        This is a specification only. There is no approve, execute or apply action anywhere in this
        workspace, and no patch is ever written to the repository.
      </p>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Readiness criteria the engine applies</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-xs text-muted-foreground" data-testid="plan-readiness-criteria">
            {PLAN_READINESS_CRITERIA.map((criterion) => (
              <li key={criterion}>{criterion}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {plan && !busy && <PlanBody plan={plan} drift={drift} evidenceSource={evidenceSource} />}
    </div>
  );
}

function PlanBody({
  plan,
  drift,
  evidenceSource,
}: {
  plan: ChangePlan;
  drift: DriftReport | null;
  evidenceSource: "real-graph" | "fixture";
}) {
  const unresolvedArtifacts = plan.patches.filter((p) => !p.artifact.path);
  const unresolvedApprovals = plan.requiredApprovals.filter((a) => !a.assignee);

  return (
    <div className="space-y-4" data-testid="change-plan" data-status={plan.status} data-evidence={evidenceSource}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-sm">{plan.title}</CardTitle>
            <StatusBadge
              value={plan.status}
              tone={planStatusTone(plan.status)}
              label={STATUS_LABEL[plan.status] ?? plan.status}
            />
            <StatusBadge
              value={evidenceSource}
              tone={evidenceSource === "real-graph" ? "info" : "warning"}
              label={
                evidenceSource === "real-graph"
                  ? "Derived from the canonical repository graph"
                  : "Fixture — not derived from the repository graph"
              }
            />
            <StatusBadge
              value={plan.confidence}
              tone="neutral"
              label={`Confidence: ${confidenceLabel(plan.confidence)}`}
            />
            {drift && (
              <StatusBadge
                value={drift.classification}
                tone={driftTone(drift.classification)}
                label={`Drift: ${drift.classification}`}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>{plan.explanation.statusRationale}</p>
          <p>{plan.explanation.lineageStatement}</p>
          {drift && <p>{drift.explanation}</p>}
          <div className="grid gap-1 font-mono text-[11px] md:grid-cols-2">
            <span>Plan: {plan.id}</span>
            <span>Canonical hash: {plan.canonicalGraphHash}</span>
            <span>Material hash: {plan.version.materialHash}</span>
            <span>Overlay hash: {plan.lineage.overlayContentHash}</span>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            <StatusBadge value="workstreams" tone="neutral" label={`${plan.workstreams.length} workstreams`} />
            <StatusBadge value="steps" tone="neutral" label={`${plan.steps.length} steps`} />
            <StatusBadge value="patches" tone="neutral" label={`${plan.patches.length} patches`} />
            <StatusBadge value="blockers" tone="neutral" label={`${plan.blockers.length} blockers`} />
            <StatusBadge value="approvals" tone="neutral" label={`${plan.requiredApprovals.length} approvals`} />
            <StatusBadge
              value="unresolved-artifacts"
              tone="neutral"
              label={`${unresolvedArtifacts.length} unresolved artifact mappings`}
            />
            <StatusBadge
              value="repository"
              tone="positive"
              label="Repository untouched — no patch applied"
            />
          </div>
        </CardContent>
      </Card>

      {plan.blockers.length > 0 && (
        <Card data-testid="plan-blockers">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Blockers ({plan.blockers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <BoundedList
              items={plan.blockers}
              label="blockers"
              testId="blocker-list"
              keyFor={(b) => b.id}
              renderItem={(b) => (
                <div className="rounded border border-border p-2 text-xs" data-testid="plan-blocker">
                  <StatusBadge value={b.kind} tone="critical" label={b.kind} />
                  <p className="mt-1 text-muted-foreground">{b.statement}</p>
                  {b.resolutionOptions.length > 0 && (
                    <ul className="mt-1 list-disc pl-5 text-[11px] text-muted-foreground">
                      {b.resolutionOptions.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Workstreams ({plan.workstreams.length}) and steps ({plan.steps.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BoundedList
            items={plan.steps}
            label="steps"
            testId="step-list"
            ordered
            keyFor={(s) => s.id}
            renderItem={(s) => (
              <div className="rounded border border-border p-2 text-xs text-muted-foreground" data-testid="plan-step">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value="order" tone="neutral" label={`Step ${s.order}`} />
                  <StatusBadge value={s.risk} tone={severityTone(s.risk)} label={`Risk: ${s.risk}`} />
                  {s.parallelizable && <StatusBadge value="parallel" tone="info" label="Parallelizable" />}
                  {s.rollback.manual && <StatusBadge value="manual" tone="warning" label="Manual rollback" />}
                </div>
                <div className="mt-1 font-medium text-foreground">{s.title}</div>
                <p>{s.description}</p>
                <p className="mt-1">Expected result: {s.expectedResult}</p>
                {s.targetArtifactPaths.length > 0 && (
                  <p className="font-mono text-[11px]">{s.targetArtifactPaths.join(", ")}</p>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Patch specifications ({plan.patches.length})</CardTitle>
          <p className="text-xs text-muted-foreground">
            Patches describe intent with typed operations and typed selectors. They contain no source
            code and are never applied.
          </p>
        </CardHeader>
        <CardContent>
          <BoundedList
            items={plan.patches}
            label="patch specifications"
            testId="patch-list"
            keyFor={(p) => p.id}
            renderItem={(p) => (
              <div className="rounded border border-border p-2 text-xs" data-testid="plan-patch">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={p.operation} tone="info" label={p.operation} />
                  <StatusBadge
                    value={p.status}
                    tone={p.status === "specified" ? "positive" : "warning"}
                    label={p.status}
                  />
                  <StatusBadge value={p.selector.ambiguity} tone="neutral" label={`Selector: ${p.selector.ambiguity}`} />
                  {p.rollback.manualRollbackRequired && (
                    <StatusBadge value="manual-rollback" tone="warning" label="Manual rollback required" />
                  )}
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                    {p.artifact.path ?? "artifact unresolved"}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{p.explanation}</p>
                <p className="mt-1 text-muted-foreground">
                  Before: {p.beforeState.statement} · After: {p.afterState.statement}
                </p>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Artifact mappings ({plan.patches.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground" data-testid="artifact-mapping-summary">
            {unresolvedArtifacts.length} of {plan.patches.length} patch artifact mappings are
            unresolved. The workspace never resolves an artifact on the engine's behalf.
          </p>
          <BoundedList
            items={plan.patches}
            label="artifact mappings"
            testId="artifact-mapping-list"
            keyFor={(p) => `${p.id}-artifact`}
            renderItem={(p) => (
              <div className="flex flex-wrap items-center gap-2 rounded border border-border p-2 text-xs" data-testid="artifact-mapping">
                <StatusBadge
                  value={p.artifact.path ? "resolved" : "unresolved"}
                  tone={p.artifact.path ? "positive" : "critical"}
                  label={p.artifact.path ? "Resolved" : "Unresolved"}
                />
                <span className="font-mono text-[11px] text-muted-foreground">
                  {p.artifact.path ?? p.id}
                </span>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Required approvals ({plan.requiredApprovals.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground" data-testid="approval-summary">
            {unresolvedApprovals.length} approval role(s) have no resolved owner. Roles are stated;
            no approval decision is recorded, requested or assigned here.
          </p>
          <BoundedList
            items={plan.requiredApprovals}
            label="approvals"
            testId="approval-list"
            keyFor={(a) => a.id}
            emptyText="No approval requirement was derived for this plan."
            renderItem={(a) => (
              <div className="flex flex-wrap items-start gap-2 text-xs text-muted-foreground" data-testid="plan-approval">
                <StatusBadge value={a.role} tone="neutral" label={a.role} />
                <StatusBadge
                  value={a.assignee ? "assigned" : "unresolved"}
                  tone={a.assignee ? "positive" : "critical"}
                  label={a.assignee ?? "Owner unresolved — blocks the plan"}
                />
                <span>{a.rationale}</span>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Validation checkpoints and rollback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-muted-foreground">
          <div>
            <div className="font-semibold text-foreground">Validation checkpoints</div>
            <ul className="list-disc pl-5">
              {plan.validationCheckpoints.map((c) => (
                <li key={c.id}>
                  {c.statement}
                  {c.command && <span className="font-mono"> ({c.command})</span>}
                  {!c.command && c.rule && <span className="font-mono"> [{c.rule}]</span>}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-foreground">Rollback</div>
            <p>
              {plan.rollbackPlan.fullPlanRollbackOrder.length} ordered reversal(s);{" "}
              {plan.rollbackPlan.manualRollbackPatchIds.length} require manual rollback.
              {plan.rollbackPlan.graphRegenerationRequired &&
                " Graph regeneration is required after rollback."}
            </p>
            {plan.rollbackPlan.limitations.length > 0 && (
              <ul className="list-disc pl-5">
                {plan.rollbackPlan.limitations.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
          </div>
          {drift && drift.findings.length > 0 && (
            <div>
              <div className="font-semibold text-foreground">Drift findings</div>
              <ul className="list-disc pl-5">
                {drift.findings.map((f) => (
                  <li key={f.id}>
                    {f.statement} (expected {f.expected}, observed {f.observed})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
