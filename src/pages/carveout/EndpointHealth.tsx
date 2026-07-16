import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Monitor, CheckCircle2, AlertTriangle, XCircle, Smile, Users, Bell, Timer,
  ShieldCheck, Activity, BarChart3, MonitorCheck, Sparkles, UserCheck, Workflow,
  Box, Smartphone,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

const kpis: KPI[] = [
  { label: "Total Endpoints", value: "8,240", sub: "100%", icon: Monitor, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Healthy Endpoints", value: "7,120", sub: "86%", subColor: "text-emerald-600", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "At Risk Endpoints", value: "820", sub: "10%", subColor: "text-amber-600", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Critical Endpoints", value: "300", sub: "4%", subColor: "text-red-600", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Experience Score (All Users)", value: "86", sub: "Good", subColor: "text-emerald-600", icon: Smile, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Users Impacted", value: "1,250", sub: "15%", subColor: "text-blue-600", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Active Alerts", value: "214", sub: "High / Medium", subColor: "text-amber-600", icon: Bell, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "MTTR (Experience Issues)", value: "28 min", sub: "↓ 18% vs last 7 days", subColor: "text-emerald-600", icon: Timer, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const healthDonut = [
  { name: "Healthy", value: 86, color: "hsl(142 71% 45%)" },
  { name: "At Risk", value: 10, color: "hsl(38 92% 50%)" },
  { name: "Critical", value: 4, color: "hsl(0 84% 60%)" },
];

const healthAttrs = [
  { l: "CPU", v: 88, st: "Good", c: "bg-emerald-500" },
  { l: "Memory", v: 85, st: "Good", c: "bg-emerald-500" },
  { l: "Disk", v: 82, st: "Good", c: "bg-emerald-500" },
  { l: "Patch Compliance", v: 90, st: "Good", c: "bg-emerald-500" },
  { l: "Battery Health", v: 76, st: "Fair", c: "bg-amber-500" },
  { l: "Driver Health", v: 88, st: "Good", c: "bg-emerald-500" },
];

const expTrend = [
  { d: "Feb 7", exp: 78, login: 50, lat: 60 },
  { d: "Feb 8", exp: 80, login: 48, lat: 45 },
  { d: "Feb 9", exp: 82, login: 47, lat: 42 },
  { d: "Feb 10", exp: 81, login: 46, lat: 40 },
  { d: "Feb 11", exp: 84, login: 44, lat: 42 },
  { d: "Feb 12", exp: 83, login: 43, lat: 40 },
  { d: "Feb 13", exp: 86, login: 42, lat: 38 },
];

const expStats = [
  { l: "Login Time (Avg)", v: "42 sec", d: "↓ 15% vs last 7 days", c: "text-emerald-600" },
  { l: "Session Latency (Avg)", v: "86 ms", d: "↓ 12% vs last 7 days", c: "text-emerald-600" },
  { l: "App Load Time (Avg)", v: "3.2 sec", d: "↓ 10% vs last 7 days", c: "text-emerald-600" },
  { l: "Session Reliability", v: "99.2%", d: "↑ 0.6% vs last 7 days", c: "text-emerald-600" },
];

const apps = [
  { a: "Microsoft 365", users: "7,240", rt: "1.8 sec", err: 12, sat: "Low", satC: "text-emerald-600" },
  { a: "Salesforce", users: "3,120", rt: "2.4 sec", err: 18, sat: "Medium", satC: "text-amber-600" },
  { a: "Workday", users: "2,860", rt: "2.7 sec", err: 16, sat: "Medium", satC: "text-amber-600" },
  { a: "ServiceNow", users: "2,100", rt: "2.1 sec", err: 10, sat: "Low", satC: "text-emerald-600" },
  { a: "SAP", users: "1,620", rt: "3.6 sec", err: 24, sat: "High", satC: "text-red-600" },
  { a: "Jira", users: "1,450", rt: "2.2 sec", err: 8, sat: "Low", satC: "text-emerald-600" },
];

const personas = [
  { p: "R&D / Lab", u: "2,150", s: 90, dlt: 6, dir: "↑", dirC: "text-emerald-600" },
  { p: "Sales", u: "1,680", s: 85, dlt: 4, dir: "↑", dirC: "text-emerald-600" },
  { p: "Corporate", u: "2,040", s: 87, dlt: 3, dir: "↑", dirC: "text-emerald-600" },
  { p: "Manufacturing", u: "1,420", s: 82, dlt: 2, dir: "↓", dirC: "text-red-600" },
  { p: "IT / Support", u: "950", s: 91, dlt: 5, dir: "↑", dirC: "text-emerald-600" },
];

const issues = [
  { i: "High Login Time", u: 620, im: "High", c: "text-red-600" },
  { i: "VPN Slowness", u: 410, im: "Medium", c: "text-amber-600" },
  { i: "Application Timeouts", u: 280, im: "High", c: "text-red-600" },
  { i: "Slow App Performance", u: 210, im: "Medium", c: "text-amber-600" },
  { i: "Poor VDI Performance", u: 180, im: "Medium", c: "text-amber-600" },
];

const alerts = [
  { a: "High CPU Usage Detected", sev: "High", sevC: "text-red-600", u: 132, st: "Investigating", stC: "bg-blue-50 text-blue-700 border-blue-200" },
  { a: "Disk Space Low (<10%)", sev: "Medium", sevC: "text-amber-600", u: 256, st: "Open", stC: "bg-slate-50 text-slate-700 border-slate-200" },
  { a: "VPN Gateway High Latency", sev: "High", sevC: "text-red-600", u: 410, st: "Investigating", stC: "bg-blue-50 text-blue-700 border-blue-200" },
  { a: "Windows Update Failed", sev: "Medium", sevC: "text-amber-600", u: 78, st: "Open", stC: "bg-slate-50 text-slate-700 border-slate-200" },
  { a: "MFA Failures Spike", sev: "Low", sevC: "text-emerald-600", u: 54, st: "Monitoring", stC: "bg-amber-50 text-amber-700 border-amber-200" },
];

const flow = [
  { n: 1, icon: Box, c: "text-blue-600", bg: "bg-blue-100", t: "Device Deployed", s: "Device shipped and configured" },
  { n: 2, icon: ShieldCheck, c: "text-emerald-600", bg: "bg-emerald-100", t: "Healthy Device", s: "Device meets health standards" },
  { n: 3, icon: Sparkles, c: "text-violet-600", bg: "bg-violet-100", t: "Apps & Access Ready", s: "User has access to apps and data" },
  { n: 4, icon: Smile, c: "text-amber-600", bg: "bg-amber-100", t: "Great Experience", s: "Fast, reliable, and seamless experience" },
  { n: 5, icon: UserCheck, c: "text-blue-600", bg: "bg-blue-100", t: "User Productive", s: "User is working effectively" },
];

const outcomes: Outcome[] = [];

function Sparkline({ pos = true }: { pos?: boolean }) {
  const data = pos
    ? [{ v: 2 }, { v: 3 }, { v: 2 }, { v: 4 }, { v: 3 }, { v: 5 }, { v: 4 }]
    : [{ v: 4 }, { v: 3 }, { v: 4 }, { v: 2 }, { v: 3 }, { v: 1 }, { v: 2 }];
  return (
    <div className="h-5 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke={pos ? "hsl(142 71% 45%)" : "hsl(25 95% 53%)"} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function EndpointHealth() {
  return (
    <DashShell
      title="ENDPOINT HEALTH & EXPERIENCE MONITORING"
      subtitle="From device management to experience management—ensuring every user is productive, every day."
      wwh={{
        what: [
          "Device health score (CPU, memory, disk, patch)",
          "Login time, session latency, and reliability metrics",
          "Application performance by user and by application",
          "Experience score by persona and location",
          "Real-time alerts and trends impacting user productivity",
        ],
        why: [
          "Success is measured by user productivity, not just device deployment",
          "Poor digital experience drives tickets, downtime, and user frustration",
          "Proactive visibility prevents issues and improves performance",
          "Helps IT focus on experience-impacting problems, not just devices",
          "Improves adoption, retention, and business outcomes",
        ],
        how: [
          "Real-time telemetry from endpoints, networks, apps, and identity systems",
          "AI/ML detects anomalies and predicts experience-impacting issues",
          "Correlates data across device, network, application, and user context",
          "Automated remediation and self-healing actions",
          "Experience scoring model tailored by persona and business priorities",
        ],
      }}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Device Health | Experience Over Time | Application Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Device Health Score (Composite)" action="">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
              <PieChart width={140} height={140}>
                <Pie data={healthDonut} dataKey="value" cx={70} cy={70} innerRadius={45} outerRadius={66} paddingAngle={2}>
                  {healthDonut.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">87</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Good</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1 text-xs">
              {healthAttrs.map((a) => (
                <div key={a.l} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${a.st === "Good" ? "bg-emerald-500" : a.st === "Fair" ? "bg-amber-500" : "bg-red-500"}`} />
                  <span className="flex-1 text-slate-700">{a.l}</span>
                  <span className="font-bold w-8 text-right">{a.v}</span>
                  <span className={`w-10 text-right text-[10px] font-semibold ${a.st === "Good" ? "text-emerald-600" : "text-amber-600"}`}>{a.st}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 text-center mt-3">
            Health score is a weighted average of key device attributes.
          </div>
        </Section>

        <Section title="Experience Over Time (All Users)" action="">
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={expTrend} margin={{ top: 4, right: 30, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="d" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="L" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <YAxis yAxisId="R" orientation="right" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 80]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line yAxisId="L" type="monotone" dataKey="exp" name="Experience Score" stroke="hsl(217 91% 60%)" strokeWidth={1.5} dot />
                <Line yAxisId="R" type="monotone" dataKey="login" name="Login Time (sec)" stroke="hsl(142 71% 45%)" strokeWidth={1.5} dot />
                <Line yAxisId="R" type="monotone" dataKey="lat" name="Session Latency (ms)" stroke="hsl(262 83% 58%)" strokeWidth={1.5} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {expStats.map((s) => (
              <div key={s.l} className="rounded-lg bg-slate-50 border border-slate-100 p-2 text-center">
                <div className="text-[9px] text-slate-500 leading-tight">{s.l}</div>
                <div className="text-sm font-bold">{s.v}</div>
                <div className={`text-[9px] font-semibold ${s.c}`}>{s.d}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Application Performance (Top 6)">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-slate-500 uppercase">
              <tr className="border-b border-slate-100">
                <th className="text-left py-1.5">Application</th>
                <th className="text-right">Users</th>
                <th className="text-right">Resp Time</th>
                <th className="text-right">Errors</th>
                <th className="text-right pl-2">Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.a} className="border-b border-slate-50">
                  <td className="py-1.5 font-semibold flex items-center gap-1.5">
                    <Smartphone className="h-3 w-3 text-slate-400" />{a.a}
                  </td>
                  <td className="text-right">{a.users}</td>
                  <td className="text-right">{a.rt}</td>
                  <td className="text-right">{a.err}</td>
                  <td className={`text-right pl-2 font-semibold ${a.satC}`}>{a.sat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>

      {/* Row 2: Experience by Persona | Top Issues | User Productivity | Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Section title="Experience Score by Persona">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-slate-500 uppercase">
              <tr className="border-b border-slate-100">
                <th className="text-left py-1.5">Persona</th>
                <th className="text-right">Users</th>
                <th className="text-right">Score</th>
                <th className="text-right">Trend</th>
                <th className="text-right pl-1">Δ 7d</th>
              </tr>
            </thead>
            <tbody>
              {personas.map((p) => (
                <tr key={p.p} className="border-b border-slate-50">
                  <td className="py-1.5 font-semibold">{p.p}</td>
                  <td className="text-right">{p.u}</td>
                  <td className="text-right font-bold">{p.s}</td>
                  <td className="text-right"><div className="inline-block"><Sparkline pos={p.dir === "↑"} /></div></td>
                  <td className={`text-right pl-1 font-semibold ${p.dirC}`}>{p.dir} {p.dlt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 p-2 text-[11px] text-blue-700 text-center">
            Experience score is based on performance, reliability, and user sentiment.
          </div>
        </Section>

        <Section title="Top Experience Issues">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-slate-500 uppercase">
              <tr className="border-b border-slate-100">
                <th className="text-left py-1.5">Issue</th>
                <th className="text-right">Users</th>
                <th className="text-right">Impact</th>
                <th className="text-right pl-1">Trend</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((i) => (
                <tr key={i.i} className="border-b border-slate-50">
                  <td className="py-1.5 font-semibold">{i.i}</td>
                  <td className="text-right">{i.u}</td>
                  <td className={`text-right font-semibold ${i.c}`}>{i.im}</td>
                  <td className="text-right pl-1"><div className="inline-block"><Sparkline pos={false} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 rounded-lg bg-red-50 border border-red-100 p-2 text-[11px] text-red-700 text-center">
            Issues are ranked by number of users impacted and severity.
          </div>
        </Section>

        <Section title="User Productivity Indicators">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" /> Successful Logins
              </div>
              <div className="text-lg font-bold text-emerald-700">98.6%</div>
              <div className="text-[10px] text-slate-500">Target: ≥ 97%</div>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-blue-700">
                <Timer className="h-3.5 w-3.5" /> Time to Productivity
              </div>
              <div className="text-lg font-bold text-blue-700">12.4 min</div>
              <div className="text-[10px] text-slate-500">Target: ≤ 15 min</div>
            </div>
            <div className="rounded-lg bg-violet-50 border border-violet-100 p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-violet-700">
                <BarChart3 className="h-3.5 w-3.5" /> App Adoption
              </div>
              <div className="text-lg font-bold text-violet-700">92.1%</div>
              <div className="text-[10px] text-slate-500">Target: ≥ 90%</div>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-amber-700">
                <Users className="h-3.5 w-3.5" /> Collaboration Score
              </div>
              <div className="text-lg font-bold text-amber-700">88</div>
              <div className="text-[10px] text-slate-500">Target: ≥ 85</div>
            </div>
          </div>
        </Section>

        <Section title="Alerts & Insights (Real-Time)">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-slate-500 uppercase">
              <tr className="border-b border-slate-100">
                <th className="text-left py-1.5">Alert</th>
                <th className="text-right">Sev</th>
                <th className="text-right">Users</th>
                <th className="text-right pl-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.a} className="border-b border-slate-50">
                  <td className="py-1.5 font-semibold flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${a.sevC === "text-red-600" ? "bg-red-500" : a.sevC === "text-amber-600" ? "bg-amber-500" : "bg-emerald-500"}`} />
                    {a.a}
                  </td>
                  <td className={`text-right font-semibold ${a.sevC}`}>{a.sev}</td>
                  <td className="text-right">{a.u}</td>
                  <td className="text-right pl-1">
                    <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border ${a.stC}`}>{a.st}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 rounded-lg bg-violet-50 border border-violet-100 p-2 text-[11px] text-violet-700 text-center flex items-center gap-1.5 justify-center">
            <Sparkles className="h-3 w-3" /> AI is analyzing patterns and preventing impact proactively.
          </div>
        </Section>
      </div>

      {/* From Deploy to Productivity Flow */}
      <Section title="From Deploy to Productivity: Our Goal" action="">
        <div className="flex items-center gap-2 overflow-x-auto">
          {flow.map((s, i) => {
            const I = s.icon;
            return (
              <div key={s.n} className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`h-9 w-9 rounded-full ${s.bg} ${s.c} grid place-items-center shrink-0`}>
                    <I className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-[11px] font-bold leading-tight ${s.c}`}>{s.n}. {s.t}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{s.s}</div>
                  </div>
                </div>
                {i < flow.length - 1 && <span className="text-slate-300">→</span>}
              </div>
            );
          })}
          <div className="ml-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 shrink-0 flex items-center gap-2">
            <MonitorCheck className="h-5 w-5 text-emerald-600" />
            <div>
              <div className="text-[11px] font-bold text-emerald-700 leading-tight">Outcome: Productive Waters Workforce</div>
              <div className="text-[10px] text-emerald-700">We optimize for user experience. Because productivity is the real metric.</div>
            </div>
          </div>
        </div>
      </Section>
    </DashShell>
  );
}
