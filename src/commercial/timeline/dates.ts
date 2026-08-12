import { TIMELINE_END, TIMELINE_START } from "@/data/programTimelineMockData";

export const DAY_MS = 86_400_000;

export function toDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

export function formatDate(iso: string): string {
  return toDate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatShort(iso: string): string {
  return toDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function daysBetween(startIso: string, endIso: string): number {
  return Math.round((toDate(endIso).getTime() - toDate(startIso).getTime()) / DAY_MS);
}

const RANGE_START = toDate(TIMELINE_START).getTime();
const RANGE_END = toDate(TIMELINE_END).getTime();
export const TOTAL_DAYS = Math.round((RANGE_END - RANGE_START) / DAY_MS) + 1;

/** Percentage offset of a date across the fixed program window. */
export function offsetPct(iso: string): number {
  const pct = ((toDate(iso).getTime() - RANGE_START) / DAY_MS / TOTAL_DAYS) * 100;
  return Math.max(0, Math.min(100, pct));
}

export function widthPct(startIso: string, endIso: string): number {
  const span = (daysBetween(startIso, endIso) + 1) / TOTAL_DAYS * 100;
  return Math.max(1.2, Math.min(100 - offsetPct(startIso), span));
}

export type ZoomLevel = "weeks" | "months" | "quarters";

export interface HeaderCell {
  key: string;
  label: string;
  leftPct: number;
  widthPct: number;
}

/** Column headers for the chosen zoom level, positioned as percentages. */
export function headerCells(zoom: ZoomLevel): HeaderCell[] {
  const cells: HeaderCell[] = [];
  if (zoom === "months" || zoom === "quarters") {
    const step = zoom === "months" ? 1 : 3;
    let cursor = new Date(RANGE_START);
    while (cursor.getTime() <= RANGE_END) {
      const next = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + step, 1));
      const endMs = Math.min(next.getTime(), RANGE_END + DAY_MS);
      const left = ((cursor.getTime() - RANGE_START) / DAY_MS / TOTAL_DAYS) * 100;
      const width = ((endMs - cursor.getTime()) / DAY_MS / TOTAL_DAYS) * 100;
      cells.push({
        key: cursor.toISOString().slice(0, 10),
        label:
          zoom === "months"
            ? cursor.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" })
            : `Q${Math.floor(cursor.getUTCMonth() / 3) + 1} ${cursor.getUTCFullYear()}`,
        leftPct: left,
        widthPct: width,
      });
      cursor = next;
    }
    return cells;
  }
  // weeks
  let cursor = new Date(RANGE_START);
  let i = 1;
  while (cursor.getTime() <= RANGE_END) {
    const next = new Date(cursor.getTime() + 7 * DAY_MS);
    const endMs = Math.min(next.getTime(), RANGE_END + DAY_MS);
    cells.push({
      key: `w${i}`,
      label: `W${i}`,
      leftPct: ((cursor.getTime() - RANGE_START) / DAY_MS / TOTAL_DAYS) * 100,
      widthPct: ((endMs - cursor.getTime()) / DAY_MS / TOTAL_DAYS) * 100,
    });
    cursor = next;
    i += 1;
  }
  return cells;
}

export const ZOOM_TRACK_WIDTH: Record<ZoomLevel, number> = {
  weeks: 2200,
  months: 1100,
  quarters: 820,
};
