/** Enterprise Cognitive Memory — Memory Workbench (three synchronized regions). */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pill } from "../persona-studio/primitives";
import { Panel, memTone } from "./panels";
import {
  defaultMemoryQuestion, suggestedQuestions, workbenchConclusions, workbenchResults,
  type WorkbenchResult,
} from "./data";

export interface WorkbenchState {
  question: string;
  knowledgeDomain: string;
  team: string;
  memoryType: string;
  authorityRequirement: string;
  freshnessRequirement: string;
  accessScope: string;
  pointInTime: string;
  includeHistorical: boolean;
  includeDecisions: boolean;
  includeOutcomes: boolean;
  includeLearning: boolean;
  excluded: string[];
  ran: boolean;
}

export const initialWorkbenchState: WorkbenchState = {
  question: defaultMemoryQuestion,
  knowledgeDomain: "Payments & Reliability", team: "All", memoryType: "All",
  authorityRequirement: "Primary or better", freshnessRequirement: "Current or aging",
  accessScope: "Internal", pointInTime: "Now (Prompt 2)",
  includeHistorical: true, includeDecisions: true, includeOutcomes: true, includeLearning: true,
  excluded: [], ran: true,
};

const tabs = ["Answer", "Supporting Memory", "Evidence", "Relationships", "Prior Decisions", "Observed Outcomes", "Learning"] as const;

export function MemoryWorkbench({
  state, onChange, onOpenRecord, onOpenEvidence, onOpenGraph, onSaveContextSet, onExportBrief, onNavigate,
}: {
  state: WorkbenchState; onChange: (s: WorkbenchState) => void;
  onOpenRecord: (recordId: string) => void; onOpenEvidence: (evidenceId: string) => void;
  onOpenGraph: () => void; onSaveContextSet: () => void; onExportBrief: () => void;
  onNavigate: (target: "intake" | "impact") => void;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Answer");
  const [activeConclusion, setActiveConclusion] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<string | null>(null);

  const results = useMemo(() => workbenchResults.filter((r) => {
    if (!state.includeDecisions && r.memoryType === "Decision") return false;
    if (!state.includeOutcomes && r.memoryType === "Outcome") return false;
    if (!state.includeLearning && r.memoryType === "Learning Record") return false;
    if (state.memoryType !== "All" && r.memoryType !== state.memoryType) return false;
    if (state.freshnessRequirement === "Current only" && r.freshness !== "Current") return false;
    if (state.authorityRequirement === "Primary only" && r.authority !== "Primary") return false;
    if (state.accessScope === "Internal" && r.accessState === "Restricted") return false;
    return true;
  }), [state]);

  const included = results.filter((r) => !state.excluded.includes(r.id));
  const includedIds = new Set(included.map((r) => r.id));

  const conclusions = workbenchConclusions
    .map((c) => ({ ...c, supportingIds: c.supportingIds.filter((id) => includedIds.has(id)) }))
    .filter((c) => c.supportingIds.length > 0);

  const confidence = included.length
    ? Math.round(included.reduce((a, r) => a + r.confidence, 0) / included.length)
    : 0;

  const toggleExclude = (id: string) =>
    onChange({ ...state, excluded: state.excluded.includes(id) ? state.excluded.filter((x) => x !== id) : [...state.excluded, id] });

  const set = <K extends keyof WorkbenchState>(k: K, v: WorkbenchState[K]) => onChange({ ...state, [k]: v });

  const highlightResult = (r: WorkbenchResult) =>
    activeConclusion ? workbenchConclusions.find((c) => c.id === activeConclusion)?.supportingIds.includes(r.id) : false;

  const highlightConclusion = (id: string) =>
    activeResult ? workbenchResults.find((r) => r.id === activeResult)?.supports.includes(id) : false;

  const selectControl = (label: string, value: string, options: string[], key: keyof WorkbenchState) => (
    <label className="flex flex-col gap-0.5">
      <span className="text-[9.5px] uppercase tracking-wide text-slate-500">{label}</span>
      <select value={value} onChange={(e) => set(key, e.target.value as never)}
        className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px] text-slate-700">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );

  return (
    <Panel id="panel-workbench" title="Enterprise Memory Workbench"
      subtitle="Ask an enterprise question, inspect the governed context retrieved, and read an explainable answer traced to evidence"
      actions={
        <>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onSaveContextSet}>Save Context Set</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onExportBrief}>Export Memory Brief</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("intake")}>Open Cognitive Intake</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("impact")}>Open Persona Impact Analysis</Button>
        </>
      }>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.3fr)]">
        {/* Region 1 */}
        <div className="rounded-lg border border-slate-200 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">1 · Enterprise Question</p>
          <textarea value={state.question} onChange={(e) => set("question", e.target.value)} rows={3}
            aria-label="Enterprise question"
            className="mt-1 w-full rounded-md border border-slate-200 p-1.5 text-[11.5px] text-slate-800 focus:border-blue-400 focus:outline-none" />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {suggestedQuestions.map((q) => (
              <button key={q} type="button" onClick={() => set("question", q)}
                className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-left text-[10px] text-slate-600 hover:border-blue-300">{q}</button>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {selectControl("Knowledge Domain", state.knowledgeDomain, ["All", "Payments & Reliability", "Payments & Commerce", "Identity & Access", "Fraud & Risk", "Release Governance"], "knowledgeDomain")}
            {selectControl("Team", state.team, ["All", "Payments Platform", "Checkout Engineering", "Fraud Engineering", "Site Reliability Engineering"], "team")}
            {selectControl("Memory Type", state.memoryType, ["All", "Team Persona", "Business Condition", "Control", "Entity", "Policy", "Decision", "Outcome", "Learning Record"], "memoryType")}
            {selectControl("Authority Requirement", state.authorityRequirement, ["Any authority", "Primary or better", "Primary only"], "authorityRequirement")}
            {selectControl("Freshness Requirement", state.freshnessRequirement, ["Any freshness", "Current or aging", "Current only"], "freshnessRequirement")}
            {selectControl("Access Scope", state.accessScope, ["Internal", "Confidential", "All approved"], "accessScope")}
            {selectControl("Point in Time", state.pointInTime, ["Now (Prompt 2)", "At DEC 4812 approval (Prompt 2)"], "pointInTime")}
          </div>
          <div className="mt-1.5 space-y-0.5">
            {([["includeHistorical", "Include Historical"], ["includeDecisions", "Include Decisions"], ["includeOutcomes", "Include Outcomes"], ["includeLearning", "Include Learning"]] as const).map(([k, label]) => (
              <label key={k} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <input type="checkbox" checked={state[k]} onChange={(e) => set(k, e.target.checked as never)} />
                {label}
              </label>
            ))}
          </div>
          <Button size="sm" className="mt-2 h-7 w-full text-[11px]" onClick={() => set("ran", true)}>Run Query</Button>
        </div>

        {/* Region 2 */}
        <div className="rounded-lg border border-slate-200 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            2 · Retrieved Enterprise Context ({included.length} of {results.length} included)
          </p>
          <ul className="mt-1 max-h-[520px] space-y-1 overflow-y-auto pr-1">
            {results.map((r) => {
              const excluded = state.excluded.includes(r.id);
              return (
                <li key={r.id}
                  className={cn("rounded-lg border p-1.5",
                    excluded ? "border-slate-200 bg-slate-50 opacity-60" : "border-slate-200",
                    highlightResult(r) && "border-blue-400 bg-blue-50",
                    activeResult === r.id && "ring-2 ring-blue-400")}>
                  <button type="button" className="w-full text-left" onClick={() => setActiveResult(activeResult === r.id ? null : r.id)}>
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-900">{r.title}</span>
                      <Pill label={r.memoryType} tone="blue" />
                    </div>
                    <p className="text-[10.5px] text-slate-600">{r.whyRelevant}</p>
                    <div className="mt-1 flex flex-wrap gap-1 text-[9.5px]">
                      <Pill label={r.authority} tone={memTone(r.authority)} />
                      <Pill label={`${r.confidence}% confidence`} tone="slate" />
                      <Pill label={r.freshness} tone={memTone(r.freshness)} />
                      <Pill label={`${r.evidenceCount} evidence`} tone="slate" />
                      <Pill label={r.accessState} tone={r.accessState === "Restricted" ? "red" : "slate"} />
                      <Pill label={excluded ? "Excluded" : "Included"} tone={excluded ? "slate" : "green"} />
                    </div>
                    <p className="mt-0.5 text-[9.5px] text-slate-500">Relationship to query: {r.relationship}</p>
                  </button>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => toggleExclude(r.id)}>{excluded ? "Include" : "Exclude"}</Button>
                    {r.recordId && <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenRecord(r.recordId!)}>Open</Button>}
                    {r.evidenceId && <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenEvidence(r.recordId ?? r.id)}>Open Evidence</Button>}
                    <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={onOpenGraph}>Open Relationship Path</Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Region 3 */}
        <div className="rounded-lg border border-slate-200 p-2">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">3 · Explainable Memory Response</p>
            <Pill label={`Answer confidence ${confidence}%`} tone={confidence >= 90 ? "green" : "amber"} />
          </div>
          <div className="mt-1 flex flex-wrap gap-1" role="tablist" aria-label="Memory response tabs">
            {tabs.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
                className={cn("rounded px-2 py-1 text-[10.5px]", tab === t ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{t}</button>
            ))}
          </div>

          <div className="mt-2 max-h-[480px] space-y-1.5 overflow-y-auto pr-1">
            {tab === "Answer" && conclusions.map((c) => (
              <button key={c.id} type="button" onClick={() => setActiveConclusion(activeConclusion === c.id ? null : c.id)}
                className={cn("w-full rounded-lg border p-1.5 text-left",
                  activeConclusion === c.id ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300",
                  highlightConclusion(c.id) && "ring-2 ring-blue-400")}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{c.group}</p>
                <p className="text-[11.5px] text-slate-800">{c.text}</p>
                <p className="mt-0.5 text-[9.5px] text-slate-500">
                  Supported by {c.supportingIds.length} records · authority {workbenchResults.filter((r) => c.supportingIds.includes(r.id)).map((r) => r.authority).join(", ")}
                </p>
              </button>
            ))}
            {tab === "Supporting Memory" && (
              <ul className="space-y-1 text-[11px] text-slate-700">
                {included.map((r) => (
                  <li key={r.id} className="rounded border border-slate-200 px-1.5 py-1">
                    <strong>{r.title}</strong> — {r.memoryType} · {r.authority} · {r.confidence}% · {r.freshness} · {r.accessState}
                  </li>
                ))}
              </ul>
            )}
            {tab === "Evidence" && (
              <ul className="space-y-1 text-[11px] text-slate-700">
                {included.filter((r) => r.evidenceId).map((r) => (
                  <li key={r.id} className="rounded border border-slate-200 px-1.5 py-1">
                    <button type="button" className="text-blue-700 hover:underline" onClick={() => onOpenEvidence(r.recordId ?? r.id)}>
                      {r.evidenceId} — {r.title}
                    </button>
                    <span className="text-slate-500"> · {r.evidenceCount} references · {r.authority}</span>
                  </li>
                ))}
              </ul>
            )}
            {tab === "Relationships" && (
              <ul className="space-y-1 text-[11px] text-slate-700">
                {included.map((r) => (
                  <li key={r.id} className="rounded border border-slate-200 px-1.5 py-1">
                    {r.title} <span className="text-slate-500">— {r.relationship}</span>
                  </li>
                ))}
              </ul>
            )}
            {tab === "Prior Decisions" && (
              <div className="space-y-1 text-[11.5px] text-slate-700">
                <p><strong>Prior Decision:</strong> Limited retry increase approved for 5% traffic.</p>
                <p><strong>Prior Expected Outcome:</strong> Improve checkout completion 1.5%.</p>
                <p className="text-[10.5px] text-slate-500">DEC 4812 · approved with conditions · Payments Reliability, Fraud Engineering, SRE, Release Governance.</p>
              </div>
            )}
            {tab === "Observed Outcomes" && (
              <div className="space-y-1 text-[11.5px] text-slate-700">
                <p><strong>Observed Outcome:</strong> Checkout completion improved 1.8%.</p>
                <p>Duplicate authorization attempts increased 0.4%.</p>
                <p className="text-[10.5px] text-slate-500">OUT 3284 · observed production outcome · 96% confidence.</p>
              </div>
            )}
            {tab === "Learning" && (
              <div className="space-y-1 text-[11.5px] text-slate-700">
                <p><strong>Learning:</strong> Future retry changes require stronger idempotency validation before traffic expansion.</p>
                <p className="text-[10.5px] text-slate-500">LRN 1426 · outcome validated · applied to 2 conditions, 2 controls, and 3 Persona sections.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
