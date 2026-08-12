// Seven-step routing policy creation wizard: task class, capability
// requirements, constraints, strategy, fallback, validation, publication.

import { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X, Check, Loader2, AlertTriangle } from "lucide-react";
import { Btn, SubHead, KV, StatePill } from "./parts";
import { MODELS } from "./data";

const STEPS = ["Task Class", "Capabilities", "Constraints", "Strategy", "Fallback", "Validate", "Publish"];

const TASK_CLASSES = [
  "High Reasoning", "Summarization", "Extraction", "Classification", "Coding",
  "Vision", "Long Context", "Tool Execution", "Low Latency", "Regulated", "Custom",
];

const SIMULATION = [
  { req: "SIM-001", task: "Analyze underwriting risk evidence", selected: "GPT-5 Enterprise", note: "Eligible · composite 92.4", ok: true },
  { req: "SIM-002", task: "Summarize 212K submission bundle", selected: "GPT-5 Enterprise", note: "Context re-ranked to 128K", ok: true },
  { req: "SIM-003", task: "Classify EU regulated intake", selected: "—", note: "Rejected · no EU deployment satisfies safety profile", ok: false },
  { req: "SIM-004", task: "Extract policy schedule fields", selected: "GPT-5 Enterprise", note: "Eligible · composite 89.1", ok: true },
];

export function RoutingPolicyWizard({
  open, onClose, onPublished,
}: { open: boolean; onClose: () => void; onPublished: (name: string) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("New Routing Policy");
  const [taskClass, setTaskClass] = useState("High Reasoning");
  const [tier, setTier] = useState("Advanced");
  const [strategy, setStrategy] = useState("Balanced");
  const [primary, setPrimary] = useState("GPT-5 Enterprise");
  const [fb1, setFb1] = useState("Claude Sonnet");
  const [fb2, setFb2] = useState("GPT-5 Mini");
  const [running, setRunning] = useState(false);
  const [simDone, setSimDone] = useState(false);
  const [publish, setPublish] = useState("Draft");

  if (!open) return null;
  const close = () => { setStep(0); setSimDone(false); setRunning(false); onClose(); };

  const simulate = () => {
    setRunning(true);
    window.setTimeout(() => { setRunning(false); setSimDone(true); }, 1100);
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-900/40 p-4">
      <div role="dialog" aria-modal="true" aria-label="Create routing policy"
        className="flex max-h-[86vh] w-full max-w-[880px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start gap-3 border-b border-slate-200 px-5 py-3">
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Routing Policies</div>
            <h2 className="text-[16px] font-semibold text-slate-900">Create Routing Policy</h2>
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
              <label className="block max-w-sm">
                <span className="text-[11px] font-medium text-slate-600">Policy name</span>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-[12px] outline-none focus:border-blue-400" />
              </label>
              <SubHead>Task class</SubHead>
              <div className="flex flex-wrap gap-1.5">
                {TASK_CLASSES.map((t) => (
                  <button key={t} onClick={() => setTaskClass(t)}
                    className={cn("rounded-full border px-2.5 py-1 text-[11.5px] transition-colors",
                      taskClass === t ? "border-blue-500 bg-blue-50 font-medium text-blue-800" : "border-slate-200 text-slate-700 hover:bg-slate-50")}>
                    {t}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11.5px] leading-relaxed text-slate-600">
                The task class determines which requests this policy governs. A request is matched to exactly one policy at classification time.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Sel label="Minimum reasoning tier" value={tier} onChange={setTier} options={["Fast", "Balanced", "Advanced"]} />
              <Sel label="Required context" value="128K" onChange={() => {}} options={["32K", "64K", "128K", "200K", "400K"]} />
              <Sel label="Required modality" value="Text" onChange={() => {}} options={["Text", "Text, Vision", "Text, Vision, Audio"]} />
              <Sel label="Tool support" value="Required" onChange={() => {}} options={["Not required", "Required", "Approval-gated write tools"]} />
              <Sel label="Structured output" value="Required" onChange={() => {}} options={["Not required", "Required"]} />
              <Sel label="Language coverage" value="EN, FR, DE" onChange={() => {}} options={["EN", "EN, FR, DE", "Multilingual"]} />
              <Sel label="Latency ceiling" value="3.5s p95" onChange={() => {}} options={["1.2s p95", "2.5s p95", "3.5s p95", "No ceiling"]} />
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Sel label="Approved providers" value="OpenAI, Anthropic" onChange={() => {}} options={["All approved", "OpenAI, Anthropic", "Azure OpenAI only", "Internal Gateway only"]} />
              <Sel label="Approved models" value="Advanced tier only" onChange={() => {}} options={["All eligible", "Advanced tier only", "Named allow-list"]} />
              <Sel label="Regions" value="US / EU" onChange={() => {}} options={["US only", "EU only", "US / EU", "Global"]} />
              <Sel label="Data classifications" value="Up to Confidential" onChange={() => {}} options={["Public, Internal", "Up to Confidential", "Including Restricted"]} />
              <Sel label="Safety profile" value="High" onChange={() => {}} options={["High", "Medium or higher"]} />
              <Sel label="Cost ceiling" value="$0.18 / request" onChange={() => {}} options={["$0.01 / request", "$0.05 / request", "$0.18 / request", "$0.25 / request"]} />
            </div>
          )}

          {step === 3 && (
            <div>
              <SubHead>Routing strategy</SubHead>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {["Best quality", "Lowest cost", "Lowest latency", "Balanced", "Weighted custom"].map((s) => (
                  <button key={s} onClick={() => setStrategy(s)}
                    className={cn("rounded-md border px-3 py-2.5 text-left text-[12px] transition-colors",
                      strategy === s ? "border-blue-500 bg-blue-50 font-medium text-blue-800" : "border-slate-200 hover:bg-slate-50")}>
                    {s}
                  </button>
                ))}
              </div>
              <SubHead>Resulting composite weights</SubHead>
              <KV rows={strategy === "Lowest cost"
                ? [["Capability", "0.25"], ["Policy", "0.20"], ["Evaluation", "0.15"], ["Latency", "0.10"], ["Cost", "0.30"]]
                : strategy === "Lowest latency"
                ? [["Capability", "0.25"], ["Policy", "0.20"], ["Evaluation", "0.15"], ["Latency", "0.30"], ["Cost", "0.10"]]
                : strategy === "Best quality"
                ? [["Capability", "0.35"], ["Policy", "0.20"], ["Evaluation", "0.30"], ["Latency", "0.10"], ["Cost", "0.05"]]
                : [["Capability", "0.30"], ["Policy", "0.20"], ["Evaluation", "0.20"], ["Latency", "0.15"], ["Cost", "0.15"]]} />
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Sel label="Primary model" value={primary} onChange={setPrimary} options={MODELS.map((m) => m.name)} />
              <Sel label="Fallback 1" value={fb1} onChange={setFb1} options={["None", ...MODELS.map((m) => m.name)]} />
              <Sel label="Fallback 2" value={fb2} onChange={setFb2} options={["None", ...MODELS.map((m) => m.name)]} />
              <Sel label="Timeout" value="18s" onChange={() => {}} options={["6s", "12s", "18s", "30s"]} />
              <Sel label="Retries per hop" value="1" onChange={() => {}} options={["0", "1", "2"]} />
              <Sel label="Failover trigger" value="Timeout, 5xx, quota, safety rejection" onChange={() => {}}
                options={["Timeout only", "Timeout, 5xx", "Timeout, 5xx, quota, safety rejection"]} />
            </div>
          )}

          {step === 5 && (
            <div>
              <div className="flex items-center justify-between">
                <SubHead>Simulate requests against this policy</SubHead>
                <Btn variant="primary" onClick={simulate} disabled={running}>
                  {running ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Simulating…</> : "Run simulation"}
                </Btn>
              </div>
              {!simDone && !running && <p className="text-[11.5px] text-slate-600">Simulation replays a sample of recent requests through the draft policy and reports route decisions and policy failures.</p>}
              {simDone && (
                <div className="overflow-hidden rounded-md border border-slate-200">
                  {SIMULATION.map((s) => (
                    <div key={s.req} className="flex items-center gap-3 border-b border-slate-100 px-3 py-2 text-[11.5px] last:border-0">
                      <span className="w-16 font-mono text-slate-500">{s.req}</span>
                      <span className="flex-1 text-slate-700">{s.task}</span>
                      <span className="w-36 font-medium text-slate-800">{s.selected}</span>
                      <StatePill tone={s.ok ? "ok" : "bad"} label={s.ok ? "Routed" : "Policy failure"} />
                    </div>
                  ))}
                  <div className="flex items-start gap-2 bg-amber-50 px-3 py-2 text-[11.5px] text-amber-900">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    1 of 4 simulated requests could not be routed. Review the constraints before activation.
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 6 && (
            <div>
              <SubHead>Publication state</SubHead>
              <div className="flex gap-2">
                {["Draft", "Review", "Activate"].map((s) => (
                  <button key={s} onClick={() => setPublish(s)}
                    className={cn("rounded-md border px-3 py-2 text-[12px] transition-colors",
                      publish === s ? "border-blue-500 bg-blue-50 font-medium text-blue-800" : "border-slate-200 hover:bg-slate-50")}>
                    {s}
                  </button>
                ))}
              </div>
              <SubHead>Summary</SubHead>
              <KV rows={[
                ["Policy name", name], ["Task class", taskClass], ["Minimum reasoning tier", tier],
                ["Strategy", strategy], ["Primary model", primary], ["Fallback chain", `${fb1} → ${fb2}`],
                ["Simulation", simDone ? "3 of 4 routed, 1 policy failure" : "Not run"],
                ["Publication", publish],
              ]} />
            </div>
          )}
        </div>

        <footer className="flex items-center gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <span className="flex-1 text-[11.5px] text-slate-500">Step {step + 1} of {STEPS.length} · {STEPS[step]}</span>
          <Btn onClick={close}>Cancel</Btn>
          <Btn onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Btn>
          {step < STEPS.length - 1
            ? <Btn variant="primary" onClick={() => setStep((s) => s + 1)}>Continue</Btn>
            : <Btn variant="primary" onClick={() => { setStep(0); setSimDone(false); onPublished(`${name} · ${publish}`); }}>Publish Policy</Btn>}
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
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
