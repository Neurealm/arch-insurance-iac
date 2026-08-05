/**
 * AIM-004 — semicircular operational metric gauge.
 *
 * Accessible SVG. No animation, no gradient, no three-dimensional effects.
 */

import { cn } from "@/lib/utils";

export interface OperationalMetricGaugeProps {
  label: string;
  /** 0 to 100 percentage of the arc to fill. */
  percent: number;
  displayValue: string;
  target?: string;
  caption?: string;
  status: "On target" | "Near target" | "Below target";
  size?: number;
}

const STATUS_COLOR: Record<OperationalMetricGaugeProps["status"], string> = {
  "On target": "#059669",
  "Near target": "#d97706",
  "Below target": "#e11d48",
};

export function OperationalMetricGauge({
  label, percent, displayValue, target, caption, status, size = 168,
}: OperationalMetricGaugeProps) {
  const pct = Math.min(100, Math.max(0, Number.isFinite(percent) ? percent : 0));
  const width = size;
  const height = size / 2 + 16;
  const radius = (size - 24) / 2;
  const cx = width / 2;
  const cy = size / 2;
  const circumference = Math.PI * radius;
  const dash = (pct / 100) * circumference;
  const color = STATUS_COLOR[status];

  const arc = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  return (
    <figure className="flex flex-col items-center" data-testid="operational-gauge">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${label}, ${displayValue}${target ? `, target ${target}` : ""}, ${status}`}
      >
        <path d={arc} fill="none" stroke="#e2e8f0" strokeWidth={12} strokeLinecap="round" />
        <path
          d={arc}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
        <text x={cx} y={cy - 12} textAnchor="middle" className="fill-slate-900" fontSize={26} fontWeight={600}>
          {displayValue}
        </text>
        <text x={cx} y={cy + 6} textAnchor="middle" className="fill-slate-500" fontSize={10}>
          {target ? `Target ${target}` : ""}
        </text>
      </svg>
      <figcaption className={cn("-mt-1 text-center text-[11px] font-medium text-slate-700")}>
        {label}
        {caption && <span className="block text-[10.5px] font-normal text-slate-500">{caption}</span>}
      </figcaption>
    </figure>
  );
}
