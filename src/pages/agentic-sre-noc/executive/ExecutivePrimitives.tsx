/**
 * AIM-010 — Executive Operational Experience primitives.
 *
 * Presentation only. These components reorganise existing synthetic fixtures
 * into an operations-first hierarchy: situation, recommendation, trust, then
 * engineering detail. No model logic and no new data sources.
 */

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlTransition, focusRing, surfaceTransition } from "../components/motion";
import {
  currentRecommendedAction, operationalAssessment, operationalConfidence, operationalTrustDetail,
  viewingModes, type SummaryChip, type ViewingMode,
} from "../data/pliFixtures";

/* Colour contract: risk red, warning amber, positive green, analytic blue,
   learning purple, neutral gray. */
const toneClasses: Record<SummaryChip["tone"], string> = {
  risk: "border-rose-200 bg-rose-50 text-rose-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-800",
  analytic: "border-blue-200 bg-blue-50 text-blue-800",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

/* ------------------------- Section 1: summary bar ------------------------- */

export function OperationalSummaryBar() {
  return (
    <section
      data-testid="pli-operational-summary"
      aria-labelledby="pli-operational-summary-title"
      className={cn(
        "rounded-xl border border-slate-300 bg-slate-50/80 px-4 py-3 shadow-sm",
        surfaceTransition,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="pli-operational-summary-title" className="text-sm font-semibold text-slate-900">
            Current Operational Assessment
          </h2>
          <p className="mt-1 text-[13px] font-medium text-slate-900">{operationalAssessment.headline}</p>
          <ul className="mt-1 space-y-0.5">
            {operationalAssessment.detail.map((d) => (
              <li key={d} className="flex gap-1.5 text-[12px] text-slate-700">
                <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                {d}
              </li>
            ))}
          </ul>
        </div>

        <dl className="flex flex-wrap items-start gap-2" aria-label="Operational assessment summary chips">
          {operationalAssessment.chips.map((chip) => (
            <div
              key={chip.key}
              data-testid={`pli-summary-chip-${chip.key}`}
              className={cn("rounded-lg border px-2.5 py-1.5", toneClasses[chip.tone])}
            >
              <dt className="text-[10px] uppercase tracking-wide opacity-80">{chip.label}</dt>
              <dd className="text-[12px] font-semibold">{chip.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* --------------------- Section 3: recommendation cards -------------------- */

export function RecommendedActionCard({ onExplain }: { onExplain?: () => void }) {
  return (
    <section
      data-testid="pli-recommended-action"
      aria-labelledby="pli-recommended-action-title"
      className="rounded-xl border border-amber-200 bg-white shadow-sm"
    >
      <header className="border-b border-amber-200 bg-amber-50/70 px-4 py-2.5">
        <h2 id="pli-recommended-action-title" className="text-sm font-semibold text-slate-900">
          Current Recommended Action
        </h2>
        <p className="text-[11px] text-slate-600">Engineering recommendation, governed automated action pending approval.</p>
      </header>
      <div className="space-y-2 p-4">
        <p className="text-[16px] font-semibold text-slate-900">{currentRecommendedAction.action}</p>
        <p className="text-[12px] text-slate-700">{currentRecommendedAction.reason}</p>
        <dl className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {currentRecommendedAction.facts.map((f) => (
            <div key={f.key} className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
              <dt className="text-[10px] uppercase tracking-wide text-slate-500">{f.label}</dt>
              <dd className="text-[11.5px] font-medium text-slate-900">{f.value}</dd>
            </div>
          ))}
        </dl>
        {onExplain && (
          <button
            type="button"
            onClick={onExplain}
            className={cn(
              "rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-slate-700 shadow-sm hover:bg-slate-50",
              controlTransition,
              focusRing,
            )}
          >
            Why this recommendation
          </button>
        )}
      </div>
    </section>
  );
}

export function OperationalConfidenceCard() {
  return (
    <section
      data-testid="pli-operational-confidence"
      aria-labelledby="pli-operational-confidence-title"
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 px-4 py-2.5">
        <h2 id="pli-operational-confidence-title" className="text-sm font-semibold text-slate-900">
          Operational Confidence
        </h2>
        <p className="text-[11px] text-slate-600">Trust indicators behind the current recommendation.</p>
      </header>
      <dl className="grid grid-cols-1 gap-1.5 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {operationalConfidence.map((c) => (
          <div key={c.key} className={cn("rounded border px-2 py-1.5", toneClasses[c.tone])}>
            <dt className="text-[10px] uppercase tracking-wide opacity-80">{c.label}</dt>
            <dd className="text-[13px] font-semibold">{c.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ------------------------ Operational Trust KPI card ---------------------- */

export function OperationalTrustCard({ selected, onSelect }: { selected?: boolean; onSelect?: () => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <article
      data-testid="pli-operational-trust"
      aria-label="Operational Trust. Model health 94.1 percent, false positive rate 2.8 percent, data freshness 96 percent."
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      className={cn(
        "rounded-lg border bg-white p-3 shadow-sm hover:shadow-md",
        surfaceTransition,
        selected ? "border-blue-400 ring-1 ring-blue-300" : "border-slate-200",
      )}
    >
      <h3 className="text-[11.5px] font-medium text-slate-600">
        <button type="button" aria-pressed={Boolean(selected)} onClick={onSelect} className={cn("w-full rounded text-left", focusRing)}>
          Operational Trust
        </button>
      </h3>
      <p className="mt-1 text-[18px] font-semibold leading-tight text-emerald-700">Model Healthy</p>
      <dl className="mt-1 space-y-0.5 text-[11px] text-slate-600">
        <div className="flex justify-between gap-2"><dt>Model health</dt><dd className="font-medium text-slate-900">94.1%</dd></div>
        <div className="flex justify-between gap-2"><dt>False positive</dt><dd className="font-medium text-slate-900">2.8%</dd></div>
        <div className="flex justify-between gap-2"><dt>Data freshness</dt><dd className="font-medium text-slate-900">96%</dd></div>
      </dl>
      {open && (
        <dl className="mt-1.5 border-t border-dashed border-slate-200 pt-1.5 text-[10.5px] text-slate-600">
          {operationalTrustDetail.map((d) => (
            <div key={d.key} className="flex justify-between gap-2">
              <dt>{d.label}</dt>
              <dd className="font-medium text-slate-900">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}

/* --------------------------- disclosure section --------------------------- */

export function Disclosure({
  id, title, summary, defaultOpen = false, children,
}: {
  id: string; title: string; summary?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div data-testid={`pli-disclosure-${id}`} data-open={open ? "true" : "false"} className="rounded-lg border border-slate-200 bg-slate-50/60">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`pli-disclosure-body-${id}`}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] font-medium text-slate-800 hover:bg-slate-100",
          controlTransition,
          focusRing,
        )}
      >
        <span>{title}</span>
        <span className="flex items-center gap-2 text-[11px] font-normal text-slate-600">
          {open ? "Hide" : "Show"}
          <ChevronDown className={cn("h-3.5 w-3.5", controlTransition, open && "rotate-180")} aria-hidden />
        </span>
      </button>
      {!open && summary && <div className="px-3 pb-2">{summary}</div>}
      <div id={`pli-disclosure-body-${id}`} className={cn("px-3 pb-3", !open && "hidden")}>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------ viewing modes ----------------------------- */

export function ViewingModeSwitch({ mode, onChange }: { mode: ViewingMode; onChange: (m: ViewingMode) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Viewing mode"
      data-testid="pli-viewing-mode"
      className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 shadow-sm"
    >
      {viewingModes.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          onClick={() => onChange(m)}
          className={cn(
            "rounded px-2 py-1 text-[11.5px] font-medium",
            controlTransition,
            focusRing,
            mode === m ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50",
          )}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
