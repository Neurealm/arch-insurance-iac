import { useState } from "react";
import {
  Server, Target, DollarSign, ShieldCheck, PlayCircle, TrendingUp, XCircle,
  ArrowRight, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import FinOpsHeader from "./components/FinOpsHeader";
import PageBands, { lifecycleWithActive } from "./components/PageBands";
import AgentGrid, { type AgentChip } from "./components/AgentGrid";
import {
  Panel, Card, Badge, KpiStrip, DataTable, Th, Td, DonutCard, DetailDrawer,
  useDetailDrawer, toneMap, LinkAction, type Kpi,
} from "./components/primitives";

const kpis: Kpi[] = [
  { id: "eval", icon: Server, label: "Resources Evaluated", value: "18,428", sub: "across 6 accounts", tone: "blue" },
  { id: "cand", icon: Target, label: "Rightsizing Candidates", value: "1,284", sub: "7.0% of fleet", tone: "sky" },
  { id: "save", icon: DollarSign, label: "Potential Annual Savings", value: "$8.7M", sub: "gross opportunity", tone: "emerald" },
  { id: "risk", icon: ShieldCheck, label: "Risk-Validated", value: "742", sub: "SRE-cleared", tone: "teal" },
  { id: "ready", icon: PlayCircle, label: "Ready for Change", value: "316", sub: "change window assigned", tone: "violet" },
  { id: "ytd", icon: TrendingUp, label: "Realized YTD", value: "$3.2M", sub: "billing-verified", tone: "emerald" },
  { id: "rej", icon: XCircle, label: "Rejected Recommendations", value: "219", sub: "native suggestions blocked", tone: "rose" },
];

const whyColumns = [
  {
    title: "Utilization",
    tone: "blue" as const,
    metrics: [["Mean CPU", "18%"], ["p95 CPU", "74%"], ["p99 CPU", "91%"], ["Mean memory", "42%"]],
    observation: "Averages hide a sharp settlement burst every night at 01:40 UTC that consumes almost all vCPU headroom.",
    source: "CloudWatch + Datadog · 90 days",
    confidence: 96,
  },
  {
    title: "Demand",
    tone: "sky" as const,
    metrics: [["Txn growth (90d)", "+14%"], ["Forecast (12m)", "+31%"], ["Seasonal peak", "Nov 22–29"], ["Peak multiplier", "3.4x"]],
    observation: "Native recommendation uses a trailing 14-day window and misses the Q4 authorization peak entirely.",
    source: "Demand forecast agent · Prophet ensemble",
    confidence: 89,
  },
  {
    title: "Reliability",
    tone: "amber" as const,
    metrics: [["SLO", "99.95%"], ["Error budget left", "38%"], ["Recent incidents", "2 (latency)"], ["Burn rate", "1.4x"]],
    observation: "Two latency incidents in the last quarter were CPU-saturation related; a naive downsize increases SLO risk.",
    source: "SRE incident record + SLO store",
    confidence: 92,
  },
  {
    title: "Dependencies",
    tone: "violet" as const,
    metrics: [["Upstream services", "7"], ["Downstream services", "12"], ["Sync callers", "5"], ["Shared cache", "Yes"]],
    observation: "Fraud scoring calls are synchronous; added latency propagates directly into checkout conversion.",
    source: "Service map + trace sampling",
    confidence: 94,
  },
  {
    title: "Architecture",
    tone: "teal" as const,
    metrics: [["Instance family", "m6i (x86)"], ["Graviton ready", "Yes"], ["Container-based", "Yes"], ["License impact", "None"]],
    observation: "Workload is ARM-compatible; a Graviton family change delivers more savings at lower risk than a same-family downsize.",
    source: "Architecture agent · build & image scan",
    confidence: 91,
  },
];

const agents: AgentChip[] = [
  { name: "Utilization Agent", status: "Complete", confidence: 96, finding: "Bimodal CPU profile detected" },
  { name: "Demand Forecast Agent", status: "Complete", confidence: 89, finding: "+31% 12-month growth" },
  { name: "App Context Agent", status: "Complete", confidence: 93, finding: "Tier-1 revenue path" },
  { name: "Dependency Agent", status: "Complete", confidence: 94, finding: "12 synchronous downstreams" },
  { name: "SRE Risk Agent", status: "Complete", confidence: 92, finding: "Error budget at 38%" },
  { name: "Architecture Agent", status: "Complete", confidence: 91, finding: "Graviton-compatible image" },
  { name: "Financial Agent", status: "Ready", confidence: 97, finding: "Commitment-adjusted pricing modeled" },
];

const workload = Array.from({ length: 24 }, (_, h) => {
  const burst = h === 1 || h === 2;
  const day = h >= 9 && h <= 20;
  return {
    label: `${String(h).padStart(2, "0")}:00`,
    cpu: burst ? 88 + (h === 1 ? 4 : 0) : day ? 26 + ((h * 7) % 11) : 11 + ((h * 3) % 6),
    memory: burst ? 71 : day ? 44 + ((h * 5) % 9) : 33,
    network: burst ? 62 : day ? 28 + ((h * 3) % 8) : 14,
    requests: burst ? 94 : day ? 48 + ((h * 4) % 12) : 17,
    iops: burst ? 79 : day ? 35 + ((h * 6) % 10) : 19,
  };
});

const seriesDefs = [
  { key: "cpu", label: "CPU %", color: "#6366f1" },
  { key: "memory", label: "Memory %", color: "#3b82f6" },
  { key: "network", label: "Network", color: "#10b981" },
  { key: "requests", label: "Requests", color: "#f59e0b" },
  { key: "iops", label: "IOPS", color: "#a855f7" },
];

const scenarioRows: [string, string, string, string][] = [
  ["Instance type", "m6i.4xlarge", "m6i.2xlarge", "m7g.2xlarge"],
  ["vCPU", "16", "8", "8"],
  ["Memory", "64 GiB", "32 GiB", "32 GiB"],
  ["Monthly cost", "$1,842", "$921", "$742"],
  ["Annual savings", "—", "$11,052", "$13,200"],
  ["Peak CPU (modeled)", "91%", "> 100% (saturation)", "84%"],
  ["Headroom at Q4 peak", "9%", "-12%", "16%"],
  ["p99 latency delta", "baseline", "+38 ms", "-4 ms"],
  ["SLO risk", "Low", "High", "Low"],
  ["Rollback complexity", "—", "Low", "Low"],
  ["Change window", "—", "Standard", "Standard"],
  ["Decision confidence", "—", "51%", "94%"],
];

const evidenceAvailable = [
  "90 days of CPU, memory, network, and IOPS telemetry",
  "Distributed traces covering 12 downstream dependencies",
  "SLO definition, error budget history, and incident timeline",
  "Container image architecture scan (ARM compatibility verified)",
  "Commitment portfolio and effective hourly pricing",
];
const evidenceMissing = [
  "Load-test results for the Q4 peak profile on m7g",
  "Application owner sign-off on the maintenance window",
  "Third-party library ARM certification for one dependency",
];

const responsibility: [string, string, string][] = [
  ["FinOps", "Owns savings target, validates financial model, tracks realization", "Accountable"],
  ["Cloud Engineering", "Executes instance family change via IaC pipeline", "Responsible"],
  ["SRE", "Approves risk posture, defines rollback and observation window", "Consulted"],
  ["Application Owner", "Confirms functional compatibility and change window", "Consulted"],
  ["Finance", "Confirms realized savings against the billing ledger", "Informed"],
  ["Neurealm Agents", "Continuously gathers evidence, simulates, and monitors post-change", "Automated"],
];

const capability: [string, string, string][] = [
  ["Utilization-based sizing suggestion", "Yes", "Yes"],
  ["Peak and seasonal demand modeling", "No", "Yes"],
  ["Dependency and blast-radius awareness", "No", "Yes"],
  ["SLO and error-budget risk gating", "No", "Yes"],
  ["Cross-family / architecture alternatives", "Partial", "Yes"],
  ["Commitment-adjusted financial model", "Partial", "Yes"],
  ["Executable change plan with rollback", "No", "Yes"],
  ["Post-change billing verification", "No", "Yes"],
];

export default function ResourceRightsizingDecisionWorkspace() {
  const drawer = useDetailDrawer();
  const [active, setActive] = useState<string[]>(["cpu", "memory"]);
  const toggle = (k: string) =>
    setActive((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-6 py-6">
      <FinOpsHeader
        title="Resource Rightsizing Decision Workspace"
        tagline="Turning native optimization signals into safe, executable, financially verified engineering changes."
        onPrimary={() => drawer.open({
          title: "Rightsizing analysis run",
          subtitle: "18,428 resources re-evaluated against current telemetry",
          tone: "blue",
          rows: [["Duration", "48 seconds"], ["New candidates", "37"], ["Withdrawn", "12"], ["Evidence freshness", "98.4% within SLA"]],
        })}
        onSecondary={(l) => drawer.open({ title: l, subtitle: "Synthetic demonstration action", tone: "slate", bullets: ["No external system was contacted.", "Evidence bundle generated locally."] })}
      />

      <KpiStrip kpis={kpis} onSelect={(k) => drawer.open({
        title: k.label, subtitle: k.sub, tone: k.tone,
        rows: [["Current value", k.value], ["Trend (30d)", "improving"], ["Source", "Agentic FinOps twin"]],
      })} />

      {/* 1 */}
      <Panel index={1} title="Decision summary">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_1fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Resource under review</div>
            <div className="mt-1 text-[15px] font-bold text-slate-900">prod-payments-api-07</div>
            <dl className="mt-2 space-y-1 text-[12px]">
              {[["Application", "Payment Authorization"], ["Environment", "Production"], ["Cloud / Region", "AWS · us-east-1"], ["Current type", "m6i.4xlarge"], ["Monthly cost", "$1,842"], ["Business tier", "Tier 1 · revenue path"]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Native cloud recommendation</div>
            <div className="mt-1 text-[14px] font-semibold text-slate-900">Downsize to m6i.2xlarge</div>
            <p className="mt-1 text-[12px] text-slate-600">Based on 14 days of average CPU utilization (18%).</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="slate">Savings $11,052/yr</Badge>
              <Badge tone="rose">Peak saturation risk</Badge>
              <Badge tone="amber">No dependency check</Badge>
            </div>
            <div className="mt-3 rounded border border-rose-200 bg-rose-50 px-2 py-1.5 text-[11.5px] font-medium text-rose-700">
              <AlertTriangle className="mr-1 inline h-3 w-3" /> Incomplete evidence basis
            </div>
          </div>

          <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Neurealm agentic FinOps decision</div>
            <div className="mt-1 text-[13px] font-bold uppercase tracking-wide text-rose-700">Do not apply native recommendation</div>
            <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Preferred action</div>
            <div className="text-[14px] font-semibold text-slate-900">Migrate m6i.4xlarge → m7g.2xlarge</div>
            <p className="mt-1 text-[12px] text-slate-600">Graviton family change preserves peak headroom while increasing annual savings by 19% versus the native suggestion.</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Decision confidence</span>
              <span className="text-[18px] font-bold text-emerald-700">94%</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => drawer.open({
                title: "Change plan · prod-payments-api-07", tone: "emerald",
                rows: [["Action", "Replace launch template with m7g.2xlarge"], ["Method", "Terraform module bump + rolling replace"], ["Window", "Sun 02:00–04:00 UTC"], ["Rollback", "Re-point ASG to prior template (< 6 min)"], ["Observation", "72 hours of guarded monitoring"]],
                bullets: ["Canary one node for 24 hours before fleet rollout.", "Abort automatically if p99 latency rises above +10 ms.", "Verify realized savings against the next billing cycle."],
              })} className="rounded-md bg-slate-900 px-2.5 py-1.5 text-[11.5px] font-semibold text-white hover:bg-slate-800">
                Review Change Plan
              </button>
              <button type="button" onClick={() => drawer.open({
                title: "Decision evidence bundle", tone: "blue",
                rows: [["Evidence items", "148"], ["Agents contributing", "7"], ["Weakest link", "Load-test coverage"], ["Overall confidence", "94%"]],
                bullets: evidenceAvailable,
              })} className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-700">
                View Decision Evidence
              </button>
            </div>
          </div>
        </div>
      </Panel>

      {/* 2 */}
      <Panel index={2} title="Why the native recommendation is incomplete">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {whyColumns.map((c) => {
            const t = toneMap[c.tone];
            return (
              <div key={c.title} className={cn("flex flex-col rounded-lg border p-3", t.bg, t.border)}>
                <div className={cn("text-[12px] font-semibold", t.text)}>{c.title}</div>
                <dl className="mt-2 space-y-1 rounded bg-white/70 p-2 text-[11.5px]">
                  {c.metrics.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <dt className="text-slate-500">{k}</dt><dd className="font-semibold tabular-nums text-slate-900">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 flex-1 text-[11.5px] leading-snug text-slate-700">{c.observation}</p>
                <div className="mt-2 border-t border-white/70 pt-1.5 text-[10.5px] text-slate-500">
                  {c.source} · confidence <span className="font-semibold text-slate-700">{c.confidence}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* 3 */}
      <Panel index={3} title="Agentic investigation">
        <AgentGrid
          agents={agents}
          engineNote="7 agents · 148 evidence items · consensus reached in 41 seconds"
          onSelect={(a) => drawer.open({
            title: a.name, subtitle: a.finding, tone: "violet",
            rows: [["Status", a.status], ["Confidence", `${a.confidence}%`], ["Evidence items", "18"], ["Last run", "12 minutes ago"]],
          })}
        />
      </Panel>

      {/* 4 */}
      <Panel
        index={4}
        title="Observed workload behavior"
        action={<span>90-day normalized profile · risk thresholds shaded</span>}
      >
        <div className="mb-2 flex flex-wrap gap-1.5">
          {seriesDefs.map((s) => (
            <button
              key={s.key} type="button" onClick={() => toggle(s.key)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                active.includes(s.key) ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={workload} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 110]} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Saturation risk 85%", fontSize: 10, fill: "#ef4444", position: "insideTopRight" }} />
            <ReferenceLine y={65} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Headroom floor 65%", fontSize: 10, fill: "#f59e0b", position: "insideTopRight" }} />
            {seriesDefs.filter((s) => active.includes(s.key)).map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={1.8} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-2 text-[11.5px] text-slate-500">
          The 01:00–02:00 UTC settlement burst crosses the saturation threshold on the current instance type. Any sizing decision that ignores this window will breach the latency SLO.
        </p>
      </Panel>

      {/* 5 */}
      <Panel index={5} title="Digital twin scenario simulation">
        <DataTable head={<>
          <Th>Attribute</Th><Th right>Current</Th><Th right>Native recommendation</Th><Th right>Digital twin recommendation</Th>
        </>}>
          {scenarioRows.map(([attr, cur, nat, twin]) => (
            <tr key={attr} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-900">{attr}</Td>
              <Td right>{cur}</Td>
              <Td right className={nat.includes("saturation") || nat === "High" ? "text-rose-700 font-medium" : ""}>{nat}</Td>
              <Td right className="bg-emerald-50 font-semibold text-emerald-800">{twin}</Td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        {/* 6 */}
        <Panel index={6} title="Confidence & evidence gap">
          <DonutCard
            total="82%"
            totalLabel="Evidence completeness"
            data={[
              { name: "Available evidence", value: 82, display: "82%", color: "#10b981" },
              { name: "Missing evidence", value: 18, display: "18%", color: "#e2e8f0" },
            ]}
          />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Available</div>
              <ul className="mt-1 space-y-1">
                {evidenceAvailable.map((e) => (
                  <li key={e} className="flex gap-1.5 text-[11.5px] text-slate-700">
                    <CheckCircle2 className="mt-[2px] h-3 w-3 shrink-0 text-emerald-500" />{e}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Missing</div>
              <ul className="mt-1 space-y-1">
                {evidenceMissing.map((e) => (
                  <li key={e} className="flex gap-1.5 text-[11.5px] text-slate-700">
                    <AlertTriangle className="mt-[2px] h-3 w-3 shrink-0 text-amber-500" />{e}
                  </li>
                ))}
              </ul>
              <div className="mt-2"><LinkAction onClick={() => drawer.open({ title: "Close the evidence gap", tone: "amber", bullets: evidenceMissing })}>Request missing evidence</LinkAction></div>
            </div>
          </div>
        </Panel>

        {/* 7 */}
        <Panel index={7} title="Operating responsibility">
          <DataTable head={<><Th>Function</Th><Th>Responsibility</Th><Th right>Role</Th></>}>
            {responsibility.map(([fn, resp, role]) => (
              <tr key={fn} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">{fn}</Td>
                <Td>{resp}</Td>
                <Td right><Badge tone={role === "Accountable" ? "emerald" : role === "Automated" ? "violet" : "slate"}>{role}</Badge></Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>

      {/* 8 */}
      <Panel index={8} title="Maturity & adoption path">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { level: "Level 1 · Observe", detail: "Native recommendations reviewed manually; savings tracked in spreadsheets.", ttv: "Week 1", tone: "slate" as const },
            { level: "Level 2 · Contextualize", detail: "Agents enrich every recommendation with demand, dependency, and SLO context before review.", ttv: "Week 4", tone: "emerald" as const },
            { level: "Level 3 · Execute", detail: "Approved low-risk changes execute automatically with rollback guards and billing verification.", ttv: "Quarter 2", tone: "blue" as const },
          ].map((l) => {
            const t = toneMap[l.tone];
            return (
              <div key={l.level} className={cn("rounded-lg border p-3", t.bg, t.border)}>
                <div className={cn("text-[11px] font-semibold uppercase tracking-wider", t.text)}>{l.level}</div>
                <p className="mt-1 text-[12px] leading-snug text-slate-700">{l.detail}</p>
                <div className="mt-2 text-[11px] text-slate-500">Time to value: <span className="font-semibold text-slate-800">{l.ttv}</span></div>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Existing tool vs Neurealm</div>
          <div className="mt-2">
            <DataTable head={<><Th>Capability</Th><Th right>Existing tooling</Th><Th right>Neurealm agentic FinOps</Th></>}>
              {capability.map(([cap, ex, nr]) => (
                <tr key={cap} className="hover:bg-slate-50">
                  <Td>{cap}</Td>
                  <Td right><Badge tone={ex === "Yes" ? "emerald" : ex === "Partial" ? "amber" : "rose"}>{ex}</Badge></Td>
                  <Td right><Badge tone="emerald">{nr}</Badge></Td>
                </tr>
              ))}
            </DataTable>
          </div>
        </div>
      </Panel>

      {/* 9 + bands */}
      <PageBands lifecycle={lifecycleWithActive("Decide")} />

      <div className="flex items-center justify-center gap-2 text-[11.5px] text-slate-400">
        <span>Next: validate the change window with the application owner</span>
        <ArrowRight className="h-3 w-3" />
      </div>

      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </div>
  );
}
