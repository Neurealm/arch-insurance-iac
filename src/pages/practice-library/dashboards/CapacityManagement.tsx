import { Link } from "react-router-dom";
import {
  Zap, Bell, RefreshCw, Download, Activity, Map as MapIcon, BarChart3, TrendingUp,
  Gauge, Settings as SettingsIcon, Battery, Power, Cpu, Layers, FileText, PieChart,
  Plug, ChevronLeft, ChevronsUpDown, Calendar, Brain, Sparkles,
  Lightbulb, CircleDot, ShieldAlert, Snowflake, Cog, Server, ArrowRight,
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
    { label: "Capacity Management", icon: Gauge, active: true },
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
function DonutGauge({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 28, c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return (
    <div className="relative h-20 w-20">
      <svg viewBox="0 0 72 72" className="h-20 w-20 -rotate-90">
        <circle cx="36" cy="36" r={r} stroke="#1e293b" strokeWidth="7" fill="none" />
        <circle cx="36" cy="36" r={r} stroke={color} strokeWidth="7" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-sm font-bold text-white">{pct}%</div>
          <div className="text-[9px] text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, unit, sub, pct, color, label }: any) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="text-xs text-slate-400 mb-2">{title}</div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-[11px] text-slate-500">{sub}</div>
        </div>
        <DonutGauge pct={pct} color={color} label={label} />
      </div>
      <div className="mt-2 h-1 bg-slate-800 rounded overflow-hidden">
        <div className="h-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function Select({ icon: Icon, value, badge }: any) {
  return (
    <button className="h-9 px-3 rounded border border-slate-700 bg-slate-900 text-slate-200 text-xs flex items-center gap-2">
      {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
      {value}
      {badge && <span className="text-[10px] bg-rose-500 text-white rounded-full px-1.5 ml-1">{badge}</span>}
      <ChevronsUpDown className="h-3 w-3 text-slate-500" />
    </button>
  );
}

/* ---------- charts ---------- */
function UtilizationByCategory() {
  const cats = [
    { name: "Power (kW)", util: 82, rem: 18 },
    { name: "IT Load (kW)", util: 83, rem: 17 },
    { name: "Cooling (Tons)", util: 85, rem: 15 },
    { name: "Rack Space", util: 84, rem: 16 },
    { name: "Network (Gbps)", util: 68, rem: 32 },
  ];
  return (
    <svg viewBox="0 0 560 260" className="w-full h-64">
      <defs>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#475569" strokeWidth="2" />
        </pattern>
      </defs>
      {[0, 25, 50, 75, 100].map((y) => (
        <g key={y}>
          <line x1="50" x2="540" y1={220 - y * 2} y2={220 - y * 2} stroke="#1e293b" />
          <text x="42" y={224 - y * 2} fill="#64748b" fontSize="9" textAnchor="end">{y}%</text>
        </g>
      ))}
      {cats.map((c, i) => {
        const x = 80 + i * 95;
        const utilH = c.util * 2;
        const remH = c.rem * 2;
        return (
          <g key={c.name}>
            <rect x={x} y={220 - utilH - remH} width="50" height={remH} fill="url(#hatch)" />
            <rect x={x} y={220 - utilH} width="50" height={utilH} fill="#3b82f6" />
            <text x={x + 25} y="240" fill="#94a3b8" fontSize="10" textAnchor="middle">{c.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ITLoadCapacityTrend() {
  const histPts: string[] = [];
  for (let i = 0; i < 60; i++) {
    const x = 50 + i * 5;
    const y = 170 - (60 + Math.sin(i * 0.4) * 10 + Math.random() * 6);
    histPts.push(`${x},${y}`);
  }
  const fcPts: string[] = [];
  for (let i = 0; i < 40; i++) {
    const x = 350 + i * 5;
    const y = 170 - (75 + i * 1.1);
    fcPts.push(`${x},${y}`);
  }
  return (
    <svg viewBox="0 0 560 220" className="w-full h-56">
      {[0, 4, 8, 12, 16, 20].map((v) => (
        <g key={v}>
          <line x1="50" x2="550" y1={170 - v * 7} y2={170 - v * 7} stroke="#1e293b" />
          <text x="42" y={174 - v * 7} fill="#64748b" fontSize="9" textAnchor="end">{v}K</text>
        </g>
      ))}
      <line x1="50" y1="50" x2="550" y2="50" stroke="#ef4444" strokeDasharray="4 3" />
      <text x="540" y="46" fill="#ef4444" fontSize="9" textAnchor="end">Capacity Limit</text>
      <polyline points={histPts.join(" ")} stroke="#3b82f6" fill="none" strokeWidth="1.5" />
      <polyline points={fcPts.join(" ")} stroke="#10b981" fill="none" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="350" y1="20" x2="350" y2="195" stroke="#475569" strokeDasharray="3 3" />
      <text x="355" y="30" fill="#94a3b8" fontSize="10">Forecast →</text>
      {["Mar '24","Apr '24","May '24","Jun '24","Jul '24","Aug '24"].map((m, i) => (
        <text key={m} x={70 + i * 95} y="210" fill="#94a3b8" fontSize="10" textAnchor="middle">{m}</text>
      ))}
    </svg>
  );
}

/* ---------- page ---------- */
export default function CapacityManagement() {
  const categoryRows = [
    { name: "Power (kW)", util: "82%", used: "13,120", total: "16,000", rem: "2,880", c: "text-emerald-400" },
    { name: "IT Load (kW)", util: "83%", used: "12,450", total: "15,000", rem: "2,550", c: "text-emerald-400" },
    { name: "Cooling (Tons)", util: "85%", used: "4,230", total: "5,000", rem: "770", c: "text-amber-400" },
    { name: "Rack Space", util: "84%", used: "1,680", total: "2,000", rem: "320", c: "text-amber-400" },
    { name: "Network (Gbps)", util: "68%", used: "6,800", total: "10,000", rem: "3,200", c: "text-emerald-400" },
  ];
  const areaRows = [
    { name: "Data Hall A", load: 3250, cap: 4000, pct: 81 },
    { name: "Data Hall B", load: 2980, cap: 3500, pct: 85 },
    { name: "Data Hall C", load: 2750, cap: 3500, pct: 79 },
    { name: "Data Hall D", load: 1870, cap: 2500, pct: 75 },
    { name: "Data Hall E", load: 1600, cap: 2000, pct: 80 },
    { name: "Data Hall F", load: 1100, cap: 1500, pct: 73 },
  ];
  const headroom = [
    { r: "Power (kW)", h: "2,880 kW (18%)", d: "Nov 15, 2024", s: "At Risk", c: "text-rose-400" },
    { r: "IT Load (kW)", h: "2,550 kW (17%)", d: "Sep 28, 2024", s: "At Risk", c: "text-rose-400" },
    { r: "Cooling (Tons)", h: "770 Tons (15%)", d: "Dec 10, 2024", s: "At Risk", c: "text-rose-400" },
    { r: "Rack Space", h: "320 Racks (16%)", d: "Feb 14, 2025", s: "Monitor", c: "text-amber-400" },
    { r: "Network (Gbps)", h: "3,200 Gbps (32%)", d: "N/A", s: "Good", c: "text-emerald-400" },
  ];
  const consumers = [
    { n: "Cluster-Prod-01", t: "Compute Cluster", l: 620, p: 4.97 },
    { n: "Cluster-Prod-02", t: "Compute Cluster", l: 580, p: 4.65 },
    { n: "Storage-Array-01", t: "Storage", l: 410, p: 3.29 },
    { n: "AI-Training-01", t: "AI/ML Workload", l: 380, p: 3.05 },
    { n: "Cluster-Dev-01", t: "Compute Cluster", l: 345, p: 2.77 },
  ];
  const recs = [
    { icon: Zap, color: "text-amber-400", title: "Rebalance workloads in Data Hall C", desc: "Move non-critical workloads to Data Hall D to increase headroom by 320 kW.", gain: "320 kW" },
    { icon: Snowflake, color: "text-sky-400", title: "Optimize cooling setpoints", desc: "Raising chilled water setpoint by 1°C can free up 120 tons of cooling capacity.", gain: "120 Tons" },
    { icon: Server, color: "text-violet-400", title: "Decommission underutilized racks", desc: "Identify and decommission 45 low-utilization racks.", gain: "45 Racks" },
    { icon: Activity, color: "text-emerald-400", title: "Enable power capping for non-critical workloads", desc: "Apply dynamic caps during off-peak hours to reserve capacity.", gain: "200 kW" },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 flex">
      <Rail />
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0b1220]">
          <div>
            <h1 className="text-xl font-semibold text-white">Capacity Management</h1>
            <p className="text-xs text-slate-400">Plan, monitor, and optimize data center capacity to ensure efficient resource utilization and support future growth.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select icon={Bell} value="" badge={3} />
            <Select icon={MapIcon} value="DC1 — Ashburn" />
            <Select icon={Calendar} value="May 13 — May 20, 2024" />
            <button className="h-9 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs flex items-center gap-2">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-800 bg-[#0b1220]">
          <div className="flex items-center gap-6 text-xs">
            {["Overview","Power Capacity","IT Capacity","Cooling Capacity","Space Capacity","Trends & Planning","Reports"].map((t, i) => (
              <button key={t} className={`py-3 border-b-2 ${i===0 ? "border-blue-500 text-blue-300" : "border-transparent text-slate-400 hover:text-slate-200"}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-5 gap-4">
            <KpiCard title="Total IT Capacity (kW)" value="12,450" sub="of 15,000 kW" pct={83} color="#3b82f6" label="Utilized" />
            <KpiCard title="Power Capacity (kW)" value="13,120" sub="of 16,000 kW" pct={82} color="#10b981" label="Utilized" />
            <KpiCard title="Cooling Capacity (Tons)" value="4,230" sub="of 5,000 Tons" pct={85} color="#a855f7" label="Utilized" />
            <KpiCard title="Rack Space" value="1,680" sub="of 2,000 Racks" pct={84} color="#f59e0b" label="Utilized" />
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-xs text-slate-400 mb-2">Capacity Efficiency Score</div>
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold text-white">79</div>
                <div className="text-xs text-slate-500">/ 100</div>
              </div>
              <div className="text-[11px] text-emerald-400">Good</div>
              <div className="text-[11px] text-emerald-400 mt-1">↑ 5 vs last 7 days</div>
              <svg viewBox="0 0 200 30" className="w-full h-8 mt-1">
                <polyline
                  points={Array.from({length:40},(_,i)=>`${i*5},${20-Math.sin(i*0.4)*6-Math.cos(i*0.2)*3}`).join(" ")}
                  stroke="#10b981" fill="none" strokeWidth="1.3" />
              </svg>
            </div>
          </div>

          {/* Middle row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Utilization */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-white">Capacity Utilization by Category</div>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-400 mb-1">
                <div className="flex items-center gap-1"><span className="h-2 w-3 bg-blue-500 inline-block" />Utilization (%)</div>
                <div className="flex items-center gap-1"><span className="h-2 w-3 inline-block" style={{background:"repeating-linear-gradient(45deg,#475569 0 2px,transparent 2px 4px)"}}/>Remaining Capacity (%)</div>
              </div>
              <UtilizationByCategory />
              <table className="w-full text-[11px] mt-2">
                <thead className="text-slate-500">
                  <tr><th className="text-left py-1">Category</th><th className="text-left">Utilization</th><th className="text-left">Used</th><th className="text-left">Total</th><th className="text-left">Remaining</th></tr>
                </thead>
                <tbody>
                  {categoryRows.map(r => (
                    <tr key={r.name} className="border-t border-slate-800/60">
                      <td className="py-1.5 text-slate-300">{r.name}</td>
                      <td className={r.c}>{r.util}</td>
                      <td className="text-slate-300">{r.used}</td>
                      <td className="text-slate-300">{r.total}</td>
                      <td className="text-slate-300">{r.rem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Trend */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white mb-2">IT Load Capacity Trend (kW)</div>
              <div className="flex items-center gap-4 text-[10px] text-slate-400 mb-1">
                <div className="flex items-center gap-1"><span className="h-0.5 w-3 bg-blue-500 inline-block" />Historical</div>
                <div className="flex items-center gap-1"><span className="h-0.5 w-3 bg-emerald-500 inline-block" />Forecast</div>
                <div className="flex items-center gap-1"><span className="h-0.5 w-3 bg-rose-500 inline-block" />Capacity Limit</div>
              </div>
              <ITLoadCapacityTrend />
              <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
                <div>
                  <div className="text-slate-500">Current (May 20)</div>
                  <div className="text-white font-semibold">12,450 kW</div>
                  <div className="text-emerald-400">83% of capacity</div>
                </div>
                <div>
                  <div className="text-slate-500">Forecast (Aug 20)</div>
                  <div className="text-white font-semibold">14,200 kW</div>
                  <div className="text-emerald-400">95% of capacity</div>
                </div>
                <div>
                  <div className="text-slate-500">Remaining (Aug 20)</div>
                  <div className="text-white font-semibold">800 kW</div>
                  <div className="text-emerald-400">5% of capacity</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <div>
                  <div className="text-slate-500">Forecast Status</div>
                  <span className="inline-block px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 mt-0.5">At Risk</span>
                </div>
                <div className="text-slate-400">Action recommended</div>
              </div>
              <Link to="/practice-library/infrastructure-hybrid-platform/forecasting" className="mt-3 block text-center text-xs text-blue-400 hover:text-blue-300">View Forecasting Details →</Link>
            </div>

            {/* Capacity by Area */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white mb-3">Capacity by Area</div>
              <table className="w-full text-[11px]">
                <thead className="text-slate-500">
                  <tr><th className="text-left">Area</th><th className="text-left">IT Load (kW)</th><th className="text-left">Capacity (kW)</th><th className="text-right">Utilization</th></tr>
                </thead>
                <tbody>
                  {areaRows.map(a => (
                    <tr key={a.name} className="border-t border-slate-800/60">
                      <td className="py-1.5 text-slate-300">{a.name}</td>
                      <td className="text-slate-300">{a.load.toLocaleString()}</td>
                      <td className="text-slate-300">{a.cap.toLocaleString()}</td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-800 rounded overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${a.pct}%` }} />
                          </div>
                          <span className="text-slate-300">{a.pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-slate-700 font-semibold">
                    <td className="py-1.5 text-white">Total</td>
                    <td className="text-white">13,550</td>
                    <td className="text-white">17,000</td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-800 rounded overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: "80%" }} />
                        </div>
                        <span className="text-white">80%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <Link to="/practice-library/infrastructure-hybrid-platform/power-map" className="mt-3 block text-center text-xs text-blue-400 hover:text-blue-300">View Power Map →</Link>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Headroom */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white">Capacity Headroom Forecast</div>
              <div className="text-[11px] text-slate-500 mb-3">Shows when capacity limits may be reached based on current growth trends.</div>
              <table className="w-full text-[11px]">
                <thead className="text-slate-500">
                  <tr><th className="text-left">Resource</th><th className="text-left">Current Headroom</th><th className="text-left">Projected Exhaustion</th><th className="text-right">Status</th></tr>
                </thead>
                <tbody>
                  {headroom.map(h => (
                    <tr key={h.r} className="border-t border-slate-800/60">
                      <td className="py-1.5 text-slate-300">{h.r}</td>
                      <td className="text-slate-300">{h.h}</td>
                      <td className="text-slate-300">{h.d}</td>
                      <td className={`text-right ${h.c}`}>◆ {h.s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link to="/practice-library/infrastructure-hybrid-platform/forecasting" className="mt-3 block text-center text-xs text-blue-400 hover:text-blue-300">View Trends & Planning →</Link>
            </div>

            {/* Top consumers */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white mb-3">Top Capacity Consumers</div>
              <table className="w-full text-[11px]">
                <thead className="text-slate-500">
                  <tr><th className="text-left">Name</th><th className="text-left">Type</th><th className="text-left">IT Load (kW)</th><th className="text-right">% of Total</th></tr>
                </thead>
                <tbody>
                  {consumers.map(c => (
                    <tr key={c.n} className="border-t border-slate-800/60">
                      <td className="py-1.5 text-slate-300">{c.n}</td>
                      <td className="text-slate-400">{c.t}</td>
                      <td className="text-slate-300">{c.l}</td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${c.p * 20}%` }} />
                          </div>
                          <span className="text-slate-300">{c.p}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <a className="mt-3 block text-center text-xs text-blue-400 hover:text-blue-300 cursor-pointer">View All Workloads →</a>
            </div>

            {/* Recommendations */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white mb-3">Recommendations</div>
              <div className="space-y-3">
                {recs.map(r => {
                  const Icon = r.icon;
                  return (
                    <div key={r.title} className="flex items-start gap-3">
                      <div className={`h-7 w-7 rounded bg-slate-800 grid place-items-center ${r.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-white font-medium truncate">{r.title}</div>
                        <div className="text-[10px] text-slate-400 leading-snug">{r.desc}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-500">Potential Gain</div>
                        <div className="text-[11px] text-emerald-400 font-semibold">{r.gain}</div>
                        <button className="mt-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] flex items-center gap-1">View Action <ArrowRight className="h-2.5 w-2.5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-800 px-6 py-3 text-[11px] text-slate-400 flex items-center justify-between bg-[#0b1220]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Data Source: Integrated DCIM</span>
            <span>All times shown in EDT</span>
            <span>Last updated: May 20, 2024 10:30:15 AM EDT</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Auto-refresh: On</span>
            <span className="px-2 py-1 rounded border border-slate-700 bg-slate-900 flex items-center gap-1">5 min <ChevronsUpDown className="h-3 w-3" /></span>
            <RefreshCw className="h-3.5 w-3.5 cursor-pointer" />
            <Cog className="h-3.5 w-3.5 cursor-pointer" />
          </div>
        </footer>
      </main>
    </div>
  );
}
