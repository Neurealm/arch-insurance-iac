/**
 * AIM-004 — Technical metrics panel.
 *
 * Secondary surface. Operational metrics always remain visible alongside it.
 */

import { technicalMetrics } from "./analyticsFixtures";

export function TechnicalMetricsPanel() {
  return (
    <section aria-label="Technical model metrics" data-testid="technical-metrics" className="rounded-lg border border-slate-200 bg-slate-50/70 p-2">
      <h4 className="text-[11px] font-semibold text-slate-800">Technical metrics, data science view</h4>
      <p className="text-[10.5px] text-slate-500">
        Synthetic demonstration values. Operational metrics above remain the primary view.
      </p>
      <ul className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
        {technicalMetrics.map((m) => (
          <li key={m.key} className="rounded border border-slate-200 bg-white p-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-800">{m.label}</span>
              <span className="text-[12px] font-semibold text-slate-900">{m.displayValue}</span>
            </div>
            <dl className="mt-0.5 space-y-0.5 text-[10px] text-slate-600">
              <div><dt className="inline font-medium text-slate-500">Definition: </dt><dd className="inline">{m.definition}</dd></div>
              <div><dt className="inline font-medium text-slate-500">Why it matters: </dt><dd className="inline">{m.whyItMatters}</dd></div>
              <div><dt className="inline font-medium text-slate-500">Target: </dt><dd className="inline">{m.target}</dd></div>
              <div><dt className="inline font-medium text-slate-500">Limitation: </dt><dd className="inline">{m.limitation}</dd></div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
