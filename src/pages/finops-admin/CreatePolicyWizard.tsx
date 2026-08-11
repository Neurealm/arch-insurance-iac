// Create Optimization Policy wizard for the FinOps administration plane.
// Five steps: identity, scope, thresholds, approval & execution, review with a
// deterministic eligibility simulation against the current registry.

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Btn, KV, SubHead } from "./parts";
import { OPPORTUNITIES } from "./data";

const STEPS = ["Identity", "Scope", "Thresholds", "Approval & Execution", "Review & Simulate"];

export function CreatePolicyWizard({
  open, onClose, onPublished,
}: { open: boolean; onClose: () => void; onPublished: (name: string, mode: string) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [family, setFamily] = useState("Resource Rightsizing");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("AWS + Azure production accounts");
  const [environments, setEnvironments] = useState<string[]>(["Production"]);
  const [minSavings, setMinSavings] = useState(250);
  const [confidence, setConfidence] = useState(88);
  const [maxRisk, setMaxRisk] = useState("Medium");
  const [approval, setApproval] = useState("FinOps Lead + Application Owner");
  const [autonomy, setAutonomy] = useState("Approval-gated");
  const [channel, setChannel] = useState("Terraform");
  const [rollback, setRollback] = useState(true);

  const riskOrder = ["Very Low", "Low", "Medium", "High"];
  const eligible = useMemo(() => OPPORTUNITIES.filter((o) =>
    o.savings >= minSavings && o.confidence >= confidence && riskOrder.indexOf(o.risk) <= riskOrder.indexOf(maxRisk)
  ), [minSavings, confidence, maxRisk]);
  const eligibleValue = eligible.reduce((s, o) => s + o.savings, 0);

  if (!open) return null;
  const canAdvance = step !== 0 || name.trim().length >= 3;

  const toggleEnv = (e: string) =>
    setEnvironments((v) => (v.includes(e) ? v.filter((x) => x !== e) : [...v, e]));

  const publish = (mode: string) => {
    onPublished(name.trim() || "Untitled policy", mode);
    setStep(0); setName(""); setDescription("");
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Create Optimization Policy"
        className="absolute left-1/2 top-1/2 flex max-h-[88vh] w-[min(940px,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start gap-3 border-b border-slate-200 px-5 py-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">FinOps Administration</div>
            <h2 className="text-[17px] font-semibold text-slate-900">Create Optimization Policy</h2>
          </div>
          <button onClick={onClose} aria-label="Close wizard" className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </header>

        <ol className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 px-4 py-2">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button onClick={() => i <= step && setStep(i)} disabled={i > step}
                className={cn("rounded px-2 py-1 text-[11.5px] transition-colors",
                  i === step ? "bg-blue-600 font-medium text-white"
                    : i < step ? "text-blue-700 hover:bg-blue-50" : "text-slate-400")}>
                {i < step && <Check className="mr-1 inline h-3 w-3" />}{i + 1}. {s}
              </button>
            </li>
          ))}
        </ol>

        <div className="min-h-[300px] flex-1 overflow-y-auto px-5 py-4">
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Policy name" hint="Shown in approval records and audit history.">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Production compute rightsizing"
                  className="h-8 w-full rounded-md border border-slate-200 px-2 text-[12.5px]" />
              </Field>
              <Field label="Opportunity family">
                <Select value={family} onChange={setFamily} options={["Resource Rightsizing", "Commitment Optimization", "Elasticity & Scheduling", "Storage Lifecycle", "Kubernetes Economics", "Network & Data Movement", "Orphaned Resources", "Platform & Architecture Efficiency"]} />
              </Field>
              <Field label="Purpose" className="sm:col-span-2" hint="Recorded on every decision this policy governs.">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  placeholder="Reduce sustained overprovisioning in production compute while preserving SLO headroom."
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[12.5px]" />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Account scope">
                <Select value={scope} onChange={setScope} options={["AWS + Azure production accounts", "All connected accounts", "AWS only", "Azure only", "Kubernetes clusters", "Non-production estate"]} />
              </Field>
              <Field label="Environments">
                <div className="flex flex-wrap gap-1.5">
                  {["Production", "Staging", "Development", "Sandbox"].map((e) => (
                    <button key={e} onClick={() => toggleEnv(e)}
                      className={cn("rounded-full border px-2.5 py-1 text-[11.5px] transition-colors",
                        environments.includes(e) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
                      {e}
                    </button>
                  ))}
                </div>
              </Field>
              <p className="sm:col-span-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11.5px] leading-relaxed text-slate-600">
                Scope determines which resources are evaluated. Resources outside scope are never surfaced by this policy, even when
                another policy would consider them eligible.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Minimum monthly savings" hint="Suppresses low-value change requests.">
                <input type="number" min={0} step={50} value={minSavings} onChange={(e) => setMinSavings(Number(e.target.value))}
                  className="h-8 w-full rounded-md border border-slate-200 px-2 text-[12.5px]" />
              </Field>
              <Field label={`Confidence threshold (${confidence}%)`} hint="Evidence bar before routing for action.">
                <input type="range" min={50} max={99} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="w-full" />
              </Field>
              <Field label="Maximum risk class">
                <Select value={maxRisk} onChange={setMaxRisk} options={["Very Low", "Low", "Medium", "High"]} />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Approval requirement">
                <Select value={approval} onChange={setApproval} options={["Auto-approved under autonomy policy", "FinOps Lead", "FinOps Lead + Application Owner", "FinOps Lead + Finance Controller", "Architecture Review Board"]} />
              </Field>
              <Field label="Autonomy">
                <Select value={autonomy} onChange={setAutonomy} options={["Approval-gated", "Autonomous within blast radius", "Detect only (no execution)"]} />
              </Field>
              <Field label="Execution channel">
                <Select value={channel} onChange={setChannel} options={["Terraform", "AWS API", "Azure API", "Kubernetes GitOps", "GitHub Pull Request", "Scheduler"]} />
              </Field>
              <Field label="Rollback readiness">
                <label className="flex items-center gap-2 text-[12.5px] text-slate-700">
                  <input type="checkbox" checked={rollback} onChange={(e) => setRollback(e.target.checked)} />
                  Require a verified rollback path before execution
                </label>
              </Field>
              {!rollback && (
                <p className="sm:col-span-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] text-amber-900">
                  Without rollback readiness this policy cannot execute against Tier-1 production services; execution risk policy will block it.
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <KV rows={[
                ["Policy name", name || "—"], ["Family", family], ["Scope", scope],
                ["Environments", environments.join(", ") || "None selected"],
                ["Minimum savings", `$${minSavings.toLocaleString()} / month`],
                ["Confidence threshold", `${(confidence / 100).toFixed(2)}`],
                ["Maximum risk", maxRisk], ["Approval", approval], ["Autonomy", autonomy],
                ["Execution channel", channel], ["Rollback", rollback ? "Required" : "Not required"],
              ]} />
              <SubHead>Eligibility simulation against the current registry</SubHead>
              <div className="rounded-md border border-slate-200">
                <div className="flex flex-wrap gap-4 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[12px]">
                  <span><span className="text-slate-500">Eligible opportunity groups: </span><span className="font-semibold tabular-nums text-slate-900">{eligible.length}</span></span>
                  <span><span className="text-slate-500">Addressable monthly savings: </span><span className="font-semibold tabular-nums text-emerald-700">${eligibleValue.toLocaleString()}</span></span>
                  <span><span className="text-slate-500">Suppressed by thresholds: </span><span className="font-semibold tabular-nums text-slate-900">{OPPORTUNITIES.length - eligible.length}</span></span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {eligible.length === 0 && <li className="px-3 py-3 text-[12px] text-slate-500">No current opportunity satisfies these thresholds. Loosen confidence or minimum savings to make this policy actionable.</li>}
                  {eligible.map((o) => (
                    <li key={o.id} className="flex items-center gap-3 px-3 py-1.5 text-[12px]">
                      <span className="w-[70px] shrink-0 font-mono text-[11px] text-slate-500">{o.id}</span>
                      <span className="min-w-0 flex-1 truncate text-slate-800">{o.type} — {o.scope}</span>
                      <span className="tabular-nums text-slate-600">{o.confidence}%</span>
                      <span className="w-[74px] text-right font-medium tabular-nums text-slate-900">${o.savings.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center gap-2 border-t border-slate-200 px-5 py-3">
          <Btn onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Btn>
          <div className="flex-1" />
          {step === STEPS.length - 1 ? (
            <>
              <Btn onClick={() => publish("Draft")}>Save as Draft</Btn>
              <Btn variant="primary" onClick={() => publish("Activate")} disabled={eligible.length === 0 && environments.length === 0}>Publish & Activate</Btn>
            </>
          ) : (
            <Btn variant="primary" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}
              title={!canAdvance ? "Provide a policy name of at least three characters." : undefined}>Continue</Btn>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[11.5px] font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[12.5px] text-slate-800">
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}
