// Shared status/tone tokens for the RunOps component library. All status
// surfaces derive their color, icon, and text-alternative from this map so
// severity is never conveyed by color alone.

import {
  AlertOctagon, AlertTriangle, CheckCircle2, CircleDashed, Clock, Loader2,
  MinusCircle, Pause, PlayCircle, ShieldAlert, XCircle, Zap, Plug,
  type LucideIcon,
} from "lucide-react";

export type StatusTone =
  | "healthy" | "at-risk" | "degraded" | "critical" | "recovering"
  | "success" | "warning" | "failure" | "pending" | "paused"
  | "simulation" | "connected" | "neutral";

export interface ToneSpec {
  label: string;
  icon: LucideIcon;
  /** Tailwind classes for a soft badge/chip background+border+text. */
  chip: string;
  /** Tailwind text color for solid icon/glyph usage. */
  fg: string;
  /** Tailwind background color for a solid dot. */
  dot: string;
}

export const tones: Record<StatusTone, ToneSpec> = {
  healthy:     { label: "Healthy",     icon: CheckCircle2,  chip: "border-emerald-200 bg-emerald-50 text-emerald-800",  fg: "text-emerald-600",  dot: "bg-emerald-500"  },
  "at-risk":   { label: "At Risk",     icon: AlertTriangle, chip: "border-amber-200 bg-amber-50 text-amber-800",       fg: "text-amber-600",    dot: "bg-amber-500"    },
  degraded:    { label: "Degraded",    icon: AlertOctagon,  chip: "border-orange-200 bg-orange-50 text-orange-800",    fg: "text-orange-600",   dot: "bg-orange-500"   },
  critical:    { label: "Critical",    icon: ShieldAlert,   chip: "border-rose-200 bg-rose-50 text-rose-800",          fg: "text-rose-600",     dot: "bg-rose-600"     },
  recovering:  { label: "Recovering",  icon: Loader2,       chip: "border-sky-200 bg-sky-50 text-sky-800",             fg: "text-sky-600",      dot: "bg-sky-500"      },
  success:     { label: "Success",     icon: CheckCircle2,  chip: "border-emerald-200 bg-emerald-50 text-emerald-800", fg: "text-emerald-600",  dot: "bg-emerald-500"  },
  warning:     { label: "Warning",     icon: AlertTriangle, chip: "border-amber-200 bg-amber-50 text-amber-800",       fg: "text-amber-600",    dot: "bg-amber-500"    },
  failure:     { label: "Failure",     icon: XCircle,       chip: "border-rose-200 bg-rose-50 text-rose-800",          fg: "text-rose-600",     dot: "bg-rose-600"     },
  pending:     { label: "Pending",     icon: Clock,         chip: "border-slate-200 bg-slate-50 text-slate-700",       fg: "text-slate-500",    dot: "bg-slate-400"    },
  paused:      { label: "Paused",      icon: Pause,         chip: "border-slate-200 bg-slate-50 text-slate-700",       fg: "text-slate-500",    dot: "bg-slate-400"    },
  simulation:  { label: "Simulation",  icon: Zap,           chip: "border-amber-300 bg-amber-50 text-amber-900",       fg: "text-amber-700",    dot: "bg-amber-500"    },
  connected:   { label: "Connected",   icon: Plug,          chip: "border-indigo-200 bg-indigo-50 text-indigo-800",    fg: "text-indigo-600",   dot: "bg-indigo-500"   },
  neutral:     { label: "Neutral",     icon: MinusCircle,   chip: "border-slate-200 bg-slate-50 text-slate-700",       fg: "text-slate-500",    dot: "bg-slate-400"    },
};

export type Severity = "SEV 1" | "SEV 2" | "SEV 3" | "SEV 4";
export const severityTone: Record<Severity, StatusTone> = {
  "SEV 1": "critical", "SEV 2": "degraded", "SEV 3": "at-risk", "SEV 4": "pending",
};

export type Risk = "Low" | "Medium" | "High" | "Critical";
export const riskTone: Record<Risk, StatusTone> = {
  Low: "healthy", Medium: "at-risk", High: "degraded", Critical: "critical",
};

export type Autonomy =
  | "Documentation Only" | "Human Guided" | "AI Recommended"
  | "Human Initiated Automation" | "Approval Gated Automation"
  | "Supervised Autonomous" | "Policy Bounded Autonomous";

export const autonomyRank: Record<Autonomy, number> = {
  "Documentation Only": 0,
  "Human Guided": 1,
  "AI Recommended": 2,
  "Human Initiated Automation": 3,
  "Approval Gated Automation": 4,
  "Supervised Autonomous": 5,
  "Policy Bounded Autonomous": 6,
};

export { CircleDashed, PlayCircle };
