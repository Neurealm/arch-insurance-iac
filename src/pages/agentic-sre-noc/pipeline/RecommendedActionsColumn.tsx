/**
 * AIM-002 — Recommended Actions column and local governance controls.
 *
 * Every control changes pipeline-local state only. Nothing here integrates with
 * the approval or investigation experiences.
 */

import { cn } from "@/lib/utils";
import { pipelineActions } from "../data/pliPipelineFixtures";
import type { ActionRuntime, LocalActionState } from "./usePipelineState";

const STATE_TONE: Record<LocalActionState, string> = {
  Recommended: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Approval requested": "border-blue-200 bg-blue-50 text-blue-800",
  Deferred: "border-amber-200 bg-amber-50 text-amber-900",
  Rejected: "border-rose-200 bg-rose-50 text-rose-800",
  Available: "border-slate-200 bg-slate-50 text-slate-700",
  Standby: "border-slate-200 bg-slate-50 text-slate-700",
  "Not recommended": "border-slate-200 bg-white text-slate-500",
};

export function RecommendedActionsColumn({
  selectedActionId, onSelectAction, runtime, onUpdate, onCompare, onEvidence, onSimulate, notice,
}: {
  selectedActionId: string;
  onSelectAction: (id: string) => void;
  runtime: Record<string, ActionRuntime>;
  onUpdate: (id: string, patch: Partial<ActionRuntime>) => void;
  onCompare: () => void;
  onEvidence: () => void;
  onSimulate: (id: string) => void;
  notice: string | null;
}) {
  const selected = pipelineActions.find((a) => a.id === selectedActionId) ?? pipelineActions[0];
  const selectedRuntime = runtime[selected.id];
  const currentState: LocalActionState = selectedRuntime?.state ?? (selected.status as LocalActionState);

  return (
    <div className="space-y-1.5">
      <ol className="space-y-1">
        {pipelineActions.map((a) => {
          const isSelected = selectedActionId === a.id;
          const state: LocalActionState = runtime[a.id]?.state ?? (a.status as LocalActionState);
          return (
            <li key={a.id}>
              <button
                type="button"
                data-testid={`action-${a.id}`}
                aria-pressed={isSelected}
                onClick={() => onSelectAction(a.id)}
                className={cn(
                  "w-full rounded border px-1.5 py-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  isSelected ? "border-emerald-400 bg-emerald-50/70" : "border-slate-200 bg-white hover:bg-slate-50",
                )}
              >
                <span className="flex items-baseline justify-between gap-1">
                  <span className="truncate text-[10.5px] font-medium text-slate-900">
                    <span className="mr-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-200 text-[8.5px] font-semibold text-slate-700">
                      {a.rank}
                    </span>
                    {a.name}
                  </span>
                  <span className={cn("shrink-0 rounded border px-1 text-[9px] font-medium", STATE_TONE[state])}>
                    {state}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[9.5px] text-slate-600">{a.expectedOutcome}</span>
                <span className="mt-0.5 flex flex-wrap gap-1 text-[9px] text-slate-500">
                  <span>Risk {a.technicalRisk}</span>
                  <span aria-hidden>·</span>
                  <span>{a.reversibility}</span>
                  <span aria-hidden>·</span>
                  <span>{a.approval}</span>
                  <span aria-hidden>·</span>
                  <span>Confidence {a.confidencePct}%</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <section
        aria-label="Selected action detail"
        data-testid="action-detail"
        className="rounded border border-emerald-200 bg-emerald-50/60 p-2"
      >
        <h5 className="text-[10.5px] font-semibold text-slate-900">{selected.name}</h5>
        <p className="mt-0.5 text-[9.5px] text-slate-700">{selected.rationale}</p>
        <dl className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9.5px]">
          {[
            ["Customer impact", selected.customerImpact],
            ["SLO impact", selected.sloImpact],
            ["Capacity protected", selected.capacityProtected],
            ["Time to execute", selected.timeToExecute],
            ["Validation", selected.validation],
            ["Rollback", selected.rollback],
            ["Approval", selected.approval],
            ["Current state", currentState],
            ["Owner", selectedRuntime?.owner ?? "Unassigned"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-1">
              <dt className="text-slate-500">{k}</dt>
              <dd className="text-right font-medium text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-1.5 flex flex-wrap gap-1">
          {[
            { label: "Compare Actions", onClick: onCompare, testId: "action-compare" },
            { label: "Simulate", onClick: () => onSimulate(selected.id), testId: "action-simulate" },
            { label: "Review Evidence", onClick: onEvidence, testId: "action-evidence" },
            { label: "Request Approval", onClick: () => onUpdate(selected.id, { state: "Approval requested" }), testId: "action-request-approval" },
            { label: "Assign Owner", onClick: () => onUpdate(selected.id, { owner: "R. Krishnan, Optical Engineering" }), testId: "action-assign-owner" },
            { label: "Defer", onClick: () => onUpdate(selected.id, { state: "Deferred" }), testId: "action-defer" },
            { label: "Reject", onClick: () => onUpdate(selected.id, { state: "Rejected" }), testId: "action-reject" },
            { label: "Open Investigation", onClick: () => onSimulate("investigate"), testId: "action-open-investigation" },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              data-testid={b.testId}
              onClick={b.onClick}
              className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[9.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {b.label}
            </button>
          ))}
        </div>

        {notice && (
          <p role="status" data-testid="action-notice" className="mt-1 rounded border border-blue-200 bg-white px-1.5 py-1 text-[9.5px] text-blue-800">
            {notice}
          </p>
        )}
      </section>
    </div>
  );
}

export function ActionComparisonPanel({ onClose }: { onClose: () => void }) {
  const rows = pipelineActions.filter((a) => a.comparable);
  return (
    <section
      data-testid="action-comparison"
      aria-label="Action comparison"
      className="rounded-lg border border-slate-200 bg-white p-2"
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[11.5px] font-semibold text-slate-900">Action comparison</h4>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Close comparison
        </button>
      </div>
      <div className="mt-1.5 overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-[10px]">
          <caption className="sr-only">Comparison of candidate actions for the selected optical link</caption>
          <thead>
            <tr className="bg-slate-50 text-left text-slate-600">
              {["Action", "Expected outcome", "Technical risk", "Customer risk", "Capacity protected", "Time to execute", "Reversibility", "Approval", "Validation", "Rollback", "Rank"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-1.5 py-1 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr
                key={a.id}
                data-testid={`comparison-row-${a.id}`}
                className={cn("border-t border-slate-100 align-top", a.status === "Recommended" && "bg-emerald-50/70")}
              >
                <th scope="row" className="px-1.5 py-1 text-left font-medium text-slate-900">
                  {a.name}
                  {a.status === "Recommended" && (
                    <span className="ml-1 rounded border border-emerald-300 bg-white px-1 text-[8.5px] font-semibold text-emerald-700">
                      Recommended
                    </span>
                  )}
                </th>
                <td className="px-1.5 py-1 text-slate-700">{a.expectedOutcome}</td>
                <td className="px-1.5 py-1">{a.technicalRisk}</td>
                <td className="px-1.5 py-1">{a.customerImpact}</td>
                <td className="px-1.5 py-1">{a.capacityProtected}</td>
                <td className="px-1.5 py-1">{a.timeToExecute}</td>
                <td className="px-1.5 py-1">{a.reversibility}</td>
                <td className="px-1.5 py-1">{a.approval}</td>
                <td className="px-1.5 py-1">{a.validation}</td>
                <td className="px-1.5 py-1">{a.rollback}</td>
                <td className="px-1.5 py-1">{a.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
