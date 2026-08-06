/**
 * Team Persona Construction — Prompt 2 governance dialogs and workflows.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer, Pill, Row } from "./primitives";
import {
  COMMENT_REQUIRED_DECISIONS, COMMENT_REQUIRED_REASONS, EXAMPLE_SEARCHES, EXPORT_FORMATS,
  EXPORT_OPTIONS, EXPORT_SCOPES, PUBLISH_STEPS, REFRESH_RULES, REFRESH_SCOPES, REFRESH_STEPS,
  RESOLUTION_CHOICES, REVIEW_DECISIONS, SEARCH_TYPES, approvalRequirementDrivers, publicationHistory,
  publishDestinations, publishGates, qualityDetailFor, rowsToCsv, runSearch, toYaml, versionDiff,
  type ExportFormat, type PersonaConflict, type PersonaReview, type PersonaVersion,
  type RefreshResult, type ResolutionChoice, type ReviewDecision, type SearchRecord, type SearchType,
} from "./governance-data";

/* --------------------------- shared step runner --------------------------- */

function useStepRunner(steps: string[], onDone?: () => void) {
  const [index, setIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);

  const stop = () => { if (timer.current) window.clearInterval(timer.current); timer.current = null; };
  const reset = () => { stop(); setIndex(-1); setRunning(false); };
  const start = () => {
    stop();
    setRunning(true);
    setIndex(0);
    timer.current = window.setInterval(() => {
      setIndex((i) => {
        if (i >= steps.length - 1) { stop(); setRunning(false); onDone?.(); return i; }
        return i + 1;
      });
    }, 320);
  };
  useEffect(() => () => stop(), []);
  return { index, running, start, reset, done: index === steps.length - 1 && !running };
}

function StepList({ steps, index }: { steps: string[]; index: number }) {
  return (
    <ol className="space-y-1" aria-live="polite">
      {steps.map((s, i) => (
        <li key={s} className={cn("flex items-center gap-2 rounded px-2 py-1 text-[11.5px]",
          i < index ? "text-emerald-700" : i === index ? "bg-blue-50 font-medium text-blue-800" : "text-slate-400")}>
          {i < index ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            : i === index ? <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
              : <span className="h-3.5 w-3.5 rounded-full border border-slate-300" aria-hidden />}
          {s}
        </li>
      ))}
    </ol>
  );
}

/* ------------------------- validation review dialog ----------------------- */

export interface ReviewOutcome {
  reviewId: string;
  decision: ReviewDecision;
  comment: string;
}

export function ValidationReviewDialog({
  open, onOpenChange, review, onDecision,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  review: PersonaReview | null;
  onDecision: (o: ReviewOutcome) => void;
}) {
  const [decision, setDecision] = useState<ReviewDecision>("Approve Section");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (open) { setDecision("Approve Section"); setComment(""); setError(null); } }, [open, review?.id]);

  const needsComment = COMMENT_REQUIRED_DECISIONS.includes(decision)
    || (decision === "Approve Persona" && ((review?.gaps.length ?? 0) > 0 || review?.sourceAuthority !== "Primary"));

  const submit = () => {
    if (needsComment && comment.trim().length < 5) {
      setError(`A reviewer comment is required. ${COMMENT_REQUIRED_REASONS[decision] ?? "Approval with an unresolved gap or low authority evidence"}.`);
      return;
    }
    onDecision({ reviewId: review!.id, decision, comment: comment.trim() });
    onOpenChange(false);
  };

  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[96vw] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Persona Validation Review · {review.id}</DialogTitle>
          <DialogDescription className="text-[12px]">
            {review.personaName} · {review.sectionName} · {review.reviewType}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 lg:grid-cols-3">
          {/* left: section under review */}
          <section aria-label="Persona section under review" className="rounded-lg border border-slate-200 p-2.5">
            <h3 className="text-[12px] font-semibold text-slate-900">Persona section under review</h3>
            <dl className="mt-1">
              <Row label="Persona" value={review.personaName} />
              <Row label="Section" value={review.sectionName} />
              <Row label="Current value" value={review.currentValue} />
              <Row label="Proposed value" value={review.proposedValue} />
              <Row label="Reviewer role" value={review.reviewerRole} />
              <Row label="Required approval level" value={review.requiredApprovalLevel} />
              <Row label="Due" value={review.dueDate} />
              <Row label="Priority" value={<Pill label={review.priority} tone={review.priority === "Critical" || review.priority === "High" ? "red" : "amber"} />} />
            </dl>
          </section>

          {/* middle: conditions and evidence */}
          <section aria-label="Mapped conditions and evidence" className="rounded-lg border border-slate-200 p-2.5">
            <h3 className="text-[12px] font-semibold text-slate-900">Mapped conditions and evidence</h3>
            <ul className="mt-1 flex flex-wrap gap-1">
              {review.mappedConditionIds.map((c) => <li key={c}><Pill label={c} tone="blue" /></li>)}
            </ul>
            <blockquote className="mt-2 border-l-2 border-blue-300 bg-blue-50/60 px-2 py-1.5 text-[11.5px] italic text-slate-700">
              {review.evidencePassage}
            </blockquote>
            <dl className="mt-1">
              <Row label="Source authority" value={review.sourceAuthority} />
              <Row label="Confidence" value={`${review.confidence}%`} />
              <Row label="Freshness" value={review.freshness} />
              <Row label="Conflicts" value={review.conflicts.length ? review.conflicts.join("; ") : "None"} />
              <Row label="Gaps" value={review.gaps.length ? review.gaps.join("; ") : "None"} />
            </dl>
          </section>

          {/* right: decision */}
          <section aria-label="Reviewer decision" className="rounded-lg border border-slate-200 p-2.5">
            <h3 className="text-[12px] font-semibold text-slate-900">Reviewer decision</h3>
            <dl className="mt-1">
              <Row label="Affected dependency teams" value={review.dependencyTeams.join(", ") || "None"} />
              <Row label="Affected downstream evaluations" value={review.affectedEvaluations.join(", ") || "None"} />
              <Row label="Downstream impact" value={review.downstreamImpact} />
            </dl>
            <fieldset className="mt-2">
              <legend className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Review action</legend>
              <div className="mt-1 grid max-h-40 grid-cols-1 gap-0.5 overflow-auto pr-1">
                {REVIEW_DECISIONS.map((d) => (
                  <label key={d} className="flex items-center gap-1.5 text-[11.5px] text-slate-700">
                    <input
                      type="radio"
                      name="review-decision"
                      value={d}
                      checked={decision === d}
                      onChange={() => { setDecision(d); setError(null); }}
                      className="h-3 w-3"
                    />
                    {d}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-2">
              <Label htmlFor="review-comment" className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Reviewer comment{needsComment ? " (required)" : " (optional)"}
              </Label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => { setComment(e.target.value); setError(null); }}
                rows={3}
                className="mt-1 text-[11.5px]"
                placeholder={needsComment ? COMMENT_REQUIRED_REASONS[decision] ?? "Explain the approval exception" : "Add context for the audit record"}
              />
              {error && <p role="alert" className="mt-1 text-[11px] font-medium text-red-700">{error}</p>}
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={submit}>Record Decision</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------ conflict resolution dialog ---------------------- */

export interface ConflictOutcome {
  conflictId: string;
  choice: ResolutionChoice;
  reason: string;
  reviewer: string;
  approver: string;
  effectiveDate: string;
  applicability: string;
  acknowledged: boolean;
}

const SIDE_FIELDS: { key: keyof PersonaConflict["a"]; label: string }[] = [
  { key: "statement", label: "Statement or relationship" },
  { key: "personaSection", label: "Persona section" },
  { key: "sourceConditionId", label: "Source condition" },
  { key: "sourceArtifact", label: "Source artifact" },
  { key: "evidencePassage", label: "Evidence passage" },
  { key: "authority", label: "Authority" },
  { key: "owner", label: "Owner" },
  { key: "confidence", label: "Confidence" },
  { key: "freshness", label: "Freshness" },
  { key: "effectiveDate", label: "Effective date" },
  { key: "applicableTeams", label: "Applicable teams" },
  { key: "applicableServices", label: "Applicable services" },
  { key: "environment", label: "Environment" },
  { key: "downstreamConsumers", label: "Downstream consumers" },
  { key: "currentPersonaUse", label: "Current Persona use" },
];

export function ConflictResolutionDialog({
  open, onOpenChange, conflict, onResolve,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conflict: PersonaConflict | null;
  onResolve: (o: ConflictOutcome) => void;
}) {
  const [choice, setChoice] = useState<ResolutionChoice>("Select A");
  const [reason, setReason] = useState("");
  const [reviewer, setReviewer] = useState("Jane Smith");
  const [approver, setApprover] = useState("Commerce Architecture Council");
  const [effectiveDate, setEffectiveDate] = useState("2026-09-01");
  const [applicability, setApplicability] = useState("All production services");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && conflict) {
      setChoice(conflict.recommendedResolution.includes("environment") ? "Keep Both for Different Environments"
        : conflict.recommendedResolution.includes("effective") ? "Keep Both for Different Effective Periods" : "Select A");
      setReason(""); setAcknowledged(false); setError(null);
    }
  }, [open, conflict]);

  const approverRequired = choice === "Escalate to Governance" || choice === "Remove Both and Request Evidence" || conflict?.severity === "Critical";

  const submit = () => {
    if (reason.trim().length < 5) { setError("A resolution reason is required for the audit record."); return; }
    if (approverRequired && !approver.trim()) { setError("An approver is required for this resolution."); return; }
    if (!acknowledged) { setError("Acknowledge the downstream impact before resolving."); return; }
    onResolve({ conflictId: conflict!.id, choice, reason: reason.trim(), reviewer, approver, effectiveDate, applicability, acknowledged });
    onOpenChange(false);
  };

  if (!conflict) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[96vw] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Conflict Comparison · {conflict.id}</DialogTitle>
          <DialogDescription className="text-[12px]">
            {conflict.personaName} · {conflict.sectionName} · {conflict.conflictType} · severity {conflict.severity}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Side by side conflict comparison</caption>
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-2 py-1.5 font-semibold">Dimension</th>
                <th scope="col" className="px-2 py-1.5 font-semibold">Record A</th>
                <th scope="col" className="px-2 py-1.5 font-semibold">Record B</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SIDE_FIELDS.map((f) => {
                const av = String(conflict.a[f.key]);
                const bv = String(conflict.b[f.key]);
                const differs = av !== bv;
                return (
                  <tr key={f.key} className={differs ? "bg-amber-50/50" : undefined}>
                    <th scope="row" className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-slate-700">{f.label}</th>
                    <td className="px-2 py-1.5 text-slate-700">{av}</td>
                    <td className="px-2 py-1.5 text-slate-700">{bv}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <fieldset>
            <legend className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Resolution</legend>
            <div className="mt-1 grid gap-0.5">
              {RESOLUTION_CHOICES.map((c) => (
                <label key={c} className="flex items-center gap-1.5 text-[11.5px] text-slate-700">
                  <input type="radio" name="conflict-resolution" value={c} checked={choice === c} onChange={() => { setChoice(c); setError(null); }} className="h-3 w-3" />
                  {c}
                </label>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Recommended: {conflict.recommendedResolution}</p>
          </fieldset>

          <div className="space-y-2">
            <div>
              <Label htmlFor="conflict-reason" className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Resolution reason (required)</Label>
              <Textarea id="conflict-reason" rows={2} value={reason} onChange={(e) => { setReason(e.target.value); setError(null); }} className="mt-1 text-[11.5px]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Reviewer
                <Input value={reviewer} onChange={(e) => setReviewer(e.target.value)} className="mt-0.5 h-7 text-[11.5px]" />
              </label>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Approver{approverRequired ? " (required)" : ""}
                <Input value={approver} onChange={(e) => setApprover(e.target.value)} className="mt-0.5 h-7 text-[11.5px]" />
              </label>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Effective date
                <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className="mt-0.5 h-7 text-[11.5px]" />
              </label>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Applicability
                <Input value={applicability} onChange={(e) => setApplicability(e.target.value)} className="mt-0.5 h-7 text-[11.5px]" />
              </label>
            </div>
            <label className="flex items-start gap-2 text-[11.5px] text-slate-700">
              <Checkbox checked={acknowledged} onCheckedChange={(v) => { setAcknowledged(!!v); setError(null); }} aria-label="Acknowledge downstream impact" />
              <span>
                I acknowledge that resolving this conflict updates the Persona draft, condition mappings, the relationship
                graph, quality and completeness, the review queue, creates a Persona version change and flags
                {" "}{conflict.affectedEvaluationIds.length} impact evaluation(s) for reassessment.
              </span>
            </label>
            {error && <p role="alert" className="text-[11px] font-medium text-red-700">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={submit}>Resolve Conflict</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- approval dialog ---------------------------- */

export function ApprovalDialog({
  open, onOpenChange, action, quality, completeness, confidence, freshness, unresolvedConflicts,
  knownGaps, conditionsIncluded, conditionsExcluded, dependencyTeams, downstreamConsumers, version, onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  action: string;
  quality: number;
  completeness: number;
  confidence: number;
  freshness: string;
  unresolvedConflicts: number;
  knownGaps: number;
  conditionsIncluded: number;
  conditionsExcluded: number;
  dependencyTeams: string[];
  downstreamConsumers: number;
  version: string;
  onConfirm: (comment: string, effectiveDate: string) => void;
}) {
  const [comment, setComment] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("2026-09-01");
  const [risk, setRisk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (open) { setComment(""); setRisk(false); setError(null); } }, [open, action]);

  const commentRequired = ["Approve with Conditions", "Request Changes", "Reject", "Withdraw"].includes(action)
    || (action === "Approve" && (unresolvedConflicts > 0 || knownGaps > 0));

  const submit = () => {
    if (commentRequired && comment.trim().length < 5) { setError("A comment is required for this approval decision."); return; }
    if (!risk) { setError("Acknowledge the residual risk before recording the decision."); return; }
    onConfirm(comment.trim(), effectiveDate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{action} · Payments Platform version {version}</DialogTitle>
          <DialogDescription className="text-[12px]">
            Approval requirements are derived from Persona criticality, access classification, dependency count,
            regulatory scope, customer impact, risk level, condition authority and unresolved exceptions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-2">
          <dl>
            <Row label="Persona quality" value={quality} />
            <Row label="Completeness" value={`${completeness}%`} />
            <Row label="Confidence" value={`${confidence}%`} />
            <Row label="Freshness" value={freshness} />
            <Row label="Unresolved conflicts" value={unresolvedConflicts} />
            <Row label="Known gaps" value={knownGaps} />
            <Row label="Conditions included" value={conditionsIncluded} />
            <Row label="Conditions excluded" value={conditionsExcluded} />
            <Row label="Dependency teams" value={dependencyTeams.join(", ")} />
            <Row label="Downstream consumers" value={downstreamConsumers} />
            <Row label="Version" value={version} />
          </dl>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Approval requirement drivers</div>
            <ul className="mt-1 space-y-0.5">
              {approvalRequirementDrivers.map((d) => (
                <li key={d.key} className="flex items-start justify-between gap-2 rounded border border-slate-200 px-1.5 py-1 text-[10.5px]">
                  <span className="text-slate-600">{d.label}: <span className="font-medium text-slate-800">{d.value}</span></span>
                  <span className="whitespace-nowrap text-slate-500">{d.requires}</span>
                </li>
              ))}
            </ul>
            <label className="mt-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Proposed effective date
              <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className="mt-0.5 h-7 text-[11.5px]" />
            </label>
          </div>
        </div>

        <div>
          <Label htmlFor="approval-comment" className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Decision comment{commentRequired ? " (required)" : " (optional)"}
          </Label>
          <Textarea id="approval-comment" rows={2} value={comment} onChange={(e) => { setComment(e.target.value); setError(null); }} className="mt-1 text-[11.5px]" />
        </div>
        <label className="flex items-start gap-2 text-[11.5px] text-slate-700">
          <Checkbox checked={risk} onCheckedChange={(v) => { setRisk(!!v); setError(null); }} aria-label="Acknowledge residual risk" />
          <span>I acknowledge the residual risk of {unresolvedConflicts} unresolved conflict(s) and {knownGaps} known gap(s).</span>
        </label>
        {error && <p role="alert" className="text-[11px] font-medium text-red-700">{error}</p>}

        <DialogFooter>
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={submit}>{action}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------- version comparison ---------------------------- */

export function VersionComparisonDialog({
  open, onOpenChange, from, to, onAction,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  from: PersonaVersion;
  to: PersonaVersion;
  onAction: (action: string, selected: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => { if (open) setSelected([]); }, [open]);
  const changed = versionDiff.filter((d) => d.change !== "Unchanged");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[96vw] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Compare version {from.version} with version {to.version}</DialogTitle>
          <DialogDescription className="text-[12px]">
            {changed.length} changed dimensions · {changed.filter((c) => c.change === "Added").length} added ·
            {" "}{changed.filter((c) => c.change === "Removed").length} removed ·
            {" "}{changed.filter((c) => c.change === "Changed").length} modified
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[52vh] overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Version comparison</caption>
            <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-2 py-1.5 font-semibold">Select</th>
                <th scope="col" className="px-2 py-1.5 font-semibold">Dimension</th>
                <th scope="col" className="px-2 py-1.5 font-semibold">Version {from.version}</th>
                <th scope="col" className="px-2 py-1.5 font-semibold">Version {to.version}</th>
                <th scope="col" className="px-2 py-1.5 font-semibold">Change</th>
                <th scope="col" className="px-2 py-1.5 font-semibold">Downstream impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {versionDiff.map((d) => (
                <tr key={d.dimension} className={d.change === "Unchanged" ? undefined : "bg-blue-50/40"}>
                  <td className="px-2 py-1.5">
                    <Checkbox
                      aria-label={`Select ${d.dimension} change`}
                      checked={selected.includes(d.dimension)}
                      disabled={d.change === "Unchanged"}
                      onCheckedChange={(v) => setSelected((s) => (v ? [...s, d.dimension] : s.filter((x) => x !== d.dimension)))}
                    />
                  </td>
                  <th scope="row" className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-slate-800">{d.dimension}</th>
                  <td className="px-2 py-1.5 text-slate-600">{d.a}</td>
                  <td className="px-2 py-1.5 text-slate-800">{d.b}</td>
                  <td className="px-2 py-1.5"><Pill label={d.change} tone={d.change === "Added" ? "green" : d.change === "Removed" ? "red" : d.change === "Changed" ? "amber" : "slate"} /></td>
                  <td className="px-2 py-1.5 text-slate-600">{d.downstreamImpact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter className="flex-wrap gap-1.5">
          {["Accept Changes", "Reject Changes", "Select Individual Changes", "Restore Prior Value", "Create New Draft"].map((a) => (
            <Button key={a} size="sm" variant={a === "Accept Changes" ? "default" : "outline"} onClick={() => { onAction(a, selected); onOpenChange(false); }}>
              {a}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------- refresh workflow ---------------------------- */

export function RefreshPersonaDialog({
  open, onOpenChange, onComplete, onOpenDraft, onCompare, onSubmitReview,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: (r: RefreshResult) => void;
  onOpenDraft: () => void;
  onCompare: () => void;
  onSubmitReview: () => void;
}) {
  const [step, setStep] = useState(1);
  const [scope, setScope] = useState(REFRESH_SCOPES[0]);
  const [rules, setRules] = useState<string[]>(REFRESH_RULES);
  const [result, setResult] = useState<RefreshResult | null>(null);

  const runner = useStepRunner(REFRESH_STEPS, () => {
    const r: RefreshResult = {
      sectionsUpdated: 7, conditionsAdded: 6, conditionsRemoved: 2, relationshipsChanged: 4,
      conflictsCreated: 1, reviewTasksCreated: 3, evaluationsFlagged: 4, draftVersion: "3.5",
    };
    setResult(r);
    onComplete(r);
  });

  useEffect(() => { if (!open) { setStep(1); setResult(null); runner.reset(); } }, [open]);

  const toggleRule = (r: string) => setRules((s) => (s.includes(r) ? s.filter((x) => x !== r) : [...s, r]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Refresh Persona · Payments Platform</DialogTitle>
          <DialogDescription className="text-[12px]">Step {step} of 4</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <fieldset>
            <legend className="text-[12px] font-semibold text-slate-900">Refresh scope</legend>
            <RadioGroup value={scope} onValueChange={setScope} className="mt-1.5 grid gap-1">
              {REFRESH_SCOPES.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <RadioGroupItem value={s} id={`scope-${s}`} />
                  <Label htmlFor={`scope-${s}`} className="text-[11.5px] font-normal">{s}</Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="text-[12px] font-semibold text-slate-900">Comparison rules</legend>
            <div className="mt-1.5 grid gap-1">
              {REFRESH_RULES.map((r) => (
                <label key={r} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                  <Checkbox checked={rules.includes(r)} onCheckedChange={() => toggleRule(r)} aria-label={r} /> {r}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <div className="text-[11.5px]">
            <h3 className="text-[12px] font-semibold text-slate-900">Review</h3>
            <dl className="mt-1">
              <Row label="Changed records" value="18" />
              <Row label="Affected sections" value="7" />
              <Row label="Potential version changes" value="Draft 3.5" />
              <Row label="Potential review tasks" value="3" />
              <Row label="Affected Personas" value="4" />
              <Row label="Affected evaluations" value="4" />
              <Row label="Affected decisions" value="2" />
              <Row label="Scope" value={scope} />
              <Row label="Rules applied" value={`${rules.length} of ${REFRESH_RULES.length}`} />
            </dl>
          </div>
        )}

        {step === 4 && (
          <div>
            <StepList steps={REFRESH_STEPS} index={runner.index} />
            {result && (
              <dl className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 p-2">
                <Row label="Sections updated" value={result.sectionsUpdated} />
                <Row label="Conditions added" value={result.conditionsAdded} />
                <Row label="Conditions removed" value={result.conditionsRemoved} />
                <Row label="Relationships changed" value={result.relationshipsChanged} />
                <Row label="Conflicts created" value={result.conflictsCreated} />
                <Row label="Review tasks created" value={result.reviewTasksCreated} />
                <Row label="Evaluations flagged" value={result.evaluationsFlagged} />
                <Row label="Draft version" value={result.draftVersion} />
              </dl>
            )}
          </div>
        )}

        <DialogFooter className="flex-wrap gap-1.5">
          {step > 1 && step < 4 && <Button size="sm" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 3 && <Button size="sm" onClick={() => setStep(step + 1)}>Next</Button>}
          {step === 3 && <Button size="sm" onClick={() => { setStep(4); runner.start(); }}>Execute Refresh</Button>}
          {step === 4 && result && (
            <>
              <Button size="sm" variant="outline" onClick={() => { onOpenDraft(); onOpenChange(false); }}>Open Updated Draft</Button>
              <Button size="sm" variant="outline" onClick={() => { onCompare(); onOpenChange(false); }}>Compare Versions</Button>
              <Button size="sm" variant="outline" onClick={() => { onSubmitReview(); onOpenChange(false); }}>Submit for Review</Button>
              <Button size="sm" onClick={() => onOpenChange(false)}>Close</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ publish dialog ---------------------------- */

export function PublishPersonaDialog({
  open, onOpenChange, approved, quality, completeness, confidence, freshness, criticalConflicts,
  owner, version, onComplete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  approved: boolean;
  quality: number;
  completeness: number;
  confidence: number;
  freshness: string;
  criticalConflicts: number;
  owner: string;
  version: string;
  onComplete: () => void;
}) {
  const [effectiveDate, setEffectiveDate] = useState("2026-09-01");
  const [expiration, setExpiration] = useState("");
  const [classification, setClassification] = useState("Internal Restricted");
  const [notes, setNotes] = useState("");
  const [phase, setPhase] = useState<"review" | "running">("review");

  const runner = useStepRunner(PUBLISH_STEPS, () => onComplete());

  useEffect(() => { if (!open) { setPhase("review"); runner.reset(); } }, [open]);

  const gates = publishGates({
    approved, quality, completeness, evidence: 95, criticalConflicts, owner,
    effectiveDate, classification, consumers: publishDestinations.length,
  });
  const blocked = gates.filter((g) => !g.met);
  const blockedDestinations = publishDestinations.filter((d) => d.accessPolicyStatus === "Blocked");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Publish Persona · Payments Platform version {version}</DialogTitle>
          <DialogDescription className="text-[12px]">
            Publishing distributes the approved Persona to governed downstream Enterprise Cognitive Fabric services.
          </DialogDescription>
        </DialogHeader>

        {phase === "review" ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Publishing gates</div>
              <ul className="mt-1 space-y-0.5">
                {gates.map((g) => (
                  <li key={g.key} className="flex items-center justify-between gap-2 rounded border border-slate-200 px-1.5 py-1 text-[10.5px]">
                    <span className="text-slate-700">{g.label}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-500">{g.actual} / {g.requirement}</span>
                      <Pill label={g.met ? "Met" : "Blocked"} tone={g.met ? "green" : "red"} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <dl>
                <Row label="Persona" value="Payments Platform" />
                <Row label="Version" value={version} />
                <Row label="Approval state" value={approved ? "Approved" : "Approval in progress"} />
                <Row label="Quality" value={quality} />
                <Row label="Completeness" value={`${completeness}%`} />
                <Row label="Confidence" value={`${confidence}%`} />
                <Row label="Freshness" value={freshness} />
                <Row label="Destinations" value={publishDestinations.length} />
                <Row label="Blocked destinations" value={blockedDestinations.map((d) => d.name).join(", ") || "None"} />
              </dl>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Access classification
                  <Input value={classification} onChange={(e) => setClassification(e.target.value)} className="mt-0.5 h-7 text-[11.5px]" />
                </label>
                <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Effective date
                  <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className="mt-0.5 h-7 text-[11.5px]" />
                </label>
                <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Expiration date
                  <Input type="date" value={expiration} onChange={(e) => setExpiration(e.target.value)} className="mt-0.5 h-7 text-[11.5px]" />
                </label>
                <label className="col-span-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Publish notes
                  <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-0.5 text-[11.5px]" />
                </label>
              </div>
            </div>
          </div>
        ) : (
          <StepList steps={PUBLISH_STEPS} index={runner.index} />
        )}

        <DialogFooter className="flex-wrap gap-1.5">
          {phase === "review" ? (
            <>
              <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button size="sm" disabled={blocked.length > 0} onClick={() => { setPhase("running"); runner.start(); }}>
                {blocked.length > 0 ? `Blocked by ${blocked.length} gate(s)` : "Publish Persona"}
              </Button>
            </>
          ) : (
            <Button size="sm" disabled={runner.running} onClick={() => onOpenChange(false)}>
              {runner.running ? "Publishing" : "Close"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------- publishing history ---------------------------- */

export function PublishingHistoryDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Publishing History" description="Recent Persona distributions" wide>
      <ul className="space-y-2">
        {publicationHistory.map((p) => (
          <li key={p.id} className="rounded-md border border-slate-200 p-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-slate-800">{p.id} · version {p.personaVersionId}</span>
              <Pill label={p.status} tone={p.status === "Published" ? "green" : "amber"} />
            </div>
            <dl>
              <Row label="Published by" value={p.publishedBy} />
              <Row label="Started" value={p.startedAt} />
              <Row label="Completed" value={p.completedAt ?? "—"} />
              <Row label="Access validation" value={p.accessValidationStatus} />
              <Row label="Destinations" value={p.destinations.length} />
            </dl>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}

/* ------------------------------ export dialog ----------------------------- */

export function ExportPersonasDialog({
  open, onOpenChange, rows, onExported,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rows: Record<string, string | number>[];
  onExported: (format: ExportFormat, scope: string, count: number) => void;
}) {
  const [format, setFormat] = useState<ExportFormat>("CSV");
  const [scope, setScope] = useState<string>(EXPORT_SCOPES[2]);
  const [options, setOptions] = useState<string[]>(EXPORT_OPTIONS.slice(0, 6));

  const toggle = (o: string) => setOptions((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));

  const run = () => {
    const head = Object.keys(rows[0] ?? { persona: "" });
    let content = "";
    let type = "text/csv";
    let ext = "csv";
    if (format === "CSV") {
      content = rowsToCsv(head, rows.map((r) => head.map((h) => r[h] ?? "")));
    } else if (format === "JSON") {
      content = JSON.stringify({ scope, options, personas: rows }, null, 2); type = "application/json"; ext = "json";
    } else if (format === "YAML") {
      content = toYaml({ scope, options, personas: rows }); type = "text/yaml"; ext = "yaml";
    } else {
      content = `${format}\nScope: ${scope}\nSections: ${options.join(", ")}\nPersonas: ${rows.length}`;
      type = "text/plain"; ext = "txt";
    }
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `team-personas.${ext}`; a.click();
    URL.revokeObjectURL(url);
    onExported(format, scope, rows.length);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Export Personas</DialogTitle>
          <DialogDescription className="text-[12px]">{rows.length} personas in the current selection</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-3">
          <fieldset>
            <legend className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Format</legend>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)} className="mt-1 grid gap-1">
              {EXPORT_FORMATS.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <RadioGroupItem value={f} id={`fmt-${f}`} />
                  <Label htmlFor={`fmt-${f}`} className="text-[11.5px] font-normal">{f}</Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>
          <fieldset>
            <legend className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Scope</legend>
            <RadioGroup value={scope} onValueChange={setScope} className="mt-1 grid gap-1">
              {EXPORT_SCOPES.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <RadioGroupItem value={s} id={`scope-x-${s}`} />
                  <Label htmlFor={`scope-x-${s}`} className="text-[11.5px] font-normal">{s}</Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>
          <fieldset>
            <legend className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Options</legend>
            <div className="mt-1 grid max-h-56 gap-0.5 overflow-auto pr-1">
              {EXPORT_OPTIONS.map((o) => (
                <label key={o} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                  <Checkbox checked={options.includes(o)} onCheckedChange={() => toggle(o)} aria-label={o} /> {o}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <DialogFooter>
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={run}>Generate Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------- global search ------------------------------- */

export function GlobalSearchDialog({
  open, onOpenChange, initialQuery, onOpenResult,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialQuery: string;
  onOpenResult: (r: SearchRecord) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<SearchType | "All">("All");
  useEffect(() => { if (open) setQuery(initialQuery); }, [open, initialQuery]);

  const results = useMemo(() => runSearch(query, type), [query, type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Search Personas, Conditions and Governance Records</DialogTitle>
          <DialogDescription className="text-[12px]">Search across personas, teams, conditions, dependencies, evidence, reviews, conflicts and versions</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search query" className="h-8 flex-1 text-[11.5px]" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as SearchType | "All")}
            aria-label="Result type"
            className="h-8 rounded-md border border-slate-200 px-2 text-[11.5px]"
          >
            <option value="All">All types</option>
            {SEARCH_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap gap-1">
          {EXAMPLE_SEARCHES.map((s) => (
            <button key={s} type="button" onClick={() => setQuery(s)} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
              {s}
            </button>
          ))}
        </div>

        <div className="max-h-[46vh] overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Search results</caption>
            <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>{["Result type", "Persona or record", "Team", "Section", "Status", "Quality", "Confidence", "Action"].map((h) => (
                <th key={h} scope="col" className="px-2 py-1.5 font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{r.type}</td>
                  <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-800">{r.record}</th>
                  <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{r.team}</td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{r.section}</td>
                  <td className="px-2 py-1.5"><Pill label={r.status} tone="blue" /></td>
                  <td className="px-2 py-1.5 text-slate-700">{r.quality}</td>
                  <td className="px-2 py-1.5 text-slate-700">{r.confidence}</td>
                  <td className="px-2 py-1.5">
                    <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => { onOpenResult(r); onOpenChange(false); }}>Open</Button>
                  </td>
                </tr>
              ))}
              {!results.length && (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-[11.5px] text-slate-500">No records match this search. Try one of the example searches above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------- quality detail drawer ------------------------- */

export function QualityDetailDrawer({
  open, onOpenChange, name, score, target, trend, onAction,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
  score: number;
  target: number;
  trend: number[];
  onAction: (action: string) => void;
}) {
  const detail = useMemo(() => qualityDetailFor(name, score, target), [name, score, target]);
  const direction = trend.length > 1 ? (trend[trend.length - 1] - trend[0] >= 0 ? "Improving" : "Declining") : "Flat";
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={name} description="Quality dimension detail" wide>
      <dl>
        <Row label="Definition" value={detail.definition} />
        <Row label="Current value" value={score} />
        <Row label="Target" value={target} />
        <Row label="Trend" value={direction} />
      </dl>

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Persona distribution</div>
        <ul className="mt-1 grid grid-cols-2 gap-1">
          {detail.personaDistribution.map((d) => (
            <li key={d.band} className="flex justify-between rounded border border-slate-200 px-1.5 py-1 text-[11px]">
              <span className="text-slate-600">{d.band}</span><span className="font-semibold text-slate-800">{d.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Business unit distribution</div>
          <ul className="mt-1 space-y-0.5">
            {detail.businessUnitDistribution.map((b) => (
              <li key={b.name} className="flex justify-between text-[11px]"><span className="text-slate-600">{b.name}</span><span className="text-slate-800">{b.score}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Knowledge domain distribution</div>
          <ul className="mt-1 space-y-0.5">
            {detail.knowledgeDomainDistribution.map((b) => (
              <li key={b.name} className="flex justify-between text-[11px]"><span className="text-slate-600">{b.name}</span><span className="text-slate-800">{b.score}</span></li>
            ))}
          </ul>
        </div>
      </div>

      {([
        ["Top failure causes", detail.failureCauses],
        ["Affected sections", detail.affectedSections],
        ["Affected conditions", detail.affectedConditions],
        ["Affected teams", detail.affectedTeams],
        ["Recommended actions", detail.recommendedActions],
        ["Recent changes", detail.recentChanges],
      ] as [string, string[]][]).map(([label, items]) => (
        <div key={label}>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
          <ul className="mt-0.5 list-inside list-disc text-[11.5px] text-slate-700">
            {items.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </div>
      ))}

      <div className="flex flex-wrap gap-1.5 border-t border-slate-200 pt-2">
        {["Recalculate Quality", "Open Conflicts", "Open Validation Queue", "Refresh Persona"].map((a) => (
          <Button key={a} size="sm" variant="outline" className="h-7 text-[10.5px]" onClick={() => onAction(a)}>{a}</Button>
        ))}
      </div>
    </Drawer>
  );
}

/* ---------------------------- notifications ------------------------------- */

export { StepList };
