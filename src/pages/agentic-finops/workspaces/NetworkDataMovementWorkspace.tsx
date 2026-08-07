import { Network, DollarSign, Globe2, ArrowLeftRight, Shuffle, ShieldCheck, Gauge, Router } from "lucide-react";
import {
  Badge, Card, ConfidenceCell, CostDriverBars, DataTable, DetailDrawer, DonutCard, Kpi, KpiStrip,
  LinkAction, Panel, ProgressRow, RiskCell, Td, Th, TrendArea, useDetailDrawer,
} from "../components/primitives";
import { WorkspaceFooter, WorkspaceShell, FilterBar, defaultFabric, defaultMaturity } from "../components/bands";
import { finopsPages } from "../pages";
import { cn } from "@/lib/utils";

const page = finopsPages.find((p) => p.slug === "network-data-movement")!;

const kpis: Kpi[] = [
  { id: "spend", icon: DollarSign, label: "Annual network spend", value: "$5.21M", sub: "Transfer + endpoints", tone: "blue" },
  { id: "opp", icon: Gauge, label: "Optimization opportunity", value: "$912K", sub: "46 flows", tone: "emerald" },
  { id: "egress", icon: Globe2, label: "Internet egress", value: "1.42 PB", sub: "Per month", tone: "violet" },
  { id: "crossaz", icon: ArrowLeftRight, label: "Cross-AZ traffic", value: "684 TB", sub: "$318K annual", tone: "amber" },
  { id: "crossregion", icon: Shuffle, label: "Cross-region", value: "212 TB", sub: "$196K annual", tone: "sky" },
  { id: "endpoints", icon: Router, label: "Gateways & endpoints", value: "184", sub: "38 underused", tone: "rose" },
  { id: "cdn", icon: Network, label: "CDN offload", value: "71%", sub: "Target 85%", tone: "teal" },
  { id: "policy", icon: ShieldCheck, label: "Flows with policy", value: "62%", sub: "Routing governed", tone: "slate" },
];

const flows = [
  { id: "N-701", flow: "checkout-api → analytics-lake (cross-region)", vol: "84 TB/mo", cost: "$18,400", fix: "Move consumer into us-east-1", save: "$164K", conf: 92, risk: "Medium" as const },
  { id: "N-706", flow: "media-origin → internet (uncached)", vol: "312 TB/mo", cost: "$27,900", fix: "Raise CDN cache hit to 92%", save: "$212K", conf: 89, risk: "Low" as const },
  { id: "N-712", flow: "kafka brokers ↔ consumers (cross-AZ)", vol: "196 TB/mo", cost: "$11,600", fix: "AZ-aware consumer placement", save: "$98K", conf: 94, risk: "Low" as const },
  { id: "N-718", flow: "backup replication → secondary region", vol: "48 TB/mo", cost: "$9,200", fix: "Compress + dedupe before transfer", save: "$74K", conf: 91, risk: "Low" as const },
  { id: "N-725", flow: "S3 access via NAT (no endpoint)", vol: "126 TB/mo", cost: "$7,400", fix: "Add gateway VPC endpoints", save: "$88K", conf: 98, risk: "Very Low" as const },
  { id: "N-733", flow: "partner API egress (uncompressed)", vol: "22 TB/mo", cost: "$4,100", fix: "Enable payload compression", save: "$41K", conf: 76, risk: "Medium" as const },
];

const geo = [
  { region: "us-east-1", share: 38, cost: "$1.98M", tone: "blue" as const },
  { region: "us-west-2", share: 19, cost: "$0.99M", tone: "sky" as const },
  { region: "eu-west-1", share: 17, cost: "$0.89M", tone: "violet" as const },
  { region: "ap-south-1", share: 11, cost: "$0.57M", tone: "teal" as const },
  { region: "eu-central-1", share: 9, cost: "$0.47M", tone: "amber" as const },
  { region: "Other regions", share: 6, cost: "$0.31M", tone: "slate" as const },
];

const mix = [
  { name: "Internet egress", value: 44, display: "$2.29M" },
  { name: "Cross-AZ", value: 18, display: "$0.94M" },
  { name: "Cross-region", value: 14, display: "$0.73M" },
  { name: "NAT gateway processing", value: 12, display: "$0.62M" },
  { name: "Interconnect / DX", value: 8, display: "$0.42M" },
  { name: "Load balancer LCU", value: 4, display: "$0.21M" },
];

const drivers = [
  { name: "Uncached media egress", value: 212, display: "$212K" },
  { name: "Cross-region analytics", value: 164, display: "$164K" },
  { name: "Missing VPC endpoints", value: 88, display: "$88K" },
  { name: "Cross-AZ streaming", value: 98, display: "$98K" },
  { name: "Uncompressed transfers", value: 115, display: "$115K" },
];

const trend = [
  { label: "Apr", value: 468 }, { label: "May", value: 452 }, { label: "Jun", value: 461 },
  { label: "Jul", value: 439 }, { label: "Aug", value: 428 }, { label: "Sep", value: 411 },
];

export default function NetworkDataMovementWorkspace() {
  const drawer = useDetailDrawer();
  return (
    <WorkspaceShell
      title={page.title}
      subtitle={page.subtitle}
      actions={<FilterBar chips={["All regions", "Flows ≥ 1 TB/mo", "Exclude replication SLAs", "Group by service"]} />}
    >
      <KpiStrip kpis={kpis} onSelect={(k) => drawer.open({
        title: k.label, subtitle: `${k.value} — ${k.sub ?? ""}`, tone: k.tone,
        rows: [["Value", k.value], ["Source", "VPC flow logs + CDN logs + billing"], ["Granularity", "Service-to-service, hourly"], ["Window", "Trailing 30 days"]],
        bullets: ["Flows are attributed to owning services via tag and CMDB reconciliation.", "Replication required by DR policy is excluded from optimization targets."],
      })} />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel index={1} title="Top costly traffic flows" action="Ranked by annualized savings">
          <DataTable head={<>
            <Th>ID</Th><Th>Flow</Th><Th right>Volume</Th><Th right>Monthly cost</Th>
            <Th>Proposed fix</Th><Th right>Annual saving</Th><Th right>Confidence</Th><Th>Risk</Th>
          </>}>
            {flows.map((f) => (
              <tr key={f.id} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({
                title: `${f.id} · ${f.flow}`, subtitle: f.fix, tone: "sky",
                rows: [["Volume", f.vol], ["Monthly cost", f.cost], ["Annual saving", f.save], ["Confidence", `${f.conf}%`], ["Risk", f.risk]],
                bullets: [
                  "Flow attribution confirmed across 30 days of VPC flow logs with 98% coverage.",
                  "Latency simulation shows no user-facing regression from the proposed placement.",
                  "Change is reversible by routing policy rollback within one deployment cycle.",
                ],
              })}>
                <Td className="font-medium text-slate-900">{f.id}</Td>
                <Td>{f.flow}</Td>
                <Td right>{f.vol}</Td>
                <Td right>{f.cost}</Td>
                <Td className="text-slate-500">{f.fix}</Td>
                <Td right className="font-semibold text-emerald-700">{f.save}</Td>
                <ConfidenceCell pct={f.conf} right />
                <RiskCell level={f.risk} />
              </tr>
            ))}
          </DataTable>
        </Panel>

        <Panel index={2} title="Geographic traffic distribution" action="Share of network spend by region">
          <ul className="space-y-2.5">
            {geo.map((g) => (
              <li key={g.region} className="grid grid-cols-[110px_1fr_70px] items-center gap-2">
                <span className="truncate text-[12px] font-medium text-slate-700">{g.region}</span>
                <span className="h-3 rounded-sm bg-slate-100">
                  <span
                    className={cn("block h-3 rounded-sm", {
                      blue: "bg-blue-500", sky: "bg-sky-500", violet: "bg-violet-500",
                      teal: "bg-teal-500", amber: "bg-amber-500", slate: "bg-slate-400",
                    }[g.tone])}
                    style={{ width: `${(g.share / 38) * 100}%` }}
                  />
                </span>
                <span className="text-right text-[12px] font-medium tabular-nums text-slate-900">{g.cost}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[12.5px] text-slate-700">
            Inter-region movement between <span className="font-medium">us-east-1</span> and{" "}
            <span className="font-medium">eu-west-1</span> accounts for 61% of cross-region cost, driven by a single
            analytics consumer that can be relocated.
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone="emerald">CDN offload 71%</Badge>
            <Badge tone="amber">38 underused endpoints</Badge>
            <Badge tone="blue">98% flow attribution</Badge>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel index={3} title="Network spend composition">
          <DonutCard data={mix} total="$5.21M" totalLabel="Annualized" />
        </Panel>
        <Panel index={4} title="Cost drivers">
          <CostDriverBars data={drivers} />
        </Panel>
        <Panel index={5} title="Efficiency trajectory" action="$K per month">
          <TrendArea data={trend} color="#0ea5e9" yTickFormatter={(v) => `$${v}K`} />
          <div className="mt-3 space-y-2.5">
            <ProgressRow label="CDN cache hit ratio" pct={71} tone="amber" />
            <ProgressRow label="Endpoint coverage" pct={64} tone="blue" />
            <ProgressRow label="Compression enabled" pct={52} tone="teal" />
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card title="Architectural fixes queued">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Gateway endpoints for S3 and DynamoDB in 11 VPCs</li>
            <li>AZ-aware Kafka consumer group rebalancing</li>
            <li>Analytics consumer relocation to us-east-1</li>
            <li>Brotli compression on partner API responses</li>
          </ul>
        </Card>
        <Card title="Constraints">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>EU data residency prevents 3 relocation options</li>
            <li>DR replication volumes are contractually fixed</li>
            <li>Partner integrations require 30-day change notice</li>
          </ul>
        </Card>
        <Card title="Agent activity">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Correlated 4.1B flow records to 312 services</li>
            <li>Detected 6 new high-cost flows this week</li>
            <li>Opened 9 change records with routing diffs</li>
            <li>Verified $182K of realized network savings YTD</li>
          </ul>
        </Card>
      </div>

      <WorkspaceFooter fabric={defaultFabric} maturity={defaultMaturity} />
      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </WorkspaceShell>
  );
}
