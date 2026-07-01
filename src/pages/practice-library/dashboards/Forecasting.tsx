import { Link } from "react-router-dom";
import {
  Zap, Server, Bell, RefreshCw, Download, Activity, Map as MapIcon, BarChart3, TrendingUp,
  Gauge, Settings as SettingsIcon, Battery, Power, Cpu, Layers, FileText, PieChart, Plug,
  ChevronLeft, CircleDot, ShieldAlert, Brain, Calendar, Zap as Bolt, Target, Leaf,
  Snowflake, DollarSign, Workflow,
} from "lucide-react";

/* ---------- side rail (mirrors sibling Power pages) ---------- */
const navGroups: { title: string; items: { label: string; icon: any; to?: string; active?: boolean; badge?: number }[] }[] = [
  { title: "Overview", items: [
    { label: "Power Overview", icon: Zap, to: "/practice-library/infrastructure-hybrid-platform/power-admin-console" },
    { label: "Power Map", icon: MapIcon, to: "/practice-library/infrastructure-hybrid-platform/power-map" },
    { label: "Alerts", icon: Bell, badge: 3, to: "/practice-library/infrastructure-hybrid-platform/power-alerts" },
  ]},
  { title: "Monitoring", items: [
    { label: "Real-time Monitoring", icon: Activity, to: "/practice-library/infrastructure-hybrid-platform/real-time-monitoring" },
    { label: "Historical Analysis", icon: BarChart3, to: "/practice-library/infrastructure-hybrid-platform/historical-analysis" },
    { label: "Forecasting", icon: TrendingUp, active: true },
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
                <div className={`mx-2 px-3 py-2 rounded flex items-center gap-2 cursor-pointer ${it.active ? "bg-blue-600/15 text-blue-300" : "hover:bg-slate-800/60"}`}>
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

/* ---------- KPI tile ---------- */
function Kpi({ icon: Icon, iconBg, label, value, unit, footer }: any) {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
      <div className="flex items-start gap-2">
        <div className={`h-8 w-8 rounded-md grid place-items-center ${iconBg}`}><Icon className="h-4 w-4" /></div>
        <div className="flex-1">
          <div className="text-[11px] text-slate-400">{label}</div>
          <div className="text-2xl font-bold text-white tabular-nums">{value} {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}</div>
        </div>
      </div>
      <div className="mt-1 text-[11px] text-slate-400">{footer}</div>
    </div>
  );
}

/* ---------- Forecast band chart (historical + forecast w/ upper/lower bounds) ---------- */
function ForecastBandChart() {
  const w = 760, h = 280, pad = { l: 32, r: 12, t: 18, b: 26 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const n = 30; // 15 historical + 15 forecast
  const split = 14;
  const hist = Array.from({ length: split + 1 }, (_, i) => 7 + Math.sin(i * 0.7) * 0.8 + (i % 3) * 0.3);
  const fc = Array.from({ length: n - split }, (_, i) => 10 + Math.sin(i * 0.6) * 1.2 + i * 0.05);
  const upper = fc.map((v) => v + 1.7);
  const lower = fc.map((v) => v - 1.6);
  const yMax = 18, yMin = 3;
  const x = (i: number) => pad.l + (i / (n - 1)) * cw;
  const y = (v: number) => pad.t + ch - ((v - yMin) / (yMax - yMin)) * ch;

  const histPath = hist.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
  const fcPath = fc.map((v, i) => `${i === 0 ? "M" : "L"}${x(split + i)},${y(v)}`).join(" ");
  const upPath = upper.map((v, i) => `${i === 0 ? "M" : "L"}${x(split + i)},${y(v)}`).join(" ");
  const loPath = lower.map((v, i) => `${i === 0 ? "M" : "L"}${x(split + i)},${y(v)}`).join(" ");
  const band = `${upper.map((v, i) => `${i === 0 ? "M" : "L"}${x(split + i)},${y(v)}`).join(" ")} ${lower.slice().reverse().map((v, i) => `L${x(split + lower.length - 1 - i)},${y(v)}`).join(" ")} Z`;

  const labels = ["May 13","May 14","May 15","May 16","May 17","May 20","May 21","May 22","May 23","May 24","May 25","May 26","May 27"];
  const gridY = [3, 6, 9, 12, 15, 18];

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      {gridY.map((g) => (
        <g key={g}>
          <line x1={pad.l} x2={w - pad.r} y1={y(g)} y2={y(g)} stroke="#1f2937" strokeWidth={0.5} />
          <text x={6} y={y(g) + 3} fontSize={10} fill="#64748b">{g}</text>
        </g>
      ))}
      <text x={6} y={pad.t - 4} fontSize={9} fill="#64748b">MW</text>
      {/* Forecast band */}
      <path d={band} fill="rgba(16,185,129,0.10)" />
      {/* Historical */}
      <path d={histPath} fill="none" stroke="#3b82f6" strokeWidth={1.8} />
      {/* Forecast central */}
      <path d={fcPath} fill="none" stroke="#10b981" strokeWidth={2} />
      {fc.map((v, i) => <circle key={i} cx={x(split + i)} cy={y(v)} r={2.5} fill="#10b981" />)}
      {/* Bounds */}
      <path d={upPath} fill="none" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
      <path d={loPath} fill="none" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
      {/* Split line */}
      <line x1={x(split)} x2={x(split)} y1={pad.t} y2={h - pad.b} stroke="#475569" strokeDasharray="3 3" />
      <text x={x(split) + 6} y={pad.t + 12} fontSize={10} fill="#94a3b8">Forecast →</text>
      {/* Tooltip-style annotation */}
      <g transform={`translate(${x(split + 3) + 8},${y(upper[3]) - 60})`}>
        <rect width={140} height={56} rx={4} fill="#0f172a" stroke="#334155" />
        <text x={8} y={14} fontSize={10} fill="#cbd5e1">May 23, 2:00 PM</text>
        <text x={8} y={28} fontSize={10} fill="#10b981">Forecast: 13.8 MW</text>
        <text x={8} y={40} fontSize={10} fill="#3b82f6">Upper Bound: 15.6 MW</text>
        <text x={8} y={52} fontSize={10} fill="#3b82f6">Lower Bound: 12.0 MW</text>
      </g>
      {/* X labels (sample) */}
      {labels.map((l, i) => (
        <text key={l} x={pad.l + (i / (labels.length - 1)) * cw} y={h - 8} fontSize={9} fill="#64748b" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

/* ---------- Stacked bar (Load Forecast by Area) ---------- */
function StackedBars() {
  const days = ["May 20","May 21","May 22","May 23","May 24","May 25","May 26","May 27"];
  const colors = ["#3b82f6","#10b981","#f59e0b","#f43f5e","#a78bfa","#64748b"];
  const labels = ["Data Hall A","Data Hall B","Data Hall C","Cooling Systems","Electrical Room","Other"];
  const segs = [3.2, 2.8, 2.4, 1.6, 0.9, 0.4]; // per-area base
  const w = 520, h = 280, pad = { l: 28, r: 8, t: 24, b: 26 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const yMax = 20;
  const y = (v: number) => pad.t + ch - (v / yMax) * ch;
  const barW = cw / days.length - 10;
  return (
    <div>
      <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 mb-1">
        {labels.map((l, i) => (
          <span key={l} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: colors[i] }} />{l}</span>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
        {[0,5,10,15,20].map((g) => (
          <g key={g}>
            <line x1={pad.l} x2={w - pad.r} y1={y(g)} y2={y(g)} stroke="#1f2937" strokeWidth={0.5} />
            <text x={6} y={y(g)+3} fontSize={10} fill="#64748b">{g}</text>
          </g>
        ))}
        <text x={6} y={pad.t - 6} fontSize={9} fill="#64748b">MW</text>
        {days.map((d, di) => {
          const variance = 1 + (di - 3) * 0.05;
          let acc = 0;
          const xPos = pad.l + di * (cw / days.length) + 5;
          return (
            <g key={d}>
              {segs.map((s, i) => {
                const v = s * variance;
                const h0 = (v / yMax) * ch;
                const yPos = y(acc + v);
                acc += v;
                return <rect key={i} x={xPos} y={yPos} width={barW} height={h0} fill={colors[i]} />;
              })}
              <text x={xPos + barW / 2} y={h - 8} fontSize={9} fill="#64748b" textAnchor="middle">{d}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------- Comparison chart (historical vs forecast bands) ---------- */
function ComparisonChart() {
  const w = 760, h = 220, pad = { l: 28, r: 12, t: 20, b: 24 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const yMax = 20;
  const y = (v: number) => pad.t + ch - (v / yMax) * ch;
  const histN = 7, fcN = 8;
  const hist = Array.from({ length: histN }, (_, i) => 9 + Math.sin(i) * 1.5);
  const fc = Array.from({ length: fcN }, (_, i) => 11 + Math.cos(i * 0.8) * 1.2);
  const histX = (i: number) => pad.l + (i / (histN + fcN - 1)) * cw;
  const fcX = (i: number) => pad.l + ((histN + i) / (histN + fcN - 1)) * cw;
  const histPath = hist.map((v, i) => `${i === 0 ? "M" : "L"}${histX(i)},${y(v)}`).join(" ");
  const fcPath = fc.map((v, i) => `${i === 0 ? "M" : "L"}${fcX(i)},${y(v)}`).join(" ");
  const histBand = [
    ...hist.map((v, i) => `${i === 0 ? "M" : "L"}${histX(i)},${y(v + 1.4)}`),
    ...hist.slice().reverse().map((v, i) => `L${histX(hist.length - 1 - i)},${y(v - 1.4)}`),
    "Z",
  ].join(" ");
  const fcBand = [
    ...fc.map((v, i) => `${i === 0 ? "M" : "L"}${fcX(i)},${y(v + 1.2)}`),
    ...fc.slice().reverse().map((v, i) => `L${fcX(fc.length - 1 - i)},${y(v - 1.2)}`),
    "Z",
  ].join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      {[0,5,10,15,20].map((g) => (
        <line key={g} x1={pad.l} x2={w - pad.r} y1={y(g)} y2={y(g)} stroke="#1f2937" strokeWidth={0.5} />
      ))}
      <path d={histBand} fill="rgba(59,130,246,0.15)" />
      <path d={fcBand} fill="rgba(16,185,129,0.15)" />
      <path d={histPath} fill="none" stroke="#3b82f6" strokeWidth={1.8} />
      <path d={fcPath} fill="none" stroke="#10b981" strokeWidth={1.8} />
      {hist.map((v, i) => <circle key={`h${i}`} cx={histX(i)} cy={y(v)} r={2} fill="#3b82f6" />)}
      {fc.map((v, i) => <circle key={`f${i}`} cx={fcX(i)} cy={y(v)} r={2} fill="#10b981" />)}
      {["May 20","Tue","Wed","Thu","Fri","Sat","Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((l, i, a) => (
        <text key={i} x={pad.l + (i / (a.length - 1)) * cw} y={h - 6} fontSize={9} fill="#64748b" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

/* ---------- Cost forecast (single chart with band) ---------- */
function CostForecastChart() {
  const w = 760, h = 240, pad = { l: 36, r: 12, t: 18, b: 28 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const yMax = 50000, yMin = 0;
  const n = 15, split = 7;
  const hist = Array.from({ length: split + 1 }, (_, i) => 22000 + Math.sin(i) * 2500);
  const fc = Array.from({ length: n - split }, (_, i) => 28000 + i * 700 + Math.sin(i) * 1500);
  const x = (i: number) => pad.l + (i / (n - 1)) * cw;
  const y = (v: number) => pad.t + ch - ((v - yMin) / (yMax - yMin)) * ch;
  const histPath = hist.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
  const fcPath = fc.map((v, i) => `${i === 0 ? "M" : "L"}${x(split + i)},${y(v)}`).join(" ");
  const up = fc.map((v) => v + 5500), lo = fc.map((v) => v - 5500);
  const upPath = up.map((v, i) => `${i === 0 ? "M" : "L"}${x(split + i)},${y(v)}`).join(" ");
  const loPath = lo.map((v, i) => `${i === 0 ? "M" : "L"}${x(split + i)},${y(v)}`).join(" ");
  const band = `${up.map((v, i) => `${i === 0 ? "M" : "L"}${x(split + i)},${y(v)}`).join(" ")} ${lo.slice().reverse().map((v, i) => `L${x(split + lo.length - 1 - i)},${y(v)}`).join(" ")} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      {[0,10000,20000,30000,40000,50000].map((g) => (
        <g key={g}>
          <line x1={pad.l} x2={w - pad.r} y1={y(g)} y2={y(g)} stroke="#1f2937" strokeWidth={0.5} />
          <text x={4} y={y(g)+3} fontSize={9} fill="#64748b">{g/1000}K</text>
        </g>
      ))}
      <text x={4} y={pad.t - 4} fontSize={9} fill="#64748b">Cost ($)</text>
      <path d={band} fill="rgba(16,185,129,0.10)" />
      <path d={histPath} fill="none" stroke="#3b82f6" strokeWidth={1.8} />
      <path d={fcPath} fill="none" stroke="#10b981" strokeWidth={2} />
      {fc.map((v, i) => <circle key={i} cx={x(split + i)} cy={y(v)} r={2.5} fill="#10b981" />)}
      <path d={upPath} fill="none" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
      <path d={loPath} fill="none" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
      <line x1={x(split)} x2={x(split)} y1={pad.t} y2={h - pad.b} stroke="#475569" strokeDasharray="3 3" />
      <text x={x(split) + 6} y={pad.t + 12} fontSize={10} fill="#94a3b8">Forecast →</text>
      {["May 13","May 14","May 15","May 16","May 17","May 20","May 21","May 22","May 23","May 24","May 25","May 26","May 27"].map((l, i, a) => (
        <text key={l} x={pad.l + (i / (a.length - 1)) * cw} y={h - 8} fontSize={9} fill="#64748b" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

/* ---------- Forecast summary data ---------- */
const days = ["Today (May 20)","Tomorrow (May 21)","May 22","May 23","May 24","May 25","May 26","May 27","7-Day Avg"];
const summary: { label: string; values: (string | { v: string; color: string })[] }[] = [
  { label: "Avg Load (MW)", values: ["8.42","9.13","10.21","11.47","10.02","8.74","7.98","7.36","9.17"] },
  { label: "Peak Load (MW)", values: ["11.32","12.10","13.05",{ v: "13.80", color: "text-rose-400" },"12.44","11.29","10.21","9.42","11.95"] },
  { label: "Total Energy (MWh)", values: ["2,632","2,784","2,956","3,101","2,880","2,614","2,398","2,289","2,845"] },
  { label: "PUE (Forecast)", values: ["1.37","1.37","1.36","1.36","1.37","1.38","1.38","1.39","1.37"] },
  { label: "Total Cost ($)", values: ["$29,850","$31,420","$33,210","$34,890","$32,140","$29,030","$26,410","$25,110","$30,007"] },
];

const insights = [
  { icon: Bolt, color: "text-amber-400 bg-amber-500/10", title: "Peak load on May 23 is projected to be 13.8 MW (↑ 6.4% vs avg).", sub: "Consider pre-cooling and workload shifting to off-peak hours.", save: "$6,250" },
  { icon: Snowflake, color: "text-sky-400 bg-sky-500/10", title: "Cooling systems will drive 38% of total energy on peak days.", sub: "AI recommends optimizing setpoints to 23°C to reduce load.", save: "$4,780" },
  { icon: Workflow, color: "text-violet-400 bg-violet-500/10", title: "Workloads in Data Hall B can be migrated on May 24–25.", sub: "Expected to reduce peak load by 0.9 MW.", save: "$3,420" },
  { icon: DollarSign, color: "text-emerald-400 bg-emerald-500/10", title: "Electricity price is forecasted to be higher on May 22–23.", sub: "Run batch jobs earlier to minimize cost impact.", save: "$4,000" },
];

const tabs = ["Power Forecast","PUE Forecast","Temperature Forecast","Workload Forecast","Scenario Planning"];

export default function Forecasting() {
  return (
    <div className="flex h-screen bg-[#070b14] text-slate-200 font-sans">
      <Rail />
      <main className="flex-1 overflow-y-auto">
        {/* header */}
        <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#070b14]/95 backdrop-blur z-10">
          <div>
            <div className="text-[11px] text-slate-500">Data Center Power</div>
            <h1 className="text-xl font-semibold text-white">Forecasting</h1>
            <div className="text-xs text-slate-400">Predict future power demand and environmental conditions using AI/ML models to enable proactive capacity and cost optimization.</div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button className="relative px-2 py-1.5 rounded border border-slate-700 hover:bg-slate-800"><Bell className="h-4 w-4" /><span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full px-1">3</span></button>
            <div className="px-2 py-1.5 rounded border border-slate-700 flex items-center gap-2"><Server className="h-3.5 w-3.5" /> DC1 - Ashburn</div>
            <div className="px-2 py-1.5 rounded border border-slate-700 flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> May 20 – May 27, 2026 ▾</div>
            <button className="p-1.5 rounded border border-slate-700 hover:bg-slate-800"><RefreshCw className="h-4 w-4" /></button>
            <button className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> Export</button>
          </div>
        </header>

        <div className="p-6 space-y-5">
          {/* Tab strip */}
          <div className="flex items-center gap-6 border-b border-slate-800 text-sm">
            {tabs.map((t, i) => (
              <button key={t} className={`pb-2 -mb-px ${i === 0 ? "text-blue-400 border-b-2 border-blue-500 font-medium" : "text-slate-400 hover:text-slate-200"}`}>{t}</button>
            ))}
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <Kpi icon={Calendar} iconBg="bg-blue-500/15 text-blue-400" label="Forecast Horizon" value="7" unit="Days" footer="May 20 – May 27, 2026" />
            <Kpi icon={Activity} iconBg="bg-sky-500/15 text-sky-400" label="Predicted Peak Load" value="13.8" unit="MW" footer="May 23, 2026 2:00 PM" />
            <Kpi icon={Bolt} iconBg="bg-emerald-500/15 text-emerald-400" label="Avg. Daily Energy" value="2,845" unit="MWh" footer={<span className="text-emerald-400">↑ 3.2% <span className="text-slate-500">vs last 7 days</span></span>} />
            <Kpi icon={DollarSign} iconBg="bg-amber-500/15 text-amber-400" label="Total Cost (Forecast)" value="$247,850" footer={<span className="text-amber-400">↑ 4.8% <span className="text-slate-500">vs last 7 days</span></span>} />
            <Kpi icon={Target} iconBg="bg-violet-500/15 text-violet-400" label="Model Confidence" value="92%" footer="High" />
            <Kpi icon={Leaf} iconBg="bg-emerald-500/15 text-emerald-400" label="Potential Savings" value="$18,450" footer="with recommended actions" />
          </div>

          {/* Top charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-medium">Total Facility Load Forecast <span className="text-slate-500 text-xs">(MW)</span></div>
                <div className="flex items-center text-xs bg-slate-800/50 rounded overflow-hidden">
                  <button className="px-2.5 py-1 bg-blue-600 text-white">7 Days</button>
                  <button className="px-2.5 py-1 text-slate-300">14 Days</button>
                  <button className="px-2.5 py-1 text-slate-300">30 Days</button>
                </div>
              </div>
              <div className="flex gap-4 text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-blue-500" />Historical</span>
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-emerald-500" />Forecast</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-3 border-t border-dashed border-blue-400" />Upper Bound</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-3 border-t border-dashed border-blue-400" />Lower Bound</span>
              </div>
              <ForecastBandChart />
            </div>
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-medium">Load Forecast by Area <span className="text-slate-500 text-xs">(Peak MW)</span></div>
              </div>
              <StackedBars />
            </div>
          </div>

          {/* Summary + Comparison */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-xl bg-slate-900/60 border border-slate-800 p-4 overflow-x-auto">
              <div className="text-white font-medium mb-3">Forecast Summary</div>
              <table className="w-full text-xs min-w-[700px]">
                <thead className="text-slate-400">
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-2 font-normal">Metric</th>
                    {days.map((d) => <th key={d} className="text-right font-normal px-2">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {summary.map((row) => (
                    <tr key={row.label} className="border-b border-slate-800/60">
                      <td className="py-2.5 text-slate-200">{row.label}</td>
                      {row.values.map((v, i) => (
                        <td key={i} className={`text-right px-2 tabular-nums ${typeof v === "string" ? "text-slate-300" : v.color}`}>
                          {typeof v === "string" ? v : v.v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-medium">Forecast vs. Historical Comparison</div>
              </div>
              <div className="flex items-center gap-2 text-xs mb-2">
                <span className="text-slate-400">Metric</span>
                <div className="px-2 py-1 rounded border border-slate-700 text-slate-300">Total Facility Load (MW) ▾</div>
                <span className="text-slate-400 ml-2">View</span>
                <div className="px-2 py-1 rounded border border-slate-700 text-slate-300">Daily Average ▾</div>
              </div>
              <div className="flex gap-4 text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-blue-500" />Historical (May 13 – May 19)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-emerald-500" />Forecast (May 20 – May 26)</span>
              </div>
              <ComparisonChart />
            </div>
          </div>

          {/* Cost forecast + AI insights */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <div className="text-white font-medium mb-2">Cost Forecast</div>
              <div className="flex gap-4 text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-blue-500" />Actual Cost</span>
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-emerald-500" />Forecast Cost</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-3 border-t border-dashed border-blue-400" />Upper Bound</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-3 border-t border-dashed border-blue-400" />Lower Bound</span>
              </div>
              <CostForecastChart />
            </div>

            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <div className="text-white font-medium mb-3">AI Insights & Recommendations</div>
              <div className="space-y-3">
                {insights.map((it) => (
                  <div key={it.title} className="flex items-start gap-2 border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                    <div className={`h-8 w-8 rounded-md grid place-items-center shrink-0 ${it.color}`}><it.icon className="h-4 w-4" /></div>
                    <div className="flex-1 text-xs">
                      <div className="text-slate-100 font-medium">{it.title}</div>
                      <div className="text-slate-400 mt-0.5">{it.sub}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-500">Potential Savings</div>
                      <div className="text-emerald-400 text-sm font-semibold">{it.save}</div>
                      <button className="mt-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px]">View Action</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer status */}
          <div className="rounded-xl bg-slate-900/40 border border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Data Source: <span className="text-slate-200">Integrated DCIM</span></span>
              <span>Model: <span className="text-slate-200">RunOps AI Forecasting Engine</span></span>
              <span>Last updated: <span className="text-slate-200">May 20, 2026 10:30:15 AM EDT</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Auto-refresh: <span className="text-slate-200">On</span></span>
              <div className="px-2 py-0.5 rounded border border-slate-700">5 min ▾</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
