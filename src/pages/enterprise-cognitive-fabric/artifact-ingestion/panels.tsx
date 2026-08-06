import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ReferenceLine, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowRight, ChevronRight, Database, FileCheck2, FileWarning, Fingerprint, GitBranch,
  Inbox, Layers, LockKeyhole, ScanSearch, ShieldCheck, Copy as CopyIcon,
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
  accessDistribution, accessSummary, artifactMetadata, artifactTypeComposition, artifactVersions,
  defaultMetadata, defaultPermission, duplicateCandidates, duplicateSummary, evidenceRecords,
  exceptionCategories, formatComposition, lineageChain, lineageFacts, permissionReviews,
  provenanceMetrics, qualityDetail, qualityMetrics, queueByStage, throughputSeries,
  type ArtifactRecord, type DuplicateCandidate, type IngestionActivity, type IngestionBatch,
  type IngestionException, type IngestionStage, type NormalizationReadiness, type ThroughputMetric,
  type ViewMode,
} from "./data";

/* --------------------------------- atoms ---------------------------------- */

export type Tone = "green" | "amber" | "red" | "blue" | "slate";
export type Density = "comfortable" | "compact";

export const nf = (n: number) => n.toLocaleString("en-US");
export const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2).replace(/0$/, "")}M` : n >= 1_000 ? `${Math.round(n / 1_000)}K` : String(n);

export const ingestTone = (status: string): Tone => {
  if (["Running", "Complete", "Completed", "Healthy", "Ready for Normalization", "Within SLA", "Preserved",
    "Confirmed", "Unique", "Current", "Success", "Auto-resolved", "Operational", "Within Capacity", "Resolved"].includes(status)) return "green";
  if (["Warning", "At Risk", "Review Required", "Review", "Human Review", "Permission Review", "Investigating",
    "Acknowledged", "Possible Duplicate", "Version Update", "Recent", "Aging", "Medium", "Processing",
    "Above Capacity", "Draining", "Degraded"].includes(status)) return "amber";
  if (["Blocked", "Failed", "Failed validation", "Breached", "Critical", "High", "Open", "Quarantined",
    "Corrupted", "Unsupported", "Conflicting Version", "Exact Duplicate", "Stale", "Backlogged", "Failure"].includes(status)) return "red";
  if (["Paused", "Idle", "Low", "Maintenance", "Historical"].includes(status)) return "slate";
  return "blue";
};

export function StatusText({ status }: { status: string }) {
  return <Pill label={status} tone={ingestTone(status)} />;
}

export function Metric({ label, value, sub, tone = "slate" }: { label: string; value: string; sub?: string; tone?: Tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2">
      <p className="text-[10.5px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn(
        "mt-0.5 text-[17px] font-semibold leading-none",
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

export const artifactsToCsv = (list: ArtifactRecord[]) =>
  toCsv(list.map((a) => ({
    "Artifact ID": a.id, Title: a.title, Source: a.sourceName, "Artifact Type": a.artifactType,
    Format: a.format, Team: a.teamName, Owner: a.owner, Authority: a.authorityLevel, Version: a.version,
    "Content Size": a.contentSize, "Access Classification": a.accessClassification,
    "Ingestion Status": a.ingestionStatus, "Duplicate Status": a.duplicateStatus,
    "Validation Score": a.validationScore, Received: a.receivedAt, Evidence: a.evidenceId,
    "Content Hash": a.contentHash, Batch: a.batchId,
  })));

export const batchesToCsv = (list: IngestionBatch[]) =>
  toCsv(list.map((b) => ({
    "Batch ID": b.id, Source: b.sourceName, Category: b.sourceCategory, "Ingestion Method": b.ingestionMethod,
    Status: b.status, Artifacts: b.artifactCount, "Current Stage": b.currentStageName, Started: b.startedAt,
    Elapsed: b.elapsedTime, "Success Rate": `${b.successRate}%`, Queue: b.queueDepth, Owner: b.owner,
    Warnings: b.warningCount,
  })));

/* ----------------------------- lifecycle panel ----------------------------- */

const STAGE_ICONS: Record<string, typeof Inbox> = {
  receive: Inbox, authenticate: ShieldCheck, capture: Database, metadata: ScanSearch,
  permissions: LockKeyhole, duplicate: CopyIcon, validate: FileCheck2, evidence: Fingerprint, queue: Layers,
};

export function LifecyclePanel({
  stages, selectedId, onSelect, loading, error, focusBottlenecks, onToggleBottlenecks,
  showBlocked, onToggleBlocked, spotlight, paused,
}: {
  stages: IngestionStage[]; selectedId: string; onSelect: (id: string) => void;
  loading?: boolean; error?: string | null; focusBottlenecks: boolean; onToggleBottlenecks: () => void;
  showBlocked: boolean; onToggleBlocked: () => void; spotlight?: boolean; paused?: boolean;
}) {
  const [zoom, setZoom] = useState(1);
  const maxThroughput = Math.max(...stages.map((s) => s.pendingCount), 1);
  const summary = `Nine ingestion stages. ${stages.filter((s) => s.status === "Running").length} running, ${stages.filter((s) => s.status === "Warning").length} in warning, ${stages.filter((s) => s.status === "Blocked").length} blocked. Highest queue is ${stages.reduce((a, b) => (b.pendingCount > a.pendingCount ? b : a)).name}.`;

  return (
    <Panel
      id="panel-lifecycle"
      title="Artifact Ingestion Lifecycle"
      subtitle="Every artifact is received, authenticated, preserved, inventoried, classified, checked, validated, and registered before normalization"
      loading={loading}
      error={error}
      degraded={paused ? "Intake is paused. Stages are draining work already in flight." : null}
      spotlight={spotlight}
    >
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-1.5">
        <Button size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => setZoom(1)}>Zoom to fit</Button>
        <Button size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => setZoom((z) => Math.min(1.4, z + 0.15))}>Zoom in</Button>
        <Button size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => { setZoom(1); onSelect("duplicate"); }}>Reset view</Button>
        <Button size="sm" variant={focusBottlenecks ? "default" : "outline"} className="h-6 text-[11px]" onClick={onToggleBottlenecks} aria-pressed={focusBottlenecks}>Focus bottlenecks</Button>
        <Button size="sm" variant={showBlocked ? "default" : "outline"} className="h-6 text-[11px]" onClick={onToggleBlocked} aria-pressed={showBlocked}>Show blocked artifacts</Button>
        <span className="ml-auto text-[11px] text-slate-500">Downstream dependency: Artifact Normalization</span>
      </div>

      <div className="overflow-x-auto p-3">
        <ol className="flex min-w-[1180px] items-stretch gap-1" style={{ zoom }}>
          {stages.map((s, i) => {
            const Icon = STAGE_ICONS[s.id] ?? Inbox;
            const dim = focusBottlenecks && !s.bottleneck;
            const active = s.id === selectedId;
            return (
              <li key={s.id} className="flex flex-1 items-stretch">
                <button
                  type="button"
                  onClick={() => onSelect(s.id)}
                  aria-pressed={active}
                  title={`${s.name}. ${s.definition} Current queue ${nf(s.pendingCount)}. Upstream ${s.upstreamStageId ?? "none"}. Downstream ${s.downstreamStageId ?? "normalization"}. Status ${s.status}.`}
                  className={cn(
                    "flex w-full flex-col rounded-lg border p-2 text-left transition-all",
                    active ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-200" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                    dim && "opacity-40",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                    <span className="text-[11px] font-semibold text-slate-800">{s.sequence}. {s.name}</span>
                  </div>
                  <div className="mt-1"><StatusText status={s.status} /></div>
                  <dl className="mt-1.5 space-y-0.5 text-[10.5px] text-slate-600">
                    <div className="flex justify-between"><dt>Processed</dt><dd className="font-medium">{s.processedLabel}</dd></div>
                    <div className="flex justify-between"><dt>Pending</dt><dd className="font-medium">{nf(s.pendingCount)}</dd></div>
                    <div className="flex justify-between"><dt>Success</dt><dd className="font-medium">{s.successRate}%</dd></div>
                    <div className="flex justify-between"><dt>Avg</dt><dd className="font-medium">{s.averageDuration}</dd></div>
                    <div className="flex justify-between"><dt>P95</dt><dd className="font-medium">{s.p95Duration}</dd></div>
                    <div className="flex justify-between"><dt>Warnings</dt><dd className="font-medium">{s.warningCount}</dd></div>
                    <div className="flex justify-between"><dt>Failures</dt><dd className={cn("font-medium", s.failedCount > 0 && "text-red-700")}>{s.failedCount}</dd></div>
                    <div className="flex justify-between"><dt>Throughput</dt><dd className="font-medium">{s.throughput}</dd></div>
                    <div className="flex justify-between"><dt>Owner</dt><dd className="truncate font-medium">{s.owner}</dd></div>
                    <div className="flex justify-between"><dt>SLA</dt><dd className="font-medium">{s.slaStatus}</dd></div>
                  </dl>
                  <div className="mt-1.5" aria-hidden>
                    <div className="h-1 w-full rounded bg-slate-100">
                      <div
                        className={cn("h-1 rounded", s.status === "Blocked" ? "bg-red-500" : s.status === "Warning" ? "bg-amber-500" : "bg-blue-500")}
                        style={{ width: `${Math.max(6, (s.pendingCount / maxThroughput) * 100)}%` }}
                      />
                    </div>
                  </div>
                  {s.bottleneck && <p className="mt-1 text-[10px] font-medium text-amber-700">{s.bottleneck}</p>}
                  {showBlocked && s.failedCount > 0 && (
                    <p className="mt-1 text-[10px] font-medium text-red-700">{s.failedCount} blocked artifact groups at this stage</p>
                  )}
                </button>
                {i < stages.length - 1 && (
                  <div className="flex items-center px-0.5" aria-hidden>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      <p className="sr-only">{summary}</p>
      <p className="border-t border-slate-100 px-3 py-1.5 text-[11px] text-slate-500">{summary}</p>
    </Panel>
  );
}

/* --------------------------- selected stage detail ------------------------- */

export function StageDetailPanel({ stage, artifacts, exceptions, onAction }: {
  stage: IngestionStage; artifacts: ArtifactRecord[]; exceptions: IngestionException[];
  onAction: (action: string) => void;
}) {
  const queue = artifacts.slice(0, 8);
  const typeDist = useMemo(() => {
    const m = new Map<string, number>();
    artifacts.forEach((a) => m.set(a.artifactType, (m.get(a.artifactType) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [artifacts]);
  const srcDist = useMemo(() => {
    const m = new Map<string, number>();
    artifacts.forEach((a) => m.set(a.sourceName, (m.get(a.sourceName) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [artifacts]);

  return (
    <Panel id="panel-stage-detail" title="Selected Stage Detail" subtitle={`${stage.name} · configuration v3.4`}>
      <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-4 xl:grid-cols-6">
        <Metric label="Status" value={stage.status} tone={ingestTone(stage.status)} />
        <Metric label="Processing" value={nf(stage.pendingCount)} sub="artifacts in stage" />
        <Metric label="Completed this hour" value={compact(Math.round(stage.processedCount * 0.004))} />
        <Metric label="Requiring review" value={nf(stage.warningCount * 92)} tone="amber" />
        <Metric label="Average duration" value={stage.averageDuration} />
        <Metric label="P95 duration" value={stage.p95Duration} />
        <Metric label="Success rate" value={`${stage.successRate}%`} tone={stage.successRate >= 98 ? "green" : "amber"} />
        <Metric label="Throughput" value={stage.throughput} />
        <Metric label="SLA" value={stage.slaStatus} tone={stage.slaStatus === "Within SLA" ? "green" : "amber"} />
        <Metric label="Owner" value={stage.owner} />
        <Metric label="Upstream" value={stage.upstreamStageId ?? "Source delivery"} />
        <Metric label="Downstream" value={stage.downstreamStageId ?? "Normalization"} />
      </div>

      <Tabs defaultValue="overview" className="px-3 pb-3">
        <TabsList className="h-8">
          {["overview", "queue", "duplicates", "versions", "errors", "outputs", "configuration"].map((t) => (
            <TabsTrigger key={t} value={t} className="h-6 text-[11.5px] capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-2 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-2">
            <p className="mb-1 text-[11px] font-semibold text-slate-700">Current workload</p>
            <dl>
              <Row label="Artifacts in stage" value={nf(stage.pendingCount)} />
              <Row label="Review rate" value={`${(stage.warningCount * 0.9).toFixed(1)}%`} />
              <Row label="Current bottleneck" value={stage.bottleneck ?? "None"} />
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 p-2">
            <p className="mb-1 text-[11px] font-semibold text-slate-700">Artifact type distribution</p>
            <dl>{typeDist.map(([k, v]) => <Row key={k} label={k} value={v} />)}</dl>
          </div>
          <div className="rounded-lg border border-slate-200 p-2">
            <p className="mb-1 text-[11px] font-semibold text-slate-700">Source distribution</p>
            <dl>{srcDist.map(([k, v]) => <Row key={k} label={k} value={v} />)}</dl>
          </div>
        </TabsContent>

        <TabsContent value="queue" className="mt-2">
          <SimpleTable
            headers={["Artifact ID", "Title", "Source", "Artifact Type", "Queue Age", "Priority", "Access", "Attempts", "Status"]}
            rows={queue.map((a) => [a.id, a.title, a.sourceName, a.artifactType, a.receivedAt, a.authorityLevel === "Primary" ? "High" : "Standard",
              a.accessClassification, "1", <StatusText key={a.id} status={a.ingestionStatus} />])}
            empty="No artifacts are queued at this stage."
          />
        </TabsContent>

        <TabsContent value="duplicates" className="mt-2">
          <SimpleTable
            headers={["Artifact", "Candidate Match", "Similarity", "Hash Match", "Metadata Match", "Version Relationship", "Authority Conflict", "Review Status"]}
            rows={duplicateCandidates.map((d) => [d.artifactTitle, d.candidateTitle, `${d.semanticSimilarity}%`,
              `${d.contentHashSimilarity}%`, `${d.metadataSimilarity}%`, d.relationshipType, d.authorityConflict ? "Yes" : "No",
              <StatusText key={d.id} status={d.reviewStatus} />])}
            empty="No duplicate candidates."
          />
        </TabsContent>

        <TabsContent value="versions" className="mt-2">
          <SimpleTable
            headers={["Artifact Family", "Current Version", "Previous Version", "Change Type", "Source Timestamp", "Ingested Timestamp", "Owner", "Status"]}
            rows={artifactVersions.map((v) => [v.artifactFamilyName, v.version, v.previousVersion, v.changeType,
              v.sourceTimestamp, v.ingestedTimestamp, v.owner, <StatusText key={v.id} status={v.status} />])}
            empty="No versions detected."
          />
        </TabsContent>

        <TabsContent value="errors" className="mt-2">
          <SimpleTable
            headers={["Error Code", "Description", "Artifacts", "Source", "First Seen", "Last Seen", "Severity", "Retryable"]}
            rows={exceptions.slice(0, 6).map((e) => [e.id, e.description, nf(84), e.sourceName, e.createdAt, "now",
              <StatusText key={e.id} status={e.severity} />, e.exceptionType === "Policy Violation" ? "No" : "Yes"])}
            empty="No errors recorded at this stage."
          />
        </TabsContent>

        <TabsContent value="outputs" className="mt-2 grid gap-2 md:grid-cols-4 xl:grid-cols-7">
          <Metric label="Originals preserved" value={compact(stage.processedCount)} />
          <Metric label="Metadata records" value={compact(Math.round(stage.processedCount * 0.98))} />
          <Metric label="Permission records" value={compact(Math.round(stage.processedCount * 0.95))} />
          <Metric label="Version records" value={compact(62_000)} />
          <Metric label="Duplicate candidates" value={compact(18_642)} />
          <Metric label="Evidence registrations" value={compact(2_190_000)} />
          <Metric label="Normalization queue" value={nf(42_318)} />
        </TabsContent>

        <TabsContent value="configuration" className="mt-2 grid gap-3 md:grid-cols-2">
          <dl className="rounded-lg border border-slate-200 p-2">
            <Row label="Concurrency" value="24 workers" />
            <Row label="Batch size" value="5,000 artifacts" />
            <Row label="Timeout" value="4 minutes" />
            <Row label="Retry count" value="3" />
            <Row label="Maximum artifact size" value="250 MB" />
          </dl>
          <dl className="rounded-lg border border-slate-200 p-2">
            <Row label="Duplicate similarity threshold" value="85%" />
            <Row label="Version detection threshold" value="70%" />
            <Row label="Freshness threshold" value="180 days" />
            <Row label="Supported formats" value="PDF, DOCX, XLSX, PPTX, HTML, JSON, XML, CSV, MD, VTT, TXT, YAML" />
          </dl>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-3 py-2">
        {["Pause Stage", "Resume Stage", "Retry Failures", "Drain Queue", "Reprocess Selected", "View Logs", "Edit Configuration", "Create Incident"].map((a) => (
          <Button key={a} size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => onAction(a)}>{a}</Button>
        ))}
      </div>
    </Panel>
  );
}

export function SimpleTable({ headers, rows, empty }: { headers: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (!rows.length) return <p className="px-2 py-6 text-center text-[11.5px] text-slate-500">{empty}</p>;
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-[11.5px]">
        <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500">
          <tr>{headers.map((h) => <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100">
              {r.map((c, j) => <td key={j} className="px-2 py-1.5 align-top text-slate-700">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------ batches table ------------------------------ */

const BATCH_COLUMNS = [
  "Batch ID", "Source", "Category", "Ingestion Method", "Status", "Artifacts", "Current Stage",
  "Started", "Elapsed Time", "Success Rate", "Queue", "Owner", "Warnings",
] as const;

export function BatchTablePanel({
  batches, loading, error, onOpen, selected, onSelect, density, onDensity, columns, onColumns,
  onExport, onBulk, view, highlight, spotlight, paused, onStart,
}: {
  batches: IngestionBatch[]; loading?: boolean; error?: string | null;
  onOpen: (b: IngestionBatch) => void; selected: string[]; onSelect: (ids: string[]) => void;
  density: Density; onDensity: (d: Density) => void; columns: string[]; onColumns: (c: string[]) => void;
  onExport: () => void; onBulk: (action: string) => void; view: ViewMode; highlight: string[];
  spotlight?: boolean; paused?: boolean; onStart: () => void;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "Batch ID", dir: "desc" });
  const [source, setSource] = useState("All");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [owner, setOwner] = useState("All");
  const [page, setPage] = useState(0);
  const pageSize = 6;

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = batches.filter((b) =>
      (!t || `${b.id} ${b.sourceName} ${b.owner} ${b.currentStageName}`.toLowerCase().includes(t)) &&
      (source === "All" || b.sourceName === source) &&
      (category === "All" || b.sourceCategory === category) &&
      (status === "All" || b.status === status) &&
      (owner === "All" || b.owner === owner));
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const get = (x: IngestionBatch) =>
        sort.key === "Artifacts" ? x.artifactCount : sort.key === "Success Rate" ? x.successRate
          : sort.key === "Queue" ? x.queueDepth : sort.key === "Warnings" ? x.warningCount
            : `${(x as unknown as Record<string, unknown>)[sort.key === "Batch ID" ? "id" : sort.key === "Source" ? "sourceName" : "status"]}`;
      const av = get(a); const bv = get(b);
      return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
    });
  }, [batches, q, source, category, status, owner, sort]);

  const paged = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const visible = BATCH_COLUMNS.filter((c) => columns.includes(c));
  const pad = density === "compact" ? "py-1" : "py-2";

  const cell = (b: IngestionBatch, col: string): React.ReactNode => {
    switch (col) {
      case "Batch ID": return <button type="button" className="font-medium text-blue-700 hover:underline" onClick={() => onOpen(b)}>{b.id}</button>;
      case "Source": return b.sourceName;
      case "Category": return b.sourceCategory;
      case "Ingestion Method": return b.ingestionMethod;
      case "Status": return <StatusText status={b.status} />;
      case "Artifacts": return nf(b.artifactCount);
      case "Current Stage": return b.currentStageName;
      case "Started": return b.startedAt;
      case "Elapsed Time": return b.elapsedTime;
      case "Success Rate": return `${b.successRate}%`;
      case "Queue": return nf(b.queueDepth);
      case "Owner": return b.owner;
      case "Warnings": return b.warningCount > 0 ? <span className="font-medium text-amber-700">{b.warningCount}</span> : "0";
      default: return null;
    }
  };

  return (
    <Panel
      id="panel-batches"
      title="Active Ingestion Batches"
      subtitle={`${filtered.length} batches match the current filters${view === "governance" ? " · governance columns emphasised" : ""}`}
      loading={loading}
      error={error}
      degraded={paused ? "Intake paused. Batches are draining and no new batches will start." : null}
      spotlight={spotlight}
    >
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2">
        <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search batches" aria-label="Search batches" className="h-7 w-48 text-[11.5px]" />
        <FilterSelect label="Source" value={source} onChange={setSource} options={["All", ...new Set(batches.map((b) => b.sourceName))]} />
        <FilterSelect label="Category" value={category} onChange={setCategory} options={["All", ...new Set(batches.map((b) => b.sourceCategory))]} />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={["All", ...new Set(batches.map((b) => b.status))]} />
        <FilterSelect label="Owner" value={owner} onChange={setOwner} options={["All", ...new Set(batches.map((b) => b.owner))]} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-7 text-[11px]">Columns</Button></DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-[11.5px]">Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {BATCH_COLUMNS.map((c) => (
              <DropdownMenuCheckboxItem
                key={c} checked={columns.includes(c)} className="text-[11.5px]"
                onCheckedChange={(v) => onColumns(v ? [...columns, c] : columns.filter((x) => x !== c))}
              >{c}</DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onDensity(density === "compact" ? "comfortable" : "compact")}>
          {density === "compact" ? "Comfortable" : "Compact"}
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onExport}>Export current view</Button>
        {selected.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" className="h-7 text-[11px]">Bulk actions ({selected.length})</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {["Pause Batches", "Resume Batches", "Retry Failed", "Export Selected", "Create Incident"].map((a) => (
                <DropdownMenuItem key={a} className="text-[11.5px]" onSelect={() => onBulk(a)}>{a}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <EmptyState
          title="No ingestion batches match the current filters"
          detail="Clear the filters, or start an ingestion run to bring approved enterprise artifacts into the Fabric."
          actionLabel="Start Ingestion" onAction={onStart}
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11.5px]">
              <caption className="sr-only">Active ingestion batches with source, status, stage, and queue depth</caption>
              <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="w-8 px-2 py-1.5">
                    <Checkbox
                      aria-label="Select all batches"
                      checked={selected.length === paged.length && paged.length > 0}
                      onCheckedChange={(v) => onSelect(v ? paged.map((b) => b.id) : [])}
                    />
                  </th>
                  {visible.map((c) => (
                    <th key={c} scope="col" className="whitespace-nowrap px-2 py-1.5 font-medium">
                      <button type="button" className="hover:text-slate-800" onClick={() => setSort((s) => ({ key: c, dir: s.key === c && s.dir === "asc" ? "desc" : "asc" }))}>
                        {c}{sort.key === c ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
                      </button>
                    </th>
                  ))}
                  <th scope="col" className="px-2 py-1.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((b) => (
                  <tr key={b.id} className={cn("border-t border-slate-100 hover:bg-slate-50", highlight.includes(b.id) && "bg-blue-50/60")}>
                    <td className={cn("px-2", pad)}>
                      <Checkbox
                        aria-label={`Select ${b.id}`} checked={selected.includes(b.id)}
                        onCheckedChange={(v) => onSelect(v ? [...selected, b.id] : selected.filter((x) => x !== b.id))}
                      />
                    </td>
                    {visible.map((c) => <td key={c} className={cn("whitespace-nowrap px-2 text-slate-700", pad)}>{cell(b, c)}</td>)}
                    <td className={cn("px-2", pad)}>
                      <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[11px]" onClick={() => onOpen(b)}>
                        Open<ChevronRight className="ml-0.5 h-3 w-3" aria-hidden />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-1.5 text-[11px] text-slate-500">
            <span>Showing {paged.length} of {filtered.length} batches</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-6 text-[11px]" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button size="sm" variant="outline" className="h-6 text-[11px]" disabled={(page + 1) * pageSize >= filtered.length} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}

export function FilterSelect({ label, value, onChange, options, className }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-7 w-auto min-w-[9rem] text-[11.5px]", className)} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {options.map((o) => <SelectItem key={o} value={o} className="text-[11.5px]">{o === "All" ? `${label}: All` : o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

/* --------------------------- batch detail drawer --------------------------- */

export function BatchDetailDrawer({ batch, open, onOpenChange, artifacts, exceptions, onAction, onOpenArtifact }: {
  batch: IngestionBatch | null; open: boolean; onOpenChange: (v: boolean) => void;
  artifacts: ArtifactRecord[]; exceptions: IngestionException[];
  onAction: (action: string, batch: IngestionBatch) => void; onOpenArtifact: (a: ArtifactRecord) => void;
}) {
  const [q, setQ] = useState("");
  if (!batch) return null;
  const rows = artifacts.filter((a) => a.batchId === batch.id && (!q || a.title.toLowerCase().includes(q.toLowerCase())));
  const timeline = [
    ["Receive", "Completed"], ["Authenticate Source", "Completed"], ["Capture Original", "Completed"],
    ["Extract Metadata", "Processing"], ["Preserve Permissions", "Queued"], ["Detect Version and Duplicate", "Queued"],
    ["Validate Artifact", "Queued"], ["Register Evidence", "Queued"], ["Queue for Normalization", "Queued"],
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide
      title={`${batch.id} · ${batch.sourceName}`}
      description={`${batch.status} · ${batch.currentStageName} · owner ${batch.owner}`}>
      <Tabs defaultValue="summary">
        <TabsList className="h-8 flex-wrap">
          {["summary", "artifacts", "timeline", "validation", "exceptions", "evidence", "logs"].map((t) => (
            <TabsTrigger key={t} value={t} className="h-6 text-[11.5px] capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="summary" className="mt-2">
          <dl className="rounded-lg border border-slate-200 p-2">
            <Row label="Source" value={batch.sourceName} />
            <Row label="Ingestion method" value={batch.ingestionMethod} />
            <Row label="Artifact count" value={nf(batch.artifactCount)} />
            <Row label="Completed" value={nf(batch.completedCount)} />
            <Row label="Pending" value={nf(batch.pendingCount)} />
            <Row label="Failed" value={nf(batch.failedCount)} />
            <Row label="Quarantined" value={nf(batch.quarantinedCount)} />
            <Row label="Duplicate candidates" value={nf(batch.duplicateCandidateCount)} />
            <Row label="Versions detected" value={nf(batch.versionCount)} />
            <Row label="Permissions preserved" value={`${nf(batch.completedCount - batch.permissionReviewCount)} of ${nf(batch.completedCount)}`} />
            <Row label="Started" value={batch.startedAt} />
            <Row label="Elapsed" value={batch.elapsedTime} />
            <Row label="Estimated completion" value={batch.estimatedCompletion} />
            <Row label="Success rate" value={`${batch.successRate}%`} />
            <Row label="Configuration version" value={batch.configurationVersion} />
          </dl>
        </TabsContent>

        <TabsContent value="artifacts" className="mt-2 space-y-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search artifacts in this batch" aria-label="Search artifacts in this batch" className="h-7 text-[11.5px]" />
          <SimpleTable
            headers={["Artifact", "Type", "Format", "Status", "Validation", ""]}
            rows={rows.map((a) => [a.title, a.artifactType, a.format, <StatusText key={a.id} status={a.ingestionStatus} />, a.validationScore,
              <Button key={`${a.id}-b`} size="sm" variant="ghost" className="h-5 px-1 text-[11px]" onClick={() => onOpenArtifact(a)}>Open</Button>])}
            empty="No artifacts in this batch match the search."
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-2">
          <ol className="space-y-1">
            {timeline.map(([name, state]) => (
              <li key={name} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1 text-[11.5px]">
                <span className="text-slate-700">{name}</span><StatusText status={state} />
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="validation" className="mt-2">
          <dl className="rounded-lg border border-slate-200 p-2">
            <Row label="Completeness" value="98.4%" />
            <Row label="Readability" value="97.1%" />
            <Row label="Supported format" value="96.2%" />
            <Row label="Metadata completeness" value="96.0%" />
            <Row label="Permission completeness" value="94.0%" />
            <Row label="Freshness" value="92.6%" />
            <Row label="Source consistency" value="99.1%" />
          </dl>
        </TabsContent>

        <TabsContent value="exceptions" className="mt-2">
          <SimpleTable
            headers={["Exception", "Type", "Severity", "Status", "Recommended Action"]}
            rows={exceptions.filter((e) => e.batchId === batch.id).map((e) => [e.artifactTitle, e.exceptionType,
              <StatusText key={e.id} status={e.severity} />, <StatusText key={`${e.id}-s`} status={e.status} />, e.recommendedAction])}
            empty="No exceptions recorded for this batch."
          />
        </TabsContent>

        <TabsContent value="evidence" className="mt-2">
          <SimpleTable
            headers={["Evidence ID", "Original file", "Content hash", "Version", "Owner", "Access", "Vault location"]}
            rows={evidenceRecords.filter((e) => e.ingestionBatchId === batch.id).map((e) => [e.immutableEvidenceId,
              e.sourceIdentifier, e.contentHash, e.version, e.owner, e.accessClassification, e.evidenceVaultLocation])}
            empty="No evidence records registered yet for this batch."
          />
        </TabsContent>

        <TabsContent value="logs" className="mt-2">
          <pre className="max-h-64 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-[10.5px] text-slate-700">
{`${batch.startedAt} batch ${batch.id} started · method ${batch.ingestionMethod}
${batch.startedAt} source ${batch.sourceName} authenticated
${batch.startedAt} capture original started · originals preserved unmodified
${batch.startedAt} metadata extraction in progress · ${nf(batch.pendingCount)} pending
${batch.startedAt} permission preservation queued · ${nf(batch.permissionReviewCount)} awaiting review
${batch.startedAt} current stage ${batch.currentStageName} · success rate ${batch.successRate}%`}
          </pre>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
        {["Pause Batch", "Resume Batch", "Cancel Batch", "Retry Failed", "Restart from Stage", "Reprocess Selected",
          "Export Batch Report", "Open Source Registry", "Create Incident"].map((a) => (
          <Button key={a} size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => onAction(a, batch)}>{a}</Button>
        ))}
      </div>
    </Drawer>
  );
}

/* --------------------------- artifact intake queue ------------------------- */

const ARTIFACT_COLUMNS = [
  "Artifact ID", "Title", "Source", "Artifact Type", "Format", "Team", "Owner", "Authority",
  "Version", "Content Size", "Access Classification", "Ingestion Status", "Duplicate Status",
  "Validation Score", "Received",
] as const;

export const viewColumns: Record<ViewMode, string[]> = {
  executive: ["Artifact ID", "Title", "Source", "Artifact Type", "Team", "Ingestion Status", "Validation Score", "Received"],
  operations: ["Artifact ID", "Title", "Source", "Artifact Type", "Format", "Ingestion Status", "Duplicate Status", "Validation Score", "Received"],
  governance: ["Artifact ID", "Title", "Team", "Owner", "Authority", "Access Classification", "Ingestion Status", "Received"],
  evidence: ["Artifact ID", "Title", "Source", "Version", "Content Size", "Format", "Ingestion Status", "Received"],
};

export function ArtifactQueuePanel({
  artifacts, loading, error, onOpen, density, onDensity, columns, onColumns, onBulk,
  selected, onSelect, highlight, spotlight, onUpload, paused,
}: {
  artifacts: ArtifactRecord[]; loading?: boolean; error?: string | null;
  onOpen: (a: ArtifactRecord) => void; density: Density; onDensity: (d: Density) => void;
  columns: string[]; onColumns: (c: string[]) => void; onBulk: (action: string) => void;
  selected: string[]; onSelect: (ids: string[]) => void; highlight: string[];
  spotlight?: boolean; onUpload: () => void; paused?: boolean;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [format, setFormat] = useState("All");
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState("All");
  const [owner, setOwner] = useState("All");
  const [access, setAccess] = useState("All");
  const [dup, setDup] = useState("All");
  const [fresh, setFresh] = useState("All");

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return artifacts.filter((a) =>
      (!t || `${a.id} ${a.title} ${a.owner} ${a.sourceName} ${a.format}`.toLowerCase().includes(t)) &&
      (type === "All" || a.artifactType === type) && (format === "All" || a.format === format) &&
      (status === "All" || a.ingestionStatus === status) && (source === "All" || a.sourceName === source) &&
      (owner === "All" || a.owner === owner) && (access === "All" || a.accessClassification === access) &&
      (dup === "All" || a.duplicateStatus === dup) && (fresh === "All" || a.freshnessStatus === fresh));
  }, [artifacts, q, type, format, status, source, owner, access, dup, fresh]);

  const visible = ARTIFACT_COLUMNS.filter((c) => columns.includes(c));
  const pad = density === "compact" ? "py-1" : "py-2";

  const cell = (a: ArtifactRecord, col: string): React.ReactNode => {
    switch (col) {
      case "Artifact ID": return <button type="button" className="font-medium text-blue-700 hover:underline" onClick={() => onOpen(a)}>{a.id}</button>;
      case "Title": return <span className="block max-w-[22rem] truncate" title={a.title}>{a.title}</span>;
      case "Source": return a.sourceName;
      case "Artifact Type": return a.artifactType;
      case "Format": return a.format;
      case "Team": return a.teamName;
      case "Owner": return a.owner;
      case "Authority": return a.authorityLevel;
      case "Version": return a.version;
      case "Content Size": return a.contentSize;
      case "Access Classification": return <StatusText status={a.accessClassification} />;
      case "Ingestion Status": return <StatusText status={a.ingestionStatus} />;
      case "Duplicate Status": return <StatusText status={a.duplicateStatus} />;
      case "Validation Score": return (
        <span className={cn("font-medium", a.validationScore >= 90 ? "text-emerald-700" : a.validationScore >= 70 ? "text-amber-700" : "text-red-700")}>
          {a.validationScore}
        </span>
      );
      case "Received": return a.receivedAt;
      default: return null;
    }
  };

  return (
    <Panel
      id="panel-queue"
      title="Artifact Intake Queue"
      subtitle={`${rows.length} artifacts visible · original evidence preserved for every record`}
      loading={loading}
      error={error}
      degraded={paused ? "Intake paused. No new artifacts are being accepted into the queue." : null}
      spotlight={spotlight}
    >
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search artifacts" aria-label="Search artifacts" className="h-7 w-52 text-[11.5px]" />
        <FilterSelect label="Type" value={type} onChange={setType} options={["All", ...new Set(artifacts.map((a) => a.artifactType))]} />
        <FilterSelect label="Format" value={format} onChange={setFormat} options={["All", ...new Set(artifacts.map((a) => a.format))]} />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={["All", ...new Set(artifacts.map((a) => a.ingestionStatus))]} />
        <FilterSelect label="Source" value={source} onChange={setSource} options={["All", ...new Set(artifacts.map((a) => a.sourceName))]} />
        <FilterSelect label="Owner" value={owner} onChange={setOwner} options={["All", ...new Set(artifacts.map((a) => a.owner))]} />
        <FilterSelect label="Access" value={access} onChange={setAccess} options={["All", ...new Set(artifacts.map((a) => a.accessClassification))]} />
        <FilterSelect label="Duplicate" value={dup} onChange={setDup} options={["All", ...new Set(artifacts.map((a) => a.duplicateStatus))]} />
        <FilterSelect label="Freshness" value={fresh} onChange={setFresh} options={["All", ...new Set(artifacts.map((a) => a.freshnessStatus))]} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-7 text-[11px]">Columns</Button></DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {ARTIFACT_COLUMNS.map((c) => (
              <DropdownMenuCheckboxItem key={c} checked={columns.includes(c)} className="text-[11.5px]"
                onCheckedChange={(v) => onColumns(v ? [...columns, c] : columns.filter((x) => x !== c))}>{c}</DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onDensity(density === "compact" ? "comfortable" : "compact")}>
          {density === "compact" ? "Comfortable" : "Compact"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={selected.length === 0}>Bulk actions ({selected.length})</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {["Approve for Normalization", "Quarantine", "Retry", "Request Augmentation", "Export Selected"].map((a) => (
              <DropdownMenuItem key={a} className="text-[11.5px]" onSelect={() => onBulk(a)}>{a}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? <TableSkeleton rows={7} /> : rows.length === 0 ? (
        <EmptyState
          title="No artifacts are in the intake queue"
          detail="No artifacts match the current filters. Start an ingestion run from an approved source, or submit artifacts manually."
          actionLabel="Upload Artifacts" onAction={onUpload}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11.5px]">
            <caption className="sr-only">Artifact intake queue with source, ownership, classification, and validation state</caption>
            <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="w-8 px-2 py-1.5">
                  <Checkbox aria-label="Select all artifacts" checked={selected.length === rows.length && rows.length > 0}
                    onCheckedChange={(v) => onSelect(v ? rows.map((a) => a.id) : [])} />
                </th>
                {visible.map((c) => <th key={c} scope="col" className="whitespace-nowrap px-2 py-1.5 font-medium">{c}</th>)}
                <th scope="col" className="px-2 py-1.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className={cn("border-t border-slate-100 hover:bg-slate-50", highlight.includes(a.id) && "bg-blue-50/60")}>
                  <td className={cn("px-2", pad)}>
                    <Checkbox aria-label={`Select ${a.id}`} checked={selected.includes(a.id)}
                      onCheckedChange={(v) => onSelect(v ? [...selected, a.id] : selected.filter((x) => x !== a.id))} />
                  </td>
                  {visible.map((c) => <td key={c} className={cn("whitespace-nowrap px-2 text-slate-700", pad)}>{cell(a, c)}</td>)}
                  <td className={cn("px-2", pad)}>
                    <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[11px]" onClick={() => onOpen(a)}>
                      Evidence<ChevronRight className="ml-0.5 h-3 w-3" aria-hidden />
                    </Button>
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

/* -------------------------- artifact evidence drawer ----------------------- */

export function ArtifactEvidenceDrawer({ artifact, open, onOpenChange, onAction }: {
  artifact: ArtifactRecord | null; open: boolean; onOpenChange: (v: boolean) => void;
  onAction: (action: string, artifact: ArtifactRecord) => void;
}) {
  if (!artifact) return null;
  const meta = artifactMetadata[artifact.id] ?? defaultMetadata(artifact);
  const perm = defaultPermission(artifact);
  const dupes = duplicateCandidates.filter((d) => d.artifactId === artifact.id);
  const evidence = evidenceRecords.find((e) => e.artifactId === artifact.id);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide
      title={artifact.title}
      description={`${artifact.id} · ${artifact.ingestionStatus} · validation ${artifact.validationScore} · authority ${artifact.authorityLevel}`}>
      <Tabs defaultValue="overview">
        <TabsList className="h-8 flex-wrap">
          {["overview", "evidence", "metadata", "permissions", "versions", "duplicates", "lineage", "downstream", "history"].map((t) => (
            <TabsTrigger key={t} value={t} className="h-6 text-[11.5px] capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-2">
          <p className="mb-2 text-[11.5px] text-slate-600">{artifact.description}</p>
          <dl className="rounded-lg border border-slate-200 p-2">
            <Row label="Artifact type" value={artifact.artifactType} />
            <Row label="Format" value={artifact.format} />
            <Row label="Source" value={artifact.sourceName} />
            <Row label="Team" value={artifact.teamName} />
            <Row label="Owner" value={artifact.owner} />
            <Row label="Business unit" value={artifact.businessUnit} />
            <Row label="Knowledge domains" value={artifact.knowledgeDomains.join(", ")} />
            <Row label="Authority" value={artifact.authorityLevel} />
            <Row label="Freshness" value={<StatusText status={artifact.freshnessStatus} />} />
            <Row label="Received" value={artifact.receivedAt} />
            <Row label="Source modified" value={artifact.sourceModifiedAt} />
          </dl>
        </TabsContent>

        <TabsContent value="evidence" className="mt-2 space-y-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="text-[10.5px] uppercase tracking-wide text-slate-500">Synthetic preview</p>
            <p className="mt-1 text-[11.5px] text-slate-700">{artifact.preview}</p>
          </div>
          <dl className="rounded-lg border border-slate-200 p-2">
            <Row label="Original file identifier" value={artifact.originalFilename} />
            <Row label="Source URL" value={`https://source.internal/${artifact.sourceName.toLowerCase().replace(/\s+/g, "-")}/…`} />
            <Row label="Content hash" value={artifact.contentHash} />
            <Row label="File size" value={artifact.contentSize} />
            <Row label="MIME type" value={artifact.mimeType} />
            <Row label="Immutable evidence ID" value={evidence?.immutableEvidenceId ?? `${artifact.evidenceId}-IMM`} />
            <Row label="Evidence vault location" value={evidence?.evidenceVaultLocation ?? "pending registration"} />
          </dl>
        </TabsContent>

        <TabsContent value="metadata" className="mt-2">
          <dl className="rounded-lg border border-slate-200 p-2">
            <Row label="Title" value={meta.title} />
            <Row label="Author" value={meta.author} />
            <Row label="Created" value={meta.createdDate} />
            <Row label="Modified" value={meta.modifiedDate} />
            <Row label="Language" value={meta.language} />
            <Row label="Sections" value={meta.sections} />
            <Row label="Tables" value={meta.tables} />
            <Row label="Attachments" value={meta.attachments} />
            <Row label="Participants" value={meta.participants.length ? meta.participants.join(", ") : "Not applicable"} />
            <Row label="Speakers" value={meta.speakers.length ? meta.speakers.join(", ") : "Not applicable"} />
            <Row label="Timestamps" value={meta.timestamps} />
            <Row label="Tags" value={meta.tags.join(", ")} />
          </dl>
        </TabsContent>

        <TabsContent value="permissions" className="mt-2">
          <dl className="rounded-lg border border-slate-200 p-2">
            <Row label="Source permissions" value={perm.sourcePermissions.join(", ")} />
            <Row label="Inherited permissions" value={perm.inheritedPermissions.join(", ")} />
            <Row label="Approved consumers" value={perm.approvedConsumers.join(", ")} />
            <Row label="Restricted consumers" value={perm.restrictedConsumers.join(", ")} />
            <Row label="Access classification" value={<StatusText status={perm.accessClassification} />} />
            <Row label="Regulatory scope" value={perm.regulatoryScope.length ? perm.regulatoryScope.join(", ") : "None"} />
            <Row label="Permission drift" value={perm.permissionDrift} />
          </dl>
        </TabsContent>

        <TabsContent value="versions" className="mt-2">
          <dl className="rounded-lg border border-slate-200 p-2">
            <Row label="Current version" value={artifact.version} />
            <Row label="Prior version" value={artifact.previousVersionId ?? "None"} />
            <Row label="Change summary" value={artifact.versionRelationship} />
            <Row label="Source timestamp" value={artifact.sourceModifiedAt} />
            <Row label="Content hash" value={artifact.contentHash} />
          </dl>
        </TabsContent>

        <TabsContent value="duplicates" className="mt-2">
          <SimpleTable
            headers={["Candidate", "Semantic", "Hash", "Metadata", "Authority Conflict", "Recommended Action"]}
            rows={dupes.map((d) => [d.candidateTitle, `${d.semanticSimilarity}%`, `${d.contentHashSimilarity}%`,
              `${d.metadataSimilarity}%`, d.authorityConflict ? "Yes" : "No", d.recommendedAction])}
            empty="No duplicate candidates were found for this artifact."
          />
        </TabsContent>

        <TabsContent value="lineage" className="mt-2">
          <ol className="space-y-1">
            {[
              ["Source System", artifact.sourceName], ["Connector", `CON-${artifact.sourceId.slice(-4)}`],
              ["Discovery Run", "DISC-4921"], ["Ingestion Batch", artifact.batchId],
              ["Evidence Vault", artifact.evidenceId], ["Normalization Queue", artifact.normalizationQueueId ?? "Not queued"],
              ["Business Conditions", artifact.normalizationQueueId ? "3 extracted" : "Pending"],
              ["Team Personas", `${artifact.teamName} Persona`], ["Impact Evaluations", artifact.normalizationQueueId ? "2 referencing" : "None"],
              ["Decisions", artifact.normalizationQueueId ? "1 referencing" : "None"],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1 text-[11.5px]">
                <span className="text-slate-500">{k}</span><span className="font-medium text-slate-800">{v}</span>
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="downstream" className="mt-2 grid gap-2 sm:grid-cols-2">
          <Metric label="Business conditions extracted" value={artifact.normalizationQueueId ? "3" : "0"} />
          <Metric label="Personas referencing artifact" value={artifact.normalizationQueueId ? "2" : "0"} />
          <Metric label="Impact evaluations using evidence" value={artifact.normalizationQueueId ? "2" : "0"} />
          <Metric label="Decisions referencing evidence" value={artifact.normalizationQueueId ? "1" : "0"} />
          {!artifact.normalizationQueueId && (
            <p className="col-span-full text-[11.5px] text-amber-700">
              This artifact has not reached normalization, so no downstream business conditions, personas, or decisions can use it yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-2">
          <SimpleTable
            headers={["Event", "Timestamp", "Result"]}
            rows={[
              ["Discovered", "10:00 AM", "Success"], ["Received", artifact.receivedAt, "Success"],
              ["Validated", artifact.receivedAt, `Score ${artifact.validationScore}`],
              ["Reviewed", artifact.ingestionStatus === "Ready for Normalization" ? artifact.receivedAt : "Pending", artifact.ingestionStatus],
              ["Version created", artifact.versionRelationship, artifact.version],
              ["Duplicate reviewed", artifact.duplicateStatus, artifact.duplicateStatus === "Unique" ? "No action" : "Review"],
              ["Permission checked", artifact.permissionStatus, artifact.permissionStatus === "Preserved" ? "Preserved" : "Review"],
            ].map((r) => r as React.ReactNode[])}
            empty="No history recorded."
          />
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
        {["Approve for Normalization", "Request Augmentation", "Quarantine", "Mark Duplicate", "Merge Evidence Family",
          "Retry", "Export Evidence Record", "View Source"].map((a) => (
          <Button key={a} size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => onAction(a, artifact)}>{a}</Button>
        ))}
      </div>
    </Drawer>
  );
}

/* ------------------------- throughput and queue panel ---------------------- */

export function ThroughputPanel({ metric, onMetric, range, onRange, degraded, spotlight }: {
  metric: ThroughputMetric; onMetric: (m: ThroughputMetric) => void;
  range: string; onRange: (r: string) => void; degraded: boolean; spotlight?: boolean;
}) {
  const { data, target, unit } = useMemo(() => throughputSeries(metric, range, degraded), [metric, range, degraded]);
  const last = data[data.length - 1];
  const summary = `${metric} over the ${range.toLowerCase()}. Latest received ${nf(last.received)}${unit}, registered ${nf(last.registered)}${unit}, queued for normalization ${nf(last.queued)}${unit}. Target ${nf(target)}${unit}.`;

  return (
    <Panel id="panel-throughput" title="Ingestion Throughput & Queue" subtitle={summary} spotlight={spotlight}>
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-1.5">
        {(["Throughput", "Queue Depth", "Processing Time", "Failure Rate"] as ThroughputMetric[]).map((m) => (
          <Button key={m} size="sm" variant={metric === m ? "default" : "outline"} className="h-6 text-[11px]" aria-pressed={metric === m} onClick={() => onMetric(m)}>{m}</Button>
        ))}
        <div className="ml-auto"><FilterSelect label="Range" value={range} onChange={onRange} options={["Last hour", "Last 6 hours", "Last 24 hours", "Last 7 days"]} /></div>
      </div>
      <div className="grid gap-3 p-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-64" role="img" aria-label={summary}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" width={52} />
              <RTooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={target} stroke="#dc2626" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, position: "right" }} />
              <Area type="monotone" dataKey="received" name="Artifacts received" stroke="#2563eb" fill="#bfdbfe" />
              <Area type="monotone" dataKey="registered" name="Artifacts registered" stroke="#059669" fill="#a7f3d0" />
              <Area type="monotone" dataKey="queued" name="Queued for normalization" stroke="#d97706" fill="#fde68a" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="h-64" role="img" aria-label={`Queue depth by stage. Highest is ${queueByStage.reduce((a, b) => (b.depth > a.depth ? b : a)).stage}.`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={queueByStage} layout="vertical" margin={{ top: 6, right: 12, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 9.5 }} stroke="#94a3b8" width={130} />
              <RTooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => [nf(v), "Queue depth"]} />
              <Bar dataKey="depth" fill="#2563eb" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------- composition panel ---------------------------- */

export function CompositionPanel({ onSegment }: { onSegment: (label: string, mode: "type" | "format") => void }) {
  const [mode, setMode] = useState<"type" | "format">("type");
  const data = mode === "type" ? artifactTypeComposition : formatComposition;
  const summary = `${mode === "type" ? "Artifact type" : "File format"} composition. ${data.map((d) => `${d.label} ${d.value} percent`).join(", ")}.`;

  return (
    <Panel id="panel-composition" title="Artifact Composition" subtitle="What kinds of organizational knowledge are entering the Fabric">
      <div className="flex gap-1.5 border-b border-slate-100 px-3 py-1.5">
        <Button size="sm" variant={mode === "type" ? "default" : "outline"} className="h-6 text-[11px]" aria-pressed={mode === "type"} onClick={() => setMode("type")}>Type</Button>
        <Button size="sm" variant={mode === "format" ? "default" : "outline"} className="h-6 text-[11px]" aria-pressed={mode === "format"} onClick={() => setMode("format")}>Format</Button>
      </div>
      <div className="grid gap-2 p-3 md:grid-cols-[1fr_1fr]">
        <div className="h-56" role="img" aria-label={summary}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="label" innerRadius={44} outerRadius={78} paddingAngle={1}
                onClick={(d: { label?: string }) => d.label && onSegment(d.label, mode)}>
                {data.map((d) => <Cell key={d.label} fill={d.color} className="cursor-pointer" />)}
              </Pie>
              <RTooltip contentStyle={{ fontSize: 11 }} formatter={(v: number, n: string) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="grid grid-cols-2 content-start gap-x-3 gap-y-0.5">
          {data.map((d) => (
            <li key={d.label}>
              <button type="button" onClick={() => onSegment(d.label, mode)}
                className="flex w-full items-center justify-between rounded px-1 py-0.5 text-[11.5px] hover:bg-slate-50">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="h-2 w-2 rounded-sm" style={{ background: d.color }} aria-hidden />{d.label}
                </span>
                <span className="font-medium text-slate-800">{d.value}%</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

/* ------------------------------ quality panel ------------------------------ */

export function QualityPanel({ onOpenDetail }: { onOpenDetail: (name: string) => void }) {
  return (
    <Panel id="panel-quality" title="Ingestion Quality" subtitle="Whether original evidence, metadata, permissions, versions, and duplicates were handled correctly">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11.5px]">
          <caption className="sr-only">Ingestion quality metrics against target</caption>
          <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500">
            <tr>{["Metric", "Current", "Target", "Variance", "Trend", "Affected Artifacts", "Status"].map((h) => (
              <th key={h} scope="col" className="px-2 py-1.5 font-medium">{h}</th>))}</tr>
          </thead>
          <tbody>
            {qualityMetrics.map((m) => {
              const variance = Number((m.current - m.target).toFixed(1));
              const max = Math.max(...m.trend); const min = Math.min(...m.trend);
              const pts = m.trend.map((v, i) => `${(i / (m.trend.length - 1)) * 100},${20 - ((v - min) / Math.max(0.001, max - min)) * 16}`).join(" ");
              return (
                <tr key={m.name} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50" onClick={() => onOpenDetail(m.name)}>
                  <td className="px-2 py-1.5">
                    <button type="button" className="text-left font-medium text-blue-700 hover:underline">{m.name}</button>
                  </td>
                  <td className="px-2 py-1.5 font-medium text-slate-800">{m.current}%</td>
                  <td className="px-2 py-1.5 text-slate-600">{m.target}%</td>
                  <td className={cn("px-2 py-1.5 font-medium", variance >= 0 ? "text-emerald-700" : "text-amber-700")}>{variance >= 0 ? "+" : ""}{variance}</td>
                  <td className="px-2 py-1.5">
                    <svg viewBox="0 0 100 22" className="h-5 w-24" preserveAspectRatio="none" aria-hidden>
                      <polyline points={pts} fill="none" stroke="#94a3b8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </td>
                  <td className="px-2 py-1.5 text-slate-600">{nf(m.affected)}</td>
                  <td className="px-2 py-1.5"><StatusText status={m.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function QualityDetailDrawer({ name, open, onOpenChange }: { name: string | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  if (!name) return null;
  const m = qualityMetrics.find((x) => x.name === name);
  const d = qualityDetail[name];
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={name} description={m ? `Current ${m.current}% against a target of ${m.target}%` : undefined}>
      <div className="grid grid-cols-3 gap-2">
        <Metric label="Current" value={`${m?.current ?? 0}%`} />
        <Metric label="Target" value={`${m?.target ?? 0}%`} />
        <Metric label="Affected artifacts" value={nf(m?.affected ?? 0)} tone="amber" />
      </div>
      <div className="rounded-lg border border-slate-200 p-2">
        <p className="mb-1 text-[11px] font-semibold text-slate-700">What is driving the result</p>
        <ul className="list-disc space-y-0.5 pl-4 text-[11.5px] text-slate-700">
          {(d?.drivers ?? ["Within the expected operating band. No material drivers recorded."]).map((x) => <li key={x}>{x}</li>)}
        </ul>
      </div>
      <div className="rounded-lg border border-slate-200 p-2">
        <p className="mb-1 text-[11px] font-semibold text-slate-700">Recommended remediation</p>
        <ul className="list-disc space-y-0.5 pl-4 text-[11.5px] text-slate-700">
          {(d?.remediation ?? ["No remediation required."]).map((x) => <li key={x}>{x}</li>)}
        </ul>
      </div>
    </Drawer>
  );
}

/* ---------------------------- provenance panel ----------------------------- */

export function ProvenancePanel({ spotlight }: { spotlight?: boolean }) {
  const [step, setStep] = useState(3);
  return (
    <Panel id="panel-provenance" title="Provenance & Chain of Custody" subtitle="Where every artifact came from and how its custody is proven" spotlight={spotlight}>
      <div className="grid gap-2 p-3 sm:grid-cols-3 xl:grid-cols-5">
        {provenanceMetrics.map((m) => (
          <Metric key={m.label} label={m.label} value={`${m.value}%`} tone={m.value >= 95 ? "green" : "amber"} />
        ))}
      </div>
      <div className="border-t border-slate-100 p-3">
        <p className="mb-2 text-[11px] font-semibold text-slate-700">Interactive lineage example</p>
        <ol className="flex flex-wrap items-stretch gap-1">
          {lineageChain.map((l, i) => (
            <li key={l.label} className="flex items-stretch">
              <button type="button" onClick={() => setStep(i)} aria-pressed={step === i}
                className={cn("rounded-lg border p-2 text-left transition-colors",
                  step === i ? "border-blue-500 bg-blue-50/60" : "border-slate-200 bg-white hover:bg-slate-50")}>
                <p className="text-[10px] uppercase tracking-wide text-slate-500">{l.label}</p>
                <p className="text-[11.5px] font-medium text-slate-800">{l.value}</p>
              </button>
              {i < lineageChain.length - 1 && <div className="flex items-center px-0.5" aria-hidden><ArrowRight className="h-3.5 w-3.5 text-slate-300" /></div>}
            </li>
          ))}
        </ol>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-700">{lineageChain[step].detail}</p>
          <dl className="rounded-lg border border-slate-200 p-2">
            <Row label="Source timestamp" value={lineageFacts.sourceTimestamp} />
            <Row label="Ingestion timestamp" value={lineageFacts.ingestionTimestamp} />
            <Row label="Content hash" value={lineageFacts.contentHash} />
            <Row label="Owner" value={lineageFacts.owner} />
            <Row label="Access classification" value={<StatusText status={lineageFacts.accessClassification} />} />
            <Row label="Version" value={lineageFacts.version} />
            <Row label="Status" value={lineageFacts.status} />
          </dl>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------- duplicate & version panel ----------------------- */

export function DuplicatePanel({ decisions, onDecision, spotlight, highlight }: {
  decisions: Record<string, string>; onDecision: (id: string, action: string) => void;
  spotlight?: boolean; highlight: string[];
}) {
  return (
    <Panel id="panel-duplicates" title="Duplicate & Version Detection"
      subtitle="Is this information new, revised, duplicated, conflicting, or historical" spotlight={spotlight}>
      <div className="grid gap-2 p-3 sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="Unique artifacts" value={duplicateSummary.uniqueLabel} tone="green" />
        <Metric label="New versions" value={duplicateSummary.newVersionsLabel} tone="blue" />
        <Metric label="Exact duplicates" value={duplicateSummary.exactDuplicatesLabel} tone="slate" />
        <Metric label="Possible semantic duplicates" value={nf(duplicateSummary.semanticDuplicates)} tone="amber" />
        <Metric label="Conflicting versions" value={nf(duplicateSummary.conflictingVersions)} tone="red" />
        <Metric label="Review required" value={nf(duplicateSummary.reviewRequired)} tone="amber" />
      </div>
      <div className="overflow-x-auto border-t border-slate-100">
        <table className="w-full text-left text-[11.5px]">
          <caption className="sr-only">Duplicate and version candidates awaiting review</caption>
          <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500">
            <tr>{["Artifact", "Candidate", "Similarity", "Relationship", "Authority", "Owner", "Status", "Recommended Action", "Decision"].map((h) => (
              <th key={h} scope="col" className="px-2 py-1.5 font-medium">{h}</th>))}</tr>
          </thead>
          <tbody>
            {duplicateCandidates.map((d) => (
              <tr key={d.id} className={cn("border-t border-slate-100", highlight.includes(d.artifactId) && "bg-blue-50/60")}>
                <td className="px-2 py-1.5 text-slate-700">{d.artifactTitle}</td>
                <td className="px-2 py-1.5 text-slate-700">{d.candidateTitle}</td>
                <td className="px-2 py-1.5 font-medium text-slate-800">{d.semanticSimilarity}%</td>
                <td className="px-2 py-1.5 text-slate-700">{d.relationshipType}{d.authorityConflict && <span className="ml-1 text-red-700">· authority conflict</span>}</td>
                <td className="px-2 py-1.5 text-slate-700">{d.authority}</td>
                <td className="px-2 py-1.5 text-slate-700">{d.owner}</td>
                <td className="px-2 py-1.5"><StatusText status={decisions[d.id] ?? d.reviewStatus} /></td>
                <td className="px-2 py-1.5 text-slate-600">{d.recommendedAction}</td>
                <td className="px-2 py-1.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-6 text-[11px]">Resolve</Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {["Confirm Version", "Mark Duplicate", "Mark Related", "Keep Both", "Merge Family", "Request Review"].map((a) => (
                        <DropdownMenuItem key={a} className="text-[11.5px]" onSelect={() => onDecision(d.id, a)}>{a}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------- access & classification ------------------------- */

export function AccessPanel({ onReviewAction, reviewStates, spotlight }: {
  onReviewAction: (artifactId: string, action: string) => void;
  reviewStates: Record<string, string>; spotlight?: boolean;
}) {
  const summary = `Access classification distribution. ${accessDistribution.map((d) => `${d.label} ${d.value} percent`).join(", ")}.`;
  return (
    <Panel id="panel-access" title="Access & Classification"
      subtitle="Source permissions and security classification travel with every artifact" spotlight={spotlight}>
      <div className="grid gap-3 p-3 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <div className="h-44" role="img" aria-label={summary}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accessDistribution} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 9.5 }} stroke="#94a3b8" interval={0} angle={-12} height={34} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" width={30} />
                <RTooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => [`${v}%`, "Share"]} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {accessDistribution.map((d) => <Cell key={d.label} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Metric label="Permissions preserved" value={`${accessSummary.permissionsPreserved}%`} tone="amber" />
            <Metric label="Permission reviews pending" value={nf(accessSummary.permissionReviewsPending)} tone="amber" />
            <Metric label="Permission conflicts" value={nf(accessSummary.permissionConflicts)} tone="red" />
            <Metric label="Restricted quarantined" value={nf(accessSummary.restrictedQuarantined)} tone="red" />
            <Metric label="Classification missing" value={nf(accessSummary.classificationMissing)} tone="amber" />
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11.5px]">
            <caption className="sr-only">Permission reviews awaiting validation</caption>
            <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500">
              <tr>{["Artifact", "Source", "Expected Access", "Observed Access", "Conflict", "Owner", "Action"].map((h) => (
                <th key={h} scope="col" className="px-2 py-1.5 font-medium">{h}</th>))}</tr>
            </thead>
            <tbody>
              {permissionReviews.map((r) => (
                <tr key={r.artifactId} className="border-t border-slate-100">
                  <td className="px-2 py-1.5 text-slate-700">{r.artifact}</td>
                  <td className="px-2 py-1.5 text-slate-700">{r.source}</td>
                  <td className="px-2 py-1.5 text-slate-600">{r.expected}</td>
                  <td className="px-2 py-1.5 text-slate-600">{r.observed}</td>
                  <td className="px-2 py-1.5"><StatusText status={reviewStates[r.artifactId] ?? r.conflict} /></td>
                  <td className="px-2 py-1.5 text-slate-700">{r.owner}</td>
                  <td className="px-2 py-1.5">
                    <Button size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => onReviewAction(r.artifactId, r.action)}>{r.action}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}

/* --------------------------- exceptions & quarantine ----------------------- */

export function ExceptionPanel({ exceptions, onAction, spotlight, onCategory, activeCategory }: {
  exceptions: IngestionException[]; onAction: (e: IngestionException, action: string) => void;
  spotlight?: boolean; onCategory: (c: string) => void; activeCategory: string;
}) {
  return (
    <Panel id="panel-exceptions" title="Exception & Quarantine Queue"
      subtitle="Unreliable artifacts are stopped before they can influence personas, memory, or decisions" spotlight={spotlight}>
      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 p-3">
        {exceptionCategories.map((c) => (
          <button key={c.type} type="button" onClick={() => onCategory(activeCategory === c.type ? "All" : c.type)}
            aria-pressed={activeCategory === c.type}
            className={cn("rounded-lg border px-2 py-1 text-left transition-colors",
              activeCategory === c.type ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50")}>
            <span className="block text-[10.5px] text-slate-600">{c.type}</span>
            <span className="flex items-center gap-1.5">
              <span className="text-[15px] font-semibold text-slate-900">{nf(c.count)}</span>
              <Pill label={c.severity} tone={ingestTone(c.severity)} />
            </span>
          </button>
        ))}
      </div>
      {exceptions.length === 0 ? (
        <EmptyState title="No exceptions in the current scope" detail="Every artifact in this scope passed authentication, preservation, validation, and classification checks." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11.5px]">
            <caption className="sr-only">Exception and quarantine queue</caption>
            <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500">
              <tr>{["Artifact", "Exception Type", "Severity", "Source", "Team", "Owner", "Age", "Downstream Impact", "Status", "Recommended Action", "Actions"].map((h) => (
                <th key={h} scope="col" className="px-2 py-1.5 font-medium">{h}</th>))}</tr>
            </thead>
            <tbody>
              {exceptions.map((e) => (
                <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-2 py-1.5 text-slate-700">{e.artifactTitle}</td>
                  <td className="px-2 py-1.5 text-slate-700">{e.exceptionType}</td>
                  <td className="px-2 py-1.5"><StatusText status={e.severity} /></td>
                  <td className="px-2 py-1.5 text-slate-700">{e.sourceName}</td>
                  <td className="px-2 py-1.5 text-slate-700">{e.teamName}</td>
                  <td className="px-2 py-1.5 text-slate-700">{e.owner}</td>
                  <td className="px-2 py-1.5 text-slate-600">{e.age}</td>
                  <td className="max-w-[20rem] px-2 py-1.5 text-slate-600">{e.downstreamImpact}</td>
                  <td className="px-2 py-1.5"><StatusText status={e.status} /></td>
                  <td className="max-w-[20rem] px-2 py-1.5 text-slate-600">{e.recommendedAction}</td>
                  <td className="px-2 py-1.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-6 text-[11px]">Act</Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="max-h-72 overflow-auto">
                        {["Assign", "Acknowledge", "Open Artifact", "Retry", "Request Augmentation", "Correct Metadata",
                          "Apply Classification", "Validate Permission", "Release from Quarantine", "Reject",
                          "Create Review Task", "Create Incident"].map((a) => (
                          <DropdownMenuItem key={a} className="text-[11.5px]" onSelect={() => onAction(e, a)}>{a}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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

/* ---------------------------- readiness panel ------------------------------ */

export function ReadinessPanel({ readiness, onProceed, onFocus, spotlight }: {
  readiness: NormalizationReadiness; onProceed: () => void; onFocus: (panel: string) => void; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-readiness" title="Normalization Readiness" subtitle="What can move to the next stage, and what is holding the rest back" spotlight={spotlight}>
      <div className="grid gap-3 p-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-2 sm:grid-cols-3">
          <button type="button" onClick={() => onFocus("panel-queue")} className="text-left"><Metric label="Ready for normalization" value={compact(readiness.readyCount)} tone="green" sub="91% of received artifacts" /></button>
          <button type="button" onClick={() => onFocus("panel-exceptions")} className="text-left"><Metric label="Awaiting human review" value={nf(readiness.humanReviewCount)} tone="amber" /></button>
          <button type="button" onClick={() => onFocus("panel-access")} className="text-left"><Metric label="Blocked by permissions" value={nf(readiness.permissionBlockedCount)} tone="amber" /></button>
          <button type="button" onClick={() => onFocus("panel-exceptions")} className="text-left"><Metric label="Quarantined" value={nf(readiness.quarantinedCount)} tone="red" /></button>
          <button type="button" onClick={() => onFocus("panel-exceptions")} className="text-left"><Metric label="Unsupported or corrupted" value={nf(readiness.unsupportedCount)} tone="red" /></button>
          <button type="button" onClick={() => onFocus("panel-duplicates")} className="text-left"><Metric label="Duplicate review" value={nf(readiness.duplicateReviewCount)} tone="amber" /></button>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
          <p className="text-[10.5px] uppercase tracking-wide text-blue-700">Next stage</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[15px] font-semibold text-slate-900">
            <GitBranch className="h-4 w-4 text-blue-700" aria-hidden />Artifact Normalization
          </p>
          <p className="mt-1 text-[11.5px] text-slate-700">
            Convert approved artifacts into consistent machine-readable structures while preserving original evidence,
            metadata, permissions, and lineage.
          </p>
          <Button size="sm" className="mt-2 h-7 text-[11.5px]" onClick={onProceed}>
            Proceed to Artifact Normalization<ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      </div>
      <div className="border-t border-slate-100 px-3 py-2">
        <p className="mb-1 text-[11px] text-slate-500">Readiness share</p>
        <Progress value={91} aria-label="91 percent of artifacts are ready for normalization" className="h-2" />
      </div>
    </Panel>
  );
}

/* ------------------------------ activity panel ----------------------------- */

export function ActivityPanel({ activity, onOpen }: { activity: IngestionActivity[]; onOpen: (a: IngestionActivity) => void }) {
  return (
    <Panel id="panel-activity" title="Recent Ingestion Activity" subtitle="Audited record of every intake event">
      <ul className="divide-y divide-slate-100">
        {activity.slice(0, 10).map((a) => (
          <li key={a.id}>
            <button type="button" onClick={() => onOpen(a)} className="flex w-full items-start gap-2 px-3 py-1.5 text-left hover:bg-slate-50">
              <span className="w-16 shrink-0 text-[11px] text-slate-500">{a.timestamp}</span>
              <span className="flex-1">
                <span className="block text-[11.5px] text-slate-800">{a.description}</span>
                <span className="block text-[10.5px] text-slate-500">
                  {a.sourceName} · {a.teamName} · {a.batchId ?? a.artifactId} · audit {a.auditId} · owner {a.owner}
                </span>
              </span>
              <StatusText status={a.result} />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------------ evidence panel ----------------------------- */

export function EvidencePanel() {
  return (
    <Panel id="panel-evidence" title="Evidence Vault Registrations" subtitle="Immutable evidence identifiers, hashes, and vault locations">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11.5px]">
          <caption className="sr-only">Evidence vault registrations</caption>
          <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500">
            <tr>{["Evidence ID", "Artifact", "Source Identifier", "Content Hash", "Version", "Owner", "Access", "Received", "Vault Location"].map((h) => (
              <th key={h} scope="col" className="px-2 py-1.5 font-medium">{h}</th>))}</tr>
          </thead>
          <tbody>
            {evidenceRecords.slice(0, 8).map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="px-2 py-1.5 font-medium text-slate-800">{e.immutableEvidenceId}</td>
                <td className="px-2 py-1.5 text-slate-700">{e.artifactId}</td>
                <td className="max-w-[18rem] truncate px-2 py-1.5 text-slate-600" title={e.sourceIdentifier}>{e.sourceIdentifier}</td>
                <td className="px-2 py-1.5 text-slate-600">{e.contentHash}</td>
                <td className="px-2 py-1.5 text-slate-700">{e.version}</td>
                <td className="px-2 py-1.5 text-slate-700">{e.owner}</td>
                <td className="px-2 py-1.5"><StatusText status={e.accessClassification} /></td>
                <td className="px-2 py-1.5 text-slate-600">{e.receivedAt}</td>
                <td className="px-2 py-1.5 text-slate-600">{e.evidenceVaultLocation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---------------------------- downstream impact ---------------------------- */

export function DownstreamImpactPanel() {
  const rows = [
    { area: "Artifact Normalization", state: "Delayed", detail: "8,412 API definitions cannot be normalized while the Apigee source is blocked." },
    { area: "Business Condition Extraction", state: "Warning", detail: "418 permission reviews hold reliability evidence out of extraction." },
    { area: "Team Personas", state: "Warning", detail: "Reliability and Identity personas are operating on evidence older than 24 hours." },
    { area: "Cognitive Memory", state: "Healthy", detail: "Memory retains prior evidence versions. No loss of continuity." },
    { area: "Impact Analysis", state: "Warning", detail: "2 impact evaluations reference evidence that is pending revalidation." },
  ];
  return (
    <Panel id="panel-downstream" title="Downstream Impact of Ingestion Failures" subtitle="What is delayed when artifacts cannot enter the Fabric">
      <ul className="divide-y divide-slate-100">
        {rows.map((r) => (
          <li key={r.area} className="flex items-start gap-2 px-3 py-1.5">
            <FileWarning className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <span className="flex-1">
              <span className="block text-[11.5px] font-medium text-slate-800">{r.area}</span>
              <span className="block text-[11px] text-slate-600">{r.detail}</span>
            </span>
            <StatusText status={r.state} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
