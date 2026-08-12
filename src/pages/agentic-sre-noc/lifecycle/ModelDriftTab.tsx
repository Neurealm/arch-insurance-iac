/**
 * AIM-005 — Model Drift tab.
 */

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AnalyticsChartFrame, AnalyticsTooltip } from "../analytics/AnalyticsPrimitives";
import { driftSimulations } from "./lifecycleFixtures";
import { exportDriftSummary } from "./lifecycleExport";
import {
  DriftBadge, LifecycleButton, LifecycleSection, LifecycleStat, LifecycleStateFrame, RetrainingBadge,
} from "./LifecyclePrimitives";
import type { DriftAssessment, DriftSimulationKey, RetrainingRecommendation } from "./lifecycleTypes";
import type { LifecyclePanelState } from "./useLifecycleState";

export interface ModelDriftTabProps {
  panelState: LifecyclePanelState;
  assessment: DriftAssessment;
  retraining: RetrainingRecommendation;
  selectedMetricId: string | null;
  onSelectMetric: (id: string | null) => void;
  simulation: DriftSimulationKey;
  onSimulate: (key: DriftSimulationKey) => void;
  simulationLabel: string | null;
  region: string;
  product: string;
  onNotify: (message: string) => void;
  onRetry: () => void;
}

export function ModelDriftTab({
  panelState, assessment, retraining, selectedMetricId, onSelectMetric,
  simulation, onSimulate, simulationLabel, region, product, onNotify, onRetry,
}: ModelDriftTabProps) {
  const selected = assessment.metrics.find((metric) => metric.id === selectedMetricId) ?? assessment.metrics[0];

  const distributionData = React.useMemo(
    () =>
      selected.trainingDistribution.map((bucket, index) => ({
        bucket: bucket.bucket,
        training: bucket.sharePct,
        current: selected.currentDistribution[index]?.sharePct ?? 0,
      })),
    [selected],
  );

  const frame = (
    <LifecycleStateFrame
      state={panelState}
      title="Model Drift Detection"
      activeFilters={`Region ${region}, product ${product}`}
      errorMessage="Model drift detection could not be loaded"
      onRetry={onRetry}
      heightClass="min-h-[240px]"
    />
  );
  if (panelState !== "ready") return <div data-testid="lifecycle-tab-drift">{frame}</div>;

  return (
    <div className="space-y-3" data-testid="lifecycle-tab-drift">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-slate-900">Model Drift Detection</h3>
        <div className="flex flex-wrap items-center gap-1">
          <label className="flex items-center gap-1 text-[10.5px] text-slate-500">
            <span className="sr-only sm:not-sr-only">Drift simulation</span>
            <select
              aria-label="Drift simulation"
              value={simulation}
              onChange={(event) => onSimulate(event.target.value as DriftSimulationKey)}
              className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[10.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="none">Observed values, no simulation</option>
              {driftSimulations.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
          </label>
          <LifecycleButton onClick={() => onSimulate("none")} disabled={simulation === "none"}>Reset simulation</LifecycleButton>
          <LifecycleButton onClick={() => onNotify(exportDriftSummary(assessment.metrics).message)}>
            Export Drift Summary
          </LifecycleButton>
        </div>
      </div>

      {simulationLabel && (
        <p className="rounded border border-amber-200 bg-amber-50 p-2 text-[10.5px] text-amber-900" data-testid="drift-simulation-banner">
          {simulationLabel} is applied. Values below are simulated for demonstration and are not observed measurements.
        </p>
      )}

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
        <LifecycleStat label="Overall drift status" value={assessment.worstStatus} tone={assessment.worstStatus === "Stable" ? "positive" : "warning"} />
        <LifecycleStat label="Blocking" value={String(assessment.blockingCount)} tone={assessment.blockingCount ? "negative" : "positive"} />
        <LifecycleStat label="Action required" value={String(assessment.actionCount)} tone={assessment.actionCount ? "warning" : "positive"} />
        <LifecycleStat label="Watch" value={String(assessment.watchCount)} />
        <LifecycleStat label="Retraining" value={retraining.level} hint={retraining.targetWindow} />
        <LifecycleStat label="Retraining score" value={String(retraining.score)} hint={retraining.recommendedBy} />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <LifecycleSection
          title="Drift metrics"
          description="Each monitored drift dimension, its score against threshold, the operational effect and the owner accountable for the response."
          testId="drift-metrics"
        >
          <div className="max-h-72 overflow-auto rounded border border-slate-200">
            <table className="w-full text-left text-[10.5px]">
              <caption className="sr-only">Drift metrics</caption>
              <thead className="sticky top-0 bg-slate-50">
                <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-1.5 py-1">Metric</th>
                  <th scope="col" className="px-1.5 py-1">Score</th>
                  <th scope="col" className="px-1.5 py-1">Threshold</th>
                  <th scope="col" className="px-1.5 py-1">Trend</th>
                  <th scope="col" className="px-1.5 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {assessment.metrics.map((metric) => (
                  <tr
                    key={metric.id}
                    data-selected={selected.id === metric.id ? "true" : "false"}
                    className={selected.id === metric.id ? "border-t border-slate-100 bg-blue-50" : "border-t border-slate-100"}
                  >
                    <th scope="row" className="px-1.5 py-1 font-medium text-slate-900">
                      <button
                        type="button"
                        aria-pressed={selected.id === metric.id}
                        onClick={() => onSelectMetric(metric.id)}
                        className="text-left underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {metric.label}
                        <span className="ml-1 font-normal text-slate-500">{metric.category}</span>
                      </button>
                    </th>
                    <td className="px-1.5 py-1 text-slate-900">{metric.score.toFixed(2)}</td>
                    <td className="px-1.5 py-1 text-slate-700">{metric.threshold.toFixed(2)}</td>
                    <td className="px-1.5 py-1 text-slate-700">{metric.trend}</td>
                    <td className="px-1.5 py-1"><DriftBadge status={metric.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LifecycleSection>

        <LifecycleSection
          title={`Distribution comparison, ${selected.label}`}
          description="Training distribution against the current operating distribution. A gap means production no longer looks like the data the model learned from."
          testId="drift-distribution"
          actions={<DriftBadge status={selected.status} />}
        >
          <AnalyticsChartFrame
            title={`Training against current distribution, ${selected.label}`}
            summary={`Scope ${selected.scope}. ${selected.affectedPredictions.toLocaleString()} predictions affected.`}
            heightClass="h-[210px]"
            testId="drift-distribution-chart"
            tableCaption={`Distribution comparison for ${selected.label}`}
            tableHeaders={["Bucket", "Training %", "Current %"]}
            tableRows={distributionData.map((row) => [row.bucket, row.training, row.current])}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#cbd5f5" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} width={34} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="training" name="Training" fill="#94a3b8" isAnimationActive={false} />
                <Bar dataKey="current" name="Current" fill="#2563eb" isAnimationActive={false} />
                <Tooltip
                  cursor={{ fill: "rgba(148,163,184,0.15)" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const training = Number(payload.find((p) => p.dataKey === "training")?.value ?? 0);
                    const current = Number(payload.find((p) => p.dataKey === "current")?.value ?? 0);
                    return (
                      <AnalyticsTooltip
                        title={`${selected.label}, ${label}`}
                        value={`${current}%`}
                        comparison={`Training ${training}%, delta ${(current - training).toFixed(1)}%`}
                        scope={selected.scope}
                        interpretation={selected.operationalEffect}
                        source={`Drift evaluation ${selected.lastEvaluated}`}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsChartFrame>

          <dl className="mt-2 space-y-0.5 text-[10.5px]">
            <div><dt className="inline font-medium text-slate-800">Operational effect. </dt><dd className="inline text-slate-600">{selected.operationalEffect}</dd></div>
            <div><dt className="inline font-medium text-slate-800">Recommended response. </dt><dd className="inline text-slate-600">{selected.recommendedResponse}</dd></div>
            <div><dt className="inline font-medium text-slate-800">Owner. </dt><dd className="inline text-slate-600">{selected.owner}, evaluated {selected.lastEvaluated}</dd></div>
            <div><dt className="inline font-medium text-slate-800">Evidence. </dt><dd className="inline text-slate-600">{selected.evidenceComplete ? "Complete" : "Incomplete, drift cannot be fully evidenced"}</dd></div>
          </dl>
        </LifecycleSection>
      </div>

      <LifecycleSection
        title="Retraining recommendation"
        description="A governed recommendation. Retraining is never triggered from this workspace."
        testId="retraining-recommendation"
        actions={<RetrainingBadge level={retraining.level} />}
      >
        <p className="text-[10.5px] text-slate-600">
          Recommended by {retraining.recommendedBy}, target window {retraining.targetWindow}, weighted score {retraining.score}.
        </p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10.5px] text-slate-700">
          {retraining.reasons.map((reason) => <li key={reason}>{reason}</li>)}
        </ul>
      </LifecycleSection>
    </div>
  );
}
