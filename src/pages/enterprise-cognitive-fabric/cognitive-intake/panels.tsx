/** Cognitive Intake — operational panels. Reuses existing ECF primitives. */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Pill, Row, type Tone } from "../persona-studio/primitives";
import { Panel, EmptyState, PanelSkeleton, type Density } from "../cognitive-memory/panels";
import {
  contextMatchMetrics, contextTypeOrder, decompositionQuality, gapSummary, intakeLifecycleStages,
  lifecycleCallouts, nextStage, queueColumns, stageName, workClassification,
  completenessDimensions, overallCompleteness,
  type CognitiveIntake, type CognitiveIntakeContextMatch, type CognitiveIntakeEvidence,
  type CognitiveIntakeGap, type CognitiveIntakePersonaCandidate, type CognitiveIntakeRelatedWork,
  type CognitiveIntakeStage, type IntakeKpi, type IntakeMemoryType, type IntakeView,
  type PackageCompletenessInput, type CognitiveIntakeEntityMatch,
} from "./data";

export { Panel, EmptyState, PanelSkeleton };
export type { Density };

export const intakeTone = (s: string): Tone =>
  ["Running", "Package Complete", "Healthy", "Within SLA", "Resolved", "Current", "Accepted", "Complete", "Included", "Primary", "Operational", "Confirmed"].includes(s) ? "green"
    : ["Warning", "Needs Clarification", "Needs Attention", "Review Required", "At Risk", "Attention", "Analyzing", "Partial", "Aging", "Accepted with Notes", "Needs Confirmation", "Needs Evidence", "Medium", "Potentially Required", "Editable"].includes(s) ? "amber"
      : ["Blocked", "Failed", "Critical", "High", "Missing", "Unresolved", "Open", "Excluded"].includes(s) ? "red"
        : ["Idle", "Draft", "Low", "Historical", "Closed", "Optional", "Not Started", "Informational"].includes(s) ? "slate" : "blue";

const pct = (n: number) => `${Math.round(n)}%`;

/* ---------------------------------------------------------------- KPI card -- */

export function IntakeKpiCard({ kpi, onClick, focused }: { kpi: IntakeKpi; onClick: () => void; focused?: boolean }) {
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
                <span key={s.label} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9.5px] text-slate-600">{s.value} {s.label}</span>
              ))}
            </div>
            <div className="mt-1.5 flex items-end gap-[2px]" aria-hidden>
              {kpi.trend.map((t, i) => (
                <span key={i} className={cn("w-full rounded-sm", last >= prev ? "bg-emerald-300" : "bg-amber-300")}
                  style={{ height: `${Math.max(3, (t / max) * 18)}px` }} />
              ))}
            </div>
            <p className="mt-1 text-[9.5px] text-slate-500">Trend {last >= prev ? "improving" : "declining"} over 8 periods</p>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px] text-[11px]">{kpi.tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* -------------------------------------------------------------- lifecycle -- */

export function LifecyclePanel({ selectedStage, onSelect, focus, onFocus }: {
  selectedStage: string;
  onSelect: (id: string) => void;
  focus: "all" | "warnings" | "blocked" | "clarification" | "complete";
  onFocus: (f: "all" | "warnings" | "blocked" | "clarification" | "complete") => void;
}) {
  const [zoom, setZoom] = useState(false);
  const stages = useMemo(() => {
    if (focus === "warnings") return intakeLifecycleStages.filter((s) => s.status === "Warning" || s.warningCount > 4);
    if (focus === "blocked") return intakeLifecycleStages.filter((s) => s.failedCount > 1);
    if (focus === "clarification") return intakeLifecycleStages.filter((s) => s.id === "evidence" || s.id === "entities");
    if (focus === "complete") return intakeLifecycleStages.filter((s) => s.id === "package" || s.id === "route");
    return intakeLifecycleStages;
  }, [focus]);

  const summary = `Cognitive Intake lifecycle has ${intakeLifecycleStages.length} stages. ` +
    intakeLifecycleStages.map((s) => `${s.name}: ${s.status}, ${s.processedCount} processed, ${s.pendingCount} pending, ${s.successRate} percent success`).join(". ");

  return (
    <Panel id="panel-lifecycle" title="Cognitive Intake Lifecycle"
      subtitle="Understand incoming work before evaluating it — receive, decompose, resolve, retrieve, and package"
      actions={
        <>
          {([["all", "All Stages"], ["warnings", "Focus Warnings"], ["blocked", "Show Blocked"], ["clarification", "Needs Clarification"], ["complete", "Complete Packages"]] as const).map(([id, label]) => (
            <Button key={id} size="sm" variant={focus === id ? "default" : "outline"} className="h-7 text-[11px]"
              onClick={() => onFocus(id)}>{label}</Button>
          ))}
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setZoom((z) => !z)}>
            {zoom ? "Reset" : "Zoom to Fit"}
          </Button>
        </>
      }>
      <p className="sr-only">{summary}</p>
      <div className={cn("grid gap-1.5", zoom ? "sm:grid-cols-3 lg:grid-cols-6" : "sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6")}>
        {stages.map((s) => (
          <button key={s.id} type="button" onClick={() => onSelect(s.id)}
            aria-pressed={selectedStage === s.id}
            title={`${s.name} · ${s.status} · owner ${s.owner} · SLA ${s.slaStatus}`}
            className={cn("rounded-lg border p-2 text-left transition hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              selectedStage === s.id ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white")}>
            <div className="flex items-start justify-between gap-1">
              <span className="text-[10px] font-semibold text-slate-500">{s.sequence.toString().padStart(2, "0")}</span>
              <Pill label={s.status} tone={intakeTone(s.status)} />
            </div>
            <p className="mt-0.5 text-[11.5px] font-semibold leading-tight text-slate-900">{s.name}</p>
            <p className="mt-1 text-[10px] text-slate-500">{s.processedCount} processed · {s.pendingCount} pending</p>
            <p className="text-[10px] text-slate-500">{s.successRate}% success · {s.averageDuration} avg</p>
            <div className="mt-1 flex gap-1">
              {s.warningCount > 0 && <span className="rounded border border-amber-200 bg-amber-50 px-1 text-[9.5px] text-amber-700">{s.warningCount} warn</span>}
              {s.failedCount > 0 && <span className="rounded border border-red-200 bg-red-50 px-1 text-[9.5px] text-red-700">{s.failedCount} fail</span>}
            </div>
          </button>
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {lifecycleCallouts.map((c) => (
          <li key={c.id}>
            <Pill label={c.text} tone={c.tone} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* --------------------------------------------------------- selected stage -- */

const stageTabs = ["Overview", "Queue", "Evidence", "Gaps", "Entities", "Context", "Outputs", "Configuration"] as const;

export function SelectedStagePanel({ stage, rows, evidence, gaps, entities, context, onOpenWorkbench, onOpenIntake, onViewLogs }: {
  stage: CognitiveIntakeStage;
  rows: CognitiveIntake[];
  evidence: CognitiveIntakeEvidence[];
  gaps: CognitiveIntakeGap[];
  entities: CognitiveIntakeEntityMatch[];
  context: CognitiveIntakeContextMatch[];
  onOpenWorkbench: () => void;
  onOpenIntake: (id: string) => void;
  onViewLogs: () => void;
}) {
  const [tab, setTab] = useState<(typeof stageTabs)[number]>("Overview");
  return (
    <Panel id="panel-stage" title="Selected Intake Stage" subtitle={`${stage.name} · ${stage.description}`}
      actions={
        <>
          <Button size="sm" className="h-7 text-[11px]" onClick={onOpenWorkbench}>Open Workbench</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenIntake(rows[0]?.id ?? "INT 7001")}>Open Intake</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onViewLogs}>View Logs</Button>
        </>
      }>
      <div className="grid gap-2 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <dl className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <Row label="Status" value={<Pill label={stage.status} tone={intakeTone(stage.status)} />} />
          <Row label="Items Processing" value={stage.pendingCount} />
          <Row label="Completed Today" value={stage.processedCount} />
          <Row label="Needs Clarification" value={stage.warningCount} />
          <Row label="Average Duration" value={stage.averageDuration} />
          <Row label="P95 Duration" value={stage.p95Duration} />
          <Row label="Success Rate" value={`${stage.successRate}%`} />
          <Row label="Throughput" value={stage.throughput} />
          <Row label="SLA" value={<Pill label={stage.slaStatus} tone={intakeTone(stage.slaStatus)} />} />
          <Row label="Owner" value={stage.owner} />
        </dl>

        <div>
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Selected stage detail">
            {stageTabs.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
                className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  tab === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{t}</button>
            ))}
          </div>

          <div className="mt-2 max-h-[280px] overflow-auto rounded-lg border border-slate-200">
            {tab === "Overview" && (
              <div className="p-2 text-[11.5px] text-slate-600">
                <p>{stage.description}</p>
                <p className="mt-1">
                  This stage understands and structures incoming work. Formal readiness scoring and impact evaluation
                  happen in later Enterprise Cognitive Fabric stages.
                </p>
              </div>
            )}
            {tab === "Queue" && (
              <MiniTable head={["Intake ID", "Work Item", "Submitting Team", "Work Type", "Priority", "Age", "Current Stage", "Status"]}
                rows={rows.map((r) => [r.id, r.title, r.submittingTeamName, r.workType, r.priority, `${r.ageHours} h`, stageName(r.currentStageId), <Pill key={r.id} label={r.status} tone={intakeTone(r.status)} />])}
                onRow={(i) => onOpenIntake(rows[i].id)} />
            )}
            {tab === "Evidence" && (
              <MiniTable head={["Work Item", "Evidence Type", "Evidence Name", "Source", "Authority", "Freshness", "Required", "Quality", "Status"]}
                rows={evidence.map((e) => ["INT 7001", e.evidenceType, e.name, e.source, e.authority, e.freshness, e.required, e.qualityScore ? `${e.qualityScore}` : "—", <Pill key={e.id} label={e.status} tone={intakeTone(e.status)} />])} />
            )}
            {tab === "Gaps" && (
              <MiniTable head={["Work Item", "Gap Type", "Missing Information", "Required Next", "Owner", "Severity", "Recommended Action", "Status"]}
                rows={gaps.map((g) => [g.intakeId, g.gapType, g.question, g.requiredForNextStage ? "Yes" : "No", g.assignedTo, g.severity, g.description, <Pill key={g.id} label={g.status} tone={intakeTone(g.status)} />])} />
            )}
            {tab === "Entities" && (
              <MiniTable head={["Detected Entity", "Canonical Entity", "Type", "Confidence", "Owner", "Status"]}
                rows={entities.map((e) => [e.detectedValue, e.canonicalName, e.entityType, `${e.confidence}%`, e.owner, <Pill key={e.id} label={e.status} tone={intakeTone(e.status)} />])} />
            )}
            {tab === "Context" && (
              <MiniTable head={["Memory Record", "Memory Type", "Relevance", "Authority", "Confidence", "Freshness", "Included"]}
                rows={context.map((c) => [c.memoryRecordId, c.memoryType, `${c.relevanceScore}%`, c.authority, `${c.confidence}%`, c.freshness, c.included ? "Included" : "Excluded"])} />
            )}
            {tab === "Outputs" && (
              <div className="grid gap-1.5 p-2 sm:grid-cols-3">
                {[["Intake Packages", "152"], ["Clarification Tasks", "17"], ["Persona Candidates", "42"],
                  ["Applicable Conditions", "1,284"], ["Context Sets", "169"], ["Readiness Routes", "138"]].map(([l, v]) => (
                  <div key={l} className="rounded border border-slate-200 bg-slate-50 p-2">
                    <p className="text-[10px] text-slate-500">{l}</p>
                    <p className="text-[15px] font-semibold text-slate-900">{v}</p>
                  </div>
                ))}
              </div>
            )}
            {tab === "Configuration" && (
              <dl className="p-2">
                <Row label="Owner" value={stage.owner} />
                <Row label="Sequence" value={stage.sequence} />
                <Row label="SLA target" value={stage.slaStatus} />
                <Row label="Throughput target" value={stage.throughput} />
                <Row label="Workflow operations" value={<span className="text-slate-400">Available in Prompt 2</span>} />
              </dl>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function MiniTable({ head, rows, onRow }: {
  head: string[]; rows: React.ReactNode[][]; onRow?: (index: number) => void;
}) {
  if (rows.length === 0) return <EmptyState message="No records match the current filters" hint="Adjust filters to widen the scope" />;
  return (
    <table className="w-full border-collapse text-[11px]">
      <thead className="sticky top-0 bg-slate-50">
        <tr>{head.map((h) => <th key={h} scope="col" className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-600">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} onClick={onRow ? () => onRow(i) : undefined}
            className={cn("border-b border-slate-100 last:border-0", onRow && "cursor-pointer hover:bg-blue-50")}>
            {r.map((c, j) => <td key={j} className="px-2 py-1 align-top text-slate-700">{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ------------------------------------------------------------- intake queue */

export function IntakeQueuePanel({
  rows, view, density, hiddenColumns, onToggleColumn, selected, onSelect, sortKey, sortDir, onSort,
  page, pageSize, onPage, loading, onOpen, onOpenWorkbench, actions,
}: {
  rows: CognitiveIntake[];
  view: IntakeView;
  density: Density;
  hiddenColumns: string[];
  onToggleColumn: (key: string) => void;
  selected: Set<string>;
  onSelect: (next: Set<string>) => void;
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  loading: boolean;
  onOpen: (r: CognitiveIntake) => void;
  onOpenWorkbench: (r: CognitiveIntake) => void;
  actions?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible = queueColumns.filter((c) => !hiddenColumns.includes(c.key) &&
    (view !== "executive" || ["id", "title", "workType", "priority", "contextMatchScore", "evidenceCoverage", "status"].includes(c.key)));

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey] ?? "";
      const bv = (b as unknown as Record<string, unknown>)[sortKey] ?? "";
      const r = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? r : -r;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pad = density === "compact" ? "py-0.5" : density === "comfortable" ? "py-2" : "py-1";

  const cell = (r: CognitiveIntake, key: string): React.ReactNode => {
    switch (key) {
      case "stage": return stageName(r.currentStageId);
      case "contextMatchScore": return pct(r.contextMatchScore);
      case "evidenceCoverage": return pct(r.evidenceCoverage);
      case "intakeConfidence": return pct(r.intakeConfidence);
      case "personas": return `${r.candidatePersonaIds.length}`;
      case "ageHours": return `${r.ageHours} h`;
      case "status": return <Pill label={r.status} tone={intakeTone(r.status)} />;
      case "priority": return <Pill label={r.priority} tone={intakeTone(r.priority)} />;
      default: return String((r as unknown as Record<string, unknown>)[key] ?? "—");
    }
  };

  return (
    <Panel id="panel-queue" title="Cognitive Intake Queue"
      subtitle="Incoming work, current stage, enterprise context state, evidence state, and missing information"
      actions={
        <>
          {actions}
          <div className="relative">
            <details className="group">
              <summary className="cursor-pointer list-none rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600">Columns</summary>
              <div className="absolute right-0 z-20 mt-1 max-h-64 w-56 overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg">
                {queueColumns.map((c) => (
                  <label key={c.key} className="flex items-center gap-1.5 rounded px-1.5 py-1 text-[11px] hover:bg-slate-50">
                    <input type="checkbox" checked={!hiddenColumns.includes(c.key)} disabled={c.pinned}
                      onChange={() => onToggleColumn(c.key)} />
                    {c.label}{c.pinned && <span className="text-[9.5px] text-slate-400">pinned</span>}
                  </label>
                ))}
              </div>
            </details>
          </div>
        </>
      }>
      {loading ? <PanelSkeleton rows={6} /> : pageRows.length === 0 ? (
        <EmptyState message="No incoming work matches the current filters" hint="Clear filters or widen the time range" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11.5px]">
              <caption className="sr-only">Cognitive Intake queue, {sorted.length} work items</caption>
              <thead>
                <tr className="bg-slate-50">
                  <th scope="col" className="border-b border-slate-200 px-2 py-1 text-left">
                    <input type="checkbox" aria-label="Select all rows"
                      checked={pageRows.every((r) => selected.has(r.id)) && pageRows.length > 0}
                      onChange={(e) => {
                        const next = new Set(selected);
                        pageRows.forEach((r) => e.target.checked ? next.add(r.id) : next.delete(r.id));
                        onSelect(next);
                      }} />
                  </th>
                  {visible.map((c) => (
                    <th key={c.key} scope="col" className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-600">
                      <button type="button" onClick={() => onSort(c.key)} className="inline-flex items-center gap-0.5 hover:text-blue-700">
                        {c.label}
                        {sortKey === c.key && (sortDir === "asc" ? <ChevronUp className="h-3 w-3" aria-hidden /> : <ChevronDown className="h-3 w-3" aria-hidden />)}
                      </button>
                    </th>
                  ))}
                  <th scope="col" className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <>
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-blue-50/60">
                      <td className={cn("px-2", pad)}>
                        <input type="checkbox" aria-label={`Select ${r.id}`} checked={selected.has(r.id)}
                          onChange={() => {
                            const next = new Set(selected);
                            next.has(r.id) ? next.delete(r.id) : next.add(r.id);
                            onSelect(next);
                          }} />
                      </td>
                      {visible.map((c) => (
                        <td key={c.key} className={cn("cursor-pointer px-2 text-slate-700", pad)} onClick={() => onOpen(r)}>
                          {cell(r, c.key)}
                        </td>
                      ))}
                      <td className={cn("px-2", pad)}>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenWorkbench(r)}>Workbench</Button>
                          <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]"
                            aria-label={`Toggle summary for ${r.id}`}
                            onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                            {expanded === r.id ? "Hide" : "Summary"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expanded === r.id && (
                      <tr key={`${r.id}-x`} className="bg-slate-50">
                        <td colSpan={visible.length + 2} className="px-3 py-2">
                          <p className="text-[11.5px] text-slate-700">{r.description}</p>
                          <div className="mt-1 grid gap-1 sm:grid-cols-4">
                            <Row label="Intent" value={r.intent} />
                            <Row label="Current state" value={r.currentState} />
                            <Row label="Proposed state" value={r.proposedState} />
                            <Row label="Package completeness" value={pct(r.packageCompleteness)} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
            <span>{selected.size} selected · {sorted.length} work items</span>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
              <span>Page {page} of {pages}</span>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}

/* ----------------------------------------------------------- classification */

export function ClassificationPanel({ onFilterType, activeType }: {
  onFilterType: (t: string) => void; activeType: string;
}) {
  return (
    <Panel id="panel-classification" title="Incoming Work Classification"
      subtitle="Governed work type taxonomy with intake throughput and clarification load">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="bg-slate-50">
            <tr>
              {["Work Type", "Count", "Active", "Package Complete", "Needs Clarification", "Avg Context Match", "Avg Intake Duration"].map((h) => (
                <th key={h} scope="col" className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workClassification.map((w) => (
              <tr key={w.type} onClick={() => onFilterType(w.type)}
                className={cn("cursor-pointer border-b border-slate-100 last:border-0 hover:bg-blue-50",
                  activeType === w.type && "bg-blue-50")}>
                <td className="px-2 py-1 font-medium text-slate-800">{w.type}</td>
                <td className="px-2 py-1">{w.count}</td>
                <td className="px-2 py-1">{w.active}</td>
                <td className="px-2 py-1">{w.complete}</td>
                <td className="px-2 py-1">{w.clarification > 0 ? <Pill label={`${w.clarification}`} tone="amber" /> : "0"}</td>
                <td className="px-2 py-1">{w.avgContextMatch}%</td>
                <td className="px-2 py-1">{w.avgDuration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* --------------------------------------------------- decomposition quality -- */

export function DecompositionQualityPanel() {
  return (
    <Panel id="panel-decomposition-quality" title="Change Decomposition Quality"
      subtitle="How reliably incoming work is being turned into structured change elements"
      actions={<Pill label={`${decompositionQuality.overall} / 100`} tone="green" />}>
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-5">
        {decompositionQuality.dimensions.map((d) => (
          <div key={d.id} className="rounded-lg border border-slate-200 bg-white p-2">
            <div className="flex items-start justify-between gap-1">
              <p className="text-[11px] font-medium text-slate-700">{d.name}</p>
              <Pill label={d.status} tone={intakeTone(d.status)} />
            </div>
            <p className="mt-0.5 text-[17px] font-semibold text-slate-900">{d.current}</p>
            <Progress value={d.current} className="mt-1 h-1.5" />
            <p className="mt-1 text-[10px] text-slate-500">
              Target {d.target} · variance {d.current - d.target > 0 ? "+" : ""}{d.current - d.target} · trend {d.trend} · {d.affected} intakes
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------- context match ----- */

export function ContextMatchPanel({ context, onFilterType, activeType }: {
  context: CognitiveIntakeContextMatch[];
  onFilterType: (t: IntakeMemoryType | null) => void;
  activeType: IntakeMemoryType | null;
}) {
  const byType = (t: IntakeMemoryType) => context.filter((c) => c.memoryType === t);
  const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
  return (
    <Panel id="panel-context-match" title="Enterprise Context Match"
      subtitle="Enterprise Cognitive Memory retrieved for the selected incoming work">
      <div className="grid gap-1.5 sm:grid-cols-3 xl:grid-cols-7">
        {contextMatchMetrics.map((m) => (
          <div key={m.label} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="text-[10px] text-slate-500">{m.label}</p>
            <p className="text-[16px] font-semibold text-slate-900">{m.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="bg-slate-50">
            <tr>
              {["Context Type", "Retrieved", "Included", "Excluded", "Avg Authority", "Avg Confidence", "Freshness"].map((h) => (
                <th key={h} scope="col" className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contextTypeOrder.map((t) => {
              const rows = byType(t);
              if (rows.length === 0) return null;
              const inc = rows.filter((r) => r.included);
              return (
                <tr key={t} onClick={() => onFilterType(activeType === t ? null : t)}
                  className={cn("cursor-pointer border-b border-slate-100 last:border-0 hover:bg-blue-50", activeType === t && "bg-blue-50")}>
                  <td className="px-2 py-1 font-medium text-slate-800">{t}</td>
                  <td className="px-2 py-1">{rows.length}</td>
                  <td className="px-2 py-1">{inc.length}</td>
                  <td className="px-2 py-1">{rows.length - inc.length}</td>
                  <td className="px-2 py-1">{rows[0].authority}</td>
                  <td className="px-2 py-1">{avg(rows.map((r) => r.confidence))}%</td>
                  <td className="px-2 py-1">{rows.every((r) => r.freshness === "Current") ? "Current" : "Mixed"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------ candidate personas -- */

export function CandidatePersonasPanel({ candidates, onToggle, onPrimary, onOpen }: {
  candidates: CognitiveIntakePersonaCandidate[];
  onToggle: (c: CognitiveIntakePersonaCandidate) => void;
  onPrimary: (c: CognitiveIntakePersonaCandidate) => void;
  onOpen: (c: CognitiveIntakePersonaCandidate) => void;
}) {
  return (
    <Panel id="panel-personas" title="Candidate Team Personas"
      subtitle="Personas that may care about this work. Impact scoring happens later in Persona Impact Analysis."
      actions={<Pill label={`${candidates.filter((c) => c.selectionState !== "Excluded").length} of ${candidates.length} included`} tone="blue" />}>
      <div className="grid gap-1.5 lg:grid-cols-2 xl:grid-cols-3">
        {candidates.map((c) => (
          <div key={c.id} className={cn("rounded-lg border p-2",
            c.selectionState === "Excluded" ? "border-slate-200 bg-slate-50 opacity-70"
              : c.selectionState === "Primary" ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white")}>
            <div className="flex items-start justify-between gap-1">
              <div>
                <p className="text-[12px] font-semibold text-slate-900">{c.personaName}</p>
                <p className="text-[10.5px] text-slate-500">{c.teamName}</p>
              </div>
              <Pill label={`${c.matchConfidence}%`} tone={c.matchConfidence >= 90 ? "green" : "amber"} />
            </div>
            <p className="mt-1 text-[11px] text-slate-600">{c.matchReason}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {c.relationshipTypes.map((r) => <Pill key={r} label={r} tone="slate" />)}
              <Pill label={c.criticality} tone={c.criticality === "Critical Dependency" ? "red" : c.criticality === "Supporting" ? "amber" : "slate"} />
              <Pill label={`${c.applicableConditionIds.length} conditions`} tone="blue" />
              <Pill label={`${c.evidenceReferenceIds.length} evidence`} tone="slate" />
              <Pill label={c.selectionState} tone={intakeTone(c.selectionState)} />
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onToggle(c)}>
                {c.selectionState === "Excluded" ? "Include" : "Exclude"}
              </Button>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onPrimary(c)}>Mark Primary</Button>
              <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => onOpen(c)}>Open Persona</Button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ----------------------------------------------------- evidence completeness */

export function EvidencePanel({ evidence, coverage, onOpen }: {
  evidence: CognitiveIntakeEvidence[]; coverage: number; onOpen: (e: CognitiveIntakeEvidence) => void;
}) {
  const provided = evidence.filter((e) => e.provided);
  const missing = evidence.filter((e) => !e.provided && e.required === "Required");
  const potential = evidence.filter((e) => e.required === "Potentially Required");
  return (
    <Panel id="panel-evidence" title="Evidence Completeness"
      subtitle="Evidence supplied with the incoming work, and evidence still required"
      actions={<Pill label={pct(coverage)} tone={coverage >= 95 ? "green" : coverage >= 80 ? "amber" : "red"} />}>
      <div className="grid gap-1.5 sm:grid-cols-3">
        {[["Provided", provided], ["Missing", missing], ["Potentially Required", potential]].map(([label, list]) => (
          <div key={label as string} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label as string}</p>
            <ul className="mt-1 space-y-0.5">
              {(list as CognitiveIntakeEvidence[]).map((e) => (
                <li key={e.id} className="text-[11px] text-slate-700">• {e.name}</li>
              ))}
              {(list as CognitiveIntakeEvidence[]).length === 0 && <li className="text-[11px] text-slate-400">None</li>}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="bg-slate-50">
            <tr>
              {["Evidence", "Category", "Required", "Provided", "Authority", "Freshness", "Owner", "Quality", "Status", ""].map((h) => (
                <th key={h} scope="col" className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {evidence.map((e) => (
              <tr key={e.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-2 py-1 font-medium text-slate-800">{e.name}</td>
                <td className="px-2 py-1">{e.category}</td>
                <td className="px-2 py-1">{e.required}</td>
                <td className="px-2 py-1">{e.provided ? "Yes" : "No"}</td>
                <td className="px-2 py-1">{e.authority}</td>
                <td className="px-2 py-1">{e.freshness}</td>
                <td className="px-2 py-1">{e.owner}</td>
                <td className="px-2 py-1">{e.qualityScore || "—"}</td>
                <td className="px-2 py-1"><Pill label={e.status} tone={intakeTone(e.status)} /></td>
                <td className="px-2 py-1">
                  <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onOpen(e)}>Open Evidence</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1.5 text-[10.5px] text-slate-400">Add Evidence and Request Evidence become available in Prompt 2.</p>
    </Panel>
  );
}

/* ------------------------------------------------------------ gaps panel ---- */

export function GapsPanel({ rows, onOpenWorkbench, loading }: {
  rows: CognitiveIntakeGap[]; onOpenWorkbench: (g: CognitiveIntakeGap) => void; loading: boolean;
}) {
  return (
    <Panel id="panel-gaps" title="Intake Clarification &amp; Gaps"
      subtitle="Missing information, ambiguity, unsupported assumptions, and unresolved ownership">
      <div className="grid gap-1.5 sm:grid-cols-4 xl:grid-cols-8">
        {gapSummary.map((g) => (
          <div key={g.label} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="text-[10px] text-slate-500">{g.label}</p>
            <p className="text-[16px] font-semibold text-slate-900">{g.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 overflow-x-auto">
        {loading ? <PanelSkeleton rows={5} /> : (
          <table className="w-full border-collapse text-[11px]">
            <thead className="bg-slate-50">
              <tr>
                {["Intake", "Gap Type", "Question", "Severity", "Required Next", "Assigned To", "Due", "Impact", "Status", ""].map((h) => (
                  <th key={h} scope="col" className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-2 py-1 font-medium text-slate-800">{g.intakeId}</td>
                  <td className="px-2 py-1">{g.gapType}</td>
                  <td className="px-2 py-1">{g.question}</td>
                  <td className="px-2 py-1"><Pill label={g.severity} tone={intakeTone(g.severity)} /></td>
                  <td className="px-2 py-1">{g.requiredForNextStage ? "Yes" : "No"}</td>
                  <td className="px-2 py-1">{g.assignedTo}</td>
                  <td className="px-2 py-1">{g.dueDate}</td>
                  <td className="px-2 py-1 text-slate-600">{g.impact}</td>
                  <td className="px-2 py-1"><Pill label={g.status} tone={intakeTone(g.status)} /></td>
                  <td className="px-2 py-1">
                    <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenWorkbench(g)}>Open Workbench</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-1.5 text-[10.5px] text-slate-400">Clarification requests and responses are delivered in Prompt 2.</p>
    </Panel>
  );
}

/* ------------------------------------------------------------ related work -- */

export function RelatedWorkPanel({ rows, onToggle, onOpen }: {
  rows: CognitiveIntakeRelatedWork[];
  onToggle: (r: CognitiveIntakeRelatedWork) => void;
  onOpen: (r: CognitiveIntakeRelatedWork) => void;
}) {
  return (
    <Panel id="panel-related" title="Related Work &amp; Prior Context"
      subtitle="Prior decisions, outcomes, evaluations, and adjacent intakes for the selected work">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="bg-slate-50">
            <tr>
              {["Record", "Type", "Relationship", "Similarity", "Date", "Owner", "Outcome", "Relevance", "Potential Duplicate", "Context", ""].map((h) => (
                <th key={h} scope="col" className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-2 py-1 font-medium text-slate-800">{r.relatedRecordId}</td>
                <td className="px-2 py-1">{r.relatedRecordType}</td>
                <td className="px-2 py-1">{r.relationshipType}</td>
                <td className="px-2 py-1">{r.similarity}%</td>
                <td className="px-2 py-1">{r.date}</td>
                <td className="px-2 py-1">{r.owner}</td>
                <td className="px-2 py-1">{r.outcome}</td>
                <td className="px-2 py-1"><Pill label={r.relevance} tone={intakeTone(r.relevance)} /></td>
                <td className="px-2 py-1">{r.potentialDuplicate ? <Pill label="Possible duplicate" tone="amber" /> : "No"}</td>
                <td className="px-2 py-1"><Pill label={r.included ? "Included" : "Excluded"} tone={r.included ? "green" : "slate"} /></td>
                <td className="px-2 py-1">
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onOpen(r)}>Open</Button>
                    <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onToggle(r)}>
                      {r.included ? "Exclude Context" : "Include Context"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------- package completeness ---- */

export function PackageCompletenessPanel({ input, onNextStage }: {
  input: PackageCompletenessInput; onNextStage: () => void;
}) {
  const dims = completenessDimensions(input);
  const overall = overallCompleteness(input);
  const ready = overall >= 90;
  return (
    <Panel id="panel-completeness" title="Intake Package Completeness"
      subtitle="Structural completeness of the assembled Intake Package. This is not a Cognitive Readiness score."
      actions={<Pill label={`${overall}% complete`} tone={ready ? "green" : overall >= 75 ? "amber" : "red"} />}>
      <div className="grid gap-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
          {dims.map((d) => (
            <div key={d.id} className="rounded-lg border border-slate-200 bg-white p-2">
              <p className="text-[10.5px] text-slate-500">{d.label}</p>
              <p className="text-[17px] font-semibold text-slate-900">{d.value}%</p>
              <Progress value={d.value} className="mt-1 h-1.5" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Next Stage</p>
          <p className="text-[13px] font-semibold text-slate-900">{nextStage.name}</p>
          <p className="mt-1 text-[11px] text-slate-600">{nextStage.description}</p>
          <Button size="sm" className="mt-2 h-7 text-[11px]" disabled={!ready} onClick={onNextStage}>
            {ready ? "Route to Cognitive Readiness" : "Available after Intake Package completion"}
          </Button>
          <p className="mt-1 text-[10px] text-slate-400">
            Routing is implemented in Prompt 2. Cognitive Intake does not produce readiness scores, impact scores, or approvals.
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------- activity ----- */

export function ActivityPanel({ onOpen }: { onOpen: (intakeId: string) => void }) {
  return (
    <Panel id="panel-activity" title="Recent Intake Activity" subtitle="Audited events across the Cognitive Intake lifecycle">
      <MiniTable head={["Time", "Intake", "Action", "Description", "Result", "Owner", "Audit"]}
        rows={intakeActivityRows()} onRow={(i) => onOpen(intakeActivityIds()[i])} />
    </Panel>
  );
}

import { activities as seedActivities } from "./data";
const intakeActivityRows = () => seedActivities.map((a) => [
  a.timestamp, a.intakeId, a.action, a.description,
  <Pill key={a.id} label={a.result} tone={a.result === "Success" ? "green" : a.result === "Warning" ? "amber" : "red"} />,
  a.owner, a.auditId,
]);
const intakeActivityIds = () => seedActivities.map((a) => a.intakeId);
