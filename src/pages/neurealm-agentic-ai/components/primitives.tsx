import { ReactNode } from "react";
import { LucideIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Tone system — single source                                                */
/* -------------------------------------------------------------------------- */

export const toneMap: Record<string, string> = {
  indigo:  "border-indigo-200  bg-indigo-50/70  text-indigo-900",
  violet:  "border-violet-200  bg-violet-50/70  text-violet-900",
  teal:    "border-teal-200    bg-teal-50/70    text-teal-900",
  blue:    "border-blue-200    bg-blue-50/70    text-blue-900",
  amber:   "border-amber-200   bg-amber-50/70   text-amber-900",
  rose:    "border-rose-200    bg-rose-50/70    text-rose-900",
  slate:   "border-slate-200   bg-slate-50      text-slate-900",
  emerald: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
};

export const toneAccent: Record<string, string> = {
  indigo: "text-indigo-600", violet: "text-violet-600", teal: "text-teal-600",
  blue: "text-blue-600", amber: "text-amber-600", rose: "text-rose-600",
  slate: "text-slate-600", emerald: "text-emerald-600",
};

export const toneRing: Record<string, string> = {
  indigo: "ring-indigo-400", violet: "ring-violet-400", teal: "ring-teal-400",
  blue: "ring-blue-400", amber: "ring-amber-400", rose: "ring-rose-400",
  slate: "ring-slate-400", emerald: "ring-emerald-400",
};

/* -------------------------------------------------------------------------- */
/*  SectionCard                                                                */
/* -------------------------------------------------------------------------- */

export function SectionCard({
  title, subtitle, right, children, className,
}: { title?: string; subtitle?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl bg-white border border-slate-200 shadow-sm", className)}>
      {(title || right) && (
        <header className="flex items-start justify-between gap-3 px-5 py-3.5 border-b border-slate-100">
          <div>
            {title && <h3 className="text-[15px] font-semibold text-slate-900 leading-tight">{title}</h3>}
            {subtitle && <p className="text-[12.5px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  KPIStatCard                                                                */
/* -------------------------------------------------------------------------- */

export function KPIStatCard({
  label, value, sub, tone = "indigo", icon: Icon,
}: { label: string; value: string; sub?: string; tone?: string; icon?: LucideIcon }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 shadow-sm bg-white">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
        {Icon && <Icon className={cn("h-4 w-4", toneAccent[tone])} />}
      </div>
      <div className="text-[26px] font-bold text-slate-900 leading-tight mt-1">{value}</div>
      {sub && <div className="text-[12px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  StatusPill                                                                 */
/* -------------------------------------------------------------------------- */

export function StatusPill({ tone = "slate", children }: { tone?: string; children: ReactNode }) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber:   "bg-amber-50   text-amber-800   border-amber-200",
    rose:    "bg-rose-50    text-rose-700    border-rose-200",
    indigo:  "bg-indigo-50  text-indigo-700  border-indigo-200",
    violet:  "bg-violet-50  text-violet-700  border-violet-200",
    teal:    "bg-teal-50    text-teal-700    border-teal-200",
    blue:    "bg-blue-50    text-blue-700    border-blue-200",
    slate:   "bg-slate-100  text-slate-700   border-slate-200",
  };
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide",
      map[tone],
    )}>
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  ArchitectureLayerCard — large, readable, workshop-grade                    */
/* -------------------------------------------------------------------------- */

export function ArchitectureLayerCard({
  index, title, purpose, icon: Icon, tone = "slate", capabilities, active, onClick,
}: {
  index?: number; title: string; purpose?: string;
  icon: LucideIcon; tone?: string; capabilities: string[];
  active?: boolean; onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border-2 p-4 transition-all bg-white hover:shadow-md hover:-translate-y-[1px]",
        active ? cn("ring-2 ring-offset-2", toneRing[tone]) : "border-slate-200",
        !active && toneMap[tone].replace("border-", "hover:border-"),
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "h-11 w-11 rounded-lg grid place-items-center shrink-0",
          toneMap[tone],
        )}>
          <Icon className={cn("h-5 w-5", toneAccent[tone])} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            {index !== undefined && (
              <span className={cn("text-[10.5px] font-semibold uppercase tracking-wider", toneAccent[tone])}>
                Layer {index}
              </span>
            )}
          </div>
          <div className="text-[15px] font-semibold text-slate-900 leading-tight">{title}</div>
          {purpose && <p className="text-[12.5px] text-slate-600 mt-1 leading-snug line-clamp-2">{purpose}</p>}
          <div className="flex flex-wrap gap-1 mt-2">
            {capabilities.slice(0, 6).map((c) => (
              <span key={c} className="rounded-md bg-slate-100 border border-slate-200 text-[11px] text-slate-700 px-1.5 py-0.5">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  CapabilityCard — flanking column chips                                     */
/* -------------------------------------------------------------------------- */

export function CapabilityCard({
  label, icon: Icon, onClick, active, tone = "slate",
}: {
  label: string; icon?: LucideIcon; onClick?: () => void; active?: boolean; tone?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 rounded-md border bg-white px-2.5 py-2 text-[12.5px] text-slate-700 transition text-left",
        active
          ? cn("border-slate-900 bg-slate-50 text-slate-900 shadow-sm")
          : "border-slate-200 hover:border-slate-400 hover:bg-slate-50",
      )}
    >
      {Icon && <Icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-slate-900" : toneAccent[tone])} />}
      <span className="truncate">{label}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  DetailDrawer — sticky right-side context panel                             */
/* -------------------------------------------------------------------------- */

export function DetailDrawer({
  title, subtitle, tone = "indigo", onClose, children,
}: {
  title: string; subtitle?: string; tone?: string;
  onClose?: () => void; children: ReactNode;
}) {
  return (
    <aside className="rounded-xl bg-white border border-slate-200 shadow-sm sticky top-4 overflow-hidden">
      <header className={cn(
        "px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-3",
        toneMap[tone].replace(/text-\w+-900/, "").replace("bg-", "bg-"),
      )}>
        <div className="min-w-0">
          <div className={cn("text-[10px] font-semibold uppercase tracking-wider", toneAccent[tone])}>Details</div>
          <div className="text-[14px] font-semibold text-slate-900 mt-0.5 leading-tight">{title}</div>
          {subtitle && <div className="text-[11.5px] text-slate-600 mt-0.5">{subtitle}</div>}
        </div>
        {onClose && (
          <button
            type="button" onClick={onClose} aria-label="Close details"
            className="h-6 w-6 rounded-md grid place-items-center text-slate-500 hover:bg-white/60 hover:text-slate-900"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </header>
      <div className="p-4 space-y-4 max-h-[calc(100vh-220px)] overflow-auto">{children}</div>
    </aside>
  );
}

export function DetailBlock({
  label, items, tone = "slate",
}: { label: string; items: string[]; tone?: string }) {
  return (
    <div>
      <div className={cn("text-[10.5px] font-semibold uppercase tracking-wider mb-1.5", toneAccent[tone])}>
        {label}
      </div>
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i} className="text-[12.5px] text-slate-700 flex gap-2 leading-snug">
            <span className={cn("mt-1.5 h-1 w-1 rounded-full shrink-0", toneAccent[tone].replace("text-", "bg-"))} />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Legend — reusable inline legend for every view                             */
/* -------------------------------------------------------------------------- */

export type LegendItem = { label: string; tone: string; icon?: LucideIcon; note?: string };

export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {items.map((l) => {
        const Icon = l.icon;
        return (
          <div key={l.label} className="flex items-center gap-2">
            <span className={cn(
              "inline-flex items-center justify-center h-5 w-5 rounded-md border",
              toneMap[l.tone],
            )}>
              {Icon && <Icon className={cn("h-3 w-3", toneAccent[l.tone])} />}
            </span>
            <div className="text-[12px] text-slate-700 leading-tight">
              <div className="font-medium text-slate-900">{l.label}</div>
              {l.note && <div className="text-[11px] text-slate-500">{l.note}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
