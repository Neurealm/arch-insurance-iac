import { Link } from "react-router-dom";
import {
  Zap, Bell, RefreshCw, Download, Activity, Map as MapIcon, BarChart3, TrendingUp,
  Gauge, Settings as SettingsIcon, Battery, Power, Cpu, Layers, FileText, PieChart,
  Plug, ChevronLeft, ChevronsUpDown, Calendar, Brain, Sparkles,
  Lightbulb, CircleDot, ShieldAlert, ShieldCheck, Hand, DollarSign, AlertCircle,
  TrendingDown, Leaf, Info, MoreVertical, Cog,
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
    { label: "Power Capping", icon: CircleDot, active: true },
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

function Spark({ color = "#3b82f6", seed = 0 }: { color?: string; seed?: number }) {
  const pts = Array.from({ length: 40 }, (_, i) =>
    [i * 5, 22 + Math.sin(i * 0.5 + seed) * 6 + Math.cos(i * 0.2 + seed) * 3].join(",")
  ).join(" ");
  return <svg viewBox="0 0 200 40" className="w-full h-8"><polyline points={pts} stroke={color} strokeWidth="1.3" fill="none" /></svg>;
}

function KpiCard({ icon: Icon, color, ring, label, value, unit, sub, subColor = "text-slate-400", spark }: any) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-start gap-3">
        <div className={`h-9 w-9 rounded-full grid place-items-center ${ring}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-slate-400">{label}</div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <div className="text-2xl font-bold text-white">{value}</div>
            {unit && <div className="text-xs text-slate-400">{unit}</div>}
          </div>
          <div className={`text-[11px] ${subColor}`}>{sub}</div>
        </div>
      </div>
      {spark}
    </div>
  );
}

/* ---------- Power Usage vs Cap chart ---------- */
function UsageCapChart() {
  const W = 700, H = 280, padL = 40, padR = 10, padT = 20, padB = 30;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const days = ["May 13","May 14","May 15","May 16","May 17","May 18","May 19","May 20","May 21"];
  const N = 90;
  const histN = 70;
  const cap = 12500, max = 20000;
  const yFor = (v: number) => padT + innerH - (v / max) * innerH;
  const xFor = (i: number) => padL + (i / (N - 1)) * innerW;
  const actual: string[] = [];
  for (let i = 0; i < histN; i++) actual.push(`${xFor(i)},${yFor(10500 + Math.sin(i * 0.6) * 400 + Math.random() * 300)}`);
  const usageNow = 10842;
  const forecast: string[] = [];
  for (let i = histN - 1; i < N; i++) forecast.push(`${xFor(i)},${yFor(11000 + (i - histN) * 80 + Math.sin(i * 0.4) * 200)}`);
  const headroom: string[] = [];
  for (let i = histN - 1; i < N; i++) headroom.push(`${xFor(i)},${yFor(12100 + Math.sin(i * 0.4) * 100)}`);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-72">
      {[0, 4000, 8000, 12000, 16000, 20000].map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={yFor(v)} y2={yFor(v)} stroke="#1e293b" />
          <text x={padL - 6} y={yFor(v) + 3} fill="#64748b" fontSize="9" textAnchor="end">{v / 1000}K</text>
        </g>
      ))}
      <text x={padL - 30} y={padT + 4} fill="#64748b" fontSize="9">kW</text>
      {/* Cap limit */}
      <line x1={padL} x2={W - padR} y1={yFor(cap)} y2={yFor(cap)} stroke="#ef4444" strokeDasharray="5 3" />
      {/* Forecast divider */}
      <line x1={xFor(histN - 1)} x2={xFor(histN - 1)} y1={padT} y2={H - padB} stroke="#475569" strokeDasharray="3 3" />
      <text x={xFor(histN - 1) + 6} y={padT + 12} fill="#94a3b8" fontSize="10">Forecast →</text>
      {/* Actual */}
      <polyline points={actual.join(" ")} stroke="#3b82f6" fill="none" strokeWidth="1.4" />
      {/* Forecast */}
      <polyline points={forecast.join(" ")} stroke="#f59e0b" fill="none" strokeWidth="1.4" strokeDasharray="4 3" />
      {/* Headroom */}
      <polyline points={headroom.join(" ")} stroke="#94a3b8" fill="none" strokeWidth="1.2" strokeDasharray="2 3" />
      {/* baseline green low-line (suggested floor) */}
      <polyline points={Array.from({length: histN},(_,i)=>`${xFor(i)},${yFor(3200 + Math.sin(i*0.5)*200)}`).join(" ")} stroke="#10b981" fill="none" strokeWidth="1.2" opacity="0.7" />
      {/* x labels */}
      {days.map((d, i) => (
        <text key={d} x={padL + (i / (days.length - 1)) * innerW} y={H - 10} fill="#94a3b8" fontSize="10" textAnchor="middle">{d}</text>
      ))}
    </svg>
  );
}

/* ---------- Donut for enforcement actions ---------- */
function EnforcementDonut() {
  const segs = [
    { label: "Workload Throttling", value: 10, color: "#3b82f6" },
    { label: "VM/Container Limit", value: 6, color: "#10b981" },
    { label: "Power Capping (PDU Level)", value: 4, color: "#a855f7" },
    { label: "Job Queuing/Delay", value: 3, color: "#f59e0b" },
    { label: "Other", value: 1, color: "#64748b" },
  ];
  const total = segs.reduce((a, s) => a + s.value, 0);
  const r = 50, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="relative h-44 w-44 mx-auto">
      <svg viewBox="0 0 140 140" className="h-44 w-44 -rotate-90">
        <circle cx="70" cy="70" r={r} stroke="#0f172a" strokeWidth="18" fill="none" />
        {segs.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle key={s.label} cx="70" cy="70" r={r} stroke={s.color} strokeWidth="18" fill="none"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} />
          );
          off += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="text-[10px] text-slate-400">Total Actions</div>
          <div className="text-[10px] text-slate-500">(7 Days)</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Cumulative savings chart ---------- */
function SavingsChart() {
  const days = ["May 13","May 14","May 15","May 16","May 17","May 18","May 19","May 20"];
  const W = 560, H = 240, padL = 40, padR = 40, padT = 20, padB = 30;
  const iW = W - padL - padR, iH = H - padT - padB;
  const yL = (v: number) => padT + iH - (v / 25000) * iH;
  const yR = (v: number) => padT + iH - (v / 40000) * iH;
  const xFor = (i: number) => padL + (i / (days.length - 1)) * iW;
  const cost = [2200, 4400, 6500, 8800, 11200, 13500, 15800, 18450];
  const energy = [38, 78, 118, 158, 198, 238, 278, 312].map((k) => k * 1000);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-60">
      {[0, 5000, 10000, 15000, 20000].map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={yL(v)} y2={yL(v)} stroke="#1e293b" />
          <text x={padL - 6} y={yL(v) + 3} fill="#64748b" fontSize="9" textAnchor="end">{v / 1000}K</text>
        </g>
      ))}
      <text x={padL - 30} y={padT + 4} fill="#64748b" fontSize="9">$</text>
      {[0, 10000, 20000, 30000, 40000].map((v) => (
        <text key={v} x={W - padR + 6} y={yR(v) + 3} fill="#64748b" fontSize="9">{v / 1000}K</text>
      ))}
      <text x={W - padR + 6} y={padT + 4} fill="#64748b" fontSize="9">kWh</text>
      {/* cost */}
      <polyline points={cost.map((v, i) => `${xFor(i)},${yL(v)}`).join(" ")} stroke="#10b981" fill="none" strokeWidth="1.6" />
      {cost.map((v, i) => <circle key={i} cx={xFor(i)} cy={yL(v)} r="2.5" fill="#10b981" />)}
      {/* energy */}
      <polyline points={energy.map((v, i) => `${xFor(i)},${yR(v)}`).join(" ")} stroke="#3b82f6" fill="none" strokeWidth="1.6" />
      {energy.map((v, i) => <circle key={i} cx={xFor(i)} cy={yR(v)} r="2.5" fill="#3b82f6" />)}
      {days.map((d, i) => (
        <text key={d} x={xFor(i)} y={H - 10} fill="#94a3b8" fontSize="10" textAnchor="middle">{d}</text>
      ))}
    </svg>
  );
}

export default function PowerCapping() {
  const areaRows = [
    { a: "Data Hall A", cap: 4000, cur: 3425, util: "85.6%", hr: 575, s: "Normal", c: "text-emerald-400" },
    { a: "Data Hall B", cap: 3000, cur: 2610, util: "87.0%", hr: 390, s: "Normal", c: "text-emerald-400" },
    { a: "Data Hall C", cap: 2500, cur: 2210, util: "88.4%", hr: 290, s: "Warning", c: "text-amber-400" },
    { a: "Data Hall D", cap: 1500, cur: 1390, util: "92.7%", hr: 110, s: "Warning", c: "text-amber-400" },
    { a: "Support Facility", cap: 1000, cur: 870, util: "87.0%", hr: 130, s: "Normal", c: "text-emerald-400" },
    { a: "IT Rooms", cap: 500, cur: 337, util: "67.4%", hr: 163, s: "Normal", c: "text-emerald-400" },
  ];
  const policies = [
    { n: "Daily Peak Protection", scope: "Facility", cap: "12,500", pri: 1, st: "Active", stc: "text-emerald-400", start: "May 13, 12:00 AM" },
    { n: "Data Hall C Thermal Limit", scope: "Data Hall C", cap: "2,500", pri: 2, st: "Active", stc: "text-emerald-400", start: "May 13, 12:00 AM" },
    { n: "Utility Demand Response", scope: "Facility", cap: "11,000", pri: 3, st: "Scheduled", stc: "text-sky-400", start: "May 20, 1:00 PM" },
    { n: "Maintenance Window Cap", scope: "Data Hall B", cap: "2,200", pri: 4, st: "Scheduled", stc: "text-sky-400", start: "May 21, 12:00 AM" },
    { n: "Cost Optimization Off-Peak", scope: "Facility", cap: "10,500", pri: 5, st: "Inactive", stc: "text-slate-500", start: "—" },
  ];
  const workloads = [
    { n: "AI-Training-Cluster-01", area: "Data Hall C", lim: 450, cur: 300, red: "-150 kW", reason: "Policy: Data Hall C Thermal Limit" },
    { n: "Render Farm", area: "Data Hall C", lim: 300, cur: 180, red: "-120 kW", reason: "Policy: Data Hall C Thermal Limit" },
    { n: "HPC-Cluster-02", area: "Data Hall D", lim: 250, cur: 150, red: "-100 kW", reason: "Policy: Daily Peak Protection" },
    { n: "Batch Processing Pool", area: "Data Hall B", lim: 200, cur: 120, red: "-80 kW", reason: "Policy: Daily Peak Protection" },
    { n: "Backup & DR Workloads", area: "Support Facility", lim: 150, cur: 90, red: "-60 kW", reason: "Policy: Daily Peak Protection" },
  ];
  const enf = [
    { l: "Workload Throttling", v: 10, p: "41.7%", c: "bg-blue-500" },
    { l: "VM/Container Limit", v: 6, p: "25.0%", c: "bg-emerald-500" },
    { l: "Power Capping (PDU Level)", v: 4, p: "16.7%", c: "bg-violet-500" },
    { l: "Job Queuing/Delay", v: 3, p: "12.5%", c: "bg-amber-500" },
    { l: "Other", v: 1, p: "4.1%", c: "bg-slate-500" },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 flex">
      <Rail />
      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0b1220]">
          <div>
            <h1 className="text-xl font-semibold text-white">Power Capping</h1>
            <p className="text-xs text-slate-400">Enforce power limits to maintain stability, reduce costs, and prevent overloads while maximizing operational efficiency.</p>
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

        <div className="px-6 border-b border-slate-800 bg-[#0b1220]">
          <div className="flex items-center gap-6 text-xs">
            {["Overview","Policies","Capped Workloads","Events & History","Exemptions","Reports","Settings"].map((t, i) => (
              <button key={t} className={`py-3 border-b-2 flex items-center gap-1 ${i===0 ? "border-blue-500 text-blue-300" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
                {t}{t==="Settings" && <ChevronsUpDown className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-6 gap-4">
            <KpiCard icon={ShieldCheck} color="text-emerald-400" ring="bg-emerald-500/10 ring-1 ring-emerald-500/30"
              label="Total Facility Power Limit" value="12,500" unit="kW" sub="Configured Limit" />
            <KpiCard icon={Hand} color="text-blue-400" ring="bg-blue-500/10 ring-1 ring-blue-500/30"
              label="Current Power Usage" value="10,842" unit="kW" sub="86.7% of limit"
              spark={<Spark color="#3b82f6" seed={1} />} />
            <KpiCard icon={Leaf} color="text-emerald-400" ring="bg-emerald-500/10 ring-1 ring-emerald-500/30"
              label="Power Cap Headroom" value="1,658" unit="kW" sub="↑ 13.3% remaining" subColor="text-emerald-400" />
            <KpiCard icon={ShieldAlert} color="text-violet-400" ring="bg-violet-500/10 ring-1 ring-violet-500/30"
              label="Enforced Caps" value="6" sub="Active policies" />
            <KpiCard icon={DollarSign} color="text-amber-400" ring="bg-amber-500/10 ring-1 ring-amber-500/30"
              label="Total Potential Savings" value="$18,450" unit="/ mo" sub="Est. cost savings" />
            <KpiCard icon={AlertCircle} color="text-rose-400" ring="bg-rose-500/10 ring-1 ring-rose-500/30"
              label="Cap Events (7 Days)" value="24" sub="↑ 14 vs last 7 days" subColor="text-rose-400" />
          </div>

          {/* Middle row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white mb-2">Power Usage vs. Cap Over Time</div>
              <div className="flex items-center gap-4 text-[10px] text-slate-400 mb-1 flex-wrap">
                <div className="flex items-center gap-1"><span className="h-0.5 w-3 bg-blue-500 inline-block" />Actual Usage (kW)</div>
                <div className="flex items-center gap-1"><span className="h-0.5 w-3 bg-rose-500 inline-block" />Power Cap Limit (kW)</div>
                <div className="flex items-center gap-1"><span className="h-0.5 w-3 bg-amber-400 inline-block" />Forecast (kW)</div>
                <div className="flex items-center gap-1"><span className="h-0.5 w-3 bg-slate-400 inline-block" />Cap Headroom (kW)</div>
              </div>
              <div className="grid grid-cols-[1fr_180px] gap-4">
                <UsageCapChart />
                <div className="text-[11px] space-y-3 pt-2">
                  <div>
                    <div className="text-slate-500">Cap Limit</div>
                    <div className="text-white font-semibold text-base">12,500 <span className="text-xs text-slate-400">kW</span></div>
                  </div>
                  <div>
                    <div className="text-slate-500">Current Usage</div>
                    <div className="text-white font-semibold text-base">10,842 <span className="text-xs text-slate-400">kW</span></div>
                  </div>
                  <div>
                    <div className="text-slate-500">Headroom</div>
                    <div className="text-emerald-400 font-semibold text-base">1,658 <span className="text-xs text-slate-400">kW</span></div>
                    <div className="text-emerald-400 text-[10px]">13.3%</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Forecast Peak <span className="text-slate-600">(May 21, 2 PM)</span></div>
                    <div className="text-white font-semibold text-base">12,120 <span className="text-xs text-slate-400">kW</span></div>
                    <div className="text-amber-400 text-[10px]">96.9% of limit</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Time to Cap (Forecast)</div>
                    <div className="text-white font-semibold">~ 3 hrs 42 min</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white mb-3">Power Cap by Area</div>
              <table className="w-full text-[11px]">
                <thead className="text-slate-500">
                  <tr>
                    <th className="text-left py-1">Area</th>
                    <th className="text-right">Cap Limit (kW)</th>
                    <th className="text-right">Current Usage (kW)</th>
                    <th className="text-right">Utilization</th>
                    <th className="text-right">Headroom (kW)</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {areaRows.map((r) => (
                    <tr key={r.a} className="border-t border-slate-800/60">
                      <td className="py-1.5 text-slate-300">{r.a}</td>
                      <td className="text-right text-slate-300">{r.cap.toLocaleString()}</td>
                      <td className="text-right text-slate-300">{r.cur.toLocaleString()}</td>
                      <td className="text-right text-slate-300">{r.util}</td>
                      <td className="text-right text-slate-300">{r.hr}</td>
                      <td className={`text-right ${r.c}`}>● {r.s}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-slate-700 font-semibold">
                    <td className="py-1.5 text-white">Total</td>
                    <td className="text-right text-white">12,500</td>
                    <td className="text-right text-white">10,842</td>
                    <td className="text-right text-white">86.7%</td>
                    <td className="text-right text-white">1,658</td>
                    <td className="text-right text-slate-500">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Policies / Workloads / Enforcement */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white mb-3">Active Power Cap Policies</div>
              <table className="w-full text-[11px]">
                <thead className="text-slate-500">
                  <tr><th className="text-left">Policy Name</th><th className="text-left">Scope</th><th className="text-right">Cap Limit (kW)</th><th className="text-right">Priority</th><th className="text-left pl-3">Status</th><th className="text-left">Start</th><th></th></tr>
                </thead>
                <tbody>
                  {policies.map((p) => (
                    <tr key={p.n} className="border-t border-slate-800/60">
                      <td className="py-1.5 text-slate-300">{p.n}</td>
                      <td className="text-slate-400">{p.scope}</td>
                      <td className="text-right text-slate-300">{p.cap}</td>
                      <td className="text-right text-slate-300">{p.pri}</td>
                      <td className={`pl-3 ${p.stc}`}>● {p.st}</td>
                      <td className="text-slate-400">{p.start}</td>
                      <td className="text-right text-slate-500"><MoreVertical className="h-3 w-3 inline" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <a className="mt-3 block text-center text-xs text-blue-400 hover:text-blue-300 cursor-pointer">View All Policies →</a>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white mb-1">Capped Workloads <span className="text-slate-500 font-normal">(Currently Limited)</span></div>
              <table className="w-full text-[11px] mt-2">
                <thead className="text-slate-500">
                  <tr><th className="text-left">Workload / Cluster</th><th className="text-left">Area</th><th className="text-right">Power Limit (kW)</th><th className="text-right">Current (kW)</th><th className="text-right">Reduction</th><th className="text-left pl-3">Reason</th></tr>
                </thead>
                <tbody>
                  {workloads.map((w) => (
                    <tr key={w.n} className="border-t border-slate-800/60">
                      <td className="py-1.5 text-slate-300">{w.n}</td>
                      <td className="text-blue-400">{w.area}</td>
                      <td className="text-right text-slate-300">{w.lim}</td>
                      <td className="text-right text-slate-300">{w.cur}</td>
                      <td className="text-right text-emerald-400">{w.red}</td>
                      <td className="pl-3 text-slate-400">{w.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <a className="mt-3 block text-center text-xs text-blue-400 hover:text-blue-300 cursor-pointer">View All Capped Workloads →</a>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white mb-3">Cap Enforcement Actions</div>
              <div className="grid grid-cols-[180px_1fr] gap-3 items-center">
                <EnforcementDonut />
                <div className="space-y-1.5 text-[11px]">
                  {enf.map((e) => (
                    <div key={e.l} className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${e.c}`} />
                      <span className="flex-1 text-slate-300 truncate">{e.l}</span>
                      <span className="text-white font-semibold">{e.v}</span>
                      <span className="text-slate-500">({e.p})</span>
                    </div>
                  ))}
                </div>
              </div>
              <a className="mt-3 block text-center text-xs text-blue-400 hover:text-blue-300 cursor-pointer">View Events & History →</a>
            </div>
          </div>

          {/* Bottom: Impact + Savings + Projected */}
          <div className="grid grid-cols-[1fr_1.4fr_0.7fr] gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white flex items-center gap-1">Power Cap Impact <Info className="h-3 w-3 text-slate-500" /></div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center">
                  <div className="text-[11px] text-slate-500">Energy Impact (7 Days)</div>
                  <div className="mt-2 h-10 w-10 mx-auto rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30 grid place-items-center">
                    <TrendingDown className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 text-emerald-400 font-bold">↓ 8.4%</div>
                  <div className="text-[10px] text-slate-500">vs no cap scenario</div>
                </div>
                <div className="text-center">
                  <div className="text-[11px] text-slate-500">Cost Impact (7 Days)</div>
                  <div className="mt-2 h-10 w-10 mx-auto rounded-full bg-amber-500/10 ring-1 ring-amber-500/30 grid place-items-center">
                    <DollarSign className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="mt-2 text-white font-bold">$4,320</div>
                  <div className="text-[10px] text-slate-500">Est. savings</div>
                </div>
                <div className="text-center">
                  <div className="text-[11px] text-slate-500">Carbon Impact (7 Days)</div>
                  <div className="mt-2 h-10 w-10 mx-auto rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30 grid place-items-center">
                    <Leaf className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 text-white font-bold">↓ 6,120 <span className="text-xs text-slate-400">kg CO₂e</span></div>
                  <div className="text-[10px] text-slate-500">Est. reduction</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white mb-2">Cumulative Savings Over Time</div>
              <div className="flex items-center gap-4 text-[10px] text-slate-400 mb-1">
                <div className="flex items-center gap-1"><span className="h-0.5 w-3 bg-emerald-500 inline-block" />Cost Savings ($)</div>
                <div className="flex items-center gap-1"><span className="h-0.5 w-3 bg-blue-500 inline-block" />Energy Savings (kWh)</div>
              </div>
              <SavingsChart />
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-semibold text-white mb-3">Projected Monthly Savings</div>
              <div className="text-3xl font-bold text-emerald-400">$18,450</div>
              <div className="text-[11px] text-slate-500">Est. cost savings</div>
              <div className="mt-4 text-2xl font-bold text-white">312,000 <span className="text-xs text-slate-400">kWh</span></div>
              <div className="text-[11px] text-slate-500">Est. energy savings</div>
            </div>
          </div>
        </div>

        <footer className="mt-auto border-t border-slate-800 px-6 py-3 text-[11px] text-slate-400 flex items-center justify-between bg-[#0b1220]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Power Capping Engine: <span className="text-emerald-400">Operational</span></span>
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
