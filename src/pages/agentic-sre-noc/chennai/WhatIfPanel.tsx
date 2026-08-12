/**
 * AIM-003 — What-If Prediction Model panel.
 *
 * Deterministic local recalculation only. No live model is called.
 */

import * as React from "react";
import { PipelineDrawer } from "../pipeline/PipelineDrawer";
import { cn } from "@/lib/utils";
import {
  whatIfControls, whatIfPresets, type Criticality, type WhatIfPresetId, type WhatIfValues,
} from "./chennaiFixtures";
import { comparePredictions, explainChange, type ChennaiPrediction } from "./chennaiModel";

const CRITICALITIES: Criticality[] = ["Critical", "High", "Standard", "Low"];

export function WhatIfPanel({
  open, onClose, values, baseline, onChange, onPreset, onReset, activePreset, current, proposed,
}: {
  open: boolean;
  onClose: () => void;
  values: WhatIfValues;
  baseline: WhatIfValues;
  onChange: (patch: Partial<WhatIfValues>) => void;
  onPreset: (id: WhatIfPresetId) => void;
  onReset: () => void;
  activePreset: WhatIfPresetId;
  current: ChennaiPrediction | null;
  proposed: ChennaiPrediction | null;
}) {
  if (!open) return null;

  if (!current || !proposed) {
    return (
      <PipelineDrawer open={open} title="What-If Prediction Model" onClose={onClose} testId="chennai-whatif" wide>
        <p role="alert" className="text-[11.5px] text-rose-700">
          The What-If calculation could not be completed for the current selection. Reset the inputs or select
          another link; the baseline prediction remains available.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-2 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700"
        >
          Reset What-If inputs
        </button>
      </PipelineDrawer>
    );
  }

  const rows = comparePredictions(current, proposed);
  const explanation = explainChange(current, proposed);

  return (
    <PipelineDrawer
      open={open}
      title="What-If Prediction Model"
      subtitle={`${proposed.linkId} · deterministic local recalculation, synthetic reference logic`}
      onClose={onClose}
      testId="chennai-whatif"
      wide
    >
      <div className="sr-only" role="status" aria-live="polite" data-testid="chennai-whatif-live">
        {`Proposed risk ${proposed.riskProbability.toFixed(2)}, ${proposed.riskClass} class, confidence ${proposed.confidencePct} percent, ETA ${proposed.etaLabel}, action ${proposed.recommendedAction?.name}.`}
      </div>

      {/* presets */}
      <fieldset className="mb-2">
        <legend className="text-[10.5px] font-semibold text-slate-700">Scenario presets</legend>
        <div className="mt-1 flex flex-wrap gap-1">
          {whatIfPresets.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.description}
              aria-pressed={activePreset === p.id}
              onClick={() => onPreset(p.id)}
              data-testid={`chennai-preset-${p.id}`}
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10.5px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                activePreset === p.id
                  ? "border-blue-300 bg-blue-50 text-blue-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onReset}
            data-testid="chennai-whatif-reset"
            className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Reset to fixture values
          </button>
        </div>
      </fieldset>

      {/* controls */}
      <fieldset className="space-y-1.5">
        <legend className="text-[10.5px] font-semibold text-slate-700">Model inputs</legend>
        {whatIfControls.map((c) => {
          const value = values[c.key];
          const base = baseline[c.key];
          const id = `whatif-${c.key}`;
          return (
            <div key={c.key} className="rounded border border-slate-200 px-2 py-1">
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor={id} className="text-[10.5px] font-medium text-slate-700">
                  {c.label}
                </label>
                <span className="text-[10px] text-slate-500">
                  Current {base}
                  {c.unit} · Proposed{" "}
                  <span className="font-semibold text-slate-900">
                    {value}
                    {c.unit}
                  </span>
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <input
                  id={id}
                  type="range"
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  value={value}
                  aria-label={`${c.label} in ${c.unit}`}
                  aria-valuetext={`${value} ${c.unit}`}
                  onChange={(e) => onChange({ [c.key]: Number(e.target.value) } as Partial<WhatIfValues>)}
                  className="h-1.5 flex-1 accent-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                <input
                  type="number"
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  value={value}
                  aria-label={`${c.label} numeric value`}
                  onChange={(e) => onChange({ [c.key]: Number(e.target.value) } as Partial<WhatIfValues>)}
                  className="w-16 rounded border border-slate-200 px-1 py-0.5 text-right text-[10.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
            </div>
          );
        })}

        <div className="rounded border border-slate-200 px-2 py-1">
          <label htmlFor="whatif-criticality" className="text-[10.5px] font-medium text-slate-700">
            Service Criticality
          </label>
          <select
            id="whatif-criticality"
            value={values.serviceCriticality}
            onChange={(e) => onChange({ serviceCriticality: e.target.value as Criticality })}
            className="mt-0.5 w-full rounded border border-slate-200 px-1 py-0.5 text-[10.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {CRITICALITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </fieldset>

      {/* results */}
      <section aria-label="What-If results" data-testid="chennai-whatif-results" className="mt-3">
        <h4 className="text-[11px] font-semibold text-slate-900">Current versus What-If</h4>
        <table className="mt-1 w-full text-left text-[10.5px]">
          <caption className="sr-only">Comparison of the current prediction against the What-If prediction</caption>
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th scope="col" className="py-0.5 font-medium">Measure</th>
              <th scope="col" className="py-0.5 font-medium">Current</th>
              <th scope="col" className="py-0.5 font-medium">What-If</th>
              <th scope="col" className="py-0.5 font-medium">Difference</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-slate-100">
                <th scope="row" className="py-0.5 font-normal text-slate-700">{r.label}</th>
                <td className="py-0.5 text-slate-900">{r.current}</td>
                <td className="py-0.5 font-semibold text-slate-900">{r.proposed}</td>
                <td
                  className={cn(
                    "py-0.5",
                    r.tone === "better" && "text-emerald-700",
                    r.tone === "worse" && "text-rose-700",
                    r.tone === "same" && "text-slate-500",
                  )}
                >
                  <span aria-hidden>{r.tone === "better" ? "▲ " : r.tone === "worse" ? "▼ " : "■ "}</span>
                  {r.delta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* compact comparison chart */}
        <div className="mt-2 space-y-1" aria-hidden>
          {rows.map((r) => (
            <div key={r.key}>
              <p className="text-[9.5px] text-slate-500">{r.label}</p>
              <div className="flex items-center gap-1">
                <div className="h-1.5 flex-1 rounded bg-slate-100">
                  <div className="h-1.5 rounded bg-slate-400" style={{ width: `${Math.min(100, r.currentPct)}%` }} />
                </div>
              </div>
              <div className="mt-0.5 flex items-center gap-1">
                <div className="h-1.5 flex-1 rounded bg-slate-100">
                  <div
                    className={cn("h-1.5 rounded", r.tone === "worse" ? "bg-rose-500" : r.tone === "better" ? "bg-emerald-500" : "bg-slate-400")}
                    style={{ width: `${Math.min(100, r.proposedPct)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <dl className="mt-2 space-y-0.5 text-[10.5px]">
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Original action</dt>
            <dd className="font-medium text-slate-900">{current.recommendedAction?.name}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Proposed action</dt>
            <dd className="font-medium text-slate-900">{proposed.recommendedAction?.name}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Original fallback state</dt>
            <dd className="font-medium text-slate-900">{current.fallback.state}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Proposed fallback state</dt>
            <dd className="font-medium text-slate-900">{proposed.fallback.state}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Approval requirement</dt>
            <dd className="font-medium text-slate-900">{proposed.approvalRequired ? "Required" : "Not required"}</dd>
          </div>
        </dl>

        <p className="mt-2 rounded border border-slate-200 bg-slate-50 p-1.5 text-[10.5px] text-slate-700">
          <span className="font-semibold">Change explanation. </span>{explanation}
        </p>
        <p className="mt-1 text-[10px] text-slate-500">
          Synthetic reference logic. Calculated locally and deterministically; no model service is called.
        </p>
      </section>
    </PipelineDrawer>
  );
}
