import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Gauge, ShieldCheck, Sparkles,
  Filter, Download, Play, Search, ChevronRight, Info, Database, Cloud, Shield, Activity,
  Cpu, Workflow, Zap, Server, Timer, Radio, Layers, GitBranch, Boxes, Network, CalendarClock,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tone = "blue" | "emerald" | "amber" | "violet" | "rose" | "cyan" | "slate" | "teal";
const tone = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",    ring: "ring-blue-200",    hex: "#3b82f6" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200", hex: "#10b981" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",   ring: "ring-amber-200",   hex: "#f59e0b" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-600",  ring: "ring-violet-200",  hex: "#8b5cf6" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-600",    ring: "ring-rose-200",    hex: "#f43f5e" },
  cyan:    { bg: "bg-cyan-50",    text: "text-cyan-600",    ring: "ring-cyan-200",    hex: "#06b6d4" },
  slate:   { bg: "bg-slate-50",   text: "text-slate-600",   ring: "ring-slate-200",   hex: "#64748b" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-600",    ring: "ring-teal-200",    hex: "#14b8a6" },
} as const;

const KPIS = [
  { icon: Clock,        label: "Scheduled Jobs",              value: "122",   sub: "100% coverage",     delta: "+4",   tone: "blue"    as Tone, spark: [110,114,116,118,120,121,122] },
  { icon: CheckCircle2, label: "Successful Executions (24h)", value: "108",   sub: "88.5% success",     delta: "+3",   tone: "emerald" as Tone, spark: [98,100,102,104,106,107,108] },
  { icon: AlertTriangle,label: "Warning / Stale",             value: "11",    sub: "9.0% above SLA",    delta: "-1",   tone: "amber"   as Tone, spark: [14,13,13,12,12,11,11] },
  { icon: XCircle,      label: "Failed Jobs",                 value: "3",     sub: "2.5% fail rate",    delta: "-2",   tone: "rose"    as Tone, spark: [6,5,5,4,4,3,3] },
  { icon: RefreshCw,    label: "Retry Attempts",              value: "27",    sub: "2.7 avg / job",     delta: "+5",   tone: "violet"  as Tone, spark: [18,20,22,24,25,26,27] },
  { icon: Gauge,        label: "Median Freshness",            value: "28m",   sub: "Target < 60m",      delta: "-3m",  tone: "cyan"    as Tone, spark: [36,34,32,31,30,29,28] },
  { icon: ShieldCheck,  label: "SLA Compliance",              value: "91.8%", sub: "SLA target 95%",    delta: "+0.6", tone: "emerald" as Tone, spark: [89,89.5,90,90.6,91.1,91.4,91.8] },
  { icon: Sparkles,     label: "Adaptive Optimizations",      value: "46",    sub: "Last 24h",          delta: "+11",  tone: "violet"  as Tone, spark: [30,32,36,38,40,44,46] },
];

type Strategy = "Query on Demand" | "15 Min Refresh" | "30 Min Refresh" | "Hourly Delta" | "6 Hour Refresh" | "24 HR Diff Refresh" | "Daily Snapshot" | "Streaming" | "Event Driven" | "Adaptive";
const strategyStyle: Record<Strategy, { bg: string; text: string }> = {
  "Query on Demand":     { bg: "bg-blue-50",    text: "text-blue-700" },
  "15 Min Refresh":      { bg: "bg-emerald-50", text: "text-emerald-700" },
  "30 Min Refresh":      { bg: "bg-teal-50",    text: "text-teal-700" },
  "Hourly Delta":        { bg: "bg-violet-50",  text: "text-violet-700" },
  "6 Hour Refresh":      { bg: "bg-cyan-50",    text: "text-cyan-700" },
  "24 HR Diff Refresh":  { bg: "bg-amber-50",   text: "text-amber-700" },
  "Daily Snapshot":      { bg: "bg-slate-100",  text: "text-slate-700" },
  "Streaming":           { bg: "bg-rose-50",    text: "text-rose-700" },
  "Event Driven":        { bg: "bg-purple-50",  text: "text-purple-700" },
  "Adaptive":            { bg: "bg-indigo-50",  text: "text-indigo-700" },
};

type Row = {
  name: string; desc: string; domain: string; platform: string; icon: any; iconTone: Tone;
  method: string; strategy: Strategy; pattern: string;
  nextRun: string; lastRun: string; freshness: string; latency: number;
  retries: number; failures: number; priority: "P1" | "P2" | "P3"; backpressure: number;
  status: "Success" | "Warning" | "Failed" | "On Demand"; confidence: number;
};

const ROWS: Row[] = [
  { name:"panw_ngfw_traffic_raw", desc:"NGFW Traffic Logs", domain:"Security", platform:"Cortex XSIAM", icon:Shield, iconTone:"amber", method:"XQL Query", strategy:"Query on Demand", pattern:"On Demand", nextRun:"—", lastRun:"10:22 AM", freshness:"Real-time", latency:18, retries:0, failures:0, priority:"P1", backpressure:12, status:"On Demand", confidence:0.96 },
  { name:"panw_ngfw_system_raw",  desc:"NGFW System Events", domain:"Security", platform:"Cortex XSIAM", icon:Shield, iconTone:"amber", method:"XQL Query", strategy:"15 Min Refresh", pattern:"15 minutes", nextRun:"10:45 AM", lastRun:"10:30 AM", freshness:"18m", latency:22, retries:0, failures:0, priority:"P1", backpressure:18, status:"Success", confidence:0.94 },
  { name:"firewall_threat_logs",  desc:"Threat/URL/Content", domain:"Security", platform:"Cortex XSIAM", icon:Shield, iconTone:"slate", method:"XQL Query", strategy:"Hourly Delta", pattern:"1 hour", nextRun:"11:00 AM", lastRun:"10:00 AM", freshness:"42m", latency:31, retries:1, failures:0, priority:"P2", backpressure:24, status:"Success", confidence:0.91 },
  { name:"vpn_globalprotect_logs",desc:"GlobalProtect VPN", domain:"Network", platform:"Cortex XSIAM", icon:Shield, iconTone:"amber", method:"XQL Query", strategy:"6 Hour Refresh", pattern:"6 hours", nextRun:"12:00 PM", lastRun:"06:00 AM", freshness:"4h 12m", latency:19, retries:0, failures:0, priority:"P2", backpressure:9, status:"Success", confidence:0.93 },
  { name:"gcp_billing_export",    desc:"GCP Billing Export", domain:"FinOps", platform:"BigQuery", icon:Database, iconTone:"blue", method:"SQL Query", strategy:"24 HR Diff Refresh", pattern:"24 hours", nextRun:"02:00 AM", lastRun:"02:00 AM", freshness:"6h 30m", latency:74, retries:0, failures:0, priority:"P3", backpressure:6, status:"Success", confidence:0.9 },
  { name:"gcp_cloud_audit_logs",  desc:"Cloud Audit Logs", domain:"Governance", platform:"BigQuery", icon:Database, iconTone:"blue", method:"SQL Query", strategy:"24 HR Diff Refresh", pattern:"24 hours", nextRun:"02:15 AM", lastRun:"02:15 AM", freshness:"6h 45m", latency:82, retries:0, failures:0, priority:"P2", backpressure:11, status:"Warning", confidence:0.78 },
  { name:"logicmonitor_device_stats", desc:"Device Performance", domain:"Infra", platform:"LogicMonitor", icon:Activity, iconTone:"emerald", method:"REST API", strategy:"15 Min Refresh", pattern:"15 minutes", nextRun:"10:45 AM", lastRun:"10:30 AM", freshness:"12m", latency:26, retries:0, failures:0, priority:"P1", backpressure:14, status:"Success", confidence:0.95 },
  { name:"logicmonitor_alerts",   desc:"Infrastructure Alerts", domain:"Infra", platform:"LogicMonitor", icon:Activity, iconTone:"emerald", method:"REST API", strategy:"Hourly Delta", pattern:"1 hour", nextRun:"11:00 AM", lastRun:"10:00 AM", freshness:"35m", latency:29, retries:0, failures:0, priority:"P2", backpressure:8, status:"Success", confidence:0.92 },
  { name:"datadog_metrics",       desc:"Metrics & Events", domain:"Observability", platform:"Datadog", icon:Cloud, iconTone:"violet", method:"REST API", strategy:"15 Min Refresh", pattern:"15 minutes", nextRun:"10:45 AM", lastRun:"10:30 AM", freshness:"9m", latency:34, retries:2, failures:0, priority:"P1", backpressure:22, status:"Success", confidence:0.88 },
  { name:"k8s_cluster_logs",      desc:"Kubernetes Logs", domain:"Platform", platform:"Kubernetes API", icon:Boxes, iconTone:"cyan", method:"MCP Tool", strategy:"Hourly Delta", pattern:"1 hour", nextRun:"11:00 AM", lastRun:"07:58 AM", freshness:"3h 2m", latency:52, retries:0, failures:1, priority:"P1", backpressure:31, status:"Warning", confidence:0.72 },
  { name:"file_ingest_sftp",      desc:"Partner File Ingest", domain:"Integration", platform:"SFTP", icon:Server, iconTone:"slate", method:"SFTP Pull", strategy:"Daily Snapshot", pattern:"Daily", nextRun:"01:00 AM", lastRun:"01:00 AM", freshness:"9h 30m", latency:120, retries:0, failures:0, priority:"P3", backpressure:4, status:"Success", confidence:0.89 },
  { name:"threat_intel_feeds",    desc:"External Threat Feeds", domain:"Security", platform:"Public API", icon:Shield, iconTone:"rose", method:"REST API", strategy:"6 Hour Refresh", pattern:"6 hours", nextRun:"12:00 PM", lastRun:"06:00 AM", freshness:"5h 12m", latency:44, retries:0, failures:0, priority:"P2", backpressure:7, status:"Success", confidence:0.9 },
];

const DIST = [
  { label:"Query on Demand", value:18, color:"#3b82f6" },
  { label:"15 Min Refresh", value:28, color:"#10b981" },
  { label:"Hourly Delta",   value:22, color:"#8b5cf6" },
  { label:"6 Hour Refresh", value:15, color:"#06b6d4" },
  { label:"24 HR Diff",     value:20, color:"#f59e0b" },
  { label:"Daily Snapshot", value:11, color:"#94a3b8" },
  { label:"Streaming",      value:5,  color:"#f43f5e" },
  { label:"Adaptive",       value:3,  color:"#6366f1" },
];

const HEALTH = [
  { label:"Success",   value:108, color:"#10b981" },
  { label:"Warning",   value:11,  color:"#f59e0b" },
  { label:"Failed",    value:3,   color:"#f43f5e" },
  { label:"Retry",     value:6,   color:"#8b5cf6" },
  { label:"Queued",    value:9,   color:"#3b82f6" },
];

const STALE = [
  { source:"gcp_cloud_audit_logs", fresh:"6h 45m", threshold:"6h",  impact:"Governance",  owner:"FinOps",     next:"02:15 AM", action:"Advance to Hourly Delta" },
  { source:"k8s_cluster_logs",     fresh:"3h 2m",  threshold:"2h",  impact:"Platform SRE", owner:"Platform",  next:"11:00 AM", action:"Increase worker pool" },
  { source:"vpn_globalprotect_logs", fresh:"1h 20m", threshold:"1h", impact:"NetSec",      owner:"Network Ops", next:"12:00 PM", action:"Switch to Hourly Delta" },
  { source:"datadog_metrics",      fresh:"45m",    threshold:"30m", impact:"Observability", owner:"SRE",     next:"10:45 AM", action:"Increase concurrency" },
];

/* ---------- helpers ---------- */
const Spark = ({ points, color = "#3b82f6" }: { points: number[]; color?: string }) => {
  const w = 84, h = 28, min = Math.min(...points), max = Math.max(...points);
  const d = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / Math.max(1e-6, max - min)) * h;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
};

const Donut = ({ data, size = 180 }: { data: { label: string; value: number; color: string }[]; size?: number }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2 - 14, cx = size / 2, cy = size / 2;
  let acc = 0;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={14} />
      {data.map((d, i) => {
        const frac = d.value / total;
        const start = acc * 2 * Math.PI - Math.PI / 2;
        const end = (acc + frac) * 2 * Math.PI - Math.PI / 2;
        acc += frac;
        const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
        const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
        const large = frac > 0.5 ? 1 : 0;
        return (
          <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
                fill="none" stroke={d.color} strokeWidth={14} strokeLinecap="butt" />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-slate-900" style={{ fontSize: 20, fontWeight: 700 }}>{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 10 }}>jobs</text>
    </svg>
  );
};

/* ---------- main ---------- */
export default function FetchOrchestrationScheduler() {
  const [drawer, setDrawer] = useState<{ open: boolean; title: string; kind: string }>({ open: false, title: "", kind: "kpi" });
  const [selected, setSelected] = useState<Row>(ROWS[1]);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<string>("All");

  const domains = useMemo(() => ["All", ...Array.from(new Set(ROWS.map(r => r.domain)))], []);
  const rows = useMemo(() => ROWS.filter(r =>
    (domain === "All" || r.domain === domain) &&
    (query === "" || (r.name + r.desc + r.platform).toLowerCase().includes(query.toLowerCase()))
  ), [query, domain]);

  // simulation state
  const [sim, setSim] = useState({ priority: 70, freshness: 60, load: 40, cost: 30, failure: 10, latency: 50, retries: 2 });
  const recommended = useMemo<Strategy>(() => {
    const s = sim.priority * 0.35 + (100 - sim.freshness) * 0.25 + (100 - sim.load) * 0.15 + (100 - sim.cost) * 0.1 + (100 - sim.failure) * 0.15;
    if (s > 78) return "Streaming";
    if (s > 66) return "15 Min Refresh";
    if (s > 54) return "30 Min Refresh";
    if (s > 42) return "Hourly Delta";
    if (s > 30) return "6 Hour Refresh";
    return "24 HR Diff Refresh";
  }, [sim]);

  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 1500); return () => clearInterval(t); }, []);

  const openDrawer = (title: string, kind = "kpi") => setDrawer({ open: true, title, kind });

  return (
    <div className="min-h-full bg-white text-slate-900">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fetch Orchestration Scheduler</h1>
            <p className="text-slate-600 mt-1">Adaptive orchestration of enterprise data refresh, synchronization, retries, and freshness management.</p>
            <p className="text-slate-400 text-sm mt-1 max-w-4xl">Every data source is continuously evaluated to determine the optimal fetch strategy using operational telemetry, source behavior, engineering rules, freshness targets, and business criticality.</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Last Updated <span className="text-slate-700 font-medium ml-1">May 12, 2025 · 10:32 AM</span></span>
            <button className="ml-3 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2"><Filter className="h-4 w-4"/>Filters</button>
            <button className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2"><Timer className="h-4 w-4"/>24h</button>
            <button onClick={() => openDrawer("Adaptive Scheduling Simulation", "sim")} className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-2"><Play className="h-4 w-4"/>Run Simulation</button>
            <button className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2"><Download className="h-4 w-4"/>Export</button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="px-8 py-5 grid grid-cols-8 gap-4">
        {KPIS.map((k, i) => {
          const t = tone[k.tone];
          const Icon = k.icon;
          return (
            <button key={i} onClick={() => openDrawer(k.label, "kpi")}
              className="group text-left rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
              <div className="flex items-start justify-between">
                <div className={`h-9 w-9 rounded-lg ${t.bg} ${t.text} inline-flex items-center justify-center ring-1 ${t.ring}`}>
                  <Icon className="h-5 w-5"/>
                </div>
                <span className={`text-[11px] font-medium ${k.delta.startsWith("-") ? "text-rose-500" : "text-emerald-600"}`}>{k.delta}</span>
              </div>
              <div className="mt-3 text-xs text-slate-500">{k.label}</div>
              <div className="mt-1 flex items-end justify-between">
                <div className="text-2xl font-semibold tracking-tight">{k.value}</div>
                <Spark points={k.spark} color={t.hex}/>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{k.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Workspace */}
      <div className="px-8 pb-6 grid grid-cols-12 gap-4">
        {/* Grid */}
        <div className="col-span-9 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
            <div>
              <div className="text-sm font-semibold">Enterprise Fetch Schedule Grid</div>
              <div className="text-xs text-slate-500">Adaptive strategies · continuously optimized per source</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2"/>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search sources" className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-blue-100"/>
              </div>
              <select value={domain} onChange={e => setDomain(e.target.value)} className="text-xs border border-slate-200 rounded-md py-1.5 px-2">
                {domains.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-slate-500 bg-slate-50/60">
                <tr className="text-left">
                  {["Source","Domain","Platform","Method","Strategy","Pattern","Next Run","Last Run","Fresh","Lat","Retry","Prio","BP","Status","Conf","Builder",""].map(h => (
                    <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const t = tone[r.iconTone];
                  const Icon = r.icon;
                  const active = selected.name === r.name;
                  return (
                    <tr key={i} onClick={() => setSelected(r)} className={`border-t border-slate-100 hover:bg-blue-50/40 cursor-pointer transition ${active ? "bg-blue-50/60" : ""}`}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-md ${t.bg} ${t.text} inline-flex items-center justify-center`}><Icon className="h-3.5 w-3.5"/></div>
                          <div>
                            <div className="font-medium text-slate-800">{r.name}</div>
                            <div className="text-[10px] text-slate-400">{r.desc}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{r.domain}</td>
                      <td className="px-3 py-2.5 text-slate-600">{r.platform}</td>
                      <td className="px-3 py-2.5 text-slate-600">{r.method}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${strategyStyle[r.strategy].bg} ${strategyStyle[r.strategy].text}`}>{r.strategy}</span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{r.pattern}</td>
                      <td className="px-3 py-2.5 text-slate-600">{r.nextRun}</td>
                      <td className="px-3 py-2.5 text-slate-600">{r.lastRun}</td>
                      <td className="px-3 py-2.5 text-slate-600">{r.freshness}</td>
                      <td className="px-3 py-2.5 text-slate-600">{r.latency}ms</td>
                      <td className="px-3 py-2.5 text-slate-600">{r.retries}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${r.priority === "P1" ? "bg-rose-50 text-rose-700" : r.priority === "P2" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{r.priority}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-400" style={{ width: `${r.backpressure * 3}%` }}/>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${r.status === "Success" ? "bg-emerald-50 text-emerald-700" : r.status === "Warning" ? "bg-amber-50 text-amber-700" : r.status === "Failed" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${r.status === "Success" ? "bg-emerald-500" : r.status === "Warning" ? "bg-amber-500" : r.status === "Failed" ? "bg-rose-500" : "bg-blue-500"} animate-pulse`}/>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400" style={{ width: `${r.confidence * 100}%` }}/>
                          </div>
                          <span className="text-[10px] text-slate-500">{Math.round(r.confidence * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-400"><ChevronRight className="h-3.5 w-3.5"/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel */}
        <div className="col-span-3 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="text-xs font-semibold text-slate-500">Scheduler Intelligence</div>
            <div className="mt-1 text-sm font-semibold text-slate-800 truncate">{selected.name}</div>
            <div className="text-[11px] text-slate-500">{selected.desc}</div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
              <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">Current</div><div className="font-medium">{selected.strategy}</div></div>
              <div className="rounded-md bg-indigo-50 p-2"><div className="text-indigo-500">Recommended</div><div className="font-medium text-indigo-700">{recommended}</div></div>
              <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">Freshness</div><div className="font-medium">{selected.freshness}</div></div>
              <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">Latency</div><div className="font-medium">{selected.latency}ms</div></div>
              <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">Retries</div><div className="font-medium">{selected.retries}</div></div>
              <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">Risk</div><div className="font-medium">{selected.failures ? "Elevated" : "Low"}</div></div>
              <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">Health</div><div className="font-medium text-emerald-600">98%</div></div>
              <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">Adaptive Score</div><div className="font-medium">{Math.round(selected.confidence * 100)}</div></div>
            </div>
            <button onClick={() => openDrawer(`${selected.name} · Recommendation`, "reco")} className="mt-3 w-full text-xs px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center justify-center gap-2">
              <Sparkles className="h-3.5 w-3.5"/> View Engineering Recommendation
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="text-xs font-semibold text-slate-500 mb-2">Schedule Distribution</div>
            <div className="flex items-center gap-3">
              <Donut data={DIST} size={140}/>
              <div className="flex-1 space-y-1">
                {DIST.map(d => (
                  <div key={d.label} className="flex items-center gap-2 text-[11px]">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.color }}/>
                    <span className="flex-1 text-slate-600 truncate">{d.label}</span>
                    <span className="text-slate-400">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="text-xs font-semibold text-slate-500 mb-2">Job Health (24h)</div>
            <div className="flex items-center gap-3">
              <Donut data={HEALTH} size={140}/>
              <div className="flex-1 space-y-1">
                {HEALTH.map(d => (
                  <div key={d.label} className="flex items-center gap-2 text-[11px]">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.color }}/>
                    <span className="flex-1 text-slate-600">{d.label}</span>
                    <span className="text-slate-400">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-500">Stale Source Monitor</div>
              <span className="text-[10px] text-rose-500">{STALE.length} active</span>
            </div>
            <div className="space-y-2">
              {STALE.map((s, i) => (
                <div key={i} className="rounded-md border border-slate-100 p-2 hover:bg-amber-50/40 transition">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-slate-800 truncate">{s.source}</div>
                    <span className="text-[10px] text-amber-600">{s.fresh} / {s.threshold}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Owner: {s.owner} · Next: {s.next}</div>
                  <div className="text-[10px] text-indigo-600 mt-0.5">{s.action}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Transparency */}
      <div className="bg-slate-950 text-slate-100 px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400">Engineering Transparency</div>
            <div className="text-xl font-semibold">How the Adaptive Scheduling Engine Works</div>
          </div>
          <div className="text-[11px] text-slate-400 inline-flex items-center gap-2"><Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse"/> Live · optimizing continuously</div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Adaptive pipeline */}
          <div className="col-span-12 rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400 mb-3">Adaptive Scheduling Pipeline</div>
            <div className="relative overflow-hidden">
              <div className="flex items-center gap-2">
                {["Telemetry","Source Health","Freshness","Business Priority","Latency","Load","Retry Policy","Adaptive Engine","Execution Queue","Monitoring","Optimization"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <button onClick={() => openDrawer(`Pipeline · ${s}`, "pipe")} className="px-2.5 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-[11px] whitespace-nowrap border border-slate-700">
                      {s}
                    </button>
                    {i < 10 && <div className="w-6 h-px bg-gradient-to-r from-indigo-400/40 to-transparent"/>}
                  </div>
                ))}
              </div>
              <div className="mt-3 relative h-1.5 rounded-full bg-slate-800 overflow-hidden">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="absolute top-0 h-1.5 w-8 rounded-full bg-indigo-400/70"
                       style={{ left: `${((tick * 6 + i * 20) % 100)}%`, transition: "left 1.4s linear" }}/>
                ))}
              </div>
            </div>
          </div>

          {/* Decision engine */}
          <div className="col-span-7 rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400 mb-3">Scheduling Decision Engine</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { l:"Source Metadata", w:0.14 },{ l:"Historical Telemetry", w:0.18 },{ l:"Business Priority", w:0.22 },
                { l:"Freshness Rules", w:0.16 },{ l:"Backpressure", w:0.08 },{ l:"System Load", w:0.10 },
                { l:"Adaptive Policy", w:0.06 },{ l:"Recommendation", w:0.04 },{ l:"Continuous Learning", w:0.02 },
              ].map((r, i) => (
                <div key={i} className={`rounded-md p-2 border border-slate-800 bg-slate-950/60 relative overflow-hidden ${((tick + i) % 6 === 0) ? "ring-1 ring-indigo-400/60" : ""}`}>
                  <div className="text-[11px] text-slate-300">{r.l}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">weight {r.w.toFixed(2)}</div>
                  <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400/70" style={{ width: `${r.w * 400}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live execution */}
          <div className="col-span-5 rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
              <span>Live Execution Pipeline</span>
              <span className="text-emerald-400 inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/> {(tick * 2 + 14) % 60 + 12} jobs/sec</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-[10px]">
              {[
                { l:"Concurrent Workers", v:24 },{ l:"Queue Time", v:"1.4s" },
                { l:"Worker Util", v:"72%" },{ l:"Backpressure", v:"18%" },
                { l:"Retry Queue", v:6 },{ l:"Dead Letters", v:1 },
                { l:"Success Rate", v:"88.5%" },{ l:"Timeouts", v:2 },
              ].map((m, i) => (
                <div key={i} className="rounded-md bg-slate-950/60 border border-slate-800 p-2">
                  <div className="text-slate-400">{m.l}</div>
                  <div className="text-slate-100 font-semibold mt-0.5">{m.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 relative h-16 rounded-md bg-slate-950 overflow-hidden border border-slate-800">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-indigo-400"
                     style={{ left: `${((tick * 8 + i * 12) % 100)}%`, transition: "left 1.4s linear", opacity: 0.7 }}/>
              ))}
              <div className="absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-blue-500/20 to-transparent border-r border-slate-800 flex items-center justify-center text-[10px] text-blue-300">Queue</div>
              <div className="absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-emerald-500/20 to-transparent border-l border-slate-800 flex items-center justify-center text-[10px] text-emerald-300">Done</div>
            </div>
          </div>

          {/* Retry workflow */}
          <div className="col-span-12 rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400 mb-3">Retry &amp; Recovery Workflow</div>
            <div className="flex items-center gap-1 overflow-x-auto">
              {["Failure","Classification","Retry Delay","Priority Adjust","Re-execution","Escalation","Alert","Dead Letter"].map((s, i, arr) => (
                <div key={s} className="flex items-center gap-1">
                  <button onClick={() => openDrawer(`Retry · ${s}`, "retry")} className="px-2.5 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-[11px] border border-slate-700 whitespace-nowrap">{s}</button>
                  {i < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-slate-600"/>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom widgets */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { title:"Recent Scheduler Activity", items:["Advanced datadog_metrics → 15min","Deferred file_ingest_sftp by 4m","Retried k8s_cluster_logs (1)","Optimized gcp_billing_export cost -18%"] },
            { title:"Adaptive Optimizations", items:["Shift Hourly→15m on 3 sources","Backpressure relief on Cortex XSIAM","Warmed streaming path for VPN","Lowered daily-snapshot concurrency"] },
            { title:"Longest Running Jobs", items:["gcp_cloud_audit_logs · 82s","file_ingest_sftp · 120s","threat_intel_feeds · 44s","k8s_cluster_logs · 52s"] },
            { title:"Retry History", items:["datadog_metrics · 2","k8s_cluster_logs · 1","firewall_threat_logs · 1","file_ingest_sftp · 0"] },
            { title:"Most Expensive Queries", items:["gcp_cloud_audit_logs · $0.42/run","gcp_billing_export · $0.31/run","threat_intel_feeds · $0.18/run","datadog_metrics · $0.12/run"] },
            { title:"SLA Violations (24h)", items:["gcp_cloud_audit_logs · +45m","k8s_cluster_logs · +1h 02m","vpn_globalprotect_logs · +20m"] },
          ].map((w, i) => (
            <div key={i} className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <div className="text-xs text-slate-400 mb-2">{w.title}</div>
              <ul className="text-[11px] text-slate-200 space-y-1">
                {w.items.map((it, j) => <li key={j} className="flex items-start gap-2"><span className="h-1 w-1 rounded-full bg-indigo-400 mt-1.5"/> {it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={drawer.open} onOpenChange={(o) => setDrawer(d => ({ ...d, open: o }))}>
        <SheetContent className="w-[560px] sm:max-w-none overflow-y-auto">
          <SheetHeader><SheetTitle className="text-lg">{drawer.title}</SheetTitle></SheetHeader>
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="engineering">Engineering</TabsTrigger>
              <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
              <TabsTrigger value="dependencies">Deps</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 text-sm text-slate-700 space-y-3">
              <p>The Fetch Orchestration Scheduler continuously balances <b>freshness, cost, latency, source impact, and business criticality</b> to select an optimal refresh strategy per source.</p>
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                <li>Purpose: Adaptive orchestration of data acquisition</li>
                <li>Consumers: Platform Eng, Data Eng, SRE, AI Eng, EA, CloudOps</li>
                <li>SLA: p95 freshness &lt; 60m · availability 99.5%</li>
                <li>Criticality: Tier-1 platform service</li>
              </ul>
            </TabsContent>

            <TabsContent value="engineering" className="mt-4 space-y-3 text-xs text-slate-700">
              {[
                { i: Workflow, l:"Adaptive scheduler evaluates per-source cost/latency/freshness vectors every 30s" },
                { i: Cpu,      l:"Priority calculator weights business criticality, downstream AI demand, and SLA distance" },
                { i: Layers,   l:"Queue manager applies backpressure across worker pools using token buckets" },
                { i: GitBranch,l:"Retry engine classifies failures (transient/permanent/rate-limit) and adjusts delay" },
                { i: Network,  l:"Freshness optimizer learns from historical variance and adjusts cadence" },
                { i: Sparkles, l:"Continuous optimization loop refines weights nightly from 24h telemetry" },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2 rounded-md border border-slate-100 p-2">
                  <r.i className="h-4 w-4 text-indigo-500 mt-0.5"/><div>{r.l}</div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="telemetry" className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {[
                ["Execution time","1.4s p50"], ["Queue depth","6"],
                ["Jobs/sec","24"], ["Worker util","72%"],
                ["Retries","2.7 avg"], ["Backpressure","18%"],
                ["Latency","p95 74ms"], ["CPU","61%"],
                ["Memory","54%"], ["Failures","3"],
                ["Timeouts","2"], ["Success","88.5%"],
              ].map(([k, v], i) => (
                <div key={i} className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">{k}</div><div className="font-semibold">{v}</div></div>
              ))}
            </TabsContent>

            <TabsContent value="simulation" className="mt-4 space-y-3 text-xs">
              <div className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between"><span className="text-slate-500">Recommended Strategy</span><span className="font-semibold text-indigo-600">{recommended}</span></div>
              </div>
              {[
                ["priority","Business Priority",0,100],
                ["freshness","Freshness SLA (tighter →)",0,100],
                ["load","Source Load",0,100],
                ["cost","Query Cost",0,100],
                ["failure","Failure Rate",0,100],
                ["latency","Latency",0,100],
              ].map(([key, label, min, max]) => (
                <div key={key as string}>
                  <div className="flex items-center justify-between text-slate-600"><span>{label}</span><span className="font-medium">{(sim as any)[key as string]}</span></div>
                  <input type="range" min={min as number} max={max as number} value={(sim as any)[key as string]}
                         onChange={(e) => setSim(s => ({ ...s, [key as string]: Number(e.target.value) }))}
                         className="w-full accent-indigo-600"/>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="dependencies" className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {["Source Systems","Queues","Workers","Schedulers","Connectors","Policies","Consumers","Hydration","Storage","Monitoring","Alerting","Ownership"].map(d => (
                <div key={d} className="rounded-md border border-slate-100 p-2 flex items-center gap-2"><Info className="h-3.5 w-3.5 text-slate-400"/>{d}</div>
              ))}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}
