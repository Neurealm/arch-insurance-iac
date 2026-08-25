// Hierarchical service dependency health list. Translates Azure
// infrastructure dependencies into customer service context, and highlights
// the full dependency chain affected by whichever object is hovered.

import { useState } from "react";
import { cn } from "@/lib/utils";
import { dependencies } from "./data";
import { Interactive, StatusChip, statusStyles, useImpactDrawer } from "./primitives";
import { WhyThisMatters } from "./whyThisMatters";

export default function DependencyHealthPanel({ dense = false }: { dense?: boolean }) {
  const { open } = useImpactDrawer();
  const [hovered, setHovered] = useState<string | null>(null);

  const active = hovered ? dependencies.find((d) => d.id === hovered) : undefined;
  const chain = active?.chain ?? [];
  const chainLabels = chain
    .map((id) => dependencies.find((d) => d.id === id)?.layer)
    .filter(Boolean) as string[];

  return (
    <div>
      <ul className="divide-y divide-slate-100" onMouseLeave={() => setHovered(null)}>
        {dependencies.map((row) => {
          const inChain = chain.includes(row.id);
          const isHovered = hovered === row.id;
          const s = statusStyles[row.status];
          return (
            <li key={row.id} onMouseEnter={() => setHovered(row.id)} onFocus={() => setHovered(row.id)}>
              <Interactive
                tooltip={row.customerRelevance ?? "How this supporting layer is behaving — and whether its condition is reaching your users."}
                onClick={() => open(row.contextId)}
                correlationKey={`dependency:${row.id}`}
                footer={row.id === "dep-your" ? undefined : <WhyThisMatters objectKey={`dependency:${row.id}`} align="right" />}
                className={cn(
                  "rounded-lg border px-2.5 py-2.5 transition-colors duration-200",
                  inChain ? "border-sky-300 bg-sky-50/70" : "border-transparent",
                  isHovered && "border-sky-400 bg-sky-50",
                )}
              >
                <div
                  className={cn(
                    "grid grid-cols-[1fr_auto] items-center gap-3",
                    dense ? "sm:grid-cols-[190px_110px_1fr]" : "sm:grid-cols-[220px_120px_1fr]",
                  )}
                  style={{ paddingLeft: (row.depth ?? 0) * 14 }}
                >
                  <span className="flex items-center gap-2 text-[12.5px] font-medium text-slate-900">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", s.dot)} aria-hidden />
                    {row.layer}
                  </span>
                  <StatusChip status={row.status} />
                  <span className="hidden text-[11.5px] text-slate-500 sm:block">{row.description}</span>
                </div>
                {row.customerRelevance && (
                  <p
                    className="mt-1 text-[11px] leading-snug text-slate-500"
                    style={{ paddingLeft: (row.depth ?? 0) * 14 + 16 }}
                  >
                    {row.customerRelevance}
                  </p>
                )}
              </Interactive>
            </li>
          );
        })}
      </ul>

      <div className="mt-2 min-h-[30px] rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-snug text-slate-500">
        {chainLabels.length > 0 ? (
          <span>
            Dependency chain: <span className="font-medium text-slate-700">{chainLabels.join(" → ")}</span>
          </span>
        ) : (
          <span>Hover a layer to highlight the dependency chain it belongs to. Underlying conditions never imply customer impact on their own.</span>
        )}
      </div>
    </div>
  );
}
