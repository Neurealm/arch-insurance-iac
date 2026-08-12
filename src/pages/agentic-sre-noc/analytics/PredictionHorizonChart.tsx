/**
 * AIM-004 — Prediction Horizon Versus Confidence.
 *
 * Risk bands and prediction confidence across the forecast horizon, with the
 * operating window, intervention window and confidence threshold marked.
 */

import * as React from "react";
import {
  Area, CartesianGrid, ComposedChart, Legend, Line, ReferenceArea, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { AnalyticsChartFrame, AnalyticsTooltip, type AnalyticsPanelState } from "./AnalyticsPrimitives";
import { calculateHorizonRiskSeries } from "./analyticsCalculations";
import { downloadCsv } from "./analyticsExport";
import { ANALYTICS_HORIZONS, getHorizonSeries, HORIZON_MARKERS, horizonSeries } from "./analyticsFixtures";
import type { AnalyticsState } from "./useAnalyticsState";

export interface PredictionHorizonChartProps {
  state: AnalyticsState;
  selectedLinkId: string;
  panelState?: AnalyticsPanelState;
  onNotify: (message: string) => void;
}

export function PredictionHorizonChart({
  state, selectedLinkId, panelState = "ready", onNotify,
}: PredictionHorizonChartProps) {
  const series = getHorizonSeries(state.horizonSeriesKey);
  const previous = getHorizonSeries("previous");

  const result = React.useMemo(
    () =>
      calculateHorizonRiskSeries({
        points: series.points,
        horizonHours: 12,
        confidenceThresholdPct: state.confidenceThresholdPct,
      }),
    [series, state.confidenceThresholdPct],
  );

  const rows = result.points.map((p) => {
    const prior = previous.points.find((x) => x.hour === p.hour);
    return {
      ...p,
      priorHigh: prior?.highRisk ?? null,
      confidenceBandLow: Math.max(0, p.confidence - 6),
      confidenceBandSpan: 12,
    };
  });

  const chartState: AnalyticsPanelState = panelState === "ready" && rows.length === 0 ? "empty" : panelState;

  const handleExport = () => {
    const outcome = downloadCsv({
      filename: "prediction-horizon.csv",
      headers: ["Horizon", "High risk", "Medium risk", "Low risk", "Confidence %"],
      rows: rows.map((r) => [r.label, r.highRisk, r.mediumRisk, r.lowRisk, r.confidence]),
    });
    onNotify(outcome.message);
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5" data-testid="prediction-horizon-panel">
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="inline-flex flex-wrap gap-1" role="group" aria-label="Forecast horizon selection">
          {ANALYTICS_HORIZONS.map((h) => (
            <button
              key={h}
              type="button"
              aria-pressed={state.horizonHours === h}
              onClick={() => { state.setHorizonHours(h); state.announce(`Forecast horizon set to ${h} hours.`); }}
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10.5px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                state.horizonHours === h ? "border-blue-500 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {h}h
            </button>
          ))}
        </div>

        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          <span className="sr-only">Forecast series</span>
          <select
            aria-label="Forecast series"
            value={state.horizonSeriesKey}
            onChange={(e) => state.setHorizonSeriesKey(e.target.value)}
            className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {horizonSeries.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>

        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          <span>Minimum confidence {state.confidenceThresholdPct}%</span>
          <input
            type="range"
            min={50}
            max={99}
            step={1}
            aria-label="Minimum confidence threshold"
            value={state.confidenceThresholdPct}
            onChange={(e) => state.setConfidenceThresholdPct(Number(e.target.value))}
            className="h-1 w-24 accent-blue-600"
          />
        </label>
      </div>

      <AnalyticsChartFrame
        testId="prediction-horizon-chart"
        title="Prediction Horizon Versus Confidence"
        summary={`Risk bands and prediction confidence for ${selectedLinkId} across the next twelve hours. Peak modelled risk ${result.peakRisk.toFixed(2)} at ${result.peakRiskHour ?? 0} hours. Confidence stays at or above ${state.confidenceThresholdPct}% through ${result.confidentThroughHour ?? 0} hours.`}
        state={chartState}
        heightClass="h-[250px]"
        emptyReason="No forecast series is available for the current selection"
        onClearFilters={state.clearFilters}
        onExport={handleExport}
        exportLabel="Horizon CSV"
        tableCaption="Prediction horizon data table"
        tableHeaders={["Horizon", "High risk", "Medium risk", "Low risk", "Confidence %"]}
        tableRows={rows.map((r) => [r.label, r.highRisk, r.mediumRisk, r.lowRisk, r.confidence])}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#475569" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
            <YAxis yAxisId="risk" domain={[0, 1]} tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} width={40} />
            <YAxis yAxisId="conf" orientation="right" domain={[50, 100]} tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} width={32} unit="%" />

            <ReferenceArea
              yAxisId="risk"
              x1={`${HORIZON_MARKERS.interventionWindowStartHour} hours`}
              x2={`${HORIZON_MARKERS.interventionWindowEndHour === 5 ? 4 : HORIZON_MARKERS.interventionWindowEndHour} hours`}
              fill="#dbeafe"
              fillOpacity={0.6}
              label={{ value: "Recommended intervention window", fontSize: 8.5, fill: "#1d4ed8", position: "insideTop" }}
            />
            <ReferenceLine yAxisId="risk" x="Now" stroke="#0f172a" strokeDasharray="2 2" label={{ value: "Now", fontSize: 8.5, fill: "#0f172a", position: "top" }} />
            <ReferenceLine yAxisId="risk" x={`${HORIZON_MARKERS.predictedImpactHour} hours`} stroke="#e11d48" strokeDasharray="3 3" label={{ value: "Predicted impact", fontSize: 8.5, fill: "#e11d48", position: "top" }} />
            <ReferenceLine yAxisId="conf" y={state.confidenceThresholdPct} stroke="#7c3aed" strokeDasharray="4 3" label={{ value: "Min confidence", fontSize: 8.5, fill: "#7c3aed", position: "right" }} />

            <Tooltip
              content={({ active, payload, label }) => {
                const row = active && payload?.length ? (payload[0].payload as typeof rows[number]) : null;
                if (!row) return null;
                return (
                  <AnalyticsTooltip
                    title={`Forecast at ${String(label)}`}
                    value={row.highRisk.toFixed(2)}
                    unit="high-risk probability"
                    scope={selectedLinkId}
                    period={series.label}
                    comparison={row.priorHigh !== null ? `Previous forecast ${row.priorHigh.toFixed(2)}` : undefined}
                    confidence={`${row.confidence}%`}
                    source="Synthetic forecast ensemble"
                    rows={[
                      { label: "Medium risk", value: row.mediumRisk.toFixed(2) },
                      { label: "Low risk", value: row.lowRisk.toFixed(2) },
                    ]}
                    interpretation={
                      row.confidence >= state.confidenceThresholdPct
                        ? "Confidence is above the operating threshold at this horizon."
                        : "Confidence is below the operating threshold at this horizon."
                    }
                  />
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: 9.5 }} />
            <Area yAxisId="conf" name="Confidence band" dataKey="confidenceBandSpan" stackId="band" stroke="none" fill="#ede9fe" fillOpacity={0.5} isAnimationActive={false} legendType="none" />
            <Line yAxisId="risk" name="High-Risk Probability" type="monotone" dataKey="highRisk" stroke="#e11d48" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
            <Line yAxisId="risk" name="Medium-Risk Probability" type="monotone" dataKey="mediumRisk" stroke="#d97706" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line yAxisId="risk" name="Low-Risk Probability" type="monotone" dataKey="lowRisk" stroke="#059669" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line yAxisId="conf" name="Prediction Confidence" type="monotone" dataKey="confidence" stroke="#7c3aed" strokeWidth={1.8} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
            {state.comparePrior && (
              <Line yAxisId="risk" name="Previous forecast" type="monotone" dataKey="priorHigh" stroke="#94a3b8" strokeWidth={1.4} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </AnalyticsChartFrame>

      <p className="text-[10.5px] text-slate-600">
        Selected horizon {state.horizonHours} hours. Peak modelled risk {result.peakRisk.toFixed(2)}
        {result.peakRiskHour !== null ? ` at ${result.peakRiskHour} hours` : ""}. Confidence holds through{" "}
        {result.confidentThroughHour ?? 0} hours and falls below the threshold from{" "}
        {result.belowThresholdFromHour ?? "beyond the modelled window"} hours.
      </p>
    </div>
  );
}
