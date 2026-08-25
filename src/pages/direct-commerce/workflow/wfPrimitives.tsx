import { useState } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------- sparkline -------------------------------- */

export function Sparkline({
  data, color = "#2563EB", width = 88, height = 26, fill = true,
}: { data: number[]; color?: string; width?: number; height?: number; fill?: boolean }) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 4) - 2] as const);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg width={width} height={height} className="block overflow-visible" aria-hidden>
      {fill && <path d={`${d} L${width},${height} L0,${height} Z`} fill={color} opacity={0.1} />}
      <path d={d} stroke={color} strokeWidth={1.6} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------------------------- donut --------------------------------- */

export function Donut({
  segments, size = 132, stroke = 16, centerValue, centerLabel, onSegmentClick,
}: {
  segments: { key: string; value: number; color: string }[];
  size?: number; stroke?: number; centerValue: string; centerLabel: string;
  onSegmentClick?: (key: string) => void;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} role="img" aria-label={`${centerValue} ${centerLabel}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={s.key} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
              className={onSegmentClick ? "cursor-pointer transition-opacity hover:opacity-75" : undefined}
              onClick={onSegmentClick ? () => onSegmentClick(s.key) : undefined}
            />
          );
          offset += len;
          return el;
        })}
      </g>
      <text x="50%" y="47%" textAnchor="middle" className="fill-slate-900 text-[22px] font-semibold">{centerValue}</text>
      <text x="50%" y="62%" textAnchor="middle" className="fill-slate-500 text-[10px]">{centerLabel}</text>
    </svg>
  );
}

/* -------------------------------- line chart ------------------------------- */

export function LineChart({
  labels, series, height = 150,
}: {
  labels: string[];
  series: { key: string; color: string; data: number[] }[];
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 300;
  const padL = 26, padB = 18, padT = 8;
  const all = series.flatMap((s) => s.data);
  const max = Math.max(...all, 1);
  const innerW = width - padL - 6;
  const innerH = height - padB - padT;
  const x = (i: number) => padL + (i / (labels.length - 1)) * innerW;
  const y = (v: number) => padT + innerH - (v / max) * innerH;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Throughput over time"
        onMouseLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={padL} x2={width - 6} y1={y(max * f)} y2={y(max * f)} stroke="#E2E8F0" strokeWidth={1} />
            <text x={2} y={y(max * f) + 3} className="fill-slate-400 text-[7px]">{Math.round(max * f)}</text>
          </g>
        ))}
        {series.map((s) => (
          <path key={s.key} fill="none" stroke={s.color} strokeWidth={1.5}
            d={s.data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ")} />
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + innerH} stroke="#94A3B8" strokeDasharray="3 2" />}
        {labels.map((l, i) => (
          <g key={l}>
            <rect x={x(i) - innerW / (labels.length * 2)} y={0} width={innerW / labels.length} height={height}
              fill="transparent" onMouseEnter={() => setHover(i)} />
            {i % 2 === 0 && <text x={x(i)} y={height - 4} textAnchor="middle" className="fill-slate-400 text-[7px]">{l}</text>}
          </g>
        ))}
      </svg>
      <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
        {series.map((s) => (
          <div key={s.key} className="flex items-center justify-between gap-1 text-[10px]">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="h-[2px] w-3 rounded" style={{ background: s.color }} />
              {s.key}
            </span>
            {hover !== null && <span className="font-semibold text-slate-900">{s.data[hover]}</span>}
          </div>
        ))}
      </div>
      <div className="mt-1 text-[10px] text-slate-400">
        {hover === null ? "Hover the chart for exact values" : `At ${labels[hover]}`}
      </div>
    </div>
  );
}

/* ---------------------------------- chips ---------------------------------- */

export function Chip({
  children, tone = "neutral", className,
}: { children: React.ReactNode; tone?: "ok" | "warn" | "bad" | "info" | "neutral" | "purple" | "teal"; className?: string }) {
  const map: Record<string, string> = {
    ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    warn: "bg-amber-50 text-amber-700 ring-amber-200",
    bad: "bg-rose-50 text-rose-700 ring-rose-200",
    info: "bg-blue-50 text-blue-700 ring-blue-200",
    purple: "bg-violet-50 text-violet-700 ring-violet-200",
    teal: "bg-teal-50 text-teal-700 ring-teal-200",
    neutral: "bg-slate-50 text-slate-600 ring-slate-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-medium ring-1 ring-inset", map[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-[#E7EBF0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]", className)}>{children}</div>;
}

export function CardHead({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#EEF1F5] px-4 py-2.5">
      <div className="min-w-0">
        <h2 className="text-[12.5px] font-semibold text-[#1E293B]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[10.5px] text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
