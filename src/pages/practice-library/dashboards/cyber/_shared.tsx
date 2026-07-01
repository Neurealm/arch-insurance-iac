import { Calendar, Filter, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export function CyberHeader({
  Icon = ShieldCheck,
  title,
  subtitle,
}: {
  Icon?: typeof ShieldCheck;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Icon className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Executive Summary | {subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border bg-card shadow-sm">
          <Calendar className="h-3.5 w-3.5" /> May 12 – Jun 12, 2026
        </button>
        <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border bg-card shadow-sm">
          <Filter className="h-3.5 w-3.5" /> Filters
        </button>
      </div>
    </div>
  );
}

export function PillarCard({
  index,
  title,
  subtitle,
  tone,
  score,
  scoreLabel,
  metrics,
  trendTitle,
  trend,
  footer,
}: {
  index: number;
  title: string;
  subtitle?: string;
  tone: string; // tailwind bg
  score: number;
  scoreLabel: string;
  metrics: Array<[string, string, "up" | "down" | "flat"]>;
  trendTitle: string;
  trend: ReactNode;
  footer: string;
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className={`${tone} px-3 py-2 text-white text-sm font-semibold flex items-center gap-2`}>
        <span className="h-5 w-5 rounded-md bg-white/25 inline-flex items-center justify-center text-[11px] font-bold">
          {index}
        </span>
        <div className="leading-tight">
          {title}
          {subtitle && <div className="text-[10px] font-normal opacity-90">{subtitle}</div>}
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start gap-3 mb-3">
          <ScoreRing value={score} label={scoreLabel} />
          <div className="flex-1 space-y-1 text-[11px]">
            <div className="text-[10px] font-semibold text-muted-foreground mb-1">Key Metrics</div>
            {metrics.map(([k, v, d]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-muted-foreground truncate pr-1">{k}</span>
                <span className="font-semibold flex items-center gap-1">
                  {v}
                  {d === "up" && <span className="text-emerald-600">▲</span>}
                  {d === "down" && <span className="text-rose-600">▼</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground mb-1">{trendTitle}</div>
        {trend}
        <div className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1">
          ✓ {footer}
        </div>
      </div>
    </div>
  );
}

export function ScoreRing({ value, label }: { value: number; label: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  const color =
    value >= 90 ? "hsl(142 71% 45%)" : value >= 80 ? "hsl(38 92% 50%)" : "hsl(0 84% 60%)";
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 60 60" className="h-14 w-14 -rotate-90">
        <circle cx="30" cy="30" r={r} stroke="hsl(220 14% 92%)" strokeWidth="5" fill="none" />
        <circle
          cx="30"
          cy="30"
          r={r}
          stroke={color}
          strokeWidth="5"
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-sm font-bold leading-none">{value}</div>
        <div className="text-[8px] text-muted-foreground">/100</div>
      </div>
    </div>
  );
}
