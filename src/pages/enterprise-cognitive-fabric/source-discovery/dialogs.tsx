import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { runDiscoveryStages, type EnterpriseSource } from "./data";

/* ---------------------------- Run Discovery ------------------------------- */

const SCOPES = ["All approved sources", "Selected categories", "Selected sources", "Selected business unit", "Selected teams"];
const MODES = ["Deep Discovery", "Incremental Discovery", "Metadata Only", "Permission Validation Only"];
const OPTIONS = [
  "Include historical content",
  "Detect new sources",
  "Validate access",
  "Classify sensitive data",
  "Estimate ingestion volume",
  "Create source registry entries",
];

export interface DiscoveryResult {
  sources: number;
  artifacts: number;
  warnings: number;
  restricted: number;
  ready: number;
}

export function RunDiscoveryDialog({
  open,
  onOpenChange,
  onComplete,
  onProceed,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: (r: DiscoveryResult) => void;
  onProceed: () => void;
}) {
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState(SCOPES[0]);
  const [mode, setMode] = useState(MODES[1]);
  const [options, setOptions] = useState<string[]>(["Detect new sources", "Validate access", "Create source registry entries"]);
  const [stageIndex, setStageIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DiscoveryResult | null>(null);

  const reset = () => {
    setStep(0); setStageIndex(0); setRunning(false); setResult(null);
  };

  useEffect(() => {
    if (!running) return;
    if (stageIndex >= runDiscoveryStages.length - 1) {
      const r: DiscoveryResult = { sources: 151, artifacts: 2486000, warnings: 4, restricted: 3, ready: 141 };
      setResult(r);
      setRunning(false);
      onComplete(r);
      toast.success("Discovery completed across approved enterprise sources.");
      return;
    }
    const t = window.setTimeout(() => setStageIndex((i) => i + 1), 550);
    return () => window.clearTimeout(t);
  }, [running, stageIndex, onComplete]);

  const progress = Math.round((stageIndex / (runDiscoveryStages.length - 1)) * 100);

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Run Discovery</DialogTitle>
          <DialogDescription className="text-[12px]">
            Step {Math.min(step + 1, 5)} of 5 — scope, mode, options, review and execution.
          </DialogDescription>
        </DialogHeader>

        {step === 0 && (
          <ChoiceGroup label="Select scope" options={SCOPES} value={scope} onChange={setScope} />
        )}
        {step === 1 && (
          <ChoiceGroup label="Discovery mode" options={MODES} value={mode} onChange={setMode} />
        )}
        {step === 2 && (
          <div className="space-y-1.5">
            <div className="text-[11.5px] font-medium text-slate-700">Options</div>
            {OPTIONS.map((o) => (
              <label key={o} className="flex items-center gap-2 text-[12px] text-slate-700">
                <Checkbox
                  checked={options.includes(o)}
                  onCheckedChange={(v) => setOptions((cur) => (v ? [...cur, o] : cur.filter((x) => x !== o)))}
                />
                {o}
              </label>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-1 text-[12px] text-slate-700">
            <Review label="Scope" value={scope} />
            <Review label="Mode" value={mode} />
            <Review label="Options" value={options.length ? options.join(", ") : "None"} />
            <Review label="Estimated sources" value="151" />
            <Review label="Estimated artifacts" value="2.49M" />
            <Review label="Estimated duration" value="6 min 40 s" />
            <Review label="Potential warnings" value="4 (transcript backlog, Apigee token, restricted labels)" />
          </div>
        )}
        {step === 4 && (
          <div>
            <Progress value={result ? 100 : progress} className="h-1.5" />
            <p className="mt-2 text-[12px] text-slate-700" role="status" aria-live="polite">
              {result ? "Discovery completed." : `${runDiscoveryStages[stageIndex]}…`}
            </p>
            <ol className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
              {runDiscoveryStages.map((s, i) => (
                <li key={s} className={cn("rounded px-1.5 py-0.5", i <= stageIndex || result ? "bg-emerald-50 text-emerald-700" : "text-slate-400")}>
                  {s}
                </li>
              ))}
            </ol>
            {result && (
              <div className="mt-3 space-y-1 rounded-md border border-slate-200 p-2 text-[12px]">
                <Review label="Sources discovered" value={String(result.sources)} />
                <Review label="Artifacts discovered" value={result.artifacts.toLocaleString("en-US")} />
                <Review label="Warnings" value={String(result.warnings)} />
                <Review label="Restricted sources" value={String(result.restricted)} />
                <Review label="Sources ready for ingestion" value={String(result.ready)} />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-1.5">
          {step > 0 && step < 4 && (
            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setStep(step - 1)}>Back</Button>
          )}
          {step < 3 && (
            <Button size="sm" className="h-8 text-[12px]" onClick={() => setStep(step + 1)}>Next</Button>
          )}
          {step === 3 && (
            <Button size="sm" className="h-8 text-[12px]" onClick={() => { setStep(4); setRunning(true); }}>Run Discovery</Button>
          )}
          {step === 4 && result && (
            <>
              <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => { onOpenChange(false); reset(); }}>View Results</Button>
              <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={reset}>Run Another Discovery</Button>
              <Button size="sm" className="h-8 text-[12px]" onClick={onProceed}>Proceed to Ingestion</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChoiceGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="mb-1.5 text-[11.5px] font-medium text-slate-700">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={cn(
              "rounded-md border px-2 py-1 text-[11.5px]",
              value === o ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-1">
      <span className="text-[11.5px] text-slate-500">{label}</span>
      <span className="text-right text-[12px] font-medium text-slate-900">{value}</span>
    </div>
  );
}

/* --------------------------- Export inventory ----------------------------- */

const FORMATS = ["CSV", "JSON", "PDF Summary", "Presentation Snapshot"];
const SCOPE_OPTIONS = ["Current filtered view", "Selected sources", "Full source inventory"];
const INCLUDES = [
  "Include metadata",
  "Include connector health",
  "Include access classification",
  "Include warnings",
  "Include coverage metrics",
];

export function ExportInventoryDialog({
  open,
  onOpenChange,
  sources,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sources: EnterpriseSource[];
}) {
  const [format, setFormat] = useState("CSV");
  const [scope, setScope] = useState(SCOPE_OPTIONS[0]);
  const [includes, setIncludes] = useState<string[]>(["Include metadata", "Include coverage metrics"]);
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);

  const download = () => {
    const rows = sources.map((s) => ({
      id: s.id, name: s.name, category: s.category, platform: s.platform, owner: s.businessOwner,
      status: s.status, artifacts: s.artifactCount, lastSync: s.lastSync,
      access: s.accessClassification, coverage: s.coverage, discoveryMode: s.discoveryMode,
      warnings: s.warnings.join(" | "),
    }));
    let blob: Blob;
    let filename: string;
    if (format === "JSON") {
      blob = new Blob([JSON.stringify({ scope, includes, rows }, null, 2)], { type: "application/json" });
      filename = "source-inventory.json";
    } else {
      const header = Object.keys(rows[0] ?? { id: "" }).join(",");
      const body = rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
      filename = "source-inventory.csv";
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const run = () => {
    setState("running");
    setProgress(20);
    window.setTimeout(() => setProgress(70), 250);
    window.setTimeout(() => {
      setProgress(100);
      setState("done");
      if (format === "CSV" || format === "JSON") download();
      toast.success(`${format} export ready.`);
    }, 700);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setState("idle"); setProgress(0); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Export Inventory</DialogTitle>
          <DialogDescription className="text-[12px]">Generate a source inventory extract for review or distribution.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <ChoiceGroup label="Format" options={FORMATS} value={format} onChange={setFormat} />
          <ChoiceGroup label="Scope" options={SCOPE_OPTIONS} value={scope} onChange={setScope} />
          <div className="space-y-1">
            <div className="text-[11.5px] font-medium text-slate-700">Include</div>
            {INCLUDES.map((i) => (
              <label key={i} className="flex items-center gap-2 text-[12px] text-slate-700">
                <Checkbox checked={includes.includes(i)} onCheckedChange={(v) => setIncludes((cur) => (v ? [...cur, i] : cur.filter((x) => x !== i)))} />
                {i}
              </label>
            ))}
          </div>
          {state !== "idle" && (
            <div>
              <Progress value={progress} className="h-1.5" />
              <p className="mt-1 text-[11px] text-slate-500" role="status" aria-live="polite">
                {state === "done" ? "Export complete." : "Preparing export…"}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Close</Button>
          <Button size="sm" className="h-8 text-[12px]" onClick={run} disabled={state === "running"}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
