/** Cross Team Impact Analysis — panels built on the existing ECF primitives. */

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
  agreements, conditionById, conflictsFor, coordinationActionsFor, ctiPersonas, dependenciesFor,
  evidenceById, evidenceState, graphEdges, graphFilters, graphNodes, intersectionsFor,
  lifecycleCallouts, lifecycleStages, mitigationCandidates, opportunities, overallQuality,
  personaById, personaScore, qualityDimensions, queueColumns, recentActivity, severityRank,
  stageById, enterpriseSummary,
  type CrossTeamImpactAnalysis, type CrossTeamImpactConflict, type CrossTeamImpactStage,
  type CrossTeamSharedDependency, type CtiAnalysisState, type CtiGraphNode, type CtiView,
} from "./data";

export { Panel, EmptyState, PanelSkeleton, IntakeKpiCard };
export type { Density };

const pct = (n: number) => `${Math.round(n)}%`;

export const ctiTone = (s: string): Tone =>
  ["Running", "Positive", "Healthy", "Within SLA", "Analysis Complete", "Complete", "Operational", "In Place", "Provided", "Low", "Applicable", "Mitigated", "None"].includes(s) ? "green"
    : ["Warning", "Review Required", "At Risk", "Analyzing", "Attention", "Medium", "Mixed", "Conditional", "Pending", "Monitoring", "In Progress", "Aging", "Owner Unconfirmed", "Active"].includes(s) ? "amber"
      : ["Blocked", "Failed", "Critical", "High", "Missing", "Needs Evidence", "Open", "Negative"].includes(s) ? "red"
        : ["Idle", "Neutral", "Not Required", "Draft", "Informational"].includes(s) ? "slate" : "blue";

/* -------------------------------------------------------------- primitives */

export function SimpleTable({ head, rows, dense }: { head: string[]; rows: React.ReactNode[][]; dense?: boolean }) {
  if (!rows.length) return <EmptyState message="No records match the current filters" />;
  return (
    <div className="overflow-x-auto rounded border border-slate-200">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead className="bg-slate-50">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={cn("border-t border-slate-100", i % 2 ? "bg-slate-50/40" : "bg-white")}>
              {r.map((c, j) => (
                <td key={j} className={cn("px-2 text-[11px] text-slate-700", dense ? "py-1" : "py-1.5")}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InfoTip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild><span>{children}</span></TooltipTrigger>
        <TooltipContent className="max-w-xs text-[11px]">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* --------------------------------------------------------------- lifecycle */

export function LifecyclePanel({
  selectedStage, onSelect,
}: { selectedStage: string; onSelect: (id: string) => void }) {
  return (
    <Panel id="panel-lifecycle" title="Cross Team Impact Analysis Lifecycle"
      subtitle="Persona results are loaded, normalized, intersected, and prepared for enterprise decision context"
      actions={
        <div className="flex flex-wrap gap-1">
          {lifecycleCallouts.map((c) => <Pill key={c.id} label={c.label} tone={c.tone === "red" ? "red" : "amber"} />)}
        </div>
      }>
      <ol className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
        {lifecycleStages.map((s) => (
          <li key={s.id}>
            <button type="button" onClick={() => onSelect(s.id)} aria-pressed={selectedStage === s.id}
              className={cn("w-full rounded-lg border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                selectedStage === s.id ? "border-blue-400 bg-blue-50/60" : "border-slate-200 bg-white hover:border-blue-200")}>
              <div className="flex items-start justify-between gap-1.5">
                <span className="text-[11.5px] font-semibold text-slate-800">{s.sequence}. {s.name}</span>
                <Pill label={s.status} tone={ctiTone(s.status)} />
              </div>
              <p className="mt-0.5 text-[10.5px] text-slate-500">{s.detail}</p>
              <div className="mt-1 flex flex-wrap gap-1 text-[9.5px] text-slate-500">
                <span className="rounded border border-slate-200 bg-slate-50 px-1">{s.processedCount} processed</span>
                <span className="rounded border border-slate-200 bg-slate-50 px-1">{s.pendingCount} pending</span>
                <span className="rounded border border-slate-200 bg-slate-50 px-1">{s.successRate.toFixed(1)}% success</span>
                <span className="rounded border border-slate-200 bg-slate-50 px-1">p95 {s.p95Duration}</span>
              </div>
            </button>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function SelectedStagePanel({
  stage, state, onOpenConflict, onOpenDependency,
}: {
  stage: CrossTeamImpactStage;
  state: CtiAnalysisState;
  onOpenConflict: (c: CrossTeamImpactConflict) => void;
  onOpenDependency: (d: CrossTeamSharedDependency) => void;
}) {
  const tabs = ["Overview", "Queue", "Intersections", "Conflicts", "Dependencies", "Opportunities", "Evidence", "Outputs"];
  const [tab, setTab] = useState("Intersections");
  const intersections = intersectionsFor(state);
  const conflicts = conflictsFor(state);
  const deps = dependenciesFor(state);
  const evidence = evidenceState(state);

  return (
    <Panel id="panel-stage" title={`Selected Cross Team Stage · ${stage.name}`}
      subtitle={`${stage.detail} · owner ${stage.owner}`}
      actions={<Pill label={stage.slaStatus} tone={ctiTone(stage.slaStatus)} />}>
      <div className="grid gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
        {[
          ["Status", stage.status], ["Processing", `${stage.processedCount}`], ["Pending", `${stage.pendingCount}`],
          ["High Severity", `${intersections.filter((i) => i.severity === "High").length}`],
          ["Critical", `${intersections.filter((i) => i.severity === "Critical").length}`],
          ["Review Required", `${intersections.filter((i) => i.status === "Review Required").length}`],
          ["Average Duration", stage.averageDuration], ["P95 Duration", stage.p95Duration],
          ["Confidence", `${stage.successRate.toFixed(1)}%`], ["Throughput", stage.throughput],
          ["SLA", stage.slaStatus], ["Owner", stage.owner],
        ].map(([label, value]) => (
          <div key={label} className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
            <div className="text-[9.5px] uppercase tracking-wide text-slate-500">{label}</div>
            <div className="text-[12px] font-semibold text-slate-800">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-1" role="tablist" aria-label="Stage detail tabs">
        {tabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded border px-2 py-0.5 text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {tab === "Overview" && (
          <div className="grid gap-1.5 sm:grid-cols-2">
            <Row label="Stage purpose" value={stage.detail} />
            <Row label="Warnings" value={`${stage.warningCount}`} />
            <Row label="Failures" value={`${stage.failedCount}`} />
            <Row label="Throughput" value={stage.throughput} />
          </div>
        )}
        {tab === "Queue" && (
          <SimpleTable head={["Analysis", "Work Item", "Stage", "Status", "Confidence"]}
            rows={[["CTA 3001", "Checkout Retry Policy Update", stage.name, <Pill key="s" label="Review Required" tone="amber" />, "94%"],
              ["CTA 3004", "Fraud Decision Timeout Adjustment", stage.name, <Pill key="s" label="Analyzing" tone="amber" />, "92%"]]} />
        )}
        {tab === "Intersections" && (
          <SimpleTable head={["Intersection ID", "Team A", "Team B", "Shared Entity", "Impact Dimension", "Severity", "Direction", "Confidence", "Status"]}
            rows={intersections.map((i) => [i.id, personaById(i.personaIds[0]).name, personaById(i.personaIds[1]).name,
              i.sharedEntityId, i.impactDimension, <Pill key="s" label={i.severity} tone={ctiTone(i.severity)} />,
              i.direction, pct(i.confidence), <Pill key="st" label={i.status} tone={ctiTone(i.status)} />])} />
        )}
        {tab === "Conflicts" && (
          <SimpleTable head={["Persona A", "Persona B", "Conflict Type", "Priority A", "Priority B", "Conditions", "Severity", "Evidence", "Status"]}
            rows={conflicts.map((c) => [
              <button key="a" className="text-blue-700 underline-offset-2 hover:underline" onClick={() => onOpenConflict(c)}>{personaById(c.personaAId).name}</button>,
              personaById(c.personaBId).name, c.conflictType, c.priorityA, c.priorityB,
              c.conditionIds.join(", ") || "—", <Pill key="s" label={c.severity} tone={ctiTone(c.severity)} />,
              c.evidenceReferenceIds.join(", ") || "Gap", <Pill key="st" label={c.status} tone={ctiTone(c.status)} />])} />
        )}
        {tab === "Dependencies" && (
          <SimpleTable head={["Dependency", "Teams Affected", "Criticality", "Load Direction", "Failure Propagation", "Evidence", "Status"]}
            rows={deps.map((d) => [
              <button key="d" className="text-blue-700 underline-offset-2 hover:underline" onClick={() => onOpenDependency(d)}>{d.dependencyName}</button>,
              d.affectedPersonaIds.length, <Pill key="c" label={d.criticality} tone={ctiTone(d.criticality)} />,
              d.impactDirection, d.failurePropagation, d.evidenceReferenceIds.join(", ") || "Gap",
              <Pill key="s" label={d.status} tone={ctiTone(d.status)} />])} />
        )}
        {tab === "Opportunities" && (
          <SimpleTable head={["Teams", "Shared Opportunity", "Benefit", "Conditions", "Confidence"]}
            rows={opportunities.map((o) => [o.personaIds.map((p) => personaById(p).short).join(", "), o.title,
              o.benefitType, o.conditionIds.join(", "), pct(o.confidence)])} />
        )}
        {tab === "Evidence" && (
          <SimpleTable head={["Evidence", "Type", "Authority", "Recency", "Personas", "Status"]}
            rows={evidence.map((e) => [e.label, e.type, e.authority, e.recency,
              e.personaIds.map((p) => personaById(p).short).join(", "),
              <Pill key="s" label={e.status} tone={ctiTone(e.status)} />])} />
        )}
        {tab === "Outputs" && (
          <SimpleTable head={["Output", "Count", "Status"]}
            rows={[
              ["Matrix Cells", "47", <Pill key="a" label="Complete" tone="green" />],
              ["Conflict Records", `${conflicts.length}`, <Pill key="b" label="Review Required" tone="amber" />],
              ["Dependency Findings", `${deps.length}`, <Pill key="c" label="Analyzing" tone="amber" />],
              ["Shared Mitigations", `${mitigationCandidates.length}`, <Pill key="d" label="Candidate" tone="blue" />],
              ["Coordination Actions", `${coordinationActionsFor(state).length}`, <Pill key="e" label="In Progress" tone="amber" />],
              ["Decision Context", "1", <Pill key="f" label="Pending" tone="amber" />],
            ]} />
        )}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ queue -- */

export function AnalysisQueuePanel({
  rows, density, hiddenColumns, onToggleColumn, selected, onSelect, sortKey, sortDir, onSort,
  page, pageSize, onPage, loading, onOpen, onOpenWorkbench, actions, view,
}: {
  rows: CrossTeamImpactAnalysis[];
  density: Density;
  hiddenColumns: string[];
  onToggleColumn: (c: string) => void;
  selected: Set<string>;
  onSelect: (s: Set<string>) => void;
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (k: string) => void;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  loading: boolean;
  onOpen: (r: CrossTeamImpactAnalysis) => void;
  onOpenWorkbench: (r: CrossTeamImpactAnalysis) => void;
  actions?: React.ReactNode;
  view: CtiView;
}) {
  const [columnsOpen, setColumnsOpen] = useState(false);
  const visible = queueColumns.filter((c) => !hiddenColumns.includes(c));
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const slice = rows.slice((page - 1) * pageSize, page * pageSize);
  const pad = density === "compact" ? "py-1" : density === "comfortable" ? "py-2.5" : "py-1.5";

  const cell = (r: CrossTeamImpactAnalysis, col: string): React.ReactNode => {
    switch (col) {
      case "Analysis ID": return <span className="font-semibold text-slate-800">{r.id}</span>;
      case "Work Item": return r.workItem;
      case "Submitting Team": return r.submittingTeam;
      case "Teams Evaluated": return `${r.personaIds.length} Teams`;
      case "Matrix Coverage": return pct(r.matrixCoverage);
      case "Highest Severity": return <Pill label={r.highestSeverity} tone={ctiTone(r.highestSeverity)} />;
      case "Conflicts": return r.conflictCount;
      case "Shared Dependencies": return r.sharedDependencyCount;
      case "Shared Opportunities": return r.opportunityCount;
      case "Coordination Actions": return r.coordinationActionCount;
      case "Confidence": return pct(r.confidence);
      case "Current Stage": return stageById(r.currentStageId).name;
      case "Owner": return r.owner;
      case "Status": return <Pill label={r.status} tone={ctiTone(r.status)} />;
      case "Actions": return (
        <span className="flex gap-1">
          <Button size="sm" variant="outline" className="h-5 px-1.5 text-[10px]" onClick={(e) => { e.stopPropagation(); onOpen(r); }}>Detail</Button>
          <Button size="sm" variant="outline" className="h-5 px-1.5 text-[10px]" onClick={(e) => { e.stopPropagation(); onOpenWorkbench(r); }}>Workbench</Button>
        </span>
      );
      default: return null;
    }
  };

  return (
    <Panel id="panel-queue" title="Cross Team Analysis Queue"
      subtitle={`${rows.length} analyses · ${view} view emphasis`}
      actions={
        <div className="flex flex-wrap items-end gap-1.5">
          {actions}
          <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setColumnsOpen((o) => !o)}>
            Columns {columnsOpen ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
          </Button>
        </div>
      }>
      {columnsOpen && (
        <div className="mb-2 flex flex-wrap gap-1.5 rounded border border-slate-200 bg-slate-50 p-2">
          {queueColumns.map((c) => (
            <label key={c} className="flex items-center gap-1 text-[10.5px] text-slate-600">
              <input type="checkbox" checked={!hiddenColumns.includes(c)} onChange={() => onToggleColumn(c)} />
              {c}
            </label>
          ))}
        </div>
      )}
      {loading ? <PanelSkeleton rows={6} /> : slice.length === 0 ? (
        <EmptyState message="No cross team analyses match the current filters" hint="Clear filters or widen the time range" />
      ) : (
        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="w-full min-w-[1180px] border-collapse text-left">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="w-8 px-2 py-1.5">
                  <input type="checkbox" aria-label="Select all analyses"
                    checked={slice.every((r) => selected.has(r.id)) && slice.length > 0}
                    onChange={(e) => {
                      const next = new Set(selected);
                      slice.forEach((r) => (e.target.checked ? next.add(r.id) : next.delete(r.id)));
                      onSelect(next);
                    }} />
                </th>
                {visible.map((c) => (
                  <th key={c} scope="col" className={cn("whitespace-nowrap px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500",
                    c === "Analysis ID" && "sticky left-8 bg-slate-50")}>
                    <button type="button" onClick={() => onSort(c)} className="flex items-center gap-0.5 hover:text-slate-800">
                      {c}{sortKey === c && (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((r, i) => (
                <tr key={r.id} tabIndex={0} onClick={() => onOpen(r)}
                  onKeyDown={(e) => { if (e.key === "Enter") onOpen(r); }}
                  className={cn("cursor-pointer border-t border-slate-100 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500",
                    i % 2 ? "bg-slate-50/40" : "bg-white")}>
                  <td className={cn("px-2", pad)} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" aria-label={`Select ${r.id}`} checked={selected.has(r.id)}
                      onChange={() => { const next = new Set(selected); next.has(r.id) ? next.delete(r.id) : next.add(r.id); onSelect(next); }} />
                  </td>
                  {visible.map((c) => (
                    <td key={c} className={cn("whitespace-nowrap px-2 text-[11px] text-slate-700", pad,
                      c === "Analysis ID" && "sticky left-8 bg-inherit")}>{cell(r, c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-slate-500">
        <span>{selected.size} selected · page {page} of {pages}</span>
        <span className="flex gap-1">
          <Button size="sm" variant="outline" className="h-6 text-[10px]" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
          <Button size="sm" variant="outline" className="h-6 text-[10px]" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Button>
        </span>
      </div>
    </Panel>
  );
}

/* --------------------------------------------------- shared dependencies -- */

export function SharedDependencyPanel({
  state, selectedId, onSelect,
}: { state: CtiAnalysisState; selectedId: string | null; onSelect: (d: CrossTeamSharedDependency) => void }) {
  const deps = dependenciesFor(state);
  return (
    <Panel id="panel-dependencies" title="Shared Dependency Analysis"
      subtitle="Dependencies carried by more than one Team Persona, where local impacts compound into enterprise exposure">
      <SimpleTable head={["Dependency", "Dependency Type", "Affected Personas", "Criticality", "Current Health", "Impact Direction", "Capacity Signal", "Failure Propagation", "Evidence", "Status"]}
        rows={deps.map((d) => [
          <button key="n" onClick={() => onSelect(d)}
            className={cn("text-left font-medium underline-offset-2 hover:underline", selectedId === d.id ? "text-blue-700" : "text-slate-800")}>
            {d.dependencyName}
          </button>,
          d.dependencyType,
          d.affectedPersonaIds.map((p) => personaById(p).short).join(", "),
          <Pill key="c" label={d.criticality} tone={ctiTone(d.criticality)} />,
          <Pill key="h" label={d.currentHealth} tone={ctiTone(d.currentHealth)} />,
          d.impactDirection, d.capacitySignal, d.failurePropagation,
          d.evidenceReferenceIds.map((e) => evidenceById(e).label).join("; ") || "Gap",
          <Pill key="s" label={d.status} tone={ctiTone(d.status)} />,
        ])} />
    </Panel>
  );
}

/* ------------------------------------------------------ propagation graph -- */

const nodeTone: Record<CtiGraphNode["kind"], string> = {
  change: "border-blue-300 bg-blue-50 text-blue-800",
  system: "border-slate-300 bg-white text-slate-700",
  service: "border-amber-300 bg-amber-50 text-amber-800",
  persona: "border-indigo-300 bg-indigo-50 text-indigo-800",
  journey: "border-emerald-300 bg-emerald-50 text-emerald-800",
  governance: "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-800",
};

export function PropagationGraphPanel({
  onOpenNode, highlightPersonaId,
}: { onOpenNode: (n: CtiGraphNode) => void; highlightPersonaId?: string | null }) {
  const [filter, setFilter] = useState("all");
  const [zoom, setZoom] = useState(1);
  const [activeEdge, setActiveEdge] = useState<string | null>(null);

  const nodes = useMemo(() => graphNodes.filter((n) => {
    switch (filter) {
      case "direct": return n.direct;
      case "propagated": return !n.direct || n.kind === "change";
      case "personas": return n.kind === "persona" || n.kind === "change" || n.kind === "governance";
      case "services": return n.kind === "service" || n.kind === "system" || n.kind === "change";
      case "critical": return ["G1", "G2", "G3", "G5", "G6", "G13"].includes(n.id);
      case "customer": return ["G1", "G3", "G11", "G12", "G4"].includes(n.id);
      case "governance": return ["G1", "G13", "G4", "G6"].includes(n.id);
      case "failure": return ["G1", "G3", "G5", "G7", "G9", "G10"].includes(n.id);
      case "evidence": return ["G1", "G5", "G7", "G9", "G13"].includes(n.id);
      default: return true;
    }
  }), [filter]);
  const ids = new Set(nodes.map((n) => n.id));
  const edges = graphEdges.filter((e) => ids.has(e.from) && ids.has(e.to));
  const nodeById = (id: string) => graphNodes.find((n) => n.id === id)!;
  const edge = activeEdge ? graphEdges.find((e) => e.id === activeEdge) : null;

  return (
    <Panel id="panel-graph" title="Cross Team Impact Propagation"
      subtitle="How the proposed change reaches systems, shared services, Team Personas, the customer journey, and governance"
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
        </div>
      }>
      <div className="relative h-[420px] w-full overflow-auto rounded border border-slate-200 bg-slate-50">
        <div className="relative h-full min-w-[860px] origin-top-left" style={{ transform: `scale(${zoom})` }}>
          <svg className="absolute inset-0 h-full w-full" role="img" aria-label="Cross team impact propagation relationships">
            {edges.map((e) => {
              const a = nodeById(e.from); const b = nodeById(e.to);
              const stroke = e.kind === "governance" ? "#c026d3" : e.kind === "customer" ? "#059669"
                : e.kind === "ownership" ? "#6366f1" : e.kind === "impact" ? "#2563eb" : "#64748b";
              const propagated = !(a.direct && b.direct);
              return (
                <g key={e.id}>
                  <line x1={`${a.x}%`} y1={`${a.y + 3}%`} x2={`${b.x}%`} y2={`${b.y + 3}%`}
                    stroke={stroke} strokeWidth={activeEdge === e.id ? 2.6 : 1.3}
                    strokeDasharray={propagated ? "5 3" : undefined} />
                  <text x={`${(a.x + b.x) / 2}%`} y={`${(a.y + b.y) / 2 + 2}%`} textAnchor="middle"
                    className="cursor-pointer fill-slate-500 text-[8px]" onClick={() => setActiveEdge(e.id)}>{e.label}</text>
                </g>
              );
            })}
          </svg>
          {nodes.map((n) => (
            <button key={n.id} type="button" onClick={() => onOpenNode(n)} style={{ left: `${n.x}%`, top: `${n.y}%` }}
              className={cn("absolute -translate-x-1/2 rounded-md border px-2 py-1 text-[10.5px] font-medium shadow-sm transition hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                nodeTone[n.kind],
                highlightPersonaId && n.personaIds?.includes(highlightPersonaId) && "ring-2 ring-blue-500 ring-offset-1")}>
              {n.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-[10px] text-slate-500">Solid edges are direct impacts. Dashed edges are propagated impacts reached through shared dependencies.</p>
      {edge && (
        <div className="mt-1.5 rounded border border-slate-200 bg-white p-2 text-[11px] text-slate-700">
          <span className="font-medium">{nodeById(edge.from).label}</span> {edge.label}{" "}
          <span className="font-medium">{nodeById(edge.to).label}</span>
          <span className="ml-1.5 text-slate-500">Evidence {evidenceById(edge.evidence).label}</span>
        </div>
      )}
    </Panel>
  );
}

/* -------------------------------------------------------------- conflicts -- */

export function ConflictPanel({
  state, onOpen,
}: { state: CtiAnalysisState; onOpen: (c: CrossTeamImpactConflict) => void }) {
  const conflicts = conflictsFor(state);
  return (
    <Panel id="panel-conflicts" title="Persona Perspective Conflicts"
      subtitle="Where two Team Personas require different outcomes from the same change"
      actions={<Pill label={`${conflicts.filter((c) => c.status === "Open" || c.status === "Needs Evidence").length} active`} tone="amber" />}>
      <SimpleTable head={["Persona A", "Persona B", "Conflict Type", "Priority A", "Priority B", "Conditions", "Shared Dependency", "Severity", "Evidence", "Potential Coordination", "Status"]}
        rows={conflicts.map((c) => [
          <button key="a" onClick={() => onOpen(c)} className="text-left font-medium text-blue-700 underline-offset-2 hover:underline">{personaById(c.personaAId).name}</button>,
          personaById(c.personaBId).name, c.conflictType, c.priorityA, c.priorityB,
          c.conditionIds.map((i) => conditionById(i).label).join("; ") || "—",
          c.dependencyIds.join(", ") || "—",
          <Pill key="s" label={c.severity} tone={ctiTone(c.severity)} />,
          c.evidenceReferenceIds.length ? c.evidenceReferenceIds.map((e) => evidenceById(e).label).join("; ") : <Pill key="g" label="Evidence Gap" tone="red" />,
          c.potentialCoordination,
          <Pill key="st" label={c.status} tone={ctiTone(c.status)} />,
        ])} />
    </Panel>
  );
}

/* ------------------------------------------------------------- agreements -- */

export function AgreementPanel() {
  return (
    <Panel id="panel-agreements" title="Cross Team Agreements"
      subtitle="Positions every affected Persona already shares — the easiest coordination surface">
      <SimpleTable head={["Agreement", "Personas", "Supporting Conditions", "Evidence", "Confidence", "Opportunity"]}
        rows={agreements.map((a) => [a.title,
          a.personaIds.map((p) => personaById(p).short).join(", "),
          a.conditionIds.map((c) => conditionById(c).label).join("; "),
          a.evidenceReferenceIds.map((e) => evidenceById(e).label).join("; "),
          pct(a.confidence), a.opportunity])} />
    </Panel>
  );
}

/* ---------------------------------------------------------- opportunities -- */

export function OpportunityPanel() {
  return (
    <Panel id="panel-opportunities" title="Shared Opportunities"
      subtitle="Positive impacts that more than one Team Persona realises from the same change">
      <SimpleTable head={["Opportunity", "Teams", "Benefit", "Evidence", "Conditions", "Confidence", "Required Action"]}
        rows={opportunities.map((o) => [o.title,
          o.personaIds.map((p) => personaById(p).short).join(", "), o.benefitType,
          o.evidenceReferenceIds.map((e) => evidenceById(e).label).join("; "),
          o.conditionIds.map((c) => conditionById(c).label).join("; "),
          pct(o.confidence), o.requiredActions.join("; ")])} />
    </Panel>
  );
}

/* ------------------------------------------------------------ mitigations -- */

export function MitigationCandidatePanel({ onSelectPersona }: { onSelectPersona: (id: string) => void }) {
  return (
    <Panel id="panel-mitigations" title="Shared Mitigation Candidates"
      subtitle="Mitigations that resolve more than one Team Persona concern · candidates only in this release"
      actions={<Pill label="Prompt 2 makes these operational" tone="slate" />}>
      <SimpleTable head={["Mitigation", "Addresses", "Conflicts", "Owner Candidate", "Required Evidence", "Priority", "Status"]}
        rows={mitigationCandidates.map((m) => [m.title,
          <span key="p" className="flex flex-wrap gap-1">
            {m.affectedPersonaIds.map((p) => (
              <button key={p} onClick={() => onSelectPersona(p)}
                className="rounded border border-slate-200 bg-slate-50 px-1 text-[10px] text-slate-600 hover:border-blue-300">
                {personaById(p).short}
              </button>
            ))}
          </span>,
          m.conflictIds.join(", ") || "—", m.ownerCandidate,
          m.requiredEvidenceIds.map((e) => evidenceById(e).label).join("; "),
          <Pill key="pr" label={m.priority} tone={ctiTone(m.priority)} />,
          <Pill key="s" label={m.status} tone="blue" />])} />
    </Panel>
  );
}

/* --------------------------------------------------- coordination ownership */

export function CoordinationOwnershipPanel({ state }: { state: CtiAnalysisState }) {
  const actions = coordinationActionsFor(state);
  return (
    <Panel id="panel-ownership" title="Coordination Ownership Map"
      subtitle="Which team owns each coordination action, who participates, and what must happen before rollout progresses"
      actions={<Pill label={`${actions.filter((a) => a.status === "Owner Unconfirmed" || a.status === "Pending").length} ownership gaps`} tone="amber" />}>
      <SimpleTable head={["Coordination Action", "Primary Owner", "Participating Teams", "Why Required", "Priority", "Due Before", "Evidence Required", "Status"]}
        rows={actions.map((a) => [a.title, a.primaryOwner,
          a.participatingTeamIds.map((p) => personaById(p).short).join(", "), a.reason,
          <Pill key="p" label={a.priority} tone={ctiTone(a.priority)} />, a.requiredBefore,
          a.evidenceRequirementIds.map((e) => evidenceById(e).label).join("; "),
          <Pill key="s" label={a.status} tone={ctiTone(a.status)} />])} />
    </Panel>
  );
}

/* ---------------------------------------------------------------- quality -- */

export function QualityPanel() {
  return (
    <Panel id="panel-quality" title="Cross Team Analysis Quality"
      subtitle="Completeness and traceability of the synthesis itself"
      actions={<Pill label={`${overallQuality} / 100`} tone={overallQuality >= 90 ? "green" : "amber"} />}>
      <SimpleTable head={["Dimension", "Current", "Target", "Variance", "Trend", "Affected Analyses", "Status"]}
        rows={qualityDimensions.map((q) => [q.name,
          <span key="c" className="flex items-center gap-1.5">
            <Progress value={q.current} className="h-1.5 w-16" /> {q.current}
          </span>,
          q.target, `${q.current - q.target > 0 ? "+" : ""}${q.current - q.target}`, q.trend, q.affected,
          <Pill key="s" label={q.current >= q.target ? "Healthy" : q.current >= q.target - 5 ? "Attention" : "Critical"}
            tone={q.current >= q.target ? "green" : q.current >= q.target - 5 ? "amber" : "red"} />])} />
    </Panel>
  );
}

/* ---------------------------------------------------- enterprise summary --- */

export function EnterpriseSummaryPanel({ state }: { state: CtiAnalysisState }) {
  const s = enterpriseSummary(state);
  return (
    <Panel id="panel-summary" title="Enterprise Impact Summary"
      subtitle={`Selected work item · ${s.workItem}`}
      actions={<Pill label={`${s.confidence}% analysis confidence`} tone={s.confidence >= 90 ? "green" : "amber"} />}>
      <div className="grid gap-1.5 sm:grid-cols-3 xl:grid-cols-5">
        {[
          ["Teams Evaluated", s.teamsEvaluated], ["Material Persona Impacts", s.materialPersonaImpacts],
          ["Critical Shared Dependencies", s.criticalSharedDependencies], ["Cross Team Conflicts", s.conflicts],
          ["Shared Opportunities", s.opportunities], ["Shared Mitigation Candidates", s.mitigationCandidates],
          ["Coordination Actions", s.coordinationActions], ["Evidence Gaps", s.evidenceGaps],
          ["Analysis Confidence", `${s.confidence}%`],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
            <div className="text-[9.5px] uppercase tracking-wide text-slate-500">{label}</div>
            <div className="text-[15px] font-bold text-slate-900">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded border border-slate-200 bg-white p-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Primary Enterprise Finding</h3>
        <p className="mt-0.5 text-[12px] text-slate-700">{s.finding}</p>
      </div>
      <div className="mt-2 grid gap-2 xl:grid-cols-2">
        <div className="rounded border border-slate-200 bg-white p-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Key Cross Team Conditions</h3>
          <ul className="mt-1 space-y-0.5">
            {s.conditions.map((c) => <li key={c} className="text-[11.5px] text-slate-700">· {c}</li>)}
          </ul>
        </div>
        <div className="rounded border border-slate-200 bg-white p-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Downstream</h3>
          <ul className="mt-1 space-y-1">
            {s.downstream.map((d) => (
              <li key={d.label} className="flex items-center justify-between text-[11.5px] text-slate-700">
                {d.label} <Pill label={d.status} tone={ctiTone(d.status)} />
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-[10.5px] text-slate-500">
            This page prepares decision context. It does not issue the enterprise decision — Decision Intelligence handoff arrives with the next release.
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* --------------------------------------------------------------- activity -- */

export function ActivityPanel({ onOpen }: { onOpen: (analysisId: string) => void }) {
  return (
    <Panel id="panel-activity" title="Recent Cross Team Activity" subtitle="Audited synthesis events across active analyses">
      <SimpleTable dense head={["Timestamp", "Analysis", "Personas", "Action", "Description", "Result", "Owner", "Audit"]}
        rows={recentActivity.map((a) => [a.timestamp,
          <button key="a" onClick={() => onOpen(a.analysisId)} className="text-blue-700 underline-offset-2 hover:underline">{a.analysisId}</button>,
          a.personaIds.map((p) => personaById(p).short).join(", "), a.action, a.description,
          <Pill key="r" label={a.result} tone={ctiTone(a.result)} />, a.owner, a.auditId])} />
    </Panel>
  );
}

/* ------------------------------------------------------ persona synthesis -- */

export function PersonaSynthesisPanel({
  state, selectedPersonaId, onSelect,
}: { state: CtiAnalysisState; selectedPersonaId: string | null; onSelect: (id: string) => void }) {
  return (
    <Panel id="panel-personas" title="Persona Impact Synthesis"
      subtitle="Each Team Persona keeps its own result — this page never averages perspectives into one score">
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
        {ctiPersonas.map((p) => {
          const score = personaScore(p.id, state);
          return (
            <button key={p.id} type="button" onClick={() => onSelect(p.id)} aria-pressed={selectedPersonaId === p.id}
              className={cn("rounded-lg border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                selectedPersonaId === p.id ? "border-blue-400 bg-blue-50/60" : "border-slate-200 bg-white hover:border-blue-200")}>
              <div className="flex items-start justify-between gap-1.5">
                <span className="text-[12px] font-semibold text-slate-800">{p.name}</span>
                <span className="text-[15px] font-bold text-slate-900">{score}</span>
              </div>
              <p className="mt-0.5 text-[10.5px] text-emerald-700">Benefit · {p.primaryBenefit}</p>
              <p className="text-[10.5px] text-red-700">Risk · {p.primaryRisk}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <Pill label={p.highestSeverity} tone={ctiTone(p.highestSeverity)} />
                <Pill label={p.reviewRequired ? "Review Required" : "No Review Required"} tone={p.reviewRequired ? "amber" : "green"} />
                <Pill label={p.personaImpactEvaluationId} tone="slate" />
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
