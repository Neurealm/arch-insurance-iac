/**
 * AIM-002 — Feature Engineering column.
 */

import { cn } from "@/lib/utils";
import { PipelineCard } from "./PipelineColumn";
import { engineeredFeatures } from "../data/pliPipelineFixtures";

export function FeatureEngineeringColumn({
  selectedFeatureId, onSelectFeature, highlightedFeatureIds,
}: {
  selectedFeatureId: string | null;
  onSelectFeature: (id: string) => void;
  highlightedFeatureIds: string[];
}) {
  return (
    <ul className="space-y-1.5">
      {engineeredFeatures.map((f) => {
        const selected = selectedFeatureId === f.id;
        return (
          <li key={f.id}>
            <PipelineCard
              testId={`feature-${f.id}`}
              selected={selected}
              highlighted={highlightedFeatureIds.includes(f.id) && !selected}
              onClick={() => onSelectFeature(f.id)}
              ariaLabel={`${f.name}, ${f.value} ${f.unit}, ${f.state}, ${f.riskDirection}${f.material ? ", material to the current prediction" : ""}`}
            >
              <span className="flex items-baseline justify-between gap-1">
                <span className="truncate text-[10.5px] font-medium text-slate-900">{f.name}</span>
                <span className="shrink-0 text-[11px] font-semibold text-slate-900">{f.value}</span>
              </span>
              <span className="mt-0.5 flex flex-wrap items-center gap-1 text-[9px] text-slate-500">
                <span>{f.unit}</span>
                <span aria-hidden>·</span>
                <span>{f.signalIds.length} signals</span>
                <span aria-hidden>·</span>
                <span>{f.downstreamModelIds.length} models</span>
                <span aria-hidden>·</span>
                <span>Quality {f.quality}</span>
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-1">
                <span
                  className={cn(
                    "rounded border px-1 text-[9px] font-medium",
                    f.state === "Elevated"
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : f.state === "Watch"
                        ? "border-sky-200 bg-sky-50 text-sky-700"
                        : "border-slate-200 bg-slate-50 text-slate-600",
                  )}
                >
                  {f.state}
                </span>
                <span className="rounded border border-slate-200 bg-white px-1 text-[9px] text-slate-600">
                  {f.riskDirection}
                </span>
                {f.material && (
                  <span className="rounded border border-blue-200 bg-blue-50 px-1 text-[9px] font-medium text-blue-700">
                    Material
                  </span>
                )}
              </span>
            </PipelineCard>
          </li>
        );
      })}
    </ul>
  );
}
