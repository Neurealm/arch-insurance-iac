/**
 * AIM-002 — shared pipeline column shell with loading, empty and error states.
 */

import * as React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlTransition, focusRing, surfaceTransition } from "../components/motion";
import type { ColumnState } from "./usePipelineState";

export function PipelineColumn({
  id, title, subtitle, stageLabel, emphasis, state, resultSummary, freshness, onRetry, children, footer,
}: {
  id: string;
  title: string;
  subtitle: string;
  stageLabel: string;
  emphasis: boolean;
  state: ColumnState;
  resultSummary: string;
  freshness: string;
  onRetry: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const headingId = `pipeline-col-${id}`;
  return (
    <section
      data-testid={`pipeline-column-${id}`}
      data-emphasis={emphasis ? "on" : "off"}
      aria-labelledby={headingId}
      className={cn(
        "flex min-w-0 flex-col rounded-lg border bg-white",
        surfaceTransition,
        emphasis ? "border-blue-300 shadow-sm" : "border-slate-200 opacity-95 xl:opacity-75",
      )}
    >
      <header className={cn("rounded-t-lg border-b px-2.5 py-1.5", emphasis ? "border-blue-200 bg-blue-50/70" : "border-slate-200 bg-slate-50")}>
        <div className="flex items-center justify-between gap-1">
          <h4 id={headingId} className="truncate text-[11.5px] font-semibold text-slate-900">{title}</h4>
          <span className="shrink-0 rounded border border-slate-200 bg-white px-1 text-[9px] font-medium uppercase tracking-wide text-slate-500">
            {stageLabel}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[10px] text-slate-500">{subtitle}</p>
      </header>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
        {state === "loading" && (
          <div role="status" aria-live="polite" className="space-y-1.5">
            <span className="sr-only">Loading {title}</span>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
            ))}
          </div>
        )}

        {state === "empty" && (
          <div className="flex flex-col items-center gap-1 rounded border border-dashed border-slate-200 bg-slate-50/70 p-3 text-center">
            <Info className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            <p className="text-[11px] font-medium text-slate-700">No {title.toLowerCase()} for this selection</p>
            <p className="text-[10px] text-slate-500">Clear the risk, product or region filters to repopulate this stage.</p>
          </div>
        )}

        {state === "error" && (
          <div role="alert" className="space-y-1 rounded border border-rose-200 bg-rose-50/70 p-2.5 text-[10.5px] text-rose-800">
            <p className="flex items-center gap-1 text-[11px] font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {stageLabel} stage unavailable
            </p>
            <p>Affected stage: {title}.</p>
            <p>Last valid result: {resultSummary}.</p>
            <p>Data freshness: {freshness}.</p>
            <p>Operational effect: this stage is excluded from the current recommendation.</p>
            <button
              type="button"
              onClick={onRetry}
              className={cn("mt-1 rounded border border-rose-300 bg-white px-2 py-0.5 text-[10.5px] font-medium text-rose-700 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500", controlTransition)}
            >
              Retry stage
            </button>
          </div>
        )}

        {state === "ready" && children}
      </div>

      {state === "ready" && footer && (
        <footer className="border-t border-slate-200 px-2.5 py-1 text-[10px] text-slate-500">{footer}</footer>
      )}
    </section>
  );
}

/** Compact keyboard-selectable card used inside pipeline columns. */
export function PipelineCard({
  selected, highlighted, dimmed, onClick, ariaLabel, children, testId,
}: {
  selected?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={Boolean(selected)}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "w-full rounded border px-2 py-1.5 text-left",
        controlTransition,
        focusRing,
        selected
          ? "border-blue-400 bg-blue-50"
          : highlighted
            ? "border-violet-300 bg-violet-50/70"
            : "border-slate-200 bg-white hover:bg-slate-50",
        dimmed && "opacity-50",
      )}
    >
      {children}
    </button>
  );
}
