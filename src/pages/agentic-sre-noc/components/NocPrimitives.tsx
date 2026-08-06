/**
 * Shared Agentic SRE NOC page primitives.
 *
 * Extracted from the Global Optical Operations Center so every page in the
 * module renders the same panels, selects, fields and status treatments.
 */

import { cn } from "@/lib/utils";
import { controlTransition, focusRing, surfaceTransition } from "./motion";
import { statusColors, type LinkStatus } from "../data/goocFixtures";


export function Panel({
  title, subtitle, action, children, className,
}: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-[11.5px] text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Select({
  label, value, options, onChange,
}: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
      <span className="sr-only sm:not-sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11.5px] text-slate-800 shadow-sm hover:border-slate-300",
          controlTransition,
          focusRing,
        )}
      >

        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-[12px] font-medium text-slate-900">{value}</div>
    </div>
  );
}

export function StatusDot({ status }: { status: LinkStatus }) {
  return <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[status] }} aria-hidden />;
}

export function ToolbarButton({
  onClick, children, active, title, disabled,
}: {
  onClick: () => void; children: React.ReactNode; active?: boolean; title?: string; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active === undefined ? undefined : active}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11.5px] shadow-sm",
        controlTransition,
        focusRing,
        active ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        disabled && "cursor-not-allowed opacity-50 hover:bg-white",
      )}
    >
      {children}
    </button>
  );
}

