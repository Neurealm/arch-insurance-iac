import { useEffect, useMemo, useState } from "react";
import {
  Package, TrendingUp, Clock, Activity, Layers, Zap, ShieldCheck, Cpu,
  Filter, Download, Play, Search, ChevronRight, ChevronDown, Info,
  Database, Cloud, Shield, Server, Boxes, Workflow, GitBranch, Radio,
  FileCode, CheckCircle2, AlertTriangle, Settings2, Sparkles, Network,
  Compass, FileSearch, Map, TestTube, Lock, CalendarClock, LineChart,
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
  { icon: Package,      label: "Sources Onboarded",       value: "45",     sub: "100% of target",    delta: "+6",    tone: "violet"  as Tone, spark: [30,33,36,39,41,43,45] },
  { icon: TrendingUp,   label: "Factory Success Rate",    value: "97.8%",  sub: "Target ≥ 95%",      delta: "+0.4",  tone: "emerald" as Tone, spark: [95,95.4,96,96.6,97,97.4,97.8] },
  { icon: Clock,        label: "Avg. Onboarding Time",    value: "2.4d",   sub: "Target ≤ 5 days",   delta: "-0.3d", tone: "blue"    as Tone, spark: [4.2,3.8,3.4,3.1,2.8,2.6,2.4] },
  { icon: Activity,     label: "Active Factory Jobs",     value: "4",      sub: "8.9% of fleet",     delta: "+1",    tone: "amber"   as Tone, spark: [2,2,3,3,4,4,4] },
  { icon: Layers,       label: "Reusable Templates",      value: "18",     sub: "100% config-driven", delta: "+2",   tone: "violet"  as Tone, spark: [12,13,14,15,16,17,18] },
  { icon: Zap,          label: "Engineering Hours Saved", value: "1,240",  sub: "Since program start",delta: "+128", tone: "teal"    as Tone, spark: [800,880,950,1020,1100,1170,1240] },
  { icon: ShieldCheck,  label: "Governance Compliance",   value: "100%",   sub: "All sources",       delta: "+0.0",  tone: "emerald" as Tone, spark: [98,98.6,99,99.4,99.8,100,100] },
  { icon: Cpu,          label: "Automation Rate",         value: "93%",    sub: "Config-driven",     delta: "+2",    tone: "cyan"    as Tone, spark: [86,87,89,90,91,92,93] },
];

const STAGES = [
  { n:1, l:"Source Discovery",   icon:Compass,      sub:"Identify type, connection, metadata" },
  { n:2, l:"Template Selection", icon:Layers,       sub:"Recommend & clone configuration" },
  { n:3, l:"Schema Discovery",   icon:FileSearch,   sub:"Detect fields, infer types, entities" },
  { n:4, l:"Placement Decision", icon:Map,          sub:"Source · Cache · Vault · Graph · Delta" },
  { n:5, l:"Validation",         icon:TestTube,     sub:"Connectivity · schema · quality" },
  { n:6, l:"Governance",         icon:Lock,         sub:"IAM · secrets · policies · audit" },
  { n:7, l:"Scheduling",         icon:CalendarClock,sub:"Register orchestration & alerts" },
  { n:8, l:"Monitoring",         icon:LineChart,    sub:"Freshness · drift · optimization" },
];

type Stage = "1. Discover" | "2. Template" | "3. Configure & Map" | "4. Set Placement" | "5. Test & Validate" | "6. Security & Access" | "7. Schedule & Activate" | "8. Monitor & Optimize";
const stageStyle: Record<Stage, string> = {
  "1. Discover":              "bg-blue-50 text-blue-700",
  "2. Template":              "bg-violet-50 text-violet-700",
  "3. Configure & Map":       "bg-cyan-50 text-cyan-700",
  "4. Set Placement":         "bg-teal-50 text-teal-700",
  "5. Test & Validate":       "bg-amber-50 text-amber-700",
  "6. Security & Access":     "bg-rose-50 text-rose-700",
  "7. Schedule & Activate":   "bg-indigo-50 text-indigo-700",
  "8. Monitor & Optimize":    "bg-emerald-50 text-emerald-700",
};

type Row = {
  id: number; name: string; platform: string; icon: any; iconTone: Tone;
  dataType: string; template: string; stage: Stage; progress: number;
  owner: string; started: string; eta: string;
  status: "In Progress" | "Testing" | "Active" | "Planned"; conf: number; auto: number;
};

const ROWS: Row[] = [
  { id:45, name:"container_logs",   platform:"Kubernetes API", icon:Boxes,    iconTone:"cyan",    dataType:"Logs",    template:"K8s Logs v2",       stage:"5. Test & Validate",     progress:70,  owner:"Neeraj K.", started:"May 12, 2025", eta:"May 15, 2025", status:"In Progress", conf:0.92, auto:0.94 },
  { id:44, name:"saas_audit_events",platform:"REST API",       icon:Cloud,    iconTone:"blue",    dataType:"Audit",   template:"SaaS Audit v1",     stage:"3. Configure & Map",     progress:45,  owner:"Priya J.",  started:"May 11, 2025", eta:"May 14, 2025", status:"In Progress", conf:0.88, auto:0.91 },
  { id:43, name:"endpoint_metrics", platform:"LogicMonitor",   icon:Activity, iconTone:"emerald", dataType:"Metrics", template:"Metrics v1",        stage:"4. Set Placement",       progress:60,  owner:"Arjun K.",  started:"May 10, 2025", eta:"May 13, 2025", status:"In Progress", conf:0.9,  auto:0.93 },
  { id:42, name:"threat_intel_feed",platform:"SFTP Server",    icon:Server,   iconTone:"slate",   dataType:"Feed",    template:"Threat Feed v1",    stage:"6. Security & Access",   progress:80,  owner:"Meena R.",  started:"May 9, 2025",  eta:"May 12, 2025", status:"In Progress", conf:0.86, auto:0.9  },
  { id:41, name:"billing_export",   platform:"BigQuery",       icon:Database, iconTone:"blue",    dataType:"Billing", template:"Billing v1",        stage:"7. Schedule & Activate", progress:90,  owner:"Suresh B.", started:"May 8, 2025",  eta:"May 11, 2025", status:"Testing",     conf:0.94, auto:0.96 },
  { id:40, name:"xdr_alerts",       platform:"XSIAM (XQL)",    icon:Shield,   iconTone:"amber",   dataType:"Alerts",  template:"XSIAM Alerts v2",   stage:"8. Monitor & Optimize",  progress:100, owner:"Ravi S.",   started:"May 7, 2025",  eta:"May 9, 2025",  status:"Active",      conf:0.98, auto:0.98 },
];

const STATUS_DIST = [
  { label:"Active",      value:36, color:"#3b82f6" },
  { label:"In Progress", value:4,  color:"#10b981" },
  { label:"Testing",     value:2,  color:"#f59e0b" },
  { label:"Planned",     value:3,  color:"#8b5cf6" },
];

const TEMPLATES = [
  { l:"XSIAM (XQL)",       i:Shield,   t:"amber"   as Tone, uses:11 },
  { l:"BigQuery",          i:Database, t:"blue"    as Tone, uses:9 },
  { l:"REST APIs",         i:Cloud,    t:"cyan"    as Tone, uses:14 },
  { l:"Kafka Streaming",   i:Radio,    t:"rose"    as Tone, uses:5 },
  { l:"MCP",               i:Network,  t:"violet"  as Tone, uses:6 },
  { l:"LogicMonitor",      i:Activity, t:"emerald" as Tone, uses:8 },
  { l:"Kubernetes",        i:Boxes,    t:"cyan"    as Tone, uses:7 },
  { l:"SFTP / File Feeds", i:Server,   t:"slate"   as Tone, uses:4 },
  { l:"Custom Connector",  i:FileCode, t:"teal"    as Tone, uses:3 },
];

/* -------- helpers -------- */
const Spark = ({ points, color = "#3b82f6" }: { points: number[]; color?: string }) => {
  const w = 84, h = 28, min = Math.min(...points), max = Math.max(...points);
  const d = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / Math.max(1e-6, max - min)) * h;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return <svg width={w} height={h}><path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round"/></svg>;
};

const Donut = ({ data, size = 160 }: { data: { label: string; value: number; color: string }[]; size?: number }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2 - 12, cx = size / 2, cy = size / 2;
  let acc = 0;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={12}/>
      {data.map((d, i) => {
        const frac = d.value / total;
        const start = acc * 2 * Math.PI - Math.PI / 2;
        const end = (acc + frac) * 2 * Math.PI - Math.PI / 2;
        acc += frac;
        const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
        const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
        const large = frac > 0.5 ? 1 : 0;
        return <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={d.color} strokeWidth={12}/>;
      })}
      <text x={cx} y={cy-2} textAnchor="middle" className="fill-slate-900" style={{ fontSize: 20, fontWeight: 700 }}>{total}</text>
      <text x={cx} y={cy+14} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 10 }}>sources</text>
    </svg>
  );
};

export default function SourceOnboardingFactory() {
  const [drawer, setDrawer] = useState<{ open: boolean; title: string; kind: string }>({ open: false, title: "", kind: "kpi" });
  const [expanded, setExpanded] = useState<number | null>(45);
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 1500); return () => clearInterval(t); }, []);

  const rows = useMemo(() => ROWS.filter(r =>
    query === "" || (r.name + r.platform + r.template + r.dataType).toLowerCase().includes(query.toLowerCase())
  ), [query]);

  const openDrawer = (title: string, kind = "kpi") => setDrawer({ open: true, title, kind });

  return (
    <div className="min-h-full bg-white text-slate-900">
      {/* L→R progress animation keyframes (packet shuttle + fill sweep) */}
      <style>{`
        @keyframes sof-packet {
          0%   { transform: translateX(-20%); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        @keyframes sof-fill {
          0%   { transform: scaleX(0); }
          85%  { transform: scaleX(1); }
          100% { transform: scaleX(1); opacity: 0.15; }
        }
        @keyframes sof-bar-grow {
          0%   { width: 15%; }
          85%  { width: 100%; }
          100% { width: 100%; opacity: 0.85; }
        }
      `}</style>
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Source Onboarding Factory</h1>
            <p className="text-slate-600 mt-1">Configuration-driven onboarding of enterprise data sources into the Data Orchestration Platform.</p>
            <p className="text-slate-400 text-sm mt-1 max-w-4xl">Every new source follows the same repeatable engineering factory that automatically discovers metadata, validates schemas, applies governance, determines placement, and prepares the source for operational orchestration.</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Last Updated <span className="text-slate-700 font-medium ml-1">May 12, 2025 · 10:32 AM</span></span>
            <button className="ml-3 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2"><Filter className="h-4 w-4"/>Filters</button>
            <button onClick={() => openDrawer("Template Library", "tpl")} className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2"><Layers className="h-4 w-4"/>Templates</button>
            <button className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2"><Download className="h-4 w-4"/>Export</button>
            <button onClick={() => openDrawer("Launch Onboarding · New Source", "launch")} className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-2"><Play className="h-4 w-4"/>Launch Onboarding</button>
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
        <div className="col-span-9 space-y-4">
          {/* Factory Pipeline */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold">Configuration-Driven Factory Pipeline</div>
                <div className="text-xs text-slate-500">Every new source flows through 8 repeatable engineering stages · no custom code required</div>
              </div>
              <div className="text-[11px] text-slate-500 inline-flex items-center gap-2"><Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse"/> 4 active jobs · avg 2.4 days</div>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {STAGES.map((s, i) => {
                const active = (tick + i) % 8 < 3;
                const Icon = s.icon;
                return (
                  <button key={s.n} onClick={() => openDrawer(`Stage ${s.n} · ${s.l}`, "stage")}
                    className={`text-left rounded-lg border p-3 hover:shadow-md hover:-translate-y-0.5 transition ${active ? "border-indigo-200 bg-indigo-50/40 ring-1 ring-indigo-100" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-center justify-between">
                      <div className={`h-7 w-7 rounded-full inline-flex items-center justify-center text-xs font-semibold ${active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>{s.n}</div>
                      <Icon className={`h-4 w-4 ${active ? "text-indigo-600" : "text-slate-400"}`}/>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-800 leading-tight">{s.l}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{s.sub}</div>
                  </button>
                );
              })}
            </div>
            {/* Factory progress bar */}
            <div className="mt-5 rounded-lg bg-slate-50 border border-slate-100 p-3">
              <div className="flex items-center justify-between text-[11px] text-slate-600 mb-2">
                <span>Overall Factory Progress</span>
                <span className="font-semibold text-slate-800">76%</span>
              </div>
              <div className="h-2 bg-slate-200/70 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: "76%" }}/>
              </div>
              <div className="grid grid-cols-5 gap-3 mt-3 text-[10px] text-slate-500">
                {[["Jobs", "4"], ["ETA", "May 15"], ["Throughput", "8 / wk"], ["Workers", "12"], ["Queue", "3"]].map(([k, v]) => (
                  <div key={k}><div>{k}</div><div className="text-slate-800 font-semibold text-xs">{v}</div></div>
                ))}
              </div>
            </div>
          </div>

          {/* Pipeline Grid */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
              <div>
                <div className="text-sm font-semibold">Onboarding Pipeline</div>
                <div className="text-xs text-slate-500">In-flight and recently completed factory jobs</div>
              </div>
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2"/>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search sources" className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-blue-100"/>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-slate-500 bg-slate-50/60">
                  <tr className="text-left">
                    {["ID","Source","Platform","Type","Template","Stage","Progress","Owner","Started","ETA","Status","Conf","Auto",""].map(h => (
                      <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const t = tone[r.iconTone];
                    const Icon = r.icon;
                    const isOpen = expanded === r.id;
                    return (
                      <>
                        <tr key={r.id} onClick={() => setExpanded(isOpen ? null : r.id)} className={`border-t border-slate-100 hover:bg-blue-50/40 cursor-pointer transition ${isOpen ? "bg-blue-50/50" : ""}`}>
                          <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">{r.id}</span></td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className={`h-6 w-6 rounded-md ${t.bg} ${t.text} inline-flex items-center justify-center`}><Icon className="h-3.5 w-3.5"/></div>
                              <div className="font-medium text-slate-800">{r.name}</div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">{r.platform}</td>
                          <td className="px-3 py-2.5 text-slate-600">{r.dataType}</td>
                          <td className="px-3 py-2.5 text-slate-600">{r.template}</td>
                          <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded text-[10px] font-medium ${stageStyle[r.stage]}`}>{r.stage}</span></td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400" style={{ width: `${r.progress}%` }}/>
                              </div>
                              <span className="text-[10px] text-slate-500">{r.progress}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">{r.owner}</td>
                          <td className="px-3 py-2.5 text-slate-600">{r.started}</td>
                          <td className="px-3 py-2.5 text-slate-600">{r.eta}</td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${r.status === "Active" ? "bg-emerald-50 text-emerald-700" : r.status === "Testing" ? "bg-amber-50 text-amber-700" : r.status === "In Progress" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${r.status === "Active" ? "bg-emerald-500" : r.status === "Testing" ? "bg-amber-500" : r.status === "In Progress" ? "bg-blue-500 animate-pulse" : "bg-slate-500"}`}/>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">{Math.round(r.conf * 100)}%</td>
                          <td className="px-3 py-2.5 text-slate-600">{Math.round(r.auto * 100)}%</td>
                          <td className="px-3 py-2.5 text-slate-400">{isOpen ? <ChevronDown className="h-3.5 w-3.5"/> : <ChevronRight className="h-3.5 w-3.5"/>}</td>
                        </tr>
                        {isOpen && (
                          <tr className="border-t border-slate-100 bg-slate-50/40">
                            <td colSpan={14} className="px-5 py-4">
                              <Tabs defaultValue="engineering">
                                <TabsList>
                                  <TabsTrigger value="overview">Overview</TabsTrigger>
                                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                                  <TabsTrigger value="schema">Schema</TabsTrigger>
                                  <TabsTrigger value="engineering">Engineering</TabsTrigger>
                                  <TabsTrigger value="validation">Validation</TabsTrigger>
                                  <TabsTrigger value="placement">Placement</TabsTrigger>
                                  <TabsTrigger value="governance">Governance</TabsTrigger>
                                  <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                                  <TabsTrigger value="history">History</TabsTrigger>
                                </TabsList>
                                <TabsContent value="engineering" className="mt-3">
                                  <div className="flex items-center gap-1 overflow-x-auto">
                                    {["Source","Connector","Metadata","Schema","Validation","Transformation","Governance","Placement","Scheduling","Operational Platform"].map((s, i, arr) => (
                                      <div key={s} className="flex items-center gap-1">
                                        <div className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-[11px] whitespace-nowrap shadow-sm">{s}</div>
                                        {i < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-slate-400"/>}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-2 h-1 rounded-full bg-slate-200 overflow-hidden relative">
                                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full origin-left" style={{ animation: "sof-bar-grow 4.2s ease-in-out infinite" }}/>
                                    {[0,1,2].map(i => <div key={i} className="absolute top-0 h-1 w-10 rounded-full bg-white/70 shadow" style={{ left: 0, animation: `sof-packet 3.6s linear ${i * 1.2}s infinite` }}/>)}
                                  </div>
                                </TabsContent>
                                <TabsContent value="overview"    className="text-xs text-slate-600 mt-3">{r.name} — {r.platform} · {r.dataType}. Purpose: onboard {r.template} through the factory. Consumers: SRE, SecOps, FinOps.</TabsContent>
                                <TabsContent value="metadata"    className="text-xs text-slate-600 mt-3">Auto-collected: 42 fields · 6 entities · 3 partitions · avg row size 1.2 KB · sampled 10k events.</TabsContent>
                                <TabsContent value="schema"      className="text-xs text-slate-600 mt-3">Detected 42 columns · 4 nullable · 0 unresolved types · 100% coverage vs. canonical model.</TabsContent>
                                <TabsContent value="validation"  className="text-xs text-slate-600 mt-3">Connectivity ✓ · Auth ✓ · Schema ✓ · Quality 96% · Completeness 98% · Confidence {Math.round(r.conf * 100)}%.</TabsContent>
                                <TabsContent value="placement"   className="text-xs text-slate-600 mt-3">Recommended: Graph Projection + Delta table · rationale: cross-domain joins, high query fanout.</TabsContent>
                                <TabsContent value="governance"  className="text-xs text-slate-600 mt-3">IAM ✓ · Secrets vaulted ✓ · Policy v4.2 ✓ · PII masked · Owner {r.owner} · Reviewer approved.</TabsContent>
                                <TabsContent value="monitoring"  className="text-xs text-slate-600 mt-3">Freshness 18m · Drift 0 · Failed runs 0 · SLA 99.4% · Alerts routed to on-call rotation.</TabsContent>
                                <TabsContent value="history"     className="text-xs text-slate-600 mt-3">Discovered → Templated → Mapped → Placed → Validated → Governed → Scheduled → Live.</TabsContent>
                              </Tabs>
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
        </div>

        {/* Right column */}
        <div className="col-span-3 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="text-xs font-semibold text-slate-500 mb-3">Factory Impact</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ["Template Reuse", "82%", "emerald"], ["Eng. Savings", "1,240h", "teal"],
                ["Automation %", "93%", "cyan"], ["Quality Score", "99.2%", "emerald"],
                ["Validation %", "97%", "blue"], ["Faster Onboard", "3.6×", "violet"],
              ].map(([k, v, c]) => (
                <div key={k as string} className={`rounded-md p-2 ${tone[c as Tone].bg}`}>
                  <div className="text-slate-500">{k}</div>
                  <div className={`font-semibold ${tone[c as Tone].text}`}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="text-xs font-semibold text-slate-500 mb-2">Onboarding Status</div>
            <div className="flex items-center gap-3">
              <Donut data={STATUS_DIST} size={140}/>
              <div className="flex-1 space-y-1">
                {STATUS_DIST.map(d => (
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
              <div className="text-xs font-semibold text-slate-500">Template Library</div>
              <span className="text-[10px] text-slate-400">18 templates</span>
            </div>
            <div className="space-y-1">
              {TEMPLATES.map(t => {
                const st = tone[t.t];
                const Icon = t.i;
                return (
                  <button key={t.l} onClick={() => openDrawer(`Template · ${t.l}`, "tpl")}
                    className="w-full flex items-center gap-2 rounded-md p-2 hover:bg-slate-50 transition">
                    <div className={`h-6 w-6 rounded-md ${st.bg} ${st.text} inline-flex items-center justify-center`}><Icon className="h-3.5 w-3.5"/></div>
                    <div className="flex-1 text-left text-xs text-slate-700">{t.l}</div>
                    <span className="text-[10px] text-slate-400">{t.uses} uses</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Transparency */}
      <div className="bg-slate-950 text-slate-100 px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400">Engineering Transparency</div>
            <div className="text-xl font-semibold">How the Engineering Factory Works</div>
          </div>
          <div className="text-[11px] text-slate-400 inline-flex items-center gap-2"><Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse"/> Live · workers 12 · queue 3</div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Factory architecture */}
          <div className="col-span-12 rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400 mb-3">Factory Architecture</div>
            <div className="relative">
              <div className="flex items-center gap-2 overflow-x-auto">
                {["Enterprise Source","Connector Factory","Metadata Collector","Schema Discovery","Entity Detection","Template Engine","Validation","Governance","Placement","Scheduler","Production Source"].map((s, i, arr) => (
                  <div key={s} className="flex items-center gap-2">
                    <button onClick={() => openDrawer(`Factory · ${s}`, "arch")} className="px-2.5 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-[11px] whitespace-nowrap border border-slate-700">{s}</button>
                    {i < arr.length - 1 && <div className="w-6 h-px bg-gradient-to-r from-indigo-400/40 to-transparent"/>}
                  </div>
                ))}
              </div>
              <div className="mt-3 relative h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 rounded-full origin-left" style={{ animation: "sof-bar-grow 5s ease-in-out infinite" }}/>
                {[0,1,2,3,4].map(i => <div key={i} className="absolute top-0 h-1.5 w-10 rounded-full bg-white/60" style={{ left: 0, animation: `sof-packet 4s linear ${i * 0.8}s infinite` }}/>)}
              </div>
            </div>
          </div>

          {/* Configuration engine */}
          <div className="col-span-7 rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
              <span>Configuration Engine</span>
              <span className="text-emerald-400 text-[10px] inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> No custom code required</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { l:"Configuration Files", i:FileCode },{ l:"Template Repository", i:Layers },
                { l:"Transformation Rules", i:GitBranch },{ l:"Mapping Rules", i:Map },
                { l:"Validation Rules", i:TestTube },{ l:"Placement Rules", i:Workflow },
                { l:"Deployment Engine", i:Cpu },{ l:"Operational Registry", i:Database },
              ].map((r, i) => {
                const Icon = r.i;
                const glow = (tick + i) % 4 === 0;
                return (
                  <div key={i} className={`rounded-md p-2 border bg-slate-950/60 ${glow ? "border-indigo-500/60 ring-1 ring-indigo-400/30" : "border-slate-800"}`}>
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-3.5 w-3.5 ${glow ? "text-indigo-300" : "text-slate-400"}`}/>
                      <div className="text-[11px] text-slate-200">{r.l}</div>
                    </div>
                    <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full origin-left" style={{ width: "100%", transform: "scaleX(0)", animation: `sof-fill 3.6s ease-in-out ${i * 0.35}s infinite` }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Factory Execution */}
          <div className="col-span-5 rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
              <span>Live Factory Execution</span>
              <span className="text-emerald-400 inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/> {(tick * 2 + 6) % 20 + 6} jobs/min</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-[10px]">
              {[["Workers","12"],["Queue","3"],["CPU","61%"],["Memory","54%"],["Avg Runtime","2.4d"],["Templates","18"],["Automation","93%"],["Failures","0"]].map((m, i) => (
                <div key={i} className="rounded-md bg-slate-950/60 border border-slate-800 p-2">
                  <div className="text-slate-400">{m[0]}</div>
                  <div className="text-slate-100 font-semibold mt-0.5">{m[1]}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 relative h-16 rounded-md bg-slate-950 overflow-hidden border border-slate-800">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-indigo-400" style={{ left: `${((tick * 8 + i * 14) % 100)}%`, transition: "left 1.4s linear", opacity: 0.7 }}/>
              ))}
              <div className="absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-blue-500/20 to-transparent border-r border-slate-800 flex items-center justify-center text-[10px] text-blue-300">Discover</div>
              <div className="absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-emerald-500/20 to-transparent border-l border-slate-800 flex items-center justify-center text-[10px] text-emerald-300">Live</div>
            </div>
          </div>

          {/* Source Lifecycle */}
          <div className="col-span-12 rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400 mb-3">Source Lifecycle Timeline</div>
            <div className="flex items-center gap-1 overflow-x-auto">
              {["Discover","Register","Validate","Govern","Deploy","Monitor","Optimize","Continuous Improvement"].map((s, i, arr) => (
                <div key={s} className="flex items-center gap-1">
                  <button onClick={() => openDrawer(`Lifecycle · ${s}`, "life")} className="px-2.5 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-[11px] border border-slate-700 whitespace-nowrap">{s}</button>
                  {i < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-slate-600"/>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom widgets */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { title:"Recent Onboarded Sources", items:["xdr_alerts · Active","panw_ngfw_traffic_raw · Active","gcp_billing_export · Active","datadog_metrics · Active"] },
            { title:"Recent Template Changes",  items:["XSIAM Alerts v2 published","BigQuery Billing v1 refined","REST Audit v1 field mapping","Kubernetes Logs v2 promoted"] },
            { title:"Factory Queue",            items:["saas_audit_events (3)","endpoint_metrics (4)","threat_intel_feed (6)","container_logs (5)"] },
            { title:"Engineering Tasks",        items:["Approve threat_intel_feed IAM","Confirm placement · endpoint_metrics","Sign off container_logs schema","Rotate BQ service account"] },
            { title:"Validation Failures (24h)",items:["None"] },
            { title:"Optimization Suggestions", items:["Reuse XSIAM template for panw_dns_logs","Compress SFTP feed by 42%","Move billing_export to Delta","Add drift monitor to k8s logs"] },
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
              <TabsTrigger value="configuration">Config</TabsTrigger>
              <TabsTrigger value="dependencies">Deps</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 text-sm text-slate-700 space-y-3">
              <p>The Source Onboarding Factory turns any new enterprise data source into a governed, monitored operational asset — using <b>configuration, not custom code</b>.</p>
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                <li>Purpose: repeatable onboarding of sources #36, #40, #45, and beyond</li>
                <li>Consumers: Platform Eng, Data Eng, CloudOps, AI Eng, EA, SRE</li>
                <li>SLA: ≤ 5 days end-to-end · 100% governance compliance</li>
                <li>Impact: 1,240 engineering hours saved · 3.6× faster onboarding</li>
              </ul>
            </TabsContent>

            <TabsContent value="engineering" className="mt-4 space-y-3 text-xs text-slate-700">
              {[
                { i: Workflow, l:"Connector factory instantiates the right adapter from template metadata" },
                { i: FileSearch, l:"Metadata collector samples the source and extracts fields, entities, and volume signals" },
                { i: Sparkles, l:"Schema inference maps discovered fields to the canonical model with confidence scoring" },
                { i: TestTube, l:"Validation engine runs connectivity, auth, schema, quality, and completeness checks" },
                { i: Lock, l:"Governance engine provisions IAM, vaults secrets, applies policies, and records lineage" },
                { i: Map, l:"Placement engine chooses Stay in Source / Cache / Vault / Graph / Delta / Streaming" },
                { i: CalendarClock, l:"Scheduler registers orchestration cadence and alert routes automatically" },
                { i: LineChart, l:"Monitoring activates freshness, drift, and optimization loops from day one" },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2 rounded-md border border-slate-100 p-2">
                  <r.i className="h-4 w-4 text-indigo-500 mt-0.5"/><div>{r.l}</div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="telemetry" className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {[["Workers","12"],["Runtime","2.4d avg"],["Queue","3"],["CPU","61%"],["Memory","54%"],["Execution","98%"],["Validation","97%"],["Automation","93%"],["Failures","0"],["Retries","2"],["Templates","18"],["Reuse","82%"]].map(([k, v], i) => (
                <div key={i} className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">{k}</div><div className="font-semibold">{v}</div></div>
              ))}
            </TabsContent>

            <TabsContent value="configuration" className="mt-4 text-xs">
              <div className="rounded-md bg-slate-950 text-slate-100 p-3 font-mono text-[11px] whitespace-pre overflow-x-auto">{`source:
  id: 45
  name: container_logs
  platform: kubernetes-api
  template: k8s-logs-v2
mapping:
  timestamp: "@timestamp"
  namespace: "resource.namespace"
  pod: "resource.pod.name"
validation:
  connectivity: required
  schema: strict
  quality: >= 0.95
placement:
  strategy: graph-projection
  cache: edge
governance:
  iam: sa-k8s-reader
  secrets: vault://k8s/read
scheduling:
  cadence: 15m
  alerting: pager://sre-oncall`}</div>
            </TabsContent>

            <TabsContent value="dependencies" className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {["Source Systems","Secrets","IAM","Policies","Templates","Schemas","Connectors","Schedulers","Monitoring","Owners","Risk","Registry"].map(d => (
                <div key={d} className="rounded-md border border-slate-100 p-2 flex items-center gap-2"><Info className="h-3.5 w-3.5 text-slate-400"/>{d}</div>
              ))}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}
