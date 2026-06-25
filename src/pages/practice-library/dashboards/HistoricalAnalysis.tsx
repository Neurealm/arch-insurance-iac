import { Link } from "react-router-dom";
import {
  Zap, Bell, RefreshCw, Download, Activity, Map as MapIcon, BarChart3, TrendingUp,
  Gauge, Settings as SettingsIcon, Battery, Power, Cpu, Layers, FileText, PieChart,
  Plug, ChevronLeft, ChevronsUpDown, Calendar, Filter, Save, Brain, Sparkles,
  Lightbulb, CircleDot, ShieldAlert, Droplets, Leaf, DollarSign,
} from "lucide-react";

const navGroups: { title: string; items: { label: string; icon: any; to?: string; active?: boolean; badge?: number }[] }[] = [
  { title: "Overview", items: [
    { label: "Power Overview", icon: Zap, to: "/practice-library/infrastructure-hybrid-platform/power-admin-console" },
    { label: "Power Map", icon: MapIcon, to: "/practice-library/infrastructure-hybrid-platform/power-map" },
    { label: "Alerts", icon: Bell, badge: 3, to: "/practice-library/infrastructure-hybrid-platform/power-alerts" },
  ]},
  { title: "Monitoring", items: [
    { label: "Real-time Monitoring", icon: Activity, to: "/practice-library/infrastructure-hybrid-platform/real-time-monitoring" },
    { label: "Historical Analysis", icon: BarChart3, active: true },
    { label: "Forecasting", icon: TrendingUp, to: "/practice-library/infrastructure-hybrid-platform/forecasting" },
  ]},
  { title: "Management", items: [
    { label: "Capacity Management", icon: Gauge, to: "/practice-library/infrastructure-hybrid-platform/capacity-management" },
    { label: "Power Capping", icon: CircleDot, to: "/practice-library/infrastructure-hybrid-platform/power-capping" },
    { label: "Workload Optimization", icon: Cpu },
    { label: "Policy Management", icon: Layers },
  ]},
  { title: "Infrastructure", items: [
    { label: "PDUs & UPS", icon: Battery },
    { label: "Generators", icon: Power },
    { label: "Switchgear", icon: Plug },
    { label: "Distribution", icon: Layers },
  ]},
  { title: "Analytics", items: [
    { label: "AI Optimization", icon: Brain, to: "/practice-library/infrastructure-hybrid-platform/ai-optimization" },
    { label: "Scenarios", icon: Sparkles },
    { label: "Recommendations", icon: Lightbulb },
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

/* ---------- helpers ---------- */
function Sparkline({ color = "#3b82f6", seed = 0 }: { color?: string; seed?: number }) {
  const pts = Array.from({ length: 40 }, (_, i) =>
    [i * 5, 20 + Math.sin(i * 0.5 + seed) * 7 + Math.cos(i * 0.2 + seed) * 4].join(",")
  ).join(" ");
  return (
    <svg viewBox="0 0 200 40" className="w-full h-10">
      <polyline points={pts} stroke={color} strokeWidth="1.3" fill="none" />
    </svg>
  );
}

function KpiCard({ icon: Icon, color, label, value, unit, sub, subColor = "text-emerald-400", spark }: any) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
      <div className="flex items-center gap-2">
        <div className={`h-8 w-8 rounded grid place-items-center ${color}`}><Icon className="h-4 w-4" /></div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <div className="text-xl font-bold text-white">{value}</div>
        {unit && <div className="text-xs text-slate-400">{unit}</div>}
      </div>
      <div className={`text-[11px] ${subColor}`}>{sub}</div>
      {spark}
    </div>
  );
}

function Select({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-400">{label}</span>
      <button className="h-8 px-3 rounded border border-slate-700 bg-slate-900 text-slate-200 flex items-center gap-2">
        {value} <ChevronsUpDown className="h-3 w-3" />
      </button>
    </div>
  );
}

/* ---------- charts ---------- */
function FacilityLoadChart() {
  const w = 720, h = 280, pad = 32;
  const cur = Array.from({ length: 50 }, (_, i) => {
    const v = 9 + Math.sin(i * 0.4) * 2.5 + Math.cos(i * 0.9) * 1.2 + (i === 25 ? 4 : 0);
    return [pad + ((w - pad * 2) * i) / 49, h - pad - (v * (h - pad * 2)) / 16];
  });
  const prev = Array.from({ length: 50 }, (_, i) => {
    const v = 9.2 + Math.sin(i * 0.4 + 0.6) * 2.3 + Math.cos(i * 0.7) * 1.1;
    return [pad + ((w - pad * 2) * i) / 49, h - pad - (v * (h - pad * 2)) / 16];
  });
  const peakIdx = 25;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-64">
      {[3, 6, 9, 12, 15].map((v, i) => (
        <g key={v}>
          <line x1={pad} x2={w - pad} y1={h - pad - (v * (h - pad * 2)) / 16} y2={h - pad - (v * (h - pad * 2)) / 16} stroke="#1e293b" />
          <text x={pad - 6} y={h - pad - (v * (h - pad * 2)) / 16 + 3} fontSize="9" fill="#64748b" textAnchor="end">{v}</text>
        </g>
      ))}
      <text x={pad - 6} y={pad - 4} fontSize="9" fill="#64748b" textAnchor="end">MW</text>
      <polyline points={prev.map(p => p.join(",")).join(" ")} stroke="#3b82f6" strokeWidth="1.2" strokeDasharray="4 3" fill="none" opacity="0.6" />
      <polyline points={cur.map(p => p.join(",")).join(" ")} stroke="#3b82f6" strokeWidth="1.6" fill="none" />
      <line x1={cur[peakIdx][0]} x2={cur[peakIdx][0]} y1={pad} y2={h - pad} stroke="#475569" strokeDasharray="3 3" />
      <circle cx={cur[peakIdx][0]} cy={cur[peakIdx][1]} r="3" fill="#60a5fa" />
      <text x={cur[peakIdx][0] + 6} y={cur[peakIdx][1] - 6} fontSize="10" fill="#cbd5e1">May 17, 04:30 PM</text>
      <text x={cur[peakIdx][0] + 6} y={cur[peakIdx][1] + 6} fontSize="10" fill="#cbd5e1">13.21 MW</text>
      {["May 13","May 14","May 15","May 16","May 17","May 18","May 19","May 20"].map((d, i) => (
        <text key={d} x={pad + i * ((w - pad * 2) / 7)} y={h - 10} fontSize="9" fill="#64748b" textAnchor="middle">{d}</text>
      ))}
    </svg>
  );
}

function LoadDurationCurve() {
  const w = 520, h = 280, pad = 32;
  const curve = (seed: number) => Array.from({ length: 60 }, (_, i) => {
    const t = i / 59;
    const v = 16 * Math.pow(1 - t, 0.6) + 1 + Math.sin(seed) * 0.1;
    return [pad + ((w - pad * 2) * i) / 59, h - pad - (v * (h - pad * 2)) / 18];
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-64">
      {[3, 6, 9, 12, 15, 18].map((v) => (
        <g key={v}>
          <line x1={pad} x2={w - pad} y1={h - pad - (v * (h - pad * 2)) / 18} y2={h - pad - (v * (h - pad * 2)) / 18} stroke="#1e293b" />
          <text x={pad - 6} y={h - pad - (v * (h - pad * 2)) / 18 + 3} fontSize="9" fill="#64748b" textAnchor="end">{v}</text>
        </g>
      ))}
      <text x={pad - 6} y={pad - 4} fontSize="9" fill="#64748b" textAnchor="end">MW</text>
      <polyline points={curve(1).map(p => p.join(",")).join(" ")} stroke="#a855f7" strokeWidth="1.6" fill="none" />
      <polyline points={curve(2).map(p => p.join(",")).join(" ")} stroke="#a855f7" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" fill="none" />
      {["0%","20%","40%","60%","80%","100%"].map((d, i) => (
        <text key={d} x={pad + i * ((w - pad * 2) / 5)} y={h - 10} fontSize="9" fill="#64748b" textAnchor="middle">{d}</text>
      ))}
      <text x={w / 2} y={h - 22} fontSize="9" fill="#64748b" textAnchor="middle">% of Time</text>
    </svg>
  );
}

function EnergyBars() {
  const data = [
    { d: "Mon 5/13", a: 640, b: 670 }, { d: "Tue 5/14", a: 630, b: 660 },
    { d: "Wed 5/15", a: 650, b: 675 }, { d: "Thu 5/16", a: 700, b: 680 },
    { d: "Fri 5/17", a: 560, b: 605 }, { d: "Sat 5/18", a: 545, b: 585 },
    { d: "Sun 5/19", a: 470, b: 540 }, { d: "Mon 5/20", a: 500, b: 555 },
  ];
  const w = 640, h = 220, pad = 32, max = 800;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-52">
      {[0, 200, 400, 600, 800].map((v) => (
        <g key={v}>
          <line x1={pad} x2={w - pad} y1={h - pad - (v / max) * (h - pad * 2)} y2={h - pad - (v / max) * (h - pad * 2)} stroke="#1e293b" />
          <text x={pad - 6} y={h - pad - (v / max) * (h - pad * 2) + 3} fontSize="9" fill="#64748b" textAnchor="end">{v}</text>
        </g>
      ))}
      <text x={pad - 6} y={pad - 4} fontSize="9" fill="#64748b" textAnchor="end">MWh</text>
      {data.map((d, i) => {
        const x = pad + 10 + i * ((w - pad * 2 - 20) / data.length);
        const bw = 14;
        const ha = (d.a / max) * (h - pad * 2);
        const hb = (d.b / max) * (h - pad * 2);
        return (
          <g key={d.d}>
            <rect x={x} y={h - pad - ha} width={bw} height={ha} fill="#3b82f6" />
            <rect x={x + bw + 2} y={h - pad - hb} width={bw} height={hb} fill="#64748b" />
            <text x={x + bw + 1} y={h - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">{d.d}</text>
          </g>
        );
      })}
    </svg>
  );
}

function PueTrend() {
  const w = 540, h = 220, pad = 32;
  const cur = Array.from({ length: 60 }, (_, i) => {
    const v = 1.4 + Math.sin(i * 0.5) * 0.08 + Math.cos(i * 0.3) * 0.05;
    return [pad + ((w - pad * 2) * i) / 59, h - pad - ((v - 1) * (h - pad * 2)) / 1.0];
  });
  const prev = Array.from({ length: 60 }, (_, i) => {
    const v = 1.45 + Math.sin(i * 0.5 + 0.5) * 0.08 + Math.cos(i * 0.4) * 0.04;
    return [pad + ((w - pad * 2) * i) / 59, h - pad - ((v - 1) * (h - pad * 2)) / 1.0];
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-52">
      {[1.0, 1.2, 1.4, 1.6, 1.8, 2.0].map((v) => (
        <g key={v}>
          <line x1={pad} x2={w - pad} y1={h - pad - ((v - 1) * (h - pad * 2)) / 1.0} y2={h - pad - ((v - 1) * (h - pad * 2)) / 1.0} stroke="#1e293b" />
          <text x={pad - 6} y={h - pad - ((v - 1) * (h - pad * 2)) / 1.0 + 3} fontSize="9" fill="#64748b" textAnchor="end">{v.toFixed(2)}</text>
        </g>
      ))}
      <polyline points={prev.map(p => p.join(",")).join(" ")} stroke="#10b981" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" fill="none" />
      <polyline points={cur.map(p => p.join(",")).join(" ")} stroke="#10b981" strokeWidth="1.6" fill="none" />
      {["May 13","May 14","May 15","May 16","May 17","May 18","May 19","May 20"].map((d, i) => (
        <text key={d} x={pad + i * ((w - pad * 2) / 7)} y={h - 10} fontSize="9" fill="#64748b" textAnchor="middle">{d}</text>
      ))}
    </svg>
  );
}

function Donut() {
  const slices = [
    { val: 27, c: "#3b82f6", l: "Data Hall A", mwh: 765 },
    { val: 25, c: "#10b981", l: "Data Hall B", mwh: 701 },
    { val: 24, c: "#f59e0b", l: "Data Hall C", mwh: 688 },
    { val: 14, c: "#ef4444", l: "Cooling Systems", mwh: 402 },
    { val: 6, c: "#a855f7", l: "Electrical Room", mwh: 165 },
    { val: 4, c: "#94a3b8", l: "Other", mwh: 121 },
  ];
  let off = 0;
  const C = 2 * Math.PI * 50;
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-44 w-44 shrink-0">
        <svg viewBox="0 0 120 120" className="h-44 w-44 -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#0f172a" strokeWidth="16" />
          {slices.map((s, i) => {
            const len = (s.val / 100) * C;
            const el = (
              <circle key={i} cx="60" cy="60" r="50" fill="none" stroke={s.c} strokeWidth="16"
                strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} />
            );
            off += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-xl font-bold text-white">2,842</div>
            <div className="text-[10px] text-slate-400">MWh</div>
            <div className="text-[10px] text-slate-500">Total</div>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-1.5 text-xs">
        {slices.map(s => (
          <div key={s.l} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: s.c }} />
            <span className="flex-1 text-slate-300">{s.l}</span>
            <span className="text-slate-400">{s.mwh} MWh</span>
            <span className="text-slate-500 w-10 text-right">{s.val}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const inc = [
  { a: "Data Hall C", cur: "2,210", prev: "1,984", d: "+226", pct: "↑ 11.4%" },
  { a: "Data Hall A", cur: "2,478", prev: "2,298", d: "+180", pct: "↑ 7.8%" },
  { a: "Cooling Systems", cur: "1,025", prev: "978", d: "+47", pct: "↑ 4.8%" },
  { a: "Office & Other", cur: "312", prev: "301", d: "+11", pct: "↑ 3.7%" },
  { a: "Electrical Room", cur: "198", prev: "192", d: "+6", pct: "↑ 3.1%" },
];
const dec = [
  { a: "Data Hall B", cur: "2,205", prev: "2,385", d: "-180", pct: "↓ 7.5%" },
  { a: "UPS Systems", cur: "658", prev: "701", d: "-43", pct: "↓ 6.1%" },
  { a: "Lighting", cur: "145", prev: "154", d: "-9", pct: "↓ 5.8%" },
  { a: "Network Room", cur: "68", prev: "72", d: "-4", pct: "↓ 5.6%" },
  { a: "CRAC Units", cur: "315", prev: "329", d: "-14", pct: "↓ 4.3%" },
];

const stats = [
  { m: "Average Load", a: "8.42 MW", b: "8.92 MW", c: "↓ 5.6%", cc: "text-emerald-400" },
  { m: "Peak Load", a: "13.21 MW", b: "13.85 MW", c: "↓ 4.6%", cc: "text-emerald-400" },
  { m: "Min Load", a: "4.12 MW", b: "4.35 MW", c: "↓ 5.3%", cc: "text-emerald-400" },
  { m: "Total Energy", a: "2,842 MWh", b: "2,967 MWh", c: "↓ 4.2%", cc: "text-emerald-400" },
  { m: "Load Factor", a: "0.64", b: "0.62", c: "↑ 3.2%", cc: "text-rose-400" },
];

export default function HistoricalAnalysis() {
  return (
    <div className="flex h-screen bg-[#070b14] text-slate-200">
      <Rail />
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Historical Analysis</h1>
            <p className="text-sm text-slate-400">Analyze historical power and environmental data to identify trends and optimize performance.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative h-9 w-9 grid place-items-center rounded border border-slate-700 bg-slate-900">
              <Bell className="h-4 w-4 text-slate-300" />
              <span className="absolute -top-1 -right-1 h-4 w-4 grid place-items-center text-[10px] rounded-full bg-rose-500 text-white">3</span>
            </button>
            <button className="h-9 px-3 rounded border border-slate-700 bg-slate-900 text-xs flex items-center gap-2"><MapIcon className="h-4 w-4" /> DC1 — Ashburn <ChevronsUpDown className="h-3 w-3" /></button>
            <button className="h-9 px-3 rounded border border-slate-700 bg-slate-900 text-xs flex items-center gap-2"><Calendar className="h-4 w-4" /> May 13 — May 20, 2024 <ChevronsUpDown className="h-3 w-3" /></button>
            <button className="h-9 px-3 rounded border border-slate-700 bg-slate-900 text-xs">Compare</button>
            <button className="h-9 px-3 rounded bg-blue-600 text-white text-xs flex items-center gap-2"><Download className="h-4 w-4" /> Export</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-slate-800">
          <div className="flex items-center gap-6 text-sm">
            {["Power","PUE","Environment","Equipment","Cost","Events"].map((t, i) => (
              <button key={t} className={`pb-3 ${i === 0 ? "text-blue-400 border-b-2 border-blue-500 font-medium" : "text-slate-400 hover:text-slate-200"}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Filters row */}
          <div className="flex items-center gap-5 flex-wrap">
            <Select label="Granularity:" value="15 Minutes" />
            <Select label="Metric:" value="Total Facility Load (kW)" />
            <Select label="Area:" value="All Areas" />
            <Select label="Compare to:" value="Previous 7 Days" />
            <div className="ml-auto flex items-center gap-2">
              <button className="h-9 px-3 rounded border border-slate-700 bg-slate-900 text-xs flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</button>
              <button className="h-9 px-3 rounded border border-slate-700 bg-slate-900 text-xs flex items-center gap-2"><Save className="h-4 w-4" /> Save View</button>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-6 gap-3">
            <KpiCard icon={Activity} color="bg-blue-500/10 text-blue-400" label="Average Load" value="8.42" unit="MW"
              sub="↓ 5.6% vs May 6 – May 12" spark={<Sparkline color="#3b82f6" seed={1} />} />
            <KpiCard icon={Zap} color="bg-violet-500/10 text-violet-400" label="Peak Load" value="13.21" unit="MW"
              sub="May 17, 2024 04:30 PM" subColor="text-slate-400" spark={<Sparkline color="#a855f7" seed={2} />} />
            <KpiCard icon={Gauge} color="bg-emerald-500/10 text-emerald-400" label="Total Energy" value="2,842" unit="MWh"
              sub="↓ 4.2% vs May 6 – May 12" spark={<Sparkline color="#10b981" seed={3} />} />
            <KpiCard icon={Droplets} color="bg-cyan-500/10 text-cyan-400" label="Average PUE" value="1.38" unit=""
              sub="↓ 3.1% vs May 6 – May 12" spark={<Sparkline color="#06b6d4" seed={4} />} />
            <KpiCard icon={DollarSign} color="bg-amber-500/10 text-amber-400" label="Total Cost" value="$247,542" unit=""
              sub="↓ 6.3% vs May 6 – May 12" spark={<Sparkline color="#f59e0b" seed={5} />} />
            <KpiCard icon={Leaf} color="bg-emerald-500/10 text-emerald-400" label="Carbon Emissions" value="1,105" unit="tCO₂e"
              sub="↓ 5.8% vs May 6 – May 12" spark={<Sparkline color="#10b981" seed={6} />} />
          </div>

          {/* Facility Load + Duration */}
          <div className="grid grid-cols-[1.4fr_1fr] gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white">Total Facility Load (kW)</div>
                <div className="text-xs text-slate-400">Peak: <span className="text-white">13.21 MW</span></div>
              </div>
              <div className="mt-1 flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-blue-500" /> May 13 – May 20, 2024</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-slate-500" /> May 6 – May 12, 2024 (Previous)</span>
              </div>
              <FacilityLoadChart />
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white flex items-center gap-2">Load Duration Curve <span className="text-slate-500 text-xs">ⓘ</span></div>
              </div>
              <div className="mt-1 flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-violet-500" /> May 13 – May 20, 2024</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-violet-400 opacity-60" /> May 6 – May 12, 2024 (Previous)</span>
              </div>
              <div className="grid grid-cols-[1fr_220px] gap-3">
                <LoadDurationCurve />
                <table className="text-[11px] self-center">
                  <thead className="text-slate-400">
                    <tr><th className="text-left font-normal pb-1">Metric</th><th className="text-left font-normal pb-1">This Period</th><th className="text-left font-normal pb-1">Prev. Period</th><th className="text-left font-normal pb-1">Change</th></tr>
                  </thead>
                  <tbody>
                    {stats.map(s => (
                      <tr key={s.m} className="border-t border-slate-800">
                        <td className="py-1.5 text-slate-300">{s.m}</td>
                        <td className="text-white">{s.a}</td>
                        <td className="text-slate-400">{s.b}</td>
                        <td className={s.cc}>{s.c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Energy + PUE + PUE Summary */}
          <div className="grid grid-cols-[1.1fr_1.1fr_0.9fr] gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="font-semibold text-white">Energy Usage (MWh)</div>
              <div className="mt-1 flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-blue-500" /> This Period</span>
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-slate-500" /> Previous Period</span>
              </div>
              <EnergyBars />
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="font-semibold text-white">PUE Trend</div>
              <div className="mt-1 flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-emerald-500" /> This Period</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-emerald-400 opacity-60" /> Previous Period</span>
              </div>
              <PueTrend />
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="font-semibold text-white">PUE Summary</div>
              <div className="mt-4 space-y-4 text-xs">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
                  <div className="text-slate-300">Average PUE</div>
                  <div className="text-white">1.38</div>
                  <div className="text-slate-400">1.42</div>
                  <div className="text-emerald-400">↓ 3.1%</div>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
                  <div>
                    <div className="text-slate-300">Best PUE</div>
                    <div className="text-[10px] text-slate-500">1.21 · May 18, 03:15 AM</div>
                  </div>
                  <div className="text-white">1.21</div>
                  <div className="text-slate-400">1.26<div className="text-[10px] text-slate-500">May 11, 02:45 AM</div></div>
                  <div className="text-emerald-400">↓ 4.0%</div>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
                  <div>
                    <div className="text-slate-300">Worst PUE</div>
                    <div className="text-[10px] text-slate-500">1.62 · May 16, 01:30 PM</div>
                  </div>
                  <div className="text-white">1.62</div>
                  <div className="text-slate-400">1.71<div className="text-[10px] text-slate-500">May 9, 01:00 PM</div></div>
                  <div className="text-emerald-400">↓ 5.3%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Inc / Dec / Donut */}
          <div className="grid grid-cols-[1fr_1fr_1.1fr] gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="font-semibold text-white mb-2">Top Load Increase (vs Previous Period)</div>
              <table className="w-full text-xs">
                <thead className="text-slate-400">
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-1.5 font-normal">Area</th>
                    <th className="text-left font-normal">This Period Avg (kW)</th>
                    <th className="text-left font-normal">Prev. Period Avg (kW)</th>
                    <th className="text-left font-normal">Change (kW)</th>
                    <th className="text-left font-normal">Change (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {inc.map(r => (
                    <tr key={r.a} className="border-b border-slate-800/60">
                      <td className="py-2 text-white">{r.a}</td>
                      <td className="text-slate-300">{r.cur}</td>
                      <td className="text-slate-400">{r.prev}</td>
                      <td className="text-rose-400">{r.d}</td>
                      <td className="text-rose-400">{r.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="font-semibold text-white mb-2">Top Load Decrease (vs Previous Period)</div>
              <table className="w-full text-xs">
                <thead className="text-slate-400">
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-1.5 font-normal">Area</th>
                    <th className="text-left font-normal">This Period Avg (kW)</th>
                    <th className="text-left font-normal">Prev. Period Avg (kW)</th>
                    <th className="text-left font-normal">Change (kW)</th>
                    <th className="text-left font-normal">Change (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {dec.map(r => (
                    <tr key={r.a} className="border-b border-slate-800/60">
                      <td className="py-2 text-white">{r.a}</td>
                      <td className="text-slate-300">{r.cur}</td>
                      <td className="text-slate-400">{r.prev}</td>
                      <td className="text-emerald-400">{r.d}</td>
                      <td className="text-emerald-400">{r.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="font-semibold text-white mb-3">Energy Consumption by Area</div>
              <Donut />
            </div>
          </div>

          {/* Footer status */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-2.5 flex items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Data Source: <span className="text-white">Integrated DCIM</span></span>
            <span>|</span>
            <span>All times shown in EDT</span>
            <span>|</span>
            <span>Last updated: <span className="text-white">May 20, 2024 10:30:15 AM EDT</span></span>
            <span className="ml-auto flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Auto-refresh: <span className="text-white">On</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
