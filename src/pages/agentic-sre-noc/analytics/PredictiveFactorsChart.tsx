/**
 * AIM-004 — Top Predictive Factors, Model Feature Contribution.
 *
 * Horizontal bar chart with global and selected-link scopes. The label is
 * deliberately "Model Feature Contribution", not causal importance.
 */

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Cell, ErrorBar, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { AnalyticsChartFrame, AnalyticsTooltip, type AnalyticsPanelState } from "./AnalyticsPrimitives";
import { aggregateFeatureContributions } from "./analyticsCalculations";
import { downloadCsv } from "./analyticsExport";
import { contributionsForLink, globalContributions } from "./analyticsFixtures";
import type { AnalyticsState } from "./useAnalyticsState";

export interface PredictiveFactorsChartProps {
  state: AnalyticsState;
  selectedLinkId: string;
  selectedLinkRisk: number;
  panelState?: AnalyticsPanelState;
  onFactorSelected: (factorKey: string | null) => void;
  onNotify: (message: string) => void;
}

export function PredictiveFactorsChart({
  state, selectedLinkId, selectedLinkRisk, panelState = "ready", onFactorSelected, onNotify,
}: PredictiveFactorsChartProps) {
  const scopeLabel = state.factorScope === "global" ? "Global Model" : `Selected Link, ${selectedLinkId}`;

  const factors = React.useMemo(() => {
    const source = state.factorScope === "global" ? globalContributions : contributionsForLink(selectedLinkId, selectedLinkRisk);
    const aggregated = aggregateFeatureContributions(source);
    return state.factorSort === "asc" ? [...aggregated].reverse() : aggregated;
  }, [state.factorScope, state.factorSort, selectedLinkId, selectedLinkRisk]);

  const rows = factors.map((f) => ({
    key: f.key,
    label: f.label,
    contributionPct: f.contributionPct,
    errorRange: [f.contributionPct - f.ciLowPct, f.ciHighPct - f.contributionPct] as [number, number],
    factor: f,
  }));

  const chartState: AnalyticsPanelState = panelState === "ready" && rows.length === 0 ? "empty" : panelState;

  const handleExport = () => {
    const outcome = downloadCsv({
      filename: "predictive-factors.csv",
      headers: ["Factor", "Contribution %", "CI low %", "CI high %", "Current value", "Normal range", "Direction", "Scope"],
      rows: factors.map((f) => [f.label, f.contributionPct, f.ciLowPct, f.ciHighPct, f.currentValue, f.normalRange, f.direction, scopeLabel]),
    });
    onNotify(outcome.message);
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5" data-testid="predictive-factors-panel">
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="inline-flex overflow-hidden rounded border border-slate-200" role="group" aria-label="Factor scope">
          {(["global", "selected"] as const).map((scope) => (
            <button
              key={scope}
              type="button"
              aria-pressed={state.factorScope === scope}
              onClick={() => { state.setFactorScope(scope); state.announce(`Factor scope set to ${scope === "global" ? "Global Model" : "Selected Link"}.`); }}
              className={cn(
                "px-2 py-0.5 text-[10.5px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                state.factorScope === scope ? "bg-blue-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {scope === "global" ? "Global Model" : "Selected Link"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => state.setFactorSort(state.factorSort === "desc" ? "asc" : "desc")}
          className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Sort {state.factorSort === "desc" ? "ascending" : "descending"}
        </button>

        <label className="flex items-center gap-1 text-[10.5px] font-medium text-slate-700">
          <input
            type="checkbox"
            checked={state.showConfidenceIntervals}
            onChange={(e) => state.setShowConfidenceIntervals(e.target.checked)}
            className="h-3 w-3 rounded border-slate-300"
          />
          Show confidence intervals
        </label>

        <span className="ml-auto text-[10.5px] text-slate-500">Scope: {scopeLabel}</span>
      </div>

      <AnalyticsChartFrame
        testId="predictive-factors-chart"
        title="Top Predictive Factors, Model Feature Contribution"
        summary={`Model feature contribution by factor for ${scopeLabel}. Contributions are relative shares, not causal effects.`}
        state={chartState}
        heightClass="h-[240px]"
        emptyReason="No feature-contribution data is available for the current selection"
        activeFilters={`${state.region}, ${state.product}, ${state.horizonHours} hour horizon`}
        onClearFilters={state.clearFilters}
        onExport={handleExport}
        exportLabel="Factors CSV"
        tableCaption="Top predictive factors data table"
        tableHeaders={["Factor", "Contribution %", "Current value", "Normal range", "Direction"]}
        tableRows={factors.map((f) => [f.label, f.contributionPct, f.currentValue, f.normalRange, f.direction])}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} unit="%" />
            <YAxis type="category" dataKey="label" width={124} tick={{ fontSize: 9.5, fill: "#334155" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              content={({ active, payload }) => {
                const factor = active && payload?.length ? (payload[0].payload as typeof rows[number]).factor : null;
                return factor ? (
                  <AnalyticsTooltip
                    title={factor.label}
                    value={`${factor.contributionPct}%`}
                    unit="of model feature contribution"
                    scope={scopeLabel}
                    confidence={`${factor.ciLowPct}% to ${factor.ciHighPct}%`}
                    source="Synthetic model attribution"
                    rows={[
                      { label: "Current signal", value: factor.currentValue },
                      { label: "Normal range", value: factor.normalRange },
                      { label: "Direction", value: factor.direction },
                      { label: "Evidence items", value: String(factor.evidenceCount) },
                    ]}
                    interpretation={factor.interpretation}
                  />
                ) : null;
              }}
            />
            <Bar
              dataKey="contributionPct"
              radius={[0, 2, 2, 0]}
              isAnimationActive={false}
              onClick={(entry: { key?: string }) => {
                if (!entry?.key) return;
                state.selectFactor(entry.key);
                onFactorSelected(entry.key);
              }}
            >
              {rows.map((r) => (
                <Cell key={r.key} fill={state.factorKey === r.key ? "#1d4ed8" : "#60a5fa"} cursor="pointer" />
              ))}
              {state.showConfidenceIntervals && <ErrorBar dataKey="errorRange" width={4} strokeWidth={1} stroke="#475569" direction="x" />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </AnalyticsChartFrame>

      <ul className="flex flex-wrap gap-1" aria-label="Select a predictive factor">
        {factors.map((f) => (
          <li key={f.key}>
            <button
              type="button"
              aria-pressed={state.factorKey === f.key}
              onClick={() => { state.selectFactor(f.key); onFactorSelected(f.key); state.announce(`${f.label} factor selected.`); }}
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                state.factorKey === f.key ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {f.label} {f.contributionPct}%
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
