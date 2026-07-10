// Metric surfaces: MetricCard, MetricTrend, SLOCard, ErrorBudgetCard,
// ReadinessScore, RunbookFitnessScore. Deterministic — no random values,
// no animations except a subtle sparkline path.

import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { tones, type StatusTone } from "./variants";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  tone?: StatusTone;
  hint?: string;
  className?: string;
  trend?: { direction: "up" | "down" | "flat"; delta: string };
}

export function MetricCard({ label, value, unit, tone = "neutral", hint, className, trend }: MetricCardProps) {
  const spec = tones[tone];
  return (
    <div
      className={cn(
        "rounded border border-slate-200 bg-white p-3",
        className,
      )}
      role="group"
      aria-label={`${label}: ${value}${unit ?? ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</div>
        <span className={cn("h-2 w-2 rounded-full", spec.dot)} aria-hidden />
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <div className="text-xl font-semibold text-slate-900">{value}</div>
        {unit && <div className="text-xs text-slate-500">{unit}</div>}
      </div>
      {(hint || trend) && (
        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-600">
          {trend && <MetricTrend {...trend} />}
          {hint && <span>{hint}</span>}
        </div>
      )}
    </div>
  );
}

export function MetricTrend({
  direction, delta, positiveIs = "up", className,
}: { direction: "up" | "down" | "flat"; delta: string; positiveIs?: "up" | "down"; className?: string }) {
  const isPositive = direction === positiveIs;
  const isFlat = direction === "flat";
  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : ArrowRight;
  const color = isFlat ? "text-slate-500" : isPositive ? "text-emerald-600" : "text-rose-600";
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-medium", color, className)} aria-label={`Trend ${direction} ${delta}`}>
      <Icon className="h-3 w-3" aria-hidden />
      <span>{delta}</span>
    </span>
  );
}

/* --------------------------- Sparkline helper --------------------------- */

export function Sparkline({ data, tone = "neutral", height = 32 }:{ data: number[]; tone?: StatusTone; height?: number }) {
  const spec = tones[tone];
  const rows = data.map((v, i) => ({ i, v }));
  const stroke = spec.fg.replace("text-", "").split("-");
  // Recharts CSS colors — inline for simplicity
  const strokeColor = spec.dot.includes("emerald") ? "#059669"
    : spec.dot.includes("amber")    ? "#d97706"
    : spec.dot.includes("orange")   ? "#ea580c"
    : spec.dot.includes("rose")     ? "#e11d48"
    : spec.dot.includes("sky")      ? "#0284c7"
    : spec.dot.includes("indigo")   ? "#4f46e5"
    : "#64748b";
  void stroke;
  return (
    <div style={{ height }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <Area type="monotone" dataKey="v" stroke={strokeColor} fill={strokeColor} fillOpacity={0.15} strokeWidth={1.5} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* --------------------------------- SLO --------------------------------- */

export interface SLOCardProps {
  name: string;
  target: number;   // e.g. 99.95
  actual: number;   // e.g. 99.82
  window: string;   // e.g. "30d"
  className?: string;
}

export function SLOCard({ name, target, actual, window, className }: SLOCardProps) {
  const meeting = actual >= target;
  const tone: StatusTone = meeting ? "healthy" : actual >= target - 0.2 ? "at-risk" : "critical";
  return (
    <div className={cn("rounded border border-slate-200 bg-white p-3", className)} role="group" aria-label={`SLO ${name}`}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{name}</div>
        <StatusChip tone={tone} label={meeting ? "Meeting" : "Breaching"} />
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-xl font-semibold text-slate-900">{actual.toFixed(2)}%</div>
        <div className="text-xs text-slate-500">target {target.toFixed(2)}%</div>
      </div>
      <div className="mt-1 text-[11px] text-slate-500">Window {window}</div>
    </div>
  );
}

function StatusChip({ tone, label }: { tone: StatusTone; label: string }) {
  const spec = tones[tone];
  return <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", spec.chip)}>{label}</span>;
}

/* ---------------------------- Error Budget ----------------------------- */

export interface ErrorBudgetCardProps {
  name: string;
  remainingPct: number; // 0..100
  burnRate: number;     // multiples of nominal (1x = on-pace)
  window: string;
  className?: string;
}

export function ErrorBudgetCard({ name, remainingPct, burnRate, window, className }: ErrorBudgetCardProps) {
  const pct = Math.max(0, Math.min(100, remainingPct));
  const tone: StatusTone = pct >= 50 ? "healthy" : pct >= 20 ? "at-risk" : pct > 0 ? "degraded" : "critical";
  const spec = tones[tone];
  return (
    <div className={cn("rounded border border-slate-200 bg-white p-3", className)} role="group" aria-label={`Error budget ${name}`}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{name}</div>
        <StatusChip tone={tone} label={`${burnRate.toFixed(1)}× burn`} />
      </div>
      <div className="mt-2 h-2 w-full rounded bg-slate-200" aria-hidden>
        <div className={cn("h-full rounded", spec.dot)} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
        <span>{pct.toFixed(0)}% remaining</span>
        <span>{window}</span>
      </div>
    </div>
  );
}

/* -------------------------- Readiness / Fitness ------------------------ */

function ScoreRing({ score, tone, size = 72 }: { score: number; tone: StatusTone; size?: number }) {
  const pct = Math.max(0, Math.min(100, score));
  const spec = tones[tone];
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const color = spec.dot.includes("emerald") ? "#059669"
    : spec.dot.includes("amber") ? "#d97706"
    : spec.dot.includes("orange") ? "#ea580c"
    : spec.dot.includes("rose") ? "#e11d48" : "#64748b";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Score ${pct} of 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#e2e8f0" strokeWidth={6} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={6} fill="none"
        strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={c / 4} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-900" fontSize={size / 3.5} fontWeight={600}>
        {pct}
      </text>
    </svg>
  );
}

export function ReadinessScore({
  label = "Readiness", score, details, className,
}: { label?: string; score: number; details?: string; className?: string }) {
  const tone: StatusTone = score >= 80 ? "healthy" : score >= 60 ? "at-risk" : "degraded";
  return (
    <div className={cn("flex items-center gap-3 rounded border border-slate-200 bg-white p-3", className)} role="group" aria-label={`${label} ${score}/100`}>
      <ScoreRing score={score} tone={tone} />
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-sm font-semibold text-slate-900">{tones[tone].label}</div>
        {details && <div className="mt-0.5 text-xs text-slate-600">{details}</div>}
      </div>
    </div>
  );
}

export function RunbookFitnessScore({
  score, coverage, lastCertified, className,
}: { score: number; coverage?: string; lastCertified?: string; className?: string }) {
  return (
    <ReadinessScore
      label="Runbook fitness"
      score={score}
      details={[coverage, lastCertified ? `Certified ${lastCertified}` : null].filter(Boolean).join(" · ")}
      className={className}
    />
  );
}
