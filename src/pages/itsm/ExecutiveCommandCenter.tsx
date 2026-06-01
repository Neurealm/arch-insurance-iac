import { AppShell } from "@/components/eoc/AppShell";
import {
  Activity, AlertTriangle, Bell, ShieldCheck, TrendingUp, TrendingDown, DollarSign,
  Users, Smile, FileBarChart2, Settings, Cpu,
  AlertOctagon, Sparkles, Eye, ShieldAlert, HeartPulse, Workflow,
} from "lucide-react";
import { DashboardToolbar, useDashboardFilters, scaleNumber } from "@/components/dashboard/DashboardToolbar";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";

/* ---------- mini helpers ---------- */
const trend = (seed: number, n = 24, base = 50, amp = 10) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    y: base + Math.sin(i / 2.3 + seed) * amp + ((seed * 7 + i * 3) % 9),
  }));

function Spark({ data, stroke, fill }: { data: any[]; stroke: string; fill: string }) {
  const id = `sp-${stroke.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity={0.5} />
            <stop offset="100%" stopColor={fill} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="y" stroke={stroke} strokeWidth={1.8} fill={`url(#${id})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ---------- KPI tile ---------- */
type KPI = {
  label: string; value: string; sub: string; subTone: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>; iconBg: string; iconColor: string;
  spark: { stroke: string; fill: string };
};

const kpis: KPI[] = [
  { label: "Overall IT Health Score", value: "86 / 100", sub: "↑ 4.0% vs yesterday", subTone: "up", icon: HeartPulse, iconBg: "bg-blue-50", iconColor: "text-blue-600", spark: { stroke: "hsl(217 91% 60%)", fill: "hsl(217 91% 60%)" } },
  { label: "Business Services OK", value: "87%", sub: "↑ 9% vs yesterday", subTone: "up", icon: ShieldCheck, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", spark: { stroke: "hsl(142 71% 45%)", fill: "hsl(142 71% 45%)" } },
  { label: "Revenue at Risk", value: "$2.48M", sub: "↑ 43% vs yesterday", subTone: "down", icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-600", spark: { stroke: "hsl(0 84% 60%)", fill: "hsl(0 84% 60%)" } },
  { label: "Open Incidents", value: "18", sub: "↓ 6 vs yesterday", subTone: "up", icon: AlertOctagon, iconBg: "bg-amber-50", iconColor: "text-amber-600", spark: { stroke: "hsl(38 92% 50%)", fill: "hsl(38 92% 50%)" } },
  { label: "SLA Achievement", value: "94.6%", sub: "↑ 1.9% vs yesterday", subTone: "up", icon: Workflow, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", spark: { stroke: "hsl(142 71% 45%)", fill: "hsl(142 71% 45%)" } },
  { label: "Customer Satisfaction (XLA)", value: "4.6 / 5", sub: "↑ 6.2% vs yesterday", subTone: "up", icon: Smile, iconBg: "bg-violet-50", iconColor: "text-violet-600", spark: { stroke: "hsl(262 83% 58%)", fill: "hsl(262 83% 58%)" } },
];

const businessImpact = [
  { icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", label: "Revenue Impacted", value: "$2.48M", delta: "↓ 12%", deltaColor: "text-emerald-600" },
  { icon: Users, color: "text-blue-600", bg: "bg-blue-50", label: "Productivity Impacted", value: "18,429 hrs", delta: "↓ 2.2%", deltaColor: "text-emerald-600" },
  { icon: Smile, color: "text-violet-600", bg: "bg-violet-50", label: "Customers Impacted", value: "2,542", delta: "↓ 11%", deltaColor: "text-emerald-600" },
  { icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50", label: "Compliance Risk Events", value: "3", delta: "↑ 2", deltaColor: "text-red-600" },
  { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", label: "Operational Risk Score", value: "Medium", delta: "↑ High", deltaColor: "text-red-600" },
];

const servicesHealth = [
  { name: "Healthy", value: 35, pct: "60%", color: "hsl(142 71% 45%)" },
  { name: "At Risk", value: 16, pct: "28%", color: "hsl(38 92% 50%)" },
  { name: "Degraded", value: 4, pct: "7%", color: "hsl(28 90% 55%)" },
  { name: "Down",  value: 3, pct: "5%", color: "hsl(0 84% 60%)" },
];

const priorities = [
  { name: "Digital Transformation", pct: 86, color: "bg-emerald-500" },
  { name: "Operational Excellence", pct: 78, color: "bg-emerald-500" },
  { name: "Customer Experience",   pct: 79, color: "bg-emerald-500" },
  { name: "Security & Compliance", pct: 76, color: "bg-emerald-500" },
  { name: "Cost Optimization",     pct: 66, color: "bg-amber-500" },
];

const insights = [
  { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", title: "Revenue Impact Increase", body: "Revenue at risk increased 12% due to issues in Laboratory Instrument Systems.", link: "View impacted services →" },
  { icon: TrendingDown, color: "text-amber-600", bg: "bg-amber-50", title: "SLA Decline Trend", body: "SLA achievement down 1.6% over the last 7 days.", link: "View SLA performance →" },
  { icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", title: "Security Status", body: "3 high-priority security events require executive attention.", link: "View risk dashboard →" },
  { icon: Smile, color: "text-violet-600", bg: "bg-violet-50", title: "Customer Experience", body: "Customer satisfaction remains strong at 4.6 / 5.", link: "View customer experience →" },
];

const recommended = [
  { icon: Users, color: "text-red-600", bg: "bg-red-50", title: "Review Revenue Impact", body: "Investigate root cause of issues in high-impact services.", action: "Review Now" },
  { icon: Workflow, color: "text-blue-600", bg: "bg-blue-50", title: "Approve Change", body: "Critical change CAB-2026-105 requires approval.", action: "Review Change" },
  { icon: Sparkles, color: "text-violet-600", bg: "bg-violet-50", title: "Resource Reassignment", body: "Additional resources recommended for Service Desk.", action: "New Recommendation" },
  { icon: Bell, color: "text-amber-600", bg: "bg-amber-50", title: "Security Alerts", body: "Queue up and respond to open security alerts.", action: "Review Alerts" },
];

const incidentsBuckets = [
  { label: "Global (P1)", value: 3, delta: "↑ 1", deltaColor: "text-red-600", color: "bg-red-500" },
  { label: "High (P2)",   value: 15, delta: "↓ 2", deltaColor: "text-emerald-600", color: "bg-amber-500" },
  { label: "Medium (P3)", value: 22, delta: "↓ 5", deltaColor: "text-emerald-600", color: "bg-amber-400" },
  { label: "Low (P4)",    value: 28, delta: "↓ 3", deltaColor: "text-emerald-600", color: "bg-emerald-500" },
];

const activity = [
  { activity: "Revenue Impact Alert",     type: "Impact",      time: "11:18 AM", status: "New",        statusColor: "bg-red-50 text-red-700 border-red-200" },
  { activity: "SLA Threshold Breach",     type: "Performance", time: "8:47 AM",  status: "New",        statusColor: "bg-red-50 text-red-700 border-red-200" },
  { activity: "Security Incident",        type: "Risk",        time: "6:35 AM",  status: "In Progress",statusColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { activity: "Major Incident Declared",  type: "Incident",    time: "7:23 AM",  status: "Resolved",   statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { activity: "Change Approval",          type: "Change",      time: "7:22 AM",  status: "Approved",   statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

/* ---------- Page ---------- */
export default function ExecutiveCommandCenter() {
  const { range, setRange, autoRefresh, setAutoRefresh, selectedFilters, setSelectedFilters, scale } = useDashboardFilters();
  const filterGroups = [
    { key: "persona", label: "Persona", options: ["CEO", "CIO", "CTO", "CFO", "CHRO"] },
    { key: "domain", label: "Domain", options: ["Infrastructure", "Applications", "Security", "Network"] },
    { key: "severity", label: "Severity", options: ["Critical", "High", "Medium", "Low"] },
  ];
  const dynamicKpis = kpis.map((k) => {
    if (k.label === "Revenue at Risk") return { ...k, value: `$${(2.48 * scale).toFixed(2)}M` };
    if (k.label === "Open Incidents") return { ...k, value: String(scaleNumber(18, scale)) };
    if (k.label === "Overall IT Health Score") return { ...k, value: `${Math.max(60, Math.min(99, Math.round(86 / Math.max(0.85, scale * 0.85))))} / 100` };
    return k;
  });
  return (
    <AppShell>
      <main className="flex-1 px-6 py-5 bg-slate-50/60 animate-fade-in min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">Executive Command Center</h1>
            <p className="text-sm text-slate-600 mt-1">Real-time view of IT service health, business impact, and operational performance.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <DashboardToolbar
              range={range}
              onRangeChange={setRange}
              autoRefresh={autoRefresh}
              onAutoRefreshChange={setAutoRefresh}
              filters={filterGroups}
              selectedFilters={selectedFilters}
              onFiltersChange={setSelectedFilters}
            />
            <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              <FileBarChart2 className="h-3.5 w-3.5 mr-1.5" /> Report
            </Button>
          </div>
        </div>

        {/* Top: Intro + KPIs */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-4">
          {/* Intro card */}
          <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3">Executive Command Center</h3>
            <div className="space-y-3 text-[12px] text-slate-700 leading-relaxed">
              <div>
                <div className="font-semibold text-slate-900 mb-1">Provides</div>
                Provides C-suite leaders with a real-time, high-level view of IT performance, risk, and business impact to drive confident, data-informed decisions.
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-1">Who It's For</div>
                CEO, CIO, CTO, CHRO, CFO, and other executive stakeholders.
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-1">What to Do with This Information</div>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Identify risks impacting services, operations, or experience.</li>
                  <li>Prioritize investments and continuous improvement.</li>
                  <li>Track progress against strategic goals and SLAs.</li>
                  <li>Drive accountability and improve business outcomes.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* KPI cards grid */}
          <div className="xl:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-3">
            {dynamicKpis.map((k) => {
              const Icon = k.icon;
              return (
                <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-slate-500 truncate">{k.label}</div>
                      <div className="text-2xl font-bold text-slate-900 leading-tight">{k.value}</div>
                    </div>
                    <div className={`h-8 w-8 rounded-lg ${k.iconBg} ${k.iconColor} grid place-items-center shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className={`text-[11px] mt-1 ${k.subTone === "down" ? "text-red-600" : "text-emerald-600"}`}>{k.sub}</div>
                  <Spark data={trend(k.label.length, 24)} stroke={k.spark.stroke} fill={k.spark.fill} />
                </div>
              );
            })}
          </div>

          {/* Top Executive Insights */}
          <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Top Executive Insights</h3>
            <div className="space-y-3">
              {insights.map((i) => {
                const Icon = i.icon;
                return (
                  <div key={i.title} className="flex gap-2.5">
                    <div className={`h-7 w-7 rounded-lg ${i.bg} ${i.color} grid place-items-center shrink-0`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-slate-900">{i.title}</div>
                      <div className="text-[11px] text-slate-600 leading-snug">{i.body}</div>
                      <a className="text-[11px] text-blue-600 font-medium cursor-pointer">{i.link}</a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle: Impact / Health / Priorities + Recommended Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-4">
          {/* Business Impact */}
          <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">Business Impact Overview</h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">IT performance impact on key business KPIs (last 7 days)</p>
            <div className="space-y-2.5">
              {businessImpact.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.label} className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg ${b.bg} ${b.color} grid place-items-center shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-slate-600 truncate">{b.label}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{b.value}</div>
                      <div className={`text-[10px] font-medium ${b.deltaColor}`}>{b.delta}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View full business impact analysis →</a>
          </div>

          {/* Services Health donut */}
          <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Business Services Health</h3>
            <p className="text-[11px] text-slate-500 mb-2">Health status of critical business services</p>
            <div className="relative h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={servicesHealth} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {servicesHealth.map((s) => <Cell key={s.name} fill={s.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-2xl font-bold text-slate-900">58</div>
                <div className="text-[10px] text-slate-500">Total Services</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-[11px]">
              {servicesHealth.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-sm" style={{ background: s.color }} /> {s.name}</span>
                  <span className="text-slate-600">{s.value} <span className="text-slate-400">({s.pct})</span></span>
                </div>
              ))}
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">View all business services →</a>
          </div>

          {/* Strategic Priorities */}
          <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Strategic Priorities Progress</h3>
            <p className="text-[11px] text-slate-500 mb-3">Progress against strategic objectives</p>
            <div className="space-y-3">
              {priorities.map((p) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-700">{p.name}</span>
                    <span className="font-semibold text-slate-900">{p.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View strategic initiatives →</a>
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
                      <div className="text-[12px] font-semibold text-slate-900">{r.title}</div>
                      <div className="text-[11px] text-slate-600 leading-snug">{r.body}</div>
                    </div>
                    <button className="text-[10px] font-medium border border-slate-200 rounded-md px-2 py-1 text-slate-700 hover:bg-slate-50 shrink-0">{r.action}</button>
                  </div>
                );
              })}
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View all recommended actions →</a>
          </div>
        </div>

        {/* Operational metrics row */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-4">
          {/* Incidents & Alerts */}
          <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">Incidents & Alerts Overview</h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">Real-time operational status</p>
            <div className="space-y-2">
              {incidentsBuckets.map((b) => (
                <div key={b.label} className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-sm ${b.color}`} />
                  <span className="text-[12px] text-slate-700 flex-1">{b.label}</span>
                  <span className="text-sm font-bold text-slate-900 w-8 text-right">{b.value}</span>
                  <span className={`text-[10px] font-medium w-8 text-right ${b.deltaColor}`}>{b.delta}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-2 mt-2 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-slate-900">Total Open</span>
                <span className="text-sm font-bold text-slate-900">78</span>
                <span className="text-[10px] font-medium text-emerald-600">↓ 9</span>
              </div>
            </div>
          </div>

          {/* MTTR */}
          <MetricBlock title="MTTR Performance (All Incidents)" sub="Mean Time to Resolve" big="1h 28m" delta="↓ 15m vs yesterday" deltaColor="text-emerald-600" target="Target: ≤ 2h" stroke="hsl(217 91% 60%)" fill="hsl(217 91% 60%)" link="View MTTR trends →" />
          {/* Change Success */}
          <MetricBlock title="Change Success Rate" sub="Last 30 Days" big="96.1%" delta="↑ 2.4% vs last 30 days" deltaColor="text-emerald-600" target="Target: ≥ 95%" stroke="hsl(142 71% 45%)" fill="hsl(142 71% 45%)" link="View change performance →" />
          {/* Cost */}
          <MetricBlock title="Cost of IT Operations" sub="Month to Date" big="$4.32M" delta="↓ 3.2% vs last month" deltaColor="text-emerald-600" target="Budget: $4.50M" stroke="hsl(262 83% 58%)" fill="hsl(262 83% 58%)" link="View cost analysis →" />
        </div>

        {/* Bottom: Service Map + Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Service Impact Map */}
          <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Business Service Impact Map</h3>
            <p className="text-[11px] text-slate-500 mb-3">Visualize service health and business impact</p>

            <div className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-2 space-y-2 text-[11px]">
                <LegendItem color="bg-emerald-500" label="Healthy" />
                <LegendItem color="bg-amber-400"   label="At Risk" />
                <LegendItem color="bg-orange-500"  label="Degraded" />
                <LegendItem color="bg-red-500"     label="Down" />
              </div>

              <div className="col-span-7 grid grid-cols-3 gap-3">
                <ServiceNode name="Laboratory Research Systems" status="Healthy" tone="emerald" />
                <ServiceNode name="Analytical Data Platform"    status="Healthy" tone="emerald" />
                <ServiceNode name="External Services Integration" status="At Risk" tone="amber" />

                <ServiceNode name="Manufacturing & MES"         status="At Risk" tone="amber" />
                <ServiceNode name="Order Management System"     status="Healthy" tone="emerald" />
                <ServiceNode name="Customer & Partner Services" status="Healthy" tone="emerald" />

                <ServiceNode name="Finance & ERP"               status="Healthy" tone="emerald" />
                <ServiceNode name="Supply Chain Management"     status="Healthy" tone="emerald" />
                <ServiceNode name="Corporate Applications"      status="Healthy" tone="emerald" />
              </div>

              <div className="col-span-3 space-y-2 text-[11px]">
                <div className="text-[11px] font-semibold text-slate-900 mb-1">Dependencies Legend</div>
                <DepRow icon={AlertOctagon} color="text-red-600"   title="High Impact"   body="Service failure makes business operations impossible" />
                <DepRow icon={AlertTriangle} color="text-amber-600" title="Medium Impact" body="Service degradation affects performance or experience" />
                <DepRow icon={Eye} color="text-blue-600"            title="Low Impact"    body="Minor issues with minimal business impact" />
              </div>
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View full dependency map →</a>
          </div>

          {/* Recent Executive Activity */}
          <div className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Executive Activity</h3>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2 font-semibold">Activity</th>
                  <th className="py-2 font-semibold">Type</th>
                  <th className="py-2 font-semibold">Time</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((a) => (
                  <tr key={a.activity} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 text-slate-800">{a.activity}</td>
                    <td className="py-2 text-slate-600">{a.type}</td>
                    <td className="py-2 text-slate-600">{a.time}</td>
                    <td className="py-2">
                      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${a.statusColor}`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View all executive activity →</a>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 mt-4 flex items-center gap-4">
          <span>All times in EDT</span>
          <span>Data refreshes every 30 seconds</span>
          <span>Sources: ITSM, Monitoring, Financial Systems, Security Tools</span>
        </div>
      </main>
    </AppShell>
  );
}

/* ---------- subcomponents ---------- */
function MetricBlock({ title, sub, big, delta, deltaColor, target, stroke, fill, link }: {
  title: string; sub: string; big: string; delta: string; deltaColor: string; target: string; stroke: string; fill: string; link: string;
}) {
  return (
    <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="text-[11px] text-slate-500 mb-2">{sub}</p>
      <div className="text-3xl font-bold text-slate-900">{big}</div>
      <div className={`text-[11px] mt-0.5 ${deltaColor}`}>{delta}</div>
      <div className="h-12 mt-2">
        <Spark data={trend(title.length, 24, 50, 8)} stroke={stroke} fill={fill} />
      </div>
      <div className="text-[10px] text-slate-500 mt-1">{target}</div>
      <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">{link}</a>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return <div className="flex items-center gap-2 text-slate-700"><span className={`h-2.5 w-2.5 rounded-sm ${color}`} /> {label}</div>;
}

function ServiceNode({ name, status, tone }: { name: string; status: string; tone: "emerald" | "amber" | "orange" | "red" }) {
  const tones = {
    emerald: "bg-emerald-50 border-emerald-300 text-emerald-800",
    amber:   "bg-amber-50 border-amber-300 text-amber-800",
    orange:  "bg-orange-50 border-orange-300 text-orange-800",
    red:     "bg-red-50 border-red-300 text-red-800",
  } as const;
  const dot = {
    emerald: "bg-emerald-500",
    amber:   "bg-amber-500",
    orange:  "bg-orange-500",
    red:     "bg-red-500",
  } as const;
  return (
    <div className={`rounded-lg border-2 ${tones[tone]} p-2 text-center`}>
      <div className="text-[11px] font-semibold leading-tight">{name}</div>
      <div className="flex items-center justify-center gap-1.5 mt-1">
        <span className={`h-1.5 w-1.5 rounded-full ${dot[tone]}`} />
        <span className="text-[10px] font-medium">{status}</span>
      </div>
    </div>
  );
}

function DepRow({ icon: Icon, color, title, body }: { icon: React.ComponentType<{ className?: string }>; color: string; title: string; body: string }) {
  return (
    <div className="flex gap-2 items-start">
      <Icon className={`h-3.5 w-3.5 ${color} shrink-0 mt-0.5`} />
      <div>
        <div className="font-semibold text-slate-900 text-[11px]">{title}</div>
        <div className="text-[10px] text-slate-600 leading-snug">{body}</div>
      </div>
    </div>
  );
}