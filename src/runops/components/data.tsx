// Data controls: SearchInput, FilterBar, DataGrid, ColumnSelector, Pagination.
// DataGrid is a small headless grid — configuration-driven columns, in-memory
// sort, and controlled pagination. Suitable for the small demo datasets in
// this app. For larger surfaces, swap in TanStack Table via the same column
// contract.

import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Columns3, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ------------------------------ SearchInput --------------------------- */

export function SearchInput({
  value, onChange, placeholder = "Search", className, ariaLabel = "Search",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
      <Input
        aria-label={ariaLabel}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 pl-7 pr-7 text-xs"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

/* -------------------------------- FilterBar --------------------------- */

export interface FilterChip { key: string; label: string; onRemove?: () => void }

export function FilterBar({
  chips, right, className, children,
}: { chips?: FilterChip[]; right?: React.ReactNode; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1.5", className)}>
      {children}
      {chips && chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {chips.map((c) => (
            <span
              key={c.key}
              className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-700"
            >
              {c.label}
              {c.onRemove && (
                <button
                  type="button"
                  aria-label={`Remove filter ${c.label}`}
                  onClick={c.onRemove}
                  className="rounded p-0.5 hover:bg-slate-200"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}

/* -------------------------------- DataGrid ---------------------------- */

export interface DataGridColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  /** Sort accessor — string/number for lexicographic/numeric compare. */
  sort?: (row: T) => string | number;
  width?: string;
  align?: "left" | "right" | "center";
}

export interface DataGridProps<T> {
  rows: readonly T[];
  columns: DataGridColumn<T>[];
  getRowId: (row: T) => string;
  selection?: { selected: Set<string>; onChange: (next: Set<string>) => void };
  visibleColumns?: Set<string>;
  emptyLabel?: string;
  className?: string;
  caption?: string;
}

export function DataGrid<T>({
  rows, columns, getRowId, selection, visibleColumns, emptyLabel = "No rows", className, caption,
}: DataGridProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const cols = useMemo(
    () => (visibleColumns ? columns.filter((c) => visibleColumns.has(c.key)) : columns),
    [columns, visibleColumns],
  );
  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sort) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = col.sort!(a);
      const vb = col.sort!(b);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, columns, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const allSelected = selection && sorted.length > 0 && sorted.every((r) => selection.selected.has(getRowId(r)));

  return (
    <div className={cn("overflow-x-auto rounded border border-slate-200 bg-white", className)}>
      <table className="w-full min-w-full text-left text-xs">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            {selection && (
              <th scope="col" className="w-8 px-2 py-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => {
                    const next = new Set(selection.selected);
                    if (v) sorted.forEach((r) => next.add(getRowId(r)));
                    else sorted.forEach((r) => next.delete(getRowId(r)));
                    selection.onChange(next);
                  }}
                  aria-label={allSelected ? "Deselect all rows" : "Select all rows"}
                />
              </th>
            )}
            {cols.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn("px-3 py-2", c.align === "right" && "text-right", c.align === "center" && "text-center")}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.sort ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key)}
                    aria-sort={sortKey === c.key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                    className="inline-flex items-center gap-1 rounded px-0.5 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    {c.header}
                    {sortKey === c.key && (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </button>
                ) : c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={cols.length + (selection ? 1 : 0)} className="px-3 py-6 text-center text-slate-500">
                {emptyLabel}
              </td>
            </tr>
          ) : sorted.map((row) => {
            const id = getRowId(row);
            const isSelected = selection?.selected.has(id) ?? false;
            return (
              <tr key={id} className={cn("hover:bg-slate-50", isSelected && "bg-indigo-50/60")}>
                {selection && (
                  <td className="w-8 px-2 py-1.5">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(v) => {
                        const next = new Set(selection.selected);
                        if (v) next.add(id); else next.delete(id);
                        selection.onChange(next);
                      }}
                      aria-label={`Select row ${id}`}
                    />
                  </td>
                )}
                {cols.map((c) => (
                  <td
                    key={c.key}
                    className={cn("px-3 py-1.5", c.align === "right" && "text-right", c.align === "center" && "text-center")}
                  >
                    {c.accessor(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------- Column selector ------------------------- */

export function ColumnSelector({
  columns, visible, onChange, className,
}: {
  columns: { key: string; header: string }[];
  visible: Set<string>;
  onChange: (next: Set<string>) => void;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-8 gap-1 text-xs", className)}>
          <Columns3 className="h-3.5 w-3.5" aria-hidden />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel className="text-xs">Visible columns</DropdownMenuLabel>
        {columns.map((c) => (
          <DropdownMenuCheckboxItem
            key={c.key}
            checked={visible.has(c.key)}
            onCheckedChange={(checked) => {
              const next = new Set(visible);
              if (checked) next.add(c.key); else next.delete(c.key);
              onChange(next);
            }}
            className="text-xs"
          >
            {c.header}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* -------------------------------- Pagination -------------------------- */

export function Pagination({
  page, pageSize, total, onPageChange, className,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  return (
    <div className={cn("flex items-center justify-between gap-2 text-xs text-slate-600", className)}>
      <div>
        {start}–{end} of {total}
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <span className="px-1">Page {page} / {totalPages}</span>
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
