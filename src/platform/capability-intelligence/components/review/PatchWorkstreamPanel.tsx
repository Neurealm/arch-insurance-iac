import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, type StatusTone } from "@/platform/components/StatusBadge";
import { BoundedList } from "../remediation/BoundedList";
import { confidenceLabel } from "../../presentation";
import { severityTone } from "../../remediationPresentation";
import type { PatchSpecification } from "@/modules/graph/change-plan/index";
import type { WorkstreamReadiness, WorkstreamView } from "../../review/reviewPackage";

const READINESS_TONE: Record<WorkstreamReadiness, StatusTone> = {
  ready: "positive",
  blocked: "critical",
  warning: "warning",
  "not-applicable": "neutral",
};

/**
 * Stage 3.5.4.4 — patch review.
 *
 * Patches are semantic advisory changes. No generated source code is rendered
 * and there is no apply control anywhere in this experience.
 */
export function PatchReviewPanel({
  patches,
  mappingResolvedFor,
  approvalIdsFor,
}: {
  patches: readonly PatchSpecification[];
  /** Whether the patch's artifact mapping resolved. Derived, never invented. */
  mappingResolvedFor: (patch: PatchSpecification) => boolean;
  approvalIdsFor: (patch: PatchSpecification) => readonly string[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm" id="patch-review-heading">
          Patch specifications ({patches.length})
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Each patch describes intent with a typed operation and a typed selector. No source code is
          generated or shown, and nothing here can apply a patch.
        </p>
      </CardHeader>
      <CardContent>
        <BoundedList
          items={patches}
          label="patch specifications"
          testId="review-patch-list"
          keyFor={(p) => p.id}
          emptyText="This plan specifies no patch."
          renderItem={(p) => (
            <div
              className="space-y-1 rounded border border-border p-2 text-xs text-muted-foreground"
              data-testid="review-patch"
              data-status={p.status}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px]">{p.id}</span>
                <StatusBadge value={p.operation} tone="info" label={p.operation} />
                <StatusBadge
                  value={p.status}
                  tone={p.status === "specified" ? "positive" : "warning"}
                  label={p.status}
                />
                <StatusBadge
                  value={mappingResolvedFor(p) ? "mapped" : "unmapped"}
                  tone={mappingResolvedFor(p) ? "positive" : "critical"}
                  label={mappingResolvedFor(p) ? "Artifact mapping resolved" : "Artifact mapping unresolved"}
                />
                <StatusBadge
                  value={p.confidence}
                  tone="neutral"
                  label={`Confidence: ${confidenceLabel(p.confidence)}`}
                />
              </div>
              <p>
                <span className="font-medium text-foreground">Target artifact:</span>{" "}
                {p.artifact.path ? (
                  <span className="font-mono text-[11px]">{p.artifact.path}</span>
                ) : (
                  "unresolved"
                )}{" "}
                · type {p.artifactType}
              </p>
              <p>
                <span className="font-medium text-foreground">Target selector:</span>{" "}
                <span className="font-mono text-[11px]">
                  {p.selector.type}={p.selector.value}
                </span>{" "}
                · {p.selector.ambiguity} · expected matches {p.selector.expectedMatchCount}
              </p>
              <p>
                <span className="font-medium text-foreground">Before:</span> {p.beforeState.statement}
              </p>
              <p>
                <span className="font-medium text-foreground">Intended after:</span>{" "}
                {p.afterState.statement}
              </p>
              <p>
                Preconditions: {p.preconditions.length}; postconditions: {p.postconditions.length};
                validation rules: {p.validationRules.length}.
              </p>
              <p>
                <span className="font-medium text-foreground">Rollback:</span>{" "}
                {p.rollback.reversible
                  ? `reverse operation ${p.rollback.reverseOperation ?? "unspecified"}`
                  : "not automatically reversible"}
                {p.rollback.manualRollbackRequired && " — manual rollback required"}
              </p>
              <p>
                Approval requirements: {approvalIdsFor(p).length || "none recorded"}. Evidence
                records: {p.evidence.length}. Lineage: {p.lineage.nodeIds.length} node(s),{" "}
                {p.lineage.edgeIds.length} edge(s).
              </p>
              <p>{p.explanation}</p>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}

/** Stage 3.5.4.4 — workstream review with engine-derived readiness. */
export function WorkstreamReviewPanel({ workstreams }: { workstreams: readonly WorkstreamView[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm" id="workstream-review-heading">
          Workstreams ({workstreams.length})
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Workstream readiness is derived from that workstream's own blockers, approvals and
          preconditions. It is not a second plan-level status.
        </p>
      </CardHeader>
      <CardContent>
        <BoundedList
          items={workstreams}
          label="workstreams"
          testId="review-workstream-list"
          keyFor={(w) => w.workstream.id}
          emptyText="This plan declares no workstream."
          renderItem={(w) => (
            <div
              className="space-y-1 rounded border border-border p-2 text-xs text-muted-foreground"
              data-testid="review-workstream"
              data-readiness={w.readiness}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px]">{w.workstream.id}</span>
                <StatusBadge value={w.workstream.kind} tone="info" label={w.workstream.kind} />
                <StatusBadge
                  value={w.readiness}
                  tone={READINESS_TONE[w.readiness]}
                  label={`Readiness: ${w.readiness}`}
                />
                <StatusBadge
                  value="parallel"
                  tone="neutral"
                  label={`${w.parallelizableStepCount} of ${w.steps.length} steps parallelizable`}
                />
              </div>
              <p>
                <span className="font-medium text-foreground">Objective:</span> {w.workstream.objective}
              </p>
              <p>{w.rationale}</p>
              <p>
                Operations: {w.workstream.operations.join(", ") || "none"}. Artifact targets:{" "}
                {w.workstream.artifactPaths.length}. Steps: {w.steps.length}. Patches:{" "}
                {w.patchIds.length}. Dependencies: {w.workstream.dependencies.length}.
              </p>
              <p>
                Preconditions: {w.workstream.preconditions.length}. Validation criteria:{" "}
                {w.workstream.validationCriteria.length}. Rollback criteria:{" "}
                {w.workstream.rollbackCriteria.length}. Required approvals:{" "}
                {w.workstream.requiredApprovalIds.length} ({w.unresolvedApprovalIds.length}{" "}
                unresolved).
              </p>
              {w.workstream.expectedMetricEffects.length > 0 && (
                <p>
                  <span className="font-medium text-foreground">Expected metric effect:</span>{" "}
                  {w.workstream.expectedMetricEffects
                    .map((e) => `${e.key} ${e.direction} (${e.delta >= 0 ? "+" : ""}${e.delta})`)
                    .join(", ")}
                </p>
              )}
              {w.workstream.risks.length > 0 && (
                <ul className="list-disc pl-5" data-testid="workstream-risks">
                  {w.workstream.risks.map((r) => (
                    <li key={r.id}>
                      <StatusBadge
                        value={r.classification}
                        tone={severityTone(r.classification)}
                        label={r.classification}
                      />{" "}
                      {r.statement}
                    </li>
                  ))}
                </ul>
              )}
              <p>Evidence records: {w.workstream.evidence.length}.</p>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
