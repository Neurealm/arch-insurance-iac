import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  CloudUpload, ServerCog, Cloud, Activity, Database, DollarSign, Target,
  CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Rocket, TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from "recharts";
import worldMap from "@/assets/world-map.png";

const kpis: KPI[] = [
  { label: "Workloads Migrated to Cloud", value: "48%",    sub: "612 of 1,278 · +7% vs last 7 days", subColor: "text-emerald-600", icon: CloudUpload, color: "text-blue-600",    bg: "bg-blue-50" },
  { label: "On-Prem Workloads",            value: "32%",    sub: "409 of 1,278 · -3% vs last 7 days", subColor: "text-emerald-600", icon: ServerCog,  color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Hybrid Workloads",             value: "20%",    sub: "257 of 1,278 · +1% vs last 7 days", subColor: "text-violet-600",  icon: Cloud,      color: "text-violet-600",  bg: "bg-violet-50" },
  { label: "Total Workloads",              value: "1,278",  sub: "100% · No change",                  subColor: "text-slate-500",   icon: Activity,   color: "text-cyan-600",    bg: "bg-cyan-50" },
  { label: "Cloud Cost (MTD)",             value: "$3.42M", sub: "+8.6% vs last month",               subColor: "text-emerald-600", icon: Database,   color: "text-amber-600",   bg: "bg-amber-50" },
  { label: "Savings Realized (MTD)",       value: "$1.12M", sub: "+12.4% vs last month",              subColor: "text-emerald-600", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Future-State Readiness",       value: "67%",    sub: "+6% vs last 7 days",                subColor: "text-emerald-600", icon: Target,     color: "text-violet-600",  bg: "bg-violet-50" },
];

const wwh = {
  what: [
    "% of workloads migrated to cloud (Azure / AWS)",
    "On-prem vs cloud vs hybrid distribution",
    "Migration wave progress and backlog",
    "Day 1 vs future-state architecture readiness",
    "Regional cloud adoption heatmap",
  ],
  why: ["Cloud is not just migration, it is transformation. This shows whether we are actually reaching the target state, not just moving workloads."],
  how: [
    "Consolidated data from discovery, migration, and operations systems",
    "Real-time tracking of workload movement and readiness",
    "Architecture and adoption insights by region and business unit",
    "Forward-looking view of future-state cloud architecture",
  ],
};

const outcomes: Outcome[] = [
  { icon: Target,      color: "text-blue-600",    title: "OUR GOAL",     l1: "Successful cloud transformation with business outcomes and measurable value." },
  { icon: Cloud,       color: "text-blue-600",    title: "RELIABLE",     l1: "Built for scale and resiliency." },
  { icon: ShieldCheck, color: "text-emerald-600", title: "SECURE",       l1: "Governed and compliant by design." },
  { icon: DollarSign,  color: "text-violet-600",  title: "OPTIMIZED",    l1: "Cost-effective and continuously improved." },
  { icon: TrendingUp,  color: "text-blue-600",    title: "FUTURE-READY", l1: "Modern, agile, and innovation-driven." },
];

const distribution = [
  { name: "Cloud (Azure / AWS)", value: 612, pct: 48, color: "hsl(217 91% 60%)" },
  { name: "On-Prem",             value: 409, pct: 32, color: "hsl(142 71% 45%)" },
  { name: "Hybrid",              value: 257, pct: 20, color: "hsl(262 83% 58%)" },
];

const waves = [
  { w: "Wave 1 (Foundation)", status: "Completed",   sc: "bg-emerald-100 text-emerald-700", total: 160, mig: 160, pct: 100, date: "Mar 15, 2026", bar: "hsl(142 71% 45%)" },
  { w: "Wave 2",              status: "Completed",   sc: "bg-emerald-100 text-emerald-700", total: 210, mig: 210, pct: 100, date: "Apr 15, 2026", bar: "hsl(142 71% 45%)" },
  { w: "Wave 3",              status: "In Progress", sc: "bg-amber-100 text-amber-700",     total: 280, mig: 196, pct: 70,  date: "May 15, 2026", bar: "hsl(38 92% 50%)" },
  { w: "Wave 4",              status: "In Progress", sc: "bg-amber-100 text-amber-700",     total: 320, mig: 96,  pct: 30,  date: "Jun 15, 2026", bar: "hsl(38 92% 50%)" },
  { w: "Wave 5",              status: "Planned",     sc: "bg-blue-100 text-blue-700",       total: 308, mig: 0,   pct: 0,   date: "Jul 15, 2026", bar: "hsl(217 91% 60%)" },
];

const day1 = [
  { l: "Core Infrastructure", v: 82 },
  { l: "Identity & Access",   v: 75 },
  { l: "Connectivity",        v: 70 },
  { l: "Security",            v: 68 },
  { l: "Operations",          v: 65 },
];
const future = [
  { l: "Architecture", v: 70 },
  { l: "Cloud-Native", v: 60 },
  { l: "Automation",   v: 62 },
  { l: "Resiliency",   v: 68 },
  { l: "Optimization", v: 65 },
];

const wlSummary = [
  { c: "Applications",          icon: Cloud,      total: 572, cloud: 312, hyb: 120, on: 140, pct: 55 },
  { c: "Databases",             icon: Database,   total: 198, cloud: 108, hyb: 50,  on: 40,  pct: 55 },
  { c: "Infrastructure Services", icon: ServerCog, total: 186, cloud: 82,  hyb: 38,  on: 66,  pct: 44 },
  { c: "Data & Analytics",      icon: Activity,   total: 132, cloud: 66,  hyb: 28,  on: 38,  pct: 50 },
  { c: "Integration / Middleware", icon: Rocket,  total: 96,  cloud: 34,  hyb: 13,  on: 49,  pct: 35 },
  { c: "Security Services",     icon: ShieldCheck,total: 94,  cloud: 56,  hyb: 8,   on: 30,  pct: 60 },
];

const backlogTop = [
  { app: "ERP System",          bu: "Finance",     comp: "High",   wave: "Wave 4", reason: "Integration Dependency" },
  { app: "Laboratory Platform", bu: "R&D",         comp: "High",   wave: "Wave 4", reason: "Data Migration" },
  { app: "Manufacturing System",bu: "Operations",  comp: "Medium", wave: "Wave 5", reason: "Custom Configuration" },
  { app: "Data Warehouse",      bu: "IT",          comp: "Medium", wave: "Wave 5", reason: "Capacity Planning" },
  { app: "Customer Portal",     bu: "Commercial",  comp: "Low",    wave: "Wave 5", reason: "Vendor Readiness" },
];

const regions = [
  { name: "NA",   pct: 78, x: 18, y: 35, tone: "bg-emerald-700 text-white" },
  { name: "EU",   pct: 65, x: 47, y: 32, tone: "bg-emerald-500 text-white" },
  { name: "APAC", pct: 55, x: 75, y: 45, tone: "bg-emerald-500 text-white" },
  { name: "AFR",  pct: 32, x: 50, y: 62, tone: "bg-amber-500 text-white" },
  { name: "LATAM",pct: 46, x: 27, y: 70, tone: "bg-emerald-500 text-white" },
];

const Donut = ({ pct, color }: { pct: number; color: string }) => {
  const data = [{ v: pct }, { v: 100 - pct }];
  return (
    <div className="relative h-40 w-40">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="v" innerRadius={48} outerRadius={70} startAngle={90} endAngle={-270} stroke="none">
            <Cell fill={color} />
            <Cell fill="hsl(215 16% 90%)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{pct}%</div>
          <div className="text-[9px] text-slate-500">Readiness Score</div>
        </div>
      </div>
    </div>
  );
};

export default function CloudTransformation() {
  return (
    <DashShell
      title="CLOUD TRANSFORMATION COMMAND CENTER"
      highlight="(DAY 1 & FUTURE-STATE VIEW)"
      subtitle="Executive visibility into cloud migration progress and future-state readiness"
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Distribution donut + Migration waves + Day1/Future */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Section title="Workload Distribution by Environment" className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-2">
            <div className="relative h-48">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={2}>
                    {distribution.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-base font-bold text-slate-900">1,278</div>
                  <div className="text-[10px] text-slate-500">Total Workloads</div>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {distribution.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: d.color }} />
                  <span className="text-slate-700 truncate">{d.name}</span>
                  <span className="ml-auto font-semibold text-slate-900">{d.value}</span>
                  <span className="text-slate-500 w-12 text-right">({d.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Migration Wave Progress" className="lg:col-span-5">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Wave</th>
                <th className="text-left py-1.5">Status</th>
                <th className="text-right py-1.5">Workloads</th>
                <th className="text-right py-1.5">Migrated</th>
                <th className="text-left py-1.5 pl-3">% Complete</th>
                <th className="text-right py-1.5">Target Date</th>
              </tr>
            </thead>
            <tbody>
              {waves.map((w) => (
                <tr key={w.w} className="border-b border-slate-100">
                  <td className="py-2 font-medium text-slate-900">{w.w}</td>
                  <td className="py-2"><span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${w.sc}`}>{w.status}</span></td>
                  <td className="py-2 text-right text-slate-700">{w.total}</td>
                  <td className="py-2 text-right text-slate-700">{w.mig}</td>
                  <td className="py-2 pl-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 w-9">{w.pct}%</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${w.pct}%`, background: w.bar }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-2 text-right text-slate-600">{w.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 font-medium mt-2 inline-block">View all waves →</a>
        </Section>

        <Section title="Day 1 Readiness vs Future-State Readiness" className="lg:col-span-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-[10px] font-semibold text-slate-700 mb-1">Day 1 Readiness</div>
              <div className="grid place-items-center"><Donut pct={72} color="hsl(217 91% 60%)" /></div>
              <div className="space-y-0.5 text-[10px] mt-1 text-left">
                {day1.map((d) => (
                  <div key={d.l} className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-700"><CheckCircle2 className="h-2.5 w-2.5 text-blue-600" />{d.l}</span>
                    <span className="font-semibold text-slate-900">{d.v}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-semibold text-slate-700 mb-1">Future-State Readiness</div>
              <div className="grid place-items-center"><Donut pct={67} color="hsl(142 71% 45%)" /></div>
              <div className="space-y-0.5 text-[10px] mt-1 text-left">
                {future.map((d) => (
                  <div key={d.l} className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-700"><CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />{d.l}</span>
                    <span className="font-semibold text-slate-900">{d.v}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-2 flex flex-col">
              <div className="text-[10px] font-semibold text-slate-700">Readiness Gap</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">5%</div>
              <div className="text-[10px] font-semibold text-slate-700 mt-3 mb-1">Focus Areas</div>
              <ul className="space-y-1 text-[10px] text-slate-700">
                <li className="flex items-center gap-1"><Cloud className="h-3 w-3 text-blue-600" />Cloud-Native Adoption</li>
                <li className="flex items-center gap-1"><Rocket className="h-3 w-3 text-blue-600" />Automation</li>
                <li className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-blue-600" />Cost Optimization</li>
                <li className="flex items-center gap-1"><Activity className="h-3 w-3 text-blue-600" />Advanced Analytics</li>
              </ul>
            </div>
          </div>
        </Section>
      </div>

      {/* Row 2: Heatmap + Workload summary + Backlog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Regional Cloud Adoption Heatmap (% Workloads in Cloud)" className="lg:col-span-3">
          <div className="relative w-full aspect-[16/10] bg-slate-50 rounded-lg overflow-hidden">
            <img src={worldMap} alt="World map" className="absolute inset-0 w-full h-full object-cover opacity-90" />
            {regions.map((r) => (
              <div key={r.name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${r.x}%`, top: `${r.y}%` }}>
                <div className={`px-2 py-0.5 rounded shadow text-[10px] font-bold ${r.tone}`}>{r.pct}%</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] mt-2">
            <div className="flex items-center gap-1"><span className="h-2 w-3 bg-emerald-700" />75%+</div>
            <div className="flex items-center gap-1"><span className="h-2 w-3 bg-emerald-500" />50% - 75%</div>
            <div className="flex items-center gap-1"><span className="h-2 w-3 bg-amber-500" />25% - 50%</div>
            <div className="flex items-center gap-1"><span className="h-2 w-3 bg-red-500" />&lt; 25%</div>
          </div>
        </Section>

        <Section title="Workload Migration Summary" className="lg:col-span-5">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Category</th>
                <th className="text-right py-1.5">Total</th>
                <th className="text-right py-1.5">In Cloud</th>
                <th className="text-right py-1.5">Hybrid</th>
                <th className="text-right py-1.5">On-Prem</th>
                <th className="text-left py-1.5 pl-3">% In Cloud</th>
              </tr>
            </thead>
            <tbody>
              {wlSummary.map((r) => {
                const Icon = r.icon;
                return (
                  <tr key={r.c} className="border-b border-slate-100">
                    <td className="py-1.5 font-medium text-slate-900"><span className="inline-flex items-center gap-1.5"><Icon className="h-3 w-3 text-blue-600" />{r.c}</span></td>
                    <td className="py-1.5 text-right text-slate-700">{r.total}</td>
                    <td className="py-1.5 text-right text-slate-700">{r.cloud}</td>
                    <td className="py-1.5 text-right text-slate-700">{r.hyb}</td>
                    <td className="py-1.5 text-right text-slate-700">{r.on}</td>
                    <td className="py-1.5 pl-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: "hsl(217 91% 60%)" }} />
                        </div>
                        <span className="font-semibold text-slate-900 w-8 text-right">{r.pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-slate-200">
                <td className="py-2 font-bold text-slate-900">Total</td>
                <td className="py-2 text-right font-bold text-slate-900">1,278</td>
                <td className="py-2 text-right font-bold text-slate-900">658</td>
                <td className="py-2 text-right font-bold text-slate-900">257</td>
                <td className="py-2 text-right font-bold text-slate-900">409</td>
                <td className="py-2 pl-3 font-bold text-slate-900">48%</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="Migration Backlog Overview" className="lg:col-span-4">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-2">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-700"><div className="h-5 w-5 rounded grid place-items-center bg-amber-100"><AlertTriangle className="h-3 w-3" /></div>Backlog Workloads</div>
              <div className="text-xl font-bold text-slate-900 mt-1">620</div>
              <div className="text-[9px] text-emerald-700">+18 vs last 7 days</div>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-2">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-700"><div className="h-5 w-5 rounded grid place-items-center bg-amber-100"><AlertTriangle className="h-3 w-3" /></div>At Risk</div>
              <div className="text-xl font-bold text-slate-900 mt-1">74</div>
              <div className="text-[9px] text-emerald-700">-5 vs last 7 days</div>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-100 p-2">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-red-700"><div className="h-5 w-5 rounded grid place-items-center bg-red-100"><XCircle className="h-3 w-3" /></div>Blocked</div>
              <div className="text-xl font-bold text-slate-900 mt-1">26</div>
              <div className="text-[9px] text-emerald-700">-3 vs last 7 days</div>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-700 uppercase mb-1">Top Backlog Workloads</div>
          <table className="w-full text-[10px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1">Application</th>
                <th className="text-left py-1">Business Unit</th>
                <th className="text-left py-1">Complexity</th>
                <th className="text-left py-1">Target Wave</th>
                <th className="text-left py-1">Reason</th>
              </tr>
            </thead>
            <tbody>
              {backlogTop.map((b) => (
                <tr key={b.app} className="border-b border-slate-100">
                  <td className="py-1 font-medium text-slate-900">{b.app}</td>
                  <td className="py-1 text-slate-600">{b.bu}</td>
                  <td className="py-1 text-slate-700">{b.comp}</td>
                  <td className="py-1 text-slate-700">{b.wave}</td>
                  <td className="py-1 text-slate-600">{b.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </DashShell>
  );
}
