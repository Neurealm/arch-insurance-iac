/** Persona Validation — panels. Reuses ECF shell primitives and Persona Library components. */

import { Fragment, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Pill, type Tone } from "../persona-studio/primitives";
import { Panel, EmptyState, PanelSkeleton } from "../persona-library/panels";
import {
  approvalChain, approvalFactors, conflictSummary, dependencyValidations, downstreamConsumers,
  downstreamMetrics, downstreamReasons, evidenceMetrics, evidenceValidationRows, gapSummary,
  lifecycleCallouts, qualityMetrics, sectionMatrix, thinkingCategories, validationConflicts,
  validationGaps, validationHistory, validationStages,
  type ApprovalStage, type QualityMetric, type ValidationActivity, type ValidationConflict,
  type ValidationGap, type ValidationKpi, type ValidationReview, type ValidationStage, type ValidationView,
} from "./data";

export { Panel, EmptyState, PanelSkeleton };

export type Density = "compact" | "standard" | "comfortable";

export const validationTone = (s: string): Tone =>
  ["Approved", "Complete", "Published", "Validated", "Confirmed", "Healthy", "Within SLA", "Running", "Resolved", "Current", "Not required"].includes(s) ? "green"
    : ["Pending", "In Review", "Review Required", "Awaiting Approval", "Conflict Review", "Partial", "At risk", "Aging", "Warning", "Approved with Conditions", "Reopened", "Evidence Required", "Dependency Review", "In Progress", "Medium", "Scheduled"].includes(s) ? "amber"
      : ["Blocked", "Rejected", "Conflict", "Breached", "Critical", "High", "Overdue", "Stale", "Open"].includes(s) ? "red"
        : ["Not Started", "Idle", "Low", "Draft", "None", "Unassigned"].includes(s) ? "slate" : "blue";

const pad = (d: Density) => (d === "compact" ? "py-1" : d === "comfortable" ? "py-2.5" : "py-1.5");

/* --------------------------------- KPI row --------------------------------- */

export function ValidationKpiCard({ kpi, onClick, spotlight, valueOverride }: {
  kpi: ValidationKpi; onClick: () => void; spotlight?: boolean; valueOverride?: string;
}) {
  const tone = kpi.status === "Healthy" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : kpi.status === "Attention" ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-red-200 bg-red-50 text-red-700";
  const last = kpi.trend[kpi.trend.length - 1];
  const prev = kpi.trend[kpi.trend.length - 2] ?? last;
  const max = Math.max(...kpi.trend, 1);
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button" onClick={onClick}
            className={cn(
              "w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-blue-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              spotlight && "ring-2 ring-blue-500 ring-offset-2",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-medium leading-tight text-slate-600">{kpi.name}</span>
              <span className={cn("rounded border px-1.5 py-0.5 text-[9.5px] font-semibold", tone)}>{kpi.status}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[21px] font-bold text-slate-900">{valueOverride ?? kpi.value}</span>
              {kpi.target && <span className="text-[10px] text-slate-500">{kpi.target}</span>}
            </div>
            <p className="text-[10.5px] text-slate-500">{kpi.context}</p>
            <ul className="mt-1.5 space-y-0.5">
              {kpi.supporting.map((s) => (
                <li key={s.label} className="flex justify-between text-[10px] text-slate-600">
                  <span>{s.label}</span><span className="font-medium text-slate-800">{s.value}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-end gap-[2px]" aria-hidden>
              {kpi.trend.map((v, i) => (
                <span key={i} className="w-full rounded-sm bg-blue-200" style={{ height: `${Math.max(3, (v / max) * 18)}px` }} />
              ))}
            </div>
            <p className="mt-1 text-[9.5px] text-slate-500">
              {last <= prev ? "Improving over 8 periods" : "Increasing over 8 periods"}
            </p>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[260px] text-[11px]">{kpi.tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* -------------------------------- lifecycle -------------------------------- */

export function LifecyclePanel({ selected, onSelect, spotlight, focus, onFocus }: {
  selected: string; onSelect: (id: string) => void; spotlight?: boolean;
  focus: "all" | "warnings" | "blocked" | "overdue" | "downstream"; onFocus: (f: "all" | "warnings" | "blocked" | "overdue" | "downstream") => void;
}) {
  const [zoom, setZoom] = useState(1);
  const stages = useMemo(() => validationStages.filter((s) =>
    focus === "all" ? true
      : focus === "warnings" ? s.warnings > 0
        : focus === "blocked" ? s.status === "Review Required" || s.status === "Blocked"
          : focus === "overdue" ? s.sla !== "Within SLA"
            : s.pending > 0), [focus]);
  return (
    <Panel
      id="panel-lifecycle" title="Persona Validation Lifecycle" spotlight={spotlight}
      subtitle="Eleven governed stages between Persona construction and enterprise publication"
      actions={
        <div className="flex flex-wrap items-center gap-1">
          {(["all", "warnings", "blocked", "overdue", "downstream"] as const).map((f) => (
            <Button key={f} size="sm" variant={focus === f ? "default" : "outline"} className="h-6 text-[10.5px] capitalize"
              onClick={() => onFocus(f)}>
              {f === "all" ? "All stages" : f === "warnings" ? "Focus warnings" : f === "blocked" ? "Show blocked" : f === "overdue" ? "Show overdue" : "Downstream"}
            </Button>
          ))}
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))} aria-label="Zoom in lifecycle">+</Button>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => setZoom(1)}>Zoom to fit</Button>
          <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => { setZoom(1); onFocus("all"); }}>Reset view</Button>
        </div>
      }
    >
      {stages.length === 0 ? (
        <EmptyState message="No lifecycle stages match this focus." actionLabel="Show all stages" onAction={() => onFocus("all")} />
      ) : (
        <ol className="flex flex-col gap-1.5 lg:flex-row lg:flex-wrap" style={{ fontSize: `${zoom}rem` }}>
          {stages.map((s) => (
            <li key={s.id} className="lg:flex-1 lg:min-w-[160px]">
              <button
                type="button" onClick={() => onSelect(s.id)}
                aria-current={selected === s.id ? "step" : undefined}
                title={`${s.name}. ${s.note}`}
                className={cn(
                  "h-full w-full rounded-lg border p-2 text-left transition hover:border-blue-400 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  selected === s.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-semibold text-slate-500">{s.index}</span>
                  <Pill label={s.status} tone={validationTone(s.status)} />
                </div>
                <div className="mt-0.5 text-[11.5px] font-semibold leading-tight text-slate-900">{s.name}</div>
                <dl className="mt-1 space-y-0.5 text-[10px] text-slate-600">
                  <div className="flex justify-between"><dt>Processed</dt><dd className="font-medium">{s.processed}</dd></div>
                  <div className="flex justify-between"><dt>Pending</dt><dd className="font-medium">{s.pending}</dd></div>
                  <div className="flex justify-between"><dt>Success</dt><dd className="font-medium">{s.successRate}%</dd></div>
                  <div className="flex justify-between"><dt>Avg / P95</dt><dd className="font-medium">{s.avgDuration} / {s.p95Duration}</dd></div>
                  <div className="flex justify-between"><dt>Warnings</dt><dd className="font-medium">{s.warnings}</dd></div>
                  <div className="flex justify-between"><dt>Failures</dt><dd className="font-medium">{s.failures}</dd></div>
                  <div className="flex justify-between"><dt>Queue</dt><dd className="font-medium">{s.queue}</dd></div>
                  <div className="flex justify-between"><dt>Owner</dt><dd className="font-medium">{s.owner}</dd></div>
                </dl>
                <div className="mt-1"><Pill label={s.sla} tone={validationTone(s.sla)} /></div>
              </button>
            </li>
          ))}
        </ol>
      )}
      <ul className="mt-2 grid gap-1 md:grid-cols-2 xl:grid-cols-4">
        {lifecycleCallouts.map((c) => (
          <li key={c.text} className="flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10.5px] text-slate-700">
            <Pill label={c.tone === "red" ? "Blocked" : c.tone === "amber" ? "Attention" : "Healthy"} tone={c.tone} />
            <span>{c.text}</span>
          </li>
        ))}
      </ul>
      <p className="sr-only">
        Lifecycle summary: {validationStages.map((s) => `${s.name} is ${s.status} with ${s.pending} pending`).join(". ")}.
      </p>
    </Panel>
  );
}

/* ---------------------------- selected stage panel -------------------------- */

const stageTabs = ["Overview", "Queue", "Conflicts", "Gaps", "Evidence", "Dependencies", "Outputs", "Configuration"] as const;
type StageTab = typeof stageTabs[number];

export function SelectedStagePanel({ stage, reviews, onOpenReview, spotlight }: {
  stage: ValidationStage; reviews: ValidationReview[]; onOpenReview: (r: ValidationReview) => void; spotlight?: boolean;
}) {
  const [tab, setTab] = useState<StageTab>("Overview");
  return (
    <Panel
      id="panel-selected-stage" title="Selected Validation Stage" subtitle={`${stage.name} — ${stage.note}`} spotlight={spotlight}
      actions={<Pill label={stage.status} tone={validationTone(stage.status)} />}
    >
      <dl className="grid grid-cols-2 gap-1.5 md:grid-cols-3 xl:grid-cols-9">
        {[
          ["Stage Status", stage.status], ["Personas Processing", String(stage.queue)],
          ["Open Reviews", String(stage.pending)], ["Completed Today", String(Math.round(stage.processed / 8))],
          ["Average Duration", stage.avgDuration], ["P95 Duration", stage.p95Duration],
          ["Success Rate", `${stage.successRate}%`], ["SLA", stage.sla], ["Owner", stage.owner],
        ].map(([k, v]) => (
          <div key={k} className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
            <dt className="text-[9.5px] uppercase tracking-wide text-slate-500">{k}</dt>
            <dd className="text-[11.5px] font-semibold text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>
      <div role="tablist" aria-label="Selected stage detail" className="mt-2 flex flex-wrap gap-1 border-b border-slate-200 pb-1">
        {stageTabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-2 overflow-x-auto">
        {tab === "Overview" && (
          <p className="text-[11.5px] text-slate-700">
            {stage.note} Owner {stage.owner}. {stage.warnings} warnings and {stage.failures} failures recorded. SLA state {stage.sla}.
          </p>
        )}
        {tab === "Queue" && (
          <MiniTable
            head={["Review ID", "Persona", "Section", "Issue", "Priority", "Reviewer", "Age", "Due", "Status"]}
            rows={reviews.map((r) => [r.id, r.persona, r.sectionId, r.reason, r.priority, r.reviewer, r.age, r.due,
              <Pill key={r.id} label={r.status} tone={validationTone(r.status)} />])}
            onRow={(i) => onOpenReview(reviews[i])}
          />
        )}
        {tab === "Conflicts" && (
          <MiniTable
            head={["Persona", "Section", "Conflict Type", "Record A", "Record B", "Authority", "Confidence", "Severity", "Downstream", "Status"]}
            rows={validationConflicts.map((c) => [c.persona, c.section, c.conflictType, c.recordA, c.recordB,
              `${c.authorityA} / ${c.authorityB}`, `${c.confidenceA}% / ${c.confidenceB}%`, c.severity, c.downstreamImpact,
              <Pill key={c.id} label={c.status} tone={validationTone(c.status)} />])}
          />
        )}
        {tab === "Gaps" && (
          <MiniTable
            head={["Persona", "Section", "Missing Information", "Evidence Requirement", "Owner", "Quality Impact", "Recommended Action"]}
            rows={validationGaps.map((g) => [g.persona, g.section, g.missing, g.requiredForApproval ? "Required for approval" : "Advisory", g.owner, g.qualityImpact, g.recommendedAction])}
          />
        )}
        {tab === "Evidence" && (
          <MiniTable
            head={["Persona Section", "Condition", "Source Artifact", "Exact Evidence", "Authority", "Confidence", "Freshness"]}
            rows={evidenceValidationRows.map((e) => [`${e.persona} · ${e.section}`, e.condition, e.artifact, e.passage, e.authority, `${e.confidence}%`, e.freshness])}
          />
        )}
        {tab === "Dependencies" && (
          <MiniTable
            head={["Persona", "Dependency", "Dependency Owner", "Validation State", "Criticality", "Evidence"]}
            rows={dependencyValidations.map((d) => [d.persona, d.dependency, d.dependencyTeam, d.validationState, d.criticality, d.evidence])}
          />
        )}
        {tab === "Outputs" && (
          <MiniTable
            head={["Output", "Count", "Destination"]}
            rows={[
              ["Approved Sections", "312", "Persona draft"], ["Review Tasks", "27", "Validation queue"],
              ["Conflict Resolutions", "18", "Audit log"], ["Gap Records", "17", "Gap analysis"],
              ["Approval Requests", "14", "Approval chain"], ["Persona Versions", "9", "Version validation"],
            ]}
          />
        )}
        {tab === "Configuration" && (
          <MiniTable
            head={["Setting", "Value"]}
            rows={[
              ["Primary evidence required", "Critical sections"], ["Team owner approval", "Required"],
              ["Dependency owner approval", "Critical dependencies"], ["Governance approval", "Critical Personas"],
              ["Stale evidence window", "180 days"], ["Escalation after", "2 business days"],
            ]}
          />
        )}
      </div>
    </Panel>
  );
}

export function MiniTable({ head, rows, onRow }: {
  head: string[]; rows: React.ReactNode[][]; onRow?: (index: number) => void;
}) {
  if (rows.length === 0) return <EmptyState message="No records for this view." />;
  return (
    <table className="w-full min-w-[720px] border-collapse text-[11px]">
      <thead>
        <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
          {head.map((h) => <th key={h} scope="col" className="px-2 py-1 font-medium">{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((r, i) => (
          <tr key={i} className={cn(onRow && "cursor-pointer hover:bg-slate-50")}
            onClick={onRow ? () => onRow(i) : undefined}>
            {r.map((c, j) => <td key={j} className="max-w-[280px] px-2 py-1 align-top text-slate-700">{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ----------------------------- validation queue ---------------------------- */

export const queueColumns: Record<ValidationView, { key: string; label: string; get: (r: ValidationReview) => React.ReactNode; sort?: (r: ValidationReview) => string | number }[]> = {
  "review-queue": [
    { key: "id", label: "Review ID", get: (r) => <span className="font-mono">{r.id}</span>, sort: (r) => r.id },
    { key: "persona", label: "Persona", get: (r) => <span className="font-medium text-slate-900">{r.persona}</span>, sort: (r) => r.persona },
    { key: "team", label: "Team", get: (r) => r.team, sort: (r) => r.team },
    { key: "reviewType", label: "Review Type", get: (r) => r.reviewType, sort: (r) => r.reviewType },
    { key: "reason", label: "Reason", get: (r) => r.reason },
    { key: "priority", label: "Priority", get: (r) => <Pill label={r.priority} tone={validationTone(r.priority)} />, sort: (r) => r.priority },
    { key: "stage", label: "Current Stage", get: (r) => r.currentStage, sort: (r) => r.currentStage },
    { key: "reviewer", label: "Assigned Reviewer", get: (r) => r.reviewer, sort: (r) => r.reviewer },
    { key: "quality", label: "Quality", get: (r) => r.quality, sort: (r) => r.quality },
    { key: "completeness", label: "Completeness", get: (r) => `${r.completeness}%`, sort: (r) => r.completeness },
    { key: "confidence", label: "Confidence", get: (r) => `${r.confidence}%`, sort: (r) => r.confidence },
    { key: "evidence", label: "Evidence Coverage", get: (r) => `${r.evidenceCoverage}%`, sort: (r) => r.evidenceCoverage },
    { key: "conflicts", label: "Conflicts", get: (r) => r.conflicts, sort: (r) => r.conflicts },
    { key: "due", label: "Due", get: (r) => <span className={cn(r.overdue && "font-semibold text-red-700")}>{r.due}</span>, sort: (r) => r.due },
    { key: "age", label: "Age", get: (r) => r.age, sort: (r) => r.age },
    { key: "downstream", label: "Downstream Impact", get: (r) => r.downstreamImpact },
    { key: "status", label: "Status", get: (r) => <Pill label={r.status} tone={validationTone(r.status)} />, sort: (r) => r.status },
  ],
  workbench: [
    { key: "id", label: "Review ID", get: (r) => <span className="font-mono">{r.id}</span>, sort: (r) => r.id },
    { key: "persona", label: "Persona", get: (r) => r.persona, sort: (r) => r.persona },
    { key: "section", label: "Section", get: (r) => r.sectionId },
    { key: "reason", label: "Issue", get: (r) => r.reason },
    { key: "conflicts", label: "Conflicts", get: (r) => r.conflicts, sort: (r) => r.conflicts },
    { key: "evidence", label: "Evidence Coverage", get: (r) => `${r.evidenceCoverage}%`, sort: (r) => r.evidenceCoverage },
    { key: "reviewer", label: "Reviewer", get: (r) => r.reviewer, sort: (r) => r.reviewer },
    { key: "status", label: "Status", get: (r) => <Pill label={r.status} tone={validationTone(r.status)} />, sort: (r) => r.status },
  ],
  governance: [
    { key: "id", label: "Review ID", get: (r) => <span className="font-mono">{r.id}</span>, sort: (r) => r.id },
    { key: "persona", label: "Persona", get: (r) => r.persona, sort: (r) => r.persona },
    { key: "approvalStage", label: "Approval Stage", get: (r) => r.approvalStage, sort: (r) => r.approvalStage },
    { key: "authority", label: "Authority", get: (r) => r.authorityLevel, sort: (r) => r.authorityLevel },
    { key: "access", label: "Access", get: (r) => r.accessClassification, sort: (r) => r.accessClassification },
    { key: "teamOwner", label: "Team Owner", get: (r) => r.teamOwner, sort: (r) => r.teamOwner },
    { key: "version", label: "Version Status", get: (r) => r.versionStatus, sort: (r) => r.versionStatus },
    { key: "status", label: "Status", get: (r) => <Pill label={r.status} tone={validationTone(r.status)} />, sort: (r) => r.status },
  ],
  "portfolio-risk": [
    { key: "persona", label: "Persona", get: (r) => r.persona, sort: (r) => r.persona },
    { key: "risk", label: "Risk Level", get: (r) => <Pill label={r.riskLevel} tone={validationTone(r.riskLevel)} />, sort: (r) => r.riskLevel },
    { key: "overdue", label: "Overdue", get: (r) => (r.overdue ? "Yes" : "No"), sort: (r) => (r.overdue ? 1 : 0) },
    { key: "conflicts", label: "Conflicts", get: (r) => r.conflicts, sort: (r) => r.conflicts },
    { key: "quality", label: "Quality", get: (r) => r.quality, sort: (r) => r.quality },
    { key: "downstream", label: "Downstream Impact", get: (r) => r.downstreamImpact },
    { key: "status", label: "Status", get: (r) => <Pill label={r.status} tone={validationTone(r.status)} />, sort: (r) => r.status },
  ],
};

export function ValidationQueuePanel({
  rows, view, density, onDensity, selected, onToggle, onToggleAll, onOpen, search, onSearch,
  hiddenColumns, onToggleColumn, onExport, savedViews, savedView, onSavedView, onSaveView,
  onBulk, loading, error, onRetry, spotlight,
}: {
  rows: ValidationReview[]; view: ValidationView; density: Density; onDensity: (d: Density) => void;
  selected: Set<string>; onToggle: (id: string) => void; onToggleAll: () => void;
  onOpen: (r: ValidationReview) => void; search: string; onSearch: (v: string) => void;
  hiddenColumns: Set<string>; onToggleColumn: (k: string) => void; onExport: () => void;
  savedViews: string[]; savedView: string; onSavedView: (v: string) => void; onSaveView: () => void;
  onBulk: () => void; loading?: boolean; error?: boolean; onRetry: () => void; spotlight?: boolean;
}) {
  const [sortKey, setSortKey] = useState("id");
  const [asc, setAsc] = useState(true);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showColumns, setShowColumns] = useState(false);
  const perPage = 5;

  const columns = queueColumns[view].filter((c) => !hiddenColumns.has(c.key));
  const sorted = useMemo(() => {
    const col = queueColumns[view].find((c) => c.key === sortKey);
    if (!col?.sort) return rows;
    return [...rows].sort((a, b) => {
      const av = col.sort!(a); const bv = col.sort!(b);
      return (av > bv ? 1 : av < bv ? -1 : 0) * (asc ? 1 : -1);
    });
  }, [rows, sortKey, asc, view]);
  const pages = Math.max(1, Math.ceil(sorted.length / perPage));
  const current = Math.min(page, pages - 1);
  const visible = sorted.slice(current * perPage, current * perPage + perPage);

  return (
    <Panel
      id="panel-queue" title="Persona Validation Queue" spotlight={spotlight}
      subtitle={`${rows.length} reviews match the current filters`}
      actions={
        <div className="flex flex-wrap items-center gap-1.5">
          <label className="sr-only" htmlFor="queue-saved-view">Saved Views</label>
          <select id="queue-saved-view" value={savedView} onChange={(e) => onSavedView(e.target.value)}
            className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px] text-slate-700">
            {savedViews.map((v) => <option key={v}>{v}</option>)}
          </select>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onSaveView}>Save View</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setShowColumns((s) => !s)} aria-expanded={showColumns}>Columns</Button>
          <label className="sr-only" htmlFor="queue-density">Density</label>
          <select id="queue-density" value={density} onChange={(e) => onDensity(e.target.value as Density)}
            className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px] text-slate-700">
            <option value="compact">compact</option><option value="standard">standard</option><option value="comfortable">comfortable</option>
          </select>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onExport}>Export Current View</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onBulk} disabled={selected.size === 0}>Bulk Actions</Button>
        </div>
      }
    >
      {showColumns && (
        <fieldset className="mb-2 flex flex-wrap gap-2 rounded border border-slate-200 bg-slate-50 p-2">
          <legend className="px-1 text-[10px] uppercase tracking-wide text-slate-500">Column visibility</legend>
          {queueColumns[view].map((c) => (
            <label key={c.key} className="flex items-center gap-1 text-[11px] text-slate-700">
              <input type="checkbox" checked={!hiddenColumns.has(c.key)} onChange={() => onToggleColumn(c.key)} />
              {c.label}
            </label>
          ))}
        </fieldset>
      )}
      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search" value={search} onChange={(e) => { onSearch(e.target.value); setPage(0); }}
          placeholder="Search reviews, Personas, reviewers, reasons"
          aria-label="Search reviews"
          className="h-8 w-full rounded-md border border-slate-200 pl-7 pr-2 text-[12px] text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {loading ? <PanelSkeleton rows={5} />
        : error ? <EmptyState message="Validation queue could not be loaded." actionLabel="Retry" onAction={onRetry} />
          : rows.length === 0 ? <EmptyState message="No reviews match the current filters. Clear filters or start a validation run." actionLabel="Retry with cleared search" onAction={() => onSearch("")} />
            : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[1100px] border-collapse text-[11.5px]">
                    <caption className="sr-only">Persona validation queue</caption>
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
                        <th scope="col" className="px-2 py-1">
                          <input type="checkbox" aria-label="Select all reviews" checked={selected.size === rows.length && rows.length > 0} onChange={onToggleAll} />
                        </th>
                        {columns.map((c) => (
                          <th key={c.key} scope="col" className="px-2 py-1 font-medium">
                            {c.sort ? (
                              <button type="button" className="flex items-center gap-1 hover:text-blue-700"
                                onClick={() => { setSortKey(c.key); setAsc(c.key === sortKey ? !asc : true); }}
                                aria-label={`Sort by ${c.label}`}>
                                {c.label}{sortKey === c.key && <span aria-hidden>{asc ? "▲" : "▼"}</span>}
                              </button>
                            ) : c.label}
                          </th>
                        ))}
                        <th scope="col" className="px-2 py-1 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visible.map((r) => (
                        <Fragment key={r.id}>
                          <tr className="cursor-pointer hover:bg-slate-50" onClick={() => onOpen(r)}>
                            <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" aria-label={`Select ${r.id}`} checked={selected.has(r.id)} onChange={() => onToggle(r.id)} />
                            </td>
                            {columns.map((c) => (
                              <td key={c.key} className={cn("max-w-[240px] px-2 align-top text-slate-700", pad(density))}>{c.get(r)}</td>
                            ))}
                            <td className={cn("whitespace-nowrap px-2", pad(density))} onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onOpen(r)}>Open</Button>
                                <Button size="sm" variant="ghost" className="h-6 text-[10.5px]"
                                  aria-label={`Toggle summary for ${r.id}`}
                                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                                  {expanded === r.id ? <ChevronUp className="h-3 w-3" aria-hidden /> : <ChevronDown className="h-3 w-3" aria-hidden />}
                                </Button>
                              </div>
                            </td>
                          </tr>
                          {expanded === r.id && (
                            <tr className="bg-slate-50">
                              <td colSpan={columns.length + 2} className="px-3 py-2 text-[11px] text-slate-600">
                                <strong className="text-slate-800">{r.persona}</strong> — {r.reason}. Approval stage {r.approvalStage}, dependency team {r.dependencyTeam},
                                access {r.accessClassification}, freshness {r.freshness}. Downstream impact: {r.downstreamImpact}.
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ul className="space-y-1.5 md:hidden">
                  {visible.map((r) => (
                    <li key={r.id}>
                      <button type="button" onClick={() => onOpen(r)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-semibold text-slate-900">{r.persona}</span>
                          <Pill label={r.status} tone={validationTone(r.status)} />
                        </div>
                        <p className="text-[11px] text-slate-600">{r.reason}</p>
                        <p className="mt-0.5 text-[10.5px] text-slate-500">{r.id} · {r.reviewType} · Due {r.due} · Reviewer {r.reviewer}</p>
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                  <span>{selected.size} selected · page {current + 1} of {pages}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={current === 0} onClick={() => setPage(current - 1)}>Previous</Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>Next</Button>
                  </div>
                </div>
              </>
            )}
    </Panel>
  );
}

/* ------------------------------ section matrix ----------------------------- */

export function SectionMatrixPanel({ onCell, spotlight }: {
  onCell: (sectionId: string, issue: string) => void; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-matrix" title="Persona Section Validation Matrix" spotlight={spotlight}
      subtitle="Section level validation state for the selected Persona">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-[11px]">
          <caption className="sr-only">Persona section validation matrix</caption>
          <thead>
            <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
              {["Section", "Completeness", "Evidence Coverage", "Authority", "Confidence", "Freshness", "Owner Validation", "Dependency Validation", "Conflict State", "Review State", "Status"].map((h) => (
                <th key={h} scope="col" className="px-2 py-1 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sectionMatrix.map((row) => (
              <tr key={row.section} className="hover:bg-slate-50">
                <th scope="row" className="px-2 py-1 text-left font-medium text-slate-800">{row.section}</th>
                {[
                  [`${row.completeness}%`, "Completeness"], [`${row.evidenceCoverage}%`, "Evidence Coverage"],
                  [row.authority, "Authority"], [`${row.confidence}%`, "Confidence"], [row.freshness, "Freshness"],
                  [row.ownerValidation, "Owner Validation"], [row.dependencyValidation, "Dependency Validation"],
                  [row.conflictState, "Conflict State"], [row.reviewState, "Review State"], [row.status, "Status"],
                ].map(([value, label]) => (
                  <td key={label} className="px-2 py-1">
                    <button type="button" onClick={() => onCell(row.sectionId, `${label}: ${value}`)}
                      aria-label={`Open ${row.section} ${label} ${value}`}
                      className="rounded px-1 py-0.5 text-left hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      {["Freshness", "Owner Validation", "Dependency Validation", "Conflict State", "Review State", "Status"].includes(label)
                        ? <Pill label={value} tone={validationTone(value)} />
                        : <span className="text-slate-700">{value}</span>}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---------------------------- conflict analysis ---------------------------- */

export function ConflictPanel({ conflicts, activeType, onType, onAction, spotlight }: {
  conflicts: ValidationConflict[]; activeType: string; onType: (t: string) => void;
  onAction: (action: string, conflict: ValidationConflict) => void; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-conflicts" title="Persona Conflict Analysis" spotlight={spotlight}
      subtitle="Contradictions between conditions, owners, thresholds, policies and applicability">
      <ul className="mb-2 flex flex-wrap gap-1.5">
        {conflictSummary.map((s) => (
          <li key={s.label}>
            <button type="button" onClick={() => onType(activeType === s.type ? "All" : s.type)}
              aria-pressed={activeType === s.type}
              className={cn("rounded border px-2 py-1 text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                activeType === s.type ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300")}>
              {s.label} <span className="font-semibold">{s.value}</span>
            </button>
          </li>
        ))}
      </ul>
      {conflicts.length === 0 ? <EmptyState message="No conflicts match this type. Clear the conflict type filter to see all." actionLabel="Clear conflict type" onAction={() => onType("All")} /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-[11px]">
            <caption className="sr-only">Persona conflict analysis</caption>
            <thead>
              <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
                {["Persona", "Section", "Conflict Type", "Record A", "Record B", "Authority A", "Authority B", "Confidence A", "Confidence B", "Severity", "Affected Teams", "Downstream Impact", "Recommended Resolution", "Status", "Actions"].map((h) => (
                  <th key={h} scope="col" className="px-2 py-1 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {conflicts.map((c) => (
                <tr key={c.id} className="align-top hover:bg-slate-50">
                  <td className="px-2 py-1 font-medium text-slate-900">{c.persona}</td>
                  <td className="px-2 py-1">{c.section}</td>
                  <td className="px-2 py-1">{c.conflictType}</td>
                  <td className="max-w-[220px] px-2 py-1">{c.recordA}</td>
                  <td className="max-w-[220px] px-2 py-1">{c.recordB}</td>
                  <td className="px-2 py-1">{c.authorityA}</td>
                  <td className="px-2 py-1">{c.authorityB}</td>
                  <td className="px-2 py-1">{c.confidenceA}%</td>
                  <td className="px-2 py-1">{c.confidenceB}%</td>
                  <td className="px-2 py-1"><Pill label={c.severity} tone={validationTone(c.severity)} /></td>
                  <td className="max-w-[180px] px-2 py-1">{c.affectedTeams}</td>
                  <td className="max-w-[180px] px-2 py-1">{c.downstreamImpact}</td>
                  <td className="max-w-[240px] px-2 py-1">{c.recommendedResolution}</td>
                  <td className="px-2 py-1"><Pill label={c.status} tone={validationTone(c.status)} /></td>
                  <td className="px-2 py-1">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAction("Open Comparison", c)}>Open Comparison</Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onAction("Escalate", c)}>Escalate</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/* -------------------------------- gap panel -------------------------------- */

export function GapPanel({ gaps, activeType, onType, onAction, spotlight }: {
  gaps: ValidationGap[]; activeType: string; onType: (t: string) => void;
  onAction: (action: string, gap: ValidationGap) => void; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-gaps" title="Persona Validation Gaps" spotlight={spotlight}
      subtitle="Missing information preventing Persona approval">
      <ul className="mb-2 flex flex-wrap gap-1.5">
        {gapSummary.map((g) => (
          <li key={g.label}>
            <button type="button" onClick={() => onType(activeType === g.type ? "All" : g.type)} aria-pressed={activeType === g.type}
              className={cn("rounded border px-2 py-1 text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                activeType === g.type ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300")}>
              {g.label} <span className="font-semibold">{g.value}</span>
            </button>
          </li>
        ))}
      </ul>
      {gaps.length === 0 ? <EmptyState message="No gaps match this type." actionLabel="Clear gap type" onAction={() => onType("All")} /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-[11px]">
            <caption className="sr-only">Persona validation gaps</caption>
            <thead>
              <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
                {["Persona", "Section", "Gap Type", "Missing Information", "Severity", "Owner", "Quality Impact", "Downstream Impact", "Recommended Action", "Due", "Status", "Actions"].map((h) => (
                  <th key={h} scope="col" className="px-2 py-1 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gaps.map((g) => (
                <tr key={g.id} className="align-top hover:bg-slate-50">
                  <td className="px-2 py-1 font-medium text-slate-900">{g.persona}</td>
                  <td className="px-2 py-1">{g.section}</td>
                  <td className="px-2 py-1">{g.gapType}</td>
                  <td className="max-w-[260px] px-2 py-1">{g.missing}</td>
                  <td className="px-2 py-1"><Pill label={g.severity} tone={validationTone(g.severity)} /></td>
                  <td className="px-2 py-1">{g.owner}</td>
                  <td className="px-2 py-1">{g.qualityImpact}</td>
                  <td className="max-w-[200px] px-2 py-1">{g.downstreamImpact}</td>
                  <td className="px-2 py-1">{g.recommendedAction}</td>
                  <td className="px-2 py-1">{g.due}</td>
                  <td className="px-2 py-1"><Pill label={g.status} tone={validationTone(g.status)} /></td>
                  <td className="px-2 py-1">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAction(g.recommendedAction, g)}>{g.recommendedAction}</Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onAction("Accept Known Gap", g)}>Accept</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------ evidence panel ----------------------------- */

export function EvidenceValidationPanel({ onAction, onRow, spotlight }: {
  onAction: (action: string, id: string) => void; onRow: (sectionId: string) => void; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-evidence" title="Persona Evidence Validation" spotlight={spotlight}
      subtitle="Exact evidence supporting each Persona section">
      <ul className="mb-2 grid gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
        {evidenceMetrics.map((m) => (
          <li key={m.label} className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
            <span className="block text-[9.5px] uppercase tracking-wide text-slate-500">{m.label}</span>
            <span className="text-[13px] font-semibold text-slate-900">{m.value}</span>
          </li>
        ))}
      </ul>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-[11px]">
          <caption className="sr-only">Persona evidence validation</caption>
          <thead>
            <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
              {["Persona", "Section", "Condition", "Source Artifact", "Exact Passage", "Authority", "Confidence", "Freshness", "Access Classification", "Status", "Actions"].map((h) => (
                <th key={h} scope="col" className="px-2 py-1 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {evidenceValidationRows.map((e) => (
              <tr key={e.id} className="cursor-pointer align-top hover:bg-slate-50" onClick={() => onRow(e.sectionId)}>
                <td className="px-2 py-1 font-medium text-slate-900">{e.persona}</td>
                <td className="px-2 py-1">{e.section}</td>
                <td className="px-2 py-1 font-mono">{e.condition}</td>
                <td className="max-w-[200px] px-2 py-1">{e.artifact}</td>
                <td className="max-w-[300px] px-2 py-1 italic text-slate-600">“{e.passage}”</td>
                <td className="px-2 py-1">{e.authority}</td>
                <td className="px-2 py-1">{e.confidence}%</td>
                <td className="px-2 py-1"><Pill label={e.freshness} tone={validationTone(e.freshness)} /></td>
                <td className="px-2 py-1">{e.accessClassification}</td>
                <td className="px-2 py-1"><Pill label={e.status} tone={validationTone(e.status)} /></td>
                <td className="px-2 py-1" onClick={(ev) => ev.stopPropagation()}>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAction("Request Evidence", e.id)}>Request Evidence</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onAction("Mark Superseded", e.id)}>Mark Superseded</Button>
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

/* --------------------------- dependency validation ------------------------- */

export function DependencyPanel({ states, onAction, spotlight }: {
  states: Record<string, string>; onAction: (action: string, id: string) => void; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-dependencies" title="Dependency Owner Validation" spotlight={spotlight}
      subtitle="Confirm that teams represented as dependencies agree with the relationship and its criticality">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse text-[11px]">
          <caption className="sr-only">Dependency owner validation</caption>
          <thead>
            <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
              {["Persona", "Dependency Team", "Dependency", "Relationship", "Criticality", "Evidence", "Persona Owner", "Dependency Reviewer", "Due", "Validation State", "Status", "Actions"].map((h) => (
                <th key={h} scope="col" className="px-2 py-1 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dependencyValidations.map((d) => {
              const status = states[d.id] ?? d.status;
              return (
                <tr key={d.id} className="align-top hover:bg-slate-50">
                  <td className="px-2 py-1 font-medium text-slate-900">{d.persona}</td>
                  <td className="px-2 py-1">{d.dependencyTeam}</td>
                  <td className="px-2 py-1">{d.dependency}</td>
                  <td className="px-2 py-1 font-mono text-[10px]">{d.relationship}</td>
                  <td className="px-2 py-1"><Pill label={d.criticality} tone={validationTone(d.criticality)} /></td>
                  <td className="max-w-[200px] px-2 py-1">{d.evidence}</td>
                  <td className="px-2 py-1">{d.personaOwner}</td>
                  <td className="px-2 py-1">{d.dependencyReviewer}</td>
                  <td className="px-2 py-1">{d.due}</td>
                  <td className="px-2 py-1">{d.validationState}</td>
                  <td className="px-2 py-1"><Pill label={status} tone={validationTone(status)} /></td>
                  <td className="px-2 py-1">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAction("Approve Relationship", d.id)}>Approve</Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onAction("Reject Relationship", d.id)}>Reject</Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onAction("Request Correction", d.id)}>Request Correction</Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onAction("Change Criticality", d.id)}>Criticality</Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onAction("Escalate", d.id)}>Escalate</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------ how this team thinks panel ----------------------- */

export function ThinkingPanel({ states, onAction, spotlight }: {
  states: Record<string, string>; onAction: (action: string, categoryId: string) => void; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-thinking" title="How This Team Thinks Validation" spotlight={spotlight}
      subtitle="Payments Platform — priorities, tradeoffs, preferred evidence, escalation philosophy and risk appetite">
      <div className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
        {thinkingCategories.map((c) => {
          const status = states[c.id] ?? c.validationStatus;
          return (
            <article key={c.id} className="rounded-lg border border-slate-200 bg-white p-2">
              <header className="flex items-start justify-between gap-2">
                <h3 className="text-[12px] font-semibold text-slate-900">{c.name}</h3>
                <Pill label={status} tone={validationTone(status)} />
              </header>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-700">
                {c.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
              <dl className="mt-1.5 grid grid-cols-2 gap-1 text-[10px] text-slate-600">
                <div className="flex justify-between"><dt>Evidence Coverage</dt><dd className="font-medium">{c.evidenceCoverage}%</dd></div>
                <div className="flex justify-between"><dt>Conditions</dt><dd className="font-medium">{c.conditionCount}</dd></div>
                <div className="flex justify-between"><dt>Authority</dt><dd className="font-medium">{c.authority}</dd></div>
                <div className="flex justify-between"><dt>Confidence</dt><dd className="font-medium">{c.confidence}%</dd></div>
                <div className="col-span-2 flex justify-between"><dt>Reviewer</dt><dd className="font-medium">{c.reviewer}</dd></div>
              </dl>
              <div className="mt-1.5 flex flex-wrap gap-1">
                <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAction("Approve Section", c.id)}>Approve Section</Button>
                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onAction("Edit", c.id)}>Edit</Button>
                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onAction("Request Evidence", c.id)}>Request Evidence</Button>
                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onAction("Request Team Confirmation", c.id)}>Request Team Confirmation</Button>
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

/* ------------------------------ approval chain ----------------------------- */

export function ApprovalChainPanel({ overrides, onAction, spotlight }: {
  overrides: Record<string, string>; onAction: (action: string, stage: ApprovalStage) => void; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-approval" title="Persona Approval Chain" spotlight={spotlight}
      subtitle="Payments Platform v3.4 Draft — approval routing and required reviewers"
      actions={
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onAction("Submit for Review", approvalChain[2])}>Submit for Review</Button>
          <Button size="sm" className="h-6 text-[10.5px]" onClick={() => onAction("Approve", approvalChain[2])}>Approve</Button>
        </div>
      }
    >
      <ul className="mb-2 grid gap-1 sm:grid-cols-3 xl:grid-cols-6">
        {approvalFactors.map((f) => (
          <li key={f.label} className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
            <span className="block text-[9.5px] uppercase tracking-wide text-slate-500">{f.label}</span>
            <span className="text-[11.5px] font-semibold text-slate-900">{f.value}</span>
          </li>
        ))}
      </ul>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-[11px]">
          <caption className="sr-only">Persona approval chain</caption>
          <thead>
            <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
              {["Stage", "Reviewer", "Status", "Submitted", "Completed", "Due", "Comments", "Conditions", "Actions"].map((h) => (
                <th key={h} scope="col" className="px-2 py-1 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {approvalChain.map((s) => {
              const status = overrides[s.id] ?? s.status;
              return (
                <tr key={s.id} className="align-top hover:bg-slate-50">
                  <th scope="row" className="px-2 py-1 text-left font-medium text-slate-800">{s.name}</th>
                  <td className="px-2 py-1">{s.reviewer}</td>
                  <td className="px-2 py-1"><Pill label={status} tone={validationTone(status)} /></td>
                  <td className="px-2 py-1">{s.submitted}</td>
                  <td className="px-2 py-1">{s.completed}</td>
                  <td className="px-2 py-1">{s.due}</td>
                  <td className="max-w-[240px] px-2 py-1">{s.comments}</td>
                  <td className="px-2 py-1">{s.conditions}</td>
                  <td className="px-2 py-1">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAction("Approve", s)}>Approve</Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onAction("Request Changes", s)}>Request Changes</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---------------------------- validation quality --------------------------- */

export function QualityPanel({ overall, onMetric, spotlight }: {
  overall: string; onMetric: (m: QualityMetric) => void; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-quality" title="Validation Quality" spotlight={spotlight}
      subtitle={`Overall ${overall} against a target of 95`}>
      <ul className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
        {qualityMetrics.map((m) => (
          <li key={m.name}>
            <button type="button" onClick={() => onMetric(m)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-left hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-medium text-slate-700">{m.name}</span>
                <Pill label={m.status} tone={validationTone(m.status)} />
              </div>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-[16px] font-bold text-slate-900">{m.score}</span>
                <span className="text-[10px] text-slate-500">Target {m.target}</span>
                <span className={cn("text-[10px] font-medium", m.score >= m.target ? "text-emerald-700" : "text-amber-700")}>
                  {m.score >= m.target ? "+" : ""}{m.score - m.target}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded bg-slate-100" aria-hidden>
                <div className={cn("h-1.5 rounded", m.score >= m.target ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${m.score}%` }} />
              </div>
              <p className="mt-1 text-[10px] text-slate-500">{m.affected} Personas affected</p>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ---------------------------- downstream impact ---------------------------- */

export function DownstreamPanel({ note, onConsumer, spotlight }: {
  note?: string; onConsumer: (c: string) => void; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-downstream" title="Downstream Validation Impact" spotlight={spotlight}
      subtitle="Consumers waiting for Persona validation to complete">
      <ul className="mb-2 grid gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
        {downstreamMetrics.map((m) => (
          <li key={m.label} className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
            <span className="block text-[9.5px] uppercase tracking-wide text-slate-500">{m.label}</span>
            <span className="text-[14px] font-semibold text-slate-900">{m.value}</span>
          </li>
        ))}
      </ul>
      <div className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
        <strong>Payments Platform</strong> — {note ?? downstreamReasons.join(" · ")}
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[11px]">
          <caption className="sr-only">Downstream consumers</caption>
          <thead>
            <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
              {["Consumer", "Current Persona Version", "Proposed Persona Version", "Impact", "Status"].map((h) => (
                <th key={h} scope="col" className="px-2 py-1 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {downstreamConsumers.map((c) => (
              <tr key={c.consumer} className="cursor-pointer hover:bg-slate-50" onClick={() => onConsumer(c.consumer)}>
                <td className="px-2 py-1 font-medium text-slate-900">{c.consumer}</td>
                <td className="px-2 py-1">{c.currentVersion}</td>
                <td className="px-2 py-1">{c.proposedVersion}</td>
                <td className="max-w-[320px] px-2 py-1">{c.impact}</td>
                <td className="px-2 py-1"><Pill label={c.status} tone={validationTone(c.status)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---------------------------- validation history --------------------------- */

export function HistoryPanel({ spotlight }: { spotlight?: boolean }) {
  return (
    <Panel id="panel-history" title="Validation History" spotlight={spotlight}
      subtitle="Payments Platform — full validation lineage with audit identifiers">
      <ol className="space-y-1">
        {validationHistory.map((h) => (
          <li key={h.id} className="rounded border border-slate-200 bg-white px-2 py-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11.5px] font-semibold text-slate-900">{h.action}</span>
              <span className="font-mono text-[10px] text-slate-500">{h.at} · {h.auditId}</span>
            </div>
            <p className="text-[11px] text-slate-600">
              {h.section} · {h.reviewer} · {h.previousState} → {h.newState}. {h.comments}
            </p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ------------------------------ activity panel ----------------------------- */

export function ActivityPanel({ activity, onOpen, spotlight }: {
  activity: ValidationActivity[]; onOpen: (a: ValidationActivity) => void; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-activity" title="Recent Validation Activity" spotlight={spotlight}
      subtitle="Reviewer decisions, conflicts, approvals and publications">
      <ul className="space-y-1">
        {activity.map((a) => (
          <li key={a.id}>
            <button type="button" onClick={() => onOpen(a)}
              className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-left hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11.5px] font-semibold text-slate-900">{a.action}</span>
                <span className="font-mono text-[10px] text-slate-500">{a.at} · {a.auditId}</span>
              </div>
              <p className="text-[11px] text-slate-600">{a.persona} · {a.section} · {a.reviewer} — {a.result}</p>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* --------------------------- portfolio risk panel -------------------------- */

export function PortfolioRiskPanel({ rows, spotlight }: { rows: ValidationReview[]; spotlight?: boolean }) {
  const overdue = rows.filter((r) => r.overdue).length;
  const blocked = rows.filter((r) => r.status === "Blocked").length;
  const critical = rows.filter((r) => r.priority === "Critical").length;
  return (
    <Panel id="panel-portfolio-risk" title="Portfolio Validation Risk" spotlight={spotlight}
      subtitle="Coverage, overdue reviews, blocked Personas and downstream exposure">
      <ul className="grid gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
        {[
          ["Validation Coverage", "83 percent"], ["Overdue Reviews", String(overdue)],
          ["Personas Blocked", String(blocked)], ["Critical Persona Gaps", String(critical)],
          ["Dependency Conflicts", "4"], ["Downstream Evaluations at Risk", "4"],
        ].map(([k, v]) => (
          <li key={k} className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
            <span className="block text-[9.5px] uppercase tracking-wide text-slate-500">{k}</span>
            <span className="text-[15px] font-semibold text-slate-900">{v}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
