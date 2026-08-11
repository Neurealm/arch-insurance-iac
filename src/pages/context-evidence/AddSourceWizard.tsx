// Five-step Add Source / Connector configuration flow, presented in the
// standard right-side drawer surface.

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CONNECTOR_CATALOG, DOMAINS, CLASSIFICATIONS } from "./data";
import { Btn, SubHead } from "./parts";
import { X, Check, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";

const STEPS = ["Select Source Type", "Connection", "Data Scope", "Context Rules", "Validate & Activate"];

const CHECKS = [
  "Connection test", "Permission test", "Schema discovery", "Sample ingestion", "Quality check", "Estimated volume",
];

export function AddSourceWizard({ open, onClose, onActivated }: { open: boolean; onClose: () => void; onActivated: (name: string) => void }) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<string>("Database");
  const [connector, setConnector] = useState<string>("Snowflake");
  const [conn, setConn] = useState({ endpoint: "", auth: "OAuth Service Principal", network: "Private Link", credential: "vault://tenant/dual/…", region: "US East" });
  const [scope, setScope] = useState({ include: "", exclude: "" });
  const [rules, setRules] = useState({ domain: DOMAINS[0], classification: CLASSIFICATIONS[0], mapping: "Auto-map to canonical", entity: true, freshness: "24 hours", retention: "84 months", pii: true, indexes: ["Vector", "Keyword", "Graph"] });
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<number>(-1);

  if (!open) return null;

  const runChecks = () => {
    setRunning(true); setDone(-1);
    CHECKS.forEach((_, i) => setTimeout(() => {
      setDone(i);
      if (i === CHECKS.length - 1) setRunning(false);
    }, 400 * (i + 1)));
  };

  const toggleIndex = (i: string) =>
    setRules((r) => ({ ...r, indexes: r.indexes.includes(i) ? r.indexes.filter((x) => x !== i) : [...r.indexes, i] }));

  return createPortal(
    <div className="fixed inset-0 z-[65]">
      <div className="absolute inset-0 bg-slate-900/20" onClick={onClose} aria-hidden />
      <aside role="dialog" aria-modal="true" aria-label="Add source or connector"
        className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col border-l border-slate-200 bg-white shadow-2xl animate-slide-in-right" style={{ animationDuration: "200ms" }}>
        <header className="border-b border-slate-200 px-4 py-3">
          <div className="flex items-start">
            <div className="flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Tenant Evidence Plane</div>
              <div className="text-[16px] font-semibold text-slate-900">Add Source / Connector</div>
            </div>
            <button onClick={onClose} aria-label="Close wizard" className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
          </div>
          <ol className="mt-3 flex items-center gap-1">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-1">
                <button onClick={() => setStep(i)} className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                  i < step ? "border-blue-600 bg-blue-600 text-white" : i === step ? "border-blue-600 text-blue-700" : "border-slate-300 text-slate-400",
                )} aria-label={`Step ${i + 1}: ${s}`}>{i < step ? <Check className="h-3 w-3" /> : i + 1}</button>
                {i < STEPS.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-blue-500" : "bg-slate-200")} />}
              </li>
            ))}
          </ol>
          <div className="mt-1.5 text-[12px] font-medium text-slate-700">Step {step + 1} — {STEPS[step]}</div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {step === 0 && (
            <div>
              <SubHead>Category</SubHead>
              <div className="flex flex-wrap gap-1.5">
                {CONNECTOR_CATALOG.map((c) => (
                  <button key={c.category} onClick={() => { setCategory(c.category); setConnector(c.connectors[0]); }}
                    className={cn("rounded border px-2 py-1 text-[11.5px]", category === c.category ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-700 hover:bg-slate-50")}>
                    {c.category}
                  </button>
                ))}
              </div>
              <SubHead>Connector</SubHead>
              <div className="grid grid-cols-2 gap-1.5">
                {(CONNECTOR_CATALOG.find((c) => c.category === category)?.connectors ?? []).map((c) => (
                  <button key={c} onClick={() => setConnector(c)}
                    className={cn("rounded border px-2 py-2 text-left text-[12px]", connector === c ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-700 hover:bg-slate-50")}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2.5">
              <Field label="Endpoint" value={conn.endpoint} placeholder="dual-ug.us-east-1.snowflakecomputing.com" onChange={(v) => setConn({ ...conn, endpoint: v })} />
              <Select label="Authentication" value={conn.auth} options={["OAuth Service Principal", "IAM Role Assumption", "mTLS + Client Credentials", "API Key (vault reference)"]} onChange={(v) => setConn({ ...conn, auth: v })} />
              <Select label="Network" value={conn.network} options={["Private Link", "VPC Peering", "Allow-listed Public"]} onChange={(v) => setConn({ ...conn, network: v })} />
              <Field label="Credential reference" value={conn.credential} onChange={(v) => setConn({ ...conn, credential: v })} />
              <Select label="Region" value={conn.region} options={["US East", "US West", "EU West"]} onChange={(v) => setConn({ ...conn, region: v })} />
              <p className="text-[11px] text-slate-500">Secrets are never stored in the platform. Only vault references are persisted.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2.5">
              <Field label="Include (schemas / collections / folders / tables)" value={scope.include} placeholder="UW_PROD.SUBMISSIONS, UW_PROD.POLICY_FACT" onChange={(v) => setScope({ ...scope, include: v })} />
              <Field label="Exclusions" value={scope.exclude} placeholder="*_STAGING, *_TMP" onChange={(v) => setScope({ ...scope, exclude: v })} />
              <p className="text-[11px] text-slate-500">Scope is evaluated at discovery time; newly matching objects are ingested automatically.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2.5">
              <Select label="Business domain" value={rules.domain} options={DOMAINS} onChange={(v) => setRules({ ...rules, domain: v })} />
              <Select label="Classification" value={rules.classification} options={CLASSIFICATIONS as unknown as string[]} onChange={(v) => setRules({ ...rules, classification: v as any })} />
              <Select label="Canonical mapping" value={rules.mapping} options={["Auto-map to canonical", "Manual mapping required", "Passthrough (no canonical)"]} onChange={(v) => setRules({ ...rules, mapping: v })} />
              <Select label="Freshness SLA" value={rules.freshness} options={["5 minutes", "1 hour", "24 hours", "7 days"]} onChange={(v) => setRules({ ...rules, freshness: v })} />
              <Select label="Retention" value={rules.retention} options={["12 months", "36 months", "84 months", "Source policy"]} onChange={(v) => setRules({ ...rules, retention: v })} />
              <label className="flex items-center gap-2 text-[12px] text-slate-700">
                <input type="checkbox" checked={rules.entity} onChange={(e) => setRules({ ...rules, entity: e.target.checked })} /> Entity extraction &amp; resolution
              </label>
              <label className="flex items-center gap-2 text-[12px] text-slate-700">
                <input type="checkbox" checked={rules.pii} onChange={(e) => setRules({ ...rules, pii: e.target.checked })} /> PII detection and masking
              </label>
              <div>
                <SubHead>Index types</SubHead>
                <div className="flex flex-wrap gap-1.5">
                  {["Vector", "Keyword", "Graph", "Relational", "Temporal"].map((i) => (
                    <button key={i} onClick={() => toggleIndex(i)}
                      className={cn("rounded border px-2 py-1 text-[11.5px]", rules.indexes.includes(i) ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>{i}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="rounded-md border border-slate-200">
                {CHECKS.map((c, i) => (
                  <div key={c} className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-[12px] last:border-b-0">
                    <span className="text-slate-700">{c}</span>
                    {done >= i
                      ? <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-emerald-700"><Check className="h-3.5 w-3.5" />{c === "Estimated volume" ? "≈ 410K objects / 62 GB" : "Passed"}</span>
                      : running
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                        : <span className="text-[11.5px] text-slate-400">Not run</span>}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Btn onClick={runChecks} disabled={running}>Run validation</Btn>
                <Btn variant="primary" disabled={done < CHECKS.length - 1} onClick={() => onActivated(`${connector} · ${rules.domain}`)}>Activate Connector</Btn>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Activation registers the connector in the tenant evidence plane. It does not grant any digital coworker direct access to the source system.</p>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-slate-200 px-4 py-2.5">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <div className="flex gap-2">
            <Btn onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Btn>
            <Btn variant="primary" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}>Next</Btn>
          </div>
        </footer>
      </aside>
    </div>,
    document.body,
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-slate-600">{label}</span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-8 w-full rounded border border-slate-200 bg-white px-2 text-[12px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400" />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-slate-600">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-8 w-full rounded border border-slate-200 bg-white px-2 text-[12px] text-slate-800 outline-none focus:border-blue-400">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
