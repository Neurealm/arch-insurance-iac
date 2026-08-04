import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { confidenceLabel } from "../../presentation";
import { driftTone, planStatusTone, severityTone } from "../../remediationPresentation";
import type { ChangePlan, DriftReport } from "@/modules/graph/change-plan/index";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft — no blocker, awaiting review preparation",
  blocked: "Blocked — unresolved inputs prevent review",
  "ready-for-review": "Ready for review",
};

/**
 * Stage 5 — the controlled change plan.
 *
 * The plan is a specification, never an execution. Patches describe intent with
 * typed operations and selectors; they contain no source code and are never
 * applied by this workspace or by anything downstream of it.
 */
export function ChangePlanPanel({
  plan,
  drift,
  canBuild,
  busy,
  onBuild,
}: {
  plan: ChangePlan | null;
  drift: DriftReport | null;
  canBuild: boolean;
  busy: boolean;
  onBuild: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onBuild} disabled={!canBuild || busy} data-testid="build-change-plan">
          {busy ? "Planning…" : plan ? "Rebuild change plan" : "Build change plan"}
        </Button>
        {!canBuild && (
          <p className="text-xs text-muted-foreground">Run a simulation first: plans are built from a simulation result.</p>
        )}
      </div>

      {plan && !busy && <PlanBody plan={plan} drift={drift} />}
    </div>
  );
}

function PlanBody({ plan, drift }: { plan: ChangePlan; drift: DriftReport | null }) {
  return (
    <div className="space-y-4" data-testid="change-plan" data-status={plan.status}>
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
            <StatusBadge value="approvals" tone="neutral" label={`${plan.requiredApprovals.length} approvals`} />
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
            <ul className="space-y-2">
              {plan.blockers.map((b) => (
                <li key={b.id} className="rounded border border-border p-2 text-xs">
                  <StatusBadge value={b.kind} tone="critical" label={b.kind} />
                  <p className="mt-1 text-muted-foreground">{b.statement}</p>
                  {b.resolutionOptions.length > 0 && (
                    <ul className="mt-1 list-disc pl-5 text-[11px] text-muted-foreground">
                      {b.resolutionOptions.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Workstreams and steps</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple">
            {plan.workstreams.map((ws) => (
              <AccordionItem key={ws.id} value={ws.id}>
                <AccordionTrigger className="text-sm">
                  {ws.kind} · {ws.stepIds.length} step(s)
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-xs text-muted-foreground">
                  <p>{ws.objective}</p>
                  {ws.artifactPaths.length > 0 && (
                    <p className="font-mono text-[11px]">Artifacts: {ws.artifactPaths.join(", ")}</p>
                  )}
                  <ol className="space-y-2">
                    {plan.steps
                      .filter((s) => s.workstreamId === ws.id)
                      .map((s) => (
                        <li key={s.id} className="rounded border border-border p-2" data-testid="plan-step">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge value="order" tone="neutral" label={`Step ${s.order}`} />
                            <StatusBadge value={s.risk} tone={severityTone(s.risk)} label={`Risk: ${s.risk}`} />
                            {s.parallelizable && (
                              <StatusBadge value="parallel" tone="info" label="Parallelizable" />
                            )}
                            {s.rollback.manual && (
                              <StatusBadge value="manual" tone="warning" label="Manual rollback" />
                            )}
                          </div>
                          <div className="mt-1 font-medium text-foreground">{s.title}</div>
                          <p>{s.description}</p>
                          <p className="mt-1">Expected result: {s.expectedResult}</p>
                          {s.targetArtifactPaths.length > 0 && (
                            <p className="font-mono text-[11px]">{s.targetArtifactPaths.join(", ")}</p>
                          )}
                        </li>
                      ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
          <ul className="space-y-2">
            {plan.patches.map((p) => (
              <li key={p.id} className="rounded border border-border p-2 text-xs" data-testid="plan-patch">
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
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Approvals, validation and rollback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-muted-foreground">
          <div>
            <div className="font-semibold text-foreground">Required approvals</div>
            {plan.requiredApprovals.length === 0 ? (
              <p>No approval requirement was derived for this plan.</p>
            ) : (
              <ul className="space-y-1">
                {plan.requiredApprovals.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-start gap-2">
                    <StatusBadge value={a.role} tone="neutral" label={a.role} />
                    <StatusBadge
                      value={a.assignee ? "assigned" : "unresolved"}
                      tone={a.assignee ? "positive" : "critical"}
                      label={a.assignee ?? "Owner unresolved — blocks the plan"}
                    />
                    <span>{a.rationale}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
