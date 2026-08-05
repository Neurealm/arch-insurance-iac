import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * Stage 3.5.4.3.1 — progressive disclosure for the large deterministic
 * collections a real change plan carries (25 steps, 25 patches, 50+ blockers).
 *
 * The contract is deliberately narrow:
 *  - the total is always stated, so nothing is silently omitted;
 *  - the order is the engine's order, never re-sorted here;
 *  - hidden records are one click away and the click is announced by count;
 *  - no table framework, no virtualisation, no windowing library.
 */
export const DEFAULT_LIST_LIMIT = 10;

export function BoundedList<T>({
  items,
  renderItem,
  keyFor,
  label,
  limit = DEFAULT_LIST_LIMIT,
  ordered = false,
  testId,
  emptyText,
}: {
  items: readonly T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyFor: (item: T, index: number) => string;
  /** Plural noun used in the count and the show-more control. */
  label: string;
  limit?: number;
  ordered?: boolean;
  testId?: string;
  emptyText?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const total = items.length;
  const visible = expanded ? items : items.slice(0, limit);
  const hidden = total - visible.length;
  const List = ordered ? "ol" : "ul";

  if (total === 0) {
    return (
      <p className="text-xs text-muted-foreground" data-testid={testId ? `${testId}-empty` : undefined}>
        {emptyText ?? `No ${label}.`}
      </p>
    );
  }

  return (
    <div className="space-y-2" data-testid={testId} data-total={total} data-visible={visible.length}>
      <p className="text-[11px] text-muted-foreground" data-testid={testId ? `${testId}-count` : undefined}>
        Showing {visible.length} of {total} {label}. Order is the engine's own deterministic order.
      </p>
      <List className="space-y-2">
        {visible.map((item, index) => (
          <li key={keyFor(item, index)}>{renderItem(item, index)}</li>
        ))}
      </List>
      {hidden > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setExpanded(true)}
          data-testid={testId ? `${testId}-show-more` : undefined}
        >
          Show {hidden} more {label}
        </Button>
      )}
      {expanded && total > limit && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setExpanded(false)}
          data-testid={testId ? `${testId}-show-fewer` : undefined}
        >
          Show fewer {label}
        </Button>
      )}
    </div>
  );
}
