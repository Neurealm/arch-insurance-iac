/**
 * AIM-004 — Model Performance, Last 90 Days.
 *
 * Operational-first: a primary gauge, supporting operational metrics, an
 * optional technical-metrics surface and a compact trend with annotations.
 */

import * as React from "react";
import {
  CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { AnalyticsChartFrame, AnalyticsTooltip, StatusPill, TrendMark, type AnalyticsPanelState } from "./AnalyticsPrimitives";
import { OperationalMetricGauge } from "./OperationalMetricGauge";
import { TechnicalMetricsPanel } from "./TechnicalMetricsPanel";
import {
  ANALYTICS_MODEL_VERSIONS, ANALYTICS_PERIODS, getOperationalMetric, operationalMetrics,
  performanceAnnotations, performanceSeries,
} from "./analyticsFixtures";
import { compareModelPeriods, metricStatus } from "./analyticsCalculations";
import { downloadCsv } from "./analyticsExport";
import type { AnalyticsState } from "./useAnalyticsState";

const REGIONS = ["All regions", "India South", "India West", "Africa East", "Americas", "Europe"];
const PRODUCTS = ["All products", "Lightbridge Terminal", "Metro Backhaul", "Enterprise Access"];
const RISK_CLASSES = ["All", "High", "Moderate", "Low"] as const;
const HORIZONS = [2, 4, 6, 8, 10, 12];

function Filter({
  label, value, options, onChange,
}: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-1 text-[10.5px] text-slate-500">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export interface OperationalModelPerformanceProps {
  state: AnalyticsState;
  panelState?: AnalyticsPanelState;
  onOpenMetricDrawer: (metricKey: string) => void;
  onNotify: (message: string) => void;
}

export function OperationalModelPerformance({
  state, panelState = "ready", onOpenMetricDrawer, onNotify,
}: OperationalModelPerformanceProps) {
  const metric = getOperationalMetric(state.metricKey);
  const status = metricStatus(metric.value, metric.target, metric.positiveDirection);

  const comparisons = React.useMemo(
    () =>
      compareModelPeriods(
        operationalMetrics.map((m) => ({ key: m.key, label: m.label, value: m.value, positiveDirection: m.positiveDirection })),
        operationalMetrics.map((m) => ({ key: m.key, label: m.label, value: m.priorValue, positiveDirection: m.positiveDirection })),
      ),
    [],
  );
  const comparisonByKey = React.useMemo(() => new Map(comparisons.map((c) => [c.key, c])), [comparisons]);

  const trend = performanceSeries.find((s) => s.key === state.trendMetricKey) ?? performanceSeries[0];
  const trendRows = trend.points.map((p) => ({ period: p.period, value: p.value, prior: p.priorValue }));

  const gaugePercent = metric.unit === "%" ? metric.value : metric.unit === "min" ? Math.max(0, 100 - metric.value) : 100;

  const exportMetrics = () => {
    const outcome = downloadCsv({
      filename: "model-metrics.csv",
      headers: ["Metric", "Value", "Prior", "Target", "Status", "Period"],
      rows: operationalMetrics.map((m) => [
        m.label, m.displayValue, m.priorDisplayValue, m.targetDisplayValue,
        metricStatus(m.value, m.target, m.positiveDirection), m.period,
      ]),
    });
    onNotify(outcome.message);
  };

  return (
    <div className="flex min-w-0 flex-col gap-2" data-testid="model-performance-panel">
      <div className="flex flex-wrap items-center gap-1.5">
        <Filter label="Analytics region" value={state.region} options={REGIONS} onChange={state.setRegion} />
        <Filter label="Product" value={state.product} options={PRODUCTS} onChange={state.setProduct} />
        <Filter
          label="Performance horizon"
          value={`${state.horizonHours} hours`}
          options={HORIZONS.map((h) => `${h} hours`)}
          onChange={(v) => state.setHorizonHours(Number.parseInt(v, 10))}
        />
        <Filter
          label="Risk class"
          value={state.riskClass}
          options={RISK_CLASSES}
          onChange={(v) => state.setRiskClass(v as typeof RISK_CLASSES[number])}
        />
        <Filter label="Model version" value={state.modelVersion} options={ANALYTICS_MODEL_VERSIONS} onChange={state.setModelVersion} />
        <Filter label="Time period" value={state.timePeriod} options={ANALYTICS_PERIODS} onChange={state.setTimePeriod} />

        <label className="ml-auto flex items-center gap-1 text-[10.5px] font-medium text-slate-700">
          <input
            type="checkbox"
            checked={state.technicalVisible}
            onChange={(e) => state.setTechnicalVisible(e.target.checked)}
            className="h-3 w-3 rounded border-slate-300"
          />
          Show Technical Metrics
        </label>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[190px_minmax(0,1fr)]">
        <OperationalMetricGauge
          label={metric.label}
          percent={gaugePercent}
          displayValue={metric.displayValue}
          target={metric.targetDisplayValue}
          caption={`${metric.period} · ${state.modelVersion}`}
          status={status}
        />

        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 xl:grid-cols-3" aria-label="Supporting operational metrics">
          {operationalMetrics.map((m) => {
            const cmp = comparisonByKey.get(m.key);
            const s = metricStatus(m.value, m.target, m.positiveDirection);
            const selected = m.key === state.metricKey;
            return (
              <li key={m.key}>
                <button
                  type="button"
                  aria-pressed={selected}
                  title={m.explanation}
                  onClick={() => { state.selectMetric(m.key); onOpenMetricDrawer(m.key); state.announce(`${m.label} selected.`); }}
                  className={cn(
                    "w-full rounded-lg border p-1.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    selected ? "border-blue-400 bg-blue-50/70" : "border-slate-200 bg-white hover:bg-slate-50",
                  )}
                >
                  <span className="flex items-baseline justify-between gap-1">
                    <span className="text-[10.5px] font-medium text-slate-600">{m.label}</span>
                    <StatusPill status={s} />
                  </span>
                  <span className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-[15px] font-semibold text-slate-900">{m.displayValue}</span>
                    {cmp && <TrendMark direction={cmp.direction} label={`${cmp.deltaLabel} vs prior`} improved={cmp.improved} />}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-slate-500">
                    Prior {m.priorDisplayValue} · Target {m.targetDisplayValue} · {m.period}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10.5px] text-slate-700">
        {metric.interpretation}
      </p>

      {state.technicalVisible && <TechnicalMetricsPanel />}

      <AnalyticsChartFrame
        testId="performance-trend"
        title="Model performance trend"
        summary={`${trend.label} across the last twelve weeks${state.comparePrior ? ", compared with the prior period" : ""}.`}
        state={panelState}
        heightClass="h-[150px]"
        onExport={exportMetrics}
        exportLabel="Model Metrics CSV"
        tableCaption="Model performance trend data table"
        tableHeaders={["Period", trend.label, "Prior period"]}
        tableRows={trendRows.map((r) => [r.period, r.value, r.prior])}
        toolbar={
          <>
            <Filter
              label="Trend metric"
              value={trend.key}
              options={performanceSeries.map((s) => s.key)}
              onChange={state.setTrendMetricKey}
            />
            <label className="flex items-center gap-1 text-[10.5px] font-medium text-slate-700">
              <input
                type="checkbox"
                checked={state.comparePrior}
                onChange={(e) => state.setComparePrior(e.target.checked)}
                className="h-3 w-3 rounded border-slate-300"
              />
              Compare prior period
            </label>
          </>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendRows} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} width={38} />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <AnalyticsTooltip
                    title={trend.label}
                    value={`${payload[0].value}${trend.unit === "%" ? "%" : " min"}`}
                    period={String(label)}
                    scope={`${state.region} · ${state.product}`}
                    comparison={state.comparePrior && payload[1] ? `Prior period ${payload[1].value}` : undefined}
                    source="Synthetic model evaluation set"
                    interpretation={metric.explanation}
                  />
                ) : null
              }
            />
            {state.comparePrior && <Legend wrapperStyle={{ fontSize: 10 }} />}
            {performanceAnnotations.map((a) => (
              <ReferenceLine
                key={a.key}
                x={a.period}
                stroke={a.kind === "Retraining" ? "#2563eb" : a.kind === "Threshold change" ? "#7c3aed" : "#d97706"}
                strokeDasharray="3 3"
                label={{ value: a.kind[0], fontSize: 9, fill: "#64748b", position: "top" }}
              />
            ))}
            <Line name={trend.label} type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={1.8} dot={false} isAnimationActive={false} />
            {state.comparePrior && (
              <Line name="Prior period" type="monotone" dataKey="prior" stroke="#94a3b8" strokeWidth={1.4} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsChartFrame>

      <ul className="flex flex-wrap gap-1.5 text-[10px] text-slate-600">
        {performanceAnnotations.map((a) => (
          <li key={a.key} className="rounded border border-slate-200 bg-white px-1.5 py-0.5">
            <span className="font-medium text-slate-800">{a.period}, {a.kind}:</span> {a.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
