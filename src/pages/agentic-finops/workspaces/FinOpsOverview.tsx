import { useState } from "react";
import { DollarSign, TrendingDown, Bot, ShieldCheck, Gauge, Layers, Clock, Target } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Card, CostDriverBars, DataTable, DetailDrawer, DonutCard, Kpi, KpiStrip, Panel,
  ProgressRow, RiskCell, Td, Th, TrendArea, useDetailDrawer, Badge, LinkAction, ConfidenceCell,
  ViewModeToggle, FullOnly, execKpis, type ViewMode,
} from "../components/primitives";
import { WorkspaceFooter, defaultFabric, defaultMaturity, finopsLifecycle } from "../components/bands";
import FinOpsHeader from "../components/FinOpsHeader";
import { finopsBase, finopsPages } from "../pages";


const kpis: Kpi[] = [
  { id: "spend", icon: DollarSign, label: "Annualized spend", value: "$48.2M", sub: "+3.1% vs prior qtr", tone: "blue" },
  { id: "opp", icon: TrendingDown, label: "Identified opportunity", value: "$9.4M", sub: "19.5% of spend", tone: "emerald" },
  { id: "approved", icon: ShieldCheck, label: "Approved in flight", value: "$3.1M", sub: "142 change records", tone: "teal" },
  { id: "realized", icon: Target, label: "Realized YTD", value: "$5.8M", sub: "Billing verified", tone: "violet" },
  { id: "agents", icon: Bot, label: "Agent actions", value: "1,284", sub: "Last 30 days", tone: "sky" },
  { id: "coverage", icon: Layers, label: "Coverage", value: "92%", sub: "Accounts instrumented", tone: "amber" },
  { id: "waste", icon: Gauge, label: "Waste ratio", value: "14.8%", sub: "-4.2 pts QoQ", tone: "rose" },
  { id: "mttr", icon: Clock, label: "Opportunity age", value: "6.2d", sub: "Median to decision", tone: "slate" },
];

const spendMix = [
  { name: "Compute", value: 18.4, display: "$18.4M" },
  { name: "Kubernetes", value: 9.1, display: "$9.1M" },
  { name: "Storage", value: 7.6, display: "$7.6M" },
  { name: "Data transfer", value: 5.2, display: "$5.2M" },
  { name: "Managed data", value: 4.7, display: "$4.7M" },
  { name: "Observability", value: 2.1, display: "$2.1M" },
  { name: "Other", value: 1.1, display: "$1.1M" },
];

const trend = [
  { label: "Jan", value: 4.21 }, { label: "Feb", value: 4.18 }, { label: "Mar", value: 4.32 },
  { label: "Apr", value: 4.27 }, { label: "May", value: 4.11 }, { label: "Jun", value: 3.98 },
  { label: "Jul", value: 3.94 }, { label: "Aug", value: 3.88 }, { label: "Sep", value: 3.81 },
];

const drivers = [
  { name: "Overprovisioned compute", value: 2.9, display: "$2.9M" },
  { name: "Idle & orphaned assets", value: 1.8, display: "$1.8M" },
  { name: "Commitment gaps", value: 1.6, display: "$1.6M" },
  { name: "Storage tiering", value: 1.2, display: "$1.2M" },
  { name: "Cross-AZ traffic", value: 0.9, display: "$0.9M" },
  { name: "K8s request bloat", value: 0.7, display: "$0.7M" },
];

const domains = [
  { slug: "resource-rightsizing", opp: "$2.9M", items: 418, conf: 94, risk: "Low" as const, state: "Executing" },
  { slug: "idle-orphaned-resources", opp: "$1.8M", items: 1_142, conf: 96, risk: "Very Low" as const, state: "Executing" },
  { slug: "commitment-optimization", opp: "$1.6M", items: 22, conf: 89, risk: "Medium" as const, state: "Awaiting approval" },
  { slug: "elasticity-scheduling", opp: "$1.1M", items: 264, conf: 91, risk: "Low" as const, state: "Executing" },
  { slug: "storage-data-lifecycle", opp: "$1.2M", items: 87, conf: 88, risk: "Low" as const, state: "Modeling" },
  { slug: "network-data-movement", opp: "$0.9M", items: 46, conf: 74, risk: "Medium" as const, state: "Validating" },
  { slug: "platform-architecture-efficiency", opp: "$0.6M", items: 14, conf: 68, risk: "High" as const, state: "Design review" },
  { slug: "kubernetes-economics", opp: "$0.7M", items: 312, conf: 92, risk: "Low" as const, state: "Executing" },
];

export default function FinOpsOverview() {
  const drawer = useDetailDrawer();
  const [mode, setMode] = useState<ViewMode>("exec");
  const page = finopsPages[0];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-6 py-6">
      <FinOpsHeader
        title={page.title}
        tagline="One portfolio view of where cloud money is going, what can be recovered, and what has already been banked."
        extra={<span className="ml-auto"><ViewModeToggle mode={mode} onChange={setMode} /></span>}
      />
      <KpiStrip
        kpis={execKpis(kpis, mode)}
        onSelect={(k) =>
          drawer.open({
            title: k.label, subtitle: `${k.value} — ${k.sub ?? ""}`, tone: k.tone,
            rows: [["Metric", k.label], ["Current", k.value], ["Movement", k.sub ?? "—"], ["Source", "Billing export + telemetry correlation"]],
            bullets: [
              "Computed from normalized multi-cloud billing across 214 linked accounts.",
              "Reconciled nightly against provider invoices with a 0.4% variance tolerance.",
              "Synthetic demonstration values.",
            ],
          })
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <Panel index={1} title="Portfolio spend mix" action="Annualized run rate">
          <DonutCard data={spendMix} total="$48.2M" totalLabel="Annualized" />
        </Panel>
        <Panel index={2} title="Top optimization drivers" action="Opportunity value">
          <CostDriverBars data={drivers} />
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel index={3} title="Monthly spend trajectory" action="$M per month">
          <TrendArea data={trend} yTickFormatter={(v) => `$${v}M`} />
        </Panel>
        <Panel index={4} title="Realization confidence">
          <div className="space-y-2.5">
            <ProgressRow label="Billing verified" pct={62} tone="emerald" right="$5.8M" />
            <ProgressRow label="Executed, pending" pct={28} tone="blue" right="$2.6M" />
            <ProgressRow label="Approved, scheduled" pct={16} tone="teal" right="$1.5M" />
            <ProgressRow label="Awaiting approval" pct={11} tone="amber" right="$1.0M" />
            <ProgressRow label="Blocked / disputed" pct={4} tone="rose" right="$0.4M" />
          </div>
          <p className="mt-3 text-[11.5px] text-slate-500">
            Only billing-verified savings are reported to Finance. Everything else is tracked as pipeline.
          </p>
        </Panel>
      </div>

      <Panel index={5} title="Optimization domains" action={<span>Click a domain to open its workspace</span>}>
        <DataTable
          head={<>
            <Th>Domain</Th><Th right>Opportunity</Th><Th right>Candidates</Th>
            <Th right>Confidence</Th><Th>Risk</Th><Th>State</Th><Th right>Action</Th>
          </>}
        >
          {domains.map((d) => {
            const p = finopsPages.find((x) => x.slug === d.slug)!;
            return (
              <tr key={d.slug} className="hover:bg-slate-50">
                <Td>
                  <Link to={`${finopsBase}/${d.slug}`} className="font-medium text-slate-900 hover:text-indigo-700">
                    {p.navLabel}
                  </Link>
                </Td>
                <Td right className="font-semibold text-slate-900">{d.opp}</Td>
                <Td right>{d.items.toLocaleString()}</Td>
                <ConfidenceCell pct={d.conf} right />
                <RiskCell level={d.risk} />
                <Td><Badge tone={d.state === "Executing" ? "emerald" : d.state === "Awaiting approval" ? "amber" : "blue"}>{d.state}</Badge></Td>
                <Td right>
                  <LinkAction onClick={() => drawer.open({
                    title: p.title, subtitle: p.subtitle, tone: "blue",
                    rows: [["Opportunity", d.opp], ["Candidates", String(d.items)], ["Confidence", `${d.conf}%`], ["Risk", d.risk], ["State", d.state]],
                    bullets: [
                      "Candidates are re-scored every 6 hours against fresh utilization telemetry.",
                      "Each candidate carries a dependency map, blast-radius estimate, and rollback path.",
                    ],
                  })}>View evidence</LinkAction>
                </Td>
              </tr>
            );
          })}
        </DataTable>
      </Panel>

      <div className="grid gap-5 md:grid-cols-3">
        <Card title="Agentic activity (30d)">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li className="flex justify-between"><span>Candidates generated</span><span className="font-medium">3,841</span></li>
            <li className="flex justify-between"><span>Auto-validated safe</span><span className="font-medium">2,104</span></li>
            <li className="flex justify-between"><span>Escalated to human</span><span className="font-medium">612</span></li>
            <li className="flex justify-between"><span>Executed under policy</span><span className="font-medium">1,284</span></li>
            <li className="flex justify-between"><span>Auto-rolled back</span><span className="font-medium">9</span></li>
          </ul>
        </Card>
        <Card title="Guardrails in force">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Change freeze windows honored (retail peak)</li>
            <li>Prod tier-1 requires two-person approval</li>
            <li>Max 5% concurrent capacity reduction per service</li>
            <li>Automatic rollback on SLO burn &gt; 2x</li>
          </ul>
        </Card>
        <Card title="Financial governance">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Savings booked only after 2 billing cycles</li>
            <li>Showback allocated to 38 cost centers</li>
            <li>Unit economics tracked per 1K transactions</li>
            <li>Quarterly true-up with Finance close</li>
          </ul>
        </Card>
      </div>

      <WorkspaceFooter fabric={defaultFabric} maturity={defaultMaturity} />
      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </WorkspaceShell>
  );
}
