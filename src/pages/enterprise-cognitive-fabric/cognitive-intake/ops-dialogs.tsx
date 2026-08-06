/**
 * Cognitive Intake — Prompt 2 workflow dialogs.
 *
 * Submit Work, Import Work Item, Run Intake, Request Clarification,
 * Clarification Response, Add Evidence, Request Evidence, Entity Remediation,
 * Dynamic Context Refresh, Intake Reprocessing, Bulk Actions,
 * Route to Cognitive Readiness Assessment, Global Search, Governed Export,
 * and Demo Scenario control.
 */

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Pill, Row } from "../persona-studio/primitives";
import { intakeTone } from "./panels";
import {
  intakes, intakeFilterOptions, type CognitiveIntake,
} from "./data";
import {
  analysisOptions, bulkActions, bulkRoutingPreview, clarificationOwners,
  clarificationResponseTypes, computeRefreshDelta, contextRefreshOptions, contextRefreshScopes,
  contextRefreshStages, contextRuleOptions, demoScenarios, entityCandidates,
  entityRemediationActions, evidenceTypes, exportFormats, exportOptions, exportScopes,
  importRecords, importSources, qualityControlDefaults, runIntakeStages, runScopeOptions,
  searchExamples, searchIntake, submitStages, syntheticResponses, toCsv, toYaml,
  buildExportRows, unsupportedBulkActions, validateRouting,
  type ExportFormat, type RoutingInput, type RuleInput, type ScenarioDefinition, type SearchResult,
} from "./ops-data";

const workTypeOptions = intakeFilterOptions.workType.filter((w) => w !== "All");

/* ----------------------------------------------------------------- helpers */

const field =
  "h-8 w-full rounded-md border border-slate-200 px-2 text-[12px] text-slate-800 focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
const area =
  "w-full rounded-md border border-slate-200 p-2 text-[12px] text-slate-800 focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
const label = "text-[10px] font-semibold uppercase tracking-wide text-slate-500";

function Field({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className={label}>{title}</label>
      {children}
    </div>
  );
}

function CheckList({
  title, options, value, onChange, columns = 2,
}: {
  title: string; options: string[]; value: string[];
  onChange: (v: string[]) => void; columns?: number;
}) {
  return (
    <fieldset>
      <legend className={label}>{title}</legend>
      <div className={cn("mt-1 grid gap-1", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
        {options.map((o) => (
          <label key={o} className="flex items-center gap-1.5 text-[11.5px] text-slate-700">
            <input type="checkbox" checked={value.includes(o)}
              onChange={() => onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o])} />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Deterministic staged progress runner shared by submit / run / refresh. */
function useStages(stages: string[], running: boolean, reducedMotion = false) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!running) { setIndex(0); return; }
    if (reducedMotion) { setIndex(stages.length - 1); return; }
    if (index >= stages.length - 1) return;
    const t = setTimeout(() => setIndex((i) => i + 1), 320);
    return () => clearTimeout(t);
  }, [running, index, stages.length, reducedMotion]);
  return { index, done: index >= stages.length - 1, stage: stages[index] };
}

function StageProgress({ stages, index }: { stages: string[]; index: number }) {
  const pct = Math.round(((index + 1) / stages.length) * 100);
  return (
    <div className="space-y-1.5">
      <Progress value={pct} className="h-1.5" aria-label={`Progress ${pct} percent`} />
      <p className="text-[11.5px] text-slate-700" role="status" aria-live="polite">{stages[index]}</p>
      <ol className="max-h-40 space-y-0.5 overflow-auto">
        {stages.map((s, i) => (
          <li key={s} className={cn("text-[11px]", i < index ? "text-emerald-700" : i === index ? "font-medium text-slate-900" : "text-slate-400")}>
            {i < index ? "✓ " : i === index ? "→ " : "· "}{s}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------ submit work -- */

export interface SubmitPayload {
  title: string; description: string; workType: string; priority: string;
  submittingTeam: string; workOwner: string; targetDate: string; evidence: string[];
}

export function SubmitWorkDialog({
  open, onOpenChange, onSubmit,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onSubmit: (p: SubmitPayload) => void;
}) {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [form, setForm] = useState<SubmitPayload>({
    title: "", description: "", workType: workTypeOptions[0],
    priority: "High", submittingTeam: "Checkout Engineering", workOwner: "",
    targetDate: "", evidence: [],
  });
  const { index, done } = useStages(submitStages, running);
  const errors = [
    !form.title.trim() && "Title is required",
    !form.description.trim() && "Description is required",
    !form.workOwner.trim() && "Work owner is required",
  ].filter(Boolean) as string[];

  const reset = () => { setStep(0); setRunning(false); };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Work to Cognitive Intake</DialogTitle>
          <DialogDescription>
            The original submission is preserved unchanged. Cognitive Intake structures the proposal;
            it does not evaluate readiness or approve the change.
          </DialogDescription>
        </DialogHeader>

        {running ? (
          <StageProgress stages={submitStages} index={index} />
        ) : step === 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field id="sw-title" title="Title">
                <input id="sw-title" className={field} value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field id="sw-desc" title="Description of Proposed Work">
                <textarea id="sw-desc" rows={4} className={area} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
            </div>
            <Field id="sw-type" title="Work Type">
              <select id="sw-type" className={field} value={form.workType}
                onChange={(e) => setForm({ ...form, workType: e.target.value })}>
                {workTypeOptions.map((w) => <option key={w}>{w}</option>)}
              </select>
            </Field>
            <Field id="sw-priority" title="Priority">
              <select id="sw-priority" className={field} value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {["Critical", "High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field id="sw-team" title="Submitting Team">
              <input id="sw-team" className={field} value={form.submittingTeam}
                onChange={(e) => setForm({ ...form, submittingTeam: e.target.value })} />
            </Field>
            <Field id="sw-owner" title="Work Owner">
              <input id="sw-owner" className={field} value={form.workOwner}
                onChange={(e) => setForm({ ...form, workOwner: e.target.value })} />
            </Field>
            <Field id="sw-date" title="Target Date">
              <input id="sw-date" type="date" className={field} value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <CheckList title="Supporting Evidence References" columns={3}
                options={["Design Document", "Test Results", "Telemetry", "Rollback Plan", "Security Review", "Architecture Diagram"]}
                value={form.evidence} onChange={(v) => setForm({ ...form, evidence: v })} />
            </div>
            {errors.length > 0 && (
              <ul className="sm:col-span-2 rounded-md border border-amber-200 bg-amber-50 p-2" role="alert">
                {errors.map((e) => <li key={e} className="text-[11px] text-amber-800">{e}</li>)}
              </ul>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="text-[11.5px] text-slate-600">Review the submission. The original text is stored verbatim.</p>
            <dl className="rounded-lg border border-slate-200 p-2">
              <Row label="Title" value={form.title} />
              <Row label="Work Type" value={form.workType} />
              <Row label="Priority" value={form.priority} />
              <Row label="Submitting Team" value={form.submittingTeam} />
              <Row label="Work Owner" value={form.workOwner} />
              <Row label="Target Date" value={form.targetDate || "Not specified"} />
              <Row label="Evidence" value={form.evidence.join(", ") || "None referenced"} />
            </dl>
            <p className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-700">{form.description}</p>
          </div>
        )}

        <DialogFooter className="gap-1.5">
          {!running && step === 1 && <Button variant="outline" size="sm" onClick={() => setStep(0)}>Back</Button>}
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          {!running && step === 0 && (
            <Button size="sm" disabled={errors.length > 0} onClick={() => setStep(1)}>Review Submission</Button>
          )}
          {!running && step === 1 && <Button size="sm" onClick={() => setRunning(true)}>Submit Work</Button>}
          {running && (
            <Button size="sm" disabled={!done} onClick={() => { onSubmit(form); onOpenChange(false); reset(); }}>
              {done ? "Open Intake Record" : "Working…"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------------------------------- import work --- */

export function ImportWorkDialog({
  open, onOpenChange, onImport,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onImport: (records: typeof importRecords) => void;
}) {
  const [source, setSource] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const rows = importRecords.filter((r) =>
    (source === "All" || r.source === source) &&
    (!query.trim() || `${r.sourceId} ${r.title} ${r.owner}`.toLowerCase().includes(query.toLowerCase())));
  const picked = importRecords.filter((r) => selected.includes(r.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Work Item</DialogTitle>
          <DialogDescription>
            Import existing work records into governed intake. Source metadata is preserved and
            missing fields are recorded as explicit gaps.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          <label className="sr-only" htmlFor="imp-source">Source system</label>
          <select id="imp-source" className={cn(field, "w-44")} value={source} onChange={(e) => setSource(e.target.value)}>
            {["All", ...importSources].map((s) => <option key={s}>{s}</option>)}
          </select>
          <label className="sr-only" htmlFor="imp-q">Search source records</label>
          <input id="imp-q" className={cn(field, "w-56")} placeholder="Search records"
            value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="max-h-72 overflow-auto rounded-lg border border-slate-200">
          <table className="w-full border-collapse text-[11px]">
            <caption className="sr-only">Available source records for import</caption>
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                {["", "Source", "Record", "Title", "Owner", "Timestamp", "Status", "Classification", "Missing Fields"].map((h) => (
                  <th key={h} scope="col" className="whitespace-nowrap border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-2 py-1">
                    <input type="checkbox" checked={selected.includes(r.id)} aria-label={`Select ${r.title}`}
                      onChange={() => setSelected((s) => s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id])} />
                  </td>
                  <td className="px-2 py-1 text-slate-600">{r.source}</td>
                  <td className="whitespace-nowrap px-2 py-1 font-medium text-slate-800">{r.sourceId}</td>
                  <td className="px-2 py-1 text-slate-700">{r.title}</td>
                  <td className="px-2 py-1 text-slate-600">{r.owner}</td>
                  <td className="whitespace-nowrap px-2 py-1 text-slate-600">{r.timestamp}</td>
                  <td className="px-2 py-1 text-slate-600">{r.status}</td>
                  <td className="px-2 py-1"><Pill label={r.accessClassification} tone={r.accessClassification === "Restricted" ? "red" : r.accessClassification === "Confidential" ? "amber" : "slate"} /></td>
                  <td className="px-2 py-1 text-amber-700">{r.missingFields.join(", ") || "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {picked.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className={label}>Mapping Preview</p>
            <ul className="mt-1 space-y-0.5">
              {picked.map((p) => (
                <li key={p.id} className="text-[11px] text-slate-700">
                  {p.sourceId} → {p.workType} · {p.team} · owner {p.owner}
                  {p.missingFields.length > 0 && <span className="text-amber-700"> · gaps: {p.missingFields.join(", ")}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" disabled={picked.length === 0} onClick={() => { onImport(picked); onOpenChange(false); setSelected([]); }}>
            Import {picked.length > 0 ? `${picked.length} Record(s)` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------- run intake */

export function RunIntakeDialog({
  open, onOpenChange, onComplete, selectedCount,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onComplete: (scope: string) => void; selectedCount: number;
}) {
  const [scope, setScope] = useState(runScopeOptions[0]);
  const [analyses, setAnalyses] = useState<string[]>(analysisOptions);
  const [rules, setRules] = useState<string[]>(contextRuleOptions.slice(0, 5));
  const [quality, setQuality] = useState(qualityControlDefaults);
  const [running, setRunning] = useState(false);
  const { index, done } = useStages(runIntakeStages, running);

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setRunning(false); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Run Cognitive Intake</DialogTitle>
          <DialogDescription>
            Execute classification, decomposition, entity resolution, context retrieval, and gap
            detection. Intake never produces an approval or readiness decision.
          </DialogDescription>
        </DialogHeader>

        {running ? <StageProgress stages={runIntakeStages} index={index} /> : (
          <div className="grid gap-2 lg:grid-cols-2">
            <div className="space-y-2">
              <Field id="ri-scope" title="Scope">
                <select id="ri-scope" className={field} value={scope} onChange={(e) => setScope(e.target.value)}>
                  {runScopeOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <p className="text-[11px] text-slate-500">{selectedCount} intake(s) currently selected.</p>
              <CheckList title="Analyses to Perform" options={analysisOptions} value={analyses} onChange={setAnalyses} />
            </div>
            <div className="space-y-2">
              <CheckList title="Context Retrieval Rules" options={contextRuleOptions} value={rules} onChange={setRules} />
              <fieldset className="space-y-1">
                <legend className={label}>Quality Controls</legend>
                {Object.entries(quality).map(([k, v]) => (
                  <label key={k} className="flex items-center justify-between gap-2 text-[11px] text-slate-700">
                    <span>{k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}</span>
                    <input type="number" className="h-7 w-20 rounded border border-slate-200 px-1 text-[11px]"
                      value={v} onChange={(e) => setQuality({ ...quality, [k]: Number(e.target.value) })} />
                  </label>
                ))}
              </fieldset>
            </div>
          </div>
        )}

        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          {!running && <Button size="sm" onClick={() => setRunning(true)}>Run Intake</Button>}
          {running && (
            <Button size="sm" disabled={!done} onClick={() => { onComplete(scope); onOpenChange(false); setRunning(false); }}>
              {done ? "View Intake Package" : "Running…"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------- clarification request */

export function RequestClarificationDialog({
  open, onOpenChange, gapIds, onRequest,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; gapIds: string[];
  onRequest: (p: { gapId: string; question: string; assignedTo: string; responseType: string; dueDate: string; blocking: boolean }) => void;
}) {
  const [gapId, setGapId] = useState(gapIds[0] ?? "GAP 9104");
  const [question, setQuestion] = useState(syntheticResponses[gapIds[0] ?? "GAP 9104"]?.question ?? "");
  const [assignedTo, setAssignedTo] = useState(clarificationOwners[0]);
  const [responseType, setResponseType] = useState<string>(clarificationResponseTypes[0]);
  const [dueDate, setDueDate] = useState("");
  const [blocking, setBlocking] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Request Clarification</DialogTitle>
          <DialogDescription>
            Clarification requests are recorded against the gap they answer and tracked on the Intake Package.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Field id="rc-gap" title="Related Gap">
            <select id="rc-gap" className={field} value={gapId}
              onChange={(e) => { setGapId(e.target.value); setQuestion(syntheticResponses[e.target.value]?.question ?? ""); }}>
              {(gapIds.length ? gapIds : Object.keys(syntheticResponses)).map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
          <Field id="rc-q" title="Question">
            <textarea id="rc-q" rows={3} className={area} value={question} onChange={(e) => setQuestion(e.target.value)} />
          </Field>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field id="rc-owner" title="Assigned To">
              <select id="rc-owner" className={field} value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                {clarificationOwners.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field id="rc-type" title="Response Type">
              <select id="rc-type" className={field} value={responseType} onChange={(e) => setResponseType(e.target.value)}>
                {clarificationResponseTypes.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field id="rc-due" title="Due Date">
              <input id="rc-due" type="date" className={field} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
            <label className="flex items-end gap-1.5 pb-1 text-[11.5px] text-slate-700">
              <input type="checkbox" checked={blocking} onChange={() => setBlocking(!blocking)} />
              Blocking for routing
            </label>
          </div>
        </div>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" disabled={!question.trim()}
            onClick={() => { onRequest({ gapId, question, assignedTo, responseType, dueDate, blocking }); onOpenChange(false); }}>
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------- clarification response */

export function ClarificationResponseDialog({
  open, onOpenChange, gapId, onApply,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; gapId: string | null;
  onApply: (gapId: string, effect: string, results: string[]) => void;
}) {
  const seed = gapId ? syntheticResponses[gapId] : null;
  const [text, setText] = useState(seed?.response ?? "");
  useEffect(() => { setText(seed?.response ?? ""); }, [seed?.response]);
  if (!gapId || !seed) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Clarification Response · {gapId}</DialogTitle>
          <DialogDescription>{seed.question}</DialogDescription>
        </DialogHeader>
        <Field id="cr-response" title="Response">
          <textarea id="cr-response" rows={3} className={area} value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <p className={label}>What This Response Changes</p>
          <ul className="mt-1 list-disc pl-4">
            {seed.results.map((r) => <li key={r} className="text-[11.5px] text-slate-700">{r}</li>)}
          </ul>
          <p className="mt-1 text-[11px] text-slate-500">
            Applying a response updates the Intake Package and creates a new package version. It does
            not lower risk severity or approve the change.
          </p>
        </div>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={() => { onApply(gapId, seed.effect, seed.results); onOpenChange(false); }}>
            Apply Response
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------------------------------- evidence ----- */

export function AddEvidenceDialog({
  open, onOpenChange, onAdd,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onAdd: (p: { evidenceType: string; title: string; owner: string; authority: string; asOf: string; closesGapId: string }) => void;
}) {
  const [p, setP] = useState({
    evidenceType: evidenceTypes[1], title: "", owner: "Payments Platform",
    authority: "Primary", asOf: "", closesGapId: "GAP 9101",
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Evidence</DialogTitle>
          <DialogDescription>
            Evidence closes an identified evidence gap. Provenance, authority, and freshness are recorded.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field id="ae-type" title="Evidence Type">
            <select id="ae-type" className={field} value={p.evidenceType} onChange={(e) => setP({ ...p, evidenceType: e.target.value })}>
              {evidenceTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field id="ae-gap" title="Closes Gap">
            <select id="ae-gap" className={field} value={p.closesGapId} onChange={(e) => setP({ ...p, closesGapId: e.target.value })}>
              {Object.keys(syntheticResponses).map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field id="ae-title" title="Title">
              <input id="ae-title" className={field} value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} />
            </Field>
          </div>
          <Field id="ae-owner" title="Evidence Owner">
            <input id="ae-owner" className={field} value={p.owner} onChange={(e) => setP({ ...p, owner: e.target.value })} />
          </Field>
          <Field id="ae-auth" title="Authority">
            <select id="ae-auth" className={field} value={p.authority} onChange={(e) => setP({ ...p, authority: e.target.value })}>
              {["Primary", "Supporting", "Historical"].map((a) => <option key={a}>{a}</option>)}
            </select>
          </Field>
          <Field id="ae-asof" title="As Of Date">
            <input id="ae-asof" type="date" className={field} value={p.asOf} onChange={(e) => setP({ ...p, asOf: e.target.value })} />
          </Field>
        </div>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" disabled={!p.title.trim()} onClick={() => { onAdd(p); onOpenChange(false); }}>Add Evidence</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RequestEvidenceDialog({
  open, onOpenChange, onRequest,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onRequest: (p: { evidenceType: string; requestedFrom: string; justification: string; dueDate: string }) => void;
}) {
  const [p, setP] = useState({
    evidenceType: evidenceTypes[1], requestedFrom: "Payments Platform",
    justification: "Required to evaluate duplicate transaction exposure.", dueDate: "",
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Evidence</DialogTitle>
          <DialogDescription>Evidence requests are tracked until fulfilled, declined, or withdrawn.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Field id="re-type" title="Evidence Type">
            <select id="re-type" className={field} value={p.evidenceType} onChange={(e) => setP({ ...p, evidenceType: e.target.value })}>
              {evidenceTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field id="re-from" title="Requested From">
            <input id="re-from" className={field} value={p.requestedFrom} onChange={(e) => setP({ ...p, requestedFrom: e.target.value })} />
          </Field>
          <Field id="re-just" title="Justification">
            <textarea id="re-just" rows={3} className={area} value={p.justification} onChange={(e) => setP({ ...p, justification: e.target.value })} />
          </Field>
          <Field id="re-due" title="Due Date">
            <input id="re-due" type="date" className={field} value={p.dueDate} onChange={(e) => setP({ ...p, dueDate: e.target.value })} />
          </Field>
        </div>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={() => { onRequest(p); onOpenChange(false); }}>Send Evidence Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------- entity remediation */

export function EntityRemediationDialog({
  open, onOpenChange, onResolve,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onResolve: (p: { detected: string; action: string; candidate: string }) => void;
}) {
  const detectedValues = useMemo(() => Array.from(new Set(entityCandidates.map((c) => c.detected))), []);
  const [detected, setDetected] = useState(detectedValues[0]);
  const [candidate, setCandidate] = useState(entityCandidates[0].id);
  const [action, setAction] = useState(entityRemediationActions[0]);
  const options = entityCandidates.filter((c) => c.detected === detected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Entity Remediation</DialogTitle>
          <DialogDescription>
            Resolve detected values to canonical enterprise entities so downstream evaluation reasons
            about the same objects.
          </DialogDescription>
        </DialogHeader>
        <Field id="er-detected" title="Detected Value">
          <select id="er-detected" className={field} value={detected}
            onChange={(e) => { setDetected(e.target.value); const first = entityCandidates.find((c) => c.detected === e.target.value); if (first) setCandidate(first.id); }}>
            {detectedValues.map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <ul className="space-y-1">
          {options.map((c) => (
            <li key={c.id}>
              <label className={cn("flex cursor-pointer items-start gap-2 rounded-lg border p-2",
                candidate === c.id ? "border-blue-300 bg-blue-50/50" : "border-slate-200")}>
                <input type="radio" name="entity-candidate" checked={candidate === c.id} onChange={() => setCandidate(c.id)} className="mt-0.5" />
                <span>
                  <span className="block text-[11.5px] font-semibold text-slate-800">{c.candidateName}</span>
                  <span className="block text-[11px] text-slate-600">{c.entityType} · {c.owner} · {c.relationship}</span>
                  <span className="block text-[10.5px] text-slate-500">Confidence {c.confidence}% · {c.evidence}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <Field id="er-action" title="Remediation Action">
          <select id="er-action" className={field} value={action} onChange={(e) => setAction(e.target.value)}>
            {entityRemediationActions.map((a) => <option key={a}>{a}</option>)}
          </select>
        </Field>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={() => {
            const c = entityCandidates.find((x) => x.id === candidate);
            onResolve({ detected, action, candidate: c?.candidateName ?? candidate });
            onOpenChange(false);
          }}>Apply Remediation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------------- context refresh */

export function ContextRefreshDialog({
  open, onOpenChange, ruleInput, onProgress, onComplete,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; ruleInput: RuleInput;
  onProgress: (pct: number) => void;
  onComplete: () => void;
}) {
  const [scope, setScope] = useState(contextRefreshScopes[0]);
  const [options, setOptions] = useState<string[]>(contextRefreshOptions.slice(0, 5));
  const [running, setRunning] = useState(false);
  const { index, done } = useStages(contextRefreshStages, running);
  const delta = useMemo(() => computeRefreshDelta(ruleInput), [ruleInput]);

  useEffect(() => {
    if (running) onProgress(Math.round(((index + 1) / contextRefreshStages.length) * 100));
  }, [running, index, onProgress]);

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setRunning(false); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Refresh Enterprise Context</DialogTitle>
          <DialogDescription>
            Re-query Enterprise Cognitive Memory so the Intake Package reflects current organizational truth.
          </DialogDescription>
        </DialogHeader>

        {running ? (
          <div className="space-y-2">
            <StageProgress stages={contextRefreshStages} index={index} />
            {done && (
              <div className="grid gap-2 sm:grid-cols-2">
                <DeltaList title="Records Added" items={delta.recordsAdded} tone="green" />
                <DeltaList title="Records Removed" items={delta.recordsRemoved} tone="slate" />
                <DeltaList title="Personas Added" items={delta.personasAdded} tone="blue" />
                <DeltaList title="Conditions Added" items={delta.conditionsAdded} tone="amber" />
                <DeltaList title="New Gaps" items={delta.newGaps} tone="red" />
                <DeltaList title="Resolved Gaps" items={delta.resolvedGaps} tone="green" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Field id="cx-scope" title="Refresh Scope">
              <select id="cx-scope" className={field} value={scope} onChange={(e) => setScope(e.target.value)}>
                {contextRefreshScopes.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <CheckList title="Refresh Options" options={contextRefreshOptions} value={options} onChange={setOptions} />
          </div>
        )}

        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          {!running && <Button size="sm" onClick={() => setRunning(true)}>Refresh Context</Button>}
          {running && (
            <Button size="sm" disabled={!done} onClick={() => { onComplete(); onOpenChange(false); setRunning(false); }}>
              {done ? "Apply Refreshed Package" : "Refreshing…"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeltaList({ title, items, tone }: { title: string; items: string[]; tone: "green" | "red" | "amber" | "blue" | "slate" }) {
  return (
    <div className="rounded-lg border border-slate-200 p-2">
      <div className="flex items-center justify-between">
        <p className={label}>{title}</p>
        <Pill label={String(items.length)} tone={tone} />
      </div>
      <ul className="mt-1 list-disc pl-4">
        {items.length === 0 && <li className="list-none text-[11px] text-slate-400">No changes</li>}
        {items.map((i) => <li key={i} className="text-[11px] text-slate-700">{i}</li>)}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------- reprocessing */

export function ReprocessDialog({
  open, onOpenChange, onReprocess,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onReprocess: (p: { reason: string; stages: string[]; preserveHistory: boolean }) => void;
}) {
  const [reason, setReason] = useState("Scope changed after submission");
  const [stages, setStages] = useState<string[]>(["Decompose Change", "Resolve Entities", "Retrieve Enterprise Context"]);
  const [preserveHistory, setPreserveHistory] = useState(true);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Reprocess Intake</DialogTitle>
          <DialogDescription>
            Reprocessing creates a new package version. Prior versions are always preserved.
          </DialogDescription>
        </DialogHeader>
        <Field id="rp-reason" title="Reason">
          <select id="rp-reason" className={field} value={reason} onChange={(e) => setReason(e.target.value)}>
            {["Scope changed after submission", "Entity model updated", "Enterprise context changed",
              "Evidence supplied", "Clarification answered", "Configuration version changed"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <CheckList title="Stages to Re-run" options={analysisOptions} value={stages} onChange={setStages} />
        <label className="flex items-center gap-1.5 text-[11.5px] text-slate-700">
          <input type="checkbox" checked={preserveHistory} onChange={() => setPreserveHistory(!preserveHistory)} />
          Preserve original submission and prior package versions
        </label>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={() => { onReprocess({ reason, stages, preserveHistory }); onOpenChange(false); }}>Reprocess</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------ bulk actions */

export function BulkActionDialog({
  open, onOpenChange, selected, onApply,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; selected: CognitiveIntake[];
  onApply: (action: string, rows: CognitiveIntake[]) => void;
}) {
  const [action, setAction] = useState(bulkActions[0]);
  const preview = bulkRoutingPreview(selected);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Bulk Action</DialogTitle>
          <DialogDescription>{selected.length} intake(s) selected.</DialogDescription>
        </DialogHeader>
        <Field id="ba-action" title="Action">
          <select id="ba-action" className={field} value={action} onChange={(e) => setAction(e.target.value)}>
            {bulkActions.map((a) => <option key={a}>{a}</option>)}
          </select>
        </Field>
        <dl className="rounded-lg border border-slate-200 p-2">
          <Row label="Selected" value={preview.selected} />
          <Row label="Structurally Incomplete" value={preview.incomplete} />
          <Row label="Intakes With Critical Gaps" value={preview.criticalGaps} />
          <Row label="Open Questions" value={preview.openQuestions} />
          <Row label="Average Evidence Coverage" value={`${preview.evidenceCoverage}%`} />
          <Row label="Candidate Personas" value={preview.candidatePersonas} />
        </dl>
        <p className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600">
          Not supported in bulk: {unsupportedBulkActions.join(", ")}.
        </p>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" disabled={selected.length === 0} onClick={() => { onApply(action, selected); onOpenChange(false); }}>
            Apply to {selected.length}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------- route to readiness */

export function RouteToReadinessDialog({
  open, onOpenChange, routingInput, onRoute,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; routingInput: RoutingInput;
  onRoute: (validationStatus: string) => void;
}) {
  const v = useMemo(() => validateRouting(routingInput), [routingInput]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Route to Cognitive Readiness Assessment</DialogTitle>
          <DialogDescription>
            Routing validation confirms the Intake Package is structurally complete. It does not
            compute readiness — that happens in the next module.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Pill label={v.status} tone={intakeTone(v.status === "Passed" ? "Success" : v.status === "Blocked" ? "Blocked" : "Warning")} />
          <span className="text-[11.5px] text-slate-600">
            {v.canRoute ? "Package can be routed forward." : "Resolve blocking issues before routing."}
          </span>
        </div>
        {v.blockingIssues.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-2" role="alert">
            <p className={label}>Blocking Issues</p>
            <ul className="mt-1 list-disc pl-4">{v.blockingIssues.map((b) => <li key={b} className="text-[11.5px] text-red-700">{b}</li>)}</ul>
          </div>
        )}
        {v.warnings.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-2">
            <p className={label}>Warnings Carried Forward</p>
            <ul className="mt-1 list-disc pl-4">{v.warnings.map((w) => <li key={w} className="text-[11.5px] text-amber-800">{w}</li>)}</ul>
          </div>
        )}
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" disabled={!v.canRoute} onClick={() => { onRoute(v.status); onOpenChange(false); }}>
            Route to Readiness Assessment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------ global search */

export function GlobalSearchDialog({
  open, onOpenChange, onSelect,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onSelect: (r: SearchResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const results = useMemo(() => {
    const rows = searchIntake(query);
    return type === "All" ? rows : rows.filter((r) => r.resultType === type);
  }, [query, type]);
  const types = useMemo(() => Array.from(new Set(searchIntake("").map((r) => r.resultType))), []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Search Cognitive Intake</DialogTitle>
          <DialogDescription>Search incoming work, entities, personas, conditions, evidence, gaps, and jobs.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1.5">
          <label className="sr-only" htmlFor="gs-q">Search query</label>
          <input id="gs-q" autoFocus className={cn(field, "flex-1 min-w-[14rem]")} placeholder="Search intake"
            value={query} onChange={(e) => setQuery(e.target.value)} />
          <label className="sr-only" htmlFor="gs-type">Result type</label>
          <select id="gs-type" className={cn(field, "w-44")} value={type} onChange={(e) => setType(e.target.value)}>
            {["All", ...types].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-1">
          {searchExamples.map((e) => (
            <button key={e} type="button" onClick={() => setQuery(e)}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] text-slate-600 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              {e}
            </button>
          ))}
        </div>
        <div className="max-h-72 overflow-auto rounded-lg border border-slate-200">
          {results.length === 0 ? (
            <p className="py-8 text-center text-[12px] text-slate-500">No matching intake records.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {results.map((r) => (
                <li key={`${r.resultType}-${r.id}`}>
                  <button type="button" onClick={() => { onSelect(r); onOpenChange(false); }}
                    className="w-full px-2 py-1.5 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <Pill label={r.resultType} tone="slate" />
                      <span className="text-[11.5px] font-medium text-slate-800">{r.title}</span>
                    </span>
                    <span className="mt-0.5 block text-[10.5px] text-slate-500">
                      {r.team} · {r.workType} · {r.stage} · {r.status} · context {r.contextMatch} · evidence {r.evidenceCoverage}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------------------------- governed export */

export function ExportDialog({
  open, onOpenChange, rows, onExported,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; rows: CognitiveIntake[];
  onExported: (format: string, scope: string) => void;
}) {
  const [format, setFormat] = useState<ExportFormat>("CSV");
  const [scope, setScope] = useState(exportScopes[2]);
  const [sections, setSections] = useState<string[]>(exportOptions.slice(0, 8));
  const [includeProvenance, setIncludeProvenance] = useState(true);

  const source = rows.length ? rows : intakes;
  const preview = useMemo(() => {
    const data = buildExportRows(source).slice(0, 5);
    if (format === "CSV") return toCsv(data);
    if (format === "YAML") return toYaml(data);
    if (format === "JSON") return JSON.stringify(data, null, 2);
    return `Cognitive Intake ${format}\nScope: ${scope}\nSections: ${sections.join(", ")}\nRecords: ${source.length}`;
  }, [format, scope, sections, source]);

  const download = () => {
    const data = buildExportRows(source);
    const body = format === "CSV" ? toCsv(data)
      : format === "YAML" ? toYaml(data)
        : format === "JSON" ? JSON.stringify(data, null, 2)
          : preview;
    const ext = format === "CSV" ? "csv" : format === "YAML" ? "yaml" : format === "JSON" ? "json" : "txt";
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cognitive-intake-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    onExported(format, scope);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Governed Export</DialogTitle>
          <DialogDescription>
            Exports respect access classification and carry provenance so downstream consumers can
            trace every value back to its source.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field id="ex-format" title="Format">
            <select id="ex-format" className={field} value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
              {exportFormats.map((f) => <option key={f}>{f}</option>)}
            </select>
          </Field>
          <Field id="ex-scope" title="Scope">
            <select id="ex-scope" className={field} value={scope} onChange={(e) => setScope(e.target.value)}>
              {exportScopes.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <CheckList title="Sections" options={exportOptions} value={sections} onChange={setSections} columns={3} />
        <label className="flex items-center gap-1.5 text-[11.5px] text-slate-700">
          <input type="checkbox" checked={includeProvenance} onChange={() => setIncludeProvenance(!includeProvenance)} />
          Include provenance and audit references
        </label>
        <pre className="max-h-40 overflow-auto rounded-lg bg-slate-900 p-2 text-[10.5px] text-slate-100">{preview}</pre>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={download}>Export {source.length} Record(s)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------- demo scenarios --- */

export function ScenarioDialog({
  open, onOpenChange, activeId, onApply, onReset,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; activeId: string;
  onApply: (s: ScenarioDefinition) => void; onReset: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Demo Scenarios</DialogTitle>
          <DialogDescription>
            Each scenario drives real page state — service state, intake status, operational state,
            activity, and notifications all update deterministically.
          </DialogDescription>
        </DialogHeader>
        <ul className="max-h-80 space-y-1 overflow-auto">
          {demoScenarios.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => { onApply(s); onOpenChange(false); }}
                className={cn("w-full rounded-lg border p-2 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  activeId === s.id ? "border-blue-300 bg-blue-50/50" : "border-slate-200")}>
                <span className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-[11.5px] font-semibold text-slate-800">{s.label}</span>
                  <Pill label={s.operationalState} tone={intakeTone(s.operationalState)} />
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-600">{s.description}</span>
              </button>
            </li>
          ))}
        </ul>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" onClick={() => { onReset(); onOpenChange(false); }}>Reset to Baseline</Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
