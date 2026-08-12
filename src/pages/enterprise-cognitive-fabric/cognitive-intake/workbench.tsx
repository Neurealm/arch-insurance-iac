/**
 * Cognitive Intake Workbench — the signature four-region synchronized workspace.
 *
 * Region 1: preserved original incoming work
 * Region 2: structured change decomposition (locally editable)
 * Region 3: retrieved enterprise context (include / exclude)
 * Region 4: assembled Intake Package
 */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pill, Row } from "../persona-studio/primitives";
import { Panel } from "../cognitive-memory/panels";
import { intakeTone } from "./panels";
import {
  changeAssumptions, changeCharacteristics, originalSubmission, proposalAnchors, riskSignals,
  type CognitiveIntake, type CognitiveIntakeChangeElement, type CognitiveIntakeContextMatch,
  type CognitiveIntakeEvidence, type CognitiveIntakePersonaCandidate,
} from "./data";

export interface WorkbenchState {
  intakeId: string;
  trafficExposure: number;
  deploymentTiming: "Standard window" | "Quarter end window";
  currentState: string;
  proposedState: string;
  intent: string;
  activeAnchor: string | null;
  activeElementId: string | null;
  activeContextId: string | null;
  addedEvidenceIds: string[];
}

export const initialWorkbenchState: WorkbenchState = {
  intakeId: "INT 7001",
  trafficExposure: 5,
  deploymentTiming: "Standard window",
  currentState: "Two automated retries",
  proposedState: "Three automated retries",
  intent: "Improve Checkout Completion",
  activeAnchor: null,
  activeElementId: null,
  activeContextId: null,
  addedEvidenceIds: [],
};

/** Context activation rules driven by the locally edited decomposition. */
export const isContextActive = (c: CognitiveIntakeContextMatch, s: WorkbenchState) => {
  if (c.activation === "traffic-over-10") return s.trafficExposure > 10;
  if (c.activation === "quarter-end") return s.deploymentTiming === "Quarter end window";
  return true;
};

export interface PackageResult {
  contextConfidence: number;
  evidenceCoverage: number;
  openQuestionsResolved: number;
  entityResolution: number;
  conditionsIdentified: number;
  governanceRequirements: string[];
  openQuestions: string[];
  missingEvidence: string[];
  includedConditions: CognitiveIntakeContextMatch[];
  includedPersonas: CognitiveIntakePersonaCandidate[];
}

export function computePackage(
  state: WorkbenchState,
  context: CognitiveIntakeContextMatch[],
  personas: CognitiveIntakePersonaCandidate[],
  evidence: CognitiveIntakeEvidence[],
): PackageResult {
  const active = context.filter((c) => isContextActive(c, state));
  const included = active.filter((c) => c.included);
  const contextConfidence = included.length
    ? Math.round(included.reduce((a, c) => a + c.confidence, 0) / included.length)
    : 0;

  const requiredEvidence = evidence.filter((e) => e.required === "Required");
  const satisfied = requiredEvidence.filter((e) => e.provided || state.addedEvidenceIds.includes(e.id));
  const evidenceCoverage = requiredEvidence.length
    ? Math.round((satisfied.length / requiredEvidence.length) * 100)
    : 100;

  const governanceRequirements: string[] = ["Progressive rollout required for customer facing payment behavior"];
  const openQuestions: string[] = [
    "What duplicate transaction threshold triggers rollback?",
  ];
  if (state.trafficExposure > 10) {
    governanceRequirements.push("Payments Reliability and Fraud Engineering approval required above 10 percent traffic");
  } else {
    openQuestions.unshift("Will rollout exceed 10% traffic?");
  }
  if (state.deploymentTiming === "Quarter end window") {
    governanceRequirements.push("Release Governance exception required for quarter end deployment");
  } else {
    openQuestions.push("Will deployment occur during quarter end restricted period?");
  }

  const missingEvidence = requiredEvidence
    .filter((e) => !e.provided && !state.addedEvidenceIds.includes(e.id))
    .map((e) => e.name);

  const answered = 3 - openQuestions.length;
  const openQuestionsResolved = Math.round((answered / 3) * 100);

  return {
    contextConfidence,
    evidenceCoverage,
    openQuestionsResolved: Math.max(openQuestionsResolved, 0),
    entityResolution: 92,
    conditionsIdentified: 94,
    governanceRequirements,
    openQuestions,
    missingEvidence,
    includedConditions: included.filter((c) => c.memoryType === "Business Condition"),
    includedPersonas: personas.filter((p) => p.selectionState !== "Excluded"),
  };
}

/* ---------------------------------------------------------------- workbench */

export function IntakeWorkbench({
  intake, state, onState, context, personas, evidence, elements, result,
  onToggleContext, onTogglePersona, onOpenRecord, onSaveDraft, onBuildPackage, onAddEvidence,
}: {
  intake: CognitiveIntake;
  state: WorkbenchState;
  onState: (s: WorkbenchState) => void;
  context: CognitiveIntakeContextMatch[];
  personas: CognitiveIntakePersonaCandidate[];
  evidence: CognitiveIntakeEvidence[];
  elements: CognitiveIntakeChangeElement[];
  result: PackageResult;
  onToggleContext: (c: CognitiveIntakeContextMatch) => void;
  onTogglePersona: (p: CognitiveIntakePersonaCandidate) => void;
  onOpenRecord: (id: string, type: string) => void;
  onSaveDraft: () => void;
  onBuildPackage: () => void;
  onAddEvidence: (e: CognitiveIntakeEvidence) => void;
}) {
  const [mobileTab, setMobileTab] = useState<"original" | "change" | "context" | "package">("original");
  const set = (patch: Partial<WorkbenchState>) => onState({ ...state, ...patch });

  const activeElements = useMemo(() => {
    if (!state.activeAnchor) return new Set<string>();
    const anchor = proposalAnchors.find((a) => a.id === state.activeAnchor);
    return new Set(anchor?.elementIds ?? []);
  }, [state.activeAnchor]);

  const highlightedContext = useMemo(() => {
    if (!state.activeElementId) return new Set<string>();
    const el = elements.find((e) => e.id === state.activeElementId);
    return new Set(el?.contextIds ?? []);
  }, [state.activeElementId, elements]);

  const highlightedSections = useMemo(() => {
    if (state.activeContextId) {
      const c = context.find((x) => x.id === state.activeContextId);
      return new Set(c?.packageSections ?? []);
    }
    if (state.activeElementId) {
      const e = elements.find((x) => x.id === state.activeElementId);
      return new Set(e?.packageSections ?? []);
    }
    return new Set<string>();
  }, [state.activeContextId, state.activeElementId, context, elements]);

  const visibleContext = context.filter((c) => isContextActive(c, state));
  const missingEvidenceItems = evidence.filter((e) => e.required === "Required" && !e.provided && !state.addedEvidenceIds.includes(e.id));

  const regionClass = "rounded-lg border border-slate-200 bg-white p-2 overflow-y-auto max-h-[620px]";

  /* --------------------------------------------------------- region markup */

  const region1 = (
    <div className={regionClass} aria-label="Original incoming work">
      <RegionHeader title="Original Incoming Work" note="Preserved exactly as submitted" />
      <dl className="mt-1 rounded border border-slate-200 bg-slate-50 p-2">
        <Row label="Submission ID" value={originalSubmission.submissionId} />
        <Row label="Source" value={`${originalSubmission.source} · ${originalSubmission.sourceRecordId}`} />
        <Row label="Timestamp" value={originalSubmission.timestamp} />
        <Row label="Owner" value={originalSubmission.owner} />
        <Row label="Version" value={originalSubmission.version} />
        <Row label="Access Classification" value={originalSubmission.accessClassification} />
        <Row label="Content hash" value={<span className="font-mono text-[10px]">{originalSubmission.contentHash}</span>} />
      </dl>

      <div className="mt-2 space-y-1.5">
        <p className="text-[12.5px] font-semibold text-slate-900">{originalSubmission.title}</p>
        <p className="text-[11px] text-slate-500">
          {originalSubmission.submittingTeam} · {originalSubmission.workType} · Priority {originalSubmission.priority}
        </p>
        {proposalAnchors.map((a) => (
          <button key={a.id} type="button"
            onClick={() => set({ activeAnchor: a.id, activeElementId: a.elementIds[0] ?? null, activeContextId: null })}
            aria-pressed={state.activeAnchor === a.id}
            className={cn("w-full rounded border p-1.5 text-left text-[11.5px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              state.activeAnchor === a.id ? "border-blue-400 bg-blue-50 text-slate-900" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300")}>
            <span className="block text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">{a.label}</span>
            {a.text}
          </button>
        ))}
      </div>

      <ListBlock title="Expected benefit" items={[originalSubmission.expectedBenefit, `Target: ${originalSubmission.target}`]} />
      <ListBlock title="Proposed scope" items={originalSubmission.proposedScope} />
      <ListBlock title="Planned rollout" items={originalSubmission.plannedRollout} />
      <ListBlock title="Submitted evidence" items={originalSubmission.submittedEvidence} />
      <ListBlock title="Known dependencies" items={originalSubmission.knownDependencies} />
      <ListBlock title="Incomplete information" items={originalSubmission.incompleteInformation} tone="amber" />
      <ListBlock title="Attachments" items={originalSubmission.attachments} />
    </div>
  );

  const region2 = (
    <div className={regionClass} aria-label="Proposed change decomposition">
      <RegionHeader title="Proposed Change Decomposition" note="Structured change elements — editable locally" />

      <div className="mt-1 grid gap-1.5 sm:grid-cols-2">
        <label className="flex flex-col gap-0.5">
          <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Intent</span>
          <input value={state.intent} onChange={(e) => set({ intent: e.target.value })}
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px] focus:border-blue-400 focus:outline-none" />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Change Object</span>
          <input readOnly value="Checkout Retry Policy"
            className="h-7 rounded border border-slate-200 bg-slate-50 px-1.5 text-[11px]" />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Current State</span>
          <input value={state.currentState} onChange={(e) => set({ currentState: e.target.value })}
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px] focus:border-blue-400 focus:outline-none" />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Proposed State</span>
          <input value={state.proposedState} onChange={(e) => set({ proposedState: e.target.value })}
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px] focus:border-blue-400 focus:outline-none" />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Traffic Exposure</span>
          <div className="flex items-center gap-1.5">
            <input type="range" min={1} max={100} step={1} value={state.trafficExposure}
              aria-label="Traffic exposure percent"
              onChange={(e) => set({ trafficExposure: Number(e.target.value), activeElementId: "CE 09", activeContextId: null })}
              className="h-7 w-full" />
            <span className={cn("w-12 shrink-0 rounded border px-1 text-center text-[11px] font-semibold",
              state.trafficExposure > 10 ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-700")}>
              {state.trafficExposure}%
            </span>
          </div>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Deployment Timing</span>
          <select value={state.deploymentTiming}
            onChange={(e) => set({ deploymentTiming: e.target.value as WorkbenchState["deploymentTiming"], activeElementId: "CE 10", activeContextId: null })}
            className={cn("h-7 rounded border px-1.5 text-[11px] focus:border-blue-400 focus:outline-none",
              state.deploymentTiming === "Quarter end window" ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white")}>
            <option>Standard window</option>
            <option>Quarter end window</option>
          </select>
        </label>
      </div>

      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Change elements</p>
      <div className="mt-1 space-y-1">
        {elements.map((el) => (
          <button key={el.id} type="button"
            onClick={() => set({ activeElementId: el.id, activeContextId: null })}
            aria-pressed={state.activeElementId === el.id}
            className={cn("w-full rounded border p-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              state.activeElementId === el.id ? "border-blue-400 bg-blue-50"
                : activeElements.has(el.id) ? "border-blue-200 bg-blue-50/50" : "border-slate-200 bg-white hover:border-blue-300")}>
            <div className="flex items-start justify-between gap-1">
              <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">{el.elementType}</span>
              <Pill label={el.status} tone={intakeTone(el.status)} />
            </div>
            <p className="text-[11.5px] font-medium text-slate-900">{el.subjectName}</p>
            <p className="text-[10.5px] text-slate-600">
              {el.id === "CE 09" ? `0 percent → ${state.trafficExposure} percent`
                : el.id === "CE 10" ? `${el.currentValue} → ${state.deploymentTiming}`
                  : el.id === "CE 02" ? state.currentState
                    : el.id === "CE 03" ? `${state.currentState} → ${state.proposedState}`
                      : `${el.currentValue} → ${el.proposedValue}`}
            </p>
            <p className="text-[10px] text-slate-400">Confidence {el.confidence}% · {el.scope}</p>
          </button>
        ))}
      </div>

      <ListBlock title="Characteristics" items={changeCharacteristics} />
      <div className="mt-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Potential risk signals</p>
        <ul className="mt-1 space-y-0.5">
          {riskSignals.map((r) => (
            <li key={r.name} className="flex items-center justify-between gap-2 text-[11px] text-slate-700">
              <span>{r.name}</span><Pill label={r.severity} tone={intakeTone(r.severity)} />
            </li>
          ))}
        </ul>
      </div>
      <ListBlock title="Assumptions" items={changeAssumptions} tone="amber" />
    </div>
  );

  const region3 = (
    <div className={regionClass} aria-label="Retrieved enterprise context">
      <RegionHeader title="Retrieved Enterprise Context" note={`${visibleContext.filter((c) => c.included).length} of ${visibleContext.length} records included`} />
      {(["Team Persona", "Business Condition", "Prior Decision", "Prior Outcome", "Learning Record", "Policy", "Risk", "Control", "Evidence"] as const).map((type) => {
        const rows = visibleContext.filter((c) => c.memoryType === type);
        if (!rows.length) return null;
        return (
          <div key={type} className="mt-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{type}</p>
            <div className="mt-1 space-y-1">
              {rows.map((c) => (
                <div key={c.id}
                  className={cn("rounded border p-1.5 transition",
                    !c.included ? "border-slate-200 bg-slate-50 opacity-70"
                      : state.activeContextId === c.id ? "border-blue-400 bg-blue-50"
                        : highlightedContext.has(c.id) ? "border-blue-300 bg-blue-50/60" : "border-slate-200 bg-white")}>
                  <button type="button" className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    onClick={() => set({ activeContextId: c.id })} aria-pressed={state.activeContextId === c.id}>
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-[11.5px] font-medium text-slate-900">{c.title}</p>
                      <Pill label={`${c.relevanceScore}%`} tone={c.relevanceScore >= 90 ? "green" : "amber"} />
                    </div>
                    <p className="text-[10.5px] text-slate-600">{c.reason}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Pill label={c.memoryRecordId} tone="slate" />
                      <Pill label={c.authority} tone="blue" />
                      <Pill label={`Confidence ${c.confidence}%`} tone="slate" />
                      <Pill label={c.freshness} tone={c.freshness === "Current" ? "green" : "amber"} />
                      <Pill label={`${c.evidenceCount} evidence`} tone="slate" />
                      <Pill label={c.relationshipType} tone="slate" />
                      {c.activation && <Pill label="Conditionally activated" tone="amber" />}
                    </div>
                  </button>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onToggleContext(c)}>
                      {c.included ? "Exclude Context" : "Include Context"}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenRecord(c.memoryRecordId, c.memoryType)}>Open Record</Button>
                    <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenRecord(c.memoryRecordId, "Evidence")}>Open Evidence</Button>
                    <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenRecord(c.memoryRecordId, "Relationship")}>Open Relationship</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Candidate Team Personas</p>
        <div className="mt-1 space-y-1">
          {personas.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2">
              <span className={cn("text-[11px]", p.selectionState === "Excluded" ? "text-slate-400 line-through" : "text-slate-700")}>
                {p.personaName} · {p.matchConfidence}%
              </span>
              <Button size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onTogglePersona(p)}>
                {p.selectionState === "Excluded" ? "Include" : "Exclude"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {missingEvidenceItems.length > 0 && (
        <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">Close an evidence gap</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {missingEvidenceItems.map((e) => (
              <Button key={e.id} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onAddEvidence(e)}>
                Add synthetic {e.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const section = (title: string, body: React.ReactNode) => (
    <div className={cn("rounded border p-1.5",
      highlightedSections.has(title) ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white")}>
      <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-0.5 text-[11px] text-slate-700">{body}</div>
    </div>
  );

  const region4 = (
    <div className={regionClass} aria-label="Intake package">
      <RegionHeader title="Intake Package" note="Structured output handed to the next stage" />
      <div className="mt-1 grid gap-1">
        {section("Work Identity", `${intake.id} · ${intake.title} · ${intake.workType} · ${intake.priority}`)}
        {section("Intent", state.intent)}
        {section("Current State", state.currentState)}
        {section("Proposed State", state.proposedState)}
        {section("Scope", `${state.trafficExposure} percent initial traffic · selected transient decline categories · ${state.deploymentTiming}`)}
        {section("Affected Entities", "Retry Orchestrator, Payments API, Fraud Decision Service, Identity Services, Regional Token Vault, Checkout Customer Journey")}
        {section("Candidate Team Personas", (
          <ul className="space-y-0.5">
            {result.includedPersonas.map((p) => <li key={p.id}>• {p.personaName} · {p.matchConfidence}%</li>)}
          </ul>
        ))}
        {section("Applicable Business Conditions", `${result.includedConditions.filter((c) => c.relevanceScore >= 94).length} high relevance · ${result.includedConditions.filter((c) => c.relevanceScore < 94).length} supporting`)}
        {section("Dependencies", "Payments API, Fraud Decision Service, Identity Services, Regional Token Vault")}
        {section("Risks", (
          <ul className="space-y-0.5">
            <li>• Duplicate Transaction Risk — High</li>
            <li>• Latency Amplification — Medium</li>
            <li>• Fraud Dependency Risk — High</li>
            <li>• Regional Dependency Risk — Medium</li>
            <li>• Governance Risk — {state.deploymentTiming === "Quarter end window" ? "High" : "Medium"}</li>
          </ul>
        ))}
        {section("Assumptions", (
          <ul className="space-y-0.5">{changeAssumptions.map((a) => <li key={a}>• {a}</li>)}</ul>
        ))}
        {section("Provided Evidence", (
          <ul className="space-y-0.5">
            {evidence.filter((e) => e.provided || state.addedEvidenceIds.includes(e.id)).map((e) => <li key={e.id}>• {e.name}</li>)}
          </ul>
        ))}
        {section("Missing Evidence", result.missingEvidence.length ? (
          <ul className="space-y-0.5">{result.missingEvidence.map((m) => <li key={m}>• {m}</li>)}</ul>
        ) : <span className="text-emerald-700">All required evidence supplied</span>)}
        {section("Prior Decisions", "DEC 4812 · Limited Retry Increase")}
        {section("Prior Outcomes", "OUT 3284 · Checkout Completion +1.8%, Duplicate Authorization +0.4%")}
        {section("Relevant Learning", "LRN 1426 · Stronger idempotency validation required before traffic expansion")}
        {section("Potential Governance Requirements", (
          <ul className="space-y-0.5">{result.governanceRequirements.map((g) => <li key={g}>• {g}</li>)}</ul>
        ))}
        {section("Open Questions", result.openQuestions.length ? (
          <ul className="space-y-0.5">{result.openQuestions.map((q) => <li key={q}>• {q}</li>)}</ul>
        ) : <span className="text-emerald-700">No open questions remain</span>)}
      </div>

      <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-2">
        <Row label="Context Confidence" value={`${result.contextConfidence}%`} />
        <Row label="Evidence Coverage" value={`${result.evidenceCoverage}%`} />
        <Row label="Open Questions Resolved" value={`${result.openQuestionsResolved}%`} />
        <Row label="Package Completeness" value={`${Math.round((result.contextConfidence + result.evidenceCoverage + result.openQuestionsResolved) / 3)}%`} />
        <Row label="Status" value={
          <Pill label={result.missingEvidence.length ? "Needs Clarification" : "Package Complete"}
            tone={result.missingEvidence.length ? "amber" : "green"} />
        } />
        <Progress className="mt-1.5 h-1.5" value={Math.round((result.contextConfidence + result.evidenceCoverage + result.openQuestionsResolved) / 3)} />
        <p className="mt-1 text-[10px] text-slate-400">
          Package completeness measures structural completeness only. Cognitive Readiness is assessed in the next stage.
        </p>
      </div>
    </div>
  );

  const tabs: { id: typeof mobileTab; label: string; node: React.ReactNode }[] = [
    { id: "original", label: "Original Work", node: region1 },
    { id: "change", label: "Decomposition", node: region2 },
    { id: "context", label: "Enterprise Context", node: region3 },
    { id: "package", label: "Intake Package", node: region4 },
  ];

  return (
    <Panel id="panel-workbench" title="Cognitive Intake Workbench"
      subtitle={`${intake.id} · ${intake.title} — understand the work before evaluating the work`}
      actions={
        <>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onSaveDraft}>Save Draft</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={onBuildPackage}>Build Intake Package</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => set({ ...initialWorkbenchState, intakeId: state.intakeId })}>Reset Workbench</Button>
        </>
      }>
      {/* Large desktop: four synchronized regions */}
      <div className="hidden gap-2 2xl:grid 2xl:grid-cols-4">{tabs.map((t) => <div key={t.id}>{t.node}</div>)}</div>
      {/* Tablet: two synchronized panes */}
      <div className="hidden gap-2 lg:grid lg:grid-cols-2 2xl:hidden">
        <div className="space-y-2">{region1}{region3}</div>
        <div className="space-y-2">{region2}{region4}</div>
      </div>
      {/* Mobile: tabs */}
      <div className="lg:hidden">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Workbench regions">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={mobileTab === t.id} type="button" onClick={() => setMobileTab(t.id)}
              className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                mobileTab === t.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600")}>{t.label}</button>
          ))}
        </div>
        <div className="mt-2">{tabs.find((t) => t.id === mobileTab)?.node}</div>
      </div>
      <p className="mt-1.5 text-[10.5px] text-slate-400">
        Request Clarification, Add Evidence, and Route to Readiness become available in Prompt 2.
      </p>
    </Panel>
  );
}

function RegionHeader({ title, note }: { title: string; note: string }) {
  return (
    <div className="sticky top-0 -mx-2 -mt-2 mb-1 border-b border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur">
      <h3 className="text-[12px] font-semibold text-slate-900">{title}</h3>
      <p className="text-[10px] text-slate-500">{note}</p>
    </div>
  );
}

function ListBlock({ title, items, tone }: { title: string; items: string[]; tone?: "amber" }) {
  return (
    <div className="mt-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className="mt-0.5 space-y-0.5">
        {items.map((i) => (
          <li key={i} className={cn("text-[11px]", tone === "amber" ? "text-amber-700" : "text-slate-700")}>• {i}</li>
        ))}
      </ul>
    </div>
  );
}
