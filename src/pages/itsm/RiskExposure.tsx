import { AppShell } from "@/components/eoc/AppShell";
import {
  ShieldCheck, AlertTriangle, DollarSign, Calendar,
  ShieldAlert, Sparkles, TrendingUp, AlertOctagon, Users, Activity, FileWarning,
  Server, Database, Network, Settings, Cloud, Wrench,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, Tooltip, XAxis, YAxis, CartesianGrid, ZAxis,
} from "recharts";
import { DashboardToolbar, useDashboardFilters, scaleNumber } from "@/components/dashboard/DashboardToolbar";

const trend = (seed: number, n = 18, base = 50, amp = 8) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    y: base + Math.sin(i / 2.1 + seed) * amp + ((seed * 7 + i * 3) % 7),
  }));

function Spark({ data, stroke, fill }: { data: any[]; stroke: string; fill: string }) {
  const id = `re-sp-${stroke.replace(/[^a-z0-9]/gi, "")}`;
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
  { label: "Overall Risk Score", value: "72 / 100", sub: "↑ 6 pts vs yesterday", subTone: "down", note: "High Risk", noteColor: "text-red-600", icon: ShieldAlert, iconBg: "bg-red-50", iconColor: "text-red-600", spark: { stroke: "hsl(0 84% 60%)", fill: "hsl(0 84% 60%)" } },
  { label: "High & Critical Risks", value: "23", sub: "↑ 3 vs yesterday", subTone: "down", icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-600", spark: { stroke: "hsl(0 84% 60%)", fill: "hsl(0 84% 60%)" } },
  { label: "Operational Exposure", value: "$6.42M", sub: "↑ $1.37M vs yesterday", subTone: "down", icon: DollarSign, iconBg: "bg-red-50", iconColor: "text-red-600", spark: { stroke: "hsl(0 84% 60%)", fill: "hsl(0 84% 60%)" } },
  { label: "Critical Services at Risk", value: "7", sub: "↑ 1 vs yesterday", subTone: "down", icon: AlertOctagon, iconBg: "bg-amber-50", iconColor: "text-amber-600", spark: { stroke: "hsl(38 92% 50%)", fill: "hsl(38 92% 50%)" } },
  { label: "Open Major Incidents", value: "3", sub: "— vs yesterday", subTone: "neutral", icon: Calendar, iconBg: "bg-amber-50", iconColor: "text-amber-600", spark: { stroke: "hsl(38 92% 50%)", fill: "hsl(38 92% 50%)" } },
  { label: "Risk Acceptance Exceptions", value: "4", sub: "↑ 1 vs yesterday", subTone: "down", icon: Sparkles, iconBg: "bg-violet-50", iconColor: "text-violet-600", spark: { stroke: "hsl(262 83% 58%)", fill: "hsl(262 83% 58%)" } },
  { label: "Mean Time to Detect (Risk)", value: "23m", sub: "↓ 5m vs yesterday", subTone: "up", icon: ShieldCheck, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", spark: { stroke: "hsl(142 71% 45%)", fill: "hsl(142 71% 45%)" } },
];

// Heat map bubbles: x=likelihood (1-5), y=impact (1-5), z=count
const heatBubbles = [
  { x: 4, y: 5, z: 700, label: "7" },
  { x: 5, y: 5, z: 200, label: "1" },
  { x: 4.4, y: 4.6, z: 300, label: "2" },
  { x: 2.5, y: 4, z: 500, label: "5" },
  { x: 3, y: 3.5, z: 1000, label: "10" },
  { x: 3.4, y: 3.8, z: 100, label: "0" },
  { x: 4.3, y: 2.9, z: 200, label: "1" },
  { x: 2.6, y: 2.1, z: 200, label: "2" },
  { x: 1.6, y: 1.8, z: 600, label: "6" },
  { x: 3.2, y: 1.6, z: 300, label: "3" },
];

const topRisks = [
  { n: 1, name: "Instrument System Outages", score: 92, up: true, color: "text-red-600" },
  { n: 2, name: "Cybersecurity Breach", score: 80, up: true, color: "text-red-600" },
  { n: 3, name: "Third Party Service Failure", score: 75, up: true, color: "text-amber-600" },
  { n: 4, name: "Data Loss / Corruption", score: 75, up: true, color: "text-amber-600" },
  { n: 5, name: "Change Failure", score: 70, up: false, color: "text-amber-600" },
  { n: 6, name: "Capacity Exhaustion", score: 65, up: false, color: "text-amber-600" },
  { n: 7, name: "Cloud Provider Outage", score: 52, up: true, color: "text-amber-600" },
  { n: 8, name: "Endpoint Vulnerability", score: 58, up: false, color: "text-amber-600" },
];

const exposureCats = [
  { name: "Technology & Infrastructure", value: 2.42, label: "$2.42M (38%)", color: "hsl(0 84% 60%)" },
  { name: "Cybersecurity", value: 1.62, label: "$1.62M (22%)", color: "hsl(20 90% 55%)" },
  { name: "Third Party & Supply Chain", value: 1.90, label: "$1.90M (22%)", color: "hsl(38 92% 50%)" },
  { name: "People & Process", value: 0.44, label: "$0.44M (12%)", color: "hsl(142 71% 45%)" },
  { name: "Physical & Environmental", value: 0.40, label: "$0.40M (9%)", color: "hsl(262 83% 58%)" },
];

const opRisk = [
  { service: "Laboratory Instrument Systems", score: 82, scoreColor: "text-red-600", exposure: "$1.48M", trendColor: "hsl(0 84% 60%)", drivers: 3 },
  { service: "Enterprise Platform Services", score: 75, scoreColor: "text-amber-600", exposure: "$1.12M", trendColor: "hsl(0 84% 60%)", drivers: 3 },
  { service: "Empower CDS Platform", score: 75, scoreColor: "text-amber-600", exposure: "$1.38M", trendColor: "hsl(0 84% 60%)", drivers: 3 },
  { service: "Order Management System", score: 68, scoreColor: "text-amber-600", exposure: "$0.59M", trendColor: "hsl(38 92% 50%)", drivers: 2 },
  { service: "Manufacturing & MES", score: 65, scoreColor: "text-amber-600", exposure: "$0.65M", trendColor: "hsl(38 92% 50%)", drivers: 2 },
  { service: "Finance & ERP (Oracle)", score: 60, scoreColor: "text-amber-600", exposure: "$0.65M", trendColor: "hsl(142 71% 45%)", drivers: 1 },
  { service: "Digital Commerce Portal", score: 58, scoreColor: "text-slate-700", exposure: "$0.41M", trendColor: "hsl(215 16% 60%)", drivers: 1 },
  { service: "Customer Support Portal", score: 58, scoreColor: "text-slate-700", exposure: "$0.45M", trendColor: "hsl(215 16% 60%)", drivers: 1 },
];

const riskDrivers = [
  { icon: Server, name: "System Vulnerabilities", risks: 15, up: true, impact: "$2.18M" },
  { icon: Settings, name: "Configuration Drift", risks: 9, up: true, impact: "$1.55M" },
  { icon: Database, name: "Third Party Dependencies", risks: 5, up: true, impact: "$1.09M" },
  { icon: Activity, name: "Capacity Constraints", risks: 4, up: false, impact: "$0.74M" },
  { icon: Wrench, name: "Change Failures", risks: 5, up: true, impact: "$0.52M" },
  { icon: FileWarning, name: "Process Gaps", risks: 4, up: null, impact: "$0.31M" },
];

const riskTrend = [
  { day: "Apr 21", v: 55 }, { day: "Apr 28", v: 58 }, { day: "May 2", v: 56 },
  { day: "May 8", v: 60 }, { day: "May 13", v: 64 }, { day: "May 15", v: 72 }, { day: "May 20", v: 76 },
];

const insights = [
  { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", title: "High Operational Risk", body: "Operational risk remains high due to 7 critical services with open risks and 3 active major incidents." },
  { icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50", title: "Top Exposure Driver", body: "Technology & Infrastructure risks account for 38% of total business exposure." },
  { icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50", title: "Rising Risk Theme", body: "12 risks increased in score over the last 14 hours." },
  { icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", title: "Action Recommended", body: "Review and mitigate high impact risks to reduce $2.45M in potential exposure." },
];

const recommended = [
  { icon: Users, color: "text-red-600", bg: "bg-red-50", title: "Address Critical Risks", body: "17 critical risks require immediate attention.", action: "View Risks" },
  { icon: AlertOctagon, color: "text-amber-600", bg: "bg-amber-50", title: "Resolve Major Incidents", body: "3 major incidents are impacting services.", action: "View Incidents" },
  { icon: Wrench, color: "text-blue-600", bg: "bg-blue-50", title: "Review Change Calendar", body: "Upcoming changes may increase risk.", action: "View Calendar" },
  { icon: ShieldAlert, color: "text-violet-600", bg: "bg-violet-50", title: "Strengthen Vulnerabilities", body: "16 open and aging abilities need remediation.", action: "View Vulnerabilities" },
];

const critSummary = [
  { name: "Total Critical Devices", value: 24, color: "text-slate-700", bg: "bg-slate-100", icon: Users },
  { name: "At Risk", value: 7, color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle },
  { name: "Regraded", value: 9, color: "text-amber-600", bg: "bg-amber-50", icon: Activity },
  { name: "Healthy", value: 8, color: "text-emerald-600", bg: "bg-emerald-50", icon: ShieldCheck },
];

const regions = [
  { name: "North America", score: 95, exposure: "$2.44M", up: true, color: "text-red-600" },
  { name: "Europe", score: 77, exposure: "$1.75M", up: true, color: "text-red-600" },
  { name: "Asia Pacific", score: 65, exposure: "$1.15M", up: true, color: "text-amber-600" },
  { name: "Latin America", score: 95, exposure: "$0.58M", up: false, color: "text-amber-600" },
  { name: "Middle East & Africa", score: 42, exposure: "$0.30M", up: false, color: "text-amber-600" },
];

const events = [
  { event: "Major Change Window", date: "May 26, 3:00 PM", impact: "High", impactColor: "text-red-600", risk: "High", riskColor: "text-red-600" },
  { event: "Vendor Maintenance", date: "May 25, 10:00 PM", impact: "Medium", impactColor: "text-amber-600", risk: "Medium", riskColor: "text-amber-600" },
  { event: "Cloud Capacity Review", date: "May 28, 9:00 PM", impact: "Medium", impactColor: "text-amber-600", risk: "Medium", riskColor: "text-amber-600" },
  { event: "Security Patch Window", date: "May 26, 1:00 PM", impact: "High", impactColor: "text-red-600", risk: "High", riskColor: "text-red-600" },
  { event: "Quarterly Access Review", date: "May 27, 5:00 AM", impact: "Low", impactColor: "text-emerald-600", risk: "Low", riskColor: "text-emerald-600" },
];

const mitigation = [
  { name: "Mitigated", value: 62, label: "62% (66)", color: "hsl(142 71% 45%)" },
  { name: "In Progress", value: 22, label: "22% (13)", color: "hsl(38 92% 50%)" },
  { name: "Not Started", value: 16, label: "15% (5)", color: "hsl(0 84% 60%)" },
];

export default function RiskExposure() {
  const { range, setRange, autoRefresh, setAutoRefresh, selectedFilters, setSelectedFilters, scale } = useDashboardFilters();
  const filterGroups = [
    { key: "category", label: "Risk Category", options: exposureCats.map((c) => c.name) },
    { key: "region", label: "Region", options: regions.map((r) => r.name) },
    { key: "severity", label: "Severity", options: ["Critical", "High", "Medium", "Low"] },
  ];
  const filteredRegions = regions.filter((r) => selectedFilters.region?.length ? selectedFilters.region.includes(r.name) : true);
  const filteredOpRisk = opRisk.filter(() => true);
  const dynamicKpis = kpis.map((k) => {
    if (k.label === "Overall Risk Score") return { ...k, value: `${Math.min(100, Math.round(72 * (0.85 + scale * 0.1)))} / 100` };
    if (k.label === "High & Critical Risks") return { ...k, value: String(scaleNumber(23, scale)) };
    if (k.label === "Operational Exposure") return { ...k, value: `$${(6.42 * scale).toFixed(2)}M` };
    if (k.label === "Critical Services at Risk") return { ...k, value: String(Math.min(15, scaleNumber(7, scale * 0.9))) };
    if (k.label === "Open Major Incidents") return { ...k, value: String(scaleNumber(3, scale)) };
    return k;
  });
  return (
    <AppShell>
      <main className="flex-1 px-6 py-5 bg-slate-50/60 animate-fade-in min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">Risk &amp; Operational Exposure View</h1>
            <p className="text-sm text-slate-600 mt-1">Real-time view of risks, threats, and operational exposure that could impact business outcomes.</p>
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

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-4">
          {dynamicKpis.map((k) => {
            const Icon = k.icon;
            const subColor = k.subTone === "up" ? "text-emerald-600" : k.subTone === "down" ? "text-red-600" : "text-slate-500";
            return (
              <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-slate-500 leading-tight">{k.label}</div>
                    <div className="text-2xl font-bold text-slate-900 leading-tight mt-1">{k.value}</div>
                    {k.note && <div className={`text-[10px] font-semibold ${k.noteColor}`}>{k.note}</div>}
                  </div>
                  <div className={`h-8 w-8 rounded-lg ${k.iconBg} ${k.iconColor} grid place-items-center shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className={`text-[11px] mt-1 ${subColor}`}>{k.sub}</div>
                <Spark data={trend(k.label.length, 18)} stroke={k.spark.stroke} fill={k.spark.fill} />
              </div>
            );
          })}
        </div>

        {/* Row: Heat map / Top Risks / Exposure / Insights */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-4">
          {/* Heat map */}
          <div className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Risk Heat Map (Impact vs Likelihood)</h3>
            <p className="text-[11px] text-slate-500 mb-2">Bubble size represents business impact (in $)</p>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7">
                <div className="relative h-72 rounded-lg overflow-hidden border border-slate-200" style={{ background: "linear-gradient(135deg, hsl(142 71% 50%) 0%, hsl(60 90% 55%) 45%, hsl(20 90% 55%) 75%, hsl(0 84% 55%) 100%)" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
                      <XAxis type="number" dataKey="x" domain={[0, 6]} hide />
                      <YAxis type="number" dataKey="y" domain={[0, 6]} hide />
                      <ZAxis type="number" dataKey="z" range={[200, 1400]} />
                      <Scatter data={heatBubbles} fill="rgba(255,255,255,0.85)" stroke="rgba(0,0,0,0.15)">
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  {/* Bubble labels overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {heatBubbles.map((b, i) => (
                      <div key={i}
                        className="absolute text-[11px] font-bold text-slate-800"
                        style={{ left: `${(b.x / 6) * 100}%`, top: `${100 - (b.y / 6) * 100}%`, transform: "translate(-50%,-50%)" }}>
                        {b.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-1">
                  <span>Rare</span><span>Unlikely</span><span>Possible</span><span>Likely</span><span>Almost Certain</span>
                </div>
                <div className="text-center text-[10px] text-slate-500 mt-0.5">Likelihood</div>
              </div>
              <div className="col-span-5 flex flex-col">
                <div className="flex flex-col text-[10px] text-slate-500 justify-between h-72 pr-1">
                  <span>Critical</span><span>High</span><span>Medium</span><span>Low</span><span>Minimal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Risks list */}
          <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-medium text-slate-500">Top Risks</div>
              <div className="flex gap-3 text-[11px] font-medium text-slate-500"><span>Risk Score</span><span>Trend</span></div>
            </div>
            <div className="space-y-2">
              {topRisks.map((r) => (
                <div key={r.n} className="flex items-center gap-2 text-[12px]">
                  <span className={`h-5 w-5 rounded-full grid place-items-center text-[10px] font-bold text-white ${r.color === "text-red-600" ? "bg-red-500" : "bg-amber-500"}`}>{r.n}</span>
                  <span className="flex-1 text-slate-800 truncate">{r.name}</span>
                  <span className={`font-semibold ${r.color} w-8 text-right`}>{r.score}</span>
                  <span className={`w-6 text-right ${r.up ? "text-red-500" : "text-emerald-500"}`}>{r.up ? "↑" : "↓"}</span>
                </div>
              ))}
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View all risks →</a>
          </div>

          {/* Exposure by category */}
          <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Risk Exposure by Category</h3>
            <div className="relative h-40 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={exposureCats} dataKey="value" innerRadius={42} outerRadius={62} paddingAngle={2}>
                    {exposureCats.map((c) => <Cell key={c.name} fill={c.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-base font-bold text-slate-900">$6.42M</div>
                <div className="text-[9px] text-slate-500">Total Exposure</div>
              </div>
            </div>
            <div className="space-y-1 mt-1 text-[10px]">
              {exposureCats.map((c) => (
                <div key={c.name} className="flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1 text-slate-700 truncate"><span className="h-2 w-2 rounded-sm" style={{ background: c.color }} /> {c.name}</span>
                  <span className="text-slate-700 shrink-0">{c.label}</span>
                </div>
              ))}
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">View exposure analysis →</a>
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
                    </div>
                  </div>
                );
              })}
              <a className="block text-center text-[11px] text-blue-600 font-medium pt-1 cursor-pointer">View full insights →</a>
            </div>
          </div>
        </div>

        {/* Row: Operational Risk by Service / Risk drivers / Trend / Recommended */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-4">
          <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Operational Risk by Business Service (Top 8)</h3>
            <table className="w-full text-[11px]">
              <thead className="text-slate-500">
                <tr>
                  <th className="text-left font-medium py-1.5">Business Service</th>
                  <th className="text-left font-medium py-1.5">Risk Score</th>
                  <th className="text-left font-medium py-1.5">Exposure</th>
                  <th className="text-left font-medium py-1.5 w-12">Trend</th>
                  <th className="text-right font-medium py-1.5">Drivers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOpRisk.map((r) => (
                  <tr key={r.service}>
                    <td className="py-2 text-blue-600">{r.service}</td>
                    <td className={`py-2 font-semibold ${r.scoreColor}`}>{r.score}</td>
                    <td className="py-2 text-slate-700">{r.exposure}</td>
                    <td className="py-2"><MiniLine data={trend(r.service.length, 12)} stroke={r.trendColor} /></td>
                    <td className="py-2 text-right text-slate-700">{r.drivers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View all business service risks →</a>
          </div>

          <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Top Risks Drivers</h3>
            <table className="w-full text-[11px]">
              <thead className="text-slate-500">
                <tr>
                  <th className="text-left font-medium py-1.5"></th>
                  <th className="text-right font-medium py-1.5">Risks</th>
                  <th className="text-right font-medium py-1.5">Trend</th>
                  <th className="text-right font-medium py-1.5">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riskDrivers.map((d) => {
                  const Icon = d.icon;
                  return (
                    <tr key={d.name}>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-slate-800">{d.name}</span>
                        </div>
                      </td>
                      <td className="py-2 text-right text-slate-800 font-semibold">{d.risks}</td>
                      <td className="py-2 text-right">
                        {d.up === true && <span className="text-red-500">↑</span>}
                        {d.up === false && <span className="text-emerald-500">↓</span>}
                        {d.up === null && <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-2 text-right text-slate-700">{d.impact}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View all risk drivers →</a>
          </div>

          <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Risk Trend Over Time</h3>
            <p className="text-[11px] text-slate-500 mb-2">Overall Risk Score (30 Days)</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskTrend} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0 84% 60%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="v" stroke="hsl(0 84% 60%)" strokeWidth={2.5} fill="url(#riskg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">View trend analysis →</a>
          </div>

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
                    <button className="text-[10px] border border-slate-200 rounded-md px-2 py-1 text-slate-700 hover:bg-slate-50 shrink-0">{r.action}</button>
                  </div>
                );
              })}
              <a className="block text-center text-[11px] text-blue-600 font-medium pt-1 cursor-pointer">View all recommended actions →</a>
            </div>
          </div>
        </div>

        {/* Row 4: Critical service summary / region / events / mitigation */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Critical Service Risk Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              {critSummary.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.name} className="text-center">
                    <div className={`mx-auto h-9 w-9 rounded-full ${c.bg} ${c.color} grid place-items-center`}><Icon className="h-4 w-4" /></div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-tight">{c.name}</div>
                    <div className="text-lg font-bold text-slate-900">{c.value}</div>
                  </div>
                );
              })}
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View critical services →</a>
          </div>

          <div className="xl:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Risk by Region</h3>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-5">
                <div className="h-40 rounded-lg bg-slate-50 border border-slate-100 grid place-items-center text-[11px] text-slate-400">
                  World map view
                </div>
                <div className="space-y-1 mt-2 text-[10px]">
                  <div className="flex items-center gap-1.5 text-slate-600"><span className="h-2 w-3 rounded-sm" style={{ background: "hsl(0 84% 60%)" }} /> High</div>
                  <div className="flex items-center gap-1.5 text-slate-600"><span className="h-2 w-3 rounded-sm" style={{ background: "hsl(38 92% 50%)" }} /> Medium</div>
                  <div className="flex items-center gap-1.5 text-slate-600"><span className="h-2 w-3 rounded-sm" style={{ background: "hsl(142 71% 45%)" }} /> Low</div>
                  <div className="flex items-center gap-1.5 text-slate-600"><span className="h-2 w-3 rounded-sm bg-slate-200" /> Minimal</div>
                </div>
              </div>
              <div className="col-span-7">
                <table className="w-full text-[11px]">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="text-left font-medium py-1.5">Region</th>
                      <th className="text-left font-medium py-1.5">Risk Score</th>
                      <th className="text-left font-medium py-1.5">Exposure</th>
                      <th className="text-right font-medium py-1.5">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegions.map((r) => (
                      <tr key={r.name}>
                        <td className="py-2 text-slate-800">{r.name}</td>
                        <td className={`py-2 font-semibold ${r.color}`}>{r.score}</td>
                        <td className="py-2 text-slate-700">{r.exposure}</td>
                        <td className={`py-2 text-right ${r.up ? "text-red-500" : "text-emerald-500"}`}>{r.up ? "↑" : "↓"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View regional risks →</a>
          </div>

          <div className="xl:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Upcoming Risk Events</h3>
            <table className="w-full text-[11px]">
              <thead className="text-slate-500">
                <tr>
                  <th className="text-left font-medium py-1.5">Event</th>
                  <th className="text-left font-medium py-1.5">Date / Time</th>
                  <th className="text-left font-medium py-1.5">Impact</th>
                  <th className="text-left font-medium py-1.5">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((e) => (
                  <tr key={e.event}>
                    <td className="py-2 text-slate-800">{e.event}</td>
                    <td className="py-2 text-slate-700">{e.date}</td>
                    <td className={`py-2 font-medium ${e.impactColor}`}>{e.impact}</td>
                    <td className={`py-2 font-medium ${e.riskColor}`}>{e.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-3 cursor-pointer">View full risk calendar →</a>
          </div>

          <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Risk Mitigation Progress</h3>
            <div className="flex items-center gap-3 mt-2">
              <div className="relative h-28 w-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={mitigation} dataKey="value" innerRadius={32} outerRadius={50} paddingAngle={2}>
                      {mitigation.map((s) => <Cell key={s.name} fill={s.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-base font-bold text-slate-900">62%</div>
                  <div className="text-[9px] text-slate-500">Mitigated</div>
                </div>
              </div>
              <div className="flex-1 space-y-1 text-[11px]">
                {mitigation.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-sm" style={{ background: s.color }} /> {s.name}</span>
                    <span className="text-slate-700 text-[10px]">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <a className="block text-center text-[11px] text-blue-600 font-medium mt-2 cursor-pointer">View mitigation plan →</a>
          </div>
        </div>
      </main>
    </AppShell>
  );
}