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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { download, runsToCsv } from "./panels";
import { stages, type PipelineRun, type PipelineStage, type StageId } from "./data";

function ChoiceGrid({ options, value, onChange, cols = 3 }: { options: readonly string[]; value: string; onChange: (v: string) => void; cols?: number }) {
  return (
    <div className={cn("grid gap-1.5", cols === 2 ? "sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3")}>
      {options.map((o) => (
        <button
          key={o} type="button" onClick={() => onChange(o)} aria-pressed={value === o}
          className={cn(
            "rounded-md border px-2.5 py-2 text-left text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            value === o ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-700 hover:bg-slate-50",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------- Pause Pipeline ------------------------------ */

const PAUSE_MODES = [
  "Pause New Intake Only",
  "Pause Selected Stages",
  "Pause Entire Pipeline",
  "Drain Current Work Before Pause",
  "Immediate Pause",
];

export function PausePipelineDialog({ open, onOpenChange, activeRuns, artifactsInFlight, stageList, onConfirm }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  activeRuns: number;
  artifactsInFlight: string;
  stageList: PipelineStage[];
  onConfirm: (mode: string, stageIds: StageId[], reason: string) => void;
}) {
  const [mode, setMode] = useState(PAUSE_MODES[0]);
  const [selectedStages, setSelectedStages] = useState<StageId[]>([]);
  const [reason, setReason] = useState("");

  useEffect(() => { if (!open) { setMode(PAUSE_MODES[0]); setSelectedStages([]); setReason(""); } }, [open]);

  const affected = mode === "Pause Selected Stages" ? selectedStages.length : stageList.length;
  const valid = reason.trim().length > 0 && (mode !== "Pause Selected Stages" || selectedStages.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Pause Pipeline</DialogTitle>
          <DialogDescription className="text-[12px]">Pausing holds work in place. Queued artifacts are preserved.</DialogDescription>
        </DialogHeader>

        <dl className="grid gap-x-6 sm:grid-cols-2 text-[12px]">
          {([
            ["Current active runs", String(activeRuns)],
            ["Artifacts in flight", artifactsInFlight],
            ["Affected stages", String(affected)],
            ["Estimated queue growth", "+38K artifacts per hour"],
            ["Downstream impact", "Publishing and persona updates deferred"],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-slate-100 py-1">
              <dt className="text-[11px] text-slate-500">{k}</dt>
              <dd className="text-[11.5px] font-medium text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>

        <div>
          <div className="mb-1 text-[11px] font-medium text-slate-600">Pause mode</div>
          <ChoiceGrid options={PAUSE_MODES} value={mode} onChange={setMode} cols={2} />
        </div>

        {mode === "Pause Selected Stages" && (
          <div className="grid gap-1 sm:grid-cols-2">
            {stageList.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-[12px] text-slate-700">
                <Checkbox
                  checked={selectedStages.includes(s.id)} aria-label={s.name}
                  onCheckedChange={(v) => setSelectedStages((cur) => (v ? [...cur, s.id] : cur.filter((x) => x !== s.id)))}
                  className="h-3.5 w-3.5"
                />
                {s.name}
              </label>
            ))}
          </div>
        )}

        <ul className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">
          <li>SLA impact: validation and publishing SLAs will be missed while paused.</li>
          <li>Queue growth: intake queues continue to accumulate unless intake is paused.</li>
          <li>Publishing delay: Cognitive Memory writes stop until the pipeline resumes.</li>
          <li>Persona update delay: Team Persona refresh is deferred.</li>
        </ul>

        <div className="grid gap-1">
          <Label htmlFor="pause-reason" className="text-[11px] text-slate-600">Pause reason (required)</Label>
          <Textarea id="pause-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[56px] text-[12px]" />
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            size="sm" className="h-8 text-[12px]" disabled={!valid}
            onClick={() => { onConfirm(mode, mode === "Pause Selected Stages" ? selectedStages : stageList.map((s) => s.id), reason); onOpenChange(false); }}
          >
            Confirm Pause
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Run Backfill ------------------------------ */

const SCOPES = ["All Sources", "Selected Categories", "Selected Sources", "Selected Teams", "Selected Knowledge Domains"];
const RANGES = ["Last 24 hours", "Last 7 days", "Last 30 days", "Custom date range", "Full Historical"];
const OPTION_LIST = [
  "Reprocess successful artifacts", "Retry failed artifacts", "Include archived content",
  "Include restricted content subject to permissions", "Recalculate metadata",
  "Rebuild embeddings", "Rebuild Context Graph relationships", "Update Team Personas",
];
const PROGRESS_STEPS = ["Preparing", "Loading artifacts", "Processing", "Validating", "Publishing", "Completed"];

export interface BackfillResult {
  processed: number; corrected: number; failuresResolved: number;
  warningsRemaining: number; personaUpdates: number; graphUpdates: number;
}

export function RunBackfillDialog({ open, onOpenChange, onComplete }: {
  open: boolean; onOpenChange: (v: boolean) => void; onComplete: (result: BackfillResult) => void;
}) {
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState(SCOPES[0]);
  const [range, setRange] = useState(RANGES[1]);
  const [startStage, setStartStage] = useState<StageId>("parse");
  const [options, setOptions] = useState<string[]>(["Retry failed artifacts", "Recalculate metadata"]);
  const [concurrency, setConcurrency] = useState("Standard");
  const [priority, setPriority] = useState("Normal");
  const [progressStep, setProgressStep] = useState(-1);

  useEffect(() => {
    if (!open) { setStep(0); setProgressStep(-1); setScope(SCOPES[0]); setRange(RANGES[1]); setStartStage("parse"); }
  }, [open]);

  useEffect(() => {
    if (progressStep < 0 || progressStep >= PROGRESS_STEPS.length - 1) return;
    const t = window.setTimeout(() => setProgressStep((p) => p + 1), 550);
    return () => window.clearTimeout(t);
  }, [progressStep]);

  const estimate = useMemo(() => {
    const rangeFactor = range === "Last 24 hours" ? 1 : range === "Last 7 days" ? 6 : range === "Last 30 days" ? 22 : 64;
    const stageFactor = 8 - stages.find((s) => s.id === startStage)!.sequence;
    return {
      artifacts: 42_000 * rangeFactor,
      duration: `${Math.round(6 * rangeFactor * (stageFactor / 4))} min`,
      compute: `${Math.round(18 * rangeFactor * (stageFactor / 4))} worker hours`,
    };
  }, [range, startStage]);

  const result: BackfillResult = useMemo(() => ({
    processed: estimate.artifacts,
    corrected: Math.round(estimate.artifacts * 0.07),
    failuresResolved: Math.round(estimate.artifacts * 0.012),
    warningsRemaining: Math.round(estimate.artifacts * 0.004),
    personaUpdates: options.includes("Update Team Personas") ? 12 : 3,
    graphUpdates: options.includes("Rebuild Context Graph relationships") ? 26 : 7,
  }), [estimate, options]);

  const titles = ["Select Sources", "Select Time Range", "Starting Stage", "Options", "Capacity", "Review", "Execute"];
  const nf = (n: number) => n.toLocaleString("en-US");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Run Backfill — Step {step + 1} of 7: {titles[step]}</DialogTitle>
          <DialogDescription className="text-[12px]">Reprocess historical artifacts through the discovery lifecycle.</DialogDescription>
        </DialogHeader>
        <Progress value={((step + 1) / 7) * 100} className="h-1.5" />

        <div className="space-y-3 py-1 text-[12.5px]">
          {step === 0 && <ChoiceGrid options={SCOPES} value={scope} onChange={setScope} cols={2} />}
          {step === 1 && (
            <>
              <ChoiceGrid options={RANGES} value={range} onChange={setRange} cols={2} />
              {range === "Custom date range" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-1"><Label htmlFor="bf-from" className="text-[11px] text-slate-600">From</Label><Input id="bf-from" type="date" defaultValue="2025-04-13" className="h-8 text-[12px]" /></div>
                  <div className="grid gap-1"><Label htmlFor="bf-to" className="text-[11px] text-slate-600">To</Label><Input id="bf-to" type="date" defaultValue="2025-05-13" className="h-8 text-[12px]" /></div>
                </div>
              )}
            </>
          )}
          {step === 2 && (
            <ChoiceGrid
              options={stages.map((s) => s.name)}
              value={stages.find((s) => s.id === startStage)!.name}
              onChange={(v) => setStartStage(stages.find((s) => s.name === v)!.id)}
            />
          )}
          {step === 3 && (
            <div className="grid gap-1 sm:grid-cols-2">
              {OPTION_LIST.map((o) => (
                <label key={o} className="flex items-start gap-2 text-[12px] text-slate-700">
                  <Checkbox
                    checked={options.includes(o)} aria-label={o}
                    onCheckedChange={(v) => setOptions((cur) => (v ? [...cur, o] : cur.filter((x) => x !== o)))}
                    className="mt-0.5 h-3.5 w-3.5"
                  />
                  {o}
                </label>
              ))}
            </div>
          )}
          {step === 4 && (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-1">
                <span className="text-[11px] text-slate-600">Concurrency level</span>
                <ChoiceGrid options={["Conservative", "Standard", "Aggressive"]} value={concurrency} onChange={setConcurrency} />
              </div>
              <div className="grid gap-1">
                <span className="text-[11px] text-slate-600">Priority</span>
                <ChoiceGrid options={["Low", "Normal", "High"]} value={priority} onChange={setPriority} />
              </div>
              <div className="grid gap-1"><Label htmlFor="bf-max" className="text-[11px] text-slate-600">Maximum duration</Label><Input id="bf-max" defaultValue="4 hours" className="h-8 text-[12px]" /></div>
              <div className="grid gap-1"><Label htmlFor="bf-limit" className="text-[11px] text-slate-600">Queue limit</Label><Input id="bf-limit" defaultValue="120,000 artifacts" className="h-8 text-[12px]" /></div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-2">
              <dl className="grid gap-x-6 sm:grid-cols-2">
                {([
                  ["Scope", scope], ["Time range", range],
                  ["Starting stage", stages.find((s) => s.id === startStage)!.name],
                  ["Options", options.length ? options.join(", ") : "None"],
                  ["Concurrency", concurrency], ["Priority", priority],
                  ["Estimated artifacts", nf(estimate.artifacts)],
                  ["Estimated duration", estimate.duration],
                  ["Estimated compute", estimate.compute],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-slate-100 py-1">
                    <dt className="text-[11px] text-slate-500">{k}</dt>
                    <dd className="text-right text-[11.5px] font-medium text-slate-800">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">
                Potential conflicts: live intake is competing for Normalize and Validate workers.
                Potential downstream delays: publishing may lag by up to 12 minutes during the backfill window.
              </div>
            </div>
          )}
          {step === 6 && (
            <div className="space-y-2">
              <Progress value={((progressStep + 1) / PROGRESS_STEPS.length) * 100} className="h-1.5" />
              <ul className="space-y-1" aria-live="polite">
                {PROGRESS_STEPS.map((s, i) => (
                  <li key={s} className={cn("text-[12px]", i <= progressStep ? "text-slate-800" : "text-slate-400")}>
                    {i < progressStep ? "✓ " : i === progressStep ? "• " : "  "}{s}
                  </li>
                ))}
              </ul>
              {progressStep === PROGRESS_STEPS.length - 1 && (
                <>
                  <dl className="grid gap-x-6 sm:grid-cols-2">
                    {([
                      ["Artifacts processed", nf(result.processed)],
                      ["Artifacts corrected", nf(result.corrected)],
                      ["Failures resolved", nf(result.failuresResolved)],
                      ["Warnings remaining", nf(result.warningsRemaining)],
                      ["Persona updates created", String(result.personaUpdates)],
                      ["Graph relationships updated", String(result.graphUpdates)],
                    ] as [string, string][]).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3 border-b border-slate-100 py-1">
                        <dt className="text-[11px] text-slate-500">{k}</dt>
                        <dd className="text-[11.5px] font-medium text-slate-800">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" className="h-7 text-[11px]" onClick={() => { onComplete(result); onOpenChange(false); }}>View Results</Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { onComplete(result); setStep(0); setProgressStep(-1); }}>Run Another Backfill</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => { onComplete(result); onOpenChange(false); }}>Close</Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {step < 6 && (
          <DialogFooter className="gap-1.5">
            <Button variant="outline" size="sm" className="h-8 text-[12px]" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
            {step < 5 ? (
              <Button size="sm" className="h-8 text-[12px]" onClick={() => setStep((s) => s + 1)}>Next</Button>
            ) : (
              <Button size="sm" className="h-8 text-[12px]" onClick={() => { setStep(6); setProgressStep(0); }}>Start Backfill</Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------- Export ---------------------------------- */

const FORMATS = ["CSV", "JSON", "PDF Summary", "Presentation Snapshot"];
const EXPORT_SCOPES = ["Current View", "Selected Runs", "Current Stage", "Alerts and Failures", "Output Readiness", "Full Pipeline Report"];
const INCLUDES = ["Include KPI trends", "Include stage details", "Include active runs", "Include alerts", "Include quality metrics", "Include readiness summary"];

export function ExportReportDialog({ open, onOpenChange, runs, payload }: {
  open: boolean; onOpenChange: (v: boolean) => void; runs: PipelineRun[]; payload: Record<string, unknown>;
}) {
  const [format, setFormat] = useState("CSV");
  const [scope, setScope] = useState(EXPORT_SCOPES[0]);
  const [includes, setIncludes] = useState<string[]>(["Include stage details", "Include active runs"]);
  const [progress, setProgress] = useState(-1);

  useEffect(() => { if (!open) setProgress(-1); }, [open]);
  useEffect(() => {
    if (progress < 0 || progress >= 100) return;
    const t = window.setTimeout(() => setProgress((p) => Math.min(100, p + 25)), 200);
    return () => window.clearTimeout(t);
  }, [progress]);

  const run = () => {
    setProgress(0);
    if (format === "CSV") download("discovery-pipeline-report.csv", runsToCsv(runs));
    else if (format === "JSON") download("discovery-pipeline-report.json", JSON.stringify({ format, scope, includes, runs, ...payload }, null, 2));
    toast.success(`${format} report generated`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Export Pipeline Report</DialogTitle>
          <DialogDescription className="text-[12px]">Generate an operational snapshot of the discovery pipeline.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-[12px]">
          <div><div className="mb-1 text-[11px] font-medium text-slate-600">Format</div><ChoiceGrid options={FORMATS} value={format} onChange={setFormat} cols={2} /></div>
          <div><div className="mb-1 text-[11px] font-medium text-slate-600">Scope</div><ChoiceGrid options={EXPORT_SCOPES} value={scope} onChange={setScope} cols={2} /></div>
          <div className="grid gap-1 sm:grid-cols-2">
            {INCLUDES.map((i) => (
              <label key={i} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                <Checkbox
                  checked={includes.includes(i)} aria-label={i}
                  onCheckedChange={(v) => setIncludes((cur) => (v ? [...cur, i] : cur.filter((x) => x !== i)))}
                  className="h-3.5 w-3.5"
                />
                {i}
              </label>
            ))}
          </div>
          {progress >= 0 && (
            <div aria-live="polite">
              <Progress value={progress} className="h-1.5" />
              <p className="mt-1 text-[11px] text-slate-500">{progress >= 100 ? "Export complete." : "Generating report…"}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Close</Button>
          <Button size="sm" className="h-8 text-[12px]" onClick={run}>Generate Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
