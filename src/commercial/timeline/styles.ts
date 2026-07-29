import type { ActivityCategory, ActivityStatus, MilestoneStatus } from "@/data/programTimelineMockData";
import { CATEGORY_TOKEN } from "@/data/programTimelineMockData";

/** Static Tailwind class maps — keeps colors token-driven and avoids dynamic class names. */
export const CATEGORY_BAR: Record<string, string> = {
  planning: "bg-tl-planning-soft border-tl-planning text-tl-planning",
  build: "bg-tl-build-soft border-tl-build text-tl-build",
  testing: "bg-tl-testing-soft border-tl-testing text-tl-testing",
  deployment: "bg-tl-deployment-soft border-tl-deployment text-tl-deployment",
  customer: "bg-tl-customer-soft border-tl-customer text-tl-customer",
  commercial: "bg-tl-commercial-soft border-tl-commercial text-tl-commercial",
  governance: "bg-tl-governance-soft border-tl-governance text-tl-governance",
  readiness: "bg-tl-readiness-soft border-tl-readiness text-tl-readiness",
  risk: "bg-tl-risk-soft border-tl-risk text-tl-risk",
  complete: "bg-tl-complete-soft border-tl-complete text-tl-complete",
};

export const CATEGORY_FILL: Record<string, string> = {
  planning: "bg-tl-planning",
  build: "bg-tl-build",
  testing: "bg-tl-testing",
  deployment: "bg-tl-deployment",
  customer: "bg-tl-customer",
  commercial: "bg-tl-commercial",
  governance: "bg-tl-governance",
  readiness: "bg-tl-readiness",
  risk: "bg-tl-risk",
  complete: "bg-tl-complete",
};

export function categoryToken(category: ActivityCategory): string {
  return CATEGORY_TOKEN[category] ?? "planning";
}

export function statusBadgeClass(status: ActivityStatus | MilestoneStatus): string {
  switch (status) {
    case "Completed":
      return "bg-tl-complete-soft text-tl-complete border-tl-complete/30";
    case "In Progress":
      return "bg-tl-build-soft text-tl-build border-tl-build/30";
    case "At Risk":
    case "Delayed":
      return "bg-tl-risk-soft text-tl-risk border-tl-risk/30";
    case "On Track":
      return "bg-tl-planning-soft text-tl-planning border-tl-planning/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

/** Non-color status glyph so status is never conveyed by color alone. */
export function statusGlyph(status: ActivityStatus | MilestoneStatus): string {
  switch (status) {
    case "Completed":
      return "✓";
    case "In Progress":
      return "◐";
    case "At Risk":
    case "Delayed":
      return "!";
    case "On Track":
      return "→";
    default:
      return "○";
  }
}
