import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Flag, Users, CheckCircle2 } from "lucide-react";
import type { ProgramSummary } from "@/data/programTimelineMockData";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof CalendarDays> = {
  duration: CalendarDays,
  "go-live": Flag,
  stakeholders: Users,
  milestones: CheckCircle2,
};

interface Props {
  cards: ProgramSummary[];
  selectedId: string | null;
  onSelect: (card: ProgramSummary) => void;
}

export function ProgramSummaryCards({ cards, selectedId, onSelect }: Props) {
  return (
    <div data-guide-target="timelines-summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = ICONS[card.id] ?? CalendarDays;
        const active = selectedId === card.id;
        return (
          <Card
            key={card.id}
            className={cn(
              "transition-shadow hover:shadow-md",
              active && "ring-2 ring-ring ring-offset-1"
            )}
          >
            <CardContent className="p-0">
              <button
                type="button"
                onClick={() => onSelect(card)}
                aria-pressed={active}
                className="w-full rounded-lg p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-accent p-2 text-accent-foreground">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {card.label}
                    </div>
                    <div className="mt-1 text-lg font-semibold leading-tight text-foreground">
                      {card.value}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{card.supporting}</div>
                    {card.status && (
                      <Badge variant="outline" className="mt-2 bg-tl-planning-soft text-tl-planning border-tl-planning/30">
                        ● {card.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
