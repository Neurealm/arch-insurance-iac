import { useEffect, useMemo, useState } from "react";
import {
  Database, Activity, Plus, Minus, ArrowLeftRight, Braces, CircleDot, Wand2,
  Filter, Download, RefreshCw, CalendarClock, GitCompare, Search, ChevronRight, ChevronDown,
  Workflow, Fingerprint, FileSearch, ScanLine, GitBranch, ShieldCheck, Layers, Sparkles,
  CheckCircle2, AlertTriangle, XCircle, Radio, Gauge, TrendingUp, TrendingDown, Play,
  Cpu, MemoryStick, Boxes, Network, Users, Lock, Link2, BrainCircuit, Route, ArrowRight,
  Clock, Bell, Eye, Settings2,
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
  { icon: Database,      label: "Sources Monitored",         value: "45",   sub: "100% of in-scope",  delta: "+2",   tone: "violet"  as Tone, spark: [40,41,42,43,44,45,45] },
  { icon: Activity,      label: "Active Drift Events",       value: "18",   sub: "40% of sources",    delta: "+3",   tone: "emerald" as Tone, spark: [12,13,14,15,16,17,18] },
  { icon: Plus,          label: "New Fields Detected",       value: "124",  sub: "+18 last 7 days",   delta: "+18",  tone: "blue"    as Tone, spark: [80,88,96,104,112,118,124] },
  { icon: Minus,         label: "Missing Fields",            value: "73",   sub: "+9 last 7 days",    delta: "+9",   tone: "amber"   as Tone, spark: [50,55,60,64,68,71,73] },
  { icon: ArrowLeftRight,label: "Data Type Changes",         value: "39",   sub: "+5 last 7 days",    delta: "+5",   tone: "violet"  as Tone, spark: [26,28,30,32,34,37,39] },
  { icon: Braces,        label: "JSON Structure Changes",    value: "27",   sub: "+6 last 7 days",    delta: "+6",   tone: "cyan"    as Tone, spark: [16,18,20,22,24,26,27] },
  { icon: CircleDot,     label: "Sparsely Populated",        value: "56",   sub: "12.4% of fields",   delta: "+4",   tone: "slate"   as Tone, spark: [42,44,48,50,52,54,56] },
  { icon: Wand2,         label: "Auto Remediated",           value: "81%",  sub: "target ≥ 75%",      delta: "+3",   tone: "teal"    as Tone, spark: [68,72,74,76,78,80,81] },
];

type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";
const sevStyle: Record<Severity, string> = {
  Critical: "bg-rose-100 text-rose-700 ring-rose-300",
  High:     "bg-rose-50 text-rose-700 ring-rose-200",
  Medium:   "bg-amber-50 text-amber-700 ring-amber-200",
  Low:      "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Info:     "bg-blue-50 text-blue-700 ring-blue-200",
};

type Status = "New" | "Investigating" | "Reviewing" | "Monitoring" | "Resolved";
const statusStyle: Record<Status, string> = {
  New:           "text-blue-700",
  Investigating: "text-amber-700",
  Reviewing:     "text-violet-700",
  Monitoring:    "text-teal-700",
  Resolved:      "text-emerald-700",
};

type DriftType = "New Fields" | "Missing Fields" | "Type Change" | "JSON Structure" | "Sparsely Populated" | "Breaking Change";
const driftStyle: Record<DriftType, string> = {
  "New Fields":         "bg-blue-50 text-blue-700",
  "Missing Fields":     "bg-amber-50 text-amber-700",
  "Type Change":        "bg-rose-50 text-rose-700",
  "JSON Structure":     "bg-cyan-50 text-cyan-700",
  "Sparsely Populated": "bg-slate-100 text-slate-700",
  "Breaking Change":    "bg-rose-100 text-rose-700",
};

type Row = {
  id: number; source: string; platform: string; version: string; drift: DriftType;
  severity: Severity; fields: number; detected: string; observed: string; status: Status;
  confidence: number; impact: string; auto: boolean; owner: string; recommend: string;
};

const ROWS: Row[] = [
  { id:1, source:"XSIAM — NGFW Traffic Logs",  platform:"Cortex XSIAM",  version:"v4.2 → v4.3", drift:"New Fields",         severity:"Medium", fields:24, detected:"May 12 · 08:15", observed:"May 12 · 10:18", status:"New",           confidence:96, impact:"12 consumers", auto:true,  owner:"SecOps",     recommend:"Map to canonical" },
  { id:2, source:"GlobalProtect VPN Logs",     platform:"Cortex XSIAM",  version:"v2.1 → v2.2", drift:"Type Change",        severity:"High",   fields:7,  detected:"May 11 · 19:42", observed:"May 12 · 09:55", status:"Investigating", confidence:88, impact:"6 consumers",  auto:false, owner:"Network",    recommend:"Review mapping" },
  { id:3, source:"NGFW System Events",         platform:"Cortex XSIAM",  version:"v3.0 → v3.1", drift:"Missing Fields",     severity:"High",   fields:13, detected:"May 11 · 18:30", observed:"May 12 · 10:05", status:"New",           confidence:92, impact:"9 consumers",  auto:true,  owner:"SecOps",     recommend:"Add default" },
  { id:4, source:"Threat Intel Feeds",         platform:"REST API",      version:"v1.4 → v1.5", drift:"JSON Structure",     severity:"Medium", fields:5,  detected:"May 10 · 09:10", observed:"May 12 · 09:30", status:"Reviewing",     confidence:84, impact:"4 consumers",  auto:false, owner:"ThreatIntel",recommend:"Update parser" },
  { id:5, source:"Device Performance Stats",   platform:"LogicMonitor",  version:"v6.2 → v6.2", drift:"Sparsely Populated", severity:"Low",    fields:11, detected:"May 9 · 23:20",  observed:"May 12 · 09:40", status:"Monitoring",    confidence:79, impact:"2 consumers",  auto:true,  owner:"Platform",   recommend:"Monitor" },
  { id:6, source:"Cloud Audit Logs",           platform:"BigQuery",      version:"v5.1 → v5.2", drift:"Type Change",        severity:"Medium", fields:6,  detected:"May 9 · 14:15",  observed:"May 12 · 08:12", status:"Investigating", confidence:87, impact:"8 consumers",  auto:false, owner:"CloudSec",   recommend:"Cast + review" },
];

const FIELD_DRIFT = [
  { path:"event.new_threat_score",     canonical:"threat.score",           drift:"New Field",             desc:"New field appeared in 93% of records",   detected:"May 12 · 08:15", impact:"Medium", nullRate:3.2,  samples:1245, status:"New" as Status,           action:"Map Field" },
  { path:"event.severity",             canonical:"event.severity",         drift:"Type Change",           desc:"string → integer",                       detected:"May 11 · 19:42", impact:"High",   nullRate:0.1,  samples:4892, status:"Investigating" as Status, action:"Review Mapping" },
  { path:"event.device.owner",         canonical:"device.owner",           drift:"Missing Field",         desc:"Field missing in 12% of records",        detected:"May 11 · 18:30", impact:"High",   nullRate:100,  samples:3210, status:"New" as Status,           action:"Add Default" },
  { path:"event.additional_info.ip",   canonical:"source.ip",              drift:"JSON Structure",        desc:"Moved: event.additional_info.ip → event.source.ip", detected:"May 10 · 09:10", impact:"Medium", nullRate:1.8, samples:2118, status:"Reviewing" as Status, action:"Update Parser" },
  { path:"device.disk.utilization",    canonical:"device.disk.utilization",drift:"Sparsely Populated",    desc:"Populated in only 7% of records",        detected:"May 9 · 23:20",  impact:"Low",    nullRate:93.0, samples:6544, status:"Monitoring" as Status,   action:"Monitor" },
  { path:"user.id",                    canonical:"user.id",                drift:"Type Change",           desc:"integer → string",                       detected:"May 9 · 14:15",  impact:"Medium", nullRate:0.3,  samples:2775, status:"Investigating" as Status, action:"Review Mapping" },
];

const PIPELINE = [
  { l:"Incoming Source",         icon:Database },
  { l:"Metadata Extraction",     icon:FileSearch },
  { l:"Schema Fingerprint",      icon:Fingerprint },
  { l:"Historical Lookup",       icon:Layers },
  { l:"Difference Engine",       icon:GitCompare },
  { l:"Drift Classification",    icon:ScanLine },
  { l:"Compatibility Analysis",  icon:ShieldCheck },
  { l:"Impact Analysis",         icon:Network },
  { l:"Remediation",             icon:Wand2 },
  { l:"Canonical Update",        icon:GitBranch },
  { l:"Production Monitor",      icon:Radio },
];

const DRIFT_TYPE_DIST = [
  { label:"New Fields",         value:124, color:"#3b82f6" },
  { label:"Missing Fields",     value:73,  color:"#f59e0b" },
  { label:"Type Changes",       value:39,  color:"#8b5cf6" },
  { label:"JSON Structure",     value:27,  color:"#06b6d4" },
  { label:"Sparsely Populated", value:56,  color:"#10b981" },
  { label:"Other",              value:18,  color:"#94a3b8" },
];

const SEVERITY_DIST = [
  { label:"Critical", value:3,  color:"#dc2626" },
  { label:"High",     value:6,  color:"#f43f5e" },
  { label:"Medium",   value:8,  color:"#f59e0b" },
  { label:"Low",      value:4,  color:"#10b981" },
  { label:"Info",     value:27, color:"#3b82f6" },
];

/* ---------- helpers ---------- */
function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-8">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Donut({ segs, size = 140 }: { segs: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segs.reduce((s, x) => s + x.value, 0) || 1;
  let off = 0;
  const R = 44, C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 120 120" style={{ width: size, height: size }}>
      <circle cx="60" cy="60" r={R} fill="none" stroke="#f1f5f9" strokeWidth="14" />
      {segs.map((s, i) => {
        const len = (s.value / total) * C;
        const el = (
          <circle key={i} cx="60" cy="60" r={R} fill="none"
            stroke={s.color} strokeWidth="14"
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-off}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dasharray .6s ease" }}
          />
        );
        off += len;
        return el;
      })}
      <text x="60" y="58" textAnchor="middle" className="fill-slate-900" fontSize="18" fontWeight="700">{total}</text>
      <text x="60" y="74" textAnchor="middle" className="fill-slate-500" fontSize="9">total</text>
    </svg>
  );
}

/* ---------- component ---------- */
export default function SchemaDriftAndExceptionWorkbench() {
  const [selected, setSelected] = useState<Row | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [sevFilter, setSevFilter] = useState<Severity | "All">("All");
  const [driftTab, setDriftTab] = useState<"All" | DriftType>("All");
  const [drawer, setDrawer] = useState<{ title: string; kind: string } | null>(null);
  const [tick, setTick] = useState(0);
  const [simType, setSimType] = useState("string");
  const [simRequired, setSimRequired] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => (n + 1) % 1000), 900);
    return () => clearInterval(t);
  }, []);

  const rows = useMemo(() => ROWS.filter(r =>
    (sevFilter === "All" || r.severity === sevFilter) &&
    (query === "" || (r.source + r.platform + r.drift).toLowerCase().includes(query.toLowerCase()))
  ), [query, sevFilter]);

  const fieldRows = useMemo(() => FIELD_DRIFT.filter(f =>
    driftTab === "All" || f.drift.includes(driftTab.split(" ")[0])
  ), [driftTab]);

  const activeStage = tick % PIPELINE.length;

  // Drift trend data
  const trendDays = 30;
  const trend = useMemo(() => {
    const s = (base: number, amp: number, phase: number) =>
      Array.from({ length: trendDays }, (_, i) => base + Math.round(Math.sin((i + phase) / 3) * amp + (i / 6)));
    return {
      "New Fields":       { color: "#3b82f6", data: s(55, 8, 0) },
      "Missing Fields":   { color: "#f59e0b", data: s(30, 6, 1) },
      "Type Changes":     { color: "#8b5cf6", data: s(18, 5, 2) },
      "JSON Structure":   { color: "#06b6d4", data: s(12, 4, 3) },
      "Sparsely Pop.":    { color: "#10b981", data: s(20, 5, 4) },
    };
  }, []);

  return (
    <div className="px-6 py-5 space-y-5 max-w-[1920px] mx-auto bg-white">
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-violet-600">
            <Activity className="h-3.5 w-3.5" /> Schema & Hygiene · Drift Workbench
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 mt-1">Schema Drift &amp; Exception Workbench</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-4xl">
            Continuously detect, classify, analyze, and remediate structural changes across enterprise data sources.
          </p>
          <p className="text-[12px] text-slate-500 mt-1 max-w-4xl leading-relaxed">
            Every schema modification is evaluated for downstream operational impact, engineering compatibility, orchestration
            readiness, AI confidence, and production risk — before it affects consumers.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 mr-2 text-right leading-tight">
            <div>Last Updated</div>
            <div className="font-semibold text-slate-700 tabular-nums">May 12, 2026 · 10:32 AM</div>
          </div>
          <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><Filter className="h-3.5 w-3.5" /> Filters</button>
          <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Time Range</button>
          <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><GitCompare className="h-3.5 w-3.5" /> Compare Versions</button>
          <button className="h-9 px-3 rounded-lg bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 inline-flex items-center gap-1.5 shadow-sm"><Download className="h-3.5 w-3.5" /> Export Analysis</button>
        </div>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-4 xl:grid-cols-8 gap-3">
        {KPIS.map((k) => {
          const t = tone[k.tone];
          return (
            <button
              key={k.label}
              onClick={() => setDrawer({ title: k.label, kind: "kpi" })}
              className="text-left bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={`h-8 w-8 rounded-lg ${t.bg} grid place-items-center`}>
                  <k.icon className={`h-4 w-4 ${t.text}`} />
                </div>
                <span className="text-[10px] font-semibold text-emerald-600">▲ {k.delta}</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mt-2">{k.label}</div>
              <div className="text-[22px] font-bold text-slate-900 leading-tight tabular-nums">{k.value}</div>
              <div className="text-[10px] text-slate-500">{k.sub}</div>
              <Spark data={k.spark} color={t.hex} />
            </button>
          );
        })}
      </section>

      {/* Main workspace */}
      <section className="grid grid-cols-12 gap-4">
        {/* Left/main: Drift events + field drift */}
        <div className="col-span-12 xl:col-span-9 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[15px] font-bold text-slate-900">Schema Drift Events (Last 7 Days)</div>
                <div className="text-[11px] text-slate-500">{ROWS.length} events · {rows.length} shown · click a row to inspect</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search source or drift…" className="pl-8 pr-3 h-8 rounded-lg border border-slate-200 text-[12px] w-60 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <select value={sevFilter} onChange={(e) => setSevFilter(e.target.value as any)} className="h-8 rounded-lg border border-slate-200 text-[12px] px-2 bg-white">
                  {["All","Critical","High","Medium","Low","Info"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                    {["Source","Platform","Version","Drift Type","Severity","Fields","Detected","Latest","Confidence","Impact","Auto","Status"].map((h) => (
                      <th key={h} className="py-2 pr-3 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const isOpen = expanded === r.id;
                    return (
                      <>
                        <tr key={r.id}
                          onClick={() => { setSelected(r); setExpanded(isOpen ? null : r.id); }}
                          className="border-b border-slate-100 hover:bg-slate-50/70 cursor-pointer transition">
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                              {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                              {r.source}
                            </div>
                          </td>
                          <td className="py-2.5 pr-3 text-slate-600">{r.platform}</td>
                          <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-700">{r.version}</td>
                          <td className="py-2.5 pr-3"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${driftStyle[r.drift]}`}>{r.drift}</span></td>
                          <td className="py-2.5 pr-3"><span className={`px-2 py-0.5 rounded-full ring-1 text-[10px] font-semibold ${sevStyle[r.severity]}`}>{r.severity}</span></td>
                          <td className="py-2.5 pr-3 tabular-nums font-semibold text-slate-800">{r.fields}</td>
                          <td className="py-2.5 pr-3 text-slate-600 text-[11px] whitespace-nowrap">{r.detected}</td>
                          <td className="py-2.5 pr-3 text-slate-600 text-[11px] whitespace-nowrap">{r.observed}</td>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-2">
                              <div className="tabular-nums font-semibold text-slate-800 w-9">{r.confidence}%</div>
                              <div className="h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden">
                                <div className={`h-full ${r.confidence >= 90 ? "bg-emerald-500" : r.confidence >= 80 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${r.confidence}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 pr-3 text-[11px] text-slate-700">{r.impact}</td>
                          <td className="py-2.5 pr-3">{r.auto ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-slate-300" />}</td>
                          <td className={`py-2.5 pr-3 text-[11px] font-semibold ${statusStyle[r.status]}`}>
                            <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" /> {r.status}</span>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="bg-slate-50/60">
                            <td colSpan={12} className="p-4">
                              <DriftDetail row={r} onOpenDrawer={(k) => setDrawer({ title: `${r.source} · ${k}`, kind: k })} />
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Field Drift Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[15px] font-bold text-slate-900">Field Drift Details</div>
              <div className="flex items-center gap-1">
                {(["All","New Fields","Missing Fields","Type Change","JSON Structure","Sparsely Populated"] as const).map((t) => (
                  <button key={t} onClick={() => setDriftTab(t as any)}
                    className={`text-[11px] px-2.5 py-1 rounded-md font-semibold ${driftTab === t ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  {["Field Path (Source)","Canonical Field","Drift","Change Description","Detected","Impact","Null %","Samples","Status","Action"].map((h) => (
                    <th key={h} className="py-2 pr-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fieldRows.map((f) => (
                  <tr key={f.path} className="border-b border-slate-100 hover:bg-slate-50/70 cursor-pointer" onClick={() => setDrawer({ title: f.path, kind: "field" })}>
                    <td className="py-2 pr-3 font-mono text-slate-800">{f.path}</td>
                    <td className="py-2 pr-3 font-mono text-blue-700 font-semibold">{f.canonical}</td>
                    <td className="py-2 pr-3"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      f.drift.startsWith("New") ? "bg-blue-50 text-blue-700" :
                      f.drift.startsWith("Missing") ? "bg-amber-50 text-amber-700" :
                      f.drift.startsWith("Type") ? "bg-rose-50 text-rose-700" :
                      f.drift.startsWith("JSON") ? "bg-cyan-50 text-cyan-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>{f.drift}</span></td>
                    <td className="py-2 pr-3 text-slate-700">{f.desc}</td>
                    <td className="py-2 pr-3 text-slate-600 text-[11px]">{f.detected}</td>
                    <td className="py-2 pr-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        f.impact === "High" ? "bg-rose-50 text-rose-700" : f.impact === "Medium" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                      }`}>{f.impact}</span>
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{f.nullRate}%</td>
                    <td className="py-2 pr-3 tabular-nums text-slate-600">{f.samples.toLocaleString()}</td>
                    <td className={`py-2 pr-3 text-[11px] font-semibold ${statusStyle[f.status]}`}>{f.status}</td>
                    <td className="py-2 pr-3"><span className="text-[11px] font-semibold text-blue-700 hover:underline">{f.action}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Drift trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[15px] font-bold text-slate-900">Drift Trend (Last 30 Days)</div>
              <div className="flex items-center gap-3 text-[10px]">
                {Object.entries(trend).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: v.color }} /> {k}</div>
                ))}
              </div>
            </div>
            <svg viewBox="0 0 800 200" className="w-full h-52">
              {[0, 25, 50, 75, 100].map((y) => (
                <g key={y}>
                  <line x1="30" x2="800" y1={200 - (y / 100) * 180 - 10} y2={200 - (y / 100) * 180 - 10} stroke="#f1f5f9" strokeWidth="1" />
                  <text x="0" y={200 - (y / 100) * 180 - 6} className="fill-slate-400" fontSize="9">{y}</text>
                </g>
              ))}
              {Object.values(trend).map((s, idx) => {
                const max = 100;
                const pts = s.data.map((v, i) => `${30 + (i / (trendDays - 1)) * 770},${200 - (v / max) * 180 - 10}`).join(" ");
                return (
                  <g key={idx}>
                    <polyline points={pts} fill="none" stroke={s.color} strokeWidth="1.5" />
                    {s.data.map((v, i) => (
                      <circle key={i} cx={30 + (i / (trendDays - 1)) * 770} cy={200 - (v / max) * 180 - 10} r="2" fill={s.color} />
                    ))}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right intel panel */}
        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-2">Drift Type Distribution</div>
            <div className="flex items-center gap-3">
              <Donut segs={DRIFT_TYPE_DIST} size={140} />
              <div className="space-y-1 text-[10.5px] flex-1">
                {DRIFT_TYPE_DIST.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                      <span className="text-slate-700">{s.label}</span>
                    </span>
                    <span className="tabular-nums font-semibold text-slate-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-2">Severity Distribution</div>
            <div className="flex items-center gap-3">
              <Donut segs={SEVERITY_DIST} size={130} />
              <div className="space-y-1 text-[11px] flex-1">
                {SEVERITY_DIST.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                      <span className="text-slate-700">{s.label}</span>
                    </span>
                    <span className="tabular-nums font-semibold text-slate-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-2">Engineering Drift Summary</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { l:"Detection Coverage", v:"98.6%", t:"emerald" as Tone },
                { l:"Auto Remediation",   v:"81%",   t:"teal"    as Tone },
                { l:"MTTD Drift",         v:"2h 18m",t:"blue"    as Tone },
                { l:"MTTR Drift",         v:"9h 42m",t:"amber"   as Tone },
                { l:"Compatibility",      v:"94%",   t:"emerald" as Tone },
                { l:"Validation Success", v:"99.2%", t:"violet"  as Tone },
              ].map((s) => {
                const t = tone[s.t];
                return (
                  <button key={s.l} onClick={() => setDrawer({ title: s.l, kind: "summary" })}
                    className={`text-left rounded-lg border ${t.ring.replace("ring-","border-")} ${t.bg} p-2 hover:shadow-sm transition`}>
                    <div className={`text-[10px] uppercase font-semibold ${t.text}`}>{s.l}</div>
                    <div className="text-[16px] font-bold text-slate-900 tabular-nums leading-none mt-1">{s.v}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-slate-900">Recent Drift Alerts</div>
              <Bell className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="space-y-2">
              {[
                { icon:AlertTriangle, tone:"rose"   as Tone, msg:"High severity type change · GlobalProtect VPN",  time:"May 12 · 09:55" },
                { icon:AlertTriangle, tone:"amber"  as Tone, msg:"13 fields disappeared · NGFW System Events",     time:"May 12 · 09:40" },
                { icon:Braces,        tone:"cyan"   as Tone, msg:"JSON structure change · Threat Intel Feeds",     time:"May 12 · 09:30" },
                { icon:Plus,          tone:"blue"   as Tone, msg:"New field burst · XSIAM NGFW Traffic Logs",      time:"May 12 · 08:15" },
              ].map((a) => {
                const t = tone[a.tone];
                return (
                  <div key={a.msg} className="flex items-start gap-2 text-[11px]">
                    <div className={`h-6 w-6 rounded-md ${t.bg} grid place-items-center shrink-0`}><a.icon className={`h-3 w-3 ${t.text}`} /></div>
                    <div>
                      <div className="text-slate-800 font-semibold leading-tight">{a.msg}</div>
                      <div className="text-slate-500 text-[10px]">{a.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Transparency Zone */}
      <section className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 p-5 space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-600">Engineering Transparency</div>
            <h2 className="text-[22px] font-bold tracking-tight text-slate-900">How the Schema Intelligence Engine Detects Drift</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Fingerprint → diff → classify → score → remediate — every drift, engineered before it reaches production.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live pipeline
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Workflow className="h-4 w-4 text-violet-500" /> Schema Intelligence Pipeline</div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {PIPELINE.map((s, i) => {
              const active = i === activeStage;
              return (
                <>
                  <button key={s.l} onClick={() => setDrawer({ title: s.l, kind: "stage" })}
                    className={`shrink-0 rounded-lg border p-2 w-[135px] text-left transition-all ${active ? "border-violet-400 bg-violet-50 shadow-md scale-[1.03]" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-6 w-6 rounded-md grid place-items-center ${active ? "bg-violet-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <s.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">S{String(i + 1).padStart(2, "0")}</div>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 mt-1.5 leading-tight">{s.l}</div>
                  </button>
                  {i < PIPELINE.length - 1 && <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />}
                </>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Schema Difference Engine */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><GitCompare className="h-4 w-4 text-blue-500" /> Schema Difference Engine</div>
            <div className="space-y-1.5">
              {[
                { l:"Previous Schema",         icon:Layers,      tone:"slate" as Tone },
                { l:"Current Schema",          icon:Layers,      tone:"blue" as Tone },
                { l:"Field Comparison",        icon:GitCompare,  tone:"cyan" as Tone },
                { l:"Type Comparison",         icon:ArrowLeftRight, tone:"violet" as Tone },
                { l:"Relationship Comparison", icon:Network,     tone:"teal" as Tone },
                { l:"Constraint Comparison",   icon:Lock,        tone:"amber" as Tone },
                { l:"JSON Tree Comparison",    icon:Braces,      tone:"cyan" as Tone },
                { l:"Confidence Scoring",      icon:Gauge,       tone:"emerald" as Tone },
                { l:"Engineering Recommend",   icon:Sparkles,    tone:"violet" as Tone },
              ].map((s, i) => {
                const t = tone[s.tone];
                const active = (tick + i) % 9 < 3;
                return (
                  <div key={s.l} className={`flex items-center gap-2 rounded-lg border p-1.5 transition ${active ? `${t.ring.replace("ring-","border-")} ${t.bg} shadow-sm` : "border-slate-100"}`}>
                    <div className={`h-6 w-6 rounded-md grid place-items-center ${t.bg}`}>
                      <s.icon className={`h-3 w-3 ${t.text}`} />
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 flex-1">{s.l}</div>
                    {active && <span className="text-[9px] font-mono text-emerald-600">▸ diffing</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* JSON Tree */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Braces className="h-4 w-4 text-cyan-500" /> JSON Structure Visualizer</div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10.5px]">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 space-y-0.5">
                <div className="text-[9px] uppercase text-slate-500 font-semibold mb-1">Original</div>
                <div className="text-slate-700">{'{'}</div>
                <div className="pl-3 text-slate-700">"event": {'{'}</div>
                <div className="pl-6 text-slate-700">"severity": <span className="text-blue-700">"high"</span>,</div>
                <div className="pl-6 text-slate-700">"device": {'{'}</div>
                <div className="pl-9 text-slate-700">"owner": <span className="text-blue-700">"..."</span></div>
                <div className="pl-6 text-slate-700">{'}'}</div>
                <div className="pl-3 text-slate-700">{'}'}</div>
                <div className="text-slate-700">{'}'}</div>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2 space-y-0.5">
                <div className="text-[9px] uppercase text-emerald-700 font-semibold mb-1">New</div>
                <div className="text-slate-800">{'{'}</div>
                <div className="pl-3 text-slate-800">"event": {'{'}</div>
                <div className="pl-6 text-rose-700 bg-rose-50 rounded">"severity": <span className="text-rose-700">3</span> <span className="text-[9px]">◀ type</span></div>
                <div className="pl-6 text-slate-800">"device": {'{'}</div>
                <div className="pl-9 text-amber-700 bg-amber-50 rounded">— owner (removed)</div>
                <div className="pl-6 text-slate-800">{'}'},</div>
                <div className="pl-6 text-emerald-700 bg-emerald-100 rounded">"threat_score": <span>0.92</span> ◀ new</div>
                <div className="pl-3 text-slate-800">{'}'}</div>
                <div className="text-slate-800">{'}'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px]">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500" /> added</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-500" /> removed</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-rose-500" /> changed type</span>
            </div>
          </div>

          {/* Live Drift Detection */}
          <div className="col-span-12 lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-4 text-slate-100">
            <div className="text-sm font-bold mb-2 flex items-center gap-2"><Radio className="h-4 w-4 text-emerald-400 animate-pulse" /> Live Drift Detection</div>
            <div className="font-mono text-[10.5px] leading-relaxed text-emerald-300 bg-black/40 rounded-lg p-2 h-[168px] overflow-hidden">
              {[
                `> chunk #${1820 + tick}  msg=1240 hash=0x${(0xa1f + tick).toString(16)}`,
                `  metadata ok   fields=32 nested=4`,
                `  fingerprint   sha256:9f${(tick % 99).toString().padStart(2, "0")}…`,
                `  version lookup  match=v3.1  Δ=v3.0`,
                `  diff engine   +2 fields  -1 field  ~1 type`,
                `  classify      Type Change  severity=High`,
                `  compat score  0.${820 + (tick % 40)}  ✓ backward`,
                `  auto-remediate ${8 + (tick % 4)} events`,
                `  ${2 + (tick % 3)} queued for human review`,
              ].map((l, i) => <div key={i} className="opacity-90">{l}</div>)}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[
                { l:"Msg/s",      v: (12400 + tick * 40).toString() },
                { l:"Compare/s",  v: (840 + tick * 4).toString() },
                { l:"Latency",    v: `${28 + (tick % 8)}ms` },
                { l:"CPU",        v: `${38 + (tick % 12)}%` },
                { l:"Memory",     v: `${52 + (tick % 10)}%` },
                { l:"Queue",      v: `${6 + (tick % 5)}` },
                { l:"Cache",      v: `${88 + (tick % 5)}%` },
                { l:"Drift/s",    v: `${(0.4 + (tick % 4) * 0.1).toFixed(1)}` },
              ].map((m) => (
                <div key={m.l} className="rounded bg-slate-900 border border-slate-800 p-1.5">
                  <div className="text-[9px] text-slate-400 uppercase">{m.l}</div>
                  <div className="text-[12px] font-bold tabular-nums">{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drift timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-teal-500" /> Drift Timeline · XSIAM — NGFW Traffic Logs</div>
          <div className="relative py-3">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200" />
            <div className="relative flex justify-between">
              {[
                { v:"v1", d:"Apr 12", tone:"slate" as Tone,   diff:"initial schema",           status:"baseline" },
                { v:"v2", d:"Apr 20", tone:"blue" as Tone,    diff:"+4 fields · additive",     status:"auto ✓" },
                { v:"v3", d:"Apr 28", tone:"amber" as Tone,   diff:"~2 types · reviewed",      status:"approved" },
                { v:"v4", d:"May 5",  tone:"cyan" as Tone,    diff:"JSON restructure",         status:"parser updated" },
                { v:"v5", d:"May 12", tone:"rose" as Tone,    diff:"+24 fields · type change", status:"active drift" },
              ].map((v) => {
                const t = tone[v.tone];
                return (
                  <button key={v.v} onClick={() => setDrawer({ title: `Schema ${v.v}`, kind: "version" })}
                    className="relative flex flex-col items-center group">
                    <div className={`h-9 w-9 rounded-full ${t.bg} border-2 ${t.ring.replace("ring-","border-")} grid place-items-center font-bold text-[11px] ${t.text} shadow-sm group-hover:scale-110 transition`}>
                      {v.v}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 tabular-nums">{v.d}</div>
                    <div className="text-[10.5px] font-semibold text-slate-800">{v.diff}</div>
                    <div className={`text-[10px] ${t.text} font-semibold`}>{v.status}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom operational widgets */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            { l:"Top Changing Source",     v:"XSIAM NGFW", s:"24 fields · 7d",  i:TrendingUp,   tone:"blue"    as Tone },
            { l:"Auto Remediations (7d)",  v:"142",        s:"+18 vs prior",     i:Wand2,        tone:"teal"    as Tone },
            { l:"Compatibility (avg)",     v:"94%",        s:"+1.2 wk",          i:ShieldCheck,  tone:"emerald" as Tone },
            { l:"Most Impacted App",       v:"SIEM Corr.", s:"12 consumers",     i:Boxes,        tone:"violet"  as Tone },
            { l:"Validation Coverage",     v:"99.2%",      s:"of live schemas",  i:CheckCircle2, tone:"emerald" as Tone },
            { l:"Relationship Drift",      v:"4",          s:"under review",     i:Network,      tone:"amber"   as Tone },
          ].map((w) => {
            const t = tone[w.tone];
            return (
              <button key={w.l} onClick={() => setDrawer({ title: w.l, kind: "widget" })}
                className="text-left bg-white rounded-xl border border-slate-200 p-3 hover:shadow-sm transition">
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-lg ${t.bg} grid place-items-center`}><w.i className={`h-3.5 w-3.5 ${t.text}`} /></div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{w.l}</div>
                </div>
                <div className="text-[18px] font-bold text-slate-900 mt-2 tabular-nums leading-tight">{w.v}</div>
                <div className={`text-[10px] font-semibold ${t.text}`}>{w.s}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Engineering Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-[580px] sm:max-w-[580px] p-0 overflow-y-auto">
          <SheetHeader className="p-5 border-b border-slate-200 bg-gradient-to-br from-white to-violet-50/40">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-violet-600">Engineering Drawer</div>
            <SheetTitle className="text-lg">{drawer?.title ?? ""}</SheetTitle>
            <p className="text-[11px] text-slate-500">Every drift — fingerprinted, diffed, classified, and remediated.</p>
          </SheetHeader>
          <Tabs defaultValue="overview" className="p-4">
            <TabsList className="grid grid-cols-5 h-8">
              <TabsTrigger value="overview" className="text-[11px]">Overview</TabsTrigger>
              <TabsTrigger value="engineering" className="text-[11px]">Engineering</TabsTrigger>
              <TabsTrigger value="telemetry" className="text-[11px]">Telemetry</TabsTrigger>
              <TabsTrigger value="simulation" className="text-[11px]">Simulation</TabsTrigger>
              <TabsTrigger value="deps" className="text-[11px]">Dependencies</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-3">
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Operational Impact</div>
                <p className="text-[12px] text-slate-700 mt-1">Structural evolution detected in an upstream producer. The change is versioned, backward-compatibility scored, and routed to the correct engineering owner before consumers observe schema-related failures.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Fact l="Priority" v="High" />
                <Fact l="Owner" v="SecOps Platform" />
                <Fact l="Affected Systems" v="12 downstream" />
                <Fact l="Compat Score" v="0.94" />
              </div>
            </TabsContent>

            <TabsContent value="engineering" className="mt-4">
              <div className="space-y-1.5">
                {[
                  "Metadata extraction", "Schema fingerprinting", "Schema hashing", "Diff algorithm",
                  "Canonical model generation", "Type inference", "JSON comparison", "Constraint analysis",
                  "Relationship analysis", "Compatibility scoring", "Policy engine", "Auto remediation", "Versioning",
                ].map((s, i) => (
                  <div key={s} className={`flex items-center gap-2 rounded-md border p-2 ${(tick + i) % 13 < 3 ? "border-violet-300 bg-violet-50" : "border-slate-200"}`}>
                    <div className="h-6 w-6 rounded bg-violet-100 grid place-items-center text-[10px] font-mono text-violet-700">{i + 1}</div>
                    <div className="text-[12px] text-slate-800 font-medium flex-1">{s}</div>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="telemetry" className="mt-4 grid grid-cols-2 gap-2">
              {[
                ["Comparisons/sec", `${840 + tick * 4}`],
                ["Detection latency", `${28 + (tick % 8)}ms`],
                ["Schema cache", `${88 + (tick % 5)}%`],
                ["CPU", `${38 + (tick % 12)}%`],
                ["Memory", `${52 + (tick % 10)}%`],
                ["Rule execution", `${1240 + tick}`],
                ["Drift events", `${18 + (tick % 4)}`],
                ["Queue depth", `${6 + (tick % 5)}`],
                ["Validation time", `${14 + (tick % 6)}ms`],
                ["AI confidence", `${92 + (tick % 3)}%`],
                ["Hash generation", `${640 + tick * 3}/s`],
                ["Uptime", "99.98%"],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg border border-slate-200 p-2">
                  <div className="text-[10px] uppercase text-slate-500">{l}</div>
                  <div className="text-[14px] font-bold tabular-nums text-slate-900">{v}</div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="simulation" className="mt-4 space-y-3">
              <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Field Type</label>
                  <select value={simType} onChange={(e) => setSimType(e.target.value)} className="w-full h-8 mt-1 rounded-md border border-slate-200 text-[12px] px-2">
                    {["string","integer","long","boolean","datetime","ip","json"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-[11px] text-slate-700">
                  <input type="checkbox" checked={simRequired} onChange={(e) => setSimRequired(e.target.checked)} className="accent-violet-500" />
                  Required field
                </label>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-[10px] uppercase font-semibold text-emerald-700">Live Drift Classification</div>
                <div className="text-[14px] font-bold text-slate-900 mt-1">
                  {simType === "string" ? "No drift · baseline" : simType === "integer" ? "Type Change · High" : "Structure Change · Medium"}
                </div>
                <div className="text-[11px] text-slate-600 mt-1">Compat: <span className="font-bold tabular-nums">{simType === "string" ? "100" : simRequired ? "62" : "88"}%</span></div>
                <div className="text-[11px] text-slate-600">Recommended: <span className="font-semibold">{simType === "string" ? "No action" : "Update mapping + cast"}</span></div>
              </div>
            </TabsContent>

            <TabsContent value="deps" className="mt-4 space-y-1.5">
              {[
                { l:"Source Systems",       i:Database },
                { l:"Canonical Model",      i:Boxes },
                { l:"Relationship Engine",  i:Network },
                { l:"Hydration",            i:Sparkles },
                { l:"Validation",           i:ShieldCheck },
                { l:"Data Contracts",       i:Lock },
                { l:"Consumers",            i:Users },
                { l:"Dashboards",           i:Gauge },
                { l:"Graph",                i:GitBranch },
                { l:"AI Agents",            i:BrainCircuit },
                { l:"Owners",               i:Users },
                { l:"Risk",                 i:AlertTriangle },
              ].map((d) => (
                <div key={d.l} className="flex items-center gap-2 rounded-md border border-slate-200 p-2 hover:bg-slate-50">
                  <d.i className="h-3.5 w-3.5 text-slate-500" />
                  <div className="text-[12px] text-slate-800 font-medium">{d.l}</div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Fact({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-2">
      <div className="text-[10px] uppercase text-slate-500 font-semibold">{l}</div>
      <div className="text-[13px] font-bold text-slate-900">{v}</div>
    </div>
  );
}

function DriftDetail({ row, onOpenDrawer }: { row: Row; onOpenDrawer: (kind: string) => void }) {
  const [t, setT] = useState(0);
  const tabs: [string, React.ReactNode][] = [
    ["Overview", (
      <div className="grid grid-cols-4 gap-2 text-[11px]">
        <Fact l="Source" v={row.source} />
        <Fact l="Platform" v={row.platform} />
        <Fact l="Version" v={row.version} />
        <Fact l="Drift" v={row.drift} />
        <Fact l="Severity" v={row.severity} />
        <Fact l="Fields Affected" v={String(row.fields)} />
        <Fact l="Confidence" v={`${row.confidence}%`} />
        <Fact l="Owner" v={row.owner} />
      </div>
    )],
    ["Previous Schema", (
      <div className="font-mono text-[11px] bg-slate-950 text-slate-300 rounded p-3 space-y-0.5">
        {["{","  \"src_ip\": \"string\",","  \"dst_ip\": \"string\",","  \"severity\": \"string\",","  \"bytes\": \"long\"","}"].map((l, i) => <div key={i}>{l}</div>)}
      </div>
    )],
    ["Current Schema", (
      <div className="font-mono text-[11px] bg-slate-950 text-emerald-300 rounded p-3 space-y-0.5">
        {["{","  \"src_ip\": \"string\",","  \"dst_ip\": \"string\",","  \"severity\": \"integer\",  // ⚠ type change","  \"bytes\": \"long\",","  \"threat_score\": \"float\"  // + new","}"].map((l, i) => <div key={i}>{l}</div>)}
      </div>
    )],
    ["Engineering", (
      <div className="flex items-center gap-1 overflow-x-auto">
        {["Incoming","Metadata","Fingerprint","Comparison","Classification","Recommendation","Canonical","Operational"].map((l, i) => (
          <>
            <div key={l} className="rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 shrink-0">{l}</div>
            {i < 7 && <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />}
          </>
        ))}
      </div>
    )],
    ["Compatibility", (
      <div className="grid grid-cols-3 gap-2">
        {[["Backward","0.94"],["Forward","0.88"],["Consumer","0.91"],["Contract","0.96"],["Runtime","0.87"],["Overall","0.91"]].map(([l, v]) => (
          <div key={l} className="rounded border border-emerald-200 bg-emerald-50 p-2">
            <div className="text-[10px] uppercase text-emerald-700 font-semibold">{l}</div>
            <div className="text-[14px] font-bold text-slate-900 tabular-nums">{v}</div>
          </div>
        ))}
      </div>
    )],
    ["Consumers", (
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        {["SIEM Correlation","SOAR Playbook","Exec Risk KPI","Fraud Detection","Threat Hunt","Compliance Report"].map((c) => (
          <div key={c} className="rounded border border-slate-200 bg-white p-2 font-semibold text-slate-800">{c}</div>
        ))}
      </div>
    )],
    ["History", (
      <div className="text-[11px] space-y-1 text-slate-700">
        {["v4.3 · active drift · 24 fields · High","v4.2 · promoted · +4 fields · Low","v4.1 · reviewed · type refinement","v4.0 · baseline"].map((l) => (
          <div key={l} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{l}</div>
        ))}
      </div>
    )],
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          {tabs.map(([l], i) => (
            <button key={l} onClick={() => setT(i)}
              className={`text-[11px] px-2.5 py-1 rounded-md font-semibold ${i === t ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onOpenDrawer("engineering")} className="text-[11px] font-semibold text-violet-700 hover:underline inline-flex items-center gap-1"><Eye className="h-3 w-3" /> Full engineering drawer</button>
          <button className="text-[11px] font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"><Play className="h-3 w-3" /> Simulate</button>
          <button className="text-[11px] font-semibold text-slate-600 hover:underline inline-flex items-center gap-1"><Settings2 className="h-3 w-3" /> Modify</button>
        </div>
      </div>
      <div>{tabs[t][1]}</div>
    </div>
  );
}
