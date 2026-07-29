import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ALL_CATEGORIES,
  ALL_OWNERS,
  ALL_STATUSES,
  EMPTY_FILTERS,
  TIMELINE_GROUPS,
  type ActivityCategory,
  type ActivityStatus,
  type TimelineFilterState,
} from "@/data/programTimelineMockData";
import { Filter, X } from "lucide-react";

interface Props {
  filters: TimelineFilterState;
  onChange: (next: TimelineFilterState) => void;
  activeCount: number;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function TimelineFilters({ filters, onChange, activeCount }: Props) {
  const flags = useMemo(
    () =>
      [
        { key: "milestonesOnly", label: "Milestones only" },
        { key: "atRiskOnly", label: "At-risk activities" },
        { key: "customerOwnedOnly", label: "Customer-owned activities" },
        { key: "criticalPathOnly", label: "Critical path activities" },
      ] as { key: keyof TimelineFilterState; label: string }[],
    []
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Open timeline filters">
          <Filter className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <Badge className="ml-2 h-5 min-w-5 justify-center px-1" variant="secondary">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold">Filter timeline</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ ...EMPTY_FILTERS })}
            aria-label="Clear all filters"
          >
            Clear Filters
          </Button>
        </div>
        <Separator />
        <ScrollArea className="h-[22rem]">
          <div className="space-y-4 p-4 text-sm">
            <FilterBlock title="Search">
              <Input
                value={filters.search}
                onChange={(e) => onChange({ ...filters, search: e.target.value })}
                placeholder="Search activities"
                aria-label="Search activities"
              />
            </FilterBlock>

            <FilterBlock title="Lane group">
              {TIMELINE_GROUPS.map((g) => (
                <CheckRow
                  key={g.id}
                  id={`f-group-${g.id}`}
                  label={g.name}
                  checked={filters.groupIds.includes(g.id)}
                  onToggle={() => onChange({ ...filters, groupIds: toggle(filters.groupIds, g.id) })}
                />
              ))}
            </FilterBlock>

            <FilterBlock title="Status">
              {ALL_STATUSES.map((s) => (
                <CheckRow
                  key={s}
                  id={`f-status-${s}`}
                  label={s}
                  checked={filters.statuses.includes(s)}
                  onToggle={() =>
                    onChange({ ...filters, statuses: toggle(filters.statuses, s) as ActivityStatus[] })
                  }
                />
              ))}
            </FilterBlock>

            <FilterBlock title="Category">
              {ALL_CATEGORIES.map((c) => (
                <CheckRow
                  key={c}
                  id={`f-cat-${c}`}
                  label={c}
                  checked={filters.categories.includes(c)}
                  onToggle={() =>
                    onChange({ ...filters, categories: toggle(filters.categories, c) as ActivityCategory[] })
                  }
                />
              ))}
            </FilterBlock>

            <FilterBlock title="Owner">
              {ALL_OWNERS.map((o) => (
                <CheckRow
                  key={o}
                  id={`f-owner-${o}`}
                  label={o}
                  checked={filters.owners.includes(o)}
                  onToggle={() => onChange({ ...filters, owners: toggle(filters.owners, o) })}
                />
              ))}
            </FilterBlock>

            <FilterBlock title="Quick filters">
              {flags.map((f) => (
                <CheckRow
                  key={String(f.key)}
                  id={`f-flag-${String(f.key)}`}
                  label={f.label}
                  checked={Boolean(filters[f.key])}
                  onToggle={() => onChange({ ...filters, [f.key]: !filters[f.key] })}
                />
              ))}
            </FilterBlock>
          </div>
        </ScrollArea>
        <Separator />
        <div className="px-4 py-3 text-right">
          <Button size="sm" onClick={() => onChange({ ...filters })}>
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function CheckRow({
  id,
  label,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onToggle} />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal">
        {label}
      </Label>
    </div>
  );
}

export function FilterChips({
  filters,
  onChange,
}: {
  filters: TimelineFilterState;
  onChange: (next: TimelineFilterState) => void;
}) {
  const chips: { label: string; clear: () => void }[] = [];
  filters.groupIds.forEach((id) =>
    chips.push({
      label: TIMELINE_GROUPS.find((g) => g.id === id)?.name ?? id,
      clear: () => onChange({ ...filters, groupIds: filters.groupIds.filter((g) => g !== id) }),
    })
  );
  filters.statuses.forEach((s) =>
    chips.push({ label: s, clear: () => onChange({ ...filters, statuses: filters.statuses.filter((x) => x !== s) }) })
  );
  filters.categories.forEach((c) =>
    chips.push({ label: c, clear: () => onChange({ ...filters, categories: filters.categories.filter((x) => x !== c) }) })
  );
  filters.owners.forEach((o) =>
    chips.push({ label: o, clear: () => onChange({ ...filters, owners: filters.owners.filter((x) => x !== o) }) })
  );
  if (filters.search) chips.push({ label: `Search: ${filters.search}`, clear: () => onChange({ ...filters, search: "" }) });
  if (filters.milestonesOnly) chips.push({ label: "Milestones only", clear: () => onChange({ ...filters, milestonesOnly: false }) });
  if (filters.atRiskOnly) chips.push({ label: "At risk", clear: () => onChange({ ...filters, atRiskOnly: false }) });
  if (filters.customerOwnedOnly) chips.push({ label: "Customer-owned", clear: () => onChange({ ...filters, customerOwnedOnly: false }) });
  if (filters.criticalPathOnly) chips.push({ label: "Critical path", clear: () => onChange({ ...filters, criticalPathOnly: false }) });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
      {chips.map((chip) => (
        <Badge key={chip.label} variant="secondary" className="gap-1 font-normal">
          {chip.label}
          <button
            type="button"
            onClick={chip.clear}
            aria-label={`Remove filter ${chip.label}`}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onChange({ ...EMPTY_FILTERS })}>
        Clear all
      </Button>
    </div>
  );
}
