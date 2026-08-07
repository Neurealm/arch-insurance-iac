import { Trash2, DollarSign, Search, ShieldAlert, Users, CheckCircle2, Clock, Archive } from "lucide-react";
import {
  Badge, Card, ConfidenceCell, DataTable, DetailDrawer, DonutCard, Kpi, KpiStrip, LinkAction,
  Panel, ProgressRow, RiskCell, Td, Th, TrendArea, useDetailDrawer,
} from "../components/primitives";
import { WorkspaceFooter, WorkspaceShell, FilterBar, defaultFabric, defaultMaturity } from "../components/bands";
import { finopsPages } from "../pages";
import { cn } from "@/lib/utils";

const page = finopsPages.find((p) => p.slug === "idle-orphaned-resources")!;

const kpis: Kpi[] = [
  { id: "found", icon: Search, label: "Resources detected", value: "1,142", sub: "Idle or orphaned", tone: "blue" },
  { id: "save", icon: DollarSign, label: "Annual savings", value: "$1.81M", sub: "Reclaimable", tone: "emerald" },
  { id: "safe", icon: CheckCircle2, label: "Safe to delete", value: "704", sub: "No dependencies", tone: "teal" },
  { id: "owner", icon: Users, label: "Unowned assets", value: "218", sub: "No tag / no owner", tone: "amber" },
  { id: "risk", icon: ShieldAlert, label: "Blocked", value: "63", sub: "Compliance / legal hold", tone: "rose" },
  { id: "quar", icon: Archive, label: "In quarantine", value: "157", sub: "14-day soft delete", tone: "violet" },
  { id: "age", icon: Clock, label: "Median idle age", value: "97d", sub: "Since last access", tone: "sky" },
  { id: "reclaimed", icon: Trash2, label: "Reclaimed YTD", value: "$1.24M", sub: "Billing verified", tone: "slate" },
];

const candidates = [
  { id: "I-3301", resource: "vol-0af23c9e (gp3, 4 TiB)", type: "Unattached volume", idle: "214d", save: "$412", conf: 99, risk: "Very Low" as const, owner: "Unowned" },
  { id: "I-3312", resource: "nat-gw-legacy-dr", type: "Idle NAT gateway", idle: "168d", save: "$386", conf: 97, risk: "Low" as const, owner: "Network Eng" },
  { id: "I-3318", resource: "eip-198.51.100.24", type: "Unassociated elastic IP", idle: "301d", save: "$41", conf: 100, risk: "Very Low" as const, owner: "Unowned" },
  { id: "I-3325", resource: "rds-analytics-staging", type: "Stopped DB (storage billed)", idle: "121d", save: "$1,840", conf: 94, risk: "Medium" as const, owner: "Data Platform" },
  { id: "I-3340", resource: "eks-dev-sandbox-04", type: "Zero-workload cluster", idle: "88d", save: "$2,210", conf: 92, risk: "Medium" as const, owner: "Dev Enablement" },
  { id: "I-3351", resource: "snapshots-2019-archive", type: "Stale snapshots (2,318)", idle: "1,420d", save: "$3,105", conf: 88, risk: "Low" as const, owner: "Unowned" },
  { id: "I-3366", resource: "lb-checkout-canary", type: "Load balancer, 0 targets", idle: "62d", save: "$178", conf: 96, risk: "Low" as const, owner: "Checkout" },
];

const funnel = [
  { label: "Detected", value: 1142, amount: "$1.81M", tone: "blue" as const },
  { label: "Dependency cleared", value: 918, amount: "$1.52M", tone: "sky" as const },
  { label: "Owner confirmed", value: 762, amount: "$1.31M", tone: "teal" as const },
  { label: "Quarantined", value: 704, amount: "$1.18M", tone: "violet" as const },
  { label: "Deleted", value: 611, amount: "$0.97M", tone: "emerald" as const },
];

const byType = [
  { name: "Storage volumes & snapshots", value: 41, display: "$742K" },
  { name: "Stopped databases", value: 21, display: "$380K" },
  { name: "Idle clusters", value: 16, display: "$290K" },
  { name: "Network resources", value: 12, display: "$217K" },
  { name: "Load balancers", value: 6, display: "$109K" },
  { name: "Other", value: 4, display: "$72K" },
];

const reclaimTrend = [
  { label: "Apr", value: 96 }, { label: "May", value: 121 }, { label: "Jun", value: 143 },
  { label: "Jul", value: 158 }, { label: "Aug", value: 176 }, { label: "Sep", value: 194 },
];

export default function IdleOrphanedResourcesWorkspace() {
  const drawer = useDetailDrawer();
  return (
    <WorkspaceShell
      title={page.title}
      subtitle={page.subtitle}
      actions={<FilterBar chips={["All accounts", "Idle ≥ 30 days", "Exclude legal hold", "Group by owner"]} />}
    >
      <KpiStrip kpis={kpis} onSelect={(k) => drawer.open({
        title: k.label, subtitle: `${k.value} — ${k.sub ?? ""}`, tone: k.tone,
        rows: [["Value", k.value], ["Detection window", "Trailing 90 days"], ["Evidence", "Access logs, IAM activity, flow logs, billing"], ["Quarantine", "14-day reversible soft delete"]],
        bullets: ["Resources are only deleted after quarantine expiry with no access events.", "Snapshots covered by retention policy or legal hold are excluded automatically."],
      })} />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel index={1} title="Idle resource candidates" action="Ranked by monthly savings">
          <DataTable head={<>
            <Th>ID</Th><Th>Resource</Th><Th>Signal</Th><Th right>Idle</Th>
            <Th right>Monthly</Th><Th right>Confidence</Th><Th>Risk</Th><Th>Owner</Th>
          </>}>
            {candidates.map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({
                title: `${c.id} · ${c.resource}`, subtitle: c.type, tone: "emerald",
                rows: [["Idle duration", c.idle], ["Monthly saving", c.save], ["Confidence", `${c.conf}%`], ["Risk", c.risk], ["Owner", c.owner], ["Quarantine", "14 days, reversible"]],
                bullets: [
                  "No read, write, or attach events observed in CloudTrail for the idle window.",
                  "No references from Terraform state, IaC modules, or active change records.",
                  "Owner notified twice; no reclaim objection recorded.",
                  "Restore path: snapshot retained for 30 days post deletion.",
                ],
              })}>
                <Td className="font-medium text-slate-900">{c.id}</Td>
                <Td>{c.resource}</Td>
                <Td className="text-slate-500">{c.type}</Td>
                <Td right>{c.idle}</Td>
                <Td right className="font-semibold text-emerald-700">{c.save}</Td>
                <ConfidenceCell pct={c.conf} right />
                <RiskCell level={c.risk} />
                <Td>{c.owner === "Unowned" ? <Badge tone="amber">Unowned</Badge> : c.owner}</Td>
              </tr>
            ))}
          </DataTable>
        </Panel>

        <Panel index={2} title="Savings impact funnel" action="Detection → verified deletion">
          <ul className="space-y-2">
            {funnel.map((f, i) => (
              <li key={f.label}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="text-slate-600">{f.label}</span>
                  <span className="font-medium text-slate-900">{f.value.toLocaleString()} · {f.amount}</span>
                </div>
                <div className="h-6 rounded bg-slate-100">
                  <div
                    className={cn("h-6 rounded", ["bg-blue-500", "bg-sky-500", "bg-teal-500", "bg-violet-500", "bg-emerald-500"][i])}
                    style={{ width: `${(f.value / funnel[0].value) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11.5px] text-slate-500">
            53.5% of detected resources complete the full reclamation path. Attrition is dominated by owner objections and compliance holds.
          </p>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel index={3} title="Savings by resource type">
          <DonutCard data={byType} total="$1.81M" totalLabel="Annualized" />
        </Panel>
        <Panel index={4} title="Reclamation velocity" action="$K reclaimed per month">
          <TrendArea data={reclaimTrend} color="#10b981" yTickFormatter={(v) => `$${v}K`} />
        </Panel>
        <Panel index={5} title="Ownership hygiene">
          <div className="space-y-2.5">
            <ProgressRow label="Tagged with owner" pct={81} tone="emerald" />
            <ProgressRow label="Cost center mapped" pct={76} tone="blue" />
            <ProgressRow label="IaC managed" pct={64} tone="teal" />
            <ProgressRow label="Retention policy set" pct={58} tone="amber" />
            <ProgressRow label="Orphaned, no owner" pct={19} tone="rose" />
          </div>
          <p className="mt-3 text-[11.5px] text-slate-500">
            Unowned assets route to the platform owner of record after two unanswered notifications.
          </p>
        </Panel>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card title="Quarantine queue">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li className="flex justify-between"><span>Expiring in 48 hours</span><span className="font-medium">41</span></li>
            <li className="flex justify-between"><span>Expiring this week</span><span className="font-medium">96</span></li>
            <li className="flex justify-between"><span>Restored by owners</span><span className="font-medium">12</span></li>
            <li className="flex justify-between"><span>Extended holds</span><span className="font-medium">8</span></li>
          </ul>
        </Card>
        <Card title="Blocked reclamations">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Legal hold on audit log archives (2019–2021)</li>
            <li>PCI evidence retention: 24 months minimum</li>
            <li>Active DR runbook references standby cluster</li>
            <li>Vendor contract requires warm standby capacity</li>
          </ul>
        </Card>
        <Card title="Agent activity">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Scanned 214 accounts · 06:40 UTC</li>
            <li>Promoted 88 candidates to quarantine</li>
            <li>Notified 34 owners via Slack and email</li>
            <li>Executed 61 deletions with snapshot retention</li>
          </ul>
        </Card>
      </div>

      <WorkspaceFooter fabric={defaultFabric} maturity={defaultMaturity} />
      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </WorkspaceShell>
  );
}
