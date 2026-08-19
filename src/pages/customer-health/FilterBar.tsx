// Compact filter control that sits directly beneath the dashboard header.

import { Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { deployments, regions } from "./data";
import {
  ENVIRONMENT_LABELS, TIME_LABELS, VIEW_LABELS,
  useFilters,
  type EnvironmentFilter, type FilterView, type TimeRange,
} from "./filters";

const VIEWS: FilterView[] = ["all", "affecting", "at-risk", "advisories", "incidents", "maintenance"];
const ENVIRONMENTS: EnvironmentFilter[] = ["all", "Production", "Disaster Recovery", "Non-production"];
const RANGES: TimeRange[] = ["24h", "7d", "30d", "90d"];

function Select({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const active = value !== "all" && value !== "24h";
  return (
    <label className="flex items-center gap-1.5">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={cn(
          "h-7 max-w-[190px] cursor-pointer rounded-md border bg-white px-2 text-[11.5px] text-slate-600 transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70",
          active ? "border-sky-300 bg-sky-50 text-sky-800" : "border-slate-200 hover:border-slate-300",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export function FilterBar() {
  const { filters, set, reset, isDefault, activeCount, viewHint } = useFilters();

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
          <Filter className="h-3.5 w-3.5" aria-hidden /> View
        </span>

        <div role="group" aria-label="Dashboard view" className="flex flex-wrap items-center gap-1.5">
          {VIEWS.map((v) => {
            const selected = filters.view === v;
            const primary = v === "affecting";
            return (
              <button
                key={v}
                type="button"
                aria-pressed={selected}
                onClick={() => set("view", v)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors duration-200",
                  selected
                    ? "border-sky-600 bg-sky-600 text-white"
                    : primary
                      ? "border-sky-300 bg-sky-50 text-sky-800 hover:border-sky-400"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
                )}
              >
                {VIEW_LABELS[v]}
              </button>
            );
          })}
        </div>

        <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" aria-hidden />

        <div className="flex flex-wrap items-center gap-1.5">
          <Select
            label="Filter by deployment"
            value={filters.deployment}
            onChange={(v) => set("deployment", v)}
            options={[{ value: "all", label: "All deployments" }, ...deployments.map((d) => ({ value: d.id, label: d.name }))]}
          />
          <Select
            label="Filter by region"
            value={filters.region}
            onChange={(v) => set("region", v)}
            options={[{ value: "all", label: "All regions" }, ...regions.map((r) => ({ value: r.id, label: r.name }))]}
          />
          <Select
            label="Filter by environment"
            value={filters.environment}
            onChange={(v) => set("environment", v as EnvironmentFilter)}
            options={ENVIRONMENTS.map((e) => ({ value: e, label: ENVIRONMENT_LABELS[e] }))}
          />
          <Select
            label="Filter by time range"
            value={filters.timeRange}
            onChange={(v) => set("timeRange", v as TimeRange)}
            options={RANGES.map((r) => ({ value: r, label: TIME_LABELS[r] }))}
          />
        </div>

        {!isDefault && (
          <button
            type="button"
            onClick={reset}
            className="ml-auto flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-[11.5px] text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
          >
            <RotateCcw className="h-3 w-3" aria-hidden /> Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
          </button>
        )}
      </div>

      <p className="mt-2 text-[11px] leading-snug text-slate-500">
        {viewHint} Filtered-out conditions are not removed — they are shown subdued so you keep the wider picture.
      </p>
    </div>
  );
}
