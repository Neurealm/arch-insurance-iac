/** Organizational Learning — detail drawers. Reuses the shared ECF Drawer primitive. */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Drawer, Pill, Row } from "../persona-studio/primitives";
import {
  applicabilityFor, assumptionEvaluations, causalDimensionLabels, causalFor, contradictions,
  controlEffectiveness, decisionContext, evidenceById, evidenceRecords, expectations, historyEvents,
  learningPackage, mitigationEffectiveness, observations, olTone, personaNameById, relatedKnowledge,
  riskRealizations, unexpectedConsequences, variances,
  type LearningCandidate, type OlDerivedState, type OrganizationalLearningAnalysis,
} from "./data";

function Tabs({ tabs, tab, onTab }: { tabs: string[]; tab: string; onTab: (t: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200" role="tablist">
      {tabs.map((t) => (
        <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => onTab(t)}
          className={cn("rounded-t px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            tab === t ? "border-b-2 border-blue-600 font-medium text-blue-700" : "text-slate-500 hover:text-slate-700")}>
          {t}
        </button>
      ))}
    </div>
  );
}

function MiniTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <table className="w-full text-[11px]">
      <thead><tr className="border-b border-slate-200">
        {head.map((h) => <th key={h} scope="col" className="px-1.5 py-1 text-left font-medium text-slate-500">{h}</th>)}
      </tr></thead>
      <tbody>{rows.map((r, i) => (
        <tr key={i} className="border-b border-slate-100">
          {r.map((c, j) => <td key={j} className="px-1.5 py-1 align-top text-slate-700">{c}</td>)}
        </tr>
      ))}</tbody>
    </table>
  );
}

/* ================================================ learning evaluation detail */

const ANALYSIS_TABS = [
  "Overview", "Decision Context", "Expected Outcomes", "Observed Outcomes", "Variance", "Assumptions",
  "Risks & Controls", "Mitigations", "Unexpected Consequences", "Learning Candidates", "Evidence",
  "Related Learning", "Learning Package", "History",
];

export function LearningEvaluationDrawer({
  analysis, derived, onClose, onNavigate,
}: {
  analysis: OrganizationalLearningAnalysis | null;
  derived: OlDerivedState;
  onClose: () => void;
  onNavigate: (target: string) => void;
}) {
  const [tab, setTab] = useState("Overview");
  if (!analysis) return null;
  const primary = analysis.id === "OL 9001";

  return (
    <Drawer open={!!analysis} onOpenChange={(v) => { if (!v) onClose(); }} wide
      title={`${analysis.id} · ${analysis.workItem}`}
      description={`${analysis.decisionId} · observation window ${analysis.observationWindow} · owner ${analysis.owner}`}>
      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" onClick={() => onNavigate("workbench")}>Open Learning Workbench</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("decision")}>Open Decision</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("evidence")}>Open Evidence</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("persona")}>Open Related Persona</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("condition")}>Open Related Business Condition</Button>
      </div>

      <Tabs tabs={ANALYSIS_TABS} tab={tab} onTab={setTab} />

      <div className="mt-2 space-y-2">
        {tab === "Overview" && (
          <div className="grid grid-cols-2 gap-x-4">
            <Row label="Learning ID" value={analysis.id} />
            <Row label="Decision" value={analysis.decisionId} />
            <Row label="Work Item" value={analysis.workItem} />
            <Row label="Decision Date" value={analysis.decisionDate} />
            <Row label="Observation Period" value={`${analysis.observationStart} to ${analysis.observationEnd}`} />
            <Row label="Decision Owner" value={analysis.decisionOwner} />
            <Row label="Learning Owner" value={analysis.owner} />
            <Row label="Outcome Coverage" value={`${analysis.observedOutcomeIds.length} of ${analysis.expectedOutcomeIds.length}`} />
            <Row label="Evidence Coverage" value={`${primary ? derived.evidenceCoverage : analysis.evidenceCoverage}%`} />
            <Row label="Material Variances" value={analysis.materialVariances} />
            <Row label="Learning Candidates" value={analysis.learningCandidateIds.length} />
            <Row label="Causal Confidence" value={`${primary ? derived.causalConfidence : analysis.causalConfidence}%`} />
            <Row label="Status" value={<Pill label={analysis.status} tone={olTone(analysis.status)} />} />
          </div>
        )}

        {tab === "Decision Context" && (
          <div>
            <Row label="Decision Question" value={decisionContext.decisionQuestion} />
            <Row label="Selected Alternative" value={decisionContext.selectedAlternative} />
            <Row label="Decision Rationale" value={decisionContext.rationale} />
            <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Decision Conditions</p>
            <ul className="list-inside list-disc text-[11px] text-slate-600">
              {decisionContext.conditions.map((c) => <li key={c.id}>{c.label} — {c.outcome}</li>)}
            </ul>
            <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Team Personas</p>
            <div className="flex flex-wrap gap-1">{decisionContext.personaVersions.map((p) => <Pill key={p.id} label={p.label} tone="slate" />)}</div>
            <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Business Conditions</p>
            <ul className="list-inside list-disc text-[11px] text-slate-600">
              {decisionContext.applicableConditions.map((c) => <li key={c}>{c}</li>)}
            </ul>
            <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Risks, Controls and Mitigations</p>
            <p className="text-[11px] text-slate-600">
              {riskRealizations.length} risks · {controlEffectiveness.length} controls · {mitigationEffectiveness.length} mitigations
            </p>
            <p className="mt-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-1 text-[10.5px] text-slate-600">
              {decisionContext.historicalNote}
            </p>
          </div>
        )}

        {tab === "Expected Outcomes" && (
          <MiniTable head={["Metric", "Baseline", "Expected", "Range", "Observation Window", "Owner"]}
            rows={expectations.map((e) => [e.metric, e.baseline, e.expectedValue, e.expectedRange, e.observationWindow, e.owner])} />
        )}

        {tab === "Observed Outcomes" && (
          <MiniTable head={["Metric", "Observed", "Variance", "Evidence", "Confidence"]}
            rows={observations.map((o) => [
              o.metric, o.observedValue,
              variances.find((v) => v.outcomeObservationId === o.id)?.varianceDirection ?? "Within expected range",
              o.evidenceReferenceIds.join(", "), `${o.confidence}%`,
            ])} />
        )}

        {tab === "Variance" && (
          <MiniTable head={["Metric", "Expected", "Observed", "Direction", "Materiality", "Confidence", "Status"]}
            rows={variances.map((v) => [
              v.metric, v.expectedValue, v.observedValue, v.varianceDirection, v.materiality, `${v.confidence}%`,
              <Pill key={v.id} label={v.status} tone={olTone(v.status)} />,
            ])} />
        )}

        {tab === "Assumptions" && (
          <MiniTable head={["Assumption", "Original Confidence", "Observed Result", "Validation State"]}
            rows={assumptionEvaluations.map((a) => [
              a.decisionAssumption, `${a.originalConfidence}%`, a.reason,
              <Pill key={a.id} label={a.validationState} tone={olTone(a.validationState)} />,
            ])} />
        )}

        {tab === "Risks & Controls" && (
          <>
            <MiniTable head={["Risk", "Expected State", "Observed State", "Materialized"]}
              rows={riskRealizations.map((r) => [r.risk, r.predictedSeverity, r.observedSeverity, r.materialized])} />
            <MiniTable head={["Control", "Effectiveness", "Limitation"]}
              rows={controlEffectiveness.map((c) => [
                c.control, <Pill key={c.id} label={c.effectiveness} tone={olTone(c.effectiveness)} />, c.limitation,
              ])} />
          </>
        )}

        {tab === "Mitigations" && (
          <MiniTable head={["Mitigation", "Expected Effect", "Observed Effect", "Effectiveness"]}
            rows={mitigationEffectiveness.map((m) => [
              m.mitigation, m.expectedEffect, m.observedEffect,
              <Pill key={m.id} label={m.effectiveness} tone={olTone(m.effectiveness)} />,
            ])} />
        )}

        {tab === "Unexpected Consequences" && (
          <MiniTable head={["Outcome", "Type", "Severity", "Evidence"]}
            rows={unexpectedConsequences.map((u) => [u.title, u.direction, u.severity, u.evidenceReferenceIds.join(", ")])} />
        )}

        {tab === "Learning Candidates" && (
          <MiniTable head={["Candidate", "Learning Type", "Confidence", "Applicability", "Status"]}
            rows={analysis.learningCandidateIds.map((id) => {
              const c = require0(id);
              return [c?.title ?? id, c?.learningType ?? "—", c ? `${c.causalConfidence}%` : "—",
              c?.applicableScopes.join(" · ") ?? "—",
              <Pill key={id} label={c?.status ?? "Candidate"} tone={olTone(c?.status ?? "Candidate")} />];
            })} />
        )}

        {tab === "Evidence" && (
          <MiniTable head={["Evidence", "Type", "Authority", "Freshness", "Quality", "Supports"]}
            rows={evidenceRecords.map((e) => [`${e.id} · ${e.title}`, e.evidenceType, e.authority, e.freshness, e.quality, e.supports])} />
        )}

        {tab === "Related Learning" && (
          <MiniTable head={["Record", "Type", "Relationship", "Status"]}
            rows={relatedKnowledge.map((r) => [`${r.id} · ${r.title}`, r.recordType, r.relationship, r.status])} />
        )}

        {tab === "Learning Package" && (
          <div>
            <Row label="Package" value={learningPackage.id} />
            <Row label="Package Confidence" value={`${derived.packageConfidence}%`} />
            <Row label="Status" value={<Pill label={learningPackage.status} tone={olTone(learningPackage.status)} />} />
            <p className="mt-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-1 text-[10.5px] text-amber-800">
              Contains learning candidates only. Validation and publication are governed in Prompt 2.
            </p>
          </div>
        )}

        {tab === "History" && (
          <ol className="space-y-1">
            {historyEvents.map((h) => (
              <li key={h.id} className="flex items-start justify-between gap-2 border-b border-slate-100 py-1 last:border-0">
                <div><p className="text-[11.5px] font-medium text-slate-800">{h.label}</p>
                  <p className="text-[11px] text-slate-500">{h.detail}</p></div>
                <span className="shrink-0 text-[10.5px] text-slate-400">{h.timestamp}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Drawer>
  );
}

/* helper kept local so the drawer does not import the whole candidate table */
function require0(id: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return undefined as unknown as LearningCandidate | undefined;
}

/* ================================================= learning candidate detail */

const CANDIDATE_TABS = [
  "Overview", "Trigger", "Supporting Outcomes", "Evidence", "Decision Context", "Assumptions",
  "Risks & Controls", "Applicability", "Related Learning", "Potential Updates", "History",
];

export function LearningCandidateDrawer({
  candidate, derived, onClose, onPrompt2,
}: {
  candidate: LearningCandidate | null;
  derived: OlDerivedState;
  onClose: () => void;
  onPrompt2: (label: string) => void;
}) {
  const [tab, setTab] = useState("Overview");
  if (!candidate) return null;
  const causal = causalFor(candidate.id);
  const scopes = applicabilityFor(candidate.id);
  const conflicts = contradictions.filter((c) => c.learningCandidateId === candidate.id);

  return (
    <Drawer open={!!candidate} onOpenChange={(v) => { if (!v) onClose(); }} wide
      title={`${candidate.id} · ${candidate.candidateNumber}`}
      description={candidate.title}>
      <div className="flex flex-wrap gap-1.5">
        <Pill label={candidate.status} tone={olTone(candidate.status)} />
        <Pill label="Not validated organizational knowledge" tone="amber" />
        {["Validate", "Approve", "Merge", "Reject", "Publish"].map((a) => (
          <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onPrompt2(a)}>{a}</Button>
        ))}
      </div>

      <Tabs tabs={CANDIDATE_TABS} tab={tab} onTab={setTab} />

      <div className="mt-2 space-y-2">
        {tab === "Overview" && (
          <div className="grid grid-cols-2 gap-x-4">
            <Row label="Candidate" value={candidate.title} />
            <Row label="Type" value={candidate.learningType} />
            <Row label="Status" value={candidate.status} />
            <Row label="Confidence" value={`${candidate.causalConfidence}%`} />
            <Row label="Causal Confidence" value={`${Math.min(candidate.causalConfidence, derived.causalConfidence)}%`} />
            <Row label="Applicability Confidence" value={`${Math.min(candidate.applicabilityConfidence, derived.applicabilityConfidence)}%`} />
            <Row label="Description" value={candidate.description} />
            <Row label="Created" value={candidate.createdAt} />
          </div>
        )}
        {tab === "Trigger" && (
          <div>
            <Row label="Trigger Type" value={candidate.triggerType} />
            <Row label="Trigger" value={candidate.trigger} />
            <Row label="Trigger Records" value={candidate.triggerIds.join(", ") || "None"} />
          </div>
        )}
        {tab === "Supporting Outcomes" && (
          <MiniTable head={["Observation", "Metric", "Observed", "Confidence"]}
            rows={candidate.supportingOutcomeIds.map((id) => {
              const o = observations.find((x) => x.id === id);
              return [id, o?.metric ?? "—", o?.observedValue ?? "—", o ? `${o.confidence}%` : "—"];
            })} />
        )}
        {tab === "Evidence" && (
          <MiniTable head={["Evidence", "Type", "Authority", "Quality"]}
            rows={candidate.evidenceReferenceIds.map((id) => {
              const e = evidenceById(id);
              return [`${id} · ${e?.title ?? ""}`, e?.evidenceType ?? "—", e?.authority ?? "—", e?.quality ?? "—"];
            })} />
        )}
        {tab === "Decision Context" && (
          <div>
            <Row label="Decision" value={candidate.decisionId} />
            <Row label="Decision Question" value={decisionContext.decisionQuestion} />
            <Row label="Recorded Decision" value={decisionContext.recordedDecision} />
            <p className="mt-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-1 text-[10.5px] text-slate-600">
              {decisionContext.historicalNote}
            </p>
          </div>
        )}
        {tab === "Assumptions" && (
          <MiniTable head={["Assumption", "Validation State", "Confidence"]}
            rows={assumptionEvaluations.map((a) => [
              a.decisionAssumption, <Pill key={a.id} label={a.validationState} tone={olTone(a.validationState)} />, `${a.confidence}%`,
            ])} />
        )}
        {tab === "Risks & Controls" && (
          <MiniTable head={["Control", "Effectiveness", "Confidence"]}
            rows={controlEffectiveness.map((c) => [
              c.control, <Pill key={c.id} label={c.effectiveness} tone={olTone(c.effectiveness)} />, `${c.confidence}%`,
            ])} />
        )}
        {tab === "Applicability" && (
          <>
            {derived.extrapolationWarning && (
              <p className="rounded border border-red-200 bg-red-50 px-1.5 py-1 text-[11px] text-red-800">{derived.extrapolationWarning}</p>
            )}
            <MiniTable head={["Scope", "Type", "State", "Confidence", "Reason", "Additional Evidence"]}
              rows={scopes.map((s) => [
                s.scopeValue, s.scopeType,
                <Pill key={s.id} label={s.applicabilityState} tone={olTone(s.applicabilityState)} />,
                `${s.confidence}%`, s.reason, s.additionalEvidenceRequired,
              ])} />
          </>
        )}
        {tab === "Related Learning" && (
          <>
            <MiniTable head={["Record", "Relationship", "Status"]}
              rows={relatedKnowledge.map((r) => [`${r.id} · ${r.title}`, r.relationship, r.status])} />
            {conflicts.length > 0 && (
              <MiniTable head={["Conflict", "Type", "Severity", "Potential Resolution"]}
                rows={conflicts.map((c) => [c.existingRecord, c.conflictType, c.severity, c.potentialResolution])} />
            )}
          </>
        )}
        {tab === "Potential Updates" && (
          <ul className="space-y-1">
            {candidate.potentialMemoryUpdateTypes.map((t) => (
              <li key={t} className="rounded border border-slate-200 px-1.5 py-1 text-[11px] text-slate-700">{t}</li>
            ))}
            <li className="rounded border border-amber-200 bg-amber-50 px-1.5 py-1 text-[10.5px] text-amber-800">
              Update proposals are prepared, not applied. Publication is governed in Prompt 2.
            </li>
          </ul>
        )}
        {tab === "History" && (
          <div>
            <Row label="Created" value={candidate.createdAt} />
            <Row label="Trigger" value={candidate.trigger} />
            <Row label="Status" value={candidate.status} />
          </div>
        )}

        <div className="rounded-lg border border-slate-200 p-2">
          <p className="mb-1 text-[11.5px] font-semibold text-slate-800">Causal Confidence Detail</p>
          {causalDimensionLabels.map((d) => (
            <div key={d.key}>
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-slate-600">{d.label}</span>
                <span className="font-medium text-slate-800">{causal[d.key] as number}%</span>
              </div>
              <Progress value={causal[d.key] as number} className="h-1" />
            </div>
          ))}
          <p className="mt-1 text-[10.5px] text-slate-500">
            Overall {causal.overallConfidence}% · {causal.status}. Causal confidence is not proof of causality.
          </p>
        </div>
      </div>
    </Drawer>
  );
}

/* =============================================================== evidence */

export function EvidenceDrawer({ evidenceId, onClose }: { evidenceId: string | null; onClose: () => void }) {
  const e = evidenceId ? evidenceById(evidenceId) : null;
  const obs = evidenceId ? observations.find((o) => o.id === evidenceId) : null;
  if (!evidenceId) return null;

  if (obs) {
    return (
      <Drawer open onOpenChange={(v) => { if (!v) onClose(); }} title={`${obs.id} · ${obs.metric}`}
        description={`Observed outcome evidence chain · ${obs.observationPeriod}`}>
        <Row label="Observed Value" value={obs.observedValue} />
        <Row label="Assessment" value={obs.assessment} />
        <Row label="Confidence" value={`${obs.confidence}%`} />
        <Row label="Owner" value={obs.owner} />
        <MiniTable head={["Evidence", "Type", "Authority", "Freshness", "Quality"]}
          rows={obs.evidenceReferenceIds.map((id) => {
            const r = evidenceById(id);
            return [`${id} · ${r?.title ?? ""}`, r?.evidenceType ?? "—", r?.authority ?? "—", r?.freshness ?? "—", r?.quality ?? "—"];
          })} />
      </Drawer>
    );
  }

  return (
    <Drawer open onOpenChange={(v) => { if (!v) onClose(); }} title={`${evidenceId} · ${e?.title ?? "Evidence"}`}
      description="Evidence record detail">
      <Row label="Type" value={e?.evidenceType ?? "—"} />
      <Row label="Authority" value={e?.authority ?? "—"} />
      <Row label="Freshness" value={e?.freshness ?? "—"} />
      <Row label="Quality" value={e?.quality ?? "—"} />
      <Row label="Supports" value={e?.supports ?? "—"} />
      <Row label="Owner" value={e?.owner ?? "—"} />
    </Drawer>
  );
}

/* ============================================================== expectation */

export function ExpectationDrawer({ expectationId, onClose }: { expectationId: string | null; onClose: () => void }) {
  const e = expectationId ? expectations.find((x) => x.id === expectationId) : null;
  if (!e) return null;
  return (
    <Drawer open onOpenChange={(v) => { if (!v) onClose(); }} title={`${e.id} · ${e.metric}`}
      description="Expectation recorded at decision time. Historical context is never rewritten.">
      <Row label="Decision" value={e.decisionId} />
      <Row label="Baseline" value={e.baseline} />
      <Row label="Expected Value" value={e.expectedValue} />
      <Row label="Expected Range" value={e.expectedRange} />
      <Row label="Observation Window" value={e.observationWindow} />
      <Row label="Owner" value={e.owner} />
    </Drawer>
  );
}

/* ================================================================= variance */

export function VarianceDrawer({ varianceId, onClose }: { varianceId: string | null; onClose: () => void }) {
  const v = varianceId ? variances.find((x) => x.id === varianceId) : null;
  if (!v) return null;
  return (
    <Drawer open onOpenChange={(vis) => { if (!vis) onClose(); }} wide title={`${v.id} · ${v.metric}`}
      description={`${v.varianceDirection} variance · ${v.materiality}`}>
      <div className="grid grid-cols-2 gap-x-4">
        <Row label="Dimension" value={v.dimension} />
        <Row label="Expected" value={v.expectedValue} />
        <Row label="Expected Range" value={v.expectedRange} />
        <Row label="Observed" value={v.observedValue} />
        <Row label="Absolute Difference" value={v.absoluteDifference} />
        <Row label="Relative Difference" value={v.relativeDifference} />
        <Row label="Threshold Difference" value={v.thresholdDifference} />
        <Row label="Confidence" value={`${v.confidence}%`} />
        <Row label="Affected Personas" value={v.affectedPersonaIds.map(personaNameById).join(", ")} />
        <Row label="Evidence" value={v.evidenceReferenceIds.join(", ")} />
      </div>
      <p className="rounded border border-slate-200 bg-slate-50 px-1.5 py-1 text-[11px] text-slate-700">{v.interpretation}</p>
      {v.mitigationEffect && (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-1 text-[11px] text-emerald-800">{v.mitigationEffect}</p>
      )}
      <MiniTable head={["Potential Contributor"]} rows={v.contributors.map((c) => [c])} />
    </Drawer>
  );
}
