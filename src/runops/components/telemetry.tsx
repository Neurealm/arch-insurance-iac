// TelemetryChart, TraceWaterfall, LogTable — built on recharts + tailwind.
// Deterministic input; no randomness.

import { cn } from "@/lib/utils";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { tones, type StatusTone } from "./variants";

/* --------------------------- TelemetryChart -------------------------- */

export interface TelemetrySeries {
  key: string;
  label: string;
  points: { t: string | number; v: number }[];
  tone?: StatusTone;
}

const colorFor = (tone: StatusTone) => {
  const d = tones[tone].dot;
  return d.includes("emerald") ? "#059669"
    : d.includes("amber") ? "#d97706"
    : d.includes("orange") ? "#ea580c"
    : d.includes("rose") ? "#e11d48"
    : d.includes("sky") ? "#0284c7"
    : d.includes("indigo") ? "#4f46e5"
    : "#475569";
};

export function TelemetryChart({
  series, height = 220, yUnit, className, ariaLabel,
}: {
  series: TelemetrySeries[];
  height?: number;
  yUnit?: string;
  className?: string;
  ariaLabel?: string;
}) {
  // Merge into a single dataset keyed by `t`.
  const merged: Record<string, Record<string, number | string>> = {};
  for (const s of series) {
    for (const p of s.points) {
      const k = String(p.t);
      if (!merged[k]) merged[k] = { t: p.t };
      merged[k][s.key] = p.v;
    }
  }
  const data = Object.values(merged);
  return (
    <div
      className={cn("rounded border border-slate-200 bg-white p-2", className)}
      role="img"
      aria-label={ariaLabel ?? `Telemetry chart with ${series.length} series`}
    >
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
            <XAxis dataKey="t" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} width={36} unit={yUnit} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={colorFor(s.tone ?? "neutral")}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-1 flex flex-wrap gap-3 text-[11px] text-slate-600">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1">
            <span className="h-1.5 w-3 rounded" style={{ backgroundColor: colorFor(s.tone ?? "neutral") }} aria-hidden />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------- TraceWaterfall -------------------------- */

export interface TraceSpan {
  id: string;
  label: string;
  service: string;
  startMs: number;
  durationMs: number;
  tone?: StatusTone;
}

export function TraceWaterfall({
  spans, className, ariaLabel = "Trace waterfall",
}: { spans: TraceSpan[]; className?: string; ariaLabel?: string }) {
  const total = spans.reduce((m, s) => Math.max(m, s.startMs + s.durationMs), 0) || 1;
  return (
    <div
      className={cn("rounded border border-slate-200 bg-white p-2", className)}
      role="img"
      aria-label={`${ariaLabel} — ${spans.length} spans over ${total} ms`}
    >
      <ul className="space-y-1">
        {spans.map((s) => {
          const left = (s.startMs / total) * 100;
          const width = Math.max(1, (s.durationMs / total) * 100);
          const color = colorFor(s.tone ?? "neutral");
          return (
            <li key={s.id} className="grid grid-cols-[160px_1fr_60px] items-center gap-2 text-[11px]">
              <div className="truncate">
                <span className="font-semibold text-slate-800">{s.label}</span>
                <div className="text-[10px] text-slate-500">{s.service}</div>
              </div>
              <div className="relative h-3 rounded bg-slate-100" aria-hidden>
                <div
                  className="absolute top-0 h-3 rounded"
                  style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color, opacity: 0.85 }}
                />
              </div>
              <div className="text-right font-mono text-[10px] text-slate-600">{s.durationMs}ms</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------- LogTable ---------------------------- */

export interface LogRow {
  id: string;
  at: string;
  level: "info" | "warn" | "error" | "debug";
  service: string;
  message: string;
}

const logToneMap: Record<LogRow["level"], StatusTone> = {
  info: "neutral", warn: "warning", error: "failure", debug: "connected",
};

export function LogTable({ rows, className }: { rows: LogRow[]; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded border border-slate-200 bg-white", className)}>
      <table className="w-full text-left text-[11px] font-mono">
        <caption className="sr-only">Log entries</caption>
        <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="px-2 py-1">Time</th>
            <th scope="col" className="px-2 py-1">Level</th>
            <th scope="col" className="px-2 py-1">Service</th>
            <th scope="col" className="px-2 py-1">Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => {
            const spec = tones[logToneMap[r.level]];
            return (
              <tr key={r.id}>
                <td className="whitespace-nowrap px-2 py-1 text-slate-500">{r.at}</td>
                <td className="px-2 py-1">
                  <span className={cn("rounded border px-1 py-0.5 text-[10px] font-semibold uppercase", spec.chip)}>{r.level}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-1 text-slate-700">{r.service}</td>
                <td className="px-2 py-1 text-slate-800">{r.message}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
