import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Row } from "./primitives";
import { nf } from "./data";

const SCOPE_OPTIONS = [
  "Single Team", "Selected Teams", "Business Unit", "Knowledge Domain",
  "Teams Without Personas", "Personas Requiring Refresh",
];

const CONDITION_SCOPE = [
  "All Approved Conditions", "Primary Authority Only", "Primary and Supporting",
  "Include Historical for Context", "Exclude Unconfirmed", "Selected Condition Types",
];

const SECTION_OPTIONS = [
  "Identity and Mission", "Capabilities", "Products and Services", "Customers and Stakeholders",
  "Objectives and Metrics", "Constraints and Guardrails", "Dependencies", "Risks and Controls",
  "Decision Logic", "How This Team Thinks", "Evidence and Provenance",
];

const MAPPING_OPTIONS = [
  "Resolve team ownership", "Resolve systems and services", "Resolve products", "Resolve customers",
  "Resolve upstream teams", "Resolve downstream teams", "Map objectives", "Map metrics",
  "Map dependencies", "Map risks", "Compile decision rules", "Calculate confidence", "Create review tasks",
];

const QUALITY_CONTROLS: { key: string; label: string; value: string }[] = [
  { key: "evidence", label: "Minimum evidence coverage", value: "90" },
  { key: "authority", label: "Minimum authority confidence", value: "85" },
  { key: "owner", label: "Minimum owner confidence", value: "85" },
  { key: "relationship", label: "Minimum relationship confidence", value: "85" },
  { key: "completeness", label: "Minimum completeness", value: "90" },
  { key: "review", label: "Human review threshold", value: "80" },
  { key: "auto", label: "Auto mapping threshold", value: "92" },
  { key: "freshness", label: "Freshness threshold (days)", value: "180" },
];

const EXECUTION_STEPS = [
  "Loading Team Context",
  "Gathering Approved Conditions",
  "Resolving Ownership and Scope",
  "Mapping Mission and Capabilities",
  "Modeling Services and Customers",
  "Mapping Dependencies and Risks",
  "Compiling Decision Logic",
  "Validating Evidence and Completeness",
  "Preparing Team Review",
  "Completed",
];

export interface ConstructionResult {
  personasCreated: number;
  personasUpdated: number;
  conditionsMapped: number;
  relationshipsCreated: number;
  gapsIdentified: number;
  conflictsIdentified: number;
  reviewTasksCreated: number;
}

export function StartConstructionDialog({
  open, onOpenChange, onComplete, onOpenWorkbench, onSaveDraft,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: (r: ConstructionResult) => void;
  onOpenWorkbench: () => void;
  onSaveDraft: () => void;
}) {
  const [step, setStep] = useState(1);
  const [scope, setScope] = useState(SCOPE_OPTIONS[0]);
  const [team, setTeam] = useState("Payments Platform");
  const [conditionScope, setConditionScope] = useState(CONDITION_SCOPE[1]);
  const [sections, setSections] = useState<string[]>(SECTION_OPTIONS);
  const [mapping, setMapping] = useState<string[]>(MAPPING_OPTIONS);
  const [controls, setControls] = useState<Record<string, string>>(
    Object.fromEntries(QUALITY_CONTROLS.map((c) => [c.key, c.value])),
  );
  const [running, setRunning] = useState(false);
  const [execIndex, setExecIndex] = useState(-1);
  const [result, setResult] = useState<ConstructionResult | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      setStep(1); setRunning(false); setExecIndex(-1); setResult(null);
      if (timer.current) window.clearInterval(timer.current);
    }
  }, [open]);

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  const estimate = useMemo(() => {
    const teams = scope === "Single Team" ? 1 : scope === "Selected Teams" ? 3 : scope === "Business Unit" ? 6 : 4;
    return {
      teams,
      conditions: teams * 348,
      mappings: teams * 312,
      relationships: teams * 21,
      gaps: teams * 2,
      conflicts: teams * 1,
      reviewTasks: teams * 3,
      duration: `${teams * 4} minutes`,
    };
  }, [scope]);

  const toggle = (list: string[], set: (v: string[]) => void, item: string) =>
    set(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);

  const run = () => {
    setRunning(true);
    setExecIndex(0);
    let i = 0;
    timer.current = window.setInterval(() => {
      i += 1;
      setExecIndex(i);
      if (i >= EXECUTION_STEPS.length - 1) {
        if (timer.current) window.clearInterval(timer.current);
        const r: ConstructionResult = {
          personasCreated: estimate.teams,
          personasUpdated: Math.max(0, estimate.teams - 1),
          conditionsMapped: estimate.mappings,
          relationshipsCreated: estimate.relationships,
          gapsIdentified: estimate.gaps,
          conflictsIdentified: estimate.conflicts,
          reviewTasksCreated: estimate.reviewTasks,
        };
        setResult(r);
        setRunning(false);
        onComplete(r);
      }
    }, 550);
  };

  const stepTitles = [
    "Select Team Scope", "Select Condition Scope", "Persona Sections", "Mapping Options",
    "Quality Controls", "Review", "Execute",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Start Persona Construction</DialogTitle>
          <DialogDescription className="text-[12px]">
            Step {step} of 7 — {stepTitles[step - 1]}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-auto pr-1">
          {step === 1 && (
            <div className="space-y-2">
              <RadioGroup value={scope} onValueChange={setScope} className="space-y-1.5">
                {SCOPE_OPTIONS.map((o) => (
                  <div key={o} className="flex items-center gap-2">
                    <RadioGroupItem value={o} id={`scope-${o}`} />
                    <Label htmlFor={`scope-${o}`} className="text-[12px] font-normal">{o}</Label>
                  </div>
                ))}
              </RadioGroup>
              <div>
                <Label htmlFor="team-name" className="text-[11px]">Team</Label>
                <Input id="team-name" value={team} onChange={(e) => setTeam(e.target.value)} className="mt-1 h-8 text-[12px]" />
              </div>
            </div>
          )}
          {step === 2 && (
            <RadioGroup value={conditionScope} onValueChange={setConditionScope} className="space-y-1.5">
              {CONDITION_SCOPE.map((o) => (
                <div key={o} className="flex items-center gap-2">
                  <RadioGroupItem value={o} id={`cs-${o}`} />
                  <Label htmlFor={`cs-${o}`} className="text-[12px] font-normal">{o}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {step === 3 && (
            <div className="grid gap-1.5 sm:grid-cols-2">
              {SECTION_OPTIONS.map((o) => (
                <label key={o} className="flex items-center gap-2 text-[12px]">
                  <Checkbox checked={sections.includes(o)} onCheckedChange={() => toggle(sections, setSections, o)} />
                  {o}
                </label>
              ))}
            </div>
          )}
          {step === 4 && (
            <div className="grid gap-1.5 sm:grid-cols-2">
              {MAPPING_OPTIONS.map((o) => (
                <label key={o} className="flex items-center gap-2 text-[12px]">
                  <Checkbox checked={mapping.includes(o)} onCheckedChange={() => toggle(mapping, setMapping, o)} />
                  {o}
                </label>
              ))}
            </div>
          )}
          {step === 5 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {QUALITY_CONTROLS.map((c) => (
                <div key={c.key}>
                  <Label htmlFor={`qc-${c.key}`} className="text-[11px]">{c.label}</Label>
                  <Input
                    id={`qc-${c.key}`}
                    value={controls[c.key]}
                    onChange={(e) => setControls((s) => ({ ...s, [c.key]: e.target.value }))}
                    className="mt-1 h-8 text-[12px]"
                  />
                </div>
              ))}
            </div>
          )}
          {step === 6 && (
            <dl>
              <Row label="Teams selected" value={estimate.teams} />
              <Row label="Conditions evaluated" value={nf(estimate.conditions)} />
              <Row label="Estimated mappings" value={nf(estimate.mappings)} />
              <Row label="Estimated relationships" value={nf(estimate.relationships)} />
              <Row label="Estimated gaps" value={estimate.gaps} />
              <Row label="Estimated conflicts" value={estimate.conflicts} />
              <Row label="Estimated review tasks" value={estimate.reviewTasks} />
              <Row label="Estimated duration" value={estimate.duration} />
              <Row label="Persona sections" value={`${sections.length} selected`} />
              <Row label="Mapping operations" value={`${mapping.length} selected`} />
              <Row label="Condition scope" value={conditionScope} />
            </dl>
          )}
          {step === 7 && (
            <div>
              <ol className="space-y-1">
                {EXECUTION_STEPS.map((s, i) => {
                  const done = execIndex > i || (result !== null && i <= execIndex);
                  const current = execIndex === i && running;
                  return (
                    <li key={s} className={cn("flex items-center gap-2 rounded-md border px-2 py-1.5 text-[12px]",
                      done ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : current ? "border-blue-200 bg-blue-50 text-blue-800"
                          : "border-slate-200 text-slate-500")}>
                      {done ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        : current ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          : <span className="h-3.5 w-3.5 rounded-full border border-slate-300" aria-hidden />}
                      {s}
                    </li>
                  );
                })}
              </ol>
              {result && (
                <div className="mt-3 rounded-lg border border-slate-200 p-2.5">
                  <h4 className="text-[12px] font-semibold text-slate-800">Construction complete</h4>
                  <dl className="mt-1">
                    <Row label="Personas created" value={result.personasCreated} />
                    <Row label="Personas updated" value={result.personasUpdated} />
                    <Row label="Conditions mapped" value={nf(result.conditionsMapped)} />
                    <Row label="Relationships created" value={nf(result.relationshipsCreated)} />
                    <Row label="Gaps identified" value={result.gapsIdentified} />
                    <Row label="Conflicts identified" value={result.conflictsIdentified} />
                    <Row label="Review tasks created" value={result.reviewTasksCreated} />
                  </dl>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-wrap gap-1.5">
          {step > 1 && step < 7 && <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 6 && <Button size="sm" onClick={() => setStep(step + 1)}>Continue</Button>}
          {step === 6 && <Button size="sm" onClick={() => { setStep(7); run(); }}>Execute</Button>}
          {step === 7 && !result && !running && <Button size="sm" onClick={run}>Run</Button>}
          {step === 7 && result && (
            <>
              <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>View Results</Button>
              <Button size="sm" variant="outline" onClick={() => { onOpenWorkbench(); onOpenChange(false); }}>Open Persona Workbench</Button>
              <Button size="sm" variant="outline" onClick={onSaveDraft}>Save as Draft</Button>
              <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Open Review Queue</Button>
              <Button size="sm" onClick={() => onOpenChange(false)}>Close</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Safe placeholder reserved for the Prompt 2 conflict resolution experience. */
export function ConflictPlaceholderDialog({
  open, onOpenChange, conditionId,
}: { open: boolean; onOpenChange: (v: boolean) => void; conditionId: string | null }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Conflict comparison</DialogTitle>
          <DialogDescription className="text-[12px]">
            {conditionId ? `Condition ${conditionId} conflicts with an existing Persona assertion.` : "A conflicting condition was detected."}
          </DialogDescription>
        </DialogHeader>
        <p className="text-[12px] text-slate-600">
          Side by side conflict resolution, authority arbitration, and human adjudication are delivered in the next
          build stage. The conflict has been recorded against the Persona and remains visible in Persona Construction Gaps.
        </p>
        <DialogFooter>
          <Button size="sm" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Generic confirm used by lightweight actions. */
export function ConfirmDialog({
  open, onOpenChange, title, description, onConfirm,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string; description: string; onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{title}</DialogTitle>
          <DialogDescription className="text-[12px]">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={() => { onConfirm(); onOpenChange(false); }}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
