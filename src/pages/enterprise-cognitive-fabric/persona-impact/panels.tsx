/** Persona Impact Analysis — operational panels built on existing ECF primitives. */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Pill, Row, type Tone } from "../persona-studio/primitives";
import { Panel, EmptyState, PanelSkeleton, type Density } from "../cognitive-memory/panels";
import { IntakeKpiCard } from "../cognitive-intake/panels";
import {
  activityRows, conflictsFor, dependencyPaths, graphEdges, graphFilters, graphNodes,
  impactConditions, impactEvidence, impactPersonas, lifecycleCallouts, lifecycleStages,
  opportunities, personaById, personaSummaryMeta, qualityDimensions, queueColumns,
  recommendations, resultSummary, scorePersona, sharedControls, sharedEvidenceRequirements,
  sharedFindings, sharedObjectives, sharedRisks, stageById,
  type GraphNode, type ImpactCondition, type ImpactEvidence, type PersonaImpactConflict,
  type PersonaImpactEvaluation, type PersonaImpactFinding, type PersonaImpactStage,
  type PiaView, type ProposalState,
} from "./data";

export { Panel, EmptyState, PanelSkeleton, IntakeKpiCard };
export type { Density };

export const piaTone = (s: string): Tone =>
  ["Running", "Positive", "Healthy", "Within SLA", "Analysis Complete", "Complete", "Current", "In Place", "Provided", "Operational", "Low", "Applicable"].includes(s) ? "green"
    : ["Warning", "Review Required", "At Risk", "Analyzing", "Attention", "Medium", "Mixed", "Conditional", "Pending Review", "Monitoring", "Required", "Aging"].includes(s) ? "amber"
      : ["Blocked", "Failed", "Critical", "High", "Missing", "Needs Evidence", "Open", "Negative", "Breached"].includes(s) ? "red"
        : ["Idle", "Neutral", "Informational", "Not Required", "Draft", "Historical"].includes(s) ? "slate" : "blue";

const pct = (n: number) => `${Math.round(n)}%`;

/* ------------------------------------------------------------- lifecycle -- */

export function LifecyclePanel({
  selectedStage, onSelect, focus, onFocus,
}: {
  selectedStage: string;
  onSelect: (id: string) => void;
  focus: string;
  onFocus: (f: string) => void;
}) {
  const visible = lifecycleStages.filter((s) =>
    focus === "all" ? true
      : focus === "warnings" ? s.status === "Warning"
        : focus === "running" ? s.status === "Running" : true);
  return (
    <Panel id="panel-lifecycle" title="Persona Impact Analysis Lifecycle"
      subtitle="Thirteen governed stages transform an Intake Package into Persona specific impact results"
      actions={
        <div className="flex gap-1" role="group" aria-label="Lifecycle focus">
          {[["all", "All"], ["running", "Running"], ["warnings", "Warnings"]].map(([id, label]) => (
            <button key={id} type="button" onClick={() => onFocus(id)}
              className={cn("rounded border px-1.5 py-0.5 text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                focus === id ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
              {label}
            </button>
          ))}
        </div>
      }>
      <ol className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {visible.map((s) => (
          <li key={s.id}>
            <button type="button" onClick={() => onSelect(s.id)} aria-current={selectedStage === s.id}
              className={cn("w-full rounded-lg border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                selectedStage === s.id ? "border-blue-400 bg-blue-50/60" : "border-slate-200 bg-white hover:border-blue-300")}>
              <div className="flex items-start justify-between gap-1.5">
                <span className="text-[11.5px] font-semibold text-slate-800">{s.sequence}. {s.name}</span>
                <Pill label={s.status} tone={piaTone(s.status)} />
              </div>
              <p className="mt-0.5 text-[10.5px] text-slate-600">{s.processedCount} · {s.pendingCount} pending</p>
              <div className="mt-1 flex flex-wrap gap-1 text-[9.5px] text-slate-500">
                <span className="rounded border border-slate-200 bg-slate-50 px-1">Success {s.successRate}%</span>
                <span className="rounded border border-slate-200 bg-slate-50 px-1">Avg {s.averageDuration}</span>
                <span className="rounded border border-slate-200 bg-slate-50 px-1">P95 {s.p95Duration}</span>
                <span className="rounded border border-slate-200 bg-slate-50 px-1">{s.slaStatus}</span>
              </div>
              <p className="mt-1 text-[9.5px] text-slate-500">Owner {s.owner} · {s.throughput} · {s.warningCount} warnings · {s.failedCount} failures</p>
            </button>
          </li>
        ))}
      </ol>
      <ul className="mt-2 space-y-1">
        {lifecycleCallouts.map((c) => (
          <li key={c.text} className="flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700">
            <Pill label={c.severity} tone={c.severity === "High" ? "red" : c.severity === "Warning" ? "amber" : "green"} />
            {c.text}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* --------------------------------------------------------- selected stage -- */

const stageTabs = ["Overview", "Queue", "Conditions", "Risks", "Controls", "Evidence", "Dependencies", "Outputs"] as const;

export function SelectedStagePanel({
  stage, rows, findings, onOpenEvaluation,
}: {
  stage: PersonaImpactStage;
  rows: PersonaImpactEvaluation[];
  findings: PersonaImpactFinding[];
  onOpenEvaluation: (id: string) => void;
}) {
  const [tab, setTab] = useState<(typeof stageTabs)[number]>("Overview");
  const risks = findings.filter((f) => f.riskIds.length > 0 || f.impactDimension === "Risk Impact");
  const controls = findings.filter((f) => f.controlIds.length > 0);

  return (
    <Panel id="panel-stage" title={`Selected Analysis Stage · ${stage.name}`}
      subtitle={`Owner ${stage.owner} · ${stage.slaStatus}`}
      actions={<Pill label={stage.status} tone={piaTone(stage.status)} />}>
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Status", stage.status], ["Personas Processing", stage.processedCount],
          ["Findings Today", `${findings.length}`], ["High Severity", `${findings.filter((f) => f.severity === "High" || f.severity === "Critical").length}`],
          ["Review Required", `${findings.filter((f) => f.reviewRequired).length}`],
          ["Average Duration", stage.averageDuration], ["P95 Duration", stage.p95Duration],
          ["Success Rate", `${stage.successRate}%`], ["SLA", stage.slaStatus], ["Owner", stage.owner],
        ].map(([k, v]) => (
          <div key={k} className="rounded border border-slate-200 bg-slate-50 p-1.5">
            <p className="text-[9.5px] uppercase tracking-wide text-slate-500">{k}</p>
            <p className="text-[12px] font-semibold text-slate-800">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-1" role="tablist" aria-label="Stage detail sections">
        {stageTabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded border px-2 py-0.5 text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {tab === "Overview" && (
          <p className="text-[11.5px] text-slate-600">
            {stage.name} evaluates each selected Team Persona against the governed proposal. Findings produced
            here are explainable and traceable to Persona sections, Business Conditions, and evidence records.
            This stage does not approve or reject the change.
          </p>
        )}
        {tab === "Queue" && (
          <SimpleTable head={["Evaluation ID", "Work Item", "Persona", "Current Stage", "Severity", "Confidence", "Status"]}
            rows={rows.map((r) => [
              <button key={r.id} type="button" className="text-blue-700 hover:underline" onClick={() => onOpenEvaluation(r.id)}>{r.id}</button>,
              r.title, `${r.selectedPersonaIds.length} Personas`, stageById(r.currentStageId).name,
              <Pill key="s" label={r.highestSeverity} tone={piaTone(r.highestSeverity)} />,
              pct(r.overallConfidence), <Pill key="st" label={r.status} tone={piaTone(r.status)} />,
            ])} />
        )}
        {tab === "Conditions" && (
          <SimpleTable head={["Condition", "Type", "Personas", "Authority", "Confidence"]}
            rows={impactConditions.map((c) => [c.statement, c.conditionType,
              c.personaIds.map((p) => personaById(p).name).join(", "), c.authority, pct(c.confidence)])} />
        )}
        {tab === "Risks" && (
          <SimpleTable head={["Persona", "Risk", "Trigger", "Likelihood", "Impact", "Evidence", "Mitigation", "Status"]}
            rows={risks.map((f) => [personaById(f.personaId).name, f.title, f.impactDimension,
              f.confidence >= 92 ? "Likely" : "Possible", f.severity,
              f.evidenceReferenceIds.join(", ") || "None", f.mitigationIds.join(", ") || "Recommended",
              <Pill key="s" label={f.reviewRequired ? "Review Required" : "Monitoring"} tone={f.reviewRequired ? "amber" : "green"} />])} />
        )}
        {tab === "Controls" && (
          <SimpleTable head={["Persona", "Control", "Required", "Current State", "Evidence", "Confidence", "Status"]}
            rows={controls.map((f) => [personaById(f.personaId).name, f.controlIds.join(", "), "Yes",
              f.direction === "Positive" ? "Effective" : "Requires validation",
              f.evidenceReferenceIds.join(", ") || "Missing", pct(f.confidence),
              <Pill key="s" label={f.evidenceReferenceIds.length ? "In Place" : "Required"} tone={f.evidenceReferenceIds.length ? "green" : "amber"} />])} />
        )}
        {tab === "Evidence" && (
          <SimpleTable head={["Finding", "Evidence Record", "Authority", "Confidence", "Freshness", "Status"]}
            rows={findings.slice(0, 10).map((f) => [f.title,
              f.evidenceReferenceIds.join(", ") || "None linked",
              f.evidenceReferenceIds.length ? "Primary" : "—", pct(f.confidence),
              f.evidenceReferenceIds.length ? "Current" : "Missing",
              <Pill key="s" label={f.evidenceReferenceIds.length ? "Provided" : "Missing"} tone={f.evidenceReferenceIds.length ? "green" : "red"} />])} />
        )}
        {tab === "Dependencies" && (
          <SimpleTable head={["Source", "Relationship", "Target", "Criticality", "Propagation", "Confidence"]}
            rows={dependencyPaths.map((d) => [d.sourceEntityId, d.relationshipPath.join(" → "), d.targetEntityId,
              <Pill key="c" label={d.criticality} tone={piaTone(d.criticality)} />, d.propagation, pct(d.confidence)])} />
        )}
        {tab === "Outputs" && (
          <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-5">
            {[["Impact Findings", findings.length], ["Risk Findings", risks.length],
              ["Control Requirements", controls.length], ["Review Tasks", findings.filter((f) => f.reviewRequired).length],
              ["Recommendation Records", recommendations.length]].map(([k, v]) => (
              <div key={String(k)} className="rounded border border-slate-200 bg-white p-2">
                <p className="text-[9.5px] uppercase tracking-wide text-slate-500">{k}</p>
                <p className="text-[16px] font-bold text-slate-900">{v}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}

export function SimpleTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  if (!rows.length) return <EmptyState title="Nothing to display" description="No records match the current selection." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
            {head.map((h) => <th key={h} scope="col" className="whitespace-nowrap px-1.5 py-1 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              {r.map((c, j) => <td key={j} className="px-1.5 py-1 align-top text-slate-700">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ queue -- */

export function EvaluationQueuePanel({
  rows, view, density, hiddenColumns, onToggleColumn, selected, onSelect,
  sortKey, sortDir, onSort, page, pageSize, onPage, loading, onOpen, onOpenWorkbench, actions,
}: {
  rows: PersonaImpactEvaluation[];
  view: PiaView;
  density: Density;
  hiddenColumns: string[];
  onToggleColumn: (key: string) => void;
  selected: Set<string>;
  onSelect: (s: Set<string>) => void;
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (k: string) => void;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  loading?: boolean;
  onOpen: (r: PersonaImpactEvaluation) => void;
  onOpenWorkbench: (r: PersonaImpactEvaluation) => void;
  actions?: React.ReactNode;
}) {
  const [showColumns, setShowColumns] = useState(false);
  const pad = density === "compact" ? "py-0.5" : density === "comfortable" ? "py-2" : "py-1";
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const cols = queueColumns.filter((c) => !hiddenColumns.includes(c));

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    onSelect(next);
  };

  return (
    <Panel id="panel-queue" title="Persona Impact Evaluation Queue"
      subtitle={`${rows.length} evaluation(s) in scope · ${view} view`}
      actions={
        <div className="flex flex-wrap items-end gap-1.5">
          {actions}
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setShowColumns((v) => !v)}>
            Columns {showColumns ? <ChevronUp className="ml-1 h-3 w-3" aria-hidden /> : <ChevronDown className="ml-1 h-3 w-3" aria-hidden />}
          </Button>
        </div>
      }>
      {showColumns && (
        <div className="mb-2 flex flex-wrap gap-1.5 rounded border border-slate-200 bg-slate-50 p-1.5">
          {queueColumns.map((c) => (
            <label key={c} className="flex items-center gap-1 text-[10.5px] text-slate-600">
              <input type="checkbox" checked={!hiddenColumns.includes(c)} onChange={() => onToggleColumn(c)} />
              {c}
            </label>
          ))}
        </div>
      )}

      {loading ? <PanelSkeleton rows={5} /> : pageRows.length === 0 ? (
        <EmptyState title="No evaluations match" description="Adjust filters or clear the search to see active impact evaluations." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
                <th scope="col" className="w-6 px-1.5 py-1"><span className="sr-only">Select</span></th>
                {cols.map((c) => (
                  <th key={c} scope="col" className="whitespace-nowrap px-1.5 py-1 font-medium">
                    <button type="button" onClick={() => onSort(c)} className="hover:text-blue-700">
                      {c}{sortKey === c ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id} className={cn("border-b border-slate-100 last:border-0 hover:bg-blue-50/40", selected.has(r.id) && "bg-blue-50/60")}>
                  <td className={cn("px-1.5", pad)}>
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleRow(r.id)}
                      aria-label={`Select ${r.id}`} />
                  </td>
                  {cols.map((c) => (
                    <td key={c} className={cn("px-1.5 align-top text-slate-700", pad)}>
                      {c === "Evaluation ID" && (
                        <button type="button" className="font-medium text-blue-700 hover:underline" onClick={() => onOpen(r)}>{r.id}</button>
                      )}
                      {c === "Work Item" && <span className="font-medium text-slate-800">{r.title}</span>}
                      {c === "Submitting Team" && r.submittingTeam}
                      {c === "Personas" && `${r.selectedPersonaIds.length} Personas`}
                      {c === "Primary Impact" && r.primaryImpact}
                      {c === "Highest Severity" && <Pill label={r.highestSeverity} tone={piaTone(r.highestSeverity)} />}
                      {c === "Overall Confidence" && pct(r.overallConfidence)}
                      {c === "Evidence Coverage" && pct(r.evidenceCoverage)}
                      {c === "Conflicts" && r.conflictCount}
                      {c === "Opportunities" && r.opportunityCount}
                      {c === "Current Stage" && stageById(r.currentStageId).name}
                      {c === "Owner" && r.owner}
                      {c === "Started" && r.startedAt}
                      {c === "Status" && <Pill label={r.status} tone={piaTone(r.status)} />}
                      {c === "Actions" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onOpen(r)}>Detail</Button>
                          <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenWorkbench(r)}>Workbench</Button>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
        <span>{selected.size} selected · page {page} of {totalPages}</span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</Button>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------- persona summary -- */

export function PersonaSummaryPanel({
  proposal, selectedPersonaId, onSelectPersona,
}: {
  proposal: ProposalState;
  selectedPersonaId: string;
  onSelectPersona: (id: string) => void;
}) {
  const scores = impactPersonas.map((p) => scorePersona(p.id, proposal));
  return (
    <Panel id="panel-persona-summary" title="Persona Impact Summary"
      subtitle="One change, multiple team perspectives, shared enterprise consequences">
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
        {scores.map((s) => {
          const persona = personaById(s.personaId);
          const meta = personaSummaryMeta[s.personaId];
          return (
            <button key={s.id} type="button" onClick={() => onSelectPersona(s.personaId)}
              className={cn("rounded-lg border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                selectedPersonaId === s.personaId ? "border-blue-400 bg-blue-50/60" : "border-slate-200 bg-white hover:border-blue-300")}>
              <div className="flex items-start justify-between gap-1.5">
                <span className="text-[12px] font-semibold text-slate-800">{persona.name}</span>
                <Pill label={s.classification} tone={s.score >= 70 ? "red" : s.score >= 60 ? "amber" : "blue"} />
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[22px] font-bold leading-none text-slate-900">{s.score}</span>
                <span className="text-[10px] text-slate-500">/ 100 impact magnitude · confidence {pct(s.confidence)}</span>
              </div>
              <Progress value={s.score} className="mt-1 h-1.5" />
              <dl className="mt-1.5 space-y-0.5 text-[10.5px]">
                <div className="flex justify-between gap-2"><dt className="text-slate-500">Top benefit</dt><dd className="text-right text-slate-700">{meta.topBenefit}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-slate-500">Top risk</dt><dd className="text-right text-slate-700">{meta.topRisk}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-slate-500">Required review</dt><dd className="text-right text-slate-700">{meta.requiredReview ? "Yes" : "No"}</dd></div>
              </dl>
              <p className="mt-1 text-[9.5px] text-slate-500">
                Persona {persona.version} · negative {s.negativeContribution} · positive {s.positiveContribution} · governance {s.governanceContribution}
              </p>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[10.5px] text-slate-500">
        Impact Score expresses the magnitude of meaningful change to that Persona. It is not a probability of
        failure, an approval score, a readiness score, or a business value score.
      </p>
    </Panel>
  );
}

/* -------------------------------------------------------------- conflicts -- */

export function ConflictPanel({
  proposal, onOpenConflict,
}: {
  proposal: ProposalState;
  onOpenConflict: (c: PersonaImpactConflict) => void;
}) {
  const rows = conflictsFor(proposal);
  return (
    <Panel id="panel-conflicts" title="Persona Perspective Conflicts"
      subtitle="Conflicts are surfaced for cross team coordination. Resolution happens in Cross Team Impact Matrix and Decision Intelligence.">
      <ul className="space-y-1.5">
        {rows.map((c) => (
          <li key={c.id} className="rounded border border-slate-200 bg-white p-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Pill label={c.severity} tone={piaTone(c.severity)} />
              <span className="text-[11.5px] font-semibold text-slate-800">
                {personaById(c.personaAId).name} versus {personaById(c.personaBId).name}
              </span>
              <Pill label={c.conflictType} tone="blue" />
              <Pill label={c.reviewStatus} tone={piaTone(c.reviewStatus)} />
              <Button size="sm" variant="outline" className="ml-auto h-6 text-[10px]" onClick={() => onOpenConflict(c)}>Open Summary</Button>
            </div>
            <div className="mt-1 grid gap-1 text-[11px] text-slate-600 md:grid-cols-2">
              <p><span className="font-medium text-slate-700">{personaById(c.personaAId).name}:</span> {c.personaAPosition}</p>
              <p><span className="font-medium text-slate-700">{personaById(c.personaBId).name}:</span> {c.personaBPosition}</p>
            </div>
            <p className="mt-1 text-[11px] text-slate-600">{c.description}</p>
            <p className="mt-1 text-[10.5px] text-slate-500">
              Conditions {c.conditionIds.join(", ") || "None"} · Evidence {c.evidenceReferenceIds.join(", ") || "None"} ·
              {" "}Potential resolution: {c.potentialResolution}
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function SharedImpactPanel() {
  return (
    <Panel id="panel-shared" title="Persona Agreement & Shared Impact"
      subtitle="Where the selected Team Personas already agree">
      <ul className="space-y-1">
        {sharedFindings.map((s) => (
          <li key={s.id} className="rounded border border-emerald-200 bg-emerald-50/60 px-2 py-1 text-[11.5px] text-slate-700">
            <span className="mr-1.5 rounded border border-emerald-200 bg-white px-1 text-[9.5px] uppercase tracking-wide text-emerald-700">{s.category}</span>
            {s.text}
            <span className="ml-1.5 text-[10px] text-slate-500">
              {s.personaIds.map((p) => personaById(p).name).join(", ")}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-2 grid gap-1.5 md:grid-cols-4">
        {[["Shared Objectives", sharedObjectives], ["Shared Risks", sharedRisks],
          ["Shared Controls", sharedControls], ["Shared Evidence Requirements", sharedEvidenceRequirements]].map(([label, items]) => (
          <div key={String(label)} className="rounded border border-slate-200 bg-white p-2">
            <p className="text-[9.5px] uppercase tracking-wide text-slate-500">{label}</p>
            <ul className="mt-0.5 space-y-0.5 text-[11px] text-slate-700">
              {(items as string[]).map((i) => <li key={i}>· {i}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ graph -- */

const nodeTone: Record<GraphNode["kind"], string> = {
  change: "border-blue-400 bg-blue-600 text-white",
  service: "border-slate-300 bg-white text-slate-800",
  persona: "border-indigo-300 bg-indigo-50 text-indigo-800",
  journey: "border-emerald-300 bg-emerald-50 text-emerald-800",
};

export function PropagationGraphPanel({ onOpenNode }: { onOpenNode: (n: GraphNode) => void }) {
  const [filter, setFilter] = useState("all");
  const [zoom, setZoom] = useState(1);
  const [activeEdge, setActiveEdge] = useState<string | null>(null);

  const nodes = useMemo(() => graphNodes.filter((n) =>
    filter === "personas" ? n.kind === "persona" || n.kind === "change"
      : filter === "services" ? n.kind === "service" || n.kind === "change"
        : filter === "customer" ? ["N1", "N2", "N12", "N5", "N3"].includes(n.id)
          : filter === "governance" ? ["N1", "N13", "N4", "N7"].includes(n.id)
            : filter === "dependency" ? ["N1", "N3", "N6", "N8", "N10", "N11"].includes(n.id)
              : filter === "critical" ? ["N1", "N3", "N6", "N10", "N13"].includes(n.id) : true), [filter]);
  const ids = new Set(nodes.map((n) => n.id));
  const edges = graphEdges.filter((e) => ids.has(e.from) && ids.has(e.to));
  const nodeById = (id: string) => graphNodes.find((n) => n.id === id)!;
  const edge = activeEdge ? graphEdges.find((e) => e.id === activeEdge) : null;

  return (
    <Panel id="panel-graph" title="Impact Propagation Graph"
      subtitle="How the proposed change propagates through systems, dependencies, customer journeys, and Team Personas"
      actions={
        <div className="flex flex-wrap gap-1">
          {graphFilters.map((f) => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)}
              className={cn("rounded border px-1.5 py-0.5 text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                filter === f.id ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
              {f.label}
            </button>
          ))}
          <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setZoom(1)}>Zoom to Fit</Button>
          <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => { setZoom(1); setFilter("all"); setActiveEdge(null); }}>Reset</Button>
          <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}>Zoom In</Button>
        </div>
      }>
      <div className="relative h-[440px] w-full overflow-hidden rounded border border-slate-200 bg-slate-50">
        <div className="absolute inset-0 origin-top-left" style={{ transform: `scale(${zoom})` }}>
          <svg className="absolute inset-0 h-full w-full" role="img" aria-label="Impact propagation relationships">
            {edges.map((e) => {
              const a = nodeById(e.from); const b = nodeById(e.to);
              const stroke = e.kind === "governance" ? "#c026d3" : e.kind === "customer" ? "#059669" : e.kind === "ownership" ? "#6366f1" : "#64748b";
              return (
                <g key={e.id}>
                  <line x1={`${a.x}%`} y1={`${a.y + 3}%`} x2={`${b.x}%`} y2={`${b.y + 3}%`}
                    stroke={stroke} strokeWidth={activeEdge === e.id ? 2.4 : 1.2} strokeDasharray={e.kind === "governance" ? "4 3" : undefined} />
                  <text x={`${(a.x + b.x) / 2}%`} y={`${(a.y + b.y) / 2 + 2}%`} textAnchor="middle"
                    className="cursor-pointer fill-slate-500 text-[8px]" onClick={() => setActiveEdge(e.id)}>
                    {e.label}
                  </text>
                </g>
              );
            })}
          </svg>
          {nodes.map((n) => (
            <button key={n.id} type="button" onClick={() => onOpenNode(n)}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              className={cn("absolute -translate-x-1/2 rounded-md border px-2 py-1 text-[10.5px] font-medium shadow-sm transition hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                nodeTone[n.kind])}>
              {n.label}
            </button>
          ))}
        </div>
      </div>
      {edge && (
        <div className="mt-1.5 rounded border border-slate-200 bg-white p-2 text-[11px] text-slate-700">
          <span className="font-medium">{nodeById(edge.from).label}</span> {edge.label}{" "}
          <span className="font-medium">{nodeById(edge.to).label}</span>
          <span className="ml-1.5 text-slate-500">
            Supported by {dependencyPaths.filter((d) => d.sourceEntityId === nodeById(edge.from).label).map((d) => d.id).join(", ") || "relationship registry"}
          </span>
        </div>
      )}
      <SimpleTable head={["Path", "Source", "Relationship", "Target", "Criticality", "Propagation", "Affected Personas", "Confidence"]}
        rows={dependencyPaths.map((d) => [d.id, d.sourceEntityId, d.relationshipPath.join(" → "), d.targetEntityId,
          <Pill key="c" label={d.criticality} tone={piaTone(d.criticality)} />, d.propagation,
          d.affectedPersonaIds.map((p) => personaById(p).name).join(", "), pct(d.confidence)])} />
    </Panel>
  );
}

/* ------------------------------------------------------------- conditions -- */

export function ConditionsPanel({
  activeConditionId, onSelect,
}: {
  activeConditionId: string | null;
  onSelect: (c: ImpactCondition) => void;
}) {
  const [type, setType] = useState("All");
  const rows = impactConditions.filter((c) => type === "All" || c.conditionType === type);
  const types = ["All", ...Array.from(new Set(impactConditions.map((c) => c.conditionType)))];
  return (
    <Panel id="panel-conditions" title="Applicable Business Conditions"
      subtitle="Approved conditions that make this proposal relevant to each Team Persona"
      actions={
        <label className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500">
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="h-7 rounded border border-slate-200 bg-white px-1.5 text-[11px] text-slate-700">
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      }>
      <SimpleTable head={["Condition", "Type", "Applicable Personas", "Why Relevant", "Authority", "Confidence", "Freshness", "Impact Dimension", "Status"]}
        rows={rows.map((c) => [
          <button key={c.id} type="button" onClick={() => onSelect(c)}
            className={cn("text-left hover:underline", activeConditionId === c.id ? "font-semibold text-blue-700" : "text-blue-700")}>
            {c.id} · {c.statement}
          </button>,
          c.conditionType, c.personaIds.map((p) => personaById(p).name).join(", "), c.whyRelevant,
          c.authority, pct(c.confidence), c.freshness, c.impactDimension,
          <Pill key="s" label={c.status} tone={piaTone(c.status)} />,
        ])} />
    </Panel>
  );
}

/* --------------------------------------------------------------- evidence -- */

export function EvidenceSufficiencyPanel({
  proposal, onOpenEvidence,
}: {
  proposal: ProposalState;
  onOpenEvidence: (e: ImpactEvidence) => void;
}) {
  const rows = impactEvidence.map((e) => ({
    ...e,
    status: e.id === "EVD 7706" ? (proposal.fraudLossEvidence ? "Provided" : "Missing")
      : e.id === "EVD 7707" ? (proposal.dependencyStressEvidence ? "Provided" : "Missing")
        : e.id === "EVD 7704" ? (proposal.idempotencyEvidence ? "Provided" : "Missing")
          : e.status,
  } as ImpactEvidence));
  const provided = rows.filter((r) => r.status === "Provided");
  const coverage = Math.round((provided.length / rows.length) * 100);
  return (
    <Panel id="panel-evidence" title="Impact Evidence Sufficiency"
      subtitle="Evidence supporting each impact conclusion, and the evidence still required"
      actions={<Pill label={`${coverage}% coverage`} tone={coverage >= 90 ? "green" : coverage >= 80 ? "amber" : "red"} />}>
      <Progress value={coverage} className="h-1.5" />
      <SimpleTable head={["Evidence", "Applicable Personas", "Impact Dimensions", "Authority", "Freshness", "Quality", "Required", "Status"]}
        rows={rows.map((e) => [
          <button key={e.id} type="button" className="text-left text-blue-700 hover:underline" onClick={() => onOpenEvidence(e)}>{e.id} · {e.name}</button>,
          e.personaIds.map((p) => personaById(p).name).join(", "),
          e.dimensions.join(", "), e.authority, e.status === "Missing" ? "Missing" : e.freshness,
          e.status === "Missing" ? "—" : e.quality, e.required ? "Yes" : "No",
          <Pill key="s" label={e.status} tone={e.status === "Provided" ? "green" : "red"} />,
        ])} />
      <p className="mt-1.5 text-[10.5px] text-slate-500">
        Evidence request and remediation workflows arrive with the next release of this page.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------- quality -- */

export function ImpactQualityPanel() {
  return (
    <Panel id="panel-quality" title="Impact Analysis Quality"
      subtitle={`Overall ${overallQualityLabel()} · quality reflects coverage and traceability, not decision certainty`}>
      <SimpleTable head={["Dimension", "Current", "Target", "Variance", "Trend", "Affected Evaluations", "Status"]}
        rows={qualityDimensions.map((d) => [
          d.name, `${d.current}`, `${d.target}`, `${d.current - d.target > 0 ? "+" : ""}${d.current - d.target}`,
          d.trend, d.affected,
          <Pill key="s" label={d.current >= d.target ? "On target" : "Below target"} tone={d.current >= d.target ? "green" : "amber"} />,
        ])} />
    </Panel>
  );
}

const overallQualityLabel = () => `${93} / 100`;

/* ----------------------------------------------------------- result panel -- */

export function ResultPackagePanel({
  proposal, onSendToMatrix, onSendToDecision,
}: {
  proposal: ProposalState;
  onSendToMatrix: () => void;
  onSendToDecision: () => void;
}) {
  const r = resultSummary(proposal);
  return (
    <Panel id="panel-results" title="Persona Impact Results"
      subtitle="Structured impact results prepared for cross team coordination and decision intelligence"
      actions={
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onSendToMatrix}>Cross Team Impact Matrix</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onSendToDecision}>Decision Intelligence</Button>
        </div>
      }>
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Personas Evaluated", r.personaCount], ["Conditions Applied", r.conditionCount],
          ["Dependency Paths", r.dependencyPathCount], ["Material Findings", r.materialFindingCount],
          ["Cross Persona Conflicts", r.conflictCount], ["Positive Opportunities", r.opportunityCount],
          ["Required Mitigations", r.mitigationCount], ["Missing Evidence Items", r.missingEvidence.length],
        ].map(([k, v]) => (
          <div key={String(k)} className="rounded border border-slate-200 bg-white p-2">
            <p className="text-[9.5px] uppercase tracking-wide text-slate-500">{k}</p>
            <p className="text-[18px] font-bold text-slate-900">{v}</p>
          </div>
        ))}
      </div>
      <dl className="mt-2 grid gap-x-4 md:grid-cols-2">
        <Row label="Selected Evaluation" value="Checkout Retry Policy Update" />
        <Row label="Overall Analysis Confidence" value={pct(r.confidence)} />
        <Row label="Highest Persona Impact" value={`${r.highestPersona}, ${r.highestScore}`} />
        <Row label="Highest Governance Impact" value={`Release Governance, ${r.governanceScore}`} />
        <Row label="Evidence Coverage" value={pct(r.coverage)} />
        <Row label="Missing Evidence" value={r.missingEvidence.join(", ") || "None"} />
      </dl>
      <p className="mt-2 rounded border border-blue-200 bg-blue-50 p-2 text-[11.5px] text-slate-700">
        <span className="font-semibold">Primary recommendation. </span>
        Proceed only through controlled, evidence backed, segmented rollout with required cross team review before
        broader traffic exposure. This page does not issue the final enterprise decision.
      </p>
    </Panel>
  );
}

/* --------------------------------------------------------------- activity -- */

export function AnalysisActivityPanel({ onOpen }: { onOpen: (evaluationId: string) => void }) {
  return (
    <Panel id="panel-activity" title="Recent Analysis Activity"
      subtitle="Governed audit trail of impact analysis events">
      <SimpleTable head={["Time", "Evaluation", "Persona", "Action", "Description", "Result", "Owner", "Audit"]}
        rows={activityRows.map((a) => [a.timestamp,
          <button key={a.id} type="button" className="text-blue-700 hover:underline" onClick={() => onOpen(a.evaluationId)}>{a.evaluationId}</button>,
          personaById(a.personaId).name, a.action, a.description,
          <Pill key="r" label={a.result} tone={piaTone(a.result)} />, a.owner, a.auditId])} />
    </Panel>
  );
}

/* ---------------------------------------------------------- opportunities -- */

export function OpportunityPanel() {
  return (
    <Panel id="panel-opportunities" title="Identified Opportunities"
      subtitle="Positive impact findings surfaced across Team Personas">
      <ul className="space-y-1.5">
        {opportunities.map((o) => (
          <li key={o.id} className="rounded border border-emerald-200 bg-white p-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Pill label={o.benefitType} tone="green" />
              <span className="text-[11.5px] font-semibold text-slate-800">{o.title}</span>
              <span className="text-[10px] text-slate-500">confidence {pct(o.confidence)}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600">{o.description}</p>
            <p className="mt-0.5 text-[10.5px] text-slate-500">
              {o.personaIds.map((p) => personaById(p).name).join(", ")} · Conditions {o.conditionIds.join(", ") || "None"} ·
              {" "}Evidence {o.evidenceReferenceIds.join(", ") || "None"}
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* --------------------------------------------------------------- tooltip -- */

export function InfoTip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="max-w-[280px] text-[11px]">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
