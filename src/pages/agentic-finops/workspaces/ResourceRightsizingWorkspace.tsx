import { Gauge, DollarSign, CheckCircle2, AlertTriangle, Cpu, TrendingDown, ShieldCheck, Clock } from "lucide-react";
import {
  Badge, Card, ConfidenceCell, CostDriverBars, DataTable, DetailDrawer, DonutCard, GaugeRing,
  Kpi, KpiStrip, LinkAction, Panel, ProgressRow, RiskCell, SimpleBars, Td, Th, TrendArea, useDetailDrawer,
} from "../components/primitives";
import { WorkspaceFooter, WorkspaceShell, FilterBar, defaultFabric, defaultMaturity } from "../components/bands";
import { finopsPages } from "../pages";

const page = finopsPages.find((p) => p.slug === "resource-rightsizing")!;

const kpis: Kpi[] = [
  { id: "cand", icon: Cpu, label: "Rightsizing candidates", value: "418", sub: "Across 214 accounts", tone: "blue" },
  { id: "annual", icon: DollarSign, label: "Annual savings", value: "$2.94M", sub: "Modeled, risk-adjusted", tone: "emerald" },
  { id: "safe", icon: CheckCircle2, label: "Safe to execute", value: "281", sub: "67% of candidates", tone: "teal" },
  { id: "review", icon: AlertTriangle, label: "Needs review", value: "94", sub: "Perf-sensitive workloads", tone: "amber" },
  { id: "conf", icon: Gauge, label: "Mean confidence", value: "94%", sub: "14-day utilization window", tone: "violet" },
  { id: "reduction", icon: TrendingDown, label: "Capacity reduction", value: "31%", sub: "Weighted vCPU", tone: "sky" },
  { id: "risk", icon: ShieldCheck, label: "Rollback rate", value: "0.7%", sub: "Last 90 days", tone: "slate" },
  { id: "cycle", icon: Clock, label: "Decision cycle", value: "3.4d", sub: "Median detect → execute", tone: "rose" },
];

const underReview = {
  name: "prod-api-gateway-asg",
  service: "Order Capture API",
  owner: "Payments Platform",
  region: "us-east-1",
  current: "m6i.4xlarge x 24",
  currentCost: "$18,420 / mo",
  cpuP95: 21,
  memP95: 34,
  netP95: 12,
};

const candidates = [
  { id: "R-1042", resource: "prod-api-gateway-asg", from: "m6i.4xlarge", to: "m6i.2xlarge", save: "$8,240", pct: 45, conf: 96, risk: "Low" as const, action: "Auto-approve" },
  { id: "R-1043", resource: "batch-etl-workers", from: "r6i.8xlarge", to: "r6i.4xlarge", save: "$6,910", pct: 50, conf: 94, risk: "Low" as const, action: "Auto-approve" },
  { id: "R-1051", resource: "search-index-nodes", from: "c6i.12xlarge", to: "c7g.8xlarge", save: "$5,480", pct: 38, conf: 91, risk: "Medium" as const, action: "Review" },
  { id: "R-1067", resource: "risk-scoring-fleet", from: "m5.2xlarge", to: "m6i.xlarge", save: "$4,120", pct: 42, conf: 88, risk: "Medium" as const, action: "Review" },
  { id: "R-1074", resource: "reporting-db-replica", from: "db.r6g.4xlarge", to: "db.r6g.2xlarge", save: "$3,860", pct: 48, conf: 86, risk: "Medium" as const, action: "Review" },
  { id: "R-1088", resource: "media-transcode-pool", from: "c5.9xlarge", to: "c6i.4xlarge", save: "$3,240", pct: 44, conf: 67, risk: "High" as const, action: "Hold" },
];

const utilization = [
  { label: "-14d", value: 22 }, { label: "-12d", value: 19 }, { label: "-10d", value: 26 },
  { label: "-8d", value: 21 }, { label: "-6d", value: 24 }, { label: "-4d", value: 18 },
  { label: "-2d", value: 23 }, { label: "Now", value: 21 },
];

const familyMix = [
  { name: "General purpose (m)", value: 42, display: "$1.24M" },
  { name: "Compute optimized (c)", value: 24, display: "$0.71M" },
  { name: "Memory optimized (r)", value: 19, display: "$0.56M" },
  { name: "Database instances", value: 9, display: "$0.27M" },
  { name: "GPU / accelerated", value: 6, display: "$0.16M" },
];

const drivers = [
  { name: "CPU overprovisioning", value: 1.32, display: "$1.32M" },
  { name: "Memory overprovisioning", value: 0.74, display: "$0.74M" },
  { name: "Legacy instance families", value: 0.48, display: "$0.48M" },
  { name: "Static peak sizing", value: 0.26, display: "$0.26M" },
  { name: "Duplicate capacity buffers", value: 0.14, display: "$0.14M" },
];

const safety = [
  { label: "Dependency map complete", pct: 100 },
  { label: "SLO headroom validated", pct: 94 },
  { label: "Load test evidence", pct: 71 },
  { label: "Rollback plan attached", pct: 100 },
  { label: "Change window assigned", pct: 82 },
];

export default function ResourceRightsizingWorkspace() {
  const drawer = useDetailDrawer();

  return (
    <WorkspaceShell
      title={page.title}
      subtitle={page.subtitle}
      actions={<FilterBar chips={["All providers", "Production", "Confidence ≥ 85%", "Savings ≥ $1K/mo"]} />}
    >
      <KpiStrip kpis={kpis} onSelect={(k) => drawer.open({
        title: k.label, subtitle: `${k.value} — ${k.sub ?? ""}`, tone: k.tone,
        rows: [["Value", k.value], ["Window", "Trailing 14 days"], ["Signal source", "CloudWatch + Datadog + billing"], ["Refresh", "Every 6 hours"]],
        bullets: ["Percentiles use p95 to avoid sizing to transient spikes.", "Risk-adjusted savings discount candidates below 85% confidence."],
      })} />

      <div className="grid gap-5 xl:grid-cols-[1fr_1.25fr]">
        <Panel index={1} title="Resource under review" action={<Badge tone="amber">Awaiting decision</Badge>}>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-[14px] font-semibold text-slate-900">{underReview.name}</div>
            <div className="text-[12px] text-slate-600">{underReview.service} · {underReview.owner} · {underReview.region}</div>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            {[
              ["Current shape", underReview.current], ["Current cost", underReview.currentCost],
              ["CPU p95", `${underReview.cpuP95}%`], ["Memory p95", `${underReview.memP95}%`],
              ["Network p95", `${underReview.netP95}%`], ["Observation window", "14 days"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-slate-200 p-2.5">
                <dt className="text-[10px] uppercase tracking-wide text-slate-500">{k}</dt>
                <dd className="text-[15px] font-semibold text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3">
            <div className="mb-1 text-[11px] font-medium text-slate-500">CPU utilization p95 (14d)</div>
            <TrendArea data={utilization} height={130} color="#6366f1" yTickFormatter={(v) => `${v}%`} />
          </div>
        </Panel>

        <Panel index={2} title="Rightsizing candidates" action="Ranked by risk-adjusted savings">
          <DataTable head={<>
            <Th>ID</Th><Th>Resource</Th><Th>Current → target</Th><Th right>Monthly saving</Th>
            <Th right>Reduction</Th><Th right>Confidence</Th><Th>Risk</Th><Th right>Action</Th>
          </>}>
            {candidates.map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({
                title: `${c.id} · ${c.resource}`, subtitle: `${c.from} → ${c.to}`, tone: "blue",
                rows: [["Monthly saving", c.save], ["Annualized", `$${(parseInt(c.save.replace(/\D/g, ""), 10) * 12 / 1000).toFixed(1)}K`],
                  ["Capacity reduction", `${c.pct}%`], ["Confidence", `${c.conf}%`], ["Risk", c.risk], ["Recommended action", c.action]],
                bullets: [
                  "p95 CPU and memory remain below 40% of provisioned capacity for 14 consecutive days.",
                  "No autoscaling events hit the upper bound during the observation window.",
                  "Dependency graph shows 4 upstream callers; none breach latency budget in simulation.",
                  "Rollback restores the prior launch template within 90 seconds.",
                ],
              })}>
                <Td className="font-medium text-slate-900">{c.id}</Td>
                <Td>{c.resource}</Td>
                <Td><span className="text-slate-500">{c.from}</span> → <span className="font-medium text-slate-900">{c.to}</span></Td>
                <Td right className="font-semibold text-emerald-700">{c.save}</Td>
                <Td right>{c.pct}%</Td>
                <ConfidenceCell pct={c.conf} right />
                <RiskCell level={c.risk} />
                <Td right><LinkAction>{c.action}</LinkAction></Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel index={3} title="Annual savings by family">
          <DonutCard data={familyMix} total="$2.94M" totalLabel="Annualized" />
        </Panel>
        <Panel index={4} title="Why the spend is high">
          <CostDriverBars data={drivers} />
        </Panel>
        <Panel index={5} title="Execution safety readiness">
          <div className="space-y-2.5">
            {safety.map((s) => <ProgressRow key={s.label} label={s.label} pct={s.pct} tone={s.pct >= 90 ? "emerald" : s.pct >= 75 ? "blue" : "amber"} />)}
          </div>
          <div className="mt-3 grid grid-cols-2 items-center gap-3">
            <GaugeRing pct={94} label="Mean confidence" sub="Safe band" />
            <div className="text-[12px] text-slate-600">
              Candidates below the 85% confidence floor are held for load-test evidence before any change record is opened.
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Panel index={6} title="Projected monthly savings ramp">
          <SimpleBars data={[
            { label: "Oct", value: 62 }, { label: "Nov", value: 118 }, { label: "Dec", value: 164 },
            { label: "Jan", value: 201 }, { label: "Feb", value: 226 }, { label: "Mar", value: 245 },
          ]} color="#10b981" />
          <p className="mt-2 text-[11.5px] text-slate-500">Values in $K per month, net of rollback allowance.</p>
        </Panel>
        <div className="grid gap-5">
          <Card title="Agent decision log">
            <ul className="space-y-2 text-[12.5px] text-slate-700">
              <li>Re-scored 418 candidates against fresh telemetry — 06:12 UTC</li>
              <li>Promoted 12 candidates to auto-approve after 14-day stability</li>
              <li>Held 3 candidates: change freeze active for Payments</li>
              <li>Opened 27 change records in ServiceNow with rollback plans</li>
            </ul>
          </Card>
          <Card title="Guardrails applied">
            <ul className="space-y-1.5 text-[12.5px] text-slate-700">
              <li>Never reduce below 2x observed p99 headroom</li>
              <li>Tier-1 production requires human approval</li>
              <li>Max one shape change per service per week</li>
              <li>Automatic rollback on SLO burn rate above 2x</li>
            </ul>
          </Card>
        </div>
      </div>

      <WorkspaceFooter fabric={defaultFabric} maturity={defaultMaturity} />
      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </WorkspaceShell>
  );
}
