import { Boxes, DollarSign, Layers, Cpu, Workflow, ShieldCheck, TrendingDown, Gauge } from "lucide-react";
import {
  Badge, Card, ConfidenceCell, DataTable, DetailDrawer, DonutCard, Kpi, KpiStrip, LinkAction,
  Panel, ProgressRow, RiskCell, SimpleBars, Td, Th, useDetailDrawer,
} from "../components/primitives";
import { WorkspaceFooter, WorkspaceShell, FilterBar, defaultFabric, defaultMaturity } from "../components/bands";
import { finopsPages } from "../pages";

const page = finopsPages.find((p) => p.slug === "platform-architecture-efficiency")!;

const kpis: Kpi[] = [
  { id: "opps", icon: Workflow, label: "Architecture opportunities", value: "14", sub: "Modeled alternatives", tone: "blue" },
  { id: "save", icon: DollarSign, label: "Annual savings", value: "$614K", sub: "Risk-adjusted", tone: "emerald" },
  { id: "effort", icon: Layers, label: "Engineering effort", value: "38 wks", sub: "Aggregate estimate", tone: "amber" },
  { id: "payback", icon: TrendingDown, label: "Median payback", value: "7.4 mo", sub: "Incl. migration cost", tone: "violet" },
  { id: "arm", icon: Cpu, label: "ARM adoption", value: "34%", sub: "Target 70%", tone: "sky" },
  { id: "managed", icon: Boxes, label: "Self-managed services", value: "22", sub: "Managed alternatives exist", tone: "teal" },
  { id: "resilience", icon: ShieldCheck, label: "Resilience delta", value: "+2 tiers", sub: "Net improvement", tone: "slate" },
  { id: "conf", icon: Gauge, label: "Mean confidence", value: "68%", sub: "Design review needed", tone: "rose" },
];

const opportunities = [
  { id: "A-901", change: "x86 → Graviton for stateless APIs", scope: "62 services", save: "$186K", effort: "9 wks", payback: "5.1 mo", conf: 84, risk: "Medium" as const, perf: "+8% throughput" },
  { id: "A-904", change: "Self-managed Kafka → managed streaming", scope: "3 clusters", save: "$122K", effort: "12 wks", payback: "11.8 mo", conf: 71, risk: "High" as const, perf: "Neutral" },
  { id: "A-908", change: "Always-on batch → serverless event driven", scope: "18 jobs", save: "$96K", effort: "6 wks", payback: "4.2 mo", conf: 79, risk: "Medium" as const, perf: "+ latency variance" },
  { id: "A-912", change: "Consolidate 4 Redis fleets → 1 multi-tenant", scope: "4 fleets", save: "$74K", effort: "5 wks", payback: "6.0 mo", conf: 76, risk: "Medium" as const, perf: "Neutral" },
  { id: "A-917", change: "Retire legacy ESB, route via API gateway", scope: "1 platform", save: "$68K", effort: "4 wks", payback: "3.4 mo", conf: 88, risk: "Low" as const, perf: "-12ms p95" },
  { id: "A-923", change: "Monolith read path → read replicas + cache", scope: "1 service", save: "$68K", effort: "2 wks", payback: "2.1 mo", conf: 62, risk: "High" as const, perf: "+ cache coherence risk" },
];

const costMix = [
  { name: "Compute platform", value: 38, display: "$4.9M" },
  { name: "Managed data services", value: 22, display: "$2.8M" },
  { name: "Streaming & messaging", value: 14, display: "$1.8M" },
  { name: "Caching layer", value: 10, display: "$1.3M" },
  { name: "Integration platform", value: 9, display: "$1.2M" },
  { name: "Observability", value: 7, display: "$0.9M" },
];

const tradeoff = [
  { label: "Cost", value: 86 }, { label: "Performance", value: 74 }, { label: "Resilience", value: 68 },
  { label: "Ops effort", value: 52 }, { label: "Delivery risk", value: 41 },
];

export default function PlatformArchitectureEfficiencyWorkspace() {
  const drawer = useDetailDrawer();
  return (
    <WorkspaceShell
      title={page.title}
      subtitle={page.subtitle}
      actions={<FilterBar chips={["All platforms", "Payback ≤ 12 months", "Include resilience delta", "Architecture board view"]} />}
    >
      <KpiStrip kpis={kpis} onSelect={(k) => drawer.open({
        title: k.label, subtitle: `${k.value} — ${k.sub ?? ""}`, tone: k.tone,
        rows: [["Value", k.value], ["Evaluation", "Cost, performance, resilience, ops effort"], ["Review", "Architecture board, biweekly"], ["Horizon", "12–18 months"]],
        bullets: ["Architecture changes are scored on five weighted dimensions, not cost alone.", "Confidence stays below 90% until a proof of concept validates the model."],
      })} />

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Panel index={1} title="Architectural improvement opportunities" action="Ranked by risk-adjusted value">
          <DataTable head={<>
            <Th>ID</Th><Th>Proposed change</Th><Th>Scope</Th><Th right>Annual saving</Th>
            <Th right>Effort</Th><Th right>Payback</Th><Th right>Confidence</Th><Th>Risk</Th>
          </>}>
            {opportunities.map((o) => (
              <tr key={o.id} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({
                title: `${o.id} · ${o.change}`, subtitle: `${o.scope} · payback ${o.payback}`, tone: "violet",
                rows: [["Annual saving", o.save], ["Engineering effort", o.effort], ["Payback", o.payback], ["Performance impact", o.perf], ["Confidence", `${o.conf}%`], ["Risk", o.risk]],
                bullets: [
                  "Cost model built from current unit economics plus vendor list pricing.",
                  "Resilience scored against the current failure domain map and RTO targets.",
                  "Requires architecture board approval and a proof of concept before funding.",
                ],
              })}>
                <Td className="font-medium text-slate-900">{o.id}</Td>
                <Td>{o.change}</Td>
                <Td className="text-slate-500">{o.scope}</Td>
                <Td right className="font-semibold text-emerald-700">{o.save}</Td>
                <Td right>{o.effort}</Td>
                <Td right>{o.payback}</Td>
                <ConfidenceCell pct={o.conf} right />
                <RiskCell level={o.risk} />
              </tr>
            ))}
          </DataTable>
        </Panel>

        <Panel index={2} title="Current cost breakdown" action="Platform spend today">
          <DonutCard data={costMix} total="$12.9M" totalLabel="Platform spend" />
          <div className="mt-4 space-y-2.5">
            <ProgressRow label="ARM / Graviton adoption" pct={34} tone="amber" />
            <ProgressRow label="Managed vs self-managed" pct={58} tone="blue" />
            <ProgressRow label="Serverless eligible workloads" pct={27} tone="teal" />
            <ProgressRow label="Multi-tenant consolidation" pct={46} tone="violet" />
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel index={3} title="Decision tradeoff profile" action="Weighted score, portfolio average">
          <SimpleBars data={tradeoff} color="#6366f1" />
          <p className="mt-2 text-[11.5px] text-slate-500">
            Higher is better for cost, performance, and resilience; lower is better for ops effort and delivery risk.
          </p>
        </Panel>
        <Card title="Architecture board queue">
          <ul className="space-y-2 text-[12.5px] text-slate-700">
            <li className="flex items-center justify-between"><span>A-901 Graviton migration</span><Badge tone="emerald">Approved</Badge></li>
            <li className="flex items-center justify-between"><span>A-917 ESB retirement</span><Badge tone="emerald">Approved</Badge></li>
            <li className="flex items-center justify-between"><span>A-908 Serverless batch</span><Badge tone="blue">PoC running</Badge></li>
            <li className="flex items-center justify-between"><span>A-904 Managed streaming</span><Badge tone="amber">Design review</Badge></li>
            <li className="flex items-center justify-between"><span>A-923 Read path rework</span><Badge tone="rose">Deferred</Badge></li>
          </ul>
        </Card>
        <Card title="Non-financial outcomes">
          <ul className="space-y-1.5 text-[12.5px] text-slate-700">
            <li>Two failure domains removed from the checkout path</li>
            <li>Estimated 640 ops hours per year returned to teams</li>
            <li>Carbon intensity down 18% via ARM and consolidation</li>
            <li>Vendor concentration risk reduced in streaming tier</li>
          </ul>
        </Card>
      </div>

      <WorkspaceFooter fabric={defaultFabric} maturity={defaultMaturity} />
      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </WorkspaceShell>
  );
}
