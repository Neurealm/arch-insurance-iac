import { useState } from "react";
import {
  Timer, CalendarClock, DollarSign, PowerOff, ArrowDownToLine, Server, TrendingUp, Activity, CheckCircle2,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, Legend, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import FinOpsHeader from "./components/FinOpsHeader";
import PageBands, { lifecycleWithActive } from "./components/PageBands";
import SavingsFunnel from "./components/SavingsFunnel";
import {
  Panel, Badge, KpiStrip, DataTable, Th, Td, DonutCard, DetailDrawer, ConfidenceCell,
  useDetailDrawer, GaugeRing, ProgressRow, type Kpi,
} from "./components/primitives";

const kpis: Kpi[] = [
  { id: "elig", icon: Server, label: "Total Eligible Resources", value: "2,186", sub: "non-prod + burst prod", tone: "blue" },
  { id: "opps", icon: CalendarClock, label: "Scheduling Opportunities", value: "627", sub: "28.7% of eligible", tone: "sky" },
  { id: "save", icon: DollarSign, label: "Potential Monthly Savings", value: "$412K", sub: "$4.94M annualized", tone: "emerald" },
  { id: "stop", icon: PowerOff, label: "Auto Stop Candidates", value: "412", sub: "nights & weekends", tone: "violet" },
  { id: "zero", icon: ArrowDownToLine, label: "Scale-to-Zero Candidates", value: "138", sub: "event-driven workloads", tone: "teal" },
  { id: "always", icon: Timer, label: "Always-On Resources", value: "1,636", sub: "24×7 today", tone: "amber" },
  { id: "ytd", icon: TrendingUp, label: "Realized Savings YTD", value: "$1.28M", sub: "billing-verified", tone: "emerald" },
  { id: "health", icon: Activity, label: "Optimization Health", value: "Good", sub: "coverage improving", tone: "teal" },
];

const opportunities: [string, string, string, string, string, string, number][] = [
  ["uat-commerce-app-01..12", "EC2 ASG", "UAT", "24×7 (720 hrs)", "Mon–Fri 07:00–20:00", "$38,400", 96],
  ["dev-payments-eks-nodes", "EKS Node Group", "Dev", "24×7 (720 hrs)", "Mon–Fri 08:00–19:00", "$31,900", 94],
  ["qa-analytics-emr", "EMR Cluster", "QA", "On demand, left running", "Scale to zero when idle", "$28,600", 91],
  ["training-sandbox-vms", "Azure VM Scale Set", "Sandbox", "24×7", "Mon–Fri 09:00–18:00", "$24,100", 93],
  ["perf-test-fleet", "EC2 Fleet", "Perf", "24×7", "On-demand burst only", "$21,700", 88],
  ["batch-reporting-rds", "RDS Instance", "Non-prod", "24×7", "Weekdays 06:00–22:00", "$17,300", 90],
  ["ml-notebook-instances", "SageMaker Notebook", "Dev", "24×7", "Auto stop after 60 min idle", "$15,900", 97],
  ["staging-cache-cluster", "ElastiCache", "Staging", "24×7", "Mon–Fri 07:00–21:00", "$12,400", 85],
  ["ci-runner-pool", "GCP MIG", "Build", "24×7", "Scale to zero off-hours", "$11,200", 92],
  ["legacy-uat-appservers", "EC2", "UAT", "24×7", "Mon–Fri 08:00–18:00", "$9,800", 79],
];

const hourly = Array.from({ length: 24 }, (_, h) => ({
  label: `${String(h).padStart(2, "0")}`,
  utilization: h >= 7 && h <= 20 ? 42 + ((h * 6) % 26) : 6 + ((h * 2) % 5),
}));
const daily = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
  label: d, utilization: i < 5 ? 58 + i * 3 : 9 + i,
}));
const byEnv = ["Dev", "QA", "UAT", "Staging", "Perf", "Sandbox", "Build"].map((d, i) => ({
  label: d, utilization: [31, 27, 34, 41, 18, 12, 24][i],
}));

const patternTabs = ["By Hour", "By Day of Week", "By Environment"] as const;

const savingsMix = [
  { name: "Auto stop (nights/weekends)", value: 46, display: "$189K" },
  { name: "Scale to zero", value: 21, display: "$86K" },
  { name: "Right-size + schedule", value: 15, display: "$62K" },
  { name: "On-demand to spot", value: 13, display: "$54K" },
  { name: "Other", value: 5, display: "$21K" },
];

const insights = [
  "Non-production environments run 720 hours per month but are actively used for 143 hours on average.",
  "Build and CI pools show zero utilization for 61% of all hours, including every weekend.",
  "Three UAT environments follow the release train and are only needed during the two weeks before a release.",
  "Notebook instances are the single largest source of forgotten runtime, averaging 19 idle hours per day.",
  "Perf-test fleets are provisioned once per sprint but never de-provisioned afterwards.",
];

const agentRows: [string, string, string][] = [
  ["Usage Pattern Agent", "Complete", "Detected stable weekday-only pattern across 412 resources"],
  ["Calendar Agent", "Complete", "Correlated release calendar and holiday schedule"],
  ["Dependency Agent", "Complete", "Confirmed no production dependency on non-prod endpoints"],
  ["Data Persistence Agent", "Complete", "Verified stateful services excluded from auto stop"],
  ["Risk Agent", "Complete", "Assessed cold-start impact below developer tolerance"],
  ["Automation Agent", "Ready", "Generated 627 schedule definitions as IaC"],
];

const guardrails = [
  "Never stop resources tagged environment=production",
  "Never stop resources with an active change freeze",
  "Honor manual override for 24 hours via self-service portal",
  "Require 15-minute pre-stop notification to owning team",
  "Skip stop when an active session or job is detected",
  "Automatic restart 30 minutes before the schedule window opens",
];

const simulation: [string, string, string, string, string][] = [
  ["Do nothing", "720 hrs/mo", "$0", "None", "Low"],
  ["Weekday 07:00–20:00", "286 hrs/mo", "$412K/mo", "Low — cold start 90s", "Low"],
  ["Weekday 08:00–18:00", "218 hrs/mo", "$486K/mo", "Medium — early/late users", "Medium"],
  ["Scale to zero on idle", "141 hrs/mo", "$524K/mo", "Medium — first request latency", "Medium"],
  ["Aggressive (on-demand only)", "96 hrs/mo", "$568K/mo", "High — developer friction", "High"],
];

const executionPlan: [string, string, string, string, string, string][] = [
  ["1", "Tag eligible resources with schedule intent", "Preparation", "Automated", "1 day", "Remove tag"],
  ["2", "Publish schedule to owning teams for objection", "Communication", "Automated", "3 days", "N/A"],
  ["3", "Enable schedules in observe-only mode", "Validation", "Automated", "5 days", "Disable flag"],
  ["4", "Activate auto stop for Dev and Build", "Execution", "Automated", "1 day", "Instant re-enable"],
  ["5", "Activate auto stop for QA and UAT", "Execution", "Automated", "1 day", "Instant re-enable"],
  ["6", "Enable scale-to-zero for event workloads", "Execution", "Semi-automated", "3 days", "Set min replicas"],
  ["7", "Verify savings against the billing ledger", "Validation", "Automated", "30 days", "N/A"],
];

export default function ElasticitySchedulingWorkspace() {
  const drawer = useDetailDrawer();
  const [tab, setTab] = useState<(typeof patternTabs)[number]>("By Hour");
  const data = tab === "By Hour" ? hourly : tab === "By Day of Week" ? daily : byEnv;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-6 py-6">
      <FinOpsHeader
        title="Elasticity & Scheduling Workspace"
        tagline="Optimize runtime by aligning compute resources to actual demand patterns with intelligent scheduling, scale policies, and automation."
        secondaryActions={[{ label: "Export Schedules", icon: "export" }, { label: "Schedule Simulator", icon: "simulate" }]}
        meta={{ lastAnalysis: "16 minutes ago", freshness: "98.9% within SLA", resources: "2,186 eligible resources analyzed" }}
        onPrimary={() => drawer.open({ title: "Elasticity analysis run", tone: "blue", rows: [["Opportunities", "627"], ["Monthly savings", "$412K"], ["Duration", "36 seconds"]] })}
        onSecondary={(l) => drawer.open({ title: l, tone: "slate", bullets: ["Synthetic demonstration action."] })}
      />

      <KpiStrip kpis={kpis} onSelect={(k) => drawer.open({ title: k.label, subtitle: k.sub, tone: k.tone, rows: [["Value", k.value]] })} />

      {/* 1 */}
      <Panel index={1} title="Top elasticity & scheduling opportunities">
        <DataTable head={<>
          <Th>Resource / workload</Th><Th>Type</Th><Th>Env</Th><Th>Current runtime</Th><Th>Recommended schedule</Th><Th right>Monthly savings</Th><Th right>Confidence</Th>
        </>}>
          {opportunities.map(([name, type, env, runtime, rec, save, conf]) => (
            <tr key={name} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({ title: name, subtitle: `${type} · ${env}`, tone: "blue", rows: [["Current runtime", runtime], ["Recommended", rec], ["Monthly savings", save], ["Confidence", `${conf}%`]] })}>
              <Td className="font-medium text-slate-900">{name}</Td>
              <Td>{type}</Td><Td>{env}</Td><Td>{runtime}</Td><Td>{rec}</Td>
              <Td right className="font-semibold text-emerald-700">{save}</Td>
              <ConfidenceCell pct={conf} right />
            </tr>
          ))}
        </DataTable>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        {/* 2 */}
        <Panel index={2} title="Usage pattern overview" action={<span>Recommended runtime window shaded</span>}>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {patternTabs.map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={cn("rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                  tab === t ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300")}>
                {t}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 8, right: 10, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="elasticity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {tab === "By Hour" && <ReferenceArea x1="07" x2="20" fill="#10b981" fillOpacity={0.08} label={{ value: "Recommended runtime", fontSize: 10, fill: "#047857" }} />}
              {tab === "By Day of Week" && <ReferenceArea x1="Mon" x2="Fri" fill="#10b981" fillOpacity={0.08} />}
              <Area type="monotone" dataKey="utilization" name="Utilization %" stroke="#6366f1" strokeWidth={1.8} fill="url(#elasticity)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        {/* 3 */}
        <Panel index={3} title="Potential savings breakdown">
          <DonutCard total="$412K" totalLabel="Monthly" data={savingsMix} />
          <div className="mt-3">
            <SavingsFunnel stages={[
              { label: "Identified", value: "$4.94M", pct: 100, tone: "blue" },
              { label: "Validated", value: "$3.71M", pct: 75, tone: "sky" },
              { label: "Approved", value: "$2.42M", pct: 49, tone: "amber" },
              { label: "Realized YTD", value: "$1.28M", pct: 26, tone: "emerald" },
            ]} title="Value realization funnel" />
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        {/* 4 */}
        <Panel index={4} title="Scheduling impact summary">
          <div className="grid grid-cols-2 gap-2">
            {[["Runtime hours removed", "434 hrs/mo"], ["Fleet hours saved", "272,118"], ["Carbon reduction", "-38.4 tCO₂e"], ["Resources scheduled", "627"]].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">{l}</div>
                <div className="text-xl font-bold text-slate-900">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            <ProgressRow label="Dev coverage" pct={82} tone="emerald" />
            <ProgressRow label="QA coverage" pct={71} tone="emerald" />
            <ProgressRow label="UAT coverage" pct={54} tone="amber" />
            <ProgressRow label="Build coverage" pct={93} tone="emerald" />
            <ProgressRow label="Perf coverage" pct={38} tone="rose" />
          </div>
        </Panel>

        {/* 5 */}
        <Panel index={5} title="Recommended schedules">
          <DataTable head={<><Th>Schedule</Th><Th>Applies to</Th><Th>Window</Th><Th right>Monthly savings</Th><Th right>Action</Th></>}>
            {[
              ["Weekday business hours", "412 resources", "Mon–Fri 07:00–20:00", "$189K"],
              ["Idle scale-to-zero", "138 resources", "Idle > 60 minutes", "$86K"],
              ["Release-train UAT", "48 resources", "Two weeks pre-release", "$62K"],
              ["Build pool burst", "21 pools", "On queue depth > 0", "$54K"],
              ["Weekend freeze", "All non-prod", "Sat 00:00 – Mon 06:00", "$21K"],
            ].map(([s, applies, win, save]) => (
              <tr key={s} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">{s}</Td><Td>{applies}</Td><Td>{win}</Td>
                <Td right className="font-semibold text-emerald-700">{save}</Td>
                <Td right>
                  <button type="button" onClick={() => drawer.open({ title: `Create plan · ${s}`, tone: "emerald", rows: [["Applies to", applies], ["Window", win], ["Savings", save], ["Rollout", "Observe-only for 5 days"]] })}
                    className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-700">Create Plan</button>
                </Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* 6 */}
        <Panel index={6} title="Demand pattern insights">
          <ul className="space-y-1.5">
            {insights.map((i) => (
              <li key={i} className="flex gap-2 text-[12px] text-slate-700">
                <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />{i}
              </li>
            ))}
          </ul>
        </Panel>

        {/* 7 */}
        <Panel index={7} title="Digital twin agent investigation">
          <DataTable head={<><Th>Agent</Th><Th>Status</Th><Th>Finding</Th></>}>
            {agentRows.map(([a, s, f]) => (
              <tr key={a} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">{a}</Td>
                <Td><Badge tone={s === "Complete" ? "emerald" : "blue"}>{s}</Badge></Td>
                <Td>{f}</Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* 8 */}
        <Panel index={8} title="Scheduling policy & guardrails">
          <ul className="space-y-1.5">
            {guardrails.map((g) => (
              <li key={g} className="flex gap-1.5 text-[12px] text-slate-700">
                <CheckCircle2 className="mt-[2px] h-3.5 w-3.5 shrink-0 text-emerald-500" />{g}
              </li>
            ))}
          </ul>
        </Panel>

        {/* 9 */}
        <Panel index={9} title="Scheduling simulation (what-if)">
          <DataTable head={<><Th>Scenario</Th><Th right>Runtime</Th><Th right>Savings</Th><Th>User impact</Th><Th right>Risk</Th></>}>
            {simulation.map(([s, rt, save, impact, risk]) => (
              <tr key={s} className={cn("hover:bg-slate-50", s === "Weekday 07:00–20:00" && "bg-emerald-50")}>
                <Td className="font-medium text-slate-900">{s}</Td>
                <Td right>{rt}</Td>
                <Td right className="font-semibold text-emerald-700">{save}</Td>
                <Td>{impact}</Td>
                <Td right><Badge tone={risk === "High" ? "rose" : risk === "Medium" ? "amber" : "emerald"}>{risk}</Badge></Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>

      {/* 10 */}
      <Panel index={10} title="Execution plan">
        <DataTable head={<><Th>Step</Th><Th>Action</Th><Th>Type</Th><Th>Automation</Th><Th right>Duration</Th><Th>Rollback</Th></>}>
          {executionPlan.map(([step, action, type, auto, dur, rb]) => (
            <tr key={step} className="hover:bg-slate-50">
              <Td className="font-semibold text-slate-900">{step}</Td>
              <Td>{action}</Td><Td>{type}</Td>
              <Td><Badge tone={auto === "Automated" ? "emerald" : "amber"}>{auto}</Badge></Td>
              <Td right>{dur}</Td><Td>{rb}</Td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        {/* 11 */}
        <Panel index={11} title="Confidence & risk overview">
          <GaugeRing pct={91} label="Overall confidence" sub="Low risk" />
          <div className="mt-3 space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Evidence completeness</div>
            <ProgressRow label="Usage telemetry" pct={98} tone="emerald" />
            <ProgressRow label="Ownership mapping" pct={87} tone="emerald" />
            <ProgressRow label="Dependency proof" pct={92} tone="emerald" />
            <ProgressRow label="Calendar alignment" pct={74} tone="amber" />
            <ProgressRow label="Cold-start impact tests" pct={63} tone="amber" />
          </div>
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Key risk controls</div>
            <ul className="mt-1 space-y-1">
              {["Self-service override available to every engineer", "Observe-only pilot before enforcement", "Stateful services excluded by policy"].map((c) => (
                <li key={c} className="flex gap-1.5 text-[11.5px] text-slate-700"><CheckCircle2 className="mt-[2px] h-3 w-3 shrink-0 text-emerald-500" />{c}</li>
              ))}
            </ul>
          </div>
        </Panel>

        {/* 12 */}
        <Panel index={12} title="Value realization tracker">
          <SavingsFunnel stages={[
            { label: "Identified", value: "$4.94M", pct: 100, tone: "blue" },
            { label: "Validated", value: "$3.71M", pct: 75, tone: "sky" },
            { label: "Approved", value: "$2.42M", pct: 49, tone: "amber" },
            { label: "Implemented", value: "$1.86M", pct: 38, tone: "violet" },
            { label: "Realized YTD", value: "$1.28M", pct: 26, tone: "emerald" },
          ]} title="Identified → Realized" />
        </Panel>
      </div>

      <PageBands lifecycle={lifecycleWithActive("Execute")} />

      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </div>
  );
}
