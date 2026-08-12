/** Enterprise Cognitive Health — Prompt 2 dialogs, wizards and governed export. */

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Drawer, Pill, Row } from "../persona-studio/primitives";
import { OpsTable } from "./ops-panels";
import { bandFor, chTone, dimensions, signals } from "./data";
import {
  buildExportRows, briefSections, briefTimeRanges, currentPolicy, dimName, escalationLevels,
  escalationReasons, exportFormats, exportOptions, exportScopes, healthSeverities, measurementWindows,
  requiredActionTypes, reviewCommentRequired, scenarioComputation, scopeTypes, searchExamples,
  searchHealth, signalName, toCsv, toYaml,
  type CognitiveHealthAlert, type CognitiveHealthDecisionExposure, type CognitiveHealthExecutiveBrief,
  type CognitiveHealthIntervention, type CognitiveHealthReassessment, type CognitiveHealthReview,
  type CognitiveHealthRiskAcceptance, type HealthControls, type HealthSearchHit,
  type HealthSnapshotRecord, type RequiredActionType, type ScopeType,
} from "./ops-data";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-0.5 text-[10.5px] text-slate-600">
    <span className="font-medium uppercase tracking-wide text-slate-500">{label}</span>
    {children}
  </label>
);

const input = "h-7 rounded border border-slate-200 px-1.5 text-[11px] text-slate-800 focus:border-blue-400 focus:outline-none";
const area = "min-h-[64px] rounded border border-slate-200 p-1.5 text-[11px] text-slate-800 focus:border-blue-400 focus:outline-none";
const toggleList = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/* ============================================ 8 · create intervention ==== */

const wizardSteps = [
  "Select Health Signal", "Select Scope", "Define Intervention", "Define Health Target",
  "Define Required Actions", "Define Evidence of Completion", "Impact Preview", "Review", "Create",
];

export interface NewInterventionDraft {
  signalId: string;
  scopeType: ScopeType;
  scopeId: string;
  title: string;
  description: string;
  owner: string;
  participants: string;
  currentValue: number;
  targetValue: number;
  expectedChange: string;
  measurementWindow: string;
  actions: RequiredActionType[];
  evidence: string;
  dueDate: string;
}

export const emptyDraft: NewInterventionDraft = {
  signalId: "CHS 1003", scopeType: "Knowledge Domain", scopeId: "Identity & Access",
  title: "Validate Identity Critical Dependencies",
  description: "Revalidate critical dependency relationships against current evidence and republish to Enterprise Cognitive Memory.",
  owner: "Identity Architecture", participants: "Identity Engineering, Payments Platform",
  currentValue: 84, targetValue: 95, expectedChange: "Dependency Visibility +4 to +6",
  measurementWindow: "30 Days", actions: ["Dependency Validation"], evidence: "Validated relationship set published with fresh evidence references",
  dueDate: "2026-08-21",
};

export function CreateInterventionDialog({ open, onClose, draft, onDraft, onCreate }: {
  open: boolean;
  onClose: () => void;
  draft: NewInterventionDraft;
  onDraft: (d: Partial<NewInterventionDraft>) => void;
  onCreate: () => void;
}) {
  const [step, setStep] = useState(0);
  const signal = signals.find((s) => s.id === draft.signalId);
  const dimension = signal ? dimName(signal.dimensionId) : "";

  const close = () => { setStep(0); onClose(); };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && close()} wide title="Create Health Intervention"
      description="A governed action intended to improve one or more health signals. Ownership, target, measurement window and evidence of completion are required">
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-blue-700">
        Step {step + 1} of {wizardSteps.length} · {wizardSteps[step]}
      </p>
      <Progress value={((step + 1) / wizardSteps.length) * 100} className="h-1" />

      {step === 0 && (
        <Field label="Health Signal">
          <select className={input} value={draft.signalId} onChange={(e) => onDraft({ signalId: e.target.value })}>
            {signals.map((s) => <option key={s.id} value={s.id}>{s.name} · {dimName(s.dimensionId)} · {s.currentValue}</option>)}
          </select>
        </Field>
      )}

      {step === 1 && (
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Scope Type">
            <select className={input} value={draft.scopeType} onChange={(e) => onDraft({ scopeType: e.target.value as ScopeType })}>
              {scopeTypes.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Scope">
            <input className={input} value={draft.scopeId} onChange={(e) => onDraft({ scopeId: e.target.value })} />
          </Field>
        </div>
      )}

      {step === 2 && (
        <>
          <Field label="Title"><input className={input} value={draft.title} onChange={(e) => onDraft({ title: e.target.value })} /></Field>
          <Field label="Description"><textarea className={area} value={draft.description} onChange={(e) => onDraft({ description: e.target.value })} /></Field>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Owner"><input className={input} value={draft.owner} onChange={(e) => onDraft({ owner: e.target.value })} /></Field>
            <Field label="Participants"><input className={input} value={draft.participants} onChange={(e) => onDraft({ participants: e.target.value })} /></Field>
          </div>
        </>
      )}

      {step === 3 && (
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Current Signal Value"><input type="number" className={input} value={draft.currentValue} onChange={(e) => onDraft({ currentValue: Number(e.target.value) })} /></Field>
          <Field label="Target"><input type="number" className={input} value={draft.targetValue} onChange={(e) => onDraft({ targetValue: Number(e.target.value) })} /></Field>
          <Field label="Expected Change"><input className={input} value={draft.expectedChange} onChange={(e) => onDraft({ expectedChange: e.target.value })} /></Field>
          <Field label="Measurement Window">
            <select className={input} value={draft.measurementWindow} onChange={(e) => onDraft({ measurementWindow: e.target.value })}>
              {measurementWindows.map((w) => <option key={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="Due Date"><input type="date" className={input} value={draft.dueDate} onChange={(e) => onDraft({ dueDate: e.target.value })} /></Field>
        </div>
      )}

      {step === 4 && (
        <div>
          <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Required Actions</p>
          <div className="mt-0.5 grid gap-0.5 sm:grid-cols-2">
            {requiredActionTypes.map((a) => (
              <label key={a} className="flex items-center gap-1 text-[10.5px] text-slate-700">
                <input type="checkbox" checked={draft.actions.includes(a)}
                  onChange={() => onDraft({ actions: toggleList(draft.actions, a) as RequiredActionType[] })} />
                {a}
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <Field label="Evidence of Completion">
          <textarea className={area} value={draft.evidence} onChange={(e) => onDraft({ evidence: e.target.value })} />
        </Field>
      )}

      {step === 6 && (
        <div className="space-y-1.5">
          <dl className="rounded border border-slate-200 p-2">
            <Row label="Affected Dimensions" value={dimension} />
            <Row label="Affected Teams" value={draft.participants || "None"} />
            <Row label="Affected Decisions" value={signal?.affectedDecisionIds.join(", ") || "None"} />
            <Row label="Potential Side Effects" value="Validation work competes with delivery capacity in the same teams and may temporarily slow unrelated coordination" />
          </dl>
          <p className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10.5px] text-amber-800">
            Impact preview is a deterministic estimate. It is not an observed result.
          </p>
        </div>
      )}

      {step === 7 && (
        <dl className="rounded border border-slate-200 p-2">
          <Row label="Signal" value={signalName(draft.signalId)} />
          <Row label="Dimension" value={dimension} />
          <Row label="Scope" value={`${draft.scopeType} · ${draft.scopeId}`} />
          <Row label="Title" value={draft.title} />
          <Row label="Owner" value={draft.owner || "Unowned"} />
          <Row label="Target" value={`${draft.currentValue} → ${draft.targetValue}`} />
          <Row label="Expected Change" value={draft.expectedChange} />
          <Row label="Measurement Window" value={draft.measurementWindow} />
          <Row label="Required Actions" value={draft.actions.join(", ") || "None"} />
          <Row label="Evidence of Completion" value={draft.evidence} />
          <Row label="Due" value={draft.dueDate} />
        </dl>
      )}

      {step === 8 && (
        <p className="rounded border border-blue-200 bg-blue-50 p-2 text-[11.5px] text-blue-900">
          A deterministic intervention record will be created in the Proposed state, with an activity entry and an audit event.
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
        {step < wizardSteps.length - 1 ? (
          <Button size="sm" className="h-7 text-[11px]" onClick={() => setStep((s) => s + 1)}>Next</Button>
        ) : (
          <Button size="sm" className="h-7 text-[11px]" onClick={() => { onCreate(); close(); }}>Create Intervention</Button>
        )}
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={close}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* ============================================ review decision dialog ===== */

export function ReviewDecisionDialog({ open, onClose, review, decision, onConfirm }: {
  open: boolean;
  onClose: () => void;
  review: CognitiveHealthReview | null;
  decision: string;
  onConfirm: (comment: string) => void;
}) {
  const [comment, setComment] = useState("");
  const required = reviewCommentRequired(decision);
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} title={`Health Review Decision · ${decision}`}
      description={review ? `${review.id} · ${signalName(review.signalId)} · ${dimName(review.dimensionId)}` : ""}>
      {required && (
        <p className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10.5px] text-amber-800">
          A written rationale is required for this decision because it reduces visibility of a health signal.
        </p>
      )}
      <Field label={`Comment${required ? " (required)" : " (optional)"}`}>
        <textarea className={area} value={comment} onChange={(e) => setComment(e.target.value)} />
      </Field>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" disabled={required && !comment.trim()}
          onClick={() => { onConfirm(comment); setComment(""); onClose(); }}>Record Decision</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* =========================================== risk acceptance dialog ====== */

export function RiskAcceptanceDialog({ open, onClose, onConfirm }: {
  open: boolean;
  onClose: () => void;
  onConfirm: (r: Partial<CognitiveHealthRiskAcceptance>) => void;
}) {
  const [signalId, setSignalId] = useState("CHS 1017");
  const [reason, setReason] = useState("");
  const [expiration, setExpiration] = useState("2026-09-30");
  const [owner, setOwner] = useState("Commerce Architecture");
  const [approver, setApprover] = useState("Enterprise Cognitive Governance");
  const [monitoring, setMonitoring] = useState("Weekly signal review");
  const signal = signals.find((s) => s.id === signalId);
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} wide title="Accept Cognitive Health Risk"
      description="Use only when a health issue cannot immediately be corrected. Acceptance expires and never suppresses the underlying signal">
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Signal">
          <select className={input} value={signalId} onChange={(e) => setSignalId(e.target.value)}>
            {signals.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Dimension"><input className={input} readOnly value={signal ? dimName(signal.dimensionId) : ""} /></Field>
        <Field label="Scope"><input className={input} readOnly value={signal?.scopeId ?? "Enterprise"} /></Field>
        <Field label="Severity"><input className={input} readOnly value={signal?.severity ?? "Medium"} /></Field>
        <Field label="Affected Decisions"><input className={input} readOnly value={signal?.affectedDecisionIds.join(", ") || "None"} /></Field>
        <Field label="Expiration"><input type="date" className={input} value={expiration} onChange={(e) => setExpiration(e.target.value)} /></Field>
        <Field label="Owner"><input className={input} value={owner} onChange={(e) => setOwner(e.target.value)} /></Field>
        <Field label="Approver"><input className={input} value={approver} onChange={(e) => setApprover(e.target.value)} /></Field>
        <Field label="Required Monitoring"><input className={input} value={monitoring} onChange={(e) => setMonitoring(e.target.value)} /></Field>
      </div>
      <Field label="Reason for Acceptance (required)">
        <textarea className={area} value={reason} onChange={(e) => setReason(e.target.value)} />
      </Field>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" disabled={!reason.trim()}
          onClick={() => {
            onConfirm({
              signalId, dimensionId: signal?.dimensionId ?? "DIM CTA",
              scopeType: "Business Unit", scopeId: signal?.scopeId ?? "Enterprise",
              severity: "Medium High", affectedDecisionIds: signal?.affectedDecisionIds ?? [],
              affectedTeams: [signal?.scopeId ?? "Enterprise"],
              potentialConsequence: "Signal remains outside threshold while the acceptance is active",
              existingControls: ["Monitoring in the health review queue"], reason,
              expirationDate: expiration, owner, approver, monitoringRequirements: [monitoring],
              status: "Active",
            });
            setReason("");
            onClose();
          }}>Record Risk Acceptance</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* ================================================= escalation dialog ===== */

export function HealthEscalationDialog({ open, onClose, onConfirm }: {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { signalId: string; reason: string; level: string; due: string; business: string; customer: string; severity: string }) => void;
}) {
  const [signalId, setSignalId] = useState("CHS 1003");
  const [reason, setReason] = useState<string>(escalationReasons[1]);
  const [level, setLevel] = useState<string>(escalationLevels[2]);
  const [due, setDue] = useState("2026-08-14");
  const [business, setBusiness] = useState("Sequencing may be planned against dependency relationships that are no longer accurate");
  const [customer, setCustomer] = useState("Authentication interruption risk during a regional cutover");
  const [severity, setSeverity] = useState<string>("Critical");
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} wide title="Raise Cognitive Health Escalation"
      description="Escalation records the health issue, its enterprise and customer consequence, the evidence and the recommended escalation level">
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Health Issue">
          <select className={input} value={signalId} onChange={(e) => setSignalId(e.target.value)}>
            {signals.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Reason">
          <select className={input} value={reason} onChange={(e) => setReason(e.target.value)}>
            {escalationReasons.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Severity">
          <select className={input} value={severity} onChange={(e) => setSeverity(e.target.value)}>
            {healthSeverities.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Recommended Escalation Level">
          <select className={input} value={level} onChange={(e) => setLevel(e.target.value)}>
            {escalationLevels.map((l) => <option key={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Due"><input type="date" className={input} value={due} onChange={(e) => setDue(e.target.value)} /></Field>
      </div>
      <Field label="Business Consequence"><textarea className={area} value={business} onChange={(e) => setBusiness(e.target.value)} /></Field>
      <Field label="Customer Consequence"><textarea className={area} value={customer} onChange={(e) => setCustomer(e.target.value)} /></Field>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px]"
          onClick={() => { onConfirm({ signalId, reason, level, due, business, customer, severity }); onClose(); }}>Raise Escalation</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* ======================================== threshold proposal dialog ====== */

export function ThresholdProposalDialog({ open, onClose, onConfirm, currentVersion }: {
  open: boolean; onClose: () => void; onConfirm: (version: string, note: string) => void; currentVersion: string;
}) {
  const [dimensionId, setDimensionId] = useState("DIM CTA");
  const [strong, setStrong] = useState("95");
  const [healthy, setHealthy] = useState("90");
  const [attention, setAttention] = useState("85");
  const [needs, setNeeds] = useState("75");
  const [risk, setRisk] = useState("60");
  const [note, setNote] = useState("");
  const next = `${currentVersion.replace(/v1\.(\d+)/, (_, n) => `v1.${Number(n) + 1}`)} draft`;
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} wide title="Propose Threshold Change"
      description="Threshold changes create a new policy version. Historical health snapshots keep the policy that was effective when they were measured">
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Dimension">
          <select className={input} value={dimensionId} onChange={(e) => setDimensionId(e.target.value)}>
            {dimensions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Strong at or above"><input className={input} value={strong} onChange={(e) => setStrong(e.target.value)} /></Field>
        <Field label="Healthy at or above"><input className={input} value={healthy} onChange={(e) => setHealthy(e.target.value)} /></Field>
        <Field label="Healthy with Attention at or above"><input className={input} value={attention} onChange={(e) => setAttention(e.target.value)} /></Field>
        <Field label="Needs Attention at or above"><input className={input} value={needs} onChange={(e) => setNeeds(e.target.value)} /></Field>
        <Field label="At Risk at or above"><input className={input} value={risk} onChange={(e) => setRisk(e.target.value)} /></Field>
      </div>
      <p className="text-[10.5px] text-slate-600">
        {dimName(dimensionId)} · Strong &gt;= {strong} · Healthy {healthy} to {Number(strong) - 1} · Healthy with Attention {attention} to {Number(healthy) - 1} · Needs Attention {needs} to {Number(attention) - 1} · At Risk {risk} to {Number(needs) - 1} · Critical &lt; {risk}
      </p>
      <Field label="Reason for change"><textarea className={area} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" onClick={() => { onConfirm(next, note || "Threshold band adjustment"); onClose(); }}>
          Create {next}
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* ========================================= policy comparison dialog ====== */

export function PolicyComparisonDialog({ open, onClose, versions }: {
  open: boolean;
  onClose: () => void;
  versions: { version: string; weights: Record<string, number>; reason: string; effectiveDate: string }[];
}) {
  const [left, setLeft] = useState(versions[0]?.version ?? "v1.0");
  const [right, setRight] = useState(versions[versions.length - 1]?.version ?? "v1.2");
  const a = versions.find((v) => v.version === left) ?? versions[0];
  const b = versions.find((v) => v.version === right) ?? versions[versions.length - 1];
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} wide title="Compare Scoring Policy Versions"
      description="Comparison never modifies a stored policy or a historical snapshot">
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Left version">
          <select className={input} value={left} onChange={(e) => setLeft(e.target.value)}>{versions.map((v) => <option key={v.version}>{v.version}</option>)}</select>
        </Field>
        <Field label="Right version">
          <select className={input} value={right} onChange={(e) => setRight(e.target.value)}>{versions.map((v) => <option key={v.version}>{v.version}</option>)}</select>
        </Field>
      </div>
      <OpsTable
        caption="Policy version comparison"
        minWidth={520}
        head={["Dimension", `${a.version} weight`, `${b.version} weight`, "State"]}
        rows={dimensions.map((d) => {
          const l = Math.round((a.weights[d.id] ?? 0) * 100);
          const r = Math.round((b.weights[d.id] ?? 0) * 100);
          return [d.name, `${l}%`, `${r}%`, l === r ? "Unchanged" : l < r ? "Increased" : "Decreased"];
        })} />
      <dl className="mt-1.5 rounded border border-slate-200 p-2">
        <Row label={`${a.version} effective`} value={a.effectiveDate} />
        <Row label={`${a.version} reason`} value={a.reason} />
        <Row label={`${b.version} effective`} value={b.effectiveDate} />
        <Row label={`${b.version} reason`} value={b.reason} />
      </dl>
    </Drawer>
  );
}

/* ================================== 24 · executive brief generator ======= */

export function ExecutiveBriefDialog({ open, onClose, onGenerate }: {
  open: boolean;
  onClose: () => void;
  onGenerate: (scopeType: ScopeType, scopeId: string, timeRange: string, sections: string[]) => void;
}) {
  const [scopeType, setScopeType] = useState<ScopeType>("Enterprise");
  const [scopeId, setScopeId] = useState("Enterprise");
  const [timeRange, setTimeRange] = useState(briefTimeRanges[0]);
  const [sections, setSections] = useState<string[]>(briefSections);
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} wide title="Generate Executive Health Brief"
      description="Deterministic local briefing content generated from the current snapshot, exposures and interventions">
      <div className="grid gap-2 sm:grid-cols-3">
        <Field label="Scope">
          <select className={input} value={scopeType} onChange={(e) => setScopeType(e.target.value as ScopeType)}>
            {["Enterprise", "Business Unit", "Knowledge Domain", "Decision Portfolio"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Scope name"><input className={input} value={scopeId} onChange={(e) => setScopeId(e.target.value)} /></Field>
        <Field label="Time Range">
          <select className={input} value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            {briefTimeRanges.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
      </div>
      <div>
        <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Sections</p>
        <div className="mt-0.5 grid gap-0.5 sm:grid-cols-2">
          {briefSections.map((s) => (
            <label key={s} className="flex items-center gap-1 text-[10.5px] text-slate-700">
              <input type="checkbox" checked={sections.includes(s)} onChange={() => setSections(toggleList(sections, s))} />{s}
            </label>
          ))}
        </div>
      </div>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" onClick={() => { onGenerate(scopeType, scopeId, timeRange, sections); onClose(); }}>Generate Brief</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* ================================================= 25 · global search ==== */

export function HealthSearchDialog({
  open, onClose, reviews, alerts, interventions, exposures, risks, reassessments, onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  reviews: CognitiveHealthReview[];
  alerts: CognitiveHealthAlert[];
  interventions: CognitiveHealthIntervention[];
  exposures: CognitiveHealthDecisionExposure[];
  risks: CognitiveHealthRiskAcceptance[];
  reassessments: CognitiveHealthReassessment[];
  onNavigate: (target: string) => void;
}) {
  const [q, setQ] = useState("");
  const hits = useMemo(
    () => searchHealth(q, reviews, alerts, interventions, exposures, risks, reassessments),
    [q, reviews, alerts, interventions, exposures, risks, reassessments],
  );
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} wide title="Search Enterprise Cognitive Health"
      description="Search snapshots, dimensions, signals, business units, team personas, knowledge domains, critical signals, diagnostic paths, decisions, interventions, reviews, alerts, risk acceptances, reassessments and health policy versions">
      <Field label="Query">
        <input className={input} value={q} onChange={(e) => setQ(e.target.value)} autoFocus
          placeholder="Identity Engineering, Commerce, unowned, dependency…" />
      </Field>
      <div className="flex flex-wrap gap-1">
        {searchExamples.map((e) => (
          <button key={e} type="button" onClick={() => setQ(e.split(" ").slice(-2).join(" "))}
            className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            {e}
          </button>
        ))}
      </div>
      <p className="text-[10.5px] text-slate-500">{hits.length} results</p>
      <OpsTable
        caption="Health search results"
        minWidth={880}
        head={["Type", "Signal / Record", "Dimension", "Scope", "Severity", "Owner", "Status", "Action"]}
        rows={hits.slice(0, 80).map((h: HealthSearchHit, i) => [
          <Pill key="t" label={h.type} tone="blue" />, h.record, h.dimension, h.scope,
          <Pill key="s" label={h.severity} tone={chTone(h.severity)} />, h.owner,
          <Pill key="st" label={h.status} tone={chTone(h.status)} />,
          <Button key="a" size="sm" variant="outline" className="h-6 px-1.5 text-[10px]"
            onClick={() => { onNavigate(h.target); onClose(); }}>{h.action}</Button>,
        ])} />
    </Drawer>
  );
}

/* ================================================ 28 · governed export === */

export function HealthExportDialog({
  open, onClose, snapshot, reviews, interventions, exposures, risks, selectedDimensionId, selectedUnit, brief, onExported,
}: {
  open: boolean;
  onClose: () => void;
  snapshot: HealthSnapshotRecord;
  reviews: CognitiveHealthReview[];
  interventions: CognitiveHealthIntervention[];
  exposures: CognitiveHealthDecisionExposure[];
  risks: CognitiveHealthRiskAcceptance[];
  selectedDimensionId: string;
  selectedUnit: string;
  brief: CognitiveHealthExecutiveBrief | null;
  onExported: (msg: string) => void;
}) {
  const [format, setFormat] = useState("CSV");
  const [scope, setScope] = useState("Current Enterprise Health");
  const [options, setOptions] = useState<string[]>(exportOptions.slice(0, 8));
  const rows = useMemo(
    () => buildExportRows(scope, snapshot, reviews, interventions, exposures, risks, selectedDimensionId, selectedUnit, brief),
    [scope, snapshot, reviews, interventions, exposures, risks, selectedDimensionId, selectedUnit, brief],
  );

  const download = () => {
    let content = "";
    let mime = "text/plain";
    let ext = "txt";
    if (format === "CSV") { content = toCsv(rows); mime = "text/csv"; ext = "csv"; }
    else if (format === "JSON") { content = JSON.stringify({ scope, options, echi: snapshot.echi, scoringPolicy: snapshot.scoringPolicyVersion, rows }, null, 2); mime = "application/json"; ext = "json"; }
    else if (format === "YAML") { content = toYaml({ scope, options, echi: snapshot.echi, scoringPolicy: snapshot.scoringPolicyVersion, rows }); mime = "text/yaml"; ext = "yaml"; }
    else if (format === "Executive Health Brief") {
      content = [
        `Enterprise Cognitive Health Brief`, `Scope: ${scope}`,
        brief?.summary ?? `Enterprise Cognitive Health Index ${snapshot.echi} · ${bandFor(snapshot.echi)}`,
        "", ...(brief?.sections ?? []).map((s) => `${s.title}\n${s.body}\n`),
      ].join("\n");
    } else {
      content = [`Enterprise Cognitive Health · ${format}`, `Scope: ${scope}`, `Options: ${options.join(", ")}`,
        `Scoring policy ${snapshot.scoringPolicyVersion} · threshold policy ${snapshot.thresholdPolicyVersion}`, "",
        ...rows.map((r) => Object.entries(r).map(([k, v]) => `${k}: ${v}`).join(" | "))].join("\n");
    }
    try {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `enterprise-cognitive-health-${scope.toLowerCase().replace(/\s+/g, "-")}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      onExported(`${format} export generated for ${scope}`);
    } catch {
      onExported("Export could not be generated in this environment");
    }
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} wide title="Export Enterprise Cognitive Health"
      description="Governed export. Access restricted content is never included and historical snapshots keep their original policy version">
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Format">
          <select className={input} value={format} onChange={(e) => setFormat(e.target.value)}>{exportFormats.map((f) => <option key={f}>{f}</option>)}</select>
        </Field>
        <Field label="Scope">
          <select className={input} value={scope} onChange={(e) => setScope(e.target.value)}>{exportScopes.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
      </div>
      <div>
        <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Options</p>
        <div className="mt-0.5 grid gap-0.5 sm:grid-cols-2">
          {exportOptions.map((o) => (
            <label key={o} className="flex items-center gap-1 text-[10.5px] text-slate-700">
              <input type="checkbox" checked={options.includes(o)} onChange={() => setOptions(toggleList(options, o))} />{o}
            </label>
          ))}
        </div>
      </div>
      <p className="text-[10.5px] text-slate-500">{rows.length} records in the selected scope</p>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" onClick={download}>Generate Export</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* ============================================ policy preview dialog ====== */

export function PolicyPreviewDialog({ open, onClose, weights }: {
  open: boolean; onClose: () => void; weights: Record<string, number>;
}) {
  const preview = useMemo(() => {
    const scores = Object.fromEntries(dimensions.map((d) => [d.id, d.score]));
    const raw = dimensions.reduce((a, d) => a + d.score * (weights[d.id] ?? 0), 0);
    return { scores, echi: Math.round(raw) };
  }, [weights]);
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} title="Preview Scoring Policy"
      description="Preview recomputes the current index only. Stored snapshots are not modified">
      <div className="flex items-center gap-2">
        <Pill label={`Preview index ${preview.echi}`} tone="blue" />
        <Pill label={bandFor(preview.echi)} tone={chTone(bandFor(preview.echi))} />
        <Pill label={`Approved policy ${currentPolicy.version}`} tone="slate" />
      </div>
      <OpsTable
        caption="Policy preview"
        minWidth={420}
        head={["Dimension", "Score", "Weight", "Contribution"]}
        rows={dimensions.map((d) => [
          d.name, d.score, `${Math.round((weights[d.id] ?? 0) * 100)}%`,
          (d.score * (weights[d.id] ?? 0)).toFixed(2),
        ])} />
    </Drawer>
  );
}

export { scenarioComputation as previewScenario };
export type { HealthControls };
