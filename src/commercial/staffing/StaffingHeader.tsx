import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronDown, Clock, Download, Filter, RotateCcw } from "lucide-react";
import { SCENARIOS, STAFFING_META, type ScenarioKey } from "@/data/staffingResourcesMockData";

export const STAFFING_EXPORT_OPTIONS = [
  "Export Staffing Summary",
  "Export Role Plan",
  "Export Capacity Forecast",
  "Export Open Positions",
  "Copy Executive Staffing Update",
];

export interface StaffingHeaderProps {
  scenario: ScenarioKey;
  onScenarioChange: (s: ScenarioKey) => void;
  onExport: (option: string) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  onReset: () => void;
  onNotifications: () => void;
  notificationCount: number;
  hasLocalChanges: boolean;
}

export function StaffingHeader({
  scenario,
  onScenarioChange,
  onExport,
  onOpenFilters,
  activeFilterCount,
  onReset,
  onNotifications,
  notificationCount,
  hasLocalChanges,
}: StaffingHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{STAFFING_META.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{STAFFING_META.subtitle}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gv-teal">
          {STAFFING_META.context}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {hasLocalChanges && (
            <Badge variant="outline" className="border-gv-warning/30 bg-gv-warning-soft text-gv-warning">
              Unsaved local changes
            </Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Export
                <ChevronDown className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              {STAFFING_EXPORT_OPTIONS.map((o) => (
                <DropdownMenuItem key={o} onSelect={() => onExport(o)}>
                  {o}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={onOpenFilters}>
            <Filter className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 rounded-full bg-gv-blue-soft px-1.5 text-xs font-semibold text-gv-blue">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <div className="w-[168px]">
            <Select value={scenario} onValueChange={(v) => onScenarioChange(v as ScenarioKey)}>
              <SelectTrigger aria-label="Staffing scenario" className="h-9">
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

          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Reset Mock Data
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative min-h-9 min-w-9"
            aria-label={`Notifications, ${notificationCount} unread`}
            onClick={onNotifications}
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {notificationCount > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gv-risk" aria-hidden="true" />
            )}
          </Button>

          <span
            className="grid h-9 w-9 place-items-center rounded-full bg-gv-navy text-xs font-semibold text-primary-foreground"
            role="img"
            aria-label="Signed in as Neurealm user"
          >
            {STAFFING_META.userInitials}
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          Last updated: {STAFFING_META.lastUpdated}
        </p>
      </div>
    </header>
  );
}
