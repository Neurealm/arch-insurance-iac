import { useMemo, useState } from "react";
import {
  Database, ShieldCheck, Layers, Boxes, Archive, Ban, DollarSign, CheckCircle2,
  Filter, BookOpen, Download, RefreshCw, X, MoreVertical, Info, ArrowRight,
  Zap, Cloud, Clock, Share2, FileText, Gauge, Wind, Server, Cpu, Activity,
  TrendingUp, TrendingDown, Sparkles, Leaf, GitBranch, Workflow,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------- Tokens ---------- */
const toneMap = {
  violet:  { bg: "bg-violet-50",  text: "text-violet-600",  stroke: "#8b5cf6" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", stroke: "#10b981" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",    stroke: "#3b82f6" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",   stroke: "#f59e0b" },
  cyan:    { bg: "bg-cyan-50",    text: "text-cyan-600",    stroke: "#06b6d4" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-600",    stroke: "#14b8a6" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-600",    stroke: "#f43f5e" },
  slate:   { bg: "bg-slate-50",   text: "text-slate-600",   stroke: "#64748b" },
} as const;
type Tone = keyof typeof toneMap;

const KPIS: { icon: any; label: string; value: string; sub: string; delta: string; tone: Tone; spark: number[] }[] = [
  { icon: Database,    label: "Total Daily Ingest",              value: "2.47 TB", sub: "100% of scoped sources", delta: "+3.1%", tone: "violet",  spark: [2.0,2.1,2.2,2.3,2.35,2.4,2.47] },
  { icon: ShieldCheck, label: "Raw Data Left In Source",         value: "1.82 TB", sub: "73.7%",                  delta: "+1.4%", tone: "emerald", spark: [1.6,1.65,1.7,1.74,1.78,1.8,1.82] },
  { icon: Layers,      label: "Selective Cache / Delta",         value: "0.58 TB", sub: "23.5%",                  delta: "+2.0%", tone: "amber",   spark: [.48,.50,.52,.54,.56,.57,.58] },
  { icon: Boxes,       label: "Derived Operational Records",     value: "245.7M",  sub: "Generated (30d)",        delta: "+8.4%", tone: "teal",    spark: [180,195,210,222,232,240,246] },
  { icon: Archive,     label: "Vault / Normalized",              value: "0.05 TB", sub: "2.0%",                   delta: "0",     tone: "cyan",    spark: [.05,.05,.05,.05,.05,.05,.05] },
  { icon: Ban,         label: "Duplication Avoided",             value: "92.8%",   sub: "Est. of raw volume",     delta: "+0.6%", tone: "rose",    spark: [88,89,90,91,92,92.5,92.8] },
  { icon: DollarSign,  label: "Est. Infrastructure Savings",     value: "$1,960",  sub: "Storage + compute / mo", delta: "+$180", tone: "emerald", spark: [1400,1520,1640,1720,1820,1900,1960] },
  { icon: CheckCircle2,label: "Engineering Policy Compliance",   value: "100%",    sub: "0 policy violations",    delta: "steady",tone: "emerald", spark: [100,100,100,100,100,100,100] },
];

type Placement = "STAY IN SOURCE" | "EDGE CACHE / DELTA" | "24H DIFF REFRESH" | "VAULT / NORMALIZED" | "GRAPH PROJECTION" | "HOURLY DELTA" | "QUERY ON DEMAND";
const PLACEMENT_STYLE: Record<Placement, { bg: string; text: string }> = {
  "STAY IN SOURCE":     { bg: "bg-emerald-100", text: "text-emerald-700" },
  "EDGE CACHE / DELTA": { bg: "bg-amber-100",   text: "text-amber-700" },
  "24H DIFF REFRESH":   { bg: "bg-violet-100",  text: "text-violet-700" },
  "VAULT / NORMALIZED": { bg: "bg-cyan-100",    text: "text-cyan-700" },
  "GRAPH PROJECTION":   { bg: "bg-rose-100",    text: "text-rose-700" },
  "HOURLY DELTA":       { bg: "bg-blue-100",    text: "text-blue-700" },
  "QUERY ON DEMAND":    { bg: "bg-blue-100",    text: "text-blue-700" },
};

type Row = {
  name: string; sub: string; platform: string; domain: string; volume: string; change: string;
  access: string; placement: Placement; retention: string; derived: string; saved: string;
  cost: string; conf: number; iconTone: Tone;
};

const ROWS: Row[] = [
  { name: "panw_ngfw_traffic_raw",   sub: "NGFW Traffic Logs",       platform: "XSIAM",         domain: "Security",   volume: "1.12 TB", change: "48.6%", access: "Real-time",  placement: "STAY IN SOURCE",     retention: "90d",  derived: "1.4M/day", saved: "1.12 TB",  cost: "$1,240", conf: 95, iconTone: "amber"   },
  { name: "panw_ngfw_system_raw",    sub: "NGFW System Events",      platform: "XSIAM",         domain: "Security",   volume: "86.4 GB", change: "32.1%", access: "< 1 min",    placement: "EDGE CACHE / DELTA", retention: "7d",   derived: "412K/day", saved: "68.9 GB",  cost: "$210",   conf: 92, iconTone: "amber"   },
  { name: "firewall_threat_logs",    sub: "Threat / URL / Content",  platform: "XSIAM",         domain: "Security",   volume: "142.7 GB",change: "28.4%", access: "< 5 min",    placement: "EDGE CACHE / DELTA", retention: "14d",  derived: "984K/day", saved: "112.6 GB", cost: "$190",   conf: 90, iconTone: "slate"   },
  { name: "vpn_globalprotect_logs",  sub: "GlobalProtect VPN Logs",  platform: "XSIAM",         domain: "Network",    volume: "38.2 GB", change: "22.7%", access: "< 15 min",   placement: "24H DIFF REFRESH",   retention: "30d",  derived: "88K/day",  saved: "31.4 GB",  cost: "$120",   conf: 88, iconTone: "amber"   },
  { name: "gcp_billing_export",      sub: "GCP Billing Export",      platform: "BigQuery",      domain: "FinOps",     volume: "210.3 GB",change: "12.3%", access: "< 1 hr",     placement: "VAULT / NORMALIZED", retention: "180d", derived: "62K/day",  saved: "162 GB",   cost: "$160",   conf: 93, iconTone: "blue"    },
  { name: "gcp_cloud_audit_logs",    sub: "Cloud Audit Logs",        platform: "BigQuery",      domain: "Compliance", volume: "164.8 GB",change: "9.8%",  access: "< 15 min",   placement: "24H DIFF REFRESH",   retention: "90d",  derived: "58K/day",  saved: "132 GB",   cost: "$130",   conf: 90, iconTone: "blue"    },
  { name: "logicmonitor_device_stats",sub: "Device Performance Stats",platform: "LogicMonitor", domain: "Infra",      volume: "57.6 GB", change: "6.2%",  access: "< 5 min",    placement: "EDGE CACHE / DELTA", retention: "7d",   derived: "241K/day", saved: "44.8 GB",  cost: "$105",   conf: 94, iconTone: "emerald" },
  { name: "logicmonitor_alerts",     sub: "Infrastructure Alerts",   platform: "LogicMonitor",  domain: "Infra",      volume: "3.1 GB",  change: "25.6%", access: "< 5 min",    placement: "24H DIFF REFRESH",   retention: "30d",  derived: "18K/day",  saved: "2.4 GB",   cost: "$60",    conf: 92, iconTone: "emerald" },
  { name: "datadog_metrics",         sub: "Datadog Metrics & Events",platform: "MCP Tools",     domain: "Observability",volume:"95.4 GB",change: "18.3%", access: "< 1 min",    placement: "HOURLY DELTA",       retention: "3d",   derived: "812K/day", saved: "78.6 GB",  cost: "$75",    conf: 88, iconTone: "violet"  },
  { name: "k8s_cluster_logs",        sub: "Kubernetes Cluster Logs", platform: "Internal APIs", domain: "Platform",   volume: "78.9 GB", change: "15.1%", access: "< 5 min",    placement: "GRAPH PROJECTION",   retention: "30d",  derived: "1.1M/day", saved: "62.1 GB",  cost: "$70",    conf: 87, iconTone: "cyan"    },
];

const RATIONALE = [
  { label: "Volume",                 score: 96 },
  { label: "Access Frequency",       score: 88 },
  { label: "Latency Sensitivity",    score: 92 },
  { label: "Retention Need",         score: 40 },
  { label: "Operational Criticality",score: 94 },
  { label: "Business Value",         score: 90 },
  { label: "Graph Requirement",      score: 55 },
  { label: "AI Usage",               score: 78 },
  { label: "Storage Cost Impact",    score: 98 },
];

const WHY_CARDS = [
  { icon: Zap,        title: "Avoid Massive Data Movement", tone: "violet" as Tone, blurb: "High-volume logs stay in the source system." },
  { icon: DollarSign, title: "Optimize Storage",            tone: "emerald" as Tone, blurb: "Store only what's needed, only as long as needed." },
  { icon: ShieldCheck,title: "Preserve Source Authority",   tone: "blue" as Tone,    blurb: "Raw record remains immutable and authoritative." },
  { icon: Wind,       title: "Improve Freshness",           tone: "cyan" as Tone,    blurb: "Query in place or delta based on change rate." },
  { icon: Gauge,      title: "Reduce Network Traffic",      tone: "amber" as Tone,   blurb: "No shadow copies means less egress." },
  { icon: Cpu,        title: "Lower Compute Cost",          tone: "teal" as Tone,    blurb: "Derived records are cheaper than full lakes." },
  { icon: Activity,   title: "Enable Real-Time Query",      tone: "rose" as Tone,    blurb: "Native indexes beat replicated ones." },
  { icon: Leaf,       title: "Sustainability",              tone: "emerald" as Tone, blurb: "Less duplication ⇒ less energy & carbon." },
];

const PLACEMENT_DIST = [
  { label: "Stay in Source",       pct: 73.7, color: "#10b981" },
  { label: "Edge Cache / Delta",   pct: 15.4, color: "#f59e0b" },
  { label: "24h Differential",     pct: 6.1,  color: "#8b5cf6" },
  { label: "Hourly Delta",         pct: 2.0,  color: "#3b82f6" },
  { label: "Vault / Normalized",   pct: 2.0,  color: "#06b6d4" },
  { label: "Graph Projection",     pct: 0.3,  color: "#f43f5e" },
  { label: "Derived Records",      pct: 0.3,  color: "#14b8a6" },
  { label: "Excluded",             pct: 0.2,  color: "#94a3b8" },
];

const PIPELINE = [
  "Raw Source","Metadata Collection","Usage Analytics","Access Frequency","Cost Analysis",
  "Freshness Analysis","Relationship Detection","Hydration Decision","Graph Decision",
  "Derived Record Engine","Operational Platform",
];

const ALGO = [
  { icon: Boxes,       label: "Source Profile",         note: "signals × 12" },
  { icon: BookOpen,    label: "Policy Rules",           note: "42 rules" },
  { icon: Clock,       label: "Retention Rules",        note: "8 tiers" },
  { icon: Layers,      label: "Hydration Rules",        note: "conditional" },
  { icon: GitBranch,   label: "Relationship Analysis",  note: "graph density" },
  { icon: DollarSign,  label: "Cost Optimizer",         note: "$/GB · $/scan" },
  { icon: Wind,        label: "Freshness Optimizer",    note: "SLA-aware" },
  { icon: Server,      label: "Storage Optimizer",      note: "tier match" },
  { icon: Sparkles,    label: "Decision Scoring",       note: "weighted composite" },
  { icon: Workflow,    label: "Placement Recommendation",note: "1 of 8 tiers" },
];

const STRATEGIES: { name: string; icon: any; tone: Tone; retention: string; storage: string; refresh: string; access: string; use: string; tradeoff: string }[] = [
  { name: "Stay in Source",     icon: CheckCircle2, tone: "emerald", retention: "Source native", storage: "0",     refresh: "n/a",       access: "Query on demand", use: "Massive, real-time logs",            tradeoff: "Source-side query cost" },
  { name: "Query on Demand",    icon: Cloud,        tone: "blue",    retention: "None local",   storage: "0",      refresh: "on request",access: "Real-time",       use: "Rare / ad-hoc queries",              tradeoff: "Higher per-query latency" },
  { name: "Edge Cache",         icon: Layers,       tone: "amber",   retention: "3–14 days",    storage: "hot",    refresh: "streaming", access: "Fast local query",use: "Metrics, alerts, recent windows",    tradeoff: "Cache staleness risk" },
  { name: "24h Differential",   icon: Clock,        tone: "violet",  retention: "7–90 days",    storage: "warm",   refresh: "24h delta", access: "Cached / hydrated",use: "Audit, VPN, correlation",            tradeoff: "Not real-time" },
  { name: "Hourly Delta",       icon: RefreshCw,    tone: "blue",    retention: "3–30 days",    storage: "hot",    refresh: "1h",        access: "Near-real-time",  use: "Time-series, anomaly detection",     tradeoff: "Compute overhead" },
  { name: "Derived Record",     icon: Boxes,        tone: "teal",    retention: "As needed",    storage: "small",  refresh: "event-driven",access: "Direct object",  use: "Entities, canonical events",         tradeoff: "Requires modeling" },
  { name: "Vault / Normalized", icon: Archive,      tone: "cyan",    retention: "90–365 days",  storage: "warm",   refresh: "batch",     access: "Analytics queries",use: "Billing, reports, joins",           tradeoff: "Slower ingest" },
  { name: "Graph Projection",   icon: Share2,       tone: "rose",    retention: "30–90 days",   storage: "graph",  refresh: "event",     access: "Graph queries",   use: "Topology, relational lookup",        tradeoff: "Graph maintenance cost" },
];

/* ---------- Primitives ---------- */
function Sparkline({ data, color = "#8b5cf6" }: { data: number[]; color?: string }) {
  const w = 92, h = 26;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i/(data.length-1))*w},${h-((v-min)/range)*h}`).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polygon fill={color} opacity={0.1} points={area} />
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} />
    </svg>
  );
}

/* ---------- Page ---------- */
export default function NoDuplicationStrategyAndRetentionPolicy() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [drawer, setDrawer] = useState<null | { title: string; subtitle?: string; kind: string }>(null);
  const openDrawer = (title: string, kind: string, subtitle?: string) => setDrawer({ title, kind, subtitle });
  const selected = ROWS[selectedIdx];

  const donutCircum = 2 * Math.PI * 52;
  const donutOffsets = useMemo(() => {
    let acc = 0;
    return PLACEMENT_DIST.map(d => {
      const len = (d.pct/100) * donutCircum;
      const seg = { color: d.color, len, offset: donutCircum - acc };
      acc += len;
      return seg;
    });
  }, [donutCircum]);

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      {/* Header */}
      <header className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 leading-tight">No Duplication Strategy & Retention Policy</h1>
          <p className="text-[13px] text-slate-600 mt-1">Intelligently minimize data movement while maximizing trusted operational outcomes.</p>
          <p className="text-[11px] text-slate-500 mt-0.5 max-w-3xl">Every source is evaluated to determine whether it should remain in place, be queried on demand, cached temporarily, hydrated into derived records, normalized, or projected into graph structures.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-3">
            <div className="text-[10px] text-slate-500">Last Updated</div>
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700">
              May 12, 2026 · 10:32 AM
              <button className="p-1 hover:bg-slate-100 rounded"><RefreshCw className="h-3 w-3 text-slate-500" /></button>
            </div>
          </div>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] text-slate-700 shadow-sm">
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
          <button onClick={() => openDrawer("Policy Library", "policy", "42 active rules · v4.2")} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] text-slate-700 shadow-sm">
            <BookOpen className="h-3.5 w-3.5" /> Policy Library
          </button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-[12px] shadow-sm">
            <Download className="h-3.5 w-3.5" /> Export Policy
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-8 gap-2.5 mb-5">
        {KPIS.map(k => {
          const t = toneMap[k.tone];
          const Icon = k.icon;
          const up = k.delta.startsWith("+");
          const flat = k.delta === "0" || k.delta === "steady";
          return (
            <button
              key={k.label}
              onClick={() => openDrawer(k.label, "kpi", k.sub)}
              className="text-left group bg-white rounded-xl border border-slate-200 shadow-sm p-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`h-8 w-8 rounded-lg ${t.bg} ${t.text} grid place-items-center`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-[9.5px] font-medium inline-flex items-center gap-0.5 ${up ? "text-emerald-600" : flat ? "text-slate-400" : "text-rose-600"}`}>
                  {up ? <TrendingUp className="h-2.5 w-2.5" /> : flat ? null : <TrendingDown className="h-2.5 w-2.5" />} {k.delta}
                </span>
              </div>
              <div className="mt-2 text-[10px] text-slate-500 font-medium leading-tight">{k.label}</div>
              <div className="mt-0.5 text-[18px] font-bold text-slate-900 leading-none tabular-nums">{k.value}</div>
              <div className="mt-1.5 flex items-end justify-between gap-1">
                <div className="text-[10px] text-emerald-600 font-medium tabular-nums truncate">{k.sub}</div>
                <Sparkline data={k.spark} color={t.stroke} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-12 gap-3 mb-3">
        {/* LEFT: Matrix */}
        <section className="col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-slate-800">Intelligent Data Placement Matrix</h2>
            <div className="text-[10.5px] text-slate-500">Select any row to reveal engineering rationale →</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11.5px]">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-3 py-2.5 font-medium w-8">#</th>
                  <th className="text-left px-2 py-2.5 font-medium">Source</th>
                  <th className="text-left px-2 py-2.5 font-medium">Platform</th>
                  <th className="text-right px-2 py-2.5 font-medium">Volume</th>
                  <th className="text-right px-2 py-2.5 font-medium">Δ 24h</th>
                  <th className="text-left px-2 py-2.5 font-medium">Access</th>
                  <th className="text-left px-2 py-2.5 font-medium">Placement</th>
                  <th className="text-left px-2 py-2.5 font-medium">Retention</th>
                  <th className="text-right px-2 py-2.5 font-medium">Duplicate Avoided</th>
                  <th className="text-right px-2 py-2.5 font-medium">Est $/mo saved</th>
                  <th className="text-right px-2 py-2.5 font-medium">Conf.</th>
                  <th className="px-2 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => {
                  const iconTone = toneMap[r.iconTone];
                  const isSel = selectedIdx === i;
                  const p = PLACEMENT_STYLE[r.placement];
                  return (
                    <tr
                      key={r.name}
                      onClick={() => setSelectedIdx(i)}
                      className={`border-b border-slate-50 cursor-pointer transition ${isSel ? "bg-blue-50/60" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-3 py-2 text-slate-400 tabular-nums">{i + 1}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-md ${iconTone.bg} grid place-items-center shrink-0`}>
                            <Database className={`h-3 w-3 ${iconTone.text}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-mono text-[11px] font-medium text-slate-800 truncate">{r.name}</div>
                            <div className="text-[9.5px] text-slate-500 truncate">{r.sub}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-slate-700">{r.platform}</td>
                      <td className="text-right px-2 py-2 tabular-nums text-slate-800 font-medium">{r.volume}</td>
                      <td className="text-right px-2 py-2 tabular-nums text-slate-600">{r.change}</td>
                      <td className="px-2 py-2 text-slate-700">{r.access}</td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide ${p.bg} ${p.text}`}>{r.placement}</span>
                      </td>
                      <td className="px-2 py-2 text-slate-700">{r.retention}</td>
                      <td className="text-right px-2 py-2 tabular-nums text-emerald-600 font-medium">{r.saved}</td>
                      <td className="text-right px-2 py-2 tabular-nums text-slate-800 font-medium">{r.cost}</td>
                      <td className="text-right px-2 py-2 tabular-nums font-medium text-emerald-600">{r.conf}%</td>
                      <td className="px-2 py-2">
                        <button onClick={(e) => { e.stopPropagation(); openDrawer(r.name, "source", `${r.placement} · ${r.retention}`); }} className="p-1 rounded hover:bg-slate-100">
                          <MoreVertical className="h-3.5 w-3.5 text-slate-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div>Showing 1 to {ROWS.length} of 122 sources</div>
            <div className="flex items-center gap-1">
              <span>Rows:</span>
              <select className="border border-slate-200 rounded px-1.5 py-0.5 text-[11px]"><option>10</option></select>
              <div className="ml-3 flex items-center gap-0.5">
                {["1","2","3","…","13"].map(p => (
                  <button key={p} className={`h-6 min-w-[24px] px-1.5 rounded text-[11px] ${p==="1" ? "bg-blue-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: rationale + why + donut */}
        <aside className="col-span-4 space-y-3">
          {/* Selected + Rationale */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Selected Source</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-6 w-6 rounded-md ${toneMap[selected.iconTone].bg} grid place-items-center`}>
                    <Database className={`h-3.5 w-3.5 ${toneMap[selected.iconTone].text}`} />
                  </div>
                  <div>
                    <div className="font-mono text-[12px] font-semibold text-slate-900">{selected.name}</div>
                    <div className="text-[10px] text-slate-500">{selected.platform} · {selected.volume}</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider text-emerald-600 font-semibold">Recommended</div>
                <div className={`mt-1 inline-flex rounded-md px-2 py-1 text-[10.5px] font-semibold ${PLACEMENT_STYLE[selected.placement].bg} ${PLACEMENT_STYLE[selected.placement].text}`}>
                  {selected.placement}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-[10.5px]">
              {[
                ["Storage saved", selected.saved],
                ["Retention",     selected.retention],
                ["Derived recs",  selected.derived],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md bg-slate-50 p-2">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">{k}</div>
                  <div className="tabular-nums font-medium text-slate-800">{v}</div>
                </div>
              ))}
            </div>

            <div className="mt-2 mb-2 text-[11px] font-semibold text-slate-700">Engineering Decision Rationale</div>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {RATIONALE.map(r => (
                <button
                  key={r.label}
                  onClick={() => openDrawer(r.label, "rationale", `Score ${r.score} / 100`)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center justify-between text-[10.5px] mb-0.5">
                    <span className="text-slate-600">{r.label}</span>
                    <span className="tabular-nums font-medium text-slate-700">{r.score}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${r.score >= 90 ? "bg-emerald-500" : r.score >= 70 ? "bg-amber-500" : "bg-slate-400"}`}
                      style={{ width: `${r.score}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Why we don't duplicate */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-[12px] font-semibold text-slate-800 mb-2">Why We Don't Duplicate Everything</div>
            <div className="grid grid-cols-2 gap-2">
              {WHY_CARDS.map(c => {
                const t = toneMap[c.tone];
                const Icon = c.icon;
                return (
                  <button
                    key={c.title}
                    onClick={() => openDrawer(c.title, "why", c.blurb)}
                    className="text-left flex items-start gap-2 p-2 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition"
                  >
                    <div className={`h-7 w-7 rounded-md ${t.bg} ${t.text} grid place-items-center shrink-0`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10.5px] font-semibold text-slate-800 leading-tight">{c.title}</div>
                      <div className="text-[9.5px] text-slate-500 leading-snug">{c.blurb}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Placement distribution donut */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-[12px] font-semibold text-slate-800 mb-2">Data Volume by Placement</div>
            <div className="flex items-center gap-3">
              <div className="relative w-[120px] h-[120px] shrink-0">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                  {donutOffsets.map((s, i) => (
                    <circle key={i} cx="60" cy="60" r="52" fill="none" stroke={s.color} strokeWidth="14"
                      strokeDasharray={`${s.len} ${donutCircum}`} strokeDashoffset={-(donutCircum - s.offset)} />
                  ))}
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <div className="text-[16px] font-bold text-slate-900 leading-none">2.47 TB</div>
                    <div className="text-[9px] text-slate-500 uppercase">Daily Ingest</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                {PLACEMENT_DIST.map(d => (
                  <div key={d.label} className="flex items-center gap-1.5 text-[10px]">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-slate-600 flex-1 truncate">{d.label}</span>
                    <span className="tabular-nums text-slate-800 font-medium">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ============ ENGINEERING TRANSPARENCY ZONE ============ */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-800 shadow-lg text-slate-100 p-5 mb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-blue-300 font-semibold">Engineering Transparency</div>
            <h2 className="text-[18px] font-bold">How the No Duplication Engine Works</h2>
          </div>
          <div className="text-[10px] text-slate-400">Raw remains authoritative — derived remains minimal.</div>
        </div>

        {/* Preservation Pipeline */}
        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700 mb-3">
          <div className="text-[11px] font-semibold text-slate-300 mb-3">Intelligent Data Preservation Pipeline</div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {PIPELINE.map((step, i) => (
              <div key={step} className="flex items-center shrink-0">
                <button
                  onClick={() => openDrawer(step, "pipeline", `Stage ${i+1} of ${PIPELINE.length}`)}
                  className="px-2.5 py-2 rounded-md bg-slate-800 border border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition text-[10.5px] font-medium text-slate-200 whitespace-nowrap"
                >
                  <div className="text-[9px] text-blue-400 mb-0.5">{String(i+1).padStart(2,"0")}</div>
                  {step}
                </button>
                {i < PIPELINE.length - 1 && (
                  <div className="relative w-4 h-px bg-slate-600 mx-0.5">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Algorithm */}
          <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
            <div className="text-[11px] font-semibold text-slate-300 mb-3">Engineering Decision Engine</div>
            <div className="space-y-1.5">
              {ALGO.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => openDrawer(s.label, "algo", s.note)}
                    className="w-full flex items-center gap-3 p-2 rounded-md bg-slate-800/70 border border-slate-700 hover:border-blue-500 transition"
                  >
                    <div className="h-6 w-6 rounded bg-blue-500/20 grid place-items-center">
                      <Icon className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[11px] text-slate-200">{s.label}</div>
                      <div className="text-[9px] text-slate-500 font-mono truncate">{s.note}</div>
                    </div>
                    <span className="text-[9px] text-slate-500">{i+1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Derived Record Visualization — signature visual */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold text-slate-300">Derived Record Creation</div>
              <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> live
              </span>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
              {/* Raw */}
              <div className="rounded-md border border-slate-700 bg-slate-800/60 p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Immutable Raw</span>
                  <span className="text-[8px] text-emerald-400 bg-emerald-500/10 px-1 rounded">never modified</span>
                </div>
                <div className="font-mono text-[9px] text-slate-300 space-y-0.5 leading-relaxed">
                  <div><span className="text-blue-400">"time":</span> "10:32:04Z"</div>
                  <div><span className="text-blue-400">"src_ip":</span> "10.0.4.12"</div>
                  <div><span className="text-blue-400">"dst_ip":</span> "8.8.8.8"</div>
                  <div><span className="text-blue-400">"bytes":</span> 148240</div>
                  <div><span className="text-blue-400">"action":</span> "allow"</div>
                  <div><span className="text-blue-400">"rule":</span> "R-241"</div>
                </div>
                <div className="mt-2 text-[9px] text-slate-500">Kept in Cortex XSIAM</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ArrowRight className="h-4 w-4 text-blue-400 animate-pulse" />
                <div className="text-[8px] text-blue-300 rotate-0 whitespace-nowrap">enrich</div>
              </div>
              {/* Derived */}
              <div className="rounded-md border border-teal-500/40 bg-teal-500/5 p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-teal-300 font-semibold">Derived Operational</span>
                  <span className="text-[8px] text-teal-300 bg-teal-500/10 px-1 rounded">new record</span>
                </div>
                <div className="font-mono text-[9px] text-slate-300 space-y-0.5 leading-relaxed">
                  <div><span className="text-teal-400">"entity_id":</span> "site.dfw-01"</div>
                  <div><span className="text-teal-400">"device_id":</span> "fw.dfw.n3"</div>
                  <div><span className="text-teal-400">"tenant":</span> "corp.us"</div>
                  <div><span className="text-teal-400">"confidence":</span> 0.96</div>
                  <div><span className="text-teal-400">"canonical":</span> "flow.allow"</div>
                  <div><span className="text-teal-400">"graph_id":</span> "g:site→device"</div>
                </div>
                <div className="mt-2 text-[9px] text-slate-500">~ 240 bytes · vault + graph</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5 text-[9.5px]">
              {[
                ["Raw preserved",   "1.12 TB / day"],
                ["Derived created", "1.4M rec / day"],
                ["Duplicate avoided","99.97%"],
                ["Vault footprint", "336 MB / day"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between bg-slate-800/60 rounded px-2 py-1.5">
                  <span className="text-slate-500 uppercase tracking-wider text-[8.5px]">{k}</span>
                  <span className="text-slate-100 tabular-nums font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Simulator */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold text-slate-300">Data Preservation Simulator</div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> streaming
              </span>
            </div>
            <div className="space-y-1 mb-3 text-[10.5px] font-mono">
              {[
                { t: "10:32:04", m: "ingest panw_ngfw_traffic_raw · 12.4K rows/s", c: "text-slate-400" },
                { t: "10:32:04", m: "policy → STAY_IN_SOURCE (conf 95%)",           c: "text-emerald-300" },
                { t: "10:32:05", m: "extract metadata · 214 attrs",                  c: "text-blue-300" },
                { t: "10:32:05", m: "derive record · site → device → flow",          c: "text-teal-300" },
                { t: "10:32:06", m: "graph project · +32 edges",                     c: "text-rose-300" },
              ].map((l, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-slate-500">{l.t}</span>
                  <span className={l.c}>{l.m}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {[
                ["Rows/sec",         "12.4K"],
                ["Latency",          "82 ms"],
                ["Cache Util.",      "68%"],
                ["Storage Saved",    "1.12 TB"],
                ["CPU",              "38%"],
                ["Memory",           "1.4 GB"],
                ["Queue Depth",      "0"],
                ["Duplicate Avoided","99.97%"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between bg-slate-800/60 rounded px-2 py-1.5">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px]">{k}</span>
                  <span className="text-slate-100 tabular-nums font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Retention Policy Matrix */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-3">
        <div className="text-[12px] font-semibold text-slate-800 mb-3">Retention Policy Matrix (By Placement Type)</div>
        <div className="grid grid-cols-4 gap-2">
          {STRATEGIES.map(s => {
            const t = toneMap[s.tone];
            const Icon = s.icon;
            return (
              <button
                key={s.name}
                onClick={() => openDrawer(s.name, "strategy", s.use)}
                className="text-left flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition"
              >
                <div className={`h-8 w-8 rounded-md ${t.bg} ${t.text} grid place-items-center shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11.5px] font-semibold text-slate-800">{s.name}</div>
                  <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9.5px] text-slate-500">
                    <div>Retention: <span className="text-slate-700">{s.retention}</span></div>
                    <div>Storage: <span className="text-slate-700">{s.storage}</span></div>
                    <div>Refresh: <span className="text-slate-700">{s.refresh}</span></div>
                    <div>Access: <span className="text-slate-700">{s.access}</span></div>
                  </div>
                  <div className="mt-1.5 text-[9.5px] text-slate-500 leading-snug">Use: <span className="text-slate-700">{s.use}</span></div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Bottom widgets */}
      <section className="grid grid-cols-8 gap-2 mb-3">
        {[
          { label: "Storage Savings",       v: "24.3 TB/mo",   tone: "emerald" as Tone, icon: Archive },
          { label: "Network Savings",       v: "18.6 TB/mo",   tone: "blue" as Tone,    icon: Wind },
          { label: "Compute Savings",       v: "$48K/mo",      tone: "emerald" as Tone, icon: Cpu },
          { label: "Carbon Reduction",      v: "1.2 tCO₂",     tone: "teal" as Tone,    icon: Leaf },
          { label: "Derived Record Growth", v: "+8.4% wk",     tone: "teal" as Tone,    icon: Boxes },
          { label: "Top Left-In-Place",     v: "XSIAM · 1.4TB",tone: "violet" as Tone,  icon: ShieldCheck },
          { label: "Policy Violations",     v: "0",            tone: "emerald" as Tone, icon: CheckCircle2 },
          { label: "Recent Policy Changes", v: "6",            tone: "amber" as Tone,   icon: FileText },
        ].map(w => {
          const t = toneMap[w.tone];
          const Icon = w.icon;
          return (
            <button
              key={w.label}
              onClick={() => openDrawer(w.label, "widget")}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
            >
              <div className={`h-7 w-7 rounded-md ${t.bg} ${t.text} grid place-items-center mb-2`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="text-[15px] font-bold text-slate-900 tabular-nums leading-none">{w.v}</div>
              <div className="text-[9.5px] text-slate-500 mt-1 uppercase tracking-wider">{w.label}</div>
            </button>
          );
        })}
      </section>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
        <span className="flex items-center gap-1.5">
          <Info className="h-3 w-3" />
          Raw operational telemetry remains authoritative in its source systems. Only the minimum derived data is created.
        </span>
        <div className="flex items-center gap-6">
          <div>Environment: <span className="text-slate-700 font-medium">Production</span></div>
          <div>Alex Morgan · <span className="text-slate-700 font-medium">Lead Platform Architect</span></div>
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-[30vw] min-w-[420px] sm:max-w-none overflow-y-auto">
          {drawer && <DrawerContents title={drawer.title} subtitle={drawer.subtitle} onClose={() => setDrawer(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ---------- Drawer ---------- */
function DrawerContents({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  const [volume, setVolume] = useState(70);
  const [refresh, setRefresh] = useState(40);
  const [retention, setRet] = useState(30);
  const [crit, setCrit] = useState(80);
  const [rel, setRel] = useState(50);
  const [ai, setAi] = useState(65);

  const rec = crit > 85 ? "STAY IN SOURCE" : rel > 70 ? "GRAPH PROJECTION" : refresh > 70 ? "HOURLY DELTA" : retention > 70 ? "VAULT / NORMALIZED" : "EDGE CACHE / DELTA";
  const composite = Math.min(100, Math.round((volume*0.22 + crit*0.20 + refresh*0.14 + (100-retention)*0.12 + rel*0.10 + ai*0.10) + 10));

  return (
    <>
      <SheetHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">Engineering Drawer</div>
            <SheetTitle className="text-[18px]">{title}</SheetTitle>
            {subtitle && <div className="text-[12px] text-slate-500 mt-1">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="h-4 w-4 text-slate-500" /></button>
        </div>
      </SheetHeader>

      <Tabs defaultValue="overview" className="mt-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engineering">Engineering</TabsTrigger>
          <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
          <TabsTrigger value="sim">Simulation</TabsTrigger>
          <TabsTrigger value="deps">Deps</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-3 text-[12px]">
          <DrawerBlock label="Policy Summary" text="Raw data remains in its source system; only derived operational records are created." />
          <DrawerBlock label="Operational Impact" text="Preserves incident detection SLA; avoids $52K/mo egress; keeps SREOps agent latency < 300ms." />
          <DrawerBlock label="Savings" text="1.12 TB/day duplication avoided · $1,240/mo storage saved · 1.2 tCO₂/yr avoided." />
          <DrawerBlock label="Consumers" text="SREOps Agent · Incident Copilot · Compliance Reporter · FinOps" />
        </TabsContent>

        <TabsContent value="engineering" className="mt-4 space-y-3 text-[12px]">
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Decision Engine</div>
            <div className="space-y-1.5">
              {["Metadata extraction","Storage optimizer","Hydration engine","Derived record builder","Relationship engine","Graph projection","Refresh optimizer","Policy evaluation","Cost optimizer","Freshness engine"].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-blue-100 text-blue-700 text-[10px] grid place-items-center font-semibold">{i+1}</div>
                  <div className="flex-1 text-slate-700">{s}</div>
                  <div className="w-16 h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse" style={{ width: `${68 + (i*4)%28}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DrawerBlock label="Policy Evaluation" text="42 rules · 12 threshold gates · 8 regulatory constraints. Version-pinned, rollback-safe." />
        </TabsContent>

        <TabsContent value="telemetry" className="mt-4 space-y-2 text-[12px]">
          {[
            ["Bytes evaluated","1.12 TB / day"],
            ["Rows/sec","12,438"],
            ["Cache utilization","68%"],
            ["Storage saved","1.12 TB"],
            ["Network avoided","892 GB"],
            ["Latency","82 ms p95"],
            ["Hydration rate","24 rec/s"],
            ["Graph generation","32 edges/s"],
            ["Queue depth","0"],
            ["CPU","38%"],
            ["Memory","1.4 GB"],
            ["Throughput","28 MB/s"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-500">{k}</span>
              <span className="font-mono font-medium text-slate-800">{v}</span>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="sim" className="mt-4 space-y-3 text-[12px]">
          <div className="text-[11px] text-slate-500">Adjust signals to see the placement change live.</div>
          {[
            { label: "Volume",              v: volume,    set: setVolume },
            { label: "Refresh SLA",         v: refresh,   set: setRefresh },
            { label: "Retention",           v: retention, set: setRet },
            { label: "Business Criticality",v: crit,      set: setCrit },
            { label: "Relationship Density",v: rel,       set: setRel },
            { label: "AI Usage",            v: ai,        set: setAi },
          ].map(s => (
            <div key={s.label}>
              <div className="flex items-center justify-between text-[10.5px] mb-1">
                <span className="text-slate-600">{s.label}</span>
                <span className="tabular-nums text-slate-800 font-medium">{s.v}</span>
              </div>
              <input type="range" min={0} max={100} value={s.v} onChange={(e) => s.set(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
          ))}
          <div className="mt-3 rounded-lg border border-slate-200 p-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Recommended Placement</div>
                <div className={`mt-1 inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${(PLACEMENT_STYLE as any)[rec]?.bg ?? "bg-slate-100"} ${(PLACEMENT_STYLE as any)[rec]?.text ?? "text-slate-700"}`}>{rec}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Composite</div>
                <div className="text-[20px] font-bold text-emerald-600 tabular-nums">{composite}</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deps" className="mt-4 space-y-3 text-[12px]">
          <DrawerBlock label="Source Systems" text="Cortex XSIAM · BigQuery · LogicMonitor · Datadog · Kubernetes" />
          <DrawerBlock label="Storage" text="Iceberg (warm) · S3 Glacier (cold) · Neo4j (graph) · pgvector (embeddings)" />
          <DrawerBlock label="Hydration / Metadata" text="Debezium CDC · OpenLineage · custom canonical builder v4.2" />
          <DrawerBlock label="Consumers" text="SREOps Agent · Incident Copilot · FinOps · Compliance Reporter" />
          <DrawerBlock label="Ownership / Risk" text="Owner: Platform Eng · Risk: Low · 0 policy violations 30d" />
        </TabsContent>
      </Tabs>
    </>
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
