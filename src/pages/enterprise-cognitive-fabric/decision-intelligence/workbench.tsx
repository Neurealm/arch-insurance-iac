/** Decision Intelligence Workbench — four synchronized regions. */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pill, Row, type Tone } from "../persona-studio/primitives";
import { Panel } from "../cognitive-memory/panels";
import { ListBlock as ListBlockShim } from "./panels";
import {
  alternativesFor, constraintsFor, diTone, magnitudeTone, positionsFor, priorDecisions,
  recommendationBenefits, recommendationCosts, sharedDependencies, strengthenTriggers,
  weakenTriggers, openIssues,
  type DecisionIntelligenceEvaluation, type DerivedDecisionState, type ProposalParams,
} from "./data";

export function DecisionWorkbench({
  evaluation, derived, params, onParams, selectedAlternatives, onToggleAlternative,
  selectedPersona, onSelectPersona, selectedConstraint, onSelectConstraint,
  selectedDependency, onSelectDependency, selectedPrior, onSelectPrior,
}: {
  evaluation: DecisionIntelligenceEvaluation;
  derived: DerivedDecisionState;
  params: ProposalParams;
  onParams: (p: Partial<ProposalParams>) => void;
  selectedAlternatives: string[];
  onToggleAlternative: (id: string) => void;
  selectedPersona: string | null;
  onSelectPersona: (id: string) => void;
  selectedConstraint: string | null;
  onSelectConstraint: (id: string) => void;
  selectedDependency: string | null;
  onSelectDependency: (id: string) => void;
  selectedPrior: string | null;
  onSelectPrior: (id: string) => void;
}) {
  const alts = alternativesFor(evaluation.id);
  const positions = positionsFor(evaluation.id);
  const persona = positions.find((p) => p.personaId === selectedPersona) ?? null;
  const cons = constraintsFor(evaluation.id);
  const preferred = alts.find((a) => a.id === derived.preferredAlternativeId);

  return (
    <Panel id="panel-workbench" title="Decision Intelligence Workbench"
      subtitle={`${evaluation.id} · ${evaluation.workItem} — selections propagate across all four regions`}
      actions={<Pill label={derived.posture} tone={diTone(derived.posture) as Tone} />}>
      <div className="grid grid-cols-1 gap-2 2xl:grid-cols-4 xl:grid-cols-2">

        {/* ------------------------------------------- Region 1 · the question */}
        <section aria-label="Decision question" className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Region 1 · Decision Question</p>
          <p className="mt-1 text-[12.5px] font-semibold text-slate-900">{evaluation.decisionQuestion}</p>
          <dl className="mt-1">
            <Row label="Why Now" value={evaluation.decisionReason} />
            <Row label="Decision Deadline" value={evaluation.decisionDeadline} />
            <Row label="Decision Owner" value={evaluation.decisionOwner} />
            <Row label="Business Objective" value="Improve checkout completion without materially increasing fraud loss, duplicate authorizations, latency, or dependency instability." />
          </dl>
          <Block title="Decision Scope" items={evaluation.scope} tone="blue" />
          <Block title="Out of Scope" items={evaluation.outOfScope} tone="slate" />
          <Block title="Key Assumptions" items={evaluation.assumptions} tone="amber" />

          <div className="mt-2 rounded border border-slate-200 bg-white p-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Proposal Parameters</p>
            <label className="mt-1 block text-[10.5px] text-slate-600">
              Traffic Exposure · {params.trafficExposure}%
              <input type="range" min={1} max={100} step={1} value={params.trafficExposure}
                onChange={(e) => onParams({ trafficExposure: Number(e.target.value) })}
                aria-label="Traffic exposure percentage" className="mt-0.5 w-full" />
            </label>
            <div className="mt-1 flex flex-wrap gap-1">
              {[5, 10, 15, 50, 100].map((v) => (
                <button key={v} type="button" onClick={() => onParams({ trafficExposure: v })}
                  className={cn("rounded border px-1.5 py-0.5 text-[10px]",
                    params.trafficExposure === v ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}>
                  {v}%
                </button>
              ))}
            </div>
            <label className="mt-2 flex items-center gap-1.5 text-[10.5px] text-slate-700">
              <input type="checkbox" checked={params.progressiveRollout}
                onChange={(e) => onParams({ progressiveRollout: e.target.checked })} />
              Progressive rollout enabled
            </label>
            <label className="mt-1 block text-[10.5px] text-slate-600">
              Deployment Window
              <select value={params.deploymentWindow} aria-label="Deployment window"
                onChange={(e) => onParams({ deploymentWindow: e.target.value as ProposalParams["deploymentWindow"] })}
                className="mt-0.5 h-7 w-full rounded border border-slate-200 px-1.5 text-[11px]">
                <option>Standard</option>
                <option>Quarter End Restricted</option>
              </select>
            </label>
            <div className="mt-1.5 space-y-1">
              {derived.jointApprovalRequired && (
                <p className="rounded border border-amber-300 bg-amber-50 px-1.5 py-1 text-[10.5px] font-medium text-amber-900">
                  Joint approval required · exposure above 10% activates Release Governance policy RG-08
                </p>
              )}
              {derived.governanceRestricted && (
                <p className="rounded border border-red-300 bg-red-50 px-1.5 py-1 text-[10.5px] font-medium text-red-900">
                  Quarter end restricted window · Option B and Option C are governance constrained
                </p>
              )}
              {!params.progressiveRollout && (
                <p className="rounded border border-amber-300 bg-amber-50 px-1.5 py-1 text-[10.5px] text-amber-900">
                  Progressive rollout disabled · reversibility {derived.reversibility}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* --------------------------------------- Region 2 · enterprise context */}
        <section aria-label="Enterprise decision context" className="rounded-lg border border-slate-200 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Region 2 · Enterprise Decision Context</p>

          <p className="mt-1 text-[11px] font-semibold text-slate-700">Team Positions</p>
          <ul className="space-y-1">
            {positions.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => onSelectPersona(p.personaId)}
                  className={cn("w-full rounded border px-1.5 py-1 text-left transition hover:border-blue-300",
                    selectedPersona === p.personaId ? "border-blue-400 bg-blue-50" : "border-slate-200")}>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-medium text-slate-800">{p.persona}</span>
                    <Pill label={p.positions[derived.preferredAlternativeId]} tone={diTone(p.positions[derived.preferredAlternativeId]) as Tone} />
                  </div>
                  <p className="text-[10px] text-slate-500">{p.requiredCondition}</p>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-2 text-[11px] font-semibold text-slate-700">Enterprise Conditions</p>
          <ul className="space-y-0.5">
            {cons.filter((c) => c.kind === "Constraint").map((c) => {
              const activated = (c.id === "DCN 5" && derived.jointApprovalRequired) || (c.id === "DCN 6" && derived.governanceRestricted);
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => onSelectConstraint(c.id)}
                    className={cn("w-full rounded border px-1.5 py-0.5 text-left text-[10.5px] transition hover:border-blue-300",
                      selectedConstraint === c.id ? "border-blue-400 bg-blue-50" : activated ? "border-amber-300 bg-amber-50" : "border-slate-200")}>
                    {c.title}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-2 text-[11px] font-semibold text-slate-700">Shared Dependencies</p>
          <div className="flex flex-wrap gap-1">
            {sharedDependencies.map((d) => (
              <button key={d.id} type="button" onClick={() => onSelectDependency(d.id)}
                className={cn("rounded border px-1.5 py-0.5 text-[10.5px]",
                  selectedDependency === d.id ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}>
                {d.name}
              </button>
            ))}
          </div>

          <p className="mt-2 text-[11px] font-semibold text-slate-700">Prior Decision</p>
          <ul className="space-y-1">
            {priorDecisions.slice(0, 1).map((d) => (
              <li key={d.id}>
                <button type="button" onClick={() => onSelectPrior(d.id)}
                  className={cn("w-full rounded border px-1.5 py-1 text-left transition hover:border-blue-300",
                    selectedPrior === d.id ? "border-blue-400 bg-blue-50" : "border-slate-200")}>
                  <p className="text-[11px] font-medium text-slate-800">{d.id} · {d.name}</p>
                  <p className="text-[10px] text-slate-600">Observed {d.observedOutcome}; {d.unexpectedOutcome}</p>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-1 text-[10.5px] text-slate-700">
            LRN 1426 · Strengthen idempotency before broader traffic expansion
          </p>

          {persona && (
            <div className="mt-2 rounded border border-blue-200 bg-blue-50 p-2">
              <p className="text-[10px] uppercase tracking-wide text-blue-700">How {persona.persona} evaluates each alternative</p>
              <ul className="mt-1 space-y-0.5">
                {alts.map((a) => (
                  <li key={a.id} className="text-[10.5px] text-slate-700">
                    <span className="font-medium">{a.code}</span> · <Pill label={persona.positions[a.id]} tone={diTone(persona.positions[a.id]) as Tone} />
                    <span className="ml-1">{persona.benefits[a.id]}</span>
                    <span className="ml-1 text-amber-800">Concern · {persona.concerns[a.id]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ------------------------------------------- Region 3 · the alternatives */}
        <section aria-label="Decision alternatives" className="rounded-lg border border-slate-200 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Region 3 · Decision Alternatives</p>
          <ul className="mt-1 space-y-1.5">
            {alts.map((a) => {
              const selected = selectedAlternatives.includes(a.id);
              const residual = a.id === "ALT 5001 C" ? derived.optionCRisk : a.residualRisk;
              const reversibility = a.id === "ALT 5001 B" ? derived.reversibility : a.reversibility;
              const constrained = derived.governanceRestricted && ["ALT 5001 B", "ALT 5001 C"].includes(a.id);
              return (
                <li key={a.id}>
                  <button type="button" aria-pressed={selected} onClick={() => onToggleAlternative(a.id)}
                    className={cn("w-full rounded-lg border p-2 text-left transition hover:border-blue-300",
                      selected ? "border-blue-400 bg-blue-50" : "border-slate-200",
                      a.id === derived.preferredAlternativeId && "ring-1 ring-blue-400")}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[12px] font-semibold text-slate-900">{a.code} · {a.name}</span>
                      {a.id === derived.preferredAlternativeId && <Pill label="Preferred" tone="blue" />}
                    </div>
                    <p className="text-[10.5px] text-slate-600">{a.description}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Pill label={`Customer ${a.customerBenefit}`} tone={magnitudeTone(a.customerBenefit) === "green" ? "slate" : "blue"} />
                      <Pill label={`Fraud ${a.fraudRisk}`} tone={magnitudeTone(a.fraudRisk) as Tone} />
                      <Pill label={`Reliability ${a.reliabilityImpact}`} tone={magnitudeTone(a.reliabilityImpact) as Tone} />
                      <Pill label={`Dependency ${a.dependencyImpact}`} tone={magnitudeTone(a.dependencyImpact) as Tone} />
                      <Pill label={`Complexity ${a.operationalImpact}`} tone={magnitudeTone(a.operationalImpact) as Tone} />
                      <Pill label={`Reversibility ${reversibility}`} tone={reversibility === "High" ? "green" : reversibility === "Medium" ? "amber" : "red"} />
                      <Pill label={`Residual ${residual}`} tone={magnitudeTone(residual) as Tone} />
                      <Pill label={`Evidence ${a.evidenceRequirement}`} tone={magnitudeTone(a.evidenceRequirement) as Tone} />
                      <Pill label={`Opportunity Cost ${a.opportunityCost}`} tone={magnitudeTone(a.opportunityCost) as Tone} />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Governance · {a.governanceRequirement}{constrained ? " · blocked by quarter end restriction" : ""}
                    </p>
                    {selectedDependency && (
                      <p className="mt-0.5 text-[10px] text-amber-800">
                        {sharedDependencies.find((d) => d.id === selectedDependency)?.name}: {a.dependencyImpact} exposure under this alternative
                      </p>
                    )}
                    {selectedConstraint && (
                      <p className="mt-0.5 text-[10px] text-blue-700">
                        {cons.find((c) => c.id === selectedConstraint)?.affectedAlternativeIds.includes(a.id)
                          ? "Constrained by the selected condition"
                          : "Not constrained by the selected condition"}
                      </p>
                    )}
                    {selectedPrior && (
                      <p className="mt-0.5 text-[10px] text-slate-600">
                        Prior comparison · {priorDecisions.find((d) => d.id === selectedPrior)?.lesson}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ------------------------------- Region 4 · recommendation and tradeoffs */}
        <section aria-label="Recommendation and tradeoffs" className="rounded-lg border border-blue-200 bg-blue-50/40 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">Region 4 · Recommendation & Tradeoffs</p>
          <p className="mt-1 text-[16px] font-bold uppercase text-slate-900">{derived.posture}</p>
          <p className="text-[11.5px] text-slate-700">Preferred Alternative · {preferred?.code} · {preferred?.name}</p>
          <p className="mt-0.5 text-[11px] text-slate-600">Recommendation Confidence {derived.confidence}% · Evidence coverage {derived.evidenceCoverage}%</p>
          <p className="mt-1 text-[11px] text-slate-700">
            Why · Best balance of customer completion opportunity, reversibility, dependency containment, fraud monitoring, and governed traffic expansion.
          </p>
          <ListBlockShim title="Primary Benefits" tone="emerald" items={recommendationBenefits} />
          <ListBlockShim title="Primary Costs" tone="amber" items={recommendationCosts} />
          <ListBlockShim title="Required Conditions" tone="blue" items={derived.activeConditions} />
          <ListBlockShim title="Remaining Open Issues" tone="red" items={openIssues} />
          <ListBlockShim title="Would Weaken If" tone="red" items={weakenTriggers} />
          <ListBlockShim title="Would Strengthen If" tone="emerald" items={strengthenTriggers} />
          {selectedAlternatives.length > 0 && (
            <div className="mt-2 rounded border border-slate-200 bg-white p-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Selected alternative comparison</p>
              <ul className="mt-0.5 space-y-0.5">
                {selectedAlternatives.map((id) => {
                  const a = alts.find((x) => x.id === id);
                  if (!a) return null;
                  return (
                    <li key={id} className="text-[10.5px] text-slate-700">
                      <span className="font-medium">{a.code}</span> · time to benefit {a.timeToBenefit} · coordination {a.coordinationCost} · effort {a.implementationEffort} · confidence {a.confidence}%
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="mt-2 flex gap-1">
            <Button size="sm" variant="outline" className="h-7 text-[11px]"
              onClick={() => document.getElementById("panel-comparison")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              Open Alternative Comparison
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]"
              onClick={() => document.getElementById("panel-evidence")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              Open Evidence
            </Button>
          </div>
        </section>
      </div>
    </Panel>
  );
}

function Block({ title, items, tone }: { title: string; items: string[]; tone: "blue" | "slate" | "amber" }) {
  const map = { blue: "text-blue-800", slate: "text-slate-600", amber: "text-amber-800" } as const;
  return (
    <div className="mt-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className={cn("mt-0.5 space-y-0.5 text-[10.5px]", map[tone])}>
        {items.map((i) => <li key={i}>· {i}</li>)}
      </ul>
    </div>
  );
}
