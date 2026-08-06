/** Decision Intelligence — Prompt 2 operational panels. */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Pill, Row, type Tone } from "../persona-studio/primitives";
import { Panel, EmptyState } from "../cognitive-memory/panels";
import {
  alternativesFor, diTone, magnitudeTone, type Magnitude, type PersonaPosition,
} from "./data";
import {
  alternativeCode, comparisonDimensions, compareVersions, emptyHandoff, personaNameById,
  positionDelta, rawVsMitigated, recommendationVsDecision, registeredOutcomes, requiredControls,
  scenarioDimensionValue, scenarioState, seedAudit, seedRefinements, sensitivityAnalysis,
  thresholdAnalysis, trafficOptions, retryOptions, timingOptions, observationOptions,
  type DecisionAcknowledgement, type DecisionApproval, type DecisionContextSnapshot,
  type DecisionDissent, type DecisionEscalation, type DecisionMitigation, type DecisionRecord,
  type DecisionReview, type DecisionScenarioParams, type DecisionScenarioState, type DecisionScope,
  type DecisionVersion, type DeltaLabel, type ExecutionHandoff, type NamedScenario,
  type DecisionNotification, type ObservationContract, type OpsActivity, type ReadinessMetric,
  type ReadinessState, type RecommendationChallenge, type StoryStep, scopeRecalculation,
} from "./ops-data";

/* ---------------------------------------------------------------- helpers - */

export function SimpleTable({ head, rows, caption }: { head: string[]; rows: React.ReactNode[][]; caption?: string }) {
  if (!rows.length) return <EmptyState message="No records match the current state" />;
  return (
    <div className="overflow-x-auto rounded border border-slate-200">
      <table className="w-full min-w-[720px] border-collapse text-left">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-50">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={cn("border-t border-slate-100", i % 2 ? "bg-slate-50/40" : "bg-white")}>
              {r.map((c, j) => <td key={j} className="px-2 py-1.5 text-[11px] text-slate-700">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const deltaTone = (d: DeltaLabel): Tone =>
  d === "Improved" || d === "Resolved Requirement" ? "green"
    : d === "Worsened" ? "red" : d === "New Requirement" ? "amber" : "slate";

const Chips = ({ items, tone = "slate" }: { items: string[]; tone?: Tone }) => (
  <div className="flex flex-wrap gap-1">{items.map((i) => <Pill key={i} label={i} tone={tone} />)}</div>
);

/* ------------------------------------------------------------------ scope - */

export function DecisionScopePanel({ scope, onEdit }: { scope: DecisionScope; onEdit: () => void }) {
  const recalc = useMemo(() => scopeRecalculation(scope), [scope]);
  return (
    <Panel id="panel-scope" title="Decision Scope"
      subtitle="Scope defines what this decision may change. Editing scope recalculates the dependent decision context"
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onEdit}>Edit Scope</Button>}>
      <div className="grid gap-2 lg:grid-cols-2">
        <dl>
          <Row label="Question" value={scope.question} />
          <Row label="Owner" value={scope.owner} />
          <Row label="Deadline" value={scope.deadline} />
          <Row label="Business Objective" value={scope.businessObjective} />
          <Row label="In Scope" value={<Chips items={scope.inScope} tone="blue" />} />
          <Row label="Out of Scope" value={<Chips items={scope.outOfScope} />} />
        </dl>
        <dl>
          <Row label="Affected Teams" value={<Chips items={scope.affectedTeams} tone="blue" />} />
          <Row label="Affected Systems" value={<Chips items={scope.affectedSystems} />} />
          <Row label="Affected Services" value={<Chips items={scope.affectedServices} />} />
          <Row label="Customer Journeys" value={<Chips items={scope.customerJourneys} />} />
          <Row label="Decision Boundaries" value={<Chips items={scope.boundaries} tone="amber" />} />
          <Row label="Assumptions" value={<Chips items={scope.assumptions} tone="amber" />} />
        </dl>
      </div>
      <p className="mt-2 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Recalculated by the current scope</p>
      <SimpleTable head={["Area", "Result"]} rows={recalc.map((r) => [r.area, r.value])} caption="Scope recalculation" />
    </Panel>
  );
}

/* ------------------------------------------------------ scenario simulator - */

function ControlGroup({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <fieldset className="rounded border border-slate-200 p-1.5">
      <legend className="px-1 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">{label}</legend>
      <div className="flex flex-wrap gap-1">{children}</div>
      {hint && <p className="mt-0.5 text-[10px] text-slate-500">{hint}</p>}
    </fieldset>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cn("rounded border px-2 py-0.5 text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        active ? "border-blue-400 bg-blue-50 font-semibold text-blue-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
      {children}
    </button>
  );
}

export function ScenarioSimulatorPanel({
  params, onChange, state, onReset,
}: {
  params: DecisionScenarioParams;
  onChange: (p: Partial<DecisionScenarioParams>) => void;
  state: DecisionScenarioState;
  onReset: () => void;
}) {
  return (
    <Panel id="panel-scenario-simulator" title="Decision Scenario Simulator"
      subtitle="Change proposal parameters locally. The source Cross Team package is never modified"
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onReset}>Reset Scenario</Button>}>
      <p className="mb-1.5 text-[11px] text-slate-600">
        Modelling <span className="font-semibold">{alternativeCode(params.alternativeId)} · Three Retries with Segmented Rollout</span>
      </p>
      <div className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-4">
        <ControlGroup label="Retry Attempts">
          {retryOptions.map((r) => <Choice key={r} active={params.retryAttempts === r} onClick={() => onChange({ retryAttempts: r })}>{r}</Choice>)}
        </ControlGroup>
        <ControlGroup label="Traffic Exposure">
          {trafficOptions.map((t) => <Choice key={t} active={params.trafficExposure === t} onClick={() => onChange({ trafficExposure: t })}>{t}%</Choice>)}
        </ControlGroup>
        <ControlGroup label="Deployment Timing">
          {timingOptions.map((t) => <Choice key={t} active={params.deploymentTiming === t} onClick={() => onChange({ deploymentTiming: t })}>{t}</Choice>)}
        </ControlGroup>
        <ControlGroup label="Progressive Rollout">
          <Choice active={params.progressiveRollout} onClick={() => onChange({ progressiveRollout: true })}>Enabled</Choice>
          <Choice active={!params.progressiveRollout} onClick={() => onChange({ progressiveRollout: false })}>Disabled</Choice>
        </ControlGroup>
        <ControlGroup label="Idempotency Evidence">
          <Choice active={params.idempotencyEvidence === "Validated"} onClick={() => onChange({ idempotencyEvidence: "Validated" })}>Validated</Choice>
          <Choice active={params.idempotencyEvidence === "Missing"} onClick={() => onChange({ idempotencyEvidence: "Missing" })}>Missing</Choice>
        </ControlGroup>
        <ControlGroup label="Fraud Loss Analysis">
          <Choice active={params.fraudLossAnalysis === "Provided"} onClick={() => onChange({ fraudLossAnalysis: "Provided" })}>Provided</Choice>
          <Choice active={params.fraudLossAnalysis === "Missing"} onClick={() => onChange({ fraudLossAnalysis: "Missing" })}>Missing</Choice>
        </ControlGroup>
        <ControlGroup label="Dependency Stress Test">
          <Choice active={params.dependencyStressTest === "Provided"} onClick={() => onChange({ dependencyStressTest: "Provided" })}>Provided</Choice>
          <Choice active={params.dependencyStressTest === "Missing"} onClick={() => onChange({ dependencyStressTest: "Missing" })}>Missing</Choice>
        </ControlGroup>
        <ControlGroup label="Rollback Capability">
          <Choice active={params.rollbackCapability === "Available"} onClick={() => onChange({ rollbackCapability: "Available" })}>Available</Choice>
          <Choice active={params.rollbackCapability === "Unavailable"} onClick={() => onChange({ rollbackCapability: "Unavailable" })}>Unavailable</Choice>
        </ControlGroup>
        <ControlGroup label="Observation Window">
          {observationOptions.map((o) => <Choice key={o} active={params.observationWindow === o} onClick={() => onChange({ observationWindow: o })}>{o}</Choice>)}
        </ControlGroup>
      </div>

      <div className="mt-2 grid gap-2 lg:grid-cols-3">
        <dl>
          <Row label="Alternative Profile" value={`${alternativeCode(params.alternativeId)} · ${params.retryAttempts} retries at ${params.trafficExposure}%`} />
          <Row label="Customer Benefit" value={<Pill label={state.customerBenefit} tone={magnitudeTone(state.customerBenefit) as Tone} />} />
          <Row label="Business Benefit" value={<Pill label={state.businessBenefit} tone={magnitudeTone(state.businessBenefit) as Tone} />} />
          <Row label="Reversibility" value={<Pill label={state.reversibilityAdjusted} tone={magnitudeTone(state.reversibilityAdjusted) as Tone} />} />
          <Row label="Expected Completion Lift" value={state.expectedCompletionLift} />
        </dl>
        <dl>
          <Row label="Fraud Risk" value={<Pill label={state.fraudRisk} tone={magnitudeTone(state.fraudRisk) as Tone} />} />
          <Row label="Dependency Risk" value={<Pill label={state.dependencyRisk} tone={magnitudeTone(state.dependencyRisk) as Tone} />} />
          <Row label="Duplicate Authorization Risk" value={<Pill label={state.duplicateAuthRisk} tone={magnitudeTone(state.duplicateAuthRisk) as Tone} />} />
          <Row label="Operational Complexity" value={<Pill label={state.operationalComplexity} tone={magnitudeTone(state.operationalComplexity) as Tone} />} />
          <Row label="Coordination Cost" value={<Pill label={state.coordinationCost} tone={magnitudeTone(state.coordinationCost) as Tone} />} />
        </dl>
        <dl>
          <Row label="Recommendation" value={<Pill label={state.posture} tone={diTone(state.posture) as Tone} />} />
          <Row label="Confidence" value={`${state.confidence}%`} />
          <Row label="Evidence Coverage" value={`${state.evidenceCoverage}%`} />
          <Row label="Approval Requirements" value={`${state.approvalRequirements.length} stages`} />
          <Row label="Evidence Gaps" value={state.evidenceGaps.length ? `${state.evidenceGaps.length} open` : "None"} />
        </dl>
      </div>

      <div className="mt-2 grid gap-2 lg:grid-cols-3">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Persona Positions</p>
          <ul className="mt-0.5 space-y-0.5">
            {Object.entries(state.personaPositions).map(([id, pos]) => (
              <li key={id} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-600">{personaNameById(id)}</span>
                <Pill label={pos} tone={diTone(pos) as Tone} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Governance and Approval</p>
          <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[11px] text-slate-600">
            {state.governanceRequirements.map((g) => <li key={g}>{g}</li>)}
            {state.approvalRequirements.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Evidence Gaps and Notes</p>
          {state.evidenceGaps.length === 0 && state.notes.length === 0
            ? <p className="mt-0.5 text-[11px] text-emerald-700">No open evidence gaps at the current scenario</p>
            : (
              <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[11px] text-slate-600">
                {state.evidenceGaps.map((g) => <li key={g}>{g}</li>)}
                {state.notes.map((n) => <li key={n}>{n}</li>)}
              </ul>
            )}
        </div>
      </div>
    </Panel>
  );
}

/* ----------------------------------------------------- scenario comparison - */

export function ScenarioComparisonPanel({
  scenarios, current,
}: { scenarios: NamedScenario[]; current: DecisionScenarioParams }) {
  const states = useMemo(() => scenarios.map((s) => ({ s, st: scenarioState(s.params) })), [scenarios]);
  const currentState = useMemo(() => scenarioState(current), [current]);
  const baseline = states[0]?.st;

  return (
    <Panel id="panel-scenario-comparison" title="Decision Scenario Comparison"
      subtitle="Scenarios are compared across enterprise dimensions. No scenario is selected automatically from a numeric score">
      <p className="sr-only">
        Text summary. {states.map(({ s, st }) => `${s.name}: ${s.description}. Recommendation ${st.posture} at ${st.confidence} percent confidence.`).join(" ")}
      </p>
      <SimpleTable
        caption="Scenario comparison across enterprise dimensions"
        head={["Dimension", ...states.map(({ s }) => `${s.name} · ${s.description}`), "Current Scenario"]}
        rows={comparisonDimensions.map((d) => [
          <span key="d" className="font-medium text-slate-700">{d}</span>,
          ...states.map(({ st }, i) => <span key={i}>{scenarioDimensionValue(d, st)}</span>),
          <span key="cur" className="font-semibold text-blue-700">{scenarioDimensionValue(d, currentState)}</span>,
        ])}
      />
      <p className="mt-2 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Persona position changes relative to Scenario A</p>
      <SimpleTable
        caption="Persona position changes across scenarios"
        head={["Persona", ...states.map(({ s }) => s.name), "Current Scenario"]}
        rows={Object.keys(currentState.personaPositions).map((pid) => [
          personaNameById(pid),
          ...states.map(({ st }, i) => {
            const pos = st.personaPositions[pid];
            const delta = baseline ? positionDelta(baseline.personaPositions[pid], pos) : "Unchanged";
            return (
              <span key={i} className="flex flex-wrap items-center gap-1">
                <Pill label={pos} tone={diTone(pos) as Tone} />
                {i > 0 && <Pill label={delta} tone={deltaTone(delta)} />}
              </span>
            );
          }),
          <span key="cur" className="flex flex-wrap items-center gap-1">
            <Pill label={currentState.personaPositions[pid]} tone={diTone(currentState.personaPositions[pid]) as Tone} />
            {baseline && <Pill label={positionDelta(baseline.personaPositions[pid], currentState.personaPositions[pid])}
              tone={deltaTone(positionDelta(baseline.personaPositions[pid], currentState.personaPositions[pid]))} />}
          </span>,
        ])}
      />
      <p className="mt-1.5 text-[10.5px] text-slate-500">
        Scenario selection remains a human judgement. The comparison describes consequences rather than ranking them.
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------ sensitivity - */

export function SensitivityPanel({ params }: { params: DecisionScenarioParams }) {
  const rows = useMemo(() => sensitivityAnalysis(params), [params]);
  return (
    <Panel id="panel-sensitivity" title="Decision Sensitivity Analysis"
      subtitle="What assumptions or inputs have the greatest ability to change the recommendation">
      <SimpleTable
        caption="Sensitivity of the recommendation to each variable"
        head={["Variable", "Current Value", "Threshold", "Sensitivity", "Affected Alternatives", "Affected Personas", "Affected Conditions", "Recommendation Effect"]}
        rows={rows.map((r) => [
          <span key="v" className="font-medium text-slate-700">{r.variable}</span>,
          r.currentValue, r.threshold,
          <Pill key="s" label={r.sensitivity} tone={diTone(r.sensitivity) as Tone} />,
          r.affectedAlternativeIds.map(alternativeCode).join(", "),
          r.affectedPersonaIds.map(personaNameById).join(", "),
          r.affectedConditionIds.join(", "),
          r.recommendationEffect,
        ])}
      />
    </Panel>
  );
}

/* -------------------------------------------------------------- thresholds - */

export function ThresholdPanel({ params }: { params: DecisionScenarioParams }) {
  const rows = useMemo(() => thresholdAnalysis(params), [params]);
  return (
    <Panel id="panel-thresholds" title="Decision Thresholds"
      subtitle="Thresholds that materially change the decision context when crossed">
      <SimpleTable
        caption="Decision thresholds and distance to each threshold"
        head={["Threshold", "Current Value", "Distance", "State", "Affected Alternatives", "Affected Personas", "Action if Crossed", "Evidence"]}
        rows={rows.map((t) => [
          <span key="t" className="font-medium text-slate-700">{t.threshold}</span>,
          t.currentValue, t.distance,
          <Pill key="s" label={t.crossed ? "Crossed" : "Not crossed"} tone={t.crossed ? "red" : "green"} />,
          t.affectedAlternativeIds.map(alternativeCode).join(", "),
          t.affectedPersonaIds.map(personaNameById).join(", "),
          t.actionIfCrossed, t.evidence,
        ])}
      />
    </Panel>
  );
}

/* ------------------------------------------------------------- refinement - */

export function AlternativeRefinementPanel({
  refinements, onCreate, onCompare, comparedId,
}: {
  refinements: typeof seedRefinements;
  onCreate: () => void;
  onCompare: (id: string) => void;
  comparedId: string | null;
}) {
  return (
    <Panel id="panel-refinement" title="Alternative Refinement"
      subtitle="Derived alternatives never overwrite the alternative they were derived from"
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onCreate}>Create Refined Alternative</Button>}>
      <SimpleTable
        caption="Derived alternatives"
        head={["Code", "Name", "Derived From", "Changes", "Traffic Cap", "Observation", "Required Evidence", "Created", "Action"]}
        rows={refinements.map((r) => [
          <span key="c" className="font-medium text-slate-700">{r.code}</span>,
          r.name, alternativeCode(r.derivedFromId), r.changes.join(" · "), `${r.trafficCap}%`,
          r.observationWindow, r.requiredEvidence.join(", ") || "None", r.createdAt,
          <Button key="a" size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onCompare(r.id)}>
            {comparedId === r.id ? "Comparing" : "Compare"}
          </Button>,
        ])}
      />
      {comparedId && (
        <p className="mt-1.5 text-[11px] text-blue-700">
          {alternativeCode(comparedId)} is applied to the scenario simulator. The original alternative remains unchanged.
        </p>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------ mitigations - */

export function MitigationPlannerPanel({
  mitigations, applied, onAction,
}: {
  mitigations: DecisionMitigation[];
  applied: string[];
  onAction: (m: DecisionMitigation, action: string) => void;
}) {
  return (
    <Panel id="panel-mitigations" title="Decision Mitigation Planner"
      subtitle="Mitigations reduce residual risk without erasing the original risk">
      <SimpleTable
        caption="Mitigation planner"
        head={["Applied", "Mitigation", "Alternatives", "Personas Benefiting", "Risks Reduced", "Tradeoffs Created", "Evidence Required", "Owner", "Raw", "Residual", "Confidence", "Status", "Actions"]}
        rows={mitigations.map((m) => [
          <input key="ap" type="checkbox" aria-label={`Apply ${m.title}`} checked={applied.includes(m.id)} onChange={() => onAction(m, "toggle")} />,
          <span key="t" className="font-medium text-slate-700">{m.title}</span>,
          alternativeCode(m.alternativeId),
          m.benefitingPersonaIds.map(personaNameById).join(", ") || "—",
          m.affectedRiskIds.join(", "),
          m.tradeoffsCreated.join(" · "),
          m.requiredEvidenceIds.join(", ") || "None",
          m.owner,
          <Pill key="r" label={m.rawSeverity} tone={magnitudeTone(m.rawSeverity) as Tone} />,
          <Pill key="rr" label={m.residualSeverity} tone={magnitudeTone(m.residualSeverity) as Tone} />,
          `${m.confidence}%`,
          <Pill key="s" label={m.status} tone={diTone(m.status) as Tone} />,
          <span key="a" className="flex flex-wrap gap-1">
            {["Accept", "Reject", "Edit", "Assign Owner", "Request Evidence"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAction(m, a)}>{a}</Button>
            ))}
          </span>,
        ])}
      />
    </Panel>
  );
}

export function MitigationTradeoffPanel({ mitigations }: { mitigations: DecisionMitigation[] }) {
  return (
    <Panel id="panel-mitigation-tradeoffs" title="Mitigation Tradeoff Analysis"
      subtitle="Every mitigation gives something to one team and asks something of another">
      <SimpleTable
        caption="Mitigation tradeoffs"
        head={["Mitigation", "Benefits", "Costs", "Personas Benefiting", "Personas Adversely Affected", "Residual Risk Change", "Recommendation Effect", "Confidence"]}
        rows={mitigations.map((m) => [
          <span key="t" className="font-medium text-slate-700">{m.title}</span>,
          m.benefits.join(" · "),
          m.costs.join(" · "),
          m.benefitingPersonaIds.map(personaNameById).join(", ") || "—",
          m.adverselyAffectedPersonaIds.map(personaNameById).join(", ") || "None",
          <span key="rr" className="flex items-center gap-1">
            <Pill label={m.rawSeverity} tone={magnitudeTone(m.rawSeverity) as Tone} />
            <span aria-hidden>→</span>
            <Pill label={m.residualSeverity} tone={magnitudeTone(m.residualSeverity) as Tone} />
          </span>,
          m.recommendationEffect,
          `${m.confidence}%`,
        ])}
      />
    </Panel>
  );
}

export function RawVsMitigatedPanel({ applied }: { applied: string[] }) {
  const [mode, setMode] = useState<"raw" | "mitigated">("mitigated");
  const rows = useMemo(() => rawVsMitigated(applied), [applied]);
  return (
    <Panel id="panel-raw-mitigated" title="Raw versus Mitigated Alternative Impact"
      subtitle="Original risk is always preserved alongside residual risk"
      actions={
        <div className="flex rounded border border-slate-200 p-0.5" role="group" aria-label="Impact view">
          {(["raw", "mitigated"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}
              className={cn("rounded px-2 py-0.5 text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                mode === m ? "bg-blue-600 text-white" : "text-slate-600")}>
              {m === "raw" ? "Raw Alternative Impact" : "Mitigated Alternative Impact"}
            </button>
          ))}
        </div>
      }>
      <SimpleTable
        caption="Raw versus mitigated risk"
        head={["Alternative", "Risk", "Original Risk", "Mitigation", "Residual Risk", "Confidence", "Note"]}
        rows={rows.map((r) => [
          r.alternative, r.risk,
          <Pill key="raw" label={r.rawSeverity} tone={magnitudeTone(r.rawSeverity) as Tone} />,
          mode === "raw" ? "Not applied in this view" : r.mitigation,
          mode === "raw"
            ? <Pill key="n" label="Not applied" tone="slate" />
            : <Pill key="res" label={r.residualSeverity} tone={magnitudeTone(r.residualSeverity) as Tone} />,
          `${r.confidence}%`,
          mode === "raw" ? "Raw view preserves the unmitigated position" : r.note,
        ])}
      />
    </Panel>
  );
}

/* ---------------------------------------------------------- review queue -- */

export function ReviewQueuePanel({
  reviews, onOpen, onAction,
}: {
  reviews: DecisionReview[];
  onOpen: (r: DecisionReview) => void;
  onAction: (r: DecisionReview, action: string) => void;
}) {
  const counts = {
    total: reviews.length,
    critical: reviews.filter((r) => r.severity === "Critical").length,
    high: reviews.filter((r) => r.severity === "High").length,
    medium: reviews.filter((r) => r.severity === "Medium").length,
  };
  return (
    <Panel id="panel-review-queue" title="Decision Review Queue"
      subtitle="Human review is required before a decision can be recorded">
      <div className="mb-1.5 flex flex-wrap gap-1.5">
        <Pill label={`Reviews Required ${counts.total}`} tone="blue" />
        <Pill label={`Critical ${counts.critical}`} tone="red" />
        <Pill label={`High ${counts.high}`} tone="amber" />
        <Pill label={`Medium ${counts.medium}`} tone="slate" />
      </div>
      <SimpleTable
        caption="Decision review queue"
        head={["Review ID", "Decision", "Review Type", "Reviewer", "Decision Role", "Issue", "Severity", "Evidence Coverage", "Due", "Status", "Outcome", "Actions"]}
        rows={reviews.map((r) => [
          <button key="id" type="button" onClick={() => onOpen(r)}
            className="font-semibold text-blue-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{r.id}</button>,
          r.decisionName, r.reviewType, r.reviewer, r.reviewerRole, r.issue,
          <Pill key="sev" label={r.severity} tone={diTone(r.severity) as Tone} />,
          `${r.evidenceCoverage}%`, r.dueAt,
          <Pill key="st" label={r.status} tone={diTone(r.status) as Tone} />,
          r.decision === "Not Started" ? "—" : r.decision,
          <span key="a" className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onOpen(r)}>Open Review</Button>
            {["Acknowledge", "Request Evidence", "Comment", "Approve Context", "Challenge Recommendation", "Escalate"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAction(r, a)}>{a}</Button>
            ))}
          </span>,
        ])}
      />
    </Panel>
  );
}

/* -------------------------------------------------------- acknowledgement -- */

export function AcknowledgementPanel({
  acks, onAcknowledge,
}: { acks: DecisionAcknowledgement[]; onAcknowledge: (id: string) => void }) {
  return (
    <Panel id="panel-acknowledgement" title="Team Decision Acknowledgement"
      subtitle="Acknowledgement records that a team understands the decision context. Acknowledgement is not approval">
      <SimpleTable
        caption="Team acknowledgement"
        head={["Team", "Persona Version", "Position", "Required Condition", "Acknowledgement", "Comments", "Timestamp", "Action"]}
        rows={acks.map((a) => [
          <span key="t" className="font-medium text-slate-700">{a.team}</span>,
          a.personaVersion,
          <Pill key="p" label={a.position} tone={diTone(a.position) as Tone} />,
          a.requiredCondition,
          <Pill key="s" label={a.status} tone={diTone(a.status) as Tone} />,
          a.comments || "—", a.acknowledgedAt ?? "Not acknowledged",
          a.status === "Acknowledged"
            ? <span key="d" className="text-[10.5px] text-slate-500">Recorded</span>
            : <Button key="b" size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onAcknowledge(a.id)}>Acknowledge</Button>,
        ])}
      />
    </Panel>
  );
}

/* --------------------------------------------------------------- approvals - */

export function ApprovalChainPanel({
  approvals, derivedRequirements, onOpen,
}: {
  approvals: DecisionApproval[];
  derivedRequirements: string[];
  onOpen: (a: DecisionApproval) => void;
}) {
  const stages = [...new Set(approvals.map((a) => a.approvalStage))];
  return (
    <Panel id="panel-approvals" title="Decision Approval Chain"
      subtitle="Approval requirements derive from decision type, impact, exposure, dependencies and policy conditions">
      <p className="mb-1.5 text-[10.5px] text-slate-500">Currently derived requirements: {derivedRequirements.join(" · ")}</p>
      <div className="space-y-2">
        {stages.map((stage) => (
          <div key={stage} className="rounded border border-slate-200">
            <p className="border-b border-slate-100 bg-slate-50 px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-600">{stage}</p>
            <SimpleTable
              caption={`${stage} approvals`}
              head={["Approver", "Role", "Status", "Decision", "Submitted", "Due", "Completed", "Conditions", "Comments", "Action"]}
              rows={approvals.filter((a) => a.approvalStage === stage).map((a) => [
                <span key="ap" className="font-medium text-slate-700">{a.approver}</span>,
                a.approverRole,
                <Pill key="s" label={a.status} tone={diTone(a.status) as Tone} />,
                a.decision || "—", a.submittedAt ?? "—", a.dueAt, a.completedAt ?? "—",
                a.conditions.length ? a.conditions.join(" · ") : "None",
                a.comments || "—",
                <Button key="b" size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onOpen(a)}>Record Approval</Button>,
              ])}
            />
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ----------------------------------------------------------------- dissent - */

export function DissentPanel({ dissents, onAdd }: { dissents: DecisionDissent[]; onAdd: () => void }) {
  return (
    <Panel id="panel-dissent" title="Decision Dissent and Minority Position"
      subtitle="Legitimate disagreement is preserved before and after the decision is recorded"
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onAdd}>Record Dissent</Button>}>
      <SimpleTable
        caption="Dissent records"
        head={["Team", "Persona", "Position", "Reason", "Evidence", "Alternative Preferred", "Condition That Would Change Position", "Severity", "Status"]}
        rows={dissents.map((d) => [
          <span key="t" className="font-medium text-slate-700">{d.team}</span>,
          personaNameById(d.personaId), d.position, d.reason,
          d.evidenceReferenceIds.join(", ") || "—",
          alternativeCode(d.preferredAlternativeId), d.changeCondition,
          <Pill key="s" label={d.severity} tone={diTone(d.severity) as Tone} />,
          <Pill key="st" label={d.status} tone={d.status === "Resolved" ? "green" : "amber"} />,
        ])}
      />
    </Panel>
  );
}

/* -------------------------------------------------------------- challenges - */

export function ChallengePanel({
  challenges, onAdd,
}: { challenges: RecommendationChallenge[]; onAdd: () => void }) {
  return (
    <Panel id="panel-challenges" title="Recommendation Challenge"
      subtitle="Challenges are preserved with the recommendation history they contest"
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onAdd}>Challenge Recommendation</Button>}>
      <SimpleTable
        caption="Recommendation challenges"
        head={["Challenge", "Challenger", "Role", "Type", "Description", "Proposed Change", "Evidence", "Impact", "Created", "Status"]}
        rows={challenges.map((c) => [
          c.id, c.challenger, c.role,
          <Pill key="t" label={c.challengeType} tone="amber" />,
          c.description, c.proposedChange, c.evidence,
          <Pill key="i" label={c.impact} tone={c.impact === "Escalate" ? "red" : "blue"} />,
          c.createdAt,
          <Pill key="s" label={c.status} tone={diTone(c.status) as Tone} />,
        ])}
      />
    </Panel>
  );
}

/* ------------------------------------------------------------- escalation - */

export function EscalationPanel({
  escalations, onAdd,
}: { escalations: DecisionEscalation[]; onAdd: () => void }) {
  return (
    <Panel id="panel-escalation" title="Decision Escalation"
      subtitle="Escalation records the tradeoff that could not be resolved at team level"
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onAdd}>Create Escalation</Button>}>
      <SimpleTable
        caption="Escalations"
        head={["Escalation", "Decision", "Issue", "Severity", "Affected Teams", "Alternatives", "Business Impact", "Customer Impact", "Risk", "Evidence", "Recommended Level", "Owner", "Due", "Status"]}
        rows={escalations.map((e) => [
          e.id, e.evaluationId,
          <span key="t" className="font-medium text-slate-700">{e.title}</span>,
          <Pill key="s" label={e.severity} tone={diTone(e.severity) as Tone} />,
          e.affectedTeams.join(", "), e.alternativeIds.map(alternativeCode).join(", "),
          e.businessImpact, e.customerImpact, e.riskImpact,
          e.evidenceReferenceIds.join(", ") || "—",
          e.recommendedLevel, e.owner, e.dueDate,
          <Pill key="st" label={e.status} tone={diTone(e.status) as Tone} />,
        ])}
      />
    </Panel>
  );
}

/* --------------------------------------------------------- decision record - */

export function DecisionRecordPanel({
  record, onRecord, onAmend,
}: { record: DecisionRecord | null; onRecord: () => void; onAmend: () => void }) {
  return (
    <Panel id="panel-decision-record" title="Recorded Human Decision"
      subtitle="The authoritative decision record. Decision Intelligence analysis is never overwritten by it"
      actions={
        <div className="flex gap-1.5">
          <Button size="sm" className="h-7 text-[11px]" onClick={onRecord}>{record ? "Record New Version" : "Record Decision"}</Button>
          {record && <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onAmend}>Amend Conditions</Button>}
        </div>
      }>
      {!record ? (
        <EmptyState message="No human decision has been recorded yet"
          hint="Analysis, review and approval can all complete before a decision is recorded. These are distinct states." />
      ) : (
        <div className="grid gap-2 lg:grid-cols-2">
          <dl>
            <Row label="Decision" value={<Pill label={record.decision} tone="green" />} />
            <Row label="Decision Number" value={record.decisionNumber} />
            <Row label="Selected Alternative" value={`${alternativeCode(record.selectedAlternativeId)} · Three Retries with Segmented Rollout`} />
            <Row label="Decision Owner" value={record.decisionOwner} />
            <Row label="Decision Date" value={record.decisionDate} />
            <Row label="Decision Confidence" value={`${record.confidence}%`} />
            <Row label="Context Snapshot" value={record.contextSnapshotId} />
            <Row label="Status" value={<Pill label={record.status} tone="blue" />} />
          </dl>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Decision Rationale</p>
            <p className="mt-0.5 text-[11.5px] text-slate-700">{record.decisionRationale}</p>
            <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Conditions of Approval</p>
            <ul className="mt-0.5 space-y-0.5">
              {record.conditions.map((c) => (
                <li key={c.id} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                  <Pill label={c.category} tone="blue" /><span>{c.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Required Controls</p>
            <Chips items={requiredControls} tone="green" />
          </div>
        </div>
      )}
    </Panel>
  );
}

export function RecommendationVsDecisionPanel({
  state, record,
}: { state: DecisionScenarioState; record: DecisionRecord | null }) {
  const rows = useMemo(() => recommendationVsDecision(state, record), [state, record]);
  return (
    <Panel id="panel-rec-vs-decision" title="Recommendation versus Recorded Human Decision"
      subtitle="The machine recommendation and the human decision are preserved separately and never merged">
      <SimpleTable
        caption="Recommendation versus recorded decision"
        head={["Field", "Recommendation", "Recorded Human Decision", "Difference"]}
        rows={rows.map((r) => [
          <span key="f" className="font-medium text-slate-700">{r.field}</span>,
          r.recommendation, r.decision,
          <span key="d" className={cn(r.difference !== "None" && r.difference !== "—" && "text-amber-700")}>{r.difference}</span>,
        ])}
      />
    </Panel>
  );
}

/* ------------------------------------------------------- version history -- */

export function VersionHistoryPanel({
  versions, left, right, onLeft, onRight, onExport,
}: {
  versions: DecisionVersion[];
  left: string; right: string;
  onLeft: (id: string) => void; onRight: (id: string) => void;
  onExport: (id: string) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Panel id="panel-versions" title="Decision Version History"
      subtitle="Analysis versions, recommendation versions, review events and decision record versions are all preserved">
      <SimpleTable
        caption="Decision version history"
        head={["Version", "Kind", "Timestamp", "Recommendation", "Evidence", "Approvals", "Decision Outcome", "Conditions", "Changed By", "Reason", "Actions"]}
        rows={versions.map((v) => [
          <span key="v" className="font-medium text-slate-700">{v.id}</span>,
          <Pill key="k" label={v.kind} tone={v.kind === "Decision Record" ? "green" : "blue"} />,
          v.timestamp, v.recommendation, `${v.evidenceCoverage}%`, v.approvals,
          v.decisionOutcome, v.conditions, v.changedBy, v.reason,
          <span key="a" className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => setOpen(open === v.id ? null : v.id)}>Open</Button>
            <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onLeft(v.id)}>Compare from</Button>
            <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onRight(v.id)}>Compare to</Button>
            <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onExport(v.id)}>Export</Button>
          </span>,
        ])}
      />
      {open && (
        <div className="mt-2 rounded border border-blue-200 bg-blue-50/50 p-2">
          <p className="text-[11px] font-semibold text-slate-800">{open}</p>
          <p className="text-[11px] text-slate-600">{versions.find((v) => v.id === open)?.question}</p>
          <p className="text-[11px] text-slate-600">Alternatives: {versions.find((v) => v.id === open)?.alternatives}</p>
        </div>
      )}
      <p className="mt-1.5 text-[10.5px] text-slate-500">Comparing {left} with {right}</p>
    </Panel>
  );
}

export function VersionComparisonPanel({ left, right }: { left: DecisionVersion; right: DecisionVersion }) {
  const rows = useMemo(() => compareVersions(left, right), [left, right]);
  const tone = (s: string): Tone =>
    s === "Material Change" ? "red" : s === "Changed" ? "amber" : s === "Added" ? "green" : s === "Removed" ? "red" : "slate";
  return (
    <Panel id="panel-version-compare" title="Decision Version Comparison"
      subtitle={`${left.id} compared with ${right.id}`}>
      <SimpleTable
        caption="Version comparison"
        head={["Field", left.id, right.id, "State"]}
        rows={rows.map((r) => [
          <span key="f" className="font-medium text-slate-700">{r.field}</span>,
          r.left, r.right, <Pill key="s" label={r.state} tone={tone(r.state)} />,
        ])}
      />
    </Panel>
  );
}

/* ------------------------------------------------------ expected outcomes -- */

export function RegisteredOutcomePanel({ registered }: { registered: boolean }) {
  return (
    <Panel id="panel-registered-outcomes" title="Decision Expected Outcomes"
      subtitle="Expected outcomes are registered before execution. Observed results are never fabricated here">
      {!registered && (
        <p className="mb-1.5 text-[11px] text-amber-700">
          Expected outcomes become part of the decision record once a decision is recorded.
        </p>
      )}
      <SimpleTable
        caption="Registered expected outcomes"
        head={["Metric", "Type", "Baseline", "Expected Value", "Acceptable Range", "Observation Window", "Evidence Source", "Owner", "Escalation Threshold"]}
        rows={registeredOutcomes.map((o) => [
          <span key="m" className="font-medium text-slate-700">{o.metric}</span>,
          <Pill key="t" label={o.outcomeType} tone="blue" />,
          o.baseline, o.expectedValue, o.acceptableRange, o.observationWindow, o.evidenceSource, o.owner, o.escalationThreshold,
        ])}
      />
    </Panel>
  );
}

/* --------------------------------------------------------------- handoff -- */

export function ExecutionHandoffPanel({
  handoff, record, executionRouteExists, onPrepare, onOpenExecution,
}: {
  handoff: ExecutionHandoff;
  record: DecisionRecord | null;
  executionRouteExists: boolean;
  onPrepare: () => void;
  onOpenExecution: () => void;
}) {
  return (
    <Panel id="panel-handoff" title="Execution Handoff"
      subtitle="Translate the recorded decision into governed execution conditions"
      actions={
        <div className="flex gap-1.5">
          <Button size="sm" className="h-7 text-[11px]" disabled={!record} onClick={onPrepare}>Prepare for Execution</Button>
          {executionRouteExists && <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onOpenExecution}>Open Work Execution</Button>}
        </div>
      }>
      {!record ? (
        <EmptyState message="Execution handoff requires a recorded decision" hint="Record the human decision first." />
      ) : (
        <>
          <div className="grid gap-2 lg:grid-cols-2">
            <dl>
              <Row label="Decision" value={record.decisionNumber} />
              <Row label="Selected Alternative" value={alternativeCode(handoff.selectedAlternativeId)} />
              <Row label="Scope" value={handoff.scope} />
              <Row label="Traffic Limits" value={handoff.trafficLimits} />
              <Row label="Deployment Window" value={handoff.deploymentWindow} />
              <Row label="Handoff Status" value={<Pill label={handoff.status} tone={handoff.status === "Not Prepared" ? "slate" : "green"} />} />
            </dl>
            <dl>
              <Row label="Required Controls" value={<Chips items={handoff.controls} tone="green" />} />
              <Row label="Monitoring Requirements" value={<Chips items={handoff.monitoringRequirements} tone="blue" />} />
              <Row label="Rollback Trigger" value={<Chips items={handoff.rollbackTriggers} tone="amber" />} />
              <Row label="Required Approvals" value={handoff.approvalIds.join(", ")} />
              <Row label="Conditions" value={`${handoff.conditionIds.length} recorded conditions`} />
              <Row label="Expected Outcomes" value={`${handoff.expectedOutcomeIds.length} registered`} />
              <Row label="Owners" value={<Chips items={handoff.owners} />} />
            </dl>
          </div>
          {!executionRouteExists && (
            <p className="mt-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
              Execution Module Not Yet Configured. The handoff record is maintained locally.
            </p>
          )}
        </>
      )}
    </Panel>
  );
}

export function ObservationContractPanel({
  contract, record, onCreate,
}: { contract: ObservationContract; record: DecisionRecord | null; onCreate: () => void }) {
  return (
    <Panel id="panel-observation-contract" title="Learning Observation Contract"
      subtitle="Defines what must be observed after execution so Organizational Learning can compare expected with actual outcomes"
      actions={<Button size="sm" className="h-7 text-[11px]" disabled={!record} onClick={onCreate}>Create Observation Contract</Button>}>
      {!record ? (
        <EmptyState message="An observation contract requires a recorded decision"
          hint="Organizational Learning is performed elsewhere. No outcomes are produced here." />
      ) : (
        <div className="grid gap-2 lg:grid-cols-2">
          <dl>
            <Row label="Contract" value={contract.id} />
            <Row label="Decision ID" value={contract.decisionRecordId} />
            <Row label="Expected Outcomes" value={`${contract.expectedOutcomeIds.length} registered`} />
            <Row label="Observation Metrics" value={<Chips items={contract.metrics} tone="blue" />} />
            <Row label="Observation Windows" value={<Chips items={contract.observationWindows} />} />
            <Row label="Status" value={<Pill label={contract.status} tone={contract.status === "Created" ? "green" : "slate"} />} />
          </dl>
          <dl>
            <Row label="Evidence Sources" value={<Chips items={contract.evidenceSources} />} />
            <Row label="Owners" value={<Chips items={contract.owners} />} />
            <Row label="Escalation Thresholds" value={<ul className="list-disc pl-4 text-left">{contract.escalationThresholds.map((t) => <li key={t}>{t}</li>)}</ul>} />
            <Row label="Outcome Capture Requirements" value={<ul className="list-disc pl-4 text-left">{contract.outcomeCaptureRequirements.map((t) => <li key={t}>{t}</li>)}</ul>} />
            <Row label="Learning Trigger" value={contract.learningTrigger} />
          </dl>
        </div>
      )}
    </Panel>
  );
}

/* ---------------------------------------------------------------- audit --- */

export function AuditTrailPanel({ events }: { events: typeof seedAudit }) {
  const [limit, setLimit] = useState(8);
  const shown = events.slice(0, limit);
  return (
    <Panel id="panel-audit" title="Decision Audit Trail"
      subtitle="Every state transition is recorded with actor, previous state, new state and reason"
      actions={events.length > limit
        ? <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setLimit((l) => l + 12)}>Load more</Button>
        : undefined}>
      <SimpleTable
        caption="Decision audit trail"
        head={["Audit ID", "Timestamp", "Actor", "Role", "Action", "Previous State", "New State", "Reason"]}
        rows={shown.map((e) => [e.id, e.timestamp, e.actor, e.role,
          <span key="a" className="font-medium text-slate-700">{e.action}</span>, e.previousState, e.newState, e.reason])}
      />
    </Panel>
  );
}

/* ------------------------------------------------------------- snapshot --- */

export function ContextSnapshotPanel({ snapshot }: { snapshot: DecisionContextSnapshot | null }) {
  return (
    <Panel id="panel-snapshot" title="Decision Context Snapshot"
      subtitle="An immutable record of what was known and believed at decision time. Later knowledge does not rewrite it">
      {!snapshot ? (
        <EmptyState message="No context snapshot exists yet" hint="A snapshot is created when the human decision is recorded." />
      ) : (
        <div className="grid gap-2 lg:grid-cols-2">
          <dl>
            <Row label="Snapshot" value={snapshot.id} />
            <Row label="Timestamp" value={snapshot.timestamp} />
            <Row label="Cross Team Analysis Version" value={snapshot.crossTeamAnalysisVersionId} />
            <Row label="Recommendation Version" value={snapshot.recommendationVersion} />
            <Row label="Approval State" value={snapshot.approvalState} />
            <Row label="Access Policy Version" value={snapshot.accessPolicyVersion} />
            <Row label="Alternatives" value={<Chips items={snapshot.alternativeIds.map(alternativeCode)} tone="blue" />} />
            <Row label="Dissent Preserved" value={snapshot.dissentIds.join(", ") || "None"} />
          </dl>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Team Persona Versions at Decision Time</p>
            <SimpleTable caption="Persona versions at decision time"
              head={["Persona", "Version", "Position"]}
              rows={snapshot.personaVersions.map((p) => [p.persona, p.version, p.position])} />
            <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Business Condition Versions</p>
            <SimpleTable caption="Condition versions at decision time"
              head={["Condition", "Version"]}
              rows={snapshot.conditionVersions.map((c) => [c.condition, c.version])} />
            <p className="mt-1.5 text-[10.5px] text-slate-500">
              Evidence references: {snapshot.evidenceReferenceIds.join(", ")}
            </p>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* -------------------------------------------------------------- readiness - */

export function ReadinessPanel({
  metrics, state,
}: { metrics: ReadinessMetric[]; state: ReadinessState }) {
  return (
    <Panel id="panel-readiness" title="Decision Process Readiness"
      subtitle="Analysis, review, approval, decision and execution readiness are distinct states"
      actions={<Pill label={state} tone={state === "Execution Ready" || state === "Decision Recorded" ? "green" : state === "Approval Pending" ? "amber" : "blue"} />}>
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((m) => (
          <div key={m.name} className="rounded border border-slate-200 p-1.5">
            <p className="text-[10.5px] text-slate-600">{m.name}{m.dynamic && <span className="ml-1 text-[9px] uppercase text-blue-600">dynamic</span>}</p>
            <p className="text-[15px] font-semibold text-slate-900">{m.value}%</p>
            <Progress value={m.value} className="h-1" />
            <p className="text-[9.5px] text-slate-500">Target {m.target}%</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------- notifications - */

export function NotificationsPanel({
  notifications, onMarkRead, onMarkAll, onAction,
}: {
  notifications: DecisionNotification[];
  onMarkRead: (id: string) => void;
  onMarkAll: () => void;
  onAction: (n: DecisionNotification, action: string) => void;
}) {
  const [filter, setFilter] = useState("All");
  const types = ["All", ...new Set(notifications.map((n) => n.type))];
  const shown = notifications.filter((n) => filter === "All" || n.type === filter);
  const unread = notifications.filter((n) => n.status === "Unread").length;
  return (
    <Panel id="panel-notifications" title="Notifications"
      subtitle={`${unread} unread`}
      actions={
        <div className="flex items-center gap-1.5">
          <label className="sr-only" htmlFor="di-notif-filter">Filter notifications</label>
          <select id="di-notif-filter" value={filter} onChange={(e) => setFilter(e.target.value)}
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px]">
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onMarkAll}>Mark All Read</Button>
        </div>
      }>
      <SimpleTable
        caption="Notifications"
        head={["Type", "Title", "Description", "Severity", "Owner", "Status", "Created", "Actions"]}
        rows={shown.map((n) => [
          <Pill key="t" label={n.type} tone="blue" />,
          <span key="ti" className={cn("font-medium", n.status === "Unread" ? "text-slate-900" : "text-slate-600")}>{n.title}</span>,
          n.description,
          <Pill key="s" label={n.severity} tone={diTone(n.severity) as Tone} />,
          n.owner,
          <Pill key="st" label={n.status} tone={n.status === "Unread" ? "amber" : "slate"} />,
          n.createdAt,
          <span key="a" className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onMarkRead(n.id)}>Mark Read</Button>
            {["Open", "Assign", "Acknowledge"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAction(n, a)}>{a}</Button>
            ))}
          </span>,
        ])}
      />
    </Panel>
  );
}

/* ------------------------------------------------------------- activity --- */

export function OpsActivityPanel({ items }: { items: OpsActivity[] }) {
  return (
    <Panel id="panel-ops-activity" title="Recent Decision Intelligence Activity"
      subtitle="Scenario changes, evidence, reviews, approvals, dissent, escalation, recording and handoff all create activity">
      <ol className="space-y-1">
        {items.slice(0, 20).map((a) => (
          <li key={a.id} className="flex flex-wrap items-baseline gap-2 border-b border-slate-100 pb-1 text-[11px] last:border-0">
            <span className="w-16 shrink-0 font-mono text-[10.5px] text-slate-500">{a.timestamp}</span>
            <span className="font-medium text-slate-800">{a.action}</span>
            <span className="text-slate-600">{a.description}</span>
            <span className="ml-auto flex items-center gap-1.5">
              <Pill label={a.result} tone={diTone(a.result) as Tone} />
              <span className="text-[10px] text-slate-400">{a.owner} · {a.auditId}</span>
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* --------------------------------------------------------- demo scenarios - */

export function DemoScenarioBar({
  scenarios, active, onSelect,
}: {
  scenarios: { id: string; name: string; description: string; note: string }[];
  active: string | null;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Panel id="panel-demo-scenarios" title="Demo Scenarios"
      subtitle="Each scenario updates KPIs, lifecycle, queue, workbench, alternatives, positions, tradeoffs, constraints, risks, outcomes, evidence, recommendation, reviews, approvals, dissent, readiness, activity and notifications consistently"
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? "Hide" : "Show"} scenarios</Button>}>
      {open && (
        <div className="flex flex-wrap gap-1.5">
          {scenarios.map((s) => (
            <button key={s.id} type="button" onClick={() => onSelect(s.id)} title={s.note}
              className={cn("max-w-[240px] rounded border px-2 py-1 text-left text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                active === s.id ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
              <span className="block font-semibold">{s.name}</span>
              <span className="block text-slate-500">{s.description}</span>
            </button>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function DemoStoryOverlay({
  step, index, total, onNext, onPrev, onExit, reducedMotion, onReducedMotion,
}: {
  step: StoryStep;
  index: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
  reducedMotion: boolean;
  onReducedMotion: (v: boolean) => void;
}) {
  return (
    <div role="dialog" aria-label="Demo story" aria-live="polite"
      className="fixed bottom-3 left-1/2 z-50 w-[min(780px,94vw)] -translate-x-1/2 rounded-lg border border-blue-300 bg-white p-3 shadow-xl">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[9.5px] font-semibold uppercase tracking-wide text-blue-700">
            Demo Story · step {index + 1} of {total} · {step.title}
          </p>
          <p className="text-[12.5px] text-slate-800">{step.caption}</p>
          <p className="mt-0.5 text-[10.5px] text-slate-500">Presenter note: {step.notes}</p>
        </div>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onExit} aria-label="Exit demo story">
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>
      <Progress value={((index + 1) / total) * 100} className="mt-1.5 h-1" />
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onPrev} disabled={index === 0}>
          <ChevronLeft className="mr-1 h-3.5 w-3.5" aria-hidden /> Previous
        </Button>
        <Button size="sm" className="h-7 text-[11px]" onClick={onNext} disabled={index === total - 1}>
          Next <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden />
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onExit}>Exit Story</Button>
        <label className="ml-auto flex items-center gap-1 text-[10.5px] text-slate-600">
          <input type="checkbox" checked={reducedMotion} onChange={(e) => onReducedMotion(e.target.checked)} />
          Reduced motion
        </label>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ review workbench -- */

export function ReviewWorkbenchPanel({
  review, state, onAction,
}: {
  review: DecisionReview | null;
  state: DecisionScenarioState;
  onAction: (r: DecisionReview) => void;
}) {
  const alts = alternativesFor("DIA 5001");
  return (
    <Panel id="panel-review-workbench" title="Decision Review Workbench"
      subtitle="Four synchronized regions: the question, the alternatives and enterprise context, the recommendation, and the reviewer position">
      {!review ? (
        <EmptyState message="Select a review from the Decision Review Queue" hint="Open Review loads the synchronized reviewer workspace." />
      ) : (
        <div className="grid gap-2 lg:grid-cols-4">
          <section aria-label="Decision question" className="rounded border border-slate-200 p-2">
            <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Region 1 · Decision Question</p>
            <p className="mt-0.5 text-[11.5px] font-medium text-slate-800">
              Should automated payment retries increase from two to three, and under what rollout conditions?
            </p>
            <dl className="mt-1">
              <Row label="Review" value={review.id} />
              <Row label="Type" value={review.reviewType} />
              <Row label="Reviewer" value={review.reviewer} />
              <Row label="Role" value={review.reviewerRole} />
              <Row label="Severity" value={<Pill label={review.severity} tone={diTone(review.severity) as Tone} />} />
              <Row label="Due" value={review.dueAt} />
            </dl>
          </section>

          <section aria-label="Alternatives and enterprise context" className="rounded border border-slate-200 p-2">
            <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Region 2 · Alternatives and Enterprise Context</p>
            <ul className="mt-0.5 space-y-1">
              {alts.map((a) => (
                <li key={a.id} className="rounded border border-slate-100 p-1">
                  <p className="text-[11px] font-medium text-slate-800">{a.code} · {a.name}</p>
                  <p className="text-[10.5px] text-slate-500">{a.strategicIntent}</p>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    <Pill label={`Residual ${a.residualRisk}`} tone={magnitudeTone(a.residualRisk) as Tone} />
                    <Pill label={`Reversibility ${a.reversibility}`} tone={magnitudeTone(a.reversibility) as Tone} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Recommendation tradeoffs and evidence" className="rounded border border-slate-200 p-2">
            <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Region 3 · Recommendation, Tradeoffs, Evidence</p>
            <dl className="mt-0.5">
              <Row label="Posture" value={<Pill label={state.posture} tone={diTone(state.posture) as Tone} />} />
              <Row label="Confidence" value={`${state.confidence}%`} />
              <Row label="Evidence Coverage" value={`${state.evidenceCoverage}%`} />
              <Row label="Preferred Alternative" value={alternativeCode(state.preferredAlternativeId)} />
            </dl>
            <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Evidence Gaps</p>
            {state.evidenceGaps.length
              ? <ul className="list-disc pl-4 text-[10.5px] text-slate-600">{state.evidenceGaps.map((g) => <li key={g}>{g}</li>)}</ul>
              : <p className="text-[10.5px] text-emerald-700">No open evidence gaps</p>}
          </section>

          <section aria-label="Reviewer position" className="rounded border border-slate-200 p-2">
            <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Region 4 · Reviewer Position</p>
            <dl className="mt-0.5">
              <Row label="Status" value={<Pill label={review.status} tone={diTone(review.status) as Tone} />} />
              <Row label="Recorded Position" value={review.decision === "Not Started" ? "Not recorded" : review.decision} />
              <Row label="Comments" value={review.comments || "None"} />
            </dl>
            <Button size="sm" className="mt-1.5 h-7 w-full text-[11px]" onClick={() => onAction(review)}>Record Reviewer Position</Button>
          </section>
        </div>
      )}
    </Panel>
  );
}
