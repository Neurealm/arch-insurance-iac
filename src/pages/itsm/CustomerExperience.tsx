import { AppShell } from "@/components/eoc/AppShell";
import {
  ShieldCheck, Smile, AlertTriangle, Users, Activity, ThumbsUp, Heart,
  TrendingUp, TrendingDown,
  Search, GraduationCap, ShoppingCart, Wrench, HeadphonesIcon, RefreshCw,
  Clock, Zap, MessageCircle, Lightbulb,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from "recharts";
import { DashboardToolbar, useDashboardFilters, scaleNumber } from "@/components/dashboard/DashboardToolbar";

const trend = (seed: number, n = 20, base = 50, amp = 10) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    y: base + Math.sin(i / 2.3 + seed) * amp + ((seed * 7 + i * 3) % 9),
  }));

function Spark({ data, stroke, fill }: { data: any[]; stroke: string; fill: string }) {
  const id = `cx-sp-${stroke.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity={0.45} />
            <stop offset="100%" stopColor={fill} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="y" stroke={stroke} strokeWidth={1.8} fill={`url(#${id})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MiniLine({ data, stroke }: { data: any[]; stroke: string }) {
  return (
    <ResponsiveContainer width="100%" height={28}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="y" stroke={stroke} strokeWidth={1.6} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const kpis = [
  { label: "Overall Experience Score (XLA)", value: "4.6 / 5", sub: "↑ 3.6 vs yesterday", subTone: "up", icon: ShieldCheck, iconBg: "bg-violet-50", iconColor: "text-violet-600", spark: { stroke: "hsl(262 83% 58%)", fill: "hsl(262 83% 58%)" } },
  { label: "Happy Customers", value: "89%", sub: "↑ 9% vs yesterday", subTone: "up", icon: Smile, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", spark: { stroke: "hsl(142 71% 45%)", fill: "hsl(142 71% 45%)" } },
  { label: "Critical Journey Failures", value: "7", sub: "↓ 2 vs yesterday", subTone: "up", icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-600", spark: { stroke: "hsl(0 84% 60%)", fill: "hsl(0 84% 60%)" } },
  { label: "Impacted Customers", value: "3,128", sub: "↓ 326 vs yesterday", subTone: "up", icon: Users, iconBg: "bg-amber-50", iconColor: "text-amber-600", spark: { stroke: "hsl(38 92% 50%)", fill: "hsl(38 92% 50%)" } },
  { label: "Customer Effort Score (CES)", value: "2.1", sub: "↓ 0.1 vs yesterday", subTone: "up", icon: Activity, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", spark: { stroke: "hsl(142 71% 45%)", fill: "hsl(142 71% 45%)" } },
  { label: "Net Promoter Score (NPS)", value: "62", sub: "↑ 6 vs yesterday", subTone: "up", icon: ThumbsUp, iconBg: "bg-blue-50", iconColor: "text-blue-600", spark: { stroke: "hsl(217 91% 60%)", fill: "hsl(217 91% 60%)" } },
  { label: "Voice of Customer (Sentiment)", value: "Positive", sub: "85% positive", subTone: "up", icon: Heart, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", spark: { stroke: "hsl(142 71% 45%)", fill: "hsl(142 71% 45%)" } },
];

const journeySteps = [
  { name: "Research", sub: "Research & Learn", icon: Search },
  { name: "Explore", sub: "Request & Order", icon: GraduationCap },
  { name: "Provision", sub: "Provision & Deliver", icon: ShoppingCart },
  { name: "Use", sub: "Consume & Operate", icon: Wrench },
  { name: "Support", sub: "Get Help", icon: HeadphonesIcon },
  { name: "Renew", sub: "Renew & Grow", icon: RefreshCw },
];

const journeys = [
  { name: "Order Instrumentation System", score: "4.2 / 5", status: "Good", impacted: "1,128", revenue: "$620K", color: "text-emerald-600", bg: "bg-emerald-50", trendColor: "hsl(142 71% 45%)", icon: ShoppingCart },
  { name: "Track Order & Delivery", score: "4.7 / 5", status: "Excellent", impacted: "412", revenue: "$120K", color: "text-emerald-700", bg: "bg-emerald-50", trendColor: "hsl(142 71% 45%)", icon: ShoppingCart },
  { name: "Install & Onboard Instrumentation", score: "4.3 / 5", status: "Good", impacted: "648", revenue: "$310K", color: "text-emerald-600", bg: "bg-emerald-50", trendColor: "hsl(142 71% 45%)", icon: Wrench },
  { name: "Instrumentation Usage & Monitoring", score: "3.8 / 5", status: "At Risk", impacted: "1,245", revenue: "$1.05M", color: "text-amber-700", bg: "bg-amber-50", trendColor: "hsl(38 92% 50%)", icon: Activity },
  { name: "Request Service / Support", score: "3.2 / 5", status: "Poor", impacted: "1,896", revenue: "$1.18M", color: "text-red-700", bg: "bg-red-50", trendColor: "hsl(0 84% 60%)", icon: HeadphonesIcon },
  { name: "Parts Replacement", score: "4.0 / 5", status: "Good", impacted: "523", revenue: "$210K", color: "text-emerald-600", bg: "bg-emerald-50", trendColor: "hsl(142 71% 45%)", icon: Wrench },
  { name: "Renew Service Contract", score: "4.8 / 5", status: "Excellent", impacted: "389", revenue: "$360K", color: "text-emerald-700", bg: "bg-emerald-50", trendColor: "hsl(142 71% 45%)", icon: RefreshCw },
];

const xlaTrend = [
  { day: "May 14", score: 4.2, target: 4.0 },
  { day: "May 15", score: 4.3, target: 4.0 },
  { day: "May 16", score: 4.3, target: 4.0 },
  { day: "May 17", score: 4.2, target: 4.0 },
  { day: "May 18", score: 4.1, target: 4.0 },
  { day: "May 19", score: 4.2, target: 4.0 },
  { day: "May 20", score: 4.3, target: 4.0 },
];

const categories = [
  { name: "Availability", value: 4.7, color: "hsl(142 71% 45%)" },
  { name: "Performance", value: 4.4, color: "hsl(217 91% 60%)" },
  { name: "Reliability", value: 4.6, color: "hsl(262 83% 58%)" },
  { name: "Security", value: 4.8, color: "hsl(38 92% 50%)" },
  { name: "Support Experience", value: 4.2, color: "hsl(0 84% 60%)" },
];

const insights = [
  { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", title: "Experience Decline in Support", body: "High priority system maintenance backlog.", link: "View root cause designs →" },
  { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", title: "Revenue at Risk", body: "$1.13M revenue at risk in 3 regions due to support issues.", link: "View impacted journeys →" },
  { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", title: "Positive Trend", body: "Usage & monitoring experience improved by 3% after recent system updates.", link: "View improvements →" },
  { icon: Clock, color: "text-violet-600", bg: "bg-violet-50", title: "Customer Effort Too High", body: "CES above target in support and parts replacement journeys.", link: "View customer feedback →" },
];

const healthDist = [
  { name: "Healthy", value: 16, pct: "67%", color: "hsl(142 71% 45%)" },
  { name: "At Risk", value: 5, pct: "21%", color: "hsl(38 92% 50%)" },
  { name: "Degraded", value: 2, pct: "8%", color: "hsl(28 90% 55%)" },
  { name: "Poor", value: 1, pct: "4%", color: "hsl(0 84% 60%)" },
];

const poorJourneys = [
  { name: "Request Service / Support", score: "3.2 / 5", issue: "High wait times", impacted: "1,826", revenue: "$1.18M", color: "text-red-600" },
  { name: "Instrument Usage & Monitoring", score: "3.6 / 5", issue: "Performance issues", impacted: "1,645", revenue: "$1.08M", color: "text-amber-600" },
  { name: "Parts Replacement", score: "4.0 / 5", issue: "Fulfillment delays", impacted: "523", revenue: "$210K", color: "text-amber-600" },
];

const issues = [
  { issue: "High wait times", journeys: 3, impacted: "3,145", up: true },
  { issue: "Performance degradation", journeys: 3, impacted: "3,295", up: true },
  { issue: "Poor usability", journeys: 1, impacted: "685", up: true },
  { issue: "Fulfillment status", journeys: 2, impacted: "533", up: true },
  { issue: "Knowledge gaps", journeys: 1, impacted: "412", up: false },
];

const voc = [
  { label: "Positive", value: 85, delta: "(↑ 3.2%)", color: "bg-emerald-500", text: "text-emerald-700" },
  { label: "Neutral", value: 10, delta: "(↓ 0.7%)", color: "bg-amber-500", text: "text-amber-700" },
  { label: "Negative", value: 5, delta: "(↓ 2.5%)", color: "bg-red-500", text: "text-red-700" },
];

const themes = [
  { i: 1, name: "Long wait times for resolutions", pct: "34%" },
  { i: 2, name: "Intermittent performance issues", pct: "23%" },
  { i: 3, name: "Need faster parts delivery", pct: "18%" },
  { i: 4, name: "Need firmer commitments", pct: "10%" },
  { i: 5, name: "Documentation / knowledge gaps", pct: "6%" },
];

const regions = [
  { name: "North America", score: "4.5 / 5", impacted: "9,125", risk: "$4.80M", color: "hsl(142 71% 45%)" },
  { name: "Europe", score: "4.5 / 5", impacted: "5,942", risk: "$820K", color: "hsl(142 71% 45%)" },
  { name: "Asia-Pacific", score: "4.3 / 5", impacted: "5,216", risk: "$210K", color: "hsl(38 92% 50%)" },
  { name: "Latin America", score: "4.1 / 5", impacted: "1,044", risk: "$150K", color: "hsl(38 92% 50%)" },
  { name: "Middle East & Africa", score: "3.5 / 5", impacted: "790", risk: "$360K", color: "hsl(0 84% 60%)" },
];

const drillBreakdown = [
  { label: "Availability", value: 3.4, max: 5 },
  { label: "Performance", value: 3.1, max: 5 },
  { label: "Reliability", value: 3.6, max: 5 },
  { label: "Security", value: 4.4, max: 5 },
  { label: "Support Experience", value: 3.2, max: 5 },
];

const recommended = [
  { icon: Clock, color: "text-red-600", bg: "bg-red-50", title: "Reduce Support Wait Times", body: "Reassign engineers from low priority queues." },
  { icon: Zap, color: "text-blue-600", bg: "bg-blue-50", title: "Improve System Performance", body: "Address system-wide trends in monitoring." },
  { icon: Lightbulb, color: "text-violet-600", bg: "bg-violet-50", title: "Optimize Self-Service Content", body: "Address articles and content tagged latest." },
  { icon: MessageCircle, color: "text-amber-600", bg: "bg-amber-50", title: "Accelerate Parts Delivery", body: "Accelerate top logistics accuracy & SKUs." },
];

export default function CustomerExperience() {
  const { range, setRange, autoRefresh, setAutoRefresh, selectedFilters, setSelectedFilters, scale } = useDashboardFilters();
  const filterGroups = [
    { key: "region", label: "Region", options: ["North America", "Europe", "Asia-Pacific", "Latin America", "Middle East & Africa"] },
    { key: "journey", label: "Journey", options: journeys.map((j) => j.name) },
    { key: "status", label: "Status", options: ["Excellent", "Good", "At Risk", "Poor"] },
  ];
  const filteredJourneys = journeys.filter((j) => {
    const j1 = selectedFilters.journey?.length ? selectedFilters.journey.includes(j.name) : true;
    const j2 = selectedFilters.status?.length ? selectedFilters.status.includes(j.status) : true;
    return j1 && j2;
  });
  const dynamicKpis = kpis.map((k) => {
    if (k.label === "Impacted Customers") return { ...k, value: scaleNumber(3128, scale).toLocaleString() };
    if (k.label === "Critical Journey Failures") return { ...k, value: String(scaleNumber(7, scale)) };
    if (k.label === "Net Promoter Score (NPS)") return { ...k, value: String(Math.min(99, Math.round(62 / Math.max(0.7, scale * 0.8)))) };
    return k;
  });
  return (
    <AppShell>
      <main className="flex-1 px-6 py-5 bg-slate-50/60 animate-fade-in min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">Customer Experience &amp; Journey Health (XLA-driven)</h1>
            <p className="text-sm text-slate-600 mt-1">Real-time view of end-to-end digital experiences and customer journeys that drive business outcomes.</p>
          </div>
          <DashboardToolbar
            range={range}
            onRangeChange={setRange}
            autoRefresh={autoRefresh}
            onAutoRefreshChange={setAutoRefresh}
            filters={filterGroups}
            selectedFilters={selectedFilters}
            onFiltersChange={setSelectedFilters}
          />
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-4">
          {dynamicKpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-slate-500 leading-tight">{k.label}</div>
                    <div className="text-2xl font-bold text-slate-900 leading-tight mt-1">{k.value}</div>
                  </div>
                  <div className={`h-8 w-8 rounded-lg ${k.iconBg} ${k.iconColor} grid place-items-center shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className={`text-[11px] mt-1 ${k.subTone === "down" ? "text-red-600" : "text-emerald-600"}`}>{k.sub}</div>
                <Spark data={trend(k.label.length, 20)} stroke={k.spark.stroke} fill={k.spark.fill} />
              </div>
            );
          })}
        </div>

        {/* Row 2: Journey Map / XLA trend / Category / Insights */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-4">
          {/* Journey Map */}
          <div className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">End-to-End Business Journey Map</h3>
            <p className="text-[11px] text-slate-500 mb-3">Health of key customer journeys</p>

            {/* Journey steps */}
            <div className="flex items-center justify-between mb-3 gap-1">
              {journeySteps.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div key={s.name} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center text-center min-w-0">
                      <div className="h-9 w-9 rounded-full border border-slate-200 bg-slate-50 grid place-items-center text-slate-500">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-[11px] font-semibold text-slate-800 mt-1">{s.name}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{s.sub}</div>
                    </div>
                    {idx < journeySteps.length - 1 && (
                      <div className="flex-1 h-px bg-slate-200 mx-1 mb-6 relative">
                        <span className="absolute -right-1 -top-1 text-slate-300 text-xs">›</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Journey table */}
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-[11px]">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left font-medium px-2 py-2">Journey</th>
                    <th className="text-left font-medium px-2 py-2">Experience Score</th>
                    <th className="text-left font-medium px-2 py-2">Status</th>
                    <th className="text-left font-medium px-2 py-2">Trend (XL)</th>
                    <th className="text-right font-medium px-2 py-2">Customers Impacted</th>
                    <th className="text-right font-medium px-2 py-2">Revenue at Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJourneys.map((j) => {
                    const Icon = j.icon;
                    return (
                      <tr key={j.name} className="hover:bg-slate-50">
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-slate-800">{j.name}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 font-semibold text-slate-900">{j.score}</td>
                        <td className="px-2 py-2">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${j.bg} ${j.color}`}>{j.status}</span>
                        </td>
                        <td className="px-2 py-2 w-20"><MiniLine data={trend(j.name.length, 12)} stroke={j.trendColor} /></td>
                        <td className="px-2 py-2 text-right text-slate-700">{j.impacted}</td>
                        <td className="px-2 py-2 text-right text-slate-700">{j.revenue}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View full journey map →</a>
          </div>

          {/* XLA trend */}
          <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Experience Score Over Time (XLA)</h3>
            <p className="text-[11px] text-slate-500 mb-2">Overall experience score trend</p>
            <div className="flex items-center gap-3 text-[11px] text-slate-600 mb-1">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500" /> Overall XLA Score</span>
              <span className="flex items-center gap-1.5"><span className="h-px w-3 border-t border-dashed border-slate-400" /> Target</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={xlaTrend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <ReferenceLine y={4} stroke="hsl(215 16% 70%)" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="score" stroke="hsl(262 83% 58%)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">View trend analysis →</a>
          </div>

          {/* Category breakdown */}
          <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Experience Score by Category</h3>
            <p className="text-[11px] text-slate-500 mb-2">Based on XLA dimensions</p>
            <div className="relative h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categories} dataKey="value" innerRadius={42} outerRadius={62} paddingAngle={2}>
                    {categories.map((c) => <Cell key={c.name} fill={c.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-xl font-bold text-slate-900">4.6</div>
                <div className="text-[10px] text-slate-500">Overall XLA</div>
              </div>
            </div>
            <div className="space-y-1 mt-1 text-[11px]">
              {categories.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-sm" style={{ background: c.color }} /> {c.name}</span>
                  <span className="font-semibold text-slate-900">{c.value}</span>
                </div>
              ))}
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">View category breakdown →</a>
          </div>

          {/* Executive Insights */}
          <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Executive Insights</h3>
            <div className="space-y-3">
              {insights.map((i) => {
                const Icon = i.icon;
                return (
                  <div key={i.title} className="flex gap-2.5">
                    <div className={`h-7 w-7 rounded-lg ${i.bg} ${i.color} grid place-items-center shrink-0`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-slate-900 leading-tight">{i.title}</div>
                      <div className="text-[11px] text-slate-600 leading-snug mt-0.5">{i.body}</div>
                      <a className="text-[11px] text-blue-600 font-medium cursor-pointer">{i.link}</a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Health distribution / poor journeys / issues / VoC */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-4">
          {/* Distribution */}
          <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Journey Health Distribution</h3>
            <p className="text-[11px] text-slate-500 mb-2">Breakdown of journeys by health status</p>
            <div className="flex items-center gap-3">
              <div className="relative h-32 w-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={healthDist} dataKey="value" innerRadius={36} outerRadius={56} paddingAngle={2}>
                      {healthDist.map((s) => <Cell key={s.name} fill={s.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-lg font-bold text-slate-900">24</div>
                  <div className="text-[9px] text-slate-500">Journeys</div>
                </div>
              </div>
              <div className="flex-1 space-y-1 text-[11px]">
                {healthDist.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-sm" style={{ background: s.color }} /> {s.name}</span>
                    <span className="text-slate-700">{s.value} <span className="text-slate-400">({s.pct})</span></span>
                  </div>
                ))}
              </div>
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">View all journey health →</a>
          </div>

          {/* Top Poor Performing */}
          <div className="xl:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Top Poor Performing Journeys</h3>
            <p className="text-[11px] text-slate-500 mb-2">Journeys with lowest experience scores</p>
            <table className="w-full text-[11px]">
              <thead className="text-slate-500">
                <tr>
                  <th className="text-left font-medium py-1.5">Journey</th>
                  <th className="text-left font-medium py-1.5">XLA Score</th>
                  <th className="text-left font-medium py-1.5">Trend</th>
                  <th className="text-left font-medium py-1.5">Primary Issue</th>
                  <th className="text-right font-medium py-1.5">Customers Impacted</th>
                  <th className="text-right font-medium py-1.5">Revenue at Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {poorJourneys.map((p) => (
                  <tr key={p.name}>
                    <td className="py-2 text-blue-600">{p.name}</td>
                    <td className="py-2 font-semibold text-slate-900">{p.score}</td>
                    <td className="py-2"><TrendingDown className={`h-3.5 w-3.5 ${p.color}`} /></td>
                    <td className="py-2 text-slate-700">{p.issue}</td>
                    <td className="py-2 text-right text-slate-700">{p.impacted}</td>
                    <td className="py-2 text-right text-slate-700">{p.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View all poor performing journeys →</a>
          </div>

          {/* Top Experience Issues */}
          <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Top Experience Issues (Root Causes)</h3>
            <p className="text-[11px] text-slate-500 mb-2">What is impacting customer experience</p>
            <table className="w-full text-[11px]">
              <thead className="text-slate-500">
                <tr>
                  <th className="text-left font-medium py-1.5">Issue</th>
                  <th className="text-right font-medium py-1.5">Journeys Impacted</th>
                  <th className="text-right font-medium py-1.5">Customers Impacted</th>
                  <th className="text-right font-medium py-1.5">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map((i) => (
                  <tr key={i.issue}>
                    <td className="py-2 text-slate-800">{i.issue}</td>
                    <td className="py-2 text-right text-slate-700">{i.journeys}</td>
                    <td className="py-2 text-right text-slate-700">{i.impacted}</td>
                    <td className="py-2 text-right">
                      {i.up ? <TrendingUp className="h-3.5 w-3.5 text-red-500 inline" /> : <TrendingDown className="h-3.5 w-3.5 text-emerald-500 inline" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View all issues →</a>
          </div>

          {/* Voice of Customer */}
          <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Voice of Customer (Latest)</h3>
            <p className="text-[11px] text-slate-500 mb-2">What reasons are asked</p>
            <div className="space-y-2">
              {voc.map((v) => (
                <div key={v.label}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-700"><span className={`h-2 w-2 rounded-sm ${v.color}`} /> {v.label}</span>
                    <span className={`font-semibold ${v.text}`}>{v.value}% <span className="text-slate-400 font-normal text-[10px]">{v.delta}</span></span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                    <div className={`h-full ${v.color}`} style={{ width: `${v.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[11px] font-semibold text-slate-900 mt-3 mb-1">Top Feedback Themes</div>
            <ol className="space-y-1 text-[11px]">
              {themes.map((t) => (
                <li key={t.i} className="flex items-center justify-between text-slate-700">
                  <span className="truncate"><span className="text-slate-400">{t.i}.</span> {t.name}</span>
                  <span className="font-semibold text-slate-900 ml-2">{t.pct}</span>
                </li>
              ))}
            </ol>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">View full feedback report →</a>
          </div>
        </div>

        {/* Row 4: Region / Drill-down / Recommended Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Region */}
          <div className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Experience by Region</h3>
            <p className="text-[11px] text-slate-500 mb-2">Regional view of overall experience score</p>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-5">
                <div className="h-44 rounded-lg bg-slate-50 border border-slate-100 grid place-items-center text-[11px] text-slate-400">
                  World map view
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10px] text-slate-600">
                  <div className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: "hsl(142 71% 45%)" }} />4.5 - 5.0 Excellent</div>
                  <div className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: "hsl(142 50% 60%)" }} />3.5 - 4.4 Good</div>
                  <div className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: "hsl(38 92% 50%)" }} />2.5 - 3.4 At Risk</div>
                  <div className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: "hsl(0 84% 60%)" }} />1.5 - 2.4 Poor</div>
                  <div className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-slate-200" />No Data</div>
                </div>
              </div>
              <div className="col-span-7">
                <table className="w-full text-[11px]">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="text-left font-medium py-1.5">Region</th>
                      <th className="text-left font-medium py-1.5">XLA Score</th>
                      <th className="text-left font-medium py-1.5">Trend (FE)</th>
                      <th className="text-right font-medium py-1.5">Customers Impacted</th>
                      <th className="text-right font-medium py-1.5">Revenue at Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {regions.map((r) => (
                      <tr key={r.name}>
                        <td className="py-2 text-slate-800">{r.name}</td>
                        <td className="py-2 font-semibold text-slate-900">{r.score}</td>
                        <td className="py-2 w-16"><MiniLine data={trend(r.name.length, 10)} stroke={r.color} /></td>
                        <td className="py-2 text-right text-slate-700">{r.impacted}</td>
                        <td className="py-2 text-right text-slate-700">{r.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View regional details →</a>
          </div>

          {/* Drill-Down */}
          <div className="xl:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Customer Journey Drill-Down</h3>
            <p className="text-[11px] text-slate-500 mb-2">Drill into a specific journey</p>
            <div className="text-[10px] text-slate-500 mb-1">Select Journey</div>
            <div className="rounded-lg border border-slate-200 px-3 py-2 text-[12px] text-slate-700 flex items-center justify-between mb-3 bg-white">
              Request Service / Support <span className="text-slate-400">▾</span>
            </div>
            <div className="text-[12px] font-semibold text-slate-900 mb-2">Journey Score Breakdown</div>
            <div className="space-y-2.5">
              {drillBreakdown.map((d) => (
                <div key={d.label}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-700">{d.label}</span>
                    <span className="font-semibold text-slate-900">{d.value} / {d.max}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-violet-500" style={{ width: `${(d.value / d.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View detailed journey analysis →</a>
          </div>

          {/* Recommended Actions */}
          <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Recommended Actions</h3>
            <div className="space-y-3">
              {recommended.map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.title} className="flex gap-2.5 items-start">
                    <div className={`h-7 w-7 rounded-lg ${r.bg} ${r.color} grid place-items-center shrink-0`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-slate-900 leading-tight">{r.title}</div>
                      <div className="text-[11px] text-slate-600 leading-snug mt-0.5">{r.body}</div>
                    </div>
                    <button className="text-[10px] border border-slate-200 rounded-md px-2 py-1 text-slate-700 hover:bg-slate-50 shrink-0">View Plan</button>
                  </div>
                );
              })}
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View all recommended actions →</a>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-4">
          <span>All times in EDT</span>
          <span>Data refreshes every 60 seconds</span>
          <span>Sources: ITSM, Sources</span>
        </div>
      </main>
    </AppShell>
  );
}