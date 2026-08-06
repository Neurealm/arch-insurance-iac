/** Persona Impact Analysis — Prompt 2 operational panels. */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bell, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Pill, Row, Drawer } from "../persona-studio/primitives";
import { Panel, SimpleTable, piaTone } from "./panels";
import {
  conflictsFor, evaluatePersona, impactEvidence, impactPersonas, mitigations, personaById,
  recommendations, scorePersona, severityRank,
  type ImpactSeverity, type PersonaImpactConflict, type ProposalState,
} from "./data";
import {
  changeAlternatives, conditionSensitivity, conditionSensitivityModes, crossTeamActions,
  crossTeamPositions, diffVersions, evidenceRequestTypes, mitigatedScore, personaCandidates,
  personaVersionSensitivity, readinessState, residualSeverity, retryOptions, scenarioDelta,
  scenarioMetrics, scenarioPersonaMetrics, timingLabel, timingOptions, trafficOptions,
  type ChangeAlternative, type PersonaCandidate, type PersonaImpactAnalysisVersion,
  type PersonaImpactDecisionPackage, type PersonaImpactMitigationVersion, type PersonaImpactNotification,
  type PersonaImpactReview, type PersonaImpactScenario, type PiaActivityEvent,
  type PiaOperationalState, type StoryStep,
} from "./ops-data";

const pct = (n: number) => `${Math.round(n)}%`;

const deltaTone = (d: string) =>
  d === "Improved" || d === "Resolved" ? "green" : d === "Worsened" || d === "Newly Activated" ? "red" : "slate";

/* --------------------------------------------------------- operational -- */

export function OperationalStatePanel({
  state, onState, readiness,
}: {
  state: PiaOperationalState;
  onState: (s: PiaOperationalState) => void;
  readiness: ReturnType<typeof readinessState>;
}) {
  return (
    <Panel id="panel-operational-state" title="Operational State"
      subtitle="Analysis, review, and decision readiness are distinct states and are never collapsed into one status">
      <div className="grid gap-1.5 sm:grid-cols-3">
        {[
          ["Analysis Complete", readiness.analysisComplete],
          ["Review Complete", readiness.reviewComplete],
          ["Decision Ready", readiness.decisionReady],
        ].map(([label, ok]) => (
          <div key={String(label)} className="rounded border border-slate-200 bg-white p-2">
            <p className="text-[9.5px] uppercase tracking-wide text-slate-500">{String(label)}</p>
            <Pill label={ok ? "Yes" : "No"} tone={ok ? "green" : "amber"} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">Current state</span>
        <Pill label={state} tone={piaTone(state)} />
        <label className="ml-auto flex items-center gap-1 text-[10.5px] text-slate-600">
          Set state
          <select value={state} onChange={(e) => onState(e.target.value as PiaOperationalState)}
            aria-label="Operational state"
            className="h-6 rounded border border-slate-200 bg-white px-1 text-[11px]">
            {["Loading", "Empty", "Error", "Analyzing", "Needs Evidence", "Review Required", "Conflict Detected",
              "Mitigation Required", "Analysis Complete", "Review Complete", "Decision Package Ready",
              "Routed to Matrix", "Routed to Decision Intelligence", "Blocked", "Paused"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>
    </Panel>
  );
}

/* ----------------------------------------------------- persona scoping -- */

export function PersonaScopePanel({
  candidates, onToggle, onPrimary, onOpenPersona, onAdd, onRequestValidation,
}: {
  candidates: PersonaCandidate[];
  onToggle: (id: string, included: boolean) => void;
  onPrimary: (id: string) => void;
  onOpenPersona: (id: string) => void;
  onAdd: () => void;
  onRequestValidation: (id: string) => void;
}) {
  return (
    <Panel id="panel-persona-scope" title="Persona Scope Management"
      subtitle={`${candidates.filter((c) => c.included).length} of ${candidates.length} candidate Personas included · scope changes recalculate the whole analysis`}
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onAdd}>Add Persona Manually</Button>}>
      <SimpleTable head={["Persona", "Team", "Version", "Match", "Why Included", "Dependency", "Conditions", "Signals", "Status", "Actions"]}
        rows={candidates.map((c) => {
          const p = personaById(c.personaId);
          return [
            <button key="p" type="button" className="text-left text-blue-700 hover:underline" onClick={() => onOpenPersona(c.personaId)}>
              {p.name}{c.primary ? " · Primary" : ""}
            </button>,
            c.team, p.version, pct(c.matchConfidence), c.whyIncluded, c.dependencyRelationship,
            c.applicableConditions, c.potentialSignals,
            <Pill key="s" label={c.status} tone={c.included ? "green" : "slate"} />,
            <span key="a" className="flex flex-wrap gap-1">
              <Button size="sm" variant="outline" className="h-6 text-[10px]"
                onClick={() => onToggle(c.personaId, !c.included)}>{c.included ? "Exclude" : "Include"}</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onPrimary(c.personaId)}>Mark Primary</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onRequestValidation(c.personaId)}>Request Validation</Button>
            </span>,
          ];
        })} />
    </Panel>
  );
}

/* --------------------------------------------------- scenario simulator -- */

export function ScenarioSimulatorPanel({
  proposal, onProposal, personaId, onSaveScenario, onReset,
}: {
  proposal: ProposalState;
  onProposal: (p: ProposalState) => void;
  personaId: string;
  onSaveScenario: () => void;
  onReset: () => void;
}) {
  const set = (patch: Partial<ProposalState>) => onProposal({ ...proposal, ...patch });
  const scores = useMemo(() => impactPersonas.map((p) => ({ p, s: scorePersona(p.id, proposal) })), [proposal]);
  const findings = useMemo(() => impactPersonas.flatMap((p) => evaluatePersona(p.id, proposal)), [proposal]);
  const highestRisk = [...findings].filter((f) => f.impactScoreContribution > 0)
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0];
  const highestOpportunity = [...findings].filter((f) => f.impactScoreContribution < 0)
    .sort((a, b) => a.impactScoreContribution - b.impactScoreContribution)[0];
  const activatedConditions = Array.from(new Set(findings.flatMap((f) => f.conditionIds)));
  const approvals = proposal.maxTraffic > 10 || proposal.deploymentTiming === "Quarter end window"
    ? ["Payments Reliability", "Fraud Engineering", "Release Governance"] : ["Standard change review"];
  const gaps = [
    !proposal.fraudLossEvidence && "Fraud Loss Analysis",
    !proposal.dependencyStressEvidence && "Regional Dependency Stress Test",
    !proposal.idempotencyEvidence && "Idempotency Test Results",
  ].filter(Boolean) as string[];

  return (
    <Panel id="panel-simulator" title="Impact Scenario Simulator"
      subtitle="Vary proposal parameters without changing the original Intake Package · every change recalculates findings immediately"
      actions={
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onSaveScenario}>Save Scenario</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onReset}>Reset to Baseline</Button>
        </div>
      }>
      <div className="grid gap-2 lg:grid-cols-2">
        <div className="space-y-1.5 rounded border border-slate-200 bg-slate-50 p-2">
          <fieldset>
            <legend className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Retry attempts</legend>
            <div className="flex gap-1">
              {retryOptions.map((r) => (
                <button key={r} type="button" aria-pressed={proposal.retryAttempts === r}
                  onClick={() => set({ retryAttempts: r })}
                  className={cn("rounded border px-2 py-0.5 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    proposal.retryAttempts === r ? "border-blue-400 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600")}>{r}</button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Traffic exposure</legend>
            <div className="flex flex-wrap gap-1">
              {trafficOptions.map((t) => (
                <button key={t} type="button" aria-pressed={proposal.maxTraffic === t}
                  onClick={() => set({ maxTraffic: t, initialTraffic: Math.min(proposal.initialTraffic, t) })}
                  className={cn("rounded border px-2 py-0.5 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    proposal.maxTraffic === t ? "border-blue-400 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600")}>{t}%</button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Deployment timing</legend>
            <div className="flex flex-wrap gap-1">
              {timingOptions.map((t) => (
                <button key={t} type="button" aria-pressed={proposal.deploymentTiming === t}
                  onClick={() => set({ deploymentTiming: t })}
                  className={cn("rounded border px-2 py-0.5 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    proposal.deploymentTiming === t ? "border-blue-400 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600")}>
                  {timingLabel(t)}
                </button>
              ))}
            </div>
          </fieldset>
          {([
            ["progressiveRollout", "Progressive rollout", "Enabled", "Disabled"],
            ["idempotencyEvidence", "Idempotency evidence", "Validated", "Missing"],
            ["fraudLossEvidence", "Fraud loss analysis", "Provided", "Missing"],
            ["dependencyStressEvidence", "Dependency stress test", "Provided", "Missing"],
            ["rollbackThreshold", "Rollback threshold", "Defined", "Not defined"],
          ] as const).map(([key, label, on, off]) => (
            <div key={key} className="flex items-center justify-between gap-2 text-[11px] text-slate-700">
              <span>{label}</span>
              <span className="flex items-center gap-1">
                <Pill label={proposal[key] ? on : off} tone={proposal[key] ? "green" : "red"} />
                <Button size="sm" variant="outline" className="h-6 text-[10px]"
                  onClick={() => set({ [key]: !proposal[key] } as Partial<ProposalState>)}>Toggle</Button>
              </span>
            </div>
          ))}
          <p className="text-[10px] text-slate-500">
            Rollback threshold text: {proposal.rollbackThreshold ? "Duplicate Authorization >0.2% for 5 minutes" : "Not defined"}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="rounded border border-slate-200 bg-white p-2">
            <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Persona scores</p>
            <ul className="mt-1 space-y-1">
              {scores.map(({ p, s }) => (
                <li key={p.id}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={cn(p.id === personaId && "font-semibold text-blue-700")}>{p.name}</span>
                    <span className="tabular-nums">{s.score} · {s.classification}</span>
                  </div>
                  <Progress value={s.score} className="h-1" />
                </li>
              ))}
            </ul>
          </div>
          <dl className="rounded border border-slate-200 bg-white p-2">
            <Row label="Highest Risk" value={highestRisk ? `${highestRisk.title} (${highestRisk.severity})` : "None"} />
            <Row label="Highest Opportunity" value={highestOpportunity ? highestOpportunity.title : "None"} />
            <Row label="Activated Conditions" value={activatedConditions.join(", ") || "None"} />
            <Row label="Required Approvals" value={approvals.join(", ")} />
            <Row label="Evidence Gaps" value={gaps.join(", ") || "None"} />
            <Row label="Recommended Mitigations" value={mitigations.slice(0, 3).map((m) => m.title).join(", ")} />
          </dl>
        </div>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------- scenario comparison -- */

export function ScenarioComparisonPanel({
  scenarios, onOpenScenario, onApplyScenario,
}: {
  scenarios: PersonaImpactScenario[];
  onOpenScenario: (s: PersonaImpactScenario) => void;
  onApplyScenario: (s: PersonaImpactScenario) => void;
}) {
  const [metric, setMetric] = useState<(typeof scenarioMetrics)[number]>("Impact Score");
  const base = scenarios[0];
  const compare = scenarios.slice(0, 4);

  const cell = (s: PersonaImpactScenario, personaId: string) => {
    const m = scenarioPersonaMetrics(s, personaId);
    const b = scenarioPersonaMetrics(base, personaId);
    const delta = scenarioDelta(b.impactScore, m.impactScore, b.approvalRequired, m.approvalRequired);
    const value = metric === "Impact Score" ? m.impactScore
      : metric === "Highest Severity" ? m.highestSeverity
        : metric === "Positive Opportunity" ? m.positiveOpportunity
          : metric === "Risk Count" ? m.riskCount
            : metric === "Approval Requirement" ? m.approvalRequirement
              : metric === "Evidence Sufficiency" ? m.evidenceSufficiency
                : metric === "Mitigation Count" ? m.mitigationCount
                  : pct(m.confidence);
    return (
      <span className="flex flex-wrap items-center gap-1">
        <span className="tabular-nums">{String(value)}</span>
        <Pill label={delta} tone={deltaTone(delta)} />
      </span>
    );
  };

  return (
    <Panel id="panel-scenario-comparison" title="Impact Scenario Comparison"
      subtitle={`${compare.length} scenarios compared by Persona · baseline is ${base.name}`}
      actions={
        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          Metric
          <select value={metric} onChange={(e) => setMetric(e.target.value as typeof metric)}
            aria-label="Comparison metric"
            className="h-6 rounded border border-slate-200 bg-white px-1 text-[11px]">
            {scenarioMetrics.map((m) => <option key={m}>{m}</option>)}
          </select>
        </label>
      }>
      <p className="sr-only">
        Scenario comparison text summary. {compare.map((s) =>
          `${s.name}: ${s.trafficExposure} percent traffic, progressive rollout ${s.progressiveRollout ? "on" : "off"}, ` +
          impactPersonas.map((p) => `${p.name} score ${scenarioPersonaMetrics(s, p.id).impactScore}`).join(", ")).join(". ")}
      </p>
      <SimpleTable head={["Persona", ...compare.map((s) => s.name)]}
        rows={impactPersonas.map((p) => [p.name, ...compare.map((s) => cell(s, p.id))])} />
      <div className="mt-2 grid gap-1.5 md:grid-cols-2 xl:grid-cols-4">
        {compare.map((s) => (
          <div key={s.id} className="rounded border border-slate-200 bg-white p-2">
            <p className="text-[11.5px] font-semibold text-slate-800">{s.name}</p>
            <p className="text-[10.5px] text-slate-600">{s.description}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {s.proposalParameters.retryAttempts} retries · {s.trafficExposure}% traffic ·
              {" "}{s.progressiveRollout ? "progressive" : "no progressive rollout"} · {timingLabel(s.deploymentTiming)}
            </p>
            <div className="mt-1 flex gap-1">
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onOpenScenario(s)}>Open</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onApplyScenario(s)}>Simulate</Button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------- alternatives ---- */

export function AlternativeAnalysisPanel({
  onOpen, onSimulate, onSendToDecision,
}: {
  onOpen: (a: ChangeAlternative) => void;
  onSimulate: (a: ChangeAlternative) => void;
  onSendToDecision: (a: ChangeAlternative) => void;
}) {
  return (
    <Panel id="panel-alternatives" title="Change Alternative Analysis"
      subtitle="Compare proposal alternatives on their own terms · this page does not select the final enterprise decision">
      <SimpleTable
        head={["Alternative", "Expected Benefit", "Persona Impact", "Customer", "Operational Risk", "Fraud Risk",
          "Dependency Risk", "Governance", "Evidence", "Reversibility", "Complexity", "Confidence", "Actions"]}
        rows={changeAlternatives.map((a) => [
          <span key="t" className="font-medium text-slate-800">{a.label} · {a.title}</span>,
          a.expectedBenefit, a.personaImpact, a.customerImpact,
          <Pill key="o" label={a.operationalRisk} tone={piaTone(a.operationalRisk)} />,
          <Pill key="f" label={a.fraudRisk} tone={piaTone(a.fraudRisk)} />,
          <Pill key="d" label={a.dependencyRisk} tone={piaTone(a.dependencyRisk)} />,
          a.governanceRequirements, a.evidenceRequirements, a.reversibility, a.complexity, pct(a.confidence),
          <span key="a" className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onOpen(a)}>Open</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onSimulate(a)}>Simulate</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onSendToDecision(a)}>Send</Button>
          </span>,
        ])} />
    </Panel>
  );
}

/* -------------------------------------------------- mitigation planner --- */

export function MitigationPlannerPanel({
  versions, onAccept, onReject, onRequestEvidence, onEdit, onAdd, onRecalculate,
}: {
  versions: PersonaImpactMitigationVersion[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onRequestEvidence: (id: string) => void;
  onEdit: (m: PersonaImpactMitigationVersion) => void;
  onAdd: () => void;
  onRecalculate: () => void;
}) {
  return (
    <Panel id="panel-mitigation" title="Impact Mitigation Planner"
      subtitle="Mitigations reduce residual impact · original findings and their evidence are never deleted"
      actions={
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onAdd}>Add Mitigation</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onRecalculate}>Recalculate Scenario</Button>
        </div>
      }>
      <SimpleTable head={["Finding", "Persona", "Mitigation", "Owner", "Required Evidence", "Original", "Residual", "Expected Reduction", "Confidence", "Status", "Actions"]}
        rows={versions.map((m) => [
          m.findingTitle, personaById(m.personaId).name, m.title, m.owner, m.requiredEvidence,
          <Pill key="o" label={m.originalSeverity} tone={piaTone(m.originalSeverity)} />,
          <Pill key="r" label={m.accepted ? m.residualSeverity : m.originalSeverity} tone={piaTone(m.accepted ? m.residualSeverity : m.originalSeverity)} />,
          m.expectedReduction, pct(m.confidence),
          <Pill key="s" label={m.status} tone={m.status === "Accepted" ? "green" : m.status === "Rejected" ? "red" : "amber"} />,
          <span key="a" className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onEdit(m)}>Edit</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAccept(m.id)}>Accept</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onReject(m.id)}>Reject</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onRequestEvidence(m.id)}>Request Evidence</Button>
          </span>,
        ])} />
    </Panel>
  );
}

export function MitigatedImpactPanel({
  proposal, versions, mode, onMode,
}: {
  proposal: ProposalState;
  versions: PersonaImpactMitigationVersion[];
  mode: "Raw Impact" | "Mitigated Impact";
  onMode: (m: "Raw Impact" | "Mitigated Impact") => void;
}) {
  const accepted = versions.filter((v) => v.accepted);
  const findings = impactPersonas.flatMap((p) => evaluatePersona(p.id, proposal))
    .filter((f) => severityRank(f.severity) >= severityRank("Medium"));
  return (
    <Panel id="panel-mitigated" title="Raw versus Mitigated Impact"
      subtitle="Residual impact after accepted mitigations, shown alongside the unchanged original finding"
      actions={
        <div className="flex rounded border border-slate-200 bg-white p-0.5" role="tablist" aria-label="Impact mode">
          {(["Raw Impact", "Mitigated Impact"] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => onMode(m)}
              className={cn("rounded px-2 py-0.5 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                mode === m ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>{m}</button>
          ))}
        </div>
      }>
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
        {impactPersonas.map((p) => {
          const s = mitigatedScore(p.id, proposal, accepted);
          return (
            <div key={p.id} className="rounded border border-slate-200 bg-white p-2">
              <p className="text-[11.5px] font-semibold text-slate-800">{p.name}</p>
              <p className="text-[18px] font-bold tabular-nums text-slate-900">
                {mode === "Raw Impact" ? s.raw : s.mitigated}
              </p>
              <p className="text-[10px] text-slate-500">Raw {s.raw} · mitigated {s.mitigated} · reduction {s.reduction}</p>
            </div>
          );
        })}
      </div>
      <SimpleTable head={["Finding", "Persona", "Raw Severity", "Mitigated Severity", "Reason", "Confidence"]}
        rows={findings.map((f) => {
          const residual = residualSeverity(f, accepted);
          const hit = accepted.find((m) => m.personaId === f.personaId);
          return [f.title, personaById(f.personaId).name,
            <Pill key="r" label={f.severity} tone={piaTone(f.severity)} />,
            <Pill key="m" label={mode === "Raw Impact" ? f.severity : residual} tone={piaTone(mode === "Raw Impact" ? f.severity : residual)} />,
            hit ? hit.reason : "No accepted mitigation, original severity retained",
            pct(hit ? hit.confidence : f.confidence)];
        })} />
    </Panel>
  );
}

/* --------------------------------------------------- evidence remediation */

export function EvidenceRemediationPanel({
  proposal, onRequest, onAdd, onNotApplicable, onLink, onOpen,
}: {
  proposal: ProposalState;
  onRequest: (evidenceId: string) => void;
  onAdd: (evidenceId: string) => void;
  onNotApplicable: (evidenceId: string) => void;
  onLink: (evidenceId: string) => void;
  onOpen: (evidenceId: string) => void;
}) {
  const provided = (id: string) =>
    id === "EVD 7706" ? proposal.fraudLossEvidence
      : id === "EVD 7707" ? proposal.dependencyStressEvidence
        : id === "EVD 7704" ? proposal.idempotencyEvidence : true;
  const coverage = Math.round(
    (impactEvidence.filter((e) => provided(e.id)).length / impactEvidence.length) * 100);

  return (
    <Panel id="panel-evidence" title="Evidence Remediation"
      subtitle={`Evidence coverage ${coverage}% · adding evidence updates confidence and recommendations without rewriting findings`}>
      <SimpleTable head={["Evidence", "Type", "Authority", "Required", "State", "Request Types", "Actions"]}
        rows={impactEvidence.map((e) => [
          e.name, e.evidenceType, e.authority, e.required ? "Yes" : "No",
          <Pill key="s" label={provided(e.id) ? "Provided" : "Missing"} tone={provided(e.id) ? "green" : "red"} />,
          evidenceRequestTypes.slice(0, 3).join(", "),
          <span key="a" className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onRequest(e.id)}>Request</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAdd(e.id)}>Add</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onLink(e.id)}>Link Existing</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onNotApplicable(e.id)}>Not Applicable</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onOpen(e.id)}>Open</Button>
          </span>,
        ])} />
    </Panel>
  );
}

/* ------------------------------------------------------- review queue ---- */

export function ReviewQueuePanel({
  reviews, onOpen, onApprove, onRequestChanges, onRequestEvidence, onReassign, onEscalate,
}: {
  reviews: PersonaImpactReview[];
  onOpen: (r: PersonaImpactReview) => void;
  onApprove: (id: string) => void;
  onRequestChanges: (id: string) => void;
  onRequestEvidence: (id: string) => void;
  onReassign: (id: string) => void;
  onEscalate: (id: string) => void;
}) {
  const summary = {
    required: reviews.length + 8,
    critical: reviews.filter((r) => r.severity === "Critical").length + 1,
    high: reviews.filter((r) => r.severity === "High").length + 2,
    medium: 4,
    evidence: reviews.filter((r) => r.reviewType === "Evidence Review").length,
  };
  return (
    <Panel id="panel-review-queue" title="Impact Review Queue"
      subtitle="Human review of material impact findings">
      <div className="grid gap-1.5 sm:grid-cols-3 xl:grid-cols-5">
        {[["Reviews Required", summary.required], ["Critical", summary.critical], ["High", summary.high],
        ["Medium", summary.medium], ["Evidence Review", summary.evidence]].map(([k, v]) => (
          <div key={String(k)} className="rounded border border-slate-200 bg-white p-2">
            <p className="text-[9.5px] uppercase tracking-wide text-slate-500">{String(k)}</p>
            <p className="text-[18px] font-bold text-slate-900">{String(v)}</p>
          </div>
        ))}
      </div>
      <SimpleTable head={["Review ID", "Evaluation", "Persona", "Finding", "Review Type", "Severity", "Reviewer", "Evidence Coverage", "Due", "Status", "Actions"]}
        rows={reviews.map((r) => [
          <button key="i" type="button" className="text-blue-700 hover:underline" onClick={() => onOpen(r)}>{r.id}</button>,
          r.evaluationTitle, personaById(r.personaId).name, r.findingTitle, r.reviewType,
          <Pill key="s" label={r.severity} tone={piaTone(r.severity)} />, r.reviewer, pct(r.evidenceCoverage), r.dueAt,
          <Pill key="st" label={r.status} tone={r.status === "Approved" ? "green" : r.status === "Escalated" ? "red" : "amber"} />,
          <span key="a" className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onOpen(r)}>Open Review</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onApprove(r.id)}>Approve Finding</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onRequestChanges(r.id)}>Request Changes</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onRequestEvidence(r.id)}>Request Evidence</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onReassign(r.id)}>Reassign</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onEscalate(r.id)}>Escalate</Button>
          </span>,
        ])} />
    </Panel>
  );
}

/* ------------------------------------------------- persona owner review -- */

export function PersonaOwnerReviewPanel({
  proposal, personaId, onAction,
}: {
  proposal: ProposalState;
  personaId: string;
  onAction: (action: string) => void;
}) {
  const p = personaById(personaId);
  const findings = evaluatePersona(personaId, proposal);
  return (
    <Panel id="panel-persona-owner-review" title="Persona Owner Review"
      subtitle={`${p.name} ${p.version} · owner ${p.owner} · confirms the analysis interpreted the Persona correctly`}>
      <SimpleTable head={["Finding", "Dimension", "Severity", "Conditions", "Risks", "Controls", "Evidence"]}
        rows={findings.map((f) => [f.title, f.impactDimension,
          <Pill key="s" label={f.severity} tone={piaTone(f.severity)} />,
          f.conditionIds.join(", ") || "None", f.riskIds.join(", ") || "None",
          f.controlIds.join(", ") || "None", f.evidenceReferenceIds.join(", ") || "Gap"])} />
      <dl className="mt-2">
        <Row label="Recommendations" value={recommendations.filter((r) => r.personaId === personaId).map((r) => r.title).join(", ") || "None"} />
        <Row label="Applicable Conditions" value={Array.from(new Set(findings.flatMap((f) => f.conditionIds))).join(", ") || "None"} />
      </dl>
      <div className="mt-2 flex flex-wrap gap-1">
        {["Confirm Interpretation", "Correct Persona Mapping", "Request Additional Context",
          "Challenge Finding", "Accept Mitigation", "Request Persona Refresh"].map((a) => (
            <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a)}>{a}</Button>
          ))}
      </div>
      <p className="mt-1 text-[10.5px] text-slate-500">
        Published Personas are never modified here. Persona changes route to Persona Validation or Persona Version History.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------- cross team review -- */

export function CrossTeamReviewPanel({ onAction }: { onAction: (personaId: string, action: string) => void }) {
  return (
    <Panel id="panel-cross-team-review" title="Cross Team Review"
      subtitle="Coordination support for material Persona findings · this does not replace the Cross Team Impact Matrix">
      <SimpleTable head={["Persona", "Position", "Top Priority", "Top Concern", "Required Evidence", "Required Mitigation", "Approval", "Review Status", "Actions"]}
        rows={crossTeamPositions.map((c) => [
          personaById(c.personaId).name, c.position, c.topPriority, c.topConcern,
          c.requiredEvidence, c.requiredMitigation, c.approvalRequirement,
          <Pill key="s" label={c.reviewStatus} tone={piaTone(c.reviewStatus)} />,
          <span key="a" className="flex flex-wrap gap-1">
            {crossTeamActions.map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-6 text-[10px]"
                onClick={() => onAction(c.personaId, a)}>{a}</Button>
            ))}
          </span>,
        ])} />
    </Panel>
  );
}

/* ------------------------------------------------------ sensitivity ------ */

export function PersonaVersionSensitivityPanel() {
  const s = personaVersionSensitivity;
  return (
    <Panel id="panel-persona-sensitivity" title="Persona Version Sensitivity"
      subtitle={`${personaById(s.personaId).name} ${s.fromVersion} versus ${s.toVersion} · why Persona version history matters`}>
      <div className="grid gap-2 md:grid-cols-2">
        {[[s.fromVersion, s.fromRule, s.fromScore, s.fromGovernanceSeverity],
        [s.toVersion, s.toRule, s.toScore, s.toGovernanceSeverity]].map(([v, rule, score, sev]) => (
          <div key={String(v)} className="rounded border border-slate-200 bg-white p-2">
            <p className="text-[11.5px] font-semibold text-slate-800">{String(v)}</p>
            <dl>
              <Row label="Rule" value={String(rule)} />
              <Row label="Impact Score" value={String(score)} />
              <Row label="Governance Finding" value={<Pill label={String(sev)} tone={piaTone(String(sev))} />} />
            </dl>
          </div>
        ))}
      </div>
      <SimpleTable head={["Change Area", "Detail"]}
        rows={[
          ["Findings Added", s.findingsAdded.join(", ")],
          ["Findings Removed", s.findingsRemoved.join(", ")],
          ["Severity Changes", s.severityChanges.join(", ")],
          ["Score Changes", `${s.fromScore} to ${s.toScore}`],
          ["Recommendation Changes", s.recommendationChanges.join(", ")],
          ["Required Reviewer Changes", s.reviewerChanges.join(", ")],
        ]} />
    </Panel>
  );
}

export function ConditionSensitivityPanel({ mode, onMode }: { mode: string; onMode: (m: string) => void }) {
  return (
    <Panel id="panel-condition-sensitivity" title="Condition Sensitivity"
      subtitle="How Business Condition versions change the analysis · current approved conditions are never altered here"
      actions={
        <div className="flex gap-1" role="tablist" aria-label="Condition sensitivity mode">
          {conditionSensitivityModes.map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => onMode(m)}
              className={cn("rounded border px-2 py-0.5 text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                mode === m ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}>{m}</button>
          ))}
        </div>
      }>
      <SimpleTable head={["Condition", "Prior", "Current", "Impact", "Affected Personas"]}
        rows={conditionSensitivity.map((c) => [
          `${c.id} · ${c.name}`, c.priorValue, c.currentValue, c.impact,
          c.affectedPersonaIds.map((p) => personaById(p).name).join(", ")])} />
      <p className="mt-1 text-[10.5px] text-slate-500">
        Mode {mode}. Historical Simulation evaluates prior condition values without changing approved conditions.
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------ version history -- */

export function AnalysisVersionHistoryPanel({
  versions, selected, onSelect, onOpen, onCompare, onRestore, onExport,
}: {
  versions: PersonaImpactAnalysisVersion[];
  selected: [string, string];
  onSelect: (pair: [string, string]) => void;
  onOpen: (v: PersonaImpactAnalysisVersion) => void;
  onCompare: () => void;
  onRestore: (v: PersonaImpactAnalysisVersion) => void;
  onExport: (v: PersonaImpactAnalysisVersion) => void;
}) {
  return (
    <Panel id="panel-version-history" title="Analysis Version History"
      subtitle="Historical analysis results are preserved and never overwritten"
      actions={
        <div className="flex flex-wrap items-center gap-1">
          <label className="text-[10px] text-slate-500">From
            <select value={selected[0]} onChange={(e) => onSelect([e.target.value, selected[1]])}
              aria-label="Compare from version" className="ml-1 h-6 rounded border border-slate-200 px-1 text-[11px]">
              {versions.map((v) => <option key={v.id} value={v.id}>{v.version}</option>)}
            </select>
          </label>
          <label className="text-[10px] text-slate-500">To
            <select value={selected[1]} onChange={(e) => onSelect([selected[0], e.target.value])}
              aria-label="Compare to version" className="ml-1 h-6 rounded border border-slate-200 px-1 text-[11px]">
              {versions.map((v) => <option key={v.id} value={v.id}>{v.version}</option>)}
            </select>
          </label>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onCompare}>Compare</Button>
        </div>
      }>
      <SimpleTable head={["Version", "Timestamp", "Proposal", "Persona Versions", "Condition Versions", "Evidence Coverage", "Highest Severity", "Conflicts", "Recommendations", "Changed By", "Reason", "Actions"]}
        rows={versions.map((v) => [
          v.version, v.timestamp, v.proposalVersion, v.personaVersions, v.conditionVersions,
          pct(v.evidenceCoverage), <Pill key="s" label={v.highestSeverity} tone={piaTone(v.highestSeverity)} />,
          v.conflictIds.length, v.recommendationIds.length, v.createdBy, v.changeReason,
          <span key="a" className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onOpen(v)}>Open</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onRestore(v)}>Restore as Simulation</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onExport(v)}>Export</Button>
          </span>,
        ])} />
      <p className="mt-1 text-[10.5px] text-slate-500">
        Persona scores by version: {versions.map((v) => `${v.version} ${v.personaScores.map((s) => `${personaById(s.personaId).name} ${s.score}`).join(" / ")}`).join(" · ")}
      </p>
    </Panel>
  );
}

export function VersionComparisonPanel({
  a, b,
}: { a: PersonaImpactAnalysisVersion; b: PersonaImpactAnalysisVersion }) {
  const rows = diffVersions(a, b);
  return (
    <Panel id="panel-version-comparison" title="Impact Version Comparison"
      subtitle={`${a.version} compared with ${b.version}`}>
      <SimpleTable head={["Area", a.version, b.version, "Change"]}
        rows={rows.map((r) => [r.area, r.left, r.right,
          <Pill key="k" label={r.kind}
            tone={r.kind === "Material Change" ? "red" : r.kind === "Unchanged" ? "slate" : r.kind === "Added" ? "green" : "amber"} />])} />
    </Panel>
  );
}

/* ------------------------------------------------------ decision package -- */

export function DecisionPackagePanel({
  pkg, readiness, onOpenMatrix, onOpenDecision, onExport,
}: {
  pkg: PersonaImpactDecisionPackage;
  readiness: ReturnType<typeof readinessState>;
  onOpenMatrix: () => void;
  onOpenDecision: () => void;
  onExport: () => void;
}) {
  return (
    <Panel id="panel-decision-package" title="Impact Decision Package"
      subtitle="Structured handoff from Persona Impact Analysis · this is not the final enterprise decision"
      actions={
        <div className="flex flex-wrap gap-1">
          <Pill label={pkg.status} tone={pkg.status === "Complete" ? "green" : pkg.status === "Blocked" ? "red" : "amber"} />
          <Button size="sm" className="h-7 text-[11px]" onClick={onOpenMatrix}>Open Cross Team Impact Matrix</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onOpenDecision}>Proceed to Decision Intelligence</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onExport}>Export Package</Button>
        </div>
      }>
      <div className="grid gap-2 xl:grid-cols-3">
        <dl className="rounded border border-slate-200 bg-white p-2">
          <Row label="Work Item" value={`${pkg.workItemId} · Checkout Retry Policy Update`} />
          <Row label="Evaluation Version" value={pkg.analysisVersionId} />
          <Row label="Personas Evaluated" value={pkg.personaIds.length} />
          <Row label="Persona Versions" value={pkg.personaVersions} />
          <Row label="Material Findings" value={pkg.findingIds.length} />
          <Row label="Positive Opportunities" value={pkg.opportunityIds.length} />
          <Row label="Cross Persona Conflicts" value={pkg.conflictIds.length} />
          <Row label="Applicable Conditions" value={pkg.conditionIds.length} />
        </dl>
        <dl className="rounded border border-slate-200 bg-white p-2">
          <Row label="Dependency Paths" value={pkg.dependencyPathIds.length} />
          <Row label="Risks" value={pkg.riskIds.length} />
          <Row label="Controls" value={pkg.controlIds.length} />
          <Row label="Accepted Mitigations" value={pkg.mitigationIds.join(", ") || "None"} />
          <Row label="Evidence" value={pkg.evidenceIds.length} />
          <Row label="Evidence Gaps" value={pkg.missingEvidence.join(", ") || "None"} />
          <Row label="Required Reviewers" value={pkg.reviewerIds.join(", ")} />
          <Row label="Overall Analysis Confidence" value={pct(pkg.analysisConfidence)} />
        </dl>
        <div className="rounded border border-blue-200 bg-blue-50 p-2">
          <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Recommended conditions for proceeding</p>
          <ul className="mt-0.5 space-y-0.5 text-[11px] text-slate-700">
            {pkg.recommendedProceedConditions.map((c) => <li key={c}>· {c}</li>)}
          </ul>
          <p className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Open issues</p>
          <ul className="space-y-0.5 text-[11px] text-slate-700">
            {pkg.openIssues.length ? pkg.openIssues.map((o) => <li key={o}>· {o}</li>) : <li>· None</li>}
          </ul>
        </div>
      </div>

      <p className="mt-2 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Persona positions</p>
      <SimpleTable head={["Persona", "Position"]}
        rows={pkg.personaPositions.map((p) => [personaById(p.personaId).name, p.position])} />

      <div className="mt-2 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
        {[["Persona Coverage", pct(readiness.personaCoverage)], ["Condition Coverage", pct(readiness.conditionCoverage)],
        ["Dependency Coverage", pct(readiness.dependencyCoverage)], ["Evidence Coverage", pct(readiness.evidenceCoverage)],
        ["Finding Traceability", pct(readiness.findingTraceability)], ["Human Review Coverage", pct(readiness.humanReviewCoverage)],
        ["Mitigation Coverage", pct(readiness.mitigationCoverage)], ["Analysis Confidence", pct(readiness.analysisConfidence)],
        ["Critical Open Issues", String(readiness.criticalOpenIssues)],
        ["Cross Team Matrix Ready", readiness.matrixReady ? "Yes" : "No"],
        ["Decision Intelligence Ready", readiness.decisionIntelligenceReady ? "Yes" : "No"],
        ["Decision Ready", readiness.decisionReady ? "Yes" : "No"]].map(([k, v]) => (
          <div key={String(k)} className="rounded border border-slate-200 bg-white p-2">
            <p className="text-[9.5px] uppercase tracking-wide text-slate-500">{String(k)}</p>
            <p className="text-[15px] font-bold text-slate-900">{String(v)}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------ recent activity -- */

export function RecentActivityPanel({ events }: { events: PiaActivityEvent[] }) {
  return (
    <Panel id="panel-recent-activity" title="Recent Persona Impact Activity"
      subtitle="Simulation, mitigation, review, reanalysis, and routing events appear here as they happen">
      <ul className="space-y-1">
        {events.map((e) => (
          <li key={e.id} className="flex items-start gap-2 rounded border border-slate-200 bg-white p-1.5">
            <span className="w-[70px] shrink-0 text-[10.5px] tabular-nums text-slate-500">{e.time}</span>
            <Pill label={e.category} tone="blue" />
            <span className="text-[11px] text-slate-700">{e.text}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* -------------------------------------------------------- notifications -- */

export function NotificationsButton({ unread, onClick }: { unread: number; onClick: () => void }) {
  return (
    <Button size="sm" variant="outline" className="relative h-7 text-[11px]" onClick={onClick}
      aria-label={`Notifications, ${unread} unread`}>
      <Bell className="mr-1 h-3.5 w-3.5" aria-hidden /> Notifications
      {unread > 0 && (
        <span className="ml-1 rounded-full bg-red-600 px-1.5 text-[9.5px] font-semibold text-white">{unread}</span>
      )}
    </Button>
  );
}

export function NotificationsDrawer({
  open, onOpenChange, notifications, onRead, onReadAll, onAcknowledge, onAssign, onOpenItem,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  notifications: PersonaImpactNotification[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  onAcknowledge: (id: string) => void;
  onAssign: (id: string) => void;
  onOpenItem: (n: PersonaImpactNotification) => void;
}) {
  const [filter, setFilter] = useState("All");
  const rows = notifications.filter((n) => filter === "All" || n.severity === filter);
  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide title="Notifications"
      description={`${notifications.filter((n) => n.status === "Unread").length} unread operational signals`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <label className="text-[10.5px] text-slate-600">Filter
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            aria-label="Notification severity filter"
            className="ml-1 h-6 rounded border border-slate-200 px-1 text-[11px]">
            {["All", "Informational", "Warning", "Critical"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={onReadAll}>Mark All Read</Button>
      </div>
      <ul className="space-y-1.5">
        {rows.map((n) => (
          <li key={n.id} className={cn("rounded border p-2", n.status === "Unread" ? "border-blue-200 bg-blue-50/60" : "border-slate-200 bg-white")}>
            <div className="flex flex-wrap items-center gap-1">
              <Pill label={n.severity} tone={n.severity === "Critical" ? "red" : n.severity === "Warning" ? "amber" : "slate"} />
              <Pill label={n.type} tone="blue" />
              <span className="text-[11.5px] font-semibold text-slate-800">{n.title}</span>
              <span className="ml-auto text-[10px] text-slate-500">{n.createdAt}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-600">{n.description}</p>
            <p className="text-[10px] text-slate-500">{personaById(n.personaId).name} · {n.owner} · {n.status}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onRead(n.id)}>Mark Read</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAcknowledge(n.id)}>Acknowledge</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAssign(n.id)}>Assign</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onOpenItem(n)}>Open</Button>
            </div>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}

/* ------------------------------------------------------ review workbench -- */

export function ReviewWorkbenchDrawer({
  open, onOpenChange, review, proposal, onDecision,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  review: PersonaImpactReview | null;
  proposal: ProposalState;
  onDecision: (action: string, comment: string, severity?: ImpactSeverity) => void;
}) {
  const [action, setAction] = useState<string>("Confirm Impact");
  const [comment, setComment] = useState("");
  const [severity, setSeverity] = useState<ImpactSeverity>("High");
  if (!review) return null;
  const p = personaById(review.personaId);
  const findings = evaluatePersona(review.personaId, proposal);
  const finding = findings.find((f) => f.title.includes(review.findingTitle.split(" ")[0])) ?? findings[0];
  const needsComment = ["Change Severity", "Reject Finding", "Mark Known Risk", "Add Mitigation"].includes(action)
    || (action === "Confirm Impact" && review.evidenceCoverage < 85);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide
      title={`${review.id} · Impact Review Workbench`}
      description={`${review.reviewType} · ${p.name} · ${review.findingTitle}`}>
      <div className="grid gap-2 lg:grid-cols-2">
        <section aria-label="Proposed change" className="rounded border border-slate-200 bg-white p-2">
          <h3 className="text-[11.5px] font-semibold text-slate-800">1 · Proposed Change</h3>
          <dl>
            <Row label="Work Item" value="Checkout Retry Policy Update" />
            <Row label="Retry Attempts" value={proposal.retryAttempts} />
            <Row label="Traffic" value={`${proposal.initialTraffic}% to ${proposal.maxTraffic}%`} />
            <Row label="Timing" value={timingLabel(proposal.deploymentTiming)} />
            <Row label="Progressive Rollout" value={proposal.progressiveRollout ? "Enabled" : "Disabled"} />
          </dl>
        </section>
        <section aria-label="Persona context" className="rounded border border-slate-200 bg-white p-2">
          <h3 className="text-[11.5px] font-semibold text-slate-800">2 · Persona Context</h3>
          <dl>
            <Row label="Persona" value={`${p.name} ${p.version}`} />
            <Row label="Mission" value={p.mission} />
            <Row label="Risk Appetite" value={p.riskAppetite} />
            <Row label="Approval Requirements" value={p.approvalRequirements.join(", ")} />
          </dl>
        </section>
        <section aria-label="Impact finding" className="rounded border border-slate-200 bg-white p-2">
          <h3 className="text-[11.5px] font-semibold text-slate-800">3 · Finding, Conditions, Evidence</h3>
          <dl>
            <Row label="Finding" value={finding?.title ?? review.findingTitle} />
            <Row label="Severity" value={<Pill label={finding?.severity ?? review.severity} tone={piaTone(finding?.severity ?? review.severity)} />} />
            <Row label="Direction" value={finding?.direction ?? "Negative"} />
            <Row label="Conditions" value={finding?.conditionIds.join(", ") || "None"} />
            <Row label="Evidence" value={finding?.evidenceReferenceIds.join(", ") || "Gap"} />
            <Row label="Evidence Coverage" value={pct(review.evidenceCoverage)} />
          </dl>
        </section>
        <section aria-label="Reviewer decision" className="rounded border border-slate-200 bg-white p-2">
          <h3 className="text-[11.5px] font-semibold text-slate-800">4 · Reviewer Decision</h3>
          <label className="mt-1 flex flex-col text-[10.5px] text-slate-600">
            Action
            <select value={action} onChange={(e) => setAction(e.target.value)}
              className="h-7 rounded border border-slate-200 px-1.5 text-[11px]">
              {["Confirm Impact", "Change Severity", "Change Direction", "Request Evidence", "Add Mitigation",
                "Reject Finding", "Mark Known Risk", "Request Persona Update", "Escalate"].map((a) => <option key={a}>{a}</option>)}
            </select>
          </label>
          {action === "Change Severity" && (
            <label className="mt-1 flex flex-col text-[10.5px] text-slate-600">
              New severity
              <select value={severity} onChange={(e) => setSeverity(e.target.value as ImpactSeverity)}
                className="h-7 rounded border border-slate-200 px-1.5 text-[11px]">
                {["Informational", "Low", "Medium", "High", "Critical"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          )}
          <label className="mt-1 flex flex-col text-[10.5px] text-slate-600">
            Comment{needsComment ? " (required)" : ""}
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
              className="rounded border border-slate-200 p-1.5 text-[11px]" />
          </label>
          {needsComment && !comment.trim() && (
            <p role="alert" className="mt-1 text-[10.5px] text-red-600">
              A comment is required for manual severity changes, finding rejection, approval despite missing evidence,
              and material mitigation overrides.
            </p>
          )}
          <Button size="sm" className="mt-1.5 h-7 text-[11px]" disabled={needsComment && !comment.trim()}
            onClick={() => { onDecision(action, comment, severity); setComment(""); }}>
            Record Decision
          </Button>
        </section>
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------- conflict resolution --- */

export function ConflictResolutionDrawer({
  open, onOpenChange, conflict, onResolve,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conflict: PersonaImpactConflict | null;
  onResolve: (type: string, note: string) => void;
}) {
  const [type, setType] = useState<string>("Accept Both Perspectives");
  const [note, setNote] = useState("");
  if (!conflict) return null;
  const a = personaById(conflict.personaAId);
  const b = personaById(conflict.personaBId);
  const side = (persona: typeof a, position: string) => (
    <section aria-label={`${persona.name} perspective`} className="rounded border border-slate-200 bg-white p-2">
      <h3 className="text-[11.5px] font-semibold text-slate-800">{persona.name}</h3>
      <dl>
        <Row label="Priority" value={persona.decisionPriorities[0]} />
        <Row label="Condition" value={conflict.conditionIds.join(", ") || "None"} />
        <Row label="Finding" value={position} />
        <Row label="Evidence" value={conflict.evidenceReferenceIds.join(", ") || "None"} />
        <Row label="Severity" value={<Pill label={conflict.severity} tone={piaTone(conflict.severity)} />} />
        <Row label="Recommendation" value={conflict.potentialResolution} />
      </dl>
    </section>
  );
  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide title={`${conflict.id} · Conflict Resolution`}
      description={conflict.description}>
      <div className="grid gap-2 md:grid-cols-2">
        {side(a, conflict.personaAPosition)}
        {side(b, conflict.personaBPosition)}
      </div>
      <label className="flex flex-col text-[10.5px] text-slate-600">
        Resolution type
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="h-7 rounded border border-slate-200 px-1.5 text-[11px]">
          {["No Conflict, Different Scope", "Accept Both Perspectives", "Add Mitigation", "Change Proposal Scope",
            "Change Rollout", "Request Evidence", "Escalate to Cross Team Impact Matrix",
            "Escalate to Decision Intelligence"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className="flex flex-col text-[10.5px] text-slate-600">
        Note
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
          className="rounded border border-slate-200 p-1.5 text-[11px]" />
      </label>
      <p className="text-[10.5px] text-slate-500">
        Neither Persona is treated as automatically correct. Both perspectives are preserved in the analysis record.
      </p>
      <Button size="sm" className="h-7 text-[11px]" onClick={() => { onResolve(type, note); setNote(""); }}>Record Resolution</Button>
    </Drawer>
  );
}

/* ------------------------------------------------------------ demo story -- */

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
      className="fixed bottom-3 left-1/2 z-50 w-[min(720px,94vw)] -translate-x-1/2 rounded-lg border border-blue-300 bg-white p-3 shadow-xl">
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
