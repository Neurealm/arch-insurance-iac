import { useState } from "react";
import {
  Search, Trash2, DollarSign, ShieldCheck, Eye, AlertTriangle, TrendingUp, CheckCircle2, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FinOpsHeader from "../components/FinOpsHeader";
import PageBands, { lifecycleWithActive } from "../components/PageBands";
import AgentGrid, { type AgentChip } from "../components/AgentGrid";
import SavingsFunnel from "../components/SavingsFunnel";
import {
  Panel, Badge, KpiStrip, DataTable, Th, Td, DonutCard, DetailDrawer, ConfidenceCell,
  useDetailDrawer, toneMap, CostDriverBars, ProgressRow, LinkAction, type Kpi,
  ViewModeToggle, FullOnly, execKpis, type ViewMode,
} from "../components/primitives";
import { DomainContextBar } from "../components/bands";

const kpis: Kpi[] = [
  { id: "scan", icon: Search, label: "Total Resources Scanned", value: "18,428", sub: "6 accounts · 4 clouds", tone: "blue" },
  { id: "cand", icon: Trash2, label: "Idle & Orphaned Candidates", value: "1,732", sub: "9.4% of fleet", tone: "sky" },
  { id: "save", icon: DollarSign, label: "Potential Annual Savings", value: "$6.42M", sub: "gross opportunity", tone: "emerald" },
  { id: "hc", icon: ShieldCheck, label: "High Confidence", value: "1,124", sub: "≥ 90% certainty", tone: "teal" },
  { id: "rev", icon: Eye, label: "Requires Review", value: "486", sub: "ownership unclear", tone: "amber" },
  { id: "lc", icon: AlertTriangle, label: "Low Confidence", value: "122", sub: "further evidence needed", tone: "rose" },
  { id: "ytd", icon: TrendingUp, label: "Reclaimed YTD", value: "$2.31M", sub: "billing-verified", tone: "emerald" },
  { id: "rate", icon: CheckCircle2, label: "Reclamation Success Rate", value: "93.7%", sub: "no rollback required", tone: "violet" },
];

interface Candidate {
  name: string; type: string; cloud: string; account: string; region: string;
  lastUsed: string; confidence: number; saving: string;
}
const candidates: Candidate[] = [
  { name: "vol-0a91c4e7d2b", type: "EBS Volume (unattached)", cloud: "AWS", account: "prod-commerce", region: "us-east-1", lastUsed: "214 days ago", confidence: 98, saving: "$41,200" },
  { name: "eip-52.14.88.201", type: "Elastic IP (unassociated)", cloud: "AWS", account: "prod-payments", region: "us-east-1", lastUsed: "182 days ago", confidence: 97, saving: "$3,840" },
  { name: "legacy-etl-cluster", type: "EMR Cluster", cloud: "AWS", account: "analytics", region: "us-west-2", lastUsed: "141 days ago", confidence: 94, saving: "$286,400" },
  { name: "snap-2019-archive-*", type: "EBS Snapshot set (412)", cloud: "AWS", account: "prod-commerce", region: "us-east-1", lastUsed: "3+ years", confidence: 96, saving: "$118,700" },
  { name: "mktg-campaign-db-02", type: "RDS Instance", cloud: "AWS", account: "marketing", region: "us-east-1", lastUsed: "97 days ago", confidence: 88, saving: "$74,900" },
  { name: "nsg-decomm-uat-vnet", type: "Load Balancer", cloud: "Azure", account: "uat-platform", region: "eastus", lastUsed: "156 days ago", confidence: 91, saving: "$22,300" },
  { name: "gke-sandbox-pool-3", type: "Node Pool", cloud: "GCP", account: "sandbox", region: "us-central1", lastUsed: "63 days ago", confidence: 79, saving: "$96,500" },
  { name: "dr-replica-orders-eu", type: "RDS Read Replica", cloud: "AWS", account: "prod-commerce", region: "eu-west-1", lastUsed: "Never promoted", confidence: 68, saving: "$142,000" },
  { name: "img-build-cache-bkt", type: "S3 Bucket (2.4 TB)", cloud: "AWS", account: "platform", region: "us-east-1", lastUsed: "119 days ago", confidence: 92, saving: "$31,400" },
  { name: "nat-gw-legacy-vpc", type: "NAT Gateway", cloud: "AWS", account: "legacy", region: "us-east-1", lastUsed: "88 days ago", confidence: 86, saving: "$48,600" },
];

const reasons = [
  { name: "Detached / unattached", value: 34, display: "34%" },
  { name: "Environment decommissioned", value: 22, display: "22%" },
  { name: "Application retired", value: 16, display: "16%" },
  { name: "Unsupported / deprecated", value: 11, display: "11%" },
  { name: "Test / non-prod leftover", value: 10, display: "10%" },
  { name: "Unknown ownership", value: 7, display: "7%" },
];

const byType = [
  { name: "Compute (EC2 / VM)", value: 1820, display: "$1.82M" },
  { name: "Databases", value: 1410, display: "$1.41M" },
  { name: "Block storage & snapshots", value: 1160, display: "$1.16M" },
  { name: "Object storage", value: 780, display: "$780K" },
  { name: "Networking", value: 690, display: "$690K" },
  { name: "Managed services", value: 560, display: "$560K" },
];

const agents: AgentChip[] = [
  { name: "Discovery Agent", status: "Complete", confidence: 98, finding: "1,732 candidates enumerated" },
  { name: "Ownership Agent", status: "Complete", confidence: 84, finding: "Owner inferred from tags + commits" },
  { name: "Dependency Agent", status: "Complete", confidence: 96, finding: "No attachments or routes found" },
  { name: "Risk Agent", status: "Complete", confidence: 93, finding: "No DR or compliance hold" },
  { name: "Compliance Agent", status: "Complete", confidence: 90, finding: "Retention policy satisfied" },
  { name: "Decision Agent", status: "Ready", confidence: 95, finding: "Recommends delete with snapshot" },
];

const checklist: [string, boolean][] = [
  ["No attachment to a running instance for 214 days", true],
  ["No IAM or application access recorded in CloudTrail", true],
  ["Not referenced by any Terraform state or IaC module", true],
  ["Not part of a backup, DR, or legal-hold policy", true],
  ["Owning team identified: Commerce Platform", true],
  ["Snapshot retained for 30 days before deletion", true],
];

const evidenceNodes = [
  "No compute dependency", "No network dependency", "No IAM dependency",
  "No data pipeline dependency", "No backup dependency", "No cost allocation owner",
];

const explainerTabs = ["Evidence", "Topology", "Timeline", "Change History", "Policies"] as const;

const capability: [string, string, string][] = [
  ["Idle resource enumeration", "Yes", "Yes"],
  ["Ownership inference where tags are missing", "No", "Yes"],
  ["Dependency and reference verification", "No", "Yes"],
  ["Compliance and retention hold checks", "Partial", "Yes"],
  ["Confidence scoring per candidate", "No", "Yes"],
  ["Safe reclamation with snapshot and rollback", "No", "Yes"],
  ["Verified savings reconciliation", "No", "Yes"],
];

export default function IdleOrphanedResourceReclamationWorkspace() {
  const drawer = useDetailDrawer();
  const [selected, setSelected] = useState<Candidate>(candidates[0]);
  const [tab, setTab] = useState<(typeof explainerTabs)[number]>("Evidence");
  const [mode, setMode] = useState<ViewMode>("exec");

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-6 py-6">
      <FinOpsHeader
        title="Idle & Orphaned Resource Reclamation Workspace"
        tagline="Reclaim $1.8M of unused cloud capacity with dependency-verified, low-risk deletions."
        secondaryActions={[{ label: "Export Candidate List", icon: "export" }, { label: "Reclamation Simulator", icon: "simulate" }]}
        meta={{ lastAnalysis: "8 minutes ago", freshness: "99.1% within SLA", resources: "18,428 resources scanned" }}
        onPrimary={() => drawer.open({ title: "Discovery scan complete", tone: "blue", rows: [["New candidates", "63"], ["Resolved since last run", "41"], ["Scan duration", "2m 11s"]] })}
        onSecondary={(l) => drawer.open({ title: l, tone: "slate", bullets: ["Synthetic demonstration action."] })}
        extra={<span className="ml-auto"><ViewModeToggle mode={mode} onChange={setMode} /></span>}
      />

      <DomainContextBar headline="Opportunity in this domain: $1.8M · Confidence 96% · Risk Very Low" nextSlug="commitment-optimization" nextLabel="Commitment Optimization" />

      <KpiStrip kpis={execKpis(kpis, mode)} onSelect={(k) => drawer.open({ title: k.label, subtitle: k.sub, tone: k.tone, rows: [["Value", k.value], ["Source", "Discovery agent"]] })} />

      {/* 1 */}
      <Panel index={1} title="Top idle & orphaned candidates" action={<LinkAction onClick={() => drawer.open({ title: "All 1,732 candidates", tone: "blue", bullets: ["Filtered views available by cloud, account, and owner."] })}>View all 1,732</LinkAction>}>
        <div className="grid gap-4 xl:grid-cols-[3fr_1fr]">
          <DataTable head={<>
            <Th>Resource name</Th><Th>Type</Th><Th>Cloud</Th><Th>Account</Th><Th>Region</Th><Th>Last used</Th><Th right>Confidence</Th><Th right>Annual saving</Th>
          </>}>
            {candidates.map((c) => (
              <tr key={c.name} onClick={() => setSelected(c)} className={cn("cursor-pointer hover:bg-slate-50", selected.name === c.name && "bg-indigo-50/60")}>
                <Td className="font-medium text-slate-900">{c.name}</Td>
                <Td>{c.type}</Td>
                <Td>{c.cloud}</Td>
                <Td>{c.account}</Td>
                <Td>{c.region}</Td>
                <Td>{c.lastUsed}</Td>
                <ConfidenceCell pct={c.confidence} right />
                <Td right className="font-semibold text-emerald-700">{c.saving}</Td>
              </tr>
            ))}
          </DataTable>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-800">
              <HelpCircle className="h-3.5 w-3.5" /> What is an orphaned resource?
            </div>
            <p className="mt-1.5 text-[11.5px] leading-snug text-slate-700">
              A resource that still bills every hour but has no owner, no attachment, and no reference from any running workload, pipeline, or infrastructure module.
            </p>
            <ul className="mt-2 space-y-1 text-[11.5px] text-slate-700">
              {["Detached volumes and unassociated addresses", "Databases left behind by retired applications", "Snapshots and images past their retention window", "Clusters and node pools from finished projects"].map((x) => (
                <li key={x} className="flex gap-1.5"><span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-blue-400" />{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>

      <div className={mode === "exec" ? "grid gap-5" : "grid gap-5 xl:grid-cols-2"}>
        {/* 2 */}
        <FullOnly mode={mode}>
          <Panel index={2} title="Why resources are idle">
            <DonutCard data={reasons} total="1,732" totalLabel="Candidates" />
          </Panel>
        </FullOnly>

        {/* 3 */}
        <Panel index={3} title="Savings impact">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">Potential annual savings</div>
              <div className="text-4xl font-bold leading-none text-emerald-700">$6.42M</div>
            </div>
            <div className="text-[11.5px] text-slate-500">$535K per month · 4.1% of total cloud spend</div>
          </div>
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Savings by resource type</div>
            <div className="mt-2"><CostDriverBars data={byType} /></div>
          </div>
          <div className="mt-4">
            <SavingsFunnel stages={[
              { label: "Identified", value: "$6.42M", pct: 100, tone: "blue" },
              { label: "Validated", value: "$4.86M", pct: 76, tone: "sky" },
              { label: "Approved", value: "$3.14M", pct: 49, tone: "amber" },
              { label: "Reclaimed YTD", value: "$2.31M", pct: 36, tone: "emerald" },
            ]} />
          </div>
        </Panel>
      </div>

      {/* 4 */}
      <FullOnly mode={mode}>
      <Panel index={4} title="Agentic investigation workspace">
        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-3">
            <AgentGrid agents={agents} columns="md:grid-cols-3 xl:grid-cols-6" engineLabel={null}
              onSelect={(a) => drawer.open({ title: a.name, subtitle: a.finding, tone: "violet", rows: [["Status", a.status], ["Confidence", `${a.confidence}%`]] })} />
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Selected resource</div>
              <div className="mt-1 text-[14px] font-bold text-slate-900">{selected.name}</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge tone="slate">{selected.type}</Badge>
                <Badge tone="blue">{selected.cloud} · {selected.region}</Badge>
                <Badge tone="amber">Last used {selected.lastUsed}</Badge>
                <Badge tone="emerald">{selected.saving}/yr</Badge>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Investigation summary</div>
              <ul className="mt-1.5 grid gap-1 md:grid-cols-2">
                {checklist.map(([label]) => (
                  <li key={label} className="flex gap-1.5 text-[11.5px] text-slate-700">
                    <CheckCircle2 className="mt-[2px] h-3 w-3 shrink-0 text-emerald-500" />{label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Agent recommendation</div>
            <div className="mt-1 text-[16px] font-bold text-slate-900">DELETE</div>
            <dl className="mt-2 space-y-1 text-[12px]">
              {[["Confidence", `${selected.confidence}%`], ["Risk", "Low"], ["Annual saving", selected.saving], ["Automation policy", "Auto-approve ≥ 95%"], ["Snapshot retention", "30 days"]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2"><dt className="text-slate-500">{k}</dt><dd className="font-semibold text-slate-900">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-2 text-[11.5px] leading-snug text-slate-700">
              Reason: no attachment, reference, or access recorded for {selected.lastUsed}; owning team confirmed the parent environment was decommissioned.
            </p>
            <button type="button" onClick={() => drawer.open({
              title: `Reclamation plan · ${selected.name}`, tone: "emerald",
              rows: [["Step 1", "Create retention snapshot"], ["Step 2", "Tag as pending-reclamation"], ["Step 3", "7-day quiet period"], ["Step 4", "Delete resource"], ["Step 5", "Verify against next invoice"]],
            })} className="mt-3 w-full rounded-md bg-slate-900 px-2.5 py-1.5 text-[11.5px] font-semibold text-white hover:bg-slate-800">
              Review Reclamation Plan
            </button>
          </div>
        </div>
      </Panel>
      </FullOnly>

      <div className={mode === "exec" ? "grid gap-5" : "grid gap-5 xl:grid-cols-2"}>
        {/* 5 */}
        <Panel index={5} title="Confidence & risk overview">
          <DonutCard total="1,732" totalLabel="Candidates" data={[
            { name: "High confidence (≥90%)", value: 1124, display: "1,124", color: "#10b981" },
            { name: "Requires review (70–89%)", value: 486, display: "486", color: "#f59e0b" },
            { name: "Low confidence (<70%)", value: 122, display: "122", color: "#ef4444" },
          ]} />
          <div className="mt-3 space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Risk level distribution</div>
            <ProgressRow label="Very low risk" pct={58} tone="emerald" right="1,004" />
            <ProgressRow label="Low risk" pct={26} tone="teal" right="451" />
            <ProgressRow label="Medium risk" pct={12} tone="amber" right="208" />
            <ProgressRow label="High risk" pct={4} tone="rose" right="69" />
          </div>
        </Panel>

        {/* 6 */}
        <FullOnly mode={mode}>
        <Panel index={6} title="Orphaned resource explainer">
          <div className="flex flex-wrap gap-1.5">
            {explainerTabs.map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={cn("rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                  tab === t ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300")}>
                {t}
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {evidenceNodes.map((n) => (
              <div key={n} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                <div className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="mt-1 text-[11.5px] font-medium text-slate-700">{n}</div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Key evidence — {tab}</div>
            <ul className="mt-1.5 space-y-1">
              {{
                Evidence: ["No CloudTrail access events in 214 days", "No attachment records in EC2 API history", "No Terraform state reference"],
                Topology: ["Not present in the service dependency graph", "Parent VPC has no active workloads", "No route table or security group binding"],
                Timeline: ["Created 2023-04-11 for a migration pilot", "Detached 2024-12-08 when the pilot ended", "No activity since detachment"],
                "Change History": ["Last IaC change 18 months ago", "No manual console change in 12 months", "No change ticket references this resource"],
                Policies: ["Not covered by backup policy BKP-07", "No legal hold applied", "Retention policy satisfied (>90 days)"],
              }[tab].map((x) => (
                <li key={x} className="flex gap-1.5 text-[11.5px] text-slate-700">
                  <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />{x}
                </li>
              ))}
            </ul>
          </div>
        </Panel>
        </FullOnly>
      </div>

      <FullOnly mode={mode}>
      {/* 7 */}
      <Panel index={7} title="Existing tool vs Neurealm">
        <DataTable head={<><Th>Capability</Th><Th right>Existing tooling</Th><Th right>Neurealm agentic FinOps</Th></>}>
          {capability.map(([cap, ex, nr]) => (
            <tr key={cap} className="hover:bg-slate-50">
              <Td>{cap}</Td>
              <Td right><Badge tone={ex === "Yes" ? "emerald" : ex === "Partial" ? "amber" : "rose"}>{ex}</Badge></Td>
              <Td right><Badge tone="emerald">{nr}</Badge></Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
      </FullOnly>

      <FullOnly mode={mode}>
      {/* 8 */}
      <Panel index={8} title="Responsibility model">
        <DataTable head={<><Th>Function</Th><Th>Responsibility</Th><Th right>Role</Th></>}>
          {[
            ["FinOps", "Owns the reclamation backlog and savings target", "Accountable"],
            ["Cloud Engineering", "Executes snapshot, tag, and delete workflow", "Responsible"],
            ["SRE", "Confirms no DR or failover dependency", "Consulted"],
            ["Application Owner", "Confirms the resource is no longer required", "Consulted"],
            ["Security & Compliance", "Confirms retention and legal-hold posture", "Consulted"],
            ["Neurealm Agents", "Continuous discovery, evidence, and verification", "Automated"],
          ].map(([fn, resp, role]) => (
            <tr key={fn} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-900">{fn}</Td><Td>{resp}</Td>
              <Td right><Badge tone={role === "Accountable" ? "emerald" : role === "Automated" ? "violet" : "slate"}>{role}</Badge></Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
      </FullOnly>

      <PageBands
        lifecycle={lifecycleWithActive("Execute")}
        maturity={[
          { level: "Level 1", title: "Manual sweeps", detail: "Quarterly clean-up campaigns driven by spreadsheets. Time to value: 1 quarter.", state: "future" },
          { level: "Level 2", title: "Evidence-backed reclamation", detail: "Continuous discovery with ownership and dependency proof before deletion. Time to value: 30 days.", state: "current" },
          { level: "Level 3", title: "Policy-driven autonomy", detail: "High-confidence candidates reclaim automatically with snapshot and rollback. Time to value: 2 quarters.", state: "next" },
        ]}
      />

      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </div>
  );
}
