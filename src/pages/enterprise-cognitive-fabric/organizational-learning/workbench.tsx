/** Organizational Learning — signature four region synchronized workbench. */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pill, Row } from "../persona-studio/primitives";
import { Panel } from "../cognitive-memory/panels";
import {
  assumptionEvaluations, decisionContext, evidenceRecords, expectations, learningCandidates,
  observations, olTone, optionalEvidence, personaNameById, riskRealizations, variances,
  type OlDerivedState, type OlWorkbenchParams,
} from "./data";

export interface WorkbenchSelection {
  expectationId: string | null;
  observationId: string | null;
  varianceId: string | null;
  candidateId: string;
  conditionId: string | null;
}

export function OrganizationalLearningWorkbench({
  params, derived, selection, onSelect, onParams,
}: {
  params: OlWorkbenchParams;
  derived: OlDerivedState;
  selection: WorkbenchSelection;
  onSelect: (s: Partial<WorkbenchSelection>) => void;
  onParams: (p: Partial<OlWorkbenchParams>) => void;
}) {
  const candidates = learningCandidates.filter((c) => c.analysisId === "OL 9001");
  const activeCandidate = candidates.find((c) => c.id === selection.candidateId) ?? candidates[0];

  const highlightedObservation = selection.observationId
    ?? (selection.expectationId ? observations.find((o) => o.expectedOutcomeId === selection.expectationId)?.id ?? null : null);
  const highlightedVariance = selection.varianceId
    ?? variances.find((v) => v.outcomeObservationId === highlightedObservation)?.id
    ?? null;
  const relatedCandidateIds = highlightedVariance
    ? candidates.filter((c) => c.triggerIds.includes(highlightedVariance) || c.supportingOutcomeIds.includes(highlightedObservation ?? "")).map((c) => c.id)
    : [];
  const highlightedEvidence = new Set<string>([
    ...(highlightedObservation ? observations.find((o) => o.id === highlightedObservation)?.evidenceReferenceIds ?? [] : []),
    ...(highlightedVariance ? variances.find((v) => v.id === highlightedVariance)?.evidenceReferenceIds ?? [] : []),
    ...(activeCandidate?.evidenceReferenceIds ?? []),
  ]);

  const conditionOutcomeTone = (outcome: string) =>
    outcome.startsWith("Succeeded") ? "green" : outcome.startsWith("Failed") ? "red" : "slate";

  return (
    <Panel id="panel-workbench" title="Organizational Learning Workbench"
      subtitle="OL 9001 · Checkout Retry Policy Update · four synchronized regions"
      actions={
        <>
          <Pill label={`Evidence ${derived.evidenceCoverage}%`} tone="blue" />
          <Pill label={`Causal ${derived.causalConfidence}%`} tone={olTone(derived.causalClassification)} />
          <Pill label={derived.serviceState} tone={olTone(derived.serviceState)} />
        </>
      }>
      {/* hypothetical controls */}
      <div className="mb-2 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
        <label className="flex flex-col gap-0.5">
          <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Observation Window</span>
          <select value={params.observationWindow} onChange={(e) => onParams({ observationWindow: e.target.value })}
            className="h-7 rounded border border-slate-200 bg-white px-1.5 text-[11px] text-slate-700">
            {["7 days", "14 days", "30 days", "90 days"].map((w) => <option key={w}>{w}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">
            Hypothetical applicability traffic scope · {params.hypotheticalTraffic}%
          </span>
          <input type="range" min={5} max={100} step={5} value={params.hypotheticalTraffic}
            aria-label="Hypothetical traffic scope"
            onChange={(e) => onParams({ hypotheticalTraffic: Number(e.target.value) })} className="w-56" />
        </label>
        <div className="text-[10.5px] text-slate-500">
          Observed evidence covers exposure up to 15%.
        </div>
      </div>

      {derived.extrapolationWarning && (
        <p className="mb-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-800">
          {derived.extrapolationWarning}
        </p>
      )}
      {derived.windowWarning && (
        <p className="mb-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
          {derived.windowWarning}
        </p>
      )}

      <div className="grid gap-2 xl:grid-cols-4">
        {/* ------------------------------------------------ region 1 */}
        <section aria-label="Original decision context" className="rounded-lg border border-slate-200 p-2">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-[11.5px] font-semibold text-slate-800">1 · Original Decision Context</h3>
            <Pill label="Historical" tone="slate" />
          </div>
          <Row label="Decision" value={decisionContext.decisionId} />
          <Row label="Decision Question" value={decisionContext.decisionQuestion} />
          <Row label="Recorded Decision" value={decisionContext.recordedDecision} />
          <Row label="Selected Alternative" value={decisionContext.selectedAlternative} />
          <Row label="Initial Traffic" value={decisionContext.initialTraffic} />
          <Row label="Maximum without additional approval" value={decisionContext.maximumWithoutApproval} />
          <Row label="Decision Confidence" value={`${decisionContext.decisionConfidence}%`} />

          <p className="mt-1.5 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Decision Conditions</p>
          <ul className="space-y-1">
            {decisionContext.conditions.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => onSelect({ conditionId: selection.conditionId === c.id ? null : c.id })}
                  className={cn("w-full rounded border px-1.5 py-1 text-left text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    selection.conditionId === c.id ? "border-blue-400 bg-blue-50" : "border-slate-100 bg-slate-50 hover:border-slate-300")}>
                  <span className="font-medium text-slate-800">{c.label}</span>
                  {selection.conditionId === c.id && (
                    <span className="mt-0.5 block text-[10.5px] text-slate-600">
                      Outcome: {c.outcome} · Evidence {c.evidence}
                    </span>
                  )}
                  <span className="mt-0.5 block">
                    <Pill label={c.outcome.startsWith("Succeeded") ? "Succeeded" : c.outcome.startsWith("Failed") ? "Failed initially" : "Unresolved"}
                      tone={conditionOutcomeTone(c.outcome)} />
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-1.5 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Relevant Persona Versions</p>
          <div className="flex flex-wrap gap-1">
            {decisionContext.personaVersions.map((p) => <Pill key={p.id} label={p.label} tone="slate" />)}
          </div>

          <p className="mt-1.5 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Applicable Conditions</p>
          <ul className="list-inside list-disc text-[11px] text-slate-600">
            {decisionContext.applicableConditions.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <p className="mt-1.5 rounded border border-slate-200 bg-slate-50 px-1.5 py-1 text-[10.5px] text-slate-600">
            {decisionContext.historicalNote}
          </p>
        </section>

        {/* ------------------------------------------------ region 2 */}
        <section aria-label="Expected versus observed outcomes" className="rounded-lg border border-slate-200 p-2">
          <h3 className="mb-1 text-[11.5px] font-semibold text-slate-800">2 · Expected versus Observed Outcomes</h3>
          <ul className="space-y-1">
            {expectations.map((e, i) => {
              const o = observations[i];
              const active = selection.expectationId === e.id || highlightedObservation === o.id;
              return (
                <li key={e.id}>
                  <div className={cn("rounded border p-1.5", active ? "border-blue-400 bg-blue-50" : "border-slate-100")}>
                    <div className="flex items-start justify-between gap-1">
                      <button type="button" className="text-left text-[11.5px] font-medium text-slate-800 underline-offset-2 hover:underline"
                        onClick={() => onSelect({ expectationId: e.id, observationId: o.id, varianceId: null })}>
                        {e.metric}
                      </button>
                      <Pill label={o.assessment} tone={olTone(o.status)} />
                    </div>
                    <Row label="Baseline" value={e.baseline} />
                    <Row label="Expected" value={`${e.expectedValue} (${e.expectedRange})`} />
                    <Row label="Observed" value={
                      <button type="button" className="text-blue-700 underline"
                        onClick={() => onSelect({ observationId: o.id, expectationId: e.id, varianceId: variances.find((v) => v.outcomeObservationId === o.id)?.id ?? null })}>
                        {o.observedValue}
                      </button>
                    } />
                    {o.note && <Row label="After mitigation" value={o.note} />}
                    <Row label="Confidence" value={`${o.confidence}%`} />
                    <Row label="Evidence" value={o.evidenceReferenceIds.join(", ")} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ------------------------------------------------ region 3 */}
        <section aria-label="Variance and causal analysis" className="rounded-lg border border-slate-200 p-2">
          <h3 className="mb-1 text-[11.5px] font-semibold text-slate-800">3 · Variance and Causal Analysis</h3>
          {variances.map((v, i) => {
            const active = highlightedVariance === v.id;
            return (
              <div key={v.id}
                className={cn("mb-1.5 rounded border p-1.5", active ? "border-blue-400 bg-blue-50" : "border-slate-100")}>
                <button type="button" className="text-left text-[11.5px] font-semibold text-slate-800"
                  onClick={() => onSelect({ varianceId: v.id, observationId: v.outcomeObservationId, expectationId: v.expectedOutcomeId })}>
                  Material Variance {i + 1} · {v.metric}
                </button>
                <Row label="Expected" value={v.expectedValue} />
                <Row label="Observed" value={v.observedValue} />
                <Row label="Direction" value={v.varianceDirection} />
                <Row label="Severity" value={v.materiality} />
                <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Potential Contributors</p>
                <ul className="list-inside list-disc text-[11px] text-slate-600">
                  {v.contributors.map((c) => <li key={c}>{c}</li>)}
                </ul>
                <Row label="Evidence" value={v.evidenceReferenceIds.join(", ")} />
                <Row label="Causal Confidence" value={`${Math.min(v.confidence, derived.causalConfidence)}%`} />
                <p className="mt-1 rounded border border-slate-100 bg-slate-50 px-1.5 py-1 text-[11px] text-slate-700">
                  {v.interpretation}
                </p>
                {v.mitigationEffect && (
                  <p className="mt-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-1 text-[11px] text-emerald-800">
                    Mitigation effect: {v.mitigationEffect}
                  </p>
                )}
                {active && (
                  <div className="mt-1 space-y-1">
                    <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Linked Assumptions</p>
                    {assumptionEvaluations
                      .filter((a) => a.outcomeObservationIds.includes(v.outcomeObservationId))
                      .map((a) => (
                        <p key={a.id} className="text-[11px] text-slate-600">
                          {a.decisionAssumption} · <Pill label={a.validationState} tone={olTone(a.validationState)} />
                        </p>
                      ))}
                    <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Linked Risks and Controls</p>
                    {riskRealizations
                      .filter((r) => r.outcomeObservationIds.includes(v.outcomeObservationId))
                      .map((r) => (
                        <p key={r.id} className="text-[11px] text-slate-600">
                          {r.risk} · materialized {r.materialized} · controls {r.controlIds.join(", ")}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* evidence inclusion / exclusion */}
          <div className="mt-1 rounded border border-slate-200 p-1.5">
            <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Evidence Inclusion</p>
            <ul className="mt-1 max-h-44 space-y-0.5 overflow-y-auto">
              {evidenceRecords.filter((e) => highlightedEvidence.has(e.id) || e.supports.startsWith("OBS") || e.supports.startsWith("VAR")).map((e) => {
                const excluded = params.excludedEvidence.includes(e.id);
                return (
                  <li key={e.id} className={cn("flex items-start justify-between gap-1 rounded px-1 py-0.5",
                    highlightedEvidence.has(e.id) ? "bg-blue-50" : "")}>
                    <label className="flex items-start gap-1 text-[10.5px] text-slate-700">
                      <input type="checkbox" checked={!excluded} aria-label={`Include ${e.id}`}
                        onChange={() => onParams({
                          excludedEvidence: excluded
                            ? params.excludedEvidence.filter((x) => x !== e.id)
                            : [...params.excludedEvidence, e.id],
                        })} />
                      <span>{e.id} · {e.title}</span>
                    </label>
                    <span className="shrink-0 text-[10px] text-slate-400">{e.authority}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Additional Evidence</p>
            <ul className="mt-0.5 space-y-0.5">
              {optionalEvidence.map((e) => {
                const added = params.addedEvidence.includes(e.id);
                return (
                  <li key={e.id} className="flex items-center justify-between gap-1">
                    <span className="text-[10.5px] text-slate-700">{e.id} · {e.title}</span>
                    <Button size="sm" variant={added ? "secondary" : "outline"} className="h-6 px-1.5 text-[10px]"
                      onClick={() => onParams({
                        addedEvidence: added
                          ? params.addedEvidence.filter((x) => x !== e.id)
                          : [...params.addedEvidence, e.id],
                      })}>
                      {added ? "Remove" : "Include"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ------------------------------------------------ region 4 */}
        <section aria-label="Learning candidates" className="rounded-lg border border-slate-200 p-2">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-[11.5px] font-semibold text-slate-800">4 · Learning Candidates</h3>
            <Pill label="Not validated knowledge" tone="amber" />
          </div>
          <ul className="space-y-1.5">
            {candidates.map((c) => {
              const active = selection.candidateId === c.id;
              const related = relatedCandidateIds.includes(c.id);
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => onSelect({ candidateId: c.id })} aria-pressed={active}
                    className={cn("w-full rounded border p-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      active ? "border-blue-400 bg-blue-50" : related ? "border-amber-300 bg-amber-50" : "border-slate-100 hover:border-slate-300")}>
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{c.candidateNumber} · {c.id}</span>
                      <Pill label={c.status} tone={olTone(c.status)} />
                    </div>
                    <p className="text-[11.5px] font-medium leading-tight text-slate-800">{c.title}</p>
                    <Row label="Learning Type" value={c.learningType} />
                    <Row label="Based On" value={c.trigger} />
                    <Row label="Confidence" value={`${Math.min(c.causalConfidence, derived.causalConfidence)}%`} />
                    <Progress value={Math.min(c.causalConfidence, derived.causalConfidence)} className="mt-0.5 h-1.5" />
                    <Row label="Applicability" value={c.applicableScopes.join(" · ")} />
                    <Row label="Potentially Applies To" value={c.affectedTeams.join(", ")} />
                    <Row label="Potential Memory Implications" value={c.potentialMemoryUpdateTypes.join(" · ")} />
                    {c.excludedScopes.length > 0 && (
                      <p className="mt-0.5 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10.5px] text-red-800">
                        Do NOT generalize to: {c.excludedScopes.join(", ")}
                      </p>
                    )}
                    {active && (
                      <p className="mt-1 text-[10.5px] text-slate-600">
                        Supporting outcomes {c.supportingOutcomeIds.join(", ") || "none"} · evidence {c.evidenceReferenceIds.join(", ")} ·
                        affected personas {c.affectedPersonaIds.map(personaNameById).join(", ")}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </Panel>
  );
}
