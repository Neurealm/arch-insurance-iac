import { HardDrive, DollarSign, Archive, Snowflake, FileClock, ShieldCheck, Database, TrendingDown } from "lucide-react";
import {
  Badge, Card, ConfidenceCell, CostDriverBars, DataTable, DetailDrawer, DonutCard, Kpi, KpiStrip,
  LinkAction, Panel, ProgressRow, RiskCell, Td, Th, TrendArea, useDetailDrawer,
} from "../components/primitives";
import { WorkspaceFooter, WorkspaceShell, FilterBar, defaultFabric, defaultMaturity } from "../components/bands";
import { finopsPages } from "../pages";

const page = finopsPages.find((p) => p.slug === "storage-data-lifecycle")!;

const kpis: Kpi[] = [
  { id: "total", icon: Database, label: "Managed capacity", value: "18.4 PB", sub: "Across 9 platforms", tone: "blue" },
  { id: "spend", icon: DollarSign, label: "Annual storage spend", value: "$7.62M", sub: "Incl. request costs", tone: "violet" },
  { id: "save", icon: TrendingDown, label: "Tiering opportunity", value: "$1.21M", sub: "87 policies proposed", tone: "emerald" },
  { id: "cold", icon: Snowflake, label: "Cold data in hot tiers", value: "6.1 PB", sub: "No access ≥ 90 days", tone: "sky" },
  { id: "policy", icon: FileClock, label: "Lifecycle coverage", value: "58%", sub: "Buckets with policy", tone: "amber" },
  { id: "dup", icon: Archive, label: "Redundant copies", value: "2.3 PB", sub: "Cross-account duplicates", tone: "rose" },
  { id: "compliance", icon: ShieldCheck, label: "Retention compliant", value: "97%", sub: "Audited datasets", tone: "teal" },
  { id: "unit", icon: HardDrive, label: "Cost per TB/mo", value: "$34.5", sub: "-$6.20 QoQ", tone: "slate" },
];

const inventory = [
  { tier: "Object — standard (hot)", cap: "5.8 PB", cost: "$2.71M", access: "Daily", action: "Tier 2.1 PB to IA", save: "$418K", conf: 94, risk: "Low" as const },
  { tier: "Object — infrequent access", cap: "4.2 PB", cost: "$1.18M", access: "Monthly", action: "Tier 1.4 PB to archive", save: "$262K", conf: 91, risk: "Low" as const },
  { tier: "Object — archive", cap: "3.9 PB", cost: "$0.41M", access: "Rare", action: "Retain", save: "—", conf: 99, risk: "Very Low" as const },
  { tier: "Block — gp3 volumes", cap: "1.9 PB", cost: "$1.64M", access: "Continuous", action: "Shrink over-allocated", save: "$214K", conf: 88, risk: "Medium" as const },
  { tier: "Snapshots & backups", cap: "1.7 PB", cost: "$0.98M", access: "Restore only", action: "Prune beyond retention", save: "$196K", conf: 92, risk: "Low" as const },
  { tier: "Data warehouse storage", cap: "0.9 PB", cost: "$0.70M", access: "Query driven", action: "Partition + compress", save: "$119K", conf: 79, risk: "Medium" as const },
];

const tierMix = [
  { name: "Standard (hot)", value: 36, display: "$2.71M" },
  { name: "Block volumes", value: 21, display: "$1.64M" },
  { name: "Infrequent access", value: 16, display: "$1.18M" },
  { name: "Snapshots & backups", value: 13, display: "$0.98M" },
  { name: "Warehouse", value: 9, display: "$0.70M" },
  { name: "Archive", value: 5, display: "$0.41M" },
];

const drivers = [
  { name: "Cold data in hot tiers", value: 512, display: "$512K" },
  { name: "Unpruned snapshots", value: 196, display: "$196K" },
  { name: "Over-allocated volumes", value: 214, display: "$214K" },
  { name: "Duplicate datasets", value: 168, display: "$168K" },
  { name: "Uncompressed warehouse", value: 119, display: "$119K" },
];

const growth = [
  { label: "Apr", value: 15.9 }, { label: "May", value: 16.4 }, { label: "Jun", value: 16.9 },
  { label: "Jul", value: 17.4 }, { label: "Aug", value: 17.9 }, { label: "Sep", value: 18.4 },
];

export default function StorageDataLifecycleWorkspace() {
  const drawer = useDetailDrawer();
  return (
    <WorkspaceShell
      title={page.title}
      subtitle={page.subtitle}
      actions={<FilterBar chips={["All platforms", "Exclude legal hold", "Access age ≥ 90 days", "Include warehouse"]} />}
    >
      <KpiStrip kpis={kpis} onSelect={(k) => drawer.open({
        title: k.label, subtitle: `${k.value} — ${k.sub ?? ""}`, tone: k.tone,
        rows: [["Value", k.value], ["Coverage", "9 storage platforms, 214 accounts"], ["Access evidence", "Server access logs + query history"], ["Retention", "Mapped to records schedule"]],
        bullets: ["Tiering proposals respect minimum-duration charges and retrieval cost modeling.", "Any dataset under legal hold or regulatory retention is excluded from lifecycle actions."],
      })} />

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Panel index={1} title="Storage inventory by tier" action="Capacity, cost, and proposed lifecycle action">
          <DataTable head={<>
            <Th>Tier</Th><Th right>Capacity</Th><Th right>Annual cost</Th><Th>Access profile</Th>
            <Th>Proposed action</Th><Th right>Saving</Th><Th right>Confidence</Th><Th>Risk</Th>
          </>}>
            {inventory.map((r) => (
              <tr key={r.tier} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({
                title: r.tier, subtitle: r.action, tone: "sky",
                rows: [["Capacity", r.cap], ["Annual cost", r.cost], ["Access profile", r.access], ["Projected saving", r.save], ["Confidence", `${r.conf}%`], ["Risk", r.risk]],
                bullets: [
                  "Access frequency derived from 180 days of object-level access logging.",
                  "Retrieval cost modeled at 2x expected restore volume as a safety margin.",
                  "Lifecycle rule staged in a single bucket first, then rolled out by cost center.",
                ],
              })}>
                <Td className="font-medium text-slate-900">{r.tier}</Td>
                <Td right>{r.cap}</Td>
                <Td right>{r.cost}</Td>
                <Td className="text-slate-500">{r.access}</Td>
                <Td>{r.action}</Td>
                <Td right className="font-semibold text-emerald-700">{r.save}</Td>
                <ConfidenceCell pct={r.conf} right />
                <RiskCell level={r.risk} />
              </tr>
            ))}
          </DataTable>
        </Panel>

        <Panel index={2} title="Lifecycle policy coverage">
          <div className="space-y-2.5">
            <ProgressRow label="Buckets with policy" pct={58} tone="amber" />
            <ProgressRow label="Volumes with snapshot policy" pct={72} tone="blue" />
            <ProgressRow label="Retention schedule mapped" pct={81} tone="teal" />
            <ProgressRow label="Encryption + classification" pct={96} tone="emerald" />
            <ProgressRow label="No policy at all" pct={19} tone="rose" />
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Policy gap</div>
            <p className="mt-1 text-[12.5px] text-slate-700">
              42% of object buckets have no lifecycle rule. Applying the standard tiering ladder to just the top 20 buckets
              captures <span className="font-semibold text-emerald-700">$512K</span> of the $1.21M opportunity.
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone="emerald">Standard ladder</Badge>
            <Badge tone="blue">30d → IA</Badge>
            <Badge tone="violet">90d → Archive</Badge>
            <Badge tone="amber">Legal hold exempt</Badge>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel index={3} title="Spend by storage class">
          <DonutCard data={tierMix} total="$7.62M" totalLabel="Annualized" />
        </Panel>
        <Panel index={4} title="Waste drivers">
          <CostDriverBars data={drivers} />
        </Panel>
        <Panel index={5} title="Capacity growth" action="PB under management">
          <TrendArea data={growth} color="#a855f7" yTickFormatter={(v) => `${v}PB`} />
          <p className="mt-2 text-[11.5px] text-slate-500">
            Capacity grows 3.1% monthly while cost per TB falls 5.4% — tiering is outpacing growth.
          </p>
        </Panel>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card title="Compliance guardrails">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Records schedule mapped to 41 dataset classes</li>
            <li>Legal hold datasets excluded from all lifecycle rules</li>
            <li>PCI and PII data never leaves approved regions</li>
            <li>Immutable backup copies retained for 35 days</li>
          </ul>
        </Card>
        <Card title="Restore assurance">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li className="flex justify-between"><span>Restore tests passed (90d)</span><span className="font-medium">128/128</span></li>
            <li className="flex justify-between"><span>Median archive retrieval</span><span className="font-medium">3h 42m</span></li>
            <li className="flex justify-between"><span>Retrieval cost budget</span><span className="font-medium">$14K/yr</span></li>
          </ul>
        </Card>
        <Card title="Agent activity">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Classified 2.4 PB of newly ingested data</li>
            <li>Proposed 18 lifecycle rules for review</li>
            <li>Pruned 96 TB of snapshots beyond retention</li>
            <li>Flagged 4 buckets with conflicting policies</li>
          </ul>
        </Card>
      </div>

      <WorkspaceFooter fabric={defaultFabric} maturity={defaultMaturity} />
      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </WorkspaceShell>
  );
}
