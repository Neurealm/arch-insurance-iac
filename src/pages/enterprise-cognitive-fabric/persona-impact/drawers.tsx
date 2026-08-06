/** Persona Impact Analysis — evaluation detail drawer and contextual summaries. */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Drawer, Pill, Row } from "../persona-studio/primitives";
import { SimpleTable, piaTone } from "./panels";
import {
  conflictsFor, dependencyPaths, evaluatePersona, impactConditions, impactEvidence,
  mitigations, opportunities, personaById, proposalRelatedServices, proposalSystems,
  recommendations, scorePersona, activityRows,
  type GraphNode, type ImpactCondition, type ImpactEvidence, type PersonaImpactConflict,
  type PersonaImpactEvaluation, type ProposalState,
} from "./data";

const pct = (n: number) => `${Math.round(n)}%`;

const detailTabs = [
  "Overview", "Intake Package", "Personas", "Impact Findings", "Applicable Conditions",
  "Dependencies", "Risks & Controls", "Evidence", "Conflicts", "Opportunities",
  "Recommendations", "History",
] as const;

export function EvaluationDetailDrawer({
  open, onOpenChange, evaluation, proposal, onOpenWorkbench, onOpenPersona,
  onOpenCondition, onOpenEvidence,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  evaluation: PersonaImpactEvaluation | null;
  proposal: ProposalState;
  onOpenWorkbench: () => void;
  onOpenPersona: (id: string) => void;
  onOpenCondition: (c: ImpactCondition) => void;
  onOpenEvidence: (e: ImpactEvidence) => void;
}) {
  const [tab, setTab] = useState<(typeof detailTabs)[number]>("Overview");
  if (!evaluation) return null;

  const personaIds = evaluation.selectedPersonaIds;
  const findings = personaIds.flatMap((id) => evaluatePersona(id, proposal));
  const scores = personaIds.map((id) => scorePersona(id, proposal));
  const conflicts = conflictsFor(proposal);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide
      title={`${evaluation.id} · ${evaluation.title}`}
      description={`${evaluation.submittingTeam} · ${evaluation.status} · ${personaIds.length} Personas evaluated`}>
      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Evaluation detail sections">
        {detailTabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded border px-2 py-0.5 text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {tab === "Overview" && (
          <dl>
            <Row label="Evaluation" value={evaluation.id} />
            <Row label="Work Item" value={evaluation.title} />
            <Row label="Submitting Team" value={evaluation.submittingTeam} />
            <Row label="Owner" value={evaluation.owner} />
            <Row label="Selected Personas" value={personaIds.map((p) => personaById(p).name).join(", ")} />
            <Row label="Current Stage" value={evaluation.currentStageId} />
            <Row label="Highest Severity" value={<Pill label={evaluation.highestSeverity} tone={piaTone(evaluation.highestSeverity)} />} />
            <Row label="Confidence" value={pct(evaluation.overallConfidence)} />
            <Row label="Evidence Coverage" value={pct(evaluation.evidenceCoverage)} />
            <Row label="Conflicts" value={evaluation.conflictCount} />
            <Row label="Opportunities" value={evaluation.opportunityCount} />
          </dl>
        )}

        {tab === "Intake Package" && (
          <dl>
            <Row label="Package Version" value={evaluation.intakePackageVersionId} />
            <Row label="Intent" value={proposal.intent} />
            <Row label="Current State" value={proposal.currentState} />
            <Row label="Proposed State" value={proposal.proposedState} />
            <Row label="Scope" value={`${proposal.initialTraffic}% initial, ${proposal.maxTraffic}% maximum planned`} />
            <Row label="Primary Systems" value={proposalSystems.join(", ")} />
            <Row label="Dependencies" value={proposalRelatedServices.join(", ")} />
            <Row label="Evidence" value={impactEvidence.filter((e) => e.status === "Provided").map((e) => e.name).join(", ")} />
          </dl>
        )}

        {tab === "Personas" && (
          <SimpleTable head={["Persona", "Match Reason", "Persona Version", "Impact State", "Impact Score", "Confidence"]}
            rows={scores.map((s) => {
              const p = personaById(s.personaId);
              return [
                <button key={p.id} type="button" className="text-blue-700 hover:underline" onClick={() => onOpenPersona(p.id)}>{p.name}</button>,
                `Owns ${p.decisionPriorities[0].toLowerCase()} affected by this change`,
                p.version, <Pill key="c" label={s.classification} tone={s.score >= 70 ? "red" : s.score >= 60 ? "amber" : "blue"} />,
                s.score, pct(s.confidence),
              ];
            })} />
        )}

        {tab === "Impact Findings" && (
          <SimpleTable head={["Finding", "Persona", "Dimension", "Direction", "Severity", "Confidence", "Evidence"]}
            rows={findings.map((f) => [f.title, personaById(f.personaId).name, f.impactDimension,
              f.direction, <Pill key="s" label={f.severity} tone={piaTone(f.severity)} />,
              pct(f.confidence), f.evidenceReferenceIds.join(", ") || "Gap"])} />
        )}

        {tab === "Applicable Conditions" && (
          <SimpleTable head={["Condition", "Type", "Personas", "Authority", "Confidence"]}
            rows={impactConditions.map((c) => [
              <button key={c.id} type="button" className="text-left text-blue-700 hover:underline" onClick={() => onOpenCondition(c)}>{c.id} · {c.statement}</button>,
              c.conditionType, c.personaIds.map((p) => personaById(p).name).join(", "), c.authority, pct(c.confidence)])} />
        )}

        {tab === "Dependencies" && (
          <SimpleTable head={["Source", "Relationship", "Target", "Criticality", "Propagation"]}
            rows={dependencyPaths.map((d) => [d.sourceEntityId, d.relationshipPath.join(" → "), d.targetEntityId,
              <Pill key="c" label={d.criticality} tone={piaTone(d.criticality)} />, d.propagation])} />
        )}

        {tab === "Risks & Controls" && (
          <SimpleTable head={["Risk", "Control", "Persona", "Status"]}
            rows={findings.filter((f) => f.riskIds.length || f.controlIds.length).map((f) => [
              f.title, f.controlIds.join(", ") || "Recommended", personaById(f.personaId).name,
              <Pill key="s" label={f.reviewRequired ? "Review Required" : "Monitoring"} tone={f.reviewRequired ? "amber" : "green"} />])} />
        )}

        {tab === "Evidence" && (
          <SimpleTable head={["Evidence", "Type", "Authority", "Quality", "Status"]}
            rows={impactEvidence.map((e) => [
              <button key={e.id} type="button" className="text-left text-blue-700 hover:underline" onClick={() => onOpenEvidence(e)}>{e.id} · {e.name}</button>,
              e.evidenceType, e.authority, e.status === "Missing" ? "—" : e.quality,
              <Pill key="s" label={e.status} tone={e.status === "Provided" ? "green" : "red"} />])} />
        )}

        {tab === "Conflicts" && (
          <SimpleTable head={["Conflict", "Persona A", "Persona B", "Type", "Severity", "Potential Resolution"]}
            rows={conflicts.map((c) => [c.description, personaById(c.personaAId).name, personaById(c.personaBId).name,
              c.conflictType, <Pill key="s" label={c.severity} tone={piaTone(c.severity)} />, c.potentialResolution])} />
        )}

        {tab === "Opportunities" && (
          <SimpleTable head={["Opportunity", "Personas", "Benefit Type", "Confidence"]}
            rows={opportunities.map((o) => [o.title, o.personaIds.map((p) => personaById(p).name).join(", "),
              o.benefitType, pct(o.confidence)])} />
        )}

        {tab === "Recommendations" && (
          <SimpleTable head={["Recommendation", "Persona", "Type", "Priority", "Required", "Mitigations"]}
            rows={recommendations.map((r) => [r.title, personaById(r.personaId).name, r.recommendationType,
              r.priority, r.required ? "Yes" : "No",
              r.mitigationIds.map((m) => mitigations.find((x) => x.id === m)?.title ?? m).join(", ") || "None"])} />
        )}

        {tab === "History" && (
          <SimpleTable head={["Time", "Action", "Description", "Result", "Owner", "Audit"]}
            rows={activityRows.map((a) => [a.timestamp, a.action, a.description,
              <Pill key="r" label={a.result} tone={piaTone(a.result)} />, a.owner, a.auditId])} />
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" onClick={onOpenWorkbench}>Open Workbench</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenPersona(personaIds[0])}>Open Persona</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenCondition(impactConditions[0])}>Open Condition</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenEvidence(impactEvidence[0])}>Open Evidence</Button>
      </div>
    </Drawer>
  );
}

export function PersonaContextDrawer({
  open, onOpenChange, personaId, proposal,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; personaId: string | null; proposal: ProposalState;
}) {
  if (!personaId) return null;
  const p = personaById(personaId);
  const s = scorePersona(personaId, proposal);
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={`${p.name} · ${p.version}`}
      description={`Approved Team Persona · quality ${p.quality} · confidence ${pct(p.confidence)}`}>
      <dl>
        <Row label="Mission" value={p.mission} />
        <Row label="Owner" value={p.owner} />
        <Row label="Impact Score" value={`${s.score} · ${s.classification}`} />
        <Row label="Risk Appetite" value={p.riskAppetite} />
        <Row label="Escalation Philosophy" value={p.escalationPhilosophy} />
        <Row label="Decision Priorities" value={p.decisionPriorities.join(", ")} />
        <Row label="Success Criteria" value={p.successCriteria.join(", ")} />
        <Row label="Constraints" value={p.constraints.join(", ")} />
        <Row label="Dependencies" value={p.dependencies.join(", ")} />
        <Row label="Risks" value={p.risks.join(", ")} />
        <Row label="Controls" value={p.controls.join(", ")} />
        <Row label="Preferred Evidence" value={p.preferredEvidence.join(", ")} />
        <Row label="Approval Requirements" value={p.approvalRequirements.join(", ")} />
      </dl>
      <p className="text-[10.5px] text-slate-500">
        Team Personas are never modified by Persona Impact Analysis. Editing happens in Team Persona Construction.
      </p>
    </Drawer>
  );
}

export function ConditionDrawer({
  open, onOpenChange, condition,
}: { open: boolean; onOpenChange: (v: boolean) => void; condition: ImpactCondition | null }) {
  if (!condition) return null;
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={`${condition.id} · ${condition.conditionType}`}
      description={condition.statement}>
      <dl>
        <Row label="Applicable Personas" value={condition.personaIds.map((p) => personaById(p).name).join(", ")} />
        <Row label="Why Relevant" value={condition.whyRelevant} />
        <Row label="Authority" value={condition.authority} />
        <Row label="Confidence" value={pct(condition.confidence)} />
        <Row label="Freshness" value={condition.freshness} />
        <Row label="Impact Dimension" value={condition.impactDimension} />
        <Row label="Status" value={<Pill label={condition.status} tone={piaTone(condition.status)} />} />
      </dl>
    </Drawer>
  );
}

export function EvidenceDrawer({
  open, onOpenChange, evidence,
}: { open: boolean; onOpenChange: (v: boolean) => void; evidence: ImpactEvidence | null }) {
  if (!evidence) return null;
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={`${evidence.id} · ${evidence.name}`}
      description={`${evidence.evidenceType} · ${evidence.source}`}>
      <dl>
        <Row label="Summary" value={evidence.summary} />
        <Row label="Applicable Personas" value={evidence.personaIds.map((p) => personaById(p).name).join(", ")} />
        <Row label="Impact Dimensions" value={evidence.dimensions.join(", ")} />
        <Row label="Authority" value={evidence.authority} />
        <Row label="Freshness" value={evidence.freshness} />
        <Row label="Quality" value={evidence.status === "Missing" ? "Not available" : evidence.quality} />
        <Row label="Required" value={evidence.required ? "Yes" : "No"} />
        <Row label="Status" value={<Pill label={evidence.status} tone={evidence.status === "Provided" ? "green" : "red"} />} />
      </dl>
    </Drawer>
  );
}

export function GraphNodeDrawer({
  open, onOpenChange, node,
}: { open: boolean; onOpenChange: (v: boolean) => void; node: GraphNode | null }) {
  if (!node) return null;
  const paths = dependencyPaths.filter((d) => d.sourceEntityId === node.label || d.targetEntityId === node.label);
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={node.label} description={node.summary}>
      <dl>
        <Row label="Entity Type" value={node.kind} />
        <Row label="Connected Paths" value={paths.length} />
      </dl>
      <SimpleTable head={["Path", "Source", "Target", "Criticality", "Propagation"]}
        rows={paths.map((p) => [p.id, p.sourceEntityId, p.targetEntityId, p.criticality, p.propagation])} />
    </Drawer>
  );
}

export function ConflictDrawer({
  open, onOpenChange, conflict,
}: { open: boolean; onOpenChange: (v: boolean) => void; conflict: PersonaImpactConflict | null }) {
  if (!conflict) return null;
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={`${conflict.id} · ${conflict.conflictType}`}
      description={conflict.description}>
      <dl>
        <Row label={personaById(conflict.personaAId).name} value={conflict.personaAPosition} />
        <Row label={personaById(conflict.personaBId).name} value={conflict.personaBPosition} />
        <Row label="Severity" value={<Pill label={conflict.severity} tone={piaTone(conflict.severity)} />} />
        <Row label="Conditions" value={conflict.conditionIds.join(", ") || "None"} />
        <Row label="Evidence" value={conflict.evidenceReferenceIds.join(", ") || "None"} />
        <Row label="Potential Resolution" value={conflict.potentialResolution} />
        <Row label="Review Status" value={<Pill label={conflict.reviewStatus} tone={piaTone(conflict.reviewStatus)} />} />
      </dl>
      <p className="text-[10.5px] text-slate-500">
        Conflict review and resolution workflows arrive with the next release. Cross Team Impact Matrix owns the
        coordinated resolution.
      </p>
    </Drawer>
  );
}
