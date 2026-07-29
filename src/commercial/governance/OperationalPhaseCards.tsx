import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Rocket, Activity, TrendingUp } from "lucide-react";
import type { OperationalPhase } from "@/data/neurealmGovernanceMockData";
import { StatusBadge, GovernanceProgress, SectionHeading } from "./primitives";
import { PHASE_ACCENT, PHASE_BAR } from "./styles";

const PHASE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  day0: Rocket,
  day1: Activity,
  day2: TrendingUp,
};

export function OperationalPhaseCards({
  phases,
  onToggleActivity,
  onOpenDetail,
}: {
  phases: OperationalPhase[];
  onToggleActivity: (phaseId: string, activityId: string) => void;
  onOpenDetail: (phaseId: string) => void;
}) {
  return (
    <Card id="phases">
      <CardHeader>
        <SectionHeading
          title="Day 0, Day 1 and Day 2 Operational Focus"
          subtitle="Phase objectives, activity checklists, and readiness across build, operate, and optimize"
        />
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-3">
        {phases.map((phase) => {
          const Icon = PHASE_ICON[phase.id];
          return (
            <div key={phase.id} className="flex flex-col rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-5 w-5", PHASE_ACCENT[phase.id])} aria-hidden="true" />
                  <div>
                    <h3 className={cn("text-sm font-semibold", PHASE_ACCENT[phase.id])}>{phase.title}</h3>
                    <p className="text-xs text-muted-foreground">{phase.subtitle}</p>
                  </div>
                </div>
                <StatusBadge status={phase.status} />
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Readiness</span>
                  <span className="font-semibold text-foreground">{phase.readiness}%</span>
                </div>
                <div className="mt-1.5">
                  <GovernanceProgress
                    value={phase.readiness}
                    label={`${phase.title} readiness`}
                    barClass={PHASE_BAR[phase.id]}
                  />
                </div>
              </div>

              <p className="mt-3 text-xs leading-snug text-muted-foreground">{phase.objective}</p>

              <fieldset className="mt-3 max-h-56 overflow-y-auto pr-1">
                <legend className="sr-only">{phase.title} activities</legend>
                <ul className="space-y-1.5">
                  {phase.activities.map((a) => (
                    <li key={a.id} className="flex items-start gap-2">
                      <Checkbox
                        id={a.id}
                        checked={a.complete}
                        onCheckedChange={() => onToggleActivity(phase.id, a.id)}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={a.id}
                        className={cn(
                          "cursor-pointer text-xs leading-snug",
                          a.complete ? "text-muted-foreground line-through" : "text-foreground",
                        )}
                      >
                        {a.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>

              <dl className="mt-3 space-y-1 border-t border-border pt-3 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Outcome</dt>
                  <dd className="font-medium text-foreground">{phase.outcome}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Owner</dt>
                  <dd className="text-foreground">{phase.owner}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Target period</dt>
                  <dd className="text-foreground">{phase.targetPeriod}</dd>
                </div>
              </dl>

              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => onOpenDetail(phase.id)}
              >
                View details
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function OperationalPhaseDetail({
  phase,
  open,
  onOpenChange,
}: {
  phase: OperationalPhase | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!phase) return null;
  const done = phase.activities.filter((a) => a.complete).length;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {phase.title} — {phase.subtitle}
          </DialogTitle>
          <DialogDescription>{phase.objective}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={phase.status} />
            <span className="text-xs text-muted-foreground">
              Owner: {phase.owner} · Target: {phase.targetPeriod} · Outcome: {phase.outcome}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {done} of {phase.activities.length} activities complete ({phase.readiness}%)
            </p>
            <div className="mt-1.5">
              <GovernanceProgress
                value={phase.readiness}
                label={`${phase.title} readiness`}
                barClass={PHASE_BAR[phase.id]}
              />
            </div>
          </div>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {phase.activities.map((a) => (
              <li key={a.id} className="text-xs text-foreground">
                <span aria-hidden="true" className="mr-1.5">
                  {a.complete ? "✓" : "○"}
                </span>
                <span className="sr-only">{a.complete ? "Complete:" : "Not complete:"}</span>
                {a.label}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
