// Status / severity / risk / confidence / autonomy / freshness / provenance
// indicators. Every indicator pairs a color glyph with a text label so status
// is never communicated by color alone. All indicators are keyboard-inert
// unless wrapped in a focusable control by the caller.

import { cn } from "@/lib/utils";
import {
  autonomyRank, riskTone, severityTone, tones,
  type Autonomy, type Risk, type Severity, type StatusTone,
} from "./variants";
import { Clock, Database, Sparkles } from "lucide-react";

/* ------------------------------- Status ------------------------------- */

export function StatusIndicator({
  tone, label, className, size = "sm",
}: { tone: StatusTone; label?: string; className?: string; size?: "sm" | "md" }) {
  const spec = tones[tone];
  const Icon = spec.icon;
  const text = label ?? spec.label;
  const pad = size === "md" ? "px-2 py-1 text-xs" : "px-1.5 py-0.5 text-[11px]";
  return (
    <span
      role="status"
      aria-label={text}
      className={cn("inline-flex items-center gap-1 rounded border font-medium", spec.chip, pad, className)}
    >
      <Icon className={cn("h-3 w-3", spec.fg, tone === "recovering" && "animate-spin")} aria-hidden />
      <span>{text}</span>
    </span>
  );
}

export function SeverityIndicator({ severity, className }: { severity: Severity; className?: string }) {
  return <StatusIndicator tone={severityTone[severity]} label={severity} className={className} />;
}

export function RiskIndicator({ risk, className }: { risk: Risk; className?: string }) {
  return <StatusIndicator tone={riskTone[risk]} label={`${risk} risk`} className={className} />;
}

/* ---------------------------- Confidence ------------------------------ */

export function ConfidenceIndicator({
  value, className,
}: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const tone: StatusTone = pct >= 80 ? "healthy" : pct >= 60 ? "at-risk" : "failure";
  const spec = tones[tone];
  return (
    <div className={cn("inline-flex items-center gap-2", className)} role="group" aria-label={`Confidence ${pct} percent`}>
      <span className="text-[11px] font-semibold text-slate-700">{pct}%</span>
      <div className="h-1.5 w-16 rounded bg-slate-200" aria-hidden>
        <div className={cn("h-full rounded", spec.dot)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ----------------------------- Autonomy ------------------------------- */

export function AutonomyIndicator({ level, className }: { level: Autonomy; className?: string }) {
  const rank = autonomyRank[level];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium text-indigo-800", className)}
      aria-label={`Autonomy: ${level}`}
    >
      <Sparkles className="h-3 w-3 text-indigo-600" aria-hidden />
      <span>{level}</span>
      <span className="text-indigo-500" aria-hidden>· L{rank}</span>
    </span>
  );
}

/* ---------------------------- Freshness ------------------------------- */

export function FreshnessIndicator({
  capturedAt, ttlSeconds = 60, className,
}: { capturedAt: string | Date; ttlSeconds?: number; className?: string }) {
  const t = typeof capturedAt === "string" ? Date.parse(capturedAt) : capturedAt.getTime();
  const age = Math.max(0, Math.round((Date.now() - t) / 1000));
  const stale = age > ttlSeconds;
  const label = age < 60 ? `${age}s ago` : age < 3600 ? `${Math.round(age / 60)}m ago` : `${Math.round(age / 3600)}h ago`;
  const tone: StatusTone = stale ? "warning" : "healthy";
  const spec = tones[tone];
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium", spec.chip, className)}
      aria-label={`Data ${stale ? "stale" : "fresh"} — captured ${label}`}
    >
      <Clock className={cn("h-3 w-3", spec.fg)} aria-hidden />
      <span>{stale ? "Stale" : "Fresh"} · {label}</span>
    </span>
  );
}

/* --------------------------- Source Provenance ------------------------ */

export interface Provenance {
  source: "demo" | "connected" | "cached" | "manual";
  system?: string;
  capturedAt?: string;
}

export function SourceProvenance({ provenance, className }: { provenance: Provenance; className?: string }) {
  const label = provenance.source === "demo"
    ? "Simulated data"
    : provenance.source === "connected"
    ? `Live · ${provenance.system ?? "connected system"}`
    : provenance.source === "cached"
    ? `Cached · ${provenance.system ?? "unknown"}`
    : "Manually entered";
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600", className)}
      title={provenance.capturedAt ? `Captured ${provenance.capturedAt}` : undefined}
    >
      <Database className="h-3 w-3" aria-hidden />
      <span>{label}</span>
    </span>
  );
}
