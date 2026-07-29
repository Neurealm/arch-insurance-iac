import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_GLYPH, statusClass, SEVERITY_BADGE } from "./styles";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", statusClass(status), className)}>
      <span aria-hidden="true">{STATUS_GLYPH[status] ?? "•"}</span>
      {status}
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", SEVERITY_BADGE[severity] ?? "bg-muted text-muted-foreground")}
    >
      {severity}
    </Badge>
  );
}

export function GovernanceProgress({
  value,
  label,
  barClass,
}: {
  value: number;
  label: string;
  barClass: string;
}) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${safe} percent`}
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
    >
      <div className={cn("h-full rounded-full transition-all", barClass)} style={{ width: `${safe}%` }} />
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
