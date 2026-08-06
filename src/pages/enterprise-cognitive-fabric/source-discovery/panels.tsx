import { useMemo, useState } from "react";
import {
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip,
} from "recharts";
import {
  ArrowRight, Bug, CheckCircle2, ChevronRight, CircleDot, Cloud, Code2, FileText,
  Gauge, Maximize2, MessageSquare, Plug, RotateCw, ShieldCheck, Ticket, Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Panel, StatusBadge, DetailRow, CommandCenterDrawer as Drawer } from "../command-center/panels";
import {
  connectorAlerts, knowledgeDomains, sourceCoverage, topologyCategories, topologyOutputs,
  workflowStages, formatNumber,
  type ConnectorAlert, type DiscoveryActivity, type DiscoveryInsight, type KnowledgeReadiness,
  type SourceCategory, type WorkflowStage,
} from "./data";

const CATEGORY_ICON: Record<SourceCategory, typeof FileText> = {
  Documents: FileText,
  Tickets: Ticket,
  Chat: MessageSquare,
  Meetings: Video,
  Code: Code2,
  APIs: Plug,
  Telemetry: Gauge,
};

const statusTone = (status: string) =>
  status === "Healthy" ? "green" : status === "Warning" ? "amber" : status === "Degraded" ? "red" : "slate";

/* --------------------------- Discovery topology --------------------------- */

export function DiscoveryTopologyPanel({
  activeCategory,
  onSelectCategory,
  onSelectPlatform,
  onOpenEngine,
  onOpenOutput,
  loading,
  spotlight,
}: {
  activeCategory: SourceCategory | null;
  onSelectCategory: (c: SourceCategory | null) => void;
  onSelectPlatform: (platform: string) => void;
  onOpenEngine: () => void;
  onOpenOutput: (id: string) => void;
  loading?: boolean;
  spotlight?: boolean;
}) {
  const [hovered, setHovered] = useState<SourceCategory | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const highlight = hovered ?? activeCategory;

  return (
    <Panel
      id="panel-topology"
      title="Discovery Topology Map"
      subtitle="Approved enterprise sources flowing into the discovery and inventory engine"
      loading={loading}
      spotlight={spotlight}
      className="min-h-[360px]"
    >
      <div className="flex items-center justify-between gap-2 pb-2">
        <p className="sr-only">
          Seven source categories — Documents, Tickets, Chat, Meetings, Code, APIs and Telemetry — connect into the
          Discovery and Inventory Engine, which feeds the Source Registry, Artifact Queue, Metadata Index, Connector
          Health and Access Policy Validation.
        </p>
        <div className="flex items-center gap-1.5">
          {activeCategory && (
            <StatusBadge tone="blue">Filtered by {activeCategory}</StatusBadge>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setZoomed((z) => !z)}>
            <Maximize2 className="mr-1 h-3 w-3" aria-hidden /> {zoomed ? "Reset view" : "Zoom to fit"}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => onSelectCategory(null)}>
            Clear selection
          </Button>
        </div>
      </div>

      <div className={cn("transition-transform duration-200 motion-reduce:transition-none origin-top", zoomed && "scale-[0.92]")}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {topologyCategories.map(({ category, platforms }) => {
            const Icon = CATEGORY_ICON[category];
            const dim = highlight !== null && highlight !== category;
            return (
              <div
                key={category}
                onMouseEnter={() => setHovered(category)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "rounded-lg border bg-white p-2 transition-all duration-200 motion-reduce:transition-none",
                  activeCategory === category ? "border-blue-400 ring-1 ring-blue-200" : "border-slate-200",
                  dim && "opacity-45",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectCategory(activeCategory === category ? null : category)}
                  aria-pressed={activeCategory === category}
                  className="flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden />
                  <span className="truncate text-[12px] font-semibold text-slate-900">{category}</span>
                </button>
                <ul className="mt-1.5 space-y-0.5">
                  {platforms.map((p) => (
                    <li key={p}>
                      <button
                        type="button"
                        onClick={() => onSelectPlatform(p)}
                        className="w-full truncate rounded px-1 py-0.5 text-left text-[10.5px] text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {p}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="my-2 flex justify-center" aria-hidden>
          <svg width="100%" height="26" role="presentation">
            <line x1="10%" y1="0" x2="50%" y2="26" stroke="#cbd5e1" strokeDasharray="3 3" />
            <line x1="30%" y1="0" x2="50%" y2="26" stroke="#cbd5e1" strokeDasharray="3 3" />
            <line x1="50%" y1="0" x2="50%" y2="26" stroke="#cbd5e1" strokeDasharray="3 3" />
            <line x1="70%" y1="0" x2="50%" y2="26" stroke="#cbd5e1" strokeDasharray="3 3" />
            <line x1="90%" y1="0" x2="50%" y2="26" stroke="#cbd5e1" strokeDasharray="3 3" />
          </svg>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onOpenEngine}
            className="flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-left transition hover:border-blue-400 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Cloud className="h-4 w-4 text-blue-700" aria-hidden />
            <span>
              <span className="block text-[12.5px] font-semibold text-blue-900">Discovery &amp; Inventory Engine</span>
              <span className="block text-[10.5px] text-blue-700">Continuous discovery across approved enterprise sources</span>
            </span>
          </button>
        </div>

        <div className="my-2 flex justify-center" aria-hidden>
          <svg width="100%" height="22" role="presentation">
            <line x1="50%" y1="0" x2="12%" y2="22" stroke="#cbd5e1" strokeDasharray="3 3" />
            <line x1="50%" y1="0" x2="31%" y2="22" stroke="#cbd5e1" strokeDasharray="3 3" />
            <line x1="50%" y1="0" x2="50%" y2="22" stroke="#cbd5e1" strokeDasharray="3 3" />
            <line x1="50%" y1="0" x2="69%" y2="22" stroke="#cbd5e1" strokeDasharray="3 3" />
            <line x1="50%" y1="0" x2="88%" y2="22" stroke="#cbd5e1" strokeDasharray="3 3" />
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
          {topologyOutputs.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onOpenOutput(o.id)}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left transition hover:border-blue-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="block text-[11.5px] font-semibold text-slate-900">{o.name}</span>
              <span className="mt-0.5 block text-[10px] leading-snug text-slate-500">{o.description}</span>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------- Coverage by type ---------------------------- */

export function CoveragePanel({
  onSelectCategory,
  activeCategory,
  loading,
  degraded,
  spotlight,
  overrides,
}: {
  onSelectCategory: (c: SourceCategory) => void;
  activeCategory: SourceCategory | null;
  loading?: boolean;
  degraded?: string | null;
  spotlight?: boolean;
  overrides?: Partial<Record<SourceCategory, number>>;
}) {
  return (
    <Panel
      id="panel-coverage"
      title="Discovery Coverage by Source Type"
      loading={loading}
      degraded={degraded}
      spotlight={spotlight}
      footer="View Coverage Details"
      onFooter={() => toast.info("Coverage details grouped by source family and owner.")}
    >
      <ul className="space-y-2">
        {sourceCoverage.map((c) => {
          const current = overrides?.[c.sourceCategory] ?? c.currentCoverage;
          const gap = Math.max(0, c.targetCoverage - current);
          return (
            <li key={c.sourceCategory}>
              <button
                type="button"
                onClick={() => onSelectCategory(c.sourceCategory)}
                aria-pressed={activeCategory === c.sourceCategory}
                className={cn(
                  "w-full rounded-md px-1.5 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  activeCategory === c.sourceCategory ? "bg-blue-50" : "hover:bg-slate-50",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="w-[74px] shrink-0 text-[11.5px] text-slate-700">{c.sourceCategory}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className={cn("block h-full rounded-full", current >= c.targetCoverage ? "bg-emerald-500" : current >= 80 ? "bg-blue-500" : "bg-amber-500")}
                      style={{ width: `${current}%` }}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right text-[11.5px] font-semibold text-slate-900">{current}%</span>
                </div>
                <div className="mt-0.5 pl-[82px] text-[10px] text-slate-500">
                  Target {c.targetCoverage}% · Gap {gap} pts · Trend {c.trend >= 0 ? `+${c.trend}` : c.trend} pts · {formatNumber(c.artifactCount)} artifacts
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/* ----------------------------- Connector health --------------------------- */

export function ConnectorHealthPanel({
  counts,
  onOpenAlert,
  onFilterStatus,
  loading,
  degraded,
  spotlight,
}: {
  counts: { total: number; Healthy: number; Warning: number; Degraded: number; Unauthorized: number; Paused: number };
  onOpenAlert: (alert: ConnectorAlert) => void;
  onFilterStatus: (status: string) => void;
  loading?: boolean;
  degraded?: string | null;
  spotlight?: boolean;
}) {
  const data = useMemo(
    () => [
      { name: "Healthy", value: counts.Healthy, color: "#16a34a" },
      { name: "Warning", value: counts.Warning, color: "#f59e0b" },
      { name: "Degraded", value: counts.Degraded, color: "#dc2626" },
      { name: "Unauthorized", value: counts.Unauthorized, color: "#64748b" },
      { name: "Paused", value: counts.Paused, color: "#94a3b8" },
    ],
    [counts],
  );

  return (
    <Panel id="panel-connectors" title="Connector Health" loading={loading} degraded={degraded} spotlight={spotlight}>
      <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
        <div>
          <div className="relative h-[130px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={38} outerRadius={56} paddingAngle={2} isAnimationActive={false}>
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <RTooltip formatter={(v, n) => [v as number, n as string]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-lg font-bold leading-none text-slate-900">{counts.total}</div>
                <div className="text-[10px] text-slate-500">Total</div>
              </div>
            </div>
          </div>
          <ul className="mt-1 space-y-0.5">
            {data.map((d) => (
              <li key={d.name}>
                <button
                  type="button"
                  onClick={() => onFilterStatus(d.name)}
                  className="flex w-full items-center justify-between rounded px-1 py-0.5 text-[11px] text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: d.color }} aria-hidden />
                    {d.name}
                  </span>
                  <span className="font-semibold">{d.value}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 p-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11.5px] font-semibold text-slate-900">Connector Alerts</span>
            <button type="button" className="text-[11px] text-blue-600 hover:text-blue-800" onClick={() => toast.info("All connector alerts")}>
              View All
            </button>
          </div>
          <ul className="space-y-1.5">
            {connectorAlerts.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onOpenAlert(a)}
                  className="w-full rounded-md border border-slate-100 px-2 py-1.5 text-left hover:border-blue-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="block text-[11.5px] text-slate-800">{a.title}</span>
                  <span className="mt-0.5 flex items-center gap-2">
                    <StatusBadge tone={a.severity === "Degraded" ? "red" : "amber"}>{a.severity}</StatusBadge>
                    <span className="text-[10px] text-slate-500">{a.age}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

export function ConnectorAlertDrawer({
  alert,
  onOpenChange,
}: {
  alert: ConnectorAlert | null;
  onOpenChange: (v: boolean) => void;
}) {
  const act = (label: string) => {
    toast.success(`${label} — ${alert?.title ?? "connector"}`);
    onOpenChange(false);
  };
  return (
    <Drawer open={!!alert} onOpenChange={onOpenChange} title={alert?.title ?? "Connector"} description="Connector alert detail and remediation actions">
      {alert && (
        <>
          <div className="space-y-1.5">
            <DetailRow label="Severity" value={<StatusBadge tone={alert.severity === "Degraded" ? "red" : "amber"}>{alert.severity}</StatusBadge>} />
            <DetailRow label="Age" value={alert.age} />
            <DetailRow label="Connector" value={alert.connectorId} />
            <DetailRow label="Impact" value="Discovery throughput reduced for the affected source" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Acknowledge", "Assign", "Retry", "Pause", "Escalate", "Open Configuration"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => act(a)}>
                {a}
              </Button>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* -------------------------- Knowledge domains ----------------------------- */

export function KnowledgeDomainPanel({
  activeDomain,
  onSelectDomain,
  loading,
  spotlight,
  onViewAll,
}: {
  activeDomain: string | null;
  onSelectDomain: (d: string) => void;
  loading?: boolean;
  spotlight?: boolean;
  onViewAll: () => void;
}) {
  const max = knowledgeDomains[0].assetCount;
  return (
    <Panel
      id="panel-domains"
      title="Knowledge Domain Distribution"
      loading={loading}
      spotlight={spotlight}
      footer="View All Domains"
      onFooter={onViewAll}
    >
      <ul className="space-y-1.5">
        {knowledgeDomains.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => onSelectDomain(d.name)}
              aria-pressed={activeDomain === d.name}
              title={`${d.name}: ${formatNumber(d.assetCount)} artifacts, ${d.sourceCount} sources, ${d.teamCount} teams, ${d.personaCount} personas, ${d.coverage}% coverage, ${d.freshness}, most active source ${d.mostActiveSource}`}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                activeDomain === d.name ? "bg-violet-50" : "hover:bg-slate-50",
              )}
            >
              <span className="w-[104px] shrink-0 truncate text-[11.5px] text-slate-700">{d.name}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <span className="block h-full rounded-full bg-violet-500" style={{ width: `${(d.assetCount / max) * 100}%` }} />
              </span>
              <span className="w-11 shrink-0 text-right text-[11px] font-semibold text-slate-900">
                {Math.round(d.assetCount / 1000)}K
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------- Discovery workflow status ---------------------- */

export function WorkflowStatusPanel({
  onOpenStage,
  loading,
  degraded,
  spotlight,
}: {
  onOpenStage: (s: WorkflowStage) => void;
  loading?: boolean;
  degraded?: string | null;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-workflow"
      title="Discovery Workflow Status"
      loading={loading}
      degraded={degraded}
      spotlight={spotlight}
      footer="View Workflow Details"
      onFooter={() => toast.info("Full workflow telemetry and stage logs.")}
    >
      <div className="overflow-x-auto">
        <div className="flex min-w-[620px] items-start justify-between gap-1">
          {workflowStages.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-start">
              <button
                type="button"
                onClick={() => onOpenStage(s)}
                className="w-full rounded-md px-1 py-1 text-center hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {s.status === "Healthy" ? (
                  <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-600" aria-hidden />
                ) : (
                  <CircleDot className="mx-auto h-4 w-4 text-amber-500" aria-hidden />
                )}
                <span className="mt-1 block text-[10.5px] font-medium leading-tight text-slate-800">{s.name}</span>
                <span className="mt-0.5 block text-[9.5px] text-slate-500">{s.status}</span>
              </button>
              {i < workflowStages.length - 1 && <ChevronRight className="mt-1 h-3 w-3 shrink-0 text-slate-300" aria-hidden />}
            </div>
          ))}
        </div>

        <table className="mt-2 min-w-[620px] w-full text-[10.5px]">
          <caption className="sr-only">Discovery workflow stage throughput and queue metrics</caption>
          <tbody>
            {([
              ["Throughput", (s: WorkflowStage) => s.throughput],
              ["Success Rate", (s: WorkflowStage) => `${s.successRate}%`],
              ["Pending Queue", (s: WorkflowStage) => s.pendingQueue],
              ["Last Completed", (s: WorkflowStage) => s.lastCompleted],
              ["Warnings", (s: WorkflowStage) => String(s.warningCount)],
            ] as const).map(([label, fn]) => (
              <tr key={label} className="border-t border-slate-100">
                <th scope="row" className="py-1 pr-2 text-left font-medium text-slate-500">{label}</th>
                {workflowStages.map((s) => (
                  <td key={s.id} className="py-1 text-center text-slate-800">{fn(s)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function WorkflowStageDrawer({ stage, onOpenChange }: { stage: WorkflowStage | null; onOpenChange: (v: boolean) => void }) {
  return (
    <Drawer open={!!stage} onOpenChange={onOpenChange} title={stage ? `${stage.name} stage` : "Stage"} description="Discovery workflow stage detail">
      {stage && (
        <>
          <div className="space-y-1.5">
            <DetailRow label="Status" value={<StatusBadge tone={statusTone(stage.status) as "green"}>{stage.status}</StatusBadge>} />
            <DetailRow label="Current workload" value={stage.throughput} />
            <DetailRow label="Items completed" value={formatNumber(stage.itemsCompleted)} />
            <DetailRow label="Items failed" value={formatNumber(stage.itemsFailed)} />
            <DetailRow label="Average duration" value={stage.averageDuration} />
            <DetailRow label="P95 duration" value={stage.p95Duration} />
            <DetailRow label="Queue depth" value={stage.pendingQueue} />
            <DetailRow label="SLA status" value={stage.slaStatus} />
            <DetailRow label="Warnings" value={String(stage.warningCount)} />
            <DetailRow label="Linked connectors" value={stage.linkedConnectors.join(", ")} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success(`Retrying failed items in ${stage.name}`)}>
              <RotateCw className="mr-1 h-3 w-3" aria-hidden /> Retry failed items
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.warning(`${stage.name} paused`)}>Pause stage</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.info(`Opening ${stage.name} logs`)}>View logs</Button>
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ------------------------------- Activity --------------------------------- */

export function RecentActivityPanel({
  activity,
  loading,
  spotlight,
  onOpenActivity,
}: {
  activity: DiscoveryActivity[];
  loading?: boolean;
  spotlight?: boolean;
  onOpenActivity: (a: DiscoveryActivity) => void;
}) {
  const [category, setCategory] = useState<string>("All");
  const [severity, setSeverity] = useState<string>("All");
  const filtered = activity.filter(
    (a) => (category === "All" || a.category === category) && (severity === "All" || a.severity === severity),
  );

  return (
    <Panel
      id="panel-activity"
      title="Recent Discovery Activity"
      loading={loading}
      spotlight={spotlight}
      footer="View All Activity"
      onFooter={() => toast.info("Full discovery activity log")}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        <select
          aria-label="Filter activity by source category"
          className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-700"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {["All", "Documents", "Tickets", "Chat", "Meetings", "Code", "APIs", "Telemetry"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Filter activity by severity"
          className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-700"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          {["All", "info", "warning", "success"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-slate-500">No activity matches the selected filters.</p>
      ) : (
        <ul className="space-y-1">
          {filtered.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onOpenActivity(a)}
                className="flex w-full items-start gap-2 rounded-md px-1.5 py-1 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span className="w-[58px] shrink-0 text-[10.5px] text-slate-500">{a.timestamp}</span>
                <span className="min-w-0 flex-1 truncate text-[11.5px] text-slate-800">{a.title}</span>
                <StatusBadge tone={a.severity === "warning" ? "amber" : a.severity === "success" ? "green" : "slate"}>{a.category}</StatusBadge>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* ------------------------------- Insights --------------------------------- */

export function DiscoveryInsightsPanel({
  insights,
  loading,
  spotlight,
  onOpenInsight,
}: {
  insights: DiscoveryInsight[];
  loading?: boolean;
  spotlight?: boolean;
  onOpenInsight: (i: DiscoveryInsight) => void;
}) {
  return (
    <Panel
      id="panel-insights"
      title="Discovery Insights"
      loading={loading}
      spotlight={spotlight}
      footer="View All"
      onFooter={() => toast.info("All discovery insights")}
    >
      <ul className="space-y-1">
        {insights.map((i) => (
          <li key={i.id}>
            <button
              type="button"
              onClick={() => onOpenInsight(i)}
              className="w-full rounded-md px-1.5 py-1 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-[11.5px] text-slate-700">{i.title}</span>
                <span className="shrink-0 text-[11.5px] font-semibold text-slate-900">{i.description}</span>
              </span>
              <span className="mt-0.5 block text-[10px] text-slate-500">
                Confidence {i.confidence}% · {i.evidenceCount} evidence items · {i.affectedEntity}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function InsightDrawer({
  insight,
  onOpenChange,
  onOpenRelated,
}: {
  insight: DiscoveryInsight | null;
  onOpenChange: (v: boolean) => void;
  onOpenRelated: () => void;
}) {
  return (
    <Drawer open={!!insight} onOpenChange={onOpenChange} title={insight?.title ?? "Insight"} description="Discovery insight detail">
      {insight && (
        <>
          <div className="space-y-1.5">
            <DetailRow label="Finding" value={insight.description} />
            <DetailRow label="Category" value={insight.category} />
            <DetailRow label="Confidence" value={`${insight.confidence}%`} />
            <DetailRow label="Evidence" value={`${insight.evidenceCount} items`} />
            <DetailRow label="Affected" value={insight.affectedEntity} />
            <DetailRow label="Review status" value={insight.reviewStatus === "new" ? "Not reviewed" : "Reviewed"} />
          </div>
          <p className="rounded-md bg-slate-50 p-2 text-[12px] text-slate-700">
            Recommended next step: {insight.recommendation}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success("Insight marked reviewed")}>Mark Reviewed</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success("Follow-up created")}>Create Follow Up</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success("Owner assigned")}>Assign Owner</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onOpenRelated}>Open Related Source</Button>
          </div>
        </>
      )}
    </Drawer>
  );
}

/* --------------------------- Knowledge readiness -------------------------- */

export function KnowledgeReadinessPanel({
  readiness,
  loading,
  spotlight,
  onProceed,
}: {
  readiness: KnowledgeReadiness;
  loading?: boolean;
  spotlight?: boolean;
  onProceed: () => void;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-3 h-20 w-full" />
      </div>
    );
  }
  const cards = [
    { icon: CheckCircle2, label: "Sources Ready for Ingestion", value: String(readiness.readySources), tone: "text-emerald-600" },
    { icon: Bug, label: "Pending Validation", value: String(readiness.pendingValidation), tone: "text-amber-600" },
    { icon: ShieldCheck, label: "Restricted Sources", value: String(readiness.restrictedSources), tone: "text-red-600" },
    { icon: Gauge, label: "Est. Artifacts Ready", value: readiness.estimatedArtifacts, tone: "text-blue-600" },
  ];
  return (
    <Panel id="panel-readiness" title="Knowledge Readiness Summary" spotlight={spotlight}>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 p-2.5">
            <c.icon className={cn("h-4 w-4", c.tone)} aria-hidden />
            <div className="mt-1 text-xl font-bold leading-none text-slate-900">{c.value}</div>
            <div className="mt-1 text-[10.5px] leading-tight text-slate-500">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">Next Stage</div>
          <div className="text-[13px] font-semibold text-slate-900">{readiness.nextStage}</div>
          <p className="text-[11px] text-slate-600">
            Normalize, enrich, and extract reusable business conditions from discovered artifacts
          </p>
        </div>
        <Button size="sm" className="h-8 text-[12px]" onClick={onProceed}>
          Proceed to Ingestion <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
        </Button>
      </div>
    </Panel>
  );
}
