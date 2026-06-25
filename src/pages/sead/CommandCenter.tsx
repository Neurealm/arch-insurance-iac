import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronDown,
  CircleDot,
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
  Zap,
  Wrench,
  Bot,
  Gauge,
  FileBarChart2,
  Building2,
  Network as NetIcon,
  Boxes,
  Cpu,
  FlaskConical,
  Workflow,
  HardHat,
  ScrollText,
  ShieldCheck,
  TriangleAlert,
  CheckCircle2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import { AppShell } from "@/components/eoc/AppShell";
import { DigitalTwinViewport } from "@/features/foc-twin/DigitalTwinViewport";
import { SelectionDrawer } from "@/features/foc-twin/SelectionDrawer";

/* =====================================================================
   Factory Operations Command Center — Texas Instruments DFW Fab
   Executive AI Operations Digital Twin
   ===================================================================== */

/* ---------- mock data ---------- */

const KPIS = [
  {
    id: "health",
    label: "Factory Health Index",
    value: 87,
    suffix: "/100",
    caption: "Good",
    captionColor: "text-emerald-400",
    trend: "▲ 3 pts vs yesterday",
    spark: [82, 84, 81, 85, 84, 87, 87],
    donut: 87,
    donutColor: "#22c55e",
  },
  {
    id: "pci",
    label: "Productive Capacity Index",
    value: 82,
    suffix: "/100",
    caption: "Good",
    captionColor: "text-emerald-400",
    trend: "▲ 4 pts vs yesterday",
    spark: [76, 78, 79, 80, 81, 81, 82],
    donut: 82,
    donutColor: "#22c55e",
  },
  {
    id: "oee",
    label: "OEE",
    value: 78.6,
    suffix: "%",
    trend: "▲ 2.1% vs yesterday",
    spark: [74, 75, 76, 76, 77, 78, 78.6],
  },
  {
    id: "tp",
    label: "Total Throughput (Wafers)",
    value: 52340,
    suffix: " wafers/day",
    trend: "▲ 3.1% vs target (51,000)",
    spark: [50100, 50800, 51200, 51600, 51900, 52150, 52340],
  },
  {
    id: "wip",
    label: "WIP Lots",
    value: 8742,
    suffix: "",
    trend: "▲ 1.2% vs yesterday",
    spark: [8500, 8550, 8600, 8650, 8680, 8720, 8742],
  },
  {
    id: "safety",
    label: "Safety",
    value: 0,
    suffix: "",
    caption: "Recordable Events",
    sub: "This Month",
    icon: ShieldCheck,
  },
];

const AI_OBSERVATIONS = [
  { id: 1, icon: AlertTriangle, color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/30", title: "Maintenance opportunity detected on ETCH-217", sub: "Health degradation pattern observed", time: "10 min ago" },
  { id: 2, icon: Info, color: "text-sky-300", bg: "bg-sky-500/10", border: "border-sky-500/30", title: "High queue building at CMP Area", sub: "Queue time > threshold for 18 min", time: "18 min ago" },
  { id: 3, icon: Info, color: "text-sky-300", bg: "bg-sky-500/10", border: "border-sky-500/30", title: "Metrology tool utilization above normal", sub: "Increased load on MET-217, MET-219", time: "25 min ago" },
  { id: 4, icon: Info, color: "text-sky-300", bg: "bg-sky-500/10", border: "border-sky-500/30", title: "Utility system operating optimally", sub: "All critical utilities within normal range", time: "32 min ago" },
  { id: 5, icon: Info, color: "text-sky-300", bg: "bg-sky-500/10", border: "border-sky-500/30", title: "3 new lots started in LITH-021", sub: "Monitor for cycle time impact", time: "45 min ago" },
  { id: 6, icon: CheckCircle2, color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30", title: "Dispatch plan on track", sub: "All priority lots meeting commitments", time: "1 hr ago" },
];

const MAINTENANCE_OPS = [
  { id: "ETCH-217", name: "ETCH-217 (Metal Etch)", priority: "High", priorityColor: "bg-amber-500/15 text-amber-300 border-amber-500/40", icon: AlertTriangle, iconColor: "text-amber-300", window: "Tonight 10:00 PM – 2:00 AM", windowLabel: "Optimal maintenance window:", impact: "Increased risk of unplanned downtime", impactLabel: "Impact if delayed:", action: "Recommended", actionColor: "text-emerald-300" },
  { id: "CMP-038", name: "CMP-038 (Polish)", priority: "Medium", priorityColor: "bg-sky-500/15 text-sky-300 border-sky-500/40", icon: Info, iconColor: "text-sky-300", window: "Tomorrow 2:00 AM – 6:00 AM", windowLabel: "Optimal window:", impact: "Yield risk increasing", impactLabel: "Impact if delayed:" },
  { id: "PVD-142", name: "PVD-142 (TiN Deposition)", priority: "Low", priorityColor: "bg-slate-500/15 text-slate-300 border-slate-500/40", icon: Info, iconColor: "text-slate-300", window: "Next Week", windowLabel: "Optimal window:", impact: "Minimal", impactLabel: "Impact if delayed:" },
  { id: "DIFF-011", name: "DIFF-011 (Diffusion)", priority: "Low", priorityColor: "bg-slate-500/15 text-slate-300 border-slate-500/40", icon: Info, iconColor: "text-slate-300", window: "Next Week", windowLabel: "Optimal window:", impact: "Minimal", impactLabel: "Impact if delayed:" },
];

const PRODUCTION_FAMILIES = [
  { family: "Logic 28nm", wafers: 18420, pct: 35.2 },
  { family: "Analog 40nm", wafers: 12850, pct: 24.6 },
  { family: "Power 65nm", wafers: 9760, pct: 18.6 },
  { family: "Mixed Signal 90nm", wafers: 6240, pct: 11.9 },
  { family: "Other", wafers: 5070, pct: 9.7 },
];

const EQUIPMENT_HEALTH = [
  { name: "Good (80-100)", value: 798, pct: 63.9, color: "#22c55e" },
  { name: "Fair (60-79)", value: 312, pct: 25.0, color: "#f59e0b" },
  { name: "Poor (<60)", value: 98, pct: 7.9, color: "#ef4444" },
  { name: "Critical (<40)", value: 40, pct: 3.2, color: "#dc2626" },
];

const UTILITY_STATUS = [
  { name: "Electricity", status: "Good", util: 67, color: "#22c55e" },
  { name: "Nitrogen", status: "Good", util: 65, color: "#22c55e" },
  { name: "Chilled Water", status: "Good", util: 71, color: "#22c55e" },
  { name: "DI Water", status: "Good", util: 58, color: "#22c55e" },
  { name: "Vacuum", status: "Good", util: 63, color: "#22c55e" },
  { name: "Compressed Air", status: "Good", util: 60, color: "#22c55e" },
];

const QUALITY_KPIS = [
  { label: "First Pass Yield", value: "98.7", suffix: "%", trend: [97.8, 98.1, 98.3, 98.4, 98.5, 98.6, 98.7] },
  { label: "Defect Density", value: "0.23", suffix: "/cm²", trend: [0.31, 0.29, 0.27, 0.26, 0.25, 0.24, 0.23] },
  { label: "Escapes", value: "2", suffix: "", trend: [5, 4, 4, 3, 3, 2, 2] },
  { label: "Customer Complaints", value: "0", suffix: "", trend: [1, 1, 0, 0, 0, 0, 0] },
];

const BUSINESS_PRIORITIES = [
  { rank: 1, label: "Customer Commitments", status: "On Track", statusColor: "text-emerald-400" },
  { rank: 2, label: "High Value Product Mix", status: "On Track", statusColor: "text-emerald-400" },
  { rank: 3, label: "Yield Improvement", status: "On Track", statusColor: "text-emerald-400" },
  { rank: 4, label: "Cost Efficiency", status: "On Track", statusColor: "text-emerald-400" },
  { rank: 5, label: "Capacity Optimization", status: "At Risk", statusColor: "text-amber-400" },
];

const PENDING_DECISIONS = [
  { icon: AlertTriangle, color: "text-amber-300", bg: "bg-amber-500/10", title: "Maintenance Window Recommendation", target: "ETCH-217", due: "Due in 1h 35m" },
  { icon: Cpu, color: "text-sky-300", bg: "bg-sky-500/10", title: "Process Change Evaluation", target: "CMP Area", due: "Due in 2h 10m" },
  { icon: Workflow, color: "text-violet-300", bg: "bg-violet-500/10", title: "Capacity Reallocation Proposal", target: "Back End Area 2", due: "Due in 4h 20m" },
];

const ALERT_COUNTS = [
  { label: "Critical", count: 2, color: "text-rose-400", sub: "Require immediate action" },
  { label: "High", count: 3, color: "text-amber-300", sub: "Need attention" },
  { label: "Medium", count: 5, color: "text-yellow-300", sub: "Monitor closely" },
  { label: "Low", count: 7, color: "text-sky-300", sub: "Informational" },
];

const RECENT_EVENTS = [
  { t: "10:19 AM", title: "MET-217 vibration trend change detected", tag: "Monitoring", tagColor: "text-amber-300" },
  { t: "10:15 AM", title: "Work Order WO-2025-05-217 created", tag: "Maintenance", tagColor: "text-sky-300" },
  { t: "10:12 AM", title: "Bay 3 AMHS delay threshold exceeded", tag: "Dispatch", tagColor: "text-amber-300" },
  { t: "10:08 AM", title: "Chiller Loop B flow deviation", tag: "Facilities", tagColor: "text-amber-300" },
];

/* ---------- atoms ---------- */

function GlassCard({ children, className = "", onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={
        "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl " +
        "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-30px_rgba(0,0,0,0.6)] " +
        className
      }
    >
      {children}
    </div>
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

function format(n: number) {
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n.toFixed(0);
}

function Spark({ data, color = "#38bdf8" }: { data: number[]; color?: string }) {
  const pts = data.map((y, i) => ({ i, y }));
  const id = `sp-${color.replace("#", "")}`;
  return (
    <div className="h-9 w-full">
      <ResponsiveContainer>
        <AreaChart data={pts} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="y" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} dot={false} isAnimationActive />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Donut({ value, color, size = 72 }: { value: number; color: string; size?: number }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const v = useCountUp(value);
  const off = c - (v / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color}
          strokeWidth="6" fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        <div>
          <div className="text-[18px] font-semibold text-white tabular-nums">{Math.round(v)}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">/100</div>
        </div>
      </div>
    </div>
  );
}

function CardHeader({ title, action, sub }: { title: string; action?: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-200 font-semibold flex items-center gap-1.5">
          {title}
          <Info className="h-3 w-3 text-slate-500" />
        </div>
        {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
      {action}
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

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <GlassCard className="p-4 h-full hover:border-white/10 transition-colors">
        <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold flex items-center gap-1.5">
          {k.label}
          <Info className="h-2.5 w-2.5 text-slate-600" />
        </div>

        <div className="mt-3 flex items-start gap-3">
          {k.donut ? (
            <>
              <Donut value={k.donut} color={k.donutColor} size={68} />
              <div className="min-w-0 flex-1 mt-1">
                <div className={`text-[14px] font-semibold ${k.captionColor}`}>{k.caption}</div>
                <div className="text-[11px] text-emerald-300/80 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {k.trend.replace(/[▲▼]\s?/, "")}
                </div>
              </div>
            </>
          ) : k.id === "safety" ? (
            <div className="flex items-start justify-between w-full">
              <div>
                <div className="text-[32px] font-semibold text-white tabular-nums leading-none">0</div>
                <div className="text-[11px] text-slate-300 mt-2">Recordable Events</div>
                <div className="text-[11px] text-slate-500">This Month</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 grid place-items-center">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1">
                <div className="text-[28px] leading-none font-semibold text-white tabular-nums">
                  {valueDisplay}
                </div>
                <div className="text-[12px] text-slate-400 truncate">{k.suffix}</div>
              </div>
              <div className="mt-2 text-[11px] flex items-center gap-1 text-emerald-300/80">
                {k.trend.includes("▼") ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                <span className="truncate">{k.trend.replace(/[▲▼]\s?/, "")}</span>
              </div>
              <div className="mt-1 -mx-1">
                <Spark data={k.spark} color="#38bdf8" />
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ---------- left rail ---------- */

const RAIL = [
  { icon: LayoutGrid, label: "Command Center", active: true },
  { icon: Boxes, label: "Digital Twin", to: "/sead/equipment-health-intelligence" },
  { icon: Building2, label: "Fab Areas" },
  { icon: Factory, label: "Equipment" },
  { icon: Workflow, label: "Production" },
  { icon: Wrench, label: "Maintenance" },
  { icon: Gauge, label: "Yield" },
  { icon: Zap, label: "Utilities" },
  { icon: Bot, label: "AI Insights" },
  { icon: HardHat, label: "Engineering" },
  { icon: FileBarChart2, label: "Reports" },
  { icon: Bell, label: "Alerts" },
  { icon: SettingsIcon, label: "Administration" },
];

function ModuleRail() {
  const navigate = useNavigate();
  return (
    <aside className="w-[84px] shrink-0 border-r border-white/[0.06] bg-white/[0.015] py-3 flex flex-col items-center gap-0.5">
      {RAIL.map((r: any) => (
        <button
          key={r.label}
          onClick={() => r.to && navigate(r.to)}
          className={`group relative w-[72px] py-2.5 rounded-lg flex flex-col items-center gap-1 transition ${
            r.active
              ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30 shadow-[0_0_24px_-12px_rgba(56,189,248,0.8)]"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <r.icon className={`h-[18px] w-[18px] transition ${r.active ? "" : "group-hover:drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]"}`} />
          <span className="text-[9.5px] leading-tight text-center px-1">{r.label}</span>
          {r.active && (
            <motion.span
              layoutId="rail-indicator"
              className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]"
            />
          )}
        </button>
      ))}
    </aside>
  );
}

/* ---------- top header ---------- */

function AppHeader() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <header className="flex items-center gap-4 px-6 h-[72px] border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 grid place-items-center shadow-[0_0_28px_-6px_rgba(244,63,94,0.7)] font-black text-white text-[15px] tracking-tight">
          TI
        </div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Texas Instruments</div>
          <div className="text-[16px] font-semibold text-white tracking-tight">
            Factory Operations Command Center
          </div>
          <div className="text-[11px] text-slate-400">
            Real-time Operational Intelligence for DFW Semiconductor Manufacturing
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="relative w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <input
          placeholder="Search tools, lots, recipes, work orders…"
          className="w-full h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] pl-9 pr-12 text-[12px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-400/40"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 h-5 px-1.5 grid place-items-center rounded text-[10px] text-slate-400 bg-white/[0.05] border border-white/[0.08]">⌘K</kbd>
      </div>

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
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </div>
      </div>

      <button className="relative h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.06]">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold grid place-items-center">5</span>
      </button>
      <button className="h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.06]">
        <HelpCircle className="h-4 w-4" />
      </button>
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center text-[11px] font-bold text-white">AO</div>
    </header>
  );
}

/* ---------- Factory Overview (3D twin) ---------- */

function FactoryOverview() {
  return (
    <GlassCard className="p-4">
      <CardHeader
        title="Factory Overview"
        action={
          <div className="flex items-center gap-2">
            <select className="h-7 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-200 px-2">
              <option>All Areas</option>
              <option>Front End</option>
              <option>Back End</option>
              <option>Utilities</option>
            </select>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Good (80-100)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Fair (60-79)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Poor (&lt;60)</span>
            </div>
            <button className="h-7 w-7 grid place-items-center rounded-md bg-white/[0.03] border border-white/[0.06] text-slate-300 hover:bg-white/[0.06]">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        }
      />
      <DigitalTwinViewport />
      <div className="mt-2 text-[10.5px] text-slate-500 flex items-center gap-1.5">
        <Info className="h-3 w-3" /> Click on an area to drill down
      </div>
    </GlassCard>
  );
}

/* ---------- AI Observation Feed ---------- */

function AiObservationFeed() {
  return (
    <GlassCard className="p-4 h-full flex flex-col">
      <CardHeader title="AI Observation Feed" action={<button className="text-[11px] text-sky-300 hover:text-sky-200">View All</button>} />
      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {AI_OBSERVATIONS.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] cursor-pointer transition border border-transparent hover:border-white/[0.05]"
          >
            <div className={`h-8 w-8 shrink-0 grid place-items-center rounded-md ${o.bg} border ${o.border}`}>
              <o.icon className={`h-4 w-4 ${o.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] text-white font-medium">{o.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{o.sub}</div>
            </div>
            <div className="text-[10px] text-slate-500 shrink-0 whitespace-nowrap">{o.time}</div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ---------- Maintenance Opportunities ---------- */

function MaintenanceOpportunities() {
  return (
    <GlassCard className="p-4 h-full flex flex-col">
      <CardHeader
        title="Maintenance Opportunities"
        sub="AI Prioritized"
        action={<button className="text-[11px] text-sky-300 hover:text-sky-200">View All (7)</button>}
      />
      <div className="space-y-2 flex-1 overflow-y-auto">
        {MAINTENANCE_OPS.map((m) => (
          <div key={m.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition">
            <div className="flex items-start gap-2.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${m.priorityColor}`}>{m.priority}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] text-white font-semibold">{m.name}</div>
              </div>
              {m.action && <span className={`text-[10px] ${m.actionColor}`}>{m.action}</span>}
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              <span className="text-slate-500">{m.windowLabel} </span>{m.window}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              <span className="text-slate-500">{m.impactLabel} </span>{m.impact}
            </div>
            <div className="mt-2 flex justify-end">
              <button className="text-[11px] px-2.5 h-6 rounded-md bg-white/[0.04] border border-white/[0.08] text-sky-200 hover:bg-sky-500/15 hover:border-sky-400/40 transition">
                Review
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-white/[0.05] flex items-center justify-between">
        <span className="text-[10.5px] text-slate-500">AI continuously evaluates 1,248 assets</span>
        <button className="text-[10.5px] text-sky-300 hover:text-sky-200">View Methodology</button>
      </div>
    </GlassCard>
  );
}

/* ---------- Production Summary ---------- */

function ProductionSummary() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Production Summary" action={<button className="text-[11px] text-sky-300">View Details</button>} />
      <div className="text-[10px] text-slate-500 mb-2">Top Products by Throughput</div>
      <div className="grid grid-cols-[1fr_auto_auto_60px] gap-x-3 gap-y-1.5 text-[11.5px]">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Product Family</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 text-right">Wafers/Day</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 text-right">% of Total</div>
        <div />
        {PRODUCTION_FAMILIES.map((p) => (
          <div key={p.family} className="contents">
            <div className="text-slate-200">{p.family}</div>
            <div className="text-slate-200 text-right tabular-nums">{p.wafers.toLocaleString()}</div>
            <div className="text-slate-300 text-right tabular-nums">{p.pct.toFixed(1)}%</div>
            <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${p.pct * 2.5}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-400"
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ---------- Equipment Health ---------- */

function EquipmentHealthSummary() {
  const total = EQUIPMENT_HEALTH.reduce((a, b) => a + b.value, 0);
  return (
    <GlassCard className="p-4">
      <CardHeader title="Equipment Health Summary" action={<button className="text-[11px] text-sky-300">View Details</button>} />
      <div className="flex items-center gap-3">
        <div className="relative h-[120px] w-[120px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={EQUIPMENT_HEALTH} dataKey="value" innerRadius={38} outerRadius={56} paddingAngle={2} stroke="none">
                {EQUIPMENT_HEALTH.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center pointer-events-none text-center">
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider">Total</div>
              <div className="text-[18px] font-semibold text-white tabular-nums">{total.toLocaleString()}</div>
              <div className="text-[9px] text-slate-500">Assets</div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {EQUIPMENT_HEALTH.map((d) => (
            <div key={d.name} className="flex items-center text-[11.5px]">
              <span className="h-2 w-2 rounded-full mr-2" style={{ background: d.color }} />
              <span className="flex-1 text-slate-300">{d.name}</span>
              <span className="text-slate-200 tabular-nums w-10 text-right">{d.value}</span>
              <span className="text-slate-400 tabular-nums w-12 text-right">({d.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

/* ---------- Utility Status ---------- */

function UtilityStatusCard() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Utility Status" sub="Live vs Optimal" />
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1.5 text-[11.5px]">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Utility</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Status</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 text-right">Utilization</div>
        {UTILITY_STATUS.map((u) => (
          <div key={u.name} className="contents">
            <div className="text-slate-200">{u.name}</div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: u.color, boxShadow: `0 0 6px ${u.color}` }} />
              {u.status}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-slate-300 tabular-nums">{u.util}%</span>
              <div className="w-12 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${u.util}%` }}
                  transition={{ duration: 1 }}
                  className="h-full"
                  style={{ background: u.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ---------- Quality Summary ---------- */

function QualitySummary() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Quality Summary" action={<button className="text-[11px] text-sky-300">View Details</button>} />
      <div className="space-y-2">
        {QUALITY_KPIS.map((q) => (
          <div key={q.label} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[11.5px] text-slate-300">{q.label}</div>
            </div>
            <div className="text-[13px] text-white font-semibold tabular-nums">
              {q.value}<span className="text-[10px] text-slate-500 ml-0.5">{q.suffix}</span>
            </div>
            <div className="w-[70px]"><Spark data={q.trend} color="#22c55e" /></div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ---------- Business Priorities ---------- */

function BusinessPriorities() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Business Priorities" action={<button className="text-[11px] text-sky-300">View Details</button>} />
      <div className="space-y-2">
        {BUSINESS_PRIORITIES.map((b) => (
          <div key={b.rank} className="flex items-center gap-3 py-1">
            <span className="h-6 w-6 grid place-items-center rounded-md text-[11px] font-bold text-slate-300 bg-white/[0.04] border border-white/[0.06]">
              {b.rank}
            </span>
            <span className="flex-1 text-[12px] text-slate-200">{b.label}</span>
            <span className={`text-[11px] font-medium ${b.statusColor}`}>{b.status}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ---------- Pending AI Decisions ---------- */

function PendingDecisions() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Pending AI Decisions" action={<button className="text-[11px] text-sky-300">View All (3)</button>} />
      <div className="space-y-2">
        {PENDING_DECISIONS.map((d, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition border border-transparent hover:border-white/[0.05]">
            <div className={`h-8 w-8 shrink-0 grid place-items-center rounded-md ${d.bg} border border-white/[0.06]`}>
              <d.icon className={`h-4 w-4 ${d.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] text-white font-medium">{d.title}</div>
              <div className="text-[10.5px] text-slate-400">{d.target}</div>
            </div>
            <div className="text-[10px] text-slate-400 text-right">{d.due}</div>
            <button className="text-[11px] px-2.5 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] text-sky-200 hover:bg-sky-500/15 hover:border-sky-400/40 transition">
              Review
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ---------- Active Alerts ---------- */

function ActiveAlertsPanel() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Active Alerts" action={<button className="text-[11px] text-sky-300">View All (5)</button>} />
      <div className="grid grid-cols-4 gap-2">
        {ALERT_COUNTS.map((a) => (
          <motion.div
            key={a.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]"
          >
            <div className={`text-[28px] font-bold tabular-nums ${a.color}`}>{a.count}</div>
            <div className={`text-[10.5px] font-semibold ${a.color}`}>{a.label}</div>
            <div className="text-[9.5px] text-slate-500 mt-1 leading-tight">{a.sub}</div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ---------- Recent Events ---------- */

function RecentEventsPanel() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Recent Events" action={<button className="text-[11px] text-sky-300">View All</button>} />
      <div className="space-y-1.5">
        {RECENT_EVENTS.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-1.5 px-1 text-[11.5px]"
          >
            <div className="text-slate-400 tabular-nums w-[60px]">{e.t}</div>
            <div className="text-slate-200 truncate">{e.title}</div>
            <div className={`text-[10.5px] ${e.tagColor}`}>{e.tag}</div>
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
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.06),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(99,102,241,0.05),_transparent_55%)]" />
        </div>

        <AppHeader />

        <div className="flex">
          <ModuleRail />

          <main className="flex-1 min-w-0 px-5 py-4 space-y-4">
            {/* KPI strip: 6 cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {KPIS.map((k) => <KpiCard key={k.id} k={k} />)}
            </div>

            {/* Row 2: Factory Overview | AI Observation Feed | Maintenance Opportunities */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-5"><FactoryOverview /></div>
              <div className="col-span-12 md:col-span-6 xl:col-span-4"><AiObservationFeed /></div>
              <div className="col-span-12 md:col-span-6 xl:col-span-3"><MaintenanceOpportunities /></div>
            </div>

            {/* Row 3: Production | Equipment | Utility | Quality | Business */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6 xl:col-span-3"><ProductionSummary /></div>
              <div className="col-span-12 md:col-span-6 xl:col-span-3"><EquipmentHealthSummary /></div>
              <div className="col-span-12 md:col-span-4 xl:col-span-2"><UtilityStatusCard /></div>
              <div className="col-span-12 md:col-span-4 xl:col-span-2"><QualitySummary /></div>
              <div className="col-span-12 md:col-span-4 xl:col-span-2"><BusinessPriorities /></div>
            </div>

            {/* Row 4: Pending Decisions | Active Alerts | Recent Events */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6 xl:col-span-5"><PendingDecisions /></div>
              <div className="col-span-12 md:col-span-6 xl:col-span-3"><ActiveAlertsPanel /></div>
              <div className="col-span-12 xl:col-span-4"><RecentEventsPanel /></div>
            </div>

            {/* footer status */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-2 border-t border-white/[0.05]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  All data feeds connected
                </span>
                <span>MES • FDC • SPC • CMMS • EAM • Historian • SECS/GEM • EDA • APC</span>
              </div>
              <div>Texas Instruments · DFW Fab · v1.2.0</div>
            </div>
          </main>
        </div>
        <SelectionDrawer />
      </div>
    </AppShell>
  );
}
