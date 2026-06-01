import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Cloud, CheckCircle2, Clock, AlertTriangle, ShieldCheck, DollarSign,
  Target, Bot, Gauge, Server, Layers, TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  CartesianGrid, AreaChart, Area, BarChart, Bar, Legend, XAxis, YAxis,
} from "recharts";

const kpis: KPI[] = [
  { label: "Migration Progress", value: "68%", sub: "↑ 11% vs prior 30 days", subColor: "text-emerald-600", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Workload Success Rate", value: "98%", sub: "↑ 2% vs prior 30 days", subColor: "text-emerald-600", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Time to Migrate (Avg)", value: "28m 45s", sub: "↓ 18% vs prior 30 days", subColor: "text-emerald-600", icon: Clock, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Cost Optimization", value: "19%", sub: "↑ 4% vs prior 30 days", subColor: "text-emerald-600", icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Cloud Reliability", value: "99.9%", sub: "↑ 0.12% vs prior 30 days", subColor: "text-emerald-600", icon: Gauge, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Security Compliance", value: "96%", sub: "↑ 5% vs prior 30 days", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Cloud Health Score", value: "87 / 100", sub: "Healthy · ↑ 7 pts", subColor: "text-emerald-600", icon: Cloud, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Open Actions", value: "7", sub: "2 high · 3 medium · 2 low", subColor: "text-amber-600", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
];

const stage = [
  { name: "Assessment", value: 312, pct: "11%", color: "hsl(217 91% 60%)" },
  { name: "Planning", value: 242, pct: "33%", color: "hsl(262 83% 58%)" },
  { name: "Migration", value: 515, pct: "11%", color: "hsl(38 92% 50%)" },
  { name: "Testing", value: 512, pct: "11%", color: "hsl(142 71% 45%)" },
  { name: "Completion", value: 515, pct: "13%", color: "hsl(174 62% 47%)" },
];

const dest = [
  { name: "AWS", value: 512, pct: "41%", color: "hsl(28 90% 55%)" },
  { name: "Azure", value: 432, pct: "35%", color: "hsl(217 91% 60%)" },
  { name: "GCP", value: 196, pct: "16%", color: "hsl(0 84% 60%)" },
  { name: "Private Cloud", value: 68, pct: "6%", color: "hsl(142 71% 45%)" },
  { name: "Other", value: 40, pct: "3%", color: "hsl(220 13% 65%)" },
];

const migTimeline = [
  { d: "Apr 21", Completed: 580, InProgress: 120, Planned: 80 },
  { d: "Apr 28", Completed: 620, InProgress: 140, Planned: 90 },
  { d: "May 5", Completed: 540, InProgress: 130, Planned: 70 },
  { d: "May 12", Completed: 510, InProgress: 110, Planned: 60 },
  { d: "May 19", Completed: 480, InProgress: 100, Planned: 50 },
];

const modernization = [
  { l: "Replatform to PaaS", v: 68 },
  { l: "Refactor (Microservices)", v: 54 },
  { l: "Rehost (Lift & Shift)", v: 49 },
  { l: "Serverless Modernization", v: 41 },
  { l: "Database Modernization", v: 37 },
  { l: "Containerization", v: 33 },
];

const actions = [
  { p: "High", reason: "5 migrations behind schedule", due: "Due ~ 8 hours" },
  { p: "High", reason: "12 security findings need attention", due: "Due ~ 4 hours" },
  { p: "Medium", reason: "29 workloads need rebaselining", due: "Due ~ 1 day" },
  { p: "Medium", reason: "10 workloads need recommendation", due: "Due ~ 9 days" },
  { p: "Low", reason: "33 cost anomalies need review", due: "Due ~ 9 days" },
];

const costDrivers = [
  { svc: "EC2 / Compute", spend: "$1.22M", pct: "25%", t: "Up" },
  { svc: "Storage (EBS/S3)", spend: "$742K", pct: "26%", t: "Up" },
  { svc: "Data Transfer", spend: "$460K", pct: "15%", t: "Down" },
  { svc: "Databases", spend: "$412K", pct: "15%", t: "Up" },
  { svc: "Other Services", spend: "$412K", pct: "25%", t: "Down" },
];

const security = [
  { l: "Identity & Access Mgmt", v: 96 },
  { l: "Data Protection", v: 95 },
  { l: "Network Security", v: 97 },
  { l: "Vulnerability Mgmt", v: 93 },
  { l: "Compliance Adherence", v: 96 },
];

const opsExcellence = [
  { l: "Change Success Rate", v: "97%", t: "↑ 3%" },
  { l: "MTTR (Incidents)", v: "42m", t: "↓ 40m" },
  { l: "Deployment Frequency", v: "3.2 / day", t: "↑ 78%" },
  { l: "Cloud Automation", v: "78%", t: "↑ 94%" },
  { l: "Policy Compliance", v: "94%", t: "↑ 4%" },
  { l: "Tagging Compliance", v: "91%", t: "↑ 6%" },
];

const wwh = {
  what: [
    "Day 1 cloud readiness across workloads, data and platforms",
    "Migration progress, success rate and time-to-migrate KPIs",
    "Cost optimization, security posture and reliability tracking",
    "Modernization initiatives, automation and operational excellence",
  ],
  why: [
    "Faster, safer cloud migrations protect business continuity",
    "Cloud-smart spend keeps unit economics on plan",
    "Built-in security and compliance from Day 1",
    "Modern, automated cloud operations enable scale and innovation",
  ],
  how: [
    "Ingest signals from AWS, Azure, GCP, CMDB, ITSM and FinOps tools",
    "Automate assessment, migration waves, validation and cutover",
    "Continuous policy, security and cost guardrails",
    "Real-time dashboards, runbooks and auto-remediation",
  ],
};

const outcomes: Outcome[] = [
  { icon: Target, color: "text-blue-600", title: "Migrate Faster", l1: "30–50% lower migration risk and rework" },
  { icon: DollarSign, color: "text-emerald-600", title: "Optimize Cost", l1: "20–40% lower cloud spend" },
  { icon: ShieldCheck, color: "text-violet-600", title: "Secure & Compliant", l1: "99%+ reliability, built-in compliance" },
  { icon: Bot, color: "text-amber-600", title: "Automated", l1: "Modernized, automated cloud operations" },
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

export default function CmmDashboard() {
  const nav = useNavigate();
  return (
    <DashShell
      title="CLOUD MIGRATION & MODERNIZATION"
      highlight="OPERATIONAL DASHBOARD"
      subtitle="AI-powered orchestration of cloud migrations and modernization—secure, cost-optimized, and built for performance from Day 1 and beyond."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
      topActions={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button onClick={() => nav("/coworkers/it-carve-out-and-separation")} className="text-xs text-slate-600 inline-flex items-center gap-1 hover:text-slate-900 font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to IT Carve-Out
          </button>
          <div className="flex items-center gap-2">
            <Button onClick={() => nav("/coworkers/it-carve-out-and-separation/cmm/overview")} variant="outline" className="h-10 px-4 font-semibold">
              <FileText className="h-4 w-4" /> Overview
            </Button>
            <Button onClick={() => nav("/coworkers/it-carve-out-and-separation/cmm/solution-design")} className="h-10 px-4 font-semibold bg-navy hover:bg-navy/90 text-white">
              <Workflow className="h-4 w-4" /> Solution Design
            </Button>
          </div>
        </div>
      }
    >
      {/* Row 1 — donuts + timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3">
          <Section title="Migration Progress by Stage">
            <div className="flex items-center gap-3">
              <Donut data={stage} total="1,248" sub="Total Workloads" />
            </div>
            <div className="mt-2 space-y-1 text-[11px]">
              {stage.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="flex-1 text-slate-700">{d.name}</span>
                  <span className="font-semibold text-slate-900">{d.value}</span>
                  <span className="text-slate-500">({d.pct})</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Workloads by Destination">
            <div className="flex items-center gap-3">
              <Donut data={dest} total="1,248" sub="Total Workloads" />
            </div>
            <div className="mt-2 space-y-1 text-[11px]">
              {dest.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="flex-1 text-slate-700">{d.name}</span>
                  <span className="font-semibold text-slate-900">{d.value}</span>
                  <span className="text-slate-500">({d.pct})</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Migrations Over Time (~1K Total)">
            <div className="h-52">
              <ResponsiveContainer>
                <BarChart data={migTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Completed" stackId="a" fill="hsl(142 71% 45%)" />
                  <Bar dataKey="InProgress" stackId="a" fill="hsl(217 91% 60%)" />
                  <Bar dataKey="Planned" stackId="a" fill="hsl(38 92% 50%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Modernization Initiatives">
            <div className="space-y-2.5 mt-1">
              {modernization.map((p) => (
                <div key={p.l}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-700 font-medium">{p.l}</span>
                    <span className="font-semibold text-slate-900">{p.v}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${p.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* Row 2 — cost + actions + security */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <div className="lg:col-span-4">
          <Section title="Top Cost Drivers (Last 30 Days)">
            <table className="w-full text-[11px]">
              <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1.5">Service</th>
                  <th className="text-right py-1.5">Spend (MTD)</th>
                  <th className="text-right py-1.5">% of Total</th>
                  <th className="text-left py-1.5 pl-3">Trend</th>
                </tr>
              </thead>
              <tbody>
                {costDrivers.map((r) => (
                  <tr key={r.svc} className="border-b border-slate-100">
                    <td className="py-2 font-medium text-slate-800">{r.svc}</td>
                    <td className="py-2 text-right text-slate-700">{r.spend}</td>
                    <td className="py-2 text-right text-slate-700">{r.pct}</td>
                    <td className="py-2 pl-3"><StatusPill status={r.t} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
              <div className="rounded-md border border-slate-200 p-2">
                <div className="text-slate-500">Total Cloud Spend</div>
                <div className="text-base font-extrabold text-slate-900">$3.72M</div>
                <div className="text-emerald-600">↑ 6%</div>
              </div>
              <div className="rounded-md border border-slate-200 p-2">
                <div className="text-slate-500">Savings Identified</div>
                <div className="text-base font-extrabold text-slate-900">$628K</div>
                <div className="text-emerald-600">↑ 8%</div>
              </div>
              <div className="rounded-md border border-slate-200 p-2">
                <div className="text-slate-500">Workloads in Cloud</div>
                <div className="text-base font-extrabold text-slate-900">1,248</div>
                <div className="text-emerald-600">↑ 14%</div>
              </div>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-4">
          <Section title="Security & Compliance Posture">
            <div className="space-y-3 mt-1">
              {security.map((p) => (
                <div key={p.l}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-700 font-medium">{p.l}</span>
                    <span className="font-semibold text-slate-900">{p.v}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="lg:col-span-4">
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

      {/* Row 3 — operational excellence */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        {opsExcellence.map((m) => (
          <div key={m.l} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-[10px] text-slate-500">{m.l}</div>
            <div className="text-lg font-extrabold text-slate-900 mt-1">{m.v}</div>
            <div className="text-[10px] text-emerald-600">{m.t}</div>
          </div>
        ))}
      </div>

      {/* Row 4 — automation strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        {[
          { l: "Workloads Migrated", v: "842", t: "↑ 21%" },
          { l: "Migrations Completed", v: "326", t: "↑ 18%" },
          { l: "Data Transferred (TB)", v: "128.4", t: "↑ 24%" },
          { l: "Cutover Success Rate", v: "98%", t: "↑ 2%" },
          { l: "Automated Tasks", v: "1,842", t: "↑ 22%" },
          { l: "Auto-Remediations", v: "156", t: "↑ 20%" },
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
