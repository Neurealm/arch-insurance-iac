/**
 * AIM-004 — shared analytics presentation primitives.
 *
 * AnalyticsTooltip, AnalyticsDataTable and AnalyticsChartFrame keep every
 * analytics panel consistent, accessible and free of raw Recharts payloads.
 */

import * as React from "react";
import { AlertTriangle, Download, Info, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnalyticsPanelState = "ready" | "loading" | "empty" | "error";

/* -------------------------------- tooltip -------------------------------- */

export interface AnalyticsTooltipRow { label: string; value: string }

export interface AnalyticsTooltipProps {
  title: string;
  value: string;
  unit?: string;
  scope?: string;
  period?: string;
  comparison?: string;
  interpretation?: string;
  source?: string;
  confidence?: string;
  rows?: AnalyticsTooltipRow[];
}

export function AnalyticsTooltip({
  title, value, unit, scope, period, comparison, interpretation, source, confidence, rows,
}: AnalyticsTooltipProps) {
  const meta: AnalyticsTooltipRow[] = [
    ...(rows ?? []),
    ...(scope ? [{ label: "Scope", value: scope }] : []),
    ...(period ? [{ label: "Period", value: period }] : []),
    ...(comparison ? [{ label: "Comparison", value: comparison }] : []),
    ...(confidence ? [{ label: "Confidence", value: confidence }] : []),
    ...(source ? [{ label: "Source", value: source }] : []),
  ];
  return (
    <div
      data-testid="analytics-tooltip"
      className="max-w-[260px] rounded-lg border border-slate-200 bg-white p-2 text-[11px] shadow-lg"
    >
      <p className="text-[11.5px] font-semibold text-slate-900">{title}</p>
      <p className="text-[13px] font-semibold text-slate-900">
        {value}
        {unit ? <span className="ml-0.5 text-[11px] font-medium text-slate-500">{unit}</span> : null}
      </p>
      {meta.length > 0 && (
        <dl className="mt-1 space-y-0.5">
          {meta.map((row) => (
            <div key={`${row.label}-${row.value}`} className="flex justify-between gap-3">
              <dt className="text-slate-500">{row.label}</dt>
              <dd className="text-right font-medium text-slate-800">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {interpretation && <p className="mt-1 border-t border-slate-100 pt-1 text-slate-600">{interpretation}</p>}
    </div>
  );
}

/* ------------------------------ data table -------------------------------- */

export function AnalyticsDataTable({
  caption, headers, rows, className,
}: { caption: string; headers: string[]; rows: (string | number)[][]; className?: string }) {
  return (
    <div className={cn("max-h-52 overflow-auto rounded border border-slate-200", className)}>
      <table className="w-full text-left text-[10.5px]">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-10 bg-slate-50 shadow-[inset_0_-1px_0_0_rgb(226_232_240)]">
          <tr className="text-slate-500">
            {headers.map((h) => (
              <th key={h} scope="col" className="whitespace-nowrap px-1.5 py-1 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row[0]}-${i}`} className={cn("border-t border-slate-100 hover:bg-slate-50", controlTransition)}>
              {row.map((cell, j) => (
                <td key={`${i}-${j}`} className="whitespace-nowrap px-1.5 py-0.5 text-slate-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


/* ------------------------------ chart frame ------------------------------- */

export interface AnalyticsChartFrameProps {
  /** Accessible chart title. */
  title: string;
  /** Screen-reader summary of what the chart shows. */
  summary: string;
  state?: AnalyticsPanelState;
  heightClass?: string;
  emptyReason?: string;
  activeFilters?: string;
  onClearFilters?: () => void;
  errorMessage?: string;
  onRetry?: () => void;
  tableCaption?: string;
  tableHeaders?: string[];
  tableRows?: (string | number)[][];
  onExport?: () => void;
  exportLabel?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  testId?: string;
}

export function AnalyticsChartFrame({
  title, summary, state = "ready", heightClass = "h-[300px]", emptyReason, activeFilters, onClearFilters,
  errorMessage, onRetry, tableCaption, tableHeaders, tableRows, onExport, exportLabel, toolbar, children, testId,
}: AnalyticsChartFrameProps) {
  const [tableVisible, setTableVisible] = React.useState(false);

  return (
    <div data-testid={testId} data-chart-state={state} className="flex min-w-0 flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <p className="sr-only">{title}</p>
        <p className="text-[10.5px] text-slate-500">{summary}</p>
        <div className="flex items-center gap-1">
          {toolbar}
          {tableHeaders && tableRows && (
            <button
              type="button"
              onClick={() => setTableVisible((v) => !v)}
              aria-pressed={tableVisible}
              className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Table2 className="h-3 w-3" aria-hidden />
              {tableVisible ? "Hide data table" : `Data table, ${title}`}
            </button>
          )}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Download className="h-3 w-3" aria-hidden />{exportLabel ?? "Export CSV"}
            </button>
          )}
        </div>
      </div>

      {state === "loading" && (
        <div className={cn("flex flex-col gap-2", heightClass)} role="status" aria-live="polite">
          <span className="sr-only">Loading {title}</span>
          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
          <div className="flex-1 animate-pulse rounded bg-slate-50" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        </div>
      )}

      {state === "empty" && (
        <div className={cn("flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-3 text-center", heightClass)}>
          <Info className="h-4 w-4 text-slate-400" aria-hidden />
          <p className="text-[11.5px] font-medium text-slate-700">{emptyReason ?? "No data matches the current filters"}</p>
          {activeFilters && <p className="text-[10.5px] text-slate-500">Active filters: {activeFilters}</p>}
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-1 rounded border border-slate-300 bg-white px-2 py-0.5 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {state === "error" && (
        <div role="alert" className={cn("flex flex-col items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50/70 p-3 text-center", heightClass)}>
          <AlertTriangle className="h-4 w-4 text-rose-600" aria-hidden />
          <p className="text-[11.5px] font-medium text-rose-800">{errorMessage ?? `${title} could not be calculated`}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 rounded border border-rose-300 bg-white px-2 py-0.5 text-[10.5px] font-medium text-rose-700 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {state === "ready" && (
        <div className={cn("min-w-0", heightClass)} role="img" aria-label={`${title}. ${summary}`}>
          {children}
        </div>
      )}

      {tableVisible && tableHeaders && tableRows && (
        <AnalyticsDataTable caption={tableCaption ?? `${title} data table`} headers={tableHeaders} rows={tableRows} />
      )}
    </div>
  );
}

/* ------------------------------ small pieces ------------------------------ */

export function StatusPill({ status }: { status: "On target" | "Near target" | "Below target" }) {
  return (
    <span
      className={cn(
        "rounded border px-1 py-px text-[9.5px] font-semibold uppercase tracking-wide",
        status === "On target" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "Near target" && "border-amber-200 bg-amber-50 text-amber-700",
        status === "Below target" && "border-rose-200 bg-rose-50 text-rose-700",
      )}
    >
      {status}
    </span>
  );
}

export function TrendMark({ direction, label, improved }: { direction: "up" | "down" | "flat"; label: string; improved: boolean }) {
  return (
    <span className={cn("text-[10.5px] font-medium", improved ? "text-emerald-700" : "text-rose-700")}>
      <span aria-hidden>{direction === "up" ? "▲" : direction === "down" ? "▼" : "■"}</span>{" "}
      {label}
    </span>
  );
}
