/**
 * AIM-004 — Threshold tradeoff.
 *
 * Compact demonstration estimate of how the confidence threshold changes
 * precision, recall, false positives and protected services.
 */

import * as React from "react";
import { calculateThresholdTradeoff } from "./analyticsCalculations";
import { THRESHOLD_BASELINE } from "./analyticsFixtures";
import type { AnalyticsState } from "./useAnalyticsState";

export interface ThresholdTradeoffPanelProps {
  state: AnalyticsState;
  /** Confidence threshold shared with the AIM-002 pipeline, 0 to 100. */
  pipelineThresholdPct: number;
  onThresholdChange: (pct: number) => void;
}

export function ThresholdTradeoffPanel({ state, pipelineThresholdPct, onThresholdChange }: ThresholdTradeoffPanelProps) {
  const point = React.useMemo(
    () =>
      calculateThresholdTradeoff({
        threshold: pipelineThresholdPct / 100,
        evaluatedLinks: THRESHOLD_BASELINE.evaluatedLinks,
        baselineHighRiskCount: THRESHOLD_BASELINE.baselineHighRiskCount,
        baselineServicesAtRisk: THRESHOLD_BASELINE.baselineServicesAtRisk,
      }),
    [pipelineThresholdPct],
  );

  if (!point) {
    return (
      <p role="alert" className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[10.5px] text-rose-800">
        The confidence threshold is invalid, so the tradeoff estimate cannot be produced.
      </p>
    );
  }

  const rows: { label: string; value: string }[] = [
    { label: "Confidence threshold", value: point.threshold.toFixed(2) },
    { label: "High-risk predictions", value: String(point.highRiskCount) },
    { label: "Estimated precision", value: `${point.precision}%` },
    { label: "Estimated recall", value: `${point.recall}%` },
    { label: "False positive rate", value: `${point.falsePositiveRate}%` },
    { label: "Missed event rate", value: `${point.missedEventRate}%` },
    { label: "Preventive actions", value: String(point.preventiveActions) },
    { label: "Customer services protected", value: String(point.servicesProtected) },
  ];

  return (
    <section aria-label="Confidence threshold tradeoff" data-testid="threshold-tradeoff" className="rounded-lg border border-slate-200 bg-white p-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[11.5px] font-semibold text-slate-900">Threshold tradeoff, demonstration estimate</h3>
        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          <span>Threshold {pipelineThresholdPct}%</span>
          <input
            type="range"
            min={5}
            max={99}
            step={1}
            aria-label="Confidence threshold"
            value={pipelineThresholdPct}
            onChange={(e) => {
              const next = Number(e.target.value);
              onThresholdChange(next);
              state.announce(`Confidence threshold set to ${next} percent.`);
            }}
            className="h-1 w-32 accent-blue-600"
          />
        </label>
      </div>

      <dl className="mt-1.5 grid grid-cols-2 gap-1 sm:grid-cols-4">
        {rows.map((r) => (
          <div key={r.label} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-1">
            <dt className="text-[9.5px] uppercase tracking-wide text-slate-500">{r.label}</dt>
            <dd className="text-[12px] font-semibold text-slate-900">{r.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-1 text-[10px] text-slate-500">
        These values are deterministic demonstration estimates derived from the threshold, not measured model
        statistics.
      </p>
    </section>
  );
}
