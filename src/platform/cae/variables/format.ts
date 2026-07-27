/**
 * Approved formatting for contextual audio variables.
 *
 * Two renderings are produced for every value: a written display form used in
 * transcripts and author previews, and a natural spoken form used by the
 * speech synthesiser.
 */
import type { CaeVariableFormat } from "./types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toNumber(value: string | number | Date): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value instanceof Date) return null;
  const parsed = Number(String(value).replace(/[$%,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function toDate(value: string | number | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function group(value: number, decimals: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function trim(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function spokenMagnitude(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "negative " : "";
  if (abs >= 1_000_000_000) return `${sign}${trim(abs / 1_000_000_000)} billion`;
  if (abs >= 1_000_000) return `${sign}${trim(abs / 1_000_000)} million`;
  if (abs >= 10_000) return `${sign}${trim(abs / 1_000)} thousand`;
  return `${sign}${trim(abs)}`;
}

function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Written rendering used in transcripts and previews. */
export function formatDisplayValue(value: string | number | Date, format: CaeVariableFormat): string | null {
  switch (format) {
    case "currency_usd": {
      const n = toNumber(value);
      if (n === null) return null;
      const decimals = Math.abs(n) < 1000 && !Number.isInteger(n) ? 2 : 0;
      return `${n < 0 ? "-" : ""}$${group(Math.abs(n), decimals)}`;
    }
    case "percentage": {
      const n = toNumber(value);
      if (n === null) return null;
      return `${group(n, Number.isInteger(n) ? 0 : 1)}%`;
    }
    case "integer": {
      const n = toNumber(value);
      if (n === null) return null;
      return group(Math.round(n), 0);
    }
    case "decimal": {
      const n = toNumber(value);
      if (n === null) return null;
      return group(n, 2);
    }
    case "date": {
      const d = toDate(value);
      if (!d) return null;
      return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCFullYear()}`;
    }
    case "status": {
      const text = String(value).trim();
      return text ? titleCase(text) : null;
    }
    case "text":
    default: {
      const text = String(value).trim();
      return text ? text : null;
    }
  }
}

/** Natural spoken rendering handed to the speech synthesiser. */
export function formatSpokenValue(value: string | number | Date, format: CaeVariableFormat): string | null {
  switch (format) {
    case "currency_usd": {
      const n = toNumber(value);
      if (n === null) return null;
      return `${spokenMagnitude(n)} ${Math.abs(n) === 1 ? "dollar" : "dollars"}`;
    }
    case "percentage": {
      const n = toNumber(value);
      if (n === null) return null;
      return `${trim(n)} percent`;
    }
    case "integer": {
      const n = toNumber(value);
      if (n === null) return null;
      return String(Math.round(n));
    }
    case "decimal": {
      const n = toNumber(value);
      if (n === null) return null;
      return trim(n);
    }
    case "date": {
      const d = toDate(value);
      if (!d) return null;
      return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
    }
    case "status": {
      const text = String(value).trim();
      return text ? titleCase(text) : null;
    }
    case "text":
    default: {
      const text = String(value).trim();
      return text ? text : null;
    }
  }
}
