/**
 * AIM-005 — Backtesting tab.
 */

import * as React from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AnalyticsChartFrame, AnalyticsTooltip } from "../analytics/AnalyticsPrimitives";
import { backtestAnnotations, backtestEvents, backtestSeriesByVersion } from "./lifecycleFixtures";
import { exportBacktestEvents, exportBacktestResults } from "./lifecycleExport";
import { LifecycleButton, LifecycleSection, LifecycleStat, LifecycleStateFrame } from "./LifecyclePrimitives";
import type { BacktestSummary } from "./lifecycleTypes";
import type { LifecyclePanelState } from "./useLifecycleState";

const metricOptions = [
  { key: "accuracyPct", label: "Accuracy", unit: "%" },
  { key: "customerImpactRecallPct", label: "Customer-impact recall", unit: "%" },
  { key: "falsePositivePct", label: "False positive rate", unit: "%" },
  { key: "meanWarningMinutes", label: "Mean warning time", unit: "min" },
  { key: "preventiveEffectivenessPct", label: "Preventive effectiveness", unit: "%" },
] as const;

const classificationTone: Record<string, string> = {
  "True Positive": "text-emerald-700",
  "False Positive": "text-amber-700",
  "False Negative": "text-rose-700",
  "True Negative": "text-slate-700",
};

export interface BacktestingTabProps {
  panelState: LifecyclePanelState;
  version: string;
  metric: string;
  onMetricChange: (metric: string) => void;
  summary: BacktestSummary;
  region: string;
  product: string;
  onNotify: (message: string) => void;
  onRetry: () => void;
}

export function BacktestingTab({
  panelState, version, metric, onMetricChange, summary, region, product, onNotify, onRetry,
}: BacktestingTabProps) {
  const [classificationFilter, setClassificationFilter] = React.useState<string>("All classifications");

  const series = backtestSeriesByVersion[version] ?? backtestSeriesByVersion[Object.keys(backtestSeriesByVersion)[0]];
  const active = metricOptions.find((option) => option.key === metric) ?? metricOptions[0];

  const events = React.useMemo(
    () => (classificationFilter === "All classifications"
      ? backtestEvents
      : backtestEvents.filter((event) => event.classification === classificationFilter)),
    [classificationFilter],
  );

  const frame = (
    <LifecycleStateFrame
      state={panelState}
      title="Historical Backtesting"
      activeFilters={`Version ${version}, region ${region}, product ${product}`}
      errorMessage="Historical backtesting could not be loaded"
      onRetry={onRetry}
      heightClass="min-h-[240px]"
    />
  );
  if (frame) return <div data-testid="lifecycle-tab-backtesting">{frame}</div>;

  return (
    <div className="space-y-3" data-testid="lifecycle-tab-backtesting">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-slate-900">Historical Backtesting, {version}</h3>
        <div className="flex flex-wrap items-center gap-1">
          <label className="flex items-center gap-1 text-[10.5px] text-slate-500">
            <span className="sr-only sm:not-sr-only">Backtest metric</span>
            <select
              aria-label="Backtest metric"
              value={metric}
              onChange={(event) => { onMetricChange(event.target.value); onNotify(`${event.target.selectedOptions[0].text} plotted.`); }}
              className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[10.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {metricOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
            </select>
          </label>
          <LifecycleButton onClick={() => onNotify(exportBacktestResults(version).message)}>Export Backtest Results</LifecycleButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
        <LifecycleStat label="Months evaluated" value={String(summary.months)} />
        <LifecycleStat label="Mean accuracy" value={`${summary.meanAccuracyPct}%`} tone="positive" />
        <LifecycleStat label="Mean false positive" value={`${summary.meanFalsePositivePct}%`} />
        <LifecycleStat label="Mean warning" value={`${summary.meanWarningMinutes} min`} />
        <LifecycleStat label="Best month" value={summary.bestMonth} hint={`Worst ${summary.worstMonth}`} />
        <LifecycleStat label="Trend" value={summary.trend} tone={summary.trend === "declining" ? "warning" : "positive"} />
      </div>

      <LifecycleSection
        title="Performance over time"
        description="Rolling monthly performance with operational annotations, so a change in the curve can be attributed to a real event."
        testId="backtest-chart-section"
      >
        <AnalyticsChartFrame
          title={`${active.label} over time`}
          summary={`Monthly ${active.label.toLowerCase()} for ${version}, region ${series.region}, product ${series.product}.`}
          heightClass="h-[230px]"
          testId="backtest-chart"
          tableCaption={`${active.label} by month`}
          tableHeaders={["Month", `${active.label} ${active.unit}`]}
          tableRows={series.points.map((point) => [point.month, point[active.key] as number])}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series.points} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#cbd5f5" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} width={38} />
              {backtestAnnotations.map((annotation) => (
                <ReferenceLine
                  key={annotation.id}
                  x={annotation.month}
                  stroke="#94a3b8"
                  strokeDasharray="4 3"
                  label={{ value: annotation.kind.slice(0, 1), fontSize: 9, fill: "#64748b", position: "top" }}
                />
              ))}
              <Line
                type="monotone"
                dataKey={active.key}
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 2 }}
                isAnimationActive={false}
                name={active.label}
              />
              <Tooltip
                content={({ active: isActive, payload, label }) => {
                  if (!isActive || !payload?.length) return null;
                  const annotation = backtestAnnotations.find((a) => a.month === label);
                  return (
                    <AnalyticsTooltip
                      title={`${active.label}, ${label}`}
                      value={String(payload[0].value)}
                      unit={active.unit}
                      scope={`${series.region}, ${series.product}`}
                      period={String(label)}
                      interpretation={annotation ? `${annotation.kind}. ${annotation.summary}` : "No operational change recorded in this month."}
                      source={`Backtest series ${version}`}
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </AnalyticsChartFrame>

        <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
          {backtestAnnotations.map((annotation) => (
            <li key={annotation.id} className="rounded border border-slate-200 bg-slate-50/70 px-2 py-1 text-[10.5px]">
              <span className="font-semibold text-slate-900">{annotation.month}, {annotation.kind}. </span>
              <span className="text-slate-600">{annotation.summary}</span>
            </li>
          ))}
        </ul>
      </LifecycleSection>

      <LifecycleSection
        title="Backtested events"
        description="Individual historical events with what the model predicted, what happened and what action was taken."
        testId="backtest-events"
        actions={
          <>
            <label className="flex items-center gap-1 text-[10.5px] text-slate-500">
              <span className="sr-only sm:not-sr-only">Classification</span>
              <select
                aria-label="Event classification"
                value={classificationFilter}
                onChange={(event) => setClassificationFilter(event.target.value)}
                className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[10.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {["All classifications", "True Positive", "False Positive", "False Negative", "True Negative"].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <LifecycleButton onClick={() => onNotify(exportBacktestEvents().message)}>Export Backtest Events</LifecycleButton>
          </>
        }
      >
        {events.length === 0 ? (
          <div className="rounded border border-dashed border-slate-200 bg-slate-50/60 p-3 text-center text-[10.5px] text-slate-600">
            No backtested events match {classificationFilter}.
            <div className="mt-1 flex justify-center">
              <LifecycleButton onClick={() => setClassificationFilter("All classifications")}>Clear filters</LifecycleButton>
            </div>
          </div>
        ) : (
          <div className="max-h-72 overflow-auto rounded border border-slate-200">
            <table className="w-full text-left text-[10.5px]">
              <caption className="sr-only">Backtested historical events</caption>
              <thead className="sticky top-0 bg-slate-50">
                <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-1.5 py-1">Event</th>
                  <th scope="col" className="px-1.5 py-1">Link</th>
                  <th scope="col" className="px-1.5 py-1">Date</th>
                  <th scope="col" className="px-1.5 py-1">Score</th>
                  <th scope="col" className="px-1.5 py-1">Predicted</th>
                  <th scope="col" className="px-1.5 py-1">Outcome</th>
                  <th scope="col" className="px-1.5 py-1">Action</th>
                  <th scope="col" className="px-1.5 py-1">Classification</th>
                  <th scope="col" className="px-1.5 py-1">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-t border-slate-100">
                    <th scope="row" className="px-1.5 py-1 font-medium text-slate-900">{event.event}</th>
                    <td className="px-1.5 py-1 text-slate-700">{event.linkId}, {event.region}</td>
                    <td className="px-1.5 py-1 text-slate-700">{event.date}</td>
                    <td className="px-1.5 py-1 text-slate-900">{event.predictionScore}</td>
                    <td className="px-1.5 py-1 text-slate-700">{event.predictedEta}</td>
                    <td className="px-1.5 py-1 text-slate-700">{event.actualOutcome}</td>
                    <td className="px-1.5 py-1 text-slate-700">{event.actionTaken}</td>
                    <td className={`px-1.5 py-1 font-medium ${classificationTone[event.classification] ?? "text-slate-700"}`}>{event.classification}</td>
                    <td className="px-1.5 py-1 text-slate-600">{event.evidenceQuality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </LifecycleSection>
    </div>
  );
}
