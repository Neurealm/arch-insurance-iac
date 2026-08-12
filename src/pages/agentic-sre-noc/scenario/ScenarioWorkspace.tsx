/**
 * AIM-006 — Chennai predictive protection scenario workspace.
 *
 * Controls, stage state, activity timeline, failure simulations, outcome and
 * operational learning. Deterministic local state only: no workflow engine, no
 * network action and no real model call.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info } from "lucide-react";
import { failureOptions, scenarioStages } from "./scenarioFixtures";
import {
  exportDemoReport, exportLearningSummary, exportScenarioOutcome, exportScenarioTimeline,
} from "./scenarioExport";
import type { ScenarioFailureKey } from "./scenarioTypes";
import type { ScenarioStateValue } from "./useScenarioState";

const controlClass =
  "min-h-11 min-w-11 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:min-w-0 sm:py-1.5";

function focusSection(id: string) {
  const node = document.getElementById(id);
  node?.scrollIntoView?.({ block: "start" });
  node?.focus?.();
}

export function ScenarioWorkspace({ state }: { state: ScenarioStateValue }) {
  const { stage, approval, outcome, learning, timeline } = state;

  if (state.panelState === "error") {
    return (
      <div role="alert" className="flex flex-col items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/70 p-4 text-center">
        <AlertTriangle className="h-4 w-4 text-rose-600" aria-hidden />
        <p className="text-[12px] font-medium text-rose-800">Scenario state could not be loaded</p>
        <p className="text-[11px] text-rose-700">Reset the scenario, or continue with the remaining panels.</p>
      </div>
    );
  }

  if (state.panelState === "loading") {
    return (
      <div role="status" aria-live="polite" className="space-y-2">
        <span className="sr-only">Loading the predictive protection scenario</span>
        <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="h-40 animate-pulse rounded bg-slate-50" />
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="scenario-workspace" data-stage={stage.index} data-failure={state.failure}>
      {/* controls */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 p-2">
        <button type="button" className={controlClass} onClick={() => state.setPlaying(true)} disabled={state.playing}>Start</button>
        <button type="button" className={controlClass} onClick={() => state.setPlaying(false)} disabled={!state.playing}>Pause</button>
        <button type="button" className={controlClass} onClick={() => state.setPlaying(true)} disabled={state.playing}>Continue</button>
        <button type="button" className={controlClass} onClick={state.previous}>Previous Stage</button>
        <button type="button" className={controlClass} onClick={state.next}>Next Stage</button>
        <button type="button" className={controlClass} onClick={state.reset}>Reset</button>
        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          <span className="sr-only sm:not-sr-only">Playback Speed</span>
          <select aria-label="Playback Speed" value={String(state.speed)}
            onChange={(e) => state.setSpeed(Number(e.target.value))}
            className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            {["0.5", "1", "2", "4"].map((s) => <option key={s} value={s}>{s}x</option>)}
          </select>
        </label>

        <span className="mx-1 hidden h-6 w-px bg-slate-200 lg:block" aria-hidden />

        <button type="button" data-testid="scenario-approve"
          className={cn(controlClass, "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100")}
          onClick={state.approve} disabled={!approval.required || approval.state === "approved"}>
          Approve Traffic Movement
        </button>
        <button type="button" data-testid="scenario-reject"
          className={cn(controlClass, "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100")}
          onClick={state.reject} disabled={!approval.required || approval.state === "rejected"}>
          Reject Traffic Movement
        </button>
        <button type="button" data-testid="scenario-request-evidence" className={controlClass} onClick={state.requestMoreEvidence}>
          Request More Evidence
        </button>
        {approval.state === "evidence-requested" && (
          <button type="button" className={controlClass} onClick={state.resumeAfterEvidence}>Resume scenario</button>
        )}
        <button type="button" className={controlClass}
          onClick={() => { state.setExplainOpen(true); state.setExplainTab("Evidence"); }}>
          Open Current Evidence
        </button>

        <span className="mx-1 hidden h-6 w-px bg-slate-200 lg:block" aria-hidden />

        <button type="button" className={controlClass} onClick={() => focusSection("pli-panel-chennai")}>Show Map</button>
        <button type="button" className={controlClass} onClick={() => focusSection("pli-panel-pipeline")}>Show Pipeline</button>
        <button type="button" className={controlClass} onClick={() => focusSection("pli-panel-performance")}>Show Analytics</button>
        <button type="button" className={controlClass} onClick={() => focusSection("pli-panel-governance")}>Show Governance</button>
        <button type="button" className={controlClass} onClick={() => focusSection("scenario-outcome")}>Show Outcome</button>

        <label className="ml-auto flex items-center gap-1 text-[10.5px] text-slate-600">
          <span className="sr-only sm:not-sr-only">Failure simulation</span>
          <select aria-label="Failure simulation" value={state.failure}
            onChange={(e) => state.setFailure(e.target.value as ScenarioFailureKey)}
            className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            {failureOptions.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </label>
      </div>

      <p aria-live="polite" data-testid="scenario-announcement" className="text-[10.5px] text-slate-600">
        {state.announcement || `Stage ${stage.index} of ${state.stageCount}: ${stage.title}.`}
      </p>
      {state.transitionError && (
        <p role="alert" data-testid="scenario-transition-error" className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10.5px] text-amber-800">
          {state.transitionError}
        </p>
      )}

      {/* stage state */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <section aria-label="Current scenario stage" className="rounded-lg border border-slate-200 bg-white p-3">
          <h4 className="text-[12px] font-semibold text-slate-900">
            Stage {stage.index} of {state.stageCount} · {stage.title}
          </h4>
          <p className="text-[11px] text-slate-600">{stage.actor} · {stage.summary}</p>
          <ul className="mt-1.5 space-y-0.5">
            {stage.state.map((s) => (
              <li key={s} className="flex gap-1.5 text-[11px] text-slate-700">
                <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />{s}
              </li>
            ))}
          </ul>
          <dl className="mt-2 grid grid-cols-2 gap-1 text-[10.5px]">
            <div><dt className="text-slate-500">Risk</dt><dd className="font-medium text-slate-900">{stage.riskScore.toFixed(2)}</dd></div>
            <div><dt className="text-slate-500">Confidence</dt><dd data-testid="scenario-confidence" className="font-medium text-slate-900">{stage.confidencePct}%</dd></div>
            <div><dt className="text-slate-500">ETA</dt><dd className="font-medium text-slate-900">{stage.etaLabel}</dd></div>
            <div><dt className="text-slate-500">Fallback</dt><dd data-testid="scenario-fallback" className="font-medium text-slate-900">{stage.fallbackReady ? "Ready" : "Not ready"}</dd></div>
            <div><dt className="text-slate-500">Approval</dt><dd data-testid="scenario-approval-state" className="font-medium text-slate-900">{approval.state}</dd></div>
            <div><dt className="text-slate-500">Customer</dt><dd className="font-medium text-slate-900">{stage.customerHealthy ? "Healthy" : "At risk"}</dd></div>
          </dl>
          <p className="mt-1 text-[10.5px] text-slate-600">{approval.reason}</p>

          {stage.notes.length > 0 && (
            <ul className="mt-1 space-y-0.5" data-testid="scenario-simulation-notes">
              {stage.notes.map((n) => <li key={n} className="text-[10.5px] text-amber-800">{n}</li>)}
            </ul>
          )}
        </section>

        {/* timeline */}
        <section aria-label="Predictive Protection Activity" className="rounded-lg border border-slate-200 bg-white p-3 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-[12px] font-semibold text-slate-900">Predictive Protection Activity</h4>
            <button type="button" className={controlClass}
              onClick={() => state.setExportMessage(exportScenarioTimeline(timeline).message)}>
              Export timeline
            </button>
          </div>
          {timeline.length === 0 ? (
            <div className="mt-2 flex flex-col items-center gap-1 rounded border border-dashed border-slate-200 bg-slate-50/60 p-3 text-center">
              <Info className="h-4 w-4 text-slate-400" aria-hidden />
              <p className="text-[11.5px] text-slate-700">No scenario timeline events yet. Start the scenario to record activity.</p>
            </div>
          ) : (
            <div className="mt-2 max-h-[320px] overflow-auto">
              <table className="w-full min-w-[620px] text-left text-[11px]">
                <caption className="sr-only">Predictive protection activity, one record per scenario stage</caption>
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-2 py-1">Time</th>
                    <th scope="col" className="px-2 py-1">Stage</th>
                    <th scope="col" className="px-2 py-1">Actor</th>
                    <th scope="col" className="px-2 py-1">Event</th>
                    <th scope="col" className="px-2 py-1">Policy</th>
                    <th scope="col" className="px-2 py-1">Customer</th>
                    <th scope="col" className="px-2 py-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((e) => (
                    <tr key={e.id} data-testid={`timeline-event-${e.stageIndex}`}
                      className={cn("border-t border-slate-100", state.selectedTimelineId === e.id && "bg-blue-50")}>
                      <td className="px-2 py-1 text-slate-700">{e.timestamp}</td>
                      <th scope="row" className="px-2 py-1 font-medium text-slate-900">
                        <button type="button"
                          onClick={() => {
                            state.setSelectedTimelineId(e.id);
                            state.setStageIndex(e.stageIndex);
                            state.announce(`Timeline event selected: stage ${e.stageIndex}, ${e.stage}.`);
                          }}
                          className="min-h-11 text-left underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0">
                          {e.stage}
                        </button>
                      </th>
                      <td className="px-2 py-1 text-slate-700">{e.actor}</td>
                      <td className="px-2 py-1 text-slate-700">{e.event}</td>
                      <td className="px-2 py-1 text-slate-700">{e.policyState}</td>
                      <td className="px-2 py-1 text-slate-700">{e.customerState}</td>
                      <td className="px-2 py-1 text-slate-700">{e.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {state.selectedTimelineId && (
            <p data-testid="timeline-selection" className="mt-1 text-[10.5px] text-slate-600">
              Selected event {state.selectedTimelineId} · input {timeline.find((e) => e.id === state.selectedTimelineId)?.input} ·
              output {timeline.find((e) => e.id === state.selectedTimelineId)?.output} ·
              evidence {timeline.find((e) => e.id === state.selectedTimelineId)?.evidence}
            </p>
          )}
        </section>
      </div>

      {/* outcome and learning */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <section id="scenario-outcome" tabIndex={-1} aria-label="Predictive Protection Outcome"
          data-testid="scenario-outcome" className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-[12px] font-semibold text-slate-900">Predictive Protection Outcome</h4>
            <button type="button" className={controlClass}
              onClick={() => state.setExportMessage(exportScenarioOutcome(outcome).message)}>
              Export outcome
            </button>
          </div>
          <p className="text-[10.5px] text-slate-500">Synthetic demonstration outcomes.</p>
          <dl className="mt-1.5 grid grid-cols-1 gap-1 text-[11px] sm:grid-cols-2">
            <div><dt className="text-slate-500">Prediction Result</dt><dd className="font-medium text-slate-900">{outcome.predictionResult}</dd></div>
            <div><dt className="text-slate-500">Customer Outcome</dt><dd className="font-medium text-slate-900">{outcome.customerOutcome}</dd></div>
            <div><dt className="text-slate-500">Capacity Protected</dt><dd className="font-medium text-slate-900">{outcome.capacityProtectedGbps} Gbps</dd></div>
            <div><dt className="text-slate-500">Outage Minutes Avoided</dt><dd className="font-medium text-slate-900">{outcome.outageMinutesAvoided}</dd></div>
            <div><dt className="text-slate-500">SLO Impact</dt><dd className="font-medium text-slate-900">{outcome.sloImpact}</dd></div>
            <div><dt className="text-slate-500">Error Budget Preserved</dt><dd className="font-medium text-slate-900">{outcome.errorBudgetPreservedPct}%</dd></div>
            <div><dt className="text-slate-500">Preventive Action Result</dt><dd className="font-medium text-slate-900">{outcome.preventiveActionResult}</dd></div>
            <div><dt className="text-slate-500">Validation Result</dt><dd className="font-medium text-slate-900">{outcome.validationResult}</dd></div>
            <div><dt className="text-slate-500">Rollback Result</dt><dd className="font-medium text-slate-900">{outcome.rollbackResult}</dd></div>
            <div><dt className="text-slate-500">Evidence Completeness</dt><dd className="font-medium text-slate-900">{outcome.evidenceCompletenessPct}%</dd></div>
            <div><dt className="text-slate-500">Learning Recorded</dt><dd className="font-medium text-slate-900">{outcome.learningRecorded ? "Recorded" : "Not yet recorded"}</dd></div>
            <div><dt className="text-slate-500">Next Recommended Improvement</dt><dd className="font-medium text-slate-900">{outcome.nextRecommendedImprovement}</dd></div>
          </dl>
        </section>

        <section aria-label="What the System Learned" data-testid="scenario-learning" className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-[12px] font-semibold text-slate-900">What the System Learned</h4>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" className={controlClass}
                onClick={() => state.setExportMessage(exportLearningSummary(learning).message)}>
                Export learning
              </button>
              <button type="button" className={controlClass}
                onClick={() => state.setExportMessage(exportDemoReport(state.activeEvidence, timeline, outcome, learning).message)}>
                Export full demo report
              </button>
            </div>
          </div>
          {learning.length === 0 ? (
            <div className="mt-2 flex flex-col items-center gap-1 rounded border border-dashed border-slate-200 bg-slate-50/60 p-3 text-center">
              <Info className="h-4 w-4 text-slate-400" aria-hidden />
              <p className="text-[11.5px] text-slate-700">No learning updates yet. Learning is recorded once the outcome is known.</p>
            </div>
          ) : (
            <dl className="mt-1.5 space-y-1">
              {learning.map((l) => (
                <div key={l.key} className="border-b border-slate-100 pb-1">
                  <dt className="text-[10.5px] text-slate-500">{l.label} · {l.lifecycleState}</dt>
                  <dd className="text-[11px] text-slate-800">{l.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-1 text-[10.5px] text-slate-500">
            Lifecycle updates are proposed, reviewed or approved by people. No automatic production retraining occurs.
          </p>
        </section>
      </div>

      <p aria-live="polite" className="text-[10.5px] text-slate-600">{state.exportMessage}</p>
      <p className="text-[10.5px] text-slate-500">
        Scenario covers {scenarioStages.length} deterministic stages of the Chennai predictive protection demonstration.
      </p>
    </div>
  );
}
