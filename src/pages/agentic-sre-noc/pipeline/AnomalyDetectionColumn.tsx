/**
 * AIM-002 — Anomaly Detection column: scatterplot, filters, brush and services.
 */

import { cn } from "@/lib/utils";
import { AnomalyLegend, AnomalyScatterplot, RISK_CLASSES } from "./AnomalyScatterplot";
import { anomalyServices, type AnomalyRecord, type RiskClass } from "../data/pliPipelineFixtures";

export function AnomalyDetectionColumn({
  records, selectedLinkId, onSelectLink, onHoverLink, riskFilter, onRiskFilter, productFilter, onProductFilter,
  regionFilter, onRegionFilter, brush, onBrush, onResetView, products, regions,
}: {
  records: AnomalyRecord[];
  selectedLinkId: string;
  onSelectLink: (id: string) => void;
  onHoverLink: (id: string | null) => void;
  riskFilter: RiskClass | "All";
  onRiskFilter: (v: RiskClass | "All") => void;
  productFilter: string;
  onProductFilter: (v: string) => void;
  regionFilter: string;
  onRegionFilter: (v: string) => void;
  brush: { min: number; max: number };
  onBrush: (b: { min: number; max: number }) => void;
  onResetView: () => void;
  products: string[];
  regions: string[];
}) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
        <label className="text-[9.5px] text-slate-600">
          Risk class
          <select
            aria-label="Risk class filter"
            value={riskFilter}
            onChange={(e) => onRiskFilter(e.target.value as RiskClass | "All")}
            className="mt-0.5 w-full rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <option value="All">All classes</option>
            {RISK_CLASSES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="text-[9.5px] text-slate-600">
          Product
          <select
            aria-label="Anomaly product filter"
            value={productFilter}
            onChange={(e) => onProductFilter(e.target.value)}
            className="mt-0.5 w-full rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {products.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="text-[9.5px] text-slate-600">
          Region
          <select
            aria-label="Anomaly region filter"
            value={regionFilter}
            onChange={(e) => onRegionFilter(e.target.value)}
            className="mt-0.5 w-full rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
      </div>

      <AnomalyScatterplot
        records={records}
        selectedLinkId={selectedLinkId}
        onSelect={onSelectLink}
        onHover={onHoverLink}
      />

      <AnomalyLegend />

      <fieldset className="rounded border border-slate-200 p-1.5">
        <legend className="px-1 text-[9.5px] font-medium text-slate-600">Brush and zoom, baseline deviation</legend>
        <div className="flex items-center gap-2">
          <label className="flex-1 text-[9px] text-slate-600">
            From {brush.min} sigma
            <input
              type="range" min={-2} max={4} step={0.5} value={brush.min}
              aria-label="Brush selection lower bound"
              data-testid="anomaly-brush-min"
              onChange={(e) => onBrush({ min: Number(e.target.value), max: Math.max(Number(e.target.value), brush.max) })}
              className="w-full"
            />
          </label>
          <label className="flex-1 text-[9px] text-slate-600">
            To {brush.max} sigma
            <input
              type="range" min={-2} max={4} step={0.5} value={brush.max}
              aria-label="Brush selection upper bound"
              data-testid="anomaly-brush-max"
              onChange={(e) => onBrush({ min: Math.min(brush.min, Number(e.target.value)), max: Number(e.target.value) })}
              className="w-full"
            />
          </label>
          <button
            type="button"
            onClick={onResetView}
            data-testid="anomaly-reset-view"
            className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 text-[9.5px] text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Reset view
          </button>
        </div>
        <p className="mt-0.5 text-[9px] text-slate-500" data-testid="anomaly-count">
          {records.length} links in the current brush and filters
        </p>
      </fieldset>

      <div>
        <h5 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Detection services</h5>
        <ul className="mt-1 space-y-1">
          {anomalyServices.map((s) => (
            <li key={s.id} className="rounded border border-slate-200 px-1.5 py-1">
              <span className="flex items-baseline justify-between gap-1">
                <span className="truncate text-[10.5px] font-medium text-slate-900">{s.name}</span>
                <span
                  className={cn(
                    "shrink-0 rounded border px-1 text-[9px] font-medium",
                    s.state === "Warning"
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : s.state === "Active"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700",
                  )}
                >
                  {s.state}
                </span>
              </span>
              <span className="mt-0.5 flex flex-wrap gap-x-2 text-[9px] text-slate-500">
                <span>{s.determinism}</span>
                <span>{s.evaluated}</span>
                <span>{s.findings} findings</span>
                <span>{s.lastRun}</span>
              </span>
              <span className="block text-[9.5px] text-slate-600">{s.result}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
