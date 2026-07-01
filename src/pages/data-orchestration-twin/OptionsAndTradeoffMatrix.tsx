import { useMemo, useState, useEffect } from "react";
import {
  Layers, Database, DollarSign, ShieldCheck, TrendingUp, Target, Gauge, Cpu,
  Filter, Download, RefreshCw, Settings2, Search, ChevronRight, X, Info,
  Home, Cloud, Zap, Clock, Timer, Archive, FileText, Share2, Ban,
  Star, StarHalf, AlertTriangle, CheckCircle2, Activity, Workflow, GitBranch, Boxes,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------------- Tokens ---------------- */
type Tone = "emerald" | "blue" | "amber" | "violet" | "rose" | "cyan" | "slate";
const tone = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200", hex: "#10b981" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",    ring: "ring-blue-200",    hex: "#3b82f6" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",   ring: "ring-amber-200",   hex: "#f59e0b" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-600",  ring: "ring-violet-200",  hex: "#8b5cf6" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-600",    ring: "ring-rose-200",    hex: "#f43f5e" },
  cyan:    { bg: "bg-cyan-50",    text: "text-cyan-600",    ring: "ring-cyan-200",    hex: "#06b6d4" },
  slate:   { bg: "bg-slate-50",   text: "text-slate-600",   ring: "ring-slate-200",   hex: "#64748b" },
} as const;

/* ---------------- Types ---------------- */
type Strategy = {
  key: string;
  name: string;
  icon: any;
  tone: Tone;
  description: string;
  useCase: string;
  latencyLabel: string;
  latency: number;      // lower is better (ms scale abstract)
  freshness: number;    // higher is better
  storageCost: number;  // $ index (lower better)
  computeCost: number;
  networkCost: number;
  duplicationRisk: number; // lower better
  engComplexity: number;   // lower better
  opsComplexity: number;   // lower better
  scalability: number;     // higher better
  aiReadiness: number;     // higher better
  confidence: number;      // higher better
  monthlyCost: number;     // $
  score: number;           // 0-100 overall
  recommendation: "Recommended" | "Situational" | "Avoid";
  advantages: string[];
  tradeoffs: string[];
  bestWorkloads: string[];
  worstWorkloads: string[];
};

const STRATEGIES: Strategy[] = [
  { key: "stay",  name: "Stay in Source",       icon: Home,     tone: "emerald",
    description: "Data remains in source system; queried on demand via federated engine.",
    useCase: "High-volume logs, real-time systems where source already optimized.",
    latencyLabel: "Low", latency: 20, freshness: 98, storageCost: 5, computeCost: 20,
    networkCost: 15, duplicationRisk: 2, engComplexity: 25, opsComplexity: 20,
    scalability: 85, aiReadiness: 60, confidence: 90, monthlyCost: 210, score: 92,
    recommendation: "Recommended",
    advantages: ["Zero duplication", "Always fresh", "Lowest storage cost", "Simple governance"],
    tradeoffs: ["Source system load", "Federation latency", "Availability tied to source"],
    bestWorkloads: ["High-volume telemetry", "Real-time dashboards", "Compliance replay"],
    worstWorkloads: ["Complex joins", "AI training corpora"],
  },
  { key: "query", name: "Query on Demand",      icon: Cloud,    tone: "blue",
    description: "No persistent copy; fetched when needed from origin.",
    useCase: "Infrequent access, ad-hoc analysis, exploratory queries.",
    latencyLabel: "Medium", latency: 55, freshness: 96, storageCost: 3, computeCost: 55,
    networkCost: 45, duplicationRisk: 3, engComplexity: 30, opsComplexity: 30,
    scalability: 70, aiReadiness: 45, confidence: 78, monthlyCost: 480, score: 78,
    recommendation: "Situational",
    advantages: ["No storage footprint", "Low idle cost", "Fresh reads"],
    tradeoffs: ["Higher latency", "Egress cost per query", "Not cacheable"],
    bestWorkloads: ["Ad-hoc analytics", "Investigator workflows"],
    worstWorkloads: ["High QPS dashboards", "Streaming AI"],
  },
  { key: "edge",  name: "Edge Cache / Delta",   icon: Zap,      tone: "amber",
    description: "Hot data cached at edge with frequent deltas from source.",
    useCase: "Moderate volume, time-sensitive queries with change-data-capture.",
    latencyLabel: "Very Low", latency: 12, freshness: 92, storageCost: 35, computeCost: 40,
    networkCost: 30, duplicationRisk: 25, engComplexity: 55, opsComplexity: 45,
    scalability: 88, aiReadiness: 78, confidence: 88, monthlyCost: 760, score: 85,
    recommendation: "Recommended",
    advantages: ["Sub-second latency", "Delta-only network", "AI-ready cache"],
    tradeoffs: ["Cache warm-up", "Delta lag on bursts", "Duplication risk"],
    bestWorkloads: ["Operational dashboards", "Feature stores"],
    worstWorkloads: ["Cold archival", "Low-QPS reports"],
  },
  { key: "15min", name: "15 Minute Refresh",    icon: Timer,    tone: "cyan",
    description: "Micro-batch refresh every 15 minutes into shared table.",
    useCase: "Near-real-time reporting where minute-level lag is acceptable.",
    latencyLabel: "Low", latency: 25, freshness: 82, storageCost: 40, computeCost: 45,
    networkCost: 25, duplicationRisk: 35, engComplexity: 45, opsComplexity: 40,
    scalability: 82, aiReadiness: 72, confidence: 82, monthlyCost: 620, score: 79,
    recommendation: "Situational",
    advantages: ["Predictable freshness", "Balanced cost", "Simple SLA"],
    tradeoffs: ["Not truly real-time", "Batch overhead"],
    bestWorkloads: ["Ops reporting", "SLO trending"],
    worstWorkloads: ["Sub-second decisioning"],
  },
  { key: "hourly",name: "Hourly Delta Refresh", icon: Clock,    tone: "violet",
    description: "Pull deltas hourly into curated store.",
    useCase: "Operational monitoring, short-term analysis, near real-time trends.",
    latencyLabel: "Low", latency: 30, freshness: 70, storageCost: 45, computeCost: 45,
    networkCost: 22, duplicationRisk: 40, engComplexity: 45, opsComplexity: 40,
    scalability: 80, aiReadiness: 74, confidence: 80, monthlyCost: 690, score: 80,
    recommendation: "Situational",
    advantages: ["Steady load", "Manageable footprint", "Good for trends"],
    tradeoffs: ["Hourly staleness", "Requires CDC keys"],
    bestWorkloads: ["Historical trending", "Batch AI features"],
    worstWorkloads: ["Real-time alerting"],
  },
  { key: "24h",   name: "24 Hour Differential", icon: RefreshCw,tone: "violet",
    description: "Pull differential changes every 24 hours.",
    useCase: "Large logs, daily analysis, cost-sensitive workloads.",
    latencyLabel: "Low", latency: 35, freshness: 45, storageCost: 55, computeCost: 35,
    networkCost: 18, duplicationRisk: 45, engComplexity: 40, opsComplexity: 35,
    scalability: 82, aiReadiness: 68, confidence: 76, monthlyCost: 480, score: 72,
    recommendation: "Situational",
    advantages: ["Very low ingest cost", "Simple pipeline", "Predictable batch"],
    tradeoffs: ["24h staleness", "Not for live ops"],
    bestWorkloads: ["Daily executive reporting"],
    worstWorkloads: ["Fraud, security response"],
  },
  { key: "vault", name: "Vault / Normalized Store", icon: Archive, tone: "cyan",
    description: "Normalized and stored for analytics & joins.",
    useCase: "Reporting, long-term analysis, join-heavy workloads.",
    latencyLabel: "Medium", latency: 45, freshness: 55, storageCost: 78, computeCost: 65,
    networkCost: 20, duplicationRisk: 60, engComplexity: 70, opsComplexity: 65,
    scalability: 90, aiReadiness: 85, confidence: 84, monthlyCost: 1680, score: 81,
    recommendation: "Recommended",
    advantages: ["Rich joins", "Historical depth", "AI-training ready"],
    tradeoffs: ["Highest storage cost", "Duplicative by design", "Complex modeling"],
    bestWorkloads: ["Warehouse analytics", "AI corpora"],
    worstWorkloads: ["High-freshness ops"],
  },
  { key: "doc",   name: "Document Store",       icon: FileText, tone: "slate",
    description: "Store unstructured / semi-structured documents.",
    useCase: "Configs, tickets, text logs, semi-structured payloads.",
    latencyLabel: "Medium", latency: 40, freshness: 60, storageCost: 50, computeCost: 45,
    networkCost: 25, duplicationRisk: 40, engComplexity: 45, opsComplexity: 40,
    scalability: 78, aiReadiness: 72, confidence: 72, monthlyCost: 540, score: 70,
    recommendation: "Situational",
    advantages: ["Schema-flexible", "Fits raw payloads", "Good for RAG"],
    tradeoffs: ["Weaker joins", "Query cost variance"],
    bestWorkloads: ["Ticket search", "Doc-based RAG"],
    worstWorkloads: ["Numeric aggregation"],
  },
  { key: "graph", name: "Graph Projection",     icon: Share2,   tone: "rose",
    description: "Project entities and relationships to graph.",
    useCase: "Topology, impact analysis, context-driven agentic queries.",
    latencyLabel: "Very Low", latency: 15, freshness: 70, storageCost: 40, computeCost: 55,
    networkCost: 20, duplicationRisk: 30, engComplexity: 70, opsComplexity: 60,
    scalability: 82, aiReadiness: 96, confidence: 92, monthlyCost: 620, score: 88,
    recommendation: "Recommended",
    advantages: ["Best AI readiness", "Native relationship queries", "Powers agents"],
    tradeoffs: ["Modeling effort", "Specialized ops skills"],
    bestWorkloads: ["Impact analysis", "Agentic reasoning"],
    worstWorkloads: ["Flat aggregation reports"],
  },
  { key: "excl",  name: "Excluded",             icon: Ban,      tone: "slate",
    description: "Explicitly excluded from ingest with rationale.",
    useCase: "Low-value or duplicated sources removed from scope.",
    latencyLabel: "n/a", latency: 0, freshness: 0, storageCost: 0, computeCost: 0,
    networkCost: 0, duplicationRisk: 0, engComplexity: 5, opsComplexity: 5,
    scalability: 100, aiReadiness: 0, confidence: 100, monthlyCost: 0, score: 60,
    recommendation: "Situational",
    advantages: ["Zero cost", "No governance burden"],
    tradeoffs: ["No value extracted"],
    bestWorkloads: ["Duplicated debug streams"],
    worstWorkloads: ["Anything with business value"],
  },
];

const KPIS = [
  { icon: Layers,     label: "Placement Strategies Available", value: "8",      sub: "Available Options",        delta: "+1",  tone: "violet"  as Tone, spark: [6,6,7,7,8,8,8] },
  { icon: Database,   label: "Sources Evaluated",              value: "122",    sub: "100% of In-Scope",         delta: "+4",  tone: "emerald" as Tone, spark: [110,114,116,118,120,121,122] },
  { icon: DollarSign, label: "Estimated Monthly Savings",      value: "$1,960", sub: "vs Full Duplication",      delta: "+8%", tone: "amber"   as Tone, spark: [1400,1500,1620,1710,1820,1900,1960] },
  { icon: ShieldCheck,label: "Data Not Duplicated",            value: "1.82 TB",sub: "73.7% of Ingest",          delta: "+3%", tone: "blue"    as Tone, spark: [1.2,1.35,1.5,1.6,1.7,1.78,1.82] },
  { icon: TrendingUp, label: "Infrastructure Cost Avoided",    value: "$24.3K", sub: "Storage & Compute",        delta: "+11%",tone: "emerald" as Tone, spark: [18,19,20,21,22,23,24.3] },
  { icon: Target,     label: "Confidence Improvement",         value: "+8.6%",  sub: "Weighted Average",         delta: "+1.2",tone: "violet"  as Tone, spark: [4,5,6,7,7.8,8.2,8.6] },
  { icon: Gauge,      label: "Performance Gain",               value: "+31%",   sub: "Query latency reduction",  delta: "+3",  tone: "cyan"    as Tone, spark: [18,22,25,27,29,30,31] },
  { icon: Cpu,        label: "AI Readiness Improvement",       value: "+22%",   sub: "Graph & vector-ready",     delta: "+2",  tone: "rose"    as Tone, spark: [10,12,14,17,19,21,22] },
];

/* ---------------- Helpers ---------------- */
const dollars = (n: number) => n === 0 ? "$0" : n < 200 ? "$" : n < 600 ? "$$" : n < 1000 ? "$$$" : "$$$$";
const level  = (v: number) => v < 30 ? "Low" : v < 60 ? "Medium" : "High";
const levelColor = (v: number) => v < 30 ? "text-emerald-600" : v < 60 ? "text-amber-600" : "text-rose-600";
const stars = (v: number) => {
  const s = Math.round((v / 100) * 5 * 2) / 2;
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12}
          className={i <= s ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
      ))}
    </div>
  );
};

/* ---------------- Sparkline ---------------- */
function Spark({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v,i) => `${(i/(data.length-1))*100},${30 - ((v-min)/range)*28}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" className="h-8 w-full">
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts}/>
    </svg>
  );
}

/* ---------------- Radar ---------------- */
const RADAR_AXES = ["Freshness","Latency","Cost Efficiency","Eng. Complexity","Ops. Complexity","Duplication Risk","Confidence","AI Readiness"];
function radarValues(s: Strategy) {
  return [
    s.freshness,
    100 - s.latency,
    100 - (s.storageCost + s.computeCost)/2,
    100 - s.engComplexity,
    100 - s.opsComplexity,
    100 - s.duplicationRisk,
    s.confidence,
    s.aiReadiness,
  ];
}
function Radar({ strategies, highlight }: { strategies: Strategy[]; highlight?: string }) {
  const cx = 150, cy = 150, R = 110;
  const N = RADAR_AXES.length;
  const angle = (i:number) => (-Math.PI/2) + (i / N) * Math.PI * 2;
  const point = (i:number, r:number) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r] as const;
  return (
    <svg viewBox="0 0 300 300" className="w-full h-[300px]">
      {[0.25,0.5,0.75,1].map(f => (
        <polygon key={f}
          points={Array.from({length:N}, (_,i)=>point(i, R*f).join(",")).join(" ")}
          fill="none" stroke="#e2e8f0" strokeWidth={0.6}/>
      ))}
      {Array.from({length:N}).map((_,i) => {
        const [x,y] = point(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth={0.6}/>;
      })}
      {RADAR_AXES.map((a,i) => {
        const [x,y] = point(i, R + 16);
        return <text key={a} x={x} y={y} fontSize={9} fill="#475569" textAnchor="middle" dominantBaseline="middle">{a}</text>;
      })}
      {strategies.map((s) => {
        const vals = radarValues(s);
        const pts = vals.map((v,i) => point(i, (v/100)*R).join(",")).join(" ");
        const isH = highlight === s.key;
        return (
          <polygon key={s.key} points={pts}
            fill={tone[s.tone].hex} fillOpacity={isH ? 0.28 : 0.06}
            stroke={tone[s.tone].hex} strokeWidth={isH ? 2 : 1}/>
        );
      })}
    </svg>
  );
}

/* ---------------- Donut ---------------- */
function Donut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((a,b)=>a+b.value,0);
  let acc = 0;
  const R = 55, C = 2*Math.PI*R;
  return (
    <svg viewBox="0 0 160 160" className="w-[160px] h-[160px]">
      <circle cx={80} cy={80} r={R} fill="none" stroke="#f1f5f9" strokeWidth={16}/>
      {segments.map((s,i) => {
        const frac = s.value/total;
        const dash = frac * C;
        const off = (acc / total) * C;
        acc += s.value;
        return (
          <circle key={i} cx={80} cy={80} r={R} fill="none"
            stroke={s.color} strokeWidth={16}
            strokeDasharray={`${dash} ${C-dash}`} strokeDashoffset={-off}
            transform="rotate(-90 80 80)"/>
        );
      })}
      <text x={80} y={76} textAnchor="middle" fontSize={20} fontWeight={700} fill="#0f172a">2.47</text>
      <text x={80} y={94} textAnchor="middle" fontSize={9} fill="#64748b">TB Total Ingest</text>
    </svg>
  );
}

/* ---------------- Weighted Scoring ---------------- */
const DEFAULT_WEIGHTS = {
  freshness: 20, latency: 15, cost: 20, storage: 10,
  engComplexity: 10, opsComplexity: 10, aiReadiness: 10, relationship: 5,
};
function computeScore(s: Strategy, w: typeof DEFAULT_WEIGHTS) {
  const total = Object.values(w).reduce((a,b)=>a+b,0);
  const norm = (k: keyof typeof w) => w[k] / total;
  const score =
    s.freshness * norm("freshness") +
    (100 - s.latency) * norm("latency") +
    (100 - (s.storageCost + s.computeCost + s.networkCost)/3) * norm("cost") +
    (100 - s.storageCost) * norm("storage") +
    (100 - s.engComplexity) * norm("engComplexity") +
    (100 - s.opsComplexity) * norm("opsComplexity") +
    s.aiReadiness * norm("aiReadiness") +
    s.confidence * norm("relationship");
  return Math.round(score);
}

/* ---------------- Page ---------------- */
export default function OptionsAndTradeoffMatrix() {
  const [selected, setSelected] = useState<Strategy>(STRATEGIES[0]);
  const [drawer, setDrawer] = useState<{ open: boolean; title: string }>({ open: false, title: "" });
  const [q, setQ] = useState("");
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 1000), 1500);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(
    () => STRATEGIES.filter(s => s.name.toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  const scored = useMemo(
    () => STRATEGIES.map(s => ({ ...s, score: computeScore(s, weights) })),
    [weights]
  );
  const topPick = useMemo(
    () => [...scored].sort((a,b) => b.score - a.score)[0],
    [scored]
  );

  const openDrawer = (title: string) => setDrawer({ open: true, title });

  const donutSegments = [
    { label: "Stay in Source",         value: 73.7, color: tone.emerald.hex },
    { label: "Edge Cache / Delta",     value: 23.5, color: tone.amber.hex },
    { label: "24H Differential",       value: 2.0,  color: tone.violet.hex },
    { label: "Vault / Normalized",     value: 0.8,  color: tone.cyan.hex },
    { label: "Document Store",         value: 0.3,  color: tone.slate.hex },
    { label: "Graph Projection",       value: 0.3,  color: tone.rose.hex },
    { label: "Excluded",               value: 0.5,  color: "#94a3b8" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-slate-200">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Options &amp; Tradeoff Matrix</h1>
            <p className="mt-2 text-slate-600 max-w-3xl">
              Evaluate every placement strategy using operational telemetry, engineering constraints, economics, and AI readiness.
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-3xl">
              Every placement recommendation is generated from an explainable engineering model balancing freshness, latency, cost, complexity, storage, operational value, and downstream AI requirements.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500">Last Updated <b className="text-slate-700">May 12, 2025 10:32 AM</b></span>
            <button onClick={()=>openDrawer("Strategy Filters")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
              <Filter size={14}/> Filters
            </button>
            <button onClick={()=>openDrawer("Scoring Model")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
              <Settings2 size={14}/> Scoring
            </button>
            <button onClick={()=>openDrawer("Weight Configuration")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
              <Gauge size={14}/> Weights
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800">
              <Download size={14}/> Export
            </button>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="px-8 py-5 grid grid-cols-8 gap-3">
        {KPIS.map((k) => (
          <button key={k.label} onClick={()=>openDrawer(k.label)}
            className="group text-left rounded-xl border border-slate-200 bg-white p-3 hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="flex items-center justify-between">
              <div className={`h-8 w-8 rounded-lg ${tone[k.tone].bg} ${tone[k.tone].text} flex items-center justify-center`}>
                <k.icon size={16}/>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600">{k.delta}</span>
            </div>
            <div className="mt-2 text-[10px] font-medium text-slate-500">{k.label}</div>
            <div className="text-lg font-bold text-slate-900">{k.value}</div>
            <div className="text-[10px] text-slate-500">{k.sub}</div>
            <Spark data={k.spark} color={tone[k.tone].hex}/>
          </button>
        ))}
      </div>

      {/* Main Grid — 60/40 */}
      <div className="px-8 pb-6 grid grid-cols-12 gap-4">
        {/* Left 8/12 — Tradeoff Matrix */}
        <div className="col-span-8 rounded-xl border border-slate-200 bg-white">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">Placement Pattern Tradeoff Comparison</div>
              <div className="text-xs text-slate-500">Click a row to load into the Decision Intelligence panel</div>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400"/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search strategies…"
                className="pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-100"/>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-100">
                  <th className="px-3 py-2 font-medium">Placement Pattern</th>
                  <th className="px-2 py-2 font-medium">Description</th>
                  <th className="px-2 py-2 font-medium">Typical Use</th>
                  <th className="px-2 py-2 font-medium">Freshness</th>
                  <th className="px-2 py-2 font-medium">Latency</th>
                  <th className="px-2 py-2 font-medium">Dup Risk</th>
                  <th className="px-2 py-2 font-medium">Storage</th>
                  <th className="px-2 py-2 font-medium">Compute</th>
                  <th className="px-2 py-2 font-medium">Eng Complexity</th>
                  <th className="px-2 py-2 font-medium">Confidence</th>
                  <th className="px-2 py-2 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const active = selected.key === s.key;
                  const t = tone[s.tone];
                  const sc = scored.find(x => x.key === s.key)!.score;
                  return (
                    <tr key={s.key}
                      onClick={()=>setSelected(s)}
                      className={`cursor-pointer border-b border-slate-100 transition
                        ${active ? "bg-blue-50/60" : "hover:bg-slate-50"}`}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-lg ${t.bg} ${t.text} flex items-center justify-center`}>
                            <s.icon size={13}/>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{s.name}</div>
                            <div className="text-[10px] text-slate-500">{s.recommendation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-slate-600 max-w-[180px]">{s.description}</td>
                      <td className="px-2 py-2 text-slate-600 max-w-[160px]">{s.useCase}</td>
                      <td className="px-2 py-2">
                        <div className={`font-medium ${levelColor(100-s.freshness)}`}>{s.freshness}%</div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1">
                          {stars(100 - s.latency)}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${levelColor(s.latency)}`}>{s.latencyLabel}</div>
                      </td>
                      <td className="px-2 py-2">
                        {s.duplicationRisk < 15 ? (
                          <ShieldCheck size={16} className="text-emerald-500"/>
                        ) : s.duplicationRisk < 40 ? (
                          <AlertTriangle size={16} className="text-amber-500"/>
                        ) : (
                          <AlertTriangle size={16} className="text-rose-500"/>
                        )}
                        <div className={`text-[10px] mt-0.5 ${levelColor(s.duplicationRisk)}`}>{level(s.duplicationRisk)}</div>
                      </td>
                      <td className="px-2 py-2">
                        <span className={`font-bold ${levelColor(s.storageCost)}`}>{dollars(s.storageCost*20)}</span>
                        <div className={`text-[10px] ${levelColor(s.storageCost)}`}>{level(s.storageCost)}</div>
                      </td>
                      <td className="px-2 py-2">
                        <span className={`font-bold ${levelColor(s.computeCost)}`}>{dollars(s.computeCost*20)}</span>
                        <div className={`text-[10px] ${levelColor(s.computeCost)}`}>{level(s.computeCost)}</div>
                      </td>
                      <td className="px-2 py-2">
                        {stars(100 - s.engComplexity)}
                        <div className={`text-[10px] ${levelColor(s.engComplexity)}`}>{level(s.engComplexity)}</div>
                      </td>
                      <td className="px-2 py-2">
                        {stars(s.confidence)}
                        <div className="text-[10px] text-slate-500">{s.confidence}%</div>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm ring-2 ${t.ring} ${t.text} bg-white`}>
                          {sc}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
            <div>Ratings ★☆☆☆☆ (Low) to ★★★★★ (High)</div>
            <div>Scoring Model: Weighted by Cost 25% · Freshness 20% · Latency 15% · Risk 15% · Complexity 10% · Confidence 15%</div>
          </div>
        </div>

        {/* Right 4/12 — Decision Intelligence */}
        <div className="col-span-4 space-y-4">
          {/* Selected strategy summary */}
          <button onClick={()=>openDrawer(selected.name)}
            className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-9 w-9 rounded-lg ${tone[selected.tone].bg} ${tone[selected.tone].text} flex items-center justify-center`}>
                  <selected.icon size={17}/>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500">Selected Strategy</div>
                  <div className="font-semibold text-slate-900">{selected.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${tone[selected.tone].text}`}>
                  {scored.find(x=>x.key===selected.key)!.score}
                </div>
                <div className="text-[10px] text-slate-500">Engineering Score</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
              <div className="rounded-md bg-slate-50 p-2">
                <div className="text-slate-500">Confidence</div>
                <div className="font-semibold text-slate-800">{selected.confidence}%</div>
              </div>
              <div className="rounded-md bg-slate-50 p-2">
                <div className="text-slate-500">Cost / mo</div>
                <div className="font-semibold text-slate-800">${selected.monthlyCost}</div>
              </div>
              <div className="rounded-md bg-slate-50 p-2">
                <div className="text-slate-500">AI Ready</div>
                <div className="font-semibold text-slate-800">{selected.aiReadiness}%</div>
              </div>
              <div className="rounded-md bg-slate-50 p-2">
                <div className="text-slate-500">Freshness</div>
                <div className="font-semibold text-slate-800">{selected.freshness}%</div>
              </div>
              <div className="rounded-md bg-slate-50 p-2">
                <div className="text-slate-500">Latency</div>
                <div className="font-semibold text-slate-800">{selected.latencyLabel}</div>
              </div>
              <div className="rounded-md bg-slate-50 p-2">
                <div className="text-slate-500">Scalability</div>
                <div className="font-semibold text-slate-800">{selected.scalability}%</div>
              </div>
            </div>
          </button>

          {/* Radar */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold text-slate-900 text-sm">Tradeoff Radar</div>
                <div className="text-[10px] text-slate-500">Higher is Better</div>
              </div>
              <button onClick={()=>openDrawer("Radar Calculations")} className="text-[10px] text-blue-600 hover:underline">show calculations</button>
            </div>
            <Radar strategies={STRATEGIES} highlight={selected.key}/>
            <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
              {STRATEGIES.slice(0,8).map(s => (
                <div key={s.key} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{background: tone[s.tone].hex}}/>
                  <span className="text-slate-600 truncate">{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Donut */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="font-semibold text-slate-900 text-sm mb-2">Recommended Placement Mix</div>
            <div className="flex items-center gap-3">
              <Donut segments={donutSegments}/>
              <div className="flex-1 space-y-1 text-[10px]">
                {donutSegments.map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{background: s.color}}/>
                      <span className="text-slate-700">{s.label}</span>
                    </div>
                    <span className="text-slate-500 font-medium">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Executive Recommendation */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-500"/>
              <div className="font-semibold text-slate-900 text-sm">Executive Recommendation</div>
            </div>
            <div className="text-xs text-slate-600 mb-2">
              Top pick: <b className={tone[topPick.tone].text}>{topPick.name}</b> ({topPick.score}/100)
            </div>
            <ul className="text-[11px] space-y-1 text-slate-600">
              {selected.advantages.slice(0,3).map(a => (
                <li key={a} className="flex gap-1.5"><CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0"/><span>{a}</span></li>
              ))}
              {selected.tradeoffs.slice(0,2).map(t => (
                <li key={t} className="flex gap-1.5"><AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0"/><span>{t}</span></li>
              ))}
            </ul>
            <div className="mt-3 text-[11px] text-slate-700">
              Est. Monthly Savings: <b className="text-emerald-600">$1,960</b> · Data Not Duplicated: <b className="text-blue-600">1.82 TB</b>
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Transparency Zone (lower 40%) */}
      <div className="px-8 pb-6 grid grid-cols-12 gap-4">
        {/* Pipeline flow */}
        <div className="col-span-8 rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3">
            <div className="text-sm font-semibold text-slate-900">How the Engineering Recommendation Engine Calculates Tradeoffs</div>
            <div className="text-[11px] text-slate-500">Decision Evaluation Pipeline — animated data flow between stages</div>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-4">
            <div className="grid grid-cols-11 gap-2 items-center">
              {[
                { label: "Source Metadata",       icon: Database,    tone: "blue" as Tone },
                { label: "Usage Analytics",       icon: Activity,    tone: "cyan" as Tone },
                { label: "Ops Requirements",      icon: Settings2,   tone: "violet" as Tone },
                { label: "Freshness Analysis",    icon: Clock,       tone: "emerald" as Tone },
                { label: "Latency Modeling",      icon: Timer,       tone: "amber" as Tone },
                { label: "Storage Modeling",      icon: Archive,     tone: "cyan" as Tone },
                { label: "Cost Modeling",         icon: DollarSign,  tone: "emerald" as Tone },
                { label: "Relationship Density",  icon: Share2,      tone: "rose" as Tone },
                { label: "AI Consumption",        icon: Cpu,         tone: "violet" as Tone },
                { label: "Weighted Scoring",      icon: Gauge,       tone: "blue" as Tone },
                { label: "Recommendation",        icon: CheckCircle2,tone: "emerald" as Tone },
              ].map((s, i, arr) => (
                <div key={s.label} className="relative flex flex-col items-center">
                  <button onClick={()=>openDrawer(s.label)}
                    className={`h-10 w-10 rounded-lg ${tone[s.tone].bg} ${tone[s.tone].text} flex items-center justify-center hover:scale-110 transition`}>
                    <s.icon size={16}/>
                  </button>
                  <div className="mt-2 text-[9px] text-center text-slate-600 leading-tight">{s.label}</div>
                  {i < arr.length - 1 && (
                    <div className="absolute top-5 left-[calc(100%-4px)] w-[calc(100%-32px)] h-px bg-gradient-to-r from-slate-300 to-slate-200">
                      <div className="h-full w-6 bg-blue-500 animate-[flow_2.4s_linear_infinite]"
                        style={{ animationDelay: `${i * 0.15}s` }}/>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weighted Scoring Engine — sliders */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Weighted Scoring Engine</div>
              <button onClick={()=>setWeights(DEFAULT_WEIGHTS)} className="text-[11px] text-blue-600 hover:underline flex items-center gap-1">
                <RefreshCw size={11}/> Reset
              </button>
            </div>
            <div className="text-[11px] text-slate-500 mb-2">Adjust weights → recommendation updates live. Top pick: <b className={tone[topPick.tone].text}>{topPick.name}</b></div>
            <div className="grid grid-cols-4 gap-3">
              {(Object.keys(weights) as (keyof typeof weights)[]).map(k => (
                <div key={k}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-600 capitalize">{k.replace(/([A-Z])/g," $1")}</span>
                    <span className="font-semibold text-slate-800">{weights[k]}%</span>
                  </div>
                  <input type="range" min={0} max={40} value={weights[k]}
                    onChange={e=>setWeights({...weights, [k]: +e.target.value})}
                    className="w-full accent-blue-600"/>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engineering Simulation — dark console */}
        <div className="col-span-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold">Engineering Simulation</div>
              <div className="text-[10px] text-slate-400">Live source evaluation console</div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/> LIVE
            </div>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            {[
              "Metadata → schema=142 fields, vol=1.12 TB",
              "Cost Engine → $210/mo stay | $760 edge | $1,680 vault",
              "Latency Engine → p95=18ms (target ≤ 50ms) ✓",
              "Freshness Engine → 98% (SLA ≥ 90%) ✓",
              "Storage Optimizer → dedup gain 73.7%",
              "Policy Rules → hits=6/8 · violations=0",
              "AI Requirements → graph=false · vector=false",
              `Recommendation → ${topPick.name.toUpperCase()} · score ${topPick.score}`,
            ].map((line, i) => (
              <div key={i} className={`transition-opacity ${tick % 8 === i ? "text-emerald-300" : "text-slate-300"}`}>
                <span className="text-slate-500">›</span> {line}
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
            {[
              { l: "Eval Time",    v: "142ms" },
              { l: "Rule Hits",    v: "6/8" },
              { l: "Score",        v: `${topPick.score}` },
              { l: "Confidence",   v: `${topPick.confidence}%` },
              { l: "Policy Ver",   v: "v4.2.1" },
              { l: "Opt Gain",     v: "+8.6%" },
            ].map(x => (
              <div key={x.l} className="rounded-md bg-slate-800/70 border border-slate-700 p-2">
                <div className="text-slate-400">{x.l}</div>
                <div className="font-bold text-slate-100">{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* When to Use / Recommendation Explorer */}
      <div className="px-8 pb-10">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Engineering Recommendation Explorer</div>
          <div className="text-[11px] text-slate-500">Click any card to preview tradeoffs in the right panel</div>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {STRATEGIES.slice(0, 10).map(s => {
            const active = selected.key === s.key;
            const t = tone[s.tone];
            return (
              <button key={s.key} onClick={()=>setSelected(s)}
                className={`text-left rounded-xl border p-3 transition
                  ${active ? "border-blue-400 shadow-md bg-blue-50/40" : "border-slate-200 bg-white hover:shadow"}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`h-8 w-8 rounded-lg ${t.bg} ${t.text} flex items-center justify-center`}>
                    <s.icon size={14}/>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-xs leading-tight">{s.name}</div>
                    <div className="text-[9px] text-slate-500">{s.recommendation}</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-600 line-clamp-2 min-h-[26px]">{s.useCase}</div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                  <div className="rounded bg-slate-50 px-1.5 py-1">
                    <div className="text-slate-500">Cost</div>
                    <div className="font-semibold text-slate-800">${s.monthlyCost}</div>
                  </div>
                  <div className="rounded bg-slate-50 px-1.5 py-1">
                    <div className="text-slate-500">Score</div>
                    <div className={`font-semibold ${t.text}`}>{scored.find(x=>x.key===s.key)!.score}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Engineering Drawer */}
      <Sheet open={drawer.open} onOpenChange={(o)=>setDrawer({ ...drawer, open: o })}>
        <SheetContent side="right" className="w-[520px] sm:max-w-[560px] p-0 overflow-y-auto">
          <SheetHeader className="p-5 border-b border-slate-100">
            <SheetTitle className="text-base">{drawer.title}</SheetTitle>
            <div className="text-xs text-slate-500">Engineering transparency for {drawer.title.toLowerCase()}</div>
          </SheetHeader>
          <div className="p-5">
            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="engineering">Engineering</TabsTrigger>
                <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
                <TabsTrigger value="simulation">Simulation</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-3 text-sm">
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs font-semibold text-slate-500 mb-1">Business Explanation</div>
                  <div className="text-slate-700">
                    {selected.description} Best fit for {selected.useCase.toLowerCase()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="text-xs font-semibold text-emerald-600 mb-1">Advantages</div>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {selected.advantages.map(a => <li key={a}>• {a}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="text-xs font-semibold text-amber-600 mb-1">Tradeoffs</div>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {selected.tradeoffs.map(a => <li key={a}>• {a}</li>)}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="engineering" className="mt-4 text-sm space-y-2">
                {[
                  { i: Gauge,      l: "Weighted Scoring — 8-axis composite score" },
                  { i: ShieldCheck,l: "Policy Rules — governance & retention guardrails" },
                  { i: Workflow,   l: "Optimization Engine — reevaluates every 24h" },
                  { i: DollarSign, l: "Cost Model — $/GB storage + $/scan + egress" },
                  { i: Timer,      l: "Latency Calculator — p50/p95/p99 windows" },
                  { i: Clock,      l: "Freshness Engine — SLA vs measured lag" },
                  { i: Archive,    l: "Storage Planner — hot/warm/cold tiering" },
                  { i: Share2,     l: "Relationship Analyzer — join density model" },
                  { i: Cpu,        l: "AI Readiness Calculator — vector/graph fit" },
                  { i: GitBranch,  l: "Continuous Learning — feedback loop" },
                ].map(x => (
                  <div key={x.l} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5">
                    <x.i size={14} className="text-blue-600"/>
                    <span className="text-xs text-slate-700">{x.l}</span>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="telemetry" className="mt-4 grid grid-cols-3 gap-2 text-xs">
                {[
                  ["Eval Duration","142ms"],["Storage Util","62%"],["Bandwidth","318 Mbps"],
                  ["Rows/sec","24,182"],["Latency p95","18ms"],["Cache Hit","91%"],
                  ["CPU","38%"],["Memory","4.2 GB"],["Confidence",`${selected.confidence}%`],
                ].map(([l,v]) => (
                  <div key={l} className="rounded-lg border border-slate-200 p-2.5">
                    <div className="text-[10px] text-slate-500">{l}</div>
                    <div className="font-bold text-slate-900">{v}</div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="simulation" className="mt-4 text-sm space-y-3">
                <div className="text-xs text-slate-600">Drag sliders to simulate. Recommendation updates instantly.</div>
                {[
                  { k: "Volume (TB/day)",   v: 1.1 },
                  { k: "Latency SLA (ms)",  v: 50 },
                  { k: "Freshness SLA (s)", v: 30 },
                  { k: "Budget ($/mo)",     v: 800 },
                  { k: "Relationship Density", v: 40 },
                  { k: "AI Usage",          v: 60 },
                ].map(s => (
                  <div key={s.k}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-600">{s.k}</span>
                      <span className="font-semibold text-slate-800">{s.v}</span>
                    </div>
                    <input type="range" defaultValue={s.v} className="w-full accent-blue-600"/>
                  </div>
                ))}
                <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-3">
                  <div className="text-xs font-semibold text-blue-800">
                    → Recommendation: {topPick.name}
                  </div>
                  <div className="text-[11px] text-blue-700 mt-0.5">
                    Score {topPick.score} · Cost ${topPick.monthlyCost}/mo · Confidence {topPick.confidence}%
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dependencies" className="mt-4 text-xs space-y-2">
                {[
                  ["Source systems","Splunk, PANW NGFW, CloudWatch"],
                  ["Storage","BigQuery, S3-Glacier, Iceberg"],
                  ["Consumers","XSIAM, SRE Dashboards, Fraud AI"],
                  ["Graph","Neo4j impact graph"],
                  ["SQL","Trino federation"],
                  ["Vector","pgvector store"],
                  ["Hydration","Flink jobs · 14 pipelines"],
                  ["Monitoring","DataDog + custom SLO"],
                  ["Owners","Platform SRE · FinOps"],
                  ["Risk","Duplication drift · schema drift"],
                  ["Compliance","SOC2, GDPR, HIPAA aware"],
                ].map(([l,v]) => (
                  <div key={l} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5">
                    <span className="text-slate-500">{l}</span>
                    <span className="font-medium text-slate-800">{v}</span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <style>{`
        @keyframes flow {
          0%   { transform: translateX(0);   opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
