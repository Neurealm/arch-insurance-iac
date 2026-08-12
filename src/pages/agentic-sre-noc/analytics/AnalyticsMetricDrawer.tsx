/**
 * AIM-004 — Analytics metric drawer.
 *
 * Lazy-mounted detail surface for the selected operational metric: definition,
 * comparison, technical detail, lead-time distribution and related links.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { controlTransition, focusRing } from "../components/motion";
import { getOperationalMetric, highRiskLinkRecords, technicalMetrics } from "./analyticsFixtures";
import { metricStatus } from "./analyticsCalculations";
import { StatusPill } from "./AnalyticsPrimitives";


const LEAD_TIME_DISTRIBUTION = [
  { bucket: "0 to 15 min error", share: 34 },
  { bucket: "15 to 30 min error", share: 31 },
  { bucket: "30 to 60 min error", share: 22 },
  { bucket: "Over 60 min error", share: 13 },
];

const FALSE_POSITIVE_EXAMPLES = [
  { linkId: "CHN-MBL-045", predicted: "0.68 high risk", outcome: "No qualifying degradation", note: "Fog cleared two hours early" },
  { linkId: "RIO-MBL-055", predicted: "0.61 high risk", outcome: "No qualifying degradation", note: "Humidity plateaued below threshold" },
  { linkId: "MUM-DC-012", predicted: "0.59 high risk", outcome: "Degradation below qualifying depth", note: "Rain cell tracked away from the span" },
];

export interface AnalyticsMetricDrawerProps {
  open: boolean;
  metricKey: string;
  onClose: () => void;
  onSelectLink: (linkId: string) => void;
}

export function AnalyticsMetricDrawer({ open, metricKey, onClose, onSelectLink }: AnalyticsMetricDrawerProps) {
  const closeRef = React.useRef<HTMLButtonElement | null>(null);
  const restoreRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return undefined;
    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const metric = getOperationalMetric(metricKey);
  const status = metricStatus(metric.value, metric.target, metric.positiveDirection);
  const related = highRiskLinkRecords.slice(0, 5);

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label={`${metric.label} details`}
      data-testid="analytics-metric-drawer"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 mx-auto max-h-[70vh] w-full max-w-xl overflow-y-auto rounded-t-xl border border-slate-200 bg-white p-3 shadow-lg sm:bottom-4 sm:left-auto sm:right-4 sm:rounded-xl",
        "animate-fade-in motion-reduce:animate-none",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{metric.label}</h3>
          <p className="text-[11px] text-slate-500">{metric.period} · synthetic demonstration data</p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={`Close ${metric.label} details`}
          className={cn(
            "rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50",
            controlTransition,
            focusRing,
          )}
        >
          Close
        </button>

      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-xl font-semibold text-slate-900">{metric.displayValue}</span>
        <StatusPill status={status} />
        <span className="text-[10.5px] text-slate-500">Prior {metric.priorDisplayValue} · Target {metric.targetDisplayValue}</span>
      </div>

      <p className="mt-1 text-[11.5px] text-slate-700">{metric.interpretation}</p>
      <p className="mt-1 text-[11px] text-slate-600">{metric.explanation}</p>

      {metric.key === "lead-time-error" && (
        <section className="mt-2" aria-label="Lead-time error distribution">
          <h4 className="text-[11px] font-semibold text-slate-800">Lead-time error distribution</h4>
          <ul className="mt-1 space-y-1">
            {LEAD_TIME_DISTRIBUTION.map((d) => (
              <li key={d.bucket} className="text-[10.5px] text-slate-700">
                <span className="flex justify-between"><span>{d.bucket}</span><span>{d.share}%</span></span>
                <span className="mt-0.5 block h-1.5 rounded bg-slate-100">
                  <span className="block h-full rounded bg-blue-500" style={{ width: `${d.share}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {metric.key === "false-positive" && (
        <section className="mt-2" aria-label="Recent false-positive examples">
          <h4 className="text-[11px] font-semibold text-slate-800">Recent false-positive examples</h4>
          <ul className="mt-1 space-y-1">
            {FALSE_POSITIVE_EXAMPLES.map((f) => (
              <li key={f.linkId} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-1 text-[10.5px] text-slate-700">
                <button
                  type="button"
                  onClick={() => onSelectLink(f.linkId)}
                  className="font-medium text-blue-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {f.linkId}
                </button>
                {" · "}{f.predicted} · {f.outcome} · {f.note}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-2" aria-label="Technical detail">
        <h4 className="text-[11px] font-semibold text-slate-800">Technical detail</h4>
        <ul className="mt-1 grid grid-cols-2 gap-1">
          {technicalMetrics.slice(0, 4).map((t) => (
            <li key={t.key} className="rounded border border-slate-200 px-1.5 py-1 text-[10.5px] text-slate-700">
              <span className="font-medium text-slate-900">{t.label}</span> {t.displayValue}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-2" aria-label="Relevant high-risk links">
        <h4 className="text-[11px] font-semibold text-slate-800">Relevant high-risk links</h4>
        <ul className="mt-1 space-y-0.5">
          {related.map((r) => (
            <li key={r.linkId} className="flex items-baseline justify-between gap-2 text-[10.5px]">
              <button
                type="button"
                onClick={() => onSelectLink(r.linkId)}
                className={cn("font-medium text-blue-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500")}
              >
                {r.linkId}
              </button>
              <span className="text-slate-600">{r.riskScore.toFixed(2)} · {r.riskClass} · {r.etaLabel}</span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
