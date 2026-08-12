import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "positive" | "info" | "warning" | "critical";

const TONE: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  positive: "bg-primary/10 text-primary border-primary/20",
  info: "bg-accent text-accent-foreground border-border",
  warning: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const KEYWORD_TONE: Record<string, StatusTone> = {
  critical: "critical",
  high: "warning",
  medium: "info",
  low: "neutral",
  informational: "neutral",
  open: "warning",
  "expected-by-design": "neutral",
  consolidated: "neutral",
  registered: "positive",
  unregistered: "critical",
  "unable-to-verify": "warning",
  shared: "info",
  "module-owned": "positive",
  "platform-owned": "info",
  "customer-owned": "info",
  unassigned: "critical",
};

export function toneFor(value: string | null | undefined): StatusTone {
  if (!value) return "neutral";
  return KEYWORD_TONE[value.toLowerCase()] ?? "neutral";
}

/**
 * Shared read-only status chip for Capability Intelligence surfaces.
 * Tone is derived from the value unless explicitly supplied.
 */
export function StatusBadge({
  value,
  tone,
  label,
  className,
}: {
  value: string;
  tone?: StatusTone;
  label?: string;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("font-medium", TONE[tone ?? toneFor(value)], className)}>
      {label ?? value}
    </Badge>
  );
}
