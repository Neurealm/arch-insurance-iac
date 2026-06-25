import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, Factory, HelpCircle, LayoutGrid, Network, MapPin, ChevronDown,
  Wrench, Sparkles, Gavel, Brain, Gauge, Lightbulb, GitBranch, Share2, Scale,
  Target as TargetIcon, BookOpen, Users, UserCheck, FlaskConical, MessageSquare,
  Cpu, Radio, Database, Layers, ShieldCheck, Workflow, ArrowRight,
  Activity, Zap, Cloud, GitMerge, Search, Download, Maximize2, Play, Pause,
  CheckCircle2, AlertTriangle, BarChart3, Lock, FileText, Wind, Thermometer,
  Server, Antenna, X,
} from "lucide-react";

/* ============================= atoms ============================= */
function GlassCard({ children, className = "" }: any) {
  return (
    <div className={
      "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl " +
      "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-30px_rgba(0,0,0,0.6)] " + className
    }>{children}</div>
  );
}

function Pill({ children, tone = "slate" }: any) {
  const map: any = {
    slate: "bg-white/[0.04] text-slate-300 border-white/[0.08]",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-400/25",
    sky: "bg-sky-500/10 text-sky-300 border-sky-400/25",
    amber: "bg-amber-500/10 text-amber-200 border-amber-400/25",
    violet: "bg-violet-500/10 text-violet-300 border-violet-400/25",
    rose: "bg-rose-500/10 text-rose-200 border-rose-400/25",
    indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-400/25",
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10.5px] font-medium ${map[tone]}`}>{children}</span>;
}

/* ============================= rail ============================= */
const RAIL = [
  { icon: LayoutGrid, label: "Command\nCenter", to: "/sead/command-center" },
  { icon: Boxes, label: "Digital Twin", to: "/sead/equipment-health-intelligence" },
  { icon: Network, label: "Cross-Domain", to: "/sead/cross-domain-context-twin" },
  { icon: Wrench, label: "Decision\nSim", to: "/sead/maintenance-decision-simulator" },
  { icon: Scale, label: "Simulation\nComparison", to: "/sead/simulation-comparison" },
  { icon: Factory, label: "Factory\nImpact", to: "/sead/factory-impact-simulator" },
  { icon: Sparkles, label: "Decision\nCenter", to: "/sead/ai-maintenance-decision-center" },
  { icon: Gavel, label: "Human\nGovernance", to: "/sead/human-governance-center" },
  { icon: Brain, label: "AI Reasoning", to: "/sead/ai-reasoning-playback" },
  { icon: Gauge, label: "Confidence\nExplorer", to: "/sead/confidence-explorer" },
  { icon: Lightbulb, label: "Explainability", to: "/sead/explainability" },
  { icon: GitBranch, label: "What If", to: "/sead/what-if" },
  { icon: Share2, label: "Knowledge\nGraph", to: "/sead/knowledge-graph" },
  { icon: BookOpen, label: "Operational\nLearning", to: "/sead/operational-learning" },
  { icon: TargetIcon, label: "Outcome\nTracker", to: "/sead/outcome-tracker" },
  { icon: Users, label: "Multi-Agent\nCollaboration", to: "/sead/multi-agent-collaboration" },
  { icon: UserCheck, label: "Human-\nin-the-Loop", to: "/sead/human-in-the-loop" },
  { icon: FlaskConical, label: "Engineering\nSandbox", to: "/sead/engineering-sandbox" },
  { icon: MessageSquare, label: "Digital Coworker\nConversation", to: "/sead/digital-coworker-conversation" },
  { icon: Layers, label: "IoT→AI\nArchitecture", to: "/sead/iot-ai-architecture", active: true },
];

function ModuleRail() {
  const nav = useNavigate();
  return (
    <aside className="w-[84px] shrink-0 border-r border-white/[0.06] bg-white/[0.015] py-3 flex flex-col items-center gap-0.5 overflow-y-auto">
      {RAIL.map((r: any) => (
        <button key={r.label} onClick={() => r.to && nav(r.to)}
          className={`group relative w-[72px] py-2.5 rounded-lg flex flex-col items-center gap-1 transition ${
            r.active
              ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30 shadow-[0_0_24px_-12px_rgba(56,189,248,0.8)]"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}>
          <r.icon className="h-[18px] w-[18px]" />
          <span className="text-[9.5px] leading-tight text-center px-1 whitespace-pre-line">{r.label}</span>
          {r.active && (
            <motion.span layoutId="rail-iotai-indicator"
              className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
          )}
        </button>
      ))}
    </aside>
  );
}

/* ============================= header ============================= */
function AppHeader() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <header className="flex items-center gap-4 px-6 h-[72px] border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 grid place-items-center shadow-[0_0_28px_-6px_rgba(244,63,94,0.7)] font-black text-white text-[15px] tracking-tight">
          TI
        </div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Texas Instruments</div>
          <div className="text-[16px] font-semibold text-white tracking-tight">Industrial IoT → AI Maintenance Decision Architecture</div>
          <div className="text-[11px] text-slate-400">From machine telemetry to governed, explainable decisions — DFW Semiconductor Fab</div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="hidden lg:flex items-center gap-2">
        <Pill tone="emerald"><CheckCircle2 className="h-3 w-3" /> Pipeline Healthy</Pill>
        <Pill tone="sky"><Activity className="h-3 w-3" /> 14.2K events/s</Pill>
        <Pill tone="violet"><Brain className="h-3 w-3" /> 9 AI Agents</Pill>
      </div>

      <button
        className="group relative w-[240px] h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] pl-9 pr-12 text-left text-[12px] text-slate-400 hover:border-sky-400/40 hover:bg-white/[0.05] transition"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        Search layers, components…
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 h-5 px-1.5 grid place-items-center rounded text-[10px] text-slate-400 bg-white/[0.05] border border-white/[0.08]">⌘K</kbd>
      </button>

      <button className="h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-[12px] text-slate-200 hover:bg-white/[0.06]">
        <Factory className="h-4 w-4 text-sky-400" />
        <div className="text-left leading-tight">
          <div className="font-medium">DFW Semiconductor Fab</div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5" /> Richardson, Texas
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      <div className="text-right leading-tight">
        <div className="text-[12px] text-slate-200 tabular-nums">{date} • {time} CT</div>
        <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="relative rounded-full bg-emerald-400 h-1.5 w-1.5" />
          </span>
          Live
        </div>
      </div>

      <button className="relative h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.06]">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold grid place-items-center">3</span>
      </button>
      <button className="h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.06]">
        <HelpCircle className="h-4 w-4" />
      </button>
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center text-[11px] font-bold text-white">AO</div>
    </header>
  );
}

/* ============================= layers data ============================= */
type Layer = {
  id: string; n: number; tone: string; ring: string; dot: string;
  title: string; subtitle: string; icon: any;
  components: { icon: any; label: string; meta?: string }[];
  metrics: { label: string; value: string; trend?: string }[];
  description: string;
};

const LAYERS: Layer[] = [
  {
    id: "factory", n: 1, tone: "rose", ring: "ring-rose-400/30", dot: "bg-rose-500",
    title: "Factory Equipment Layer", subtitle: "Industrial tools generate telemetry and events",
    icon: Factory,
    components: [
      { icon: Cpu, label: "ETCH-217 Metal Etch", meta: "AMAT Centura" },
      { icon: Wind, label: "Pressure / Vacuum", meta: "12 sensors" },
      { icon: Radio, label: "RF Power", meta: "kW signal" },
      { icon: Activity, label: "Vibration", meta: "MEMS triax" },
      { icon: Thermometer, label: "Temperature", meta: "8 zones" },
      { icon: AlertTriangle, label: "Alarms / Tool State", meta: "SECS" },
    ],
    metrics: [
      { label: "Tools", value: "486", trend: "+12 this Q" },
      { label: "Tags / sec", value: "14.2K", trend: "stable" },
      { label: "Active Alarms", value: "7", trend: "↓ 2" },
    ],
    description: "Process tools emit pressure, RF power, vibration, vacuum, gas flow, valve cycles, particle count, alarms, and tool-state events at high frequency. NeuGAIN captures raw signal without instrumenting the floor.",
  },
  {
    id: "edge", n: 2, tone: "amber", ring: "ring-amber-400/30", dot: "bg-amber-500",
    title: "Edge Collection Layer", subtitle: "Secure collection, protocol translation, and edge processing",
    icon: Antenna,
    components: [
      { icon: Server, label: "OPC UA · MQTT", meta: "industrial bus" },
      { icon: Server, label: "SECS / GEM", meta: "tool protocol" },
      { icon: Server, label: "PLC / DCS · SCADA", meta: "control" },
      { icon: Database, label: "Historian", meta: "OSI PI / IP21" },
      { icon: Server, label: "Edge Gateway", meta: "filter · normalize" },
      { icon: Lock, label: "TLS / mTLS · VPN", meta: "private link" },
    ],
    metrics: [
      { label: "Gateways", value: "42", trend: "100% online" },
      { label: "Buffer Util", value: "23%", trend: "healthy" },
      { label: "Drop Rate", value: "0.002%", trend: "SLA met" },
    ],
    description: "Edge gateways translate proprietary protocols, validate and buffer telemetry, normalize units, and stream over mTLS to cloud. Store-and-forward guarantees zero data loss on link interruption.",
  },
  {
    id: "cloud", n: 3, tone: "sky", ring: "ring-sky-400/30", dot: "bg-sky-500",
    title: "Cloud / Data Platform Layer", subtitle: "Scalable ingestion, storage, and data management",
    icon: Cloud,
    components: [
      { icon: Zap, label: "Streaming Ingestion", meta: "IoT Core · Kinesis" },
      { icon: Database, label: "Time-Series Store", meta: "Timestream" },
      { icon: Database, label: "Data Lake", meta: "S3 / Parquet" },
      { icon: Workflow, label: "Event Bus", meta: "EventBridge" },
      { icon: FileText, label: "Metadata Catalog", meta: "Glue" },
      { icon: BarChart3, label: "Curated Domains", meta: "6 domains" },
    ],
    metrics: [
      { label: "Lake Volume", value: "182 TB", trend: "+4.2 TB/wk" },
      { label: "Ingest Lag", value: "1.4 s", trend: "p95" },
      { label: "Domains", value: "6 / 6", trend: "current" },
    ],
    description: "AWS-native pipeline ingests, stores, and curates telemetry alongside events, maintenance history, production context, hierarchy, and master data — feeding a SageMaker feature store and model registry.",
  },
  {
    id: "twin", n: 4, tone: "indigo", ring: "ring-indigo-400/30", dot: "bg-indigo-500",
    title: "Digital Twin / Context Layer", subtitle: "IoT data enriched with models, context, and external signals",
    icon: Boxes,
    components: [
      { icon: Cpu, label: "Equipment Model", meta: "asset graph" },
      { icon: Activity, label: "Sensor Model", meta: "calibration" },
      { icon: Wrench, label: "Maintenance Model", meta: "PM / CM" },
      { icon: GitMerge, label: "Lot & Route (MES)", meta: "context" },
      { icon: Users, label: "Technician Avail.", meta: "skills" },
      { icon: Cloud, label: "External Signals", meta: "weather · grid" },
    ],
    metrics: [
      { label: "Twin Assets", value: "486", trend: "100% mapped" },
      { label: "Context Joins", value: "11", trend: "live" },
      { label: "External Feeds", value: "5", trend: "healthy" },
    ],
    description: "Raw signal is enriched with equipment hierarchy, sensor calibration, lot/route MES context, technician availability, utility constraints, business priorities, engineering rules, and external feeds.",
  },
  {
    id: "ai", n: 5, tone: "violet", ring: "ring-violet-400/30", dot: "bg-violet-500",
    title: "AI Reasoning Layer", subtitle: "Analytics turn data and context into insights and options",
    icon: Brain,
    components: [
      { icon: Activity, label: "Anomaly Detection", meta: "9 models" },
      { icon: Gauge, label: "RUL Estimation", meta: "survival" },
      { icon: GitBranch, label: "Pattern Matching", meta: "embedding" },
      { icon: Share2, label: "Causal Analysis", meta: "DoWhy" },
      { icon: Workflow, label: "Simulation Engine", meta: "scenario" },
      { icon: Lightbulb, label: "Explanation + Multi-Agent", meta: "SHAP · ensemble" },
    ],
    metrics: [
      { label: "Models", value: "27", trend: "auto-retrain" },
      { label: "Avg Confidence", value: "89%", trend: "+3 pts" },
      { label: "Recs / day", value: "142", trend: "live" },
    ],
    description: "Anomaly detection, RUL, pattern matching, causal analysis, simulation, scenario & confidence scoring, explanation generators and multi-agent collaboration — all grounded by the Knowledge Graph.",
  },
  {
    id: "action", n: 6, tone: "emerald", ring: "ring-emerald-400/30", dot: "bg-emerald-500",
    title: "Action & Governance Layer", subtitle: "Human-in-the-loop decisions, execution, and continuous learning",
    icon: Gavel,
    components: [
      { icon: TargetIcon, label: "Recommended Window", meta: "best slot" },
      { icon: UserCheck, label: "Human Approval (HITL)", meta: "review" },
      { icon: Wrench, label: "CMMS / EAM Work Order", meta: "Maximo" },
      { icon: Workflow, label: "MES / Dispatch", meta: "schedule" },
      { icon: FileText, label: "Evidence Package", meta: "audit" },
      { icon: ShieldCheck, label: "Audit & Governance", meta: "immutable" },
    ],
    metrics: [
      { label: "Open WO", value: "23", trend: "in flight" },
      { label: "HITL SLA", value: "94%", trend: "on time" },
      { label: "Auto-Learn", value: "ON", trend: "loop closed" },
    ],
    description: "Governed handoff: recommended window → human approval → CMMS work order → MES dispatch → immutable evidence package. Outcomes feed back through the learning loop to improve future recommendations.",
  },
];

const OUTCOMES = [
  { icon: CheckCircle2, label: "High Equipment Availability", tone: "emerald" },
  { icon: Activity, label: "Lower Unplanned Downtime", tone: "emerald" },
  { icon: BarChart3, label: "Optimized Maintenance Cost", tone: "emerald" },
  { icon: Sparkles, label: "Improved Yield & Quality", tone: "emerald" },
  { icon: ShieldCheck, label: "Risk & Compliance Mgmt", tone: "emerald" },
  { icon: Lightbulb, label: "Sustainable Operations", tone: "emerald" },
];
const GOVERNANCE = [
  { icon: Lock, label: "End-to-end Encryption" },
  { icon: Users, label: "Role-based Access Control" },
  { icon: Share2, label: "Data Lineage & Traceability" },
  { icon: ShieldCheck, label: "Policy & Compliance (ISO 27001, SOC 2)" },
  { icon: FileText, label: "Audit & Immutable Logs" },
];

/* ============================= layer card ============================= */
function LayerCard({ layer, index, active, onClick, flowing }: any) {
  const toneMap: any = {
    rose: "from-rose-500/15 to-rose-500/0 text-rose-300",
    amber: "from-amber-500/15 to-amber-500/0 text-amber-200",
    sky: "from-sky-500/15 to-sky-500/0 text-sky-300",
    indigo: "from-indigo-500/15 to-indigo-500/0 text-indigo-300",
    violet: "from-violet-500/15 to-violet-500/0 text-violet-300",
    emerald: "from-emerald-500/15 to-emerald-500/0 text-emerald-300",
  };
  const Icon = layer.icon;
  return (
    <motion.button
      layout
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`text-left relative w-full rounded-2xl border bg-white/[0.02] backdrop-blur-xl overflow-hidden transition ${
        active ? `border-white/15 ring-1 ${layer.ring} shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)]` : "border-white/[0.06] hover:border-white/10"
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${toneMap[layer.tone]}`} />
      <div className="grid grid-cols-12 gap-0">
        {/* index column */}
        <div className="col-span-2 md:col-span-1 px-3 py-4 border-r border-white/[0.05] flex flex-col items-center justify-center gap-2">
          <div className={`h-9 w-9 rounded-full grid place-items-center ${layer.dot} text-white font-bold text-[13px] shadow-[0_0_18px_-6px_rgba(255,255,255,0.5)]`}>{layer.n}</div>
          <div className={`text-[10px] uppercase tracking-wider ${toneMap[layer.tone].split(" ").pop()}`}>Layer</div>
        </div>
        {/* title */}
        <div className="col-span-10 md:col-span-3 px-4 py-4 border-r border-white/[0.05]">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${toneMap[layer.tone].split(" ").pop()}`} />
            <div className="text-[13px] font-semibold text-white tracking-tight">{layer.title}</div>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 leading-snug">{layer.subtitle}</div>
          <div className="mt-3 flex flex-wrap gap-1">
            {layer.metrics.map((m: any) => (
              <Pill key={m.label} tone={layer.tone}>{m.label}: <b className="ml-1 text-white/90">{m.value}</b></Pill>
            ))}
          </div>
        </div>
        {/* components grid */}
        <div className="col-span-12 md:col-span-8 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {layer.components.map((c: any, i: number) => {
              const CIcon = c.icon;
              return (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="relative rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-2 hover:bg-white/[0.05] transition"
                >
                  <div className="flex items-center gap-1.5">
                    <CIcon className="h-3.5 w-3.5 text-slate-300" />
                    <div className="text-[11px] text-white font-medium truncate">{c.label}</div>
                  </div>
                  {c.meta && <div className="text-[9.5px] text-slate-500 mt-0.5 truncate">{c.meta}</div>}
                  {flowing && (
                    <motion.span
                      className={`absolute -bottom-px left-2 right-2 h-px ${layer.dot} opacity-60`}
                      animate={{ scaleX: [0, 1, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.18 }}
                      style={{ transformOrigin: "left" }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      {/* down arrow */}
      {layer.n < 6 && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            animate={flowing ? { y: [0, 4, 0], opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="h-6 w-6 rounded-full bg-slate-900 border border-white/10 grid place-items-center shadow-[0_0_18px_-6px_rgba(56,189,248,0.6)]"
          >
            <ArrowRight className="h-3 w-3 text-sky-300 rotate-90" />
          </motion.div>
        </div>
      )}
    </motion.button>
  );
}

/* ============================= Command Palette ============================= */
function CommandPalette({ open, onClose, onJump }: { open: boolean; onClose: () => void; onJump: (id: string) => void }) {
  const [q, setQ] = useState("");
  useEffect(() => { if (open) setQ(""); }, [open]);
  const items = useMemo(() => {
    const rows: { kind: string; name: string; layerId: string }[] = [];
    LAYERS.forEach(l => {
      rows.push({ kind: "Layer", name: `${l.n}. ${l.title}`, layerId: l.id });
      l.components.forEach(c => rows.push({ kind: l.title.split(" ")[0], name: c.label, layerId: l.id }));
    });
    const s = q.trim().toLowerCase();
    return (s ? rows.filter(r => r.name.toLowerCase().includes(s) || r.kind.toLowerCase().includes(s)) : rows).slice(0, 12);
  }, [q]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-[14vh] px-4" onClick={onClose}>
          <motion.div initial={{ y: -10, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.18 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[640px] rounded-2xl border border-white/10 bg-black/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="flex items-center gap-3 px-4 h-12 border-b border-white/[0.06]">
              <Search className="h-4 w-4 text-slate-400" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Escape" && onClose()}
                placeholder="Search layers, components, models, gateways…"
                className="flex-1 bg-transparent text-[13px] text-slate-100 placeholder:text-slate-500 outline-none" />
              <kbd className="text-[10px] px-1.5 h-5 grid place-items-center rounded bg-white/[0.06] border border-white/[0.08] text-slate-400">ESC</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {items.length === 0 ? <div className="px-4 py-6 text-center text-[12px] text-slate-500">No matches.</div> :
                items.map((r, i) => (
                  <button key={i} onClick={() => { onJump(r.layerId); onClose(); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-white/[0.05] transition">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 w-14 truncate">{r.kind}</span>
                    <span className="text-[13px] text-slate-100 flex-1 truncate">{r.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================= page ============================= */
export default function IotAiArchitecture() {
  const [active, setActive] = useState<string>("ai");
  const [flowing, setFlowing] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState(14237);
  const [decisions, setDecisions] = useState(142);
  const activeLayer = useMemo(() => LAYERS.find(l => l.id === active)!, [active]);

  // live counters
  useEffect(() => {
    if (!flowing) return;
    const t = setInterval(() => {
      setEvents(e => e + Math.floor(Math.random() * 80 + 20));
      if (Math.random() > 0.7) setDecisions(d => d + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [flowing]);

  // jump to layer + scroll into view
  const jumpTo = (id: string) => {
    setActive(id);
    setTimeout(() => document.getElementById(`layer-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 30);
  };

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(true); return; }
      if (typing) return;
      if (e.key === "p" || e.key === "P") { setFlowing(v => !v); }
      if (e.key === "f" || e.key === "F") { setFocusMode(v => !v); }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 6) { const l = LAYERS[n - 1]; if (l) jumpTo(l.id); }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const idx = LAYERS.findIndex(l => l.id === active);
        const next = e.key === "ArrowDown" ? Math.min(LAYERS.length - 1, idx + 1) : Math.max(0, idx - 1);
        jumpTo(LAYERS[next].id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active]);

  const filteredLayers = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return LAYERS.map(l => ({ layer: l, hit: false }));
    return LAYERS.map(l => {
      const hit = l.title.toLowerCase().includes(s) || l.subtitle.toLowerCase().includes(s) ||
        l.components.some(c => c.label.toLowerCase().includes(s) || (c.meta || "").toLowerCase().includes(s));
      return { layer: l, hit };
    });
  }, [query]);

  return (
    <div className="min-h-screen bg-black text-slate-200">
      {/* subtle ambient glow on pure black */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(800px_400px_at_15%_-5%,rgba(56,189,248,0.07),transparent_60%),radial-gradient(700px_400px_at_110%_5%,rgba(244,63,94,0.05),transparent_60%)]" />
      <div className="relative z-10 flex">
        <ModuleRail />
        <div className="flex-1 min-w-0">
          <AppHeader />

          {/* pipeline ribbon mini-nav */}
          <div className="px-6 pt-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-2 flex items-center gap-1.5 overflow-x-auto">
              {LAYERS.map((l, i) => {
                const isActive = active === l.id;
                return (
                  <div key={l.id} className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => jumpTo(l.id)}
                      className={`group flex items-center gap-2 px-2.5 h-9 rounded-lg border text-[11.5px] transition ${
                        isActive ? `${l.dot} text-white border-white/20 shadow-[0_0_18px_-6px_rgba(255,255,255,0.5)]`
                          : "bg-white/[0.02] text-slate-300 border-white/[0.06] hover:bg-white/[0.06]"
                      }`}>
                      <span className={`h-5 w-5 rounded-md grid place-items-center text-[10px] font-bold ${isActive ? "bg-white/20" : l.dot + " text-white"}`}>{l.n}</span>
                      <span className="font-medium truncate max-w-[140px]">{l.title.replace(" Layer", "")}</span>
                      <kbd className={`text-[9px] px-1 rounded ${isActive ? "bg-white/20 text-white" : "bg-white/[0.05] text-slate-500 border border-white/[0.08]"}`}>{l.n}</kbd>
                    </button>
                    {i < LAYERS.length - 1 && (
                      <motion.span animate={flowing ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.4 }}
                        transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
                        className="text-slate-600 text-[14px]">›</motion.span>
                    )}
                  </div>
                );
              })}
              <div className="flex-1" />
              <button onClick={() => setFocusMode(v => !v)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 h-9 rounded-lg border text-[11px] transition ${
                  focusMode ? "bg-sky-500/15 text-sky-200 border-sky-400/30" : "bg-white/[0.02] text-slate-300 border-white/[0.06] hover:bg-white/[0.06]"
                }`}>
                <Maximize2 className="h-3.5 w-3.5" /> Focus
                <kbd className="text-[9px] px-1 rounded bg-white/[0.06] text-slate-400">F</kbd>
              </button>
              <button onClick={() => setFlowing(v => !v)}
                className="shrink-0 inline-flex items-center gap-1.5 px-2.5 h-9 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-300 hover:bg-white/[0.06]">
                {flowing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {flowing ? "Pause" : "Play"}
                <kbd className="text-[9px] px-1 rounded bg-white/[0.06] text-slate-400">P</kbd>
              </button>
            </div>
          </div>

          {/* hero strip */}
          <div className="px-6 pt-4">
            <div className="grid grid-cols-12 gap-4">
              <GlassCard className="col-span-12 lg:col-span-8 p-5">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-white/10 grid place-items-center">
                    <Layers className="h-5 w-5 text-sky-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Key Message</div>
                    <div className="mt-1 text-[15px] text-white leading-snug">
                      NeuGAIN does not just collect IoT data. It converts machine telemetry into a <span className="text-emerald-300 font-semibold">governed, explainable maintenance decision</span> by combining sensor health, production context, utility constraints, engineering rules, and business priorities.
                    </div>
                    {/* layer search */}
                    <div className="mt-3 relative max-w-[420px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <input value={query} onChange={e => setQuery(e.target.value)}
                        placeholder="Filter layers & components…"
                        className="w-full h-9 pl-9 pr-9 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[12px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400/40" />
                      {query && (
                        <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 grid place-items-center rounded text-slate-400 hover:text-white hover:bg-white/[0.06]">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button onClick={() => setPaletteOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-[11.5px] text-slate-200 hover:bg-white/[0.08]">
                      <Search className="h-3.5 w-3.5" /> Quick Jump <kbd className="text-[9px] px-1 rounded bg-white/[0.06] text-slate-400">⌘K</kbd>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-[11.5px] text-slate-200 hover:bg-white/[0.08]">
                      <Download className="h-3.5 w-3.5" /> Export Blueprint
                    </button>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="col-span-12 lg:col-span-4 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Pipeline Telemetry</div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`absolute inset-0 rounded-full bg-emerald-400 ${flowing ? "animate-ping" : ""} opacity-75`} />
                      <span className="relative rounded-full bg-emerald-400 h-1.5 w-1.5" />
                    </span>
                    {flowing ? "Streaming" : "Paused"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { k: "Events", v: events.toLocaleString(), l: "ingested today" },
                    { k: "Decisions", v: String(decisions), l: "rec'd today" },
                    { k: "Auto-Appr", v: "61%", l: "HITL skipped" },
                  ].map(s => (
                    <div key={s.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                      <div className="text-[9.5px] uppercase tracking-wider text-slate-400">{s.k}</div>
                      <div className="text-[18px] font-semibold text-white tracking-tight tabular-nums">{s.v}</div>
                      <div className="text-[10px] text-slate-500">{s.l}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* layers + side rails */}
          <div className="px-6 py-5 grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-9 space-y-5">
              {filteredLayers.map(({ layer: l, hit }, i) => {
                const dimmed = focusMode && active !== l.id;
                const queryHit = query.trim() && hit;
                return (
                  <div key={l.id} id={`layer-${l.id}`} className={`transition-all duration-300 ${dimmed ? "opacity-30 scale-[0.99]" : "opacity-100"} ${queryHit ? "ring-2 ring-sky-400/40 rounded-2xl" : ""}`}>
                    <LayerCard
                      layer={l}
                      index={i}
                      active={active === l.id}
                      flowing={flowing && (active === l.id || !focusMode)}
                      onClick={() => setActive(l.id)}
                    />
                  </div>
                );
              })}

              {/* feedback loop */}
              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-amber-500/15 border border-amber-400/25 grid place-items-center">
                    <motion.div animate={flowing ? { rotate: 360 } : {}} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                      <GitMerge className="h-4 w-4 text-amber-300" />
                    </motion.div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[12.5px] font-semibold text-white">Feedback & Learning Loop</div>
                    <div className="text-[11px] text-slate-400">Execution outcomes, actual results, and operator feedback improve models and recommendations.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone="amber">Data Flow →</Pill>
                    <Pill tone="amber">Feedback Loop ⇠</Pill>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* side rails */}
            <div className="col-span-12 xl:col-span-3 space-y-4">
              <GlassCard className="p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/90 font-semibold">Outcomes & Value</div>
                <div className="mt-3 space-y-2">
                  {OUTCOMES.map(o => {
                    const I = o.icon;
                    return (
                      <div key={o.label} className="flex items-center gap-2.5 rounded-lg border border-emerald-400/15 bg-emerald-500/[0.04] px-2.5 py-2">
                        <I className="h-4 w-4 text-emerald-300" />
                        <div className="text-[11.5px] text-slate-100">{o.label}</div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-sky-300/90 font-semibold">Security & Governance</div>
                <div className="mt-3 space-y-2">
                  {GOVERNANCE.map(g => {
                    const I = g.icon;
                    return (
                      <div key={g.label} className="flex items-center gap-2.5 rounded-lg border border-sky-400/15 bg-sky-500/[0.04] px-2.5 py-2">
                        <I className="h-4 w-4 text-sky-300" />
                        <div className="text-[11.5px] text-slate-100">{g.label}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.025] p-2.5 flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-slate-300" />
                  <div className="text-[11px] text-slate-300">Built on AWS · Secure · Scalable · Well-Architected</div>
                </div>
              </GlassCard>

              {/* selected layer drawer */}
              <AnimatePresence mode="wait">
                <motion.div key={activeLayer.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-md grid place-items-center ${activeLayer.dot} text-white text-[11px] font-bold`}>{activeLayer.n}</div>
                      <div className="text-[12.5px] font-semibold text-white">{activeLayer.title}</div>
                    </div>
                    <p className="mt-2 text-[11.5px] text-slate-300 leading-snug">{activeLayer.description}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {activeLayer.metrics.map((m: any) => (
                        <div key={m.label} className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
                          <div className="text-[9.5px] uppercase tracking-wider text-slate-400 truncate">{m.label}</div>
                          <div className="text-[13px] font-semibold text-white">{m.value}</div>
                          {m.trend && <div className="text-[9.5px] text-slate-500">{m.trend}</div>}
                        </div>
                      ))}
                    </div>
                    <button className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.04] text-[11.5px] text-white hover:bg-white/[0.08]">
                      <Maximize2 className="h-3.5 w-3.5" /> Open Layer Runbook
                    </button>
                  </GlassCard>
                </motion.div>
              </AnimatePresence>

              {/* keyboard hints */}
              <GlassCard className="p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Keyboard</div>
                <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-300">
                  <div className="flex items-center justify-between"><span>Quick jump</span><kbd className="px-1 rounded bg-white/[0.06] border border-white/[0.08] text-slate-400">⌘K</kbd></div>
                  <div className="flex items-center justify-between"><span>Pause flow</span><kbd className="px-1 rounded bg-white/[0.06] border border-white/[0.08] text-slate-400">P</kbd></div>
                  <div className="flex items-center justify-between"><span>Focus mode</span><kbd className="px-1 rounded bg-white/[0.06] border border-white/[0.08] text-slate-400">F</kbd></div>
                  <div className="flex items-center justify-between"><span>Layer 1–6</span><kbd className="px-1 rounded bg-white/[0.06] border border-white/[0.08] text-slate-400">1-6</kbd></div>
                  <div className="flex items-center justify-between col-span-2"><span>Next / Previous layer</span><span className="flex gap-0.5"><kbd className="px-1 rounded bg-white/[0.06] border border-white/[0.08] text-slate-400">↑</kbd><kbd className="px-1 rounded bg-white/[0.06] border border-white/[0.08] text-slate-400">↓</kbd></span></div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onJump={jumpTo} />
    </div>
  );
}
