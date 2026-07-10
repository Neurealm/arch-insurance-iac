// State surfaces — used whenever a page section cannot render its normal
// content. Every state provides a clear text explanation and, where useful,
// a suggested action for the operator.

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, Ban, Clock, Inbox, Loader2, PlugZap, ShieldOff,
  type LucideIcon,
} from "lucide-react";

interface BaseProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

function Frame({ icon: Icon, tone, title, description, action, className, children }:
  BaseProps & { icon: LucideIcon; tone: string; children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded border border-dashed border-slate-200 bg-white p-6 text-center",
        className,
      )}
      role="status"
    >
      <div className={cn("grid h-10 w-10 place-items-center rounded-full", tone)}>
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      {description && <div className="max-w-md text-xs text-slate-600">{description}</div>}
      {children}
      {action && (
        <Button size="sm" variant="outline" onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function EmptyState(p: BaseProps) {
  return <Frame {...p} icon={Inbox} tone="bg-slate-100 text-slate-600" title={p.title || "Nothing here yet"} />;
}

export function LoadingState({ title = "Loading", description, className }: Partial<BaseProps>) {
  return (
    <Frame
      icon={Loader2}
      tone="bg-slate-100 text-slate-600"
      title={title!}
      description={description}
      className={className}
    />
  );
}

export function ErrorState({
  title = "Something went wrong", description = "The last operation could not be completed.", action, className,
}: Partial<BaseProps>) {
  return <Frame icon={AlertTriangle} tone="bg-rose-100 text-rose-700" title={title} description={description} action={action} className={className} />;
}

export function StaleDataState({
  title = "Stale data", description = "The last refresh is older than the freshness threshold for this surface.", action, className,
}: Partial<BaseProps>) {
  return <Frame icon={Clock} tone="bg-amber-100 text-amber-800" title={title} description={description} action={action} className={className} />;
}

export function PermissionDeniedState({
  title = "Permission denied", description = "Your role does not allow you to view this content.", action, className,
}: Partial<BaseProps>) {
  return <Frame icon={ShieldOff} tone="bg-slate-100 text-slate-700" title={title} description={description} action={action} className={className} />;
}

export function ConnectorUnavailableState({
  title = "Connector unavailable", description = "The upstream system is unreachable. Cached data may be shown elsewhere.", connectorName, action, className,
}: Partial<BaseProps> & { connectorName?: string }) {
  return (
    <Frame
      icon={PlugZap}
      tone="bg-slate-100 text-slate-700"
      title={connectorName ? `${connectorName} unavailable` : title}
      description={description}
      action={action}
      className={className}
    />
  );
}

export function ForbiddenState(p: Partial<BaseProps>) {
  return <Frame icon={Ban} tone="bg-rose-100 text-rose-700" title={p.title ?? "Not allowed"} description={p.description} action={p.action} className={p.className} />;
}
