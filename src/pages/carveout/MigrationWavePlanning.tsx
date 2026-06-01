import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Database, Activity, Loader, Clock, CheckCircle2, PieChart as PieIcon, Calendar,
  Server, Network, ShieldCheck, Boxes, AlertTriangle, AlertCircle, ArrowLeftRight,
  DollarSign, Flag,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const kpis: KPI[] = [
  { label: "Total Waves",       value: "6",          sub: "Planned",                 subColor: "text-blue-600",    icon: Database,    color: "text-blue-600",    bg: "bg-blue-50" },
  { label: "Waves Completed",   value: "2",          sub: "33%",                     subColor: "text-emerald-600", icon: Activity,    color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "In Progress",       value: "2",          sub: "33%",                     subColor: "text-amber-600",   icon: Loader,      color: "text-amber-600",   bg: "bg-amber-50" },
  { label: "Upcoming Waves",    value: "2",          sub: "33%",                     subColor: "text-violet-600",  icon: Clock,       color: "text-violet-600",  bg: "bg-violet-50" },
  { label: "Total Workloads",   value: "178",        sub: "100%",                    subColor: "text-blue-600",    icon: Database,    color: "text-blue-600",    bg: "bg-blue-50" },
  { label: "Workloads Migrated",value: "72",         sub: "40%",                     subColor: "text-emerald-600", icon: CheckCircle2,color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Cutover Readiness (Avg.)", value: "78%", sub: "+8% vs last 7 days",      subColor: "text-emerald-600", icon: PieIcon,     color: "text-amber-600",   bg: "bg-amber-50" },
  { label: "Est. Program Completion", value: "Aug 15, 2025", sub: "68 days remaining", subColor: "text-violet-600", icon: Calendar,   color: "text-violet-600",  bg: "bg-violet-50" },
];

const wwh = {
  what: [
    "Migration waves and sequencing",
    "Workloads assigned per wave",
    "Dependency alignment across infrastructure, network, and data",
    "Cutover readiness per wave",
  ],
  why: ["Cloud migration is not a lift-and-shift event. This dashboard ensures a coordinated, low-risk migration with the right sequence, dependencies, and readiness."],
  how: [
    "Plan waves based on business priority, dependencies, and risk",
    "Track progress in real time across people, process, and technology",
    "Validate dependency and cutover readiness before execution",
    "Orchestrate tasks across infrastructure, network, and data teams",
  ],
};

const outcomes: Outcome[] = [
  { icon: Calendar,     color: "text-blue-600",    title: "SCHEDULE PERFORMANCE", l1: "On Track" },
  { icon: DollarSign,   color: "text-emerald-600", title: "BUDGET PERFORMANCE",   l1: "On Track" },
  { icon: AlertTriangle,color: "text-amber-600",   title: "RISK EXPOSURE",        l1: "Medium" },
  { icon: AlertCircle,  color: "text-red-600",     title: "ISSUES",               l1: "12 Open" },
  { icon: PieIcon,      color: "text-violet-600",  title: "DECISIONS REQUIRED",   l1: "5" },
  { icon: ArrowLeftRight,color: "text-blue-600",   title: "CHANGE REQUESTS",      l1: "7" },
];

const waves = [
  { w: "Wave 1", n: "Foundation & Quick Wins",     prio: "High",   pc: "bg-red-100 text-red-700",      wl: 24, status: "Completed",   sc: "bg-emerald-100 text-emerald-700", start: "Apr 15, 2025", cut: "May 5, 2025",  prog: 100, bar: "hsl(142 71% 45%)", read: 95, dot: "bg-emerald-500" },
  { w: "Wave 2", n: "Customer Applications",       prio: "High",   pc: "bg-red-100 text-red-700",      wl: 32, status: "Completed",   sc: "bg-emerald-100 text-emerald-700", start: "May 6, 2025",  cut: "May 26, 2025", prog: 100, bar: "hsl(142 71% 45%)", read: 92, dot: "bg-emerald-500" },
  { w: "Wave 3", n: "Business Applications",       prio: "Medium", pc: "bg-amber-100 text-amber-700",  wl: 38, status: "In Progress", sc: "bg-amber-100 text-amber-700",     start: "May 27, 2025", cut: "Jun 16, 2025", prog: 65,  bar: "hsl(38 92% 50%)",  read: 72, dot: "bg-amber-500" },
  { w: "Wave 4", n: "Data & Analytics Platform",   prio: "Medium", pc: "bg-amber-100 text-amber-700",  wl: 34, status: "In Progress", sc: "bg-amber-100 text-amber-700",     start: "Jun 17, 2025", cut: "Jul 7, 2025",  prog: 30,  bar: "hsl(38 92% 50%)",  read: 60, dot: "bg-amber-500" },
  { w: "Wave 5", n: "Collaboration & Productivity",prio: "Low",    pc: "bg-blue-100 text-blue-700",    wl: 28, status: "Planned",     sc: "bg-blue-100 text-blue-700",       start: "Jul 8, 2025",  cut: "Jul 28, 2025", prog: 0,   bar: "hsl(217 91% 60%)", read: null, dot: "bg-slate-300" },
  { w: "Wave 6", n: "Long Tail & Optimization",    prio: "Low",    pc: "bg-blue-100 text-blue-700",    wl: 22, status: "Planned",     sc: "bg-blue-100 text-blue-700",       start: "Jul 29, 2025", cut: "Aug 15, 2025", prog: 0,   bar: "hsl(217 91% 60%)", read: null, dot: "bg-slate-300" },
];

const dep = [
  { w: "Wave 1", v: ["Complete","Complete","Complete","Complete","Complete"], r: "95%", rc: "text-emerald-600" },
  { w: "Wave 2", v: ["Complete","Complete","Complete","Complete","Complete"], r: "92%", rc: "text-emerald-600" },
  { w: "Wave 3", v: ["In Progress","In Progress","In Progress","Complete","In Progress"], r: "72%", rc: "text-amber-600" },
  { w: "Wave 4", v: ["In Progress","In Progress","In Progress","In Progress","Planned"],  r: "60%", rc: "text-amber-600" },
  { w: "Wave 5", v: ["Planned","Planned","Planned","Planned","Planned"], r: "—", rc: "text-slate-400" },
  { w: "Wave 6", v: ["Planned","Planned","Planned","Planned","Planned"], r: "—", rc: "text-slate-400" },
];
const depHead = [
  { l: "Infrastructure", icon: Server },
  { l: "Network",        icon: Network },
  { l: "Data",           icon: Database },
  { l: "Security",       icon: ShieldCheck },
  { l: "Applications",   icon: Boxes },
];
const cellColor = (v: string) =>
  v === "Complete" ? "text-emerald-600" : v === "In Progress" ? "text-amber-600" : "text-blue-600";

const wlByWave = [
  { name: "Wave 1 – 24 (13%)", value: 24, color: "hsl(217 91% 60%)" },
  { name: "Wave 2 – 32 (18%)", value: 32, color: "hsl(142 71% 45%)" },
  { name: "Wave 3 – 38 (21%)", value: 38, color: "hsl(38 92% 50%)" },
  { name: "Wave 4 – 34 (19%)", value: 34, color: "hsl(262 83% 58%)" },
  { name: "Wave 5 – 28 (16%)", value: 28, color: "hsl(189 94% 43%)" },
  { name: "Wave 6 – 22 (12%)", value: 22, color: "hsl(330 81% 60%)" },
];

const inFlight = [
  { wl: "ERP Core",            owner: "Finance",        wave: "Wave 3", cut: "Jun 6, 2025",  prog: 70, read: 75, rc: "text-amber-600",   dot: "bg-amber-500" },
  { wl: "CRM Platform",        owner: "Sales",          wave: "Wave 3", cut: "Jun 9, 2025",  prog: 60, read: 70, rc: "text-amber-600",   dot: "bg-amber-500" },
  { wl: "Data Warehouse",      owner: "Data & Analytics", wave: "Wave 4", cut: "Jun 24, 2025", prog: 40, read: 62, rc: "text-amber-600", dot: "bg-amber-500" },
  { wl: "Manufacturing System",owner: "Operations",     wave: "Wave 4", cut: "Jun 27, 2025", prog: 25, read: 55, rc: "text-amber-600",   dot: "bg-amber-500" },
  { wl: "Supplier Portal",     owner: "Procurement",    wave: "Wave 3", cut: "Jun 11, 2025", prog: 80, read: 80, rc: "text-emerald-600", dot: "bg-emerald-500" },
];

const readinessDist = [
  { name: "Ready (≥ 90%)",    value: 54, pct: 30, color: "hsl(142 71% 45%)" },
  { name: "At Risk (70%–89%)",value: 68, pct: 38, color: "hsl(38 92% 50%)" },
  { name: "Not Ready (< 70%)",value: 56, pct: 32, color: "hsl(0 84% 60%)" },
];

const milestones = [
  { d: "May 26, 2025", l: "Complete Wave 2 Cutover", icon: CheckCircle2, c: "text-emerald-600" },
  { d: "Jun 16, 2025", l: "Complete Wave 3 Cutover", icon: Clock,        c: "text-amber-600" },
  { d: "Jul 7, 2025",  l: "Complete Wave 4 Cutover", icon: Clock,        c: "text-slate-400" },
  { d: "Jul 28, 2025", l: "Complete Wave 5 Cutover", icon: Clock,        c: "text-slate-400" },
  { d: "Aug 15, 2025", l: "Program Completion",      icon: Flag,         c: "text-slate-400" },
];

export default function MigrationWavePlanning() {
  return (
    <DashShell
      title="MIGRATION WAVE PLANNING & EXECUTION ORCHESTRATION CONSOLE"
      subtitle="Controlled, phased execution of cloud migration with dependency alignment and cutover readiness"
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Wave plan + Dependency alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Section title="Migration Wave Plan & Progress" className="lg:col-span-7">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Wave</th>
                <th className="text-left py-1.5">Name</th>
                <th className="text-left py-1.5">Business Priority</th>
                <th className="text-right py-1.5">Workloads</th>
                <th className="text-left py-1.5 pl-2">Status</th>
                <th className="text-left py-1.5">Start Date</th>
                <th className="text-left py-1.5">Target Cutover</th>
                <th className="text-left py-1.5 pl-2">Progress</th>
                <th className="text-left py-1.5 pl-2">Cutover Readiness</th>
              </tr>
            </thead>
            <tbody>
              {waves.map((w) => (
                <tr key={w.w} className="border-b border-slate-100">
                  <td className="py-2 font-bold text-blue-600">{w.w}</td>
                  <td className="py-2 text-slate-700 leading-tight">{w.n}</td>
                  <td className="py-2"><span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${w.pc}`}>{w.prio}</span></td>
                  <td className="py-2 text-right text-slate-700">{w.wl}</td>
                  <td className="py-2 pl-2"><span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${w.sc}`}>{w.status}</span></td>
                  <td className="py-2 text-slate-600">{w.start}</td>
                  <td className="py-2 text-slate-600">{w.cut}</td>
                  <td className="py-2 pl-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 w-9 text-[10px]">{w.prog}%</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                        <div className="h-full rounded-full" style={{ width: `${w.prog}%`, background: w.bar }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-2 pl-2">
                    {w.read != null ? (
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${w.dot}`} />
                        <span className="font-semibold text-slate-900 text-[10px]">{w.read}%</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 font-medium mt-2 inline-block">View wave roadmap →</a>
        </Section>

        <Section title="Dependency Alignment Overview" className="lg:col-span-5">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Wave</th>
                {depHead.map((h) => {
                  const Icon = h.icon;
                  return (
                    <th key={h.l} className="text-center py-1.5">
                      <div className="flex flex-col items-center gap-0.5"><Icon className="h-3 w-3 text-blue-600" />{h.l}</div>
                    </th>
                  );
                })}
                <th className="text-right py-1.5">Overall<br/>Readiness</th>
              </tr>
            </thead>
            <tbody>
              {dep.map((r) => (
                <tr key={r.w} className="border-b border-slate-100">
                  <td className="py-2 font-bold text-blue-600">{r.w}</td>
                  {r.v.map((v, i) => (
                    <td key={i} className={`py-2 text-center font-semibold ${cellColor(v)}`}>{v}</td>
                  ))}
                  <td className={`py-2 text-right font-bold ${r.rc}`}>{r.r}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 font-medium mt-2 inline-block">View dependency details →</a>
        </Section>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Workloads by Wave" className="lg:col-span-3">
          <div className="grid grid-cols-12 gap-1 items-center">
            <div className="col-span-6 relative h-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={wlByWave} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                    {wlByWave.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-base font-bold text-slate-900">178</div>
                  <div className="text-[9px] text-slate-500">Total Workloads</div>
                </div>
              </div>
            </div>
            <div className="col-span-6 space-y-1 text-[10px]">
              {wlByWave.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: d.color }} />
                  <span className="text-slate-700 leading-tight">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Top Workloads in Flight (Wave 3 & 4)" className="lg:col-span-5">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Workload</th>
                <th className="text-left py-1.5">Application Owner</th>
                <th className="text-left py-1.5">Wave</th>
                <th className="text-left py-1.5">Target Cutover</th>
                <th className="text-left py-1.5 pl-2">Progress</th>
                <th className="text-left py-1.5 pl-2">Cutover Readiness</th>
              </tr>
            </thead>
            <tbody>
              {inFlight.map((r) => (
                <tr key={r.wl} className="border-b border-slate-100">
                  <td className="py-1.5 font-medium text-slate-900">{r.wl}</td>
                  <td className="py-1.5 text-slate-600">{r.owner}</td>
                  <td className="py-1.5 font-bold text-blue-600">{r.wave}</td>
                  <td className="py-1.5 text-slate-600">{r.cut}</td>
                  <td className="py-1.5 pl-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 w-9 text-[10px]">{r.prog}%</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                        <div className="h-full rounded-full" style={{ width: `${r.prog}%`, background: "hsl(38 92% 50%)" }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-1.5 pl-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${r.dot}`} />
                      <span className={`font-semibold ${r.rc} text-[10px]`}>{r.read}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 font-medium mt-2 inline-block">View all workloads in flight →</a>
        </Section>

        <Section title="Cutover Readiness Distribution" className="lg:col-span-2">
          <div className="relative h-40">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={readinessDist} dataKey="value" nameKey="name" innerRadius={42} outerRadius={66} paddingAngle={2}>
                  {readinessDist.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="text-base font-bold text-slate-900">178</div>
                <div className="text-[9px] text-slate-500">Workloads</div>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-[10px] mt-1">
            {readinessDist.map((r) => (
              <div key={r.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: r.color }} />
                <span className="text-slate-700 truncate">{r.name}</span>
                <span className="ml-auto font-semibold text-slate-900">{r.value} ({r.pct}%)</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
            <span className="text-slate-700 font-medium">Overall Readiness (Avg.)</span>
            <span className="font-bold text-slate-900">78% <span className="text-emerald-600 ml-1 font-normal">+8%</span></span>
          </div>
        </Section>

        <Section title="Upcoming Milestones" className="lg:col-span-2">
          <div className="space-y-2">
            {milestones.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.d} className="flex items-start gap-2 text-[10px]">
                  <Icon className={`h-4 w-4 ${m.c} shrink-0 mt-0.5`} />
                  <div className="min-w-0">
                    <div className="text-slate-500 text-[9px]">{m.d}</div>
                    <div className="text-slate-800 font-medium leading-tight">{m.l}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <a className="text-[11px] text-blue-600 font-medium mt-3 inline-block">View full program timeline →</a>
        </Section>
      </div>
    </DashShell>
  );
}
