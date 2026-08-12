/**
 * AIM-002 — Signal Inputs column.
 */

import { Pin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { PipelineCard } from "./PipelineColumn";
import { signalGroups, type SignalDefinition } from "../data/pliPipelineFixtures";

function qualityTone(q: SignalDefinition["quality"]) {
  return q === "Good"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : q === "Degraded"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : q === "Stale"
        ? "border-orange-200 bg-orange-50 text-orange-800"
        : "border-rose-200 bg-rose-50 text-rose-700";
}

export function SignalInputColumn({
  expandedGroups, onToggleGroup, selectedSignalId, onSelectSignal, pinnedSignalIds, onTogglePin,
  contributingOnly, onContributingOnlyChange, onReset, highlightedSignalIds,
}: {
  expandedGroups: string[];
  onToggleGroup: (id: string) => void;
  selectedSignalId: string | null;
  onSelectSignal: (id: string | null) => void;
  pinnedSignalIds: string[];
  onTogglePin: (id: string) => void;
  contributingOnly: boolean;
  onContributingOnlyChange: (v: boolean) => void;
  onReset: () => void;
  highlightedSignalIds: string[];
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <label className="flex items-center gap-1 text-[10px] text-slate-600">
          <input
            type="checkbox"
            checked={contributingOnly}
            onChange={(e) => onContributingOnlyChange(e.target.checked)}
            className="h-3 w-3 rounded border-slate-300"
          />
          Contributing signals only
        </label>
        <button
          type="button"
          onClick={onReset}
          className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Clear signal selection
        </button>
      </div>

      {signalGroups.map((group) => {
        const open = expandedGroups.includes(group.id);
        const visible = contributingOnly ? group.signals.filter((s) => s.contributes) : group.signals;
        return (
          <div key={group.id} className="rounded border border-slate-200">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`signal-group-${group.id}`}
              data-testid={`signal-group-${group.id}`}
              onClick={() => onToggleGroup(group.id)}
              className="w-full rounded-t px-2 py-1.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="flex items-center justify-between gap-1">
                <span className="truncate text-[11px] font-semibold text-slate-900">{group.title}</span>
                <span className="shrink-0 text-[9.5px] text-slate-500">{open ? "Hide" : "Show"}</span>
              </span>
              <span className="mt-0.5 flex flex-wrap items-center gap-1 text-[9.5px] text-slate-600">
                <span>{group.signals.length} signals</span>
                <span aria-hidden>·</span>
                <span>Quality {group.qualityScore.toFixed(2)}</span>
                <span aria-hidden>·</span>
                <span>{group.sourceCount} sources</span>
                <span aria-hidden>·</span>
                <span>Fresh {group.freshness}</span>
                <span className={cn("rounded border px-1 font-medium", group.requirement === "Required" ? "border-slate-200 bg-slate-50 text-slate-700" : "border-slate-200 bg-white text-slate-500")}>
                  {group.requirement}
                </span>
              </span>
              <span className="block text-[9.5px] text-slate-500">Last update {group.lastUpdate}</span>
              {group.warning && (
                <span className="mt-0.5 block rounded border border-amber-200 bg-amber-50 px-1 py-0.5 text-[9.5px] text-amber-800">
                  {group.warning}
                </span>
              )}
            </button>

            {open && (
              <ul id={`signal-group-${group.id}`} className="space-y-1 border-t border-slate-200 p-1.5">
                {visible.length === 0 && (
                  <li className="rounded border border-dashed border-slate-200 p-2 text-[10px] text-slate-500">
                    No contributing signals in this group for the current prediction.
                  </li>
                )}
                {visible.map((s) => {
                  const pinned = pinnedSignalIds.includes(s.id);
                  const selected = selectedSignalId === s.id;
                  const highlighted = highlightedSignalIds.includes(s.id);
                  return (
                    <li key={s.id} className="flex items-start gap-1">
                      <PipelineCard
                        testId={`signal-${s.id}`}
                        selected={selected}
                        highlighted={highlighted && !selected}
                        onClick={() => onSelectSignal(selected ? null : s.id)}
                        ariaLabel={`${s.name}, ${s.value} ${s.unit}, quality ${s.quality}${s.contributes ? ", contributes to the current prediction" : ""}`}
                      >
                        <span className="flex items-baseline justify-between gap-1">
                          <span className="truncate text-[10.5px] font-medium text-slate-900">{s.name}</span>
                          <span className="shrink-0 text-[10.5px] font-semibold text-slate-900">
                            {s.value} <span className="font-normal text-slate-500">{s.unit}</span>
                          </span>
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1 text-[9px] text-slate-500">
                          <span>{s.trend === "up" ? "▲ Rising" : s.trend === "down" ? "▼ Falling" : "■ Steady"}</span>
                          <span aria-hidden>·</span>
                          <span>Normal {s.normalRange}</span>
                          <span aria-hidden>·</span>
                          <span>{s.source}</span>
                          <span aria-hidden>·</span>
                          <span>{s.freshness}</span>
                          <span className={cn("rounded border px-1 font-medium", qualityTone(s.quality))}>{s.quality}</span>
                          {s.contributes && (
                            <span className="rounded border border-blue-200 bg-blue-50 px-1 font-medium text-blue-700">
                              Contributing
                            </span>
                          )}
                        </span>
                        {selected && (
                          <span className="mt-1 block rounded bg-slate-50 px-1.5 py-1 text-[9.5px] text-slate-600">
                            {s.definition} Downstream features: {s.featureIds.length}.
                          </span>
                        )}
                      </PipelineCard>
                      <button
                        type="button"
                        onClick={() => onTogglePin(s.id)}
                        aria-pressed={pinned}
                        aria-label={`${pinned ? "Unpin" : "Pin"} ${s.name}`}
                        data-testid={`signal-pin-${s.id}`}
                        className={cn(
                          "mt-0.5 shrink-0 rounded border p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                          pinned ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:bg-slate-50",
                        )}
                      >
                        {pinned ? <Pin className="h-3 w-3" aria-hidden /> : <PinOff className="h-3 w-3" aria-hidden />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
