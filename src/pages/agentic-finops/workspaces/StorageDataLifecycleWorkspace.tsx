import { useState } from "react";
import {
  Database, TrendingUp, Snowflake, DollarSign, ShieldAlert, AlertTriangle, ShieldCheck, Activity, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FinOpsHeader from "../components/FinOpsHeader";
import PageBands, { lifecycleWithActive } from "../components/PageBands";
import SavingsFunnel from "../components/SavingsFunnel";
import {
  Panel, Badge, KpiStrip, DataTable, Th, Td, DonutCard, DetailDrawer, ConfidenceCell,
  useDetailDrawer, SimpleBars, Spark, GaugeRing, toneMap, type Kpi,
  ViewModeToggle, FullOnly, execKpis, type ViewMode,
} from "../components/primitives";
import { DomainContextBar } from "../components/bands";

const kpis: Kpi[] = [
  { id: "total", icon: Database, label: "Total Storage", value: "1.84 PB", sub: "across 4 clouds", tone: "blue" },
  { id: "growth", icon: TrendingUp, label: "Storage Growth (90d)", value: "+18.6 TB", sub: "+1.0% per month", tone: "sky" },
  { id: "cold", icon: Snowflake, label: "Cold / Infrequent Data", value: "68.7%", sub: "1.26 PB", tone: "teal" },
  { id: "save", icon: DollarSign, label: "Immediate Savings Potential", value: "$612K", sub: "annualized", tone: "emerald" },
  { id: "viol", icon: ShieldAlert, label: "Policy Violations", value: "37", sub: "9 high severity", tone: "rose" },
  { id: "risk", icon: AlertTriangle, label: "Data at Risk", value: "112.6 TB", sub: "no lifecycle policy", tone: "amber" },
  { id: "comp", icon: ShieldCheck, label: "Compliance Coverage", value: "93.2%", sub: "target 98%", tone: "violet" },
  { id: "health", icon: Activity, label: "Optimization Health", value: "Good", sub: "tiering improving", tone: "emerald" },
];

const tiers = [
  { name: "S3 Standard", value: 34, display: "626 TB" },
  { name: "S3 Infrequent Access", value: 18, display: "331 TB" },
  { name: "Glacier Instant Retrieval", value: 14, display: "258 TB" },
  { name: "Glacier Flexible Retrieval", value: 11, display: "202 TB" },
  { name: "Glacier Deep Archive", value: 9, display: "166 TB" },
  { name: "EBS & EFS", value: 14, display: "257 TB" },
];

const accessTabs = ["By Last Accessed", "Frequency", "Age", "Business Value"] as const;
const accessData: Record<(typeof accessTabs)[number], { label: string; value: number }[]> = {
  "By Last Accessed": [
    { label: "< 30d", value: 312 }, { label: "30–90d", value: 264 }, { label: "90–180d", value: 218 },
    { label: "180–365d", value: 341 }, { label: "1–2y", value: 396 }, { label: "> 2y", value: 309 },
  ],
  Frequency: [
    { label: "Hourly", value: 96 }, { label: "Daily", value: 214 }, { label: "Weekly", value: 288 },
    { label: "Monthly", value: 402 }, { label: "Rarely", value: 512 }, { label: "Never", value: 328 },
  ],
  Age: [
    { label: "< 6m", value: 288 }, { label: "6–12m", value: 306 }, { label: "1–2y", value: 384 },
    { label: "2–4y", value: 472 }, { label: "> 4y", value: 390 },
  ],
  "Business Value": [
    { label: "Critical", value: 214 }, { label: "High", value: 318 }, { label: "Medium", value: 486 },
    { label: "Low", value: 522 }, { label: "Unclassified", value: 300 },
  ],
};

const policyCoverage = [
  { name: "Compliant", value: 62, display: "62%" },
  { name: "Policy exists, not applied", value: 18, display: "18%" },
  { name: "No policy", value: 14, display: "14%" },
  { name: "Excluded by design", value: 6, display: "6%" },
];

const opportunities = [
  { title: "Transition to Infrequent Access", detail: "418 TB not accessed in 90 days", value: "$18.4K", tone: "blue" as const },
  { title: "Transition to Glacier", detail: "286 TB not accessed in 1 year", value: "$21.9K", tone: "sky" as const },
  { title: "Transition to Deep Archive", detail: "192 TB retained for compliance only", value: "$9.6K", tone: "teal" as const },
  { title: "Delete expired objects", detail: "64 TB past documented retention", value: "$1.1K", tone: "emerald" as const },
];

const dataSets: [string, string, string, string, string, string, string, string, string, number][] = [
  ["commerce-clickstream-raw", "Object", "Commerce", "412 days", "S3 Standard", "Glacier Flexible", "186 TB", "$4,278/mo", "$3,610/mo", 96],
  ["payments-txn-archive", "Object", "Payments", "624 days", "S3 Standard-IA", "Deep Archive", "94 TB", "$1,222/mo", "$1,081/mo", 94],
  ["ml-feature-store-v1", "Object", "Analytics", "218 days", "S3 Standard", "S3 IA", "78 TB", "$1,794/mo", "$818/mo", 89],
  ["marketing-asset-library", "Object", "Marketing", "96 days", "S3 Standard", "S3 IA", "41 TB", "$943/mo", "$430/mo", 91],
  ["db-snapshot-vault", "Block", "Platform", "301 days", "EBS gp3 snapshots", "Archive tier", "62 TB", "$3,100/mo", "$1,984/mo", 87],
  ["logs-legacy-2021-2022", "Object", "Platform", "> 3 years", "S3 Standard", "Delete (expired)", "34 TB", "$782/mo", "$782/mo", 98],
  ["video-training-corpus", "Object", "HR", "512 days", "S3 Standard-IA", "Glacier Instant", "27 TB", "$351/mo", "$203/mo", 82],
  ["etl-scratch-space", "Object", "Analytics", "14 days", "S3 Standard", "Lifecycle 30-day expiry", "22 TB", "$506/mo", "$421/mo", 93],
];

const policyViolations: [string, string, string, string, string][] = [
  ["No lifecycle policy on production bucket", "commerce-clickstream-raw", "High", "Cost + compliance", "Apply 90-day IA transition"],
  ["Retention exceeded by 14 months", "logs-legacy-2021-2022", "High", "Compliance", "Delete after legal review"],
  ["Unencrypted archive tier objects", "video-training-corpus", "Medium", "Security", "Enable SSE-KMS"],
  ["Cross-region replication without policy", "payments-txn-archive", "Medium", "Cost", "Scope replication to required prefixes"],
  ["Snapshots retained beyond 365 days", "db-snapshot-vault", "Low", "Cost", "Apply snapshot lifecycle rule"],
];

const agentRows: [string, string, string][] = [
  ["Inventory Agent", "Complete", "1.84 PB catalogued across 214 buckets and 3,100 volumes"],
  ["Access Pattern Agent", "Complete", "68.7% of data untouched for 90+ days"],
  ["Classification Agent", "Complete", "Business value inferred for 86% of data sets"],
  ["Compliance Agent", "Complete", "37 policy violations detected, 9 high severity"],
  ["Retrieval Cost Agent", "Complete", "Modeled restore cost for every proposed transition"],
  ["Policy Agent", "Ready", "Generated 42 lifecycle rules as IaC"],
];

const executionPlan: [string, string, string, string][] = [
  ["1", "Apply lifecycle rules in dry-run mode", "3 days", "Automated"],
  ["2", "Notify data owners of pending transitions", "5 days", "Automated"],
  ["3", "Transition cold object data to IA", "7 days", "Automated"],
  ["4", "Transition archival data to Glacier tiers", "14 days", "Automated"],
  ["5", "Delete expired objects after legal sign-off", "3 days", "Manual gate"],
  ["6", "Reconcile storage cost against billing", "30 days", "Automated"],
];

const sparkData = Array.from({ length: 20 }, (_, i) => ({ x: i, y: Math.max(2, 40 - i * 1.8 + (i % 4) * 3) }));

export default function StorageDataLifecycleWorkspace() {
  const drawer = useDetailDrawer();
  const [tab, setTab] = useState<(typeof accessTabs)[number]>("By Last Accessed");
  const [selected, setSelected] = useState(dataSets[0]);
  const [mode, setMode] = useState<ViewMode>("exec");

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-6 py-6">
      <FinOpsHeader
        title="Storage & Data Lifecycle Workspace"
        tagline="Release $1.2M by matching data storage tiers to how the business actually uses the data."
        secondaryActions={[{ label: "Export Lifecycle Rules", icon: "export" }, { label: "Tiering Simulator", icon: "simulate" }]}
        meta={{ lastAnalysis: "31 minutes ago", freshness: "96.8% within SLA", resources: "1.84 PB catalogued" }}
        onPrimary={() => drawer.open({ title: "Storage analysis run", tone: "blue", rows: [["Data sets", "214"], ["Opportunities", "68"], ["Savings", "$612K/yr"]] })}
        onSecondary={(l) => drawer.open({ title: l, tone: "slate", bullets: ["Synthetic demonstration action."] })}
        extra={<span className="ml-auto"><ViewModeToggle mode={mode} onChange={setMode} /></span>}
      />

      <DomainContextBar headline="Opportunity in this domain: $1.2M · Confidence 88% · Risk Low" nextSlug="network-data-movement" nextLabel="Network & Data Movement" />

      <KpiStrip kpis={execKpis(kpis, mode)} onSelect={(k) => drawer.open({ title: k.label, subtitle: k.sub, tone: k.tone, rows: [["Value", k.value]] })} />

      <div className={mode === "exec" ? "grid gap-5" : "grid gap-5 xl:grid-cols-[1fr_1.3fr]"}>
        {/* 1 */}
        <Panel index={1} title="Storage inventory by tier">
          <DonutCard total="1.84 PB" totalLabel="Total storage" data={tiers} />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[["Monthly cost", "$284K"], ["Cost per TB", "$154"], ["Blended tier ratio", "1 : 2.1"]].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">{l}</div>
                <div className="text-lg font-bold text-slate-900">{v}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* 2 */}
        <FullOnly mode={mode}>
        <Panel index={2} title="Data access pattern analysis">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {accessTabs.map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={cn("rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                  tab === t ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300")}>
                {t}
              </button>
            ))}
          </div>
          <SimpleBars data={accessData[tab]} height={200} color="#6366f1" />
          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
            <span className="font-semibold">705 TB (38.3%)</span> has not been accessed in over one year yet still sits on hot storage tiers.
          </div>
        </Panel>
        </FullOnly>
      </div>

      <div className={mode === "exec" ? "grid gap-5" : "grid gap-5 xl:grid-cols-[1fr_1.3fr]"}>
        {/* 3 */}
        <FullOnly mode={mode}>
        <Panel index={3} title="Lifecycle policy coverage">
          <DonutCard total="93.2%" totalLabel="Compliance coverage" data={policyCoverage} />
        </Panel>
        </FullOnly>

        {/* 4 */}
        <Panel index={4} title="Cost optimization opportunities">
          <div className="grid gap-3 md:grid-cols-2">
            {opportunities.map((o) => {
              const t = toneMap[o.tone];
              return (
                <div key={o.title} className={cn("rounded-lg border p-3", t.bg, t.border)}>
                  <div className={cn("text-[12px] font-semibold", t.text)}>{o.title}</div>
                  <p className="mt-1 text-[11.5px] text-slate-600">{o.detail}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xl font-bold text-slate-900">{o.value}<span className="text-[11px] font-normal text-slate-500">/mo</span></span>
                    <button type="button" onClick={() => drawer.open({ title: o.title, subtitle: o.detail, tone: o.tone, rows: [["Monthly savings", o.value], ["Retrieval risk", "Modeled"], ["Rollback", "Restore to prior tier"]] })}
                      className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-700">Review</button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* 5 */}
      <FullOnly mode={mode}>
      <Panel index={5} title="Data set opportunity list">
        <DataTable head={<>
          <Th>Data set / bucket</Th><Th>Type</Th><Th>BU</Th><Th>Last accessed</Th><Th>Current tier</Th><Th>Optimal tier</Th>
          <Th right>Size</Th><Th right>Cost</Th><Th right>Savings</Th><Th right>Confidence</Th><Th right>Plan</Th>
        </>}>
          {dataSets.map((d) => (
            <tr key={d[0]} className={cn("cursor-pointer hover:bg-slate-50", selected[0] === d[0] && "bg-indigo-50/60")} onClick={() => setSelected(d)}>
              <Td className="font-medium text-slate-900">{d[0]}</Td>
              <Td>{d[1]}</Td><Td>{d[2]}</Td><Td>{d[3]}</Td><Td>{d[4]}</Td><Td className="font-medium text-emerald-700">{d[5]}</Td>
              <Td right>{d[6]}</Td><Td right>{d[7]}</Td>
              <Td right className="font-semibold text-emerald-700">{d[8]}</Td>
              <ConfidenceCell pct={d[9]} right />
              <Td right>
                <button type="button" onClick={(e) => { e.stopPropagation(); drawer.open({ title: `Transition plan · ${d[0]}`, tone: "emerald", rows: [["From", d[4]], ["To", d[5]], ["Size", d[6]], ["Savings", d[8]], ["Restore SLA", "12 hours"]] }); }}
                  className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-700">View Plan</button>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
      </FullOnly>

      <FullOnly mode={mode}>
      <div className="grid gap-5 xl:grid-cols-[1fr_1.3fr]">
        {/* 6 */}
        <Panel index={6} title="Data set details">
          <div className="text-[14px] font-bold text-slate-900">{selected[0]}</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge tone="slate">{selected[1]}</Badge>
            <Badge tone="blue">{selected[2]}</Badge>
            <Badge tone="amber">Last accessed {selected[3]}</Badge>
            <Badge tone="emerald">{selected[8]} saving</Badge>
          </div>
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Access pattern (20 weeks)</div>
            <Spark data={sparkData} color="#6366f1" height={56} />
          </div>
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Key insights</div>
            <ul className="mt-1 space-y-1">
              {["Access frequency has declined 94% since the pipeline was rearchitected.", "Only two service accounts have read this data in the last 6 months.", "Retention requirement is 7 years; deletion is not permitted.", "Restore cost modeled at $412 for a full one-time recall."].map((i) => (
                <li key={i} className="flex gap-1.5 text-[11.5px] text-slate-700"><span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />{i}</li>
              ))}
            </ul>
          </div>
        </Panel>

        {/* 7 */}
        <Panel index={7} title="Data lifecycle policy map">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr]">
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Classification</div>
              {[["Critical / regulated", "Retain 7 years, encrypted"], ["High business value", "Hot for 90 days"], ["Medium value", "Hot for 30 days"], ["Low value", "IA immediately"], ["Transient", "Expire after 30 days"]].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <div className="text-[12px] font-medium text-slate-900">{k}</div>
                  <div className="text-[11px] text-slate-600">{v}</div>
                </div>
              ))}
            </div>
            <div className="hidden items-center md:flex"><ArrowRight className="h-5 w-5 text-slate-300" /></div>
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Lifecycle actions</div>
              {[["Day 30", "Transition to Infrequent Access"], ["Day 90", "Transition to Glacier Instant"], ["Day 365", "Transition to Glacier Flexible"], ["Day 730", "Transition to Deep Archive"], ["Retention end", "Expire and delete"]].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
                  <div className="text-[12px] font-medium text-emerald-800">{k}</div>
                  <div className="text-[11px] text-slate-600">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
      </FullOnly>

      {/* 8 */}
      <FullOnly mode={mode}>
      <Panel index={8} title="Policy violations & risks">
        <DataTable head={<><Th>Violation</Th><Th>Data set</Th><Th right>Severity</Th><Th>Impact</Th><Th>Remediation</Th></>}>
          {policyViolations.map(([v, ds, sev, imp, rem]) => (
            <tr key={v} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-900">{v}</Td><Td>{ds}</Td>
              <Td right><Badge tone={sev === "High" ? "rose" : sev === "Medium" ? "amber" : "slate"}>{sev}</Badge></Td>
              <Td>{imp}</Td><Td>{rem}</Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
      </FullOnly>

      <FullOnly mode={mode}>
      <div className="grid gap-5 xl:grid-cols-2">
        {/* 9 */}
        <Panel index={9} title="Digital twin agent investigation">
          <DataTable head={<><Th>Agent</Th><Th>Status</Th><Th>Finding</Th></>}>
            {agentRows.map(([a, s, f]) => (
              <tr key={a} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">{a}</Td>
                <Td><Badge tone={s === "Complete" ? "emerald" : "blue"}>{s}</Badge></Td>
                <Td>{f}</Td>
              </tr>
            ))}
          </DataTable>
        </Panel>

        {/* 10 */}
        <Panel index={10} title="Execution plan">
          <DataTable head={<><Th>Step</Th><Th>Action</Th><Th right>Duration</Th><Th right>Mode</Th></>}>
            {executionPlan.map(([s, a, d, m]) => (
              <tr key={s} className="hover:bg-slate-50">
                <Td className="font-semibold text-slate-900">{s}</Td><Td>{a}</Td><Td right>{d}</Td>
                <Td right><Badge tone={m === "Automated" ? "emerald" : "amber"}>{m}</Badge></Td>
              </tr>
            ))}
          </DataTable>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => drawer.open({ title: "Lifecycle simulation", tone: "blue", rows: [["Data transitioned", "896 TB"], ["Monthly savings", "$51K"], ["Retrieval risk", "Low"], ["Restore exposure", "$4.2K/yr"]] })}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-700">Simulate</button>
            <button type="button" onClick={() => drawer.open({ title: "Submitted for approval", tone: "emerald", rows: [["Approvers", "Data Governance, FinOps"], ["SLA", "2 business days"]] })}
              className="rounded-md bg-slate-900 px-2.5 py-1.5 text-[11.5px] font-semibold text-white hover:bg-slate-800">Approve</button>
          </div>
        </Panel>
      </div>
      </FullOnly>

      <div className={mode === "exec" ? "grid gap-5" : "grid gap-5 xl:grid-cols-[1fr_1.4fr]"}>
        {/* 11 */}
        <FullOnly mode={mode}>
        <Panel index={11} title="Confidence & risk">
          <GaugeRing pct={89} label="Overall confidence" sub="Low risk" />
          <p className="mt-2 text-center text-[11.5px] text-slate-600">
            Retrieval cost, compliance holds, and owner confirmation modeled for every proposed transition.
          </p>
        </Panel>
        </FullOnly>

        {/* 12 */}
        <Panel index={12} title="Value realization tracker">
          <SavingsFunnel stages={[
            { label: "Identified", value: "$612K", pct: 100, tone: "blue" },
            { label: "Validated", value: "$498K", pct: 81, tone: "sky" },
            { label: "Approved", value: "$364K", pct: 59, tone: "amber" },
            { label: "Implemented", value: "$241K", pct: 39, tone: "violet" },
            { label: "Realized YTD", value: "$186K", pct: 30, tone: "emerald" },
          ]} title="Identified → Realized" />
        </Panel>
      </div>

      <PageBands lifecycle={lifecycleWithActive("Simulate")} />

      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </div>
  );
}
