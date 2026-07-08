import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  ArrowLeft, Activity, Server, HardDrive, Database, Network, ShieldCheck,
  AlertTriangle, CheckCircle2, Clock, DollarSign, Bot, Play, Zap, Sparkles,
  Cpu, MemoryStick, Layers, Gauge, TrendingUp, FileDown, Search, RefreshCcw,
  X, ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceLine, Legend, Area, AreaChart,
} from "recharts";

// ---------- Data ----------
const statusPills = [
  { l: "Operational Status", v: "Operational", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  { l: "Last Analysis",       v: "14 seconds ago" },
  { l: "Connected vCenters",  v: "18" },
  { l: "Clusters",            v: "214" },
  { l: "ESXi Hosts",          v: "1,246" },
  { l: "Virtual Machines",    v: "18,532" },
  { l: "Datastores",          v: "842" },
  { l: "vSAN Clusters",       v: "62" },
];

const kpis = [
  { icon: Activity,     l: "Overall Infra Health",     v: "97.8%",  sub: "+0.4% wow",  color: "text-emerald-600", bg: "bg-emerald-50", subCls: "text-emerald-600" },
  { icon: AlertTriangle,l: "Infrastructure Risk",       v: "LOW",    sub: "Score 24 / 100", color: "text-amber-600",   bg: "bg-amber-50" },
  { icon: Layers,       l: "Clusters in Warning",       v: "12",     sub: "2 critical", color: "text-red-600",     bg: "bg-red-50",     subCls: "text-red-600" },
  { icon: Server,       l: "Hosts in Warning",          v: "47",     sub: "9 high",     color: "text-orange-600",  bg: "bg-orange-50",  subCls: "text-orange-600" },
  { icon: Cpu,          l: "CPU Capacity Remaining",    v: "31 d",   sub: "cluster avg", color: "text-blue-600",   bg: "bg-blue-50" },
  { icon: MemoryStick,  l: "Memory Capacity Remaining", v: "18 d",   sub: "critical: 3", color: "text-violet-600", bg: "bg-violet-50" },
  { icon: HardDrive,    l: "Storage Capacity Remaining",v: "42 d",   sub: "trending down", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: TrendingUp,   l: "Days to Exhaustion",        v: "18",     sub: "memory limited", color: "text-red-600",  bg: "bg-red-50" },
  { icon: Bot,          l: "Automated Actions Today",   v: "138",    sub: "97% success", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: CheckCircle2, l: "Automation Success",        v: "98.6%",  sub: "+1.2% wow",  color: "text-emerald-600", bg: "bg-emerald-50", subCls: "text-emerald-600" },
  { icon: DollarSign,   l: "Projected Annual Savings",  v: "$3.28M", sub: "capacity + rightsize", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Zap,          l: "Tech Debt Reduction",       v: "24%",    sub: "vs baseline", color: "text-violet-600",  bg: "bg-violet-50", subCls: "text-emerald-600" },
];

const forecast = Array.from({ length: 19 }, (_, i) => {
  const d = i * 10;
  return {
    day: `${d}d`,
    cpu:      Math.round(42 + i * 2.1 + Math.sin(i) * 3),
    memory:   Math.round(48 + i * 2.6 + Math.cos(i) * 2),
    storage:  Math.round(55 + i * 1.9),
    network:  Math.round(38 + i * 1.4),
  };
});

const recommendations = [
  {
    title: "Rebalance Cluster PROD-EAST",
    conf: 98, downtime: "None", savings: "$12.4K/mo", risk: "-42% CPU Ready",
    impact: "Restores headroom for 214 VMs; eliminates contention during backup window.",
    reason: "CPU Ready >8% on 6 hosts correlated with backup window & DRS aggressiveness=3.",
  },
  {
    title: "Expand Datastore DS-CORE-04",
    conf: 94, downtime: "Online", savings: "Avoids incident", risk: "+6 TB headroom",
    impact: "Predicted exhaustion in 12 days at current growth (+1.4 TB/wk).",
    reason: "Growth rate accelerated 38% after new SQL workload onboarded 2024-11-08.",
  },
  {
    title: "Remove Stale Snapshots (214)",
    conf: 99, downtime: "None", savings: "18.2 TB", risk: "Perf +12%",
    impact: "Reclaims 18.2 TB; reduces datastore latency and backup runtime.",
    reason: "214 snapshots older than 14 days across DEV-* clusters; policy violation.",
  },
  {
    title: "Rightsize 84 Idle VMs",
    conf: 92, downtime: "Rolling", savings: "$28.9K/mo", risk: "None",
    impact: "vCPU reclaim: 412 vCPU · RAM reclaim: 1.8 TB.",
    reason: "CPU <5% and RAM <20% over 30-day baseline for 84 VMs.",
  },
];

const topIssues = [
  { p: "Critical", env: "PROD",  cluster: "PROD-CLUSTER-01", host: "esx-p01-14", vm: "sql-fin-03",  issue: "Memory Ballooning",   cause: "Overcommit + backup",   auto: "Live migrate 18 VMs", age: "12m" },
  { p: "Critical", env: "PROD",  cluster: "PROD-CLUSTER-02", host: "esx-p02-08", vm: "-",           issue: "Datastore 92% Full",   cause: "Snapshot growth",       auto: "Expand +4 TB",        age: "34m" },
  { p: "High",     env: "PROD",  cluster: "SQL-CLUSTER",     host: "esx-sql-03", vm: "sql-ord-11", issue: "CPU Ready Time 11.3%", cause: "Noisy neighbor",        auto: "Rebalance workload",  age: "1h" },
  { p: "High",     env: "PROD",  cluster: "ORA-CLUSTER",     host: "esx-ora-05", vm: "ora-erp-02", issue: "NUMA Misalignment",    cause: "VM sized > NUMA node",  auto: "Resize VM",           age: "2h" },
  { p: "Medium",   env: "BKP",   cluster: "BACKUP-CL-01",    host: "esx-bkp-02", vm: "-",           issue: "Snapshot Age > 30d",   cause: "Retention policy drift",auto: "Consolidate snapshots",age: "6h" },
  { p: "Medium",   env: "DR",    cluster: "DR-CLUSTER-01",   host: "esx-dr-04",  vm: "-",           issue: "vMotion Failures (3)", cause: "Uplink flapping",       auto: "Reset uplink",        age: "8h" },
];

const heatmapCols = ["CPU","Memory","Storage","Network","IOPS","Latency","HA","DRS","NUMA"];
const heatmapRows = ["Prod-Cluster-01","Prod-Cluster-02","Prod-Cluster-03","DR-Cluster-01","Dev-Cluster-01","Test-Cluster-01","Mgmt-Cluster-01"];
const heatmap: Record<string, ("g"|"y"|"o"|"r")[]> = {
  "Prod-Cluster-01": ["r","o","o","y","y","o","g","y","o"],
  "Prod-Cluster-02": ["o","o","r","y","o","o","g","g","y"],
  "Prod-Cluster-03": ["o","y","y","g","y","y","g","g","g"],
  "DR-Cluster-01":   ["y","g","g","g","g","g","g","y","g"],
  "Dev-Cluster-01":  ["g","g","g","g","g","g","g","g","g"],
  "Test-Cluster-01": ["g","g","g","g","g","g","g","g","g"],
  "Mgmt-Cluster-01": ["g","g","g","g","g","g","g","g","g"],
};
const heatColor: Record<string, string> = {
  g: "bg-emerald-400", y: "bg-yellow-300", o: "bg-orange-400", r: "bg-red-500",
};

const trending = [
  { l: "VM Created",         v: "142", icon: Server,     color: "text-blue-600",    bg: "bg-blue-50" },
  { l: "Host Failure",       v: "1",   icon: AlertTriangle, color: "text-red-600",  bg: "bg-red-50" },
  { l: "DRS Migration",      v: "68",  icon: RefreshCcw, color: "text-violet-600",  bg: "bg-violet-50" },
  { l: "HA Event",           v: "3",   icon: ShieldCheck,color: "text-amber-600",   bg: "bg-amber-50" },
  { l: "Storage Growth",     v: "8.2 TB", icon: HardDrive, color: "text-blue-600",  bg: "bg-blue-50" },
  { l: "CPU Spike",          v: "23",  icon: Cpu,        color: "text-orange-600",  bg: "bg-orange-50" },
  { l: "Memory Ballooning",  v: "37",  icon: MemoryStick,color: "text-red-600",     bg: "bg-red-50" },
  { l: "vMotion",            v: "215", icon: Network,    color: "text-emerald-600", bg: "bg-emerald-50" },
];

const activity = [
  { t: "09:32", e: "Analyzed Cluster PROD-01" },
  { t: "09:33", e: "Detected Memory Contention" },
  { t: "09:33", e: "Correlated with Backup Window" },
  { t: "09:34", e: "Recommended vMotion" },
  { t: "09:35", e: "Executed Live Migration" },
  { t: "09:36", e: "Validated Performance Recovery" },
  { t: "09:37", e: "Closed Incident INC-4820" },
];

const automation = [
  { l: "Analyze Cluster",       icon: Search },
  { l: "Balance Resources",     icon: RefreshCcw },
  { l: "Run Capacity Report",   icon: FileDown },
  { l: "Optimize DRS",          icon: Gauge },
  { l: "Clean Snapshots",       icon: Layers },
  { l: "Rightsize VMs",         icon: Cpu },
  { l: "Storage Reclamation",   icon: HardDrive },
  { l: "Host Evacuation",       icon: Server },
  { l: "Executive Report",      icon: FileDown },
];

const engineeringDetails = {
  cluster: "Prod-Cluster-01",
  metrics: [
    { l: "CPU Oversubscription Ratio",    v: "2.45 : 1", cls: "text-red-600" },
    { l: "Memory Oversubscription Ratio", v: "1.82 : 1", cls: "text-red-600" },
    { l: "CPU Ready",                     v: "8.7%",     cls: "text-amber-600" },
    { l: "Memory Ballooning",             v: "12.3%",    cls: "text-red-600" },
    { l: "Datastore Capacity Usage",      v: "82%",      cls: "text-amber-600" },
    { l: "Network Utilization",           v: "63%",      cls: "text-amber-600" },
    { l: "DRS Balance Score",             v: "62 / 100" },
    { l: "HA Status",                     v: "Healthy",  cls: "text-emerald-600" },
    { l: "vMotion Success (24h)",         v: "98.6%",    cls: "text-emerald-600" },
    { l: "Hosts",                         v: "18" },
    { l: "Virtual Machines",              v: "214" },
  ],
  factors: [
    "High memory contention during backup window",
    "Large VM reservations (>128 GB) on 6 hosts",
    "Datastore nearing capacity (82%)",
  ],
};

// Colored dot helper
const Dot = ({ cls }: { cls: string }) => <span className={`inline-block h-1.5 w-1.5 rounded-full ${cls}`} />;

export default function VmwareCapacityContention() {
  const [window, setWindowSel] = useState<"7d"|"30d"|"60d"|"90d"|"180d"|"365d">("180d");
  const [openPanel, setOpenPanel] = useState(true);

  const forecastData = useMemo(() => {
    const cap = { "7d": 1, "30d": 4, "60d": 7, "90d": 10, "180d": 19, "365d": 19 }[window];
    return forecast.slice(0, Math.max(2, cap));
  }, [window]);

  return (
    <AppShell>
      <main className="flex-1 bg-slate-50/60 animate-fade-in min-w-0">
        <div className={`grid ${openPanel ? "grid-cols-1 xl:grid-cols-[1fr_360px]" : "grid-cols-1"} gap-4 p-5`}>
          {/* MAIN COLUMN */}
          <div className="min-w-0 space-y-4">
            {/* Back + Header */}
            <div>
              <Link
                to="/coworkers/infrastructure-automation"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-700 mb-3"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Infrastructure Automation
              </Link>

              <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-widest text-blue-600 font-bold">Digital Coworker</div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                      VMware Capacity &amp; Contention Digital Coworker
                    </h1>
                    <p className="text-[13px] text-slate-600 mt-2 max-w-3xl leading-relaxed">
                      <span className="font-semibold text-slate-800">Mission:</span> Continuously monitor compute, memory,
                      storage, and cluster health to predict capacity exhaustion, identify resource contention, recommend
                      workload balancing, and automate remediation before users experience degradation.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {statusPills.slice(0, 1).map((p) => (
                      <span key={p.l} className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${p.cls}`}>
                        <Dot cls={p.dot ?? ""} /> {p.v}
                      </span>
                    ))}
                    <button className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                      <RefreshCcw className="h-3 w-3" /> Refresh
                    </button>
                    <button className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                      <FileDown className="h-3 w-3" /> Export
                    </button>
                  </div>
                </div>

                {/* Coverage pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {statusPills.slice(1).map((p) => (
                    <div key={p.l} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
                      <span className="text-slate-500">{p.l}</span>
                      <span className="font-semibold text-slate-900">{p.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {kpis.map((k) => {
                const Icon = k.icon;
                return (
                  <div key={k.l} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-2">
                      <div className={`h-9 w-9 rounded-lg ${k.bg} ${k.color} grid place-items-center shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-medium text-slate-500 truncate">{k.l}</div>
                        <div className="text-lg font-extrabold text-slate-900 leading-tight">{k.v}</div>
                      </div>
                    </div>
                    <div className={`mt-1 text-[10px] ${(k as any).subCls ?? "text-slate-500"}`}>{k.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Topology + Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TopologyCard />
              <ForecastCard window={window} setWindow={setWindowSel} data={forecastData} />
            </div>

            {/* Issues + Recs + Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Issues */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-slate-900">Top Issues Detected</div>
                  <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All (47)</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-100">
                        <th className="py-1.5 pr-2 font-semibold">Priority</th>
                        <th className="py-1.5 pr-2 font-semibold">Issue</th>
                        <th className="py-1.5 pr-2 font-semibold">Cluster</th>
                        <th className="py-1.5 pr-2 font-semibold">AI Recommendation</th>
                        <th className="py-1.5 pr-2 font-semibold text-right">Age</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topIssues.map((r, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 cursor-pointer">
                          <td className="py-1.5 pr-2">
                            <span className={`inline-flex items-center gap-1 font-semibold ${
                              r.p === "Critical" ? "text-red-600" : r.p === "High" ? "text-orange-600" : "text-amber-600"
                            }`}>
                              <Dot cls={r.p === "Critical" ? "bg-red-500" : r.p === "High" ? "bg-orange-500" : "bg-amber-500"} />
                              {r.p}
                            </span>
                          </td>
                          <td className="py-1.5 pr-2 text-slate-800">{r.issue}</td>
                          <td className="py-1.5 pr-2 text-slate-600">{r.cluster}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{r.auto}</td>
                          <td className="py-1.5 pr-2 text-right text-slate-500">{r.age}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendations */}
              <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-slate-900">AI Recommendations</div>
                  <span className="text-[10px] text-slate-500">{recommendations.length} active</span>
                </div>
                <div className="space-y-3">
                  {recommendations.map((r) => (
                    <div key={r.title} className="rounded-xl border border-slate-200 p-3 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[12px] font-bold text-slate-900 leading-snug">{r.title}</div>
                        <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                          {r.conf}%
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">{r.impact}</p>
                      <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                        <div><div className="text-slate-500">Downtime</div><div className="font-semibold text-slate-800">{r.downtime}</div></div>
                        <div><div className="text-slate-500">Impact</div><div className="font-semibold text-emerald-700">{r.risk}</div></div>
                        <div><div className="text-slate-500">Savings</div><div className="font-semibold text-slate-800">{r.savings}</div></div>
                      </div>
                      <button className="mt-2 w-full text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1.5 inline-flex items-center justify-center gap-1">
                        <Play className="h-3 w-3" /> Execute
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Heatmap */}
              <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-slate-900">Capacity Heat Map</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="text-[10px] w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-slate-500 font-semibold pr-2 pb-1">Cluster</th>
                        {heatmapCols.map((c) => (
                          <th key={c} className="text-slate-500 font-semibold pb-1 px-0.5 text-center">{c[0]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapRows.map((row) => (
                        <tr key={row}>
                          <td className="text-slate-700 pr-2 py-0.5 whitespace-nowrap">{row}</td>
                          {heatmap[row].map((c, i) => (
                            <td key={i} className="px-0.5 py-0.5">
                              <div className={`h-4 w-full rounded-sm ${heatColor[c]} hover:ring-2 hover:ring-blue-400 cursor-pointer`} title={`${heatmapCols[i]}: ${c}`} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-600">
                  <span className="inline-flex items-center gap-1"><Dot cls="bg-emerald-500" /> Healthy</span>
                  <span className="inline-flex items-center gap-1"><Dot cls="bg-yellow-400" /> Warning</span>
                  <span className="inline-flex items-center gap-1"><Dot cls="bg-orange-500" /> At Risk</span>
                  <span className="inline-flex items-center gap-1"><Dot cls="bg-red-500" /> Critical</span>
                </div>
              </div>
            </div>

            {/* Trending + Activity + Risk + Automation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-900 mb-3">Trending Events (Last 24h)</div>
                <div className="grid grid-cols-4 gap-2">
                  {trending.map((t) => {
                    const Icon = t.icon;
                    return (
                      <div key={t.l} className="rounded-lg border border-slate-100 p-2 text-center hover:bg-slate-50">
                        <div className={`h-8 w-8 mx-auto rounded-lg ${t.bg} ${t.color} grid place-items-center`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-[10px] text-slate-600 mt-1 leading-tight">{t.l}</div>
                        <div className="text-sm font-extrabold text-slate-900">{t.v}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-900 mb-3">Digital Coworker Activity</div>
                <div className="space-y-1.5">
                  {activity.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="text-slate-400 tabular-nums">{a.t}</span>
                      <span className="text-slate-700 flex-1">{a.e}</span>
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-900 mb-3">Risk Forecast</div>
                <div className="relative flex flex-col items-center">
                  <div className="relative h-24 w-24">
                    <svg viewBox="0 0 100 60" className="w-full">
                      <path d="M10 55 A 40 40 0 0 1 90 55" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                      <path d="M10 55 A 40 40 0 0 1 60 15" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-x-0 bottom-1 text-center">
                      <div className="text-lg font-extrabold text-emerald-600">LOW</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">30-Day Projection</div>
                  <div className="text-[11px] font-semibold text-amber-600 mt-0.5">Medium in 90d</div>
                </div>
              </div>

              <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-900 mb-3">Automation Library</div>
                <div className="grid grid-cols-3 gap-2">
                  {automation.map((a) => {
                    const Icon = a.icon;
                    return (
                      <button key={a.l} className="rounded-lg border border-slate-200 p-2 hover:border-blue-300 hover:bg-blue-50/50 text-center">
                        <Icon className="h-4 w-4 mx-auto text-blue-600" />
                        <div className="text-[10px] font-semibold text-slate-700 mt-1 leading-tight">{a.l}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ENGINEERING SIDE PANEL */}
          {openPanel && (
            <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm h-fit sticky top-4">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">Engineering Details</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 inline-flex items-center gap-1">
                    <Dot cls="bg-red-500" /> Cluster: {engineeringDetails.cluster}
                  </div>
                </div>
                <button onClick={() => setOpenPanel(false)} className="text-slate-400 hover:text-slate-700" aria-label="Close panel">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-1 text-[11px]">
                  {["Overview","Performance","Configuration","Events"].map((t, i) => (
                    <button key={t} className={`px-2 py-1 rounded-md font-semibold ${i===0 ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 space-y-2">
                {engineeringDetails.metrics.map((m) => (
                  <div key={m.l} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">{m.l}</span>
                    <span className={`font-bold text-slate-900 ${m.cls ?? ""}`}>{m.v}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-2">Top Contributing Factors</div>
                <ul className="text-[11px] text-slate-700 space-y-1.5">
                  {engineeringDetails.factors.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <ChevronRight className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4">
                <button className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 inline-flex items-center justify-center gap-1">
                  View Full Analysis
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </aside>
          )}
        </div>
      </main>
    </AppShell>
  );
}

// ---------- Sub-components ----------

function TopologyCard() {
  const clusters = [
    { name: "Prod-Cluster-01", tone: "red",    hosts: 6 },
    { name: "Prod-Cluster-02", tone: "orange", hosts: 6 },
    { name: "Prod-Cluster-03", tone: "yellow", hosts: 5 },
    { name: "DR-Cluster-01",   tone: "green",  hosts: 5 },
  ];
  const toneClasses: Record<string, { border: string; bg: string; dot: string }> = {
    red:    { border: "border-red-300",     bg: "bg-red-50",     dot: "bg-red-500" },
    orange: { border: "border-orange-300",  bg: "bg-orange-50",  dot: "bg-orange-500" },
    yellow: { border: "border-yellow-300",  bg: "bg-yellow-50",  dot: "bg-yellow-400" },
    green:  { border: "border-emerald-300", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-slate-900">Infrastructure Topology</div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span className="inline-flex items-center gap-1"><Dot cls="bg-emerald-500" />Healthy</span>
          <span className="inline-flex items-center gap-1"><Dot cls="bg-yellow-400" />Warn</span>
          <span className="inline-flex items-center gap-1"><Dot cls="bg-orange-500" />Contention</span>
          <span className="inline-flex items-center gap-1"><Dot cls="bg-red-500" />Critical</span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-800 inline-flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-blue-600" /> Global Datacenter
        </div>
        <div className="h-4 w-px bg-slate-300" />

        <div className="grid grid-cols-4 gap-3 w-full">
          {clusters.map((c) => {
            const t = toneClasses[c.tone];
            return (
              <div key={c.name} className="flex flex-col items-center">
                <div className={`rounded-lg border ${t.border} ${t.bg} px-2 py-1 text-[10px] font-bold text-slate-800 inline-flex items-center gap-1.5 w-full justify-center`}>
                  <Dot cls={t.dot} /> {c.name}
                </div>
                <div className="h-3 w-px bg-slate-300" />
                <div className="grid grid-cols-3 gap-1 w-full">
                  {Array.from({ length: c.hosts }).map((_, i) => (
                    <div key={i} className={`h-6 rounded ${t.bg} border ${t.border} grid place-items-center`}>
                      <Server className={`h-3 w-3 text-slate-500`} />
                    </div>
                  ))}
                </div>
                <div className="h-3 w-px bg-slate-300" />
                <div className="grid grid-cols-6 gap-0.5 w-full">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className={`h-2 rounded-sm ${
                      c.tone === "red" && i < 4 ? "bg-red-400" :
                      c.tone === "orange" && i < 3 ? "bg-orange-400" :
                      c.tone === "yellow" && i < 2 ? "bg-yellow-300" :
                      "bg-emerald-400"
                    }`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ForecastCard({
  window, setWindow, data,
}: {
  window: string;
  setWindow: (w: any) => void;
  data: typeof forecast;
}) {
  const windows = ["7d","30d","60d","90d","180d","365d"];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-slate-900">Capacity Forecast</div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
          {windows.map((w) => (
            <button
              key={w}
              onClick={() => setWindow(w)}
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${window === w ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="g-cpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-mem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-sto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} />
            <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Exhaustion 90%", fontSize: 10, fill: "#ef4444", position: "insideTopRight" }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="cpu"     name="CPU"      stroke="#3b82f6" fill="url(#g-cpu)" strokeWidth={2} />
            <Area type="monotone" dataKey="memory"  name="Memory"   stroke="#8b5cf6" fill="url(#g-mem)" strokeWidth={2} />
            <Area type="monotone" dataKey="storage" name="Storage"  stroke="#10b981" fill="url(#g-sto)" strokeWidth={2} />
            <Line type="monotone" dataKey="network" name="Network"  stroke="#f59e0b" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
