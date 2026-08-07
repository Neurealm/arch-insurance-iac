import { useState } from "react";
import {
  ShieldCheck, Landmark, TrendingUp, ShieldAlert, Timer, Target, HeartPulse, FileCheck, CheckCircle2,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import FinOpsHeader from "./components/FinOpsHeader";
import PageBands, { lifecycleWithActive } from "./components/PageBands";
import SyntheticFooter from "./components/SyntheticFooter";
import {
  Panel, Badge, KpiStrip, DataTable, Th, Td, DonutCard, DetailDrawer,
  useDetailDrawer, GaugeRing, ProgressRow, toneMap, type Kpi, type Tone,
} from "./components/primitives";

const kpis: Kpi[] = [
  { id: "comp", icon: ShieldCheck, label: "Policy Compliance", value: "94.2%", sub: "target 96%", tone: "emerald" },
  { id: "gov", icon: Landmark, label: "Governed Spend", value: "$28.7M", sub: "of $30.4M total", tone: "blue" },
  { id: "real", icon: TrendingUp, label: "Realized Savings YTD", value: "$4.32M", sub: "billing-verified", tone: "emerald" },
  { id: "viol", icon: ShieldAlert, label: "Policy Violations", value: "12", sub: "3 high severity", tone: "rose" },
  { id: "sla", icon: Timer, label: "Approval SLA", value: "1.8 hrs", sub: "median decision time", tone: "sky" },
  { id: "rate", icon: Target, label: "Value Realization Rate", value: "76%", sub: "approved → realized", tone: "violet" },
  { id: "health", icon: HeartPulse, label: "Governance Health", value: "Excellent", sub: "all controls green", tone: "teal" },
  { id: "audit", icon: FileCheck, label: "Audit Readiness", value: "98.5%", sub: "evidence complete", tone: "amber" },
];

const compliance = [
  { name: "Compliant", value: 94.2, display: "94.2%", color: "#10b981" },
  { name: "Warning", value: 3.4, display: "3.4%", color: "#f59e0b" },
  { name: "Violation", value: 1.6, display: "1.6%", color: "#ef4444" },
  { name: "Not evaluated", value: 0.8, display: "0.8%", color: "#cbd5e1" },
];

const frameworkTabs = ["Policies", "Standards", "Controls", "Approvals"] as const;
const policies: Record<(typeof frameworkTabs)[number], [string, string, string, string, string][]> = {
  Policies: [
    ["Cost allocation", "Financial", "98.1%", "Active", "2 hours ago"],
    ["Resource tagging", "Operational", "93.4%", "Active", "2 hours ago"],
    ["Instance sizing", "Technical", "89.6%", "Active", "6 hours ago"],
    ["Storage lifecycle", "Data", "93.2%", "Active", "1 day ago"],
    ["Network security", "Security", "99.2%", "Active", "3 hours ago"],
    ["Approval workflows", "Governance", "100%", "Active", "1 hour ago"],
  ],
  Standards: [
    ["FinOps Foundation Framework", "Industry", "91.0%", "Adopted", "1 week ago"],
    ["Cloud unit economics standard", "Internal", "88.4%", "Adopted", "2 weeks ago"],
    ["Tagging taxonomy v3", "Internal", "93.4%", "Adopted", "3 days ago"],
    ["Green cloud reporting", "Sustainability", "76.2%", "Pilot", "1 month ago"],
  ],
  Controls: [
    ["Budget threshold alerting", "Preventive", "100%", "Enforced", "Continuous"],
    ["Commitment purchase gate", "Preventive", "100%", "Enforced", "Continuous"],
    ["Untagged resource quarantine", "Detective", "94.8%", "Enforced", "Hourly"],
    ["Anomaly detection", "Detective", "97.1%", "Enforced", "Continuous"],
    ["Post-change savings verification", "Corrective", "92.6%", "Enforced", "Monthly"],
  ],
  Approvals: [
    ["Change above $250K annualized", "Financial", "100%", "Required", "Continuous"],
    ["Production rightsizing", "Technical", "100%", "Required", "Continuous"],
    ["Resource deletion", "Operational", "100%", "Required", "Continuous"],
    ["Architecture migration", "Strategic", "100%", "Required", "Continuous"],
  ],
};

const approvalTabs = ["Pending", "In Review", "Approved", "History"] as const;
const approvals: Record<(typeof approvalTabs)[number], [string, string, string, string, string][]> = {
  Pending: [
    ["REQ-4821", "Commitment rebalance plan", "FinOps Lead", "$2.31M", "42 min"],
    ["REQ-4822", "Reclaim 184 orphaned volumes", "Cloud Engineering", "$96K", "1.2 hrs"],
    ["REQ-4826", "Graviton node group rollout", "Platform SRE", "$284K", "18 min"],
  ],
  "In Review": [
    ["REQ-4809", "Storage lifecycle policy set", "Data Governance", "$612K", "6 hrs"],
    ["REQ-4814", "Non-prod scheduling activation", "Engineering Ops", "$412K", "3 hrs"],
  ],
  Approved: [
    ["REQ-4788", "Payment service rightsizing", "SRE + FinOps", "$13.2K", "Approved"],
    ["REQ-4791", "VPC endpoint deployment", "Network Eng", "$1.39M", "Approved"],
    ["REQ-4796", "Delete expired log archives", "Legal + Platform", "$9.4K", "Approved"],
  ],
  History: [
    ["REQ-4702", "Aggressive 3-year commitment", "Finance", "$3.06M", "Rejected — cash policy"],
    ["REQ-4718", "Perf fleet decommission", "Perf Eng", "$21.7K", "Approved"],
    ["REQ-4740", "Cross-region replication change", "Data Eng", "$852K", "Approved"],
  ],
};

const accountabilityTabs = ["By Business Unit", "By Application", "By Team", "By Owner"] as const;
const accountability: Record<(typeof accountabilityTabs)[number], [string, string, string, string, string][]> = {
  "By Business Unit": [
    ["Commerce", "$11.4M", "96.2%", "+2.1%", "On track"],
    ["Payments", "$7.8M", "97.8%", "-1.4%", "On track"],
    ["Analytics", "$5.2M", "89.4%", "+8.6%", "At risk"],
    ["Marketing", "$3.1M", "91.0%", "+4.2%", "Watch"],
    ["Corporate", "$2.9M", "98.4%", "-0.6%", "On track"],
  ],
  "By Application": [
    ["Payment Authorization", "$4.2M", "98.1%", "-2.2%", "On track"],
    ["Order Capture", "$3.6M", "95.4%", "+1.1%", "On track"],
    ["Data Lake", "$3.1M", "86.2%", "+11.4%", "At risk"],
    ["Customer Profile", "$2.4M", "93.8%", "+0.4%", "On track"],
    ["Media Delivery", "$1.9M", "90.6%", "+6.2%", "Watch"],
  ],
  "By Team": [
    ["Platform Engineering", "$6.8M", "97.2%", "-3.1%", "On track"],
    ["Data Engineering", "$5.4M", "87.6%", "+9.8%", "At risk"],
    ["Commerce Squad", "$4.9M", "95.8%", "+1.6%", "On track"],
    ["SRE", "$3.2M", "99.1%", "-2.4%", "On track"],
  ],
  "By Owner": [
    ["a.okafor@example.com", "$4.1M", "97.4%", "-1.8%", "On track"],
    ["m.tanaka@example.com", "$3.7M", "88.2%", "+10.2%", "At risk"],
    ["s.delacroix@example.com", "$2.8M", "94.6%", "+2.4%", "Watch"],
    ["j.almeida@example.com", "$2.2M", "98.8%", "-0.9%", "On track"],
  ],
};

const riskFactors: [string, string, number][] = [
  ["Untagged production spend", "Low", 22],
  ["Unapproved commitment exposure", "Low", 14],
  ["Concentration in a single region", "Medium", 41],
  ["Budget variance in Analytics", "Medium", 38],
  ["Audit evidence gaps", "Low", 9],
];

const evidenceChecklist = [
  "Policy definitions versioned and signed",
  "Every approval decision recorded with rationale",
  "Change records linked to billing impact",
  "Savings verified against invoice line items",
  "Access and role assignments reviewed quarterly",
  "Exception register current and owner-attested",
];

const timeline = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => ({
  label: m,
  target: 500 + i * 90,
  realized: i <= 8 ? 420 + i * 82 : 0,
  forecast: 470 + i * 88,
}));

const insights = [
  { title: "Analytics variance is the primary governance risk", detail: "Spend is 8.6% above plan with 89.4% governed coverage. Two untagged clusters account for most of the gap.", tone: "amber" as Tone },
  { title: "Approval velocity is a competitive advantage", detail: "Median approval time fell from 9.4 hours to 1.8 hours after evidence packages were attached automatically.", tone: "emerald" as Tone },
  { title: "Realization rate is stable at 76%", detail: "The gap between approved and realized value is driven by change-window slippage, not by inaccurate estimates.", tone: "blue" as Tone },
  { title: "Audit readiness is near target", detail: "98.5% of required evidence is current; the remaining gap is the quarterly access review for two service accounts.", tone: "violet" as Tone },
];

const recommendations: [string, string, string][] = [
  ["Enforce tagging quarantine in the Analytics account", "High", "Take Action"],
  ["Close the two outstanding access reviews before the audit", "High", "Take Action"],
  ["Rebalance commitments ahead of the 90-day expiry cliff", "High", "Review"],
  ["Automate savings verification for storage transitions", "Medium", "Implement"],
  ["Extend unit-economics reporting to Marketing", "Medium", "Plan"],
  ["Pilot sustainability reporting for the Commerce portfolio", "Low", "Plan"],
];

const executionPlan: [string, string, string, string][] = [
  ["1", "Publish updated tagging policy with quarantine enforcement", "1 week", "Governance"],
  ["2", "Complete outstanding access reviews", "3 days", "Security"],
  ["3", "Submit commitment rebalance for approval", "2 days", "FinOps"],
  ["4", "Automate storage savings verification", "2 weeks", "Platform"],
  ["5", "Extend accountability reporting to all business units", "3 weeks", "FinOps"],
  ["6", "Run the quarterly governance review", "1 day", "Executive"],
];

const outcomes = [
  ["Cloud unit cost", "-11.4%", "vs prior year"],
  ["Savings realized", "$4.32M", "year to date"],
  ["Governed spend", "94.4%", "of total cloud spend"],
  ["Decision latency", "1.8 hrs", "median approval"],
  ["Audit findings", "0", "material findings"],
  ["Forecast accuracy", "96.2%", "rolling 6 months"],
];

export default function GovernanceRealizationWorkspace() {
  const drawer = useDetailDrawer();
  const [fw, setFw] = useState<(typeof frameworkTabs)[number]>("Policies");
  const [ap, setAp] = useState<(typeof approvalTabs)[number]>("Pending");
  const [acc, setAcc] = useState<(typeof accountabilityTabs)[number]>("By Business Unit");

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-6 py-6">
      <FinOpsHeader
        title="Governance & Realization Workspace"
        tagline="Drive FinOps accountability, policy compliance, and measurable business value. Govern spend, enforce standards, track commitments, and realize financial and operational outcomes."
        secondaryActions={[{ label: "Export Audit Pack", icon: "export" }, { label: "Governance Simulator", icon: "simulate" }]}
        meta={{ lastAnalysis: "5 minutes ago", freshness: "99.6% within SLA", resources: "$30.4M cloud spend governed" }}
        onPrimary={() => drawer.open({ title: "Governance evaluation run", tone: "emerald", rows: [["Policies evaluated", "6"], ["Resources checked", "18,428"], ["Violations", "12"], ["Compliance", "94.2%"]] })}
        onSecondary={(l) => drawer.open({ title: l, tone: "slate", bullets: ["Synthetic demonstration action."] })}
      />

      <KpiStrip kpis={kpis} onSelect={(k) => drawer.open({ title: k.label, subtitle: k.sub, tone: k.tone, rows: [["Value", k.value]] })} />

      <div className="grid gap-5 xl:grid-cols-[1fr_1.6fr]">
        {/* 1 */}
        <Panel index={1} title="Policy compliance overview">
          <DonutCard total="94.2%" totalLabel="Compliant" data={compliance} />
        </Panel>

        {/* 2 */}
        <Panel index={2} title="Governance framework">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {frameworkTabs.map((t) => (
              <button key={t} type="button" onClick={() => setFw(t)}
                className={cn("rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                  fw === t ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300")}>
                {t}
              </button>
            ))}
          </div>
          <DataTable head={<><Th>Name</Th><Th>Category</Th><Th right>Coverage</Th><Th right>Status</Th><Th right>Last evaluated</Th></>}>
            {policies[fw].map(([n, cat, cov, st, last]) => (
              <tr key={n} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">{n}</Td><Td>{cat}</Td>
                <Td right><span className={cn("font-semibold", parseFloat(cov) >= 93 ? "text-emerald-700" : parseFloat(cov) >= 85 ? "text-amber-700" : "text-rose-700")}>{cov}</span></Td>
                <Td right><Badge tone={st === "Pilot" ? "amber" : "emerald"}>{st}</Badge></Td>
                <Td right>{last}</Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* 3 */}
        <Panel index={3} title="Approval workflow">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {approvalTabs.map((t) => (
              <button key={t} type="button" onClick={() => setAp(t)}
                className={cn("rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                  ap === t ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300")}>
                {t}
              </button>
            ))}
          </div>
          <DataTable head={<><Th>Request</Th><Th>Description</Th><Th>Approver</Th><Th right>Value</Th><Th right>Status / age</Th></>}>
            {approvals[ap].map(([id, desc, approver, val, status]) => (
              <tr key={id} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({ title: `${id} · ${desc}`, tone: "blue", rows: [["Approver", approver], ["Value", val], ["Status", status], ["Evidence attached", "Yes"]] })}>
                <Td className="font-medium text-slate-900">{id}</Td><Td>{desc}</Td><Td>{approver}</Td>
                <Td right className="font-semibold text-emerald-700">{val}</Td>
                <Td right>{status}</Td>
              </tr>
            ))}
          </DataTable>
        </Panel>

        {/* 4 */}
        <Panel index={4} title="Value realization tracker">
          <DonutCard total="76%" totalLabel="Realization rate" data={[
            { name: "Realized", value: 76, display: "$4.32M", color: "#10b981" },
            { name: "In progress", value: 16, display: "$910K", color: "#f59e0b" },
            { name: "Identified only", value: 8, display: "$455K", color: "#cbd5e1" },
          ]} />
        </Panel>
      </div>

      {/* 5 */}
      <Panel index={5} title="Financial accountability">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {accountabilityTabs.map((t) => (
            <button key={t} type="button" onClick={() => setAcc(t)}
              className={cn("rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                acc === t ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300")}>
              {t}
            </button>
          ))}
        </div>
        <DataTable head={<><Th>Entity</Th><Th right>Spend</Th><Th right>Governed %</Th><Th right>Variance</Th><Th right>Accountability</Th></>}>
          {accountability[acc].map(([e, spend, gov, variance, status]) => (
            <tr key={e} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-900">{e}</Td><Td right>{spend}</Td><Td right>{gov}</Td>
              <Td right className={variance.startsWith("+") ? "font-semibold text-rose-700" : "font-semibold text-emerald-700"}>{variance}</Td>
              <Td right><Badge tone={status === "At risk" ? "rose" : status === "Watch" ? "amber" : "emerald"}>{status}</Badge></Td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* 6 */}
        <Panel index={6} title="Risk & compliance monitoring">
          <GaugeRing pct={18} label="Risk score (of 100)" sub="Low" tone="emerald" />
          <div className="mt-3 space-y-2">
            {riskFactors.map(([f, level, pct]) => (
              <div key={f} className="grid grid-cols-[1fr_auto] items-center gap-2">
                <ProgressRow label={f} pct={pct} tone={pct >= 40 ? "amber" : "emerald"} />
                <Badge tone={level === "Medium" ? "amber" : "emerald"}>{level}</Badge>
              </div>
            ))}
          </div>
        </Panel>

        {/* 7 */}
        <Panel index={7} title="Audit & evidence">
          <div className="grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
            <GaugeRing pct={98} label="Audit readiness" sub="98.5%" />
            <div>
              <ul className="space-y-1">
                {evidenceChecklist.map((e) => (
                  <li key={e} className="flex gap-1.5 text-[11.5px] text-slate-700"><CheckCircle2 className="mt-[2px] h-3 w-3 shrink-0 text-emerald-500" />{e}</li>
                ))}
              </ul>
              <div className="mt-2 flex flex-wrap gap-4 text-[11.5px] text-slate-600">
                <span>Last audit: <span className="font-semibold text-slate-900">14 Feb 2026</span></span>
                <span>Next audit: <span className="font-semibold text-slate-900">21 Aug 2026</span></span>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* 8 */}
      <Panel index={8} title="Realization timeline">
        <ResponsiveContainer width="100%" height={230}>
          <ComposedChart data={timeline} margin={{ top: 8, right: 10, left: -14, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="realized" name="Realized ($K)" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Line type="monotone" dataKey="target" name="Target ($K)" stroke="#6366f1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="forecast" name="Forecast ($K)" stroke="#f59e0b" strokeWidth={1.6} strokeDasharray="4 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>

      {/* 9 */}
      <Panel index={9} title="Governance insights">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {insights.map((i) => {
            const t = toneMap[i.tone];
            return (
              <div key={i.title} className={cn("rounded-lg border p-3", t.bg, t.border)}>
                <div className={cn("text-[12px] font-semibold", t.text)}>{i.title}</div>
                <p className="mt-1 text-[11.5px] leading-snug text-slate-700">{i.detail}</p>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* 10 */}
        <Panel index={10} title="Recommendations">
          <ul className="space-y-2">
            {recommendations.map(([r, pri, action]) => (
              <li key={r} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-medium text-slate-900">{r}</div>
                  <Badge tone={pri === "High" ? "rose" : pri === "Medium" ? "amber" : "slate"}>{pri} priority</Badge>
                </div>
                <button type="button" onClick={() => drawer.open({ title: r, subtitle: `${pri} priority`, tone: "blue", rows: [["Recommended action", action], ["Owner", "FinOps governance board"], ["Due", "This quarter"]] })}
                  className="shrink-0 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-800">{action}</button>
              </li>
            ))}
          </ul>
        </Panel>

        {/* 11 */}
        <Panel index={11} title="Execution plan">
          <DataTable head={<><Th>Step</Th><Th>Action</Th><Th right>Duration</Th><Th right>Owner</Th></>}>
            {executionPlan.map(([s, a, d, o]) => (
              <tr key={s} className="hover:bg-slate-50">
                <Td className="font-semibold text-slate-900">{s}</Td><Td>{a}</Td><Td right>{d}</Td><Td right>{o}</Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>

      {/* 12 */}
      <Panel index={12} title="Business outcomes">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {outcomes.map(([l, v, s]) => (
            <div key={l} className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <div className="text-[10px] uppercase tracking-wide text-slate-500">{l}</div>
              <div className="text-2xl font-bold leading-tight text-emerald-800">{v}</div>
              <div className="text-[11px] text-slate-600">{s}</div>
            </div>
          ))}
        </div>
      </Panel>

      <PageBands lifecycle={lifecycleWithActive("Realize")} />
      <SyntheticFooter tagline="Smarter governance. Greater value. A stronger business." />

      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </div>
  );
}
