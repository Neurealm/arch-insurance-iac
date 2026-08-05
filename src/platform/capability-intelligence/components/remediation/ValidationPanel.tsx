import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { severityTone, validationLabel, validationTone } from "../../remediationPresentation";
import type { ValidationResult } from "@/modules/graph/simulation/index";
import type { ValidationStatus } from "../../RemediationWorkspaceProvider";

const STATUS_LABEL: Record<ValidationStatus, string> = {
  "not-validated": "Not validated",
  validating: "Validating",
  validated: "Validated",
  stale: "Stale — parameters changed since validation",
  failed: "Validation failed",
};

const STATUS_TONE: Record<ValidationStatus, "neutral" | "positive" | "warning" | "critical"> = {
  "not-validated": "neutral",
  validating: "neutral",
  validated: "positive",
  stale: "warning",
  failed: "critical",
};

/**
 * Stage 4 — explicitly validate the bound proposal.
 *
 * Validation is the workspace's single source of simulation eligibility, so it
 * is never inferred, never cached across a parameter change, and never run on
 * the operator's behalf.
 */
export function ValidationPanel({
  validation,
  status,
  canValidate,
  busy,
  onValidate,
}: {
  validation: ValidationResult | null;
  status: ValidationStatus;
  canValidate: boolean;
  busy: boolean;
  onValidate: () => void;
}) {
  return (
    <div className="space-y-4" data-testid="validation-stage" data-status={status}>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onValidate} disabled={!canValidate || busy} data-testid="validate-proposal">
          {busy ? "Validating…" : validation ? "Re-validate proposal" : "Validate proposal"}
        </Button>
        <StatusBadge value={status} tone={STATUS_TONE[status]} label={STATUS_LABEL[status]} />
        {!canValidate && (
          <p className="text-xs text-muted-foreground">Select a proposal to enable validation.</p>
        )}
      </div>

      {status === "not-validated" && canValidate && (
        <p className="text-xs text-muted-foreground" data-testid="validation-explainer">
          This proposal has not been validated. Validation applies the engine's structural,
          endpoint-policy, cycle and duplication rules and returns the classification that decides
          whether a simulation may run. Nothing is simulated by this step.
        </p>
      )}

      {status === "stale" && (
        <p className="text-xs text-muted-foreground" data-testid="validation-stale">
          The parameters changed after this validation ran. The result below still describes the
          previous inputs and cannot authorise a simulation; nothing was re-validated automatically.
        </p>
      )}

      {validation && !busy && <ValidationSummary validation={validation} stale={status === "stale"} />}
    </div>
  );
}

function ValidationSummary({
  validation,
  stale,
}: {
  validation: ValidationResult;
  stale: boolean;
}) {
  return (
    <Card data-testid="proposal-validation" data-outcome={validation.outcome} data-stale={stale}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-sm">Validation</CardTitle>
          <StatusBadge
            value={validation.outcome}
            tone={validationTone(validation.outcome)}
            label={validationLabel(validation.outcome)}
          />
          <StatusBadge
            value={validation.executable ? "executable" : "not-executable"}
            tone={validation.executable ? "positive" : "critical"}
            label={
              validation.executable
                ? "Engine marks this executable"
                : "Engine does not mark this executable"
            }
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {validation.missingParameters.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Missing parameters: {validation.missingParameters.join(", ")}
          </p>
        )}
        {validation.issues.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No structural, endpoint-policy, cycle or duplication issue was raised by the{" "}
            {validation.rulesApplied.length} rules applied.
          </p>
        ) : (
          <ul className="space-y-1">
            {validation.issues.map((issue, i) => (
              <li key={`${issue.ruleId}-${i}`} className="flex flex-wrap items-start gap-2 text-xs">
                <StatusBadge value={issue.severity} tone={severityTone(issue.severity)} label={issue.severity} />
                <span className="font-mono text-[11px] text-muted-foreground">{issue.ruleId}</span>
                <span className="text-muted-foreground">{issue.message}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
