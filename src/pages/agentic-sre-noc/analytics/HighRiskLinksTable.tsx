/**
 * AIM-004 — Top High-Risk Links.
 *
 * Searchable, sortable, groupable table with column selection, pinning, row
 * selection and analytics-local CSV export.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { AnalyticsDataTable, type AnalyticsPanelState } from "./AnalyticsPrimitives";
import { filterHighRiskLinks } from "./analyticsCalculations";
import { downloadCsv } from "./analyticsExport";
import { HIGH_RISK_COLUMNS, highRiskLinkRecords, type HighRiskColumnKey } from "./analyticsFixtures";
import type { HighRiskLinkRecord } from "./analyticsTypes";
import type { AnalyticsState } from "./useAnalyticsState";

export interface HighRiskLinksTableProps {
  state: AnalyticsState;
  selectedLinkId: string;
  panelState?: AnalyticsPanelState;
  onSelectLink: (linkId: string) => void;
  onNotify: (message: string) => void;
}

type GroupKey = AnalyticsState["groupBy"];

const GROUP_OPTIONS: { key: GroupKey; label: string }[] = [
  { key: "none", label: "No grouping" },
  { key: "riskClass", label: "Group by risk class" },
  { key: "region", label: "Group by region" },
  { key: "primaryDriver", label: "Group by driver" },
  { key: "fallbackReadiness", label: "Group by fallback readiness" },
];

function cellValue(record: HighRiskLinkRecord, key: HighRiskColumnKey): string | number {
  const value = record[key as keyof HighRiskLinkRecord];
  if (key === "capacityImpactGbps") return `${value} Gbps`;
  if (key === "confidencePct") return `${value}%`;
  if (key === "riskScore") return Number(value).toFixed(2);
  return value as string | number;
}

export function HighRiskLinksTable({
  state, selectedLinkId, panelState = "ready", onSelectLink, onNotify,
}: HighRiskLinksTableProps) {
  const [sortKey, setSortKey] = React.useState<HighRiskColumnKey>("riskScore");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [accessibleMode, setAccessibleMode] = React.useState(false);

  const filtered = React.useMemo(
    () =>
      filterHighRiskLinks(highRiskLinkRecords, {
        region: state.region,
        product: state.product,
        riskClass: state.riskClass,
        search: state.search,
      }),
    [state.region, state.product, state.riskClass, state.search],
  );

  const sorted = React.useMemo(() => {
    const rows = [...filtered].sort((a, b) => {
      const av = a[sortKey as keyof HighRiskLinkRecord];
      const bv = b[sortKey as keyof HighRiskLinkRecord];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    const pinned = rows.filter((r) => state.pinnedLinkIds.includes(r.linkId));
    const rest = rows.filter((r) => !state.pinnedLinkIds.includes(r.linkId));
    return [...pinned, ...rest];
  }, [filtered, sortKey, sortDir, state.pinnedLinkIds]);

  const grouped = React.useMemo(() => {
    if (state.groupBy === "none") return [{ label: "", rows: sorted }];
    const map = new Map<string, HighRiskLinkRecord[]>();
    for (const row of sorted) {
      const key = String(row[state.groupBy as keyof HighRiskLinkRecord]);
      map.set(key, [...(map.get(key) ?? []), row]);
    }
    return [...map.entries()].map(([label, rows]) => ({ label, rows }));
  }, [sorted, state.groupBy]);

  const columns = HIGH_RISK_COLUMNS.filter((c) => state.visibleColumns.includes(c.key));

  const handleExport = () => {
    const outcome = downloadCsv({
      filename: "high-risk-links.csv",
      headers: HIGH_RISK_COLUMNS.map((c) => c.label),
      rows: sorted.map((r) => HIGH_RISK_COLUMNS.map((c) => cellValue(r, c.key))),
    });
    onNotify(outcome.message);
  };

  const toggleSort = (key: HighRiskColumnKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  if (panelState === "loading") {
    return (
      <div className="space-y-1" role="status" aria-live="polite" data-testid="high-risk-links-panel">
        <span className="sr-only">Loading Top High-Risk Links</span>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-5 animate-pulse rounded bg-slate-100" />)}
      </div>
    );
  }

  if (panelState === "error") {
    return (
      <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50/70 p-3 text-center text-[11.5px] text-rose-800" data-testid="high-risk-links-panel">
        Top High-Risk Links could not be calculated.
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5" data-testid="high-risk-links-panel">
      <div className="flex flex-wrap items-center gap-1.5">
        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          <span className="sr-only">Search high-risk links</span>
          <input
            type="search"
            aria-label="Search high-risk links"
            value={state.search}
            onChange={(e) => state.setSearch(e.target.value)}
            placeholder="Search link, route or driver"
            className="w-48 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </label>

        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          <span className="sr-only">Group rows</span>
          <select
            aria-label="Group rows"
            value={state.groupBy}
            onChange={(e) => state.setGroupBy(e.target.value as GroupKey)}
            className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {GROUP_OPTIONS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
          </select>
        </label>

        <button
          type="button"
          aria-pressed={accessibleMode}
          onClick={() => setAccessibleMode((v) => !v)}
          className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {accessibleMode ? "Interactive table" : "Accessible table mode"}
        </button>

        <button
          type="button"
          onClick={handleExport}
          className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Export High-Risk Links CSV
        </button>

        <span className="ml-auto text-[10.5px] text-slate-500">{sorted.length} links</span>
      </div>

      <details className="rounded border border-slate-200 bg-slate-50 px-1.5 py-1">
        <summary className="cursor-pointer text-[10.5px] font-medium text-slate-700">Columns</summary>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {HIGH_RISK_COLUMNS.map((c) => (
            <li key={c.key}>
              <label className="flex items-center gap-1 text-[10px] text-slate-700">
                <input
                  type="checkbox"
                  checked={state.visibleColumns.includes(c.key)}
                  onChange={() => state.toggleColumn(c.key)}
                  className="h-3 w-3 rounded border-slate-300"
                />
                {c.label}
              </label>
            </li>
          ))}
        </ul>
      </details>

      {sorted.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-3 text-center text-[11px] text-slate-600">
          <p className="font-medium text-slate-700">No high-risk links match the current filters</p>
          <p className="text-[10.5px] text-slate-500">
            Active filters: {state.region}, {state.product}, risk class {state.riskClass}
            {state.search ? `, search "${state.search}"` : ""}
          </p>
          <button
            type="button"
            onClick={state.clearFilters}
            className="mt-1 rounded border border-slate-300 bg-white px-2 py-0.5 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Clear filters
          </button>
        </div>
      )}

      {sorted.length > 0 && accessibleMode && (
        <AnalyticsDataTable
          caption="Top high-risk links, accessible data table"
          headers={HIGH_RISK_COLUMNS.map((c) => c.label)}
          rows={sorted.map((r) => HIGH_RISK_COLUMNS.map((c) => cellValue(r, c.key)))}
          className="max-h-72"
        />
      )}

      {sorted.length > 0 && !accessibleMode && (
        <div className="max-h-72 overflow-auto rounded border border-slate-200">
          <table className="w-full text-left text-[10.5px]">
            <caption className="sr-only">
              Top high-risk links ranked by modelled risk score. Selecting a row updates the map, pipeline and analytics.
            </caption>
            <thead className="sticky top-0 bg-slate-50">
              <tr className="text-slate-500">
                <th scope="col" className="px-1.5 py-1 font-medium">Pin</th>
                {columns.map((c) => (
                  <th key={c.key} scope="col" className="whitespace-nowrap px-1.5 py-1 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      aria-label={`Sort by ${c.label}`}
                      className="inline-flex items-center gap-0.5 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {c.label}
                      {sortKey === c.key && <span aria-hidden>{sortDir === "asc" ? "▲" : "▼"}</span>}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            {grouped.map((group) => (
              <tbody key={group.label || "all"}>
                {group.label && (
                  <tr className="bg-slate-100/70">
                    <th scope="colgroup" colSpan={columns.length + 1} className="px-1.5 py-0.5 text-left text-[10px] font-semibold text-slate-700">
                      {group.label}
                    </th>
                  </tr>
                )}
                {group.rows.map((r) => {
                  const selected = r.linkId === selectedLinkId;
                  return (
                    <tr
                      key={r.linkId}
                      aria-selected={selected}
                      className={cn("border-t border-slate-100", selected && "bg-blue-50/70")}
                    >
                      <td className="px-1.5 py-0.5">
                        <button
                          type="button"
                          aria-pressed={state.pinnedLinkIds.includes(r.linkId)}
                          aria-label={`Pin ${r.linkId}`}
                          onClick={() => state.togglePinned(r.linkId)}
                          className="rounded px-1 text-slate-500 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          {state.pinnedLinkIds.includes(r.linkId) ? "★" : "☆"}
                        </button>
                      </td>
                      {columns.map((c, i) =>
                        i === 0 || c.key !== "linkId" ? (
                          <td key={c.key} className="whitespace-nowrap px-1.5 py-0.5 text-slate-700">
                            {c.key === "linkId" ? (
                              <button
                                type="button"
                                onClick={() => { onSelectLink(r.linkId); onNotify(`${r.linkId} selected from Top High-Risk Links.`); }}
                                aria-current={selected ? "true" : undefined}
                                className="font-medium text-blue-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              >
                                {r.linkId}
                              </button>
                            ) : c.key === "riskClass" ? (
                              <span
                                className={cn(
                                  "font-medium",
                                  r.riskClass === "High" && "text-rose-700",
                                  r.riskClass === "Moderate" && "text-amber-700",
                                  r.riskClass === "Low" && "text-emerald-700",
                                )}
                              >
                                {r.riskClass}
                              </span>
                            ) : (
                              cellValue(r, c.key)
                            )}
                          </td>
                        ) : (
                          <td key={c.key} className="whitespace-nowrap px-1.5 py-0.5 text-slate-700">
                            <button
                              type="button"
                              onClick={() => { onSelectLink(r.linkId); onNotify(`${r.linkId} selected from Top High-Risk Links.`); }}
                              className="font-medium text-blue-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                              {r.linkId}
                            </button>
                          </td>
                        ),
                      )}
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </div>
      )}
    </div>
  );
}
