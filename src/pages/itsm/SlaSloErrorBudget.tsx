import { AppShell } from "@/components/eoc/AppShell";
import {
  ShieldCheck, AlertTriangle, Activity,
  ShieldAlert, Shuffle, TrendingUp, AlertOctagon, Lightbulb, DollarSign,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine, RadialBarChart, RadialBar,
} from "recharts";
import { DashboardToolbar, useDashboardFilters, scaleNumber } from "@/components/dashboard/DashboardToolbar";

const trend = (seed: number, n = 18, base = 50, amp = 8) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    y: base + Math.sin(i / 2.1 + seed) * amp + ((seed * 7 + i * 3) % 7),
  }));

function Spark({ data, stroke, fill }: { data: any[]; stroke: string; fill: string }) {
  const id = `sla-sp-${stroke.replace(/[^a-z0-9]/gi, "")}`;
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
    <ResponsiveContainer width="100%" height={26}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="y" stroke={stroke} strokeWidth={1.6} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const kpis = [
  { label: "Overall SLA Achievement", value: "94.6%", sub: "↑ 9% vs yesterday", subTone: "up", icon: ShieldCheck, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", spark: { stroke: "hsl(142 71% 45%)", fill: "hsl(142 71% 45%)" } },
  { label: "SLO Compliance", value: "96.2%", sub: "↑ 6% vs yesterday", subTone: "up", icon: ShieldCheck, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", spark: { stroke: "hsl(142 71% 45%)", fill: "hsl(142 71% 45%)" } },
  { label: "Error Budget Burn (MTD)", value: "28%", sub: "↓ 2% vs last month", subTone: "up", icon: Shuffle, iconBg: "bg-amber-50", iconColor: "text-amber-600", spark: { stroke: "hsl(38 92% 50%)", fill: "hsl(38 92% 50%)" } },
  { label: "SLA Breaches (MTD)", value: "18", sub: "↓ 6 vs last month", subTone: "up", icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-600", spark: { stroke: "hsl(0 84% 60%)", fill: "hsl(0 84% 60%)" } },
  { label: "At Risk SLAs", value: "7", sub: "↓ 1 vs yesterday", subTone: "up", icon: ShieldAlert, iconBg: "bg-amber-50", iconColor: "text-amber-600", spark: { stroke: "hsl(38 92% 50%)", fill: "hsl(38 92% 50%)" } },
];

const slaTrend = [
  { day: "May 14", v: 98.5 }, { day: "May 15", v: 98.7 }, { day: "May 16", v: 98.7 },
  { day: "May 17", v: 99.0 }, { day: "May 18", v: 99.1 }, { day: "May 19", v: 99.2 }, { day: "May 20", v: 99.2 },
];
const sloTrend = [
  { day: "May 14", v: 99.1 }, { day: "May 15", v: 99.2 }, { day: "May 16", v: 99.2 },
  { day: "May 17", v: 99.0 }, { day: "May 18", v: 99.1 }, { day: "May 19", v: 99.2 }, { day: "May 20", v: 99.2 },
];

const burnRange = [
  { name: "Healthy", range: "< 60%", color: "hsl(142 71% 45%)" },
  { name: "Caution", range: "60% – 80%", color: "hsl(38 92% 50%)" },
  { name: "High Risk", range: "80% – 100%", color: "hsl(0 84% 60%)" },
  { name: "Critical", range: "> 100%", color: "hsl(0 70% 40%)" },
];

const slaServices = [
  { service: "Laboratory Instrument Systems", sla: "Availability", target: "99.55%", ach: "98.66%", achColor: "text-emerald-600 bg-emerald-50", trendColor: "hsl(142 71% 45%)", breaches: 2, mttr: "1h 24m", atSrv: "Yes", burn: "18%", burnColor: "bg-emerald-500" },
  { service: "Analytics Connect Hub", sla: "Performance", target: "99.50%", ach: "94.57%", achColor: "text-emerald-600 bg-emerald-50", trendColor: "hsl(142 71% 45%)", breaches: 3, mttr: "2h 10m", atSrv: "Yes", burn: "42%", burnColor: "bg-amber-500" },
  { service: "Empower CDS Platform", sla: "Availability", target: "98.60%", ach: "97.45%", achColor: "text-amber-600 bg-amber-50", trendColor: "hsl(38 92% 50%)", breaches: 4, mttr: "3h 58m", atSrv: "Yes", burn: "47%", burnColor: "bg-amber-500" },
  { service: "Order Management System", sla: "Availability", target: "98.60%", ach: "90.57%", achColor: "text-emerald-600 bg-emerald-50", trendColor: "hsl(142 71% 45%)", breaches: 0, mttr: "48m", atSrv: "Yes", burn: "15%", burnColor: "bg-emerald-500" },
  { service: "Manufacturing & MES", sla: "Performance", target: "98.60%", ach: "95.87%", achColor: "text-red-600 bg-red-50", trendColor: "hsl(0 84% 60%)", breaches: 5, mttr: "3h 38m", atSrv: "Yes", burn: "71%", burnColor: "bg-red-500" },
  { service: "Finance & ERP (Oracle)", sla: "Availability", target: "98.60%", ach: "93.87%", achColor: "text-emerald-600 bg-emerald-50", trendColor: "hsl(142 71% 45%)", breaches: 2, mttr: "3h 58m", atSrv: "Yes", burn: "23%", burnColor: "bg-emerald-500" },
  { service: "Customer Support Portal", sla: "Availability", target: "98.60%", ach: "98.25%", achColor: "text-emerald-600 bg-emerald-50", trendColor: "hsl(142 71% 45%)", breaches: 0, mttr: "53m", atSrv: "Yes", burn: "8%", burnColor: "bg-emerald-500" },
  { service: "Global e-Commerce Platform", sla: "Performance", target: "99.60%", ach: "80.15%", achColor: "text-red-600 bg-red-50", trendColor: "hsl(38 92% 50%)", breaches: 5, mttr: "1h 88m", atSrv: "Yes", burn: "46%", burnColor: "bg-amber-500" },
];

const breachCategories = [
  { name: "Availability", value: 7, pct: "(28%)", color: "hsl(0 84% 60%)" },
  { name: "Performance", value: 6, pct: "(29%)", color: "hsl(38 92% 50%)" },
  { name: "Capacity", value: 3, pct: "(17%)", color: "hsl(45 93% 55%)" },
  { name: "Security", value: 1, pct: "(8%)", color: "hsl(262 83% 58%)" },
  { name: "Other", value: 1, pct: "(6%)", color: "hsl(217 91% 60%)" },
];

const sloCompliance = [
  { service: "API Gateway", slo: "Availability (30d)", target: "99.50%", current: "99.82%", ach: "100%", achColor: "text-emerald-600", remaining: "12.5 days (51%)", barColor: "bg-emerald-500", barPct: 51, trendColor: "hsl(142 71% 45%)" },
  { service: "Data Ingestion Service", slo: "Availability (30d)", target: "99.50%", current: "99.32%", ach: "95%", achColor: "text-emerald-600", remaining: "8.5 days (69%)", barColor: "bg-amber-500", barPct: 69, trendColor: "hsl(38 92% 50%)" },
  { service: "Search Service", slo: "Performance (20k)", target: "380 ms", current: "289 ms", ach: "100%", achColor: "text-emerald-600", remaining: "12.2 days (59%)", barColor: "bg-emerald-500", barPct: 59, trendColor: "hsl(142 71% 45%)" },
  { service: "Customer Portal", slo: "Availability (30d)", target: "99.50%", current: "90.52%", ach: "92%", achColor: "text-emerald-600", remaining: "4.1 days (27%)", barColor: "bg-amber-500", barPct: 27, trendColor: "hsl(38 92% 50%)" },
  { service: "Reporting Service", slo: "Availability (3bd)", target: "99.50%", current: "97.65%", ach: "93%", achColor: "text-amber-600", remaining: "3.3 days (16%)", barColor: "bg-red-500", barPct: 16, trendColor: "hsl(0 84% 60%)" },
];

const forecastData = [
  { day: "May 1", actual: 22, forecast: null },
  { day: "May 7", actual: 32, forecast: null },
  { day: "May 11", actual: 45, forecast: null },
  { day: "May 15", actual: 58, forecast: 58 },
  { day: "May 20", actual: null, forecast: 65 },
  { day: "May 25", actual: null, forecast: 72 },
  { day: "May 31", actual: null, forecast: 78 },
];

const insights = [
  { icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", title: "SLA Performance Strong", body: "Overall SLA achievement is 98.6%, above target. Continue focus on breaching services." },
  { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", title: "Error Budget Healthy", body: "28% of error budget consumed this month. Current burn-rate is sustainable." },
  { icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50", title: "At Risk Areas", body: "7 SLAs are at risk of breaching target. Action recommended." },
  { icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50", title: "Reliability Improving", body: "SLO compliance improved 1.5% vs yesterday." },
];

const recommended = [
  { icon: AlertOctagon, color: "text-red-600", bg: "bg-red-50", title: "Investigate Breaching SLAs", body: "18 SLA breaches this month require attention.", action: "View Breaches" },
  { icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50", title: "Review At Risk SLAs", body: "7 SLAs trending toward a breach.", action: "View at Risk" },
  { icon: Lightbulb, color: "text-violet-600", bg: "bg-violet-50", title: "Optimize Error Budget", body: "Consider reliability improvements to reduce burn.", action: "View Recommendations" },
  { icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", title: "Improve SLO Compliance", body: "Overall current SLO target.", action: "View Actions" },
];

const sloSummary = [
  { name: "Compliant", value: 49, pct: "(82%)", color: "hsl(142 71% 45%)" },
  { name: "Warning", value: 4, pct: "(13%)", color: "hsl(38 92% 50%)" },
  { name: "Non-Compliant", value: 4, pct: "(5%)", color: "hsl(0 84% 60%)" },
];

const ebSummary = [
  { name: "Healthy (1-40%)", value: 30, pct: "30-50%", color: "hsl(142 71% 45%)" },
  { name: "Caution (20-80%)", value: 15, pct: "15 (87%)", color: "hsl(38 92% 50%)" },
  { name: "High Risk (20-100%)", value: 5, pct: "5 (10%)", color: "hsl(20 90% 55%)" },
  { name: "Critical (=100%)", value: 3, pct: "3 (8%)", color: "hsl(0 84% 60%)" },
];

export default function SlaSloErrorBudget() {
  const { range, setRange, autoRefresh, setAutoRefresh, selectedFilters, setSelectedFilters, scale } = useDashboardFilters();
  const filterGroups = [
    { key: "service", label: "Business Service", options: slaServices.map((s) => s.service) },
    { key: "slaType", label: "SLA Type", options: ["Availability", "Performance"] },
    { key: "status", label: "Status", options: ["Healthy", "Warning", "Breaching"] },
  ];
  const filteredSla = slaServices.filter((s) => {
    const a = selectedFilters.service?.length ? selectedFilters.service.includes(s.service) : true;
    const b = selectedFilters.slaType?.length ? selectedFilters.slaType.includes(s.sla) : true;
    return a && b;
  });
  const burnPct = Math.min(100, Math.round(28 * scale));
  const breachesMtd = scaleNumber(18, scale);
  const atRisk = scaleNumber(7, scale * 0.9);
  const dynamicKpis = kpis.map((k) => {
    if (k.label === "Error Budget Burn (MTD)") return { ...k, value: `${burnPct}%` };
    if (k.label === "SLA Breaches (MTD)") return { ...k, value: String(breachesMtd) };
    if (k.label === "At Risk SLAs") return { ...k, value: String(atRisk) };
    return k;
  });
  return (
    <AppShell>
      <main className="flex-1 px-6 py-5 bg-slate-50/60 animate-fade-in min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">SLA / SLO / Error Budget Performance</h1>
            <p className="text-sm text-slate-600 mt-1">Real-time view of service level performance, reliability, and error budget health.</p>
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

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* LEFT main column */}
          <div className="xl:col-span-9 space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
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
                    <Spark data={trend(k.label.length, 18)} stroke={k.spark.stroke} fill={k.spark.fill} />
                  </div>
                );
              })}
            </div>

            {/* Row: SLA, SLO, Error Budget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">SLA Achievement Over Time</h3>
                <p className="text-[11px] text-slate-500 mb-2">SLA achievement over time (All Services)</p>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={slaTrend} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[90, 100]} tick={{ fontSize: 10, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <ReferenceLine y={98} stroke="hsl(215 16% 70%)" strokeDasharray="4 4" label={{ value: "Target: > 98%", position: "insideTopLeft", fontSize: 9, fill: "hsl(215 16% 47%)" }} />
                      <Line type="monotone" dataKey="v" stroke="hsl(217 91% 60%)" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">View full SLA performance →</a>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">SLO Compliance Over Time</h3>
                <p className="text-[11px] text-slate-500 mb-2">SLO compliance over time (All Services)</p>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sloTrend} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[90, 100]} tick={{ fontSize: 10, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <ReferenceLine y={99} stroke="hsl(215 16% 70%)" strokeDasharray="4 4" label={{ value: "Target: > 99%", position: "insideTopLeft", fontSize: 9, fill: "hsl(215 16% 47%)" }} />
                      <Line type="monotone" dataKey="v" stroke="hsl(142 71% 45%)" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">View full SLO performance →</a>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">Error Budget Burn Rate (MTD)</h3>
                <p className="text-[11px] text-slate-500 mb-2">How fast we are consuming error budget</p>
                <div className="flex items-center gap-3">
                  <div className="relative h-32 w-32 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "burn", value: 28, fill: "hsl(142 71% 45%)" }]} startAngle={90} endAngle={-270}>
                        <RadialBar background={{ fill: "hsl(214 32% 91%)" }} dataKey="value" cornerRadius={6} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="text-xl font-bold text-slate-900">28%</div>
                      <div className="text-[10px] text-slate-500">Budget Burn</div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1 text-[11px]">
                    <div className="font-semibold text-slate-700 mb-0.5">Burn Rate Bands</div>
                    {burnRange.map((b) => (
                      <div key={b.name} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-sm" style={{ background: b.color }} /> {b.name}</span>
                        <span className="text-slate-500">{b.range}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-slate-700 mt-2"><span className="font-semibold">Budget Used:</span> 28% (8.4 days)</div>
                <div className="text-[11px] text-slate-700"><span className="font-semibold">Budget Remaining:</span> 72% (21.6 days)</div>
                <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">View error budget details →</a>
              </div>
            </div>

            {/* SLA performance + Breaches by category */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-2">SLA Performance by Business Service</h3>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-[11px]">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="text-left font-medium px-2 py-2">Business Service</th>
                        <th className="text-left font-medium px-2 py-2">SLA</th>
                        <th className="text-left font-medium px-2 py-2">SLA Target</th>
                        <th className="text-left font-medium px-2 py-2">Achievement</th>
                        <th className="text-left font-medium px-2 py-2">Trend (7D)</th>
                        <th className="text-right font-medium px-2 py-2">MTD Breaches</th>
                        <th className="text-left font-medium px-2 py-2">MTTR Breach</th>
                        <th className="text-left font-medium px-2 py-2">At Srv</th>
                        <th className="text-left font-medium px-2 py-2">Error Budget Burn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSla.map((r) => (
                        <tr key={r.service} className="hover:bg-slate-50">
                          <td className="px-2 py-2 text-blue-600">{r.service}</td>
                          <td className="px-2 py-2 text-slate-700">{r.sla}</td>
                          <td className="px-2 py-2 text-slate-700">{r.target}</td>
                          <td className="px-2 py-2"><span className={`px-2 py-0.5 rounded font-semibold ${r.achColor}`}>{r.ach}</span></td>
                          <td className="px-2 py-2 w-16"><MiniLine data={trend(r.service.length, 12)} stroke={r.trendColor} /></td>
                          <td className="px-2 py-2 text-right text-slate-700">{r.breaches}</td>
                          <td className="px-2 py-2 text-slate-700">{r.mttr}</td>
                          <td className="px-2 py-2"><span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700">{r.atSrv}</span></td>
                          <td className="px-2 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-700 w-8">{r.burn}</span>
                              <span className={`h-1.5 w-2 rounded-full ${r.burnColor}`} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View all SLA details →</a>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">SLA Breaches by Category (MTD)</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="relative h-44 w-44 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={breachCategories} dataKey="value" innerRadius={48} outerRadius={75} paddingAngle={2}>
                          {breachCategories.map((c) => <Cell key={c.name} fill={c.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="text-xl font-bold text-slate-900">18</div>
                      <div className="text-[10px] text-slate-500">Total Breaches</div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5 text-[11px]">
                    {breachCategories.map((c) => (
                      <div key={c.name} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-sm" style={{ background: c.color }} /> {c.name}</span>
                        <span className="text-slate-700">{c.value} <span className="text-slate-400">{c.pct}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
                <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View breach report →</a>
              </div>
            </div>

            {/* SLO compliance + Error Budget Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-2">SLO Compliance by Service</h3>
                <table className="w-full text-[11px]">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="text-left font-medium py-1.5">Service</th>
                      <th className="text-left font-medium py-1.5">SLO</th>
                      <th className="text-left font-medium py-1.5">Target</th>
                      <th className="text-left font-medium py-1.5">Current</th>
                      <th className="text-left font-medium py-1.5">Achievement</th>
                      <th className="text-left font-medium py-1.5">Error Budget Remaining</th>
                      <th className="text-left font-medium py-1.5 w-20">Trend (7D)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sloCompliance.map((r) => (
                      <tr key={r.service}>
                        <td className="py-2 text-slate-800">{r.service}</td>
                        <td className="py-2 text-slate-700">{r.slo}</td>
                        <td className="py-2 text-slate-700">{r.target}</td>
                        <td className="py-2 text-slate-700">{r.current}</td>
                        <td className={`py-2 font-semibold ${r.achColor}`}>{r.ach}</td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 text-[10px] w-24">{r.remaining}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div className={`h-full ${r.barColor}`} style={{ width: `${r.barPct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-2 w-20"><MiniLine data={trend(r.service.length, 12)} stroke={r.trendColor} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View all SLO compliance →</a>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">Error Budget Forecast (MTD)</h3>
                <p className="text-[11px] text-slate-500 mb-2">Forecast based on current burn rate</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-600 mb-1">
                  <span className="flex items-center gap-1.5"><span className="h-px w-3 bg-blue-500" /> Actual Burn</span>
                  <span className="flex items-center gap-1.5"><span className="h-px w-3 border-t border-dashed border-blue-400" /> Forecast</span>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <ReferenceLine y={100} stroke="hsl(0 84% 60%)" strokeDasharray="2 2" label={{ value: "Critical (100%)", position: "right", fontSize: 9, fill: "hsl(0 84% 60%)" }} />
                      <ReferenceLine y={50} stroke="hsl(38 92% 50%)" strokeDasharray="2 2" label={{ value: "Warning (50%)", position: "right", fontSize: 9, fill: "hsl(38 92% 50%)" }} />
                      <Line type="monotone" dataKey="actual" stroke="hsl(217 91% 60%)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                      <Line type="monotone" dataKey="forecast" stroke="hsl(217 91% 60%)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[11px] text-slate-600 mt-2">Projected to use 78% of error budget by May 31</div>
                <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">View forecast details →</a>
              </div>
            </div>
          </div>

          {/* RIGHT side column */}
          <div className="xl:col-span-3 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                      </div>
                    </div>
                  );
                })}
                <a className="block text-center text-[11px] text-blue-600 font-medium pt-1 cursor-pointer">View full insights →</a>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                      <button className="text-[10px] border border-slate-200 rounded-md px-2 py-1 text-slate-700 hover:bg-slate-50 shrink-0">{r.action}</button>
                    </div>
                  );
                })}
                <a className="block text-center text-[11px] text-blue-600 font-medium pt-1 cursor-pointer">View all recommended actions →</a>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">SLO Compliance Summary</h3>
              <div className="flex items-center gap-3 mt-2">
                <div className="relative h-28 w-28 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sloSummary} dataKey="value" innerRadius={32} outerRadius={50} paddingAngle={2}>
                        {sloSummary.map((s) => <Cell key={s.name} fill={s.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-base font-bold text-slate-900">96.2%</div>
                    <div className="text-[9px] text-slate-500">SLO Compliance</div>
                  </div>
                </div>
                <div className="flex-1 space-y-1 text-[11px]">
                  {sloSummary.map((s) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-sm" style={{ background: s.color }} /> {s.name}</span>
                      <span className="text-slate-700">{s.value} <span className="text-slate-400">{s.pct}</span></span>
                    </div>
                  ))}
                </div>
              </div>
              <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">View SLO dashboard →</a>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Error Budget Status Summary</h3>
              <div className="flex items-center gap-3 mt-2">
                <div className="relative h-28 w-28 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={ebSummary} dataKey="value" innerRadius={32} outerRadius={50} paddingAngle={2}>
                        {ebSummary.map((s) => <Cell key={s.name} fill={s.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-base font-bold text-slate-900">28%</div>
                    <div className="text-[9px] text-slate-500">Budget Burn</div>
                  </div>
                </div>
                <div className="flex-1 space-y-1 text-[11px]">
                  {ebSummary.map((s) => (
                    <div key={s.name} className="flex items-center justify-between gap-1">
                      <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-sm" style={{ background: s.color }} /> {s.name}</span>
                      <span className="text-slate-700 text-[10px]">{s.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
              <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">View full error budgets →</a>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}