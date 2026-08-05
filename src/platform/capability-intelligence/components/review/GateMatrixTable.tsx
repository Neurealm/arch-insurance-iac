import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, type StatusTone } from "@/platform/components/StatusBadge";
import type { GateStatus, ReadinessGate } from "../../review/gateMatrix";
import type { GateMatrixSummary } from "../../review/gateMatrix";

const TONE: Record<GateStatus, StatusTone> = {
  passed: "positive",
  blocked: "critical",
  warning: "warning",
  "not-applicable": "neutral",
};

const LABEL: Record<GateStatus, string> = {
  passed: "Passed",
  blocked: "Blocked",
  warning: "Warning",
  "not-applicable": "Not applicable",
};

/**
 * Stage 3.5.4.4 — review readiness gate matrix.
 *
 * A real table with a caption and header scopes, because reviewers navigate it
 * with a screen reader. Status is communicated in text as well as tone, so it
 * never depends on colour.
 */
export function GateMatrixTable({
  gates,
  summary,
}: {
  gates: readonly ReadinessGate[];
  summary: GateMatrixSummary;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm" id="gate-matrix-heading">
          Review readiness gates ({gates.length})
        </CardTitle>
        <p className="text-xs text-muted-foreground" data-testid="gate-matrix-summary">
          {summary.passed} passed, {summary.blocked} blocked, {summary.warning} warning,{" "}
          {summary.notApplicable} not applicable. Gates summarise the engine's result; the plan
          status remains authoritative and no gate total can override it.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-left text-xs" data-testid="gate-matrix">
          <caption className="sr-only">
            Review readiness gates, their status, rationale, related blockers, supporting evidence
            and required next action.
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="py-1 pr-3 font-semibold text-foreground">
                Gate
              </th>
              <th scope="col" className="py-1 pr-3 font-semibold text-foreground">
                Status
              </th>
              <th scope="col" className="py-1 pr-3 font-semibold text-foreground">
                Rationale
              </th>
              <th scope="col" className="py-1 pr-3 font-semibold text-foreground">
                Blockers
              </th>
              <th scope="col" className="py-1 pr-3 font-semibold text-foreground">
                Evidence
              </th>
              <th scope="col" className="py-1 font-semibold text-foreground">
                Required next action
              </th>
            </tr>
          </thead>
          <tbody>
            {gates.map((gate) => (
              <tr
                key={gate.id}
                className="border-b border-border/60 align-top"
                data-testid={`gate-${gate.id}`}
                data-status={gate.status}
              >
                <th scope="row" className="py-2 pr-3 font-medium text-foreground">
                  {gate.name}
                </th>
                <td className="py-2 pr-3">
                  <StatusBadge value={gate.status} tone={TONE[gate.status]} label={LABEL[gate.status]} />
                </td>
                <td className="py-2 pr-3 text-muted-foreground">{gate.rationale}</td>
                <td className="py-2 pr-3 text-muted-foreground">
                  {gate.blockerIds.length === 0 ? (
                    "None"
                  ) : (
                    <span data-testid={`gate-${gate.id}-blockers`}>
                      {gate.blockerIds.length} related blocker
                      {gate.blockerIds.length === 1 ? "" : "s"}
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3 font-mono text-[11px] text-muted-foreground">
                  {gate.evidence.length === 0 ? "None recorded" : gate.evidence.slice(0, 3).join(", ")}
                  {gate.evidence.length > 3 && ` +${gate.evidence.length - 3} more`}
                </td>
                <td className="py-2 text-muted-foreground">{gate.nextAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
