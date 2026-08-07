import { type ReactNode, useState } from "react";
import { ChevronDown, ChevronRight, RefreshCw, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------- tokens */

export type Tone = "blue" | "emerald" | "sky" | "amber" | "violet" | "teal" | "rose" | "slate";

export const toneMap: Record<Tone, { text: string; bg: string; border: string; ring: string }> = {
  blue: { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", ring: "bg-blue-500" },
  emerald: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", ring: "bg-emerald-500" },
  sky: { text: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200", ring: "bg-sky-500" },
  amber: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", ring: "bg-amber-500" },
  violet: { text: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", ring: "bg-violet-500" },
  teal: { text: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200", ring: "bg-teal-500" },
  rose: { text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", ring: "bg-rose-500" },
  slate: { text: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200", ring: "bg-slate-400" },
};

export const CHART_COLORS = ["#6366f1", "#3b82f6", "#f59e0b", "#10b981", "#a855f7", "#ec4899", "#94a3b8"];

/* ------------------------------------------------------------ drawer api */

export interface DrawerPayload {
  title: string;
  subtitle?: string;
  tone?: Tone;
  rows?: [string, string][];
  bullets?: string[];
  body?: ReactNode;
}

export function useDetailDrawer() {
  const [payload, setPayload] = useState<DrawerPayload | null>(null);
  return {
    payload,
    open: (p: DrawerPayload) => setPayload(p),
    close: () => setPayload(null),
  };
}

export function DetailDrawer({ payload, onClose }: { payload: DrawerPayload | null; onClose: () => void }) {
  const tone = toneMap[payload?.tone ?? "blue"];
  return (
    <Sheet open={!!payload} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
        {payload && (
          <div>
            <div className={cn("border-b px-5 py-4", tone.bg, tone.border)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Evidence detail</div>
                  <h2 className="mt-0.5 text-[17px] font-bold leading-tight text-slate-900">{payload.title}</h2>
                  {payload.subtitle && <p className="mt-1 text-[12px] text-slate-600">{payload.subtitle}</p>}
                </div>
                <button
                  type="button" onClick={onClose} aria-label="Close detail"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded text-slate-500 hover:bg-white/70 hover:text-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4 px-5 py-4">
              {payload.rows && payload.rows.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <SectionEyebrow>Attributes</SectionEyebrow>
                  <dl className="mt-2 divide-y divide-slate-100">
                    {payload.rows.map(([k, v]) => (
                      <div key={k} className="flex items-start justify-between gap-6 py-1.5">
                        <dt className="text-[12px] text-slate-500">{k}</dt>
                        <dd className="text-right text-[12.5px] font-medium text-slate-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
              {payload.bullets && payload.bullets.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <SectionEyebrow>Supporting evidence</SectionEyebrow>
                  <ul className="mt-2 space-y-1.5">
                    {payload.bullets.map((b) => (
                      <li key={b} className="flex gap-2 text-[12.5px] text-slate-700">
                        <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {payload.body}
              <p className="text-[11px] text-slate-400">
                Demonstration environment. Financial and operational values are synthetic.
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------------------------------------------- surfaces */

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{children}</div>;
}

export function Panel({
  index, title, action, className, children, id,
}: {
  index?: number | string; title: string; action?: ReactNode; className?: string; children: ReactNode; id?: string;
}) {
  return (
    <section id={id} className={cn("rounded-xl border border-slate-200 bg-white p-4 shadow-sm", className)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
          {index !== undefined ? `${index}. ` : ""}{title}
        </div>
        {action && <div className="shrink-0 text-[11px] text-slate-500">{action}</div>}
      </div>
      {children}
    </section>
  );
}

export function Card({ title, className, children }: { title?: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-4 shadow-sm", className)}>
      {title && <div className="mb-2 text-sm font-semibold text-slate-900">{title}</div>}
      {children}
    </div>
  );
}

export function Badge({ tone = "slate", children }: { tone?: Tone; children: ReactNode }) {
  const t = toneMap[tone];
  return (
    <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 text-[10.5px] font-medium", t.text, t.bg, t.border)}>
      {children}
    </span>
  );
}

export function LinkAction({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      className="inline-flex items-center gap-1 text-[11.5px] font-medium text-indigo-600 hover:text-indigo-800"
    >
      {children} <ChevronRight className="h-3 w-3" />
    </button>
  );
}

/* ------------------------------------------------------------- kpi strip */

export interface Kpi {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone: Tone;
  detail?: DrawerPayload;
}

export function KpiStrip({ kpis, onSelect, trailer }: { kpis: Kpi[]; onSelect?: (k: Kpi) => void; trailer?: ReactNode }) {
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
      {kpis.map((k) => {
        const t = toneMap[k.tone];
        const Icon = k.icon;
        return (
          <button
            key={k.id}
            type="button"
            onClick={() => onSelect?.(k)}
            className="rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-indigo-300 hover:shadow"
          >
            <div className="flex items-start gap-2">
              <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-md border", t.bg, t.border, t.text)}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">{k.label}</div>
                <div className="text-2xl font-bold leading-tight text-slate-900">{k.value}</div>
                {k.sub && <div className={cn("text-[11px]", t.text)}>{k.sub}</div>}
              </div>
            </div>
          </button>
        );
      })}
      {trailer}
    </section>
  );
}

export function HealthTile({ label = "Optimization Health", value = "Good", note }: { label?: string; value?: string; note: string }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
      <div className="text-[10px] uppercase tracking-wide text-emerald-700">{label}</div>
      <div className="text-lg font-bold leading-tight text-emerald-800">{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-600">{note}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- tables */

export function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return (
    <th className={cn(
      "border-b border-slate-200 px-2 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500",
      right ? "text-right" : "text-left",
    )}>
      {children}
    </th>
  );
}

export function Td({ children, right, className }: { children: ReactNode; right?: boolean; className?: string }) {
  return (
    <td className={cn("border-b border-slate-100 px-2 py-2 text-[13px] text-slate-700", right && "text-right tabular-nums", className)}>
      {children}
    </td>
  );
}

export function DataTable({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse">
        <thead><tr>{head}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function confidenceTone(pct: number): Tone {
  if (pct >= 90) return "emerald";
  if (pct >= 70) return "amber";
  return "rose";
}

export function ConfidenceCell({ pct, right }: { pct: number; right?: boolean }) {
  const t = toneMap[confidenceTone(pct)];
  return <Td right={right}><span className={cn("font-semibold", t.text)}>{pct}%</span></Td>;
}

export function RiskCell({ level, right }: { level: "Low" | "Medium" | "High" | "Very Low" | "Critical"; right?: boolean }) {
  const tone: Tone = level === "High" || level === "Critical" ? "rose" : level === "Medium" ? "amber" : "emerald";
  return <Td right={right}><span className={cn("font-medium", toneMap[tone].text)}>{level}</span></Td>;
}

/* ---------------------------------------------------------------- charts */

export function DonutCard({
  data, total, totalLabel, height = 210,
}: {
  data: { name: string; value: number; display?: string; color?: string }[];
  total: string; totalLabel?: string; height?: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative" style={{ width: 190, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={58} outerRadius={84} paddingAngle={1} stroke="none">
              {data.map((d, i) => <Cell key={d.name} fill={d.color ?? CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-lg font-bold leading-tight text-slate-900">{total}</div>
            {totalLabel && <div className="text-[10px] text-slate-500">{totalLabel}</div>}
          </div>
        </div>
      </div>
      <ul className="min-w-[200px] flex-1 space-y-1.5">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-[12px] text-slate-700">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color ?? CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="flex-1 truncate">{d.name}</span>
            <span className="font-medium tabular-nums text-slate-900">{d.display ?? d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CostDriverBars({ data }: { data: { name: string; value: number; display: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-2">
      {data.map((d) => (
        <li key={d.name} className="grid grid-cols-[150px_1fr_90px] items-center gap-2">
          <span className="truncate text-[12px] text-slate-600">{d.name}</span>
          <span className="h-3 rounded-sm bg-slate-100">
            <span className="block h-3 rounded-sm bg-blue-600" style={{ width: `${(d.value / max) * 100}%` }} />
          </span>
          <span className="text-right text-[12px] font-medium tabular-nums text-slate-900">{d.display}</span>
        </li>
      ))}
    </ul>
  );
}

export function Spark({ data, color = "#3b82f6", height = 40 }: { data: { x: number; y: number }[]; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="y" stroke={color} strokeWidth={1.6} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TrendArea({
  data, height = 190, color = "#3b82f6", yTickFormatter,
}: {
  data: Record<string, number | string>[]; height?: number; color?: string; yTickFormatter?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="finopsArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={yTickFormatter} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.8} fill="url(#finopsArea)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SimpleBars({
  data, height = 190, color = "#3b82f6",
}: { data: { label: string; value: number }[]; height?: number; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ProgressRow({ label, pct, tone = "emerald", right }: { label: string; pct: number; tone?: Tone; right?: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr_54px] items-center gap-2">
      <span className="truncate text-[12px] text-slate-600">{label}</span>
      <span className="h-1.5 rounded-full bg-slate-100">
        <span className={cn("block h-1.5 rounded-full", toneMap[tone].ring)} style={{ width: `${Math.min(pct, 100)}%` }} />
      </span>
      <span className="text-right text-[11.5px] font-medium tabular-nums text-slate-700">{right ?? `${pct}%`}</span>
    </div>
  );
}

export function GaugeRing({ pct, label, sub, tone = "emerald" }: { pct: number; label?: string; sub?: string; tone?: Tone }) {
  const color = tone === "emerald" ? "#10b981" : tone === "amber" ? "#f59e0b" : tone === "rose" ? "#ef4444" : "#3b82f6";
  const data = [{ name: "done", value: pct }, { name: "rest", value: 100 - pct }];
  return (
    <div className="relative mx-auto" style={{ width: 150, height: 150 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={54} outerRadius={70} startAngle={90} endAngle={-270} stroke="none">
            <Cell fill={color} />
            <Cell fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-xl font-bold text-slate-900">{pct}%</div>
          {label && <div className="text-[10px] text-slate-500">{label}</div>}
          {sub && <div className="text-[10px] font-medium text-emerald-700">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- collapsible */

export function Disclosure({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button" onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-[11.5px] font-medium text-indigo-600 hover:text-indigo-800"
      >
        <ChevronDown className={cn("h-3 w-3 transition", open ? "rotate-0" : "-rotate-90")} /> {label}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

export function RefreshNote({ text = "2 minutes ago" }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
      <RefreshCw className="h-3 w-3" /> Data refreshed: {text}
    </span>
  );
}
