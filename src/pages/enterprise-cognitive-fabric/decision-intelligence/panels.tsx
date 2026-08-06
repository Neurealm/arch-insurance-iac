/** Decision Intelligence — operational panels built on existing ECF primitives. */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Pill, Row, type Tone } from "../persona-studio/primitives";
import { Panel, EmptyState, type Density } from "../cognitive-memory/panels";
import {
  alternativesFor, comparisonRows, constraintsFor, diKpis, diPersonas, diTone, evidenceFor,
  lifecycleCallouts, lifecycleStages, magnitudeTone, outcomesFor, positionTone, positionsFor,
  priorDecisions, qualityDimensions, qualityOverall, recommendationBenefits, recommendationCosts,
  recommendationCounterarguments, recommendationFactors, requiredApprovals, requiredReviewers,
  risksFor, sharedDependencies, strengthenTriggers, tradeoffsFor, weakenTriggers, openIssues,
  openQuestions,
  type ComparisonRow, type DecisionAlternative, type DecisionConstraint, type DerivedDecisionState,
  type DecisionIntelligenceActivity, type DecisionIntelligenceEvaluation, type DecisionIntelligenceStage,
  type DiEvidence, type DiKpi, type DecisionTradeoff, type PriorDecision,
} from "./data";

export type { Density };

const pad = (d: Density) => (d === "compact" ? "py-0.5" : d === "comfortable" ? "py-2" : "py-1.5");

/* -------------------------------------------------------------------- KPI -- */

export function DiKpiCard({ kpi, onClick, focused }: { kpi: DiKpi; onClick: () => void; focused?: boolean }) {
  const tone = kpi.status === "Healthy" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : kpi.status === "Attention" ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-red-200 bg-red-50 text-red-700";
  const last = kpi.trend[kpi.trend.length - 1];
  const prev = kpi.trend[kpi.trend.length - 2] ?? last;
  const max = Math.max(...kpi.trend);
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={onClick}
            className={cn("w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-blue-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              focused && "ring-2 ring-blue-500 ring-offset-2")}>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-500">{kpi.name}</span>
              <span className={cn("rounded border px-1.5 py-0.5 text-[9.5px] font-semibold", tone)}>{kpi.status}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[20px] font-bold leading-none text-slate-900">{kpi.value}</span>
              {kpi.change && <span className="text-[10.5px] font-medium text-slate-500">{kpi.change}</span>}
            </div>
            <p className="mt-1 text-[10.5px] text-slate-500">{kpi.context}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {kpi.supporting.map((s) => (
                <span key={s.label} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] text-slate-600">
                  {s.label} {s.value}
                </span>
              ))}
            </div>
            <div className="mt-2 flex h-6 items-end gap-0.5" aria-hidden>
              {kpi.trend.map((t, i) => (
                <span key={i} className={cn("flex-1 rounded-sm", last >= prev ? "bg-blue-200" : "bg-amber-200")}
                  style={{ height: `${Math.max(12, (t / max) * 100)}%` }} />
              ))}
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-[11px]">{kpi.tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function KpiRow({ focus, onFocus }: { focus: string | null; onFocus: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-6">
      {diKpis.map((k) => <DiKpiCard key={k.id} kpi={k} focused={focus === k.id} onClick={() => onFocus(k.id)} />)}
    </div>
  );
}

/* -------------------------------------------------------------- lifecycle -- */

export function LifecyclePanel({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <Panel id="panel-lifecycle" title="Decision Intelligence Lifecycle"
      subtitle="Fourteen governed stages from cross team context to prepared decision context">
      <ol className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-7">
        {lifecycleStages.map((s) => (
          <li key={s.id}>
            <button type="button" onClick={() => onSelect(s.id)} aria-pressed={selected === s.id}
              className={cn("h-full w-full rounded-lg border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                selected === s.id ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300")}>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9.5px] font-semibold text-slate-400">{s.sequence}</span>
                <Pill label={s.status} tone={diTone(s.status) as Tone} />
              </div>
              <p className="mt-0.5 text-[11px] font-semibold leading-tight text-slate-800">{s.name}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">{s.detail}</p>
              <p className="mt-1 text-[9.5px] text-slate-400">{s.successRate}% · {s.averageDuration} avg · P95 {s.p95Duration}</p>
            </button>
          </li>
        ))}
      </ol>
      <ul className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-2">
        {lifecycleCallouts.map((c) => (
          <li key={c} className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10.5px] text-amber-800">{c}</li>
        ))}
      </ul>
    </Panel>
  );
}

/* --------------------------------------------------------- selected stage -- */

const stageTabs = ["Overview", "Queue", "Alternatives", "Tradeoffs", "Risks", "Evidence", "Conditions", "Outputs"] as const;

export function SelectedStagePanel({
  stage, evaluation, derived, density, onOpenEvidence, onOpenAlternative,
}: {
  stage: DecisionIntelligenceStage;
  evaluation: DecisionIntelligenceEvaluation;
  derived: DerivedDecisionState;
  density: Density;
  onOpenEvidence: (e: DiEvidence) => void;
  onOpenAlternative: (a: DecisionAlternative) => void;
}) {
  const [tab, setTab] = useState<(typeof stageTabs)[number]>("Overview");
  const alts = alternativesFor(evaluation.id);
  const tro = tradeoffsFor(evaluation.id);
  const risks = risksFor(evaluation.id);
  const evid = evidenceFor(evaluation.id);
  const cons = constraintsFor(evaluation.id);

  return (
    <Panel id="panel-stage" title={`Selected Decision Stage · ${stage.name}`}
      subtitle={`${stage.owner} · ${stage.slaStatus}`}
      actions={<Pill label={stage.status} tone={diTone(stage.status) as Tone} />}>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
        {[
          ["Decisions Processing", String(stage.processedCount)],
          ["Alternatives Compared", String(alts.length)],
          ["Material Tradeoffs", String(tro.length)],
          ["Review Required", String(stage.warningCount)],
          ["Evidence Gaps", String(evid.filter((e) => e.status === "Missing").length)],
          ["Confidence", `${derived.confidence}%`],
        ].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="text-[9.5px] uppercase tracking-wide text-slate-500">{l}</p>
            <p className="text-[15px] font-bold text-slate-900">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-1 border-b border-slate-200" role="tablist" aria-label="Stage detail tabs">
        {stageTabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded-t px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "border-b-2 border-blue-600 font-semibold text-blue-700" : "text-slate-500 hover:text-slate-700")}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-2 overflow-x-auto">
        {tab === "Overview" && (
          <dl className="grid grid-cols-1 gap-x-6 md:grid-cols-3">
            <Row label="Status" value={<Pill label={stage.status} tone={diTone(stage.status) as Tone} />} />
            <Row label="Average Duration" value={stage.averageDuration} />
            <Row label="P95 Duration" value={stage.p95Duration} />
            <Row label="Throughput" value={stage.throughput} />
            <Row label="Success Rate" value={`${stage.successRate}%`} />
            <Row label="Pending" value={String(stage.pendingCount)} />
            <Row label="Warnings" value={String(stage.warningCount)} />
            <Row label="Failures" value={String(stage.failedCount)} />
            <Row label="SLA" value={stage.slaStatus} />
            <Row label="Owner" value={stage.owner} />
          </dl>
        )}

        {tab === "Queue" && (
          <p className="text-[11.5px] text-slate-600">
            {stage.processedCount} decisions processed at this stage, {stage.pendingCount} pending. Use the Decision Intelligence Queue below for full row level control.
          </p>
        )}

        {tab === "Alternatives" && (
          <table className="w-full text-left text-[11px]">
            <thead className="text-[10px] uppercase tracking-wide text-slate-500">
              <tr><th className="py-1">Alternative</th><th>Strategic Intent</th><th>Reversibility</th><th>Residual Risk</th><th>Confidence</th><th>Status</th></tr>
            </thead>
            <tbody>
              {alts.map((a) => (
                <tr key={a.id} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50" onClick={() => onOpenAlternative(a)}>
                  <td className={cn("font-medium text-slate-800", pad(density))}>{a.code} · {a.name}</td>
                  <td className="text-slate-600">{a.strategicIntent}</td>
                  <td><Pill label={a.reversibility} tone={magnitudeTone(a.reversibility) as Tone} /></td>
                  <td><Pill label={a.residualRisk} tone={magnitudeTone(a.residualRisk) as Tone} /></td>
                  <td>{a.confidence}%</td>
                  <td><Pill label={a.status} tone={diTone(a.status) as Tone} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "Tradeoffs" && (
          <table className="w-full text-left text-[11px]">
            <thead className="text-[10px] uppercase tracking-wide text-slate-500">
              <tr><th className="py-1">Decision</th><th>Alternative A</th><th>Alternative B</th><th>Dimension</th><th>Benefit</th><th>Cost</th><th>Affected Personas</th><th>Confidence</th><th>Status</th></tr>
            </thead>
            <tbody>
              {tro.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className={cn("text-slate-700", pad(density))}>{t.evaluationId}</td>
                  <td>{t.alternativeIds[0]?.replace("ALT 5001 ", "Option ")}</td>
                  <td>{t.alternativeIds[1]?.replace("ALT 5001 ", "Option ") ?? "—"}</td>
                  <td>{t.tradeoffType}</td>
                  <td className="text-slate-600">{t.benefit}</td>
                  <td className="text-slate-600">{t.cost}</td>
                  <td>{t.affectedPersonaIds.length}</td>
                  <td>{t.confidence}%</td>
                  <td><Pill label={t.status} tone="blue" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "Risks" && (
          <table className="w-full text-left text-[11px]">
            <thead className="text-[10px] uppercase tracking-wide text-slate-500">
              <tr><th className="py-1">Alternative</th><th>Risk</th><th>Severity</th><th>Residual</th><th>Mitigation</th><th>Evidence</th><th>Status</th></tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className={cn("text-slate-700", pad(density))}>{r.alternativeId.replace("ALT 5001 ", "Option ")}</td>
                  <td className="font-medium text-slate-800">{r.risk}</td>
                  <td><Pill label={r.rawSeverity} tone={magnitudeTone(r.rawSeverity) as Tone} /></td>
                  <td><Pill label={r.residualSeverity} tone={magnitudeTone(r.residualSeverity) as Tone} /></td>
                  <td className="text-slate-600">{r.control}</td>
                  <td className="text-slate-500">{r.evidenceReferenceIds.join(", ")}</td>
                  <td><Pill label={r.status} tone={diTone(r.status) as Tone} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "Evidence" && (
          <table className="w-full text-left text-[11px]">
            <thead className="text-[10px] uppercase tracking-wide text-slate-500">
              <tr><th className="py-1">Decision</th><th>Evidence</th><th>Type</th><th>Authority</th><th>Freshness</th><th>Applicable Alternatives</th><th>Confidence</th><th>Status</th></tr>
            </thead>
            <tbody>
              {evid.map((e) => (
                <tr key={e.id} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50" onClick={() => onOpenEvidence(e)}>
                  <td className={cn("text-slate-700", pad(density))}>{e.evaluationId}</td>
                  <td className="font-medium text-slate-800">{e.name}</td>
                  <td>{e.evidenceType}</td>
                  <td>{e.authority}</td>
                  <td>{e.freshness}</td>
                  <td>{e.alternativesAffected.map((a) => a.replace("ALT 5001 ", "")).join(", ")}</td>
                  <td>{e.confidence}%</td>
                  <td><Pill label={e.status} tone={diTone(e.status) as Tone} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "Conditions" && (
          <ul className="grid grid-cols-1 gap-1 md:grid-cols-2">
            {cons.map((c) => (
              <li key={c.id} className="rounded border border-slate-200 px-2 py-1 text-[11px]">
                <span className="font-medium text-slate-800">{c.title}</span>
                <span className="ml-2"><Pill label={c.kind} tone={c.kind === "Constraint" ? "red" : c.kind === "Assumption" ? "amber" : "slate"} /></span>
              </li>
            ))}
          </ul>
        )}

        {tab === "Outputs" && (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
            {[
              ["Recommendation Records", "8"], ["Alternative Profiles", "34"], ["Tradeoff Records", "28"],
              ["Decision Conditions", "46"], ["Required Reviews", "11"], ["Decision Context Packages", "8"],
            ].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <p className="text-[9.5px] uppercase tracking-wide text-slate-500">{l}</p>
                <p className="text-[15px] font-bold text-slate-900">{v}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------------- the queue -- */

export const queueColumns = [
  "Decision ID", "Decision Question", "Work Item", "Submitting Team", "Alternatives",
  "Recommended Posture", "Highest Risk", "Material Conflicts", "Evidence Coverage",
  "Confidence", "Current Stage", "Decision Owner", "Due", "Status", "Actions",
];

export function DecisionQueuePanel({
  rows, total, page, pageSize, onPage, density, hiddenColumns, onOpen, sortKey, sortDir, onSort, selected, onToggleRow, actions,
}: {
  rows: DecisionIntelligenceEvaluation[];
  total: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  density: Density;
  hiddenColumns: string[];
  onOpen: (e: DecisionIntelligenceEvaluation) => void;
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (k: string) => void;
  selected: Set<string>;
  onToggleRow: (id: string) => void;
  actions?: React.ReactNode;
}) {
  const visible = queueColumns.filter((c) => !hiddenColumns.includes(c));
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <Panel id="panel-queue" title="Decision Intelligence Queue"
      subtitle={`${total} decision evaluations · ${selected.size} selected`} actions={actions}>
      {rows.length === 0 ? (
        <EmptyState message="No decisions match the current filters" hint="Clear filters or widen the time range." />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] text-left text-[11px]">
              <thead className="text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-6 py-1" scope="col"><span className="sr-only">Select</span></th>
                  {visible.map((c) => (
                    <th key={c} scope="col" className={cn("py-1", ["Confidence", "Evidence Coverage", "Material Conflicts"].includes(c) && "cursor-pointer")}
                      onClick={() => ["Confidence", "Evidence Coverage", "Material Conflicts", "Decision ID"].includes(c) && onSort(c)}>
                      {c}{sortKey === c ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} tabIndex={0} onClick={() => onOpen(e)}
                    onKeyDown={(ev) => { if (ev.key === "Enter") onOpen(e); }}
                    className="cursor-pointer border-t border-slate-100 hover:bg-blue-50/40 focus:bg-blue-50 focus:outline-none">
                    <td className={pad(density)} onClick={(ev) => ev.stopPropagation()}>
                      <input type="checkbox" aria-label={`Select ${e.id}`} checked={selected.has(e.id)} onChange={() => onToggleRow(e.id)} />
                    </td>
                    {visible.map((c) => (
                      <td key={c} className={cn(pad(density), "pr-2 align-top")}>
                        {c === "Decision ID" && <span className="font-semibold text-slate-800">{e.id}</span>}
                        {c === "Decision Question" && <span className="block max-w-[380px] text-slate-700">{e.decisionQuestion}</span>}
                        {c === "Work Item" && e.workItem}
                        {c === "Submitting Team" && e.submittingTeam}
                        {c === "Alternatives" && `${e.alternativeIds.length} Alternatives`}
                        {c === "Recommended Posture" && <Pill label={e.recommendationPosture} tone={diTone(e.recommendationPosture) as Tone} />}
                        {c === "Highest Risk" && <span className="text-slate-700">{e.highestRisk}</span>}
                        {c === "Material Conflicts" && e.materialConflictCount}
                        {c === "Evidence Coverage" && `${e.evidenceCoverage}%`}
                        {c === "Confidence" && `${e.recommendationConfidence}%`}
                        {c === "Current Stage" && lifecycleStages.find((s) => s.id === e.currentStageId)?.name}
                        {c === "Decision Owner" && e.decisionOwner}
                        {c === "Due" && e.decisionDeadline}
                        {c === "Status" && <Pill label={e.status} tone={diTone(e.status) as Tone} />}
                        {c === "Actions" && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px]"
                            onClick={(ev) => { ev.stopPropagation(); onOpen(e); }}>Open</Button>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Page {page} of {pages}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-6 text-[10px]" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px]" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------ comparison matrix -- */

export type ComparisonLens = "all" | "differences" | "material" | "customer" | "risk" | "governance" | "persona";

const dirGlyph = { positive: "▲", neutral: "■", negative: "▼" } as const;
const dirTone = { positive: "green", neutral: "slate", negative: "red" } as const;

export function AlternativeComparisonPanel({
  evaluationId, lens, onLens, onCell, selectedAlternatives,
}: {
  evaluationId: string;
  lens: ComparisonLens;
  onLens: (l: ComparisonLens) => void;
  onCell: (row: ComparisonRow, altId: string) => void;
  selectedAlternatives: string[];
}) {
  const alts = alternativesFor(evaluationId);
  const rows = useMemo(() => comparisonRows.filter((r) => {
    if (lens === "all") return true;
    if (lens === "differences") {
      const set = new Set(Object.values(r.values).map((v) => v.direction + v.magnitude));
      return set.size > 1;
    }
    if (lens === "material") return Object.values(r.values).some((v) => v.direction === "negative");
    return r.lens.includes(lens as never);
  }), [lens]);

  const lenses: { id: ComparisonLens; label: string }[] = [
    { id: "all", label: "Show All" }, { id: "differences", label: "Differences Only" },
    { id: "material", label: "Material Differences" }, { id: "customer", label: "Customer View" },
    { id: "risk", label: "Risk View" }, { id: "governance", label: "Governance View" },
    { id: "persona", label: "Persona View" },
  ];

  return (
    <Panel id="panel-comparison" title="Decision Alternative Comparison"
      subtitle="Every cell carries direction, magnitude, confidence, and supporting context"
      actions={
        <div className="flex flex-wrap gap-1">
          {lenses.map((l) => (
            <button key={l.id} type="button" onClick={() => onLens(l.id)}
              className={cn("rounded border px-1.5 py-0.5 text-[10px]", lens === l.id ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
              {l.label}
            </button>
          ))}
        </div>
      }>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-[11px]">
          <thead className="text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-1">Dimension</th>
              {alts.map((a) => (
                <th key={a.id} className={cn("py-1", selectedAlternatives.includes(a.id) && "bg-blue-50 text-blue-700")}>
                  {a.code} · {a.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.dimension} className="border-t border-slate-100">
                <th scope="row" className="py-1 pr-2 text-left text-[11px] font-medium text-slate-700">{r.dimension}</th>
                {alts.map((a) => {
                  const v = r.values[a.id];
                  return (
                    <td key={a.id} className={cn("py-1 pr-2", selectedAlternatives.includes(a.id) && "bg-blue-50/60")}>
                      <button type="button" onClick={() => onCell(r, a.id)}
                        className="w-full rounded px-1 py-0.5 text-left hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                        <span className="flex items-center gap-1">
                          <Pill label={`${dirGlyph[v.direction]} ${v.magnitude}`} tone={dirTone[v.direction] as Tone} />
                          <span className="text-[9.5px] text-slate-400">{v.confidence}%</span>
                        </span>
                        <span className="block text-[10px] text-slate-500">{v.context}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------- persona positions -- */

export function PersonaPositionsPanel({
  evaluationId, selectedPersona, onSelectPersona, selectedAlternatives,
}: {
  evaluationId: string;
  selectedPersona: string | null;
  onSelectPersona: (id: string) => void;
  selectedAlternatives: string[];
}) {
  const alts = alternativesFor(evaluationId);
  const positions = positionsFor(evaluationId);
  return (
    <Panel id="panel-positions" title="Team Persona Decision Positions"
      subtitle="Positions are preserved, never averaged into a single enterprise opinion">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-[11px]">
          <thead className="text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-1">Team Persona</th>
              {alts.map((a) => <th key={a.id} className={cn("py-1", selectedAlternatives.includes(a.id) && "bg-blue-50 text-blue-700")}>{a.code}</th>)}
              <th>Top Priority</th><th>Primary Concern</th><th>Required Condition</th><th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.id} onClick={() => onSelectPersona(p.personaId)}
                className={cn("cursor-pointer border-t border-slate-100 hover:bg-slate-50", selectedPersona === p.personaId && "bg-blue-50/60")}>
                <th scope="row" className="py-1 pr-2 text-left font-medium text-slate-800">{p.persona}</th>
                {alts.map((a) => (
                  <td key={a.id} className={cn("py-1 pr-2", selectedAlternatives.includes(a.id) && "bg-blue-50/40")}>
                    <Pill label={p.positions[a.id]} tone={positionTone(p.positions[a.id]) as Tone} />
                  </td>
                ))}
                <td className="text-slate-600">{p.topPriority}</td>
                <td className="text-slate-600">{p.primaryConcern}</td>
                <td className="text-slate-600">{p.requiredCondition}</td>
                <td>{p.confidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------- tradeoffs */

export function TradeoffPanel({ evaluationId, onSelect, selectedId }: {
  evaluationId: string; onSelect: (t: DecisionTradeoff) => void; selectedId: string | null;
}) {
  return (
    <Panel id="panel-tradeoffs" title="Decision Tradeoff Analysis"
      subtitle="Make the tradeoffs visible before the decision becomes someone else's consequence">
      <ul className="grid grid-cols-1 gap-2 xl:grid-cols-2">
        {tradeoffsFor(evaluationId).map((t) => (
          <li key={t.id}>
            <button type="button" onClick={() => onSelect(t)}
              className={cn("w-full rounded-lg border p-2 text-left transition hover:border-blue-300",
                selectedId === t.id ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white")}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-slate-800">{t.title}</span>
                <Pill label={t.tradeoffType} tone="blue" />
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">{t.description}</p>
              <div className="mt-1 grid grid-cols-1 gap-1 md:grid-cols-2">
                <p className="rounded bg-emerald-50 px-1.5 py-1 text-[10.5px] text-emerald-800">Benefit · {t.benefit}</p>
                <p className="rounded bg-red-50 px-1.5 py-1 text-[10.5px] text-red-800">Cost · {t.cost}</p>
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                Alternatives {t.alternativeIds.map((a) => a.replace("ALT 5001 ", "")).join(", ")} ·
                Personas {t.affectedPersonaIds.length} · Evidence {t.evidenceReferenceIds.join(", ") || "None"} · Confidence {t.confidence}%
              </p>
              <p className="mt-1 text-[10px] text-slate-600">Potential condition · {t.potentialCondition}</p>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------------------------------------------- constraints -- */

export function ConstraintPanel({ evaluationId, derived, onSelect }: {
  evaluationId: string; derived: DerivedDecisionState; onSelect: (c: DecisionConstraint) => void;
}) {
  const cons = constraintsFor(evaluationId);
  return (
    <Panel id="panel-constraints" title="Nonnegotiable Conditions & Constraints"
      subtitle="Constraints, preferences, recommendations, and assumptions are kept distinguishable">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-[11px]">
          <thead className="text-[10px] uppercase tracking-wide text-slate-500">
            <tr><th className="py-1">Constraint</th><th>Kind</th><th>Type</th><th>Authority</th><th>Affected Alternatives</th><th>Affected Personas</th><th>Evidence</th><th>Confidence</th><th>Status</th></tr>
          </thead>
          <tbody>
            {cons.map((c) => {
              const active = (c.id === "DCN 5" && derived.jointApprovalRequired) || (c.id === "DCN 6" && derived.governanceRestricted);
              return (
                <tr key={c.id} onClick={() => onSelect(c)}
                  className={cn("cursor-pointer border-t border-slate-100 hover:bg-slate-50", active && "bg-amber-50")}>
                  <td className="py-1 pr-2 font-medium text-slate-800">
                    {c.title}{active && <span className="ml-1 rounded bg-amber-200 px-1 text-[9px] font-semibold text-amber-900">ACTIVATED</span>}
                  </td>
                  <td><Pill label={c.kind} tone={c.kind === "Constraint" ? "red" : c.kind === "Assumption" ? "amber" : "slate"} /></td>
                  <td className="text-slate-600">{c.constraintType}</td>
                  <td className="text-slate-600">{c.authority}</td>
                  <td>{c.affectedAlternativeIds.map((a) => a.replace("ALT 5001 ", "")).join(", ")}</td>
                  <td>{c.affectedPersonaIds.map((p) => diPersonas.find((d) => d.id === p)?.name.split(" ")[0]).join(", ")}</td>
                  <td className="text-slate-500">{c.evidenceReferenceIds.join(", ") || "—"}</td>
                  <td>{c.confidence}%</td>
                  <td><Pill label={c.status} tone={diTone(c.status) as Tone} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* --------------------------------------------------------- risks & control -- */

export function RiskControlPanel({ evaluationId, derived, selectedAlternatives }: {
  evaluationId: string; derived: DerivedDecisionState; selectedAlternatives: string[];
}) {
  const alts = alternativesFor(evaluationId);
  return (
    <Panel id="panel-risks" title="Alternative Risk & Control Analysis"
      subtitle="Raw severity, control, and residual severity for every alternative">
      <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
        {alts.map((a) => {
          const rows = risksFor(evaluationId, a.id);
          const escalated = a.id === "ALT 5001 C";
          return (
            <div key={a.id} className={cn("rounded-lg border p-2", selectedAlternatives.includes(a.id) ? "border-blue-300 bg-blue-50/40" : "border-slate-200")}>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-slate-800">{a.code} · {a.name}</p>
                <Pill label={escalated ? `Residual ${derived.optionCRisk}` : `Residual ${a.residualRisk}`}
                  tone={magnitudeTone(escalated ? derived.optionCRisk : a.residualRisk) as Tone} />
              </div>
              <table className="mt-1 w-full text-left text-[10.5px]">
                <thead className="text-[9.5px] uppercase tracking-wide text-slate-500">
                  <tr><th className="py-0.5">Risk</th><th>Raw</th><th>Control</th><th>Residual</th><th>Confidence</th></tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100">
                      <td className="py-0.5 pr-2 text-slate-700">{r.risk}</td>
                      <td><Pill label={r.rawSeverity} tone={magnitudeTone(r.rawSeverity) as Tone} /></td>
                      <td className="text-slate-600">{r.control}</td>
                      <td><Pill label={escalated ? derived.optionCRisk : r.residualSeverity} tone={magnitudeTone(escalated ? derived.optionCRisk : r.residualSeverity) as Tone} /></td>
                      <td>{r.confidence}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------- expected outcomes -- */

export function ExpectedOutcomePanel({ evaluationId, selectedAlternatives }: {
  evaluationId: string; selectedAlternatives: string[];
}) {
  const alts = alternativesFor(evaluationId).filter(
    (a) => selectedAlternatives.length === 0 || selectedAlternatives.includes(a.id),
  );
  return (
    <Panel id="panel-outcomes" title="Expected Outcomes by Alternative"
      subtitle="These are expectations, not observed outcomes. Observation happens after execution.">
      <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
        {alts.map((a) => (
          <div key={a.id} className="rounded-lg border border-slate-200 p-2">
            <p className="text-[12px] font-semibold text-slate-800">{a.code} · {a.name}</p>
            <table className="mt-1 w-full text-left text-[10.5px]">
              <thead className="text-[9.5px] uppercase tracking-wide text-slate-500">
                <tr><th className="py-0.5">Type</th><th>Metric</th><th>Expected</th><th>Range</th><th>Window</th><th>Confidence</th></tr>
              </thead>
              <tbody>
                {outcomesFor(evaluationId, a.id).map((o) => (
                  <tr key={o.id} className="border-t border-slate-100">
                    <td className="py-0.5 pr-2">{o.outcomeType}</td>
                    <td className="text-slate-700">{o.metric}</td>
                    <td className="font-medium text-slate-800">{o.expectedValue}</td>
                    <td className="text-slate-600">{o.expectedRange}</td>
                    <td className="text-slate-500">{o.observationWindow}</td>
                    <td>{o.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------- prior decisions -- */

export function PriorDecisionPanel({ selectedId, onSelect }: {
  selectedId: string | null; onSelect: (d: PriorDecision) => void;
}) {
  return (
    <Panel id="panel-prior" title="Relevant Prior Decisions"
      subtitle="What the enterprise decided before, what actually happened, and what it learned">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-[11px]">
          <thead className="text-[10px] uppercase tracking-wide text-slate-500">
            <tr><th className="py-1">Decision</th><th>Similarity</th><th>Conditions</th><th>Expected Outcome</th><th>Observed Outcome</th><th>Unexpected</th><th>Lesson</th><th>Relevance</th></tr>
          </thead>
          <tbody>
            {priorDecisions.map((d) => (
              <tr key={d.id} onClick={() => onSelect(d)}
                className={cn("cursor-pointer border-t border-slate-100 hover:bg-slate-50", selectedId === d.id && "bg-blue-50/60")}>
                <td className="py-1 pr-2 font-medium text-slate-800">{d.id} · {d.name}</td>
                <td>{d.similarity}%</td>
                <td className="text-slate-600">{d.conditions.join(", ")}</td>
                <td className="text-slate-600">{d.expectedOutcome}</td>
                <td className="text-slate-700">{d.observedOutcome}</td>
                <td className="text-amber-700">{d.unexpectedOutcome}</td>
                <td className="text-slate-600">{d.lesson}</td>
                <td><Pill label={d.currentRelevance} tone={d.currentRelevance === "High" ? "green" : "slate"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------- evidence panel ---- */

export function EvidenceSufficiencyPanel({
  evaluationId, derived, removed, added, onToggleRemove, onToggleAdd, onOpen,
}: {
  evaluationId: string;
  derived: DerivedDecisionState;
  removed: string[];
  added: string[];
  onToggleRemove: (id: string) => void;
  onToggleAdd: (id: string) => void;
  onOpen: (e: DiEvidence) => void;
}) {
  const evid = evidenceFor(evaluationId);
  const group = (s: DiEvidence["status"]) => evid.filter((e) => e.status === s);
  return (
    <Panel id="panel-evidence" title="Decision Evidence Sufficiency"
      subtitle="Removing or supplying evidence changes recommendation confidence deterministically"
      actions={<Pill label={`Coverage ${derived.evidenceCoverage}%`} tone={derived.evidenceCoverage >= 95 ? "green" : "amber"} />}>
      <Progress value={derived.evidenceCoverage} className="h-1.5" />
      <div className="mt-2 grid grid-cols-1 gap-2 xl:grid-cols-3">
        {(["Available", "Missing", "Potentially Required"] as const).map((s) => (
          <div key={s} className="rounded-lg border border-slate-200 p-2">
            <p className="mb-1 text-[11px] font-semibold text-slate-700">{s} ({group(s).length})</p>
            <ul className="space-y-1">
              {group(s).map((e) => {
                const isRemoved = removed.includes(e.id);
                const isAdded = added.includes(e.id);
                return (
                  <li key={e.id} className={cn("rounded border px-1.5 py-1", isRemoved ? "border-red-200 bg-red-50" : isAdded ? "border-emerald-200 bg-emerald-50" : "border-slate-100")}>
                    <button type="button" onClick={() => onOpen(e)} className="block w-full text-left text-[11px] font-medium text-slate-800 hover:underline">
                      {e.name}
                    </button>
                    <p className="text-[10px] text-slate-500">{e.decisionDimension} · {e.authority} · {e.freshness}</p>
                    <div className="mt-1 flex gap-1">
                      {s === "Available" && (
                        <Button size="sm" variant="outline" className="h-5 text-[9.5px]" onClick={() => onToggleRemove(e.id)}>
                          {isRemoved ? "Restore Evidence" : "Remove Evidence"}
                        </Button>
                      )}
                      {s !== "Available" && (
                        <Button size="sm" variant="outline" className="h-5 text-[9.5px]" onClick={() => onToggleAdd(e.id)}>
                          {isAdded ? "Withdraw Evidence" : "Add Evidence"}
                        </Button>
                      )}
                      <Pill label={`${e.required ? "Required" : "Optional"}`} tone={e.required ? "amber" : "slate"} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* -------------------------------------------------- recommendation synthesis */

export function RecommendationSynthesisPanel({ derived, evaluationId }: {
  derived: DerivedDecisionState; evaluationId: string;
}) {
  const preferred = alternativesFor(evaluationId).find((a) => a.id === derived.preferredAlternativeId);
  return (
    <Panel id="panel-recommendation" title="Recommendation Synthesis"
      subtitle="Every contributing factor is shown. No opaque score is produced."
      actions={<Pill label={derived.posture} tone={diTone(derived.posture) as Tone} />}>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <div className="space-y-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-2">
            <p className="text-[10px] uppercase tracking-wide text-blue-700">Preferred Alternative</p>
            <p className="text-[13px] font-bold text-slate-900">{preferred?.code} · {preferred?.name}</p>
            <p className="mt-1 text-[11px] text-slate-600">
              Best balance of customer completion opportunity, reversibility, dependency containment, fraud monitoring, and governed traffic expansion.
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Pill label={`Confidence ${derived.confidence}%`} tone={derived.confidence >= 92 ? "green" : "amber"} />
              <Pill label={derived.posture} tone={diTone(derived.posture) as Tone} />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-700">Contributing Factors</p>
            <ul className="mt-1 space-y-0.5">
              {recommendationFactors.map((f) => (
                <li key={f.factor} className="flex items-center justify-between rounded border border-slate-100 px-1.5 py-1 text-[11px]">
                  <span className="text-slate-700">{f.factor}</span>
                  <span className={cn("flex items-center gap-1 font-medium", f.direction === "positive" ? "text-emerald-700" : "text-amber-700")}>
                    {f.direction === "positive" ? <ChevronUp className="h-3 w-3" aria-hidden /> : <ChevronDown className="h-3 w-3" aria-hidden />}
                    {f.weight}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <ListBlock title="Primary Benefits" tone="emerald" items={recommendationBenefits} />
          <ListBlock title="Primary Costs" tone="amber" items={recommendationCosts} />
          <ListBlock title="Counterarguments" tone="slate" items={recommendationCounterarguments} />
          <ListBlock title="Remaining Open Issues" tone="red" items={openIssues} />
        </div>

        <div className="space-y-2">
          <ListBlock title="Required Conditions" tone="blue" items={derived.activeConditions} />
          <ListBlock title="Recommendation Would Weaken If" tone="red" items={weakenTriggers} />
          <ListBlock title="Recommendation Would Strengthen If" tone="emerald" items={strengthenTriggers} />
          {derived.notes.length > 0 && <ListBlock title="Live Sensitivity Notes" tone="amber" items={derived.notes} />}
        </div>
      </div>
    </Panel>
  );
}

export function ListBlock({ title, items, tone }: { title: string; items: string[]; tone: "emerald" | "amber" | "red" | "blue" | "slate" }) {
  const map = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  } as const;
  return (
    <div className={cn("rounded-lg border p-2", map[tone])}>
      <p className="text-[10px] font-semibold uppercase tracking-wide">{title}</p>
      <ul className="mt-1 space-y-0.5">
        {items.map((i) => <li key={i} className="text-[11px] leading-snug">· {i}</li>)}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ quality */

export function DecisionQualityPanel() {
  return (
    <Panel id="panel-quality" title="Decision Context Quality"
      subtitle={`Composite ${qualityOverall} / 100 across twelve dimensions`}>
      <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
        {qualityDimensions.map((d) => {
          const variance = d.current - d.target;
          return (
            <div key={d.name} className="rounded-lg border border-slate-200 p-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-700">{d.name}</span>
                <Pill label={variance >= 0 ? "On target" : "Below target"} tone={variance >= 0 ? "green" : "amber"} />
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[16px] font-bold text-slate-900">{d.current}</span>
                <span className="text-[10px] text-slate-500">target {d.target} · variance {variance > 0 ? `+${variance}` : variance} · trend {d.trend}</span>
              </div>
              <Progress value={d.current} className="mt-1 h-1" />
              <p className="mt-0.5 text-[10px] text-slate-500">{d.affectedDecisions} affected decisions</p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------ decision context pkg */

export function DecisionContextPackagePanel({
  evaluation, derived, onOpenPrompt2,
}: {
  evaluation: DecisionIntelligenceEvaluation;
  derived: DerivedDecisionState;
  onOpenPrompt2: (label: string) => void;
}) {
  const alts = alternativesFor(evaluation.id);
  const preferred = alts.find((a) => a.id === derived.preferredAlternativeId);
  return (
    <Panel id="panel-package" title="Decision Context Package"
      subtitle={`${evaluation.id} · prepared for ${evaluation.decisionOwner}`}
      actions={
        <div className="flex gap-1">
          <Pill label={derived.evidenceCoverage < 100 ? "Decision Context Ready with Evidence Gap" : "Decision Context Ready"}
            tone={derived.evidenceCoverage < 100 ? "amber" : "green"} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenPrompt2("Record Decision")}>Record Decision</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenPrompt2("Governed Export")}>Export Package</Button>
        </div>
      }>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <div>
          <dl>
            <Row label="Decision Question" value={<span className="text-left">{evaluation.decisionQuestion}</span>} />
            <Row label="Decision Owner" value={evaluation.decisionOwner} />
            <Row label="Decision Deadline" value={evaluation.decisionDeadline} />
            <Row label="Input Analysis Versions" value={`${evaluation.intakeId} · ${evaluation.crossTeamAnalysisVersionId}`} />
            <Row label="Alternatives" value={alts.map((a) => a.code).join(", ")} />
            <Row label="Persona Positions" value={`${positionsFor(evaluation.id).length} preserved`} />
            <Row label="Applicable Conditions" value={`${constraintsFor(evaluation.id).filter((c) => c.kind === "Constraint").length} constraints`} />
            <Row label="Shared Dependencies" value={sharedDependencies.map((d) => d.name).join(", ")} />
            <Row label="Material Tradeoffs" value={`${tradeoffsFor(evaluation.id).length}`} />
            <Row label="Risks / Controls" value={`${risksFor(evaluation.id).length} risk records`} />
            <Row label="Evidence" value={`${evidenceFor(evaluation.id).filter((e) => e.status === "Available").length} available`} />
            <Row label="Evidence Gaps" value={evidenceFor(evaluation.id).filter((e) => e.status === "Missing").map((e) => e.name).join(", ") || "None"} />
          </dl>
        </div>
        <div>
          <dl>
            <Row label="Prior Decisions" value={priorDecisions.map((d) => d.id).join(", ")} />
            <Row label="Prior Outcomes" value="Observed +1.8% completion, +0.4% duplicate authorization" />
            <Row label="Learning" value="LRN 1426 · Strengthen idempotency before broader expansion" />
            <Row label="Expected Outcomes" value={`${outcomesFor(evaluation.id).length} registered expectations`} />
            <Row label="Recommendation" value={<span>{derived.posture} with {preferred?.code} · {preferred?.name}</span>} />
            <Row label="Recommendation Confidence" value={`${derived.confidence}%`} />
          </dl>
          <ListBlock title="Conditions for Proceeding" tone="blue" items={derived.activeConditions} />
        </div>
        <div className="space-y-2">
          <ListBlock title="Required Approvals" tone="amber" items={requiredApprovals} />
          <ListBlock title="Required Reviewers" tone="slate" items={requiredReviewers} />
          <ListBlock title="Open Questions" tone="red" items={openQuestions} />
          <ListBlock title="Assumptions" tone="slate" items={evaluation.assumptions} />
          <p className="rounded border border-dashed border-slate-300 px-2 py-1 text-[10.5px] text-slate-500">
            Prompt 1 prepares decision context only. The final human decision, approvals, and dissent capture are recorded in Prompt 2.
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ activity */

export function ActivityPanel({ items }: { items: DecisionIntelligenceActivity[] }) {
  return (
    <Panel id="panel-activity" title="Recent Decision Intelligence Activity" subtitle="Audit linked, append only">
      <ul className="space-y-1">
        {items.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-2 rounded border border-slate-100 px-2 py-1">
            <div>
              <p className="text-[11px] font-medium text-slate-800">{a.action}</p>
              <p className="text-[10.5px] text-slate-500">{a.description}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500">{a.timestamp} · {a.owner}</p>
              <p className="text-[9.5px] text-slate-400">{a.auditId}</p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ----------------------------------------------------------- executive view */

export function ExecutiveSummaryPanel({ evaluation, derived }: {
  evaluation: DecisionIntelligenceEvaluation; derived: DerivedDecisionState;
}) {
  const preferred = alternativesFor(evaluation.id).find((a) => a.id === derived.preferredAlternativeId);
  return (
    <Panel id="panel-executive" title="Executive Decision Summary"
      subtitle="Business outcome, customer impact, enterprise risk, urgency, and required conditions">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
        {[
          ["Business Outcome", "Checkout completion opportunity, staged", "green"],
          ["Customer Impact", `${evaluation.customerImpact} · purchase journey`, "blue"],
          ["Enterprise Risk", `${evaluation.highestRisk}`, "amber"],
          ["Decision Urgency", evaluation.decisionDeadline, "red"],
        ].map(([l, v, t]) => (
          <div key={l} className="rounded-lg border border-slate-200 p-2">
            <p className="text-[9.5px] uppercase tracking-wide text-slate-500">{l}</p>
            <p className="text-[12px] font-semibold text-slate-800">{v}</p>
            <Pill label={String(t) === "green" ? "Positive" : String(t) === "red" ? "Time bound" : "Watch"} tone={t as Tone} />
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 xl:grid-cols-3">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-2">
          <p className="text-[10px] uppercase tracking-wide text-blue-700">Recommendation</p>
          <p className="text-[14px] font-bold text-slate-900">{derived.posture}</p>
          <p className="text-[11.5px] text-slate-700">{preferred?.code} · {preferred?.name}</p>
          <p className="mt-1 text-[11px] text-slate-600">Confidence {derived.confidence}% · Evidence {derived.evidenceCoverage}%</p>
        </div>
        <ListBlock title="Material Conflicts" tone="amber" items={[
          "Fraud Engineering cannot endorse until Fraud Loss Analysis completes",
          "Identity Engineering EU vault margin below target",
          "Release Governance approval threshold at 10% traffic",
        ]} />
        <ListBlock title="Required Conditions" tone="blue" items={derived.activeConditions} />
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------- dependencies -- */

export function DependencyPanel({ selectedId, onSelect, selectedAlternatives }: {
  selectedId: string | null; onSelect: (id: string) => void; selectedAlternatives: string[];
}) {
  return (
    <Panel id="panel-dependencies" title="Shared Dependencies"
      subtitle="Dependency exposure differs materially by alternative">
      <ul className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-4">
        {sharedDependencies.map((d) => {
          const exposed = selectedAlternatives.some((a) => d.alternatives.includes(a));
          return (
            <li key={d.id}>
              <button type="button" onClick={() => onSelect(d.id)}
                className={cn("h-full w-full rounded-lg border p-2 text-left transition hover:border-blue-300",
                  selectedId === d.id ? "border-blue-400 bg-blue-50" : exposed ? "border-amber-200 bg-amber-50/50" : "border-slate-200")}>
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-semibold text-slate-800">{d.name}</span>
                  <Pill label={d.criticality} tone={diTone(d.criticality) as Tone} />
                </div>
                <p className="mt-0.5 text-[10.5px] text-slate-600">{d.exposure}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Confidence {d.confidence}%{exposed ? " · exposed by selection" : ""}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
