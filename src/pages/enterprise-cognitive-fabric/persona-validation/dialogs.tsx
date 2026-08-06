/** Persona Validation — drawers, dialogs and wizards. */

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Drawer, Pill } from "../persona-studio/primitives";
import { validationTone } from "./panels";
import {
  bulkActions, exportOptions, exportScopes, exampleSearches, resolutionChoices,
  reviewerRoles, searchCategories, validationAreas, validationConflicts, validationExecutionSteps,
  validationGaps, validationHistory, validationNotifications, validationReviews, validationRules,
  validationScopes, versionDiff, versionDownstream,
  type QualityMetric, type ValidationConflict, type ValidationNotification, type ValidationReview,
  type VersionDiffRow,
} from "./data";

/* --------------------------- review detail drawer --------------------------- */

const reviewTabs = [
  "Overview", "Reason", "Sections", "Conditions", "Evidence", "Conflicts", "Gaps",
  "Dependencies", "Approval", "Downstream", "History", "Audit",
] as const;

export function ReviewDrawer({ open, onOpenChange, review, onAction }: {
  open: boolean; onOpenChange: (v: boolean) => void; review: ValidationReview | null;
  onAction: (action: string) => void;
}) {
  const [tab, setTab] = useState<typeof reviewTabs[number]>("Overview");
  if (!review) return null;
  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide
      title={`${review.persona} — ${review.reviewType}`}
      description={`${review.id} · ${review.reason}`}>
      <div role="tablist" aria-label="Review detail" className="flex flex-wrap gap-1 border-b border-slate-200 pb-1">
        {reviewTabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>{t}</button>
        ))}
      </div>
      <div className="mt-2 space-y-2 text-[11.5px] text-slate-700">
        {tab === "Overview" && (
          <dl className="grid grid-cols-2 gap-1">
            {[
              ["Review ID", review.id], ["Persona", review.persona], ["Team", review.team],
              ["Business Unit", review.businessUnit], ["Priority", review.priority], ["Severity", review.severity],
              ["Current Stage", review.currentStage], ["Approval Stage", review.approvalStage],
              ["Reviewer", review.reviewer], ["Reviewer Role", review.reviewerRole],
              ["Quality", String(review.quality)], ["Completeness", `${review.completeness}%`],
              ["Confidence", `${review.confidence}%`], ["Evidence Coverage", `${review.evidenceCoverage}%`],
              ["Conflicts", String(review.conflicts)], ["Due", review.due], ["Age", review.age],
              ["Freshness", review.freshness], ["Access", review.accessClassification], ["Status", review.status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-slate-100 py-0.5">
                <dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {tab === "Reason" && <p>{review.reason}. Validation is required before this Persona can be published for enterprise reuse.</p>}
        {tab === "Sections" && <p>Section under review: <strong>{review.sectionId}</strong>. Open the Validation Workbench to validate the section against its conditions and evidence.</p>}
        {tab === "Conditions" && <p>{review.persona} maps to approved business conditions. {review.conflicts} condition conflict(s) remain open for this review.</p>}
        {tab === "Evidence" && <p>Evidence coverage is {review.evidenceCoverage} percent with {review.authorityLevel} authority and {review.freshness.toLowerCase()} freshness.</p>}
        {tab === "Conflicts" && <p>Conflict type: {review.conflictType}. Open the conflict comparison to select the authoritative record.</p>}
        {tab === "Gaps" && <p>Gap type: {review.gapType}.</p>}
        {tab === "Dependencies" && <p>Dependency team: {review.dependencyTeam}. Dependency owner confirmation is part of this review.</p>}
        {tab === "Approval" && <p>Approval stage {review.approvalStage}. Team owner: {review.teamOwner}. Persona owner: {review.personaOwner}.</p>}
        {tab === "Downstream" && <p>Downstream impact: {review.downstreamImpact}.</p>}
        {tab === "History" && (
          <ol className="space-y-1">
            {validationHistory.slice(0, 6).map((h) => (
              <li key={h.id} className="rounded border border-slate-200 px-2 py-1">
                <span className="font-mono text-[10px] text-slate-500">{h.at}</span> — {h.action}: {h.previousState} → {h.newState}
              </li>
            ))}
          </ol>
        )}
        {tab === "Audit" && <p>Audit trail is preserved for every reviewer decision associated with {review.id}.</p>}
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {["Open Workbench", "Approve", "Approve with Conditions", "Request Changes", "Reject", "Request Evidence", "Request Dependency Review", "Escalate to Governance"].map((a) => (
          <Button key={a} size="sm" variant={a === "Approve" ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => onAction(a)}>{a}</Button>
        ))}
      </div>
    </Drawer>
  );
}

/* --------------------------- quality detail drawer -------------------------- */

export function QualityDrawer({ open, onOpenChange, metric }: {
  open: boolean; onOpenChange: (v: boolean) => void; metric: QualityMetric | null;
}) {
  if (!metric) return null;
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={`${metric.name} — Quality Detail`} description={metric.definition}>
      <dl className="grid grid-cols-2 gap-1 text-[11.5px]">
        {[
          ["Current", String(metric.score)], ["Target", String(metric.target)],
          ["Variance", String(metric.score - metric.target)], ["Trend", metric.trend.join(" → ")],
          ["Personas Affected", String(metric.affected)], ["Sections Affected", String(metric.affected * 3)],
          ["Review Type Distribution", "Owner 44%, Dependency 31%, Governance 25%"],
          ["Business Unit Distribution", "Commerce 42%, Security 23%, Platform 20%, Other 15%"],
          ["Knowledge Domain Distribution", "Payments 38%, Identity 22%, Reliability 21%, Other 19%"],
          ["Downstream Impact", "4 evaluations, 2 decisions"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2 border-b border-slate-100 py-0.5">
            <dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>
      <div>
        <h4 className="text-[11px] font-semibold text-slate-800">Top failure causes</h4>
        <ul className="list-disc pl-4 text-[11px] text-slate-700">{metric.causes.map((c) => <li key={c}>{c}</li>)}</ul>
      </div>
      <div>
        <h4 className="text-[11px] font-semibold text-slate-800">Recommended actions</h4>
        <ul className="list-disc pl-4 text-[11px] text-slate-700">{metric.actions.map((c) => <li key={c}>{c}</li>)}</ul>
      </div>
      <div>
        <h4 className="text-[11px] font-semibold text-slate-800">Recent changes</h4>
        <ul className="list-disc pl-4 text-[11px] text-slate-700">
          <li>Score moved from {metric.trend[0]} to {metric.score} over four periods.</li>
          <li>Latest reviewer decisions recalculated this dimension.</li>
        </ul>
      </div>
    </Drawer>
  );
}

/* ------------------------- conflict resolution dialog ----------------------- */

export function ConflictResolutionDialog({ open, onOpenChange, conflict, onResolve }: {
  open: boolean; onOpenChange: (v: boolean) => void; conflict: ValidationConflict | null;
  onResolve: (choice: string, reason: string) => void;
}) {
  const [choice, setChoice] = useState(resolutionChoices[0]);
  const [reason, setReason] = useState("");
  const [ack, setAck] = useState(false);
  if (!conflict) return null;
  const rows: [string, string, string][] = [
    ["Statement", conflict.recordA, conflict.recordB],
    ["Condition Type", conflict.conflictType, conflict.conflictType],
    ["Value / Threshold", conflict.recordAId, conflict.recordBId],
    ["Owner", conflict.ownerA, conflict.ownerB],
    ["Authority", conflict.authorityA, conflict.authorityB],
    ["Evidence", conflict.sourceA, conflict.sourceB],
    ["Confidence", `${conflict.confidenceA}%`, `${conflict.confidenceB}%`],
    ["Freshness", conflict.freshnessA, conflict.freshnessB],
    ["Applicability", conflict.applicabilityA, conflict.applicabilityB],
    ["Effective Period", conflict.effectiveA, conflict.effectiveB],
    ["Affected Personas", conflict.affectedTeams, conflict.affectedTeams],
    ["Affected Evaluations", conflict.affectedEvaluations, conflict.affectedEvaluations],
    ["Affected Decisions", conflict.affectedDecisions, conflict.affectedDecisions],
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Persona Conflict Resolution — {conflict.id}</DialogTitle>
          <DialogDescription className="text-[12px]">
            {conflict.persona} · {conflict.section} · {conflict.conflictType}
          </DialogDescription>
        </DialogHeader>
        <table className="w-full border-collapse text-[11.5px]">
          <caption className="sr-only">Side by side conflict comparison</caption>
          <thead>
            <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-2 py-1">Dimension</th>
              <th scope="col" className="px-2 py-1">Record A</th>
              <th scope="col" className="px-2 py-1">Record B</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(([dim, a, b]) => (
              <tr key={dim} className={cn(a !== b && "bg-amber-50/60")}>
                <th scope="row" className="px-2 py-1 text-left font-medium text-slate-700">{dim}</th>
                <td className="px-2 py-1 text-slate-800">{a}</td>
                <td className="px-2 py-1 text-slate-800">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="rounded border border-blue-200 bg-blue-50 p-2 text-[11.5px] text-blue-900">
          <strong>Recommended resolution:</strong> {conflict.recommendedResolution}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-[10px] uppercase tracking-wide text-slate-500">
            Resolution
            <select value={choice} onChange={(e) => setChoice(e.target.value)}
              className="mt-0.5 h-8 w-full rounded border border-slate-200 px-1.5 text-[11.5px] text-slate-800">
              {resolutionChoices.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-[10px] uppercase tracking-wide text-slate-500">
            Resolution reason
            <input value={reason} onChange={(e) => setReason(e.target.value)}
              className="mt-0.5 h-8 w-full rounded border border-slate-200 px-1.5 text-[11.5px] text-slate-800" />
          </label>
        </div>
        <label className="flex items-start gap-1.5 text-[11px] text-slate-700">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5" />
          I acknowledge the impact on {conflict.affectedEvaluations} and {conflict.affectedDecisions}.
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!reason || !ack} onClick={() => { onResolve(choice, reason); onOpenChange(false); }}>Resolve Conflict</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------- approval dialog ------------------------------- */

export function ApprovalDialog({ open, onOpenChange, onDecision }: {
  open: boolean; onOpenChange: (v: boolean) => void; onDecision: (decision: string, comments: string) => void;
}) {
  const [decision, setDecision] = useState("Approve");
  const [comments, setComments] = useState("");
  const [effective, setEffective] = useState("2026-08-10");
  const requiresComment = ["Approve with Conditions", "Reject"].includes(decision);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Approve Persona — Payments Platform v3.4 Draft</DialogTitle>
          <DialogDescription className="text-[12px]">Approval routing reflects Persona criticality, dependencies and open conflicts.</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-1 text-[11.5px] sm:grid-cols-3">
          {[
            ["Persona", "Payments Platform"], ["Version", "v3.4 Draft"], ["Quality", "94"],
            ["Completeness", "92 percent"], ["Confidence", "95 percent"], ["Freshness", "Current"],
            ["Evidence Coverage", "95 percent"], ["Critical Conflicts", "1"], ["Known Gaps", "2"],
            ["Dependencies", "18"], ["Downstream Consumers", "6"], ["Affected Evaluations", "2"],
            ["Affected Decisions", "1"],
          ].map(([k, v]) => (
            <div key={k} className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
              <dt className="text-[9.5px] uppercase tracking-wide text-slate-500">{k}</dt>
              <dd className="font-semibold text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-[10px] uppercase tracking-wide text-slate-500">
            Decision
            <select value={decision} onChange={(e) => setDecision(e.target.value)}
              className="mt-0.5 h-8 w-full rounded border border-slate-200 px-1.5 text-[11.5px] text-slate-800">
              {["Submit for Review", "Approve", "Approve with Conditions", "Request Changes", "Reject", "Withdraw"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label className="text-[10px] uppercase tracking-wide text-slate-500">
            Proposed effective date
            <input type="date" value={effective} onChange={(e) => setEffective(e.target.value)}
              className="mt-0.5 h-8 w-full rounded border border-slate-200 px-1.5 text-[11.5px] text-slate-800" />
          </label>
        </div>
        <label className="text-[10px] uppercase tracking-wide text-slate-500">
          Comments {requiresComment && <span className="text-red-600">(required)</span>}
          <textarea rows={3} value={comments} onChange={(e) => setComments(e.target.value)}
            className="mt-0.5 w-full rounded border border-slate-200 p-1.5 text-[11.5px] text-slate-800" />
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={requiresComment && !comments} onClick={() => { onDecision(decision, comments); onOpenChange(false); }}>
            Confirm {decision}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- version validation ----------------------------- */

export function VersionDialog({ open, onOpenChange, onAction }: {
  open: boolean; onOpenChange: (v: boolean) => void; onAction: (action: string, row?: VersionDiffRow) => void;
}) {
  const [filter, setFilter] = useState<"All" | VersionDiffRow["change"]>("All");
  const rows = versionDiff.filter((r) => filter === "All" || r.change === filter);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Version Validation — Payments Platform v3.3 versus v3.4 Draft</DialogTitle>
          <DialogDescription className="text-[12px]">Material changes require reassessment of dependent evaluations and decisions.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1">
          {(["All", "Added", "Removed", "Changed", "Unchanged"] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => setFilter(f)}>{f}</Button>
          ))}
        </div>
        <table className="w-full border-collapse text-[11.5px]">
          <caption className="sr-only">Version comparison</caption>
          <thead>
            <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
              {["Section", "v3.3", "v3.4 Draft", "Change", "Actions"].map((h) => <th key={h} scope="col" className="px-2 py-1">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.section} className={cn(r.change !== "Unchanged" && "bg-blue-50/40")}>
                <th scope="row" className="px-2 py-1 text-left font-medium text-slate-800">{r.section}</th>
                <td className="px-2 py-1 text-slate-700">{r.previous}</td>
                <td className="px-2 py-1 text-slate-900">{r.current}</td>
                <td className="px-2 py-1"><Pill label={r.change} tone={r.change === "Unchanged" ? "slate" : r.change === "Removed" ? "red" : "blue"} /></td>
                <td className="px-2 py-1">
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAction("Accept Change", r)}>Accept</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onAction("Reject Change", r)}>Reject</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onAction("Restore Prior Value", r)}>Restore</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="list-disc pl-4 text-[11.5px] text-slate-700">
          {versionDownstream.map((d) => <li key={d}>{d}</li>)}
        </ul>
        <DialogFooter>
          <Button variant="outline" onClick={() => onAction("Request Evidence")}>Request Evidence</Button>
          <Button onClick={() => { onAction("Approve Version"); onOpenChange(false); }}>Approve Version</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- start validation wizard ------------------------ */

export function StartValidationDialog({ open, onOpenChange, onComplete }: {
  open: boolean; onOpenChange: (v: boolean) => void; onComplete: (summary: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState(validationScopes[3]);
  const [areas, setAreas] = useState<string[]>(["Identity", "Evidence", "Dependencies", "Decision Logic"]);
  const [rules, setRules] = useState<string[]>(validationRules.slice(0, 5));
  const [roles, setRoles] = useState<string[]>(["Persona Owner", "Team Owner", "Dependency Owners"]);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setProgress((p) => {
        const next = p + 1;
        if (next >= validationExecutionSteps.length) { clearInterval(t); setRunning(false); setDone(true); }
        return Math.min(next, validationExecutionSteps.length);
      });
    }, 220);
    return () => clearInterval(t);
  }, [running]);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const reset = () => { setStep(0); setProgress(0); setRunning(false); setDone(false); };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Start Validation</DialogTitle>
          <DialogDescription className="text-[12px]">Step {step + 1} of 6</DialogDescription>
        </DialogHeader>

        {step === 0 && (
          <fieldset className="space-y-1">
            <legend className="text-[12px] font-semibold text-slate-800">Select Scope</legend>
            {validationScopes.map((s) => (
              <label key={s} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                <input type="radio" name="scope" checked={scope === s} onChange={() => setScope(s)} />{s}
              </label>
            ))}
          </fieldset>
        )}
        {step === 1 && (
          <fieldset className="grid grid-cols-2 gap-1">
            <legend className="text-[12px] font-semibold text-slate-800">Validation Areas</legend>
            {validationAreas.map((a) => (
              <label key={a} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                <input type="checkbox" checked={areas.includes(a)} onChange={() => toggle(areas, setAreas, a)} />{a}
              </label>
            ))}
          </fieldset>
        )}
        {step === 2 && (
          <fieldset className="space-y-1">
            <legend className="text-[12px] font-semibold text-slate-800">Validation Rules</legend>
            {validationRules.map((r) => (
              <label key={r} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                <input type="checkbox" checked={rules.includes(r)} onChange={() => toggle(rules, setRules, r)} />{r}
              </label>
            ))}
          </fieldset>
        )}
        {step === 3 && (
          <fieldset className="space-y-1">
            <legend className="text-[12px] font-semibold text-slate-800">Reviewer Assignment</legend>
            {reviewerRoles.map((r) => (
              <label key={r} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                <input type="checkbox" checked={roles.includes(r)} onChange={() => toggle(roles, setRoles, r)} />{r}
              </label>
            ))}
          </fieldset>
        )}
        {step === 4 && (
          <dl className="grid grid-cols-2 gap-1 text-[11.5px]">
            {[
              ["Personas selected", scope === "Personas Awaiting Review" ? "14" : "6"],
              ["Sections evaluated", String(areas.length * 21)], ["Conditions evaluated", "1,284"],
              ["Evidence records", "3,911"], ["Dependencies", "62"], ["Expected conflicts", "9"],
              ["Expected gaps", "17"], ["Review tasks", "27"], ["Estimated duration", "6 minutes"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-slate-100 py-0.5">
                <dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {step === 5 && (
          <div className="space-y-2">
            <Progress value={(progress / validationExecutionSteps.length) * 100} aria-label="Validation progress" />
            <ol className="space-y-0.5 text-[11.5px]">
              {validationExecutionSteps.map((s, i) => (
                <li key={s} className={cn("flex items-center gap-2", i < progress ? "text-emerald-700" : i === progress ? "text-blue-700" : "text-slate-400")}>
                  <span aria-hidden>{i < progress ? "✓" : i === progress ? "•" : "○"}</span>{s}
                </li>
              ))}
            </ol>
            {done && (
              <dl className="grid grid-cols-2 gap-1 rounded border border-emerald-200 bg-emerald-50 p-2 text-[11.5px]">
                {[["Personas evaluated", "14"], ["Sections approved", "231"], ["Conflicts", "9"], ["Gaps", "17"],
                  ["Dependency reviews", "4"], ["Team owner reviews", "7"], ["Governance reviews", "3"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2"><dt className="text-emerald-800">{k}</dt><dd className="font-semibold text-emerald-900">{v}</dd></div>
                ))}
              </dl>
            )}
          </div>
        )}

        <DialogFooter>
          {step > 0 && step < 5 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 4 && <Button onClick={() => setStep(step + 1)}>Next</Button>}
          {step === 4 && <Button onClick={() => { setStep(5); setRunning(true); }}>Execute</Button>}
          {step === 5 && done && (
            <>
              <Button variant="outline" onClick={() => { onComplete("Validation run complete"); onOpenChange(false); reset(); }}>Open Results</Button>
              <Button variant="outline" onClick={() => { onComplete("Opening next review"); onOpenChange(false); reset(); }}>Open Next Review</Button>
              <Button onClick={() => { onComplete("Opening validation queue"); onOpenChange(false); reset(); }}>Open Validation Queue</Button>
            </>
          )}
          {step === 5 && !done && <Button variant="outline" onClick={() => { onOpenChange(false); reset(); }}>Close</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------- bulk actions ------------------------------ */

export function BulkActionsDialog({ open, onOpenChange, count, onApply }: {
  open: boolean; onOpenChange: (v: boolean) => void; count: number; onApply: (action: string) => void;
}) {
  const [action, setAction] = useState(bulkActions[0]);
  const [confirmed, setConfirmed] = useState(false);
  const highImpact = ["Request Team Owner Approval", "Escalate", "Refresh Persona"].includes(action);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Bulk Actions</DialogTitle>
          <DialogDescription className="text-[12px]">{count} review task(s) selected.</DialogDescription>
        </DialogHeader>
        <label className="text-[10px] uppercase tracking-wide text-slate-500">
          Action
          <select value={action} onChange={(e) => { setAction(e.target.value); setConfirmed(false); }}
            className="mt-0.5 h-8 w-full rounded border border-slate-200 px-1.5 text-[11.5px] text-slate-800">
            {bulkActions.map((a) => <option key={a}>{a}</option>)}
          </select>
        </label>
        {highImpact && (
          <div className="rounded border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-900">
            <p className="font-semibold">High impact action</p>
            <ul className="list-disc pl-4">
              <li>Personas affected: {count}</li>
              <li>Reviews affected: {count}</li>
              <li>Critical conflicts: 2</li>
              <li>Affected evaluations: 4</li>
              <li>Affected decisions: 2</li>
            </ul>
            <label className="mt-1 flex items-center gap-1.5">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
              I confirm this bulk action on critical Personas.
            </label>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={highImpact && !confirmed} onClick={() => { onApply(action); onOpenChange(false); }}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------- export ---------------------------------- */

export function ExportDialog({ open, onOpenChange, onExport }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onExport: (format: string, scope: string, options: string[]) => void;
}) {
  const [format, setFormat] = useState("CSV");
  const [scope, setScope] = useState(exportScopes[0]);
  const [options, setOptions] = useState<string[]>(exportOptions.slice(0, 5));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Export Validation Report</DialogTitle>
          <DialogDescription className="text-[12px]">Exports are generated locally from the current validation state.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-[10px] uppercase tracking-wide text-slate-500">
            Format
            <select value={format} onChange={(e) => setFormat(e.target.value)}
              className="mt-0.5 h-8 w-full rounded border border-slate-200 px-1.5 text-[11.5px]">
              {["CSV", "JSON", "YAML", "PDF Summary", "Presentation Snapshot"].map((f) => <option key={f}>{f}</option>)}
            </select>
          </label>
          <label className="text-[10px] uppercase tracking-wide text-slate-500">
            Scope
            <select value={scope} onChange={(e) => setScope(e.target.value)}
              className="mt-0.5 h-8 w-full rounded border border-slate-200 px-1.5 text-[11.5px]">
              {exportScopes.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <fieldset className="grid grid-cols-2 gap-1">
          <legend className="text-[11px] font-semibold text-slate-800">Options</legend>
          {exportOptions.map((o) => (
            <label key={o} className="flex items-center gap-1.5 text-[11.5px] text-slate-700">
              <input type="checkbox" checked={options.includes(o)}
                onChange={() => setOptions(options.includes(o) ? options.filter((x) => x !== o) : [...options, o])} />{o}
            </label>
          ))}
        </fieldset>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onExport(format, scope, options); onOpenChange(false); }}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------- global search ----------------------------- */

export interface SearchResultRow {
  type: string; persona: string; section: string; issue: string; reviewer: string;
  priority: string; status: string; due: string; reviewId: string;
}

export function SearchDialog({ open, onOpenChange, onOpenResult }: {
  open: boolean; onOpenChange: (v: boolean) => void; onOpenResult: (r: SearchResultRow) => void;
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("Personas");
  const results = useMemo<SearchResultRow[]>(() => {
    const term = q.trim().toLowerCase();
    const base: SearchResultRow[] = [
      ...validationReviews.map((r) => ({
        type: "Review", persona: r.persona, section: r.sectionId, issue: r.reason,
        reviewer: r.reviewer, priority: r.priority, status: r.status, due: r.due, reviewId: r.id,
      })),
      ...validationConflicts.map((c) => ({
        type: "Conflict", persona: c.persona, section: c.section, issue: `${c.conflictType}: ${c.recordA} versus ${c.recordB}`,
        reviewer: c.ownerA, priority: c.severity, status: c.status, due: "—", reviewId: c.id,
      })),
      ...validationGaps.map((g) => ({
        type: "Gap", persona: g.persona, section: g.section, issue: g.missing,
        reviewer: g.owner, priority: g.severity, status: g.status, due: g.due, reviewId: g.id,
      })),
    ];
    if (!term) return base;
    return base.filter((r) => Object.values(r).join(" ").toLowerCase().includes(term));
  }, [q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Search Validation</DialogTitle>
          <DialogDescription className="text-[12px]">Search Personas, reviews, conditions, evidence, dependencies, conflicts and approvals.</DialogDescription>
        </DialogHeader>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search validation"
          placeholder="Search Personas, reviews, conflicts, gaps"
          className="h-9 w-full rounded border border-slate-200 px-2 text-[12px] focus:border-blue-400 focus:outline-none" />
        <div className="flex flex-wrap gap-1">
          {searchCategories.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c}
              className={cn("rounded border px-2 py-0.5 text-[10.5px]", category === c ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {exampleSearches.map((s) => (
            <button key={s} type="button" onClick={() => setQ(s.split(" ")[0])}
              className="rounded border border-slate-200 px-2 py-0.5 text-[10.5px] text-slate-600 hover:border-blue-300 hover:text-blue-700">{s}</button>
          ))}
        </div>
        <table className="w-full border-collapse text-[11.5px]">
          <caption className="sr-only">Search results</caption>
          <thead>
            <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
              {["Result Type", "Persona", "Section", "Issue", "Reviewer", "Priority", "Status", "Due", "Action"].map((h) => <th key={h} scope="col" className="px-2 py-1">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((r) => (
              <tr key={`${r.type}-${r.reviewId}`} className="hover:bg-slate-50">
                <td className="px-2 py-1">{r.type}</td>
                <td className="px-2 py-1 font-medium text-slate-900">{r.persona}</td>
                <td className="px-2 py-1">{r.section}</td>
                <td className="max-w-[280px] px-2 py-1">{r.issue}</td>
                <td className="px-2 py-1">{r.reviewer}</td>
                <td className="px-2 py-1">{r.priority}</td>
                <td className="px-2 py-1"><Pill label={r.status} tone={validationTone(r.status)} /></td>
                <td className="px-2 py-1">{r.due}</td>
                <td className="px-2 py-1">
                  <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => { onOpenResult(r); onOpenChange(false); }}>Open</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {results.length === 0 && <p className="text-[11.5px] text-slate-500">No results. Try a different term or clear the search.</p>}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------- notifications ----------------------------- */

export function NotificationsDrawer({ open, onOpenChange, notifications, onMarkAll, onMark, onOpenItem }: {
  open: boolean; onOpenChange: (v: boolean) => void; notifications: ValidationNotification[];
  onMarkAll: () => void; onMark: (id: string) => void; onOpenItem: (n: ValidationNotification) => void;
}) {
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(notifications.map((n) => n.category)))];
  const rows = notifications.filter((n) => filter === "All" || n.category === filter);
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Validation Notifications"
      description={`${notifications.filter((n) => !n.read).length} unread`}>
      <div className="flex flex-wrap items-center gap-1">
        <label className="sr-only" htmlFor="notif-filter">Filter notifications</label>
        <select id="notif-filter" value={filter} onChange={(e) => setFilter(e.target.value)}
          className="h-7 rounded border border-slate-200 px-1.5 text-[11px]">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onMarkAll}>Mark All Read</Button>
      </div>
      <ul className="space-y-1">
        {rows.map((n) => (
          <li key={n.id} className={cn("rounded border p-2", n.read ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/50")}>
            <div className="flex items-center justify-between gap-2">
              <Pill label={n.category} tone={n.tone} />
              <span className="font-mono text-[10px] text-slate-500">{n.at}</span>
            </div>
            <p className="mt-0.5 text-[11.5px] font-semibold text-slate-900">{n.title}</p>
            <p className="text-[11px] text-slate-600">{n.detail}</p>
            <div className="mt-1 flex gap-1">
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onOpenItem(n)}>Open Item</Button>
              <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onMark(n.id)}>Mark Read</Button>
              <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onMark(n.id)}>Acknowledge</Button>
            </div>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}

export const seedNotifications = validationNotifications;
