import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Clock3, Download, FileText, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { getAzureVmOperations, listAzureVirtualMachines, type AzureVirtualMachine, type AzureVmOperations } from "./azureControlPlane";
import { listVmChangePackages, type VmChangePackage } from "./changePackages";
import { closeValidationRun, getEvidenceItems, getValidationResults, getValidationRun, persistValidation, type EvidenceItem, type ValidationResult, type ValidationRun } from "./validation/vmValidation";

function Status({ value }: { value: string }) {
  const style = value === "PASS" || value === "verified" || value === "closed" || value === "executed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : value === "FAIL" || value === "failed" || value === "execution_failed" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-700 border-amber-200";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase ${style}`}>{value.replace(/_/g, " ")}</span>;
}

function Value({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 text-[12px] last:border-0"><span className="text-slate-500">{label}</span><span className="max-w-[68%] text-right font-medium text-slate-800">{value}</span></div>;
}

function formatDate(value?: string | null) { return value ? new Date(value).toLocaleString() : "Not recorded"; }

export default function ValidationEvidence() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<VmChangePackage[]>([]);
  const [selected, setSelected] = useState<VmChangePackage | null>(null);
  const [vm, setVm] = useState<AzureVirtualMachine | null>(null);
  const [operations, setOperations] = useState<AzureVmOperations | null>(null);
  const [run, setRun] = useState<ValidationRun | null>(null);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const all = await listVmChangePackages();
      const eligible = all.filter((item) => ["executed", "execution_failed"].includes(item.status));
      setPackages(eligible);
      const chosen = packageId ? all.find((item) => item.id === packageId || item.packageNumber === packageId) ?? null : eligible[0] ?? null;
      setSelected(chosen);
      if (!chosen) { setVm(null); setOperations(null); setRun(null); setResults([]); setEvidence([]); return; }
      const machines = await listAzureVirtualMachines();
      const target = machines.find((item) => item.id.toLowerCase() === chosen.targetResourceId.toLowerCase()) ?? machines.find((item) => item.name.toLowerCase() === chosen.targetName.toLowerCase()) ?? null;
      setVm(target);
      let liveOps: AzureVmOperations | null = null;
      if (target) { try { liveOps = await getAzureVmOperations(target); } catch { liveOps = null; } }
      setOperations(liveOps);
      const existing = await getValidationRun(chosen.id);
      setRun(existing);
      if (existing) { setResults(await getValidationResults(existing.id)); setEvidence(await getEvidenceItems(existing.id)); } else { setResults([]); setEvidence([]); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load validation evidence."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [packageId]);

  const passed = results.filter((item) => item.result === "PASS").length;
  const failed = results.filter((item) => item.result === "FAIL").length;
  const warnings = results.filter((item) => item.result === "WARN").length;
  const domains = useMemo(() => [...new Set(results.map((item) => item.domain))], [results]);

  const runValidation = async () => {
    if (!selected || !vm) return;
    setRunning(true); setError(null);
    try { const outcome = await persistValidation(selected, vm, operations); setRun(outcome.run); setResults(outcome.results); setEvidence(await getEvidenceItems(outcome.run.id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to persist validation evidence."); }
    finally { setRunning(false); }
  };

  const close = async () => {
    if (!run || run.status !== "verified") return;
    try { setRun(await closeValidationRun(run.id)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to close the change."); }
  };

  if (loading) return <div className="p-5 text-[13px] text-slate-600">Loading executed VM packages and Azure evidence…</div>;
  if (!selected) return <div className="p-5"><div className="rounded-lg border border-slate-200 bg-white p-8 text-center"><ClipboardCheck className="mx-auto h-8 w-8 text-slate-400" /><h1 className="mt-3 text-lg font-semibold text-slate-900">Validation &amp; Evidence</h1><p className="mt-2 text-sm text-slate-600">A completed Azure VM execution is required before final validation can begin.</p><Link to="/changes" className="mt-4 inline-block text-sm font-medium text-blue-700 underline">Create a VM change package</Link></div></div>;

  const actual = vm ? `${vm.powerState} · provisioning ${vm.provisioningState}` : "Target VM is not visible in the connected Azure scope";
  const capturedVm = selected.currentState?.vm && typeof selected.currentState.vm === "object" ? selected.currentState.vm as Record<string, unknown> : null;
  const before = String(selected.currentState?.powerState ?? capturedVm?.powerState ?? (capturedVm?.properties as Record<string, unknown> | undefined)?.powerState ?? "Captured Azure state");
  const status = run?.status ?? "pending";

  return <div className="min-w-0 px-4 py-4">
    <header className="flex flex-wrap items-start gap-3"><div><div className="flex items-center gap-2"><h1 className="text-[20px] font-semibold text-slate-900">Validation &amp; Evidence</h1><Status value={status} /></div><p className="mt-1 text-[12px] text-slate-600">Post-execution verification for the selected Azure VM change package.</p></div><div className="ml-auto flex flex-wrap gap-2"><select value={selected.id} onChange={(event) => { const next = packages.find((item) => item.id === event.target.value); if (next) navigate(`/validation/${next.id}`); }} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11.5px]"><option value={selected.id}>{selected.packageNumber} · {selected.targetName}</option>{packages.filter((item) => item.id !== selected.id).map((item) => <option key={item.id} value={item.id}>{item.packageNumber} · {item.targetName}</option>)}</select><button onClick={() => void load()} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] font-medium"><RefreshCw className="h-3.5 w-3.5" />Refresh Azure</button><button onClick={() => window.print()} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] font-medium"><Download className="h-3.5 w-3.5" />Export report</button>{run?.status === "verified" && <button onClick={() => void close()} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-700 px-3 text-[12px] font-semibold text-white"><ShieldCheck className="h-3.5 w-3.5" />Verify &amp; close</button>}</div></header>
    {error && <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800">{error}</div>}
    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-slate-200 bg-white px-4 py-3 md:grid-cols-6"><Value label="Package" value={<span className="font-mono">{selected.packageNumber}</span>} /><Value label="Target VM" value={selected.targetName} /><Value label="Action" value={selected.actionLabel} /><Value label="Execution" value={<Status value={selected.status} />} /><Value label="Completed" value={formatDate(selected.executionCompletedAt)} /><Value label="Confidence" value={run?.confidence != null ? `${run.confidence}%` : "Not calculated"} /></div>
    <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3"><section className="rounded-lg border border-slate-200 bg-white p-3"><h2 className="text-[12.5px] font-semibold text-slate-800">Original condition · Before</h2><Value label="VM" value={selected.targetName} /><Value label="Power state" value={before} /><Value label="Captured" value={formatDate(selected.updatedAt)} /></section><section className="rounded-lg border border-slate-200 bg-white p-3"><h2 className="text-[12.5px] font-semibold text-slate-800">Intended outcome · Target</h2><p className="mt-2 text-[12px] text-slate-700">{selected.actionLabel}</p><p className="mt-2 text-[11px] text-slate-500">{selected.rationale}</p></section><section className="rounded-lg border border-slate-200 bg-white p-3"><h2 className="text-[12.5px] font-semibold text-slate-800">Observed outcome · Actual</h2><Value label="Azure state" value={actual} /><Value label="Observed" value={formatDate(operations?.observedAt)} /></section></div>
    <section className="mt-3 rounded-lg border border-slate-200 bg-white p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-[12.5px] font-semibold text-slate-800">Validation results</h2><p className="mt-1 text-[11px] text-slate-500">Checks are generated from the live Azure VM observation and stored against this package.</p></div>{run?.status !== "closed" && <button onClick={() => void runValidation()} disabled={running || !vm || selected.status !== "executed"} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1B4F91] px-3 text-[11.5px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 className="h-3.5 w-3.5" />{running ? "Running checks…" : run ? "Refresh validation" : "Run final validation"}</button>}</div>{!vm && <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">The target VM is not currently discoverable. Validation is blocked until Azure returns the exact target resource.</p>}{results.length ? <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-[11.5px]"><thead className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="pb-2">Domain</th><th className="pb-2">Measure</th><th className="pb-2">Expected</th><th className="pb-2">Observed</th><th className="pb-2">Result</th><th className="pb-2">Source</th></tr></thead><tbody>{domains.flatMap((domain) => results.filter((item) => item.domain === domain)).map((item) => <tr key={item.checkCode} className="border-b border-slate-100"><td className="py-2 font-medium text-slate-700">{item.domain}</td><td className="py-2">{item.measure}</td><td className="py-2 text-slate-500">{item.expected}</td><td className="py-2 font-medium">{item.observed}</td><td className="py-2"><Status value={item.result} /></td><td className="py-2 text-slate-500">{item.source}</td></tr>)}</tbody></table><div className="mt-3 flex gap-4 text-[11px]"><span className="text-emerald-700">{passed} passed</span><span className="text-amber-700">{warnings} warnings</span><span className="text-rose-700">{failed} failed</span></div></div> : <div className="mt-4 rounded-md border border-dashed border-slate-300 p-5 text-center text-[12px] text-slate-500"><Clock3 className="mx-auto mb-2 h-5 w-5" />No validation run has been recorded for this package.</div>}</section>
    <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2"><section className="rounded-lg border border-slate-200 bg-white p-3"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-slate-500" /><h2 className="text-[12.5px] font-semibold text-slate-800">Evidence captured</h2></div>{evidence.length ? <div className="mt-3 space-y-2">{evidence.map((item) => <div key={item.id} className="rounded-md border border-slate-100 bg-slate-50 p-2.5"><div className="flex items-center justify-between gap-2"><span className="text-[11.5px] font-medium text-slate-800">{item.name}</span><span className="text-[10px] text-slate-500">{formatDate(item.capturedAt)}</span></div><div className="mt-1 text-[10.5px] text-slate-500">{item.kind.replace(/_/g, " ")} · {item.source}</div></div>)}<div className="mt-3 break-all border-t border-slate-100 pt-2 text-[10px] text-slate-500">Integrity hash: {run?.evidenceHash ?? "Not calculated"}</div></div> : <p className="mt-3 text-[12px] text-slate-500">Evidence will appear after final validation runs.</p>}</section><section className="rounded-lg border border-slate-200 bg-white p-3"><h2 className="text-[12.5px] font-semibold text-slate-800">Closure decision</h2><div className="mt-2"><Value label="Mandatory checks" value={results.length ? `${passed} / ${results.length} passed` : "Pending"} /><Value label="Validation status" value={<Status value={status} />} /><Value label="Validated at" value={formatDate(run?.completedAt)} /><Value label="Closed at" value={formatDate(run?.closedAt)} /></div>{run?.status === "verified" && failed === 0 ? <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-[11.5px] text-emerald-800"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />This VM change is eligible for closure. Warnings remain visible for operational follow-up.</p> : run?.status === "failed" ? <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-2 text-[11.5px] text-rose-800"><XCircle className="mr-1 inline h-3.5 w-3.5" />Closure is blocked until the failed Azure checks are resolved and validation is rerun.</p> : <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800"><AlertTriangle className="mr-1 inline h-3.5 w-3.5" />Execution success alone does not close a change; current Azure state must be independently verified.</p>}</section></div>
  </div>;
}
