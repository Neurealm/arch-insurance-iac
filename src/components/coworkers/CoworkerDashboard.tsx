import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDown, ArrowUp, Check, Pause, ChevronRight, type LucideIcon,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AppShell } from "@/components/eoc/AppShell";

export type Tone = "pos" | "neg" | "neutral";
export type ChipTone = "green" | "blue" | "orange" | "purple" | "red" | "yellow" | "indigo";

const toneText = (t?: Tone) =>
  t === "neg" ? "text-rose-600" : t === "neutral" ? "text-slate-500" : "text-emerald-600";

const chipBg: Record<ChipTone, string> = {
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  purple: "bg-purple-100 text-purple-700",
  red: "bg-rose-100 text-rose-700",
  yellow: "bg-amber-100 text-amber-700",
  indigo: "bg-indigo-100 text-indigo-700",
};

const dotBg: Record<string, string> = {
  red: "bg-rose-500", orange: "bg-orange-500", yellow: "bg-amber-400",
  green: "bg-emerald-500", blue: "bg-blue-500", purple: "bg-purple-500",
  indigo: "bg-indigo-500", teal: "bg-teal-500", cyan: "bg-cyan-500",
};

export type Kpi = {
  icon: LucideIcon;
  iconColor: string;   // e.g. text-blue-600
  iconBg: string;      // e.g. bg-blue-50
  label: string;
  value: string;
  deltaText: string;
  deltaTone?: Tone;
  deltaDir?: "up" | "down";
};

export type OutcomeRow = {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  delta: string;
  deltaTone?: Tone;
  deltaDir?: "up" | "down";
};

export type ActivityItem = {
  time: string;
  tone: ChipTone;
  icon: LucideIcon;
  title: string;
  subtitle: string;
};

export type HealthRow = { name: string; status?: string; freshness?: string; received?: string };

export type Segment = { label: string; value: string; pct: number; color: string };

export type CoworkerConfig = {
  backTo?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  mission: string;
  consoleClass: string; // tailwind bg class for "Open Workflow Console" button
  kpis: Kpi[];          // 6
  tabs: string[];
  overview: {
    rows: Array<[string, string]>;
    automation: string;
    risk: { label: string; tone: ChipTone };
    updated: string;
  };
  whatIDo: { paragraph: string; responsibilities: string[] };
  center: {
    title: string;
    type: "donut" | "funnel";
    totalLabel?: string;
    totalValue?: string;
    segments: Segment[];
    bottomTitle: string;
    bottomCells: Array<{ label: string; value: string; tone?: "pos" }>;
  };
  outcomes: { title: string; items: OutcomeRow[] };
  bottomLeft: {
    title: string;
    columns: string[];
    rows: Array<{ dot?: string; cells: string[] }>;
    link?: string;
  };
  activity: { title: string; items: ActivityItem[] };
  health: { title: string; rows: HealthRow[] };
};

function Donut({ segments, totalLabel, totalValue }: {
  segments: Segment[]; totalLabel?: string; totalValue?: string;
}) {
  const data = segments.map((s) => ({ name: s.label, value: s.pct, color: s.color }));
  return (
    <div className="relative h-[170px] w-[170px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={56} outerRadius={80} stroke="none" startAngle={90} endAngle={-270}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {totalValue && (
        <div className="absolute inset-0 grid place-items-center text-center pointer-events-none">
          <div>
            <div className="text-[18px] font-extrabold text-slate-800 leading-none">{totalValue}</div>
            <div className="text-[10px] text-slate-500 mt-1">{totalLabel}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Funnel({ segments }: { segments: Segment[] }) {
  const max = Math.max(...segments.map((s) => s.pct));
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      {segments.map((s, i) => {
        const w = 55 + (s.pct / max) * 45; // 55-100%
        return (
          <div
            key={i}
            className="h-7 rounded-sm flex items-center justify-center text-[10px] font-semibold text-white shadow-sm"
            style={{ width: `${w}%`, backgroundColor: s.color }}
          />
        );
      })}
    </div>
  );
}

export function CoworkerDashboard({ config }: { config: CoworkerConfig }) {
  const nav = useNavigate();
  const c = config;
  const HeaderIcon = c.icon;

  return (
    <AppShell>
      <main className="flex-1 bg-slate-50/60 px-4 py-4 animate-fade-in">
        {/* Header */}
        <div className="rounded-xl bg-white border border-slate-200 px-5 py-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`h-14 w-14 rounded-full ${c.iconBg} grid place-items-center shrink-0`}>
              <HeaderIcon className={`h-7 w-7 ${c.iconColor}`} />
            </div>
            <div className="min-w-0">
              {c.backTo && (
                <button onClick={() => nav(c.backTo!)} className="text-[11px] text-slate-500 hover:text-slate-800 mb-0.5 inline-flex items-center gap-1">
                  ← Back
                </button>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[20px] font-extrabold tracking-tight text-slate-900">{c.title}</h1>
                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Active</span>
              </div>
              <p className="text-[12px] text-slate-500 mt-0.5 max-w-[820px]">
                <span className="font-semibold text-slate-700">Mission:</span> {c.mission}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white text-[12px] font-semibold text-slate-700 hover:bg-slate-50">
              <Pause className="h-3.5 w-3.5" /> Pause Coworker
            </button>
            <button className={`h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-[12px] font-semibold text-white shadow-sm ${c.consoleClass}`}>
              <ChevronRight className="h-3.5 w-3.5" /> Open Workflow Console
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mt-3">
          {c.kpis.map((k, i) => {
            const Icon = k.icon;
            const Arrow = k.deltaDir === "down" ? ArrowDown : ArrowUp;
            return (
              <div key={i} className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg ${k.iconBg} grid place-items-center`}>
                    <Icon className={`h-4 w-4 ${k.iconColor}`} />
                  </div>
                  <div className="text-[10.5px] font-semibold text-slate-500 leading-tight">{k.label}</div>
                </div>
                <div className="text-[22px] font-extrabold tracking-tight text-slate-900 mt-1.5">{k.value}</div>
                <div className={`mt-0.5 text-[10.5px] font-semibold inline-flex items-center gap-0.5 ${toneText(k.deltaTone)}`}>
                  <Arrow className="h-3 w-3" />
                  {k.deltaText}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="mt-3 border-b border-slate-200 flex items-center gap-5 px-2 text-[12px]">
          {c.tabs.map((t, i) => (
            <button key={t} className={`py-2.5 -mb-px border-b-2 ${i === 0 ? "border-blue-600 text-blue-700 font-semibold" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Main 4-col */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mt-3">
          {/* Coworker Overview */}
          <section className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-800 mb-3">Coworker Overview</h3>
            <dl className="space-y-2.5 text-[11.5px]">
              {c.overview.rows.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-slate-800 font-medium leading-snug">{v}</dd>
                </div>
              ))}
              <div>
                <dt className="text-slate-500">Automation Level</dt>
                <dd><span className="inline-block mt-0.5 text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">{c.overview.automation}</span></dd>
              </div>
              <div>
                <dt className="text-slate-500">Risk Level</dt>
                <dd><span className={`inline-block mt-0.5 text-[10.5px] font-semibold px-2 py-0.5 rounded-md ${chipBg[c.overview.risk.tone]}`}>{c.overview.risk.label}</span></dd>
              </div>
              <div>
                <dt className="text-slate-500">Last Updated</dt>
                <dd className="text-slate-800 font-medium">{c.overview.updated}</dd>
              </div>
            </dl>
          </section>

          {/* What I Do */}
          <section className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-800 mb-2">What I Do</h3>
            <p className="text-[11.5px] text-slate-600 leading-relaxed">{c.whatIDo.paragraph}</p>
            <h4 className="text-[12px] font-bold text-slate-800 mt-3 mb-1.5">Key Responsibilities</h4>
            <ul className="space-y-1.5">
              {c.whatIDo.responsibilities.map((r) => (
                <li key={r} className="flex items-start gap-2 text-[11.5px] text-slate-700">
                  <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center shrink-0 mt-0.5">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                  <span className="leading-snug">{r}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Center Chart */}
          <section className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-800 mb-2">{c.center.title}</h3>
            <div className="grid grid-cols-2 gap-2 items-center">
              <div>
                {c.center.type === "donut" ? (
                  <Donut segments={c.center.segments} totalLabel={c.center.totalLabel} totalValue={c.center.totalValue} />
                ) : (
                  <Funnel segments={c.center.segments} />
                )}
              </div>
              <ul className="space-y-1.5">
                {c.center.segments.map((s) => (
                  <li key={s.label} className="flex items-center justify-between text-[11px]">
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-slate-700 truncate">{s.label}</span>
                    </span>
                    <span className="text-slate-800 font-semibold tabular-nums">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 rounded-lg bg-emerald-50/60 border border-emerald-100 p-2.5">
              <div className="text-[11px] font-semibold text-slate-700 mb-1">{c.center.bottomTitle}</div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {c.center.bottomCells.map((b) => (
                  <div key={b.label}>
                    <div className="text-[14px] font-bold text-emerald-700">{b.value}</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Outcomes */}
          <section className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[13px] font-bold text-slate-800">{c.outcomes.title}</h3>
              <a className="text-[10.5px] text-blue-600 font-semibold cursor-pointer">View outcomes</a>
            </div>
            <ul className="space-y-2.5">
              {c.outcomes.items.map((o, i) => {
                const Icon = o.icon;
                const Arrow = o.deltaDir === "down" ? ArrowDown : ArrowUp;
                return (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className={`h-7 w-7 rounded-md ${o.iconBg} grid place-items-center shrink-0`}>
                      <Icon className={`h-3.5 w-3.5 ${o.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-slate-600 leading-tight">{o.label}</div>
                      <div className="text-[14px] font-bold text-slate-900 leading-tight">{o.value}</div>
                    </div>
                    <div className={`text-[10.5px] font-semibold inline-flex items-center gap-0.5 ${toneText(o.deltaTone)} shrink-0`}>
                      <Arrow className="h-3 w-3" />
                      {o.delta}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Bottom 3-col */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
          {/* Top X table */}
          <section className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[13px] font-bold text-slate-800">{c.bottomLeft.title}</h3>
              <a className="text-[10.5px] text-blue-600 font-semibold cursor-pointer">View all</a>
            </div>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-slate-500">
                  {c.bottomLeft.columns.map((col) => (
                    <th key={col} className="text-left font-medium py-1.5 border-b border-slate-100">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.bottomLeft.rows.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    {r.cells.map((cell, j) => (
                      <td key={j} className="py-2 text-slate-700">
                        {j === 0 && r.dot ? (
                          <span className="inline-flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${dotBg[r.dot] || "bg-slate-400"}`} />
                            {cell}
                          </span>
                        ) : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {c.bottomLeft.link && (
              <a className="block mt-2 text-[11px] text-blue-600 font-semibold cursor-pointer">{c.bottomLeft.link}</a>
            )}
          </section>

          {/* Activity Feed */}
          <section className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[13px] font-bold text-slate-800">{c.activity.title}</h3>
              <a className="text-[10.5px] text-blue-600 font-semibold cursor-pointer">View full feed</a>
            </div>
            <ul className="space-y-2.5">
              {c.activity.items.map((a, i) => {
                const Icon = a.icon;
                return (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[10.5px] font-semibold text-slate-500 w-14 shrink-0 mt-1">{a.time}</span>
                    <span className={`h-5 w-5 rounded-full grid place-items-center shrink-0 mt-0.5 ${chipBg[a.tone]}`}>
                      <Icon className="h-2.5 w-2.5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11.5px] font-semibold text-slate-800 leading-tight">{a.title}</div>
                      <div className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">{a.subtitle}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Health */}
          <section className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[13px] font-bold text-slate-800">{c.health.title}</h3>
              <a className="text-[10.5px] text-blue-600 font-semibold cursor-pointer">View all systems</a>
            </div>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-slate-500">
                  <th className="text-left font-medium py-1.5 border-b border-slate-100">System / Source</th>
                  <th className="text-left font-medium py-1.5 border-b border-slate-100">Status</th>
                  <th className="text-left font-medium py-1.5 border-b border-slate-100">Last</th>
                </tr>
              </thead>
              <tbody>
                {c.health.rows.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 text-slate-700">{r.name}</td>
                    <td className="py-2">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {r.status || "Healthy"}
                      </span>
                    </td>
                    <td className="py-2 text-slate-500">{r.freshness || r.received || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </AppShell>
  );
}

export default CoworkerDashboard;