import {
  Network, Upload, Shuffle, Globe2, Router, Zap, Target, Activity, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FinOpsHeader from "../components/FinOpsHeader";
import PageBands, { lifecycleWithActive } from "../components/PageBands";
import AgentGrid, { type AgentChip } from "../components/AgentGrid";
import {
  Panel, Badge, KpiStrip, DataTable, Th, Td, DonutCard, DetailDrawer, ConfidenceCell,
  useDetailDrawer, CostDriverBars, Spark, toneMap, type Kpi,
} from "../components/primitives";

const kpis: Kpi[] = [
  { id: "spend", icon: Network, label: "Total Network Spend", value: "$2.87M", sub: "annualized", tone: "blue" },
  { id: "egress", icon: Upload, label: "Data Egress", value: "89.4 TB", sub: "per month", tone: "sky" },
  { id: "az", icon: Shuffle, label: "Cross-AZ Traffic", value: "24.6 TB", sub: "per month", tone: "violet" },
  { id: "region", icon: Globe2, label: "Cross-Region", value: "12.2 TB", sub: "per month", tone: "teal" },
  { id: "nat", icon: Router, label: "NAT Gateway Spend", value: "$296K", sub: "annualized", tone: "amber" },
  { id: "cf", icon: Zap, label: "CloudFront Savings", value: "$184K", sub: "already realized", tone: "emerald" },
  { id: "opps", icon: Target, label: "Optimization Opportunities", value: "43", sub: "$438K/mo potential", tone: "rose" },
  { id: "health", icon: Activity, label: "Optimization Health", value: "Good", sub: "egress trending down", tone: "emerald" },
];

const flows: [string, string, string, string, string, string, number][] = [
  ["prod-commerce (us-east-1)", "Internet (consumer traffic)", "Internet egress", "31,400 GB", "$2,826/mo", "22.4%", 97],
  ["prod-analytics (us-east-1)", "prod-data-lake (us-west-2)", "Cross-region", "8,900 GB", "$1,780/mo", "14.1%", 94],
  ["payments-api (az-1a)", "fraud-service (az-1c)", "Cross-AZ", "11,200 GB", "$1,120/mo", "8.9%", 96],
  ["eks-prod-nodes", "S3 (no VPC endpoint)", "NAT gateway", "9,600 GB", "$1,392/mo", "11.0%", 98],
  ["prod-commerce", "on-prem datacenter", "Cloud to on-prem", "6,200 GB", "$1,054/mo", "8.4%", 91],
  ["media-service", "Internet (asset delivery)", "Internet egress", "14,800 GB", "$1,332/mo", "10.6%", 89],
  ["log-shippers (all AZs)", "observability SaaS", "Internet egress", "7,300 GB", "$657/mo", "5.2%", 93],
  ["backup-agent", "cross-region vault", "Cross-region", "4,100 GB", "$820/mo", "6.5%", 88],
  ["ci-runners", "container registry", "NAT gateway", "3,900 GB", "$566/mo", "4.5%", 92],
  ["api-gateway", "partner integrations", "Internet egress", "2,600 GB", "$234/mo", "1.9%", 84],
];

const byType = [
  { name: "Internet egress", value: 38, display: "$1.09M" },
  { name: "Cross-AZ", value: 19, display: "$545K" },
  { name: "Cross-region", value: 16, display: "$459K" },
  { name: "NAT gateway", value: 14, display: "$402K" },
  { name: "Cloud to on-prem", value: 9, display: "$258K" },
  { name: "Other", value: 4, display: "$115K" },
];

const geoFlows = [
  { from: [22, 42], to: [46, 38], vol: "50+ TB", color: "#ef4444" },
  { from: [22, 42], to: [72, 46], vol: "10–50 TB", color: "#f59e0b" },
  { from: [22, 42], to: [18, 66], vol: "1–10 TB", color: "#3b82f6" },
  { from: [46, 38], to: [78, 60], vol: "1–10 TB", color: "#3b82f6" },
  { from: [22, 42], to: [30, 30], vol: "< 1 TB", color: "#94a3b8" },
];

const recommendations = [
  ["Deploy S3 and DynamoDB VPC endpoints", "$116K/mo"],
  ["Co-locate fraud service with payments in az-1a", "$93K/mo"],
  ["Front media delivery with CloudFront", "$88K/mo"],
  ["Compress and batch analytics replication", "$71K/mo"],
  ["Consolidate log shipping through a regional collector", "$44K/mo"],
  ["Retire the legacy NAT gateway in the decommissioned VPC", "$26K/mo"],
];

const opportunities: [string, string, string, string, string, number][] = [
  ["VPC endpoints for S3 / DynamoDB", "Architecture", "$1.39M", "Low", "Very Low", 98],
  ["AZ co-location of chatty services", "Placement", "$1.12M", "Medium", "Low", 94],
  ["CloudFront in front of media assets", "Caching", "$1.06M", "Low", "Low", 92],
  ["Analytics replication compression", "Data movement", "$852K", "Medium", "Low", 89],
  ["Regional log collector", "Observability", "$528K", "Low", "Low", 93],
  ["Retire legacy NAT gateway", "Cleanup", "$312K", "Low", "Very Low", 97],
  ["Direct Connect for on-prem sync", "Connectivity", "$284K", "High", "Medium", 81],
];

const insights = [
  "62% of NAT gateway cost is S3 traffic that should never leave the VPC.",
  "Cross-AZ chatter between payments and fraud scoring accounts for 8.9% of all network spend.",
  "Media asset delivery has a 38% cache-miss rate because objects lack cache-control headers.",
  "Analytics replication sends uncompressed Parquet across regions every 15 minutes.",
  "Nine services ship logs directly to a SaaS endpoint instead of a regional collector.",
];

const costDrivers = [
  { name: "Internet egress", value: 1090, display: "$1.09M" },
  { name: "Cross-AZ transfer", value: 545, display: "$545K" },
  { name: "Cross-region transfer", value: 459, display: "$459K" },
  { name: "NAT gateway processing", value: 402, display: "$402K" },
  { name: "Hybrid connectivity", value: 258, display: "$258K" },
  { name: "Load balancer LCU", value: 115, display: "$115K" },
];

const gauges = [
  { label: "NAT gateway utilization", pct: 28, tone: "rose" as const },
  { label: "CloudFront cache hit", pct: 62, tone: "amber" as const },
  { label: "Cross-AZ efficiency", pct: 71, tone: "amber" as const },
  { label: "VPC endpoint coverage", pct: 18, tone: "rose" as const },
];

const sankeySources = [
  { name: "prod-commerce", pct: 34, color: "#6366f1" },
  { name: "prod-analytics", pct: 24, color: "#3b82f6" },
  { name: "payments", pct: 18, color: "#f59e0b" },
  { name: "media-service", pct: 14, color: "#10b981" },
  { name: "platform", pct: 10, color: "#a855f7" },
];
const sankeyTypes = [
  { name: "Internet egress", pct: 38, color: "#6366f1" },
  { name: "Cross-AZ", pct: 19, color: "#3b82f6" },
  { name: "Cross-region", pct: 16, color: "#f59e0b" },
  { name: "NAT gateway", pct: 14, color: "#10b981" },
  { name: "Hybrid", pct: 13, color: "#a855f7" },
];
const sankeyDest = [
  { name: "Consumers", pct: 40, color: "#6366f1" },
  { name: "Other regions", pct: 22, color: "#3b82f6" },
  { name: "Other AZs", pct: 19, color: "#f59e0b" },
  { name: "SaaS endpoints", pct: 11, color: "#10b981" },
  { name: "On-prem", pct: 8, color: "#a855f7" },
];

const agents: AgentChip[] = [
  { name: "Flow Telemetry Agent", status: "Complete", confidence: 97, finding: "VPC flow logs correlated to services" },
  { name: "Topology Agent", status: "Complete", confidence: 94, finding: "AZ placement mapped for 184 services" },
  { name: "Egress Agent", status: "Complete", confidence: 96, finding: "89.4 TB monthly egress attributed" },
  { name: "Caching Agent", status: "Complete", confidence: 91, finding: "38% avoidable cache misses" },
  { name: "Cost Agent", status: "Complete", confidence: 98, finding: "Per-flow unit cost modeled" },
  { name: "Decision Agent", status: "Ready", confidence: 93, finding: "43 ranked opportunities" },
];

const phases: [string, string, string, string][] = [
  ["Phase 1", "Deploy VPC endpoints and retire the legacy NAT gateway", "2 weeks", "$142K/mo"],
  ["Phase 2", "Front media and static assets with CloudFront", "3 weeks", "$88K/mo"],
  ["Phase 3", "Co-locate chatty service pairs within an AZ", "6 weeks", "$93K/mo"],
  ["Phase 4", "Compress and batch cross-region replication", "4 weeks", "$71K/mo"],
  ["Phase 5", "Consolidate observability egress", "2 weeks", "$44K/mo"],
];

function arc(from: number[], to: number[]) {
  const [x1, y1] = from; const [x2, y2] = to;
  const cx = (x1 + x2) / 2; const cy = Math.min(y1, y2) - 14;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

export default function NetworkDataMovementWorkspace() {
  const drawer = useDetailDrawer();

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-6 py-6">
      <FinOpsHeader
        title="Network & Data Movement Workspace"
        tagline="Identify and optimize inefficient traffic flows, egress costs, cross-region movement, and networking resources."
        secondaryActions={[{ label: "Export Flow Analysis", icon: "export" }, { label: "Traffic Simulator", icon: "simulate" }]}
        meta={{ lastAnalysis: "19 minutes ago", freshness: "97.2% within SLA", resources: "126 TB monthly traffic analyzed" }}
        onPrimary={() => drawer.open({ title: "Network analysis run", tone: "blue", rows: [["Flows analyzed", "18,904"], ["Opportunities", "43"], ["Potential savings", "$438K/mo"]] })}
        onSecondary={(l) => drawer.open({ title: l, tone: "slate", bullets: ["Synthetic demonstration action."] })}
      />

      <KpiStrip kpis={kpis} onSelect={(k) => drawer.open({ title: k.label, subtitle: k.sub, tone: k.tone, rows: [["Value", k.value]] })} />

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* 1 */}
        <Panel index={1} title="Top costly traffic flows">
          <DataTable head={<>
            <Th>Source</Th><Th>Destination</Th><Th>Traffic type</Th><Th right>Data (GB)</Th><Th right>Cost</Th><Th right>% of network</Th><Th right>Confidence</Th>
          </>}>
            {flows.map(([src, dst, type, gb, cost, pct, conf]) => (
              <tr key={`${src}-${dst}`} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({ title: `${src} → ${dst}`, subtitle: type, tone: "blue", rows: [["Volume", gb], ["Monthly cost", cost], ["Share of network", pct], ["Confidence", `${conf}%`]] })}>
                <Td className="font-medium text-slate-900">{src}</Td><Td>{dst}</Td><Td>{type}</Td>
                <Td right>{gb}</Td><Td right className="font-semibold text-slate-900">{cost}</Td><Td right>{pct}</Td>
                <ConfidenceCell pct={conf} right />
              </tr>
            ))}
          </DataTable>
        </Panel>

        {/* 2 */}
        <Panel index={2} title="Traffic by type">
          <DonutCard total="$2.87M" totalLabel="Annual network spend" data={byType} />
        </Panel>
      </div>

      {/* 3 */}
      <Panel index={3} title="Geographic traffic map">
        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <svg viewBox="0 0 100 62" className="h-[260px] w-full" role="img" aria-label="Global traffic flow map">
              <rect width="100" height="62" fill="#f8fafc" />
              {[
                "M8,18 L22,14 L34,18 L32,30 L24,44 L16,38 L10,28 Z",
                "M26,46 L33,44 L36,56 L29,58 Z",
                "M44,12 L56,10 L58,20 L50,26 L44,20 Z",
                "M46,28 L58,26 L60,44 L50,52 L44,38 Z",
                "M62,12 L86,10 L92,22 L80,34 L66,28 L60,18 Z",
                "M80,44 L90,42 L92,52 L82,54 Z",
              ].map((d, i) => <path key={i} d={d} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.3" />)}
              {geoFlows.map((f, i) => (
                <g key={i}>
                  <path d={arc(f.from, f.to)} fill="none" stroke={f.color} strokeWidth="0.7" strokeLinecap="round" opacity={0.85} />
                  <circle cx={f.from[0]} cy={f.from[1]} r="1.1" fill={f.color} />
                  <circle cx={f.to[0]} cy={f.to[1]} r="1.1" fill={f.color} />
                </g>
              ))}
            </svg>
            <div className="flex flex-wrap items-center gap-3 px-2 pb-1 pt-2">
              {[["< 1 TB", "#94a3b8"], ["1–10 TB", "#3b82f6"], ["10–50 TB", "#f59e0b"], ["50+ TB", "#ef4444"]].map(([l, c]) => (
                <span key={l} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span className="h-1.5 w-4 rounded-full" style={{ background: c }} />{l}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Primary recommendations</div>
            <ul className="mt-2 space-y-1.5">
              {recommendations.map(([r, v]) => (
                <li key={r} className="flex items-start justify-between gap-2 border-b border-emerald-100 pb-1.5 text-[11.5px] text-slate-700">
                  <span>{r}</span><span className="shrink-0 font-semibold text-emerald-700">{v}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total potential savings</span>
              <span className="text-xl font-bold text-emerald-700">$438K/mo</span>
            </div>
          </div>
        </div>
      </Panel>

      {/* 4 */}
      <Panel index={4} title="Optimization opportunities">
        <DataTable head={<><Th>Opportunity</Th><Th>Type</Th><Th right>Annual savings</Th><Th right>Effort</Th><Th right>Risk</Th><Th right>Confidence</Th><Th right>Review</Th></>}>
          {opportunities.map(([o, t, s, e, r, c]) => (
            <tr key={o} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-900">{o}</Td><Td>{t}</Td>
              <Td right className="font-semibold text-emerald-700">{s}</Td>
              <Td right><Badge tone={e === "High" ? "rose" : e === "Medium" ? "amber" : "emerald"}>{e}</Badge></Td>
              <Td right><Badge tone={r === "Medium" ? "amber" : "emerald"}>{r}</Badge></Td>
              <ConfidenceCell pct={c} right />
              <Td right>
                <button type="button" onClick={() => drawer.open({ title: o, tone: "blue", rows: [["Type", t], ["Annual savings", s], ["Effort", e], ["Risk", r], ["Confidence", `${c}%`]] })}
                  className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-700">Review</button>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-3">
        {/* 5 */}
        <Panel index={5} title="Data flow insights">
          <ul className="space-y-1.5">
            {insights.map((i) => (
              <li key={i} className="flex gap-2 text-[12px] text-slate-700">
                <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />{i}
              </li>
            ))}
          </ul>
        </Panel>

        {/* 6 */}
        <Panel index={6} title="Cost drivers">
          <CostDriverBars data={costDrivers} />
        </Panel>

        {/* 7 */}
        <Panel index={7} title="Utilization & efficiency">
          <div className="grid grid-cols-2 gap-3">
            {gauges.map((g) => {
              const t = toneMap[g.tone];
              return (
                <div key={g.label} className={cn("rounded-lg border p-2.5", t.bg, t.border)}>
                  <div className="text-[10.5px] uppercase tracking-wide text-slate-500">{g.label}</div>
                  <div className={cn("text-2xl font-bold", t.text)}>{g.pct}%</div>
                  <Spark data={Array.from({ length: 14 }, (_, i) => ({ x: i, y: g.pct + ((i * 7) % 9) - 4 }))} color={g.tone === "rose" ? "#ef4444" : "#f59e0b"} height={28} />
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* 8 */}
      <Panel index={8} title="Traffic flow visualization">
        <div className="grid gap-4 md:grid-cols-3">
          {[["Sources", sankeySources], ["Traffic types", sankeyTypes], ["Destinations", sankeyDest]].map(([label, items]) => (
            <div key={label as string}>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label as string}</div>
              <div className="mt-2 space-y-1.5">
                {(items as typeof sankeySources).map((s) => (
                  <div key={s.name} className="grid grid-cols-[130px_1fr_40px] items-center gap-2">
                    <span className="truncate text-[11.5px] text-slate-600">{s.name}</span>
                    <span className="h-4 rounded bg-slate-100">
                      <span className="block h-4 rounded" style={{ width: `${s.pct * 2.4}%`, background: s.color, opacity: 0.85 }} />
                    </span>
                    <span className="text-right text-[11px] font-medium tabular-nums text-slate-700">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] text-slate-500">
          Band width represents share of monthly transferred volume. Sources feed traffic types, which resolve to destination classes.
        </p>
      </Panel>

      {/* 9 */}
      <Panel index={9} title="Digital twin investigation">
        <AgentGrid agents={agents} columns="md:grid-cols-3 xl:grid-cols-6"
          engineNote="18,904 flows correlated across VPC flow logs, service maps, and billing records"
          onSelect={(a) => drawer.open({ title: a.name, subtitle: a.finding, tone: "violet", rows: [["Status", a.status], ["Confidence", `${a.confidence}%`]] })} />
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Investigation summary</div>
            <ul className="mt-1 space-y-1">
              {["Every high-cost flow traced to an owning service and team", "No traffic pattern requires an application rewrite to optimize", "Top three actions deliver 68% of the total opportunity", "No customer-facing latency regression expected"].map((x) => (
                <li key={x} className="flex gap-1.5 text-[11.5px] text-slate-700"><CheckCircle2 className="mt-[2px] h-3 w-3 shrink-0 text-emerald-500" />{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Top recommendations</div>
            <ol className="mt-1 space-y-1">
              {recommendations.slice(0, 4).map(([r, v], i) => (
                <li key={r} className="flex items-start justify-between gap-2 text-[11.5px] text-slate-700">
                  <span>{i + 1}. {r}</span><span className="shrink-0 font-semibold text-emerald-700">{v}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        {/* 10 */}
        <Panel index={10} title="Execution plan">
          <DataTable head={<><Th>Phase</Th><Th>Action</Th><Th right>Duration</Th><Th right>Savings</Th></>}>
            {phases.map(([p, a, d, s]) => (
              <tr key={p} className="hover:bg-slate-50">
                <Td className="font-semibold text-slate-900">{p}</Td><Td>{a}</Td><Td right>{d}</Td>
                <Td right className="font-semibold text-emerald-700">{s}</Td>
              </tr>
            ))}
          </DataTable>
        </Panel>

        {/* 11 */}
        <Panel index={11} title="Policy & guardrails">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Active policies enforced</div>
          <ul className="mt-1 space-y-1">
            {["NET-01 · VPC endpoints required for all AWS service traffic", "NET-04 · Cross-region replication must be compressed", "NET-07 · Public egress must traverse a CDN", "NET-09 · No new NAT gateway without FinOps review"].map((p) => (
              <li key={p} className="flex gap-1.5 text-[11.5px] text-slate-700"><CheckCircle2 className="mt-[2px] h-3 w-3 shrink-0 text-emerald-500" />{p}</li>
            ))}
          </ul>
          <div className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Guardrails</div>
          <ul className="mt-1 space-y-1">
            {["No change to security group or firewall posture", "Blue/green cutover for any endpoint change", "Latency budget monitored during every change window", "Automatic rollback if error rate exceeds 0.1%"].map((g) => (
              <li key={g} className="flex gap-1.5 text-[11.5px] text-slate-700"><span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />{g}</li>
            ))}
          </ul>
        </Panel>
      </div>

      <PageBands lifecycle={lifecycleWithActive("Contextualize")} />

      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </div>
  );
}
