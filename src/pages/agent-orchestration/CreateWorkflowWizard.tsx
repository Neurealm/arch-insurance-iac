// Eight-step workflow / orchestration policy creation flow: identity, trigger,
// pattern, graph composition, state, policies, validation simulation, publish.

import { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X, Check, Loader2, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Btn, SubHead, KV, StatePill } from "./parts";
import { PATTERNS, PLANNING_BOUNDS, STATE_STORES, TOOL_BINDINGS } from "./data";

const STEPS = ["Identity", "Trigger", "Pattern", "Graph", "State", "Policies", "Validation", "Publish"];

const STEP_TYPES = ["Context Load", "Agent", "Model", "Decision", "Tool", "Human Review", "Approval", "Validation", "Wait", "Parallel", "Join", "Escalation", "Close"];

const TRIGGERS = ["Event", "Schedule", "API", "Human request", "Alert", "Agent event", "Change", "Webhook"];

const VALIDATIONS = [
  { id: "schema", label: "Schema validation", detail: "All node input and output contracts resolve against registered schemas." },
  { id: "tool", label: "Tool simulation", detail: "Tool bindings reachable; no production side effects executed." },
  { id: "policy", label: "Policy simulation", detail: "Sequencing, approval, retry and tool policies evaluated against the graph." },
  { id: "failure", label: "Failure simulation", detail: "Retry exhaustion, timeout, and non-retryable paths reach a terminal state." },
  { id: "approval", label: "Approval simulation", detail: "Every gate has at least one authorized approver and a timeout behaviour." },
];

export function CreateWorkflowWizard({
  open, onClose, onPublished,
}: { open: boolean; onClose: () => void; onPublished: (name: string, mode: string) => void }) {
  const [step, setStep] = useState(0);
  const [artifact, setArtifact] = useState<"workflow" | "policy">("workflow");
  const [name, setName] = useState("New Orchestration Workflow");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("RunOps");
  const [owner, setOwner] = useState("RunOps Platform Team");
  const [risk, setRisk] = useState("Medium");
  const [environment, setEnvironment] = useState("Production");
  const [trigger, setTrigger] = useState("Alert");
  const [source, setSource] = useState("Datadog / ServiceNow event bus");
  const [filters, setFilters] = useState("priority <= P2");
  const [correlation, setCorrelation] = useState("incident_id");
  const [dedup, setDedup] = useState("15 minutes");
  const [priority, setPriority] = useState("P2");
  const [pattern, setPattern] = useState("Conditional");
  const [nodes, setNodes] = useState<string[]>(["Context Load", "Agent", "Decision", "Approval", "Tool", "Validation", "Close"]);
  const [store, setStore] = useState("PostgreSQL");
  const [retention, setRetention] = useState("30 days");
  const [checkpoint, setCheckpoint] = useState("After every step");
  const [idempotency, setIdempotency] = useState(true);
  const [retries, setRetries] = useState("3");
  const [timeout, setTimeoutValue] = useState("90 seconds");
  const [approvalRole, setApprovalRole] = useState("SRE Lead");
  const [toolBinding, setToolBinding] = useState("Terraform");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Record<string, "pass" | "warn"> | null>(null);
  const [publishState, setPublishState] = useState("Draft");

  if (!open) return null;

  const close = () => { setStep(0); setResults(null); setRunning(false); onClose(); };

  const runValidation = () => {
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      setResults({
        schema: "pass", tool: "pass", policy: "pass",
        failure: idempotency ? "pass" : "warn",
        approval: "pass",
      });
    }, 1200);
  };

  const canAdvance = step !== 6 || !!results;

  return createPortal(
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-900/40 p-4">
      <div role="dialog" aria-modal="true" aria-label="Create workflow or orchestration policy"
        className="flex max-h-[88vh] w-full max-w-[900px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start gap-3 border-b border-slate-200 px-5 py-3">
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Agent Orchestration</div>
            <h2 className="text-[16px] font-semibold text-slate-900">Create Workflow / Orchestration Policy</h2>
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
            <div className="space-y-3">
              <div className="flex gap-2">
                {(["workflow", "policy"] as const).map((a) => (
                  <button key={a} onClick={() => setArtifact(a)}
                    className={cn("flex-1 rounded-md border px-3 py-2 text-left transition-colors",
                      artifact === a ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:bg-slate-50")}>
                    <div className="text-[12.5px] font-semibold text-slate-800">{a === "workflow" ? "Orchestration Workflow" : "Orchestration Policy"}</div>
                    <p className="text-[11px] text-slate-600">{a === "workflow" ? "Versioned execution graph with participants, transitions and completion conditions." : "Reusable rule set applied across workflows: sequencing, retry, approval, handoff, tool invocation, risk."}</p>
                  </button>
                ))}
              </div>
              <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
              <Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                placeholder="What objective does this coordinate, and what does completion mean?" className={cn(inputCls, "h-auto py-1.5")} /></Field>
              <div className="grid gap-3 sm:grid-cols-4">
                <Field label="Domain"><Select value={domain} onChange={setDomain} options={["Insurance", "FinOps", "RunOps", "SRE", "Security", "Support"]} /></Field>
                <Field label="Owner"><Select value={owner} onChange={setOwner} options={["RunOps Platform Team", "Security Engineering", "Cloud FinOps Team", "SRE Governance"]} /></Field>
                <Field label="Risk class"><Select value={risk} onChange={setRisk} options={["Low", "Medium", "High"]} /></Field>
                <Field label="Environment"><Select value={environment} onChange={setEnvironment} options={["Production", "Staging", "Sandbox"]} /></Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <SubHead>Trigger class</SubHead>
              <div className="flex flex-wrap gap-1.5">
                {TRIGGERS.map((t) => (
                  <button key={t} onClick={() => setTrigger(t)}
                    className={cn("rounded-md border px-2.5 py-1 text-[11.5px]", trigger === t ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>{t}</button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Source system"><input value={source} onChange={(e) => setSource(e.target.value)} className={inputCls} /></Field>
                <Field label="Filter condition"><input value={filters} onChange={(e) => setFilters(e.target.value)} className={cn(inputCls, "font-mono text-[11px]")} /></Field>
                <Field label="Correlation key"><input value={correlation} onChange={(e) => setCorrelation(e.target.value)} className={cn(inputCls, "font-mono text-[11px]")} /></Field>
                <Field label="Deduplication window"><Select value={dedup} onChange={setDedup} options={["None", "5 minutes", "15 minutes", "60 minutes"]} /></Field>
                <Field label="Priority"><Select value={priority} onChange={setPriority} options={["P1", "P2", "P3", "P4"]} /></Field>
              </div>
              <p className="text-[11px] text-slate-500">Tenant eligibility is enforced at intake; a trigger that resolves to an ineligible tenant is rejected before a run is created.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              {PATTERNS.map((p) => (
                <button key={p.id} onClick={() => setPattern(p.name.replace(" Flow", "").replace("-Orchestrated", ""))}
                  className={cn("w-full rounded-md border px-3 py-2 text-left transition-colors",
                    pattern === p.name.replace(" Flow", "").replace("-Orchestrated", "") ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:bg-slate-50")}>
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-semibold text-slate-800">{p.name}</span>
                    <span className="ml-auto text-[10.5px] text-slate-500">Planning freedom: {p.freedom}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{p.detail} Example: {p.example}.</p>
                </button>
              ))}
              <SubHead>Planning bounds applied to this workflow</SubHead>
              <KV rows={PLANNING_BOUNDS} />
              <p className="text-[11px] text-slate-500">Bounds prevent uncontrolled autonomous planning: the planner may only compose approved step templates within these maximums.</p>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-3 sm:grid-cols-[190px_1fr]">
              <div>
                <SubHead>Approved step types</SubHead>
                <div className="space-y-1">
                  {STEP_TYPES.map((t) => (
                    <button key={t} onClick={() => setNodes((n) => [...n, t])}
                      className="flex w-full items-center gap-1.5 rounded border border-slate-200 px-2 py-1 text-left text-[11.5px] text-slate-700 hover:border-blue-300 hover:bg-blue-50">
                      <Plus className="h-3 w-3 text-slate-400" />{t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <SubHead>Execution sequence ({nodes.length} steps)</SubHead>
                <ol className="space-y-1">
                  {nodes.map((n, i) => (
                    <li key={`${n}-${i}`} className="flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">{i + 1}</span>
                      <span className="flex-1 text-[12px] text-slate-800">{n}</span>
                      <span className="text-[10.5px] text-slate-500">
                        {n === "Tool" ? "authority: gateway" : n === "Approval" ? "authority: human" : n === "Agent" ? "authority: analysis" : "authority: platform"}
                      </span>
                      <button onClick={() => setNodes((v) => v.filter((_, ix) => ix !== i))} aria-label={`Remove ${n}`}
                        className="text-slate-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </li>
                  ))}
                </ol>
                {nodes.some((n) => n === "Tool") && !nodes.some((n) => n === "Approval") && (
                  <p className="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-900">
                    A Tool step exists without an Approval step. Production tool execution requires an approval gate.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <SubHead>Durable state store</SubHead>
              <div className="grid gap-2 sm:grid-cols-2">
                {STATE_STORES.map((s) => (
                  <button key={s.id} onClick={() => setStore(s.name)}
                    className={cn("rounded-md border px-3 py-2 text-left", store === s.name ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:bg-slate-50")}>
                    <div className="text-[12px] font-semibold text-slate-800">{s.name}</div>
                    <p className="text-[11px] text-slate-600">{s.role} · {s.durability}</p>
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Checkpoint policy"><Select value={checkpoint} onChange={setCheckpoint} options={["After every step", "After side-effect steps only", "At branch boundaries"]} /></Field>
                <Field label="State retention"><Select value={retention} onChange={setRetention} options={["7 days", "30 days", "90 days", "365 days"]} /></Field>
                <Field label="Resume policy"><Select value="Resume from last checkpoint" onChange={() => {}} options={["Resume from last checkpoint", "Restart run", "Escalate to human"]} /></Field>
              </div>
              <label className="flex items-center gap-2 text-[12px] text-slate-700">
                <input type="checkbox" checked={idempotency} onChange={(e) => setIdempotency(e.target.checked)} />
                Require an idempotency key on every side-effect step before automatic retry is permitted
              </label>
              <p className="text-[11px] text-slate-500">Workflow state is coordination data. Longer-lived agent or business memory is governed by the Context / Evidence Layer, not here.</p>
            </div>
          )}

          {step === 5 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Maximum retries"><Select value={retries} onChange={setRetries} options={["0", "1", "2", "3", "5"]} /></Field>
              <Field label="Step timeout"><Select value={timeout} onChange={setTimeoutValue} options={["30 seconds", "60 seconds", "90 seconds", "5 minutes"]} /></Field>
              <Field label="Approval role"><Select value={approvalRole} onChange={setApprovalRole} options={["SRE Lead", "Change Manager", "Security Lead", "FinOps Lead"]} /></Field>
              <Field label="Primary tool binding"><Select value={toolBinding} onChange={setToolBinding} options={TOOL_BINDINGS.map((t) => t.name)} /></Field>
              <div className="sm:col-span-2">
                <SubHead>Derived policy set</SubHead>
                <KV rows={[
                  ["Handoff", `Agent → Agent requires confidence ≥ 0.70 and evidence ≥ 0.80`],
                  ["Approval", `${approvalRole} · explicit · escalate on timeout, never auto-approve`],
                  ["Retry", `${retries} attempts, exponential backoff 2s → 10s → 30s`],
                  ["Execution risk", `${risk} — ${risk === "High" ? "approval, rollback plan and validation required" : "approval required for production writes"}`],
                  ["Security", `${TOOL_BINDINGS.find((t) => t.name === toolBinding)?.mode ?? "Connector"} invocation via ${TOOL_BINDINGS.find((t) => t.name === toolBinding)?.gateway ?? "managed gateway"}`],
                ]} />
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <div className="flex items-center gap-2">
                <Btn variant="primary" onClick={runValidation} disabled={running}>
                  {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}{running ? "Running validation…" : "Run validation suite"}
                </Btn>
                <span className="text-[11.5px] text-slate-500">No production tool execution occurs during validation.</span>
              </div>
              <div className="mt-3 space-y-1.5">
                {VALIDATIONS.map((v) => {
                  const r = results?.[v.id];
                  return (
                    <div key={v.id} className="flex items-start gap-2 rounded-md border border-slate-200 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-medium text-slate-800">{v.label}</div>
                        <p className="text-[11px] text-slate-600">{v.detail}</p>
                        {r === "warn" && <p className="mt-1 text-[11px] text-amber-800">Side-effect step permits retry without an idempotency key. Enable the idempotency requirement in the State step.</p>}
                      </div>
                      {r ? <StatePill tone={r === "pass" ? "ok" : "warn"} label={r === "pass" ? "Passed" : "Warning"} /> : <span className="text-[11px] text-slate-400">Not run</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-3">
              <KV rows={[
                ["Artifact", artifact === "workflow" ? "Orchestration Workflow" : "Orchestration Policy"],
                ["Name", name], ["Domain", domain], ["Owner", owner], ["Risk class", risk], ["Environment", environment],
                ["Trigger", `${trigger} · ${source}`], ["Pattern", pattern], ["Steps", `${nodes.length}`],
                ["State store", store], ["Checkpoint", checkpoint], ["Retention", retention],
                ["Retries", retries], ["Approval role", approvalRole], ["Tool binding", toolBinding],
                ["Validation", results ? "Suite executed" : "Not run"],
              ]} />
              <SubHead>Publication state</SubHead>
              <div className="flex gap-2">
                {["Draft", "Review", "Activate"].map((s) => (
                  <button key={s} onClick={() => setPublishState(s)}
                    className={cn("rounded-md border px-3 py-1.5 text-[12px]", publishState === s ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>{s}</button>
                ))}
              </div>
              {results && Object.values(results).includes("warn") && publishState === "Activate" && (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-[11.5px] text-amber-900">Activating with an open validation warning records an accepted-risk entry in the audit ledger.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="flex items-center gap-2 border-t border-slate-200 bg-slate-50 px-5 py-2.5">
          <span className="flex-1 text-[11.5px] text-slate-500">Step {step + 1} of {STEPS.length}</span>
          <Btn onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Btn>
          {step < STEPS.length - 1 ? (
            <Btn variant="primary" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>Continue</Btn>
          ) : (
            <Btn variant="primary" onClick={() => { onPublished(name, publishState); close(); }}>
              {publishState === "Activate" ? "Activate workflow" : `Save as ${publishState}`}
            </Btn>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  );
}

const inputCls = "mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-[12px] outline-none focus:border-blue-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[11px] font-medium text-slate-600">{label}</span>{children}</label>;
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}
