/**
 * AIM-002 — pipeline status summary strip beneath the stage selector.
 */

import { cn } from "@/lib/utils";
import type { PipelineStage } from "../data/pliPipelineFixtures";

export interface StatusSummaryValue {
  label: string;
  value: string;
  tone?: "critical" | "warning" | "positive" | "neutral";
}

const TONE: Record<string, string> = {
  critical: "text-rose-700",
  warning: "text-amber-800",
  positive: "text-emerald-700",
  neutral: "text-slate-900",
};

export function PipelineStatusSummary({
  stageDetail, values,
}: {
  stageDetail: PipelineStage;
  values: StatusSummaryValue[];
}) {
  return (
    <section
      aria-label="Pipeline status summary"
      data-testid="pipeline-status-summary"
      className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-[11.5px] font-semibold text-slate-900">
          Stage {stageDetail.index}, {stageDetail.title}
        </h3>
        <p className="text-[10.5px] text-slate-600">{stageDetail.purpose}</p>
      </div>

      <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3 xl:grid-cols-5">
        {values.map((v) => (
          <div key={v.label} className="min-w-0">
            <dt className="truncate text-[9.5px] uppercase tracking-wide text-slate-500">{v.label}</dt>
            <dd className={cn("truncate text-[11px] font-semibold", TONE[v.tone ?? "neutral"])}>{v.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-1.5 grid grid-cols-1 gap-x-4 gap-y-0.5 text-[10px] text-slate-600 sm:grid-cols-2">
        <p><span className="font-medium text-slate-700">Inputs:</span> {stageDetail.inputs.join(", ")}</p>
        <p><span className="font-medium text-slate-700">Outputs:</span> {stageDetail.outputs.join(", ")}</p>
      </div>
    </section>
  );
}
