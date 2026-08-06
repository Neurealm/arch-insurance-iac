/** Cognitive Intake — detail drawer for a single incoming work item. */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Drawer, Pill, Row } from "../persona-studio/primitives";
import { intakeTone } from "./panels";
import {
  changeAssumptions, changeCharacteristics, intakeHistory, originalSubmission, riskSignals, stageName,
  type CognitiveIntake, type CognitiveIntakeChangeElement, type CognitiveIntakeContextMatch,
  type CognitiveIntakeEntityMatch, type CognitiveIntakeEvidence, type CognitiveIntakeGap,
  type CognitiveIntakePersonaCandidate, type CognitiveIntakeRelatedWork,
} from "./data";

const tabs = [
  "Overview", "Original Submission", "Change Model", "Entities", "Enterprise Context",
  "Candidate Personas", "Applicable Conditions", "Evidence", "Gaps", "Related Work",
  "Intake Package", "History",
] as const;

export type IntakeDetailTab = (typeof tabs)[number];

export function IntakeDetailDrawer({
  open, onOpenChange, intake, initialTab, elements, entities, context, personas, evidence, gaps,
  related, packageCompleteness, onOpenWorkbench,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  intake: CognitiveIntake | null;
  initialTab?: IntakeDetailTab;
  elements: CognitiveIntakeChangeElement[];
  entities: CognitiveIntakeEntityMatch[];
  context: CognitiveIntakeContextMatch[];
  personas: CognitiveIntakePersonaCandidate[];
  evidence: CognitiveIntakeEvidence[];
  gaps: CognitiveIntakeGap[];
  related: CognitiveIntakeRelatedWork[];
  packageCompleteness: number;
  onOpenWorkbench: () => void;
}) {
  const [tab, setTab] = useState<IntakeDetailTab>(initialTab ?? "Overview");
  if (!intake) return null;

  const conditions = context.filter((c) => c.memoryType === "Business Condition");

  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide
      title={`${intake.title} · ${intake.id}`}
      description={`${intake.workType} · Priority ${intake.priority} · ${intake.status}`}>
      <div className="flex flex-wrap gap-1">
        <Pill label={`Context ${intake.contextMatchScore}%`} tone="blue" />
        <Pill label={`Evidence ${intake.evidenceCoverage}%`} tone={intake.evidenceCoverage >= 95 ? "green" : "amber"} />
        <Pill label={`Confidence ${intake.intakeConfidence}%`} tone="blue" />
        <Pill label={`Package ${packageCompleteness}%`} tone={packageCompleteness >= 90 ? "green" : "amber"} />
        <Pill label={intake.status} tone={intakeTone(intake.status)} />
      </div>

      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Intake detail sections">
        {tabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{t}</button>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 p-2">
        {tab === "Overview" && (
          <dl>
            <Row label="Title" value={intake.title} />
            <Row label="Description" value={intake.description} />
            <Row label="Submitting Team" value={intake.submittingTeamName} />
            <Row label="Work Owner" value={intake.workOwner} />
            <Row label="Technical Owner" value={intake.technicalOwner} />
            <Row label="Business Unit" value={intake.businessUnit} />
            <Row label="Work Type" value={intake.workType} />
            <Row label="Priority" value={intake.priority} />
            <Row label="Requested Date" value={intake.requestedDate} />
            <Row label="Target Date" value={intake.targetDate} />
            <Row label="Environment" value={`${intake.environment} · ${intake.region}`} />
            <Row label="Reason" value={intake.intent} />
            <Row label="Expected Outcome" value={intake.expectedOutcomes.join("; ")} />
            <Row label="Current Stage" value={stageName(intake.currentStageId)} />
          </dl>
        )}

        {tab === "Original Submission" && (
          <dl>
            <Row label="Source" value={originalSubmission.source} />
            <Row label="Source ID" value={intake.sourceRecordId} />
            <Row label="Source type" value={originalSubmission.sourceType} />
            <Row label="Submitted by" value={intake.workOwner} />
            <Row label="Timestamp" value={intake.submittedAt} />
            <Row label="Version" value={originalSubmission.version} />
            <Row label="Attachments" value={originalSubmission.attachments.join(", ")} />
            <Row label="Access Classification" value={intake.accessClassification} />
            <Row label="Content hash" value={<span className="font-mono text-[10px]">{originalSubmission.contentHash}</span>} />
            <Row label="Preserved original" value={<span className="text-emerald-700">Immutable · {intake.originalSubmissionId}</span>} />
          </dl>
        )}

        {tab === "Change Model" && (
          <div className="space-y-2">
            <dl>
              <Row label="Intent" value={intake.intent} />
              <Row label="Current State" value={intake.currentState} />
              <Row label="Proposed State" value={intake.proposedState} />
              <Row label="Change Type" value={intake.workType} />
              <Row label="Rollout" value={intake.rolloutStrategy} />
              <Row label="Rollback" value={intake.rollbackPlan} />
              <Row label="Rollback Threshold" value={intake.rollbackThreshold} />
              <Row label="Metrics" value={intake.expectedOutcomes.join("; ")} />
            </dl>
            <Table head={["Element", "Subject", "Current", "Proposed", "Confidence", "Status"]}
              rows={elements.map((e) => [e.elementType, e.subjectName, e.currentValue, e.proposedValue, `${e.confidence}%`,
                <Pill key={e.id} label={e.status} tone={intakeTone(e.status)} />])} />
            <Chips title="Characteristics" items={changeCharacteristics} />
            <Chips title="Assumptions" items={changeAssumptions} />
            <Chips title="Risks" items={riskSignals.map((r) => `${r.name} · ${r.severity}`)} />
            <Chips title="Approvals" items={["Payments Reliability", "Fraud Engineering", "Release Governance"]} />
          </div>
        )}

        {tab === "Entities" && (
          <Table head={["Detected", "Canonical", "Type", "Confidence", "Owner", "Status"]}
            rows={entities.map((e) => [e.detectedValue, e.canonicalName, e.entityType, `${e.confidence}%`, e.owner,
              <Pill key={e.id} label={e.status} tone={intakeTone(e.status)} />])} />
        )}

        {tab === "Enterprise Context" && (
          <Table head={["Record", "Type", "Title", "Relevance", "Authority", "Included"]}
            rows={context.map((c) => [c.memoryRecordId, c.memoryType, c.title, `${c.relevanceScore}%`, c.authority,
              c.included ? "Included" : "Excluded"])} />
        )}

        {tab === "Candidate Personas" && (
          <Table head={["Persona", "Team", "Why Candidate", "Relationship", "Confidence", "Evidence"]}
            rows={personas.map((p) => [p.personaName, p.teamName, p.matchReason, p.relationshipTypes.join(", "),
              `${p.matchConfidence}%`, `${p.evidenceReferenceIds.length}`])} />
        )}

        {tab === "Applicable Conditions" && (
          <Table head={["Condition", "Type", "Why Relevant", "Authority", "Confidence", "Freshness"]}
            rows={conditions.map((c) => [c.title, c.memoryType, c.reason, c.authority, `${c.confidence}%`, c.freshness])} />
        )}

        {tab === "Evidence" && (
          <Table head={["Evidence", "Provided", "Required", "Quality", "Freshness"]}
            rows={evidence.map((e) => [e.name, e.provided ? "Yes" : "No", e.required, e.qualityScore || "—", e.freshness])} />
        )}

        {tab === "Gaps" && (
          <Table head={["Gap Type", "Question", "Severity", "Owner", "Status"]}
            rows={gaps.map((g) => [g.gapType, g.question, g.severity, g.assignedTo,
              <Pill key={g.id} label={g.status} tone={intakeTone(g.status)} />])} />
        )}

        {tab === "Related Work" && (
          <Table head={["Record", "Type", "Relationship", "Similarity", "Outcome"]}
            rows={related.map((r) => [r.relatedRecordId, r.relatedRecordType, r.relationshipType, `${r.similarity}%`, r.outcome])} />
        )}

        {tab === "Intake Package" && (
          <dl>
            <Row label="Package ID" value={intake.intakePackageId} />
            <Row label="Intent" value={intake.intent} />
            <Row label="Scope" value={intake.scope} />
            <Row label="Candidate Personas" value={`${personas.filter((p) => p.selectionState !== "Excluded").length}`} />
            <Row label="Applicable Conditions" value={`${conditions.length}`} />
            <Row label="Missing Evidence" value={`${evidence.filter((e) => e.required === "Required" && !e.provided).length}`} />
            <Row label="Open Questions" value={`${gaps.filter((g) => g.status === "Open").length}`} />
            <Row label="Context Confidence" value={`${intake.intakeConfidence}%`} />
            <Row label="Package Completeness" value={`${packageCompleteness}%`} />
            <Row label="Status" value={<Pill label={intake.status} tone={intakeTone(intake.status)} />} />
          </dl>
        )}

        {tab === "History" && (
          <ol className="space-y-1">
            {intakeHistory.map((h) => (
              <li key={h.id} className="rounded border border-slate-200 bg-slate-50 p-1.5">
                <p className="text-[11px] font-medium text-slate-800">{h.action}</p>
                <p className="text-[10.5px] text-slate-600">{h.detail}</p>
                <p className="text-[10px] text-slate-400">{h.at} · {h.owner}</p>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" onClick={onOpenWorkbench}>Open Workbench</Button>
        {["Refresh Context", "Request Clarification", "Add Evidence", "Route to Readiness", "Export"].map((l) => (
          <Button key={l} size="sm" variant="outline" className="h-7 text-[11px]" disabled title="Available in Prompt 2">{l}</Button>
        ))}
      </div>
    </Drawer>
  );
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[11px]">
        <thead className="bg-slate-50">
          <tr>{head.map((h) => <th key={h} scope="col" className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-600">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              {r.map((c, j) => <td key={j} className="px-2 py-1 align-top text-slate-700">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Chips({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-1 flex flex-wrap gap-1">{items.map((i) => <Pill key={i} label={i} tone="slate" />)}</div>
    </div>
  );
}
