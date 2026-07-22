import { useMemo, useState } from "react";
import {
  SectionCard, StatusPill, DetailDrawer, DetailBlock, Legend,
  toneAccent, toneMap,
} from "../components/primitives";
import { deploymentPatterns } from "../data";
import { Calculator, Info, DollarSign, Server, Brain, Database, HardDrive, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";

type Inputs = {
  pattern: string;
  size: "Pilot" | "Department" | "Enterprise" | "Large Enterprise";
  users: number;
  concurrent: number;
  agents: number;
  requestsPerDay: number;
  tokensPerRequest: number;
  kbGb: number;
  availability: "Standard" | "HA" | "Mission Critical";
  privateNet: boolean;
  dr: boolean;
  gpu: boolean;
  ptu: boolean;
};

const defaults: Inputs = {
  pattern: "aks", size: "Enterprise", users: 5000, concurrent: 250, agents: 8,
  requestsPerDay: 40000, tokensPerRequest: 2400, kbGb: 250,
  availability: "HA", privateNet: true, dr: true, gpu: false, ptu: false,
};

const sizePresets: Record<Inputs["size"], Partial<Inputs>> = {
  Pilot:             { users: 500,   concurrent: 25,  agents: 3,  requestsPerDay: 4000,   kbGb: 25 },
  Department:        { users: 2500,  concurrent: 120, agents: 5,  requestsPerDay: 15000,  kbGb: 100 },
  Enterprise:        { users: 5000,  concurrent: 250, agents: 8,  requestsPerDay: 40000,  kbGb: 250 },
  "Large Enterprise":{ users: 25000, concurrent: 900, agents: 14, requestsPerDay: 200000, kbGb: 1200 },
};

export default function ResourceEstimator() {
  const [i, setI] = useState<Inputs>(defaults);
  const set = <K extends keyof Inputs>(k: K, v: Inputs[K]) => setI((s) => ({ ...s, [k]: v }));
  const applySizePreset = (size: Inputs["size"]) =>
    setI((s) => ({ ...s, size, ...sizePresets[size] }));

  const out = useMemo(() => compute(i), [i]);

  const costData = [
    { name: "AI Services",   value: out.costBreakdown.ai,     tone: "amber"   },
    { name: "Compute",       value: out.costBreakdown.compute, tone: "indigo" },
    { name: "Data",          value: out.costBreakdown.data,    tone: "blue"   },
    { name: "Networking",    value: out.costBreakdown.net,     tone: "rose"   },
    { name: "Observability", value: out.costBreakdown.obs,     tone: "teal"   },
    { name: "Security",      value: out.costBreakdown.sec,     tone: "violet" },
  ];

  const toneHex: Record<string, string> = {
    amber: "#f59e0b", indigo: "#6366f1", blue: "#3b82f6",
    rose: "#f43f5e", teal: "#14b8a6", violet: "#8b5cf6",
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
      <div className="space-y-4">
        {/* Headline output row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <BigStat icon={DollarSign} label="Est. monthly Azure cost" value={out.monthlyCostLabel} sub={out.costBand} tone={out.costBandTone} />
          <BigStat icon={Brain}       label="Monthly tokens" value={out.monthlyTokensLabel} sub={out.tokenNote} tone="amber" />
          <BigStat icon={Server}      label="Compute footprint" value={out.nodesShort} sub={out.opModel} tone="indigo" />
          <BigStat icon={Clock}       label="To production" value={out.timeline} sub={`${out.integration} integration complexity`} tone="teal" />
        </div>

        <SectionCard
          title="Sizing inputs"
          subtitle="Adjust to model a specific customer environment. Outputs update live."
          right={
            <button
              onClick={() => setI(defaults)}
              className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-[11.5px] text-slate-600 hover:border-slate-400"
            >
              Reset to defaults
            </button>
          }
        >
          {/* Size presets */}
          <div className="mb-4">
            <FieldLabel icon={Users}>Environment size · quick preset</FieldLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1.5">
              {(Object.keys(sizePresets) as Inputs["size"][]).map((s) => (
                <button
                  key={s}
                  onClick={() => applySizePreset(s)}
                  className={cn(
                    "rounded-md border-2 px-3 py-2 text-[12px] font-medium transition",
                    i.size === s
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-400",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <Slider label="Number of users" value={i.users} min={100} max={50000} step={100}
              onChange={(v) => set("users", v)} format={(v) => v.toLocaleString()} />
            <Slider label="Concurrent users at peak" value={i.concurrent} min={10} max={2000} step={10}
              onChange={(v) => set("concurrent", v)} format={(v) => v.toLocaleString()} />
            <Slider label="Number of specialist agents" value={i.agents} min={1} max={20} step={1}
              onChange={(v) => set("agents", v)} />
            <Slider label="Requests per day" value={i.requestsPerDay} min={500} max={500000} step={500}
              onChange={(v) => set("requestsPerDay", v)} format={(v) => v.toLocaleString()} />
            <Slider label="Avg tokens per request" value={i.tokensPerRequest} min={500} max={16000} step={100}
              onChange={(v) => set("tokensPerRequest", v)} format={(v) => `${v.toLocaleString()} tok`} />
            <Slider label="Knowledge base size" value={i.kbGb} min={5} max={5000} step={5}
              onChange={(v) => set("kbGb", v)} format={(v) => `${v.toLocaleString()} GB`} />

            <Select label="Deployment pattern" value={i.pattern} onChange={(v) => set("pattern", v)}
              options={deploymentPatterns.map((p) => ({ value: p.id, label: p.label }))} />
            <Select label="Availability tier" value={i.availability} onChange={(v) => set("availability", v as Inputs["availability"])}
              options={["Standard", "HA", "Mission Critical"].map((s) => ({ value: s, label: s }))} />

            <div className="md:col-span-2">
              <FieldLabel>Platform options</FieldLabel>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <Toggle label="Private networking (Private Endpoints)" value={i.privateNet} onChange={(v) => set("privateNet", v)} />
                <Toggle label="Multi-region DR" value={i.dr} onChange={(v) => set("dr", v)} />
                <Toggle label="GPU pool for fine-tuning" value={i.gpu} onChange={(v) => set("gpu", v)} />
                <Toggle label="Provisioned Throughput (PTU)" value={i.ptu} onChange={(v) => set("ptu", v)} />
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Directional Azure sizing" subtitle="Validate through workload profiling before commitment.">
            <div className="space-y-1.5">
              <OutRow icon={Server}   label="AKS node pools"            value={out.nodes} />
              <OutRow icon={Brain}    label="Azure OpenAI throughput"   value={out.openaiClass} />
              <OutRow icon={Database} label="Azure AI Search tier"       value={out.searchTier} />
              <OutRow icon={Database} label="Cosmos DB / SQL sizing"     value={out.dbTier} />
              <OutRow icon={HardDrive}label="Storage tier"                value={out.storage} />
              <OutRow icon={Clock}    label="Monitoring retention"        value={out.retention} />
            </div>
          </SectionCard>

          <SectionCard title="Monthly cost mix" subtitle={`Estimated ${out.monthlyCostLabel} · directional`}>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    formatter={(v: number) => `$${v.toLocaleString()}`}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {costData.map((d) => <Cell key={d.name} fill={toneHex[d.tone]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Cost mix shifts to AI Services above ~250M tokens/month. Enabling PTU flattens per-token cost at the price of upfront commit.
            </p>
          </SectionCard>
        </div>

        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-900">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            Directional planning estimator. Actual sizing must be validated through workload profiling, pilot testing,
            security requirements, throughput testing, and customer-specific design decisions. Prices are indicative Azure
            list pricing and vary by region, discounts, and reservations.
          </p>
        </div>
      </div>

      {/* Right — assumptions drawer */}
      <div>
        <DetailDrawer title="How this estimate is built" subtitle="Assumptions and formulas" tone="indigo">
          <StatusPill tone="indigo">Transparent</StatusPill>
          <DetailBlock label="Traffic" items={[
            `Monthly requests = requests/day × 30 = ${(i.requestsPerDay * 30).toLocaleString()}`,
            `Monthly tokens = requests × avg tokens = ${out.monthlyTokensLabel}`,
            `Concurrent load drives node pool sizing`,
          ]} tone="indigo" />
          <DetailBlock label="AI service tier" items={[
            i.ptu
              ? "PTU flattens per-token cost — use when tokens > 100M/month and latency SLO is tight"
              : "Consumption pricing — best below 100M tokens/month or during pilot",
            "Content Safety and Groundedness evaluated on every response",
            "Fall-back route mandatory for every model class",
          ]} tone="amber" />
          <DetailBlock label="Cost impact drivers" items={[
            `AI Services: ${((out.costBreakdown.ai / out.monthlyCost) * 100).toFixed(0)}% of monthly spend`,
            `Availability tier: ${i.availability} adds ${i.availability === "Mission Critical" ? "40" : i.availability === "HA" ? "18" : "0"}% to compute`,
            `DR ${i.dr ? "adds ~25% for secondary region" : "off — single-region only"}`,
            `Private networking ${i.privateNet ? "adds Private Endpoints (~$10/PE/mo)" : "off — public endpoints (not recommended)"}`,
          ]} tone="rose" />
          <DetailBlock label="What this does NOT include" items={[
            "Data ingestion and egress from on-prem",
            "Third-party SaaS license fees",
            "Professional services and change management",
            "Reserved-instance or EA discounts",
          ]} tone="slate" />
        </DetailDrawer>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Compute                                                                     */
/* -------------------------------------------------------------------------- */

function compute(i: Inputs) {
  const monthlyReq = i.requestsPerDay * 30;
  const monthlyTokens = monthlyReq * i.tokensPerRequest;

  const availMult = i.availability === "Mission Critical" ? 1.4 : i.availability === "HA" ? 1.18 : 1;
  const drMult    = i.dr ? 1.25 : 1;

  const baseNodes = Math.max(3, Math.ceil(i.concurrent / 40));
  const nodeCount = Math.ceil(baseNodes * availMult);

  const openaiClass =
    i.ptu ? `Provisioned Throughput ${monthlyTokens < 100_000_000 ? "25–50" : monthlyTokens < 500_000_000 ? "50–150" : "200+"} PTU`
    : monthlyTokens < 50_000_000 ? "Standard consumption (S0)"
    : monthlyTokens < 500_000_000 ? "Consumption with autoscale"
    : "Consumption + PTU fall-back (recommended)";

  const searchTier =
    i.kbGb < 50 ? "Standard S1"
    : i.kbGb < 500 ? "Standard S2 + replicas"
    : "Standard S3 or Storage-optimized L1";

  const dbTier =
    i.size === "Pilot" ? "Cosmos DB Serverless + SQL S3"
    : i.size === "Department" ? "Cosmos Autoscale 4k RU + SQL GP_Gen5_4"
    : i.size === "Enterprise" ? "Cosmos Autoscale 20k RU + SQL BC_Gen5_8"
    : "Cosmos Multi-region + SQL BC_Gen5_16";

  const storage = i.availability === "Mission Critical" ? "ZRS/GZRS Hot + archive" : "LRS Hot + Cool";
  const retention = i.availability === "Mission Critical" ? "13 months hot + archive" : i.availability === "HA" ? "90 days hot" : "30 days hot";
  const integration = i.agents <= 3 ? "Low" : i.agents <= 8 ? "Medium" : "High";

  const timelineWeeks =
    (i.size === "Pilot" ? 10 : i.size === "Department" ? 16 : i.size === "Enterprise" ? 22 : 30)
    + (i.privateNet ? 2 : 0) + (i.dr ? 3 : 0) + (i.pattern === "hybrid" ? 4 : 0);
  const opModel = i.size === "Pilot" ? "1 squad" : i.size === "Department" ? "2 squads + platform" : "3+ squads + platform + governance";

  // Cost model — directional USD/month
  const aiCost = Math.round(
    i.ptu
      ? Math.max(15000, monthlyTokens / 1_000_000 * 60)
      : monthlyTokens / 1_000_000 * (i.tokensPerRequest > 4000 ? 12 : 8),
  );
  const computeCost = Math.round(nodeCount * (i.gpu ? 3200 : 620) * drMult);
  const dataCost    = Math.round(
    (i.kbGb * 0.5) + // storage
    (i.size === "Pilot" ? 400 : i.size === "Department" ? 1200 : i.size === "Enterprise" ? 4200 : 12000)
    * (i.dr ? 1.5 : 1),
  );
  const netCost     = Math.round((i.privateNet ? 900 : 200) + (i.pattern === "hybrid" ? 2200 : 800));
  const obsCost     = Math.round(monthlyReq / 1000 * 0.6 + 400);
  const secCost     = Math.round(400 + (i.availability === "Mission Critical" ? 800 : 200));

  const monthlyCost = aiCost + computeCost + dataCost + netCost + obsCost + secCost;
  const monthlyCostLabel = `$${(monthlyCost / 1000).toFixed(1)}k / mo`;

  const costBand =
    monthlyCost < 15_000 ? "Pilot band"
    : monthlyCost < 60_000 ? "Department band"
    : monthlyCost < 200_000 ? "Enterprise band"
    : "Large-enterprise band";
  const costBandTone =
    monthlyCost < 15_000 ? "teal"
    : monthlyCost < 60_000 ? "indigo"
    : monthlyCost < 200_000 ? "amber"
    : "rose";

  const monthlyTokensLabel = `${(monthlyTokens / 1_000_000).toFixed(1)}M tokens/mo`;
  const tokenNote = i.ptu ? "PTU billing" : "Consumption billing";

  const nodesLabel = `${nodeCount} system + ${Math.ceil(nodeCount * 1.5)} user nodes${i.gpu ? " + GPU pool" : ""}`;
  const nodesShort = `${nodeCount + Math.ceil(nodeCount * 1.5)}${i.gpu ? " + GPU" : ""} nodes`;
  const timeline = `~${timelineWeeks} wks to prod`;

  return {
    nodes: nodesLabel, nodesShort, openaiClass, searchTier, dbTier, storage,
    retention, integration, timeline, opModel,
    monthlyTokensLabel, tokenNote,
    monthlyCost, monthlyCostLabel, costBand, costBandTone,
    costBreakdown: { ai: aiCost, compute: computeCost, data: dataCost, net: netCost, obs: obsCost, sec: secCost },
  };
}

/* -------------------------------------------------------------------------- */
/*  Field controls                                                              */
/* -------------------------------------------------------------------------- */

function FieldLabel({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) {
  return (
    <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-700">
      {Icon && <Icon className="h-3.5 w-3.5 text-slate-500" />}
      {children}
    </div>
  );
}

function Slider({
  label, value, onChange, min, max, step = 1, format,
}: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; format?: (v: number) => string }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <span className="text-[12px] font-semibold text-slate-900 tabular-nums">
          {format ? format(value) : value.toLocaleString()}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2 accent-slate-900"
      />
      <div className="flex justify-between text-[10.5px] text-slate-400 mt-0.5 tabular-nums">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </label>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px] transition",
        value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
      )}>
      <span className={cn("h-2 w-2 rounded-full", value ? "bg-white" : "bg-slate-300")} />
      {label}
    </button>
  );
}

function OutRow({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-2.5">
      {Icon && (
        <div className="h-8 w-8 rounded-md bg-slate-100 grid place-items-center shrink-0">
          <Icon className="h-3.5 w-3.5 text-slate-600" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-[13px] font-medium text-slate-900 mt-0.5 truncate">{value}</div>
      </div>
    </div>
  );
}

function BigStat({ icon: Icon, label, value, sub, tone }: { icon: any; label: string; value: string; sub?: string; tone: string }) {
  return (
    <div className={cn("rounded-xl border p-4 shadow-sm bg-white flex items-start gap-3")}>
      <div className={cn("h-10 w-10 rounded-lg grid place-items-center shrink-0", toneMap[tone])}>
        <Icon className={cn("h-5 w-5", toneAccent[tone])} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-[20px] font-bold text-slate-900 leading-tight mt-0.5">{value}</div>
        {sub && <div className="text-[11.5px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
