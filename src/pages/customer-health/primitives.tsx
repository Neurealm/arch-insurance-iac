// Reusable dark-theme presentation primitives for the Customer Health Dashboard.

import { createContext, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { HealthStatus, ImpactLevel } from "./types";
import { getImpactContext } from "./data";
import type { CustomerImpactContext } from "./types";

/* ------------------------------ status tokens ----------------------------- */

export const statusStyles: Record<HealthStatus, { label: string; text: string; dot: string; chip: string; stroke: string }> = {
  healthy:  { label: "Healthy",  text: "text-emerald-400", dot: "bg-emerald-400", chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300", stroke: "#34d399" },
  advisory: { label: "Advisory", text: "text-amber-400",   dot: "bg-amber-400",   chip: "border-amber-500/30 bg-amber-500/10 text-amber-300",     stroke: "#fbbf24" },
  degraded: { label: "Degraded", text: "text-amber-400",   dot: "bg-amber-400",   chip: "border-amber-500/30 bg-amber-500/10 text-amber-300",     stroke: "#fbbf24" },
  "at-risk":{ label: "At Risk",  text: "text-orange-400",  dot: "bg-orange-400",  chip: "border-orange-500/30 bg-orange-500/10 text-orange-300",  stroke: "#fb923c" },
  incident: { label: "Incident", text: "text-rose-400",    dot: "bg-rose-400",    chip: "border-rose-500/30 bg-rose-500/10 text-rose-300",        stroke: "#fb7185" },
  info:     { label: "Info",     text: "text-sky-400",     dot: "bg-sky-400",     chip: "border-sky-500/30 bg-sky-500/10 text-sky-300",           stroke: "#38bdf8" },
};

export const impactStyles: Record<ImpactLevel, string> = {
  "NO CURRENT IMPACT": "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "POTENTIAL IMPACT": "border-amber-500/40 bg-amber-500/10 text-amber-300",
  "DEGRADED EXPERIENCE": "border-orange-500/40 bg-orange-500/10 text-orange-300",
  "SERVICE IMPACT": "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

/* ------------------------------ drawer context ---------------------------- */

interface DrawerApi {
  open: (contextId: string) => void;
  close: () => void;
  context: CustomerImpactContext | null;
}
const DrawerCtx = createContext<DrawerApi>({ open: () => {}, close: () => {}, context: null });

export function ImpactDrawerProvider({ children }: { children: (api: DrawerApi) => ReactNode }) {
  const [context, setContext] = useState<CustomerImpactContext | null>(null);
  const api: DrawerApi = {
    open: (id) => setContext(getImpactContext(id)),
    close: () => setContext(null),
    context,
  };
  return <DrawerCtx.Provider value={api}>{children(api)}</DrawerCtx.Provider>;
}

export function useImpactDrawer() {
  return useContext(DrawerCtx);
}

/* -------------------------------- primitives ------------------------------ */

export function StatusDot({ status, className }: { status: HealthStatus; className?: string }) {
  return <span aria-hidden className={cn("inline-block h-2 w-2 rounded-full", statusStyles[status].dot, className)} />;
}

export function StatusChip({ status, label }: { status: HealthStatus; label?: string }) {
  const s = statusStyles[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium", s.chip)}>
      <StatusDot status={status} />
      {label ?? s.label}
    </span>
  );
}

export function Panel({
  title, subtitle, action, children, className,
}: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50", className)}>
      <header className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-2.5">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[11.5px] text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}

/**
 * Interactive wrapper: pointer cursor, hover elevation and a concise tooltip
 * describing what the object means to the customer. Clicking opens the drawer.
 */
export function Interactive({
  tooltip, onClick, className, children, ariaLabel,
}: { tooltip: string; onClick: () => void; className?: string; children: ReactNode; ariaLabel?: string }) {
  return (
    <div className="group/int relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={cn(
          "w-full cursor-pointer text-left transition-all duration-200 ease-out",
          "hover:-translate-y-[1px] hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg hover:shadow-slate-300/40",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70",
          className,
        )}
      >
        {children}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-3 top-full z-40 mt-1 hidden max-w-xs rounded-md border border-slate-300 bg-white/95 px-2.5 py-1.5 text-[11px] leading-snug text-slate-600 shadow-xl group-hover/int:block"
      >
        {tooltip}
      </span>
    </div>
  );
}

/** Compact inline sparkline. */
export function Sparkline({ points, status, className }: { points: number[]; status: HealthStatus; className?: string }) {
  const max = Math.max(...points), min = Math.min(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${28 - ((p - min) / span) * 24 - 2}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className={cn("h-8 w-full", className)} aria-hidden>
      <polyline points={d} fill="none" stroke={statusStyles[status].stroke} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function MetricBar({ value, status }: { value: number; status: HealthStatus }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className={cn("h-full rounded-full transition-[width] duration-200", statusStyles[status].dot)}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-0.5 text-[12.5px] text-slate-500">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}
