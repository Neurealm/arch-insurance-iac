import { useState } from "react";
import { ArrowRight, Bot } from "lucide-react";
import { SectionCard, DetailDrawer, DetailBlock, StatusPill } from "../components/primitives";
import { agents } from "../data";

const pipeline = [
  "User Request", "Intent Understanding", "Planner / Router", "Coordinator Agent",
  "Specialist Agents", "Tool Gateway", "Enterprise Systems", "Validator",
  "Human Approval", "Response",
];

const useCases = [
  "Password reset", "Incident triage", "Change impact analysis",
  "Vulnerability remediation", "Certificate lifecycle management",
  "NOC operations", "Service request fulfillment", "Knowledge search and summarization",
];

export default function MultiAgentRuntime() {
  const [selId, setSelId] = useState<string>("sd");
  const sel = agents.find((a) => a.id === selId)!;
  const riskTone = sel.risk === "High" ? "rose" : sel.risk === "Medium" ? "amber" : "emerald";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
      <div className="space-y-4">
        <SectionCard title="Runtime pipeline" subtitle="A single request travels this path — every hop is observable">
          <div className="flex flex-wrap items-center gap-1.5">
            {pipeline.map((p, i) => (
              <div key={p} className="flex items-center gap-1.5">
                <div className="rounded-lg border border-indigo-200 bg-gradient-to-b from-white to-indigo-50 px-2.5 py-1.5 text-[12px] font-medium text-indigo-800">
                  <span className="text-indigo-400 mr-1">{i + 1}</span>{p}
                </div>
                {i < pipeline.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-300" />}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Specialist agent mesh" subtitle="Click any agent to see its scope, tools, and risk profile">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {agents.map((a) => {
              const active = a.id === selId;
              return (
                <button key={a.id} onClick={() => setSelId(a.id)}
                  className={`text-left rounded-lg border p-3 transition ${
                    active
                      ? "border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-200"
                      : "border-slate-200 bg-white hover:border-indigo-300"
                  }`}>
                  <div className="flex items-center justify-between">
                    <Bot className="h-4 w-4 text-indigo-600" />
                    <StatusPill tone={a.risk === "High" ? "rose" : a.risk === "Medium" ? "amber" : "emerald"}>{a.risk}</StatusPill>
                  </div>
                  <div className="text-[13px] font-semibold text-slate-900 mt-1.5">{a.name}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{a.role}</div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Sample customer use cases">
          <div className="flex flex-wrap gap-1.5">
            {useCases.map((u) => (
              <span key={u} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[12px] text-slate-700">
                {u}
              </span>
            ))}
          </div>
        </SectionCard>
      </div>

      <div>
        <DetailDrawer title={sel.name} subtitle={sel.role}>
          <div className="flex gap-2">
            <StatusPill tone="indigo">Specialist Agent</StatusPill>
            <StatusPill tone={riskTone}>Risk: {sel.risk}</StatusPill>
            <StatusPill tone="slate">Approval: {sel.approval}</StatusPill>
          </div>
          <DetailBlock label="Inputs" items={sel.inputs} tone="indigo" />
          <DetailBlock label="Tools used" items={sel.tools} tone="violet" />
          <DetailBlock label="Data accessed" items={sel.data} tone="blue" />
          <DetailBlock label="Example customer use cases" items={sel.useCases} tone="teal" />
          <DetailBlock label="Observability signals" items={sel.signals} tone="amber" />
        </DetailDrawer>
      </div>
    </div>
  );
}
