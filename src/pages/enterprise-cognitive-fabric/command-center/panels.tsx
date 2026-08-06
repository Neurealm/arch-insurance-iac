import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import {
  AlertTriangle, ArrowRight, BellRing, CheckCircle2, ChevronRight, CircleDot, Database,
  FileCode2, FileText, Info, Lightbulb, MessageSquare, Pause, RefreshCw, RotateCw, Ticket,
  TriangleAlert, X,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  alerts as seedAlerts, contextGraphNodes, decisions, healthDimensions, incomingTrend,
  incomingWork, insight as seedInsight, knowledgeDomains, learnStageDetail, learningStages,
  memoryStores, pipelines as seedPipelines,
  type CognitiveHealthDimension, type Decision, type DemoState, type DiscoveryPipeline,
  type SystemAlert, type ViewMode,
} from "./data";

/* ---------------------------------- shell --------------------------------- */

export function Panel({
  title, subtitle, footer, onFooter, children, className, loading, error, degraded, id, spotlight,
}: {
  title: string;
  subtitle?: string;
  footer?: string;
  onFooter?: () => void;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string | null;
  degraded?: string | null;
  id?: string;
  spotlight?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col transition-shadow",
        spotlight && "ring-2 ring-blue-500 ring-offset-2 shadow-lg",
        className,
      )}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <header className="flex items-start justify-between gap-2 px-4 pt-3.5 pb-2">
        <div className="min-w-0">
          <h2 id={id ? `${id}-title` : undefined} className="text-[13.5px] font-semibold text-slate-900 leading-tight">
            {title}
          </h2>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {degraded && (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
            <TriangleAlert className="h-3 w-3" aria-hidden /> Degraded
          </span>
        )}
      </header>
      <div className="px-4 pb-3 flex-1 min-h-0">
        {loading ? (
          <div className="space-y-2 py-2" aria-busy="true" aria-live="polite">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <AlertTriangle className="mx-auto h-5 w-5 text-red-500" aria-hidden />
            <p className="mt-2 text-[12px] text-slate-700">{error}</p>
            <Button size="sm" variant="outline" className="mt-3 h-7 text-[11px]" onClick={() => toast.success("Panel retried")}>
              <RotateCw className="mr-1 h-3 w-3" aria-hidden /> Retry
            </Button>
          </div>
        ) : (
          <>
            {degraded && <p className="mb-2 text-[11px] text-amber-700">{degraded}</p>}
            {children}
          </>
        )}
      </div>
      {footer && !loading && !error && (
        <footer className="border-t border-slate-100 px-4 py-2">
          <button
            type="button"
            onClick={onFooter}
            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            {footer} <ArrowRight className="h-3 w-3" aria-hidden />
          </button>
        </footer>
      )}
    </section>
  );
}

function Drawer({
  open, onOpenChange, title, description, children,
}: { open: boolean; onOpenChange: (v: boolean) => void; title: string; description?: string; children: React.ReactNode }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-[15px]">{title}</SheetTitle>
          {description && <SheetDescription className="text-[12px]">{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-4 space-y-4 text-[12.5px] text-slate-700">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-1.5">
      <span className="text-[11.5px] text-slate-500">{label}</span>
      <span className="text-[12px] font-medium text-slate-900 text-right">{value}</span>
    </div>
  );
}

function DetailList({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return <DetailRow label={label} value="None" />;
  return (
    <div>
      <div className="text-[11.5px] text-slate-500 mb-1">{label}</div>
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-1.5 text-[12px] text-slate-800">
            <CircleDot className="mt-1 h-2.5 w-2.5 shrink-0 text-slate-400" aria-hidden /> {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

const badgeTone = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
  purple: "border-violet-200 bg-violet-50 text-violet-700",
};

export function StatusBadge({ tone, children }: { tone: keyof typeof badgeTone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium", badgeTone[tone])}>
      {children}
    </span>
  );
}

/* --------------------------- 1. Cognitive Health -------------------------- */

export function CognitiveHealthPanel({
  score, loading, error, degraded, spotlight, onViewDetails,
}: { score: number; loading?: boolean; error?: string | null; degraded?: string | null; spotlight?: boolean; onViewDetails: () => void }) {
  const [selected, setSelected] = useState<CognitiveHealthDimension | null>(null);
  const gauge = [{ name: "score", value: score }, { name: "rest", value: 100 - score }];
  const status = score >= 90 ? "Healthy" : score >= 75 ? "Watch" : "At risk";

  return (
    <>
      <Panel
        id="panel-health"
        title="Cognitive Health Overview"
        footer="View Health Details"
        onFooter={onViewDetails}
        loading={loading}
        error={error}
        degraded={degraded}
        spotlight={spotlight}
      >
        <div className="grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)] items-center">
          <div className="relative h-[150px]" role="img" aria-label={`Cognitive health score ${score} out of 100, status ${status}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gauge} dataKey="value" innerRadius={52} outerRadius={70} startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
                  <Cell fill={score >= 90 ? "#16a34a" : score >= 75 ? "#f59e0b" : "#dc2626"} />
                  <Cell fill="#e2e8f0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center text-center pointer-events-none">
              <div>
                <div className="text-2xl font-bold text-slate-900 leading-none">{score}</div>
                <div className="text-[10px] text-slate-500">/100</div>
                <div className="text-[11px] font-medium text-emerald-600 mt-0.5">{status}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-700 mb-2">Health by Dimension</div>
            <ul className="space-y-1.5">
              {healthDimensions.map((d) => (
                <li key={d.id}>
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setSelected(d)}
                          className="w-full text-left group rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          aria-label={`${d.name}: ${d.score} of 100. Open detail`}
                        >
                          <div className="flex items-center justify-between text-[11.5px] text-slate-700 group-hover:text-blue-700">
                            <span>{d.name}</span>
                            <span className="font-semibold text-slate-900">{d.score}</span>
                          </div>
                          <div className="mt-0.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${d.score}%` }} />
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[260px] text-[11.5px]">
                        <div className="font-medium">{d.definition}</div>
                        <div className="mt-1 text-slate-500">
                          Baseline {d.baseline} · Target {d.target} · Calculated {d.lastCalculated}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>

      <Drawer open={!!selected} onOpenChange={(v) => !v && setSelected(null)} title={selected?.name ?? ""} description={selected?.definition}>
        {selected && (
          <>
            <DetailRow label="Current score" value={`${selected.score} / 100`} />
            <DetailRow label="Baseline" value={selected.baseline} />
            <DetailRow label="Target" value={selected.target} />
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selected.trend.map((v, i) => ({ i: `W${i + 1}`, v }))}>
                  <XAxis dataKey="i" tick={{ fontSize: 10 }} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} width={26} />
                  <RTooltip />
                  <Line type="monotone" dataKey="v" stroke="#2563eb" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <DetailList label="Contributing signals" items={selected.contributingSignals} />
            <DetailList label="Top positive factors" items={selected.positiveFactors} />
            <DetailList label="Top negative factors" items={selected.negativeFactors} />
            <DetailRow label="Recommended action" value={selected.recommendation} />
            <DetailRow label="Linked teams" value={selected.linkedTeams.join(", ")} />
          </>
        )}
      </Drawer>
    </>
  );
}

/* -------------------------- 2. Discovery Pipelines ------------------------ */

const sourceIcon: Record<string, typeof FileText> = {
  Docs: FileText,
  Tickets: Ticket,
  Messages: MessageSquare,
  Code: FileCode2,
};

export function DiscoveryPipelinesPanel({
  view, demoState, loading, error, spotlight, onViewAll,
}: { view: ViewMode; demoState: DemoState; loading?: boolean; error?: string | null; spotlight?: boolean; onViewAll: () => void }) {
  const [selected, setSelected] = useState<DiscoveryPipeline | null>(null);
  const rows = useMemo<DiscoveryPipeline[]>(() => {
    if (demoState === "discovery-failure") {
      return seedPipelines.map((p, i) =>
        i === 0 ? { ...p, status: "Failed" as const, progress: 41, warnings: 3, errors: 2, stage: "Ingest" } : p,
      );
    }
    return seedPipelines;
  }, [demoState]);

  const detailed = view === "operations";

  return (
    <>
      <Panel
        id="panel-pipelines"
        title="Active Discovery Pipelines"
        subtitle={detailed ? "Connector throughput, queue depth and warnings" : undefined}
        footer="View All Discovery Jobs"
        onFooter={onViewAll}
        loading={loading}
        error={error}
        spotlight={spotlight}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Active discovery pipelines by source, status and progress</caption>
            <thead>
              <tr className="text-left text-slate-500">
                <th scope="col" className="pb-1.5 font-medium">Source</th>
                <th scope="col" className="pb-1.5 font-medium">Type</th>
                <th scope="col" className="pb-1.5 font-medium">Status</th>
                <th scope="col" className="pb-1.5 font-medium">Progress</th>
                {detailed && <th scope="col" className="pb-1.5 font-medium text-right">Queue</th>}
                {detailed && <th scope="col" className="pb-1.5 font-medium text-right">Processed</th>}
                {detailed && <th scope="col" className="pb-1.5 font-medium text-right">Warn</th>}
                <th scope="col" className="pb-1.5 font-medium text-right">Last Run</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const Icon = sourceIcon[p.sourceType] ?? FileText;
                const tone = p.status === "Completed" ? "green" : p.status === "Running" ? "blue" : p.status === "Failed" ? "red" : "slate";
                return (
                  <tr
                    key={p.id}
                    tabIndex={0}
                    role="button"
                    onClick={() => setSelected(p)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(p); } }}
                    className="border-t border-slate-100 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                    aria-label={`${p.source} pipeline, ${p.status}, ${p.progress} percent`}
                  >
                    <td className="py-1.5 pr-2">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                        <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden /> {p.source}
                      </span>
                    </td>
                    <td className="py-1.5 pr-2 text-slate-600">{p.sourceType}</td>
                    <td className="py-1.5 pr-2"><StatusBadge tone={tone as never}>{p.status}</StatusBadge></td>
                    <td className="py-1.5 pr-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden">
                          <div className={cn("h-full rounded-full", p.status === "Failed" ? "bg-red-500" : p.progress === 100 ? "bg-emerald-500" : "bg-blue-500")} style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="tabular-nums text-slate-700">{p.progress}%</span>
                      </div>
                    </td>
                    {detailed && <td className="py-1.5 text-right tabular-nums text-slate-600">{p.queueDepth.toLocaleString()}</td>}
                    {detailed && <td className="py-1.5 text-right tabular-nums text-slate-600">{p.processed.toLocaleString()}</td>}
                    {detailed && <td className="py-1.5 text-right tabular-nums text-slate-600">{p.warnings}</td>}
                    <td className="py-1.5 text-right text-slate-500">{p.lastRun}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Drawer open={!!selected} onOpenChange={(v) => !v && setSelected(null)} title={selected?.source ?? ""} description={selected ? `${selected.sourceType} connector · ${selected.status}` : undefined}>
        {selected && (
          <>
            <DetailRow label="Owner" value={selected.owner} />
            <DetailRow label="Authentication" value={selected.authStatus} />
            <DetailRow label="Discovery scope" value={selected.scope} />
            <DetailRow label="Last successful run" value={selected.lastSuccess} />
            <DetailRow label="Current stage" value={selected.stage} />
            <DetailRow label="Queue depth" value={selected.queueDepth.toLocaleString()} />
            <DetailRow label="Artifacts discovered" value={selected.artifactsDiscovered.toLocaleString()} />
            <DetailRow label="Artifacts normalized" value={selected.artifactsNormalized.toLocaleString()} />
            <DetailRow label="Conditions extracted" value={selected.conditionsExtracted.toLocaleString()} />
            <DetailRow label="Personas updated" value={selected.personasUpdated} />
            <DetailRow label="Errors / warnings" value={`${selected.errors} / ${selected.warnings}`} />
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success(`Retry queued for ${selected.source}`)}>
                <RotateCw className="mr-1 h-3 w-3" aria-hidden /> Retry
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success(`${selected.source} paused`)}>
                <Pause className="mr-1 h-3 w-3" aria-hidden /> Pause
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.info("Opening source in Discovery")}>
                View source
              </Button>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}

/* ------------------------- 3. Enterprise Memory --------------------------- */

const memoryModes = ["Storage", "Record Count", "Growth", "Freshness"] as const;

export function MemoryUtilizationPanel({
  totalTb, loading, error, spotlight, onViewDetails,
}: { totalTb: number; loading?: boolean; error?: string | null; spotlight?: boolean; onViewDetails: () => void }) {
  const [mode, setMode] = useState<(typeof memoryModes)[number]>("Storage");
  const [selected, setSelected] = useState<string | null>(null);
  const store = memoryStores.find((m) => m.id === selected) ?? null;

  const value = (m: (typeof memoryStores)[number]) =>
    mode === "Storage" ? m.size : mode === "Record Count" ? m.recordCount : mode === "Freshness" ? m.freshness : parseInt(m.monthlyGrowth.replace(/\D/g, ""), 10);

  return (
    <>
      <Panel
        id="panel-memory"
        title="Enterprise Memory Utilization"
        footer="View Memory Details"
        onFooter={onViewDetails}
        loading={loading}
        error={error}
        spotlight={spotlight}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xl font-bold text-slate-900">{totalTb.toFixed(1)} TB</div>
            <div className="text-[11px] text-slate-500">Total Utilized</div>
            <div className="text-[11px] font-medium text-emerald-600 mt-1">+320 GB vs last month</div>
          </div>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Memory metric mode">
            {memoryModes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={cn(
                  "rounded-md border px-1.5 py-0.5 text-[10px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  mode === m ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] items-center">
          <div className="relative h-[140px]" role="img" aria-label={`Memory distribution by ${mode}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memoryStores.map((m) => ({ name: m.name, value: value(m), color: m.color }))}
                  dataKey="value" innerRadius={44} outerRadius={64} stroke="#fff" strokeWidth={2} isAnimationActive={false}
                  onClick={(_, idx) => setSelected(memoryStores[idx].id)}
                >
                  {memoryStores.map((m) => <Cell key={m.id} fill={m.color} cursor="pointer" />)}
                </Pie>
                <RTooltip formatter={(v: number, n: string) => [mode === "Storage" ? `${v} TB` : v.toLocaleString(), n]} />
              </PieChart>
            </ResponsiveContainer>
            {mode === "Storage" && (
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-base font-bold text-slate-900">{totalTb.toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500">TB</div>
                </div>
              </div>
            )}
          </div>
          <ul className="space-y-1">
            {memoryStores.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelected(m.id)}
                  className="flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left text-[11px] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} aria-hidden />
                  <span className="flex-1 truncate text-slate-700">{m.name}</span>
                  <span className="tabular-nums text-slate-900 font-medium">{m.size} TB</span>
                  <span className="tabular-nums text-slate-400">({m.percentage}%)</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <Drawer open={!!store} onOpenChange={(v) => !v && setSelected(null)} title={store?.name ?? ""} description="Filtered memory records for this store">
        {store && (
          <>
            <DetailRow label="Size" value={`${store.size} TB (${store.percentage}%)`} />
            <DetailRow label="Records" value={store.recordCount.toLocaleString()} />
            <DetailRow label="Monthly growth" value={store.monthlyGrowth} />
            <DetailRow label="Freshness" value={`${store.freshness} / 100`} />
            <DetailRow label="Health" value={store.health} />
          </>
        )}
      </Drawer>
    </>
  );
}

/* --------------------------- 4. Knowledge Domains ------------------------- */

export function KnowledgeDomainsPanel({
  activeDomain, onSelectDomain, loading, error, spotlight, onViewAll,
}: {
  activeDomain: string | null;
  onSelectDomain: (d: string | null) => void;
  loading?: boolean; error?: string | null; spotlight?: boolean; onViewAll: () => void;
}) {
  const max = knowledgeDomains[0].assets;
  return (
    <Panel
      id="panel-domains"
      title="Top Knowledge Domains"
      subtitle="By asset count"
      footer="View All Domains"
      onFooter={onViewAll}
      loading={loading}
      error={error}
      spotlight={spotlight}
    >
      {activeDomain && (
        <button
          type="button"
          onClick={() => onSelectDomain(null)}
          className="mb-2 inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10.5px] font-medium text-blue-700"
        >
          Filter: {activeDomain} <X className="h-3 w-3" aria-hidden /> Clear filter
        </button>
      )}
      <ul className="space-y-1.5">
        {knowledgeDomains.map((d) => (
          <li key={d.id}>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onSelectDomain(activeDomain === d.name ? null : d.name)}
                    aria-pressed={activeDomain === d.name}
                    className="w-full text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-[104px] shrink-0 truncate text-[11.5px] text-slate-700">{d.name}</span>
                      <span className="flex-1 h-2.5 rounded bg-slate-100 overflow-hidden">
                        <span
                          className={cn("block h-full rounded", activeDomain === d.name ? "bg-blue-700" : "bg-blue-500")}
                          style={{ width: `${(d.assets / max) * 100}%` }}
                        />
                      </span>
                      <span className="w-[52px] text-right text-[11.5px] tabular-nums font-medium text-slate-900">
                        {d.assets.toLocaleString()}
                      </span>
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-[11.5px]">
                  <div>{d.assets.toLocaleString()} artifacts · {d.conditions.toLocaleString()} conditions</div>
                  <div>{d.personas} personas · freshness {d.freshness}</div>
                  <div className="text-slate-500">Most active team: {d.mostActiveTeam}</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* --------------------------- 5. Incoming Work ----------------------------- */

export function IncomingWorkPanel({
  loading, error, spotlight, onViewAll,
}: { loading?: boolean; error?: string | null; spotlight?: boolean; onViewAll: () => void }) {
  const [filter, setFilter] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const open = !!filter || !!day;

  const items = useMemo(() => {
    let list = incomingWork;
    if (day) list = list.filter((w) => w.day === day);
    if (filter === "Under Review") list = list.filter((w) => w.status === "Under review");
    if (filter === "Impact Analysis") list = list.filter((w) => w.status === "Impact analysis");
    if (filter === "Awaiting Decision") list = list.filter((w) => w.status === "Awaiting decision");
    return list;
  }, [filter, day]);

  const summary = [
    { label: "Total Incoming", value: 156, sub: "This Week" },
    { label: "Under Review", value: 43, sub: "In Progress" },
    { label: "Impact Analysis", value: 27, sub: "In Progress" },
    { label: "Awaiting Decision", value: 18, sub: "Pending" },
  ];

  return (
    <>
      <Panel
        id="panel-incoming"
        title="Incoming Work Overview"
        footer="View Incoming Work"
        onFooter={onViewAll}
        loading={loading}
        error={error}
        spotlight={spotlight}
      >
        <div className="grid grid-cols-4 gap-2">
          {summary.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setFilter(s.label === "Total Incoming" ? null : s.label)}
              className="rounded-lg border border-slate-100 px-2 py-1.5 text-left hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="text-[10px] text-slate-500 truncate">{s.label}</div>
              <div className="text-lg font-bold leading-tight text-slate-900">{s.value}</div>
              <div className="text-[10px] text-slate-400 truncate">{s.sub}</div>
            </button>
          ))}
        </div>

        <div className="mt-3">
          <div className="text-[11px] font-medium text-slate-600 mb-1">Trend (Last 7 Days)</div>
          <div className="h-[130px]" role="img" aria-label="Incoming work items per day, Monday through Sunday">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incomingTrend} onClick={(e) => e?.activeLabel && setDay(String(e.activeLabel))}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} width={26} axisLine={false} tickLine={false} />
                <RTooltip />
                <Line type="monotone" dataKey="value" name="Work items" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="sr-only">
            Monday 62, Tuesday 118, Wednesday 104, Thursday 58, Friday 126, Saturday 34, Sunday 96 work items.
          </p>
        </div>
      </Panel>

      <Drawer
        open={open}
        onOpenChange={(v) => { if (!v) { setFilter(null); setDay(null); } }}
        title={day ? `Work received on ${day}` : filter ?? "Incoming work"}
        description={`${items.length} item${items.length === 1 ? "" : "s"}`}
      >
        {items.length === 0 ? (
          <p className="text-[12px] text-slate-500">No work items match this selection.</p>
        ) : (
          items.map((w) => (
            <div key={w.id} className="rounded-lg border border-slate-200 p-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[12.5px] font-medium text-slate-900">{w.title}</span>
                <StatusBadge tone={w.risk === "High" ? "red" : w.risk === "Medium" ? "amber" : "green"}>{w.risk}</StatusBadge>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {w.type} · {w.originatingTeam} → {w.receivingTeam} · {w.status} · due {w.dueAt}
              </div>
            </div>
          ))
        )}
      </Drawer>
    </>
  );
}

/* --------------------------- 6. Recent Decisions -------------------------- */

export function RecentDecisionsPanel({
  demoState, view, loading, error, spotlight, onViewAll,
}: { demoState: DemoState; view: ViewMode; loading?: boolean; error?: string | null; spotlight?: boolean; onViewAll: () => void }) {
  const [selected, setSelected] = useState<Decision | null>(null);
  const rows = useMemo(() => {
    if (demoState === "high-risk") {
      return [
        { ...decisions[0], decision: "Review" as const, risk: "High" as const, impactScore: 41, conflicts: ["Identity latency budget", "Risk model freeze"] },
        ...decisions.slice(1),
      ];
    }
    return decisions;
  }, [demoState]);

  return (
    <>
      <Panel
        id="panel-decisions"
        title="Recent Decisions"
        footer="View All Decisions"
        onFooter={onViewAll}
        loading={loading}
        error={error}
        spotlight={spotlight}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Recent decisions with outcome, impact score and risk</caption>
            <thead>
              <tr className="text-left text-slate-500">
                <th scope="col" className="pb-1.5 font-medium">Title</th>
                <th scope="col" className="pb-1.5 font-medium">Decision</th>
                <th scope="col" className="pb-1.5 font-medium text-right">Impact</th>
                <th scope="col" className="pb-1.5 font-medium">Risk</th>
                {view === "operations" && <th scope="col" className="pb-1.5 font-medium">Owner</th>}
                <th scope="col" className="pb-1.5 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr
                  key={d.id}
                  tabIndex={0}
                  role="button"
                  onClick={() => setSelected(d)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(d); } }}
                  className="border-t border-slate-100 cursor-pointer hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                  aria-label={`${d.title}, ${d.decision}, impact ${d.impactScore}, ${d.risk} risk`}
                >
                  <td className="py-1.5 pr-2 font-medium text-slate-800">{d.title}</td>
                  <td className="py-1.5 pr-2">
                    <StatusBadge tone={d.decision === "Approve" ? "green" : d.decision === "Review" ? "amber" : "red"}>{d.decision}</StatusBadge>
                  </td>
                  <td className="py-1.5 pr-2 text-right tabular-nums font-medium text-slate-900">{d.impactScore}</td>
                  <td className="py-1.5 pr-2 text-slate-600">{d.risk}</td>
                  {view === "operations" && <td className="py-1.5 pr-2 text-slate-600">{d.owner}</td>}
                  <td className="py-1.5 text-right text-slate-500 whitespace-nowrap">{d.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Drawer open={!!selected} onOpenChange={(v) => !v && setSelected(null)} title={selected?.title ?? ""} description={selected?.summary}>
        {selected && (
          <>
            <DetailRow label="Originating team" value={selected.originatingTeam} />
            <DetailRow label="Decision" value={selected.decision} />
            <DetailRow label="Impact score" value={selected.impactScore} />
            <DetailRow label="Risk" value={selected.risk} />
            <DetailRow label="Conditions evaluated" value={selected.conditionsEvaluated} />
            <DetailList label="Evaluated personas" items={selected.evaluatedPersonas} />
            <DetailList label="Conflicts" items={selected.conflicts} />
            <DetailList label="Required approvals" items={selected.requiredApprovals} />
            <DetailRow label="Recommendation" value={selected.recommendation} />
            <DetailList label="Evidence" items={selected.evidence} />
            <DetailList label="Decision history" items={selected.history} />
            <DetailRow label="Predicted outcome" value={selected.predictedOutcome} />
            <DetailRow label="Actual outcome" value={selected.actualOutcome ?? "Not yet measured"} />
          </>
        )}
      </Drawer>
    </>
  );
}

/* ----------------------------- 7. System Alerts --------------------------- */

export function SystemAlertsPanel({ loading, error, spotlight }: { loading?: boolean; error?: string | null; spotlight?: boolean }) {
  const [items, setItems] = useState<SystemAlert[]>(seedAlerts);
  const [selected, setSelected] = useState<SystemAlert | null>(null);

  const update = (id: string, status: SystemAlert["status"], message: string) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    toast.success(message);
  };

  const icon = (s: SystemAlert["severity"]) =>
    s === "Critical" ? <AlertTriangle className="h-3.5 w-3.5 text-red-500" aria-hidden />
      : s === "Warning" ? <TriangleAlert className="h-3.5 w-3.5 text-amber-500" aria-hidden />
        : <Info className="h-3.5 w-3.5 text-blue-500" aria-hidden />;

  return (
    <>
      <Panel id="panel-alerts" title="System Alerts" loading={loading} error={error} spotlight={spotlight} footer="View All" onFooter={() => toast.info("Opening alert history")}>
        {items.length === 0 ? (
          <p className="py-4 text-center text-[12px] text-slate-500">No active alerts. All systems nominal.</p>
        ) : (
          <ul className="space-y-1.5">
            {items.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setSelected(a)}
                  className="flex w-full items-start gap-2 rounded-lg border border-slate-100 px-2 py-1.5 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {icon(a.severity)}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11.5px] text-slate-800">{a.title}</span>
                    <span className="block text-[10px] text-slate-400">{a.severity} · {a.source} · {a.owner} · {a.status}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{a.createdAt}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Drawer open={!!selected} onOpenChange={(v) => !v && setSelected(null)} title={selected?.title ?? ""} description={selected ? `${selected.severity} · ${selected.source}` : undefined}>
        {selected && (
          <>
            <DetailRow label="Owner" value={selected.owner} />
            <DetailRow label="Status" value={selected.status} />
            <DetailRow label="Raised" value={selected.createdAt} />
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => update(selected.id, "Acknowledged", "Alert acknowledged")}>Acknowledge</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success("Owner assigned")}>Assign owner</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => update(selected.id, "Snoozed", "Alert snoozed for 4 hours")}>Snooze</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => update(selected.id, "Resolved", "Alert marked resolved")}>Mark resolved</Button>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}

/* -------------------------- 8. Cognitive Insights ------------------------- */

export function CognitiveInsightsPanel({ loading, error, spotlight }: { loading?: boolean; error?: string | null; spotlight?: boolean }) {
  const [reviewed, setReviewed] = useState(false);
  const [open, setOpen] = useState(false);
  const i = seedInsight;

  return (
    <>
      <Panel
        id="panel-insights"
        title="Cognitive Insights"
        loading={loading}
        error={error}
        spotlight={spotlight}
      >
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-2.5">
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 text-blue-600 shrink-0" aria-hidden />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-slate-900">{i.title}</span>
                {!reviewed && <StatusBadge tone="blue">New</StatusBadge>}
              </div>
              <p className="mt-1 text-[11.5px] text-slate-600">{i.description}</p>
              <div className="mt-1.5 text-[10.5px] text-slate-500">
                {i.category} · {i.confidence}% confidence · {i.affectedTeam}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => setOpen(true)}>View Insight</Button>
                <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => { setReviewed(true); toast.success("Insight marked reviewed"); }}>Mark Reviewed</Button>
                <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => toast.success("Follow-up created")}>Create Follow-up</Button>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Drawer open={open} onOpenChange={setOpen} title={i.title} description={i.category}>
        <p>{i.description}</p>
        <DetailRow label="Confidence" value={`${i.confidence}%`} />
        <DetailRow label="Affected team" value={i.affectedTeam} />
        <DetailList label="Supporting sources" items={i.sources} />
        <DetailRow label="Recommended action" value={i.recommendation} />
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.info("Opening related persona")}>Open Related Persona</Button>
      </Drawer>
    </>
  );
}

/* -------------------------- 9. Learning Loop ------------------------------ */

export function LearningLoopPanel({ loading, error, spotlight, onViewDetails }: { loading?: boolean; error?: string | null; spotlight?: boolean; onViewDetails: () => void }) {
  const [selected, setSelected] = useState<(typeof learningStages)[number] | null>(null);

  return (
    <>
      <Panel
        id="panel-learning"
        title="Learning Loop Status"
        footer="View Learning Details"
        onFooter={onViewDetails}
        loading={loading}
        error={error}
        spotlight={spotlight}
      >
        <ol className="flex items-center justify-between gap-1">
          {learningStages.map((s, idx) => (
            <li key={s.id} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => setSelected(s)}
                className="flex flex-1 flex-col items-center gap-1 rounded px-1 py-1 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label={`${s.name} stage, status ${s.status}`}
              >
                {s.status === "Healthy" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />
                ) : s.status === "Watch" ? (
                  <TriangleAlert className="h-5 w-5 text-amber-500" aria-hidden />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden />
                )}
                <span className="text-[10.5px] text-slate-700">{s.name}</span>
                <span className="text-[9.5px] text-slate-400">{s.throughput}</span>
              </button>
              {idx < learningStages.length - 1 && <span className="h-px w-3 bg-emerald-300 shrink-0" aria-hidden />}
            </li>
          ))}
        </ol>
      </Panel>

      <Drawer open={!!selected} onOpenChange={(v) => !v && setSelected(null)} title={selected ? `${selected.name} stage` : ""} description={selected?.status}>
        {selected && (
          <>
            <DetailRow label="Throughput" value={selected.throughput} />
            <DetailRow label="Queue" value={selected.queue.toLocaleString()} />
            <DetailRow label="Active agents / services" value={selected.agents} />
            <DetailRow label="SLA" value={selected.sla} />
            <DetailRow label="Failures" value={selected.errors} />
            <DetailRow label="Last run" value={selected.lastRun} />
            <DetailList label="Linked workflows" items={selected.workflows} />
            {selected.name === "Learn" && (
              <>
                <DetailRow label="Predicted vs actual" value={learnStageDetail.predictedVsActual} />
                <DetailRow label="Persona confidence" value={learnStageDetail.personaConfidenceDelta} />
                <DetailRow label="Conditions added or modified" value={learnStageDetail.conditionsChanged} />
                <DetailRow label="Lessons learned" value={learnStageDetail.lessonsLearned} />
              </>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}

/* ------------------------- 10. Context Graph (arch) ----------------------- */

export function ContextGraphPanel({ loading, spotlight }: { loading?: boolean; spotlight?: boolean }) {
  return (
    <Panel
      id="panel-graph"
      title="Context Graph Preview"
      subtitle="Sources, artifacts, conditions, personas and dependencies"
      loading={loading}
      spotlight={spotlight}
      footer="View Context Graph"
      onFooter={() => toast.info("Opening context graph")}
    >
      <div className="h-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={contextGraphNodes.map((n) => ({ name: n.label, value: Math.log10(n.count + 1) * 10, raw: n.count }))} layout="vertical" margin={{ left: 8 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={132} axisLine={false} tickLine={false} />
            <RTooltip formatter={(_v, _n, p) => [(p.payload as { raw: number }).raw.toLocaleString(), "Nodes"]} />
            <Bar dataKey="value" fill="#7c3aed" radius={[0, 3, 3, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10.5px] text-slate-500">
        Relationship density is scaled logarithmically so source and persona nodes remain visible alongside artifact volume.
      </p>
    </Panel>
  );
}

/* ------------------------------- KPI card --------------------------------- */

export function KpiCard({
  label, value, change, status, icon: Icon, trend, color, tooltip, onClick, loading, spotlight,
}: {
  label: string; value: string; change?: string; status?: string;
  icon: typeof Database; trend: number[]; color: string; tooltip: string;
  onClick: () => void; loading?: boolean; spotlight?: boolean;
}) {
  const data = trend.map((v, i) => ({ i, v }));
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-7 w-16" />
        <Skeleton className="mt-2 h-10 w-full" />
      </div>
    );
  }
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className={cn(
              "rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-left transition hover:border-blue-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              spotlight && "ring-2 ring-blue-500 ring-offset-2 shadow-lg",
            )}
            aria-label={`${label}: ${value}${change ? `, ${change}` : ""}${status ? `, ${status}` : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11.5px] font-medium text-slate-600 truncate">{label}</div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold leading-none text-slate-900">{value}</span>
                  {status && (
                    <StatusBadge tone={status === "Healthy" || status === "Running" ? "green" : "amber"}>{status}</StatusBadge>
                  )}
                </div>
              </div>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${color}1a` }} aria-hidden>
                <Icon className="h-4 w-4" style={{ color }} />
              </span>
            </div>
            {change && <div className="mt-1 text-[11px] font-medium text-emerald-600">{change}</div>}
            <div className="mt-1 h-9">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
                  <defs>
                    <linearGradient id={`g-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.6} fill={`url(#g-${label.replace(/\s/g, "")})`} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[240px] text-[11.5px]">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { Drawer as CommandCenterDrawer };
export const panelIcons = { BellRing, ChevronRight, RefreshCw };
