import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import {
  EMPTY_STAFFING_FILTERS,
  FUNCTION_LABELS,
  LOCATION_MODELS,
  OPERATING_STRUCTURES,
  OPERATIONAL_PHASES,
  RESOURCE_TYPES,
  SCENARIOS,
  type PhaseKey,
  type RoleStatus,
  type ScenarioKey,
  type StaffingFilterState,
} from "@/data/staffingResourcesMockData";

const STATUSES: RoleStatus[] = ["On Track", "Attention Required", "At Risk"];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Group<T extends string>({
  title,
  options,
  selected,
  onToggle,
  labelFor,
}: {
  title: string;
  options: readonly T[];
  selected: T[];
  onToggle: (v: T) => void;
  labelFor?: (v: T) => string;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</legend>
      {options.map((o) => (
        <div key={o} className="flex items-center gap-2">
          <Checkbox id={`f-${title}-${o}`} checked={selected.includes(o)} onCheckedChange={() => onToggle(o)} />
          <Label htmlFor={`f-${title}-${o}`} className="text-sm font-normal">
            {labelFor ? labelFor(o) : o}
          </Label>
        </div>
      ))}
    </fieldset>
  );
}

export function StaffingFilters({
  open,
  onOpenChange,
  filters,
  onChange,
  scenario,
  onScenarioChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  filters: StaffingFilterState;
  onChange: (f: StaffingFilterState) => void;
  scenario: ScenarioKey;
  onScenarioChange: (s: ScenarioKey) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Filter the staffing plan. Filters apply to browser state only.</SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-6">
          <Group
            title="Operational Phase"
            options={OPERATIONAL_PHASES.map((p) => p.key) as PhaseKey[]}
            selected={filters.phases}
            onToggle={(v) => onChange({ ...filters, phases: toggle(filters.phases, v) })}
            labelFor={(v) => OPERATIONAL_PHASES.find((p) => p.key === v)?.title ?? v}
          />
          <Group
            title="Function"
            options={Object.keys(FUNCTION_LABELS)}
            selected={filters.functions}
            onToggle={(v) => onChange({ ...filters, functions: toggle(filters.functions, v) })}
            labelFor={(v) => FUNCTION_LABELS[v]}
          />
          <Group
            title="Operating Structure"
            options={Array.from(new Set(OPERATING_STRUCTURES.map((s) => s.name)))}
            selected={filters.structures}
            onToggle={(v) => onChange({ ...filters, structures: toggle(filters.structures, v) })}
          />
          <Group
            title="Role Status"
            options={STATUSES}
            selected={filters.statuses}
            onToggle={(v) => onChange({ ...filters, statuses: toggle(filters.statuses, v) })}
          />
          <Group
            title="Resource Type"
            options={RESOURCE_TYPES}
            selected={filters.resourceTypes}
            onToggle={(v) => onChange({ ...filters, resourceTypes: toggle(filters.resourceTypes, v) })}
          />
          <Group
            title="Location Model"
            options={LOCATION_MODELS}
            selected={filters.locationModels}
            onToggle={(v) => onChange({ ...filters, locationModels: toggle(filters.locationModels, v) })}
          />

          <div className="space-y-2">
            <Label htmlFor="utilization-range" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Minimum utilization: {filters.utilizationMin}%
            </Label>
            <Slider
              id="utilization-range"
              min={0}
              max={100}
              step={5}
              value={[filters.utilizationMin]}
              onValueChange={([v]) => onChange({ ...filters, utilizationMin: v })}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick filters</legend>
            {(
              [
                ["criticalOnly", "Critical roles only"],
                ["openOnly", "Open positions only"],
                ["gapsOnly", "Capacity gaps only"],
                ["atRiskOnly", "At-risk roles only"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={`qf-${key}`}
                  checked={filters[key]}
                  onCheckedChange={() => onChange({ ...filters, [key]: !filters[key] })}
                />
                <Label htmlFor={`qf-${key}`} className="text-sm font-normal">
                  {label}
                </Label>
              </div>
            ))}
          </fieldset>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scenario</Label>
            <Select value={scenario} onValueChange={(v) => onScenarioChange(v as ScenarioKey)}>
              <SelectTrigger aria-label="Scenario filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCENARIOS.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 pb-6">
            <Button onClick={() => onOpenChange(false)}>Apply Filters</Button>
            <Button variant="outline" onClick={() => onChange({ ...EMPTY_STAFFING_FILTERS })}>
              Clear Filters
            </Button>
            <Button variant="ghost" onClick={() => toast.success("View saved for this session only.")}>
              Save View
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function StaffingFilterChips({
  filters,
  onChange,
}: {
  filters: StaffingFilterState;
  onChange: (f: StaffingFilterState) => void;
}) {
  const chips: { label: string; clear: () => void }[] = [];

  filters.phases.forEach((p) =>
    chips.push({
      label: OPERATIONAL_PHASES.find((x) => x.key === p)?.title ?? p,
      clear: () => onChange({ ...filters, phases: filters.phases.filter((x) => x !== p) }),
    }),
  );
  filters.functions.forEach((f) =>
    chips.push({
      label: FUNCTION_LABELS[f] ?? f,
      clear: () => onChange({ ...filters, functions: filters.functions.filter((x) => x !== f) }),
    }),
  );
  filters.structures.forEach((s) =>
    chips.push({ label: s, clear: () => onChange({ ...filters, structures: filters.structures.filter((x) => x !== s) }) }),
  );
  filters.statuses.forEach((s) =>
    chips.push({ label: s, clear: () => onChange({ ...filters, statuses: filters.statuses.filter((x) => x !== s) }) }),
  );
  filters.resourceTypes.forEach((s) =>
    chips.push({ label: s, clear: () => onChange({ ...filters, resourceTypes: filters.resourceTypes.filter((x) => x !== s) }) }),
  );
  filters.locationModels.forEach((s) =>
    chips.push({ label: s, clear: () => onChange({ ...filters, locationModels: filters.locationModels.filter((x) => x !== s) }) }),
  );
  if (filters.utilizationMin > 0)
    chips.push({ label: `Utilization ≥ ${filters.utilizationMin}%`, clear: () => onChange({ ...filters, utilizationMin: 0 }) });
  if (filters.criticalOnly) chips.push({ label: "Critical roles only", clear: () => onChange({ ...filters, criticalOnly: false }) });
  if (filters.openOnly) chips.push({ label: "Open positions only", clear: () => onChange({ ...filters, openOnly: false }) });
  if (filters.gapsOnly) chips.push({ label: "Capacity gaps only", clear: () => onChange({ ...filters, gapsOnly: false }) });
  if (filters.atRiskOnly) chips.push({ label: "At-risk roles only", clear: () => onChange({ ...filters, atRiskOnly: false }) });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" data-guide-target="staffing-filters" aria-label="Active filters">
      {chips.map((c) => (
        <Badge key={c.label} variant="outline" className="gap-1 font-normal">
          {c.label}
          <button
            type="button"
            aria-label={`Remove filter ${c.label}`}
            onClick={c.clear}
            className="rounded-full hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </Badge>
      ))}
    </div>
  );
}

export function countActiveFilters(f: StaffingFilterState): number {
  return (
    f.phases.length +
    f.functions.length +
    f.structures.length +
    f.statuses.length +
    f.resourceTypes.length +
    f.locationModels.length +
    (f.utilizationMin > 0 ? 1 : 0) +
    Number(f.criticalOnly) +
    Number(f.openOnly) +
    Number(f.gapsOnly) +
    Number(f.atRiskOnly) +
    (f.search ? 1 : 0)
  );
}
