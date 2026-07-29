import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StaffStatusBadge } from "./primitives";
import type { StaffingSummary } from "@/data/staffingResourcesMockData";

export function StaffingSummaryCards({
  cards,
  selectedId,
  onSelect,
}: {
  cards: StaffingSummary[];
  selectedId: string | null;
  onSelect: (card: StaffingSummary) => void;
}) {
  return (
    <section aria-label="Executive staffing summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((c) => (
        <Card
          key={c.id}
          role="button"
          tabIndex={0}
          aria-pressed={selectedId === c.id}
          onClick={() => onSelect(c)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(c);
            }
          }}
          className={cn(
            "cursor-pointer transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            selectedId === c.id && "ring-2 ring-gv-blue",
          )}
        >
          <CardContent className="space-y-2 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
            <p className="text-xl font-semibold leading-tight text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.support}</p>
            <StaffStatusBadge status={c.status} />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
