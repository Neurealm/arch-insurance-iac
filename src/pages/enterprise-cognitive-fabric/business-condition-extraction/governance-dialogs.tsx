/**
 * Prompt 2 dialogs: review workbench, conflict resolution, merge/split, taxonomy
 * testing and comparison, version comparison, supersession, approvals, publishing,
 * downstream impact, bulk actions, reprocessing, pause/resume, export, search.
 */

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { nf } from "./panels";
import { canonicalContext, conditions, evidenceSections, workbenchArtifact, type BusinessCondition } from "./data";
import {
  bulkActions, buildExportRows, conditionTypeDefinitions, conditionVersions, confidenceComponents,
  conflictComparisonRows, diffVersions, downloadExport, downstreamImpactModel, exportFormats, exportOptions,
  exportScopes, governanceSearchExamples, highImpactBulkActions, pauseImpact, pauseOptions, publishDestinations,
  publishScopeOptions, publishSteps, publishValidationChecks, publishingHistory, reprocessOptions, reprocessPreview,
  reprocessScopes, requiresComment, resolutionChoices, resumeChecks, reviewerDecisionActions, searchGovernance,
  suggestedCorrections, supersessionOptions, taxonomyTestResult, versionCompareFields,
  type ConditionReview, type ConditionVersion, type ConflictRow, type ExportFormat,
} from "./governance-data";

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-[11.5px] text-slate-800">{value}</p>
  </div>
);

const Region = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <section aria-label={title} className="min-w-0 rounded-lg border border-slate-200 bg-white">
    <header className="border-b border-slate-100 px-2 py-1.5">
      <h3 className="text-[11.5px] font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="text-[10.5px] text-slate-500">{subtitle}</p>}
    </header>
    <div className="max-h-[420px] overflow-y-auto p-2">{children}</div>
  </section>
);

/* --------------------------------------------------------- review workbench */

export function ReviewWorkbenchDialog({ review, open, onOpenChange, onDecision }: {
  review: ConditionReview | null; open: boolean; onOpenChange: (o: boolean) => void;
  onDecision: (action: string, review: ConditionReview, comment: string) => void;
}) {
  const [action, setAction] = useState("Approve Candidate");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("evidence");

  useEffect(() => { if (open) { setAction("Approve Candidate"); setComment(""); setError(""); setTab("evidence"); } }, [open, review?.id]);
  if (!review) return null;

  const ctx = { conflict: !!review.conflictId, missingEvidence: review.reviewType === "Missing Evidence", confidence: 92 };
  const needsComment = requiresComment(action, ctx);

  const submit = () => {
    if (needsComment && comment.trim().length < 4) { setError("A comment is required for this decision."); return; }
    onDecision(action, review, comment.trim());
    onOpenChange(false);
  };

  const evidence = (
    <div className="space-y-1.5 text-[11.5px] text-slate-700">
      <Field label="Evidence passage" value={evidenceSections[2]?.passages[0]?.text ?? "The Payments API shall maintain 99.95 percent monthly availability."} />
      <Field label="Source artifact" value={`${workbenchArtifact.title} · ${workbenchArtifact.canonicalArtifactId}`} />

      <Field label="Source authority" value="Primary · Confluence Cloud · approved requirements space" />
      <Field label="Evidence coverage" value="100 percent of structured fields evidence linked" />
    </div>
  );
  const canonical = (
    <dl className="space-y-1">
      {Object.entries(canonicalContext).slice(0, 10).map(([k, v]) => (
        <Field key={k} label={k} value={Array.isArray(v) ? v.join(", ") : String(v)} />
      ))}
    </dl>
  );
  const candidate = (
    <div className="space-y-1.5">
      <Field label="Condition candidate" value={review.conditionCandidate} />
      <Field label="Review type" value={review.reviewType} />
      <Field label="Reason" value={review.reason} />
      <Field label="Condition classification" value="Performance Threshold · Payments and Reliability" />
      <div>
        <p className="text-[10px] uppercase tracking-wide text-slate-500">Confidence components</p>
        <ul className="mt-0.5 space-y-0.5">
          {confidenceComponents.map((c) => (
            <li key={c.label} className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600">{c.label}</span>
              <span className="font-medium text-slate-800">{c.value}/{c.max}</span>
            </li>
          ))}
        </ul>
      </div>
      <Field label="Related conditions" value="COND-100421, COND-100422" />
      <Field label="Potential conflicts" value={review.conflictId ?? "None detected"} />
      <Field label="Applicable teams" value={review.affectedTeams.join(", ")} />
      <Field label="Applicable systems" value="Payments, Checkout, Identity" />
      <Field label="Affected Team Personas" value="Payments Platform, Checkout Engineering" />
      <Field label="Affected evaluations" value="EVAL-2210, EVAL-2244" />
      <div>
        <p className="text-[10px] uppercase tracking-wide text-slate-500">Suggested corrections</p>
        <ul className="mt-0.5 list-disc pl-4 text-[11px] text-slate-700">
          {suggestedCorrections.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </div>
    </div>
  );
  const decision = (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">Reviewer decision</p>
      <div className="flex flex-wrap gap-1">
        {reviewerDecisionActions.map((a) => (
          <button key={a} type="button" onClick={() => { setAction(a); setError(""); }} aria-pressed={action === a}
            className={cn("rounded border px-1.5 py-1 text-[10.5px]",
              action === a ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50")}>
            {a}
          </button>
        ))}
      </div>
      <label className="block text-[10px] uppercase tracking-wide text-slate-500" htmlFor="review-comment">
        Comment {needsComment && <span className="text-red-600">(required)</span>}
      </label>
      <Textarea id="review-comment" value={comment} onChange={(e) => { setComment(e.target.value); setError(""); }}
        rows={4} className="text-[11.5px]" placeholder="Record the rationale for this decision" />
      {error && <p role="alert" className="text-[11px] font-medium text-red-700">{error}</p>}
      <p className="text-[10.5px] text-slate-500">
        Comments are mandatory for manual overrides, authority changes, approval despite conflicts or missing
        evidence, and rejection of high confidence candidates.
      </p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(1400px,96vw)] max-w-[96vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Human Review Workbench · {review.id}</DialogTitle>
          <DialogDescription className="text-[11.5px]">
            {review.conditionCandidate} · {review.priority} priority · {review.assignedReviewer} · {review.dueDate}
          </DialogDescription>
        </DialogHeader>

        <div className="hidden gap-2 xl:grid xl:grid-cols-4">
          <Region title="1 · Original Evidence">{evidence}</Region>
          <Region title="2 · Canonical Artifact Context">{canonical}</Region>
          <Region title="3 · Condition Candidate">{candidate}</Region>
          <Region title="4 · Reviewer Decision">{decision}</Region>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="xl:hidden">
          <TabsList className="h-auto flex-wrap gap-0.5 py-0.5">
            <TabsTrigger value="evidence" className="text-[11px]">Evidence</TabsTrigger>
            <TabsTrigger value="canonical" className="text-[11px]">Canonical</TabsTrigger>
            <TabsTrigger value="candidate" className="text-[11px]">Candidate</TabsTrigger>
            <TabsTrigger value="decision" className="text-[11px]">Decision</TabsTrigger>
          </TabsList>
          <TabsContent value="evidence">{evidence}</TabsContent>
          <TabsContent value="canonical">{canonical}</TabsContent>
          <TabsContent value="candidate">{candidate}</TabsContent>
          <TabsContent value="decision">{decision}</TabsContent>
        </Tabs>

        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[11.5px]" onClick={submit}>Record decision · {action}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------ conflict resolution */

export function ConflictResolutionDialog({ conflict, open, onOpenChange, onResolve }: {
  conflict: ConflictRow | null; open: boolean; onOpenChange: (o: boolean) => void;
  onResolve: (choice: string, conflict: ConflictRow, details: { reason: string; reviewer: string; approver: string; effectiveDate: string; applicability: string; acknowledged: boolean }) => void;
}) {
  const [choice, setChoice] = useState("Select A");
  const [reason, setReason] = useState("");
  const [reviewer, setReviewer] = useState("A. Valencia");
  const [approver, setApprover] = useState("Payments Governance");
  const [effectiveDate, setEffectiveDate] = useState("2026-10-01");
  const [applicability, setApplicability] = useState("All applicable teams");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (open) { setChoice("Select A"); setReason(""); setAcknowledged(false); setError(""); } }, [open, conflict?.id]);
  if (!conflict) return null;

  const submit = () => {
    if (reason.trim().length < 4) { setError("A resolution reason is required."); return; }
    if (!acknowledged) { setError("Impact acknowledgement is required."); return; }
    onResolve(choice, conflict, { reason: reason.trim(), reviewer, approver, effectiveDate, applicability, acknowledged });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(1320px,96vw)] max-w-[96vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Condition Conflict Resolution · {conflict.id}</DialogTitle>
          <DialogDescription className="text-[11.5px]">{conflict.condition} · {conflict.issueType} · {conflict.severity}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 md:grid-cols-2">
          {[conflict.a, conflict.b].map((side) => (
            <Region key={side.label} title={side.label}>
              <div className="space-y-1">
                <Field label="Statement" value={side.statement} />
                {(["conditionType", "subject", "operator", "value", "unit", "timeWindow", "owner", "authority", "evidence", "freshness", "effectiveDate", "applicableTeams", "applicableSystems", "downstreamUse"] as const).map((k) => (
                  <Field key={k} label={k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())} value={side[k]} />
                ))}
              </div>
            </Region>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200 p-2">
          <p className="text-[11.5px] font-semibold text-slate-900">Comparison</p>
          <ul className="mt-1 grid gap-x-3 gap-y-0.5 text-[11px] sm:grid-cols-2 xl:grid-cols-3">
            {conflictComparisonRows.map((row) => {
              const same = conflict.a[row.key] === conflict.b[row.key];
              return (
                <li key={row.label} className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">{row.label}</span>
                  <span className={cn("rounded border px-1 py-0.5 text-[10px] font-medium",
                    same ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700")}>
                    {same ? "Match" : "Divergent"}
                  </span>
                </li>
              );
            })}
            <li className="flex items-center justify-between gap-2">
              <span className="text-slate-600">Potential business impact</span>
              <span className="text-right text-slate-800">{conflict.downstreamImpact}</span>
            </li>
          </ul>
        </div>

        <div className="grid gap-2 lg:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Resolution</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {resolutionChoices.map((c) => (
                <button key={c} type="button" onClick={() => setChoice(c)} aria-pressed={choice === c}
                  className={cn("rounded border px-1.5 py-1 text-[10.5px]",
                    choice === c ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50")}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-wide text-slate-500" htmlFor="resolution-reason">Resolution reason (required)</label>
            <Textarea id="resolution-reason" rows={3} value={reason} onChange={(e) => { setReason(e.target.value); setError(""); }} className="text-[11.5px]" />
            <div className="grid grid-cols-2 gap-1.5">
              <label className="text-[10px] uppercase tracking-wide text-slate-500">Reviewer
                <Input value={reviewer} onChange={(e) => setReviewer(e.target.value)} className="mt-0.5 h-7 text-[11px]" /></label>
              <label className="text-[10px] uppercase tracking-wide text-slate-500">Approver
                <Input value={approver} onChange={(e) => setApprover(e.target.value)} className="mt-0.5 h-7 text-[11px]" /></label>
              <label className="text-[10px] uppercase tracking-wide text-slate-500">Effective date
                <Input value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className="mt-0.5 h-7 text-[11px]" /></label>
              <label className="text-[10px] uppercase tracking-wide text-slate-500">Applicability
                <Input value={applicability} onChange={(e) => setApplicability(e.target.value)} className="mt-0.5 h-7 text-[11px]" /></label>
            </div>
            <label className="flex items-start gap-1.5 text-[11px] text-slate-700">
              <input type="checkbox" checked={acknowledged} onChange={(e) => { setAcknowledged(e.target.checked); setError(""); }} className="mt-0.5" />
              I acknowledge the downstream impact: {conflict.downstreamImpact}.
            </label>
            {error && <p role="alert" className="text-[11px] font-medium text-red-700">{error}</p>}
          </div>
        </div>

        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[11.5px]" onClick={submit}>Resolve conflict</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------------- merge and split */

export function MergeSplitDialog({ open, onOpenChange, mode, onComplete }: {
  open: boolean; onOpenChange: (o: boolean) => void; mode: "merge" | "split";
  onComplete: (mode: "merge" | "split", summary: string) => void;
}) {
  const [surviving, setSurviving] = useState("COND-100422");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [splitA, setSplitA] = useState("Payments API monthly availability shall be at least 99.95 percent");
  const [splitB, setSplitB] = useState("Payments API P95 latency shall remain below 250 milliseconds");

  useEffect(() => { if (open) { setReason(""); setError(""); } }, [open, mode]);

  const submit = () => {
    if (reason.trim().length < 4) { setError("A change reason is required."); return; }
    onComplete(mode, mode === "merge"
      ? `Merged into ${surviving} — aliases, historical IDs, downstream references, and version history preserved`
      : `Split into Availability SLO and Latency Threshold — evidence linked to both records`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(1000px,96vw)] max-w-[96vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">{mode === "merge" ? "Merge Conditions" : "Split Condition"}</DialogTitle>
          <DialogDescription className="text-[11.5px]">
            {mode === "merge"
              ? "Choose the surviving record and the field values it inherits. History and references are preserved."
              : "Decompose a compound statement into atomic business conditions with shared evidence lineage."}
          </DialogDescription>
        </DialogHeader>

        {mode === "merge" ? (
          <div className="grid gap-2 lg:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wide text-slate-500">Surviving condition
                <select value={surviving} onChange={(e) => setSurviving(e.target.value)}
                  className="mt-0.5 h-7 w-full rounded-md border border-slate-200 px-1.5 text-[11px]">
                  {conditions.slice(0, 6).map((c) => <option key={c.id} value={c.id}>{c.id} · {c.conditionStatement.slice(0, 48)}</option>)}
                </select>
              </label>
              {["Statement", "Owner", "Authority", "Evidence", "Applicability", "Effective dates", "Dependencies", "Risks"].map((f) => (
                <label key={f} className="block text-[10px] uppercase tracking-wide text-slate-500">Select {f.toLowerCase()}
                  <select className="mt-0.5 h-7 w-full rounded-md border border-slate-200 px-1.5 text-[11px]" defaultValue="From surviving condition">
                    <option>From surviving condition</option><option>From merged condition</option><option>Combine both</option>
                  </select>
                </label>
              ))}
            </div>
            <div className="space-y-1.5">
              <div className="rounded-lg border border-slate-200 p-2 text-[11px] text-slate-700">
                <p className="text-[11.5px] font-semibold text-slate-900">Preserved</p>
                <ul className="mt-0.5 list-disc pl-4">
                  <li>Aliases and historical condition IDs</li>
                  <li>Downstream references in personas, evaluations, and decisions</li>
                  <li>Complete version history and audit events</li>
                </ul>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
                <p className="font-semibold">Downstream impact before confirmation</p>
                <p>{downstreamImpactModel.personas.length} personas · {downstreamImpactModel.evaluations.length} evaluations · {downstreamImpactModel.decisions.length} decision · {downstreamImpactModel.dashboards.length} dashboards</p>
              </div>
              <label className="block text-[10px] uppercase tracking-wide text-slate-500" htmlFor="merge-reason">Change reason (required)</label>
              <Textarea id="merge-reason" rows={3} value={reason} onChange={(e) => { setReason(e.target.value); setError(""); }} className="text-[11.5px]" />
              {error && <p role="alert" className="text-[11px] font-medium text-red-700">{error}</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="rounded-lg border border-slate-200 p-2 text-[11.5px] text-slate-700">
              Source: “Payments API must maintain 99.95 percent availability and P95 latency below 250 milliseconds.”
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <label className="block text-[10px] uppercase tracking-wide text-slate-500">New condition 1 · Availability SLO
                <Textarea rows={3} value={splitA} onChange={(e) => setSplitA(e.target.value)} className="mt-0.5 text-[11.5px]" /></label>
              <label className="block text-[10px] uppercase tracking-wide text-slate-500">New condition 2 · Latency Threshold
                <Textarea rows={3} value={splitB} onChange={(e) => setSplitB(e.target.value)} className="mt-0.5 text-[11.5px]" /></label>
            </div>
            <p className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
              Evidence EVD-77120 is linked to both new records and version lineage is created from COND-100421.
            </p>
            <label className="block text-[10px] uppercase tracking-wide text-slate-500" htmlFor="split-reason">Change reason (required)</label>
            <Textarea id="split-reason" rows={3} value={reason} onChange={(e) => { setReason(e.target.value); setError(""); }} className="text-[11.5px]" />
            {error && <p role="alert" className="text-[11px] font-medium text-red-700">{error}</p>}
          </div>
        )}

        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[11.5px]" onClick={submit}>{mode === "merge" ? "Merge conditions" : "Split condition"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------------- version compare */

export function VersionCompareDialog({ open, onOpenChange, aId, bId, onAction }: {
  open: boolean; onOpenChange: (o: boolean) => void; aId: string; bId: string;
  onAction: (action: string, field?: string) => void;
}) {
  const a = conditionVersions.find((v) => v.id === aId) ?? conditionVersions[1];
  const b = conditionVersions.find((v) => v.id === bId) ?? conditionVersions[0];
  const diff = useMemo(() => diffVersions(a, b), [a, b]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(1100px,96vw)] max-w-[96vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Version Comparison · {a.version} → {b.version}</DialogTitle>
          <DialogDescription className="text-[11.5px]">
            {diff.changed.length} changed · {diff.added.length} added · {diff.removed.length} removed
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[11.5px]">
            <thead><tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-wide text-slate-500">
              <th className="px-2 py-1">Field</th><th className="px-2 py-1">Version {a.version}</th>
              <th className="px-2 py-1">Version {b.version}</th><th className="px-2 py-1">Change</th><th className="px-2 py-1">Select</th>
            </tr></thead>
            <tbody>
              {versionCompareFields.map((f) => {
                const changed = a.fields[f] !== b.fields[f];
                return (
                  <tr key={f} className={cn("border-b border-slate-100", changed && "bg-amber-50/60")}>
                    <td className="px-2 py-1 text-slate-500">{f}</td>
                    <td className="px-2 py-1 text-slate-700">{a.fields[f] ?? "—"}</td>
                    <td className="px-2 py-1 text-slate-700">{b.fields[f] ?? "—"}</td>
                    <td className="px-2 py-1">{changed ? <Badge variant="outline" className="text-[10px]">Changed</Badge> : <span className="text-slate-400">—</span>}</td>
                    <td className="px-2 py-1">
                      <Button size="sm" variant="outline" className="h-6 px-2 text-[10.5px]" onClick={() => onAction("Select Individual Value", f)}>Use {b.version}</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
          Downstream impact: {b.downstreamConsumers.join(", ")}
        </div>

        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => onAction("Restore Prior")}>Restore Prior</Button>
          <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => onAction("Create New Draft")}>Create New Draft</Button>
          <Button size="sm" className="h-8 text-[11.5px]" onClick={() => { onAction("Accept Changes"); onOpenChange(false); }}>Accept Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------- supersession */

export function SupersedeDialog({ open, onOpenChange, version, onComplete }: {
  open: boolean; onOpenChange: (o: boolean) => void; version: ConditionVersion | null;
  onComplete: (option: string, reason: string) => void;
}) {
  const [option, setOption] = useState(supersessionOptions[0]);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { if (open) { setReason(""); setError(""); setOption(supersessionOptions[0]); } }, [open]);

  const submit = () => {
    if (reason.trim().length < 4) { setError("A supersession reason is required."); return; }
    onComplete(option, reason.trim()); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(880px,96vw)] max-w-[96vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Supersede Condition</DialogTitle>
          <DialogDescription className="text-[11.5px]">History is retained so point in time queries still resolve the prior condition.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 md:grid-cols-2 text-[11.5px]">
          <Region title="Current condition">
            <Field label="Version" value={version?.version ?? "3.1"} />
            <Field label="Statement" value={version?.fields.Statement ?? conditionVersions[1].fields.Statement} />
            <Field label="Authority" value={version?.authorityLevel ?? "Primary"} />
            <Field label="Evidence" value={version?.fields.Evidence ?? "EVD-77120"} />
          </Region>
          <Region title="Replacement condition">
            <Field label="Version" value={conditionVersions[0].version} />
            <Field label="Statement" value={conditionVersions[0].fields.Statement} />
            <Field label="Authority" value={conditionVersions[0].authorityLevel} />
            <Field label="Evidence" value={conditionVersions[0].fields.Evidence} />
          </Region>
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2">
          <Field label="Effective date" value="2026-10-01" />
          <Field label="Expiration date" value="2026-09-30" />
          <Field label="Affected personas" value={downstreamImpactModel.personas.join(", ")} />
          <Field label="Affected evaluations" value={downstreamImpactModel.evaluations.join(", ")} />
          <Field label="Affected decisions" value={downstreamImpactModel.decisions.join(", ")} />
        </div>
        <div className="flex flex-wrap gap-1">
          {supersessionOptions.map((o) => (
            <button key={o} type="button" onClick={() => setOption(o)} aria-pressed={option === o}
              className={cn("rounded border px-1.5 py-1 text-[10.5px]",
                option === o ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50")}>{o}</button>
          ))}
        </div>
        <label className="block text-[10px] uppercase tracking-wide text-slate-500" htmlFor="supersede-reason">Reason (required)</label>
        <Textarea id="supersede-reason" rows={3} value={reason} onChange={(e) => { setReason(e.target.value); setError(""); }} className="text-[11.5px]" />
        {error && <p role="alert" className="text-[11px] font-medium text-red-700">{error}</p>}
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[11.5px]" onClick={submit}>Confirm supersession</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------------------------------- approval */

export function ApprovalDialog({ open, onOpenChange, condition, stage, onDecision }: {
  open: boolean; onOpenChange: (o: boolean) => void; condition: BusinessCondition; stage: string;
  onDecision: (decision: string, comment: string) => void;
}) {
  const [comment, setComment] = useState("");
  useEffect(() => { if (open) setComment(""); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(880px,96vw)] max-w-[96vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Condition Approval · {condition.id}</DialogTitle>
          <DialogDescription className="text-[11.5px]">Current stage: {stage}</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-x-3 gap-y-1 text-[11.5px] sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Condition" value={condition.conditionStatement} />
          <Field label="Type" value={condition.conditionTypeId} />
          <Field label="Owner" value={condition.ownerTeamName} />
          <Field label="Authority" value={condition.authorityLevel} />
          <Field label="Evidence coverage" value={`${condition.evidenceCoverage}%`} />
          <Field label="Confidence" value={`${condition.confidence}%`} />
          <Field label="Freshness" value={condition.freshnessStatus} />
          <Field label="Conflicts" value="1 open conflict in domain" />
          <Field label="Applicability" value={condition.applicableTeamIds.join(", ")} />
          <Field label="Affected personas" value={downstreamImpactModel.personas.join(", ")} />
          <Field label="Affected evaluations" value={downstreamImpactModel.evaluations.join(", ")} />
          <Field label="Affected decisions" value={downstreamImpactModel.decisions.join(", ")} />
        </dl>
        <label className="block text-[10px] uppercase tracking-wide text-slate-500" htmlFor="approval-comment">Comment</label>
        <Textarea id="approval-comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="text-[11.5px]" />
        <DialogFooter className="flex-wrap gap-1.5">
          {["Submit for Review", "Approve", "Approve with Conditions", "Request Changes", "Reject", "Withdraw"].map((d) => (
            <Button key={d} size="sm" variant={d === "Approve" ? "default" : "outline"} className="h-8 text-[11.5px]"
              onClick={() => { onDecision(d, comment.trim()); onOpenChange(false); }}>{d}</Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------ publish wizard */

export function PublishWizardDialog({ open, onOpenChange, onComplete }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  onComplete: (summary: { records: number; destinations: string[] }) => void;
}) {
  const [step, setStep] = useState(1);
  const [scopes, setScopes] = useState<string[]>(["Approved Changes"]);
  const [dests, setDests] = useState<string[]>(publishDestinations.map((d) => d.id));
  const [running, setRunning] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => { if (open) { setStep(1); setRunning(0); setDone(false); } }, [open]);
  useEffect(() => {
    if (step !== 5 || done) return;
    if (running >= publishSteps.length - 1) {
      setDone(true);
      onComplete({ records: 88_442, destinations: dests });
      return;
    }
    const t = setTimeout(() => setRunning((r) => r + 1), 320);
    return () => clearTimeout(t);
  }, [step, running, done, dests, onComplete]);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const blocked = publishDestinations.filter((d) => dests.includes(d.id) && d.accessValidation !== "Passed");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(960px,96vw)] max-w-[96vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Publish Conditions · Step {step} of 5</DialogTitle>
          <DialogDescription className="text-[11.5px]">
            {["Select Scope", "Select Destinations", "Validation", "Review", "Publish"][step - 1]}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="flex flex-wrap gap-1">
            {publishScopeOptions.map((s) => (
              <button key={s} type="button" onClick={() => toggle(scopes, setScopes, s)} aria-pressed={scopes.includes(s)}
                className={cn("rounded border px-1.5 py-1 text-[11px]", scopes.includes(s) ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50")}>{s}</button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-1 sm:grid-cols-3">
            {publishDestinations.map((d) => (
              <label key={d.id} className="flex items-center gap-1.5 rounded border border-slate-200 px-1.5 py-1 text-[11px]">
                <input type="checkbox" checked={dests.includes(d.id)} onChange={() => toggle(dests, setDests, d.id)} />
                {d.name}
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <ul className="space-y-0.5 text-[11.5px]">
            {publishValidationChecks.map((c) => {
              const fail = c.id === "access" && blocked.length > 0;
              return (
                <li key={c.id} className="flex items-center justify-between gap-2 rounded border border-slate-100 px-2 py-1">
                  <span><span className="font-medium text-slate-800">{c.label}</span> <span className="text-slate-500">— {c.detail}</span></span>
                  <Badge variant="outline" className={cn("text-[10px]", fail ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700")}>
                    {fail ? "Warning" : "Passed"}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}

        {step === 4 && (
          <div className="grid gap-1.5 sm:grid-cols-2 text-[11.5px]">
            <Field label="Records" value={`${nf(88_442)} conditions · ${nf(214_882)} relationships`} />
            <Field label="Destinations" value={dests.length.toString()} />
            <Field label="Blocked records" value={`${nf(blocked.reduce((a, d) => a + d.blocked, 0))} across ${blocked.length} destinations`} />
            <Field label="Warnings" value={blocked.length ? blocked.map((d) => `${d.name} access revalidation`).join(", ") : "None"} />
            <Field label="Scope" value={scopes.join(", ")} />
          </div>
        )}

        {step === 5 && (
          <ol className="space-y-0.5 text-[11.5px]">
            {publishSteps.map((s, i) => (
              <li key={s} className={cn("flex items-center justify-between rounded px-2 py-1",
                i < running ? "text-emerald-700" : i === running ? "bg-slate-50 font-medium text-slate-900" : "text-slate-400")}>
                <span>{s}</span><span>{i < running ? "Complete" : i === running ? "Running" : "Queued"}</span>
              </li>
            ))}
          </ol>
        )}

        <DialogFooter className="gap-1.5">
          {step > 1 && step < 5 && <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 5 && <Button size="sm" className="h-8 text-[11.5px]" onClick={() => setStep(step + 1)}>{step === 4 ? "Publish" : "Next"}</Button>}
          {step === 5 && <Button size="sm" className="h-8 text-[11.5px]" disabled={!done} onClick={() => onOpenChange(false)}>{done ? "Close" : "Publishing…"}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PublishHistoryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(840px,96vw)] max-w-[96vw]">
        <DialogHeader><DialogTitle className="text-[14px]">Publishing History</DialogTitle>
          <DialogDescription className="text-[11.5px]">Recent publication runs and their destinations</DialogDescription></DialogHeader>
        <ul className="space-y-1 text-[11.5px]">
          {publishingHistory.map((h) => (
            <li key={h.id} className="rounded border border-slate-200 px-2 py-1">
              <div className="flex items-center justify-between"><span className="font-mono text-[10.5px] text-slate-500">{h.id}</span>
                <Badge variant="outline" className="text-[10px]">{h.status}</Badge></div>
              <p className="text-slate-700">{h.scope} → {h.destinations}</p>
              <p className="text-slate-500">{h.started} – {h.completed} · {h.by}</p>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------- downstream impact */

export function DownstreamImpactDialog({ open, onOpenChange, headline, onAcknowledge }: {
  open: boolean; onOpenChange: (o: boolean) => void; headline?: string; onAcknowledge: () => void;
}) {
  const [ack, setAck] = useState(false);
  useEffect(() => { if (open) setAck(false); }, [open]);
  const m = downstreamImpactModel;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(900px,96vw)] max-w-[96vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Downstream Impact Before Change</DialogTitle>
          <DialogDescription className="text-[11.5px]">{headline ?? m.headline} affects the following consumers.</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-x-3 gap-y-1 text-[11.5px] sm:grid-cols-2">
          <Field label="Affected Team Personas" value={m.personas.join(", ")} />
          <Field label="Affected Services" value={m.services.join(", ")} />
          <Field label="Affected Products" value={m.products.join(", ")} />
          <Field label="Affected Customer Journeys" value={m.customerJourneys.join(", ")} />
          <Field label="Affected Impact Evaluations" value={m.evaluations.join(", ")} />
          <Field label="Affected Decisions" value={m.decisions.join(", ")} />
          <Field label="Affected Policies" value={m.policies.join(", ")} />
          <Field label="Affected Context Graph Relationships" value={m.graphRelationships.join(" · ")} />
          <Field label="Affected dashboards" value={m.dashboards.join(", ")} />
        </dl>
        <label className="flex items-center gap-1.5 text-[11.5px] text-slate-700">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
          I acknowledge this material change before publishing.
        </label>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[11.5px]" disabled={!ack} onClick={() => { onAcknowledge(); onOpenChange(false); }}>Acknowledge and continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------ bulk actions */

export function BulkActionsDialog({ open, onOpenChange, selectedCount, onApply }: {
  open: boolean; onOpenChange: (o: boolean) => void; selectedCount: number;
  onApply: (action: string) => void;
}) {
  const [action, setAction] = useState("Approve");
  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => { if (open) setConfirmed(false); }, [open, action]);
  const highImpact = highImpactBulkActions.has(action);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(820px,96vw)] max-w-[96vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Bulk Condition Actions</DialogTitle>
          <DialogDescription className="text-[11.5px]">{selectedCount} conditions selected in the current inventory view.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1">
          {bulkActions.map((a) => (
            <button key={a} type="button" onClick={() => setAction(a)} aria-pressed={action === a}
              className={cn("rounded border px-1.5 py-1 text-[11px]", action === a ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50")}>{a}</button>
          ))}
        </div>
        {highImpact && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-900">
            <p className="font-semibold">High impact change</p>
            <ul className="mt-0.5 grid gap-x-3 sm:grid-cols-2">
              <li>Selected count: {selectedCount}</li>
              <li>Affected teams: 6</li>
              <li>Affected personas: {downstreamImpactModel.personas.length}</li>
              <li>Affected evaluations: {downstreamImpactModel.evaluations.length}</li>
              <li>Affected decisions: {downstreamImpactModel.decisions.length}</li>
              <li>Potential confidence change: +2 points</li>
              <li>Potential readiness change: +1,204 ready records</li>
            </ul>
            <label className="mt-1 flex items-center gap-1.5">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
              I confirm this bulk change.
            </label>
          </div>
        )}
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[11.5px]" disabled={highImpact && !confirmed}
            onClick={() => { onApply(action); onOpenChange(false); }}>Apply {action}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------------------- reprocess */

export function ReprocessDialog({ open, onOpenChange, onComplete }: {
  open: boolean; onOpenChange: (o: boolean) => void; onComplete: (scope: string, reason: string) => void;
}) {
  const [scope, setScope] = useState(reprocessScopes[0]);
  const [opts, setOpts] = useState<string[]>(["Create New Versions", "Preserve Existing Approvals where valid"]);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { if (open) { setReason(""); setError(""); } }, [open]);
  const p = reprocessPreview;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(900px,96vw)] max-w-[96vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Reprocess with Updated Taxonomy</DialogTitle>
          <DialogDescription className="text-[11.5px]">Preview classification and authority changes before creating new versions.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1">
          {reprocessScopes.map((s) => (
            <button key={s} type="button" onClick={() => setScope(s)} aria-pressed={scope === s}
              className={cn("rounded border px-1.5 py-1 text-[11px]", scope === s ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50")}>{s}</button>
          ))}
        </div>
        <dl className="grid gap-x-3 gap-y-1 text-[11.5px] sm:grid-cols-3">
          <Field label="Current taxonomy version" value={p.currentTaxonomy} />
          <Field label="Proposed taxonomy" value={p.proposedTaxonomy} />
          <Field label="Conditions affected" value={nf(p.conditionsAffected)} />
          <Field label="Classification changes" value={nf(p.classificationChanges)} />
          <Field label="Required field changes" value={nf(p.requiredFieldChanges)} />
          <Field label="Authority rule changes" value={nf(p.authorityRuleChanges)} />
          <Field label="Conflict rule changes" value={nf(p.conflictRuleChanges)} />
          <Field label="Potential new versions" value={nf(p.potentialNewVersions)} />
          <Field label="Affected downstream consumers" value={p.affectedDownstream.join(", ")} />
        </dl>
        <div className="flex flex-wrap gap-1">
          {reprocessOptions.map((o) => (
            <label key={o} className="flex items-center gap-1.5 rounded border border-slate-200 px-1.5 py-1 text-[11px]">
              <input type="checkbox" checked={opts.includes(o)}
                onChange={() => setOpts(opts.includes(o) ? opts.filter((x) => x !== o) : [...opts, o])} />{o}
            </label>
          ))}
        </div>
        <label className="block text-[10px] uppercase tracking-wide text-slate-500" htmlFor="reprocess-reason">Change reason (required)</label>
        <Textarea id="reprocess-reason" rows={3} value={reason} onChange={(e) => { setReason(e.target.value); setError(""); }} className="text-[11.5px]" />
        {error && <p role="alert" className="text-[11px] font-medium text-red-700">{error}</p>}
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[11.5px]"
            onClick={() => {
              if (reason.trim().length < 4) { setError("A change reason is required."); return; }
              onComplete(scope, reason.trim()); onOpenChange(false);
            }}>Start reprocessing</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------ pause/resume */

export function PauseResumeDialog({ open, onOpenChange, paused, onConfirm }: {
  open: boolean; onOpenChange: (o: boolean) => void; paused: boolean;
  onConfirm: (mode: string, reason: string) => void;
}) {
  const [option, setOption] = useState(pauseOptions[0]);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [checks, setChecks] = useState(0);

  useEffect(() => { if (open) { setReason(""); setError(""); setChecks(0); } }, [open]);
  useEffect(() => {
    if (!open || !paused || checks >= resumeChecks.length) return;
    const t = setTimeout(() => setChecks((c) => c + 1), 350);
    return () => clearTimeout(t);
  }, [open, paused, checks]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(860px,96vw)] max-w-[96vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">{paused ? "Resume Extraction" : "Pause Extraction"}</DialogTitle>
          <DialogDescription className="text-[11.5px]">
            {paused ? "Validation runs before extraction resumes." : "Pausing holds queues and delays registry publishing."}
          </DialogDescription>
        </DialogHeader>

        {paused ? (
          <ul className="space-y-0.5 text-[11.5px]">
            {resumeChecks.map((c, i) => (
              <li key={c} className={cn("flex items-center justify-between rounded px-2 py-1", i < checks ? "text-emerald-700" : "text-slate-500")}>
                <span>{c}</span><span>{i < checks ? "Passed" : "Running"}</span>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <div className="flex flex-wrap gap-1">
              {pauseOptions.map((o) => (
                <button key={o} type="button" onClick={() => setOption(o)} aria-pressed={option === o}
                  className={cn("rounded border px-1.5 py-1 text-[11px]", option === o ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50")}>{o}</button>
              ))}
            </div>
            <dl className="grid gap-x-3 gap-y-1 text-[11.5px] sm:grid-cols-3">
              <Field label="Jobs affected" value={nf(pauseImpact.jobsAffected)} />
              <Field label="Artifacts affected" value={nf(pauseImpact.artifactsAffected)} />
              <Field label="Review backlog impact" value={pauseImpact.reviewBacklogImpact} />
              <Field label="Persona construction impact" value={pauseImpact.personaImpact} />
              <Field label="Impact analysis impact" value={pauseImpact.impactAnalysisImpact} />
              <Field label="Registry publishing delay" value={pauseImpact.registryDelay} />
            </dl>
            <label className="block text-[10px] uppercase tracking-wide text-slate-500" htmlFor="pause-reason">Reason (required)</label>
            <Textarea id="pause-reason" rows={3} value={reason} onChange={(e) => { setReason(e.target.value); setError(""); }} className="text-[11.5px]" />
            {error && <p role="alert" className="text-[11px] font-medium text-red-700">{error}</p>}
          </>
        )}

        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[11.5px]" disabled={paused && checks < resumeChecks.length}
            onClick={() => {
              if (!paused && reason.trim().length < 4) { setError("A reason is required."); return; }
              onConfirm(paused ? "resume" : option, reason.trim() || "Validation complete");
              onOpenChange(false);
            }}>{paused ? "Resume extraction" : "Pause extraction"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ export */

export function ExportConditionsDialog({ open, onOpenChange, rows, onExported }: {
  open: boolean; onOpenChange: (o: boolean) => void; rows: BusinessCondition[];
  onExported: (format: string, scope: string, count: number) => void;
}) {
  const [format, setFormat] = useState<ExportFormat>("CSV");
  const [scope, setScope] = useState(exportScopes[0]);
  const [opts, setOpts] = useState<string[]>(["Structured Fields", "Ownership", "Evidence References", "Confidence", "Authority"]);

  const data = useMemo(() => buildExportRows(scope, rows), [scope, rows]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(880px,96vw)] max-w-[96vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Export Conditions</DialogTitle>
          <DialogDescription className="text-[11.5px]">{data.length} records in the selected scope.</DialogDescription>
        </DialogHeader>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Format</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {exportFormats.map((f) => (
              <button key={f} type="button" onClick={() => setFormat(f)} aria-pressed={format === f}
                className={cn("rounded border px-1.5 py-1 text-[11px]", format === f ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50")}>{f}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Scope</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {exportScopes.map((s) => (
              <button key={s} type="button" onClick={() => setScope(s)} aria-pressed={scope === s}
                className={cn("rounded border px-1.5 py-1 text-[11px]", scope === s ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50")}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Include</p>
          <div className="mt-1 grid gap-1 sm:grid-cols-3">
            {exportOptions.map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-[11px]">
                <input type="checkbox" checked={opts.includes(o)}
                  onChange={() => setOpts(opts.includes(o) ? opts.filter((x) => x !== o) : [...opts, o])} />{o}
              </label>
            ))}
          </div>
        </div>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[11.5px]"
            onClick={() => {
              downloadExport(`business-conditions-${scope.toLowerCase().replace(/\s+/g, "-")}`, format, data);
              onExported(format, scope, data.length);
              onOpenChange(false);
            }}>Generate {format}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ search */

export function GovernanceSearchDialog({ open, onOpenChange, onSelect }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  onSelect: (id: string, kind: string) => void;
}) {
  const [query, setQuery] = useState("");
  useEffect(() => { if (open) setQuery(""); }, [open]);
  const results = useMemo(() => searchGovernance(query), [query]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(980px,96vw)] max-w-[96vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Search Business Conditions</DialogTitle>
          <DialogDescription className="text-[11.5px]">Jobs, candidates, conditions, types, owners, teams, systems, services, metrics, dependencies, risks, evidence, conflicts, reviews, and versions.</DialogDescription>
        </DialogHeader>
        <Input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conditions, conflicts, reviews, versions"
          aria-label="Search conditions" className="h-8 text-[12px]" />
        <div className="flex flex-wrap gap-1">
          {governanceSearchExamples.map((e) => (
            <button key={e} type="button" onClick={() => setQuery(e)}
              className="rounded border border-slate-200 px-1.5 py-0.5 text-[10.5px] text-slate-600 hover:bg-slate-50">{e}</button>
          ))}
        </div>
        <div className="max-h-[46vh] overflow-y-auto">
          <table className="w-full min-w-[720px] text-left text-[11.5px]">
            <thead><tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-wide text-slate-500">
              {["Result type", "Condition statement", "Condition type", "Domain", "Owner", "Authority", "Confidence", "Status", "Action"].map((h) => <th key={h} className="px-2 py-1">{h}</th>)}
            </tr></thead>
            <tbody>
              {results.length === 0 && <tr><td colSpan={9} className="px-2 py-6 text-center text-slate-500">No results. Try a different term.</td></tr>}
              {results.map((r) => (
                <tr key={`${r.kind}-${r.id}`} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-2 py-1">{r.kind}</td>
                  <td className="px-2 py-1 text-slate-800">{r.statement}</td>
                  <td className="px-2 py-1">{r.conditionType}</td>
                  <td className="px-2 py-1">{r.domain}</td>
                  <td className="px-2 py-1">{r.owner}</td>
                  <td className="px-2 py-1">{r.authority}</td>
                  <td className="px-2 py-1">{r.confidence}%</td>
                  <td className="px-2 py-1">{r.status}</td>
                  <td className="px-2 py-1">
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10.5px]"
                      onClick={() => { onSelect(r.id, r.kind); onOpenChange(false); }}>{r.action}</Button>
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

/* ---------------------------------------------------------- taxonomy tests */

export function TaxonomyTestDialog({ open, onOpenChange, typeName }: {
  open: boolean; onOpenChange: (o: boolean) => void; typeName: string;
}) {
  const t = taxonomyTestResult;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(760px,96vw)] max-w-[96vw]">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Taxonomy Test · {typeName}</DialogTitle>
          <DialogDescription className="text-[11.5px]">Sample artifact: Payments API Reliability Requirements v3.2</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-x-3 gap-y-1 text-[11.5px] sm:grid-cols-2">
          <Field label="Candidates detected" value={t.candidatesDetected} />
          <Field label="Classification changes" value={t.classificationChanges} />
          <Field label="Required fields" value={t.requiredFields.join(", ")} />
          <Field label="Validation failures" value={t.validationFailures} />
          <Field label="Conflict behavior" value={t.conflictBehavior} />
          <Field label="Confidence change" value={t.confidenceChange} />
          <Field label="Backward compatibility" value={t.backwardCompatibility} />
        </dl>
      </DialogContent>
    </Dialog>
  );
}

export function TaxonomyCompareDialog({ open, onOpenChange, typeId }: {
  open: boolean; onOpenChange: (o: boolean) => void; typeId: string;
}) {
  const t = conditionTypeDefinitions.find((x) => x.id === typeId) ?? conditionTypeDefinitions[0];
  const rows: [string, string, string][] = [
    ["Version", "3.5", "3.6"],
    ["Approval requirements", "Domain review", t.approvalRequirements],
    ["Conflict rules", "Divergent values raise a warning", t.conflictRules],
    ["Authority requirements", "Any source", t.authorityRequirements],
    ["Freshness rules", "Stale after 365 days", t.freshnessRules],
    ["Required fields", "Statement, Subject, Owner", t.requiredFields.join(", ")],
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(860px,96vw)] max-w-[96vw]">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Taxonomy Version Comparison · {t.name}</DialogTitle>
          <DialogDescription className="text-[11.5px]">Version 3.5 compared with active version 3.6</DialogDescription>
        </DialogHeader>
        <table className="w-full text-left text-[11.5px]">
          <thead><tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-wide text-slate-500">
            <th className="px-2 py-1">Attribute</th><th className="px-2 py-1">v3.5</th><th className="px-2 py-1">v3.6</th></tr></thead>
          <tbody>
            {rows.map(([k, a, b]) => (
              <tr key={k} className={cn("border-b border-slate-100", a !== b && "bg-amber-50/60")}>
                <td className="px-2 py-1 text-slate-500">{k}</td><td className="px-2 py-1">{a}</td><td className="px-2 py-1">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DialogContent>
    </Dialog>
  );
}
