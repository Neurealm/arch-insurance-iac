/** Cross Team Impact Analysis — Prompt 2 operational panels. */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Pill, Row } from "../persona-studio/primitives";
import { Panel, EmptyState, SimpleTable, ctiTone } from "./panels";
import {
  conflictsFor, ctiPersonas, dependenciesFor, evidenceState, personaById, personaScore,
  sharedConditions, severityRank, type CtiAnalysisState, type Severity,
} from "./data";
import {
  comparisonRows, compareVersions, conditionSensitivity, coordinatedConflicts, coordinationStatuses,
  deltaLabel, decisionConditions, decisionFraming, evidenceTypes, personaVersionSensitivity,
  readinessMetrics, retryOptions, scenarioMetrics, scenarioPresets, timingOptions, trafficOptions,
  type AckStatus, type CoordinationRecord, type CoordinationStatus, type CrossTeamAcknowledgement,
  type CrossTeamAnalysisVersion, type CrossTeamDecisionPackage, type CrossTeamEscalation,
  type CrossTeamImpactReview, type CrossTeamMitigation, type CrossTeamNotification,
  type DependencyOwnerReview, type OpsActivity, type ScenarioParams, type StoryStep,
} from "./ops-data";

const pct = (n: number) => `${Math.round(n)}%`;

export function Spot({ on, children }: { on: boolean; children: React.ReactNode }) {
  return <div className={cn(on && "rounded-xl ring-2 ring-blue-500 ring-offset-2")}>{children}</div>;
}

/* --------------------------------------------------------- team scope ---- */

export function TeamScopePanel({
  state, included, primary, onToggle, onPrimary, onAdd, onOpenPersona, onOpenResult,
}: {
  state: CtiAnalysisState;
  included: string[];
  primary: string | null;
  onToggle: (id: string) => void;
  onPrimary: (id: string) => void;
  onAdd: () => void;
  onOpenPersona: (id: string) => void;
  onOpenResult: (id: string) => void;
}) {
  const conflicts = conflictsFor(state);
  const deps = dependenciesFor(state);
  return (
    <Panel id="panel-team-scope" title="Team Scope Management"
      subtitle="Changing team scope recalculates the matrix, intersections, conflicts, dependencies, mitigations and coordination actions"
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onAdd}>Add Team Persona</Button>}>
      <SimpleTable
        head={["Persona", "Version", "Score", "Highest Severity", "Why Included", "Shared Deps", "Shared Conditions", "Conflict Signals", "Opportunity Signals", "Scope"]}
        rows={ctiPersonas.map((p) => {
          const inScope = included.includes(p.id);
          const pConf = conflicts.filter((c) => c.personaAId === p.id || c.personaBId === p.id);
          const pDeps = deps.filter((d) => d.affectedPersonaIds.includes(p.id));
          const pConds = sharedConditions.filter((c) => c.personaIds.includes(p.id));
          return [
            <span key="n" className="flex items-center gap-1">
              <button type="button" onClick={() => onOpenPersona(p.id)} className="font-medium text-blue-700 hover:underline">{p.name}</button>
              {primary === p.id && <Pill label="Primary" tone="blue" />}
              {!inScope && <Pill label="Excluded" tone="slate" />}
            </span>,
            personaVersionSensitivity.find((v) => v.personaId === p.id)?.toVersion ?? "v2.0",
            personaScore(p.id, state),
            <Pill key="s" label={p.highestSeverity} tone={ctiTone(p.highestSeverity)} />,
            p.primaryRisk,
            pDeps.length, pConds.length, pConf.length,
            p.primaryBenefit ? 1 : 0,
            <span key="a" className="flex flex-wrap gap-1">
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onToggle(p.id)}>{inScope ? "Exclude" : "Include"}</Button>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onPrimary(p.id)}>Mark Primary</Button>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenResult(p.id)}>Open Result</Button>
            </span>,
          ];
        })} />
      <p className="mt-1.5 text-[10.5px] text-slate-500">
        {included.length} of {ctiPersonas.length} Team Personas in scope. Excluded Personas are removed from the matrix, intersections and coordination requirements but their Persona Impact results are never deleted.
      </p>
    </Panel>
  );
}

/* -------------------------------------------------------- scenario ------- */

export function ScenarioSimulatorPanel({
  params, onParams, onReset, onCompare, spotlight,
}: {
  params: ScenarioParams;
  onParams: (p: ScenarioParams) => void;
  onReset: () => void;
  onCompare: () => void;
  spotlight?: boolean;
}) {
  const m = useMemo(() => scenarioMetrics(params), [params]);
  const set = <K extends keyof ScenarioParams>(k: K, v: ScenarioParams[K]) => onParams({ ...params, [k]: v });
  return (
    <Spot on={Boolean(spotlight)}>
      <Panel id="panel-scenario" title="Cross Team Scenario Simulator"
        subtitle="Every parameter change recalculates Persona scores, matrix cells, conflicts, dependencies, governance requirements, evidence gaps and coordination actions"
        actions={
          <>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onReset}>Reset to Baseline</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onCompare}>Compare Scenarios</Button>
          </>
        }>
        <div className="grid gap-2 lg:grid-cols-3">
          <div className="space-y-1.5 rounded border border-slate-200 p-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Proposal parameters</p>
            <label className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
              Retry attempts
              <select aria-label="Retry attempts" value={params.retryAttempts} onChange={(e) => set("retryAttempts", Number(e.target.value))}
                className="h-6 rounded border border-slate-200 px-1 text-[11px]">
                {retryOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
              Traffic exposure
              <select aria-label="Traffic exposure" value={params.maxTraffic} onChange={(e) => set("maxTraffic", Number(e.target.value))}
                className="h-6 rounded border border-slate-200 px-1 text-[11px]">
                {trafficOptions.map((o) => <option key={o} value={o}>{o}%</option>)}
              </select>
            </label>
            <label className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
              Deployment timing
              <select aria-label="Deployment timing" value={params.deploymentTiming} onChange={(e) => set("deploymentTiming", e.target.value as ScenarioParams["deploymentTiming"])}
                className="h-6 rounded border border-slate-200 px-1 text-[11px]">
                {timingOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
              Progressive rollout
              <input type="checkbox" aria-label="Progressive rollout" checked={params.progressiveRollout} onChange={(e) => set("progressiveRollout", e.target.checked)} />
            </label>
            <label className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
              Idempotency validated
              <input type="checkbox" aria-label="Idempotency validated" checked={params.idempotencyEvidence} onChange={(e) => set("idempotencyEvidence", e.target.checked)} />
            </label>
            <label className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
              Fraud loss analysis provided
              <input type="checkbox" aria-label="Fraud loss analysis provided" checked={params.fraudLossEvidence} onChange={(e) => set("fraudLossEvidence", e.target.checked)} />
            </label>
            <label className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
              Dependency stress test provided
              <input type="checkbox" aria-label="Dependency stress test provided" checked={params.dependencyLoadEvidence} onChange={(e) => set("dependencyLoadEvidence", e.target.checked)} />
            </label>
            <Row label="Rollback threshold" value="0.2% duplicate authorization for five minutes" />
          </div>

          <div className="space-y-1 rounded border border-slate-200 p-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Persona scores under this scenario</p>
            {ctiPersonas.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="w-28 truncate text-[11px] text-slate-700">{p.short}</span>
                <Progress value={m.personaScores[p.id]} className="h-1.5 flex-1" />
                <span className="w-8 text-right text-[11px] tabular-nums text-slate-600">{m.personaScores[p.id]}</span>
              </div>
            ))}
            <p className="pt-1 text-[10.5px] text-slate-500">Scores are never averaged into an enterprise number.</p>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded border border-slate-200 p-2">
            {comparisonRows.map((r) => (
              <div key={r.key} className="rounded bg-slate-50 px-1.5 py-1">
                <p className="text-[9.5px] uppercase tracking-wide text-slate-500">{r.label}</p>
                <p className="text-[13px] font-semibold text-slate-900">{String(m[r.key])}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="sr-only">
          Scenario summary: {m.teamsMaterial} teams materially impacted, {m.conflicts} conflicts,
          {m.criticalCells} critical matrix cells, {m.evidenceGaps} evidence gaps, confidence {m.confidence} percent.
        </p>
      </Panel>
    </Spot>
  );
}

export function ScenarioComparisonPanel({ current }: { current: ScenarioParams }) {
  const scenarios = [
    ...scenarioPresets.map((p) => ({ id: p.id, name: p.name, description: p.description, metrics: scenarioMetrics(p.params) })),
    { id: "SCN CUR", name: "Current", description: "Live simulator parameters", metrics: scenarioMetrics(current) },
  ];
  const base = scenarios[0].metrics;
  return (
    <Panel id="panel-scenario-comparison" title="Cross Team Scenario Comparison"
      subtitle="No scenario is automatically preferred — the comparison exposes the tradeoffs each option creates">
      <SimpleTable
        head={["Measure", ...scenarios.map((s) => s.name)]}
        rows={comparisonRows.map((r) => [
          r.label,
          ...scenarios.map((s) => {
            const v = s.metrics[r.key] as number;
            const b = base[r.key] as number;
            const label = deltaLabel(b, v);
            const better = r.lowerIsBetter ? v < b : v > b;
            return (
              <span key={s.id} className="flex items-center gap-1">
                <span className="tabular-nums">{v}</span>
                {s.id !== "SCN A" && label !== "Unchanged" && (
                  <Pill label={label} tone={label === "Resolved" || better ? "green" : label === "Newly Activated" ? "red" : "amber"} />
                )}
              </span>
            );
          }),
        ])} />
      <div className="mt-2">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Persona score delta versus Scenario A</p>
        <SimpleTable
          head={["Persona", ...scenarios.map((s) => s.name), "Direction"]}
          rows={ctiPersonas.map((p) => {
            const first = scenarios[0].metrics.personaScores[p.id];
            const last = scenarios[scenarios.length - 1].metrics.personaScores[p.id];
            const label = deltaLabel(first, last);
            return [
              p.short,
              ...scenarios.map((s) => s.metrics.personaScores[p.id]),
              <Pill key="d" label={label} tone={label === "Improved" || label === "Resolved" ? "green" : label === "Unchanged" ? "slate" : "red"} />,
            ];
          })} />
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------- mitigations ----- */

export function MitigationPlannerPanel({
  mitigations, accepted, onAccept, onReject, onEdit, onAssign, onRequestEvidence, onOpenPersona, spotlight,
}: {
  mitigations: CrossTeamMitigation[];
  accepted: string[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (m: CrossTeamMitigation) => void;
  onAssign: (m: CrossTeamMitigation) => void;
  onRequestEvidence: (m: CrossTeamMitigation) => void;
  onOpenPersona: (id: string) => void;
  spotlight?: boolean;
}) {
  return (
    <Spot on={Boolean(spotlight)}>
      <Panel id="panel-mitigation-planner" title="Coordinated Mitigation Planner"
        subtitle="A mitigation may resolve one team's concern while creating cost for another — both stay visible">
        <SimpleTable
          head={["Mitigation", "Primary Owner", "Participating Teams", "Findings", "Conflicts", "Dependencies", "Required Evidence", "Expected Benefit", "Potential Negative", "Original", "Residual", "Confidence", "Status", "Actions"]}
          rows={mitigations.map((m) => {
            const isAccepted = accepted.includes(m.id);
            return [
              <span key="t" className="font-medium text-slate-800">{m.title}</span>,
              m.owner,
              <span key="p" className="flex flex-wrap gap-1">
                {m.participatingTeamIds.map((id) => (
                  <button key={id} type="button" onClick={() => onOpenPersona(id)} className="rounded border border-slate-200 px-1 text-[10px] text-blue-700 hover:bg-slate-50">
                    {personaById(id).short}
                  </button>
                ))}
              </span>,
              m.findingIds.join(", ") || "—",
              m.conflictIds.join(", ") || "—",
              m.dependencyIds.join(", ") || "—",
              m.requiredEvidenceIds.join(", ") || "—",
              m.expectedBenefits.join("; "),
              m.negativeConsequences.join("; "),
              <Pill key="o" label={m.originalSeverity} tone={ctiTone(m.originalSeverity)} />,
              <Pill key="r" label={isAccepted ? m.residualSeverity : "Not applied"} tone={isAccepted ? ctiTone(m.residualSeverity) : "slate"} />,
              pct(m.confidence),
              <Pill key="s" label={isAccepted ? "Accepted" : m.status} tone={ctiTone(isAccepted ? "Complete" : m.status)} />,
              <span key="a" className="flex flex-wrap gap-1">
                <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAccept(m.id)}>Accept</Button>
                <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onReject(m.id)}>Reject</Button>
                <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onEdit(m)}>Edit</Button>
                <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAssign(m)}>Assign Owner</Button>
                <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onRequestEvidence(m)}>Request Evidence</Button>
              </span>,
            ];
          })} />
      </Panel>
    </Spot>
  );
}

export function MitigationTradeoffPanel({ mitigations }: { mitigations: CrossTeamMitigation[] }) {
  return (
    <Panel id="panel-mitigation-tradeoff" title="Mitigation Tradeoff Analysis"
      subtitle="Coordination effects are described, not reduced to a single optimisation score">
      <div className="grid gap-2 lg:grid-cols-2">
        {mitigations.map((m) => (
          <article key={m.id} className="rounded border border-slate-200 p-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[12px] font-semibold text-slate-900">{m.title}</h3>
              <Pill label={`${pct(m.confidence)} confidence`} tone="blue" />
            </div>
            <div className="mt-1 grid gap-1.5 sm:grid-cols-2">
              <div className="rounded bg-emerald-50 p-1.5">
                <p className="text-[9.5px] font-semibold uppercase tracking-wide text-emerald-700">Benefiting Personas</p>
                <p className="text-[11px] text-slate-700">{m.benefitingPersonaIds.map((p) => personaById(p).short).join(", ")}</p>
                <ul className="mt-0.5 list-disc pl-4 text-[10.5px] text-slate-600">
                  {m.expectedBenefits.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>
              <div className="rounded bg-amber-50 p-1.5">
                <p className="text-[9.5px] font-semibold uppercase tracking-wide text-amber-700">Adversely Affected Personas</p>
                <p className="text-[11px] text-slate-700">{m.adversePersonaIds.map((p) => personaById(p).short).join(", ")}</p>
                <ul className="mt-0.5 list-disc pl-4 text-[10.5px] text-slate-600">
                  {m.negativeConsequences.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>
            </div>
            <p className="mt-1 text-[10.5px] text-slate-600">
              Impact change · {m.originalSeverity} → {m.residualSeverity} · Evidence {m.requiredEvidenceIds.join(", ") || "none"}
            </p>
            <p className="text-[10.5px] text-slate-500">
              Net coordination effect · {m.benefitingPersonaIds.length} teams relieved, {m.adversePersonaIds.length} teams accept cost
            </p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

export function RawCoordinatedPanel({
  state, accepted, mitigations, mode, onMode, spotlight,
}: {
  state: CtiAnalysisState;
  accepted: string[];
  mitigations: CrossTeamMitigation[];
  mode: "raw" | "coordinated";
  onMode: (m: "raw" | "coordinated") => void;
  spotlight?: boolean;
}) {
  const rows = coordinatedConflicts(state, accepted, mitigations);
  return (
    <Spot on={Boolean(spotlight)}>
      <Panel id="panel-raw-coordinated" title="Raw versus Coordinated Impact"
        subtitle="Original findings are preserved after mitigation — residual impact never replaces the record that produced it"
        actions={
          <div className="flex rounded-md border border-slate-200 p-0.5" role="tablist" aria-label="Impact mode">
            {(["raw", "coordinated"] as const).map((m) => (
              <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => onMode(m)}
                className={cn("rounded px-2 py-0.5 text-[11px]", mode === m ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
                {m === "raw" ? "Raw Cross Team Impact" : "Coordinated Impact"}
              </button>
            ))}
          </div>
        }>
        <SimpleTable
          head={["Conflict", "Teams", "Original Severity", "Residual Severity", "Mitigations Applied", "Confidence"]}
          rows={rows.map((r) => [
            r.conflictId, r.label,
            <Pill key="o" label={r.rawSeverity} tone={ctiTone(r.rawSeverity)} />,
            mode === "coordinated"
              ? <Pill key="r" label={r.residualSeverity} tone={ctiTone(r.residualSeverity)} />
              : <span key="r" className="text-slate-400">Not shown in raw view</span>,
            r.mitigationsApplied.join(", ") || "None",
            pct(r.confidence),
          ])} />
      </Panel>
    </Spot>
  );
}

/* ------------------------------------------------- coordination actions -- */

export function CoordinationActionPanel({
  records, onStatus, onOpen, onEscalate, onRequestEvidence, spotlight,
}: {
  records: CoordinationRecord[];
  onStatus: (id: string, s: CoordinationStatus) => void;
  onOpen: (r: CoordinationRecord) => void;
  onEscalate: (r: CoordinationRecord) => void;
  onRequestEvidence: (r: CoordinationRecord) => void;
  spotlight?: boolean;
}) {
  return (
    <Spot on={Boolean(spotlight)}>
      <Panel id="panel-coordination-actions" title="Coordination Action Management"
        subtitle="Every required coordination has an owner, a state, evidence requirements and explicit acknowledgements">
        <SimpleTable
          head={["Action", "Description", "Primary Owner", "Participants", "Priority", "Required Before", "Evidence", "Due", "Dependencies", "Acknowledgements", "Status", "Actions"]}
          rows={records.map((r) => [
            <button key="t" type="button" onClick={() => onOpen(r)} className="font-medium text-blue-700 hover:underline">{r.title}</button>,
            r.description, r.primaryOwner, r.participants.join(", "),
            <Pill key="p" label={r.priority} tone={ctiTone(r.priority)} />,
            r.requiredBefore, r.evidenceRequirement, r.dueDate, r.dependencies.join(", ") || "—",
            r.acknowledgements.join(", ") || "None",
            <Pill key="s" label={r.status} tone={ctiTone(r.status === "Complete" ? "Complete" : r.status === "Blocked" ? "Blocked" : r.status === "Proposed" ? "Pending" : "In Progress")} />,
            <span key="a" className="flex flex-wrap items-center gap-1">
              <label className="sr-only" htmlFor={`status-${r.id}`}>Status for {r.title}</label>
              <select id={`status-${r.id}`} value={r.status} onChange={(e) => onStatus(r.id, e.target.value as CoordinationStatus)}
                className="h-6 rounded border border-slate-200 px-1 text-[10px]">
                {coordinationStatuses.map((s) => <option key={s}>{s}</option>)}
              </select>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onStatus(r.id, "Acknowledged")}>Acknowledge</Button>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onRequestEvidence(r)}>Request Evidence</Button>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onStatus(r.id, "Complete")}>Mark Complete</Button>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onStatus(r.id, "Blocked")}>Block</Button>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onEscalate(r)}>Escalate</Button>
            </span>,
          ])} />
      </Panel>
    </Spot>
  );
}

/* --------------------------------------------------- acknowledgement ----- */

export function AcknowledgementPanel({
  acks, onAct, onOpenPersona, spotlight,
}: {
  acks: CrossTeamAcknowledgement[];
  onAct: (id: string, status: AckStatus) => void;
  onOpenPersona: (id: string) => void;
  spotlight?: boolean;
}) {
  return (
    <Spot on={Boolean(spotlight)}>
      <Panel id="panel-acknowledgement" title="Team Acknowledgement"
        subtitle="Acknowledgement records that a team has seen and understood its cross team findings — it is not approval">
        <SimpleTable
          head={["Team", "Persona Owner", "Top Finding", "Required Action", "Review State", "Acknowledgement", "Conditions", "Comments", "Timestamp", "Actions"]}
          rows={acks.map((a) => [
            <button key="t" type="button" onClick={() => onOpenPersona(a.personaId)} className="font-medium text-blue-700 hover:underline">{a.teamId}</button>,
            a.personaOwner, a.topFinding, a.requiredAction, a.reviewState,
            <Pill key="s" label={a.status} tone={a.status === "Acknowledged" ? "green" : a.status === "Disagrees" ? "red" : "amber"} />,
            a.conditions.join("; ") || "—",
            a.comments, a.acknowledgedAt,
            <span key="a" className="flex flex-wrap gap-1">
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAct(a.id, "Acknowledged")}>Acknowledge</Button>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAct(a.id, "Acknowledged with Conditions")}>With Conditions</Button>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAct(a.id, "Correction Requested")}>Request Correction</Button>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAct(a.id, "Evidence Required")}>Request Evidence</Button>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAct(a.id, "Disagrees")}>Escalate</Button>
            </span>,
          ])} />
      </Panel>
    </Spot>
  );
}

/* --------------------------------------------------------- reviews ------- */

export function PersonaOwnerReviewPanel({
  state, reviews, onAction, onOpenPersona,
}: {
  state: CtiAnalysisState;
  reviews: CrossTeamImpactReview[];
  onAction: (personaId: string, action: string) => void;
  onOpenPersona: (id: string) => void;
}) {
  const conflicts = conflictsFor(state);
  const deps = dependenciesFor(state);
  return (
    <Panel id="panel-persona-owner-review" title="Persona Owner Cross Team Review"
      subtitle="Owners validate that the synthesis represents their team accurately — the published Persona is never modified here">
      <SimpleTable
        head={["Persona", "Version", "Original Findings", "Intersections", "Conflicts", "Shared Dependencies", "Mitigations", "Review", "Actions"]}
        rows={ctiPersonas.map((p) => {
          const rev = reviews.find((r) => r.personaId === p.id);
          return [
            <button key="p" type="button" onClick={() => onOpenPersona(p.id)} className="font-medium text-blue-700 hover:underline">{p.name}</button>,
            personaVersionSensitivity.find((v) => v.personaId === p.id)?.toVersion ?? "v2.0",
            p.primaryRisk,
            conflicts.filter((c) => c.personaAId === p.id || c.personaBId === p.id).length,
            conflicts.filter((c) => (c.personaAId === p.id || c.personaBId === p.id) && c.status === "Open").length,
            deps.filter((d) => d.affectedPersonaIds.includes(p.id)).length,
            p.reviewRequired ? "Required" : "Optional",
            <Pill key="s" label={rev?.status ?? "Open"} tone={ctiTone(rev?.status ?? "Open")} />,
            <span key="a" className="flex flex-wrap gap-1">
              {["Confirm Representation", "Challenge Intersection", "Challenge Conflict", "Accept Mitigation", "Reject Mitigation", "Request Evidence", "Request Persona Refresh", "Request Reanalysis"].map((act) => (
                <Button key={act} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAction(p.id, act)}>{act}</Button>
              ))}
            </span>,
          ];
        })} />
    </Panel>
  );
}

export function DependencyOwnerReviewPanel({
  reviews, onAction,
}: { reviews: DependencyOwnerReview[]; onAction: (dependencyId: string, action: string) => void }) {
  return (
    <Panel id="panel-dependency-owner-review" title="Dependency Owner Review"
      subtitle="Critical shared dependencies are reviewed by the team that owns them">
      <SimpleTable
        head={["Dependency", "Owner", "Affected Teams", "Impact", "Capacity Signal", "Failure Propagation", "Required Evidence", "Reviewer", "Status", "Actions"]}
        rows={reviews.map((r) => [
          <span key="d" className="font-medium text-slate-800">{r.dependency}</span>,
          r.owner, r.affectedTeams.join(", "), r.impact, r.capacitySignal, r.failurePropagation, r.requiredEvidence, r.reviewer,
          <Pill key="s" label={r.status} tone={ctiTone(r.status)} />,
          <span key="a" className="flex flex-wrap gap-1">
            {["Confirm", "Challenge", "Add Evidence", "Change Criticality", "Request Load Test", "Escalate"].map((act) => (
              <Button key={act} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAction(r.dependencyId, act)}>{act}</Button>
            ))}
          </span>,
        ])} />
    </Panel>
  );
}

/* ------------------------------------------------------- escalation ------ */

export function EscalationPanel({
  escalations, onCreate,
}: { escalations: CrossTeamEscalation[]; onCreate: () => void }) {
  return (
    <Panel id="panel-escalation" title="Cross Team Escalation"
      subtitle="Escalation records an unresolved enterprise tradeoff; it does not decide it"
      actions={<Button size="sm" className="h-7 text-[11px]" onClick={onCreate}>Create Escalation</Button>}>
      {escalations.length === 0
        ? <EmptyState message="No escalations recorded for this analysis" hint="Escalate from a conflict, dependency or coordination action" />
        : (
          <SimpleTable
            head={["Escalation", "Issue Type", "Title", "Severity", "Affected Teams", "Business", "Customer", "Technical", "Evidence", "Owner", "Due", "Status"]}
            rows={escalations.map((e) => [
              e.id, e.issueType, e.title,
              <Pill key="s" label={e.severity} tone={ctiTone(e.severity)} />,
              e.affectedTeamIds.map((t) => personaById(t).short).join(", "),
              e.businessImpact, e.customerImpact, e.technicalImpact, e.evidenceReferenceIds.join(", ") || "—",
              e.owner, e.dueDate,
              <Pill key="st" label={e.status} tone={ctiTone(e.status === "Resolved" ? "Complete" : "Open")} />,
            ])} />
        )}
    </Panel>
  );
}

/* ---------------------------------------------- evidence remediation ----- */

export function EvidenceRemediationPanel({
  state, onAdd, onRequest,
}: { state: CtiAnalysisState; onAdd: (evidenceId: string) => void; onRequest: (evidenceId: string) => void }) {
  const evidence = evidenceState(state);
  return (
    <Panel id="panel-evidence-remediation" title="Evidence Remediation"
      subtitle="Adding evidence updates coverage, intersections, confidence, deterministic conflicts and coordination actions">
      <SimpleTable
        head={["Evidence", "Type", "Authority", "Recency", "Personas", "Status", "Actions"]}
        rows={evidence.map((e) => [
          e.label, e.type, e.authority, e.recency,
          e.personaIds.map((p) => personaById(p).short).join(", "),
          <Pill key="s" label={e.status} tone={ctiTone(e.status)} />,
          <span key="a" className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAdd(e.id)}>Add Evidence</Button>
            <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onRequest(e.id)}>Request Evidence</Button>
          </span>,
        ])} />
      <p className="mt-1 text-[10.5px] text-slate-500">Evidence types available: {evidenceTypes.join(", ")}.</p>
    </Panel>
  );
}

/* --------------------------------------------------- version sensitivity - */

export function PersonaVersionSensitivityPanel() {
  return (
    <Panel id="panel-persona-sensitivity" title="Cross Team Persona Version Sensitivity"
      subtitle="Persona version changes move matrix severities, conflicts, coordination and required reviewers">
      <div className="grid gap-2 lg:grid-cols-2">
        {personaVersionSensitivity.map((s) => (
          <article key={s.personaId} className="rounded border border-slate-200 p-2">
            <h3 className="text-[12px] font-semibold text-slate-900">
              {personaById(s.personaId).name} {s.fromVersion} versus {s.toVersion}
            </h3>
            <p className="text-[11px] text-slate-600">{s.driver}</p>
            <div className="mt-1 grid grid-cols-2 gap-1 text-[10.5px] text-slate-600">
              <Row label="Matrix cells added" value={String(s.cellsAdded)} />
              <Row label="Matrix cells removed" value={String(s.cellsRemoved)} />
            </div>
            <ul className="mt-1 space-y-0.5 text-[10.5px] text-slate-700">
              {s.severityChanges.map((c) => (
                <li key={c.cell} className="flex items-center gap-1">
                  <span>{c.cell}</span>
                  <Pill label={c.from} tone={ctiTone(c.from)} />
                  <span aria-hidden>→</span>
                  <Pill label={c.to} tone={ctiTone(c.to)} />
                </li>
              ))}
              {s.conflictChanges.map((c) => <li key={c}>Conflict · {c}</li>)}
              {s.coordinationChanges.map((c) => <li key={c}>Coordination · {c}</li>)}
              {s.reviewerChanges.map((c) => <li key={c}>Reviewer · {c}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </Panel>
  );
}

export function ConditionSensitivityPanel({
  mode, onMode,
}: { mode: string; onMode: (m: string) => void }) {
  return (
    <Panel id="panel-condition-sensitivity" title="Cross Team Condition Sensitivity"
      subtitle="Condition records are never modified — historical values are simulated for comparison only"
      actions={
        <div className="flex rounded-md border border-slate-200 p-0.5" role="tablist" aria-label="Condition sensitivity mode">
          {["Compare", "Use Current Approved", "Historical Simulation"].map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => onMode(m)}
              className={cn("rounded px-2 py-0.5 text-[11px]", mode === m ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
              {m}
            </button>
          ))}
        </div>
      }>
      <SimpleTable
        head={["Condition", "Label", "Historical", "Current", "Affected Personas", "Matrix Effect", "Coordination Effect"]}
        rows={conditionSensitivity.map((c) => [
          c.conditionId, c.label,
          mode === "Use Current Approved" ? <span key="h" className="text-slate-400">Not applied</span> : c.oldValue,
          c.currentValue,
          c.affectedPersonaIds.map((p) => personaById(p).short).join(", "),
          c.matrixEffect, c.coordinationEffect,
        ])} />
    </Panel>
  );
}

/* ---------------------------------------------------- version history ---- */

export function VersionHistoryPanel({
  versions, selected, onSelect, onCompare, onSimulate, onExport,
}: {
  versions: CrossTeamAnalysisVersion[];
  selected: string;
  onSelect: (id: string) => void;
  onCompare: (id: string) => void;
  onSimulate: (id: string) => void;
  onExport: (id: string) => void;
}) {
  return (
    <Panel id="panel-version-history" title="Cross Team Analysis Version History"
      subtitle="Reanalysis always produces a new version — prior analyses are never overwritten">
      <SimpleTable
        head={["Version", "Timestamp", "Persona Versions", "Condition Versions", "Coverage", "Critical", "High", "Conflicts", "Dependencies", "Mitigations", "Actions", "Confidence", "Reason", ""]}
        rows={versions.map((v) => [
          <span key="v" className="flex items-center gap-1">
            <span className="font-medium text-slate-800">{v.analysisId} v{v.version}</span>
            {selected === v.id && <Pill label="Open" tone="blue" />}
          </span>,
          v.createdAt,
          Object.entries(v.personaVersions).map(([k, val]) => `${personaById(k).short} ${val}`).join(", "),
          Object.entries(v.conditionVersions).map(([k, val]) => `${k} ${val}`).join(", "),
          pct(v.matrixCoverage), v.criticalCells, v.highCells, v.conflicts, v.dependencies, v.mitigations,
          v.coordinationActions, pct(v.confidence), v.changeReason,
          <span key="a" className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onSelect(v.id)}>Open</Button>
            <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onCompare(v.id)}>Compare</Button>
            <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onSimulate(v.id)}>Restore as Simulation</Button>
            <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onExport(v.id)}>Export</Button>
          </span>,
        ])} />
    </Panel>
  );
}

export function VersionComparisonPanel({
  versions, left, right, onLeft, onRight,
}: {
  versions: CrossTeamAnalysisVersion[];
  left: string;
  right: string;
  onLeft: (id: string) => void;
  onRight: (id: string) => void;
}) {
  const a = versions.find((v) => v.id === left) ?? versions[0];
  const b = versions.find((v) => v.id === right) ?? versions[versions.length - 1];
  const rows = useMemo(() => compareVersions(a, b), [a, b]);
  return (
    <Panel id="panel-version-comparison" title="Cross Team Analysis Version Comparison"
      subtitle="Material changes are distinguished from incidental ones"
      actions={
        <div className="flex items-center gap-1">
          <label className="text-[10px] uppercase tracking-wide text-slate-500">Left
            <select value={left} onChange={(e) => onLeft(e.target.value)} className="ml-1 h-6 rounded border border-slate-200 px-1 text-[11px] normal-case">
              {versions.map((v) => <option key={v.id} value={v.id}>v{v.version}</option>)}
            </select>
          </label>
          <label className="text-[10px] uppercase tracking-wide text-slate-500">Right
            <select value={right} onChange={(e) => onRight(e.target.value)} className="ml-1 h-6 rounded border border-slate-200 px-1 text-[11px] normal-case">
              {versions.map((v) => <option key={v.id} value={v.id}>v{v.version}</option>)}
            </select>
          </label>
        </div>
      }>
      <SimpleTable
        head={["Field", `v${a.version}`, `v${b.version}`, "State"]}
        rows={rows.map((r) => [
          r.field, r.left, r.right,
          <Pill key="s" label={r.state}
            tone={r.state === "Material Change" ? "red" : r.state === "Changed" ? "amber" : r.state === "Added" ? "green" : "slate"} />,
        ])} />
      <p className="sr-only">
        Comparing version {a.version} with version {b.version}. {rows.filter((r) => r.state === "Material Change").length} material changes recorded.
      </p>
    </Panel>
  );
}

/* -------------------------------------------------- decision package ----- */

export function DecisionPackagePanel({
  pkg, readiness, onRoute, onExport, onOpenValidation, spotlight,
}: {
  pkg: CrossTeamDecisionPackage;
  readiness: string;
  onRoute: () => void;
  onExport: () => void;
  onOpenValidation: () => void;
  spotlight?: boolean;
}) {
  return (
    <Spot on={Boolean(spotlight)}>
      <Panel id="panel-decision-package" title="Cross Team Decision Context Package"
        subtitle="Structured enterprise context for Decision Intelligence — this page does not issue the decision"
        className="border-blue-200 bg-blue-50/40"
        actions={
          <>
            <Pill label={readiness} tone={readiness === "Decision Context Ready" ? "green" : "amber"} />
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onOpenValidation}>Validate Handoff</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onExport}>Export Package</Button>
            <Button size="sm" className="h-7 text-[11px]" onClick={onRoute}>Proceed to Decision Intelligence</Button>
          </>
        }>
        <p className="rounded border border-blue-200 bg-white p-2 text-[12px] text-slate-800">{decisionFraming}</p>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
          <Row label="Work Item" value="Checkout Retry Policy Update" />
          <Row label="Analysis Version" value={pkg.analysisVersionId} />
          <Row label="Personas Evaluated" value={`${pkg.personaIds.length}`} />
          <Row label="Analysis Confidence" value={pct(pkg.analysisConfidence)} />
          <Row label="Critical Intersections" value={`${pkg.criticalIntersectionIds.length}`} />
          <Row label="High Intersections" value={`${pkg.highIntersectionIds.length}`} />
          <Row label="Shared Dependencies" value={`${pkg.sharedDependencyIds.length}`} />
          <Row label="Persona Conflicts" value={`${pkg.conflictIds.length}`} />
          <Row label="Cross Team Agreements" value={`${pkg.agreementIds.length}`} />
          <Row label="Shared Opportunities" value={`${pkg.opportunityIds.length}`} />
          <Row label="Accepted Mitigations" value={pkg.mitigationIds.join(", ") || "None"} />
          <Row label="Coordination Actions" value={`${pkg.coordinationActionIds.length}`} />
          <Row label="Team Acknowledgements" value={`${pkg.acknowledgementIds.length}`} />
          <Row label="Evidence" value={`${pkg.evidenceIds.length} provided`} />
          <Row label="Evidence Gaps" value={pkg.missingEvidence.join("; ") || "None"} />
          <Row label="Escalations" value={`${pkg.escalationIds.length}`} />
        </div>
        <div className="mt-2 grid gap-2 lg:grid-cols-3">
          <div className="rounded border border-slate-200 bg-white p-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Governance requirements</p>
            <ul className="mt-0.5 list-disc pl-4 text-[11px] text-slate-700">
              {pkg.governanceRequirements.map((g) => <li key={g}>{g}</li>)}
            </ul>
          </div>
          <div className="rounded border border-slate-200 bg-white p-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Conditions for downstream consideration</p>
            <ul className="mt-0.5 list-disc pl-4 text-[11px] text-slate-700">
              {decisionConditions.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
          <div className="rounded border border-slate-200 bg-white p-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Open issues</p>
            {pkg.openIssues.length
              ? <ul className="mt-0.5 list-disc pl-4 text-[11px] text-slate-700">{pkg.openIssues.map((o) => <li key={o}>{o}</li>)}</ul>
              : <p className="text-[11px] text-slate-500">No open issues recorded</p>}
          </div>
        </div>
      </Panel>
    </Spot>
  );
}

export function ReadinessPanel({
  state, accepted, acks, records,
}: {
  state: CtiAnalysisState;
  accepted: string[];
  acks: CrossTeamAcknowledgement[];
  records: CoordinationRecord[];
}) {
  const { metrics, state: readiness } = readinessMetrics(state, accepted, acks, records);
  return (
    <Panel id="panel-readiness" title="Cross Team Analysis Readiness"
      subtitle="Analysis completion, coordination progress, review completion and decision readiness are distinct states"
      actions={<Pill label={readiness} tone={readiness === "Decision Context Ready" ? "green" : "amber"} />}>
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((m) => (
          <div key={m.name} className="rounded border border-slate-200 p-1.5">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">{m.name}</p>
            <div className="flex items-center gap-1.5">
              <Progress value={m.value} className="h-1.5 flex-1" />
              <span className="text-[11px] tabular-nums text-slate-700">{pct(m.value)}</span>
            </div>
            <p className="text-[9.5px] text-slate-500">
              Target {pct(m.target)} · {m.value >= m.target ? "met" : "below target"}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------ notifications ---- */

export function NotificationsPanel({
  notifications, filter, onFilter, onRead, onReadAll, onOpen,
}: {
  notifications: CrossTeamNotification[];
  filter: string;
  onFilter: (f: string) => void;
  onRead: (id: string) => void;
  onReadAll: () => void;
  onOpen: (n: CrossTeamNotification) => void;
}) {
  const rows = notifications.filter((n) => filter === "All" || n.type === filter);
  const unread = notifications.filter((n) => n.status === "Unread").length;
  return (
    <Panel id="panel-notifications" title="Notifications"
      subtitle={`${unread} unread coordination notifications`}
      actions={
        <>
          <label className="text-[10px] uppercase tracking-wide text-slate-500">Type
            <select value={filter} onChange={(e) => onFilter(e.target.value)} className="ml-1 h-6 rounded border border-slate-200 px-1 text-[11px] normal-case">
              {["All", ...Array.from(new Set(notifications.map((n) => n.type)))].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onReadAll}>Mark All Read</Button>
        </>
      }>
      {rows.length === 0 ? <EmptyState message="No notifications match this filter" /> : (
        <ul className="divide-y divide-slate-100">
          {rows.map((n) => (
            <li key={n.id} className="flex flex-wrap items-center gap-2 py-1.5">
              <Pill label={n.type} tone={ctiTone(n.severity)} />
              <span className={cn("text-[11.5px]", n.status === "Unread" ? "font-semibold text-slate-900" : "text-slate-600")}>{n.title}</span>
              <span className="text-[10.5px] text-slate-500">{n.description}</span>
              <span className="ml-auto text-[10.5px] text-slate-500">{n.owner} · {n.createdAt}</span>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onOpen(n)}>Open</Button>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onRead(n.id)}>Mark Read</Button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function OpsActivityPanel({ activity }: { activity: OpsActivity[] }) {
  return (
    <Panel id="panel-ops-activity" title="Recent Cross Team Activity"
      subtitle="Scenario changes, mitigations, evidence, acknowledgement, escalation, reanalysis and routing are all recorded">
      <ol className="space-y-1">
        {activity.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center gap-2 rounded border border-slate-100 bg-slate-50/50 px-2 py-1">
            <span className="w-16 text-[10.5px] tabular-nums text-slate-500">{a.timestamp}</span>
            <Pill label={a.action} tone="blue" />
            <span className="text-[11px] text-slate-700">{a.description}</span>
            <span className="ml-auto text-[10.5px] text-slate-500">{a.owner}</span>
            <Pill label={a.result} tone={ctiTone(a.result)} />
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ------------------------------------------------------- demo controls --- */

export function DemoScenarioBar({
  scenarios, active, onSelect,
}: { scenarios: { id: string; name: string; description: string; note: string }[]; active: string | null; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Panel id="panel-demo-scenarios" title="Demo Scenarios"
      subtitle="Each scenario updates KPIs, lifecycle, queue, matrix, workbench, dependencies, conflicts, mitigations, coordination, acknowledgement, readiness, activity and notifications consistently"
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? "Hide" : "Show"} scenarios</Button>}>
      {open && (
        <div className="flex flex-wrap gap-1.5">
          {scenarios.map((s) => (
            <button key={s.id} type="button" onClick={() => onSelect(s.id)} title={s.note}
              className={cn("rounded border px-2 py-1 text-left text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
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
      className="fixed bottom-3 left-1/2 z-50 w-[min(760px,94vw)] -translate-x-1/2 rounded-lg border border-blue-300 bg-white p-3 shadow-xl">
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

/* --------------------------------------------------- severity summary ---- */

export function severitySummary(state: CtiAnalysisState): { label: string; tone: Severity } {
  const worst = conflictsFor(state)
    .filter((c) => c.status !== "Not Required")
    .reduce<Severity>((acc, c) => (severityRank(c.severity) > severityRank(acc) ? c.severity : acc), "Low");
  return { label: `Highest active conflict severity ${worst}`, tone: worst };
}
