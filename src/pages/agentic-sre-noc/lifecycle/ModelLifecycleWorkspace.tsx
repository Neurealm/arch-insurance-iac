/**
 * AIM-005 — Model Lifecycle workspace hub.
 *
 * Tabbed container for Training Data, Validation, Backtesting, Drift and
 * Governance. Read-only apart from clearly labelled local demonstrations.
 */

import * as React from "react";
import { lifecycleTabs, modelVersions, SYNTHETIC_NOTICE, trainingProvenance } from "./lifecycleFixtures";
import { useLifecycleState, type LifecycleContext } from "./useLifecycleState";
import { LifecycleButton } from "./LifecyclePrimitives";
import { TrainingDataTab } from "./TrainingDataTab";
import { ValidationTab } from "./ValidationTab";
import { BacktestingTab } from "./BacktestingTab";
import { ModelDriftTab } from "./ModelDriftTab";
import { ModelGovernanceTab } from "./ModelGovernanceTab";
import type { TrainingProvenanceRecord } from "./lifecycleTypes";

export function ModelLifecycleWorkspace({ context }: { context: LifecycleContext }) {
  const state = useLifecycleState(context);
  const [provenance, setProvenance] = React.useState<TrainingProvenanceRecord | null>(null);

  const onRetry = React.useCallback(() => {
    state.setPanelState("ready");
    state.announce("Lifecycle data reloaded.");
  }, [state]);

  const activeModel = modelVersions.find((version) => version.version === state.activeVersion);

  return (
    <section
      aria-label="Model lifecycle workspace"
      data-testid="model-lifecycle-workspace"
      className="rounded-lg border border-slate-200 bg-white p-3"
    >
      <header className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold text-slate-900">Model Lifecycle, Validation and Governance</h2>
          <p className="text-[10.5px] text-slate-500">
            Active model {state.activeVersion}{activeModel ? `, ${activeModel.label}` : ""}, rollback {state.rollbackVersion}.
            Region {context.region}, product {context.product}, horizon {context.horizon}, threshold {context.thresholdPct} percent. {SYNTHETIC_NOTICE}
          </p>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Model lifecycle sections"
        data-testid="lifecycle-tablist"
        className="mb-3 flex gap-1 overflow-x-auto pb-1"
      >
        {lifecycleTabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            type="button"
            id={`lifecycle-tab-${tab.replace(/\s+/g, "-").toLowerCase()}`}
            aria-selected={state.tab === tab}
            aria-controls="lifecycle-tabpanel"
            onClick={() => { state.setTab(tab); state.announce(`${tab} selected.`); }}
            className={`shrink-0 rounded border px-2 py-1 text-[11px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              state.tab === tab ? "border-blue-300 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div id="lifecycle-tabpanel" role="tabpanel" aria-live="off">
        {state.tab === "Training Data" && (
          <TrainingDataTab
            panelState={state.panelState}
            selectedCategory={state.trainingCategory}
            onSelectCategory={state.selectTrainingCategory}
            coverageDimension={state.coverageDimension}
            onCoverageDimensionChange={state.setCoverageDimension}
            coverageScore={state.coverageScore}
            qualityScore={state.datasetQualityScore}
            region={context.region}
            product={context.product}
            onOpenProvenance={setProvenance}
            onNotify={state.announce}
            onRetry={onRetry}
          />
        )}
        {(state.tab === "Validation" || state.tab === "Explainability") && (
          <ValidationTab
            panelState={state.panelState}
            view={state.validationView}
            onViewChange={state.setValidationView}
            selectedSegmentId={state.validationSegmentId}
            onSelectSegment={state.selectValidationSegment}
            explainabilityQuality={state.explainabilityQuality}
            region={context.region}
            product={context.product}
            horizon={context.horizon}
            selectedLinkId={context.selectedLinkId}
            thresholdPct={context.thresholdPct}
            onNotify={state.announce}
            onRetry={onRetry}
          />
        )}
        {state.tab === "Backtesting" && (
          <BacktestingTab
            panelState={state.panelState}
            version={state.selectedVersion}
            metric={state.backtestMetric}
            onMetricChange={state.setBacktestMetric}
            summary={state.backtestSummary}
            region={context.region}
            product={context.product}
            onNotify={state.announce}
            onRetry={onRetry}
          />
        )}
        {state.tab === "Drift" && (
          <ModelDriftTab
            panelState={state.panelState}
            assessment={state.driftAssessment}
            retraining={state.retraining}
            selectedMetricId={state.driftMetricId}
            onSelectMetric={state.selectDriftMetric}
            simulation={state.driftSimulation}
            onSimulate={state.simulateDrift}
            simulationLabel={state.simulationLabel}
            region={context.region}
            product={context.product}
            onNotify={state.announce}
            onRetry={onRetry}
          />
        )}
        {state.tab === "Governance" && (
          <ModelGovernanceTab
            panelState={state.panelState}
            activeVersion={state.activeVersion}
            rollbackVersion={state.rollbackVersion}
            selectedVersion={state.selectedVersion}
            comparisonVersion={state.comparisonVersion}
            onSelectedVersionChange={state.setSelectedVersion}
            onComparisonVersionChange={state.setComparisonVersion}
            comparison={state.versionComparison}
            readiness={state.governanceReadiness}
            promotion={state.promotionDecision}
            rollback={state.rollbackDecision}
            onPromote={state.promote}
            onRollback={state.rollback}
            notes={state.notes}
            onAddNote={state.addNote}
            activity={state.activity}
            activityQuery={state.activityQuery}
            onActivityQueryChange={state.setActivityQuery}
            activityGroup={state.activityGroup}
            onActivityGroupChange={state.setActivityGroup}
            selectedTimelineEventId={state.selectedTimelineEventId}
            onSelectTimelineEvent={state.selectTimelineEvent}
            onNotify={state.announce}
            onRetry={onRetry}
          />
        )}
      </div>

      {provenance && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={`Provenance detail, ${provenance.source}`}
          data-testid="provenance-drawer"
          className="mt-3 rounded-lg border border-blue-200 bg-white p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-[12px] font-semibold text-slate-900">{provenance.source}</h4>
            <LifecycleButton onClick={() => setProvenance(null)}>Close</LifecycleButton>
          </div>
          <dl className="mt-1 grid grid-cols-1 gap-x-4 gap-y-0.5 text-[10.5px] sm:grid-cols-2">
            <div><dt className="inline text-slate-500">Owner. </dt><dd className="inline text-slate-800">{provenance.owner}</dd></div>
            <div><dt className="inline text-slate-500">Collection period. </dt><dd className="inline text-slate-800">{provenance.collectionPeriod}</dd></div>
            <div><dt className="inline text-slate-500">Lineage. </dt><dd className="inline text-slate-800">{provenance.lineageStatus}</dd></div>
            <div><dt className="inline text-slate-500">Approval. </dt><dd className="inline text-slate-800">{provenance.approvalStatus}</dd></div>
          </dl>
          <p className="mt-1 text-[10.5px] text-slate-600">
            {trainingProvenance.length} registered sources contribute to the training corpus.
          </p>
        </div>
      )}

      <p aria-live="polite" role="status" className="sr-only" data-testid="lifecycle-announcement">
        {state.announcement}
      </p>
    </section>
  );
}
