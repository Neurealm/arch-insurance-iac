import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bell, Boxes, Building2, ChevronDown, Factory, HelpCircle,
  LayoutGrid, Network as NetIcon, Settings as SettingsIcon, Wrench,
  Workflow, Bot, Gauge, AlertTriangle, Cpu, Play, Pause, RefreshCw,
  Plus, Minus, Maximize2, CheckCircle2, X, Sparkles, Droplets, Users,
  ShieldCheck, TrendingUp, TrendingDown, Activity,
  Gavel, Brain,
} from "lucide-react";
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Area, AreaChart,
} from "recharts";
import { AppShell } from "@/components/eoc/AppShell";

/* ============ atoms ============ */
function GlassCard({ children, className = "" }: any) {
  return (
    <div className={
      "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl " +
      "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-30px_rgba(0,0,0,0.6)] " + className
    }>{children}</div>
  );
}
function useCountUp(target: number, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const s = performance.now();
    const tick = (n: number) => {
      const p = Math.min(1, (n - s) / duration);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

/* ============ rail ============ */
const RAIL = [
  { icon: LayoutGrid, label: "Command\nCenter", to: "/sead/command-center" },
  { icon: Boxes, label: "Digital Twin", to: "/sead/equipment-health-intelligence" },
  { icon: NetIcon, label: "Cross-Domain", to: "/sead/cross-domain-context-twin" },
  { icon: Wrench, label: "Decision\nSim", to: "/sead/maintenance-decision-simulator" },
  { icon: Factory, label: "Factory\nImpact", to: "/sead/factory-impact-simulator", active: true },
  { icon: Sparkles, label: "Decision\nCenter", to: "/sead/ai-maintenance-decision-center" },
  { icon: Gavel, Brain, label: "Human\nGovernance", to: "/sead/human-governance-center" },
];
function ModuleRail() {
  const nav = useNavigate();
  return (
    <aside className="w-[84px] shrink-0 border-r border-white/[0.06] bg-white/[0.015] py-3 flex flex-col items-center gap-0.5">
      {RAIL.map((r: any) => (
        <button
          key={r.label}
          onClick={() => r.to && nav(r.to)}
          className={`group relative w-[72px] py-2.5 rounded-lg flex flex-col items-center gap-1 transition ${
            r.active
              ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30 shadow-[0_0_24px_-12px_rgba(56,189,248,0.8)]"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <r.icon className="h-[18px] w-[18px]" />
          <span className="text-[9.5px] leading-tight text-center px-1 whitespace-pre-line">{r.label}</span>
          {r.badge && (
            <span className="absolute top-1 right-2 h-3.5 min-w-3.5 px-1 rounded-full bg-rose-500 text-white text-[8.5px] font-bold grid place-items-center">{r.badge}</span>
          )}
          {r.active && (
            <motion.span layoutId="rail-fis-indicator"
              className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
          )}
        </button>
      ))}
    </aside>
  );
}

/* ============ header ============ */
function AppHeader() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <header className="flex items-center gap-4 px-6 h-[72px] border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 grid place-items-center shadow-[0_0_28px_-6px_rgba(99,102,241,0.7)] font-black text-white text-[15px]">N</div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Neurealm</div>
          <div className="text-[16px] font-semibold text-white tracking-tight">Factory Impact Simulator</div>
          <div className="text-[11px] text-slate-400">Live impact analysis of maintaining ETCH-217 Tonight (10:00 PM – 2:00 AM)</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2">
        <div className="leading-tight">
          <div className="text-[9.5px] uppercase tracking-wider text-slate-500">Scenario</div>
          <div className="text-[12.5px] font-semibold text-emerald-300">Maintain Tonight (Recommended)</div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
      </div>
      <div className="text-right leading-tight">
        <div className="text-[12px] text-slate-200 tabular-nums">{date} {time} CT</div>
        <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
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

/* ============ asset + control strip ============ */
function AssetStrip({ playing, setPlaying }: any) {
  const nav = useNavigate();
  const F = ({ label, value, color = "text-slate-100" }: any) => (
    <div className="px-5 py-1.5 border-l border-white/[0.06] first:border-l-0">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-[13px] font-medium tabular-nums mt-0.5 ${color}`}>{value}</div>
    </div>
  );
  return (
    <div className="space-y-3">
      <button onClick={() => nav("/sead/maintenance-decision-simulator")} className="text-[11px] text-sky-300 hover:text-sky-200 flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Back to Decision Simulator
      </button>
      <div className="grid grid-cols-12 gap-3">
        <GlassCard className="col-span-12 xl:col-span-8 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Selected Asset</span>
              <div className="h-14 w-20 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 grid place-items-center border border-white/10 mt-1">
                <Cpu className="h-7 w-7 text-sky-300/70" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[26px] font-semibold text-white tracking-tight leading-none">ETCH-217</h1>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/40">Fair</span>
              </div>
              <div className="text-[12px] text-slate-400 mt-1">Metal Etch Chamber | Bay 2</div>
            </div>
            <div className="flex flex-wrap items-center ml-2">
              <F label="Current Status" value="Running" color="text-emerald-300" />
              <F label="Utilization" value="85%" />
              <F label="Health Score" value={<><span className="text-amber-300">72</span><span className="text-slate-500">/100</span></>} />
              <F label="RUL" value={<><span>18 days</span><div className="text-[10px] text-slate-500">(±4 days)</div></>} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 xl:col-span-4 p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Simulation Horizon</div>
            <div className="text-[13.5px] font-medium text-white mt-0.5">7 Days</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPlaying(true)} className={`h-10 w-10 rounded-md grid place-items-center text-white shadow-[0_0_18px_-4px_rgba(56,189,248,0.7)] ${playing ? "bg-sky-500/50" : "bg-sky-500 hover:bg-sky-400"}`}>
              <Play className="h-4 w-4" fill="currentColor" />
            </button>
            <button onClick={() => setPlaying(false)} className="h-10 w-10 rounded-md bg-white/[0.04] border border-white/[0.06] grid place-items-center text-slate-200 hover:bg-white/[0.08]">
              <Pause className="h-4 w-4" />
            </button>
          </div>
          <div className="leading-tight">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Speed</div>
            <button className="mt-0.5 h-7 px-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-[12px] text-slate-200 flex items-center gap-1.5">
              1x <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>
          <div className="leading-tight">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Compare To</div>
            <button className="mt-0.5 h-7 px-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-[12px] text-slate-200 flex items-center gap-1.5">
              Maintain Now <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ============ KPI strip on the twin ============ */
function TwinKpi({ icon: Ico, label, value, sub, color }: any) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className={`h-9 w-9 rounded-md grid place-items-center border ${color}`}>
        <Ico className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 truncate">{label}</div>
        <div className="text-[14px] font-semibold text-white tabular-nums leading-tight">{value}</div>
        {sub && <div className="text-[10px] text-slate-400 truncate">{sub}</div>}
      </div>
    </div>
  );
}

/* ============ isometric factory SVG ============ */
type Building = {
  id: string; x: number; y: number; w: number; h: number; depth?: number;
  color: string; label?: string; tone?: "ok" | "alt" | "alert" | "muted";
};

function isoTransform(x: number, y: number) { return `${x},${y}`; }

function Box3D({ x, y, w, h, depth = 18, color, glow }: any) {
  // simple isometric prism using parallelograms
  const top = `${x},${y} ${x + w},${y} ${x + w - depth},${y - depth} ${x - depth},${y - depth}`;
  const front = `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;
  const side = `${x + w},${y} ${x + w - depth},${y - depth} ${x + w - depth},${y + h - depth} ${x + w},${y + h}`;
  return (
    <g style={glow ? { filter: `drop-shadow(0 0 14px ${glow})` } : {}}>
      <polygon points={front} fill={color} opacity={0.95} />
      <polygon points={side} fill={color} opacity={0.7} />
      <polygon points={top} fill={color} opacity={1.15 as any} style={{ filter: "brightness(1.4)" }} />
    </g>
  );
}

function FactoryTwin({ onOpenDrawer }: { onOpenDrawer: (id: string) => void }) {
  // grid of equipment "bays" + central etch hotspot
  const bays = useMemo<Building[]>(() => {
    const arr: Building[] = [];
    // left grid (front end) — 5x4
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
      arr.push({ id: `fe-${r}-${c}`, x: 110 + c * 36, y: 220 + r * 34, w: 26, h: 18, color: "#3b82f6", tone: "ok" });
    }
    // right grid (assembly) — 5x4
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
      arr.push({ id: `at-${r}-${c}`, x: 720 + c * 36, y: 220 + r * 34, w: 26, h: 18, color: "#64748b", tone: "muted" });
    }
    // back end strip
    for (let c = 0; c < 6; c++) {
      arr.push({ id: `be-${c}`, x: 380 + c * 38, y: 460, w: 28, h: 18, color: "#475569", tone: "muted" });
    }
    return arr;
  }, []);

  return (
    <div className="relative w-full h-[520px] rounded-lg overflow-hidden bg-[radial-gradient(ellipse_at_center,_#0c1426_0%,_#06080f_70%)] border border-white/[0.06]">
      {/* grid floor */}
      <svg viewBox="0 0 1100 520" className="absolute inset-0 w-full h-full">
        <defs>
          <pattern id="iso-grid" width="40" height="22" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)">
            <path d="M40 0 L0 0 0 22" fill="none" stroke="rgba(56,189,248,0.06)" strokeWidth="0.7" />
          </pattern>
          <linearGradient id="floor-fade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0b1426" />
            <stop offset="100%" stopColor="#05070d" />
          </linearGradient>
          <filter id="soft-glow"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        <rect width="1100" height="520" fill="url(#floor-fade)" />
        <rect width="1100" height="520" fill="url(#iso-grid)" opacity="0.6" />

        {/* zone labels */}
        <text x="180" y="195" fill="#94a3b8" fontSize="11" letterSpacing="2">FRONT END</text>
        <text x="780" y="195" fill="#94a3b8" fontSize="11" letterSpacing="2">ASSEMBLY &amp; TEST</text>
        <text x="430" y="500" fill="#94a3b8" fontSize="11" letterSpacing="2">BACK END</text>

        {/* equipment */}
        {bays.map((b) => {
          const palette =
            b.tone === "ok" ? "#3b82f6" :
            b.tone === "alt" ? "#f59e0b" :
            b.tone === "alert" ? "#ef4444" : "#475569";
          return <Box3D key={b.id} x={b.x} y={b.y} w={b.w} h={b.h} color={palette} />;
        })}

        {/* central etch hotspot */}
        <g onClick={() => onOpenDrawer("etch-217")} style={{ cursor: "pointer" }}>
          <Box3D x={500} y={270} w={70} h={42} depth={26} color="#dc2626" glow="rgba(239,68,68,0.7)" />
          <circle cx="535" cy="260" r="18" fill="rgba(239,68,68,0.25)">
            <animate attributeName="r" values="18;32;18" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* flow lines (animated dashes) */}
        {[
          { d: "M 250 270 C 320 280, 420 280, 500 290", color: "#22d3ee" },
          { d: "M 530 320 C 540 360, 540 420, 540 460", color: "#a78bfa" },
          { d: "M 580 290 C 660 290, 700 290, 760 290", color: "#22d3ee" },
          { d: "M 250 320 C 320 360, 420 420, 480 460", color: "#ec4899" },
          { d: "M 580 320 C 680 360, 780 400, 880 440", color: "#10b981" },
          { d: "M 250 250 C 320 230, 420 230, 500 270", color: "#f59e0b" },
        ].map((l, i) => (
          <g key={i}>
            <path d={l.d} stroke={l.color} strokeWidth="1.6" fill="none" opacity="0.45" />
            <path d={l.d} stroke={l.color} strokeWidth="2.4" fill="none" strokeDasharray="6 10" opacity="0.9">
              <animate attributeName="stroke-dashoffset" from="0" to="-160" dur="3s" repeatCount="indefinite" />
            </path>
          </g>
        ))}
      </svg>

      {/* floating callouts */}
      <CalloutCard top={68} left={350} tone="alert" title="ETCH-217" lines={["Maint. Tonight", "10:00 PM – 2:00 AM"]} arrow="down" onClick={() => onOpenDrawer("etch-217")} />
      <CalloutCard top={210} left={170} tone="amber" title="Alt Tool" lines={["ETCH-215", "Load: 68%"]} onClick={() => onOpenDrawer("alt-215")} />
      <CalloutCard top={335} left={350} tone="amber" title="Alt Tool" lines={["ETCH-220", "Load: 82%"]} onClick={() => onOpenDrawer("alt-220")} />
      <CalloutCard top={210} left={550} tone="violet" title="WIP Increase" lines={["Assembly", "+18 lots"]} icon={ShieldCheck} onClick={() => onOpenDrawer("wip")} />
      <CalloutCard top={335} left={580} tone="sky" title="Utility Impact" lines={["Chilled Water", "+6% (1.2 hrs)"]} icon={Droplets} onClick={() => onOpenDrawer("util")} />
      <CalloutCard top={210} left={780} tone="emerald" title="Customer Orders" lines={["On Track", "0 at risk"]} icon={CheckCircle2} onClick={() => onOpenDrawer("cust")} />
      <CalloutCard top={358} left={130} tone="fuchsia" title="Queue Build" lines={["CMP Area", "+12 lots"]} icon={Users} onClick={() => onOpenDrawer("queue")} />

      {/* viewport controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        <button className="h-8 w-8 rounded-md bg-white/[0.05] border border-white/[0.08] backdrop-blur grid place-items-center text-slate-300 hover:bg-white/[0.1]"><RefreshCw className="h-3.5 w-3.5" /></button>
        <button className="h-8 w-8 rounded-md bg-white/[0.05] border border-white/[0.08] backdrop-blur grid place-items-center text-slate-300 hover:bg-white/[0.1]"><Plus className="h-3.5 w-3.5" /></button>
        <button className="h-8 w-8 rounded-md bg-white/[0.05] border border-white/[0.08] backdrop-blur grid place-items-center text-slate-300 hover:bg-white/[0.1]"><Minus className="h-3.5 w-3.5" /></button>
      </div>

      {/* view tabs */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-lg bg-white/[0.04] border border-white/[0.08] backdrop-blur px-1 py-1">
        {["3D", "2D", "Flow", "Heatmap"].map((t, i) => (
          <button key={t} className={`px-3 py-1 rounded-md text-[11px] font-medium ${i === 0 ? "bg-sky-500 text-white" : "text-slate-300 hover:bg-white/[0.06]"}`}>{t}</button>
        ))}
      </div>
    </div>
  );
}

function CalloutCard({ top, left, tone, title, lines, icon: Ico, onClick, arrow }: any) {
  const palette: Record<string, string> = {
    alert: "border-rose-500/40 bg-rose-500/[0.08] text-rose-100 shadow-[0_0_24px_-8px_rgba(244,63,94,0.7)]",
    amber: "border-amber-500/40 bg-amber-500/[0.08] text-amber-100",
    violet: "border-violet-500/40 bg-violet-500/[0.08] text-violet-100",
    sky: "border-sky-500/40 bg-sky-500/[0.08] text-sky-100",
    emerald: "border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-100",
    fuchsia: "border-fuchsia-500/40 bg-fuchsia-500/[0.08] text-fuchsia-100",
  };
  const dotColor: Record<string, string> = {
    alert: "bg-rose-400", amber: "bg-amber-400", violet: "bg-violet-400",
    sky: "bg-sky-400", emerald: "bg-emerald-400", fuchsia: "bg-fuchsia-400",
  };
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ top, left }}
      className={`absolute min-w-[150px] text-left rounded-md border backdrop-blur-md px-2.5 py-1.5 ${palette[tone]}`}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        {Ico ? <Ico className="h-3 w-3" /> : <span className={`h-1.5 w-1.5 rounded-full ${dotColor[tone]} animate-pulse`} />}
        <span className="text-[11px] font-semibold tracking-tight">{title}</span>
      </div>
      {lines.map((l: string, i: number) => (
        <div key={i} className={`text-[10.5px] ${i === 0 ? "font-medium" : "text-slate-300"}`}>{l}</div>
      ))}
      {arrow === "down" && (
        <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-rose-500/60" />
      )}
    </motion.button>
  );
}

/* ============ left layers + legend ============ */
function LayersPanel() {
  const layers = [
    { label: "Material Flow", color: "text-violet-300" },
    { label: "WIP / Queues", color: "text-fuchsia-300" },
    { label: "Tool Utilization", color: "text-amber-300" },
    { label: "Bottlenecks", color: "text-rose-300" },
    { label: "Utilities", color: "text-sky-300" },
    { label: "Customer Commitments", color: "text-emerald-300" },
  ];
  return (
    <div className="space-y-3">
      <GlassCard className="p-3">
        <div className="text-[12px] font-semibold text-white mb-2">Impact Layers</div>
        <div className="space-y-1.5">
          {layers.map((l) => (
            <label key={l.label} className="flex items-center gap-2 text-[11.5px] text-slate-200 hover:bg-white/[0.03] rounded px-1.5 py-1 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-sky-400 h-3 w-3" />
              <Activity className={`h-3 w-3 ${l.color}`} />
              <span>{l.label}</span>
            </label>
          ))}
        </div>
      </GlassCard>
      <GlassCard className="p-3">
        <div className="text-[12px] font-semibold text-white mb-2">Legend</div>
        <div className="space-y-1 text-[11px] text-slate-300">
          {[
            ["bg-violet-400", "Increase / Build"],
            ["bg-fuchsia-400", "Decrease / Reduce"],
            ["bg-slate-400", "No Change"],
            ["bg-amber-400", "At Risk"],
            ["bg-emerald-400", "Improvement"],
          ].map(([c, label]) => (
            <div key={label} className="flex items-center gap-2"><span className={`h-0.5 w-6 rounded ${c}`} />{label}</div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* ============ right impact summary ============ */
const SUMMARY = [
  { label: "Material Flow", sub: "Minor re-route to ETCH-220", val: "Low", tone: "text-emerald-300", color: "#10b981", seed: 1 },
  { label: "WIP / Queues", sub: "Max queue increase in CMP Area\n+12 lots (6% ↑)", val: "Low", tone: "text-emerald-300", color: "#a78bfa", seed: 2 },
  { label: "Tool Utilization", sub: "Max alt tool load\n82% (ETCH-220)", val: "Medium", tone: "text-amber-300", color: "#f59e0b", seed: 3 },
  { label: "Bottlenecks", sub: "1 bottleneck period\n(vs 2 with Maintain Now)", val: "Low", tone: "text-emerald-300", color: "#f43f5e", seed: 4 },
  { label: "Utilities", sub: "Chilled Water\n+6% (1.2 hrs)", val: "Low", tone: "text-emerald-300", color: "#38bdf8", seed: 5 },
  { label: "Customer Commitments", sub: "All commitments\nOn Track", val: "Positive", tone: "text-emerald-300", color: "#10b981", seed: 6 },
];
function MiniSpark({ color, seed }: any) {
  const data = Array.from({ length: 18 }, (_, i) => {
    const s = ((seed * 9301 + i * 49297) % 233280) / 233280;
    return { i, y: 50 + (s - 0.5) * 30 + i * 0.6 };
  });
  return (
    <div className="h-6 w-16">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`mg-${color}-${seed}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="y" stroke={color} strokeWidth={1.4} fill={`url(#mg-${color}-${seed})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
function ImpactSummary({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <GlassCard className="p-4">
      <div className="text-[12px] font-semibold text-white mb-3">Impact Summary <span className="text-slate-500 font-normal">(vs Maintain Now)</span></div>
      <div className="space-y-2">
        {SUMMARY.map((s) => (
          <button key={s.label} onClick={() => onOpen(s.label)}
            className="w-full text-left flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] rounded px-1">
            <MiniSpark color={s.color} seed={s.seed} />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-white truncate">{s.label}</div>
              <div className="text-[10.5px] text-slate-400 leading-tight whitespace-pre-line">{s.sub}</div>
            </div>
            <span className={`text-[13px] font-bold ${s.tone}`}>{s.val}</span>
          </button>
        ))}
      </div>
      <button className="text-[11px] text-sky-300 hover:text-sky-200 mt-3">View Detailed Impact Report →</button>
    </GlassCard>
  );
}

/* ============ bottom row ============ */
function ProductionScheduleChart() {
  const data = ["May 23","May 24","May 25","May 26","May 27","May 28","May 29"].map((d, i) => ({
    d, OnPlan: 55 + Math.round(Math.random() * 10),
    Change: 4 + Math.round(Math.random() * 4),
    Risk: 1 + Math.round(Math.random() * 3),
  }));
  return (
    <GlassCard className="p-4">
      <div className="text-[12px] font-semibold text-white mb-1">Production Schedule Impact <span className="text-slate-500 font-normal">(7 Days)</span></div>
      <div className="flex items-center gap-4 text-[10.5px] text-slate-400 mb-1">
        <span>Wafers</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-400" /> On Plan</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-sky-400" /> Change</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-rose-400" /> Risk</span>
        </span>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer>
          <BarChart data={data} stackOffset="sign" margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <XAxis dataKey="d" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}K`} />
            <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(255,255,255,0.08)", fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey="OnPlan" stackId="a" fill="#10b981" radius={[0,0,0,0]} />
            <Bar dataKey="Change" stackId="a" fill="#38bdf8" />
            <Bar dataKey="Risk" stackId="a" fill="#f43f5e" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
const AREAS = [
  { area: "CMP Area Queue", impact: "+12 lots", duration: "6 hrs", sev: "Low", tone: "bg-violet-400" },
  { area: "ETCH-220 (Alt Tool)", impact: "82% load", duration: "4 hrs", sev: "Medium", tone: "bg-amber-400" },
  { area: "Assembly WIP", impact: "+18 lots", duration: "8 hrs", sev: "Low", tone: "bg-violet-400" },
  { area: "Chilled Water", impact: "+6%", duration: "1.2 hrs", sev: "Low", tone: "bg-violet-400" },
  { area: "Back End Test", impact: "+5 lots", duration: "2 hrs", sev: "Low", tone: "bg-violet-400" },
];
function AreasTable({ onOpen }: any) {
  return (
    <GlassCard className="p-4">
      <div className="text-[12px] font-semibold text-white mb-3">Top Affected Areas</div>
      <table className="w-full text-[11.5px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-slate-500 text-left">
            <th className="pb-2">Area</th><th className="pb-2">Impact</th><th className="pb-2">Duration</th><th className="pb-2">Severity</th>
          </tr>
        </thead>
        <tbody>
          {AREAS.map((a) => (
            <tr key={a.area} onClick={() => onOpen(a.area)} className="border-t border-white/[0.04] hover:bg-white/[0.03] cursor-pointer">
              <td className="py-2 text-slate-200 font-medium">{a.area}</td>
              <td className="py-2 text-slate-300 tabular-nums">{a.impact}</td>
              <td className="py-2 text-slate-300 tabular-nums">{a.duration}</td>
              <td className="py-2"><span className="inline-flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${a.tone}`} /><span className="text-slate-200">{a.sev}</span></span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}
function CustomerDonut() {
  const total = useCountUp(236);
  return (
    <GlassCard className="p-4">
      <div className="text-[12px] font-semibold text-white mb-2">Customer Commitment Impact</div>
      <div className="flex items-center gap-4">
        <div className="relative h-[160px] w-[160px]">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="48" stroke="rgba(255,255,255,0.06)" strokeWidth="14" fill="none" />
            <circle cx="60" cy="60" r="48" stroke="#10b981" strokeWidth="14" fill="none"
              strokeDasharray={`${2 * Math.PI * 48} ${2 * Math.PI * 48}`} strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.6))" }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-[28px] font-bold text-white tabular-nums">{total.toFixed(0)}</div>
              <div className="text-[10px] text-slate-400">Total Orders</div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2 text-[11.5px]">
          <Row dot="bg-emerald-400" label="On Track" v="236" pct="(100%)" />
          <Row dot="bg-amber-400" label="At Risk" v="0" pct="(0%)" />
          <Row dot="bg-rose-400" label="Late" v="0" pct="(0%)" />
        </div>
      </div>
      <button className="text-[11px] text-sky-300 hover:text-sky-200 mt-2">View Orders →</button>
    </GlassCard>
  );
}
function Row({ dot, label, v, pct }: any) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="text-slate-200 flex-1">{label}</span>
      <span className="text-white font-semibold tabular-nums">{v}</span>
      <span className="text-slate-500 tabular-nums">{pct}</span>
    </div>
  );
}
function KeyTakeaway() {
  return (
    <GlassCard className="p-4">
      <div className="text-[12px] font-semibold text-white mb-2">Key Takeaway</div>
      <div className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 flex items-center gap-2 mb-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
        <span className="text-[12.5px] font-semibold text-emerald-200">Low Overall Impact</span>
      </div>
      <p className="text-[12px] text-slate-300 leading-snug">Maintaining ETCH-217 tonight has low impact to factory operations.</p>
      <p className="text-[12px] text-slate-300 leading-snug mt-2">Production loss is minimal and all customer commitments remain on track.</p>
      <p className="text-[12px] text-slate-300 leading-snug mt-2">This is the optimal window.</p>
      <button className="text-[11px] text-sky-300 hover:text-sky-200 mt-3">View AI Recommendation →</button>
    </GlassCard>
  );
}

/* ============ drawer ============ */
function IntelligenceDrawer({ open, id, onClose }: any) {
  const [tab, setTab] = useState("Executive Summary");
  const tabs = ["Executive Summary", "Operational", "Engineering", "AI Reasoning", "Telemetry", "Historical"];
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
          <motion.aside initial={{ x: 460 }} animate={{ x: 0 }} exit={{ x: 460 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-[460px] bg-[#0a0f1c] border-l border-white/[0.08] z-50 flex flex-col">
            <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.08]">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Impact Drawer</div>
                <div className="text-[13px] font-semibold text-white">{id ?? "Detail"}</div>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-white/[0.06] grid place-items-center"><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="flex items-center gap-1 px-3 border-b border-white/[0.06] overflow-x-auto">
              {tabs.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-2.5 py-2 text-[11px] whitespace-nowrap border-b-2 transition ${
                    tab === t ? "text-sky-300 border-sky-400" : "text-slate-400 border-transparent hover:text-slate-200"
                  }`}>{t}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-5 text-[12px] text-slate-300 space-y-3">
              {tab === "Executive Summary" && (
                <>
                  <div className="rounded-md bg-emerald-500/10 border border-emerald-500/30 p-3">
                    <div className="flex items-center gap-2 text-emerald-300 text-[12px] font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> Low factory-wide impact
                    </div>
                    <p className="mt-1 text-slate-200">Simulation confirms minor re-route to ETCH-220 absorbs queued lots; revenue and customer commitments unaffected.</p>
                  </div>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li>Production: -320 wafers (-0.6%)</li>
                    <li>Yield: -0.02% (-2.1K good die)</li>
                    <li>Revenue exposure: -$0.24M</li>
                    <li>RUL extension after PM: +62 days</li>
                  </ul>
                </>
              )}
              {tab === "Operational" && (
                <ul className="space-y-2 list-disc pl-4">
                  <li>AMHS reroutes 12 FOUPs to ETCH-220 / ETCH-215</li>
                  <li>CMP queue peak +12 lots, drains within 6h</li>
                  <li>Assembly WIP +18 lots, buffered</li>
                  <li>Shift B fully staffed (2 senior techs)</li>
                </ul>
              )}
              {tab === "Engineering" && (
                <ul className="space-y-2 list-disc pl-4">
                  <li>Discrete-event sim · 10K Monte Carlo trials</li>
                  <li>FactoryWorks MES + AMHS routing in scope</li>
                  <li>SECS/GEM event stream verified healthy</li>
                  <li>SPC: no Western Electric violations forecast</li>
                  <li>APC run-to-run controllers in nominal range</li>
                </ul>
              )}
              {tab === "AI Reasoning" && (
                <p>Optimization maximizes expected business value with customer-commitment and engineering-freeze constraints. Counterfactual: deferring PM 7 days flips bottleneck count 1 → 2 and raises revenue exposure 5×.</p>
              )}
              {tab === "Telemetry" && (
                <ul className="space-y-1.5">
                  <li>Chamber Pressure σ — 0.084 mT</li>
                  <li>He Leak — 1.8e-6 sccs</li>
                  <li>RF Reflected — 4.2% variance</li>
                </ul>
              )}
              {tab === "Historical" && (
                <ul className="space-y-1.5">
                  <li>ETCH-203 · 2024-11 — analogous PM tonight window, prevented 18h unplanned downtime</li>
                  <li>ETCH-211 · 2025-02 — deferred PM, caused 22h unplanned downtime</li>
                </ul>
              )}
            </div>
            <div className="border-t border-white/[0.08] p-3 flex items-center gap-2">
              <button className="flex-1 h-9 rounded-md bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-[12px] font-semibold">Approve Maintenance</button>
              <button className="h-9 px-3 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11.5px] text-slate-200 hover:bg-white/[0.08]">Escalate</button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============ page ============ */
export default function FactoryImpactSimulator() {
  const [playing, setPlaying] = useState(true);
  const [drawer, setDrawer] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const open = (id: string) => setDrawer({ open: true, id });

  return (
    <AppShell>
      <div className="min-h-screen bg-[#06080f] text-slate-200">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.06),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(168,85,247,0.05),_transparent_55%)]" />
        </div>

        <AppHeader />

        <div className="flex">
          <ModuleRail />
          <main className="flex-1 min-w-0 px-5 py-4 space-y-4">
            <AssetStrip playing={playing} setPlaying={setPlaying} />

            <div className="grid grid-cols-12 gap-3">
              <GlassCard className="col-span-12 xl:col-span-9 p-4">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <div className="text-[14px] font-semibold text-white">Factory Impact Overview <span className="text-slate-500 text-[11px] font-normal ml-1">ⓘ</span></div>
                    <div className="text-[11px] text-slate-400">Visualizing the ripple effects across production, materials, tools, and resources.</div>
                  </div>
                  <div className="flex items-center gap-5 flex-wrap">
                    <TwinKpi icon={TrendingDown} label="Total Production Impact" value="-320 wafers" sub="(-0.6%)" color="border-rose-500/40 bg-rose-500/[0.08] text-rose-300" />
                    <TwinKpi icon={ShieldCheck} label="Total Yield Impact" value="-0.02%" sub="(-2.1K good die)" color="border-sky-500/40 bg-sky-500/[0.08] text-sky-300" />
                    <TwinKpi icon={AlertTriangle} label="Critical Bottlenecks" value="1" sub="(vs 2 with Maintain Now)" color="border-amber-500/40 bg-amber-500/[0.08] text-amber-300" />
                    <TwinKpi icon={Users} label="Customer Commitments" value="On Track" sub="(No at-risk orders)" color="border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-300" />
                    <TwinKpi icon={Sparkles} label="Overall Factory Impact" value="Low" color="border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-300" />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-3 xl:col-span-2"><LayersPanel /></div>
                  <div className="col-span-12 md:col-span-9 xl:col-span-10">
                    <FactoryTwin onOpenDrawer={open} />
                  </div>
                </div>
              </GlassCard>

              <div className="col-span-12 xl:col-span-3">
                <ImpactSummary onOpen={open} />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 lg:col-span-4"><ProductionScheduleChart /></div>
              <div className="col-span-12 lg:col-span-3"><AreasTable onOpen={open} /></div>
              <div className="col-span-12 lg:col-span-3"><CustomerDonut /></div>
              <div className="col-span-12 lg:col-span-2"><KeyTakeaway /></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-2 border-t border-white/[0.05]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Digital Twin streaming · MES · AMHS · FactoryWorks · APC · SECS/GEM · EDA
              </span>
              <span>Texas Instruments · DFW Fab · Factory Impact Simulator v1.0</span>
            </div>
          </main>
        </div>

        <IntelligenceDrawer open={drawer.open} id={drawer.id} onClose={() => setDrawer({ open: false, id: null })} />
      </div>
    </AppShell>
  );
}
