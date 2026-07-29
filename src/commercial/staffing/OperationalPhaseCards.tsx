import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PHASE_ACCENT, PHASE_SOFT } from "./styles";
import { OPERATIONAL_PHASES, fte, type PhaseKey } from "@/data/staffingResourcesMockData";

export function OperationalPhaseCards({
  factor,
  activePhases,
  onToggle,
}: {
  factor: number;
  activePhases: PhaseKey[];
  onToggle: (phase: PhaseKey) => void;
}) {
  return (
    <section aria-label="Operational phase staffing" className="grid gap-4 md:grid-cols-3">
      {OPERATIONAL_PHASES.map((p) => {
        const active = activePhases.includes(p.key);
        return (
          <Card
            key={p.key}
            role="button"
            tabIndex={0}
            aria-pressed={active}
            onClick={() => onToggle(p.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(p.key);
              }
            }}
            className={cn(
              "cursor-pointer border transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              PHASE_SOFT[p.key],
              active && "ring-2 ring-gv-blue",
            )}
          >
            <CardContent className="space-y-2 p-4">
              <p className={cn("text-sm font-semibold", PHASE_ACCENT[p.key])}>{p.title}</p>
              <p className="text-sm font-medium text-foreground">{p.subtitle}</p>
              <p className="text-xs text-muted-foreground">{p.period}</p>
              <p className="text-sm text-foreground">
                Peak FTEs: <span className="font-semibold tabular-nums">{fte(p.peakFtes * factor).toFixed(1)}</span>
              </p>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Staffing focus</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                  {p.focus.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-foreground">
                <span className="font-medium">Outcome:</span> {p.outcome}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
