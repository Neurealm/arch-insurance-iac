import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ShieldCheck, Users, ClipboardList, AlertTriangle, CalendarDays } from "lucide-react";
import type { GovernanceSummary } from "@/data/neurealmGovernanceMockData";
import { StatusBadge, GovernanceProgress } from "./primitives";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  health: ShieldCheck,
  workstreams: Users,
  decisions: ClipboardList,
  risks: AlertTriangle,
  meeting: CalendarDays,
};

const ICON_TINT: Record<string, string> = {
  health: "bg-gv-success-soft text-gv-success",
  workstreams: "bg-gv-blue-soft text-gv-blue",
  decisions: "bg-gv-teal-soft text-gv-teal",
  risks: "bg-gv-risk-soft text-gv-risk",
  meeting: "bg-gv-purple-soft text-gv-purple",
};

export function GovernanceSummaryCards({
  cards,
  selectedId,
  onSelect,
}: {
  cards: GovernanceSummary[];
  selectedId: string | null;
  onSelect: (card: GovernanceSummary) => void;
}) {
  return (
    <section data-guide-target="governance-health" aria-label="Governance health summary">
      <h2 className="sr-only">Governance health summary</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = ICONS[card.id] ?? ShieldCheck;
          const selected = selectedId === card.id;
          return (
            <Card
              key={card.id}
              className={cn(
                "transition hover:shadow-md",
                selected && "ring-2 ring-gv-blue ring-offset-1",
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(card)}
                aria-pressed={selected}
                className="w-full rounded-lg p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >

                <div className="flex items-start gap-3">
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", ICON_TINT[card.id])}>
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                    <p className="mt-1 text-lg font-semibold leading-tight text-foreground">{card.value}</p>
                    {card.supportingValue && (
                      <p className="text-sm font-semibold text-gv-success">{card.supportingValue}</p>
                    )}
                  </div>
                </div>
                {card.supportingValue && (
                  <div className="mt-3">
                    <GovernanceProgress
                      value={Number(card.supportingValue.replace("%", ""))}
                      label={card.label}
                      barClass="bg-gv-success"
                    />
                  </div>
                )}
                <p className="mt-2 text-xs leading-snug text-muted-foreground">{card.supportingText}</p>
                <div className="mt-3">
                  <StatusBadge status={card.status} />
                </div>
              </button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
