import { PiggyBank, DollarSign, Percent, CalendarClock, AlertTriangle, TrendingUp, ShieldCheck, Layers } from "lucide-react";
import {
  Badge, Card, ConfidenceCell, DataTable, DetailDrawer, DonutCard, GaugeRing, Kpi, KpiStrip,
  LinkAction, Panel, ProgressRow, RiskCell, SimpleBars, Td, Th, TrendArea, useDetailDrawer,
} from "../components/primitives";
import { WorkspaceFooter, WorkspaceShell, FilterBar, defaultFabric, defaultMaturity } from "../components/bands";
import { finopsPages } from "../pages";

const page = finopsPages.find((p) => p.slug === "commitment-optimization")!;

const kpis: Kpi[] = [
  { id: "commit", icon: PiggyBank, label: "Commitment value", value: "$21.4M", sub: "Active RI + SP", tone: "blue" },
  { id: "coverage", icon: Percent, label: "Coverage", value: "74%", sub: "Target 85%", tone: "amber" },
  { id: "util", icon: Layers, label: "Utilization", value: "96.2%", sub: "Trailing 30 days", tone: "emerald" },
  { id: "save", icon: DollarSign, label: "Effective savings", value: "$4.62M", sub: "vs on-demand", tone: "teal" },
  { id: "gap", icon: TrendingUp, label: "Coverage gap value", value: "$1.58M", sub: "Annual opportunity", tone: "violet" },
  { id: "expiry", icon: CalendarClock, label: "Expiring 90 days", value: "$3.2M", sub: "18 agreements", tone: "sky" },
  { id: "waste", icon: AlertTriangle, label: "Unused commitment", value: "$184K", sub: "3.8% of spend", tone: "rose" },
  { id: "policy", icon: ShieldCheck, label: "Policy compliance", value: "100%", sub: "Finance approved", tone: "slate" },
];

const portfolio = [
  { name: "Compute Savings Plans", value: 41, display: "$8.8M" },
  { name: "EC2 Instance SP", value: 22, display: "$4.7M" },
  { name: "RDS reserved", value: 14, display: "$3.0M" },
  { name: "OpenSearch reserved", value: 9, display: "$1.9M" },
  { name: "Azure reservations", value: 8, display: "$1.7M" },
  { name: "GCP CUD", value: 6, display: "$1.3M" },
];

const rebalance = [
  { id: "C-201", action: "Purchase", instrument: "Compute SP · 3yr no-upfront", amount: "$1.20M", save: "$412K", conf: 93, risk: "Low" as const, when: "Oct 14" },
  { id: "C-202", action: "Purchase", instrument: "RDS RI · 1yr partial-upfront", amount: "$640K", save: "$188K", conf: 91, risk: "Low" as const, when: "Oct 21" },
  { id: "C-208", action: "Renew", instrument: "EC2 Instance SP (expiring)", amount: "$980K", save: "$264K", conf: 96, risk: "Very Low" as const, when: "Nov 02" },
  { id: "C-214", action: "Exchange", instrument: "m5 RI → m6i convertible", amount: "$420K", save: "$96K", conf: 88, risk: "Medium" as const, when: "Nov 09" },
  { id: "C-219", action: "Let lapse", instrument: "Legacy c5 RI (low usage)", amount: "$310K", save: "$74K", conf: 84, risk: "Medium" as const, when: "Dec 01" },
  { id: "C-226", action: "Purchase", instrument: "Azure reservation · 1yr", amount: "$280K", save: "$61K", conf: 79, risk: "Medium" as const, when: "Dec 15" },
];

const coverageTrend = [
  { label: "Apr", value: 61 }, { label: "May", value: 65 }, { label: "Jun", value: 68 },
  { label: "Jul", value: 70 }, { label: "Aug", value: 72 }, { label: "Sep", value: 74 },
];

const expiry = [
  { label: "30d", value: 820 }, { label: "60d", value: 1140 }, { label: "90d", value: 1240 },
  { label: "180d", value: 2380 }, { label: "270d", value: 1610 }, { label: "365d", value: 2950 },
];

export default function CommitmentOptimizationWorkspace() {
  const drawer = useDetailDrawer();
  return (
    <WorkspaceShell
      title={page.title}
      subtitle={page.subtitle}
      actions={<FilterBar chips={["All providers", "Compute + data", "3-year horizon", "Finance policy: on"]} />}
    >
      <KpiStrip kpis={kpis} onSelect={(k) => drawer.open({
        title: k.label, subtitle: `${k.value} — ${k.sub ?? ""}`, tone: k.tone,
        rows: [["Value", k.value], ["Baseline", "Trailing 30-day committed usage"], ["Forecast", "12-month demand model, 90% interval"], ["Policy", "Max 85% coverage of stable baseline"]],
        bullets: ["Coverage targets exclude workloads flagged for migration or decommission.", "Purchases are laddered to avoid a single large expiry cliff."],
      })} />

      <div className="grid gap-5 xl:grid-cols-[1fr_1.3fr]">
        <Panel index={1} title="Commitment portfolio overview">
          <DonutCard data={portfolio} total="$21.4M" totalLabel="Active value" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 p-3 text-center">
              <GaugeRing pct={74} label="Coverage" sub="Target 85%" tone="amber" />
            </div>
            <div className="rounded-lg border border-slate-200 p-3 text-center">
              <GaugeRing pct={96} label="Utilization" sub="Healthy" tone="emerald" />
            </div>
          </div>
        </Panel>

        <Panel index={2} title="Rebalance plan" action="Sequenced to protect flexibility">
          <DataTable head={<>
            <Th>ID</Th><Th>Action</Th><Th>Instrument</Th><Th right>Commit</Th>
            <Th right>Annual saving</Th><Th right>Confidence</Th><Th>Risk</Th><Th right>Execute</Th>
          </>}>
            {rebalance.map((r) => (
              <tr key={r.id} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({
                title: `${r.id} · ${r.action}`, subtitle: r.instrument, tone: "violet",
                rows: [["Commitment amount", r.amount], ["Annual saving", r.save], ["Confidence", `${r.conf}%`], ["Risk", r.risk], ["Scheduled", r.when], ["Break-even", "4.6 months"]],
                bullets: [
                  "Demand forecast keeps this baseline stable for 14+ months at the 90% interval.",
                  "Purchase sized to the p10 of forecast usage to avoid stranded commitment.",
                  "Laddered against existing expiries to keep quarterly renewal exposure under $1.2M.",
                ],
              })}>
                <Td className="font-medium text-slate-900">{r.id}</Td>
                <Td>
                  <Badge tone={r.action === "Purchase" ? "emerald" : r.action === "Renew" ? "blue" : r.action === "Exchange" ? "violet" : "amber"}>
                    {r.action}
                  </Badge>
                </Td>
                <Td>{r.instrument}</Td>
                <Td right>{r.amount}</Td>
                <Td right className="font-semibold text-emerald-700">{r.save}</Td>
                <ConfidenceCell pct={r.conf} right />
                <RiskCell level={r.risk} />
                <Td right><LinkAction>{r.when}</LinkAction></Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel index={3} title="Coverage trajectory" action="% of eligible spend">
          <TrendArea data={coverageTrend} yTickFormatter={(v) => `${v}%`} />
          <p className="mt-2 text-[11.5px] text-slate-500">Reaching the 85% target adds an estimated $1.58M of annual savings.</p>
        </Panel>
        <Panel index={4} title="Expiry ladder" action="$K expiring by horizon">
          <SimpleBars data={expiry} color="#6366f1" />
          <p className="mt-2 text-[11.5px] text-slate-500">No single 90-day window exceeds 15% of portfolio value.</p>
        </Panel>
        <Panel index={5} title="Commitment health">
          <div className="space-y-2.5">
            <ProgressRow label="Utilization ≥ 95%" pct={96} tone="emerald" />
            <ProgressRow label="Coverage vs target" pct={87} tone="amber" right="74/85" />
            <ProgressRow label="Flexibility retained" pct={68} tone="blue" />
            <ProgressRow label="Convertible share" pct={44} tone="teal" />
            <ProgressRow label="Stranded commitment" pct={4} tone="rose" right="$184K" />
          </div>
          <p className="mt-3 text-[11.5px] text-slate-500">
            The twin re-forecasts daily and will recommend an exchange before any commitment drops below 90% utilization.
          </p>
        </Panel>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card title="Finance policy constraints">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Maximum 85% coverage of stable baseline</li>
            <li>No-upfront preferred; partial-upfront needs CFO sign-off</li>
            <li>3-year terms limited to 40% of portfolio</li>
            <li>Quarterly expiry exposure capped at $1.2M</li>
          </ul>
        </Card>
        <Card title="Demand signals">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Checkout migration to ARM lands Q1 (-8% x86 baseline)</li>
            <li>New region build adds ~$310K/yr committed-eligible spend</li>
            <li>Batch platform consolidation reduces r-family by 12%</li>
          </ul>
        </Card>
        <Card title="Approval status">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li className="flex justify-between"><span>Approved</span><span className="font-medium">$1.84M</span></li>
            <li className="flex justify-between"><span>Pending Finance</span><span className="font-medium">$0.98M</span></li>
            <li className="flex justify-between"><span>Held for forecast</span><span className="font-medium">$0.31M</span></li>
            <li className="flex justify-between"><span>Rejected</span><span className="font-medium">$0.12M</span></li>
          </ul>
        </Card>
      </div>

      <WorkspaceFooter fabric={defaultFabric} maturity={defaultMaturity} />
      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </WorkspaceShell>
  );
}
