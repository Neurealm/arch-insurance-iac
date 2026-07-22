import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  indigo: "border-indigo-200 bg-indigo-50/60 text-indigo-800",
  violet: "border-violet-200 bg-violet-50/60 text-violet-800",
  teal: "border-teal-200 bg-teal-50/60 text-teal-800",
  blue: "border-blue-200 bg-blue-50/60 text-blue-800",
  amber: "border-amber-200 bg-amber-50/60 text-amber-800",
  rose: "border-rose-200 bg-rose-50/60 text-rose-800",
  slate: "border-slate-200 bg-slate-50 text-slate-800",
  emerald: "border-emerald-200 bg-emerald-50/60 text-emerald-800",
};

const toneAccent: Record<string, string> = {
  indigo: "text-indigo-600",
  violet: "text-violet-600",
  teal: "text-teal-600",
  blue: "text-blue-600",
  amber: "text-amber-600",
  rose: "text-rose-600",
  slate: "text-slate-600",
  emerald: "text-emerald-600",
};

export function SectionCard({
  title, subtitle, right, children, className,
}: { title?: string; subtitle?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl bg-white border border-slate-200 shadow-sm", className)}>
      {(title || right) && (
        <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-100">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function KPIStatCard({
  label, value, sub, tone = "indigo", icon: Icon,
}: { label: string; value: string; sub?: string; tone?: string; icon?: LucideIcon }) {
  return (
    <div className={cn("rounded-xl border p-3 shadow-sm bg-white")}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
        {Icon && <Icon className={cn("h-4 w-4", toneAccent[tone])} />}
      </div>
      <div className="text-2xl font-bold text-slate-900 leading-tight mt-1">{value}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export function ArchitectureLayerCard({
  title, icon: Icon, tone = "slate", capabilities, active, onClick,
}: {
  title: string; icon: LucideIcon; tone?: string; capabilities: string[];
  active?: boolean; onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border p-3 transition-all hover:shadow-md hover:-translate-y-[1px]",
        toneMap[tone],
        active && "ring-2 ring-offset-1 ring-indigo-500",
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", toneAccent[tone])} />
        <div className="text-[13px] font-semibold text-slate-900">{title}</div>
      </div>
      <div className="flex flex-wrap gap-1">
        {capabilities.map((c) => (
          <span key={c} className="rounded-md bg-white/70 border border-white text-[11px] text-slate-700 px-1.5 py-0.5">
            {c}
          </span>
        ))}
      </div>
    </button>
  );
}

export function CapabilityCard({ label, icon: Icon, onClick, active }: {
  label: string; icon?: LucideIcon; onClick?: () => void; active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 transition",
        active && "border-indigo-400 bg-indigo-50 text-indigo-800",
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 text-slate-500" />}
      <span className="truncate">{label}</span>
    </button>
  );
}

export function StatusPill({ tone = "slate", children }: { tone?: string; children: ReactNode }) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", map[tone])}>
      {children}
    </span>
  );
}

export function DetailDrawer({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <aside className="rounded-xl bg-white border border-slate-200 shadow-sm sticky top-4">
      <header className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 rounded-t-xl">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600">Context</div>
        <div className="text-sm font-semibold text-slate-900 mt-0.5">{title}</div>
        {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
      </header>
      <div className="p-4 space-y-3 max-h-[calc(100vh-220px)] overflow-auto">{children}</div>
    </aside>
  );
}

export function DetailBlock({ label, items, tone = "slate" }: { label: string; items: string[]; tone?: string }) {
  return (
    <div>
      <div className={cn("text-[10px] font-semibold uppercase tracking-wide mb-1", toneAccent[tone])}>{label}</div>
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i} className="text-[12px] text-slate-700 flex gap-1.5">
            <span className="text-slate-300">•</span>
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
