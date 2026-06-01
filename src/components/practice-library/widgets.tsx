import { cn } from "@/lib/utils";
import { Star, ArrowDown, ArrowUp, Info, Filter, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// ---------- Donut ----------
export function Donut({
  value,
  size = 64,
  stroke = 8,
  color = "hsl(217 91% 60%)",
  track = "hsl(220 14% 92%)",
  label,
}: {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(Math.max(value, 0), 100) / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-foreground">
          {label}
        </div>
      )}
    </div>
  );
}

// ---------- Sparkline ----------
export function Sparkline({
  data,
  color = "hsl(217 91% 60%)",
  width = 120,
  height = 32,
  fill = false,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 4) - 2]);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} className="block">
      {fill && <path d={area} fill={color} opacity={0.15} />}
      <path d={d} stroke={color} strokeWidth={1.75} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ---------- Mini bars ----------
export function MiniBars({
  data,
  color = "hsl(0 84% 60%)",
  width = 120,
  height = 32,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...data) || 1;
  const bw = width / data.length - 2;
  return (
    <svg width={width} height={height} className="block">
      {data.map((v, i) => {
        const h = (v / max) * (height - 2);
        return (
          <rect
            key={i}
            x={i * (bw + 2)}
            y={height - h}
            width={bw}
            height={h}
            fill={color}
            opacity={0.85}
            rx={1}
          />
        );
      })}
    </svg>
  );
}

// ---------- Stars ----------
export function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

// ---------- Progress ----------
export function Progress({ value, color = "hsl(217 91% 60%)" }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

// ---------- Section Card ----------
export function Section({
  title,
  subtitle,
  action,
  children,
  className,
  Icon,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  Icon?: LucideIcon;
}) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ---------- KPI Tile ----------
export function Kpi({
  Icon,
  iconBg = "bg-blue-50",
  iconColor = "text-blue-600",
  label,
  sublabel,
  value,
  unit,
  delta,
  deltaDir,
  deltaTone = "positive",
  target,
  footer,
}: {
  Icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  label: string;
  sublabel?: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaDir?: "up" | "down";
  deltaTone?: "positive" | "negative" | "neutral";
  target?: string;
  footer?: ReactNode;
}) {
  const tone =
    deltaTone === "positive"
      ? "text-emerald-600"
      : deltaTone === "negative"
      ? "text-rose-600"
      : "text-muted-foreground";
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-muted-foreground leading-tight">{label}</div>
          {sublabel && <div className="text-[10px] text-muted-foreground leading-tight">{sublabel}</div>}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        {unit && <div className="text-sm font-semibold text-muted-foreground">{unit}</div>}
        {delta && (
          <div className={cn("ml-1 text-xs font-semibold inline-flex items-center", tone)}>
            {deltaDir === "down" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
            {delta}
          </div>
        )}
      </div>
      {target && <div className="text-[11px] text-muted-foreground mt-1">{target}</div>}
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
}

// ---------- Page header ----------
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  dateRange = "May 12 – Jun 12, 2024",
  compareRange = "vs Apr 12 – May 12, 2024",
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  dateRange?: string;
  compareRange?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
          N
        </div>
        <div>
          {eyebrow && (
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">{eyebrow}</div>
          )}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="rounded-lg border bg-card px-3 py-2 text-xs">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {dateRange}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{compareRange}</div>
        </div>
        <button className="rounded-lg border bg-card px-3 py-2 text-xs font-medium text-foreground inline-flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          Filters
        </button>
      </div>
    </div>
  );
}

// ---------- Row (label + value) ----------
export function Row({
  label,
  value,
  tone,
  right,
}: {
  label: string;
  value?: ReactNode;
  tone?: "ok" | "warn" | "bad" | "info";
  right?: ReactNode;
}) {
  const toneCls =
    tone === "ok"
      ? "text-emerald-600"
      : tone === "warn"
      ? "text-amber-600"
      : tone === "bad"
      ? "text-rose-600"
      : tone === "info"
      ? "text-blue-600"
      : "text-foreground";
  return (
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold", toneCls)}>{right ?? value}</span>
    </div>
  );
}

// ---------- Pill ----------
export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "ok" | "warn" | "bad" | "info" | "neutral";
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700"
      : tone === "bad"
      ? "bg-rose-50 text-rose-700"
      : tone === "info"
      ? "bg-blue-50 text-blue-700"
      : "bg-muted text-muted-foreground";
  return <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold", cls)}>{children}</span>;
}

// ---------- Executive Insight Banner ----------
export function InsightBanner({
  title,
  body,
  actions,
}: {
  title: string;
  body?: string;
  actions?: { label: string; tone?: "ok" | "warn" | "info" }[];
}) {
  return (
    <div className="rounded-2xl border bg-gradient-to-r from-indigo-50/60 via-white to-violet-50/60 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
          <Info className="h-4 w-4 text-indigo-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-indigo-700">{title}</div>
          {body && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{body}</p>}
          {actions && (
            <ul className="mt-2 space-y-1">
              {actions.map((a, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  {a.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
