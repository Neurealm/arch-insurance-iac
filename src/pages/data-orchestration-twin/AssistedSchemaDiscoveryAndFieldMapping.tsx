import { useEffect, useMemo, useState } from "react";
import {
  Database, Sparkles, GitBranch, ShieldCheck, Layers, AlertTriangle, Gauge, Activity,
  Filter, Download, RefreshCw, Wand2, Search, ChevronRight, ChevronDown, Info,
  FileSearch, Fingerprint, BrainCircuit, Network, Workflow, CheckCircle2, XCircle,
  Cpu, MemoryStick, Radio, Zap, TrendingUp, TrendingDown, Play, Settings2, Eye,
  Boxes, Route, ArrowRight, Binary, Type, ScanLine, Lock, Users, Link2,
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
  { icon: Database,     label: "Raw Source Fields",     value: "1,248", sub: "100% discovered",  delta: "+42",  tone: "violet"  as Tone, spark: [900,980,1050,1120,1180,1220,1248] },
  { icon: Sparkles,     label: "AI-Inferred Fields",    value: "342",   sub: "27.4% inferred",   delta: "+28",  tone: "cyan"    as Tone, spark: [180,220,250,280,300,320,342] },
  { icon: GitBranch,    label: "Canonical Mapped",      value: "986",   sub: "79.2% coverage",   delta: "+64",  tone: "emerald" as Tone, spark: [780,820,860,900,930,960,986] },
  { icon: ShieldCheck,  label: "Required Mapped",       value: "124/128", sub: "96.9% required", delta: "+3",   tone: "emerald" as Tone, spark: [118,120,121,122,123,124,124] },
  { icon: Layers,       label: "Optional Mapped",       value: "862/920", sub: "93.7% optional", delta: "+22",  tone: "blue"    as Tone, spark: [800,820,835,845,852,858,862] },
  { icon: AlertTriangle,label: "Unmapped Fields",       value: "262",   sub: "20.8% pending",    delta: "-18",  tone: "amber"   as Tone, spark: [320,308,296,286,278,268,262] },
  { icon: XCircle,      label: "Data Type Issues",      value: "14",    sub: "1.1% at risk",     delta: "-3",   tone: "rose"    as Tone, spark: [22,20,19,17,16,15,14] },
  { icon: Gauge,        label: "Mapping Confidence",    value: "92%",   sub: "Avg across fields",delta: "+3",   tone: "teal"    as Tone, spark: [84,86,87,89,90,91,92] },
];

type Status = "Mapped" | "Review" | "Unmapped" | "Rejected";
const statusStyle: Record<Status, string> = {
  Mapped:   "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Review:   "bg-amber-50 text-amber-700 ring-amber-200",
  Unmapped: "bg-rose-50 text-rose-700 ring-rose-200",
  Rejected: "bg-slate-100 text-slate-600 ring-slate-200",
};

type Row = {
  id: number; raw: string; inferred: string; canonical: string; type: string;
  required: boolean; nullRate: number; confidence: number; status: Status;
  transform: string; validation: string; impact: string; owner: string; issue?: string;
};

const ROWS: Row[] = [
  { id:1,  raw:"action",             inferred:"action_type",         canonical:"event.action",             type:"string",   required:true,  nullRate:0.01, confidence:99, status:"Mapped",   transform:"lower(trim(x))",           validation:"enum[allow,deny,drop]", impact:"12 consumers", owner:"SecOps" },
  { id:2,  raw:"src_ip",             inferred:"source.ip",           canonical:"source.ip",                type:"ip",       required:true,  nullRate:0.00, confidence:100,status:"Mapped",   transform:"ipv4_normalize(x)",        validation:"cidr:valid",            impact:"31 consumers", owner:"Network" },
  { id:3,  raw:"dst_ip",             inferred:"destination.ip",      canonical:"destination.ip",           type:"ip",       required:true,  nullRate:0.00, confidence:100,status:"Mapped",   transform:"ipv4_normalize(x)",        validation:"cidr:valid",            impact:"31 consumers", owner:"Network" },
  { id:4,  raw:"bytes",              inferred:"network.bytes",       canonical:"network.bytes",            type:"long",     required:true,  nullRate:0.02, confidence:98, status:"Mapped",   transform:"cast<long>(x)",            validation:">=0",                   impact:"9 consumers",  owner:"FinOps" },
  { id:5,  raw:"bytes_sent",         inferred:"network.bytes_out",   canonical:"network.bytes_out",        type:"long",     required:false, nullRate:12.34,confidence:88, status:"Mapped",   transform:"cast<long>(x)",            validation:">=0",                   impact:"6 consumers",  owner:"FinOps" },
  { id:6,  raw:"app",                inferred:"application.name",    canonical:"application.name",         type:"string",   required:false, nullRate:5.67, confidence:91, status:"Mapped",   transform:"lower(x)",                 validation:"len<=64",               impact:"18 consumers", owner:"AppSec" },
  { id:7,  raw:"device_name",        inferred:"observer.hostname",   canonical:"observer.hostname",        type:"string",   required:true,  nullRate:0.00, confidence:97, status:"Mapped",   transform:"fqdn_normalize(x)",        validation:"regex:fqdn",            impact:"22 consumers", owner:"Platform" },
  { id:8,  raw:"severity",           inferred:"event.severity",      canonical:"event.severity",           type:"string",   required:true,  nullRate:1.23, confidence:96, status:"Mapped",   transform:"map<sev>(x)",              validation:"enum[low,med,high]",    impact:"14 consumers", owner:"SecOps" },
  { id:9,  raw:"threat_id",          inferred:"threat.indicator.id", canonical:"threat.indicator.id",      type:"string",   required:false, nullRate:23.45,confidence:82, status:"Review",   transform:"upper(x)",                 validation:"regex:threat-id",       impact:"4 consumers",  owner:"ThreatIntel", issue:"Type mismatch" },
  { id:10, raw:"custom_field_1",     inferred:"—",                   canonical:"—",                        type:"—",        required:false, nullRate:100,  confidence:0,  status:"Unmapped", transform:"—",                        validation:"—",                     impact:"0 consumers",  owner:"—",           issue:"100% null" },
  { id:11, raw:"policy_id",          inferred:"network.policy.id",   canonical:"network.policy.id",        type:"long",     required:true,  nullRate:0.05, confidence:94, status:"Mapped",   transform:"cast<long>(x)",            validation:">=0",                   impact:"11 consumers", owner:"Network" },
  { id:12, raw:"session_start_time", inferred:"event.start_time",    canonical:"event.start_time",         type:"datetime", required:true,  nullRate:0.00, confidence:98, status:"Mapped",   transform:"iso8601(x, tz='UTC')",     validation:"ts:valid",              impact:"27 consumers", owner:"Platform" },
];

const PIPELINE = [
  { l:"Incoming Schema",           icon:Database },
  { l:"Metadata Extraction",       icon:FileSearch },
  { l:"Pattern Detection",         icon:ScanLine },
  { l:"Semantic Analysis",         icon:BrainCircuit },
  { l:"Historical Lookup",         icon:Layers },
  { l:"Entity Recognition",        icon:Fingerprint },
  { l:"Relationship Detection",    icon:Network },
  { l:"Canonical Candidate",       icon:Sparkles },
  { l:"Confidence Scoring",        icon:Gauge },
  { l:"Validation",                icon:ShieldCheck },
  { l:"Approved Mapping",          icon:CheckCircle2 },
];

const ISSUES = [
  { key:"type",  label:"Type Mismatch",   count:9, tone:"amber"   as Tone, icon:Type },
  { key:"prec",  label:"Precision Loss",  count:1, tone:"violet"  as Tone, icon:Binary },
  { key:"fmt",   label:"Invalid Format",  count:3, tone:"rose"    as Tone, icon:AlertTriangle },
  { key:"trunc", label:"Truncation Risk", count:1, tone:"amber"   as Tone, icon:XCircle },
  { key:"conf",  label:"Schema Conflict", count:2, tone:"rose"    as Tone, icon:GitBranch },
  { key:"null",  label:"Null Dominance",  count:5, tone:"slate"   as Tone, icon:Radio },
];

const UNMAPPED = [
  { name:"custom_field_1", nullRate:100.0, impact:"Low",    ai:"Deprecate or ignore",     canonical:"— (no match)" },
  { name:"extra_data",     nullRate:99.8,  impact:"Low",    ai:"Ignore — mostly null",    canonical:"— (no match)" },
  { name:"debug_info",     nullRate:98.7,  impact:"Low",    ai:"Route to dev-only lake",  canonical:"debug.payload" },
  { name:"raw_payload",    nullRate:95.3,  impact:"Medium", ai:"Map w/ 82% confidence",   canonical:"event.raw" },
  { name:"temp_value",     nullRate:93.1,  impact:"Medium", ai:"Rename to metric.value",  canonical:"metric.value" },
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

function Donut({ segs }: { segs: { label: string; value: number; color: string }[] }) {
  const total = segs.reduce((s, x) => s + x.value, 0);
  let off = 0;
  const R = 44, C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 120 120" className="w-40 h-40">
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
      <text x="60" y="58" textAnchor="middle" className="fill-slate-900" fontSize="18" fontWeight="700">{Math.round((segs[0].value / total) * 100)}%</text>
      <text x="60" y="74" textAnchor="middle" className="fill-slate-500" fontSize="9">Mapped</text>
    </svg>
  );
}

/* ---------- component ---------- */
export default function AssistedSchemaDiscoveryAndFieldMapping() {
  const [selected, setSelected] = useState<Row | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [drawer, setDrawer] = useState<{ title: string; kind: string } | null>(null);
  const [tick, setTick] = useState(0);
  const [simThreshold, setSimThreshold] = useState(85);
  const [simNullRate, setSimNullRate] = useState(5);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => (n + 1) % 1000), 900);
    return () => clearInterval(t);
  }, []);

  const rows = useMemo(() => ROWS.filter(r =>
    (statusFilter === "All" || r.status === statusFilter) &&
    (query === "" || (r.raw + r.inferred + r.canonical).toLowerCase().includes(query.toLowerCase()))
  ), [query, statusFilter]);

  const donutSegs = [
    { label: "Mapped",    value: 986, color: "#10b981" },
    { label: "Unmapped",  value: 262, color: "#f59e0b" },
    { label: "Partial",   value: 0,   color: "#f43f5e" },
    { label: "Ignored",   value: 0,   color: "#8b5cf6" },
  ];

  const activeStage = tick % PIPELINE.length;

  return (
    <div className="px-6 py-5 space-y-5 max-w-[1920px] mx-auto bg-white">
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
            <Wand2 className="h-3.5 w-3.5" /> Schema & Hygiene · Discovery
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 mt-1">Assisted Schema Discovery &amp; Field Mapping</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-4xl">
            Automatically discover, classify, infer, and normalize enterprise schemas into the Canonical Operational Data Model.
          </p>
          <p className="text-[12px] text-slate-500 mt-1 max-w-4xl leading-relaxed">
            The Schema Intelligence Engine continuously analyzes unknown data structures using semantic inference, engineering rules,
            metadata analysis, historical mappings, and confidence scoring to generate production-ready canonical mappings.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 mr-2 text-right leading-tight">
            <div>Last Updated</div>
            <div className="font-semibold text-slate-700 tabular-nums">May 12, 2026 · 10:32 AM</div>
          </div>
          <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><Filter className="h-3.5 w-3.5" /> Filters</button>
          <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Re-run Discovery</button>
          <button className="h-9 px-3 rounded-lg bg-violet-50 border border-violet-200 text-[12px] font-semibold text-violet-700 hover:bg-violet-100 inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> AI Mapping Suggestions</button>
          <button className="h-9 px-3 rounded-lg bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 inline-flex items-center gap-1.5 shadow-sm"><Download className="h-3.5 w-3.5" /> Export Report</button>
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
                <span className={`text-[10px] font-semibold ${k.delta.startsWith("-") ? "text-emerald-600" : "text-emerald-600"}`}>
                  {k.delta.startsWith("-") && k.label.includes("Unmapped") || k.delta.startsWith("-") && k.label.includes("Issues") ? "▼" : "▲"} {k.delta}
                </span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mt-2">{k.label}</div>
              <div className="text-[22px] font-bold text-slate-900 leading-tight tabular-nums">{k.value}</div>
              <div className="text-[10px] text-slate-500">{k.sub}</div>
              <Spark data={k.spark} color={t.hex} />
            </button>
          );
        })}
      </section>

      {/* Source overview */}
      <section
        className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 items-center hover:shadow-sm transition"
        onMouseEnter={() => { /* hover intent */ }}
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-orange-100 grid place-items-center">
            <Database className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">Source</div>
            <div className="text-sm font-bold text-slate-900">XSIAM — NGFW Traffic Logs</div>
          </div>
        </div>
        {[
          ["Platform", "Cortex XSIAM"],
          ["Source Type", "XQL"],
          ["Discovered", "May 12, 2026 09:45"],
          ["Records", "58.7M"],
          ["Window", "Last 7 Days"],
        ].map(([l, v]) => (
          <div key={l}>
            <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{l}</div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">{v}</div>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14">
            <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="92 100" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-[11px] font-bold text-slate-800">92%</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">Discovery Confidence</div>
            <div className="text-[11px] text-emerald-600 font-semibold">Healthy · 0 alerts</div>
          </div>
        </div>
      </section>

      {/* Main workspace: grid + right panel */}
      <section className="grid grid-cols-12 gap-4">
        {/* Field Mapping Registry */}
        <div className="col-span-12 xl:col-span-9 bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[15px] font-bold text-slate-900">Enterprise Field Mapping Registry</div>
              <div className="text-[11px] text-slate-500">1,248 raw fields · {rows.length} shown · click a row to inspect</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fields…" className="pl-8 pr-3 h-8 rounded-lg border border-slate-200 text-[12px] w-56 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="h-8 rounded-lg border border-slate-200 text-[12px] px-2 bg-white">
                {["All","Mapped","Review","Unmapped","Rejected"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  {["Raw (Source)","AI Inferred","Canonical","Type","Req","Null %","Confidence","Status","Data Issue","Actions"].map((h) => (
                    <th key={h} className="py-2 pr-3 font-semibold">{h}</th>
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
                          <div className="flex items-center gap-1.5 font-mono text-slate-800">
                            {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                            {r.raw}
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-slate-700">{r.inferred}</td>
                        <td className="py-2.5 pr-3 font-mono text-blue-700 font-semibold">{r.canonical}</td>
                        <td className="py-2.5 pr-3"><span className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 text-[10px] font-mono">{r.type}</span></td>
                        <td className="py-2.5 pr-3">{r.required ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <div className="h-3 w-3 rounded-full border border-slate-300" />}</td>
                        <td className="py-2.5 pr-3 tabular-nums text-slate-700">{r.nullRate.toFixed(2)}%</td>
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <div className="tabular-nums font-semibold text-slate-800 w-9">{r.confidence}%</div>
                            <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                              <div className={`h-full ${r.confidence >= 90 ? "bg-emerald-500" : r.confidence >= 70 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${r.confidence}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3"><span className={`px-2 py-0.5 rounded-full ring-1 text-[10px] font-semibold ${statusStyle[r.status]}`}>{r.status}</span></td>
                        <td className="py-2.5 pr-3 text-amber-600 text-[11px]">{r.issue ? <span className="inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {r.issue}</span> : "—"}</td>
                        <td className="py-2.5 pr-3"><button className="text-slate-400 hover:text-slate-700">•••</button></td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-slate-50/60">
                          <td colSpan={10} className="p-4">
                            <FieldDetail row={r} onOpenDrawer={(k) => setDrawer({ title: `${r.raw} · ${k}`, kind: k })} />
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

        {/* Right panel */}
        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-1">Mapping Distribution</div>
            <div className="text-[10px] text-slate-500 mb-2">Auto-refreshed continuously</div>
            <div className="flex items-center gap-3">
              <Donut segs={donutSegs} />
              <div className="space-y-1.5 text-[11px]">
                {donutSegs.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                    <span className="text-slate-700 w-16">{s.label}</span>
                    <span className="tabular-nums font-semibold text-slate-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-2">Data Type Issues</div>
            <div className="grid grid-cols-2 gap-2">
              {ISSUES.map((i) => {
                const t = tone[i.tone];
                return (
                  <button key={i.key} onClick={() => setDrawer({ title: i.label, kind: "issue" })}
                    className={`text-left rounded-lg border ${t.ring.replace("ring-", "border-")} ${t.bg} p-2 hover:shadow-sm transition`}>
                    <i.icon className={`h-4 w-4 ${t.text}`} />
                    <div className="text-[11px] font-semibold text-slate-800 mt-1">{i.label}</div>
                    <div className={`text-[16px] font-bold ${t.text} tabular-nums leading-none mt-1`}>{i.count}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-2">Top Unmapped Fields</div>
            <div className="divide-y divide-slate-100">
              {UNMAPPED.map((u) => (
                <button key={u.name} onClick={() => setDrawer({ title: u.name, kind: "unmapped" })}
                  className="w-full text-left py-2 hover:bg-slate-50 rounded transition">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-[12px] font-semibold text-slate-800">{u.name}</div>
                    <div className="text-[10px] tabular-nums text-rose-600 font-semibold">{u.nullRate}%</div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{u.ai} → <span className="text-blue-700 font-semibold">{u.canonical}</span></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Transparency Zone */}
      <section className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 p-5 space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-600">Engineering Transparency</div>
            <h2 className="text-[22px] font-bold tracking-tight text-slate-900">How the Schema Intelligence Engine Learns Unknown Data</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Every mapping is explainable, traceable, confidence-scored, and versioned.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live pipeline
          </div>
        </div>

        {/* Discovery Pipeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Workflow className="h-4 w-4 text-violet-500" /> AI Schema Discovery Pipeline</div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {PIPELINE.map((s, i) => {
              const active = i === activeStage;
              return (
                <>
                  <button key={s.l} onClick={() => setDrawer({ title: s.l, kind: "stage" })}
                    className={`shrink-0 rounded-lg border p-2 w-[130px] text-left transition-all ${active ? "border-violet-400 bg-violet-50 shadow-md scale-[1.03]" : "border-slate-200 bg-white hover:border-slate-300"}`}>
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
          {/* Field Intelligence Engine */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-blue-500" /> Field Intelligence Engine</div>
            <div className="space-y-1.5">
              {[
                { l:"Unknown Field",           icon:Search,       tone:"slate" as Tone },
                { l:"Pattern Recognition",     icon:ScanLine,     tone:"blue" as Tone },
                { l:"Data Type Inference",     icon:Binary,       tone:"cyan" as Tone },
                { l:"Naming Heuristics",       icon:Type,         tone:"violet" as Tone },
                { l:"Metadata Lookup",         icon:FileSearch,   tone:"blue" as Tone },
                { l:"Historical Mapping",      icon:Layers,       tone:"teal" as Tone },
                { l:"Relationship Discovery",  icon:Network,      tone:"emerald" as Tone },
                { l:"Business Rules",          icon:Lock,         tone:"amber" as Tone },
                { l:"Canonical Recommendation",icon:Sparkles,     tone:"violet" as Tone },
                { l:"Confidence Score",        icon:Gauge,        tone:"emerald" as Tone },
              ].map((s, i) => {
                const t = tone[s.tone];
                const active = (tick + i) % 10 < 3;
                return (
                  <div key={s.l} className={`flex items-center gap-2 rounded-lg border p-1.5 transition ${active ? `${t.ring.replace("ring-","border-")} ${t.bg} shadow-sm` : "border-slate-100"}`}>
                    <div className={`h-6 w-6 rounded-md grid place-items-center ${t.bg}`}>
                      <s.icon className={`h-3 w-3 ${t.text}`} />
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 flex-1">{s.l}</div>
                    {active && <span className="text-[9px] font-mono text-emerald-600">▸ running</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Recommendation Engine */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-500" /> AI Recommendation Engine</div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-2">
              {[
                { l:"Semantic Similarity",  v: 94 + (tick % 4) },
                { l:"Historical Matches",   v: 88 + (tick % 6) },
                { l:"Business Context",     v: 79 + (tick % 8) },
                { l:"Entity Detection",     v: 91 + (tick % 5) },
                { l:"Relationship Analysis",v: 86 + (tick % 7) },
              ].map((f) => (
                <div key={f.l}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-700">{f.l}</span>
                    <span className="tabular-nums font-semibold text-slate-900">{f.v}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all" style={{ width: `${f.v}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600">Recommended Canonical</span>
                <span className="text-[12px] font-mono font-bold text-blue-700">event.action</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Confidence</span>
                <span className="text-[16px] font-bold text-emerald-600 tabular-nums">{92 + (tick % 3)}%</span>
              </div>
            </div>
          </div>

          {/* Live Discovery Simulation */}
          <div className="col-span-12 lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-4 text-slate-100">
            <div className="text-sm font-bold mb-2 flex items-center gap-2"><Radio className="h-4 w-4 text-emerald-400 animate-pulse" /> Live Discovery Simulation</div>
            <div className="font-mono text-[10.5px] leading-relaxed text-emerald-300 bg-black/40 rounded-lg p-2 h-[168px] overflow-hidden">
              {[
                `> ingest chunk #${1420 + tick}  fields=32`,
                `  inferring types…  ✓ ip ✓ long ✓ datetime`,
                `  semantic match  action→event.action  0.99`,
                `  historical hit  src_ip→source.ip  0.99`,
                `  entity detect   observer.hostname`,
                `  relationship    source.ip ↔ destination.ip`,
                `  candidate       threat_id→threat.indicator.id  0.82 ⚠`,
                `  approve         ${8 + (tick % 5)} mappings`,
                `  queue           2 for human review`,
              ].map((l, i) => <div key={i} className="opacity-90">{l}</div>)}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[
                { l:"Fields/s",     v: (1240 + tick * 4).toString() },
                { l:"Latency",      v: `${18 + (tick % 6)}ms` },
                { l:"CPU",          v: `${42 + (tick % 12)}%` },
                { l:"Cache hit",    v: `${88 + (tick % 5)}%` },
              ].map((m) => (
                <div key={m.l} className="rounded bg-slate-900 border border-slate-800 p-1.5">
                  <div className="text-[9px] text-slate-400 uppercase">{m.l}</div>
                  <div className="text-[12px] font-bold tabular-nums">{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Before / After */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Route className="h-4 w-4 text-teal-500" /> Before / After Schema Mapping</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold mb-2">Unknown Source Schema</div>
              <div className="font-mono text-[11px] space-y-1 text-slate-700">
                {["src_ip: str","dst_ip: str","bytes: int64","app: text","threat_id: any","custom_field_1: ?"].map((l) => (
                  <div key={l} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> {l}</div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
              <div className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold mb-2">Canonical Operational Schema</div>
              <div className="font-mono text-[11px] space-y-1 text-slate-800">
                {[
                  ["source.ip", "ip"],
                  ["destination.ip", "ip"],
                  ["network.bytes", "long"],
                  ["application.name", "string"],
                  ["threat.indicator.id", "string · v2"],
                  ["— (ignored)", "no match"],
                ].map(([a, b]) => (
                  <div key={a} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span className="font-semibold text-blue-700">{a}</span>
                    <span className="text-slate-500">· {b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom widgets */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            { l:"Mapping Quality",     v:"92%",  s:"+3 vs last run", i:Gauge,        tone:"emerald" as Tone },
            { l:"High Confidence ≥90", v:"876",  s:"70.2%",          i:TrendingUp,   tone:"emerald" as Tone },
            { l:"Medium 70–90",        v:"320",  s:"25.6%",          i:Activity,     tone:"amber"   as Tone },
            { l:"Low <70",             v:"52",   s:"4.2%",           i:TrendingDown, tone:"rose"    as Tone },
            { l:"Avg Null (Mapped)",   v:"5.12%",s:"-1.3% run",      i:Radio,        tone:"blue"    as Tone },
            { l:"Canonical Coverage",  v:"79.2%",s:"+2.4 wk",        i:GitBranch,    tone:"teal"    as Tone },
          ].map((w) => {
            const t = tone[w.tone];
            return (
              <div key={w.l} className="bg-white rounded-xl border border-slate-200 p-3 hover:shadow-sm transition">
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-lg ${t.bg} grid place-items-center`}><w.i className={`h-3.5 w-3.5 ${t.text}`} /></div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{w.l}</div>
                </div>
                <div className="text-[20px] font-bold text-slate-900 mt-2 tabular-nums leading-tight">{w.v}</div>
                <div className={`text-[10px] font-semibold ${t.text}`}>{w.s}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Engineering Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-[560px] sm:max-w-[560px] p-0 overflow-y-auto">
          <SheetHeader className="p-5 border-b border-slate-200 bg-gradient-to-br from-white to-violet-50/40">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-violet-600">Engineering Drawer</div>
            <SheetTitle className="text-lg">{drawer?.title ?? ""}</SheetTitle>
            <p className="text-[11px] text-slate-500">Every mapping — explained, traced, and simulated.</p>
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
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Business Meaning</div>
                <p className="text-[12px] text-slate-700 mt-1">Normalized identifier representing the security enforcement action taken by the NGFW on a session — consumed by SIEM correlation, SOAR playbooks, and executive risk KPIs.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Fact l="Consumers" v="12 downstream" />
                <Fact l="Confidence" v="99%" />
                <Fact l="Owner" v="SecOps Platform" />
                <Fact l="Version" v="v2.3.1" />
              </div>
            </TabsContent>

            <TabsContent value="engineering" className="mt-4">
              <div className="space-y-1.5">
                {["Metadata extraction","Pattern recognition","Semantic analysis","Historical lookup","AI inference","Entity detection","Canonical mapping","Relationship discovery","Confidence engine","Validation","Approval workflow"].map((s, i) => (
                  <div key={s} className={`flex items-center gap-2 rounded-md border p-2 ${(tick + i) % 11 < 3 ? "border-violet-300 bg-violet-50" : "border-slate-200"}`}>
                    <div className="h-6 w-6 rounded bg-violet-100 grid place-items-center text-[10px] font-mono text-violet-700">{i + 1}</div>
                    <div className="text-[12px] text-slate-800 font-medium flex-1">{s}</div>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="telemetry" className="mt-4 grid grid-cols-2 gap-2">
              {[
                ["Fields/sec", (1240 + tick * 4).toString()],
                ["Inference latency", `${18 + (tick % 6)}ms`],
                ["AI confidence", `${92 + (tick % 3)}%`],
                ["CPU", `${42 + (tick % 12)}%`],
                ["Memory", `${58 + (tick % 8)}%`],
                ["Similarity score", `0.${880 + (tick % 20)}`],
                ["Mapping cache", `${88 + (tick % 5)}%`],
                ["Recommendations", `${1240 + tick}`],
                ["Rejected", `${18 + (tick % 4)}`],
                ["Human approvals", `${126 - (tick % 20)}`],
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
              <div className="rounded-lg border border-slate-200 p-3">
                <label className="text-[11px] font-semibold text-slate-700">Similarity Threshold: <span className="text-violet-600 tabular-nums">{simThreshold}%</span></label>
                <input type="range" min={50} max={99} value={simThreshold} onChange={(e) => setSimThreshold(+e.target.value)} className="w-full accent-violet-500" />
                <label className="text-[11px] font-semibold text-slate-700 mt-2 block">Null Rate: <span className="text-violet-600 tabular-nums">{simNullRate}%</span></label>
                <input type="range" min={0} max={100} value={simNullRate} onChange={(e) => setSimNullRate(+e.target.value)} className="w-full accent-violet-500" />
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-[10px] uppercase font-semibold text-emerald-700">Live AI Recommendation</div>
                <div className="text-[14px] font-mono font-bold text-slate-900 mt-1">
                  {simThreshold >= 85 ? "event.action" : simThreshold >= 70 ? "event.action (low conf.)" : "— no match"}
                </div>
                <div className="text-[11px] text-slate-600 mt-1">Confidence: <span className="font-bold tabular-nums">{Math.max(0, simThreshold - simNullRate / 3).toFixed(0)}%</span></div>
              </div>
            </TabsContent>

            <TabsContent value="deps" className="mt-4 space-y-1.5">
              {[
                { l:"Canonical Model",     i:Boxes },
                { l:"Hydration",           i:Zap },
                { l:"Relationship Builder",i:Network },
                { l:"Validation",          i:ShieldCheck },
                { l:"Lineage",             i:Link2 },
                { l:"Knowledge Graph",     i:GitBranch },
                { l:"AI Models",           i:BrainCircuit },
                { l:"Consumers",           i:Users },
                { l:"Owners",              i:Lock },
                { l:"Risk",                i:AlertTriangle },
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

function FieldDetail({ row, onOpenDrawer }: { row: Row; onOpenDrawer: (kind: string) => void }) {
  const tabs: [string, React.ReactNode][] = [
    ["Overview", (
      <div className="grid grid-cols-4 gap-2 text-[11px]">
        <Fact l="Raw" v={row.raw} />
        <Fact l="Inferred" v={row.inferred} />
        <Fact l="Canonical" v={row.canonical} />
        <Fact l="Type" v={row.type} />
        <Fact l="Owner" v={row.owner} />
        <Fact l="Confidence" v={`${row.confidence}%`} />
        <Fact l="Null" v={`${row.nullRate}%`} />
        <Fact l="Impact" v={row.impact} />
      </div>
    )],
    ["Samples", (
      <div className="font-mono text-[11px] bg-slate-950 text-emerald-300 rounded p-3 space-y-0.5">
        {["allow","deny","drop","allow","allow","deny"].map((s, i) => <div key={i}>[{i}] "{row.raw}": "{s}"</div>)}
      </div>
    )],
    ["AI Analysis", (
      <div className="grid grid-cols-3 gap-2">
        {[["Semantic","0.98"],["Historical","0.97"],["Entity","0.92"],["Naming","0.94"],["Metadata","0.88"],["Business","0.91"]].map(([l, v]) => (
          <div key={l} className="rounded border border-violet-200 bg-violet-50 p-2">
            <div className="text-[10px] uppercase text-violet-700 font-semibold">{l}</div>
            <div className="text-[14px] font-bold text-slate-900 tabular-nums">{v}</div>
          </div>
        ))}
      </div>
    )],
    ["Engineering", (
      <div className="flex items-center gap-1 overflow-x-auto">
        {["Unknown","Pattern","Metadata","Semantic","Candidate","Confidence","Validation","Approved","Operational"].map((l, i) => (
          <>
            <div key={l} className="rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 shrink-0">{l}</div>
            {i < 8 && <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />}
          </>
        ))}
      </div>
    )],
    ["History", (
      <div className="text-[11px] space-y-1 text-slate-700">
        {[
          "v2.3.1 · confidence 99% · promoted to production",
          "v2.3.0 · confidence 96% · reviewed by SecOps",
          "v2.2.0 · confidence 88% · auto-inferred",
        ].map((l) => <div key={l} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{l}</div>)}
      </div>
    )],
    ["Relationships", (
      <div className="text-[11px] text-slate-700 space-y-1">
        {["→ source.ip (session key)","→ destination.ip (session key)","→ event.severity (correlation)","→ threat.indicator.id (enrichment)"].map((l) => <div key={l}>{l}</div>)}
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
  const [t, setT] = useState(0);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
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
