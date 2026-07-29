import { ArrowDown } from "lucide-react";
import type { GuideRelationship } from "./types";
import { GuidePending } from "./CommercialGuideSection";

function Band({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">Pending validation</p>
      ) : (
        <ul className="mt-1 space-y-0.5 text-xs text-foreground">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CommercialRelationshipMap({ relationship }: { relationship: GuideRelationship }) {
  const empty =
    relationship.receivesFrom.length === 0 &&
    relationship.models.length === 0 &&
    relationship.feeds.length === 0;

  if (empty) return <GuidePending label="Page relationships pending validation" />;

  return (
    <div className="space-y-1.5">
      <Band title="Receives from" items={relationship.receivesFrom} />
      <ArrowDown className="mx-auto h-4 w-4 text-muted-foreground" aria-hidden />
      <Band title="Models, validates or calculates" items={relationship.models} />
      <ArrowDown className="mx-auto h-4 w-4 text-muted-foreground" aria-hidden />
      <Band title="Feeds or influences" items={relationship.feeds} />
    </div>
  );
}
