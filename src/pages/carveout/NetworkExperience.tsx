import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Users, TrendingUp, AppWindow, Timer, CheckCircle, AlertTriangle, Wifi, Building2,
  User, Network, Cloud, Server, Lightbulb, Clock, Activity,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

const kpis: KPI[] = [
  { label: "Overall Experience Score (Global)", value: "4.3 / 5", sub: "Good", subColor: "text-emerald-600", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Users Monitored", value: "28,746", sub: "↑ 12% vs last 7 days", subColor: "text-emerald-600", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Applications Monitored", value: "152", sub: "↑ 8% vs last 7 days", subColor: "text-emerald-600", icon: AppWindow, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Avg. App Response Time", value: "386 ms", sub: "↑ 14% vs last 7 days", subColor: "text-amber-600", icon: Timer, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Successful Transactions", value: "98.2%", sub: "↓ 2.3% vs last 7 days", subColor: "text-amber-600", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Poor Experience Users", value: "1,248", sub: "↑ 9% vs last 7 days", subColor: "text-red-600", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { label: "WiFi Experience Score", value: "4.1 / 5", sub: "Good", subColor: "text-emerald-600", icon: Wifi, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Sites Monitored", value: "77", sub: "Across 24 Countries", icon: Building2, color: "text-violet-600", bg: "bg-violet-50" },
];

const apps = [
  { name: "Microsoft 365", cat: "SaaS", rt: "235 ms", sr: "99.1%", trend: "up", score: "4.6 / 5" },
  { name: "SAP S/4HANA", cat: "Business", rt: "612 ms", sr: "97.2%", trend: "up", score: "4.0 / 5" },
  { name: "Salesforce", cat: "SaaS", rt: "412 ms", sr: "98.4%", trend: "up", score: "4.2 / 5" },
  { name: "ServiceNow", cat: "SaaS", rt: "498 ms", sr: "97.8%", trend: "flat", score: "3.9 / 5" },
  { name: "Zoom", cat: "Collaboration", rt: "278 ms", sr: "99.3%", trend: "up", score: "4.5 / 5" },
  { name: "Teams", cat: "Collaboration", rt: "265 ms", sr: "99.2%", trend: "up", score: "4.6 / 5" },
  { name: "Workday", cat: "Business", rt: "678 ms", sr: "96.1%", trend: "down", score: "3.6 / 5" },
  { name: "Concur", cat: "Business", rt: "543 ms", sr: "97.0%", trend: "flat", score: "3.8 / 5" },
  { name: "AWS Console", cat: "Cloud", rt: "321 ms", sr: "98.7%", trend: "up", score: "4.3 / 5" },
  { name: "Azure Portal", cat: "Cloud", rt: "287 ms", sr: "99.0%", trend: "up", score: "4.4 / 5" },
];

const regions = [
  { name: "North America", v: "4.5", color: "hsl(142 71% 45%)", x: 18, y: 32 },
  { name: "Europe", v: "4.1", color: "hsl(142 71% 45%)", x: 50, y: 26 },
  { name: "Latin America", v: "4.2", color: "hsl(142 71% 45%)", x: 28, y: 70 },
  { name: "MEA", v: "3.8", color: "hsl(220 9% 70%)", x: 53, y: 50 },
  { name: "Asia Pacific", v: "3.3", color: "hsl(38 92% 50%)", x: 75, y: 35 },
  { name: "India", v: "2.9", color: "hsl(0 84% 60%)", x: 70, y: 50 },
];

const wifiTrend = [
  { d: "Feb 7", Global: 4.2, Corporate: 3.5, Remote: 3.0, Guest: 2.2 },
  { d: "Feb 8", Global: 4.3, Corporate: 3.5, Remote: 3.1, Guest: 2.3 },
  { d: "Feb 9", Global: 4.2, Corporate: 3.4, Remote: 3.0, Guest: 2.2 },
  { d: "Feb 10", Global: 4.3, Corporate: 3.5, Remote: 3.1, Guest: 2.3 },
  { d: "Feb 11", Global: 4.4, Corporate: 3.6, Remote: 3.2, Guest: 2.3 },
  { d: "Feb 12", Global: 4.3, Corporate: 3.5, Remote: 3.1, Guest: 2.3 },
  { d: "Feb 13", Global: 4.4, Corporate: 3.6, Remote: 3.2, Guest: 2.4 },
];

const business = [
  { svc: "Order to Cash", impact: "High", users: "1,892", trend: "down", colorImpact: "text-red-600" },
  { svc: "Employee Productivity", impact: "Medium", users: "3,431", trend: "down", colorImpact: "text-amber-600" },
  { svc: "Customer Support", impact: "Low", users: "620", trend: "up", colorImpact: "text-emerald-600" },
  { svc: "Supply Chain Operations", impact: "High", users: "1,156", trend: "down", colorImpact: "text-red-600" },
  { svc: "Finance & Reporting", impact: "Medium", users: "812", trend: "down", colorImpact: "text-amber-600" },
];

const pathStops = [
  { icon: User, label: "Boston-01" },
  { icon: Network, label: "Edge" },
  { icon: Cloud, label: "WAN" },
  { icon: Server, label: "Data Center / Cloud" },
  { icon: AppWindow, label: "Application" },
];

const pathMetrics = [
  { label: "Latency", v: "42 ms", note: "Good", color: "text-emerald-600" },
  { label: "Jitter", v: "3 ms", note: "Good", color: "text-emerald-600" },
  { label: "Packet Loss", v: "0.08%", note: "Good", color: "text-emerald-600" },
  { label: "Path Score", v: "4.4 / 5", note: "Good", color: "text-emerald-600" },
];

const topSites = [
  { site: "Jakarta-01", region: "Asia Pacific", score: "2.6 / 5", users: 312, issue: "High Latency" },
  { site: "Mexico City-01", region: "Latin America", score: "2.8 / 5", users: 256, issue: "Packet Loss" },
  { site: "Dubai-01", region: "MEA", score: "3.0 / 5", users: 198, issue: "WiFi Quality" },
  { site: "Sao Paulo-01", region: "Latin America", score: "3.1 / 5", users: 176, issue: "High Latency" },
  { site: "Mumbai-01", region: "Asia Pacific", score: "3.2 / 5", users: 154, issue: "WiFi Roaming" },
];

const insights = [
  { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", title: "Application performance is meeting targets", sub: "98.2% of transactions successful globally." },
  { icon: Wifi, color: "text-amber-600", bg: "bg-amber-50", title: "WiFi quality impacting remote sites", sub: "Guest and remote WiFi scores below target." },
  { icon: Clock, color: "text-red-600", bg: "bg-red-50", title: "High latency in Asia Pacific", sub: "Impacting user experience for critical apps." },
  { icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50", title: "Experience correlates with productivity", sub: "Sites with poor experience show lower productivity." },
];

const wwh = {
  what: [
    "Application performance over the network (response time, success rate)",
    "User experience scores by site, region, and application",
    "WiFi quality metrics and client experience",
    "Business service impact and digital experience insights",
  ],
  why: [
    "Uptime doesn't equal good experience for users",
    "Poor experience directly impacts productivity and revenue",
    "Identifies issues before users open a ticket",
    "Drives proactive optimization and better business outcomes",
  ],
  how: [
    "Real user monitoring, synthetic tests, and telemetry correlation",
    "Application-aware analytics across network paths",
    "WiFi client telemetry and quality scoring",
    "Experience scoring and business impact mapping",
  ],
};

const outcomes: Outcome[] = [
  { icon: Activity, color: "text-blue-600", title: "EXPERIENCE FIRST", l1: "Real user-centric measurement at scale." },
  { icon: TrendingUp, color: "text-emerald-600", title: "PROACTIVE INSIGHTS", l1: "Detect issues before they impact users." },
  { icon: Wifi, color: "text-violet-600", title: "WIFI INTELLIGENCE", l1: "Client-side telemetry and roaming health." },
  { icon: Lightbulb, color: "text-amber-600", title: "BUSINESS ALIGNED", l1: "Map experience to business outcomes." },
];

function impactPill(s: string) {
  const map: Record<string, string> = {
    High: "bg-red-50 text-red-700 border-red-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${map[s]}`}>{s}</span>;
}

function Sparkline({ trend }: { trend: "up" | "down" | "flat" }) {
  const data = trend === "up"
    ? [3, 3.2, 3.4, 3.6, 4, 4.2, 4.4]
    : trend === "down"
    ? [4.4, 4.2, 4, 3.7, 3.4, 3.2, 3]
    : [3.5, 3.6, 3.5, 3.7, 3.5, 3.6, 3.5];
  const stroke = trend === "up" ? "hsl(142 71% 45%)" : trend === "down" ? "hsl(0 84% 60%)" : "hsl(38 92% 50%)";
  return (
    <div className="h-6 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.map((v, i) => ({ i, v }))}>
          <Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function WorldMap() {
  return (
    <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
      <g fill="hsl(220 13% 88%)" stroke="hsl(220 13% 78%)" strokeWidth="1">
        <path d="M150,90 L260,80 L310,110 L300,160 L260,200 L230,230 L180,240 L140,220 L110,180 L100,140 Z" />
        <path d="M230,250 L280,260 L300,310 L290,370 L270,420 L250,440 L240,400 L230,340 Z" />
        <path d="M450,90 L540,85 L560,120 L540,160 L490,170 L460,150 L440,120 Z" />
        <path d="M470,180 L560,180 L580,240 L560,310 L520,360 L490,360 L470,310 L460,250 Z" />
        <path d="M560,80 L780,85 L840,120 L860,170 L820,210 L740,220 L660,200 L600,180 L570,140 Z" />
        <path d="M680,210 L730,210 L720,270 L700,290 L680,260 Z" />
        <path d="M780,240 L860,250 L880,290 L840,310 L800,300 L780,280 Z" />
        <path d="M820,340 L910,340 L930,380 L900,410 L840,410 L810,380 Z" />
      </g>
    </svg>
  );
}

export default function NetworkExperience() {
  return (
    <DashShell
      title="NETWORK EXPERIENCE &"
      highlight="PERFORMANCE ANALYTICS"
      subtitle="From uptime to experience: Real user, real application, real impact across the enterprise."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Apps + Map + WiFi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Application Performance Over Network (Top 10)">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Application</th>
                <th className="text-left py-1.5">Category</th>
                <th className="text-right py-1.5">Avg. RT</th>
                <th className="text-right py-1.5">Success</th>
                <th className="text-center py-1.5">Trend (7d)</th>
                <th className="text-right py-1.5">Score</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.name} className="border-b border-slate-100">
                  <td className="py-1.5 text-slate-800 font-medium">{a.name}</td>
                  <td className="py-1.5 text-slate-600">{a.cat}</td>
                  <td className="py-1.5 text-right text-slate-700">{a.rt}</td>
                  <td className="py-1.5 text-right text-slate-700">{a.sr}</td>
                  <td className="py-1.5"><div className="flex justify-center"><Sparkline trend={a.trend as any} /></div></td>
                  <td className="py-1.5 text-right font-semibold text-slate-900">{a.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="mt-2 inline-block text-xs text-blue-600 font-medium cursor-pointer">View all applications →</a>
        </Section>

        <Section title="User Experience by Site (Experience Score)">
          <div className="relative h-72 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
            <WorldMap />
            {regions.map((r) => (
              <div key={r.name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${r.x}%`, top: `${r.y}%` }}>
                <div className="h-10 w-10 rounded-full grid place-items-center text-white font-bold text-sm shadow-md" style={{ background: r.color }}>{r.v}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2 text-[10px]">
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Excellent (4.5 – 5.0)</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" />Good (3.5 – 4.4)</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Fair (2.5 – 3.4)</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />Poor (&lt; 2.5)</div>
          </div>
        </Section>

        <Section title="WiFi Quality Metrics (Global)">
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: "WiFi Experience Score", v: "4.1 / 5", n: "Good" },
              { l: "Signal Quality (Avg.)", v: "-62 dBm", n: "Good" },
              { l: "Client Success Rate", v: "97.6%", n: "Good" },
              { l: "Roaming Success Rate", v: "95.1%", n: "Good" },
            ].map((m) => (
              <div key={m.l} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-600">{m.l}</div>
                <div className="text-lg font-extrabold text-slate-900">{m.v}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">{m.n}</div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-slate-700 mb-1">WiFi Experience Trend (7 Days)</div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wifiTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                  <XAxis dataKey="d" tick={{ fontSize: 9 }} />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 9 }} iconSize={8} />
                  <Line type="monotone" dataKey="Global" stroke="hsl(217 91% 60%)" strokeWidth={1.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="Corporate" stroke="hsl(142 71% 45%)" strokeWidth={1.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="Remote" stroke="hsl(38 92% 50%)" strokeWidth={1.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="Guest" stroke="hsl(262 83% 58%)" strokeWidth={1.5} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Section>
      </div>

      {/* Row 2: Business Impact + Network Path + Top Sites */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Experience Impact on Business Services">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Business Service</th>
                <th className="text-left py-1.5">Impact Score</th>
                <th className="text-right py-1.5">Users Affected</th>
                <th className="text-center py-1.5">Trend (7d)</th>
                <th className="text-left py-1.5 pl-3">Impact</th>
              </tr>
            </thead>
            <tbody>
              {business.map((b) => (
                <tr key={b.svc} className="border-b border-slate-100">
                  <td className="py-2 text-slate-800 font-medium">{b.svc}</td>
                  <td className="py-2">{impactPill(b.impact)}</td>
                  <td className="py-2 text-right text-slate-700">{b.users}</td>
                  <td className="py-2"><div className="flex justify-center"><Sparkline trend={b.trend as any} /></div></td>
                  <td className={`py-2 pl-3 font-semibold ${b.colorImpact}`}>{b.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="mt-2 inline-block text-xs text-blue-600 font-medium cursor-pointer">View all business services →</a>
        </Section>

        <Section title="Network Path Performance (End-to-End)">
          <div className="flex items-center justify-between gap-1 mb-3">
            {pathStops.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-1 flex-1">
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="h-10 w-10 rounded-full bg-slate-100 grid place-items-center">
                      <Icon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="text-[10px] text-slate-700 mt-1 leading-tight">{s.label}</div>
                  </div>
                  {i < pathStops.length - 1 && <div className="flex-1 border-t-2 border-dashed border-emerald-400 mt-[-14px]" />}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {pathMetrics.map((m) => (
              <div key={m.label} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <div className="text-[10px] text-slate-500">{m.label}</div>
                <div className="text-base font-extrabold text-slate-900">{m.v}</div>
                <div className={`text-[10px] font-semibold ${m.color}`}>{m.note}</div>
              </div>
            ))}
          </div>
          <a className="mt-2 inline-block text-xs text-blue-600 font-medium cursor-pointer">View path details →</a>
        </Section>

        <Section title="Top Sites by Poor Experience (Last 7 Days)">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Site</th>
                <th className="text-left py-1.5">Region</th>
                <th className="text-left py-1.5">Score</th>
                <th className="text-right py-1.5">Poor Users</th>
                <th className="text-left py-1.5">Top Issue</th>
              </tr>
            </thead>
            <tbody>
              {topSites.map((s) => (
                <tr key={s.site} className="border-b border-slate-100">
                  <td className="py-2 text-slate-800 font-medium">{s.site}</td>
                  <td className="py-2 text-slate-600">{s.region}</td>
                  <td className="py-2 font-semibold text-red-600">{s.score}</td>
                  <td className="py-2 text-right text-slate-700">{s.users}</td>
                  <td className="py-2 text-slate-700">{s.issue}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="mt-2 inline-block text-xs text-blue-600 font-medium cursor-pointer">View all sites →</a>
        </Section>
      </div>

      {/* Key Insights */}
      <Section title="Key Insights" action="">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {insights.map((i) => {
            const Icon = i.icon;
            return (
              <div key={i.title} className="flex items-start gap-2">
                <div className={`h-9 w-9 rounded-lg ${i.bg} grid place-items-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${i.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-slate-900 leading-tight">{i.title}</div>
                  <div className="text-[11px] text-slate-600 leading-snug">{i.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </DashShell>
  );
}
