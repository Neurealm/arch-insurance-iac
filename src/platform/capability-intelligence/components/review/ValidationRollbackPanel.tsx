import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, type StatusTone } from "@/platform/components/StatusBadge";
import { BoundedList } from "../remediation/BoundedList";
import {
  ROLLBACK_READINESS_LABEL,
  type RollbackReadiness,
  type RollbackReadinessLevel,
  type ValidationReadiness,
} from "../../review/reviewPackage";

const REQUIREMENT_LABEL = {
  "repository-command": "Repository command supplied",
  "rule-only": "Validation requirement without a command",
  manual: "Manual validation required",
} as const;

const ROLLBACK_TONE: Record<RollbackReadinessLevel, StatusTone> = {
  "fully-specified": "positive",
  "partially-specified": "warning",
  "manual-design-required": "warning",
  blocked: "critical",
};

/** Stage 3.5.4.4 — validation readiness, including comparison tolerances. */
export function ValidationReadinessPanel({ readiness }: { readiness: ValidationReadiness }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm" id="validation-readiness-heading">
          Validation readiness ({readiness.total})
        </CardTitle>
        <p className="text-xs text-muted-foreground" data-testid="validation-summary">
          {readiness.total} checkpoint{readiness.total === 1 ? "" : "s"}: {readiness.withCommand}{" "}
          with a repository command, {readiness.ruleOnly} rule-only, {readiness.manual} manual.{" "}
          {readiness.blocking} {readiness.blocking === 1 ? "is" : "are"} blocking. No command is ever
          invented — a checkpoint without one states its rule instead.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <BoundedList
          items={readiness.checkpoints}
          label="validation checkpoints"
          testId="validation-checkpoint-list"
          ordered
          keyFor={(c) => c.checkpoint.id}
          emptyText="This plan declares no validation checkpoint."
          renderItem={(c) => (
            <div
              className="space-y-1 text-xs text-muted-foreground"
              data-testid="validation-checkpoint"
              data-requirement={c.requirementKind}
              data-blocking={c.checkpoint.blocking}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px]">{c.checkpoint.id}</span>
                <StatusBadge value={c.checkpoint.kind} tone="neutral" label={c.checkpoint.kind} />
                <StatusBadge
                  value={c.requirementKind}
                  tone={c.requirementKind === "repository-command" ? "positive" : "warning"}
                  label={REQUIREMENT_LABEL[c.requirementKind]}
                />
                <StatusBadge
                  value={c.checkpoint.blocking ? "blocking" : "non-blocking"}
                  tone={c.checkpoint.blocking ? "critical" : "neutral"}
                  label={c.checkpoint.blocking ? "Blocking" : "Non-blocking"}
                />
              </div>
              <p>{c.checkpoint.statement}</p>
              {c.checkpoint.command ? (
                <p className="font-mono text-[11px]">Command: {c.checkpoint.command}</p>
              ) : c.checkpoint.rule ? (
                <p className="font-mono text-[11px]">Rule: {c.checkpoint.rule}</p>
              ) : (
                <p>No repository command exists for this checkpoint; it is validated manually.</p>
              )}
              <p>Expected outcome: {c.expectedOutcome}</p>
              <p>Depends on {c.dependencyStepIds.length} step(s). Derivation: {c.checkpoint.derivation}</p>
            </div>
          )}
        />

        <section aria-labelledby="tolerances-heading" data-testid="tolerance-section">
          <h4 id="tolerances-heading" className="text-xs font-semibold text-foreground">
            Simulation-to-implementation tolerances ({readiness.tolerances.length})
          </h4>
          <table className="mt-1 w-full text-left text-[11px]">
            <caption className="sr-only">
              Tolerance rules comparing the simulated outcome with the implemented outcome.
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-1 pr-3 font-semibold text-foreground">Metric</th>
                <th scope="col" className="py-1 pr-3 font-semibold text-foreground">Exact match</th>
                <th scope="col" className="py-1 pr-3 font-semibold text-foreground">Within tolerance</th>
                <th scope="col" className="py-1 pr-3 font-semibold text-foreground">Material deviation</th>
                <th scope="col" className="py-1 font-semibold text-foreground">Regression</th>
              </tr>
            </thead>
            <tbody>
              {readiness.tolerances.map((t) => (
                <tr key={t.key} className="border-b border-border/60 align-top" data-testid={`tolerance-${t.key}`}>
                  <th scope="row" className="py-1 pr-3 font-medium text-foreground">{t.key}</th>
                  <td className="py-1 pr-3 text-muted-foreground">Delta of 0</td>
                  <td className="py-1 pr-3 text-muted-foreground">
                    ±{t.absolute} absolute or ±{Math.round(t.relative * 100)}%
                  </td>
                  <td className="py-1 pr-3 text-muted-foreground">Beyond the allowance above</td>
                  <td className="py-1 text-muted-foreground">
                    {t.regressionProhibited ? "Prohibited — any worsening fails" : "Recorded for review"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 text-[11px] text-muted-foreground">
            An invalid comparison is reported when the implemented baseline cannot be matched to the
            approved baseline at all.
          </p>
        </section>
      </CardContent>
    </Card>
  );
}

/** Stage 3.5.4.4 — rollback readiness at step, workstream and plan level. */
export function RollbackReadinessPanel({ readiness }: { readiness: RollbackReadiness }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-sm" id="rollback-readiness-heading">
            Rollback readiness
          </CardTitle>
          <StatusBadge
            value={readiness.level}
            tone={ROLLBACK_TONE[readiness.level]}
            label={ROLLBACK_READINESS_LABEL[readiness.level]}
          />
        </div>
        <p className="text-xs text-muted-foreground" data-testid="rollback-summary">
          {readiness.statement}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-xs text-muted-foreground">
        <dl className="grid gap-x-6 gap-y-1 md:grid-cols-2" data-testid="rollback-facts">
          <Fact label="Step-level rollbacks" value={String(readiness.stepRollbackCount)} />
          <Fact label="Workstream-level rollback order" value={String(readiness.workstreamRollbackCount)} />
          <Fact label="Full-plan rollback order" value={String(readiness.fullPlanRollbackCount)} />
          <Fact label="Manual rollback required" value={String(readiness.manualRollbackCount)} />
          <Fact
            label="Reverse dependency order"
            value={`${readiness.reverseDependencyOrder.length} entries`}
          />
          <Fact
            label="Graph regeneration after rollback"
            value={readiness.graphRegenerationRequired ? "Required" : "Not required"}
          />
        </dl>

        <div>
          <h4 className="text-xs font-semibold text-foreground">Post-rollback validation</h4>
          {readiness.postRollbackValidation.length === 0 ? (
            <p data-testid="rollback-validation-empty">
              The engine specified no post-rollback validation requirement.
            </p>
          ) : (
            <ul className="list-disc pl-5" data-testid="rollback-validation">
              {readiness.postRollbackValidation.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          )}
        </div>

        {readiness.plan.risks.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-foreground">Rollback risks</h4>
            <ul className="list-disc pl-5" data-testid="rollback-risks">
              {readiness.plan.risks.map((r) => (
                <li key={r.id}>
                  {r.classification}: {r.statement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {readiness.plan.limitations.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-foreground">Rollback limitations</h4>
            <ul className="list-disc pl-5" data-testid="rollback-limitations">
              {readiness.plan.limitations.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="text-xs font-semibold text-foreground">
            Step rollback specifications ({readiness.plan.stepRollbacks.length})
          </h4>
          <BoundedList
            items={readiness.plan.stepRollbacks}
            label="step rollbacks"
            testId="step-rollback-list"
            ordered
            keyFor={(r) => r.id}
            emptyText="This plan specifies no step-level rollback."
            renderItem={(r) => (
              <div data-testid="step-rollback" data-manual={r.manualRollbackRequired}>
                <span className="font-mono text-[11px]">{r.id}</span> — order {r.order};{" "}
                {r.reversible
                  ? `reverse operation ${r.reverseOperation ?? "unspecified"}`
                  : "not automatically reversible"}
                {r.manualRollbackRequired && " — manual rollback required"}. {r.explanation}
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      <dt className="font-medium text-foreground">{label}:</dt>
      <dd>{value}</dd>
    </div>
  );
}
