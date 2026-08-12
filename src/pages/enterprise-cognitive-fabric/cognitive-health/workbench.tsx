/**
 * Signature Enterprise Cognitive Health Workbench.
 *
 * Four synchronized regions on large desktop:
 *   1. Health State        — the scope and dimension currently under diagnosis
 *   2. Contributing Signals— positive and negative signals with source records
 *   3. Root Cause Paths    — contributing paths, explicitly not proven causality
 *   4. Enterprise Consequences — business, customer and operational effects plus levers
 *
 * Selecting anything in one region updates the others.
 */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pill, Row } from "../persona-studio/primitives";
import { Panel } from "../cognitive-memory/panels";
import { Trend } from "./panels";
import {
  chTone, dimensionById, dimensions, trendRanges, workbenchConsequences, workbenchScopes,
  workbenchSupportingSignals,
  type ChDerivedState, type ChWorkbenchParams, type TrendRange, type WorkbenchScope,
} from "./data";

export interface HealthSelection {
  signalId: string | null;
  pathId: string | null;
  decisionId: string | null;
  consequence: string | null;
}

export function CognitiveHealthWorkbench({
  params, derived, selection, onSelect, onParams, onOpenRecords,
}: {
  params: ChWorkbenchParams;
  derived: ChDerivedState;
  selection: HealthSelection;
  onSelect: (s: Partial<HealthSelection>) => void;
  onParams: (p: Partial<ChWorkbenchParams>) => void;
  onOpenRecords: (target: string, id?: string) => void;
}) {
  const dim = dimensionById(params.dimensionId);
  const activePath = derived.paths.find((p) => p.id === selection.pathId) ?? derived.paths[0];
  const highlightedPaths = selection.signalId
    ? derived.paths.filter((p) => p.signalIds.includes(selection.signalId as string)).map((p) => p.id)
    : [];

  return (
    <Panel id="panel-workbench" title="Enterprise Cognitive Health Workbench"
      subtitle="Diagnose one dimension inside one scope. Every region stays synchronized to the current selection."
      actions={
        <>
          <select value={params.scope} onChange={(e) => onParams({ scope: e.target.value as WorkbenchScope })}
            aria-label="Workbench scope"
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px] text-slate-600">
            {workbenchScopes.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={params.dimensionId} onChange={(e) => onParams({ dimensionId: e.target.value })}
            aria-label="Workbench dimension"
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px] text-slate-600">
            {dimensions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={params.timeRange} onChange={(e) => onParams({ timeRange: e.target.value as TrendRange })}
            aria-label="Workbench time range"
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px] text-slate-600">
            {trendRanges.map((r) => <option key={r}>{r}</option>)}
          </select>
          <Pill label={derived.status} tone={chTone(derived.status)} />
        </>
      }>
      <div className="grid gap-2 xl:grid-cols-4">

        {/* ------------------------------------------------ region 1 */}
        <section aria-label="Health state" className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Region 1 · Health State</p>
          <p className="text-[12.5px] font-semibold text-slate-900">{params.scope}</p>
          <p className="text-[11.5px] text-slate-600">{dim.name}</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-[32px] font-bold leading-none text-slate-900">{derived.score}</span>
            <div className="pb-0.5">
              <Trend value={derived.trend} />
              <p className="text-[10px] text-slate-500">Target {derived.target} · Previous {derived.previous}</p>
            </div>
          </div>
          <Progress value={derived.score} className="mt-1 h-1.5" />
          <div className="mt-1 grid grid-cols-2 gap-x-2">
            <Row label="Status" value={derived.status} />
            <Row label="Confidence" value={`${derived.confidence}%`} />
            <Row label="Time Range" value={params.timeRange} />
            <Row label="Scope ECHI" value={derived.echi} />
          </div>
          <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Definition</p>
          <p className="text-[11px] text-slate-600">{derived.definition}</p>
          <p className="mt-1 rounded border border-slate-200 bg-white px-1.5 py-1 text-[10.5px] text-slate-600">{derived.scopeNote}</p>
          <p className="mt-1 rounded border border-slate-200 bg-white px-1.5 py-1 text-[10.5px] text-slate-600">{derived.timeNote}</p>

          {params.dimensionId === "DIM CTA" && (
            <>
              <p className="mt-1.5 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Primary Supporting Signals</p>
              <ul className="space-y-0.5">
                {workbenchSupportingSignals.map((s) => (
                  <li key={s.label} className="flex items-center justify-between gap-1 text-[10.5px]">
                    <span className="truncate text-slate-600">{s.label}</span>
                    <span className="shrink-0 font-medium text-slate-800">{s.value}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* ------------------------------------------------ region 2 */}
        <section aria-label="Contributing signals" className="rounded-lg border border-slate-200 p-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Region 2 · Contributing Signals</p>

          <p className="mt-1 text-[10.5px] font-medium text-emerald-700">Positive</p>
          <ul className="space-y-1">
            {derived.positive.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => onSelect({ signalId: c.signalId, pathId: null })}
                  aria-pressed={selection.signalId === c.signalId}
                  className={cn("w-full rounded border px-1.5 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    selection.signalId === c.signalId ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-slate-300")}>
                  <p className="text-[11px] font-medium text-slate-800">{c.description}</p>
                  <p className="text-[10px] text-slate-500">
                    {c.sourceModule} · {c.signalId} · contribution +{c.contributionMagnitude} · confidence {c.confidence}%
                  </p>
                  <p className="text-[10px] text-slate-400">Records · {c.sourceRecordIds.join(", ")}</p>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-1.5 text-[10.5px] font-medium text-red-700">Negative</p>
          <ul className="space-y-1">
            {derived.negative.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => onSelect({ signalId: c.signalId, pathId: null })}
                  aria-pressed={selection.signalId === c.signalId}
                  className={cn("w-full rounded border px-1.5 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    selection.signalId === c.signalId ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300")}>
                  <p className="text-[11px] font-medium text-slate-800">{c.description}</p>
                  <p className="text-[10px] text-slate-500">
                    {c.sourceModule} · {c.signalId} · contribution {c.contributionMagnitude} · confidence {c.confidence}%
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Decisions · {c.affectedDecisionIds.join(", ") || "None"} · Personas · {c.affectedPersonaIds.join(", ") || "None"}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-1.5 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Signal Detail</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[10.5px]">
              <thead><tr className="border-b border-slate-200">
                {["Signal", "Current", "Target", "Trend", "Severity", "Source"].map((h) => (
                  <th key={h} scope="col" className="px-1 py-0.5 text-left font-medium text-slate-500">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {derived.supportingSignals.map((s) => (
                  <tr key={s.id}
                    className={cn("cursor-pointer border-b border-slate-100 hover:bg-slate-50", selection.signalId === s.id && "bg-blue-50")}
                    onClick={() => onSelect({ signalId: s.id })}>
                    <td className="px-1 py-0.5 text-slate-700">{s.name}</td>
                    <td className="px-1 py-0.5 text-slate-700">{s.currentValue}</td>
                    <td className="px-1 py-0.5 text-slate-700">{s.targetValue}</td>
                    <td className="px-1 py-0.5"><Trend value={s.trend} /></td>
                    <td className="px-1 py-0.5 text-slate-700">{s.severity}</td>
                    <td className="px-1 py-0.5 text-slate-500">{s.sourceModule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ------------------------------------------------ region 3 */}
        <section aria-label="Root cause paths" className="rounded-lg border border-slate-200 p-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Region 3 · Root Cause Paths</p>
          <p className="rounded border border-amber-200 bg-amber-50 px-1.5 py-1 text-[10px] text-amber-800">
            Each item is a Contributing Path. It describes an evidence supported sequence, not a proven cause.
          </p>
          <ul className="mt-1 space-y-1">
            {derived.paths.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => onSelect({ pathId: p.id, signalId: p.signalIds[0] })}
                  aria-pressed={activePath?.id === p.id}
                  className={cn("w-full rounded border px-1.5 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    activePath?.id === p.id ? "border-blue-400 bg-blue-50"
                      : highlightedPaths.includes(p.id) ? "border-blue-200 bg-blue-50/40" : "border-slate-200 hover:border-slate-300")}>
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-[11px] font-medium text-slate-800">{p.title}</p>
                    <Pill label="Contributing Path" tone="slate" />
                  </div>
                  <p className="text-[10px] text-slate-500">Confidence {p.confidence}% · {p.status}</p>
                </button>
              </li>
            ))}
          </ul>

          {activePath && (
            <div className="mt-1.5 rounded border border-slate-200 bg-slate-50 p-1.5">
              <p className="text-[11px] font-medium text-slate-800">{activePath.title}</p>
              <p className="text-[10px] text-slate-500">{activePath.description}</p>
              <ol className="mt-1 space-y-0.5">
                {activePath.intermediateEffects.map((step, i) => (
                  <li key={step} className="flex gap-1 text-[10.5px] text-slate-700">
                    <span className="shrink-0 text-slate-400">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-1 grid grid-cols-2 gap-x-2">
                <Row label="Source Modules" value={activePath.sourceModuleIds.join(", ")} />
                <Row label="Records" value={activePath.sourceRecordIds.join(", ")} />
                <Row label="Signals" value={activePath.signalIds.join(", ")} />
                <Row label="Confidence" value={`${activePath.confidence}%`} />
                <Row label="Affected Teams" value={activePath.affectedTeams.join(", ")} />
                <Row label="Affected Decisions" value={activePath.affectedDecisionIds.join(", ") || "None"} />
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {activePath.affectedDecisionIds.map((d) => (
                  <button key={d} type="button" onClick={() => onSelect({ decisionId: d })}
                    aria-pressed={selection.decisionId === d}
                    className={cn("rounded border px-1.5 py-0.5 text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      selection.decisionId === d ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600")}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ------------------------------------------------ region 4 */}
        <section aria-label="Enterprise consequences" className="rounded-lg border border-slate-200 p-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Region 4 · Enterprise Consequences</p>

          {([
            ["Current Business Consequences", activePath ? activePath.enterpriseConsequences.concat(workbenchConsequences.business.slice(0, 2)) : workbenchConsequences.business],
            ["Potential Customer Consequences", workbenchConsequences.customer],
            ["Potential Operational Consequences", workbenchConsequences.operational],
          ] as [string, string[]][]).map(([label, list]) => (
            <div key={label} className="mt-1">
              <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
              <ul className="space-y-0.5">
                {Array.from(new Set(list)).map((c) => (
                  <li key={c}>
                    <button type="button" onClick={() => onSelect({ consequence: c })}
                      aria-pressed={selection.consequence === c}
                      className={cn("w-full rounded px-1 py-0.5 text-left text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                        selection.consequence === c ? "bg-blue-50 text-blue-900" : "text-slate-700 hover:bg-slate-50")}>
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="mt-1.5 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Potential Improvement Levers</p>
          <ul className="space-y-0.5">
            {workbenchConsequences.levers.map((l) => (
              <li key={l} className="rounded border border-slate-200 px-1.5 py-1 text-[10.5px] text-slate-700">{l}</li>
            ))}
          </ul>
          <p className="mt-0.5 text-[10px] text-slate-500">Prompt 2 turns Improvement Levers into governed intervention plans.</p>

          <div className="mt-1.5 flex flex-wrap gap-1">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenRecords("records", activePath?.id)}>Open Underlying Records</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenRecords("persona")}>Open Related Persona</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenRecords("cross-team")}>Open Cross Team Analysis</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenRecords("decision")}>Open Decision</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenRecords("learning")}>Open Learning</Button>
          </div>
        </section>
      </div>
    </Panel>
  );
}
