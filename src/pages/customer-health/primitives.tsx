// Reusable presentation primitives for the Customer Health Dashboard.
//
// Health is never communicated by colour alone: every status token carries a
// label and a distinct glyph, so the state is readable in greyscale, by a
// screen reader and by customers with colour vision deficiency.

import { createContext, useContext, useEffect, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { HealthStatus, ImpactLevel, TelemetryFreshness } from "./types";
import { getImpactContext } from "./data";
import type { CustomerImpactContext } from "./types";
import { useObjectHighlight } from "./filters";

/* ------------------------------ status tokens ----------------------------- */

export interface StatusToken {
  label: string;
  /** Plain-language meaning for the customer. */
  meaning: string;
  /** Non-colour redundancy: a distinct shape/glyph per state. */
  glyph: string;
  text: string;
  dot: string;
  chip: string;
  stroke: string;
}

export const statusStyles: Record<HealthStatus, StatusToken> = {
  healthy: {
    label: "Healthy", meaning: "Your service is operating normally.", glyph: "✓",
    text: "text-emerald-700", dot: "bg-emerald-500", chip: "border-emerald-600/40 bg-emerald-500/10 text-emerald-800", stroke: "#059669",
  },
  advisory: {
    label: "Advisory", meaning: "Something underneath is being watched. Your service is available.", glyph: "!",
    text: "text-amber-700", dot: "bg-amber-500", chip: "border-amber-600/40 bg-amber-500/10 text-amber-800", stroke: "#d97706",
  },
  "at-risk": {
    label: "At Risk", meaning: "An elevated probability of future impact — not impact today.", glyph: "▲",
    text: "text-orange-700", dot: "bg-orange-500", chip: "border-orange-600/45 bg-orange-500/10 text-orange-800", stroke: "#ea580c",
  },
  degraded: {
    label: "Degraded", meaning: "Some users are experiencing a slower or reduced experience.", glyph: "◐",
    text: "text-orange-700", dot: "bg-orange-500", chip: "border-orange-600/45 bg-orange-500/10 text-orange-800", stroke: "#ea580c",
  },
  disrupted: {
    label: "Disrupted", meaning: "Your service is unavailable for some or all users.", glyph: "■",
    text: "text-red-700", dot: "bg-red-600", chip: "border-red-600/45 bg-red-500/10 text-red-800", stroke: "#dc2626",
  },
  incident: {
    label: "Incident", meaning: "An active incident is affecting service.", glyph: "✕",
    text: "text-rose-700", dot: "bg-rose-600", chip: "border-rose-600/45 bg-rose-500/10 text-rose-800", stroke: "#e11d48",
  },
  stale: {
    label: "Health verification delayed", meaning: "Recent telemetry has not arrived, so health cannot be confirmed.", glyph: "◔",
    text: "text-slate-700", dot: "bg-slate-500", chip: "border-slate-400 bg-slate-200/70 text-slate-800", stroke: "#64748b",
  },
  unknown: {
    label: "Unknown", meaning: "This object is not reporting health right now.", glyph: "?",
    text: "text-slate-700", dot: "bg-slate-400", chip: "border-slate-400 bg-slate-100 text-slate-700", stroke: "#94a3b8",
  },
  "no-data": {
    label: "No data", meaning: "Nothing of yours reports here, so there is nothing to measure.", glyph: "–",
    text: "text-slate-600", dot: "bg-slate-300", chip: "border-slate-300 bg-slate-50 text-slate-600", stroke: "#cbd5e1",
  },
  loading: {
    label: "Checking…", meaning: "Health is being established from the latest telemetry.", glyph: "◌",
    text: "text-slate-600", dot: "bg-slate-300", chip: "border-slate-300 bg-slate-100 text-slate-600", stroke: "#cbd5e1",
  },
  resolved: {
    label: "Resolved", meaning: "The condition has closed and no impact remains.", glyph: "✓",
    text: "text-sky-700", dot: "bg-sky-500", chip: "border-sky-600/40 bg-sky-500/10 text-sky-800", stroke: "#0284c7",
  },
  info: {
    label: "Info", meaning: "Context only — nothing is affecting your service.", glyph: "i",
    text: "text-sky-700", dot: "bg-sky-500", chip: "border-sky-600/40 bg-sky-500/10 text-sky-800", stroke: "#0284c7",
  },
};

export const impactStyles: Record<ImpactLevel, string> = {
  "NO CURRENT IMPACT": "border-emerald-600/40 bg-emerald-500/10 text-emerald-800",
  "POTENTIAL IMPACT": "border-amber-600/40 bg-amber-500/10 text-amber-800",
  "DEGRADED EXPERIENCE": "border-orange-600/45 bg-orange-500/10 text-orange-800",
  "SERVICE IMPACT": "border-rose-600/45 bg-rose-500/10 text-rose-800",
};

/**
 * Telemetry-aware health resolution.
 *
 * A stale reading is never rendered as Healthy: a service we cannot currently
 * verify is reported as "Health verification delayed", together with the last
 * moment health was confirmed.
 */
export function resolveHealth(status: HealthStatus, telemetry?: TelemetryFreshness) {
  if (!telemetry || telemetry.state === "fresh") {
    return { status, label: statusStyles[status].label, stale: false, subLabel: undefined as string | undefined };
  }
  if (telemetry.state === "missing") {
    return {
      status: "unknown" as HealthStatus,
      label: statusStyles.unknown.label,
      stale: true,
      subLabel: telemetry.lastConfirmedHealthy ? `Last confirmed healthy ${telemetry.lastConfirmedHealthy}` : "No recent telemetry received",
    };
  }
  return {
    status: "stale" as HealthStatus,
    label: "Health verification delayed",
    stale: true,
    subLabel: telemetry.lastConfirmedHealthy
      ? `Last confirmed healthy ${telemetry.lastConfirmedHealthy}`
      : "Awaiting the next confirmed health check",
  };
}

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

/**
 * Status marker. The coloured dot carries the glyph so the state survives
 * greyscale printing and colour vision deficiency; the accessible name always
 * spells the state out.
 */
export function StatusDot({ status, className, labelled = true }: { status: HealthStatus; className?: string; labelled?: boolean }) {
  const s = statusStyles[status];
  return (
    <span
      className={cn(
        "inline-grid h-[13px] w-[13px] shrink-0 place-items-center rounded-full text-[8px] font-bold leading-none text-white",
        s.dot,
        className,
      )}
    >
      <span aria-hidden>{s.glyph}</span>
      {labelled && <span className="sr-only">{s.label}</span>}
    </span>
  );
}

export function StatusChip({ status, label, className }: { status: HealthStatus; label?: string; className?: string }) {
  const s = statusStyles[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium", s.chip, className)}>
      <StatusDot status={status} labelled={false} className="h-[11px] w-[11px] text-[7px]" />
      {label ?? s.label}
    </span>
  );
}

/** Explicit banner used wherever health cannot currently be verified. */
export function StaleNotice({ telemetry, className }: { telemetry: TelemetryFreshness; className?: string }) {
  const r = resolveHealth("healthy", telemetry);
  return (
    <div className={cn("rounded-lg border border-slate-400 bg-slate-100 px-3 py-2", className)} role="status">
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-800">
        <StatusDot status={r.status} labelled={false} />
        {r.label}
      </div>
      <p className="mt-0.5 text-[11px] leading-snug text-slate-600">
        {r.subLabel}
        {telemetry.note ? ` · ${telemetry.note}` : ""}
      </p>
    </div>
  );
}

/** Neutral placeholder for objects with nothing to report. */
export function NoDataNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-[11.5px] leading-snug text-slate-600", className)}>
      {children}
    </div>
  );
}

/** Quiet loading placeholder. Respects reduced-motion via Tailwind's animate-pulse. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-200/80", className)} aria-hidden />;
}

export function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading the latest health information…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="mt-2 h-5 w-1/2" />
          <Skeleton className="mt-2 h-2.5 w-full" />
        </div>
      ))}
    </div>
  );
}

/** First-paint loading gate — brief, and only on the first visit of a session. */
export function useInitialLoad(ms = 420, key = "ch:loaded") {
  const [loading, setLoading] = useState(() => {
    try { return sessionStorage.getItem(key) !== "1"; } catch { return false; }
  });
  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => {
      setLoading(false);
      try { sessionStorage.setItem(key, "1"); } catch { /* ignore */ }
    }, ms);
    return () => window.clearTimeout(t);
  }, [loading, ms, key]);
  return loading;
}

export function Panel({
  title, subtitle, action, children, className,
}: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section aria-label={title} className={cn("rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50", className)}>
      <header className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-2.5">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[11.5px] text-slate-600">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}

/**
 * Interactive wrapper: pointer cursor, subtle hover elevation and a concise
 * context preview describing what the object means to the customer. The
 * preview appears on hover *and* on keyboard focus, and is wired to the
 * control with aria-describedby so it is announced rather than merely seen.
 */
export function Interactive({
  tooltip, onClick, className, children, ariaLabel, correlationKey, footer,
}: {
  tooltip: string; onClick: () => void; className?: string; children: ReactNode;
  ariaLabel?: string;
  /** Rendered below the clickable body (never nested inside the button). */
  footer?: ReactNode;
  /** Optional key that wires this object into the cross-highlight graph. */
  correlationKey?: string;
}) {
  const { bind, className: corrClass } = useObjectHighlight(correlationKey);
  const tipId = useId();
  return (
    <div className="group/int relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        aria-describedby={tipId}
        {...bind}
        className={cn(
          "w-full cursor-pointer text-left transition-all duration-200 ease-out",
          "hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-lg hover:shadow-slate-300/40",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          className,
          corrClass,
        )}
      >
        {children}
      </button>
      {footer && <div className="mt-1.5 flex justify-end">{footer}</div>}
      <span
        id={tipId}
        role="tooltip"
        className="pointer-events-none absolute left-3 top-full z-40 mt-1 max-w-xs -translate-y-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] leading-snug text-slate-700 opacity-0 shadow-xl transition-[opacity,transform] duration-150 ease-out group-hover/int:translate-y-0 group-hover/int:opacity-100 group-focus-within/int:translate-y-0 group-focus-within/int:opacity-100"
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
        className={cn("h-full rounded-full transition-[width] duration-300 ease-out", statusStyles[status].dot)}
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
        <p className="mt-0.5 text-[12.5px] text-slate-600">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}
