import type { Severity } from "@/data/staffingResourcesMockData";

/** Static Tailwind class maps keep staffing colors token-driven (no dynamic class names). */
export const STAFF_STATUS_BADGE: Record<string, string> = {
  "On Track": "bg-gv-success-soft text-gv-success border-gv-success/30",
  Filled: "bg-gv-success-soft text-gv-success border-gv-success/30",
  "Adequate Coverage": "bg-gv-success-soft text-gv-success border-gv-success/30",
  "Good Coverage": "bg-gv-success-soft text-gv-success border-gv-success/30",
  "Within Acceptable Range": "bg-gv-success-soft text-gv-success border-gv-success/30",
  Acceptable: "bg-gv-success-soft text-gv-success border-gv-success/30",
  Resolved: "bg-gv-success-soft text-gv-success border-gv-success/30",
  Closed: "bg-gv-success-soft text-gv-success border-gv-success/30",
  "In Progress": "bg-gv-blue-soft text-gv-blue border-gv-blue/30",
  "Base Scenario": "bg-gv-blue-soft text-gv-blue border-gv-blue/30",
  "Peak Demand": "bg-gv-purple-soft text-gv-purple border-gv-purple/30",
  Monitoring: "bg-gv-warning-soft text-gv-warning border-gv-warning/30",
  "Attention Required": "bg-gv-warning-soft text-gv-warning border-gv-warning/30",
  "Requires Monitoring": "bg-gv-warning-soft text-gv-warning border-gv-warning/30",
  "Limited Buffer": "bg-gv-warning-soft text-gv-warning border-gv-warning/30",
  "Backfill Required": "bg-gv-warning-soft text-gv-warning border-gv-warning/30",
  Open: "bg-gv-warning-soft text-gv-warning border-gv-warning/30",
  "At Risk": "bg-gv-risk-soft text-gv-risk border-gv-risk/30",
  Escalated: "bg-gv-risk-soft text-gv-risk border-gv-risk/30",
};

export const STAFF_STATUS_GLYPH: Record<string, string> = {
  "On Track": "●",
  Filled: "✓",
  "Adequate Coverage": "✓",
  "Good Coverage": "✓",
  "Within Acceptable Range": "✓",
  Acceptable: "✓",
  Resolved: "✓",
  Closed: "✓",
  "In Progress": "◐",
  "Base Scenario": "◆",
  "Peak Demand": "▲",
  Monitoring: "◑",
  "Attention Required": "▲",
  "Requires Monitoring": "◑",
  "Limited Buffer": "◑",
  "Backfill Required": "◑",
  Open: "○",
  "At Risk": "■",
  Escalated: "■",
};

export const SEVERITY_BADGE: Record<Severity | string, string> = {
  High: "bg-gv-risk-soft text-gv-risk border-gv-risk/30",
  Medium: "bg-gv-warning-soft text-gv-warning border-gv-warning/30",
  Low: "bg-gv-navy-soft text-gv-navy border-gv-navy/25",
};

/** Chart + legend colors per function. */
export const FUNCTION_FILL: Record<string, string> = {
  delivery: "fill-gv-blue",
  runops: "fill-gv-teal",
  customerSuccess: "fill-gv-purple",
  support: "fill-gv-warning",
};

export const FUNCTION_BG: Record<string, string> = {
  delivery: "bg-gv-blue",
  runops: "bg-gv-teal",
  customerSuccess: "bg-gv-purple",
  support: "bg-gv-warning",
};

export const FUNCTION_STROKE: Record<string, string> = {
  delivery: "stroke-gv-blue",
  runops: "stroke-gv-teal",
  customerSuccess: "stroke-gv-purple",
  support: "stroke-gv-warning",
};

export const PHASE_ACCENT: Record<string, string> = {
  day0: "text-gv-blue",
  day1: "text-gv-teal",
  day2: "text-gv-purple",
};

export const PHASE_SOFT: Record<string, string> = {
  day0: "bg-gv-blue-soft border-gv-blue/25",
  day1: "bg-gv-teal-soft border-gv-teal/25",
  day2: "bg-gv-purple-soft border-gv-purple/25",
};

export function staffStatusClass(status: string): string {
  return STAFF_STATUS_BADGE[status] ?? "bg-muted text-muted-foreground border-border";
}
