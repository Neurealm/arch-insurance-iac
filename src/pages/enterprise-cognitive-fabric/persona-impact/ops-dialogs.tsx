/** Persona Impact Analysis — Prompt 2 dialogs and workflows. */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Pill, Row } from "../persona-studio/primitives";
import { SimpleTable, piaTone } from "./panels";
import {
  conflictsFor, impactPersonas, personaById, type ProposalState,
} from "./data";
import {
  analysisScopeOptions, buildExportRows, contextRuleOptions, executionSteps, exportFormats,
  exportOptions, exportScopes, intakePackages, personaCandidates, qualityControlDefaults,
  reanalysisScopes, reanalysisSteps, searchAll, searchExamples, startSteps, toCsv, toYaml,
  validateRouting, type ChangeAlternative, type DemoScenario, type PersonaImpactAnalysisVersion, type PersonaImpactDecisionPackage,
  type PersonaImpactMitigationVersion, type PersonaImpactReview, type PersonaImpactScenario,
  type PiaSearchResult,
} from "./ops-data";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-0.5 text-[10.5px] uppercase tracking-wide text-slate-500">
    {label}
    <span className="normal-case tracking-normal">{children}</span>
  </label>
);

const inputCls = "h-7 w-full rounded border border-slate-200 bg-white px-1.5 text-[11.5px] text-slate-800";

/* ------------------------------------------------------- start analysis -- */

export function StartAnalysisDialog({
  open, onOpenChange, onStart,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onStart: (summary: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [pkg, setPkg] = useState(intakePackages[0].id);
  const [personas, setPersonas] = useState<string[]>(personaCandidates.filter((c) => c.included).map((c) => c.personaId));
  const [scope, setScope] = useState<string[]>(analysisScopeOptions.slice(0, 10));
  const [rules, setRules] = useState<string[]>(contextRuleOptions.slice(0, 5));
  const [controls, setControls] = useState(qualityControlDefaults);
  const [running, setRunning] = useState(false);
  const [execStep, setExecStep] = useState(0);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const canNext = step !== 1 || personas.length > 0;

  const run = () => {
    setRunning(true);
    setExecStep(0);
    const tick = (i: number) => {
      window.setTimeout(() => {
        setExecStep(i);
        if (i < executionSteps.length - 1) tick(i + 1);
        else {
          onStart(`Impact analysis started for ${personas.length} Personas on ${pkg}`);
          window.setTimeout(() => { setRunning(false); setStep(0); onOpenChange(false); }, 400);
        }
      }, 160);
    };
    tick(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Start Impact Analysis</DialogTitle>
          <DialogDescription className="text-[11.5px]">
            Step {step + 1} of {startSteps.length} · {startSteps[step]}
          </DialogDescription>
        </DialogHeader>

        {running ? (
          <div className="space-y-1.5">
            <Progress value={((execStep + 1) / executionSteps.length) * 100} className="h-1.5" />
            <ul className="max-h-64 space-y-0.5 overflow-auto text-[11.5px]">
              {executionSteps.map((s, i) => (
                <li key={s} className={cn("flex items-center gap-1.5",
                  i < execStep ? "text-green-700" : i === execStep ? "font-semibold text-blue-700" : "text-slate-400")}>
                  <span aria-hidden>{i < execStep ? "✓" : i === execStep ? "●" : "○"}</span>{s}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="max-h-[55vh] space-y-2 overflow-auto">
            {step === 0 && (
              <SimpleTable head={["Select", "Package", "Work Item", "Team", "Completeness", "Routed"]}
                rows={intakePackages.map((p) => [
                  <input key="r" type="radio" name="pkg" checked={pkg === p.id} onChange={() => setPkg(p.id)}
                    aria-label={`Select ${p.title}`} />,
                  p.id, p.title, p.team, `${p.completeness}%`, p.routedAt])} />
            )}
            {step === 1 && (
              <SimpleTable head={["Include", "Persona", "Team", "Match", "Why Suggested", "Conditions"]}
                rows={personaCandidates.map((c) => [
                  <input key="c" type="checkbox" checked={personas.includes(c.personaId)}
                    onChange={() => toggle(personas, setPersonas, c.personaId)}
                    aria-label={`Include ${personaById(c.personaId).name}`} />,
                  personaById(c.personaId).name, c.team, `${c.matchConfidence}%`, c.whyIncluded, c.applicableConditions])} />
            )}
            {step === 2 && (
              <div className="flex flex-wrap gap-1">
                {analysisScopeOptions.map((o) => (
                  <button key={o} type="button" aria-pressed={scope.includes(o)} onClick={() => toggle(scope, setScope, o)}
                    className={cn("rounded border px-2 py-0.5 text-[11px]",
                      scope.includes(o) ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}>{o}</button>
                ))}
              </div>
            )}
            {step === 3 && (
              <ul className="space-y-1">
                {contextRuleOptions.map((o) => (
                  <li key={o} className="flex items-center gap-1.5 text-[11.5px] text-slate-700">
                    <input type="checkbox" checked={rules.includes(o)} onChange={() => toggle(rules, setRules, o)} id={`rule-${o}`} />
                    <label htmlFor={`rule-${o}`}>{o}</label>
                  </li>
                ))}
              </ul>
            )}
            {step === 4 && (
              <div className="grid gap-1.5 sm:grid-cols-2">
                {Object.entries(controls).map(([k, v]) => (
                  <Field key={k} label={k}>
                    <input type="number" value={v} min={0} max={100} className={inputCls}
                      onChange={(e) => setControls({ ...controls, [k]: Number(e.target.value) })} />
                  </Field>
                ))}
              </div>
            )}
            {(step === 5 || step === 6) && (
              <dl className="rounded border border-slate-200 bg-white p-2">
                <Row label="Intake Package" value={pkg} />
                <Row label="Personas" value={personas.map((p) => personaById(p).name).join(", ")} />
                <Row label="Scope Dimensions" value={`${scope.length} selected`} />
                <Row label="Context Rules" value={rules.join(", ")} />
                <Row label="Quality Controls" value={Object.entries(controls).map(([k, v]) => `${k} ${v}`).join(" · ")} />
              </dl>
            )}
          </div>
        )}

        {!running && (
          <DialogFooter className="gap-1">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</Button>
            {step < startSteps.length - 1
              ? <Button size="sm" className="h-7 text-[11px]" disabled={!canNext} onClick={() => setStep(step + 1)}>Next</Button>
              : <Button size="sm" className="h-7 text-[11px]" onClick={run}>Execute Analysis</Button>}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------ reanalysis -- */

export function ReanalysisDialog({
  open, onOpenChange, onRun,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; onRun: (scope: string, reason: string) => void;
}) {
  const [scope, setScope] = useState<string>(reanalysisScopes[0]);
  const [reason, setReason] = useState("");
  const [running, setRunning] = useState(false);
  const [i, setI] = useState(0);
  const start = () => {
    setRunning(true);
    const tick = (n: number) => window.setTimeout(() => {
      setI(n);
      if (n < reanalysisSteps.length - 1) tick(n + 1);
      else { onRun(scope, reason); setRunning(false); setI(0); onOpenChange(false); }
    }, 180);
    tick(1);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Reanalyze Impact</DialogTitle>
          <DialogDescription className="text-[11.5px]">
            Reanalysis creates a new analysis version. Prior results are preserved and remain comparable.
          </DialogDescription>
        </DialogHeader>
        {running ? (
          <ul className="space-y-0.5 text-[11.5px]">
            {reanalysisSteps.map((s, n) => (
              <li key={s} className={n < i ? "text-green-700" : n === i ? "font-semibold text-blue-700" : "text-slate-400"}>
                {n < i ? "✓" : n === i ? "●" : "○"} {s}
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-1.5">
            <Field label="Reanalysis scope">
              <select value={scope} onChange={(e) => setScope(e.target.value)} className={inputCls}>
                {reanalysisScopes.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Reason (required)">
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
                className="w-full rounded border border-slate-200 p-1.5 text-[11.5px]" />
            </Field>
          </div>
        )}
        {!running && (
          <DialogFooter>
            <Button size="sm" className="h-7 text-[11px]" disabled={!reason.trim()} onClick={start}>Run Reanalysis</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------------------------- bulk actions -- */

export function BulkActionsDialog({
  open, onOpenChange, count, onApply,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; count: number; onApply: (action: string, note: string) => void;
}) {
  const actions = [
    "Reanalyze Selected", "Assign Reviewer", "Request Evidence", "Apply Mitigation Template",
    "Export Selected", "Route to Cross Team Impact Matrix", "Route to Decision Intelligence",
    "Mark Reviewed", "Change Priority",
  ];
  const [action, setAction] = useState(actions[0]);
  const [note, setNote] = useState("");
  const destructive = action.startsWith("Route") || action === "Mark Reviewed";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Bulk Actions</DialogTitle>
          <DialogDescription className="text-[11.5px]">{count} evaluations selected</DialogDescription>
        </DialogHeader>
        <Field label="Action">
          <select value={action} onChange={(e) => setAction(e.target.value)} className={inputCls}>
            {actions.map((a) => <option key={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Note">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
            className="w-full rounded border border-slate-200 p-1.5 text-[11.5px]" />
        </Field>
        {destructive && (
          <p className="rounded border border-amber-200 bg-amber-50 p-1.5 text-[11px] text-amber-800">
            This action affects downstream coordination and decision capabilities. Confirm before applying.
          </p>
        )}
        <DialogFooter>
          <Button size="sm" className="h-7 text-[11px]" disabled={count === 0}
            onClick={() => { onApply(action, note); setNote(""); onOpenChange(false); }}>
            Apply to {count}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------------------------------- routing ----- */

export function RoutingDialog({
  open, onOpenChange, target, pkg, reviews, analysisComplete, onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  target: "Cross Team Impact Matrix" | "Decision Intelligence";
  pkg: PersonaImpactDecisionPackage;
  reviews: PersonaImpactReview[];
  analysisComplete: boolean;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  const check = validateRouting(target, pkg, reviews, analysisComplete);
  const allowed = check.validationStatus !== "Blocked";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Route to {target}</DialogTitle>
          <DialogDescription className="text-[11.5px]">
            Persona Impact Analysis produces structured input. It does not make the enterprise decision.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-1.5">
          <span className="text-[10.5px] uppercase tracking-wide text-slate-500">Validation</span>
          <Pill label={check.validationStatus} tone={allowed ? (check.warnings.length ? "amber" : "green") : "red"} />
        </div>
        <SimpleTable head={["Type", "Detail"]}
          rows={[
            ...check.blocking.map((b) => [<Pill key="b" label="Blocking" tone="red" />, b]),
            ...check.warnings.map((w) => [<Pill key="w" label="Warning" tone="amber" />, w]),
            ...(check.blocking.length || check.warnings.length ? [] : [[<Pill key="p" label="Passed" tone="green" />, "All routing requirements met"]]),
          ]} />
        {!allowed && (
          <p role="alert" className="rounded border border-red-200 bg-red-50 p-1.5 text-[11px] text-red-700">
            Routing blocked: {check.blocking.join(" · ")}
          </p>
        )}
        <Field label="Routing note">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
            className="w-full rounded border border-slate-200 p-1.5 text-[11.5px]" />
        </Field>
        <DialogFooter>
          <Button size="sm" className="h-7 text-[11px]" disabled={!allowed}
            onClick={() => { onConfirm(note); setNote(""); onOpenChange(false); }}>Confirm Handoff</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

}

/* ------------------------------------------------------------- search ---- */

export function GlobalSearchDialog({
  open, onOpenChange, proposal, reviews, versions, scenarios, mitigationVersions, onOpenResult,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  proposal: ProposalState;
  reviews: PersonaImpactReview[];
  versions: PersonaImpactAnalysisVersion[];
  scenarios: PersonaImpactScenario[];
  mitigationVersions: PersonaImpactMitigationVersion[];
  onOpenResult: (r: PiaSearchResult) => void;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const results = useMemo(
    () => searchAll(q, proposal, reviews, versions, scenarios, mitigationVersions)
      .filter((r) => type === "All" || r.type === type),
    [q, type, proposal, reviews, versions, scenarios, mitigationVersions]);
  const types = Array.from(new Set(searchAll(q, proposal, reviews, versions, scenarios, mitigationVersions).map((r) => r.type)));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Search Persona Impact Analysis</DialogTitle>
          <DialogDescription className="text-[11.5px]">
            Evaluations, work items, personas, findings, conditions, risks, controls, mitigations, evidence,
            dependencies, conflicts, scenarios, versions, and review tasks
          </DialogDescription>
        </DialogHeader>
        <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus
          placeholder="Search impact analysis" aria-label="Search impact analysis"
          className="h-8 w-full rounded border border-slate-200 px-2 text-[12px]" />
        <div className="flex flex-wrap gap-1">
          {["All", ...types].map((t) => (
            <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)}
              className={cn("rounded border px-2 py-0.5 text-[10.5px]",
                type === t ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}>{t}</button>
          ))}
        </div>
        {!q && (
          <div className="text-[11px] text-slate-600">
            <p className="font-semibold">Try:</p>
            <ul className="mt-0.5 flex flex-wrap gap-1">
              {searchExamples.map((e) => (
                <li key={e}>
                  <button type="button" className="rounded border border-slate-200 px-1.5 py-0.5 hover:bg-slate-50"
                    onClick={() => setQ(e.split(" ").slice(-2).join(" "))}>{e}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="max-h-[45vh] overflow-auto">
          {q && !results.length
            ? <p className="p-3 text-center text-[11.5px] text-slate-500">No matches. Try a persona, finding, condition, or evidence term.</p>
            : (
              <SimpleTable head={["ID", "Type", "Evaluation", "Persona", "Finding", "Severity", "Confidence", "Status", "Action"]}
                rows={results.map((r) => [r.id, r.type, r.evaluation, r.persona, r.finding, r.severity, `${r.confidence}%`, r.status,
                  <Button key="a" size="sm" variant="outline" className="h-6 text-[10px]"
                    onClick={() => { onOpenResult(r); onOpenChange(false); }}>Open</Button>])} />
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------- export ---- */

export function ExportDialog({
  open, onOpenChange, proposal, mitigationVersions, reviews, personaId, onExported,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  proposal: ProposalState;
  mitigationVersions: PersonaImpactMitigationVersion[];
  reviews: PersonaImpactReview[];
  personaId: string;
  onExported: (msg: string) => void;
}) {
  const [format, setFormat] = useState<(typeof exportFormats)[number]>("CSV");
  const [scope, setScope] = useState<string>("Full Impact Analysis");
  const [included, setIncluded] = useState<string[]>(exportOptions);
  const rows = useMemo(() => buildExportRows(scope, proposal, mitigationVersions, reviews, personaId),
    [scope, proposal, mitigationVersions, reviews, personaId]);
  const preview = format === "CSV" ? toCsv(rows)
    : format === "JSON" ? JSON.stringify(rows.slice(0, 6), null, 2)
      : format === "YAML" ? toYaml(rows.slice(0, 6))
        : `${scope} — ${rows.length} records · governed ${format} with provenance, persona versions, condition versions, evidence references, and confidence.`;

  const download = () => {
    const blob = new Blob([preview], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `persona-impact-${scope.toLowerCase().replace(/\s+/g, "-")}.${format === "CSV" ? "csv" : format === "JSON" ? "json" : format === "YAML" ? "yaml" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
    onExported(`Exported ${scope} as ${format} with ${rows.length} records`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Governed Export</DialogTitle>
          <DialogDescription className="text-[11.5px]">
            Exports carry provenance: persona versions, condition versions, evidence references, and confidence
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5 sm:grid-cols-2">
          <Field label="Format">
            <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} className={inputCls}>
              {exportFormats.map((f) => <option key={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Scope">
            <select value={scope} onChange={(e) => setScope(e.target.value)} className={inputCls}>
              {exportScopes.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-1">
          {exportOptions.map((o) => (
            <button key={o} type="button" aria-pressed={included.includes(o)}
              onClick={() => setIncluded(included.includes(o) ? included.filter((x) => x !== o) : [...included, o])}
              className={cn("rounded border px-1.5 py-0.5 text-[10.5px]",
                included.includes(o) ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}>{o}</button>
          ))}
        </div>
        <pre className="max-h-56 overflow-auto rounded border border-slate-200 bg-slate-50 p-2 text-[10.5px] text-slate-700">{preview}</pre>
        <DialogFooter>
          <Button size="sm" className="h-7 text-[11px]" onClick={download}>Download Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------ demo scenarios --- */

export function DemoScenariosDialog({
  open, onOpenChange, scenarios, activeId, onApply,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  scenarios: DemoScenario[];
  activeId: string | null;
  onApply: (s: DemoScenario) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Demo Scenarios</DialogTitle>
          <DialogDescription className="text-[11.5px]">
            Each scenario changes real page state. Nothing here is a static mock.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[55vh] gap-1.5 overflow-auto sm:grid-cols-2">
          {scenarios.map((s) => (
            <div key={s.id} className={cn("rounded border p-2",
              activeId === s.id ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white")}>
              <p className="text-[11.5px] font-semibold text-slate-800">{s.id} · {s.name}</p>
              <p className="text-[10.5px] text-slate-600">{s.description}</p>
              <div className="mt-1 flex items-center gap-1">
                <Pill label={s.operationalState} tone={piaTone(s.operationalState)} />
                <Button size="sm" variant="outline" className="ml-auto h-6 text-[10px]"
                  onClick={() => { onApply(s); onOpenChange(false); }}>Apply</Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------- small form dialogs --- */

export function PromptDialog({
  open, onOpenChange, title, description, label, confirmLabel, requireValue = true, onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  label: string;
  confirmLabel: string;
  requireValue?: boolean;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{title}</DialogTitle>
          {description && <DialogDescription className="text-[11.5px]">{description}</DialogDescription>}
        </DialogHeader>
        <Field label={label}>
          <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3}
            className="w-full rounded border border-slate-200 p-1.5 text-[11.5px]" />
        </Field>
        <DialogFooter>
          <Button size="sm" className="h-7 text-[11px]" disabled={requireValue && !value.trim()}
            onClick={() => { onSubmit(value); setValue(""); onOpenChange(false); }}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AlternativeDetailDialog({
  open, onOpenChange, alternative,
}: { open: boolean; onOpenChange: (v: boolean) => void; alternative: ChangeAlternative | null }) {
  if (!alternative) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{alternative.label} · {alternative.title}</DialogTitle>
          <DialogDescription className="text-[11.5px]">{alternative.expectedBenefit}</DialogDescription>
        </DialogHeader>
        <dl className="rounded border border-slate-200 bg-white p-2">
          <Row label="Expected Benefit" value={alternative.expectedBenefit} />
          <Row label="Persona Impact" value={alternative.personaImpact} />
          <Row label="Customer Impact" value={alternative.customerImpact} />
          <Row label="Operational Risk" value={alternative.operationalRisk} />
          <Row label="Fraud Risk" value={alternative.fraudRisk} />
          <Row label="Dependency Risk" value={alternative.dependencyRisk} />
          <Row label="Governance" value={alternative.governanceRequirements} />
          <Row label="Evidence" value={alternative.evidenceRequirements} />
          <Row label="Reversibility" value={alternative.reversibility} />
          <Row label="Complexity" value={alternative.complexity} />
          <Row label="Confidence" value={`${alternative.confidence}%`} />
        </dl>
        <p className="text-[10.5px] text-slate-500">
          Alternatives are compared on their own terms. Selection belongs to Decision Intelligence.
        </p>
      </DialogContent>
    </Dialog>
  );
}

export function ScenarioDetailDialog({
  open, onOpenChange, scenario, proposal,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  scenario: PersonaImpactScenario | null; proposal: ProposalState;
}) {
  if (!scenario) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{scenario.name}</DialogTitle>
          <DialogDescription className="text-[11.5px]">{scenario.description}</DialogDescription>
        </DialogHeader>
        <dl className="rounded border border-slate-200 bg-white p-2">
          <Row label="Retry Attempts" value={scenario.proposalParameters.retryAttempts} />
          <Row label="Traffic Exposure" value={`${scenario.trafficExposure}%`} />
          <Row label="Progressive Rollout" value={scenario.progressiveRollout ? "Enabled" : "Disabled"} />
          <Row label="Deployment Timing" value={scenario.deploymentTiming} />
          <Row label="Created At" value={scenario.createdAt} />
        </dl>
        <SimpleTable head={["Persona", "Impact Score", "Highest Severity", "Approval", "Evidence Sufficiency"]}
          rows={impactPersonas.map((p) => {
            const s = scenario.proposalParameters;
            void s; void proposal;
            return [p.name, "See comparison", "See comparison", "See comparison", "See comparison"];
          })} />
        <p className="text-[10.5px] text-slate-500">
          Conflicts under this scenario: {conflictsFor(scenario.proposalParameters).length}
        </p>
      </DialogContent>
    </Dialog>
  );
}
