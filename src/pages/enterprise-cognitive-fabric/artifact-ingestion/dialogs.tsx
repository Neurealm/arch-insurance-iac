import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { Row } from "../pipeline/panels";
import { Metric, StatusText, download, nf, toCsv, SimpleTable } from "./panels";
import {
  artifacts, batches, exceptions, filterOptions, qualityMetrics, readiness, uploadFormats,
  type AccessClassification, type ArtifactRecord, type AuthorityLevel, type IngestionBatch,
} from "./data";

function Steps({ labels, current }: { labels: string[]; current: number }) {
  return (
    <ol className="mb-3 flex flex-wrap gap-1" aria-label="Wizard progress">
      {labels.map((l, i) => (
        <li key={l} className={cn(
          "rounded border px-1.5 py-0.5 text-[10.5px]",
          i === current ? "border-blue-500 bg-blue-50 font-medium text-blue-800"
            : i < current ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500",
        )} aria-current={i === current ? "step" : undefined}>{i + 1}. {l}</li>
      ))}
    </ol>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = `chk-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex items-center gap-2 py-0.5">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
      <Label htmlFor={id} className="text-[11.5px] font-normal text-slate-700">{label}</Label>
    </div>
  );
}

/* ---------------------------- start ingestion ------------------------------ */

const RUN_PHASES = [
  "Preparing", "Authenticating Sources", "Receiving Artifacts", "Capturing Originals", "Extracting Metadata",
  "Preserving Permissions", "Detecting Duplicates and Versions", "Validating", "Registering Evidence",
  "Queuing for Normalization", "Completed",
];

export function StartIngestionDialog({ open, onOpenChange, onComplete, onOpenBatch, onProceed }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onComplete: (result: { received: number; ready: number; duplicates: number; versions: number; permissionReviews: number; quarantined: number; failures: number; sourceName: string; method: string }) => IngestionBatch;
  onOpenBatch: (b: IngestionBatch) => void; onProceed: () => void;
}) {
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState("All Qualified Sources");
  const [selectedSources, setSelectedSources] = useState<string[]>(["Confluence Cloud", "Jira Engineering"]);
  const [method, setMethod] = useState("Incremental");
  const [content, setContent] = useState<Record<string, boolean>>({
    "Include historical versions": true, "Include attachments": true, "Include deleted artifacts metadata": false,
    "Include archived artifacts": false, "Include restricted artifacts subject to permission": false,
    "Capture source permissions": true, "Capture source comments": true, "Capture speaker and participant metadata": true,
  });
  const [validation, setValidation] = useState<Record<string, boolean>>({
    "Validate source identity": true, "Validate owner": true, "Validate permissions": true, "Validate classification": true,
    "Detect duplicates": true, "Detect versions": true, "Validate supported format": true, "Validate artifact readability": true,
  });
  const [priority, setPriority] = useState("Standard");
  const [concurrency, setConcurrency] = useState("24");
  const [batchSize, setBatchSize] = useState("5000");
  const [maxDuration, setMaxDuration] = useState("30");
  const [queueLimit, setQueueLimit] = useState("120000");
  const [retryPolicy, setRetryPolicy] = useState("3 attempts with backoff");
  const [phase, setPhase] = useState(-1);
  const [result, setResult] = useState<{ received: number; ready: number; duplicates: number; versions: number; permissionReviews: number; quarantined: number; failures: number } | null>(null);
  const [batch, setBatch] = useState<IngestionBatch | null>(null);

  const labels = ["Scope", "Method", "Content", "Validation", "Capacity", "Review", "Execute"];
  const estimated = scope === "All Qualified Sources" ? 148_420 : selectedSources.length * 42_100;

  const reset = () => { setStep(0); setPhase(-1); setResult(null); setBatch(null); };

  const run = () => {
    setStep(6); setPhase(0);
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setPhase(i);
      if (i >= RUN_PHASES.length - 1) {
        window.clearInterval(timer);
        const r = {
          received: estimated, ready: Math.round(estimated * 0.91), duplicates: Math.round(estimated * 0.012),
          versions: Math.round(estimated * 0.026), permissionReviews: Math.round(estimated * 0.003),
          quarantined: Math.round(estimated * 0.0008), failures: Math.round(estimated * 0.004),
        };
        setResult(r);
        const b = onComplete({ ...r, sourceName: scope === "All Qualified Sources" ? "All qualified sources" : selectedSources.join(", "), method });
        setBatch(b);
        toast.success(`Ingestion completed. ${nf(r.ready)} artifacts ready for normalization.`);
      }
    }, 420);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Start Ingestion</DialogTitle>
          <DialogDescription className="text-[12px]">Bring approved enterprise artifacts into the Fabric with evidence, permissions, and provenance preserved.</DialogDescription>
        </DialogHeader>
        <Steps labels={labels} current={step} />
        <div aria-live="polite" className="max-h-[52vh] overflow-y-auto pr-1">
          {step === 0 && (
            <div className="space-y-2">
              <RadioGroup value={scope} onValueChange={setScope} className="space-y-1">
                {["All Qualified Sources", "Selected Sources", "Selected Categories", "Selected Teams", "Selected Knowledge Domains", "Selected Registry Records"].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <RadioGroupItem value={s} id={`scope-${s}`} />
                    <Label htmlFor={`scope-${s}`} className="text-[11.5px] font-normal">{s}</Label>
                  </div>
                ))}
              </RadioGroup>
              {scope === "Selected Sources" && (
                <div className="rounded-lg border border-slate-200 p-2">
                  {filterOptions.sourcePlatform.filter((s) => s !== "All").map((s) => (
                    <CheckRow key={s} label={s} checked={selectedSources.includes(s)}
                      onChange={(v) => setSelectedSources((p) => (v ? [...p, s] : p.filter((x) => x !== s)))} />
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <RadioGroup value={method} onValueChange={setMethod} className="space-y-1">
              {["Incremental", "Streaming", "Scheduled Batch", "Historical Backfill", "Metadata Only", "Evidence Preservation Only"].map((m) => (
                <div key={m} className="flex items-center gap-2">
                  <RadioGroupItem value={m} id={`method-${m}`} />
                  <Label htmlFor={`method-${m}`} className="text-[11.5px] font-normal">{m}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {step === 2 && (
            <div className="rounded-lg border border-slate-200 p-2">
              {Object.keys(content).map((k) => (
                <CheckRow key={k} label={k} checked={content[k]} onChange={(v) => setContent((p) => ({ ...p, [k]: v }))} />
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="rounded-lg border border-slate-200 p-2">
              {Object.keys(validation).map((k) => (
                <CheckRow key={k} label={k} checked={validation[k]} onChange={(v) => setValidation((p) => ({ ...p, [k]: v }))} />
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-2 sm:grid-cols-2">
              <div><Label className="text-[11px]">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-8 text-[11.5px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Low", "Standard", "High", "Expedited"].map((p) => <SelectItem key={p} value={p} className="text-[11.5px]">{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="concurrency" className="text-[11px]">Concurrency</Label><Input id="concurrency" value={concurrency} onChange={(e) => setConcurrency(e.target.value)} className="h-8 text-[11.5px]" /></div>
              <div><Label htmlFor="batchsize" className="text-[11px]">Batch size</Label><Input id="batchsize" value={batchSize} onChange={(e) => setBatchSize(e.target.value)} className="h-8 text-[11.5px]" /></div>
              <div><Label htmlFor="maxdur" className="text-[11px]">Maximum duration (minutes)</Label><Input id="maxdur" value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)} className="h-8 text-[11.5px]" /></div>
              <div><Label htmlFor="queuelimit" className="text-[11px]">Queue limit</Label><Input id="queuelimit" value={queueLimit} onChange={(e) => setQueueLimit(e.target.value)} className="h-8 text-[11.5px]" /></div>
              <div><Label htmlFor="retry" className="text-[11px]">Retry policy</Label><Input id="retry" value={retryPolicy} onChange={(e) => setRetryPolicy(e.target.value)} className="h-8 text-[11.5px]" /></div>
            </div>
          )}

          {step === 5 && (
            <dl className="rounded-lg border border-slate-200 p-2">
              <Row label="Sources selected" value={scope === "All Qualified Sources" ? "All qualified sources (9)" : selectedSources.join(", ") || "None"} />
              <Row label="Ingestion method" value={method} />
              <Row label="Estimated artifacts" value={nf(estimated)} />
              <Row label="Estimated volume" value={`${(estimated * 0.0021).toFixed(1)} GB`} />
              <Row label="Estimated duration" value={`${Math.max(2, Math.round(estimated / 24_000))} minutes`} />
              <Row label="Potential warnings" value="Permission preservation latency, duplicate review backlog" />
              <Row label="Restricted content count" value={content["Include restricted artifacts subject to permission"] ? nf(Math.round(estimated * 0.14)) : "0 (excluded)"} />
            </dl>
          )}

          {step === 6 && (
            <div className="space-y-2">
              <Progress value={((phase + 1) / RUN_PHASES.length) * 100} aria-label="Ingestion progress" className="h-2" />
              <ol className="space-y-0.5">
                {RUN_PHASES.map((p, i) => (
                  <li key={p} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1 text-[11.5px]">
                    <span className="text-slate-700">{p}</span>
                    <StatusText status={i < phase ? "Completed" : i === phase ? "Running" : "Queued"} />
                  </li>
                ))}
              </ol>
              {result && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Metric label="Artifacts received" value={nf(result.received)} />
                  <Metric label="Artifacts ready" value={nf(result.ready)} tone="green" />
                  <Metric label="Duplicates identified" value={nf(result.duplicates)} tone="amber" />
                  <Metric label="Versions identified" value={nf(result.versions)} tone="blue" />
                  <Metric label="Permission reviews" value={nf(result.permissionReviews)} tone="amber" />
                  <Metric label="Quarantined" value={nf(result.quarantined)} tone="red" />
                  <Metric label="Failures" value={nf(result.failures)} tone="red" />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-1.5 sm:justify-between">
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[11.5px]" disabled={step === 0 || step === 6} onClick={() => setStep((s) => s - 1)}>Previous</Button>
            {step < 5 && <Button size="sm" className="h-7 text-[11.5px]" onClick={() => setStep((s) => s + 1)}>Next</Button>}
            {step === 5 && <Button size="sm" className="h-7 text-[11.5px]" onClick={run}>Execute Ingestion</Button>}
          </div>
          {result && (
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => { onOpenChange(false); reset(); }}>View Results</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11.5px]" disabled={!batch} onClick={() => { if (batch) { onOpenChange(false); onOpenBatch(batch); reset(); } }}>Open Batch</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => { onOpenChange(false); onProceed(); }}>Proceed to Normalization</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={reset}>Run Another Ingestion</Button>
              <Button size="sm" className="h-7 text-[11.5px]" onClick={() => { onOpenChange(false); reset(); }}>Close</Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- manual upload ------------------------------- */

export function UploadArtifactsDialog({ open, onOpenChange, onSubmit }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onSubmit: (payload: {
    files: string[]; sourceName: string; teamName: string; businessUnit: string; knowledgeDomain: string;
    owner: string; authorityLevel: AuthorityLevel; accessClassification: AccessClassification;
    artifactType: string; description: string; version: string; tags: string[]; reason: string; requiresReview: boolean;
  }) => void;
}) {
  const [files, setFiles] = useState<string[]>([]);
  const [sourceName, setSourceName] = useState("Manual Submission");
  const [teamName, setTeamName] = useState("Payments Platform");
  const [businessUnit, setBusinessUnit] = useState("Technology");
  const [knowledgeDomain, setKnowledgeDomain] = useState("Reliability");
  const [owner, setOwner] = useState("Jane Smith");
  const [authorityLevel, setAuthorityLevel] = useState<AuthorityLevel>("Supporting");
  const [accessClassification, setAccessClassification] = useState<AccessClassification>("Internal");
  const [artifactType, setArtifactType] = useState("Requirements Document");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1.0");
  const [effective, setEffective] = useState("2026-08-06");
  const [expiry, setExpiry] = useState("2027-08-06");
  const [tags, setTags] = useState("payments, reliability");
  const [reason, setReason] = useState("");
  const [dragging, setDragging] = useState(false);

  const sampleFiles = ["payments-runbook.pdf", "settlement-controls.docx", "reliability-scorecard.xlsx"];
  const invalid = files.length === 0 || !reason.trim();

  const validations = [
    { label: "Supported format", ok: files.every((f) => uploadFormats.some((x) => f.toLowerCase().endsWith(x.toLowerCase()))) || files.length > 0 },
    { label: "File size within 250 MB", ok: true },
    { label: "Duplicate detection", ok: true },
    { label: "Version detection", ok: Boolean(version.trim()) },
    { label: "Metadata completeness", ok: Boolean(teamName && owner && artifactType) },
    { label: "Permission declaration", ok: Boolean(owner) },
    { label: "Classification declaration", ok: Boolean(accessClassification) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Upload Artifacts</DialogTitle>
          <DialogDescription className="text-[12px]">Authorized manual submission. Originals are preserved unchanged and reviewed before normalization.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[56vh] space-y-3 overflow-y-auto pr-1">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); setFiles((p) => [...p, ...sampleFiles.slice(0, 2)]); }}
            className={cn("flex flex-col items-center gap-1 rounded-lg border-2 border-dashed p-4 text-center",
              dragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50")}
          >
            <UploadCloud className="h-5 w-5 text-slate-400" aria-hidden />
            <p className="text-[11.5px] text-slate-600">Drag and drop artifacts here, or add a simulated file for the demonstration.</p>
            <div className="flex gap-1.5">
              {sampleFiles.map((f) => (
                <Button key={f} size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => setFiles((p) => [...p, f])}>Add {f}</Button>
              ))}
            </div>
            <p className="text-[10.5px] text-slate-500">Accepted: {uploadFormats.join(", ")}</p>
          </div>

          {files.length > 0 && (
            <ul className="rounded-lg border border-slate-200 p-2">
              {files.map((f, i) => (
                <li key={`${f}-${i}`} className="flex items-center justify-between py-0.5 text-[11.5px] text-slate-700">
                  {f}
                  <Button size="sm" variant="ghost" className="h-5 px-1 text-[11px]" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}>Remove</Button>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-2 sm:grid-cols-3">
            <div><Label htmlFor="u-source" className="text-[11px]">Source or originating system</Label><Input id="u-source" value={sourceName} onChange={(e) => setSourceName(e.target.value)} className="h-8 text-[11.5px]" /></div>
            <div><Label className="text-[11px]">Team</Label>
              <Select value={teamName} onValueChange={setTeamName}><SelectTrigger className="h-8 text-[11.5px]"><SelectValue /></SelectTrigger>
                <SelectContent>{filterOptions.team.filter((t) => t !== "All").map((t) => <SelectItem key={t} value={t} className="text-[11.5px]">{t}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-[11px]">Business unit</Label>
              <Select value={businessUnit} onValueChange={setBusinessUnit}><SelectTrigger className="h-8 text-[11.5px]"><SelectValue /></SelectTrigger>
                <SelectContent>{filterOptions.businessUnit.filter((t) => t !== "All").map((t) => <SelectItem key={t} value={t} className="text-[11.5px]">{t}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-[11px]">Knowledge domain</Label>
              <Select value={knowledgeDomain} onValueChange={setKnowledgeDomain}><SelectTrigger className="h-8 text-[11.5px]"><SelectValue /></SelectTrigger>
                <SelectContent>{filterOptions.knowledgeDomain.filter((t) => t !== "All").map((t) => <SelectItem key={t} value={t} className="text-[11.5px]">{t}</SelectItem>)}</SelectContent></Select></div>
            <div><Label htmlFor="u-owner" className="text-[11px]">Owner</Label><Input id="u-owner" value={owner} onChange={(e) => setOwner(e.target.value)} className="h-8 text-[11.5px]" /></div>
            <div><Label className="text-[11px]">Authority level</Label>
              <Select value={authorityLevel} onValueChange={(v) => setAuthorityLevel(v as AuthorityLevel)}><SelectTrigger className="h-8 text-[11.5px]"><SelectValue /></SelectTrigger>
                <SelectContent>{["Primary", "Supporting", "Historical", "Unconfirmed"].map((t) => <SelectItem key={t} value={t} className="text-[11.5px]">{t}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-[11px]">Access classification</Label>
              <Select value={accessClassification} onValueChange={(v) => setAccessClassification(v as AccessClassification)}><SelectTrigger className="h-8 text-[11.5px]"><SelectValue /></SelectTrigger>
                <SelectContent>{["Public", "Internal", "Confidential", "Restricted", "Highly Restricted"].map((t) => <SelectItem key={t} value={t} className="text-[11.5px]">{t}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-[11px]">Artifact type</Label>
              <Select value={artifactType} onValueChange={setArtifactType}><SelectTrigger className="h-8 text-[11.5px]"><SelectValue /></SelectTrigger>
                <SelectContent>{filterOptions.artifactType.filter((t) => t !== "All").map((t) => <SelectItem key={t} value={t} className="text-[11.5px]">{t}</SelectItem>)}</SelectContent></Select></div>
            <div><Label htmlFor="u-version" className="text-[11px]">Version</Label><Input id="u-version" value={version} onChange={(e) => setVersion(e.target.value)} className="h-8 text-[11.5px]" /></div>
            <div><Label htmlFor="u-eff" className="text-[11px]">Effective date</Label><Input id="u-eff" type="date" value={effective} onChange={(e) => setEffective(e.target.value)} className="h-8 text-[11.5px]" /></div>
            <div><Label htmlFor="u-exp" className="text-[11px]">Expiration or review date</Label><Input id="u-exp" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="h-8 text-[11.5px]" /></div>
            <div><Label htmlFor="u-tags" className="text-[11px]">Tags</Label><Input id="u-tags" value={tags} onChange={(e) => setTags(e.target.value)} className="h-8 text-[11.5px]" /></div>
          </div>

          <div><Label htmlFor="u-desc" className="text-[11px]">Description</Label><Textarea id="u-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[52px] text-[11.5px]" /></div>
          <div><Label htmlFor="u-reason" className="text-[11px]">Reason for submission</Label><Textarea id="u-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[52px] text-[11.5px]" placeholder="Explain why this artifact should enter the Fabric" /></div>

          <div className="rounded-lg border border-slate-200 p-2">
            <p className="mb-1 text-[11px] font-semibold text-slate-700">Submission validation</p>
            <ul className="grid gap-0.5 sm:grid-cols-2">
              {validations.map((v) => (
                <li key={v.label} className="flex items-center justify-between text-[11.5px] text-slate-700">
                  {v.label}<StatusText status={v.ok ? "Passed" : "Review Required"} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11.5px]" disabled={invalid}
            onClick={() => {
              onSubmit({
                files, sourceName, teamName, businessUnit, knowledgeDomain, owner, authorityLevel,
                accessClassification, artifactType, description, version,
                tags: tags.split(",").map((t) => t.trim()).filter(Boolean), reason,
                requiresReview: authorityLevel === "Unconfirmed" || accessClassification === "Highly Restricted",
              });
              setFiles([]); setReason("");
              onOpenChange(false);
            }}>
            Submit {files.length || ""} Artifact{files.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------- pause intake ----------------------------- */

export function PauseIntakeDialog({ open, onOpenChange, paused, onConfirm, onResume }: {
  open: boolean; onOpenChange: (v: boolean) => void; paused: boolean;
  onConfirm: (opts: { mode: string; reason: string; drain: boolean }) => void; onResume: () => void;
}) {
  const [mode, setMode] = useState("Pause New Automated Intake");
  const [drain, setDrain] = useState(true);
  const [reason, setReason] = useState("");
  const [checks, setChecks] = useState<string[]>([]);

  const resume = () => {
    setChecks([]);
    const steps = ["Connector authentication", "Evidence vault availability", "Queue capacity", "Permission service"];
    steps.forEach((s, i) => window.setTimeout(() => {
      setChecks((p) => [...p, s]);
      if (i === steps.length - 1) { onResume(); onOpenChange(false); }
    }, (i + 1) * 350));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{paused ? "Resume Intake" : "Pause Intake"}</DialogTitle>
          <DialogDescription className="text-[12px]">
            {paused ? "Health checks run before intake restarts." : "Pausing intake stops new artifacts from entering the Fabric and delays downstream normalization."}
          </DialogDescription>
        </DialogHeader>

        {paused ? (
          <ol className="space-y-1" aria-live="polite">
            {["Connector authentication", "Evidence vault availability", "Queue capacity", "Permission service"].map((s) => (
              <li key={s} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1 text-[11.5px]">
                <span className="text-slate-700">{s}</span><StatusText status={checks.includes(s) ? "Passed" : "Queued"} />
              </li>
            ))}
          </ol>
        ) : (
          <div className="space-y-2">
            <RadioGroup value={mode} onValueChange={setMode} className="space-y-1">
              {["Pause New Automated Intake", "Pause Manual Uploads", "Pause Selected Sources", "Immediate Pause", "Maintenance Window"].map((m) => (
                <div key={m} className="flex items-center gap-2">
                  <RadioGroupItem value={m} id={`pause-${m}`} />
                  <Label htmlFor={`pause-${m}`} className="text-[11.5px] font-normal">{m}</Label>
                </div>
              ))}
            </RadioGroup>
            <CheckRow label="Drain current queue before pause" checked={drain} onChange={setDrain} />
            <dl className="rounded-lg border border-slate-200 p-2">
              <Row label="Active batches" value="18" />
              <Row label="Artifacts in flight" value={nf(42_318)} />
              <Row label="Expected queue growth" value="+6,400 per hour at the source" />
              <Row label="Sources affected" value="9 approved sources" />
              <Row label="Normalization delay" value="Approximately 1 hour per hour paused" />
              <Row label="Persona freshness impact" value="4 personas degrade after 6 hours" />
            </dl>
            <div>
              <Label htmlFor="pause-reason" className="text-[11px]">Reason (required)</Label>
              <Textarea id="pause-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[52px] text-[11.5px]" />
            </div>
          </div>
        )}

        <DialogFooter className="gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          {paused ? (
            <Button size="sm" className="h-7 text-[11.5px]" onClick={resume}>Run Health Checks and Resume</Button>
          ) : (
            <Button size="sm" className="h-7 text-[11.5px]" disabled={!reason.trim()}
              onClick={() => { onConfirm({ mode, reason, drain }); onOpenChange(false); }}>Confirm Pause</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------- retry and reprocess -------------------------- */

export function RetryDialog({ open, onOpenChange, context, onConfirm }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  context: { origin: string; label: string; affected: number; reason: string; retryable: boolean; attempts: number } | null;
  onConfirm: (mode: string) => void;
}) {
  const [mode, setMode] = useState("Retry");
  if (!context) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Retry and Reprocess</DialogTitle>
          <DialogDescription className="text-[12px]">{context.origin} · {context.label}</DialogDescription>
        </DialogHeader>
        <dl className="rounded-lg border border-slate-200 p-2">
          <Row label="Affected artifacts" value={nf(context.affected)} />
          <Row label="Failure reason" value={context.reason} />
          <Row label="Retryable" value={context.retryable ? "Yes" : "No, requires remediation first"} />
          <Row label="Starting stage" value={mode === "Retry" ? "Current stage" : mode.replace("Restart from ", "")} />
          <Row label="Attempt count" value={context.attempts} />
          <Row label="Expected duration" value={`${Math.max(1, Math.round(context.affected / 4000))} minutes`} />
          <Row label="Potential duplicate creation" value={mode === "Restart from Receive" ? "Possible. Duplicate detection will resolve." : "None expected"} />
          <Row label="Potential downstream delay" value="Normalization delayed until the retry completes" />
        </dl>
        <RadioGroup value={mode} onValueChange={setMode} className="space-y-1">
          {["Retry", "Restart from Receive", "Restart from Metadata", "Restart from Validation", "Reprocess with Updated Configuration"].map((m) => (
            <div key={m} className="flex items-center gap-2">
              <RadioGroupItem value={m} id={`retry-${m}`} />
              <Label htmlFor={`retry-${m}`} className="text-[11.5px] font-normal">{m}</Label>
            </div>
          ))}
        </RadioGroup>
        <DialogFooter className="gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11.5px]" disabled={!context.retryable} onClick={() => { onConfirm(mode); onOpenChange(false); }}>Start {mode}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------- export --------------------------------- */

export function ExportDialog({ open, onOpenChange, currentArtifacts, currentBatches, selectedArtifactIds, selectedBatchIds }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  currentArtifacts: ArtifactRecord[]; currentBatches: IngestionBatch[];
  selectedArtifactIds: string[]; selectedBatchIds: string[];
}) {
  const [format, setFormat] = useState("CSV");
  const [scope, setScope] = useState("Current View");
  const [options, setOptions] = useState<Record<string, boolean>>({
    "Include metadata": true, "Include provenance": true, "Include classifications": true,
    "Include duplicate results": true, "Include version results": true, "Include exceptions": true,
    "Include downstream impact": false,
  });

  const rows = useMemo(() => {
    switch (scope) {
      case "Selected Batches": return currentBatches.filter((b) => selectedBatchIds.includes(b.id)).map((b) => ({ ...b }));
      case "Selected Artifacts": return currentArtifacts.filter((a) => selectedArtifactIds.includes(a.id)).map((a) => ({ ...a }));
      case "Exceptions": return exceptions.map((e) => ({ ...e }));
      case "Quarantine": return exceptions.filter((e) => e.status === "Quarantined").map((e) => ({ ...e }));
      case "Quality Metrics": return qualityMetrics.map((m) => ({ ...m, trend: m.trend.join(" ") }));
      case "Readiness Summary": return [readiness as unknown as Record<string, unknown>];
      case "Full Ingestion Report": return [...currentBatches.map((b) => ({ record: "batch", ...b })), ...currentArtifacts.map((a) => ({ record: "artifact", ...a }))];
      default: return currentArtifacts.map((a) => ({ ...a }));
    }
  }, [scope, currentArtifacts, currentBatches, selectedArtifactIds, selectedBatchIds]);

  const run = () => {
    const stamp = "2026-08-06";
    if (format === "CSV") download(`artifact-ingestion-${scope.toLowerCase().replace(/\s+/g, "-")}-${stamp}.csv`, toCsv(rows as Record<string, unknown>[]), "text/csv");
    else if (format === "JSON") download(`artifact-ingestion-${scope.toLowerCase().replace(/\s+/g, "-")}-${stamp}.json`, JSON.stringify({ scope, options, rows }, null, 2), "application/json");
    else download(`artifact-ingestion-${format.toLowerCase().replace(/\s+/g, "-")}-${stamp}.txt`,
      `Artifact Ingestion ${format}\nScope: ${scope}\nRecords: ${rows.length}\nGenerated: ${stamp}\n\n${Object.entries(options).filter(([, v]) => v).map(([k]) => `- ${k}`).join("\n")}`,
      "text/plain");
    toast.success(`${format} export generated for ${rows.length} records.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Export Ingestion Report</DialogTitle>
          <DialogDescription className="text-[12px]">Generated locally from the current demonstration data.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <div><Label className="text-[11px]">Format</Label>
            <Select value={format} onValueChange={setFormat}><SelectTrigger className="h-8 text-[11.5px]"><SelectValue /></SelectTrigger>
              <SelectContent>{["CSV", "JSON", "PDF Summary", "Presentation Snapshot"].map((f) => <SelectItem key={f} value={f} className="text-[11.5px]">{f}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-[11px]">Scope</Label>
            <Select value={scope} onValueChange={setScope}><SelectTrigger className="h-8 text-[11.5px]"><SelectValue /></SelectTrigger>
              <SelectContent>{["Current View", "Selected Batches", "Selected Artifacts", "Exceptions", "Quarantine", "Quality Metrics", "Readiness Summary", "Full Ingestion Report"].map((f) => <SelectItem key={f} value={f} className="text-[11.5px]">{f}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div className="rounded-lg border border-slate-200 p-2">
          {Object.keys(options).map((k) => <CheckRow key={k} label={k} checked={options[k]} onChange={(v) => setOptions((p) => ({ ...p, [k]: v }))} />)}
        </div>
        <p className="text-[11px] text-slate-500">{rows.length} records will be exported.</p>
        <DialogFooter className="gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11.5px]" onClick={run}>Generate Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------- global search ----------------------------- */

export function SearchDialog({ open, onOpenChange, catalog, onOpenResult }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  catalog: { id: string; type: string; title: string; source: string; team: string; status: string; owner: string; validationScore: number | null }[];
  onOpenResult: (id: string, type: string) => void;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const examples = [
    "Restricted PDF artifacts", "Possible duplicates for Payments", "Artifacts awaiting normalization",
    "Meeting transcripts with missing owners", "Corrupted spreadsheets", "Versions received today",
  ];
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return catalog.filter((r) => (type === "All" || r.type === type) &&
      (!t || `${r.id} ${r.title} ${r.source} ${r.team} ${r.status} ${r.owner}`.toLowerCase().includes(t))).slice(0, 24);
  }, [catalog, q, type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Search Ingestion</DialogTitle>
          <DialogDescription className="text-[12px]">Artifacts, batches, sources, teams, owners, formats, duplicates, versions, evidence records, exceptions, and quarantine records.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1.5">
          <Input value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="Search" aria-label="Search ingestion" className="h-8 flex-1 text-[11.5px]" />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 w-44 text-[11.5px]" aria-label="Result type"><SelectValue /></SelectTrigger>
            <SelectContent>{["All", "Artifact", "Batch", "Duplicate", "Version", "Evidence Record", "Exception", "Quarantine Record"].map((t) => <SelectItem key={t} value={t} className="text-[11.5px]">{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-1">
          {examples.map((e) => (
            <Button key={e} size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => setQ(e.split(" ")[0])}>{e}</Button>
          ))}
        </div>
        <div className="max-h-[46vh] overflow-y-auto">
          <SimpleTable
            headers={["Type", "Title", "Source", "Team", "Status", "Owner", "Validation", ""]}
            rows={results.map((r) => [r.type, r.title, r.source, r.team, <StatusText key={r.id} status={r.status} />, r.owner,
              r.validationScore ?? "—",
              <Button key={`${r.id}-a`} size="sm" variant="ghost" className="h-5 px-1 text-[11px]" onClick={() => { onOpenResult(r.id, r.type); onOpenChange(false); }}>Open</Button>])}
            empty="No results match this search."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------- generic confirm dialog ----------------------- */

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, onConfirm, requireReason }: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string; description: string;
  confirmLabel: string; onConfirm: (reason: string) => void; requireReason?: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{title}</DialogTitle>
          <DialogDescription className="text-[12px]">{description}</DialogDescription>
        </DialogHeader>
        {requireReason && (
          <div>
            <Label htmlFor="confirm-reason" className="text-[11px]">Reason</Label>
            <Textarea id="confirm-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[52px] text-[11.5px]" />
          </div>
        )}
        <DialogFooter className="gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11.5px]" disabled={requireReason && !reason.trim()}
            onClick={() => { onConfirm(reason); setReason(""); onOpenChange(false); }}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
