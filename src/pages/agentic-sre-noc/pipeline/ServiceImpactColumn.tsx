/**
 * AIM-002 — Customer and Service Impact column.
 */

import { cn } from "@/lib/utils";
import { ServiceImpactTopology } from "./ServiceImpactTopology";
import { serviceImpactRecords } from "../data/pliPipelineFixtures";

const TONE: Record<string, string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-800",
  neutral: "border-slate-200 bg-white text-slate-800",
};

export function ServiceImpactColumn({
  selectedImpactId, onSelectImpact, selectedNodeId, onSelectNode,
}: {
  selectedImpactId: string | null;
  onSelectImpact: (id: string | null) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <ul className="grid grid-cols-2 gap-1">
        {serviceImpactRecords.map((m) => {
          const selected = selectedImpactId === m.id;
          return (
            <li key={m.id}>
              <button
                type="button"
                data-testid={`impact-${m.id}`}
                aria-pressed={selected}
                onClick={() => onSelectImpact(selected ? null : m.id)}
                className={cn(
                  "h-full w-full rounded border px-1.5 py-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  selected ? "border-blue-400 bg-blue-50" : TONE[m.tone],
                )}
              >
                <span className="block truncate text-[9.5px] uppercase tracking-wide opacity-80">{m.label}</span>
                <span className="block truncate text-[11.5px] font-semibold">{m.value}</span>
                {selected && <span className="mt-0.5 block text-[9.5px] font-normal">{m.detail}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <div>
        <h5 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Service impact topology</h5>
        <ServiceImpactTopology selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />
      </div>
    </div>
  );
}
