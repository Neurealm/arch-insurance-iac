/**
 * Enterprise Cognitive Memory — Prompt 2 governed workflows, drawers,
 * global search, notifications, export and demo story.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Pill, Row, Drawer, FilterSelect, type Tone } from "../persona-studio/primitives";
import { EmptyState } from "./panels";
import {
  mergeFieldKeys, mergeHistoryItems, mergeImpact, mergeSimulationSteps,
  supersessionCases, supersessionOptions, refreshScopes, refreshOptions, refreshPreserve,
  refreshSimulationSteps, refreshResults, snapshotScopes, snapshotIncludes,
  publishScopes, publishValidations, publishSimulationSteps, publishDestinations,
  exportFormats, exportScopes, exportOptions, globalSearchTypes, globalSearchExamples,
  runGlobalSearch, notificationCategories, demoSteps,
  type MemoryGovernanceReview, type MemoryConflict, type MemoryDrift, type MemoryNotification,
  type CurationCandidate, type SupersessionCase, type ExportFormat, type MergeFieldKey,
} from "./governance-data";

const tone = (s: string): Tone => {
  if (["Resolved", "Allowed", "Completed", "Success", "Healthy"].includes(s)) return "green";
  if (["Open", "In Review", "Acknowledged", "Warning", "Medium", "Minor", "Pending"].includes(s)) return "amber";
  if (["Escalated", "Critical", "High", "Denied", "Material"].includes(s)) return "red";
  return "blue";
};

/* ------------------------------------------------------------------ */
/* Stepper primitive                                                   */
/* ------------------------------------------------------------------ */

function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap gap-1" aria-label="Workflow steps">
      {steps.map((s, i) => (
        <li key={s} aria-current={i === current ? "step" : undefined}
          className={cn("rounded border px-1.5 py-0.5 text-[10.5px]",
            i === current ? "border-blue-500 bg-blue-600 text-white"
              : i < current ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-500")}>
          {i + 1}. {s}
        </li>
      ))}
    </ol>
  );
}

function useSimulation(steps: string[]) {
  const [index, setIndex] = useState(-1);
  const timer = useRef<number | null>(null);
  const run = (onDone?: () => void) => {
    setIndex(0);
    let i = 0;
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      i += 1;
      setIndex(i);
      if (i >= steps.length - 1) {
        if (timer.current) window.clearInterval(timer.current);
        onDone?.();
      }
    }, 260);
  };
  const reset = () => { if (timer.current) window.clearInterval(timer.current); setIndex(-1); };
  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);
  return { index, run, reset, running: index >= 0 && index < steps.length - 1, done: index >= steps.length - 1 };
}

function SimulationList({ steps, index }: { steps: string[]; index: number }) {
  return (
    <ul className="space-y-0.5 text-[11px]" aria-live="polite">
      {steps.map((s, i) => (
        <li key={s} className={cn("flex items-center gap-1.5",
          i < index ? "text-emerald-700" : i === index ? "font-medium text-blue-700" : "text-slate-400")}>
          <span aria-hidden>{i < index ? "✓" : i === index ? "•" : "○"}</span>{s}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Governance review drawer                                            */
/* ------------------------------------------------------------------ */

export function ReviewDrawer({ open, onOpenChange, review, onAction }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  review: MemoryGovernanceReview | null;
  onAction: (action: string, r: MemoryGovernanceReview) => void;
}) {
  const actions = [
    "Assign", "Acknowledge", "Request Evidence", "Resolve Authority", "Resolve Access",
    "Refresh Record", "Merge Records", "Supersede", "Apply Retention Action", "Create Review Task", "Escalate", "Resolve",
  ];
  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide
      title={review ? `${review.id} · ${review.memoryRecord}` : "Governance review"}
      description={review?.issueType}>
      {review && (
        <>
          <div className="flex flex-wrap gap-1">
            <Pill label={review.severity} tone={tone(review.severity)} />
            <Pill label={review.status} tone={tone(review.status)} />
            <Pill label={`Impact ${review.downstreamImpact}`} tone={tone(review.downstreamImpact)} />
          </div>
          <p className="text-[11.5px] text-slate-700">{review.detail}</p>
          <dl>
            <Row label="Memory Record" value={`${review.memoryRecordId} · ${review.memoryRecord}`} />
            <Row label="Memory Type" value={review.memoryType} />
            <Row label="Owner" value={review.owner} />
            <Row label="Authority" value={review.authority} />
            <Row label="Access Classification" value={review.accessClassification} />
            <Row label="Affected Consumers" value={review.affectedConsumerIds.join(", ") || "—"} />
            <Row label="Affected Personas" value={review.affectedPersonaIds.join(", ") || "—"} />
            <Row label="Affected Decisions" value={review.affectedDecisionIds.join(", ") || "—"} />
            <Row label="Age" value={review.age} />
            <Row label="Due" value={review.dueDate} />
            <Row label="Recommended Action" value={review.recommendedAction} />
            <Row label="Created" value={review.createdAt} />
            <Row label="Resolved" value={review.resolvedAt ?? "—"} />
          </dl>
          <div className="flex flex-wrap gap-1">
            {actions.map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, review)}>{a}</Button>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* Conflict comparison drawer                                          */
/* ------------------------------------------------------------------ */

export function ConflictDrawer({ open, onOpenChange, conflict, onResolve, onMerge }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  conflict: MemoryConflict | null;
  onResolve: (c: MemoryConflict, option: string) => void;
  onMerge: (c: MemoryConflict) => void;
}) {
  const options = [
    "Select A", "Select B", "Merge", "Create Effective Date Transition",
    "Keep Both for Different Applicability", "Mark Historical", "Escalate", "Resolve",
  ];
  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide
      title={conflict ? `${conflict.id} · ${conflict.conflictType}` : "Conflict"}
      description={conflict?.memoryType}>
      {conflict && (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { k: "A", title: conflict.recordATitle, id: conflict.recordAId, statement: conflict.recordAStatement, authority: conflict.authorityA, confidence: conflict.confidenceA },
              { k: "B", title: conflict.recordBTitle, id: conflict.recordBId, statement: conflict.recordBStatement, authority: conflict.authorityB, confidence: conflict.confidenceB },
            ].map((r) => (
              <div key={r.k} className="rounded border border-slate-200 p-2">
                <p className="text-[11px] font-semibold text-slate-900">Record {r.k} · {r.id}</p>
                <p className="text-[11px] text-slate-700">{r.title}</p>
                <dl>
                  <Row label="Statement" value={r.statement} />
                  <Row label="Authority" value={r.authority} />
                  <Row label="Confidence" value={`${r.confidence}%`} />
                </dl>
              </div>
            ))}
          </div>
          <dl>
            <Row label="Evidence Agreement" value={conflict.evidenceAgreement} />
            <Row label="Applicability Conflict" value={conflict.applicabilityConflict ? "Yes" : "No"} />
            <Row label="Effective Date Conflict" value={conflict.effectiveDateConflict ? "Yes" : "No"} />
            <Row label="Access Conflict" value={conflict.accessConflict ? "Yes" : "No"} />
            <Row label="Affected Teams" value={conflict.affectedTeamIds.join(", ") || "—"} />
            <Row label="Affected Personas" value={conflict.affectedPersonaIds.join(", ") || "—"} />
            <Row label="Affected Decisions" value={conflict.affectedDecisionIds.join(", ") || "—"} />
            <Row label="Recommended Resolution" value={conflict.recommendedResolution} />
            <Row label="Status" value={<Pill label={conflict.reviewStatus} tone={tone(conflict.reviewStatus)} />} />
            <Row label="Resolution" value={conflict.resolution ?? "Unresolved"} />
          </dl>
          <div className="flex flex-wrap gap-1">
            {options.map((o) => (
              <Button key={o} size="sm" variant="outline" className="h-7 text-[11px]"
                onClick={() => (o === "Merge" ? onMerge(conflict) : onResolve(conflict, o))}>{o}</Button>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* Drift comparison drawer                                             */
/* ------------------------------------------------------------------ */

export function DriftDrawer({ open, onOpenChange, drift, onAction }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  drift: MemoryDrift | null;
  onAction: (a: string, d: MemoryDrift) => void;
}) {
  const actions = ["Accept Update", "Create Version", "Refresh Relationships", "Reindex", "Dismiss as Nonmaterial", "Request Review"];
  return (
    <Drawer open={open} onOpenChange={onOpenChange}
      title={drift ? `${drift.id} · ${drift.memoryRecord}` : "Drift"} description={drift?.driftType}>
      {drift && (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded border border-slate-200 bg-slate-50 p-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Previous value</p>
              <p className="text-[12px] text-slate-800">{drift.previousValue}</p>
            </div>
            <div className="rounded border border-amber-200 bg-amber-50 p-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">Current value</p>
              <p className="text-[12px] text-slate-900">{drift.currentValue}</p>
            </div>
          </div>
          <dl>
            <Row label="Materiality" value={<Pill label={drift.materiality} tone={tone(drift.materiality)} />} />
            <Row label="Changed Source" value={drift.changedSourceRecordId} />
            <Row label="Affected Relationships" value={drift.affectedRelationshipIds.join(", ") || "—"} />
            <Row label="Affected Personas" value={drift.affectedPersonaIds.join(", ") || "—"} />
            <Row label="Affected Evaluations" value={drift.affectedEvaluationIds.join(", ") || "—"} />
            <Row label="Affected Decisions" value={drift.affectedDecisionIds.join(", ") || "—"} />
            <Row label="Detected" value={drift.detectedAt} />
            <Row label="Owner" value={drift.owner} />
            <Row label="Status" value={<Pill label={drift.status} tone={tone(drift.status)} />} />
          </dl>
          <div className="flex flex-wrap gap-1">
            {actions.map((a) => <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, drift)}>{a}</Button>)}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* Merge dialog                                                        */
/* ------------------------------------------------------------------ */

export function MergeDialog({ open, onOpenChange, candidate, onComplete }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  candidate: CurationCandidate | null;
  onComplete: (summary: string) => void;
}) {
  const steps = ["Select Surviving Record", "Choose Field Values", "Preserve History", "Downstream Impact", "Review", "Merge"];
  const [step, setStep] = useState(0);
  const [surviving, setSurviving] = useState<"A" | "B">("A");
  const [fields, setFields] = useState<Record<MergeFieldKey, "A" | "B">>(
    Object.fromEntries(mergeFieldKeys.map((k) => [k, "A"])) as Record<MergeFieldKey, "A" | "B">);
  const [preserve, setPreserve] = useState<string[]>(mergeHistoryItems);
  const sim = useSimulation(mergeSimulationSteps);

  useEffect(() => { if (open) { setStep(0); sim.reset(); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);

  if (!candidate) return null;
  const survivingId = surviving === "A" ? candidate.recordAId : candidate.recordBId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Merge Records · {candidate.title}</DialogTitle>
          <DialogDescription className="text-[12px]">
            Historical lineage is never destroyed. Prior identifiers redirect to the surviving record.
          </DialogDescription>
        </DialogHeader>

        <Steps steps={steps} current={step} />

        <div className="mt-2 text-[11.5px]">
          {step === 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {(["A", "B"] as const).map((k) => (
                <button key={k} type="button" onClick={() => setSurviving(k)} aria-pressed={surviving === k}
                  className={cn("rounded border p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    surviving === k ? "border-blue-500 bg-blue-50" : "border-slate-200")}>
                  <p className="font-semibold text-slate-900">Record {k} · {k === "A" ? candidate.recordAId : candidate.recordBId}</p>
                  <p className="text-slate-700">{k === "A" ? candidate.recordATitle : candidate.recordBTitle}</p>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <table className="w-full text-[11px]">
              <caption className="sr-only">Choose the surviving value for each merged field</caption>
              <thead className="bg-slate-50">
                <tr><th scope="col" className="px-2 py-1 text-left">Field</th><th scope="col" className="px-2 py-1 text-left">Record A</th><th scope="col" className="px-2 py-1 text-left">Record B</th></tr>
              </thead>
              <tbody>
                {mergeFieldKeys.map((f) => {
                  const row = candidate.fields.find((x) => x.label.startsWith(f.split(" ")[0]));
                  return (
                    <tr key={f} className="border-t border-slate-100">
                      <td className="px-2 py-1 font-medium text-slate-700">{f}</td>
                      {(["A", "B"] as const).map((side) => (
                        <td key={side} className="px-2 py-1">
                          <label className="flex items-start gap-1">
                            <input type="radio" name={`merge-${f}`} checked={fields[f] === side}
                              onChange={() => setFields({ ...fields, [f]: side })}
                              aria-label={`${f} from record ${side}`} />
                            <span className="text-slate-700">{side === "A" ? row?.a ?? "Record A value" : row?.b ?? "Record B value"}</span>
                          </label>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {step === 2 && (
            <div className="space-y-1">
              <p className="text-slate-600">All history items below are preserved on the surviving record.</p>
              {mergeHistoryItems.map((h) => (
                <label key={h} className="flex items-center gap-1.5">
                  <input type="checkbox" checked={preserve.includes(h)} disabled
                    onChange={() => setPreserve((p) => p.includes(h) ? p.filter((x) => x !== h) : [...p, h])} />
                  <span className="text-slate-700">{h}</span>
                  <Pill label="Preserved" tone="green" />
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <dl>{mergeImpact.map((m) => <Row key={m.label} label={m.label} value={m.value} />)}</dl>
          )}

          {step === 4 && (
            <dl>
              <Row label="Surviving Record" value={survivingId} />
              <Row label="Merged Record" value={surviving === "A" ? candidate.recordBId : candidate.recordAId} />
              {mergeFieldKeys.map((f) => <Row key={f} label={f} value={`From record ${fields[f]}`} />)}
              <Row label="Preserved History" value={preserve.join(", ")} />
            </dl>
          )}

          {step === 5 && (
            <div className="space-y-1.5">
              <SimulationList steps={mergeSimulationSteps} index={sim.index < 0 ? 0 : sim.index} />
              {sim.done && <Pill label="Merge completed — redirects created, lineage preserved" tone="green" />}
            </div>
          )}
        </div>

        <DialogFooter className="gap-1 sm:justify-between">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < 5 ? (
            <Button size="sm" className="h-7 text-[11px]" onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : sim.done ? (
            <Button size="sm" className="h-7 text-[11px]" onClick={() => { onComplete(`${candidate.title} merged into ${survivingId}`); onOpenChange(false); }}>Close</Button>
          ) : (
            <Button size="sm" className="h-7 text-[11px]" disabled={sim.running} onClick={() => sim.run()}>Run Merge</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Supersession dialog                                                 */
/* ------------------------------------------------------------------ */

export function SupersessionDialog({ open, onOpenChange, caseId, onCaseId, onComplete }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  caseId: string; onCaseId: (id: string) => void;
  onComplete: (summary: string) => void;
}) {
  const sc: SupersessionCase = supersessionCases.find((c) => c.id === caseId) ?? supersessionCases[0];
  const [option, setOption] = useState<string>(supersessionOptions[0]);
  const [approver, setApprover] = useState("");
  const [scheduled, setScheduled] = useState(sc.effectiveDate);
  const needsApproval = sc.highImpact;
  const valid = !needsApproval || !!approver;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Supersession &amp; Effective Dates</DialogTitle>
          <DialogDescription className="text-[12px]">
            Historical queries continue to return the record that was valid at the selected historical moment.
          </DialogDescription>
        </DialogHeader>

        <FilterSelect label="Supersession Case" value={sc.id} options={supersessionCases.map((c) => c.id)} onChange={onCaseId} />

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded border border-slate-200 p-2">
            <p className="text-[11px] font-semibold text-slate-900">Current Record</p>
            <p className="text-[11px] text-slate-700">{sc.currentRecordId} · {sc.currentRecord}</p>
            <dl><Row label="Authority" value={sc.authorityCurrent} /><Row label="Evidence" value={sc.evidenceCurrent} /></dl>
          </div>
          <div className="rounded border border-blue-200 bg-blue-50 p-2">
            <p className="text-[11px] font-semibold text-slate-900">Replacement Record</p>
            <p className="text-[11px] text-slate-700">{sc.replacementRecordId} · {sc.replacementRecord}</p>
            <dl><Row label="Authority" value={sc.authorityReplacement} /><Row label="Evidence" value={sc.evidenceReplacement} /></dl>
          </div>
        </div>

        <dl>
          <Row label="Effective Date" value={sc.effectiveDate} />
          <Row label="Expiration Date" value={sc.expirationDate} />
          <Row label="Reason" value={sc.reason} />
          <Row label="Affected Consumers" value={sc.affectedConsumers.join(", ")} />
          <Row label="Impact" value={<Pill label={sc.highImpact ? "High impact — approval required" : "Standard"} tone={sc.highImpact ? "red" : "green"} />} />
        </dl>

        <div className="flex flex-wrap gap-1">
          {supersessionOptions.map((o) => (
            <button key={o} type="button" aria-pressed={option === o} onClick={() => setOption(o)}
              className={cn("rounded border px-1.5 py-0.5 text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                option === o ? "border-blue-500 bg-blue-600 text-white" : "border-slate-200 text-slate-700")}>
              {o}
            </button>
          ))}
        </div>

        {option === "Schedule Supersession" && (
          <label className="block">
            <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Scheduled effective date</span>
            <input type="date" value={scheduled} onChange={(e) => setScheduled(e.target.value)}
              className="mt-0.5 h-7 w-48 rounded border border-slate-200 px-1.5 text-[11px]" />
          </label>
        )}

        {needsApproval && (
          <FilterSelect label="Approver (required for high impact)" value={approver}
            options={["", "Chief Architect", "Release Governance Lead", "Compliance Reviewer"]} onChange={setApprover} />
        )}

        <DialogFooter>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11px]" disabled={!valid}
            onClick={() => {
              onComplete(`${option} applied to ${sc.currentRecordId} → ${sc.replacementRecordId}${option === "Schedule Supersession" ? ` on ${scheduled}` : ""}`);
              onOpenChange(false);
            }}>
            Apply Supersession
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Refresh dialog                                                      */
/* ------------------------------------------------------------------ */

export function RefreshDialog({ open, onOpenChange, onComplete }: {
  open: boolean; onOpenChange: (v: boolean) => void; onComplete: (summary: string) => void;
}) {
  const steps = ["Scope", "Refresh Options", "Preserve", "Review", "Execute"];
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState(refreshScopes[4]);
  const [options, setOptions] = useState<string[]>(refreshOptions.slice(0, 6));
  const sim = useSimulation(refreshSimulationSteps);
  useEffect(() => { if (open) { setStep(0); sim.reset(); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="panel-refresh" className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Memory Refresh</DialogTitle>
          <DialogDescription className="text-[12px]">Reload source state, revalidate governance and reassess downstream impact.</DialogDescription>
        </DialogHeader>
        <Steps steps={steps} current={step} />

        <div className="mt-2 text-[11.5px]">
          {step === 0 && <FilterSelect label="Scope" value={scope} options={refreshScopes} onChange={setScope} />}
          {step === 1 && (
            <div className="grid gap-1 sm:grid-cols-2">
              {refreshOptions.map((o) => (
                <label key={o} className="flex items-center gap-1.5">
                  <input type="checkbox" checked={options.includes(o)}
                    onChange={() => setOptions((p) => p.includes(o) ? p.filter((x) => x !== o) : [...p, o])} />
                  <span className="text-slate-700">{o}</span>
                </label>
              ))}
            </div>
          )}
          {step === 2 && (
            <ul className="space-y-0.5">
              {refreshPreserve.map((p) => <li key={p} className="flex items-center gap-1.5 text-slate-700"><Pill label="Preserved" tone="green" />{p}</li>)}
            </ul>
          )}
          {step === 3 && (
            <dl>
              <Row label="Scope" value={scope} />
              <Row label="Options" value={`${options.length} selected`} />
              <Row label="Records affected" value="3,284" />
              <Row label="Relationships affected" value="4,918" />
              <Row label="Personas affected" value="8" />
              <Row label="Evaluations affected" value="4" />
              <Row label="Decisions affected" value="2" />
              <Row label="Estimated duration" value="6 minutes" />
            </dl>
          )}
          {step === 4 && (
            <div className="space-y-1.5">
              <SimulationList steps={refreshSimulationSteps} index={sim.index < 0 ? 0 : sim.index} />
              {sim.done && <dl>{refreshResults.map((r) => <Row key={r.label} label={r.label} value={r.value} />)}</dl>}
            </div>
          )}
        </div>

        <DialogFooter className="gap-1 sm:justify-between">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < 4 ? <Button size="sm" className="h-7 text-[11px]" onClick={() => setStep((s) => s + 1)}>Next</Button>
            : sim.done ? <Button size="sm" className="h-7 text-[11px]" onClick={() => { onComplete("Memory refresh completed — 3,284 records updated, 1,102 new versions"); onOpenChange(false); }}>Close</Button>
              : <Button size="sm" className="h-7 text-[11px]" disabled={sim.running} onClick={() => sim.run()}>Execute Refresh</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Create snapshot dialog                                              */
/* ------------------------------------------------------------------ */

export function CreateSnapshotDialog({ open, onOpenChange, onCreate }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onCreate: (payload: { name: string; reason: string; scope: string; pointInTime: string; includes: string[] }) => void;
}) {
  const [name, setName] = useState("Payments Governance Snapshot");
  const [reason, setReason] = useState("Capture approved memory before retry policy expansion");
  const [scope, setScope] = useState(snapshotScopes[3]);
  const [pit, setPit] = useState("2026-08-06");
  const [includes, setIncludes] = useState<string[]>(snapshotIncludes);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Create Snapshot</DialogTitle>
          <DialogDescription className="text-[12px]">Creates a simulated immutable capture. Live memory is never overwritten.</DialogDescription>
        </DialogHeader>
        <label className="block">
          <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-0.5 h-7 w-full rounded border border-slate-200 px-1.5 text-[11px]" />
        </label>
        <label className="block">
          <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Reason</span>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2}
            className="mt-0.5 w-full rounded border border-slate-200 p-1.5 text-[11px]" />
        </label>
        <div className="grid gap-1.5 sm:grid-cols-2">
          <FilterSelect label="Scope" value={scope} options={snapshotScopes} onChange={setScope} />
          <label className="flex flex-col gap-0.5">
            <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Point in Time</span>
            <input type="date" value={pit} onChange={(e) => setPit(e.target.value)} className="h-7 rounded border border-slate-200 px-1.5 text-[11px]" />
          </label>
        </div>
        <fieldset>
          <legend className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Include</legend>
          <div className="mt-1 grid gap-1 sm:grid-cols-2">
            {snapshotIncludes.map((i) => (
              <label key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                <input type="checkbox" checked={includes.includes(i)}
                  onChange={() => setIncludes((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i])} />
                {i}
              </label>
            ))}
          </div>
        </fieldset>
        <DialogFooter>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11px]" disabled={!name.trim()}
            onClick={() => { onCreate({ name, reason, scope, pointInTime: pit, includes }); onOpenChange(false); }}>Create Snapshot</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Publish dialog                                                      */
/* ------------------------------------------------------------------ */

export function PublishDialog({ open, onOpenChange, onComplete }: {
  open: boolean; onOpenChange: (v: boolean) => void; onComplete: (summary: string) => void;
}) {
  const steps = ["Scope", "Destinations", "Validate", "Review", "Publish"];
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState(publishScopes[4]);
  const [dests, setDests] = useState<string[]>(publishDestinations.map((d) => d.id));
  const sim = useSimulation(publishSimulationSteps);
  useEffect(() => { if (open) { setStep(0); sim.reset(); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);

  const validations = publishValidations.map((v) => ({
    name: v, status: v === "Conflict Status" ? "Warning" : "Passed",
    detail: v === "Conflict Status" ? "1 open authority conflict excluded from this publication" : "All records passed",
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Publish Memory</DialogTitle>
          <DialogDescription className="text-[12px]">Only approved, access validated records are published.</DialogDescription>
        </DialogHeader>
        <Steps steps={steps} current={step} />

        <div className="mt-2 text-[11.5px]">
          {step === 0 && <FilterSelect label="Scope" value={scope} options={publishScopes} onChange={setScope} />}
          {step === 1 && (
            <div className="grid gap-1 sm:grid-cols-2">
              {publishDestinations.map((d) => (
                <label key={d.id} className="flex items-center gap-1.5 text-slate-700">
                  <input type="checkbox" checked={dests.includes(d.id)}
                    onChange={() => setDests((p) => p.includes(d.id) ? p.filter((x) => x !== d.id) : [...p, d.id])} />
                  {d.name}
                </label>
              ))}
            </div>
          )}
          {step === 2 && (
            <ul className="space-y-0.5">
              {validations.map((v) => (
                <li key={v.name} className="flex items-center justify-between gap-2 border-b border-slate-100 py-1 last:border-0">
                  <span className="text-slate-700">{v.name} — {v.detail}</span>
                  <Pill label={v.status} tone={v.status === "Passed" ? "green" : "amber"} />
                </li>
              ))}
            </ul>
          )}
          {step === 3 && (
            <dl>
              <Row label="Scope" value={scope} />
              <Row label="Destinations" value={`${dests.length} selected`} />
              <Row label="Records" value="18,426 approved" />
              <Row label="Excluded" value="1 record with open authority conflict" />
              <Row label="Access validation" value="Validated" />
            </dl>
          )}
          {step === 4 && (
            <div className="space-y-1.5">
              <SimulationList steps={publishSimulationSteps} index={sim.index < 0 ? 0 : sim.index} />
              {sim.done && (
                <ul className="list-disc pl-4 text-slate-700">
                  <li>Memory status updated to Published</li>
                  <li>Destination status updated</li>
                  <li>Activity and audit event created</li>
                  <li>Consumers notified</li>
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-1 sm:justify-between">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < 4 ? <Button size="sm" className="h-7 text-[11px]" onClick={() => setStep((s) => s + 1)}>Next</Button>
            : sim.done ? <Button size="sm" className="h-7 text-[11px]" onClick={() => { onComplete(`Publication completed to ${dests.length} destinations`); onOpenChange(false); }}>Close</Button>
              : <Button size="sm" className="h-7 text-[11px]" disabled={sim.running} onClick={() => sim.run()}>Publish</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Global search dialog                                                */
/* ------------------------------------------------------------------ */

export function GlobalSearchDialog({ open, onOpenChange, identityAllowsRestricted, onOpenResult }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  identityAllowsRestricted: boolean;
  onOpenResult: (id: string, type: string) => void;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const results = useMemo(() => runGlobalSearch(q, type), [q, type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Search Enterprise Memory</DialogTitle>
          <DialogDescription className="text-[12px]">
            Records, evidence, artifacts, conditions, personas, entities, relationships, policies, risks, controls,
            decisions, outcomes, learning records, governance reviews and snapshots.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-end gap-1.5">
          <label className="flex flex-1 flex-col gap-0.5">
            <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Query</span>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search across enterprise memory"
              className="h-8 w-full rounded border border-slate-200 px-2 text-[12px] focus:border-blue-400 focus:outline-none" />
          </label>
          <FilterSelect label="Type" value={type} options={["All", ...globalSearchTypes]} onChange={setType} />
        </div>

        <div className="flex flex-wrap gap-1">
          {globalSearchExamples.map((e) => (
            <button key={e} type="button" onClick={() => setQ(e)}
              className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-600 hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              {e}
            </button>
          ))}
        </div>

        {results.length === 0 ? <EmptyState message="No matches" hint="Try one of the example queries" /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-[11px]">
              <caption className="sr-only">Global search results</caption>
              <thead className="bg-slate-50">
                <tr>{["Type", "Title", "Domain", "Owner", "Authority", "Confidence", "Freshness", "Access State", "Action"].map((h) =>
                  <th key={h} scope="col" className="px-2 py-1 text-left font-semibold text-slate-600">{h}</th>)}</tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const denied = r.accessState === "Denied" && !identityAllowsRestricted;
                  return (
                    <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-2 py-1">{r.type}</td>
                      <td className="px-2 py-1 font-medium text-slate-800">{r.title}<div className="text-[10px] text-slate-500">{r.id}</div></td>
                      <td className="px-2 py-1">{r.domain}</td>
                      <td className="px-2 py-1">{r.owner}</td>
                      <td className="px-2 py-1">{r.authority}</td>
                      <td className="px-2 py-1">{r.confidence}</td>
                      <td className="px-2 py-1">{r.freshness}</td>
                      <td className="px-2 py-1">
                        <Pill label={denied ? "Denied" : r.accessState} tone={denied ? "red" : r.accessState === "Allowed" ? "green" : "amber"} />
                      </td>
                      <td className="px-2 py-1">
                        <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={denied}
                          onClick={() => onOpenResult(r.id, r.type)}>{denied ? "Restricted" : "Open"}</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications drawer                                                */
/* ------------------------------------------------------------------ */

export function NotificationsDrawer({ open, onOpenChange, notifications, onMarkRead, onMarkAll, onOpenItem, onAssign, onAcknowledge }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  notifications: MemoryNotification[];
  onMarkRead: (n: MemoryNotification) => void;
  onMarkAll: () => void;
  onOpenItem: (n: MemoryNotification) => void;
  onAssign: (n: MemoryNotification) => void;
  onAcknowledge: (n: MemoryNotification) => void;
}) {
  const [category, setCategory] = useState("All");
  const rows = notifications.filter((n) => category === "All" || n.category === category);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Memory Notifications"
      description={`${notifications.filter((n) => !n.read).length} unread`}>
      <div className="flex items-end gap-1.5">
        <FilterSelect label="Category" value={category} options={["All", ...notificationCategories]} onChange={setCategory} />
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onMarkAll}>Mark All Read</Button>
      </div>
      {rows.length === 0 ? <EmptyState message="No notifications in this category" /> : (
        <ul className="space-y-1">
          {rows.map((n) => (
            <li key={n.id} className={cn("rounded border p-2", n.read ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11.5px] font-semibold text-slate-900">{n.title}</p>
                  <p className="text-[10.5px] text-slate-600">{n.category} · {n.time}</p>
                  <p className="text-[11px] text-slate-700">{n.detail}</p>
                </div>
                <Pill label={n.severity === "critical" ? "Critical" : n.severity === "warning" ? "Warning" : "Info"}
                  tone={n.severity === "critical" ? "red" : n.severity === "warning" ? "amber" : "blue"} />
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onOpenItem(n)}>Open Item</Button>
                <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onMarkRead(n)} disabled={n.read}>Mark Read</Button>
                <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onAssign(n)}>Assign</Button>
                <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onAcknowledge(n)}>Acknowledge</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* Governed export dialog                                              */
/* ------------------------------------------------------------------ */

export function ExportDialog({ open, onOpenChange, restrictedAllowed, onExport }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  restrictedAllowed: boolean;
  onExport: (cfg: { format: ExportFormat; scope: string; options: string[]; includeRestricted: boolean }) => void;
}) {
  const [format, setFormat] = useState<ExportFormat>("CSV");
  const [scope, setScope] = useState(exportScopes[0]);
  const [options, setOptions] = useState<string[]>(exportOptions.slice(0, 6));
  const [includeRestricted, setIncludeRestricted] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Export Enterprise Memory</DialogTitle>
          <DialogDescription className="text-[12px]">
            Restricted content is never exported when the simulated identity lacks permission.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5 sm:grid-cols-2">
          <FilterSelect label="Format" value={format} options={[...exportFormats]} onChange={(v) => setFormat(v as ExportFormat)} />
          <FilterSelect label="Scope" value={scope} options={exportScopes} onChange={setScope} />
        </div>
        <fieldset>
          <legend className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Options</legend>
          <div className="mt-1 grid gap-1 sm:grid-cols-3">
            {exportOptions.map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                <input type="checkbox" checked={options.includes(o)}
                  onChange={() => setOptions((p) => p.includes(o) ? p.filter((x) => x !== o) : [...p, o])} />
                {o}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex items-center gap-1.5 text-[11px] text-slate-700">
          <input type="checkbox" checked={includeRestricted && restrictedAllowed} disabled={!restrictedAllowed}
            onChange={(e) => setIncludeRestricted(e.target.checked)} />
          Include restricted content
          {!restrictedAllowed && <Pill label="Blocked — simulated identity lacks entitlement" tone="red" />}
        </label>
        <DialogFooter>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11px]"
            onClick={() => { onExport({ format, scope, options, includeRestricted: includeRestricted && restrictedAllowed }); onOpenChange(false); }}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Demo story overlay                                                  */
/* ------------------------------------------------------------------ */

export function DemoStoryOverlay({ step, onNext, onPrev, onExit, reducedMotion, onToggleMotion }: {
  step: number; onNext: () => void; onPrev: () => void; onExit: () => void;
  reducedMotion: boolean; onToggleMotion: (v: boolean) => void;
}) {
  const s = demoSteps[step];
  const [notes, setNotes] = useState(true);

  useEffect(() => {
    const el = document.getElementById(s.target);
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      el.classList.add("ring-2", "ring-blue-500", "ring-offset-2");
      return () => el.classList.remove("ring-2", "ring-blue-500", "ring-offset-2");
    }
  }, [s.target, reducedMotion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit, onNext, onPrev]);

  return (
    <div role="dialog" aria-label="Demo story" aria-live="polite"
      className="fixed inset-x-2 bottom-2 z-50 mx-auto max-w-3xl rounded-xl border border-blue-300 bg-white p-3 shadow-xl">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
            Demo Story · Step {s.id} of {demoSteps.length} · {s.title}
          </p>
          <p className="text-[12.5px] text-slate-800">{s.caption}</p>
          {notes && <p className="mt-1 text-[11px] italic text-slate-500">Presenter note: {s.presenterNote}</p>}
        </div>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onExit}>Exit Story</Button>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded bg-slate-100" aria-hidden>
        <div className="h-full bg-blue-600" style={{ width: `${((step + 1) / demoSteps.length) * 100}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onPrev} disabled={step === 0}>Previous</Button>
        <Button size="sm" className="h-7 text-[11px]" onClick={onNext} disabled={step === demoSteps.length - 1}>Next</Button>
        <label className="flex items-center gap-1 text-[11px] text-slate-600">
          <input type="checkbox" checked={notes} onChange={(e) => setNotes(e.target.checked)} /> Presenter notes
        </label>
        <label className="flex items-center gap-1 text-[11px] text-slate-600">
          <input type="checkbox" checked={reducedMotion} onChange={(e) => onToggleMotion(e.target.checked)} /> Reduced motion
        </label>
      </div>
    </div>
  );
}
