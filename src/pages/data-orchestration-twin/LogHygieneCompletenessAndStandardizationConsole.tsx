import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck, PieChart, Layers, Fingerprint, SlidersHorizontal, AlertTriangle, Copy, BrainCircuit,
  Filter, Download, RefreshCw, CalendarClock, Search, ChevronRight, ChevronDown,
  Workflow, ScanLine, Sparkles, CheckCircle2, XCircle, Radio, Gauge, TrendingUp, Play,
  Boxes, Network, Users, Lock, Link2, ArrowRight, Bell, Eye, Settings2, FileCode,
  Wand2, Database, GitBranch, Clock,
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
  { icon: ShieldCheck,        label: "Overall Hygiene",       value: "87%",   sub: "Target ≥ 90%",   delta: "+2",  tone: "emerald" as Tone, spark: [82,83,84,85,85,86,87], target: 90 },
  { icon: PieChart,           label: "Completeness",          value: "88%",   sub: "Target ≥ 90%",   delta: "+1",  tone: "blue"    as Tone, spark: [83,84,85,86,87,87,88], target: 90 },
  { icon: Layers,             label: "Structural Integrity",  value: "91%",   sub: "Target ≥ 90%",   delta: "+0.6",tone: "teal"    as Tone, spark: [88,88,89,90,90,91,91], target: 90 },
  { icon: Fingerprint,        label: "Required Identifiers",  value: "92%",   sub: "Target ≥ 90%",   delta: "+2",  tone: "violet"  as Tone, spark: [86,87,88,89,90,91,92], target: 90 },
  { icon: SlidersHorizontal,  label: "Field Standardization", value: "86%",   sub: "Target ≥ 90%",   delta: "+1.2",tone: "cyan"    as Tone, spark: [80,82,83,84,85,86,86], target: 90 },
  { icon: AlertTriangle,      label: "Malformed Records",     value: "0.62%", sub: "Target < 1%",    delta: "-0.1",tone: "amber"   as Tone, spark: [0.9,0.85,0.8,0.75,0.7,0.65,0.62], target: 1 },
  { icon: Copy,               label: "Duplicate Records",     value: "0.48%", sub: "Target < 1%",    delta: "-0.2",tone: "rose"    as Tone, spark: [0.9,0.82,0.72,0.66,0.58,0.52,0.48], target: 1 },
  { icon: BrainCircuit,       label: "Semantic Consistency",  value: "85%",   sub: "Target ≥ 90%",   delta: "+1.4",tone: "violet"  as Tone, spark: [78,80,81,82,83,84,85], target: 90 },
];

type Status = "Excellent" | "Good" | "Needs Attention" | "Needs Work";
const statusStyle: Record<Status, string> = {
  Excellent:         "bg-emerald-100 text-emerald-800",
  Good:              "bg-emerald-50 text-emerald-700",
  "Needs Attention": "bg-amber-50 text-amber-700",
  "Needs Work":      "bg-rose-50 text-rose-700",
};

type Row = {
  id: number; source: string; platform: string; volume: string;
  completeness: number; integrity: number; identifiers: number; standardization: number;
  malformed: number; dup: number; semantic: number; hygiene: number; status: Status;
  confidence: number; trend: number[];
};

const ROWS: Row[] = [
  { id:1,  source:"XSIAM — NGFW Traffic Logs", platform:"Cortex XSIAM", volume:"58.7M", completeness:89, integrity:93, identifiers:94, standardization:87, malformed:0.41, dup:0.33, semantic:86, hygiene:88, status:"Good",            confidence:94, trend:[85,86,87,87,88,88,88] },
  { id:2,  source:"GlobalProtect VPN Logs",    platform:"Cortex XSIAM", volume:"12.4M", completeness:91, integrity:92, identifiers:95, standardization:90, malformed:0.32, dup:0.21, semantic:88, hygiene:90, status:"Good",            confidence:96, trend:[88,88,89,89,90,90,90] },
  { id:3,  source:"NGFW System Events",        platform:"Cortex XSIAM", volume:"8.1M",  completeness:82, integrity:88, identifiers:90, standardization:80, malformed:0.92, dup:0.67, semantic:81, hygiene:83, status:"Needs Attention", confidence:82, trend:[79,80,81,81,82,82,83] },
  { id:4,  source:"Threat Intel Feeds",        platform:"REST API",     volume:"3.6M",  completeness:95, integrity:96, identifiers:98, standardization:94, malformed:0.18, dup:0.05, semantic:93, hygiene:95, status:"Excellent",       confidence:98, trend:[93,94,94,94,95,95,95] },
  { id:5,  source:"Device Performance Stats",  platform:"LogicMonitor", volume:"24.9M", completeness:87, integrity:90, identifiers:91, standardization:84, malformed:0.68, dup:0.40, semantic:84, hygiene:86, status:"Good",            confidence:90, trend:[83,84,85,85,86,86,86] },
  { id:6,  source:"Cloud Audit Logs",          platform:"BigQuery",     volume:"18.3M", completeness:86, integrity:89, identifiers:90, standardization:83, malformed:0.71, dup:0.62, semantic:83, hygiene:85, status:"Good",            confidence:89, trend:[81,82,83,84,84,85,85] },
  { id:7,  source:"User Activity Logs",        platform:"REST API",     volume:"7.2M",  completeness:78, integrity:82, identifiers:84, standardization:75, malformed:1.35, dup:1.02, semantic:74, hygiene:76, status:"Needs Work",      confidence:72, trend:[74,75,75,76,76,76,76] },
  { id:8,  source:"SaaS Audit Events",         platform:"REST API",     volume:"2.1M",  completeness:92, integrity:94, identifiers:96, standardization:90, malformed:0.22, dup:0.18, semantic:89, hygiene:92, status:"Excellent",       confidence:95, trend:[89,90,91,91,92,92,92] },
  { id:9,  source:"Container Logs",            platform:"Kubernetes API",volume:"11.6M",completeness:84, integrity:87, identifiers:89, standardization:81, malformed:0.63, dup:0.59, semantic:82, hygiene:84, status:"Good",            confidence:87, trend:[80,81,82,82,83,84,84] },
  { id:10, source:"DNS Query Logs",            platform:"CoreDNS",      volume:"5.5M",  completeness:76, integrity:81, identifiers:82, standardization:72, malformed:1.23, dup:0.98, semantic:73, hygiene:75, status:"Needs Work",      confidence:70, trend:[72,73,73,74,74,75,75] },
];

const PIPELINE = [
  { l:"Incoming Log",           icon:Database },
  { l:"Schema Validation",      icon:FileCode },
  { l:"Completeness Analysis",  icon:PieChart },
  { l:"Field Standardization",  icon:SlidersHorizontal },
  { l:"Identity Resolution",    icon:Fingerprint },
  { l:"Semantic Validation",    icon:BrainCircuit },
  { l:"Duplicate Detection",    icon:Copy },
  { l:"Quality Scoring",        icon:Gauge },
  { l:"Confidence Scoring",     icon:Sparkles },
  { l:"Canonical Record",       icon:GitBranch },
  { l:"Operational Model",      icon:Boxes },
];

const ISSUES = [
  { key:"missing",  label:"Missing Required Fields", count:32, tone:"rose"    as Tone, icon:AlertTriangle },
  { key:"stand",    label:"Non-standard Values",     count:28, tone:"amber"   as Tone, icon:SlidersHorizontal },
  { key:"null",     label:"High Null Rate",          count:22, tone:"amber"   as Tone, icon:PieChart },
  { key:"malfjs",   label:"Malformed JSON",          count:9,  tone:"violet"  as Tone, icon:FileCode },
  { key:"dup",      label:"Duplicate Records",       count:7,  tone:"rose"    as Tone, icon:Copy },
  { key:"missid",   label:"Missing IDs",             count:6,  tone:"blue"    as Tone, icon:Fingerprint },
  { key:"ts",       label:"Timestamp Problems",      count:4,  tone:"cyan"    as Tone, icon:Clock },
  { key:"enc",      label:"Encoding Issues",         count:3,  tone:"slate"   as Tone, icon:FileCode },
];

const QUALITY_BARS = [
  { l:"Completeness",     v:88, tone:"blue"    as Tone },
  { l:"Integrity",        v:91, tone:"teal"    as Tone },
  { l:"Standardization",  v:86, tone:"cyan"    as Tone },
  { l:"Semantic",         v:85, tone:"violet"  as Tone },
  { l:"Validation",       v:99, tone:"emerald" as Tone },
  { l:"De-duplication",   v:99.5,tone:"emerald"as Tone },
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

function HygieneGauge({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, value));
  const angle = (v / 100) * 180 - 180;
  const R = 46, cx = 60, cy = 60;
  const rad = (a: number) => (a * Math.PI) / 180;
  const x = cx + R * Math.cos(rad(angle));
  const y = cy + R * Math.sin(rad(angle));
  return (
    <svg viewBox="0 0 120 78" className="w-full h-32">
      <defs>
        <linearGradient id="gauge" x1="0" x2="1">
          <stop offset="0" stopColor="#f43f5e" />
          <stop offset=".5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} stroke="url(#gauge)" strokeWidth="12" fill="none" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={x} y2={y} stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill="#0f172a" />
      <text x={cx} y={cy - 18} textAnchor="middle" className="fill-slate-900" fontSize="16" fontWeight="700">{v}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-slate-500" fontSize="8">Hygiene Score</text>
    </svg>
  );
}

/* ---------- component ---------- */
export default function LogHygieneCompletenessAndStandardizationConsole() {
  const [selected, setSelected] = useState<Row | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [drawer, setDrawer] = useState<{ title: string; kind: string } | null>(null);
  const [tick, setTick] = useState(0);
  const [simMissing, setSimMissing] = useState(12);
  const [simDup, setSimDup] = useState(0.5);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => (n + 1) % 1000), 900);
    return () => clearInterval(t);
  }, []);

  const rows = useMemo(() => ROWS.filter(r =>
    (statusFilter === "All" || r.status === statusFilter) &&
    (query === "" || (r.source + r.platform).toLowerCase().includes(query.toLowerCase()))
  ), [query, statusFilter]);

  const activeStage = tick % PIPELINE.length;

  const distribution = [
    { l:"Excellent (≥95%)",     v:12, color:"#10b981" },
    { l:"Good (85–94%)",        v:21, color:"#34d399" },
    { l:"Needs Attention (70–84%)", v:8, color:"#f59e0b" },
    { l:"Needs Work (<70%)",    v:4,  color:"#f43f5e" },
  ];
  const maxDist = Math.max(...distribution.map((d) => d.v));

  const simScore = Math.max(0, Math.min(100, Math.round(100 - simMissing * 1.8 - simDup * 6)));

  return (
    <div className="px-6 py-5 space-y-5 max-w-[1920px] mx-auto bg-white">
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-teal-600">
            <ShieldCheck className="h-3.5 w-3.5" /> Schema & Hygiene · Quality Control Plane
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 mt-1">Log Hygiene, Completeness &amp; Standardization Console</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-4xl">
            Continuously evaluate, standardize, validate, and improve enterprise operational telemetry before downstream consumption.
          </p>
          <p className="text-[12px] text-slate-500 mt-1 max-w-4xl leading-relaxed">
            Every incoming record is evaluated through engineering quality services before entering the operational data model,
            graph engine, or AI platform. Raw data is never assumed trustworthy — every record earns trust through engineering.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 mr-2 text-right leading-tight">
            <div>Last Updated</div>
            <div className="font-semibold text-slate-700 tabular-nums">May 12, 2025 · 10:32 AM</div>
          </div>
          <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><Filter className="h-3.5 w-3.5" /> Filters</button>
          <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Quality Policy</button>
          <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> May 5 – May 12</button>
          <button className="h-9 px-3 rounded-lg bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 inline-flex items-center gap-1.5 shadow-sm"><Download className="h-3.5 w-3.5" /> Export Report</button>
        </div>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-4 xl:grid-cols-8 gap-3">
        {KPIS.map((k) => {
          const t = tone[k.tone];
          const isPct = !k.value.endsWith("%") ? false : true;
          const numeric = parseFloat(k.value);
          const isInverse = k.label.includes("Malformed") || k.label.includes("Duplicate");
          const healthy = isInverse ? numeric <= k.target : numeric >= k.target;
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
                <span className={`text-[10px] font-semibold ${healthy ? "text-emerald-600" : "text-amber-600"}`}>
                  {k.delta.startsWith("-") ? "▼" : "▲"} {k.delta}
                </span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mt-2">{k.label}</div>
              <div className="text-[22px] font-bold text-slate-900 leading-tight tabular-nums">{k.value}</div>
              <div className={`text-[10px] font-semibold ${healthy ? "text-emerald-600" : "text-amber-600"}`}>{k.sub}</div>
              <Spark data={k.spark} color={t.hex} />
            </button>
          );
        })}
      </section>

      {/* Main workspace */}
      <section className="grid grid-cols-12 gap-4">
        {/* Left/main: Registry + Trend + Issues */}
        <div className="col-span-12 xl:col-span-9 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[15px] font-bold text-slate-900">Enterprise Data Quality Registry</div>
                <div className="text-[11px] text-slate-500">45 sources monitored · {rows.length} shown · click a row to inspect</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search source…" className="pl-8 pr-3 h-8 rounded-lg border border-slate-200 text-[12px] w-56 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="h-8 rounded-lg border border-slate-200 text-[12px] px-2 bg-white">
                  {["All","Excellent","Good","Needs Attention","Needs Work"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                    {["Source","Platform","Volume","Complete","Integrity","IDs","Standard","Malformed","Dup","Semantic","Hygiene","Status","Trend"].map((h) => (
                      <th key={h} className="py-2 pr-3 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const isOpen = expanded === r.id;
                    const cell = (v: number, inverse = false) => {
                      const bad = inverse ? v > 1 : v < 80;
                      const warn = inverse ? v > 0.5 : v < 90;
                      return <span className={`${bad ? "bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded" : warn ? "bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded" : "text-slate-700"} tabular-nums font-semibold`}>{v}{inverse ? "%" : "%"}</span>;
                    };
                    return (
                      <>
                        <tr key={r.id}
                          onClick={() => { setSelected(r); setExpanded(isOpen ? null : r.id); }}
                          className="border-b border-slate-100 hover:bg-slate-50/70 cursor-pointer transition">
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                              {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                              <ShieldCheck className={`h-3.5 w-3.5 ${r.hygiene >= 90 ? "text-emerald-500" : r.hygiene >= 80 ? "text-amber-500" : "text-rose-500"}`} />
                              {r.source}
                            </div>
                          </td>
                          <td className="py-2.5 pr-3 text-slate-600">{r.platform}</td>
                          <td className="py-2.5 pr-3 tabular-nums text-slate-700">{r.volume}</td>
                          <td className="py-2.5 pr-3">{cell(r.completeness)}</td>
                          <td className="py-2.5 pr-3">{cell(r.integrity)}</td>
                          <td className="py-2.5 pr-3">{cell(r.identifiers)}</td>
                          <td className="py-2.5 pr-3">{cell(r.standardization)}</td>
                          <td className="py-2.5 pr-3">{cell(r.malformed, true)}</td>
                          <td className="py-2.5 pr-3">{cell(r.dup, true)}</td>
                          <td className="py-2.5 pr-3">{cell(r.semantic)}</td>
                          <td className="py-2.5 pr-3">
                            <span className={`px-2 py-0.5 rounded font-bold tabular-nums text-[11px] ${
                              r.hygiene >= 90 ? "bg-emerald-100 text-emerald-800" :
                              r.hygiene >= 80 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                            }`}>{r.hygiene}%</span>
                          </td>
                          <td className="py-2.5 pr-3"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusStyle[r.status]}`}>{r.status}</span></td>
                          <td className="py-2.5 pr-3 w-20"><Spark data={r.trend} color="#3b82f6" /></td>
                        </tr>
                        {isOpen && (
                          <tr className="bg-slate-50/60">
                            <td colSpan={13} className="p-4">
                              <SourceDetail row={r} onOpenDrawer={(k) => setDrawer({ title: `${r.source} · ${k}`, kind: k })} />
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

          <div className="grid grid-cols-2 gap-4">
            {/* Trend */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-sm font-bold text-slate-900 mb-2">Hygiene Score Trend (Last 30 Days)</div>
              <svg viewBox="0 0 400 160" className="w-full h-40">
                {[70, 80, 90, 100].map((y) => (
                  <g key={y}>
                    <line x1="24" x2="400" y1={160 - ((y - 60) / 40) * 140 - 10} y2={160 - ((y - 60) / 40) * 140 - 10} stroke="#f1f5f9" strokeWidth="1" />
                    <text x="0" y={160 - ((y - 60) / 40) * 140 - 6} className="fill-slate-400" fontSize="8">{y}</text>
                  </g>
                ))}
                {/* Target line */}
                <line x1="24" x2="400" y1={160 - ((90 - 60) / 40) * 140 - 10} y2={160 - ((90 - 60) / 40) * 140 - 10} stroke="#10b981" strokeDasharray="3 3" strokeWidth="1" />
                {(() => {
                  const data = [88,86,84,83,82,84,86,87,88,88,89,89,88,88,87,87,88,89,89,88,88,87,87,87,88,88,87,87,87,87];
                  const pts = data.map((v, i) => `${24 + (i / (data.length - 1)) * 376},${160 - ((v - 60) / 40) * 140 - 10}`).join(" ");
                  return (
                    <>
                      <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="2" />
                      {data.map((v, i) => (
                        <circle key={i} cx={24 + (i / (data.length - 1)) * 376} cy={160 - ((v - 60) / 40) * 140 - 10} r="2" fill="#3b82f6" />
                      ))}
                    </>
                  );
                })()}
              </svg>
              <div className="grid grid-cols-4 gap-2 mt-2 text-center">
                {[["30-Day Avg","86%"],["Best Day","92%"],["Lowest","79%"],["Days ≥ 90%","12/30"]].map(([l, v]) => (
                  <div key={l} className="rounded border border-slate-200 p-1.5">
                    <div className="text-[9px] uppercase text-slate-500">{l}</div>
                    <div className="text-[13px] font-bold text-slate-900 tabular-nums">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Issue breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-sm font-bold text-slate-900 mb-2">Issue Breakdown (Last 7 Days)</div>
              <div className="grid grid-cols-2 gap-2">
                {ISSUES.map((i) => {
                  const t = tone[i.tone];
                  return (
                    <button key={i.key} onClick={() => setDrawer({ title: i.label, kind: "issue" })}
                      className={`text-left rounded-lg border ${t.ring.replace("ring-","border-")} ${t.bg} p-2 hover:shadow-sm transition`}>
                      <i.icon className={`h-4 w-4 ${t.text}`} />
                      <div className="text-[11px] font-semibold text-slate-800 mt-1">{i.label}</div>
                      <div className={`text-[16px] font-bold ${t.text} tabular-nums leading-none mt-1`}>{i.count}</div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[12px]">
                <span className="font-semibold text-slate-700">Total Issues</span>
                <span className="text-[16px] font-bold text-slate-900 tabular-nums">99</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right intel panel */}
        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-1">Overall Hygiene Score</div>
            <HygieneGauge value={87} />
            <div className="text-center text-[11px] text-emerald-600 font-semibold -mt-2">Target ≥ 90%</div>
            <div className="mt-3 space-y-1.5">
              {distribution.map((d) => (
                <div key={d.l} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 w-40 shrink-0">
                    <span className="h-2 w-2 rounded-sm" style={{ background: d.color }} />
                    <span className="text-[10.5px] text-slate-700">{d.l}</span>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${(d.v / maxDist) * 100}%`, background: d.color }} />
                  </div>
                  <div className="w-6 text-right text-[10.5px] font-semibold text-slate-800 tabular-nums">{d.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-2">Quality Distribution</div>
            <div className="space-y-2">
              {QUALITY_BARS.map((b) => {
                const t = tone[b.tone];
                return (
                  <button key={b.l} onClick={() => setDrawer({ title: b.l, kind: "quality" })} className="w-full text-left">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700">{b.l}</span>
                      <span className="tabular-nums font-semibold text-slate-900">{b.v}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full transition-all" style={{ width: `${b.v}%`, background: t.hex }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-slate-900">Top Hygiene Issues</div>
              <Bell className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="space-y-2">
              {[
                { icon:AlertTriangle, tone:"rose"   as Tone, title:"Missing required field: user.id",   sub:"User Activity Logs",      rows:"2.1M rows" },
                { icon:AlertTriangle, tone:"amber"  as Tone, title:"Non-standardized values: action",   sub:"NGFW System Events",      rows:"1.8M rows" },
                { icon:AlertTriangle, tone:"amber"  as Tone, title:"High null rate: src_port",          sub:"GlobalProtect VPN Logs",  rows:"1.2M rows" },
                { icon:FileCode,      tone:"violet" as Tone, title:"Malformed JSON in message",         sub:"Container Logs",          rows:"956K rows" },
                { icon:Copy,          tone:"rose"   as Tone, title:"Duplicate rows detected",           sub:"DNS Query Logs",          rows:"842K rows" },
              ].map((a) => {
                const t = tone[a.tone];
                return (
                  <div key={a.title} className="flex items-start gap-2 text-[11px]">
                    <div className={`h-6 w-6 rounded-md ${t.bg} grid place-items-center shrink-0`}><a.icon className={`h-3 w-3 ${t.text}`} /></div>
                    <div className="flex-1">
                      <div className="text-slate-800 font-semibold leading-tight">{a.title}</div>
                      <div className="text-slate-500 text-[10px]">{a.sub}</div>
                    </div>
                    <div className="text-[10px] text-slate-500 tabular-nums whitespace-nowrap">{a.rows}</div>
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
            <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-600">Engineering Transparency</div>
            <h2 className="text-[22px] font-bold tracking-tight text-slate-900">How Trusted Operational Data Is Engineered</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Raw log → validate → standardize → resolve → dedupe → score → canonical operational record.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Quality engine live
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Workflow className="h-4 w-4 text-teal-500" /> Data Quality Engineering Pipeline</div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {PIPELINE.map((s, i) => {
              const active = i === activeStage;
              return (
                <>
                  <button key={s.l} onClick={() => setDrawer({ title: s.l, kind: "stage" })}
                    className={`shrink-0 rounded-lg border p-2 w-[135px] text-left transition-all ${active ? "border-teal-400 bg-teal-50 shadow-md scale-[1.03]" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-6 w-6 rounded-md grid place-items-center ${active ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-600"}`}>
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
          {/* Data Quality Engine */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-blue-500" /> Data Quality Engine</div>
            <div className="space-y-1.5">
              {[
                { l:"Raw Record",             icon:Database,           tone:"slate" as Tone },
                { l:"Metadata",               icon:FileCode,           tone:"blue" as Tone },
                { l:"Validation Rules",       icon:ShieldCheck,        tone:"emerald" as Tone },
                { l:"Required Field Engine",  icon:Fingerprint,        tone:"violet" as Tone },
                { l:"Normalization Rules",    icon:SlidersHorizontal,  tone:"cyan" as Tone },
                { l:"Business Rules",         icon:Lock,               tone:"amber" as Tone },
                { l:"Identity Resolver",      icon:Users,              tone:"teal" as Tone },
                { l:"Duplicate Engine",       icon:Copy,               tone:"rose" as Tone },
                { l:"Semantic Engine",        icon:BrainCircuit,       tone:"violet" as Tone },
                { l:"Confidence Calculator",  icon:Sparkles,           tone:"cyan" as Tone },
                { l:"Final Quality Score",    icon:Gauge,              tone:"emerald" as Tone },
              ].map((s, i) => {
                const t = tone[s.tone];
                const active = (tick + i) % 11 < 3;
                return (
                  <div key={s.l} className={`flex items-center gap-2 rounded-lg border p-1.5 transition ${active ? `${t.ring.replace("ring-","border-")} ${t.bg} shadow-sm` : "border-slate-100"}`}>
                    <div className={`h-6 w-6 rounded-md grid place-items-center ${t.bg}`}>
                      <s.icon className={`h-3 w-3 ${t.text}`} />
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 flex-1">{s.l}</div>
                    {active && <span className="text-[9px] font-mono text-emerald-600">▸ scoring</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Standardization Engine */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-cyan-500" /> Standardization Engine</div>
            <div className="space-y-2">
              {[
                { l:"Country Names", raw:"USA · U.S.A · United States", canon:"US",           conf:99 },
                { l:"Time Zones",    raw:"CST · America/Chicago · -06", canon:"America/Chicago", conf:98 },
                { l:"Hostnames",     raw:"web-01 · web01.corp.com",     canon:"web01.corp.com",  conf:96 },
                { l:"User IDs",      raw:"jdoe · john.doe@corp",        canon:"u_00341289",      conf:94 },
                { l:"Severity",      raw:"HIGH · 3 · warn+",            canon:"high",            conf:97 },
                { l:"Device Types",  raw:"lap · Laptop · MBP16",        canon:"laptop",          conf:92 },
              ].map((r) => (
                <div key={r.l} className="rounded-lg border border-slate-200 p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">{r.l}</div>
                    <div className="text-[10px] font-bold text-emerald-600 tabular-nums">{r.conf}%</div>
                  </div>
                  <div className="grid grid-cols-[1fr_12px_1fr] items-center gap-1 text-[10.5px] font-mono">
                    <div className="text-slate-500 truncate bg-slate-50 rounded px-1 py-0.5">{r.raw}</div>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <div className="text-emerald-700 font-semibold bg-emerald-50 rounded px-1 py-0.5 truncate">{r.canon}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Quality Processing */}
          <div className="col-span-12 lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-4 text-slate-100">
            <div className="text-sm font-bold mb-2 flex items-center gap-2"><Radio className="h-4 w-4 text-emerald-400 animate-pulse" /> Live Quality Processing</div>
            <div className="font-mono text-[10.5px] leading-relaxed text-emerald-300 bg-black/40 rounded-lg p-2 h-[168px] overflow-hidden">
              {[
                `> ingest batch #${2140 + tick}  records=8240`,
                `  schema validate  ✓ 8218  ✗ 22`,
                `  completeness    98.6%  missing=user.id×14`,
                `  normalize       6120 fields  ✓ ${94 + (tick % 4)}%`,
                `  identity resolve  ${820 + (tick * 3)} merged`,
                `  dedup engine    removed ${18 + (tick % 6)} dups`,
                `  semantic check  ${820 + tick} pass · 3 flag`,
                `  quality score   avg ${86 + (tick % 3)}%`,
                `  canonical write ✓ ${8180 + tick}`,
              ].map((l, i) => <div key={i} className="opacity-90">{l}</div>)}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[
                { l:"Rec/s",    v: (8240 + tick * 12).toString() },
                { l:"Workers",  v: `${24 + (tick % 4)}` },
                { l:"Latency",  v: `${22 + (tick % 8)}ms` },
                { l:"Queue",    v: `${6 + (tick % 5)}` },
                { l:"CPU",      v: `${42 + (tick % 12)}%` },
                { l:"Memory",   v: `${58 + (tick % 8)}%` },
                { l:"Reject/s", v: `${(0.4 + (tick % 4) * 0.1).toFixed(1)}` },
                { l:"Quality",  v: `${86 + (tick % 3)}%` },
              ].map((m) => (
                <div key={m.l} className="rounded bg-slate-900 border border-slate-800 p-1.5">
                  <div className="text-[9px] text-slate-400 uppercase">{m.l}</div>
                  <div className="text-[12px] font-bold tabular-nums">{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Before/After */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Wand2 className="h-4 w-4 text-violet-500" /> Before → After Transformation</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold mb-2">Raw Record</div>
              <div className="font-mono text-[11px] space-y-1 text-slate-700">
                {[
                  { l:"user",       v:"jdoe",                warn:"free-text" },
                  { l:"host",       v:"web-01",              warn:"non-fqdn" },
                  { l:"severity",   v:"HIGH",                warn:"non-canonical" },
                  { l:"ts",         v:"05/12/25 09:14 CST",  warn:"mixed format" },
                  { l:"country",    v:"U.S.A",               warn:"non-standard" },
                  { l:"action",     v:"—",                   warn:"missing" },
                ].map((f) => (
                  <div key={f.l} className="flex items-center justify-between">
                    <span><span className="text-slate-400">{f.l}:</span> {f.v}</span>
                    <span className="text-[9px] text-amber-700 bg-amber-50 rounded px-1">{f.warn}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
              <div className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold mb-2">Canonical Operational Record</div>
              <div className="font-mono text-[11px] space-y-1 text-slate-800">
                {[
                  ["user.id","u_00341289"],
                  ["observer.hostname","web01.corp.com"],
                  ["event.severity","high"],
                  ["event.timestamp","2025-05-12T15:14:00Z"],
                  ["source.geo.country","US"],
                  ["event.action","allow (inferred)"],
                ].map(([a, b]) => (
                  <div key={a} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span className="text-blue-700 font-semibold">{a}:</span>
                    <span className="text-slate-800">{b}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-emerald-200">
                {[["Quality","96%"],["Confidence","0.94"],["Lineage","✓ traced"]].map(([l, v]) => (
                  <div key={l} className="rounded bg-white border border-emerald-100 p-1.5 text-center">
                    <div className="text-[9px] uppercase text-emerald-700 font-semibold">{l}</div>
                    <div className="text-[12px] font-bold text-slate-900 tabular-nums">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom operational widgets */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            { l:"Rule Coverage",         v:"1,842",   s:"active rules",       i:ShieldCheck, tone:"emerald" as Tone },
            { l:"Automation Success",    v:"96%",     s:"auto-repaired",      i:Wand2,       tone:"teal"    as Tone },
            { l:"Top Improvement",       v:"NGFW",    s:"+8% last 30d",       i:TrendingUp,  tone:"blue"    as Tone },
            { l:"Validation Policies",   v:"124",     s:"12 pending review",  i:Lock,        tone:"violet"  as Tone },
            { l:"Recent Rule Changes",   v:"18",      s:"last 7 days",        i:GitBranch,   tone:"cyan"    as Tone },
            { l:"Records Processed",     v:"183M",    s:"24h",                i:Database,    tone:"amber"   as Tone },
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
          <SheetHeader className="p-5 border-b border-slate-200 bg-gradient-to-br from-white to-teal-50/40">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-teal-600">Engineering Drawer</div>
            <SheetTitle className="text-lg">{drawer?.title ?? ""}</SheetTitle>
            <p className="text-[11px] text-slate-500">Every record — validated, standardized, resolved, deduped, scored.</p>
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
                <p className="text-[12px] text-slate-700 mt-1">Every metric on this console reflects the engineering trust of records reaching downstream analytics, graph projection, and AI agents. Failures here become failures in production insight.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Fact l="Priority" v="High" />
                <Fact l="Owner" v="Data Platform" />
                <Fact l="Consumers" v="24 downstream" />
                <Fact l="Confidence" v="0.94" />
              </div>
            </TabsContent>

            <TabsContent value="engineering" className="mt-4">
              <div className="space-y-1.5">
                {[
                  "Validation engine","Schema validation","Completeness evaluation","Standardization engine",
                  "Identity resolution","Business rules","Duplicate detection","Semantic validator",
                  "Confidence engine","Canonical model creation",
                ].map((s, i) => (
                  <div key={s} className={`flex items-center gap-2 rounded-md border p-2 ${(tick + i) % 10 < 3 ? "border-teal-300 bg-teal-50" : "border-slate-200"}`}>
                    <div className="h-6 w-6 rounded bg-teal-100 grid place-items-center text-[10px] font-mono text-teal-700">{i + 1}</div>
                    <div className="text-[12px] text-slate-800 font-medium flex-1">{s}</div>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="telemetry" className="mt-4 grid grid-cols-2 gap-2">
              {[
                ["Records/sec", `${8240 + tick * 12}`],
                ["Validation latency", `${22 + (tick % 8)}ms`],
                ["Rejected records", `${(0.4 + (tick % 4) * 0.1).toFixed(2)}%`],
                ["Recovered records", `${(96 + (tick % 3))}%`],
                ["Normalization rate", `${94 + (tick % 4)}%`],
                ["Duplicates removed", `${18 + (tick % 6)}/s`],
                ["Confidence avg", `0.${900 + (tick % 40)}`],
                ["CPU", `${42 + (tick % 12)}%`],
                ["Memory", `${58 + (tick % 8)}%`],
                ["Rule exec/sec", `${1240 + tick}`],
                ["Queue depth", `${6 + (tick % 5)}`],
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
                <label className="text-[11px] font-semibold text-slate-700">Missing Fields: <span className="text-teal-600 tabular-nums">{simMissing}%</span></label>
                <input type="range" min={0} max={40} value={simMissing} onChange={(e) => setSimMissing(+e.target.value)} className="w-full accent-teal-500" />
                <label className="text-[11px] font-semibold text-slate-700 mt-2 block">Duplicate Rate: <span className="text-teal-600 tabular-nums">{simDup.toFixed(2)}%</span></label>
                <input type="range" min={0} max={5} step={0.1} value={simDup} onChange={(e) => setSimDup(+e.target.value)} className="w-full accent-teal-500" />
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-[10px] uppercase font-semibold text-emerald-700">Live Quality Recomputation</div>
                <div className="text-[22px] font-bold text-slate-900 mt-1 tabular-nums">{simScore}%</div>
                <div className="text-[11px] text-slate-600">Operational readiness: <span className="font-semibold">{simScore >= 90 ? "Ready" : simScore >= 80 ? "Attention" : "Not ready"}</span></div>
                <div className="text-[11px] text-slate-600">Confidence: <span className="font-bold tabular-nums">{(simScore / 100).toFixed(2)}</span></div>
              </div>
            </TabsContent>

            <TabsContent value="deps" className="mt-4 space-y-1.5">
              {[
                { l:"Validation Engine",      i:ShieldCheck },
                { l:"Hydration",              i:Sparkles },
                { l:"Relationship Builder",   i:Network },
                { l:"Canonical Model",        i:Boxes },
                { l:"Graph",                  i:GitBranch },
                { l:"AI Platform",            i:BrainCircuit },
                { l:"Consumers",              i:Users },
                { l:"Policies",               i:Lock },
                { l:"Owners",                 i:Users },
                { l:"Monitoring",             i:Gauge },
                { l:"Risk",                   i:AlertTriangle },
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

function SourceDetail({ row, onOpenDrawer }: { row: Row; onOpenDrawer: (kind: string) => void }) {
  const [t, setT] = useState(0);
  const tabs: [string, React.ReactNode][] = [
    ["Overview", (
      <div className="grid grid-cols-4 gap-2 text-[11px]">
        <Fact l="Source" v={row.source} />
        <Fact l="Platform" v={row.platform} />
        <Fact l="Volume" v={row.volume} />
        <Fact l="Hygiene" v={`${row.hygiene}%`} />
        <Fact l="Confidence" v={`${row.confidence}%`} />
        <Fact l="Malformed" v={`${row.malformed}%`} />
        <Fact l="Duplicates" v={`${row.dup}%`} />
        <Fact l="Status" v={row.status} />
      </div>
    )],
    ["Raw Records", (
      <div className="font-mono text-[11px] bg-slate-950 text-slate-300 rounded p-3 space-y-0.5 overflow-x-auto">
        {[
          `{"user":"jdoe","host":"web-01","sev":"HIGH","ts":"05/12 09:14 CST"}`,
          `{"user":"","host":"api02.corp.com","sev":"3","ts":"2025-05-12T15:14Z"}`,
          `{"user":"a.smith","host":"WEB-01","sev":"warn+","ts":"1715527000"}`,
        ].map((l, i) => <div key={i}>{l}</div>)}
      </div>
    )],
    ["Quality Rules", (
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {[
          ["Required: user.id",  "98.7% pass"],
          ["Regex: fqdn",        "96.2% pass"],
          ["Enum: severity",     "94.1% pass"],
          ["Range: bytes ≥ 0",   "99.9% pass"],
          ["Dedup: session_key", "99.5% pass"],
          ["Semantic: action",   "92.8% pass"],
        ].map(([l, v]) => (
          <div key={l} className="rounded border border-slate-200 bg-white p-2">
            <div className="text-slate-800 font-semibold">{l}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">{v}</div>
          </div>
        ))}
      </div>
    )],
    ["Engineering", (
      <div className="flex items-center gap-1 overflow-x-auto">
        {["Raw","Schema","Normalize","Identity","Business","Semantic","Dedup","Score","Canonical","Operational"].map((l, i) => (
          <>
            <div key={l} className="rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 shrink-0">{l}</div>
            {i < 9 && <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />}
          </>
        ))}
      </div>
    )],
    ["Transformations", (
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        {[
          ["sev: HIGH",       "event.severity: high"],
          ["host: web-01",    "observer.hostname: web01.corp.com"],
          ["ts: 05/12 09:14", "event.timestamp: 2025-05-12T15:14:00Z"],
          ["country: U.S.A",  "source.geo.country: US"],
        ].map(([a, b]) => (
          <div key={a} className="rounded border border-slate-200 p-2 flex items-center gap-2">
            <span className="text-slate-500">{a}</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
            <span className="text-emerald-700 font-semibold">{b}</span>
          </div>
        ))}
      </div>
    )],
    ["History", (
      <div className="text-[11px] space-y-1 text-slate-700">
        {["Today · hygiene 88% · trend ▲","7d · avg 87% · +2 vs prior","30d · avg 86% · best 92% May 6","90d · avg 84% · +4 vs baseline"].map((l) => (
          <div key={l} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{l}</div>
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
          <button onClick={() => onOpenDrawer("engineering")} className="text-[11px] font-semibold text-teal-700 hover:underline inline-flex items-center gap-1"><Eye className="h-3 w-3" /> Engineering drawer</button>
          <button className="text-[11px] font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"><Play className="h-3 w-3" /> Simulate</button>
          <button className="text-[11px] font-semibold text-slate-600 hover:underline inline-flex items-center gap-1"><Settings2 className="h-3 w-3" /> Modify</button>
        </div>
      </div>
      <div>{tabs[t][1]}</div>
    </div>
  );
}
