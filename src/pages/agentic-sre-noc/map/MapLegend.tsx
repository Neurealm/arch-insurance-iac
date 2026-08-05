/**
 * GLHM-MAP-002 — operational map legend.
 *
 * Colour is never the only signal: each entry carries a line pattern or marker
 * glyph plus text. Collapsible on all breakpoints; collapsed by default below
 * desktop so it never covers the Chennai risk cluster or the attribution.
 */

import { ChevronDown, ChevronUp } from "lucide-react";
import { AUX_COLORS, STATUS_COLORS } from "./layers";

interface LegendEntry {
  label: string;
  color: string;
  pattern: "solid" | "dashed" | "dotted" | "long-dash";
  glyph?: string;
}

export const LEGEND_ENTRIES: LegendEntry[] = [
  { label: "Healthy", color: STATUS_COLORS.healthy, pattern: "solid" },
  { label: "Watch", color: STATUS_COLORS.watch, pattern: "solid" },
  { label: "At Risk", color: STATUS_COLORS["at-risk"], pattern: "solid" },
  { label: "Degraded", color: STATUS_COLORS.degraded, pattern: "solid" },
  { label: "Down", color: STATUS_COLORS.down, pattern: "dashed" },
  { label: "Recovering", color: STATUS_COLORS.recovering, pattern: "solid" },
  { label: "Maintenance", color: STATUS_COLORS.maintenance, pattern: "dotted" },
  { label: "RF Fallback", color: AUX_COLORS.rfFallback, pattern: "dashed" },
  { label: "Fiber Backup", color: AUX_COLORS.fiberBackup, pattern: "long-dash" },
  { label: "Service Corridor", color: AUX_COLORS.serviceCorridor, pattern: "dotted" },
  { label: "Predicted Risk", color: AUX_COLORS.risk, pattern: "solid", glyph: "▲" },
  { label: "Active Incident", color: AUX_COLORS.incident, pattern: "solid", glyph: "■" },
  { label: "Customer Impact", color: AUX_COLORS.customerImpact, pattern: "solid", glyph: "●" },
];

function PatternSwatch({ entry }: { entry: LegendEntry }) {
  if (entry.glyph) {
    return (
      <span aria-hidden className="w-5 text-center text-[11px] leading-none" style={{ color: entry.color }}>
        {entry.glyph}
      </span>
    );
  }
  const dash =
    entry.pattern === "dashed" ? "4 3" : entry.pattern === "dotted" ? "1.5 2.5" : entry.pattern === "long-dash" ? "7 3" : undefined;
  return (
    <svg aria-hidden width="20" height="8" viewBox="0 0 20 8" className="shrink-0">
      <line
        x1="0" y1="4" x2="20" y2="4"
        stroke={entry.color}
        strokeWidth={entry.pattern === "solid" ? 2.2 : 1.8}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MapLegend({
  open, onToggle,
}: { open: boolean; onToggle: () => void }) {
  return (
    <div className="pointer-events-auto w-[184px] rounded-lg border border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="glhm-legend-body"
        className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Legend
        {open ? <ChevronDown className="h-3 w-3" aria-hidden /> : <ChevronUp className="h-3 w-3" aria-hidden />}
      </button>
      {open && (
        <ul id="glhm-legend-body" className="max-h-[230px] space-y-1 overflow-y-auto px-2.5 pb-2">
          {LEGEND_ENTRIES.map((entry) => (
            <li key={entry.label} className="flex items-center gap-1.5 text-[10.5px] text-slate-600">
              <PatternSwatch entry={entry} />
              <span>{entry.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MapLegend;
