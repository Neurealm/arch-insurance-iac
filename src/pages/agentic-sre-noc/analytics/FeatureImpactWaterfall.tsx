/**
 * AIM-004 — Feature Impact, Selected Link, Next 6 Hours.
 *
 * Waterfall from a modelled baseline through each signed contribution to the
 * bounded final risk score. Rendered with a floating-bar ComposedChart.
 */

import * as React from "react";
import { Bar, Cell, ComposedChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { AnalyticsChartFrame, AnalyticsTooltip, type AnalyticsPanelState } from "./AnalyticsPrimitives";
import { calculateFeatureImpactWaterfall } from "./analyticsCalculations";
import { downloadCsv } from "./analyticsExport";
import { contributionsForLink, WATERFALL_BASELINE } from "./analyticsFixtures";
import type { AnalyticsState } from "./useAnalyticsState";
import type { FeatureContributionRecord } from "./analyticsTypes";

export interface FeatureImpactWaterfallProps {
  state: AnalyticsState;
  selectedLinkId: string;
  selectedLinkRisk: number;
  horizonLabel: string;
  /** Present when a What-If is applied on the Chennai workspace. */
  whatIfRisk?: number | null;
  panelState?: AnalyticsPanelState;
  onFactorSelected: (factorKey: string | null) => void;
  onNotify: (message: string) => void;
}

export function FeatureImpactWaterfall({
  state, selectedLinkId, selectedLinkRisk, horizonLabel, whatIfRisk, panelState = "ready",
  onFactorSelected, onNotify,
}: FeatureImpactWaterfallProps) {
  const contributions: FeatureContributionRecord[] = React.useMemo(
    () => (state.factorScope === "global" ? contributionsForLink(selectedLinkId, selectedLinkRisk) : contributionsForLink(selectedLinkId, selectedLinkRisk)),
    [state.factorScope, selectedLinkId, selectedLinkRisk],
  );

  const result = React.useMemo(
    () => calculateFeatureImpactWaterfall({ baselineScore: WATERFALL_BASELINE, contributions, selectedLinkId }),
    [contributions, selectedLinkId],
  );

  const whatIfResult = React.useMemo(() => {
    if (typeof whatIfRisk !== "number") return null;
    const positive = contributions.filter((c) => c.contribution > 0).reduce((s, c) => s + c.contribution, 0);
    const negative = contributions.filter((c) => c.contribution < 0).reduce((s, c) => s + c.contribution, 0);
    const target = whatIfRisk - WATERFALL_BASELINE - negative;
    const factor = positive > 0 ? target / positive : 1;
    return calculateFeatureImpactWaterfall({
      baselineScore: WATERFALL_BASELINE, contributions, selectedLinkId, whatIfFactor: factor,
    });
  }, [contributions, selectedLinkId, whatIfRisk]);

  const rows = result.bars.map((bar) => ({
    key: bar.key,
    label: bar.label,
    base: bar.isTotal ? 0 : Math.min(bar.start, bar.end),
    span: bar.isTotal ? bar.end : Math.abs(bar.end - bar.start),
    raw: bar.rawValue,
    contribution: bar.contribution,
    unit: bar.rawUnit,
    isTotal: Boolean(bar.isTotal),
    direction: bar.direction,
    record: contributions.find((c) => c.key === bar.key) ?? null,
  }));

  const chartState: AnalyticsPanelState = panelState === "ready" && contributions.length === 0 ? "empty" : panelState;

  const handleExport = () => {
    const outcome = downloadCsv({
      filename: "feature-impact.csv",
      headers: ["Factor", "Contribution", "Raw value", "Unit", "Direction", "Running score"],
      rows: result.bars
        .filter((b) => !b.isTotal)
        .map((b, i) => [b.label, b.contribution, b.rawValue, b.rawUnit, b.direction, result.runningSubtotal[i] ?? ""]),
    });
    onNotify(outcome.message);
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5" data-testid="feature-impact-panel">
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="inline-flex overflow-hidden rounded border border-slate-200" role="group" aria-label="Feature impact mode">
          {(["contribution", "raw"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={state.waterfallMode === mode}
              onClick={() => { state.setWaterfallMode(mode); state.announce(`Feature impact set to ${mode === "raw" ? "raw value" : "contribution"} mode.`); }}
              className={cn(
                "px-2 py-0.5 text-[10.5px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                state.waterfallMode === mode ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {mode === "contribution" ? "Contribution" : "Raw Value"}
            </button>
          ))}
        </div>
        <span className="text-[10.5px] text-slate-500">
          Baseline {result.baseline.toFixed(2)} · Final {result.finalScore.toFixed(2)}
          {whatIfResult ? ` · What-If ${whatIfResult.finalScore.toFixed(2)}` : ""}
        </span>
      </div>

      <AnalyticsChartFrame
        testId="feature-impact-chart"
        title={`Feature Impact, ${selectedLinkId}, ${horizonLabel}`}
        summary={result.interpretation}
        state={chartState}
        heightClass="h-[270px]"
        emptyReason="No feature-contribution data is available for the selected link"
        onClearFilters={state.clearFilters}
        onExport={handleExport}
        exportLabel="Feature Impact CSV"
        tableCaption="Feature impact data table"
        tableHeaders={["Factor", "Contribution", "Raw value", "Direction", "Running score"]}
        tableRows={result.bars
          .filter((b) => !b.isTotal)
          .map((b, i) => [b.label, b.contribution, `${b.rawValue} ${b.rawUnit}`.trim(), b.direction, result.runningSubtotal[i] ?? ""])}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 40, left: -20 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" interval={0} angle={-32} textAnchor="end" height={54} tick={{ fontSize: 8.5, fill: "#475569" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} width={42} />
            <ReferenceLine y={WATERFALL_BASELINE} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: "Baseline", fontSize: 9, fill: "#64748b", position: "insideTopLeft" }} />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              content={({ active, payload }) => {
                const row = active && payload?.length ? (payload[0].payload as typeof rows[number]) : null;
                if (!row) return null;
                return (
                  <AnalyticsTooltip
                    title={row.label}
                    value={row.isTotal ? row.span.toFixed(2) : `${row.contribution > 0 ? "+" : ""}${row.contribution}`}
                    unit={row.isTotal ? "final risk score" : "contribution"}
                    scope={selectedLinkId}
                    confidence={row.record ? `${row.record.confidencePct}%` : undefined}
                    source={row.record?.source}
                    rows={[
                      ...(row.record ? [{ label: "Raw value", value: `${row.record.rawValue} ${row.record.rawUnit}`.trim() }] : []),
                      ...(row.record ? [{ label: "Normal range", value: row.record.normalRange }] : []),
                      { label: "Direction", value: row.direction },
                      ...(whatIfResult ? [{ label: "What-If score", value: whatIfResult.finalScore.toFixed(2) }] : []),
                    ]}
                    interpretation="Positive contributions increase modelled degradation risk. Negative contributions reduce modelled degradation risk."
                  />
                );
              }}
            />
            <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
            <Bar
              dataKey="span"
              stackId="w"
              isAnimationActive={false}
              onClick={(entry: { key?: string }) => {
                if (!entry?.key || entry.key === "final") return;
                state.selectFactor(entry.key);
                onFactorSelected(entry.key);
              }}
            >
              {rows.map((r) => (
                <Cell
                  key={r.key}
                  cursor={r.isTotal ? "default" : "pointer"}
                  fill={r.isTotal ? "#0f172a" : r.direction === "Increases risk" ? "#ea580c" : "#059669"}
                  stroke={state.factorKey === r.key ? "#1d4ed8" : undefined}
                  strokeWidth={state.factorKey === r.key ? 2 : 0}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </AnalyticsChartFrame>

      {state.waterfallMode === "raw" && (
        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3" data-testid="waterfall-raw-values">
          {contributions.map((c) => (
            <li key={c.key} className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[10.5px] text-slate-700">
              <span className="font-medium text-slate-900">{c.label}</span>
              <span className="block">Raw {c.rawValue} {c.rawUnit} · Normal {c.normalRange}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[10.5px] text-slate-600">
        Positive contributions increase modelled degradation risk. Negative contributions reduce modelled degradation risk.
      </p>
    </div>
  );
}
