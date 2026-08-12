import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Lightweight right-hand drawer used for every drill-down on Screen 04. */
export function ReviewDrawer({
  open, title, subtitle, onClose, children,
}: { open: boolean; title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close drawer" onClick={onClose} className="flex-1 bg-slate-900/25" />
      <aside className="flex h-full w-full max-w-[560px] flex-col border-l border-[#E2E8F0] bg-white shadow-xl">
        <header className="flex items-start gap-3 border-b border-[#E2E8F0] px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-[13.5px] font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[11.5px] text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="ml-auto grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-3 text-[12px] text-slate-700">{children}</div>
      </aside>
    </div>
  );
}

/** Centered modal shell. */
export function ReviewModal({
  open, title, onClose, children, footer,
}: { open: boolean; title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button aria-label="Close modal" onClick={onClose} className="absolute inset-0 bg-slate-900/30" />
      <div role="dialog" aria-modal className="relative w-full max-w-[560px] rounded-lg border border-[#E2E8F0] bg-white shadow-2xl">
        <header className="flex items-center gap-3 border-b border-[#E2E8F0] px-4 py-3">
          <h2 className="text-[13.5px] font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="ml-auto grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="max-h-[65vh] overflow-y-auto px-4 py-3 text-[12px] text-slate-700">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-4 py-3">{footer}</footer>}
      </div>
    </div>
  );
}

export function Panel({
  title, actions, className, children, id,
}: { title: string; actions?: React.ReactNode; className?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className={cn("rounded-lg border border-[#E2E8F0] bg-white", className)}>
      <header className="flex items-center gap-2 border-b border-[#E2E8F0] px-3 py-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">{title}</h3>
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

export type Tone = "ok" | "warn" | "bad" | "info" | "neutral";

const TONE: Record<Tone, string> = {
  ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warn: "bg-amber-50 text-amber-700 ring-amber-200",
  bad: "bg-rose-50 text-rose-700 ring-rose-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function Pill({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium ring-1 ring-inset", TONE[tone], className)}>
      {children}
    </span>
  );
}

export function KeyValue({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 py-1 last:border-0">
      <span className="text-[11.5px] text-slate-500">{label}</span>
      <span className={cn("text-[11.5px] font-medium text-slate-800", mono && "font-mono text-[11px]")}>{value}</span>
    </div>
  );
}

/** Restrained radial readiness indicator. */
export function RadialScore({ value, label }: { value: number; label: string }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 110 110" className="h-[124px] w-[124px]">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10" />
        <circle
          cx="55" cy="55" r={r} fill="none" stroke="#059669" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`} transform="rotate(-90 55 55)"
        />
        <text x="55" y="53" textAnchor="middle" className="fill-slate-900" style={{ fontSize: 20, fontWeight: 700 }}>{value}%</text>
        <text x="55" y="68" textAnchor="middle" className="fill-slate-500" style={{ fontSize: 8 }}>{label}</text>
      </svg>
    </div>
  );
}
