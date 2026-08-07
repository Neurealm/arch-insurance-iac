import { useState } from "react";
import {
  Container, Gauge, Trash2, Scaling, Layers, HardDrive, Target, Activity, CheckCircle2,
} from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import FinOpsHeader from "../components/FinOpsHeader";
import PageBands, { lifecycleWithActive } from "../components/PageBands";
import SavingsFunnel from "../components/SavingsFunnel";
import {
  Panel, Badge, KpiStrip, DataTable, Th, Td, DonutCard, DetailDrawer, ConfidenceCell,
  useDetailDrawer, CostDriverBars, Spark, GaugeRing, ProgressRow, type Kpi,
  ViewModeToggle, FullOnly, execKpis, type ViewMode,
} from "../components/primitives";
import { DomainContextBar } from "../components/bands";

const kpis: Kpi[] = [
  { id: "spend", icon: Container, label: "Total K8s Spend", value: "$1.75M", sub: "annualized", tone: "blue" },
  { id: "eff", icon: Gauge, label: "Cluster Efficiency", value: "59%", sub: "target 75%", tone: "amber" },
  { id: "waste", icon: Trash2, label: "Waste Identified", value: "$1.28M", sub: "73% of spend", tone: "rose" },
  { id: "rs", icon: Scaling, label: "Rightsizing Savings", value: "$842K", sub: "requests & limits", tone: "emerald" },
  { id: "clu", icon: Layers, label: "Cluster Optimization Savings", value: "$284K", sub: "node groups & bin-packing", tone: "teal" },
  { id: "pv", icon: HardDrive, label: "Unused Persistent Storage", value: "2.1 TB", sub: "184 orphaned PVs", tone: "violet" },
  { id: "opps", icon: Target, label: "Optimization Opportunities", value: "217", sub: "ranked by value", tone: "sky" },
  { id: "health", icon: Activity, label: "Optimization Health", value: "Good", sub: "efficiency improving", tone: "emerald" },
];

const clusters: [string, number, string, string, string, string, number[]][] = [
  ["prod-commerce", 96, "62%", "58%", "61%", "$41,800/mo", [52, 55, 58, 57, 60, 61, 61]],
  ["prod-payments", 74, "68%", "64%", "66%", "$34,200/mo", [58, 60, 62, 63, 65, 66, 66]],
  ["prod-marketing", 52, "41%", "38%", "44%", "$21,600/mo", [48, 46, 44, 43, 44, 44, 44]],
  ["prod-analytics", 48, "54%", "71%", "58%", "$28,300/mo", [50, 52, 55, 56, 57, 58, 58]],
];

const spendMix = [
  { name: "Compute nodes", value: 62, display: "$1.09M" },
  { name: "EBS / persistent storage", value: 14, display: "$245K" },
  { name: "Load balancers", value: 9, display: "$158K" },
  { name: "NAT gateway & data transfer", value: 8, display: "$140K" },
  { name: "K8s control plane", value: 4, display: "$70K" },
  { name: "Other", value: 3, display: "$53K" },
];

const utilTabs = ["CPU", "Memory", "Pods", "Storage", "Network"] as const;
const utilSeries: Record<(typeof utilTabs)[number], { label: string; actual: number; requested: number; limit: number }[]> =
  Object.fromEntries(utilTabs.map((t) => [
    t,
    Array.from({ length: 14 }, (_, i) => {
      const base = { CPU: 34, Memory: 46, Pods: 58, Storage: 41, Network: 29 }[t];
      return {
        label: `D${i + 1}`,
        actual: base + ((i * 5) % 11) - 4,
        requested: base + 26,
        limit: base + 44,
      };
    }),
  ])) as Record<(typeof utilTabs)[number], { label: string; actual: number; requested: number; limit: number }[]>;

const topOpportunities: [string, string, string, number][] = [
  ["Reduce over-provisioned CPU requests", "1,284 workloads", "$412K", 96],
  ["Reduce over-provisioned memory requests", "982 workloads", "$268K", 94],
  ["Consolidate under-packed node groups", "8 node groups", "$184K", 91],
  ["Move stateless workloads to Spot", "412 pods", "$162K", 84],
  ["Delete orphaned persistent volumes", "184 PVs", "$96K", 98],
  ["Adopt Graviton node groups", "3 clusters", "$88K", 89],
  ["Remove idle namespaces", "22 namespaces", "$68K", 93],
];

const namespaceRows: [string, string, string, string, string][] = [
  ["commerce-api", "3.2 vCPU → 1.4 vCPU", "12 GiB → 6 GiB", "$8,400/mo", "96%"],
  ["payments-core", "4.0 vCPU → 2.2 vCPU", "16 GiB → 10 GiB", "$7,100/mo", "94%"],
  ["search-index", "2.6 vCPU → 1.1 vCPU", "10 GiB → 5 GiB", "$5,300/mo", "92%"],
  ["marketing-web", "1.8 vCPU → 0.6 vCPU", "6 GiB → 2 GiB", "$4,600/mo", "97%"],
  ["analytics-jobs", "6.0 vCPU → 4.2 vCPU", "24 GiB → 18 GiB", "$3,900/mo", "86%"],
  ["notification-svc", "1.2 vCPU → 0.4 vCPU", "4 GiB → 1.5 GiB", "$2,800/mo", "95%"],
];

const nodeGroups: [string, string, string, string, string][] = [
  ["prod-commerce/general", "m5.4xlarge × 32", "m7g.2xlarge × 38", "41% → 68%", "$96K"],
  ["prod-payments/general", "c5.4xlarge × 24", "c7g.2xlarge × 28", "44% → 71%", "$78K"],
  ["prod-analytics/spark", "r5.8xlarge × 12", "r6g.4xlarge × 18", "38% → 64%", "$62K"],
  ["prod-marketing/web", "m5.2xlarge × 18", "m7g.large × 22", "29% → 66%", "$48K"],
];

const costDrivers = [
  { name: "Over-provisioned requests", value: 680, display: "$680K" },
  { name: "Under-packed nodes", value: 284, display: "$284K" },
  { name: "Idle namespaces", value: 132, display: "$132K" },
  { name: "Orphaned volumes", value: 96, display: "$96K" },
  { name: "On-demand vs spot gap", value: 88, display: "$88K" },
];

const efficiencyParts = [
  ["CPU packing efficiency", 54],
  ["Memory packing efficiency", 61],
  ["Request accuracy", 48],
  ["Node utilization", 63],
  ["Workload density", 69],
] as const;

const storageClasses: [string, string, string, string][] = [
  ["gp3-default", "412 PVs", "1.4 TB unused", "$58K/yr"],
  ["gp2-legacy", "186 PVs", "0.5 TB unused", "$24K/yr"],
  ["io2-high-perf", "38 PVs", "0.2 TB unused", "$14K/yr"],
];

const findings = [
  "Requests are set at historical peak rather than observed p95, wasting 37% of reserved CPU.",
  "Four node groups run below 45% packing efficiency due to oversized instance types.",
  "184 persistent volumes remain after their owning namespaces were deleted.",
  "Marketing cluster has the lowest efficiency and the clearest consolidation path.",
  "Graviton node groups deliver a 22% price/performance gain on all four clusters.",
];

const executionPlan: [string, string, string, string][] = [
  ["1", "Apply VPA recommendations in recommend-only mode", "5 days", "Automated"],
  ["2", "Roll out right-sized requests to non-prod namespaces", "1 week", "Automated"],
  ["3", "Roll out right-sized requests to production namespaces", "2 weeks", "Gated"],
  ["4", "Introduce Graviton node groups alongside existing pools", "2 weeks", "Automated"],
  ["5", "Drain and retire over-sized node groups", "1 week", "Gated"],
  ["6", "Delete orphaned persistent volumes after snapshot", "3 days", "Automated"],
  ["7", "Verify cluster cost against the billing ledger", "30 days", "Automated"],
];

export default function KubernetesEconomicsWorkspace() {
  const drawer = useDetailDrawer();
  const [tab, setTab] = useState<(typeof utilTabs)[number]>("CPU");
  const [mode, setMode] = useState<ViewMode>("exec");

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-6 py-6">
      <FinOpsHeader
        title="Kubernetes Economics Workspace"
        tagline="Recover $1.28M of Kubernetes waste while protecting reliability."
        secondaryActions={[{ label: "Export Rightsizing Manifest", icon: "export" }, { label: "Cluster Simulator", icon: "simulate" }]}
        meta={{ lastAnalysis: "9 minutes ago", freshness: "99.3% within SLA", resources: "4 clusters · 2,634 pods analyzed" }}
        onPrimary={() => drawer.open({ title: "Kubernetes analysis run", tone: "blue", rows: [["Clusters", "4"], ["Pods", "2,634"], ["Opportunities", "217"], ["Waste identified", "$1.28M"]] })}
        onSecondary={(l) => drawer.open({ title: l, tone: "slate", bullets: ["Synthetic demonstration action."] })}
        extra={<span className="ml-auto"><ViewModeToggle mode={mode} onChange={setMode} /></span>}
      />

      <DomainContextBar headline="Opportunity in this domain: $0.7M · Confidence 92% · Risk Low" nextSlug="governance-realization" nextLabel="Governance & Realization" />

      <KpiStrip kpis={execKpis(kpis, mode)} onSelect={(k) => drawer.open({ title: k.label, subtitle: k.sub, tone: k.tone, rows: [["Value", k.value]] })} />

      <div className={mode === "exec" ? "grid gap-5" : "grid gap-5 xl:grid-cols-[1.5fr_1fr]"}>
        {/* 1 */}
        <Panel index={1} title="Cluster overview">
          <DataTable head={<>
            <Th>Cluster</Th><Th right>Nodes</Th><Th right>CPU util</Th><Th right>Mem util</Th><Th right>Efficiency</Th><Th right>Monthly cost</Th><Th right>Trend</Th>
          </>}>
            {clusters.map(([name, nodes, cpu, mem, eff, cost, trend]) => (
              <tr key={name} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({ title: name, tone: "blue", rows: [["Nodes", String(nodes)], ["CPU utilization", cpu], ["Memory utilization", mem], ["Efficiency", eff], ["Monthly cost", cost]] })}>
                <Td className="font-medium text-slate-900">{name}</Td>
                <Td right>{nodes}</Td><Td right>{cpu}</Td><Td right>{mem}</Td>
                <Td right><span className={cn("font-semibold", parseInt(eff) >= 60 ? "text-emerald-700" : "text-amber-700")}>{eff}</span></Td>
                <Td right>{cost}</Td>
                <Td right><div className="w-24"><Spark data={trend.map((y, x) => ({ x, y }))} color="#6366f1" height={26} /></div></Td>
              </tr>
            ))}
          </DataTable>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            {[["Nodes", "270"], ["CPU", "6,480 vCPU"], ["Memory", "24.1 TiB"], ["Pods", "2,634"]].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">{l}</div>
                <div className="text-lg font-bold text-slate-900">{v}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* 2 */}
        <FullOnly mode={mode}>
        <Panel index={2} title="Kubernetes spend breakdown">
          <DonutCard total="$1.75M" totalLabel="Annual K8s spend" data={spendMix} />
        </Panel>
        </FullOnly>
      </div>

      {/* 3 */}
      <FullOnly mode={mode}>
      <Panel index={3} title="Resource utilization trends" action={<span>Actual vs requested vs limit</span>}>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {utilTabs.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={cn("rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                tab === t ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300")}>
              {t}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={utilSeries[tab]} margin={{ top: 8, right: 10, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="actual" name="Average actual" stroke="#6366f1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="requested" name="Requested" stroke="#f59e0b" strokeWidth={1.6} strokeDasharray="4 3" dot={false} />
            <Line type="monotone" dataKey="limit" name="Limit" stroke="#ef4444" strokeWidth={1.6} strokeDasharray="2 3" dot={false} />
            <ReferenceLine y={75} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Target efficiency", fontSize: 10, fill: "#10b981", position: "insideTopRight" }} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
      </FullOnly>

      <div className={mode === "exec" ? "grid gap-5" : "grid gap-5 xl:grid-cols-[1fr_1.3fr]"}>
        {/* 4 */}
        <Panel index={4} title="Top optimization opportunities">
          <DataTable head={<><Th>Opportunity type</Th><Th right>Count</Th><Th right>Annual savings</Th><Th right>Confidence</Th></>}>
            {topOpportunities.map(([o, c, s, conf]) => (
              <tr key={o} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">{o}</Td><Td right>{c}</Td>
                <Td right className="font-semibold text-emerald-700">{s}</Td>
                <ConfidenceCell pct={conf} right />
              </tr>
            ))}
          </DataTable>
        </Panel>

        {/* 5 */}
        <FullOnly mode={mode}>
        <Panel index={5} title="Workload rightsizing summary">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[["CPU requests over-provisioned", "37%"], ["CPU limits over-provisioned", "49%"], ["Memory requests over-provisioned", "31%"], ["Memory limits over-provisioned", "46%"]].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">{l}</div>
                <div className="text-2xl font-bold text-amber-700">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <DataTable head={<><Th>Namespace</Th><Th>CPU request change</Th><Th>Memory request change</Th><Th right>Savings</Th><Th right>Confidence</Th></>}>
              {namespaceRows.map(([ns, cpu, mem, save, conf]) => (
                <tr key={ns} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-900">{ns}</Td><Td>{cpu}</Td><Td>{mem}</Td>
                  <Td right className="font-semibold text-emerald-700">{save}</Td>
                  <ConfidenceCell pct={parseInt(conf)} right />
                </tr>
              ))}
            </DataTable>
          </div>
        </Panel>
        </FullOnly>
      </div>

      <FullOnly mode={mode}>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        {/* 6 */}
        <Panel index={6} title="Node group optimization">
          <DataTable head={<><Th>Node group</Th><Th>Current</Th><Th>Recommended</Th><Th right>Utilization</Th><Th right>Annual savings</Th><Th right>Review</Th></>}>
            {nodeGroups.map(([ng, cur, rec, util, save]) => (
              <tr key={ng} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">{ng}</Td><Td>{cur}</Td><Td className="text-emerald-700">{rec}</Td>
                <Td right>{util}</Td>
                <Td right className="font-semibold text-emerald-700">{save}</Td>
                <Td right>
                  <button type="button" onClick={() => drawer.open({ title: ng, subtitle: `${cur} → ${rec}`, tone: "emerald", rows: [["Utilization", util], ["Annual savings", save], ["Rollout", "Add new pool, drain old"], ["Rollback", "Re-scale original pool"]] })}
                    className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-700">Review</button>
                </Td>
              </tr>
            ))}
          </DataTable>
        </Panel>

        {/* 7 */}
        <Panel index={7} title="Cost drivers">
          <CostDriverBars data={costDrivers} />
        </Panel>
      </div>
      </FullOnly>

      <div className={mode === "exec" ? "grid gap-5" : "grid gap-5 xl:grid-cols-[1fr_1.4fr]"}>
        {/* 8 */}
        <Panel index={8} title="Cluster efficiency score">
          <GaugeRing pct={59} label="Blended efficiency" tone="amber" />
          <div className="mt-3 space-y-2">
            {efficiencyParts.map(([l, v]) => (
              <ProgressRow key={l} label={l} pct={v} tone={v >= 60 ? "emerald" : "amber"} />
            ))}
          </div>
        </Panel>

        {/* 9 */}
        <FullOnly mode={mode}>
        <Panel index={9} title="Persistent storage insights">
          <div className="grid grid-cols-3 gap-2">
            {[["Total PVs", "636"], ["Unused", "184"], ["Orphaned capacity", "2.1 TB"]].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">{l}</div>
                <div className="text-xl font-bold text-slate-900">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <DataTable head={<><Th>Storage class</Th><Th right>Volumes</Th><Th right>Unused</Th><Th right>Annual savings</Th></>}>
              {storageClasses.map(([sc, pv, unused, save]) => (
                <tr key={sc} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-900">{sc}</Td><Td right>{pv}</Td><Td right>{unused}</Td>
                  <Td right className="font-semibold text-emerald-700">{save}</Td>
                </tr>
              ))}
            </DataTable>
          </div>
        </Panel>
        </FullOnly>
      </div>

      <FullOnly mode={mode}>
      <div className="grid gap-5 xl:grid-cols-2">
        {/* 10 */}
        <Panel index={10} title="Digital twin investigation">
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-[11.5px] text-slate-700">
            Six agents correlated cluster telemetry, workload manifests, scheduling events, and billing data across 2,634 pods.
          </div>
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Key findings</div>
            <ul className="mt-1 space-y-1">
              {findings.map((f) => (
                <li key={f} className="flex gap-1.5 text-[11.5px] text-slate-700"><CheckCircle2 className="mt-[2px] h-3 w-3 shrink-0 text-emerald-500" />{f}</li>
              ))}
            </ul>
          </div>
        </Panel>

        {/* 11 */}
        <Panel index={11} title="Execution plan">
          <DataTable head={<><Th>Step</Th><Th>Action</Th><Th right>Duration</Th><Th right>Mode</Th></>}>
            {executionPlan.map(([s, a, d, m]) => (
              <tr key={s} className="hover:bg-slate-50">
                <Td className="font-semibold text-slate-900">{s}</Td><Td>{a}</Td><Td right>{d}</Td>
                <Td right><Badge tone={m === "Automated" ? "emerald" : "amber"}>{m}</Badge></Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>
      </FullOnly>

      {/* 12 */}
      <FullOnly mode={mode}>
      <Panel index={12} title="Value realization tracker">
        <SavingsFunnel stages={[
          { label: "Identified", value: "$1.28M", pct: 100, tone: "blue" },
          { label: "Validated", value: "$1.06M", pct: 83, tone: "sky" },
          { label: "Approved", value: "$742K", pct: 58, tone: "amber" },
          { label: "Implemented", value: "$486K", pct: 38, tone: "violet" },
          { label: "Realized YTD", value: "$364K", pct: 28, tone: "emerald" },
        ]} title="Identified → Realized" />
      </Panel>
      </FullOnly>

      <PageBands lifecycle={lifecycleWithActive("Execute")} />

      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </div>
  );
}
