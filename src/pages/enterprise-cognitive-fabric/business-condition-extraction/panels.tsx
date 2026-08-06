import React, { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, ChevronDown, ChevronRight, CircleCheck, CircleDot, ExternalLink,
  Layers, Link2, Pause, Play, RotateCcw, ScrollText, Search, ShieldCheck, Workflow, ZoomIn, ZoomOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  authorityDistribution, authorityEvidence, canonicalContext, conditionTypeDistribution, conflicts,
  dependencies, evidenceSections, gaps, graphEdges, graphNodes, metricModels, publishingDestinations,
  qualityDimensions, relationshipTypes, stageConfiguration, stageOutputs, stageQueue, taxonomy,
  workbenchArtifact, evidenceReferences,
  type BusinessCondition, type ConditionCandidate, type ConditionReadiness, type ExtractionJob,
  type ExtractionStage, type MetricModel, type Tone, type ViewMode,
} from "./data";

export type Density = "comfortable" | "compact";

export const nf = (n: number) => n.toLocaleString("en-US");
export const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : `${n}`;

export const toneClass = (t: Tone) =>
  t === "green" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : t === "amber" ? "text-amber-700 bg-amber-50 border-amber-200"
    : t === "red" ? "text-red-700 bg-red-50 border-red-200"
    : t === "blue" ? "text-blue-700 bg-blue-50 border-blue-200"
    : "text-slate-700 bg-slate-50 border-slate-200";

export const statusTone = (status: string): Tone => {
  const s = status.toLowerCase();
  if (["running", "healthy", "approved", "complete", "current", "within sla", "operational"].some((k) => s.includes(k))) return "green";
  if (["warning", "review", "pending", "at risk", "near target", "aging", "degraded", "queued", "incomplete", "backlogged"].some((k) => s.includes(k))) return "amber";
  if (["blocked", "failed", "breached", "conflict", "below target", "stale", "critical"].some((k) => s.includes(k))) return "red";
  return "slate";
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10.5px] font-medium", toneClass(statusTone(status)))}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}

export function Panel({ id, title, subtitle, actions, children, className }: {
  id?: string; title: string; subtitle?: string; actions?: React.ReactNode;
  children: React.ReactNode; className?: string;
}) {
  return (
    <section id={id} className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)} aria-label={title}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <div className="min-w-0">
          <h2 className="text-[12.5px] font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-1.5">{actions}</div>}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

export function Metric({ label, value, sub, tone = "slate" }: { label: string; value: string; sub?: string; tone?: Tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn("text-[13px] font-semibold",
        tone === "green" ? "text-emerald-700" : tone === "amber" ? "text-amber-700" : tone === "red" ? "text-red-700" : "text-slate-900")}>{value}</p>
      {sub && <p className="text-[10.5px] text-slate-500">{sub}</p>}
    </div>
  );
}

export function SimpleTable({ headers, rows, empty, onRowClick, density = "compact" }: {
  headers: string[]; rows: React.ReactNode[][]; empty: string;
  onRowClick?: (index: number) => void; density?: Density;
}) {
  const pad = density === "compact" ? "px-2 py-1.5" : "px-3 py-2.5";
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200">
            {headers.map((h) => (
              <th key={h} scope="col" className={cn("text-[10.5px] font-semibold uppercase tracking-wide text-slate-500", pad)}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={headers.length} className="px-3 py-6 text-center text-[12px] text-slate-500">{empty}</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={i}
              onClick={onRowClick ? () => onRowClick(i) : undefined}
              className={cn("border-b border-slate-100 text-[11.5px] text-slate-700", onRowClick && "cursor-pointer hover:bg-slate-50")}>
              {r.map((c, j) => <td key={j} className={pad}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------- lifecycle */

export function LifecyclePanel({ stages, selectedId, onSelect, focus, onFocus, zoom, onZoom, callouts }: {
  stages: ExtractionStage[]; selectedId: string; onSelect: (id: string) => void;
  focus: string; onFocus: (f: string) => void; zoom: number; onZoom: (z: number) => void;
  callouts: { tone: Tone; text: string }[];
}) {
  const visible = stages.filter((s) => {
    if (focus === "bottlenecks") return s.slaStatus !== "Within SLA";
    if (focus === "conflicts") return s.id === "conflicts";
    if (focus === "review") return s.status === "Review Required";
    if (focus === "downstream") return ["validation", "publish"].includes(s.id);
    return true;
  });
  return (
    <Panel
      id="panel-lifecycle"
      title="Business Condition Extraction Lifecycle"
      subtitle="Ten measured stages from canonical artifact load to registry publication"
      actions={
        <>
          {[["all", "All stages"], ["bottlenecks", "Bottlenecks"], ["conflicts", "Conflicts"], ["review", "Review required"], ["downstream", "Downstream"]].map(([id, label]) => (
            <Button key={id} size="sm" variant={focus === id ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => onFocus(id)}>{label}</Button>
          ))}
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" aria-label="Zoom out" onClick={() => onZoom(Math.max(0.7, zoom - 0.1))}><ZoomOut className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" aria-label="Zoom to fit" onClick={() => onZoom(1)}><ZoomIn className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { onZoom(1); onFocus("all"); }}>Reset view</Button>
        </>
      }
    >
      <p className="sr-only">
        {stages.map((s) => `${s.sequence}. ${s.name}: ${s.status}, ${nf(s.processedCount)} processed, ${nf(s.pendingCount)} pending, ${s.successRate} percent success, average ${s.averageDuration}, P95 ${s.p95Duration}, ${s.slaStatus}.`).join(" ")}
      </p>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-stretch gap-1.5" style={{ transform: `scale(${zoom})`, transformOrigin: "left top" }}>
          {visible.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                title={`${s.name} — owner ${s.owner}, throughput ${s.throughput}`}
                aria-current={selectedId === s.id}
                className={cn("w-[186px] shrink-0 rounded-lg border p-2 text-left transition-colors",
                  selectedId === s.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50")}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={cn("text-[10px] font-semibold", selectedId === s.id ? "text-slate-300" : "text-slate-400")}>STAGE {s.sequence}</span>
                  {selectedId === s.id
                    ? <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9.5px]">{s.status}</span>
                    : <StatusPill status={s.status} />}
                </div>
                <p className={cn("mt-1 text-[11.5px] font-semibold leading-tight", selectedId === s.id ? "text-white" : "text-slate-900")}>{s.name}</p>
                <dl className={cn("mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]", selectedId === s.id ? "text-slate-300" : "text-slate-500")}>
                  <div><dt className="inline">Processed </dt><dd className="inline font-medium">{compact(s.processedCount)}</dd></div>
                  <div><dt className="inline">Pending </dt><dd className="inline font-medium">{compact(s.pendingCount)}</dd></div>
                  <div><dt className="inline">Success </dt><dd className="inline font-medium">{s.successRate}%</dd></div>
                  <div><dt className="inline">Avg </dt><dd className="inline font-medium">{s.averageDuration}</dd></div>
                  <div><dt className="inline">P95 </dt><dd className="inline font-medium">{s.p95Duration}</dd></div>
                  <div><dt className="inline">Warn </dt><dd className="inline font-medium">{nf(s.warningCount)}</dd></div>
                  <div><dt className="inline">Fail </dt><dd className="inline font-medium">{nf(s.failedCount)}</dd></div>
                  <div><dt className="inline">Thru </dt><dd className="inline font-medium">{s.throughput}</dd></div>
                </dl>
                <p className={cn("mt-1 truncate text-[10px]", selectedId === s.id ? "text-slate-300" : "text-slate-500")}>{s.owner} · {s.slaStatus}</p>
              </button>
              {i < visible.length - 1 && <div className="flex items-center text-slate-300"><ArrowRight className="h-3.5 w-3.5" aria-hidden /></div>}
            </React.Fragment>
          ))}
        </div>
      </div>
      <ul className="mt-3 grid gap-1.5 md:grid-cols-2">
        {callouts.map((c) => (
          <li key={c.text} className={cn("flex items-start gap-1.5 rounded-md border px-2 py-1.5 text-[11px]", toneClass(c.tone))}>
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{c.text}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ---------------------------------------------------------- stage detail */

export function StageDetailPanel({ stage, onAction }: { stage: ExtractionStage; onAction: (action: string) => void }) {
  return (
    <Panel
      id="panel-stage"
      title="Selected Stage Detail"
      subtitle={stage.name}
      actions={
        <>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction("Pause Stage")}><Pause className="mr-1 h-3 w-3" />Pause Stage</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction("Resume Stage")}><Play className="mr-1 h-3 w-3" />Resume Stage</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction("Retry Failures")}><RotateCcw className="mr-1 h-3 w-3" />Retry Failures</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction("Reprocess Selected")}>Reprocess Selected</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction("Open Workbench")}>Open Workbench</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction("View Logs")}><ScrollText className="mr-1 h-3 w-3" />View Logs</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-6">
        <Metric label="Status" value={stage.status} tone={statusTone(stage.status)} />
        <Metric label="Processing" value={compact(stage.pendingCount)} sub="conditions in flight" />
        <Metric label="Completed / hr" value={stage.throughput} />
        <Metric label="Review required" value={nf(stage.warningCount)} tone="amber" />
        <Metric label="Avg duration" value={stage.averageDuration} />
        <Metric label="P95 duration" value={stage.p95Duration} />
        <Metric label="Success rate" value={`${stage.successRate}%`} tone={stage.successRate >= 97 ? "green" : "amber"} />
        <Metric label="Throughput" value={stage.throughput} />
        <Metric label="SLA" value={stage.slaStatus} tone={statusTone(stage.slaStatus)} sub={stage.slaTarget} />
        <Metric label="Owner" value={stage.owner} />
        <Metric label="Configuration" value="cfg-2026.08.2" />
        <Metric label="Failures" value={nf(stage.failedCount)} tone="red" />
      </div>

      <Tabs defaultValue="overview" className="mt-3">
        <TabsList className="h-8">
          {["overview", "queue", "conflicts", "gaps", "evidence", "outputs", "configuration"].map((t) => (
            <TabsTrigger key={t} value={t} className="h-6 text-[11px] capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-2 text-[11.5px] text-slate-600">
          <p>
            {stage.name} evaluates upstream output for contradiction, overlap, and missing structure before any
            condition can reach human validation or the Conditions Registry. Upstream: {stage.upstreamStageId ?? "—"}.
            Downstream: {stage.downstreamStageId ?? "—"}.
          </p>
          <div className="mt-2 grid gap-1.5 md:grid-cols-3">
            <Metric label="Conflict records" value={nf(stageOutputs["Conflict Records"])} tone="red" />
            <Metric label="Gap records" value={nf(stageOutputs["Gap Records"])} tone="amber" />
            <Metric label="Review tasks" value={nf(stageOutputs["Review Tasks"])} tone="amber" />
          </div>
        </TabsContent>

        <TabsContent value="queue" className="mt-2">
          <SimpleTable
            headers={["Candidate ID", "Condition Statement", "Type", "Source", "Domain", "Authority", "Confidence", "Queue Age", "Status"]}
            empty="Queue is empty."
            rows={stageQueue.map((q) => [
              <span className="font-mono text-[11px]">{q.id}</span>, q.statement, q.type, q.source, q.domain,
              q.authority, `${q.confidence}%`, q.age, <StatusPill status={q.status} />,
            ])}
          />
        </TabsContent>

        <TabsContent value="conflicts" className="mt-2">
          <SimpleTable
            headers={["Condition A", "Condition B", "Conflict Type", "Value A", "Value B", "Authority A", "Authority B", "Effective Date", "Affected Teams", "Risk", "Review"]}
            empty="No conflicts detected."
            rows={conflicts.map((c) => [
              <span className="font-mono text-[11px]">{c.conditionAId}</span>,
              <span className="font-mono text-[11px]">{c.conditionBId}</span>,
              c.conflictType, c.valueA, c.valueB, c.authorityA, c.authorityB, c.effectiveDate,
              c.affectedTeamIds.join(", "), <StatusPill status={c.severity} />, c.reviewStatus,
            ])}
          />
        </TabsContent>

        <TabsContent value="gaps" className="mt-2">
          <SimpleTable
            headers={["Condition Candidate", "Missing Field", "Source", "Owner", "Confidence", "Required for Approval", "Recommended Action"]}
            empty="No gaps detected."
            rows={gaps.map((g) => [
              g.candidateStatement, g.missingField, g.source, g.owner, `${g.confidence}%`,
              g.requiredForApproval ? "Yes" : "No", g.recommendedAction,
            ])}
          />
        </TabsContent>

        <TabsContent value="evidence" className="mt-2">
          <SimpleTable
            headers={["Artifact", "Evidence Passage", "Page / Section", "Source Authority", "Evidence Confidence", "Permission State"]}
            empty="No evidence linked."
            rows={evidenceReferences.map((e) => [
              workbenchArtifact.title, <span className="line-clamp-2 max-w-[420px]">{e.passageText}</span>,
              `p.${e.pageNumber} · ${e.sectionId}`, e.sourceAuthority, `${e.evidenceConfidence}%`, e.accessClassification,
            ])}
          />
        </TabsContent>

        <TabsContent value="outputs" className="mt-2">
          <div className="grid gap-1.5 md:grid-cols-3">
            {Object.entries(stageOutputs).map(([k, v]) => <Metric key={k} label={k} value={nf(v)} />)}
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="mt-2">
          <SimpleTable headers={["Setting", "Value"]} empty="" rows={stageConfiguration.map(([k, v]) => [k, v])} />
        </TabsContent>
      </Tabs>
    </Panel>
  );
}

/* --------------------------------------------------------------- jobs */

export const jobColumns = [
  "Job ID", "Artifact or Batch", "Source", "Knowledge Domain", "Current Stage", "Status", "Artifacts",
  "Condition Candidates", "Approved Conditions", "Quality Score", "Confidence", "Started", "Elapsed",
  "Owner", "Warnings", "Actions",
];

export function JobTablePanel({
  jobs, density, onDensity, columns, onColumns, search, onSearch, statusFilter, onStatusFilter,
  selected, onSelected, onOpen, onExport,
}: {
  jobs: ExtractionJob[]; density: Density; onDensity: (d: Density) => void;
  columns: string[]; onColumns: (c: string[]) => void;
  search: string; onSearch: (s: string) => void;
  statusFilter: string; onStatusFilter: (s: string) => void;
  selected: string[]; onSelected: (ids: string[]) => void;
  onOpen: (job: ExtractionJob) => void; onExport: () => void;
}) {
  const [page, setPage] = useState(0);
  const [showCols, setShowCols] = useState(false);
  const filtered = jobs
    .filter((j) => !search || `${j.id} ${j.scope} ${j.source} ${j.owner}`.toLowerCase().includes(search.toLowerCase()))
    .filter((j) => statusFilter === "All" || j.status === statusFilter);
  const perPage = 6;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice(page * perPage, page * perPage + perPage);
  const cell: Record<string, (j: ExtractionJob) => React.ReactNode> = {
    "Job ID": (j) => <span className="font-mono text-[11px] font-medium text-slate-900">{j.id}</span>,
    "Artifact or Batch": (j) => j.scope,
    Source: (j) => j.source,
    "Knowledge Domain": (j) => j.knowledgeDomain,
    "Current Stage": (j) => j.currentStageName,
    Status: (j) => <StatusPill status={j.status} />,
    Artifacts: (j) => nf(j.artifactCount),
    "Condition Candidates": (j) => nf(j.candidateCount),
    "Approved Conditions": (j) => nf(j.approvedConditionCount),
    "Quality Score": (j) => <span className={j.qualityScore < 90 ? "text-amber-700" : "text-slate-700"}>{j.qualityScore}</span>,
    Confidence: (j) => `${j.confidence}%`,
    Started: (j) => j.startedAt,
    Elapsed: (j) => j.elapsedTime,
    Owner: (j) => j.owner,
    Warnings: (j) => j.warningCount,
    Actions: (j) => (
      <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={(e) => { e.stopPropagation(); onOpen(j); }}>Open</Button>
    ),
  };
  return (
    <Panel
      id="panel-jobs"
      title="Active Extraction Jobs"
      subtitle={`${filtered.length} jobs match the current toolbar and global filters`}
      actions={
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search jobs" aria-label="Search jobs" className="h-7 w-40 pl-7 text-[11px]" />
          </div>
          <select aria-label="Status" value={statusFilter} onChange={(e) => onStatusFilter(e.target.value)}
            className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px]">
            {["All", "Running", "Warning", "Blocked", "Paused"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setShowCols((v) => !v)}>Columns</Button>
          <select aria-label="Density" value={density} onChange={(e) => onDensity(e.target.value as Density)}
            className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px]">
            <option value="compact">Compact</option><option value="comfortable">Comfortable</option>
          </select>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onExport}>Export view</Button>
        </>
      }
    >
      {showCols && (
        <div className="mb-2 flex flex-wrap gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
          {jobColumns.map((c) => (
            <label key={c} className="flex items-center gap-1 text-[11px] text-slate-700">
              <input type="checkbox" checked={columns.includes(c)}
                onChange={() => onColumns(columns.includes(c) ? columns.filter((x) => x !== c) : [...jobColumns.filter((x) => columns.includes(x) || x === c)])} />
              {c}
            </label>
          ))}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-2 py-1.5">
                <input type="checkbox" aria-label="Select all jobs"
                  checked={selected.length > 0 && selected.length === rows.length}
                  onChange={(e) => onSelected(e.target.checked ? rows.map((j) => j.id) : [])} />
              </th>
              {jobColumns.filter((c) => columns.includes(c)).map((c) => (
                <th key={c} className="px-2 py-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((j) => (
              <tr key={j.id} onClick={() => onOpen(j)}
                className={cn("cursor-pointer border-b border-slate-100 text-[11.5px] text-slate-700 hover:bg-slate-50",
                  density === "comfortable" && "[&>td]:py-2.5")}>
                <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" aria-label={`Select ${j.id}`} checked={selected.includes(j.id)}
                    onChange={() => onSelected(selected.includes(j.id) ? selected.filter((x) => x !== j.id) : [...selected, j.id])} />
                </td>
                {jobColumns.filter((c) => columns.includes(c)).map((c) => (
                  <td key={c} className="px-2 py-1.5">{cell[c](j)}</td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="px-3 py-6 text-center text-[12px] text-slate-500">No jobs match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>{selected.length} selected</span>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span>Page {page + 1} of {pages}</span>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </Panel>
  );
}

export function JobDetailDrawer({ job, open, onOpenChange, onAction }: {
  job: ExtractionJob | null; open: boolean; onOpenChange: (o: boolean) => void; onAction: (a: string, job: ExtractionJob) => void;
}) {
  if (!job) return null;
  const timeline = [
    ["Load complete", "Complete"], ["Evidence identification complete", "Complete"], ["Candidate detection complete", "Complete"],
    ["Classification complete", "Complete"], ["Value normalization complete", "Complete"],
    ["Owner and dependency resolution", "Current"], ["Authority scoring", "Pending"], ["Conflict detection", "Pending"],
    ["Human validation", "Pending"], ["Publishing", "Pending"],
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[720px]">
        <SheetHeader>
          <SheetTitle className="text-[14px]">{job.id} — {job.scope}</SheetTitle>
          <SheetDescription className="text-[11.5px]">{job.source} · {job.knowledgeDomain} · taxonomy {job.taxonomyVersion}</SheetDescription>
        </SheetHeader>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Pause Job", "Resume Job", "Cancel Job", "Retry Failed", "Restart from Stage", "Open Condition Workbench"].map((a) => (
            <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, job)}>{a}</Button>
          ))}
        </div>
        <Tabs defaultValue="summary" className="mt-3">
          <TabsList className="h-8 flex-wrap">
            {["summary", "artifacts", "candidates", "approved", "conflicts", "review", "timeline", "evidence", "logs"].map((t) => (
              <TabsTrigger key={t} value={t} className="h-6 text-[11px] capitalize">{t}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="summary" className="mt-2 grid grid-cols-2 gap-1.5 md:grid-cols-3">
            <Metric label="Source" value={job.source} />
            <Metric label="Domain" value={job.knowledgeDomain} />
            <Metric label="Artifacts" value={nf(job.artifactCount)} />
            <Metric label="Candidates" value={nf(job.candidateCount)} />
            <Metric label="Approved" value={nf(job.approvedConditionCount)} tone="green" />
            <Metric label="Rejected" value={nf(job.rejectedConditionCount)} />
            <Metric label="Conflicts" value={nf(job.conflictCount)} tone="red" />
            <Metric label="Gaps" value={nf(job.gapCount)} tone="amber" />
            <Metric label="Human review" value={nf(job.humanReviewCount)} tone="amber" />
            <Metric label="Started" value={job.startedAt} />
            <Metric label="Elapsed" value={job.elapsedTime} />
            <Metric label="Estimated completion" value={job.estimatedCompletion} />
            <Metric label="Success rate" value={`${job.confidence}%`} />
            <Metric label="Configuration" value={job.configurationVersion} />
            <Metric label="Quality" value={`${job.qualityScore}/100`} />
          </TabsContent>
          <TabsContent value="artifacts" className="mt-2">
            <SimpleTable headers={["Canonical ID", "Title", "Type", "Candidates", "Status"]} empty="No artifacts."
              rows={[["CAN-90121", workbenchArtifact.title, "Requirements Specification", "7", <StatusPill status="Complete" />]]} />
          </TabsContent>
          <TabsContent value="candidates" className="mt-2">
            <SimpleTable headers={["Candidate", "Statement", "Confidence", "Status"]} empty="No candidates."
              rows={stageQueue.map((q) => [q.id, q.statement, `${q.confidence}%`, <StatusPill status={q.status} />])} />
          </TabsContent>
          <TabsContent value="approved" className="mt-2">
            <SimpleTable headers={["Condition", "Statement", "Authority"]} empty="No approved conditions yet."
              rows={[["COND-100421", "Payments API monthly availability ≥ 99.95 percent", "Primary"],
                     ["COND-100426", "Payments API dependency set", "Primary"]]} />
          </TabsContent>
          <TabsContent value="conflicts" className="mt-2">
            <SimpleTable headers={["Conflict", "Type", "Severity", "Review"]} empty="No conflicts."
              rows={conflicts.map((c) => [c.id, c.conflictType, <StatusPill status={c.severity} />, c.reviewStatus])} />
          </TabsContent>
          <TabsContent value="review" className="mt-2">
            <SimpleTable headers={["Task", "Missing", "Owner", "Severity"]} empty="No review tasks."
              rows={gaps.map((g) => [g.id, g.missingField, g.owner, <StatusPill status={g.severity} />])} />
          </TabsContent>
          <TabsContent value="timeline" className="mt-2">
            <ol className="space-y-1.5">
              {timeline.map(([label, state]) => (
                <li key={label} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                  {state === "Complete" ? <CircleCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                    : state === "Current" ? <CircleDot className="h-3.5 w-3.5 text-amber-600" aria-hidden />
                    : <CircleDot className="h-3.5 w-3.5 text-slate-300" aria-hidden />}
                  <span>{label}</span><StatusPill status={state} />
                </li>
              ))}
            </ol>
          </TabsContent>
          <TabsContent value="evidence" className="mt-2">
            <SimpleTable headers={["Evidence", "Passage", "Confidence"]} empty="No evidence."
              rows={evidenceReferences.slice(0, 5).map((e) => [e.id, e.passageText, `${e.evidenceConfidence}%`])} />
          </TabsContent>
          <TabsContent value="logs" className="mt-2">
            <pre className="max-h-64 overflow-auto rounded-md bg-slate-900 p-2 text-[10.5px] leading-relaxed text-slate-100">
{`09:41:02  job ${job.id} accepted (${job.configurationVersion})
09:41:18  canonical artifacts loaded: ${nf(job.artifactCount)}
09:43:51  candidate evidence identified
09:47:12  candidates detected: ${nf(job.candidateCount)}
09:49:40  classification complete (taxonomy ${job.taxonomyVersion})
09:52:07  value normalization warnings: ${job.warningCount}
09:56:22  owner resolution in progress`}
            </pre>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

/* ----------------------------------------------------------- workbench */

export function WorkbenchPanel({
  candidateStates, onCandidateAction, selectedCandidateId, onSelectCandidate,
  highlightField, onHighlightField, condition, onEntity, onEvidence, onSaveDraft,
}: {
  candidateStates: Record<string, ConditionCandidate["candidateStatus"]>;
  onCandidateAction: (id: string, action: string) => void;
  selectedCandidateId: string | null; onSelectCandidate: (id: string | null) => void;
  highlightField: string | null; onHighlightField: (f: string | null) => void;
  condition: BusinessCondition;
  onEntity: (name: string) => void; onEvidence: (id: string) => void; onSaveDraft: () => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ?? selectedCandidateId;
  const candidateList = useMemo(() => import("./data"), []); // typing helper only
  void candidateList;

  const { candidates } = require("./data") as { candidates: ConditionCandidate[] };

  const structured: [string, string][] = [
    ["condition_id", condition.id], ["condition_family_id", condition.conditionFamilyId],
    ["condition_type", condition.conditionTypeId], ["condition_statement", condition.conditionStatement],
    ["subject_type", condition.subjectType], ["subject_id", condition.subjectId], ["subject_name", condition.subjectName],
    ["operator", condition.operator], ["value", condition.value],
    ["value_range", `${condition.valueMin ?? "—"} to ${condition.valueMax ?? "—"}`], ["unit", condition.unit],
    ["baseline", condition.baseline ?? "—"], ["target", condition.target ?? "—"],
    ["threshold", condition.criticalThreshold ?? "—"], ["time_window", condition.timeWindow ?? "—"],
    ["effective_date", condition.effectiveDate], ["expiration_date", condition.expirationDate ?? "—"],
    ["owner_team", condition.ownerTeamName], ["business_owner", condition.businessOwner],
    ["technical_owner", condition.technicalOwner], ["authority_level", condition.authorityLevel],
    ["approval_state", condition.approvalState], ["applicable_teams", condition.applicableTeamIds.join(", ")],
    ["applicable_systems", condition.applicableSystemIds.join(", ")],
    ["applicable_services", condition.applicableServiceIds.join(", ")],
    ["applicable_products", condition.applicableProductIds.join(", ")],
    ["customer_journeys", condition.customerJourneyIds.join(", ")],
    ["dependencies", condition.dependencyIds.join(", ") || "—"], ["risks", condition.riskIds.join(", ") || "—"],
    ["assumptions", condition.assumptionIds.join(", ") || "—"], ["controls", condition.controlIds.join(", ") || "—"],
    ["evidence_references", condition.evidenceReferenceIds.join(", ")],
    ["source_artifacts", condition.sourceArtifactIds.join(", ")], ["confidence", `${condition.confidence}`],
    ["freshness", condition.freshnessStatus], ["version", condition.version],
    ["supersedes", condition.supersedesConditionId ?? "—"],
    ["conflicts_with", condition.conflictingConditionIds.join(", ") || "—"],
    ["access_context", condition.accessClassification], ["provenance", canonicalContext.provenance],
    ["review_status", condition.reviewStatus],
  ];

  return (
    <Panel
      id="panel-workbench"
      title="Business Condition Extraction Workbench"
      subtitle="Original evidence, canonical context, condition candidates, and the governed structured record"
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onSaveDraft}>Save condition draft</Button>}
    >
      <div className="grid gap-2 xl:grid-cols-4">
        {/* Region 1 — original evidence */}
        <div className="rounded-lg border border-slate-200">
          <div className="border-b border-slate-100 px-2 py-1.5">
            <p className="text-[11.5px] font-semibold text-slate-900">1 · Original Evidence</p>
            <p className="text-[10.5px] text-slate-500">{workbenchArtifact.title}</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-2 gap-y-0.5 border-b border-slate-100 px-2 py-1.5 text-[10px] text-slate-500">
            {[["Artifact", workbenchArtifact.artifactId], ["Evidence", workbenchArtifact.evidenceId],
              ["Source", workbenchArtifact.source], ["Version", workbenchArtifact.version],
              ["Owner", workbenchArtifact.owner], ["Authority", workbenchArtifact.authority],
              ["Access", workbenchArtifact.accessClassification], ["Hash", workbenchArtifact.contentHash],
              ["Reference", workbenchArtifact.sectionReference]].map(([k, v]) => (
              <div key={k}><dt className="inline">{k}: </dt><dd className="inline font-medium text-slate-700">{v}</dd></div>
            ))}
          </dl>
          <div className="max-h-[420px] overflow-y-auto p-2">
            {evidenceSections.map((s) => (
              <div key={s.id} className="mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.title}</p>
                {s.passages.map((p) => (
                  <p key={p.id}
                    onMouseEnter={() => p.candidateId && setHovered(p.candidateId)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => p.candidateId && onSelectCandidate(p.candidateId)}
                    className={cn("mt-1 rounded px-1.5 py-1 text-[11.5px] leading-relaxed",
                      p.candidateId ? "cursor-pointer border border-transparent hover:border-blue-300 hover:bg-blue-50" : "text-slate-600",
                      active && p.candidateId === active && "border-blue-400 bg-blue-50 text-slate-900")}>
                    {p.text}
                    {p.candidateId && <span className="ml-1 font-mono text-[9.5px] text-blue-700">p.{p.page}·¶{p.paragraph}</span>}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Region 2 — canonical context */}
        <div className="rounded-lg border border-slate-200">
          <div className="border-b border-slate-100 px-2 py-1.5">
            <p className="text-[11.5px] font-semibold text-slate-900">2 · Canonical Artifact Context</p>
            <p className="text-[10.5px] text-slate-500">Machine-readable representation feeding extraction</p>
          </div>
          <div className="max-h-[470px] space-y-2 overflow-y-auto p-2 text-[11px]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Metadata</p>
              <dl className="mt-0.5 grid grid-cols-2 gap-x-2 text-[10.5px] text-slate-600">
                {canonicalContext.metadata.map(([k, v]) => (
                  <div key={k}><dt className="inline">{k}: </dt><dd className="inline font-medium text-slate-800">{v}</dd></div>
                ))}
              </dl>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Sections</p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {canonicalContext.sections.map((s) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Tables</p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {canonicalContext.tables.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Entities</p>
              <ul className="mt-0.5 space-y-0.5">
                {canonicalContext.entities.map((e) => (
                  <li key={e.name}>
                    <button type="button" onClick={() => onEntity(e.name)}
                      className="w-full rounded px-1 py-0.5 text-left text-[10.5px] text-slate-700 hover:bg-slate-100">
                      <span className="font-medium">{e.name}</span> · {e.type} · {e.confidence}%
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Relationships</p>
              <ul className="mt-0.5 space-y-0.5 text-[10.5px] text-slate-600">
                {canonicalContext.relationships.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Contextual chunks</p>
              <ul className="mt-0.5 space-y-0.5 text-[10.5px] text-slate-600">
                {canonicalContext.chunks.map((c) => <li key={c.id}><span className="font-mono">{c.id}</span> · {c.section} · {c.tokens} tokens</li>)}
              </ul>
            </div>
            <p className="text-[10.5px] text-slate-600"><span className="font-semibold">Permissions:</span> {canonicalContext.permissions}</p>
            <p className="text-[10.5px] text-slate-600"><span className="font-semibold">Provenance:</span> {canonicalContext.provenance}</p>
          </div>
        </div>

        {/* Region 3 — candidates */}
        <div className="rounded-lg border border-slate-200">
          <div className="border-b border-slate-100 px-2 py-1.5">
            <p className="text-[11.5px] font-semibold text-slate-900">3 · Condition Candidates</p>
            <p className="text-[10.5px] text-slate-500">{candidates.length} candidates detected in this artifact</p>
          </div>
          <div className="max-h-[470px] space-y-1.5 overflow-y-auto p-2">
            {candidates.map((c) => {
              const status = candidateStates[c.id] ?? c.candidateStatus;
              return (
                <div key={c.id}
                  onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}
                  onClick={() => onSelectCandidate(c.id)}
                  className={cn("cursor-pointer rounded-lg border p-2 transition-colors",
                    active === c.id ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50")}>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{c.conditionTypeId}</span>
                    <StatusPill status={status} />
                  </div>
                  <p className="mt-0.5 text-[11.5px] font-medium text-slate-900">{c.candidateStatement}</p>
                  <dl className="mt-1 grid grid-cols-2 gap-x-2 text-[10px] text-slate-600">
                    <div><dt className="inline">Subject: </dt><dd className="inline">{c.subjectCandidate}</dd></div>
                    <div><dt className="inline">Operator: </dt><dd className="inline">{c.operatorCandidate}</dd></div>
                    <div><dt className="inline">Value: </dt><dd className="inline">{c.valueCandidate}</dd></div>
                    <div><dt className="inline">Unit: </dt><dd className="inline">{c.unitCandidate}</dd></div>
                    <div><dt className="inline">Owner: </dt><dd className="inline">{c.ownerCandidate}</dd></div>
                    <div><dt className="inline">Confidence: </dt><dd className="inline">{c.overallConfidence}%</dd></div>
                  </dl>
                  {c.context && <p className="mt-0.5 text-[10px] text-slate-500">Context: {c.context}</p>}
                  <div className="mt-1.5 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                    {["Accept", "Reject", "Edit", "Map owner", "Change type", "Mark assumption", "Open evidence"].map((a) => (
                      <button key={a} type="button" onClick={() => onCandidateAction(c.id, a)}
                        className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700">
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Region 4 — structured condition */}
        <div className="rounded-lg border border-slate-200">
          <div className="border-b border-slate-100 px-2 py-1.5">
            <p className="text-[11.5px] font-semibold text-slate-900">4 · Structured Business Condition</p>
            <p className="text-[10.5px] text-slate-500">{condition.id} · v{condition.version}</p>
          </div>
          <Tabs defaultValue="summary" className="p-2">
            <TabsList className="h-7 flex-wrap">
              {["summary", "record", "evidence", "ownership", "dependencies", "conflicts", "history"].map((t) => (
                <TabsTrigger key={t} value={t} className="h-5 text-[10px] capitalize">{t}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="summary" className="mt-2 max-h-[420px] overflow-y-auto">
              <p className="text-[12px] font-medium text-slate-900">{condition.conditionStatement}</p>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <Metric label="Type" value={condition.conditionTypeId} />
                <Metric label="Authority" value={condition.authorityLevel} />
                <Metric label="Approval" value={condition.approvalState} tone={statusTone(condition.approvalState)} />
                <Metric label="Confidence" value={`${condition.confidence}%`} tone="green" />
                <Metric label="Freshness" value={condition.freshnessStatus} />
                <Metric label="Evidence coverage" value={`${condition.evidenceCoverage}%`} />
              </div>
            </TabsContent>
            <TabsContent value="record" className="mt-2 max-h-[420px] overflow-y-auto">
              <dl className="space-y-0.5">
                {structured.map(([k, v]) => (
                  <div key={k}>
                    <button type="button" onClick={() => onHighlightField(highlightField === k ? null : k)}
                      className={cn("flex w-full items-start justify-between gap-2 rounded px-1 py-0.5 text-left text-[10.5px] hover:bg-slate-100",
                        highlightField === k && "bg-blue-50")}>
                      <dt className="font-mono text-slate-500">{k}</dt>
                      <dd className="max-w-[58%] text-right font-medium text-slate-800">{v}</dd>
                    </button>
                  </div>
                ))}
              </dl>
              <pre className="mt-2 max-h-52 overflow-auto rounded-md bg-slate-900 p-2 text-[10px] leading-relaxed text-slate-100">
{JSON.stringify(Object.fromEntries(structured), null, 2)}
              </pre>
            </TabsContent>
            <TabsContent value="evidence" className="mt-2 max-h-[420px] space-y-1.5 overflow-y-auto">
              {evidenceReferences.map((e) => (
                <button key={e.id} type="button" onClick={() => onEvidence(e.id)}
                  className="w-full rounded-md border border-slate-200 p-1.5 text-left hover:border-blue-300 hover:bg-blue-50">
                  <p className="text-[10px] font-mono text-slate-500">{e.id} · p.{e.pageNumber} ¶{e.paragraphNumber} · {e.sourceAuthority} · {e.evidenceConfidence}%</p>
                  <p className="text-[11px] text-slate-800">{e.passageText}</p>
                </button>
              ))}
            </TabsContent>
            <TabsContent value="ownership" className="mt-2 grid grid-cols-2 gap-1.5">
              <Metric label="Owner team" value={condition.ownerTeamName} />
              <Metric label="Business owner" value={condition.businessOwner} />
              <Metric label="Technical owner" value={condition.technicalOwner} />
              <Metric label="Control owner" value={condition.controlOwner} />
            </TabsContent>
            <TabsContent value="dependencies" className="mt-2 space-y-1">
              {dependencies.map((d) => (
                <div key={d.id} className="rounded-md border border-slate-200 px-1.5 py-1 text-[10.5px] text-slate-700">
                  <Link2 className="mr-1 inline h-3 w-3 text-slate-400" aria-hidden />
                  {d.relationshipType} <span className="font-medium">{d.targetName}</span> · {d.confidence}% · {d.status}
                </div>
              ))}
            </TabsContent>
            <TabsContent value="conflicts" className="mt-2 space-y-1">
              {condition.conflictingConditionIds.length === 0
                ? <p className="text-[11px] text-slate-500">No conflicts recorded for this condition.</p>
                : condition.conflictingConditionIds.map((id) => (
                  <p key={id} className="rounded-md border border-red-200 bg-red-50 px-1.5 py-1 text-[10.5px] text-red-700">Conflicts with {id}</p>
                ))}
            </TabsContent>
            <TabsContent value="history" className="mt-2 space-y-1 text-[10.5px] text-slate-600">
              {["Candidate created 09:44", "Classified 09:46", "Owner resolved 09:48", "Evidence linked 09:49",
                "Authority scored 09:50", "Published 09:58"].map((h) => <p key={h}>{h}</p>)}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------- inventory */

export const inventoryColumns: Record<ViewMode, string[]> = {
  executive: ["Condition ID", "Condition Statement", "Condition Type", "Knowledge Domain", "Owner", "Authority", "Approval State", "Confidence", "Freshness", "Business Impact", "Actions"],
  operations: ["Condition ID", "Condition Type", "Subject", "Operator", "Value", "Unit", "Source", "Evidence Count", "Extraction Job", "Confidence", "Status", "Warnings", "Actions"],
  governance: ["Condition ID", "Condition Statement", "Owner", "Authority", "Approval", "Access Classification", "Effective Date", "Expiration Date", "Evidence Coverage", "Conflict Status", "Review Status", "Actions"],
  workbench: ["Condition ID", "Condition Statement", "Source Artifact", "Exact Evidence", "Candidate Status", "Confidence", "Reviewer", "Downstream Use", "Actions"],
};

export function ConditionsInventoryPanel({ conditionsList, view, density, search, onSearch, onOpen, onBulk, savedView, onSaveView }: {
  conditionsList: BusinessCondition[]; view: ViewMode; density: Density;
  search: string; onSearch: (s: string) => void; onOpen: (c: BusinessCondition) => void;
  onBulk: () => void; savedView: string | null; onSaveView: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const list = conditionsList.filter((c) => !search || `${c.id} ${c.conditionStatement} ${c.ownerTeamName}`.toLowerCase().includes(search.toLowerCase()));
  const perPage = 8;
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const rows = list.slice(page * perPage, page * perPage + perPage);
  const cols = inventoryColumns[view];

  const cell = (c: BusinessCondition, col: string): React.ReactNode => {
    switch (col) {
      case "Condition ID": return <span className="font-mono text-[11px] font-medium text-slate-900">{c.id}</span>;
      case "Condition Statement": return <span className="line-clamp-2 max-w-[380px]">{c.conditionStatement}</span>;
      case "Condition Type": return c.conditionTypeId;
      case "Knowledge Domain": return c.knowledgeDomains.join(", ");
      case "Owner": return c.ownerTeamName;
      case "Authority": return c.authorityLevel;
      case "Approval State": case "Approval": return <StatusPill status={c.approvalState} />;
      case "Confidence": return `${c.confidence}%`;
      case "Freshness": return <StatusPill status={c.freshnessStatus} />;
      case "Business Impact": return c.businessImpact;
      case "Subject": return c.subjectName;
      case "Operator": return c.operator;
      case "Value": return c.value;
      case "Unit": return c.unit;
      case "Source": return c.sourceArtifactIds.join(", ");
      case "Evidence Count": return c.evidenceReferenceIds.length;
      case "Extraction Job": return "BCE-40452";
      case "Status": return <StatusPill status={c.approvalState} />;
      case "Warnings": return c.conflictingConditionIds.length;
      case "Access Classification": return c.accessClassification;
      case "Effective Date": return c.effectiveDate;
      case "Expiration Date": return c.expirationDate ?? "—";
      case "Evidence Coverage": return `${c.evidenceCoverage}%`;
      case "Conflict Status": return <StatusPill status={c.conflictingConditionIds.length ? "Conflict" : "None"} />;
      case "Review Status": return c.reviewStatus;
      case "Source Artifact": return c.sourceArtifactIds[0];
      case "Exact Evidence": return c.evidenceReferenceIds.join(", ");
      case "Candidate Status": return <StatusPill status={c.approvalState} />;
      case "Reviewer": return c.reviewerIds.join(", ");
      case "Downstream Use": return c.downstreamUse.join(", ");
      case "Actions": return <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={(e) => { e.stopPropagation(); onOpen(c); }}>Open</Button>;
      default: return null;
    }
  };

  return (
    <Panel
      id="panel-inventory"
      title="Conditions Inventory"
      subtitle={`${list.length} governed conditions · ${view} column set${savedView ? ` · saved view: ${savedView}` : ""}`}
      actions={
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search conditions" aria-label="Search conditions" className="h-7 w-44 pl-7 text-[11px]" />
          </div>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onSaveView}>Save view</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onBulk}>Bulk actions</Button>
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="w-6 px-2 py-1.5" aria-label="Expand" />
              {cols.map((c) => <th key={c} className="px-2 py-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <React.Fragment key={c.id}>
                <tr onClick={() => onOpen(c)}
                  className={cn("cursor-pointer border-b border-slate-100 text-[11.5px] text-slate-700 hover:bg-slate-50", density === "comfortable" && "[&>td]:py-2.5")}>
                  <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                    <button type="button" aria-label={`Toggle evidence summary for ${c.id}`} onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                      {expanded === c.id ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                    </button>
                  </td>
                  {cols.map((col) => <td key={col} className="px-2 py-1.5">{cell(c, col)}</td>)}
                </tr>
                {expanded === c.id && (
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td colSpan={cols.length + 1} className="px-4 py-2 text-[11px] text-slate-600">
                      <span className="font-semibold">Evidence:</span> {c.evidenceReferenceIds.join(", ")} from {c.sourceArtifactIds.join(", ")} ·
                      coverage {c.evidenceCoverage}% · authority {c.authorityLevel} · effective {c.effectiveDate}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {rows.length === 0 && <tr><td colSpan={cols.length + 1} className="px-3 py-6 text-center text-[12px] text-slate-500">No conditions match the current filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-slate-500">
        <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <span>Page {page + 1} of {pages}</span>
        <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </Panel>
  );
}

export function ConditionDetailDrawer({ condition, open, onOpenChange, onAction }: {
  condition: BusinessCondition | null; open: boolean; onOpenChange: (o: boolean) => void;
  onAction: (a: string, c: BusinessCondition) => void;
}) {
  if (!condition) return null;
  const c = condition;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[720px]">
        <SheetHeader>
          <SheetTitle className="text-[14px]">{c.id}</SheetTitle>
          <SheetDescription className="text-[11.5px]">{c.conditionStatement}</SheetDescription>
        </SheetHeader>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Edit Draft", "Assign Owner", "Add Evidence", "Open Evidence", "Open Related Persona", "Open Impact Analysis"].map((a) => (
            <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, c)}>{a}</Button>
          ))}
        </div>
        <Tabs defaultValue="overview" className="mt-3">
          <TabsList className="h-8 flex-wrap">
            {["overview", "definition", "evidence", "ownership", "applicability", "dependencies", "conflicts", "downstream", "versions", "audit"].map((t) => (
              <TabsTrigger key={t} value={t} className="h-6 text-[11px] capitalize">{t}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="overview" className="mt-2 grid grid-cols-2 gap-1.5 md:grid-cols-3">
            <Metric label="Condition type" value={c.conditionTypeId} />
            <Metric label="Knowledge domain" value={c.knowledgeDomains.join(", ")} />
            <Metric label="Business purpose" value={c.businessImpact} sub="business impact class" />
            <Metric label="Approval" value={c.approvalState} tone={statusTone(c.approvalState)} />
            <Metric label="Authority" value={c.authorityLevel} />
            <Metric label="Confidence" value={`${c.confidence}%`} />
            <Metric label="Freshness" value={c.freshnessStatus} tone={statusTone(c.freshnessStatus)} />
            <Metric label="Effective" value={c.effectiveDate} />
            <Metric label="Version" value={`v${c.version}`} />
          </TabsContent>
          <TabsContent value="definition" className="mt-2">
            <SimpleTable headers={["Field", "Value"]} empty=""
              rows={[["Subject", c.subjectName], ["Subject type", c.subjectType], ["Operator", c.operator], ["Value", c.value],
                ["Range", `${c.valueMin ?? "—"} – ${c.valueMax ?? "—"}`], ["Unit", c.unit], ["Baseline", c.baseline ?? "—"],
                ["Target", c.target ?? "—"], ["Warning threshold", c.warningThreshold ?? "—"], ["Critical threshold", c.criticalThreshold ?? "—"],
                ["Escalation threshold", c.escalationThreshold ?? "—"], ["Time window", c.timeWindow ?? "—"],
                ["Effective date", c.effectiveDate], ["Expiration date", c.expirationDate ?? "—"],
                ["Trigger", c.trigger ?? "—"], ["Required action", c.requiredAction ?? "—"],
                ["Required approver", c.approverIds.join(", ")]]} />
          </TabsContent>
          <TabsContent value="evidence" className="mt-2">
            <SimpleTable headers={["Artifact", "Passage", "Page / Section", "Confidence", "Authority", "Hash", "Timestamp", "Permissions"]} empty="No evidence."
              rows={evidenceReferences.filter((e) => c.evidenceReferenceIds.includes(e.id)).map((e) => [
                workbenchArtifact.title, <span className="line-clamp-2 max-w-[280px]">{e.passageText}</span>,
                `p.${e.pageNumber} · ${e.sectionId}`, `${e.evidenceConfidence}%`, e.sourceAuthority,
                <span className="font-mono text-[10px]">{e.contentHash}</span>, e.sourceTimestamp, e.accessClassification,
              ])} />
          </TabsContent>
          <TabsContent value="ownership" className="mt-2 grid grid-cols-2 gap-1.5 md:grid-cols-3">
            <Metric label="Condition owner" value={c.ownerTeamName} />
            <Metric label="Business owner" value={c.businessOwner} />
            <Metric label="Technical owner" value={c.technicalOwner} />
            <Metric label="Control owner" value={c.controlOwner} />
            <Metric label="Approver" value={c.approverIds.join(", ")} />
            <Metric label="Reviewer" value={c.reviewerIds.join(", ")} />
            <Metric label="Backup owner" value="Reliability Guild" />
            <Metric label="Ownership confidence" value="94%" />
          </TabsContent>
          <TabsContent value="applicability" className="mt-2 grid grid-cols-2 gap-1.5 md:grid-cols-3">
            <Metric label="Teams" value={c.applicableTeamIds.join(", ")} />
            <Metric label="Systems" value={c.applicableSystemIds.join(", ")} />
            <Metric label="Services" value={c.applicableServiceIds.join(", ")} />
            <Metric label="Products" value={c.applicableProductIds.join(", ")} />
            <Metric label="Capabilities" value={c.businessCapabilityIds.join(", ")} />
            <Metric label="Customer journeys" value={c.customerJourneyIds.join(", ")} />
            <Metric label="Regions" value="NA, EMEA, APAC" />
            <Metric label="Environments" value="Production" />
            <Metric label="External stakeholders" value={c.externalStakeholderIds.join(", ") || "—"} />
          </TabsContent>
          <TabsContent value="dependencies" className="mt-2">
            <SimpleTable headers={["Dependency", "Type", "Target", "Relationship", "Confidence", "Status"]} empty="No dependencies."
              rows={dependencies.map((d) => [d.id, d.dependencyType, d.targetName, d.relationshipType, `${d.confidence}%`, d.status])} />
          </TabsContent>
          <TabsContent value="conflicts" className="mt-2">
            <SimpleTable headers={["Conflict", "Type", "Authority A / B", "Evidence", "Effective dates", "Proposed resolution"]} empty="No conflicts."
              rows={conflicts.filter((x) => [x.conditionAId, x.conditionBId].includes(c.id)).map((x) => [
                x.id, x.conflictType, `${x.authorityA} / ${x.authorityB}`, `${x.valueA} vs ${x.valueB}`, x.effectiveDate,
                <span className="text-slate-500">{x.recommendedResolution} (resolution in Prompt 2)</span>,
              ])} />
          </TabsContent>
          <TabsContent value="downstream" className="mt-2 flex flex-wrap gap-1">
            {c.downstreamUse.map((d) => <Badge key={d} variant="secondary" className="text-[10.5px]">{d}</Badge>)}
          </TabsContent>
          <TabsContent value="versions" className="mt-2">
            <SimpleTable headers={["Version", "State", "Effective period"]} empty=""
              rows={[[`v${c.version}`, "Current", `${c.effectiveDate} – present`], ["v1.3", "Prior", "2026-04-01 – 2026-06-30"], ["v1.0", "Superseded", "2025-10-01 – 2026-03-31"]]} />
          </TabsContent>
          <TabsContent value="audit" className="mt-2 space-y-1 text-[11px] text-slate-600">
            {["Candidate created", "Classified", "Owner resolved", "Evidence linked", "Conflict detected", "Human review", "Approval", "Publication", "Version change"].map((a, i) => (
              <p key={a}>{`09:${40 + i} · ${a}`}</p>
            ))}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------------------------------------------- taxonomy */

export function TaxonomyPanel({ activeFamily, onFamily }: { activeFamily: string | null; onFamily: (f: string | null) => void }) {
  return (
    <Panel id="panel-taxonomy" title="Business Condition Taxonomy" subtitle="22 condition families with approval, confidence, and evidence coverage"
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" disabled title="Taxonomy administration arrives in Prompt 2">Manage taxonomy</Button>}>
      <div className="max-h-[420px] overflow-y-auto">
        <SimpleTable
          headers={["Family", "Count", "Approved %", "Avg Confidence", "Evidence Coverage", "Conflicts", "Reviews", "Status"]}
          empty=""
          onRowClick={(i) => onFamily(activeFamily === taxonomy[i].family ? null : taxonomy[i].family)}
          rows={taxonomy.map((t) => [
            <span className={cn(activeFamily === t.family && "font-semibold text-blue-700")}>{t.family}</span>,
            nf(t.count), `${t.approvedPercent}%`, `${t.confidence}%`, `${t.evidenceCoverage}%`, t.conflicts, t.reviews,
            <StatusPill status={t.status} />,
          ])}
        />
      </div>
    </Panel>
  );
}

/* ------------------------------------------------- baseline/target model */

export function BaselineTargetPanel({ metric, onMetric, onAction }: {
  metric: MetricModel; onMetric: (id: string) => void; onAction: (a: string) => void;
}) {
  const max = Math.max(...metric.series);
  const min = Math.min(...metric.series);
  const points = metric.series.map((v, i) => `${(i / (metric.series.length - 1)) * 100},${40 - ((v - min) / Math.max(0.0001, max - min)) * 34}`).join(" ");
  return (
    <Panel id="panel-btt" title="Baseline, Target & Threshold Model" subtitle="Distinguish measured baselines from committed targets and operational thresholds"
      actions={
        <>
          <select aria-label="Metric" value={metric.id} onChange={(e) => onMetric(e.target.value)}
            className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px]">
            {metricModels.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction("Open Evidence")}>Open evidence</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction("View Related Conditions")}>Related conditions</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled title="Telemetry linkage arrives in Prompt 2">Link telemetry</Button>
        </>
      }>
      <div className="grid gap-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <svg viewBox="0 0 100 44" className="h-28 w-full" preserveAspectRatio="none" role="img" aria-label={`${metric.name} trend toward target`}>
            <polyline points={points} fill="none" stroke="#0f172a" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <line x1="0" x2="100" y1="8" y2="8" stroke="#dc2626" strokeDasharray="2 2" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
            <line x1="0" x2="100" y1="18" y2="18" stroke="#d97706" strokeDasharray="2 2" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
            <line x1="0" x2="100" y1="34" y2="34" stroke="#059669" strokeDasharray="2 2" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
          </svg>
          <p className="mt-1 text-[10.5px] text-slate-500">Solid line: measured trend. Dashed lines: critical, warning, and target references.</p>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Metric label="Baseline" value={metric.baseline} sub={metric.basis} />
          <Metric label="Target" value={metric.target} sub={`Effective by ${metric.effectiveBy}`} tone="green" />
          <Metric label="Warning" value={metric.warning} tone="amber" />
          <Metric label="Critical" value={metric.critical} tone="red" />
          <Metric label="Escalation" value={metric.escalation} tone="red" />
          <Metric label="Owner" value={metric.owner} />
          <Metric label="Evidence" value={metric.evidence} />
          <Metric label="Applicable systems" value={metric.systems.join(", ")} />
          <Metric label="Team personas" value={metric.personas.join(", ")} />
          <Metric label="Related decisions" value={metric.decisions.join(", ")} />
        </div>
      </div>
    </Panel>
  );
}

/* --------------------------------------------------------- authority */

export function AuthorityPanel({ onAction }: { onAction: (a: string) => void }) {
  const total = authorityDistribution.reduce((s, a) => s + a.count, 0);
  return (
    <Panel id="panel-authority" title="Authority & Evidence Model" subtitle="Source authority, evidence agreement, and contradiction for the selected condition"
      actions={
        <>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction("Open Evidence")}>Open evidence</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled title="Authority review workflow arrives in Prompt 2">Request authority review</Button>
        </>
      }>
      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Authority distribution</p>
          <ul className="mt-1 space-y-1">
            {authorityDistribution.map((a) => (
              <li key={a.level}>
                <div className="flex items-center justify-between text-[11px] text-slate-700">
                  <span>{a.level}</span><span>{nf(a.count)} · {a.approvalRate}% approved</span>
                </div>
                <div className="mt-0.5 h-1.5 rounded-full bg-slate-100">
                  <div className={cn("h-1.5 rounded-full", a.level === "Unconfirmed" ? "bg-red-400" : a.level === "Historical" ? "bg-amber-400" : "bg-slate-800")}
                    style={{ width: `${(a.count / total) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Metric label="Primary source" value={authorityEvidence.primarySource} />
          <Metric label="Supporting sources" value={`${authorityEvidence.supportingSources.length}`} sub={authorityEvidence.supportingSources.join("; ")} />
          <Metric label="Historical sources" value={`${authorityEvidence.historicalSources.length}`} sub={authorityEvidence.historicalSources.join("; ")} />
          <Metric label="Contradictory sources" value={`${authorityEvidence.contradictorySources.length}`} sub={authorityEvidence.contradictorySources.join("; ")} tone="red" />
          <Metric label="Evidence passages" value={`${authorityEvidence.passages}`} />
          <Metric label="Evidence count" value={`${authorityEvidence.evidenceCount}`} />
          <Metric label="Evidence diversity" value={authorityEvidence.evidenceDiversity} />
          <Metric label="Evidence freshness" value={authorityEvidence.evidenceFreshness} />
          <Metric label="Evidence agreement" value={`${authorityEvidence.evidenceAgreement}%`} tone="green" />
          <Metric label="Authority confidence" value={`${authorityEvidence.authorityConfidence}%`} tone="green" />
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {evidenceReferences.slice(0, 2).map((e) => (
          <div key={e.id} className="rounded-md border border-slate-200 p-2">
            <p className="text-[10px] font-mono text-slate-500">{e.id} · {e.sourceAuthority} · {e.evidenceConfidence}%</p>
            <p className="text-[11px] text-slate-800">{e.passageText}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------------- graph */

export function DependencyGraphPanel({ relFilter, onRelFilter, directOnly, onDirectOnly, onOpenNode }: {
  relFilter: string; onRelFilter: (r: string) => void; directOnly: boolean; onDirectOnly: (v: boolean) => void;
  onOpenNode: (label: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const edges = graphEdges.filter((e) => relFilter === "All" || e.label === relFilter);
  const node = (id: string) => graphNodes.find((n) => n.id === id)!;
  const visibleNodes = directOnly
    ? graphNodes.filter((n) => n.id === "payments-api" || edges.some((e) => e.to === n.id))
    : graphNodes;
  return (
    <Panel id="panel-graph" title="Condition Dependency & Applicability Graph"
      subtitle="Payments API monthly availability shall be at least 99.95 percent"
      actions={
        <>
          <select aria-label="Relationship type" value={relFilter} onChange={(e) => onRelFilter(e.target.value)}
            className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px]">
            {["All", ...relationshipTypes].map((r) => <option key={r}>{r}</option>)}
          </select>
          <label className="flex items-center gap-1 text-[11px] text-slate-600">
            <input type="checkbox" checked={directOnly} onChange={(e) => onDirectOnly(e.target.checked)} /> Direct only
          </label>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}><ZoomIn className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}><ZoomOut className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setZoom(1)}>Reset</Button>
        </>
      }>
      <p className="sr-only">
        {edges.map((e) => `${node(e.from).label} ${e.label} ${node(e.to).label}.`).join(" ")}
      </p>
      <div className="relative h-[340px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <div className="absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
            {edges.map((e) => {
              const a = node(e.from); const b = node(e.to);
              return (
                <g key={`${e.from}-${e.to}`}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#cbd5e1" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
                  <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 1} fontSize="2" fill="#94a3b8" textAnchor="middle">{e.label}</text>
                </g>
              );
            })}
          </svg>
          {visibleNodes.map((n) => (
            <button key={n.id} type="button" onClick={() => onOpenNode(n.label)}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              className={cn("absolute -translate-x-1/2 -translate-y-1/2 rounded-md border px-1.5 py-1 text-[10px] shadow-sm",
                n.id === "payments-api" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50")}>
              <span className="block font-medium">{n.label}</span>
              <span className="block text-[9px] opacity-70">{n.type}</span>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ----------------------------------------------------- type distribution */

export type DistMetric = "Condition Count" | "Approval Rate" | "Confidence" | "Conflict Rate" | "Review Volume";

export function TypeDistributionPanel({ metric, onMetric, onSelect }: {
  metric: DistMetric; onMetric: (m: DistMetric) => void; onSelect: (type: string) => void;
}) {
  const value = (d: typeof conditionTypeDistribution[number]) =>
    metric === "Condition Count" ? d.count : metric === "Approval Rate" ? d.approvalRate
      : metric === "Confidence" ? d.confidence : metric === "Conflict Rate" ? d.conflictRate : d.reviewVolume;
  const ranked = [...conditionTypeDistribution].sort((a, b) => value(b) - value(a));
  const max = Math.max(...ranked.map(value));
  return (
    <Panel id="panel-distribution" title="Condition Type Distribution" subtitle="Ranked by the selected measure"
      actions={
        <select aria-label="Distribution measure" value={metric} onChange={(e) => onMetric(e.target.value as DistMetric)}
          className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px]">
          {["Condition Count", "Approval Rate", "Confidence", "Conflict Rate", "Review Volume"].map((m) => <option key={m}>{m}</option>)}
        </select>
      }>
      <ul className="space-y-1.5">
        {ranked.map((d) => (
          <li key={d.type}>
            <button type="button" onClick={() => onSelect(d.type)}
              title={`Approved ${nf(d.approved)} · Pending ${nf(d.pending)} · Confidence ${d.confidence}% · Evidence ${d.evidenceCoverage}% · Conflicts ${d.conflicts} · ${d.domain} · ${d.owner}`}
              className="w-full text-left">
              <div className="flex items-center justify-between text-[11px] text-slate-700">
                <span>{d.type}</span>
                <span className="font-medium">{metric === "Condition Count" ? nf(value(d)) : `${value(d)}${metric === "Review Volume" ? "" : "%"}`}</span>
              </div>
              <div className="mt-0.5 h-1.5 rounded-full bg-slate-100">
                <div className="h-1.5 rounded-full bg-slate-800" style={{ width: `${(value(d) / max) * 100}%` }} />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------------------------------------------- quality */

export function QualityPanel({ onOpenDetail }: { onOpenDetail: (id: string) => void }) {
  return (
    <Panel id="panel-quality" title="Extraction Quality" subtitle="Overall 93 out of 100 · target 95">
      <ul className="space-y-1">
        {qualityDimensions.map((q) => (
          <li key={q.id}>
            <button type="button" onClick={() => onOpenDetail(q.id)}
              className="w-full rounded-md px-1.5 py-1 text-left hover:bg-slate-50">
              <div className="flex items-center justify-between gap-2 text-[11.5px] text-slate-700">
                <span>{q.name}</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900">{q.currentValue}</span>
                  <span className="text-[10.5px] text-slate-500">target {q.targetValue} · {q.variance > 0 ? "+" : ""}{q.variance}</span>
                  <StatusPill status={q.status} />
                </span>
              </div>
              <div className="mt-0.5 h-1.5 rounded-full bg-slate-100">
                <div className={cn("h-1.5 rounded-full", q.status === "Healthy" ? "bg-emerald-500" : q.status === "Near Target" ? "bg-amber-500" : "bg-red-500")}
                  style={{ width: `${q.currentValue}%` }} />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function QualityDetailDrawer({ id, open, onOpenChange }: { id: string | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const q = qualityDimensions.find((x) => x.id === id);
  if (!q) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle className="text-[14px]">{q.name}</SheetTitle>
          <SheetDescription className="text-[11.5px]">{q.definition}</SheetDescription>
        </SheetHeader>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <Metric label="Current" value={`${q.currentValue}`} />
          <Metric label="Target" value={`${q.targetValue}`} />
          <Metric label="Variance" value={`${q.variance}`} tone={q.variance < 0 ? "amber" : "green"} />
          <Metric label="Trend" value={q.trend} />
          <Metric label="Affected conditions" value={nf(q.affectedConditionCount)} />
          <Metric label="Status" value={q.status} tone={statusTone(q.status)} />
        </div>
        <p className="mt-3 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Top failure causes</p>
        <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-700">
          {q.topFailureCauses.map((c) => <li key={c}>· {c}</li>)}
        </ul>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------ readiness */

export function RegistryReadinessPanel({ readiness, onFocus }: { readiness: ConditionReadiness; onFocus: (what: string) => void }) {
  return (
    <Panel id="panel-registry" title="Conditions Registry Readiness" subtitle="Publication is executed in Prompt 2"
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" disabled title="Publishing arrives in Prompt 2">Publish</Button>}>
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
        <button onClick={() => onFocus("approved")} className="text-left"><Metric label="Approved and ready" value={nf(readiness.approvedAndReady)} tone="green" /></button>
        <button onClick={() => onFocus("review")} className="text-left"><Metric label="Awaiting human review" value={nf(readiness.awaitingHumanReview)} tone="amber" /></button>
        <button onClick={() => onFocus("conflicts")} className="text-left"><Metric label="Active conflicts" value={nf(readiness.activeConflicts)} tone="red" /></button>
        <Metric label="Missing owners" value={nf(readiness.missingOwners)} tone="amber" />
        <Metric label="Missing evidence" value={nf(readiness.missingEvidence)} tone="amber" />
        <Metric label="Low confidence" value={nf(readiness.lowConfidence)} tone="amber" />
        <Metric label="Stale conditions" value={nf(readiness.staleConditions)} tone="amber" />
        <Metric label="Publishing destinations" value={`${publishingDestinations.length}`} />
      </div>
      <div className="mt-2">
        <SimpleTable headers={["Destination", "Ready", "Pending", "Blocked", "Last Published", "Status"]} empty=""
          rows={publishingDestinations.map((d) => [d.name, nf(d.ready), nf(d.pending), nf(d.blocked), d.lastPublished, <StatusPill status={d.status} />])} />
      </div>
    </Panel>
  );
}

export function DownstreamReadinessPanel({ readiness, onProceed, onRegistry }: {
  readiness: ConditionReadiness; onProceed: () => void; onRegistry: () => void;
}) {
  return (
    <Panel id="panel-downstream" title="Downstream Readiness" subtitle="Next stage: Team Persona Construction">
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3">
        <Metric label="Ready for Team Persona Construction" value={nf(readiness.readyForPersonaConstruction)} tone="green" />
        <Metric label="Ready for Cognitive Memory" value={nf(readiness.readyForCognitiveMemory)} tone="green" />
        <Metric label="Ready for Context Graph" value={nf(readiness.readyForContextGraph)} tone="green" />
        <Metric label="Ready for Impact Analysis" value={nf(readiness.readyForImpactAnalysis)} tone="green" />
        <Metric label="Awaiting human review" value={nf(readiness.awaitingHumanReview)} tone="amber" />
        <Metric label="Blocked by conflict" value={nf(readiness.activeConflicts)} tone="red" />
      </div>
      <p className="mt-2 text-[11.5px] text-slate-600">
        Use approved business conditions, evidence, ownership, dependencies, risks, priorities, and decision rules to
        model how teams operate and evaluate change.
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" onClick={onProceed}>
          Proceed to Team Persona Construction <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onRegistry}>
          Open Conditions Registry <ExternalLink className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </Panel>
  );
}

export const panelIcons = { Layers, ShieldCheck, Workflow };
