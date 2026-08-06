/** Decision Intelligence — Prompt 2 dialogs, wizards and drawers. */

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Drawer, Pill, Row, type Tone } from "../persona-studio/primitives";
import { SimpleTable } from "./ops-panels";
import { alternativesFor, diPersonas, diTone, evidenceFor } from "./data";
import {
  alternativeCode, analysisScopeOptions, approvalDecisions, buildExportRows, challengeTypes,
  conditionCategories, conditionLibrary, contextRuleOptions, escalationReasons, evidenceTypes,
  executionSteps, exportFormats, exportOptions, exportScopes, inputPackages, personaNameById,
  qualityControlDefaults, searchEverything, searchExamples, startSteps, suggestedAlternatives,
  toCsv, toYaml, commentRequired, reviewActions,
  type DecisionApproval, type DecisionDissent, type DecisionRecord, type DecisionReview,
  type DecisionScenarioState, type DecisionScope, type RecordedDecisionCondition,
  type ReviewDecision, type SearchHit,
} from "./ops-data";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-0.5 text-[10.5px] text-slate-600">
    <span className="font-medium uppercase tracking-wide text-slate-500">{label}</span>
    {children}
  </label>
);

const input = "h-7 rounded border border-slate-200 px-1.5 text-[11px] text-slate-800 focus:border-blue-400 focus:outline-none";
const area = "min-h-[64px] rounded border border-slate-200 p-1.5 text-[11px] text-slate-800 focus:border-blue-400 focus:outline-none";

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/* ================================================ start decision analysis == */

export function StartDecisionAnalysisDialog({
  open, onClose, onComplete,
}: { open: boolean; onClose: () => void; onComplete: (summary: string) => void }) {
  const [step, setStep] = useState(0);
  const [pkg, setPkg] = useState("CTA 3001");
  const [search, setSearch] = useState("");
  const [question, setQuestion] = useState("Should automated payment retries increase from two to three, and under what rollout conditions?");
  const [owner, setOwner] = useState("Commerce Architecture Council");
  const [deadline, setDeadline] = useState("Before next commerce release window");
  const [decisionType, setDecisionType] = useState("Policy Change");
  const [priority, setPriority] = useState("High");
  const [scopeText, setScopeText] = useState("Retry attempts, traffic exposure, rollout method, evidence, rollback, approvals");
  const [outText, setOutText] = useState("Provider contract changes, fraud model redesign, checkout UI redesign");
  const [included, setIncluded] = useState<string[]>(suggestedAlternatives.map((a) => a.id));
  const [extra, setExtra] = useState<string[]>([]);
  const [scope, setScope] = useState<string[]>(analysisScopeOptions);
  const [rules, setRules] = useState<string[]>(contextRuleOptions);
  const [quality, setQuality] = useState(qualityControlDefaults);
  const [running, setRunning] = useState(-1);

  const filtered = inputPackages.filter((p) => [p.id, p.name, p.team].join(" ").toLowerCase().includes(search.trim().toLowerCase()));
  const totalAlternatives = included.length + extra.length;

  const run = () => {
    setRunning(0);
    executionSteps.forEach((_, i) => window.setTimeout(() => setRunning(i), i * 170));
    window.setTimeout(() => setRunning(executionSteps.length - 1), executionSteps.length * 170);
  };

  const finish = () => {
    onComplete(`Decision analysis started from ${pkg} with ${totalAlternatives} alternatives and ${scope.length} scope dimensions`);
    setStep(0); setRunning(-1);
  };

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) { onClose(); setStep(0); setRunning(-1); } }} wide
      title="Start Decision Analysis" description={`Step ${step + 1} of ${startSteps.length} · ${startSteps[step]}`}>
      <Progress value={((step + 1) / startSteps.length) * 100} className="h-1" />

      <div className="mt-2 space-y-2">
        {step === 0 && (
          <>
            <Field label="Search packages">
              <input className={input} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Package, work item or team" />
            </Field>
            <SimpleTable head={["Select", "Package", "Work Item", "Team", "Personas", "Completed"]}
              rows={filtered.map((p) => [
                <input key="r" type="radio" name="pkg" aria-label={`Select ${p.id}`} checked={pkg === p.id} onChange={() => setPkg(p.id)} />,
                p.id, p.name, p.team, p.personas, p.completedAt,
              ])} />
            <p className="text-[10.5px] text-slate-500">Cross Team Decision Context Packages and recent cross team analyses are both listed.</p>
          </>
        )}

        {step === 1 && (
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label="Decision Question"><textarea className={area} value={question} onChange={(e) => setQuestion(e.target.value)} /></Field></div>
            <Field label="Decision Owner"><input className={input} value={owner} onChange={(e) => setOwner(e.target.value)} /></Field>
            <Field label="Decision Deadline"><input className={input} value={deadline} onChange={(e) => setDeadline(e.target.value)} /></Field>
            <Field label="Decision Type">
              <select className={input} value={decisionType} onChange={(e) => setDecisionType(e.target.value)}>
                {["Policy Change", "Capacity Change", "Migration", "Configuration Change", "Observability Investment"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className={input} value={priority} onChange={(e) => setPriority(e.target.value)}>
                {["Critical", "High", "Medium", "Low"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Scope"><textarea className={area} value={scopeText} onChange={(e) => setScopeText(e.target.value)} /></Field>
            <Field label="Out of Scope"><textarea className={area} value={outText} onChange={(e) => setOutText(e.target.value)} /></Field>
          </div>
        )}

        {step === 2 && (
          <>
            <SimpleTable head={["Include", "Code", "Alternative", "Description"]}
              rows={suggestedAlternatives.map((a) => [
                <input key="c" type="checkbox" aria-label={`Include ${a.name}`} checked={included.includes(a.id)} onChange={() => setIncluded(toggle(included, a.id))} />,
                a.code, a.name, a.description,
              ])} />
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setExtra([...extra, `Added alternative ${extra.length + 1}`])}>Add Alternative</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setExtra([...extra, `Clone of ${suggestedAlternatives[1].name}`])}>Clone Alternative</Button>
            </div>
            {extra.length > 0 && <SimpleTable head={["Added Alternative"]} rows={extra.map((e) => [e])} />}
          </>
        )}

        {step === 3 && (
          <div className="flex flex-wrap gap-1.5">
            {analysisScopeOptions.map((o) => (
              <label key={o} className="flex items-center gap-1 rounded border border-slate-200 px-1.5 py-0.5 text-[10.5px] text-slate-700">
                <input type="checkbox" checked={scope.includes(o)} onChange={() => setScope(toggle(scope, o))} />{o}
              </label>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-1">
            {contextRuleOptions.map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                <input type="checkbox" checked={rules.includes(o)} onChange={() => setRules(toggle(rules, o))} />{o}
              </label>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Minimum Evidence Coverage %"><input type="number" className={input} value={quality.minimumEvidenceCoverage} onChange={(e) => setQuality({ ...quality, minimumEvidenceCoverage: Number(e.target.value) })} /></Field>
            <Field label="Minimum Persona Coverage %"><input type="number" className={input} value={quality.minimumPersonaCoverage} onChange={(e) => setQuality({ ...quality, minimumPersonaCoverage: Number(e.target.value) })} /></Field>
            <Field label="Minimum Dependency Coverage %"><input type="number" className={input} value={quality.minimumDependencyCoverage} onChange={(e) => setQuality({ ...quality, minimumDependencyCoverage: Number(e.target.value) })} /></Field>
            <Field label="Human Review Threshold %"><input type="number" className={input} value={quality.humanReviewThreshold} onChange={(e) => setQuality({ ...quality, humanReviewThreshold: Number(e.target.value) })} /></Field>
            <Field label="Material Risk Threshold">
              <select className={input} value={quality.materialRiskThreshold} onChange={(e) => setQuality({ ...quality, materialRiskThreshold: e.target.value })}>
                {["Medium", "Medium High", "High", "Critical"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Recommendation Confidence Target %"><input type="number" className={input} value={quality.recommendationConfidenceTarget} onChange={(e) => setQuality({ ...quality, recommendationConfidenceTarget: Number(e.target.value) })} /></Field>
          </div>
        )}

        {step === 6 && (
          <dl>
            <Row label="Decision" value={question} />
            <Row label="Alternatives" value={`${totalAlternatives} alternatives`} />
            <Row label="Personas" value={`${diPersonas.length} Team Personas`} />
            <Row label="Conditions" value="9 enterprise conditions in scope" />
            <Row label="Dependencies" value="4 shared dependencies" />
            <Row label="Evidence" value={`${evidenceFor("DIA 5001").filter((e) => e.required).length} required evidence records`} />
            <Row label="Estimated Tradeoffs" value="6 to 8 material tradeoffs" />
            <Row label="Estimated Duration" value="约 4 minutes" />
          </dl>
        )}

        {step === 7 && (
          <>
            <ol className="space-y-0.5">
              {executionSteps.map((s, i) => (
                <li key={s} className="flex items-center gap-1.5 text-[11px]">
                  <Pill label={running >= i ? (i === executionSteps.length - 1 && running >= executionSteps.length - 1 ? "Complete" : "Done") : "Pending"}
                    tone={running >= i ? "green" : "slate"} />
                  <span className={running >= i ? "text-slate-800" : "text-slate-400"}>{s}</span>
                </li>
              ))}
            </ol>
            {running < 0 && <Button size="sm" className="h-7 text-[11px]" onClick={run}>Run Decision Analysis</Button>}
            {running >= executionSteps.length - 1 && (
              <dl className="rounded border border-emerald-200 bg-emerald-50/50 p-2">
                <Row label="Alternatives Evaluated" value={String(totalAlternatives)} />
                <Row label="Personas Considered" value={String(diPersonas.length)} />
                <Row label="Conditions Applied" value="9" />
                <Row label="Tradeoffs Identified" value="7" />
                <Row label="Evidence Gaps" value="2" />
                <Row label="Recommendation" value={<Pill label="Conditional Proceed · Option B" tone="blue" />} />
                <Row label="Confidence" value="94%" />
              </dl>
            )}
          </>
        )}
      </div>

      <div className="mt-3 flex gap-1.5">
        <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
        {step < startSteps.length - 1
          ? <Button size="sm" className="h-7 text-[11px]" onClick={() => setStep((s) => s + 1)}>Next</Button>
          : <Button size="sm" className="h-7 text-[11px]" disabled={running < executionSteps.length - 1} onClick={finish}>Open Decision Context</Button>}
        <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* ============================================================= scope edit == */

export function ScopeEditDialog({
  open, scope, onClose, onSave,
}: { open: boolean; scope: DecisionScope; onClose: () => void; onSave: (s: DecisionScope) => void }) {
  const [draft, setDraft] = useState(scope);
  const list = (v: string) => v.split(",").map((x) => x.trim()).filter(Boolean);
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} wide title="Edit Decision Scope"
      description="Changing scope recalculates personas, conditions, alternatives, tradeoffs, evidence and the recommendation">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="sm:col-span-2"><Field label="Question"><textarea className={area} value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} /></Field></div>
        <Field label="Owner"><input className={input} value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} /></Field>
        <Field label="Deadline"><input className={input} value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} /></Field>
        <div className="sm:col-span-2"><Field label="Business Objective"><textarea className={area} value={draft.businessObjective} onChange={(e) => setDraft({ ...draft, businessObjective: e.target.value })} /></Field></div>
        <Field label="In Scope, comma separated"><textarea className={area} value={draft.inScope.join(", ")} onChange={(e) => setDraft({ ...draft, inScope: list(e.target.value) })} /></Field>
        <Field label="Out of Scope, comma separated"><textarea className={area} value={draft.outOfScope.join(", ")} onChange={(e) => setDraft({ ...draft, outOfScope: list(e.target.value) })} /></Field>
        <Field label="Decision Boundaries"><textarea className={area} value={draft.boundaries.join(", ")} onChange={(e) => setDraft({ ...draft, boundaries: list(e.target.value) })} /></Field>
        <Field label="Assumptions"><textarea className={area} value={draft.assumptions.join(", ")} onChange={(e) => setDraft({ ...draft, assumptions: list(e.target.value) })} /></Field>
      </div>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" onClick={() => onSave(draft)}>Save Scope</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* ==================================================== refine alternative == */

export function RefineAlternativeDialog({
  open, onClose, onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (r: { name: string; derivedFromId: string; changes: string[]; trafficCap: number; observationWindow: "6 Hours" | "24 Hours" | "48 Hours" | "72 Hours"; requiredEvidence: string[] }) => void;
}) {
  const [from, setFrom] = useState("ALT 5001 B");
  const [name, setName] = useState("Three Retries, Maximum 10% Traffic Until Fraud Validation");
  const [cap, setCap] = useState(10);
  const [window, setWindow] = useState<"6 Hours" | "24 Hours" | "48 Hours" | "72 Hours">("24 Hours");
  const [changes, setChanges] = useState("Cap exposure at 10%, Require 24 hour observation, Require fraud analysis before expansion");
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} title="Create Refined Alternative"
      description="The original alternative is preserved. The refinement is added as a new derived alternative">
      <Field label="Derived From">
        <select className={input} value={from} onChange={(e) => setFrom(e.target.value)}>
          {alternativesFor("DIA 5001").map((a) => <option key={a.id} value={a.id}>{a.code} · {a.name}</option>)}
        </select>
      </Field>
      <Field label="Name"><input className={input} value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Traffic Cap %"><input type="number" className={input} value={cap} onChange={(e) => setCap(Number(e.target.value))} /></Field>
      <Field label="Observation Window">
        <select className={input} value={window} onChange={(e) => setWindow(e.target.value as typeof window)}>
          {["6 Hours", "24 Hours", "48 Hours", "72 Hours"].map((w) => <option key={w}>{w}</option>)}
        </select>
      </Field>
      <Field label="Changes, comma separated"><textarea className={area} value={changes} onChange={(e) => setChanges(e.target.value)} /></Field>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px]"
          onClick={() => onCreate({ name, derivedFromId: from, changes: changes.split(",").map((c) => c.trim()).filter(Boolean), trafficCap: cap, observationWindow: window, requiredEvidence: ["EVD 8"] })}>
          Create and Compare
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* ======================================================= evidence workflow = */

export function EvidenceActionDialog({
  open, onClose, onSubmit,
}: { open: boolean; onClose: () => void; onSubmit: (action: string, type: string, owner: string, note: string) => void }) {
  const [action, setAction] = useState("Request Evidence");
  const [type, setType] = useState(evidenceTypes[1]);
  const [owner, setOwner] = useState("Fraud Engineering");
  const [note, setNote] = useState("");
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} title="Evidence Remediation"
      description="Evidence changes update coverage, alternative confidence, tradeoffs and recommendation confidence">
      <Field label="Action">
        <select className={input} value={action} onChange={(e) => setAction(e.target.value)}>
          {["Request Evidence", "Add Evidence", "Link Existing Evidence", "Mark Not Applicable", "Open Evidence"].map((a) => <option key={a}>{a}</option>)}
        </select>
      </Field>
      <Field label="Evidence Type">
        <select className={input} value={type} onChange={(e) => setType(e.target.value)}>{evidenceTypes.map((t) => <option key={t}>{t}</option>)}</select>
      </Field>
      <Field label="Owner"><input className={input} value={owner} onChange={(e) => setOwner(e.target.value)} /></Field>
      <Field label="Note"><textarea className={area} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <p className="text-[10.5px] text-slate-500">
        Adding evidence never changes the recommendation on its own. The deterministic decision rules must justify the change.
      </p>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" onClick={() => onSubmit(action, type, owner, note)}>Submit</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* ============================================================ review action = */

export function ReviewActionDialog({
  open, review, onClose, onSubmit,
}: {
  open: boolean;
  review: DecisionReview | null;
  onClose: () => void;
  onSubmit: (decision: ReviewDecision, comments: string, condition: string) => void;
}) {
  const [decision, setDecision] = useState<ReviewDecision>("Agree with Recommendation");
  const [comments, setComments] = useState("");
  const [condition, setCondition] = useState("");
  const needsComment = commentRequired(decision);
  const blocked = needsComment && comments.trim().length < 8;
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} wide title="Reviewer Position"
      description={review ? `${review.id} · ${review.reviewType} · ${review.reviewer}` : ""}>
      <Field label="Reviewer Action">
        <select className={input} value={decision} onChange={(e) => setDecision(e.target.value as ReviewDecision)}>
          {reviewActions.map((a) => <option key={a}>{a}</option>)}
        </select>
      </Field>
      {decision === "Add Condition" && (
        <Field label="Condition">
          <select className={input} value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="">Select a condition</option>
            {conditionLibrary.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      )}
      <Field label={needsComment ? "Comments (required)" : "Comments"}>
        <textarea className={area} value={comments} onChange={(e) => setComments(e.target.value)}
          aria-required={needsComment} placeholder={needsComment ? "Explain the disagreement, challenge, condition or override" : "Optional"} />
      </Field>
      {blocked && <p role="alert" className="text-[10.5px] text-red-700">A comment is required for disagreement, challenges, added conditions and overrides.</p>}
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" disabled={blocked} onClick={() => onSubmit(decision, comments, condition)}>Record Position</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* ================================================================ approval = */

export function ApprovalDialog({
  open, approval, onClose, onSubmit,
}: {
  open: boolean;
  approval: DecisionApproval | null;
  onClose: () => void;
  onSubmit: (decision: string, conditions: string[], comments: string) => void;
}) {
  const [decision, setDecision] = useState<string>("Approve with Conditions");
  const [conditions, setConditions] = useState<string[]>(conditionLibrary.slice(0, 4));
  const [comments, setComments] = useState("");
  const conditional = decision === "Approve with Conditions";
  const blocked = (conditional && conditions.length === 0) || (["Reject", "Request Changes", "Escalate"].includes(decision) && comments.trim().length < 8);
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} wide title="Record Approval"
      description={approval ? `${approval.approvalStage} · ${approval.approver} · ${approval.approverRole}` : ""}>
      <Field label="Approval Decision">
        <select className={input} value={decision} onChange={(e) => setDecision(e.target.value)}>
          {approvalDecisions.map((d) => <option key={d}>{d}</option>)}
        </select>
      </Field>
      {conditional && (
        <div>
          <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Conditions</p>
          <div className="mt-0.5 grid gap-0.5 sm:grid-cols-2">
            {conditionLibrary.map((c) => (
              <label key={c} className="flex items-start gap-1 text-[10.5px] text-slate-700">
                <input type="checkbox" checked={conditions.includes(c)} onChange={() => setConditions(toggle(conditions, c))} />{c}
              </label>
            ))}
          </div>
        </div>
      )}
      <Field label="Comments"><textarea className={area} value={comments} onChange={(e) => setComments(e.target.value)} /></Field>
      {blocked && <p role="alert" className="text-[10.5px] text-red-700">Conditional approval requires at least one condition. Rejection, change requests and escalation require a comment.</p>}
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" disabled={blocked} onClick={() => onSubmit(decision, conditions, comments)}>Submit</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* ================================================================= dissent = */

export function DissentDialog({
  open, onClose, onSubmit,
}: { open: boolean; onClose: () => void; onSubmit: (d: Omit<DecisionDissent, "id" | "evaluationId" | "createdAt" | "status">) => void }) {
  const [personaId, setPersonaId] = useState("PER 4103");
  const [position, setPosition] = useState("Prefer maximum 10% traffic until fraud analysis completed");
  const [reason, setReason] = useState("Current evidence is insufficient to estimate incremental fraud exposure");
  const [preferred, setPreferred] = useState("ALT 5001 B");
  const [changeCondition, setChangeCondition] = useState("Fraud Loss Analysis shows no material increase");
  const [severity, setSeverity] = useState<"Critical" | "High" | "Medium" | "Low">("High");
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} title="Record Dissent"
      description="Dissent is preserved before and after the decision is recorded">
      <Field label="Team Persona">
        <select className={input} value={personaId} onChange={(e) => setPersonaId(e.target.value)}>
          {diPersonas.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>
      <Field label="Position"><textarea className={area} value={position} onChange={(e) => setPosition(e.target.value)} /></Field>
      <Field label="Reason"><textarea className={area} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      <Field label="Alternative Preferred">
        <select className={input} value={preferred} onChange={(e) => setPreferred(e.target.value)}>
          {alternativesFor("DIA 5001").map((a) => <option key={a.id} value={a.id}>{a.code} · {a.name}</option>)}
        </select>
      </Field>
      <Field label="Condition That Would Change Position"><textarea className={area} value={changeCondition} onChange={(e) => setChangeCondition(e.target.value)} /></Field>
      <Field label="Severity">
        <select className={input} value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)}>
          {["Critical", "High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" disabled={reason.trim().length < 8}
          onClick={() => onSubmit({
            personaId, team: personaNameById(personaId), position, reason,
            evidenceReferenceIds: ["EVD 8"], preferredAlternativeId: preferred, changeCondition, severity,
          })}>Record Dissent</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* =============================================================== challenge = */

export function ChallengeDialog({
  open, onClose, onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (c: { challenger: string; role: string; challengeType: string; description: string; proposedChange: string; evidence: string; impact: "Recalculate Recommendation" | "Human Review Only" | "Escalate" }) => void;
}) {
  const [challenger, setChallenger] = useState("Fraud Engineering Lead");
  const [role, setRole] = useState("Risk Owner");
  const [challengeType, setChallengeType] = useState(challengeTypes[0]);
  const [description, setDescription] = useState("");
  const [proposedChange, setProposedChange] = useState("");
  const [evidence, setEvidence] = useState("EVD 8 Fraud Loss Analysis");
  const [impact, setImpact] = useState<"Recalculate Recommendation" | "Human Review Only" | "Escalate">("Human Review Only");
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} title="Challenge Recommendation"
      description="Recommendation history is preserved. A challenge never silently rewrites the recommendation">
      <Field label="Challenger"><input className={input} value={challenger} onChange={(e) => setChallenger(e.target.value)} /></Field>
      <Field label="Role"><input className={input} value={role} onChange={(e) => setRole(e.target.value)} /></Field>
      <Field label="Challenge Type">
        <select className={input} value={challengeType} onChange={(e) => setChallengeType(e.target.value)}>{challengeTypes.map((t) => <option key={t}>{t}</option>)}</select>
      </Field>
      <Field label="Description"><textarea className={area} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
      <Field label="Proposed Change"><textarea className={area} value={proposedChange} onChange={(e) => setProposedChange(e.target.value)} /></Field>
      <Field label="Evidence"><input className={input} value={evidence} onChange={(e) => setEvidence(e.target.value)} /></Field>
      <Field label="Impact">
        <select className={input} value={impact} onChange={(e) => setImpact(e.target.value as typeof impact)}>
          {["Recalculate Recommendation", "Human Review Only", "Escalate"].map((i) => <option key={i}>{i}</option>)}
        </select>
      </Field>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" disabled={description.trim().length < 8}
          onClick={() => onSubmit({ challenger, role, challengeType, description, proposedChange, evidence, impact })}>Submit Challenge</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* =============================================================== escalation = */

export function EscalationDialog({
  open, onClose, onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: { issueType: string; title: string; description: string; severity: "Critical" | "High" | "Medium"; recommendedLevel: string; owner: string; dueDate: string }) => void;
}) {
  const [issueType, setIssueType] = useState(escalationReasons[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"Critical" | "High" | "Medium">("High");
  const [level, setLevel] = useState("Commerce Architecture Council");
  const [owner, setOwner] = useState("Decision Facilitation");
  const [due, setDue] = useState("2026-08-10");
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} title="Create Decision Escalation"
      description="Escalation records the tradeoff that could not be resolved at the current level">
      <Field label="Reason">
        <select className={input} value={issueType} onChange={(e) => setIssueType(e.target.value)}>{escalationReasons.map((r) => <option key={r}>{r}</option>)}</select>
      </Field>
      <Field label="Issue"><input className={input} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <Field label="Description"><textarea className={area} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
      <Field label="Severity">
        <select className={input} value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)}>
          {["Critical", "High", "Medium"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Recommended Escalation Level">
        <select className={input} value={level} onChange={(e) => setLevel(e.target.value)}>
          {["Commerce Architecture Council", "Platform Governance Board", "Risk Committee", "Executive Sponsor"].map((l) => <option key={l}>{l}</option>)}
        </select>
      </Field>
      <Field label="Owner"><input className={input} value={owner} onChange={(e) => setOwner(e.target.value)} /></Field>
      <Field label="Due"><input className={input} value={due} onChange={(e) => setDue(e.target.value)} /></Field>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" disabled={title.trim().length < 4}
          onClick={() => onSubmit({ issueType, title, description, severity, recommendedLevel: level, owner, dueDate: due })}>Create Escalation</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* ========================================================== record decision = */

const recordSteps = [
  "Decision", "Select Outcome", "Select Alternative", "Decision Rationale", "Conditions",
  "Expected Outcomes", "Approvals", "Dissent", "Review", "Record",
];

export function RecordDecisionDialog({
  open, onClose, onRecord, state, approvals, dissents, defaultConditions, existing,
}: {
  open: boolean;
  onClose: () => void;
  onRecord: (r: { decision: string; selectedAlternativeId: string; rationale: string; conditions: RecordedDecisionCondition[]; confidence: number }) => void;
  state: DecisionScenarioState;
  approvals: DecisionApproval[];
  dissents: DecisionDissent[];
  defaultConditions: RecordedDecisionCondition[];
  existing: DecisionRecord | null;
}) {
  const [step, setStep] = useState(0);
  const [outcome, setOutcome] = useState("Approve Alternative with Conditions");
  const [alt, setAlt] = useState("ALT 5001 B");
  const [rationale, setRationale] = useState(existing?.decisionRationale ?? "");
  const [conditionIds, setConditionIds] = useState<string[]>(defaultConditions.map((c) => c.id));
  const [confidence, setConfidence] = useState(94);
  const rationaleMissing = rationale.trim().length < 20;
  const outcomes = ["Approve Alternative", "Approve Alternative with Conditions", "Defer", "Reject Change", "Request New Alternative", "Escalate"];
  const altOptions = [...alternativesFor("DIA 5001").map((a) => ({ id: a.id, label: `${a.code} · ${a.name}` })), { id: "ALT 5001 B2", label: "Option B2 · Three Retries, Maximum 10% Traffic Until Fraud Validation" }];

  const decisionLabel = outcome === "Approve Alternative with Conditions"
    ? `Approve ${alternativeCode(alt)} with Conditions`
    : `${outcome} · ${alternativeCode(alt)}`;

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) { onClose(); setStep(0); } }} wide title="Record Decision"
      description={`Step ${step + 1} of ${recordSteps.length} · ${recordSteps[step]}`}>
      <Progress value={((step + 1) / recordSteps.length) * 100} className="h-1" />
      <div className="mt-2 space-y-2">
        {step === 0 && (
          <dl>
            <Row label="Decision Question" value="Should automated payment retries increase from two to three, and under what rollout conditions?" />
            <Row label="Recommendation" value={<Pill label={`${state.posture} · ${alternativeCode(state.preferredAlternativeId)}`} tone={diTone(state.posture) as Tone} />} />
            <Row label="Recommendation Confidence" value={`${state.confidence}%`} />
            <Row label="Evidence Coverage" value={`${state.evidenceCoverage}%`} />
          </dl>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-1">
            {outcomes.map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                <input type="radio" name="outcome" checked={outcome === o} onChange={() => setOutcome(o)} />{o}
              </label>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-1">
            {altOptions.map((a) => (
              <label key={a.id} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                <input type="radio" name="alt" checked={alt === a.id} onChange={() => setAlt(a.id)} />{a.label}
              </label>
            ))}
          </div>
        )}
        {step === 3 && (
          <>
            <Field label="Decision Rationale (required)">
              <textarea className={area} rows={5} value={rationale} onChange={(e) => setRationale(e.target.value)} aria-required
                placeholder="Explain why this alternative was chosen and what was rejected" />
            </Field>
            {rationaleMissing && <p role="alert" className="text-[10.5px] text-red-700">A decision rationale is required before recording.</p>}
          </>
        )}
        {step === 4 && (
          <div className="space-y-1">
            {conditionCategories.map((cat) => (
              <div key={cat}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{cat}</p>
                {defaultConditions.filter((c) => c.category === cat).map((c) => (
                  <label key={c.id} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                    <input type="checkbox" checked={conditionIds.includes(c.id)} onChange={() => setConditionIds(toggle(conditionIds, c.id))} />{c.text}
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}
        {step === 5 && (
          <SimpleTable head={["Type", "Metric", "Expected Value", "Observation Window", "Owner"]}
            rows={["Customer", "Business", "Technical", "Operational", "Risk"].flatMap((t) =>
              defaultOutcomeRows(t))} />
        )}
        {step === 6 && (
          <SimpleTable head={["Stage", "Approver", "Status", "Conditions"]}
            rows={approvals.map((a) => [a.approvalStage, a.approver, <Pill key="s" label={a.status} tone={diTone(a.status) as Tone} />, a.conditions.join(" · ") || "None"])} />
        )}
        {step === 7 && (
          <SimpleTable head={["Team", "Position", "Reason", "Severity", "Status"]}
            rows={dissents.map((d) => [d.team, d.position, d.reason, d.severity, d.status])} />
        )}
        {step === 8 && (
          <dl>
            <Row label="Decision" value={decisionLabel} />
            <Row label="Alternative" value={alternativeCode(alt)} />
            <Row label="Rationale" value={rationale || "Not provided"} />
            <Row label="Conditions" value={`${conditionIds.length} conditions`} />
            <Row label="Approvals" value={`${approvals.filter((a) => a.status.startsWith("Approved")).length} recorded`} />
            <Row label="Dissent" value={`${dissents.length} preserved`} />
            <Row label="Recommendation preserved separately" value={`${state.posture} · ${state.confidence}%`} />
          </dl>
        )}
        {step === 9 && (
          <>
            <Field label="Decision Confidence %"><input type="number" className={input} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} /></Field>
            <p className="text-[10.5px] text-slate-500">
              Recording creates an immutable Decision Record Version and a Decision Context Snapshot. Prior analysis is never overwritten.
            </p>
          </>
        )}
      </div>
      <div className="mt-3 flex gap-1.5">
        <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
        {step < recordSteps.length - 1
          ? <Button size="sm" className="h-7 text-[11px]" disabled={step === 3 && rationaleMissing} onClick={() => setStep((s) => s + 1)}>Next</Button>
          : <Button size="sm" className="h-7 text-[11px]" disabled={rationaleMissing}
            onClick={() => { onRecord({ decision: decisionLabel, selectedAlternativeId: alt, rationale, conditions: defaultConditions.filter((c) => conditionIds.includes(c.id)), confidence }); setStep(0); }}>
            Record Decision
          </Button>}
        <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

function defaultOutcomeRows(type: string): React.ReactNode[][] {
  const map: Record<string, [string, string, string, string][]> = {
    Customer: [["Checkout Completion", "+1.0% to +2.0%", "Per rollout stage", "Checkout Engineering"]],
    Business: [["Fraud Loss", "No material increase", "Per rollout stage", "Fraud Engineering"]],
    Technical: [["Availability", "At or above 99.95%", "Rolling 24 hours", "Site Reliability Engineering"], ["P95 Latency", "Below 250 ms", "Rolling 1 hour", "Checkout Engineering"]],
    Operational: [["Dependency Health", "No sustained saturation", "Continuous", "Site Reliability Engineering"], ["Rollback", "Available within five minutes", "Per deployment", "Release Governance"]],
    Risk: [["Duplicate Authorization", "At or below 0.2%", "Continuous", "Payments Platform"]],
  };
  return (map[type] ?? []).map((r) => [type, r[0], r[1], r[2], r[3]]);
}

/* ============================================================ global search = */

export function GlobalSearchDialog({
  open, onClose, reviews, approvals, dissents, record, onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  reviews: DecisionReview[];
  approvals: DecisionApproval[];
  dissents: DecisionDissent[];
  record: DecisionRecord | null;
  onNavigate: (target: string) => void;
}) {
  const [q, setQ] = useState("");
  const hits = useMemo(() => searchEverything(q, reviews, approvals, dissents, record), [q, reviews, approvals, dissents, record]);
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} wide title="Search Decision Intelligence"
      description="Search evaluations, questions, alternatives, personas, conditions, dependencies, tradeoffs, risks, controls, evidence, recommendations, approvals, dissent, decision records, expected outcomes, escalations and versions">
      <Field label="Query"><input className={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Fraud Engineering, Release Governance, dissent, Payments…" autoFocus /></Field>
      <div className="flex flex-wrap gap-1">
        {searchExamples.map((e) => (
          <button key={e} type="button" onClick={() => setQ(e.split(" ").slice(-2).join(" "))}
            className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            {e}
          </button>
        ))}
      </div>
      <p className="text-[10.5px] text-slate-500">{hits.length} results</p>
      <SimpleTable head={["Type", "Decision", "Alternative", "Issue", "Owner", "Status", "Confidence", "Action"]}
        rows={hits.map((h: SearchHit, i) => [
          <Pill key="t" label={h.type} tone="blue" />, h.decision, h.alternative, h.issue, h.owner,
          <Pill key="s" label={h.status} tone={diTone(h.status) as Tone} />, h.confidence,
          <Button key="a" size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => { onNavigate(h.target); onClose(); }}>{h.action}</Button>,
        ])} />
    </Drawer>
  );
}

/* ================================================================== export = */

export function ExportDialog({
  open, onClose, state, reviews, approvals, dissents, record, onExported,
}: {
  open: boolean;
  onClose: () => void;
  state: DecisionScenarioState;
  reviews: DecisionReview[];
  approvals: DecisionApproval[];
  dissents: DecisionDissent[];
  record: DecisionRecord | null;
  onExported: (msg: string) => void;
}) {
  const [format, setFormat] = useState("CSV");
  const [scope, setScope] = useState("Current Decision");
  const [options, setOptions] = useState<string[]>(exportOptions.slice(0, 8));
  const rows = useMemo(() => buildExportRows(scope, state, reviews, approvals, dissents, record), [scope, state, reviews, approvals, dissents, record]);

  const download = () => {
    let content = "";
    let mime = "text/plain";
    let ext = "txt";
    if (format === "CSV") { content = toCsv(rows); mime = "text/csv"; ext = "csv"; }
    else if (format === "JSON") { content = JSON.stringify({ scope, options, rows }, null, 2); mime = "application/json"; ext = "json"; }
    else if (format === "YAML") { content = toYaml({ scope, options, rows }); mime = "text/yaml"; ext = "yaml"; }
    else {
      content = [`Decision Intelligence · ${format}`, `Scope: ${scope}`, `Options: ${options.join(", ")}`, "",
        ...rows.map((r) => Object.entries(r).map(([k, v]) => `${k}: ${v}`).join(" | "))].join("\n");
      ext = "txt";
    }
    try {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `decision-intelligence-${scope.toLowerCase().replace(/\s+/g, "-")}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      onExported(`${format} export generated for ${scope}`);
    } catch {
      onExported("Export could not be generated in this environment");
    }
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} wide title="Export Decision Intelligence"
      description="Governed export of decision context. Access restricted content is never included">
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
              <input type="checkbox" checked={options.includes(o)} onChange={() => setOptions(toggle(options, o))} />{o}
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
