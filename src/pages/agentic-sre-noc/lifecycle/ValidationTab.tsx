/**
 * AIM-005 — Validation tab.
 */

import * as React from "react";
import {
  explainabilityDimensions,
  explainabilityRecords,
  holdoutRules,
  releaseGates,
  validationSegments,
  validationSplits,
  validationSummary,
  validationViews,
  type ValidationView,
} from "./lifecycleFixtures";
import { calculateValidationGateStatus } from "./lifecycleCalculations";
import { exportExplainabilityResults, exportValidationResults } from "./lifecycleExport";
import { GateBadge, LifecycleButton, LifecycleSection, LifecycleStat, LifecycleStateFrame } from "./LifecyclePrimitives";
import { ValidationPerformanceMatrix } from "./ValidationPerformanceMatrix";
import type { ExplainabilityQuality } from "./lifecycleTypes";
import type { LifecyclePanelState } from "./useLifecycleState";

export interface ValidationTabProps {
  panelState: LifecyclePanelState;
  view: ValidationView;
  onViewChange: (view: ValidationView) => void;
  selectedSegmentId: string | null;
  onSelectSegment: (id: string | null) => void;
  explainabilityQuality: ExplainabilityQuality;
  region: string;
  product: string;
  onNotify: (message: string) => void;
  onRetry: () => void;
}

const segmentDimensions = ["All dimensions", ...Array.from(new Set(validationSegments.map((s) => s.dimension)))];

export function ValidationTab({
  panelState, view, onViewChange, selectedSegmentId, onSelectSegment,
  explainabilityQuality, region, product, onNotify, onRetry,
}: ValidationTabProps) {
  const [dimensionFilter, setDimensionFilter] = React.useState<string>("All dimensions");

  const segments = React.useMemo(
    () => (dimensionFilter === "All dimensions" ? validationSegments : validationSegments.filter((s) => s.dimension === dimensionFilter)),
    [dimensionFilter],
  );

  const frame = (
    <LifecycleStateFrame
      state={panelState}
      title="Model Validation Results"
      activeFilters={`Region ${region}, product ${product}`}
      onClearFilters={() => setDimensionFilter("All dimensions")}
      errorMessage="Model validation results could not be loaded"
      onRetry={onRetry}
      heightClass="min-h-[240px]"
    />
  );
  if (frame) return <div data-testid="lifecycle-tab-validation">{frame}</div>;

  return (
    <div className="space-y-3" data-testid="lifecycle-tab-validation">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-slate-900">Model Validation Results</h3>
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Validation view">
          {validationViews.map((option) => (
            <LifecycleButton
              key={option}
              active={view === option}
              onClick={() => { onViewChange(option); onNotify(`${option} view selected.`); }}
            >
              {option}
            </LifecycleButton>
          ))}
          <LifecycleButton onClick={() => onNotify(exportValidationResults(segments).message)}>
            Export Validation Results
          </LifecycleButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
        {validationSummary.map((metric) => {
          const meets = metric.higherIsBetter ? metric.value >= metric.target : metric.value <= metric.target;
          return (
            <LifecycleStat
              key={metric.key}
              label={metric.label}
              value={`${metric.value}${metric.unit === "%" ? "%" : " min"}`}
              hint={`Target ${metric.target}${metric.unit === "%" ? "%" : " min"}`}
              tone={meets ? "positive" : "warning"}
            />
          );
        })}
      </div>

      {view === "Holdout Performance" && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <LifecycleSection
            title="Holdout construction"
            description="How the corpus was split, and the rules that protect the final holdout from leakage."
            testId="validation-splits"
          >
            <table className="w-full text-left text-[10.5px]">
              <caption className="sr-only">Validation splits</caption>
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                  <th scope="col" className="py-1">Split</th>
                  <th scope="col" className="py-1">Window</th>
                  <th scope="col" className="py-1">Samples</th>
                  <th scope="col" className="py-1">Share</th>
                </tr>
              </thead>
              <tbody>
                {validationSplits.map((split) => (
                  <tr key={split.key} className="border-t border-slate-100">
                    <th scope="row" className="py-1 font-medium text-slate-900">{split.label}</th>
                    <td className="py-1 text-slate-700">{split.window}</td>
                    <td className="py-1 text-slate-700">{split.samples.toLocaleString()}</td>
                    <td className="py-1 text-slate-700">{split.sharePct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[10.5px] text-slate-600">
              {holdoutRules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </LifecycleSection>

          <LifecycleSection
            title="Release gates"
            description="Each validation gate with its target, measured value, evidence and reviewer."
            testId="validation-gates"
          >
            <div className="max-h-60 overflow-auto rounded border border-slate-200">
              <table className="w-full text-left text-[10.5px]">
                <caption className="sr-only">Validation release gates</caption>
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-1.5 py-1">Gate</th>
                    <th scope="col" className="px-1.5 py-1">Target</th>
                    <th scope="col" className="px-1.5 py-1">Actual</th>
                    <th scope="col" className="px-1.5 py-1">Status</th>
                    <th scope="col" className="px-1.5 py-1">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {releaseGates.map((gate) => (
                    <tr key={gate.id} className="border-t border-slate-100">
                      <th scope="row" className="px-1.5 py-1 font-medium text-slate-900">{gate.label}</th>
                      <td className="px-1.5 py-1 text-slate-700">{gate.target}</td>
                      <td className="px-1.5 py-1 text-slate-900">{gate.actualValue}{gate.unit === "%" ? "%" : gate.unit === "min" ? " min" : ""}</td>
                      <td className="px-1.5 py-1"><GateBadge status={calculateValidationGateStatus(gate)} /></td>
                      <td className="px-1.5 py-1 text-slate-600">{gate.evidence}, {gate.reviewer}, {gate.reviewDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LifecycleSection>
        </div>
      )}

      {view === "Segment Performance" && (
        <ValidationPerformanceMatrix
          segments={segments}
          selectedSegmentId={selectedSegmentId}
          onSelectSegment={onSelectSegment}
          dimensionFilter={dimensionFilter}
          onDimensionFilterChange={setDimensionFilter}
          dimensions={segmentDimensions}
          activeFilters={`Dimension ${dimensionFilter}, region ${region}, product ${product}`}
          onClearFilters={() => setDimensionFilter("All dimensions")}
        />
      )}

      {view === "Explainability Validation" && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <LifecycleSection
            title="Explanation quality"
            description="Whether the explanation shown with each prediction is complete, stable and trusted by engineers."
            testId="explainability-quality"
            actions={
              <>
                <GateBadge status={explainabilityQuality.status} />
                <LifecycleButton onClick={() => onNotify(exportExplainabilityResults().message)}>
                  Export Explainability Results
                </LifecycleButton>
              </>
            }
          >
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {explainabilityDimensions.map((dimension) => (
                <LifecycleStat
                  key={dimension.key}
                  label={dimension.label}
                  value={`${explainabilityQuality[dimension.metric as keyof ExplainabilityQuality]}%`}
                  hint={dimension.description}
                />
              ))}
            </div>
          </LifecycleSection>

          <LifecycleSection
            title="Sampled explanations"
            description="Individual predictions with their supporting, contradicting and missing evidence."
            testId="explainability-records"
          >
            <div className="max-h-60 space-y-1.5 overflow-auto pr-1">
              {explainabilityRecords.map((record) => (
                <article key={record.id} className="rounded border border-slate-200 bg-slate-50/60 p-2">
                  <header className="flex flex-wrap items-center justify-between gap-1">
                    <h5 className="text-[11px] font-semibold text-slate-900">{record.linkId}, {record.primaryFactor}</h5>
                    <span className="text-[10px] text-slate-500">{record.predictionId}, human {record.humanAgreement.toLowerCase()}</span>
                  </header>
                  <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10.5px] sm:grid-cols-3">
                    <div><dt className="inline text-slate-500">Evidence </dt><dd className="inline text-slate-900">{record.evidenceCompletenessPct}%</dd></div>
                    <div><dt className="inline text-slate-500">Stability </dt><dd className="inline text-slate-900">{record.factorStabilityPct}%</dd></div>
                    <div><dt className="inline text-slate-500">Confidence </dt><dd className="inline text-slate-900">{record.explanationConfidencePct}%</dd></div>
                    <div><dt className="inline text-slate-500">Latency </dt><dd className="inline text-slate-900">{record.explanationLatencyMs} ms</dd></div>
                    <div><dt className="inline text-slate-500">Rule override </dt><dd className="inline text-slate-900">{record.ruleOverride ? "Yes" : "No"}</dd></div>
                  </dl>
                  <p className="mt-1 text-[10.5px] text-slate-600">
                    <span className="font-medium text-slate-800">Supporting.</span> {record.supportingEvidence.join("; ")}
                  </p>
                  {record.contradictingEvidence.length > 0 && (
                    <p className="text-[10.5px] text-slate-600">
                      <span className="font-medium text-slate-800">Contradicting.</span> {record.contradictingEvidence.join("; ")}
                    </p>
                  )}
                  {record.missingEvidence.length > 0 && (
                    <p className="text-[10.5px] text-amber-700">
                      <span className="font-medium">Missing.</span> {record.missingEvidence.join("; ")}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </LifecycleSection>
        </div>
      )}
    </div>
  );
}
