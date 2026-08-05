// Situation lifecycle timeline for the SRE Based Agentic NOC (Stage 2).

import { cn } from "@/lib/utils";
import type { LifecycleEntry } from "@/types/agenticNocWorkflow";

export function SituationLifecycleTimeline({
  entries, className,
}: { entries: LifecycleEntry[]; className?: string }) {
  const current = entries.find((e) => e.state === "current");
  return (
    <div className={className}>
      <ol className="space-y-1.5" aria-label="Situation lifecycle">
        {entries.map((entry) => (
          <li key={entry.stage} className="flex items-start gap-2">
            <span
              aria-hidden
              className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full border",
                entry.state === "completed" ? "border-green-600 bg-green-500"
                  : entry.state === "current" ? "border-blue-600 bg-blue-500"
                    : "border-slate-300 bg-white")}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-medium text-slate-800">
                {entry.stage}
                <span className="ml-1.5 font-normal text-slate-500">
                  {entry.state === "completed" ? "Completed"
                    : entry.state === "current" ? "Current stage" : "Pending"}
                </span>
              </p>
              <p className="text-[10.5px] text-slate-500">
                {entry.timestamp ? `${entry.timestamp.slice(11, 16)} UTC · ` : "Not started · "}
                {entry.owner}
              </p>
            </div>
          </li>
        ))}
      </ol>
      {current && (
        <p className="mt-2 rounded border border-blue-200 bg-blue-50 px-2 py-1.5 text-[11px] text-blue-800">
          Next required decision: {current.decision}
        </p>
      )}
    </div>
  );
}
