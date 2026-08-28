import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CloudCog,
  FileWarning,
  RefreshCw,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AzureControlPlaneError,
  executeApprovedVmChangePackage,
  getAzureVmOperations,
  listAzureVirtualMachines,
  type AzureVirtualMachine,
  type AzureVmOperations,
} from "./azureControlPlane";
import {
  getVmChangePackage,
  listVmChangePackageReviews,
  listVmChangePackages,
  type ChangePackageStatus,
  type VmChangePackage,
  type VmChangePackageReview,
} from "./changePackages";

const STATUS_STYLE: Record<ChangePackageStatus, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  submitted: "border-blue-200 bg-blue-50 text-blue-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  changes_requested: "border-amber-200 bg-amber-50 text-amber-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  executing: "border-blue-200 bg-blue-50 text-blue-700",
  executed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  execution_failed: "border-red-200 bg-red-50 text-red-700",
};

function Panel({ title, children, action, className }: { title: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return <section className={cn("rounded-xl border border-slate-200 bg-white", className)}>
    <div className="flex min-h-11 items-center justify-between border-b border-slate-200 px-4">
      <h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-800">{title}</h2>{action}
    </div>
    <div className="p-4">{children}</div>
  </section>;
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
    <span className="text-slate-500">{label}</span><span className="text-right font-medium text-slate-800">{value || "Not reported"}</span>
  </div>;
}

function Status({ value }: { value: ChangePackageStatus }) {
  return <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize", STATUS_STYLE[value])}>{value.replace(/_/g, " ")}</span>;
}

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function shortId(value?: string | null) {
  return value ? `${value.slice(0, 8)}…${value.slice(-4)}` : "Not recorded";
}

type Readiness = { state: "ready" | "attention" | "blocked"; title: string; detail: string };

function executionReadiness(pkg: VmChangePackage, vm?: AzureVirtualMachine): Readiness {
  if (!vm) return { state: "blocked", title: "Target unavailable", detail: "The VM is not present in the latest Azure discovery." };
  if (pkg.actionType !== "start_vm") return { state: "blocked", title: "Execution unavailable", detail: "This action has no Azure execution workflow configured." };
  if (/running/i.test(vm.powerState ?? "")) return { state: "attention", title: "No start required", detail: "Azure reports this VM is already running." };
  if (!/(deallocated|stopped)/i.test(vm.powerState ?? "")) return { state: "attention", title: "State requires review", detail: `Azure currently reports ${vm.powerState || "an unknown power state"}.` };
  return { state: "ready", title: "Ready for controlled start", detail: "The approved start request matches Azure's current stopped/deallocated state." };
}

function ReadinessBadge({ readiness }: { readiness: Readiness }) {
  const style = readiness.state === "ready" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : readiness.state === "blocked" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700";
  return <span title={readiness.detail} className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold", style)}>{readiness.title}</span>;
}

export default function ExecutionCenter() {
  const { packageId } = useParams<{ packageId: string }>();
  if (packageId && /^CP-\d{4}-\d+$/i.test(packageId)) return <Navigate replace to="/execution?reference=legacy-sample" />;
  return packageId ? <VmExecutionDetail packageReference={packageId} /> : <VmExecutionQueue />;
}

function VmExecutionQueue() {
  const location = useLocation();
  const [packages, setPackages] = useState<VmChangePackage[]>([]);
  const [vms, setVms] = useState<AzureVirtualMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [allPackages, azureVms] = await Promise.all([listVmChangePackages(), listAzureVirtualMachines()]);
      setPackages(allPackages.filter((pkg) => ["approved", "executing", "executed", "execution_failed"].includes(pkg.status)));
      setVms(azureVms);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load execution packages.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const vmById = useMemo(() => new Map(vms.map((vm) => [vm.id.toLowerCase(), vm])), [vms]);
  const readyCount = packages.filter((pkg) => pkg.status === "approved" && executionReadiness(pkg, vmById.get(pkg.targetResourceId.toLowerCase())).state === "ready").length;
  const legacyNotice = new URLSearchParams(location.search).get("reference") === "legacy-sample";

  return <main className="mx-auto max-w-[1500px] space-y-4 px-3 py-5 md:px-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs text-slate-500">Azure Resources <ChevronRight className="inline h-3 w-3" /> Execution Center</p><h1 className="mt-1 text-2xl font-semibold text-slate-900">VM Execution Center</h1><p className="mt-1 text-sm text-slate-600">Execute only approved Azure VM packages through the controlled Azure action endpoint.</p></div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />Refresh Azure state</button>
    </div>
    {legacyNotice && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><b>Legacy sample package not loaded.</b> The former SQL/AWS demo package is not an Azure VM change package. Select a real approved VM package below.</div>}
    {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
    <div className="grid gap-3 sm:grid-cols-3">
      <Metric label="Approved packages" value={String(packages.filter((item) => item.status === "approved").length)} icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />} />
      <Metric label="Ready to execute" value={String(readyCount)} icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} />
      <Metric label="Execution in progress" value={String(packages.filter((item) => item.status === "executing").length)} icon={<Timer className="h-5 w-5 text-blue-600" />} />
    </div>
    <Panel title="Approved VM packages" action={<span className="text-xs text-slate-500">Durable records in Supabase</span>}>
      {loading ? <div className="py-10 text-center text-sm text-slate-500">Loading approved packages and Azure discovery…</div> : packages.length === 0 ? <div className="py-10 text-center text-sm text-slate-600">No approved, executing, or completed VM packages are available. <Link className="font-medium text-blue-700 underline" to="/changes">Create or submit a VM change package</Link>.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="pb-3 pr-4">Package</th><th className="pb-3 pr-4">Target VM</th><th className="pb-3 pr-4">Requested action</th><th className="pb-3 pr-4">Current Azure state</th><th className="pb-3 pr-4">Preflight</th><th className="pb-3 pr-4">Execution</th><th className="pb-3"> </th></tr></thead><tbody>{packages.map((pkg) => { const vm = vmById.get(pkg.targetResourceId.toLowerCase()); const readiness = executionReadiness(pkg, vm); return <tr key={pkg.id} className="border-b border-slate-100 last:border-0"><td className="py-4 pr-4"><div className="font-semibold text-slate-900">{pkg.packageNumber}</div><Status value={pkg.status} /></td><td className="py-4 pr-4"><div className="font-medium text-slate-800">{pkg.targetName}</div><div className="text-xs text-slate-500">{pkg.resourceGroup} · {pkg.region}</div></td><td className="py-4 pr-4 font-medium text-slate-800">{pkg.actionLabel}</td><td className="py-4 pr-4">{vm?.powerState || "Not found"}</td><td className="py-4 pr-4"><ReadinessBadge readiness={readiness} /></td><td className="py-4 pr-4 text-xs text-slate-600">{pkg.executionCompletedAt ? formatDate(pkg.executionCompletedAt) : pkg.executionStartedAt ? `Started ${formatDate(pkg.executionStartedAt)}` : "Not started"}</td><td className="py-4 text-right"><Link to={`/execution/${pkg.id}`} className="rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800">Open</Link></td></tr>; })}</tbody></table></div>}
    </Panel>
  </main>;
}

function VmExecutionDetail({ packageReference }: { packageReference: string }) {
  const [pkg, setPkg] = useState<VmChangePackage | null | undefined>(undefined);
  const [reviews, setReviews] = useState<VmChangePackageReview[]>([]);
  const [vms, setVms] = useState<AzureVirtualMachine[]>([]);
  const [operations, setOperations] = useState<AzureVmOperations | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [nextPackage, azureVms] = await Promise.all([getVmChangePackage(packageReference), listAzureVirtualMachines()]);
      setPkg(nextPackage); setVms(azureVms);
      setReviews(nextPackage ? await listVmChangePackageReviews(nextPackage.id) : []);
      setError(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load this change package."); }
    finally { if (showSpinner) setLoading(false); }
  }, [packageReference]);
  useEffect(() => { void load(); }, [load]);
  const vm = useMemo(() => pkg ? vms.find((item) => item.id.toLowerCase() === pkg.targetResourceId.toLowerCase()) : undefined, [pkg, vms]);
  useEffect(() => {
    if (!vm) { setOperations(null); return; }
    let active = true;
    void getAzureVmOperations(vm).then((value) => { if (active) setOperations(value); }).catch(() => { if (active) setOperations(null); });
    return () => { active = false; };
  }, [vm]);
  useEffect(() => {
    if (pkg?.status !== "executing") return;
    const interval = window.setInterval(() => { void load(false); }, 10000);
    return () => window.clearInterval(interval);
  }, [load, pkg?.status]);

  const readiness = pkg ? executionReadiness(pkg, vm) : undefined;
  const canExecute = Boolean(pkg && pkg.status === "approved" && readiness?.state === "ready");
  const execute = async () => {
    if (!pkg || !canExecute) return;
    setExecuting(true); setError(null);
    try { await executeApprovedVmChangePackage(pkg.id); await load(false); }
    catch (cause) { setError(cause instanceof AzureControlPlaneError ? cause.message : cause instanceof Error ? cause.message : "Execution could not be started."); await load(false); }
    finally { setExecuting(false); }
  };
  const events = useMemo(() => {
    if (!pkg) return [] as Array<{ label: string; time?: string | null; detail: string; tone: "info" | "ok" | "bad" }>;
    return [
      { label: "Package submitted", time: pkg.submittedAt, detail: `Submitted by ${pkg.createdBy || "the requestor"}.`, tone: "info" as const },
      ...reviews.map((review) => ({ label: `Review ${review.decision.replace(/_/g, " ")}`, time: review.reviewedAt, detail: `${review.reviewedBy || "Reviewer"}: ${review.comment || "No comment recorded."}`, tone: review.decision === "approved" ? "ok" as const : "bad" as const })),
      ...(pkg.executionStartedAt ? [{ label: "Azure execution started", time: pkg.executionStartedAt, detail: "The approved, package-bound Azure VM action was requested.", tone: "info" as const }] : []),
      ...(pkg.executionCompletedAt ? [{ label: pkg.status === "executed" ? "Azure execution completed" : "Azure execution failed", time: pkg.executionCompletedAt, detail: pkg.executionMessage || "No completion message was recorded.", tone: pkg.status === "executed" ? "ok" as const : "bad" as const }] : []),
    ];
  }, [pkg, reviews]);

  if (loading) return <main className="px-5 py-12 text-center text-sm text-slate-500">Loading VM package and live Azure state…</main>;
  if (!pkg) return <main className="mx-auto max-w-3xl px-5 py-12"><Panel title="VM execution package"><p className="text-sm text-slate-700">This package is not available to your account or is not a VM package.</p><Link className="mt-4 inline-block text-sm font-medium text-blue-700 underline" to="/execution">Back to Execution Center</Link></Panel></main>;

  return <main className="mx-auto max-w-[1500px] space-y-4 px-3 py-5 md:px-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-slate-500"><Link className="hover:underline" to="/execution">Execution Center</Link> <ChevronRight className="inline h-3 w-3" /> {pkg.packageNumber}</p><h1 className="mt-1 text-2xl font-semibold text-slate-900">{pkg.actionLabel}</h1><p className="mt-1 text-sm text-slate-600">{pkg.targetName} · {pkg.resourceGroup} · {pkg.region}</p></div><div className="flex items-center gap-2"><Status value={pkg.status} /><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"><RefreshCw className="h-4 w-4" />Refresh</button></div></div>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        <Panel title="Execution preflight"><div className={cn("rounded-lg border p-4", readiness?.state === "ready" ? "border-emerald-200 bg-emerald-50" : readiness?.state === "blocked" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50")}><div className="flex gap-3"><AlertTriangle className={cn("mt-0.5 h-5 w-5 shrink-0", readiness?.state === "ready" ? "text-emerald-600" : readiness?.state === "blocked" ? "text-red-600" : "text-amber-600")} /><div><p className="font-semibold text-slate-900">{readiness?.title}</p><p className="mt-1 text-sm text-slate-700">{readiness?.detail}</p></div></div></div><div className="mt-4 grid gap-x-8 md:grid-cols-2"><Row label="Package status" value={<Status value={pkg.status} />} /><Row label="Live Azure power state" value={vm?.powerState || "VM not found"} /><Row label="Action" value={pkg.actionLabel} /><Row label="Provisioning" value={vm?.provisioningState || "Not reported"} /></div><p className="mt-3 text-xs text-slate-500">Execution is limited to the approved package action. This page cannot modify a VM directly or execute an unapproved package.</p></Panel>
        <Panel title="Controlled execution"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-medium text-slate-900">{pkg.actionLabel}</p><p className="mt-1 max-w-2xl text-sm text-slate-600">{pkg.rationale}</p></div><button onClick={() => void execute()} disabled={!canExecute || executing} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"><CloudCog className="h-4 w-4" />{executing ? "Requesting Azure action…" : "Execute approved VM change"}</button></div>{!canExecute && pkg.status === "approved" && <p className="mt-3 text-xs text-amber-700">Azure execution is blocked until the preflight is ready.</p>}{pkg.status === "executing" && <p className="mt-3 text-sm text-blue-700">Execution is in progress. This page refreshes the durable package status every 10 seconds.</p>}<p className="mt-3 text-xs text-slate-500">No pause, cancel, or rollback action is offered: Azure VM start requests are asynchronous and must be observed to completion.</p></Panel>
        <Panel title="Execution timeline"><div className="space-y-4">{events.map((event, index) => <div key={`${event.label}-${index}`} className="flex gap-3"><span className={cn("mt-1 h-3 w-3 shrink-0 rounded-full", event.tone === "ok" ? "bg-emerald-500" : event.tone === "bad" ? "bg-red-500" : "bg-blue-500")} /><div><div className="flex flex-wrap gap-x-3"><p className="font-medium capitalize text-slate-900">{event.label}</p><p className="text-xs text-slate-500">{formatDate(event.time)}</p></div><p className="mt-0.5 text-sm text-slate-600">{event.detail}</p></div></div>)}</div></Panel>
      </div>
      <div className="space-y-4">
        <Panel title="Change package"><Row label="Reference" value={pkg.packageNumber} /><Row label="Requestor" value={pkg.createdBy} /><Row label="Target resource" value={<span className="break-all text-xs">{shortId(pkg.targetResourceId)}</span>} /><Row label="Reason" value={pkg.rationale} /></Panel>
        <Panel title="Approval record">{reviews.length === 0 ? <p className="text-sm text-slate-500">No review decision is recorded.</p> : <div className="space-y-3">{reviews.map((review) => <div key={review.id} className="rounded-lg border border-slate-200 p-3"><div className="flex justify-between gap-2"><Status value={review.decision} /><span className="text-xs text-slate-500">{formatDate(review.reviewedAt)}</span></div><p className="mt-2 text-sm font-medium text-slate-800">{review.reviewedBy || "Reviewer"}</p><p className="mt-1 text-sm text-slate-600">{review.comment || "No comment recorded."}</p></div>)}</div>}</Panel>
        <Panel title="Post-execution Azure evidence"><Row label="VM size" value={operations?.configuration.vmSize || vm?.vmSize} /><Row label="Operating system" value={operations?.configuration.osType || vm?.osType} /><Row label="Boot diagnostics" value={operations?.bootDiagnostics.state === "enabled" ? "Enabled" : operations?.bootDiagnostics.state} /><Row label="Azure Monitor" value={operations?.monitoring.state === "available" ? "Configured" : operations?.monitoring.state?.replace(/_/g, " ")} /><Row label="Azure Backup" value={operations?.backup.state?.replace(/_/g, " ")} /><Row label="Patch assessment" value={operations?.patching.state?.replace(/_/g, " ")} /><Row label="Network interface" value={operations?.network.networkInterface} /><Row label="Private IP" value={operations?.network.privateIps?.join(", ")} /><div className="mt-3 flex gap-3 border-t border-slate-100 pt-3"><Link className="text-sm font-medium text-blue-700 underline" to={`/resources/virtual-machines/${encodeURIComponent(pkg.targetName)}`}>Open Digital Twin</Link><Link className="text-sm font-medium text-blue-700 underline" to={`/remediation/virtual-machines/${encodeURIComponent(pkg.targetName)}`}>Open assessment</Link></div></Panel>
      </div>
    </div>
  </main>;
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">{icon}<div><p className="text-2xl font-semibold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div></div>;
}
