/* Discovery Configuration — Prompt 2 governance dialogs, wizards and overlays. */

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "../command-center/panels";
import { cn } from "@/lib/utils";
import { fmt } from "./data";
import {
  activationExecutionSteps, activationSteps, conflictResolutionActions, conflictRuleFaces,
  demoStory, exceptionTypes, exportFormats, exportOptions, exportScopes, preactivationChecks,
  searchExamples, seedPrecheck, stateTone,
  type DiscoveryConfigurationException, type DiscoveryConfigurationImpact,
  type DiscoveryConfigurationVersion, type DiscoveryRuleConflict, type SearchResult,
} from "./gov-data";

/* --------------------------------------------------- conflict resolution */

export function ConflictResolutionDialog({
  open, onOpenChange, conflict, onResolve,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  conflict: DiscoveryRuleConflict | null;
  onResolve: (id: string, payload: { action: string; reason: string; reviewer: string; effectiveDate: string }) => void;
}) {
  const [action, setAction] = useState(conflictResolutionActions[2]);
  const [reason, setReason] = useState("");
  const [reviewer, setReviewer] = useState("Discovery Governance");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [ack, setAck] = useState(false);

  useEffect(() => {
    if (open && conflict) {
      setAction(conflict.recommendedResolution.startsWith("Keep Both") ? "Keep Both with Explicit Precedence" : conflictResolutionActions[2]);
      setReason(""); setAck(false); setEffectiveDate("");
    }
  }, [open, conflict]);

  if (!conflict) return null;
  const faces = conflictRuleFaces[conflict.id];
  const fields: [string, keyof typeof faces.a][] = [
    ["Name", "name"], ["Type", "type"], ["Scope", "scope"], ["Conditions", "conditions"],
    ["Action", "action"], ["Priority", "priority"], ["Owner", "owner"], ["Effective Date", "effectiveDate"],
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Rule Conflict Resolution · {conflict.id}</DialogTitle>
          <DialogDescription className="text-[12px]">
            {conflict.conflictType} · overlap on {conflict.overlapScope}. Recommended: {conflict.recommendedResolution}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          {(["a", "b"] as const).map((k) => (
            <div key={k} className="rounded-lg border border-slate-200 p-2.5">
              <h3 className="text-[11.5px] font-semibold text-slate-800">Rule {k.toUpperCase()} · {k === "a" ? conflict.ruleAId : conflict.ruleBId}</h3>
              <dl className="mt-1.5 space-y-0.5 text-[11px]">
                {fields.map(([label, key]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-right text-slate-800">{String(faces[k][key])}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11.5px] text-amber-800">
          Overlap: {conflict.overlapScope}. {conflict.status === "Valid Override" ? "This is a legitimate inheritance override, not a conflict." : "Both rules currently apply to the same artifacts."}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] font-medium text-slate-600">Resolution action</span>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="mt-0.5 h-8 text-[12px]" aria-label="Resolution action"><SelectValue /></SelectTrigger>
              <SelectContent>{conflictResolutionActions.map((a) => <SelectItem key={a} value={a} className="text-[12px]">{a}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="block">
            <span className="text-[11px] font-medium text-slate-600">Reviewer</span>
            <Input value={reviewer} onChange={(e) => setReviewer(e.target.value)} className="mt-0.5 h-8 text-[12px]" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium text-slate-600">Effective date</span>
            <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className="mt-0.5 h-8 text-[12px]" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[11px] font-medium text-slate-600">Reason (required)</span>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} className="mt-0.5 text-[12px]" rows={2} />
          </label>
        </div>
        <label className="flex items-center gap-2 text-[11.5px] text-slate-700">
          <Checkbox checked={ack} onCheckedChange={(v) => setAck(Boolean(v))} aria-label="Impact acknowledgement" />
          I acknowledge the discovery and downstream impact of this resolution
        </label>

        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            size="sm" className="h-8 text-[12px]" disabled={!reason.trim() || !ack}
            onClick={() => { onResolve(conflict.id, { action, reason, reviewer, effectiveDate }); onOpenChange(false); }}
          >
            Record resolution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------------------------- review decision */

export function ReviewDecisionDialog({
  open, onOpenChange, reviewId, action, onSubmit,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  reviewId: string; action: string;
  onSubmit: (payload: { conditions: string; comments: string }) => void;
}) {
  const [comments, setComments] = useState("");
  const [conditions, setConditions] = useState("");
  useEffect(() => { if (open) { setComments(""); setConditions(""); } }, [open]);
  const requiresComment = ["Approve with Conditions", "Reject", "Create Exception", "Request Changes", "Escalate"].includes(action);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{action} · {reviewId}</DialogTitle>
          <DialogDescription className="text-[12px]">
            {requiresComment ? "Comments are required for this decision." : "Comments are optional for a straight approval."}
          </DialogDescription>
        </DialogHeader>
        {action === "Approve with Conditions" && (
          <label className="block">
            <span className="text-[11px] font-medium text-slate-600">Conditions (required)</span>
            <Textarea value={conditions} onChange={(e) => setConditions(e.target.value)} rows={2} className="mt-0.5 text-[12px]" />
          </label>
        )}
        <label className="block">
          <span className="text-[11px] font-medium text-slate-600">Comments{requiresComment ? " (required)" : ""}</span>
          <Textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={3} className="mt-0.5 text-[12px]" />
        </label>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            size="sm" className="h-8 text-[12px]"
            disabled={(requiresComment && !comments.trim()) || (action === "Approve with Conditions" && !conditions.trim())}
            onClick={() => { onSubmit({ conditions, comments }); onOpenChange(false); }}
          >
            Submit decision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------------- exception */

export function ExceptionDialog({
  open, onOpenChange, onCreate,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onCreate: (e: Omit<DiscoveryConfigurationException, "id">) => void;
}) {
  const [type, setType] = useState(exceptionTypes[0]);
  const [scope, setScope] = useState("Approved pilot channels");
  const [reason, setReason] = useState("");
  const [owner, setOwner] = useState("Discovery Operations");
  const [approver, setApprover] = useState("Data Governance");
  const [days, setDays] = useState("30");
  const [monitoring, setMonitoring] = useState("Weekly access review");
  useEffect(() => { if (open) setReason(""); }, [open]);

  const effective = new Date();
  const expiry = new Date(effective.getTime() + Number(days || 0) * 86_400_000);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Create Configuration Exception</DialogTitle>
          <DialogDescription className="text-[12px]">All exceptions are time bounded, monitored and expire automatically.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-[11px] font-medium text-slate-600">Exception type</span>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="mt-0.5 h-8 text-[12px]" aria-label="Exception type"><SelectValue /></SelectTrigger>
              <SelectContent>{exceptionTypes.map((t) => <SelectItem key={t} value={t} className="text-[12px]">{t}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="block"><span className="text-[11px] font-medium text-slate-600">Scope</span>
            <Input value={scope} onChange={(e) => setScope(e.target.value)} className="mt-0.5 h-8 text-[12px]" /></label>
          <label className="block"><span className="text-[11px] font-medium text-slate-600">Expires in (days)</span>
            <Input value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, ""))} className="mt-0.5 h-8 text-[12px]" /></label>
          <label className="block"><span className="text-[11px] font-medium text-slate-600">Owner</span>
            <Input value={owner} onChange={(e) => setOwner(e.target.value)} className="mt-0.5 h-8 text-[12px]" /></label>
          <label className="block"><span className="text-[11px] font-medium text-slate-600">Approver</span>
            <Input value={approver} onChange={(e) => setApprover(e.target.value)} className="mt-0.5 h-8 text-[12px]" /></label>
          <label className="block sm:col-span-2"><span className="text-[11px] font-medium text-slate-600">Monitoring requirements</span>
            <Input value={monitoring} onChange={(e) => setMonitoring(e.target.value)} className="mt-0.5 h-8 text-[12px]" /></label>
          <label className="block sm:col-span-2"><span className="text-[11px] font-medium text-slate-600">Reason (required)</span>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="mt-0.5 text-[12px]" /></label>
        </div>
        <p className="text-[11px] text-slate-500">Expires {expiry.toISOString().slice(0, 10)} · review required before extension.</p>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            size="sm" className="h-8 text-[12px]" disabled={!reason.trim()}
            onClick={() => {
              onCreate({
                configurationId: "DISC-CFG-001", configurationVersion: "4.3", exceptionType: type,
                scope, ruleId: "RULE-1147", policyType: "Discovery policy", reason, owner, approver,
                effectiveDate: effective.toISOString().slice(0, 10), expirationDate: expiry.toISOString().slice(0, 10),
                monitoringRequirements: monitoring, status: "Active",
              });
              onOpenChange(false);
            }}
          >
            Create exception
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------ activation wizard */

export interface ActivationPlan {
  version: string; mode: "Immediate" | "Scheduled" | "Phased by Scope";
  scheduledDate: string; scheduledTime: string; scope: string; maintenanceWindow: string;
  preValidationTime: string; notificationWindow: string;
  incremental: boolean; fullReconciliation: boolean; metadataFirst: boolean; pauseOnError: boolean;
  rollbackVersion: string; rollbackTrigger: string; rollbackOwner: string;
}

const defaultPlan: ActivationPlan = {
  version: "4.3", mode: "Immediate", scheduledDate: "", scheduledTime: "", scope: "Enterprise",
  maintenanceWindow: "Standard enterprise window", preValidationTime: "", notificationWindow: "",
  incremental: true, fullReconciliation: false, metadataFirst: true, pauseOnError: true,
  rollbackVersion: "4.2", rollbackTrigger: "Critical validation or scheduler failure", rollbackOwner: "Discovery Operations",
};

export function ActivationWizard({
  open, onOpenChange, impact, blocked, blockReason, running, executionStep, onActivate,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  impact: DiscoveryConfigurationImpact; blocked: boolean; blockReason: string;
  running: boolean; executionStep: number;
  onActivate: (plan: ActivationPlan) => void;
}) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<ActivationPlan>(defaultPlan);
  useEffect(() => { if (open) { setStep(0); setPlan(defaultPlan); } }, [open]);
  const set = <K extends keyof ActivationPlan>(k: K, v: ActivationPlan[K]) => setPlan((p) => ({ ...p, [k]: v }));

  const criticalUnavailable = seedPrecheck.some((p) => p.state === "Unavailable");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Activate Configuration</DialogTitle>
          <DialogDescription className="text-[12px]">
            Step {Math.min(step + 1, activationSteps.length)} of {activationSteps.length} · {activationSteps[Math.min(step, activationSteps.length - 1)]}
          </DialogDescription>
        </DialogHeader>

        <ol className="flex flex-wrap gap-1" aria-label="Activation steps">
          {activationSteps.map((s, i) => (
            <li key={s}>
              <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px]",
                i === step ? "border-blue-300 bg-blue-50 font-medium text-blue-800" : i < step ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500")}>
                {i + 1}. {s}
              </span>
            </li>
          ))}
        </ol>

        {blocked && (
          <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[11.5px] text-red-800">
            Activation is blocked: {blockReason}
          </p>
        )}

        <div className="min-h-[190px] rounded-lg border border-slate-200 p-3">
          {step === 0 && (
            <label className="block max-w-xs">
              <span className="text-[11px] font-medium text-slate-600">Approved configuration version</span>
              <Select value={plan.version} onValueChange={(v) => set("version", v)}>
                <SelectTrigger className="mt-0.5 h-8 text-[12px]" aria-label="Configuration version"><SelectValue /></SelectTrigger>
                <SelectContent>{["4.3", "4.2"].map((v) => <SelectItem key={v} value={v} className="text-[12px]">v{v}</SelectItem>)}</SelectContent>
              </Select>
              <p className="mt-2 text-[11px] text-slate-500">Only approved versions may be activated. Approved is not the same as Active.</p>
            </label>
          )}
          {step === 1 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {(["Immediate", "Scheduled", "Phased by Scope"] as const).map((m) => (
                  <Button key={m} size="sm" variant={plan.mode === m ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => set("mode", m)}>{m}</Button>
                ))}
              </div>
              {plan.mode === "Scheduled" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block"><span className="text-[11px] text-slate-600">Activation date</span>
                    <Input type="date" value={plan.scheduledDate} onChange={(e) => set("scheduledDate", e.target.value)} className="mt-0.5 h-8 text-[12px]" /></label>
                  <label className="block"><span className="text-[11px] text-slate-600">Activation time</span>
                    <Input type="time" value={plan.scheduledTime} onChange={(e) => set("scheduledTime", e.target.value)} className="mt-0.5 h-8 text-[12px]" /></label>
                  <label className="block"><span className="text-[11px] text-slate-600">Maintenance window</span>
                    <Input value={plan.maintenanceWindow} onChange={(e) => set("maintenanceWindow", e.target.value)} className="mt-0.5 h-8 text-[12px]" /></label>
                  <label className="block"><span className="text-[11px] text-slate-600">Preactivation validation time</span>
                    <Input type="time" value={plan.preValidationTime} onChange={(e) => set("preValidationTime", e.target.value)} className="mt-0.5 h-8 text-[12px]" /></label>
                  <label className="block"><span className="text-[11px] text-slate-600">Notification window</span>
                    <Input value={plan.notificationWindow} onChange={(e) => set("notificationWindow", e.target.value)} placeholder="e.g. 24 hours before" className="mt-0.5 h-8 text-[12px]" /></label>
                </div>
              )}
              {plan.mode === "Phased by Scope" && (
                <label className="block max-w-sm"><span className="text-[11px] text-slate-600">Phase scope</span>
                  <Input value={plan.scope} onChange={(e) => set("scope", e.target.value)} className="mt-0.5 h-8 text-[12px]" /></label>
              )}
            </div>
          )}
          {step === 2 && (
            <ul className="grid gap-1 sm:grid-cols-2">
              {preactivationChecks.map((c) => (
                <li key={c} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1 text-[11.5px]">
                  <span>{c}</span>
                  <StatusBadge tone={c === "Owners" ? "amber" : "green"}>{c === "Owners" ? "Warning" : "Passed"}</StatusBadge>
                </li>
              ))}
            </ul>
          )}
          {step === 3 && (
            <dl className="grid gap-1 text-[11.5px] sm:grid-cols-2">
              {[
                ["Sources added", String(impact.sourcesAdded)],
                ["Sources removed", String(impact.sourcesRemoved)],
                ["Projected artifact delta", `+${fmt(impact.projectedArtifactDelta)}`],
                ["Restricted content delta", `+${fmt(impact.restrictedArtifactDelta)}`],
                ["Downstream reprocessing", `${fmt(impact.downstreamReprocessingEstimate)} artifacts`],
                ["Active evaluations potentially affected", String(impact.affectedImpactEvaluationIds.length)],
                ["Historical decisions modified", String(impact.historicalDecisionModificationCount)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 rounded border border-slate-200 px-2 py-1">
                  <dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-800">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {step === 4 && (
            <div className="space-y-1.5">
              {([
                ["incremental", "Trigger Incremental Discovery"],
                ["fullReconciliation", "Trigger Full Reconciliation"],
                ["metadataFirst", "Metadata Only Validation First"],
                ["pauseOnError", "Pause on Critical Error"],
              ] as const).map(([k, label]) => (
                <label key={k} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1.5 text-[11.5px]">
                  <span>{label}</span>
                  <Switch checked={plan[k]} onCheckedChange={(v) => set(k, v)} aria-label={label} />
                </label>
              ))}
            </div>
          )}
          {step === 5 && (
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="block"><span className="text-[11px] text-slate-600">Previous active version</span>
                <Input value={`v${plan.rollbackVersion}`} readOnly className="mt-0.5 h-8 text-[12px]" /></label>
              <label className="block"><span className="text-[11px] text-slate-600">Rollback trigger</span>
                <Input value={plan.rollbackTrigger} onChange={(e) => set("rollbackTrigger", e.target.value)} className="mt-0.5 h-8 text-[12px]" /></label>
              <label className="block"><span className="text-[11px] text-slate-600">Rollback owner</span>
                <Input value={plan.rollbackOwner} onChange={(e) => set("rollbackOwner", e.target.value)} className="mt-0.5 h-8 text-[12px]" /></label>
            </div>
          )}
          {step === 6 && (
            <dl className="grid gap-1 text-[11.5px] sm:grid-cols-2">
              {[
                ["Version", `v${plan.version}`], ["Mode", plan.mode],
                ["Scheduled", plan.scheduledDate ? `${plan.scheduledDate} ${plan.scheduledTime}` : "Not scheduled"],
                ["Scope", plan.scope], ["Rollback version", `v${plan.rollbackVersion}`],
                ["Rollback owner", plan.rollbackOwner],
                ["Controls", [plan.incremental && "Incremental", plan.fullReconciliation && "Full reconciliation", plan.metadataFirst && "Metadata first", plan.pauseOnError && "Pause on error"].filter(Boolean).join(", ")],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 rounded border border-slate-200 px-2 py-1">
                  <dt className="text-slate-500">{k}</dt><dd className="text-right font-medium text-slate-800">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {step === 7 && (
            <div>
              <Progress value={(executionStep / activationExecutionSteps.length) * 100} className="h-1.5" />
              <ol className="mt-2 space-y-0.5">
                {activationExecutionSteps.map((s, i) => (
                  <li key={s} className={cn("text-[11.5px]", i < executionStep ? "text-emerald-700" : "text-slate-400")}>
                    {i < executionStep ? "✓" : "○"} {s}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <DialogFooter className="flex-wrap gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[12px]" disabled={step === 0 || running} onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="mr-1 h-3.5 w-3.5" aria-hidden /> Back
          </Button>
          {step < activationSteps.length - 1 ? (
            <Button size="sm" className="h-8 text-[12px]" onClick={() => setStep((s) => s + 1)}>
              Next <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden />
            </Button>
          ) : (
            <Button
              size="sm" className="h-8 text-[12px]"
              disabled={blocked || running || criticalUnavailable}
              onClick={() => onActivate(plan)}
            >
              {running ? "Activating…" : plan.mode === "Scheduled" ? "Schedule activation" : "Activate"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------------- rollback */

export function RollbackDialog({
  open, onOpenChange, versions, onRollback, running,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  versions: DiscoveryConfigurationVersion[];
  onRollback: (payload: { toVersion: string; type: string; scope: string; reason: string; owner: string }) => void;
  running: boolean;
}) {
  const active = versions.find((v) => v.status === "Active");
  const [toVersion, setToVersion] = useState("4.1");
  const [type, setType] = useState("Full Configuration");
  const [scope, setScope] = useState("Enterprise");
  const [reason, setReason] = useState("");
  const [owner, setOwner] = useState("Discovery Operations");
  useEffect(() => { if (open) setReason(""); }, [open]);

  const priorApproved = versions.filter((v) => v.status !== "Draft" && v.version !== active?.version);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Rollback Configuration</DialogTitle>
          <DialogDescription className="text-[12px]">
            Rollback republishes a prior approved version. Historical versions are never modified.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block"><span className="text-[11px] text-slate-600">Current active version</span>
            <Input value={`v${active?.version ?? "4.2"}`} readOnly className="mt-0.5 h-8 text-[12px]" /></label>
          <label className="block"><span className="text-[11px] text-slate-600">Prior approved version</span>
            <Select value={toVersion} onValueChange={setToVersion}>
              <SelectTrigger className="mt-0.5 h-8 text-[12px]" aria-label="Prior approved version"><SelectValue /></SelectTrigger>
              <SelectContent>{priorApproved.map((v) => <SelectItem key={v.id} value={v.version} className="text-[12px]">v{v.version} · {v.status}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="block"><span className="text-[11px] text-slate-600">Rollback type</span>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="mt-0.5 h-8 text-[12px]" aria-label="Rollback type"><SelectValue /></SelectTrigger>
              <SelectContent>{["Full Configuration", "Scope Specific Override", "Emergency Policy Rollback"].map((t) => <SelectItem key={t} value={t} className="text-[12px]">{t}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="block"><span className="text-[11px] text-slate-600">Scope</span>
            <Input value={scope} onChange={(e) => setScope(e.target.value)} className="mt-0.5 h-8 text-[12px]" /></label>
          <label className="block"><span className="text-[11px] text-slate-600">Owner</span>
            <Input value={owner} onChange={(e) => setOwner(e.target.value)} className="mt-0.5 h-8 text-[12px]" /></label>
          <label className="block sm:col-span-2"><span className="text-[11px] text-slate-600">Reason (required)</span>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="mt-0.5 text-[12px]" /></label>
        </div>
        <dl className="grid gap-1 text-[11.5px] sm:grid-cols-2">
          {[
            ["Source delta", "−6 sources returned to prior scope"],
            ["Rule delta", "−14 rule changes reverted"],
            ["Permission delta", "Unknown permission handling returns to metadata only"],
            ["Downstream effect", "Reconciliation job created, no approved records rewritten"],
            ["Potential rediscovery", "42K artifacts may be re-evaluated"],
            ["Approval", type === "Emergency Policy Rollback" ? "Emergency path — post hoc governance review" : "Approval required before execution"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2 rounded border border-slate-200 px-2 py-1">
              <dt className="text-slate-500">{k}</dt><dd className="text-right text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[12px]" disabled={!reason.trim() || running}
            onClick={() => onRollback({ toVersion, type, scope, reason, owner })}>
            {running ? "Rolling back…" : "Execute rollback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------- global search */

export function GlobalSearchDialog({
  open, onOpenChange, index, onOpenResult,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  index: SearchResult[]; onOpenResult: (r: SearchResult) => void;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  useEffect(() => { if (open) setQ(""); }, [open]);

  const types = useMemo(() => ["All", ...Array.from(new Set(index.map((i) => i.type)))], [index]);
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return index
      .filter((r) => type === "All" || r.type === type)
      .filter((r) => !needle || [r.id, r.type, r.configuration, r.element, r.scope, r.status, r.owner].join(" ").toLowerCase().includes(needle))
      .slice(0, 60);
  }, [index, q, type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Search Discovery Configuration</DialogTitle>
          <DialogDescription className="text-[12px]">
            Configurations, versions, scopes, sources, rules, policies, validation issues, conflicts, reviews, approvals, exceptions, activations, rollbacks and drift.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1.5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" aria-hidden />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search configuration governance" className="h-8 pl-7 text-[12px]" aria-label="Search discovery configuration" autoFocus />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 w-[160px] text-[12px]" aria-label="Result type"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-64">{types.map((t) => <SelectItem key={t} value={t} className="text-[12px]">{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-1">
          {searchExamples.map((e) => (
            <button key={e} type="button" onClick={() => setQ(e)}
              className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-600 hover:bg-slate-100">
              {e}
            </button>
          ))}
        </div>
        <div className="max-h-[52vh] overflow-auto">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Search results</caption>
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>{["Type", "Configuration", "Version", "Element", "Scope", "Status", "Owner", "Action"].map((h) => <th key={h} scope="col" className="px-2 py-1.5 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.length === 0 && <tr><td className="px-2 py-3 text-slate-500" colSpan={8}>No matching configuration records.</td></tr>}
              {results.map((r) => (
                <tr key={`${r.type}-${r.id}`} className="hover:bg-slate-50">
                  <td className="px-2 py-1.5"><StatusBadge tone="slate">{r.type}</StatusBadge></td>
                  <td className="px-2 py-1.5">{r.configuration}</td>
                  <td className="px-2 py-1.5">v{r.version}</td>
                  <td className="px-2 py-1.5 font-medium text-slate-800">{r.element}</td>
                  <td className="px-2 py-1.5">{r.scope}</td>
                  <td className="px-2 py-1.5"><StatusBadge tone={stateTone(r.status)}>{r.status}</StatusBadge></td>
                  <td className="px-2 py-1.5">{r.owner}</td>
                  <td className="px-2 py-1.5">
                    <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => { onOpenResult(r); onOpenChange(false); }}>Open</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------- governed export */

export function ExportDialog({
  open, onOpenChange, onExport,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onExport: (format: string, scope: string, options: string[]) => void;
}) {
  const [format, setFormat] = useState("CSV");
  const [scope, setScope] = useState("Current Configuration");
  const [options, setOptions] = useState<string[]>(["Scope", "Sources", "Rules", "Validation"]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Export Discovery Configuration</DialogTitle>
          <DialogDescription className="text-[12px]">Governed export of configuration policy, validation and governance history.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block"><span className="text-[11px] text-slate-600">Format</span>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="mt-0.5 h-8 text-[12px]" aria-label="Export format"><SelectValue /></SelectTrigger>
              <SelectContent>{exportFormats.map((f) => <SelectItem key={f} value={f} className="text-[12px]">{f}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="block"><span className="text-[11px] text-slate-600">Scope</span>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="mt-0.5 h-8 text-[12px]" aria-label="Export scope"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-64">{exportScopes.map((s) => <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>)}</SelectContent>
            </Select>
          </label>
        </div>
        <fieldset>
          <legend className="text-[11px] font-medium text-slate-600">Include</legend>
          <div className="mt-1 grid grid-cols-2 gap-1 sm:grid-cols-3">
            {exportOptions.map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-[11.5px] text-slate-700">
                <Checkbox
                  checked={options.includes(o)}
                  onCheckedChange={(v) => setOptions((s) => (v ? [...s, o] : s.filter((x) => x !== o)))}
                  aria-label={o}
                />
                {o}
              </label>
            ))}
          </div>
        </fieldset>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[12px]" onClick={() => { onExport(format, scope, options); onOpenChange(false); }}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------ demo story */

export function DemoStoryOverlay({
  step, onNext, onPrev, onExit, reducedMotion, onToggleMotion,
}: {
  step: number; onNext: () => void; onPrev: () => void; onExit: () => void;
  reducedMotion: boolean; onToggleMotion: (v: boolean) => void;
}) {
  const s = demoStory[step];
  const [notes, setNotes] = useState(true);
  if (!s) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/98 px-4 py-3 shadow-2xl backdrop-blur"
      role="region" aria-label="Demo story">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="purple">Demo Story</StatusBadge>
          <span className="text-[11px] text-slate-500">Step {step + 1} of {demoStory.length}</span>
          <Progress value={((step + 1) / demoStory.length) * 100} className="h-1.5 w-40" />
          <label className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-600">
            <Switch checked={reducedMotion} onCheckedChange={onToggleMotion} aria-label="Reduced motion" /> Reduced motion
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <Switch checked={notes} onCheckedChange={setNotes} aria-label="Presenter notes" /> Presenter notes
          </label>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onPrev} disabled={step === 0}>Previous</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={onNext} disabled={step >= demoStory.length - 1}>Next</Button>
          <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={onExit} aria-label="Exit story">
            <X className="mr-1 h-3.5 w-3.5" aria-hidden /> Exit Story
          </Button>
        </div>
        <p className="mt-1.5 text-[12.5px] font-medium text-slate-800" role="status" aria-live="polite">{s.caption}</p>
        {notes && <p className="mt-0.5 text-[11px] text-slate-500">Presenter note: {s.notes}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------ version detail */

export function VersionDetailDialog({
  open, onOpenChange, version,
}: { open: boolean; onOpenChange: (v: boolean) => void; version: DiscoveryConfigurationVersion | null }) {
  if (!version) return null;
  const rows: [string, string][] = [
    ["Scope", version.scopeSnapshot], ["Sources", version.sourceConfigSnapshot], ["Rules", version.ruleSnapshot],
    ["Permission policy", version.permissionPolicySnapshot], ["Authority policy", version.authorityPolicySnapshot],
    ["Freshness policy", version.freshnessPolicySnapshot], ["Cadence policy", version.cadencePolicySnapshot],
    ["Change detection", version.changeDetectionSnapshot], ["Duplicate policy", version.duplicatePolicySnapshot],
    ["Traversal policy", version.traversalPolicySnapshot], ["Sampling policy", version.samplingPolicySnapshot],
    ["Processing handoffs", version.processingHandoffSnapshot], ["Evidence policy", version.evidencePolicySnapshot],
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Configuration Version v{version.version}</DialogTitle>
          <DialogDescription className="text-[12px]">{version.changeReason}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge tone={stateTone(version.status)}>{version.status}</StatusBadge>
          <StatusBadge tone="slate">Created {version.createdAt} by {version.createdBy}</StatusBadge>
          <StatusBadge tone="blue">Validation {version.validationScore}</StatusBadge>
          <StatusBadge tone="slate">{fmt(version.projectedVolume)} projected artifacts</StatusBadge>
        </div>
        <dl className="grid gap-1 text-[11.5px]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 rounded border border-slate-200 px-2 py-1">
              <dt className="text-slate-500">{k}</dt><dd className="text-right text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="text-[11px] text-slate-500">This snapshot is preserved and immutable.</p>
      </DialogContent>
    </Dialog>
  );
}
