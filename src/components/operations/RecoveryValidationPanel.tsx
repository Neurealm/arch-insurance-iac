// Recovery validation panel (Stage 2) — evidence backed proof that recovery worked.

import { cn } from "@/lib/utils";
import { OpsPanel, EmptyState } from "@/components/operations/OperationsPrimitives";
import { exportCsv } from "@/lib/operations/exports";
import type { ValidationTestResult } from "@/types/agenticNocWorkflow";

const statusTone: Record<string, string> = {
  "Not started": "border-slate-200 bg-slate-50 text-slate-600",
  "Running": "border-blue-200 bg-blue-50 text-blue-700",
  "Passed": "border-green-200 bg-green-50 text-green-700",
  "Failed": "border-red-200 bg-red-50 text-red-700",
};

export function RecoveryValidationPanel({
  results, validationState, customersImpacted, canRun, canRollback,
  onStart, onPass, onFail, onRollback, className,
}: {
  results: ValidationTestResult[];
  validationState: "Not started" | "Running" | "Passed" | "Failed";
  customersImpacted: number;
  canRun: boolean;
  canRollback: boolean;
  onStart: () => void;
  onPass: () => void;
  onFail: () => void;
  onRollback: () => void;
  className?: string;
}) {
  const passed = results.filter((r) => r.status === "Passed").length;
  const requiredFailed = results.some((r) => r.required && r.status === "Failed");

  return (
    <OpsPanel
      title="Recovery Validation"
      subtitle="Recovery is only complete when validation proves it"
      className={className}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded border px-2 py-0.5 text-[11px] font-medium", statusTone[validationState])}>
            Validation: {validationState}
          </span>
          <span className="text-[11.5px] text-slate-600" data-testid="validation-progress">
            {passed} of {results.length} tests passed
          </span>
          <span className="text-[11.5px] text-slate-600">
            Customers still impacted: {customersImpacted.toLocaleString()}
          </span>
        </div>

        {results.length === 0 ? (
          <EmptyState message="No validation tests defined for this action." />
        ) : (
          <ul className="space-y-1.5">
            {results.map((r) => (
              <li key={r.id} className="rounded border border-slate-200 px-2 py-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12px] font-medium text-slate-900">
                    {r.name}
                    {r.required && <span className="ml-1 text-[10px] uppercase text-slate-500">required</span>}
                  </p>
                  <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-medium", statusTone[r.status])}>
                    {r.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Expected {r.expected} · Observed {r.observed}
                  {r.timestamp ? ` · ${r.timestamp.slice(11, 16)} UTC` : ""} · Evidence {r.evidenceId}
                </p>
              </li>
            ))}
          </ul>
        )}

        {requiredFailed && (
          <p role="alert" className="rounded border border-red-200 bg-red-50 px-2 py-1.5 text-[11.5px] text-red-700">
            A required validation test failed. Rollback is recommended before further action.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={!canRun} onClick={onStart}
            className="rounded bg-teal-600 px-2.5 py-1 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
            Start validation
          </button>
          <button type="button" disabled={validationState !== "Running"} onClick={onPass}
            className="rounded border border-green-300 px-2.5 py-1 text-[12px] font-medium text-green-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 hover:bg-green-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
            Record passing results
          </button>
          <button type="button" disabled={validationState !== "Running"} onClick={onFail}
            className="rounded border border-amber-300 px-2.5 py-1 text-[12px] font-medium text-amber-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            Record failing results
          </button>
          <button type="button" disabled={!canRollback} onClick={onRollback}
            className="rounded border border-red-300 px-2.5 py-1 text-[12px] font-medium text-red-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
            Rollback
          </button>
          <button type="button"
            onClick={() => exportCsv("sre-agentic-noc-validation-results.csv", [
              ["Test ID", "Name", "Status", "Expected", "Observed", "Timestamp", "Evidence", "Required"],
              ...results.map((r) => [
                r.id, r.name, r.status, r.expected, r.observed,
                r.timestamp ?? "", r.evidenceId, r.required ? "Yes" : "No",
              ]),
            ])}
            className="rounded border border-slate-200 px-2.5 py-1 text-[12px] text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Export validation report
          </button>
        </div>
      </div>
    </OpsPanel>
  );
}
