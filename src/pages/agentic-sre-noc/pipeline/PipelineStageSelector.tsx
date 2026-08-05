/**
 * AIM-002 — numbered pipeline stage selector.
 */

import { cn } from "@/lib/utils";
import { pipelineStageDetails, type PipelineStageKey, type StageState } from "../data/pliPipelineFixtures";

const STATE_STYLES: Record<StageState, string> = {
  Complete: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Active: "border-blue-200 bg-blue-50 text-blue-700",
  Ready: "border-slate-200 bg-slate-50 text-slate-700",
  Waiting: "border-amber-200 bg-amber-50 text-amber-800",
  Warning: "border-orange-200 bg-orange-50 text-orange-800",
  Blocked: "border-rose-200 bg-rose-50 text-rose-700",
};

export function PipelineStageSelector({
  stage, onSelect,
}: {
  stage: PipelineStageKey;
  onSelect: (s: PipelineStageKey) => void;
}) {
  return (
    <div>
      <h3 className="sr-only">Pipeline stages</h3>
      <ol
        role="tablist"
        aria-label="Predictive pipeline stages"
        className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 xl:grid-cols-6"
      >
        {pipelineStageDetails.map((s) => {
          const active = stage === s.key;
          return (
            <li key={s.key}>
              <button
                type="button"
                role="tab"
                id={`pipeline-stage-tab-${s.key}`}
                aria-selected={active}
                aria-controls="pipeline-columns"
                data-testid={`pipeline-stage-${s.key}`}
                onClick={() => onSelect(s.key)}
                className={cn(
                  "h-full w-full rounded-lg border px-2 py-1.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  active ? "border-blue-400 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50",
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold",
                      active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700",
                    )}
                  >
                    {s.index}
                  </span>
                  <span className="text-[12px] font-semibold text-slate-900">{s.title}</span>
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-slate-600">{s.description}</span>
                <span className="mt-1 flex flex-wrap items-center gap-1">
                  <span className={cn("rounded border px-1 text-[9px] font-medium", STATE_STYLES[s.state])}>{s.state}</span>
                  <span className="rounded border border-slate-200 bg-slate-50 px-1 text-[9px] font-medium text-slate-600">
                    {s.determinism}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[9.5px] text-slate-500">{s.resultCount}</span>
                <span className="block truncate text-[9.5px] text-slate-500">{s.owner}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
