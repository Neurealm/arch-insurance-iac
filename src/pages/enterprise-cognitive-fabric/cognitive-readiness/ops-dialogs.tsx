/**
 * Cognitive Readiness Assessment — Prompt 2 dialogs, drawers and overlays.
 *
 * Clarification wizard, evidence request, evidence addition, policy binding,
 * assumption acceptance, contradiction resolution, exception, override,
 * reassessment, routing preflight, global search, export and demo story.
 */

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Drawer, Pill, Row } from "../persona-studio/primitives";
import { tone } from "./panels";
import { MiniBtn } from "./ops-panels";
import { ambiguities, assumptions, contradictions, type CognitiveReadinessGate } from "./data";
import {
  clarificationAssignees, clarificationImpacts, clarificationResponseTypes, clarificationTopics,
  demoStorySteps, evidenceTypes, exportFormats, exportOptions, exportScopes, policyVariables,
  protectedOverrideItems, reviewTypes,
  type CognitiveReadinessRemediation, type CognitiveReadinessReview,
} from "./ops-data";
import { reassessmentScopes, type RoutingValidation, type SearchResult } from "./ops-engine";

/* -------------------------------------------------------------- form bits -- */

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-600">{label}</span>
      <div className="mt-0.5">{children}</div>
      {hint && <p className="mt-0.5 text-[10px] text-slate-500">{hint}</p>}
    </label>
  );
}

const inputCls = "w-full rounded-md border border-slate-200 px-2 py-1 text-[11.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

export function TextInput(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn(inputCls, p.className)} />;
}
export function TextArea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...p} className={cn(inputCls, p.className)} />;
}
export function Select({ options, ...p }: { options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...p} className={cn(inputCls, p.className)}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/* -------------------------------------------------- 3. remediation detail -- */

const remediationTabs = [
  "Overview", "Gap", "Affected Dimensions", "Affected Personas", "Affected Conditions",
  "Evidence", "Dependencies", "History", "Resolution",
];

export function RemediationDetailDrawer({ open, onOpenChange, remediation, onAction }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  remediation: CognitiveReadinessRemediation | null;
  onAction: (r: CognitiveReadinessRemediation, action: string) => void;
}) {
  const [tab, setTab] = useState("Overview");
  if (!remediation) return null;
  const r = remediation;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide title={`${r.id} · ${r.description}`}
      description="Remediation detail. Resolution never approves the proposed work.">
      <div className="mb-2 flex flex-wrap gap-1" role="tablist" aria-label="Remediation detail tabs">
        {remediationTabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-1">
          <Row label="Assessment" value={r.assessment} />
          <Row label="Work Item" value={r.workItem} />
          <Row label="Category" value={r.category} />
          <Row label="Gap Type" value={<Pill label={r.gapType} tone="slate" />} />
          <Row label="Severity" value={<Pill label={r.severity} tone={r.severity === "Critical" || r.severity === "High" ? "red" : "amber"} />} />
          <Row label="Blocking State" value={r.blocking ? "Blocking" : "Nonblocking"} />
          <Row label="Owner" value={r.owner} />
          <Row label="Due" value={r.due} />
          <Row label="Status" value={<Pill label={r.status} tone={tone(r.status)} />} />
        </div>
      )}
      {tab === "Gap" && (
        <div className="space-y-1">
          <Row label="Current Context" value={r.currentContext} />
          <Row label="Required Context" value={r.requiredContext} />
          <Row label="Why Required" value={r.whyRequired} />
          <Row label="Affected Gate" value={r.affectedGate} />
          <Row label="Affected Downstream Evaluations" value={r.downstreamEvaluations.join("; ")} />
        </div>
      )}
      {tab === "Affected Dimensions" && <Row label="Affected Dimension" value={r.affectedDimension} />}
      {tab === "Affected Personas" && (
        <ul className="space-y-1 text-[11px]">{r.affectedPersonas.map((p) => <li key={p} className="rounded border border-slate-200 px-2 py-1">{p}</li>)}</ul>
      )}
      {tab === "Affected Conditions" && (
        <ul className="space-y-1 text-[11px]">{r.affectedConditions.map((c) => <li key={c} className="rounded border border-slate-200 px-2 py-1">{c}</li>)}
          {r.affectedConditions.length === 0 && <li className="text-slate-500">No conditions affected</li>}</ul>
      )}
      {tab === "Evidence" && <Row label="Evidence Requirement" value={r.category === "Evidence" ? r.requiredContext : "No direct evidence requirement"} />}
      {tab === "Dependencies" && (
        <ul className="space-y-1 text-[11px]">{r.affectedDependencies.map((d) => <li key={d} className="rounded border border-slate-200 px-2 py-1">{d}</li>)}
          {r.affectedDependencies.length === 0 && <li className="text-slate-500">No dependencies affected</li>}</ul>
      )}
      {tab === "History" && (
        <ol className="space-y-1 text-[11px]">{r.history.map((h, i) => (
          <li key={i} className="rounded border border-slate-200 px-2 py-1"><span className="font-mono text-[10px] text-slate-500">{h.at}</span> · {h.entry}</li>
        ))}</ol>
      )}
      {tab === "Resolution" && (
        <div className="flex flex-wrap gap-1">
          {r.resolutionOptions.map((o) => <MiniBtn key={o} label={o} onClick={() => onAction(r, o)} tone="blue" />)}
          <MiniBtn label="Mark Resolved" onClick={() => onAction(r, "Mark Resolved")} />
        </div>
      )}
    </Drawer>
  );
}

/* ------------------------------------------- 4. clarification request wizard -- */

export interface ClarificationDraft {
  topic: string; question: string; assignedTo: string; responseType: string;
  due: string; impactIfUnresolved: string;
}

export function ClarificationDialog({ open, onOpenChange, context, onSubmit }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  context: { assessment: string; remediationId: string | null; seedQuestion?: string };
  onSubmit: (d: ClarificationDraft) => void;
}) {
  const [step, setStep] = useState(1);
  const [d, setD] = useState<ClarificationDraft>({
    topic: "Scope", question: "", assignedTo: "Work Owner", responseType: "Text Answer",
    due: "2026-08-14", impactIfUnresolved: "Can Proceed with Uncertainty",
  });

  useEffect(() => {
    if (open) {
      setStep(1);
      setD((x) => ({ ...x, question: context.seedQuestion ?? "" }));
    }
  }, [open, context.seedQuestion]);

  const set = <K extends keyof ClarificationDraft>(k: K, v: ClarificationDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const steps = ["Select Topic", "Define Question", "Assign To", "Required Response Type", "Due Date", "Impact if Unresolved", "Review and Send"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Request Clarification</DialogTitle>
          <DialogDescription className="text-[12px]">
            Step {step} of {steps.length} · {steps[step - 1]}. A clarification never approves work; it resolves missing or ambiguous context.
          </DialogDescription>
        </DialogHeader>

        <ol className="flex flex-wrap gap-1" aria-label="Clarification steps">
          {steps.map((s, i) => (
            <li key={s}>
              <span className={cn("rounded px-1.5 py-0.5 text-[10px]", i + 1 === step ? "bg-blue-600 text-white" : i + 1 < step ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                {i + 1}. {s}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-2 space-y-2">
          {step === 1 && <Field label="Topic"><Select options={clarificationTopics} value={d.topic} onChange={(e) => set("topic", e.target.value)} /></Field>}
          {step === 2 && (
            <Field label="Question" hint="Example: Does the proposed retry timeout apply to every payment transaction, or only transient failures eligible for retry?">
              <TextArea value={d.question} onChange={(e) => set("question", e.target.value)}
                placeholder="Does the proposed retry timeout apply to every payment transaction, or only transient failures eligible for retry?" />
            </Field>
          )}
          {step === 3 && <Field label="Assign To"><Select options={clarificationAssignees} value={d.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} /></Field>}
          {step === 4 && <Field label="Required Response Type"><Select options={clarificationResponseTypes} value={d.responseType} onChange={(e) => set("responseType", e.target.value)} /></Field>}
          {step === 5 && <Field label="Due Date"><TextInput type="date" value={d.due} onChange={(e) => set("due", e.target.value)} /></Field>}
          {step === 6 && <Field label="Impact if Unresolved"><Select options={clarificationImpacts} value={d.impactIfUnresolved} onChange={(e) => set("impactIfUnresolved", e.target.value)} /></Field>}
          {step === 7 && (
            <div className="space-y-1 rounded border border-slate-200 p-2">
              <Row label="Assessment" value={context.assessment} />
              <Row label="Topic" value={d.topic} />
              <Row label="Question" value={d.question || "—"} />
              <Row label="Assigned To" value={d.assignedTo} />
              <Row label="Response Type" value={d.responseType} />
              <Row label="Due" value={d.due} />
              <Row label="Impact if Unresolved" value={d.impactIfUnresolved} />
            </div>
          )}
        </div>

        <DialogFooter className="gap-1">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>Previous</Button>
          {step < steps.length
            ? <Button size="sm" className="h-7 text-[11px]" onClick={() => setStep((s) => s + 1)} disabled={step === 2 && !d.question.trim()}>Next</Button>
            : <Button size="sm" className="h-7 text-[11px]" onClick={() => { onSubmit(d); onOpenChange(false); }}>Send Clarification Request</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------- 6. request evidence dialog -- */

export interface EvidenceRequestDraft {
  evidenceType: string; description: string; requiredFor: string; affectedDimension: string;
  affectedPersona: string; owner: string; due: string; necessity: "Required to Proceed" | "Optional but Recommended";
}

export function EvidenceRequestDialog({ open, onOpenChange, seed, onSubmit }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  seed: Partial<EvidenceRequestDraft>;
  onSubmit: (d: EvidenceRequestDraft) => void;
}) {
  const [d, setD] = useState<EvidenceRequestDraft>({
    evidenceType: "Fraud Analysis", description: "", requiredFor: "Evidence Gate",
    affectedDimension: "Evidence Sufficiency", affectedPersona: "Fraud Engineering",
    owner: "Risk Technology", due: "2026-08-14", necessity: "Required to Proceed",
  });
  useEffect(() => { if (open) setD((x) => ({ ...x, ...seed })); }, [open, seed]);
  const set = <K extends keyof EvidenceRequestDraft>(k: K, v: EvidenceRequestDraft[K]) => setD((x) => ({ ...x, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Request Evidence</DialogTitle>
          <DialogDescription className="text-[12px]">Requesting evidence records an explicit gap rather than hiding it.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Field label="Evidence Type"><Select options={evidenceTypes} value={d.evidenceType} onChange={(e) => set("evidenceType", e.target.value)} /></Field>
          <Field label="Description"><TextArea value={d.description} onChange={(e) => set("description", e.target.value)} placeholder="Quantified fraud loss exposure for a third retry attempt" /></Field>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Required For"><TextInput value={d.requiredFor} onChange={(e) => set("requiredFor", e.target.value)} /></Field>
            <Field label="Affected Dimension"><TextInput value={d.affectedDimension} onChange={(e) => set("affectedDimension", e.target.value)} /></Field>
            <Field label="Affected Persona"><TextInput value={d.affectedPersona} onChange={(e) => set("affectedPersona", e.target.value)} /></Field>
            <Field label="Owner"><TextInput value={d.owner} onChange={(e) => set("owner", e.target.value)} /></Field>
            <Field label="Due"><TextInput type="date" value={d.due} onChange={(e) => set("due", e.target.value)} /></Field>
            <Field label="Necessity">
              <Select options={["Required to Proceed", "Optional but Recommended"]} value={d.necessity}
                onChange={(e) => set("necessity", e.target.value as EvidenceRequestDraft["necessity"])} />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => { onSubmit(d); onOpenChange(false); }}>Send Evidence Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------------------------- 7. add evidence dialog -- */

export interface AddEvidenceDraft {
  name: string; evidenceType: string; description: string; source: string; owner: string;
  authority: string; freshness: string; relatedWorkContext: string; relatedDimension: string;
  relatedGap: string; accessClassification: string; synthetic: boolean;
}

export function AddEvidenceDialog({ open, onOpenChange, seed, gapOptions, onSubmit }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  seed: Partial<AddEvidenceDraft>;
  gapOptions: string[];
  onSubmit: (d: AddEvidenceDraft) => void;
}) {
  const [d, setD] = useState<AddEvidenceDraft>({
    name: "Fraud Loss Analysis", evidenceType: "Fraud Analysis",
    description: "Quantified fraud loss exposure for a third retry attempt across transient failure classes",
    source: "Risk Technology", owner: "Risk Technology", authority: "Authoritative", freshness: "Current",
    relatedWorkContext: "Checkout Retry Policy Update", relatedDimension: "Evidence Sufficiency",
    relatedGap: gapOptions[0] ?? "", accessClassification: "Internal", synthetic: true,
  });
  useEffect(() => { if (open) setD((x) => ({ ...x, ...seed })); }, [open, seed]);
  const set = <K extends keyof AddEvidenceDraft>(k: K, v: AddEvidenceDraft[K]) => setD((x) => ({ ...x, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Add Evidence</DialogTitle>
          <DialogDescription className="text-[12px]">
            Adding evidence updates evidence sufficiency, Persona readiness, gate state and overall readiness. Intake history is never rewritten.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Evidence Name"><TextInput value={d.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Evidence Type"><Select options={evidenceTypes} value={d.evidenceType} onChange={(e) => set("evidenceType", e.target.value)} /></Field>
          <div className="sm:col-span-2"><Field label="Description"><TextArea value={d.description} onChange={(e) => set("description", e.target.value)} /></Field></div>
          <Field label="Source"><TextInput value={d.source} onChange={(e) => set("source", e.target.value)} /></Field>
          <Field label="Owner"><TextInput value={d.owner} onChange={(e) => set("owner", e.target.value)} /></Field>
          <Field label="Authority"><Select options={["Authoritative", "Provisional", "Informational"]} value={d.authority} onChange={(e) => set("authority", e.target.value)} /></Field>
          <Field label="Freshness"><Select options={["Current", "Aging", "Stale"]} value={d.freshness} onChange={(e) => set("freshness", e.target.value)} /></Field>
          <Field label="Related Work Context"><TextInput value={d.relatedWorkContext} onChange={(e) => set("relatedWorkContext", e.target.value)} /></Field>
          <Field label="Related Dimension"><TextInput value={d.relatedDimension} onChange={(e) => set("relatedDimension", e.target.value)} /></Field>
          <Field label="Related Gap"><Select options={gapOptions.length ? gapOptions : ["None"]} value={d.relatedGap} onChange={(e) => set("relatedGap", e.target.value)} /></Field>
          <Field label="Access Classification"><Select options={["Public", "Internal", "Confidential", "Restricted"]} value={d.accessClassification} onChange={(e) => set("accessClassification", e.target.value)} /></Field>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-700">
            <input type="checkbox" checked={d.synthetic} onChange={(e) => set("synthetic", e.target.checked)} />
            Synthetic Evidence Record
          </label>
        </div>
        <DialogFooter>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => { onSubmit(d); onOpenChange(false); }}>Attach Evidence</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------- 11. policy binding dialog -- */

export function PolicyBindingDialog({ open, onOpenChange, variable, onBind, onRequestReview }: {
  open: boolean; onOpenChange: (v: boolean) => void; variable: string | null;
  onBind: (variable: string, value: string) => void;
  onRequestReview: (variable: string) => void;
}) {
  const pv = policyVariables.find((p) => p.variable === variable);
  const [selected, setSelected] = useState<string>("");
  useEffect(() => { if (pv) setSelected(pv.currentValue); }, [pv]);
  if (!pv) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Resolve Policy Variable</DialogTitle>
          <DialogDescription className="text-[12px]">Values are taken from the authoritative policy record. Nothing is invented here.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <Row label="Policy Variable" value={<span className="font-mono text-[11px]">{pv.variable}</span>} />
          <Row label="Current Value" value={`${pv.currentValue} ${pv.unit}`} />
          <Row label="Authority" value={pv.authority} />
          <Row label="Effective Date" value={pv.effectiveDate} />
          <Row label="Owner" value={pv.owner} />
          <Row label="Version" value={pv.version} />
          <Row label="Applicable Conditions" value={pv.applicableConditions.join(", ")} />
          <Row label="Affected Personas" value={pv.affectedPersonas.join(", ")} />
        </div>
        <Field label="Historical Value for Simulation">
          <Select options={pv.history.map((h) => `${h.version} · ${h.value} · ${h.effectiveDate}`)}
            value={selected.includes("·") ? selected : `${pv.version} · ${pv.currentValue} · ${pv.effectiveDate}`}
            onChange={(e) => setSelected(e.target.value)} />
        </Field>
        <DialogFooter className="gap-1">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { onRequestReview(pv.variable); onOpenChange(false); }}>Request Policy Owner Review</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { onBind(pv.variable, selected.split("·")[1]?.trim() ?? pv.currentValue); onOpenChange(false); }}>Select Historical Value for Simulation</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => { onBind(pv.variable, pv.currentValue); onOpenChange(false); }}>Bind Current Value</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------- 13. accept assumption dialog -- */

export function AcceptAssumptionDialog({ open, onOpenChange, assumptionId, onAccept }: {
  open: boolean; onOpenChange: (v: boolean) => void; assumptionId: string | null;
  onAccept: (id: string) => void;
}) {
  const a = assumptions.find((x) => x.id === assumptionId);
  const [ack, setAck] = useState(false);
  useEffect(() => { if (open) setAck(false); }, [open]);
  if (!a) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Accept Assumption for Impact Evaluation</DialogTitle>
          <DialogDescription className="text-[12px]">
            This does NOT mean the assumption is true. It is carried into the Persona Impact Handoff as an uncertainty marker.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <Row label="Assumption" value={a.assumption} />
          <Row label="Confidence" value={a.confidence} />
          <Row label="Evidence" value={a.evidence} />
          <Row label="Affected Personas" value={a.affectedPersonas.join(", ")} />
          <Row label="Potential Consequence if Wrong" value={`Impact estimates for ${a.affectedPersonas.join(", ")} may understate exposure.`} />
          <Row label="Materiality" value={a.materiality} />
          <Row label="Owner" value={a.source} />
          <Row label="Acceptance State" value="Pending acknowledgement" />
        </div>
        <label className="flex items-start gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-900">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5" />
          I acknowledge that accepting this assumption records uncertainty and does not validate the assumption.
        </label>
        <DialogFooter>
          <Button size="sm" className="h-7 text-[11px]" disabled={!ack}
            onClick={() => { onAccept(a.id); onOpenChange(false); }}>Accept for Evaluation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------ 15. bounded interpretation dialog -- */

export function AmbiguityDialog({ open, onOpenChange, ambiguityId, mode, onResolve, onClarify }: {
  open: boolean; onOpenChange: (v: boolean) => void; ambiguityId: string | null;
  mode: string;
  onResolve: (id: string, status: string, interpretation: string, confidence: string) => void;
  onClarify: (question: string) => void;
}) {
  const a = ambiguities.find((x) => x.id === ambiguityId);
  const [interp, setInterp] = useState("");
  const [conf, setConf] = useState("Moderate");
  useEffect(() => {
    if (open && a) setInterp(a.id === "AM 01" ? "Network timeout and recoverable provider error codes only." : a.interpretations[0] ?? "");
  }, [open, a]);
  if (!a) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{mode === "Mark Nonmaterial" ? "Mark Ambiguity Nonmaterial" : "Accept Bounded Interpretation"}</DialogTitle>
          <DialogDescription className="text-[12px]">
            Ambiguity is never silently resolved. The bounded interpretation is carried downstream with its confidence.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <Row label="Source Text" value={`“${a.text}”`} />
          <Row label="Source" value={a.source} />
          <Row label="Why Ambiguous" value={a.whyAmbiguous} />
          <Row label="Candidate Interpretations" value={a.interpretations.join(" · ")} />
        </div>
        <Field label="Working Interpretation"><TextArea value={interp} onChange={(e) => setInterp(e.target.value)} /></Field>
        <Field label="Confidence"><Select options={["High", "Moderate", "Low"]} value={conf} onChange={(e) => setConf(e.target.value)} /></Field>
        <DialogFooter className="gap-1">
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { onClarify(`Which error classes are included in “${a.text}”?`); onOpenChange(false); }}>Clarify Instead</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { onResolve(a.id, "Nonmaterial", interp, conf); onOpenChange(false); }}>Mark Nonmaterial</Button>
          <Button size="sm" className="h-7 text-[11px]"
            onClick={() => { onResolve(a.id, "Accepted for Evaluation", interp, conf); onOpenChange(false); }}>Accept for Evaluation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------ 16. contradiction resolution dialog -- */

export function ContradictionDialog({ open, onOpenChange, contradictionId, onResolve }: {
  open: boolean; onOpenChange: (v: boolean) => void; contradictionId: string | null;
  onResolve: (id: string, choice: string, value: string, reason: string) => void;
}) {
  const c = contradictions.find((x) => x.id === contradictionId);
  const [choice, setChoice] = useState("Use A");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  useEffect(() => { if (open) { setChoice("Use A"); setValue(""); setReason(""); } }, [open]);
  if (!c) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Resolve Contradiction · {c.id}</DialogTitle>
          <DialogDescription className="text-[12px]">Both original source records are preserved. A reason is required.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded border border-slate-200 bg-slate-50 p-2 text-[11px]">
            <p className="text-[10px] font-semibold uppercase text-slate-500">Source A</p>{c.statementA}
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 p-2 text-[11px]">
            <p className="text-[10px] font-semibold uppercase text-slate-500">Source B</p>{c.statementB}
          </div>
        </div>
        <Field label="Resolution">
          <Select options={["Use A", "Use B", "Create Resolved Value", "Keep Both as Scenarios", "Request Owner Decision", "Mark Nonmaterial"]}
            value={choice} onChange={(e) => setChoice(e.target.value)} />
        </Field>
        {choice === "Create Resolved Value" && <Field label="Resolved Value"><TextInput value={value} onChange={(e) => setValue(e.target.value)} placeholder="Phase 2 = 15% traffic" /></Field>}
        <Field label="Reason"><TextArea value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
        <DialogFooter>
          <Button size="sm" className="h-7 text-[11px]" disabled={!reason.trim()}
            onClick={() => { onResolve(c.id, choice, value, reason); onOpenChange(false); }}>Record Resolution</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------- 19. human review workbench -- */

export function ReviewWorkbenchDrawer({ open, onOpenChange, review, gates, onDecision }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  review: CognitiveReadinessReview | null;
  gates: CognitiveReadinessGate[];
  onDecision: (review: CognitiveReadinessReview, decision: string, comments: string) => void;
}) {
  const [comments, setComments] = useState("");
  const [decision, setDecision] = useState("Confirm Assessment");
  useEffect(() => { if (open) { setComments(""); setDecision("Confirm Assessment"); } }, [open]);
  if (!review) return null;

  const manual = ["Change Gap Severity", "Challenge Gate State", "Accept Nonblocking Uncertainty", "Recommend Exception", "Escalate"];
  const requiresComment = manual.includes(decision);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide title={`${review.id} · ${review.reviewType}`}
      description="Human readiness review. A reviewer never approves the proposed work here.">
      <div className="grid gap-2 lg:grid-cols-2">
        <section className="rounded border border-slate-200 p-2" aria-label="Region 1 Work Context">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Region 1 · Work Context</h3>
          <div className="mt-1 space-y-1">
            <Row label="Assessment" value={review.assessment} />
            <Row label="Work Item" value={review.workItem} />
            <Row label="Issue" value={review.issue} />
            <Row label="Reviewer" value={review.reviewer} />
            <Row label="Due" value={review.due} />
          </div>
        </section>
        <section className="rounded border border-slate-200 p-2" aria-label="Region 2 Readiness Dimensions and Gates">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Region 2 · Readiness Dimensions &amp; Gates</h3>
          <div className="mt-1 space-y-1">
            {gates.map((g) => <Row key={g.id} label={g.name} value={<Pill label={g.status} tone={tone(g.status)} />} />)}
          </div>
        </section>
        <section className="rounded border border-slate-200 p-2" aria-label="Region 3 Evidence Gaps Assumptions">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Region 3 · Evidence, Gaps, Assumptions</h3>
          <ul className="mt-1 space-y-1 text-[11px] text-slate-700">
            <li className="rounded border border-slate-200 px-2 py-1">Fraud Loss Analysis · Missing</li>
            <li className="rounded border border-slate-200 px-2 py-1">Regional Dependency Stress Test · Missing</li>
            {assumptions.map((a) => <li key={a.id} className="rounded border border-slate-200 px-2 py-1">{a.assumption} · {a.validationState}</li>)}
          </ul>
        </section>
        <section className="rounded border border-slate-200 p-2" aria-label="Region 4 Reviewer Decision">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Region 4 · Reviewer Decision</h3>
          <div className="mt-1 space-y-2">
            <Field label="Decision">
              <Select options={["Confirm Assessment", "Request Remediation", "Request Evidence", ...manual]}
                value={decision} onChange={(e) => setDecision(e.target.value)} />
            </Field>
            <Field label="Comments" hint={requiresComment ? "Comments are required for manual changes." : "Optional"}>
              <TextArea value={comments} onChange={(e) => setComments(e.target.value)} />
            </Field>
            <Button size="sm" className="h-7 text-[11px]" disabled={requiresComment && !comments.trim()}
              onClick={() => { onDecision(review, decision, comments); onOpenChange(false); }}>Record Decision</Button>
          </div>
        </section>
      </div>
    </Drawer>
  );
}

/* ---------------------------------------------------------- 20. exception -- */

export function ExceptionDialog({ open, onOpenChange, onSubmit }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onSubmit: (d: {
    blockingItem: string; reason: string; affectedPersonas: string[]; affectedDimensions: string[];
    potentialConsequence: string; compensatingControls: string; owner: string; approver: string;
    expiration: string; downstreamWarning: string; restriction: string; assessment: string;
  }) => void;
}) {
  const [d, setD] = useState({
    assessment: "CRA 7001",
    blockingItem: "Regional dependency capacity evidence unavailable",
    reason: "Regional dependency capacity evidence unavailable during early architecture assessment.",
    affectedPersonas: ["Identity Engineering", "Site Reliability Engineering"],
    affectedDimensions: ["Scope & Dependency Context", "Evidence Sufficiency"],
    potentialConsequence: "Quantitative impact estimates for regional dependencies may be incomplete.",
    compensatingControls: "Qualitative Persona Impact Analysis only, with mandatory reassessment when evidence arrives.",
    owner: "Enterprise Architecture", approver: "Governance Board", expiration: "2026-09-07",
    downstreamWarning: "Dependency evidence limited. Treat regional capacity conclusions as provisional.",
    restriction: "Proceed to qualitative Persona Impact Analysis only. No final Decision Intelligence recommendation until evidence is supplied.",
  });
  const set = (k: keyof typeof d, v: string) => setD((x) => ({ ...x, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Request Readiness Exception</DialogTitle>
          <DialogDescription className="text-[12px]">
            An exception explicitly accepts proceeding with restrictions. Every exception expires and must be revisited.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Assessment"><TextInput value={d.assessment} onChange={(e) => set("assessment", e.target.value)} /></Field>
          <Field label="Blocking Item"><TextInput value={d.blockingItem} onChange={(e) => set("blockingItem", e.target.value)} /></Field>
          <div className="sm:col-span-2"><Field label="Reason"><TextArea value={d.reason} onChange={(e) => set("reason", e.target.value)} /></Field></div>
          <Field label="Affected Personas"><TextInput value={d.affectedPersonas.join(", ")} onChange={(e) => setD((x) => ({ ...x, affectedPersonas: e.target.value.split(",").map((s) => s.trim()) }))} /></Field>
          <Field label="Affected Dimensions"><TextInput value={d.affectedDimensions.join(", ")} onChange={(e) => setD((x) => ({ ...x, affectedDimensions: e.target.value.split(",").map((s) => s.trim()) }))} /></Field>
          <div className="sm:col-span-2"><Field label="Potential Consequence"><TextArea value={d.potentialConsequence} onChange={(e) => set("potentialConsequence", e.target.value)} /></Field></div>
          <div className="sm:col-span-2"><Field label="Compensating Controls"><TextArea value={d.compensatingControls} onChange={(e) => set("compensatingControls", e.target.value)} /></Field></div>
          <Field label="Owner"><TextInput value={d.owner} onChange={(e) => set("owner", e.target.value)} /></Field>
          <Field label="Approver"><TextInput value={d.approver} onChange={(e) => set("approver", e.target.value)} /></Field>
          <Field label="Expiration"><TextInput type="date" value={d.expiration} onChange={(e) => set("expiration", e.target.value)} /></Field>
          <Field label="Required Downstream Warning"><TextInput value={d.downstreamWarning} onChange={(e) => set("downstreamWarning", e.target.value)} /></Field>
          <div className="sm:col-span-2"><Field label="Restriction"><TextArea value={d.restriction} onChange={(e) => set("restriction", e.target.value)} /></Field></div>
        </div>
        <DialogFooter>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => { onSubmit(d); onOpenChange(false); }}>Request Exception</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------------------------------- 21. override -- */

export function OverrideDialog({ open, onOpenChange, currentState, blockingFindings, onSubmit }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  currentState: string;
  blockingFindings: string[];
  onSubmit: (d: {
    assessment: string; currentState: string; proposedState: string; blockingFindings: string[];
    businessReason: string; decisionOwner: string; riskOwner: string; affectedPersonas: string[];
    compensatingControls: string; expiration: string; approver: string; comments: string;
  }) => { blocked: boolean; reason?: string };
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [d, setD] = useState({
    assessment: "CRA 7001", proposedState: "Conditionally Ready",
    businessReason: "", decisionOwner: "Payments Executive", riskOwner: "Enterprise Risk",
    compensatingControls: "Mandatory reassessment within 14 days", expiration: "2026-08-21",
    approver: "Governance Board", comments: "",
  });
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);
  useEffect(() => { if (open) { setSelected([]); setBlockedMsg(null); } }, [open]);
  const set = (k: keyof typeof d, v: string) => setD((x) => ({ ...x, [k]: v }));
  const all = Array.from(new Set([...blockingFindings, ...protectedOverrideItems]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Request Readiness Override</DialogTitle>
          <DialogDescription className="text-[12px]">
            Higher governance than an exception. Protected findings can never be overridden.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Current Readiness State"><TextInput value={currentState} readOnly /></Field>
          <Field label="Proposed Override State"><Select options={["Conditionally Ready", "Ready for Persona Impact"]} value={d.proposedState} onChange={(e) => set("proposedState", e.target.value)} /></Field>
          <div className="sm:col-span-2">
            <Field label="Blocking Findings" hint="Protected items are rejected automatically.">
              <div className="space-y-0.5">
                {all.map((f) => (
                  <label key={f} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                    <input type="checkbox" checked={selected.includes(f)}
                      onChange={(e) => setSelected((s) => e.target.checked ? [...s, f] : s.filter((x) => x !== f))} />
                    {f}{protectedOverrideItems.includes(f) && <span className="text-[9px] font-semibold uppercase text-red-700">protected</span>}
                  </label>
                ))}
              </div>
            </Field>
          </div>
          <div className="sm:col-span-2"><Field label="Business Reason"><TextArea value={d.businessReason} onChange={(e) => set("businessReason", e.target.value)} /></Field></div>
          <Field label="Decision Owner"><TextInput value={d.decisionOwner} onChange={(e) => set("decisionOwner", e.target.value)} /></Field>
          <Field label="Risk Owner"><TextInput value={d.riskOwner} onChange={(e) => set("riskOwner", e.target.value)} /></Field>
          <Field label="Compensating Controls"><TextInput value={d.compensatingControls} onChange={(e) => set("compensatingControls", e.target.value)} /></Field>
          <Field label="Expiration"><TextInput type="date" value={d.expiration} onChange={(e) => set("expiration", e.target.value)} /></Field>
          <Field label="Approver"><TextInput value={d.approver} onChange={(e) => set("approver", e.target.value)} /></Field>
          <div className="sm:col-span-2"><Field label="Comments"><TextArea value={d.comments} onChange={(e) => set("comments", e.target.value)} /></Field></div>
        </div>
        {blockedMsg && <p role="alert" className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-800">{blockedMsg} cannot be overridden at any governance level.</p>}
        <DialogFooter>
          <Button size="sm" className="h-7 text-[11px]" disabled={!d.businessReason.trim() || selected.length === 0}
            onClick={() => {
              const res = onSubmit({
                ...d, currentState, blockingFindings: selected,
                affectedPersonas: ["Release Governance", "Payments Platform"],
              });
              if (res.blocked) setBlockedMsg(res.reason ?? "Protected finding");
              else onOpenChange(false);
            }}>Request Override</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------- 22. reassessment -- */

export function ReassessDialog({ open, onOpenChange, onSubmit }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onSubmit: (scope: string, reason: string, inputs: string[]) => void;
}) {
  const inputsAll = ["New Evidence", "Clarification Responses", "Dependency Updates", "Policy Bindings", "Persona Changes", "Condition Changes", "Exception Changes"];
  const [scope, setScope] = useState(reassessmentScopes[0]);
  const [reason, setReason] = useState("Reassessment after remediation");
  const [inputs, setInputs] = useState<string[]>(["New Evidence"]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Reassess Cognitive Readiness</DialogTitle>
          <DialogDescription className="text-[12px]">
            Reassessment loads the prior assessment, applies updated context and creates a new version. Prior versions are never overwritten.
          </DialogDescription>
        </DialogHeader>
        <Field label="Scope"><Select options={reassessmentScopes} value={scope} onChange={(e) => setScope(e.target.value)} /></Field>
        <Field label="Inputs">
          <div className="grid grid-cols-2 gap-0.5">
            {inputsAll.map((i) => (
              <label key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                <input type="checkbox" checked={inputs.includes(i)}
                  onChange={(e) => setInputs((s) => e.target.checked ? [...s, i] : s.filter((x) => x !== i))} />
                {i}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Reason"><TextInput value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
        <DialogFooter>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => { onSubmit(scope, reason, inputs); onOpenChange(false); }}>Run Reassessment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------ 27. routing -- */

export function ProceedDialog({ open, onOpenChange, validation, summary, onProceed }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  validation: RoutingValidation;
  summary: {
    assessmentVersion: string; readinessState: string; personas: string[];
    personaReadiness: { persona: string; readiness: string }[]; evidenceGaps: string[];
    acceptedAssumptions: string[]; exceptions: string[]; criticalWarnings: string[];
    historicalContextVersion: string;
  };
  onProceed: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Proceed to Persona Impact Analysis</DialogTitle>
          <DialogDescription className="text-[12px]">
            Routing hands over a governed context package. It is not an approval of the proposed work, and no impact is computed here.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <Row label="Assessment Version" value={summary.assessmentVersion} />
          <Row label="Readiness State" value={<Pill label={summary.readinessState} tone={tone(summary.readinessState)} />} />
          <Row label="Historical Context Version" value={summary.historicalContextVersion} />
        </div>
        <div className="rounded border border-slate-200 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Gate States</p>
          <ul className="mt-0.5 space-y-0.5 text-[11px]">
            {validation.gateResults.map((g) => (
              <li key={g.gate} className="flex items-center justify-between">
                <span className="text-slate-700">{g.gate} · {g.status}</span>
                <Pill label={g.verdict} tone={g.verdict === "OK" ? "green" : g.verdict === "Warning" ? "amber" : "red"} />
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {[["Candidate Personas", summary.personas],
            ["Persona Readiness", summary.personaReadiness.map((p) => `${p.persona} · ${p.readiness}`)],
            ["Evidence Gaps", summary.evidenceGaps],
            ["Accepted Assumptions", summary.acceptedAssumptions],
            ["Exceptions", summary.exceptions],
            ["Critical Warnings", summary.criticalWarnings]].map(([label, items]) => (
            <div key={String(label)} className="rounded border border-slate-200 p-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              {(items as string[]).length === 0
                ? <p className="text-[11px] text-slate-400">None</p>
                : <ul className="text-[11px] text-slate-700">{(items as string[]).map((i, n) => <li key={n}>{i}</li>)}</ul>}
            </div>
          ))}
        </div>
        {!validation.allowed && (
          <div role="alert" className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-800">
            <p className="font-semibold">Routing blocked</p>
            <ul>{validation.reasons.map((r) => <li key={r}>· {r}</li>)}</ul>
          </div>
        )}
        <DialogFooter>
          <Button size="sm" className="h-7 text-[11px]" disabled={!validation.allowed}
            onClick={() => { onProceed(); onOpenChange(false); }}>Route to Persona Impact Analysis</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------- 30. global search -- */

export function GlobalSearchDialog({ open, onOpenChange, onSearch, onOpenResult }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onSearch: (q: string) => SearchResult[];
  onOpenResult: (r: SearchResult) => void;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => (open ? onSearch(q) : []), [q, open, onSearch]);
  const examples = [
    "Assessments blocked by missing rollback", "Work missing fraud evidence", "Identity dependency warnings",
    "Conditionally ready payment changes", "Assessments with accepted assumptions", "Readiness exceptions expiring",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Global Readiness Search</DialogTitle>
          <DialogDescription className="text-[12px]">
            Search assessments, work items, findings, gaps, evidence, personas, conditions, dependencies, assumptions, constraints, ambiguities, contradictions, exceptions, overrides and versions.
          </DialogDescription>
        </DialogHeader>
        <TextInput autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search readiness context" aria-label="Search readiness context" />
        <div className="flex flex-wrap gap-1">
          {examples.map((e) => <MiniBtn key={e} label={e} onClick={() => setQ(e)} />)}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-[11px]">
            <caption className="sr-only">Global search results</caption>
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>{["Type", "Assessment", "Work Item", "Issue", "Severity", "Owner", "Status", "Action"].map((h) => (
                <th key={h} scope="col" className="px-2 py-1 text-left font-semibold text-slate-600">{h}</th>))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r, i) => (
                <tr key={`${r.type}-${i}`} className="hover:bg-slate-50">
                  <td className="px-2 py-1"><Pill label={r.type} tone="slate" /></td>
                  <td className="px-2 py-1">{r.assessment}</td>
                  <td className="px-2 py-1">{r.workItem}</td>
                  <td className="px-2 py-1">{r.issue}</td>
                  <td className="px-2 py-1">{r.severity}</td>
                  <td className="px-2 py-1">{r.owner}</td>
                  <td className="px-2 py-1">{r.status}</td>
                  <td className="px-2 py-1"><MiniBtn label="Open" tone="blue" onClick={() => { onOpenResult(r); onOpenChange(false); }} /></td>
                </tr>
              ))}
              {q && results.length === 0 && (
                <tr><td colSpan={8} className="px-2 py-3 text-center text-slate-500">No matches</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------------------- 33. export -- */

export function ExportDialog({ open, onOpenChange, onExport }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onExport: (format: string, scope: string, options: string[]) => void;
}) {
  const [format, setFormat] = useState("CSV");
  const [scope, setScope] = useState("Current Assessment");
  const [options, setOptions] = useState<string[]>(["Work Context", "Gate States", "Readiness Score"]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Export Cognitive Readiness Assessment</DialogTitle>
          <DialogDescription className="text-[12px]">Governed export. CSV, JSON and YAML are generated locally.</DialogDescription>
        </DialogHeader>
        <Field label="Format"><Select options={exportFormats} value={format} onChange={(e) => setFormat(e.target.value)} /></Field>
        <Field label="Scope"><Select options={exportScopes} value={scope} onChange={(e) => setScope(e.target.value)} /></Field>
        <Field label="Options">
          <div className="grid grid-cols-2 gap-0.5">
            {exportOptions.map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                <input type="checkbox" checked={options.includes(o)}
                  onChange={(e) => setOptions((s) => e.target.checked ? [...s, o] : s.filter((x) => x !== o))} />
                {o}
              </label>
            ))}
          </div>
        </Field>
        <DialogFooter>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => { onExport(format, scope, options); onOpenChange(false); }}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------ 34. demo story -- */

export function DemoStoryOverlay({ step, onNext, onPrev, onExit, reducedMotion, onToggleMotion }: {
  step: number;
  onNext: () => void; onPrev: () => void; onExit: () => void;
  reducedMotion: boolean; onToggleMotion: () => void;
}) {
  const s = demoStorySteps[step - 1];
  if (!s) return null;
  return (
    <div role="dialog" aria-label="Demo story" aria-live="polite"
      className="fixed inset-x-2 bottom-2 z-50 rounded-xl border border-slate-300 bg-white p-3 shadow-xl md:inset-x-auto md:right-4 md:w-[520px]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold text-slate-900">Step {s.id} of {demoStorySteps.length} · {s.title}</p>
        <Pill label={`${Math.round((s.id / demoStorySteps.length) * 100)}%`} tone="blue" />
      </div>
      <div className="mt-1 h-1 w-full rounded bg-slate-100">
        <div className={cn("h-1 rounded bg-blue-600", !reducedMotion && "transition-all duration-300")}
          style={{ width: `${(s.id / demoStorySteps.length) * 100}%` }} />
      </div>
      <p className="mt-2 text-[12px] text-slate-700">{s.caption}</p>
      <details className="mt-1">
        <summary className="cursor-pointer text-[10.5px] font-semibold text-slate-500">Presenter notes</summary>
        <p className="text-[10.5px] text-slate-600">{s.presenterNotes}</p>
      </details>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onPrev} disabled={step === 1}>Previous</Button>
        <Button size="sm" className="h-7 text-[11px]" onClick={onNext} disabled={step === demoStorySteps.length}>Next</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onExit}>Exit Story</Button>
        <label className="ml-auto flex items-center gap-1 text-[10.5px] text-slate-600">
          <input type="checkbox" checked={reducedMotion} onChange={onToggleMotion} /> Reduced motion
        </label>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- review type helper -- */

export const allReviewTypes = reviewTypes;
