import { useMemo, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import {
  AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, CircleDot, Crosshair, Focus,
  Layers, Maximize2, Network, RotateCcw, ShieldCheck, Target, TriangleAlert, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Panel } from "../command-center/panels";
import { Drawer, Pill, Row, type Density } from "./primitives";
import {
  conditionCoverage, gapCategories, graphEdges, graphNodes, howThisTeamThinks, nf,
  overallQuality, provenanceChain, qualityDimensions, relationshipTypes, throughputSeries,
  type BusinessCondition, type GraphNode, type Kpi, type PersonaConstructionJob,
  type PersonaConstructionStage, type PersonaGap, type PersonaSection, type QualityDimension,
  type TeamPersona, type ViewMode,
} from "./data";

export { Drawer, Pill, Row, FilterSelect, toneFor, type Density } from "./primitives";
export { nf } from "./data";

/* ---------------------------------- KPIs ---------------------------------- */

export function KpiCard({ kpi, onClick, spotlight }: { kpi: Kpi; onClick: () => void; spotlight?: boolean }) {
  const tone =
    kpi.status === "Healthy" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : kpi.status === "Attention" ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-red-200 bg-red-50 text-red-700";
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className={cn(
              "w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-blue-300 hover:shadow",
              spotlight && "ring-2 ring-blue-500 ring-offset-2",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-500">{kpi.name}</span>
              <span className={cn("rounded border px-1.5 py-0.5 text-[9.5px] font-semibold", tone)}>{kpi.status}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[21px] font-bold leading-none text-slate-900">{kpi.value}</span>
              {kpi.change && <span className="text-[10.5px] font-medium text-emerald-600">{kpi.change}</span>}
              {kpi.target && <span className="text-[10.5px] text-slate-500">{kpi.target}</span>}
            </div>
            <p className="mt-1 text-[10.5px] text-slate-500">{kpi.context}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {kpi.supporting.map((s) => (
                <span key={s.label} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9.5px] text-slate-600">
                  {s.value} {s.label}
                </span>
              ))}
            </div>
            <div className="mt-1.5 h-7">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpi.trend.map((v, i) => ({ i, v }))}>
                  <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-[11.5px]">{kpi.tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* -------------------------------- lifecycle -------------------------------- */

const stageTone = (s: string) =>
  s === "Warning" ? "amber" : s === "Blocked" ? "red" : s === "Review Required" ? "amber" : s === "Paused" ? "slate" : "green";

export function LifecyclePanel({
  stages, selectedId, onSelect, callouts, filterMode, onFilterMode, spotlight,
}: {
  stages: PersonaConstructionStage[];
  selectedId: string;
  onSelect: (id: string) => void;
  callouts: { tone: "amber" | "green"; text: string }[];
  filterMode: "all" | "warnings" | "review" | "downstream";
  onFilterMode: (m: "all" | "warnings" | "review" | "downstream") => void;
  spotlight?: boolean;
}) {
  const [fit, setFit] = useState(true);
  const visible = useMemo(() => {
    if (filterMode === "warnings") return stages.filter((s) => s.warningCount > 0 || s.status === "Warning");
    if (filterMode === "review") return stages.filter((s) => s.status === "Review Required");
    if (filterMode === "downstream") return stages.filter((s) => s.sequence >= 8);
    return stages;
  }, [stages, filterMode]);

  const summary = stages
    .map((s) => `${s.sequence}. ${s.name}: ${s.status}, ${nf(s.processedCount)} ${s.unit.toLowerCase()} processed, ${nf(s.pendingCount)} pending, ${s.successRate}% success.`)
    .join(" ");

  return (
    <Panel
      id="panel-lifecycle"
      title="Team Persona Construction Lifecycle"
      subtitle="Approved business conditions are assembled into a governed, evidence linked team operating model"
      spotlight={spotlight}
    >
      <div className="px-4 pb-3">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {([
            { id: "all", label: "All stages" },
            { id: "warnings", label: "Focus warnings" },
            { id: "review", label: "Review required" },
            { id: "downstream", label: "Downstream consumers" },
          ] as const).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onFilterMode(m.id)}
              className={cn(
                "rounded-md border px-2 py-1 text-[10.5px] font-medium",
                filterMode === m.id ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              {m.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" onClick={() => setFit(true)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[10.5px] text-slate-600 hover:bg-slate-50">
              <Maximize2 className="h-3 w-3" aria-hidden /> Zoom to fit
            </button>
            <button type="button" onClick={() => { setFit(true); onFilterMode("all"); }} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[10.5px] text-slate-600 hover:bg-slate-50">
              <RotateCcw className="h-3 w-3" aria-hidden /> Reset view
            </button>
          </div>
        </div>

        <TooltipProvider delayDuration={150}>
          <ol className={cn("flex gap-1.5", fit ? "flex-wrap lg:flex-nowrap" : "overflow-x-auto")} aria-label="Construction lifecycle stages">
            {visible.map((s, i) => {
              const active = s.id === selectedId;
              const tone = stageTone(s.status);
              return (
                <li key={s.id} className="flex min-w-0 flex-1 items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onSelect(s.id)}
                        aria-current={active ? "step" : undefined}
                        className={cn(
                          "min-w-0 flex-1 rounded-lg border p-2 text-left transition",
                          active ? "border-blue-400 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300",
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[9.5px] font-semibold text-slate-400">{s.sequence}</span>
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            tone === "green" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : tone === "red" ? "bg-red-500" : "bg-slate-400",
                          )} aria-hidden />
                        </div>
                        <div className="mt-0.5 truncate text-[11px] font-semibold leading-tight text-slate-900">{s.name}</div>
                        <div className="mt-0.5 text-[9.5px] text-slate-500">{s.status}</div>
                        <div className="mt-1 text-[10px] font-medium text-slate-700">{nf(s.processedCount)}</div>
                        <div className="text-[9.5px] text-slate-500">{s.unit.toLowerCase()} · {nf(s.pendingCount)} pending</div>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded bg-slate-100">
                          <div
                            className={cn("h-full", tone === "green" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : "bg-red-500")}
                            style={{ width: `${s.successRate}%` }}
                            aria-hidden
                          />
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[9.5px] text-slate-500">
                          <span>{s.successRate}%</span>
                          <span>·</span>
                          <span>{s.averageDuration}</span>
                          {s.warningCount > 0 && <span className="text-amber-600">· {s.warningCount}w</span>}
                          {s.failedCount > 0 && <span className="text-red-600">· {s.failedCount}f</span>}
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-[11px]">
                      <p className="font-semibold">{s.name}</p>
                      <p className="mt-1">{s.definition}</p>
                      <p className="mt-1">Queue: {nf(s.pendingCount)} pending · SLA {s.slaStatus} · P95 {s.p95Duration}</p>
                      <p className="mt-1">Upstream: {s.upstream}</p>
                      <p>Downstream: {s.downstream}</p>
                    </TooltipContent>
                  </Tooltip>
                  {i < visible.length - 1 && <ArrowRight className="h-3 w-3 shrink-0 text-slate-300" aria-hidden />}
                </li>
              );
            })}
          </ol>
        </TooltipProvider>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {callouts.map((c) => (
            <span
              key={c.text}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10.5px] font-medium",
                c.tone === "amber" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700",
              )}
            >
              {c.tone === "amber" ? <TriangleAlert className="h-3 w-3" aria-hidden /> : <CheckCircle2 className="h-3 w-3" aria-hidden />}
              {c.text}
            </span>
          ))}
        </div>
        <p className="sr-only">{summary}</p>
      </div>
    </Panel>
  );
}

/* ----------------------------- stage detail ------------------------------- */

const STAGE_TABS = ["Overview", "Queue", "Dependencies", "Risks", "Conflicts", "Evidence", "Outputs", "Configuration"] as const;
export type StageTab = (typeof STAGE_TABS)[number];

export function StageDetailPanel({
  stage, tab, onTab, dependencies, risks, conflicts, evidence, outputs, configuration, queue, onAction,
}: {
  stage: PersonaConstructionStage;
  tab: StageTab;
  onTab: (t: StageTab) => void;
  dependencies: { source: string; relationship: string; target: string; direction: string; criticality: string; confidence: number; evidenceCount: number; status: string }[];
  risks: { id: string; riskName: string; affectedTeam: string; affectedService: string; likelihood: string; impact: string; control: string; owner: string; status: string }[];
  conflicts: { a: string; b: string; conflictType: string; evidence: string; authority: string; affectedTeams: string; recommendedAction: string; reviewStatus: string }[];
  evidence: { conditionId: string; condition: string; sourceArtifact: string; passage: string; authority: string; confidence: number; freshness: string }[];
  outputs: { label: string; value: string }[];
  configuration: { label: string; value: string }[];
  queue: { id: string; team: string; item: string; waiting: string; priority: string }[];
  onAction: (a: string) => void;
}) {
  return (
    <Panel id="panel-stage-detail" title="Selected Stage Detail" subtitle={stage.name}>
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-x-4 md:grid-cols-4">
          <Row label="Stage status" value={<Pill label={stage.status} tone={stageTone(stage.status) as never} />} />
          <Row label="Processing" value={`${nf(stage.processedCount)} ${stage.unit.toLowerCase()}`} />
          <Row label="Completed this hour" value={stage.throughput} />
          <Row label="Pending review" value={nf(stage.pendingCount)} />
          <Row label="Average duration" value={stage.averageDuration} />
          <Row label="P95 duration" value={stage.p95Duration} />
          <Row label="Success rate" value={`${stage.successRate}%`} />
          <Row label="SLA state" value={stage.slaStatus} />
          <Row label="Primary owner" value={stage.owner} />
          <Row label="Upstream stage" value={stage.upstream} />
          <Row label="Downstream stage" value={stage.downstream} />
          <Row label="Configuration version" value="pcs-2026.08.3" />
        </div>

        <div className="mt-3 flex flex-wrap gap-1" role="tablist" aria-label="Stage detail tabs">
          {STAGE_TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => onTab(t)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium",
                tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-2 max-h-72 overflow-auto rounded-lg border border-slate-200">
          {tab === "Overview" && (
            <div className="p-3 text-[11.5px] text-slate-600">
              <p>{stage.definition}</p>
              <p className="mt-2">
                {nf(stage.processedCount)} {stage.unit.toLowerCase()} processed, {nf(stage.pendingCount)} pending,
                {" "}{stage.warningCount} warnings and {stage.failedCount} failures recorded in the current window.
              </p>
            </div>
          )}
          {tab === "Queue" && (
            <SimpleTable
              head={["Item", "Team", "Detail", "Waiting", "Priority"]}
              rows={queue.map((q) => [q.id, q.team, q.item, q.waiting, q.priority])}
            />
          )}
          {tab === "Dependencies" && (
            <SimpleTable
              head={["Source Team or Service", "Relationship", "Target Team or Service", "Direction", "Criticality", "Confidence", "Evidence Count", "Status"]}
              rows={dependencies.map((d) => [d.source, d.relationship, d.target, d.direction, d.criticality, `${d.confidence}%`, String(d.evidenceCount), d.status])}
            />
          )}
          {tab === "Risks" && (
            <SimpleTable
              head={["Risk", "Affected Team", "Affected Service", "Likelihood", "Impact", "Control", "Owner", "Status"]}
              rows={risks.map((r) => [r.riskName, r.affectedTeam, r.affectedService, r.likelihood, r.impact, r.control, r.owner, r.status])}
            />
          )}
          {tab === "Conflicts" && (
            <SimpleTable
              head={["Relationship A", "Relationship B", "Conflict Type", "Evidence", "Authority", "Affected Teams", "Recommended Action", "Review Status"]}
              rows={conflicts.map((c) => [c.a, c.b, c.conflictType, c.evidence, c.authority, c.affectedTeams, c.recommendedAction, c.reviewStatus])}
            />
          )}
          {tab === "Evidence" && (
            <div className="divide-y divide-slate-100">
              {evidence.map((e) => (
                <div key={e.conditionId} className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">{e.conditionId}</span>
                    <Pill label={e.authority} tone={e.authority === "Primary" ? "blue" : "slate"} />
                    <Pill label={`${e.confidence}%`} tone="green" />
                    <Pill label={e.freshness} tone={e.freshness === "Current" ? "green" : "amber"} />
                  </div>
                  <p className="mt-1 text-[11.5px] font-medium text-slate-800">{e.condition}</p>
                  <p className="mt-0.5 text-[10.5px] text-slate-500">{e.sourceArtifact}</p>
                  <blockquote className="mt-1 border-l-2 border-blue-300 bg-blue-50/60 px-2 py-1 text-[11px] italic text-slate-700">
                    {e.passage}
                  </blockquote>
                </div>
              ))}
            </div>
          )}
          {tab === "Outputs" && <dl className="p-3">{outputs.map((o) => <Row key={o.label} label={o.label} value={o.value} />)}</dl>}
          {tab === "Configuration" && <dl className="p-3">{configuration.map((o) => <Row key={o.label} label={o.label} value={o.value} />)}</dl>}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Pause Stage", "Resume Stage", "Retry Failures", "Reprocess Selected", "Open Persona Workbench", "View Logs", "Edit Configuration", "Create Review Task"].map((a) => (
            <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a)}>{a}</Button>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function SimpleTable({ head, rows }: { head: string[]; rows: string[][] }) {
  if (!rows.length) return <p className="p-3 text-[11.5px] text-slate-500">No records match the current filters.</p>;
  return (
    <table className="w-full text-left text-[11px]">
      <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
        <tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-2.5 py-1.5 font-semibold">{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50">
            {r.map((c, j) => <td key={j} className="px-2.5 py-1.5 text-slate-700">{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* --------------------------- persona inventory ---------------------------- */

export const viewColumns: Record<ViewMode, { key: string; label: string }[]> = {
  portfolio: [
    { key: "id", label: "Persona ID" }, { key: "teamName", label: "Team Name" },
    { key: "businessUnit", label: "Business Unit" }, { key: "mission", label: "Primary Mission" },
    { key: "constructionStatus", label: "Persona Status" }, { key: "approvalState", label: "Approval State" },
    { key: "qualityScore", label: "Quality Score" }, { key: "completenessScore", label: "Completeness" },
    { key: "confidence", label: "Confidence" }, { key: "freshnessStatus", label: "Freshness" },
    { key: "conditionCount", label: "Conditions" }, { key: "dependencyCount", label: "Dependencies" },
    { key: "personaOwner", label: "Owner" },
  ],
  construction: [
    { key: "id", label: "Persona ID" }, { key: "teamName", label: "Team Name" },
    { key: "constructionStage", label: "Construction Stage" }, { key: "conditionCount", label: "Conditions Mapped" },
    { key: "evidenceCoverage", label: "Evidence Coverage" }, { key: "ownershipStatus", label: "Ownership Status" },
    { key: "dependencyStatus", label: "Dependency Status" }, { key: "qualityScore", label: "Quality Score" },
    { key: "reviewStatus", label: "Review Status" }, { key: "warnings", label: "Warnings" },
  ],
  architecture: [
    { key: "id", label: "Persona ID" }, { key: "teamName", label: "Team Name" },
    { key: "capabilities", label: "Capabilities" }, { key: "services", label: "Services" },
    { key: "customers", label: "Customers" }, { key: "upstream", label: "Upstream Dependencies" },
    { key: "downstream", label: "Downstream Consumers" }, { key: "systems", label: "Systems" },
    { key: "graphCoverage", label: "Context Graph Coverage" },
  ],
  workbench: [
    { key: "id", label: "Persona ID" }, { key: "teamName", label: "Team Name" },
    { key: "selectedConditions", label: "Selected Conditions" }, { key: "includedConditions", label: "Included Conditions" },
    { key: "excludedConditions", label: "Excluded Conditions" }, { key: "conflicts", label: "Conflicts" },
    { key: "evidenceGaps", label: "Evidence Gaps" }, { key: "reviewer", label: "Reviewer" },
    { key: "constructionStatus", label: "Status" },
  ],
};

const cellValue = (p: TeamPersona, key: string): string => {
  const v = (p as unknown as Record<string, unknown>)[key];
  if (Array.isArray(v)) return v.slice(0, 3).join(", ") + (v.length > 3 ? ` +${v.length - 3}` : "");
  if (typeof v === "number") {
    if (["completenessScore", "confidence", "evidenceCoverage", "graphCoverage"].includes(key)) return `${v}%`;
    return nf(v);
  }
  return String(v ?? "—");
};

export function PersonaInventoryPanel({
  personas: rows, view, density, search, onSearch, onOpen, selected, onToggle, onToggleAll,
  sortKey, sortDir, onSort, hiddenColumns, onExport, page, pageSize, onPage, spotlight,
}: {
  personas: TeamPersona[];
  view: ViewMode;
  density: Density;
  search: string;
  onSearch: (v: string) => void;
  onOpen: (p: TeamPersona) => void;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (k: string) => void;
  hiddenColumns: Set<string>;
  onExport: () => void;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  spotlight?: boolean;
}) {
  const cols = viewColumns[view].filter((c) => !hiddenColumns.has(c.key));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const pad = density === "compact" ? "py-1" : density === "comfortable" ? "py-2.5" : "py-1.75";
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  return (
    <Panel
      id="panel-inventory"
      title="Team Persona Inventory"
      subtitle={`${rows.length} personas match the current filters`}
      spotlight={spotlight}
    >
      <div className="px-4 pb-3">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search Personas"
            aria-label="Search Personas"
            className="h-7 w-56 rounded-md border border-slate-200 px-2 text-[11.5px] text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
          />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onExport}>Export current view</Button>
          {selected.size > 0 && (
            <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[10.5px] font-medium text-blue-700">
              {selected.size} selected
            </span>
          )}
        </div>

        <div className="overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-8 px-2 py-1.5">
                  <input
                    type="checkbox"
                    aria-label="Select all personas"
                    checked={rows.length > 0 && rows.every((r) => selected.has(r.id))}
                    onChange={onToggleAll}
                  />
                </th>
                {cols.map((c, i) => (
                  <th
                    key={c.key}
                    className={cn("whitespace-nowrap px-2.5 py-1.5 font-semibold", i < 2 && "sticky left-0 bg-slate-50")}
                  >
                    <button type="button" onClick={() => onSort(c.key)} className="inline-flex items-center gap-1 hover:text-slate-800">
                      {c.label}
                      {sortKey === c.key && <span aria-hidden>{sortDir === "asc" ? "▲" : "▼"}</span>}
                    </button>
                  </th>
                ))}
                <th className="px-2.5 py-1.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.map((p) => (
                <tr key={p.id} className="cursor-pointer hover:bg-slate-50" onClick={() => onOpen(p)}>
                  <td className={cn("px-2", pad)} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" aria-label={`Select ${p.teamName}`} checked={selected.has(p.id)} onChange={() => onToggle(p.id)} />
                  </td>
                  {cols.map((c, i) => (
                    <td key={c.key} className={cn("max-w-[240px] truncate px-2.5 text-slate-700", pad, i < 2 && "sticky left-0 bg-white font-medium")}>
                      {c.key === "constructionStatus" || c.key === "approvalState" || c.key === "dependencyStatus" || c.key === "ownershipStatus"
                        ? <Pill label={cellValue(p, c.key)} tone={
                          ["Approved", "Resolved", "Current"].includes(cellValue(p, c.key)) ? "green"
                            : ["Warning", "Conflicts", "Partial", "Conflict Review", "Team Review Required", "Owner Review"].includes(cellValue(p, c.key)) ? "amber"
                              : ["Unresolved"].includes(cellValue(p, c.key)) ? "red" : "slate"
                        } />
                        : cellValue(p, c.key)}
                    </td>
                  ))}
                  <td className={cn("px-2.5", pad)} onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => onOpen(p)} className="inline-flex items-center gap-0.5 text-[11px] font-medium text-blue-700 hover:underline">
                      Open <ChevronRight className="h-3 w-3" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
              {!pageRows.length && (
                <tr><td colSpan={cols.length + 2} className="px-3 py-6 text-center text-[11.5px] text-slate-500">No personas match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-6 text-[11px]" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
            <Button size="sm" variant="outline" className="h-6 text-[11px]" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------- persona detail drawer -------------------------- */

const PERSONA_TABS = [
  "Overview", "Mission and Scope", "Products and Services", "Customers and Stakeholders",
  "Objectives and Metrics", "Constraints and Guardrails", "Dependencies", "Risks and Controls",
  "Decision Logic", "Evidence", "Versions",
] as const;
export type PersonaTab = (typeof PERSONA_TABS)[number];

export function PersonaDetailDrawer({
  persona, open, onOpenChange, tab, onTab, sections, onAction,
}: {
  persona: TeamPersona | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tab: PersonaTab;
  onTab: (t: PersonaTab) => void;
  sections: PersonaSection[];
  onAction: (a: string) => void;
}) {
  if (!persona) return null;
  const list = (label: string, values: string[]) => (
    <div className="mb-3">
      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</h4>
      <ul className="mt-1 space-y-0.5">
        {values.length ? values.map((v) => (
          <li key={v} className="flex gap-1.5 text-[11.5px] text-slate-700">
            <CircleDot className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" aria-hidden />{v}
          </li>
        )) : <li className="text-[11.5px] text-slate-400">Not yet populated</li>}
      </ul>
    </div>
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide title={persona.teamName} description={`${persona.id} · ${persona.businessUnit}`}>
      <div className="flex flex-wrap gap-1.5">
        <Pill label={persona.constructionStatus} tone={persona.constructionStatus === "Approved" ? "green" : "amber"} />
        <Pill label={persona.approvalState} tone={persona.approvalState === "Approved" ? "green" : "amber"} />
        <Pill label={`Quality ${persona.qualityScore}`} tone="blue" />
        <Pill label={`Completeness ${persona.completenessScore}%`} tone="blue" />
        <Pill label={`Confidence ${persona.confidence}%`} tone="blue" />
        <Pill label={persona.freshnessStatus} tone={persona.freshnessStatus === "Current" ? "green" : "amber"} />
      </div>

      <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-2" role="tablist" aria-label="Persona detail tabs">
        {PERSONA_TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => onTab(t)}
            className={cn("rounded-md px-2 py-1 text-[10.5px] font-medium", tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100")}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        {tab === "Overview" && (
          <dl>
            <Row label="Persona summary" value={persona.description} />
            <Row label="Primary mission" value={persona.mission} />
            <Row label="Business unit" value={persona.businessUnit} />
            <Row label="Knowledge domains" value={persona.knowledgeDomains.join(", ")} />
            <Row label="Persona owner" value={persona.personaOwner} />
            <Row label="Team owner" value={persona.teamOwner} />
            <Row label="Technical owner" value={persona.technicalOwner} />
            <Row label="Approval state" value={persona.approvalState} />
            <Row label="Quality score" value={persona.qualityScore} />
            <Row label="Completeness" value={`${persona.completenessScore}%`} />
            <Row label="Confidence" value={`${persona.confidence}%`} />
            <Row label="Freshness" value={persona.freshnessStatus} />
          </dl>
        )}
        {tab === "Mission and Scope" && (
          <div>
            {list("Mission", [persona.mission])}
            {list("Business capabilities", persona.businessCapabilities)}
            {list("Responsibilities", persona.capabilities)}
            {list("Owned services", persona.services)}
            {list("Owned systems", persona.systems)}
            {list("Boundaries", ["Owns authorization and retry behaviour", "Does not own checkout presentation"])}
            {list("Explicit exclusions", ["Fraud model development", "Identity credential issuance"])}
          </div>
        )}
        {tab === "Products and Services" && (
          <div>
            {list("Products", [persona.product])}
            {list("Services", persona.services)}
            {list("APIs", persona.services.filter((s) => s.includes("API")))}
            {list("Data products", ["Settlement event stream"])}
            {list("Operational capabilities", persona.businessCapabilities)}
            {list("Service criticality", ["Payments API: Critical", "Retry Orchestrator: High"])}
            {list("Service level objectives", ["Monthly availability at least 99.95 percent", "P95 latency below 250 milliseconds", "Error rate below 0.3 percent"])}
          </div>
        )}
        {tab === "Customers and Stakeholders" && (
          <div>
            {list("Internal customers", persona.customers)}
            {list("External customers", persona.externalCustomers)}
            {list("Upstream teams", persona.upstream)}
            {list("Downstream teams", persona.downstream)}
            {list("Executive stakeholders", ["VP Commerce Engineering", "VP Risk Technology"])}
            {list("Regulatory stakeholders", ["Payment Compliance Office"])}
            {list("Partners", ["Acquiring bank partners"])}
          </div>
        )}
        {tab === "Objectives and Metrics" && (
          <div>
            {list("Business objectives", ["Maintain payment availability", "Reduce transaction failures", "Protect customer conversion", "Preserve financial and regulatory controls"])}
            {list("Key results", ["Error rate below 0.3 percent by year end", "Zero duplicate transaction incidents"])}
            {list("Service level objectives", ["Availability 99.95 percent", "P95 latency 250 milliseconds"])}
            {list("Key performance indicators", ["Payment Availability KPI", "Authorization success rate"])}
            {list("Baselines", ["Error rate baseline 0.8 percent"])}
            {list("Targets", ["Error rate target below 0.3 percent"])}
            {list("Thresholds", ["Identity latency escalation at 400 milliseconds"])}
          </div>
        )}
        {tab === "Constraints and Guardrails" && (
          <div>
            {list("Policies", ["Restricted token data must never be persisted outside approved vault services"])}
            {list("Constraints", ["Changes affecting more than 10 percent of checkout traffic require joint approval"])}
            {list("Cost guardrails", ["Regional failover capacity capped at 130 percent of baseline"])}
            {list("Compliance obligations", ["Payment data handling standard 1140"])}
            {list("Operational windows", ["No deployment during the final three business days of a financial quarter"])}
            {list("Change restrictions", ["Revenue path change freeze applies"])}
            {list("Approval requirements", ["Payments Reliability and Fraud Engineering joint approval"])}
          </div>
        )}
        {tab === "Dependencies" && (
          <div>
            {list("Upstream teams", persona.upstream)}
            {list("Downstream teams", persona.downstream)}
            {list("Systems", persona.systems)}
            {list("Services", persona.services)}
            {list("Data products", ["Settlement event stream"])}
            {list("External providers", ["Acquiring bank gateway"])}
            {list("Dependency criticality", ["Identity Services: Critical", "Fraud Decision Service: Critical", "Regional Token Vault: Critical"])}
            {list("Relationship confidence", ["Average 92 percent across 18 relationships"])}
          </div>
        )}
        {tab === "Risks and Controls" && (
          <div>
            {list("Risks", persona.failureModes)}
            {list("Failure modes", persona.failureModes)}
            {list("Controls", ["Idempotency validation", "Traffic segmentation", "Progressive rollout", "Automated rollback", "Token handling policy"])}
            {list("Mitigations", ["Regional failover rehearsal", "Retry budget enforcement"])}
            {list("Escalation triggers", ["Identity latency above 400 milliseconds", "Authorization error rate above 1 percent"])}
            {list("Recovery expectations", ["Restore authorization within 15 minutes"])}
          </div>
        )}
        {tab === "Decision Logic" && (
          <div>
            {list("Decision priorities", persona.decisionPriorities)}
            {list("Decision rules", ["Customer conversion and payment integrity are both primary", "Security and regulatory controls are nonnegotiable", "Prefer reversible changes with measurable rollout stages"])}
            {list("Common tradeoffs", persona.commonTradeoffs)}
            {list("Risk appetite", persona.riskAppetite)}
            {list("Preferred evidence", persona.preferredEvidence)}
            {list("Escalation philosophy", persona.escalationPhilosophy)}
            {list("Approval philosophy", ["Broad traffic exposure requires cross team approval"])}
          </div>
        )}
        {tab === "Evidence" && (
          <div className="space-y-2">
            {sections.slice(0, 8).map((s) => (
              <div key={s.id} className="rounded-lg border border-slate-200 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-semibold text-slate-800">{s.title}</span>
                  <Pill label={`${s.confidence}% confidence`} tone="blue" />
                </div>
                <p className="mt-0.5 text-[10.5px] text-slate-500">
                  {s.conditionIds.length} mapped conditions · {s.evidenceReferenceIds.length} evidence references · {s.freshness}
                </p>
              </div>
            ))}
          </div>
        )}
        {tab === "Versions" && (
          <dl>
            <Row label="Current version" value={persona.version} />
            <Row label="Prior versions" value="v3.3, v3.2, v3.1" />
            <Row label="Change summary" value="Added regional failover idempotency control" />
            <Row label="Approval history" value="v3.3 approved by Jane Smith on 2026-07-14" />
            <Row label="Published" value={persona.publishedAt ?? "Not published"} />
          </dl>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-slate-200 pt-2">
        {["Open Persona Workbench", "Edit Draft", "Request Review", "Assign Owner", "Refresh Conditions", "Rebuild Relationships", "Export Persona", "Open Related Conditions", "Open Impact Analysis"].map((a) => (
          <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a)}>{a}</Button>
        ))}
      </div>
    </Drawer>
  );
}

/* ------------------------------- workbench -------------------------------- */

export function WorkbenchPanel({
  conditions, groups, activeGroup, onGroup, selectedConditionId, onSelectCondition,
  onConditionAction, canvas, sections, selectedField, onSelectField, mappingStates,
  onWorkbenchAction, search, onSearch, spotlight,
}: {
  conditions: BusinessCondition[];
  groups: string[];
  activeGroup: string | null;
  onGroup: (g: string | null) => void;
  selectedConditionId: string | null;
  onSelectCondition: (id: string) => void;
  onConditionAction: (id: string, action: string) => void;
  canvas: typeof import("./data").paymentsCanvas;
  sections: PersonaSection[];
  selectedField: string | null;
  onSelectField: (f: string | null) => void;
  mappingStates: Record<string, BusinessCondition["mappingState"]>;
  onWorkbenchAction: (a: string) => void;
  search: string;
  onSearch: (v: string) => void;
  spotlight?: boolean;
}) {
  const selectedCondition = conditions.find((c) => c.id === selectedConditionId) ?? null;
  const stateOf = (c: BusinessCondition) => mappingStates[c.id] ?? c.mappingState;
  const highlightSection = selectedCondition?.section ?? null;
  const fieldConditions = useMemo(
    () => conditions.filter((c) => (selectedField ? c.section === selectedField : false)),
    [conditions, selectedField],
  );
  const inspectorCondition = selectedCondition ?? fieldConditions[0] ?? null;

  const toneForState = (s: BusinessCondition["mappingState"]) =>
    s === "Included" ? "green" : s === "Suggested" ? "blue" : s === "Conflict" ? "red" : s === "Review Required" ? "amber" : "slate";

  const canvasBlock = (field: string, label: string, values: string[]) => {
    const active = selectedField === field;
    const highlighted = highlightSection === field;
    return (
      <button
        key={field}
        type="button"
        onClick={() => onSelectField(active ? null : field)}
        className={cn(
          "w-full rounded-lg border p-2 text-left transition",
          active ? "border-blue-400 bg-blue-50" : highlighted ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-white hover:border-slate-300",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
          {highlighted && <span className="rounded bg-emerald-100 px-1 text-[9px] font-semibold text-emerald-700">supported</span>}
        </div>
        <ul className="mt-1 space-y-0.5">
          {values.map((v) => <li key={v} className="text-[11px] leading-snug text-slate-700">{v}</li>)}
        </ul>
      </button>
    );
  };

  return (
    <Panel
      id="panel-workbench"
      title="Team Persona Construction Workbench"
      subtitle="Approved conditions, the assembled Persona, and the evidence behind every assertion stay synchronized"
      spotlight={spotlight}
    >
      <div className="px-4 pb-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {["Auto Map Suggested Conditions", "Accept All High Confidence Mappings", "Review Conflicts", "Review Evidence Gaps", "Save Draft", "Reset Draft", "Preview Persona"].map((a) => (
            <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onWorkbenchAction(a)}>{a}</Button>
          ))}
        </div>

        <div className="grid gap-2 lg:grid-cols-12">
          {/* Region 1 */}
          <div className="rounded-lg border border-slate-200 lg:col-span-4">
            <div className="border-b border-slate-200 px-2.5 py-1.5">
              <h3 className="text-[11.5px] font-semibold text-slate-800">Condition Library</h3>
              <p className="text-[10px] text-slate-500">Approved conditions applicable to Payments Platform</p>
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search conditions"
                aria-label="Search conditions"
                className="mt-1 h-6 w-full rounded border border-slate-200 px-1.5 text-[11px] focus:border-blue-400 focus:outline-none"
              />
              <div className="mt-1 flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => onGroup(null)}
                  className={cn("rounded border px-1.5 py-0.5 text-[9.5px]", !activeGroup ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}
                >
                  All
                </button>
                {groups.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onGroup(activeGroup === g ? null : g)}
                    className={cn("rounded border px-1.5 py-0.5 text-[9.5px]", activeGroup === g ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <ul className="max-h-[520px] divide-y divide-slate-100 overflow-auto">
              {conditions.map((c) => {
                const state = stateOf(c);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onSelectCondition(c.id)}
                      className={cn("w-full px-2.5 py-2 text-left hover:bg-slate-50", selectedConditionId === c.id && "bg-blue-50")}
                    >
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[9px] text-slate-600">{c.id}</span>
                        <Pill label={state} tone={toneForState(state) as never} />
                        <Pill label={c.authority} tone={c.authority === "Primary" ? "blue" : "slate"} />
                      </div>
                      <p className="mt-1 text-[11px] leading-snug text-slate-800">{c.statement}</p>
                      <p className="mt-0.5 text-[9.5px] text-slate-500">
                        {c.conditionType} · {c.owner} · {c.confidence}% · {c.freshness} · {c.evidenceCount} evidence · {c.applicability}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {["Include", "Exclude", "Map to Section", "Open Evidence", "Request Review", "Mark Conflict"].map((a) => (
                          <span
                            key={a}
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.stopPropagation(); onConditionAction(c.id, a); }}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onConditionAction(c.id, a); } }}
                            className="cursor-pointer rounded border border-slate-200 px-1 py-0.5 text-[9px] text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </button>
                  </li>
                );
              })}
              {!conditions.length && <li className="p-3 text-[11px] text-slate-500">No conditions match the current filters.</li>}
            </ul>
          </div>

          {/* Region 2 */}
          <div className="rounded-lg border border-slate-200 lg:col-span-5">
            <div className="border-b border-slate-200 px-2.5 py-1.5">
              <h3 className="text-[11.5px] font-semibold text-slate-800">Persona Canvas</h3>
              <p className="text-[10px] text-slate-500">{canvas.identity.teamName} · {canvas.identity.businessUnit}</p>
            </div>
            <div className="max-h-[520px] space-y-1.5 overflow-auto p-2">
              {canvasBlock("Mission", "Primary Mission", [canvas.mission])}
              {canvasBlock("Business Capabilities", "Business Capabilities", canvas.capabilities)}
              {canvasBlock("Products and Services", "Products and Services", canvas.productsAndServices)}
              {canvasBlock("Customers", "Customers and Stakeholders", canvas.customers)}
              {canvasBlock("Objectives", "Objectives", canvas.objectives)}
              {canvasBlock("Service Level Objectives", "Service Levels", canvas.serviceLevels)}
              {canvasBlock("Constraints", "Constraints", canvas.constraints)}
              {canvasBlock("Dependencies", "Dependencies", canvas.dependencies)}
              {canvasBlock("Risks", "Risk Conditions", canvas.risks)}
              {canvasBlock("Controls", "Controls", canvas.controls)}
              {canvasBlock("Decision Rules", "Decision Logic", canvas.decisionLogic)}

              <div className="rounded-lg border border-slate-300 bg-slate-50 p-2">
                <h4 id="panel-how-team-thinks" className="scroll-mt-24 text-[11px] font-semibold text-slate-800">How This Team Thinks</h4>
                <div className="mt-1 grid gap-1.5 sm:grid-cols-2">
                  {howThisTeamThinks.map((b) => (
                    <div key={b.key} className="rounded border border-slate-200 bg-white p-1.5">
                      <div className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">{b.title}</div>
                      <ul className="mt-0.5 space-y-0.5">
                        {b.values.map((v) => <li key={v} className="text-[10.5px] leading-snug text-slate-700">{v}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Region 3 */}
          <div className="rounded-lg border border-slate-200 lg:col-span-3">
            <div className="border-b border-slate-200 px-2.5 py-1.5">
              <h3 className="text-[11.5px] font-semibold text-slate-800">Evidence and Confidence Inspector</h3>
              <p className="text-[10px] text-slate-500">
                {selectedField ? `Persona field: ${selectedField}` : inspectorCondition ? `Condition ${inspectorCondition.id}` : "Select a condition or Persona field"}
              </p>
            </div>
            <div className="max-h-[520px] overflow-auto p-2.5">
              {inspectorCondition ? (
                <>
                  <p className="text-[11.5px] font-medium text-slate-800">{inspectorCondition.statement}</p>
                  <blockquote className="mt-1.5 border-l-2 border-blue-300 bg-blue-50/60 px-2 py-1 text-[11px] italic text-slate-700">
                    {inspectorCondition.evidencePassage}
                  </blockquote>
                  <dl className="mt-2">
                    <Row label="Source artifact" value={inspectorCondition.sourceArtifact} />
                    <Row label="Source authority" value={inspectorCondition.authority} />
                    <Row label="Condition confidence" value={`${inspectorCondition.confidence}%`} />
                    <Row label="Evidence confidence" value={`${Math.max(60, inspectorCondition.confidence - 2)}%`} />
                    <Row label="Freshness" value={inspectorCondition.freshness} />
                    <Row label="Owner confidence" value={`${Math.max(60, inspectorCondition.confidence - 5)}%`} />
                    <Row label="Relationship confidence" value={`${Math.max(60, inspectorCondition.confidence - 4)}%`} />
                    <Row label="Conflicts" value={stateOf(inspectorCondition) === "Conflict" ? "1 unresolved" : "None"} />
                    <Row label="Missing evidence" value={inspectorCondition.evidenceCount < 3 ? "Below evidence threshold" : "None"} />
                    <Row label="Applicable permissions" value="Persona reviewers, Team owners" />
                  </dl>
                  <div className="mt-2">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Provenance chain</h4>
                    <ol className="mt-1 space-y-0.5">
                      {provenanceChain.map((p, i) => (
                        <li key={p} className="flex items-start gap-1 text-[10.5px] text-slate-700">
                          <span className="mt-0.5 text-slate-400">{i + 1}.</span>{p}
                        </li>
                      ))}
                    </ol>
                  </div>
                  {selectedField && (
                    <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-2">
                      <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Mapped business conditions</h4>
                      <ul className="mt-1 space-y-0.5">
                        {fieldConditions.length ? fieldConditions.map((c) => (
                          <li key={c.id} className="text-[10.5px] text-slate-700">{c.id} — {c.statement}</li>
                        )) : <li className="text-[10.5px] text-slate-500">No conditions currently mapped to this field.</li>}
                      </ul>
                    </div>
                  )}
                  {sections.length > 0 && (
                    <p className="mt-2 text-[10px] text-slate-500">
                      {sections.length} governed Persona sections registered for this Persona.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[11.5px] text-slate-500">Select a condition on the left or a Persona field in the canvas to inspect its evidence.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* --------------------------- persona section model ------------------------ */

export function SectionModelPanel({ sections, onSelect }: { sections: PersonaSection[]; onSelect: (s: PersonaSection) => void }) {
  return (
    <Panel id="panel-sections" title="Persona Section Model" subtitle={`${sections.length} governed sections tracked for the selected Persona`}>
      <div className="max-h-80 overflow-auto px-4 pb-3">
        <table className="w-full text-left text-[11px]">
          <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              {["Section", "Completeness", "Conditions", "Evidence", "Avg Confidence", "Freshness", "Review", "Owner", "Warnings"].map((h) => (
                <th key={h} className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sections.map((s) => (
              <tr key={s.id} className="cursor-pointer hover:bg-slate-50" onClick={() => onSelect(s)}>
                <td className="px-2 py-1.5 font-medium text-slate-800">{s.sectionType}</td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-14 overflow-hidden rounded bg-slate-100">
                      <div className={cn("h-full", s.completeness >= 90 ? "bg-emerald-500" : s.completeness >= 80 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${s.completeness}%` }} />
                    </div>
                    <span className="text-slate-600">{s.completeness}%</span>
                  </div>
                </td>
                <td className="px-2 py-1.5 text-slate-600">{s.conditionIds.length}</td>
                <td className="px-2 py-1.5 text-slate-600">{s.evidenceReferenceIds.length}</td>
                <td className="px-2 py-1.5 text-slate-600">{s.confidence}%</td>
                <td className="px-2 py-1.5 text-slate-600">{s.freshness}</td>
                <td className="px-2 py-1.5 text-slate-600">{s.reviewStatus}</td>
                <td className="px-2 py-1.5 text-slate-600">{s.owner}</td>
                <td className="px-2 py-1.5">{s.warningCount > 0 ? <Pill label={String(s.warningCount)} tone="amber" /> : <span className="text-slate-400">0</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* -------------------------- condition coverage ---------------------------- */

export function ConditionCoveragePanel({ onCategory, activeCategory, spotlight }: { onCategory: (c: string | null) => void; activeCategory: string | null; spotlight?: boolean }) {
  return (
    <Panel id="panel-coverage" title="Condition Mapping Coverage" subtitle="Approved conditions associated with Team Personas" spotlight={spotlight}>
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-x-4 md:grid-cols-3">
          <Row label="Approved Conditions Available" value={nf(conditionCoverage.available)} />
          <Row label="Mapped to Personas" value={nf(conditionCoverage.mapped)} />
          <Row label="Unmapped Conditions" value={nf(conditionCoverage.unmapped)} />
          <Row label="Mapped to Multiple Personas" value={nf(conditionCoverage.multiPersona)} />
          <Row label="Requiring Applicability Review" value={nf(conditionCoverage.applicabilityReview)} />
          <Row label="Coverage" value={`${Math.round((conditionCoverage.mapped / conditionCoverage.available) * 100)}%`} />
        </div>
        <ul className="mt-2 space-y-1">
          {conditionCoverage.categories.map((c) => (
            <li key={c.name}>
              <button
                type="button"
                onClick={() => onCategory(activeCategory === c.name ? null : c.name)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md border px-2 py-1 text-left",
                  activeCategory === c.name ? "border-blue-300 bg-blue-50" : "border-transparent hover:bg-slate-50",
                )}
              >
                <span className="w-40 shrink-0 text-[11px] text-slate-700">{c.name}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded bg-slate-100">
                  <span className={cn("block h-full", c.mapped >= 90 ? "bg-emerald-500" : c.mapped >= 86 ? "bg-blue-500" : "bg-amber-500")} style={{ width: `${c.mapped}%` }} />
                </span>
                <span className="w-10 text-right text-[11px] font-medium text-slate-700">{c.mapped}%</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

/* --------------------------------- graph ---------------------------------- */

export function DependencyGraphPanel({ onNode, spotlight }: { onNode: (n: GraphNode) => void; spotlight?: boolean }) {
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [mode, setMode] = useState<"all" | "upstream" | "downstream" | "critical" | "customer">("all");

  const edges = useMemo(() => graphEdges.filter((e) => {
    if (typeFilter !== "All" && e.label !== typeFilter) return false;
    if (mode === "upstream" && e.direction !== "Upstream") return false;
    if (mode === "downstream" && e.direction !== "Downstream") return false;
    if (mode === "critical" && e.criticality !== "Critical") return false;
    if (mode === "customer" && !e.customerPath) return false;
    return true;
  }), [typeFilter, mode]);

  const visibleNodeIds = useMemo(() => {
    const s = new Set<string>(["payments"]);
    edges.forEach((e) => { s.add(e.from); s.add(e.to); });
    return s;
  }, [edges]);

  const nodeById = useMemo(() => Object.fromEntries(graphNodes.map((n) => [n.id, n])), []);
  const description = edges.map((e) => `${nodeById[e.from]?.label} ${e.label} ${nodeById[e.to]?.label} (${e.direction}, ${e.criticality}).`).join(" ");

  const kindColor: Record<GraphNode["kind"], string> = {
    Center: "bg-slate-900 text-white border-slate-900",
    Team: "bg-blue-50 text-blue-800 border-blue-200",
    Service: "bg-emerald-50 text-emerald-800 border-emerald-200",
    System: "bg-violet-50 text-violet-800 border-violet-200",
    Customer: "bg-amber-50 text-amber-800 border-amber-200",
    KPI: "bg-sky-50 text-sky-800 border-sky-200",
    Governance: "bg-slate-100 text-slate-700 border-slate-300",
  };

  return (
    <Panel
      id="panel-graph"
      title="Team Persona Dependency and Ecosystem Graph"
      subtitle="Relationships centered on the Payments Platform Persona"
      spotlight={spotlight}
    >
      <div className="px-4 pb-3">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter relationship type"
            className="h-7 rounded-md border border-slate-200 px-1.5 text-[11px] text-slate-700"
          >
            <option value="All">All relationships</option>
            {relationshipTypes.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          {([
            { id: "all", label: "All", icon: Network },
            { id: "upstream", label: "Upstream only", icon: ArrowRight },
            { id: "downstream", label: "Downstream only", icon: ArrowRight },
            { id: "critical", label: "Critical dependencies", icon: ShieldCheck },
            { id: "customer", label: "Customer impact path", icon: Users },
          ] as const).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10.5px] font-medium",
                mode === m.id ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              <m.icon className="h-3 w-3" aria-hidden /> {m.label}
            </button>
          ))}
          <div className="ml-auto flex gap-1.5">
            <button type="button" onClick={() => setMode("all")} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[10.5px] text-slate-600 hover:bg-slate-50">
              <Maximize2 className="h-3 w-3" aria-hidden /> Zoom to fit
            </button>
            <button type="button" onClick={() => { setMode("all"); setTypeFilter("All"); }} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[10.5px] text-slate-600 hover:bg-slate-50">
              <RotateCcw className="h-3 w-3" aria-hidden /> Reset view
            </button>
          </div>
        </div>

        <div className="relative h-[380px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <svg className="absolute inset-0 h-full w-full" aria-hidden>
            {edges.map((e, i) => {
              const a = nodeById[e.from], b = nodeById[e.to];
              if (!a || !b) return null;
              return (
                <g key={i}>
                  <line
                    x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`}
                    stroke={e.criticality === "Critical" ? "#94a3b8" : "#cbd5e1"}
                    strokeWidth={e.criticality === "Critical" ? 1.6 : 1}
                    strokeDasharray={e.direction === "Bidirectional" ? "4 3" : undefined}
                  />
                  <text
                    x={`${(a.x + b.x) / 2}%`} y={`${(a.y + b.y) / 2}%`}
                    className="fill-slate-400 text-[8px]" textAnchor="middle"
                  >
                    {e.label}
                  </text>
                </g>
              );
            })}
          </svg>
          {graphNodes.filter((n) => visibleNodeIds.has(n.id)).map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => onNode(n)}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-md border px-1.5 py-1 text-[9.5px] font-medium shadow-sm transition hover:shadow",
                kindColor[n.kind],
              )}
            >
              {n.label}
            </button>
          ))}
        </div>
        <p className="sr-only">{description}</p>
      </div>
    </Panel>
  );
}

/* -------------------------------- quality --------------------------------- */

export function QualityPanel({ onDimension, spotlight }: { onDimension: (d: QualityDimension) => void; spotlight?: boolean }) {
  return (
    <Panel id="panel-quality" title="Persona Quality and Completeness" subtitle={`Overall Persona quality ${overallQuality} out of 100`} spotlight={spotlight}>
      <div className="px-4 pb-3">
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>{["Dimension", "Score", "Target", "Variance", "Trend", "Personas", "Status"].map((h) => (
                <th key={h} className="px-2 py-1.5 font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {qualityDimensions.map((d) => {
                const variance = d.score - d.target;
                return (
                  <tr key={d.name} className="cursor-pointer hover:bg-slate-50" onClick={() => onDimension(d)}>
                    <td className="px-2 py-1.5 font-medium text-slate-800">{d.name}</td>
                    <td className="px-2 py-1.5 text-slate-700">{d.score}</td>
                    <td className="px-2 py-1.5 text-slate-500">{d.target}</td>
                    <td className={cn("px-2 py-1.5 font-medium", variance >= 0 ? "text-emerald-600" : "text-amber-600")}>{variance >= 0 ? `+${variance}` : variance}</td>
                    <td className="px-2 py-1.5">
                      <div className="h-5 w-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={d.trend.map((v, i) => ({ i, v }))}>
                            <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-slate-600">{d.affectedPersonas}</td>
                    <td className="px-2 py-1.5">
                      <Pill label={variance >= 0 ? "On target" : variance >= -4 ? "Monitor" : "Below target"} tone={variance >= 0 ? "green" : variance >= -4 ? "blue" : "amber"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------- gaps ---------------------------------- */

export function GapsPanel({
  gaps: rows, activeCategory, onCategory, onAction, spotlight,
}: {
  gaps: PersonaGap[];
  activeCategory: string | null;
  onCategory: (c: string | null) => void;
  onAction: (g: PersonaGap, a: string) => void;
  spotlight?: boolean;
}) {
  return (
    <Panel id="panel-gaps" title="Persona Construction Gaps" subtitle="Unresolved information required before a Persona can be published" spotlight={spotlight}>
      <div className="px-4 pb-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {gapCategories.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => onCategory(activeCategory === c.name ? null : c.name)}
              className={cn(
                "rounded-md border px-2 py-1 text-[10.5px] font-medium",
                activeCategory === c.name ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              {c.name} <span className="font-semibold">{nf(c.count)}</span>
            </button>
          ))}
        </div>
        <div className="max-h-72 overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>{["Persona", "Gap Type", "Severity", "Missing or Conflicting Information", "Affected Section", "Owner", "Age", "Quality Impact", "Recommended Action", "Status", "Actions"].map((h) => (
                <th key={h} className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="px-2 py-1.5 font-medium text-slate-800">{g.personaName}</td>
                  <td className="px-2 py-1.5 text-slate-700">{g.gapType}</td>
                  <td className="px-2 py-1.5"><Pill label={g.severity} tone={g.severity === "High" || g.severity === "Critical" ? "red" : g.severity === "Medium" ? "amber" : "slate"} /></td>
                  <td className="max-w-[260px] px-2 py-1.5 text-slate-600">{g.description}</td>
                  <td className="px-2 py-1.5 text-slate-600">{g.affectedSection}</td>
                  <td className="px-2 py-1.5 text-slate-600">{g.owner}</td>
                  <td className="px-2 py-1.5 text-slate-600">{g.age}</td>
                  <td className="px-2 py-1.5 text-slate-600">-{g.qualityImpact}</td>
                  <td className="max-w-[220px] px-2 py-1.5 text-slate-600">{g.recommendedAction}</td>
                  <td className="px-2 py-1.5"><Pill label={g.status} tone={g.status === "Open" ? "amber" : g.status === "Assigned" ? "blue" : "slate"} /></td>
                  <td className="px-2 py-1.5">
                    <div className="flex flex-wrap gap-1">
                      {["Open Persona", "Open Evidence", "Assign Owner", "Map Condition", "Request Review", "Mark for Prompt 2 Resolution"].map((a) => (
                        <button key={a} type="button" onClick={() => onAction(g, a)} className="rounded border border-slate-200 px-1 py-0.5 text-[9px] text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                          {a}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={11} className="px-3 py-6 text-center text-[11.5px] text-slate-500">No gaps match the current filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------ jobs / drawer ----------------------------- */

export function JobsPanel({ jobs, onOpen, spotlight }: { jobs: PersonaConstructionJob[]; onOpen: (j: PersonaConstructionJob) => void; spotlight?: boolean }) {
  return (
    <Panel id="panel-jobs" title="Active Persona Construction Jobs" subtitle={`${jobs.length} jobs executing across the lifecycle`} spotlight={spotlight}>
      <div className="max-h-72 overflow-auto px-4 pb-3">
        <table className="w-full text-left text-[11px]">
          <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>{["Job ID", "Team", "Current Stage", "Status", "Conditions", "Relationships", "Completeness", "Quality", "Confidence", "Started", "Elapsed", "Owner", "Warnings", "Actions"].map((h) => (
              <th key={h} className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((j) => (
              <tr key={j.id} className="cursor-pointer hover:bg-slate-50" onClick={() => onOpen(j)}>
                <td className="px-2 py-1.5 font-mono text-[10px] text-slate-700">{j.id}</td>
                <td className="px-2 py-1.5 font-medium text-slate-800">{j.teamName}</td>
                <td className="px-2 py-1.5 text-slate-600">{j.currentStage}</td>
                <td className="px-2 py-1.5"><Pill label={j.status} tone={j.status === "Running" ? "green" : j.status === "Warning" ? "amber" : j.status === "Blocked" ? "red" : "slate"} /></td>
                <td className="px-2 py-1.5 text-slate-600">{nf(j.conditionCount)}</td>
                <td className="px-2 py-1.5 text-slate-600">{j.relationshipCount}</td>
                <td className="px-2 py-1.5 text-slate-600">{j.completeness}%</td>
                <td className="px-2 py-1.5 text-slate-600">{j.qualityScore}</td>
                <td className="px-2 py-1.5 text-slate-600">{j.confidence}%</td>
                <td className="px-2 py-1.5 text-slate-600">{j.startedAt}</td>
                <td className="px-2 py-1.5 text-slate-600">{j.elapsedTime}</td>
                <td className="px-2 py-1.5 text-slate-600">{j.owner}</td>
                <td className="px-2 py-1.5">{j.warningCount > 0 ? <Pill label={String(j.warningCount)} tone="amber" /> : <span className="text-slate-400">0</span>}</td>
                <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={() => onOpen(j)} className="text-[11px] font-medium text-blue-700 hover:underline">Open</button>
                </td>
              </tr>
            ))}
            {!jobs.length && <tr><td colSpan={14} className="px-3 py-6 text-center text-[11.5px] text-slate-500">No construction jobs match the current filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

const JOB_TABS = ["Summary", "Conditions", "Persona Sections", "Relationships", "Evidence", "Gaps", "Timeline", "Logs"] as const;
export type JobTab = (typeof JOB_TABS)[number];

export function JobDetailDrawer({
  job, open, onOpenChange, tab, onTab, sections, gaps: jobGaps, timeline, logs, dependencies, evidence, onAction,
}: {
  job: PersonaConstructionJob | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tab: JobTab;
  onTab: (t: JobTab) => void;
  sections: PersonaSection[];
  gaps: PersonaGap[];
  timeline: { stage: string; status: string; at: string; detail: string }[];
  logs: string[];
  dependencies: { source: string; relationship: string; target: string; criticality: string; confidence: number; status: string }[];
  evidence: { conditionId: string; condition: string; sourceArtifact: string; authority: string; confidence: number }[];
  onAction: (a: string) => void;
}) {
  if (!job) return null;
  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide title={`${job.id} · ${job.teamName}`} description={job.currentStage}>
      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Job detail tabs">
        {JOB_TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => onTab(t)}
            className={cn("rounded-md px-2 py-1 text-[10.5px] font-medium", tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100")}>
            {t}
          </button>
        ))}
      </div>
      <div className="max-h-[60vh] overflow-auto">
        {tab === "Summary" && (
          <dl>
            <Row label="Team" value={job.teamName} />
            <Row label="Current stage" value={job.currentStage} />
            <Row label="Status" value={job.status} />
            <Row label="Conditions evaluated" value={nf(job.conditionCount)} />
            <Row label="Conditions included" value={nf(job.includedConditionCount)} />
            <Row label="Conditions excluded" value={nf(job.excludedConditionCount)} />
            <Row label="Conditions requiring review" value={nf(job.reviewConditionCount)} />
            <Row label="Relationships" value={job.relationshipCount} />
            <Row label="Quality" value={job.qualityScore} />
            <Row label="Completeness" value={`${job.completeness}%`} />
            <Row label="Confidence" value={`${job.confidence}%`} />
            <Row label="Owner" value={job.owner} />
            <Row label="Started" value={job.startedAt} />
            <Row label="Elapsed" value={job.elapsedTime} />
            <Row label="Estimated completion" value={job.estimatedCompletion} />
            <Row label="Configuration version" value={job.configurationVersion} />
          </dl>
        )}
        {tab === "Conditions" && (
          <SimpleTable head={["Metric", "Value"]} rows={[
            ["Evaluated", nf(job.conditionCount)], ["Included", nf(job.includedConditionCount)],
            ["Excluded", nf(job.excludedConditionCount)], ["Requiring review", nf(job.reviewConditionCount)],
          ]} />
        )}
        {tab === "Persona Sections" && (
          <SimpleTable head={["Section", "Completeness", "Conditions", "Confidence", "Review"]}
            rows={sections.slice(0, 20).map((s) => [s.sectionType, `${s.completeness}%`, String(s.conditionIds.length), `${s.confidence}%`, s.reviewStatus])} />
        )}
        {tab === "Relationships" && (
          <SimpleTable head={["Source", "Relationship", "Target", "Criticality", "Confidence", "Status"]}
            rows={dependencies.map((d) => [d.source, d.relationship, d.target, d.criticality, `${d.confidence}%`, d.status])} />
        )}
        {tab === "Evidence" && (
          <SimpleTable head={["Condition", "Statement", "Source Artifact", "Authority", "Confidence"]}
            rows={evidence.map((e) => [e.conditionId, e.condition, e.sourceArtifact, e.authority, `${e.confidence}%`])} />
        )}
        {tab === "Gaps" && (
          <SimpleTable head={["Gap Type", "Severity", "Section", "Owner", "Status"]}
            rows={jobGaps.map((g) => [g.gapType, g.severity, g.affectedSection, g.owner, g.status])} />
        )}
        {tab === "Timeline" && (
          <ol className="space-y-1.5">
            {timeline.map((t) => (
              <li key={t.stage} className="flex items-start gap-2 rounded-md border border-slate-200 p-2">
                <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", t.status === "Complete" ? "bg-emerald-500" : t.status === "Warning" ? "bg-amber-500" : "bg-blue-500")} aria-hidden />
                <div>
                  <div className="text-[11.5px] font-medium text-slate-800">{t.stage} <span className="ml-1 text-[10px] text-slate-400">{t.at}</span></div>
                  <div className="text-[10.5px] text-slate-500">{t.detail}</div>
                </div>
              </li>
            ))}
          </ol>
        )}
        {tab === "Logs" && (
          <pre className="max-h-72 overflow-auto rounded-md bg-slate-900 p-2.5 text-[10.5px] leading-relaxed text-slate-100">{logs.join("\n")}</pre>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-slate-200 pt-2">
        {["Pause Job", "Resume Job", "Retry Stage", "Open Workbench", "Refresh Conditions", "Rebuild Relationships", "Export Job Summary"].map((a) => (
          <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a)}>{a}</Button>
        ))}
      </div>
    </Drawer>
  );
}

/* ------------------------------- throughput ------------------------------- */

export function ThroughputPanel() {
  return (
    <Panel id="panel-throughput" title="Construction Throughput" subtitle="Conditions and relationships processed per interval">
      <div className="h-48 px-3 pb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={throughputSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <RTooltip contentStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="conditions" stroke="#2563eb" fill="#dbeafe" name="Conditions" isAnimationActive={false} />
            <Area type="monotone" dataKey="relationships" stroke="#059669" fill="#d1fae5" name="Relationships" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

/* ------------------------------ architecture ------------------------------ */

export function ArchitecturePanel() {
  const blocks = [
    { title: "Source Conditions", items: ["Conditions Registry", "Approved condition sets", "Applicability rules"], icon: Layers },
    { title: "Teams and Services", items: ["Organizational model", "Service catalog", "Product registry"], icon: Users },
    { title: "Relationship Modeling", items: ["Context Graph", "Dependency resolver", "Conflict detector"], icon: Network },
    { title: "Evidence Lineage", items: ["Evidence Vault", "Provenance chain", "Authority scoring"], icon: Crosshair },
    { title: "Persona Compilation", items: ["Section model", "Decision logic compiler", "Quality scoring"], icon: Target },
    { title: "Downstream Consumers", items: ["Cognitive Intake", "Persona Impact Analysis", "Cross Team Impact Matrix", "Decision Intelligence", "Enterprise Cognitive Memory", "Cognitive Search", "Organizational Learning"], icon: Focus },
  ];
  return (
    <Panel id="panel-architecture" title="Construction Architecture" subtitle="How approved conditions become a governed Team Persona">
      <div className="grid gap-2 px-4 pb-3 md:grid-cols-3">
        {blocks.map((b) => (
          <div key={b.title} className="rounded-lg border border-slate-200 p-2.5">
            <div className="flex items-center gap-1.5">
              <b.icon className="h-3.5 w-3.5 text-slate-500" aria-hidden />
              <h3 className="text-[11.5px] font-semibold text-slate-800">{b.title}</h3>
            </div>
            <ul className="mt-1 space-y-0.5">
              {b.items.map((i) => <li key={i} className="text-[10.5px] text-slate-600">{i}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* --------------------------------- exports -------------------------------- */

export function download(name: string, content: string, type = "text/csv") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export function personasToCsv(rows: TeamPersona[]) {
  const head = ["Persona ID", "Team", "Business Unit", "Mission", "Status", "Approval", "Quality", "Completeness", "Confidence", "Freshness", "Conditions", "Dependencies", "Owner"];
  const body = rows.map((p) => [p.id, p.teamName, p.businessUnit, p.mission, p.constructionStatus, p.approvalState, p.qualityScore, p.completenessScore, p.confidence, p.freshnessStatus, p.conditionCount, p.dependencyCount, p.personaOwner]);
  return [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function AttentionBanner({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {text}
    </div>
  );
}
