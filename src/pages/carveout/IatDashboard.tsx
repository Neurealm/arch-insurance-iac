import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Users, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Lock, KeyRound, UserCog,
  Target, Bot, Activity, Gauge,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  CartesianGrid, AreaChart, Area, BarChart, Bar, Legend, XAxis, YAxis,
} from "recharts";

const kpis: KPI[] = [
  { label: "Day 1 Access Readiness", value: "99.2%", sub: "↑ 9.2% vs prior 30 days", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Access Provisioning MTTD", value: "15m 32s", sub: "↓ 32% vs prior 30 days", subColor: "text-emerald-600", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Access Deprovisioning MTTD", value: "28m 45s", sub: "↓ 17% vs prior 30 days", subColor: "text-emerald-600", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Access Accuracy", value: "99%", sub: "↑ 9% vs prior 30 days", subColor: "text-emerald-600", icon: Gauge, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Access Recertification Rate", value: "98%", sub: "↑ 5% vs prior 30 days", subColor: "text-emerald-600", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Privileged Access Compliance", value: "96%", sub: "↑ 6% vs prior 30 days", subColor: "text-emerald-600", icon: Lock, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Identity Score", value: "92 / 100", sub: "Healthy · ↑ 7 pts", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Open Actions", value: "7", sub: "2 high · 3 medium · 2 low", subColor: "text-amber-600", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
];

const lifecycle = [
  { name: "New Access", value: 1008, pct: "41%", color: "hsl(262 83% 58%)" },
  { name: "Access Modified", value: 811, pct: "33%", color: "hsl(217 91% 60%)" },
  { name: "Access Accrued", value: 540, pct: "22%", color: "hsl(142 71% 45%)" },
  { name: "Access Expired", value: 99, pct: "4%", color: "hsl(38 92% 50%)" },
];

const appCategory = [
  { name: "User Apps", value: 412, pct: "62%", color: "hsl(262 83% 58%)" },
  { name: "Admin Apps", value: 268, pct: "55%", color: "hsl(217 91% 60%)" },
  { name: "Cloud / SaaS", value: 137, pct: "12%", color: "hsl(142 71% 45%)" },
  { name: "Custom", value: 50, pct: "6%", color: "hsl(38 92% 50%)" },
];

const riskBuckets = [
  { name: "Critical", value: 66, pct: "48%", color: "hsl(0 84% 60%)" },
  { name: "High", value: 66, pct: "27%", color: "hsl(20 90% 55%)" },
  { name: "Medium", value: 59, pct: "19%", color: "hsl(38 92% 50%)" },
  { name: "Low", value: 44, pct: "11%", color: "hsl(217 91% 60%)" },
  { name: "Informational", value: 13, pct: "5%", color: "hsl(220 13% 65%)" },
];

const actions = [
  { p: "High", reason: "12 orphaned accounts need review", due: "Due ~ 3 hours" },
  { p: "High", reason: "8 access requests awaiting approval", due: "Due ~ 4 hours" },
  { p: "Medium", reason: "15 overdue recertifications", due: "Due ~ 1 day" },
  { p: "Medium", reason: "6 privileged accounts without MFA", due: "Due ~ 2 days" },
  { p: "Low", reason: "23 inactive accounts for removal", due: "Due ~ 7 days" },
];

const certGov = [
  { l: "Certifications Sent", n: "2,145", t: "↑ 14%" },
  { l: "Certifications Completed", n: "1,442", t: "↑ 25%" },
  { l: "Overdue Certifications", n: "303", t: "↓ 10%" },
  { l: "Completion Rate", n: "80%", t: "↑ 8%" },
];

const policy = [
  { l: "Least Privilege", v: 99 },
  { l: "MFA Enforcement", v: 99 },
  { l: "SoD Compliance", v: 97 },
  { l: "Access Review Policy", v: 97 },
  { l: "Password Policy", v: 100 },
];

const trend = [
  { d: "W1", prov: 88, deprov: 80, acc: 92 },
  { d: "W2", prov: 90, deprov: 83, acc: 94 },
  { d: "W3", prov: 92, deprov: 85, acc: 95 },
  { d: "W4", prov: 94, deprov: 88, acc: 96 },
  { d: "W5", prov: 96, deprov: 91, acc: 97 },
  { d: "W6", prov: 98, deprov: 94, acc: 98 },
  { d: "W7", prov: 99, deprov: 96, acc: 99 },
];

const requests = [
  { type: "Application Access", count: "1,345", pct: "56%", trend: "Up" },
  { type: "Role Assignment", count: "654", pct: "25%", trend: "Up" },
  { type: "Privileged Access", count: "326", pct: "12%", trend: "Flat" },
  { type: "Role Access", count: "126", pct: "6%", trend: "Down" },
  { type: "Other", count: "47", pct: "3%", trend: "Flat" },
];

const wwh = {
  what: [
    "Day 1 access readiness across users, apps and systems",
    "Provisioning, deprovisioning, recertification and accuracy KPIs",
    "Privileged access posture and policy compliance",
    "Identity score, risk distribution and open actions",
  ],
  why: [
    "Right access on Day 1 protects productivity and revenue",
    "Eliminates orphaned, excessive and conflicting access",
    "Audit-ready evidence for regulators and certifications",
    "Reduces breach exposure and access-related incidents",
  ],
  how: [
    "Ingest signals from AD, Entra, Okta, Ping, HR and IAM tools",
    "Automate provisioning, deprovisioning and access reviews",
    "Continuous policy enforcement: least privilege, SoD, MFA, JIT",
    "Real-time dashboards, alerts and remediation workflows",
  ],
};

const outcomes: Outcome[] = [
  { icon: Target, color: "text-blue-600", title: "Day 1 Ready", l1: "Right access for the right people on Day 1" },
  { icon: ShieldCheck, color: "text-emerald-600", title: "Secure", l1: "Least privilege, MFA and JIT enforced" },
  { icon: UserCog, color: "text-violet-600", title: "Compliant", l1: "Audit-ready certifications and SoD" },
  { icon: Bot, color: "text-amber-600", title: "Automated", l1: "Faster, lower-effort access operations" },
];

function Donut({ data, total, sub }: { data: { name: string; value: number; color: string }[]; total: string | number; sub?: string }) {
  return (
    <div className="relative h-44 w-44">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-extrabold text-slate-900">{total}</div>
          {sub && <div className="text-[10px] text-slate-500">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

export default function IatDashboard() {
  const nav = useNavigate();
  return (
    <DashShell
      title="IDENTITY & ACCESS"
      highlight="TRANSITION DASHBOARD"
      subtitle="AI-powered identity and access orchestration—ensuring the right access, for the right people, at the right time, securely on Day 1 and beyond."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
      topActions={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button onClick={() => nav("/coworkers/it-carve-out-and-separation")} className="text-xs text-slate-600 inline-flex items-center gap-1 hover:text-slate-900 font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to IT Carve-Out
          </button>
          <div className="flex items-center gap-2">
            <Button onClick={() => nav("/coworkers/it-carve-out-and-separation/iat/overview")} variant="outline" className="h-10 px-4 font-semibold">
              <FileText className="h-4 w-4" /> Overview
            </Button>
            <Button onClick={() => nav("/coworkers/it-carve-out-and-separation/iat/solution-design")} className="h-10 px-4 font-semibold bg-navy hover:bg-navy/90 text-white">
              <Workflow className="h-4 w-4" /> Solution Design
            </Button>
          </div>
        </div>
      }
    >
      {/* Row 1 — three donuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <Section title="Access Lifecycle Overview">
            <div className="flex items-center gap-3">
              <Donut data={lifecycle} total="2,458" sub="Total Changes (50d)" />
              <div className="flex-1 space-y-1 text-[11px]">
                {lifecycle.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="flex-1 text-slate-700">{d.name}</span>
                    <span className="font-semibold text-slate-900">{d.value}</span>
                    <span className="text-slate-500">({d.pct})</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-4">
          <Section title="Access by Application Category">
            <div className="flex items-center gap-3">
              <Donut data={appCategory} total="842" sub="Applications" />
              <div className="flex-1 space-y-1 text-[11px]">
                {appCategory.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="flex-1 text-slate-700">{d.name}</span>
                    <span className="font-semibold text-slate-900">{d.value}</span>
                    <span className="text-slate-500">({d.pct})</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-4">
          <Section title="Access Risk Distribution">
            <div className="flex items-center gap-3">
              <Donut data={riskBuckets} total="249" sub="At-Risk Access" />
              <div className="flex-1 space-y-1 text-[11px]">
                {riskBuckets.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="flex-1 text-slate-700">{d.name}</span>
                    <span className="font-semibold text-slate-900">{d.value}</span>
                    <span className="text-slate-500">({d.pct})</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Row 2 — privileged + trend + actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <div className="lg:col-span-4">
          <Section title="Privileged Access Overview">
            <div className="space-y-3 mt-1">
              {[
                { l: "Privileged Accounts", v: "1,248", t: "↓ 3%", c: "text-emerald-600" },
                { l: "Active Privileged", v: "842", t: "↑ 2%", c: "text-amber-600" },
                { l: "MFA Coverage", v: "98%", t: "↑ 2%", c: "text-emerald-600" },
                { l: "PAM Coverage", v: "96%", t: "↑ 4%", c: "text-emerald-600" },
                { l: "JIT Access Usage", v: "76%", t: "↑ 6%", c: "text-emerald-600" },
              ].map((r) => (
                <div key={r.l} className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-700 inline-flex items-center gap-2"><KeyRound className="h-3.5 w-3.5 text-violet-600" />{r.l}</span>
                  <span className="font-semibold text-slate-900">{r.v} <span className={`text-[10px] font-medium ${r.c}`}>{r.t}</span></span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="lg:col-span-5">
          <Section title="Provisioning, Deprovisioning & Accuracy Trend (7 weeks)">
            <div className="h-52">
              <ResponsiveContainer>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="iatA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[70, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="prov" name="Provisioning" stroke="hsl(217 91% 60%)" fill="url(#iatA)" strokeWidth={2} />
                  <Area type="monotone" dataKey="deprov" name="Deprovisioning" stroke="hsl(262 83% 58%)" fill="transparent" strokeWidth={2} />
                  <Area type="monotone" dataKey="acc" name="Accuracy" stroke="hsl(142 71% 45%)" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Actions Required (7)">
            <ul className="space-y-2">
              {actions.map((a, i) => (
                <li key={i} className="rounded-lg border border-slate-200 px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <StatusPill status={`${a.p} Priority`} />
                    <span className="text-[10px] text-slate-500">{a.due}</span>
                  </div>
                  <div className="text-[12px] text-slate-800">{a.reason}</div>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>

      {/* Row 3 — requests, certifications, policy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <div className="lg:col-span-4">
          <Section title="Top Access Request Trends">
            <table className="w-full text-[11px]">
              <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1.5">Request Type</th>
                  <th className="text-right py-1.5">Count</th>
                  <th className="text-right py-1.5">% of Total</th>
                  <th className="text-left py-1.5 pl-3">Trend</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.type} className="border-b border-slate-100">
                    <td className="py-2 font-medium text-slate-800">{r.type}</td>
                    <td className="py-2 text-right text-slate-700">{r.count}</td>
                    <td className="py-2 text-right text-slate-700">{r.pct}</td>
                    <td className="py-2 pl-3"><StatusPill status={r.trend} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        <div className="lg:col-span-4">
          <Section title="Certification & Governance">
            <div className="grid grid-cols-2 gap-3">
              {certGov.map((c) => (
                <div key={c.l} className="rounded-lg border border-slate-200 p-3">
                  <div className="text-[10px] text-slate-500">{c.l}</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">{c.n}</div>
                  <div className="text-[10px] text-emerald-600">{c.t}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="lg:col-span-4">
          <Section title="Policy & Compliance">
            <div className="space-y-3 mt-1">
              {policy.map((p) => (
                <div key={p.l}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-700 font-medium">{p.l}</span>
                    <span className="font-semibold text-slate-900">{p.v}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${p.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* Row 4 — automation strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        {[
          { l: "Automated Provisioning", v: "1,842", t: "↑ 18%" },
          { l: "Automated Deprovisioning", v: "1,428", t: "↑ 21%" },
          { l: "Policy Violations Auto-Blocked", v: "382", t: "↑ 12%" },
          { l: "Access Requests Auto-Approved", v: "1,156", t: "↑ 18%" },
          { l: "Workflows Executed", v: "3,248", t: "↑ 18%" },
          { l: "Automation Rate", v: "78%", t: "↑ 17%" },
        ].map((m) => (
          <div key={m.l} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-[10px] text-slate-500">{m.l}</div>
            <div className="text-lg font-extrabold text-slate-900 mt-1">{m.v}</div>
            <div className="text-[10px] text-emerald-600">{m.t}</div>
          </div>
        ))}
      </div>
    </DashShell>
  );
}