import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { BoundedList } from "../remediation/BoundedList";
import {
  UNRESOLVED_ROLE_TEXT,
  type ApprovalRoleGroup,
  type ApprovalSummary,
} from "../../review/reviewPackage";

/**
 * Stage 3.5.4.4 — approval requirements matrix.
 *
 * Roles are stated, never decided. There is no approve control, no reject
 * control, no waiver and no person selector: an assignee appears only where the
 * engine already resolved one from manifest or graph metadata.
 */
export function ApprovalMatrixPanel({
  groups,
  summary,
}: {
  groups: readonly ApprovalRoleGroup[];
  summary: ApprovalSummary;
}) {
  return (
    <Card
      data-testid="approval-matrix"
      data-total={summary.total}
      data-unresolved={summary.unresolved}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm" id="approval-matrix-heading">
          Approval requirements ({summary.total})
        </CardTitle>
        <p className="text-xs text-muted-foreground" data-testid="approval-summary">
          {summary.resolved} resolved role(s), {summary.unresolved} unresolved role(s),{" "}
          {summary.blocking} blocking, across {groups.length} role type(s):{" "}
          {summary.byRole.map((r) => `${r.roleLabel} (${r.count})`).join(", ") || "none"}. No
          approval decision is recorded, requested or assigned here.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.length === 0 && (
          <p className="text-xs text-muted-foreground" data-testid="approval-empty">
            The engine derived no approval requirement for this plan.
          </p>
        )}
        {groups.map((group) => (
          <section
            key={group.role}
            aria-labelledby={`approval-group-${group.role}`}
            data-testid={`approval-group-${group.role}`}
            data-count={group.count}
            className="rounded border border-border p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h4 id={`approval-group-${group.role}`} className="text-xs font-semibold text-foreground">
                {group.roleLabel}
              </h4>
              <StatusBadge value="count" tone="neutral" label={`${group.count} requirement(s)`} />
              <StatusBadge
                value={group.unresolved > 0 ? "unresolved" : "resolved"}
                tone={group.unresolved > 0 ? "critical" : "positive"}
                label={
                  group.unresolved > 0
                    ? `${group.unresolved} unresolved`
                    : "All roles resolved"
                }
              />
            </div>
            <div className="mt-2">
              <BoundedList
                items={group.requirements}
                label={`${group.roleLabel} requirements`}
                testId={`approval-list-${group.role}`}
                keyFor={(v) => v.requirement.id}
                renderItem={(v) => {
                  const r = v.requirement;
                  return (
                    <div
                      className="space-y-1 text-xs text-muted-foreground"
                      data-testid="review-approval"
                      data-resolved={v.resolved}
                      data-blocking={v.blocking}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px]">{r.id}</span>
                        <StatusBadge value={r.role} tone="neutral" label={v.roleLabel} />
                        <StatusBadge
                          value={v.resolved ? "resolved" : "unresolved"}
                          tone={v.resolved ? "positive" : "critical"}
                          label={v.resolved ? v.assigneeText : UNRESOLVED_ROLE_TEXT}
                        />
                        {v.blocking && (
                          <StatusBadge value="blocking" tone="critical" label="Blocks the plan" />
                        )}
                        {r.mandatory && (
                          <StatusBadge value="mandatory" tone="info" label="Mandatory" />
                        )}
                      </div>
                      <p>
                        <span className="font-medium text-foreground">Scope:</span> {r.subject}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Reason approval is required:</span>{" "}
                        {r.rationale}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Triggers:</span>{" "}
                        {r.triggers.join(", ") || "none recorded"}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Assignee source:</span>{" "}
                        {r.assigneeSource}
                      </p>
                      <p>
                        Affected entities: {v.affectedEntityIds.length}; affected artifacts:{" "}
                        {v.affectedArtifacts.length}.
                      </p>
                      {r.evidence.length > 0 && (
                        <p>
                          <span className="font-medium text-foreground">Evidence:</span>{" "}
                          {r.evidence[0].statement}
                          {r.evidence.length > 1 && ` (+${r.evidence.length - 1} more)`}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
