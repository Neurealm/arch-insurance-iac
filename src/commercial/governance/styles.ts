import type { HealthStatus, Trend } from "@/data/neurealmGovernanceMockData";

/** Static Tailwind class maps keep governance colors token-driven (no dynamic class names). */
export const STATUS_BADGE: Record<string, string> = {
  "On Track": "bg-gv-success-soft text-gv-success border-gv-success/30",
  Approved: "bg-gv-success-soft text-gv-success border-gv-success/30",
  Closed: "bg-gv-success-soft text-gv-success border-gv-success/30",
  Scheduled: "bg-gv-blue-soft text-gv-blue border-gv-blue/30",
  "In Progress": "bg-gv-blue-soft text-gv-blue border-gv-blue/30",
  Planned: "bg-gv-navy-soft text-gv-navy border-gv-navy/25",
  "Future Phase": "bg-gv-purple-soft text-gv-purple border-gv-purple/30",
  "Attention Required": "bg-gv-warning-soft text-gv-warning border-gv-warning/30",
  Monitoring: "bg-gv-warning-soft text-gv-warning border-gv-warning/30",
  Open: "bg-gv-warning-soft text-gv-warning border-gv-warning/30",
  "At Risk": "bg-gv-risk-soft text-gv-risk border-gv-risk/30",
  Escalated: "bg-gv-risk-soft text-gv-risk border-gv-risk/30",
};

export const SEVERITY_BADGE: Record<string, string> = {
  High: "bg-gv-risk-soft text-gv-risk border-gv-risk/30",
  Medium: "bg-gv-warning-soft text-gv-warning border-gv-warning/30",
  Low: "bg-gv-navy-soft text-gv-navy border-gv-navy/25",
};

export const TIER_ACCENT: Record<number, string> = {
  1: "bg-gv-navy text-white",
  2: "bg-gv-teal text-white",
  3: "bg-gv-purple text-white",
};

export const TIER_SOFT: Record<number, string> = {
  1: "bg-gv-navy-soft text-gv-navy border-gv-navy/25",
  2: "bg-gv-teal-soft text-gv-teal border-gv-teal/30",
  3: "bg-gv-purple-soft text-gv-purple border-gv-purple/30",
};

export const PHASE_ACCENT: Record<string, string> = {
  day0: "text-gv-blue",
  day1: "text-gv-teal",
  day2: "text-gv-purple",
};

export const PHASE_BAR: Record<string, string> = {
  day0: "bg-gv-blue",
  day1: "bg-gv-teal",
  day2: "bg-gv-purple",
};

export const RACI_CELL: Record<string, string> = {
  R: "bg-gv-blue text-white",
  A: "bg-gv-teal text-white",
  C: "bg-gv-purple text-white",
  I: "bg-gv-navy-soft text-gv-navy",
};

export function statusClass(status: HealthStatus | string): string {
  return STATUS_BADGE[status] ?? "bg-muted text-muted-foreground border-border";
}

/** Text glyph so status is never conveyed by color alone. */
export const STATUS_GLYPH: Record<string, string> = {
  "On Track": "●",
  Approved: "✓",
  Closed: "✓",
  Scheduled: "◷",
  "In Progress": "◐",
  Planned: "○",
  "Future Phase": "○",
  "Attention Required": "▲",
  Monitoring: "◑",
  Open: "▲",
  "At Risk": "■",
  Escalated: "■",
};

export const TREND_GLYPH: Record<Trend, string> = {
  Improving: "▲",
  Stable: "→",
  Declining: "▼",
};

export const TREND_CLASS: Record<Trend, string> = {
  Improving: "text-gv-success",
  Stable: "text-gv-muted-text",
  Declining: "text-gv-risk",
};
