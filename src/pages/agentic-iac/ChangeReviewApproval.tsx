import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ChevronRight, ClipboardCheck, FileWarning, RefreshCw, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { AzureControlPlaneError, getAzureVmOperations, listAzureVirtualMachines, type AzureVirtualMachine, type AzureVmOperations } from "./azureControlPlane";
import { getVmChangePackage, listVmChangePackageReviews, listVmChangePackages, reviewVmChangePackage, type ChangePackageStatus, type ChangeReviewDecision, type VmChangePackage, type VmChangePackageReview } from "./changePackages";
import { listTerraformRuns, syncTerraformRuns, type TerraformRun } from "./automationCatalog";

function Panel({ title, right, children, className }: { title: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={cn("rounded-md border border-[#E2E8F0] bg-white", className)}><header className="flex items-center gap-2 border-b border-[#E2E8F0] px-3 py-2"><h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-700">{title}</h2>{right && <div className="ml-auto">{right}</div>}</header><div className="p-3">{children}</div></section>;
}

function Row({ label, value }: { label: string; value: ReactNode }) { return <div className="flex items-start justify-between gap-4 border-b border-[#F1F5F9] py-1.5 text-[12px] last:border-0"><span className="text-slate-500">{label}</span><span className="max-w-[65%] text-right font-medium text-slate-800">{value}</span></div>; }
function title(value: string) { return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function dateTime(value: string | null | undefined) { return value ? new Date(value).toLocaleString() : "Not reported"; }
function shortId(value: string) { return value.length > 18 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value; }
function formatValue(value: unknown): string { if (value === null || value === undefined || value === "") return "Not reported"; if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value); return JSON.stringify(value); }
function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function nested(value: unknown, path: string): unknown { return path.split(".").reduce<unknown>((current, key) => record(current)[key], value); }
function firstText(value: unknown, paths: string[]): string | null { for (const path of paths) { const candidate = nested(value, path); if (typeof candidate === "string" && candidate.trim()) return candidate; if (typeof candidate === "number") return String(candidate); } return null; }

type ReviewReadiness = { tone: "ready" | "attention" | "blocked"; label: string; detail: string };

function reviewReadiness(pkg: VmChangePackage, vm: AzureVirtualMachine | null): ReviewReadiness {
  if (!vm) return { tone: "blocked", label: "Target is unavailable", detail: "The package target is not visible in the current Azure discovery scope." };
  if (pkg.actionType !== "start_vm") return { tone: "blocked", label: "Not executable in this pilot", detail: "Only Start virtual machine packages have an Azure execution path configured for this pilot." };
  if (/running/i.test(vm.powerState)) return { tone: "blocked", label: "No start required", detail: "Azure already reports this VM as running. Do not approve a redundant start request." };
  if (!/(deallocated|stopped)/i.test(vm.powerState)) return { tone: "attention", label: "Confirm current state", detail: `Azure reports ${vm.powerState}. Confirm the VM is safe to start before approval.` };
  return { tone: "ready", label: "Ready for human review", detail: `Azure reports ${vm.powerState}; the approved start action can be executed against this exact VM.` };
}

function capturedSnapshot(pkg: VmChangePackage) {
  const captured = pkg.currentState;
  return {
    powerState: firstText(captured, ["vm.powerState", "vm.properties.powerState", "operations.powerState"]),
    vmSize: firstText(captured, ["operations.configuration.vmSize", "vm.vmSize", "vm.properties.hardwareProfile.vmSize"]),
    osDiskSize: firstText(captured, ["operations.configuration.osDisk.sizeGB", "vm.storageProfile.osDisk.diskSizeGB", "vm.properties.storageProfile.osDisk.diskSizeGB"]),
    backup: firstText(captured, ["operations.backup.state"]),
    monitoring: firstText(captured, ["operations.monitoring.state"]),
    observedAt: firstText(captured, ["operations.observedAt"]),
  };
}

function Readiness({ value }: { value: ReviewReadiness }) {
  const styles = value.tone === "ready" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : value.tone === "attention" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-red-200 bg-red-50 text-red-800";
  return <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10.5px] font-semibold", styles)}>{value.tone === "ready" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}{value.label}</span>;
}

const statusClass: Record<ChangePackageStatus, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700", submitted: "border-amber-200 bg-amber-50 text-amber-700", approved: "border-emerald-200 bg-emerald-50 text-emerald-700", changes_requested: "border-orange-200 bg-orange-50 text-orange-700", rejected: "border-red-200 bg-red-50 text-red-700", executing: "border-blue-200 bg-blue-50 text-blue-700", executed: "border-emerald-200 bg-emerald-50 text-emerald-700", execution_failed: "border-red-200 bg-red-50 text-red-700",
};
function Status({ status }: { status: ChangePackageStatus }) { return <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-semibold", statusClass[status])}>{title(status)}</span>; }

export default function ChangeReviewApproval() {
  const { packageId } = useParams<{ packageId: string }>();
  if (packageId && /^CP-\d{4}-\d+$/i.test(packageId)) return <Navigate to="/approvals?reference=legacy-sample" replace />;
  return packageId ? <VmPackageReview packageId={packageId} /> : <VmApprovalQueue />;
}

function VmApprovalQueue() {
  const { search } = useLocation();
  const [packages, setPackages] = useState<VmChangePackage[]>([]);
  const [vms, setVms] = useState<AzureVirtualMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(null); try { const [savedPackages, discoveredVms] = await Promise.all([listVmChangePackages(), listAzureVirtualMachines()]); setPackages(savedPackages); setVms(discoveredVms); } catch (cause) { setError(cause instanceof AzureControlPlaneError ? cause.message : cause instanceof Error ? cause.message : "Unable to load VM change packages."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const submitted = packages.filter((pkg) => pkg.status === "submitted");
  const vmById = useMemo(() => new Map(vms.map((vm) => [vm.id.toLowerCase(), vm])), [vms]);
  const openedLegacySample = new URLSearchParams(search).get("reference") === "legacy-sample";

  return <div className="min-w-0 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2"><nav className="text-[12px] text-slate-500"><Link to="/resources" className="hover:text-[#1B4F91]">Azure Resources</Link><span className="mx-1.5">/</span><span className="font-medium text-slate-800">Change Review &amp; Approval</span></nav><button type="button" onClick={() => void load()} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"><RefreshCw className="h-3.5 w-3.5" />Refresh queue</button></div>
    <header className="mb-4 flex flex-wrap items-start gap-3"><div><h1 className="text-[20px] font-semibold text-slate-900">VM Change Review &amp; Approval</h1><p className="mt-1 max-w-3xl text-[12px] text-slate-600">Review only durable Azure VM change packages. Approval is a human governance decision; it does not execute an Azure action.</p></div><div className="ml-auto rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[11.5px] text-[#1B4F91]"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Self-approval is prohibited</div></header>
    {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</div>}
    {openedLegacySample && <div className="mb-3 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[12px] text-[#16406f]"><strong>Live VM approval queue opened.</strong> The previous SQL/AWS sample package is not part of the Azure pilot. Select a real saved VM package below.</div>}
    <Panel title="Approval queue" right={<span className="text-[11px] text-slate-500">{loading ? "Loading…" : `${submitted.length} awaiting review`}</span>}>
      <p className="mb-3 text-[11.5px] text-slate-600">Each request is compared with the current Azure VM inventory before a reviewer opens it. A package is never treated as evidence of the VM’s current state.</p>
      {loading ? <p className="py-8 text-center text-[12px] text-slate-500">Loading saved VM change packages…</p> : packages.length ? <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-[12px]"><thead className="border-b border-[#E2E8F0] text-[10.5px] uppercase tracking-wide text-slate-500"><tr><th className="pb-2 font-medium">Package</th><th className="pb-2 font-medium">Target VM</th><th className="pb-2 font-medium">Requested action</th><th className="pb-2 font-medium">Current Azure state</th><th className="pb-2 font-medium">Review readiness</th><th className="pb-2 font-medium">Risk</th><th className="pb-2 font-medium">Status</th><th className="pb-2" /></tr></thead><tbody>{packages.map((pkg) => { const vm = vmById.get(pkg.targetResourceId.toLowerCase()) ?? null; const readiness = reviewReadiness(pkg, vm); return <tr key={pkg.id} className="border-b border-[#EEF2F6]"><td className="py-3 font-mono text-[11px] font-semibold text-slate-800">{pkg.packageNumber}<div className="mt-0.5 font-sans text-[10.5px] font-normal text-slate-500">Submitted {dateTime(pkg.submittedAt)}</div></td><td className="py-3"><div className="font-medium text-slate-800">{pkg.targetName}</div><div className="mt-0.5 text-[10.5px] text-slate-500">{pkg.resourceGroup} · {pkg.region}</div></td><td className="py-3 text-slate-700">{pkg.actionLabel}</td><td className="py-3"><div className="font-medium text-slate-800">{vm?.powerState ?? "Not discovered"}</div><div className="mt-0.5 text-[10.5px] text-slate-500">{vm?.provisioningState ?? "No live VM observation"}</div></td><td className="py-3"><Readiness value={readiness} /></td><td className="py-3"><span className={cn("font-medium", pkg.riskLevel === "High" ? "text-red-700" : pkg.riskLevel === "Medium" ? "text-amber-700" : "text-emerald-700")}>{pkg.riskLevel} · {pkg.riskScore}/100</span></td><td className="py-3"><Status status={pkg.status} /></td><td className="py-3 text-right"><Link to={`/approvals/${pkg.id}`} className="text-[11.5px] font-medium text-[#1B4F91] hover:underline">Review package</Link></td></tr>; })}</tbody></table></div> : <div className="py-8 text-center"><p className="text-[12px] text-slate-600">No VM change packages are visible to your account.</p><Link to="/changes" className="mt-2 inline-block text-[12px] font-medium text-[#1B4F91] underline">Create a VM change package</Link></div>}
    </Panel>
  </div>;
}

function VmPackageReview({ packageId }: { packageId: string }) {
  const navigate = useNavigate();
  const { user, hasPlatformAdminRole } = useAuth();
  const [pkg, setPkg] = useState<VmChangePackage | null>(null);
  const [reviews, setReviews] = useState<VmChangePackageReview[]>([]);
  const [vms, setVms] = useState<AzureVirtualMachine[]>([]);
  const [operations, setOperations] = useState<AzureVmOperations | null>(null);
  const [terraformRuns, setTerraformRuns] = useState<TerraformRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const load = useCallback(async () => { setLoading(true); setError(null); try { await syncTerraformRuns(packageId).catch(() => undefined); const [packageResult, reviewResult, machines, runs] = await Promise.all([getVmChangePackage(packageId), listVmChangePackageReviews(packageId), listAzureVirtualMachines(), listTerraformRuns(packageId)]); setPkg(packageResult); setReviews(reviewResult); setVms(machines); setTerraformRuns(runs); } catch (cause) { setError(cause instanceof AzureControlPlaneError ? cause.message : cause instanceof Error ? cause.message : "Unable to load the package review."); } finally { setLoading(false); } }, [packageId]);
  useEffect(() => { void load(); }, [load]);
  const selectedVm = useMemo(() => pkg ? vms.find((vm) => vm.id.toLowerCase() === pkg.targetResourceId.toLowerCase()) ?? null : null, [pkg, vms]);
  useEffect(() => { if (!selectedVm) { setOperations(null); return; } let cancelled = false; getAzureVmOperations(selectedVm).then((result) => { if (!cancelled) setOperations(result); }).catch((cause) => { if (!cancelled) setError(cause instanceof AzureControlPlaneError ? cause.message : "Unable to load the live Azure VM observation."); }); return () => { cancelled = true; }; }, [selectedVm]);

  const readiness = useMemo(() => pkg ? reviewReadiness(pkg, selectedVm) : null, [pkg, selectedVm]);
  const savedPlan = useMemo(() => terraformRuns.find((run) => run.runType === "plan" && run.executionEngine === "hcp_terraform") ?? null, [terraformRuns]);
  const snapshot = useMemo(() => pkg ? capturedSnapshot(pkg) : null, [pkg]);
  const evidenceDrift = useMemo(() => {
    if (!pkg || !selectedVm || !snapshot) return [] as Array<{ label: string; captured: string | null; live: string | null }>;
    const rows = [
      { label: "Power state", captured: snapshot.powerState, live: selectedVm.powerState },
      { label: "VM size", captured: snapshot.vmSize, live: operations?.configuration.vmSize ?? selectedVm.vmSize },
      { label: "OS disk", captured: snapshot.osDiskSize ? `${snapshot.osDiskSize} GB` : null, live: operations?.configuration.osDisk.sizeGB ? `${operations.configuration.osDisk.sizeGB} GB` : null },
      { label: "Azure Backup", captured: snapshot.backup, live: operations?.backup.state ?? null },
      { label: "Azure Monitor", captured: snapshot.monitoring, live: operations?.monitoring.state ?? null },
    ];
    return rows.filter((row) => row.captured && row.live && row.captured.toLowerCase() !== row.live.toLowerCase());
  }, [operations, pkg, selectedVm, snapshot]);
  const eligibilityBlock = readiness?.tone === "blocked" ? readiness.detail : !savedPlan ? "An HCP Terraform saved plan has not been created yet." : savedPlan.status !== "succeeded" ? savedPlan.errorMessage || `The HCP Terraform plan is ${savedPlan.status}.` : null;
  const eligibleToReview = !!pkg && pkg.status === "submitted" && hasPlatformAdminRole && !!user && pkg.createdBy !== user.id && !eligibilityBlock;
  const reviewBlockedReason = !pkg ? "The package is unavailable." : pkg.status === "draft" ? "This draft must be submitted from Change Engineering before it can be reviewed." : pkg.status !== "submitted" ? "This package has already reached a final review state." : !hasPlatformAdminRole ? "Only a platform administrator can record this pilot approval." : pkg.createdBy === user?.id ? "You submitted this package, so self-approval is prohibited." : eligibilityBlock ?? null;
  const decide = async (decision: ChangeReviewDecision) => { if (!pkg || !eligibleToReview) return; if (comment.trim().length < 10) { setError("A review rationale of at least 10 characters is required for every decision."); return; } setSaving(true); setError(null); try { await reviewVmChangePackage(pkg.id, decision, comment, savedPlan); setComment(""); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to record the review decision."); } finally { setSaving(false); } };

  if (loading && !pkg) return <div className="p-4 text-[13px] text-slate-600">Loading VM change package…</div>;
  if (!pkg) return <div className="p-4"><Panel title="Change package"><p className="text-[12px] text-slate-600">This is not a live VM package available in your current Azure pilot scope. Select a package from the approval queue to review its current Azure evidence.</p><Link to="/approvals" className="mt-3 inline-block text-[12px] font-medium text-[#1B4F91] underline">Open approval queue</Link></Panel></div>;

  return <div className="min-w-0 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2"><nav className="text-[12px] text-slate-500"><Link to="/approvals" className="hover:text-[#1B4F91]">Change Review &amp; Approval</Link><ChevronRight className="h-3 w-3" /><span className="font-mono font-medium text-slate-800">{pkg.packageNumber}</span></nav><button type="button" onClick={() => void load()} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"><RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />Refresh evidence</button></div>
    <header className="mb-3 flex flex-wrap items-start gap-3"><div><div className="flex items-center gap-2"><h1 className="text-[20px] font-semibold text-slate-900">VM Change Package Review</h1><Status status={pkg.status} /></div><p className="mt-1 text-[12px] text-slate-600">{pkg.packageNumber} · Submitted {dateTime(pkg.submittedAt)} · The package is immutable; review decisions and execution results are recorded durably.</p></div><div className={cn("ml-auto rounded-md border px-3 py-2 text-[11.5px]", readiness?.tone === "ready" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800")}>{readiness?.tone === "ready" ? <ShieldCheck className="mr-1 inline h-3.5 w-3.5" /> : <ShieldAlert className="mr-1 inline h-3.5 w-3.5" />}{readiness?.label ?? "Checking Azure state"}</div></header>
    {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</div>}
    {pkg.status === "changes_requested" && <div className="mb-3 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-[12px] text-orange-900"><strong>Changes requested.</strong> The submitted package remains immutable; engineering must create a new package with the requested changes.</div>}
    {pkg.status === "approved" && <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-900"><strong>Approved package recorded.</strong> Execution may apply only the exact reviewed HCP Terraform saved plan.</div>}
    {pkg.status === "submitted" && readiness && <div className={cn("mb-3 rounded-md border px-3 py-2 text-[12px]", readiness.tone === "ready" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : readiness.tone === "attention" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-red-200 bg-red-50 text-red-900")}><strong>{readiness.label}.</strong> {readiness.detail}</div>}
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="space-y-3"><Panel title="Requested VM change"><Row label="Target VM" value={pkg.targetName} /><Row label="Azure scope" value={`${pkg.resourceGroup} · ${pkg.region}`} /><Row label="Resource ID" value={<span className="break-all font-mono text-[10.5px]">{pkg.targetResourceId}</span>} /><Row label="Requested action" value={pkg.actionLabel} /><Row label="Risk assessment" value={<span className={cn(pkg.riskLevel === "High" ? "text-red-700" : pkg.riskLevel === "Medium" ? "text-amber-700" : "text-emerald-700")}>{pkg.riskLevel} · {pkg.riskScore}/100</span>} /><Row label="Approval required" value={pkg.approvalRequired ? "Yes" : "No"} /><div className="mt-3"><div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Requested parameters</div>{Object.keys(pkg.parameters).length ? <div className="mt-1 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[11.5px] text-slate-700">{Object.entries(pkg.parameters).map(([key, value]) => <div key={key} className="flex justify-between gap-3 py-0.5"><span className="text-slate-500">{key}</span><span className="text-right font-medium">{formatValue(value)}</span></div>)}</div> : <p className="mt-1 text-[11.5px] text-slate-500">No additional parameter was required.</p>}</div><div className="mt-3"><div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Requester rationale</div><p className="mt-1 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[12px] leading-relaxed text-slate-700">{pkg.rationale}</p></div></Panel>
      <Panel title="Captured policy and validation evidence"><div className="space-y-1.5">{pkg.policyEvidence.length ? pkg.policyEvidence.map((entry, index) => { const value = entry as Record<string, unknown>; const passed = value.pass === true; return <div key={index} className="flex items-start justify-between gap-3 rounded border border-[#E2E8F0] px-2.5 py-2 text-[11.5px]"><span className="flex items-start gap-1.5 text-slate-700">{passed ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />}{formatValue(value.label)}</span><span className="max-w-[50%] text-right text-slate-500">{formatValue(value.detail)}</span></div>; }) : <p className="text-[12px] text-slate-500">No policy evidence was captured.</p>}</div><div className="mt-3 border-t border-[#E2E8F0] pt-3"><div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Validation plan</div><ol className="mt-1 space-y-1 text-[11.5px] text-slate-700">{pkg.validationPlan.map((step, index) => <li key={index} className="flex gap-2"><span className="font-medium text-[#1B4F91]">{index + 1}.</span><span>{formatValue(step)}</span></li>)}</ol></div></Panel></div>
      <div className="space-y-3"><Panel title="Live Azure observation" right={<span className="text-[10.5px] text-slate-500">Read-only</span>}>{selectedVm ? <><Row label="Current power state" value={selectedVm.powerState} /><Row label="Provisioning" value={selectedVm.provisioningState} /><Row label="VM size" value={operations?.configuration.vmSize ?? selectedVm.vmSize} /><Row label="Operating system" value={operations?.configuration.osType ?? selectedVm.osType} /><Row label="OS disk" value={operations?.configuration.osDisk.sizeGB ? `${operations.configuration.osDisk.sizeGB} GB` : "Not reported"} /><Row label="Azure Backup" value={operations ? title(operations.backup.state) : "Loading"} /><Row label="Azure Monitor" value={operations ? title(operations.monitoring.state) : "Loading"} /><Row label="Observed" value={operations?.observedAt ? dateTime(operations.observedAt) : "Awaiting Azure observation"} /></> : <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-[11.5px] text-amber-900"><FileWarning className="h-4 w-4 shrink-0" />The target VM is not currently visible in the connected Azure scope. The package’s captured pre-change evidence remains available for review.</div>}</Panel>
      <Panel title="HCP Terraform saved plan" right={<span className="text-[10.5px] text-slate-500">Immutable evidence</span>}>{savedPlan ? <><Row label="Plan status" value={savedPlan.status} /><Row label="HCP status" value={savedPlan.hcpRunStatus} /><Row label="Workspace" value={savedPlan.hcpWorkspaceName} /><Row label="Source revision" value={savedPlan.sourceRevision ? shortId(savedPlan.sourceRevision) : "Not reported"} /><Row label="Plan digest" value={savedPlan.planSha256 ? shortId(savedPlan.planSha256) : "Not reported"} /><Row label="Boundary check" value={savedPlan.reconciliation.matched === true ? "Exact VM only" : "Blocked or pending"} /></> : <p className="text-[12px] text-slate-600">No HCP Terraform plan is recorded for this package.</p>}</Panel>
      <Panel title="Evidence freshness & drift" right={<span className="text-[10.5px] text-slate-500">Package vs live Azure</span>}>
        <p className="mb-2 text-[11.5px] leading-relaxed text-slate-600">The package preserves its original pre-change evidence. This comparison shows whether the live Azure evidence has changed since submission.</p>
        <Row label="Package evidence captured" value={snapshot?.observedAt ? dateTime(snapshot.observedAt) : dateTime(pkg.createdAt)} />
        <Row label="Live observation" value={operations?.observedAt ? dateTime(operations.observedAt) : "Awaiting Azure observation"} />
        {evidenceDrift.length ? <div className="mt-2 space-y-1.5 rounded-md border border-amber-200 bg-amber-50 p-2.5">{evidenceDrift.map((item) => <div key={item.label} className="text-[11px] text-amber-900"><span className="font-semibold">{item.label} changed:</span> {item.captured} <span className="text-amber-700">→</span> {item.live}</div>)}</div> : <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-[11px] text-emerald-900">No material difference was found between the captured evidence fields and the current Azure observation.</div>}
        {readiness?.tone === "attention" && <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">Review may continue, but the reviewer must confirm the current Azure state before approving.</div>}
      </Panel>
      <Panel title="Approval record" right={<span className="text-[10.5px] text-slate-500">Durable audit trail</span>}>{reviews.length ? <div className="space-y-2">{reviews.map((review) => <div key={review.id} className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2.5"><div className="flex items-center gap-2"><Status status={review.decision} /><span className="ml-auto text-[10.5px] text-slate-500">{dateTime(review.reviewedAt)}</span></div><div className="mt-1 text-[11px] text-slate-600">Reviewer ID: <span className="font-mono">{shortId(review.reviewedBy)}</span></div>{review.comment && <p className="mt-1 text-[11.5px] leading-relaxed text-slate-700">{review.comment}</p>}</div>)}</div> : <p className="text-[12px] text-slate-600">No decision has been recorded. The package is awaiting an authorized reviewer.</p>}</Panel>
      <Panel title="Reviewer decision"><p className="mb-2 text-[11.5px] leading-relaxed text-slate-600">An authorized platform administrator may decide only after a clean HCP Terraform saved plan is recorded. The request owner cannot approve their own package.</p>{eligibleToReview ? <><textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} placeholder="Required: explain the approval, requested change, or rejection using the live VM evidence (10+ characters)." className="w-full rounded-md border border-[#CBD5E1] p-2 text-[11.5px] outline-none focus:border-[#1B4F91]" /><div className="mt-2 grid gap-2 sm:grid-cols-3"><button type="button" disabled={saving} onClick={() => void decide("approved")} className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-emerald-700 px-2 text-[11px] font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"><CheckCircle2 className="h-3.5 w-3.5" />Approve</button><button type="button" disabled={saving} onClick={() => void decide("changes_requested")} className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50"><AlertTriangle className="h-3.5 w-3.5" />Request changes</button><button type="button" disabled={saving} onClick={() => void decide("rejected")} className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-red-300 bg-red-50 px-2 text-[11px] font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"><XCircle className="h-3.5 w-3.5" />Reject</button></div></> : <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-[11.5px] text-slate-600">{reviewBlockedReason}</div>}<div className="mt-3 border-t border-[#E2E8F0] pt-3">{pkg.status === "approved" ? <Link to={`/execution/${pkg.id}`} className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-[#1B4F91] px-3 text-[11.5px] font-semibold text-white hover:bg-[#16406f]">Open HCP Terraform execution</Link> : <p className="text-[10.5px] text-slate-500">Approval never calls Azure directly. The Execution Center applies the reviewed HCP saved plan.</p>}</div></Panel></div>
    </div>
    <div className="mt-3 flex flex-wrap gap-2"><Link to="/approvals" className="inline-flex h-8 items-center rounded-md border border-[#E2E8F0] bg-white px-3 text-[11.5px] font-medium text-slate-700 hover:bg-slate-50">Back to approval queue</Link><Link to={`/resources/virtual-machines/${encodeURIComponent(pkg.targetName)}`} className="inline-flex h-8 items-center rounded-md border border-[#E2E8F0] bg-white px-3 text-[11.5px] font-medium text-[#1B4F91] hover:bg-slate-50">Open VM Digital Twin</Link>{pkg.status === "changes_requested" && <button type="button" onClick={() => navigate("/changes")} className="inline-flex h-8 items-center rounded-md bg-[#1B4F91] px-3 text-[11.5px] font-medium text-white hover:bg-[#16406f]">Create revised package</button>}</div>
  </div>;
}
