import { Badge } from "@/components/ui/badge";

export function lifecycleTone(s?: string | null) {
  switch (s) {
    case "Active":
    case "Strategic":
      return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
    case "Emerging":
    case "Evaluation":
      return "bg-sky-500/15 text-sky-600 border-sky-500/30";
    case "Maintenance":
      return "bg-amber-500/15 text-amber-600 border-amber-500/30";
    case "Legacy":
    case "Deprecated":
      return "bg-orange-500/15 text-orange-600 border-orange-500/30";
    case "End of Support":
    case "Retired":
      return "bg-zinc-500/15 text-zinc-500 border-zinc-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function approvalTone(s?: string | null) {
  switch (s) {
    case "Approved":
      return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
    case "In Review":
      return "bg-amber-500/15 text-amber-600 border-amber-500/30";
    case "Draft":
      return "bg-slate-500/15 text-slate-500 border-slate-500/30";
    case "Rejected":
      return "bg-rose-500/15 text-rose-600 border-rose-500/30";
    case "Retired":
      return "bg-zinc-500/15 text-zinc-500 border-zinc-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function criticalityTone(s?: string | null) {
  switch (s) {
    case "Mission Critical":
      return "bg-rose-500/15 text-rose-600 border-rose-500/30";
    case "Business Critical":
      return "bg-orange-500/15 text-orange-600 border-orange-500/30";
    case "Important":
      return "bg-amber-500/15 text-amber-600 border-amber-500/30";
    case "Standard":
      return "bg-slate-500/15 text-slate-500 border-slate-500/30";
    case "Noncritical":
      return "bg-zinc-500/15 text-zinc-500 border-zinc-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function LifecycleBadge({ value }: { value?: string | null }) {
  if (!value) return <span className="text-xs text-muted-foreground">—</span>;
  return <Badge variant="outline" className={lifecycleTone(value)}>{value}</Badge>;
}
export function ApprovalBadge({ value }: { value?: string | null }) {
  if (!value) return <span className="text-xs text-muted-foreground">—</span>;
  return <Badge variant="outline" className={approvalTone(value)}>{value}</Badge>;
}
export function CriticalityBadge({ value }: { value?: string | null }) {
  if (!value) return <span className="text-xs text-muted-foreground">—</span>;
  return <Badge variant="outline" className={criticalityTone(value)}>{value}</Badge>;
}
export function ActiveBadge({ value }: { value?: boolean | null }) {
  return (
    <Badge
      variant="outline"
      className={
        value
          ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
          : "bg-slate-500/15 text-slate-500 border-slate-500/30"
      }
    >
      {value ? "Active" : "Inactive"}
    </Badge>
  );
}
