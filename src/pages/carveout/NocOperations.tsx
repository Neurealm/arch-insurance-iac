import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Activity, TrendingUp, Clock, Waves, Server, AlertTriangle, Bell, ShieldCheck,
  AlertOctagon, Users, Headphones, CheckCircle, ArrowRight, Search, ScanSearch,
  Wrench, ClipboardCheck, UserCog, Network, Phone,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line } from "recharts";

const kpis: KPI[] = [
  { label: "Overall Network Health", value: "98.6%", sub: "Healthy", subColor: "text-emerald-600", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Network Availability", value: "99.95%", sub: "Excellent", subColor: "text-emerald-600", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Avg. Latency (Global)", value: "18 ms", sub: "↓ 12% vs last 7 days", subColor: "text-emerald-600", icon: Clock, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Packet Loss (Global)", value: "0.12%", sub: "↓ 15% vs last 7 days", subColor: "text-emerald-600", icon: Waves, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Monitored Devices", value: "24,561", sub: "Online: 24,180 (98.4%)", subColor: "text-emerald-600", icon: Server, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Active Incidents", value: "27", sub: "Critical: 2  High: 5", subColor: "text-red-600", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Open Alerts", value: "312", sub: "Unhandled: 48", subColor: "text-amber-600", icon: Bell, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "SLA Compliance (MTD)", value: "97.8%", sub: "Good", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const regions = [
  { name: "North America", v: "99.1%", color: "hsl(142 71% 45%)", x: 18, y: 32 },
  { name: "Europe", v: "98.4%", color: "hsl(142 71% 45%)", x: 50, y: 26 },
  { name: "Asia Pacific", v: "96.7%", color: "hsl(38 92% 50%)", x: 78, y: 32 },
  { name: "Latin America", v: "98.8%", color: "hsl(142 71% 45%)", x: 28, y: 70 },
  { name: "MEA", v: "94.2%", color: "hsl(0 84% 60%)", x: 53, y: 58 },
];

const incidents = [
  { id: "INC-13872", sev: "Critical", title: "Internet Connectivity Down", loc: "London-02 / Internet", impact: "High", age: "45m", status: "In Progress" },
  { id: "INC-13871", sev: "High", title: "High Packet Loss", loc: "Singapore-03 / MPLS", impact: "Medium", age: "1h 12m", status: "Investigating" },
  { id: "INC-13870", sev: "High", title: "VPN Tunnel Flapping", loc: "Frankfurt-01 / VPN", impact: "Medium", age: "1h 25m", status: "Identified" },
  { id: "INC-13869", sev: "Medium", title: "Elevated Latency", loc: "Sao Paulo-01 / MPLS", impact: "Low", age: "2h 03m", status: "Monitoring" },
  { id: "INC-13868", sev: "Medium", title: "DNS Resolution Errors", loc: "Dubai-01 / DNS", impact: "Low", age: "2h 18m", status: "In Progress" },
];

const commandBridge = [
  { icon: UserCog, role: "Incident Commander", name: "James Wilson" },
  { icon: Wrench, role: "Technical Lead", name: "Sarah Patel" },
  { icon: Network, role: "Network Engineer", name: "Michael Chen" },
  { icon: Phone, role: "Stakeholder Comms", name: "Lisa Rodriguez" },
];

const perf = [
  { label: "Latency (Avg.)", v: "18 ms", delta: "↓ 12%", color: "text-emerald-600", spark: [22, 21, 20, 19, 18, 18, 18] },
  { label: "Packet Loss (Avg.)", v: "0.12%", delta: "↓ 15%", color: "text-emerald-600", spark: [0.2, 0.18, 0.16, 0.14, 0.13, 0.12, 0.12] },
  { label: "Jitter (Avg.)", v: "2.1 ms", delta: "↓ 10%", color: "text-emerald-600", spark: [3, 2.8, 2.6, 2.4, 2.2, 2.1, 2.1] },
  { label: "Uptime (Avg.)", v: "99.95%", delta: "↑ 0.02%", color: "text-emerald-600", spark: [99.9, 99.91, 99.93, 99.94, 99.95, 99.95, 99.95] },
];

const alertCats = [
  { name: "Network Availability", value: 72, pct: "23%", color: "hsl(217 91% 60%)" },
  { name: "Performance", value: 66, pct: "21%", color: "hsl(142 71% 45%)" },
  { name: "Configuration", value: 54, pct: "17%", color: "hsl(38 92% 50%)" },
  { name: "Security", value: 48, pct: "15%", color: "hsl(0 84% 60%)" },
  { name: "Connectivity", value: 42, pct: "13%", color: "hsl(262 83% 58%)" },
  { name: "Other", value: 30, pct: "10%", color: "hsl(220 9% 70%)" },
];

const sla = [
  { service: "Internet Connectivity", target: "99.90%", actual: "98.91%", comp: "98.9%", trend: "up" },
  { service: "MPLS Network", target: "99.90%", actual: "99.52%", comp: "99.5%", trend: "up" },
  { service: "VPN Services", target: "99.50%", actual: "97.89%", comp: "97.9%", trend: "up" },
  { service: "DNS Services", target: "99.90%", actual: "99.96%", comp: "100%", trend: "up" },
  { service: "Cloud Connectivity", target: "99.90%", actual: "98.62%", comp: "98.6%", trend: "down" },
];

const recentAlerts = [
  { time: "10:29 AM", sev: "High", alert: "High Packet Loss Detected", loc: "Singapore-03", status: "New" },
  { time: "10:28 AM", sev: "Medium", alert: "Interface Flapping", loc: "Chicago-01", status: "Acknowledged" },
  { time: "10:27 AM", sev: "High", alert: "Latency Threshold Exceeded", loc: "Sao Paulo-01", status: "Investigating" },
  { time: "10:26 AM", sev: "Medium", alert: "CPU Utilization High", loc: "Frankfurt-01", status: "Monitoring" },
  { time: "10:25 AM", sev: "Low", alert: "Config Backup Failed", loc: "Toronto-01", status: "Resolved" },
];

const lifecycle = [
  { icon: Search, title: "Detect & Alert", time: "10:15 AM", color: "text-red-600", bg: "bg-red-50" },
  { icon: ScanSearch, title: "Triage & Validate", time: "10:16 AM", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: ClipboardCheck, title: "Engage & Declare", time: "10:17 AM", color: "text-orange-600", bg: "bg-orange-50" },
  { icon: Wrench, title: "Investigate & Diagnose", time: "In Progress", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: CheckCircle, title: "Resolve & Recover", time: "Pending", color: "text-violet-600", bg: "bg-violet-50" },
  { icon: ShieldCheck, title: "Validate & Close", time: "Pending", color: "text-emerald-600", bg: "bg-emerald-50" },
];

const wwh = {
  what: [
    "Real-time network health: latency, packet loss, availability",
    "Active incidents, alerts, and severity",
    "SLA compliance across services and regions",
    "Major incident command view with impact and response status",
  ],
  why: [
    "Ensures network uptime and performance for users and applications",
    "Detects and resolves issues before they impact the business",
    "Meets SLA commitments and drives customer confidence",
    "Provides 24x7 reliability and rapid major incident response",
  ],
  how: [
    "24x7 monitoring with AI-powered anomaly detection",
    "Automated alerting, correlation, and smart noise reduction",
    "ITIL-aligned incident management with escalation workflows",
    "Real-time dashboards, runbooks, and collaboration tools",
  ],
};

const outcomes: Outcome[] = [
  { icon: Activity, color: "text-blue-600", title: "ALWAYS-ON OPERATIONS", l1: "24x7 monitoring with rapid response." },
  { icon: ShieldCheck, color: "text-emerald-600", title: "SLA ASSURED", l1: "Continuous SLA tracking and reporting." },
  { icon: AlertOctagon, color: "text-red-600", title: "RAPID INCIDENT RESPONSE", l1: "ITIL workflows + war-room collaboration." },
  { icon: Headphones, color: "text-violet-600", title: "CUSTOMER CONFIDENCE", l1: "Reliable services and transparent comms." },
];

function sevPill(sev: string) {
  const map: Record<string, string> = {
    Critical: "bg-red-50 text-red-700 border-red-200",
    High: "bg-red-50 text-red-700 border-red-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${map[sev] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>{sev}</span>;
}

function statusPill(s: string) {
  const map: Record<string, string> = {
    "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
    Investigating: "bg-amber-50 text-amber-700 border-amber-200",
    Identified: "bg-blue-50 text-blue-700 border-blue-200",
    Monitoring: "bg-violet-50 text-violet-700 border-violet-200",
    New: "bg-blue-50 text-blue-700 border-blue-200",
    Acknowledged: "bg-slate-50 text-slate-700 border-slate-200",
    Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${map[s] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>{s}</span>;
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

export default function NocOperations() {
  const totalAlerts = alertCats.reduce((a, b) => a + b.value, 0);
  return (
    <DashShell
      title="NOC OPERATIONS COMMAND CENTER"
      highlight="(LIVE OPS)"
      subtitle="24x7 network monitoring, incident management, and performance assurance across the global enterprise."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Map + Active Incidents + Major Incident Command */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Network Health by Region">
          <div className="relative h-72 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
            <WorldMap />
            {regions.map((r) => (
              <div key={r.name} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${r.x}%`, top: `${r.y}%` }}>
                <div className="h-12 w-12 rounded-full grid place-items-center text-white font-bold text-[12px] shadow-md" style={{ background: r.color }}>{r.v}</div>
                <div className="text-[10px] text-slate-700 font-medium mt-1 whitespace-nowrap">{r.name}</div>
              </div>
            ))}
            <div className="absolute left-2 bottom-2 bg-white/90 rounded p-2 text-[10px] space-y-0.5 border border-slate-200">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Excellent (≥ 98%)</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Good (95% – 97.99%)</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" />At Risk (90% – 94.99%)</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />Critical (&lt; 90%)</div>
            </div>
          </div>
        </Section>

        <Section title="Active Incidents">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">ID</th>
                <th className="text-left py-1.5">Severity</th>
                <th className="text-left py-1.5">Title</th>
                <th className="text-left py-1.5">Location / Service</th>
                <th className="text-left py-1.5">Impact</th>
                <th className="text-left py-1.5">Age</th>
                <th className="text-left py-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((i) => (
                <tr key={i.id} className="border-b border-slate-100">
                  <td className="py-2 font-mono text-[10px] text-blue-600">{i.id}</td>
                  <td className="py-2">{sevPill(i.sev)}</td>
                  <td className="py-2 text-slate-800 font-medium">{i.title}</td>
                  <td className="py-2 text-slate-600">{i.loc}</td>
                  <td className="py-2 text-slate-700">{i.impact}</td>
                  <td className="py-2 text-slate-700">{i.age}</td>
                  <td className="py-2">{statusPill(i.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="mt-2 inline-block text-xs text-blue-600 font-medium cursor-pointer">View all incidents →</a>
        </Section>

        <Section title="Major Incident Command (Active)">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-full bg-red-100 grid place-items-center"><AlertOctagon className="h-4 w-4 text-red-600" /></div>
                <div className="text-[11px] font-bold text-red-700 leading-tight">MAJOR INCIDENT<br/>INTERNET CONNECTIVITY DOWN</div>
              </div>
              <div className="text-[10px] font-mono text-slate-600 mb-2">INC-13872</div>
              <div className="text-[10px] text-slate-700 space-y-0.5">
                <div><span className="text-slate-500">Location:</span> London-02</div>
                <div><span className="text-slate-500">Service:</span> Internet</div>
                <div><span className="text-slate-500">Severity:</span> Critical</div>
                <div><span className="text-slate-500">Declared:</span> 10:15 AM ET</div>
                <div><span className="text-slate-500">Impact:</span> Multiple sites</div>
                <div><span className="text-slate-500">Users Affected:</span> ~4,200</div>
              </div>
              <div className="mt-2 inline-flex flex-col items-center px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
                <div className="text-lg font-extrabold text-red-700">45m</div>
                <div className="text-[9px] text-red-600">Elapsed Time</div>
              </div>
            </div>
            <div className="col-span-1">
              <div className="text-[11px] font-bold text-slate-800 mb-2">Command Bridge</div>
              <div className="space-y-2">
                {commandBridge.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.role} className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-blue-50 grid place-items-center"><Icon className="h-3.5 w-3.5 text-blue-600" /></div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-500">{c.role}</div>
                        <div className="text-[11px] font-semibold text-slate-800 truncate">{c.name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="col-span-1">
              <div className="text-[11px] font-bold text-slate-800 mb-2">Status & Next Update</div>
              <div className="text-[10px] text-slate-500">Status</div>
              <div className="text-sm font-bold text-amber-700 mb-2">In Progress</div>
              <div className="text-[10px] text-slate-500">Next Update</div>
              <div className="text-sm font-bold text-slate-800">10:45 AM ET</div>
              <div className="text-[10px] text-slate-500 mb-3">(in 15m)</div>
              <button className="w-full mt-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold">Open Bridge</button>
            </div>
          </div>
        </Section>
      </div>

      {/* Row 2: Performance + Alert Categories + SLA + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Section title="Network Performance (Global)">
          <div className="grid grid-cols-2 gap-3">
            {perf.map((p) => (
              <div key={p.label}>
                <div className="text-[10px] text-slate-500">{p.label}</div>
                <div className="text-lg font-extrabold text-slate-900">{p.v}</div>
                <div className={`text-[10px] font-semibold ${p.color}`}>{p.delta}</div>
                <div className="h-8 mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={p.spark.map((v, i) => ({ i, v }))}>
                      <Line type="monotone" dataKey="v" stroke="hsl(217 91% 60%)" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-400">
                  <span>Feb 7</span><span>Feb 13</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Top Alert Categories (24h)">
          <div className="grid grid-cols-2 gap-2 items-center">
            <div className="relative h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={alertCats} dataKey="value" innerRadius={38} outerRadius={62} paddingAngle={2}>
                    {alertCats.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-xl font-extrabold text-slate-900">{totalAlerts}</div>
                <div className="text-[9px] text-slate-500">Total Alerts</div>
              </div>
            </div>
            <div className="space-y-1 text-[10px]">
              {alertCats.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-slate-700 truncate">{c.name}</span>
                  <span className="ml-auto font-semibold text-slate-900 whitespace-nowrap">{c.value} ({c.pct})</span>
                </div>
              ))}
            </div>
          </div>
          <a className="mt-2 inline-block text-xs text-blue-600 font-medium cursor-pointer">View all alerts →</a>
        </Section>

        <Section title="SLA Compliance (MTD)">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Service</th>
                <th className="text-right py-1.5">Target</th>
                <th className="text-right py-1.5">Actual</th>
                <th className="text-right py-1.5">Comp.</th>
                <th className="text-right py-1.5">Trend</th>
              </tr>
            </thead>
            <tbody>
              {sla.map((s) => (
                <tr key={s.service} className="border-b border-slate-100">
                  <td className="py-2 text-slate-800">{s.service}</td>
                  <td className="py-2 text-right text-slate-600">{s.target}</td>
                  <td className="py-2 text-right text-slate-700">{s.actual}</td>
                  <td className="py-2 text-right font-semibold text-slate-900">{s.comp}</td>
                  <td className={`py-2 text-right ${s.trend === "up" ? "text-emerald-600" : "text-amber-600"}`}>{s.trend === "up" ? "↑" : "↓"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="mt-2 inline-block text-xs text-blue-600 font-medium cursor-pointer">View all SLA reports →</a>
        </Section>

        <Section title="Recent Alerts Feed">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Time</th>
                <th className="text-left py-1.5">Sev</th>
                <th className="text-left py-1.5">Alert</th>
                <th className="text-left py-1.5">Loc</th>
                <th className="text-left py-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.map((a, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 text-slate-600 whitespace-nowrap">{a.time}</td>
                  <td className="py-2">{sevPill(a.sev)}</td>
                  <td className="py-2 text-slate-800">{a.alert}</td>
                  <td className="py-2 text-slate-600">{a.loc}</td>
                  <td className="py-2">{statusPill(a.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="mt-2 inline-block text-xs text-blue-600 font-medium cursor-pointer">View all alerts →</a>
        </Section>
      </div>

      {/* Row 3: Major Incident Command Workflow + MTTR + FCR + Resolved + Customer Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Major Incident Command – Workflow" className="lg:col-span-2">
          <div className="text-[11px] font-semibold text-slate-700 mb-3">Incident Lifecycle</div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {lifecycle.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex items-center gap-1 flex-1 min-w-0">
                  <div className="flex flex-col items-center text-center min-w-0 flex-1">
                    <div className={`h-10 w-10 rounded-full ${step.bg} grid place-items-center`}>
                      <Icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                    <div className="text-[10px] font-semibold text-slate-800 mt-1.5 leading-tight">{step.title}</div>
                    <div className="text-[10px] text-slate-500">{step.time}</div>
                  </div>
                  {i < lifecycle.length - 1 && <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />}
                </div>
              );
            })}
          </div>
        </Section>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-600" />
              <div className="text-[10px] font-semibold text-slate-700">MTTR (MTD)</div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">32m</div>
            <div className="text-[10px] text-emerald-600 font-semibold">↓ 18% vs last month</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Headphones className="h-4 w-4 text-emerald-600" />
              <div className="text-[10px] font-semibold text-slate-700">First Call Resolution (MTD)</div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">78.6%</div>
            <div className="text-[10px] text-emerald-600 font-semibold">↑ 6% vs last month</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-violet-600" />
              <div className="text-[10px] font-semibold text-slate-700">Incidents Resolved (MTD)</div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">1,042</div>
            <div className="text-[10px] text-emerald-600 font-semibold">↑ 14% vs last month</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-red-600" />
              <div className="text-[10px] font-semibold text-slate-700">Customer Impact (MTD)</div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">3</div>
            <div className="text-[10px] text-slate-500">Major Incidents</div>
          </div>
        </div>
      </div>
    </DashShell>
  );
}
