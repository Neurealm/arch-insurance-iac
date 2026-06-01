import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  CloudCog, MonitorCheck, CheckCircle2, AlertTriangle, XCircle, Bell, Clock, ShieldCheck,
  Activity, Target, TrendingUp, Users, Radio, Eye, ArrowUp, ArrowDown, Minus,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import worldMap from "@/assets/world-map.png";

const kpis: KPI[] = [
  { label: "Overall Health Score", value: "92.4%", sub: "Healthy", subColor: "text-emerald-600", icon: CloudCog, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Monitored Entities", value: "12,842", sub: "100% Monitored", subColor: "text-blue-600", icon: MonitorCheck, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Healthy", value: "11,872", sub: "92.4%", subColor: "text-emerald-600", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Warning", value: "678", sub: "5.3%", subColor: "text-amber-600", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Critical", value: "292", sub: "2.3%", subColor: "text-red-600", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Open Incidents", value: "37", sub: "-12% vs last 24h", subColor: "text-emerald-600", icon: Bell, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "MTTR (Overall)", value: "32m", sub: "-18% vs last 24h", subColor: "text-emerald-600", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "SLA Compliance", value: "98.7%", sub: "Meets Target", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
];

const wwh = {
  what: ["The Infrastructure Operations Command Center — the live operational view of compute, storage, and platform health."],
  why: ["They are buying ongoing operations, not just build and migration. Continuous operations ensure availability, performance, and business resilience."],
  how: [
    "24x7 monitoring of infrastructure health",
    "Incident detection and response tracking",
    "SLA monitoring and compliance",
    "Major incident command and resolution workflows",
  ],
};

const outcomes: Outcome[] = [
  { icon: Target, color: "text-emerald-600", title: "PROACTIVE MONITORING", l1: "24x7 across all environments" },
  { icon: Activity, color: "text-blue-600", title: "RAPID RESPONSE", l1: "MTTR 32m" },
  { icon: ShieldCheck, color: "text-emerald-600", title: "SLA DRIVEN", l1: "98.7% compliance" },
  { icon: TrendingUp, color: "text-violet-600", title: "BUSINESS RESILIENCE", l1: "92.4% overall health" },
  { icon: Users, color: "text-blue-600", title: "ENGAGED TEAM", l1: "42 NOC analysts" },
  { icon: Radio, color: "text-amber-600", title: "OPERATIONAL EXCELLENCE", l1: "Every minute. Every day." },
];

const layerHealth = [
  { layer: "Compute",            score: 94.6, status: "Healthy", w: 58,  c: 112 },
  { layer: "Storage",            score: 91.2, status: "Healthy", w: 69,  c: 148 },
  { layer: "Network",            score: 93.1, status: "Healthy", w: 42,  c: 101 },
  { layer: "Platform Services",  score: 90.3, status: "Healthy", w: 61,  c: 143 },
  { layer: "Database Services",  score: 90.8, status: "Healthy", w: 34,  c: 87 },
  { layer: "Backup & DR",        score: 95.7, status: "Healthy", w: 15,  c: 42 },
  { layer: "Identity & Access",  score: 93.9, status: "Healthy", w: 13,  c: 45 },
  { layer: "Security Services",  score: 89.4, status: "Warning", w: 0,   c: 0 },
];

const regions = [
  { name: "North America", value: 93.2, status: "Healthy", x: 18, y: 30 },
  { name: "Europe",        value: 91.1, status: "Healthy", x: 50, y: 28 },
  { name: "Asia Pacific",  value: 89.0, status: "Warning", x: 78, y: 38 },
  { name: "South America", value: 92.8, status: "Healthy", x: 30, y: 70 },
  { name: "Africa",        value: 87.6, status: "Warning", x: 53, y: 62 },
];

const openIncidents = [
  { id: "INC-54231", sev: "Critical", title: "Storage Array Performance Degradation", svc: "Block Storage - US East", dur: "1h 32m", status: "Investigating" },
  { id: "INC-54228", sev: "Critical", title: "Database Connectivity Errors",          svc: "SQL Cluster - EU West",   dur: "58m",    status: "Investigating" },
  { id: "INC-54221", sev: "Warning",  title: "High CPU Utilization",                  svc: "Compute Cluster - APAC",  dur: "2h 15m", status: "Monitoring" },
  { id: "INC-54215", sev: "Warning",  title: "Backup Job Failures",                   svc: "Backup Service - US East",dur: "3h 41m", status: "Investigating" },
  { id: "INC-54209", sev: "Warning",  title: "Network Packet Loss",                   svc: "Core Network - EU",       dur: "1h 10m", status: "Monitoring" },
];

const alertsTrend = [
  { d: "May 6", critical: 180, warning: 320, info: 280 },
  { d: "May 7", critical: 210, warning: 360, info: 290 },
  { d: "May 8", critical: 240, warning: 380, info: 310 },
  { d: "May 9", critical: 200, warning: 340, info: 280 },
  { d: "May 10", critical: 220, warning: 360, info: 295 },
  { d: "May 11", critical: 230, warning: 350, info: 285 },
  { d: "May 12", critical: 215, warning: 340, info: 290 },
];

const slaServices = [
  { svc: "Compute",          val: 99.1, trend: "up" },
  { svc: "Storage",          val: 98.2, trend: "up" },
  { svc: "Network",          val: 99.0, trend: "up" },
  { svc: "Platform Services",val: 98.5, trend: "up" },
  { svc: "Backup & DR",      val: 99.3, trend: "up" },
  { svc: "Identity & Access",val: 97.9, trend: "down" },
];

const capacity = [
  { res: "CPU",     util: 62, spark: [55,58,60,61,62,63,62] },
  { res: "Memory",  util: 58, spark: [50,52,54,56,57,58,58] },
  { res: "Storage", util: 67, spark: [60,62,64,65,66,66,67] },
  { res: "Network", util: 54, spark: [48,50,52,53,54,55,54] },
  { res: "IOPS",    util: 61, spark: [55,57,58,59,60,61,61] },
];

const majorInc = [
  { id: "INC-54088", title: "Network Outage - EU Core",     start: "May 11, 09:12 AM", dur: "2h 14m", impact: "High",   status: "Resolved" },
  { id: "INC-54012", title: "Storage Outage - APAC",        start: "May 10, 07:45 PM", dur: "1h 48m", impact: "High",   status: "Resolved" },
  { id: "INC-53977", title: "Database Failover Event",      start: "May 9, 11:05 AM",  dur: "43m",    impact: "Medium", status: "Resolved" },
  { id: "INC-53901", title: "Backup Service Degradation",   start: "May 8, 04:22 PM",  dur: "1h 12m", impact: "Medium", status: "Resolved" },
  { id: "INC-53845", title: "Compute Cluster Degraded",     start: "May 7, 10:33 AM",  dur: "55m",    impact: "Medium", status: "Resolved" },
];

const opsFeed = [
  { t: "10:24 AM", e: "Backup job completed successfully – US East", k: "ok" },
  { t: "10:21 AM", e: "High memory usage detected – Compute Cluster APAC", k: "warn" },
  { t: "10:19 AM", e: "New VM provisioned – Finance-App-Server-12", k: "info" },
  { t: "10:15 AM", e: "Incident INC-54218 resolved – Network Latency", k: "ok" },
  { t: "10:12 AM", e: "Storage capacity expanded – 2TB added – EU West", k: "info" },
];

const slaDonut = [
  { name: "Met", value: 98.7, color: "hsl(142 71% 45%)" },
  { name: "Miss", value: 1.3, color: "hsl(217 91% 60%)" },
];

function Bar1({ pct, color = "hsl(142 71% 45%)" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

function TrendIcon({ t }: { t: string }) {
  if (t === "up") return <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />;
  if (t === "down") return <ArrowDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-slate-400" />;
}

function FeedDot({ k }: { k: string }) {
  if (k === "ok") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
  if (k === "warn") return <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
  return <Activity className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
}

export default function InfraOperations() {
  return (
    <DashShell
      title="INFRASTRUCTURE OPERATIONS"
      highlight="COMMAND CENTER (LIVE OPS)"
      subtitle="Real-time operational view of compute, storage, network, and platform health across all environments."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Infrastructure Health by Layer">
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2">Layer</th>
                <th className="text-left py-2">Health Score</th>
                <th className="text-left py-2">Status</th>
                <th className="text-right py-2">Critical</th>
                <th className="text-right py-2">Warning</th>
              </tr>
            </thead>
            <tbody>
              {layerHealth.map((l) => (
                <tr key={l.layer} className="border-b border-slate-100">
                  <td className="py-2 font-medium text-slate-800">{l.layer}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-20"><Bar1 pct={l.score} color={l.status === "Warning" ? "hsl(38 92% 50%)" : "hsl(142 71% 45%)"} /></div>
                      <span className="font-semibold text-slate-900">{l.score}%</span>
                    </div>
                  </td>
                  <td className="py-2">
                    <span className={`text-[11px] font-medium ${l.status === "Warning" ? "text-amber-600" : "text-emerald-600"}`}>{l.status}</span>
                  </td>
                  <td className="py-2 text-right text-slate-700">{l.w}</td>
                  <td className="py-2 text-right text-slate-700">{l.c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Infrastructure Health Map">
          <div className="relative h-56 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden">
            <img src={worldMap} alt="World map" loading="lazy" width={1024} height={512}
                 className="absolute inset-0 w-full h-full object-contain opacity-90" />
            {regions.map((r) => {
              const ok = r.status === "Healthy";
              return (
                <div key={r.name} className="absolute -translate-x-1/2 -translate-y-1/2"
                     style={{ left: `${r.x}%`, top: `${r.y}%` }}>
                  <div className={`px-2.5 py-1 rounded-md border-2 bg-white shadow text-center ${ok ? "border-emerald-400" : "border-amber-400"}`}>
                    <div className="text-[9px] font-semibold text-slate-700 leading-none">{r.name}</div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">{r.value}%</div>
                    <div className={`text-[8px] font-medium ${ok ? "text-emerald-600" : "text-amber-600"}`}>{r.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-slate-600">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Healthy ({'>'} 90%)</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Warning (70% - 90%)</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Critical ({'<'} 70%)</span>
          </div>
        </Section>

        <Section title="Open Incidents (Live)">
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">Sev</th>
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Service</th>
                <th className="text-left py-2">Duration</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {openIncidents.map((i) => (
                <tr key={i.id} className="border-b border-slate-100">
                  <td className="py-2 font-mono text-slate-700">{i.id}</td>
                  <td className="py-2"><StatusPill status={i.sev} /></td>
                  <td className="py-2 text-slate-800">{i.title}</td>
                  <td className="py-2 text-slate-600">{i.svc}</td>
                  <td className="py-2 text-slate-700">{i.dur}</td>
                  <td className="py-2 text-slate-700">{i.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-[11px] text-blue-600 font-medium cursor-pointer">View all incidents →</div>
        </Section>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
        <Section title="Alerts Over Time (Last 7 Days)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertsTrend}>
                <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="critical" stackId="a" name="Critical" fill="hsl(0 84% 60%)" />
                <Bar dataKey="warning"  stackId="a" name="Warning"  fill="hsl(38 92% 50%)" />
                <Bar dataKey="info"     stackId="a" name="Info"     fill="hsl(217 91% 60%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="SLA Compliance (by Service)">
          <div className="flex items-center gap-3">
            <div className="relative h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={slaDonut} dataKey="value" innerRadius={36} outerRadius={56} paddingAngle={2}>
                    {slaDonut.map((p, i) => <Cell key={i} fill={p.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-base font-extrabold text-slate-900">98.7%</div>
                  <div className="text-[9px] text-slate-500">Overall</div>
                </div>
              </div>
            </div>
            <table className="w-full text-[11px]">
              <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                <tr><th className="text-left py-1">Service</th><th className="text-right py-1">Compliance</th><th className="text-right py-1">Trend</th></tr>
              </thead>
              <tbody>
                {slaServices.map((s) => (
                  <tr key={s.svc} className="border-b border-slate-100">
                    <td className="py-1 text-slate-700">{s.svc}</td>
                    <td className="py-1 text-right font-semibold text-slate-900">{s.val}%</td>
                    <td className="py-1 text-right"><div className="inline-flex"><TrendIcon t={s.trend} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 font-medium cursor-pointer">View SLA details →</div>
        </Section>

        <Section title="Capacity Utilization">
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2">Resource</th>
                <th className="text-right py-2">Utilization</th>
                <th className="text-right py-2">Trend</th>
              </tr>
            </thead>
            <tbody>
              {capacity.map((c) => (
                <tr key={c.res} className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">{c.res}</td>
                  <td className="py-2 text-right font-semibold text-slate-900">{c.util}%</td>
                  <td className="py-2">
                    <div className="h-6 w-24 ml-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={c.spark.map((v, i) => ({ i, v }))}>
                          <Line type="monotone" dataKey="v" stroke="hsl(142 71% 45%)" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-[11px] text-blue-600 font-medium cursor-pointer">View capacity analytics →</div>
        </Section>

        <Section title="Recent Major Incidents">
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2">Incident ID</th>
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Start Time</th>
                <th className="text-left py-2">Duration</th>
                <th className="text-left py-2">Impact</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {majorInc.map((m) => (
                <tr key={m.id} className="border-b border-slate-100">
                  <td className="py-2 font-mono text-slate-700">{m.id}</td>
                  <td className="py-2 text-slate-800">{m.title}</td>
                  <td className="py-2 text-slate-600">{m.start}</td>
                  <td className="py-2 text-slate-700">{m.dur}</td>
                  <td className="py-2">
                    <span className={`text-[10px] font-semibold ${m.impact === "High" ? "text-red-600" : "text-amber-600"}`}>{m.impact}</span>
                  </td>
                  <td className="py-2"><StatusPill status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-[11px] text-blue-600 font-medium cursor-pointer">View all major incidents →</div>
        </Section>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Incident Response Overview (Last 30 Days)</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: AlertTriangle, color: "text-blue-600", bg: "bg-blue-50", l: "Incidents",      v: "412", s: "-8% vs last 30 days", sc: "text-emerald-600" },
              { icon: Clock,         color: "text-red-600",  bg: "bg-red-50",  l: "MTTD (Detect)",  v: "8m",  s: "-15%", sc: "text-emerald-600" },
              { icon: Activity,      color: "text-amber-600",bg: "bg-amber-50",l: "MTTR (Resolve)", v: "32m", s: "-18%", sc: "text-emerald-600" },
              { icon: CheckCircle2,  color: "text-violet-600",bg: "bg-violet-50",l: "Resolved",     v: "375", s: "91%",  sc: "text-emerald-600" },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.l} className="rounded-lg border border-slate-100 p-2.5">
                  <div className={`h-8 w-8 rounded-lg ${m.bg} ${m.color} grid place-items-center mb-1`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">{m.l}</div>
                  <div className="text-lg font-bold text-slate-900 leading-tight">{m.v}</div>
                  <div className={`text-[9px] ${m.sc}`}>{m.s}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Operations Activity (Live Feed)</h3>
          <div className="space-y-1.5">
            {opsFeed.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] py-1 border-b border-slate-50 last:border-0">
                <div className="text-slate-500 w-16 shrink-0">{f.t}</div>
                <FeedDot k={f.k} />
                <div className="text-slate-700 flex-1">{f.e}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[11px] text-blue-600 font-medium cursor-pointer">View all activity →</div>
        </div>

        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Major Incident Command</h3>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { l: "Active War Rooms", v: "2", c: "text-red-600" },
              { l: "Bridge Calls",     v: "1", c: "text-amber-600" },
              { l: "Engaged Engineers", v: "18", c: "text-blue-600" },
              { l: "Notifications Sent (24h)", v: "126", c: "text-violet-600" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-slate-100 p-2 text-center">
                <div className="text-[9px] text-slate-500 font-medium leading-tight">{s.l}</div>
                <div className={`text-xl font-extrabold ${s.c}`}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-slate-600 mb-2">Next Review: 10:30 AM</div>
          <button className="w-full text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2">
            Join Command Bridge
          </button>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Operational Coverage</h3>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 grid place-items-center text-slate-600 shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-extrabold text-slate-900 leading-tight">24x7x365</div>
              <div className="text-[10px] text-slate-500">Operations Coverage</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg border border-slate-100 p-2">
              <div className="text-[9px] text-slate-500">NOC Analysts On Duty</div>
              <div className="text-lg font-bold text-slate-900">42</div>
            </div>
            <div className="rounded-lg border border-slate-100 p-2">
              <div className="text-[9px] text-slate-500">Global Locations</div>
              <div className="text-lg font-bold text-slate-900">6</div>
            </div>
          </div>
        </div>
      </div>
    </DashShell>
  );
}
