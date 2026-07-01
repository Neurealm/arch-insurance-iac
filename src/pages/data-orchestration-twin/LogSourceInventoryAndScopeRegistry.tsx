import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import {
  Database, CheckCircle2, Activity, Clock, Share2, Droplet, Target,
  Search, Filter, Download, RefreshCw, X, ChevronDown, ChevronRight,
  Server, Cpu, ShieldCheck, GitBranch, Workflow, Layers, Boxes,
  Users, Zap, AlertTriangle, Info, MoreVertical, Plus, TrendingUp,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* -------------- Tokens -------------- */
const toneMap = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",    stroke: "#3b82f6" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", stroke: "#10b981" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-600",  stroke: "#8b5cf6" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",   stroke: "#f59e0b" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-600",    stroke: "#f43f5e" },
  cyan:    { bg: "bg-cyan-50",    text: "text-cyan-600",    stroke: "#06b6d4" },
  slate:   { bg: "bg-slate-50",   text: "text-slate-600",   stroke: "#64748b" },
} as const;
type Tone = keyof typeof toneMap;

/* -------------- Data -------------- */
const KPIS: { icon: any; label: string; value: string; sub: string; delta: string; tone: Tone; spark: number[] }[] = [
  { icon: Database,   label: "Sources in Scope",       value: "122",    sub: "100% of planned",    delta: "+4 wk", tone: "blue",    spark: [110,112,115,118,120,121,122] },
  { icon: CheckCircle2,label:"Active Sources",         value: "108",    sub: "88.5% operational",  delta: "+2",    tone: "emerald", spark: [98,101,103,105,106,107,108] },
  { icon: Activity,   label: "Avg Daily Volume",       value: "2.47 TB",sub: "↑ 18.6% vs yesterday",delta: "+18.6%",tone: "amber",   spark: [1.9,2.0,2.1,2.2,2.3,2.4,2.47] },
  { icon: Clock,      label: "Median Freshness",       value: "2.1 hrs",sub: "Target ≤ 6 hrs",     delta: "-12m",  tone: "violet",  spark: [3.1,2.9,2.7,2.5,2.3,2.2,2.1] },
  { icon: Share2,     label: "Sources with Schema",    value: "115",    sub: "94.3% coverage",     delta: "+3",    tone: "cyan",    spark: [104,107,110,112,113,114,115] },
  { icon: Droplet,    label: "Hydrated Sources",       value: "97",     sub: "79.5% hydration",    delta: "+5",    tone: "rose",    spark: [86,88,91,93,95,96,97] },
  { icon: Target,     label: "Mapped to Use Cases",    value: "113",    sub: "92.6% mapped",       delta: "+6",    tone: "amber",   spark: [100,103,106,108,110,112,113] },
];

const DOMAINS = [
  { label: "All Domains",  count: 122 },
  { label: "XSIAM",        count: 45 },
  { label: "BigQuery",     count: 22 },
  { label: "LogicMonitor", count: 18 },
  { label: "MCP Tools",    count: 15 },
  { label: "Internal APIs",count: 12 },
  { label: "Files",        count: 7 },
  { label: "Other",        count: 3 },
];

type SrcRow = {
  name: string; sub: string; domain: string; platform: string; access: string;
  ownerInit: string; owner: string; ownerTeam: string; volume: string;
  fresh: string; schema: "Registered" | "Draft"; hydration: "Complete" | "Partial" | "Pending";
  useCases: string; status: "Active" | "Warn"; iconColor: Tone; score: number;
};

const SOURCES: SrcRow[] = [
  { name: "panw_ngfw_traffic_raw",   sub: "NGFW Traffic Logs",       domain: "XSIAM",         platform: "Cortex XSIAM",   access: "XQL API",  ownerInit: "RS", owner: "Ravi Shankar", ownerTeam: "Security Ops", volume: "1.12 TB", fresh: "≤ 5 min",  schema: "Registered", hydration: "Complete", useCases: "SREOps, NetOps",     status: "Active", iconColor: "amber",   score: 96 },
  { name: "panw_ngfw_system_raw",    sub: "NGFW System Events",      domain: "XSIAM",         platform: "Cortex XSIAM",   access: "XQL API",  ownerInit: "RS", owner: "Ravi Shankar", ownerTeam: "Security Ops", volume: "86.4 GB", fresh: "≤ 15 min", schema: "Registered", hydration: "Complete", useCases: "SREOps",             status: "Active", iconColor: "amber",   score: 94 },
  { name: "firewall_threat_logs",    sub: "Threat / URL / Content",  domain: "XSIAM",         platform: "Cortex XSIAM",   access: "XQL API",  ownerInit: "AK", owner: "Arjun Kumar",  ownerTeam: "Sec Analytics", volume: "142.7 GB",fresh: "≤ 15 min", schema: "Registered", hydration: "Partial",  useCases: "SREOps, NetOps",     status: "Active", iconColor: "slate",   score: 82 },
  { name: "vpn_globalprotect_logs",  sub: "GlobalProtect VPN Logs",  domain: "XSIAM",         platform: "Cortex XSIAM",   access: "XQL API",  ownerInit: "PJ", owner: "Priya J.",     ownerTeam: "Network Ops",   volume: "38.2 GB", fresh: "≤ 15 min", schema: "Registered", hydration: "Complete", useCases: "SREOps",             status: "Active", iconColor: "amber",   score: 91 },
  { name: "gcp_billing_export",      sub: "GCP Billing Export",      domain: "BigQuery",      platform: "Google BigQuery",access: "SQL",      ownerInit: "SB", owner: "Suresh B.",    ownerTeam: "FinOps",        volume: "210.3 GB",fresh: "≤ 24 hrs", schema: "Registered", hydration: "Complete", useCases: "FinOps",             status: "Active", iconColor: "blue",    score: 88 },
  { name: "gcp_cloud_audit_logs",    sub: "Cloud Audit Logs",        domain: "BigQuery",      platform: "Google BigQuery",access: "SQL",      ownerInit: "NK", owner: "Naveen K.",    ownerTeam: "Cloud Ops",     volume: "164.8 GB",fresh: "≤ 1 hr",   schema: "Registered", hydration: "Partial",  useCases: "SREOps, CloudOps",   status: "Active", iconColor: "blue",    score: 85 },
  { name: "logicmonitor_device_stats",sub: "Device Performance Stats",domain:"LogicMonitor",  platform: "LogicMonitor",   access: "REST API", ownerInit: "MR", owner: "Meena R.",     ownerTeam: "Infra Ops",     volume: "57.6 GB", fresh: "≤ 5 min",  schema: "Registered", hydration: "Complete", useCases: "SREOps",             status: "Active", iconColor: "emerald", score: 93 },
  { name: "logicmonitor_alerts",     sub: "Infrastructure Alerts",   domain: "LogicMonitor",  platform: "LogicMonitor",   access: "REST API", ownerInit: "MR", owner: "Meena R.",     ownerTeam: "Infra Ops",     volume: "3.1 GB",  fresh: "≤ 5 min",  schema: "Registered", hydration: "Complete", useCases: "SREOps",             status: "Active", iconColor: "emerald", score: 92 },
  { name: "datadog_metrics",         sub: "Metrics & Events",        domain: "MCP Tools",     platform: "Datadog",        access: "MCP Tool", ownerInit: "NK", owner: "Naveen K.",    ownerTeam: "Cloud Ops",     volume: "95.4 GB", fresh: "≤ 1 min",  schema: "Registered", hydration: "Partial",  useCases: "SREOps, CloudOps",   status: "Active", iconColor: "violet",  score: 87 },
  { name: "k8s_cluster_logs",        sub: "Kubernetes Cluster Logs", domain: "Internal APIs", platform: "Kubernetes API", access: "API",      ownerInit: "AK", owner: "Arjun Kumar",  ownerTeam: "Sec Analytics", volume: "78.9 GB", fresh: "≤ 15 min", schema: "Registered", hydration: "Complete", useCases: "SREOps, CloudOps",   status: "Active", iconColor: "cyan",    score: 90 },
];

const SOURCES_BY_DOMAIN = [
  { label: "XSIAM",        v: 45, pct: 36.9, color: "#3b82f6" },
  { label: "BigQuery",     v: 22, pct: 18.0, color: "#10b981" },
  { label: "LogicMonitor", v: 18, pct: 14.8, color: "#f59e0b" },
  { label: "MCP Tools",    v: 15, pct: 12.3, color: "#8b5cf6" },
  { label: "Internal APIs",v: 12, pct: 9.8,  color: "#06b6d4" },
  { label: "Files",        v: 7,  pct: 5.7,  color: "#94a3b8" },
  { label: "Other",        v: 3,  pct: 2.5,  color: "#cbd5e1" },
];

const ACCESS_DIST = [
  { label: "XQL API",      v: 45, pct: 36.9, color: "#3b82f6" },
  { label: "SQL (BigQuery)",v:22, pct: 18.0, color: "#10b981" },
  { label: "REST API",     v: 28, pct: 23.0, color: "#f43f5e" },
  { label: "MCP Tool",     v: 15, pct: 12.3, color: "#8b5cf6" },
  { label: "File / SFTP",  v: 7,  pct: 5.7,  color: "#06b6d4" },
  { label: "Other",        v: 5,  pct: 4.1,  color: "#94a3b8" },
];

const VOLUME_BY_DOMAIN = [
  { label: "XSIAM",        v: 1.38, pct: 55.9 },
  { label: "BigQuery",     v: 0.58, pct: 23.5 },
  { label: "LogicMonitor", v: 0.22, pct: 8.9 },
  { label: "MCP Tools",    v: 0.19, pct: 7.7 },
  { label: "Internal APIs",v: 0.08, pct: 3.2 },
  { label: "Other",        v: 0.02, pct: 0.8 },
];

const LIFECYCLE = [
  "Discover","Register","Authenticate","Schema Discovery","Validation",
  "Metadata Collection","Classification","Placement Recommendation","Monitoring","Operational Source",
];

const ARCHITECTURE = [
  { icon: Database,    label: "Source" },
  { icon: Zap,         label: "Connector" },
  { icon: ShieldCheck, label: "Authentication" },
  { icon: Boxes,       label: "Metadata Collector" },
  { icon: Layers,      label: "Schema Engine" },
  { icon: Cpu,         label: "Classification Engine" },
  { icon: Server,      label: "Source Registry" },
  { icon: Activity,    label: "Monitoring" },
  { icon: GitBranch,   label: "Placement Engine" },
  { icon: Workflow,    label: "Data Orchestrator" },
];

/* -------------- Primitives -------------- */
function Sparkline({ data, color = "#3b82f6" }: { data: number[]; color?: string }) {
  const w = 96, h = 28;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i/(data.length-1))*w},${h-((v-min)/range)*h}`).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polygon fill={color} opacity={0.1} points={area} />
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} />
      <circle cx={w} cy={h-((data[data.length-1]-min)/range)*h} r={2.5} fill={color} />
    </svg>
  );
}

function Chip({ tone: t, children }: { tone: Tone; children: React.ReactNode }) {
  const c = toneMap[t];
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] font-medium ${c.bg} ${c.text}`}>{children}</span>;
}

/* -------------- Page -------------- */
export default function LogSourceInventoryAndScopeRegistry() {
  const [activeDomain, setActiveDomain] = useState("All Domains");
  const [drawer, setDrawer] = useState<null | { title: string; subtitle?: string; kind: string }>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const openDrawer = (title: string, kind: string, subtitle?: string) => setDrawer({ title, kind, subtitle });

  const filtered = useMemo(() => SOURCES.filter(s =>
    (activeDomain === "All Domains" || s.domain === activeDomain) &&
    (query === "" || s.name.toLowerCase().includes(query.toLowerCase()) || s.sub.toLowerCase().includes(query.toLowerCase()))
  ), [activeDomain, query]);

  const donutCircum = 2 * Math.PI * 52;
  const domainOffsets = useMemo(() => {
    let acc = 0;
    return SOURCES_BY_DOMAIN.map(d => {
      const len = (d.pct/100) * donutCircum;
      const seg = { color: d.color, len, offset: donutCircum - acc };
      acc += len;
      return seg;
    });
  }, []);
  const accessOffsets = useMemo(() => {
    let acc = 0;
    return ACCESS_DIST.map(d => {
      const len = (d.pct/100) * donutCircum;
      const seg = { color: d.color, len, offset: donutCircum - acc };
      acc += len;
      return seg;
    });
  }, []);

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      {/* Header */}
      <header className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 leading-tight">Log Source Inventory & Scope Registry</h1>
          <p className="text-[13px] text-slate-600 mt-1">Enterprise inventory of every data source participating in the Data Orchestration Platform.</p>
          <p className="text-[11px] text-slate-500 mt-0.5 max-w-3xl">Every downstream orchestration decision begins with accurate source inventory, metadata, ownership, engineering configuration, and operational health.</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-500">Last Updated</div>
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700">
              May 12, 2026 · 10:32 AM
              <button className="p-1 hover:bg-slate-100 rounded"><RefreshCw className="h-3 w-3 text-slate-500" /></button>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Env: <span className="text-emerald-600 font-semibold">Production</span></div>
          </div>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] text-slate-700 shadow-sm">
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
          <button
            onClick={() => openDrawer("Total Sources in Scope", "kpi", "Active 108 · Inactive 14")}
            className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 shadow-sm px-4 py-2 hover:shadow-md transition"
          >
            <div className="h-9 w-9 rounded-lg bg-violet-50 grid place-items-center">
              <Database className="h-4 w-4 text-violet-600" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Sources in Scope</div>
              <div className="text-[20px] font-bold text-slate-900 leading-none">122</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Active: <span className="text-emerald-600 font-medium">108</span> · Inactive: 14</div>
            </div>
          </button>
        </div>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-7 gap-2.5 mb-5">
        {KPIS.map(k => {
          const t = toneMap[k.tone];
          const Icon = k.icon;
          return (
            <button
              key={k.label}
              onClick={() => openDrawer(k.label, "kpi", k.sub)}
              className="text-left group bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`h-8 w-8 rounded-lg ${t.bg} ${t.text} grid place-items-center`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[9.5px] font-medium text-emerald-600 inline-flex items-center gap-0.5">
                  <TrendingUp className="h-2.5 w-2.5" /> {k.delta}
                </span>
              </div>
              <div className="mt-2.5 text-[10.5px] text-slate-500 font-medium">{k.label}</div>
              <div className="mt-0.5 text-[20px] font-bold text-slate-900 leading-none tabular-nums">{k.value}</div>
              <div className="mt-1.5 flex items-end justify-between gap-1">
                <div className="text-[9.5px] text-slate-500 leading-tight">{k.sub}</div>
                <Sparkline data={k.spark} color={t.stroke} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-12 gap-3 mb-3">
        {/* LEFT: Grid */}
        <section className="col-span-9 bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Filter chips + search */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 flex-wrap">
            {DOMAINS.map(d => (
              <button
                key={d.label}
                onClick={() => setActiveDomain(d.label)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11.5px] transition ${
                  activeDomain === d.label
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {d.label}
                <span className={`inline-flex min-w-[20px] justify-center rounded-md text-[10px] font-semibold px-1 ${
                  activeDomain === d.label ? "bg-white/25" : "bg-white text-slate-500"
                }`}>{d.count}</span>
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search sources…"
                  className="pl-8 pr-3 h-8 rounded-lg border border-slate-200 bg-white text-[12px] w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11.5px] text-slate-700">
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[11.5px]">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-2.5 font-medium w-[220px]">Source Name</th>
                  <th className="text-left px-2 py-2.5 font-medium">Domain</th>
                  <th className="text-left px-2 py-2.5 font-medium">Source Platform</th>
                  <th className="text-left px-2 py-2.5 font-medium">Access</th>
                  <th className="text-left px-2 py-2.5 font-medium">Owner</th>
                  <th className="text-right px-2 py-2.5 font-medium">Daily Vol</th>
                  <th className="text-left px-2 py-2.5 font-medium">Freshness</th>
                  <th className="text-left px-2 py-2.5 font-medium">Schema</th>
                  <th className="text-left px-2 py-2.5 font-medium">Hydration</th>
                  <th className="text-left px-2 py-2.5 font-medium">Use Cases</th>
                  <th className="text-left px-2 py-2.5 font-medium">Status</th>
                  <th className="px-2 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const iconTone = toneMap[s.iconColor];
                  const isOpen = expanded === s.name;
                  return (
                    <>
                      <tr
                        key={s.name}
                        onClick={() => setExpanded(isOpen ? null : s.name)}
                        className={`border-b border-slate-50 cursor-pointer transition ${isOpen ? "bg-blue-50/40" : "hover:bg-slate-50"}`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <ChevronRight className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                            <div className={`h-7 w-7 rounded-md ${iconTone.bg} grid place-items-center shrink-0`}>
                              <Database className={`h-3.5 w-3.5 ${iconTone.text}`} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-mono text-[11px] font-semibold text-slate-800 truncate">{s.name}</div>
                              <div className="text-[10px] text-slate-500 truncate">{s.sub}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-slate-700">{s.domain}</td>
                        <td className="px-2 py-2.5 text-slate-700">{s.platform}</td>
                        <td className="px-2 py-2.5 text-slate-700">{s.access}</td>
                        <td className="px-2 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-violet-100 text-violet-700 grid place-items-center text-[9.5px] font-semibold">{s.ownerInit}</div>
                            <div>
                              <div className="text-[11px] text-slate-800 leading-tight">{s.owner}</div>
                              <div className="text-[9.5px] text-slate-500">{s.ownerTeam}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right px-2 py-2.5 tabular-nums text-slate-800 font-medium">{s.volume}</td>
                        <td className="px-2 py-2.5"><Chip tone="emerald">{s.fresh}</Chip></td>
                        <td className="px-2 py-2.5"><Chip tone="emerald">{s.schema}</Chip></td>
                        <td className="px-2 py-2.5">
                          <Chip tone={s.hydration === "Complete" ? "emerald" : s.hydration === "Partial" ? "amber" : "rose"}>{s.hydration}</Chip>
                        </td>
                        <td className="px-2 py-2.5 text-slate-700">{s.useCases}</td>
                        <td className="px-2 py-2.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> {s.status}
                          </span>
                        </td>
                        <td className="px-2 py-2.5">
                          <button onClick={(e) => { e.stopPropagation(); openDrawer(s.name, "source", s.sub); }} className="p-1 rounded hover:bg-slate-100">
                            <MoreVertical className="h-3.5 w-3.5 text-slate-500" />
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr key={s.name + "-x"} className="bg-slate-50/60 border-b border-slate-100">
                          <td colSpan={12} className="px-6 py-4">
                            <ExpandedSourceRow row={s} onOpen={openDrawer} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div>Showing 1 to {filtered.length} of 122 sources</div>
            <div className="flex items-center gap-1">
              <span>Rows:</span>
              <select className="border border-slate-200 rounded px-1.5 py-0.5 text-[11px]"><option>10</option></select>
              <div className="ml-3 flex items-center gap-0.5">
                {["1","2","3","4","5","…","13"].map(p => (
                  <button key={p} className={`h-6 min-w-[24px] px-1.5 rounded text-[11px] ${p==="1" ? "bg-blue-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: 3 visualizations */}
        <aside className="col-span-3 space-y-3">
          {/* Sources by Domain donut */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-[12px] font-semibold text-slate-800 mb-2">Sources by Domain</div>
            <div className="flex items-center gap-3">
              <div className="relative w-[110px] h-[110px] shrink-0">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                  {domainOffsets.map((s, i) => (
                    <circle key={i} cx="60" cy="60" r="52" fill="none" stroke={s.color} strokeWidth="14"
                      strokeDasharray={`${s.len} ${donutCircum}`} strokeDashoffset={-(donutCircum - s.offset)} />
                  ))}
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <div className="text-[16px] font-bold text-slate-900 leading-none">122</div>
                    <div className="text-[9px] text-slate-500 uppercase">Sources</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                {SOURCES_BY_DOMAIN.map(d => (
                  <div key={d.label} className="flex items-center gap-1.5 text-[10.5px]">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-slate-600 flex-1 truncate">{d.label}</span>
                    <span className="tabular-nums text-slate-800 font-medium">{d.v}</span>
                    <span className="tabular-nums text-slate-400">({d.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Access Method donut */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-[12px] font-semibold text-slate-800 mb-2">Access Method Distribution</div>
            <div className="flex items-center gap-3">
              <div className="relative w-[110px] h-[110px] shrink-0">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                  {accessOffsets.map((s, i) => (
                    <circle key={i} cx="60" cy="60" r="52" fill="none" stroke={s.color} strokeWidth="14"
                      strokeDasharray={`${s.len} ${donutCircum}`} strokeDashoffset={-(donutCircum - s.offset)} />
                  ))}
                </svg>
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                {ACCESS_DIST.map(d => (
                  <div key={d.label} className="flex items-center gap-1.5 text-[10.5px]">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-slate-600 flex-1 truncate">{d.label}</span>
                    <span className="tabular-nums text-slate-800 font-medium">{d.v}</span>
                    <span className="tabular-nums text-slate-400">({d.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Volume by Domain bars */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-[12px] font-semibold text-slate-800 mb-2">Volume by Domain (Daily)</div>
            <div className="space-y-1.5">
              {VOLUME_BY_DOMAIN.map(v => (
                <button
                  key={v.label}
                  onClick={() => openDrawer(v.label + " — Daily Volume", "volume", `${v.v} TB · ${v.pct}%`)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center justify-between text-[10.5px] mb-0.5">
                    <span className="text-slate-700 font-medium">{v.label}</span>
                    <span className="tabular-nums text-slate-500">{v.v} TB <span className="text-slate-400">({v.pct}%)</span></span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700 group-hover:brightness-110" style={{ width: `${v.pct}%` }} />
                  </div>
                </button>
              ))}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Total</span>
                <span className="tabular-nums font-bold text-slate-900">2.47 TB</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Engineering Transparency zone */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-800 shadow-lg text-slate-100 p-5 mb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-blue-300 font-semibold">Engineering Transparency</div>
            <h2 className="text-[18px] font-bold">How Sources Become Orchestrated Assets</h2>
          </div>
          <div className="text-[10px] text-slate-400">Discover → Register → Model → Classify → Monitor → Orchestrate</div>
        </div>

        {/* Lifecycle flow */}
        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700 mb-3">
          <div className="text-[11px] font-semibold text-slate-300 mb-3">Source Lifecycle</div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {LIFECYCLE.map((step, i) => (
              <div key={step} className="flex items-center shrink-0">
                <button
                  onClick={() => openDrawer(step, "lifecycle", `Stage ${i+1} of ${LIFECYCLE.length}`)}
                  className="px-2.5 py-2 rounded-md bg-slate-800 border border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition text-[10.5px] font-medium text-slate-200 whitespace-nowrap"
                >
                  <div className="text-[9px] text-blue-400 mb-0.5">{String(i+1).padStart(2,"0")}</div>
                  {step}
                </button>
                {i < LIFECYCLE.length - 1 && (
                  <div className="relative w-4 h-px bg-slate-600 mx-0.5">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Architecture */}
          <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
            <div className="text-[11px] font-semibold text-slate-300 mb-3">Source Registration Architecture</div>
            <div className="grid grid-cols-1 gap-1.5">
              {ARCHITECTURE.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => openDrawer(s.label, "arch")}
                    className="w-full flex items-center gap-3 p-2 rounded-md bg-slate-800/70 border border-slate-700 hover:border-blue-500 transition"
                  >
                    <div className="h-6 w-6 rounded bg-blue-500/20 grid place-items-center">
                      <Icon className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <span className="text-[11px] text-slate-200 flex-1 text-left">{s.label}</span>
                    <span className="text-[9px] text-slate-500">layer {i+1}</span>
                    <div className="w-8 h-1 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-full bg-blue-400 animate-pulse" style={{ width: `${55 + i*5}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right column: metadata engine + widgets */}
          <div className="space-y-3">
            <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
              <div className="text-[11px] font-semibold text-slate-300 mb-3">Metadata Collection Engine</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Technical Metadata",  v: "18,472 attrs" },
                  { label: "Business Metadata",   v: "94% covered" },
                  { label: "Operational Metadata",v: "Live · 30s" },
                  { label: "Security Metadata",   v: "100% policy" },
                  { label: "Data Classification", v: "PII · PHI · PCI" },
                  { label: "Ownership",           v: "97% assigned" },
                  { label: "Version",             v: "v4.2 current" },
                  { label: "API Information",     v: "82 endpoints" },
                  { label: "Contracts",           v: "62 bound" },
                  { label: "Dependencies",        v: "214 tracked" },
                ].map(m => (
                  <button
                    key={m.label}
                    onClick={() => openDrawer(m.label, "meta")}
                    className="text-left p-2 rounded-md bg-slate-800/70 border border-slate-700 hover:border-blue-500 transition"
                  >
                    <div className="text-[9.5px] uppercase tracking-wider text-slate-500">{m.label}</div>
                    <div className="text-[11px] text-slate-100 font-medium">{m.v}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Recent Activity",  v: "42",   tone: "text-blue-400" },
                { label: "Recently Added",   v: "6",    tone: "text-emerald-400" },
                { label: "Connector Health", v: "99.6%",tone: "text-emerald-400" },
                { label: "Auth Status",      v: "100%", tone: "text-emerald-400" },
                { label: "Top Volume",       v: "XSIAM",tone: "text-violet-400" },
                { label: "Recent Changes",   v: "11",   tone: "text-amber-400" },
                { label: "Eng Tasks",        v: "28",   tone: "text-blue-400" },
                { label: "Ownership Cov.",   v: "97%",  tone: "text-emerald-400" },
              ].map(w => (
                <button
                  key={w.label}
                  onClick={() => openDrawer(w.label, "widget")}
                  className="bg-slate-800/70 border border-slate-700 hover:border-blue-500 rounded-md p-2 text-left transition"
                >
                  <div className={`text-[13px] font-bold ${w.tone} tabular-nums`}>{w.v}</div>
                  <div className="text-[8.5px] uppercase tracking-wider text-slate-500">{w.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
        <span className="flex items-center gap-1.5"><Info className="h-3 w-3" /> System of Record for Data Sources — every source is engineered, governed, and scored.</span>
        <div className="flex items-center gap-6">
          <div>Environment: <span className="text-slate-700 font-medium">Production</span></div>
          <div>Alex Morgan · <span className="text-slate-700 font-medium">Lead Platform Architect</span></div>
        </div>
      </div>

      {/* Engineering Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-[30vw] min-w-[420px] sm:max-w-none overflow-y-auto">
          {drawer && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">Engineering Drawer</div>
                    <SheetTitle className="text-[18px]">{drawer.title}</SheetTitle>
                    {drawer.subtitle && <div className="text-[12px] text-slate-500 mt-1">{drawer.subtitle}</div>}
                  </div>
                  <button onClick={() => setDrawer(null)} className="p-1 rounded hover:bg-slate-100"><X className="h-4 w-4 text-slate-500" /></button>
                </div>
              </SheetHeader>
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="engineering">Engineering</TabsTrigger>
                  <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
                  <TabsTrigger value="deps">Dependencies</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-3 text-[12px]">
                  <DrawerBlock label="Business Purpose" text={`Provides the operational signal needed to answer questions related to “${drawer.title}”. Consumed by SRE, Security, and FinOps agents.`} />
                  <DrawerBlock label="Owner & SLA" text="Owner: Platform Eng (A. Morgan) · SLA: 99.9% availability · Freshness: ≤ 15 min p95" />
                  <DrawerBlock label="Business Criticality" text="Tier 1 — feeds Tier 1 SLOs and executive dashboards." />
                </TabsContent>

                <TabsContent value="engineering" className="mt-4 space-y-3 text-[12px]">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Onboarding Pipeline</div>
                    <div className="space-y-1.5">
                      {["Connector deploy","Authentication","Schema discovery","Sampling","Classification","Placement","Registration","Monitoring"].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded bg-blue-100 text-blue-700 text-[10px] grid place-items-center font-semibold">{i+1}</div>
                          <div className="flex-1 text-slate-700">{s}</div>
                          <div className="w-16 h-1 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-blue-500 animate-pulse" style={{ width: `${70 + (i*3)%25}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <DrawerBlock label="Connector" text="OAuth2 · rate-limited 300 rps · exponential backoff · circuit breaker at 5% error rate." />
                  <DrawerBlock label="Placement" text="Hot lake (30d) → Warm lake (400d) → Cold archive (7y). Governed by no-duplication policy v2." />
                </TabsContent>

                <TabsContent value="telemetry" className="mt-4 space-y-2 text-[12px]">
                  {[
                    ["Connection latency","82 ms p95"],
                    ["Polling interval","30s"],
                    ["Retries (24h)","14"],
                    ["Failure rate","0.03%"],
                    ["Auth status","OK · rotated 12d ago"],
                    ["Queue depth","0"],
                    ["Bandwidth","28 MB/s"],
                    ["Daily volume","142.7 GB"],
                    ["Compression","0.42×"],
                    ["Delta rate","6.1%"],
                    ["Freshness p95","4m 12s"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-slate-100 py-1.5">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-mono font-medium text-slate-800">{v}</span>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="deps" className="mt-4 space-y-3 text-[12px]">
                  <DrawerBlock label="Upstream" text="Cortex XSIAM · NetBox CMDB · IAM Vault · KMS · TLS CA" />
                  <DrawerBlock label="Downstream" text="Canonical Model · Graph Projection · Contract Registry · Incident Copilot" />
                  <DrawerBlock label="APIs / Secrets" text="/mcp/sources/v4 · /api/schema/{id} · vault://sre/xsiam-token" />
                  <DrawerBlock label="Consumers" text="SREOps Agent · NetOps · FinOps · Compliance Reporter" />
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ---------- Expanded row ---------- */
function ExpandedSourceRow({ row, onOpen }: { row: SrcRow; onOpen: (title: string, kind: string, sub?: string) => void }) {
  const [tab, setTab] = useState("overview");
  const arch = ["Source","Connector","Auth","Normalize","Metadata","Monitor","Placement","Data Platform"];
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4 mb-3">
        {["overview","schema","engineering","monitoring","security","history"].map((t, idx) => (
          <>
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[11.5px] capitalize pb-1.5 border-b-2 transition ${
                tab === t ? "border-blue-600 text-blue-700 font-semibold" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
            </button>
            {idx === 0 && (
              <Link
                key="cyber-link"
                to={`/data-orchestration-twin/log-source-inventory-and-scope-registry/${row.name}/cyber-threat-intelligence`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11.5px] pb-1.5 border-b-2 border-transparent text-rose-600 hover:text-rose-700 font-semibold"
              >
                <ShieldAlert className="h-3 w-3" /> Cyber Threat Intelligence &amp; IoC Analysis
              </Link>
            )}
          </>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">Engineering Score</span>
          <span className="text-[14px] font-bold text-emerald-600 tabular-nums">{row.score}</span>
          <button onClick={() => onOpen(row.name, "source", row.sub)} className="text-[11px] text-blue-600 hover:text-blue-800 font-medium">Open drawer →</button>
        </div>
      </div>

      {tab === "engineering" && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {arch.map((s, i) => (
            <div key={s} className="flex items-center shrink-0">
              <div className="px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-[10.5px] text-slate-700">{s}</div>
              {i < arch.length - 1 && <div className="w-4 h-px bg-slate-300 relative"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" /></div>}
            </div>
          ))}
        </div>
      )}

      {tab !== "engineering" && (
        <div className="grid grid-cols-4 gap-3 text-[11px]">
          {[
            { k: "Business Purpose",  v: `Feeds ${row.useCases} operational use cases.` },
            { k: "Platform",          v: `${row.platform} · ${row.access}` },
            { k: "Owner",             v: `${row.owner} · ${row.ownerTeam}` },
            { k: "Freshness SLA",     v: row.fresh },
            { k: "Daily Volume",      v: row.volume },
            { k: "Schema",            v: row.schema },
            { k: "Hydration",         v: row.hydration },
            { k: "Status",            v: row.status },
          ].map(x => (
            <div key={x.k} className="rounded-md border border-slate-100 bg-slate-50/60 p-2.5">
              <div className="text-[9.5px] uppercase tracking-wider text-slate-500">{x.k}</div>
              <div className="text-slate-800 font-medium">{x.v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DrawerBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">{label}</div>
      <div className="text-slate-700 leading-relaxed">{text}</div>
    </div>
  );
}
