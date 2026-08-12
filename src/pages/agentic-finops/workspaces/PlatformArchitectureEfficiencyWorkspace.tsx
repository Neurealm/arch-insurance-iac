import {
  Boxes, Lightbulb, DollarSign, ShieldCheck, Flame, AppWindow, MoveRight, Activity, ArrowRight,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import FinOpsHeader from "../components/FinOpsHeader";
import PageBands, { lifecycleWithActive } from "../components/PageBands";
import SavingsFunnel from "../components/SavingsFunnel";
import {
  Panel, Badge, KpiStrip, DataTable, Th, Td, DonutCard, DetailDrawer, ConfidenceCell,
  useDetailDrawer, GaugeRing, type Kpi, ViewModeToggle, FullOnly, execKpis, type ViewMode,
} from "../components/primitives";
import { DomainContextBar } from "../components/bands";
import { useState } from "react";

const kpis: Kpi[] = [
  { id: "wl", icon: Boxes, label: "Total Workloads Analyzed", value: "184", sub: "across 6 portfolios", tone: "blue" },
  { id: "opps", icon: Lightbulb, label: "Architectural Opportunities", value: "62", sub: "33.7% of workloads", tone: "sky" },
  { id: "save", icon: DollarSign, label: "Potential Annual Savings", value: "$9.84M", sub: "gross", tone: "emerald" },
  { id: "radj", icon: ShieldCheck, label: "Risk-Adjusted Annual Value", value: "$7.21M", sub: "73% of gross", tone: "teal" },
  { id: "hi", icon: Flame, label: "High Impact Opportunities", value: "18", sub: "> $250K each", tone: "rose" },
  { id: "apps", icon: AppWindow, label: "Applications Under Review", value: "24", sub: "in active assessment", tone: "violet" },
  { id: "mig", icon: MoveRight, label: "Recommended for Migration", value: "11", sub: "approved roadmap", tone: "amber" },
  { id: "health", icon: Activity, label: "Optimization Health", value: "Good", sub: "pipeline healthy", tone: "emerald" },
];

const opportunities: [string, string, string, string, string, number][] = [
  ["Payment Authorization Service", "EC2 Auto Scaling (x86)", "EKS + Graviton", "$1.42M", "Medium", 92],
  ["Order Capture API", "EC2 monolith", "Fargate microservices", "$1.08M", "Medium", 88],
  ["Customer Profile Store", "Self-managed Cassandra", "Aurora Serverless v2", "$946K", "High", 81],
  ["Batch Reporting Engine", "Always-on EMR", "Serverless Spark on demand", "$884K", "Low", 94],
  ["Media Transcoding", "GPU EC2 fleet", "Managed transcoding service", "$762K", "Medium", 86],
  ["Notification Fanout", "Self-managed Kafka", "Managed streaming (MSK Serverless)", "$688K", "Low", 91],
  ["Search Indexing", "EC2 Elasticsearch", "Managed OpenSearch + Graviton", "$614K", "Medium", 87],
  ["Legacy ETL Pipelines", "Windows VMs + SQL Server", "Containerized ETL + PostgreSQL", "$572K", "High", 76],
  ["Session Cache Layer", "EC2 Redis", "ElastiCache Serverless", "$486K", "Low", 93],
  ["Document Rendering", "Dedicated VM pool", "Lambda + S3", "$412K", "Low", 90],
];

const costMix = [
  { name: "Compute", value: 41, display: "$23.9M" },
  { name: "Databases", value: 22, display: "$12.8M" },
  { name: "Data services", value: 14, display: "$8.2M" },
  { name: "Network", value: 9, display: "$5.2M" },
  { name: "Licensing", value: 8, display: "$4.7M" },
  { name: "Observability", value: 6, display: "$3.5M" },
];

const transitionBars = [
  { label: "x86 → Graviton", savings: 3120, risk: 480 },
  { label: "VM → Container", savings: 2410, risk: 690 },
  { label: "Self-managed → Managed", savings: 1980, risk: 520 },
  { label: "Always-on → Serverless", savings: 1560, risk: 310 },
  { label: "Monolith → Services", savings: 770, risk: 630 },
];

const comparison: [string, string, string, string][] = [
  ["Monthly cost", "$118,400", "$74,200", "$81,900"],
  ["Annual savings", "—", "$530,400", "$438,000"],
  ["Performance (p99)", "184 ms", "162 ms", "171 ms"],
  ["Availability", "99.95%", "99.98%", "99.97%"],
  ["Scalability", "Manual ASG steps", "HPA + cluster autoscaler", "Fully managed"],
  ["Operational overhead", "High", "Medium", "Low"],
  ["Resilience", "Single-AZ bias", "Multi-AZ by default", "Multi-AZ by default"],
  ["Deployment model", "AMI bake + rolling", "GitOps container deploy", "Task definition push"],
  ["Change complexity", "—", "Medium", "Medium-high"],
  ["Risk", "Baseline", "Medium", "Medium"],
  ["Confidence", "—", "92%", "84%"],
];

const context = {
  business: [
    "Payment authorization is on the revenue-critical checkout path.",
    "Peak season traffic multiplies authorization volume by 3.4x.",
    "Regulatory requirement for transaction audit retention of 7 years.",
    "Board target of 12% cloud unit-cost reduction this fiscal year.",
  ],
  technical: [
    "Service is fully containerized and ARM-compatible today.",
    "Twelve synchronous downstream dependencies constrain latency budget.",
    "Existing GitOps pipeline already deploys three EKS workloads.",
    "Aurora migration would require a schema compatibility review.",
  ],
};

const archNodes = [
  { id: "users", label: "Users", x: 4, y: 44, tone: "slate" as const },
  { id: "gw", label: "API Gateway", x: 22, y: 44, tone: "blue" as const },
  { id: "auth", label: "Payment Auth Service", x: 44, y: 44, tone: "violet" as const },
  { id: "rds", label: "RDS (Aurora)", x: 72, y: 20, tone: "teal" as const },
  { id: "cache", label: "ElastiCache", x: 72, y: 44, tone: "emerald" as const },
  { id: "fraud", label: "Fraud Scoring", x: 44, y: 12, tone: "amber" as const },
  { id: "cust", label: "Customer Service", x: 44, y: 76, tone: "sky" as const },
  { id: "ledger", label: "Ledger Service", x: 72, y: 68, tone: "rose" as const },
];
const archEdges: [string, string, "sync" | "async" | "data"][] = [
  ["users", "gw", "sync"], ["gw", "auth", "sync"], ["auth", "fraud", "sync"],
  ["auth", "cache", "data"], ["auth", "rds", "data"], ["auth", "cust", "sync"],
  ["auth", "ledger", "async"], ["cust", "ledger", "async"],
];

const drivers = [
  "Instance family is two generations behind current price/performance leaders.",
  "Cluster runs at 31% average utilization because scaling steps are manual.",
  "Self-managed data tier consumes 1.8 FTE of operational effort per year.",
  "License cost for the Windows-based ETL tier grows with every core added.",
  "Blue/green deployments require double capacity for six hours per release.",
];

const risks: [string, string, string, string][] = [
  ["ARM incompatibility in a third-party library", "Medium", "Low", "Certify in the pilot phase; keep an x86 node group as fallback"],
  ["Latency regression on the checkout path", "Low", "High", "Canary 5% of traffic with automatic rollback at +10 ms p99"],
  ["Data migration downtime", "Low", "High", "Dual-write with replica cut-over during a low-volume window"],
  ["Team unfamiliar with Kubernetes operations", "Medium", "Medium", "Platform team runs the cluster; app team owns manifests only"],
  ["Cost overrun during parallel run", "Medium", "Low", "Cap the parallel-run window at 30 days with a budget alert"],
];

const roadmap = [
  { phase: "Phase 1 · Assess", detail: "Dependency mapping, ARM certification, cost model validation.", weeks: "Weeks 1–4" },
  { phase: "Phase 2 · Pilot", detail: "Single-service canary on Graviton node group with full observability.", weeks: "Weeks 5–8" },
  { phase: "Phase 3 · Migrate", detail: "Progressive workload migration with dual-run and rollback gates.", weeks: "Weeks 9–20" },
  { phase: "Phase 4 · Optimize", detail: "Right-size, apply commitments, and verify realized savings.", weeks: "Weeks 21–26" },
];

const toneBg: Record<string, string> = {
  slate: "#e2e8f0", blue: "#dbeafe", violet: "#ede9fe", teal: "#ccfbf1",
  emerald: "#d1fae5", amber: "#fef3c7", sky: "#e0f2fe", rose: "#ffe4e6",
};

export default function PlatformArchitectureEfficiencyWorkspace() {
  const drawer = useDetailDrawer();
  const [mode, setMode] = useState<ViewMode>("full");
  const pos = Object.fromEntries(archNodes.map((n) => [n.id, n]));

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-6 py-6">
      <FinOpsHeader
        title="Platform & Architecture Efficiency Workspace"
        tagline="Unlock $0.6M by moving workloads to the architecture that fits them best."
        secondaryActions={[{ label: "Export Architecture Review", icon: "export" }, { label: "Alternative Simulator", icon: "simulate" }]}
        meta={{ lastAnalysis: "44 minutes ago", freshness: "95.9% within SLA", resources: "184 workloads analyzed" }}
        onPrimary={() => drawer.open({ title: "Architecture analysis run", tone: "blue", rows: [["Workloads", "184"], ["Opportunities", "62"], ["Risk-adjusted value", "$7.21M"]] })}
        onSecondary={(l) => drawer.open({ title: l, tone: "slate", bullets: ["Synthetic demonstration action."] })}
        extra={<span className="ml-auto"><ViewModeToggle mode={mode} onChange={setMode} /></span>}
      />

      <DomainContextBar headline="Opportunity in this domain: $0.6M · Confidence 68% · Risk High" nextSlug="kubernetes-economics" nextLabel="Kubernetes Economics" />

      <KpiStrip kpis={execKpis(kpis, mode)} onSelect={(k) => drawer.open({ title: k.label, subtitle: k.sub, tone: k.tone, rows: [["Value", k.value]] })} />

      {/* 1 */}
      <Panel index={1} title="Architectural improvement opportunities (top 10)">
        <DataTable head={<>
          <Th>Workload / application</Th><Th>Current architecture</Th><Th>Recommended architecture</Th>
          <Th right>Annual savings</Th><Th right>Risk</Th><Th right>Confidence</Th><Th right>Review</Th>
        </>}>
          {opportunities.map(([wl, cur, rec, save, risk, conf]) => (
            <tr key={wl} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-900">{wl}</Td><Td>{cur}</Td><Td className="text-emerald-700">{rec}</Td>
              <Td right className="font-semibold text-emerald-700">{save}</Td>
              <Td right><Badge tone={risk === "High" ? "rose" : risk === "Medium" ? "amber" : "emerald"}>{risk}</Badge></Td>
              <ConfidenceCell pct={conf} right />
              <Td right>
                <button type="button" onClick={() => drawer.open({ title: wl, subtitle: `${cur} → ${rec}`, tone: "blue", rows: [["Annual savings", save], ["Risk", risk], ["Confidence", `${conf}%`], ["Effort", "8–20 weeks"]] })}
                  className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-700">Review</button>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <FullOnly mode={mode}>
      <div className="grid gap-5 xl:grid-cols-[1fr_1.3fr]">
        {/* 2 */}
        <Panel index={2} title="Current architecture cost breakdown">
          <DonutCard total="$58.3M" totalLabel="Annual platform cost" data={costMix} />
        </Panel>

        {/* 3 */}
        <Panel index={3} title="Architecture alternatives summary">
          <div className="grid grid-cols-3 gap-2">
            {[["Potential savings", "$9.84M", "emerald"], ["Risk-adjusted value", "$7.21M", "teal"], ["Implementation effort", "182 person-weeks", "amber"]].map(([l, v, tone]) => (
              <div key={l} className={cn("rounded-lg border p-3", tone === "emerald" ? "border-emerald-200 bg-emerald-50" : tone === "teal" ? "border-teal-200 bg-teal-50" : "border-amber-200 bg-amber-50")}>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">{l}</div>
                <div className="text-xl font-bold text-slate-900">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Savings by transition type ($K)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={transitionBars} margin={{ top: 10, right: 10, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 9.5, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="savings" name="Risk-adjusted savings" stackId="a" fill="#10b981" />
                <Bar dataKey="risk" name="Risk discount" stackId="a" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      </FullOnly>

      {/* 4 */}
      <Panel index={4} title="Value realization funnel">
        <SavingsFunnel stages={[
          { label: "Identified", value: "$9.84M", pct: 100, tone: "blue" },
          { label: "Validated", value: "$8.42M", pct: 86, tone: "sky" },
          { label: "Risk-adjusted", value: "$7.21M", pct: 73, tone: "teal" },
          { label: "Approved", value: "$4.96M", pct: 50, tone: "amber" },
          { label: "Implemented", value: "$2.84M", pct: 29, tone: "violet" },
          { label: "Realized YTD", value: "$1.91M", pct: 19, tone: "emerald" },
        ]} title="Identified → Realized" />
      </Panel>

      {/* 5 */}
      <Panel index={5} title="Architecture comparison: payment authorization service">
        <DataTable head={<>
          <Th>Dimension</Th><Th right>Current · EC2 (x86)</Th><Th right>Alternative 1 · EKS + Graviton</Th><Th right>Alternative 2 · Fargate + Aurora</Th>
        </>}>
          {comparison.map(([dim, cur, a1, a2]) => (
            <tr key={dim} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-900">{dim}</Td>
              <Td right>{cur}</Td>
              <Td right className="bg-emerald-50 font-semibold text-emerald-800">{a1}</Td>
              <Td right>{a2}</Td>
            </tr>
          ))}
        </DataTable>
        <p className="mt-2 text-[11.5px] text-slate-500">Alternative 1 is the recommended target architecture (highlighted).</p>
      </Panel>

      <FullOnly mode={mode}>
      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        {/* 6 */}
        <Panel index={6} title="Business & technical context">
          <div className="grid gap-3 md:grid-cols-2">
            {[["Business context", context.business], ["Technical context", context.technical]].map(([label, items]) => (
              <div key={label as string}>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label as string}</div>
                <ul className="mt-1 space-y-1">
                  {(items as string[]).map((x) => (
                    <li key={x} className="flex gap-1.5 text-[11.5px] text-slate-700"><span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        {/* 7 */}
        <Panel index={7} title="Digital twin architecture map">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <svg viewBox="0 0 100 88" className="h-[280px] w-full" role="img" aria-label="Architecture dependency map">
              {archEdges.map(([a, b, kind]) => {
                const from = pos[a]; const to = pos[b];
                const stroke = kind === "sync" ? "#6366f1" : kind === "async" ? "#f59e0b" : "#10b981";
                return (
                  <line key={`${a}-${b}`} x1={from.x + 8} y1={from.y + 4} x2={to.x} y2={to.y + 4}
                    stroke={stroke} strokeWidth="0.6" strokeDasharray={kind === "async" ? "2 1.5" : undefined} />
                );
              })}
              {archNodes.map((n) => (
                <g key={n.id}>
                  <rect x={n.x} y={n.y} width="24" height="9" rx="2" fill={toneBg[n.tone]} stroke="#cbd5e1" strokeWidth="0.3" />
                  <text x={n.x + 12} y={n.y + 5.8} textAnchor="middle" fontSize="2.8" fill="#0f172a">{n.label}</text>
                </g>
              ))}
            </svg>
            <div className="flex flex-wrap items-center gap-3 px-2 pb-1">
              {[["Synchronous", "#6366f1"], ["Asynchronous", "#f59e0b"], ["Data flow", "#10b981"]].map(([l, c]) => (
                <span key={l} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span className="h-0.5 w-4 rounded" style={{ background: c }} />{l}
                </span>
              ))}
            </div>
          </div>
        </Panel>
      </div>
      </FullOnly>

      <FullOnly mode={mode}>
      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        {/* 8 */}
        <Panel index={8} title="Architecture drivers">
          <ul className="space-y-1.5">
            {drivers.map((d) => (
              <li key={d} className="flex gap-2 text-[12px] text-slate-700">
                <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />{d}
              </li>
            ))}
          </ul>
        </Panel>

        {/* 9 */}
        <Panel index={9} title="Risks & mitigations">
          <DataTable head={<><Th>Risk</Th><Th right>Likelihood</Th><Th right>Impact</Th><Th>Mitigation</Th></>}>
            {risks.map(([r, l, i, m]) => (
              <tr key={r} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">{r}</Td>
                <Td right><Badge tone={l === "Medium" ? "amber" : "emerald"}>{l}</Badge></Td>
                <Td right><Badge tone={i === "High" ? "rose" : i === "Medium" ? "amber" : "emerald"}>{i}</Badge></Td>
                <Td>{m}</Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>
      </FullOnly>

      {/* 10 */}
      <FullOnly mode={mode}>
      <Panel index={10} title="Execution roadmap">
        <div className="flex flex-wrap items-stretch gap-2">
          {roadmap.map((r, i) => (
            <div key={r.phase} className="flex items-stretch gap-2">
              <div className="min-w-[210px] max-w-[260px] rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11.5px] font-semibold text-slate-900">{r.phase}</div>
                <p className="mt-1 text-[11.5px] leading-snug text-slate-600">{r.detail}</p>
                <div className="mt-1.5 text-[10.5px] font-medium text-indigo-600">{r.weeks}</div>
              </div>
              {i < roadmap.length - 1 && <div className="grid place-items-center text-slate-300"><ArrowRight className="h-4 w-4" /></div>}
            </div>
          ))}
        </div>
      </Panel>
      </FullOnly>

      <FullOnly mode={mode}>
      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        {/* 11 */}
        <Panel index={11} title="Confidence & evidence">
          <GaugeRing pct={92} label="Decision confidence" sub="Evidence complete" />
          <p className="mt-2 text-center text-[11.5px] text-slate-600">
            Cost model, dependency graph, performance benchmark, and operational effort validated by six agents.
          </p>
        </Panel>

        {/* 12 */}
        <Panel index={12} title="Value realization tracker">
          <SavingsFunnel stages={[
            { label: "Identified", value: "$9.84M", pct: 100, tone: "blue" },
            { label: "Validated", value: "$8.42M", pct: 86, tone: "sky" },
            { label: "Approved", value: "$4.96M", pct: 50, tone: "amber" },
            { label: "Implemented", value: "$2.84M", pct: 29, tone: "violet" },
            { label: "Realized YTD", value: "$1.91M", pct: 19, tone: "emerald" },
          ]} title="Identified → Realized" />
        </Panel>
      </div>
      </FullOnly>

      <PageBands lifecycle={lifecycleWithActive("Simulate")} />

      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </div>
  );
}
