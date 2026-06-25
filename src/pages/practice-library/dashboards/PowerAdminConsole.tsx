import { Link } from "react-router-dom";
import {
  Zap, Server, Leaf, DollarSign, AlertTriangle, Bell, RefreshCw, Download,
  Activity, Map as MapIcon, BarChart3, TrendingUp, Gauge, Settings as SettingsIcon,
  Battery, Power, Cpu, Layers, FileText, PieChart, Plug, ChevronLeft, ArrowRight,
  CircleDot, ShieldAlert,
} from "lucide-react";

/* ---------- tiny chart primitives (SVG) ---------- */
function LineChart({
  series, width = 720, height = 220, yMax = 15, labels,
}: {
  series: { name: string; color: string; data: number[]; dashed?: boolean }[];
  width?: number; height?: number; yMax?: number; labels: string[];
}) {
  const pad = { l: 28, r: 12, t: 10, b: 22 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const n = series[0]?.data.length ?? 0;
  const xStep = n > 1 ? w / (n - 1) : 0;
  const y = (v: number) => pad.t + h - (v / yMax) * h;
  const gridY = [0, yMax * 0.2, yMax * 0.4, yMax * 0.6, yMax * 0.8, yMax];
  return (
    <svg width={width} height={height} className="w-full">
      {gridY.map((g, i) => (
        <g key={i}>
          <line x1={pad.l} x2={width - pad.r} y1={y(g)} y2={y(g)} stroke="#1f2937" strokeWidth={0.5} />
          <text x={6} y={y(g) + 3} fontSize={9} fill="#64748b">{g}</text>
        </g>
      ))}
      {series.map((s, i) => {
        const d = s.data.map((v, idx) => `${idx === 0 ? "M" : "L"}${pad.l + idx * xStep},${y(v)}`).join(" ");
        return <path key={i} d={d} fill="none" stroke={s.color} strokeWidth={1.6} strokeDasharray={s.dashed ? "4 3" : undefined} />;
      })}
      {labels.map((l, i) => (
        <text key={l} x={pad.l + i * (w / (labels.length - 1))} y={height - 6} fontSize={9} fill="#64748b" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

function Donut({
  segments, total, totalLabel, size = 180, stroke = 22,
}: { segments: { value: number; color: string }[]; total: string; totalLabel: string; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const sum = segments.reduce((a, b) => a + b.value, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1f2937" strokeWidth={stroke} />
      {segments.map((s, i) => {
        const len = (s.value / sum) * c;
        const dash = `${len} ${c - len}`;
        const el = (
          <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color}
            strokeWidth={stroke} strokeDasharray={dash} strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="butt" />
        );
        offset += len;
        return el;
      })}
      <text x="50%" y="48%" textAnchor="middle" fontSize={24} fontWeight={700} fill="#e5e7eb">{total}</text>
      <text x="50%" y="62%" textAnchor="middle" fontSize={11} fill="#94a3b8">{totalLabel}</text>
    </svg>
  );
}

function CapacityBar({ label, total, used, unit = "MW", color = "bg-emerald-500" }: any) {
  const pct = Math.round((used / total) * 100);
  return (
    <div className="grid grid-cols-12 items-center gap-3 text-xs">
      <div className="col-span-3 text-slate-300">{label}</div>
      <div className="col-span-2 text-slate-400 text-right">{total} {unit}</div>
      <div className="col-span-5 h-2 rounded-full bg-slate-800 relative overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
        <div className="absolute top-0 bottom-0 border-l border-dashed border-slate-500" style={{ left: `${pct - 1}%` }} />
      </div>
      <div className="col-span-2 text-slate-200 text-right tabular-nums">{used} {unit} <span className="text-slate-500">{pct}%</span></div>
    </div>
  );
}

/* ---------- side rail ---------- */
const navGroups: { title: string; items: { label: string; icon: any; to?: string; active?: boolean; badge?: number }[] }[] = [
  { title: "Overview", items: [
    { label: "Power Overview", icon: Zap, active: true },
    { label: "Power Map", icon: MapIcon, to: "/practice-library/infrastructure-hybrid-platform/power-map" },
    { label: "Alerts", icon: Bell, badge: 3 },
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

/* ---------- KPI cards ---------- */
function Kpi({ icon: Icon, iconBg, label, value, unit, footer }: any) {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
      <div className="flex items-start gap-2">
        <div className={`h-7 w-7 rounded-md grid place-items-center ${iconBg}`}><Icon className="h-4 w-4" /></div>
        <div className="flex-1">
          <div className="text-[11px] text-slate-400">{label}</div>
          <div className="text-2xl font-bold text-white tabular-nums">{value} {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}</div>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-slate-400">{footer}</div>
    </div>
  );
}

/* ---------- recent alerts ---------- */
const alerts = [
  { icon: AlertTriangle, color: "text-rose-400", title: "PDU-2A Overload Warning", sub: "Load: 95% (28.5 kW / 30 kW)", time: "2m ago" },
  { icon: AlertTriangle, color: "text-rose-400", title: "UPS-1 Runtime Below Threshold", sub: "Runtime: 4.2 min (Threshold: 5 min)", time: "8m ago" },
  { icon: AlertTriangle, color: "text-amber-400", title: "High PUE Detected", sub: "PUE: 1.62 (Threshold: 1.50)", time: "15m ago" },
];

const recommendations = [
  { rec: "Raise cooling setpoint from 68°F to 72°F", impact: "Reduce cooling load", save: "$12,450 / month", effort: ["Low", "text-emerald-400"], pri: ["High", "text-rose-400"] },
  { rec: "Consolidate workloads on underutilized hosts", impact: "Reduce IT load", save: "$8,230 / month", effort: ["Medium", "text-amber-400"], pri: ["High", "text-rose-400"] },
  { rec: "Enable power capping during off-peak hours", impact: "Lower peak demand", save: "$5,670 / month", effort: ["Low", "text-emerald-400"], pri: ["Medium", "text-amber-400"] },
  { rec: "Optimize CRAC fan speeds using DCIM policy", impact: "Improve PUE", save: "$3,210 / month", effort: ["Low", "text-emerald-400"], pri: ["Medium", "text-amber-400"] },
];

const infraStatus = [
  ["UPS Systems", "6 / 6 Online", "text-emerald-400"],
  ["PDUs", "42 / 42 Online", "text-emerald-400"],
  ["CRAC Units", "28 / 28 Online", "text-emerald-400"],
  ["Generators", "2 / 2 Ready", "text-emerald-400"],
  ["Switchgear", "100% Normal", "text-emerald-400"],
  ["Utility Power", "Normal", "text-emerald-400"],
];

export default function PowerAdminConsole() {
  // synthesized series resembling the screenshot
  const total = Array.from({ length: 25 }, (_, i) => 8 + Math.sin(i / 2) * 0.4 + (i > 6 && i < 14 ? 0.6 : 0));
  const itLoad = total.map((v) => v - 2.1 + Math.cos(v) * 0.1);
  const nonIt = total.map((v) => v - itLoad[total.indexOf(v)] || 2);
  const cap = total.map(() => 13.5);
  const pue = Array.from({ length: 25 }, (_, i) => 1.38 + Math.sin(i / 3) * 0.04);
  const target = pue.map(() => 1.5);
  const xLabels = ["08:00","11:00","14:00","17:00","20:00","23:00","02:00","05:00","08:00"];
  const xLabelsPue = ["08:00","12:00","16:00","20:00","00:00","04:00","08:00"];

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-200 font-sans">
      <Rail />
      <main className="flex-1 overflow-y-auto">
        {/* header */}
        <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#070b14]/95 backdrop-blur z-10">
          <div>
            <div className="text-[11px] text-slate-500">Data Center Power</div>
            <h1 className="text-xl font-semibold text-white">Power Management & Optimization</h1>
            <div className="text-xs text-slate-400">Real-time visibility and optimization of data center power infrastructure</div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Link to="/practice-library/infrastructure-hybrid-platform" className="px-2 py-1.5 rounded border border-slate-700 hover:bg-slate-800 text-slate-300">← Back</Link>
            <button className="relative px-2 py-1.5 rounded border border-slate-700 hover:bg-slate-800"><Bell className="h-4 w-4" /><span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full px-1">3</span></button>
            <div className="px-2 py-1.5 rounded border border-slate-700 flex items-center gap-2"><Server className="h-3.5 w-3.5" /> DC1 - Ashburn</div>
            <div className="px-2 py-1.5 rounded border border-slate-700">Last 15 minutes ▾</div>
            <button className="p-1.5 rounded border border-slate-700 hover:bg-slate-800"><RefreshCw className="h-4 w-4" /></button>
            <button className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> Export</button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <Kpi icon={Zap} iconBg="bg-blue-500/15 text-blue-400" label="Total Facility Load" value="8.42" unit="MW" footer={<><div className="text-slate-500 mb-1">62% of 13.5 MW</div><div className="h-1 rounded bg-slate-800"><div className="h-full bg-blue-500 rounded" style={{ width: "62%" }} /></div></>} />
            <Kpi icon={Server} iconBg="bg-emerald-500/15 text-emerald-400" label="IT Load" value="6.21" unit="MW" footer={<><div className="text-slate-500 mb-1">73% of 8.5 MW</div><div className="h-1 rounded bg-slate-800"><div className="h-full bg-emerald-500 rounded" style={{ width: "73%" }} /></div></>} />
            <Kpi icon={Leaf} iconBg="bg-emerald-500/15 text-emerald-400" label="Power Usage Effectiveness" value="1.38" footer={<span className="text-emerald-400">Target: &lt; 1.50 ●</span>} />
            <Kpi icon={DollarSign} iconBg="bg-amber-500/15 text-amber-400" label="Total Cost (MTD)" value="$742,356" footer={<span><span className="text-slate-500">$0.12 / kWh</span> <span className="text-emerald-400">▼ 4.7%</span></span>} />
            <Kpi icon={Leaf} iconBg="bg-emerald-500/15 text-emerald-400" label="Carbon Intensity" value="284" unit="gCO₂e/kWh" footer={<span className="text-emerald-400">▼ 6.2% vs last month</span>} />
            <Kpi icon={AlertTriangle} iconBg="bg-rose-500/15 text-rose-400" label="Active Alerts" value="3" footer={<span><span className="text-rose-400">2 Critical</span> <span className="text-slate-500">|</span> <span className="text-amber-400">1 Warning</span></span>} />
          </div>

          {/* Trend + Distribution */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-medium">Power Trend</div>
                <div className="px-2 py-1 rounded border border-slate-700 text-xs">Last 24 hours ▾</div>
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-blue-500" />Total Facility Load (MW)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-emerald-500" />IT Load (MW)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-violet-500" />Non-IT Load (MW)</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-3 border-t border-dashed border-slate-400" />Capacity (MW)</span>
              </div>
              <LineChart
                yMax={15}
                labels={xLabels}
                series={[
                  { name: "Total", color: "#3b82f6", data: total },
                  { name: "IT",    color: "#10b981", data: itLoad },
                  { name: "NonIT", color: "#a78bfa", data: nonIt.map((v) => Math.max(1.8, v)) },
                  { name: "Cap",   color: "#94a3b8", data: cap, dashed: true },
                ]}
              />
            </div>

            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <div className="text-white font-medium mb-2">Power Distribution</div>
              <div className="flex items-center gap-4">
                <Donut total="8.42" totalLabel="MW Total" segments={[
                  { value: 73.7, color: "#3b82f6" },
                  { value: 16.0, color: "#10b981" },
                  { value: 7.0,  color: "#f43f5e" },
                  { value: 1.8,  color: "#f59e0b" },
                  { value: 1.5,  color: "#a78bfa" },
                ]} />
                <div className="flex-1 text-xs space-y-1.5">
                  {[
                    ["IT Equipment", "6.21 MW", "73.7%", "bg-blue-500"],
                    ["Cooling",      "1.35 MW", "16.0%", "bg-emerald-500"],
                    ["Power Loss",   "0.59 MW", "7.0%",  "bg-rose-500"],
                    ["Lighting",     "0.15 MW", "1.8%",  "bg-amber-500"],
                    ["Other",        "0.12 MW", "1.5%",  "bg-violet-500"],
                  ].map(([n, mw, pct, c]) => (
                    <div key={n} className="grid grid-cols-12 items-center gap-2">
                      <span className={`col-span-1 h-2 w-2 rounded-full ${c}`} />
                      <span className="col-span-5 text-slate-300">{n}</span>
                      <span className="col-span-3 text-slate-400 text-right tabular-nums">{mw}</span>
                      <span className="col-span-3 text-slate-200 text-right tabular-nums">{pct}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 text-right text-xs text-blue-400 flex items-center justify-end gap-1 cursor-pointer">View Power Map <ArrowRight className="h-3 w-3" /></div>
            </div>
          </div>

          {/* PUE + Capacity + Alerts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-medium">PUE Trend</div>
                <div className="px-2 py-1 rounded border border-slate-700 text-xs">Last 24 hours ▾</div>
              </div>
              <LineChart yMax={2} labels={xLabelsPue} series={[
                { name: "PUE", color: "#3b82f6", data: pue },
                { name: "Target", color: "#10b981", data: target, dashed: true },
              ]} />
              <div className="flex gap-4 text-[11px] text-slate-400 mt-1">
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-blue-500" />PUE</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-3 border-t border-dashed border-emerald-400" />Target (&lt; 1.50)</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-medium">Power Capacity</div>
                <span className="text-xs text-blue-400 flex items-center gap-1 cursor-pointer">View Capacity <ArrowRight className="h-3 w-3" /></span>
              </div>
              <div className="space-y-3">
                <CapacityBar label="Total Facility Capacity" total={13.5} used={8.42} color="bg-emerald-500" />
                <CapacityBar label="IT Capacity"             total={8.5}  used={6.21} color="bg-emerald-500" />
                <CapacityBar label="Cooling Capacity"        total={3.0}  used={1.35} color="bg-amber-500" />
                <CapacityBar label="Utility Capacity"        total={15.0} used={8.42} color="bg-emerald-500" />
              </div>
            </div>

            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-medium">Recent Alerts</div>
                <span className="text-xs text-blue-400 flex items-center gap-1 cursor-pointer">View All <ArrowRight className="h-3 w-3" /></span>
              </div>
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div key={a.title} className="flex items-start gap-2 text-xs border-b border-slate-800 pb-2 last:border-0">
                    <a.icon className={`h-4 w-4 mt-0.5 ${a.color}`} />
                    <div className="flex-1">
                      <div className={`font-medium ${a.color}`}>{a.title}</div>
                      <div className="text-slate-400">{a.sub}</div>
                    </div>
                    <div className="text-slate-500">{a.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations + Infra Status */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <div className="text-white font-medium mb-3">Optimization Recommendations</div>
              <table className="w-full text-xs">
                <thead className="text-slate-400">
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-2 font-normal">Recommendation</th>
                    <th className="text-left font-normal">Impact</th>
                    <th className="text-left font-normal">Potential Savings</th>
                    <th className="text-left font-normal">Effort</th>
                    <th className="text-left font-normal">Priority</th>
                    <th className="text-left font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((r) => (
                    <tr key={r.rec} className="border-b border-slate-800/60">
                      <td className="py-2.5 text-slate-200">{r.rec}</td>
                      <td className="text-slate-400">{r.impact}</td>
                      <td className="text-slate-200">{r.save}</td>
                      <td className={r.effort[1]}>{r.effort[0]}</td>
                      <td className={r.pri[1]}>{r.pri[0]}</td>
                      <td><button className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px]">Review</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-right text-xs text-blue-400 flex items-center justify-end gap-1 cursor-pointer">View All Recommendations <ArrowRight className="h-3 w-3" /></div>
            </div>

            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <div className="text-white font-medium mb-3">Key Infrastructure Status</div>
              <div className="space-y-2.5 text-xs">
                {infraStatus.map(([n, v, c]) => (
                  <div key={n} className="flex items-center justify-between border-b border-slate-800/60 pb-2 last:border-0">
                    <span className="text-slate-300">{n}</span>
                    <span className={`font-medium ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right text-xs text-blue-400 flex items-center justify-end gap-1 cursor-pointer">View Infrastructure <ArrowRight className="h-3 w-3" /></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
