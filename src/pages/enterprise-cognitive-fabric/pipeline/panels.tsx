import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ReferenceLine, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowRight, ChevronRight, CircleCheck, CirclePause, CircleSlash, Clock, Database, FileText,
  GitBranch, Layers, MoreHorizontal, Pause, Play, RefreshCw, Search, ShieldCheck, Sparkles,
  TriangleAlert, Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Panel } from "../command-center/panels";
import {
  composition as seedComposition, failureSeries, processingTimeSeries, queueForStage,
  stageConfiguration, stageDependencies, stageErrors, stageOutputs, stageName, timelineForRun,
  type ArtifactComposition, type PipelineActivity, type PipelineAlert, type PipelineRun,
  type PipelineStage, type QualityMetric, type StageId,
} from "./data";

/* --------------------------------- atoms ---------------------------------- */

type Tone = "green" | "amber" | "red" | "blue" | "slate";

export function Pill({ label, tone }: { label: string; tone: Tone }) {
  const map: Record<Tone, string> = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10.5px] font-medium", map[tone])}>{label}</span>;
}

export const toneFor = (status: string): Tone => {
  if (["Running", "Complete", "Completed", "Healthy", "Within SLA", "On target", "Resolved"].includes(status)) return "green";
  if (["Warning", "At risk", "Investigating", "Acknowledged", "Below target", "Processing", "Queued", "Medium"].includes(status)) return "amber";
  if (["Blocked", "Failed", "Breached", "Critical", "High", "Open"].includes(status)) return "red";
  if (["Paused", "Idle", "Snoozed", "Low", "Info"].includes(status)) return "slate";
  return "blue";
};

export const severityTone = (s: string): Tone =>
  s === "Critical" || s === "High" ? "red" : s === "Medium" ? "amber" : "slate";

export function StatusIcon({ status, className }: { status: string; className?: string }) {
  const c = cn("h-3.5 w-3.5", className);
  if (status === "Paused") return <CirclePause className={cn(c, "text-slate-500")} aria-hidden />;
  if (status === "Blocked" || status === "Failed") return <CircleSlash className={cn(c, "text-red-600")} aria-hidden />;
  if (status === "Warning") return <TriangleAlert className={cn(c, "text-amber-600")} aria-hidden />;
  return <CircleCheck className={cn(c, "text-emerald-600")} aria-hidden />;
}

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-1 last:border-0">
      <dt className="text-[11px] text-slate-500">{label}</dt>
      <dd className="text-right text-[11.5px] font-medium text-slate-800">{value}</dd>
    </div>
  );
}

export function Drawer({ open, onOpenChange, title, description, children, wide }: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string;
  description?: string; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn("w-full overflow-y-auto", wide ? "sm:max-w-3xl" : "sm:max-w-xl")}>
        <SheetHeader>
          <SheetTitle className="text-[15px]">{title}</SheetTitle>
          {description && <SheetDescription className="text-[12px]">{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-3 space-y-3">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

const nf = (n: number) => n.toLocaleString("en-US");
const compact = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${Math.round(n / 1_000)}K` : String(n));

/* --------------------------- lifecycle visualization ---------------------- */

const STAGE_ICONS: Record<StageId, typeof Database> = {
  discover: Search, ingest: Database, parse: FileText, normalize: Layers,
  extract: Sparkles, validate: ShieldCheck, publish: Workflow,
};

export function LifecyclePanel({
  stages, selectedId, onSelect, loading, degraded, spotlight, reducedMotion,
  filterMode, onFilterMode, callouts, architecture,
}: {
  stages: PipelineStage[];
  selectedId: StageId;
  onSelect: (id: StageId) => void;
  loading?: boolean;
  degraded?: string | null;
  spotlight?: boolean;
  reducedMotion: boolean;
  filterMode: "all" | "degraded" | "bottlenecks";
  onFilterMode: (m: "all" | "degraded" | "bottlenecks") => void;
  callouts: { tone: "amber" | "green"; text: string }[];
  architecture?: boolean;
}) {
  const [fit, setFit] = useState(true);
  const visible = useMemo(() => {
    if (filterMode === "degraded") return stages.filter((s) => s.status !== "Running");
    if (filterMode === "bottlenecks") return [...stages].sort((a, b) => b.pendingCount - a.pendingCount).slice(0, 3).sort((a, b) => a.sequence - b.sequence);
    return stages;
  }, [stages, filterMode]);

  const textSummary = stages
    .map((s) => `${s.name}: ${s.status}, ${compact(s.pendingCount)} pending, ${s.successRate}% success, ${s.throughput}`)
    .join(". ");

  return (
    <Panel
      id="panel-lifecycle" title="Discovery Pipeline Lifecycle"
      subtitle="Discover, ingest, parse, normalize, extract, validate, and publish"
      loading={loading} degraded={degraded} spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap gap-1.5">
          {([["all", "All stages"], ["degraded", "Show only degraded"], ["bottlenecks", "Focus bottlenecks"]] as const).map(([m, label]) => (
            <button
              key={m} type="button" onClick={() => onFilterMode(m)} aria-pressed={filterMode === m}
              className={cn(
                "rounded-md border px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                filterMode === m ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setFit((v) => !v)}>{fit ? "Expand view" : "Zoom to fit"}</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setFit(true); onFilterMode("all"); }}>Reset view</Button>
        </div>
      </div>

      <p className="sr-only">{textSummary}</p>

      <div className={cn("overflow-x-auto pb-1", fit ? "" : "")}>
        <ol className={cn("flex items-stretch gap-1.5", fit ? "min-w-[900px]" : "min-w-[1400px]")}>
          {visible.map((s, i) => {
            const Icon = STAGE_ICONS[s.id];
            const selected = s.id === selectedId;
            return (
              <li key={s.id} className="flex flex-1 items-stretch gap-1.5">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button" onClick={() => onSelect(s.id)} aria-pressed={selected}
                        aria-label={`${s.name} stage, ${s.status}, ${compact(s.pendingCount)} pending`}
                        className={cn(
                          "flex-1 rounded-lg border bg-white p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                          selected ? "border-blue-400 ring-1 ring-blue-300" : "border-slate-200 hover:border-blue-300",
                          s.status === "Warning" && !selected && "border-amber-200",
                          s.status === "Blocked" && !selected && "border-red-200",
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "grid h-6 w-6 place-items-center rounded-md",
                            s.status === "Blocked" ? "bg-red-50 text-red-600" : s.status === "Warning" ? "bg-amber-50 text-amber-600" : s.status === "Paused" ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-600",
                          )}>
                            <Icon className="h-3.5 w-3.5" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-900">{s.sequence}. {s.name}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <StatusIcon status={s.status} />
                          <span className="text-[10.5px] text-slate-600">{s.status}</span>
                        </div>
                        <dl className="mt-1 space-y-0.5 text-[10.5px] text-slate-600">
                          <div className="flex justify-between"><dt>Processed</dt><dd className="font-medium text-slate-800">{s.processedLabel}</dd></div>
                          <div className="flex justify-between"><dt>Pending</dt><dd className="font-medium text-slate-800">{compact(s.pendingCount)}</dd></div>
                          <div className="flex justify-between"><dt>Success</dt><dd className="font-medium text-slate-800">{s.successRate}%</dd></div>
                          <div className="flex justify-between"><dt>Avg</dt><dd>{s.averageDuration}</dd></div>
                          <div className="flex justify-between"><dt>P95</dt><dd>{s.p95Duration}</dd></div>
                          <div className="flex justify-between"><dt>Throughput</dt><dd>{s.throughput}</dd></div>
                        </dl>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          {s.warningCount > 0 && <Pill label={`${s.warningCount} warn`} tone="amber" />}
                          {s.failedCount > 0 && <Pill label={`${s.failedCount} fail`} tone="red" />}
                          <Pill label={s.slaStatus} tone={toneFor(s.slaStatus)} />
                        </div>
                        <div className="mt-1 h-6">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={s.trend.map((v, k) => ({ k, v }))}>
                              <Area type="monotone" dataKey="v" stroke="#2563eb" fill="#dbeafe" strokeWidth={1.5} isAnimationActive={!reducedMotion} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        {architecture && (
                          <p className="mt-1 truncate text-[10px] text-slate-500">{stageDependencies[s.id].storage[0]}</p>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[260px] text-[11px]">
                      <p className="font-medium">{s.name}</p>
                      <p className="mt-0.5">{s.description}</p>
                      <p className="mt-1">Upstream: {s.upstreamStageId ? stageName(s.upstreamStageId) : "Source registry"}</p>
                      <p>Downstream: {s.downstreamStageId ? stageName(s.downstreamStageId) : "Cognitive Memory"}</p>
                      <p>Queue: {nf(s.pendingCount)} · Status: {s.status}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {i < visible.length - 1 && (
                  <div className="flex w-6 shrink-0 flex-col items-center justify-center" aria-hidden>
                    <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-200">
                      {!reducedMotion && s.status !== "Paused" && (
                        <span className="absolute inset-y-0 left-0 w-1/3 animate-[shimmer_1.8s_linear_infinite] rounded-full bg-blue-400" />
                      )}
                    </div>
                    <ArrowRight className="mt-1 h-3.5 w-3.5 text-slate-400" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {callouts.map((c) => (
          <span key={c.text} className={cn(
            "rounded-md border px-2 py-1 text-[11px]",
            c.tone === "amber" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800",
          )}>
            {c.text}
          </span>
        ))}
      </div>
    </Panel>
  );
}

/* --------------------------- selected stage detail ------------------------ */

export function StageDetailPanel({ stage, onAction, loading, spotlight, downstreamStages }: {
  stage: PipelineStage;
  onAction: (action: string, stage: PipelineStage) => void;
  loading?: boolean;
  spotlight?: boolean;
  downstreamStages: PipelineStage[];
}) {
  const queue = useMemo(() => queueForStage(stage.id), [stage.id]);
  const errors = stageErrors[stage.id];

  const ACTIONS = [
    stage.status === "Paused" ? "Resume Stage" : "Pause Stage",
    "Retry Failures", "Drain Queue", "Reprocess Selected", "View Logs", "Edit Configuration", "Create Incident",
  ];

  return (
    <Panel
      id="panel-stage" title="Selected Stage Detail"
      subtitle={`${stage.name} · ${stage.status} · owner ${stage.owner}`}
      loading={loading} spotlight={spotlight}
    >
      <div className="grid gap-x-6 sm:grid-cols-2">
        <div>
          <Row label="Status" value={<span className="inline-flex items-center gap-1"><StatusIcon status={stage.status} />{stage.status}</span>} />
          <Row label="Current queue" value={nf(stage.pendingCount)} />
          <Row label="Completed this hour" value={nf(Math.round(stage.processedCount / 240))} />
          <Row label="Failed this hour" value={nf(stage.failedCount * 214)} />
          <Row label="Average duration" value={stage.averageDuration} />
          <Row label="P95 duration" value={stage.p95Duration} />
          <Row label="Success rate" value={`${stage.successRate}%`} />
        </div>
        <div>
          <Row label="Throughput" value={stage.throughput} />
          <Row label="SLA status" value={<Pill label={stage.slaStatus} tone={toneFor(stage.slaStatus)} />} />
          <Row label="Primary owner" value={stage.owner} />
          <Row label="Upstream stage" value={stage.upstreamStageId ? stageName(stage.upstreamStageId) : "Source registry"} />
          <Row label="Downstream stage" value={stage.downstreamStageId ? stageName(stage.downstreamStageId) : "Cognitive Memory"} />
          <Row label="Configuration version" value={stage.configurationVersion} />
          <Row label="Last deployment / incident" value={`${stage.lastDeployment} · ${stage.lastIncident}`} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-3">
        <TabsList className="h-8">
          {["overview", "queue", "errors", "outputs", "dependencies", "configuration"].map((t) => (
            <TabsTrigger key={t} value={t} className="h-6 text-[11px] capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-2 space-y-2">
          <p className="text-[12px] text-slate-600">{stage.description}</p>
          <div className="grid gap-x-6 sm:grid-cols-2">
            <div>
              <Row label="Current activity" value={`${stage.throughput} sustained`} />
              <Row label="Artifact types" value="Documents, Tickets, Chat, Transcripts" />
              <Row label="Quality score" value={`${(stage.successRate - 1.2).toFixed(1)}%`} />
            </div>
            <div>
              <Row label="Source distribution" value="Confluence 34% · Slack 27% · Jira 18%" />
              <Row label="Recent warnings" value={String(stage.warningCount)} />
              <Row label="Current bottleneck" value={stage.pendingCount > 40_000 ? "Queue depth above target" : "None detected"} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="queue" className="mt-2">
          <div className="max-h-[240px] overflow-auto">
            <table className="w-full min-w-[720px] text-left">
              <caption className="sr-only">Queued artifacts for {stage.name}</caption>
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-wide text-slate-500">
                  {["Artifact ID", "Source", "Type", "Priority", "Queue age", "Classification", "Attempts", "Status"].map((h) => (
                    <th key={h} scope="col" className="py-1 pr-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queue.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 text-[11.5px] text-slate-700">
                    <td className="py-1 pr-3 font-medium text-slate-900">{a.id}</td>
                    <td className="py-1 pr-3">{a.runId}</td>
                    <td className="py-1 pr-3">{a.artifactType}</td>
                    <td className="py-1 pr-3">{a.priority}</td>
                    <td className="py-1 pr-3">{a.queueAge}</td>
                    <td className="py-1 pr-3">{a.accessClassification}</td>
                    <td className="py-1 pr-3">{a.attemptCount}</td>
                    <td className="py-1 pr-3"><Pill label={a.status} tone={toneFor(a.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="mt-2">
          <table className="w-full min-w-[680px] text-left">
            <caption className="sr-only">Errors for {stage.name}</caption>
            <thead>
              <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-wide text-slate-500">
                {["Code", "Description", "Artifacts", "Source", "First seen", "Last seen", "Severity", "Retryable"].map((h) => (
                  <th key={h} scope="col" className="py-1 pr-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {errors.map((e) => (
                <tr key={e.code} className="border-b border-slate-100 text-[11.5px] text-slate-700">
                  <td className="py-1 pr-3 font-medium text-slate-900">{e.code}</td>
                  <td className="py-1 pr-3">{e.description}</td>
                  <td className="py-1 pr-3">{nf(e.artifactCount)}</td>
                  <td className="py-1 pr-3">{e.source}</td>
                  <td className="py-1 pr-3">{e.firstSeen}</td>
                  <td className="py-1 pr-3">{e.lastSeen}</td>
                  <td className="py-1 pr-3"><Pill label={e.severity} tone={severityTone(e.severity)} /></td>
                  <td className="py-1 pr-3">{e.retryable ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="outputs" className="mt-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            {stageOutputs[stage.id].map((o) => <Row key={o.label} label={o.label} value={o.value} />)}
          </dl>
        </TabsContent>

        <TabsContent value="dependencies" className="mt-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Row label="Upstream services" value={stageDependencies[stage.id].upstream.join(", ")} />
            <Row label="Downstream services" value={stageDependencies[stage.id].downstream.join(", ")} />
            <Row label="Storage destinations" value={stageDependencies[stage.id].storage.join(", ")} />
            <Row label="Event topics" value={stageDependencies[stage.id].topics.join(", ")} />
            <Row label="Publishing consumers" value={stageDependencies[stage.id].consumers.join(", ")} />
            <Row label="Downstream stages" value={downstreamStages.map((s) => s.name).join(" → ") || "None"} />
          </dl>
        </TabsContent>

        <TabsContent value="configuration" className="mt-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            {stageConfiguration[stage.id].map((c) => <Row key={c.label} label={c.label} value={c.value} />)}
          </dl>
        </TabsContent>
      </Tabs>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {ACTIONS.map((a) => (
          <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, stage)}>
            {a === "Pause Stage" ? <><Pause className="mr-1 h-3 w-3" aria-hidden />{a}</> : a === "Resume Stage" ? <><Play className="mr-1 h-3 w-3" aria-hidden />{a}</> : a === "Retry Failures" ? <><RefreshCw className="mr-1 h-3 w-3" aria-hidden />{a}</> : a}
          </Button>
        ))}
      </div>
    </Panel>
  );
}

/* ----------------------------- active run table --------------------------- */

const RUN_COLUMNS = [
  "Pipeline Run ID", "Source", "Category", "Current Stage", "Status", "Artifacts",
  "Started", "Elapsed Time", "Success Rate", "Owner", "Queue", "Warnings",
] as const;
type RunColumn = (typeof RUN_COLUMNS)[number];
const DEFAULT_RUN_COLUMNS: RunColumn[] = ["Pipeline Run ID", "Source", "Category", "Current Stage", "Status", "Artifacts", "Elapsed Time", "Success Rate", "Owner", "Queue", "Warnings"];

export function runsToCsv(rows: PipelineRun[]) {
  return [
    "Run ID,Source,Category,Current Stage,Status,Artifacts,Started,Elapsed,Success Rate,Owner,Queue,Warnings",
    ...rows.map((r) => [r.id, r.sourceName, r.sourceCategory, stageName(r.currentStageId), r.status, r.artifactCount, r.startedAt, r.elapsedTime, `${r.successRate}%`, r.owner, r.queueDepth, r.warningCount].join(",")),
  ].join("\n");
}

export function download(name: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export function ActiveRunsPanel({
  runs, onOpenRun, onRunAction, loading, degraded, spotlight, operations,
  categoryFilter, onCategoryFilter, statusFilter, onStatusFilter, stageFilter, onStageFilter,
  ownerFilter, onOwnerFilter, stages, empty,
}: {
  runs: PipelineRun[];
  onOpenRun: (r: PipelineRun) => void;
  onRunAction: (action: string, r: PipelineRun) => void;
  loading?: boolean; degraded?: string | null; spotlight?: boolean; operations?: boolean;
  categoryFilter: string; onCategoryFilter: (v: string) => void;
  statusFilter: string; onStatusFilter: (v: string) => void;
  stageFilter: string; onStageFilter: (v: string) => void;
  ownerFilter: string; onOwnerFilter: (v: string) => void;
  stages: PipelineStage[];
  empty?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: RunColumn; dir: 1 | -1 }>({ key: "Pipeline Run ID", dir: -1 });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [dense, setDense] = useState(true);
  const [columns, setColumns] = useState<RunColumn[]>(operations ? [...RUN_COLUMNS] : DEFAULT_RUN_COLUMNS);
  const [selected, setSelected] = useState<string[]>([]);

  const value = (r: PipelineRun, c: RunColumn): string | number => {
    switch (c) {
      case "Pipeline Run ID": return r.id;
      case "Source": return r.sourceName;
      case "Category": return r.sourceCategory;
      case "Current Stage": return stageName(r.currentStageId);
      case "Status": return r.status;
      case "Artifacts": return r.artifactCount;
      case "Started": return r.startedAt;
      case "Elapsed Time": return r.elapsedTime;
      case "Success Rate": return r.successRate;
      case "Owner": return r.owner;
      case "Queue": return r.queueDepth;
      case "Warnings": return r.warningCount;
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = runs.filter((r) =>
      (!q || `${r.id} ${r.sourceName} ${r.sourceCategory} ${r.owner} ${stageName(r.currentStageId)}`.toLowerCase().includes(q)) &&
      (categoryFilter === "All" || r.sourceCategory === categoryFilter) &&
      (statusFilter === "All" || r.status === statusFilter) &&
      (stageFilter === "All" || stageName(r.currentStageId) === stageFilter) &&
      (ownerFilter === "All" || r.owner === ownerFilter),
    );
    return [...rows].sort((a, b) => {
      const av = value(a, sort.key); const bv = value(b, sort.key);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.dir;
      return String(av).localeCompare(String(bv)) * sort.dir;
    });
  }, [runs, query, categoryFilter, statusFilter, stageFilter, ownerFilter, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((Math.min(page, pages) - 1) * perPage, Math.min(page, pages) * perPage);
  const allSelected = pageRows.length > 0 && pageRows.every((r) => selected.includes(r.id));

  const selectOptions = (label: string, value: string, onChange: (v: string) => void, options: string[]) => (
    <label className="flex items-center gap-1 text-[11px] text-slate-600">
      <span>{label}</span>
      <select
        value={value} onChange={(e) => { onChange(e.target.value); setPage(1); }}
        className="h-7 rounded border border-slate-200 bg-white px-1.5 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={label}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );

  return (
    <Panel
      id="panel-runs" title="Active Pipeline Runs"
      subtitle={`${filtered.length} of ${runs.length} runs`}
      loading={loading} degraded={degraded} spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input
            value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search runs…" aria-label="Search runs"
            className="h-7 w-[190px] pl-7 text-[11.5px]"
          />
        </div>
        {selectOptions("Category", categoryFilter, onCategoryFilter, ["All", "Documents", "Tickets", "Chat", "Meetings", "Code", "APIs", "Telemetry"])}
        {selectOptions("Stage", stageFilter, onStageFilter, ["All", ...stages.map((s) => s.name)])}
        {selectOptions("Status", statusFilter, onStatusFilter, ["All", "Running", "Warning", "Blocked", "Paused"])}
        {selectOptions("Owner", ownerFilter, onOwnerFilter, ["All", ...Array.from(new Set(runs.map((r) => r.owner)))])}

        <div className="ml-auto flex items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setDense((d) => !d)}>{dense ? "Comfortable" : "Compact"}</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-[11px]">Columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-[11px]">Visible columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {RUN_COLUMNS.map((c) => (
                <DropdownMenuItem key={c} onSelect={(e) => { e.preventDefault(); setColumns((cur) => cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]); }}>
                  <Checkbox checked={columns.includes(c)} className="mr-2 h-3.5 w-3.5" aria-label={c} />
                  <span className="text-[11.5px]">{c}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { download("pipeline-runs.csv", runsToCsv(filtered)); toast.success("Runs exported"); }}>Export</Button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5 text-[11.5px] text-blue-800">
          <span>{selected.length} selected</span>
          {["Pause", "Resume", "Retry Failed", "Export Selected"].map((a) => (
            <Button
              key={a} size="sm" variant="outline" className="h-6 text-[11px]"
              onClick={() => {
                if (a === "Export Selected") { download("pipeline-runs-selected.csv", runsToCsv(filtered.filter((r) => selected.includes(r.id)))); toast.success("Selected runs exported"); return; }
                filtered.filter((r) => selected.includes(r.id)).forEach((r) => onRunAction(a === "Pause" ? "Pause Run" : a === "Resume" ? "Resume Run" : "Retry Failed", r));
              }}
            >
              {a}
            </Button>
          ))}
          <Button size="sm" variant="ghost" className="h-6 text-[11px]" onClick={() => setSelected([])}>Clear</Button>
        </div>
      )}

      {empty ? (
        <div className="rounded-md border border-dashed border-slate-300 p-6 text-center">
          <p className="text-[12.5px] text-slate-600">{empty}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <caption className="sr-only">Active pipeline runs</caption>
              <thead>
                <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-wide text-slate-500">
                  <th scope="col" className="w-8 py-1.5">
                    <Checkbox
                      checked={allSelected} aria-label="Select all runs on this page"
                      onCheckedChange={(v) => setSelected(v ? Array.from(new Set([...selected, ...pageRows.map((r) => r.id)])) : selected.filter((id) => !pageRows.some((r) => r.id === id)))}
                      className="h-3.5 w-3.5"
                    />
                  </th>
                  {RUN_COLUMNS.filter((c) => columns.includes(c)).map((c) => (
                    <th key={c} scope="col" className="py-1.5 pr-3">
                      <button
                        type="button"
                        onClick={() => setSort((s) => ({ key: c, dir: s.key === c && s.dir === 1 ? -1 : 1 }))}
                        className="inline-flex items-center gap-1 uppercase hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label={`Sort by ${c}`}
                      >
                        {c}{sort.key === c && <span aria-hidden>{sort.dir === 1 ? "▲" : "▼"}</span>}
                      </button>
                    </th>
                  ))}
                  <th scope="col" className="py-1.5 pr-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id} className={cn("border-b border-slate-100 hover:bg-slate-50", dense ? "text-[11.5px]" : "text-[12.5px]")}>
                    <td className={cn(dense ? "py-1" : "py-2")}>
                      <Checkbox
                        checked={selected.includes(r.id)} aria-label={`Select ${r.id}`}
                        onCheckedChange={(v) => setSelected((cur) => (v ? [...cur, r.id] : cur.filter((x) => x !== r.id)))}
                        className="h-3.5 w-3.5"
                      />
                    </td>
                    {RUN_COLUMNS.filter((c) => columns.includes(c)).map((c) => (
                      <td key={c} className={cn("pr-3", dense ? "py-1" : "py-2")}>
                        {c === "Pipeline Run ID" ? (
                          <button type="button" onClick={() => onOpenRun(r)} className="font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{r.id}</button>
                        ) : c === "Status" ? (
                          <span className="inline-flex items-center gap-1"><StatusIcon status={r.status} /><Pill label={r.status} tone={toneFor(r.status)} /></span>
                        ) : c === "Artifacts" || c === "Queue" ? (
                          nf(value(r, c) as number)
                        ) : c === "Success Rate" ? (
                          <span className={cn(r.successRate < 95 ? "text-amber-700" : "text-slate-700")}>{r.successRate}%</span>
                        ) : c === "Warnings" ? (
                          r.warningCount > 0 ? <Pill label={String(r.warningCount)} tone="amber" /> : <span className="text-slate-400">0</span>
                        ) : (
                          <span className="text-slate-700">{value(r, c)}</span>
                        )}
                      </td>
                    ))}
                    <td className={cn("pr-1 text-right", dense ? "py-1" : "py-2")}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" aria-label={`Actions for ${r.id}`}><MoreHorizontal className="h-3.5 w-3.5" aria-hidden /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {["Open Run Detail", r.status === "Paused" ? "Resume Run" : "Pause Run", "Retry Failed", "Restart from Stage", "Cancel Run", "Export Run Report", "Create Incident"].map((a) => (
                            <DropdownMenuItem key={a} className="text-[11.5px]" onSelect={() => (a === "Open Run Detail" ? onOpenRun(r) : onRunAction(a, r))}>{a}</DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>Showing {pageRows.length} of {filtered.length} runs</span>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="outline" className="h-6 text-[11px]" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span>Page {Math.min(page, pages)} of {pages}</span>
              <Button size="sm" variant="outline" className="h-6 text-[11px]" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              <select
                value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                aria-label="Rows per page" className="h-6 rounded border border-slate-200 bg-white px-1 text-[11px]"
              >
                {[5, 10, 25].map((n) => <option key={n} value={n}>{n} / page</option>)}
              </select>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}

/* ----------------------------- run detail drawer -------------------------- */

export function RunDetailDrawer({ run, onOpenChange, onAction }: {
  run: PipelineRun | null; onOpenChange: (v: boolean) => void; onAction: (action: string, r: PipelineRun) => void;
}) {
  const timeline = run ? timelineForRun(run) : [];
  return (
    <Drawer
      open={!!run} onOpenChange={onOpenChange} wide
      title={run ? `${run.id} — ${run.sourceName}` : "Pipeline Run"}
      description={run ? `${run.sourceCategory} · ${run.owner} · started ${run.startedAt}` : undefined}
    >
      {run && (
        <>
          <div className="grid gap-x-6 sm:grid-cols-2">
            <div>
              <Row label="Status" value={<span className="inline-flex items-center gap-1"><StatusIcon status={run.status} />{run.status}</span>} />
              <Row label="Current stage" value={stageName(run.currentStageId)} />
              <Row label="Started" value={run.startedAt} />
              <Row label="Elapsed time" value={run.elapsedTime} />
              <Row label="Artifacts discovered" value={nf(run.artifactCount)} />
              <Row label="Artifacts completed" value={nf(run.completedCount)} />
              <Row label="Artifacts pending" value={nf(run.pendingCount)} />
              <Row label="Artifacts failed" value={nf(run.failedCount)} />
            </div>
            <div>
              <Row label="Success rate" value={`${run.successRate}%`} />
              <Row label="Current throughput" value={`${Math.round(run.artifactCount / 240).toLocaleString("en-US")}/min`} />
              <Row label="Estimated completion" value={run.estimatedCompletion} />
              <Row label="Access classification" value={run.accessClassification} />
              <Row label="Discovery mode" value={run.discoveryMode} />
              <Row label="Schedule" value={run.schedule} />
              <Row label="Configuration version" value={run.configurationVersion} />
              <Row label="Queue depth" value={nf(run.queueDepth)} />
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-[12px] font-semibold text-slate-900">Stage timeline</h3>
            <ol className="flex flex-wrap gap-1">
              {timeline.map(({ stage, state }) => (
                <li key={stage.id} className={cn(
                  "rounded-md border px-2 py-1 text-[11px]",
                  state === "complete" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : state === "active" ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-slate-50 text-slate-500",
                )}>
                  {stage.name} · {state === "complete" ? "completed" : state === "active" ? "in progress" : "pending"}
                </li>
              ))}
            </ol>
          </div>

          <Tabs defaultValue="summary">
            <TabsList className="h-8">
              {["summary", "artifacts", "timeline", "errors", "warnings", "evidence", "logs"].map((t) => (
                <TabsTrigger key={t} value={t} className="h-6 text-[11px] capitalize">{t}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="summary" className="mt-2 text-[12px] text-slate-600">
              This run is processing {nf(run.artifactCount)} artifacts from {run.sourceName}. {nf(run.completedCount)} artifacts have completed and {nf(run.pendingCount)} remain queued at {stageName(run.currentStageId)}.
            </TabsContent>
            <TabsContent value="artifacts" className="mt-2">
              <table className="w-full text-left text-[11.5px]">
                <caption className="sr-only">Artifacts in this run</caption>
                <thead><tr className="border-b border-slate-200 text-[10.5px] uppercase text-slate-500"><th scope="col" className="py-1 pr-3">Artifact</th><th scope="col" className="py-1 pr-3">Type</th><th scope="col" className="py-1 pr-3">Status</th><th scope="col" className="py-1 pr-3">Attempts</th></tr></thead>
                <tbody>
                  {queueForStage(run.currentStageId).slice(0, 8).map((a) => (
                    <tr key={a.id} className="border-b border-slate-100"><td className="py-1 pr-3">{a.id}</td><td className="py-1 pr-3">{a.artifactType}</td><td className="py-1 pr-3">{a.status}</td><td className="py-1 pr-3">{a.attemptCount}</td></tr>
                  ))}
                </tbody>
              </table>
            </TabsContent>
            <TabsContent value="timeline" className="mt-2">
              <ul className="space-y-1 text-[11.5px] text-slate-700">
                {timeline.map(({ stage, state }) => <li key={stage.id}>{stage.name} — {state} · avg {stage.averageDuration}</li>)}
              </ul>
            </TabsContent>
            <TabsContent value="errors" className="mt-2">
              <ul className="space-y-1 text-[11.5px] text-slate-700">
                {stageErrors[run.currentStageId].map((e) => <li key={e.code}>{e.code}: {e.description} ({nf(e.artifactCount)} artifacts)</li>)}
              </ul>
            </TabsContent>
            <TabsContent value="warnings" className="mt-2 text-[11.5px] text-slate-700">
              {run.warningCount === 0 ? "No warnings recorded for this run." : `${run.warningCount} warnings recorded at ${stageName(run.currentStageId)}.`}
            </TabsContent>
            <TabsContent value="evidence" className="mt-2 text-[11.5px] text-slate-700">
              Evidence references are retained for every artifact processed by this run and are linked from Enterprise Cognitive Memory.
            </TabsContent>
            <TabsContent value="logs" className="mt-2">
              <pre className="max-h-40 overflow-auto rounded bg-slate-900 p-2 text-[10.5px] text-slate-100">{`10:02:11 ${run.id} stage=discover status=completed
10:03:04 ${run.id} stage=ingest status=completed
10:04:52 ${run.id} stage=parse status=completed
10:05:18 ${run.id} stage=${run.currentStageId} status=${run.status.toLowerCase()} queue=${run.queueDepth}`}</pre>
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap gap-1.5">
            {[run.status === "Paused" ? "Resume Run" : "Pause Run", "Cancel Run", "Retry Failed", "Restart from Stage", "Reprocess Artifacts", "Export Run Report", "Open Source Configuration", "Create Incident"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, run)}>{a}</Button>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* --------------------------- throughput and queues ------------------------ */

export type ChartMode = "throughput" | "queue" | "duration" | "failures";

export function ThroughputPanel({ mode, onMode, series, queueSeries, loading, degraded, spotlight, timeRange, onTimeRange }: {
  mode: ChartMode;
  onMode: (m: ChartMode) => void;
  series: { time: string; entering: number; published: number; target: number }[];
  queueSeries: { stage: string; depth: number; target: number }[];
  loading?: boolean; degraded?: string | null; spotlight?: boolean;
  timeRange: string; onTimeRange: (v: string) => void;
}) {
  const summary =
    mode === "throughput" ? `Intake averages ${nf(Math.round(series.reduce((a, b) => a + b.entering, 0) / series.length))} artifacts per interval against a target of 12,000.`
    : mode === "queue" ? `Deepest queue is ${queueSeries.reduce((a, b) => (b.depth > a.depth ? b : a)).stage} at ${nf(queueSeries.reduce((a, b) => (b.depth > a.depth ? b : a)).depth)} artifacts.`
    : mode === "duration" ? "Validate has the highest average and P95 processing duration."
    : "Validate and Normalize account for the majority of failures and retries.";

  return (
    <Panel
      id="panel-throughput" title="Throughput & Queue Depth"
      subtitle={summary} loading={loading} degraded={degraded} spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap gap-1">
          {([["throughput", "Throughput"], ["queue", "Queue Depth"], ["duration", "Processing Time"], ["failures", "Failures"]] as const).map(([m, label]) => (
            <button
              key={m} type="button" onClick={() => onMode(m)} aria-pressed={mode === m}
              className={cn("rounded-md border px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                mode === m ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={timeRange} onChange={(e) => onTimeRange(e.target.value)} aria-label="Chart time range"
          className="h-7 rounded border border-slate-200 bg-white px-1.5 text-[11px]"
        >
          {["Last hour", "Last 6 hours", "Last 24 hours", "Last 7 days", "Last 30 days"].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

      <p className="sr-only">{summary}</p>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "throughput" ? (
            <LineChart data={series} margin={{ top: 6, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <RTooltip formatter={(v: number) => nf(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={12000} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, position: "right" }} />
              <Line type="monotone" dataKey="entering" name="Artifacts entering" stroke="#2563eb" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="published" name="Artifacts published" stroke="#0d9488" strokeWidth={2} dot={false} />
            </LineChart>
          ) : mode === "queue" ? (
            <BarChart data={queueSeries} margin={{ top: 6, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <RTooltip formatter={(v: number) => `${nf(v)} artifacts`} />
              <ReferenceLine y={30000} stroke="#94a3b8" strokeDasharray="4 4" />
              <Bar dataKey="depth" name="Queue depth" radius={[3, 3, 0, 0]}>
                {queueSeries.map((q) => <Cell key={q.stage} fill={q.depth > 40_000 ? "#ea580c" : q.depth > 30_000 ? "#f59e0b" : "#2563eb"} />)}
              </Bar>
            </BarChart>
          ) : mode === "duration" ? (
            <BarChart data={processingTimeSeries} margin={{ top: 6, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="m" />
              <RTooltip formatter={(v: number) => `${v} min`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="average" name="Average" fill="#2563eb" radius={[3, 3, 0, 0]} />
              <Bar dataKey="p95" name="P95" fill="#7c3aed" radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={failureSeries} margin={{ top: 6, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <RTooltip formatter={(v: number) => nf(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="failures" name="Failures" fill="#dc2626" radius={[3, 3, 0, 0]} />
              <Bar dataKey="retries" name="Retries" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

/* ----------------------------- processing quality ------------------------- */

export function QualityPanel({ metrics, onOpen, loading, degraded, spotlight }: {
  metrics: QualityMetric[]; onOpen: (m: QualityMetric) => void;
  loading?: boolean; degraded?: string | null; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-quality" title="Processing Quality" subtitle="Measured against enterprise quality targets" loading={loading} degraded={degraded} spotlight={spotlight}>
      <ul className="divide-y divide-slate-100">
        {metrics.map((m) => (
          <li key={m.id}>
            <button
              type="button" onClick={() => onOpen(m)}
              className="w-full py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={`${m.name}, ${m.currentValue}% against target ${m.targetValue}%, ${m.status}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] text-slate-800">{m.name}</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[12px] font-semibold text-slate-900">{m.currentValue}%</span>
                  <Pill label={m.status} tone={m.status === "Below target" ? "amber" : "green"} />
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Progress value={m.currentValue} className="h-1.5 flex-1" />
                <span className="w-[112px] shrink-0 text-right text-[10.5px] text-slate-500">
                  target {m.targetValue}% · {m.variance >= 0 ? "+" : ""}{m.variance} pt · {nf(m.affectedArtifactCount)} affected
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function QualityDrawer({ metric, onOpenChange }: { metric: QualityMetric | null; onOpenChange: (v: boolean) => void }) {
  return (
    <Drawer open={!!metric} onOpenChange={onOpenChange} title={metric?.name ?? "Quality metric"} description={metric?.definition}>
      {metric && (
        <>
          <dl>
            <Row label="Current value" value={`${metric.currentValue}%`} />
            <Row label="Target" value={`${metric.targetValue}%`} />
            <Row label="Variance" value={`${metric.variance >= 0 ? "+" : ""}${metric.variance} points`} />
            <Row label="Status" value={<Pill label={metric.status} tone={metric.status === "Below target" ? "amber" : "green"} />} />
            <Row label="Affected artifacts" value={nf(metric.affectedArtifactCount)} />
            <Row label="Affected stages" value={metric.affectedStages.join(", ")} />
            <Row label="Affected teams" value={metric.affectedTeams.join(", ")} />
          </dl>
          <div className="h-[110px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metric.trend.map((v, i) => ({ i, v }))}>
                <Area type="monotone" dataKey="v" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
                <RTooltip formatter={(v: number) => `${v}%`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-slate-900">Top failure causes</h3>
            <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-700">
              {metric.topFailureCauses.map((c) => <li key={c.cause}>{c.cause} — {nf(c.count)} artifacts</li>)}
            </ul>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <h3 className="text-[12px] font-semibold text-slate-900">Source distribution</h3>
              <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-700">
                {metric.sourceDistribution.map((s) => <li key={s.label}>{s.label} — {s.value}%</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-[12px] font-semibold text-slate-900">Artifact distribution</h3>
              <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-700">
                {metric.artifactDistribution.map((s) => <li key={s.label}>{s.label} — {s.value}%</li>)}
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-slate-900">Recommended actions</h3>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11.5px] text-slate-700">
              {metric.recommendedActions.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-slate-900">Recent changes</h3>
            <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-600">
              {metric.recentChanges.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ---------------------------- artifact composition ------------------------ */

export function CompositionPanel({ items, activeCategory, onSelect, loading, spotlight }: {
  items: ArtifactComposition[]; activeCategory: string; onSelect: (category: string) => void;
  loading?: boolean; spotlight?: boolean;
}) {
  const active = items.find((i) => i.category === activeCategory);
  return (
    <Panel
      id="panel-composition" title="Artifact Composition in Pipeline"
      subtitle={active ? `${active.artifactType} selected` : "All artifact types in flight"}
      loading={loading} spotlight={spotlight}
      footer={activeCategory === "All" ? undefined : "Clear artifact filter"} onFooter={() => onSelect("All")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="h-[160px] w-full sm:w-[170px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={items} dataKey="percentage" nameKey="artifactType" innerRadius={48} outerRadius={70} paddingAngle={2} stroke="none">
                {items.map((i) => <Cell key={i.artifactType} fill={i.color} opacity={activeCategory === "All" || activeCategory === i.category ? 1 : 0.35} />)}
              </Pie>
              <RTooltip formatter={(v: number, n: string) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="min-w-0 flex-1 space-y-0.5">
          {items.map((i) => (
            <li key={i.artifactType}>
              <button
                type="button" onClick={() => onSelect(activeCategory === i.category ? "All" : i.category)}
                aria-pressed={activeCategory === i.category}
                className={cn("flex w-full items-center gap-2 rounded px-1 py-0.5 text-left text-[11.5px] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  activeCategory === i.category && "bg-blue-50")}
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: i.color }} aria-hidden />
                <span className="min-w-0 flex-1 truncate text-slate-700">{i.artifactType}</span>
                <span className="tabular-nums text-slate-500">{nf(i.count)}</span>
                <span className="w-9 text-right font-medium text-slate-800">{i.percentage}%</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {active && (
        <dl className="mt-2 grid gap-x-6 sm:grid-cols-2">
          <Row label="Average size" value={active.averageSize} />
          <Row label="Average processing time" value={active.averageProcessingTime} />
          <Row label="Success rate" value={`${active.successRate}%`} />
          <Row label="Primary stage bottleneck" value={active.primaryBottleneck} />
        </dl>
      )}
    </Panel>
  );
}

export { seedComposition };

/* --------------------------------- alerts --------------------------------- */

export function AlertsPanel({ alerts, onOpen, onAction, loading, degraded, spotlight }: {
  alerts: PipelineAlert[]; onOpen: (a: PipelineAlert) => void;
  onAction: (action: string, a: PipelineAlert) => void;
  loading?: boolean; degraded?: string | null; spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-alerts" title="Pipeline Alerts" subtitle={`${alerts.filter((a) => a.status === "Open").length} open · ${alerts.length} total`}
      loading={loading} degraded={degraded} spotlight={spotlight}
    >
      {alerts.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 p-5 text-center text-[12px] text-slate-600">
          No alerts match the current filters. Clear filters to see all pipeline alerts.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {alerts.map((a) => (
            <li key={a.id} className="flex items-start gap-2 py-1.5">
              <span className="mt-0.5"><Pill label={a.severity} tone={severityTone(a.severity)} /></span>
              <button
                type="button" onClick={() => onOpen(a)}
                className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <p className="truncate text-[12px] text-slate-800">{a.title}</p>
                <p className="text-[10.5px] text-slate-500">{a.sourceName} · {stageName(a.stageId)} · {a.owner} · {a.time}</p>
              </button>
              <Pill label={a.status} tone={toneFor(a.status)} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" aria-label={`Actions for ${a.title}`}><MoreHorizontal className="h-3.5 w-3.5" aria-hidden /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {["Acknowledge", "Assign", "Open Detail", "Snooze", "Mark Resolved", "Create Incident", "Retry Related Artifacts"].map((act) => (
                    <DropdownMenuItem key={act} className="text-[11.5px]" onSelect={() => (act === "Open Detail" ? onOpen(a) : onAction(act, a))}>{act}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function AlertDetailDrawer({ alert, onOpenChange, onAction }: {
  alert: PipelineAlert | null; onOpenChange: (v: boolean) => void; onAction: (action: string, a: PipelineAlert) => void;
}) {
  return (
    <Drawer
      open={!!alert} onOpenChange={onOpenChange}
      title={alert?.title ?? "Alert"}
      description={alert ? `${alert.severity} · ${stageName(alert.stageId)} · ${alert.owner}` : undefined}
    >
      {alert && (
        <>
          <dl>
            <Row label="Status" value={<Pill label={alert.status} tone={toneFor(alert.status)} />} />
            <Row label="Affected source" value={alert.sourceName} />
            <Row label="Affected run" value={alert.runId} />
            <Row label="Affected artifacts" value={nf(alert.affectedArtifacts)} />
            <Row label="Trigger condition" value={alert.triggerCondition} />
            <Row label="Observed value" value={alert.observedValue} />
            <Row label="Threshold" value={alert.threshold} />
          </dl>
          <div className="space-y-1.5 text-[12px] text-slate-700">
            <p><span className="font-semibold text-slate-900">Business impact.</span> {alert.businessImpact}</p>
            <p><span className="font-semibold text-slate-900">Technical impact.</span> {alert.technicalImpact}</p>
            <p><span className="font-semibold text-slate-900">Recommended action.</span> {alert.recommendedAction}</p>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-slate-900">Evidence</h3>
            <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-700">{alert.evidence.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-slate-900">History</h3>
            <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-600">{alert.history.map((h) => <li key={h.time + h.note}>{h.time} — {h.note}</li>)}</ul>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Acknowledge", "Assign", "Snooze", "Mark Resolved", "Create Incident", "Retry Related Artifacts"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, alert)}>{a}</Button>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* -------------------------------- activity -------------------------------- */

export function ActivityPanel({ activities, onOpen, eventTypes, eventType, onEventType, loading, spotlight }: {
  activities: PipelineActivity[];
  onOpen: (a: PipelineActivity) => void;
  eventTypes: string[];
  eventType: string;
  onEventType: (v: string) => void;
  loading?: boolean; spotlight?: boolean;
}) {
  const rows = eventType === "All" ? activities : activities.filter((a) => a.eventType === eventType);
  return (
    <Panel id="panel-activity" title="Recent Pipeline Activity" subtitle="Operational events across all stages" loading={loading} spotlight={spotlight}>
      <div className="mb-1.5 flex justify-end">
        <select
          value={eventType} onChange={(e) => onEventType(e.target.value)} aria-label="Filter activity by event type"
          className="h-7 rounded border border-slate-200 bg-white px-1.5 text-[11px]"
        >
          {eventTypes.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <ul className="divide-y divide-slate-100">
        {rows.map((a) => (
          <li key={a.id}>
            <button
              type="button" onClick={() => onOpen(a)}
              className="flex w-full items-start gap-2 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="w-[62px] shrink-0 text-[11px] text-slate-500">{a.timestamp}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11.5px] text-slate-800">{a.title}</span>
                <span className="block text-[10.5px] text-slate-500">{a.eventType} · {a.sourceName} · {stageName(a.stageId)} · {a.owner}</span>
              </span>
              <Pill label={a.severity} tone={severityTone(a.severity)} />
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ---------------------------- output readiness ---------------------------- */

export function ReadinessPanel({ readiness, onNext, loading, spotlight, degraded }: {
  readiness: {
    readyForExtraction: string; awaitingHumanValidation: string; blockedByPermissions: string;
    publishedToMemory: string; personaUpdatesPending: number; graphUpdatesPending: number;
  };
  onNext: () => void;
  loading?: boolean; spotlight?: boolean; degraded?: string | null;
}) {
  const cards: { label: string; value: string; tone: Tone; icon: typeof Database }[] = [
    { label: "Ready for Business Condition Extraction", value: readiness.readyForExtraction, tone: "green", icon: Sparkles },
    { label: "Awaiting Human Validation", value: readiness.awaitingHumanValidation, tone: "amber", icon: Clock },
    { label: "Blocked by Permissions", value: readiness.blockedByPermissions, tone: "red", icon: ShieldCheck },
    { label: "Published to Cognitive Memory", value: readiness.publishedToMemory, tone: "blue", icon: Database },
    { label: "Team Persona Updates Pending", value: String(readiness.personaUpdatesPending), tone: "slate", icon: Layers },
    { label: "Context Graph Updates Pending", value: String(readiness.graphUpdatesPending), tone: "slate", icon: GitBranch },
  ];
  return (
    <Panel id="panel-readiness" title="Output Readiness Summary" subtitle="What is ready to become organizational knowledge" loading={loading} spotlight={spotlight} degraded={degraded}>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 p-2.5">
            <div className="flex items-center gap-1.5 text-slate-500">
              <c.icon className="h-3.5 w-3.5" aria-hidden />
              <span className="text-[10.5px] uppercase tracking-wide">{c.label}</span>
            </div>
            <p className="mt-1 text-[19px] font-bold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <p className="text-[10.5px] uppercase tracking-wide text-blue-700">Next stage</p>
        <h3 className="text-[14px] font-semibold text-blue-900">Business Condition Extraction</h3>
        <p className="mt-0.5 text-[12px] text-blue-900/80">
          Decompose normalized artifacts into structured business objectives, requirements, constraints, KPIs, baselines,
          targets, dependencies, risks, and decision rules.
        </p>
        <Button size="sm" className="mt-2 h-8 text-[12px]" onClick={onNext}>
          Proceed to Business Condition Extraction <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
        </Button>
      </div>
    </Panel>
  );
}
