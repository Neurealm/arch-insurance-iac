/**
 * AIM-005 — Training Data tab.
 */

import * as React from "react";
import { trainingDataset, SYNTHETIC_NOTICE } from "./lifecycleFixtures";
import { TrainingDataCompositionChart } from "./TrainingDataCompositionChart";
import { DataQualityPanel, DatasetCoveragePanel, TrainingProvenancePanel } from "./DatasetCoveragePanel";
import { LifecycleSection, LifecycleStat, LifecycleStateFrame } from "./LifecyclePrimitives";
import type { CoverageDimension, TrainingProvenanceRecord } from "./lifecycleTypes";
import type { CoverageScoreResult } from "./lifecycleCalculations";
import type { LifecyclePanelState } from "./useLifecycleState";

export interface TrainingDataTabProps {
  panelState: LifecyclePanelState;
  selectedCategory: string | null;
  onSelectCategory: (key: string | null) => void;
  coverageDimension: CoverageDimension;
  onCoverageDimensionChange: (dimension: CoverageDimension) => void;
  coverageScore: CoverageScoreResult;
  qualityScore: number;
  region: string;
  product: string;
  onOpenProvenance: (record: TrainingProvenanceRecord) => void;
  onNotify: (message: string) => void;
  onRetry: () => void;
}

export function TrainingDataTab({
  panelState, selectedCategory, onSelectCategory, coverageDimension, onCoverageDimensionChange,
  coverageScore, qualityScore, region, product, onOpenProvenance, onNotify, onRetry,
}: TrainingDataTabProps) {
  const frame = (
    <LifecycleStateFrame
      state={panelState}
      title="Model Training Data"
      emptyReason="No training data is registered for the current scope"
      activeFilters={`Region ${region}, product ${product}`}
      onClearFilters={() => onNotify("Training data scope reset to all regions and products.")}
      errorMessage="Model training data could not be loaded"
      onRetry={onRetry}
      heightClass="min-h-[240px]"
    />
  );
  if (panelState !== "ready") return <div data-testid="lifecycle-tab-training">{frame}</div>;

  return (
    <div className="space-y-3" data-testid="lifecycle-tab-training">
      <h3 className="text-[13px] font-semibold text-slate-900">Model Training Data</h3>
      <p className="text-[10.5px] text-slate-500">{SYNTHETIC_NOTICE}</p>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
        <LifecycleStat label="Total training samples" value={trainingDataset.totalSamplesLabel} hint={`${trainingDataset.totalSamples.toLocaleString()} rows`} />
        <LifecycleStat label="Training window" value={trainingDataset.windowLabel} />
        <LifecycleStat label="Dataset version" value={trainingDataset.version} hint={`Prior ${trainingDataset.priorVersion ?? "none"}`} />
        <LifecycleStat label="Data quality score" value={`${trainingDataset.qualityScorePct}%`} hint={`Calculated ${qualityScore}%`} tone="positive" />
        <LifecycleStat label="Lineage status" value={trainingDataset.lineageStatus} tone="positive" />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <LifecycleSection
          title="Training composition"
          description="What data trained the predictive capability, by signal family."
          testId="training-composition-section"
        >
          <TrainingDataCompositionChart
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
            panelState={panelState}
            onNotify={onNotify}
          />
        </LifecycleSection>

        <DatasetCoveragePanel
          dimension={coverageDimension}
          onDimensionChange={onCoverageDimensionChange}
          coverageScore={coverageScore}
          region={region}
          product={product}
          onOpenProvenance={onOpenProvenance}
          onNotify={onNotify}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <DataQualityPanel qualityScore={qualityScore} />
        <TrainingProvenancePanel onOpen={onOpenProvenance} />
      </div>
    </div>
  );
}
