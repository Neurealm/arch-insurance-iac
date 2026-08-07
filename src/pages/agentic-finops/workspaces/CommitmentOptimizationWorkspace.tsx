import { useState } from "react";
import {
  DollarSign, Percent, PiggyBank, AlertTriangle, CalendarClock, TrendingUp, Repeat, Activity, CheckCircle2,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import FinOpsHeader from "../components/FinOpsHeader";
import PageBands, { lifecycleWithActive } from "../components/PageBands";
import { DomainContextBar } from "../components/bands";
import SavingsFunnel from "../components/SavingsFunnel";
import {
  Panel, Badge, KpiStrip, DataTable, Th, Td, DonutCard, DetailDrawer, ConfidenceCell,
  useDetailDrawer, CostDriverBars, type Kpi, ViewModeToggle, FullOnly, execKpis, type ViewMode,
} from "../components/primitives";

const kpis: Kpi[] = [
  { id: "od", icon: DollarSign, label: "Total On-Demand Spend", value: "$3.62M", sub: "annualized", tone: "blue" },
  { id: "cov", icon: Percent, label: "Commitment Coverage", value: "71.4%", sub: "target 85%", tone: "sky" },
  { id: "disc", icon: PiggyBank, label: "Effective Discount Rate", value: "28.7%", sub: "blended", tone: "emerald" },
  { id: "under", icon: AlertTriangle, label: "Underutilized Commitments", value: "$826K", sub: "at risk of waste", tone: "amber" },
  { id: "exp", icon: CalendarClock, label: "Expiring Commitments", value: "$1.24M", sub: "next 90 days", tone: "rose" },
  { id: "pot", icon: TrendingUp, label: "Potential Annual Savings", value: "$2.31M", sub: "if rebalanced", tone: "emerald" },
  { id: "reb", icon: Repeat, label: "Rebalance Actions", value: "7", sub: "recommended now", tone: "violet" },
  { id: "health", icon: Activity, label: "Optimization Health", value: "Good", sub: "coverage trending up", tone: "teal" },
];

const mix = [
  { name: "Compute Savings Plans", value: 42, display: "$4.21M" },
  { name: "Reserved Instances — Compute", value: 24, display: "$2.40M" },
  { name: "Reserved Instances — RDS", value: 15, display: "$1.50M" },
  { name: "Reserved Instances — Other", value: 9, display: "$902K" },
  { name: "Marketplace / CUDs", value: 10, display: "$1.01M" },
];

const coverageTrend = Array.from({ length: 12 }, (_, i) => ({
  label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  coverage: [58, 61, 63, 62, 65, 66, 68, 69, 70, 70, 71, 71.4][i],
  target: 85,
}));

const byService: [string, string, string, string, string, string][] = [
  ["EC2", "$4.86M", "$3.71M", "76.3%", "$1.15M", "$412K"],
  ["Lambda", "$0.62M", "$0.31M", "50.0%", "$0.31M", "$61K"],
  ["EBS", "$1.14M", "$0.74M", "64.9%", "$0.40M", "$48K"],
  ["RDS", "$2.28M", "$1.79M", "78.5%", "$0.49M", "$186K"],
  ["ECS / Fargate", "$0.94M", "$0.52M", "55.3%", "$0.42M", "$97K"],
  ["ElastiCache", "$0.71M", "$0.49M", "69.0%", "$0.22M", "$44K"],
  ["S3", "$1.36M", "$0.86M", "63.2%", "$0.50M", "$52K"],
  ["Others", "$0.89M", "$0.44M", "49.4%", "$0.45M", "$38K"],
];

const expiration = [
  { label: "0–30 days", atRisk: 410, recommitted: 190 },
  { label: "31–60 days", atRisk: 260, recommitted: 180 },
  { label: "61–90 days", atRisk: 130, recommitted: 70 },
];

const rebalance: [string, string, string, string][] = [
  ["Compute Savings Plan (1yr, $18/hr)", "Compute Savings Plan (3yr, $22/hr)", "+$486K", "up"],
  ["RI — m5.2xlarge × 120 (expiring)", "Do not renew — migrate to Graviton SP", "+$318K", "up"],
  ["RI — RDS db.r5.4xlarge × 18", "RI — RDS db.r6g.4xlarge × 16", "+$241K", "up"],
  ["No commitment on Fargate", "Compute Savings Plan (1yr, $4/hr)", "+$97K", "up"],
  ["RI — c5.9xlarge × 22 (idle 41%)", "Sell / convert to Convertible RI", "+$186K", "up"],
  ["Marketplace CUD — analytics", "Extend 12 months", "+$64K", "up"],
  ["Over-committed ElastiCache RI", "Reduce by 6 nodes at renewal", "-$28K", "down"],
];

const forecast = Array.from({ length: 12 }, (_, i) => ({
  label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  eligible: 280 + i * 9 + (i > 9 ? 40 : 0),
  committed: 210 + i * 5,
}));

const evidenceFactors = [
  { name: "Usage stability (90d)", value: 94, display: "94%" },
  { name: "Forecast confidence", value: 86, display: "86%" },
  { name: "Instance family stability", value: 78, display: "78%" },
  { name: "Migration plan certainty", value: 63, display: "63%" },
  { name: "Business growth signal", value: 71, display: "71%" },
];

const lowestUtilized: [string, string, string, string][] = [
  ["RI — c5.9xlarge × 22", "Compute", "59%", "$186K"],
  ["RI — RDS db.r5.4xlarge × 18", "Database", "64%", "$142K"],
  ["Savings Plan — legacy $6/hr", "Compute", "68%", "$118K"],
  ["RI — ElastiCache r5.2xlarge × 12", "Cache", "71%", "$96K"],
  ["Marketplace CUD — analytics", "Analytics", "74%", "$74K"],
];

const whatIf: [string, string, string, string, string][] = [
  ["Do nothing", "71.4%", "28.7%", "$0", "Low"],
  ["Renew like-for-like", "74.2%", "29.4%", "+$612K", "Low"],
  ["Recommended rebalance", "86.1%", "34.8%", "+$2.31M", "Low"],
  ["Aggressive 3-year all-upfront", "93.5%", "39.2%", "+$3.06M", "High"],
  ["Coverage freeze (cash preservation)", "62.0%", "25.1%", "-$418K", "Medium"],
];

export default function CommitmentOptimizationWorkspace() {
  const drawer = useDetailDrawer();
  const [mode, setMode] = useState<ViewMode>("exec");

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-6 py-6">
      <FinOpsHeader
        title="Commitment Optimization Workspace"
        tagline="Capture $1.6M by aligning commitment coverage to real, forecasted demand."
        secondaryActions={[{ label: "Export Commitment Plan", icon: "export" }, { label: "What-If Simulator", icon: "simulate" }]}
        meta={{ lastAnalysis: "22 minutes ago", freshness: "97.6% within SLA", resources: "$10.04M committed portfolio" }}
        onPrimary={() => drawer.open({ title: "Commitment analysis run", tone: "blue", rows: [["Coverage", "71.4%"], ["Rebalance actions", "7"], ["Net opportunity", "$2.31M"]] })}
        onSecondary={(l) => drawer.open({ title: l, tone: "slate", bullets: ["Synthetic demonstration action."] })}
        extra={<span className="ml-auto"><ViewModeToggle mode={mode} onChange={setMode} /></span>}
      />

      <DomainContextBar headline="Opportunity in this domain: $1.6M · Confidence 89% · Risk Medium" nextSlug="elasticity-scheduling" nextLabel="Elasticity & Scheduling" />

      <KpiStrip kpis={execKpis(kpis, mode)} onSelect={(k) => drawer.open({ title: k.label, subtitle: k.sub, tone: k.tone, rows: [["Value", k.value], ["Source", "Commitment agent"]] })} />

      {/* 1 */}
      <Panel index={1} title="Commitment portfolio overview">
        <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr_0.8fr]">
          <DonutCard data={mix} total="$10.04M" totalLabel="Committed spend" />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Coverage trend vs target</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={coverageTrend} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <ReferenceLine y={85} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Target 85%", fontSize: 10, fill: "#10b981", position: "insideTopRight" }} />
                <Line type="monotone" dataKey="coverage" name="Coverage %" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
            {[
              ["Effective discount", "28.7%", "emerald"],
              ["Blended coverage", "71.4%", "blue"],
              ["Savings realized YTD", "$2.88M", "emerald"],
              ["Waste from underuse", "$826K", "amber"],
            ].map(([l, v, tone]) => (
              <div key={l} className={cn("rounded-lg border p-3", tone === "emerald" ? "border-emerald-200 bg-emerald-50" : tone === "amber" ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50")}>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">{l}</div>
                <div className="text-2xl font-bold leading-tight text-slate-900">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* 2 */}
      <FullOnly mode={mode}>
      <Panel index={2} title="Commitment coverage by service">
        <DataTable head={<>
          <Th>Service</Th><Th right>Eligible spend</Th><Th right>Covered</Th><Th right>Coverage %</Th><Th right>On-demand</Th><Th right>Potential savings</Th>
        </>}>
          {byService.map(([svc, eligible, covered, pct, od, pot]) => {
            const num = parseFloat(pct);
            return (
              <tr key={svc} className="cursor-pointer hover:bg-slate-50" onClick={() => drawer.open({ title: `${svc} commitment coverage`, tone: "blue", rows: [["Eligible spend", eligible], ["Covered", covered], ["Coverage", pct], ["On-demand", od], ["Potential savings", pot]] })}>
                <Td className="font-medium text-slate-900">{svc}</Td>
                <Td right>{eligible}</Td><Td right>{covered}</Td>
                <Td right><span className={cn("font-semibold", num >= 75 ? "text-emerald-700" : num >= 60 ? "text-amber-700" : "text-rose-700")}>{pct}</span></Td>
                <Td right>{od}</Td>
                <Td right className="font-semibold text-emerald-700">{pot}</Td>
              </tr>
            );
          })}
        </DataTable>
      </Panel>
      </FullOnly>

      <div className={mode === "exec" ? "grid gap-5" : "grid gap-5 xl:grid-cols-[1.4fr_1fr]"}>
        {/* 3 */}
        <FullOnly mode={mode}>
        <Panel index={3} title="Commitment expiration schedule">
          <div className="mb-2 flex flex-wrap items-end gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">Expiring next 90 days</div>
              <div className="text-3xl font-bold leading-none text-rose-700">$1.24M</div>
            </div>
            <div className="text-[11.5px] text-slate-500">$800K at risk of lapsing to on-demand pricing</div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={expiration} margin={{ top: 8, right: 10, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="atRisk" name="At risk ($K)" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
              <Bar dataKey="recommitted" name="Recommitted ($K)" stackId="a" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        </FullOnly>

        <Panel index="3b" title="Decision summary">
          <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Recommendation</div>
            <div className="mt-1 text-[16px] font-bold text-slate-900">Rebalance commitments</div>
            <p className="mt-1 text-[12px] text-slate-700">
              Shift expiring x86 reservations into a 3-year Graviton-weighted Savings Plan and reduce over-committed cache capacity.
            </p>
            <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Key actions</div>
            <ul className="mt-1 space-y-1">
              {["Do not renew 120 expiring m5 reservations", "Purchase 3-year Compute Savings Plan at $22/hr", "Convert 22 idle c5.9xlarge RIs", "Add $4/hr Fargate coverage", "Trim 6 ElastiCache nodes at renewal"].map((a) => (
                <li key={a} className="flex gap-1.5 text-[11.5px] text-slate-700"><CheckCircle2 className="mt-[2px] h-3 w-3 shrink-0 text-emerald-500" />{a}</li>
              ))}
            </ul>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Decision confidence</span>
              <span className="text-[18px] font-bold text-emerald-700">88%</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* 4 */}
      <Panel index={4} title="Recommended commitment rebalance plan">
        <DataTable head={<><Th>Current state</Th><Th>Future state</Th><Th right>Annual impact</Th></>}>
          {rebalance.map(([cur, fut, impact, dir]) => (
            <tr key={cur} className="hover:bg-slate-50">
              <Td>{cur}</Td><Td className="font-medium text-slate-900">{fut}</Td>
              <Td right className={dir === "up" ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>{impact}</Td>
            </tr>
          ))}
          <tr className="bg-slate-50">
            <Td className="font-semibold text-slate-900">Net portfolio impact</Td><Td>{""}</Td><Td right className="text-[14px] font-bold text-emerald-700">+$2.31M</Td>
          </tr>
        </DataTable>
      </Panel>

      <FullOnly mode={mode}>
      <div className="grid gap-5 xl:grid-cols-2">
        {/* 5 */}
        <Panel index={5} title="Demand forecast & eligible spend">
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={forecast} margin={{ top: 8, right: 10, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="eligible" name="Eligible spend ($K)" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="committed" name="Committed ($K)" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Drivers</div>
            <ul className="mt-1 space-y-1">
              {["Commerce platform growth of 14% year over year", "Graviton migration reduces x86 eligible spend by 22%", "Q4 seasonal peak lifts eligible spend by $40K/month", "Two workloads move to managed services in Q3"].map((d) => (
                <li key={d} className="flex gap-1.5 text-[11.5px] text-slate-700"><span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />{d}</li>
              ))}
            </ul>
          </div>
        </Panel>

        {/* 6 */}
        <Panel index={6} title="Confidence & evidence">
          <DonutCard total="82%" totalLabel="Evidence completeness" data={[
            { name: "Available", value: 82, display: "82%", color: "#10b981" },
            { name: "Missing", value: 18, display: "18%", color: "#e2e8f0" },
          ]} />
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Top evidence factors</div>
            <div className="mt-2"><CostDriverBars data={evidenceFactors} /></div>
          </div>
        </Panel>
      </div>
      </FullOnly>

      <FullOnly mode={mode}>
      <div className="grid gap-5 xl:grid-cols-2">
        {/* 7 */}
        <Panel index={7} title="Commitment utilization health">
          <DonutCard total="91.4%" totalLabel="Blended utilization" data={[
            { name: "Fully utilized", value: 74, display: "74%", color: "#10b981" },
            { name: "Partially utilized", value: 18, display: "18%", color: "#f59e0b" },
            { name: "Underutilized", value: 8, display: "8%", color: "#ef4444" },
          ]} />
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Lowest utilized commitments</div>
            <DataTable head={<><Th>Commitment</Th><Th>Category</Th><Th right>Utilization</Th><Th right>Waste</Th></>}>
              {lowestUtilized.map(([c, cat, util, waste]) => (
                <tr key={c} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-900">{c}</Td><Td>{cat}</Td>
                  <Td right className="font-semibold text-amber-700">{util}</Td>
                  <Td right className="font-semibold text-rose-700">{waste}</Td>
                </tr>
              ))}
            </DataTable>
          </div>
        </Panel>

        {/* 8 */}
        <Panel index={8} title="What-if scenario simulation">
          <DataTable head={<><Th>Scenario</Th><Th right>Coverage</Th><Th right>Discount</Th><Th right>Annual impact</Th><Th right>Risk</Th></>}>
            {whatIf.map(([s, cov, disc, impact, risk]) => (
              <tr key={s} className={cn("hover:bg-slate-50", s === "Recommended rebalance" && "bg-emerald-50")}>
                <Td className="font-medium text-slate-900">{s}</Td>
                <Td right>{cov}</Td><Td right>{disc}</Td>
                <Td right className={impact.startsWith("-") ? "font-semibold text-rose-700" : "font-semibold text-emerald-700"}>{impact}</Td>
                <Td right><Badge tone={risk === "High" ? "rose" : risk === "Medium" ? "amber" : "emerald"}>{risk}</Badge></Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>
      </FullOnly>

      <FullOnly mode={mode}>
      <div className="grid gap-5 xl:grid-cols-2">
        {/* 9 */}
        <Panel index={9} title="Governance & approval">
          <dl className="space-y-1 text-[12px]">
            {[["Policy", "FIN-CMT-04 · Commitment purchase governance"], ["Approval required", "FinOps Lead + Finance Controller"], ["Threshold", "Purchases above $250K annualized"], ["Current status", "Draft — awaiting submission"], ["Approval SLA", "1.8 hours (median)"]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-slate-100 py-1.5">
                <dt className="text-slate-500">{k}</dt><dd className="text-right font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => drawer.open({ title: "Submitted for approval", tone: "emerald", rows: [["Approvers", "FinOps Lead, Finance Controller"], ["Expected decision", "Within 2 business hours"]] })}
              className="rounded-md bg-slate-900 px-2.5 py-1.5 text-[11.5px] font-semibold text-white hover:bg-slate-800">Submit for Approval</button>
            <button type="button" onClick={() => drawer.open({ title: "Draft saved", tone: "slate" })}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-700">Save as Draft</button>
          </div>
        </Panel>

        {/* 10 */}
        <Panel index={10} title="Value realization tracker">
          <SavingsFunnel stages={[
            { label: "Identified", value: "$2.31M", pct: 100, tone: "blue" },
            { label: "Validated", value: "$2.04M", pct: 88, tone: "sky" },
            { label: "Approved", value: "$1.62M", pct: 70, tone: "amber" },
            { label: "Implemented", value: "$1.18M", pct: 51, tone: "violet" },
            { label: "Realized", value: "$0.92M", pct: 40, tone: "emerald" },
          ]} title="Identified → Realized" />
        </Panel>
      </div>
      </FullOnly>

      <PageBands lifecycle={lifecycleWithActive("Govern")} />

      <DetailDrawer payload={drawer.payload} onClose={drawer.close} />
    </div>
  );
}
