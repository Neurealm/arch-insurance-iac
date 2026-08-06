/**
 * AIM-006 — similar-event comparison workspace.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { similarEvents } from "./scenarioFixtures";
import { exportSimilarEvents } from "./scenarioExport";
import type { ScenarioStateValue } from "./useScenarioState";

export function SimilarEventsPanel({ state }: { state: ScenarioStateValue }) {
  const [sortDesc, setSortDesc] = React.useState(true);

  const drivers = React.useMemo(
    () => ["All", ...Array.from(new Set(similarEvents.map((e) => e.primaryDriver)))],
    [],
  );
  const productList = React.useMemo(
    () => ["All", ...Array.from(new Set(similarEvents.map((e) => e.product)))],
    [],
  );

  const rows = React.useMemo(() => {
    const filtered = similarEvents.filter((e) => {
      if (state.excludedEventIds.includes(e.id)) return false;
      if (state.eventDriver !== "All" && e.primaryDriver !== state.eventDriver) return false;
      if (state.eventProduct !== "All" && e.product !== state.eventProduct) return false;
      return true;
    });
    return [...filtered].sort((a, b) => (sortDesc ? b.similarity - a.similarity : a.similarity - b.similarity));
  }, [state.excludedEventIds, state.eventDriver, state.eventProduct, sortDesc]);

  const open = state.openEventId ? similarEvents.find((e) => e.id === state.openEventId) ?? null : null;
  const compared = similarEvents.filter((e) => state.selectedEventIds.includes(e.id));

  return (
    <section aria-label="Similar events" data-testid="similar-events" className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2">
        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          <span className="sr-only sm:not-sr-only">Driver</span>
          <select aria-label="Filter similar events by driver" value={state.eventDriver}
            onChange={(e) => state.setEventDriver(e.target.value)}
            className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            {drivers.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          <span className="sr-only sm:not-sr-only">Product</span>
          <select aria-label="Filter similar events by product" value={state.eventProduct}
            onChange={(e) => state.setEventProduct(e.target.value)}
            className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            {productList.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => setSortDesc((s) => !s)} aria-pressed={sortDesc}
          className="min-h-11 rounded border border-slate-200 bg-white px-2 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-1">
          Sort by similarity {sortDesc ? "descending" : "ascending"}
        </button>
        <button type="button" onClick={() => state.setExportMessage(exportSimilarEvents(state.selectedEventIds).message)}
          className="min-h-11 rounded border border-slate-200 bg-white px-2 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-1">
          Export comparison
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center">
          <Info className="h-4 w-4 text-slate-400" aria-hidden />
          <p className="text-[12px] font-medium text-slate-700">No similar events match the current filters</p>
        </div>
      ) : (
        <div className="max-h-[360px] overflow-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[760px] text-left text-[11px]">
            <caption className="sr-only">Comparable synthetic historical events ranked by similarity</caption>
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-2 py-1.5">Event</th>
                <th scope="col" className="px-2 py-1.5">Region</th>
                <th scope="col" className="px-2 py-1.5">Product</th>
                <th scope="col" className="px-2 py-1.5">Driver</th>
                <th scope="col" className="px-2 py-1.5">Similarity</th>
                <th scope="col" className="px-2 py-1.5">Outcome</th>
                <th scope="col" className="px-2 py-1.5">Accuracy</th>
                <th scope="col" className="px-2 py-1.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const selected = state.selectedEventIds.includes(e.id);
                return (
                  <tr key={e.id} data-testid={`similar-event-${e.id}`}
                    className={cn("border-t border-slate-100", selected && "bg-blue-50")}>
                    <th scope="row" className="px-2 py-1.5 font-medium text-slate-900">
                      <button type="button" onClick={() => state.setOpenEventId(state.openEventId === e.id ? null : e.id)}
                        className="text-left underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                        {e.name}
                      </button>
                      <span className="block text-[10px] font-normal text-slate-500">{e.id} · {e.linkDistanceKm} km</span>
                    </th>
                    <td className="px-2 py-1.5 text-slate-700">{e.region}</td>
                    <td className="px-2 py-1.5 text-slate-700">{e.product}</td>
                    <td className="px-2 py-1.5 text-slate-700">{e.primaryDriver}</td>
                    <td className="px-2 py-1.5 font-medium text-slate-900">{e.similarity.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-slate-700">{e.actualOutcome}</td>
                    <td className="px-2 py-1.5 text-slate-700">{e.predictionAccuracy}</td>
                    <td className="px-2 py-1.5">
                      <div className="flex flex-wrap gap-1">
                        <button type="button" onClick={() => state.toggleSelectedEvent(e.id)} aria-pressed={selected}
                          className="min-h-11 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-0.5">
                          Compare
                        </button>
                        <button type="button" onClick={() => state.announce(`${e.id} added as supporting evidence.`)}
                          className="min-h-11 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-0.5">
                          Add as Supporting Evidence
                        </button>
                        <button type="button" onClick={() => state.toggleExcludedEvent(e.id)}
                          className="min-h-11 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-0.5">
                          Exclude
                        </button>
                        <button type="button" onClick={() => state.setOpenEventId(e.id)}
                          className="min-h-11 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-0.5">
                          View Differences
                        </button>
                        <button type="button" onClick={() => state.announce(`Prior action reused: ${e.actionTaken}.`)}
                          className="min-h-11 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-0.5">
                          Reuse Prior Action
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {compared.length > 0 && (
        <div data-testid="similar-event-comparison" className="rounded-lg border border-slate-200 bg-white p-3">
          <h4 className="text-[12px] font-semibold text-slate-900">Comparison against the current prediction</h4>
          <ul className="mt-1 space-y-1">
            {compared.map((e) => (
              <li key={e.id} className="text-[11px] text-slate-700">
                <span className="font-medium text-slate-900">{e.name}</span> · similarity {e.similarity.toFixed(2)} ·
                prediction {e.predictionScore.toFixed(2)} versus 0.94 · action {e.actionTaken} · {e.operationalLesson}
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && (
        <div data-testid="similar-event-detail" className="rounded-lg border border-slate-200 bg-white p-3">
          <h4 className="text-[12px] font-semibold text-slate-900">{open.name}</h4>
          <dl className="mt-1 grid grid-cols-1 gap-1 text-[11px] sm:grid-cols-2">
            <div><dt className="text-slate-500">Environmental signature</dt><dd className="text-slate-800">{open.environmentalSignature}</dd></div>
            <div><dt className="text-slate-500">Optical signature</dt><dd className="text-slate-800">{open.opticalSignature}</dd></div>
            <div><dt className="text-slate-500">Customer impact</dt><dd className="text-slate-800">{open.customerImpact}</dd></div>
            <div><dt className="text-slate-500">Recovery result</dt><dd className="text-slate-800">{open.recoveryResult}</dd></div>
            <div><dt className="text-slate-500">Evidence quality</dt><dd className="text-slate-800">{open.evidenceQuality}</dd></div>
            <div><dt className="text-slate-500">Operational lesson</dt><dd className="text-slate-800">{open.operationalLesson}</dd></div>
          </dl>
          <p className="mt-1 text-[10.5px] text-slate-500">Similarity does not prove causality. Synthetic demonstration values.</p>
        </div>
      )}
    </section>
  );
}
