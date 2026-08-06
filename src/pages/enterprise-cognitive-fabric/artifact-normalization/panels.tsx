import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowRight, Boxes, BrainCircuit, ChevronRight, FileCheck2, FileSearch, Fingerprint, GitBranch,
  Inbox, Layers, LockKeyhole, Network, ScanSearch, Table2, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Panel } from "../command-center/panels";
import { Drawer, Pill, Row } from "../pipeline/panels";
import {
  canonicalEntities, canonicalRelationships, chunkStrategies, chunkingMetrics, chunkingProfiles,
  entityCategories, entityConflicts, entityQueue, entityResolutionSummary, exceptionCategories,
  integrityCounts, integrityMetrics, lineageNodes, outputComposition, overallQuality, qualityDetail,
  qualityDimensions, queueByStage, relationshipTypes, schemaCoverage, schemas, throughputSeries,
  workbenchCanonicalJson, workbenchChunks, workbenchDetectedStructure, workbenchOriginalPreview,
  workbenchPermission, workbenchSections, workbenchStructureTree, workbenchTables,
  type CanonicalArtifact, type NormalizationActivity, type NormalizationException,
  type NormalizationJob, type NormalizationReadiness, type NormalizationStage,
  type ThroughputMetric, type ViewMode,
} from "./data";

/* --------------------------------- atoms ---------------------------------- */

export type Tone = "green" | "amber" | "red" | "blue" | "slate";
export type Density = "comfortable" | "compact";

export const nf = (n: number) => n.toLocaleString("en-US");
export const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2).replace(/0$/, "")}M` : n >= 1_000 ? `${Math.round(n / 1_000)}K` : String(n);

export const normTone = (status: string): Tone => {
  if (["Running", "Complete", "Completed", "Healthy", "Published", "Within SLA", "Preserved", "Approved",
    "Auto-approved", "Auto-resolved", "Active", "Success", "Operational", "Indexed", "Registered", "On Target",
    "Not Required", "Resolved", "Compatible"].includes(status)) return "green";
  if (["Warning", "At Risk", "Review Required", "In Review", "Pending", "Pending Review", "Acknowledged",
    "Processing", "Medium", "Limited", "Near Target", "Partial", "Draft", "Review", "Escalated",
    "Backlogged", "Degraded"].includes(status)) return "amber";
  if (["Blocked", "Failed", "Breached", "Critical", "High", "Open", "Conflict", "Rejected",
    "Schema Failure", "Below Target"].includes(status)) return "red";
  if (["Paused", "Idle", "Low", "Maintenance", "Not started", "Cancelled", "Deprecated"].includes(status)) return "slate";
  return "blue";
};

export function StatusText({ status }: { status: string }) {
  return <Pill label={status} tone={normTone(status)} />;
}

export function Metric({ label, value, sub, tone = "slate" }: { label: string; value: string; sub?: string; tone?: Tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2">
      <p className="text-[10.5px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn("mt-0.5 text-[17px] font-semibold leading-none",
        tone === "green" ? "text-emerald-700" : tone === "amber" ? "text-amber-700" : tone === "red" ? "text-red-700" : "text-slate-900",
      )}>{value}</p>
      {sub && <p className="mt-1 text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}
    </div>
  );
}

export function EmptyState({ title, detail, actionLabel, onAction, secondaryLabel, onSecondary }: {
  title: string; detail: string; actionLabel?: string; onAction?: () => void;
  secondaryLabel?: string; onSecondary?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <Inbox className="h-6 w-6 text-slate-400" aria-hidden />
      <p className="text-[13px] font-medium text-slate-800">{title}</p>
      <p className="max-w-md text-[11.5px] text-slate-500">{detail}</p>
      <div className="mt-1 flex gap-2">
        {actionLabel && <Button size="sm" className="h-7 text-[11.5px]" onClick={onAction}>{actionLabel}</Button>}
        {secondaryLabel && <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={onSecondary}>{secondaryLabel}</Button>}
      </div>
    </div>
  );
}

export function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

export function toYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return `${pad}[]`;
    return value.map((v) => (typeof v === "object" && v !== null
      ? `${pad}-\n${toYaml(v, indent + 1)}`
      : `${pad}- ${String(v)}`)).join("\n");
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Record<string, unknown>).map(([k, v]) =>
      typeof v === "object" && v !== null
        ? `${pad}${k}:\n${toYaml(v, indent + 1)}`
        : `${pad}${k}: ${String(v)}`).join("\n");
  }
  return `${pad}${String(value)}`;
}

export const jobsToCsv = (list: NormalizationJob[]) =>
  toCsv(list.map((j) => ({
    "Job ID": j.id, "Artifact or Batch": j.scope, Source: j.sourceName, "Artifact Type": j.artifactType,
    "Original Format": j.originalFormat, Schema: `${j.schemaName} ${j.schemaVersion}`,
    "Current Stage": j.currentStageName, Status: j.status, Artifacts: j.artifactCount,
    "Records Produced": j.canonicalRecordCount, "Quality Score": j.qualityScore,
    Confidence: `${j.confidence}%`, Started: j.startedAt, Elapsed: j.elapsedTime, Owner: j.owner,
    Warnings: j.warningCount,
  })));

export const artifactsToCsv = (list: CanonicalArtifact[]) =>
  toCsv(list.map((a) => ({
    "Canonical ID": a.id, "Artifact ID": a.artifactId, "Evidence ID": a.evidenceId, Title: a.title,
    Source: a.sourceName, "Artifact Type": a.artifactType, "Original Format": a.originalFormat,
    Schema: `${a.schemaVersion}`, Team: a.teamName, Owner: a.owner, Authority: a.authorityLevel,
    "Access Classification": a.accessClassification, Status: a.normalizationStatus,
    "Quality Score": a.qualityScore, Confidence: `${a.confidence}%`, "Human Review": a.humanReviewStatus,
    "Entity Resolution": a.entityResolutionStatus, Permission: a.permissionStatus,
    Provenance: a.provenanceStatus, "Normalized At": a.normalizedAt, "Content Hash": a.contentHash,
  })));

export const exceptionsToCsv = (list: NormalizationException[]) =>
  toCsv(list.map((e) => ({
    "Exception ID": e.id, Artifact: e.artifactTitle, Type: e.exceptionType, Severity: e.severity,
    Source: e.sourceName, Team: e.teamName, Owner: e.owner, "Quality Score": e.qualityScore,
    Confidence: `${e.confidence}%`, Age: e.age, "Downstream Impact": e.downstreamImpact,
    "Recommended Action": e.recommendedAction, Status: e.status,
  })));

/* ----------------------------- lifecycle panel ----------------------------- */

const STAGE_ICONS: Record<string, typeof Inbox> = {
  load: Fingerprint, parse: FileSearch, structure: Table2, metadata: ScanSearch,
  entities: Network, access: LockKeyhole, chunks: Layers, validate: FileCheck2, publish: Boxes,
};

export function LifecyclePanel({
  stages, selectedId, onSelect, loading, error, degraded, spotlight, callouts, focus, onFocus,
}: {
  stages: NormalizationStage[];
  selectedId: string;
  onSelect: (id: string) => void;
  loading?: boolean;
  error?: string | null;
  degraded?: string | null;
  spotlight?: boolean;
  callouts: string[];
  focus: "all" | "bottlenecks" | "failed" | "review" | "outputs";
  onFocus: (f: "all" | "bottlenecks" | "failed" | "review" | "outputs") => void;
}) {
  const [zoom, setZoom] = useState(1);
  const visible = useMemo(() => {
    if (focus === "bottlenecks") return stages.filter((s) => s.status === "Warning" || s.status === "Blocked");
    if (focus === "failed") return stages.filter((s) => s.failedCount > 0);
    if (focus === "review") return stages.filter((s) => s.warningCount > 2);
    return stages;
  }, [stages, focus]);

  const total = stages.reduce((a, s) => a + s.pendingCount, 0);

  return (
    <Panel
      id="panel-lifecycle"
      title="Artifact Normalization Lifecycle"
      subtitle="Nine measurable stages. The original artifact is never modified — a canonical representation is created beside it."
      spotlight={spotlight}
      loading={loading}
      error={error}
      degraded={degraded}
    >
      <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
        {([
          ["all", "Show all"], ["bottlenecks", "Focus bottlenecks"], ["failed", "Show failed records"],
          ["review", "Show review required"], ["outputs", "Show downstream outputs"],
        ] as const).map(([id, label]) => (
          <Button key={id} size="sm" variant={focus === id ? "default" : "outline"}
            className="h-6 px-2 text-[11px]" onClick={() => onFocus(id)}>{label}</Button>
        ))}
        <span className="mx-1 h-4 w-px bg-slate-200" aria-hidden />
        <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]"
          onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))}>Zoom in</Button>
        <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]"
          onClick={() => setZoom(0.86)}>Zoom to fit</Button>
        <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => setZoom(1)}>Reset view</Button>
        <span className="ml-auto text-[11px] text-slate-500">
          Queue across all stages: <span className="font-medium text-slate-800">{nf(total)}</span>
        </span>
      </div>

      <p className="sr-only">
        {stages.map((s) => `${s.name}: ${s.status}, ${s.processedLabel} processed, ${nf(s.pendingCount)} pending, ${s.successRate} percent success, throughput ${s.throughput}.`).join(" ")}
      </p>

      <div className="overflow-x-auto px-4 pb-3">
        <ol className="flex min-w-max items-stretch gap-1" style={{ zoom }}>
          {visible.map((s, i) => {
            const Icon = STAGE_ICONS[s.id] ?? Inbox;
            const active = s.id === selectedId;
            return (
              <li key={s.id} className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => onSelect(s.id)}
                  aria-current={active ? "step" : undefined}
                  title={`${s.definition} Queue ${nf(s.pendingCount)}. SLA target ${s.slaTarget}.`}
                  className={cn(
                    "w-[152px] rounded-lg border p-2 text-left transition-colors",
                    active ? "border-blue-500 bg-blue-50/70 ring-1 ring-blue-300" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                    <span className="text-[10px] font-semibold text-slate-400">{s.sequence}</span>
                    <span className="ml-auto"><Pill label={s.status} tone={normTone(s.status)} /></span>
                  </div>
                  <p className="mt-1 text-[11.5px] font-semibold leading-tight text-slate-900">{s.name}</p>
                  <dl className="mt-1.5 space-y-0.5 text-[10.5px] text-slate-600">
                    <div className="flex justify-between"><dt>Processed</dt><dd className="font-medium">{s.processedLabel}</dd></div>
                    <div className="flex justify-between"><dt>Pending</dt><dd className="font-medium">{compact(s.pendingCount)}</dd></div>
                    <div className="flex justify-between"><dt>Success</dt><dd className="font-medium">{s.successRate}%</dd></div>
                    <div className="flex justify-between"><dt>Avg</dt><dd className="font-medium">{s.averageDuration}</dd></div>
                    <div className="flex justify-between"><dt>P95</dt><dd className="font-medium">{s.p95Duration}</dd></div>
                    <div className="flex justify-between"><dt>Warn / Fail</dt><dd className="font-medium">{s.warningCount} / {s.failedCount}</dd></div>
                  </dl>
                  <div className="mt-1.5 rounded bg-slate-100 px-1.5 py-1 text-[10px] text-slate-600">
                    {s.throughput}
                  </div>
                  <p className="mt-1 truncate text-[10px] text-slate-500">{s.owner} · {s.slaStatus}</p>
                </button>
                {i < visible.length - 1 && (
                  <div className="flex w-5 items-center justify-center" aria-hidden>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <ul className="grid gap-1.5 border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
        {callouts.map((c) => (
          <li key={c} className="flex items-start gap-1.5">
            <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" aria-hidden />
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ---------------------------- selected stage detail ------------------------ */

export function SimpleTable({ headers, rows, empty }: { headers: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (!rows.length) return <p className="px-3 py-6 text-center text-[11.5px] text-slate-500">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[11.5px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
            {headers.map((h) => <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-medium text-slate-600">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
              {r.map((c, j) => <td key={j} className="px-2 py-1.5 align-top text-slate-700">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StageDetailPanel({ stage, exceptions, onAction }: {
  stage: NormalizationStage;
  exceptions: NormalizationException[];
  onAction: (action: string) => void;
}) {
  return (
    <Panel
      id="panel-stage"
      title="Selected Stage Detail"
      subtitle={`${stage.name} · ${stage.definition}`}
    >
      <div className="grid grid-cols-2 gap-2 px-4 pb-2 lg:grid-cols-4">
        <Metric label="Status" value={stage.status} tone={normTone(stage.status) === "green" ? "green" : normTone(stage.status) === "red" ? "red" : "amber"} />
        <Metric label="Processing now" value={compact(stage.pendingCount)} sub="Records in flight and queued" />
        <Metric label="Completed this hour" value={compact(Math.round(stage.processedCount * 0.004))} />
        <Metric label="Pending review" value={nf(stage.warningCount * 42)} />
        <Metric label="Average duration" value={stage.averageDuration} sub={`P95 ${stage.p95Duration}`} />
        <Metric label="Success rate" value={`${stage.successRate}%`} />
        <Metric label="Throughput" value={stage.throughput} />
        <Metric label="SLA" value={stage.slaStatus} sub={`Target ${stage.slaTarget}`} tone={stage.slaStatus === "Within SLA" ? "green" : "amber"} />
      </div>

      <div className="px-4 pb-2 text-[11px] text-slate-600">
        Owner {stage.owner} · Upstream {stage.upstreamStageId ?? "—"} · Downstream {stage.downstreamStageId ?? "—"} · Configuration v4.1
      </div>

      <Tabs defaultValue="overview" className="px-4 pb-3">
        <TabsList className="h-8">
          {["overview", "queue", "entities", "conflicts", "outputs", "dependencies", "configuration"].map((t) => (
            <TabsTrigger key={t} value={t} className="h-6 px-2 text-[11px] capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-2 space-y-2">
          <dl className="grid gap-x-4 sm:grid-cols-2">
            <Row label="Current workload" value={`${compact(stage.pendingCount)} records`} />
            <Row label="Artifact-type distribution" value="Documents 38% · Telemetry 27% · Conversations 19% · Other 16%" />
            <Row label="Source distribution" value="Confluence 31% · Datadog 24% · Slack 18% · Other 27%" />
            <Row label="Resolved entities" value={entityResolutionSummary.resolvedLabel} />
            <Row label="Conflict rate" value="3.3%" />
            <Row label="Current bottleneck" value={stage.bottleneck ?? "None detected"} />
          </dl>
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2 text-[11.5px] text-slate-700">
            <p className="font-medium text-slate-800">Top warnings</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {exceptions.slice(0, 3).map((e) => <li key={e.id}>{e.exceptionType} — {e.artifactTitle}</li>)}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="queue" className="mt-2">
          <SimpleTable
            headers={["Artifact ID", "Artifact Title", "Entity Candidate", "Entity Type", "Source Value", "Normalized Value", "Confidence", "Queue Age", "Status"]}
            rows={entityQueue.map((q) => [q.artifactId, q.artifactTitle, q.candidate, q.entityType, q.sourceValue, q.normalizedValue, `${q.confidence}%`, q.queueAge, <StatusText key="s" status={q.status} />])}
            empty="Queue is empty."
          />
        </TabsContent>

        <TabsContent value="entities" className="mt-2">
          <SimpleTable
            headers={["Entity ID", "Canonical Name", "Type", "Aliases", "Sources", "Owning Team", "Related Systems", "Confidence", "Approval"]}
            rows={canonicalEntities.map((e) => [e.id, e.canonicalName, e.entityType, e.aliases.join(", "), nf(e.sourceCount), e.owningTeam, e.relatedSystemIds.join(", "), `${e.confidence}%`, <StatusText key="s" status={e.approvalStatus} />])}
            empty="No entities resolved."
          />
        </TabsContent>

        <TabsContent value="conflicts" className="mt-2">
          <SimpleTable
            headers={["Source Entity", "Candidate Matches", "Confidence", "Conflict Type", "Sources", "Owners", "Recommended Action", "Review Status"]}
            rows={entityConflicts.map((c) => [c.sourceEntity, c.candidates.join(" / "), `${c.confidence}%`, c.conflictType, c.sources.join(", "), c.owners.join(", "), c.recommendedAction, <StatusText key="s" status={c.reviewStatus} />])}
            empty="No conflicts."
          />
        </TabsContent>

        <TabsContent value="outputs" className="mt-2">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[["Canonical Entities", "3.4M"], ["Alias Records", "1.2M"], ["Team Mappings", "412K"], ["System Mappings", "318K"],
              ["Service Mappings", "402K"], ["Product Mappings", "148K"], ["Person Mappings", "286K"], ["Relationship Candidates", "5.8M"]].map(([l, v]) => (
              <Metric key={l} label={l} value={v} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dependencies" className="mt-2">
          <dl>
            {["Source Registry", "Evidence Vault", "Team Directory", "System Catalog", "Service Catalog", "Context Graph", "Conditions Registry"]
              .map((d, i) => <Row key={d} label={d} value={<StatusText status={i === 6 ? "Pending" : "Operational"} />} />)}
          </dl>
        </TabsContent>

        <TabsContent value="configuration" className="mt-2">
          <dl>
            <Row label="Entity-confidence threshold" value="0.85" />
            <Row label="Alias threshold" value="0.80" />
            <Row label="Duplicate threshold" value="0.92" />
            <Row label="Auto-resolution threshold" value="0.90" />
            <Row label="Human-review threshold" value="Below 0.85" />
            <Row label="Reference-data sources" value="Team Directory, Service Catalog, Metric Catalog" />
            <Row label="Resolution priority" value="Registry → Catalog → Source value" />
          </dl>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-4 py-2.5">
        {["Pause Stage", "Resume Stage", "Retry Failures", "Drain Queue", "Reprocess Selected",
          "Approve Suggested Mappings", "Open Human Review", "View Logs", "Edit Configuration", "Create Incident"].map((a) => (
          <Button key={a} size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => onAction(a)}>{a}</Button>
        ))}
      </div>
    </Panel>
  );
}

/* --------------------------------- jobs ----------------------------------- */

export const viewColumns: Record<ViewMode, string[]> = {
  executive: ["Job ID", "Artifact or Batch", "Source", "Artifact Type", "Status", "Artifacts", "Records Produced", "Quality Score", "Actions"],
  operations: ["Job ID", "Artifact or Batch", "Source", "Artifact Type", "Original Format", "Normalization Schema", "Current Stage", "Status", "Artifacts", "Records Produced", "Quality Score", "Confidence", "Started", "Elapsed Time", "Owner", "Warnings", "Actions"],
  workbench: ["Job ID", "Artifact or Batch", "Artifact Type", "Original Format", "Normalization Schema", "Current Stage", "Quality Score", "Confidence", "Actions"],
  architecture: ["Job ID", "Artifact or Batch", "Normalization Schema", "Current Stage", "Records Produced", "Quality Score", "Confidence", "Owner", "Actions"],
};

export function FilterSelect({ label, value, onChange, options, className }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="text-[10.5px] uppercase tracking-wide text-slate-500">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-7 text-[11.5px]" aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent className="max-h-72">
          {options.map((o) => <SelectItem key={o} value={o} className="text-[11.5px]">{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </label>
  );
}

export function JobTablePanel({
  jobs, view, density, onDensity, columns, onColumns, selected, onSelected, onOpen, onAction,
  loading, error, spotlight, highlight, search, onSearch, statusFilter, onStatusFilter, onExport, paused,
}: {
  jobs: NormalizationJob[]; view: ViewMode; density: Density; onDensity: (d: Density) => void;
  columns: string[]; onColumns: (c: string[]) => void; selected: string[]; onSelected: (s: string[]) => void;
  onOpen: (j: NormalizationJob) => void; onAction: (action: string, job?: NormalizationJob) => void;
  loading?: boolean; error?: string | null; spotlight?: boolean; highlight: string[];
  search: string; onSearch: (v: string) => void; statusFilter: string; onStatusFilter: (v: string) => void;
  onExport: () => void; paused?: boolean;
}) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "Job ID", dir: "desc" });
  const [page, setPage] = useState(0);
  const perPage = 6;

  const all = viewColumns[view];
  const shown = all.filter((c) => columns.includes(c) || c === "Job ID" || c === "Actions");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = jobs.filter((j) =>
      (statusFilter === "All" || j.status === statusFilter) &&
      (!q || [j.id, j.scope, j.sourceName, j.artifactType, j.schemaName, j.owner, j.currentStageName]
        .some((v) => v.toLowerCase().includes(q))));
    const key = sort.key;
    list = [...list].sort((a, b) => {
      const val = (j: NormalizationJob) => {
        switch (key) {
          case "Artifacts": return j.artifactCount;
          case "Records Produced": return j.canonicalRecordCount;
          case "Quality Score": return j.qualityScore;
          case "Confidence": return j.confidence;
          case "Warnings": return j.warningCount;
          case "Artifact or Batch": return j.scope;
          case "Source": return j.sourceName;
          case "Status": return j.status;
          default: return j.id;
        }
      };
      const av = val(a), bv = val(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [jobs, search, statusFilter, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice(page * perPage, page * perPage + perPage);
  const pad = density === "compact" ? "py-1.5" : "py-2.5";

  const cell = (j: NormalizationJob, col: string): React.ReactNode => {
    switch (col) {
      case "Job ID": return <button type="button" className="font-medium text-blue-700 underline-offset-2 hover:underline" onClick={() => onOpen(j)}>{j.id}</button>;
      case "Artifact or Batch": return j.scope;
      case "Source": return j.sourceName;
      case "Artifact Type": return j.artifactType;
      case "Original Format": return j.originalFormat;
      case "Normalization Schema": return `${j.schemaName} ${j.schemaVersion}`;
      case "Current Stage": return j.currentStageName;
      case "Status": return <StatusText status={j.status} />;
      case "Artifacts": return nf(j.artifactCount);
      case "Records Produced": return j.canonicalRecordLabel;
      case "Quality Score": return <span className={cn(j.qualityScore < 80 ? "text-red-700" : j.qualityScore < 92 ? "text-amber-700" : "text-emerald-700", "font-medium")}>{j.qualityScore}</span>;
      case "Confidence": return `${j.confidence}%`;
      case "Started": return j.startedAt;
      case "Elapsed Time": return j.elapsedTime;
      case "Owner": return j.owner;
      case "Warnings": return j.warningCount;
      case "Actions": return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" aria-label={`Actions for ${j.id}`}>Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {["Open Job", "Open Artifact Workbench", "Pause Job", "Resume Job", "Retry Failed",
              "Reprocess with New Schema", "Export Job Report", "Create Incident"].map((a) => (
              <DropdownMenuItem key={a} className="text-[11.5px]" onClick={() => (a === "Open Job" ? onOpen(j) : onAction(a, j))}>{a}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
      default: return null;
    }
  };

  return (
    <Panel
      id="panel-jobs"
      title="Active Normalization Jobs"
      subtitle={`${filtered.length} job${filtered.length === 1 ? "" : "s"} matching the current view and filters`}
      spotlight={spotlight}
      loading={loading}
      error={error}
    >
      <div className="flex flex-wrap items-end gap-2 px-4 pb-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10.5px] uppercase tracking-wide text-slate-500">Search jobs</span>
          <Input value={search} onChange={(e) => { onSearch(e.target.value); setPage(0); }}
            placeholder="Job, batch, source, schema, owner" className="h-7 w-56 text-[11.5px]" aria-label="Search jobs" />
        </label>
        <FilterSelect label="Status" value={statusFilter} onChange={(v) => { onStatusFilter(v); setPage(0); }}
          options={["All", "Running", "Warning", "Blocked", "Paused", "Completed"]} className="w-32" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-7 text-[11.5px]">Columns</Button></DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
            <DropdownMenuLabel className="text-[11.5px]">Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {all.filter((c) => c !== "Job ID" && c !== "Actions").map((c) => (
              <DropdownMenuCheckboxItem key={c} className="text-[11.5px]" checked={columns.includes(c)}
                onCheckedChange={(v) => onColumns(v ? [...columns, c] : columns.filter((x) => x !== c))}>{c}</DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Select value={density} onValueChange={(v) => onDensity(v as Density)}>
          <SelectTrigger className="h-7 w-32 text-[11.5px]" aria-label="Row density"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="compact" className="text-[11.5px]">Compact</SelectItem>
            <SelectItem value="comfortable" className="text-[11.5px]">Comfortable</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={onExport}>Export current view</Button>
        {selected.length > 0 && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">{selected.length} selected</span>
            {["Pause Job", "Resume Job", "Retry Failed", "Reprocess with New Schema"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => onAction(a)}>{a}</Button>
            ))}
          </div>
        )}
      </div>

      {loading ? <TableSkeleton rows={6} /> : rows.length === 0 ? (
        <EmptyState
          title={paused ? "Normalization is paused" : "No normalization jobs match the current filters"}
          detail={paused
            ? "Queued artifacts remain preserved. Resume processing to continue producing canonical representations."
            : "Adjust the filters, or start a new normalization run from approved artifacts registered during ingestion."}
          actionLabel="Clear filters" onAction={() => { onSearch(""); onStatusFilter("All"); }}
          secondaryLabel="Open Artifact Ingestion" onSecondary={() => onAction("Open Artifact Ingestion")}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11.5px]">
            <caption className="sr-only">Active normalization jobs</caption>
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50/70 text-left">
                <th scope="col" className="w-8 px-2 py-1.5">
                  <Checkbox aria-label="Select all jobs"
                    checked={rows.every((r) => selected.includes(r.id)) && rows.length > 0}
                    onCheckedChange={(v) => onSelected(v ? Array.from(new Set([...selected, ...rows.map((r) => r.id)])) : selected.filter((s) => !rows.some((r) => r.id === s)))} />
                </th>
                {shown.map((c) => (
                  <th key={c} scope="col" className="whitespace-nowrap px-2 py-1.5 font-medium text-slate-600">
                    {c === "Actions" ? c : (
                      <button type="button" className="inline-flex items-center gap-1 hover:text-slate-900"
                        onClick={() => setSort((s) => ({ key: c, dir: s.key === c && s.dir === "desc" ? "asc" : "desc" }))}
                        aria-label={`Sort by ${c}`}>
                        {c}{sort.key === c && <span aria-hidden>{sort.dir === "asc" ? "▲" : "▼"}</span>}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => (
                <tr key={j.id} className={cn("border-b border-slate-100 last:border-0 hover:bg-slate-50/60",
                  highlight.includes(j.id) && "bg-amber-50/70")}>
                  <td className={cn("px-2", pad)}>
                    <Checkbox aria-label={`Select ${j.id}`} checked={selected.includes(j.id)}
                      onCheckedChange={(v) => onSelected(v ? [...selected, j.id] : selected.filter((s) => s !== j.id))} />
                  </td>
                  {shown.map((c) => <td key={c} className={cn("whitespace-nowrap px-2 text-slate-700", pad)}>{cell(j, c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">
          <span>Page {page + 1} of {pages}</span>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* ----------------------------- job detail drawer --------------------------- */

export function JobDetailDrawer({ job, open, onOpenChange, artifacts, exceptions, onAction }: {
  job: NormalizationJob | null; open: boolean; onOpenChange: (v: boolean) => void;
  artifacts: CanonicalArtifact[]; exceptions: NormalizationException[];
  onAction: (action: string, job: NormalizationJob) => void;
}) {
  const [q, setQ] = useState("");
  if (!job) return null;
  const jobArtifacts = artifacts.filter((a) => a.jobId === job.id);
  const list = jobArtifacts.filter((a) => !q || a.title.toLowerCase().includes(q.toLowerCase()));
  const jobExceptions = exceptions.filter((e) => e.jobId === job.id);

  const timeline = [
    ["Load Original Evidence", "Completed"], ["Parse Content", "Completed"], ["Detect Structure", "Completed"],
    ["Normalize Metadata", "Completed"], ["Resolve Entities", "In progress"], ["Preserve Access Context", "Pending"],
    ["Create Contextual Chunks", "Pending"], ["Validate Representation", "Pending"], ["Publish Canonical Model", "Pending"],
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide
      title={`${job.id} — ${job.scope}`}
      description={`${job.status} · ${job.currentStageName} · Quality ${job.qualityScore} · Confidence ${job.confidence}% · Owner ${job.owner}`}>
      <Tabs defaultValue="summary">
        <TabsList className="h-8 flex-wrap">
          {["summary", "original", "normalized", "timeline", "quality", "exceptions", "evidence", "logs"].map((t) => (
            <TabsTrigger key={t} value={t} className="h-6 px-2 text-[11px] capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="summary" className="mt-2">
          <dl>
            <Row label="Source" value={job.sourceName} />
            <Row label="Artifact type" value={job.artifactType} />
            <Row label="Original format" value={job.originalFormat} />
            <Row label="Normalization schema" value={`${job.schemaName} ${job.schemaVersion}`} />
            <Row label="Artifact count" value={nf(job.artifactCount)} />
            <Row label="Completed" value={nf(job.completedCount)} />
            <Row label="Pending" value={nf(job.pendingCount)} />
            <Row label="Failed" value={nf(job.failedCount)} />
            <Row label="Human review" value={nf(job.humanReviewCount)} />
            <Row label="Canonical records" value={job.canonicalRecordLabel} />
            <Row label="Started" value={job.startedAt} />
            <Row label="Elapsed" value={job.elapsedTime} />
            <Row label="Estimated completion" value={job.estimatedCompletion} />
            <Row label="Success rate" value={`${(100 - (job.failedCount / Math.max(1, job.artifactCount)) * 100).toFixed(1)}%`} />
            <Row label="Configuration version" value={job.configurationVersion} />
          </dl>
        </TabsContent>

        <TabsContent value="original" className="mt-2 space-y-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search original evidence"
            className="h-7 text-[11.5px]" aria-label="Search original evidence" />
          <SimpleTable
            headers={["Artifact ID", "Title", "Original Format", "Evidence ID", "Owner", "Classification"]}
            rows={list.map((a) => [a.artifactId, a.title, a.originalFormat, a.evidenceId, a.owner, a.accessClassification])}
            empty="No original artifacts match this search."
          />
          <p className="text-[11px] text-slate-500">Original artifacts are read from the evidence vault and are never modified by normalization.</p>
        </TabsContent>

        <TabsContent value="normalized" className="mt-2">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {[["Canonical artifacts", nf(jobArtifacts.length || job.completedCount)], ["Metadata records", nf(job.completedCount)],
              ["Sections", nf(job.completedCount * 7)], ["Tables", nf(Math.round(job.completedCount * 0.3))],
              ["Entities", nf(Math.round(job.completedCount * 1.6))], ["Relationships", nf(Math.round(job.completedCount * 2.7))],
              ["Contextual chunks", nf(Math.round(job.completedCount * 5.2))], ["Permission records", nf(job.completedCount)]]
              .map(([l, v]) => <Metric key={l} label={l} value={v} />)}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-2">
          <ol className="space-y-1.5">
            {timeline.map(([name, status]) => (
              <li key={name} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1.5 text-[11.5px]">
                <span className="text-slate-700">{name}</span><StatusText status={status} />
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="quality" className="mt-2">
          <dl>
            {[["Structure confidence", 93], ["Metadata completeness", 96], ["Entity confidence", 91],
              ["Permission integrity", 98], ["Chunk quality", 92], ["Lineage completeness", 99], ["Schema compliance", 95]]
              .map(([l, v]) => <Row key={String(l)} label={String(l)} value={`${v}`} />)}
          </dl>
        </TabsContent>

        <TabsContent value="exceptions" className="mt-2">
          <SimpleTable
            headers={["Exception", "Type", "Severity", "Confidence", "Status"]}
            rows={jobExceptions.map((e) => [e.artifactTitle, e.exceptionType, e.severity, `${e.confidence}%`, <StatusText key="s" status={e.status} />])}
            empty="No exceptions recorded for this job."
          />
        </TabsContent>

        <TabsContent value="evidence" className="mt-2">
          <dl>
            <Row label="Original evidence ID" value={jobArtifacts[0]?.evidenceId ?? "EVD-77421"} />
            <Row label="Source ID" value={jobArtifacts[0]?.sourceId ?? "SRC-2001"} />
            <Row label="Content hash" value={<code className="text-[10.5px]">{jobArtifacts[0]?.contentHash ?? "sha256:9f21c4a8e3b7…41d0"}</code>} />
            <Row label="Version" value={jobArtifacts[0]?.version ?? "3.2"} />
            <Row label="Owner" value={jobArtifacts[0]?.owner ?? job.owner} />
            <Row label="Access classification" value={jobArtifacts[0]?.accessClassification ?? "Confidential"} />
            <Row label="Source timestamp" value={jobArtifacts[0]?.modifiedAtSource ?? "2026-08-05"} />
            <Row label="Normalization timestamp" value={jobArtifacts[0]?.normalizedAt ?? "2026-08-06 10:04"} />
          </dl>
        </TabsContent>

        <TabsContent value="logs" className="mt-2">
          <pre className="max-h-64 overflow-auto rounded border border-slate-200 bg-slate-50 p-2 text-[10.5px] leading-relaxed text-slate-700">
{`10:02:14  ${job.id}  load        evidence stream opened, 0 mutations
10:02:41  ${job.id}  parse       ${job.originalFormat} parser selected
10:03:08  ${job.id}  structure   sections=8 tables=2 headings=14
10:03:33  ${job.id}  metadata    owner resolved to ${job.owner}
10:04:02  ${job.id}  entities    ${job.warningCount} candidate(s) below auto-resolution threshold
10:04:44  ${job.id}  access      source permissions preserved, no widening
10:05:19  ${job.id}  chunks      context-enriched profile applied
10:05:52  ${job.id}  validate    schema ${job.schemaVersion} compliance check`}
          </pre>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2.5">
        {["Pause Job", "Resume Job", "Cancel Job", "Retry Failed", "Restart from Stage",
          "Reprocess with New Schema", "Export Job Report", "Open Artifact Workbench", "Create Incident"].map((a) => (
          <Button key={a} size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => onAction(a, job)}>{a}</Button>
        ))}
      </div>
    </Drawer>
  );
}

/* -------------------------------- workbench -------------------------------- */

export function WorkbenchPanel({
  artifacts, selectedId, onSelect, onAction, spotlight, highlightField, onHighlightField,
}: {
  artifacts: CanonicalArtifact[]; selectedId: string; onSelect: (id: string) => void;
  onAction: (action: string) => void; spotlight?: boolean;
  highlightField: string | null; onHighlightField: (f: string | null) => void;
}) {
  const [tab, setTab] = useState("json");
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<string | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<string | null>(null);
  const artifact = artifacts.find((a) => a.id === selectedId) ?? artifacts[0];

  if (!artifact) {
    return (
      <Panel id="panel-workbench" title="Artifact Normalization Workbench">
        <EmptyState title="No canonical artifact selected"
          detail="No approved artifacts match the current filters. Clear filters or open Artifact Ingestion to register more evidence." />
      </Panel>
    );
  }

  const jsonEntries = Object.entries(workbenchCanonicalJson);

  return (
    <Panel
      id="panel-workbench"
      title="Artifact Normalization Workbench"
      subtitle="Preserve the original evidence. Create a normalized representation beside it."
      spotlight={spotlight}
    >
      <div className="flex flex-wrap items-end gap-2 px-4 pb-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10.5px] uppercase tracking-wide text-slate-500">Artifact</span>
          <Select value={artifact.id} onValueChange={onSelect}>
            <SelectTrigger className="h-7 w-[340px] text-[11.5px]" aria-label="Select artifact"><SelectValue /></SelectTrigger>
            <SelectContent>
              {artifacts.map((a) => <SelectItem key={a.id} value={a.id} className="text-[11.5px]">{a.title} — {a.originalFormat}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {["Approve Representation", "Request Correction", "Edit Mapping", "Reprocess Artifact",
            "Compare Schema Versions", "Export Canonical Record", "Open Original Evidence"].map((a) => (
            <Button key={a} size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => onAction(a)}>{a}</Button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 px-4 pb-3 lg:grid-cols-3">
        {/* Column 1 — Original Evidence */}
        <section className="rounded-lg border border-slate-200" aria-label="Original evidence">
          <header className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50/70 px-2.5 py-1.5">
            <Fingerprint className="h-3.5 w-3.5 text-slate-500" aria-hidden />
            <h3 className="text-[11.5px] font-semibold text-slate-800">Original Evidence</h3>
            <span className="ml-auto"><Pill label="Unchanged" tone="green" /></span>
          </header>
          <dl className="px-2.5 py-1.5">
            <Row label="Title" value={artifact.title} />
            <Row label="Original format" value={artifact.originalFormat} />
            <Row label="Original filename" value={<code className="text-[10.5px]">{artifact.originalFilename}</code>} />
            <Row label="Source system" value={artifact.sourceName} />
            <Row label="Source identifier" value={artifact.sourceId} />
            <Row label="Version" value={artifact.version} />
            <Row label="Owner" value={artifact.owner} />
            <Row label="Created" value={artifact.createdAtSource} />
            <Row label="Modified" value={artifact.modifiedAtSource} />
            <Row label="Access classification" value={artifact.accessClassification} />
            <Row label="Content hash" value={<code className="text-[10.5px]">{artifact.contentHash}</code>} />
          </dl>
          <div className="border-t border-slate-200 p-2.5">
            <p className="mb-1 text-[10.5px] uppercase tracking-wide text-slate-500">Document preview</p>
            <div className="max-h-72 space-y-1.5 overflow-y-auto rounded border border-slate-200 bg-white p-2 font-serif text-[11.5px] leading-relaxed text-slate-800">
              {workbenchOriginalPreview.map((p) => (
                <p key={p.id}
                  onMouseEnter={() => onHighlightField(p.field)}
                  onMouseLeave={() => onHighlightField(null)}
                  className={cn("cursor-default rounded px-1 py-0.5 transition-colors",
                    highlightField === p.field && "bg-amber-100 ring-1 ring-amber-300")}>
                  {p.text}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Column 2 — Detected Structure */}
        <section className="rounded-lg border border-slate-200" aria-label="Detected structure">
          <header className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50/70 px-2.5 py-1.5">
            <Table2 className="h-3.5 w-3.5 text-slate-500" aria-hidden />
            <h3 className="text-[11.5px] font-semibold text-slate-800">Detected Structure</h3>
          </header>
          <dl className="px-2.5 py-1.5">
            <Row label="Document title" value={workbenchDetectedStructure.documentTitle} />
            <Row label="Sections detected" value={workbenchDetectedStructure.sectionsDetected} />
            <Row label="Paragraphs" value={workbenchDetectedStructure.paragraphs} />
            <Row label="Lists" value={workbenchDetectedStructure.lists} />
            <Row label="Tables" value={workbenchDetectedStructure.tables} />
            <Row label="Headings" value={workbenchDetectedStructure.headings} />
            <Row label="Page references" value={workbenchDetectedStructure.pageReferences} />
            <Row label="Named entities" value={workbenchDetectedStructure.namedEntities} />
            <Row label="Systems" value={workbenchDetectedStructure.systems.join(", ")} />
            <Row label="Teams" value={workbenchDetectedStructure.teams.join(", ")} />
            <Row label="Metrics" value={workbenchDetectedStructure.metrics.join(", ")} />
            <Row label="Dates" value={workbenchDetectedStructure.dates.join(", ")} />
            <Row label="Requirement candidates" value={workbenchDetectedStructure.requirementCandidates} />
            <Row label="Dependency candidates" value={workbenchDetectedStructure.dependencyCandidates} />
            <Row label="Author metadata" value={workbenchDetectedStructure.authorMetadata} />
          </dl>
          <div className="border-t border-slate-200 p-2.5">
            <p className="mb-1 text-[10.5px] uppercase tracking-wide text-slate-500">Structure tree</p>
            <ul className="max-h-56 space-y-1 overflow-y-auto text-[11.5px]">
              {workbenchStructureTree.map((n) => (
                <li key={n.heading}>
                  <button type="button"
                    onMouseEnter={() => onHighlightField("sections")}
                    onMouseLeave={() => onHighlightField(null)}
                    className="font-medium text-slate-800 hover:text-blue-700">{n.heading}</button>
                  <ul className="ml-3 list-disc pl-2 text-[11px] text-slate-500">
                    {n.children.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Column 3 — Canonical Representation */}
        <section className="rounded-lg border border-slate-200" aria-label="Canonical representation">
          <header className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50/70 px-2.5 py-1.5">
            <BrainCircuit className="h-3.5 w-3.5 text-slate-500" aria-hidden />
            <h3 className="text-[11.5px] font-semibold text-slate-800">Canonical Representation</h3>
            <span className="ml-auto"><Pill label={`${artifact.schemaVersion}`} tone="blue" /></span>
          </header>
          <Tabs value={tab} onValueChange={setTab} className="p-2.5">
            <TabsList className="h-8 flex-wrap">
              {[["json", "Canonical JSON"], ["metadata", "Metadata"], ["entities", "Entities"],
                ["relationships", "Relationships"], ["chunks", "Chunks"], ["permissions", "Permissions"], ["lineage", "Lineage"]]
                .map(([v, l]) => <TabsTrigger key={v} value={v} className="h-6 px-2 text-[11px]">{l}</TabsTrigger>)}
            </TabsList>

            <TabsContent value="json" className="mt-2">
              <div className="max-h-72 overflow-auto rounded border border-slate-200 bg-slate-900 p-2 font-mono text-[10.5px] leading-relaxed">
                <p className="text-slate-400">{"{"}</p>
                {jsonEntries.map(([k, v]) => (
                  <p key={k}
                    onMouseEnter={() => onHighlightField(k)}
                    onMouseLeave={() => onHighlightField(null)}
                    className={cn("cursor-default rounded px-1", highlightField === k && "bg-amber-500/25")}>
                    <span className="text-sky-300">  &quot;{k}&quot;</span>
                    <span className="text-slate-400">: </span>
                    <span className={typeof v === "number" ? "text-amber-300" : "text-emerald-300"}>
                      {typeof v === "object" ? JSON.stringify(v) : typeof v === "string" ? `"${v}"` : String(v)}
                    </span>
                    <span className="text-slate-400">,</span>
                  </p>
                ))}
                <p className="text-slate-400">{"}"}</p>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Hover a normalized field to highlight the evidence passage it was derived from.
              </p>
            </TabsContent>

            <TabsContent value="metadata" className="mt-2">
              <dl className="max-h-72 overflow-y-auto">
                <Row label="Artifact ID" value={artifact.artifactId} />
                <Row label="Evidence ID" value={artifact.evidenceId} />
                <Row label="Schema version" value={artifact.schemaVersion} />
                <Row label="Owner team" value={artifact.teamName} />
                <Row label="Business owner" value={artifact.businessOwner} />
                <Row label="Technical owner" value={artifact.technicalOwner} />
                <Row label="Authority level" value={artifact.authorityLevel} />
                <Row label="Language" value={artifact.language} />
                <Row label="Effective date" value={artifact.effectiveDate} />
                <Row label="Expiration date" value={artifact.expirationDate} />
                <Row label="Regulatory scope" value={artifact.regulatoryScope.join(", ") || "None"} />
                <Row label="Sections / tables" value={`${artifact.sectionCount} / ${artifact.tableCount}`} />
                <Row label="Confidence" value={`${artifact.confidence}%`} />
                <Row label="Approval status" value={<StatusText status={artifact.approvalStatus} />} />
              </dl>
            </TabsContent>

            <TabsContent value="entities" className="mt-2">
              <ul className="max-h-72 space-y-1 overflow-y-auto">
                {canonicalEntities.map((e) => (
                  <li key={e.id}>
                    <button type="button" onClick={() => setSelectedEntity(selectedEntity === e.id ? null : e.id)}
                      className="w-full rounded border border-slate-200 px-2 py-1.5 text-left text-[11.5px] hover:bg-slate-50">
                      <span className="font-medium text-slate-800">{e.canonicalName}</span>
                      <span className="ml-1.5 text-slate-500">{e.entityType}</span>
                      <span className="float-right"><Pill label={`${e.confidence}%`} tone={e.confidence >= 90 ? "green" : "amber"} /></span>
                      {selectedEntity === e.id && (
                        <span className="mt-1 block text-[11px] text-slate-600">
                          Aliases: {e.aliases.join(", ")} · Source values: {e.sourceValues.join(", ")} · Owner {e.owningTeam} · {e.approvalStatus}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="relationships" className="mt-2">
              <SimpleTable
                headers={["Source", "Relationship", "Target", "Confidence", "Evidence"]}
                rows={canonicalRelationships.map((r) => [r.sourceEntityName, r.relationshipType, r.targetEntityName, `${r.confidence}%`, r.evidenceReferences.join(", ")])}
                empty="No relationships mapped."
              />
            </TabsContent>

            <TabsContent value="chunks" className="mt-2">
              <ul className="max-h-72 space-y-1 overflow-y-auto">
                {workbenchChunks.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => setSelectedChunk(selectedChunk === c.id ? null : c.id)}
                      className="w-full rounded border border-slate-200 px-2 py-1.5 text-left text-[11.5px] hover:bg-slate-50">
                      <span className="font-medium text-slate-800">{c.id}</span>
                      <span className="ml-1.5 text-slate-500">{c.headingContext}</span>
                      {selectedChunk === c.id && (
                        <span className="mt-1 block space-y-0.5 text-[11px] text-slate-600">
                          <span className="block">{c.content}</span>
                          <span className="block">Tokens {c.tokenCount} · Overlap {c.overlap} · Confidence {c.confidence}%</span>
                          <span className="block">Entities: {c.entities.join(", ") || "None"}</span>
                          <span className="block">Permissions: {c.permissionContext}</span>
                          <span className="block">Evidence: {c.evidenceReferences.join(", ")}</span>
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="permissions" className="mt-2">
              <ul className="space-y-1">
                {workbenchPermission.sourcePermissions.map((p) => (
                  <li key={p}>
                    <button type="button" onClick={() => setSelectedPermission(selectedPermission === p ? null : p)}
                      className="w-full rounded border border-slate-200 px-2 py-1.5 text-left text-[11.5px] hover:bg-slate-50">
                      <span className="font-medium text-slate-800">{p}</span>
                      {selectedPermission === p && (
                        <span className="mt-1 block text-[11px] text-slate-600">
                          Inherited source policy: {workbenchPermission.inheritedPermissions.join(", ")}. Inheritance never widens access.
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <dl className="mt-2">
                <Row label="Approved consumers" value={workbenchPermission.approvedConsumers.join(", ")} />
                <Row label="Restricted consumers" value={workbenchPermission.restrictedConsumers.join(", ")} />
                <Row label="Access classification" value={workbenchPermission.accessClassification} />
                <Row label="Regulatory scope" value={workbenchPermission.regulatoryScope.join(", ") || "None"} />
                <Row label="Permission conflict" value={workbenchPermission.permissionConflict} />
              </dl>
            </TabsContent>

            <TabsContent value="lineage" className="mt-2">
              <ol className="max-h-72 space-y-1 overflow-y-auto">
                {lineageNodes.map((n) => (
                  <li key={n.recordId} className="rounded border border-slate-200 px-2 py-1.5 text-[11.5px]">
                    <span className="font-medium text-slate-800">{n.label}</span>
                    <span className="float-right"><StatusText status={n.status} /></span>
                    <span className="block text-[11px] text-slate-500">{n.recordId} · {n.timestamp} · {n.owner} · {n.access}</span>
                  </li>
                ))}
              </ol>
            </TabsContent>
          </Tabs>
        </section>
      </div>

      <div className="border-t border-slate-100 px-4 py-2">
        <p className="text-[10.5px] uppercase tracking-wide text-slate-500">Canonical sections and tables</p>
        <SimpleTable
          headers={["Section", "Type", "Pages", "Tokens", "Confidence", "Evidence"]}
          rows={workbenchSections.map((s) => [s.heading, s.sectionType, `${s.pageStart}–${s.pageEnd}`, s.tokenCount, `${s.confidence}%`, s.evidenceReferences.join(", ")])}
          empty="No sections detected."
        />
        {workbenchTables.map((t) => (
          <div key={t.id} className="mt-2">
            <p className="text-[11px] font-medium text-slate-700">{t.title} · {t.pageReference} · confidence {t.confidence}%</p>
            <SimpleTable headers={t.headers} rows={t.rows} empty="No table rows." />
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ---------------------------- schema coverage ------------------------------ */

export function SchemaCoveragePanel({ onFamily, onManage, activeFamily }: {
  onFamily: (family: string) => void; onManage: () => void; activeFamily: string | null;
}) {
  return (
    <Panel id="panel-coverage" title="Canonical Schema Coverage"
      subtitle="Coverage of each artifact family by its canonical schema"
      footer="Manage Schemas" onFooter={onManage}>
      <div className="max-h-80 overflow-y-auto">
        <SimpleTable
          headers={["Artifact family", "Coverage", "Target", "Artifacts", "Unsupported elements", "Review", "Schema", "Status"]}
          rows={schemaCoverage.map((c) => [
            <button key="f" type="button" onClick={() => onFamily(c.family)}
              className={cn("text-left font-medium underline-offset-2 hover:underline",
                activeFamily === c.family ? "text-blue-700" : "text-slate-800")}>{c.family}</button>,
            <span key="c" className="flex items-center gap-1.5">
              <Progress value={c.coverage} className="h-1.5 w-16" aria-label={`${c.family} coverage`} />
              <span className="font-medium">{c.coverage}%</span>
            </span>,
            `${c.target}%`, compact(c.artifacts), c.unsupported, c.review, c.schema,
            <StatusText key="s" status={c.coverage >= c.target ? "On Target" : c.coverage >= c.target - 4 ? "Near Target" : "Below Target"} />,
          ])}
          empty="No schema coverage data."
        />
      </div>
    </Panel>
  );
}

/* --------------------------------- quality --------------------------------- */

export function QualityPanel({ onOpenDetail, spotlight }: { onOpenDetail: (name: string) => void; spotlight?: boolean }) {
  return (
    <Panel id="panel-quality" title="Normalization Quality" subtitle={`Overall score ${overallQuality} out of 100`} spotlight={spotlight}>
      <div className="max-h-72 space-y-1 overflow-y-auto px-4 pb-3">
        {qualityDimensions.map((d) => {
          const variance = d.current - d.target;
          const trending = d.trend[d.trend.length - 1] - d.trend[0];
          return (
            <button key={d.name} type="button" onClick={() => onOpenDetail(d.name)}
              className="flex w-full items-center gap-2 rounded border border-slate-200 px-2 py-1.5 text-left hover:bg-slate-50">
              <span className="w-44 shrink-0 text-[11.5px] text-slate-700">{d.name}</span>
              <Progress value={d.current} className="h-1.5 flex-1" aria-label={`${d.name} score`} />
              <span className="w-8 text-right text-[11.5px] font-medium text-slate-900">{d.current}</span>
              <span className="w-16 text-right text-[11px] text-slate-500">target {d.target}</span>
              <span className={cn("w-12 text-right text-[11px]", variance < 0 ? "text-amber-700" : "text-emerald-700")}>
                {variance >= 0 ? "+" : ""}{variance}
              </span>
              <span className="w-14 text-right text-[11px] text-slate-500">{trending >= 0 ? "improving" : "declining"}</span>
              <span className="w-20 text-right text-[11px] text-slate-500">{compact(d.affected)}</span>
              <StatusText status={d.status} />
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

export function QualityDetailDrawer({ name, open, onOpenChange }: {
  name: string | null; open: boolean; onOpenChange: (v: boolean) => void;
}) {
  const dim = qualityDimensions.find((d) => d.name === name);
  const detail = name ? qualityDetail[name] : undefined;
  if (!dim) return null;
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={`${dim.name} quality`}
      description={`Current ${dim.current} against a target of ${dim.target}. ${compact(dim.affected)} artifacts affected.`}>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dim.trend.map((v, i) => ({ t: `T-${dim.trend.length - i}`, v }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} /><YAxis domain={[80, 100]} tick={{ fontSize: 10 }} />
            <RTooltip contentStyle={{ fontSize: 11 }} />
            <ReferenceLine y={dim.target} stroke="#94a3b8" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="text-[11.5px] font-medium text-slate-800">Contributing drivers</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11.5px] text-slate-600">
          {(detail?.drivers ?? ["Insufficient variance to attribute a driver."]).map((d) => <li key={d}>{d}</li>)}
        </ul>
      </div>
      <div>
        <p className="text-[11.5px] font-medium text-slate-800">Recommended remediation</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11.5px] text-slate-600">
          {(detail?.remediation ?? ["No remediation required."]).map((d) => <li key={d}>{d}</li>)}
        </ul>
      </div>
    </Drawer>
  );
}

/* ------------------------------ throughput --------------------------------- */

export function ThroughputPanel({ metric, onMetric, range, degraded, spotlight }: {
  metric: ThroughputMetric; onMetric: (m: ThroughputMetric) => void; range: string;
  degraded: boolean; spotlight?: boolean;
}) {
  const { data, target, unit } = useMemo(() => throughputSeries(metric, range, degraded), [metric, range, degraded]);
  return (
    <Panel id="panel-throughput" title="Normalization Throughput" subtitle={`${metric} over ${range.toLowerCase()}`} spotlight={spotlight}>
      <div className="flex flex-wrap gap-1.5 px-4 pb-2">
        {(["Throughput", "Queue Depth", "Processing Time", "Failure Rate"] as ThroughputMetric[]).map((m) => (
          <Button key={m} size="sm" variant={metric === m ? "default" : "outline"} className="h-6 px-2 text-[11px]" onClick={() => onMetric(m)}>{m}</Button>
        ))}
      </div>
      <div className="h-44 px-2 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} />
            <RTooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => `${nf(v)}${unit}`} />
            <ReferenceLine y={target} stroke="#94a3b8" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="parsed" name="Parsed" stroke="#2563eb" fill="#bfdbfe" strokeWidth={2} />
            <Area type="monotone" dataKey="published" name="Published" stroke="#059669" fill="#bbf7d0" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        {metric} across the selected range. Latest parsed value {nf(data[data.length - 1].parsed)}{unit}, published {nf(data[data.length - 1].published)}{unit}.
      </p>
      <div className="h-32 px-2 pb-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={queueByStage} layout="vertical" margin={{ left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 9 }} />
            <YAxis type="category" dataKey="stage" tick={{ fontSize: 9 }} width={120} />
            <RTooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => `${nf(v)} records`} />
            <Bar dataKey="depth" fill="#60a5fa" radius={2} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

/* ---------------------------- output composition --------------------------- */

export function CompositionPanel({ onSegment }: { onSegment: (type: string) => void }) {
  const [mode, setMode] = useState<"count" | "growth" | "quality" | "storage">("count");
  return (
    <Panel id="panel-composition" title="Normalized Output Composition"
      subtitle="Canonical records produced beside the preserved originals">
      <div className="flex gap-1.5 px-4 pb-2">
        {([["count", "Record Count"], ["growth", "Growth"], ["quality", "Quality"], ["storage", "Storage"]] as const).map(([id, label]) => (
          <Button key={id} size="sm" variant={mode === id ? "default" : "outline"} className="h-6 px-2 text-[11px]" onClick={() => setMode(id)}>{label}</Button>
        ))}
      </div>
      <ul className="max-h-72 space-y-1 overflow-y-auto px-4 pb-3">
        {outputComposition.map((o) => (
          <li key={o.type}>
            <button type="button" onClick={() => onSegment(o.type)}
              className="flex w-full items-center gap-2 rounded border border-slate-200 px-2 py-1.5 text-left hover:bg-slate-50">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: o.color }} aria-hidden />
              <span className="flex-1 text-[11.5px] text-slate-700">{o.type}</span>
              <span className="text-[11.5px] font-semibold text-slate-900">
                {mode === "count" ? o.label : mode === "growth" ? `+${o.growth}%` : mode === "quality" ? o.quality : o.storage}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* --------------------- entity and relationship resolution ------------------ */

export function EntityPanel({ onAction, spotlight, conflictStates }: {
  onAction: (action: string, id: string) => void; spotlight?: boolean; conflictStates: Record<string, string>;
}) {
  const [category, setCategory] = useState<string | null>(null);
  return (
    <Panel id="panel-entities" title="Entity &amp; Relationship Resolution"
      subtitle="Different names for the same team, service, product, metric, or dependency are reconciled into one organizational vocabulary"
      spotlight={spotlight}>
      <div className="grid gap-2 px-4 pb-2 sm:grid-cols-4">
        <Metric label="Resolved entities" value={entityResolutionSummary.resolvedLabel} />
        <Metric label="Auto-resolved" value={`${entityResolutionSummary.autoResolved}%`} tone="green" />
        <Metric label="Human reviewed" value={`${entityResolutionSummary.humanReviewed}%`} />
        <Metric label="Pending review" value={`${entityResolutionSummary.pendingReview}%`} tone="amber" />
      </div>

      <div className="flex flex-wrap gap-1 px-4 pb-2">
        {entityCategories.map((c) => (
          <button key={c.type} type="button" onClick={() => setCategory(category === c.type ? null : c.type)}
            className={cn("rounded border px-1.5 py-0.5 text-[10.5px]",
              category === c.type ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
            {c.type} <span className="text-slate-400">{compact(c.count)}</span>
          </button>
        ))}
      </div>

      <div className="px-4 pb-2">
        <p className="mb-1 text-[10.5px] uppercase tracking-wide text-slate-500">
          Relationship graph for the selected artifact
        </p>
        <ul className="space-y-1">
          {canonicalRelationships.map((r) => (
            <li key={r.id} className="flex items-center gap-1.5 rounded border border-slate-200 px-2 py-1 text-[11.5px]">
              <span className="font-medium text-slate-800">{r.sourceEntityName}</span>
              <ArrowRight className="h-3 w-3 text-slate-400" aria-hidden />
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10.5px] uppercase tracking-wide text-slate-600">{r.relationshipType}</span>
              <ArrowRight className="h-3 w-3 text-slate-400" aria-hidden />
              <span className="font-medium text-slate-800">{r.targetEntityName}</span>
              <span className="ml-auto text-[11px] text-slate-500">{r.confidence}% · {r.evidenceReferences.join(", ")}</span>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-[11px] text-slate-500">Relationship types in use: {relationshipTypes.join(", ")}.</p>
      </div>

      <div className="border-t border-slate-100 px-4 py-2">
        <p className="mb-1 text-[10.5px] uppercase tracking-wide text-slate-500">Entity conflicts</p>
        <SimpleTable
          headers={["Source entity", "Candidates", "Confidence", "Conflict", "Owners", "Recommended action", "Status", ""]}
          rows={entityConflicts.map((c) => [
            c.sourceEntity, c.candidates.join(" / "), `${c.confidence}%`, c.conflictType, c.owners.join(", "),
            c.recommendedAction,
            <StatusText key="s" status={conflictStates[c.id] ?? c.reviewStatus} />,
            <span key="a" className="flex gap-1">
              <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => onAction("Approve mapping", c.id)}>Approve</Button>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => onAction("Escalate", c.id)}>Escalate</Button>
            </span>,
          ])}
          empty="No entity conflicts."
        />
      </div>
    </Panel>
  );
}

/* ------------------------------ chunking ----------------------------------- */

export function ChunkingPanel({ spotlight, onSelectChunk }: { spotlight?: boolean; onSelectChunk: (id: string) => void }) {
  const [strategy, setStrategy] = useState("context");
  return (
    <Panel id="panel-chunking" title="Contextual Chunking"
      subtitle="Content is divided according to meaning and structure with its heading context, metadata, permissions, and evidence references preserved"
      spotlight={spotlight}>
      <div className="grid gap-2 px-4 pb-2 sm:grid-cols-4 lg:grid-cols-7">
        <Metric label="Chunks produced" value={chunkingMetrics.chunksLabel} />
        <Metric label="Average size" value={`${chunkingMetrics.averageChunkSize} tokens`} />
        <Metric label="Section context" value={`${chunkingMetrics.withSectionContext}%`} tone="green" />
        <Metric label="Artifact metadata" value={`${chunkingMetrics.withArtifactMetadata}%`} tone="green" />
        <Metric label="Permission context" value={`${chunkingMetrics.withPermissionContext}%`} tone="green" />
        <Metric label="Evidence references" value={`${chunkingMetrics.withEvidenceReferences}%`} tone="green" />
        <Metric label="Requiring review" value={chunkingMetrics.requiringReviewLabel} tone="amber" />
      </div>

      <div className="grid gap-2 px-4 pb-2 lg:grid-cols-3">
        {chunkStrategies.map((s) => (
          <button key={s.id} type="button" onClick={() => setStrategy(s.id)}
            className={cn("rounded-lg border p-2 text-left",
              strategy === s.id ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-300" : "border-slate-200 hover:bg-slate-50")}>
            <p className="text-[11.5px] font-semibold text-slate-900">
              {s.name}{s.id === "context" && <span className="ml-1.5"><Pill label="Recommended" tone="green" /></span>}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">{s.description}</p>
            <dl className="mt-1.5 space-y-0.5 text-[10.5px] text-slate-600">
              <div className="flex justify-between"><dt>Section context</dt><dd className="font-medium">{s.sectionContext}%</dd></div>
              <div className="flex justify-between"><dt>Evidence references</dt><dd className="font-medium">{s.evidenceReferences}%</dd></div>
              <div className="flex justify-between"><dt>Retrieval quality</dt><dd className="font-medium">{s.retrievalQuality}</dd></div>
            </dl>
            <p className="mt-1.5 rounded bg-slate-100 px-1.5 py-1 font-mono text-[10px] text-slate-600">{s.sample}</p>
          </button>
        ))}
      </div>

      <div className="px-4 pb-2">
        <p className="mb-1 text-[10.5px] uppercase tracking-wide text-slate-500">Chunking profiles</p>
        <SimpleTable
          headers={["Profile", "Artifact types", "Average size", "Status"]}
          rows={chunkingProfiles.map((p) => [p.name, p.artifactTypes, `${p.averageSize} tokens`, <StatusText key="s" status={p.status} />])}
          empty="No profiles configured."
        />
      </div>

      <div className="border-t border-slate-100 px-4 py-2">
        <p className="mb-1 text-[10.5px] uppercase tracking-wide text-slate-500">Chunks for the selected artifact</p>
        <SimpleTable
          headers={["Chunk ID", "Heading context", "Content excerpt", "Tokens", "Evidence", "Entities", "Permissions", "Confidence", "Overlap"]}
          rows={workbenchChunks.map((c) => [
            <button key="i" type="button" className="font-medium text-blue-700 hover:underline" onClick={() => onSelectChunk(c.id)}>{c.id}</button>,
            c.headingContext, <span key="c" className="line-clamp-2 max-w-xs">{c.content}</span>,
            c.tokenCount, c.evidenceReferences.join(", "), c.entities.join(", ") || "—",
            c.permissionContext, `${c.confidence}%`, c.overlap,
          ])}
          empty="No chunks produced."
        />
      </div>
    </Panel>
  );
}

/* ------------------------ permission and provenance ------------------------ */

export function IntegrityPanel({ spotlight }: { spotlight?: boolean }) {
  return (
    <Panel id="panel-integrity" title="Permission &amp; Provenance Integrity"
      subtitle="Access context and evidence lineage carried into the canonical representation" spotlight={spotlight}>
      <div className="space-y-1 px-4 pb-2">
        {integrityMetrics.map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            <span className="w-52 shrink-0 text-[11.5px] text-slate-700">{m.label}</span>
            <Progress value={m.value} className="h-1.5 flex-1" aria-label={m.label} />
            <span className="w-10 text-right text-[11.5px] font-medium text-slate-900">{m.value}%</span>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Metric label="Permission conflicts" value={nf(integrityCounts.permissionConflicts)} tone="red" />
          <Metric label="Missing ownership" value={nf(integrityCounts.missingOwnership)} tone="amber" />
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-2">
        <p className="mb-1 text-[10.5px] uppercase tracking-wide text-slate-500">Selected lineage</p>
        <ol className="space-y-1">
          {lineageNodes.map((n, i) => (
            <li key={n.recordId} className="flex items-start gap-2 rounded border border-slate-200 px-2 py-1.5 text-[11.5px]">
              <span className="mt-0.5 text-[10px] font-semibold text-slate-400">{i + 1}</span>
              <span className="flex-1">
                <span className="font-medium text-slate-800">{n.label}</span>
                <span className="block text-[11px] text-slate-500">
                  {n.recordId} · {n.timestamp} · {n.owner} · {n.access}{n.confidence ? ` · confidence ${n.confidence}%` : ""}
                </span>
              </span>
              <StatusText status={n.status} />
            </li>
          ))}
        </ol>
      </div>
    </Panel>
  );
}

/* ----------------------------- exceptions ---------------------------------- */

export function ExceptionPanel({ exceptions, onAction, onOpenReview, spotlight, activeCategory, onCategory }: {
  exceptions: NormalizationException[]; onAction: (action: string, e: NormalizationException) => void;
  onOpenReview: (e: NormalizationException) => void; spotlight?: boolean;
  activeCategory: string | null; onCategory: (c: string | null) => void;
}) {
  const rows = activeCategory ? exceptions.filter((e) => e.exceptionType === activeCategory) : exceptions;
  return (
    <Panel id="panel-exceptions" title="Exceptions &amp; Human Review"
      subtitle="Ambiguity, conflicts, and low-confidence interpretations are reviewed before they can influence personas or decisions"
      spotlight={spotlight}>
      <div className="flex flex-wrap gap-1 px-4 pb-2">
        {exceptionCategories.map((c) => (
          <button key={c.type} type="button" onClick={() => onCategory(activeCategory === c.type ? null : c.type)}
            className={cn("rounded border px-1.5 py-0.5 text-[10.5px]",
              activeCategory === c.type ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
            {c.type} <span className="font-semibold">{c.count}</span>
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No exceptions in this category" detail="All representations in this category met the quality, confidence, and permission thresholds." />
      ) : (
        <div className="max-h-80 overflow-y-auto">
          <SimpleTable
            headers={["Artifact", "Exception type", "Severity", "Source", "Team", "Owner", "Quality", "Confidence", "Age", "Downstream impact", "Recommended action", "Status", "Actions"]}
            rows={rows.map((e) => [
              e.artifactTitle, e.exceptionType, <StatusText key="sev" status={e.severity} />, e.sourceName, e.teamName,
              e.owner, e.qualityScore, `${e.confidence}%`, e.age,
              <span key="d" className="line-clamp-2 max-w-[16rem]">{e.downstreamImpact}</span>,
              <span key="r" className="line-clamp-2 max-w-[16rem]">{e.recommendedAction}</span>,
              <StatusText key="s" status={e.status} />,
              <span key="a" className="flex gap-1">
                <Button size="sm" className="h-6 px-2 text-[11px]" onClick={() => onOpenReview(e)}>Open review</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" aria-label={`More actions for ${e.id}`}>More</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {["Assign", "Acknowledge", "Open Workbench", "Correct Mapping", "Select Entity", "Apply Owner",
                      "Resolve Permission", "Change Schema", "Reprocess", "Approve with Exception", "Reject Representation",
                      "Create Review Task", "Create Incident"].map((a) => (
                      <DropdownMenuItem key={a} className="text-[11.5px]" onClick={() => onAction(a, e)}>{a}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </span>,
            ])}
            empty="No exceptions."
          />
        </div>
      )}
    </Panel>
  );
}

/* ----------------------------- readiness ----------------------------------- */

export function ReadinessPanel({ readiness, onProceed, onFocus, spotlight }: {
  readiness: NormalizationReadiness; onProceed: () => void; onFocus: (panel: string) => void; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-readiness" title="Downstream Readiness"
      subtitle="Only approved canonical representations move forward" spotlight={spotlight}>
      <div className="grid grid-cols-2 gap-2 px-4 pb-2 lg:grid-cols-3">
        <button type="button" onClick={() => onFocus("panel-composition")} className="text-left">
          <Metric label="Ready for condition extraction" value={compact(readiness.readyForConditionExtraction)} tone="green" />
        </button>
        <button type="button" onClick={() => onFocus("panel-exceptions")} className="text-left">
          <Metric label="Awaiting human review" value={nf(readiness.awaitingHumanReview)} tone="amber" />
        </button>
        <button type="button" onClick={() => onFocus("panel-integrity")} className="text-left">
          <Metric label="Blocked by permissions" value={nf(readiness.permissionBlocked)} tone="red" />
        </button>
        <button type="button" onClick={() => onFocus("panel-coverage")} className="text-left">
          <Metric label="Schema failures" value={nf(readiness.schemaFailures)} tone="red" />
        </button>
        <button type="button" onClick={() => onFocus("panel-entities")} className="text-left">
          <Metric label="Entity conflicts" value={nf(readiness.entityConflicts)} tone="amber" />
        </button>
        <button type="button" onClick={() => onFocus("panel-quality")} className="text-left">
          <Metric label="Low confidence" value={nf(readiness.lowConfidence)} tone="amber" />
        </button>
      </div>
      <div className="mx-4 mb-3 rounded-lg border border-blue-200 bg-blue-50/70 p-3">
        <p className="text-[10.5px] uppercase tracking-wide text-blue-700">Next stage</p>
        <p className="mt-0.5 text-[13px] font-semibold text-slate-900">Business Condition Extraction</p>
        <p className="mt-1 text-[11.5px] text-slate-600">
          Decompose approved canonical artifacts into business objectives, requirements, constraints, baselines,
          targets, thresholds, dependencies, risks, assumptions, and decision rules.
        </p>
        <Button size="sm" className="mt-2 h-7 text-[11.5px]" onClick={onProceed}>
          Proceed to Business Condition Extraction
        </Button>
      </div>
    </Panel>
  );
}

/* ------------------------------ activity ----------------------------------- */

export function ActivityPanel({ activity, onOpen }: {
  activity: NormalizationActivity[]; onOpen: (a: NormalizationActivity) => void;
}) {
  return (
    <Panel id="panel-activity" title="Recent Normalization Activity" subtitle="Audited operational history">
      <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto px-4 pb-2">
        {activity.map((a) => (
          <li key={a.id}>
            <button type="button" onClick={() => onOpen(a)} className="w-full py-1.5 text-left hover:bg-slate-50">
              <div className="flex items-start gap-2">
                <span className="w-16 shrink-0 text-[11px] text-slate-500">{a.timestamp}</span>
                <span className="flex-1">
                  <span className="text-[11.5px] font-medium text-slate-800">{a.action}</span>
                  <span className="block text-[11px] text-slate-500">{a.description}</span>
                  <span className="block text-[10.5px] text-slate-400">
                    {a.sourceName} · {a.teamName} · {a.owner} · {a.auditId}
                  </span>
                </span>
                <StatusText status={a.result} />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------- architecture consumers -------------------------- */

export function ArchitecturePanel() {
  const consumers = [
    { name: "Business Condition Extraction", records: "1.96M canonical artifacts", status: "Ready" },
    { name: "Team Persona Studio", records: "3.4M entities · 5.8M relationships", status: "Ready" },
    { name: "Context Graph", records: "5.8M relationships", status: "Syncing" },
    { name: "Semantic Retrieval", records: "11.2M contextual chunks", status: "Ready" },
    { name: "Enterprise Cognitive Memory", records: "14.7M provenance links", status: "Ready" },
    { name: "Impact Analysis", records: "Awaiting business conditions", status: "Pending" },
  ];
  return (
    <Panel id="panel-architecture" title="Canonical Output Stores &amp; Downstream Consumers"
      subtitle="Where the normalized representation is published and who consumes it">
      <div className="grid gap-2 px-4 pb-2 sm:grid-cols-2 lg:grid-cols-3">
        {[["Canonical Artifact Store", "412 GB"], ["Entity & Relationship Store", "190 GB"],
          ["Chunk & Retrieval Store", "2.1 TB"], ["Permission Store", "24 GB"],
          ["Provenance Ledger", "146 GB"], ["Schema Registry", "9 active schemas"]].map(([l, v]) => (
          <Metric key={l} label={l} value={v} />
        ))}
      </div>
      <div className="px-4 pb-3">
        <SimpleTable
          headers={["Downstream consumer", "Consumes", "Status"]}
          rows={consumers.map((c) => [c.name, c.records, <StatusText key="s" status={c.status === "Ready" ? "Operational" : c.status} />])}
          empty="No consumers registered."
        />
      </div>
    </Panel>
  );
}

/* ---------------------------- canonical artifacts -------------------------- */

export function CanonicalArtifactPanel({ artifacts, onOpen, view, loading, paused, onClear }: {
  artifacts: CanonicalArtifact[]; onOpen: (a: CanonicalArtifact) => void; view: ViewMode;
  loading?: boolean; paused?: boolean; onClear: () => void;
}) {
  const headers = view === "executive"
    ? ["Artifact", "Source", "Type", "Team", "Status", "Quality", "Confidence"]
    : ["Artifact", "Source", "Type", "Original format", "Schema", "Team", "Owner", "Classification", "Status", "Quality", "Confidence", "Review", "Permissions"];

  return (
    <Panel id="panel-artifacts" title="Canonical Artifacts" subtitle={`${artifacts.length} representation${artifacts.length === 1 ? "" : "s"} in scope`} loading={loading}>
      {artifacts.length === 0 ? (
        <EmptyState title={paused ? "Processing is paused" : "No canonical artifacts match the current filters"}
          detail={paused ? "Approved artifacts remain queued and preserved." : "Clear the filters to see the full canonical inventory."}
          actionLabel="Clear filters" onAction={onClear} />
      ) : (
        <div className="max-h-80 overflow-y-auto">
          <SimpleTable
            headers={headers}
            rows={artifacts.map((a) => {
              const common = [
                <button key="t" type="button" className="text-left font-medium text-blue-700 hover:underline" onClick={() => onOpen(a)}>{a.title}</button>,
                a.sourceName, a.artifactType,
              ];
              return view === "executive"
                ? [...common, a.teamName, <StatusText key="s" status={a.normalizationStatus} />, a.qualityScore, `${a.confidence}%`]
                : [...common, a.originalFormat, a.schemaVersion, a.teamName, a.owner, a.accessClassification,
                   <StatusText key="s" status={a.normalizationStatus} />, a.qualityScore, `${a.confidence}%`,
                   a.humanReviewStatus, <StatusText key="p" status={a.permissionStatus} />];
            })}
            empty="No canonical artifacts."
          />
        </div>
      )}
    </Panel>
  );
}

export function CanonicalArtifactDrawer({ artifact, open, onOpenChange, onAction }: {
  artifact: CanonicalArtifact | null; open: boolean; onOpenChange: (v: boolean) => void;
  onAction: (action: string, a: CanonicalArtifact) => void;
}) {
  if (!artifact) return null;
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={artifact.title}
      description={`${artifact.artifactId} · ${artifact.originalFormat} · ${artifact.sourceName} · ${artifact.normalizationStatus}`}>
      <dl>
        <Row label="Canonical ID" value={artifact.id} />
        <Row label="Evidence ID" value={artifact.evidenceId} />
        <Row label="Schema" value={artifact.schemaVersion} />
        <Row label="Business unit" value={artifact.businessUnit} />
        <Row label="Team" value={artifact.teamName} />
        <Row label="Business owner" value={artifact.businessOwner} />
        <Row label="Technical owner" value={artifact.technicalOwner} />
        <Row label="Authority level" value={artifact.authorityLevel} />
        <Row label="Access classification" value={artifact.accessClassification} />
        <Row label="Regulatory scope" value={artifact.regulatoryScope.join(", ") || "None"} />
        <Row label="Language" value={artifact.language} />
        <Row label="Quality score" value={artifact.qualityScore} />
        <Row label="Confidence" value={`${artifact.confidence}%`} />
        <Row label="Human review" value={artifact.humanReviewStatus} />
        <Row label="Entity resolution" value={artifact.entityResolutionStatus} />
        <Row label="Permission status" value={<StatusText status={artifact.permissionStatus} />} />
        <Row label="Provenance status" value={artifact.provenanceStatus} />
        <Row label="Sections / tables / entities" value={`${artifact.sectionCount} / ${artifact.tableCount} / ${artifact.entityCount}`} />
        <Row label="Relationships / chunks" value={`${artifact.relationshipCount} / ${artifact.chunkCount}`} />
        <Row label="Content hash" value={<code className="text-[10.5px]">{artifact.contentHash}</code>} />
        <Row label="Normalized at" value={artifact.normalizedAt} />
      </dl>
      <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2.5">
        {["Open in Workbench", "Approve Representation", "Request Correction", "Reprocess Artifact", "Export Canonical Record"].map((a) => (
          <Button key={a} size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => onAction(a, artifact)}>{a}</Button>
        ))}
      </div>
    </Drawer>
  );
}
