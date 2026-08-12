/**
 * AIM-006 — Explain Current Prediction drawer.
 *
 * Right-side drawer on desktop, bottom sheet on mobile. Eight tabs cover model
 * overview, the current prediction, feature contributions, evidence, similar
 * events, performance, governance and limitations.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { drawerEnter } from "../components/motion";
import { X } from "lucide-react";
import { globalContributions } from "../analytics/analyticsFixtures";
import { operationalMetrics } from "../analytics/analyticsFixtures";
import { modelFeatures } from "../data/pliFixtures";
import { EvidenceWorkspace } from "./EvidenceWorkspace";
import { SimilarEventsPanel } from "./SimilarEventsPanel";
import {
  approvalRationale, currentPrediction, ensembleComponents, limitations, modelOverview, performanceNorms,
} from "./scenarioFixtures";
import { exportExplainReport, exportGovernanceDecision } from "./scenarioExport";
import type { ExplainTab } from "./scenarioTypes";
import type { ScenarioStateValue } from "./useScenarioState";

const TABS: ExplainTab[] = [
  "Model Overview", "Current Prediction", "Feature Contributions", "Evidence",
  "Similar Events", "Performance", "Governance", "Limitations",
];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 py-1">
      <dt className="text-[11px] text-slate-500">{label}</dt>
      <dd className="text-[11.5px] font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function ModelOverviewTab({ state }: { state: ScenarioStateValue }) {
  return (
    <div className="space-y-3">
      <dl>
        <Row label="Model objective" value={modelOverview.objective} />
        <Row label="Target variable" value={modelOverview.targetVariable} />
        <Row label="Forecast horizons" value={modelOverview.horizons} />
        <Row label="Engineering constraints" value="Fallback readiness gate and critical-service policy gate" />
        <Row label="Current model version" value={state.context.modelVersion} />
        <Row label="Training dataset version" value="TDS-2026.06" />
        <Row label="Validation strategy" value={modelOverview.validationStrategy} />
        <Row label="Output structure" value={modelOverview.outputStructure} />
        <Row label="Operational owner" value={modelOverview.operationalOwner} />
        <Row label="Technical owner" value={modelOverview.technicalOwner} />
        <Row label="Current deployment state" value={modelOverview.deploymentState} />
        <Row label="Current confidence threshold" value={`${state.context.thresholdPct}%`} />
        <Row label="Active region and product" value={`${state.context.region} · ${state.context.product}`} />
      </dl>
      <div data-testid="explain-model-inputs">
        <h4 className="text-[12px] font-semibold text-slate-900">Model inputs</h4>
        <dl className="mt-1 space-y-1">
          {(["Optical", "Environmental", "Network and Service", "Historical and Context"] as const).map((group) => (
            <div key={group}>
              <dt className="text-[11px] font-semibold text-slate-800">{group}</dt>
              <dd className="text-[11px] text-slate-600">
                {modelFeatures.filter((f) => f.group === group).map((f) => f.label).join(", ")}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <h4 className="text-[12px] font-semibold text-slate-900">Model ensemble</h4>
        <ul className="mt-1 space-y-1">
          {ensembleComponents.map((c) => (
            <li key={c.key} className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
              <p className="text-[11px] font-medium text-slate-900">{c.name}</p>
              <p className="text-[10.5px] text-slate-600">{c.kind} · {c.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CurrentPredictionTab({ state }: { state: ScenarioStateValue }) {
  const supporting = state.activeEvidence.filter((e) => e.stance === "supports").length;
  const contradicting = state.activeEvidence.filter((e) => e.stance === "contradicts").length;
  const missing = state.activeEvidence.filter((e) => e.freshness === "missing").length;
  return (
    <dl data-testid="explain-current-prediction">
      <Row label="Selected link" value={state.context.selectedLinkId || currentPrediction.linkId} />
      <Row label="Risk score" value={currentPrediction.riskScore.toFixed(2)} />
      <Row label="Risk class" value={currentPrediction.riskClass} />
      <Row label="Confidence" value={`${currentPrediction.confidencePct}%`} />
      <Row label="ETA to impact" value={state.stage.etaLabel} />
      <Row label="Capacity exposed" value={`${currentPrediction.capacityExposedGbps} Gbps`} />
      <Row label="Customer services exposed" value={currentPrediction.servicesExposed} />
      <Row label="Primary driver" value={currentPrediction.primaryDriver} />
      <Row label="Secondary drivers" value={currentPrediction.secondaryDrivers.join(", ")} />
      <Row label="Supporting evidence" value={`${supporting} items`} />
      <Row label="Contradicting evidence" value={`${contradicting} items`} />
      <Row label="Missing evidence" value={`${missing} items`} />
      <Row label="Fallback readiness" value={state.stage.fallbackReady ? "Ready" : "Not ready"} />
      <Row label="Preventability" value={currentPrediction.preventability} />
      <Row label="Recommended action" value={currentPrediction.recommendedAction} />
      <Row label="Approval requirement" value={currentPrediction.approvalRequirement} />
      <Row label="Validation requirement" value={currentPrediction.validationRequirement} />
      <Row label="Rollback readiness" value={currentPrediction.rollbackReadiness} />
    </dl>
  );
}

function FeatureContributionsTab({ state }: { state: ScenarioStateValue }) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const active = globalContributions.find((c) => c.key === selected) ?? null;
  return (
    <div className="space-y-2" data-testid="explain-feature-contributions">
      <p className="text-[10.5px] text-slate-600">
        Feature contributions describe model attribution only. They are not proof of causality.
      </p>
      <table className="w-full text-left text-[11px]">
        <caption className="sr-only">Feature contributions for the current prediction</caption>
        <thead className="text-[10px] uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="py-1">Feature</th>
            <th scope="col" className="py-1">Global</th>
            <th scope="col" className="py-1">Selected link</th>
            <th scope="col" className="py-1">Raw value</th>
            <th scope="col" className="py-1">Normal range</th>
            <th scope="col" className="py-1">Direction</th>
            <th scope="col" className="py-1">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {globalContributions.map((c) => (
            <tr key={c.key} className={cn("border-t border-slate-100", selected === c.key && "bg-blue-50")}>
              <th scope="row" className="py-1 font-medium text-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    const nextKey = selected === c.key ? null : c.key;
                    setSelected(nextKey);
                    state.announce(nextKey
                      ? `Factor ${c.label} selected. Source signals and the ${c.evidenceSection} evidence section are focused.`
                      : "Factor selection cleared.");
                    if (nextKey) state.setEvidenceSearch("");
                  }}
                  aria-pressed={selected === c.key}
                  className="text-left underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {c.label}
                </button>
              </th>
              <td className="py-1 text-slate-700">{(c.contribution * 100).toFixed(0)}%</td>
              <td className="py-1 text-slate-700">{(c.contribution * 106).toFixed(0)}%</td>
              <td className="py-1 text-slate-700">{c.rawValue} {c.rawUnit}</td>
              <td className="py-1 text-slate-700">{c.normalRange}</td>
              <td className="py-1 text-slate-700">{c.direction}</td>
              <td className="py-1 text-slate-700">{c.confidencePct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      {active && (
        <div data-testid="explain-factor-detail" className="rounded border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700">
          <p><span className="font-medium text-slate-900">{active.label}</span> · source signal {active.source} · evidence section {active.evidenceSection}</p>
          <p>Current versus baseline: {(active.contribution * 100).toFixed(0)}% against a 17% baseline risk.</p>
          <p>Current versus prior forecast: {(active.contribution * 94).toFixed(0)}% at the previous run.</p>
          <p>What-If comparison: reducing this feature to its normal range lowers modelled risk by {(active.contribution * 62).toFixed(0)}%.</p>
        </div>
      )}
    </div>
  );
}

function PerformanceTab({ state }: { state: ScenarioStateValue }) {
  return (
    <div className="space-y-2" data-testid="explain-performance">
      <dl>
        <Row label="Selected link" value={state.context.selectedLinkId || currentPrediction.linkId} />
        <Row label="Region" value={state.context.region} />
        <Row label="Product" value={state.context.product} />
        <Row label="Forecast horizon" value={state.context.horizon} />
        <Row label="Model version" value={state.context.modelVersion} />
      </dl>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {operationalMetrics.slice(0, 8).map((m) => (
          <li key={m.key} className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">{m.label}</p>
            <p className="text-[12px] font-semibold text-slate-900">{m.value}</p>
          </li>
        ))}
      </ul>
      <div>
        <h4 className="text-[12px] font-semibold text-slate-900">How this prediction compares with model norms</h4>
        <ul className="mt-1 space-y-0.5">
          {performanceNorms.map((n) => (
            <li key={n.key} className="text-[11px] text-slate-700">{n.label}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function GovernanceTab({ state }: { state: ScenarioStateValue }) {
  return (
    <div className="space-y-2" data-testid="explain-governance">
      <dl>
        <Row label="Active model version" value={state.context.modelVersion} />
        <Row label="Model owner" value={modelOverview.technicalOwner} />
        <Row label="Approval status" value={state.approval.state} />
        <Row label="Release-gate status" value="All release gates passed" />
        <Row label="Current drift state" value={state.failure === "missed-event" ? "Review" : "Within tolerance"} />
        <Row label="Explainability review" value="Complete" />
        <Row label="Security review" value="Complete" />
        <Row label="Rollback version" value="v2.3.6" />
        <Row label="Current autonomy level" value={state.stage.fallbackReady ? "Recommend with approval" : "Blocked"} />
        <Row label="Required approval" value="Network Operations" />
        <Row label="Current policy result" value={state.approval.reason} />
        <Row label="Open governance risks" value={state.failure === "none" ? "None" : "Simulation-driven risk recorded"} />
      </dl>
      <div>
        <h4 className="text-[12px] font-semibold text-slate-900">Why this action requires approval</h4>
        <ul className="mt-1 space-y-0.5">
          {approvalRationale.map((r) => <li key={r} className="text-[11px] text-slate-700">{r}</li>)}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => state.setExportMessage(exportGovernanceDecision(state.approval.reason, state.approval.policyBasis).message)}
        className="min-h-11 rounded border border-slate-200 bg-white px-2 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-1"
      >
        Export governance decision summary
      </button>
    </div>
  );
}

export function ExplainModelDrawer({ state }: { state: ScenarioStateValue }) {
  const closeRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (state.explainOpen) closeRef.current?.focus();
  }, [state.explainOpen]);

  const close = React.useCallback(() => {
    state.setExplainOpen(false);
    const trigger = document.querySelector<HTMLElement>('[data-explain-trigger="true"]');
    trigger?.focus();
  }, [state]);

  React.useEffect(() => {
    if (!state.explainOpen) return undefined;
    const handler = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.explainOpen, close]);

  if (!state.explainOpen) return null;

  const tab = state.explainTab;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Explain Current Prediction"
      data-testid="explain-model-drawer"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 max-h-[88vh] overflow-y-auto rounded-t-xl border border-slate-200 bg-white p-4 shadow-2xl",
        "sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[min(760px,96vw)] sm:rounded-none sm:rounded-l-xl",
        drawerEnter,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">Explain Current Prediction</h2>
          <p className="text-[11px] text-slate-500">
            {state.context.selectedLinkId || currentPrediction.linkId} · {state.context.region} · Synthetic demonstration values
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => state.setExportMessage(exportExplainReport(state.activeEvidence).message)}
            className="min-h-11 min-w-11 rounded border border-slate-200 bg-white px-2 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:min-w-0 sm:py-1"
          >
            Export Explain Model Report
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close Explain Current Prediction"
            className="flex min-h-11 min-w-11 items-center justify-center rounded border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:min-w-0 sm:py-1"
          >
            <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="hidden sm:ml-1 sm:inline">Close</span>
          </button>
        </div>
      </div>

      <div role="tablist" aria-label="Explain Current Prediction sections" className="mt-3 flex flex-wrap gap-1 border-b border-slate-200 pb-2">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            id={`explain-tab-${t.replace(/\s+/g, "-").toLowerCase()}`}
            aria-selected={tab === t}
            aria-controls="explain-tabpanel"
            tabIndex={tab === t ? 0 : -1}
            onClick={() => state.setExplainTab(t)}
            className={cn(
              "min-h-11 rounded-md border px-2 text-[11px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-1",
              tab === t ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="explain-tabpanel"
        aria-labelledby={`explain-tab-${tab.replace(/\s+/g, "-").toLowerCase()}`}
        className="mt-3"
      >
        {tab === "Model Overview" && <ModelOverviewTab state={state} />}
        {tab === "Current Prediction" && <CurrentPredictionTab state={state} />}
        {tab === "Feature Contributions" && <FeatureContributionsTab state={state} />}
        {tab === "Evidence" && <EvidenceWorkspace state={state} />}
        {tab === "Similar Events" && <SimilarEventsPanel state={state} />}
        {tab === "Performance" && <PerformanceTab state={state} />}
        {tab === "Governance" && <GovernanceTab state={state} />}
        {tab === "Limitations" && (
          <ul data-testid="explain-limitations" className="space-y-1">
            {limitations.map((l) => (
              <li key={l} className="flex gap-1.5 text-[11px] text-slate-700">
                <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />{l}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p aria-live="polite" className="mt-2 text-[10.5px] text-slate-600">{state.exportMessage || state.announcement}</p>
    </div>
  );
}
