import { CATEGORY_LEGEND, LAST_UPDATED } from "@/data/programTimelineMockData";
import { CATEGORY_FILL } from "./styles";
import { cn } from "@/lib/utils";

export function TimelineLegend() {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {CATEGORY_LEGEND.map((l) => (
          <li key={l.category} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn("h-2.5 w-2.5 rounded-sm", CATEGORY_FILL[l.token])} aria-hidden="true" />
            {l.category}
          </li>
        ))}
      </ul>
      <div className="space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
        <p>Last updated: {LAST_UPDATED}</p>
        <p>Data source: Illustrative program timeline, prototype data only</p>
        <p className="font-medium text-foreground">
          Timelines and statuses shown on this screen are simulated and do not represent committed
          contractual dates.
        </p>
      </div>
    </div>
  );
}
