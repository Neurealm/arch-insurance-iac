import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  DollarSign, TrendingUp, Wallet, Database, Gauge, Clock, Target,
  TrendingDown, Activity, ShieldCheck, Award,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar, ScatterChart, Scatter, ZAxis,
} from "recharts";

const kpis: KPI[] = [
  { label: "Total Monthly Spend (MTD)", value: "$12.48M", sub: "-8.7% vs last month", subColor: "text-emerald-600", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Total Spend (YTD)", value: "$134.92M", sub: "-6.3% vs last year", subColor: "text-emerald-600", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Forecasted Spend (EOM)", value: "$13.28M", sub: "-5.4% vs budget", subColor: "text-emerald-600", icon: Wallet, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Cost per Workload (Avg.)", value: "$14,820", sub: "-9.1% vs last month", subColor: "text-emerald-600", icon: Database, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Rightsize Savings (Est.)", value: "$2.31M / mo", sub: "18.5% of current spend", subColor: "text-emerald-600", icon: Gauge, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Underutilized Spend", value: "$1.47M / mo", sub: "11.8% of current spend", subColor: "text-amber-600", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Optimization Potential", value: "$3.78M / mo", sub: "30.3% of current spend", subColor: "text-violet-600", icon: Target, color: "text-violet-600", bg: "bg-violet-50" },
];

const wwh = {
  what: ["The Infrastructure FinOps Dashboard – the system that ties compute and storage usage to financial outcomes."],
  why: ["Infrastructure costs can spiral quickly post-separation without control. Visibility and optimization drive efficiency and protect long-term financial health."],
  how: [
    "Tracks cost per workload, environment, and platform",
    "Provides capacity vs cost optimization insights",
    "Identifies underutilized resources",
    "Aligns infrastructure decisions with financial strategy",
  ],
};

const outcomes: Outcome[] = [
  { icon: Wallet,       color: "text-blue-600",    title: "BUDGET (MTD)",    l1: "$13.25M (94.2% of Budget)" },
  { icon: TrendingDown, color: "text-amber-600",   title: "BUDGET VARIANCE", l1: "-$0.77M Under Budget" },
  { icon: Award,        color: "text-emerald-600", title: "YTD SAVINGS",     l1: "$14.62M (10.8% of YTD Spend)" },
  { icon: Target,       color: "text-violet-600",  title: "OPTIMIZATION",    l1: "$3.78M / mo (30.3%)" },
  { icon: ShieldCheck,  color: "text-violet-600",  title: "FINOPS GOAL",     l1: "Right Resource. Right Size. Right Cost. Right Now." },
];

// Cost trend (12 months) — total split into compute/storage/network/other
const trend = [
  { m: "Jun '24", Total: 14.2, Compute: 6.0, Storage: 3.6, Network: 1.4, Other: 3.2 },
  { m: "Jul '24", Total: 13.6, Compute: 5.8, Storage: 3.5, Network: 1.3, Other: 3.0 },
  { m: "Aug '24", Total: 13.4, Compute: 5.7, Storage: 3.4, Network: 1.3, Other: 3.0 },
  { m: "Sep '24", Total: 13.8, Compute: 5.9, Storage: 3.5, Network: 1.3, Other: 3.1 },
  { m: "Oct '24", Total: 14.0, Compute: 6.0, Storage: 3.6, Network: 1.3, Other: 3.1 },
  { m: "Nov '24", Total: 14.4, Compute: 6.2, Storage: 3.7, Network: 1.4, Other: 3.1 },
  { m: "Dec '24", Total: 14.6, Compute: 6.3, Storage: 3.7, Network: 1.4, Other: 3.2 },
  { m: "Jan '25", Total: 14.5, Compute: 6.2, Storage: 3.7, Network: 1.4, Other: 3.2 },
  { m: "Feb '25", Total: 14.8, Compute: 6.4, Storage: 3.8, Network: 1.4, Other: 3.2 },
  { m: "Mar '25", Total: 14.0, Compute: 6.0, Storage: 3.6, Network: 1.3, Other: 3.1 },
  { m: "Apr '25", Total: 13.4, Compute: 5.8, Storage: 3.4, Network: 1.3, Other: 2.9 },
  { m: "May '25", Total: 12.48, Compute: 5.42, Storage: 3.18, Network: 1.09, Other: 2.79 },
];

const env = [
  { name: "Production",     value: 6.21, pct: 49.8, color: "hsl(217 91% 60%)" },
  { name: "Non-Production", value: 3.12, pct: 25.0, color: "hsl(142 71% 45%)" },
  { name: "Development",    value: 1.64, pct: 13.2, color: "hsl(262 83% 58%)" },
  { name: "DR / Standby",   value: 0.88, pct: 7.1,  color: "hsl(38 92% 50%)" },
  { name: "Other",          value: 0.63, pct: 5.0,  color: "hsl(215 16% 65%)" },
];

const service = [
  { name: "Compute",        value: 5.42, pct: 43.5, color: "hsl(217 91% 60%)" },
  { name: "Storage",        value: 3.18, pct: 25.5, color: "hsl(142 71% 45%)" },
  { name: "Database",       value: 1.72, pct: 13.8, color: "hsl(262 83% 58%)" },
  { name: "Network",        value: 1.09, pct: 8.7,  color: "hsl(38 92% 50%)" },
  { name: "Other Services", value: 1.07, pct: 8.5,  color: "hsl(215 16% 65%)" },
];

const platforms = [
  { p: "VMware / On-Prem", cost: 4.86, pct: 38.9, color: "hsl(217 91% 60%)" },
  { p: "AWS",              cost: 3.92, pct: 31.4, color: "hsl(142 71% 45%)" },
  { p: "Azure",            cost: 2.14, pct: 17.1, color: "hsl(262 83% 58%)" },
  { p: "Backup / DR",      cost: 0.98, pct: 7.8,  color: "hsl(38 92% 50%)" },
  { p: "Other Cloud",      cost: 0.58, pct: 4.6,  color: "hsl(215 16% 65%)" },
];

const cpw = [
  { w: "ERP-PROD-01",     env: "Production",     cost: "$228,450", per: "$18.72", t: "↓", tc: "text-emerald-600" },
  { w: "CRM-PROD-01",     env: "Production",     cost: "$176,830", per: "$14.31", t: "↓", tc: "text-emerald-600" },
  { w: "DATA-WAREHOUSE",  env: "Production",     cost: "$154,210", per: "$12.08", t: "↑", tc: "text-red-600" },
  { w: "ANALYTICS-01",    env: "Non-Production", cost: "$98,760",  per: "$9.14",  t: "↓", tc: "text-emerald-600" },
  { w: "FINANCIALS-01",   env: "Production",     cost: "$86,430",  per: "$11.26", t: "↑", tc: "text-red-600" },
  { w: "PORTAL-PROD-01",  env: "Production",     cost: "$74,920",  per: "$8.63",  t: "↓", tc: "text-emerald-600" },
  { w: "DEV-TEST-01",     env: "Non-Production", cost: "$62,180",  per: "$5.37",  t: "↓", tc: "text-emerald-600" },
  { w: "REPORTING-01",    env: "Production",     cost: "$45,670",  per: "$4.11",  t: "↓", tc: "text-emerald-600" },
  { w: "INTEGRATION-01",  env: "Non-Production", cost: "$33,240",  per: "$3.02",  t: "—", tc: "text-slate-500" },
  { w: "LEGACY-APP-01",   env: "Non-Production", cost: "$27,110",  per: "$2.45",  t: "↓", tc: "text-emerald-600" },
];

const topSpend = [
  { w: "ERP-PROD-01",    env: "Production",     cost: "$228,450", pct: "1.8%", t: "↑", tc: "text-red-600" },
  { w: "CRM-PROD-01",    env: "Production",     cost: "$176,830", pct: "1.4%", t: "↑", tc: "text-red-600" },
  { w: "DATA-WAREHOUSE", env: "Production",     cost: "$154,210", pct: "1.2%", t: "↑", tc: "text-red-600" },
  { w: "ANALYTICS-01",   env: "Non-Production", cost: "$98,760",  pct: "0.8%", t: "↓", tc: "text-emerald-600" },
  { w: "FINANCIALS-01",  env: "Production",     cost: "$86,430",  pct: "0.7%", t: "↑", tc: "text-red-600" },
];

const opps = [
  { l: "Rightsize Compute (VMs)",     v: 1.21, w: 92, pri: "High",   pc: "bg-red-100 text-red-700",       bar: "hsl(142 71% 45%)" },
  { l: "Delete Unused Volumes",       v: 0.56, w: 60, pri: "Medium", pc: "bg-amber-100 text-amber-700",   bar: "hsl(142 71% 45%)" },
  { l: "Reserved Instance Optimization", v: 0.38, w: 48, pri: "High", pc: "bg-red-100 text-red-700",     bar: "hsl(142 71% 45%)" },
  { l: "Storage Tiering Optimization", v: 0.31, w: 40, pri: "Medium", pc: "bg-amber-100 text-amber-700", bar: "hsl(142 71% 45%)" },
  { l: "Stop Unused Resources",        v: 0.21, w: 30, pri: "Low",   pc: "bg-blue-100 text-blue-700",     bar: "hsl(142 71% 45%)" },
];

const actions = [
  { a: "Rightsized 86 VMs",        target: "Compute", save: "$230,450", date: "May 12, 2025" },
  { a: "Deleted 42 Unused Volumes", target: "Storage", save: "$98,760",  date: "May 11, 2025" },
  { a: "Applied Reserved Instances", target: "Compute", save: "$72,340", date: "May 10, 2025" },
  { a: "Stopped 23 Idle Resources",  target: "Compute", save: "$41,280", date: "May 9, 2025" },
  { a: "Removed Unused Snapshots",   target: "Storage", save: "$28,560", date: "May 8, 2025" },
];

const underutil = [
  { r: "VMs",            n: 312, util: "14%", waste: "$412,560" },
  { r: "Volumes",        n: 186, util: "18%", waste: "$286,340" },
  { r: "Databases",      n: 54,  util: "22%", waste: "$215,780" },
  { r: "Load Balancers", n: 37,  util: "8%",  waste: "$138,420" },
  { r: "IPs",            n: 125, util: "8%",  waste: "$97,680" },
];

// scatter: capacity utilization vs cost
const scatter = {
  Compute:  [{u:30,c:0.4},{u:55,c:1.1},{u:72,c:1.6},{u:88,c:2.0}],
  Storage:  [{u:25,c:0.3},{u:48,c:0.7},{u:65,c:1.2},{u:80,c:1.5}],
  Database: [{u:40,c:0.5},{u:62,c:0.9},{u:78,c:1.3}],
  Network:  [{u:18,c:0.2},{u:35,c:0.5},{u:52,c:0.8}],
};

const Donut = ({ data, total }: { data: { name: string; value: number; color: string }[]; total: string }) => (
  <div className="relative h-48">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={2}>
          {data.map((d) => <Cell key={d.name} fill={d.color} />)}
        </Pie>
        <Tooltip formatter={(v: number) => `$${v.toFixed(2)}M`} />
      </PieChart>
    </ResponsiveContainer>
    <div className="absolute inset-0 grid place-items-center pointer-events-none">
      <div className="text-center">
        <div className="text-base font-bold text-slate-900">{total}</div>
        <div className="text-[10px] text-slate-500">Total</div>
      </div>
    </div>
  </div>
);

export default function InfraFinOps() {
  return (
    <DashShell
      title="INFRASTRUCTURE COST, CAPACITY & OPTIMIZATION"
      highlight="(FINOPS FOR INFRA)"
      subtitle="Real-time visibility into infrastructure spend, capacity, and optimization opportunities across hybrid environments."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Cost Trend + Cost by Env + Cost per Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Section title="Cost Trend (Last 12 Months)" className="lg:col-span-5">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
                <XAxis dataKey="m" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}M`} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}M`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="Total"   stroke="hsl(217 91% 60%)" strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Compute" stroke="hsl(142 71% 45%)" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Storage" stroke="hsl(262 83% 58%)" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Network" stroke="hsl(38 92% 50%)"  strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Other"   stroke="hsl(215 16% 65%)" strokeWidth={1.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Cost by Environment (MTD)" className="lg:col-span-3">
          <div className="grid grid-cols-2 gap-2">
            <Donut data={env} total="$12.48M" />
            <div className="space-y-1.5 text-[11px] self-center">
              {env.map((e) => (
                <div key={e.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: e.color }} />
                  <span className="text-slate-700 truncate">{e.name}</span>
                  <span className="ml-auto font-semibold text-slate-900">${e.value.toFixed(2)}M</span>
                  <span className="text-slate-500 w-10 text-right">({e.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Cost per Workload (Top 10)" className="lg:col-span-4">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1.5">Workload</th>
                  <th className="text-left py-1.5">Environment</th>
                  <th className="text-right py-1.5">Monthly Cost</th>
                  <th className="text-right py-1.5">Cost / 1K Tx</th>
                  <th className="text-right py-1.5">Trend</th>
                </tr>
              </thead>
              <tbody>
                {cpw.map((r) => (
                  <tr key={r.w} className="border-b border-slate-100">
                    <td className="py-1.5 font-medium text-slate-900">{r.w}</td>
                    <td className="py-1.5 text-slate-600">{r.env}</td>
                    <td className="py-1.5 text-right text-slate-700">{r.cost}</td>
                    <td className="py-1.5 text-right text-slate-700">{r.per}</td>
                    <td className={`py-1.5 text-right font-bold ${r.tc}`}>{r.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="text-[11px] text-blue-600 font-medium mt-2 inline-block">View all workloads →</a>
          </div>
        </Section>
      </div>

      {/* Row 2: Service donut + Platform bars + Scatter + Underutilized */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Cost Breakdown by Service (MTD)" className="lg:col-span-3">
          <div className="grid grid-cols-2 gap-2">
            <Donut data={service} total="$12.48M" />
            <div className="space-y-1.5 text-[11px] self-center">
              {service.map((e) => (
                <div key={e.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: e.color }} />
                  <span className="text-slate-700 truncate">{e.name}</span>
                  <span className="ml-auto font-semibold text-slate-900">${e.value.toFixed(2)}M</span>
                  <span className="text-slate-500 w-10 text-right">({e.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Cost by Platform (MTD)" className="lg:col-span-3">
          <div className="space-y-2.5 text-[11px]">
            {platforms.map((p) => (
              <div key={p.p}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-slate-700 font-medium">{p.p}</span>
                  <span className="text-slate-900 font-semibold">${p.cost.toFixed(2)}M <span className="text-slate-500 font-normal ml-1">{p.pct}%</span></span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.pct * 2}%`, background: p.color }} />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-slate-900">$12.48M <span className="text-slate-500 font-normal ml-1">100%</span></span>
            </div>
          </div>
        </Section>

        <Section title="Capacity Utilization vs. Cost (by Resource)" className="lg:col-span-3">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 8, bottom: 0, left: -10 }}>
                <XAxis dataKey="u" type="number" name="Utilization" unit="%" tick={{ fontSize: 9 }} domain={[0, 100]} />
                <YAxis dataKey="c" type="number" name="Cost" tickFormatter={(v) => `$${v.toFixed(1)}M`} tick={{ fontSize: 9 }} />
                <ZAxis range={[60, 200]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter name="Compute"  data={scatter.Compute}  fill="hsl(217 91% 60%)" />
                <Scatter name="Storage"  data={scatter.Storage}  fill="hsl(142 71% 45%)" />
                <Scatter name="Database" data={scatter.Database} fill="hsl(262 83% 58%)" />
                <Scatter name="Network"  data={scatter.Network}  fill="hsl(38 92% 50%)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] mt-1">
            {[["Compute","hsl(217 91% 60%)"],["Storage","hsl(142 71% 45%)"],["Database","hsl(262 83% 58%)"],["Network","hsl(38 92% 50%)"]].map(([n,c]) => (
              <div key={n} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{background:c as string}} />{n}</div>
            ))}
          </div>
        </Section>

        <Section title="Top Underutilized Resources (Monthly Waste)" className="lg:col-span-3">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Resource Type</th>
                <th className="text-right py-1.5">Count</th>
                <th className="text-right py-1.5">Avg. Util</th>
                <th className="text-right py-1.5">Waste / Mo</th>
              </tr>
            </thead>
            <tbody>
              {underutil.map((u) => (
                <tr key={u.r} className="border-b border-slate-100">
                  <td className="py-1.5 font-medium text-slate-900">{u.r}</td>
                  <td className="py-1.5 text-right text-slate-700">{u.n}</td>
                  <td className="py-1.5 text-right text-slate-700">{u.util}</td>
                  <td className="py-1.5 text-right font-semibold text-red-600">{u.waste}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 font-medium mt-2 inline-block">View all underutilized resources →</a>
        </Section>
      </div>

      {/* Row 3: Top spending + Optimization opportunities + Recent actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Top Spending Workloads (MTD)" className="lg:col-span-4">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Workload</th>
                <th className="text-left py-1.5">Environment</th>
                <th className="text-right py-1.5">Monthly Cost</th>
                <th className="text-right py-1.5">% of Total</th>
                <th className="text-right py-1.5">Trend</th>
              </tr>
            </thead>
            <tbody>
              {topSpend.map((r) => (
                <tr key={r.w} className="border-b border-slate-100">
                  <td className="py-1.5 font-medium text-slate-900">{r.w}</td>
                  <td className="py-1.5 text-slate-600">{r.env}</td>
                  <td className="py-1.5 text-right text-slate-700">{r.cost}</td>
                  <td className="py-1.5 text-right text-slate-700">{r.pct}</td>
                  <td className={`py-1.5 text-right font-bold ${r.tc}`}>{r.t}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 font-medium mt-2 inline-block">View all workloads →</a>
        </Section>

        <Section title="Optimization Opportunities (Est. Monthly Savings)" className="lg:col-span-4">
          <div className="space-y-2 text-[11px]">
            {opps.map((o) => (
              <div key={o.l} className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="text-slate-700 w-44 truncate">{o.l}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${o.w}%`, background: o.bar }} />
                </div>
                <span className="font-semibold text-slate-900 w-14 text-right">${o.v.toFixed(2)}M</span>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${o.pc}`}>{o.pri}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="font-bold text-emerald-700">Total Estimated Savings</span>
              <span className="font-bold text-emerald-700">$2.31M / mo</span>
            </div>
          </div>
        </Section>

        <Section title="Recent Optimization Actions" className="lg:col-span-4">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Action</th>
                <th className="text-left py-1.5">Target</th>
                <th className="text-right py-1.5">Savings/Mo</th>
                <th className="text-right py-1.5">Completed</th>
                <th className="text-right py-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((r) => (
                <tr key={r.a} className="border-b border-slate-100">
                  <td className="py-1.5 font-medium text-slate-900">{r.a}</td>
                  <td className="py-1.5 text-slate-600">{r.target}</td>
                  <td className="py-1.5 text-right text-emerald-700 font-semibold">{r.save}</td>
                  <td className="py-1.5 text-right text-slate-600">{r.date}</td>
                  <td className="py-1.5 text-right">
                    <span className="inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Completed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 font-medium mt-2 inline-block">View all actions →</a>
        </Section>
      </div>
    </DashShell>
  );
}
