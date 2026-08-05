/**
 * AIM-004 — analytics-local CSV and chart image export helpers.
 *
 * Deliberately local to the page. This is not a production reporting service.
 */

import type { AnalyticsExportRecord } from "./analyticsTypes";

function escapeCell(value: string | number): string {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(record: AnalyticsExportRecord): string {
  return [record.headers, ...record.rows].map((row) => row.map(escapeCell).join(",")).join("\n");
}

export interface ExportOutcome { ok: boolean; message: string }

/** Triggers a client-side CSV download. Never throws. */
export function downloadCsv(record: AnalyticsExportRecord): ExportOutcome {
  try {
    if (!record.headers.length || !record.rows.length) {
      return { ok: false, message: `${record.filename} has no rows to export.` };
    }
    if (typeof document === "undefined" || typeof URL.createObjectURL !== "function") {
      return { ok: false, message: "Export is not available in this environment." };
    }
    const blob = new Blob([toCsv(record)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = record.filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    return { ok: true, message: `${record.filename} exported.` };
  } catch {
    return { ok: false, message: `${record.filename} could not be exported.` };
  }
}
