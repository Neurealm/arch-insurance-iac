import { type ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PagedColumn<T> {
  key: string;
  header: string;
  /** Enables click-to-sort on this column. */
  sortable?: boolean;
  className?: string;
  render: (row: T) => ReactNode;
}

export interface PagedDataTableProps<T> {
  rows: readonly T[];
  columns: readonly PagedColumn<T>[];
  rowKey: (row: T) => string;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (key: string) => void;
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
  caption?: string;
}

/**
 * Reusable paginated table for read-only platform diagnostics screens.
 * Rendering only — all sorting/filtering decisions belong to the caller.
 */
export function PagedDataTable<T>({
  rows,
  columns,
  rowKey,
  page,
  pageSize,
  total,
  onPageChange,
  sortKey,
  sortDirection,
  onSortChange,
  onRowClick,
  emptyState,
  caption,
}: PagedDataTableProps<T>) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  if (total === 0 && emptyState) return <>{emptyState}</>;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          {caption && <caption className="sr-only">{caption}</caption>}
          <TableHeader>
            <TableRow>
              {columns.map((c) => {
                const sorted = sortKey === c.key;
                const ariaSort = c.sortable
                  ? sorted
                    ? sortDirection === "desc"
                      ? "descending"
                      : "ascending"
                    : "none"
                  : undefined;
                return (
                  <TableHead key={c.key} className={c.className} aria-sort={ariaSort}>
                    {c.sortable && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => onSortChange(c.key)}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                        aria-label={`Sort by ${c.header}`}
                      >
                        {c.header}
                        <ChevronsUpDown className="h-3 w-3" aria-hidden />
                        {sorted && <span className="text-[10px] uppercase">{sortDirection}</span>}
                      </button>
                    ) : (
                      c.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && "cursor-pointer")}
                data-testid="paged-row"
              >
                {columns.map((c) => (
                  <TableCell key={c.key} className={c.className}>
                    {c.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div data-testid="paged-range" role="status" aria-live="polite" aria-atomic="true">
          Showing {from}–{to} of {total}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            aria-disabled={page === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            Page {page + 1} of {pageCount}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(Math.min(pageCount - 1, page + 1))}
            disabled={page >= pageCount - 1}
            aria-disabled={page >= pageCount - 1}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

