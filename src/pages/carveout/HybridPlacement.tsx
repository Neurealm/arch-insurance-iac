import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Server, Building2, Cloud, GitMerge, DollarSign, TrendingUp, Gauge, ShieldCheck,
  CheckCircle, Lightbulb, Info, Target, Flag, ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ComposedChart, Line, Legend,
} from "recharts";

const kpis: KPI[] = [
  { label: "Total Workloads Analyzed", value: "842", sub: "100% Assessed", subColor: "text-emerald-600", icon: Server, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "On-Prem Recommended", value: "312", sub: "37.1%", subColor: "text-emerald-600", icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Cloud Recommended", value: "412", sub: "48.9%", subColor: "text-violet-600", icon: Cloud, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Hybrid Recommended", value: "118", sub: "14.0%", subColor: "text-amber-600", icon: GitMerge, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Avg. Monthly Cost (Current)", value: "$12.48M", sub: "Baseline", subColor: "text-slate-500", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Avg. Monthly Cost (Recommended)", value: "$9.16M", sub: "↓ 26.7%", subColor: "text-emerald-600", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Est. Annual Savings", value: "$39.8M", sub: "26.7% Reduction", subColor: "text-emerald-600", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Placement Confidence", value: "92%", sub: "High Confidence", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
];

const wwh = {
  what: ["The Workload Placement Decision Engine — the system that determines where workloads should run (on-prem, cloud, or hybrid)."],
  why: ["They are not just separating, they are modernizing. Wrong placement decisions create long-term inefficiencies, higher cost, and operational risk."],
  how: [
    "Evaluates workloads based on latency, cost, and dependency",
    "Recommends on-prem vs cloud vs hybrid placement",
    "Aligns decisions with business and financial outcomes",
    "Continuously optimizes placement over time",
  ],
};

const outcomes: Outcome[] = [
  { icon: Target, color: "text-blue-600", title: "CONFIDENCE", l1: "92% high-confidence placements" },
  { icon: TrendingUp, color: "text-emerald-600", title: "SAVINGS", l1: "$39.8M annualized" },
  { icon: Gauge, color: "text-blue-600", title: "PERFORMANCE", l1: "23% avg improvement" },
  { icon: ShieldCheck, color: "text-emerald-600", title: "COMPLIANCE", l1: "Aligned to data residency" },
  { icon: Flag, color: "text-blue-600", title: "DAY 1 READY", l1: "83% infrastructure ready" },
];

const overview = [
  { name: "On-Prem", value: 312, pct: "37.1%", color: "#22c55e" },
  { name: "Cloud", value: 412, pct: "48.9%", color: "#a855f7" },
  { name: "Hybrid", value: 118, pct: "14.0%", color: "#f59e0b" },
];

const drivers = [
  { name: "Performance / Latency", v: 38, c: "#22c55e" },
  { name: "Cost Optimization", v: 29, c: "#22c55e" },
  { name: "Compliance / Data Residency", v: 16, c: "#a855f7" },
  { name: "Data Gravity", v: 9, c: "#f59e0b" },
  { name: "Other Factors", v: 8, c: "#3b82f6" },
];

const matrix = [
  { c: "High Criticality", op: { v: 128, p: "41.0%" }, hy: { v: 36, p: "11.5%" }, cl: { v: 148, p: "47.5%" } },
  { c: "Medium Criticality", op: { v: 102, p: "40.2%" }, hy: { v: 52, p: "20.5%" }, cl: { v: 100, p: "39.4%" } },
  { c: "Low Criticality", op: { v: 82, p: "28.6%" }, hy: { v: 30, p: "10.5%" }, cl: { v: 164, p: "60.8%" } },
];

const cost = [
  { name: "Current State", v: 12.48, color: "#3b82f6" },
  { name: "Recommended State", v: 9.16, color: "#22c55e" },
];

const driverImpact = [
  { name: "Performance / Latency", v: 4.7, c: "#3b82f6" },
  { name: "Cost Optimization", v: 4.5, c: "#22c55e" },
  { name: "Compliance / Data Residency", v: 4.1, c: "#a855f7" },
  { name: "Data Gravity", v: 3.8, c: "#f59e0b" },
  { name: "Security Requirements", v: 3.6, c: "#0d9488" },
  { name: "Operational Complexity", v: 3.2, c: "#14b8a6" },
];

const recs = [
  { wl: "FIN-ERP-01", app: "ERP Platform", crit: "High", loc: "On-Prem (BD)", rec: "Hybrid", conf: "95%", save: "$410K", drivers: "Latency, Compliance, Cost" },
  { wl: "CRM-APP-01", app: "CRM", crit: "High", loc: "On-Prem (BD)", rec: "Cloud", conf: "94%", save: "$560K", drivers: "Cost, Scalability" },
  { wl: "ANALYTICS-01", app: "Data Warehouse", crit: "High", loc: "On-Prem (BD)", rec: "Hybrid", conf: "92%", save: "$320K", drivers: "Data Gravity, Performance" },
  { wl: "HR-PORTAL", app: "HR Portal", crit: "Medium", loc: "On-Prem (BD)", rec: "Cloud", conf: "90%", save: "$180K", drivers: "Cost, Scalability" },
  { wl: "FILE-SHARE-01", app: "File Services", crit: "Medium", loc: "On-Prem (BD)", rec: "On-Prem", conf: "91%", save: "$45K", drivers: "Latency, Compliance" },
  { wl: "DEV-TEST-01", app: "Dev/Test", crit: "Low", loc: "On-Prem (BD)", rec: "Cloud", conf: "89%", save: "$110K", drivers: "Cost, Elasticity" },
  { wl: "BACKUP-01", app: "Backup", crit: "High", loc: "On-Prem (BD)", rec: "Hybrid", conf: "93%", save: "$95K", drivers: "Compliance, DR" },
  { wl: "WEB-PORTAL", app: "Web Portal", crit: "Medium", loc: "On-Prem (BD)", rec: "Cloud", conf: "91%", save: "$140K", drivers: "Cost, Scalability" },
];

const dependencyComplexity = [
  { name: "High", value: 248, pct: "29.5%", color: "#ef4444" },
  { name: "Medium", value: 362, pct: "43.0%", color: "#f59e0b" },
  { name: "Low", value: 232, pct: "27.5%", color: "#22c55e" },
];

const dataGravity = [
  { name: "> 10 TB", v: 28, c: "#3b82f6" },
  { name: "1 – 10 TB", v: 32, c: "#22c55e" },
  { name: "100 GB – 1 TB", v: 24, c: "#f59e0b" },
  { name: "< 100 GB", v: 16, c: "#a855f7" },
];

const optimization = [
  { d: "Dec '24", conf: 72, save: 8 },
  { d: "Jan '25", conf: 76, save: 13 },
  { d: "Feb '25", conf: 80, save: 19 },
  { d: "Mar '25", conf: 89, save: 27 },
  { d: "Apr '25", conf: 89, save: 33 },
  { d: "May '25", conf: 92, save: 39.8 },
];

function critTone(c: string) {
  if (/high/i.test(c)) return "text-red-600";
  if (/medium/i.test(c)) return "text-amber-600";
  return "text-slate-500";
}
function recTone(r: string) {
  if (/cloud/i.test(r)) return "text-violet-600";
  if (/hybrid/i.test(r)) return "text-amber-600";
  return "text-emerald-600";
}

export default function HybridPlacement() {
  return (
    <DashShell
      title="HYBRID INFRASTRUCTURE PLACEMENT"
      highlight="DECISION ENGINE (ON-PREM VS CLOUD)"
      subtitle="Intelligent workload placement recommendations optimized for performance, cost, risk, and business outcomes."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Overview | Matrix | Cost | Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Section title="Workload Placement Overview" className="lg:col-span-3">
          <div className="flex items-center gap-3">
            <div className="relative h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={overview} dataKey="value" innerRadius={36} outerRadius={56} paddingAngle={2} stroke="none">
                    {overview.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-extrabold text-slate-900 leading-none">842</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Total Workloads</div>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 text-[11px]">
              {overview.map((b) => (
                <div key={b.name} className="flex items-center justify-between">
                  <div className="flex items-center"><span className="h-2 w-2 rounded-sm mr-1.5" style={{ background: b.color }} /><span className="text-slate-700">{b.name}</span></div>
                  <span className="font-semibold text-slate-800">{b.value} <span className="text-slate-500">({b.pct})</span></span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-800 mb-1.5">Why Recommended</div>
            <div className="space-y-1 text-[11px]">
              {drivers.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center"><span className="h-2 w-2 rounded-full mr-1.5" style={{ background: d.c }} /><span className="text-slate-700">{d.name}</span></div>
                  <span className="font-semibold text-slate-800">{d.v}%</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Placement Recommendation Matrix" className="lg:col-span-3">
          <div className="text-[10px] text-slate-500 mb-2">Workloads by business criticality and placement preference</div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-[10px] text-slate-500">
                <th></th>
                <th className="py-1 text-center">On-Prem</th>
                <th className="py-1 text-center">Hybrid</th>
                <th className="py-1 text-center">Cloud</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((r) => (
                <tr key={r.c}>
                  <td className="py-1.5 text-[10px] text-slate-700 pr-2">{r.c}</td>
                  <td className="py-1"><div className="rounded bg-emerald-50 border border-emerald-200 text-center py-1.5"><div className="font-bold text-emerald-700">{r.op.v}</div><div className="text-[9px] text-emerald-700">({r.op.p})</div></div></td>
                  <td className="py-1 px-1"><div className="rounded bg-amber-50 border border-amber-200 text-center py-1.5"><div className="font-bold text-amber-700">{r.hy.v}</div><div className="text-[9px] text-amber-700">({r.hy.p})</div></div></td>
                  <td className="py-1"><div className="rounded bg-violet-50 border border-violet-200 text-center py-1.5"><div className="font-bold text-violet-700">{r.cl.v}</div><div className="text-[9px] text-violet-700">({r.cl.p})</div></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 rounded-lg bg-amber-50 border border-amber-100 p-2 flex items-start gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-[10px] text-slate-700"><b>Insight:</b> High critical workloads are recommended for on-prem or hybrid to meet performance and compliance requirements.</div>
          </div>
        </Section>

        <Section title="Cost Comparison (Monthly)" className="lg:col-span-3">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cost} margin={{ top: 30, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="M" />
                <Tooltip />
                <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                  {cost.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-2">
            <div className="text-[11px] text-slate-600">$12.48M <span className="mx-2 text-emerald-600 font-bold">→</span> $9.16M</div>
            <div className="text-emerald-600 font-bold text-sm">26.7% Cost Reduction</div>
          </div>
          <div className="text-[10px] text-slate-600 mt-2 space-y-1">
            <div className="flex items-start gap-1"><CheckCircle className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" /><span>Includes infrastructure, network egress, and operational costs</span></div>
            <div className="flex items-start gap-1"><CheckCircle className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" /><span>Savings realized through right-sizing and optimal placement</span></div>
          </div>
        </Section>

        <Section title="Placement Drivers Impact (All Workloads)" className="lg:col-span-3">
          <div className="text-[10px] text-slate-500 text-right mb-1">Impact Score</div>
          <div className="space-y-2 text-[11px]">
            {driverImpact.map((d) => (
              <div key={d.name}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-slate-700">{d.name}</span>
                  <span className="font-semibold text-slate-800">{d.v}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full" style={{ width: `${(d.v / 5) * 100}%`, background: d.c }} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-[9px] text-slate-500 text-right mt-2">Impact Score (1 = Low, 5 = High)</div>
        </Section>
      </div>

      {/* Row 2: Recs Table | Dependency | Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Workload Recommendations (Sample)" className="lg:col-span-5">
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2 px-1.5">Workload</th>
                <th className="text-left py-2 px-1.5">Application</th>
                <th className="text-left py-2 px-1.5">Criticality</th>
                <th className="text-left py-2 px-1.5">Current</th>
                <th className="text-left py-2 px-1.5">Recommended</th>
                <th className="text-left py-2 px-1.5">Conf.</th>
                <th className="text-left py-2 px-1.5">Est. Savings</th>
                <th className="text-left py-2 px-1.5">Key Drivers</th>
              </tr>
            </thead>
            <tbody>
              {recs.map((r) => (
                <tr key={r.wl} className="border-b border-slate-100">
                  <td className="py-2 px-1.5 font-mono text-[10px] text-slate-700">{r.wl}</td>
                  <td className="py-2 px-1.5 text-slate-800">{r.app}</td>
                  <td className={`py-2 px-1.5 font-semibold ${critTone(r.crit)}`}>{r.crit}</td>
                  <td className="py-2 px-1.5 text-slate-700">{r.loc}</td>
                  <td className={`py-2 px-1.5 font-semibold ${recTone(r.rec)}`}>{r.rec}</td>
                  <td className="py-2 px-1.5 text-slate-700">{r.conf}</td>
                  <td className="py-2 px-1.5 text-emerald-700 font-semibold">{r.save}</td>
                  <td className="py-2 px-1.5 text-[10px] text-slate-600">{r.drivers}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 mt-2 inline-block">View all workloads →</a>
        </Section>

        <Section title="Dependency & Data Gravity Overview" className="lg:col-span-3">
          <div className="text-[11px] font-semibold text-slate-800 mb-1">Dependency Complexity</div>
          <div className="flex items-center gap-2">
            <div className="relative h-24 w-24 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dependencyComplexity} dataKey="value" innerRadius={26} outerRadius={42} paddingAngle={2} stroke="none">
                    {dependencyComplexity.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-sm font-bold text-slate-900 leading-none">842</div>
                <div className="text-[8px] text-slate-500">Workloads</div>
              </div>
            </div>
            <div className="flex-1 space-y-1 text-[10px]">
              {dependencyComplexity.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center"><span className="h-2 w-2 rounded-sm mr-1.5" style={{ background: d.color }} /><span className="text-slate-700">{d.name}</span></div>
                  <span className="font-semibold text-slate-800">{d.value} <span className="text-slate-500">({d.pct})</span></span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-800 mt-3 mb-1">Data Gravity (Data Size)</div>
          <div className="space-y-1.5 text-[11px]">
            {dataGravity.map((d) => (
              <div key={d.name}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-slate-700">{d.name}</span>
                  <span className="font-semibold text-slate-800">{d.v}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full" style={{ width: `${d.v * 2.5}%`, background: d.c }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-2 flex items-start gap-1.5">
            <Info className="h-3 w-3 text-slate-500 mt-0.5 shrink-0" />
            <div className="text-[10px] text-slate-700">Higher dependency and data gravity favor on-prem or hybrid placements.</div>
          </div>
        </Section>

        <Section title="Optimization Over Time" className="lg:col-span-4">
          <div className="text-[10px] text-slate-500 mb-1">Placement confidence and cost savings trend</div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={optimization} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="l" tick={{ fontSize: 10 }} unit="%" domain={[60, 100]} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} unit="M" domain={[0, 50]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Line yAxisId="l" dataKey="conf" name="Placement Confidence (%)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="r" dataKey="save" name="Est. Cost Savings (Cumulative $M)" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* Row 3: Decision Summary | Next Actions | Scenario | Day 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Placement Decision Summary" className="lg:col-span-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-lg bg-blue-50 grid place-items-center shrink-0">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-extrabold text-slate-900 leading-none">92%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">High Confidence in recommendations based on data, analytics, and business alignment</div>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 text-[11px]">
            <div className="flex items-start gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" /><span className="text-slate-700">Optimized for performance, cost, risk, and compliance</span></div>
            <div className="flex items-start gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" /><span className="text-slate-700">Aligned with business outcomes and future scalability</span></div>
            <div className="flex items-start gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" /><span className="text-slate-700">Continuously refined with real-world telemetry</span></div>
          </div>
        </Section>

        <Section title="Next Best Actions" className="lg:col-span-3">
          <div className="space-y-2 text-[11px]">
            {[
              "Review 9 workloads requiring attention",
              "Approve recommendations for 37 workloads",
              "Run what-if scenario for cost vs. performance",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-[10px] font-bold shrink-0">{i + 1}</div>
                <div className="text-slate-700">{s}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Scenario Modeling" className="lg:col-span-2">
          <div className="flex items-start gap-2">
            <Cloud className="h-8 w-8 text-blue-600 shrink-0" />
            <div className="text-[11px] text-slate-700">Run what-if scenarios to compare placement options.</div>
          </div>
          <a className="text-[11px] text-blue-600 mt-3 inline-flex items-center gap-1">Launch Scenario Model <ArrowRight className="h-3 w-3" /></a>
        </Section>

        <Section title="Day 1 Readiness Impact" className="lg:col-span-3">
          <div className="flex items-center gap-3">
            <Flag className="h-10 w-10 text-blue-600 shrink-0" />
            <div>
              <div className="text-3xl font-extrabold text-slate-900 leading-none">83%</div>
              <div className="text-[10px] text-slate-500 mt-1">Infrastructure Ready with recommended placements</div>
            </div>
          </div>
        </Section>
      </div>
    </DashShell>
  );
}
