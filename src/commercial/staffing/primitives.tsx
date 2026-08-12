import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SEVERITY_BADGE, STAFF_STATUS_GLYPH, staffStatusClass } from "./styles";

export function StaffStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", staffStatusClass(status), className)}>
      <span aria-hidden="true">{STAFF_STATUS_GLYPH[status] ?? "•"}</span>
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

export function UtilizationBar({ value, label }: { value: number; label: string }) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  const bar = safe >= 95 ? "bg-gv-risk" : safe >= 90 ? "bg-gv-warning" : "bg-gv-success";
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 tabular-nums text-xs text-foreground">{safe}%</span>
      <div
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} peak utilization: ${safe} percent`}
        className="h-2 w-20 overflow-hidden rounded-full bg-muted"
      >
        <div className={cn("h-full rounded-full", bar)} style={{ width: `${safe}%` }} />
      </div>
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
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export interface DrawerField {
  label: string;
  value: ReactNode;
}

/** Reusable detail drawer shared by function, role, critical role, pipeline, structure, gap, risk and metric details. */
export function DetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  fields,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: DrawerField[];
  footer?: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <dl className="mt-5 space-y-3">
          {fields.map((f) => (
            <div key={f.label} className="grid grid-cols-[minmax(0,140px)_1fr] gap-3 border-b border-border pb-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{f.label}</dt>
              <dd className="text-sm text-foreground">{f.value}</dd>
            </div>
          ))}
        </dl>
        {footer && <div className="mt-5 flex flex-wrap gap-2">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}

export function listOrDash(items: string[] | undefined): ReactNode {
  if (!items || items.length === 0) return <span className="text-muted-foreground">None recorded</span>;
  return (
    <ul className="list-disc space-y-1 pl-4">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}
