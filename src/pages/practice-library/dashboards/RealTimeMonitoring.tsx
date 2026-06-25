import { Link } from "react-router-dom";
import {
  Zap, Bell, RefreshCw, Download, Activity, Map as MapIcon, BarChart3, TrendingUp,
  Gauge, Settings as SettingsIcon, Battery, Power, Cpu, Layers, FileText, PieChart,
  Plug, ChevronLeft, ChevronsUpDown, Server, Leaf, DollarSign, Waves, PencilLine,
  CircleDot, ShieldAlert, ArrowRight,
  Brain,
} from "lucide-react";

/* ---------- side rail ---------- */
const navGroups: { title: string; items: { label: string; icon: any; to?: string; active?: boolean; badge?: number }[] }[] = [
  { title: "Overview", items: [
    { label: "Power Overview", icon: Zap, to: "/practice-library/infrastructure-hybrid-platform/power-admin-console" },
    { label: "Power Map", icon: MapIcon, to: "/practice-library/infrastructure-hybrid-platform/power-map" },
    { label: "Alerts", icon: Bell, badge: 3, to: "/practice-library/infrastructure-hybrid-platform/power-alerts" },
  ]},
  { title: "Monitoring", items: [
    { label: "Real-time Monitoring", icon: Activity, active: true },
    { label: "Historical Analysis", icon: BarChart3, to: "/practice-library/infrastructure-hybrid-platform/historical-analysis" },
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

/* ---------- sparkline ---------- */
function Spark({ data, color, height = 36 }: { data: number[]; color: string; height?: number }) {
  const w = 240;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const d = data.map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  const area = `${d} L${w},${height} L0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <path d={area} fill={color} fillOpacity={0.15} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.4} />
    </svg>
  );
}
const rng = (seed: number, n = 40, base = 50, amp = 8) =>
  Array.from({ length: n }, (_, i) => base + Math.sin(i * 0.5 + seed) * amp + Math.cos(i * 1.3 + seed) * (amp / 2));

/* ---------- KPI tile ---------- */
function Kpi({ icon: Icon, iconBg, label, value, unit, footer, spark, sparkColor }: any) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
      <div className="flex items-start gap-2">
        <div className={`h-7 w-7 rounded-md grid place-items-center ${iconBg}`}><Icon className="h-4 w-4" /></div>
        <div className="flex-1">
          <div className="text-[11px] text-slate-400">{label}</div>
          <div className="text-2xl font-bold text-white tabular-nums leading-tight">{value} {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}</div>
        </div>
      </div>
      <div className="mt-1 text-[11px] text-slate-400">{footer}</div>
      <div className="mt-1"><Spark data={spark} color={sparkColor} /></div>
    </div>
  );
}

/* ---------- facility power trend (multi-line) ---------- */
function FacilityTrend() {
  const labels = ["08:30","09:40","09:50","10:00","10:10","10:20","10:30","Now"];
  const total = [8.2,8.3,8.35,8.4,8.42,8.45,8.5,8.42];
  const it = [6.0,6.1,6.15,6.2,6.21,6.25,6.3,6.21];
  const nit = [2.1,2.15,2.2,2.18,2.21,2.2,2.22,2.21];
  const cap = Array(8).fill(13.5);
  const w = 720, h = 230, pad = { l: 28, r: 12, t: 14, b: 22 };
  const yMax = 15;
  const ww = w - pad.l - pad.r, hh = h - pad.t - pad.b;
  const y = (v: number) => pad.t + hh - (v / yMax) * hh;
  const xStep = ww / (labels.length - 1);
  const mk = (d: number[]) => d.map((v, i) => `${i === 0 ? "M" : "L"}${pad.l + i * xStep},${y(v)}`).join(" ");
  const grid = [0, 3, 6, 9, 12, 15];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {grid.map((g) => (
        <g key={g}>
          <line x1={pad.l} x2={w - pad.r} y1={y(g)} y2={y(g)} stroke="#1f2937" strokeWidth={0.5} />
          <text x={4} y={y(g) + 3} fontSize={9} fill="#64748b">{g}</text>
        </g>
      ))}
      <text x={4} y={12} fontSize={9} fill="#94a3b8">MW</text>
      <path d={mk(cap)} fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 3" />
      <path d={mk(total)} fill="none" stroke="#3b82f6" strokeWidth={1.8} />
      <path d={mk(it)} fill="none" stroke="#10b981" strokeWidth={1.6} />
      <path d={mk(nit)} fill="none" stroke="#a855f7" strokeWidth={1.6} />
      {labels.map((l, i) => (
        <text key={l} x={pad.l + i * xStep} y={h - 6} fontSize={9} fill="#64748b" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

/* ---------- donut ---------- */
function Donut({ segments }: { segments: { v: number; color: string }[] }) {
  const size = 220, stroke = 28, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const sum = segments.reduce((a, b) => a + b.v, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1f2937" strokeWidth={stroke} />
      {segments.map((s, i) => {
        const len = (s.v / sum) * c;
        const el = (
          <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        );
        offset += len;
        return el;
      })}
      <text x="50%" y="48%" textAnchor="middle" fontSize={28} fontWeight={700} fill="#fff">8.42</text>
      <text x="50%" y="58%" textAnchor="middle" fontSize={11} fill="#94a3b8">MW</text>
      <text x="50%" y="68%" textAnchor="middle" fontSize={10} fill="#64748b">Total</text>
    </svg>
  );
}

/* ---------- heatmap ---------- */
const heatColor = (v: number) => v >= 10 ? "#ef4444" : v >= 8 ? "#f97316" : v >= 6 ? "#facc15" : v >= 4 ? "#84cc16" : v >= 2 ? "#10b981" : "#16a34a";
const heatRows: { row: string; racks: { id: string; v: number }[] }[] = [
  { row: "A", racks: [["A2",3],["A3",4],["A4",5],["A6",6]].map(([id,v]) => ({ id: id as string, v: v as number })) },
  { row: "B", racks: [["B1",6],["B3",7],["B4",8],["B6",7]].map(([id,v]) => ({ id: id as string, v: v as number })) },
  { row: "C", racks: [["C1",9],["C2",10],["C3",11],["C4",10],["C5",9],["C6",9]].map(([id,v]) => ({ id: id as string, v: v as number })) },
];

/* ---------- page ---------- */
export default function RealTimeMonitoring() {
  const tabs = ["Power", "PUE", "Environment", "Equipment", "Events"];
  return (
    <div className="min-h-screen bg-[#070d1a] text-slate-200 flex">
      <Rail />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-4 border-b border-slate-800 flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">Real-time Monitoring</h1>
            <p className="text-xs text-slate-400">Live visibility into data center power infrastructure</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <button className="relative h-8 w-8 grid place-items-center border border-slate-700 rounded">
              <Bell className="h-4 w-4 text-slate-300" />
              <span className="absolute -top-1 -right-1 text-[10px] bg-rose-500 text-white rounded-full px-1">3</span>
            </button>
            <button className="border border-slate-700 rounded px-2 py-1.5 flex items-center gap-1 text-slate-200">DC1 - Ashburn <ChevronsUpDown className="h-3 w-3" /></button>
            <button className="border border-slate-700 rounded px-2 py-1.5 flex items-center gap-1 text-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live (Auto-refresh) <ChevronsUpDown className="h-3 w-3" />
            </button>
            <button className="border border-slate-700 rounded px-2 py-1.5 flex items-center gap-1 text-slate-200"><RefreshCw className="h-3 w-3" /> 10s</button>
            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-1"><Download className="h-3 w-3" /> Export</button>
          </div>
        </header>

        <div className="p-6 space-y-4">
          {/* tabs */}
          <div className="flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-6 text-xs">
              {tabs.map((t, i) => (
                <button key={t} className={`pb-2 ${i === 0 ? "text-blue-300 border-b-2 border-blue-400 font-semibold" : "text-slate-400 hover:text-slate-200"}`}>{t}</button>
              ))}
            </div>
            <button className="border border-slate-700 rounded px-2 py-1.5 text-xs flex items-center gap-1 text-slate-200 mb-1"><PencilLine className="h-3 w-3" /> Edit Layout</button>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-6 gap-3">
            <Kpi icon={Zap} iconBg="bg-blue-500/15 text-blue-400" label="Total Facility Load" value="8.42" unit="MW" footer="62% of 13.5 MW" spark={rng(1, 40, 8.3, 0.2)} sparkColor="#3b82f6" />
            <Kpi icon={Server} iconBg="bg-emerald-500/15 text-emerald-400" label="IT Load" value="6.21" unit="MW" footer="73% of 8.5 MW" spark={rng(2, 40, 6.2, 0.15)} sparkColor="#10b981" />
            <Kpi icon={Leaf} iconBg="bg-lime-500/15 text-lime-400" label="Power Usage Effectiveness" value="1.38" unit="" footer="Target < 1.50" spark={rng(3, 40, 1.38, 0.04)} sparkColor="#84cc16" />
            <Kpi icon={DollarSign} iconBg="bg-purple-500/15 text-purple-400" label="Total Cost (Today)" value="$142,536" unit="" footer="$0.12 / kWh ↓ 4.7%" spark={rng(4, 40, 50, 5)} sparkColor="#a855f7" />
            <Kpi icon={Leaf} iconBg="bg-emerald-500/15 text-emerald-400" label="Carbon Intensity" value="284" unit="gCO₂e/kWh" footer="↓ 6.2% vs yesterday" spark={rng(5, 40, 50, 4)} sparkColor="#10b981" />
            <Kpi icon={Waves} iconBg="bg-teal-500/15 text-teal-400" label="Grid Frequency" value="60.02" unit="Hz" footer="Normal" spark={rng(6, 40, 60, 0.05)} sparkColor="#14b8a6" />
          </div>

          {/* Trend + Donut + Live Load */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-white">Facility Power Trend</div>
                <ChevronsUpDown className="h-3 w-3 text-slate-500" />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300 mb-1">
                <span className="flex items-center gap-1"><span className="h-[2px] w-4 bg-blue-500" /> Total Facility Load (MW)</span>
                <span className="flex items-center gap-1"><span className="h-[2px] w-4 bg-emerald-500" /> IT Load (MW)</span>
                <span className="flex items-center gap-1"><span className="h-[2px] w-4 bg-purple-500" /> Non-IT Load (MW)</span>
                <span className="flex items-center gap-1"><span className="h-[2px] w-4 border-t border-dashed border-slate-400" /> Capacity (MW)</span>
              </div>
              <FacilityTrend />
            </div>

            <div className="col-span-3 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-white">Power Distribution</div>
                <ChevronsUpDown className="h-3 w-3 text-slate-500" />
              </div>
              <div className="flex items-center gap-3">
                <Donut segments={[
                  { v: 73.7, color: "#3b82f6" },
                  { v: 16.0, color: "#10b981" },
                  { v: 7.0,  color: "#ef4444" },
                  { v: 1.8,  color: "#facc15" },
                  { v: 1.5,  color: "#94a3b8" },
                ]} />
                <div className="flex-1 text-[11px] space-y-1.5">
                  {[
                    ["#3b82f6", "IT Equipment", "6.21 MW", "(73.7%)"],
                    ["#10b981", "Cooling", "1.35 MW", "(16.0%)"],
                    ["#ef4444", "Power Loss", "0.59 MW", "(7.0%)"],
                    ["#facc15", "Lighting", "0.15 MW", "(1.8%)"],
                    ["#94a3b8", "Other", "0.12 MW", "(1.5%)"],
                  ].map(([c, l, v, p]) => (
                    <div key={l} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: c }} />
                      <span className="flex-1 text-slate-300">{l}</span>
                      <span className="text-slate-200 tabular-nums">{v}</span>
                      <span className="text-slate-500">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link to="/practice-library/infrastructure-hybrid-platform/power-map" className="mt-3 text-[11px] text-blue-400 flex items-center gap-1 justify-end">View Power Map <ArrowRight className="h-3 w-3" /></Link>
            </div>

            <div className="col-span-3 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-white">Live Load by Area <span className="text-[11px] text-slate-400 font-normal">(MW)</span></div>
                <button className="text-[11px] text-blue-400">View All</button>
              </div>
              <div className="space-y-2.5">
                {[
                  ["Data Hall A", 2.48, 82, "bg-amber-500"],
                  ["Data Hall B", 2.21, 73, "bg-yellow-500"],
                  ["Data Hall C", 1.98, 66, "bg-emerald-500"],
                  ["Cooling Systems", 1.35, 71, "bg-yellow-500"],
                  ["Electrical Room", 0.68, 58, "bg-emerald-500"],
                  ["Office & Other", 0.32, 42, "bg-emerald-500"],
                ].map(([name, mw, pct, color]) => (
                  <div key={name as string}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">{name}</span>
                      <span className="text-slate-300 tabular-nums">{mw} MW <span className="text-slate-500 ml-1">{pct}%</span></span>
                    </div>
                    <div className="h-1.5 mt-1 rounded-full bg-slate-800 overflow-hidden"><div className={`h-full ${color}`} style={{ width: `${pct}%` }} /></div>
                  </div>
                ))}
                <div className="flex justify-between text-[10px] text-slate-500 pt-1"><span>0</span><span>2.5</span><span>5 MW</span></div>
              </div>
            </div>
          </div>

          {/* PDU + UPS + Environmental */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-white">PDU Load (Top 6)</div>
                <button className="text-[11px] text-blue-400">View All</button>
              </div>
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase text-slate-500">
                  <tr><th className="text-left font-medium pb-2">PDU</th><th className="text-right font-medium">Load (kW)</th><th className="text-right font-medium">Load (%)</th><th className="text-right font-medium pl-3">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[
                    ["PDU-A (Row A)", 48.0, 80],
                    ["PDU-B (Row B)", 44.0, 73],
                    ["PDU-C (Row C)", 40.0, 67],
                    ["3BU-D (Row D)", 38.0, 63],
                    ["PDU-E (Row E)", 35.0, 58],
                    ["PDU-F (Row F)", 32.0, 53],
                  ].map(([n, kw, pct]) => (
                    <tr key={n as string}>
                      <td className="py-2 text-slate-200">{n}</td>
                      <td className="text-right tabular-nums text-slate-200">{kw}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-14 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} /></div>
                          <span className="tabular-nums text-slate-300 w-9">{pct}%</span>
                        </div>
                      </td>
                      <td className="text-right text-emerald-400 pl-3">● Normal</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="col-span-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-white">UPS Status</div>
                <button className="text-[11px] text-blue-400">View All</button>
              </div>
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase text-slate-500">
                  <tr><th className="text-left font-medium pb-2">UPS</th><th className="text-left font-medium">Status</th><th className="text-right font-medium">Load (%)</th><th className="text-right font-medium">Runtime</th><th className="text-right font-medium">Input (V)</th><th className="text-right font-medium">Output (V)</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[["UPS-1A","42%","28 min"],["UPS-1B","39%","31 min"],["UPS-2A","45%","27 min"],["UPS-2B","41%","30 min"]].map(([n, pct, rt]) => (
                    <tr key={n}>
                      <td className="py-2 text-slate-200">{n}</td>
                      <td className="text-emerald-400">● Online</td>
                      <td className="text-right tabular-nums text-slate-200">{pct}</td>
                      <td className="text-right tabular-nums text-slate-300">{rt}</td>
                      <td className="text-right tabular-nums text-slate-300">480</td>
                      <td className="text-right tabular-nums text-slate-300">480</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="col-span-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-white">Environmental Conditions</div>
                <button className="text-[11px] text-blue-400">View All</button>
              </div>
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase text-slate-500">
                  <tr><th className="text-left font-medium pb-2">Sensor</th><th className="text-left font-medium">Location</th><th className="text-right font-medium">Temp (°F)</th><th className="text-right font-medium">Humidity (%)</th><th className="text-right font-medium">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[
                    ["T-1 / H-1","Data Hall A",72.5,45],
                    ["T-2 / H-2","Data Hall B",71.8,44],
                    ["T-3 / H-3","Data Hall C",72.1,46],
                    ["T-4 / H-4","Electrical Room",68.4,40],
                    ["T-5 / H-5","UPS Room A",69.1,42],
                  ].map(([s, l, t, h]) => (
                    <tr key={s as string}>
                      <td className="py-2 text-slate-200">{s}</td>
                      <td className="text-slate-300">{l}</td>
                      <td className="text-right tabular-nums text-slate-200">{t}</td>
                      <td className="text-right tabular-nums text-slate-200">{h}</td>
                      <td className="text-right text-emerald-400">● Normal</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Heatmap + Power Quality */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-7 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-white">Real-time Load Heatmap <span className="text-[11px] text-slate-400 font-normal">(kW per Rack)</span></div>
                <Link to="/practice-library/infrastructure-hybrid-platform/power-map" className="text-[11px] text-blue-400 flex items-center gap-1">View Full Map <ArrowRight className="h-3 w-3" /></Link>
              </div>
              <div className="rounded border border-slate-800 bg-[#0b1426] p-3">
                <div className="text-center text-[10px] tracking-widest text-slate-500 mb-2">NORTH</div>
                <div className="space-y-3">
                  {heatRows.map((r) => (
                    <div key={r.row} className="flex items-center gap-3">
                      <div className="w-4 text-[10px] text-slate-500">{r.row}</div>
                      <div className="flex-1 grid grid-cols-8 gap-2">
                        {r.racks.map((rk) => (
                          <div key={rk.id} className="flex flex-col items-center">
                            <div className="text-[9px] text-slate-400">{rk.id}</div>
                            <div className="w-full h-14 rounded-sm border border-slate-700 overflow-hidden">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="h-[5px] mx-0.5 my-[1px] rounded-sm" style={{ background: heatColor(rk.v - i * 0.5), opacity: 0.9 - i * 0.05 }} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="w-20 border border-slate-700 rounded-sm bg-slate-900/40 text-[10px] text-slate-300 text-center py-3">
                        {r.row === "A" && <>Electrical<br />Room</>}
                        {r.row === "B" && <>UPS Room</>}
                        {r.row === "C" && <>Network Room</>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-300">
                  {[["0-2","#16a34a"],["2-4","#10b981"],["4-6","#84cc16"],["6-8","#facc15"],["8-10","#f97316"],["10+ kW","#ef4444"]].map(([l, c]) => (
                    <span key={l} className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: c }} /> {l}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-5 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-white">Power Quality <span className="text-[11px] text-slate-400 font-normal">(Live)</span></div>
                <button className="text-[11px] text-blue-400">View All</button>
              </div>
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase text-slate-500">
                  <tr><th className="text-left font-medium pb-2">Metric</th><th className="text-right font-medium">Phase A</th><th className="text-right font-medium">Phase B</th><th className="text-right font-medium">Phase C</th><th className="text-right font-medium">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[
                    ["Voltage (V)", "480.3", "479.8", "481.1"],
                    ["Current (A)", "102.1", "98.7", "101.3"],
                    ["THD (%)", "2.1", "2.0", "2.2"],
                    ["Power Factor", "0.98", "0.97", "0.98"],
                    ["Frequency (Hz)", "", "60.02", ""],
                  ].map((row) => (
                    <tr key={row[0]}>
                      <td className="py-2 text-slate-200">{row[0]}</td>
                      <td className="text-right tabular-nums text-slate-200">{row[1]}</td>
                      <td className="text-right tabular-nums text-slate-200">{row[2]}</td>
                      <td className="text-right tabular-nums text-slate-200">{row[3]}</td>
                      <td className="text-right text-emerald-400">Normal</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* footer status */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Auto-refresh: 10s</span>
              <span>Last updated: May 20, 2024 10:30:15 AM EDT</span>
            </div>
            <span className="flex items-center gap-1 text-emerald-400">● Data is live</span>
          </div>
        </div>
      </main>
    </div>
  );
}
