import { ShieldCheck, DollarSign, ClipboardCheck, Users, Target, AlertTriangle, FileCheck, TrendingUp } from "lucide-react";
import {
  Badge, Card, ConfidenceCell, DataTable, DetailDrawer, DonutCard, GaugeRing, Kpi, KpiStrip,
  LinkAction, Panel, ProgressRow, RiskCell, Td, Th, TrendArea, useDetailDrawer,
} from "../components/primitives";
import { WorkspaceFooter, WorkspaceShell, FilterBar, defaultFabric, defaultMaturity } from "../components/bands";
import { finopsPages } from "../pages";

const page = finopsPages.find((p) => p.slug === "governance-realization")!;

const kpis: Kpi[] = [
  { id: "realized", icon: DollarSign, label: "Realized savings YTD", value: "$5.81M", sub: "Billing verified", tone: "emerald" },
  { id: "target", icon: Target, label: "Annual target", value: "$8.00M", sub: "73% attained", tone: "blue" },
  { id: "pipeline", icon: TrendingUp, label: "Committed pipeline", value: "$3.12M", sub: "Approved, in flight", tone: "teal" },
  { id: "policy", icon: ShieldCheck, label: "Policy compliance", value: "94%", sub: "12 open exceptions", tone: "violet" },
  { id: "approvals", icon: ClipboardCheck, label: "Open approvals", value: "38", sub: "Median age 2.1 days", tone: "amber" },
  { id: "owners", icon: Users, label: "Accountable owners", value: "38", sub: "Cost centers mapped", tone: "sky" },
  { id: "breach", icon: AlertTriangle, label: "Budget breaches", value: "4", sub: "Of 38 cost centers", tone: "rose" },
  { id: "audit", icon: FileCheck, label: "Audit evidence", value: "100%", sub: "Changes traceable", tone: "slate" },
];

const compliance = [
  { policy: "Mandatory cost allocation tags", scope: "All resources", rate: 91, exceptions: 14, owner: "Cloud Platform", status: "On track" },
  { policy: "Budget threshold alerting", scope: "38 cost centers", rate: 100, exceptions: 0, owner: "Finance", status: "Compliant" },
  { policy: "Approval before commitment purchase", scope: "All commitments", rate: 100, exceptions: 0, owner: "Finance", status: "Compliant" },
  { policy: "Lifecycle policy on object storage", scope: "1,204 buckets", rate: 58, exceptions: 41, owner: "Data Platform", status: "At risk" },
  { policy: "Non-prod scheduling enforced", scope: "Non-prod estate", rate: 86, exceptions: 9, owner: "Dev Enablement", status: "On track" },
  { policy: "Rightsizing SLA (14 days to decision)", scope: "418 candidates", rate: 78, exceptions: 22, owner: "Service owners", status: "At risk" },
];

const approvals = [
  { id: "AP-2201", item: "Commitment purchase · Compute SP 3yr", value: "$1.20M", stage: "CFO sign-off", age: "1d", conf: 93, risk: "Low" as const },
  { id: "AP-2208", item: "Rightsize 27 production ASGs", value: "$248K", stage: "Service owner", age: "3d", conf: 94, risk: "Low" as const },
  { id: "AP-2214", item: "Delete 704 quarantined resources", value: "$1.18M", stage: "Platform owner", age: "2d", conf: 96, risk: "Very Low" as const },
  { id: "AP-2219", item: "Storage lifecycle rollout · top 20 buckets", value: "$512K", stage: "Data governance", age: "5d", conf: 88, risk: "Medium" as const },
  { id: "AP-2226", item: "Managed streaming migration funding", value: "$122K", stage: "Architecture board", age: "8d", conf: 71, risk: "High" as const },
];

const realization = [
  { label: "Apr", value: 2.9 }, { label: "May", value: 3.4 }, { label: "Jun", value: 4.0 },
  { label: "Jul", value: 4.6 }, { label: "Aug", value: 5.2 }, { label: "Sep", value: 5.8 },
];

const outcomeMix = [
  { name: "Rightsizing", value: 31, display: "$1.80M" },
  { name: "Reclamation", value: 21, display: "$1.24M" },
  { name: "Commitments", value: 19, display: "$1.10M" },
  { name: "Scheduling", value: 12, display: "$0.70M" },
  { name: "Storage lifecycle", value: 9, display: "$0.52M" },
  { name: "Network", value: 5, display: "$0.29M" },
  { name: "Architecture", value: 3, display: "$0.16M" },
];

export default function GovernanceRealizationWorkspace() {
  const drawer = useDetailDrawer();
  return (
    <WorkspaceShell
      title={page.title}
      subtitle={page.subtitle}
      actions={<FilterBar chips={["Fiscal year to date", "All cost centers", "Verified savings only", "Include exceptions"]} />}
    >
      <KpiStrip kpis={kpis} onSelect={(k) => drawer.open({
        title: k.label, subtitle: `${k.value} — ${k.sub ?? ""}`, tone: k.tone,
        rows: [["Value", k.value], ["Verification", "Two consecutive billing cycles"], ["Owner", "FinOps council"], ["Reported to", "Finance close package"]],
        bullets: ["Only billing-verified savings count toward the annual target.", "Every change carries an immutable audit trail from detection through verification."],
      })} />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel index={1} title="Policy compliance" action="Enforcement rate by policy">
          <DataTable head={<>
            <Th>Policy</Th><Th>Scope</Th><Th right>Compliance</Th><Th right>Exceptions</Th><Th>Owner</Th><Th>Status</Th>
          </>}>
            {compliance.map((c) => (
              <tr key={c.policy} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({
                title: c.policy, subtitle: `${c.scope} · owner ${c.owner}`, tone: c.rate >= 90 ? "emerald" : "amber",
                rows: [["Compliance rate", `${c.rate}%`], ["Open exceptions", String(c.exceptions)], ["Owner", c.owner], ["Status", c.status], ["Review cadence", "Monthly FinOps council"]],
                bullets: [
                  "Exceptions require a documented business justification and an expiry date.",
                  "Non-compliant resources are surfaced to the owning cost center weekly.",
                ],
              })}>
                <Td className="font-medium text-slate-900">{c.policy}</Td>
                <Td className="text-slate-500">{c.scope}</Td>
                <ConfidenceCell pct={c.rate} right />
                <Td right>{c.exceptions}</Td>
                <Td>{c.owner}</Td>
                <Td>
                  <Badge tone={c.status === "Compliant" ? "emerald" : c.status === "On track" ? "blue" : "amber"}>{c.status}</Badge>
                </Td>
              </tr>
            ))}
          </DataTable>
        </Panel>

        <Panel index={2} title="Approval workflows" action="Open decisions and ageing">
          <DataTable head={<><Th>ID</Th><Th>Item</Th><Th right>Value</Th><Th>Stage</Th><Th right>Age</Th><Th>Risk</Th></>}>
            {approvals.map((a) => (
              <tr key={a.id} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({
                title: `${a.id} · ${a.item}`, subtitle: `${a.value} pending at ${a.stage}`, tone: "amber",
                rows: [["Value", a.value], ["Stage", a.stage], ["Age", a.age], ["Confidence", `${a.conf}%`], ["Risk", a.risk], ["SLA", "5 business days"]],
                bullets: [
                  "Approval packet includes evidence, blast radius, rollback plan, and financial model.",
                  "Escalation to the FinOps council occurs automatically after the SLA lapses.",
                ],
              })}>
                <Td className="font-medium text-slate-900">{a.id}</Td>
                <Td>{a.item}</Td>
                <Td right className="font-semibold text-slate-900">{a.value}</Td>
                <Td className="text-slate-500">{a.stage}</Td>
                <Td right>{a.age}</Td>
                <RiskCell level={a.risk} />
              </tr>
            ))}
          </DataTable>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11.5px] text-slate-500">38 approvals open · median age 2.1 days</span>
            <LinkAction>Open approval queue</LinkAction>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel index={3} title="Realization against target" action="$M verified, cumulative">
          <TrendArea data={realization} color="#10b981" yTickFormatter={(v) => `$${v}M`} />
          <div className="mt-3 grid grid-cols-2 items-center gap-3">
            <GaugeRing pct={73} label="Target attainment" sub="$5.81M / $8.00M" />
            <div className="text-[12px] text-slate-600">
              Pipeline of $3.12M already approved covers the remaining gap with a 1.1x buffer.
            </div>
          </div>
        </Panel>
        <Panel index={4} title="Business outcomes by lever">
          <DonutCard data={outcomeMix} total="$5.81M" totalLabel="Verified YTD" />
        </Panel>
        <Panel index={5} title="Accountability health">
          <div className="space-y-2.5">
            <ProgressRow label="Cost centers within budget" pct={89} tone="emerald" right="34/38" />
            <ProgressRow label="Owners acting within SLA" pct={78} tone="blue" />
            <ProgressRow label="Unit economics reported" pct={92} tone="teal" />
            <ProgressRow label="Forecast accuracy" pct={96} tone="violet" />
            <ProgressRow label="Exceptions past expiry" pct={7} tone="rose" right="3" />
          </div>
          <p className="mt-3 text-[11.5px] text-slate-500">
            Unit economics are reported per 1,000 transactions and per active customer, alongside absolute spend.
          </p>
        </Panel>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card title="FinOps council decisions">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Raised commitment coverage target from 80% to 85%</li>
            <li>Approved autonomous execution for reclamation under $5K</li>
            <li>Extended storage lifecycle exception for audit archives</li>
            <li>Set Q1 unit-cost target at $0.42 per 1K transactions</li>
          </ul>
        </Card>
        <Card title="Audit and evidence">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Every change linked to detection evidence and approver</li>
            <li>Savings reconciled to invoices across two billing cycles</li>
            <li>Immutable log retained for 7 years</li>
            <li>Quarterly external review with no material findings</li>
          </ul>
        </Card>
        <Card title="Next quarter commitments">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li className="flex justify-between"><span>Rightsizing wave 3</span><span className="font-medium">$620K</span></li>
            <li className="flex justify-between"><span>Storage lifecycle rollout</span><span className="font-medium">$512K</span></li>
            <li className="flex justify-between"><span>Coverage to 85%</span><span className="font-medium">$1.58M</span></li>
            <li className="flex justify-between"><span>Network fixes</span><span className="font-medium">$402K</span></li>
          </ul>
        </Card>
      </div>

      <WorkspaceFooter fabric={defaultFabric} maturity={defaultMaturity} />
      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </WorkspaceShell>
  );
}
