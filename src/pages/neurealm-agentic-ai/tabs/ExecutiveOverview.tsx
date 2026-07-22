import {
  Briefcase, Shield, Gavel, Bot, Plug, Cloud, ArrowRight, Sparkles,
} from "lucide-react";
import { SectionCard, StatusPill } from "../components/primitives";
import { maturityStages } from "../data";

const businessValues = [
  { icon: Briefcase, title: "Digital workforce enablement",
    desc: "Scale service delivery without linear headcount growth via governed digital coworkers." },
  { icon: Shield, title: "Secure enterprise automation",
    desc: "Zero-trust identity, private networking, and content safety by default." },
  { icon: Gavel, title: "Governed agentic execution",
    desc: "Every plan, tool call, and decision auditable end-to-end." },
  { icon: Bot, title: "Multi-agent collaboration",
    desc: "Specialist agents coordinated by a planner across domains." },
  { icon: Plug, title: "Integration with enterprise systems",
    desc: "Typed connectors to ServiceNow, SAP, Jira, Microsoft 365, and custom APIs." },
  { icon: Cloud, title: "Cloud-native deployment readiness",
    desc: "Azure landing zone aligned, Private Link everywhere, Bicep/Terraform delivered." },
];

const journey = [
  "User Request", "Secure Access", "Agent Orchestration", "Specialist Agents",
  "Enterprise Tools", "Governed Action", "Observability",
];

export default function ExecutiveOverview() {
  return (
    <div className="space-y-6">
      <SectionCard title="Business value" subtitle="Why enterprises adopt the Neurealm Agentic AI Platform">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {businessValues.map((v) => (
            <div key={v.title} className="rounded-lg border border-slate-200 bg-gradient-to-br from-white to-indigo-50/30 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-8 w-8 grid place-items-center rounded-md bg-indigo-100 text-indigo-700">
                  <v.icon className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold text-slate-900">{v.title}</div>
              </div>
              <p className="text-[12.5px] text-slate-600 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Platform journey" subtitle="How a single business request flows through the platform">
        <div className="flex flex-wrap items-center gap-2">
          {journey.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[12px] font-medium text-indigo-800">
                <span className="text-indigo-400 mr-1.5">{i + 1}</span>{step}
              </div>
              {i < journey.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-300" />}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Agentic AI maturity model" subtitle="Where customers typically start and where the platform can take them">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {maturityStages.map((s, i) => (
            <div key={s.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">Stage {s.id}</div>
                {i === 2 && <StatusPill tone="violet">Common start</StatusPill>}
                {i === 4 && <StatusPill tone="emerald">Target</StatusPill>}
              </div>
              <div className="text-sm font-semibold text-slate-900 mt-1">{s.name}</div>
              <p className="text-[12px] text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${(i + 1) * 20}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Executive talking points" subtitle="Use these when framing the platform in customer conversations">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[13px] text-slate-700">
          {[
            "Agents are specialized, not monolithic — bounded scope reduces risk.",
            "Every action is governed: RBAC, policy engine, HITL, and audit trail.",
            "Azure PaaS AI is consumed via Private Endpoint — data never traverses the public internet.",
            "Model choice is a runtime decision, not a lock-in — model gateway routes per task.",
            "Cost is measured per business outcome, not per token.",
            "The platform is delivered as code — Bicep, Terraform, Helm, GitHub Actions.",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
