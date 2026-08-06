/**
 * Enterprise Cognitive Memory — Prompt 2 signature workspaces:
 * Curation Workbench, Point in Time Memory, Snapshots, Access Simulator
 * and Agent Context Simulator.
 */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pill, Row, FilterSelect, type Tone } from "../persona-studio/primitives";
import { Panel, EmptyState } from "./panels";
import {
  curationCandidates, curationDecisions, curationDecisionsRequiringApproval, curationReviewers,
  pointInTimeEvents, pointInTimeKnowledgeTypes, memorySnapshots, simIdentities, simRecords,
  simulateAccess, simAgents, simTasks, simRequiredContext,
  type CurationCandidate, type CandidateCategory, type CurationDecision,
  type PointInTimeEvent, type MemorySnapshot, type SimIdentity, type SimRecord,
} from "./governance-data";

const tone = (s: string): Tone => {
  if (["Allowed", "Current", "Healthy", "Immutable"].includes(s)) return "green";
  if (["Partially Allowed", "Medium", "Simulated", "Aging"].includes(s)) return "amber";
  if (["Denied", "Critical", "High"].includes(s)) return "red";
  if (["Low", "Archived"].includes(s)) return "slate";
  return "blue";
};

const categories: CandidateCategory[] = [
  "Duplicates", "Overlapping Records", "Conflicting Records", "Stale Records", "Superseded Records", "Ambiguous Records",
];

/* ------------------------------------------------------------------ */
/* Curation workbench                                                  */
/* ------------------------------------------------------------------ */

export interface CurationDecisionState {
  decision: CurationDecision | "";
  reason: string;
  reviewer: string;
  approver: string;
  effectiveDate: string;
  applicability: string;
  impactAcknowledged: boolean;
}

export const initialCurationDecision: CurationDecisionState = {
  decision: "", reason: "", reviewer: curationReviewers[0], approver: "",
  effectiveDate: "2026-08-10", applicability: "All applicable teams", impactAcknowledged: false,
};

export function CurationWorkbench({
  candidateId, onCandidate, state, onState, onSubmit, onMerge, onSupersede,
}: {
  candidateId: string;
  onCandidate: (id: string) => void;
  state: CurationDecisionState;
  onState: (s: CurationDecisionState) => void;
  onSubmit: (c: CurationCandidate) => void;
  onMerge: (c: CurationCandidate) => void;
  onSupersede: (c: CurationCandidate) => void;
}) {
  const [category, setCategory] = useState<CandidateCategory | "All">("All");
  const [mobileTab, setMobileTab] = useState<"candidates" | "comparison" | "decision">("comparison");
  const candidates = curationCandidates.filter((c) => category === "All" || c.category === category);
  const candidate = curationCandidates.find((c) => c.id === candidateId) ?? curationCandidates[0];
  const needsApproval = curationDecisionsRequiringApproval.includes(state.decision as CurationDecision);
  const valid = !!state.decision && state.reason.trim().length > 3 && !!state.reviewer
    && (!needsApproval || !!state.approver) && state.impactAcknowledged;

  const region = (key: typeof mobileTab) => cn(mobileTab === key ? "block" : "hidden", "lg:block");

  return (
    <Panel id="panel-curation" title="Memory Curation Workbench"
      subtitle="Candidate records · field level comparison · governed curation decision"
      actions={
        <FilterSelect label="Candidate Set" value={category}
          options={["All", ...categories]} onChange={(v) => setCategory(v as CandidateCategory | "All")} />
      }>
      <div className="mb-1.5 flex gap-1 lg:hidden" role="tablist" aria-label="Curation regions">
        {(["candidates", "comparison", "decision"] as const).map((t) => (
          <button key={t} role="tab" type="button" aria-selected={mobileTab === t} onClick={() => setMobileTab(t)}
            className={cn("rounded px-2 py-1 text-[11px] capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              mobileTab === t ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600")}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-2 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)_minmax(0,280px)]">
        {/* Region 1 */}
        <section className={cn("rounded-lg border border-slate-200 p-1.5", region("candidates"))} aria-label="Candidate records">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Candidate Records</p>
          {candidates.length === 0 ? <EmptyState message="No candidates in this set" /> : (
            <ul className="mt-1 space-y-1">
              {candidates.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => { onCandidate(c.id); setMobileTab("comparison"); }}
                    aria-current={candidate.id === c.id}
                    className={cn("w-full rounded border p-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      candidate.id === c.id ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300")}>
                    <p className="text-[11px] font-medium text-slate-800">{c.title}</p>
                    <p className="text-[10px] text-slate-500">{c.id} · {c.memoryType}</p>
                    <div className="mt-0.5 flex gap-1"><Pill label={c.category} tone="blue" /><Pill label={c.severity} tone={tone(c.severity)} /></div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Region 2 */}
        <section className={cn("overflow-x-auto rounded-lg border border-slate-200 p-1.5", region("comparison"))} aria-label="Record comparison">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Comparison · {candidate.id}</p>
          <table className="mt-1 w-full min-w-[520px] text-[11px]">
            <caption className="sr-only">Field level comparison between record A and record B</caption>
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-2 py-1 text-left font-semibold text-slate-600">Field</th>
                <th scope="col" className="px-2 py-1 text-left font-semibold text-slate-600">{candidate.recordAId}</th>
                <th scope="col" className="px-2 py-1 text-left font-semibold text-slate-600">{candidate.recordBId}</th>
              </tr>
            </thead>
            <tbody>
              {candidate.fields.map((f) => {
                const differs = f.a !== f.b;
                return (
                  <tr key={f.label} className={cn("border-t border-slate-100", differs && "bg-amber-50/60")}>
                    <td className="px-2 py-1 font-medium text-slate-600">{f.label}{differs && <span className="sr-only"> (differs)</span>}</td>
                    <td className="px-2 py-1 text-slate-800">{f.a}</td>
                    <td className="px-2 py-1 text-slate-800">{f.b}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Region 3 */}
        <section className={cn("rounded-lg border border-slate-200 p-1.5", region("decision"))} aria-label="Curation decision">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Curation Decision</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {curationDecisions.map((d) => (
              <button key={d} type="button" aria-pressed={state.decision === d}
                onClick={() => onState({ ...state, decision: d })}
                className={cn("rounded border px-1.5 py-0.5 text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  state.decision === d ? "border-blue-500 bg-blue-600 text-white" : "border-slate-200 text-slate-700 hover:border-blue-300")}>
                {d}
              </button>
            ))}
          </div>

          <div className="mt-1.5 space-y-1.5">
            <label className="block">
              <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Reason</span>
              <textarea value={state.reason} onChange={(e) => onState({ ...state, reason: e.target.value })}
                rows={2} className="mt-0.5 w-full rounded border border-slate-200 p-1.5 text-[11px] focus:border-blue-400 focus:outline-none"
                placeholder="Why is this decision correct?" />
            </label>
            <FilterSelect label="Reviewer" value={state.reviewer} options={curationReviewers} onChange={(v) => onState({ ...state, reviewer: v })} />
            {needsApproval && (
              <FilterSelect label="Approver (required)" value={state.approver || ""}
                options={["", ...curationReviewers]} onChange={(v) => onState({ ...state, approver: v })} />
            )}
            <label className="block">
              <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Effective Date</span>
              <input type="date" value={state.effectiveDate} onChange={(e) => onState({ ...state, effectiveDate: e.target.value })}
                className="mt-0.5 h-7 w-full rounded border border-slate-200 px-1.5 text-[11px] focus:border-blue-400 focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Applicability</span>
              <input value={state.applicability} onChange={(e) => onState({ ...state, applicability: e.target.value })}
                className="mt-0.5 h-7 w-full rounded border border-slate-200 px-1.5 text-[11px] focus:border-blue-400 focus:outline-none" />
            </label>
            <label className="flex items-start gap-1.5 text-[11px] text-slate-700">
              <input type="checkbox" checked={state.impactAcknowledged}
                onChange={(e) => onState({ ...state, impactAcknowledged: e.target.checked })} className="mt-0.5" />
              I acknowledge the downstream impact on personas, evaluations, decisions and agents
            </label>
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1">
            <Button size="sm" className="h-7 text-[11px]" disabled={!valid} onClick={() => onSubmit(candidate)}>Apply Decision</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onMerge(candidate)}>Open Merge</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onSupersede(candidate)}>Open Supersession</Button>
          </div>
          {!valid && <p className="mt-1 text-[10.5px] text-slate-500">Select a decision, provide a reason, reviewer{needsApproval ? ", approver" : ""} and acknowledge impact.</p>}
        </section>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Point in time memory                                                */
/* ------------------------------------------------------------------ */

export function PointInTimePanel({ eventId, onEvent, onCompare, onOpenDecision, onOpenEvidence }: {
  eventId: string;
  onEvent: (id: string) => void;
  onCompare: (e: PointInTimeEvent) => void;
  onOpenDecision: (e: PointInTimeEvent) => void;
  onOpenEvidence: (e: PointInTimeEvent) => void;
}) {
  const event = pointInTimeEvents.find((e) => e.id === eventId) ?? pointInTimeEvents[1];
  const differences = event.facts.filter((f) => f.differs);
  const historical = event.id !== "pit-current";

  return (
    <Panel id="panel-pit" title="Point in Time Memory"
      subtitle="What did the enterprise know when this decision was made?"
      actions={historical ? <Pill label="Historical reconstruction" tone="blue" /> : <Pill label="Current" tone="green" />}>
      <div className="grid gap-1.5 sm:grid-cols-3 xl:grid-cols-7">
        <FilterSelect label="Event" value={event.id} options={pointInTimeEvents.map((e) => e.id)} onChange={onEvent} />
        <FilterSelect label="Date" value={event.date} options={[event.date]} onChange={() => undefined} />
        <FilterSelect label="Time" value={event.time} options={[event.time]} onChange={() => undefined} />
        <FilterSelect label="Decision" value={event.decision} options={[event.decision]} onChange={() => undefined} />
        <FilterSelect label="Impact Evaluation" value={event.evaluation} options={[event.evaluation]} onChange={() => undefined} />
        <FilterSelect label="Team" value={event.team} options={[event.team]} onChange={() => undefined} />
        <FilterSelect label="Knowledge Domain" value={event.domain} options={[event.domain]} onChange={() => undefined} />
      </div>

      <p className="mt-1.5 text-[11px] text-slate-600">{pointInTimeEvents.find((e) => e.id === event.id)?.name} — {event.narrative}</p>

      <div className="mt-2 grid gap-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[600px] text-[11px]">
            <caption className="sr-only">Reconstructed memory state compared with current state</caption>
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-2 py-1.5 text-left font-semibold text-slate-600">Knowledge</th>
                <th scope="col" className="px-2 py-1.5 text-left font-semibold text-slate-600">Known at this moment</th>
                <th scope="col" className="px-2 py-1.5 text-left font-semibold text-slate-600">Current state</th>
                <th scope="col" className="px-2 py-1.5 text-left font-semibold text-slate-600">Differs</th>
              </tr>
            </thead>
            <tbody>
              {event.facts.map((f) => (
                <tr key={f.label} className={cn("border-t border-slate-100", f.differs && "bg-amber-50/60")}>
                  <td className="px-2 py-1.5 font-medium text-slate-700">{f.label}</td>
                  <td className="px-2 py-1.5 text-slate-800">{f.value}</td>
                  <td className="px-2 py-1.5 text-slate-500">{historical ? f.current : f.value}</td>
                  <td className="px-2 py-1.5">{f.differs ? <Pill label="Differs" tone="amber" /> : <Pill label="Same" tone="green" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <div className="rounded-lg border border-slate-200 p-2">
            <p className="text-[11px] font-semibold text-slate-800">Reconstructed knowledge types</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {pointInTimeKnowledgeTypes.map((t) => <Pill key={t} label={t} tone="slate" />)}
            </div>
            <dl className="mt-1">
              <Row label="Persona Version" value={event.personaVersion} />
              <Row label="Access Policy Version" value={event.accessPolicyVersion} />
              <Row label="Known Decisions" value={event.knownDecisions.join(", ") || "None"} />
              <Row label="Known Outcomes" value={event.knownOutcomes.join(", ") || "Not yet known"} />
              <Row label="Learning Records" value={event.knownLearning.join(", ") || "Do not yet exist"} />
            </dl>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-2">
            <p className="text-[11px] font-semibold text-blue-900">Future knowledge excluded</p>
            <p className="text-[10.5px] text-blue-900">
              {historical
                ? `${differences.length} facts differ from current memory. Outcomes, learning records and later versions created after ${event.date} ${event.time} are excluded from this reconstruction.`
                : "Current state — no historical exclusion applied."}
            </p>
          </div>

          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onCompare(event)}>Compare with Current</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenDecision(event)}>Open Decision</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenEvidence(event)}>Open Evidence Known at Time</Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Snapshots                                                           */
/* ------------------------------------------------------------------ */

export function SnapshotsPanel({ snapshots, onOpen, onCompare, onExport, onCreate, onRestore }: {
  snapshots: MemorySnapshot[];
  onOpen: (s: MemorySnapshot) => void;
  onCompare: (s: MemorySnapshot) => void;
  onExport: (s: MemorySnapshot) => void;
  onCreate: () => void;
  onRestore: (s: MemorySnapshot) => void;
}) {
  return (
    <Panel id="panel-snapshots" title="Enterprise Memory Snapshots"
      subtitle="Immutable point in time captures. Restoring never overwrites live current memory."
      actions={<Button size="sm" className="h-7 text-[11px]" onClick={onCreate}>Create Snapshot</Button>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-[11px]">
          <caption className="sr-only">Enterprise memory snapshots</caption>
          <thead className="bg-slate-50">
            <tr>
              {["Snapshot ID", "Name", "Timestamp", "Domains", "Records", "Relationships", "Index Version", "Access Policy Version", "Created By", "Reason", "Status", "Actions"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 text-left font-semibold text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {snapshots.map((s) => (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-2 py-1.5 font-medium text-slate-800">{s.id}</td>
                <td className="px-2 py-1.5">{s.name}</td>
                <td className="px-2 py-1.5">{s.timestamp}</td>
                <td className="px-2 py-1.5">{s.domains.join(", ")}</td>
                <td className="px-2 py-1.5">{s.recordCount}</td>
                <td className="px-2 py-1.5">{s.relationshipCount}</td>
                <td className="px-2 py-1.5">{s.indexVersion}</td>
                <td className="px-2 py-1.5">{s.accessPolicyVersion}</td>
                <td className="px-2 py-1.5">{s.createdBy}</td>
                <td className="px-2 py-1.5">{s.reason}</td>
                <td className="px-2 py-1.5"><Pill label={s.status} tone={tone(s.status)} /></td>
                <td className="px-2 py-1.5">
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onOpen(s)}>Open</Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onCompare(s)}>Compare</Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onExport(s)}>Export Metadata</Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onRestore(s)}>Restore as Simulation</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Access simulator                                                    */
/* ------------------------------------------------------------------ */

export function AccessSimulator({ identityId, recordId, onIdentity, onRecord, onRun, result }: {
  identityId: string;
  recordId: string;
  onIdentity: (id: string) => void;
  onRecord: (id: string) => void;
  onRun: (identity: SimIdentity, record: SimRecord) => void;
  result: ReturnType<typeof simulateAccess> | null;
}) {
  const identity = simIdentities.find((i) => i.id === identityId) ?? simIdentities[0];
  const record = simRecords.find((r) => r.id === recordId) ?? simRecords[0];
  const live = result ?? simulateAccess(identity, record);

  const flag = (label: string, value: boolean) => (
    <Row label={label} value={<Pill label={value ? "Visible" : "Hidden"} tone={value ? "green" : "red"} />} />
  );

  return (
    <Panel id="panel-access-sim" title="Access Simulator"
      subtitle="Safe simulation only — no real secrets or credentials are exposed">
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="space-y-1.5 rounded-lg border border-slate-200 p-2">
          <FilterSelect label="Identity" value={identity.id} options={simIdentities.map((i) => i.id)}
            onChange={onIdentity} />
          <p className="text-[10.5px] text-slate-600">
            {identity.name} · {identity.type} · entitlements: {identity.entitlements.join(", ")}
            {identity.restrictedEvidence ? " · restricted evidence entitlement" : " · no restricted evidence entitlement"}
          </p>
          <FilterSelect label="Memory Record" value={record.id} options={simRecords.map((r) => r.id)} onChange={onRecord} />
          <p className="text-[10.5px] text-slate-600">{record.title} · {record.memoryType} · {record.classification}</p>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => onRun(identity, record)}>Run Access Simulation</Button>
        </div>

        <div className={cn("rounded-lg border p-2",
          live.decision === "Allowed" ? "border-emerald-200 bg-emerald-50"
            : live.decision === "Partially Allowed" ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50")}>
          <div className="flex items-center gap-2">
            <Pill label={live.decision} tone={tone(live.decision)} />
            <span className="text-[11px] font-semibold text-slate-800">{identity.name} → {record.id}</span>
          </div>
          <dl className="mt-1">
            {flag("Metadata Visible", live.metadataVisible)}
            {flag("Record Content Visible", live.contentVisible)}
            {flag("Exact Evidence Visible", live.evidenceVisible)}
            {flag("Derived Condition Visible", live.derivedVisible)}
            {flag("Relationship Visible", live.relationshipVisible)}
            <Row label="Reason" value={live.reason} />
            <Row label="Applicable Policy" value={live.policyId} />
            <Row label="Inherited Source Permission" value={live.inheritedFrom} />
            <Row label="Audit Result" value={`${live.auditId} · logged`} />
          </dl>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Agent context simulator                                             */
/* ------------------------------------------------------------------ */

export function buildAgentSimulation(agent: string, task: string, identity: SimIdentity, pit: PointInTimeEvent) {
  const evaluated = simRecords.map((r) => ({ record: r, result: simulateAccess(identity, r) }));
  const allowed = evaluated.filter((e) => e.result.decision !== "Denied").map((e) => ({
    id: e.record.id, title: e.record.title, type: e.record.memoryType,
    classification: e.record.classification,
    note: e.result.decision === "Allowed" ? "Full context returned" : "Derived context returned",
  }));
  const denied = evaluated.filter((e) => e.result.decision === "Denied").map((e) => ({
    id: e.record.id, title: e.record.title, classification: e.record.classification,
    reason: e.result.reason,
    alternative: e.record.derivedConditionId ? `Derived condition ${e.record.derivedConditionId} may be returned` : "No approved alternative",
  }));
  const evidence = evaluated.filter((e) => e.record.memoryType === "Evidence Record").map((e) => ({
    id: e.record.id, title: e.record.title,
    access: e.result.evidenceVisible ? "Evidence returned" : "Evidence withheld",
  }));
  return {
    allowed, denied, evidence,
    derived: evaluated.filter((e) => e.result.derivedVisible && e.record.derivedConditionId)
      .map((e) => ({ id: e.record.derivedConditionId as string, title: `Derived from ${e.record.id}`, note: "Approved derived business condition" })),
    relationshipPaths: [
      "Payments Platform Persona → depends on → Identity Services",
      "Identity Services → constrained by → Identity Latency Threshold",
      "Retry Policy Change → governed by → Quarter End Deployment Restriction",
    ],
    decisionHistory: pit.knownDecisions,
    outcomeHistory: pit.knownOutcomes.length ? pit.knownOutcomes : ["Not yet known at this point in time"],
    learningRecords: pit.knownLearning.length ? pit.knownLearning : ["No learning record existed at this point in time"],
    confidence: denied.length > 0 ? 78 : 91,
    freshness: pit.id === "pit-current" ? "Current" : `Historical · ${pit.date}`,
    accessExplanations: [
      `Identity ${identity.name} evaluated against policies POL 212, POL 216 and POL 220.`,
      denied.length > 0
        ? `${denied.length} records withheld; approved derived context substituted where policy permits.`
        : "All requested records permitted for this identity.",
      `Task scope: ${task}. Agent: ${agent}.`,
    ],
  };
}

export function AgentContextSimulator({
  agent, task, identityId, pitId, onAgent, onTask, onIdentity, onPit, onRun, output, onOpenRecord,
}: {
  agent: string; task: string; identityId: string; pitId: string;
  onAgent: (v: string) => void; onTask: (v: string) => void;
  onIdentity: (v: string) => void; onPit: (v: string) => void;
  onRun: () => void;
  output: ReturnType<typeof buildAgentSimulation> | null;
  onOpenRecord: (id: string) => void;
}) {
  const [tab, setTab] = useState("Request");
  const identity = simIdentities.find((i) => i.id === identityId) ?? simIdentities[0];
  const pit = pointInTimeEvents.find((e) => e.id === pitId) ?? pointInTimeEvents[1];
  const sim = output ?? buildAgentSimulation(agent, task, identity, pit);
  const tabs = ["Request", "Retrieved Context", "Denied Context", "Evidence", "Audit"];

  return (
    <Panel id="panel-agent-sim" title="Agent Context Simulator"
      subtitle="Agents receive only the approved context permitted for their task, identity and point in time">
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
        <FilterSelect label="Agent" value={agent} options={simAgents} onChange={onAgent} />
        <FilterSelect label="Task" value={task} options={simTasks} onChange={onTask} />
        <FilterSelect label="Simulated Access Identity" value={identity.id} options={simIdentities.map((i) => i.id)} onChange={onIdentity} />
        <FilterSelect label="Point in Time" value={pit.id} options={pointInTimeEvents.map((e) => e.id)} onChange={onPit} />
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        <Button size="sm" className="h-7 text-[11px]" onClick={onRun}>Run Simulation</Button>
        <Pill label={`Confidence ${sim.confidence}%`} tone={sim.confidence >= 85 ? "green" : "amber"} />
        <Pill label={`Freshness ${sim.freshness}`} tone="blue" />
      </div>

      <div className="mt-2 flex flex-wrap gap-1" role="tablist" aria-label="Agent simulation results">
        {tabs.map((t) => (
          <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)}
            className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600")}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-1.5 rounded-lg border border-slate-200 p-2 text-[11px]">
        {tab === "Request" && (
          <dl>
            <Row label="Task" value={task} />
            <Row label="Agent" value={agent} />
            <Row label="Required Context Types" value={simRequiredContext.join(", ")} />
            <Row label="Requested Memory Records" value={simRecords.map((r) => r.id).join(", ")} />
            <Row label="Access Scope" value={`${identity.name} · ${identity.entitlements.join(", ")}`} />
            <Row label="Point in Time" value={`${pit.name} · ${pit.date} ${pit.time}`} />
          </dl>
        )}
        {tab === "Retrieved Context" && (
          <div className="space-y-1.5">
            <ul className="space-y-1">
              {sim.allowed.map((a) => (
                <li key={a.id} className="rounded border border-emerald-200 bg-emerald-50 p-1.5">
                  <button type="button" onClick={() => onOpenRecord(a.id)}
                    className="text-left font-medium text-blue-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {a.id} · {a.title}
                  </button>
                  <p className="text-[10.5px] text-slate-600">{a.type} · {a.classification} · {a.note}</p>
                </li>
              ))}
            </ul>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Relationship Paths</p>
              <ul className="list-disc pl-4 text-slate-700">{sim.relationshipPaths.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
            <dl>
              <Row label="Decision History" value={sim.decisionHistory.join(", ") || "None"} />
              <Row label="Outcome History" value={sim.outcomeHistory.join(", ")} />
              <Row label="Learning Records" value={sim.learningRecords.join(", ")} />
            </dl>
          </div>
        )}
        {tab === "Denied Context" && (
          sim.denied.length === 0 ? <EmptyState message="No records were denied for this identity" /> : (
            <ul className="space-y-1">
              {sim.denied.map((d) => (
                <li key={d.id} className="rounded border border-red-200 bg-red-50 p-1.5">
                  <p className="font-medium text-red-900">{d.id} · {d.title} <Pill label={d.classification} tone="red" /></p>
                  <p className="text-[10.5px] text-slate-700">{d.reason}</p>
                  <p className="text-[10.5px] text-slate-700">Alternative: {d.alternative}</p>
                </li>
              ))}
            </ul>
          )
        )}
        {tab === "Evidence" && (
          <ul className="space-y-1">
            {sim.evidence.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 border-b border-slate-100 py-1 last:border-0">
                <span>{e.id} · {e.title}</span>
                <Pill label={e.access} tone={e.access === "Evidence returned" ? "green" : "red"} />
              </li>
            ))}
          </ul>
        )}
        {tab === "Audit" && (
          <ul className="list-disc pl-4 text-slate-700">
            {sim.accessExplanations.map((a) => <li key={a}>{a}</li>)}
            <li>Simulation logged as synthetic — no production data or credentials were accessed.</li>
          </ul>
        )}
      </div>
    </Panel>
  );
}

/* Helper used by the page to keep candidate selection stable. */
export function useCurationCandidate(initial = curationCandidates[0].id) {
  const [id, setId] = useState(initial);
  const candidate = useMemo(() => curationCandidates.find((c) => c.id === id) ?? curationCandidates[0], [id]);
  return { id, setId, candidate };
}
