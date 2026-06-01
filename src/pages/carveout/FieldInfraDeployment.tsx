import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Server, CheckCircle, Truck, Clock, HardDrive, Cable, Activity,
  ShieldCheck, Flag, MapPin, Wrench, Zap, Cpu, Target, AlertTriangle, DoorOpen,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import worldMap from "@/assets/world-map.png";

const kpis: KPI[] = [
  { label: "Total Sites", value: "77", sub: "100%", icon: Server, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Sites In Progress", value: "28", sub: "36.4%", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Sites Completed", value: "42", sub: "54.5%", subColor: "text-emerald-600", icon: Truck, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Planned", value: "7", sub: "9.1%", icon: Clock, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Total Racks", value: "312", sub: "100%", icon: HardDrive, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Racks Installed", value: "248", sub: "79.5%", subColor: "text-emerald-600", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Cabling Complete", value: "211", sub: "67.6%", subColor: "text-violet-600", icon: Cable, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Ready for Integration", value: "186", sub: "59.6%", subColor: "text-amber-600", icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
];

const wwh = {
  what: [
    "The Physical Infrastructure Deployment Tracker — the system that manages rack installs, cabling, and hardware integration.",
  ],
  why: [
    "Infrastructure is not virtual alone. Physical execution determines readiness.",
  ],
  how: [
    "Tracks rack & stack activities across sites",
    "Coordinates hardware installation and cabling",
    "Aligns field execution with logical readiness",
    "Provides real-time visibility into deployment status",
  ],
};

const outcomes: Outcome[] = [
  { icon: Truck, color: "text-blue-600", title: "EXECUTION", l1: "28 active site visits" },
  { icon: CheckCircle, color: "text-emerald-600", title: "QUALITY", l1: "94% first-time-fix" },
  { icon: Clock, color: "text-emerald-600", title: "SPEED", l1: "6.2 hrs / rack" },
  { icon: HardDrive, color: "text-violet-600", title: "VOLUME", l1: "248 racks installed" },
  { icon: Cable, color: "text-blue-600", title: "CABLING", l1: "211 sites complete" },
  { icon: Activity, color: "text-amber-600", title: "READINESS", l1: "186 sites ready" },
];

const regions = [
  { region: "North America", sites: 18, pct: 78, status: "On Track", color: "text-emerald-600", x: 18, y: 32 },
  { region: "Europe",        sites: 16, pct: 69, status: "On Track", color: "text-emerald-600", x: 45, y: 28 },
  { region: "Asia Pacific",  sites: 20, pct: 55, status: "At Risk",  color: "text-amber-600",   x: 72, y: 38 },
  { region: "South America", sites: 8,  pct: 75, status: "On Track", color: "text-emerald-600", x: 28, y: 70 },
  { region: "Africa",        sites: 4,  pct: 25, status: "At Risk",  color: "text-red-600",     x: 50, y: 62 },
  { region: "Australia",     sites: 11, pct: 55, status: "At Risk",  color: "text-amber-600",   x: 80, y: 78 },
];

const rackActivities = [
  { icon: Truck,       color: "text-blue-600",    label: "Racks Delivered",        value: 312, pct: 100,  subPct: "100%" },
  { icon: HardDrive,   color: "text-violet-600",  label: "Racks Staged",           value: 289, pct: 92.6, subPct: "92.6%" },
  { icon: Server,      color: "text-blue-600",    label: "Racks Installed",        value: 248, pct: 79.5, subPct: "79.5%" },
  { icon: Cable,       color: "text-violet-600",  label: "Cabling Complete",       value: 211, pct: 67.6, subPct: "67.6%" },
  { icon: ShieldCheck, color: "text-emerald-600", label: "Power & Network Verified", value: 196, pct: 62.8, subPct: "62.8%" },
  { icon: Flag,        color: "text-amber-600",   label: "Ready for Integration",  value: 186, pct: 59.6, subPct: "59.6%" },
];

const phaseDonut = [
  { name: "Completed", value: 42, color: "hsl(142 71% 45%)" },
  { name: "In Progress", value: 28, color: "hsl(217 91% 60%)" },
  { name: "Planned", value: 7, color: "hsl(38 92% 50%)" },
];

const sites = [
  { name: "Boston-DC1",       region: "North America", status: "Completed",  rack: "12 / 12 (100%)", cabling: "12 / 12 (100%)", ready: "Yes", target: "Apr 25, 2025" },
  { name: "London-DC1",       region: "Europe",        status: "Completed",  rack: "18 / 18 (100%)", cabling: "18 / 18 (100%)", ready: "Yes", target: "Apr 28, 2025" },
  { name: "Singapore-DC1",    region: "Asia Pacific",  status: "In Progress", rack: "22 / 30 (73%)",  cabling: "16 / 30 (53%)",  ready: "No",  target: "May 20, 2025" },
  { name: "Sydney-DC1",       region: "Australia",     status: "In Progress", rack: "12 / 20 (60%)",  cabling: "8 / 20 (40%)",   ready: "No",  target: "May 18, 2025" },
  { name: "SaoPaulo-DC1",     region: "South America", status: "In Progress", rack: "10 / 14 (72%)",  cabling: "9 / 14 (64%)",   ready: "No",  target: "May 15, 2025" },
  { name: "Johannesburg-DC1", region: "Africa",        status: "At Risk",    rack: "6 / 16 (38%)",   cabling: "3 / 16 (19%)",   ready: "No",  target: "May 25, 2025" },
];

const activitySummary = [
  { icon: Server,      color: "text-blue-600",    label: "Rack Installation",  total: 312, complete: 248, pct: 79.5 },
  { icon: Zap,         color: "text-amber-600",   label: "Cabling (Power)",    total: 312, complete: 236, pct: 75.6 },
  { icon: Cable,       color: "text-violet-600",  label: "Cabling (Network)",  total: 312, complete: 211, pct: 67.6 },
  { icon: ShieldCheck, color: "text-emerald-600", label: "Power Verification", total: 312, complete: 198, pct: 63.5 },
  { icon: Activity,    color: "text-blue-600",    label: "Network Verification", total: 312, complete: 196, pct: 62.8 },
  { icon: Cpu,         color: "text-violet-600",  label: "Hardware Integration", total: 312, complete: 186, pct: 59.6 },
];

const recent = [
  { time: "May 12, 2025 09:15 AM", activity: "Rack installation completed (6 racks)", site: "Boston-DC1",       status: "Completed" },
  { time: "May 12, 2025 08:45 AM", activity: "Network cabling completed (12 runs)",   site: "London-DC1",       status: "Completed" },
  { time: "May 12, 2025 07:30 AM", activity: "Power verification passed",             site: "Singapore-DC1",    status: "Completed" },
  { time: "May 11, 2025 06:20 PM", activity: "Racks delivered (10)",                  site: "Sydney-DC1",       status: "In Progress" },
  { time: "May 11, 2025 05:05 PM", activity: "Network cabling in progress (40%)",     site: "SaoPaulo-DC1",     status: "In Progress" },
  { time: "May 11, 2025 04:10 PM", activity: "Site survey completed",                 site: "Johannesburg-DC1", status: "Completed" },
  { time: "May 11, 2025 03:22 PM", activity: "Power issue detected — remediation in progress", site: "Singapore-DC1", status: "At Risk" },
];

const milestones = [
  { icon: DoorOpen,    color: "text-blue-600",    bg: "bg-blue-50",    title: "Complete Rack Installations", value: "64 racks", sub: "remaining" },
  { icon: Cable,       color: "text-emerald-600", bg: "bg-emerald-50", title: "Complete Cabling",            value: "101 cable runs", sub: "remaining" },
  { icon: ShieldCheck, color: "text-amber-600",   bg: "bg-amber-50",   title: "Power & Network Verification", value: "116 sites", sub: "remaining" },
  { icon: Wrench,      color: "text-violet-600",  bg: "bg-violet-50",  title: "Hardware Integration",        value: "126 sites", sub: "remaining" },
  { icon: Flag,        color: "text-emerald-600", bg: "bg-emerald-50", title: "Ready for Integration",       value: "186 sites", sub: "target" },
];

function ProgressBar({ pct, color = "hsl(217 91% 60%)" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function FieldInfraDeployment() {
  return (
    <DashShell
      title="FIELD INFRASTRUCTURE"
      highlight="DEPLOYMENT & RACK INTEGRATION TRACKER"
      subtitle="Real-time visibility into physical infrastructure deployment, rack & stack activities, and site readiness across all locations."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Map + Rack Activity + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Deployment Progress by Region">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative h-56 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden">
              <img
                src={worldMap}
                alt="World map"
                loading="lazy"
                width={1024}
                height={512}
                className="absolute inset-0 w-full h-full object-contain opacity-90"
              />
              {regions.map((r) => {
                const ring =
                  r.status === "On Track" ? "border-emerald-400 text-emerald-700 bg-white" :
                  r.status === "At Risk"  ? "border-amber-400 text-amber-700 bg-white" :
                                            "border-red-400 text-red-700 bg-white";
                return (
                  <div key={r.region} className="absolute -translate-x-1/2 -translate-y-1/2"
                       style={{ left: `${r.x}%`, top: `${r.y}%` }}>
                    <div className={`h-10 w-10 rounded-full border-2 ${ring} grid place-items-center font-bold text-xs shadow`}>
                      {r.sites}
                    </div>
                    <div className="text-[9px] text-center text-slate-600 mt-0.5">{r.pct}%</div>
                  </div>
                );
              })}
            </div>
            <div className="text-[11px]">
              <table className="w-full">
                <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-200">
                  <tr><th className="text-left py-1">Region</th><th className="text-right py-1">Sites</th><th className="text-right py-1">%</th><th className="text-right py-1">Status</th></tr>
                </thead>
                <tbody>
                  {regions.map((r) => (
                    <tr key={r.region} className="border-b border-slate-100">
                      <td className="py-1 text-slate-700">{r.region}</td>
                      <td className="py-1 text-right font-semibold">{r.sites}</td>
                      <td className="py-1 text-right">{r.pct}%</td>
                      <td className="py-1 text-right">
                        <span className={`inline-flex items-center gap-1 ${r.color} font-medium text-[10px]`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" /> {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-[11px] text-blue-600 font-medium cursor-pointer">View all sites →</div>
            </div>
          </div>
        </Section>

        <Section title="Rack & Stack Activity Progress">
          <div className="space-y-3">
            {rackActivities.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.label}>
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <Icon className={`h-4 w-4 ${a.color}`} />
                    <span className="text-slate-700 flex-1">{a.label}</span>
                    <span className="font-bold text-slate-900">{a.value}</span>
                    <span className="text-slate-500">({a.subPct})</span>
                  </div>
                  <ProgressBar pct={a.pct} />
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Site Readiness by Phase">
          <div className="flex items-center gap-3">
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={phaseDonut} dataKey="value" innerRadius={48} outerRadius={70} paddingAngle={2}>
                    {phaseDonut.map((p, i) => <Cell key={i} fill={p.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-slate-900">77</div>
                  <div className="text-[10px] text-slate-500">Total Sites</div>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-xs flex-1">
              {phaseDonut.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
                  <span className="flex-1 text-slate-700">{p.name}</span>
                  <span className="font-semibold text-slate-900">
                    {p.value} ({((p.value / 77) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 p-2.5">
            <div className="text-[11px] text-emerald-800 font-medium mb-1">Target: 100% Sites Ready for Integration</div>
            <div className="flex items-center gap-2">
              <ProgressBar pct={59.6} color="hsl(142 71% 45%)" />
              <span className="text-[11px] font-bold text-emerald-700">59.6%</span>
            </div>
          </div>
        </Section>
      </div>

      {/* Row 2: Site Status + Activity Summary + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Section title="Site Deployment Status">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-2">Site Name</th>
                  <th className="text-left py-2">Region</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Rack Progress</th>
                  <th className="text-left py-2">Cabling Progress</th>
                  <th className="text-left py-2">Ready</th>
                  <th className="text-left py-2">Target Date</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((s) => (
                  <tr key={s.name} className="border-b border-slate-100">
                    <td className="py-2 font-medium text-slate-900">{s.name}</td>
                    <td className="py-2 text-slate-700">{s.region}</td>
                    <td className="py-2"><StatusPill status={s.status} /></td>
                    <td className="py-2 text-slate-700">{s.rack}</td>
                    <td className="py-2 text-slate-700">{s.cabling}</td>
                    <td className="py-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${s.ready === "Yes" ? "text-emerald-600" : "text-red-500"}`}>
                        {s.ready === "Yes" ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {s.ready}
                      </span>
                    </td>
                    <td className="py-2 text-slate-700">{s.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Activity Summary (All Sites)">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr><th className="text-left py-2"></th><th className="text-right py-2">Total</th><th className="text-right py-2">Completed</th><th className="text-right py-2">% Complete</th></tr>
            </thead>
            <tbody>
              {activitySummary.map((a) => {
                const Icon = a.icon;
                return (
                  <tr key={a.label} className="border-b border-slate-100">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${a.color}`} />
                        <span className="text-slate-700">{a.label}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right font-semibold">{a.total}</td>
                    <td className="py-2 text-right">{a.complete}</td>
                    <td className="py-2 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-16"><ProgressBar pct={a.pct} /></div>
                        <span className="font-semibold text-slate-900 w-10 text-right">{a.pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>

        <Section title="Recent Field Activity (Last 7 Days)">
          <div className="space-y-1.5">
            {recent.map((r, i) => (
              <div key={i} className="grid grid-cols-12 items-center gap-2 text-[11px] py-1.5 border-b border-slate-100">
                <div className="col-span-3 text-slate-500 text-[10px]">{r.time}</div>
                <div className="col-span-5 text-slate-800">{r.activity}</div>
                <div className="col-span-2 text-slate-600">{r.site}</div>
                <div className="col-span-2 text-right"><StatusPill status={r.status} /></div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Row 3: Readiness + Milestones + Goal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-50 grid place-items-center text-blue-600">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Field Execution Readiness</div>
              <div className="text-3xl font-extrabold text-slate-900 leading-tight">59.6%</div>
              <div className="text-[10px] text-slate-500">Sites ready for integration</div>
            </div>
          </div>
          <div className="mt-3"><ProgressBar pct={59.6} color="hsl(142 71% 45%)" /></div>
        </div>

        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-900 mb-3">Next Milestones</div>
          <div className="flex items-stretch gap-2 overflow-x-auto">
            {milestones.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={m.title} className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-center text-center w-32">
                    <div className={`h-10 w-10 rounded-full ${m.bg} ${m.color} grid place-items-center mb-1`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-[10px] font-semibold text-slate-800 leading-tight">{m.title}</div>
                    <div className="text-[11px] font-bold text-slate-900 mt-0.5">{m.value}</div>
                    <div className="text-[9px] text-slate-500">{m.sub}</div>
                  </div>
                  {i < milestones.length - 1 && <div className="text-slate-300 text-lg">→</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-slate-100 grid place-items-center text-slate-600 shrink-0">
            <Flag className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Day 1 Goal</div>
            <div className="text-lg font-extrabold text-slate-900 leading-tight">100% Sites</div>
            <div className="text-[10px] text-slate-600">Ready for Integration<br/>by Day 1</div>
          </div>
        </div>
      </div>
    </DashShell>
  );
}
