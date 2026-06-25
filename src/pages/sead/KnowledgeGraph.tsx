import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, ChevronDown, ChevronUp, Factory, HelpCircle, LayoutGrid, Network as NetIcon,
  Wrench, Sparkles, Gavel, Brain, ArrowLeft, Gauge, Lightbulb, GitBranch, Share2,
  Search, Users, Link2, Clock, Activity, Plus, Minus, Crosshair, X, Maximize2,
  Layers, Grid3x3, ChevronRight, Package, Building2, Droplet, Wind, ClipboardList,
  TrendingUp, Settings as SettingsIcon, FileText, ArrowRight, Scale, Target as TargetIcon } from "lucide-react";
import etchImg from "@/assets/etch-chamber-3d.jpg";

/* ============================= atoms ============================= */
function GlassCard({ children, className = "" }: any) {
  return (
    <div className={
      "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl " +
      "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-30px_rgba(0,0,0,0.6)] " + className
    }>{children}</div>
  );
}

/* ============================= rail ============================= */
const RAIL = [
  { icon: LayoutGrid, label: "Command\nCenter", to: "/sead/command-center" },
  { icon: Boxes, label: "Digital Twin", to: "/sead/equipment-health-intelligence" },
  { icon: NetIcon, label: "Cross-Domain", to: "/sead/cross-domain-context-twin" },
  { icon: Wrench, label: "Decision\nSim", to: "/sead/maintenance-decision-simulator" },
  { icon: Scale, label: "Simulation\nComparison", to: "/sead/simulation-comparison" },
  { icon: Factory, label: "Factory\nImpact", to: "/sead/factory-impact-simulator" },
  { icon: Sparkles, label: "Decision\nCenter", to: "/sead/ai-maintenance-decision-center" },
  { icon: Gavel, label: "Human\nGovernance", to: "/sead/human-governance-center" },
  { icon: Brain, label: "AI Reasoning", to: "/sead/ai-reasoning-playback" },
  { icon: Gauge, label: "Confidence\nExplorer", to: "/sead/confidence-explorer" },
  { icon: Lightbulb, label: "Explainability", to: "/sead/explainability" },
  { icon: GitBranch, label: "What If", to: "/sead/what-if" },
  { icon: Share2, label: "Knowledge\nGraph", to: "/sead/knowledge-graph", active: true },
  { icon: BookOpen, label: "Operational
Learning", to: "/sead/operational-learning" },
  { icon: TargetIcon, label: "Outcome\nTracker", to: "/sead/outcome-tracker" },
];

function ModuleRail() {
  const nav = useNavigate();
  return (
    <aside className="w-[84px] shrink-0 border-r border-white/[0.06] bg-white/[0.015] py-3 flex flex-col items-center gap-0.5">
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
            <motion.span layoutId="rail-kg-indicator"
              className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
          )}
        </button>
      ))}
    </aside>
  );
}

/* ============================= header ============================= */
function AppHeader() {
  return (
    <header className="flex items-center gap-4 px-6 h-[72px] border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 grid place-items-center shadow-[0_0_28px_-6px_rgba(99,102,241,0.7)] font-black text-white text-[15px]">N</div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Neurealm</div>
          <div className="text-[16px] font-semibold text-white tracking-tight">Knowledge Graph Explorer</div>
          <div className="text-[11px] text-slate-400">Explore how people, assets, processes, and systems connect to influence this recommendation</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2">
        <Factory className="h-3.5 w-3.5 text-slate-400" />
        <div className="leading-tight">
          <div className="text-[9.5px] uppercase tracking-wider text-slate-500">Fab</div>
          <div className="text-[12.5px] font-semibold text-white">DFW Semiconductor Fab</div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
      </div>
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
        <div className="leading-tight">
          <div className="text-[12.5px] text-white font-semibold">May 23, 2025 10:24 AM CT</div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>
      <button className="relative h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:text-white">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 text-[9px] bg-sky-500 text-white rounded-full w-4 h-4 grid place-items-center">2</span>
      </button>
      <button className="h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:text-white"><HelpCircle className="h-4 w-4" /></button>
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center text-white text-[11px] font-bold">AO</div>
    </header>
  );
}

/* ============================= node ============================= */
type NodeProps = {
  x: number; y: number; w?: number; h?: number;
  color: string; icon: any; title: string; sub?: string;
  chips?: string[]; avatars?: string[];
};
function Node({ x, y, w = 180, h = 86, color, icon: Icon, title, sub, chips, avatars }: NodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
      style={{ left: x, top: y, width: w, minHeight: h }}
      className="absolute rounded-xl border backdrop-blur-md px-3 py-2 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.7)]"
    >
      <div className="absolute inset-0 rounded-xl opacity-90"
        style={{ background: `linear-gradient(135deg, ${color}22, ${color}0a)`, border: `1px solid ${color}55` }} />
      <div className="relative">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" style={{ color }} />
          <div className="text-[11.5px] font-semibold text-white leading-tight">{title}</div>
        </div>
        {sub && <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{sub}</div>}
        {chips && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {chips.map((c) => (
              <span key={c} className="text-[9.5px] px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-slate-200">{c}</span>
            ))}
          </div>
        )}
        {avatars && (
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            {avatars.map((a) => (
              <div key={a} className="flex items-center gap-1.5 text-[9.5px] text-slate-200">
                <span className="h-4 w-4 rounded-full grid place-items-center text-[7.5px] font-bold text-white"
                  style={{ background: color }}>{a.split(" ").map(s=>s[0]).join("")}</span>
                {a}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ============================= edges (svg) ============================= */
function Edge({ x1, y1, x2, y2, label, dashed = false }: any) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(148,163,184,0.45)" strokeWidth={1.2}
        strokeDasharray={dashed ? "4 3" : undefined} markerEnd="url(#arrow)" />
      {label && (
        <text x={mx} y={my - 4} fontSize="9" fill="#94a3b8" textAnchor="middle"
          style={{ letterSpacing: "0.1em" }}>{label}</text>
      )}
    </g>
  );
}

/* ============================= page ============================= */
export default function KnowledgeGraph() {
  const nav = useNavigate();
  const [open, setOpen] = useState(true);

  // canvas-relative center
  const CX = 470, CY = 250;

  return (
    <div className="min-h-screen bg-[#070912] text-slate-200 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-32 h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-3xl" />

      <AppHeader />
      <div className="flex">
        <ModuleRail />
        <main className="flex-1 p-5 space-y-5">

          {/* TOP STRIP */}
          <GlassCard className="p-5">
            <button onClick={() => nav("/sead/ai-maintenance-decision-center")}
              className="inline-flex items-center gap-1.5 text-[12px] text-sky-300 hover:text-sky-200 mb-3">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Recommendation
            </button>
            <div className="grid grid-cols-12 gap-5 items-center">
              <div className="col-span-3">
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500 mb-1">Current Focus</div>
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
                  <div className="h-14 w-16 rounded-lg overflow-hidden border border-white/[0.06] bg-black/40">
                    <img src={etchImg} alt="ETCH-217" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-bold text-white">ETCH-217</div>
                    <div className="text-[10.5px] text-slate-400">Metal Etch Chamber</div>
                    <div className="text-[10.5px] text-slate-400">Bay 2</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
              </div>
              {[
                { icon: Users, label: "Total Nodes", value: "1,246", color: "text-sky-300" },
                { icon: Link2, label: "Total Relationships", value: "3,872", color: "text-fuchsia-300" },
                { icon: Share2, label: "Connected Systems", value: "22", color: "text-emerald-300" },
                { icon: Clock, label: "Last Updated", value: "May 23, 2025 10:15 AM", color: "text-amber-300", sub: true },
                { icon: Activity, label: "Graph Health", value: "Healthy\n98%", color: "text-emerald-300", sub: true },
              ].map((m: any) => (
                <div key={m.label} className={`${m.label === "Graph Health" ? "col-span-2" : "col-span-1"} ${m.label === "Last Updated" ? "col-span-2" : ""}`}>
                  <div className="text-[10.5px] uppercase tracking-wider text-slate-500">{m.label}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <m.icon className={`h-4 w-4 ${m.color}`} />
                    <div className={`${m.sub ? "text-[12.5px]" : "text-[20px]"} font-bold text-white whitespace-pre-line leading-tight`}>{m.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* MAIN: graph + details */}
          <div className="grid grid-cols-12 gap-5">
            <GlassCard className="col-span-9 p-4 relative">
              {/* toolbar */}
              <div className="flex items-center gap-2 mb-3">
                <div className="text-[13.5px] font-semibold text-white">Knowledge Graph</div>
                <div className="ml-2 relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                  <input className="h-7 w-56 pl-7 pr-2 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-400/40"
                    placeholder="Search nodes, relationships..." />
                </div>
                <select className="h-7 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-300 px-2">
                  <option>All Node Types</option>
                </select>
                <select className="h-7 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-300 px-2">
                  <option>All Relationships</option>
                </select>
                <div className="flex-1" />
                <button className="h-7 px-3 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-300 inline-flex items-center gap-1.5"><Maximize2 className="h-3 w-3" /> Fit to View</button>
                <button className="h-7 px-3 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-300 inline-flex items-center gap-1.5"><Layers className="h-3 w-3" /> Expand 2 Levels</button>
                <button className="h-7 w-7 rounded-md bg-white/[0.04] border border-white/[0.08] grid place-items-center text-slate-300"><Grid3x3 className="h-3 w-3" /></button>
                <button className="h-7 w-7 rounded-md bg-white/[0.04] border border-white/[0.08] grid place-items-center text-slate-300"><Layers className="h-3 w-3" /></button>
                <button className="h-7 px-3 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-300 inline-flex items-center gap-1.5"><Crosshair className="h-3 w-3" /> Legend</button>
              </div>

              {/* canvas */}
              <div className="relative h-[600px] rounded-xl border border-white/[0.05] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.05),transparent_60%)] overflow-hidden">
                {/* grid */}
                <div className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
                    backgroundSize: "32px 32px",
                  }} />

                {/* edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(148,163,184,0.5)" />
                    </marker>
                  </defs>
                  <Edge x1={355} y1={120} x2={CX + 5} y2={CY - 30} label="MANUFACTURES" />
                  <Edge x1={CX + 60} y1={CY - 40} x2={CX + 60} y2={140} label="PROCESSING" />
                  <Edge x1={CX + 100} y1={CY - 20} x2={760} y2={140} label="COMMITS TO" />
                  <Edge x1={CX + 130} y1={CY + 5} x2={830} y2={CY - 20} label="CONSUMES" />
                  <Edge x1={CX + 110} y1={CY + 60} x2={830} y2={CY + 100} label="GENERATES" />
                  <Edge x1={CX + 30} y1={CY + 80} x2={CX + 30} y2={420} label="ANALYZED BY" />
                  <Edge x1={CX - 20} y1={CY + 80} x2={CX - 100} y2={420} label="RESPONSIBLE" />
                  <Edge x1={CX - 60} y1={CY - 10} x2={210} y2={CY + 10} label="GOVERNED BY" />
                </svg>

                {/* Center node */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ left: CX - 70, top: CY - 70, width: 140, height: 140 }}
                  className="absolute rounded-full grid place-items-center text-center"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 opacity-90 shadow-[0_0_60px_-10px_rgba(56,189,248,0.7)]" />
                  <div className="absolute inset-1 rounded-full ring-2 ring-sky-300/40" />
                  <div className="relative">
                    <Factory className="h-7 w-7 text-white mx-auto" />
                    <div className="text-[14px] font-bold text-white mt-1">ETCH-217</div>
                    <div className="text-[9.5px] text-sky-100">Metal Etch Chamber</div>
                    <div className="text-[9.5px] text-sky-100">Bay 2</div>
                  </div>
                </motion.div>

                {/* satellites */}
                <Node x={195} y={70} w={220} color="#f97316" icon={Package} title="4 Products" sub="Affected"
                  chips={["DRV8833", "LMX1205", "SN6505", "+1 more"]} />
                <Node x={520} y={50} w={220} color="#22c55e" icon={ClipboardList} title="12 Lots" sub="In Progress"
                  chips={["L-81921", "L-81922", "L-81923", "+9 more"]} />
                <Node x={765} y={70} w={210} color="#a855f7" icon={Building2} title="2 Customers" sub="Committed"
                  chips={["Texas Instruments", "Key Automotive OEM"]} />
                <Node x={835} y={CY - 60} w={170} color="#38bdf8" icon={Droplet} title="3 Utilities" sub="Required"
                  chips={["DI Water", "N2 Gas", "Exhaust"]} />
                <Node x={825} y={CY + 90} w={195} color="#f59e0b" icon={ClipboardList} title="1 PM Work Order" sub="Generated"
                  chips={["WO-785412", "Maint Tonight"]} />
                <Node x={75} y={CY - 30} w={210} color="#eab308" icon={SettingsIcon} title="8 Dispatch Rules" sub="Applicable"
                  chips={["PM Window", "Tool Criticality", "Queue Priority", "+5 more"]} />
                <Node x={CX - 230} y={420} w={240} color="#22d3ee" icon={Users} title="6 Engineers" sub="Domain Experts"
                  avatars={["J. Smith", "A. Patel", "M. Johnson", "+3 more"]} />
                <Node x={CX + 30} y={420} w={240} h={120} color="#10b981" icon={Brain} title="5 AI Agents" sub="Collaborating" />
                {/* agent icons within AI agent card */}
                <div className="absolute" style={{ left: CX + 40, top: 530, width: 220 }}>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {["Health","Production","Dispatch","Facilities","Business"].map((a) => (
                      <div key={a}>
                        <div className="h-6 w-6 mx-auto rounded-full bg-emerald-500/15 border border-emerald-400/30 grid place-items-center">
                          <Brain className="h-3 w-3 text-emerald-300" />
                        </div>
                        <div className="text-[8.5px] text-slate-300 mt-0.5 leading-tight">{a}<br/>Agent</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* legend */}
                <div className="absolute left-3 bottom-3 rounded-lg border border-white/[0.06] bg-black/30 backdrop-blur p-2.5 text-[10.5px] space-y-1">
                  <div className="text-slate-300 font-semibold mb-1">Relationship Types</div>
                  {[
                    { t: "Direct Relationship", s: "—" },
                    { t: "Derived Relationship", s: "– –" },
                    { t: "Inferred Relationship", s: "··" },
                    { t: "Impact Flow", s: "→" },
                  ].map((l) => (
                    <div key={l.t} className="flex items-center gap-2 text-slate-400">
                      <span className="text-slate-500 w-7 tabular-nums">{l.s}</span> {l.t}
                    </div>
                  ))}
                </div>

                {/* zoom controls */}
                <div className="absolute right-3 bottom-3 flex flex-col gap-1">
                  <button className="h-7 w-7 rounded-md bg-white/[0.04] border border-white/[0.08] grid place-items-center text-slate-300"><Plus className="h-3 w-3" /></button>
                  <button className="h-7 w-7 rounded-md bg-white/[0.04] border border-white/[0.08] grid place-items-center text-slate-300"><Minus className="h-3 w-3" /></button>
                  <button className="h-7 w-7 rounded-md bg-white/[0.04] border border-white/[0.08] grid place-items-center text-slate-300"><Crosshair className="h-3 w-3" /></button>
                </div>

                {/* minimap */}
                <div className="absolute right-12 bottom-3 w-44 h-20 rounded-md border border-white/[0.08] bg-black/40 p-1.5">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 opacity-30"
                      style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #38bdf8 2px, transparent 3px), radial-gradient(circle at 20% 30%, #f97316 1.5px, transparent 2px), radial-gradient(circle at 80% 30%, #a855f7 1.5px, transparent 2px), radial-gradient(circle at 30% 80%, #22d3ee 1.5px, transparent 2px), radial-gradient(circle at 70% 80%, #10b981 1.5px, transparent 2px)" }} />
                    <div className="absolute left-1/3 top-1/4 w-12 h-10 border border-sky-300/70 rounded-sm" />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* DETAILS DRAWER */}
            <GlassCard className="col-span-3 p-4">
              <div className="flex items-center justify-between">
                <div className="text-[13.5px] font-semibold text-white">Node Details</div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setOpen(!open)} className="h-6 w-6 rounded-md hover:bg-white/[0.05] grid place-items-center text-slate-400">
                    {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                  <button className="h-6 w-6 rounded-md hover:bg-white/[0.05] grid place-items-center text-slate-400"><X className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              {open && (
                <>
                  <div className="flex items-center gap-3 mt-3 pb-3 border-b border-white/[0.06]">
                    <div className="h-14 w-16 rounded-lg overflow-hidden border border-white/[0.06] bg-black/40">
                      <img src={etchImg} alt="ETCH-217" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-[15px] font-bold text-white">ETCH-217</div>
                        <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30">Fair</span>
                      </div>
                      <div className="text-[10.5px] text-slate-400">Metal Etch Chamber</div>
                      <div className="text-[10.5px] text-slate-400">Bay 2</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-[12px] font-semibold text-white mb-2">Key Attributes</div>
                    {[
                      ["Tool Type", "Lam TCP 9400"],
                      ["Install Date", "Jan 12, 2022"],
                      ["Criticality", "High"],
                      ["Utilization (7d)", "82%"],
                      ["Health Score", "72 / 100"],
                      ["MTBF", "18.4 days"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[11px] py-1.5 border-b border-white/[0.04] last:border-0">
                        <span className="text-slate-400">{k}</span>
                        <span className={`font-semibold ${k === "Criticality" ? "text-rose-300" : "text-white"}`}>{v}</span>
                      </div>
                    ))}
                    <button className="text-[11px] text-sky-300 hover:text-sky-200 mt-2 inline-flex items-center gap-1">View full details →</button>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <div className="text-[12px] font-semibold text-white">Connected Impact</div>
                      <span className="text-[10px] text-slate-500">(Top 5)</span>
                    </div>
                    {[
                      ["Customer Commitments", "High", "text-emerald-300"],
                      ["Lots at Risk", "High", "text-emerald-300"],
                      ["Production Throughput", "Medium", "text-amber-300"],
                      ["Utility Capacity", "Medium", "text-amber-300"],
                      ["Maintenance Backlog", "Low", "text-slate-300"],
                    ].map(([k, v, c]) => (
                      <div key={k} className="flex items-center justify-between text-[11px] py-1.5 border-b border-white/[0.04] last:border-0">
                        <span className="text-slate-400">{k}</span>
                        <span className={`font-semibold ${c}`}>{v}</span>
                      </div>
                    ))}
                    <button className="text-[11px] text-sky-300 hover:text-sky-200 mt-2 inline-flex items-center gap-1">View all impacts →</button>
                  </div>

                  <div className="mt-4">
                    <div className="text-[12px] font-semibold text-white mb-2">Explore From Here</div>
                    {[
                      { icon: ArrowLeft, t: "Show Upstream", sub: "What impacts this" },
                      { icon: ArrowRight, t: "Show Downstream", sub: "What this impacts" },
                      { icon: Search, t: "Find Similar Assets" },
                      { icon: TrendingUp, t: "Run Impact Analysis" },
                    ].map((r) => (
                      <button key={r.t} className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/[0.04] text-left transition">
                        <r.icon className="h-3.5 w-3.5 text-sky-300" />
                        <div className="flex-1">
                          <div className="text-[11.5px] text-white">{r.t}</div>
                          {r.sub && <div className="text-[10px] text-slate-500">({r.sub})</div>}
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </GlassCard>
          </div>

          {/* BOTTOM */}
          <div className="grid grid-cols-12 gap-5">
            <GlassCard className="col-span-4 p-5">
              <div className="flex items-baseline gap-2">
                <div className="text-[13.5px] font-semibold text-white">Upstream</div>
                <div className="text-[11px] text-slate-500">(What impacts ETCH-217)</div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {[
                  { icon: Droplet, t: "DI Water System", s: "Dependency" },
                  { icon: FileText, t: "PM Policy: 90-Day", s: "Rule" },
                  { icon: Wind, t: "Chamber Exhaust Fan", s: "Dependency" },
                  { icon: SettingsIcon, t: "Process Recipe: M1E", s: "Configuration" },
                ].map((r) => (
                  <div key={r.t} className="flex items-start gap-2 p-2 rounded-lg border border-white/[0.05] bg-white/[0.02]">
                    <r.icon className="h-4 w-4 text-sky-300 mt-0.5" />
                    <div>
                      <div className="text-[11.5px] text-white">{r.t}</div>
                      <div className="text-[10px] text-slate-500">{r.s}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-[11px] text-sky-300 hover:text-sky-200 mt-3 inline-flex items-center gap-1">View all upstream (18) →</button>
            </GlassCard>

            <GlassCard className="col-span-5 p-5">
              <div className="flex items-baseline gap-2">
                <div className="text-[13.5px] font-semibold text-white">Downstream</div>
                <div className="text-[11px] text-slate-500">(What ETCH-217 impacts)</div>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-3">
                {[
                  { icon: ClipboardList, n: "12", t: "Lots", c: "text-emerald-300" },
                  { icon: Package, n: "4", t: "Products", c: "text-orange-300" },
                  { icon: Building2, n: "2", t: "Customers", c: "text-fuchsia-300" },
                  { icon: Droplet, n: "3", t: "Utilities", c: "text-sky-300" },
                  { icon: Brain, n: "5", t: "AI Agents", c: "text-emerald-300" },
                ].map((r) => (
                  <div key={r.t} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5 text-center">
                    <r.icon className={`h-4 w-4 mx-auto ${r.c}`} />
                    <div className="text-[18px] font-bold text-white mt-1">{r.n}</div>
                    <div className="text-[10.5px] text-slate-400">{r.t}</div>
                  </div>
                ))}
              </div>
              <button className="text-[11px] text-sky-300 hover:text-sky-200 mt-3 inline-flex items-center gap-1">View all downstream (27) →</button>
            </GlassCard>

            <GlassCard className="col-span-3 p-5">
              <div className="text-[13.5px] font-semibold text-white">Similar Assets</div>
              <div className="mt-3 space-y-2">
                {[
                  { name: "ETCH-218", bay: "Bay 3", sim: 91 },
                  { name: "ETCH-216", bay: "Bay 1", sim: 89 },
                  { name: "ETCH-215", bay: "Bay 4", sim: 87 },
                ].map((r) => (
                  <div key={r.name} className="flex items-center gap-2 p-2 rounded-lg border border-white/[0.05] bg-white/[0.02]">
                    <div className="h-8 w-10 rounded overflow-hidden border border-white/[0.06] bg-black/40">
                      <img src={etchImg} alt={r.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[12px] text-white font-medium">{r.name}</div>
                      <div className="text-[10px] text-slate-500">{r.bay}</div>
                    </div>
                    <div className="text-[10px] text-slate-400">Similarity</div>
                    <div className="w-12 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${r.sim}%` }} />
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-300 tabular-nums w-8 text-right">{r.sim}%</div>
                  </div>
                ))}
              </div>
              <button className="text-[11px] text-sky-300 hover:text-sky-200 mt-3 inline-flex items-center gap-1">Find more similar assets →</button>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
}
