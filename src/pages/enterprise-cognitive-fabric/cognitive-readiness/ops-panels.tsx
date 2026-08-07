/**
 * Cognitive Readiness Assessment — Prompt 2 operational panels.
 *
 * Extends the Prompt 1 panels with remediation, validation, governance,
 * versioning, handoff, activity and notification surfaces.
 */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pill } from "../persona-studio/primitives";
import { Panel, tone } from "./panels";
import {
  ambiguities, assumptions, conditionStates, constraints, contradictions, dependencyStates,
  type CognitiveReadinessGate,
} from "./data";
import {
  additionalPersonaCandidates, conditionValidationStates, constraintCategories, policyVariables,
  type CognitiveReadinessActivity, type CognitiveReadinessAssessmentVersion,
  type CognitiveReadinessException, type CognitiveReadinessNotification,
  type CognitiveReadinessOverride, type CognitiveReadinessRemediation, type CognitiveReadinessReview,
} from "./ops-data";
import {
  compareVersions, personaRowsFor, type DownstreamWarning, type HandoffReadiness,
  type OpsState, type QualityModel, type RemediationSummary,
} from "./ops-engine";
import type { CognitiveReadinessHandoffPackage } from "./ops-data";
import type { ReadinessComputation } from "./engine";

/* ------------------------------------------------------------- primitives -- */

export function MiniBtn({ label, onClick, tone: t = "slate" }: {
  label: string; onClick: () => void; tone?: "slate" | "blue" | "red";
}) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "rounded border px-1.5 py-0.5 text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        t === "blue" ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
          : t === "red" ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      )}>
      {label}
    </button>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th scope="col" className={cn("whitespace-nowrap px-2 py-1 text-left font-semibold text-slate-600", className)}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-2 py-1 align-top text-slate-700", className)}>{children}</td>;
}
function Table({ caption, head, children }: { caption: string; head: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-[11px]">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-slate-200 bg-slate-50"><tr>{head}</tr></thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

const sevTone = (s: string): "red" | "amber" | "slate" =>
  s === "Critical" || s === "High" ? "red" : s === "Medium" ? "amber" : "slate";

/* -------------------------------------------------- 2. remediation center -- */

export function RemediationCenterPanel({
  rows, summary, onOpen, onRequestClarification, onRequestEvidence, onAddEvidence, spotlight,
}: {
  rows: CognitiveReadinessRemediation[];
  summary: RemediationSummary;
  onOpen: (r: CognitiveReadinessRemediation) => void;
  onRequestClarification: (r: CognitiveReadinessRemediation) => void;
  onRequestEvidence: (r: CognitiveReadinessRemediation) => void;
  onAddEvidence: (r: CognitiveReadinessRemediation) => void;
  spotlight?: boolean;
}) {
  const [category, setCategory] = useState("All");
  const filtered = category === "All" ? rows : rows.filter((r) => r.category === category);

  return (
    <Panel id="panel-remediation" title="Readiness Remediation Center" spotlight={spotlight}
      subtitle="Resolve, govern, or explicitly carry forward the uncertainty required to begin Persona Impact Analysis"
      actions={
        <div className="flex flex-wrap items-center gap-1">
          {["All", ...Object.keys(summary.byCategory)].map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c}
              className={cn("rounded border px-1.5 py-0.5 text-[10px]", category === c ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600")}>
              {c}{c !== "All" && ` · ${summary.byCategory[c]}`}
            </button>
          ))}
        </div>
      }>
      <dl className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
        {[["Open Remediation Items", summary.open], ["Blocking", summary.blocking], ["High", summary.high], ["Medium", summary.medium], ["Low", summary.low]].map(([l, v]) => (
          <div key={String(l)} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
            <dt className="text-[10px] uppercase tracking-wide text-slate-500">{l}</dt>
            <dd className="text-[16px] font-bold text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>

      <Table caption="Open readiness remediation items"
        head={<>
          <Th>Remediation ID</Th><Th>Assessment</Th><Th>Work Item</Th><Th>Gap Type</Th><Th>Description</Th>
          <Th>Affected Dimension</Th><Th>Affected Personas</Th><Th>Severity</Th><Th>Blocking</Th>
          <Th>Owner</Th><Th>Due</Th><Th>Status</Th><Th>Actions</Th>
        </>}>
        {filtered.map((r) => (
          <tr key={r.id} className="hover:bg-slate-50">
            <Td><button type="button" className="font-medium text-blue-700 underline-offset-2 hover:underline" onClick={() => onOpen(r)}>{r.id}</button></Td>
            <Td>{r.assessment}</Td>
            <Td>{r.workItem}</Td>
            <Td><Pill label={r.gapType} tone="slate" /></Td>
            <Td className="max-w-[280px]">{r.description}</Td>
            <Td>{r.affectedDimension}</Td>
            <Td>{r.affectedPersonas.join(", ")}</Td>
            <Td><Pill label={r.severity} tone={sevTone(r.severity)} /></Td>
            <Td>{r.blocking ? <Pill label="Blocking" tone="red" /> : <span className="text-slate-500">No</span>}</Td>
            <Td>{r.owner}</Td>
            <Td>{r.due}</Td>
            <Td><Pill label={r.status} tone={tone(r.status)} /></Td>
            <Td>
              <div className="flex flex-wrap gap-1">
                <MiniBtn label="Open" onClick={() => onOpen(r)} tone="blue" />
                <MiniBtn label="Clarify" onClick={() => onRequestClarification(r)} />
                <MiniBtn label="Request Evidence" onClick={() => onRequestEvidence(r)} />
                <MiniBtn label="Add Evidence" onClick={() => onAddEvidence(r)} />
              </div>
            </Td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

/* ------------------------------------------------ 8. dependency validation -- */

export function DependencyReviewPanel({ state, onAction }: {
  state: OpsState;
  onAction: (dependency: string, action: string) => void;
}) {
  return (
    <Panel id="panel-dependency-review" title="Dependency Readiness Review"
      subtitle="Operational review. Changes recalculate dependency readiness, Persona readiness, and the handoff package">
      <Table caption="Dependency readiness review"
        head={<><Th>Dependency</Th><Th>Dependency Type</Th><Th>Owner</Th><Th>Relationship</Th><Th>Evidence</Th><Th>Freshness</Th><Th>Confidence</Th><Th>Criticality</Th><Th>Affected Personas</Th><Th>Status</Th><Th>Actions</Th></>}>
        {dependencyStates.map((d) => {
          const st = state.dependencies[d.dependency] ?? { status: d.status, confidence: d.confidence };
          return (
            <tr key={d.dependency} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-800">{d.dependency}</Td>
              <Td>{d.relationship === "Shared" ? "Shared Platform" : "Service"}</Td>
              <Td>{d.owner}</Td>
              <Td>{d.relationship}</Td>
              <Td>{d.evidenceCoverage}% coverage</Td>
              <Td>{d.freshness}</Td>
              <Td>{st.confidence}%</Td>
              <Td>{d.criticality}</Td>
              <Td>{d.affectedPersonas.join(", ")}</Td>
              <Td><Pill label={st.status} tone={tone(st.status)} /></Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {["Confirm Dependency", "Change Relationship", "Add Evidence", "Request Owner Confirmation", "Mark Nonmaterial", "Mark Unknown", "Escalate"].map((a) => (
                    <MiniBtn key={a} label={a} onClick={() => onAction(d.dependency, a)} />
                  ))}
                </div>
              </Td>
            </tr>
          );
        })}
      </Table>
    </Panel>
  );
}

/* --------------------------------------------- 9. persona scope validation -- */

export function PersonaScopeValidationPanel({ state, computation, onAction, onAddPersona }: {
  state: OpsState;
  computation: ReadinessComputation;
  onAction: (persona: string, action: string) => void;
  onAddPersona: () => void;
}) {
  const rows = useMemo(() => personaRowsFor(state, computation.personas), [state, computation.personas]);
  return (
    <Panel id="panel-persona-scope" title="Candidate Persona Readiness Review"
      subtitle="Readiness asks whether enough context exists to evaluate a team. It never states whether the team is positively or negatively impacted."
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onAddPersona}>Add Persona</Button>}>
      <Table caption="Candidate Persona readiness review"
        head={<><Th>Persona</Th><Th>Persona Version</Th><Th>Match Reason</Th><Th>Context Coverage</Th><Th>Conditions Available</Th><Th>Dependencies Available</Th><Th>Evidence Coverage</Th><Th>Readiness</Th><Th>Confidence</Th><Th>Status</Th><Th>Actions</Th></>}>
        {rows.map((p) => (
          <tr key={p.persona} className={cn("hover:bg-slate-50", !p.included && "opacity-60")}>
            <Td className="font-medium text-slate-800">{p.persona}{p.primary && <span className="ml-1 text-[9px] uppercase text-blue-700">primary</span>}</Td>
            <Td>{p.version}</Td>
            <Td className="max-w-[240px]">{p.matchReason}</Td>
            <Td>{p.contextCoverage}%</Td>
            <Td>{p.applicableConditions}</Td>
            <Td>{p.dependencyCoverage}%</Td>
            <Td>{p.evidenceCoverage}%</Td>
            <Td><Pill label={p.readiness} tone={tone(p.readiness)} /></Td>
            <Td>{p.confidence}%</Td>
            <Td><Pill label={p.included ? "Included" : "Excluded"} tone={p.included ? "green" : "slate"} /></Td>
            <Td>
              <div className="flex flex-wrap gap-1">
                <MiniBtn label={p.included ? "Exclude" : "Include"} onClick={() => onAction(p.persona, p.included ? "Exclude" : "Include")} tone="blue" />
                <MiniBtn label="Mark Primary" onClick={() => onAction(p.persona, "Mark Primary")} />
                <MiniBtn label="Request Persona Validation" onClick={() => onAction(p.persona, "Request Persona Validation")} />
                <MiniBtn label="Open Persona" onClick={() => onAction(p.persona, "Open Persona")} />
              </div>
            </Td>
          </tr>
        ))}
      </Table>
      <p className="mt-1 text-[10px] text-slate-500">
        Additional candidates available: {additionalPersonaCandidates.join(", ")}
      </p>
    </Panel>
  );
}

/* ------------------------------------------ 10. business condition validation -- */

export function ConditionValidationPanel({ state, onAction }: {
  state: OpsState;
  onAction: (condition: string, action: string) => void;
}) {
  return (
    <Panel id="panel-condition-validation" title="Business Condition Validation"
      subtitle="Conditions resolve, require policy binding, go stale, conflict, or are governed as not applicable">
      <Table caption="Business condition validation"
        head={<><Th>Condition</Th><Th>Type</Th><Th>Applicability</Th><Th>Authority</Th><Th>Policy Binding</Th><Th>Evidence</Th><Th>Freshness</Th><Th>Confidence</Th><Th>State</Th><Th>Actions</Th></>}>
        {conditionStates.map((c) => {
          const st = state.conditions[c.condition] ?? c.status;
          return (
            <tr key={c.condition} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-800">{c.condition}</Td>
              <Td>{c.type}</Td>
              <Td>{c.applicability}</Td>
              <Td>{c.authority}</Td>
              <Td>{state.policyBindings[
                c.condition === "Fraud Loss Materiality" ? "risk.fraud.materiality" : ""
              ] ?? c.policyBinding}</Td>
              <Td>{c.evidence}</Td>
              <Td>{c.freshness}</Td>
              <Td>{c.confidence}%</Td>
              <Td><Pill label={st} tone={tone(st)} /></Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {["Confirm Applicability", "Mark Not Applicable", "Bind Policy Variable", "Refresh Evidence", "Request Policy Review", "Open Condition"].map((a) => (
                    <MiniBtn key={a} label={a} onClick={() => onAction(c.condition, a)} />
                  ))}
                </div>
              </Td>
            </tr>
          );
        })}
      </Table>
      <p className="mt-1 text-[10px] text-slate-500">Possible states: {conditionValidationStates.join(" · ")}</p>
    </Panel>
  );
}

/* --------------------------------------------------- 12. assumption register -- */

export function AssumptionRegisterPanel({ state, onAction }: {
  state: OpsState;
  onAction: (id: string, action: string) => void;
}) {
  return (
    <Panel id="panel-assumption-register" title="Assumption Register"
      subtitle="Accepting an assumption for evaluation does not make it true. It is carried forward as an explicit uncertainty marker.">
      <Table caption="Assumption register"
        head={<><Th>Assumption</Th><Th>Category</Th><Th>Source</Th><Th>Confidence</Th><Th>Materiality</Th><Th>Affected Personas</Th><Th>Evidence</Th><Th>Validation State</Th><Th>Owner</Th><Th>Status</Th><Th>Actions</Th></>}>
        {assumptions.map((a) => {
          const st = state.assumptionStates[a.id] ?? a.validationState;
          const accepted = state.acceptedAssumptions.includes(a.id);
          return (
            <tr key={a.id} className="hover:bg-slate-50">
              <Td className="max-w-[260px] font-medium text-slate-800">{a.assumption}</Td>
              <Td>{a.category}</Td>
              <Td>{a.source}</Td>
              <Td>{a.confidence}</Td>
              <Td>{a.materiality}</Td>
              <Td>{a.affectedPersonas.join(", ")}</Td>
              <Td>{a.evidence}</Td>
              <Td><Pill label={st} tone={tone(st)} /></Td>
              <Td>{a.source}</Td>
              <Td>{accepted ? <Pill label="Uncertainty Marker" tone="amber" /> : <Pill label={st} tone={tone(st)} />}</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {["Accept for Evaluation", "Request Validation", "Add Evidence", "Convert to Constraint", "Convert to Open Question", "Mark Invalid"].map((x) => (
                    <MiniBtn key={x} label={x} onClick={() => onAction(a.id, x)} tone={x === "Accept for Evaluation" ? "blue" : "slate"} />
                  ))}
                </div>
              </Td>
            </tr>
          );
        })}
      </Table>
    </Panel>
  );
}

/* -------------------------------------------------- 14. constraint management -- */

export function ConstraintManagementPanel({ state, onAction }: {
  state: OpsState;
  onAction: (id: string, action: string) => void;
}) {
  return (
    <Panel id="panel-constraint-management" title="Readiness Constraints"
      subtitle={`Categories: ${constraintCategories.join(" · ")}`}>
      <Table caption="Readiness constraints"
        head={<><Th>Constraint</Th><Th>Type</Th><Th>Source</Th><Th>Authority</Th><Th>Applicability</Th><Th>Affected Scope</Th><Th>Affected Personas</Th><Th>Status</Th><Th>Actions</Th></>}>
        {constraints.map((c) => {
          const st = state.constraintStates[c.id] ?? c.status;
          return (
            <tr key={c.id} className="hover:bg-slate-50">
              <Td className="max-w-[260px] font-medium text-slate-800">{c.constraint}</Td>
              <Td>{c.type}</Td><Td>{c.source}</Td><Td>{c.authority}</Td><Td>{c.applicability}</Td>
              <Td>{c.affectedScope}</Td><Td>{c.affectedPersonas.join(", ")}</Td>
              <Td><Pill label={st} tone={tone(st)} /></Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {["Confirm", "Request Clarification", "Mark Not Applicable", "Open Evidence", "Open Policy"].map((a) => (
                    <MiniBtn key={a} label={a} onClick={() => onAction(c.id, a)} />
                  ))}
                </div>
              </Td>
            </tr>
          );
        })}
      </Table>
    </Panel>
  );
}

/* --------------------------------------------------- 15. ambiguity resolution -- */

export function AmbiguityResolutionPanel({ state, onAction }: {
  state: OpsState;
  onAction: (id: string, action: string) => void;
}) {
  return (
    <Panel id="panel-ambiguity-resolution" title="Ambiguity Resolution"
      subtitle="Ambiguity is never silently resolved. Bounded interpretations are carried downstream with their confidence.">
      <Table caption="Ambiguity resolution"
        head={<><Th>Source Text</Th><Th>Source</Th><Th>Why Ambiguous</Th><Th>Interpretations</Th><Th>Working Interpretation</Th><Th>Materiality</Th><Th>Confidence</Th><Th>Status</Th><Th>Actions</Th></>}>
        {ambiguities.map((a) => {
          const st = state.ambiguityStates[a.id] ?? { status: a.status, interpretation: "", confidence: "" };
          return (
            <tr key={a.id} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-800">“{a.text}”</Td>
              <Td>{a.source}</Td>
              <Td className="max-w-[200px]">{a.whyAmbiguous}</Td>
              <Td className="max-w-[220px]">{a.interpretations.join(" · ")}</Td>
              <Td className="max-w-[240px]">{st.interpretation || <span className="text-slate-400">Not bounded</span>}</Td>
              <Td>{a.materiality}</Td>
              <Td>{st.confidence || "—"}</Td>
              <Td><Pill label={st.status} tone={tone(st.status)} /></Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {["Clarify", "Accept Bounded Interpretation", "Mark Nonmaterial", "Open Source"].map((x) => (
                    <MiniBtn key={x} label={x} onClick={() => onAction(a.id, x)} tone={x === "Clarify" ? "blue" : "slate"} />
                  ))}
                </div>
              </Td>
            </tr>
          );
        })}
      </Table>
    </Panel>
  );
}

/* ------------------------------------------------ 16. contradiction workbench -- */

export function ContradictionWorkbenchPanel({ state, onResolve }: {
  state: OpsState;
  onResolve: (id: string) => void;
}) {
  return (
    <Panel id="panel-contradiction-workbench" title="Contradiction Resolution Workbench"
      subtitle="Original source records are always preserved. A resolution requires a reason.">
      <div className="space-y-2">
        {contradictions.map((c) => {
          const res = state.contradictionResolutions[c.id];
          return (
            <div key={c.id} className="rounded-lg border border-slate-200 p-2">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-slate-800">{c.id} · {c.conflictType}</span>
                <div className="flex items-center gap-1">
                  <Pill label={c.severity} tone={sevTone(c.severity)} />
                  <Pill label={res ? "Resolved" : c.status} tone={res ? "green" : "red"} />
                  <MiniBtn label="Resolve" onClick={() => onResolve(c.id)} tone="blue" />
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {[["Source A", c.statementA, "Design Document", "Current", "Checkout Engineering"],
                  ["Source B", c.statementB, "Rollout Plan", "Current", "Release Governance"]].map(([label, stmt, auth, fresh, owner]) => (
                  <div key={label} className="rounded border border-slate-200 bg-slate-50 p-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="text-[11.5px] font-medium text-slate-800">{stmt}</p>
                    <dl className="mt-1 space-y-0.5 text-[10.5px] text-slate-600">
                      <div className="flex justify-between"><dt>Authority</dt><dd>{auth}</dd></div>
                      <div className="flex justify-between"><dt>Freshness</dt><dd>{fresh}</dd></div>
                      <div className="flex justify-between"><dt>Owner</dt><dd>{owner}</dd></div>
                      <div className="flex justify-between"><dt>Evidence</dt><dd>Rollout evidence set</dd></div>
                    </dl>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-[10.5px] text-slate-600">
                Downstream impact: {c.affected.join(", ")}
              </p>
              {res && (
                <p className="mt-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10.5px] text-emerald-800">
                  Resolution: {res.choice}{res.value ? ` = ${res.value}` : ""} · {res.reason}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* -------------------------------------------------- 17. gate operations -- */

export function GateOperationsPanel({ gates, state, onAction }: {
  gates: CognitiveReadinessGate[];
  state: OpsState;
  onAction: (gateId: string, action: string) => void;
}) {
  return (
    <Panel id="panel-gate-operations" title="Readiness Gate Operations"
      subtitle="A gate can never be manually set to Passed. It resolves through remediation or a governed override.">
      <div className="grid gap-2 lg:grid-cols-2">
        {gates.map((g) => {
          const blocking = state.remediations.filter((r) => r.affectedGate === g.name && r.blocking && r.status !== "Resolved");
          return (
            <div key={g.id} className="rounded-lg border border-slate-200 p-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[12px] font-semibold text-slate-800">{g.name}</h3>
                <Pill label={g.status} tone={tone(g.status)} />
              </div>
              <p className="mt-0.5 text-[10.5px] text-slate-600">{g.note}</p>
              <dl className="mt-1 grid grid-cols-2 gap-1 text-[10.5px] text-slate-600">
                <div><dt className="text-slate-500">Required Criteria</dt><dd>{g.requires.length}</dd></div>
                <div><dt className="text-slate-500">Passed Criteria</dt><dd>{g.status === "Failed" ? 1 : g.requires.length - (g.status === "Passed" ? 0 : 1)}</dd></div>
                <div><dt className="text-slate-500">Warnings</dt><dd>{g.status === "Passed with Warning" ? 1 : 0}</dd></div>
                <div><dt className="text-slate-500">Failures</dt><dd>{g.status === "Failed" ? 1 : 0}</dd></div>
                <div><dt className="text-slate-500">Accepted Uncertainty</dt><dd>{state.acceptedUncertainty.length}</dd></div>
                <div><dt className="text-slate-500">Blocking Items</dt><dd>{blocking.length}</dd></div>
                <div className="col-span-2"><dt className="text-slate-500">Owner</dt><dd>Cognitive Fabric Governance</dd></div>
              </dl>
              <div className="mt-1 flex flex-wrap gap-1">
                {["Open Findings", "Request Remediation", "Accept Nonblocking Uncertainty", "Escalate"].map((a) => (
                  <MiniBtn key={a} label={a} onClick={() => onAction(g.id, a)} tone={a === "Escalate" ? "red" : "slate"} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------- 18. review queue -- */

export function ReviewQueuePanel({ rows, onOpen, onAction }: {
  rows: CognitiveReadinessReview[];
  onOpen: (r: CognitiveReadinessReview) => void;
  onAction: (r: CognitiveReadinessReview, action: string) => void;
}) {
  const open = rows.filter((r) => r.status === "Open");
  const counts = {
    open: open.length,
    critical: open.filter((r) => r.severity === "Critical").length,
    high: open.filter((r) => r.severity === "High").length,
    medium: open.filter((r) => r.severity === "Medium").length,
  };
  return (
    <Panel id="panel-review-queue" title="Cognitive Readiness Review Queue"
      subtitle="Human review of readiness, evidence, dependencies, policy, exceptions, and overrides">
      <dl className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {[["Open Reviews", counts.open], ["Critical", counts.critical], ["High", counts.high], ["Medium", counts.medium]].map(([l, v]) => (
          <div key={String(l)} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
            <dt className="text-[10px] uppercase tracking-wide text-slate-500">{l}</dt>
            <dd className="text-[16px] font-bold text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>
      <Table caption="Cognitive readiness review queue"
        head={<><Th>Review ID</Th><Th>Assessment</Th><Th>Work Item</Th><Th>Review Type</Th><Th>Issue</Th><Th>Severity</Th><Th>Reviewer</Th><Th>Due</Th><Th>Status</Th><Th>Actions</Th></>}>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-slate-50">
            <Td><button type="button" className="font-medium text-blue-700 hover:underline" onClick={() => onOpen(r)}>{r.id}</button></Td>
            <Td>{r.assessment}</Td><Td>{r.workItem}</Td><Td>{r.reviewType}</Td>
            <Td className="max-w-[240px]">{r.issue}</Td>
            <Td><Pill label={r.severity} tone={sevTone(r.severity)} /></Td>
            <Td>{r.reviewer}</Td><Td>{r.due}</Td>
            <Td><Pill label={r.status} tone={tone(r.status)} /></Td>
            <Td>
              <div className="flex flex-wrap gap-1">
                <MiniBtn label="Open Review" onClick={() => onOpen(r)} tone="blue" />
                {["Assign", "Request Evidence", "Confirm Assessment", "Escalate"].map((a) => (
                  <MiniBtn key={a} label={a} onClick={() => onAction(r, a)} tone={a === "Escalate" ? "red" : "slate"} />
                ))}
              </div>
            </Td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

/* --------------------------------------------------- 20/21 exceptions + overrides -- */

export function ExceptionsPanel({ rows, onRequest, onApprove }: {
  rows: CognitiveReadinessException[];
  onRequest: () => void;
  onApprove: (id: string) => void;
}) {
  return (
    <Panel id="panel-exceptions" title="Readiness Exceptions"
      subtitle="A governed acceptance to proceed with restrictions. Every exception expires."
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onRequest}>Request Exception</Button>}>
      {rows.length === 0 ? (
        <p className="rounded border border-dashed border-slate-200 px-2 py-3 text-center text-[11px] text-slate-500">
          No readiness exceptions requested. Required context is expected to be completed before impact analysis.
        </p>
      ) : (
        <Table caption="Readiness exceptions"
          head={<><Th>Exception</Th><Th>Assessment</Th><Th>Blocking Item</Th><Th>Reason</Th><Th>Affected Personas</Th><Th>Compensating Controls</Th><Th>Owner</Th><Th>Approver</Th><Th>Expiration</Th><Th>Downstream Warning</Th><Th>Status</Th><Th>Actions</Th></>}>
          {rows.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-800">{e.id}</Td>
              <Td>{e.assessment}</Td><Td className="max-w-[200px]">{e.blockingItem}</Td>
              <Td className="max-w-[220px]">{e.reason}</Td><Td>{e.affectedPersonas.join(", ")}</Td>
              <Td className="max-w-[200px]">{e.compensatingControls}</Td>
              <Td>{e.owner}</Td><Td>{e.approver}</Td><Td>{e.expiration}</Td>
              <Td className="max-w-[200px]">{e.downstreamWarning}</Td>
              <Td><Pill label={e.status} tone={tone(e.status)} /></Td>
              <Td>{e.status === "Requested" && <MiniBtn label="Approve" onClick={() => onApprove(e.id)} tone="blue" />}</Td>
            </tr>
          ))}
        </Table>
      )}
    </Panel>
  );
}

export function OverridesPanel({ rows, onRequest, onApprove }: {
  rows: CognitiveReadinessOverride[];
  onRequest: () => void;
  onApprove: (id: string) => void;
}) {
  return (
    <Panel id="panel-overrides" title="Readiness Overrides"
      subtitle="Higher governance than an exception. Work identity, proposed state, context integrity, and access validation can never be overridden."
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onRequest}>Request Override</Button>}>
      {rows.length === 0 ? (
        <p className="rounded border border-dashed border-slate-200 px-2 py-3 text-center text-[11px] text-slate-500">
          No readiness overrides requested.
        </p>
      ) : (
        <Table caption="Readiness overrides"
          head={<><Th>Override</Th><Th>Current State</Th><Th>Proposed State</Th><Th>Blocking Findings</Th><Th>Business Reason</Th><Th>Decision Owner</Th><Th>Risk Owner</Th><Th>Expiration</Th><Th>Approver</Th><Th>Status</Th><Th>Actions</Th></>}>
          {rows.map((o) => (
            <tr key={o.id} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-800">{o.id}</Td>
              <Td>{o.currentState}</Td><Td>{o.proposedState}</Td>
              <Td className="max-w-[220px]">{o.blockingFindings.join("; ")}</Td>
              <Td className="max-w-[220px]">{o.businessReason}</Td>
              <Td>{o.decisionOwner}</Td><Td>{o.riskOwner}</Td><Td>{o.expiration}</Td><Td>{o.approver}</Td>
              <Td><Pill label={o.status} tone={o.status === "Blocked" ? "red" : tone(o.status)} /></Td>
              <Td>{o.status === "Requested" && <MiniBtn label="Approve" onClick={() => onApprove(o.id)} tone="blue" />}</Td>
            </tr>
          ))}
        </Table>
      )}
    </Panel>
  );
}

/* ---------------------------------------------------- 23/24 versions -- */

export function VersionHistoryPanel({ rows, onOpen, onCompare, onExport }: {
  rows: CognitiveReadinessAssessmentVersion[];
  onOpen: (v: CognitiveReadinessAssessmentVersion) => void;
  onCompare: () => void;
  onExport: (v: CognitiveReadinessAssessmentVersion) => void;
}) {
  return (
    <Panel id="panel-version-history" title="Cognitive Readiness Version History"
      subtitle="Assessment history is immutable. Reassessment always creates a new version."
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onCompare}>Compare Versions</Button>}>
      <Table caption="Cognitive readiness version history"
        head={<><Th>Version</Th><Th>Label</Th><Th>Timestamp</Th><Th>Intake Package</Th><Th>Personas</Th><Th>Conditions</Th><Th>Evidence Coverage</Th><Th>Dependency Coverage</Th><Th>Readiness Score</Th><Th>Readiness State</Th><Th>Open Findings</Th><Th>Created By</Th><Th>Reason</Th><Th>Actions</Th></>}>
        {rows.map((v) => (
          <tr key={v.id} className="hover:bg-slate-50">
            <Td className="font-medium text-slate-800">{v.id}</Td>
            <Td>{v.label}</Td><Td>{v.timestamp}</Td><Td>{v.intakePackageVersion}</Td>
            <Td>{v.personaScope.length}</Td><Td>{v.conditionSet.length}</Td>
            <Td>{v.evidenceCoverage}%</Td><Td>{v.dependencyCoverage}%</Td>
            <Td className="font-semibold">{v.score}</Td>
            <Td><Pill label={v.state} tone={tone(v.state)} /></Td>
            <Td>{v.openFindings}</Td><Td>{v.createdBy}</Td>
            <Td className="max-w-[220px]">{v.reason}</Td>
            <Td>
              <div className="flex gap-1">
                <MiniBtn label="Open" onClick={() => onOpen(v)} tone="blue" />
                <MiniBtn label="Compare" onClick={onCompare} />
                <MiniBtn label="Export" onClick={() => onExport(v)} />
              </div>
            </Td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

export function VersionComparisonPanel({ versions }: { versions: CognitiveReadinessAssessmentVersion[] }) {
  const [a, setA] = useState(versions[0]?.id ?? "");
  const [b, setB] = useState(versions[versions.length - 1]?.id ?? "");
  const va = versions.find((v) => v.id === a) ?? versions[0];
  const vb = versions.find((v) => v.id === b) ?? versions[versions.length - 1];
  const rows = useMemo(() => (va && vb ? compareVersions(va, vb) : []), [va, vb]);
  const kindTone = (k: string) => k === "Resolved" || k === "Added" ? "green" : k === "New Gap" || k === "Removed" ? "red" : k === "Changed" ? "amber" : "slate";

  return (
    <Panel id="panel-version-comparison" title="Assessment Version Comparison"
      subtitle="Added · Removed · Changed · Resolved · New Gap · Unchanged"
      actions={
        <div className="flex items-center gap-1">
          <label className="sr-only" htmlFor="cmp-a">Baseline version</label>
          <select id="cmp-a" value={a} onChange={(e) => setA(e.target.value)} className="h-7 rounded border border-slate-200 px-1 text-[11px]">
            {versions.map((v) => <option key={v.id} value={v.id}>{v.id}</option>)}
          </select>
          <span className="text-[11px] text-slate-500">vs</span>
          <label className="sr-only" htmlFor="cmp-b">Comparison version</label>
          <select id="cmp-b" value={b} onChange={(e) => setB(e.target.value)} className="h-7 rounded border border-slate-200 px-1 text-[11px]">
            {versions.map((v) => <option key={v.id} value={v.id}>{v.id}</option>)}
          </select>
        </div>
      }>
      <Table caption="Assessment version comparison"
        head={<><Th>Area</Th><Th>{va?.id}</Th><Th>{vb?.id}</Th><Th>Change</Th></>}>
        {rows.map((r, i) => (
          <tr key={`${r.area}-${i}`} className="hover:bg-slate-50">
            <Td className="font-medium text-slate-800">{r.area}</Td>
            <Td>{r.from}</Td><Td>{r.to}</Td>
            <Td><Pill label={r.kind} tone={kindTone(r.kind) as "green"} /></Td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

/* ---------------------------------------- 25/26/27/28 handoff + warnings -- */

export function HandoffPackagePanel({ pkg, readiness, warnings, onProceed, onExport }: {
  pkg: CognitiveReadinessHandoffPackage;
  readiness: HandoffReadiness;
  warnings: DownstreamWarning[];
  onProceed: () => void;
  onExport: () => void;
}) {
  const section = (title: string, items: (string | undefined)[]) => (
    <div key={title} className="rounded border border-slate-200 p-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      {items.filter(Boolean).length === 0
        ? <p className="text-[11px] text-slate-400">None</p>
        : <ul className="mt-0.5 space-y-0.5 text-[11px] text-slate-700">
          {items.filter(Boolean).map((i, n) => <li key={`${title}-${n}`}>{i}</li>)}
        </ul>}
    </div>
  );

  return (
    <Panel id="panel-handoff-package" title="Persona Impact Handoff Package"
      subtitle="Ready for Persona Impact Analysis is not the same as Work Approved. This package carries context and uncertainty, not a decision."
      actions={
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onExport}>Export Package</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={onProceed} disabled={!readiness.enabled}>
            Proceed to Persona Impact Analysis
          </Button>
        </div>
      }>
      <div id="panel-handoff-readiness" className="mb-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-semibold text-slate-800">Persona Impact Handoff Readiness</p>
          <div className="flex items-center gap-1">
            <Pill label={readiness.allGatesPassed ? "All Required Gates Passed" : "Gates Not Passed"} tone={readiness.allGatesPassed ? "green" : "red"} />
            <Pill label={`Warnings ${readiness.warnings}`} tone="amber" />
            <Pill label={readiness.handoffState} tone={readiness.enabled ? "blue" : "red"} />
          </div>
        </div>
        <dl className="mt-1.5 grid grid-cols-2 gap-1.5 md:grid-cols-3 xl:grid-cols-5">
          {readiness.areas.map((a) => (
            <div key={a.area} className="rounded border border-slate-200 bg-white px-1.5 py-1">
              <dt className="text-[10px] text-slate-500">{a.area}</dt>
              <dd className="text-[13px] font-bold text-slate-900">{a.value}%</dd>
            </div>
          ))}
        </dl>
        {readiness.blockedReason && (
          <p className="mt-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-800">{readiness.blockedReason}</p>
        )}
      </div>

      <div id="panel-downstream-warnings" className="mb-2 rounded-lg border border-amber-200 bg-amber-50 p-2">
        <p className="text-[12px] font-semibold text-amber-900">Downstream Uncertainty Warnings</p>
        {warnings.length === 0
          ? <p className="text-[11px] text-amber-800">No Persona specific downstream warnings.</p>
          : <ul className="mt-0.5 space-y-0.5 text-[11px] text-amber-900">
            {warnings.map((w) => <li key={w.persona}><strong>{w.persona}</strong> · {w.reason} · marker: {w.marker}</li>)}
          </ul>}
      </div>

      <div className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-3">
        {section("Work Item", [pkg.workItem, `Intake Package ${pkg.intakePackageVersion}`, `Assessment ${pkg.assessmentVersion}`])}
        {section("Readiness", [pkg.readinessState, `Score ${pkg.readinessScore}`, `Confidence ${pkg.readinessConfidence}%`])}
        {section("Intent & State", [pkg.intent, `Current: ${pkg.currentState}`, `Proposed: ${pkg.proposedState}`])}
        {section("Scope, Systems, Services", [pkg.scope, ...pkg.systems, ...pkg.services])}
        {section("Dependencies", pkg.dependencies)}
        {section("Candidate Personas", pkg.candidatePersonas)}
        {section("Persona Readiness", pkg.personaReadiness.map((p) => `${p.persona} · ${p.readiness}`))}
        {section("Applicable Business Conditions", pkg.applicableConditions)}
        {section("Policy Bindings", pkg.policyBindings.map((p) => `${p.variable} = ${p.value}`))}
        {section("Evidence", pkg.evidence)}
        {section("Evidence Gaps", pkg.evidenceGaps)}
        {section("Assumptions", pkg.assumptions)}
        {section("Accepted Assumptions", pkg.acceptedAssumptions)}
        {section("Constraints", pkg.constraints)}
        {section("Ambiguities", pkg.ambiguities)}
        {section("Accepted Interpretations", pkg.acceptedInterpretations)}
        {section("Contradictions", pkg.contradictions)}
        {section("Resolved Contradictions", pkg.resolvedContradictions)}
        {section("Exceptions", pkg.exceptions)}
        {section("Rollout & Rollback", [pkg.rollout, pkg.rollback])}
        {section("Expected Outcomes", [pkg.expectedOutcomes])}
        {section("Observation Requirements", pkg.observationRequirements)}
        {section("Uncertainty Markers", pkg.uncertaintyMarkers)}
        {section("Critical Downstream Warnings", pkg.criticalDownstreamWarnings)}
        {section("Historical Context Version", [pkg.historicalContextVersion])}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------- 29. readiness quality -- */

export function QualityOpsPanel({ model }: { model: QualityModel }) {
  return (
    <Panel id="panel-quality-ops" title="Readiness Quality"
      subtitle="Historical Context Rewrite Violations above zero block the Persona Impact Handoff">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-[20px] font-bold text-slate-900">{model.overall} / 100</span>
        <Pill label={`Historical Context Integrity ${model.historicalIntegrity}`} tone={model.violations > 0 ? "red" : "green"} />
        <Pill label={`Historical Context Rewrite Violations ${model.violations}`} tone={model.violations > 0 ? "red" : "green"} />
        {model.blocked && <Pill label="Readiness Blocked · Context Integrity Critical" tone="red" />}
      </div>
      <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
        {model.dimensions.map((d) => (
          <li key={d.name} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1 text-[11px]">
            <span className="text-slate-600">{d.name}</span>
            <span className="font-semibold text-slate-900">{d.score}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ----------------------------------------------------- 31/32 activity + alerts -- */

export function ActivityPanel({ rows }: { rows: CognitiveReadinessActivity[] }) {
  return (
    <Panel id="panel-activity" title="Recent Cognitive Readiness Activity"
      subtitle="Every remediation, clarification, evidence change, governance action and routing decision is recorded">
      <ol className="space-y-1">
        {rows.map((a) => (
          <li key={a.id} className="flex items-start gap-2 rounded border border-slate-200 px-2 py-1 text-[11px]">
            <span className="w-16 shrink-0 font-mono text-[10px] text-slate-500">{a.time}</span>
            <Pill label={a.category} tone="slate" />
            <span className="text-slate-700">{a.entry}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function NotificationsPanel({ rows, onRead, onReadAll, onAcknowledge, onAssign, onOpen }: {
  rows: CognitiveReadinessNotification[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  onAcknowledge: (id: string) => void;
  onAssign: (id: string) => void;
  onOpen: (n: CognitiveReadinessNotification) => void;
}) {
  const [filter, setFilter] = useState("All");
  const cats = ["All", ...Array.from(new Set(rows.map((r) => r.category)))];
  const shown = filter === "All" ? rows : rows.filter((r) => r.category === filter);
  const unread = rows.filter((r) => !r.read).length;

  return (
    <Panel id="panel-notifications" title="Notifications" subtitle={`${unread} unread`}
      actions={
        <div className="flex items-center gap-1">
          <label className="sr-only" htmlFor="ntf-filter">Filter notifications</label>
          <select id="ntf-filter" value={filter} onChange={(e) => setFilter(e.target.value)}
            className="h-7 rounded border border-slate-200 px-1 text-[11px]">
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onReadAll}>Mark All Read</Button>
        </div>
      }>
      <ul className="space-y-1">
        {shown.map((n) => (
          <li key={n.id} className={cn("rounded border px-2 py-1", n.read ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50")}>
            <div className="flex flex-wrap items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <Pill label={n.category} tone="slate" />
                <Pill label={n.severity} tone={sevTone(n.severity)} />
                <span className="text-[11.5px] font-medium text-slate-800">{n.title}</span>
                {!n.read && <span className="text-[9px] font-semibold uppercase text-blue-700">unread</span>}
                {n.acknowledged && <span className="text-[9px] font-semibold uppercase text-emerald-700">acknowledged</span>}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] text-slate-500">{n.time}</span>
                <MiniBtn label="Open" onClick={() => onOpen(n)} tone="blue" />
                <MiniBtn label="Mark Read" onClick={() => onRead(n.id)} />
                <MiniBtn label="Assign" onClick={() => onAssign(n.id)} />
                <MiniBtn label="Acknowledge" onClick={() => onAcknowledge(n.id)} />
              </div>
            </div>
            <p className="text-[10.5px] text-slate-600">{n.detail}{n.assignee ? ` · assigned to ${n.assignee}` : ""}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* --------------------------------------------------------- policy panel -- */

export function PolicyBindingPanel({ state, onResolve }: {
  state: OpsState;
  onResolve: (variable: string) => void;
}) {
  return (
    <Panel id="panel-policy-binding" title="Policy Variable Bindings"
      subtitle="Values come from authoritative policy records. Nothing is hardcoded at the assessment level.">
      <Table caption="Policy variable bindings"
        head={<><Th>Policy Variable</Th><Th>Current Value</Th><Th>Unit</Th><Th>Authority</Th><Th>Effective Date</Th><Th>Owner</Th><Th>Version</Th><Th>Applicable Conditions</Th><Th>Affected Personas</Th><Th>Binding</Th><Th>Actions</Th></>}>
        {policyVariables.map((p) => (
          <tr key={p.variable} className="hover:bg-slate-50">
            <Td className="font-mono text-[10.5px] font-medium text-slate-800">{p.variable}</Td>
            <Td>{p.currentValue}</Td><Td>{p.unit}</Td><Td>{p.authority}</Td><Td>{p.effectiveDate}</Td>
            <Td>{p.owner}</Td><Td>{p.version}</Td>
            <Td>{p.applicableConditions.join(", ")}</Td><Td>{p.affectedPersonas.join(", ")}</Td>
            <Td>{state.policyBindings[p.variable]
              ? <Pill label={`Bound ${state.policyBindings[p.variable]}`} tone="green" />
              : <Pill label="Unbound" tone="amber" />}</Td>
            <Td><MiniBtn label="Resolve Policy Variable" onClick={() => onResolve(p.variable)} tone="blue" /></Td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}
