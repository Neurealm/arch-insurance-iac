/**
 * Cognitive Readiness Assessment — signature four region workbench.
 *
 * Region 1 Proposed Work Context · Region 2 Readiness Dimensions
 * Region 3 Context & Evidence     · Region 4 Readiness Finding & Recommendation
 */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pill } from "../persona-studio/primitives";
import { Panel, tone } from "./panels";
import {
  dimensionById, evidenceItems, readinessDimensions, workContext,
  type CognitiveReadinessDimension, type CognitiveReadinessGate,
} from "./data";
import { recommendationFor, type ReadinessComputation, type WorkbenchState } from "./engine";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-1.5">
      <div className="text-[9.5px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-[11.5px] font-medium text-slate-800">{value}</div>
    </div>
  );
}

export function GatesPanel({ gates, onSelect }: {
  gates: CognitiveReadinessGate[]; onSelect?: (g: CognitiveReadinessGate) => void;
}) {
  return (
    <Panel id="panel-gates" title="Readiness Gates"
      subtitle="Gates are evaluated separately from the readiness score. A critical gate failure overrides the average.">
      <ul className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
        {gates.map((g) => (
          <li key={g.id}>
            <button type="button" onClick={() => onSelect?.(g)}
              className="w-full rounded-lg border border-slate-200 p-2 text-left hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[12px] font-semibold text-slate-900">{g.name}</span>
                <Pill label={g.status} tone={tone(g.status)} />
              </div>
              <p className="text-[10.5px] text-slate-500">{g.purpose}</p>
              <p className="mt-1 text-[10.5px] text-slate-700">{g.note}</p>
              <p className="mt-1 text-[10px] text-slate-500">Requires: {g.requires.join(", ")}</p>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ReadinessWorkbench({
  state, computation, selectedDimension, onSelectDimension,
  selectedEvidence, onSelectEvidence, onToggle, spotlight,
}: {
  state: WorkbenchState;
  computation: ReadinessComputation;
  selectedDimension: string;
  onSelectDimension: (id: string) => void;
  selectedEvidence: string | null;
  onSelectEvidence: (id: string) => void;
  onToggle: (patch: Partial<WorkbenchState>, message: string) => void;
  spotlight?: boolean;
}) {
  const dim = dimensionById(selectedDimension);
  const relevantEvidence = evidenceItems.filter((e) => e.affectedDimensions.includes(dim.id));
  const provided = (id: string) => id === "EV 08" ? state.fraudLossAnalysisProvided
    : id === "EV 09" ? state.stressTestProvided
      : evidenceItems.find((e) => e.id === id)?.provided ?? false;

  return (
    <Panel id="panel-workbench" title="Cognitive Readiness Assessment Workbench" spotlight={spotlight}
      subtitle={`${workContext.workItem} · CRA 7001 · four synchronized regions`}
      actions={
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]"
            onClick={() => onToggle({ rollbackDefined: !state.rollbackDefined },
              state.rollbackDefined ? "Rollback information removed" : "Rollback information restored")}>
            {state.rollbackDefined ? "Remove Rollback" : "Restore Rollback"}
          </Button>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]"
            onClick={() => onToggle({ proposedStateDefined: !state.proposedStateDefined },
              state.proposedStateDefined ? "Proposed state removed" : "Proposed state restored")}>
            {state.proposedStateDefined ? "Remove Proposed State" : "Restore Proposed State"}
          </Button>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]"
            onClick={() => onToggle({ trafficExposure: state.trafficExposure === 5 ? 15 : 5 },
              `Traffic exposure set to ${state.trafficExposure === 5 ? 15 : 5}%`)}>
            Traffic {state.trafficExposure}%
          </Button>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]"
            onClick={() => onToggle({ fraudLossAnalysisProvided: !state.fraudLossAnalysisProvided },
              state.fraudLossAnalysisProvided ? "Fraud Loss Analysis removed" : "Fraud Loss Analysis added")}>
            {state.fraudLossAnalysisProvided ? "Remove" : "Add"} Fraud Loss Analysis
          </Button>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]"
            onClick={() => onToggle({ regionalDependencyValidated: !state.regionalDependencyValidated },
              state.regionalDependencyValidated ? "Dependency evidence withdrawn" : "Dependency evidence resolved")}>
            {state.regionalDependencyValidated ? "Unvalidate" : "Resolve"} Dependency Evidence
          </Button>
        </div>
      }>
      <div className="grid gap-2 xl:grid-cols-4">
        {/* REGION 1 */}
        <section aria-label="Proposed work context" className="rounded-lg border border-slate-200 p-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Region 1 · Proposed Work Context</h3>
          <div className="mt-1.5 grid gap-1.5">
            <Field label="Work Item" value={workContext.workItem} />
            <Field label="Submitting Team" value={workContext.submittingTeam} />
            <Field label="Intent" value={workContext.intent} />
            <Field label="Current State" value={workContext.currentState} />
            <Field label="Proposed State" value={state.proposedStateDefined ? workContext.proposedState : "Not defined"} />
            <Field label="Initial Scope" value={`${state.trafficExposure}% traffic`} />
            <Field label="Potential Expansion" value={workContext.potentialExpansion} />
            <Field label="Systems" value={workContext.systems.join(", ")} />
            <Field label="Dependencies" value={workContext.dependencies.join(", ")} />
            <Field label="Rollout" value={workContext.rollout} />
            <Field label="Rollback" value={state.rollbackDefined ? workContext.rollback : "Not defined"} />
            <Field label="Expected Outcome" value={workContext.expectedOutcome} />
          </div>
        </section>

        {/* REGION 2 */}
        <section aria-label="Readiness dimensions" className="rounded-lg border border-slate-200 p-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Region 2 · Readiness Dimensions</h3>
          <ul className="mt-1.5 grid gap-1.5">
            {readinessDimensions.map((d) => {
              const score = computation.dimensionScores[d.id];
              return (
                <li key={d.id}>
                  <button type="button" onClick={() => onSelectDimension(d.id)} aria-pressed={selectedDimension === d.id}
                    className={cn("w-full rounded-lg border p-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      selectedDimension === d.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300")}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11.5px] font-medium text-slate-800">{d.name}</span>
                      <span className={cn("text-[13px] font-bold",
                        score >= 90 ? "text-emerald-600" : score >= 80 ? "text-blue-600" : "text-amber-600")}>{score}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                      <div className={cn("h-1.5 rounded-full", score >= 90 ? "bg-emerald-500" : score >= 80 ? "bg-blue-500" : "bg-amber-500")}
                        style={{ width: `${score}%` }} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* REGION 3 */}
        <section aria-label="Context and evidence" className="rounded-lg border border-slate-200 p-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Region 3 · Context &amp; Evidence</h3>
          <p className="mt-1 text-[11px] font-medium text-slate-800">{dim.name}</p>
          <p className="text-[10.5px] text-slate-500">{dim.question}</p>
          <div className="mt-1.5 overflow-auto rounded border border-slate-200">
            <table className="w-full text-left text-[10.5px]">
              <caption className="sr-only">Context and evidence for {dim.name}</caption>
              <thead className="bg-slate-50 text-[9.5px] uppercase tracking-wide text-slate-500">
                <tr>
                  {["Context Element", "Current", "Required", "Source", "Authority", "Freshness", "Confidence", "Status"].map((h) => (
                    <th key={h} scope="col" className="px-1.5 py-1 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {relevantEvidence.map((e) => {
                  const has = provided(e.id);
                  return (
                    <tr key={e.id} onClick={() => onSelectEvidence(e.id)}
                      className={cn("cursor-pointer hover:bg-slate-50", selectedEvidence === e.id && "bg-blue-50")}>
                      <th scope="row" className="px-1.5 py-1 text-left font-medium text-slate-800">{e.evidence}</th>
                      <td className="px-1.5 py-1">{has ? "Provided" : "Missing"}</td>
                      <td className="px-1.5 py-1">{e.required ? "Required" : "Optional"}</td>
                      <td className="px-1.5 py-1">{e.source}</td>
                      <td className="px-1.5 py-1">{has ? "Authoritative" : "Not provided"}</td>
                      <td className="px-1.5 py-1">{has ? "Current" : "Not provided"}</td>
                      <td className="px-1.5 py-1">{has ? `${e.quality || 90}%` : "0%"}</td>
                      <td className="px-1.5 py-1"><Pill label={has ? "Available" : e.status} tone={tone(has ? "Available" : e.status)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <DimensionDetail dim={dim} score={computation.dimensionScores[dim.id]} />
        </section>

        {/* REGION 4 */}
        <section aria-label="Readiness finding and recommendation" className="rounded-lg border border-slate-200 p-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Region 4 · Readiness Finding</h3>
          <div className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold text-slate-900">Overall</span>
              <Pill label={computation.state} tone={tone(computation.state)} />
            </div>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              <Field label="Score" value={`${computation.score} / 100`} />
              <Field label="Confidence" value={`${computation.confidence}%`} />
              <Field label="Passed Gates" value={`${computation.passedGates} of 4`} />
              <Field label="Warnings" value={String(computation.warnings.length)} />
              <Field label="Blocking Gaps" value={String(computation.blockingGaps.length)} />
              <Field label="Target" value="92" />
            </div>
          </div>

          {computation.overrideReason && (
            <p className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[10.5px] text-amber-800">
              Gate override: {computation.overrideReason}
            </p>
          )}

          <div className="mt-1.5">
            <h4 className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Material Gaps</h4>
            <ul className="mt-1 space-y-1">
              {computation.blockingGaps.map((g) => (
                <li key={g} className="rounded border border-red-200 bg-red-50 px-1.5 py-1 text-[10.5px] text-red-800">{g}</li>
              ))}
              {computation.materialGaps.map((g) => (
                <li key={g} className="rounded border border-slate-200 px-1.5 py-1 text-[10.5px] text-slate-700">{g}</li>
              ))}
              {computation.blockingGaps.length === 0 && computation.materialGaps.length === 0 && (
                <li className="text-[10.5px] text-slate-500">No material gaps.</li>
              )}
            </ul>
          </div>

          <p className="mt-1.5 rounded-lg border border-blue-200 bg-blue-50 p-2 text-[11px] text-blue-900">
            <span className="font-semibold">Recommendation: </span>{recommendationFor(computation)}
          </p>
          <p className="mt-1 rounded-lg border border-slate-300 bg-slate-100 p-2 text-[10.5px] font-semibold uppercase tracking-wide text-slate-700">
            This is not approval of the proposed work.
          </p>

          <div className="mt-1.5">
            <h4 className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Persona Evaluation Readiness</h4>
            <ul className="mt-1 space-y-1">
              {computation.personas.map((p) => (
                <li key={p.persona} className="flex items-center justify-between gap-2 rounded border border-slate-200 px-1.5 py-1">
                  <span className="text-[10.5px] text-slate-700">{p.persona}</span>
                  <Pill label={p.readiness} tone={p.readiness === "Ready" ? "green" : p.readiness.startsWith("Not Evaluable") ? "red" : "amber"} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </Panel>
  );
}

export function DimensionDetail({ dim, score }: { dim: CognitiveReadinessDimension; score: number }) {
  return (
    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
      <h4 className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Dimension Detail</h4>
      <p className="text-[10.5px] text-slate-600">{dim.definition}</p>
      <div className="mt-1 grid grid-cols-3 gap-1.5">
        <Field label="Score" value={String(score)} />
        <Field label="Target" value={String(dim.target)} />
        <Field label="Confidence" value={`${dim.confidence}%`} />
      </div>
      <dl className="mt-1.5 space-y-1 text-[10.5px] text-slate-700">
        <div><dt className="inline font-semibold">Required Context: </dt><dd className="inline">{dim.requiredContext.join(", ")}</dd></div>
        <div><dt className="inline font-semibold">Available Context: </dt><dd className="inline">{dim.availableContext.join(", ")}</dd></div>
        <div><dt className="inline font-semibold">Missing Context: </dt><dd className="inline">{dim.missingContext.join(", ") || "None"}</dd></div>
        <div><dt className="inline font-semibold">Evidence: </dt><dd className="inline">{dim.evidence.join(", ")}</dd></div>
        <div><dt className="inline font-semibold">Warnings: </dt><dd className="inline">{dim.warnings.join(", ") || "None"}</dd></div>
        <div><dt className="inline font-semibold">Blocking Findings: </dt><dd className="inline">{dim.blockingFindings.join(", ") || "None"}</dd></div>
        <div><dt className="inline font-semibold">Affected Personas: </dt><dd className="inline">{dim.affectedPersonas.join(", ")}</dd></div>
        <div><dt className="inline font-semibold">Affected Conditions: </dt><dd className="inline">{dim.affectedConditions.join(", ")}</dd></div>
        <div><dt className="inline font-semibold">Affected Dependencies: </dt><dd className="inline">{dim.affectedDependencies.join(", ")}</dd></div>
        <div><dt className="inline font-semibold">Recommended Remediation: </dt><dd className="inline">{dim.recommendedRemediation} (Prompt 2)</dd></div>
      </dl>
    </div>
  );
}
