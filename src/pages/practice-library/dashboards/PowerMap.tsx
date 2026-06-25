import { Link } from "react-router-dom";
import {
  Zap, Bell, RefreshCw, Download, Activity, Map as MapIcon, BarChart3, TrendingUp,
  Gauge, Settings as SettingsIcon, Battery, Power, Cpu, Layers, FileText, PieChart,
  Plug, ChevronLeft, ChevronsUpDown, Calendar, Filter, ArrowRight, CircleDot, ShieldAlert,
  Fan, Wind,
} from "lucide-react";

/* ---------- Side rail (shared structure with Power Admin Console) ---------- */
const navGroups: { title: string; items: { label: string; icon: any; to?: string; active?: boolean; badge?: number }[] }[] = [
  { title: "Overview", items: [
    { label: "Power Overview", icon: Zap, to: "/practice-library/infrastructure-hybrid-platform/power-admin-console" },
    { label: "Power Map", icon: MapIcon, active: true },
    { label: "Alerts", icon: Bell, badge: 3, to: "/practice-library/infrastructure-hybrid-platform/power-alerts" },
  ]},
  { title: "Monitoring", items: [
    { label: "Real-time Monitoring", icon: Activity },
    { label: "Historical Analysis", icon: BarChart3 },
    { label: "Forecasting", icon: TrendingUp },
  ]},
  { title: "Management", items: [
    { label: "Capacity Management", icon: Gauge },
    { label: "Power Capping", icon: CircleDot },
    { label: "Workload Optimization", icon: Cpu },
    { label: "Policy Management", icon: Layers },
  ]},
  { title: "Infrastructure", items: [
    { label: "PDUs & UPS", icon: Battery },
    { label: "Generators", icon: Power },
    { label: "Switchgear", icon: Plug },
    { label: "Distribution", icon: Layers },
  ]},
  { title: "Reporting", items: [
    { label: "Reports", icon: FileText },
    { label: "Cost Analysis", icon: PieChart },
  ]},
  { title: "Settings", items: [
    { label: "Integrations", icon: SettingsIcon },
    { label: "Power Policies", icon: ShieldAlert },
  ]},
];

function Rail() {
  return (
    <aside className="w-60 shrink-0 bg-[#0b1220] border-r border-slate-800 text-slate-300 flex flex-col">
      <div className="px-4 py-4 flex items-center gap-2 border-b border-slate-800">
        <div className="h-7 w-7 rounded-full border-2 border-blue-500 grid place-items-center text-blue-400 text-xs font-bold">R</div>
        <div className="font-semibold text-white">RunOps</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 text-xs">
        {navGroups.map((g) => (
          <div key={g.title} className="mb-2">
            <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-slate-500">{g.title}</div>
            {g.items.map((it) => {
              const Icon = it.icon;
              const inner = (
                <div className={`mx-2 px-3 py-2 rounded flex items-center gap-2 cursor-pointer ${it.active ? "bg-blue-600/15 text-blue-300 ring-1 ring-blue-500/40" : "hover:bg-slate-800/60"}`}>
                  <Icon className="h-3.5 w-3.5" />
                  <span className="flex-1">{it.label}</span>
                  {it.badge && <span className="text-[10px] bg-rose-500 text-white rounded-full px-1.5">{it.badge}</span>}
                </div>
              );
              return it.to ? <Link key={it.label} to={it.to}>{inner}</Link> : <div key={it.label}>{inner}</div>;
            })}
          </div>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500 flex items-center gap-1 cursor-pointer">
        <ChevronLeft className="h-3.5 w-3.5" /> Collapse
      </div>
    </aside>
  );
}

/* ---------- Rack visualization ---------- */
type RackStatus = "ok" | "warn" | "high" | "crit";
function statusColor(s: RackStatus) {
  return s === "crit" ? "#ef4444" : s === "high" ? "#f59e0b" : s === "warn" ? "#eab308" : "#10b981";
}
function statusTextClass(s: RackStatus) {
  return s === "crit" ? "text-rose-400" : s === "high" ? "text-amber-400" : s === "warn" ? "text-yellow-400" : "text-emerald-400";
}
function statusOf(pct: number): RackStatus {
  if (pct >= 90) return "crit";
  if (pct >= 75) return "high";
  if (pct >= 50) return "warn";
  return "ok";
}

function Rack({ label, kw, pct }: { label: string; kw: number; pct: number }) {
  const s = statusOf(pct);
  const color = statusColor(s);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10px] text-slate-300">{label}</div>
      <div className="relative w-12 h-24 rounded-sm border border-slate-700 bg-slate-900 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="h-[6px] mx-1 my-[2px] rounded-sm" style={{ background: color, opacity: 0.85 - (i % 3) * 0.1 }} />
        ))}
      </div>
      <div className="text-[10px] text-slate-300 tabular-nums">{kw} kW</div>
      <div className={`text-[10px] tabular-nums font-medium ${statusTextClass(s)}`}>{pct}%</div>
    </div>
  );
}

function CracBox({ label, kw, pct }: { label: string; kw: number; pct: number }) {
  const s = statusOf(pct);
  return (
    <div className="border border-slate-700 rounded-sm bg-slate-900/60 flex flex-col items-center justify-center gap-1 py-3 px-4 h-full">
      <Fan className="h-5 w-5 text-slate-400" />
      <div className="text-[11px] text-slate-300">{label}</div>
      <div className="mt-2 text-[10px] text-slate-400">{kw} kW</div>
      <div className={`text-[11px] tabular-nums font-medium ${statusTextClass(s)}`}>{pct}%</div>
    </div>
  );
}

function FacilityBox({ title, mw, pct }: { title: string; mw: string; pct: number }) {
  return (
    <div className="border border-slate-700 rounded-sm bg-slate-900/40 p-2 w-[125px]">
      <div className="text-[11px] text-slate-300">{title}</div>
      <div className="text-[12px] font-semibold text-white mt-0.5">{mw} MW</div>
      <div className="text-[10px] text-emerald-400 mt-0.5">{pct}%</div>
    </div>
  );
}

function PduPill({ label, mw, pct }: { label: string; mw: string; pct: number }) {
  return (
    <div className="border border-emerald-500/40 rounded-sm bg-emerald-500/5 px-2 py-1 text-center w-[78px]">
      <div className="text-[10px] text-emerald-300 font-semibold">{label}</div>
      <div className="text-[9px] text-slate-300">{mw} MW</div>
      <div className="text-[10px] text-emerald-400 tabular-nums">{pct}%</div>
    </div>
  );
}

/* ---------- data ---------- */
const rowA = [
  { l: "A1", kw: 42, p: 42 }, { l: "A2", kw: 68, p: 58 }, { l: "A3", kw: 87, p: 73 },
  { l: "A4", kw: 102, p: 85 }, { l: "A5", kw: 118, p: 98 }, { l: "A6", kw: 65, p: 54 },
];
const rowB = [
  { l: "B1", kw: 45, p: 45 }, { l: "B2", kw: 61, p: 53 }, { l: "B3", kw: 79, p: 66 },
  { l: "B4", kw: 93, p: 78 }, { l: "B5", kw: 107, p: 89 }, { l: "B6", kw: 55, p: 48 },
];
const rowC = [
  { l: "C1", kw: 38, p: 40 }, { l: "C2", kw: 59, p: 55 }, { l: "C3", kw: 74, p: 62 },
  { l: "C4", kw: 88, p: 73 }, { l: "C5", kw: 96, p: 80 }, { l: "C6", kw: 49, p: 46 },
];

const powerByArea = [
  { name: "Data Hall A", kw: 480, pct: 82, color: "bg-amber-500" },
  { name: "Data Hall B", kw: 440, pct: 73, color: "bg-yellow-500" },
  { name: "Data Hall C", kw: 404, pct: 67, color: "bg-emerald-500" },
  { name: "Cooling Systems", kw: 167, pct: 71, color: "bg-yellow-500" },
  { name: "Facilities", kw: 89, pct: 45, color: "bg-emerald-500" },
];

const topRacks = [
  ["A5-R12", "18.7 kW", "98%", "text-rose-400"],
  ["A5-R11", "18.2 kW", "97%", "text-rose-400"],
  ["B5-R07", "17.6 kW", "94%", "text-rose-400"],
  ["A4-R15", "16.9 kW", "89%", "text-amber-400"],
  ["B4-R03", "16.4 kW", "88%", "text-amber-400"],
];

/* ---------- floor map ---------- */
function FloorMap() {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0a1020] p-4">
      {/* tabs and filters */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex rounded-md border border-slate-700 overflow-hidden text-xs">
          <button className="px-3 py-1.5 bg-blue-600/20 text-blue-300 border-r border-slate-700">FLOOR VIEW</button>
          <button className="px-3 py-1.5 text-slate-400 hover:text-slate-200">SINGLE LINE DIAGRAM</button>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          Floor
          <button className="border border-slate-700 rounded px-2 py-1 text-slate-200 flex items-center gap-1">Level 1 <ChevronsUpDown className="h-3 w-3" /></button>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          Overlay
          <button className="border border-slate-700 rounded px-2 py-1 text-slate-200 flex items-center gap-1">Power (kW) <ChevronsUpDown className="h-3 w-3" /></button>
        </div>
        <div className="ml-auto flex items-center gap-3 text-[11px] text-slate-300">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> &lt; 50%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-400" /> 50-75%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> 75-90%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> &gt; 90%</span>
          <button className="border border-slate-700 rounded px-2 py-1 text-slate-200 flex items-center gap-1"><Filter className="h-3 w-3" /> Filters</button>
        </div>
      </div>

      {/* floor box */}
      <div className="relative rounded border border-slate-700 bg-[#0b1426] px-6 py-4">
        <div className="text-center text-[10px] tracking-widest text-slate-500 mb-1">NORTH</div>

        <div className="grid grid-cols-[180px_1fr_120px] gap-4 items-start">
          {/* Left column - facilities */}
          <div className="space-y-3">
            <div className="border border-slate-700 rounded-sm bg-slate-900/40 p-2 text-center">
              <div className="text-[11px] text-slate-300">UTILITY</div>
              <div className="text-[11px] text-slate-300">ENTRANCE</div>
            </div>
            <FacilityBox title="MT Transformer" mw="1.25" pct={71} />
            <FacilityBox title="Switchgear" mw="1.18" pct={67} />
            <FacilityBox title="UPS Room A" mw="0.98" pct={65} />
            <FacilityBox title="UPS Room B" mw="1.02" pct={68} />
            <FacilityBox title="Battery Room" mw="1.01" pct={68} />
          </div>

          {/* Center - racks rows */}
          <div className="space-y-5">
            {/* Row A */}
            <div className="flex items-center gap-3">
              <PduPill label="PDU-A" mw="0.48" pct={80} />
              <div className="flex-1 grid grid-cols-6 gap-3 justify-items-center">
                {rowA.map((r) => <Rack key={r.l} label={r.l} kw={r.kw} pct={r.p} />)}
              </div>
            </div>
            {/* Row B */}
            <div className="flex items-center gap-3">
              <PduPill label="PDU-B" mw="0.44" pct={73} />
              <div className="flex-1 grid grid-cols-6 gap-3 justify-items-center">
                {rowB.map((r) => <Rack key={r.l} label={r.l} kw={r.kw} pct={r.p} />)}
              </div>
            </div>
            {/* Row C */}
            <div className="flex items-center gap-3">
              <PduPill label="PDU-C" mw="0.40" pct={66} />
              <div className="flex-1 grid grid-cols-6 gap-3 justify-items-center">
                {rowC.map((r) => <Rack key={r.l} label={r.l} kw={r.kw} pct={r.p} />)}
              </div>
            </div>
          </div>

          {/* Right column - CRAC + electrical */}
          <div className="space-y-3">
            <CracBox label="CRAC-1" kw={82} pct={72} />
            <CracBox label="CRAC-2" kw={85} pct={75} />
            <div className="border border-slate-700 rounded-sm bg-slate-900/40 py-3 px-2 text-center">
              <div className="text-[11px] text-slate-300">Electrical</div>
              <div className="text-[11px] text-slate-300">Room</div>
            </div>
            <div className="border border-slate-700 rounded-sm bg-slate-900/40 py-3 px-2 text-center flex flex-col items-center">
              <Zap className="h-4 w-4 text-amber-400" />
              <div className="text-[11px] text-slate-300 mt-1">EM Room</div>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] tracking-widest text-slate-500 mt-3">SOUTH</div>
      </div>

      {/* Bottom KPI strip */}
      <div className="mt-3 grid grid-cols-5 rounded border border-slate-800 bg-slate-900/40 divide-x divide-slate-800">
        {[
          ["Total Capacity", "13.5", "MW", "100%", ""],
          ["Available Capacity", "5.08", "MW", "38%", ""],
          ["Critical Load", "1.25", "MW", "15%", ""],
          ["Renewable Contribution", "28", "%", "2.35 MW", ""],
          ["Carbon Intensity", "284", "gCO₂e/kWh", "↓ 6.2% vs last month", "text-emerald-400"],
        ].map(([l, v, u, s, c], i) => (
          <div key={i} className="px-4 py-3">
            <div className="text-[11px] text-slate-400">{l}</div>
            <div className="text-xl font-bold text-white tabular-nums">{v} <span className="text-xs font-medium text-slate-400">{u}</span></div>
            <div className={`text-[11px] mt-1 ${c || "text-slate-400"}`}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- right panel widgets ---------- */
function SummaryStat({ label, value, unit, sub, barColor = "bg-blue-500", barPct = 60 }: any) {
  return (
    <div>
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className="text-xl font-bold text-white tabular-nums">{value} <span className="text-xs font-medium text-slate-400">{unit}</span></div>
      <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
      <div className="h-1 mt-1.5 rounded-full bg-slate-800 overflow-hidden"><div className={`h-full ${barColor}`} style={{ width: `${barPct}%` }} /></div>
    </div>
  );
}

/* ---------- page ---------- */
export default function PowerMap() {
  return (
    <div className="min-h-screen bg-[#070d1a] text-slate-200 flex">
      <Rail />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="px-6 py-4 border-b border-slate-800 flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2"><MapIcon className="h-5 w-5 text-blue-400" /> Power Map</h1>
            <p className="text-xs text-slate-400">Real-time power distribution across data center infrastructure</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <button className="relative h-8 w-8 grid place-items-center border border-slate-700 rounded">
              <Bell className="h-4 w-4 text-slate-300" />
              <span className="absolute -top-1 -right-1 text-[10px] bg-rose-500 text-white rounded-full px-1">3</span>
            </button>
            <button className="border border-slate-700 rounded px-2 py-1.5 flex items-center gap-1 text-slate-200">DC1 - Ashburn <ChevronsUpDown className="h-3 w-3" /></button>
            <button className="border border-slate-700 rounded px-2 py-1.5 flex items-center gap-1 text-slate-200"><Calendar className="h-3 w-3" /> Last 15 minutes</button>
            <button className="h-8 w-8 grid place-items-center border border-slate-700 rounded"><RefreshCw className="h-4 w-4 text-slate-300" /></button>
            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-1"><Download className="h-3 w-3" /> Export</button>
          </div>
        </header>

        <div className="grid grid-cols-[1fr_320px] gap-4 p-6">
          {/* main map */}
          <FloorMap />

          {/* right column */}
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white mb-3">Power Summary</div>
              <div className="grid grid-cols-2 gap-4">
                <SummaryStat label="Total Facility Load" value="8.42" unit="MW" sub="62% of 13.5 MW" barColor="bg-blue-500" barPct={62} />
                <SummaryStat label="IT Load" value="6.21" unit="MW" sub="73% of 8.5 MW" barColor="bg-emerald-500" barPct={73} />
                <SummaryStat label="Non-IT Load" value="2.21" unit="MW" sub="41% of 5.0 MW" barColor="bg-purple-500" barPct={41} />
                <div>
                  <div className="text-[11px] text-slate-400">Power Usage Effectiveness</div>
                  <div className="text-xl font-bold text-white tabular-nums">1.38</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Target: &lt; 1.50 <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 align-middle ml-1" /></div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white mb-3">Power by Area <span className="text-[11px] text-slate-400 font-normal">(kW)</span></div>
              <div className="space-y-3">
                {powerByArea.map((a) => (
                  <div key={a.name}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">{a.name}</span>
                      <span className="text-slate-300 tabular-nums">{a.kw} kW <span className="text-slate-500 ml-1">{a.pct}%</span></span>
                    </div>
                    <div className="h-1.5 mt-1 rounded-full bg-slate-800 overflow-hidden"><div className={`h-full ${a.color}`} style={{ width: `${a.pct}%` }} /></div>
                  </div>
                ))}
                <button className="text-[11px] text-blue-400 flex items-center gap-1 ml-auto">View All Areas <ArrowRight className="h-3 w-3" /></button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-white">Top High Load Racks</div>
                <button className="text-[11px] text-blue-400 flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></button>
              </div>
              <div className="divide-y divide-slate-800 text-xs">
                {topRacks.map(([id, kw, pct, c]) => (
                  <div key={id} className="flex items-center justify-between py-1.5">
                    <span className="text-slate-200">{id}</span>
                    <span className="text-slate-400 tabular-nums">{kw}</span>
                    <span className={`tabular-nums font-medium ${c}`}>{pct}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white mb-3">Legend</div>
              <div className="grid grid-cols-2 gap-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-2"><div className="h-4 w-3 border border-slate-600 rounded-sm" /> Rack</div>
                <div className="flex items-center gap-2"><div className="h-[2px] w-6 bg-emerald-500" /> Power Feed</div>
                <div className="flex items-center gap-2"><Plug className="h-3 w-3 text-emerald-400" /> PDU</div>
                <div className="flex items-center gap-2"><div className="h-[2px] w-6 border-t border-dashed border-emerald-400" /> Redundant Feed</div>
                <div className="flex items-center gap-2"><Wind className="h-3 w-3 text-slate-400" /> CRAC</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
