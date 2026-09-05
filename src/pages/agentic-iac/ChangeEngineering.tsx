import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck, Cpu, Filter, MapPin, Power, RefreshCw, Save, Search, ServerCog, ShieldCheck, Wrench, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { AzureControlPlaneError, getAzureVmOperations, listAzureVirtualMachines, type AzureVirtualMachine, type AzureVmOperations } from "./azureControlPlane";
import { listVmChangePackages, saveVmChangePackage, type VmChangePackage } from "./changePackages";
import { createTerraformPlan, diagnoseTerraformSource, type TerraformSourceDiagnostics } from "./automationCatalog";

type ActionId = "start_vm" | "stop_vm" | "restart_vm" | "resize_vm" | "increase_os_disk" | "configure_backup" | "enable_monitoring" | "assess_patches";
type ActionDefinition = { id: ActionId; label: string; description: string; category: string; requiresValue?: "vmSize" | "diskSize" };

const ACTIONS: ActionDefinition[] = [
  { id: "start_vm", label: "Start virtual machine", description: "Request a start for a deallocated VM after confirming it is intended to run.", category: "Power" },
  { id: "stop_vm", label: "Stop virtual machine", description: "Request a controlled power-off with pre- and post-change validation.", category: "Power" },
  { id: "restart_vm", label: "Restart virtual machine", description: "Request a controlled restart with pre- and post-change validation.", category: "Power" },
  { id: "resize_vm", label: "Change VM size", description: "Request a new Azure VM SKU. Capacity and regional availability must be validated before approval.", category: "Compute", requiresValue: "vmSize" },
  { id: "increase_os_disk", label: "Increase OS disk capacity", description: "Request a larger managed OS disk. Azure disk capacity cannot be reduced after expansion.", category: "Storage", requiresValue: "diskSize" },
  { id: "configure_backup", label: "Configure Azure Backup", description: "Request a recovery-services backup policy after confirming the required recovery objective.", category: "Protection" },
  { id: "enable_monitoring", label: "Enable Azure Monitor / VM Insights", description: "Request performance telemetry collection for CPU, memory, and disk capacity evidence.", category: "Monitoring" },
  { id: "assess_patches", label: "Run patch assessment", description: "Request a current Azure Update Manager assessment before planning maintenance.", category: "Maintenance" },
];

function Panel({ title, right, children, className }: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-md border border-[#E2E8F0] bg-white", className)}><header className="flex items-center gap-2 border-b border-[#E2E8F0] px-3 py-2"><h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-700">{title}</h2>{right && <div className="ml-auto">{right}</div>}</header><div className="p-3">{children}</div></section>;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) { return <div className="flex items-start justify-between gap-4 py-1 text-[12px]"><span className="text-slate-500">{label}</span><span className="text-right font-medium text-slate-800">{value}</span></div>; }
function title(value: string) { return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function newPackageNumber() { return `VM-CHG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`; }

export default function ChangeEngineering() {
  const { vmName } = useParams<{ vmName: string }>();
  const [searchParams] = useSearchParams();
  return vmName
    ? <VmChangePackageBuilder vmName={vmName} vmResourceId={searchParams.get("resourceId")} />
    : <VmChangeTargetSelection />;
}

function isRunning(powerState: string) { return /running/i.test(powerState); }

function PowerBadge({ powerState }: { powerState: string }) {
  const running = isRunning(powerState);
  const label = powerState ? powerState.replace(/^PowerState\//i, "").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Not reported";
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium", running ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600")}>
    <span className={cn("h-1.5 w-1.5 rounded-full", running ? "bg-emerald-500" : "bg-slate-400")} />{label}
  </span>;
}

function EnvironmentBadge({ environment }: { environment: string }) {
  const tone = environment.toLowerCase() === "production" ? "border-red-200 bg-red-50 text-red-700" : environment === "Not tagged" ? "border-slate-200 bg-slate-50 text-slate-500" : "border-[#CFE0F3] bg-[#EFF4FB] text-[#1B4F91]";
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-medium", tone)}>{environment}</span>;
}

/** The sidebar entry deliberately starts here; it never assumes a VM target. */
function VmChangeTargetSelection() {
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

  const vmEnvironment = (vm: AzureVirtualMachine) => vm.tags.environment ?? vm.tags.Environment ?? "Not tagged";
  const regions = useMemo(() => [...new Set(vms.map((vm) => vm.location).filter(Boolean))].sort(), [vms]);
  const resourceGroups = useMemo(() => [...new Set(vms.map((vm) => vm.resourceGroup).filter(Boolean))].sort(), [vms]);
  const powerStates = useMemo(() => [...new Set(vms.map((vm) => vm.powerState).filter(Boolean))].sort(), [vms]);
  const environments = useMemo(() => [...new Set(vms.map(vmEnvironment))].sort(), [vms]);
  const filteredVms = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return vms.filter((vm) => {
      const env = vmEnvironment(vm);
      const matchesSearch = !needle || [vm.name, vm.resourceGroup, vm.location, vm.powerState, env].some((value) => value.toLowerCase().includes(needle));
      return matchesSearch && (region === "all" || vm.location === region) && (resourceGroup === "all" || vm.resourceGroup === resourceGroup) && (powerState === "all" || vm.powerState === powerState) && (environment === "all" || env === environment);
    });
  }, [environment, powerState, query, region, resourceGroup, vms]);
  const activeFilterCount = [region, resourceGroup, powerState, environment].filter((value) => value !== "all").length + (query.trim() ? 1 : 0);
  const clearFilters = () => { setQuery(""); setRegion("all"); setResourceGroup("all"); setPowerState("all"); setEnvironment("all"); };

  return <div className="min-w-0 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <nav className="text-[12px] text-slate-500"><Link to="/resources" className="hover:text-[#1B4F91]">Azure Resources</Link><span className="mx-1.5">/</span><span className="font-medium text-slate-800">Change Engineering</span></nav>
      <button type="button" onClick={() => void load()} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"><RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />Refresh VM inventory</button>
    </div>
    <header className="mb-5 flex flex-wrap items-start gap-3">
      <div><h1 className="text-[22px] font-semibold text-slate-900">Select a VM to change</h1><p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-slate-600">Choose the Azure virtual machine first. You will then select a change and create an approval-controlled package; no Azure action is performed from this screen.</p></div>
      <div className="ml-auto flex items-center gap-1.5 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[11.5px] font-medium text-[#1B4F91]"><ShieldCheck className="h-3.5 w-3.5 shrink-0" />Human approval required for every VM change</div>
    </header>
    {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</div>}

    <div className="mb-3 rounded-md border border-[#E2E8F0] bg-white p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><Filter className="h-3.5 w-3.5" />Filter live inventory</div>
      <div className="grid gap-2 xl:grid-cols-[minmax(0,1.4fr)_1fr_1fr_1fr_1fr]">
        <label className="relative block"><Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search VM, resource group, region, state…" className="h-9 w-full rounded-md border border-[#CBD5E1] pl-8 pr-2.5 text-[12px] outline-none focus:border-[#1B4F91] focus:ring-1 focus:ring-[#CFE0F3]" /></label>
        <FilterSelect value={region} onChange={setRegion} label="All regions" values={regions} />
        <FilterSelect value={resourceGroup} onChange={setResourceGroup} label="All resource groups" values={resourceGroups} />
        <FilterSelect value={powerState} onChange={setPowerState} label="All power states" values={powerStates} />
        <FilterSelect value={environment} onChange={setEnvironment} label="All environments" values={environments} />
      </div>
      {activeFilterCount > 0 && <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500"><span>{activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"} applied</span><button type="button" onClick={clearFilters} className="inline-flex items-center gap-0.5 font-medium text-[#1B4F91] hover:underline"><X className="h-3 w-3" />Clear all</button></div>}
    </div>

    <div className="mb-2 flex items-center justify-between px-0.5 text-[11px] text-slate-500">
      <span className="font-semibold uppercase tracking-wide text-slate-500">Live Azure VM inventory</span>
      <span>{loading ? "Loading…" : `${filteredVms.length} of ${vms.length} VMs`}</span>
    </div>

    {loading ? (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((key) => <div key={key} className="h-[132px] animate-pulse rounded-lg border border-[#E2E8F0] bg-slate-50" />)}</div>
    ) : filteredVms.length ? (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filteredVms.map((vm) => <div key={vm.id} className="group flex flex-col rounded-lg border border-[#E2E8F0] bg-white p-3.5 transition-shadow hover:shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0"><div className="truncate text-[13.5px] font-semibold text-slate-900" title={vm.name}>{vm.name}</div><div className="mt-0.5 truncate text-[11px] text-slate-500" title={vm.id}>{vm.resourceGroup}</div></div>
            <EnvironmentBadge environment={vmEnvironment(vm)} />
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5"><PowerBadge powerState={vm.powerState} /></div>
          <div className="mt-3 grid flex-1 grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 shrink-0 text-slate-400" />{vm.location || "Region not reported"}</div>
            <div className="flex items-center gap-1.5"><Cpu className="h-3 w-3 shrink-0 text-slate-400" />{vm.vmSize || "Size not reported"}</div>
            <div className="col-span-2 flex items-center gap-1.5"><ServerCog className="h-3 w-3 shrink-0 text-slate-400" />{vm.osType || "OS not reported"}</div>
          </div>
          <Link to={`/changes/virtual-machines/${encodeURIComponent(vm.name)}?resourceId=${encodeURIComponent(vm.id)}`} className="mt-3.5 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-[#1B4F91] text-[11.5px] font-medium text-white transition-colors hover:bg-[#16406f]">Select VM<ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>)}
      </div>
    ) : (
      <div className="rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] py-10 text-center">
        <Power className="mx-auto h-6 w-6 text-slate-400" />
        <p className="mt-2 text-[12.5px] text-slate-600">{vms.length ? "No virtual machines match these filters." : "No Azure virtual machine is available in the connected scope."}</p>
        {vms.length > 0 && <button type="button" onClick={clearFilters} className="mt-2 text-[12px] font-medium text-[#1B4F91] underline">Clear filters</button>}
      </div>
    )}
  </div>;
}

function FilterSelect({ value, onChange, label, values }: { value: string; onChange: (value: string) => void; label: string; values: string[] }) {
  return <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-2.5 text-[12px] text-slate-700 outline-none focus:border-[#1B4F91] focus:ring-1 focus:ring-[#CFE0F3]"><option value="all">{label}</option>{values.map((item) => <option key={item} value={item}>{item}</option>)}</select>;
}

function VmChangePackageBuilder({ vmName, vmResourceId }: { vmName: string; vmResourceId: string | null }) {
  const { user } = useAuth();
  const [vms, setVms] = useState<AzureVirtualMachine[]>([]);
  const [operations, setOperations] = useState<AzureVmOperations | null>(null);
  const [packages, setPackages] = useState<VmChangePackage[]>([]);
  const [actionId, setActionId] = useState<ActionId | "">("");
  const [vmSize, setVmSize] = useState("");
  const [diskSize, setDiskSize] = useState("");
  const [rationale, setRationale] = useState("");
  const [activePackage, setActivePackage] = useState<VmChangePackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedVm = useMemo(() => vmResourceId
    ? vms.find((vm) => vm.id.toLowerCase() === vmResourceId.toLowerCase()) ?? null
    : vms.find((vm) => vm.name.toLowerCase() === vmName.toLowerCase()) ?? null, [vmName, vmResourceId, vms]);
  const selectedAction = ACTIONS.find((action) => action.id === actionId) ?? null;
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [machines, existingPackages] = await Promise.all([listAzureVirtualMachines(), user ? listVmChangePackages() : Promise.resolve([])]);
      setVms(machines); setPackages(existingPackages);
    } catch (cause) { setError(cause instanceof AzureControlPlaneError ? cause.message : "Unable to load the VM inventory or your saved packages."); }
    finally { setLoading(false); }
  }, [user]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!selectedVm) { setOperations(null); return; }
    let cancelled = false;
    getAzureVmOperations(selectedVm).then((result) => { if (!cancelled) setOperations(result); }).catch((cause) => { if (!cancelled) setError(cause instanceof AzureControlPlaneError ? cause.message : "Unable to load the current Azure VM state."); });
    return () => { cancelled = true; };
  }, [selectedVm]);

  const isActionAvailable = (action: ActionDefinition) => {
    if (!operations) return { enabled: false, note: "Loading Azure state" };
    if (action.id === "start_vm" && /running/i.test(selectedVm?.powerState ?? "")) return { enabled: false, note: "VM is already running" };
    if (action.id === "stop_vm" && !/running/i.test(selectedVm?.powerState ?? "")) return { enabled: false, note: "VM must be running" };
    if (action.id === "restart_vm" && !/running/i.test(selectedVm?.powerState ?? "")) return { enabled: false, note: "VM must be running" };
    if (action.id === "increase_os_disk" && !operations.configuration.osDisk.sizeGB) return { enabled: false, note: "OS disk capacity unavailable" };
    return { enabled: true, note: "Eligible for package creation" };
  };

  const policy = useMemo(() => {
    if (!selectedVm || !operations || !selectedAction) return null;
    const checks = [
      { label: "Azure VM discovery", pass: true, detail: "Current target resolved from Azure control plane" },
      { label: "Action eligibility", pass: isActionAvailable(selectedAction).enabled, detail: isActionAvailable(selectedAction).note },
      { label: "Backup evidence", pass: operations.backup.state === "protected", detail: title(operations.backup.state) },
      { label: "Monitoring evidence", pass: operations.monitoring.state === "available", detail: title(operations.monitoring.state) },
    ];
    let score = selectedAction.id === "start_vm" ? 20 : selectedAction.id === "assess_patches" ? 15 : selectedAction.id === "enable_monitoring" || selectedAction.id === "configure_backup" ? 35 : 45;
    if (operations.backup.state !== "protected") score += 10;
    if (operations.monitoring.state !== "available") score += 5;
    if ((selectedVm.tags.environment ?? selectedVm.tags.Environment ?? "").toLowerCase() === "production") score += 15;
    score = Math.min(score, 100);
    return { checks, score, level: score >= 60 ? "High" as const : score >= 35 ? "Medium" as const : "Low" as const };
  }, [operations, selectedAction, selectedVm]);

  const parameterError = selectedAction?.requiresValue === "vmSize" && !vmSize.trim()
    ? "Enter the requested Azure VM size."
    : selectedAction?.requiresValue === "diskSize" && (!/^\d+$/.test(diskSize) || Number(diskSize) <= (operations?.configuration.osDisk.sizeGB ?? 0))
      ? `Enter a disk size in GB greater than the current ${operations?.configuration.osDisk.sizeGB ?? "reported"} GB.` : null;
  const ready = !!selectedVm && !!operations && !!selectedAction && !!policy && rationale.trim().length >= 10 && !parameterError && isActionAvailable(selectedAction).enabled;

  const packageInput = (status: "draft" | "submitted") => {
    if (!selectedVm || !operations || !selectedAction || !policy) throw new Error("A target, action, and current Azure state are required.");
    const params = selectedAction.requiresValue === "vmSize" ? { requestedVmSize: vmSize.trim(), currentVmSize: operations.configuration.vmSize ?? selectedVm.vmSize }
      : selectedAction.requiresValue === "diskSize" ? { currentOsDiskSizeGB: operations.configuration.osDisk.sizeGB, requestedOsDiskSizeGB: Number(diskSize) }
        : {};
    const validationPlan = [
      "Re-read Azure VM power and provisioning state.",
      selectedAction.id === "increase_os_disk" ? "Confirm managed disk capacity equals the approved target." : "Confirm the requested Azure operation reached a terminal success state.",
      selectedAction.id === "enable_monitoring" ? "Confirm Azure Monitor starts returning VM telemetry." : "Capture post-change Azure control-plane observation.",
    ];
    return {
      packageNumber: activePackage?.packageNumber ?? newPackageNumber(), status, targetResourceId: selectedVm.id, targetName: selectedVm.name,
      subscriptionId: selectedVm.subscriptionId, resourceGroup: selectedVm.resourceGroup, region: selectedVm.location,
      actionType: selectedAction.id, actionLabel: selectedAction.label, parameters: params, rationale: rationale.trim(),
      currentState: { vm: selectedVm.raw, operations }, policyEvidence: policy.checks, validationPlan, riskScore: policy.score,
      riskLevel: policy.level, approvalRequired: true,
    };
  };

  const persist = async (status: "draft" | "submitted") => {
    if (!ready) { setError(parameterError ?? "Choose an eligible action and provide a reason of at least 10 characters."); return; }
    setSaving(true); setError(null); setMessage(null);
    try {
      const saved = await saveVmChangePackage(packageInput(status), activePackage?.id);
      setActivePackage(saved); setPackages((items) => [saved, ...items.filter((item) => item.id !== saved.id)]);
      if (status === "submitted") {
        try {
          await createTerraformPlan(saved.id);
          setMessage(`${saved.packageNumber} submitted and its governed Terraform plan was queued. No Azure action has been executed.`);
        } catch (planCause) {
          setMessage(`${saved.packageNumber} was submitted, but it cannot be approved until Terraform planning succeeds.`);
          setError(planCause instanceof Error ? `Terraform plan was not queued: ${planCause.message}` : "Terraform plan was not queued.");
        }
      } else {
        setMessage(`${saved.packageNumber} saved as a durable draft.`);
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save the change package."); }
    finally { setSaving(false); }
  };

  if (loading && !selectedVm) return <div className="p-4 text-[13px] text-slate-600">Loading Azure VM change builder…</div>;
  if (!selectedVm) return <div className="p-4"><Panel title="VM change engineering"><p className="text-[13px] text-slate-600">This virtual machine is not available in the current connected Azure scope.</p><Link to="/changes" className="mt-3 inline-block text-[12px] font-medium text-[#1B4F91] underline">Select another Azure VM</Link></Panel></div>;

  return <div className="min-w-0 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2"><nav className="text-[12px] text-slate-500"><Link to="/resources" className="hover:text-[#1B4F91]">Azure Resources</Link><span className="mx-1.5">/</span><Link to={`/resources/virtual-machines/${encodeURIComponent(selectedVm.name)}`} className="hover:text-[#1B4F91]">{selectedVm.name}</Link><span className="mx-1.5">/</span><span className="font-medium text-slate-800">Change Engineering</span></nav><button type="button" onClick={() => void load()} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"><RefreshCw className="h-3.5 w-3.5" />Refresh Azure state</button></div>
    <header className="mb-3 flex flex-wrap items-start gap-3"><div><h1 className="text-[20px] font-semibold text-slate-900">VM Change Package Builder</h1><p className="mt-1 text-[12px] text-slate-600">Choose a real Azure VM and the change you want to request. Saving creates a durable package; it does not modify Azure.</p></div><div className="ml-auto rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[11.5px] text-[#1B4F91]"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Human approval required for every VM change</div></header>
    {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</div>}{message && <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">{message}</div>}

    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div className="space-y-3"><Panel title="1. Selected Azure VM" right={<Link to="/changes" className="text-[11px] font-medium text-[#1B4F91] hover:underline">Choose a different VM</Link>}><div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-2"><div className="text-[12px] font-semibold text-slate-800">{selectedVm.name}</div><div className="mt-0.5 text-[11px] text-slate-500">{selectedVm.resourceGroup} · {selectedVm.location} · {selectedVm.id}</div></div><div className="mt-3 grid gap-2 sm:grid-cols-3"><Fact label="Power state" value={selectedVm.powerState} /><Fact label="VM size" value={operations?.configuration.vmSize ?? selectedVm.vmSize} /><Fact label="OS disk" value={operations?.configuration.osDisk.sizeGB ? `${operations.configuration.osDisk.sizeGB} GB` : "Not reported"} /></div></Panel>

      <Panel title="2. Select what you want to change" right={<span className="text-[11px] text-slate-500">Azure VM actions</span>}><div className="grid gap-2 sm:grid-cols-2">{ACTIONS.map((action) => { const availability = isActionAvailable(action); const selected = action.id === actionId; return <button key={action.id} type="button" disabled={!availability.enabled} onClick={() => { setActionId(action.id); setActivePackage(null); }} className={cn("rounded-md border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50", selected ? "border-[#1B4F91] bg-[#EFF4FB] ring-1 ring-[#CFE0F3]" : "border-[#E2E8F0] hover:bg-slate-50")}><div className="flex gap-2"><Wrench className="mt-0.5 h-4 w-4 shrink-0 text-[#1B4F91]" /><div><div className="text-[12px] font-semibold text-slate-800">{action.label}</div><p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{action.description}</p><div className={cn("mt-1 text-[10.5px] font-medium", availability.enabled ? "text-emerald-700" : "text-slate-500")}>{availability.note}</div></div></div></button>; })}</div>
        {selectedAction?.requiresValue === "vmSize" && <label className="mt-3 block text-[12px] font-medium text-slate-700">Requested Azure VM size<input value={vmSize} onChange={(event) => setVmSize(event.target.value)} placeholder="For example: Standard_D2s_v5" className="mt-1 h-9 w-full rounded-md border border-[#CBD5E1] px-2.5 text-[12px]" /></label>}
        {selectedAction?.requiresValue === "diskSize" && <label className="mt-3 block text-[12px] font-medium text-slate-700">Requested OS disk size (GB)<input inputMode="numeric" value={diskSize} onChange={(event) => setDiskSize(event.target.value)} placeholder={`More than ${operations?.configuration.osDisk.sizeGB ?? "current size"}`} className="mt-1 h-9 w-full rounded-md border border-[#CBD5E1] px-2.5 text-[12px]" /></label>}
        {parameterError && <p className="mt-1 text-[11.5px] text-red-700">{parameterError}</p>}</Panel>

      <Panel title="3. Explain why this change is needed"><textarea value={rationale} onChange={(event) => setRationale(event.target.value)} placeholder="Describe the operational reason, expected outcome, and any timing or business constraint." rows={4} className="w-full rounded-md border border-[#CBD5E1] p-2.5 text-[12px] outline-none focus:border-[#1B4F91]" /><p className="mt-1 text-[11px] text-slate-500">At least 10 characters. This rationale is stored with the package.</p></Panel></div>

      <div className="space-y-3"><Panel title="Current Azure evidence"><Row label="Resource group" value={selectedVm.resourceGroup} /><Row label="Subscription" value={selectedVm.subscriptionId} /><Row label="Provisioning" value={selectedVm.provisioningState} /><Row label="Backup" value={operations ? title(operations.backup.state) : "Loading"} /><Row label="Monitoring" value={operations ? title(operations.monitoring.state) : "Loading"} /><Row label="Patch assessment" value={operations ? title(operations.patching.state) : "Loading"} /></Panel>
      <Panel title="Policy & approval preview" right={policy && <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-semibold", policy.level === "High" ? "border-red-200 bg-red-50 text-red-700" : policy.level === "Medium" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700")}>{policy.level} · {policy.score}/100</span>}>{policy ? <><p className="mb-2 text-[11.5px] text-slate-600">Score is calculated from the selected action and current Azure evidence. Approval is always required.</p>{policy.checks.map((check) => <div key={check.label} className="flex items-center justify-between gap-2 border-t border-[#EEF2F6] py-1.5 text-[11.5px]"><span className="flex items-center gap-1.5 text-slate-700">{check.pass ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}{check.label}</span><span className="text-right text-slate-500">{check.detail}</span></div>)}</> : <p className="text-[12px] text-slate-600">Select an action to calculate its policy and approval preview.</p>}</Panel>
      <Panel title="Package controls"><div className="space-y-2"><button type="button" disabled={!ready || saving || activePackage?.status === "submitted"} onClick={() => void persist("draft")} className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-[#1B4F91] bg-white px-3 text-[12px] font-medium text-[#1B4F91] hover:bg-[#EFF4FB] disabled:opacity-50"><Save className="h-3.5 w-3.5" />{saving ? "Saving…" : activePackage ? "Update draft" : "Save draft package"}</button><button type="button" disabled={!ready || saving || activePackage?.status === "submitted"} onClick={() => void persist("submitted")} className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-[#1B4F91] px-3 text-[12px] font-medium text-white hover:bg-[#16406f] disabled:opacity-50"><ClipboardCheck className="h-3.5 w-3.5" />Submit for approval</button></div>{activePackage && <div className="mt-3 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-[11.5px]"><div className="font-mono font-semibold text-slate-800">{activePackage.packageNumber}</div><div className="mt-1 text-slate-600">{activePackage.status === "submitted" ? "Submitted and immutable" : "Draft saved"} · {activePackage.actionLabel}</div></div>}<p className="mt-2 text-[10.5px] text-slate-500">Execution is deliberately unavailable until an Azure action runner and approval workflow are configured.</p></Panel></div>
    </div>

    <Panel className="mt-3" title="Your recent VM change packages" right={<span className="text-[11px] text-slate-500">Stored in Supabase</span>}>{packages.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-[11.5px]"><thead className="border-b border-[#E2E8F0] text-[10.5px] uppercase tracking-wide text-slate-500"><tr><th className="pb-2 font-medium">Package</th><th className="pb-2 font-medium">Target</th><th className="pb-2 font-medium">Requested action</th><th className="pb-2 font-medium">Risk</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium">Updated</th></tr></thead><tbody>{packages.map((pkg) => <tr key={pkg.id} className="border-b border-[#EEF2F6]"><td className="py-2 font-mono text-slate-800">{pkg.packageNumber}</td><td className="py-2">{pkg.targetName}</td><td className="py-2">{pkg.actionLabel}</td><td className="py-2">{pkg.riskLevel} ({pkg.riskScore}/100)</td><td className="py-2"><span className={cn("rounded border px-1.5 py-0.5", pkg.status === "submitted" ? "border-[#CFE0F3] bg-[#EFF4FB] text-[#1B4F91]" : "border-slate-200 bg-slate-50 text-slate-700")}>{title(pkg.status)}</span></td><td className="py-2 text-slate-500">{new Date(pkg.updatedAt).toLocaleString()}</td></tr>)}</tbody></table></div> : <p className="text-[12px] text-slate-600">No VM change package has been saved by your account yet.</p>}</Panel>
  </div>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-2"><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div><div className="mt-0.5 truncate text-[12px] font-medium text-slate-800" title={value}>{value}</div></div>; }
