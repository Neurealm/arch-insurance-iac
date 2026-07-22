import { useMemo, useState } from "react";
import { SectionCard, StatusPill } from "../components/primitives";
import { deploymentPatterns } from "../data";
import { Calculator, Info } from "lucide-react";

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
};

const defaults: Inputs = {
  pattern: "aks", size: "Enterprise", users: 5000, concurrent: 250, agents: 8,
  requestsPerDay: 40000, tokensPerRequest: 2400, kbGb: 250,
  availability: "HA", privateNet: true, dr: true, gpu: false,
};

export default function ResourceEstimator() {
  const [i, setI] = useState<Inputs>(defaults);
  const set = <K extends keyof Inputs>(k: K, v: Inputs[K]) => setI((s) => ({ ...s, [k]: v }));

  const out = useMemo(() => compute(i), [i]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <SectionCard title="Sizing inputs" subtitle="Adjust to model a specific customer environment">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select label="Deployment pattern" value={i.pattern} onChange={(v) => set("pattern", v)}
            options={deploymentPatterns.map((p) => ({ value: p.id, label: p.label }))} />
          <Select label="Environment size" value={i.size} onChange={(v) => set("size", v as Inputs["size"])}
            options={["Pilot", "Department", "Enterprise", "Large Enterprise"].map((s) => ({ value: s, label: s }))} />

          <NumberInput label="Number of users" value={i.users} onChange={(v) => set("users", v)} step={100} />
          <NumberInput label="Concurrent users" value={i.concurrent} onChange={(v) => set("concurrent", v)} step={10} />
          <NumberInput label="Number of agents" value={i.agents} onChange={(v) => set("agents", v)} step={1} />
          <NumberInput label="Requests / day" value={i.requestsPerDay} onChange={(v) => set("requestsPerDay", v)} step={1000} />
          <NumberInput label="Avg tokens / request" value={i.tokensPerRequest} onChange={(v) => set("tokensPerRequest", v)} step={100} />
          <NumberInput label="Knowledge base (GB)" value={i.kbGb} onChange={(v) => set("kbGb", v)} step={10} />

          <Select label="Availability" value={i.availability} onChange={(v) => set("availability", v as Inputs["availability"])}
            options={["Standard", "HA", "Mission Critical"].map((s) => ({ value: s, label: s }))} />

          <div className="flex items-end gap-3">
            <Toggle label="Private networking" value={i.privateNet} onChange={(v) => set("privateNet", v)} />
            <Toggle label="DR required" value={i.dr} onChange={(v) => set("dr", v)} />
            <Toggle label="GPU required" value={i.gpu} onChange={(v) => set("gpu", v)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Directional sizing output" subtitle="Planning estimator · validate through workload profiling"
        right={<StatusPill tone="indigo"><Calculator className="h-3 w-3 inline mr-1" />Directional</StatusPill>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <OutRow label="Estimated AKS node pools" value={out.nodes} />
          <OutRow label="Azure OpenAI throughput" value={out.openaiClass} />
          <OutRow label="Azure AI Search tier" value={out.searchTier} />
          <OutRow label="Cosmos DB / SQL sizing" value={out.dbTier} />
          <OutRow label="Storage tier" value={out.storage} />
          <OutRow label="Monitoring retention" value={out.retention} />
          <OutRow label="Integration complexity" value={out.integration} />
          <OutRow label="Implementation timeline" value={out.timeline} />
          <OutRow label="Operating model" value={out.opModel} />
          <OutRow label="Monthly tokens (est.)" value={out.monthlyTokens} />
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <p>
            This is a directional planning estimator. Actual sizing must be validated through workload profiling, pilot
            testing, security requirements, throughput testing, and customer-specific design decisions.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

function compute(i: Inputs) {
  const monthlyReq = i.requestsPerDay * 30;
  const monthlyTokens = monthlyReq * i.tokensPerRequest;
  const nodeCount = Math.max(3, Math.ceil(i.concurrent / 40) + (i.availability === "HA" ? 2 : i.availability === "Mission Critical" ? 4 : 0));
  const openai =
    monthlyTokens < 50_000_000 ? "Standard consumption (S0)" :
    monthlyTokens < 500_000_000 ? "Provisioned Throughput ~50–100 PTU" :
    "Provisioned Throughput 200+ PTU + fallback";
  const search =
    i.kbGb < 50 ? "Standard S1" :
    i.kbGb < 500 ? "Standard S2 + replicas" :
    "Standard S3 or Storage-optimized L1";
  const db =
    i.size === "Pilot" ? "Cosmos DB Serverless / SQL S3" :
    i.size === "Department" ? "Cosmos DB Autoscale 4k RU + SQL GP_Gen5_4" :
    i.size === "Enterprise" ? "Cosmos DB Autoscale 20k RU + SQL BC_Gen5_8" :
    "Cosmos DB Multi-region + SQL BC_Gen5_16";
  const storage = i.availability === "Mission Critical" ? "ZRS/GZRS Hot + archive" : "LRS Hot + Cool";
  const retention = i.availability === "Mission Critical" ? "13 months hot + archive" : i.availability === "HA" ? "90 days hot" : "30 days hot";
  const integration = i.agents <= 3 ? "Low" : i.agents <= 8 ? "Medium" : "High";
  const timelineWeeks =
    (i.size === "Pilot" ? 10 : i.size === "Department" ? 16 : i.size === "Enterprise" ? 22 : 30) +
    (i.privateNet ? 2 : 0) + (i.dr ? 3 : 0) + (i.pattern === "hybrid" ? 4 : 0);
  const opModel = i.size === "Pilot" ? "1 squad" : i.size === "Department" ? "2 squads + platform" : "3+ squads + platform + governance";

  const nodesLabel = `${nodeCount} system + ${Math.ceil(nodeCount * 1.5)} user nodes${i.gpu ? " + GPU pool (NC A100)" : ""}`;
  const timeline = `~${timelineWeeks} weeks to production`;
  const monthlyTokensLabel = `${(monthlyTokens / 1_000_000).toFixed(1)}M tokens/month`;

  return {
    nodes: nodesLabel, openaiClass: openai, searchTier: search, dbTier: db, storage,
    retention, integration, timeline, opModel, monthlyTokens: monthlyTokensLabel,
  };
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <div className="text-[11px] font-semibold text-slate-600 mb-1">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-400">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function NumberInput({ label, value, onChange, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; step?: number;
}) {
  return (
    <label className="block">
      <div className="text-[11px] font-semibold text-slate-600 mb-1">{label}</div>
      <input type="number" value={value} step={step} onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-400" />
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px] transition ${
        value ? "border-indigo-500 bg-indigo-50 text-indigo-800" : "border-slate-300 bg-white text-slate-600"
      }`}>
      <span className={`h-2.5 w-2.5 rounded-full ${value ? "bg-indigo-500" : "bg-slate-300"}`} />
      {label}
    </button>
  );
}

function OutRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-2.5">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-[13px] font-medium text-slate-900 mt-0.5">{value}</div>
    </div>
  );
}
