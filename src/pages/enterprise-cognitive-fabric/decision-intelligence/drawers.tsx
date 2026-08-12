/** Decision Intelligence — detail drawers. */

import { useState } from "react";
import { Drawer, Pill, Row, type Tone } from "../persona-studio/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  alternativesFor, constraintsFor, diTone, evidenceFor, magnitudeTone, outcomesFor,
  positionsFor, priorDecisions, risksFor, sharedDependencies, tradeoffsFor,
  type ComparisonRow, type DecisionAlternative, type DecisionConstraint,
  type DecisionIntelligenceEvaluation, type DerivedDecisionState, type DiEvidence,
  type PriorDecision,
} from "./data";

const detailTabs = [
  "Overview", "Decision Question", "Input Context", "Alternatives", "Persona Positions",
  "Enterprise Conditions", "Tradeoffs", "Risks & Controls", "Dependencies", "Evidence",
  "Prior Decisions", "Outcomes & Learning", "Recommendation", "Decision Context", "History",
] as const;

export function DecisionDetailDrawer({
  evaluation, derived, onClose, onNavigate,
}: {
  evaluation: DecisionIntelligenceEvaluation | null;
  derived: DerivedDecisionState;
  onClose: () => void;
  onNavigate: (target: string) => void;
}) {
  const [tab, setTab] = useState<(typeof detailTabs)[number]>("Overview");
  if (!evaluation) return null;
  const alts = alternativesFor(evaluation.id);
  const preferred = alts.find((a) => a.id === evaluation.recommendedAlternativeId);

  return (
    <Drawer open={!!evaluation} onOpenChange={(v) => !v && onClose()} wide
      title={`${evaluation.id} · Decision Evaluation`} description={evaluation.decisionQuestion}>
      <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-1" role="tablist" aria-label="Decision detail tabs">
        {detailTabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded px-1.5 py-0.5 text-[10.5px]", tab === t ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {tab === "Overview" && (
          <dl>
            <Row label="Decision ID" value={evaluation.id} />
            <Row label="Question" value={evaluation.decisionQuestion} />
            <Row label="Work Item" value={evaluation.workItem} />
            <Row label="Decision Owner" value={evaluation.decisionOwner} />
            <Row label="Priority" value={evaluation.priority} />
            <Row label="Status" value={<Pill label={evaluation.status} tone={diTone(evaluation.status) as Tone} />} />
            <Row label="Alternatives" value={alts.map((a) => a.code).join(", ") || `${evaluation.alternativeIds.length}`} />
            <Row label="Recommendation" value={<Pill label={evaluation.recommendationPosture} tone={diTone(evaluation.recommendationPosture) as Tone} />} />
            <Row label="Confidence" value={`${evaluation.recommendationConfidence}%`} />
            <Row label="Evidence Coverage" value={`${evaluation.evidenceCoverage}%`} />
            <Row label="Material Conflicts" value={String(evaluation.materialConflictCount)} />
            <Row label="Required Reviews" value={evaluation.approvalRequirement} />
          </dl>
        )}

        {tab === "Decision Question" && (
          <dl>
            <Row label="Problem" value={evaluation.decisionReason} />
            <Row label="Decision Required" value={evaluation.decisionQuestion} />
            <Row label="Decision Deadline" value={evaluation.decisionDeadline} />
            <Row label="Decision Owner" value={evaluation.decisionOwner} />
            <Row label="Decision Scope" value={evaluation.scope.join(", ")} />
            <Row label="Out of Scope" value={evaluation.outOfScope.join(", ")} />
          </dl>
        )}

        {tab === "Input Context" && (
          <dl>
            <Row label="Intake Package" value={evaluation.intakeId} />
            <Row label="Readiness Assessment" value={`RDA ${evaluation.intakeId.split(" ")[1]}`} />
            <Row label="Persona Impact Analysis" value={`PIA ${evaluation.crossTeamAnalysisId.split(" ")[1]}`} />
            <Row label="Cross Team Impact Analysis" value={evaluation.crossTeamAnalysisVersionId} />
          </dl>
        )}

        {tab === "Alternatives" && (
          <ul className="space-y-1">
            {alts.map((a) => (
              <li key={a.id} className="rounded border border-slate-200 p-2">
                <p className="text-[11.5px] font-semibold text-slate-800">{a.code} · {a.name}</p>
                <p className="text-[10.5px] text-slate-600">{a.description}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Status {a.status} · Confidence {a.confidence}%</p>
              </li>
            ))}
            {alts.length === 0 && <p className="text-[11px] text-slate-500">Alternative profiles for this decision are modelled in the workbench for DIA 5001.</p>}
          </ul>
        )}

        {tab === "Persona Positions" && (
          <table className="w-full text-left text-[10.5px]">
            <thead className="text-[9.5px] uppercase text-slate-500"><tr><th>Persona</th><th>Position</th><th>Top Benefit</th><th>Top Concern</th><th>Condition</th><th>Confidence</th></tr></thead>
            <tbody>
              {positionsFor(evaluation.id).map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-0.5">{p.persona}</td>
                  <td><Pill label={p.positions["ALT 5001 B"]} tone={diTone(p.positions["ALT 5001 B"]) as Tone} /></td>
                  <td>{p.benefits["ALT 5001 B"]}</td>
                  <td>{p.concerns["ALT 5001 B"]}</td>
                  <td>{p.requiredCondition}</td>
                  <td>{p.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "Enterprise Conditions" && (
          <ul className="space-y-1">
            {constraintsFor(evaluation.id).map((c) => (
              <li key={c.id} className="rounded border border-slate-200 px-2 py-1 text-[10.5px]">
                <span className="font-medium text-slate-800">{c.title}</span> · {c.constraintType} · {c.authority} · {c.confidence}%
                <Pill label={c.kind} tone={c.kind === "Constraint" ? "red" : "slate"} />
              </li>
            ))}
          </ul>
        )}

        {tab === "Tradeoffs" && (
          <ul className="space-y-1">
            {tradeoffsFor(evaluation.id).map((t) => (
              <li key={t.id} className="rounded border border-slate-200 px-2 py-1 text-[10.5px]">
                <p className="font-medium text-slate-800">{t.title} · {t.tradeoffType}</p>
                <p className="text-emerald-800">Benefit · {t.benefit}</p>
                <p className="text-red-800">Cost · {t.cost}</p>
              </li>
            ))}
          </ul>
        )}

        {tab === "Risks & Controls" && (
          <table className="w-full text-left text-[10.5px]">
            <thead className="text-[9.5px] uppercase text-slate-500"><tr><th>Alternative</th><th>Risk</th><th>Raw</th><th>Control</th><th>Residual</th></tr></thead>
            <tbody>
              {risksFor(evaluation.id).map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="py-0.5">{r.alternativeId.replace("ALT 5001 ", "Option ")}</td>
                  <td>{r.risk}</td>
                  <td><Pill label={r.rawSeverity} tone={magnitudeTone(r.rawSeverity) as Tone} /></td>
                  <td>{r.control}</td>
                  <td><Pill label={r.residualSeverity} tone={magnitudeTone(r.residualSeverity) as Tone} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "Dependencies" && (
          <ul className="space-y-1">
            {sharedDependencies.map((d) => (
              <li key={d.id} className="rounded border border-slate-200 px-2 py-1 text-[10.5px]">
                <span className="font-medium text-slate-800">{d.name}</span> · {d.criticality} · {d.exposure} · confidence {d.confidence}%
              </li>
            ))}
          </ul>
        )}

        {tab === "Evidence" && (
          <ul className="space-y-1">
            {evidenceFor(evaluation.id).map((e) => (
              <li key={e.id} className="rounded border border-slate-200 px-2 py-1 text-[10.5px]">
                <span className="font-medium text-slate-800">{e.name}</span> · {e.evidenceType} · {e.authority} · {e.freshness}
                <Pill label={e.status} tone={diTone(e.status) as Tone} />
              </li>
            ))}
          </ul>
        )}

        {tab === "Prior Decisions" && (
          <ul className="space-y-1">
            {priorDecisions.map((d) => (
              <li key={d.id} className="rounded border border-slate-200 px-2 py-1 text-[10.5px]">
                <span className="font-medium text-slate-800">{d.id} · {d.name}</span> · similarity {d.similarity}% · {d.decision}
              </li>
            ))}
          </ul>
        )}

        {tab === "Outcomes & Learning" && (
          <ul className="space-y-1">
            {outcomesFor(evaluation.id).slice(0, 8).map((o) => (
              <li key={o.id} className="rounded border border-slate-200 px-2 py-1 text-[10.5px]">
                {o.alternativeId.replace("ALT 5001 ", "Option ")} · {o.metric} · {o.expectedValue} ({o.expectedRange}) · {o.observationWindow}
              </li>
            ))}
            <li className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10.5px]">
              LRN 1426 · Strengthen idempotency validation before broader traffic expansion
            </li>
          </ul>
        )}

        {tab === "Recommendation" && (
          <dl>
            <Row label="Posture" value={<Pill label={evaluation.recommendationPosture} tone={diTone(evaluation.recommendationPosture) as Tone} />} />
            <Row label="Preferred Alternative" value={preferred ? `${preferred.code} · ${preferred.name}` : "Undetermined"} />
            <Row label="Confidence" value={`${evaluation.recommendationConfidence}%`} />
            <Row label="Live Workbench Posture" value={`${derived.posture} at ${derived.confidence}%`} />
          </dl>
        )}

        {tab === "Decision Context" && (
          <p className="text-[11px] text-slate-600">
            The structured Decision Context Package for this evaluation is rendered on the page. Prompt 1 prepares it; recording the final human decision is a Prompt 2 capability.
          </p>
        )}

        {tab === "History" && (
          <ul className="space-y-1 text-[10.5px] text-slate-600">
            <li>Started {evaluation.startedAt} · context loaded from {evaluation.crossTeamAnalysisVersionId}</li>
            <li>Updated {evaluation.updatedAt} · stage {evaluation.currentStageId}</li>
            <li>Decision versioning and full history become available in Prompt 2</li>
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-1 border-t border-slate-200 pt-2">
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("workbench")}>Open Decision Workbench</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("cross-team")}>Open Cross Team Analysis</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("persona-impact")}>Open Persona Impact Analysis</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("evidence")}>Open Evidence</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("prior")}>Open Prior Decision</Button>
      </div>
    </Drawer>
  );
}

export function AlternativeCellDrawer({
  cell, onClose, onOpen,
}: {
  cell: { row: ComparisonRow; alternativeId: string } | null;
  onClose: () => void;
  onOpen: (target: string) => void;
}) {
  if (!cell) return null;
  const alt = alternativesFor("DIA 5001").find((a) => a.id === cell.alternativeId);
  const v = cell.row.values[cell.alternativeId];
  const cons = constraintsFor("DIA 5001").filter((c) => c.affectedAlternativeIds.includes(cell.alternativeId));
  return (
    <Drawer open onOpenChange={(o) => !o && onClose()} title={`${alt?.code} · ${cell.row.dimension}`}
      description={alt?.name}>
      <dl>
        <Row label="Assessment" value={v.context} />
        <Row label="Direction" value={v.direction} />
        <Row label="Magnitude" value={v.magnitude} />
        <Row label="Confidence" value={`${v.confidence}%`} />
        <Row label="Affected Personas" value={positionsFor("DIA 5001").filter((p) => ["Concerned", "Oppose", "Conditional Support"].includes(p.positions[cell.alternativeId])).map((p) => p.persona).join(", ") || "None material"} />
        <Row label="Applicable Conditions" value={cons.map((c) => c.title).join("; ") || "None"} />
        <Row label="Dependencies" value={sharedDependencies.filter((d) => d.alternatives.includes(cell.alternativeId)).map((d) => d.name).join(", ")} />
        <Row label="Evidence" value={evidenceFor("DIA 5001").filter((e) => e.alternativesAffected.includes(cell.alternativeId)).slice(0, 3).map((e) => e.name).join(", ")} />
        <Row label="Mitigations" value={risksFor("DIA 5001", cell.alternativeId).map((r) => r.control).join("; ") || "None"} />
        <Row label="Assumptions" value="Dependency capacity can absorb the modelled retry increase" />
        <Row label="Prior Decision Comparison" value="DEC 4812 · Limited Retry Increase, +1.8% observed completion" />
      </dl>
      <div className="flex flex-wrap gap-1">
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpen("panel-evidence")}>Open Evidence</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpen("panel-constraints")}>Open Condition</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpen("panel-positions")}>Open Persona</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpen("panel-dependencies")}>Open Dependency</Button>
      </div>
    </Drawer>
  );
}

export function AlternativeDrawer({ alternative, onClose }: { alternative: DecisionAlternative | null; onClose: () => void }) {
  if (!alternative) return null;
  const a = alternative;
  return (
    <Drawer open onOpenChange={(o) => !o && onClose()} title={`${a.code} · ${a.name}`} description={a.strategicIntent}>
      <dl>
        <Row label="Alternative ID" value={a.id} />
        <Row label="Description" value={a.description} />
        <Row label="Customer Benefit" value={a.customerBenefit} />
        <Row label="Business Benefit" value={a.businessBenefit} />
        <Row label="Financial Impact" value={a.financialImpact} />
        <Row label="Operational Impact" value={a.operationalImpact} />
        <Row label="Reliability Impact" value={a.reliabilityImpact} />
        <Row label="Security Impact" value={a.securityImpact} />
        <Row label="Compliance Impact" value={a.complianceImpact} />
        <Row label="Dependency Impact" value={a.dependencyImpact} />
        <Row label="Coordination Cost" value={a.coordinationCost} />
        <Row label="Implementation Effort" value={a.implementationEffort} />
        <Row label="Time to Benefit" value={a.timeToBenefit} />
        <Row label="Reversibility" value={a.reversibility} />
        <Row label="Evidence Requirement" value={a.evidenceRequirement} />
        <Row label="Required Controls" value={a.requiredControlIds.join(", ") || "None"} />
        <Row label="Required Approvals" value={a.requiredApprovalIds.join(", ") || "None"} />
        <Row label="Residual Risk" value={a.residualRisk} />
        <Row label="Persona Support" value={a.personaSupport.join(", ") || "None"} />
        <Row label="Persona Concern" value={a.personaConcern.join(", ") || "None"} />
        <Row label="Confidence" value={`${a.confidence}%`} />
        <Row label="Status" value={a.status} />
      </dl>
    </Drawer>
  );
}

export function EvidenceDrawer({ evidence, onClose }: { evidence: DiEvidence | null; onClose: () => void }) {
  if (!evidence) return null;
  return (
    <Drawer open onOpenChange={(o) => !o && onClose()} title={evidence.name} description={evidence.decisionDimension}>
      <dl>
        <Row label="Evidence ID" value={evidence.id} />
        <Row label="Type" value={evidence.evidenceType} />
        <Row label="Authority" value={evidence.authority} />
        <Row label="Freshness" value={evidence.freshness} />
        <Row label="Quality" value={`${evidence.quality}`} />
        <Row label="Applicable Alternatives" value={evidence.alternativesAffected.map((a) => a.replace("ALT 5001 ", "Option ")).join(", ")} />
        <Row label="Required" value={evidence.required ? "Yes" : "No"} />
        <Row label="Status" value={<Pill label={evidence.status} tone={diTone(evidence.status) as Tone} />} />
      </dl>
    </Drawer>
  );
}

export function ConstraintDrawer({ constraint, onClose }: { constraint: DecisionConstraint | null; onClose: () => void }) {
  if (!constraint) return null;
  return (
    <Drawer open onOpenChange={(o) => !o && onClose()} title={constraint.title} description={constraint.constraintType}>
      <dl>
        <Row label="Kind" value={constraint.kind} />
        <Row label="Description" value={constraint.description} />
        <Row label="Authority" value={constraint.authority} />
        <Row label="Affected Alternatives" value={constraint.affectedAlternativeIds.map((a) => a.replace("ALT 5001 ", "Option ")).join(", ")} />
        <Row label="Evidence" value={constraint.evidenceReferenceIds.join(", ") || "None"} />
        <Row label="Confidence" value={`${constraint.confidence}%`} />
        <Row label="Status" value={constraint.status} />
      </dl>
    </Drawer>
  );
}

export function PriorDecisionDrawer({ decision, onClose }: { decision: PriorDecision | null; onClose: () => void }) {
  if (!decision) return null;
  return (
    <Drawer open onOpenChange={(o) => !o && onClose()} title={`${decision.id} · ${decision.name}`} description={decision.decision}>
      <dl>
        <Row label="Similarity" value={`${decision.similarity}%`} />
        <Row label="Conditions" value={decision.conditions.join(", ")} />
        <Row label="Expected Outcome" value={decision.expectedOutcome} />
        <Row label="Observed Outcome" value={decision.observedOutcome} />
        <Row label="Unexpected Outcome" value={decision.unexpectedOutcome} />
        <Row label="Lesson" value={decision.lesson} />
        <Row label="Learning Record" value={decision.learningId} />
        <Row label="Current Relevance" value={decision.currentRelevance} />
      </dl>
    </Drawer>
  );
}
