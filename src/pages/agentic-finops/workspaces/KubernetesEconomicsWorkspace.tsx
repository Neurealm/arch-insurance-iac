import { Container, DollarSign, Cpu, Layers, PackageOpen, ShieldCheck, Gauge, Server } from "lucide-react";
import {
  Badge, Card, ConfidenceCell, CostDriverBars, DataTable, DetailDrawer, DonutCard, GaugeRing, Kpi,
  KpiStrip, Panel, ProgressRow, RiskCell, SimpleBars, Td, Th, useDetailDrawer,
} from "../components/primitives";
import { WorkspaceFooter, WorkspaceShell, FilterBar, defaultFabric, defaultMaturity } from "../components/bands";
import { finopsPages } from "../pages";

const page = finopsPages.find((p) => p.slug === "kubernetes-economics")!;

const kpis: Kpi[] = [
  { id: "clusters", icon: Container, label: "Clusters", value: "38", sub: "6 providers / regions", tone: "blue" },
  { id: "spend", icon: DollarSign, label: "Annual K8s spend", value: "$9.14M", sub: "Compute + control plane", tone: "violet" },
  { id: "opp", icon: Gauge, label: "Optimization opportunity", value: "$742K", sub: "312 candidates", tone: "emerald" },
  { id: "requests", icon: PackageOpen, label: "Request efficiency", value: "41%", sub: "Requested vs used", tone: "amber" },
  { id: "bin", icon: Layers, label: "Bin-packing density", value: "58%", sub: "Target 75%", tone: "sky" },
  { id: "spot", icon: Server, label: "Spot coverage", value: "29%", sub: "Eligible workloads", tone: "teal" },
  { id: "idle", icon: Cpu, label: "Idle node cost", value: "$118K", sub: "Annualized", tone: "rose" },
  { id: "policy", icon: ShieldCheck, label: "Namespaces with quotas", value: "76%", sub: "Governance coverage", tone: "slate" },
];

const clusters = [
  { name: "prod-us-east-core", nodes: 214, cost: "$2.41M", req: 38, dens: 54, spot: 12, save: "$214K", conf: 93, risk: "Low" as const },
  { name: "prod-eu-west-core", nodes: 138, cost: "$1.62M", req: 42, dens: 58, spot: 9, save: "$148K", conf: 91, risk: "Low" as const },
  { name: "prod-data-platform", nodes: 96, cost: "$1.48M", req: 51, dens: 66, spot: 4, save: "$96K", conf: 86, risk: "Medium" as const },
  { name: "ml-training-shared", nodes: 62, cost: "$1.21M", req: 34, dens: 47, spot: 61, save: "$132K", conf: 88, risk: "Medium" as const },
  { name: "staging-shared", nodes: 74, cost: "$0.68M", req: 28, dens: 41, spot: 74, save: "$88K", conf: 96, risk: "Very Low" as const },
  { name: "dev-sandboxes", nodes: 118, cost: "$0.54M", req: 22, dens: 33, spot: 82, save: "$64K", conf: 97, risk: "Very Low" as const },
];

const spendMix = [
  { name: "Worker nodes", value: 62, display: "$5.67M" },
  { name: "Persistent volumes", value: 12, display: "$1.10M" },
  { name: "Load balancers", value: 9, display: "$0.82M" },
  { name: "Control planes", value: 7, display: "$0.64M" },
  { name: "Cross-AZ traffic", value: 6, display: "$0.55M" },
  { name: "Registry & artifacts", value: 4, display: "$0.36M" },
];

const nodeGroups = [
  { label: "m6i general", value: 214 }, { label: "c6i compute", value: 148 },
  { label: "r6i memory", value: 96 }, { label: "g5 GPU", value: 42 },
  { label: "c7g ARM", value: 118 }, { label: "spot pool", value: 164 },
];

const drivers = [
  { name: "Over-requested CPU", value: 268, display: "$268K" },
  { name: "Over-requested memory", value: 174, display: "$174K" },
  { name: "Idle / cordoned nodes", value: 118, display: "$118K" },
  { name: "Unattached volumes", value: 92, display: "$92K" },
  { name: "Cross-AZ pod chatter", value: 90, display: "$90K" },
];

export default function KubernetesEconomicsWorkspace() {
  const drawer = useDetailDrawer();
  return (
    <WorkspaceShell
      title={page.title}
      subtitle={page.subtitle}
      actions={<FilterBar chips={["All clusters", "Production + staging", "Requests vs usage", "Exclude GPU training"]} />}
    >
      <KpiStrip kpis={kpis} onSelect={(k) => drawer.open({
        title: k.label, subtitle: `${k.value} — ${k.sub ?? ""}`, tone: k.tone,
        rows: [["Value", k.value], ["Source", "kube-state-metrics + Prometheus + billing"], ["Attribution", "Namespace → cost center"], ["Refresh", "Hourly"]],
        bullets: ["Request efficiency compares p95 usage to declared requests across a 14-day window.", "Recommendations preserve declared limits and PodDisruptionBudgets."],
      })} />

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Panel index={1} title="Cluster overview" action="Cost, efficiency, and opportunity by cluster">
          <DataTable head={<>
            <Th>Cluster</Th><Th right>Nodes</Th><Th right>Annual cost</Th><Th right>Request eff.</Th>
            <Th right>Density</Th><Th right>Spot</Th><Th right>Opportunity</Th><Th right>Confidence</Th><Th>Risk</Th>
          </>}>
            {clusters.map((c) => (
              <tr key={c.name} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({
                title: c.name, subtitle: `${c.nodes} nodes · ${c.cost} annualized`, tone: "blue",
                rows: [["Request efficiency", `${c.req}%`], ["Bin-packing density", `${c.dens}%`], ["Spot coverage", `${c.spot}%`], ["Opportunity", c.save], ["Confidence", `${c.conf}%`], ["Risk", c.risk]],
                bullets: [
                  "Right-sizing requests to p95 usage recovers most of the modeled opportunity.",
                  "Node group consolidation raises density without breaching PodDisruptionBudgets.",
                  "Spot expansion applies only to workloads tolerating interruption within 2 minutes.",
                ],
              })}>
                <Td className="font-medium text-slate-900">{c.name}</Td>
                <Td right>{c.nodes}</Td>
                <Td right>{c.cost}</Td>
                <Td right>{c.req}%</Td>
                <Td right>{c.dens}%</Td>
                <Td right>{c.spot}%</Td>
                <Td right className="font-semibold text-emerald-700">{c.save}</Td>
                <ConfidenceCell pct={c.conf} right />
                <RiskCell level={c.risk} />
              </tr>
            ))}
          </DataTable>
        </Panel>

        <Panel index={2} title="Spend breakdown">
          <DonutCard data={spendMix} total="$9.14M" totalLabel="Annualized" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 p-3 text-center">
              <GaugeRing pct={41} label="Request efficiency" sub="Target 70%" tone="amber" />
            </div>
            <div className="rounded-lg border border-slate-200 p-3 text-center">
              <GaugeRing pct={58} label="Bin-packing" sub="Target 75%" tone="blue" />
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel index={3} title="Node group optimization" action="Node count by group">
          <SimpleBars data={nodeGroups} color="#3b82f6" />
          <p className="mt-2 text-[11.5px] text-slate-500">
            Consolidating m6i and c6i pools into a single ARM-capable group removes 62 nodes at equal capacity.
          </p>
        </Panel>
        <Panel index={4} title="Waste drivers">
          <CostDriverBars data={drivers} />
        </Panel>
        <Panel index={5} title="Governance coverage">
          <div className="space-y-2.5">
            <ProgressRow label="Namespace quotas set" pct={76} tone="emerald" />
            <ProgressRow label="Limit ranges defined" pct={68} tone="blue" />
            <ProgressRow label="Cost labels complete" pct={84} tone="teal" />
            <ProgressRow label="VPA / HPA configured" pct={57} tone="amber" />
            <ProgressRow label="Untracked namespaces" pct={11} tone="rose" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone="emerald">Showback live</Badge>
            <Badge tone="blue">38 clusters</Badge>
            <Badge tone="amber">11% untracked</Badge>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card title="Recommended workload actions">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Right-size requests for 312 deployments to p95 usage</li>
            <li>Move 148 batch workloads to a spot-backed node group</li>
            <li>Enable VPA in recommendation mode across staging</li>
            <li>Reclaim 92 unattached persistent volumes</li>
          </ul>
        </Card>
        <Card title="Reliability guardrails">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>PodDisruptionBudgets always respected during drain</li>
            <li>Minimum 2 replicas retained for tier-1 services</li>
            <li>Spot capped at 40% for latency-sensitive workloads</li>
            <li>Automatic revert if pod eviction rate doubles</li>
          </ul>
        </Card>
        <Card title="Agent activity">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Re-scored 312 workload recommendations · 05:20 UTC</li>
            <li>Applied 46 request changes in staging</li>
            <li>Consolidated 3 node groups in dev-sandboxes</li>
            <li>Verified $214K realized K8s savings YTD</li>
          </ul>
        </Card>
      </div>

      <WorkspaceFooter fabric={defaultFabric} maturity={defaultMaturity} />
      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </WorkspaceShell>
  );
}
