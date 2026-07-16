import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Building2, CheckCircle, Clock, AlertTriangle, Users, Truck, Wifi, Timer,
  Search, ShieldCheck, TrendingUp, Activity, MapPin, Cable, Network, Zap,
  ChevronDown,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const kpis: KPI[] = [
  { label: "Total Sites", value: "77", sub: "Across 24 Countries", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Sites In Progress", value: "38", sub: "49.4%", subColor: "text-emerald-600", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Sites Completed", value: "32", sub: "41.6%", subColor: "text-amber-600", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Sites At Risk", value: "7", sub: "9.1%", subColor: "text-red-600", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Technicians Deployed", value: "128", sub: "Active Today", icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Work Orders", value: "256", sub: "Active", subColor: "text-emerald-600", icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Devices Installed", value: "2,846", sub: "This Quarter", icon: Wifi, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Avg. Install Time", value: "3.6 Days", sub: "↓ 18% vs last QTR", subColor: "text-emerald-600", icon: Timer, color: "text-blue-600", bg: "bg-blue-50" },
];

const regions = [
  { name: "North America", count: 24, color: "hsl(142 71% 45%)", x: 20, y: 32 },
  { name: "Europe", count: 18, color: "hsl(217 91% 60%)", x: 50, y: 26 },
  { name: "Asia Pacific", count: 22, color: "hsl(262 83% 58%)", x: 75, y: 30 },
  { name: "Latin America", count: 7, color: "hsl(38 92% 50%)", x: 28, y: 70 },
  { name: "MEA", count: 6, color: "hsl(0 84% 60%)", x: 53, y: 55 },
];

const sites = [
  { site: "Boston-01", loc: "USA", region: "North America", status: "Completed", fiber: "Complete", sw: "Complete", ap: "Complete", go: "Feb 12, 2026", risk: "" },
  { site: "London-02", loc: "UK", region: "Europe", status: "In Progress", fiber: "Complete", sw: "In Progress", ap: "Pending", go: "Feb 15, 2026", risk: "" },
  { site: "Singapore-03", loc: "Singapore", region: "Asia Pacific", status: "Completed", fiber: "Complete", sw: "Complete", ap: "Complete", go: "Feb 14, 2026", risk: "" },
  { site: "Sao Paulo-01", loc: "Brazil", region: "Latin America", status: "In Progress", fiber: "In Progress", sw: "In Progress", ap: "Pending", go: "Feb 16, 2026", risk: "amber" },
  { site: "Dubai-01", loc: "UAE", region: "MEA", status: "At Risk", fiber: "Delayed", sw: "In Progress", ap: "Pending", go: "Feb 18, 2026", risk: "red" },
  { site: "Toronto-01", loc: "Canada", region: "North America", status: "Completed", fiber: "Complete", sw: "Complete", ap: "Complete", go: "Feb 13, 2026", risk: "" },
  { site: "Frankfurt-01", loc: "Germany", region: "Europe", status: "In Progress", fiber: "Complete", sw: "In Progress", ap: "Pending", go: "Feb 15, 2026", risk: "" },
  { site: "Jakarta-01", loc: "Indonesia", region: "Asia Pacific", status: "In Progress", fiber: "In Progress", sw: "In Progress", ap: "Pending", go: "Feb 17, 2026", risk: "amber" },
];

const execModel = [
  { name: "Internal Execution", value: 35, pct: "45.5%", color: "hsl(217 91% 60%)" },
  { name: "Partner Execution", value: 32, pct: "41.6%", color: "hsl(142 71% 45%)" },
  { name: "Hybrid Execution", value: 10, pct: "13.0%", color: "hsl(262 83% 58%)" },
];

const workOrder = [
  { name: "Completed", value: 118, pct: "46.1%", color: "hsl(142 71% 45%)" },
  { name: "In Progress", value: 86, pct: "33.6%", color: "hsl(217 91% 60%)" },
  { name: "Scheduled", value: 32, pct: "12.5%", color: "hsl(38 92% 50%)" },
  { name: "On Hold", value: 12, pct: "4.7%", color: "hsl(0 84% 60%)" },
  { name: "Cancelled", value: 8, pct: "3.1%", color: "hsl(220 9% 70%)" },
];

const installs = [
  { icon: Cable, name: "Fiber Runs", v: "412 / 512", pct: 80.5 },
  { icon: Network, name: "Switch Installs", v: "598 / 682", pct: 87.7 },
  { icon: Wifi, name: "AP Deployments", v: "1,836 / 2,132", pct: 86.1 },
  { icon: ShieldCheck, name: "Quality Validations", v: "734 / 842", pct: 87.2 },
];

const dispatch = [
  { icon: Users, label: "Technicians Dispatched", v: "128" },
  { icon: CheckCircle, label: "Jobs Completed Today", v: "76" },
  { icon: Wifi, label: "Avg. Jobs per Tech", v: "2.4" },
  { icon: Activity, label: "Utilization Rate", v: "88%" },
];

const topRisk = [
  { site: "Dubai-01", region: "MEA", reason: "Fiber provider delay", go: "Feb 18, 2026", color: "text-red-600" },
  { site: "Jakarta-01", region: "Asia Pacific", reason: "Equipment backorder", go: "Feb 17, 2026", color: "text-red-600" },
  { site: "Mexico City-01", region: "Latin America", reason: "Permit pending", go: "Feb 16, 2026", color: "text-amber-600" },
  { site: "Mumbai-01", region: "Asia Pacific", reason: "Power circuit issue", go: "Feb 17, 2026", color: "text-amber-600" },
  { site: "Johannesburg-01", region: "MEA", reason: "Access clearance", go: "Feb 18, 2026", color: "text-amber-600" },
];

const liveFeed = [
  { time: "10:24 AM", site: "Boston-01", note: "Switch installation completed", sub: "by Internal Team", icon: CheckCircle, color: "text-emerald-600" },
  { time: "10:18 AM", site: "Sao Paulo-01", note: "Fiber run completed", sub: "by Partner Team", icon: CheckCircle, color: "text-emerald-600" },
  { time: "10:12 AM", site: "London-02", note: "Technician dispatched", sub: "ETA 11:00 AM", icon: Truck, color: "text-blue-600" },
  { time: "10:05 AM", site: "Singapore-03", note: "AP deployment in progress", sub: "3 of 5 completed", icon: Wifi, color: "text-violet-600" },
  { time: "09:58 AM", site: "Dubai-01", note: "Fiber delay reported", sub: "Escalated to NOC", icon: AlertTriangle, color: "text-red-600" },
  { time: "09:45 AM", site: "Toronto-01", note: "Site installation completed", sub: "Ready for activation", icon: CheckCircle, color: "text-emerald-600" },
];

const wwh = {
  what: [
    "Technician dispatch and scheduling for network installations",
    "Physical execution activities: fiber runs, switch installs, AP deployment",
    "Real-time site installation status and milestone tracking",
    "Partner vs internal execution performance and accountability",
  ],
  why: [
    "Physical execution is the make-or-break moment for site readiness",
    "Delays or failed installs directly impact Day 1 independence",
    "Provides accountability, transparency, and issue visibility",
    "Ensures quality execution and consistent network experience",
  ],
  how: [
    "Integrated orchestration of people, tools, and processes",
    "Real-time updates from technicians via mobile app and IoT tools",
    "Standardized workflow, checklists, and quality validation",
    "Unified view of internal teams and partner ecosystem performance",
  ],
};

const outcomes: Outcome[] = [
  { icon: Zap, color: "text-blue-600", title: "ORCHESTRATED EXECUTION", l1: "Unified visibility across internal and partner teams." },
  { icon: TrendingUp, color: "text-emerald-600", title: "FASTER INSTALLS", l1: "Reduced average install time across all regions." },
  { icon: ShieldCheck, color: "text-violet-600", title: "QUALITY ASSURED", l1: "Validation and QA at every milestone." },
  { icon: MapPin, color: "text-blue-600", title: "GLOBAL COVERAGE", l1: "Ready for Day 1 across 77+ sites." },
];

function statusPill(s: string) {
  const map: Record<string, string> = {
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    "At Risk": "bg-red-50 text-red-700 border-red-200",
    Complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-slate-50 text-slate-600 border-slate-200",
    Delayed: "bg-red-50 text-red-700 border-red-200",
  };
  return <span className={`inline-flex items-center whitespace-nowrap text-[10px] font-semibold px-1.5 py-0.5 rounded border ${map[s] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>{s}</span>;
}

export default function FieldNetworkDeployment() {
  const totalWO = workOrder.reduce((a, b) => a + b.value, 0);
  return (
    <DashShell
      title="FIELD NETWORK"
      highlight="DEPLOYMENT ORCHESTRATION"
      subtitle="End-to-end orchestration and real-time visibility into physical network deployments across global sites."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Section title="Global Deployment Overview" className="lg:col-span-1">
          <div className="relative h-72 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
            <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
              {/* Simplified world continents */}
              <g fill="hsl(220 13% 85%)" stroke="hsl(220 13% 75%)" strokeWidth="1">
                {/* North America */}
                <path d="M150,90 L260,80 L310,110 L300,160 L260,200 L230,230 L180,240 L140,220 L110,180 L100,140 Z" />
                {/* Central / South America */}
                <path d="M230,250 L280,260 L300,310 L290,370 L270,420 L250,440 L240,400 L230,340 Z" />
                {/* Europe */}
                <path d="M450,90 L540,85 L560,120 L540,160 L490,170 L460,150 L440,120 Z" />
                {/* Africa */}
                <path d="M470,180 L560,180 L580,240 L560,310 L520,360 L490,360 L470,310 L460,250 Z" />
                {/* Asia */}
                <path d="M560,80 L780,85 L840,120 L860,170 L820,210 L740,220 L660,200 L600,180 L570,140 Z" />
                {/* India */}
                <path d="M680,210 L730,210 L720,270 L700,290 L680,260 Z" />
                {/* SE Asia / Indonesia */}
                <path d="M780,240 L860,250 L880,290 L840,310 L800,300 L780,280 Z" />
                {/* Australia */}
                <path d="M820,340 L910,340 L930,380 L900,410 L840,410 L810,380 Z" />
              </g>
            </svg>
            {regions.map((r) => (
              <div key={r.name} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${r.x}%`, top: `${r.y}%` }}>
                <div className="h-12 w-12 rounded-full grid place-items-center text-white font-bold text-lg shadow-md" style={{ background: r.color }}>{r.count}</div>
                <div className="text-[10px] text-slate-700 font-medium mt-1 whitespace-nowrap">{r.name}</div>
              </div>
            ))}
            <div className="absolute right-2 top-2 bg-white/90 rounded p-2 text-[10px] space-y-0.5 border border-slate-200">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Completed</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" />In Progress</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />At Risk</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" />Not Started</div>
            </div>
          </div>
        </Section>

        <Section title="Site Installation Status" className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded bg-slate-50" placeholder="Search sites..." />
            </div>
            <button className="flex items-center gap-1 text-[11px] text-slate-700 border border-slate-200 rounded px-2 py-1.5 bg-white">All Regions <ChevronDown className="h-3 w-3" /></button>
            <button className="flex items-center gap-1 text-[11px] text-slate-700 border border-slate-200 rounded px-2 py-1.5 bg-white">All Statuses <ChevronDown className="h-3 w-3" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[640px]">
              <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1.5">Site Name</th>
                  <th className="text-left py-1.5">Location</th>
                  <th className="text-left py-1.5">Region</th>
                  <th className="text-left py-1.5">Overall Status</th>
                  <th className="text-left py-1.5">Fiber Run</th>
                  <th className="text-left py-1.5">Switch Install</th>
                  <th className="text-left py-1.5">AP Deployment</th>
                  <th className="text-left py-1.5">Target Go-Live</th>
                  <th className="text-center py-1.5">Risk</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((s) => (
                  <tr key={s.site} className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-800 font-medium">{s.site}</td>
                    <td className="py-1.5 text-slate-600">{s.loc}</td>
                    <td className="py-1.5 text-slate-600">{s.region}</td>
                    <td className="py-1.5">{statusPill(s.status)}</td>
                    <td className="py-1.5">{statusPill(s.fiber)}</td>
                    <td className="py-1.5">{statusPill(s.sw)}</td>
                    <td className="py-1.5">{statusPill(s.ap)}</td>
                    <td className="py-1.5 text-slate-600 whitespace-nowrap">{s.go}</td>
                    <td className="py-1.5 text-center">
                      {s.risk === "red" && <span className="inline-block h-2 w-2 rounded-full bg-red-500" />}
                      {s.risk === "amber" && <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />}
                      {!s.risk && <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-[10px] text-slate-500">Showing 1 to 8 of 77 sites</div>
            <div className="flex items-center gap-1 text-[10px]">
              {[1,2,3,4,5].map((p) => (
                <button key={p} className={`h-6 w-6 rounded ${p===1?"bg-blue-600 text-white":"bg-white border border-slate-200 text-slate-700"}`}>{p}</button>
              ))}
              <span className="text-slate-400 px-1">…</span>
              <button className="h-6 w-6 rounded bg-white border border-slate-200 text-slate-700">10</button>
            </div>
          </div>
        </Section>

        <Section title="Execution Model: Partner vs Internal" className="lg:col-span-1">
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="relative h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={execModel} dataKey="value" innerRadius={42} outerRadius={68} paddingAngle={2}>
                    {execModel.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-[10px] text-slate-500">Total Sites</div>
                <div className="text-2xl font-extrabold text-slate-900">77</div>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {execModel.map((m) => (
                <div key={m.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
                  <span className="text-slate-700">{m.name}</span>
                  <span className="ml-auto font-semibold text-slate-900">{m.value} ({m.pct})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-600">Partner On-Time Performance</div>
              <div className="text-xl font-extrabold text-emerald-700 mt-1">↗ 92.3%</div>
              <div className="text-[10px] text-emerald-600 font-medium">Good</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-600">Internal On-Time Performance</div>
              <div className="text-xl font-extrabold text-emerald-700 mt-1">↗ 95.6%</div>
              <div className="text-[10px] text-emerald-600 font-medium">Excellent</div>
            </div>
          </div>
        </Section>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Section title="Work Order Status">
          <div className="relative h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={workOrder} dataKey="value" innerRadius={42} outerRadius={68} paddingAngle={2}>
                  {workOrder.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-2xl font-extrabold text-slate-900">{totalWO}</div>
              <div className="text-[10px] text-slate-500">Total</div>
            </div>
          </div>
          <div className="space-y-1 mt-2 text-[11px]">
            {workOrder.map((w) => (
              <div key={w.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: w.color }} />
                <span className="text-slate-700">{w.name}</span>
                <span className="ml-auto font-semibold text-slate-900">{w.value} ({w.pct})</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Installation Activity Breakdown">
          <div className="space-y-3">
            {installs.map((i) => {
              const Icon = i.icon;
              return (
                <div key={i.name}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-3.5 w-3.5 text-blue-600" />
                    <div className="text-[11px] font-medium text-slate-700">{i.name}</div>
                    <div className="text-[11px] font-semibold text-slate-900 ml-auto">{i.v}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${i.pct}%` }} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-700 w-10 text-right">{i.pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Technician Dispatch & Utilization (Today)">
          <div className="space-y-2">
            {dispatch.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.label} className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                  <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 grid place-items-center">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-600">{d.label}</div>
                    <div className="text-lg font-extrabold text-slate-900 leading-tight">{d.v}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-600 mt-2">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Active (98)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />En Route (18)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-500" />On Site (12)</span>
          </div>
        </Section>

        <Section title="Top Sites at Risk">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Site</th>
                <th className="text-left py-1.5">Region</th>
                <th className="text-left py-1.5">Risk Reason</th>
                <th className="text-left py-1.5">Go-Live</th>
              </tr>
            </thead>
            <tbody>
              {topRisk.map((r) => (
                <tr key={r.site} className="border-b border-slate-100">
                  <td className="py-2 text-slate-800 font-medium">{r.site}</td>
                  <td className="py-2 text-slate-600">{r.region}</td>
                  <td className="py-2 text-slate-700">{r.reason}</td>
                  <td className={`py-2 font-semibold ${r.color}`}>{r.go}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>

      {/* Row 3: Live Feed + Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Section title="Live Activity Feed (Today)" className="lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {liveFeed.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-start gap-2">
                  <Icon className={`h-4 w-4 ${f.color} shrink-0 mt-0.5`} />
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-500">{f.time}</div>
                    <div className="text-[11px] font-bold text-slate-900 truncate">{f.site}</div>
                    <div className="text-[11px] text-slate-700 leading-tight">{f.note}</div>
                    <div className="text-[10px] text-slate-500">{f.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-sm flex flex-col">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <div className="text-[10px] font-semibold text-slate-700">Quality Compliance</div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">98.4%</div>
            <div className="text-[10px] text-slate-500 mt-auto">Installs Passed QA</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-white p-3 shadow-sm flex flex-col">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <div className="text-[10px] font-semibold text-slate-700">Issues Open</div>
            </div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">18</div>
            <div className="text-[10px] text-slate-500 mt-auto">Active Issues</div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-white p-3 shadow-sm flex flex-col">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-600" />
              <div className="text-[10px] font-semibold text-slate-700">SLA Compliance</div>
            </div>
            <div className="text-2xl font-extrabold text-blue-700 mt-1">93.7%</div>
            <div className="text-[10px] text-slate-500 mt-auto">On-Time Execution</div>
          </div>
        </div>
      </div>
    </DashShell>
  );
}
