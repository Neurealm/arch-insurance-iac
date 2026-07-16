import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Users, CheckCircle, Clock, AlertCircle, Lock, AlertTriangle, XCircle, ShieldCheck,
  TrendingUp, Activity, Eye, Target, Calendar,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
} from "recharts";

const kpis: KPI[] = [
  { label: "Total Users in Scope",      value: "8,000", sub: "100%",         icon: Users,        color: "text-blue-600",   bg: "bg-blue-50" },
  { label: "Migrated to Waters Domain", value: "6,240", sub: "78%",          subColor: "text-emerald-600", icon: CheckCircle,  color: "text-emerald-600",bg: "bg-emerald-50" },
  { label: "In Progress",               value: "1,120", sub: "14%",          subColor: "text-amber-600",   icon: Clock,        color: "text-amber-600",  bg: "bg-amber-50" },
  { label: "Not Migrated",              value: "640",   sub: "8%",           subColor: "text-red-600",     icon: AlertCircle,  color: "text-red-600",    bg: "bg-red-50" },
  { label: "MFA Re-Enrolled",           value: "6,560", sub: "82%",          subColor: "text-emerald-600", icon: Lock,         color: "text-violet-600", bg: "bg-violet-50" },
  { label: "MFA Pending",               value: "960",   sub: "12%",          subColor: "text-amber-600",   icon: AlertTriangle,color: "text-amber-600",  bg: "bg-amber-50" },
  { label: "MFA Failed",                value: "480",   sub: "6%",           subColor: "text-red-600",     icon: XCircle,      color: "text-red-600",    bg: "bg-red-50" },
  { label: "Overall Identity Readiness",value: "81%",   sub: "Good",         subColor: "text-emerald-600", icon: ShieldCheck,  color: "text-blue-600",   bg: "bg-blue-50" },
];

const migrationDonut = [
  { name: "Migrated",    value: 6240, color: "hsl(142 71% 45%)" },
  { name: "In Progress", value: 1120, color: "hsl(38 92% 50%)" },
  { name: "Not Migrated",value: 640,  color: "hsl(0 84% 60%)" },
  { name: "Excluded",    value: 0,    color: "hsl(215 20% 80%)" },
];

const migRows = [
  { l: "Migrated",    n: "6,240", p: "78%", c: "bg-emerald-500", color: "text-emerald-600" },
  { l: "In Progress", n: "1,120", p: "14%", c: "bg-amber-500",   color: "text-amber-600" },
  { l: "Not Migrated",n: "640",   p: "6%",  c: "bg-red-500",     color: "text-red-600" },
  { l: "Excluded",    n: "0",     p: "0%",  c: "bg-slate-300",   color: "text-slate-500" },
];

const mfaRows = [
  { l: "Re-Enrolled", n: "6,560", p: "82%", w: 82, c: "bg-emerald-500" },
  { l: "Pending",     n: "960",   p: "12%", w: 12, c: "bg-amber-500" },
  { l: "Failed",      n: "480",   p: "6%",  w: 6,  c: "bg-red-500" },
];

const conflicts = [
  { sev: "Critical", c: "bg-red-500",     n: 42, p: "20%" },
  { sev: "High",     c: "bg-orange-500",  n: 86, p: "40%" },
  { sev: "Medium",   c: "bg-amber-500",   n: 64, p: "30%" },
  { sev: "Low",      c: "bg-slate-400",   n: 22, p: "10%" },
];

const issueTypes = [
  { l: "Duplicate Accounts",         n: 78 },
  { l: "Orphaned Accounts",          n: 54 },
  { l: "SID / UPN Conflicts",        n: 36 },
  { l: "Group Membership Conflicts", n: 24 },
  { l: "License Assignment Issues",  n: 22 },
];

const ssoApps = [
  { app: "Microsoft 365", ready: "7,520", testing: "320", notReady: "160", pct: "94%", color: "text-emerald-600" },
  { app: "Salesforce",    ready: "7,280", testing: "400", notReady: "320", pct: "91%", color: "text-emerald-600" },
  { app: "Workday",       ready: "7,040", testing: "480", notReady: "480", pct: "88%", color: "text-amber-600" },
  { app: "ServiceNow",    ready: "6,880", testing: "560", notReady: "560", pct: "86%", color: "text-amber-600" },
  { app: "SAP Concur",    ready: "6,640", testing: "640", notReady: "720", pct: "83%", color: "text-amber-600" },
  { app: "Jira",          ready: "6,720", testing: "560", notReady: "720", pct: "84%", color: "text-amber-600" },
];

const timeline = [
  { d: "Feb 7",  dom: 12, mfa: 8,  sso: 6 },
  { d: "Feb 8",  dom: 22, mfa: 18, sso: 14 },
  { d: "Feb 9",  dom: 35, mfa: 28, sso: 24 },
  { d: "Feb 10", dom: 48, mfa: 42, sso: 36 },
  { d: "Feb 11", dom: 58, mfa: 56, sso: 48 },
  { d: "Feb 12", dom: 68, mfa: 70, sso: 62 },
  { d: "Feb 13", dom: 78, mfa: 82, sso: 75 },
];

const health = [
  { c: "Active Directory (Waters)", st: "Healthy",  health: "98%", trend: "low",  imp: "Low",    color: "text-emerald-600" },
  { c: "Azure AD",                  st: "Healthy",  health: "94%", trend: "low",  imp: "Low",    color: "text-emerald-600" },
  { c: "MFA Service",               st: "Degraded", health: "88%", trend: "med",  imp: "Medium", color: "text-amber-600" },
  { c: "Identity Sync (Entra Connect)", st: "Healthy", health: "93%", trend: "low", imp: "Low", color: "text-emerald-600" },
  { c: "Access Certifications",     st: "Healthy",  health: "90%", trend: "low",  imp: "Low",    color: "text-emerald-600" },
  { c: "Password Reset Service",    st: "Healthy",  health: "95%", trend: "low",  imp: "Low",    color: "text-emerald-600" },
];

const alerts = [
  { t: "10:28 AM", sev: "Critical", color: "text-red-600",    msg: "MFA enrollment failed for 42 users",         st: "In Progress" },
  { t: "10:21 AM", sev: "High",     color: "text-orange-600", msg: "Duplicate account detected for 18 users",    st: "In Progress" },
  { t: "10:15 AM", sev: "High",     color: "text-orange-600", msg: "Group membership conflict for 32 users",     st: "In Progress" },
  { t: "10:08 AM", sev: "Medium",   color: "text-amber-600",  msg: "SSO test failed for ServiceNow (2 users)",   st: "Investigating" },
  { t: "10:02 AM", sev: "Info",     color: "text-blue-600",   msg: "Domain migration completed for EMEA region", st: "Completed" },
];

const outcomes: Outcome[] = [
  { icon: ShieldCheck, color: "text-blue-600",    title: "SECURE CUTOVER",       l1: "Minimizing risk and ensuring secure access for every user" },
  { icon: Users,       color: "text-emerald-600", title: "USER EXPERIENCE",      l1: "Enabling seamless Day 1 productivity" },
  { icon: AlertTriangle,color:"text-violet-600",  title: "RISK REDUCTION",       l1: "Proactive detection and remediation of identity issues" },
  { icon: TrendingUp,  color: "text-amber-600",   title: "OPERATIONAL VISIBILITY", l1: "Real-time insights for faster, data-driven decisions" },
  { icon: Target,      color: "text-blue-600",    title: "DAY 1 READINESS",      l1: "Driving toward 100% identity readiness for launch" },
];

function MiniSpark({ tone }: { tone: "low" | "med" | "high" }) {
  const stroke = tone === "med" ? "hsl(38 92% 50%)" : tone === "high" ? "hsl(0 84% 60%)" : "hsl(142 71% 45%)";
  const data = Array.from({ length: 14 }, (_, i) => ({ i, v: 50 + Math.sin(i / 1.5 + (tone === "med" ? 1 : 0)) * (tone === "med" ? 18 : 8) + Math.random() * 6 }));
  return (
    <div className="h-6 w-24">
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function IdentityCutover() {
  return (
    <DashShell
      title="IDENTITY & ACCESS CUTOVER DASHBOARD"
      subtitle="Ensuring a secure, successful transition from BD → Waters"
      wwh={{
        what: [
          "Domain migration status (BD → Waters)",
          "MFA re-enrollment tracking",
          "Identity conflicts / failures",
          "SSO readiness across critical applications",
          "Overall identity & access readiness for Day 1",
        ],
        why: [
          "Identity is one of the highest-risk steps in separation",
          "User access failure = no productivity on Day 1",
          "Ensures secure, compliant, and consistent access for all users",
          "Reduces risk of lockouts, access gaps, and security exposure",
          "Executive visibility into cutover health and readiness",
        ],
        how: [
          "Real-time telemetry from identity, directory, MFA, and app systems",
          "Automated orchestration of domain migration & MFA re-enrollment",
          "AI-driven conflict detection and remediation workflows",
          "Continuous SSO testing and readiness validation",
          "Agentic automation for alerts, remediation, and reporting",
        ],
      }}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1 — Migration donut + MFA + Conflicts + SSO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        <Section title="Domain Migration Status (BD → Waters)" className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0" style={{ width: 176, height: 176 }}>
              <PieChart width={176} height={176}>
                <Pie data={migrationDonut} dataKey="value" cx={88} cy={88} innerRadius={52} outerRadius={78} paddingAngle={1}>
                  {migrationDonut.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">78%</div>
                  <div className="text-[10px] text-slate-500">Migrated</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2 text-[11px]">
              {migRows.map((r) => (
                <div key={r.l} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${r.c}`} /><span className="text-slate-700">{r.l}</span></span>
                  <span><b className="text-slate-900">{r.n}</b> <span className={r.color}>({r.p})</span></span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-700 font-semibold">Total Users</span>
                <b className="text-slate-900">8,000</b>
              </div>
            </div>
          </div>
        </Section>

        <Section title="MFA Re-Enrollment Tracking" className="lg:col-span-3">
          <div className="space-y-3">
            {mfaRows.map((r) => (
              <div key={r.l}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-700">{r.l}</span>
                  <span><b className="text-slate-900">{r.n}</b> <span className="text-slate-500">({r.p})</span></span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${r.c}`} style={{ width: `${r.w}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-700"><CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> MFA Success Rate</span>
            <div className="text-right">
              <div className="text-base font-bold text-emerald-700 leading-none">93.2%</div>
              <div className="text-[9px] text-slate-500">Target ≥ 90%</div>
            </div>
          </div>
        </Section>

        <Section title="Identity Conflicts / Failures" action="View All" className="lg:col-span-2">
          <div className="text-3xl font-bold text-red-600">214</div>
          <div className="text-[10px] text-slate-500 mb-2">Total Issues</div>
          <div className="space-y-1.5 text-[11px] mb-3">
            {conflicts.map((c) => (
              <div key={c.sev} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${c.c}`} /><span className="text-slate-700">{c.sev}</span></span>
                <span><b className="text-slate-900">{c.n}</b> <span className="text-slate-500">({c.p})</span></span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Top Issue Types</div>
            <div className="space-y-1 text-[10px]">
              {issueTypes.map((i) => (
                <div key={i.l} className="flex items-center justify-between">
                  <span className="text-slate-700">{i.l}</span>
                  <b className="text-slate-900">{i.n}</b>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="SSO Readiness Across Applications" action="View All →" className="lg:col-span-3">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="text-left py-1.5">App</th>
                <th className="text-right">Ready</th>
                <th className="text-right">Test</th>
                <th className="text-right">Not</th>
                <th className="text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {ssoApps.map((s) => (
                <tr key={s.app} className="border-b border-slate-50">
                  <td className="py-1.5 font-semibold text-slate-900">{s.app}</td>
                  <td className="text-right text-slate-700">{s.ready}</td>
                  <td className="text-right text-slate-700">{s.testing}</td>
                  <td className="text-right text-slate-700">{s.notReady}</td>
                  <td className={`text-right font-bold ${s.color}`}>{s.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>

      {/* Row 2 — Timeline + Health Monitor + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        <Section title="Cutover Progress Timeline" className="lg:col-span-4">
          <div className="w-full" style={{ height: 208 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={timeline}>
                <XAxis dataKey="d" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={32} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} iconType="line" />
                <Line type="monotone" dataKey="dom" name="Domain Migration" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="mfa" name="MFA Re-Enrollment" stroke="hsl(262 83% 58%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="sso" name="SSO Readiness" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-700"><Calendar className="h-3.5 w-3.5 text-blue-600" /> Day 1 Readiness Target (Feb 15, 2026)</span>
            <div className="text-right">
              <div className="text-base font-bold text-blue-700 leading-none">81%</div>
              <div className="text-[9px] text-slate-500">Current Readiness</div>
            </div>
          </div>
        </Section>

        <Section title="Identity Health Monitor" action="View Details →" className="lg:col-span-4">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="text-left py-1.5">Component</th>
                <th className="text-left">Status</th>
                <th className="text-right">Health</th>
                <th className="text-center">Trend (7d)</th>
                <th className="text-right">Impact</th>
              </tr>
            </thead>
            <tbody>
              {health.map((h) => (
                <tr key={h.c} className="border-b border-slate-50">
                  <td className="py-1.5 font-semibold text-slate-900">{h.c}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1 ${h.color}`}>
                      {h.st === "Degraded" ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                      <span className="text-[10px] font-medium">{h.st}</span>
                    </span>
                  </td>
                  <td className="text-right font-medium">{h.health}</td>
                  <td><div className="flex justify-center"><MiniSpark tone={h.trend as "low" | "med" | "high"} /></div></td>
                  <td className={`text-right font-medium ${h.color}`}>{h.imp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Recent Alerts & Actions" action="View All →" className="lg:col-span-4">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="text-left py-1.5">Time</th>
                <th className="text-left">Severity</th>
                <th className="text-left">Alert / Action</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="py-1.5 text-slate-600">{a.t}</td>
                  <td className={`font-bold ${a.color}`}>{a.sev}</td>
                  <td className="text-slate-700">{a.msg}</td>
                  <td className="text-right">
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border ${a.st === "Completed" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : a.st === "Investigating" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-blue-700 bg-blue-50 border-blue-200"}`}>{a.st}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </DashShell>
  );
}