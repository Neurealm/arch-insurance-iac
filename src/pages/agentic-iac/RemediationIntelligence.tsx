import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Activity, AlertTriangle, ArrowRight, BellRing, CheckCircle2, Clock3, Code2, HardDrive, Info, Network, RefreshCw, Scale, Search, ShieldCheck, Wrench } from "lucide-react";
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

function dateTime(value: string | null) { return value ? new Date(value).toLocaleString() : "Not reported"; }

export default function RemediationIntelligence() {
  const { vmName } = useParams<{ vmName: string }>();
  const [searchParams] = useSearchParams();
  return vmName
    ? <VmRemediationAssessment vmName={vmName} vmResourceId={searchParams.get("resourceId")} />
    : <VmRemediationTargetSelection />;
}

/** The global Remediation entry must not silently assess an arbitrary VM. */
function VmRemediationTargetSelection() {
  const [vms, setVms] = useState<AzureVirtualMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [resourceGroup, setResourceGroup] = useState("all");
  const [powerState, setPowerState] = useState("all");
  const [environment, setEnvironment] = useState("all");

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setVms(await listAzureVirtualMachines()); }
    catch (cause) { setError(cause instanceof AzureControlPlaneError ? cause.message : "Unable to load the Azure VM inventory."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const regions = useMemo(() => [...new Set(vms.map((vm) => vm.location).filter(Boolean))].sort(), [vms]);
  const resourceGroups = useMemo(() => [...new Set(vms.map((vm) => vm.resourceGroup).filter(Boolean))].sort(), [vms]);
  const powerStates = useMemo(() => [...new Set(vms.map((vm) => vm.powerState).filter(Boolean))].sort(), [vms]);
  const environments = useMemo(() => [...new Set(vms.map((vm) => vm.tags.environment ?? vm.tags.Environment ?? "Not tagged"))].sort(), [vms]);
  const filteredVms = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return vms.filter((vm) => {
      const vmEnvironment = vm.tags.environment ?? vm.tags.Environment ?? "Not tagged";
      const matchesSearch = !needle || [vm.name, vm.resourceGroup, vm.location, vm.powerState, vmEnvironment].some((value) => value.toLowerCase().includes(needle));
      return matchesSearch && (region === "all" || vm.location === region) && (resourceGroup === "all" || vm.resourceGroup === resourceGroup) && (powerState === "all" || vm.powerState === powerState) && (environment === "all" || vmEnvironment === environment);
    });
  }, [environment, powerState, query, region, resourceGroup, vms]);

  return <div className="min-w-0 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2"><nav className="text-[12px] text-slate-500"><Link to="/resources" className="hover:text-[#1B4F91]">Azure Resources</Link><span className="mx-1.5">/</span><span className="font-medium text-slate-800">Remediation Intelligence</span></nav><button type="button" onClick={() => void load()} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"><RefreshCw className="h-3.5 w-3.5" />Refresh VM inventory</button></div>
    <header className="mb-4 flex flex-wrap items-start gap-3"><div><h1 className="text-[20px] font-semibold text-slate-900">Select a VM to assess</h1><p className="mt-1 max-w-3xl text-[12px] text-slate-600">Choose an Azure virtual machine to view its live, read-only operational assessment. This screen never changes the selected VM.</p></div><div className="ml-auto rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[11.5px] text-[#1B4F91]"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Read-only Azure assessment</div></header>
    {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</div>}
    <Panel title="Live Azure VM inventory" right={<span className="text-[11px] text-slate-500">{loading ? "Loading…" : `${filteredVms.length} of ${vms.length} VMs`}</span>}>
      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_150px_180px_170px_150px]"><label className="relative block"><Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search VM, resource group, region, state…" className="h-9 w-full rounded-md border border-[#CBD5E1] pl-8 pr-2.5 text-[12px]" /></label><RemediationFilterSelect value={region} onChange={setRegion} label="All regions" values={regions} /><RemediationFilterSelect value={resourceGroup} onChange={setResourceGroup} label="All resource groups" values={resourceGroups} /><RemediationFilterSelect value={powerState} onChange={setPowerState} label="All power states" values={powerStates} /><RemediationFilterSelect value={environment} onChange={setEnvironment} label="All environments" values={environments} /></div>
      {loading ? <p className="py-8 text-center text-[12px] text-slate-500">Loading the connected Azure VM inventory…</p> : filteredVms.length ? <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[780px] text-left text-[12px]"><thead className="border-b border-[#E2E8F0] text-[10.5px] uppercase tracking-wide text-slate-500"><tr><th className="pb-2 font-medium">Virtual machine</th><th className="pb-2 font-medium">Resource group</th><th className="pb-2 font-medium">Region</th><th className="pb-2 font-medium">Power state</th><th className="pb-2 font-medium">Environment</th><th className="pb-2" /></tr></thead><tbody>{filteredVms.map((vm) => <tr key={vm.id} className="border-b border-[#EEF2F6]"><td className="py-3 font-semibold text-slate-800">{vm.name}<div className="mt-0.5 text-[10.5px] font-normal text-slate-500">{vm.osType || "OS not reported"} · {vm.vmSize || "Size not reported"}</div></td><td className="py-3 text-slate-700">{vm.resourceGroup}</td><td className="py-3 text-slate-700">{vm.location}</td><td className="py-3 text-slate-700">{vm.powerState || "Not reported"}</td><td className="py-3 text-slate-700">{vm.tags.environment ?? vm.tags.Environment ?? "Not tagged"}</td><td className="py-3 text-right"><Link to={`/remediation/virtual-machines/${encodeURIComponent(vm.name)}?resourceId=${encodeURIComponent(vm.id)}`} className="inline-flex h-8 items-center gap-1 rounded-md bg-[#1B4F91] px-2.5 text-[11.5px] font-medium text-white hover:bg-[#16406f]">Assess VM<ArrowRight className="h-3.5 w-3.5" /></Link></td></tr>)}</tbody></table></div> : <div className="py-8 text-center"><p className="text-[12px] text-slate-600">{vms.length ? "No virtual machines match these filters." : "No Azure virtual machine is available in the connected scope."}</p>{vms.length > 0 && <button type="button" onClick={() => { setQuery(""); setRegion("all"); setResourceGroup("all"); setPowerState("all"); setEnvironment("all"); }} className="mt-2 text-[12px] font-medium text-[#1B4F91] underline">Clear filters</button>}</div>}
    </Panel>
  </div>;
}

function RemediationFilterSelect({ value, onChange, label, values }: { value: string; onChange: (value: string) => void; label: string; values: string[] }) {
  return <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-2.5 text-[12px] text-slate-700"><option value="all">{label}</option>{values.map((item) => <option key={item} value={item}>{item}</option>)}</select>;
}

function VmRemediationAssessment({ vmName, vmResourceId }: { vmName: string; vmResourceId: string | null }) {
  const [vms, setVms] = useState<AzureVirtualMachine[]>([]);
  const [operations, setOperations] = useState<AzureVmOperations | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawOpen, setRawOpen] = useState(false);

  const selectedVm = useMemo(() => vmResourceId
    ? vms.find((vm) => vm.id.toLowerCase() === vmResourceId.toLowerCase()) ?? null
    : vms.find((vm) => vm.name.toLowerCase() === vmName.toLowerCase()) ?? null, [vmName, vmResourceId, vms]);
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

  const intelligence = useMemo(() => {
    if (!selectedVm || !operations) return null;
    const policies: Array<{ label: string; result: string; weight: number; satisfied: boolean }> = [
      { label: "VM running state", result: selectedVm.powerState, weight: 20, satisfied: /running/i.test(selectedVm.powerState) },
      { label: "Performance telemetry", result: statusLabel(operations.monitoring.state), weight: 15, satisfied: operations.monitoring.state === "available" },
      { label: "Backup protection", result: statusLabel(operations.backup.state), weight: 20, satisfied: operations.backup.state === "protected" },
      { label: "Patch assessment", result: statusLabel(operations.patching.state), weight: 15, satisfied: operations.patching.state === "compliant" },
      { label: "Boot diagnostics", result: statusLabel(operations.bootDiagnostics.state), weight: 0, satisfied: operations.bootDiagnostics.state === "enabled" },
    ];
    const score = policies.reduce((total, policy) => total + (policy.satisfied ? 0 : policy.weight), 0);
    const level = score >= 50 ? "High" : score >= 25 ? "Medium" : "Low";
    const recommendations: Array<{ title: string; detail: string; approval: string }> = [];
    if (!/running/i.test(selectedVm.powerState)) recommendations.push({ title: "Confirm VM power state", detail: "Confirm the deallocated state is intentional before requesting a start action.", approval: "VM owner approval required" });
    if (operations.monitoring.state !== "available") recommendations.push({ title: "Enable Azure Monitor / VM Insights", detail: "Collect CPU, memory, and disk evidence before making a performance-related decision.", approval: "Monitoring owner approval required" });
    if (operations.backup.state !== "protected") recommendations.push({ title: "Confirm or configure Azure Backup", detail: "Validate the backup requirement and recovery objective for this VM.", approval: "Backup owner approval required" });
    if (operations.patching.state !== "compliant") recommendations.push({ title: "Run a patch assessment", detail: "Obtain a current Azure Update Manager assessment before planning maintenance.", approval: "Operations approval required" });
    return { policies, score, level, recommendations };
  }, [operations, selectedVm]);

  if (loading && !selectedVm) return <div className="p-4 text-[13px] text-slate-600">Loading Azure VM assessment…</div>;
  if (!selectedVm) return <div className="p-4"><Panel title="VM Remediation Intelligence"><p className="text-[13px] text-slate-600">This virtual machine is not available in the current connected Azure scope.</p>{error && <p className="mt-2 text-[12px] text-red-700">{error}</p>}<Link to="/remediation" className="mt-3 inline-block text-[12px] font-medium text-[#1B4F91] underline">Select another Azure VM</Link></Panel></div>;

  const config = operations?.configuration;
  const metricsReady = operations?.monitoring.state === "available";
  const observation = operations?.observedAt ? new Date(operations.observedAt).toLocaleString() : "Awaiting Azure observation";
  const attention = findings.some((item) => item.tone !== "ok");

  return <div className="min-w-0 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <nav className="text-[12px] text-slate-500"><Link to="/resources" className="hover:text-[#1B4F91]">Azure Resources</Link><span className="mx-1.5">/</span><span className="font-medium text-slate-800">VM Remediation Intelligence</span></nav>
      <div className="ml-auto flex items-center gap-2">
        <Link to="/remediation" className="inline-flex h-8 items-center rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-[#1B4F91] hover:bg-slate-50">Choose a different VM</Link>
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

    <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <Panel title="Pilot policy & risk score" right={<span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-semibold", intelligence?.level === "High" ? "border-red-200 bg-red-50 text-red-700" : intelligence?.level === "Medium" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700")}>{intelligence ? `${intelligence.level} · ${intelligence.score}/100` : "Loading"}</span>}>
        <p className="mb-2 text-[11.5px] leading-relaxed text-slate-600">A transparent pilot guardrail score from the live Azure evidence below. It is not an automated compliance decision.</p>
        <div className="space-y-1.5">{intelligence?.policies.map((policy) => <div key={policy.label} className="flex items-center justify-between gap-2 rounded border border-[#E2E8F0] px-2 py-1.5 text-[11.5px]"><span className="flex items-center gap-1.5 text-slate-700">{policy.satisfied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}{policy.label}</span><span className={cn("font-medium", policy.satisfied ? "text-emerald-700" : "text-amber-700")}>{policy.result}{policy.weight > 0 && !policy.satisfied ? ` · +${policy.weight}` : ""}</span></div>) ?? <p className="text-[12px] text-slate-500">Loading policy evidence…</p>}</div>
      </Panel>

      <Panel title="Historical state comparison" right={<span className="text-[11px] text-slate-500">Azure Change Analysis</span>}>
        {operations?.history.state === "available" ? operations.history.changes.length ? <div className="space-y-2">{operations.history.changes.slice(0, 3).map((change) => <div key={`${change.timestamp}-${change.changeType}`} className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2"><div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-800"><Clock3 className="h-3.5 w-3.5 text-[#1B4F91]" />{change.changeType} <span className="ml-auto font-normal text-slate-500">{dateTime(change.timestamp)}</span></div>{change.fields.length ? <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600">{change.fields.slice(0, 3).map((field) => <li key={field.field}><span className="font-medium text-slate-700">{field.field}:</span> {field.before ?? "not set"} → {field.after ?? "not set"}</li>)}</ul> : <p className="mt-1 text-[11px] text-slate-500">Azure recorded a resource update without individual property details.</p>}</div>)}</div> : <p className="text-[12px] text-slate-600">No Azure resource changes were recorded for this VM in the Change Analysis retention window.</p> : <p className="text-[12px] text-slate-600">Change Analysis is not available to the connected Azure identity.</p>}
      </Panel>

      <div className="flex flex-col gap-3"><Panel title="Azure Monitor alert correlation" right={<BellRing className="h-3.5 w-3.5 text-[#1B4F91]" />}>
        {operations?.alerts.state === "available" ? operations.alerts.alerts.length ? <div className="space-y-1.5">{operations.alerts.alerts.map((alert) => <div key={`${alert.name}-${alert.startedAt}`} className="rounded border border-amber-200 bg-amber-50 p-2 text-[11.5px]"><div className="font-semibold text-slate-800">{alert.name}</div><div className="mt-0.5 text-slate-600">{alert.severity} · {alert.state}{alert.monitorService ? ` · ${alert.monitorService}` : ""}</div></div>)}</div> : <p className="text-[12px] text-slate-600">No fired Azure Monitor alerts are correlated to this VM for the last seven days.</p> : <p className="text-[12px] text-slate-600">Alert correlation is unavailable because Azure Monitor alerts access is not configured for the connected identity.</p>}
      </Panel>
      <Panel title="Approved action recommendations" right={<Scale className="h-3.5 w-3.5 text-[#1B4F91]" />}>
        <p className="mb-2 text-[11.5px] text-slate-600">Recommendations only—no action is enabled or executed here.</p>
        <div className="space-y-1.5">{intelligence?.recommendations.map((recommendation) => <div key={recommendation.title} className="rounded border border-[#E2E8F0] p-2"><div className="text-[11.5px] font-semibold text-slate-800">{recommendation.title}</div><p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{recommendation.detail}</p><div className="mt-1 text-[10.5px] font-medium text-[#1B4F91]">{recommendation.approval}</div></div>) ?? <p className="text-[12px] text-slate-500">Loading recommendations…</p>}</div>
      </Panel></div>
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
