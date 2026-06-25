import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bell,
  Boxes,
  ChevronDown,
  CircleDot,
  Cpu,
  Factory,
  HelpCircle,
  Info,
  LayoutGrid,
  MapPin,
  Maximize2,
  Search,
  Settings as SettingsIcon,
  ShieldAlert,
  Sparkles,
  ThermometerSun,
  TrendingDown,
  TrendingUp,
  Truck,
  Zap,
  Wrench,
  Workflow,
  Bot,
  Database,
  Gauge,
  FileBarChart2,
  Building2,
  Network as NetIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/eoc/AppShell";

/* =====================================================================
   Factory Operations Command Center — Foundation
   Modeled after enterprise twin platforms (Omniverse / Xcelerator / Forge).
   ===================================================================== */

/* ---------- mock data layer (would normally come from /api) ---------- */

const KPIS = [
  { id: "health", label: "Factory Health", value: 87, suffix: "/100", status: "good", trend: "+3 vs yesterday", spark: [82, 84, 81, 85, 84, 87, 87], donut: 87, donutColor: "#22c55e", caption: "Good" },
  { id: "oee", label: "Overall Equipment Effectiveness", value: 78.6, suffix: "%", status: "good", trend: "▲ 2.1% vs yesterday", spark: [74, 75, 76, 76, 77, 78, 78.6] },
  { id: "tp", label: "Throughput (Wafers)", value: 52340, suffix: " wafers/day", status: "good", trend: "▲ 3.1% vs target (51,000)", spark: [50100, 50800, 51200, 51600, 51900, 52150, 52340] },
  { id: "wip", label: "WIP Lots", value: 8742, suffix: "", status: "info", trend: "▲ 1.2% vs yesterday", spark: [8500, 8550, 8600, 8650, 8680, 8720, 8742] },
  { id: "tool", label: "Tool Health Score", value: 82, suffix: "/100", status: "warning", trend: "-2 vs yesterday", spark: [85, 84, 84, 83, 83, 82, 82], donut: 82, donutColor: "#f59e0b", caption: "Fair" },
  { id: "down", label: "Unplanned Downtime", value: 2.1, suffix: "%", status: "good", trend: "▼ 0.6% vs yesterday", spark: [2.9, 2.7, 2.6, 2.4, 2.3, 2.2, 2.1] },
  { id: "safety", label: "Safety", value: 0, suffix: "", status: "good", trend: "Recordable Events • This Month", spark: [0, 0, 0, 0, 0, 0, 0], icon: ShieldAlert },
];

const PRODUCTION_AREAS = [
  { i: 1, name: "Incoming & Stockers", wip: 112, dot: "#22c55e" },
  { i: 2, name: "Diffusion / Thermal", wip: 418, dot: "#22c55e" },
  { i: 3, name: "Implant", wip: 121, dot: "#22c55e" },
  { i: 4, name: "Thin Film Deposition", wip: 341, dot: "#22c55e" },
  { i: 5, name: "Photolithography", wip: 362, dot: "#f59e0b" },
  { i: 6, name: "Etch", wip: 362, dot: "#f59e0b" },
  { i: 7, name: "CMP", wip: 226, dot: "#f59e0b" },
  { i: 8, name: "Metrology & Inspection", wip: 492, dot: "#ef4444" },
  { i: 9, name: "Wet Clean", wip: 188, dot: "#22c55e" },
];

const ALERTS = [
  { id: "a1", icon: AlertTriangle, color: "text-rose-400", title: "Metrology Tool Degradation", sub: "MET-217 vibration trend increasing", time: "10 min ago", sev: "Critical", sevClass: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  { id: "a2", icon: AlertTriangle, color: "text-amber-400", title: "High Queue in Metrology", sub: "8 tools > 90% capacity", time: "18 min ago", sev: "High", sevClass: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { id: "a3", icon: AlertTriangle, color: "text-amber-300", title: "Cooling Water Flow Deviation", sub: "Flow below normal in Loop B", time: "25 min ago", sev: "Medium", sevClass: "bg-amber-500/10 text-amber-200 border-amber-500/20" },
  { id: "a4", icon: AlertTriangle, color: "text-amber-300", title: "AMHS Traffic Congestion", sub: "Bay 3 transport delay increasing", time: "32 min ago", sev: "Medium", sevClass: "bg-amber-500/10 text-amber-200 border-amber-500/20" },
  { id: "a5", icon: Info, color: "text-sky-400", title: "Planned Maintenance Today", sub: "7 work orders scheduled", time: "1 hr ago", sev: "Info", sevClass: "bg-sky-500/10 text-sky-300 border-sky-500/20" },
];

const RECS = [
  { id: "r1", title: "Optimize Metrology Maintenance Window", sub: "Recommended window: Tonight 10:00 PM", impact: "Impact: +320 wafers, -$145K risk avoided" },
  { id: "r2", title: "Rebalance CMP Workload", sub: "Move 14 lots to CMP-042", impact: "Impact: -2.3 days cycle time" },
  { id: "r3", title: "Adjust Utility Setpoints", sub: "Reduce chiller load during off-peak", impact: "Impact: -3.1 MW peak demand" },
  { id: "r4", title: "Route Lots Around Congested Bay 3", sub: "Use alternate AMHS path", impact: "Impact: -18 min avg transport delay" },
];

const BOTTLENECKS = [
  { rank: 1, name: "Metrology & Inspection", util: 96, wip: 492, color: "bg-rose-500" },
  { rank: 2, name: "Etch", util: 91, wip: 362, color: "bg-amber-500" },
  { rank: 3, name: "CMP", util: 87, wip: 226, color: "bg-amber-400" },
];

const HEALTH_DIST = [
  { name: "Good (80-100)", value: 259, color: "#22c55e" },
  { name: "Fair (60-79)", value: 117, color: "#f59e0b" },
  { name: "Poor (0-59)", value: 33, color: "#ef4444" },
  { name: "Down", value: 9, color: "#64748b" },
];

const UTILITIES = [
  { name: "Power", cur: "67.3 MW", opt: "71.0 MW", status: "Good", color: "text-emerald-400" },
  { name: "Nitrogen", cur: "65.2 kSCFM", opt: "70.0 kSCFM", status: "Good", color: "text-emerald-400" },
  { name: "Chilled Water", cur: "8,420 gpm", opt: "9,000 gpm", status: "Good", color: "text-emerald-400" },
  { name: "Vacuum", cur: "71.0 kSCFM", opt: "72.0 kSCFM", status: "Fair", color: "text-amber-400" },
  { name: "Compressed Air", cur: "72.1 kSCFM", opt: "75.0 kSCFM", status: "Good", color: "text-emerald-400" },
];

const OEE_TREND = Array.from({ length: 28 }, (_, i) => ({
  d: i,
  oee: 70 + Math.sin(i / 2) * 6 + (i % 5) * 1.2 + Math.random() * 3,
}));

const EVENTS = [
  { t: "10:19 AM", title: "MET-217 vibration trend change detected", tag: "Monitoring", color: "bg-amber-400" },
  { t: "10:15 AM", title: "Work Order WO-2025-05-217 created", tag: "Maintenance", color: "bg-sky-400" },
  { t: "10:12 AM", title: "Bay 3 AMHS delay threshold exceeded", tag: "Dispatch", color: "bg-amber-400" },
  { t: "10:08 AM", title: "Chiller Loop B flow deviation", tag: "Facilities", color: "bg-amber-400" },
  { t: "10:05 AM", title: "AI recommendation generated", tag: "AI Agent", color: "bg-violet-400" },
  { t: "10:01 AM", title: "Lot P45018 started at LITH-021", tag: "Production", color: "bg-emerald-400" },
  { t: "09:58 AM", title: "Power demand rising above baseline", tag: "Facilities", color: "bg-amber-400" },
];

/* ---------- tiny reusable atoms ---------- */

function GlassCard({ children, className = "", as: As = "div" as any, onClick }: any) {
  return (
    <As
      onClick={onClick}
      className={
        "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl " +
        "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-30px_rgba(0,0,0,0.6)] " +
        className
      }
    >
      {children}
    </As>
  );
}

function useCountUp(target: number, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function format(n: number, decimals = 0) {
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n.toFixed(decimals);
}

function Spark({ data, color = "#38bdf8" }: { data: number[]; color?: string }) {
  const pts = data.map((y, i) => ({ i, y }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer>
        <AreaChart data={pts} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`sp-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="y" stroke={color} strokeWidth={1.5} fill={`url(#sp-${color})`} dot={false} isAnimationActive />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Donut({ value, color }: { value: number; color: string }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const v = useCountUp(value);
  const off = c - (v / 100) * c;
  return (
    <div className="relative h-[72px] w-[72px] shrink-0">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
        <circle cx="36" cy="36" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
        <circle
          cx="36" cy="36" r={r}
          stroke={color}
          strokeWidth="6" fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-lg font-semibold text-white tabular-nums">{Math.round(v)}</div>
      </div>
    </div>
  );
}

/* ---------- KPI card ---------- */

function KpiCard({ k }: { k: any }) {
  const v = useCountUp(typeof k.value === "number" ? k.value : 0);
  const isDecimal = String(k.value).includes(".");
  const valueDisplay =
    k.id === "tp" || k.id === "wip"
      ? format(v)
      : isDecimal
      ? v.toFixed(1)
      : Math.round(v).toString();
  const sparkColor =
    k.status === "warning" ? "#f59e0b" : k.status === "critical" ? "#ef4444" : "#38bdf8";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
    >
      <GlassCard className="p-4 h-full hover:border-white/10 transition-colors group">
        <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400 font-semibold">
          {k.label}
        </div>

        <div className="mt-3 flex items-start gap-3">
          {k.donut ? <Donut value={k.donut} color={k.donutColor} /> : null}
          {k.id === "safety" ? (
            <div className="flex items-start justify-between w-full">
              <div>
                <div className="text-3xl font-semibold text-white tabular-nums">0</div>
                <div className="text-[11px] text-slate-400 mt-1">Recordable Events</div>
                <div className="text-[11px] text-slate-500">This Month</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 grid place-items-center">
                <ShieldAlert className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1">
                <div className="text-[26px] leading-none font-semibold text-white tabular-nums">
                  {valueDisplay}
                </div>
                <div className="text-xs text-slate-400 truncate">{k.suffix}</div>
              </div>
              {k.caption && (
                <div className="mt-1 text-[12px] font-medium text-slate-300">{k.caption}</div>
              )}
            </div>
          )}
        </div>

        <div className="mt-2 text-[11px] flex items-center gap-1 text-slate-400">
          {k.trend.includes("▼") ? (
            <TrendingDown className="h-3 w-3 text-emerald-400" />
          ) : k.trend.includes("▲") || k.trend.startsWith("+") ? (
            <TrendingUp className="h-3 w-3 text-emerald-400" />
          ) : (
            <CircleDot className="h-3 w-3 text-slate-500" />
          )}
          <span className="truncate">{k.trend.replace(/[▲▼]\s?/, "")}</span>
        </div>

        {k.id !== "safety" && (
          <div className="mt-2 -mx-1">
            <Spark data={k.spark} color={sparkColor} />
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

/* ---------- Digital Twin viewport (placeholder, architected for R3F) ---------- */

function DigitalTwinViewport() {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg border border-white/[0.06] bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.10),_rgba(2,6,23,0.0)_60%)]">
      {/* animated grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.10) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      {/* sweep */}
      <motion.div
        className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-sky-400/10 to-transparent"
        animate={{ x: ["0%", "400%"] }}
        transition={{ duration: 6, ease: "linear", repeat: Infinity }}
      />
      {/* placeholder fab tiles */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-2 p-8">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 0.45 + (i % 5) * 0.08, scale: 1 }}
            transition={{ delay: i * 0.02, duration: 0.4 }}
            className="rounded-md border border-white/[0.06] bg-white/[0.03] shadow-[0_0_24px_-12px_rgba(56,189,248,0.4)_inset]"
          />
        ))}
      </div>
      {/* center loader */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-14 w-14">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-sky-400/60"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, ease: "linear", repeat: Infinity }}
              style={{ borderRightColor: "transparent", borderBottomColor: "transparent" }}
            />
            <div className="absolute inset-2 rounded-full bg-sky-400/10 border border-sky-400/30 grid place-items-center">
              <Boxes className="h-5 w-5 text-sky-300" />
            </div>
          </div>
          <div className="text-[12px] uppercase tracking-[0.2em] text-sky-300/90">
            Preparing Factory Digital Twin
          </div>
          <div className="text-[11px] text-slate-400">
            React Three Fiber scene mounts here in Prompt&nbsp;2
          </div>
        </div>
      </div>
      {/* corner camera controls placeholder */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        {["+", "−", "⟳"].map((s) => (
          <button
            key={s}
            className="h-7 w-7 grid place-items-center rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08] transition"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="absolute left-3 bottom-3 flex items-center gap-2 text-[10px] text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Twin Stream • 60 fps target • WebGL 2
      </div>
    </div>
  );
}

/* ---------- left sub-nav (Twin module rail) ---------- */

const RAIL = [
  { icon: LayoutGrid, label: "Command Center", active: true },
  { icon: Boxes, label: "Digital Twin" },
  { icon: Factory, label: "Equipment" },
  { icon: Workflow, label: "Production" },
  { icon: Wrench, label: "Maintenance" },
  { icon: Building2, label: "Facilities" },
  { icon: Bot, label: "AI Agents" },
  { icon: NetIcon, label: "Knowledge Graph" },
  { icon: FileBarChart2, label: "Reports" },
  { icon: SettingsIcon, label: "Settings" },
];

function ModuleRail() {
  return (
    <aside className="w-[80px] shrink-0 border-r border-white/[0.06] bg-white/[0.015] py-4 flex flex-col items-center gap-1">
      {RAIL.map((r) => (
        <button
          key={r.label}
          className={`group relative w-[64px] py-3 rounded-lg flex flex-col items-center gap-1 transition ${
            r.active
              ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30 shadow-[0_0_24px_-12px_rgba(56,189,248,0.8)]"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <r.icon className="h-[18px] w-[18px]" />
          <span className="text-[10px] leading-tight text-center px-1">{r.label}</span>
          {r.active && (
            <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-sky-400" />
          )}
        </button>
      ))}
    </aside>
  );
}

/* ---------- Top header (in-app, application-scoped) ---------- */

function AppHeader() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <header className="flex items-center gap-4 px-6 h-[64px] border-b border-white/[0.06] bg-white/[0.015] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 grid place-items-center shadow-[0_0_24px_-6px_rgba(56,189,248,0.7)]">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold text-white tracking-tight">
            Factory Operations Command Center
          </div>
          <div className="text-[11px] text-slate-400">
            AI Powered Semiconductor Manufacturing Operations
          </div>
        </div>
      </div>

      {/* factory selector */}
      <button className="ml-4 h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-[12px] text-slate-200 hover:bg-white/[0.06]">
        <Factory className="h-4 w-4 text-sky-400" />
        <div className="text-left leading-tight">
          <div className="font-medium">DFW Semiconductor Fab</div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5" /> Richardson, Texas
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      <span className="ml-1 h-6 px-2 grid place-items-center rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] uppercase tracking-wider text-emerald-300 font-semibold">
        Production
      </span>

      <div className="flex-1" />

      {/* search */}
      <div className="relative w-[320px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <input
          placeholder="Search equipment, lots, recipes, work orders…"
          className="w-full h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] pl-9 pr-12 text-[12px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-400/40"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 h-5 px-1.5 grid place-items-center rounded text-[10px] text-slate-400 bg-white/[0.05] border border-white/[0.08]">
          ⌘K
        </kbd>
      </div>

      {/* live clock */}
      <div className="text-right leading-tight">
        <div className="text-[12px] text-slate-200 tabular-nums">
          {date} • {time} CT
        </div>
        <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </div>
      </div>

      <button className="relative h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.06]">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold grid place-items-center">
          5
        </span>
      </button>
      <button className="h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.06]">
        <HelpCircle className="h-4 w-4" />
      </button>
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center text-[11px] font-bold text-white">
        AO
      </div>
    </header>
  );
}

/* ---------- right operations panel pieces ---------- */

function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-300 font-semibold">{title}</div>
      {action}
    </div>
  );
}

function ActiveAlerts() {
  return (
    <GlassCard className="p-4">
      <CardHeader
        title={`Active Alerts & Events`}
        action={<button className="text-[11px] text-sky-300 hover:text-sky-200">View All (7)</button>}
      />
      <div className="space-y-2">
        {ALERTS.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] cursor-pointer transition"
          >
            <div className="h-8 w-8 shrink-0 grid place-items-center rounded-md bg-white/[0.03] border border-white/[0.06]">
              <a.icon className={`h-4 w-4 ${a.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] text-white font-medium truncate">{a.title}</div>
              <div className="text-[11px] text-slate-400 truncate">{a.sub}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] text-slate-500">{a.time}</div>
              <span className={`mt-1 inline-block text-[10px] px-1.5 py-[1px] rounded border ${a.sevClass}`}>
                {a.sev}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

function AiRecommendations() {
  return (
    <GlassCard className="p-4">
      <CardHeader
        title="AI Recommendations"
        action={
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-[1px] rounded bg-violet-500/10 text-violet-300 border border-violet-500/30">
              Pending Approval
            </span>
            <button className="text-[11px] text-sky-300 hover:text-sky-200">View All</button>
          </div>
        }
      />
      <div className="space-y-2">
        {RECS.map((r) => (
          <div key={r.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition">
            <div className="h-8 w-8 shrink-0 grid place-items-center rounded-md bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] text-white font-medium">{r.title}</div>
              <div className="text-[11px] text-slate-400">{r.sub}</div>
              <div className="text-[11px] text-emerald-300/80 mt-0.5">{r.impact}</div>
            </div>
            <button className="text-[11px] px-2.5 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-200 hover:bg-sky-500/15 hover:text-sky-200 hover:border-sky-400/40 transition shrink-0">
              Review
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ---------- factory overview block ---------- */

function FactoryOverview() {
  const [flow, setFlow] = useState(true);
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[13px] uppercase tracking-[0.16em] text-slate-200 font-semibold">
            Factory Overview
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Live production flow across 17 buildings · 1,482 tools online
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            Show Flow
            <button
              onClick={() => setFlow((v) => !v)}
              className={`relative h-5 w-9 rounded-full transition ${
                flow ? "bg-sky-500" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                  flow ? "left-[18px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
          <select className="h-8 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-200 px-2">
            <option>Production Areas</option>
            <option>Utilities</option>
            <option>Buildings</option>
          </select>
          <button className="h-8 w-8 grid place-items-center rounded-md bg-white/[0.03] border border-white/[0.06] text-slate-300 hover:bg-white/[0.06]">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8">
          <DigitalTwinViewport />
          {/* legend */}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
            {[
              ["Running", "#22c55e"],
              ["Idle", "#38bdf8"],
              ["Engineering", "#a78bfa"],
              ["Down", "#ef4444"],
              ["Maintenance", "#f59e0b"],
              ["Standby", "#64748b"],
            ].map(([l, c]) => (
              <div key={l} className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ background: c as string, boxShadow: `0 0 8px ${c}` }} />
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* production area status */}
        <div className="col-span-12 xl:col-span-4">
          <GlassCard className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-300 font-semibold">
                Production Area Status
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] text-[10px] uppercase tracking-wider text-slate-500 mb-1 px-1">
              <div>Area</div>
              <div className="text-right">WIP Lots</div>
              <div />
            </div>
            <div className="space-y-1">
              {PRODUCTION_AREAS.map((p) => (
                <div
                  key={p.i}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white/[0.04] transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="h-5 w-5 grid place-items-center rounded text-[10px] font-bold text-slate-300 bg-white/[0.04] border border-white/[0.06]">
                      {p.i}
                    </span>
                    <span className="text-[12px] text-slate-200 truncate">{p.name}</span>
                  </div>
                  <div className="text-[12px] tabular-nums text-slate-200">{p.wip}</div>
                  <span className="h-2 w-2 rounded-full" style={{ background: p.dot, boxShadow: `0 0 6px ${p.dot}` }} />
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between px-2">
                <span className="text-[12px] text-slate-300 font-semibold">Total WIP Lots</span>
                <span className="text-[13px] font-semibold text-white tabular-nums">2,260</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* secondary KPI row */}
      <div className="mt-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {[
          { icon: Truck, label: "AMHS Vehicles", value: "76", sub: "Active: 62" },
          { icon: Database, label: "FOUP Inventory", value: "2,640", sub: "in Stockers" },
          { icon: Gauge, label: "Lot Starts Today", value: "1,180", sub: "of 1,350 plan", pct: 87, color: "#38bdf8" },
          { icon: Gauge, label: "Lot Completions Today", value: "1,045", sub: "of 1,200 plan", pct: 87, color: "#22c55e" },
          { icon: Activity, label: "Avg Cycle Time", value: "46.4 days", sub: "+0.6 vs yesterday" },
        ].map((m, i) => (
          <GlassCard key={i} className="p-3.5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400 font-semibold">{m.label}</div>
            <div className="mt-2 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[20px] font-semibold text-white tabular-nums leading-none">{m.value}</div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">{m.sub}</div>
              </div>
              {m.pct ? (
                <Donut value={m.pct} color={m.color!} />
              ) : (
                <div className="h-10 w-10 rounded-md bg-white/[0.03] border border-white/[0.06] grid place-items-center">
                  <m.icon className="h-5 w-5 text-sky-300" />
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </GlassCard>
  );
}

/* ---------- bottom analytics ---------- */

function Bottlenecks() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Bottlenecks" action={<button className="text-[11px] text-sky-300">View Details</button>} />
      <div className="space-y-3">
        {BOTTLENECKS.map((b) => (
          <div key={b.rank}>
            <div className="flex items-center justify-between text-[12px] mb-1">
              <div className="flex items-center gap-2 text-slate-200">
                <span className="h-5 w-5 grid place-items-center rounded text-[10px] font-bold bg-white/[0.04] border border-white/[0.06] text-slate-300">
                  {b.rank}
                </span>
                {b.name}
              </div>
              <div className="text-slate-400 tabular-nums">
                {b.util}% <span className="text-slate-500">WIP {b.wip}</span>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                className={`h-full ${b.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${b.util}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ boxShadow: "0 0 12px rgba(239,68,68,0.45)" }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function EquipmentHealth() {
  const total = HEALTH_DIST.reduce((a, b) => a + b.value, 0);
  return (
    <GlassCard className="p-4">
      <CardHeader title="Equipment Health Distribution" />
      <div className="text-[10px] text-slate-500 mb-2">All Equipment</div>
      <div className="flex items-center gap-4">
        <div className="relative h-[120px] w-[120px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={HEALTH_DIST} dataKey="value" innerRadius={38} outerRadius={56} paddingAngle={2} stroke="none">
                {HEALTH_DIST.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="text-center leading-tight">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider">Total</div>
              <div className="text-[18px] font-semibold text-white tabular-nums">{total}</div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {HEALTH_DIST.map((d) => {
            const pct = Math.round((d.value / total) * 100);
            return (
              <div key={d.name} className="flex items-center text-[11.5px]">
                <span className="h-2 w-2 rounded-full mr-2" style={{ background: d.color }} />
                <span className="flex-1 text-slate-300">{d.name}</span>
                <span className="text-slate-400 tabular-nums w-8 text-right">{pct}%</span>
                <span className="text-slate-200 tabular-nums w-10 text-right">{d.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

function UtilityStatus() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Utility Status" />
      <div className="text-[10px] text-slate-500 mb-2">Live vs Optimal</div>
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 gap-y-1.5 text-[11.5px]">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Utility</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 text-right">Current</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 text-right">Optimal</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 text-right">Status</div>
        {UTILITIES.map((u) => (
          <>
            <div key={u.name + "n"} className="text-slate-200">{u.name}</div>
            <div className="text-slate-300 text-right tabular-nums">{u.cur}</div>
            <div className="text-slate-400 text-right tabular-nums">{u.opt}</div>
            <div className={`text-right flex items-center justify-end gap-1 ${u.color}`}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
              {u.status}
            </div>
          </>
        ))}
      </div>
    </GlassCard>
  );
}

function OeeTrend() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="OEE Trend (7 Days)" />
      <div className="h-[160px]">
        <ResponsiveContainer>
          <LineChart data={OEE_TREND} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="d" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} domain={[40, 100]} />
            <RTooltip
              contentStyle={{
                background: "rgba(15,23,42,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                fontSize: 11,
                color: "#e2e8f0",
              }}
            />
            <Line type="monotone" dataKey="oee" stroke="#38bdf8" strokeWidth={1.8} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

function PlanAttainment() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Production Plan Attainment" />
      <div className="text-[10px] text-slate-500 mb-2">This Month</div>
      <div className="flex items-center gap-4">
        <Donut value={92} color="#22c55e" />
        <div className="flex-1 grid grid-cols-2 gap-y-1.5 text-[12px]">
          <div className="text-slate-400">Plan</div>
          <div className="text-right text-slate-200 tabular-nums">36,000</div>
          <div className="text-slate-400">Actual</div>
          <div className="text-right text-slate-200 tabular-nums">33,120</div>
          <div className="text-slate-400">Variance</div>
          <div className="text-right text-rose-400 tabular-nums">-2,880</div>
        </div>
      </div>
      <div className="mt-3 text-[11px] text-emerald-300/80 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" /> On track to recover by EOM with current OEE
      </div>
    </GlassCard>
  );
}

function EventFeed() {
  return (
    <GlassCard className="p-4">
      <CardHeader
        title="Event Feed"
        action={<button className="text-[11px] text-sky-300">View All</button>}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2.5">
        {EVENTS.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-2.5 rounded-md bg-white/[0.025] border border-white/[0.05]"
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className={`h-1.5 w-1.5 rounded-full ${e.color}`} />
              {e.t}
            </div>
            <div className="text-[11.5px] text-slate-200 mt-1 leading-snug">{e.title}</div>
            <div className="text-[10px] text-slate-500 mt-1">{e.tag}</div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ---------- the page ---------- */

export default function FocCommandCenter() {
  return (
    <AppShell>
      <div className="min-h-screen bg-[#06080f] text-slate-200">
        {/* ambient background */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.06),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(99,102,241,0.05),_transparent_55%)]" />
        </div>

        <AppHeader />

        <div className="flex">
          <ModuleRail />

          <main className="flex-1 min-w-0 px-6 py-5 space-y-5">
            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
              {KPIS.map((k) => (
                <KpiCard key={k.id} k={k} />
              ))}
            </div>

            {/* Twin + right panel */}
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 xl:col-span-8">
                <FactoryOverview />
              </div>
              <div className="col-span-12 xl:col-span-4 space-y-5">
                <ActiveAlerts />
                <AiRecommendations />
              </div>
            </div>

            {/* analytics row */}
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-6 xl:col-span-3">
                <Bottlenecks />
              </div>
              <div className="col-span-12 md:col-span-6 xl:col-span-3">
                <EquipmentHealth />
              </div>
              <div className="col-span-12 md:col-span-6 xl:col-span-2">
                <UtilityStatus />
              </div>
              <div className="col-span-12 md:col-span-6 xl:col-span-2">
                <OeeTrend />
              </div>
              <div className="col-span-12 xl:col-span-2">
                <PlanAttainment />
              </div>
            </div>

            <EventFeed />

            {/* footer status bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-2 border-t border-white/[0.05]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  All data feeds connected
                </span>
                <span>MES • FDC • SPC • CMMS • EAM • Historian</span>
              </div>
              <div>Factory Operations Command Center · v1.0.0 · Build foundation</div>
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  );
}
