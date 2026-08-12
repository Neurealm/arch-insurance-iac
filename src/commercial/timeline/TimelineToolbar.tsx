import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TimelineFilters } from "./TimelineFilters";
import type { TimelineFilterState } from "@/data/programTimelineMockData";
import type { ZoomLevel } from "./dates";
import { CalendarCheck, Maximize2, MoreHorizontal, RotateCcw, Route } from "lucide-react";

export type TimelineView = "timeline" | "milestones" | "customer" | "deliverables" | "readiness";

export const VIEW_OPTIONS: { value: TimelineView; label: string }[] = [
  { value: "timeline", label: "Timeline" },
  { value: "milestones", label: "Milestones" },
  { value: "customer", label: "Customer Activities" },
  { value: "deliverables", label: "Deliverables" },
  { value: "readiness", label: "Readiness" },
];

interface Props {
  view: TimelineView;
  onViewChange: (v: TimelineView) => void;
  zoom: ZoomLevel;
  onZoomChange: (z: ZoomLevel) => void;
  filters: TimelineFilterState;
  onFiltersChange: (f: TimelineFilterState) => void;
  activeFilterCount: number;
  showDependencies: boolean;
  onToggleDependencies: (v: boolean) => void;
  highlightCriticalPath: boolean;
  onToggleCriticalPath: (v: boolean) => void;
  onToday: () => void;
  onFullScreen: () => void;
  onReset: () => void;
}

export function TimelineToolbar({
  view,
  onViewChange,
  zoom,
  onZoomChange,
  filters,
  onFiltersChange,
  activeFilterCount,
  showDependencies,
  onToggleDependencies,
  highlightCriticalPath,
  onToggleCriticalPath,
  onToday,
  onFullScreen,
  onReset,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={view} onValueChange={(v) => onViewChange(v as TimelineView)}>
        <SelectTrigger className="h-9 w-[11rem]" aria-label="Timeline view selector">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {VIEW_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={zoom} onValueChange={(v) => onZoomChange(v as ZoomLevel)}>
        <SelectTrigger className="h-9 w-[8rem]" aria-label="Timeline zoom level">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="weeks">Weeks</SelectItem>
          <SelectItem value="months">Months</SelectItem>
          <SelectItem value="quarters">Quarters</SelectItem>
        </SelectContent>
      </Select>

      <TimelineFilters filters={filters} onChange={onFiltersChange} activeCount={activeFilterCount} />

      <Button variant="outline" size="sm" onClick={onToday} aria-label="Jump timeline to today">
        <CalendarCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
        Today
      </Button>

      <Button variant="outline" size="sm" onClick={onFullScreen} aria-label="Toggle full-screen timeline">
        <Maximize2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
        Full screen
      </Button>

      <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5">
        <Switch
          id="dep-toggle"
          checked={showDependencies}
          onCheckedChange={onToggleDependencies}
          aria-label="Toggle dependency connectors"
        />
        <Label htmlFor="dep-toggle" className="cursor-pointer text-xs font-medium">
          Dependencies
        </Label>
      </div>

      <Button
        variant={highlightCriticalPath ? "default" : "outline"}
        size="sm"
        onClick={() => onToggleCriticalPath(!highlightCriticalPath)}
        aria-pressed={highlightCriticalPath}
      >
        <Route className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
        Critical path
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="More timeline options">
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onReset}>
            <RotateCcw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
            Reset mock data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
