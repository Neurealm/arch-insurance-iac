import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Drawer, Pill, Row } from "../pipeline/panels";
import { SimpleTable, StatusText, download, nf, toCsv, toYaml } from "./panels";
import {
  canonicalEntities, exceptions as seedExceptions, schemaComparison, schemaTestResult, schemas,
  searchCatalog, type CanonicalArtifact, type NormalizationException, type NormalizationJob,
} from "./data";

/* ------------------------------ confirm ------------------------------------ */

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, requireReason, onConfirm }: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string; description: string;
  confirmLabel: string; requireReason?: boolean; onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  useEffect(() => { if (open) setReason(""); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{title}</DialogTitle>
          <DialogDescription className="text-[12px]">{description}</DialogDescription>
        </DialogHeader>
        {requireReason && (
          <div className="space-y-1">
            <Label htmlFor="confirm-reason" className="text-[11.5px]">Reason (required)</Label>
            <Textarea id="confirm-reason" value={reason} onChange={(e) => setReason(e.target.value)}
              className="text-[11.5px]" placeholder="Record why this action is being taken" />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-7 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11.5px]" disabled={requireReason && !reason.trim()}
            onClick={() => { onConfirm(reason); onOpenChange(false); }}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------- start normalization ---------------------------- */

const SCOPES = ["All Qualified Artifacts", "Selected Batches", "Selected Sources", "Selected Artifact Types",
  "Selected Teams", "Selected Knowledge Domains", "Selected Artifacts"];
const SCHEMA_MODES = ["Automatic Schema Selection", "Specific Canonical Schema", "Schema by Artifact Type", "Draft Schema for Testing"];
const PROCESSING = ["Parse content", "Detect structure", "Extract metadata", "Resolve entities", "Map relationships",
  "Preserve permissions", "Create contextual chunks", "Generate embeddings metadata placeholder",
  "Validate schema", "Publish canonical representation"];
const EXEC_STEPS = ["Loading Evidence", "Parsing Content", "Detecting Structure", "Normalizing Metadata",
  "Resolving Entities", "Preserving Access Context", "Creating Contextual Chunks",
  "Validating Representation", "Publishing Canonical Models", "Completed"];

export function StartNormalizationDialog({ open, onOpenChange, onComplete, onProceed, onOpenJob }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onComplete: (summary: { artifacts: number; records: number; schema: string; scope: string }) => void;
  onProceed: () => void; onOpenJob: () => void;
}) {
  const [step, setStep] = useState(1);
  const [scope, setScope] = useState(SCOPES[0]);
  const [schemaMode, setSchemaMode] = useState(SCHEMA_MODES[0]);
  const [schemaId, setSchemaId] = useState(schemas[0].id);
  const [options, setOptions] = useState<string[]>(PROCESSING.filter((p) => p !== "Generate embeddings metadata placeholder"));
  const [quality, setQuality] = useState({ structure: "85", metadata: "90", entity: "85", chunk: "80", compliance: "95", review: "85", auto: "95" });
  const [capacity, setCapacity] = useState({ priority: "Normal", concurrency: "8", batch: "5000", duration: "60", queue: "100000", retry: "3 attempts with backoff" });
  const [exec, setExec] = useState(-1);
  const artifacts = scope === "All Qualified Artifacts" ? 148_620 : 42_180;

  useEffect(() => { if (open) { setStep(1); setExec(-1); } }, [open]);

  useEffect(() => {
    if (step !== 7 || exec < 0 || exec >= EXEC_STEPS.length - 1) return;
    const t = setTimeout(() => setExec((e) => e + 1), 520);
    return () => clearTimeout(t);
  }, [step, exec]);

  const done = exec === EXEC_STEPS.length - 1;
  const records = artifacts * 9;
  const schemaName = `${schemas.find((s) => s.id === schemaId)?.name} ${schemas.find((s) => s.id === schemaId)?.version}`;

  const start = () => { setStep(7); setExec(0); };

  useEffect(() => {
    if (done) onComplete({ artifacts, records, schema: schemaName, scope });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Start Normalization</DialogTitle>
          <DialogDescription className="text-[12px]">
            Step {Math.min(step, 7)} of 7 — approved original artifacts are read, never modified.
          </DialogDescription>
        </DialogHeader>
        <Progress value={(Math.min(step, 7) / 7) * 100} className="h-1.5" aria-label="Wizard progress" />

        {step === 1 && (
          <div className="space-y-2">
            <p className="text-[12px] font-medium text-slate-800">Select scope</p>
            <RadioGroup value={scope} onValueChange={setScope} className="gap-1.5">
              {SCOPES.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <RadioGroupItem value={s} id={`scope-${s}`} />
                  <Label htmlFor={`scope-${s}`} className="text-[11.5px] font-normal">{s}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <p className="text-[12px] font-medium text-slate-800">Select schema</p>
            <RadioGroup value={schemaMode} onValueChange={setSchemaMode} className="gap-1.5">
              {SCHEMA_MODES.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <RadioGroupItem value={s} id={`sm-${s}`} />
                  <Label htmlFor={`sm-${s}`} className="text-[11.5px] font-normal">{s}</Label>
                </div>
              ))}
            </RadioGroup>
            <Select value={schemaId} onValueChange={setSchemaId}>
              <SelectTrigger className="h-7 text-[11.5px]" aria-label="Canonical schema"><SelectValue /></SelectTrigger>
              <SelectContent>
                {schemas.map((s) => <SelectItem key={s.id} value={s.id} className="text-[11.5px]">{s.name} {s.version}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-1.5">
            <p className="text-[12px] font-medium text-slate-800">Processing options</p>
            {PROCESSING.map((p) => (
              <label key={p} className="flex items-center gap-2 text-[11.5px]">
                <Checkbox checked={options.includes(p)}
                  onCheckedChange={(v) => setOptions((o) => (v ? [...o, p] : o.filter((x) => x !== p)))} />
                {p}
              </label>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {([["structure", "Minimum structure confidence"], ["metadata", "Minimum metadata completeness"],
              ["entity", "Minimum entity confidence"], ["chunk", "Minimum chunk quality"],
              ["compliance", "Minimum schema compliance"], ["review", "Human-review threshold"],
              ["auto", "Auto-approval threshold"]] as const).map(([k, label]) => (
              <label key={k} className="flex flex-col gap-1">
                <span className="text-[11px] text-slate-600">{label}</span>
                <Input type="number" value={quality[k]} onChange={(e) => setQuality((q) => ({ ...q, [k]: e.target.value }))}
                  className="h-7 text-[11.5px]" aria-label={label} />
              </label>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-600">Priority</span>
              <Select value={capacity.priority} onValueChange={(v) => setCapacity((c) => ({ ...c, priority: v }))}>
                <SelectTrigger className="h-7 text-[11.5px]" aria-label="Priority"><SelectValue /></SelectTrigger>
                <SelectContent>{["Low", "Normal", "High", "Expedited"].map((p) => <SelectItem key={p} value={p} className="text-[11.5px]">{p}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            {([["concurrency", "Concurrency"], ["batch", "Batch size"], ["duration", "Maximum duration (minutes)"],
              ["queue", "Queue limit"], ["retry", "Retry policy"]] as const).map(([k, label]) => (
              <label key={k} className="flex flex-col gap-1">
                <span className="text-[11px] text-slate-600">{label}</span>
                <Input value={capacity[k]} onChange={(e) => setCapacity((c) => ({ ...c, [k]: e.target.value }))}
                  className="h-7 text-[11.5px]" aria-label={label} />
              </label>
            ))}
          </div>
        )}

        {step === 6 && (
          <dl>
            <Row label="Artifacts selected" value={nf(artifacts)} />
            <Row label="Schema versions" value={schemaMode === "Automatic Schema Selection" ? "Automatic per artifact type" : schemaName} />
            <Row label="Estimated canonical records" value={nf(records)} />
            <Row label="Estimated duration" value="18 minutes" />
            <Row label="Potential schema conflicts" value="2 (vendor extensions on API definitions)" />
            <Row label="Potential entity conflicts" value="274" />
            <Row label="Potential review volume" value="318 artifacts" />
            <Row label="Processing options" value={`${options.length} of ${PROCESSING.length} enabled`} />
          </dl>
        )}

        {step === 7 && (
          <div className="space-y-2">
            <ol className="space-y-1">
              {EXEC_STEPS.map((s, i) => (
                <li key={s} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1.5 text-[11.5px]">
                  <span className={cn(i <= exec ? "text-slate-800" : "text-slate-400")}>{s}</span>
                  <StatusText status={i < exec ? "Completed" : i === exec ? (done ? "Completed" : "Running") : "Pending"} />
                </li>
              ))}
            </ol>
            <p aria-live="polite" className="text-[11.5px] text-slate-600">
              {done ? "Normalization completed." : `${EXEC_STEPS[Math.max(0, exec)]} in progress.`}
            </p>
            {done && (
              <dl className="rounded-lg border border-slate-200 bg-slate-50/60 p-2">
                <Row label="Artifacts normalized" value={nf(artifacts)} />
                <Row label="Canonical records produced" value={nf(records)} />
                <Row label="Entities resolved" value={nf(Math.round(artifacts * 1.6))} />
                <Row label="Relationships created" value={nf(Math.round(artifacts * 2.7))} />
                <Row label="Chunks produced" value={nf(Math.round(artifacts * 5.2))} />
                <Row label="Permission records preserved" value={nf(artifacts)} />
                <Row label="Human reviews created" value={nf(Math.round(artifacts * 0.002))} />
                <Row label="Failures" value="0" />
              </dl>
            )}
          </div>
        )}

        <DialogFooter className="flex-wrap gap-1.5">
          {step > 1 && step < 7 && (
            <Button variant="outline" size="sm" className="h-7 text-[11.5px]" onClick={() => setStep((s) => s - 1)}>Back</Button>
          )}
          {step < 6 && <Button size="sm" className="h-7 text-[11.5px]" onClick={() => setStep((s) => s + 1)}>Next</Button>}
          {step === 6 && <Button size="sm" className="h-7 text-[11.5px]" onClick={start}>Start Normalization</Button>}
          {step === 7 && done && (
            <>
              <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => onOpenChange(false)}>View Results</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => { onOpenJob(); onOpenChange(false); }}>Open Job</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => { setStep(1); setExec(-1); }}>Run Another Normalization</Button>
              <Button size="sm" className="h-7 text-[11.5px]" onClick={() => { onProceed(); onOpenChange(false); }}>Proceed to Condition Extraction</Button>
              <Button size="sm" variant="ghost" className="h-7 text-[11.5px]" onClick={() => onOpenChange(false)}>Close</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- schema management ----------------------------- */

export function SchemaManagementDrawer({ open, onOpenChange, onAction, onCompare }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onAction: (action: string, schemaName: string) => void; onCompare: () => void;
}) {
  const [selected, setSelected] = useState(schemas[0].id);
  const [tested, setTested] = useState(false);
  const schema = schemas.find((s) => s.id === selected)!;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide title="Canonical Schema Management"
      description="Schemas define how each artifact family becomes a consistent, machine-readable representation.">
      <div className="flex gap-2">
        <ul className="w-56 shrink-0 space-y-1">
          {schemas.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => { setSelected(s.id); setTested(false); }}
                className={cn("w-full rounded border px-2 py-1.5 text-left text-[11.5px]",
                  selected === s.id ? "border-blue-500 bg-blue-50/70" : "border-slate-200 hover:bg-slate-50")}>
                <span className="block font-medium text-slate-800">{s.name}</span>
                <span className="text-[11px] text-slate-500">{s.version} · {s.status}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex-1">
          <dl>
            <Row label="Version" value={schema.version} />
            <Row label="Status" value={<StatusText status={schema.status} />} />
            <Row label="Artifact types" value={schema.artifactTypes.join(", ")} />
            <Row label="Required fields" value={schema.requiredFields.join(", ")} />
            <Row label="Optional fields" value={schema.optionalFields.join(", ")} />
            <Row label="Validation rules" value={schema.validationRules.join("; ")} />
            <Row label="Entity types" value={schema.entityTypes.join(", ")} />
            <Row label="Relationship types" value={schema.relationshipTypes.join(", ")} />
            <Row label="Permission behavior" value={schema.permissionBehavior} />
            <Row label="Chunking profile" value={schema.chunkingProfile} />
            <Row label="Owner" value={schema.owner} />
            <Row label="Last updated" value={schema.updatedAt} />
          </dl>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {["View Schema", "Edit Draft", "Clone", "Activate", "Deprecate", "Create New Schema"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => onAction(a, `${schema.name} ${schema.version}`)}>{a}</Button>
            ))}
            <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={onCompare}>Compare Versions</Button>
            <Button size="sm" className="h-6 px-2 text-[11px]" onClick={() => setTested(true)}>Test Against Sample</Button>
          </div>

          {tested && (
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2">
              <p className="text-[11.5px] font-medium text-slate-800">
                Test result — Payments API Reliability Requirements v3.2
              </p>
              <dl className="mt-1">
                <Row label="Fields populated" value={schemaTestResult.fieldsPopulated} />
                <Row label="Fields missing" value={schemaTestResult.fieldsMissing.join(", ")} />
                <Row label="Validation failures" value={schemaTestResult.validationFailures.join("; ")} />
                <Row label="Entity changes" value={schemaTestResult.entityChanges} />
                <Row label="Chunk changes" value={schemaTestResult.chunkChanges} />
                <Row label="Confidence change" value={schemaTestResult.confidenceChange} />
                <Row label="Backward compatibility" value={schemaTestResult.backwardCompatibility} />
              </dl>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

export function SchemaCompareDialog({ open, onOpenChange, onAction }: {
  open: boolean; onOpenChange: (v: boolean) => void; onAction: (action: string) => void;
}) {
  const c = schemaComparison;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Compare Schema Versions</DialogTitle>
          <DialogDescription className="text-[12px]">{c.from} compared with {c.to}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <section className="rounded-lg border border-slate-200 p-2">
            <p className="text-[11.5px] font-semibold text-slate-800">{c.from}</p>
            <p className="mt-1 text-[11px] text-slate-500">Current active version</p>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[11.5px] text-slate-600">
              {c.fieldsRemoved.map((f) => <li key={f}>{f} (removed in {c.to})</li>)}
            </ul>
          </section>
          <section className="rounded-lg border border-blue-200 bg-blue-50/50 p-2">
            <p className="text-[11.5px] font-semibold text-slate-800">{c.to}</p>
            <p className="mt-1 text-[11px] text-slate-500">Proposed version</p>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[11.5px] text-slate-600">
              {c.fieldsAdded.map((f) => <li key={f}>{f} (added)</li>)}
            </ul>
          </section>
        </div>
        <dl>
          <Row label="Validation changes" value={c.validationChanges.join("; ")} />
          <Row label="Entity type changes" value={c.entityTypeChanges.join("; ")} />
          <Row label="Relationship type changes" value={c.relationshipTypeChanges.join("; ")} />
          <Row label="Chunking changes" value={c.chunkingChanges.join("; ")} />
          <Row label="Permission changes" value={c.permissionChanges.join("; ")} />
          <Row label="Compatibility" value={c.compatibility} />
        </dl>
        <div>
          <p className="mb-1 text-[11.5px] font-medium text-slate-800">Sample artifact output differences</p>
          <SimpleTable headers={["Field", c.from, c.to]}
            rows={c.sampleDifferences.map((d) => [d.field, d.before, d.after])} empty="No differences." />
        </div>
        <DialogFooter className="flex-wrap gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => { onAction("Keep Current Version"); onOpenChange(false); }}>Keep Current Version</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => { onAction("Run Broader Test"); onOpenChange(false); }}>Run Broader Test</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => { onAction("Submit for Approval"); onOpenChange(false); }}>Submit for Approval</Button>
          <Button size="sm" className="h-7 text-[11.5px]" onClick={() => { onAction("Activate New Version"); onOpenChange(false); }}>Activate New Version</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------- reprocess --------------------------------- */

export function ReprocessDialog({ open, onOpenChange, target, onConfirm }: {
  open: boolean; onOpenChange: (v: boolean) => void; target: string;
  onConfirm: (mode: string, schema: string, reason: string) => void;
}) {
  const [mode, setMode] = useState("Create New Version");
  const [schemaId, setSchemaId] = useState(schemas[0].id);
  const [reason, setReason] = useState("");
  useEffect(() => { if (open) { setReason(""); setMode("Create New Version"); } }, [open]);
  const proposed = schemas.find((s) => s.id === schemaId)!;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Reprocess with New Schema</DialogTitle>
          <DialogDescription className="text-[12px]">
            {target} — historical normalized versions are preserved.
          </DialogDescription>
        </DialogHeader>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-600">Proposed schema</span>
          <Select value={schemaId} onValueChange={setSchemaId}>
            <SelectTrigger className="h-7 text-[11.5px]" aria-label="Proposed schema"><SelectValue /></SelectTrigger>
            <SelectContent>{schemas.map((s) => <SelectItem key={s.id} value={s.id} className="text-[11.5px]">{s.name} {s.version}</SelectItem>)}</SelectContent>
          </Select>
        </label>
        <dl>
          <Row label="Current schema" value="Document Canonical Model v3.3" />
          <Row label="Proposed schema" value={`${proposed.name} ${proposed.version}`} />
          <Row label="Current output count" value="1.42M canonical records" />
          <Row label="Expected output changes" value="+186K records, 3 new field groups" />
          <Row label="Potential breaking changes" value="legacy_section_map removed" />
          <Row label="Entity changes" value="+3 canonical entities, 1 alias registered" />
          <Row label="Chunk changes" value="31 chunks reduced to 26 with richer heading context" />
          <Row label="Permission changes" value="Approved consumers must be explicit" />
          <Row label="Downstream records affected" value="4,218 condition candidates, 12 personas" />
        </dl>
        <RadioGroup value={mode} onValueChange={setMode} className="gap-1.5">
          {["Create New Version", "Replace Draft Representation", "Reprocess Only Failed Fields", "Reprocess Full Artifact"].map((m) => (
            <div key={m} className="flex items-center gap-2">
              <RadioGroupItem value={m} id={`rp-${m}`} />
              <Label htmlFor={`rp-${m}`} className="text-[11.5px] font-normal">{m}</Label>
            </div>
          ))}
        </RadioGroup>
        <div className="space-y-1">
          <Label htmlFor="rp-reason" className="text-[11.5px]">Change reason (required)</Label>
          <Textarea id="rp-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="text-[11.5px]" />
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-7 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11.5px]" disabled={!reason.trim()}
            onClick={() => { onConfirm(mode, `${proposed.name} ${proposed.version}`, reason); onOpenChange(false); }}>
            Confirm Reprocess
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- pause / resume ------------------------------ */

const PAUSE_MODES = ["Pause New Jobs Only", "Pause Selected Artifact Types", "Pause Selected Schemas",
  "Drain Current Queue Before Pause", "Immediate Pause", "Maintenance Window"];

export function PauseProcessingDialog({ open, onOpenChange, paused, onPause, onResume }: {
  open: boolean; onOpenChange: (v: boolean) => void; paused: boolean;
  onPause: (mode: string, reason: string) => void; onResume: () => void;
}) {
  const [mode, setMode] = useState(PAUSE_MODES[0]);
  const [reason, setReason] = useState("");
  const [checks, setChecks] = useState<number>(-1);
  useEffect(() => { if (open) { setReason(""); setChecks(-1); } }, [open]);

  const healthChecks = ["Evidence vault reachable", "Schema registry validated", "Entity catalog synchronized", "Queue capacity available"];
  useEffect(() => {
    if (checks < 0 || checks >= healthChecks.length) return;
    const t = setTimeout(() => setChecks((c) => c + 1), 420);
    return () => clearTimeout(t);
  }, [checks, healthChecks.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{paused ? "Resume Processing" : "Pause Processing"}</DialogTitle>
          <DialogDescription className="text-[12px]">
            {paused
              ? "Health checks and schema validation run before normalization restarts."
              : "Queued artifacts remain preserved. Downstream stages will wait."}
          </DialogDescription>
        </DialogHeader>

        {paused ? (
          <div className="space-y-1">
            {healthChecks.map((h, i) => (
              <div key={h} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1.5 text-[11.5px]">
                <span>{h}</span>
                <StatusText status={checks > i ? "Completed" : checks === i ? "Running" : "Pending"} />
              </div>
            ))}
            <p aria-live="polite" className="text-[11.5px] text-slate-600">
              {checks >= healthChecks.length ? "All checks passed. Ready to resume." : checks < 0 ? "Run health checks to resume." : "Checks in progress."}
            </p>
          </div>
        ) : (
          <>
            <RadioGroup value={mode} onValueChange={setMode} className="gap-1.5">
              {PAUSE_MODES.map((m) => (
                <div key={m} className="flex items-center gap-2">
                  <RadioGroupItem value={m} id={`pm-${m}`} />
                  <Label htmlFor={`pm-${m}`} className="text-[11.5px] font-normal">{m}</Label>
                </div>
              ))}
            </RadioGroup>
            <dl>
              <Row label="Jobs affected" value="7 active jobs" />
              <Row label="Artifacts in flight" value="49,879" />
              <Row label="Review backlog impact" value="+318 pending reviews will age" />
              <Row label="Condition-extraction delay" value="Estimated 42 minutes" />
              <Row label="Persona freshness impact" value="12 personas will fall behind" />
            </dl>
            <div className="space-y-1">
              <Label htmlFor="pause-reason" className="text-[11.5px]">Reason (required)</Label>
              <Textarea id="pause-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="text-[11.5px]" />
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" className="h-7 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          {paused ? (
            checks < healthChecks.length
              ? <Button size="sm" className="h-7 text-[11.5px]" onClick={() => setChecks(0)} disabled={checks >= 0}>Run Health Checks</Button>
              : <Button size="sm" className="h-7 text-[11.5px]" onClick={() => { onResume(); onOpenChange(false); }}>Resume Processing</Button>
          ) : (
            <Button size="sm" className="h-7 text-[11.5px]" disabled={!reason.trim()}
              onClick={() => { onPause(mode, reason); onOpenChange(false); }}>Pause Processing</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- retry ----------------------------------- */

export function RetryDialog({ open, onOpenChange, source, onConfirm }: {
  open: boolean; onOpenChange: (v: boolean) => void; source: string; onConfirm: (mode: string) => void;
}) {
  const [mode, setMode] = useState("Retry Failed Fields");
  const modes = ["Retry Failed Fields", "Restart from Parse", "Restart from Structure Detection",
    "Restart from Entity Resolution", "Restart from Validation", "Full Reprocess"];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Retry and Reprocess</DialogTitle>
          <DialogDescription className="text-[12px]">Initiated from {source}.</DialogDescription>
        </DialogHeader>
        <dl>
          <Row label="Affected records" value="1,284" />
          <Row label="Failure reason" value="Schema validation failure on vendor extensions" />
          <Row label="Starting stage" value={mode} />
          <Row label="Attempt count" value="2 of 3" />
          <Row label="Schema version" value="API Canonical Model v2.6" />
          <Row label="Expected duration" value="6 minutes" />
          <Row label="Downstream impact" value="Identity condition extraction resumes on success" />
        </dl>
        <RadioGroup value={mode} onValueChange={setMode} className="gap-1.5">
          {modes.map((m) => (
            <div key={m} className="flex items-center gap-2">
              <RadioGroupItem value={m} id={`rt-${m}`} />
              <Label htmlFor={`rt-${m}`} className="text-[11.5px] font-normal">{m}</Label>
            </div>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-7 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11.5px]" onClick={() => { onConfirm(mode); onOpenChange(false); }}>Start Retry</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- export ---------------------------------- */

const EXPORT_SCOPES = ["Current View", "Selected Jobs", "Selected Artifacts", "Quality Metrics", "Schema Coverage",
  "Entity Resolution", "Chunking", "Exceptions", "Readiness Summary", "Full Normalization Report"];
const EXPORT_OPTIONS = ["Include canonical metadata", "Include entity mappings", "Include relationship mappings",
  "Include chunk metadata", "Include permissions", "Include provenance", "Include confidence scores"];

export function ExportDialog({ open, onOpenChange, buildRows, onExported }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  buildRows: (scope: string) => Record<string, unknown>[];
  onExported: (format: string, scope: string) => void;
}) {
  const [format, setFormat] = useState("CSV");
  const [scope, setScope] = useState(EXPORT_SCOPES[0]);
  const [options, setOptions] = useState<string[]>(EXPORT_OPTIONS.slice(0, 4));

  const run = () => {
    const rows = buildRows(scope);
    const stamp = "2026-08-06";
    if (format === "CSV") download(`artifact-normalization-${stamp}.csv`, toCsv(rows), "text/csv");
    else if (format === "JSON") download(`artifact-normalization-${stamp}.json`, JSON.stringify({ scope, options, rows }, null, 2), "application/json");
    else if (format === "YAML") download(`artifact-normalization-${stamp}.yaml`, toYaml({ scope, options, rows }), "text/yaml");
    else download(`artifact-normalization-${stamp}.txt`,
      `Artifact Normalization Report\nScope: ${scope}\nFormat: ${format}\nOptions: ${options.join(", ")}\nRecords: ${rows.length}\n`, "text/plain");
    onExported(format, scope);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Export Normalization Report</DialogTitle>
          <DialogDescription className="text-[12px]">Generated locally from the current demonstration data.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-600">Format</span>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="h-7 text-[11.5px]" aria-label="Export format"><SelectValue /></SelectTrigger>
              <SelectContent>{["CSV", "JSON", "YAML", "PDF Summary", "Presentation Snapshot"].map((f) => <SelectItem key={f} value={f} className="text-[11.5px]">{f}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-600">Scope</span>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="h-7 text-[11.5px]" aria-label="Export scope"><SelectValue /></SelectTrigger>
              <SelectContent>{EXPORT_SCOPES.map((s) => <SelectItem key={s} value={s} className="text-[11.5px]">{s}</SelectItem>)}</SelectContent>
            </Select>
          </label>
        </div>
        <div className="space-y-1">
          {EXPORT_OPTIONS.map((o) => (
            <label key={o} className="flex items-center gap-2 text-[11.5px]">
              <Checkbox checked={options.includes(o)}
                onCheckedChange={(v) => setOptions((s) => (v ? [...s, o] : s.filter((x) => x !== o)))} />
              {o}
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-7 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11.5px]" onClick={run}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- search ---------------------------------- */

const SEARCH_CATEGORIES = ["All", "Normalization Jobs", "Artifacts", "Canonical Records", "Entities",
  "Relationships", "Chunks", "Schemas", "Exceptions", "Human Reviews", "Evidence Records"];

const EXAMPLES = [
  "Payments artifacts below 90 percent confidence",
  "Unresolved team entities",
  "Meeting transcripts with structure warnings",
  "Restricted artifacts ready for condition extraction",
  "Schema validation failures",
  "Chunks referencing Identity Service",
];

export function SearchDialog({ open, onOpenChange, onSelect }: {
  open: boolean; onOpenChange: (v: boolean) => void; onSelect: (type: string, id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return searchCatalog.filter((r) => {
      const inCat = cat === "All" || r.type === cat.replace(/s$/, "") || r.type + "s" === cat || r.type === cat;
      if (!inCat) return false;
      if (!query) return true;
      if (query.includes("below 90")) return r.confidence < 90;
      if (query.includes("unresolved")) return r.status.includes("Pending") || r.status === "Conflict";
      if (query.includes("schema validation")) return r.title.toLowerCase().includes("schema validation");
      return [r.id, r.title, r.source, r.team, r.schema, r.status].some((v) => String(v).toLowerCase().includes(query));
    }).slice(0, 30);
  }, [q, cat]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Search Normalization</DialogTitle>
          <DialogDescription className="text-[12px]">Jobs, artifacts, canonical records, entities, relationships, chunks, schemas, exceptions, reviews, and evidence.</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="Search…" className="h-8 text-[12px]" aria-label="Search query" />
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="h-8 w-48 text-[11.5px]" aria-label="Search category"><SelectValue /></SelectTrigger>
            <SelectContent>{SEARCH_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="text-[11.5px]">{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-1">
          {EXAMPLES.map((e) => (
            <button key={e} type="button" onClick={() => setQ(e)}
              className="rounded border border-slate-200 px-1.5 py-0.5 text-[10.5px] text-slate-600 hover:bg-slate-50">{e}</button>
          ))}
        </div>
        <SimpleTable
          headers={["Type", "Title", "Source", "Team", "Schema", "Quality", "Confidence", "Status", "Action"]}
          rows={results.map((r) => [
            r.type, r.title, r.source, r.team, r.schema, r.quality || "—", r.confidence ? `${r.confidence}%` : "—",
            <StatusText key="s" status={r.status} />,
            <Button key="a" size="sm" variant="outline" className="h-6 px-2 text-[11px]"
              onClick={() => { onSelect(r.type, r.id); onOpenChange(false); }}>Open</Button>,
          ])}
          empty="No results."
        />
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- human review -------------------------------- */

export function HumanReviewDialog({ exception, open, onOpenChange, onDecision }: {
  exception: NormalizationException | null; open: boolean; onOpenChange: (v: boolean) => void;
  onDecision: (decision: string, correction: string, comments: string) => void;
}) {
  const [correction, setCorrection] = useState("");
  const [comments, setComments] = useState("");
  useEffect(() => {
    if (open && exception) { setCorrection(exception.candidateCorrections[0] ?? ""); setComments(""); }
  }, [open, exception]);
  if (!exception) return null;

  const overrides = ["Reject Representation", "Approve with Exception", "Escalate", "Mark Unknown"];
  const decide = (decision: string) => {
    if (overrides.includes(decision) && !comments.trim()) return;
    onDecision(decision, correction, comments);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Human Review — {exception.exceptionType}</DialogTitle>
          <DialogDescription className="text-[12px]">
            {exception.artifactTitle} · {exception.sourceName} · severity {exception.severity} · confidence {exception.confidence}%
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 lg:grid-cols-3">
          <section className="rounded-lg border border-slate-200 p-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Original evidence</p>
            <p className="mt-1 rounded bg-slate-50 p-2 font-mono text-[10.5px] text-slate-700">{exception.evidenceExcerpt}</p>
            <dl className="mt-1">
              <Row label="Artifact" value={exception.artifactId} />
              <Row label="Source" value={exception.sourceName} />
              <Row label="Owner" value={exception.owner} />
            </dl>
          </section>
          <section className="rounded-lg border border-slate-200 p-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Detected structure &amp; exception</p>
            <p className="mt-1 text-[11.5px] text-slate-700">{exception.description}</p>
            <dl className="mt-1">
              <Row label="Quality score" value={exception.qualityScore} />
              <Row label="Confidence" value={`${exception.confidence}%`} />
              <Row label="Age" value={exception.age} />
              <Row label="Due" value={exception.dueAt} />
            </dl>
          </section>
          <section className="rounded-lg border border-slate-200 p-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Normalized representation</p>
            <p className="mt-1 text-[11.5px] text-slate-700">Recommended: {exception.recommendedAction}</p>
            <p className="mt-1 text-[11.5px] text-slate-600">Affected downstream records: {exception.downstreamImpact}</p>
          </section>
        </div>

        <div className="space-y-1">
          <p className="text-[11.5px] font-medium text-slate-800">Candidate corrections</p>
          <RadioGroup value={correction} onValueChange={setCorrection} className="gap-1.5">
            {exception.candidateCorrections.map((c) => (
              <div key={c} className="flex items-center gap-2">
                <RadioGroupItem value={c} id={`cc-${c}`} />
                <Label htmlFor={`cc-${c}`} className="text-[11.5px] font-normal">{c}</Label>
              </div>
            ))}
          </RadioGroup>
          <Input value={correction} onChange={(e) => setCorrection(e.target.value)}
            className="h-7 text-[11.5px]" aria-label="Edit normalized value" placeholder="Edit normalized value" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="review-comments" className="text-[11.5px]">
            Review comments (required for overrides)
          </Label>
          <Textarea id="review-comments" value={comments} onChange={(e) => setComments(e.target.value)} className="text-[11.5px]" />
        </div>

        <DialogFooter className="flex-wrap gap-1.5">
          {["Accept Suggested Correction", "Select Canonical Entity", "Mark Unknown", "Request Source Augmentation",
            "Approve Representation", "Reject Representation", "Approve with Exception", "Escalate"].map((d) => (
            <Button key={d} size="sm" variant={d === "Accept Suggested Correction" ? "default" : "outline"}
              className="h-7 text-[11.5px]" onClick={() => decide(d)}
              disabled={overrides.includes(d) && !comments.trim()}>{d}</Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ notifications ------------------------------ */

export function EntityPickerDialog({ open, onOpenChange, onPick }: {
  open: boolean; onOpenChange: (v: boolean) => void; onPick: (name: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Select Canonical Entity</DialogTitle>
          <DialogDescription className="text-[12px]">Choose the canonical entity that source values should resolve to.</DialogDescription>
        </DialogHeader>
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {canonicalEntities.map((e) => (
            <li key={e.id}>
              <button type="button" onClick={() => { onPick(e.canonicalName); onOpenChange(false); }}
                className="w-full rounded border border-slate-200 px-2 py-1.5 text-left text-[11.5px] hover:bg-slate-50">
                <span className="font-medium text-slate-800">{e.canonicalName}</span>
                <span className="ml-1.5 text-slate-500">{e.entityType}</span>
                <span className="float-right"><Pill label={`${e.confidence}%`} tone={e.confidence >= 90 ? "green" : "amber"} /></span>
                <span className="block text-[11px] text-slate-500">Aliases: {e.aliases.join(", ")}</span>
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
