/** Cross Team Impact Analysis — detail drawers built on the shared ECF Drawer. */

import { Button } from "@/components/ui/button";
import { Drawer, Pill, Row } from "../persona-studio/primitives";
import { SimpleTable, ctiTone } from "./panels";
import {
  agreements, conditionById, conflictsFor, coordinationActionsFor, dependenciesFor,
  evidenceById, evidenceState, intersectionsFor, mitigationCandidates, opportunities,
  personaById, personaScore, stageById,
  type CrossTeamImpactAnalysis, type CrossTeamImpactConflict, type CrossTeamSharedDependency,
  type CtiAnalysisState, type CtiEvidence, type CtiGraphNode,
} from "./data";
import { useState } from "react";

const pct = (n: number) => `${Math.round(n)}%`;

export function AnalysisDetailDrawer({
  analysis, state, onClose, onOpenWorkbench, onOpenPersonaImpact, onOpenDependency, onOpenEvidence,
}: {
  analysis: CrossTeamImpactAnalysis | null;
  state: CtiAnalysisState;
  onClose: () => void;
  onOpenWorkbench: () => void;
  onOpenPersonaImpact: () => void;
  onOpenDependency: (d: CrossTeamSharedDependency) => void;
  onOpenEvidence: (e: CtiEvidence) => void;
}) {
  const tabs = ["Overview", "Persona Results", "Impact Matrix", "Intersections", "Shared Dependencies",
    "Conflicts", "Opportunities", "Mitigations", "Evidence", "Coordination Actions", "Decision Context", "History"];
  const [tab, setTab] = useState("Overview");
  if (!analysis) return null;
  const deps = dependenciesFor(state);
  const conflicts = conflictsFor(state);
  const actions = coordinationActionsFor(state);
  const evidence = evidenceState(state);

  return (
    <Drawer open={Boolean(analysis)} onOpenChange={(o) => { if (!o) onClose(); }} wide
      title={`${analysis.id} · ${analysis.workItem}`}
      description={`${analysis.submittingTeam} · ${analysis.personaIds.length} Team Personas evaluated`}>
      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Analysis detail tabs">
        {tabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={`rounded border px-2 py-0.5 text-[10.5px] ${tab === t ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-2 space-y-2">
        {tab === "Overview" && (
          <div className="grid gap-1.5 sm:grid-cols-2">
            <Row label="Analysis ID" value={analysis.id} />
            <Row label="Work Item" value={analysis.workItem} />
            <Row label="Submitting Team" value={analysis.submittingTeam} />
            <Row label="Teams Evaluated" value={`${analysis.personaIds.length}`} />
            <Row label="Personas" value={analysis.personaIds.map((p) => personaById(p).short).join(", ")} />
            <Row label="Matrix Coverage" value={pct(analysis.matrixCoverage)} />
            <Row label="Highest Severity" value={<Pill label={analysis.highestSeverity} tone={ctiTone(analysis.highestSeverity)} />} />
            <Row label="Confidence" value={pct(analysis.confidence)} />
            <Row label="Conflicts" value={`${analysis.conflictCount}`} />
            <Row label="Shared Dependencies" value={`${analysis.sharedDependencyCount}`} />
            <Row label="Opportunities" value={`${analysis.opportunityCount}`} />
            <Row label="Coordination Actions" value={`${analysis.coordinationActionCount}`} />
            <Row label="Current Stage" value={stageById(analysis.currentStageId).name} />
            <Row label="Status" value={<Pill label={analysis.status} tone={ctiTone(analysis.status)} />} />
          </div>
        )}
        {tab === "Persona Results" && (
          <SimpleTable head={["Persona", "Impact Score", "Highest Severity", "Primary Benefit", "Primary Risk", "Required Review"]}
            rows={analysis.personaIds.filter((p) => p !== "PER 4107").map((p) => {
              const persona = personaById(p);
              return [persona.name, personaScore(p, state), <Pill key="s" label={persona.highestSeverity} tone={ctiTone(persona.highestSeverity)} />,
                persona.primaryBenefit, persona.primaryRisk, persona.reviewRequired ? "Yes" : "No"];
            })} />
        )}
        {tab === "Impact Matrix" && (
          <p className="rounded border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-600">
            Matrix coverage {pct(analysis.matrixCoverage)} across {analysis.personaIds.length} Persona rows.
            Open the Cross Team Impact Matrix on the page to inspect individual cells in either mode.
          </p>
        )}
        {tab === "Intersections" && (
          <SimpleTable head={["Intersection", "Teams", "Shared Entity", "Severity", "Direction", "Status"]}
            rows={intersectionsFor(state).map((i) => [i.id, i.personaIds.map((p) => personaById(p).short).join(" ↔ "),
              i.sharedEntityId, <Pill key="s" label={i.severity} tone={ctiTone(i.severity)} />, i.direction,
              <Pill key="st" label={i.status} tone={ctiTone(i.status)} />])} />
        )}
        {tab === "Shared Dependencies" && (
          <SimpleTable head={["Dependency", "Criticality", "Affected Personas", "Concern", "Status"]}
            rows={deps.map((d) => [
              <button key="d" onClick={() => onOpenDependency(d)} className="text-blue-700 underline-offset-2 hover:underline">{d.dependencyName}</button>,
              <Pill key="c" label={d.criticality} tone={ctiTone(d.criticality)} />,
              d.affectedPersonaIds.map((p) => personaById(p).short).join(", "), d.primaryConcern,
              <Pill key="s" label={d.status} tone={ctiTone(d.status)} />])} />
        )}
        {tab === "Conflicts" && (
          <SimpleTable head={["Persona A", "Persona B", "Type", "Severity", "Status"]}
            rows={conflicts.map((c) => [personaById(c.personaAId).name, personaById(c.personaBId).name, c.conflictType,
              <Pill key="s" label={c.severity} tone={ctiTone(c.severity)} />, <Pill key="st" label={c.status} tone={ctiTone(c.status)} />])} />
        )}
        {tab === "Opportunities" && (
          <SimpleTable head={["Opportunity", "Teams", "Benefit", "Confidence"]}
            rows={opportunities.map((o) => [o.title, o.personaIds.map((p) => personaById(p).short).join(", "), o.benefitType, pct(o.confidence)])} />
        )}
        {tab === "Mitigations" && (
          <SimpleTable head={["Mitigation", "Addresses", "Owner Candidate", "Priority", "Status"]}
            rows={mitigationCandidates.map((m) => [m.title, m.affectedPersonaIds.map((p) => personaById(p).short).join(", "),
              m.ownerCandidate, <Pill key="p" label={m.priority} tone={ctiTone(m.priority)} />, m.status])} />
        )}
        {tab === "Evidence" && (
          <SimpleTable head={["Evidence", "Type", "Authority", "Recency", "Status"]}
            rows={evidence.map((e) => [
              <button key="e" onClick={() => onOpenEvidence(e)} className="text-blue-700 underline-offset-2 hover:underline">{e.label}</button>,
              e.type, e.authority, e.recency, <Pill key="s" label={e.status} tone={ctiTone(e.status)} />])} />
        )}
        {tab === "Coordination Actions" && (
          <SimpleTable head={["Action", "Owner", "Teams", "Priority", "Status"]}
            rows={actions.map((a) => [a.title, a.primaryOwner, a.participatingTeamIds.map((p) => personaById(p).short).join(", "),
              <Pill key="p" label={a.priority} tone={ctiTone(a.priority)} />, <Pill key="s" label={a.status} tone={ctiTone(a.status)} />])} />
        )}
        {tab === "Decision Context" && (
          <div className="space-y-1.5">
            <p className="text-[11.5px] text-slate-700">
              Structured downstream summary prepared for Decision Intelligence. This page does not issue the enterprise decision.
            </p>
            <SimpleTable head={["Element", "Value"]}
              rows={[["Teams evaluated", `${analysis.personaIds.length}`], ["Unresolved conflicts", `${conflicts.filter((c) => c.status === "Open" || c.status === "Needs Evidence").length}`],
                ["Coordination actions", `${actions.length}`], ["Evidence gaps", `${evidence.filter((e) => e.status !== "Provided").length}`],
                ["Handoff", <Pill key="h" label="Pending (Prompt 2)" tone="amber" />]]} />
          </div>
        )}
        {tab === "History" && (
          <SimpleTable head={["Event", "Timestamp"]}
            rows={[["Analysis started", analysis.startedAt], ["Last updated", analysis.updatedAt],
              ["Completed", analysis.completedAt ?? "—"]]} />
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" onClick={onOpenWorkbench}>Open Cross Team Workbench</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onOpenPersonaImpact}>Open Persona Impact Analysis</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenDependency(deps[0])}>Open Dependency Path</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenEvidence(evidence[0])}>Open Evidence</Button>
      </div>
    </Drawer>
  );
}

export function ConflictDrawer({ conflict, onClose }: { conflict: CrossTeamImpactConflict | null; onClose: () => void }) {
  if (!conflict) return null;
  return (
    <Drawer open onOpenChange={(o) => { if (!o) onClose(); }}
      title={`${personaById(conflict.personaAId).name} ↔ ${personaById(conflict.personaBId).name}`}
      description={conflict.conflictType}>
      <div className="space-y-1.5">
        <p className="text-[12px] text-slate-700">{conflict.description}</p>
        <Row label="Priority A" value={conflict.priorityA} />
        <Row label="Priority B" value={conflict.priorityB} />
        <Row label="Severity" value={<Pill label={conflict.severity} tone={ctiTone(conflict.severity)} />} />
        <Row label="Status" value={<Pill label={conflict.status} tone={ctiTone(conflict.status)} />} />
        <Row label="Conditions" value={conflict.conditionIds.map((c) => conditionById(c).label).join("; ") || "—"} />
        <Row label="Shared dependencies" value={conflict.dependencyIds.join(", ") || "—"} />
        <Row label="Evidence" value={conflict.evidenceReferenceIds.map((e) => evidenceById(e).label).join("; ") || "Evidence gap"} />
        <Row label="Potential coordination" value={conflict.potentialCoordination} />
        <p className="rounded border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600">
          Prompt 2 adds conflict management, escalation, and coordination workflow from this drawer.
        </p>
      </div>
    </Drawer>
  );
}

export function DependencyDrawer({ dependency, onClose }: { dependency: CrossTeamSharedDependency | null; onClose: () => void }) {
  if (!dependency) return null;
  return (
    <Drawer open onOpenChange={(o) => { if (!o) onClose(); }}
      title={dependency.dependencyName} description={`${dependency.dependencyType} · ${dependency.affectedPersonaIds.length} Personas affected`}>
      <div className="space-y-1.5">
        <Row label="Criticality" value={<Pill label={dependency.criticality} tone={ctiTone(dependency.criticality)} />} />
        <Row label="Current health" value={<Pill label={dependency.currentHealth} tone={ctiTone(dependency.currentHealth)} />} />
        <Row label="Impact direction" value={dependency.impactDirection} />
        <Row label="Capacity signal" value={dependency.capacitySignal} />
        <Row label="Failure propagation" value={dependency.failurePropagation} />
        <Row label="Primary concern" value={dependency.primaryConcern} />
        <Row label="Affected Personas" value={dependency.affectedPersonaIds.map((p) => personaById(p).name).join(", ")} />
        <Row label="Evidence" value={dependency.evidenceReferenceIds.map((e) => evidenceById(e).label).join("; ") || "Evidence gap"} />
      </div>
    </Drawer>
  );
}

export function ConditionDrawer({ conditionId, onClose }: { conditionId: string | null; onClose: () => void }) {
  if (!conditionId) return null;
  const c = conditionById(conditionId);
  return (
    <Drawer open onOpenChange={(o) => { if (!o) onClose(); }} title={c.label} description={c.source}>
      <div className="space-y-1.5">
        <p className="text-[12px] text-slate-700">{c.detail}</p>
        <Row label="Authority" value={c.authority} />
        <Row label="Status" value={<Pill label={c.status} tone={ctiTone(c.status)} />} />
        <Row label="Personas influenced" value={c.personaIds.map((p) => personaById(p).name).join(", ")} />
      </div>
    </Drawer>
  );
}

export function EvidenceDrawer({ evidence, onClose }: { evidence: CtiEvidence | null; onClose: () => void }) {
  if (!evidence) return null;
  return (
    <Drawer open onOpenChange={(o) => { if (!o) onClose(); }} title={evidence.label} description={evidence.type}>
      <div className="space-y-1.5">
        <Row label="Authority" value={evidence.authority} />
        <Row label="Recency" value={evidence.recency} />
        <Row label="Status" value={<Pill label={evidence.status} tone={ctiTone(evidence.status)} />} />
        <Row label="Personas relying on it" value={evidence.personaIds.map((p) => personaById(p).name).join(", ")} />
        <p className="rounded border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600">
          Prompt 2 adds evidence remediation and requests from this drawer.
        </p>
      </div>
    </Drawer>
  );
}

export function PersonaDrawer({ personaId, state, onClose }: { personaId: string | null; state: CtiAnalysisState; onClose: () => void }) {
  if (!personaId) return null;
  const p = personaById(personaId);
  return (
    <Drawer open onOpenChange={(o) => { if (!o) onClose(); }} title={p.name} description={`${p.team} · ${p.businessUnit}`}>
      <div className="space-y-1.5">
        <Row label="Impact score" value={`${personaScore(p.id, state)}`} />
        <Row label="Highest severity" value={<Pill label={p.highestSeverity} tone={ctiTone(p.highestSeverity)} />} />
        <Row label="Primary benefit" value={p.primaryBenefit} />
        <Row label="Primary risk" value={p.primaryRisk} />
        <Row label="Review required" value={p.reviewRequired ? "Yes" : "No"} />
        <Row label="Source evaluation" value={p.personaImpactEvaluationId} />
        <p className="text-[11px] text-slate-500">
          Persona results originate in Persona Impact Analysis. This page synthesises them without averaging them together.
        </p>
        <SimpleTable head={["Shared agreement", "Confidence"]}
          rows={agreements.filter((a) => a.personaIds.includes(p.id)).map((a) => [a.title, pct(a.confidence)])} />
      </div>
    </Drawer>
  );
}

export function GraphNodeDrawer({ node, onClose }: { node: CtiGraphNode | null; onClose: () => void }) {
  if (!node) return null;
  return (
    <Drawer open onOpenChange={(o) => { if (!o) onClose(); }} title={node.label} description={node.kind}>
      <div className="space-y-1.5">
        <Row label="Detail" value={node.detail} />
        <Row label="Impact type" value={node.direct ? "Direct impact" : "Propagated impact"} />
        {node.personaIds && <Row label="Team Persona" value={node.personaIds.map((p) => personaById(p).name).join(", ")} />}
      </div>
    </Drawer>
  );
}
