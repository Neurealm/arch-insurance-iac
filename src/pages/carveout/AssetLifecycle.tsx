import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  DollarSign, Users, Tag, TrendingUp, PiggyBank, Circle, Laptop, Percent,
  ShoppingCart, Monitor, RefreshCw, Trash2, Calendar, ShieldCheck, Leaf,
  AlertTriangle, Info, CheckCircle2, BarChart3, LineChart as LineIcon,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const kpis: KPI[] = [
  { label: "Total Assets (In Scope)", value: "8,240", sub: "100% of target", subColor: "text-blue-600", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Total Users", value: "8,000", sub: "100% of target", subColor: "text-emerald-600", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Total Current Value (CapEx)", value: "$12.48M", sub: "Book Value", subColor: "text-violet-600", icon: Tag, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Total Annual Spend (All-In)", value: "$3.42M", sub: "Across all models", subColor: "text-amber-600", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Savings Identified", value: "$1.26M", sub: "Potential annually", subColor: "text-emerald-600", icon: PiggyBank, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Cost per User (All-In)", value: "$428", sub: "Per user / year", subColor: "text-blue-600", icon: Circle, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Cost per Device (All-In)", value: "$415", sub: "Per device / year", subColor: "text-slate-600", icon: Laptop, color: "text-slate-600", bg: "bg-slate-50" },
  { label: "Budget Variance", value: "-7.8%", sub: "Under budget", subColor: "text-emerald-600", icon: Percent, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const scenarioRows = [
  { m: "Upfront Investment", c: "$8.92M", l: "$0.96M", d: "-$7.96M", b: "Leasing" },
  { m: "3 Year Total Cost (TCO)", c: "$13.24M", l: "$11.98M", d: "-$1.26M", b: "Leasing" },
  { m: "Annual Cost (Avg.)", c: "$4.41M", l: "$4.00M", d: "-$0.41M", b: "Leasing" },
  { m: "Refresh Flexibility", c: "Low", l: "High", d: "—", b: "Leasing" },
  { m: "Technology Currency", c: "Lower", l: "Higher", d: "—", b: "Leasing" },
  { m: "Residual Value Risk", c: "High", l: "Low", d: "—", b: "Leasing" },
  { m: "Cash Flow Impact", c: "High", l: "Low", d: "—", b: "Leasing" },
];

const lifecycle = [
  { n: 1, t: "Procure", s: "Planning & Purchase", v: "2,150", p: "26%", tv: "$3.45M", c: "text-blue-600", bg: "bg-blue-100", icon: ShoppingCart, pc: "text-emerald-600" },
  { n: 2, t: "Operate", s: "In Use", v: "5,620", p: "68%", tv: "$7.85M", c: "text-violet-600", bg: "bg-violet-100", icon: Monitor, pc: "text-emerald-600" },
  { n: 3, t: "Refresh", s: "Planned (Next 12 Mo.)", v: "920", p: "11%", tv: "$1.35M", c: "text-blue-600", bg: "bg-blue-100", icon: RefreshCw, pc: "text-amber-600" },
  { n: 4, t: "Retire", s: "Retired (This Year)", v: "350", p: "4%", tv: "$0.42M", c: "text-red-600", bg: "bg-red-100", icon: Trash2, pc: "text-red-600", recovered: true },
];

const lifecycleStats = [
  { l: "Average Device Age", v: "2.6 Years", icon: Calendar, c: "text-slate-600" },
  { l: "Refresh Rate (Annual)", v: "22%", icon: RefreshCw, c: "text-blue-600" },
  { l: "Lifecycle Compliance", v: "95%", icon: ShieldCheck, c: "text-emerald-600" },
  { l: "E-Waste Recycled", v: "88%", sub: "by value", icon: Leaf, c: "text-emerald-600" },
];

const costBreakdown = [
  { l: "Hardware (Purchase/Lease)", v: "$1.68M", p: "49%", color: "hsl(220 60% 35%)" },
  { l: "Software & Licenses", v: "$0.78M", p: "23%", color: "hsl(142 71% 45%)" },
  { l: "Support & Maintenance", v: "$0.54M", p: "16%", color: "hsl(25 95% 53%)" },
  { l: "Deployment & Services", v: "$0.24M", p: "7%", color: "hsl(262 83% 58%)" },
  { l: "Other (Accessories, etc.)", v: "$0.18M", p: "5%", color: "hsl(173 80% 40%)" },
];

const costTrend = [
  { d: "Feb 2023", v: 512 },
  { d: "Aug 2023", v: 486 },
  { d: "Feb 2026", v: 462 },
  { d: "Aug 2026", v: 438 },
  { d: "Feb 2026", v: 428 },
];

const vendors = [
  { v: "Dell Technologies", spend: "$1.42M", p: "41%", score: 92, opp: "Optimize refresh cadence & tier mix", sav: "$210K" },
  { v: "Microsoft", spend: "$0.78M", p: "23%", score: 95, opp: "License optimization (usage-based)", sav: "$160K" },
  { v: "HP Inc.", spend: "$0.46M", p: "13%", score: 88, opp: "Consolidate SKUs & volume discount", sav: "$95K" },
  { v: "VMware", spend: "$0.32M", p: "9%", score: 90, opp: "Right-size bundles & support", sav: "$60K" },
  { v: "Lenovo", spend: "$0.22M", p: "6%", score: 85, opp: "Negotiate better renewal terms", sav: "$45K" },
  { v: "Others", spend: "$0.22M", p: "6%", score: 0, opp: "Aggregate tail spend", sav: "$35K" },
];

const finImpact = [
  { l: "TCO Savings (Leasing vs CapEx)", v: "$1.26M", s: "Over 3 Years", icon: PiggyBank, c: "text-emerald-600", bg: "bg-emerald-50" },
  { l: "Cash Flow Improvement", v: "$7.96M", s: "Upfront Avoided", icon: BarChart3, c: "text-blue-600", bg: "bg-blue-50" },
  { l: "ROI Improvement", v: "18.6%", s: "Projected ROI", icon: TrendingUp, c: "text-violet-600", bg: "bg-violet-50" },
  { l: "Payback Period (Leasing)", v: "22", s: "Months", icon: Calendar, c: "text-amber-600", bg: "bg-amber-50" },
];

const alerts = [
  { icon: AlertTriangle, c: "text-amber-600", t: "920 devices due for refresh in next 12 months.", a: "View Plan" },
  { icon: Info, c: "text-blue-600", t: "Leasing renewals coming up for 1,240 assets.", a: "Review Renewals" },
  { icon: CheckCircle2, c: "text-emerald-600", t: "Software license optimization opportunity identified.", a: "View Details" },
  { icon: Trash2, c: "text-slate-600", t: "End-of-life devices detected (350 units).", a: "View Retire Plan" },
];

const businessOutcomes = [
  { i: BarChart3, c: "text-blue-600", l: "Data-Driven Decisions" },
  { i: RefreshCw, c: "text-emerald-600", l: "Continuous Optimization" },
  { i: ShieldCheck, c: "text-violet-600", l: "Full Lifecycle Visibility" },
  { i: DollarSign, c: "text-amber-600", l: "Financial Accountability" },
];

const outcomes: Outcome[] = [];

export default function AssetLifecycle() {
  return (
    <DashShell
      title="ASSET LIFECYCLE & FINANCIAL OPTIMIZATION"
      subtitle="Optimize End User Compute investments across the entire lifecycle to maximize value, control costs, and drive better business outcomes."
      wwh={{
        what: [
          "CapEx vs Leasing financial scenarios and total cost comparison",
          "Full device lifecycle: Procure → Operate → Refresh → Retire",
          "Cost per user and cost per device metrics",
          "Vendor and partner spend optimization insights",
          "Budget tracking, savings realized, and forecasted outcomes",
        ],
        why: [
          "Enables informed decisions on CapEx vs Leasing strategies",
          "Reduces total cost of ownership (TCO) and improves ROI",
          "Aligns device lifecycle with business needs and refresh cadence",
          "Identifies optimization opportunities across vendors and contracts",
          "Drives financial accountability and transparent value realization",
        ],
        how: [
          "AI-driven modeling of CapEx vs Leasing with real-time assumptions",
          "Lifecycle tracking integrated with procurement, ITSM, and finance systems",
          "Continuous cost monitoring, benchmarking, and deviation alerts",
          "Vendor performance scoring and contract optimization recommendations",
          "Agentic automation for renewals, retirements, and asset disposition",
        ],
      }}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Scenario Comparison | Lifecycle Overview | Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="CapEx vs Leasing Scenario Comparison" action="">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-slate-500 uppercase">
              <tr className="border-b border-slate-100">
                <th className="text-left py-1.5">Metric</th>
                <th className="text-right">CapEx (Purchase)</th>
                <th className="text-right">Leasing (36 Mo.)</th>
                <th className="text-right">Difference</th>
                <th className="text-right pl-2">Better Option</th>
              </tr>
            </thead>
            <tbody>
              {scenarioRows.map((r) => (
                <tr key={r.m} className="border-b border-slate-50">
                  <td className="py-1.5 font-semibold">{r.m}</td>
                  <td className="text-right">{r.c}</td>
                  <td className="text-right">{r.l}</td>
                  <td className={`text-right font-semibold ${r.d.startsWith("-") ? "text-emerald-600" : "text-slate-500"}`}>{r.d}</td>
                  <td className="text-right pl-2 font-bold text-emerald-600">{r.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-100 p-2 text-[11px] text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Leasing delivers $1.26M lower TCO over 3 years with better flexibility and lower risk.
          </div>
        </Section>

        <Section title="Asset Lifecycle Overview" action="">
          <div className="flex items-center gap-1 mb-3">
            {lifecycle.map((s, i) => {
              const I = s.icon;
              return (
                <div key={s.n} className="flex items-center gap-1 flex-1">
                  <div className="flex-1 text-center">
                    <div className={`h-10 w-10 rounded-full ${s.bg} ${s.c} grid place-items-center mx-auto mb-1`}>
                      <I className="h-5 w-5" />
                    </div>
                    <div className={`text-[10px] font-bold ${s.c}`}>{s.n}. {s.t}</div>
                    <div className="text-[9px] text-slate-500">{s.s}</div>
                    <div className="text-base font-bold mt-1">{s.v}</div>
                    <div className={`text-[10px] font-semibold ${s.pc}`}>{s.p}</div>
                    <div className="text-[9px] text-slate-500 mt-1">{s.recovered ? "Recovered Value" : "Total Value"}</div>
                    <div className="text-[11px] font-bold">{s.tv}</div>
                  </div>
                  {i < lifecycle.length - 1 && <span className="text-slate-300">→</span>}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
            {lifecycleStats.map((s) => {
              const I = s.icon;
              return (
                <div key={s.l} className="text-center">
                  <I className={`h-4 w-4 mx-auto mb-0.5 ${s.c}`} />
                  <div className="text-[9px] text-slate-500 leading-tight">{s.l}</div>
                  <div className={`text-sm font-bold ${s.c}`}>{s.v}</div>
                  {s.sub && <div className="text-[9px] text-slate-500">{s.sub}</div>}
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Cost Breakdown (Annual All-In)" action="">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
              <PieChart width={140} height={140}>
                <Pie data={costBreakdown.map(c => ({ name: c.l, value: parseInt(c.p) }))} dataKey="value" cx={70} cy={70} innerRadius={45} outerRadius={66} paddingAngle={2}>
                  {costBreakdown.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-base font-bold">$3.42M</div>
                  <div className="text-[9px] text-slate-500">Total Annual Spend</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1 text-[11px]">
              {costBreakdown.map((c) => (
                <div key={c.l} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="flex-1 text-slate-700 leading-tight">{c.l}</span>
                  <span className="font-bold w-12 text-right">{c.v}</span>
                  <span className="text-slate-500 w-8 text-right">{c.p}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-500 mt-2">
            vs Last Year <span className="text-emerald-600 font-bold">↓ -9.3%</span>
          </div>
        </Section>
      </div>

      {/* Row 2: Cost per User Trend | Vendor Insights | Financial Impact + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Cost per User Trend (All-In)" action="">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={costTrend} margin={{ top: 20, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 600]} ticks={[0, 150, 300, 450, 600]} tickFormatter={(v) => `$${v}`} />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ r: 4 }} label={{ position: "top", fontSize: 10, fill: "#1e293b", formatter: (v: number) => `$${v}` }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-[11px] text-emerald-700 mt-2 flex items-center justify-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Cost per user down 16.4% over 24 months
          </div>
        </Section>

        <Section title="Vendor & Partner Optimization Insights" action="">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-slate-500 uppercase">
              <tr className="border-b border-slate-100">
                <th className="text-left py-1.5">Vendor</th>
                <th className="text-right">Annual Spend</th>
                <th className="text-right">% of Spend</th>
                <th className="text-right">Score</th>
                <th className="text-left pl-2">Optimization Opportunity</th>
                <th className="text-right">Potential Savings</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.v} className="border-b border-slate-50">
                  <td className="py-1.5 font-semibold">{v.v}</td>
                  <td className="text-right">{v.spend}</td>
                  <td className="text-right">{v.p}</td>
                  <td className={`text-right font-bold ${v.score >= 90 ? "text-emerald-600" : v.score > 0 ? "text-amber-600" : "text-slate-400"}`}>{v.score || "—"}</td>
                  <td className="pl-2 text-slate-600">{v.opp}</td>
                  <td className="text-right font-bold">{v.sav}</td>
                </tr>
              ))}
              <tr className="font-bold bg-emerald-50">
                <td className="py-2 pl-1 text-emerald-700" colSpan={5}>Total Identified Savings Opportunity</td>
                <td className="text-right text-emerald-700 pr-1">$605K</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <div className="space-y-4">
          <Section title="Financial Impact Summary (3 Year View)" action="">
            <div className="grid grid-cols-2 gap-2">
              {finImpact.map((f) => {
                const I = f.icon;
                return (
                  <div key={f.l} className={`rounded-lg ${f.bg} border border-slate-100 p-2.5`}>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 leading-tight">
                      <I className={`h-3.5 w-3.5 ${f.c}`} /> {f.l}
                    </div>
                    <div className={`text-base font-bold ${f.c} mt-1`}>{f.v}</div>
                    <div className="text-[10px] text-slate-500">{f.s}</div>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Alerts & Recommendations" action="">
            <ul className="space-y-1.5">
              {alerts.map((a) => {
                const I = a.icon;
                return (
                  <li key={a.t} className="flex items-start gap-2 text-[11px]">
                    <I className={`h-3.5 w-3.5 ${a.c} shrink-0 mt-0.5`} />
                    <div className="flex-1 text-slate-700">{a.t}</div>
                    <a className="text-blue-600 font-semibold cursor-pointer shrink-0">{a.a}</a>
                  </li>
                );
              })}
            </ul>
          </Section>
        </div>
      </div>

      {/* Footer Outcome bar */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-700 flex-1 min-w-[280px]">
          <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
          <div><b>Business Outcome:</b> Lower TCO, better cash flow, optimized vendor spend, and a modern device lifecycle aligned to user and business needs.</div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {businessOutcomes.map((b) => {
            const I = b.i;
            return (
              <div key={b.l} className={`flex items-center gap-1.5 font-semibold ${b.c}`}>
                <I className="h-3.5 w-3.5" /> {b.l}
              </div>
            );
          })}
        </div>
      </div>
    </DashShell>
  );
}
