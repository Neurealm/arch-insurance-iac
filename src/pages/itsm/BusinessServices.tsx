import { AppShell } from "@/components/eoc/AppShell";
import {
  Grid3x3, ShieldCheck, AlertTriangle, AlertOctagon,
  DollarSign, Eye, Users, Lightbulb, ShieldAlert, Smile, Activity, FlaskConical, Database,
  Network, ShoppingCart, Factory, Award, Banknote, MoreHorizontal, ArrowRight, Sparkles,
  Wrench, TrendingUp, Wallet,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { DashboardToolbar, useDashboardFilters } from "@/components/dashboard/DashboardToolbar";

/* ---------- Header ---------- */
function PageHeader() {
  const { range, setRange, autoRefresh, setAutoRefresh, selectedFilters, setSelectedFilters } = useDashboardFilters();
  const filterGroups = [
    { key: "domain", label: "Service Domain", options: ["Lab Systems", "Manufacturing", "Commerce", "Finance", "HR"] },
    { key: "criticality", label: "Criticality", options: ["Tier 1", "Tier 2", "Tier 3"] },
    { key: "health", label: "Health", options: ["Healthy", "Degraded", "At Risk", "Down"] },
  ];
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
          Business Services <span className="text-slate-700">(Service Portfolio &amp; Health)</span>
        </h1>
        <p className="text-sm italic text-slate-600 mt-1">
          Real-time health and performance of business services that power laboratory innovations.
        </p>
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
  );
}

/* ---------- About + KPIs row ---------- */
function AboutCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm h-full">
      <h3 className="text-sm font-bold text-slate-900 mb-2">About This View</h3>
      <div className="space-y-3 text-[12px] text-slate-700 leading-snug">
        <div>
          <div className="font-semibold text-slate-900">What is this?</div>
          A real-time portfolio view of all business services along with their health, performance,
          SLA performance, and business impact.
        </div>
        <div>
          <div className="font-semibold text-slate-900">Who is it for?</div>
          CIOs, CTO, Operations Leaders, Service Owners, and Business Stakeholders.
        </div>
        <div>
          <div className="font-semibold text-slate-900">What should I do with it?</div>
          <ul className="mt-1 space-y-1.5">
            <li className="flex items-start gap-2"><Eye className="h-3.5 w-3.5 text-blue-600 mt-0.5" /> Monitor overall service health and performance.</li>
            <li className="flex items-start gap-2"><AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5" /> Identify services at risk of impacting business.</li>
            <li className="flex items-start gap-2"><Lightbulb className="h-3.5 w-3.5 text-violet-600 mt-0.5" /> Identify revenue and operational impact of degraded services.</li>
            <li className="flex items-start gap-2"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600 mt-0.5" /> Take action on recommendations to prevent incidents and improve outcomes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const kpis = [
  { label: "Total Business Services", value: "28", sub: "28 services", icon: Grid3x3, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Healthy Services", value: "20", sub: "71% of total", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "At Risk Services", value: "6", sub: "21% of total", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Critical Services", value: "2", sub: "7% of total", icon: AlertOctagon, color: "text-red-600", bg: "bg-red-50" },
  { label: "Services Supporting Revenue", value: "$2.48M", sub: "Revenue at Risk", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50" },
];

function KpiTile({ k }: { k: typeof kpis[number] }) {
  const Icon = k.icon;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm h-full">
      <div className="flex items-start justify-between h-full">
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-slate-500">{k.label}</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{k.value}</div>
          <div className="text-[11px] text-slate-500 mt-1">{k.sub}</div>
        </div>
        <div className={`h-9 w-9 rounded-lg ${k.bg} ${k.color} grid place-items-center shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Donut + trend + impact ---------- */
const donutData = [
  { name: "Healthy", value: 20, color: "hsl(142 71% 45%)" },
  { name: "At Risk", value: 4, color: "hsl(38 92% 50%)" },
  { name: "Critical", value: 2, color: "hsl(0 84% 60%)" },
  { name: "Unknown", value: 2, color: "hsl(215 16% 65%)" },
];

function HealthOverview() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-2">Business Service Health Overview</h3>
      <div className="flex items-center gap-3">
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={donutData} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={2}>
                {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">28</div>
              <div className="text-[10px] text-slate-500">Total Services</div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2 text-xs">
          {donutData.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
              <span className="flex-1 text-slate-700">{d.name}</span>
              <span className="font-semibold text-slate-900">{d.value}</span>
              <span className="text-slate-500 w-10 text-right">
                ({Math.round((d.value / 28) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
      <a className="mt-3 block text-xs text-blue-600 font-medium text-center cursor-pointer">View health trend →</a>
    </div>
  );
}

const trendData = [
  { d: "Apr 20", Healthy: 75, "At Risk": 22, Critical: 6 },
  { d: "Apr 27", Healthy: 78, "At Risk": 20, Critical: 5 },
  { d: "May 5", Healthy: 76, "At Risk": 24, Critical: 7 },
  { d: "May 12", Healthy: 73, "At Risk": 27, Critical: 9 },
  { d: "May 19", Healthy: 71, "At Risk": 22, Critical: 7 },
  { d: "May 31", Healthy: 71, "At Risk": 21, Critical: 7 },
];

function HealthTrend() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Service Health Trend <span className="text-slate-500 font-medium">(Last 30 Days)</span></h3>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Healthy</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />At Risk</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Critical</span>
        </div>
      </div>
      <div className="h-44 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
            <XAxis dataKey="d" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip />
            <Line type="monotone" dataKey="Healthy" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="At Risk" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Critical" stroke="hsl(0 84% 60%)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <a className="mt-1 block text-xs text-blue-600 font-medium text-center cursor-pointer">View full trend analysis →</a>
    </div>
  );
}

const impactRows = [
  { level: "Critical", color: "bg-red-500", services: 2, bar: 92, revenue: "$1.29M" },
  { level: "High", color: "bg-amber-500", services: 6, bar: 60, revenue: "$420K" },
  { level: "Medium", color: "bg-yellow-400", services: 10, bar: 35, revenue: "$120K" },
  { level: "Low", color: "bg-emerald-500", services: 10, bar: 18, revenue: "$50K" },
];

function ImpactBySvc() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Business Impact by Service</h3>
      <div className="grid grid-cols-12 gap-2 text-[11px] text-slate-500 font-medium border-b border-slate-100 pb-1.5 mb-2">
        <div className="col-span-3">Impact Level</div>
        <div className="col-span-2 text-right">Services</div>
        <div className="col-span-5">Bar</div>
        <div className="col-span-2 text-right">Revenue at Risk</div>
      </div>
      {impactRows.map((r) => (
        <div key={r.level} className="grid grid-cols-12 gap-2 items-center py-1.5 text-xs">
          <div className="col-span-3 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-sm ${r.color}`} />
            <span className="text-slate-800 font-medium">{r.level}</span>
          </div>
          <div className="col-span-2 text-right text-slate-900 font-semibold">{r.services}</div>
          <div className="col-span-5">
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full ${r.color}`} style={{ width: `${r.bar}%` }} />
            </div>
          </div>
          <div className="col-span-2 text-right text-slate-900 font-semibold">{r.revenue}</div>
        </div>
      ))}
      <div className="grid grid-cols-12 gap-2 items-center pt-2 mt-1 border-t border-slate-100 text-xs">
        <div className="col-span-3 font-bold text-slate-900">Total</div>
        <div className="col-span-2 text-right font-bold text-slate-900">28</div>
        <div className="col-span-5" />
        <div className="col-span-2 text-right font-bold text-slate-900">$2.48M</div>
      </div>
      <a className="mt-3 block text-xs text-blue-600 font-medium text-center cursor-pointer">View business impact analysis →</a>
    </div>
  );
}

/* ---------- Right column ---------- */
function ExecutiveInsights() {
  const items = [
    { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", title: "Revenue at Risk", body: "$2.48M in revenue is at risk due to issues in 6 services. Prioritize critical and high-impact services.", link: "View revenue impact analysis" },
    { icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50", title: "SLA Performance Decline", body: "SLA performance dropped 1.4% over the last 7 days. Laboratory services performing below target.", link: "View SLA performance" },
    { icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50", title: "Operational Efficiency", body: "MTTR improved 8% over the last 7 days. Continue driving automation and self-healing.", link: "View operational efficiency" },
    { icon: Smile, color: "text-violet-600", bg: "bg-violet-50", title: "Customer Experience", body: "Ensure SLA score in 8 U.K. focus on services impacting key customer journeys.", link: "View customer experience" },
  ];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Executive Insights</h3>
      <div className="space-y-3">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className="flex gap-2.5">
              <div className={`h-7 w-7 rounded-lg ${it.bg} ${it.color} grid place-items-center shrink-0`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900">{it.title}</div>
                <div className="text-[11px] text-slate-600 leading-snug mt-0.5">{it.body}</div>
                <a className="text-[11px] text-blue-600 font-medium cursor-pointer">{it.link} →</a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecommendedActions() {
  const items = [
    { icon: Wrench, title: "Stabilize At-Risk Services", body: "Address ERP & Connectivity Services issues.", cta: "View Now" },
    { icon: TrendingUp, title: "Improve SLA Performance", body: "Address 5 services missing SLA.", cta: "View Now" },
    { icon: AlertOctagon, title: "Review Upcoming Changes", body: "Identify revenue impact for next 7 days.", cta: "View Changes" },
    { icon: Wallet, title: "Optimize Cost & Utilization", body: "Identify under-used services and licenses.", cta: "View Report" },
  ];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Recommended Actions</h3>
      <div className="space-y-2.5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-white text-slate-700 border border-slate-200 grid place-items-center shrink-0">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-900">{it.title}</div>
                <div className="text-[11px] text-slate-600 leading-snug">{it.body}</div>
              </div>
              <button className="text-[10px] font-semibold border border-slate-200 bg-white rounded-md px-2 py-1 hover:bg-slate-50 shrink-0">
                {it.cta}
              </button>
            </div>
          );
        })}
      </div>
      <a className="mt-3 block text-xs text-blue-600 font-medium text-center cursor-pointer">View all recommended actions →</a>
    </div>
  );
}

function PortfolioOverview() {
  const items = [
    { icon: Banknote, label: "Total Annual IT Tenant", value: "$28.6M" },
    { icon: DollarSign, label: "Cost per Business Service", value: "$1.82M" },
    { icon: Sparkles, label: "Automation Coverage", value: "42%" },
    { icon: Smile, label: "Digital Experience Score (DXA)", value: "4.6 / 5" },
  ];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Service Portfolio Overview</h3>
      <div className="space-y-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Icon className="h-3.5 w-3.5 text-slate-500" />
                {it.label}
              </div>
              <div className="text-sm font-bold text-slate-900">{it.value}</div>
            </div>
          );
        })}
      </div>
      <a className="mt-3 block text-xs text-blue-600 font-medium text-center cursor-pointer">View portfolio report →</a>
    </div>
  );
}

/* ---------- Portfolio table ---------- */
type Row = {
  icon: any; iconColor: string; name: string; sub: string;
  capability: string; owner: string;
  health: "Healthy" | "At Risk" | "Critical";
  sla: string; mttr: string; incidents: number; changes: number; revenue: string;
  criticality: "Critical" | "High" | "Medium" | "Low";
};

const portfolio: Row[] = [
  { icon: FlaskConical, iconColor: "text-blue-600", name: "Laboratory Instrument Systems", sub: "ECL, IM, and Diagnostic Systems", capability: "Research & Development", owner: "Jane Thompson", health: "Healthy", sla: "98.3%", mttr: "32m", incidents: 1, changes: 5, revenue: "$1.20M", criticality: "Critical" },
  { icon: Database, iconColor: "text-violet-600", name: "Empower CDS Platform", sub: "Chromatography data informatics", capability: "Data & Informatics", owner: "Priya Devi", health: "Healthy", sla: "95.7%", mttr: "48m", incidents: 2, changes: 4, revenue: "$100K", criticality: "Critical" },
  { icon: Network, iconColor: "text-amber-600", name: "Connectivity Services Platform", sub: "Digital solutions & device monitoring", capability: "Customer Solutions", owner: "Michael Brown", health: "At Risk", sla: "93.2%", mttr: "1h 13m", incidents: 3, changes: 6, revenue: "$320K", criticality: "High" },
  { icon: ShoppingCart, iconColor: "text-amber-600", name: "Order Management System", sub: "Quoting, ordering & fulfillment", capability: "Sales & Commercial", owner: "Rebeca Johnson", health: "At Risk", sla: "98.6%", mttr: "1h 2m", incidents: 2, changes: 5, revenue: "$320K", criticality: "High" },
  { icon: Factory, iconColor: "text-emerald-600", name: "Manufacturing & MES", sub: "Manufacturing execution systems", capability: "Manufacturing", owner: "Devin Patel", health: "Healthy", sla: "98.6%", mttr: "93m", incidents: 1, changes: 4, revenue: "$200K", criticality: "High" },
  { icon: Award, iconColor: "text-amber-600", name: "Quality Management System", sub: "Data & compliance management", capability: "Quality & Experience", owner: "Laura Martinez", health: "At Risk", sla: "98.6%", mttr: "1h 10m", incidents: 2, changes: 2, revenue: "$160K", criticality: "Medium" },
  { icon: ShoppingCart, iconColor: "text-emerald-600", name: "Waters.com eCommerce", sub: "Online accounts & payment portal", capability: "Customer Experience", owner: "Sara Davis", health: "Healthy", sla: "98.6%", mttr: "20m", incidents: 0, changes: 2, revenue: "$100K", criticality: "Medium" },
  { icon: AlertOctagon, iconColor: "text-red-600", name: "Finance & ERP (Oracle)", sub: "Finance, procurement & supply chain", capability: "Finance & Operations", owner: "Kevin Patel", health: "Critical", sla: "96.8%", mttr: "1h 15m", incidents: 5, changes: 2, revenue: "$10K", criticality: "Critical" },
];

function HealthPill({ s }: { s: Row["health"] }) {
  const map = {
    Healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "At Risk": "bg-amber-50 text-amber-700 border-amber-200",
    Critical: "bg-red-50 text-red-700 border-red-200",
  } as const;
  return <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[s]}`}>{s}</span>;
}
function CritPill({ s }: { s: Row["criticality"] }) {
  const map = {
    Critical: "bg-red-50 text-red-700 border-red-200",
    High: "bg-amber-50 text-amber-700 border-amber-200",
    Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Low: "bg-slate-50 text-slate-700 border-slate-200",
  } as const;
  return <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[s]}`}>{s}</span>;
}

function MiniTrend({ color }: { color: string }) {
  const data = Array.from({ length: 12 }, (_, i) => ({ x: i, y: 50 + Math.sin(i / 1.5) * 18 + (i % 3) * 4 }));
  return (
    <div className="h-6 w-20">
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line type="monotone" dataKey="y" stroke={color} strokeWidth={1.6} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function PortfolioTable() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-900">Business Services Portfolio</h3>
        <p className="text-[11px] text-slate-500">Crosswalk of all business services and their current status</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] font-semibold uppercase text-slate-500 border-b border-slate-200">
              <th className="py-2 pr-3">Business Service</th>
              <th className="py-2 pr-3">Business Capability</th>
              <th className="py-2 pr-3">Service Owner</th>
              <th className="py-2 pr-3">Health</th>
              <th className="py-2 pr-3">SLA Achievement</th>
              <th className="py-2 pr-3">MTTR (hr)</th>
              <th className="py-2 pr-3">Open Incidents</th>
              <th className="py-2 pr-3">Changes (SR)</th>
              <th className="py-2 pr-3">Revenue Impact</th>
              <th className="py-2 pr-3">Criticality</th>
              <th className="py-2 pr-3">Trend</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((r) => {
              const Icon = r.icon;
              const trendColor =
                r.health === "Healthy" ? "hsl(142 71% 45%)" : r.health === "At Risk" ? "hsl(38 92% 50%)" : "hsl(0 84% 60%)";
              return (
                <tr key={r.name} className="border-b border-slate-100 hover:bg-slate-50/60">
                  <td className="py-2.5 pr-3">
                    <div className="flex items-start gap-2">
                      <Icon className={`h-4 w-4 mt-0.5 ${r.iconColor}`} />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900">{r.name}</div>
                        <div className="text-[10px] text-slate-500">{r.sub}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-slate-700">{r.capability}</td>
                  <td className="py-2.5 pr-3 text-slate-700">{r.owner}</td>
                  <td className="py-2.5 pr-3"><HealthPill s={r.health} /></td>
                  <td className="py-2.5 pr-3 text-slate-900 font-medium">{r.sla}</td>
                  <td className="py-2.5 pr-3 text-slate-700">{r.mttr}</td>
                  <td className="py-2.5 pr-3 text-slate-700">{r.incidents}</td>
                  <td className="py-2.5 pr-3 text-slate-700">{r.changes}</td>
                  <td className="py-2.5 pr-3 text-slate-900 font-medium">{r.revenue}</td>
                  <td className="py-2.5 pr-3"><CritPill s={r.criticality} /></td>
                  <td className="py-2.5 pr-3"><MiniTrend color={trendColor} /></td>
                  <td className="py-2.5 pr-3">
                    <button className="h-6 w-6 rounded grid place-items-center hover:bg-slate-100">
                      <MoreHorizontal className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
        <div>Showing 1 to 8 of 28 services</div>
        <a className="text-blue-600 font-medium cursor-pointer">View all business services →</a>
        <div className="flex items-center gap-1">
          <button className="h-6 w-6 grid place-items-center border border-slate-200 rounded">‹</button>
          <button className="h-6 w-6 grid place-items-center border border-slate-200 rounded bg-slate-900 text-white">1</button>
          <button className="h-6 w-6 grid place-items-center border border-slate-200 rounded">2</button>
          <button className="h-6 w-6 grid place-items-center border border-slate-200 rounded">3</button>
          <button className="h-6 w-6 grid place-items-center border border-slate-200 rounded">4</button>
          <button className="h-6 w-6 grid place-items-center border border-slate-200 rounded">›</button>
          <select className="ml-2 text-xs border border-slate-200 rounded px-1 py-0.5">
            <option>10 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* ---------- Dependency map ---------- */
function DepNode({ icon: Icon, color, title, status }: { icon: any; color: string; title: string; status: "Healthy" | "At Risk" | "Critical" }) {
  const ring = status === "Healthy" ? "border-emerald-300" : status === "At Risk" ? "border-amber-300" : "border-red-300";
  const tone = status === "Healthy" ? "text-emerald-600" : status === "At Risk" ? "text-amber-600" : "text-red-600";
  return (
    <div className={`rounded-xl border-2 ${ring} bg-white p-3 w-44 shadow-sm`}>
      <div className="flex items-start gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <div className="text-xs font-semibold text-slate-900 leading-snug">{title}</div>
      </div>
      <div className={`text-[10px] font-bold mt-2 ${tone}`}>{status}</div>
    </div>
  );
}

function DependencyMap() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900">Business Service Dependency Map</h3>
      <p className="text-[11px] text-slate-500 mb-4">Visualizing how services depend on each other</p>
      <div className="grid grid-cols-12 gap-3 items-start">
        <div className="col-span-2">
          <div className="text-[10px] font-bold uppercase text-slate-500 mb-2">Research & Development</div>
          <DepNode icon={FlaskConical} color="text-blue-600" title="Laboratory Instrument Systems" status="Critical" />
        </div>
        <div className="col-span-1 pt-12 text-slate-400"><ArrowRight className="h-4 w-4 mx-auto" /></div>
        <div className="col-span-2">
          <div className="text-[10px] font-bold uppercase text-slate-500 mb-2">Data & Informatics</div>
          <DepNode icon={Database} color="text-violet-600" title="Empower CDS Platform" status="Critical" />
        </div>
        <div className="col-span-1 pt-12 text-slate-400"><ArrowRight className="h-4 w-4 mx-auto" /></div>
        <div className="col-span-2">
          <div className="text-[10px] font-bold uppercase text-slate-500 mb-2">Customer Solutions</div>
          <DepNode icon={Network} color="text-amber-600" title="Connectivity Services Platform" status="At Risk" />
        </div>
        <div className="col-span-2 space-y-3">
          <div className="text-[10px] font-bold uppercase text-slate-500">Business Operations</div>
          <DepNode icon={ShoppingCart} color="text-amber-600" title="Order Management System" status="At Risk" />
          <DepNode icon={Factory} color="text-emerald-600" title="Manufacturing & MES" status="Healthy" />
        </div>
        <div className="col-span-2">
          <div className="text-[10px] font-bold uppercase text-slate-500 mb-2">Corporate Services</div>
          <DepNode icon={AlertOctagon} color="text-red-600" title="Finance & ERP (Oracle)" status="Critical" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3 text-[11px] text-slate-600">
          <span className="font-semibold text-slate-700">Dependency Health</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Healthy</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />At Risk</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Critical</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400" />Unknown</span>
        </div>
        <a className="text-xs text-blue-600 font-medium cursor-pointer">View full dependency map →</a>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function BusinessServices() {
  return (
    <AppShell>
      <main className="flex-1 px-6 py-5 bg-slate-50/50 animate-fade-in min-w-0">
        <PageHeader />

        <div className="grid grid-cols-12 gap-4 mb-4 items-stretch">
          <div className="col-span-12 lg:col-span-3">
            <AboutCard />
          </div>
          <div className="col-span-12 lg:col-span-9 grid grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
            {kpis.map((k) => <KpiTile key={k.label} k={k} />)}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-12 lg:col-span-9 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <HealthOverview />
            <HealthTrend />
            <ImpactBySvc />
          </div>
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <ExecutiveInsights />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-12 lg:col-span-9">
            <PortfolioTable />
          </div>
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <RecommendedActions />
            <PortfolioOverview />
          </div>
        </div>

        <DependencyMap />
      </main>
    </AppShell>
  );
}
