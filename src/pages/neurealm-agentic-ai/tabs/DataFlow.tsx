import { SectionCard, StatusPill } from "../components/primitives";
import { flowSteps } from "../data";
import { User, Lock, Wrench, Activity, Gavel } from "lucide-react";

const legend = [
  { kind: "user", label: "User request / response", tone: "indigo", icon: User },
  { kind: "data", label: "Private Link / data access", tone: "violet", icon: Lock },
  { kind: "tool", label: "Tool invocation", tone: "teal", icon: Wrench },
  { kind: "telemetry", label: "Telemetry", tone: "amber", icon: Activity },
  { kind: "gov", label: "Governance control", tone: "rose", icon: Gavel },
];

const toneMap: Record<string, string> = {
  user: "border-indigo-200 bg-indigo-50/50 text-indigo-900",
  data: "border-violet-200 bg-violet-50/50 text-violet-900",
  tool: "border-teal-200 bg-teal-50/50 text-teal-900",
  telemetry: "border-amber-200 bg-amber-50/50 text-amber-900",
  gov: "border-rose-200 bg-rose-50/50 text-rose-900",
};

export default function DataFlow() {
  return (
    <div className="space-y-4">
      <SectionCard title="End-to-end data flow" subtitle="12 numbered steps · from user request to continuous governance">
        <div className="space-y-2">
          {flowSteps.map((s) => (
            <div key={s.n} className={`flex items-start gap-3 rounded-lg border p-3 ${toneMap[s.kind]}`}>
              <div className="h-7 w-7 rounded-full bg-white border border-current grid place-items-center text-[12px] font-bold shrink-0">
                {s.n}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-[13px] font-semibold">{s.title}</div>
                  <StatusPill tone={legend.find(l => l.kind === s.kind)!.tone}>
                    {legend.find(l => l.kind === s.kind)!.label}
                  </StatusPill>
                </div>
                <div className="text-[12px] text-slate-700 mt-0.5">{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Legend">
        <div className="flex flex-wrap gap-3">
          {legend.map((l) => {
            const Icon = l.icon;
            return (
              <div key={l.kind} className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 ${toneMap[l.kind]}`}>
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[12px] font-medium">{l.label}</span>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
