/**
 * AIM-006 — Why Traditional Monitoring Does Not Solve This.
 *
 * Side-by-side stage comparison with clearly labelled synthetic metrics.
 */

import { cn } from "@/lib/utils";
import { comparisonMetrics, comparisonStages } from "./scenarioFixtures";
import { compareTraditionalAndAgentic } from "./scenarioCalculations";
import { exportTraditionalComparison } from "./scenarioExport";
import type { ScenarioStateValue } from "./useScenarioState";

export function TraditionalComparisonPanel({ state }: { state: ScenarioStateValue }) {
  const model = compareTraditionalAndAgentic(comparisonStages, comparisonMetrics);
  const active = model.stages.find((s) => s.key === state.comparisonRow) ?? null;
  const stageKeyForScenario = state.stage.focus === "governance" ? "approval" : null;

  if (model.stageCount === 0) {
    return (
      <p className="rounded border border-dashed border-slate-200 bg-slate-50/60 p-3 text-[11.5px] text-slate-600">
        No comparison data is available for the current selection.
      </p>
    );
  }

  return (
    <section aria-label="Why traditional monitoring does not solve this" data-testid="traditional-comparison" className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10.5px] text-slate-600">
          Synthetic demonstration values. Times and percentages illustrate the operating-model difference only.
        </p>
        <button
          type="button"
          onClick={() => state.setExportMessage(exportTraditionalComparison().message)}
          className="min-h-11 rounded border border-slate-200 bg-white px-2 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-1"
        >
          Export comparison
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[620px] text-left text-[11px]">
          <caption className="sr-only">Traditional monitoring compared with agentic predictive protection, by stage</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-2 py-1.5">Stage</th>
              <th scope="col" className="px-2 py-1.5">Traditional Monitoring</th>
              <th scope="col" className="px-2 py-1.5">Agentic Predictive Protection</th>
            </tr>
          </thead>
          <tbody>
            {model.stages.map((s) => {
              const selected = state.comparisonRow === s.key;
              const highlighted = stageKeyForScenario === s.key;
              return (
                <tr
                  key={s.key}
                  data-testid={`comparison-row-${s.key}`}
                  data-highlighted={highlighted ? "true" : "false"}
                  className={cn("border-t border-slate-100 align-top", selected && "bg-blue-50", !selected && highlighted && "bg-amber-50")}
                >
                  <th scope="row" className="px-2 py-1.5 font-medium text-slate-900">
                    <button
                      type="button"
                      aria-expanded={selected}
                      onClick={() => state.setComparisonRow(selected ? null : s.key)}
                      className="min-h-11 text-left underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0"
                    >
                      {s.stage}
                    </button>
                  </th>
                  <td className="px-2 py-1.5 text-slate-700">{s.traditional}</td>
                  <td className="px-2 py-1.5 text-slate-800">{s.agentic}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {active && (
        <div data-testid="comparison-detail" className="rounded-lg border border-slate-200 bg-white p-3">
          <h4 className="text-[12px] font-semibold text-slate-900">{active.stage}</h4>
          <dl className="mt-1 grid grid-cols-1 gap-1 text-[11px] sm:grid-cols-2">
            <div><dt className="text-slate-500">Current-state workflow</dt><dd className="text-slate-800">{active.traditional}</dd></div>
            <div><dt className="text-slate-500">Agentic workflow</dt><dd className="text-slate-800">{active.agentic}</dd></div>
            <div><dt className="text-slate-500">Systems involved</dt><dd className="text-slate-800">{active.systemsInvolved}</dd></div>
            <div><dt className="text-slate-500">Engineering owner</dt><dd className="text-slate-800">{active.engineeringOwner}</dd></div>
            <div><dt className="text-slate-500">Operational risk</dt><dd className="text-slate-800">{active.operationalRisk}</dd></div>
            <div><dt className="text-slate-500">Expected customer effect</dt><dd className="text-slate-800">{active.customerEffect}</dd></div>
            <div><dt className="text-slate-500">Evidence created</dt><dd className="text-slate-800">{active.evidenceCreated}</dd></div>
            <div><dt className="text-slate-500">Modernization requirement</dt><dd className="text-slate-800">{active.modernizationRequirement}</dd></div>
          </dl>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[480px] text-left text-[11px]">
          <caption className="sr-only">Comparison metrics, synthetic demonstration values</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-2 py-1.5">Measure</th>
              <th scope="col" className="px-2 py-1.5">Traditional</th>
              <th scope="col" className="px-2 py-1.5">Agentic</th>
            </tr>
          </thead>
          <tbody>
            {model.metrics.map((m) => (
              <tr key={m.key} className="border-t border-slate-100">
                <th scope="row" className="px-2 py-1.5 font-medium text-slate-900">{m.label}</th>
                <td className="px-2 py-1.5 text-slate-700">{m.traditional}</td>
                <td className="px-2 py-1.5 font-medium text-slate-900">{m.agentic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
