/**
 * AIM-005 — validation performance matrix.
 */

import * as React from "react";
import { AnalyticsDataTable } from "../analytics/AnalyticsPrimitives";
import { calculateSegmentValidationStatus } from "./lifecycleCalculations";
import { GateBadge, LifecycleButton, LifecycleSection } from "./LifecyclePrimitives";
import type { ValidationSegment } from "./lifecycleTypes";

function formatHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return hours > 0 ? `${hours}h ${String(rest).padStart(2, "0")}m` : `${rest}m`;
}

export interface ValidationPerformanceMatrixProps {
  segments: readonly ValidationSegment[];
  selectedSegmentId: string | null;
  onSelectSegment: (id: string | null) => void;
  dimensionFilter: string;
  onDimensionFilterChange: (dimension: string) => void;
  dimensions: readonly string[];
  activeFilters: string;
  onClearFilters: () => void;
}

export function ValidationPerformanceMatrix({
  segments, selectedSegmentId, onSelectSegment, dimensionFilter, onDimensionFilterChange,
  dimensions, activeFilters, onClearFilters,
}: ValidationPerformanceMatrixProps) {
  const rows = React.useMemo(
    () => segments.map((segment) => ({ segment, status: calculateSegmentValidationStatus(segment) })),
    [segments],
  );

  return (
    <LifecycleSection
      title="Validation segments"
      description="Where the model performs and where it underperforms, across every validated dimension."
      testId="validation-matrix"
      actions={
        <label className="flex items-center gap-1 text-[10.5px] text-slate-500">
          <span className="sr-only sm:not-sr-only">Segment dimension</span>
          <select
            aria-label="Segment dimension"
            value={dimensionFilter}
            onChange={(event) => onDimensionFilterChange(event.target.value)}
            className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[10.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {dimensions.map((dimension) => <option key={dimension} value={dimension}>{dimension}</option>)}
          </select>
        </label>
      }
    >
      {rows.length === 0 ? (
        <div className="rounded border border-dashed border-slate-200 bg-slate-50/60 p-3 text-center" data-testid="validation-empty">
          <p className="text-[11.5px] font-medium text-slate-700">No validation data for the selected scope</p>
          <p className="text-[10.5px] text-slate-500">Active filters: {activeFilters}</p>
          <p className="text-[10.5px] text-slate-500">Fallback scope: all dimensions.</p>
          <div className="mt-1 flex justify-center">
            <LifecycleButton onClick={onClearFilters}>Clear filters</LifecycleButton>
          </div>
        </div>
      ) : (
        <>
          <div className="max-h-72 overflow-auto rounded border border-slate-200">
            <table className="w-full text-left text-[10.5px]">
              <caption className="sr-only">Validation results by segment</caption>
              <thead className="sticky top-0 bg-slate-50">
                <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-1.5 py-1">Segment</th>
                  <th scope="col" className="px-1.5 py-1">Samples</th>
                  <th scope="col" className="px-1.5 py-1">Accuracy</th>
                  <th scope="col" className="px-1.5 py-1">False positive</th>
                  <th scope="col" className="px-1.5 py-1">Missed</th>
                  <th scope="col" className="px-1.5 py-1">Mean warning</th>
                  <th scope="col" className="px-1.5 py-1">Calibration</th>
                  <th scope="col" className="px-1.5 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ segment, status }) => (
                  <tr
                    key={segment.id}
                    data-selected={selectedSegmentId === segment.id ? "true" : "false"}
                    className={selectedSegmentId === segment.id ? "border-t border-slate-100 bg-blue-50" : "border-t border-slate-100"}
                  >
                    <th scope="row" className="px-1.5 py-1 font-medium text-slate-900">
                      <button
                        type="button"
                        aria-pressed={selectedSegmentId === segment.id}
                        onClick={() => onSelectSegment(selectedSegmentId === segment.id ? null : segment.id)}
                        className="text-left underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {segment.label}
                        <span className="ml-1 font-normal text-slate-500">{segment.dimension}</span>
                      </button>
                    </th>
                    <td className="px-1.5 py-1 text-slate-700">{segment.samples.toLocaleString()}</td>
                    <td className="px-1.5 py-1 font-medium text-slate-900">{segment.accuracyPct}%</td>
                    <td className="px-1.5 py-1 text-slate-700">{segment.falsePositivePct}%</td>
                    <td className="px-1.5 py-1 text-slate-700">{segment.missedEventPct}%</td>
                    <td className="px-1.5 py-1 text-slate-700">{formatHours(segment.meanWarningMinutes)}</td>
                    <td className="px-1.5 py-1 text-slate-700">{segment.calibrationErrorPct}%</td>
                    <td className="px-1.5 py-1"><GateBadge status={status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-2">
            <AnalyticsDataTable
              caption="Validation segment data table"
              headers={["Segment", "Dimension", "Samples", "Accuracy %", "False positive %", "Mean warning min", "Status"]}
              rows={rows.map(({ segment, status }) => [
                segment.label, segment.dimension, segment.samples, segment.accuracyPct,
                segment.falsePositivePct, segment.meanWarningMinutes, status,
              ])}
            />
          </div>
        </>
      )}
    </LifecycleSection>
  );
}
