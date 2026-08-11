// Shared enterprise UI primitives for the Context / Evidence Layer
// administration plane: panels, rich tooltips, help popovers, the reusable
// right-side inspection drawer, KPI cards and state placeholders.

import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { HelpCircle, X, Copy, Pencil, History, Settings2, MoreHorizontal, AlertTriangle, CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { HELP, type Health } from "./data";

/* -------------------------------- Panel ---------------------------------- */

export function Panel({
  title, subtitle, actions, children, className, help, bodyClassName,
}: {
  title?: string; subtitle?: string; actions?: ReactNode; children: ReactNode;
  className?: string; help?: string; bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start gap-x-3 gap-y-2 border-b border-slate-200 px-4 py-2.5">
          <div className="min-w-[220px] flex-1">
            <h2 className="flex items-center gap-1.5 text-[15px] font-semibold leading-tight text-slate-900">
              {title}
              {help && <HelpDot topic={help} />}
            </h2>
            {subtitle && <p className="mt-0.5 text-[12px] leading-snug text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ------------------------------ Rich tooltip ------------------------------ */

export interface TipContent {
  term: string;
  definition: string;
  rows?: [string, string][];
  why?: string;
}

export function RichTip({
  tip, children, className, as = "span",
}: { tip: TipContent; children: ReactNode; className?: string; as?: "span" | "div" | "li" | "tr" }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const timer = useRef<number>();
  const ref = useRef<HTMLElement>(null);

  const show = () => {
    timer.current = window.setTimeout(() => {
      const r = ref.current?.getBoundingClientRect();
      if (r) setPos({ x: Math.min(r.left, window.innerWidth - 360), y: r.bottom + 8 });
      setOpen(true);
    }, 300);
  };
  const hide = () => { window.clearTimeout(timer.current); setOpen(false); };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const Tag = as as any;
  return (
    <>
      <Tag
        ref={ref as any}
        className={className}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </Tag>
      {open && createPortal(
        <div
          role="tooltip"
          style={{ left: pos.x, top: pos.y }}
          className="pointer-events-none fixed z-[80] w-[340px] animate-fade-in rounded-md border border-slate-200 bg-white p-3 text-left shadow-lg"
        >
          <div className="text-[12px] font-semibold text-slate-900">{tip.term}</div>
          <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">{tip.definition}</p>
          {tip.rows && (
            <dl className="mt-2 space-y-0.5">
              {tip.rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 text-[11.5px]">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-medium text-slate-800 text-right">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {tip.why && (
            <p className="mt-2 border-t border-slate-100 pt-2 text-[11.5px] leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-800">Why it matters: </span>{tip.why}
            </p>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}

/* ------------------------------ Help popover ------------------------------ */

export function HelpDot({ topic }: { topic: string }) {
  const [open, setOpen] = useState(false);
  const h = HELP[topic];
  if (!h) return null;
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={`Explain ${topic}`}
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="grid h-4 w-4 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <span className="fixed inset-0 z-[70]" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div className="absolute left-5 top-0 z-[75] w-[340px] rounded-md border border-slate-200 bg-white p-3 text-left shadow-xl">
            <div className="flex items-start gap-2">
              <div className="flex-1 text-[12.5px] font-semibold text-slate-900">{topic}</div>
              <button aria-label="Close help" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {([["What it is", h.what], ["Why neugain.io needs it", h.why], ["How it is implemented", h.how], ["What it controls", h.controls]] as [string, string][]).map(([k, v]) => (
              <div key={k} className="mt-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">{k}</div>
                <p className="mt-0.5 text-[11.5px] font-normal leading-relaxed text-slate-700">{v}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </span>
  );
}

/* --------------------------------- Drawer --------------------------------- */

export interface DrawerTab { id: string; label: string; content: ReactNode }

export function InspectDrawer({
  open, onClose, objectType, name, status, statusTone = "ok", tabs, canEdit = true,
}: {
  open: boolean; onClose: () => void; objectType: string; name: string;
  status?: string; statusTone?: "ok" | "warn" | "bad"; tabs: DrawerTab[]; canEdit?: boolean;
}) {
  const [tab, setTab] = useState(tabs[0]?.id);
  useEffect(() => { if (open) setTab(tabs[0]?.id); }, [open, name]); // eslint-disable-line
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  const active = tabs.find((t) => t.id === tab) ?? tabs[0];

  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-slate-900/20" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${objectType}: ${name}`}
        className="absolute right-0 top-0 flex h-full w-full max-w-[500px] flex-col border-l border-slate-200 bg-white shadow-2xl animate-slide-in-right"
        style={{ animationDuration: "200ms" }}
      >
        <header className="border-b border-slate-200 px-4 py-3">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{objectType}</div>
              <div className="truncate text-[16px] font-semibold text-slate-900">{name}</div>
              {status && <div className="mt-1"><StatePill tone={statusTone} label={status} /></div>}
            </div>
            <button onClick={onClose} aria-label="Close drawer" className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <DrawerAction icon={Pencil} label="Edit" disabled={!canEdit} />
            <DrawerAction icon={Settings2} label="View Configuration" />
            <DrawerAction icon={History} label="Audit History" />
            <DrawerAction icon={Copy} label="Copy ID" />
            <DrawerAction icon={MoreHorizontal} label="More" />
          </div>
        </header>

        {tabs.length > 1 && (
          <nav className="flex gap-0.5 overflow-x-auto border-b border-slate-200 px-2" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={t.id === active.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "whitespace-nowrap border-b-2 px-2.5 py-2 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  t.id === active.id ? "border-blue-600 font-medium text-blue-700" : "border-transparent text-slate-600 hover:text-slate-900",
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-3">{active?.content}</div>
      </aside>
    </div>,
    document.body,
  );
}

function DrawerAction({ icon: Icon, label, disabled }: { icon: any; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? "You do not have permission to modify this configuration." : undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-1 text-[11px] transition-colors",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      <Icon className="h-3 w-3" /> {label}
    </button>
  );
}

/* ------------------------------- Drawer bits ------------------------------ */

export function KV({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-slate-100 rounded-md border border-slate-200">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-start justify-between gap-4 px-3 py-1.5">
          <dt className="text-[11.5px] text-slate-500">{k}</dt>
          <dd className="text-right text-[11.5px] font-medium text-slate-800">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SubHead({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 first:mt-0">{children}</div>;
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((i) => (
        <li key={i} className="flex gap-2 text-[11.5px] leading-relaxed text-slate-700">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------- Status ---------------------------------- */

export function StatePill({ tone, label }: { tone: "ok" | "warn" | "bad" | "muted"; label: string }) {
  const map = {
    ok: { c: "border-emerald-200 bg-emerald-50 text-emerald-800", I: CheckCircle2 },
    warn: { c: "border-amber-200 bg-amber-50 text-amber-900", I: AlertTriangle },
    bad: { c: "border-red-200 bg-red-50 text-red-800", I: XCircle },
    muted: { c: "border-slate-200 bg-slate-50 text-slate-600", I: MinusCircle },
  } as const;
  const { c, I } = map[tone];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium", c)}>
      <I className="h-3 w-3" aria-hidden /> {label}
    </span>
  );
}

export function healthTone(h: Health): "ok" | "warn" | "bad" | "muted" {
  return h === "Healthy" ? "ok" : h === "Degraded" ? "warn" : h === "Error" ? "bad" : "muted";
}

export function scoreTone(v: number): "ok" | "warn" | "bad" {
  return v >= 90 ? "ok" : v >= 80 ? "warn" : "bad";
}

export function ScoreText({ value, suffix = "" }: { value: number; suffix?: string }) {
  const t = scoreTone(value);
  const c = t === "ok" ? "text-emerald-700" : t === "warn" ? "text-amber-700" : "text-red-700";
  return <span className={cn("font-medium tabular-nums", c)}>{value}{suffix}</span>;
}

/* ------------------------------- KPI cards -------------------------------- */

export function KpiCard({
  label, value, secondary, change, tip, onClick, selected, help,
}: {
  label: string; value: string; secondary?: string; change?: string;
  tip: TipContent; onClick: () => void; selected?: boolean; help?: string;
}) {
  return (
    <RichTip tip={tip} as="div" className="min-w-0">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2.5 text-left transition-all hover:-translate-y-px hover:border-slate-300 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          selected ? "border-blue-400 bg-blue-50/40" : "border-slate-200",
        )}
      >
        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
          <span className="truncate">{label}</span>
          {help && <HelpDot topic={help} />}
        </div>
        <div className="mt-1 text-[22px] font-semibold leading-none tabular-nums text-slate-900">{value}</div>
        {secondary && <div className="mt-1 truncate text-[11.5px] text-slate-500">{secondary}</div>}
        {change && <div className="mt-0.5 text-[11px] font-medium text-emerald-700">{change}</div>}
        <div className="mt-1.5 text-[11px] font-medium text-blue-700">Inspect →</div>
      </button>
    </RichTip>
  );
}

/* ---------------------------- Loading / empty ----------------------------- */

export function SkeletonPanel({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-6 animate-pulse rounded bg-slate-100" />
      ))}
    </div>
  );
}

export function EmptyState({ title, body, cta, onCta }: { title: string; body: string; cta?: string; onCta?: () => void }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center">
      <div className="text-[13px] font-semibold text-slate-800">{title}</div>
      <p className="mx-auto mt-1 max-w-md text-[11.5px] leading-relaxed text-slate-600">{body}</p>
      {cta && (
        <button onClick={onCta} className="mt-3 rounded border border-blue-600 bg-blue-600 px-2.5 py-1 text-[11.5px] font-medium text-white hover:bg-blue-700">
          {cta}
        </button>
      )}
    </div>
  );
}

/* -------------------------------- Buttons --------------------------------- */

export function Btn({
  children, onClick, variant = "default", disabled, className, title, type = "button",
}: {
  children: ReactNode; onClick?: () => void; variant?: "default" | "primary" | "ghost";
  disabled?: boolean; className?: string; title?: string; type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "You do not have permission to modify this configuration." : title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "default" && "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
        className,
      )}
    >
      {children}
    </button>
  );
}
