/**
 * Cognitive Readiness Assessment — panels. Reuses ECF primitives and Tailwind
 * conventions already established in the module.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Pill, type Tone, type Density } from "../persona-studio/primitives";
import {
  ambiguities, assumptions, conditionStates, constraints, contextCoverageRows, contradictions,
  evidenceItems, findings, qualityDimensions, overallQuality, historicalContextRewriteViolations,
  readinessLifecycleStages, workContext,
  type CognitiveReadinessAssessment, type CognitiveReadinessDependencyState,
  type CognitiveReadinessFinding, type CognitiveReadinessPersonaState, type ReadinessKpi,
  type ReadinessStage,
} from "./data";

export type { Density };

export const tone = (s: string): Tone =>
  ["Ready", "Passed", "Validated", "Resolved", "Complete", "Available", "Satisfied", "Active", "Validated Learning"].includes(s) ? "green"
    : ["Conditionally Ready", "Secondary", "Governance", "Primary"].includes(s) ? "blue"
      : ["Blocked", "Failed", "Missing", "Remediation Required", "Evidence Required", "Validation Required", "High", "Critical", "Unresolved"].includes(s) ? "red"
        : ["Passed with Warning", "Warning", "Needs Evidence", "Needs Clarification", "Clarification Required", "Policy Binding Review", "Pending", "Open", "Aging", "Medium", "Potentially Required"].includes(s) ? "amber"
          : "slate";

export function Panel({ id, title, subtitle, actions, children, spotlight, className }: {
  id?: string; title: string; subtitle?: string; actions?: React.ReactNode;
  children: React.ReactNode; spotlight?: boolean; className?: string;
}) {
  return (
    <section
      id={id}
      aria-label={title}
      className={cn("rounded-xl border border-slate-200 bg-white p-3 shadow-sm",
        spotlight && "ring-2 ring-blue-500 ring-offset-2", className)}
    >
      <header className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-1.5">{actions}</div>}
      </header>
      {children}
    </section>
  );
}

export function ReadinessKpiCard({ kpi, onClick, focused }: {
  kpi: ReadinessKpi; onClick: () => void; focused?: boolean;
}) {
  const t = kpi.status === "Healthy" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : kpi.status === "Attention" ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-red-200 bg-red-50 text-red-700";
  return (
    <button
      type="button" onClick={onClick} aria-pressed={!!focused}
      className={cn("rounded-xl border bg-white p-2.5 text-left shadow-sm transition hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        focused ? "border-blue-500 ring-1 ring-blue-300" : "border-slate-200")}
    >
      <div className="flex items-start justify-between gap-1.5">
        <span className="text-[11px] font-medium text-slate-600">{kpi.label}</span>
        <span className={cn("rounded-full border px-1.5 py-0.5 text-[9px] font-semibold", t)}>{kpi.status}</span>
      </div>
      <div className="mt-0.5 text-[20px] font-bold leading-tight text-slate-900">{kpi.value}</div>
      <p className="text-[10.5px] leading-snug text-slate-500">{kpi.detail}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {kpi.drilldowns.map((d) => (
          <span key={d.label} className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[9.5px] text-slate-600">
            {d.label} {d.value}
          </span>
        ))}
      </div>
    </button>
  );
}

export function LifecyclePanel({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <Panel id="panel-lifecycle" title="Cognitive Readiness Assessment Lifecycle"
      subtitle="Eighteen stages from intake package load to Persona Impact handoff preparation">
      <ol className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {readinessLifecycleStages.map((s, i) => (
          <li key={s.id}>
            <button type="button" onClick={() => onSelect(s.id)} aria-pressed={selected === s.id}
              className={cn("w-full rounded-lg border p-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                selected === s.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300")}>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-400">Stage {i + 1}</span>
                <Pill label={s.status} tone={tone(s.status)} />
              </div>
              <div className="mt-0.5 text-[11px] font-medium leading-tight text-slate-800">{s.name}</div>
              <div className="mt-0.5 text-[9.5px] text-slate-500">
                {s.processed} processed · {s.pending} pending · {s.warnings} warnings · {s.failures} failures
              </div>
              <div className="text-[9.5px] text-slate-500">Confidence {s.confidence}% · {s.duration} · {s.owner}</div>
            </button>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

const stageTabs = ["Overview", "Queue", "Evidence", "Gaps", "Dependencies", "Personas", "Conditions", "Outputs"] as const;

export function SelectedStagePanel({ stage }: { stage: ReadinessStage }) {
  const [tab, setTab] = useState<string>("Overview");
  return (
    <Panel id="panel-stage" title="Selected Assessment Stage" subtitle={stage.name}>
      <div className="mb-2 flex flex-wrap gap-1" role="tablist" aria-label="Stage detail tabs">
        {stageTabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{t}</button>
        ))}
      </div>
      <dl className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Status", stage.status], ["Items Processing", String(stage.processed)],
          ["Warnings", String(stage.warnings)], ["Failures", String(stage.failures)],
          ["Evidence Coverage", "84%"], ["Confidence", `${stage.confidence}%`],
          ["Average Duration", stage.duration], ["Owner", stage.owner],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5">
            <dt className="text-[9.5px] uppercase tracking-wide text-slate-500">{k}</dt>
            <dd className="text-[12px] font-semibold text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[11px] text-slate-500">
        {tab} detail for {stage.name}. This stage evaluates whether the incoming intake package carries enough
        context for downstream Persona Impact Analysis. It does not evaluate impact.
      </p>
    </Panel>
  );
}

/* ----------------------------------------------------------------- queue -- */

export function AssessmentQueuePanel({
  rows, allCount, columns, hiddenColumns, density, selected, onToggle, onToggleAll, onOpen,
  sortKey, sortDir, onSort, page, pages, onPage, spotlight, toolbar,
}: {
  rows: CognitiveReadinessAssessment[];
  allCount: number;
  columns: { key: string; label: string; get: (a: CognitiveReadinessAssessment) => string | number }[];
  hiddenColumns: string[];
  density: Density;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onOpen: (a: CognitiveReadinessAssessment) => void;
  sortKey: string; sortDir: "asc" | "desc"; onSort: (k: string) => void;
  page: number; pages: number; onPage: (p: number) => void;
  spotlight?: boolean;
  toolbar?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const cols = columns.filter((c) => !hiddenColumns.includes(c.key));
  const pad = density === "compact" ? "py-1" : density === "comfortable" ? "py-2.5" : "py-1.5";

  return (
    <Panel id="panel-queue" title="Cognitive Readiness Assessment Queue"
      subtitle={`${allCount} assessments match the current filters`} spotlight={spotlight} actions={toolbar}>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-[12px] text-slate-600">
          No assessments match the current filters.
        </p>
      ) : (
        <>
          <div className="hidden overflow-auto rounded-lg border border-slate-200 md:block">
            <table className="w-full text-left text-[11px]">
              <caption className="sr-only">Cognitive Readiness Assessment queue, {allCount} rows</caption>
              <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="w-8 px-2 py-1.5">
                    <input type="checkbox" aria-label="Select all assessments"
                      checked={selected.size > 0 && selected.size === rows.length} onChange={onToggleAll} />
                  </th>
                  {cols.map((c) => (
                    <th key={c.key} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">
                      <button type="button" onClick={() => onSort(c.key)} className="inline-flex items-center gap-1 hover:text-blue-700">
                        {c.label}
                        {sortKey === c.key && <span aria-hidden>{sortDir === "asc" ? "▲" : "▼"}</span>}
                      </button>
                    </th>
                  ))}
                  <th scope="col" className="px-2 py-1.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((a) => (
                  <tr key={a.id} className="cursor-pointer hover:bg-slate-50" onClick={() => onOpen(a)}>
                    <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" aria-label={`Select ${a.id}`} checked={selected.has(a.id)} onChange={() => onToggle(a.id)} />
                    </td>
                    {cols.map((c) => (
                      <td key={c.key} className={cn("max-w-[220px] px-2 text-slate-700", pad)}>
                        {c.key === "state" ? <Pill label={a.state} tone={tone(a.state)} /> : c.get(a)}
                      </td>
                    ))}
                    <td className={cn("whitespace-nowrap px-2", pad)} onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onOpen(a)}>Open</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
          <ul className="space-y-2 md:hidden" aria-label="Assessment cards">
            {rows.map((a) => (
              <li key={a.id} className="rounded-lg border border-slate-200 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-slate-900">{a.workItem}</span>
                  <Pill label={a.state} tone={tone(a.state)} />
                </div>
                <p className="text-[11px] text-slate-500">{a.id} · {a.submittingTeam} · Readiness {a.score}</p>
                <div className="mt-1 flex gap-1">
                  <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onOpen(a)}>Open</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10.5px]"
                    aria-label={`Toggle summary for ${a.id}`}
                    onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                    {expanded === a.id ? <ChevronUp className="h-3 w-3" aria-hidden /> : <ChevronDown className="h-3 w-3" aria-hidden />}
                  </Button>
                </div>
                {expanded === a.id && (
                  <p className="mt-1 text-[11px] text-slate-600">
                    Evidence {a.evidence} · Dependencies {a.dependencies} · Warnings {a.warnings} · Blocking {a.blockingGaps}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{selected.size} selected · page {page} of {pages}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}

/* --------------------------------------------------------- matrix panels -- */

function StatusCell({ ok, label }: { ok: boolean; label: string }) {
  return (
    <td className="px-2 py-1">
      <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
        ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
        <span aria-hidden>{ok ? "●" : "○"}</span>
        <span className="sr-only">{label}: </span>{ok ? "Yes" : "No"}
      </span>
    </td>
  );
}

export function ContextCoveragePanel({ spotlight }: { spotlight?: boolean }) {
  return (
    <Panel id="panel-context-matrix" title="Cognitive Context Coverage" spotlight={spotlight}
      subtitle="Whether each context element is available, complete, authoritative, current, and consistent">
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Cognitive context coverage matrix</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              {["Context Element", "Available", "Complete", "Authoritative", "Current", "Consistent", "Confidence", "Blocking if Missing"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contextCoverageRows.map((r) => (
              <tr key={r.element}>
                <th scope="row" className="whitespace-nowrap px-2 py-1 text-left font-medium text-slate-800">{r.element}</th>
                <StatusCell ok={r.available} label="Available" />
                <StatusCell ok={r.complete} label="Complete" />
                <StatusCell ok={r.authoritative} label="Authoritative" />
                <StatusCell ok={r.current} label="Current" />
                <StatusCell ok={r.consistent} label="Consistent" />
                <td className="px-2 py-1 text-slate-700">{r.confidence}%</td>
                <td className="px-2 py-1">{r.blockingIfMissing ? <Pill label="Blocking" tone="red" /> : <Pill label="Non blocking" tone="slate" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function PersonaReadinessPanel({ rows, selected, onSelect }: {
  rows: CognitiveReadinessPersonaState[]; selected: string | null; onSelect: (p: string) => void;
}) {
  return (
    <Panel id="panel-persona-readiness" title="Persona Evaluation Readiness"
      subtitle="Whether enough context exists to evaluate each Persona. This does not evaluate impact.">
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Persona evaluation readiness</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              {["Persona", "Candidate Match", "Context Coverage", "Applicable Conditions", "Dependency Coverage", "Evidence Coverage", "Readiness", "Confidence", "Primary Gap"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p) => (
              <tr key={p.persona} onClick={() => onSelect(p.persona)}
                className={cn("cursor-pointer hover:bg-slate-50", selected === p.persona && "bg-blue-50")}>
                <th scope="row" className="whitespace-nowrap px-2 py-1 text-left font-medium text-slate-800">{p.persona}</th>
                <td className="px-2 py-1">{p.candidateMatch}</td>
                <td className="px-2 py-1">{p.contextCoverage}%</td>
                <td className="px-2 py-1">{p.applicableConditions}</td>
                <td className="px-2 py-1">{p.dependencyCoverage}%</td>
                <td className="px-2 py-1">{p.evidenceCoverage}%</td>
                <td className="px-2 py-1"><Pill label={p.readiness} tone={p.readiness === "Ready" ? "green" : p.readiness.startsWith("Not Evaluable") ? "red" : "amber"} /></td>
                <td className="px-2 py-1">{p.confidence}%</td>
                <td className="px-2 py-1 text-slate-600">{p.primaryGap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function ConditionReadinessPanel({ selected, onSelect }: {
  selected: string | null; onSelect: (c: string) => void;
}) {
  return (
    <Panel id="panel-conditions" title="Business Condition Coverage"
      subtitle="Applicability, authority, policy binding, and evidence behind every relevant Business Condition">
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Business condition coverage</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              {["Condition", "Type", "Applicability", "Source", "Authority", "Policy Binding", "Evidence", "Freshness", "Confidence", "Status"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {conditionStates.map((c) => (
              <tr key={c.condition} onClick={() => onSelect(c.condition)}
                className={cn("cursor-pointer hover:bg-slate-50", selected === c.condition && "bg-blue-50")}>
                <th scope="row" className="whitespace-nowrap px-2 py-1 text-left font-medium text-slate-800">{c.condition}</th>
                <td className="px-2 py-1">{c.type}</td>
                <td className="px-2 py-1">{c.applicability}</td>
                <td className="px-2 py-1">{c.source}</td>
                <td className="px-2 py-1">{c.authority}</td>
                <td className="px-2 py-1">{c.policyBinding}</td>
                <td className="px-2 py-1">{c.evidence}</td>
                <td className="px-2 py-1">{c.freshness}</td>
                <td className="px-2 py-1">{c.confidence}%</td>
                <td className="px-2 py-1"><Pill label={c.status} tone={tone(c.status)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function DependencyReadinessPanel({ rows, selected, onSelect }: {
  rows: CognitiveReadinessDependencyState[]; selected: string | null; onSelect: (d: string) => void;
}) {
  return (
    <Panel id="panel-dependencies" title="Dependency Context Readiness"
      subtitle="Whether dependency context is validated well enough to reason about exposure">
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Dependency context readiness</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              {["Dependency", "Relationship", "Owner", "Criticality", "Evidence Coverage", "Freshness", "Confidence", "Affected Personas", "Status"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((d) => (
              <tr key={d.dependency} onClick={() => onSelect(d.dependency)}
                className={cn("cursor-pointer hover:bg-slate-50", selected === d.dependency && "bg-blue-50")}>
                <th scope="row" className="whitespace-nowrap px-2 py-1 text-left font-medium text-slate-800">{d.dependency}</th>
                <td className="px-2 py-1">{d.relationship}</td>
                <td className="px-2 py-1">{d.owner}</td>
                <td className="px-2 py-1">{d.criticality}</td>
                <td className="px-2 py-1">{d.evidenceCoverage}%</td>
                <td className="px-2 py-1">{d.freshness}</td>
                <td className="px-2 py-1">{d.confidence}%</td>
                <td className="px-2 py-1 text-slate-600">{d.affectedPersonas.join(", ")}</td>
                <td className="px-2 py-1"><Pill label={d.status} tone={tone(d.status)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function EvidenceSufficiencyPanel({ provided, onSelect, selected }: {
  provided: Record<string, boolean>; onSelect: (id: string) => void; selected: string | null;
}) {
  const groups = Array.from(new Set(evidenceItems.map((e) => e.group)));
  return (
    <Panel id="panel-evidence" title="Readiness Evidence Sufficiency"
      subtitle="Evidence grouped by class, with authority, freshness, quality, and downstream effect">
      <div className="space-y-2">
        {groups.map((g) => (
          <div key={g}>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{g}</h3>
            <div className="mt-1 overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-[11px]">
                <caption className="sr-only">{g} evidence</caption>
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                  <tr>
                    {["Evidence", "Required", "Provided", "Authority", "Freshness", "Quality", "Affected Dimensions", "Affected Personas", "Status"].map((h) => (
                      <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evidenceItems.filter((e) => e.group === g).map((e) => {
                    const isProvided = provided[e.id] ?? e.provided;
                    return (
                      <tr key={e.id} onClick={() => onSelect(e.id)}
                        className={cn("cursor-pointer hover:bg-slate-50", selected === e.id && "bg-blue-50")}>
                        <th scope="row" className="whitespace-nowrap px-2 py-1 text-left font-medium text-slate-800">{e.evidence}</th>
                        <td className="px-2 py-1">{e.required ? "Required" : "Optional"}</td>
                        <td className="px-2 py-1">{isProvided ? "Yes" : "No"}</td>
                        <td className="px-2 py-1">{isProvided ? (e.authority === "Not provided" ? "Authoritative" : e.authority) : e.authority}</td>
                        <td className="px-2 py-1">{isProvided ? (e.freshness === "Not provided" ? "Current" : e.freshness) : e.freshness}</td>
                        <td className="px-2 py-1">{isProvided ? (e.quality || 90) : 0}</td>
                        <td className="px-2 py-1 text-slate-600">{e.affectedDimensions.join(", ")}</td>
                        <td className="px-2 py-1 text-slate-600">{e.affectedPersonas.join(", ")}</td>
                        <td className="px-2 py-1"><Pill label={isProvided ? "Available" : e.status} tone={tone(isProvided ? "Available" : e.status)} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function AssumptionPanel() {
  return (
    <Panel id="panel-assumptions" title="Readiness Assumptions"
      subtitle="Material assumptions must be explicit before impact analysis can be trusted">
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Readiness assumptions</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              {["Assumption", "Category", "Source", "Confidence", "Materiality", "Affected Personas", "Evidence", "Validation State"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assumptions.map((a) => (
              <tr key={a.id}>
                <th scope="row" className="px-2 py-1 text-left font-medium text-slate-800">{a.assumption}</th>
                <td className="px-2 py-1">{a.category}</td>
                <td className="px-2 py-1">{a.source}</td>
                <td className="px-2 py-1">{a.confidence}</td>
                <td className="px-2 py-1">{a.materiality}</td>
                <td className="px-2 py-1 text-slate-600">{a.affectedPersonas.join(", ")}</td>
                <td className="px-2 py-1 text-slate-600">{a.evidence}</td>
                <td className="px-2 py-1"><Pill label={a.validationState} tone={tone(a.validationState === "Validated" ? "Validated" : a.validationState === "Explicit" ? "Ready" : a.validationState)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function ConstraintPanel() {
  return (
    <Panel id="panel-constraints" title="Readiness Constraints"
      subtitle="Decision boundaries that shape what analysis is even permitted">
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Readiness constraints</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              {["Constraint", "Type", "Source", "Authority", "Applicability", "Affected Scope", "Affected Personas", "Status"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {constraints.map((c) => (
              <tr key={c.id}>
                <th scope="row" className="px-2 py-1 text-left font-medium text-slate-800">{c.constraint}</th>
                <td className="px-2 py-1">{c.type}</td>
                <td className="px-2 py-1">{c.source}</td>
                <td className="px-2 py-1">{c.authority}</td>
                <td className="px-2 py-1">{c.applicability}</td>
                <td className="px-2 py-1">{c.affectedScope}</td>
                <td className="px-2 py-1 text-slate-600">{c.affectedPersonas.join(", ")}</td>
                <td className="px-2 py-1"><Pill label={c.status} tone={tone(c.status)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function AmbiguityPanel() {
  return (
    <Panel id="panel-ambiguities" title="Readiness Ambiguities"
      subtitle="Language that could change the analysis depending on interpretation">
      <ul className="grid gap-1.5 lg:grid-cols-2">
        {ambiguities.map((a) => (
          <li key={a.id} className="rounded-lg border border-slate-200 p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold text-slate-900">“{a.text}”</span>
              <Pill label={a.materiality} tone={tone(a.materiality)} />
            </div>
            <p className="text-[11px] text-slate-500">{a.source} · {a.whyAmbiguous}</p>
            <p className="mt-1 text-[11px] text-slate-700">
              <span className="font-medium">Possible interpretations: </span>{a.interpretations.join(" · ")}
            </p>
            <p className="text-[10.5px] text-slate-500">
              Dimensions: {a.affectedDimensions.join(", ")} · Personas: {a.affectedPersonas.join(", ")} · {a.status}
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ContradictionPanel() {
  return (
    <Panel id="panel-contradictions" title="Context Contradictions"
      subtitle="Contradictions are surfaced, never silently resolved. Resolution workflow arrives in Prompt 2.">
      <ul className="space-y-1.5">
        {contradictions.map((c) => (
          <li key={c.id} className="rounded-lg border border-red-200 bg-red-50 p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold text-red-900">{c.conflictType}</span>
              <Pill label={c.severity} tone="red" />
            </div>
            <p className="text-[11px] text-red-800">{c.statementA}</p>
            <p className="text-[11px] text-red-800">{c.statementB}</p>
            <p className="mt-1 text-[10.5px] text-red-700">Affected: {c.affected.join(", ")} · {c.status}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function FindingsPanel({ onSelect, selected }: {
  onSelect: (f: CognitiveReadinessFinding) => void; selected: string | null;
}) {
  return (
    <Panel id="panel-findings" title="Cognitive Readiness Findings"
      subtitle="Every finding is traceable to a dimension, a gate, and the context it affects">
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Cognitive readiness findings</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              {["Finding ID", "Type", "Description", "Dimension", "Gate", "Severity", "Blocking", "Affected Personas", "Recommended Action", "Status"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {findings.map((f) => (
              <tr key={f.id} onClick={() => onSelect(f)}
                className={cn("cursor-pointer hover:bg-slate-50", selected === f.id && "bg-blue-50")}>
                <th scope="row" className="whitespace-nowrap px-2 py-1 text-left font-medium text-slate-800">{f.id}</th>
                <td className="px-2 py-1">{f.type}</td>
                <td className="max-w-[280px] px-2 py-1 text-slate-600">{f.description}</td>
                <td className="px-2 py-1">{f.dimension}</td>
                <td className="px-2 py-1">{f.gate}</td>
                <td className="px-2 py-1"><Pill label={f.severity} tone={tone(f.severity)} /></td>
                <td className="px-2 py-1">{f.blocking ? "Yes" : "No"}</td>
                <td className="px-2 py-1 text-slate-600">{f.affectedPersonas.join(", ")}</td>
                <td className="max-w-[240px] px-2 py-1 text-slate-600">{f.recommendedAction}</td>
                <td className="px-2 py-1"><Pill label={f.status} tone={tone(f.status)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function QualityPanel() {
  return (
    <Panel id="panel-quality" title="Cognitive Readiness Quality"
      subtitle={`Overall ${overallQuality} / 100 · Historical Context Rewrite Violations ${historicalContextRewriteViolations}`}>
      <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
        {qualityDimensions.map((q) => (
          <li key={q.name} className="rounded-lg border border-slate-200 p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-600">{q.name}</span>
              <span className="text-[13px] font-semibold text-slate-900">{q.score}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100">
              <div className={cn("h-1.5 rounded-full", q.score >= 95 ? "bg-emerald-500" : q.score >= 88 ? "bg-blue-500" : "bg-amber-500")}
                style={{ width: `${q.score}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-slate-500">
        Historical Context Rewrite Violations must remain zero. Readiness assessments never rewrite historical
        enterprise context; they add a new assessment version instead.
      </p>
    </Panel>
  );
}

export function HandoffPreviewPanel({
  state, score, confidence, personas, evidenceGaps, governanceRequired,
}: {
  state: string; score: number; confidence: number;
  personas: CognitiveReadinessPersonaState[]; evidenceGaps: string[]; governanceRequired: boolean;
}) {
  const rows: [string, string][] = [
    ["Work Item", workContext.workItem],
    ["Intake Package Version", workContext.intakePackageVersion],
    ["Readiness Assessment Version", workContext.assessmentVersion],
    ["Readiness State", state],
    ["Readiness Score", `${score} / 100`],
    ["Readiness Confidence", `${confidence}%`],
    ["Intent", workContext.intent],
    ["Current State", workContext.currentState],
    ["Proposed State", workContext.proposedState],
    ["Scope", `${workContext.initialScope} initial · ${workContext.potentialExpansion} potential expansion`],
    ["Systems", workContext.systems.join(", ")],
    ["Services", "Retry Orchestrator, Payments API, Fraud Decision Service"],
    ["Dependencies", workContext.dependencies.join(", ")],
    ["Candidate Personas", personas.map((p) => p.persona).join(", ")],
    ["Persona Readiness", personas.map((p) => `${p.persona}: ${p.readiness}`).join(" · ")],
    ["Applicable Business Conditions", conditionStates.map((c) => c.condition).join(", ")],
    ["Evidence", evidenceItems.filter((e) => e.provided).map((e) => e.evidence).join(", ")],
    ["Evidence Gaps", evidenceGaps.length ? evidenceGaps.join(", ") : "None"],
    ["Assumptions", assumptions.map((a) => a.assumption).join(" · ")],
    ["Constraints", constraints.map((c) => c.constraint).join(" · ")],
    ["Ambiguities", ambiguities.map((a) => `“${a.text}”`).join(", ")],
    ["Contradictions", contradictions.map((c) => c.conflictType).join(", ")],
    ["Rollout", workContext.rollout],
    ["Rollback", workContext.rollback],
    ["Expected Outcomes", workContext.expectedOutcome],
    ["Uncertainty Markers", governanceRequired
      ? "Demand assumption unconfirmed at 15% exposure; joint approval context required"
      : "Demand assumption unconfirmed; fraud loss tolerance unevidenced"],
    ["Historical Context Version", workContext.historicalContextVersion],
  ];
  return (
    <Panel id="panel-handoff" title="Persona Impact Handoff Preview"
      subtitle="Preview only. Prompt 1 does not route work to Persona Impact Analysis.">
      <dl className="grid gap-1.5 lg:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5">
            <dt className="text-[9.5px] uppercase tracking-wide text-slate-500">{k}</dt>
            <dd className="text-[11.5px] text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
