import { ShoppingCart, ShieldCheck, UploadCloud, BadgeCheck, Cloud, Boxes, BarChart3, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_DESCRIPTION, STAGE_LABEL, STAGE_ORDER, STAGE_PAYLOAD, type StageId } from "./wfData";
import type { WorkflowState } from "./useWorkflowState";

const ICONS: Record<StageId, typeof ShoppingCart> = {
  order: ShoppingCart, entitlement: ShieldCheck, lifterSubmit: UploadCloud,
  lifterConfirm: BadgeCheck, azureAuth: Cloud, provision: Boxes, active: BarChart3,
};

const ACCENT: Record<StageId, { ring: string; text: string; bg: string; dot: string; hex: string }> = {
  order: { ring: "ring-blue-200", text: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-600", hex: "#2563EB" },
  entitlement: { ring: "ring-emerald-200", text: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-600", hex: "#059669" },
  lifterSubmit: { ring: "ring-violet-200", text: "text-violet-700", bg: "bg-violet-50", dot: "bg-violet-600", hex: "#7C3AED" },
  lifterConfirm: { ring: "ring-violet-200", text: "text-violet-700", bg: "bg-violet-50", dot: "bg-violet-600", hex: "#7C3AED" },
  azureAuth: { ring: "ring-sky-200", text: "text-sky-700", bg: "bg-sky-50", dot: "bg-sky-600", hex: "#0284C7" },
  provision: { ring: "ring-teal-200", text: "text-teal-700", bg: "bg-teal-50", dot: "bg-teal-600", hex: "#0D9488" },
  active: { ring: "ring-indigo-200", text: "text-indigo-700", bg: "bg-indigo-50", dot: "bg-indigo-600", hex: "#4F46E5" },
};

export default function WorkflowStages({ s }: { s: WorkflowState }) {
  const mode = s.flowMode;

  return (
    <div className="relative">
      <div className="grid grid-cols-1 gap-x-0 gap-y-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {STAGE_ORDER.map((stage, i) => {
          const Icon = ICONS[stage];
          const a = ACCENT[stage];
          const c = s.counters[stage];
          const selected = s.filters.stage === stage;
          const exCount = s.exceptionsByStage.get(stage) ?? 0;
          return (
            <div key={stage} className="relative flex items-stretch">
              <button
                type="button"
                onClick={() => s.patch("stage", selected ? null : stage)}
                aria-pressed={selected}
                className={cn(
                  "group relative flex w-full flex-col rounded-xl border bg-white p-3 text-left transition-all",
                  selected ? "border-indigo-400 ring-2 ring-indigo-100" : "border-[#E7EBF0] hover:border-indigo-300 hover:shadow-sm",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white", a.dot)}>{i + 1}</span>
                  {exCount > 0 && (
                    <span
                      role="button" tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); s.patch("exceptionStage", s.filters.exceptionStage === stage ? null : stage); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); s.patch("exceptionStage", stage); } }}
                      className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-100"
                    >
                      <AlertTriangle className="h-3 w-3" />{exCount}
                    </span>
                  )}
                </div>
                <div className={cn("mt-2 flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-inset", a.bg, a.ring)}>
                  <Icon className={cn("h-4.5 w-4.5", a.text)} style={{ width: 18, height: 18 }} />
                </div>
                <div className="mt-2 text-[12.5px] font-semibold leading-tight text-[#1E293B]">{STAGE_LABEL[stage]}</div>
                <p className="mt-1 text-[10.5px] leading-snug text-slate-500">{STAGE_DESCRIPTION[stage]}</p>

                <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                  <div className="rounded-md border border-slate-200 px-2 py-1">
                    <div className="text-[15px] font-semibold leading-none tabular-nums text-slate-900">{c.primary}</div>
                    <div className="mt-0.5 text-[9.5px] text-slate-500">{c.primaryLabel}</div>
                  </div>
                  <div
                    role="button" tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); if (c.secondary > 0) s.patch("exceptionStage", s.filters.exceptionStage === stage ? null : stage); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && c.secondary > 0) { e.stopPropagation(); s.patch("exceptionStage", stage); } }}
                    className={cn("rounded-md border px-2 py-1",
                      c.secondary > 0
                        ? c.secondaryLabel === "Pending" ? "border-amber-200 bg-amber-50/60 hover:bg-amber-50" : "border-rose-200 bg-rose-50/60 hover:bg-rose-50"
                        : "border-slate-200")}
                  >
                    <div className={cn("text-[15px] font-semibold leading-none tabular-nums",
                      c.secondary > 0 ? (c.secondaryLabel === "Pending" ? "text-amber-700" : "text-rose-700") : "text-slate-900")}>
                      {c.secondary}
                    </div>
                    <div className="mt-0.5 text-[9.5px] text-slate-500">{c.secondaryLabel}</div>
                  </div>
                </div>

                <div className="mt-2 border-t border-slate-100 pt-1.5">
                  <div className="text-[9.5px] text-slate-500">Avg. processing time</div>
                  <div className="text-[11.5px] font-semibold text-slate-800">{c.avgTime}</div>
                </div>

                {mode === "data" && (
                  <div className="mt-2 flex flex-wrap gap-1 border-t border-dashed border-slate-200 pt-2">
                    {STAGE_PAYLOAD[stage].map((p) => (
                      <span key={p} className="rounded bg-slate-50 px-1 py-0.5 font-mono text-[9px] text-slate-600 ring-1 ring-inset ring-slate-200">{p}</span>
                    ))}
                  </div>
                )}
              </button>

              {i < STAGE_ORDER.length - 1 && (
                <div className="pointer-events-none absolute -right-1 top-1/2 z-10 hidden -translate-y-1/2 xl:block">
                  <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden>
                    <defs>
                      <marker id={`arw-${stage}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                        <path d="M0,0 L5,2.5 L0,5 z" fill={mode === "exception" ? "#F43F5E" : "#94A3B8"} />
                      </marker>
                    </defs>
                    <line x1="0" y1="6" x2="14" y2="6"
                      stroke={mode === "exception" ? "#F43F5E" : "#94A3B8"} strokeWidth="1.5"
                      strokeDasharray={mode === "data" ? "3 2" : mode === "exception" ? "4 3" : undefined}
                      markerEnd={`url(#arw-${stage})`} />
                    {mode === "live" && (
                      <circle r="2.2" fill={ACCENT[stage].hex}>
                        <animate attributeName="cx" values="0;14" dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="cy" values="6;6" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {mode === "exception" && (
        <div className="mt-3 rounded-lg border border-dashed border-rose-300 bg-rose-50/40 px-3 py-2 text-[11.5px] text-rose-800">
          Exception flow: {s.exceptions.length} transactions have left the normal workflow and entered exception management.
          Failures are routed out of the pipeline at the stage that rejected them and held for automated or assisted remediation.
        </div>
      )}
    </div>
  );
}
