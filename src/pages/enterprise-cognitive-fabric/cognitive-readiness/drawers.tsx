/**
 * Cognitive Readiness Assessment — assessment detail drawer.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Drawer, Pill, Row } from "../persona-studio/primitives";
import { tone } from "./panels";
import {
  ambiguities, assumptions, conditionStates, constraints, contradictions, dependencyStates,
  evidenceItems, findings, readinessDimensions, workContext,
  type CognitiveReadinessAssessment, type CognitiveReadinessGate, type CognitiveReadinessPersonaState,
} from "./data";

const tabs = [
  "Overview", "Intake Package", "Readiness Dimensions", "Gates", "Context", "Evidence",
  "Personas", "Conditions", "Dependencies", "Assumptions", "Constraints", "Ambiguities",
  "Contradictions", "Findings", "Handoff Preview", "History",
] as const;

export function AssessmentDetailDrawer({
  open, onOpenChange, assessment, gates, personas,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  assessment: CognitiveReadinessAssessment | null;
  gates: CognitiveReadinessGate[];
  personas: CognitiveReadinessPersonaState[];
}) {
  const [tab, setTab] = useState<string>("Overview");
  if (!assessment) return null;
  const a = assessment;

  const list = (items: string[]) => (
    <ul className="space-y-1 text-[11px] text-slate-700">
      {items.map((i) => <li key={i} className="rounded border border-slate-200 px-1.5 py-1">{i}</li>)}
    </ul>
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide
      title={`${a.id} · ${a.workItem}`}
      description="Readiness detail. This drawer never approves work and never computes Persona impact.">
      <div className="mb-2 flex flex-wrap gap-1" role="tablist" aria-label="Assessment detail tabs">
        {tabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-1">
          <Row label="Readiness State" value={<Pill label={a.state} tone={tone(a.state)} />} />
          <Row label="Readiness Score" value={`${a.score} / 100`} />
          <Row label="Confidence" value={`${a.confidence}%`} />
          <Row label="Submitting Team" value={a.submittingTeam} />
          <Row label="Business Unit" value={a.businessUnit} />
          <Row label="Work Type" value={a.workType} />
          <Row label="Priority" value={a.priority} />
          <Row label="Blocking Gaps" value={String(a.blockingGaps)} />
          <Row label="Warnings" value={String(a.warnings)} />
          <Row label="Blocking Gate" value={a.blockingGate} />
          <Row label="Owner" value={a.owner} />
          <Row label="Updated" value={a.updated} />
        </div>
      )}

      {tab === "Intake Package" && (
        <div className="space-y-1">
          <Row label="Intake Package Version" value={workContext.intakePackageVersion} />
          <Row label="Intent" value={workContext.intent} />
          <Row label="Current State" value={workContext.currentState} />
          <Row label="Proposed State" value={workContext.proposedState} />
          <Row label="Scope" value={`${workContext.initialScope} initial · ${workContext.potentialExpansion} potential`} />
          <Row label="Systems" value={workContext.systems.join(", ")} />
          <Row label="Rollout" value={workContext.rollout} />
          <Row label="Rollback" value={workContext.rollback} />
          <Row label="Expected Outcome" value={workContext.expectedOutcome} />
        </div>
      )}

      {tab === "Readiness Dimensions" && (
        <div className="space-y-1">
          {readinessDimensions.map((d) => <Row key={d.id} label={d.name} value={`${d.score} · target ${d.target}`} />)}
        </div>
      )}

      {tab === "Gates" && (
        <div className="space-y-1">
          {gates.map((g) => <Row key={g.id} label={g.name} value={<Pill label={g.status} tone={tone(g.status)} />} />)}
        </div>
      )}

      {tab === "Context" && list(["Intent", "Current State", "Proposed State", "Scope", "Systems", "Services", "Dependencies", "Business Conditions", "Candidate Personas", "Rollout", "Rollback", "Expected Outcomes"])}
      {tab === "Evidence" && list(evidenceItems.map((e) => `${e.evidence} · ${e.status}`))}
      {tab === "Personas" && list(personas.map((p) => `${p.persona} · ${p.readiness}`))}
      {tab === "Conditions" && list(conditionStates.map((c) => `${c.condition} · ${c.status}`))}
      {tab === "Dependencies" && list(dependencyStates.map((d) => `${d.dependency} · ${d.status}`))}
      {tab === "Assumptions" && list(assumptions.map((x) => `${x.assumption} · ${x.validationState}`))}
      {tab === "Constraints" && list(constraints.map((c) => `${c.constraint} · ${c.status}`))}
      {tab === "Ambiguities" && list(ambiguities.map((x) => `“${x.text}” · ${x.whyAmbiguous}`))}
      {tab === "Contradictions" && list(contradictions.map((c) => `${c.conflictType} · ${c.severity}`))}
      {tab === "Findings" && list(findings.map((f) => `${f.id} · ${f.type} · ${f.severity}`))}

      {tab === "Handoff Preview" && (
        <div className="space-y-1">
          <Row label="Readiness Assessment Version" value={workContext.assessmentVersion} />
          <Row label="Historical Context Version" value={workContext.historicalContextVersion} />
          <Row label="Routing" value="Preview only. Prompt 1 does not route." />
        </div>
      )}

      {tab === "History" && (
        <div className="space-y-1">
          <Row label="CRA 7001 v2" value="Evidence re-evaluated after rollback threshold added" />
          <Row label="CRA 7001 v1" value="Initial readiness assessment from Intake Package v3" />
          <Row label="Historical Context Rewrite Violations" value="0" />
        </div>
      )}
    </Drawer>
  );
}
