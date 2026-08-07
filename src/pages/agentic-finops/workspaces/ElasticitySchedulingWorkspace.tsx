import { Timer, DollarSign, CalendarClock, Activity, Zap, Moon, ShieldCheck, Gauge } from "lucide-react";
import {
  Badge, Card, ConfidenceCell, DataTable, DetailDrawer, DonutCard, Kpi, KpiStrip, LinkAction,
  Panel, ProgressRow, RiskCell, SimpleBars, Td, Th, TrendArea, useDetailDrawer,
} from "../components/primitives";
import { WorkspaceFooter, WorkspaceShell, FilterBar, defaultFabric, defaultMaturity } from "../components/bands";
import { finopsPages } from "../pages";

const page = finopsPages.find((p) => p.slug === "elasticity-scheduling")!;

const kpis: Kpi[] = [
  { id: "opps", icon: Timer, label: "Scheduling opportunities", value: "264", sub: "Across 61 services", tone: "blue" },
  { id: "save", icon: DollarSign, label: "Annual savings", value: "$1.12M", sub: "Runtime reduction", tone: "emerald" },
  { id: "hours", icon: Moon, label: "Idle hours removed", value: "412K", sub: "Per year", tone: "violet" },
  { id: "sched", icon: CalendarClock, label: "Schedules active", value: "148", sub: "Non-prod + batch", tone: "teal" },
  { id: "elastic", icon: Zap, label: "Autoscaling coverage", value: "68%", sub: "Eligible workloads", tone: "amber" },
  { id: "pattern", icon: Activity, label: "Predictable demand", value: "82%", sub: "Pattern confidence", tone: "sky" },
  { id: "slo", icon: ShieldCheck, label: "SLO breaches", value: "0", sub: "From scaling actions", tone: "slate" },
  { id: "eff", icon: Gauge, label: "Runtime efficiency", value: "63%", sub: "+11 pts QoQ", tone: "rose" },
];

const opportunities = [
  { id: "E-501", workload: "dev-* environments (214 hosts)", pattern: "Weekday 09:00–19:00", change: "Stop nights + weekends", save: "$31,400", conf: 98, risk: "Very Low" as const },
  { id: "E-507", workload: "qa-integration-fleet", pattern: "Business hours only", change: "Schedule + scale-to-zero", save: "$18,900", conf: 96, risk: "Low" as const },
  { id: "E-512", workload: "nightly-etl-cluster", pattern: "22:00–04:00 burst", change: "Ephemeral spot cluster", save: "$14,250", conf: 91, risk: "Medium" as const },
  { id: "E-520", workload: "reporting-api", pattern: "Weekday peak 10:00–15:00", change: "Predictive autoscaling", save: "$9,620", conf: 93, risk: "Low" as const },
  { id: "E-533", workload: "training-jobs-gpu", pattern: "Bursty, queue driven", change: "Queue-based scale to zero", save: "$8,740", conf: 87, risk: "Medium" as const },
  { id: "E-541", workload: "checkout-api", pattern: "Diurnal + retail peak", change: "Scheduled warm pool", save: "$6,110", conf: 76, risk: "Medium" as const },
];

const usagePattern = [
  { label: "00", value: 22 }, { label: "03", value: 18 }, { label: "06", value: 31 },
  { label: "09", value: 78 }, { label: "12", value: 94 }, { label: "15", value: 88 },
  { label: "18", value: 61 }, { label: "21", value: 34 },
];

const weekly = [
  { label: "Mon", value: 92 }, { label: "Tue", value: 96 }, { label: "Wed", value: 94 },
  { label: "Thu", value: 91 }, { label: "Fri", value: 83 }, { label: "Sat", value: 26 }, { label: "Sun", value: 21 },
];

const savingsMix = [
  { name: "Non-prod shutdown", value: 44, display: "$493K" },
  { name: "Scale-to-zero", value: 21, display: "$235K" },
  { name: "Predictive autoscaling", value: 16, display: "$179K" },
  { name: "Spot / ephemeral", value: 12, display: "$134K" },
  { name: "Warm pool tuning", value: 7, display: "$79K" },
];

export default function ElasticitySchedulingWorkspace() {
  const drawer = useDetailDrawer();
  return (
    <WorkspaceShell
      title={page.title}
      subtitle={page.subtitle}
      actions={<FilterBar chips={["Non-production", "Batch workloads", "Pattern confidence ≥ 75%", "Exclude freeze windows"]} />}
    >
      <KpiStrip kpis={kpis} onSelect={(k) => drawer.open({
        title: k.label, subtitle: `${k.value} — ${k.sub ?? ""}`, tone: k.tone,
        rows: [["Value", k.value], ["Pattern window", "Trailing 8 weeks"], ["Signals", "Request rate, CPU, queue depth, login activity"], ["Guard", "Manual override always available"]],
        bullets: ["Schedules are derived from observed access patterns, not declared intent.", "Any human login during a scheduled stop window suspends the schedule for review."],
      })} />

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Panel index={1} title="Scheduling opportunities" action="Ranked by annualized savings">
          <DataTable head={<>
            <Th>ID</Th><Th>Workload</Th><Th>Observed pattern</Th><Th>Proposed change</Th>
            <Th right>Annual saving</Th><Th right>Confidence</Th><Th>Risk</Th><Th right>Action</Th>
          </>}>
            {opportunities.map((o) => (
              <tr key={o.id} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({
                title: `${o.id} · ${o.workload}`, subtitle: o.change, tone: "teal",
                rows: [["Observed pattern", o.pattern], ["Annual saving", o.save], ["Confidence", `${o.conf}%`], ["Risk", o.risk], ["Rollback", "Schedule disabled instantly on override"]],
                bullets: [
                  "8 weeks of telemetry show near-zero utilization outside the identified window.",
                  "No scheduled jobs, health probes, or CI pipelines execute during the stop window.",
                  "Owners receive a start-on-demand link that resumes capacity in under 4 minutes.",
                ],
              })}>
                <Td className="font-medium text-slate-900">{o.id}</Td>
                <Td>{o.workload}</Td>
                <Td className="text-slate-500">{o.pattern}</Td>
                <Td>{o.change}</Td>
                <Td right className="font-semibold text-emerald-700">{o.save}</Td>
                <ConfidenceCell pct={o.conf} right />
                <RiskCell level={o.risk} />
                <Td right><LinkAction>Review</LinkAction></Td>
              </tr>
            ))}
          </DataTable>
        </Panel>

        <Panel index={2} title="Usage pattern overview" action="Hour-of-day, weighted">
          <TrendArea data={usagePattern} color="#0ea5e9" yTickFormatter={(v) => `${v}%`} />
          <div className="mt-3">
            <div className="mb-1 text-[11px] font-medium text-slate-500">Day-of-week utilization</div>
            <SimpleBars data={weekly} height={150} color="#6366f1" />
          </div>
          <p className="mt-2 text-[11.5px] text-slate-500">
            Weekend utilization collapses to 21–26%, yet provisioned capacity remains flat — the core scheduling opportunity.
          </p>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel index={3} title="Savings by elasticity lever">
          <DonutCard data={savingsMix} total="$1.12M" totalLabel="Annualized" />
        </Panel>
        <Panel index={4} title="Automation coverage">
          <div className="space-y-2.5">
            <ProgressRow label="Non-prod scheduled" pct={86} tone="emerald" />
            <ProgressRow label="HPA configured" pct={68} tone="blue" />
            <ProgressRow label="Scale-to-zero eligible" pct={41} tone="teal" />
            <ProgressRow label="Spot adoption (batch)" pct={37} tone="violet" />
            <ProgressRow label="Manual capacity only" pct={14} tone="rose" />
          </div>
        </Panel>
        <div className="grid gap-5">
          <Card title="Schedule exceptions">
            <ul className="space-y-1.5 text-[12.5px] text-slate-700">
              <li><Badge tone="amber">Freeze</Badge> Retail peak: Nov 20 – Dec 27</li>
              <li><Badge tone="blue">Override</Badge> qa-integration held open for release week</li>
              <li><Badge tone="rose">Blocked</Badge> Regulatory batch must run continuously</li>
            </ul>
          </Card>
          <Card title="Agent activity">
            <ul className="space-y-1.5 text-[12.5px] text-slate-700">
              <li>Applied 18 new schedules · 04:15 UTC</li>
              <li>Suspended 2 schedules after off-hours logins</li>
              <li>Tuned 24 HPA targets to observed p95</li>
              <li>Zero SLO breaches attributed to scaling</li>
            </ul>
          </Card>
        </div>
      </div>

      <WorkspaceFooter fabric={defaultFabric} maturity={defaultMaturity} />
      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </WorkspaceShell>
  );
}
