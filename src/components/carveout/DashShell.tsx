import { ReactNode } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Calendar, Filter, Eye, ShieldCheck, Settings2, type LucideIcon } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

function formatLiveDate() {
  const d = new Date();
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" });
  return `${date} | ${time} ET`;
}

export type KPI = {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  spark?: number[];
};

export type Outcome = { icon: LucideIcon; color: string; title: string; l1: string; l2?: string };

export type WWH = {
  what: string[];
  why: string[];
  how: string[];
};

function InfoCard({ icon: Icon, title, subtitle, items, tone }: {
  icon: LucideIcon; title: string; subtitle: string; items: string[]; tone: "blue" | "green" | "purple";
}) {
  const tones = {
    blue: { bg: "bg-blue-50", border: "border-l-4 border-l-blue-500 border border-blue-100", icon: "text-blue-600", title: "text-blue-700" },
    green: { bg: "bg-emerald-50", border: "border-l-4 border-l-emerald-500 border border-emerald-100", icon: "text-emerald-600", title: "text-emerald-700" },
    purple: { bg: "bg-violet-50", border: "border-l-4 border-l-violet-500 border border-violet-100", icon: "text-violet-600", title: "text-violet-700" },
  } as const;
  const t = tones[tone];
  return (
    <div className={`rounded-xl ${t.border} ${t.bg} p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${t.icon}`} />
        <span className={`font-bold text-sm ${t.title}`}>{title}</span>
        <span className="text-xs text-slate-600">– {subtitle}</span>
      </div>
      <ul className="text-[12px] text-slate-700 space-y-1 list-disc list-inside leading-relaxed">
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}

export function KpiStrip({ kpis }: { kpis: KPI[] }) {
  const cols = kpis.length >= 8 ? "lg:grid-cols-8" : kpis.length === 7 ? "lg:grid-cols-7" : "lg:grid-cols-6";
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 ${cols} gap-3 mb-4`}>
      {kpis.map((k) => {
        const Icon = k.icon;
        return (
          <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-start gap-2">
              <div className={`h-8 w-8 rounded-lg ${k.bg} ${k.color} grid place-items-center shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-medium text-slate-500 truncate">{k.label}</div>
                <div className="text-xl font-bold text-slate-900 leading-tight truncate">{k.value}</div>
              </div>
            </div>
            {k.sub && <div className={`mt-1.5 text-[10px] ${k.subColor ?? "text-slate-500"}`}>{k.sub}</div>}
            {k.spark && (
              <div className="h-6 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={k.spark.map((v, i) => ({ i, v }))}>
                    <Line type="monotone" dataKey="v" stroke="hsl(217 91% 60%)" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OutcomeBar({ outcomes }: { outcomes: Outcome[] }) {
  return (
    <div className="mt-4 rounded-xl bg-slate-100 border border-slate-200 px-5 py-4">
      <div className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-6">
        {outcomes.map((o) => {
          const Icon = o.icon;
          return (
            <div key={o.title} className="flex items-start gap-2 flex-1 min-w-[160px]">
              <Icon className={`h-5 w-5 ${o.color} shrink-0 mt-0.5`} />
              <div className="min-w-0">
                <div className={`text-[11px] font-bold ${o.color}`}>{o.title}</div>
                <div className="text-[11px] text-slate-700 leading-snug">{o.l1}{o.l2 ? ` ${o.l2}` : ""}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Section({ title, children, action = "View Details →", className = "" }: {
  title: string; children: ReactNode; action?: string; className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        {action && <a className="text-xs text-blue-600 font-medium cursor-pointer">{action}</a>}
      </div>
      {children}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  let cls = "bg-slate-100 text-slate-700 border-slate-200";
  if (/(on track|active|complete|connected|resolved|healthy|on-time|met|approved|delivered)/.test(s))
    cls = "bg-emerald-50 text-emerald-700 border-emerald-200";
  else if (/(at risk|warning|expiring|pending|review|in progress|in-progress|queued|standby|beta)/.test(s))
    cls = "bg-amber-50 text-amber-700 border-amber-200";
  else if (/(blocked|critical|failed|delayed|escalated|high|risk)/.test(s))
    cls = "bg-red-50 text-red-700 border-red-200";
  else if (/(planned|info|new)/.test(s))
    cls = "bg-blue-50 text-blue-700 border-blue-200";
  return <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{status}</span>;
}

export function DashShell({
  title, highlight, subtitle, dateStr, wwh, kpis, outcomes, children, topActions,
}: {
  title: string;
  highlight?: string;
  subtitle: string;
  dateStr?: string;
  wwh: WWH;
  kpis: KPI[];
  outcomes: Outcome[];
  children: ReactNode;
  topActions?: ReactNode;
}) {
  return (
    <AppShell>
      <main className="flex-1 px-6 py-5 bg-slate-50/50 animate-fade-in min-w-0">
        {topActions && <div className="mb-4">{topActions}</div>}
        {/* Header */}
        <div className="flex items-start justify-between mb-5 gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
              {title} {highlight && <span className="text-slate-700">{highlight}</span>}
            </h1>
            <p className="text-sm italic text-slate-600 mt-1">{subtitle}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
                <Calendar className="h-3.5 w-3.5" /> {formatLiveDate()}
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
              </span>
            </div>
            <button className="inline-flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50">
              <Filter className="h-3.5 w-3.5" /> Auto Refresh
            </button>
          </div>
        </div>

        {/* WHAT / WHY / HOW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <InfoCard icon={Eye} tone="blue" title="WHAT" subtitle="What this dashboard shows" items={wwh.what} />
          <InfoCard icon={ShieldCheck} tone="green" title="WHY" subtitle="Why it matters" items={wwh.why} />
          <InfoCard icon={Settings2} tone="purple" title="HOW" subtitle="How we deliver it" items={wwh.how} />
        </div>

        {/* KPI strip */}
        <KpiStrip kpis={kpis} />

        {/* Body */}
        {children}

        {/* Outcome footer */}
        {outcomes.length > 0 && <OutcomeBar outcomes={outcomes} />}
      </main>
    </AppShell>
  );
}