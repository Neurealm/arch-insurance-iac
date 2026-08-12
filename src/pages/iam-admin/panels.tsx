// Interactive engineering panels for the IAM administration plane: the access
// policy simulator, the global "/" search palette, and the create digital
// coworker identity wizard.

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { Btn, KV, SubHead, StatePill, Panel } from "./parts";
import { CheckList } from "./drawers";
import {
  SIM_ACTIONS, SIM_IDENTITIES, SIM_RESOURCES, SIM_ROLE_CEILING, SEARCH_INDEX,
  classAtOrBelow, type SearchItem,
} from "./data";

/* ------------------------------- simulator -------------------------------- */

type Check = { label: string; result: "PASS" | "FAIL" | "NOT PRESENT" };

export function PolicySimulator({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [identity, setIdentity] = useState(SIM_IDENTITIES[0]);
  const [action, setAction] = useState(SIM_ACTIONS[0]);
  const [resource, setResource] = useState(SIM_RESOURCES[0].label);
  const [region, setRegion] = useState("US");
  const [sessionAge, setSessionAge] = useState(20);
  const [approval, setApproval] = useState(false);
  const [workflow, setWorkflow] = useState(false);
  const [result, setResult] = useState<{ outcome: string; checks: Check[]; reason: string } | null>(null);

  const evaluate = () => {
    const role = SIM_ROLE_CEILING[identity];
    const res = SIM_RESOURCES.find((r) => r.label === resource)!;
    const checks: Check[] = [];
    const push = (label: string, ok: boolean) => checks.push({ label, result: ok ? "PASS" : "FAIL" });

    push("Identity lifecycle state is active", true);
    push("Credential is valid and unexpired", true);
    push(`Resource domain (${res.domain}) is inside role domain scope`, role.domains.includes(res.domain));
    push(`Resource classification (${res.classification}) is at or below ceiling (${role.ceiling})`,
      classAtOrBelow(res.classification, role.ceiling));
    push(`Region ${region} is permitted`, region === "US");
    push(`Session age ${sessionAge}m is below the 60 minute ceiling`, sessionAge < 60);

    const mutating = ["Write", "Modify", "Execute", "Delete"].includes(action);
    if (action === "Delete") push("Destructive action is permitted for this identity class", false);
    else if (mutating) {
      push(`Role permits ${action} actions`, action === "Write" ? role.write : role.modify);
      checks.push({ label: "Workflow binding present", result: workflow ? "PASS" : "NOT PRESENT" });
      checks.push({ label: "Human approval reference present", result: approval ? "PASS" : "NOT PRESENT" });
    } else push(`Role permits ${action} actions`, true);

    const failed = checks.filter((c) => c.result === "FAIL");
    const missing = checks.filter((c) => c.result === "NOT PRESENT");
    const outcome = failed.length ? "DENY" : missing.length ? "APPROVAL REQUIRED" : "ALLOW";
    const reason = failed.length
      ? `Denied: ${failed[0].label.replace(/^([A-Z])/, (m) => m.toLowerCase())} did not hold.`
      : missing.length
        ? "Entitlement is present but the request requires a workflow binding and an approval reference before execution."
        : `Allowed: ${identity} holds ${action} entitlement for this resource and every runtime condition was satisfied.`;
    setResult({ outcome, checks, reason });
  };

  useEffect(() => { if (!open) setResult(null); }, [open]);
  if (!open) return null;

  const sel = "h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[12px] text-slate-800";

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Access policy simulator"
        className="absolute left-1/2 top-1/2 w-[min(880px,94vw)] max-h-[88vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Simulation</div>
            <h2 className="text-[16px] font-semibold text-slate-900">Access Policy Simulator</h2>
            <p className="mt-0.5 text-[11.5px] text-slate-500">
              Evaluates a hypothetical request against role entitlement, policy conditions and runtime context. No access is granted.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close simulator" className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid gap-4 p-4 lg:grid-cols-2">
          <div className="space-y-2.5">
            <label className="block text-[11px] font-medium text-slate-600">Identity
              <select className={sel} value={identity} onChange={(e) => setIdentity(e.target.value)}>
                {SIM_IDENTITIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </label>
            <label className="block text-[11px] font-medium text-slate-600">Requested action
              <select className={sel} value={action} onChange={(e) => setAction(e.target.value)}>
                {SIM_ACTIONS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </label>
            <label className="block text-[11px] font-medium text-slate-600">Target resource
              <select className={sel} value={resource} onChange={(e) => setResource(e.target.value)}>
                {SIM_RESOURCES.map((r) => <option key={r.label}>{r.label}</option>)}
              </select>
            </label>
            <label className="block text-[11px] font-medium text-slate-600">Region
              <select className={sel} value={region} onChange={(e) => setRegion(e.target.value)}>
                {["US", "EU", "APAC"].map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
            <label className="block text-[11px] font-medium text-slate-600">Session age: {sessionAge} minutes
              <input type="range" min={1} max={180} value={sessionAge} className="w-full"
                onChange={(e) => setSessionAge(Number(e.target.value))} />
            </label>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-1.5 text-[11.5px] text-slate-700">
                <input type="checkbox" checked={workflow} onChange={(e) => setWorkflow(e.target.checked)} /> Active workflow binding
              </label>
              <label className="flex items-center gap-1.5 text-[11.5px] text-slate-700">
                <input type="checkbox" checked={approval} onChange={(e) => setApproval(e.target.checked)} /> Human approval reference
              </label>
            </div>
            <div className="flex gap-1.5 pt-1">
              <Btn variant="primary" onClick={evaluate}>Simulate Decision</Btn>
              <Btn onClick={() => setResult(null)}>Reset</Btn>
            </div>
          </div>

          <div>
            {!result ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/60 px-4 py-8 text-center text-[11.5px] text-slate-600">
                Configure the request and run the simulation to see the full policy evaluation trace.
              </div>
            ) : (
              <div>
                <StatePill tone={result.outcome === "ALLOW" ? "ok" : result.outcome === "DENY" ? "bad" : "warn"} label={result.outcome} />
                <p className="mt-2 text-[11.5px] leading-relaxed text-slate-700">{result.reason}</p>
                <SubHead>Evaluation trace</SubHead>
                <CheckList checks={result.checks} />
                <div className="mt-2 flex gap-1.5">
                  <Btn onClick={() => toast.success("Simulation saved", { description: "Trace retained as evidence for policy review." })}>Save Simulation</Btn>
                  <Btn onClick={() => toast.info("Compared with production policy", { description: "No divergence detected against the active policy version." })}>Compare With Production</Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------ global search ----------------------------- */

export function GlobalSearch({ onSelect }: { onSelect: (item: SearchItem) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
      if (e.key === "/" && !typing) { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const items = term
      ? SEARCH_INDEX.filter((i) => i.label.toLowerCase().includes(term) || i.sub.toLowerCase().includes(term) || i.group.toLowerCase().includes(term))
      : SEARCH_INDEX;
    const groups: Record<string, SearchItem[]> = {};
    items.forEach((i) => { (groups[i.group] ||= []).push(i); });
    return groups;
  }, [q]);

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] text-slate-500 hover:border-slate-300">
        <Search className="h-3.5 w-3.5" /> Search identities, roles, policies
        <kbd className="rounded border border-slate-200 px-1 text-[10px] text-slate-500">/</kbd>
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setOpen(false)} aria-hidden />
          <div role="dialog" aria-modal="true" aria-label="Global search"
            className="absolute left-1/2 top-24 w-[min(680px,94vw)] -translate-x-1/2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5">
              <Search className="h-4 w-4 text-slate-400" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search identities, roles, permissions, policies, resources"
                className="w-full text-[13px] text-slate-800 outline-none" aria-label="Search" />
            </div>
            <div className="max-h-[52vh] overflow-y-auto py-1">
              {Object.keys(results).length === 0 && (
                <div className="px-3 py-6 text-center text-[12px] text-slate-500">No matching identity, role, policy or resource.</div>
              )}
              {Object.entries(results).map(([group, items]) => (
                <div key={group}>
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{group}</div>
                  {items.map((i) => (
                    <button key={i.label} onClick={() => { setOpen(false); onSelect(i); }}
                      className="block w-full px-3 py-1.5 text-left hover:bg-slate-50">
                      <div className="text-[12.5px] text-slate-800">{i.label}</div>
                      <div className="text-[11px] text-slate-500">{i.sub}</div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>, document.body)}
    </>
  );
}

/* ------------------------- create coworker identity ----------------------- */

const STEPS = [
  { title: "Identity Definition", fields: ["Coworker name", "Business purpose", "Business owner", "Engineering owner"], note: "Every digital coworker identity requires a resolvable owner before it can be created." },
  { title: "Trust & Authentication", fields: ["Authentication mechanism", "Token TTL", "Audience", "Environment binding"], note: "Workload identity and OIDC federation are preferred over persistent secrets." },
  { title: "Role Assignment", fields: ["Base role", "Additional roles", "Assignment justification"], note: "New identities start read-only inside a single business domain." },
  { title: "Data Domain Scope", fields: ["Permitted domains", "Classification ceiling", "Denied domains"], note: "The classification ceiling caps every downstream retrieval and model route." },
  { title: "Tool & System Authority", fields: ["Approved systems", "Approval-gated actions", "Denied actions"], note: "Destructive actions remain denied for all digital coworker roles." },
  { title: "Model Capability Entitlement", fields: ["Reasoning tier", "Vision", "Long context", "External provider"], note: "IAM authorizes capability classes; routing selects the approved model." },
  { title: "Autonomy Boundaries", fields: ["Autonomy ceiling", "Approval threshold", "Escalation authority"], note: "Autonomy cannot exceed the permissions granted here." },
  { title: "Runtime Constraints", fields: ["Regions", "Environments", "Session ceiling", "Network restriction"], note: "Runtime conditions are re-evaluated at every request." },
  { title: "Review & Ownership", fields: ["Review cadence", "Reviewer group", "Exception policy"], note: "Privileged scopes are reviewed quarterly." },
  { title: "Summary", fields: [], note: "The identity is created in a draft state and requires approval before it can authenticate." },
];

export function CreateCoworkerWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => { if (open) setStep(0); }, [open]);
  if (!open) return null;
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Create digital coworker identity"
        className="absolute left-1/2 top-1/2 w-[min(820px,94vw)] max-h-[88vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Step {step + 1} of {STEPS.length}</div>
            <h2 className="text-[16px] font-semibold text-slate-900">Create Digital Coworker Identity</h2>
          </div>
          <button onClick={onClose} aria-label="Close wizard" className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="border-b border-slate-200 px-4 py-2">
          <div className="h-1 w-full rounded bg-slate-100">
            <div className="h-1 rounded bg-blue-600" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>
        <div className="p-4">
          <Panel title={s.title} subtitle={s.note}>
            {last ? (
              <KV rows={[
                ["Identity type", "Digital Coworker"],
                ["Authentication", "Workload identity (OIDC federation)"],
                ["Base role", "Claims Analyst (read-only)"],
                ["Classification ceiling", "Confidential"],
                ["Autonomy ceiling", "Recommend only"],
                ["Review cadence", "Quarterly"],
                ["State on creation", "Draft · approval required"],
              ]} />
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {s.fields.map((f) => (
                  <label key={f} className="block text-[11px] font-medium text-slate-600">
                    {f}
                    <input className="mt-0.5 h-8 w-full rounded-md border border-slate-200 px-2 text-[12px] text-slate-800" placeholder={f} />
                  </label>
                ))}
              </div>
            )}
          </Panel>
        </div>
        <footer className="flex justify-between border-t border-slate-200 px-4 py-3">
          <Btn onClick={onClose}>Cancel</Btn>
          <div className="flex gap-1.5">
            <Btn disabled={step === 0} onClick={() => setStep((v) => Math.max(0, v - 1))}>Back</Btn>
            {last ? (
              <Btn variant="primary" onClick={() => { onClose(); toast.success("Digital coworker identity created as draft", { description: "Approval required before the identity can authenticate." }); }}>
                Create Identity
              </Btn>
            ) : (
              <Btn variant="primary" onClick={() => setStep((v) => v + 1)}>Continue</Btn>
            )}
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
