/**
 * AIM-005 — shared lifecycle presentation primitives.
 *
 * Status is always communicated with text as well as colour, and every state
 * frame (loading, empty, error) is rendered here so no lifecycle panel can
 * ever render blank.
 */

import * as React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DriftStatus, GateStatus, RetrainingLevel } from "./lifecycleTypes";
import type { LifecyclePanelState } from "./useLifecycleState";

/* -------------------------------- badges --------------------------------- */

const gateTone: Record<GateStatus, string> = {
  Pass: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Conditional Pass": "border-sky-200 bg-sky-50 text-sky-800",
  Review: "border-amber-200 bg-amber-50 text-amber-800",
  Fail: "border-rose-200 bg-rose-50 text-rose-800",
  "Insufficient Evidence": "border-slate-200 bg-slate-50 text-slate-700",
};

const gateGlyph: Record<GateStatus, string> = {
  Pass: "✓",
  "Conditional Pass": "≈",
  Review: "!",
  Fail: "✕",
  "Insufficient Evidence": "?",
};

export function GateBadge({ status, className }: { status: GateStatus; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-px text-[10px] font-semibold", gateTone[status], className)}
      data-status={status}
    >
      <span aria-hidden>{gateGlyph[status]}</span>
      {status}
    </span>
  );
}

const driftTone: Record<DriftStatus, string> = {
  Stable: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Watch: "border-amber-200 bg-amber-50 text-amber-800",
  "Action Required": "border-orange-200 bg-orange-50 text-orange-800",
  Blocking: "border-rose-200 bg-rose-50 text-rose-800",
  "Insufficient Evidence": "border-slate-200 bg-slate-50 text-slate-700",
};

const driftGlyph: Record<DriftStatus, string> = {
  Stable: "✓",
  Watch: "•",
  "Action Required": "!",
  Blocking: "✕",
  "Insufficient Evidence": "?",
};

export function DriftBadge({ status }: { status: DriftStatus }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-px text-[10px] font-semibold", driftTone[status])}
      data-status={status}
    >
      <span aria-hidden>{driftGlyph[status]}</span>
      {status}
    </span>
  );
}

const retrainTone: Record<RetrainingLevel, string> = {
  "Retraining Required": "border-rose-200 bg-rose-50 text-rose-800",
  "Retraining Recommended": "border-amber-200 bg-amber-50 text-amber-800",
  Monitor: "border-sky-200 bg-sky-50 text-sky-800",
  "No Action": "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function RetrainingBadge({ level }: { level: RetrainingLevel }) {
  return (
    <span className={cn("inline-flex items-center rounded border px-1.5 py-px text-[10px] font-semibold", retrainTone[level])}>
      {level}
    </span>
  );
}

/* ------------------------------- structure -------------------------------- */

export function LifecycleSection({
  title, description, actions, children, className, testId,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  testId?: string;
}) {
  const headingId = React.useId();
  return (
    <section
      aria-labelledby={headingId}
      data-testid={testId}
      className={cn("rounded-lg border border-slate-200 bg-white p-3", className)}
    >
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 id={headingId} className="text-[12px] font-semibold text-slate-900">{title}</h4>
          {description && <p className="text-[10.5px] text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-1">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export function LifecycleStat({
  label, value, hint, tone = "neutral",
}: { label: string; value: string; hint?: string; tone?: "neutral" | "positive" | "warning" | "negative" }) {
  const toneClass =
    tone === "positive" ? "text-emerald-700" : tone === "warning" ? "text-amber-700" : tone === "negative" ? "text-rose-700" : "text-slate-900";
  return (
    <div className="rounded border border-slate-200 bg-slate-50/70 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={cn("text-[13px] font-semibold leading-tight", toneClass)}>{value}</div>
      {hint && <div className="text-[10px] text-slate-500">{hint}</div>}
    </div>
  );
}

export function LifecycleButton({
  children, onClick, active, disabled, title, tone = "default", type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  tone?: "default" | "primary" | "danger";
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={active === undefined ? undefined : active}
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-1 text-[10.5px] font-medium shadow-sm transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        tone === "primary" && "border-blue-300 bg-blue-600 text-white hover:bg-blue-700",
        tone === "danger" && "border-rose-300 bg-white text-rose-700 hover:bg-rose-50",
        tone === "default" && (active ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"),
      )}
    >
      {children}
    </button>
  );
}

/**
 * Renders loading, empty and error states so a lifecycle panel is never blank.
 * Returns null when the state is ready and the caller should render content.
 */
export function LifecycleStateFrame({
  state, title, emptyReason, activeFilters, onClearFilters, errorMessage, onRetry, heightClass = "min-h-[160px]",
}: {
  state: LifecyclePanelState;
  title: string;
  emptyReason?: string;
  activeFilters?: string;
  onClearFilters?: () => void;
  errorMessage?: string;
  onRetry?: () => void;
  heightClass?: string;
}) {
  if (state === "ready") return null;

  if (state === "loading") {
    return (
      <div className={cn("flex flex-col gap-2", heightClass)} role="status" aria-live="polite" data-testid="lifecycle-loading">
        <span className="sr-only">Loading {title}</span>
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="flex-1 animate-pulse rounded bg-slate-50" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div
        data-testid="lifecycle-empty"
        className={cn("flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center", heightClass)}
      >
        <Info className="h-4 w-4 text-slate-400" aria-hidden />
        <p className="text-[11.5px] font-medium text-slate-700">{emptyReason ?? `No ${title.toLowerCase()} for the current scope`}</p>
        {activeFilters && <p className="text-[10.5px] text-slate-500">Active filters: {activeFilters}</p>}
        <p className="text-[10.5px] text-slate-500">Fallback scope: all regions, all products, 6 hour horizon.</p>
        {onClearFilters && (
          <LifecycleButton onClick={onClearFilters}>Clear filters</LifecycleButton>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      data-testid="lifecycle-error"
      className={cn("flex flex-col items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50/70 p-4 text-center", heightClass)}
    >
      <AlertTriangle className="h-4 w-4 text-rose-600" aria-hidden />
      <p className="text-[11.5px] font-medium text-rose-800">{errorMessage ?? `${title} could not be loaded`}</p>
      <p className="text-[10.5px] text-rose-700">The lifecycle service did not respond. Retry, or continue with the remaining tabs.</p>
      {onRetry && <LifecycleButton onClick={onRetry} tone="danger">Retry</LifecycleButton>}
    </div>
  );
}

/** Horizontal comparison bar used across coverage, composition and drift views. */
export function ComparisonBar({
  label, valuePct, referencePct, referenceLabel = "Estate", color = "#2563eb", selected, onSelect,
}: {
  label: string;
  valuePct: number;
  referencePct?: number;
  referenceLabel?: string;
  color?: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const body = (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[11px] text-slate-700">{label}</span>
        <span className="shrink-0 text-[11px] font-semibold text-slate-900">
          {valuePct}%
          {typeof referencePct === "number" && (
            <span className="ml-1 font-normal text-slate-500">{referenceLabel} {referencePct}%</span>
          )}
        </span>
      </div>
      <div className="relative mt-0.5 h-2 w-full rounded bg-slate-100">
        <div className="h-2 rounded" style={{ width: `${Math.min(100, Math.max(0, valuePct))}%`, backgroundColor: color }} />
        {typeof referencePct === "number" && (
          <span
            aria-hidden
            className="absolute top-[-2px] h-3 w-px bg-slate-500"
            style={{ left: `${Math.min(100, Math.max(0, referencePct))}%` }}
          />
        )}
      </div>
    </>
  );

  if (!onSelect) return <div className="py-0.5">{body}</div>;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={Boolean(selected)}
      className={cn(
        "w-full rounded px-1 py-0.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        selected ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-slate-50",
      )}
    >
      {body}
    </button>
  );
}
