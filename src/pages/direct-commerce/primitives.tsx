import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "./data";

/* --------------------------------- tones ---------------------------------- */

export const toneChip: Record<Tone, string> = {
  healthy: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  blocked: "bg-rose-50 text-rose-700 ring-rose-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
};

export const toneDot: Record<Tone, string> = {
  healthy: "bg-emerald-500",
  pending: "bg-amber-500",
  failed: "bg-rose-500",
  blocked: "bg-rose-500",
  info: "bg-sky-500",
  neutral: "bg-slate-300",
};

/** Maps any of the module's status strings onto a tone. */
export function toneFor(status: string): Tone {
  const s = status.toLowerCase();
  if (/(confirmed|active|deployed|invoiced|booked|healthy|ready to deploy|complete)/.test(s)) return "healthy";
  if (/(pending|retrying|submitted|validating|expiring|draft|needs validation|scheduled)/.test(s)) return "pending";
  if (/(failed|error|blocked|mismatch|cancelled|suspended|critical)/.test(s)) return "failed";
  if (/(not started|not submitted|not created|—|retired)/.test(s)) return "neutral";
  return "info";
}

export function StatusChip({ status, tone }: { status: string; tone?: Tone }) {
  const tn = tone ?? toneFor(status);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset", toneChip[tn])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[tn])} />
      {status}
    </span>
  );
}

/* --------------------------------- shell ---------------------------------- */

export function PageHeader({
  eyebrow, title, description, actions,
}: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
      <div className="min-w-0">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{eyebrow}</div>
        <h1 className="mt-0.5 text-[19px] font-semibold leading-tight text-slate-900">{title}</h1>
        <p className="mt-1 max-w-3xl text-[12.5px] leading-relaxed text-slate-600">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Section({
  title, hint, right, children, className,
}: { title: string; hint?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-900">{title}</h2>
          {hint && <p className="text-[11.5px] text-slate-500">{hint}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function KpiCard({
  label, value, sub, tone = "neutral", onClick, active,
}: { label: string; value: string; sub?: string; tone?: Tone; onClick?: () => void; active?: boolean }) {
  const Cmp: any = onClick ? "button" : "div";
  return (
    <Cmp
      onClick={onClick}
      className={cn(
        "group flex w-full flex-col rounded-lg border bg-white px-3.5 py-3 text-left transition-all",
        active ? "border-indigo-400 ring-2 ring-indigo-100" : "border-slate-200",
        onClick && "hover:border-indigo-300 hover:shadow-sm",
      )}
    >
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
        <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[tone])} />
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1.5 text-[21px] font-semibold leading-none text-slate-900">{value}</div>
      {sub && <div className="mt-1.5 text-[11.5px] leading-snug text-slate-500">{sub}</div>}
    </Cmp>
  );
}

/* --------------------------------- drawer --------------------------------- */

export function Drawer({
  open, onClose, title, subtitle, badge, children, footer,
}: {
  open: boolean; onClose: () => void; title: string; subtitle?: string;
  badge?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/25" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-[560px] flex-col border-l border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[11.5px] text-slate-500">{subtitle}</p>}
            {badge && <div className="mt-2">{badge}</div>}
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">{footer}</div>}
      </aside>
    </div>
  );
}

export function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</h3>
      {children}
    </div>
  );
}

export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 break-words text-[12.5px] font-medium text-slate-900">{value}</div>
    </div>
  );
}

export function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

/** Prominent customer-impact statement used in every issue/exception drawer. */
export function ImpactCallout({
  customerImpact, commercialImpact, tone = "failed",
}: { customerImpact: string; commercialImpact?: string; tone?: Tone }) {
  return (
    <div className={cn("rounded-lg border p-3", tone === "failed" ? "border-rose-200 bg-rose-50/70" : tone === "pending" ? "border-amber-200 bg-amber-50/70" : "border-emerald-200 bg-emerald-50/70")}>
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-600">Customer impact</div>
      <p className="mt-1 text-[12.5px] leading-relaxed text-slate-800">{customerImpact}</p>
      {commercialImpact && (
        <>
          <div className="mt-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-600">Commercial impact / revenue at risk</div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-slate-800">{commercialImpact}</p>
        </>
      )}
    </div>
  );
}

/* --------------------------------- table ---------------------------------- */

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  value?: (row: T) => string | number;
  render?: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id?: string }>({
  rows, columns, onRowClick, selectedId, searchPlaceholder = "Search…", filters, empty = "No records match the current filters.",
}: {
  rows: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  selectedId?: string | null;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  empty?: string;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = rows;
    if (needle) {
      out = out.filter((r) =>
        columns.some((c) => String(c.value?.(r) ?? (r as any)[c.key] ?? "").toLowerCase().includes(needle)),
      );
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      out = [...out].sort((a, b) => {
        const av = col?.value?.(a) ?? (a as any)[sort.key] ?? "";
        const bv = col?.value?.(b) ?? (b as any)[sort.key] ?? "";
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.dir;
        return String(av).localeCompare(String(bv)) * sort.dir;
      });
    }
    return out;
  }, [rows, columns, q, sort]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        {filters}
        <span className="ml-auto text-[11.5px] text-slate-500">{filtered.length} of {rows.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-[12px]">
          <thead>
            <tr className="bg-slate-50 text-left text-[10.5px] uppercase tracking-[0.08em] text-slate-500">
              {columns.map((c) => (
                <th key={c.key} className={cn("whitespace-nowrap border-b border-slate-200 px-3 py-2 font-semibold", c.width)}>
                  {c.sortable === false ? c.header : (
                    <button
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                      onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === 1 ? -1 : 1 } : { key: c.key, dir: 1 }))}
                    >
                      {c.header}
                      {sort?.key === c.key ? (sort.dir === 1 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const id = (r as any).id ?? String(i);
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(r)}
                  className={cn(
                    "border-b border-slate-100 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-indigo-50/50",
                    selectedId === id && "bg-indigo-50",
                  )}
                >
                  {columns.map((c) => (
                    <td key={c.key} className="whitespace-nowrap px-3 py-2 align-middle text-slate-700">
                      {c.render ? c.render(r) : String((r as any)[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={columns.length} className="px-3 py-10 text-center text-[12.5px] text-slate-500">{empty}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------- controls -------------------------------- */

export function PillFilter<T extends string>({
  options, value, onChange,
}: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11.5px] transition-colors",
            value === o ? "border-indigo-300 bg-indigo-50 font-medium text-indigo-800" : "border-slate-200 text-slate-600 hover:bg-slate-50",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function ActionButton({
  label, onClick, tone = "default",
}: { label: string; onClick: () => void; tone?: "default" | "primary" | "danger" }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
        tone === "primary" && "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700",
        tone === "danger" && "border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
        tone === "default" && "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      )}
    >
      {label}
    </button>
  );
}

/** Small monospace trace / id token. */
export function Trace({ id }: { id: string }) {
  return <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10.5px] text-slate-600">{id}</span>;
}
