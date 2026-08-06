import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { nf } from "./panels";
import { searchIndex, taxonomy } from "./data";

/* ------------------------------------------------------ start extraction */

const SCOPES = [
  "All Qualified Canonical Artifacts", "Selected Normalization Jobs", "Selected Sources", "Selected Artifact Types",
  "Selected Teams", "Selected Knowledge Domains", "Selected Artifacts",
];

const FAMILIES = ["All", ...taxonomy.map((t) => t.family)];

const OPTIONS = [
  "Detect evidence", "Classify conditions", "Normalize values", "Normalize units", "Resolve owners",
  "Resolve systems", "Resolve services", "Resolve dependencies", "Link customer journeys", "Score authority",
  "Score confidence", "Detect conflicts", "Detect gaps", "Create review tasks", "Prepare registry records",
];

const QUALITY: [string, string][] = [
  ["Minimum candidate confidence", "85"], ["Minimum evidence confidence", "90"], ["Minimum authority confidence", "80"],
  ["Minimum structured completeness", "92"], ["Minimum owner confidence", "85"], ["Auto mapping threshold", "95"],
  ["Human review threshold", "90"], ["Conflict threshold", "0.86"], ["Evidence count requirement", "1"],
];

const AUTHORITY_RULES = [
  "Prefer Primary", "Allow Supporting", "Include Historical for context", "Include Reference",
  "Exclude Unconfirmed from automatic approval", "Use freshness weighting", "Use approval weighting", "Use source ranking",
];

const CAPACITY: [string, string][] = [
  ["Priority", "High"], ["Concurrency", "8"], ["Batch size", "500"], ["Maximum duration", "6h"],
  ["Queue limit", "25000"], ["Retry policy", "3 attempts, exponential"],
];

const EXECUTION_STEPS = [
  "Loading Canonical Artifacts", "Identifying Candidate Evidence", "Detecting Conditions", "Classifying",
  "Normalizing Values and Units", "Resolving Owners and Dependencies", "Scoring Authority and Confidence",
  "Detecting Conflicts and Gaps", "Preparing Review Tasks", "Preparing Registry Records", "Completed",
];

export function StartExtractionDialog({ open, onOpenChange, onComplete, onOpenJob, onOpenWorkbench }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  onComplete: (summary: { candidates: number; conditions: number; conflicts: number; gaps: number; reviews: number; failures: number; artifacts: number }) => void;
  onOpenJob: () => void; onOpenWorkbench: () => void;
}) {
  const [step, setStep] = useState(1);
  const [scope, setScope] = useState(SCOPES[0]);
  const [families, setFamilies] = useState<string[]>(["All"]);
  const [options, setOptions] = useState<string[]>(OPTIONS);
  const [quality, setQuality] = useState(Object.fromEntries(QUALITY));
  const [rules, setRules] = useState<string[]>(AUTHORITY_RULES.slice(0, 6));
  const [capacity, setCapacity] = useState(Object.fromEntries(CAPACITY));
  const [progress, setProgress] = useState(-1);

  useEffect(() => { if (!open) { setStep(1); setProgress(-1); } }, [open]);

  useEffect(() => {
    if (step !== 8 || progress < 0 || progress >= EXECUTION_STEPS.length - 1) return;
    const t = setTimeout(() => setProgress((p) => p + 1), 420);
    return () => clearTimeout(t);
  }, [step, progress]);

  const estimate = { artifacts: 128_412, candidates: 24_186, conditions: 21_642, conflicts: 148, gaps: 214, reviews: 427, failures: 62 };
  const done = progress >= EXECUTION_STEPS.length - 1;
  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Start Extraction</DialogTitle>
          <DialogDescription className="text-[11.5px]">Step {Math.min(step, 8)} of 8</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-1.5">
            <p className="text-[11.5px] font-semibold text-slate-700">Select scope</p>
            {SCOPES.map((s) => (
              <label key={s} className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px]">
                <input type="radio" name="scope" checked={scope === s} onChange={() => setScope(s)} />{s}
              </label>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid max-h-72 grid-cols-2 gap-1 overflow-y-auto">
            {FAMILIES.map((f) => (
              <label key={f} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                <input type="checkbox" checked={families.includes(f)} onChange={() => toggle(families, setFamilies, f)} />{f}
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-2 gap-1">
            {OPTIONS.map((o) => (
              <label key={o} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                <input type="checkbox" checked={options.includes(o)} onChange={() => toggle(options, setOptions, o)} />{o}
              </label>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {QUALITY.map(([k]) => (
              <label key={k} className="text-[11px] text-slate-600">
                {k}
                <Input className="mt-0.5 h-7 text-[11.5px]" value={quality[k]} onChange={(e) => setQuality({ ...quality, [k]: e.target.value })} />
              </label>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-1">
            {AUTHORITY_RULES.map((r) => (
              <label key={r} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                <input type="checkbox" checked={rules.includes(r)} onChange={() => toggle(rules, setRules, r)} />{r}
              </label>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {CAPACITY.map(([k]) => (
              <label key={k} className="text-[11px] text-slate-600">
                {k}
                <Input className="mt-0.5 h-7 text-[11.5px]" value={capacity[k]} onChange={(e) => setCapacity({ ...capacity, [k]: e.target.value })} />
              </label>
            ))}
          </div>
        )}

        {step === 7 && (
          <dl className="grid gap-1.5 text-[11.5px] sm:grid-cols-2">
            {[["Artifacts", nf(estimate.artifacts)], ["Condition families", families.includes("All") ? "22" : `${families.length}`],
              ["Estimated candidates", nf(estimate.candidates)], ["Estimated approved conditions", nf(estimate.conditions)],
              ["Estimated reviews", nf(estimate.reviews)], ["Estimated conflicts", nf(estimate.conflicts)],
              ["Estimated duration", "2h 40m"], ["Authority warnings", "Unconfirmed sources excluded from auto approval"],
              ["Permission constraints", "Restricted artifacts excluded (1,284)"], ["Scope", scope]].map(([k, v]) => (
              <div key={k} className="rounded-md border border-slate-200 px-2 py-1.5">
                <dt className="text-[10px] uppercase tracking-wide text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {step === 8 && (
          <div className="space-y-1">
            {EXECUTION_STEPS.map((s, i) => (
              <div key={s} className={cn("flex items-center justify-between rounded-md border px-2 py-1 text-[11.5px]",
                progress > i ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : progress === i ? "border-blue-200 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-500")}>
                <span>{s}</span><span>{progress > i ? "Complete" : progress === i ? "Running" : "Pending"}</span>
              </div>
            ))}
            {done && (
              <dl className="mt-2 grid grid-cols-2 gap-1.5 text-[11.5px]">
                {[["Artifacts evaluated", nf(estimate.artifacts)], ["Candidates detected", nf(estimate.candidates)],
                  ["Conditions prepared", nf(estimate.conditions)], ["Conflicts detected", nf(estimate.conflicts)],
                  ["Gaps detected", nf(estimate.gaps)], ["Review tasks", nf(estimate.reviews)],
                  ["Failures", nf(estimate.failures)]].map(([k, v]) => (
                  <div key={k} className="rounded-md border border-slate-200 px-2 py-1.5">
                    <dt className="text-[10px] uppercase tracking-wide text-slate-500">{k}</dt>
                    <dd className="font-medium text-slate-800">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}

        <DialogFooter className="gap-1.5">
          {step > 1 && step < 8 && <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          {step < 7 && <Button size="sm" className="h-7 text-[11px]" onClick={() => setStep((s) => s + 1)}>Next</Button>}
          {step === 7 && (
            <Button size="sm" className="h-7 text-[11px]" onClick={() => { setStep(8); setProgress(0); }}>Execute</Button>
          )}
          {step === 8 && done && (
            <>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { onComplete(estimate); onOpenJob(); onOpenChange(false); }}>Open Job</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { onComplete(estimate); onOpenWorkbench(); onOpenChange(false); }}>Open Workbench</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled title="Review queue arrives in Prompt 2">Open Review Queue</Button>
              <Button size="sm" className="h-7 text-[11px]" onClick={() => { onComplete(estimate); onOpenChange(false); }}>View Results</Button>
            </>
          )}
          <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------ utilities */

export function GlobalSearchDialog({ open, onOpenChange, onSelect }: {
  open: boolean; onOpenChange: (o: boolean) => void; onSelect: (id: string, kind: string) => void;
}) {
  const [q, setQ] = useState("");
  const results = searchIndex.filter((r) => !q || `${r.id} ${r.label}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Search conditions, jobs, artifacts, and stages</DialogTitle>
        </DialogHeader>
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type to search" className="h-8 text-[12px]" />
        <ul className="max-h-64 space-y-1 overflow-y-auto">
          {results.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => { onSelect(r.id, r.kind); onOpenChange(false); }}
                className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-left text-[11.5px] hover:border-blue-300 hover:bg-blue-50">
                <span className="font-mono text-[10.5px] text-slate-500">{r.kind}</span> · {r.label}
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="py-4 text-center text-[11.5px] text-slate-500">No matches.</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

export function PlaceholderDialog({ open, onOpenChange, title, detail }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; detail: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[14px]">{title}</DialogTitle>
          <DialogDescription className="text-[11.5px]">{detail}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, onConfirm }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string;
  confirmLabel: string; onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[14px]">{title}</DialogTitle>
          <DialogDescription className="text-[11.5px]">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => { onConfirm(); onOpenChange(false); }}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
