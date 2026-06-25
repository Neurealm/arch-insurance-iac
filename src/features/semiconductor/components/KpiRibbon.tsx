import { useScenario, CANDIDATES } from "../state/ScenarioContext";
import { cn } from "@/lib/utils";

export function KpiCard({
  label, value, suffix, baseline, tone = "neutral", onClick,
}: {
  label: string; value: number | string; suffix?: string; baseline?: number;
  tone?: "neutral" | "good" | "warn" | "bad"; onClick?: () => void;
}) {
  const delta =
    typeof value === "number" && typeof baseline === "number"
      ? +(value - baseline).toFixed(1)
      : null;
  const toneCls =
    tone === "good" ? "border-emerald-200 bg-emerald-50/40"
    : tone === "warn" ? "border-amber-200 bg-amber-50/40"
    : tone === "bad" ? "border-red-200 bg-red-50/40"
    : "border-border bg-card";
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left rounded-lg border p-3 hover:shadow-sm transition-shadow w-full",
        toneCls
      )}
    >
      <div className="text-[10.5px] uppercase tracking-wide text-muted-foreground font-medium">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-semibold tabular-nums text-foreground">{value}</span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
      {delta !== null && (
        <div className={cn(
          "text-[11px] mt-0.5 tabular-nums",
          delta > 0 ? "text-red-600" : delta < 0 ? "text-emerald-600" : "text-muted-foreground"
        )}>
          {delta > 0 ? "+" : ""}{delta} vs baseline
        </div>
      )}
    </button>
  );
}

export function KpiRibbon({ onSelect }: { onSelect?: (key: string) => void }) {
  const { currentKpis, baselineKpis } = useScenario();
  const k = currentKpis;
  const b = baselineKpis;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
      <KpiCard label="Wafer Starts Today" value={`${k.waferStartsToday}/${k.waferStartsTarget}`} onClick={() => onSelect?.("starts")} />
      <KpiCard label="WIP Lots" value={k.wipLots.toLocaleString()} onClick={() => onSelect?.("wip")} />
      <KpiCard label="On-Time Completion" value={k.onTimeCompletion} suffix="%" baseline={b.onTimeCompletion}
        tone={k.onTimeCompletion < 91 ? "bad" : k.onTimeCompletion < 93 ? "warn" : "good"} onClick={() => onSelect?.("otd")} />
      <KpiCard label="Projected Cycle Time" value={k.cycleTimeDays} suffix="d" baseline={b.cycleTimeDays}
        tone={k.cycleTimeDays > 47 ? "bad" : k.cycleTimeDays > 46.5 ? "warn" : "good"} onClick={() => onSelect?.("cycle")} />
      <KpiCard label="Dispatch Adherence" value={k.dispatchAdherence} suffix="%" baseline={b.dispatchAdherence}
        tone={k.dispatchAdherence < 90 ? "bad" : "good"} onClick={() => onSelect?.("dispatch")} />
      <KpiCard label="Tool Availability" value={k.toolAvailability} suffix="%" baseline={b.toolAvailability} onClick={() => onSelect?.("avail")} />
      <KpiCard label="Forecast Peak" value={k.forecastPeakMW} suffix="MW" baseline={b.forecastPeakMW}
        tone={k.forecastPeakMW > 73 ? "bad" : k.forecastPeakMW > 71 ? "warn" : "good"} onClick={() => onSelect?.("peak")} />
      <KpiCard label="Pending Approvals" value={k.pendingApprovals}
        tone={k.pendingApprovals > 0 ? "warn" : "good"} onClick={() => onSelect?.("appr")} />
    </div>
  );
}

export function CandidateCompare() {
  const { appliedCandidate, applyCandidate, currentKpis } = useScenario();
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {(["balanced", "throughput"] as const).map((id) => {
        const c = CANDIDATES[id];
        const active = appliedCandidate === id;
        return (
          <div key={id} className={cn("rounded-lg border p-3", active ? "border-emerald-300 bg-emerald-50/40" : "border-border bg-card")}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-sm">{c.label}</div>
                <div className="text-xs text-muted-foreground">Confidence {c.confidence}% · Quality risk {c.risk}</div>
              </div>
              <button
                onClick={() => applyCandidate(active ? null : id)}
                className={cn(
                  "h-7 px-2 text-xs rounded border",
                  active ? "border-emerald-400 bg-emerald-100 text-emerald-800" : "border-indigo bg-indigo text-white hover:bg-indigo/90"
                )}
              >
                {active ? "Applied — Rollback" : "Apply Candidate"}
              </button>
            </div>
            <ul className="mt-2 space-y-1 text-[11.5px] text-foreground/80 list-disc pl-4">
              {c.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <div className="mt-2 grid grid-cols-4 gap-1.5 text-[11px]">
              <Mini label="OTD" v={`${c.kpis.onTimeCompletion}%`} />
              <Mini label="Cycle" v={`${c.kpis.cycleTimeDays}d`} />
              <Mini label="Peak" v={`${c.kpis.forecastPeakMW}MW`} />
              <Mini label="@Risk" v={c.kpis.lotsAtQueueRisk} />
            </div>
          </div>
        );
      })}
      <div className="md:col-span-2 text-[11px] text-muted-foreground">
        Currently displayed KPIs reflect: <span className="font-medium text-foreground">{appliedCandidate ? CANDIDATES[appliedCandidate].label : "Live scenario state"}</span> · WIP {currentKpis.wipLots.toLocaleString()} lots.
      </div>
    </div>
  );
}

function Mini({ label, v }: { label: string; v: string | number }) {
  return (
    <div className="rounded border border-border bg-background px-2 py-1">
      <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
      <div className="font-semibold tabular-nums">{v}</div>
    </div>
  );
}
