import { Link } from "react-router-dom";
import {
  Zap, Bell, RefreshCw, Download, Activity, Map as MapIcon, BarChart3, TrendingUp,
  Gauge, Settings as SettingsIcon, Battery, Power, Cpu, Layers, FileText, PieChart,
  Plug, ChevronLeft, ChevronsUpDown, Calendar, Brain, DollarSign, Leaf, Cloud,
  Target, Thermometer, Droplets, Wind, Snowflake, Sparkles, Lightbulb, Recycle,
  ArrowDown, CircleDot, ShieldAlert,
} from "lucide-react";

const navGroups: { title: string; items: { label: string; icon: any; to?: string; active?: boolean; badge?: number }[] }[] = [
  { title: "Overview", items: [
    { label: "Power Overview", icon: Zap, to: "/practice-library/infrastructure-hybrid-platform/power-admin-console" },
    { label: "Power Map", icon: MapIcon, to: "/practice-library/infrastructure-hybrid-platform/power-map" },
    { label: "Alerts", icon: Bell, badge: 3, to: "/practice-library/infrastructure-hybrid-platform/power-alerts" },
  ]},
  { title: "Monitoring", items: [
    { label: "Real-time Monitoring", icon: Activity, to: "/practice-library/infrastructure-hybrid-platform/real-time-monitoring" },
    { label: "Historical Analysis", icon: BarChart3, to: "/practice-library/infrastructure-hybrid-platform/historical-analysis" },
    { label: "Forecasting", icon: TrendingUp, to: "/practice-library/infrastructure-hybrid-platform/forecasting" },
  ]},
  { title: "Management", items: [
    { label: "Capacity Management", icon: Gauge, to: "/practice-library/infrastructure-hybrid-platform/capacity-management" },
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
  { title: "Analytics", items: [
    { label: "AI Optimization", icon: Brain, active: true },
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

/* ---------------- KPI tiles ---------------- */
function ScoreTile() {
  const pct = 87;
  const r = 26, c = 2 * Math.PI * r;
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex items-center gap-3">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
          <circle cx="32" cy="32" r={r} stroke="#1e293b" strokeWidth="5" fill="none" />
          <circle cx="32" cy="32" r={r} stroke="#3b82f6" strokeWidth="5" fill="none"
            strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-white">
          <div className="text-center leading-none">
            <div className="text-lg font-bold">{pct}</div>
            <div className="text-[9px] text-slate-400">100</div>
          </div>
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-400">Optimization Score</div>
        <div className="text-emerald-400 font-semibold">Excellent</div>
        <div className="text-[11px] text-emerald-400 mt-0.5">↑ 12 vs yesterday</div>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, iconClass, label, value, sub, subClass = "text-emerald-400" }: any) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-md grid place-items-center ${iconClass}`}><Icon className="h-5 w-5" /></div>
      <div className="min-w-0">
        <div className="text-xs text-slate-400 truncate">{label}</div>
        <div className="text-lg font-semibold text-white">{value}</div>
        <div className={`text-[11px] ${subClass}`}>{sub}</div>
      </div>
    </div>
  );
}

/* ---------------- Scenarios table ---------------- */
const scenarios = [
  { name: "Dynamic Cooling Optimization", save: "$42,350", energy: "128 MWh", impact: "High", conf: 94, impactColor: "text-emerald-400" },
  { name: "AI-Based Workload Scheduling", save: "$31,200", energy: "98 MWh", impact: "High", conf: 91, impactColor: "text-emerald-400" },
  { name: "PUE-Aware Power Capping", save: "$22,800", energy: "67 MWh", impact: "Medium", conf: 88, impactColor: "text-amber-400" },
  { name: "Idle Resource Consolidation", save: "$18,500", energy: "54 MWh", impact: "Medium", conf: 86, impactColor: "text-amber-400" },
  { name: "Temperature Setpoint Optimization", save: "$13,600", energy: "31 MWh", impact: "Low", conf: 82, impactColor: "text-sky-400" },
];

const insights = [
  { icon: Thermometer, color: "text-sky-400 bg-sky-500/10", title: "Cooling system in Data Hall B is over-provisioned during low load periods.", desc: "AI recommends raising temperature setpoint by 1.5°C.", saveColor: "text-emerald-400", save: "$18,450" },
  { icon: Recycle, color: "text-amber-400 bg-amber-500/10", title: "Waste heat detected in Data Hall A. Opportunity for heat reuse.", desc: "AI recommends enabling heat recapture system.", saveColor: "text-emerald-400", save: "$9,200" },
  { icon: Layers, color: "text-violet-400 bg-violet-500/10", title: "3 non-critical workloads can be rescheduled to off-peak hours.", desc: "AI recommends workload migration.", saveColor: "text-emerald-400", save: "$6,800" },
  { icon: ArrowDown, color: "text-rose-400 bg-rose-500/10", title: "PDU-2A showing higher than normal losses (4.2%).", desc: "AI recommends load balancing across PDUs.", saveColor: "text-emerald-400", save: "$4,100" },
];

const sensorTiles = [
  { icon: Thermometer, color: "text-sky-400 bg-sky-500/10", label: "Temperature", avg: "22.4 °C" },
  { icon: Droplets, color: "text-cyan-400 bg-cyan-500/10", label: "Humidity", avg: "45 %" },
  { icon: Wind, color: "text-emerald-400 bg-emerald-500/10", label: "Airflow", avg: "12.3 m/s" },
  { icon: Zap, color: "text-amber-400 bg-amber-500/10", label: "Power Density", avg: "6.2 kW/rack" },
  { icon: Gauge, color: "text-blue-400 bg-blue-500/10", label: "PDU Efficiency", avg: "96.2 %" },
  { icon: Battery, color: "text-emerald-400 bg-emerald-500/10", label: "UPS Efficiency", avg: "95.1 %" },
  { icon: Snowflake, color: "text-sky-400 bg-sky-500/10", label: "CRAC Status", avg: "18 / 20", unit: false },
  { icon: Activity, color: "text-violet-400 bg-violet-500/10", label: "Power Quality", avg: "THDv 2.1 %" },
];

function Sparkline({ color = "#10b981" }: { color?: string }) {
  const pts = Array.from({ length: 24 }, (_, i) => [i * 6, 16 + Math.sin(i * 0.7) * 5 + Math.cos(i * 0.3) * 3].join(",")).join(" ");
  return (
    <svg viewBox="0 0 144 32" className="w-full h-7">
      <polyline points={pts} stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function ForecastChart() {
  const w = 760, h = 220, pad = 28;
  const points = (seed: number, mult: number, dropAfter: number) =>
    Array.from({ length: 30 }, (_, i) => {
      const base = 120 + Math.sin(i * 0.4 + seed) * 12 + Math.cos(i * 0.7) * 6;
      const factor = i > dropAfter ? 1 - (i - dropAfter) * 0.02 : 1;
      return [pad + ((w - pad * 2) * i) / 29, h - pad - base * mult * factor];
    });
  const toPath = (pts: number[][], dashStart: number) => {
    const solid = pts.slice(0, dashStart + 1).map(p => p.join(",")).join(" ");
    const dashed = pts.slice(dashStart).map(p => p.join(",")).join(" ");
    return { solid, dashed };
  };
  const cost = toPath(points(0, 1, 14), 14);
  const energy = toPath(points(1, 0.9, 14), 14);
  const pue = toPath(points(2, 0.6, 14), 14);
  const carbon = toPath(points(3, 0.75, 14), 14);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-56">
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i} x1={pad} x2={w - pad} y1={pad + i * 40} y2={pad + i * 40} stroke="#1e293b" />
      ))}
      <line x1={pad + ((w - pad * 2) * 14) / 29} x2={pad + ((w - pad * 2) * 14) / 29} y1={pad} y2={h - pad} stroke="#475569" strokeDasharray="4 4" />
      <text x={pad + 10} y={pad + 10} fill="#94a3b8" fontSize="10">Historical</text>
      <text x={pad + ((w - pad * 2) * 14) / 29 + 10} y={pad + 10} fill="#60a5fa" fontSize="10">Forecast (with AI Optimization)</text>
      {[
        { d: cost, c: "#3b82f6" },
        { d: energy, c: "#10b981" },
        { d: pue, c: "#a855f7" },
        { d: carbon, c: "#f59e0b" },
      ].map((s, i) => (
        <g key={i}>
          <polyline points={s.d.solid} stroke={s.c} strokeWidth="1.5" fill="none" />
          <polyline points={s.d.dashed} stroke={s.c} strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        </g>
      ))}
      {["May 13","May 18","May 23","May 28","Jun 2","Jun 7","Jun 12"].map((d, i) => (
        <text key={d} x={pad + i * ((w - pad * 2) / 6)} y={h - 8} fill="#64748b" fontSize="10" textAnchor="middle">{d}</text>
      ))}
    </svg>
  );
}

function Donut() {
  const slices = [
    { val: 33, c: "#10b981" }, { val: 24, c: "#3b82f6" },
    { val: 22, c: "#f59e0b" }, { val: 21, c: "#a855f7" },
  ];
  let off = 0;
  const C = 2 * Math.PI * 50;
  return (
    <div className="relative h-44 w-44">
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
          <div className="text-xl font-bold text-white">$128,450</div>
          <div className="text-[11px] text-slate-400">Monthly Savings</div>
        </div>
      </div>
    </div>
  );
}

function SavingsBars() {
  const data = [{ m: "Mar", v: 70 }, { m: "Apr", v: 90 }, { m: "May", v: 110 }, { m: "Jun (Est.)", v: 128 }];
  const max = 150;
  return (
    <svg viewBox="0 0 260 140" className="w-full h-36">
      {[0, 50, 100, 150].map((v, i) => (
        <g key={v}>
          <line x1="34" x2="250" y1={120 - (v / max) * 100} y2={120 - (v / max) * 100} stroke="#1e293b" />
          <text x="28" y={124 - (v / max) * 100} textAnchor="end" fill="#64748b" fontSize="9">{v}K</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = 50 + i * 50;
        const h = (d.v / max) * 100;
        return (
          <g key={d.m}>
            <rect x={x} y={120 - h} width="28" height={h} fill="#3b82f6" rx="2" />
            <text x={x + 14} y="134" textAnchor="middle" fill="#94a3b8" fontSize="9">{d.m}</text>
          </g>
        );
      })}
    </svg>
  );
}

const actions = [
  { name: "Increase Temp Setpoint (+1.5°C)", target: "Data Hall B - CRAC Units", started: "May 20, 10:15 AM", impact: "$18,450", progress: 65 },
  { name: "Workload Migration (Off-Peak)", target: "VM Clusters (3)", started: "May 20, 09:45 AM", impact: "$6,800", progress: 45 },
  { name: "PDU Load Balancing", target: "PDU-2A to PDU-2B", started: "May 20, 09:30 AM", impact: "$4,100", progress: 80 },
  { name: "UPS Efficiency Optimization", target: "UPS Room A", started: "May 20, 08:50 AM", impact: "$2,200", progress: 35 },
];

export default function AiOptimization() {
  return (
    <div className="flex h-screen bg-[#070b14] text-slate-200">
      <Rail />
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">AI-Powered Power Optimization</h1>
            <p className="text-sm text-slate-400">IoT sensor data and AI/ML analysis to optimize power usage and reduce costs while maintaining performance and reliability.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative h-9 w-9 grid place-items-center rounded border border-slate-700 bg-slate-900">
              <Bell className="h-4 w-4 text-slate-300" />
              <span className="absolute -top-1 -right-1 h-4 w-4 grid place-items-center text-[10px] rounded-full bg-rose-500 text-white">3</span>
            </button>
            <button className="h-9 px-3 rounded border border-slate-700 bg-slate-900 text-xs flex items-center gap-2"><MapIcon className="h-4 w-4" /> DC1 — Ashburn <ChevronsUpDown className="h-3 w-3" /></button>
            <button className="h-9 px-3 rounded border border-slate-700 bg-slate-900 text-xs flex items-center gap-2"><Calendar className="h-4 w-4" /> Last 24 hours <ChevronsUpDown className="h-3 w-3" /></button>
            <button className="h-9 w-9 grid place-items-center rounded border border-slate-700 bg-slate-900"><RefreshCw className="h-4 w-4" /></button>
            <button className="h-9 px-3 rounded bg-blue-600 text-white text-xs flex items-center gap-2"><Download className="h-4 w-4" /> Export Report</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-6 gap-3">
            <ScoreTile />
            <KPI icon={DollarSign} iconClass="bg-emerald-500/10 text-emerald-400" label="Estimated Savings (Monthly)" value="$128,450" sub="↑ 14.6% vs last month" />
            <KPI icon={Leaf} iconClass="bg-emerald-500/10 text-emerald-400" label="Energy Savings (Monthly)" value={<>378 <span className="text-xs text-slate-400">MWh</span></>} sub="↑ 9.8% vs last month" />
            <KPI icon={Cloud} iconClass="bg-sky-500/10 text-sky-400" label="Carbon Reduction (Monthly)" value={<>189 <span className="text-xs text-slate-400">tCO₂e</span></>} sub="↑ 9.8% vs last month" />
            <KPI icon={Target} iconClass="bg-violet-500/10 text-violet-400" label="Active Optimizations" value="23" sub="Across 6 areas" subClass="text-slate-400" />
            <KPI icon={Brain} iconClass="bg-blue-500/10 text-blue-400" label="AI Model Confidence" value="92%" sub="High Confidence" subClass="text-slate-400" />
          </div>

          {/* Scenarios + Insights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40">
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div>
                  <div className="font-semibold text-white">Optimization Scenarios</div>
                  <div className="text-xs text-slate-400">AI-generated optimization scenarios based on IoT data and predictive analytics</div>
                </div>
                <a className="text-xs text-blue-400 hover:underline cursor-pointer">View All Scenarios →</a>
              </div>
              <table className="w-full text-xs">
                <thead className="text-slate-400">
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-4 py-2 font-normal">Scenario</th>
                    <th className="text-left px-2 py-2 font-normal">Potential Savings</th>
                    <th className="text-left px-2 py-2 font-normal">Energy Savings</th>
                    <th className="text-left px-2 py-2 font-normal">Impact</th>
                    <th className="text-left px-2 py-2 font-normal">Confidence</th>
                    <th className="text-left px-2 py-2 font-normal">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map(s => (
                    <tr key={s.name} className="border-b border-slate-800/60">
                      <td className="px-4 py-3 text-white">{s.name}</td>
                      <td className="px-2 py-3 text-emerald-400">{s.save} <span className="text-slate-500">/ month</span></td>
                      <td className="px-2 py-3 text-slate-300">{s.energy} <span className="text-slate-500">/ month</span></td>
                      <td className={`px-2 py-3 ${s.impactColor}`}>{s.impact}</td>
                      <td className="px-2 py-3 text-slate-300">{s.conf}%</td>
                      <td className="px-2 py-3"><button className="px-3 py-1 rounded bg-blue-600 text-white text-[11px]">Apply</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40">
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div>
                  <div className="font-semibold text-white">AI Insights</div>
                  <div className="text-xs text-slate-400">Key insights from IoT sensors and AI analysis</div>
                </div>
                <a className="text-xs text-blue-400 hover:underline cursor-pointer">View All Insights →</a>
              </div>
              <div className="divide-y divide-slate-800">
                {insights.map((it, i) => {
                  const Icon = it.icon;
                  return (
                    <div key={i} className="px-4 py-3 flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-md grid place-items-center ${it.color}`}><Icon className="h-4 w-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white">{it.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{it.desc}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-400">Potential Savings</div>
                        <div className="text-emerald-400 text-sm font-semibold">{it.save} <span className="text-slate-500 text-xs font-normal">/ month</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Forecast + IoT */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Optimization Impact Forecast</div>
                  <div className="text-xs text-slate-400">Projected impact of applying AI recommendations</div>
                </div>
                <div className="flex rounded border border-slate-700 overflow-hidden text-xs">
                  <button className="px-3 py-1 text-slate-400">7 Days</button>
                  <button className="px-3 py-1 bg-blue-600 text-white">30 Days</button>
                  <button className="px-3 py-1 text-slate-400">90 Days</button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Total Cost ($)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Energy (MWh)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-500" /> PUE</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Carbon (tCO₂e)</span>
              </div>
              <ForecastChart />
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">IoT Sensor Overview</div>
                  <div className="text-xs text-slate-400">Real-time data from 12,842 IoT sensors</div>
                </div>
                <a className="text-xs text-blue-400 hover:underline cursor-pointer">View Sensor Map →</a>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-3">
                {sensorTiles.map(t => {
                  const Icon = t.icon;
                  return (
                    <div key={t.label} className="rounded border border-slate-800 p-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-7 w-7 rounded grid place-items-center ${t.color}`}><Icon className="h-4 w-4" /></div>
                        <div className="text-[11px] text-slate-300">{t.label}</div>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-400">Avg <span className="text-white">{t.avg}</span></div>
                      <div className="text-[10px] text-emerald-400">Optimal</div>
                      <Sparkline />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions + Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40">
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div>
                  <div className="font-semibold text-white">Optimization Actions (Active)</div>
                  <div className="text-xs text-slate-400">Real-time actions being executed by the AI optimization engine</div>
                </div>
                <a className="text-xs text-blue-400 hover:underline cursor-pointer">View All Actions →</a>
              </div>
              <table className="w-full text-xs">
                <thead className="text-slate-400">
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-4 py-2 font-normal">Action</th>
                    <th className="text-left px-2 py-2 font-normal">Target</th>
                    <th className="text-left px-2 py-2 font-normal">Status</th>
                    <th className="text-left px-2 py-2 font-normal">Started</th>
                    <th className="text-left px-2 py-2 font-normal">Impact (Est.)</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map(a => (
                    <tr key={a.name} className="border-b border-slate-800/60">
                      <td className="px-4 py-3">
                        <div className="text-white">{a.name}</div>
                        <div className="mt-1 h-1 w-32 rounded bg-slate-800 overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${a.progress}%` }} />
                        </div>
                      </td>
                      <td className="px-2 py-3 text-slate-300">{a.target}</td>
                      <td className="px-2 py-3"><span className="inline-flex items-center gap-1 text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active</span></td>
                      <td className="px-2 py-3 text-slate-400">{a.started}</td>
                      <td className="px-2 py-3 text-emerald-400">{a.impact} <span className="text-slate-500">/ month</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Optimization Summary</div>
                  <div className="text-xs text-slate-400">Cumulative impact of AI optimizations</div>
                </div>
                <a className="text-xs text-blue-400 hover:underline cursor-pointer">View Full Report →</a>
              </div>
              <div className="mt-4 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
                <Donut />
                <div className="space-y-2 text-xs">
                  {[
                    { c: "bg-emerald-500", l: "Cooling Optimization", v: "$42,350 (33%)" },
                    { c: "bg-blue-500", l: "Workload Optimization", v: "$31,200 (24%)" },
                    { c: "bg-amber-500", l: "Power Infrastructure", v: "$28,650 (22%)" },
                    { c: "bg-violet-500", l: "Other Optimizations", v: "$26,230 (21%)" },
                  ].map(r => (
                    <div key={r.l} className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${r.c}`} />
                      <span className="flex-1 text-slate-300">{r.l}</span>
                      <span className="text-slate-400">{r.v}</span>
                    </div>
                  ))}
                </div>
                <div className="w-56">
                  <div className="text-xs text-slate-400">Savings Over Time</div>
                  <div className="text-[10px] text-slate-500">(Monthly $)</div>
                  <SavingsBars />
                </div>
              </div>
            </div>
          </div>

          {/* Footer engine bar */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md grid place-items-center bg-blue-500/10 text-blue-400"><Brain className="h-5 w-5" /></div>
              <div>
                <div className="text-sm font-semibold text-white">AI Optimization Engine</div>
                <div className="text-xs text-slate-400">Continuously learning and optimizing based on IoT data, historical patterns, and real-time conditions.</div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-6 text-xs">
              <div><span className="text-slate-400">Model Status:</span> <span className="text-emerald-400">● Healthy</span></div>
              <div><span className="text-slate-400">Last Model Update:</span> <span className="text-white">May 20, 2024 10:00 AM</span></div>
              <div><span className="text-slate-400">Next Optimization Cycle:</span> <span className="text-white">3m 45s</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
