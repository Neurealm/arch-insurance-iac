import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Share2, Download, Filter, Check, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type RangeKey = "live" | "24h" | "7d" | "30d" | "90d" | "custom";

export type RangeState = {
  key: RangeKey;
  from?: Date;
  to?: Date;
};

export const RANGE_OPTIONS: { key: RangeKey; label: string; scale: number }[] = [
  { key: "live", label: "Live (Today)", scale: 1 },
  { key: "24h", label: "Last 24 hours", scale: 1.05 },
  { key: "7d", label: "Last 7 days", scale: 1.4 },
  { key: "30d", label: "Last 30 days", scale: 2.1 },
  { key: "90d", label: "Last 90 days", scale: 3.2 },
  { key: "custom", label: "Custom range", scale: 1.6 },
];

export function rangeScale(range: RangeState): number {
  const opt = RANGE_OPTIONS.find((o) => o.key === range.key);
  if (range.key === "custom" && range.from && range.to) {
    const days = Math.max(1, Math.round((+range.to - +range.from) / 86400000));
    return Math.min(4, 0.6 + days / 14);
  }
  return opt?.scale ?? 1;
}

export type FilterGroup = {
  key: string;
  label: string;
  options: string[];
};

type Props = {
  range: RangeState;
  onRangeChange: (r: RangeState) => void;
  autoRefresh: boolean;
  onAutoRefreshChange: (v: boolean) => void;
  filters?: FilterGroup[];
  selectedFilters?: Record<string, string[]>;
  onFiltersChange?: (sel: Record<string, string[]>) => void;
  showFilterButton?: boolean;
  // current "now" used for the date display; updates with auto-refresh
  now?: Date;
};

function rangeLabel(range: RangeState, now: Date) {
  if (range.key === "custom" && range.from && range.to) {
    return `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`;
  }
  const opt = RANGE_OPTIONS.find((o) => o.key === range.key);
  return `${format(now, "MMM d, yyyy")}  ·  ${format(now, "h:mm a")}  ·  ${opt?.label ?? ""}`;
}

export function DashboardToolbar({
  range,
  onRangeChange,
  autoRefresh,
  onAutoRefreshChange,
  filters = [],
  selectedFilters = {},
  onFiltersChange,
  showFilterButton = true,
  now: nowProp,
}: Props) {
  const [internalNow, setInternalNow] = useState<Date>(nowProp ?? new Date());
  const now = nowProp ?? internalNow;

  useEffect(() => {
    if (!autoRefresh || nowProp) return;
    const id = setInterval(() => setInternalNow(new Date()), 30000);
    return () => clearInterval(id);
  }, [autoRefresh, nowProp]);

  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({
    from: range.from,
    to: range.to,
  });

  const activeFilterCount = useMemo(
    () => Object.values(selectedFilters).reduce((acc, v) => acc + v.length, 0),
    [selectedFilters]
  );

  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      {/* Date / Range */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-2 text-xs text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span className="font-medium">{rangeLabel(range, now)}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[480px] p-0">
          <div className="grid grid-cols-2">
            <div className="border-r border-border p-2 space-y-0.5">
              {RANGE_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => {
                    if (o.key === "custom") {
                      onRangeChange({ key: "custom", from: customRange.from, to: customRange.to });
                    } else {
                      onRangeChange({ key: o.key });
                    }
                  }}
                  className={cn(
                    "w-full text-left text-xs px-2.5 py-2 rounded-md hover:bg-slate-50 flex items-center justify-between",
                    range.key === o.key && "bg-blue-50 text-blue-700 font-medium"
                  )}
                >
                  {o.label}
                  {range.key === o.key && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
            <div className="p-2">
              <div className="text-[11px] font-semibold text-slate-700 px-1 pt-1 pb-1">Custom range</div>
              <Calendar
                mode="range"
                selected={{ from: customRange.from, to: customRange.to }}
                onSelect={(r) => {
                  setCustomRange({ from: r?.from, to: r?.to });
                  if (r?.from && r?.to) {
                    onRangeChange({ key: "custom", from: r.from, to: r.to });
                  }
                }}
                numberOfMonths={1}
                className={cn("p-2 pointer-events-auto")}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Auto-refresh */}
      <div className="inline-flex items-center gap-2 text-xs text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
        <span>Auto-refresh</span>
        <span className={autoRefresh ? "text-emerald-600 font-medium" : "text-slate-400 font-medium"}>
          {autoRefresh ? "On" : "Off"}
        </span>
        <Switch checked={autoRefresh} onCheckedChange={onAutoRefreshChange} className="scale-75 -mr-1" />
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => toast({ title: "Share link copied", description: "Dashboard link copied to clipboard." })}
      >
        <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => toast({ title: "Export started", description: "Your CSV export is being prepared." })}
      >
        <Download className="h-3.5 w-3.5 mr-1.5" /> Export
      </Button>

      {showFilterButton && (
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-white text-blue-700 text-[10px] font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-0">
            <div className="px-3 py-2 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Filters</span>
              <button
                className="text-[11px] text-blue-600 hover:underline"
                onClick={() => onFiltersChange?.({})}
              >
                Reset
              </button>
            </div>
            <div className="max-h-72 overflow-auto p-3 space-y-3">
              {filters.length === 0 && (
                <div className="text-[11px] text-slate-500">No filters available.</div>
              )}
              {filters.map((g) => (
                <div key={g.key}>
                  <div className="text-[11px] font-semibold text-slate-700 mb-1">{g.label}</div>
                  <div className="space-y-1.5">
                    {g.options.map((opt) => {
                      const checked = (selectedFilters[g.key] ?? []).includes(opt);
                      return (
                        <label key={opt} className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              const cur = new Set(selectedFilters[g.key] ?? []);
                              if (v) cur.add(opt);
                              else cur.delete(opt);
                              onFiltersChange?.({ ...selectedFilters, [g.key]: Array.from(cur) });
                            }}
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

/* ---------- Helpers exposed to pages ---------- */

export function useDashboardFilters(initial?: Partial<RangeState>) {
  const [range, setRange] = useState<RangeState>({ key: initial?.key ?? "live", from: initial?.from, to: initial?.to });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const scale = rangeScale(range);
  return { range, setRange, autoRefresh, setAutoRefresh, selectedFilters, setSelectedFilters, scale };
}

/* Format a number that scales with range, preserving format hints */
export function scaleNumber(value: number, scale: number, opts?: { decimals?: number; min?: number; max?: number }) {
  const v = value * scale;
  if (opts?.max !== undefined) return Math.min(opts.max, v);
  return Number(v.toFixed(opts?.decimals ?? 0));
}

export function scaleSeries<T extends Record<string, any>>(series: T[], scale: number, keys: (keyof T)[]) {
  return series.map((row) => {
    const next: any = { ...row };
    keys.forEach((k) => {
      if (typeof row[k] === "number") next[k] = +(row[k] * scale).toFixed(2);
    });
    return next as T;
  });
}