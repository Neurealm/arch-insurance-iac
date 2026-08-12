/** Enterprise Cognitive Memory — operational panels. Reuses ECF primitives and conventions. */

import { Fragment, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Pill, Row, type Tone } from "../persona-studio/primitives";
import {
  attentionRecords, authorityDistribution, freshnessDistribution, freshnessRows, graphEdges,
  graphNodes, lineageNodes, memoryComposition, memoryFlows, memoryLayers, memoryLifecycleStages,
  memoryQuality, lifecycleCallouts, qualityIssues,
  type CompositionRow, type FlowMode, type GraphEdge, type GraphNode, type LineageNode,
  type MemoryIndexingJob, type MemoryKpi, type MemoryLayer, type MemoryLifecycleStage,
  type MemoryRecord, type MemoryView, type RelationshipType,
} from "./data";

export type Density = "compact" | "standard" | "comfortable";

export const memTone = (s: string): Tone =>
  ["Approved", "Current", "Healthy", "Operational", "Running", "Published", "Within SLA", "Complete", "Immutable", "Validated", "Indexed"].includes(s) ? "green"
    : ["Warning", "Attention", "Aging", "Review Required", "Pending Review", "At Risk", "Indexing", "Owner Review", "Evidence Review", "In Review", "Partial", "Reindex Pending", "Approved with Conditions", "Medium"].includes(s) ? "amber"
      : ["Stale", "Conflict Review", "Failed", "Degraded", "Critical", "High", "Unconfirmed", "Missing", "Open"].includes(s) ? "red"
        : ["Draft", "Superseded", "Paused", "Idle", "Historical", "Reference", "Archived", "Unknown", "Low"].includes(s) ? "slate" : "blue";

export function Panel({ id, title, subtitle, actions, children, className }: {
  id?: string; title: string; subtitle?: string; actions?: React.ReactNode;
  children: React.ReactNode; className?: string;
}) {
  return (
    <section id={id} aria-label={title} className={cn("rounded-xl border border-slate-200 bg-white p-3 shadow-sm", className)}>
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

export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 py-8 text-center">
      <Search className="h-4 w-4 text-slate-400" aria-hidden />
      <p className="text-[12px] font-medium text-slate-600">{message}</p>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

export function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
    </div>
  );
}

/* ---------------------------------- KPIs ---------------------------------- */

export function MemoryKpiCard({ kpi, onClick, focused }: { kpi: MemoryKpi; onClick: () => void; focused?: boolean }) {
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

/* ----------------------------- architecture ------------------------------- */

export function ArchitecturePanel({ selectedLayer, onSelect, flowMode, onFlowMode, focusOnly, onFocusOnly, onOpenLayerRecords }: {
  selectedLayer: string; onSelect: (id: string) => void;
  flowMode: FlowMode; onFlowMode: (m: FlowMode) => void;
  focusOnly: boolean; onFocusOnly: (v: boolean) => void;
  onOpenLayerRecords: (layer: MemoryLayer) => void;
}) {
  const active = memoryLayers.find((l) => l.id === selectedLayer) ?? memoryLayers[0];
  const visibleFlows = memoryFlows.filter((f) => f.modes.includes(flowMode));
  const flowLayerIds = new Set(visibleFlows.flatMap((f) => [f.from, f.to]));
  const layers = focusOnly ? memoryLayers.filter((l) => flowLayerIds.has(l.id) || l.id === selectedLayer) : memoryLayers;

  const modes: { id: FlowMode; label: string }[] = [
    { id: "data", label: "Show Data Flow" }, { id: "governance", label: "Show Governance Flow" },
    { id: "decision", label: "Show Decision Flow" }, { id: "learning", label: "Show Learning Loop" },
  ];

  return (
    <Panel id="panel-architecture" title="Enterprise Memory Architecture"
      subtitle="Nine coordinated memory layers — preserve evidence, structure meaning, connect context, control access, remember decisions, observe outcomes, learn continuously"
      actions={
        <>
          {modes.map((m) => (
            <Button key={m.id} size="sm" variant={flowMode === m.id ? "default" : "outline"} className="h-7 text-[11px]"
              onClick={() => onFlowMode(m.id)}>{m.label}</Button>
          ))}
          <Button size="sm" variant={focusOnly ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => onFocusOnly(!focusOnly)}>Focus Layer</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { onFlowMode("data"); onFocusOnly(false); onSelect("evidence-vault"); }}>Reset</Button>
        </>
      }>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <ol className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
            {layers.map((l) => {
              const isActive = l.id === active.id;
              return (
                <li key={l.id}>
                  <button type="button" onClick={() => onSelect(l.id)}
                    aria-pressed={isActive}
                    className={cn("h-full w-full rounded-lg border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      isActive ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300")}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-900">{l.sequence}. {l.name}</span>
                      <Pill label={l.status} tone={memTone(l.status)} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-[10.5px] text-slate-500">{l.purpose}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {l.metrics.map((m) => (
                        <span key={m.label} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9.5px] text-slate-600">
                          <strong className="font-semibold text-slate-800">{m.value}</strong> {m.label}
                        </span>
                      ))}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Flows — {modes.find((m) => m.id === flowMode)?.label}</p>
            <ul className="mt-1 grid gap-1 md:grid-cols-2">
              {visibleFlows.map((f) => (
                <li key={f.id} className="flex items-center gap-1.5 text-[10.5px] text-slate-600">
                  <span className="text-blue-500" aria-hidden>→</span>{f.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Selected Layer</p>
          <h3 className="text-[13px] font-semibold text-slate-900">{active.name}</h3>
          <p className="mt-1 text-[11px] text-slate-600">{active.purpose}</p>
          <dl className="mt-2">
            {active.metrics.map((m) => <Row key={m.label} label={m.label} value={m.value} />)}
            <Row label="Storage responsibility" value={active.storageResponsibility} />
            <Row label="Consumers" value={active.consumers.join(", ")} />
            <Row label="Status" value={<Pill label={active.status} tone={memTone(active.status)} />} />
          </dl>
          <Button size="sm" variant="outline" className="mt-2 h-7 w-full text-[11px]" onClick={() => onOpenLayerRecords(active)}>
            Open {active.name} records
          </Button>
          <p className="sr-only">
            Architecture summary: {memoryLayers.map((l) => `${l.sequence} ${l.name}: ${l.purpose}.`).join(" ")}
            Flows: {memoryFlows.map((f) => f.label).join("; ")}.
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------- lifecycle -------------------------------- */

export function LifecyclePanel({ selectedStage, onSelect }: { selectedStage: string; onSelect: (id: string) => void }) {
  return (
    <Panel id="panel-lifecycle" title="Enterprise Memory Lifecycle"
      subtitle="Thirteen governed stages from approved record intake through published learning">
      <ol className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
        {memoryLifecycleStages.map((s) => {
          const isActive = s.id === selectedStage;
          return (
            <li key={s.id}>
              <button type="button" onClick={() => onSelect(s.id)} aria-pressed={isActive}
                className={cn("h-full w-full rounded-lg border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  isActive ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300")}>
                <div className="flex items-start justify-between gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-900">{s.sequence}. {s.name}</span>
                  <Pill label={s.status} tone={memTone(s.status)} />
                </div>
                <div className="mt-1 grid grid-cols-2 gap-x-2 text-[10px] text-slate-600">
                  <span>Processed {s.processedCount.toLocaleString()}</span>
                  <span>Pending {s.pendingCount.toLocaleString()}</span>
                  <span>Success {s.successRate}%</span>
                  <span>Avg {s.averageDuration}</span>
                  <span>P95 {s.p95Duration}</span>
                  <span>Warn {s.warningCount}</span>
                  <span>Fail {s.failedCount}</span>
                  <span>{s.throughput}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[9.5px] text-slate-500">
                  <span>{s.owner}</span><span>{s.slaStatus}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {lifecycleCallouts.map((c) => (
          <button key={c.id} type="button" onClick={() => onSelect(c.stageId)}
            className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10.5px] text-slate-700 hover:border-blue-300">
            <Pill label={c.severity} tone={memTone(c.severity === "Improving" ? "Indexing" : c.severity)} /> <span className="ml-1">{c.text}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}

/* --------------------------- selected lifecycle --------------------------- */

const stageTabs = ["Overview", "Queue", "Quality Issues", "Freshness", "Evidence", "Outputs", "Configuration"] as const;

export function SelectedStagePanel({ stage, paused, onPause, onResume, onRetry, onReprocess, onOpenExplorer, onViewLogs, onOpenRecord }: {
  stage: MemoryLifecycleStage; paused: boolean;
  onPause: () => void; onResume: () => void; onRetry: () => void; onReprocess: () => void;
  onOpenExplorer: () => void; onViewLogs: () => void; onOpenRecord: (id: string) => void;
}) {
  const [tab, setTab] = useState<(typeof stageTabs)[number]>("Overview");
  const status = paused ? "Paused" : stage.status;
  return (
    <Panel id="panel-stage" title={`Selected Lifecycle Stage — ${stage.name}`} subtitle={stage.summary}
      actions={
        <>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={paused ? onResume : onPause}>{paused ? "Resume Stage" : "Pause Stage"}</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onRetry}>Retry</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onReprocess}>Reprocess</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onOpenExplorer}>Open Memory Explorer</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onViewLogs}>View Logs</Button>
        </>
      }>
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-6">
        {[
          ["Status", status], ["Records Processing", stage.pendingCount.toLocaleString()],
          ["Completed This Hour", stage.completedThisHour.toLocaleString()], ["Review Required", String(stage.reviewRequired)],
          ["Average Duration", stage.averageDuration], ["P95 Duration", stage.p95Duration],
          ["Success Rate", `${stage.successRate}%`], ["Throughput", stage.throughput],
          ["SLA", stage.slaStatus], ["Owner", stage.owner],
          ["Configuration Version", stage.configurationVersion], ["Failures", String(stage.failedCount)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5">
            <p className="text-[9.5px] uppercase tracking-wide text-slate-500">{k}</p>
            <p className="text-[12px] font-semibold text-slate-900">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-1" role="tablist" aria-label="Stage detail tabs">
        {stageTabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded px-2 py-1 text-[11px]", tab === t ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{t}</button>
        ))}
      </div>

      <div className="mt-2">
        {tab === "Overview" && (
          <dl className="grid gap-x-6 md:grid-cols-2">
            <Row label="Stage purpose" value={stage.summary} />
            <Row label="Sequence" value={`${stage.sequence} of ${memoryLifecycleStages.length}`} />
            <Row label="Processed" value={stage.processedCount.toLocaleString()} />
            <Row label="Warnings" value={stage.warningCount} />
            <Row label="Failures" value={stage.failedCount} />
            <Row label="Owner" value={stage.owner} />
          </dl>
        )}
        {tab === "Queue" && (
          <table className="w-full text-left text-[11px]">
            <thead className="text-[10px] uppercase tracking-wide text-slate-500">
              <tr><th className="py-1">Batch</th><th>Records</th><th>Age</th><th>Status</th><th>Owner</th></tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="py-1 font-medium text-slate-800">BATCH {4200 + i}</td>
                  <td>{(stage.pendingCount / (i + 4)).toFixed(0)}</td>
                  <td>{i * 7} min</td>
                  <td><Pill label={i === 3 ? "Warning" : "Running"} tone={memTone(i === 3 ? "Warning" : "Running")} /></td>
                  <td>{stage.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "Quality Issues" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[10px] uppercase tracking-wide text-slate-500">
                <tr><th className="py-1">Record</th><th>Memory Type</th><th>Issue</th><th>Severity</th><th>Quality Impact</th><th>Owner</th><th>Evidence State</th><th>Recommended Action</th><th>Status</th></tr>
              </thead>
              <tbody>
                {qualityIssues.map((q) => (
                  <tr key={q.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-1">
                      <button type="button" className="font-medium text-blue-700 hover:underline" onClick={() => onOpenRecord(q.record.split(" ").slice(0, 2).join(" "))}>{q.record}</button>
                    </td>
                    <td>{q.memoryType}</td><td>{q.issue}</td>
                    <td><Pill label={q.severity} tone={memTone(q.severity)} /></td>
                    <td>{q.qualityImpact}</td><td>{q.owner}</td><td>{q.evidenceState}</td><td>{q.recommendedAction}</td>
                    <td><Pill label={q.status} tone={memTone(q.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "Freshness" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-[10px] uppercase tracking-wide text-slate-500">
                <tr><th className="py-1">Record</th><th>Last Source Update</th><th>Memory Update</th><th>Freshness SLA</th><th>Current Age</th><th>Affected Consumers</th><th>Status</th></tr>
              </thead>
              <tbody>
                {freshnessRows.map((f) => (
                  <tr key={f.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-1">
                      <button type="button" className="font-medium text-blue-700 hover:underline" onClick={() => onOpenRecord(f.record.split(" ").slice(0, 2).join(" "))}>{f.record}</button>
                    </td>
                    <td>{f.lastSourceUpdate}</td><td>{f.memoryUpdate}</td><td>{f.freshnessSla}</td><td>{f.currentAge}</td><td>{f.affectedConsumers}</td>
                    <td><Pill label={f.status} tone={memTone(f.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "Evidence" && (
          <ul className="space-y-1 text-[11px] text-slate-600">
            <li>98% of records processed by this stage carry complete provenance to an exact source passage.</li>
            <li>Content hashes verified for 99.4% of linked evidence references.</li>
            <li>1,284 records require an additional supporting evidence source before authority can be raised.</li>
          </ul>
        )}
        {tab === "Outputs" && (
          <ul className="space-y-1 text-[11px] text-slate-600">
            <li>Validated memory records published to the Semantic Index and Context Graph.</li>
            <li>Quality and freshness scores written back to each memory record.</li>
            <li>Review tasks emitted for records failing evidence, ownership, or freshness thresholds.</li>
          </ul>
        )}
        {tab === "Configuration" && (
          <dl className="grid gap-x-6 md:grid-cols-2">
            <Row label="Configuration version" value={stage.configurationVersion} />
            <Row label="Freshness SLA policy" value="90 days default, 180 days policy records" />
            <Row label="Quality threshold" value="90 composite, 95 for Tier 1 domains" />
            <Row label="Authority floor" value="Supporting or better for publication" />
            <Row label="Access enforcement" value="Record level classification and residency" />
            <Row label="Retry policy" value="3 attempts, exponential backoff" />
          </dl>
        )}
      </div>
    </Panel>
  );
}

/* -------------------------------- explorer -------------------------------- */

type Column = { key: string; label: string; get: (r: MemoryRecord) => React.ReactNode; sort?: (r: MemoryRecord) => string | number };

export const explorerColumns: Record<MemoryView, Column[]> = {
  explorer: [
    { key: "id", label: "Memory ID", get: (r) => r.id, sort: (r) => r.id },
    { key: "title", label: "Record Name / Statement", get: (r) => r.title, sort: (r) => r.title },
    { key: "type", label: "Memory Type", get: (r) => r.recordType, sort: (r) => r.recordType },
    { key: "domain", label: "Knowledge Domain", get: (r) => r.knowledgeDomains.join(", "), sort: (r) => r.knowledgeDomains[0] },
    { key: "owner", label: "Owner", get: (r) => r.owner, sort: (r) => r.owner },
    { key: "authority", label: "Authority", get: (r) => <Pill label={r.authorityLevel} tone={memTone(r.authorityLevel)} />, sort: (r) => r.authorityLevel },
    { key: "approval", label: "Approval", get: (r) => <Pill label={r.approvalState} tone={memTone(r.approvalState)} />, sort: (r) => r.approvalState },
    { key: "confidence", label: "Confidence", get: (r) => `${r.confidence}%`, sort: (r) => r.confidence },
    { key: "freshness", label: "Freshness", get: (r) => <Pill label={r.freshnessStatus} tone={memTone(r.freshnessStatus)} />, sort: (r) => r.freshnessStatus },
    { key: "evidence", label: "Evidence Count", get: (r) => r.evidenceCount, sort: (r) => r.evidenceCount },
    { key: "relationships", label: "Relationships", get: (r) => r.relationshipCount, sort: (r) => r.relationshipCount },
    { key: "access", label: "Access Classification", get: (r) => r.accessClassification, sort: (r) => r.accessClassification },
    { key: "version", label: "Version", get: (r) => r.version, sort: (r) => r.version },
    { key: "updated", label: "Last Updated", get: (r) => r.updatedAt, sort: (r) => r.updatedAt },
  ],
  executive: [
    { key: "title", label: "Record", get: (r) => r.title, sort: (r) => r.title },
    { key: "type", label: "Memory Type", get: (r) => r.recordType, sort: (r) => r.recordType },
    { key: "domain", label: "Domain", get: (r) => r.knowledgeDomains.join(", "), sort: (r) => r.knowledgeDomains[0] },
    { key: "owner", label: "Owner", get: (r) => r.owner, sort: (r) => r.owner },
    { key: "quality", label: "Quality", get: (r) => r.qualityScore, sort: (r) => r.qualityScore },
    { key: "freshness", label: "Freshness", get: (r) => <Pill label={r.freshnessStatus} tone={memTone(r.freshnessStatus)} />, sort: (r) => r.freshnessStatus },
    { key: "reuse", label: "Reuse Count", get: (r) => r.reuseCount, sort: (r) => r.reuseCount },
    { key: "impact", label: "Decision Impact", get: (r) => r.decisionImpact, sort: (r) => r.decisionImpact },
    { key: "status", label: "Status", get: (r) => <Pill label={r.approvalState} tone={memTone(r.approvalState)} />, sort: (r) => r.approvalState },
  ],
  governance: [
    { key: "id", label: "Memory ID", get: (r) => r.id, sort: (r) => r.id },
    { key: "title", label: "Record", get: (r) => r.title, sort: (r) => r.title },
    { key: "type", label: "Memory Type", get: (r) => r.recordType, sort: (r) => r.recordType },
    { key: "owner", label: "Owner", get: (r) => r.owner, sort: (r) => r.owner },
    { key: "authority", label: "Authority", get: (r) => <Pill label={r.authorityLevel} tone={memTone(r.authorityLevel)} />, sort: (r) => r.authorityLevel },
    { key: "approval", label: "Approval", get: (r) => <Pill label={r.approvalState} tone={memTone(r.approvalState)} />, sort: (r) => r.approvalState },
    { key: "access", label: "Access", get: (r) => r.accessClassification, sort: (r) => r.accessClassification },
    { key: "coverage", label: "Evidence Coverage", get: (r) => `${r.evidenceCoverage}%`, sort: (r) => r.evidenceCoverage },
    { key: "freshness", label: "Freshness", get: (r) => <Pill label={r.freshnessStatus} tone={memTone(r.freshnessStatus)} />, sort: (r) => r.freshnessStatus },
    { key: "review", label: "Review State", get: (r) => r.reviewState, sort: (r) => r.reviewState },
  ],
  architecture: [
    { key: "id", label: "Memory ID", get: (r) => r.id, sort: (r) => r.id },
    { key: "type", label: "Record Type", get: (r) => r.recordType, sort: (r) => r.recordType },
    { key: "layer", label: "Memory Layer", get: (r) => r.memoryLayer, sort: (r) => r.memoryLayer },
    { key: "sources", label: "Source Records", get: (r) => r.sourceRecordIds.join(", ") || "—", sort: (r) => r.sourceRecordIds.length },
    { key: "relationships", label: "Graph Relationships", get: (r) => r.relationshipCount, sort: (r) => r.relationshipCount },
    { key: "index", label: "Index Status", get: (r) => <Pill label={r.indexStatus} tone={memTone(r.indexStatus)} />, sort: (r) => r.indexStatus },
    { key: "consumers", label: "Consumer Services", get: (r) => r.consumerIds.join(", "), sort: (r) => r.consumerIds.length },
    { key: "version", label: "Version", get: (r) => r.version, sort: (r) => r.version },
    { key: "status", label: "Status", get: (r) => <Pill label={r.approvalState} tone={memTone(r.approvalState)} />, sort: (r) => r.approvalState },
  ],
};

const densityPad: Record<Density, string> = { compact: "py-0.5", standard: "py-1.5", comfortable: "py-2.5" };

export function ExplorerPanel({
  records, view, density, hiddenColumns, selected, onToggleSelect, onToggleAll,
  onOpenRecord, loading, page, pageSize, onPage, sortKey, sortDir, onSort, actions,
}: {
  records: MemoryRecord[]; view: MemoryView; density: Density; hiddenColumns: string[];
  selected: Set<string>; onToggleSelect: (id: string) => void; onToggleAll: (ids: string[]) => void;
  onOpenRecord: (r: MemoryRecord) => void; loading: boolean;
  page: number; pageSize: number; onPage: (p: number) => void;
  sortKey: string; sortDir: "asc" | "desc"; onSort: (k: string) => void;
  actions?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const cols = explorerColumns[view].filter((c) => !hiddenColumns.includes(c.key));
  const sorted = useMemo(() => {
    const col = explorerColumns[view].find((c) => c.key === sortKey);
    if (!col?.sort) return records;
    const s = [...records].sort((a, b) => {
      const av = col.sort!(a), bv = col.sort!(b);
      return typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    });
    return sortDir === "asc" ? s : s.reverse();
  }, [records, view, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = sorted.slice((page - 1) * pageSize, page * pageSize);
  const allSelected = current.length > 0 && current.every((r) => selected.has(r.id));

  return (
    <Panel id="panel-explorer" title="Enterprise Memory Explorer"
      subtitle={`${records.length} governed memory records match the current filters`} actions={actions}>
      {loading ? <PanelSkeleton rows={6} /> : current.length === 0 ? (
        <EmptyState message="No memory records match the current filters" hint="Clear filters or broaden the search to see governed records." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-8 py-1">
                  <input type="checkbox" aria-label="Select all rows on this page" checked={allSelected}
                    onChange={() => onToggleAll(current.map((r) => r.id))} />
                </th>
                {cols.map((c) => (
                  <th key={c.key} className="whitespace-nowrap py-1 pr-3">
                    <button type="button" className="inline-flex items-center gap-0.5 hover:text-slate-800" onClick={() => onSort(c.key)}>
                      {c.label}
                      {sortKey === c.key && (sortDir === "asc" ? <ChevronUp className="h-3 w-3" aria-hidden /> : <ChevronDown className="h-3 w-3" aria-hidden />)}
                    </button>
                  </th>
                ))}
                <th className="py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {current.map((r) => (
                <Fragment key={r.id}>
                  <tr className="cursor-pointer border-t border-slate-100 hover:bg-slate-50" onClick={() => onOpenRecord(r)}>
                    <td className={densityPad[density]} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" aria-label={`Select ${r.id}`} checked={selected.has(r.id)} onChange={() => onToggleSelect(r.id)} />
                    </td>
                    {cols.map((c) => (
                      <td key={c.key} className={cn("pr-3 align-top", densityPad[density])}>
                        <span className="line-clamp-2 text-slate-700">{c.get(r)}</span>
                      </td>
                    ))}
                    <td className={densityPad[density]} onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenRecord(r)}>Open</Button>
                        <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]"
                          onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                          aria-expanded={expanded === r.id}>Relationships</Button>
                      </div>
                    </td>
                  </tr>
                  {expanded === r.id && (
                    <tr className="border-t border-slate-100 bg-slate-50">
                      <td colSpan={cols.length + 2} className="px-2 py-2">
                        <p className="text-[10.5px] text-slate-600">
                          <strong>{r.relationshipCount}</strong> relationships · teams {r.teamIds.join(", ") || "—"} · services {r.serviceIds.join(", ") || "—"} ·
                          source records {r.sourceRecordIds.join(", ") || "—"} · consumers {r.consumerIds.join(", ")}
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{selected.size} selected · page {page} of {pageCount}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-6 text-[10px]" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px]" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------ context graph ------------------------------ */

const lineageModes = ["decision", "outcome", "learning", "evidence"] as const;
export type LineageMode = (typeof lineageModes)[number];

export function ContextGraphPanel({ onOpenRecord }: { onOpenRecord: (recordId: string) => void }) {
  const [node, setNode] = useState<GraphNode | null>(graphNodes[0]);
  const [edge, setEdge] = useState<GraphEdge | null>(null);
  const [relType, setRelType] = useState<string>("All");
  const [memType, setMemType] = useState<string>("All");
  const [directOnly, setDirectOnly] = useState(false);
  const [direction, setDirection] = useState<"both" | "upstream" | "downstream">("both");
  const [lineage, setLineage] = useState<LineageMode | "all">("all");
  const [zoom, setZoom] = useState(1);

  const center = node?.id ?? "n-payments";
  const edges = graphEdges.filter((e) => {
    if (relType !== "All" && e.type !== relType) return false;
    if (lineage !== "all" && !e.lineage.includes(lineage)) return false;
    if (directOnly && e.from !== center && e.to !== center) return false;
    if (direction === "upstream" && e.to !== center) return false;
    if (direction === "downstream" && e.from !== center) return false;
    return true;
  });
  const visibleNodeIds = new Set(edges.flatMap((e) => [e.from, e.to]));
  const nodes = graphNodes.filter((n) => (memType === "All" || n.memoryType === memType) && (!directOnly || visibleNodeIds.has(n.id) || n.id === center));

  const pos = (id: string) => graphNodes.find((n) => n.id === id)!;

  return (
    <Panel id="panel-graph" title="Enterprise Context Graph"
      subtitle="Teams, systems, services, conditions, controls, decisions, outcomes, and learning connected by typed relationships"
      actions={
        <>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setZoom(1)}>Zoom to Fit</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}>Zoom In</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { setRelType("All"); setMemType("All"); setDirectOnly(false); setDirection("both"); setLineage("all"); setZoom(1); setNode(graphNodes[0]); setEdge(null); }}>Reset</Button>
        </>
      }>
      <div className="mb-2 flex flex-wrap items-end gap-1.5">
        <label className="flex flex-col gap-0.5">
          <span className="text-[9.5px] uppercase tracking-wide text-slate-500">Relationship Type</span>
          <select value={relType} onChange={(e) => setRelType(e.target.value)} className="h-7 rounded-md border border-slate-200 px-1.5 text-[11px]">
            {["All", "OWNS", "DEPENDS ON", "PROVIDES TO", "SUPPORTS", "MEASURED BY", "GOVERNED BY", "REQUIRES APPROVAL FROM", "INFORMED", "RESULTED IN", "UPDATED BY", "LEARNED FROM"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[9.5px] uppercase tracking-wide text-slate-500">Memory Type</span>
          <select value={memType} onChange={(e) => setMemType(e.target.value)} className="h-7 rounded-md border border-slate-200 px-1.5 text-[11px]">
            {["All", "Team", "Service", "Entity", "Business Condition", "Control", "Decision", "Outcome", "Learning Record", "Journey"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <Button size="sm" variant={directOnly ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => setDirectOnly((v) => !v)}>Direct Relationships Only</Button>
        <Button size="sm" variant={direction === "upstream" ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => setDirection(direction === "upstream" ? "both" : "upstream")}>Show Upstream</Button>
        <Button size="sm" variant={direction === "downstream" ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => setDirection(direction === "downstream" ? "both" : "downstream")}>Show Downstream</Button>
        {(["decision", "outcome", "learning", "evidence"] as LineageMode[]).map((m) => (
          <Button key={m} size="sm" variant={lineage === m ? "default" : "outline"} className="h-7 text-[11px]"
            onClick={() => setLineage(lineage === m ? "all" : m)}>
            {m === "decision" ? "Show Decision Lineage" : m === "outcome" ? "Show Outcome Lineage" : m === "learning" ? "Show Learning Loop" : "Show Evidence Chain"}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="relative h-[420px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            {edges.map((e) => {
              const a = pos(e.from), b = pos(e.to);
              const isSel = edge?.id === e.id;
              return (
                <line key={e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={isSel ? "#2563eb" : "#cbd5e1"} strokeWidth={isSel ? 0.5 : 0.25} vectorEffect="non-scaling-stroke" />
              );
            })}
          </svg>
          <div className="absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
            {nodes.map((n) => (
              <button key={n.id} type="button" onClick={() => { setNode(n); setEdge(null); }}
                className={cn("absolute -translate-x-1/2 -translate-y-1/2 rounded-md border px-1.5 py-0.5 text-[9.5px] font-medium shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  n.id === center ? "border-blue-500 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-blue-400")}
                style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                {n.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="rounded-lg border border-slate-200 p-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Selected Node</p>
            {node ? (
              <>
                <h3 className="text-[12.5px] font-semibold text-slate-900">{node.label}</h3>
                <dl>
                  <Row label="Type" value={node.type} />
                  <Row label="Owner" value={node.owner} />
                  <Row label="Summary" value={node.summary} />
                </dl>
                {node.recordId && (
                  <Button size="sm" variant="outline" className="mt-1.5 h-7 w-full text-[11px]" onClick={() => onOpenRecord(node.recordId!)}>Open memory record</Button>
                )}
              </>
            ) : <p className="text-[11px] text-slate-500">Select a node.</p>}
          </div>
          <div className="rounded-lg border border-slate-200 p-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Relationships ({edges.length})</p>
            <ul className="mt-1 max-h-[150px] space-y-0.5 overflow-y-auto">
              {edges.map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => setEdge(e)}
                    className={cn("w-full rounded px-1 py-0.5 text-left text-[10.5px] hover:bg-slate-50", edge?.id === e.id && "bg-blue-50 text-blue-800")}>
                    {pos(e.from).label} <span className="font-semibold">{e.type}</span> {pos(e.to).label}
                  </button>
                </li>
              ))}
            </ul>
            {edge && (
              <div className="mt-1.5 rounded border border-slate-200 bg-slate-50 p-1.5 text-[10.5px] text-slate-600">
                <p><strong>Supporting evidence:</strong> {edge.evidence}</p>
                <p>Confidence {edge.confidence}% · lineage {edge.lineage.join(", ")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="sr-only">
        Relationship summary: {graphEdges.map((e) => `${pos(e.from).label} ${e.type} ${pos(e.to).label}, evidence ${e.evidence}`).join("; ")}.
      </p>
    </Panel>
  );
}

/* ------------------------------- composition ------------------------------- */

const compositionModes = ["Count", "Growth", "Quality", "Freshness", "Access"] as const;

export function CompositionPanel({ onFilterType }: { onFilterType: (t: string) => void }) {
  const [mode, setMode] = useState<(typeof compositionModes)[number]>("Count");
  const max = Math.max(...memoryComposition.map((c) => c.numeric));
  const metric = (c: CompositionRow) =>
    mode === "Count" ? c.count : mode === "Growth" ? c.growth : mode === "Quality" ? `${c.quality} / 100`
      : mode === "Freshness" ? `${c.freshness}% current` : c.access;
  const bar = (c: CompositionRow) =>
    mode === "Count" ? (Math.log10(c.numeric) / Math.log10(max)) * 100
      : mode === "Growth" ? parseFloat(c.growth) * 18
        : mode === "Quality" ? c.quality : mode === "Freshness" ? c.freshness : 60;

  return (
    <Panel id="panel-composition" title="Enterprise Memory Composition"
      subtitle="What the enterprise memory layer is actually made of"
      actions={compositionModes.map((m) => (
        <Button key={m} size="sm" variant={mode === m ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => setMode(m)}>{m}</Button>
      ))}>
      <ul className="space-y-1">
        {memoryComposition.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => onFilterType(c.filterType)}
              className="w-full rounded px-1 py-0.5 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-700">{c.label}</span>
                <span className="font-semibold text-slate-900">{metric(c)}</span>
              </div>
              <div className="mt-0.5 h-1.5 w-full rounded-full bg-slate-100">
                <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${Math.max(4, Math.min(100, bar(c)))}%` }} />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ----------------------------- quality & trust ----------------------------- */

export function QualityPanel({ onOpenDimension }: { onOpenDimension: (key: string) => void }) {
  return (
    <Panel id="panel-quality" title="Memory Quality & Trust"
      subtitle={`Composite score ${memoryQuality.overallScore} / 100 across eleven governed dimensions`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[26px] font-bold leading-none text-slate-900">{memoryQuality.overallScore}</span>
        <span className="text-[11px] text-slate-500">/ 100 · target 95</span>
        <Progress value={memoryQuality.overallScore} className="h-1.5 flex-1" />
      </div>
      <ul className="space-y-1">
        {memoryQuality.dimensions.map((d) => {
          const variance = d.current - d.target;
          const up = d.trend[d.trend.length - 1] >= d.trend[0];
          return (
            <li key={d.key}>
              <button type="button" onClick={() => onOpenDimension(d.key)}
                className="w-full rounded border border-slate-200 px-1.5 py-1 text-left hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-700">{d.name}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900">{d.current}</span>
                    <span className="text-[10px] text-slate-500">target {d.target}</span>
                    <span className={cn("text-[10px]", variance >= 0 ? "text-emerald-600" : "text-amber-600")}>{variance >= 0 ? "+" : ""}{variance}</span>
                    <span className="text-[10px] text-slate-500" aria-hidden>{up ? "▲" : "▼"}</span>
                    <Pill label={d.status} tone={memTone(d.status)} />
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">{d.affectedRecords}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/* --------------------------- freshness & authority ------------------------- */

export function FreshnessAuthorityPanel({ onOpenRecord, onOpenEvidence, onAssignReview }: {
  onOpenRecord: (id: string) => void; onOpenEvidence: (id: string) => void; onAssignReview: (id: string) => void;
}) {
  const bar = (items: { label: string; value: number; tone: Tone }[]) => (
    <ul className="space-y-1">
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600">{i.label}</span>
            <span className="font-semibold text-slate-900">{i.value}%</span>
          </div>
          <div className="mt-0.5 h-1.5 w-full rounded-full bg-slate-100">
            <div className={cn("h-1.5 rounded-full",
              i.tone === "green" ? "bg-emerald-500" : i.tone === "amber" ? "bg-amber-500" : i.tone === "red" ? "bg-red-500" : i.tone === "blue" ? "bg-blue-500" : "bg-slate-400")}
              style={{ width: `${i.value}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
  return (
    <Panel id="panel-freshness" title="Freshness & Authority" subtitle="How current the memory is and how strongly it is sourced">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Freshness</p>
          {bar(freshnessDistribution)}
        </div>
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Authority</p>
          {bar(authorityDistribution)}
        </div>
      </div>
      <div className="mt-2">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Records requiring attention</p>
        <ul className="space-y-1">
          {attentionRecords.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-1.5 rounded border border-slate-200 px-1.5 py-1">
              <div>
                <p className="text-[11px] font-medium text-slate-800">{a.label}</p>
                <p className="text-[10px] text-slate-500">{a.reason}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenRecord(a.recordId)}>Open Record</Button>
                <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenEvidence(a.recordId)}>Open Evidence</Button>
                <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => onAssignReview(a.recordId)}>Assign Review</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

/* ------------------------------ indexing jobs ------------------------------ */

export function IndexingPanel({ jobs, onOpenJob }: { jobs: MemoryIndexingJob[]; onOpenJob: (j: MemoryIndexingJob) => void }) {
  return (
    <Panel id="panel-indexing" title="Active Memory Indexing Jobs" subtitle="Indexing work currently running across memory layers">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead className="text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-1">Job ID</th><th>Memory Layer</th><th>Scope</th><th>Status</th><th>Records</th>
              <th>Indexed</th><th>Pending</th><th>Failures</th><th>Coverage</th><th>Started</th><th>Elapsed</th><th>Owner</th><th>Warnings</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50" onClick={() => onOpenJob(j)}>
                <td className="py-1 font-medium text-blue-700">{j.id}</td>
                <td>{j.memoryLayer}</td><td>{j.scope}</td>
                <td><Pill label={j.status} tone={memTone(j.status)} /></td>
                <td>{j.recordCount.toLocaleString()}</td><td>{j.indexedCount.toLocaleString()}</td>
                <td>{j.pendingCount.toLocaleString()}</td><td>{j.failedCount}</td><td>{j.coverage}%</td>
                <td>{j.startedAt}</td><td>{j.elapsedTime}</td><td>{j.owner}</td>
                <td className="max-w-[180px] truncate">{j.warnings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* --------------------------- provenance lineage ---------------------------- */

const chainModes = [
  { id: "evidence", label: "Show Evidence Chain" }, { id: "approval", label: "Show Approval Chain" },
  { id: "decision", label: "Show Decision Chain" }, { id: "outcome", label: "Show Outcome Chain" },
  { id: "learning", label: "Show Learning Loop" },
] as const;

export function ProvenancePanel({ onOpenRecord }: { onOpenRecord: (recordId: string) => void }) {
  const [chain, setChain] = useState<string>("evidence");
  const [selected, setSelected] = useState<LineageNode>(lineageNodes[0]);
  const nodes = lineageNodes.filter((n) => n.chains.includes(chain as LineageNode["chains"][number]));

  return (
    <Panel id="panel-provenance" title="Provenance & Decision Lineage"
      subtitle="From the original source artifact to the validated organizational lesson"
      actions={chainModes.map((c) => (
        <Button key={c.id} size="sm" variant={chain === c.id ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => setChain(c.id)}>{c.label}</Button>
      ))}>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ol className="space-y-1">
          {nodes.map((n, i) => (
            <li key={n.id}>
              <button type="button" onClick={() => setSelected(n)}
                className={cn("w-full rounded-lg border p-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  selected.id === n.id ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300")}>
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-900">{n.label}</span>
                  <span className="flex items-center gap-1">
                    <Pill label={n.type} tone="blue" />
                    <Pill label={n.status} tone={memTone(n.status)} />
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {n.id} · {n.owner} · {n.timestamp} · {n.authority} · {n.confidence}% · {n.access} · {n.version}
                </p>
              </button>
              {i < nodes.length - 1 && <div className="ml-3 text-[11px] text-slate-400" aria-hidden>↓</div>}
            </li>
          ))}
        </ol>
        <div className="rounded-lg border border-slate-200 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Selected Lineage Node</p>
          <h3 className="text-[12.5px] font-semibold text-slate-900">{selected.label}</h3>
          <dl>
            <Row label="ID" value={selected.id} />
            <Row label="Type" value={selected.type} />
            <Row label="Owner" value={selected.owner} />
            <Row label="Timestamp" value={selected.timestamp} />
            <Row label="Authority" value={selected.authority} />
            <Row label="Confidence" value={`${selected.confidence}%`} />
            <Row label="Access" value={selected.access} />
            <Row label="Version" value={selected.version} />
            <Row label="Status" value={<Pill label={selected.status} tone={memTone(selected.status)} />} />
            <Row label="Detail" value={selected.detail} />
          </dl>
          {selected.recordId && (
            <Button size="sm" variant="outline" className="mt-1.5 h-7 w-full text-[11px]" onClick={() => onOpenRecord(selected.recordId!)}>Open memory record</Button>
          )}
        </div>
      </div>
    </Panel>
  );
}
