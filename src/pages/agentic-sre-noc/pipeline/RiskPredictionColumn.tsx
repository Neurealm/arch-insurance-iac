/**
 * AIM-002 — Risk Prediction column: ensemble members, ensemble result and the
 * demonstration confidence-threshold control.
 */

import { cn } from "@/lib/utils";
import { PipelineCard } from "./PipelineColumn";
import { ensembleResult, modelComponents } from "../data/pliPipelineFixtures";
import type { ThresholdOutcome } from "./calculations";

export function RiskPredictionColumn({
  selectedModelId, onSelectModel, highlightedModelIds, thresholdInput, onThresholdChange, outcome, linkId,
}: {
  selectedModelId: string | null;
  onSelectModel: (id: string | null) => void;
  highlightedModelIds: string[];
  thresholdInput: number;
  onThresholdChange: (v: number) => void;
  outcome: ThresholdOutcome;
  linkId: string;
}) {
  return (
    <div className="space-y-1.5">
      <section
        aria-label="Ensemble output"
        data-testid="ensemble-result"
        className="rounded border border-violet-200 bg-violet-50/70 p-2"
      >
        <div className="flex items-baseline justify-between gap-2">
          <h5 className="text-[10.5px] font-semibold text-slate-900">Ensemble output, {linkId}</h5>
          <span className="rounded border border-rose-200 bg-white px-1 text-[9.5px] font-semibold text-rose-700">
            {ensembleResult.riskClass} risk
          </span>
        </div>
        <p className="mt-0.5 text-[20px] font-semibold leading-none text-slate-900">
          {ensembleResult.riskProbability.toFixed(2)}
          <span className="ml-1 text-[10px] font-normal text-slate-500">risk probability</span>
        </p>
        <dl className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9.5px]">
          {[
            ["Confidence", `${ensembleResult.confidencePct}%`],
            ["ETA to impact", ensembleResult.eta],
            ["Capacity exposure", ensembleResult.capacityExposure],
            ["Model agreement", ensembleResult.agreement],
            ["Missing-data penalty", String(ensembleResult.missingDataPenalty)],
            ["Calibration", ensembleResult.calibration],
            ["Engineering rule", ensembleResult.engineeringRule],
            ["Model version", ensembleResult.modelVersion],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-1">
              <dt className="text-slate-500">{k}</dt>
              <dd className="font-medium text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <fieldset className="rounded border border-slate-200 p-1.5" data-testid="threshold-control">
        <legend className="px-1 text-[9.5px] font-medium text-slate-600">
          Confidence threshold, demonstration control
        </legend>
        <label className="block text-[9.5px] text-slate-600">
          Threshold {thresholdInput}%
          <input
            type="range" min={50} max={99} step={1} value={thresholdInput}
            aria-label="Confidence threshold"
            aria-valuetext={`${thresholdInput} percent`}
            data-testid="threshold-slider"
            onChange={(e) => onThresholdChange(Number(e.target.value))}
            className="mt-0.5 w-full"
          />
        </label>
        <dl className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9.5px]" data-testid="threshold-outcome">
          {[
            ["Links classified high risk", String(outcome.highRiskLinks)],
            ["Recommendations created", String(outcome.recommendations)],
            ["Approval recommendations", String(outcome.approvalRecommendations)],
            ["Estimated precision", `${outcome.precisionPct}%`],
            ["Estimated recall", `${outcome.recallPct}%`],
            ["Estimated false positives", `${outcome.falsePositivePct}%`],
            ["Selected link classification", outcome.selectedLinkClass],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-1">
              <dt className="text-slate-500">{k}</dt>
              <dd className="font-medium text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-1 text-[9px] text-slate-500">
          Raising the threshold increases precision and reduces recall. Synthetic tradeoff, not a measured production
          value.
        </p>
      </fieldset>

      <ul className="space-y-1">
        {modelComponents.map((m) => {
          const selected = selectedModelId === m.id;
          return (
            <li key={m.id}>
              <PipelineCard
                testId={`model-${m.id}`}
                selected={selected}
                highlighted={highlightedModelIds.includes(m.id) && !selected}
                onClick={() => onSelectModel(selected ? null : m.id)}
                ariaLabel={`${m.name}, weight ${m.weightPct} percent, ${m.agreement}, confidence ${m.confidencePct} percent`}
              >
                <span className="flex items-baseline justify-between gap-1">
                  <span className="truncate text-[10.5px] font-medium text-slate-900">{m.name}</span>
                  <span className="shrink-0 text-[10.5px] font-semibold text-slate-900">{m.weightPct}%</span>
                </span>
                <span className="mt-0.5 block h-1 w-full rounded bg-slate-100">
                  <span
                    className="block h-1 rounded bg-violet-500"
                    style={{ width: `${m.weightPct * 3}%` }}
                    aria-hidden
                  />
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-1 text-[9px] text-slate-500">
                  <span className="font-medium text-slate-700">{m.output}</span>
                  <span
                    className={cn(
                      "rounded border px-1 font-medium",
                      m.agreement === "Agrees"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : m.agreement === "Partially agrees"
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-rose-200 bg-rose-50 text-rose-700",
                    )}
                  >
                    {m.agreement}
                  </span>
                  <span>{m.determinism}</span>
                  <span>Confidence {m.confidencePct}%</span>
                  <span>{m.lastEvaluated}</span>
                </span>
                {selected && (
                  <span className="mt-1 block rounded bg-slate-50 px-1.5 py-1 text-[9.5px] text-slate-600">
                    Data requirement: {m.dataRequirement}. {m.issue ? `Current issue: ${m.issue}.` : "No current issue."}
                  </span>
                )}
              </PipelineCard>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
