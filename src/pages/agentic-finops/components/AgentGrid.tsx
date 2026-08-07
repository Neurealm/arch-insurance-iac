import { CheckCircle2, Clock, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneMap, type Tone } from "./primitives";

export interface AgentChip {
  name: string;
  status: "Complete" | "Ready" | "Running" | "Queued";
  confidence?: number;
  finding?: string;
  tone?: Tone;
}

export default function AgentGrid({
  agents,
  onSelect,
  columns = "md:grid-cols-4 xl:grid-cols-7",
  engineLabel = "Digital Twin Decision Engine",
  engineNote,
}: {
  agents: AgentChip[];
  onSelect?: (a: AgentChip) => void;
  columns?: string;
  engineLabel?: string | null;
  engineNote?: string;
}) {
  return (
    <div className="space-y-3">
      <div className={cn("grid grid-cols-2 gap-2", columns)}>
        {agents.map((a) => {
          const tone: Tone = a.tone ?? (a.status === "Complete" ? "emerald" : a.status === "Ready" ? "blue" : "amber");
          const t = toneMap[tone];
          return (
            <button
              key={a.name}
              type="button"
              onClick={() => onSelect?.(a)}
              className="rounded-lg border border-slate-200 bg-white p-2.5 text-left transition hover:border-indigo-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-1.5">
                <Bot className={cn("h-3.5 w-3.5", t.text)} />
                <span className="truncate text-[12px] font-semibold text-slate-900">{a.name}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-1">
                <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium", t.bg, t.border, t.text)}>
                  {a.status === "Complete" ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                  {a.status}
                </span>
                {a.confidence !== undefined && (
                  <span className="text-[11px] font-semibold tabular-nums text-slate-700">{a.confidence}%</span>
                )}
              </div>
              {a.finding && <p className="mt-1.5 text-[11px] leading-snug text-slate-600">{a.finding}</p>}
            </button>
          );
        })}
      </div>
      {engineLabel && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">{engineLabel}</span>
            <span className="text-[11.5px] text-slate-600">
              {engineNote ?? "All agent findings correlated into a single evidence-linked recommendation."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
