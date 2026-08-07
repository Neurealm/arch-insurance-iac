/** Enterprise Cognitive Health — Prompt 2 operational panels. */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, TriangleAlert, X } from "lucide-react";
import { Pill, Row, type Tone } from "../persona-studio/primitives";
import { Panel, EmptyState } from "../cognitive-memory/panels";
import { bandFor, chTone, dimensions, trendLabel } from "./data";
import {
  causalityDisclaimer, comparisonModes, compareSnapshots, controlProgress, currentPolicy,
  dimName, echiPolicyVersions, escalationLevels, executiveAnswers, executiveQuestions,
  governanceDimensions, governanceMetrics, healthControls, interventionSummary,
  policyWeightTotal, policyWeightsValid, projectHealth, projectionDisclaimer, projectionHorizons,
  projectionTypes, reassessmentSafety, reviewQueueSummary, riskAcceptanceRule, scenarioComputation,
  scenarioNoRecommendation, seedThresholds, sensitivityAnalysis, sensitivityDisclaimer, signalName,
  snapshotEchi, snapshotHistory,
  type CognitiveHealthAlert, type CognitiveHealthDecisionExposure, type CognitiveHealthEscalation,
  type CognitiveHealthExecutiveBrief, type CognitiveHealthIntervention,
  type CognitiveHealthInterventionMeasurement, type CognitiveHealthNotification,
  type CognitiveHealthPolicyDimension, type CognitiveHealthReassessment, type CognitiveHealthReview,
  type CognitiveHealthRiskAcceptance, type CognitiveHealthScenario, type ComparisonMode,
  type CriticalOverride, type HealthControls, type HealthDemoScenario, type HealthOpsActivity,
  type HealthSnapshotRecord, type HealthStoryStep, type ProjectionHorizon, type ProjectionType,
} from "./ops-data";

/* ----------------------------------------------------------------- helpers */

export function OpsTable({ head, rows, caption, minWidth = 780 }: {
  head: string[]; rows: React.ReactNode[][]; caption?: string; minWidth?: number;
}) {
  if (!rows.length) return <EmptyState message="No records match the current state" />;
  return (
    <div className="overflow-x-auto rounded border border-slate-200">
      <table className="w-full border-collapse text-left" style={{ minWidth }}>
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
              {r.map((c, j) => <td key={j} className="px-2 py-1.5 align-top text-[11px] text-slate-700">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Note = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-1.5 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10.5px] text-slate-600">{children}</p>
);

const StateChip = ({ label }: { label: string }) => <Pill label={label} tone={chTone(label)} />;

/* ================================================= critical override ===== */

export function CriticalOverrideBanner({ override, echi, onOpen }: {
  override: CriticalOverride; echi: number; onOpen: () => void;
}) {
  if (!override.active) return null;
  return (
    <div role="alert" className="flex flex-wrap items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-2.5">
      <TriangleAlert className="mt-0.5 h-4 w-4 text-red-600" aria-hidden />
      <div className="min-w-[240px] flex-1">
        <p className="text-[12px] font-semibold text-red-800">
          Critical Attention · Enterprise Cognitive Health Index {echi} does not clear the underlying Critical signals
        </p>
        <p className="text-[11px] text-red-700">{override.reason}</p>
        <p className="mt-0.5 text-[10.5px] text-red-700">
          Critical signals: {override.signalIds.map(signalName).join(", ") || "None"} · Affected decisions: {override.affectedDecisionIds.join(", ") || "None"}
        </p>
      </div>
      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onOpen}>Open Critical Signals</Button>
    </div>
  );
}

/* ========================================== 2 · threshold governance ===== */

export function ThresholdGovernancePanel({ policyVersion, onPropose }: {
  policyVersion: string; onPropose: () => void;
}) {
  const [scope, setScope] = useState("Enterprise");
  return (
    <Panel id="panel-thresholds" title="Cognitive Health Thresholds"
      subtitle="Threshold configuration by dimension and scope. Response Latency also carries duration based source thresholds. Threshold changes create a new policy version and never rewrite historical snapshots"
      actions={
        <>
          <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
            <span className="sr-only">Threshold scope</span>
            <select value={scope} onChange={(e) => setScope(e.target.value)}
              className="h-7 rounded border border-slate-200 px-1.5 text-[11px]">
              {["Enterprise", "Business Unit", "Team Persona", "Knowledge Domain"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <Pill label={`Policy ${policyVersion}`} tone="blue" />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onPropose}>Propose Threshold Change</Button>
        </>
      }>
      <OpsTable
        caption="Health band thresholds by dimension"
        head={["Threshold", "Dimension", "Signal", "Scope", "Strong", "Healthy", "Attention", "Needs Attention / At Risk", "Critical", "Unit", "Owner", "Effective"]}
        rows={seedThresholds.map((t) => [
          t.id, dimName(t.dimensionId), t.signalId ? signalName(t.signalId) : "All dimension signals",
          `${t.scopeType} · ${scope === "Enterprise" ? t.scopeId : scope}`,
          t.strongThreshold, t.healthyThreshold, t.attentionThreshold, t.atRiskThreshold, t.criticalThreshold,
          t.unit, t.owner, t.effectiveDate,
        ])} />
      <Note>
        Bands are Strong, Healthy, Healthy with Attention Areas, Needs Attention, At Risk, Critical and Unknown.
        Historical health snapshots keep the threshold version that was effective when they were measured.
      </Note>
    </Panel>
  );
}

/* ============================================= 3 · scoring policy ======== */

export function ScoringPolicyPanel({
  rows, onWeight, onPreview, onCompare, onSaveDraft, onSubmit, approvalState, version, previewEchi,
}: {
  rows: CognitiveHealthPolicyDimension[];
  onWeight: (dimensionId: string, weight: number) => void;
  onPreview: () => void;
  onCompare: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  approvalState: string;
  version: string;
  previewEchi: number | null;
}) {
  const total = policyWeightTotal(rows);
  const valid = policyWeightsValid(rows);
  return (
    <Panel id="panel-scoring-policy" title="Enterprise Cognitive Health Scoring Policy"
      subtitle="The weighted index is never the only representation of health. Critical signals and dimension detail remain visible regardless of the index"
      actions={
        <>
          <Pill label={`${version} · ${approvalState}`} tone={approvalState === "Approved" ? "green" : "amber"} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onPreview}>Preview Policy</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onCompare}>Compare Policy Version</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onSaveDraft}>Save Draft</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={onSubmit} disabled={!valid}>Submit for Governance</Button>
        </>
      }>
      <OpsTable
        caption="Scoring policy by dimension"
        head={["Dimension", "Contribution Weight", "Min Signal Coverage", "Min Confidence", "Critical Override Rule", "Missing Data Treatment", "Target", "Owner", "Version"]}
        rows={rows.map((r) => [
          dimName(r.dimensionId),
          <label key="w" className="flex items-center gap-1">
            <span className="sr-only">{dimName(r.dimensionId)} contribution weight percent</span>
            <input type="number" min={0} max={100} step={1} value={Math.round(r.weight * 100)}
              onChange={(e) => onWeight(r.dimensionId, Number(e.target.value) / 100)}
              className="h-6 w-14 rounded border border-slate-200 px-1 text-[11px]" />
            <span className="text-[10.5px] text-slate-500">%</span>
          </label>,
          `${r.minimumSignalCoverage}%`, `${r.minimumConfidence}%`, r.criticalOverrideRule,
          r.missingDataTreatment, r.target, r.owner, version,
        ])} />
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <Pill label={`Total ${Math.round(total * 100)}%`} tone={valid ? "green" : "red"} />
        {!valid && <span className="text-[10.5px] text-red-700">Contribution weights must total 100% before the policy can be submitted for governance.</span>}
        {previewEchi !== null && <Pill label={`Preview index ${previewEchi} · ${bandFor(previewEchi)}`} tone="blue" />}
      </div>
      <Note>
        Critical override: if a Critical signal affects an active high priority enterprise decision, the overall
        health state displays an attention banner even when the index remains above threshold.
      </Note>
    </Panel>
  );
}

/* ============================================ 4 · health review queue ==== */

export function HealthReviewQueuePanel({
  reviews, selectedId, onSelect, onAction, severityFilter, onSeverityFilter,
}: {
  reviews: CognitiveHealthReview[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAction: (id: string, action: string) => void;
  severityFilter: string;
  onSeverityFilter: (v: string) => void;
}) {
  const rows = useMemo(
    () => reviews.filter((r) => severityFilter === "All" || r.severity === severityFilter),
    [reviews, severityFilter],
  );
  return (
    <Panel id="panel-review-queue" title="Enterprise Cognitive Health Review Queue"
      subtitle="Governed review of health signals that fall outside their threshold"
      actions={
        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          <span className="sr-only">Filter reviews by severity</span>
          <select value={severityFilter} onChange={(e) => onSeverityFilter(e.target.value)}
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px]">
            {["All", "Critical", "High", "Medium High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      }>
      <div className="mb-2 flex flex-wrap gap-1.5">
        <Pill label={`Open Reviews ${reviewQueueSummary.open}`} tone="blue" />
        <Pill label={`Critical ${reviewQueueSummary.critical}`} tone="red" />
        <Pill label={`High ${reviewQueueSummary.high}`} tone="amber" />
        <Pill label={`Medium ${reviewQueueSummary.medium}`} tone="slate" />
        <Pill label={`Low ${reviewQueueSummary.low}`} tone="green" />
      </div>
      <OpsTable
        caption="Health review queue"
        minWidth={1180}
        head={["Review ID", "Health Signal", "Dimension", "Scope", "Issue Type", "Severity", "Current", "Target", "Trend", "Affected Decisions", "Owner", "Due", "Status", "Actions"]}
        rows={rows.map((r) => [
          <button key="id" type="button" onClick={() => onSelect(r.id)}
            className={cn("rounded px-1 text-[11px] font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              selectedId === r.id ? "bg-blue-50 text-blue-800" : "text-slate-800")}>
            {r.id}
          </button>,
          signalName(r.signalId), dimName(r.dimensionId), `${r.scopeType} · ${r.scopeId}`, r.issueType,
          <StateChip key="sev" label={r.severity} />, r.currentValue, r.targetValue, trendLabel(r.trend),
          r.affectedDecisionIds.length ? `${r.affectedDecisionIds.length} active · ${r.affectedDecisionIds.join(", ")}` : "None",
          r.owner, r.dueDate, <StateChip key="st" label={r.status} />,
          <div key="a" className="flex flex-wrap gap-1">
            {["Open Review", "Assign Owner", "Create Intervention", "Request Reassessment", "Acknowledge", "Escalate", "Mark Accepted Risk"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]"
                onClick={() => onAction(r.id, a)}>{a}</Button>
            ))}
          </div>,
        ])} />
    </Panel>
  );
}

/* ========================================= 5 · health review workbench === */

export function HealthReviewWorkbenchPanel({ review, onDecision }: {
  review: CognitiveHealthReview | null;
  onDecision: (decision: string) => void;
}) {
  const decisions = [
    "Create Intervention", "Request Data Refresh", "Request Persona Refresh", "Request Dependency Validation",
    "Request Learning Publication", "Assign Coordination Owner", "Request Evidence", "Accept Temporary Risk",
    "Escalate", "Dismiss Signal as Invalid",
  ];
  return (
    <Panel id="panel-review-workbench" title="Health Review Workbench"
      subtitle="Four synchronized regions: the health issue, its evidence and contributors, the enterprise consequence, and the governed review decision">
      {!review ? (
        <EmptyState message="Select a review from the Enterprise Cognitive Health Review Queue"
          hint="Open Review loads the synchronized health review workspace." />
      ) : (
        <div className="grid gap-2 lg:grid-cols-4">
          <section aria-label="Region 1 health issue" className="rounded border border-slate-200 p-2">
            <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Region 1 · Health Issue</p>
            <dl className="mt-0.5">
              <Row label="Signal" value={signalName(review.signalId)} />
              <Row label="Dimension" value={dimName(review.dimensionId)} />
              <Row label="Scope" value={`${review.scopeType} · ${review.scopeId}`} />
              <Row label="Current" value={review.currentValue} />
              <Row label="Target" value={review.targetValue} />
              <Row label="Trend" value={trendLabel(review.trend)} />
              <Row label="Severity" value={<StateChip label={review.severity} />} />
              <Row label="Confidence" value="91%" />
            </dl>
          </section>

          <section aria-label="Region 2 evidence and contributors" className="rounded border border-slate-200 p-2">
            <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Region 2 · Evidence &amp; Contributors</p>
            <dl className="mt-0.5">
              <Row label="Source ECF Modules" value="Enterprise Cognitive Memory · Cross Team Impact Analysis · Decision Intelligence" />
              <Row label="Underlying Records" value={`${review.id} evidence set · SRC ${review.signalId.slice(-4)}A · SRC ${review.signalId.slice(-4)}B`} />
              <Row label="Diagnostic Paths" value="Aging dependency evidence increases persona impact uncertainty, which increases cross team review time" />
              <Row label="Affected Teams" value={review.affectedPersonaIds.join(", ") || "None recorded"} />
              <Row label="Affected Decisions" value={review.affectedDecisionIds.join(", ") || "None"} />
            </dl>
          </section>

          <section aria-label="Region 3 enterprise consequence" className="rounded border border-slate-200 p-2">
            <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Region 3 · Enterprise Consequence</p>
            <dl className="mt-0.5">
              <Row label="Current Consequence" value="Coordination is carried by individuals rather than the operating model" />
              <Row label="Potential Future Consequence" value="Impact is discovered during execution instead of during design" />
              <Row label="Decision Exposure" value={review.affectedDecisionIds.length ? `${review.affectedDecisionIds.length} active decisions` : "No active decision exposure"} />
              <Row label="Customer Exposure" value={review.dimensionId === "DIM DV" ? "Authentication interruption risk during regional cutover" : "Indirect · slower issue resolution"} />
              <Row label="Operational Exposure" value="Additional review cycles and unplanned escalation" />
              <Row label="Learning Impact" value="Repeated coordination cost on similar future decisions" />
            </dl>
          </section>

          <section aria-label="Region 4 health review decision" className="rounded border border-slate-200 p-2">
            <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Region 4 · Health Review Decision</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {decisions.map((d) => (
                <Button key={d} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onDecision(d)}>{d}</Button>
              ))}
            </div>
            <Note>
              A written comment is required for risk acceptance, signal dismissal, threshold override and intervention cancellation.
            </Note>
            {review.decision && <p className="mt-1 text-[10.5px] text-slate-600">Recorded decision: <span className="font-medium text-slate-800">{review.decision}</span></p>}
            {review.comments && <p className="text-[10.5px] text-slate-500">Comment: {review.comments}</p>}
          </section>
        </div>
      )}
    </Panel>
  );
}

/* ================================================= 6 · alerts ============ */

export function HealthAlertsPanel({ alerts, onAction }: {
  alerts: CognitiveHealthAlert[];
  onAction: (id: string, action: string) => void;
}) {
  const [showMuted, setShowMuted] = useState(true);
  const rows = alerts.filter((a) => showMuted || a.status !== "Muted");
  return (
    <Panel id="panel-health-alerts" title="Cognitive Health Alerts"
      subtitle="Threshold and deterioration alerts. Muting hides a synthetic alert from the working view but never deletes audit history"
      actions={
        <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
          <input type="checkbox" checked={showMuted} onChange={(e) => setShowMuted(e.target.checked)} />
          Show muted alerts
        </label>
      }>
      <OpsTable
        caption="Cognitive health alerts"
        minWidth={1120}
        head={["Alert", "Type", "Dimension", "Scope", "Severity", "Triggered", "Current", "Threshold", "Affected Decisions", "Owner", "Status", "Actions"]}
        rows={rows.map((a) => [
          a.id, a.alertType, dimName(a.dimensionId), a.scopeId, <StateChip key="s" label={a.severity} />,
          a.triggeredAt, a.currentValue, a.threshold, a.affectedDecisionIds.join(", ") || "None", a.owner,
          <StateChip key="st" label={a.status} />,
          <div key="a" className="flex flex-wrap gap-1">
            {["Open", "Acknowledge", "Assign", "Create Intervention", "Mute Synthetic Alert"].map((x) => (
              <Button key={x} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAction(a.id, x)}>{x}</Button>
            ))}
          </div>,
        ])} />
    </Panel>
  );
}

/* ================================= 7 · intervention planner ============== */

export function InterventionPlannerPanel({
  interventions, onCreate, onAction, selectedId, onSelect,
}: {
  interventions: CognitiveHealthIntervention[];
  onCreate: () => void;
  onAction: (id: string, action: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Panel id="panel-interventions" title="Cognitive Health Intervention Planner"
      subtitle="An intervention is a governed action intended to improve one or more health signals. Ownership, target, measurement window and evidence of completion are required"
      actions={
        <>
          <Pill label={`Active ${interventionSummary.active}`} tone="blue" />
          <Pill label={`Due this week ${interventionSummary.dueThisWeek}`} tone="amber" />
          <Button size="sm" className="h-7 text-[11px]" onClick={onCreate}>Create Intervention</Button>
        </>
      }>
      <OpsTable
        caption="Health interventions"
        minWidth={1240}
        head={["Intervention", "Title", "Primary Dimensions", "Scope", "Owner", "Participants", "Target Signal", "Current", "Target", "Expected Health Effect", "Confidence", "Window", "Due", "Status", "Actions"]}
        rows={interventions.map((i) => {
          const sig = i.signalIds[0] ?? "";
          return [
            <button key="id" type="button" onClick={() => onSelect(i.id)}
              className={cn("rounded px-1 font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                selectedId === i.id ? "bg-blue-50 text-blue-800" : "text-slate-800")}>{i.id}</button>,
            i.title, i.dimensionIds.map(dimName).join(", "), `${i.scopeType} · ${i.scopeId}`,
            i.owner || <span className="text-red-700">Unowned</span>,
            i.participantIds.join(", ") || "None",
            sig ? signalName(sig) : "Not set",
            sig ? String(i.baselineValues[sig] ?? "—") : "—",
            sig ? String(i.targetValues[sig] ?? "—") : "—",
            i.expectedHealthEffect, `${i.expectedEffectConfidence}%`, i.measurementWindow, i.dueDate,
            <StateChip key="st" label={i.status} />,
            <div key="a" className="flex flex-wrap gap-1">
              {["Assign Owner", "Acknowledge", "Start", "Block", "Begin Measurement", "Cancel", "Escalate"].map((x) => (
                <Button key={x} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAction(i.id, x)}>{x}</Button>
              ))}
            </div>,
          ];
        })} />
      <Note>
        Every status change writes an activity entry and an audit event. Cancelling an intervention requires a comment.
      </Note>
    </Panel>
  );
}

export function InterventionDetailPanel({ intervention }: { intervention: CognitiveHealthIntervention | null }) {
  if (!intervention) return null;
  return (
    <Panel id="panel-intervention-detail" title={`Intervention Detail · ${intervention.id}`}
      subtitle={intervention.title}>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        <dl className="rounded border border-slate-200 p-2">
          <Row label="Description" value={intervention.description} />
          <Row label="Owner" value={intervention.owner || "Unowned"} />
          <Row label="Participants" value={intervention.participantIds.join(", ") || "None"} />
          <Row label="Scope" value={`${intervention.scopeType} · ${intervention.scopeId}`} />
        </dl>
        <dl className="rounded border border-slate-200 p-2">
          <Row label="Signals" value={intervention.signalIds.map(signalName).join(", ")} />
          <Row label="Expected Effect" value={intervention.expectedHealthEffect} />
          <Row label="Effect Confidence" value={`${intervention.expectedEffectConfidence}%`} />
          <Row label="Measurement Window" value={intervention.measurementWindow} />
          <Row label="Success Signal" value={intervention.successSignal} />
        </dl>
        <dl className="rounded border border-slate-200 p-2">
          <Row label="Required Actions" value={intervention.requiredActionTypes.join(", ")} />
          <Row label="Evidence Requirements" value={intervention.evidenceRequirementIds.join(", ") || "None"} />
          <Row label="Dependencies" value={intervention.dependencies.join(", ") || "None"} />
          <Row label="Affected Decisions" value={intervention.affectedDecisionIds.join(", ") || "None"} />
          <Row label="Status" value={<StateChip label={intervention.status} />} />
        </dl>
      </div>
    </Panel>
  );
}

/* ================================= 10 · intervention effectiveness ======= */

export function InterventionEffectivenessPanel({ measurements, interventions }: {
  measurements: CognitiveHealthInterventionMeasurement[];
  interventions: CognitiveHealthIntervention[];
}) {
  const title = (id: string) => interventions.find((i) => i.id === id)?.title ?? id;
  return (
    <Panel id="panel-intervention-effectiveness" title="Health Intervention Effectiveness"
      subtitle={causalityDisclaimer}>
      <OpsTable
        caption="Intervention effectiveness"
        minWidth={1180}
        head={["Intervention", "Baseline", "Target", "Current", "Expected Improvement", "Observed Improvement", "Associated Dimension Change", "Measurement Window", "Confidence", "Status", "Remaining Issue"]}
        rows={measurements.map((m) => [
          title(m.interventionId), m.baseline, m.target, m.current,
          interventions.find((i) => i.id === m.interventionId)?.expectedHealthEffect ?? "—",
          `${m.observedChange > 0 ? "+" : ""}${m.observedChange}`,
          m.associatedDimensionChanges.map((c) => `${dimName(c.dimensionId)} ${c.from} → ${c.to}`).join(", "),
          `${m.measurementStart} to ${m.measurementEnd}`, `${m.confidence}%`,
          <StateChip key="s" label={m.status} />, m.remainingIssue,
        ])} />
      <div className="mt-2 grid gap-2 md:grid-cols-3">
        {measurements.map((m) => (
          <div key={m.id} className="rounded border border-slate-200 p-2">
            <p className="text-[11px] font-semibold text-slate-800">{title(m.interventionId)}</p>
            <p className="text-[10.5px] text-slate-500">Observed Health Change Associated with Intervention</p>
            <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Other concurrent contributing changes</p>
            <ul className="list-disc pl-4 text-[10.5px] text-slate-600">
              {m.concurrentContributors.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ==================================== 11 · scenario simulator ============ */

export function HealthScenarioSimulatorPanel({ controls, onControl, onReset, onApplyToProjection }: {
  controls: HealthControls;
  onControl: (id: string, value: number) => void;
  onReset: () => void;
  onApplyToProjection: () => void;
}) {
  const scenario = useMemo(() => scenarioComputation(controls), [controls]);
  const base = useMemo(() => scenarioComputation({}), []);
  return (
    <Panel id="panel-scenario-simulator" title="Enterprise Health Scenario Simulator"
      subtitle="A deterministic planning simulator. This is not predictive artificial intelligence and the output is never an observed result"
      actions={
        <>
          <Pill label="Scenario Estimate · Not Observed Result" tone="amber" />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onReset}>Reset to Current State</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onApplyToProjection}>Use in Trend Projection</Button>
        </>
      }>
      <div className="grid gap-2 lg:grid-cols-2">
        <div className="space-y-2">
          {healthControls.map((c) => {
            const value = controls[c.id] ?? c.baseline;
            const pct = Math.round(controlProgress(c, value) * 100);
            return (
              <div key={c.id} className="rounded border border-slate-200 p-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label htmlFor={`ctl-${c.id}`} className="text-[11px] font-medium text-slate-800">{c.label}</label>
                  <span className="text-[10.5px] text-slate-600">
                    {c.unit === "percent" ? `${value}%` : `${value.toFixed(1)} business days`}
                    <span className="ml-1 text-slate-400">
                      (baseline {c.unit === "percent" ? `${c.baseline}%` : `${c.baseline} days`} → best {c.unit === "percent" ? `${c.best}%` : `${c.best} days`})
                    </span>
                  </span>
                </div>
                <input id={`ctl-${c.id}`} type="range"
                  min={Math.min(c.baseline, c.best)} max={Math.max(c.baseline, c.best)} step={c.step}
                  value={value}
                  aria-valuetext={c.unit === "percent" ? `${value} percent, ${pct} percent of the modelled range` : `${value.toFixed(1)} business days`}
                  onChange={(e) => onControl(c.id, Number(e.target.value))}
                  className="mt-1 w-full accent-blue-600" />
              </div>
            );
          })}
        </div>

        <div className="rounded border border-slate-200 p-2">
          <div className="flex flex-wrap items-center gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Current ECHI</p>
              <p className="text-[24px] font-bold leading-none text-slate-900">{base.echi}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">Scenario ECHI (estimate)</p>
              <p className="text-[24px] font-bold leading-none text-blue-800">{scenario.echi}</p>
            </div>
            <Pill label={bandFor(scenario.echi)} tone={chTone(bandFor(scenario.echi))} />
          </div>
          <OpsTable
            caption="Scenario dimension movement"
            minWidth={420}
            head={["Dimension", "Current", "Scenario", "Change"]}
            rows={dimensions.map((d) => {
              const before = base.dimensionScores[d.id];
              const after = scenario.dimensionScores[d.id];
              return [d.name, before, after, after === before ? "Unchanged" : `${after > before ? "+" : ""}${after - before}`];
            })} />
          <p className="sr-only">
            Scenario estimate summary. Current index {base.echi}. Scenario index {scenario.echi}.
            {dimensions.map((d) => ` ${d.name} ${base.dimensionScores[d.id]} to ${scenario.dimensionScores[d.id]}.`).join("")}
          </p>
          <Note>Scenario Estimate · Not Observed Result. Modelled improvement assumes the underlying operational change actually completes.</Note>
        </div>
      </div>
    </Panel>
  );
}

/* =================================== 12 · scenario comparison ============ */

export function HealthScenarioComparisonPanel({ scenarios, live }: {
  scenarios: CognitiveHealthScenario[];
  live: CognitiveHealthScenario | null;
}) {
  const all = live ? [...scenarios, live] : scenarios;
  const dimRow = (name: string) => dimensions.find((d) => d.name === name)?.id ?? "";
  return (
    <Panel id="panel-scenario-comparison" title="Enterprise Health Scenario Comparison"
      subtitle={scenarioNoRecommendation}>
      <OpsTable
        caption="Scenario comparison"
        minWidth={900}
        head={["Measure", ...all.map((s) => s.name)]}
        rows={[
          ["ECHI", ...all.map((s) => <span key={s.id} className="font-semibold">{s.scenarioEchi}</span>)],
          ...dimensions.map((d) => [d.name, ...all.map((s) => s.scenarioDimensionScores[dimRow(d.name)] ?? "—")]),
          ["Estimated Effort", ...all.map((s) => s.estimatedEffort)],
          ["Teams Involved", ...all.map((s) => s.affectedScopeIds.join(", "))],
          ["Decisions Benefiting", ...all.map((s) => s.decisionBenefitIds.join(", ") || "None")],
          ["Risks", ...all.map((s) => s.riskNotes)],
        ]} />
      <Note>
        The comparison does not recommend a scenario. A higher estimated index with disproportionate effort or
        unresolved dependency risk is not automatically the better enterprise choice.
      </Note>
    </Panel>
  );
}

/* ========================================== 13 · sensitivity ============= */

export function HealthSensitivityPanel({ onFocus }: { onFocus: (signalId: string) => void }) {
  const rows = useMemo(() => sensitivityAnalysis(), []);
  return (
    <Panel id="panel-sensitivity" title="Cognitive Health Sensitivity"
      subtitle="Which signals have the greatest ability to materially change enterprise cognitive health">
      <OpsTable
        caption="Health sensitivity analysis"
        minWidth={900}
        head={["Signal", "Current", "Target", "Dimension", "Sensitivity", "Modelled Index Movement", "Affected Scope", "Decision Exposure", "Confidence", "Action"]}
        rows={rows.map((r) => [
          signalName(r.signalId), r.currentValue, r.targetValue, dimName(r.dimensionId),
          <StateChip key="s" label={r.sensitivity} />, `+${r.echiDelta.toFixed(1)} index points`,
          r.affectedScopeIds.join(", "), r.affectedDecisionIds.join(", ") || "None", `${r.confidence}%`,
          <Button key="a" size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onFocus(r.signalId)}>Open Signal</Button>,
        ])} />
      <Note>{sensitivityDisclaimer}</Note>
    </Panel>
  );
}

/* ========================================= 14 · trend projection ========= */

export function HealthTrendProjectionPanel({
  horizon, onHorizon, controls, selectedInterventionIds,
}: {
  horizon: ProjectionHorizon;
  onHorizon: (h: ProjectionHorizon) => void;
  controls: HealthControls;
  selectedInterventionIds: string[];
}) {
  const projections = useMemo(
    () => projectionTypes.map((t) => projectHealth(horizon, t as ProjectionType, selectedInterventionIds, controls)),
    [horizon, selectedInterventionIds, controls],
  );
  return (
    <Panel id="panel-trend-projection" title="Health Trend Projection"
      subtitle={projectionDisclaimer}
      actions={
        <div className="flex rounded-md border border-slate-200 bg-white p-0.5" role="group" aria-label="Projection horizon">
          {projectionHorizons.map((h) => (
            <button key={h} type="button" aria-pressed={horizon === h} onClick={() => onHorizon(h)}
              className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                horizon === h ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>{h}</button>
          ))}
        </div>
      }>
      <OpsTable
        caption="Health trend projection"
        minWidth={820}
        head={["Projection", "Projected ECHI", "Band", "Dependency Visibility", "Cross Team Awareness", "Response Latency", "Learning Maturity", "Confidence"]}
        rows={projections.map((p) => [
          p.projectionType, <span key="e" className="font-semibold">{p.projectedEchi}</span>, bandFor(p.projectedEchi),
          p.projectedDimensionScores["DIM DV"], p.projectedDimensionScores["DIM CTA"],
          p.projectedDimensionScores["DIM RL"], p.projectedDimensionScores["DIM LM"],
          `${p.confidence}% · based on signal stability`,
        ])} />
      <div className="mt-1.5 rounded border border-slate-200 p-2">
        <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Assumptions</p>
        <ul className="list-disc pl-4 text-[10.5px] text-slate-600">
          {projections[0].assumptions.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </div>
      <p className="sr-only">
        Projection text summary for {horizon}. {projections.map((p) => `${p.projectionType} projects an index of ${p.projectedEchi} with ${p.confidence} percent confidence.`).join(" ")}
      </p>
      <Note>Target is 92. Illustrative projection only, not a forecast guarantee.</Note>
    </Panel>
  );
}

/* ========================================== 15 · decision exposure ======= */

export function DecisionExposurePanel({ exposures, onAction }: {
  exposures: CognitiveHealthDecisionExposure[];
  onAction: (id: string, action: string) => void;
}) {
  return (
    <Panel id="panel-decision-exposure" title="Decision Exposure to Cognitive Health"
      subtitle="Which active enterprise decisions are being made in areas where cognitive health is degraded">
      <OpsTable
        caption="Decision exposure"
        minWidth={1240}
        head={["Decision", "Decision Owner", "Decision State", "Affected Health Dimension", "Health Score", "Critical Signals", "Evidence Coverage", "Dependency Coverage", "Cross Team Awareness", "Decision Confidence", "Exposure Severity", "Recommended Action", "Actions"]}
        rows={exposures.map((e) => [
          `${e.decisionId} · ${e.decision}`, e.decisionOwner, e.decisionState,
          e.affectedDimensionIds.map(dimName).join(", "), e.healthScore,
          e.criticalSignalIds.map(signalName).join(", ") || "None",
          `${e.evidenceCoverage}%`, `${e.dependencyCoverage}%`, `${e.crossTeamAwareness}%`, `${e.decisionConfidence}%`,
          <StateChip key="s" label={e.exposureSeverity} />, e.recommendedAction,
          <div key="a" className="flex flex-wrap gap-1">
            {["Open Decision", "Open Health Workbench", "Create Intervention", "Request Reassessment"].map((x) => (
              <Button key={x} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAction(e.id, x)}>{x}</Button>
            ))}
          </div>,
        ])} />
    </Panel>
  );
}

/* ============================================== 16 · reassessment ======== */

export function HealthReassessmentPanel({ items, onAction }: {
  items: CognitiveHealthReassessment[];
  onAction: (id: string, action: string) => void;
}) {
  return (
    <Panel id="panel-reassessment" title="Health Reassessment"
      subtitle={reassessmentSafety}>
      <OpsTable
        caption="Health reassessment"
        minWidth={1120}
        head={["Reassessment", "Trigger", "Trigger Record", "Affected Cognitive Intakes", "Persona Impact Evaluations", "Cross Team Analyses", "Decision Evaluations", "Recommended Action", "Owner", "Status", "Actions"]}
        rows={items.map((r) => [
          r.id, r.triggerType, r.triggerRecordId,
          r.affectedIntakeIds.join(", ") || "None", r.affectedPersonaImpactIds.join(", ") || "None",
          r.affectedCrossTeamAnalysisIds.join(", ") || "None", r.affectedDecisionIds.join(", ") || "None",
          r.recommendedAction, r.owner, <StateChip key="s" label={r.status} />,
          <div key="a" className="flex flex-wrap gap-1">
            {["Request Reassessment", "Acknowledge No Reassessment Required", "Escalate"].map((x) => (
              <Button key={x} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAction(r.id, x)}>{x}</Button>
            ))}
          </div>,
        ])} />
    </Panel>
  );
}

/* ============================== 17-18 · snapshot history and comparison == */

export function SnapshotHistoryPanel({ selectedId, onSelect }: {
  selectedId: string; onSelect: (id: string) => void;
}) {
  return (
    <Panel id="panel-snapshot-history" title="Enterprise Cognitive Health History"
      subtitle="Each snapshot preserves the threshold and scoring policy that was effective when it was measured. Historical snapshots are never recalculated using a future policy">
      <OpsTable
        caption="Health snapshot history"
        minWidth={1120}
        head={["Snapshot", "Period", "Timestamp", "ECHI", "Dimension Scores", "Threshold Policy", "Scoring Policy", "Scope", "Confidence", "Critical Signals", "Decision Exposure", "Interventions Active", "Select"]}
        rows={snapshotHistory.map((s) => [
          s.id, s.label, s.timestamp, <span key="e" className="font-semibold">{s.echi}</span>,
          dimensions.map((d) => `${d.short} ${s.dimensionScores[d.id]}`).join(" · "),
          s.thresholdPolicyVersion, s.scoringPolicyVersion, `${s.scopeType} · ${s.scopeId}`, `${s.confidence}%`,
          s.criticalSignalIds.map(signalName).join(", ") || "None", s.decisionExposureIds.length, s.interventionsActive,
          <Button key="b" size="sm" variant={selectedId === s.id ? "default" : "outline"} className="h-6 px-1.5 text-[10px]"
            onClick={() => onSelect(s.id)}>{selectedId === s.id ? "Selected" : "Compare"}</Button>,
        ])} />
    </Panel>
  );
}

export function SnapshotComparisonPanel({ left, right, mode, onMode }: {
  left: HealthSnapshotRecord; right: HealthSnapshotRecord;
  mode: ComparisonMode; onMode: (m: ComparisonMode) => void;
}) {
  const rows = useMemo(() => compareSnapshots(left, right, mode), [left, right, mode]);
  return (
    <Panel id="panel-snapshot-comparison" title="Health Snapshot Comparison"
      subtitle={`${left.label} compared with ${right.label}`}
      actions={
        <div className="flex rounded-md border border-slate-200 bg-white p-0.5" role="group" aria-label="Comparison mode">
          {comparisonModes.map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => onMode(m)}
              className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                mode === m ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>{m}</button>
          ))}
        </div>
      }>
      <div className="mb-1.5 flex flex-wrap gap-1.5">
        <Pill label={`${left.label} index ${snapshotEchi(left, mode)}`} tone="slate" />
        <Pill label={`${right.label} index ${snapshotEchi(right, mode)}`} tone="blue" />
        <Pill label={mode} tone={mode === "As Measured at the Time" ? "green" : "amber"} />
      </div>
      <p className="mb-1.5 text-[10.5px] text-slate-600">
        {mode === "As Measured at the Time"
          ? "Each snapshot is shown exactly as it was measured, using the scoring policy that was effective at the time."
          : "Both snapshots are recomputed under the current scoring policy for comparison only. The stored historical records are not modified."}
      </p>
      <OpsTable
        caption="Snapshot comparison"
        minWidth={640}
        head={["Field", left.label, right.label, "State"]}
        rows={rows.map((r) => [r.field, r.left, r.right, <StateChip key="s" label={r.state} />])} />
    </Panel>
  );
}

/* ============================================ 19 · ECHI policy history === */

export function EchiPolicyHistoryPanel() {
  return (
    <Panel id="panel-policy-history" title="Enterprise Cognitive Health Index Version History"
      subtitle="Versions relate to health model policy changes. Health history preserves the original model version">
      <OpsTable
        caption="ECHI policy version history"
        minWidth={1080}
        head={["Version", "Effective Date", "Dimensions", "Weights", "Thresholds", "Signal Definitions", "Owner", "Approval", "Reason"]}
        rows={echiPolicyVersions.map((p) => [
          `ECHI Policy ${p.version}`, p.effectiveDate, p.dimensionCount,
          Object.entries(p.weights).map(([k, v]) => `${dimName(k)} ${Math.round(v * 100)}%`).join(" · "),
          p.thresholdSummary, p.signalDefinitions, p.owner, p.approval, p.reason,
        ])} />
    </Panel>
  );
}

/* ================================================ 20 · governance ======== */

export function HealthGovernancePanel({ integrityViolations, activeInterventions, riskAcceptances, reassessments }: {
  integrityViolations: number; activeInterventions: number; riskAcceptances: number; reassessments: number;
}) {
  const metrics = governanceMetrics(integrityViolations, activeInterventions, riskAcceptances, reassessments);
  return (
    <Panel id="panel-health-governance" title="Cognitive Health Governance"
      subtitle="Governance over signal quality, thresholds, scoring transparency, ownership, intervention coverage, decision exposure and historical integrity">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
        {metrics.map((m) => (
          <div key={m.label} className="rounded border border-slate-200 p-2">
            <p className="text-[10px] text-slate-500">{m.label}</p>
            <p className="text-[18px] font-bold leading-none text-slate-900">{m.value}</p>
            <Pill label={m.tone === "red" ? "Critical" : m.tone === "amber" ? "Attention" : m.tone === "green" ? "Healthy" : "Governed"} tone={m.tone} />
          </div>
        ))}
      </div>
      <div className="mt-2">
        <OpsTable
          caption="Governance dimensions"
          minWidth={620}
          head={["Governance Dimension", "Score", "Band", "Owner", "Note"]}
          rows={governanceDimensions.map((g) => [g.name, g.score, <StateChip key="b" label={bandFor(g.score)} />, g.owner, g.note])} />
      </div>
    </Panel>
  );
}

/* ========================================== 21 · risk acceptance ========= */

export function RiskAcceptancePanel({ items, onCreate, onAction }: {
  items: CognitiveHealthRiskAcceptance[];
  onCreate: () => void;
  onAction: (id: string, action: string) => void;
}) {
  return (
    <Panel id="panel-risk-acceptance" title="Cognitive Health Risk Acceptance"
      subtitle={riskAcceptanceRule}
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onCreate}>Accept Cognitive Health Risk</Button>}>
      <OpsTable
        caption="Health risk acceptances"
        minWidth={1240}
        head={["Acceptance", "Signal", "Dimension", "Scope", "Severity", "Affected Decisions", "Affected Teams", "Potential Consequence", "Existing Controls", "Reason", "Expiration", "Owner", "Approver", "Required Monitoring", "Status", "Actions"]}
        rows={items.map((r) => [
          r.id, signalName(r.signalId), dimName(r.dimensionId), `${r.scopeType} · ${r.scopeId}`,
          <StateChip key="s" label={r.severity} />, r.affectedDecisionIds.join(", ") || "None",
          r.affectedTeams.join(", "), r.potentialConsequence, r.existingControls.join(", "), r.reason,
          r.expirationDate, r.owner, r.approver, r.monitoringRequirements.join(", "),
          <StateChip key="st" label={r.status} />,
          <div key="a" className="flex flex-wrap gap-1">
            {["Renew", "Withdraw", "Expire Now"].map((x) => (
              <Button key={x} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAction(r.id, x)}>{x}</Button>
            ))}
          </div>,
        ])} />
      <Note>An expired acceptance restores the signal to the review queue. The underlying signal is never suppressed while the acceptance is active.</Note>
    </Panel>
  );
}

/* ============================================== 22 · escalation ========== */

export function HealthEscalationPanel({ items, onCreate }: {
  items: CognitiveHealthEscalation[]; onCreate: () => void;
}) {
  return (
    <Panel id="panel-escalation" title="Cognitive Health Escalation"
      subtitle="Escalation records the health issue, its enterprise and customer consequence, the supporting evidence and the recommended escalation level"
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onCreate}>Raise Escalation</Button>}>
      <OpsTable
        caption="Health escalations"
        minWidth={1240}
        head={["Escalation", "Health Issue", "Scope", "Reason", "Severity", "Affected Decisions", "Affected Teams", "Business Consequence", "Customer Consequence", "Evidence", "Owner", "Recommended Level", "Due", "Status"]}
        rows={items.map((e) => [
          e.id, signalName(e.signalId), `${e.scopeType} · ${e.scopeId}`, e.reason,
          <StateChip key="s" label={e.severity} />, e.affectedDecisionIds.join(", ") || "None",
          e.affectedPersonaIds.join(", "), e.businessConsequence, e.customerConsequence,
          e.evidenceReferenceIds.join(", "), e.owner, e.recommendedLevel, e.dueDate,
          <StateChip key="st" label={e.status} />,
        ])} />
      <Note>Escalation levels: {escalationLevels.join(" · ")}</Note>
    </Panel>
  );
}

/* =============================== 23-24 · executive briefing ============== */

export function ExecutiveBriefingPanel({ echi, priorDelta, exposures, onGenerate, onQuestion, activeQuestion }: {
  echi: number;
  priorDelta: number;
  exposures: number;
  onGenerate: () => void;
  onQuestion: (q: string) => void;
  activeQuestion: string | null;
}) {
  return (
    <Panel id="panel-executive-brief" title="Enterprise Cognitive Health Briefing"
      subtitle="A view of where the organization can make connected decisions confidently and where cognitive friction still creates enterprise risk"
      actions={<Button size="sm" className="h-7 text-[11px]" onClick={onGenerate}>Generate Executive Health Brief</Button>}>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded border border-slate-200 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Current</p>
          <p className="text-[26px] font-bold leading-none text-slate-900">ECHI {echi}</p>
          <Pill label={bandFor(echi)} tone={chTone(bandFor(echi))} />
          <p className="mt-1 text-[11px] text-slate-600">Since prior period {priorDelta >= 0 ? `+${priorDelta}` : priorDelta}</p>
        </div>
        <div className="rounded border border-slate-200 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Top Improvements</p>
          <ul className="list-disc pl-4 text-[11px] text-slate-700">
            <li>Cross Team Awareness +5</li><li>Response Latency +6</li><li>Learning Maturity +4</li>
          </ul>
        </div>
        <div className="rounded border border-slate-200 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Top Attention Areas</p>
          <ul className="list-disc pl-4 text-[11px] text-slate-700">
            <li>Identity dependency validation</li><li>Commerce coordination ownership</li>
            <li>Regional Token Vault evidence</li><li>Learning publication backlog</li>
          </ul>
        </div>
        <div className="rounded border border-slate-200 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Operating Load</p>
          <dl>
            <Row label="Decisions Exposed" value={exposures} />
            <Row label="Interventions Active" value={interventionSummary.active} />
            <Row label="Interventions Due This Week" value={interventionSummary.dueThisWeek} />
          </dl>
        </div>
      </div>

      <div className="mt-2 rounded border border-slate-200 p-2">
        <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Executive Questions</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {executiveQuestions.map((q) => (
            <button key={q} type="button" onClick={() => onQuestion(q)}
              className={cn("rounded border px-1.5 py-0.5 text-left text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                activeQuestion === q ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
              {q}
            </button>
          ))}
        </div>
        {activeQuestion && (
          <p className="mt-1.5 rounded border border-blue-200 bg-blue-50 p-2 text-[11px] text-blue-900">
            {executiveAnswers[activeQuestion]}
          </p>
        )}
      </div>
    </Panel>
  );
}

export function GeneratedBriefPanel({ brief }: { brief: CognitiveHealthExecutiveBrief | null }) {
  if (!brief) return null;
  return (
    <Panel id="panel-generated-brief" title={`Generated Executive Health Brief · ${brief.id}`}
      subtitle={`${brief.scopeType} · ${brief.scopeId} · ${brief.timeRange} · generated ${brief.createdAt}`}>
      <p className="text-[12px] font-medium text-slate-800">{brief.summary}</p>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        {brief.sections.map((s) => (
          <div key={s.title} className="rounded border border-slate-200 p-2">
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{s.title}</p>
            <p className="text-[11px] text-slate-700">{s.body}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ============================================= 26 · notifications ======== */

export function HealthNotificationsPanel({ items, onRead, onReadAll, onAction, filter, onFilter }: {
  items: CognitiveHealthNotification[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  onAction: (id: string, action: string) => void;
  filter: string;
  onFilter: (v: string) => void;
}) {
  const unread = items.filter((n) => n.status === "Unread").length;
  const rows = items.filter((n) => filter === "All" || n.type === filter);
  return (
    <Panel id="panel-notifications" title="Cognitive Health Notifications"
      subtitle="Health change, exposure, review, intervention, governance and integrity notifications"
      actions={
        <>
          <Pill label={`${unread} unread`} tone={unread ? "amber" : "green"} />
          <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
            <span className="sr-only">Filter notifications</span>
            <select value={filter} onChange={(e) => onFilter(e.target.value)}
              className="h-7 max-w-[220px] rounded border border-slate-200 px-1.5 text-[11px]">
              <option>All</option>
              {[...new Set(items.map((n) => n.type))].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onReadAll}>Mark All Read</Button>
        </>
      }>
      <OpsTable
        caption="Health notifications"
        minWidth={980}
        head={["Notification", "Type", "Title", "Description", "Severity", "Owner", "Created", "Status", "Actions"]}
        rows={rows.map((n) => [
          n.id, n.type, n.title, n.description, <StateChip key="s" label={n.severity} />, n.owner, n.createdAt,
          <StateChip key="st" label={n.status === "Unread" ? "Attention" : "Read"} />,
          <div key="a" className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onRead(n.id)}>Mark Read</Button>
            {["Open", "Assign", "Acknowledge"].map((x) => (
              <Button key={x} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAction(n.id, x)}>{x}</Button>
            ))}
          </div>,
        ])} />
    </Panel>
  );
}

/* ========================================== 27 · recent ops activity ===== */

export function HealthOpsActivityPanel({ items }: { items: HealthOpsActivity[] }) {
  return (
    <Panel id="panel-ops-activity" title="Recent Enterprise Cognitive Health Activity"
      subtitle="Reviews, alerts, interventions, reassessments, threshold and policy changes, risk acceptances and executive briefs">
      <ol className="space-y-1">
        {items.map((a) => (
          <li key={a.id} className="flex flex-wrap items-baseline gap-2 rounded border border-slate-100 px-2 py-1">
            <span className="w-[72px] shrink-0 text-[10.5px] font-medium text-slate-500">{a.time}</span>
            <span className="text-[11.5px] text-slate-800">{a.label}</span>
            <span className="text-[10.5px] text-slate-500">{a.detail}</span>
            <Pill label={a.category} tone="slate" />
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ============================================= 30 · demo scenarios ======= */

export function HealthDemoScenarioBar({ scenarios, active, onSelect }: {
  scenarios: HealthDemoScenario[];
  active: string | null;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Panel id="panel-demo-scenarios" title="Demo Scenarios"
      subtitle="Every scenario updates the index, dimension scores, KPI cards, lifecycle, heatmap, workbench, signals, critical signals, decision exposure, reviews, alerts, interventions, governance, activity, notifications and the executive brief consistently"
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

/* ================================================= 29 · demo story ======= */

export function HealthDemoStoryOverlay({
  step, index, total, onNext, onPrev, onExit, reducedMotion, onReducedMotion,
}: {
  step: HealthStoryStep;
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
      className="fixed bottom-3 left-1/2 z-50 w-[min(820px,94vw)] -translate-x-1/2 rounded-lg border border-blue-300 bg-white p-3 shadow-xl">
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

/* ================================================ operational states ===== */

export function OperationalStatePanel({ states, active }: { states: string[]; active: string[] }) {
  return (
    <Panel id="panel-operational-states" title="Cognitive Health Operational States"
      subtitle="States are never collapsed into a generic healthy or unhealthy label">
      <div className="flex flex-wrap gap-1">
        {states.map((s) => (
          <span key={s} className={cn("rounded border px-1.5 py-0.5 text-[10.5px]",
            active.includes(s) ? "border-blue-400 bg-blue-50 font-semibold text-blue-800" : "border-slate-200 text-slate-500")}>
            {s}{active.includes(s) ? " · active" : ""}
          </span>
        ))}
      </div>
    </Panel>
  );
}

export { currentPolicy };
