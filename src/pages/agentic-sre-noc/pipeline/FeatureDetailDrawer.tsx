/**
 * AIM-002 — Feature Detail Drawer.
 *
 * Explains one engineered feature: definition, sources, synthetic reference
 * calculation, ranges, quality, downstream models, evidence and limitations.
 */

import { PipelineDrawer } from "./PipelineDrawer";
import { allSignals, engineeredFeatures, modelComponents, type EngineeredFeature } from "../data/pliPipelineFixtures";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 py-1">
      <dt className="text-[10.5px] text-slate-500">{label}</dt>
      <dd className="text-right text-[11px] font-medium text-slate-900">{value}</dd>
    </div>
  );
}

export function FeatureDetailDrawer({
  open, featureId, onClose,
}: {
  open: boolean;
  featureId: string | null;
  onClose: () => void;
}) {
  const feature: EngineeredFeature | undefined = engineeredFeatures.find((f) => f.id === featureId);
  if (!open || !feature) return null;

  const sources = feature.signalIds
    .map((id) => allSignals.find((s) => s.id === id))
    .filter(Boolean)
    .slice(0, 10);
  const models = feature.downstreamModelIds
    .map((id) => modelComponents.find((m) => m.id === id))
    .filter(Boolean);

  return (
    <PipelineDrawer
      open={open}
      onClose={onClose}
      title={feature.name}
      subtitle={`${feature.value} ${feature.unit} · ${feature.state}`}
      testId="feature-detail-drawer"
    >
      <div className="space-y-3 text-[11px] text-slate-700">
        <p className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-900">
          Synthetic reference logic. Illustrative engineering approximation for demonstration only, not a Taara formula
          and not a production model.
        </p>

        <section>
          <h4 className="text-[11.5px] font-semibold text-slate-900">Operational definition</h4>
          <p className="mt-0.5">{feature.definition}</p>
        </section>

        <section>
          <h4 className="text-[11.5px] font-semibold text-slate-900">Why it matters</h4>
          <p className="mt-0.5">{feature.whyItMatters}</p>
        </section>

        <section>
          <h4 className="text-[11.5px] font-semibold text-slate-900">Current value and ranges</h4>
          <dl className="mt-1">
            <Row label="Current value" value={`${feature.value} ${feature.unit}`} />
            <Row label="Normal range" value={feature.normalRange} />
            <Row label="Historical range" value={feature.historicalRange} />
            <Row label="Risk direction" value={feature.riskDirection} />
            <Row label="Risk contribution" value={`${feature.contributionPct}% of the current prediction`} />
            <Row label="Data freshness" value={feature.freshness} />
            <Row label="Data quality" value={feature.quality} />
          </dl>
        </section>

        <section>
          <h4 className="text-[11.5px] font-semibold text-slate-900">Source signals</h4>
          <ul className="mt-1 space-y-0.5">
            {sources.map((s) => (
              <li key={s!.id} className="flex items-baseline justify-between gap-2 rounded bg-slate-50 px-1.5 py-1">
                <span className="truncate">{s!.name}</span>
                <span className="shrink-0 font-medium text-slate-900">{s!.value} {s!.unit}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="text-[11.5px] font-semibold text-slate-900">Calculation method</h4>
          <p className="mt-0.5">{feature.method}</p>
        </section>

        <section>
          <h4 className="text-[11.5px] font-semibold text-slate-900">Example calculation</h4>
          <ul className="mt-1 space-y-0.5">
            {feature.example.inputs.map((i) => (
              <li key={i.label} className="flex items-baseline justify-between gap-2">
                <span className="text-slate-500">{i.label}</span>
                <span className="font-medium text-slate-900">{i.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 rounded bg-slate-50 px-1.5 py-1 font-mono text-[10px] text-slate-700">
            {feature.example.method}
          </p>
          <p className="mt-1 font-medium text-slate-900">Result: {feature.example.output}</p>
        </section>

        <section>
          <h4 className="text-[11.5px] font-semibold text-slate-900">Missing-data handling</h4>
          <p className="mt-0.5">{feature.missingDataHandling}</p>
        </section>

        <section>
          <h4 className="text-[11.5px] font-semibold text-slate-900">Downstream models</h4>
          <ul className="mt-1 space-y-0.5">
            {models.map((m) => (
              <li key={m!.id} className="flex items-baseline justify-between gap-2">
                <span className="truncate">{m!.name}</span>
                <span className="shrink-0 text-slate-500">{m!.weightPct}% weight</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="text-[11.5px] font-semibold text-slate-900">Evidence references</h4>
          <ul className="mt-1 space-y-1">
            {feature.evidence.map((e) => (
              <li key={e.id} className="rounded border border-slate-200 px-1.5 py-1">
                <span className="block font-medium text-slate-900">{e.label}</span>
                <span className="block text-slate-600">{e.detail}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="text-[11.5px] font-semibold text-slate-900">Known limitations</h4>
          <p className="mt-0.5">{feature.limitations}</p>
        </section>
      </div>
    </PipelineDrawer>
  );
}
