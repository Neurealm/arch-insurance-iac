import { useState } from "react";
import { User, ShieldCheck, Workflow, Bot, Brain, Gavel, ArrowDown } from "lucide-react";
import {
  SectionCard, StatusPill, DetailDrawer, DetailBlock, Legend,
  toneAccent, toneMap,
} from "../components/primitives";
import { flowLanes, flowSteps, type FlowLane } from "../data";
import { cn } from "@/lib/utils";

const laneIcon: Record<FlowLane, any> = {
  user: User, edge: ShieldCheck, control: Workflow, agent: Bot, data: Brain, gov: Gavel,
};

const laneTone: Record<FlowLane, string> = {
  user: "indigo", edge: "rose", control: "violet", agent: "teal", data: "amber", gov: "slate",
};

export default function DataFlow() {
  const [selected, setSelected] = useState<number | null>(1);
  const step = selected ? flowSteps.find((s) => s.n === selected) ?? null : null;
  const lane = step ? flowLanes.find((l) => l.id === step.lane)! : null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
      <div className="space-y-4">
        <SectionCard
          title="End-to-End Data Flow"
          subtitle="Twelve numbered steps from user request to continuous governance. Each step flows through one of six lanes."
        >
          {/* Legend */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5 mb-4">
            <Legend items={flowLanes.map(l => ({
              label: l.label, tone: l.tone, icon: laneIcon[l.id],
            }))} />
          </div>

          {/* Swimlane grid — 6 lane columns × 12 rows */}
          <div className="overflow-x-auto">
            <div className="min-w-[880px]">
              {/* Header row */}
              <div className="grid grid-cols-6 gap-2 mb-2">
                {flowLanes.map((l) => {
                  const Icon = laneIcon[l.id];
                  return (
                    <div key={l.id} className={cn(
                      "rounded-md border-2 px-2 py-2 text-center",
                      toneMap[l.tone],
                    )}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Icon className={cn("h-3.5 w-3.5", toneAccent[l.tone])} />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-800">{l.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rows */}
              <div className="space-y-1.5">
                {flowSteps.map((s, i) => {
                  const laneIndex = flowLanes.findIndex(l => l.id === s.lane);
                  const tone = laneTone[s.lane];
                  const active = selected === s.n;
                  const prev = i > 0 ? flowSteps[i - 1] : null;
                  const prevLaneIndex = prev ? flowLanes.findIndex(l => l.id === prev.lane) : -1;
                  return (
                    <div key={s.n} className="grid grid-cols-6 gap-2 items-stretch">
                      {flowLanes.map((_, ci) => {
                        if (ci !== laneIndex) {
                          // draw a connector line for the hop between lanes
                          const inHop = prev &&
                            ((ci > Math.min(prevLaneIndex, laneIndex) && ci < Math.max(prevLaneIndex, laneIndex)));
                          return (
                            <div key={ci} className="relative min-h-[54px]">
                              {inHop && <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" />}
                            </div>
                          );
                        }
                        return (
                          <button
                            key={ci}
                            onClick={() => setSelected(s.n)}
                            className={cn(
                              "text-left rounded-lg border-2 px-2.5 py-2 transition min-h-[54px]",
                              toneMap[tone],
                              active ? "border-slate-900 shadow-md" : "hover:shadow-sm hover:border-slate-400",
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <span className={cn(
                                "h-6 w-6 rounded-full bg-white border border-current grid place-items-center text-[11px] font-bold shrink-0",
                                toneAccent[tone],
                              )}>
                                {s.n}
                              </span>
                              <div className="min-w-0">
                                <div className="text-[12px] font-semibold text-slate-900 leading-tight">{s.title}</div>
                                <div className="text-[11px] text-slate-600 leading-snug line-clamp-2">{s.detail}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Loop-back note */}
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ArrowDown className="h-3 w-3" />
                Telemetry from step 12 feeds back into evaluations, policy updates, and future planning cycles.
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Right drawer */}
      <div>
        {step && lane ? (
          <DetailDrawer
            title={`Step ${step.n} · ${step.title}`}
            subtitle={lane.label}
            tone={lane.tone}
            onClose={() => setSelected(null)}
          >
            <StatusPill tone={lane.tone}>{lane.label}</StatusPill>
            <p className="text-[13px] text-slate-700 leading-relaxed">{step.detail}</p>

            {step.lane === "edge" && (
              <DetailBlock label="Controls in play" items={[
                "Front Door + WAF", "DDoS Protection Standard",
                "Entra ID + Conditional Access", "APIM rate limits",
              ]} tone="rose" />
            )}
            {step.lane === "control" && (
              <DetailBlock label="Control plane responsibilities" items={[
                "Intent classification and routing",
                "Plan authoring, versioning, dispatch",
                "Policy evaluation per action",
                "Correlation ID propagation",
              ]} tone="violet" />
            )}
            {step.lane === "agent" && (
              <DetailBlock label="Agent behaviour" items={[
                "Least-privilege scope enforced",
                "Managed identity per workload",
                "Grounded response with citations",
                "Confidence threshold triggers HITL",
              ]} tone="teal" />
            )}
            {step.lane === "data" && (
              <DetailBlock label="Data & model controls" items={[
                "All traffic over Private Endpoint",
                "Content Safety on prompt and response",
                "Purview classification propagates",
                "No customer data used for training",
              ]} tone="amber" />
            )}
            {step.lane === "gov" && (
              <DetailBlock label="Governance signals emitted" items={[
                "Immutable audit entry",
                "Cost per outcome captured",
                "Trace span with parent correlation",
                "Policy violation → Sentinel alert",
              ]} tone="slate" />
            )}
          </DetailDrawer>
        ) : (
          <DetailDrawer title="Select a step" subtitle="Click any numbered step in the flow">
            <p className="text-[12.5px] text-slate-500">
              Each step opens a detail view with the controls, responsibilities, and governance signals in play.
            </p>
          </DetailDrawer>
        )}
      </div>
    </div>
  );
}
