// Human approval, execution, and rollback drawer (Stage 2 governance workspace).

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ConfirmDialog, OpsDrawer } from "./OpsDrawer";
import type {
  ActionRuntime, ActionWorkflowDefinition,
} from "@/types/agenticNocWorkflow";
import type { AgenticAction } from "@/types/agenticOpticalOperations";

export const actionStateTone: Record<string, string> = {
  "Recommended": "border-slate-200 bg-slate-50 text-slate-700",
  "Awaiting approval": "border-amber-200 bg-amber-50 text-amber-700",
  "Approved": "border-blue-200 bg-blue-50 text-blue-700",
  "Rejected": "border-red-200 bg-red-50 text-red-700",
  "Executing": "border-purple-200 bg-purple-50 text-purple-700",
  "Paused": "border-amber-200 bg-amber-50 text-amber-700",
  "Validating": "border-teal-200 bg-teal-50 text-teal-700",
  "Completed": "border-green-200 bg-green-50 text-green-700",
  "Failed": "border-red-200 bg-red-50 text-red-700",
  "Rolled back": "border-slate-300 bg-slate-100 text-slate-700",
};

export interface ActionApprovalDrawerProps {
  open: boolean;
  onClose: () => void;
  action: AgenticAction | null;
  workflow: ActionWorkflowDefinition | null;
  runtime: ActionRuntime | null;
  rollbackAvailable: boolean;
  onApprove: (approval: { approver: string; note: string; riskAcknowledged: boolean }) => void;
  onReject: (rejection: { reason: string; alternative: string }) => void;
  onRequestMoreEvidence: (note: string) => void;
  onModify: (note: string) => void;
  onExecute: () => void;
  onPause: () => void;
  onResume: () => void;
  onRollback: () => void;
  onOpenValidation: () => void;
}

export function ActionApprovalDrawer(props: ActionApprovalDrawerProps) {
  const {
    open, onClose, action, workflow, runtime, rollbackAvailable,
    onApprove, onReject, onRequestMoreEvidence, onModify,
    onExecute, onPause, onResume, onRollback, onOpenValidation,
  } = props;

  const [approver, setApprover] = useState("APAC Network Reliability Lead");
  const [approvalNote, setApprovalNote] = useState("");
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [alternative, setAlternative] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [modification, setModification] = useState("");
  const [confirm, setConfirm] = useState<null | "execute" | "rollback">(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!open || !action || !workflow || !runtime) return null;

  const state = runtime.state;
  const canApprove = state === "Recommended" || state === "Awaiting approval";
  const canExecute = state === "Approved" || (state === "Executing" && runtime.progressPercent < 100);

  return (
    <>
      <OpsDrawer
        open={open}
        onClose={onClose}
        title={action.title}
        subtitle={`Action ${action.id} · governed by human accountability`}
        widthClass="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded border px-2 py-0.5 text-[11px] font-medium", actionStateTone[state])}>
              Current state: {state}
            </span>
            <span className="rounded border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-medium capitalize text-purple-700">
              Autonomy policy: {workflow.autonomyPolicy.replace(/-/g, " ")}
            </span>
            <span className="text-[11px] text-slate-600">Progress {runtime.progressPercent}%</span>
          </div>

          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-[12px] sm:grid-cols-2">
            <Field label="Reason" value={workflow.reason} />
            <Field label="Expected result" value={action.expectedResult} />
            <Field label="Affected services" value={workflow.affectedServices.join(", ")} />
            <Field label="Customers protected" value={workflow.customersProtected.toLocaleString()} />
            <Field label="Operational risk" value={workflow.operationalRisk} />
            <Field label="Required approver" value={workflow.requiredApprover} />
            <Field label="Guardrail" value={workflow.guardrail} />
            <Field label="Validation plan" value={workflow.validationPlanSummary} />
          </dl>

          <section aria-label="Execution plan">
            <h3 className="text-[12px] font-semibold text-slate-900">Execution plan</h3>
            <ol className="mt-1.5 space-y-1">
              {workflow.executionPlan.map((stage, index) => (
                <li key={stage.id} className={cn("rounded border px-2 py-1.5 text-[11.5px]",
                  index <= runtime.executionStageIndex
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-slate-200 text-slate-700")}>
                  {index + 1}. {stage.label} · {stage.progressPercent}% ·{" "}
                  {stage.customersImpacted.toLocaleString()} customers still impacted
                  <span className="block text-[10.5px] text-slate-500">{stage.detail}</span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-label="Rollback readiness">
            <h3 className="text-[12px] font-semibold text-slate-900">Rollback readiness</h3>
            <p className="text-[11.5px] text-slate-600">
              {runtime.rollbackReady ? "Rollback ready" : "Rollback not applicable"} ·
              estimated {workflow.rollbackDurationMinutes} minutes ·
              approval {workflow.rollbackApprovalRequired ? "required" : "not required"}
            </p>
            <ul className="mt-1 list-inside list-decimal text-[11.5px] text-slate-700">
              {workflow.rollbackPlan.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <p className="mt-1 text-[11px] text-amber-700">Risk of rollback: {workflow.rollbackRisk}</p>
          </section>

          {formError && (
            <p role="alert" className="rounded border border-red-200 bg-red-50 px-2 py-1.5 text-[11.5px] text-red-700">
              {formError}
            </p>
          )}

          {canApprove && (
            <section aria-label="Approval" className="rounded border border-slate-200 p-3">
              <h3 className="text-[12px] font-semibold text-slate-900">Approve action</h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-[11px] text-slate-600">
                  <span className="font-medium uppercase tracking-wide text-slate-500">Approver name</span>
                  <input value={approver} onChange={(e) => setApprover(e.target.value)}
                    className="rounded border border-slate-200 px-2 py-1 text-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
                </label>
                <label className="flex flex-col gap-1 text-[11px] text-slate-600">
                  <span className="font-medium uppercase tracking-wide text-slate-500">Approval note</span>
                  <input value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)}
                    className="rounded border border-slate-200 px-2 py-1 text-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
                </label>
              </div>
              <label className="mt-2 flex items-center gap-2 text-[11.5px] text-slate-700">
                <input type="checkbox" checked={riskAcknowledged}
                  onChange={(e) => setRiskAcknowledged(e.target.checked)}
                  className="h-3.5 w-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
                I acknowledge the operational risk described above
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button"
                  onClick={() => {
                    if (!approver.trim() || !approvalNote.trim() || !riskAcknowledged) {
                      setFormError("Approval requires an approver name, an approval note and a risk acknowledgement.");
                      return;
                    }
                    setFormError(null);
                    onApprove({ approver, note: approvalNote, riskAcknowledged });
                  }}
                  className="rounded bg-blue-600 px-2.5 py-1 text-[12px] font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  Approve
                </button>
              </div>
            </section>
          )}

          {canApprove && (
            <section aria-label="Reject" className="rounded border border-slate-200 p-3">
              <h3 className="text-[12px] font-semibold text-slate-900">Reject action</h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-[11px] text-slate-600">
                  <span className="font-medium uppercase tracking-wide text-slate-500">Rejection reason</span>
                  <input value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                    className="rounded border border-slate-200 px-2 py-1 text-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
                </label>
                <label className="flex flex-col gap-1 text-[11px] text-slate-600">
                  <span className="font-medium uppercase tracking-wide text-slate-500">Alternative requested</span>
                  <input value={alternative} onChange={(e) => setAlternative(e.target.value)}
                    className="rounded border border-slate-200 px-2 py-1 text-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
                </label>
              </div>
              <button type="button"
                onClick={() => {
                  if (!rejectionReason.trim()) {
                    setFormError("Rejection requires a reason.");
                    return;
                  }
                  setFormError(null);
                  onReject({ reason: rejectionReason, alternative });
                }}
                className="mt-2 rounded border border-red-300 px-2.5 py-1 text-[12px] font-medium text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                Reject
              </button>
            </section>
          )}

          <section aria-label="Additional controls" className="rounded border border-slate-200 p-3">
            <h3 className="text-[12px] font-semibold text-slate-900">Evidence and modification</h3>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-[11px] text-slate-600">
                <span className="font-medium uppercase tracking-wide text-slate-500">Evidence request</span>
                <input value={evidenceNote} onChange={(e) => setEvidenceNote(e.target.value)}
                  placeholder="Weather persistence forecast"
                  className="rounded border border-slate-200 px-2 py-1 text-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
              </label>
              <label className="flex flex-col gap-1 text-[11px] text-slate-600">
                <span className="font-medium uppercase tracking-wide text-slate-500">Modification</span>
                <input value={modification} onChange={(e) => setModification(e.target.value)}
                  placeholder="Shift in two tranches instead of four"
                  className="rounded border border-slate-200 px-2 py-1 text-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
              </label>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button"
                onClick={() => onRequestMoreEvidence(evidenceNote.trim() || "Additional supporting evidence")}
                className="rounded border border-slate-200 px-2.5 py-1 text-[12px] text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                Request More Evidence
              </button>
              <button type="button"
                onClick={() => onModify(modification.trim() || "Operator modification recorded")}
                className="rounded border border-slate-200 px-2.5 py-1 text-[12px] text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                Modify Action
              </button>
            </div>
          </section>

          <section aria-label="Execution controls" className="flex flex-wrap gap-2">
            <button type="button" disabled={!canExecute} onClick={() => setConfirm("execute")}
              className="rounded bg-purple-600 px-2.5 py-1 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
              Execute
            </button>
            <button type="button" disabled={state !== "Executing"} onClick={onPause}
              className="rounded border border-slate-200 px-2.5 py-1 text-[12px] text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              Pause
            </button>
            <button type="button" disabled={state !== "Paused"} onClick={onResume}
              className="rounded border border-slate-200 px-2.5 py-1 text-[12px] text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              Resume
            </button>
            <button type="button" disabled={!rollbackAvailable} onClick={() => setConfirm("rollback")}
              className="rounded border border-red-300 px-2.5 py-1 text-[12px] font-medium text-red-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
              Rollback
            </button>
            <button type="button" onClick={onOpenValidation}
              className="rounded border border-slate-200 px-2.5 py-1 text-[12px] text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              Open Validation
            </button>
          </section>

          {(runtime.approverName || runtime.rejectionReason || runtime.modificationNote || runtime.evidenceRequested) && (
            <section aria-label="Decision record" className="rounded border border-slate-200 bg-slate-50 p-3 text-[11.5px] text-slate-700">
              <h3 className="text-[12px] font-semibold text-slate-900">Decision record</h3>
              {runtime.approverName && <p>Approved by {runtime.approverName} at {runtime.approvedAt?.slice(11, 16)} UTC · note: {runtime.approvalNote}</p>}
              {runtime.riskAcknowledged && <p>Operational risk acknowledged by the approver.</p>}
              {runtime.rejectionReason && <p>Rejected: {runtime.rejectionReason}. Alternative requested: {runtime.alternativeRequested || "None"}</p>}
              {runtime.modificationNote && <p>Modification: {runtime.modificationNote}</p>}
              {runtime.evidenceRequested && <p>Evidence requested: {runtime.evidenceRequested}</p>}
            </section>
          )}
        </div>
      </OpsDrawer>

      <ConfirmDialog
        open={confirm === "execute"}
        title="Confirm execution"
        message="Executing this action changes live traffic. The approving human remains accountable for the outcome."
        confirmLabel="Confirm execution"
        onCancel={() => setConfirm(null)}
        onConfirm={() => { setConfirm(null); onExecute(); }}
      />
      <ConfirmDialog
        open={confirm === "rollback"}
        title="Confirm rollback"
        message="Rollback returns the corridor to its prior status and resets validation. Customers may be impacted again."
        confirmLabel="Confirm rollback"
        tone="danger"
        onCancel={() => setConfirm(null)}
        onConfirm={() => { setConfirm(null); onRollback(); }}
      />
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10.5px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </div>
  );
}
