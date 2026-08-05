// Shared presentational primitives for the Traditional NOC operations dashboard.

import { cn } from "@/lib/utils";
import type { OperationalStatus, RiskLevel, Severity } from "@/types/opticalOperations";

export function OpsPanel({
  title, subtitle, action, children, className, id,
}: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm", className)} aria-label={title}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5">
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="flex-1 p-4">{children}</div>
    </section>
  );
}

const statusTone: Record<OperationalStatus | "unknown", string> = {
  healthy: "bg-green-50 text-green-700 border-green-200",
  degraded: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
  maintenance: "bg-purple-50 text-purple-700 border-purple-200",
  unknown: "bg-slate-50 text-slate-600 border-slate-200",
};

export function OperationalStatusBadge({ status, label }: { status: OperationalStatus | "unknown"; label?: string }) {
  const text = label ?? status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10.5px] font-medium", statusTone[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full",
        status === "healthy" ? "bg-green-500" : status === "degraded" ? "bg-amber-500" :
        status === "critical" ? "bg-red-500" : status === "maintenance" ? "bg-purple-500" : "bg-slate-400")} aria-hidden />
      {text}
    </span>
  );
}

const severityTone: Record<Severity, string> = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  Major: "bg-amber-50 text-amber-700 border-amber-200",
  Minor: "bg-blue-50 text-blue-700 border-blue-200",
  Informational: "bg-slate-50 text-slate-600 border-slate-200",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={cn("inline-flex rounded border px-1.5 py-0.5 text-[10.5px] font-medium", severityTone[severity])}>
      {severity}
    </span>
  );
}

const riskTone: Record<RiskLevel, string> = {
  low: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={cn("inline-flex rounded border px-1.5 py-0.5 text-[10.5px] font-medium capitalize", riskTone[level])}>
      {level}
    </span>
  );
}

export function OperationalMetricCard({
  title, value, unit, lines, tone = "neutral", onClick,
}: {
  title: string; value: string; unit?: string;
  lines: { label: string; value: string }[];
  tone?: "neutral" | "good" | "warn" | "bad";
  onClick?: () => void;
}) {
  const bar =
    tone === "good" ? "bg-green-500" : tone === "warn" ? "bg-amber-500" :
    tone === "bad" ? "bg-red-500" : "bg-blue-500";
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:border-blue-300 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <span className={cn("h-1 w-full", bar)} aria-hidden />
      <span className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{title}</span>
        <span className="flex items-baseline gap-1">
          <span className="text-[22px] font-semibold leading-none text-slate-900">{value}</span>
          {unit && <span className="text-[11px] text-slate-500">{unit}</span>}
        </span>
        <span className="mt-0.5 space-y-0.5">
          {lines.map((l) => (
            <span key={l.label} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-500">{l.label}</span>
              <span className="font-medium text-slate-800">{l.value}</span>
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}

export function DataFreshnessIndicator({
  lastRefreshed, nextRefreshSeconds, telemetryDelaySec,
}: { lastRefreshed: Date; nextRefreshSeconds: number | null; telemetryDelaySec: number }) {
  const fresh = telemetryDelaySec < 30;
  return (
    <div className="flex items-center gap-2 text-[11px] text-slate-600" aria-live="polite">
      <span className={cn("h-2 w-2 rounded-full", fresh ? "bg-green-500" : "bg-amber-500")} aria-hidden />
      <span>Last refreshed {lastRefreshed.toISOString().slice(11, 19)} UTC</span>
      <span className="text-slate-300">|</span>
      <span>{nextRefreshSeconds === null ? "Auto-refresh off" : `Next refresh in ${nextRefreshSeconds}s`}</span>
      <span className="text-slate-300">|</span>
      <span>Telemetry delay {telemetryDelaySec}s</span>
    </div>
  );
}

export function TableShell({
  caption, headers, children,
}: { caption: string; headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-[11.5px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-slate-200 text-left text-[10.5px] uppercase tracking-wide text-slate-500">
            {headers.map((h) => <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="rounded border border-dashed border-slate-200 px-3 py-6 text-center text-[12px] text-slate-500">{message}</p>;
}

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading operational data">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-6 animate-pulse rounded bg-slate-100" />
      ))}
    </div>
  );
}
