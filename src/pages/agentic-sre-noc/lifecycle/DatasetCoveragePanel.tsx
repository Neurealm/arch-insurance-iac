/**
 * AIM-005 — dataset coverage, class balance and data quality panels.
 */

import * as React from "react";
import { AnalyticsDataTable } from "../analytics/AnalyticsPrimitives";
import {
  classBalance,
  classBalanceRationale,
  coverageDimensions,
  dataQuality,
  samplingStrategies,
  trainingCoverage,
  trainingProvenance,
} from "./lifecycleFixtures";
import { ComparisonBar, GateBadge, LifecycleButton, LifecycleSection, LifecycleStat } from "./LifecyclePrimitives";
import type { CoverageDimension, TrainingProvenanceRecord } from "./lifecycleTypes";
import type { CoverageScoreResult } from "./lifecycleCalculations";
import { calculateClassBalanceScore } from "./lifecycleCalculations";

export interface DatasetCoveragePanelProps {
  dimension: CoverageDimension;
  onDimensionChange: (dimension: CoverageDimension) => void;
  coverageScore: CoverageScoreResult;
  region: string;
  product: string;
  onOpenProvenance: (record: TrainingProvenanceRecord) => void;
  onNotify: (message: string) => void;
}

export function DatasetCoveragePanel({
  dimension, onDimensionChange, coverageScore, region, product, onOpenProvenance, onNotify,
}: DatasetCoveragePanelProps) {
  const rows = React.useMemo(
    () => trainingCoverage.filter((record) => record.dimension === dimension),
    [dimension],
  );

  /* Page region and product context highlights the matching coverage row. */
  const contextLabel = dimension === "Regions" ? region : dimension === "Products" ? product : null;
  const balance = React.useMemo(() => calculateClassBalanceScore(classBalance), []);

  return (
    <div className="space-y-3">
      <LifecycleSection
        title="Dataset coverage"
        description="Training representation compared with the live operating estate. A large gap means the model has seen less of that population than production contains."
        testId="dataset-coverage"
        actions={
          <label className="flex items-center gap-1 text-[10.5px] text-slate-500">
            <span className="sr-only sm:not-sr-only">Coverage dimension</span>
            <select
              aria-label="Coverage dimension"
              value={dimension}
              onChange={(event) => {
                onDimensionChange(event.target.value as CoverageDimension);
                onNotify(`Coverage dimension ${event.target.value} selected.`);
              }}
              className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[10.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {coverageDimensions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        }
      >
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <LifecycleStat label="Coverage score" value={`${coverageScore.scorePct}%`} hint={`${dimension} vs estate`} tone={coverageScore.scorePct >= 90 ? "positive" : "warning"} />
          <LifecycleStat label="Largest gap" value={coverageScore.worstGap ? `${coverageScore.worstGap.deltaPct > 0 ? "+" : ""}${coverageScore.worstGap.deltaPct}%` : "—"} hint={coverageScore.worstGap?.label ?? "No records"} />
          <LifecycleStat label="Under-represented" value={String(coverageScore.underrepresented.length)} hint={coverageScore.underrepresented.join(", ") || "None"} tone={coverageScore.underrepresented.length ? "warning" : "positive"} />
          <LifecycleStat label="Buckets" value={String(rows.length)} hint={`Dimension ${dimension}`} />
        </div>

        <ul className="mt-2 space-y-0.5" aria-label={`Training coverage by ${dimension}`}>
          {rows.map((record) => (
            <li key={record.key} className={contextLabel && contextLabel.includes(record.label) ? "rounded ring-1 ring-blue-200" : undefined}>
              <ComparisonBar
                label={record.label}
                valuePct={record.sharePct}
                referencePct={record.estateSharePct}
                referenceLabel="Estate"
                color={record.sharePct + 3 < record.estateSharePct ? "#d97706" : "#2563eb"}
              />
            </li>
          ))}
        </ul>

        <div className="mt-2">
          <AnalyticsDataTable
            caption={`Training coverage by ${dimension}`}
            headers={["Bucket", "Training %", "Estate %", "Samples"]}
            rows={rows.map((r) => [r.label, r.sharePct, r.estateSharePct, r.samples.toLocaleString()])}
          />
        </div>
      </LifecycleSection>

      <LifecycleSection
        title="Class balance and sampling"
        description={classBalanceRationale}
        testId="class-balance"
        actions={<GateBadge status={balance.handled ? "Pass" : "Review"} />}
      >
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <LifecycleStat label="Balance score" value={`${balance.scorePct}%`} tone={balance.handled ? "positive" : "warning"} />
          <LifecycleStat label="Rare-event amplification" value={`${balance.rareEventAmplification}x`} hint="Customer Impact class" />
          <LifecycleStat label="Natural imbalance" value={`${balance.imbalanceRatio}:1`} hint="Normal vs rarest class" />
          <LifecycleStat label="Handling" value={balance.handled ? "Within band" : "Outside band"} tone={balance.handled ? "positive" : "warning"} />
        </div>

        <table className="mt-2 w-full text-left text-[10.5px]">
          <caption className="sr-only">Natural against training class distribution</caption>
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-500">
              <th scope="col" className="py-1">Risk class</th>
              <th scope="col" className="py-1">Natural</th>
              <th scope="col" className="py-1">Training</th>
              <th scope="col" className="py-1">Technique</th>
            </tr>
          </thead>
          <tbody>
            {classBalance.map((record) => (
              <tr key={record.key} className="border-t border-slate-100">
                <th scope="row" className="py-1 font-medium text-slate-900">{record.label}</th>
                <td className="py-1 text-slate-700">{record.naturalPct}%</td>
                <td className="py-1 font-medium text-slate-900">{record.trainingPct}%</td>
                <td className="py-1 text-slate-600">{record.technique}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
          {samplingStrategies.map((strategy) => (
            <li key={strategy.key} className="rounded border border-slate-200 bg-slate-50/70 px-2 py-1">
              <span className="text-[10.5px] font-semibold text-slate-900">{strategy.label}. </span>
              <span className="text-[10.5px] text-slate-600">{strategy.detail}</span>
            </li>
          ))}
        </ul>
      </LifecycleSection>
    </div>
  );
}

/* ------------------------------ data quality ------------------------------ */

export function DataQualityPanel({ qualityScore }: { qualityScore: number }) {
  return (
    <LifecycleSection
      title="Data quality"
      description="Quality defects found in the training corpus and how each was treated before training."
      testId="data-quality"
      actions={<span className="text-[10.5px] font-semibold text-slate-900">Score {qualityScore}%</span>}
    >
      <table className="w-full text-left text-[10.5px]">
        <caption className="sr-only">Training data quality defects and treatment</caption>
        <thead>
          <tr className="text-[10px] uppercase tracking-wide text-slate-500">
            <th scope="col" className="py-1">Defect</th>
            <th scope="col" className="py-1">Affected</th>
            <th scope="col" className="py-1">Treatment</th>
            <th scope="col" className="py-1">Detail</th>
          </tr>
        </thead>
        <tbody>
          {dataQuality.map((record) => (
            <tr key={record.key} className="border-t border-slate-100">
              <th scope="row" className="py-1 font-medium text-slate-900">{record.label}</th>
              <td className="py-1 text-slate-700">{record.affectedPct}%</td>
              <td className="py-1">
                <span className="rounded border border-slate-200 bg-slate-50 px-1 py-px text-[10px] font-medium text-slate-700">
                  {record.treatment}
                </span>
              </td>
              <td className="py-1 text-slate-600">{record.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </LifecycleSection>
  );
}

/* ------------------------------- provenance ------------------------------- */

export function TrainingProvenancePanel({
  onOpen,
}: { onOpen: (record: TrainingProvenanceRecord) => void }) {
  return (
    <LifecycleSection
      title="Training provenance"
      description="Every data source that contributed to the corpus, with owner, lineage and approval state. Select a source for the full lifecycle record."
      testId="training-provenance"
    >
      <div className="max-h-60 overflow-auto rounded border border-slate-200">
        <table className="w-full text-left text-[10.5px]">
          <caption className="sr-only">Training data provenance</caption>
          <thead className="sticky top-0 bg-slate-50">
            <tr className="text-[10px] uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-1.5 py-1">Source</th>
              <th scope="col" className="px-1.5 py-1">Owner</th>
              <th scope="col" className="px-1.5 py-1">Period</th>
              <th scope="col" className="px-1.5 py-1">Lineage</th>
              <th scope="col" className="px-1.5 py-1">Approval</th>
              <th scope="col" className="px-1.5 py-1">Detail</th>
            </tr>
          </thead>
          <tbody>
            {trainingProvenance.map((record) => (
              <tr key={record.id} className="border-t border-slate-100">
                <th scope="row" className="px-1.5 py-1 font-medium text-slate-900">{record.source}</th>
                <td className="px-1.5 py-1 text-slate-700">{record.owner}</td>
                <td className="px-1.5 py-1 text-slate-700">{record.collectionPeriod}</td>
                <td className="px-1.5 py-1 text-slate-700">{record.lineageStatus}</td>
                <td className="px-1.5 py-1 text-slate-700">{record.approvalStatus}</td>
                <td className="px-1.5 py-1">
                  <LifecycleButton onClick={() => onOpen(record)} title={`Open ${record.source} lifecycle detail`}>
                    Open detail
                  </LifecycleButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LifecycleSection>
  );
}
