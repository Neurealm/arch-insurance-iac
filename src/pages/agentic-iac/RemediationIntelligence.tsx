import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Activity, AlertTriangle, CheckCircle2, Code2, HardDrive, Info, Network, RefreshCw, ShieldCheck, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AzureControlPlaneError, getAzureVmOperations, listAzureVirtualMachines,
  type AzureVirtualMachine, type AzureVmOperations,
} from "./azureControlPlane";

function Panel({ title, right, children, className }: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-md border border-[#E2E8F0] bg-white", className)}>
    <header className="flex items-center gap-2 border-b border-[#E2E8F0] px-3 py-2"><h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-700">{title}</h2>{right && <div className="ml-auto">{right}</div>}</header>
    <div className="p-3">{children}</div>
  </section>;
}

function Row({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "ok" | "warn" | "critical" }) {
  return <div className="flex items-start justify-between gap-4 py-1 text-[12px]"><span className="text-slate-500">{label}</span><span className={cn("text-right font-medium text-slate-800", tone === "ok" && "text-emerald-700", tone === "warn" && "text-amber-700", tone === "critical" && "text-red-700")}>{value}</span></div>;
}

function statusLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function metric(value: number | null, suffix = "%") { return value === null ? "Not available" : `${value}${suffix}`; }

export default function RemediationIntelligence() {
  const { vmName } = useParams<{ vmName: string }>();
  const navigate = useNavigate();
  const [vms, setVms] = useState<AzureVirtualMachine[]>([]);
  const [operations, setOperations] = useState<AzureVmOperations | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawOpen, setRawOpen] = useState(false);

  const selectedVm = useMemo(() => vmName ? vms.find((vm) => vm.name.toLowerCase() === vmName.toLowerCase()) ?? null : vms[0] ?? null, [vmName, vms]);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setVms(await listAzureVirtualMachines()); }
    catch (cause) { setError(cause instanceof AzureControlPlaneError ? cause.message : "Unable to load Azure virtual machines."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!selectedVm) { setOperations(null); return; }
    let cancelled = false;
    setOperations(null);
    getAzureVmOperations(selectedVm).then((result) => { if (!cancelled) setOperations(result); }).catch((cause) => {
      if (!cancelled) setError(cause instanceof AzureControlPlaneError ? cause.message : "Unable to load Azure VM operations data.");
    });
    return () => { cancelled = true; };
  }, [selectedVm]);

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const findings = useMemo(() => {
    if (!selectedVm || !operations) return [] as { title: string; detail: string; tone: "ok" | "warn" | "critical" }[];
    const result: { title: string; detail: string; tone: "ok" | "warn" | "critical" }[] = [];
    if (!/running/i.test(selectedVm.powerState)) result.push({ title: "VM is not running", detail: `Azure reports ${selectedVm.powerState}. Confirm this state is intentional before considering a start or stop action.`, tone: "warn" });
    if (operations.monitoring.state !== "available") result.push({ title: "Performance telemetry is not available", detail: "CPU, memory, and disk utilization require Azure Monitor / VM Insights to be configured for this VM.", tone: "warn" });
    if (operations.backup.state !== "protected") result.push({ title: "Backup protection is not confirmed", detail: operations.backup.state === "not_protected" ? "Azure Backup does not report this VM as protected." : "Azure Backup data is not available from the connected scope.", tone: "warn" });
    if (operations.patching.state === "updates_available") result.push({ title: "Updates are available", detail: `${operations.patching.updatesAvailable ?? "Some"} update(s) are reported by Azure Update Manager.`, tone: "warn" });
    if (operations.patching.state === "not_configured" || operations.patching.state === "unavailable") result.push({ title: "Patch assessment is unavailable", detail: "Azure Update Manager has not supplied a current patch assessment for this VM.", tone: "warn" });
    if (operations.bootDiagnostics.state === "enabled") result.push({ title: "Boot diagnostics enabled", detail: "Boot diagnostics are enabled in Azure for troubleshooting evidence.", tone: "ok" });
    return result;
  }, [operations, selectedVm]);

  if (loading && !selectedVm) return <div className="p-4 text-[13px] text-slate-600">Loading Azure VM assessment…</div>;
  if (!selectedVm) return <div className="p-4"><Panel title="VM Remediation Intelligence"><p className="text-[13px] text-slate-600">No Azure virtual machines are available in the connected pilot scope.</p>{error && <p className="mt-2 text-[12px] text-red-700">{error}</p>}<Link to="/resources" className="mt-3 inline-block text-[12px] font-medium text-[#1B4F91] underline">Back to Azure Resources</Link></Panel></div>;

  const config = operations?.configuration;
  const metricsReady = operations?.monitoring.state === "available";
  const observation = operations?.observedAt ? new Date(operations.observedAt).toLocaleString() : "Awaiting Azure observation";
  const attention = findings.some((item) => item.tone !== "ok");

  return <div className="min-w-0 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <nav className="text-[12px] text-slate-500"><Link to="/resources" className="hover:text-[#1B4F91]">Azure Resources</Link><span className="mx-1.5">/</span><span className="font-medium text-slate-800">VM Remediation Intelligence</span></nav>
      <div className="ml-auto flex items-center gap-2">
        {vms.length > 1 && <select value={selectedVm.name} onChange={(event) => navigate(`/remediation/virtual-machines/${encodeURIComponent(event.target.value)}`)} className="h-8 max-w-[250px] rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px] text-slate-700">{vms.map((vm) => <option key={vm.id} value={vm.name}>{vm.name}</option>)}</select>}
        <button type="button" onClick={() => void refresh()} disabled={refreshing} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />Refresh assessment</button>
      </div>
    </div>

    <section className={cn("mb-3 flex flex-wrap items-center gap-3 rounded-md border px-4 py-3", attention ? "border-amber-300 bg-amber-50" : "border-emerald-200 bg-emerald-50") }>
      {attention ? <AlertTriangle className="h-7 w-7 shrink-0 text-amber-600" /> : <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-600" />}
      <div className="min-w-[260px] flex-1"><div className={cn("text-[11px] font-semibold uppercase tracking-wider", attention ? "text-amber-700" : "text-emerald-700")}>{attention ? "Operational attention recommended" : "No condition identified from available Azure data"}</div><h1 className="text-[16px] font-semibold text-slate-900">{selectedVm.name}</h1><p className="text-[12px] text-slate-600">Live Azure VM assessment · {selectedVm.resourceGroup} · {selectedVm.location}</p></div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11.5px] sm:grid-cols-4"><div><div className="uppercase tracking-wide text-slate-500">Power state</div><strong>{selectedVm.powerState}</strong></div><div><div className="uppercase tracking-wide text-slate-500">Provisioning</div><strong>{selectedVm.provisioningState}</strong></div><div><div className="uppercase tracking-wide text-slate-500">Observation</div><strong>{operations ? "Live Azure" : "Loading"}</strong></div><div><div className="uppercase tracking-wide text-slate-500">Actions</div><strong>Not enabled</strong></div></div>
    </section>
    {error && <section className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900"><strong>Azure data notice:</strong> {error}</section>}

    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <Panel title="VM condition" right={<span className="text-[11px] text-slate-500">{observation}</span>}>
        <div className="mb-3 flex items-center gap-2 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-2"><Activity className="h-4 w-4 text-[#1B4F91]" /><div><div className="text-[12px] font-semibold text-slate-800">{selectedVm.name}</div><div className="text-[11px] text-slate-500">Azure Virtual Machine · {config?.osType ?? selectedVm.osType}</div></div><span className={cn("ml-auto rounded border px-1.5 py-0.5 text-[10.5px] font-medium", /running/i.test(selectedVm.powerState) ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700")}>{selectedVm.powerState}</span></div>
        <Row label="VM size" value={config?.vmSize ?? selectedVm.vmSize} /><Row label="Operating system" value={config?.osType ?? selectedVm.osType} /><Row label="Availability zones" value={config?.zones.length ? config.zones.join(", ") : "Not zonal"} /><Row label="Security type" value={config?.securityType ?? "Not reported"} /><Row label="Managed identity" value={config?.identityType ?? "Not assigned"} /><Row label="Boot diagnostics" value={operations ? statusLabel(operations.bootDiagnostics.state) : "Loading"} tone={operations?.bootDiagnostics.state === "enabled" ? "ok" : "warn"} />
        <div className="mt-3 border-t border-[#E2E8F0] pt-2"><div className="text-[12px] font-semibold text-slate-800">Performance coverage</div><Row label="CPU utilization" value={metricsReady ? metric(operations?.monitoring.cpuPercent ?? null) : "Azure Monitor not configured"} /><Row label="Memory utilization" value={metricsReady ? metric(operations?.monitoring.memoryPercent ?? null) : "Azure Monitor not configured"} /><Row label="Disk used" value={metricsReady ? metric(operations?.monitoring.diskUsedPercent ?? null) : "Azure Monitor not configured"} /></div>
      </Panel>

      <Panel title="Evidence-based assessment" right={<span className="rounded border border-[#CFE0F3] bg-[#EFF4FB] px-1.5 py-0.5 text-[10.5px] font-medium text-[#1B4F91]">Read-only</span>}>
        <p className="mb-3 text-[12px] leading-relaxed text-slate-600">This assessment reports only what the Azure control plane currently provides. It does not infer an application issue or change the VM.</p>
        <div className="space-y-2">{operations ? findings.map((item) => <div key={item.title} className={cn("rounded-md border p-2.5", item.tone === "ok" ? "border-emerald-200 bg-emerald-50/50" : item.tone === "critical" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50/60")}><div className="flex gap-1.5 text-[12px] font-semibold text-slate-800">{item.tone === "ok" ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />}{item.title}</div><p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">{item.detail}</p></div>) : <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-[12px] text-slate-600">Loading Azure operational evidence…</div>}</div>
        <div className="mt-3 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] p-2.5"><div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1B4F91]"><ShieldCheck className="h-3.5 w-3.5" />Governed next step</div><p className="mt-1 text-[11.5px] leading-relaxed text-slate-700">A VM action can be proposed only after the action is mutually agreed for this pilot and its approval and validation workflow is configured. No Azure action is available from this screen.</p></div>
      </Panel>

      <div className="flex flex-col gap-3"><Panel title="Storage & protection"><div className="flex items-center gap-2 text-[12px] font-semibold text-slate-800"><HardDrive className="h-4 w-4 text-[#1B4F91]" />OS disk</div><Row label="Name" value={config?.osDisk.name ?? "Not reported"} /><Row label="Size" value={config?.osDisk.sizeGB === null || config?.osDisk.sizeGB === undefined ? "Not reported" : `${config.osDisk.sizeGB} GB`} /><Row label="SKU" value={config?.osDisk.storageSku ?? "Not reported"} /><Row label="Caching" value={config?.osDisk.caching ?? "Not reported"} /><div className="mt-2 border-t border-[#E2E8F0] pt-2"><Row label="Data disks" value={config?.dataDisks.length ? config.dataDisks.map((disk) => disk.name).join(", ") : "None"} /><Row label="Azure Backup" value={operations ? statusLabel(operations.backup.state) : "Loading"} tone={operations?.backup.state === "protected" ? "ok" : "warn"} /><Row label="Last backup" value={operations?.backup.lastSuccessfulBackup ?? "Not reported"} /><Row label="Patch assessment" value={operations ? statusLabel(operations.patching.state) : "Loading"} tone={operations?.patching.state === "compliant" ? "ok" : "warn"} /></div></Panel>
      <Panel title="Network & Azure scope"><div className="flex items-center gap-2 text-[12px] font-semibold text-slate-800"><Network className="h-4 w-4 text-[#1B4F91]" />Connected infrastructure</div><Row label="Resource group" value={selectedVm.resourceGroup} /><Row label="Subscription" value={selectedVm.subscriptionId} /><Row label="Network interface" value={operations?.network.networkInterface ?? "Not reported"} /><Row label="Private IPs" value={operations?.network.privateIps.length ? operations.network.privateIps.join(", ") : "Not reported"} /><Row label="Network security groups" value={operations?.network.networkSecurityGroups.length ? operations.network.networkSecurityGroups.join(", ") : "Not reported"} /><Row label="Load balancers" value={operations?.network.loadBalancers.length ? operations.network.loadBalancers.join(", ") : "None reported"} /></Panel></div>
    </div>

    <Panel className="mt-3" title="Assessment data coverage" right={<button type="button" onClick={() => setRawOpen((open) => !open)} className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#1B4F91]"><Code2 className="h-3.5 w-3.5" />{rawOpen ? "Hide" : "View"} raw Azure observation</button>}>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><Coverage label="Azure control plane" state="Connected" detail="VM configuration and power state" tone="ok" /><Coverage label="Azure Monitor" state={operations ? statusLabel(operations.monitoring.state) : "Loading"} detail="CPU, memory, disk utilization" tone={metricsReady ? "ok" : "warn"} /><Coverage label="Azure Backup" state={operations ? statusLabel(operations.backup.state) : "Loading"} detail="Protection and last successful backup" tone={operations?.backup.state === "protected" ? "ok" : "warn"} /><Coverage label="Update Manager" state={operations ? statusLabel(operations.patching.state) : "Loading"} detail="Patch assessment and pending updates" tone={operations?.patching.state === "compliant" ? "ok" : "warn"} /></div>
      {rawOpen && <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-slate-950 p-3 text-[11px] leading-5 text-slate-100">{JSON.stringify(operations, null, 2)}</pre>}
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500"><Info className="h-3.5 w-3.5" />Data is read from the connected Azure control plane with managed identity; opening this view does not modify infrastructure.</div>
    </Panel>
    <Link to={`/resources/virtual-machines/${encodeURIComponent(selectedVm.name)}`} className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1B4F91] hover:underline"><Wrench className="h-3.5 w-3.5" />Open Digital Twin</Link>
  </div>;
}

function Coverage({ label, state, detail, tone }: { label: string; state: string; detail: string; tone: "ok" | "warn" }) {
  return <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2.5"><div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-800">{tone === "ok" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}{label}</div><div className={cn("mt-1 text-[12px] font-medium", tone === "ok" ? "text-emerald-700" : "text-amber-700")}>{state}</div><p className="mt-0.5 text-[11px] text-slate-500">{detail}</p></div>;
}
