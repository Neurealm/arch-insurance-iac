// Evidence drawer for the Agentic Investigation Workspace (Stage 2).

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { OpsDrawer } from "./OpsDrawer";
import { exportJson } from "@/lib/operations/exports";
import type { EvidenceItem } from "@/types/agenticNocWorkflow";

type SortMode = "Freshness" | "Strength";
type ShowMode = "All" | "Supporting only" | "Contradicting only";

export function EvidenceDrawer({
  open, onClose, evidence, hypothesisId, hypothesisLabel, onRequestMore,
}: {
  open: boolean;
  onClose: () => void;
  evidence: EvidenceItem[];
  hypothesisId: string | null;
  hypothesisLabel: string;
  onRequestMore: () => void;
}) {
  const [category, setCategory] = useState("All categories");
  const [sort, setSort] = useState<SortMode>("Freshness");
  const [show, setShow] = useState<ShowMode>("All");

  const categories = useMemo(
    () => ["All categories", ...Array.from(new Set(evidence.map((e) => e.category)))],
    [evidence],
  );

  const visible = useMemo(() => {
    const supports = (e: EvidenceItem) => !hypothesisId || e.supportsHypothesisIds.includes(hypothesisId);
    const contradicts = (e: EvidenceItem) => !hypothesisId || e.contradictsHypothesisIds.includes(hypothesisId);
    return evidence
      .filter((e) => category === "All categories" || e.category === category)
      .filter((e) => show === "All" || (show === "Supporting only" ? supports(e) : contradicts(e)))
      .slice()
      .sort((a, b) => (sort === "Freshness"
        ? a.freshnessSeconds - b.freshnessSeconds
        : b.reliability - a.reliability));
  }, [evidence, category, show, sort, hypothesisId]);

  return (
    <OpsDrawer
      open={open}
      onClose={onClose}
      title="Evidence"
      subtitle={`Evidence package for ${hypothesisLabel}`}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={onRequestMore}
            className="rounded border border-slate-200 px-2.5 py-1 text-[12px] text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Request additional evidence
          </button>
          <button type="button"
            onClick={() => exportJson("sre-agentic-noc-evidence-package.json", {
              hypothesisId, hypothesisLabel, exportedAt: "2026-05-20T08:45:00Z", evidence: visible,
            })}
            className="rounded bg-blue-600 px-2.5 py-1 text-[12px] font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Export evidence package
          </button>
        </div>
      }
    >
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-[11px] text-slate-600">
          <span className="font-medium uppercase tracking-wide text-slate-500">Filter evidence</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="rounded border border-slate-200 px-2 py-1 text-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-slate-600">
          <span className="font-medium uppercase tracking-wide text-slate-500">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)}
            className="rounded border border-slate-200 px-2 py-1 text-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <option value="Freshness">Freshness</option>
            <option value="Strength">Strength</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-slate-600">
          <span className="font-medium uppercase tracking-wide text-slate-500">Show</span>
          <select value={show} onChange={(e) => setShow(e.target.value as ShowMode)}
            className="rounded border border-slate-200 px-2 py-1 text-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <option value="All">All</option>
            <option value="Supporting only">Supporting only</option>
            <option value="Contradicting only">Contradicting only</option>
          </select>
        </label>
      </div>

      <p className="mb-2 text-[11.5px] text-slate-600" data-testid="evidence-count">
        {visible.length} evidence items shown
      </p>

      {visible.length === 0 ? (
        <p className="rounded border border-slate-200 bg-slate-50 px-3 py-4 text-center text-[12px] text-slate-500">
          No evidence matches the selected filters.
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((item) => {
            const supports = hypothesisId ? item.supportsHypothesisIds.includes(hypothesisId) : false;
            const contradicts = hypothesisId ? item.contradictsHypothesisIds.includes(hypothesisId) : false;
            return (
              <li key={item.id} className="rounded border border-slate-200 p-2.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-[12px] font-medium text-slate-900">{item.signal}</p>
                  <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-medium",
                    supports ? "border-green-200 bg-green-50 text-green-700"
                      : contradicts ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-slate-50 text-slate-600")}>
                    {supports ? "Supports hypothesis" : contradicts ? "Contradicts hypothesis" : "Context"}
                  </span>
                </div>
                <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] sm:grid-cols-3">
                  <Cell label="Evidence ID" value={item.id} />
                  <Cell label="Source" value={item.source} />
                  <Cell label="Category" value={item.category} />
                  <Cell label="Observed" value={item.observedValue} />
                  <Cell label="Expected" value={item.expectedValue} />
                  <Cell label="Reliability" value={`${Math.round(item.reliability * 100)}%`} />
                  <Cell label="Timestamp" value={`${item.timestamp.slice(11, 16)} UTC`} />
                  <Cell label="Freshness" value={freshnessLabel(item.freshnessSeconds)} />
                  <Cell label="Related object" value={item.relatedObject} />
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </OpsDrawer>
  );
}

export function freshnessLabel(seconds: number): string {
  if (seconds < 120) return `${seconds}s ago`;
  if (seconds < 7200) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 172_800) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86_400)}d ago`;
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="truncate text-slate-800" title={value}>{value}</dd>
    </div>
  );
}
