import { useEffect, useMemo, useState } from "react";
import {
  Droplet, Sparkles, ScanSearch, Gauge, Clock, Layers, Lock, BrainCircuit,
  Filter, Download, RefreshCw, BookOpen, FlaskConical, Search, ChevronRight, ChevronDown,
  Workflow, CheckCircle2, XCircle, Radio, TrendingUp, Play, Settings2, Eye, Bell,
  Boxes, Network, Users, Link2, ArrowRight, Database, GitBranch, Fingerprint,
  MapPin, ScrollText, Zap, FileCode, Shield, Wand2,
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
  { icon: Droplet,      label: "Hydration Coverage",      value: "88%",   sub: "Target ≥ 90%",       delta: "+3",    tone: "blue"    as Tone, spark: [80,82,84,85,86,87,88] },
  { icon: Sparkles,     label: "Records Enriched (7D)",   value: "12.4M", sub: "+18.7% vs prior 7D", delta: "+18.7", tone: "emerald" as Tone, spark: [8,9,9.6,10.4,11.1,11.8,12.4] },
  { icon: ScanSearch,   label: "Gaps Detected (7D)",      value: "3.6M",  sub: "-12.1% vs prior 7D", delta: "-12.1", tone: "amber"   as Tone, spark: [4.6,4.4,4.2,4.0,3.9,3.7,3.6] },
  { icon: Gauge,        label: "Enrichment Success",      value: "92%",   sub: "Target ≥ 90%",       delta: "+1.4",  tone: "emerald" as Tone, spark: [88,89,90,90,91,91,92] },
  { icon: Clock,        label: "Avg Enrichment Latency",  value: "1.8s",  sub: "Target ≤ 5s",        delta: "-0.2",  tone: "cyan"    as Tone, spark: [2.4,2.2,2.1,2.0,1.9,1.9,1.8] },
  { icon: Layers,       label: "Derived Records Created", value: "11.7M", sub: "This week",          delta: "+22",   tone: "violet"  as Tone, spark: [7,8,9,10,10.6,11.2,11.7] },
  { icon: Lock,         label: "Immutable Raw Records",   value: "100%",  sub: "Never Modified",     delta: "0",     tone: "slate"   as Tone, spark: [100,100,100,100,100,100,100] },
  { icon: BrainCircuit, label: "Average Confidence",      value: "0.94",  sub: "Weighted",           delta: "+0.02", tone: "teal"    as Tone, spark: [0.88,0.9,0.91,0.92,0.93,0.93,0.94] },
];

type MethodKey =
  | "lookup" | "correlation" | "synthQuery" | "synthTx" | "rule"
  | "topology" | "metadata" | "identity" | "sme";

type Method = {
  key: MethodKey; label: string; icon: any; tone: Tone;
  desc: string; usage: string; success: number; latency: string; conf: number;
  complexity: "Low" | "Medium" | "High"; cost: "$" | "$$" | "$$$"; example: string;
  usage7d: string; color: string;
};

const METHODS: Method[] = [
  { key:"lookup",      label:"Source of Truth Lookup",    icon:Database,      tone:"emerald" as Tone, desc:"Look up missing fields from a trusted reference system or master data source.", usage:"CMDB, IdP, HRIS, Master Data", success:95, latency:"120ms", conf:0.96, complexity:"Low",    cost:"$",   example:"User ID → Identity Directory", usage7d:"5.1M", color:"#10b981" },
  { key:"correlation", label:"Adjacent Log Correlation",  icon:Link2,         tone:"blue"    as Tone, desc:"Correlate with other logs in the data lake using keys and time windows.",       usage:"Time-window join", success:91, latency:"640ms", conf:0.91, complexity:"Medium", cost:"$$",  example:"IP → Device ID from NetFlow", usage7d:"2.7M", color:"#3b82f6" },
  { key:"synthQuery",  label:"Synthetic Query",           icon:Search,        tone:"violet"  as Tone, desc:"Query source systems or APIs on-demand to retrieve missing context.",           usage:"On-demand API calls", success:89, latency:"1.4s",  conf:0.89, complexity:"Medium", cost:"$$",  example:"CMDB lookup for asset details", usage7d:"1.8M", color:"#8b5cf6" },
  { key:"synthTx",     label:"Synthetic Transaction",     icon:Zap,           tone:"amber"   as Tone, desc:"Execute a safe, read-only transaction to reproduce and capture missing data.", usage:"Replay-safe probes", success:86, latency:"2.6s",  conf:0.86, complexity:"High",   cost:"$$$", example:"Re-run auth trace to get user group", usage7d:"0.9M", color:"#f59e0b" },
  { key:"rule",        label:"Rule-Based Derivation",     icon:FileCode,      tone:"cyan"    as Tone, desc:"Derive values using deterministic rules, lookups, regex, or calculations.",     usage:"Deterministic derivation", success:94, latency:"90ms",  conf:0.93, complexity:"Low",    cost:"$",   example:"Geo from IP, Risk score from bytes", usage7d:"1.3M", color:"#06b6d4" },
  { key:"topology",    label:"Topology Resolution",       icon:Network,       tone:"teal"    as Tone, desc:"Resolve devices, sites, and interfaces from the topology graph.",              usage:"Graph traversal",  success:92, latency:"320ms", conf:0.92, complexity:"Medium", cost:"$$",  example:"IP → Site via CMDB graph", usage7d:"1.1M", color:"#14b8a6" },
  { key:"metadata",    label:"Business Metadata Lookup",  icon:ScrollText,    tone:"violet"  as Tone, desc:"Attach owner, business service, criticality, and cost center metadata.",        usage:"Service catalog",  success:97, latency:"80ms",  conf:0.97, complexity:"Low",    cost:"$",   example:"Host → Business Service Owner", usage7d:"0.7M", color:"#a78bfa" },
  { key:"identity",    label:"Identity Resolution",       icon:Fingerprint,   tone:"blue"    as Tone, desc:"Merge partial identifiers into a canonical entity ID via graph resolution.",   usage:"Entity resolution", success:93, latency:"260ms", conf:0.93, complexity:"Medium", cost:"$$",  example:"email+ip → canonical user_id", usage7d:"0.5M", color:"#60a5fa" },
  { key:"sme",         label:"SME Validation",            icon:Users,         tone:"rose"    as Tone, desc:"Human expert validates and confirms the correct value for critical gaps.",     usage:"Human-in-the-loop", success:98, latency:"12m",   conf:0.98, complexity:"High",   cost:"$$$", example:"Incident owner confirms business context", usage7d:"0.6M", color:"#f43f5e" },
];

const WORKFLOW_STAGES = [
  { n:1, l:"Gap Detection",           icon:ScanSearch,   sub:"Missing fields · null · sparse · broken IDs",     tone:"amber"   as Tone },
  { n:2, l:"Method Selection",        icon:BrainCircuit, sub:"Score by confidence · latency · cost · rules",   tone:"violet"  as Tone },
  { n:3, l:"Hydration Execution",     icon:Sparkles,     sub:"Lookup · correlation · synthetic · rule · SME",   tone:"blue"    as Tone },
  { n:4, l:"Validation & Confidence", icon:Shield,       sub:"Schema · cross-source · identity · relationship", tone:"emerald" as Tone },
  { n:5, l:"Derived Record",          icon:Layers,       sub:"Enriched record · lineage · version · metadata",  tone:"teal"    as Tone },
  { n:6, l:"Continuous Optimization", icon:TrendingUp,   sub:"Feedback · learning · method effectiveness",      tone:"cyan"    as Tone },
];

const PIPELINE = [
  { l:"Raw Source",             icon:Database },
  { l:"Gap Detection",          icon:ScanSearch },
  { l:"Quality Analysis",       icon:Shield },
  { l:"Method Scoring",         icon:BrainCircuit },
  { l:"Method Selection",       icon:Wand2 },
  { l:"Execution",              icon:Zap },
  { l:"Validation",             icon:CheckCircle2 },
  { l:"Confidence Scoring",     icon:Gauge },
  { l:"Derived Record Builder", icon:Layers },
  { l:"Operational Store",      icon:Boxes },
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

function Donut({ segs, centerLabel, size = 160 }: { segs: { label: string; value: number; color: string }[]; centerLabel: string; size?: number }) {
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
      <text x="60" y="58" textAnchor="middle" className="fill-slate-900" fontSize="16" fontWeight="700">{centerLabel}</text>
      <text x="60" y="72" textAnchor="middle" className="fill-slate-500" fontSize="9">Total Gaps</text>
    </svg>
  );
}

/* ---------- component ---------- */
export default function HydrationAndEnrichmentMethodSelector() {
  const [selectedMethod, setSelectedMethod] = useState<MethodKey>("lookup");
  const [drawer, setDrawer] = useState<{ title: string; kind: string } | null>(null);
  const [tick, setTick] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Simulation state
  const [simSource, setSimSource] = useState(85);
  const [simLatency, setSimLatency] = useState(500);
  const [simConfThreshold, setSimConfThreshold] = useState(85);
  const [simRelDensity, setSimRelDensity] = useState(70);

  // Confidence weights
  const [weights, setWeights] = useState({
    source: 25, relationship: 15, cross: 20, schema: 10, freshness: 10, historical: 10, business: 5, context: 5,
  });

  useEffect(() => {
    const t = setInterval(() => setTick((n) => (n + 1) % 1000), 900);
    return () => clearInterval(t);
  }, []);

  const activeStage = tick % PIPELINE.length;
  const activeWfStage = tick % WORKFLOW_STAGES.length;

  const gapSegs = METHODS.map((m) => ({ label: `Resolved · ${m.label.replace(/^Source of Truth /, "").replace(/Adjacent /, "").replace(/Rule-Based /, "").replace(/Business /, "")}`,
    value: parseFloat(m.usage7d), color: m.color }));

  const weightedConf = useMemo(() => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
    const scores = { source: 0.98, relationship: 0.88, cross: 0.95, schema: 0.97, freshness: 0.86, historical: 0.92, business: 0.9, context: 0.85 };
    let s = 0;
    (Object.keys(weights) as (keyof typeof weights)[]).forEach((k) => { s += (weights[k] / total) * scores[k]; });
    return s;
  }, [weights]);

  const chosen = METHODS.find((m) => m.key === selectedMethod)!;

  // Simulator: pick best method
  const simPick = useMemo(() => {
    const scored = METHODS.map((m) => {
      const latMs = m.latency.endsWith("ms") ? parseFloat(m.latency) : parseFloat(m.latency) * 1000;
      const latScore = Math.max(0, 100 - Math.abs(latMs - simLatency) / 30);
      const availScore = simSource;
      const confScore = m.conf * 100;
      const total = confScore * 0.4 + latScore * 0.3 + availScore * 0.3;
      return { m, total };
    }).sort((a, b) => b.total - a.total);
    return scored[0];
  }, [simSource, simLatency, simConfThreshold, simRelDensity]);

  return (
    <div className="px-6 py-5 space-y-5 max-w-[1920px] mx-auto bg-white">
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-blue-600">
            <Droplet className="h-3.5 w-3.5" /> Hydration & Lineage · Method Selector
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 mt-1">Hydration &amp; Enrichment Method Selector</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-4xl">
            Transform incomplete operational telemetry into trusted operational intelligence while preserving source integrity.
          </p>
          <p className="text-[12px] text-slate-500 mt-1 max-w-4xl leading-relaxed">
            The Hydration Engine continuously evaluates missing context and dynamically selects the optimal enrichment strategy
            based on confidence, availability, latency, cost, and business rules — raw records are never modified.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 mr-2 text-right leading-tight">
            <div>Last Updated</div>
            <div className="font-semibold text-slate-700 tabular-nums">May 12, 2025 · 10:32 AM</div>
          </div>
          <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><Filter className="h-3.5 w-3.5" /> Filters</button>
          <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Method Library</button>
          <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><FlaskConical className="h-3.5 w-3.5" /> Simulation Mode</button>
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
                <span className="text-[10px] font-semibold text-emerald-600">
                  {k.delta.startsWith("-") ? "▼" : "▲"} {k.delta}
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

      {/* Hydration Decision Workflow */}
      <section className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[15px] font-bold text-slate-900 flex items-center gap-2"><Workflow className="h-4 w-4 text-blue-500" /> Hydration Decision Workflow</div>
            <div className="text-[11px] text-slate-500">Continuous engineering pipeline — click any stage to open the Engineering Drawer.</div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live orchestration
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-2">
          {WORKFLOW_STAGES.map((s, i) => {
            const t = tone[s.tone];
            const active = i === activeWfStage;
            return (
              <button key={s.n} onClick={() => setDrawer({ title: `${s.n}. ${s.l}`, kind: "wf-stage" })}
                className={`text-left rounded-lg border p-3 transition-all ${active ? `${t.ring.replace("ring-","border-")} ${t.bg} shadow-md scale-[1.01]` : "border-slate-200 bg-white hover:border-slate-300"}`}>
                <div className="flex items-center gap-2">
                  <div className={`h-9 w-9 rounded-lg ${t.bg} grid place-items-center`}>
                    <s.icon className={`h-4 w-4 ${t.text}`} />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400">STAGE 0{s.n}</div>
                    <div className="text-[12px] font-bold text-slate-900 leading-tight">{s.l}</div>
                  </div>
                </div>
                <div className="text-[10.5px] text-slate-600 mt-2 leading-snug">{s.sub}</div>
                {active && <div className="mt-2 text-[10px] font-mono text-emerald-700">▸ executing</div>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Two-column: Raw vs Derived (7) + Right (Method Library summary + Gap Resolution) (5) */}
      <section className="grid grid-cols-12 gap-4">
        {/* Raw vs Derived */}
        <div className="col-span-12 xl:col-span-7 bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[15px] font-bold text-slate-900">Raw vs Derived Record Viewer</div>
              <div className="text-[11px] text-slate-500">Raw record is immutable · Derived record is versioned with lineage & confidence</div>
            </div>
            <button onClick={() => setExpanded((x) => !x)} className="text-[11px] font-semibold text-blue-700 hover:underline inline-flex items-center gap-1">
              <Eye className="h-3 w-3" /> {expanded ? "Collapse" : "Expand full detail"}
            </button>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
            {/* Raw */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">Immutable Raw Record</div>
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-200 rounded-full px-2 py-0.5 inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Immutable</span>
              </div>
              <div className="font-mono text-[11px] leading-relaxed text-slate-700 space-y-0.5">
                <div>{`{`}</div>
                <div className="pl-3">"event_time": "2025-05-12T10:15:22Z",</div>
                <div className="pl-3">"src_ip": "10.1.2.3",</div>
                <div className="pl-3">"dst_ip": "52.23.10.5",</div>
                <div className="pl-3">"action": "allow",</div>
                <div className="pl-3">"bytes": 1520,</div>
                <div className="pl-3 text-amber-600">"user": <span className="italic">null</span>,</div>
                <div className="pl-3 text-amber-600">"device_id": <span className="italic">null</span>,</div>
                <div className="pl-3 text-amber-600">"app": <span className="italic">null</span>,</div>
                <div className="pl-3 text-amber-600">"geo_country": <span className="italic">null</span>,</div>
                <div className="pl-3 text-amber-600">"risk_score": <span className="italic">—</span></div>
                <div>{`}`}</div>
              </div>
              <div className="text-[10px] text-slate-500 mt-2 inline-flex items-center gap-1"><Shield className="h-3 w-3" /> Never modified · WORM object lock</div>
            </div>

            <div className="grid place-items-center">
              <div className="rounded-full h-10 w-10 bg-blue-100 grid place-items-center animate-pulse">
                <ArrowRight className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            {/* Derived */}
            <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] uppercase tracking-wide font-semibold text-violet-700">Enriched Derived Record</div>
                <span className="text-[10px] font-semibold text-violet-700 bg-violet-100 rounded-full px-2 py-0.5">NEW · linked by log_id</span>
              </div>
              <div className="font-mono text-[11px] leading-relaxed text-slate-800 space-y-0.5">
                {[
                  { l:`"event_time": "2025-05-12T10:15:22Z"`, kept:true },
                  { l:`"src_ip": "10.1.2.3"`, kept:true },
                  { l:`"dst_ip": "52.23.10.5"`, kept:true },
                  { l:`"action": "allow"`, kept:true },
                  { l:`"bytes": 1520`, kept:true },
                  { l:`"user": "jsmith@acme.com"`, method:"Identity" },
                  { l:`"device_id": "PC-12345"`, method:"CMDB Lookup" },
                  { l:`"app": "Salesforce"`, method:"Rule Derivation" },
                  { l:`"geo_country": "US"`, method:"Rule (Geo-IP)" },
                  { l:`"risk_score": 23`, method:"Correlation" },
                  { l:`"enrichment_method": "Composite"`, method:"Orchestrator" },
                  { l:`"enrichment_confidence": 0.94`, method:"Scoring" },
                ].map((f, i) => (
                  <div key={i} className={`pl-3 flex items-start gap-2 ${!f.kept ? "bg-violet-50 rounded" : ""}`}>
                    <div className="flex-1 truncate">{f.l}{i < 11 ? "," : ""}</div>
                    {f.method && <span className="text-[9px] font-sans font-semibold text-violet-700 shrink-0 whitespace-nowrap">◀ {f.method}</span>}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-violet-200">
                {[["Confidence","0.94"],["Lineage","✓ traced"],["Version","v1.0"]].map(([l, v]) => (
                  <div key={l} className="rounded bg-white border border-violet-100 p-1.5 text-center">
                    <div className="text-[9px] uppercase text-violet-700 font-semibold">{l}</div>
                    <div className="text-[12px] font-bold text-slate-900 tabular-nums">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-[12px] font-bold text-slate-800 mb-2">Field-by-Field Enrichment</div>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    {["Field","Source","Method","Confidence","Timestamp"].map((h) => <th key={h} className="py-1.5 pr-3 font-semibold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["user",         "Okta Identity",       "Identity Resolution",  0.98],
                    ["device_id",    "ServiceNow CMDB",     "Source of Truth Lookup", 0.96],
                    ["app",          "Rule Engine (IP→App)","Rule-Based Derivation", 0.93],
                    ["geo_country",  "MaxMind DB",          "Rule-Based Derivation", 0.97],
                    ["risk_score",   "NetFlow · 5min join", "Adjacent Log Correlation", 0.88],
                  ].map((r) => (
                    <tr key={r[0] as string} className="border-b border-slate-100">
                      <td className="py-1.5 pr-3 font-mono font-semibold text-blue-700">{r[0]}</td>
                      <td className="py-1.5 pr-3 text-slate-700">{r[1]}</td>
                      <td className="py-1.5 pr-3"><span className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 text-[10px] font-semibold">{r[2]}</span></td>
                      <td className="py-1.5 pr-3 tabular-nums font-semibold text-emerald-700">{(r[3] as number).toFixed(2)}</td>
                      <td className="py-1.5 pr-3 text-slate-500 tabular-nums">10:15:23</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-[15px] font-bold text-slate-900 mb-1">Gap Resolution Summary (7 Days)</div>
            <div className="text-[11px] text-slate-500 mb-2">Hover to inspect · click to open drawer</div>
            <div className="flex items-center gap-3">
              <Donut segs={gapSegs} centerLabel="3.6M" />
              <div className="space-y-1 text-[10.5px] flex-1">
                {gapSegs.map((s, i) => (
                  <button key={s.label} onClick={() => setDrawer({ title: METHODS[i].label, kind: "method" })} className="w-full flex items-center justify-between hover:bg-slate-50 rounded px-1 py-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                      <span className="text-slate-700">{METHODS[i].label}</span>
                    </span>
                    <span className="tabular-nums font-semibold text-slate-900">{METHODS[i].usage7d}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-[15px] font-bold text-slate-900 mb-2">Method Effectiveness (Live)</div>
            <div className="space-y-1.5">
              {METHODS.slice(0, 6).map((m) => (
                <div key={m.key} className="flex items-center gap-2 text-[11px]">
                  <m.icon className="h-3.5 w-3.5 shrink-0" style={{ color: m.color }} />
                  <div className="w-40 truncate text-slate-700">{m.label}</div>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${m.success}%`, background: m.color }} />
                  </div>
                  <div className="w-9 text-right font-semibold tabular-nums text-slate-800">{m.success}%</div>
                  <div className="w-14 text-right text-slate-500 tabular-nums text-[10px]">{m.latency}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Method Library */}
      <section className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[15px] font-bold text-slate-900">Hydration &amp; Enrichment Method Library</div>
            <div className="text-[11px] text-slate-500">Choose the right method based on data need, confidence, and cost</div>
          </div>
          <div className="text-[11px] text-slate-500">Selected: <span className="font-semibold text-slate-800">{chosen.label}</span></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-3">
          {METHODS.map((m) => {
            const t = tone[m.tone];
            const active = m.key === selectedMethod;
            return (
              <button key={m.key}
                onClick={() => { setSelectedMethod(m.key); setDrawer({ title: m.label, kind: "method" }); }}
                className={`text-left rounded-xl border p-3 transition-all ${active ? `${t.ring.replace("ring-","border-")} ${t.bg} shadow-md` : "border-slate-200 bg-white hover:shadow-sm hover:-translate-y-0.5"}`}>
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg ${t.bg} grid place-items-center`}><m.icon className={`h-4 w-4 ${t.text}`} /></div>
                  <div className="text-[13px] font-bold text-slate-900">{m.label}</div>
                </div>
                <div className="text-[11px] text-slate-600 mt-2 leading-snug">{m.desc}</div>
                <div className="text-[10px] text-slate-500 mt-2">Example: <span className="text-slate-700 font-medium">{m.example}</span></div>
                <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100">
                  {[
                    ["Usage 7D", m.usage7d],
                    ["Success", `${m.success}%`],
                    ["Latency", m.latency],
                    ["Conf", m.conf.toFixed(2)],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div className="text-[9px] uppercase text-slate-500 font-semibold">{l}</div>
                      <div className="text-[12px] font-bold text-slate-900 tabular-nums">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">{m.complexity} complexity</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">{m.cost}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Engineering Transparency Zone */}
      <section className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 p-5 space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-600">Engineering Transparency</div>
            <h2 className="text-[22px] font-bold tracking-tight text-slate-900">How the Hydration Intelligence Engine Works</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Gap → scoring → method → execution → validation → confidence → derived record. Every field explainable.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live engine
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Workflow className="h-4 w-4 text-violet-500" /> Hydration Intelligence Pipeline</div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {PIPELINE.map((s, i) => {
              const active = i === activeStage;
              return (
                <>
                  <button key={s.l} onClick={() => setDrawer({ title: s.l, kind: "stage" })}
                    className={`shrink-0 rounded-lg border p-2 w-[140px] text-left transition-all ${active ? "border-violet-400 bg-violet-50 shadow-md scale-[1.03]" : "border-slate-200 bg-white hover:border-slate-300"}`}>
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
          {/* Decision Engine */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-blue-500" /> Engineering Decision Engine</div>
            <div className="space-y-1.5">
              {[
                { l:"Gap Analysis",         icon:ScanSearch,   tone:"amber"   as Tone },
                { l:"Available Sources",    icon:Database,     tone:"blue"    as Tone },
                { l:"Relationship Graph",   icon:Network,      tone:"teal"    as Tone },
                { l:"Policy Engine",        icon:Lock,         tone:"violet"  as Tone },
                { l:"Confidence Model",     icon:Gauge,        tone:"emerald" as Tone },
                { l:"Latency Model",        icon:Clock,        tone:"cyan"    as Tone },
                { l:"Cost Model",           icon:Layers,       tone:"amber"   as Tone },
                { l:"Business Rules",       icon:FileCode,     tone:"violet"  as Tone },
                { l:"Hydration Strategy",   icon:Wand2,        tone:"blue"    as Tone },
                { l:"Execution",            icon:Zap,          tone:"emerald" as Tone },
                { l:"Validation",           icon:Shield,       tone:"emerald" as Tone },
              ].map((s, i) => {
                const t = tone[s.tone];
                const active = (tick + i) % 11 < 3;
                return (
                  <div key={s.l} className={`flex items-center gap-2 rounded-lg border p-1.5 transition ${active ? `${t.ring.replace("ring-","border-")} ${t.bg} shadow-sm` : "border-slate-100"}`}>
                    <div className={`h-6 w-6 rounded-md grid place-items-center ${t.bg}`}>
                      <s.icon className={`h-3 w-3 ${t.text}`} />
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 flex-1">{s.l}</div>
                    {active && <span className="text-[9px] font-mono text-emerald-600">▸ eval</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confidence Scoring */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Gauge className="h-4 w-4 text-emerald-500" /> Confidence Scoring Engine</div>
            <div className="space-y-2">
              {[
                ["source",       "Source Reliability"],
                ["relationship", "Relationship Density"],
                ["cross",        "Cross-source Agreement"],
                ["schema",       "Schema Match"],
                ["freshness",    "Freshness"],
                ["historical",   "Historical Accuracy"],
                ["business",     "Business Rule"],
                ["context",      "Operational Context"],
              ].map(([k, l]) => (
                <div key={k}>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-slate-700">{l}</span>
                    <span className="tabular-nums font-semibold text-slate-800">{weights[k as keyof typeof weights]}%</span>
                  </div>
                  <input type="range" min={0} max={40} value={weights[k as keyof typeof weights]}
                    onChange={(e) => setWeights({ ...weights, [k]: +e.target.value })}
                    className="w-full h-1 accent-emerald-500" />
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600">Weighted Confidence</span>
                <span className="text-[20px] font-bold text-emerald-600 tabular-nums">{weightedConf.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Live Enrichment Simulator */}
          <div className="col-span-12 lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-4 text-slate-100">
            <div className="text-sm font-bold mb-2 flex items-center gap-2"><Radio className="h-4 w-4 text-emerald-400 animate-pulse" /> Live Enrichment Simulator</div>
            <div className="space-y-2 text-[10.5px]">
              <div>
                <div className="flex items-center justify-between"><span>Source availability</span><span className="tabular-nums font-semibold">{simSource}%</span></div>
                <input type="range" min={0} max={100} value={simSource} onChange={(e) => setSimSource(+e.target.value)} className="w-full accent-emerald-500 h-1" />
              </div>
              <div>
                <div className="flex items-center justify-between"><span>Latency budget</span><span className="tabular-nums font-semibold">{simLatency}ms</span></div>
                <input type="range" min={50} max={3000} step={50} value={simLatency} onChange={(e) => setSimLatency(+e.target.value)} className="w-full accent-emerald-500 h-1" />
              </div>
              <div>
                <div className="flex items-center justify-between"><span>Confidence threshold</span><span className="tabular-nums font-semibold">{simConfThreshold}%</span></div>
                <input type="range" min={50} max={99} value={simConfThreshold} onChange={(e) => setSimConfThreshold(+e.target.value)} className="w-full accent-emerald-500 h-1" />
              </div>
              <div>
                <div className="flex items-center justify-between"><span>Relationship density</span><span className="tabular-nums font-semibold">{simRelDensity}%</span></div>
                <input type="range" min={0} max={100} value={simRelDensity} onChange={(e) => setSimRelDensity(+e.target.value)} className="w-full accent-emerald-500 h-1" />
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2">
              <div className="text-[9px] uppercase text-emerald-300 font-semibold">Recommended Method</div>
              <div className="flex items-center gap-2 mt-0.5">
                <simPick.m.icon className="h-4 w-4 text-emerald-400" />
                <div className="text-[13px] font-bold text-white">{simPick.m.label}</div>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Score {simPick.total.toFixed(0)} · conf {simPick.m.conf.toFixed(2)} · lat {simPick.m.latency}</div>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mt-3">
              {[
                { l:"Lookups/s", v: (420 + tick * 3).toString() },
                { l:"Cache hit", v: `${88 + (tick % 5)}%` },
                { l:"Retries",   v: `${2 + (tick % 3)}` },
                { l:"Queue",     v: `${6 + (tick % 5)}` },
                { l:"CPU",       v: `${42 + (tick % 12)}%` },
                { l:"Mem",       v: `${58 + (tick % 8)}%` },
                { l:"Conf",      v: `0.${900 + (tick % 40)}` },
                { l:"Success",   v: `${92 + (tick % 3)}%` },
              ].map((m) => (
                <div key={m.l} className="rounded bg-slate-900 border border-slate-800 p-1">
                  <div className="text-[8.5px] text-slate-400 uppercase">{m.l}</div>
                  <div className="text-[11px] font-bold tabular-nums">{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom operational widgets */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            { l:"Hydration Effectiveness", v:"92%",   s:"+1.4 pts wk",       i:TrendingUp,   tone:"emerald" as Tone },
            { l:"Top Missing Field",       v:"user",  s:"3.1M events",       i:ScanSearch,   tone:"amber"   as Tone },
            { l:"Lookup Performance",      v:"120ms", s:"p95 210ms",         i:Clock,        tone:"blue"    as Tone },
            { l:"Correlation Accuracy",    v:"91%",   s:"+2 pts wk",         i:Link2,        tone:"cyan"    as Tone },
            { l:"Lineage Coverage",        v:"100%",  s:"every field",       i:GitBranch,    tone:"violet"  as Tone },
            { l:"Automation Rate",         v:"96%",   s:"human ≤ 4%",        i:Wand2,        tone:"teal"    as Tone },
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

        {/* Key Principles */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-2">Key Principles</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "Raw logs are never modified or overwritten",
                "Every enriched record is linked to original log_id",
                "Full lineage and confidence score for every field",
                "Audit trail for every hydration action",
                "Meets 90%+ completeness target",
                "Reversible: derived records can be re-computed",
              ].map((p) => (
                <div key={p} className="flex items-start gap-2 text-[11.5px] text-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-2">Hydration Impact</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Completeness Improvement", "+22%",  "emerald"],
                ["Downstream Query Success", "+31%",  "emerald"],
                ["MTTR Improvement",         "-18%",  "blue"],
              ].map(([l, v, tn]) => {
                const t = tone[tn as Tone];
                return (
                  <div key={l as string} className={`rounded-lg border ${t.ring.replace("ring-","border-")} ${t.bg} p-2`}>
                    <div className={`text-[10px] uppercase font-semibold ${t.text}`}>{l}</div>
                    <div className="text-[18px] font-bold text-slate-900 tabular-nums mt-1">{v}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-[580px] sm:max-w-[580px] p-0 overflow-y-auto">
          <SheetHeader className="p-5 border-b border-slate-200 bg-gradient-to-br from-white to-blue-50/40">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">Engineering Drawer</div>
            <SheetTitle className="text-lg">{drawer?.title ?? ""}</SheetTitle>
            <p className="text-[11px] text-slate-500">Every derived field — sourced, scored, versioned, and reversible.</p>
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
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Operational Purpose</div>
                <p className="text-[12px] text-slate-700 mt-1">Fills operationally required context on the derived layer so downstream analytics, AI agents, and dashboards can consume a trusted, complete record — while the original event remains immutable and auditable.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Fact l="Consumers" v="24 downstream" />
                <Fact l="Confidence" v="0.94" />
                <Fact l="Owner" v="Data Platform" />
                <Fact l="Reversible" v="Yes" />
              </div>
            </TabsContent>

            <TabsContent value="engineering" className="mt-4">
              <div className="space-y-1.5">
                {[
                  "Gap detection","Method scoring","Lookup engine","Correlation engine","Synthetic engine",
                  "Rule engine","Validation","Confidence model","Derived record builder","Lineage generation","Versioning",
                ].map((s, i) => (
                  <div key={s} className={`flex items-center gap-2 rounded-md border p-2 ${(tick + i) % 11 < 3 ? "border-blue-300 bg-blue-50" : "border-slate-200"}`}>
                    <div className="h-6 w-6 rounded bg-blue-100 grid place-items-center text-[10px] font-mono text-blue-700">{i + 1}</div>
                    <div className="text-[12px] text-slate-800 font-medium flex-1">{s}</div>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="telemetry" className="mt-4 grid grid-cols-2 gap-2">
              {[
                ["Lookups/sec", `${420 + tick * 3}`],
                ["Correlation rate", `${91 + (tick % 4)}%`],
                ["Cache hits", `${88 + (tick % 5)}%`],
                ["Latency p50", `${120 + (tick % 20)}ms`],
                ["Latency p95", `${380 + (tick % 40)}ms`],
                ["Queue depth", `${6 + (tick % 5)}`],
                ["Retries", `${2 + (tick % 3)}`],
                ["Success rate", `${92 + (tick % 3)}%`],
                ["Failures", `${(0.4 + (tick % 4) * 0.1).toFixed(1)}%`],
                ["Confidence avg", `0.${900 + (tick % 40)}`],
                ["CPU", `${42 + (tick % 12)}%`],
                ["Memory", `${58 + (tick % 8)}%`],
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
                  <label className="text-[11px] font-semibold text-slate-700">Source availability: <span className="text-blue-600 tabular-nums">{simSource}%</span></label>
                  <input type="range" min={0} max={100} value={simSource} onChange={(e) => setSimSource(+e.target.value)} className="w-full accent-blue-500" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Latency budget: <span className="text-blue-600 tabular-nums">{simLatency}ms</span></label>
                  <input type="range" min={50} max={3000} step={50} value={simLatency} onChange={(e) => setSimLatency(+e.target.value)} className="w-full accent-blue-500" />
                </div>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-[10px] uppercase font-semibold text-emerald-700">Recommended Method</div>
                <div className="text-[14px] font-bold text-slate-900 mt-1">{simPick.m.label}</div>
                <div className="text-[11px] text-slate-600 mt-1">Score {simPick.total.toFixed(0)} · confidence {simPick.m.conf.toFixed(2)} · latency {simPick.m.latency}</div>
              </div>
            </TabsContent>

            <TabsContent value="deps" className="mt-4 space-y-1.5">
              {[
                { l:"Source Systems",       i:Database },
                { l:"Reference Data",       i:BookOpen },
                { l:"CMDB",                 i:Boxes },
                { l:"Identity",             i:Fingerprint },
                { l:"Topology",             i:Network },
                { l:"Knowledge Graph",      i:GitBranch },
                { l:"Relationship Engine",  i:Link2 },
                { l:"Validation Engine",    i:Shield },
                { l:"Canonical Model",      i:Layers },
                { l:"Consumers",            i:Users },
                { l:"Ownership",            i:Lock },
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
