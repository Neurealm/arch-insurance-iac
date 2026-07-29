import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Download, RotateCcw, ChevronDown, Clock } from "lucide-react";
import { GOVERNANCE_META } from "@/data/neurealmGovernanceMockData";

const EXPORT_OPTIONS = [
  "Export Governance Summary",
  "Export Risks and Decisions",
  "Export Governance Calendar",
  "Export RACI Snapshot",
  "Copy Executive Update",
];

export interface GovernanceHeaderProps {
  view: string;
  onViewChange: (v: string) => void;
  onExport: (option: string) => void;
  onReset: () => void;
  onNotifications: () => void;
  notificationCount: number;
  hasLocalChanges: boolean;
}

export function GovernanceHeader({
  view,
  onViewChange,
  onExport,
  onReset,
  onNotifications,
  notificationCount,
  hasLocalChanges,
}: GovernanceHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{GOVERNANCE_META.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{GOVERNANCE_META.subtitle}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gv-teal">
          {GOVERNANCE_META.context}
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
            <DropdownMenuContent align="end" className="w-56">
              {EXPORT_OPTIONS.map((o) => (
                <DropdownMenuItem key={o} onSelect={() => onExport(o)}>
                  {o}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={view} onValueChange={onViewChange}>
            <SelectTrigger className="h-9 w-[180px]" aria-label="Governance view">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="executive">Executive view</SelectItem>
              <SelectItem value="program">Program view</SelectItem>
              <SelectItem value="operational">Operational view</SelectItem>
              <SelectItem value="full">Full governance view</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Reset mock data
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="relative h-9 w-9"
            aria-label={`Notifications, ${notificationCount} unread`}
            onClick={onNotifications}
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-gv-risk px-1.5 text-[10px] font-semibold leading-4 text-white">
                {notificationCount}
              </span>
            )}
          </Button>

          <span
            className="grid h-9 w-9 place-items-center rounded-full bg-gv-navy text-xs font-semibold text-white"
            aria-label="Signed in as Neurealm governance user"
            role="img"
          >
            {GOVERNANCE_META.userInitials}
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          Last updated: {GOVERNANCE_META.lastUpdated}
        </p>
      </div>
    </header>
  );
}
