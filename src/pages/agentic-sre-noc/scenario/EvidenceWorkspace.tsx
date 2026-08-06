/**
 * AIM-006 — evidence workspace.
 *
 * Structured, filterable evidence index with provenance, stance and
 * engineering interpretation. No hidden reasoning is exposed.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info } from "lucide-react";
import { evidenceCategories } from "./scenarioFixtures";
import { exportEvidenceIndex } from "./scenarioExport";
import type { EvidenceCategory, EvidenceItem, ScenarioPanelState } from "./scenarioTypes";
import type { ScenarioStateValue } from "./useScenarioState";

const stanceTone: Record<string, string> = {
  supports: "border-emerald-200 bg-emerald-50 text-emerald-800",
  contradicts: "border-amber-200 bg-amber-50 text-amber-800",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

const stanceGlyph: Record<string, string> = { supports: "+", contradicts: "−", neutral: "=" };

function StateFrame({ state, label, children }: { state: ScenarioPanelState; label: string; children: React.ReactNode }) {
  if (state === "loading") {
    return (
      <div role="status" aria-live="polite" className="space-y-2">
        <span className="sr-only">Loading {label}</span>
        <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="h-24 animate-pulse rounded bg-slate-50" />
      </div>
    );
  }
  if (state === "error") {
    return (
      <div role="alert" className="flex flex-col items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/70 p-4 text-center">
        <AlertTriangle className="h-4 w-4 text-rose-600" aria-hidden />
        <p className="text-[12px] font-medium text-rose-800">{label} could not be loaded</p>
        <p className="text-[11px] text-rose-700">Retry, or continue with the remaining evidence sections.</p>
      </div>
    );
  }
  if (state === "empty") {
    return (
      <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center">
        <Info className="h-4 w-4 text-slate-400" aria-hidden />
        <p className="text-[12px] font-medium text-slate-700">No {label.toLowerCase()} for the current selection</p>
      </div>
    );
  }
  return <>{children}</>;
}

function EvidenceCard({
  item, state, selected,
}: { item: EvidenceItem; state: ScenarioStateValue; selected: boolean }) {
  const pinned = state.pinnedEvidenceIds.includes(item.id);
  const reviewed = state.reviewedEvidenceIds.includes(item.id);
  const provenanceOpen = state.provenanceOpenId === item.id;
  return (
    <li
      data-testid={`evidence-item-${item.id}`}
      data-stance={item.stance}
      data-freshness={item.freshness}
      className={cn(
        "rounded-lg border bg-white p-3 shadow-sm",
        selected ? "border-blue-400 ring-1 ring-blue-300" : "border-slate-200",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => state.setSelectedEvidenceId(selected ? null : item.id)}
            aria-pressed={selected}
            className="text-left text-[12px] font-semibold text-slate-900 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {item.id} · {item.observation}
          </button>
          <p className="text-[11px] text-slate-500">{item.category} · {item.source}</p>
        </div>
        <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium", stanceTone[item.stance])}>
          <span aria-hidden>{stanceGlyph[item.stance]}</span> {item.stance}
        </span>
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-1 text-[10.5px] sm:grid-cols-4">
        <div><dt className="text-slate-500">Value</dt><dd className="font-medium text-slate-900">{item.value} {item.unit}</dd></div>
        <div><dt className="text-slate-500">Freshness</dt><dd className="font-medium text-slate-900">{item.freshness}</dd></div>
        <div><dt className="text-slate-500">Reliability</dt><dd className="font-medium text-slate-900">{item.reliability}</dd></div>
        <div><dt className="text-slate-500">Relevance</dt><dd className="font-medium text-slate-900">{item.relevance.toFixed(2)}</dd></div>
      </dl>

      <p className="mt-1.5 text-[11px] text-slate-700">{item.interpretation}</p>
      <p className="mt-1 text-[10.5px] text-slate-500">
        Timestamp {item.timestamp} · Feature {item.relatedFeature} · Hypothesis {item.relatedHypothesis}
      </p>
      {state.engineerNotes[item.id] && (
        <p className="mt-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10.5px] text-slate-700">
          Engineer note: {state.engineerNotes[item.id]}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button type="button" onClick={() => state.togglePinned(item.id)} aria-pressed={pinned}
          className="min-h-11 rounded border border-slate-200 bg-white px-2 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-0.5">
          {pinned ? "Unpin" : "Pin"}
        </button>
        <button type="button" onClick={() => state.setProvenanceOpenId(provenanceOpen ? null : item.id)}
          aria-expanded={provenanceOpen}
          className="min-h-11 rounded border border-slate-200 bg-white px-2 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-0.5">
          Open provenance
        </button>
        <button type="button" onClick={() => state.markReviewed(item.id)} disabled={reviewed}
          className="min-h-11 rounded border border-slate-200 bg-white px-2 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-0.5">
          {reviewed ? "Reviewed" : "Mark reviewed"}
        </button>
        <button type="button" onClick={() => state.addEngineerNote(item.id, "Reviewed on shift, consistent with the fog hypothesis.")}
          className="min-h-11 rounded border border-slate-200 bg-white px-2 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-0.5">
          Add engineer note
        </button>
        <button type="button" onClick={() => state.announce(`Related signal ${item.relatedSignal} opened.`)}
          className="min-h-11 rounded border border-slate-200 bg-white px-2 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-0.5">
          Open related signal
        </button>
        <button type="button" onClick={() => state.announce(`Related feature ${item.relatedFeature} focused.`)}
          className="min-h-11 rounded border border-slate-200 bg-white px-2 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-0.5">
          Open related feature
        </button>
      </div>

      {provenanceOpen && (
        <p data-testid={`evidence-provenance-${item.id}`} className="mt-2 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10.5px] text-slate-700">
          Provenance: {item.provenance}
        </p>
      )}
    </li>
  );
}

export function EvidenceWorkspace({ state }: { state: ScenarioStateValue }) {
  const rows = state.filteredEvidence;
  const panelState: ScenarioPanelState =
    state.panelState !== "ready" ? state.panelState : rows.length === 0 ? "empty" : "ready";

  return (
    <section aria-label="Evidence workspace" data-testid="evidence-workspace" className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2">
        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          <span className="sr-only sm:not-sr-only">Category</span>
          <select aria-label="Filter evidence by category" value={state.evidenceCategory}
            onChange={(e) => state.setEvidenceCategory(e.target.value as EvidenceCategory | "All")}
            className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <option value="All">All categories</option>
            {evidenceCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          <span className="sr-only sm:not-sr-only">Stance</span>
          <select aria-label="Filter evidence by stance" value={state.evidenceStance}
            onChange={(e) => state.setEvidenceStance(e.target.value as typeof state.evidenceStance)}
            className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <option value="all">Supports or contradicts</option>
            <option value="supports">Supports</option>
            <option value="contradicts">Contradicts</option>
            <option value="neutral">Neutral</option>
          </select>
        </label>
        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          <span className="sr-only sm:not-sr-only">Freshness</span>
          <select aria-label="Filter evidence by freshness" value={state.evidenceFreshness}
            onChange={(e) => state.setEvidenceFreshness(e.target.value as typeof state.evidenceFreshness)}
            className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <option value="all">Any freshness</option>
            <option value="current">Current</option>
            <option value="recent">Recent</option>
            <option value="stale">Stale</option>
            <option value="missing">Missing</option>
          </select>
        </label>
        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          <span className="sr-only sm:not-sr-only">Sort</span>
          <select aria-label="Sort evidence" value={state.evidenceSort}
            onChange={(e) => state.setEvidenceSort(e.target.value as typeof state.evidenceSort)}
            className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <option value="relevance">Relevance</option>
            <option value="recency">Recency</option>
            <option value="category">Category</option>
            <option value="reliability">Reliability</option>
          </select>
        </label>
        <input
          type="search"
          aria-label="Search evidence"
          placeholder="Search evidence"
          value={state.evidenceSearch}
          onChange={(e) => state.setEvidenceSearch(e.target.value)}
          className="min-w-0 flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        />
        <button type="button" onClick={state.clearEvidenceFilters}
          className="min-h-11 rounded border border-slate-200 bg-white px-2 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-1">
          Clear filters
        </button>
        <button type="button"
          onClick={() => state.setExportMessage(exportEvidenceIndex(state.filteredEvidence).message)}
          className="min-h-11 rounded border border-slate-200 bg-white px-2 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-1">
          Export evidence index
        </button>
      </div>

      <p className="text-[10.5px] text-slate-600">
        {rows.length} of {state.activeEvidence.length} evidence items · Completeness {state.evidenceCompleteness}% ·
        Pinned {state.pinnedEvidenceIds.length} · Reviewed {state.reviewedEvidenceIds.length} · Synthetic demonstration values
      </p>

      <StateFrame state={panelState} label="Evidence">
        <ul className="grid max-h-[420px] grid-cols-1 gap-2 overflow-y-auto pr-1 lg:grid-cols-2">
          {rows.map((item) => (
            <EvidenceCard key={item.id} item={item} state={state} selected={state.selectedEvidenceId === item.id} />
          ))}
        </ul>
      </StateFrame>
    </section>
  );
}
