// Stage 2 — Active workflow surface for the SRE Based Agentic NOC.
// Adds the situation lifecycle, investigation, governed action, validation,
// error budget, learning governance and the deterministic 17 step scenario.

import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { EmptyState, OpsPanel, TableShell } from "@/components/operations/OperationsPrimitives";
import { SituationLifecycleTimeline } from "@/components/operations/SituationLifecycleTimeline";
import { EvidenceDrawer } from "@/components/operations/EvidenceDrawer";
import { ActionApprovalDrawer, actionStateTone } from "@/components/operations/ActionApprovalDrawer";
import { RecoveryValidationPanel } from "@/components/operations/RecoveryValidationPanel";
import { OpsDrawer } from "@/components/operations/OpsDrawer";
import { exportCsv, exportJson } from "@/lib/operations/exports";
import {
  AUTO_REFRESH_INTERVALS_MS, PRIMARY_ACTION_ID, PRIMARY_SITUATION_ID,
  SITUATION_DETAIL, actionWorkflows, learningCandidates, rerouteSimulations,
  riskWorkflowRecords, scenarioSteps,
} from "@/data/agenticNocWorkflowData";
import {
  availableEvidence, customersImpacted, errorBudgetWindows, evidenceCoveragePercent,
  lifecycleEntries, rankHypotheses, rollbackAvailable, useAgenticNocStore,
} from "@/stores/useAgenticNocStore";
import { agenticActions, situations as allSituations } from "@/data/agenticOpticalNetworkData";
import type { AutoRefreshOption, EventStreamFilter } from "@/types/agenticNocWorkflow";

const EVENT_FILTERS: EventStreamFilter[] = [
  "All", "Situations", "Investigations", "Actions", "Risks", "Validation", "Learning",
];
const AUTO_REFRESH: AutoRefreshOption[] = ["Off", "30 seconds", "60 seconds", "5 minutes"];

export function Stage2WorkflowSection() {
  const store = useAgenticNocStore();
  const {
    scenarioStep, autoPlay, autoRefresh, openDrawer, selectedHypothesisId,
    selectedActionId, selectedRiskId, eliminatedHypothesisIds, promotedHypothesisId,
    requestedEvidence, lifecycleStage, validationState, validationResults,
    events, eventFilter, learningRecords,
  } = store;

  const situation = allSituations.find((s) => s.id === PRIMARY_SITUATION_ID) ?? allSituations[0];
  const evidence = useMemo(
    () => availableEvidence(PRIMARY_SITUATION_ID, requestedEvidence),
    [requestedEvidence],
  );
  const ranked = useMemo(
    () => rankHypotheses(PRIMARY_SITUATION_ID, requestedEvidence, eliminatedHypothesisIds, promotedHypothesisId),
    [requestedEvidence, eliminatedHypothesisIds, promotedHypothesisId],
  );
  const entries = useMemo(() => lifecycleEntries(lifecycleStage), [lifecycleStage]);
  const actionId = selectedActionId ?? PRIMARY_ACTION_ID;
  const workflow = actionWorkflows.find((w) => w.actionId === actionId) ?? null;
  const action = agenticActions.find((a) => a.id === actionId) ?? null;
  const runtime = store.actionRuntimes[actionId] ?? null;
  const impacted = customersImpacted(store);
  const budgets = errorBudgetWindows(store);
  const simulation = rerouteSimulations.find((s) => s.riskId === (selectedRiskId ?? "risk-ams-mum")) ?? null;
  const canRollback = rollbackAvailable(store, actionId);

  const visibleEvents = eventFilter === "All"
    ? events : events.filter((e) => e.category === eventFilter);

  // Deterministic auto play of the demonstration scenario.
  useEffect(() => {
    if (!autoPlay) return;
    const timer = window.setInterval(() => useAgenticNocStore.getState().advanceScenario(), 2500);
    return () => window.clearInterval(timer);
  }, [autoPlay]);

  // Auto refresh only updates freshness stamps; the fixtures stay deterministic.
  useEffect(() => {
    const interval = AUTO_REFRESH_INTERVALS_MS[autoRefresh] ?? 0;
    if (!interval) return;
    const timer = window.setInterval(() => useAgenticNocStore.getState().refreshData(), interval);
    return () => window.clearInterval(timer);
  }, [autoRefresh]);

  const currentStep = scenarioSteps.find((s) => s.index === scenarioStep) ?? null;

  return (
    <>
      {/* Scenario and freshness control bar */}
      <section aria-label="Scenario controls"
        className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Demonstration scenario
        </span>
        <span className="text-[12px] text-slate-700" data-testid="scenario-step">
          Step {scenarioStep} of {scenarioSteps.length}
          {currentStep ? ` · ${currentStep.title}` : " · Not started"}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button type="button" onClick={store.previousScenarioStep} disabled={scenarioStep === 0}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Previous step
          </button>
          <button type="button" onClick={store.advanceScenario} disabled={scenarioStep >= scenarioSteps.length}
            className="rounded bg-blue-600 px-2 py-1 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Next step
          </button>
          <button type="button" onClick={() => store.setAutoPlay(!autoPlay)}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            {autoPlay ? "Pause auto play" : "Auto play"}
          </button>
          <button type="button" onClick={store.resetScenario}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Reset scenario
          </button>
          <label className="flex items-center gap-1.5 text-[11.5px] text-slate-600">
            Auto refresh
            <select value={autoRefresh} onChange={(e) => store.setAutoRefresh(e.target.value as AutoRefreshOption)}
              className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              {AUTO_REFRESH.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        </div>
        {currentStep && (
          <p className="w-full text-[11.5px] text-slate-600">
            {currentStep.operationalEffect} · Panels affected: {currentStep.panelsAffected.join(", ")}
          </p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:items-start">
        {/* Situation lifecycle */}
        <OpsPanel title="Situation Lifecycle" subtitle={`${situation.title} · ${SITUATION_DETAIL.id.toUpperCase()}`}
          className="lg:col-span-4">
          <div className="space-y-3">
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11.5px]">
              <Field label="Incident commander" value={SITUATION_DETAIL.incidentCommander} />
              <Field label="Technical owner" value={SITUATION_DETAIL.technicalOwner} />
              <Field label="Customers impacted" value={impacted.toLocaleString()} />
              <Field label="Error budget impact" value={SITUATION_DETAIL.errorBudgetImpact} />
              <Field label="Estimated restoration" value={`${SITUATION_DETAIL.estimatedRestoration.slice(11, 16)} UTC`} />
              <Field label="Current stage" value={lifecycleStage} />
            </dl>
            <SituationLifecycleTimeline entries={entries} />
          </div>
        </OpsPanel>

        {/* Investigation workspace */}
        <OpsPanel
          title="Agentic Investigation Workspace"
          subtitle={`Evidence coverage ${evidenceCoveragePercent(PRIMARY_SITUATION_ID, requestedEvidence)}% · ${evidence.length} evidence items`}
          className="lg:col-span-4"
        >
          {ranked.length === 0 ? <EmptyState message="No hypotheses for this situation." /> : (
            <ul className="space-y-2">
              {ranked.map((h) => (
                <li key={h.id} className={cn("rounded border p-2.5",
                  h.eliminated ? "border-slate-200 bg-slate-50 opacity-70"
                    : promotedHypothesisId === h.id ? "border-blue-300 bg-blue-50" : "border-slate-200")}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] font-medium text-slate-900">
                      {h.rank}. {h.hypothesis}
                    </p>
                    <span className="shrink-0 text-[11px] text-slate-600">{h.confidence}%</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {h.evidenceStrength} evidence · {h.supportingSignals.length} supporting ·{" "}
                    {h.contradictingSignals.length} contradicting · {h.investigationStatus}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <button type="button"
                      onClick={() => { store.selectHypothesis(h.id); store.setOpenDrawer("evidence"); }}
                      className="rounded border border-slate-200 px-2 py-0.5 text-[11.5px] text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      View evidence
                    </button>
                    <button type="button"
                      onClick={() => (h.eliminated ? store.restoreHypothesis(h.id) : store.eliminateHypothesis(h.id))}
                      className="rounded border border-slate-200 px-2 py-0.5 text-[11.5px] text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      {h.eliminated ? "Restore" : "Eliminate"}
                    </button>
                    <button type="button" disabled={h.eliminated} onClick={() => store.promoteHypothesis(h.id)}
                      className="rounded border border-slate-200 px-2 py-0.5 text-[11.5px] text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      Promote to cause
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={store.requestAdditionalEvidence}
            className="mt-2 rounded border border-slate-200 px-2 py-1 text-[11.5px] text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Request additional evidence
          </button>
        </OpsPanel>

        {/* Governed action centre */}
        <OpsPanel title="Human Approval and Action Center" subtitle="Every action is human accountable"
          className="lg:col-span-4">
          <ul className="space-y-2">
            {agenticActions.map((a) => {
              const r = store.actionRuntimes[a.id];
              return (
                <li key={a.id} className="rounded border border-slate-200 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] font-medium text-slate-900">{a.title}</p>
                    <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[10.5px] font-medium",
                      actionStateTone[r?.state ?? "Recommended"])}>
                      {r?.state ?? "Recommended"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {a.expectedResult} · approver {a.approver} · progress {r?.progressPercent ?? 0}%
                  </p>
                  <button type="button"
                    onClick={() => { store.selectAction(a.id); store.setOpenDrawer("action"); }}
                    disabled={!actionWorkflows.some((w) => w.actionId === a.id)}
                    className="mt-1.5 rounded border border-slate-200 px-2 py-0.5 text-[11.5px] text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    Review and decide
                  </button>
                </li>
              );
            })}
          </ul>
        </OpsPanel>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:items-start">
        <RecoveryValidationPanel
          className="lg:col-span-4"
          results={validationResults}
          validationState={validationState}
          customersImpacted={impacted}
          canRun={validationState === "Not started" || validationState === "Failed"}
          canRollback={canRollback}
          onStart={store.startValidation}
          onPass={store.completeValidation}
          onFail={store.failValidation}
          onRollback={() => store.rollbackAction(actionId)}
        />

        {/* Predictive risk with reroute simulation */}
        <OpsPanel title="Predictive Risk and Reroute Simulation" subtitle="Prevent the incident before customers feel it"
          className="lg:col-span-4">
          <ul className="space-y-2">
            {riskWorkflowRecords
              .filter((r) => !store.dismissedRiskIds.includes(r.riskId))
              .map((r) => (
                <li key={r.riskId} className="rounded border border-slate-200 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] font-medium capitalize text-slate-900">{r.riskId.replace("risk-", "").toUpperCase()}</p>
                    <span className="text-[11px] capitalize text-slate-600">{r.riskLevel} · {r.region}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Margin {r.currentMarginDb.toFixed(1)} dB now, {r.predictedMarginDb.toFixed(1)} dB predicted
                  </p>
                  <p className="text-[11px] text-teal-700">{r.preventiveAction}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <button type="button"
                      onClick={() => { store.selectRisk(r.riskId); store.setOpenDrawer("simulation"); }}
                      disabled={!rerouteSimulations.some((s) => s.riskId === r.riskId)}
                      className="rounded border border-slate-200 px-2 py-0.5 text-[11.5px] text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      Simulate reroute
                    </button>
                    <button type="button" onClick={() => store.dismissRisk(r.riskId)}
                      className="rounded border border-slate-200 px-2 py-0.5 text-[11.5px] text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      Dismiss with reason
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </OpsPanel>

        {/* Error budget windows */}
        <OpsPanel title="Error Budget Burn" subtitle="Updates as recovery is validated" className="lg:col-span-4">
          <TableShell caption="Error budget windows" headers={["Window", "Burn rate", "Budget remaining", "Availability"]}>
            {budgets.map((b) => (
              <tr key={b.window}>
                <td className="px-2 py-1.5 text-slate-800">{b.window}</td>
                <td className={cn("px-2 py-1.5 font-medium", b.burnRate > 2 ? "text-red-600" : "text-green-700")}>
                  {b.burnRate.toFixed(1)}x
                </td>
                <td className="px-2 py-1.5 text-slate-600">{b.budgetRemaining}%</td>
                <td className="px-2 py-1.5 text-slate-600">{b.availability.toFixed(2)}%</td>
              </tr>
            ))}
          </TableShell>
        </OpsPanel>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
        {/* Learning governance */}
        <OpsPanel title="Learning and Improvement Governance" subtitle="Learning is governed, not automatic"
          className="lg:col-span-4">
          {[...learningRecords, ...learningCandidates].length === 0
            ? <EmptyState message="No learning records yet." />
            : (
              <ul className="space-y-2">
                {dedupe([...learningRecords, ...learningCandidates]).map((l) => (
                  <li key={l.id} className="rounded border border-slate-200 p-2.5 text-[11.5px]">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] font-medium text-slate-900">{l.title}</p>
                      <span className="shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-600">
                        {l.governanceState}
                      </span>
                    </div>
                    <p className="text-slate-600">Cause: {l.primaryCause}</p>
                    <p className="text-slate-600">Runbook: {l.runbookChange}</p>
                    <p className="text-slate-600">Monitoring: {l.monitoringImprovement}</p>
                    <p className="text-slate-600">Automation candidate: {l.automationCandidate}</p>
                    <p className="text-slate-500">Owner {l.owner} · due {l.dueDate} · evidence {l.evidenceUsed.join(", ")}</p>
                  </li>
                ))}
              </ul>
            )}
        </OpsPanel>

        {/* Workflow event stream */}
        <OpsPanel
          title="Agentic Operational Event Stream"
          subtitle="Every agent and human decision, in order"
          className="lg:col-span-8"
          action={
            <div className="flex flex-wrap items-center gap-1.5">
              {EVENT_FILTERS.map((f) => (
                <button key={f} type="button" onClick={() => store.setEventFilter(f)} aria-pressed={eventFilter === f}
                  className={cn("rounded border px-1.5 py-0.5 text-[11px]",
                    eventFilter === f ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}>
                  {f}
                </button>
              ))}
              <button type="button"
                onClick={() => exportCsv("sre-agentic-noc-event-stream.csv", [
                  ["Timestamp", "Type", "Object", "Agent", "Human actor", "Result", "Confidence", "Evidence"],
                  ...visibleEvents.map((e) => [
                    e.timestamp, e.type, e.object, e.agent, e.humanActor ?? "",
                    e.result, e.confidence ? `${Math.round(e.confidence * 100)}%` : "", e.evidenceRef ?? "",
                  ]),
                ])}
                className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-600 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                Export
              </button>
            </div>
          }
        >
          {visibleEvents.length === 0
            ? <EmptyState message="No workflow events yet. Advance the scenario or take an action." />
            : (
              <TableShell caption="Workflow events"
                headers={["Time", "Type", "Object", "Agent", "Human", "Result", "Confidence", "Evidence"]}>
                {[...visibleEvents].reverse().map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{e.timestamp.slice(11, 19)}</td>
                    <td className="px-2 py-1.5 text-slate-800">{e.type}</td>
                    <td className="px-2 py-1.5 text-slate-600">{e.object}</td>
                    <td className="px-2 py-1.5 text-slate-600">{e.agent}</td>
                    <td className="px-2 py-1.5 text-slate-600">{e.humanActor ?? "—"}</td>
                    <td className="px-2 py-1.5 text-slate-600">{e.result}</td>
                    <td className="px-2 py-1.5 text-slate-600">{e.confidence ? `${Math.round(e.confidence * 100)}%` : "—"}</td>
                    <td className="px-2 py-1.5 text-slate-600">{e.evidenceRef ?? "—"}</td>
                  </tr>
                ))}
              </TableShell>
            )}
        </OpsPanel>
      </section>

      <EvidenceDrawer
        open={openDrawer === "evidence"}
        onClose={() => store.setOpenDrawer(null)}
        evidence={evidence}
        hypothesisId={selectedHypothesisId}
        hypothesisLabel={ranked.find((h) => h.id === selectedHypothesisId)?.hypothesis ?? "the situation"}
        onRequestMore={store.requestAdditionalEvidence}
      />

      <ActionApprovalDrawer
        open={openDrawer === "action"}
        onClose={() => store.setOpenDrawer(null)}
        action={action}
        workflow={workflow}
        runtime={runtime}
        rollbackAvailable={canRollback}
        onApprove={(approval) => store.approveAction(actionId, approval)}
        onReject={(rejection) => store.rejectAction(actionId, rejection)}
        onRequestMoreEvidence={(note) => store.requestMoreEvidence(actionId, note)}
        onModify={(note) => store.modifyAction(actionId, note)}
        onExecute={() => store.executeAction(actionId)}
        onPause={() => store.pauseAction(actionId)}
        onResume={() => store.resumeAction(actionId)}
        onRollback={() => store.rollbackAction(actionId)}
        onOpenValidation={() => { store.setOpenDrawer(null); store.startValidation(); }}
      />

      <OpsDrawer
        open={openDrawer === "simulation" && !!simulation}
        onClose={() => store.setOpenDrawer(null)}
        title="Reroute simulation"
        subtitle="Deterministic what if analysis before any traffic moves"
        footer={simulation ? (
          <button type="button"
            onClick={() => exportJson("sre-agentic-noc-reroute-simulation.json", simulation)}
            className="rounded border border-slate-200 px-2.5 py-1 text-[12px] text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Export simulation
          </button>
        ) : undefined}
      >
        {simulation && (
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-[12px] sm:grid-cols-2">
            <Field label="Current route" value={simulation.currentRoute} />
            <Field label="Proposed route" value={simulation.proposedRoute} />
            <Field label="Available capacity" value={`${simulation.availableCapacityGbps} Gbps`} />
            <Field label="Projected utilisation" value={`${simulation.projectedUtilizationPercent}%`} />
            <Field label="Projected latency" value={`${simulation.projectedLatencyMs} ms`} />
            <Field label="Customers protected" value={simulation.customersProtected.toLocaleString()} />
            <Field label="Services protected" value={simulation.servicesProtected.join(", ")} />
            <Field label="New risks introduced" value={simulation.newRisksIntroduced.join(", ") || "None"} />
            <Field label="Rollback path" value={simulation.rollbackPath} />
            <Field label="Recommendation" value={simulation.recommendation} />
          </dl>
        )}
      </OpsDrawer>
    </>
  );
}

function dedupe<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)));
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10.5px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </div>
  );
}
