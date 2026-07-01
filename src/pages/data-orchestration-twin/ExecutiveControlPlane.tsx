import { useMemo, useState } from "react";
import {
  Database, Plug, Cloud, Clock, ShieldCheck, CheckCircle2, Filter,
  RefreshCw, ChevronRight, AlertTriangle, Bell, Layers, Link2, Zap,
  GitBranch, X, Activity, Cpu, HardDrive, Network, Sparkles as Spark, ArrowRight,
} from "lucide-react";
import {
  LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Tooltip,
} from "recharts";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------------- data ---------------- */

const kpis = [
  { id: "sources_scope", icon: Database, label: "Log Sources in Scope", value: "122", sub: "+5 new this week", tone: "blue", delta: "+4.3%" },
  { id: "sources_active", icon: Plug, label: "Active Sources", value: "108", sub: "88.5% of total", tone: "emerald", delta: "+2.1%" },
  { id: "events", icon: Cloud, label: "Events Processed (24h)", value: "2.47B", sub: "↑ 18.6% vs yesterday", tone: "sky", delta: "+18.6%" },
  { id: "freshness", icon: Clock, label: "Median Freshness", value: "2.1h", sub: "Target ≤ 6h", tone: "amber", delta: "-9.0%" },
  { id: "quality", icon: ShieldCheck, label: "Data Quality", value: "89%", sub: "Target ≥ 90%", tone: "violet", delta: "+1.2%" },
  { id: "query", icon: CheckCircle2, label: "Query Readiness", value: "87%", sub: "106 / 122 sources", tone: "teal", delta: "+3.4%" },
];

const mkSpark = (seed: number) =>
  Array.from({ length: 24 }, (_, i) => ({ x: i, y: 40 + Math.sin(i * 0.6 + seed) * 12 + (i * 0.8) + Math.random() * 3 }));

const placementData = [
  { name: "In Source (Query on Demand)", value: 46, color: "#6366f1" },
  { name: "Edge Cache / Delta", value: 32, color: "#3b82f6" },
  { name: "24h Differential Refresh", value: 18, color: "#f59e0b" },
  { name: "Hourly Refresh", value: 9, color: "#10b981" },
  { name: "Vault / Curated Store", value: 11, color: "#a855f7" },
  { name: "Graph Projection Only", value: 4, color: "#ec4899" },
  { name: "Excluded / N/A", value: 2, color: "#94a3b8" },
];

const freshnessData = [
  { name: "≤ 1 Hour", value: 32, color: "#10b981" },
  { name: "1 - 3 Hours", value: 41, color: "#22c55e" },
  { name: "3 - 6 Hours", value: 27, color: "#f59e0b" },
  { name: "6 - 12 Hours", value: 14, color: "#f97316" },
  { name: "> 12 Hours", value: 8, color: "#ef4444" },
];

const pipelineStages = [
  { id: "ingestion", label: "Ingestion", icon: Database, success: 108, total: 108, rate: "108/108", latency: "3.2s", queue: 142 },
  { id: "validation", label: "Validation", icon: ShieldCheck, success: 107, total: 108, rate: "107/108", latency: "1.1s", queue: 38 },
  { id: "hydration", label: "Hydration", icon: Layers, success: 95, total: 108, rate: "95/108", latency: "4.6s", queue: 214 },
  { id: "standardization", label: "Standardization", icon: Spark, success: 96, total: 108, rate: "96/108", latency: "0.9s", queue: 62 },
  { id: "relationships", label: "Relationships", icon: Link2, success: 92, total: 108, rate: "92/108", latency: "2.3s", queue: 88 },
  { id: "query", label: "Query Ready", icon: CheckCircle2, success: 106, total: 122, rate: "106/122", latency: "180ms", queue: 0 },
];

const summaryCards = [
  { id: "schema", icon: Layers, tone: "blue", title: "Schema & Quality", link: "View quality dashboard",
    rows: [["Schemas Discovered","118"],["Schema Drift Detected","12"],["Quality Rules Passing","89%"],["Completeness (Avg)","88%"]] },
  { id: "hydration", icon: Zap, tone: "violet", title: "Hydration & Enrichment", link: "View hydration studio",
    rows: [["Records Hydrated","245.7M"],["Hydration Success Rate","93%"],["Fields Enriched","1,842"],["Confidence Score (Avg)","0.89"]] },
  { id: "relationships", icon: Link2, tone: "sky", title: "Relationships & Keys", link: "View relationship map",
    rows: [["Primary Keys Mapped","94%"],["Foreign Keys Mapped","91%"],["Relationships Created","12.6K"],["Graph Edges Generated","58.3K"]] },
  { id: "performance", icon: Activity, tone: "emerald", title: "Performance (24h)", link: "View performance lab",
    rows: [["Avg Query Time (P95)","18.6s"],["Slow Queries (>60s)","23"],["Data Scanned","18.7 TB"],["Cache Hit Rate","71%"]] },
  { id: "gaps", icon: AlertTriangle, tone: "rose", title: "Gaps & Backlog", link: "View gap register",
    rows: [["Data Gaps Identified","146"],["Critical Gaps","23"],["Backlog Items","312"],["At Risk Sources","7"]] },
  { id: "alerts", icon: Bell, tone: "amber", title: "Upcoming & Alerts", link: "View all alerts",
    rows: [["Sources Stale > 6h","8"],["Schema Changes","5"],["Failed Ingestions","3"],["Access Expiring < 7d","4"]] },
];

const archLayers = [
  { title: "Sources", items: ["AWS", "Azure", "BigQuery"] },
  { title: "Ingestion Layer", items: ["Streams", "APIs", "Batch"] },
  { title: "Processing & Validation", items: ["Schema", "Rules", "DQ"] },
  { title: "Hydration & Enrichment", items: ["Lookup", "AI", "Business Rules"] },
  { title: "Relational & Graph Layer", items: ["Keys", "Edges", "Topology"] },
  { title: "Query & Delivery Layer", items: ["APIs", "SQL", "Vector", "Graph"] },
];

const observability = ["Monitoring", "Lineage", "Quality", "Security", "Metadata"];

const activityRows = [
  ["10:32:10 AM", "Ingestion", "PANW Firewall", "Success", "12,540", "3s"],
  ["10:31:58 AM", "Hydration", "AWS CloudTrail", "Success", "8,732", "1.8s"],
  ["10:31:42 AM", "Relationships", "Okta", "Success", "4,110", "3s"],
  ["10:31:30 AM", "Query Ready", "NetFlow", "Success", "6,221", "18s"],
  ["10:31:15 AM", "Validation", "DNS Logs", "Warning", "0.99s", "8s"],
];

const gapImpact = [
  { label: "Missing Interface Identifiers", pct: 24, sev: "High" },
  { label: "Unmapped Device Relationships", pct: 19, sev: "High" },
  { label: "Slow Queries — Data Scan", pct: 16, sev: "Medium" },
  { label: "Schema Drift — Field Changes", pct: 12, sev: "Medium" },
  { label: "Missing API Access", pct: 9, sev: "Low" },
];

const milestones = [
  ["M1: Current State Documentation", "Apr 18, 2025", "Complete", 100],
  ["M2: Data Readiness Report", "Apr 28, 2025", "Complete", 100],
  ["M3: Architecture Validation Report", "May 15, 2025", "In Progress", 75],
  ["M4: Failure Analysis Report", "May 21, 2025", "In Progress", 60],
  ["M5: Solution Design & Blueprint", "Jun 6, 2025", "Planned", 0],
  ["M6: Backlog Execution Complete", "Jun 25, 2025", "Planned", 0],
  ["M7: Acceptance & Handoff", "Jun 30, 2025", "Planned", 0],
];

const engineeringDetails = [
  ["Ingestion", "2.47B (100%)"],
  ["Validation", "2.47B (100%)"],
  ["Hydration", "2.21B (89.5%)"],
  ["Standardization", "2.14B (86.6%)"],
  ["Relationships", "1.97B (79.7%)"],
  ["Query Ready", "1.82B (73.7%)"],
];

const topSources = [
  ["PANW Firewall", "612M"], ["AWS CloudTrail", "398M"], ["Azure Activity Log", "286M"],
  ["Okta System Log", "184M"], ["NetFlow", "152M"],
];

const toneMap: Record<string, { text: string; bg: string; border: string; ring: string }> = {
  blue:    { text: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",    ring: "bg-blue-500" },
  emerald: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", ring: "bg-emerald-500" },
  sky:     { text: "text-sky-700",     bg: "bg-sky-50",     border: "border-sky-200",     ring: "bg-sky-500" },
  amber:   { text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   ring: "bg-amber-500" },
  violet:  { text: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200",  ring: "bg-violet-500" },
  teal:    { text: "text-teal-700",    bg: "bg-teal-50",    border: "border-teal-200",    ring: "bg-teal-500" },
  rose:    { text: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-200",    ring: "bg-rose-500" },
};

/* ---------------- component ---------------- */

export default function ExecutiveControlPlane() {
  const [drawer, setDrawer] = useState<{ open: boolean; title: string; subtitle: string }>({
    open: false, title: "", subtitle: "",
  });
  const openDrawer = (title: string, subtitle: string) => setDrawer({ open: true, title, subtitle });

  const sparks = useMemo(() => kpis.map((_, i) => mkSpark(i)), []);
  const overallHealthSeries = useMemo(() => mkSpark(9), []);

  return (
    <div className="px-6 py-6 space-y-5 max-w-[1600px]">
      {/* Header */}
      <header className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 leading-tight tracking-tight">Data Orchestration Executive Control Plane</h1>
          <div className="text-blue-600 font-semibold text-sm mt-0.5">Operational Control Plane</div>
          <p className="text-[13px] text-slate-500 mt-1 max-w-2xl">
            High-level operational view of all data orchestration within scope of the SOW / RFP.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>Last Updated: <span className="text-slate-700 font-medium">May 12, 2025 10:32 AM</span></span>
            <button className="p-1 rounded hover:bg-slate-100 text-slate-500"><RefreshCw className="h-3.5 w-3.5" /></button>
          </div>
          <button className="flex items-center gap-2 text-[12px] px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-slate-500" /> Last 24 Hours
          </button>
          <button className="flex items-center gap-2 text-[12px] px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 shadow-sm">
            <Filter className="h-3.5 w-3.5 text-slate-500" /> Filters
          </button>
          <div className="hidden xl:flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Overall Orchestration Health</div>
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 justify-end">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> HEALTHY
              </div>
            </div>
            <div className="w-24 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overallHealthSeries}>
                  <Line type="monotone" dataKey="y" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xl font-bold text-slate-900">92<span className="text-xs text-slate-400 font-medium">/100</span></div>
          </div>
        </div>
      </header>

      {/* KPI strip */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k, i) => {
          const t = toneMap[k.tone];
          const Icon = k.icon;
          return (
            <button
              key={k.id}
              onClick={() => openDrawer(k.label, `${k.value} — ${k.sub}`)}
              className="group text-left rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`h-9 w-9 rounded-xl ${t.bg} ${t.border} border grid place-items-center`}>
                  <Icon className={`h-4 w-4 ${t.text}`} />
                </div>
                <div className={`text-[10px] font-semibold ${t.text}`}>{k.delta}</div>
              </div>
              <div className="text-[11px] text-slate-500 mt-3">{k.label}</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mt-1 tabular-nums">{k.value}</div>
              <div className="text-[10px] text-slate-500 mt-1">{k.sub}</div>
              <div className="h-8 mt-2 -mx-1 opacity-80 group-hover:opacity-100">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparks[i]}>
                    <defs>
                      <linearGradient id={`g${k.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="y" stroke="currentColor" fill={`url(#g${k.id})`} strokeWidth={1.5} className={t.text} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </button>
          );
        })}
      </section>

      {/* Row 2: placement · pipeline · freshness */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Placement donut */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Sources by Placement Strategy</div>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="relative h-[180px] w-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={placementData} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={2} onClick={() => openDrawer("Placement Decision Engine", "How each source is placed")}>
                    {placementData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">122</div>
                  <div className="text-[10px] text-slate-500">Total</div>
                </div>
              </div>
            </div>
            <ul className="flex-1 space-y-1.5">
              {placementData.map((d) => {
                const pct = ((d.value / 122) * 100).toFixed(1);
                return (
                  <li key={d.name} className="flex items-center gap-2 text-[11px]">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="flex-1 truncate text-slate-700">{d.name}</span>
                    <span className="tabular-nums text-slate-900 font-medium">{d.value}</span>
                    <span className="tabular-nums text-slate-400 w-12 text-right">({pct}%)</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <button
            onClick={() => openDrawer("Placement Decision Engine", "Rules that drive per-source placement")}
            className="mt-3 text-[11px] text-blue-600 font-semibold flex items-center gap-1 hover:underline"
          >View all placement decisions <ChevronRight className="h-3 w-3" /></button>
        </div>

        {/* Pipeline health */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Pipeline Health</div>
          <div className="mt-4 flex items-center justify-between gap-1">
            {pipelineStages.map((s, i) => {
              const Icon = s.icon;
              const ok = s.success === s.total;
              return (
                <div key={s.id} className="flex items-center gap-1 min-w-0">
                  <button
                    onClick={() => openDrawer(`Stage · ${s.label}`, `${s.rate} healthy · p95 ${s.latency}`)}
                    className="group flex flex-col items-center min-w-[68px]"
                  >
                    <div className="relative">
                      <div className={`h-11 w-11 rounded-xl grid place-items-center border ${ok ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"} group-hover:scale-105 transition`}>
                        <Icon className={`h-4 w-4 ${ok ? "text-emerald-600" : "text-amber-600"}`} />
                      </div>
                      <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full grid place-items-center ${ok ? "bg-emerald-500" : "bg-amber-500"} ring-2 ring-white`}>
                        <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-900 mt-2">{s.label}</div>
                    <div className="text-[10px] text-slate-500">{s.rate}</div>
                  </button>
                  {i < pipelineStages.length - 1 && (
                    <div className="flex-1 h-[2px] bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 relative overflow-hidden rounded-full min-w-[8px]">
                      <div className="absolute top-0 left-0 h-full w-6 bg-white/70 animate-[shimmer_2s_linear_infinite]" style={{ animation: "shimmer 2s linear infinite" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center border-t border-slate-100 pt-3">
            <div className="text-[11px] text-slate-500">Overall Pipeline Success Rate</div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">87% <span className="text-[11px] text-emerald-500 font-medium">↑ 6.4% vs yesterday</span></div>
          </div>
        </div>

        {/* Freshness donut */}
        <div className="lg:col-span-3 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Data Freshness Distribution</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="relative h-[150px] w-[150px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={freshnessData} dataKey="value" innerRadius={45} outerRadius={65} paddingAngle={2}>
                    {freshnessData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900">122</div>
                  <div className="text-[10px] text-slate-500">Total</div>
                </div>
              </div>
            </div>
            <ul className="flex-1 space-y-1.5">
              {freshnessData.map((d) => {
                const pct = ((d.value / 122) * 100).toFixed(1);
                return (
                  <li key={d.name} className="flex items-center gap-2 text-[11px]">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="flex-1 truncate text-slate-700">{d.name}</span>
                    <span className="tabular-nums text-slate-900 font-medium">{d.value}</span>
                    <span className="tabular-nums text-slate-400 w-11 text-right">({pct}%)</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <button
            onClick={() => openDrawer("Freshness Details", "SLA & last fetch per source")}
            className="mt-3 text-[11px] text-blue-600 font-semibold flex items-center gap-1 hover:underline"
          >View freshness details <ChevronRight className="h-3 w-3" /></button>
        </div>
      </section>

      {/* Row 3: 6 summary cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {summaryCards.map((c) => {
          const t = toneMap[c.tone];
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => openDrawer(c.title, "Engineering detail")}
              className="text-left rounded-2xl bg-white border border-slate-200 p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-lg ${t.bg} ${t.border} border grid place-items-center`}>
                  <Icon className={`h-3.5 w-3.5 ${t.text}`} />
                </div>
                <div className="text-[12px] font-semibold text-slate-900">{c.title}</div>
              </div>
              <div className="mt-3 space-y-1.5">
                {c.rows.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">{k}</span>
                    <span className="tabular-nums font-semibold text-slate-900">{v}</span>
                  </div>
                ))}
              </div>
              <div className={`mt-3 text-[11px] font-semibold ${t.text} flex items-center gap-1 group-hover:gap-1.5 transition-all`}>
                {c.link} <ChevronRight className="h-3 w-3" />
              </div>
            </button>
          );
        })}
      </section>

      {/* Engineering Transparency Zone */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Data Orchestration Engine (How We Achieve It)</div>
            <div className="text-[11px] text-slate-500">Architecture, real-time flow, and control plane observability</div>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live telemetry
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-5">
          {/* Architecture flow */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Architecture Overview</div>
              <div className="grid grid-cols-6 gap-2">
                {archLayers.map((layer, i) => (
                  <div key={layer.title} className="relative">
                    <button
                      onClick={() => openDrawer(layer.title, "Layer components & contracts")}
                      className="w-full text-left rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 hover:border-blue-300 hover:shadow-sm transition p-2"
                    >
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">{layer.title}</div>
                      <div className="mt-1.5 flex items-center justify-center gap-1 py-2">
                        {i === 0 ? (
                          <div className="flex gap-1">
                            <div className="h-6 w-6 rounded bg-orange-100 grid place-items-center text-[8px] font-bold text-orange-700">AWS</div>
                            <div className="h-6 w-6 rounded bg-blue-100 grid place-items-center"><Cloud className="h-3 w-3 text-blue-600" /></div>
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 grid place-items-center">
                            {i === 1 && <Zap className="h-4 w-4 text-blue-600" />}
                            {i === 2 && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
                            {i === 3 && <Layers className="h-4 w-4 text-violet-600" />}
                            {i === 4 && <GitBranch className="h-4 w-4 text-indigo-600" />}
                            {i === 5 && <Network className="h-4 w-4 text-teal-600" />}
                          </div>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-500 text-center leading-tight">{layer.items.join(" | ")}</div>
                    </button>
                    {i < archLayers.length - 1 && (
                      <ArrowRight className="hidden lg:block absolute top-1/2 -right-1.5 -translate-y-1/2 h-3 w-3 text-slate-300 z-10 bg-white" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Observability & Control Plane</div>
              <div className="grid grid-cols-5 gap-2">
                {observability.map((o) => (
                  <button
                    key={o}
                    onClick={() => openDrawer(o, "Control plane facet")}
                    className="rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition py-2.5 flex items-center justify-center gap-1.5"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-medium text-slate-700">{o}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time pipeline flow dark card */}
          <div className="lg:col-span-2 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-semibold">Real-time Pipeline Flow</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400">Events In</div>
                <div className="text-lg font-bold text-emerald-400">12.4K /s</div>
              </div>
              <div className="flex-1 mx-3 relative h-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-emerald-500/40 via-indigo-500/40 to-fuchsia-500/40" />
                </div>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]"
                    style={{ animation: `flow 2.5s linear infinite`, animationDelay: `${i * 0.5}s` }}
                  />
                ))}
              </div>
              <div className="relative h-14 w-14 shrink-0 grid place-items-center">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/40 animate-ping" />
                <div className="absolute inset-1 rounded-full border border-indigo-400/60" />
                <div className="text-center relative z-10">
                  <div className="text-[9px] text-slate-400">Processing</div>
                  <div className="text-[11px] font-bold">2.47B</div>
                </div>
              </div>
              <div className="flex-1 mx-3 relative h-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-fuchsia-500/40 to-fuchsia-400/70" />
                </div>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.9)]"
                    style={{ animation: `flow 2.5s linear infinite`, animationDelay: `${i * 0.7}s` }}
                  />
                ))}
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Delivered</div>
                <div className="text-lg font-bold text-fuchsia-400">11.8K /s</div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-3 pt-4 border-t border-white/10">
              {[
                ["Latency (P95)", "18.6s"],
                ["Throughput", "12.4K /s"],
                ["Error Rate", "0.03%"],
                ["Backpressure", "Low"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">{k}</div>
                  <div className="text-sm font-bold text-white mt-0.5">{v}</div>
                </div>
              ))}
            </div>
            <style>{`
              @keyframes flow { 0% { left: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
              @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
            `}</style>
          </div>
        </div>
      </section>

      {/* Bottom 3-up widgets */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity feed */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Recent Pipeline Activity</div>
          <div className="mt-3 overflow-hidden">
            <div className="grid grid-cols-[80px_1fr_1fr_80px_70px_50px] text-[10px] text-slate-500 font-semibold uppercase tracking-wide pb-2 border-b border-slate-100">
              <div>Time</div><div>Stage</div><div>Source</div><div>Status</div><div className="text-right">Records</div><div className="text-right">Dur</div>
            </div>
            <div className="divide-y divide-slate-50">
              {activityRows.map((r, i) => {
                const ok = r[3] === "Success";
                return (
                  <button key={i} onClick={() => openDrawer(`${r[1]} · ${r[2]}`, `${r[4]} records in ${r[5]}`)}
                    className="w-full grid grid-cols-[80px_1fr_1fr_80px_70px_50px] py-2 text-[11px] items-center hover:bg-slate-50 rounded transition text-left">
                    <div className="text-slate-500 tabular-nums">{r[0]}</div>
                    <div className="text-slate-800 font-medium">{r[1]}</div>
                    <div className="text-slate-700">{r[2]}</div>
                    <div>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        <span className={`h-1 w-1 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} />{r[3]}
                      </span>
                    </div>
                    <div className="text-right tabular-nums text-slate-900 font-medium">{r[4]}</div>
                    <div className="text-right tabular-nums text-slate-500">{r[5]}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <button className="mt-3 text-[11px] text-blue-600 font-semibold flex items-center gap-1 hover:underline">
            View full activity log <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Data gaps */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Top Data Gaps (Impact)</div>
          <div className="mt-3 space-y-2.5">
            {gapImpact.map((g) => {
              const sev = g.sev === "High" ? "rose" : g.sev === "Medium" ? "amber" : "blue";
              const t = toneMap[sev];
              return (
                <button key={g.label} onClick={() => openDrawer(g.label, `${g.sev} impact · ${g.pct}%`)}
                  className="block w-full text-left">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-700">{g.label}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${t.bg} ${t.text}`}>{g.sev}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${t.ring} transition-all`} style={{ width: `${g.pct * 3}%`, maxWidth: "100%" }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-900 tabular-nums w-8 text-right">{g.pct}%</span>
                  </div>
                </button>
              );
            })}
          </div>
          <button className="mt-3 text-[11px] text-blue-600 font-semibold flex items-center gap-1 hover:underline">
            View all gaps <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* SOW milestones */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">SOW Milestones</div>
          <div className="mt-3 space-y-2">
            {milestones.map(([ms, date, status, pct]) => {
              const st = status === "Complete" ? "emerald" : status === "In Progress" ? "blue" : "slate";
              return (
                <button key={ms as string} onClick={() => openDrawer(ms as string, `${status} · Target ${date}`)}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-800 font-medium truncate">{ms}</span>
                    <span className="text-slate-500 tabular-nums text-[10px]">{date}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${st === "emerald" ? "bg-emerald-500" : st === "blue" ? "bg-blue-500" : "bg-slate-300"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-[10px] font-semibold w-9 text-right ${st === "emerald" ? "text-emerald-600" : st === "blue" ? "text-blue-600" : "text-slate-400"}`}>{pct}%</span>
                  </div>
                </button>
              );
            })}
          </div>
          <button className="mt-3 text-[11px] text-blue-600 font-semibold flex items-center gap-1 hover:underline">
            View full execution plan <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </section>

      {/* Engineering drawer */}
      <Sheet open={drawer.open} onOpenChange={(o) => setDrawer((s) => ({ ...s, open: o }))}>
        <SheetContent side="right" className="w-full sm:max-w-[520px] p-0 flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">Engineering Drawer</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{drawer.title}</div>
              <div className="text-[12px] text-slate-500 mt-0.5">{drawer.subtitle}</div>
            </div>
            <button onClick={() => setDrawer({ open: false, title: "", subtitle: "" })} className="p-1 hover:bg-slate-100 rounded">
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
          <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-5 mt-3 self-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="engineering">Engineering</TabsTrigger>
              <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto p-5 pt-3">
              <TabsContent value="overview" className="space-y-3 mt-0">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Purpose</div>
                  <p className="text-[13px] text-slate-700 mt-1">Executive-facing rollup summarizing the operational health signal represented by this control.</p>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-3">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Why it matters</div>
                  <ul className="mt-2 space-y-1 text-[12px] text-slate-700 list-disc list-inside">
                    <li>Confirms SLO adherence for downstream consumers</li>
                    <li>Directly informs SRE decision plane confidence</li>
                    <li>Feeds agentic query grounding & readiness scores</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="engineering" className="space-y-3 mt-0">
                <div className="rounded-xl bg-slate-900 text-white p-3">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide">Processing sequence</div>
                  <div className="mt-2 space-y-2 text-[11px] font-mono">
                    {["ingress.receive(batch)","validator.enforce(contract_v4.2)","hydrator.enrich(cmdb, graph)","standardizer.canonicalize()","relationships.project(edges)","query.publish(views)"].map((s, i) => (
                      <div key={s} className="flex items-center gap-2">
                        <span className="text-emerald-400">{String(i + 1).padStart(2, "0")}</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {engineeringDetails.map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-slate-200 p-2">
                      <div className="text-[10px] text-slate-500">{k}</div>
                      <div className="text-[13px] font-semibold text-slate-900 tabular-nums">{v}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="telemetry" className="space-y-3 mt-0">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { k: "Queue depth", v: "214", i: Activity },
                    { k: "Worker utilization", v: "68%", i: Cpu },
                    { k: "CPU", v: "54%", i: Cpu },
                    { k: "Memory", v: "72%", i: HardDrive },
                    { k: "Latency p95", v: "18.6s", i: Clock },
                    { k: "Retry rate", v: "0.4%", i: RefreshCw },
                    { k: "Failures", v: "3", i: AlertTriangle },
                    { k: "API throughput", v: "12.4K/s", i: Network },
                  ].map(({ k, v, i: I }) => (
                    <div key={k} className="rounded-lg border border-slate-200 p-2 flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 grid place-items-center">
                        <I className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">{k}</div>
                        <div className="text-[13px] font-semibold text-slate-900 tabular-nums">{v}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="dependencies" className="space-y-3 mt-0">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Top Sources by Volume</div>
                  <ul className="space-y-1">
                    {topSources.map(([n, v]) => (
                      <li key={n} className="flex justify-between text-[12px] px-2 py-1.5 rounded hover:bg-slate-50">
                        <span className="text-slate-700">{n}</span>
                        <span className="tabular-nums font-semibold text-slate-900">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 text-[12px] space-y-1.5">
                  <div className="flex justify-between"><span className="text-slate-500">Owner</span><span className="text-slate-900 font-medium">Data Platform Team</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">SLA</span><span className="text-slate-900 font-medium">Freshness ≤ 6h · 99.5%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Contract</span><span className="text-slate-900 font-medium">v4.2</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Risk</span><span className="text-amber-600 font-medium">Moderate</span></div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}
