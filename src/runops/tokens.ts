/**
 * Shared design tokens for RunOps Runbooks.
 *
 * Semantic status maps only — visual primitives (typography, spacing, radius,
 * shadow, surface) are the project's existing Tailwind + shadcn tokens.
 * Import these when you need to color/label a status; never inline the
 * mapping in a component.
 */

export type Tone = {
  /** Tailwind classes for a filled badge/pill. */
  chip: string;
  /** Tailwind classes for a small dot indicator. */
  dot: string;
  /** Human-readable label. */
  label: string;
};

const T = (chip: string, dot: string, label: string): Tone => ({ chip, dot, label });

/* ------------------------------ Typography ----------------------------- */
export const typography = {
  h1:      "text-[22px] font-semibold leading-tight",
  h2:      "text-[16px] font-semibold leading-tight",
  h3:      "text-[13px] font-semibold uppercase tracking-wider text-slate-500",
  body:    "text-[13px] leading-relaxed text-slate-700",
  bodyMd:  "text-[12.5px] leading-relaxed text-slate-700",
  small:   "text-[11.5px] text-slate-600",
  micro:   "text-[10.5px] uppercase tracking-wider text-slate-500",
  mono:    "font-mono text-[11.5px] text-slate-700",
} as const;

/* -------------------------- Spacing / borders ------------------------- */
export const spacing = {
  page:      "p-5",
  section:   "space-y-4",
  cardPad:   "p-4",
  gap:       "gap-3",
} as const;

export const borders = {
  hairline: "border border-slate-200",
  divider:  "border-t border-slate-200",
  focus:    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20",
} as const;

export const radius = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  pill: "rounded-full",
} as const;

export const shadows = {
  card:     "shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
  raised:   "shadow-[0_4px_14px_-6px_rgba(15,23,42,0.12)]",
  overlay:  "shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)]",
} as const;

export const surfaces = {
  page:      "bg-slate-50",
  card:      "bg-white",
  subtle:    "bg-slate-50/60",
  raised:    "bg-white",
  inverted:  "bg-slate-900 text-white",
} as const;

/* --------------------------- Semantic statuses ------------------------ */

export const serviceHealthTone = {
  "Healthy":            T("bg-emerald-100 text-emerald-800 border-emerald-200", "bg-emerald-500", "Healthy"),
  "At Risk":            T("bg-amber-100 text-amber-800 border-amber-200",       "bg-amber-500",   "At Risk"),
  "Degraded":           T("bg-orange-100 text-orange-800 border-orange-200",    "bg-orange-500",  "Degraded"),
  "Severely Degraded":  T("bg-red-100 text-red-800 border-red-200",             "bg-red-600",     "Severely Degraded"),
  "Unavailable":        T("bg-red-200 text-red-900 border-red-300",             "bg-red-700",     "Unavailable"),
  "Recovering":         T("bg-sky-100 text-sky-800 border-sky-200",             "bg-sky-500",     "Recovering"),
} as const;

export const severityTone = {
  "SEV 1": T("bg-red-600 text-white border-red-700",       "bg-red-600",    "SEV 1"),
  "SEV 2": T("bg-orange-500 text-white border-orange-600", "bg-orange-500", "SEV 2"),
  "SEV 3": T("bg-amber-400 text-amber-950 border-amber-500","bg-amber-500", "SEV 3"),
  "SEV 4": T("bg-slate-200 text-slate-800 border-slate-300","bg-slate-400", "SEV 4"),
} as const;

export const incidentStateTone = {
  "Detected":       T("bg-slate-100 text-slate-800 border-slate-200",   "bg-slate-500",  "Detected"),
  "Triaged":        T("bg-slate-100 text-slate-800 border-slate-200",   "bg-slate-600",  "Triaged"),
  "Declared":       T("bg-red-100 text-red-800 border-red-200",         "bg-red-600",    "Declared"),
  "Investigating":  T("bg-amber-100 text-amber-800 border-amber-200",   "bg-amber-500",  "Investigating"),
  "Mitigating":     T("bg-sky-100 text-sky-800 border-sky-200",         "bg-sky-500",    "Mitigating"),
  "Monitoring":     T("bg-indigo-100 text-indigo-800 border-indigo-200","bg-indigo-500", "Monitoring"),
  "Resolved":       T("bg-emerald-100 text-emerald-800 border-emerald-200","bg-emerald-500","Resolved"),
  "Closed":         T("bg-slate-200 text-slate-700 border-slate-300",   "bg-slate-500",  "Closed"),
} as const;

export const executionStateTone = {
  "Pending":           T("bg-slate-100 text-slate-800 border-slate-200",   "bg-slate-400",  "Pending"),
  "Awaiting Approval": T("bg-amber-100 text-amber-800 border-amber-200",   "bg-amber-500",  "Awaiting Approval"),
  "Queued":            T("bg-slate-100 text-slate-800 border-slate-200",   "bg-slate-500",  "Queued"),
  "Running":           T("bg-sky-100 text-sky-800 border-sky-200",         "bg-sky-500",    "Running"),
  "Paused":            T("bg-amber-100 text-amber-800 border-amber-200",   "bg-amber-500",  "Paused"),
  "Validating":        T("bg-indigo-100 text-indigo-800 border-indigo-200","bg-indigo-500", "Validating"),
  "Rolling Back":      T("bg-orange-100 text-orange-800 border-orange-200","bg-orange-500", "Rolling Back"),
  "Completed":         T("bg-emerald-100 text-emerald-800 border-emerald-200","bg-emerald-500","Completed"),
  "Failed":            T("bg-red-100 text-red-800 border-red-200",         "bg-red-600",    "Failed"),
  "Cancelled":         T("bg-slate-200 text-slate-700 border-slate-300",   "bg-slate-500",  "Cancelled"),
} as const;

export const approvalStateTone = {
  "Pending":  T("bg-amber-100 text-amber-800 border-amber-200",   "bg-amber-500",  "Pending"),
  "Approved": T("bg-emerald-100 text-emerald-800 border-emerald-200","bg-emerald-500","Approved"),
  "Denied":   T("bg-red-100 text-red-800 border-red-200",         "bg-red-600",    "Denied"),
  "Expired":  T("bg-slate-200 text-slate-700 border-slate-300",   "bg-slate-500",  "Expired"),
  "Revoked":  T("bg-slate-200 text-slate-700 border-slate-300",   "bg-slate-500",  "Revoked"),
} as const;

export const autonomyTone = {
  "Documentation Only":          T("bg-slate-100 text-slate-800 border-slate-200",   "bg-slate-500",  "Documentation Only"),
  "Human Guided":                T("bg-sky-100 text-sky-800 border-sky-200",         "bg-sky-500",    "Human Guided"),
  "AI Recommended":              T("bg-indigo-100 text-indigo-800 border-indigo-200","bg-indigo-500", "AI Recommended"),
  "Human Initiated Automation":  T("bg-teal-100 text-teal-800 border-teal-200",      "bg-teal-500",   "Human Initiated Automation"),
  "Approval Gated Automation":   T("bg-amber-100 text-amber-800 border-amber-200",   "bg-amber-500",  "Approval Gated Automation"),
  "Supervised Autonomous":       T("bg-purple-100 text-purple-800 border-purple-200","bg-purple-500", "Supervised Autonomous"),
  "Policy Bounded Autonomous":   T("bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200","bg-fuchsia-500","Policy Bounded Autonomous"),
} as const;

export const riskTone = {
  Low:      T("bg-emerald-100 text-emerald-800 border-emerald-200", "bg-emerald-500", "Low"),
  Medium:   T("bg-amber-100 text-amber-800 border-amber-200",       "bg-amber-500",   "Medium"),
  High:     T("bg-red-100 text-red-800 border-red-200",             "bg-red-600",     "High"),
  Critical: T("bg-red-200 text-red-900 border-red-300",             "bg-red-700",     "Critical"),
} as const;

/** Return a tone for a numeric confidence 0-100. */
export function confidenceTone(pct: number): Tone {
  if (pct >= 85) return T("bg-emerald-100 text-emerald-800 border-emerald-200", "bg-emerald-500", "High");
  if (pct >= 65) return T("bg-sky-100 text-sky-800 border-sky-200",             "bg-sky-500",     "Moderate");
  if (pct >= 40) return T("bg-amber-100 text-amber-800 border-amber-200",       "bg-amber-500",   "Low");
  return             T("bg-red-100 text-red-800 border-red-200",                "bg-red-600",     "Very Low");
}

export function errorBudgetTone(pct: number): Tone {
  if (pct >= 60) return T("bg-emerald-100 text-emerald-800 border-emerald-200", "bg-emerald-500", "Healthy");
  if (pct >= 25) return T("bg-amber-100 text-amber-800 border-amber-200",       "bg-amber-500",   "At Risk");
  return             T("bg-red-100 text-red-800 border-red-200",                "bg-red-600",     "Burning");
}
