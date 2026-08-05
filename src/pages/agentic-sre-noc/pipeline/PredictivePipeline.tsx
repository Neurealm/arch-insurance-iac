/**
 * AIM-002 — Predictive Optical Link Risk Model Pipeline.
 *
 * Functional six-stage engineering workflow:
 * Observe → Engineer → Detect → Predict → Impact → Act.
 *
 * All values are synthetic Taara-aligned demonstration data and every
 * interaction stays on this page.
 */

import * as React from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { PipelineStageSelector } from "./PipelineStageSelector";
import { PipelineStatusSummary, type StatusSummaryValue } from "./PipelineStatusSummary";
import { PipelineColumn } from "./PipelineColumn";
import { PipelineConnector, PipelineConnectorSummary } from "./PipelineConnector";
import { SignalInputColumn } from "./SignalInputColumn";
import { FeatureEngineeringColumn } from "./FeatureEngineeringColumn";
import { AnomalyDetectionColumn } from "./AnomalyDetectionColumn";
import { RiskPredictionColumn } from "./RiskPredictionColumn";
import { ServiceImpactColumn } from "./ServiceImpactColumn";
import { ActionComparisonPanel, RecommendedActionsColumn } from "./RecommendedActionsColumn";
import { FeatureDetailDrawer } from "./FeatureDetailDrawer";
import { PipelineDrawer } from "./PipelineDrawer";
import { usePipelineState } from "./usePipelineState";
import { calculateThresholdOutcome } from "./calculations";
import {
  allSignals, anomalyRecords, engineeredFeatures, ensembleResult, pipelineActions, pipelineEvidence,
  pipelineStageDetails, type PipelineStageKey,
} from "../data/pliPipelineFixtures";

const STAGE_ORDER: PipelineStageKey[] = ["observe", "engineer", "detect", "predict", "impact", "act"];

const STAGE_TO_COLUMN: Record<PipelineStageKey, string> = {
  observe: "signals",
  engineer: "features",
  detect: "anomalies",
  predict: "ensemble",
  impact: "impact",
  act: "actions",
};

const PRODUCT_OPTIONS = ["All products", "Lightbridge Terminal", "Metro Backhaul", "Enterprise Access"];
const REGION_OPTIONS = ["All regions", "India South", "India West", "Africa East", "Americas", "Europe"];

export function PredictivePipeline() {
  const s = usePipelineState();
  const [expanded, setExpanded] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  const stageDetail = React.useMemo(
    () => pipelineStageDetails.find((d) => d.key === s.stage) ?? pipelineStageDetails[3],
    [s.stage],
  );

  /* ---- derived selections ---- */

  const highlightedFeatureIds = React.useMemo(() => {
    if (s.selectedSignalId) {
      const signal = allSignals.find((x) => x.id === s.selectedSignalId);
      return signal?.featureIds ?? [];
    }
    return [];
  }, [s.selectedSignalId]);

  const highlightedSignalIds = React.useMemo(() => {
    if (s.selectedFeatureId) {
      return engineeredFeatures.find((f) => f.id === s.selectedFeatureId)?.signalIds ?? [];
    }
    return [];
  }, [s.selectedFeatureId]);

  const highlightedModelIds = React.useMemo(() => {
    if (s.selectedFeatureId) {
      return engineeredFeatures.find((f) => f.id === s.selectedFeatureId)?.downstreamModelIds ?? [];
    }
    return [];
  }, [s.selectedFeatureId]);

  const filteredAnomalies = React.useMemo(
    () =>
      anomalyRecords.filter(
        (r) =>
          (s.riskFilter === "All" || r.riskClass === s.riskFilter) &&
          (s.productFilter === "All products" || r.product === s.productFilter) &&
          (s.regionFilter === "All regions" || r.region === s.regionFilter) &&
          r.baselineDeviation >= s.brush.min &&
          r.baselineDeviation <= s.brush.max,
      ),
    [s.riskFilter, s.productFilter, s.regionFilter, s.brush],
  );

  const outcome = React.useMemo(
    () => calculateThresholdOutcome(s.threshold, ensembleResult.riskProbability),
    [s.threshold],
  );

  const activeConnectorIds = React.useMemo(() => {
    switch (s.stage) {
      case "observe": return ["signals-features"];
      case "engineer": return ["signals-features", "features-anomalies"];
      case "detect": return ["features-anomalies", "anomalies-model"];
      case "predict": return ["anomalies-model", "model-impact"];
      case "impact": return ["model-impact", "impact-actions"];
      default: return ["impact-actions"];
    }
  }, [s.stage]);

  const selectedAction = pipelineActions.find((a) => a.id === s.selectedActionId) ?? pipelineActions[0];
  const selectedActionState = s.actionRuntime[selectedAction.id]?.state ?? selectedAction.status;

  const summaryValues: StatusSummaryValue[] = [
    { label: "Selected link", value: s.selectedLinkId },
    { label: "Active stage", value: `${stageDetail.title}, ${stageDetail.state}` },
    { label: "Current result", value: stageDetail.currentResult },
    { label: "Risk probability", value: `${ensembleResult.riskProbability.toFixed(2)}, ${outcome.selectedLinkClass}`, tone: "critical" },
    { label: "Confidence", value: `${ensembleResult.confidencePct}% at ${s.threshold}% threshold` },
    { label: "Customer service exposed", value: "SVC-CHN-CORE-10G, 10 Gbps", tone: "warning" },
    { label: "Recommended action", value: selectedAction.name, tone: "positive" },
    { label: "Approval state", value: selectedActionState },
    { label: "Evidence completeness", value: `${pipelineEvidence.length} of ${pipelineEvidence.length} references` },
    { label: "Data quality", value: "0.96, telemetry complete" },
  ];

  const columnState = s.columnState;
  const emphasise = (col: string) => STAGE_TO_COLUMN[s.stage] === col;

  const stageIndex = STAGE_ORDER.indexOf(s.stage);

  const handleSimulate = React.useCallback(
    (id: string) => {
      if (id === "investigate") {
        setNotice("Investigation confirmation only in this stage. No investigation was created.");
        s.announce("Investigation confirmation shown");
        return;
      }
      s.updateAction(id, { simulated: true });
      setNotice(
        `Simulated locally: fallback carries 10 Gbps with 42% headroom, predicted customer impact avoided, error-budget exposure reduced by 22%. Confidence ${outcome.precisionPct}% precision at the current threshold.`,
      );
      s.announce("Action simulated");
    },
    [outcome.precisionPct, s],
  );

  /* ---- column renderers ---- */

  const columns: { id: string; title: string; subtitle: string; stage: PipelineStageKey; body: React.ReactNode; footer: React.ReactNode }[] = [
    {
      id: "signals", title: "Signal Inputs", subtitle: "40 signals across four groups", stage: "observe",
      body: (
        <SignalInputColumn
          expandedGroups={s.expandedGroups}
          onToggleGroup={s.toggleGroup}
          selectedSignalId={s.selectedSignalId}
          onSelectSignal={s.selectSignal}
          pinnedSignalIds={s.pinnedSignalIds}
          onTogglePin={s.togglePin}
          contributingOnly={s.contributingOnly}
          onContributingOnlyChange={s.setContributingOnly}
          onReset={() => s.selectSignal(null)}
          highlightedSignalIds={highlightedSignalIds}
        />
      ),
      footer: <>Deterministic collection · {s.pinnedSignalIds.length} pinned</>,
    },
    {
      id: "features", title: "Feature Engineering", subtitle: "12 deterministic engineering features", stage: "engineer",
      body: (
        <FeatureEngineeringColumn
          selectedFeatureId={s.selectedFeatureId}
          onSelectFeature={s.selectFeature}
          highlightedFeatureIds={highlightedFeatureIds}
        />
      ),
      footer: <>Deterministic · Select a feature for its synthetic reference calculation</>,
    },
    {
      id: "anomalies", title: "Anomaly Detection", subtitle: "Baseline deviation against rate of change", stage: "detect",
      body: (
        <AnomalyDetectionColumn
          records={filteredAnomalies}
          selectedLinkId={s.selectedLinkId}
          onSelectLink={s.selectLink}
          onHoverLink={s.setHoveredLinkId}
          riskFilter={s.riskFilter}
          onRiskFilter={s.setRiskFilter}
          productFilter={s.productFilter}
          onProductFilter={s.setProductFilter}
          regionFilter={s.regionFilter}
          onRegionFilter={s.setRegionFilter}
          brush={s.brush}
          onBrush={s.setBrush}
          onResetView={() => {
            s.setBrush({ min: -2, max: 4 });
            s.setRiskFilter("All");
            s.setProductFilter("All products");
            s.setRegionFilter("All regions");
          }}
          products={PRODUCT_OPTIONS}
          regions={REGION_OPTIONS}
        />
      ),
      footer: <>Deterministic services with two model-based detectors</>,
    },
    {
      id: "ensemble", title: "Risk Prediction Model Ensemble", subtitle: "Seven weighted components, v2.4.1", stage: "predict",
      body: (
        <RiskPredictionColumn
          selectedModelId={s.selectedModelId}
          onSelectModel={s.selectModel}
          highlightedModelIds={highlightedModelIds}
          thresholdInput={s.thresholdInput}
          onThresholdChange={s.setThreshold}
          outcome={outcome}
          linkId={s.selectedLinkId}
        />
      ),
      footer: <>Model-based, calibrated, deterministic engineering rules can override</>,
    },
    {
      id: "impact", title: "Customer and Service Impact", subtitle: "Service, SLO and blast-radius exposure", stage: "impact",
      body: (
        <ServiceImpactColumn
          selectedImpactId={s.selectedImpactId}
          onSelectImpact={s.selectImpact}
          selectedNodeId={s.selectedNodeId}
          onSelectNode={s.selectNode}
        />
      ),
      footer: <>Deterministic service-impact calculation</>,
    },
    {
      id: "actions", title: "Recommended Actions", subtitle: "Ranked, governed and reversible", stage: "act",
      body: (
        <RecommendedActionsColumn
          selectedActionId={s.selectedActionId}
          onSelectAction={s.selectAction}
          runtime={s.actionRuntime}
          onUpdate={(id, patch) => {
            s.updateAction(id, patch);
            setNotice(
              patch.owner
                ? `Owner assigned locally: ${patch.owner}.`
                : `Local action state updated to ${patch.state}. No external approval workflow was called.`,
            );
          }}
          onCompare={() => s.setComparisonOpen(!s.comparisonOpen)}
          onEvidence={() => s.setEvidenceDrawerOpen(true)}
          onSimulate={handleSimulate}
          notice={notice}
        />
      ),
      footer: <>Human governed · Approval required for high-impact actions</>,
    },
  ];

  return (
    <div
      data-testid="predictive-pipeline"
      className={cn("space-y-2", expanded && "fixed inset-0 z-40 overflow-y-auto bg-white p-4")}
    >
      <div className="sr-only" role="status" aria-live="polite">{s.announcement}</div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10.5px] text-slate-500">
          Synthetic reference logic. Deterministic stages are labelled separately from model-based inference.
        </p>
        <div className="flex items-center gap-1">
          <label className="flex items-center gap-1 text-[10px] text-slate-600">
            Stage data
            <select
              aria-label="Pipeline stage data state"
              value={columnState}
              data-testid="pipeline-state-select"
              onChange={(e) => s.setColumnState(e.target.value as typeof columnState)}
              className="rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {["ready", "loading", "empty", "error"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <button
            type="button"
            onClick={s.reset}
            data-testid="pipeline-reset"
            className="flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />Reset pipeline
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-pressed={expanded}
            data-testid="pipeline-fullscreen"
            className="flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {expanded ? <Minimize2 className="h-3 w-3" aria-hidden /> : <Maximize2 className="h-3 w-3" aria-hidden />}
            {expanded ? "Exit full-screen pipeline" : "Full-screen pipeline"}
          </button>
        </div>
      </div>

      <PipelineStageSelector stage={s.stage} onSelect={s.setStage} />
      <PipelineStatusSummary stageDetail={stageDetail} values={summaryValues} />
      <PipelineConnector activeIds={activeConnectorIds} />
      <PipelineConnectorSummary activeIds={activeConnectorIds} />

      {/* mobile vertical stepper controls */}
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <button
          type="button"
          data-testid="pipeline-prev-stage"
          disabled={stageIndex === 0}
          onClick={() => s.setStage(STAGE_ORDER[Math.max(0, stageIndex - 1)])}
          className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[10.5px] font-medium text-slate-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ChevronLeft className="h-3 w-3" aria-hidden />Previous stage
        </button>
        <span className="text-[10.5px] text-slate-600">Stage {stageIndex + 1} of {STAGE_ORDER.length}</span>
        <button
          type="button"
          data-testid="pipeline-next-stage"
          disabled={stageIndex === STAGE_ORDER.length - 1}
          onClick={() => s.setStage(STAGE_ORDER[Math.min(STAGE_ORDER.length - 1, stageIndex + 1)])}
          className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[10.5px] font-medium text-slate-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Next stage<ChevronRight className="h-3 w-3" aria-hidden />
        </button>
      </div>

      <div
        id="pipeline-columns"
        role="tabpanel"
        aria-labelledby={`pipeline-stage-tab-${s.stage}`}
        className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        {columns.map((c) => (
          <div
            key={c.id}
            data-stage-column={c.id}
            className={cn(
              "min-h-0",
              /* mobile shows one active stage at a time */
              c.stage === s.stage ? "block" : "hidden lg:block",
            )}
          >
            <PipelineColumn
              id={c.id}
              title={c.title}
              subtitle={c.subtitle}
              stageLabel={c.stage}
              emphasis={emphasise(c.id)}
              state={columnState}
              resultSummary={pipelineStageDetails.find((d) => d.key === c.stage)?.currentResult ?? "not available"}
              freshness="30 seconds ago"
              onRetry={() => s.setColumnState("ready")}
              footer={c.footer}
            >
              <div className="max-h-[520px]">{c.body}</div>
            </PipelineColumn>
          </div>
        ))}
      </div>

      {s.comparisonOpen && <ActionComparisonPanel onClose={() => s.setComparisonOpen(false)} />}

      <FeatureDetailDrawer
        open={s.featureDrawerOpen}
        featureId={s.selectedFeatureId}
        onClose={() => s.setFeatureDrawerOpen(false)}
      />

      <PipelineDrawer
        open={s.evidenceDrawerOpen}
        onClose={() => s.setEvidenceDrawerOpen(false)}
        title="Evidence for the recommended action"
        subtitle={`${s.selectedLinkId} · ${selectedAction.name}`}
        testId="evidence-drawer"
      >
        <ul className="space-y-1.5 text-[11px]">
          {pipelineEvidence.map((e) => (
            <li key={e.id} className="rounded border border-slate-200 px-2 py-1.5">
              <span className="block font-medium text-slate-900">{e.label}</span>
              <span className="block text-slate-600">{e.detail}</span>
            </li>
          ))}
        </ul>
      </PipelineDrawer>
    </div>
  );
}

export default PredictivePipeline;
