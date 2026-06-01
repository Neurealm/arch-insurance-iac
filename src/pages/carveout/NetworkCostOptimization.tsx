import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  DollarSign, TrendingDown, Building2, ShoppingCart, TrendingUp, Target,
  Users, PieChart as PieIcon, Scissors, Handshake, Activity, BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";

const kpis: KPI[] = [
  { label: "Total Network Spend (MTD)", value: "$8.72M", sub: "↑ 6.3% vs last month", subColor: "text-emerald-600", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Total Network Spend (YTD)", value: "$96.41M", sub: "↑ 8.7% vs last year", subColor: "text-emerald-600", icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Budget vs Actual (YTD)", value: "$96.41M / $89.12M", sub: "8.2% Over Budget", subColor: "text-red-600", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Total Potential Savings", value: "$12.74M", sub: "14.8% of Total Spend", subColor: "text-violet-600", icon: Target, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Savings Realized (YTD)", value: "$4.61M", sub: "↑ 22.1% vs last year", subColor: "text-emerald-600", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Cost per Site (MTD)", value: "$3,842", sub: "↓ 4.1% vs last month", subColor: "text-emerald-600", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Cost per User (MTD)", value: "$27.61", sub: "↓ 3.6% vs last month", subColor: "text-emerald-600", icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
];

const SPEND_COLORS = {
  wan: "hsl(217 91% 60%)",
  hw: "hsl(142 71% 45%)",
  sec: "hsl(38 92% 50%)",
  cloud: "hsl(262 83% 58%)",
  managed: "hsl(199 89% 60%)",
};

const spendBreakdown = [
  { name: "WAN / Carriers", value: 4.21, pct: "48.3%", color: SPEND_COLORS.wan },
  { name: "Network Hardware", value: 1.79, pct: "20.5%", color: SPEND_COLORS.hw },
  { name: "Security (Firewalls, etc.)", value: 1.48, pct: "17.0%", color: SPEND_COLORS.sec },
  { name: "Cloud Connectivity", value: 0.78, pct: "8.9%", color: SPEND_COLORS.cloud },
  { name: "Managed Services", value: 0.46, pct: "5.3%", color: SPEND_COLORS.managed },
];

const trend12 = [
  { m: "Mar", wan: 4.0, hw: 1.7, sec: 1.4, cloud: 0.7, managed: 0.4 },
  { m: "Apr", wan: 4.1, hw: 1.75, sec: 1.42, cloud: 0.72, managed: 0.42 },
  { m: "May", wan: 4.05, hw: 1.78, sec: 1.45, cloud: 0.74, managed: 0.43 },
  { m: "Jun", wan: 4.15, hw: 1.8, sec: 1.46, cloud: 0.75, managed: 0.44 },
  { m: "Jul", wan: 4.2, hw: 1.82, sec: 1.48, cloud: 0.76, managed: 0.44 },
  { m: "Aug", wan: 4.18, hw: 1.79, sec: 1.47, cloud: 0.77, managed: 0.45 },
  { m: "Sep", wan: 4.22, hw: 1.81, sec: 1.49, cloud: 0.78, managed: 0.45 },
  { m: "Oct", wan: 4.25, hw: 1.83, sec: 1.5, cloud: 0.79, managed: 0.46 },
  { m: "Nov", wan: 4.21, hw: 1.8, sec: 1.48, cloud: 0.78, managed: 0.46 },
  { m: "Dec", wan: 4.3, hw: 1.85, sec: 1.51, cloud: 0.8, managed: 0.47 },
  { m: "Jan", wan: 4.27, hw: 1.84, sec: 1.5, cloud: 0.79, managed: 0.46 },
  { m: "Mar", wan: 4.21, hw: 1.79, sec: 1.48, cloud: 0.78, managed: 0.46 },
];

const opps = [
  { o: "Right-size MPLS circuits", c: "WAN / Carriers", s: "$3.21M", impact: "High", effort: "Low" },
  { o: "Eliminate unused circuits", c: "WAN / Carriers", s: "$1.87M", impact: "High", effort: "Low" },
  { o: "Optimize SD-WAN overlay", c: "WAN / Carriers", s: "$1.52M", impact: "High", effort: "Medium" },
  { o: "Consolidate internet gateways", c: "Connectivity", s: "$1.04M", impact: "Medium", effort: "Medium" },
  { o: "Remove unused security licenses", c: "Security", s: "$0.96M", impact: "Medium", effort: "Low" },
  { o: "Negotiate vendor contracts", c: "Vendors", s: "$0.84M", impact: "Medium", effort: "Medium" },
  { o: "Optimize cloud connectivity", c: "Cloud", s: "$0.71M", impact: "Low", effort: "Low" },
];

const carriers = [
  { c: "AT&T", t: "MPLS", spend: "$1.42M", pct: "33.7%", trend: "↓ 2.3%", down: true },
  { c: "Verizon", t: "MPLS", spend: "$1.18M", pct: "28.0%", trend: "↑ 4.8%", down: false },
  { c: "Lumen", t: "MPLS", spend: "$0.76M", pct: "18.0%", trend: "↓ 1.1%", down: true },
  { c: "Comcast Business", t: "Internet", spend: "$0.52M", pct: "12.3%", trend: "↑ 3.2%", down: false },
  { c: "Zayo", t: "Ethernet", spend: "$0.33M", pct: "7.9%", trend: "↓ 0.7%", down: true },
];

const VENDOR_COLORS = ["hsl(217 91% 60%)", "hsl(142 71% 45%)", "hsl(38 92% 50%)", "hsl(262 83% 58%)", "hsl(199 89% 60%)", "hsl(220 9% 60%)"];
const vendors = [
  { name: "Cisco", value: 2.21, pct: "42.2%" },
  { name: "Palo Alto Networks", value: 1.15, pct: "22.0%" },
  { name: "Fortinet", value: 0.71, pct: "13.6%" },
  { name: "Arista", value: 0.58, pct: "11.1%" },
  { name: "HPE", value: 0.31, pct: "5.9%" },
  { name: "Others", value: 0.27, pct: "5.2%" },
];

const siteTiers = [
  { tier: "Tier 1 (Large)", n: "72", spend: "$3.12M", per: "$43,365", trend: "↓ 2.8%", down: true },
  { tier: "Tier 2 (Medium)", n: "186", spend: "$2.85M", per: "$15,323", trend: "↓ 3.6%", down: true },
  { tier: "Tier 3 (Small)", n: "512", spend: "$1.96M", per: "$3,828", trend: "↑ 4.9%", down: false },
  { tier: "Branch / Micro", n: "1,248", spend: "$0.79M", per: "$633", trend: "↓ 5.2%", down: true },
];

const cpuTrend = [
  { m: "Mar", v: 28.4 }, { m: "Apr", v: 28.1 }, { m: "May", v: 28.0 }, { m: "Jun", v: 28.3 },
  { m: "Jul", v: 28.5 }, { m: "Aug", v: 28.2 }, { m: "Sep", v: 28.0 }, { m: "Oct", v: 27.9 },
  { m: "Nov", v: 28.1 }, { m: "Dec", v: 27.8 }, { m: "Jan", v: 27.7 }, { m: "Mar", v: 27.61 },
];

const budgetActual = [
  { c: "WAN / Carriers", budget: 50.0, actual: 46.1 },
  { c: "Network Hardware", budget: 20.0, actual: 19.1 },
  { c: "Security", budget: 15.0, actual: 13.6 },
  { c: "Cloud Connectivity", budget: 6.0, actual: 5.4 },
  { c: "Managed Services", budget: 5.0, actual: 4.9 },
];

const savingsTrend = [
  { m: "Nov", v: 1.2 }, { m: "Dec", v: 2.1 }, { m: "Jan", v: 3.0 }, { m: "Feb", v: 3.8 }, { m: "Mar", v: 4.61 },
];

const wwh = {
  what: [
    "Total network spend across carriers, vendors, and services",
    "Breakdown of WAN/circuit costs, vendor spend, and site/user costs",
    "Optimization opportunities and potential savings",
    "Cost trends, budget vs. actual, and cost efficiency metrics",
  ],
  why: [
    "Network is a significant and growing investment",
    "Visibility drives cost control and smarter decisions",
    "Optimization reduces waste and improves ROI",
    "Ties network performance to financial outcomes",
  ],
  how: [
    "Ingest spend data from carriers, vendors, and internal systems",
    "Normalize and allocate costs by site, service, and user",
    "Identify savings with AI-driven optimization models",
    "Track savings realization and impact over time",
  ],
};

const outcomes: Outcome[] = [
  { icon: PieIcon, color: "text-blue-600", title: "TAKE ACTION", l1: "Review optimization opportunities and track savings realization to maximize cost efficiency." },
  { icon: Scissors, color: "text-blue-600", title: "REDUCE WASTE", l1: "Eliminate unused and underutilized resources." },
  { icon: Handshake, color: "text-blue-600", title: "NEGOTIATE BETTER", l1: "Leverage insights for better vendor & carrier agreements." },
  { icon: Activity, color: "text-blue-600", title: "OPTIMIZE CONTINUOUSLY", l1: "Monitor, measure, and continuously improve network spend." },
  { icon: TrendingUp, color: "text-blue-600", title: "DRIVE BUSINESS VALUE", l1: "Lower costs → higher ROI → stronger business outcomes." },
];

function ImpactPill({ v }: { v: string }) {
  const s = v.toLowerCase();
  const cls = s === "high" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : s === "medium" ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-slate-100 text-slate-600 border-slate-200";
  return <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{v}</span>;
}
function EffortPill({ v }: { v: string }) {
  const s = v.toLowerCase();
  const cls = s === "low" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : s === "medium" ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-red-50 text-red-700 border-red-200";
  return <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{v}</span>;
}

export default function NetworkCostOptimization() {
  return (
    <DashShell
      title="NETWORK COST & VENDOR OPTIMIZATION (FINOPS FOR NETWORK)"
      subtitle="Optimize network spend, reduce costs, and maximize value across carriers, vendors, and services."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Spend Breakdown / Spend Trend / Top Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Section title="Network Spend Breakdown (MTD)" className="lg:col-span-3">
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={spendBreakdown} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                  {spendBreakdown.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}M`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="text-lg font-extrabold text-slate-900">$8.72M</div>
                <div className="text-[10px] text-slate-500">Total Spend</div>
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-1 text-[11px]">
            {spendBreakdown.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                <span className="text-slate-700 truncate">{d.name}</span>
                <span className="ml-auto font-semibold text-slate-900">${d.value.toFixed(2)}M ({d.pct})</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Spend Trend (Last 12 Months)" className="lg:col-span-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="m" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}M`} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}M`} />
                <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
                <Bar dataKey="wan" name="WAN / Carriers" stackId="a" fill={SPEND_COLORS.wan} />
                <Bar dataKey="hw" name="Hardware" stackId="a" fill={SPEND_COLORS.hw} />
                <Bar dataKey="sec" name="Security" stackId="a" fill={SPEND_COLORS.sec} />
                <Bar dataKey="cloud" name="Cloud Connectivity" stackId="a" fill={SPEND_COLORS.cloud} />
                <Bar dataKey="managed" name="Managed Services" stackId="a" fill={SPEND_COLORS.managed} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Top Optimization Opportunities" className="lg:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1.5 px-1">Opportunity</th>
                  <th className="text-left py-1.5 px-1">Savings</th>
                  <th className="text-left py-1.5 px-1">Impact</th>
                  <th className="text-left py-1.5 px-1">Effort</th>
                </tr>
              </thead>
              <tbody>
                {opps.map((o) => (
                  <tr key={o.o} className="border-b border-slate-100">
                    <td className="py-1.5 px-1">
                      <div className="font-semibold text-slate-900 leading-tight">{o.o}</div>
                      <div className="text-[9px] text-slate-500">{o.c}</div>
                    </td>
                    <td className="py-1.5 px-1 font-semibold text-slate-900">{o.s}</td>
                    <td className="py-1.5 px-1"><ImpactPill v={o.impact} /></td>
                    <td className="py-1.5 px-1"><EffortPill v={o.effort} /></td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 px-1 font-bold text-emerald-700">Total Potential Savings</td>
                  <td className="py-2 px-1 font-bold text-emerald-700" colSpan={3}>$12.74M</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* Row 2: Carrier / Vendor / Site Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Carrier / Circuit Spend (MTD)" className="lg:col-span-4">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1.5 px-1">Carrier</th>
                  <th className="text-left py-1.5 px-1">Type</th>
                  <th className="text-left py-1.5 px-1">Spend</th>
                  <th className="text-left py-1.5 px-1">% WAN</th>
                  <th className="text-left py-1.5 px-1">Trend</th>
                </tr>
              </thead>
              <tbody>
                {carriers.map((c) => (
                  <tr key={c.c} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-1.5 px-1 font-semibold text-slate-900">{c.c}</td>
                    <td className="py-1.5 px-1 text-slate-700">{c.t}</td>
                    <td className="py-1.5 px-1 text-slate-900 font-semibold">{c.spend}</td>
                    <td className="py-1.5 px-1 text-slate-700">{c.pct}</td>
                    <td className={`py-1.5 px-1 font-semibold ${c.down ? "text-emerald-600" : "text-red-600"}`}>{c.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="block text-[11px] text-blue-600 mt-2 cursor-pointer">View all carriers →</a>
          </div>
        </Section>

        <Section title="Vendor Spend Breakdown (MTD)" className="lg:col-span-4">
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vendors} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                  {vendors.map((d, i) => <Cell key={d.name} fill={VENDOR_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}M`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="text-base font-extrabold text-slate-900">$5.23M</div>
                <div className="text-[10px] text-slate-500">Total Vendor Spend</div>
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-1 text-[11px]">
            {vendors.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: VENDOR_COLORS[i] }} />
                <span className="text-slate-700">{d.name}</span>
                <span className="ml-auto font-semibold text-slate-900">${d.value.toFixed(2)}M ({d.pct})</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Cost by Site Tier (MTD)" className="lg:col-span-4">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1.5 px-1">Site Tier</th>
                  <th className="text-left py-1.5 px-1"># Sites</th>
                  <th className="text-left py-1.5 px-1">Spend</th>
                  <th className="text-left py-1.5 px-1">Cost / Site</th>
                  <th className="text-left py-1.5 px-1">Trend</th>
                </tr>
              </thead>
              <tbody>
                {siteTiers.map((s) => (
                  <tr key={s.tier} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-1.5 px-1 font-semibold text-slate-900">{s.tier}</td>
                    <td className="py-1.5 px-1 text-slate-700">{s.n}</td>
                    <td className="py-1.5 px-1 text-slate-900 font-semibold">{s.spend}</td>
                    <td className="py-1.5 px-1 text-slate-700">{s.per}</td>
                    <td className={`py-1.5 px-1 font-semibold ${s.down ? "text-emerald-600" : "text-red-600"}`}>{s.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="block text-[11px] text-blue-600 mt-2 cursor-pointer">View all sites →</a>
          </div>
        </Section>
      </div>

      {/* Row 3: Cost per User Trend / Budget vs Actual / Savings Realization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Cost per User Trend" className="lg:col-span-3">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cpuTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="m" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 40]} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                <Line type="monotone" dataKey="v" name="Cost per User (Total)" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-slate-500 text-center mt-1">— Cost per User (Total)</div>
        </Section>

        <Section title="Budget vs Actual by Category (YTD)" className="lg:col-span-5">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetActual} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}M`} />
                <YAxis type="category" dataKey="c" tick={{ fontSize: 10 }} width={120} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(1)}M`} />
                <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
                <Bar dataKey="budget" name="Budget" fill="hsl(217 91% 60%)" />
                <Bar dataKey="actual" name="Actual" fill="hsl(142 71% 45%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Savings Realization Tracker (YTD)" className="lg:col-span-4">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
              <div className="text-[9px] text-slate-500 font-medium">Target Savings</div>
              <div className="text-base font-bold text-slate-900">$12.74M</div>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
              <div className="text-[9px] text-emerald-700 font-medium">Realized Savings</div>
              <div className="text-base font-bold text-emerald-700">$4.61M</div>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-2">
              <div className="text-[9px] text-blue-700 font-medium">% Achieved</div>
              <div className="text-base font-bold text-blue-700">36.2%</div>
              <div className="text-[9px] text-emerald-600 font-semibold">On Track</div>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-1">
            <div className="h-full bg-emerald-500" style={{ width: "36.2%" }} />
          </div>
          <div className="flex justify-between text-[9px] text-slate-500 mb-2"><span>0%</span><span>100%</span></div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={savingsTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="m" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `$${v}M`} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}M`} />
                <Line type="monotone" dataKey="v" name="Savings Realized" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-slate-500 text-center mt-1">Savings Realized Trend</div>
        </Section>
      </div>
    </DashShell>
  );
}
