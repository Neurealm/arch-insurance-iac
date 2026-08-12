// Six-step provider / model registration wizard. Credentials are always
// referenced from the tenant vault; raw secrets are never entered or displayed.

import { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X, Check, Loader2, ShieldCheck } from "lucide-react";
import { Btn, SubHead, KV } from "./parts";

const STEPS = ["Select Provider", "Provider Connection", "Discover Models", "Tenant Eligibility", "Evaluation", "Activate"];

const PROVIDERS = [
  "OpenAI", "Anthropic", "Google", "Azure OpenAI", "AWS Bedrock",
  "Internal Gateway", "Custom OpenAI-Compatible API", "Other REST Provider",
];

const DISCOVERED = [
  { id: "gpt-5-enterprise", label: "gpt-5-enterprise", ctx: "256K", tier: "Advanced" },
  { id: "gpt-5-mini", label: "gpt-5-mini", ctx: "128K", tier: "Balanced" },
  { id: "gpt-5-nano", label: "gpt-5-nano", ctx: "64K", tier: "Fast" },
  { id: "text-embedding-4", label: "text-embedding-4", ctx: "8K", tier: "Fast" },
];

const TESTS = [
  "Connection test", "Latency test", "Token test", "Safety validation",
  "Structured output test", "Tool invocation test", "Regional routing test",
];

export function AddProviderWizard({
  open, onClose, onActivated,
}: { open: boolean; onClose: () => void; onActivated: (name: string) => void }) {
  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState("OpenAI");
  const [auth, setAuth] = useState("Managed identity (no static secret)");
  const [region, setRegion] = useState("US-East");
  const [selected, setSelected] = useState<string[]>(["gpt-5-enterprise"]);
  const [safety, setSafety] = useState("High");
  const [maxContext, setMaxContext] = useState("128K");
  const [maxCost, setMaxCost] = useState("$0.18");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<string[]>([]);

  if (!open) return null;

  const reset = () => { setStep(0); setRunning(false); setDone([]); setSelected(["gpt-5-enterprise"]); };
  const close = () => { reset(); onClose(); };

  const runTests = () => {
    setRunning(true); setDone([]);
    TESTS.forEach((t, i) => window.setTimeout(() => {
      setDone((d) => [...d, t]);
      if (i === TESTS.length - 1) setRunning(false);
    }, 320 * (i + 1)));
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-900/40 p-4">
      <div role="dialog" aria-modal="true" aria-label="Add provider or model"
        className="flex max-h-[86vh] w-full max-w-[880px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start gap-3 border-b border-slate-200 px-5 py-3">
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Model Registry</div>
            <h2 className="text-[16px] font-semibold text-slate-900">Add Provider / Model</h2>
          </div>
          <button onClick={close} aria-label="Close wizard" className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </header>

        <ol className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 px-5 py-2">
          {STEPS.map((s, i) => (
            <li key={s} className={cn("flex items-center gap-1.5 rounded px-2 py-1 text-[11.5px]",
              i === step ? "bg-blue-600 font-medium text-white" : i < step ? "text-emerald-700" : "text-slate-500")}>
              <span className={cn("grid h-4 w-4 place-items-center rounded-full text-[9px] font-semibold",
                i === step ? "bg-white/25" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600")}>
                {i < step ? <Check className="h-2.5 w-2.5" /> : i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 0 && (
            <div>
              <SubHead>Select the inference platform to register</SubHead>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {PROVIDERS.map((p) => (
                  <button key={p} onClick={() => setProvider(p)}
                    className={cn("rounded-md border px-3 py-2.5 text-left text-[12px] transition-colors",
                      provider === p ? "border-blue-500 bg-blue-50 font-medium text-blue-800" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50")}>
                    {p}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11.5px] leading-relaxed text-slate-600">
                Registration adds the provider to the tenant control plane. Models become routable only after eligibility and evaluation are completed.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Provider account" value="dual-insurance-prod" />
              <Select label="Authentication method" value={auth} onChange={setAuth}
                options={["Managed identity (no static secret)", "Workload identity federation", "Vault credential reference", "mTLS client certificate"]} />
              <Field label="Credential reference" value="vault://tenant/dual/inference/openai" mono />
              <Field label="Gateway" value="gateway.neugain.io/inference" mono />
              <Select label="Primary region" value={region} onChange={setRegion} options={["US-East", "US-West", "EU-West", "EU-North", "APAC-SE"]} />
              <Field label="Endpoint" value="https://gateway.neugain.io/inference/openai/v1" mono />
              <Select label="Network route" value="Private endpoint" onChange={() => {}} options={["Private endpoint", "Private link", "VPC endpoint", "Public egress (blocked by policy)"]} />
              <Field label="TLS" value="TLS 1.3 · certificate pinned" />
              <Field label="Credential rotation" value="Every 30 days, automated" />
              <div className="sm:col-span-2 flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <p className="text-[11.5px] leading-relaxed text-slate-600">
                  Secrets are never entered, stored, or displayed in this console. Only vault references are held in the model registry.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <SubHead>Deployments discovered from {provider}</SubHead>
              <div className="overflow-hidden rounded-md border border-slate-200">
                {DISCOVERED.map((m) => {
                  const on = selected.includes(m.id);
                  return (
                    <label key={m.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 text-[12px] last:border-0 hover:bg-slate-50">
                      <input type="checkbox" checked={on}
                        onChange={() => setSelected((s) => on ? s.filter((x) => x !== m.id) : [...s, m.id])} />
                      <span className="flex-1 font-medium text-slate-800">{m.label}</span>
                      <span className="text-slate-500">Context {m.ctx}</span>
                      <span className="w-20 text-right text-slate-500">{m.tier}</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-2 text-[11.5px] text-slate-600">{selected.length} deployment(s) selected for registration.</p>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Allowed regions" value={region} onChange={setRegion} options={["US only", "EU only", "US-East", "US / EU", "Global"]} />
              <Select label="Allowed data classifications" value="Public, Internal, Confidential" onChange={() => {}}
                options={["Public, Internal", "Public, Internal, Confidential", "All including Restricted"]} />
              <Select label="Allowed business domains" value="Underwriting, Claims" onChange={() => {}}
                options={["All domains", "Underwriting, Claims", "IT Operations", "Finance"]} />
              <Select label="Safety profile" value={safety} onChange={setSafety} options={["High", "Medium", "Standard"]} />
              <Select label="Maximum tenant context" value={maxContext} onChange={setMaxContext} options={["32K", "64K", "128K", "200K", "400K"]} />
              <Select label="Maximum cost per request" value={maxCost} onChange={setMaxCost} options={["$0.01", "$0.05", "$0.18", "$0.25"]} />
              <Select label="Allowed modalities" value="Text, Vision" onChange={() => {}} options={["Text", "Text, Vision", "Text, Vision, Audio"]} />
              <Select label="Tool invocation" value="Read-only tools" onChange={() => {}} options={["Disabled", "Read-only tools", "Approval-gated write tools"]} />
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="flex items-center justify-between">
                <SubHead>Registration validation suite</SubHead>
                <Btn onClick={runTests} disabled={running} variant="primary">
                  {running ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Running…</> : "Run validation"}
                </Btn>
              </div>
              <ul className="mt-1 space-y-1">
                {TESTS.map((t) => {
                  const ok = done.includes(t);
                  return (
                    <li key={t} className="flex items-center gap-2 rounded border border-slate-200 px-3 py-1.5 text-[12px]">
                      <span className={cn("grid h-4 w-4 place-items-center rounded-full",
                        ok ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>
                        {ok ? <Check className="h-2.5 w-2.5" /> : running ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : null}
                      </span>
                      <span className="flex-1 text-slate-700">{t}</span>
                      <span className={cn("text-[11px]", ok ? "text-emerald-700" : "text-slate-400")}>{ok ? "Passed" : "Pending"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {step === 5 && (
            <div>
              <SubHead>Review configuration</SubHead>
              <KV rows={[
                ["Provider", provider], ["Authentication", auth], ["Primary region", region],
                ["Deployments", `${selected.length} selected`], ["Safety profile", safety],
                ["Maximum tenant context", maxContext], ["Maximum cost / request", maxCost],
                ["Validation", `${done.length} of ${TESTS.length} tests passed`],
              ]} />
              <p className="mt-3 text-[11.5px] leading-relaxed text-slate-600">
                Activation registers the deployments in the tenant model registry and makes them available for routing evaluation.
                They will not receive traffic until a routing policy declares them eligible.
              </p>
            </div>
          )}
        </div>

        <footer className="flex items-center gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <span className="flex-1 text-[11.5px] text-slate-500">Step {step + 1} of {STEPS.length} · {STEPS[step]}</span>
          <Btn onClick={close}>Cancel</Btn>
          <Btn onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Btn>
          {step < STEPS.length - 1 ? (
            <Btn variant="primary" onClick={() => setStep((s) => s + 1)}>Continue</Btn>
          ) : (
            <Btn variant="primary" onClick={() => { const n = `${provider} · ${selected.length} deployment(s)`; reset(); onActivated(n); }}>
              Activate Provider / Model
            </Btn>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-slate-600">{label}</span>
      <input defaultValue={value} className={cn("mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[12px] text-slate-800 outline-none focus:border-blue-400", mono && "font-mono text-[11px]")} />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-slate-600">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[12px] text-slate-800 outline-none focus:border-blue-400">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
