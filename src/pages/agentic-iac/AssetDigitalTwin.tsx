import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, Code2, RefreshCw, Server, Tags, Wrench, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RelationshipMap } from "./RelationshipMap";
import { ActionPreviewDrawer } from "./ActionPreviewDrawer";
import { VmOperationsOverview } from "./VmOperationsOverview";
import {
  ACTION_CATEGORIES, actions, asset, assetIntelligence, changeHistory, configSections,
  discoverySources, provenance, provenanceStats, type ActionCategory, type AssetAction,
  type AssetIdentity, type ChangeRecord, type ConfigSection, type RelatedNode,
} from "./data";
import {
  AzureControlPlaneError, getAzureVmOperations, listAzureVirtualMachines, vmDiskName, vmNicName,
  type AzureVirtualMachine, type AzureVmOperations,
} from "./azureControlPlane";
import { detailPathFor, resourceKindFor } from "./resourceKinds";

// This page is the Digital Twin for one resource kind: Virtual Machines. A future
// twin page for another kind (storage accounts, disks, ...) should look itself up
// the same way rather than hardcoding its own label/route here.
const VM_KIND = resourceKindFor("Microsoft.Compute/virtualMachines")!;

function now() {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());
}

function isHealthy(vm: AzureVirtualMachine) {
  return /running/i.test(vm.powerState) && /succeeded/i.test(vm.provisioningState);
}

function assetFromVm(vm: AzureVirtualMachine, operations: AzureVmOperations | null): AssetIdentity {
  const tags = vm.tags;
  return {
    id: vm.id,
    name: vm.name,
    provider: "azure",
    assetType: "Azure Virtual Machine",
    os: operations?.configuration.osType ?? vm.osType,
    workload: "Azure pilot workload",
    health: isHealthy(vm) ? "healthy" : "warning",
    environment: tags.environment ?? tags.Environment ?? "Development",
    region: vm.location,
    owner: tags.owner ?? tags.Owner ?? "Not assigned",
    criticality: tags.criticality ?? tags.Criticality ?? "Pilot",
    lastDiscovered: `Live Azure refresh · ${now()}`,
    cmdbId: vm.id,
    tags: Object.entries(tags).map(([key, value]) => `${key}: ${value}`),
  };
}

function reported(value: string | null | undefined, fallback = "Not reported by Azure") {
  return value?.trim() ? value : fallback;
}

function configurationFromVm(vm: AzureVirtualMachine, operations: AzureVmOperations | null): ConfigSection[] {
  const detail = operations?.configuration;
  const osDisk = detail?.osDisk;
  const diskDescription = osDisk?.name
    ? [osDisk.name, osDisk.sizeGB === null ? null : `${osDisk.sizeGB} GiB`, osDisk.storageSku, osDisk.caching].filter(Boolean).join(" · ")
    : vmDiskName(vm) ?? "Not reported by Azure";
  const dataDisks = detail?.dataDisks.map((disk) => [disk.name, disk.sizeGB === null ? null : `${disk.sizeGB} GiB`, disk.storageSku, disk.lun === null ? null : `LUN ${disk.lun}`].filter(Boolean).join(" · ")) ?? [];
  const networkInterfaces = detail?.networkInterfaces.length ? detail.networkInterfaces : [vmNicName(vm)].filter((name): name is string => !!name);

  return [
    {
      key: "compute", title: "Compute", properties: [
        { label: "VM Size", value: reported(detail?.vmSize, vm.vmSize) },
        { label: "Power State", value: vm.powerState, tone: /running/i.test(vm.powerState) ? "good" : "warn" },
        { label: "Provisioning", value: vm.provisioningState, tone: /succeeded/i.test(vm.provisioningState) ? "good" : "warn" },
        { label: "Operating System", value: reported(detail?.osType, vm.osType) },
        { label: "Availability Zones", value: detail?.zones.length ? detail.zones.join(", ") : "Not zonal" },
        { label: "Priority", value: reported(detail?.priority, "Regular") },
      ],
    },
    {
      key: "storage", title: "Storage & Image", properties: [
        { label: "OS Disk", value: diskDescription },
        { label: "Data Disks", value: dataDisks.length ? dataDisks.join(" | ") : "None" },
        { label: "Image Reference", value: reported(detail?.imageReference) },
      ],
    },
    {
      key: "platform", title: "Platform & Management", properties: [
        { label: "Availability Set", value: reported(detail?.availabilitySet, "None") },
        { label: "Security Type", value: reported(detail?.securityType, "Standard") },
        { label: "Encryption at Host", value: detail?.encryptionAtHost === null || detail?.encryptionAtHost === undefined ? "Not reported" : detail.encryptionAtHost ? "Enabled" : "Disabled" },
        { label: "Managed Identity", value: reported(detail?.identityType, "Not assigned") },
        { label: "VM Agent", value: [detail?.vmAgentVersion, detail?.vmAgentStatus].filter(Boolean).join(" · ") || "Not reported" },
        { label: "Extensions", value: detail?.extensions.length ? detail.extensions.join(" | ") : "None reported" },
      ],
    },
    {
      key: "azure-scope", title: "Azure Scope", properties: [
        { label: "Subscription", value: vm.subscriptionId },
        { label: "Resource Group", value: vm.resourceGroup },
        { label: "Region", value: vm.location },
        { label: "Resource ID", value: vm.id },
      ],
    },
    {
      key: "relationships", title: "Discovered Relationships", properties: [
        { label: "Network Interfaces", value: networkInterfaces.length ? networkInterfaces.join(", ") : "Not reported by Azure" },
        { label: "Private IPs", value: operations?.network.privateIps.length ? operations.network.privateIps.join(", ") : "Not reported by Azure" },
        { label: "Network Security Groups", value: operations?.network.networkSecurityGroups.length ? operations.network.networkSecurityGroups.join(", ") : "Not reported by Azure" },
        { label: "Load Balancers", value: operations?.network.loadBalancers.length ? operations.network.loadBalancers.join(", ") : "None reported" },
      ],
    },
  ];
}

function nodesFromVm(vm: AzureVirtualMachine, operations: AzureVmOperations | null): RelatedNode[] {
  const disk = operations?.configuration.osDisk.name ?? vmDiskName(vm);
  const nic = operations?.configuration.networkInterfaces[0] ?? vmNicName(vm);
  const nodes: RelatedNode[] = [];
  if (disk) nodes.push({ id: `${vm.id}/disk`, name: disk, type: "Azure Managed Disk", health: "unknown", relationship: "CONNECTED TO", layer: "infrastructure", hops: 1, lastDiscovered: "Live Azure refresh", x: 23, y: 30, detail: ["Discovered from VM storage profile"] });
  if (nic) nodes.push({ id: `${vm.id}/nic`, name: nic, type: "Azure Network Interface", health: "unknown", relationship: "CONNECTED TO", layer: "infrastructure", hops: 1, lastDiscovered: "Live Azure refresh", x: 78, y: 68, detail: ["Discovered from VM network profile"] });
  return nodes;
}

export default function AssetDigitalTwin() {
  const { vmName } = useParams<{ vmName: string }>();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<string[]>(configSections.map((section) => section.key));
  const [category, setCategory] = useState<ActionCategory>("Compute");
  const [selectedAction, setSelectedAction] = useState<AssetAction | null>(null);
  const [selectedNode, setSelectedNode] = useState<RelatedNode | null>(null);
  const [selectedChange, setSelectedChange] = useState<ChangeRecord | null>(null);
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const [virtualMachines, setVirtualMachines] = useState<AzureVirtualMachine[]>([]);
  const [selectedVmId, setSelectedVmId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [loadingAzure, setLoadingAzure] = useState(true);
  const [lastDiscovered, setLastDiscovered] = useState(asset.lastDiscovered);
  const [rawStateOpen, setRawStateOpen] = useState(false);
  const [operations, setOperations] = useState<AzureVmOperations | null>(null);
  const [operationsError, setOperationsError] = useState<string | null>(null);
  const [loadingOperations, setLoadingOperations] = useState(false);

  const matchedVm = vmName ? virtualMachines.find((vm) => vm.name === vmName) ?? null : null;
  const selectedVm = vmName
    ? matchedVm
    : virtualMachines.find((vm) => vm.id === selectedVmId) ?? virtualMachines[0] ?? null;
  const vmNotFound = !!vmName && !loadingAzure && !connectionError && virtualMachines.length > 0 && !matchedVm;
  const liveAzure = !!selectedVm;
  const assetView = selectedVm ? assetFromVm(selectedVm, operations) : asset;
  // `configurationFromVm` creates an array. Memoize it so the effect below only
  // runs when the selected resource actually changes, not after every render.
  // Without this, opening a live Azure twin continually replaces
  // `openSections`, starving the UI and preventing client-side navigation.
  const configuration = useMemo(
    () => selectedVm ? configurationFromVm(selectedVm, operations) : configSections,
    [selectedVm, operations],
  );
  const nodes = selectedVm ? nodesFromVm(selectedVm, operations) : undefined;
  const categoryActions = actions.filter((action) => action.category === category);
  const intelligence = useMemo(() => selectedVm ? [
    { label: "Azure connection", value: "Connected", tone: "good" as const },
    { label: "Resource state", value: selectedVm.powerState, tone: /running/i.test(selectedVm.powerState) ? "good" as const : "warn" as const },
    { label: "Provisioning", value: selectedVm.provisioningState, tone: /succeeded/i.test(selectedVm.provisioningState) ? "good" as const : "warn" as const },
  ] : assetIntelligence, [selectedVm]);

  const refreshAzure = useCallback(async () => {
    setLoadingAzure(true);
    setConnectionError(null);
    try {
      const resources = await listAzureVirtualMachines();
      setVirtualMachines(resources);
      setSelectedVmId((current) => {
        const routeVm = vmName ? resources.find((vm) => vm.name === vmName) : undefined;
        return routeVm?.id ?? (resources.some((vm) => vm.id === current) ? current : resources[0]?.id ?? null);
      });
      setLastDiscovered(`Live Azure refresh · ${now()}`);
      if (!resources.length) setConnectionError("Azure returned no virtual machines in the pilot scope.");
    } catch (error) {
      setConnectionError(error instanceof AzureControlPlaneError ? error.message : "Unable to reach the Azure control plane.");
    } finally {
      setLoadingAzure(false);
    }
  }, [vmName]);

  useEffect(() => { void refreshAzure(); }, [refreshAzure]);
  useEffect(() => {
    let active = true;
    if (!selectedVm) {
      setOperations(null);
      setOperationsError(null);
      setLoadingOperations(false);
      return () => { active = false; };
    }

    setLoadingOperations(true);
    setOperations(null);
    setOperationsError(null);
    void getAzureVmOperations(selectedVm)
      .then((result) => { if (active) setOperations(result); })
      .catch((error) => {
        if (!active) return;
        if (error instanceof AzureControlPlaneError) {
          setOperationsError(
            error.status === 401
              ? "Sign in again to load Azure VM operations data."
              : error.message,
          );
          return;
        }
        setOperationsError("The VM Operations API could not be reached. Refresh the page and try again.");
      })
      .finally(() => { if (active) setLoadingOperations(false); });

    return () => { active = false; };
  }, [selectedVm]);
  useEffect(() => {
    const configurationKeys = configuration.map((section) => section.key);
    setOpenSections((current) => {
      const next = [...new Set([...current, ...configurationKeys])];
      return next.length === current.length ? current : next;
    });
  }, [configuration]);

  function toggleSection(key: string) {
    setOpenSections((current) => current.includes(key) ? current.filter((value) => value !== key) : [...current, key]);
  }

  return (
    <div className="px-4 py-3">
      <button type="button" onClick={() => navigate(-1)} className="mb-2 inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 hover:text-slate-800"><ArrowLeft className="h-3.5 w-3.5" />Back</button>

      {!selectedVm ? (
        <section className="rounded-md border border-[#E2E8F0] bg-white px-4 py-8 text-center">
          <Server className={cn("mx-auto h-7 w-7 text-[#1B4F91]", loadingAzure && "animate-pulse")} />
          <h1 className="mt-3 text-[16px] font-semibold text-slate-900">{loadingAzure ? "Loading Azure virtual machine…" : "Azure virtual machine unavailable"}</h1>
          <p className="mx-auto mt-1 max-w-xl text-[12px] text-slate-600">
            {loadingAzure
              ? "Retrieving the selected VM from the Azure control plane."
              : connectionError ?? (vmNotFound
                ? `Virtual machine “${vmName}” was not found in the connected Azure scope.`
                : "No virtual machine was returned by the Azure control plane.")}
          </p>
          {!loadingAzure && <Link to="/resources" className="mt-3 inline-block text-[12px] font-medium text-[#1B4F91] hover:underline">Return to Azure Resources</Link>}
        </section>
      ) : <>
      <section className="rounded-md border border-[#E2E8F0] bg-white">
        <div className="flex flex-wrap items-start gap-3 px-4 py-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#CFE0F3] bg-[#EFF4FB] text-[#1B4F91]"><Server className="h-5 w-5" /></div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[19px] font-semibold leading-tight text-slate-900">{assetView.name}</h1>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1", assetView.health === "healthy" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200")}>
                {assetView.health === "healthy" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}{assetView.health === "healthy" ? "Healthy" : selectedVm?.powerState ?? "Discovery pending"}
              </span>
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", liveAzure ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-600")}>{liveAzure ? "Live Azure" : "Sample data"}</span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-slate-500"><span>{assetView.assetType}</span><span>·</span><span>{assetView.os}</span><span>·</span><span>{assetView.workload}</span></div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {virtualMachines.length > 1 && <select value={selectedVm?.id ?? ""} onChange={(event) => { const vm = virtualMachines.find((item) => item.id === event.target.value); if (vm) navigate(detailPathFor(VM_KIND, vm.name)); }} className="h-8 max-w-[220px] rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px] text-slate-700">{virtualMachines.map((vm) => <option key={vm.id} value={vm.id}>{vm.name}</option>)}</select>}
            <button type="button" onClick={() => void refreshAzure()} disabled={loadingAzure} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] px-2.5 text-[12px] text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"><RefreshCw className={cn("h-3.5 w-3.5", loadingAzure && "animate-spin")} />Refresh Twin</button>
            {selectedVm && <Link to={`/remediation/virtual-machines/${encodeURIComponent(selectedVm.name)}?resourceId=${encodeURIComponent(selectedVm.id)}`} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#1B4F91] bg-[#EFF4FB] px-2.5 text-[12px] font-medium text-[#1B4F91] hover:bg-[#DDEBFA]"><Wrench className="h-3.5 w-3.5" />Assess Operations</Link>}
            {selectedVm && <Link to={`/changes/virtual-machines/${encodeURIComponent(selectedVm.name)}?resourceId=${encodeURIComponent(selectedVm.id)}`} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"><Wrench className="h-3.5 w-3.5" />Build Change Package</Link>}
            <button type="button" onClick={() => setRawStateOpen(true)} disabled={!selectedVm} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] px-2.5 text-[12px] text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><Code2 className="h-3.5 w-3.5" />View Raw State</button>
            <button type="button" disabled className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] px-2.5 text-[12px] text-slate-400"><Tags className="h-3.5 w-3.5" />Edit Tags</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#E2E8F0] px-4 py-2.5 text-[12px] sm:grid-cols-3 xl:grid-cols-6"><Meta label="Environment" value={assetView.environment} /><Meta label="Region" value={assetView.region} /><Meta label="Owner" value={assetView.owner} /><Meta label="Criticality" value={assetView.criticality} tone="warn" /><Meta label="Last Discovered" value={lastDiscovered} /><Meta label="Resource ID" value={assetView.cmdbId} /></div>
        {assetView.tags.length > 0 && <div className="flex flex-wrap items-center gap-1.5 border-t border-[#E2E8F0] px-4 py-2">{assetView.tags.map((tag) => <span key={tag} className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5 text-[11px] text-slate-600">{tag}</span>)}</div>}
      </section>

      {connectionError && <section className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><div><span className="font-semibold">Azure connection unavailable.</span> {connectionError} Sample data remains visible until a signed-in user can reach the Azure control plane.</div></section>}

      {vmNotFound && <section className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><div><span className="font-semibold">Virtual machine "{vmName}" was not found.</span> It may have been renamed, deleted, or fall outside the discovered pilot scope. Sample data is shown below — <Link to="/resources" className="font-medium underline">return to Azure Resources</Link> to pick a valid machine.</div></section>}

      <section className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1.5 rounded-md border border-[#E2E8F0] bg-white px-4 py-2">
        {liveAzure ? <><Metric label="Connection" value="Azure control plane" good /><Metric label="Discovery Freshness" value="Just now" /><Metric label="Source" value="Managed Identity" /></> : <><Metric label="Connection" value={loadingAzure ? "Connecting" : "Unavailable"} /><Metric label="Discovery" value="Sample data" /></>}
      </section>

      {liveAzure && <VmOperationsOverview data={operations} loading={loadingOperations} error={operationsError} />}

      <div className="mt-2 grid gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)]">
        <section className="rounded-md border border-[#E2E8F0] bg-white"><header className="border-b border-[#E2E8F0] px-3 py-2"><h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-700">Current Configuration</h2></header><div className="max-h-[640px] overflow-y-auto">{configuration.map((section) => { const open = openSections.includes(section.key); return <div key={section.key} className="border-b border-[#EEF2F6] last:border-b-0"><button type="button" onClick={() => toggleSection(section.key)} className="flex w-full items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-600 hover:bg-slate-100">{open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}{section.title}</button>{open && <dl className="divide-y divide-[#F1F5F9]">{section.properties.map((property) => <div key={`${section.key}-${property.label}`} className="flex items-center justify-between gap-3 px-3 py-1.5 text-[12px]"><dt className="text-slate-500">{property.label}</dt><dd className={cn("max-w-[65%] truncate text-right font-medium", property.tone === "good" ? "text-emerald-700" : property.tone === "warn" ? "text-amber-700" : "text-slate-800")} title={property.value}>{property.value}</dd></div>)}</dl>}</div>; })}</div></section>
        <RelationshipMap selectedId={selectedNode?.id ?? null} onSelect={setSelectedNode} assetName={assetView.name} assetType={assetView.assetType} nodes={nodes} />
        <section className="rounded-md border border-[#E2E8F0] bg-white"><header className="border-b border-[#E2E8F0] px-3 py-2"><h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-700">Available Actions</h2></header>{liveAzure ? <div className="p-3 text-[12px] text-slate-600"><p className="font-medium text-slate-800">Resource discovery is live.</p><p className="mt-1">Request, approval, and execution actions will be enabled in the next workflow.</p></div> : <><div className="flex flex-wrap gap-1 border-b border-[#E2E8F0] px-2 py-1.5">{ACTION_CATEGORIES.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={cn("rounded border px-2 py-0.5 text-[11.5px]", category === item ? "border-[#1B4F91] bg-[#EFF4FB] text-[#1B4F91]" : "border-transparent text-slate-600 hover:bg-slate-50")}>{item}</button>)}</div><ul className="divide-y divide-[#F1F5F9]">{categoryActions.map((action) => <li key={action.id}><button type="button" onClick={() => setSelectedAction(action)} className="w-full px-3 py-2 text-left hover:bg-[#F8FAFC]"><div className="text-[12.5px] font-medium text-slate-800">{action.name}</div><div className="text-[11.5px] text-slate-500">{action.description}</div></button></li>)}</ul></>}</section>
      </div>

      <div className="mt-2 grid gap-2 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        <section className="rounded-md border border-[#E2E8F0] bg-white"><header className="border-b border-[#E2E8F0] px-3 py-2"><h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-700">Recent Changes</h2></header><div className="overflow-x-auto"><table className="w-full text-[12px]"><thead><tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left text-[10.5px] uppercase tracking-wider text-slate-500"><th className="px-3 py-1.5">Date</th><th className="px-3 py-1.5">Action</th><th className="px-3 py-1.5">Initiated By</th><th className="px-3 py-1.5">Method</th><th className="px-3 py-1.5">Change ID</th><th className="px-3 py-1.5">Status</th><th className="px-3 py-1.5">Validation</th></tr></thead><tbody className="divide-y divide-[#F1F5F9]">{liveAzure ? <tr><td colSpan={7} className="px-3 py-5 text-center text-slate-500">No IaC change history has been synced yet.</td></tr> : changeHistory.map((change) => <tr key={change.id} onClick={() => setSelectedChange(change)} className="cursor-pointer hover:bg-[#F8FAFC]"><td className="px-3 py-1.5 text-slate-600">{change.date}</td><td className="px-3 py-1.5 font-medium text-slate-800">{change.action}</td><td className="px-3 py-1.5 text-slate-600">{change.initiatedBy}</td><td className="px-3 py-1.5 text-slate-600">{change.method}</td><td className="px-3 py-1.5 font-mono text-[11px] text-slate-600">{change.changeId}</td><td className="px-3 py-1.5 text-emerald-700">{change.status}</td><td className="px-3 py-1.5 text-slate-600">{change.validation}</td></tr>)}</tbody></table></div></section>
        <section className="rounded-md border border-[#E2E8F0] bg-white"><header className="border-b border-[#E2E8F0] px-3 py-2"><h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-700">Asset Intelligence</h2></header><dl className="divide-y divide-[#F1F5F9]">{intelligence.map((row) => <div key={row.label} className="flex items-center justify-between gap-3 px-3 py-1.5 text-[12px]"><dt className="text-slate-500">{row.label}</dt><dd className={cn("font-medium", row.tone === "good" ? "text-emerald-700" : row.tone === "warn" ? "text-amber-700" : "text-slate-800")}>{row.value}</dd></div>)}</dl><div className="border-t border-[#E2E8F0] px-3 py-2"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Primary Discovery Sources</div><div className="mt-1.5 flex flex-wrap gap-1">{(liveAzure ? ["Azure control plane", "Managed Identity"] : discoverySources).map((source) => <span key={source} className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5 text-[11px] text-slate-600">{source}</span>)}</div></div></section>
      </div>

      <section className="mt-2 rounded-md border border-[#E2E8F0] bg-white"><button type="button" onClick={() => setProvenanceOpen((value) => !value)} className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-[12px] font-medium text-slate-700 hover:bg-[#F8FAFC]">{provenanceOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}How This Twin Was Built</button>{provenanceOpen && <div className="border-t border-[#E2E8F0] px-3 py-2.5"><div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">{(liveAzure ? [{ domain: "Azure Resources", source: "Azure control plane Function App" }, { domain: "Identity", source: "Managed Identity" }, { domain: "Application access", source: "Supabase Auth" }] : provenance).map((item) => <div key={item.domain} className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5"><div className="text-[10px] uppercase tracking-wider text-slate-500">{item.domain}</div><div className="text-[12px] font-medium text-slate-800">{item.source}</div></div>)}</div>{!liveAzure && <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 border-t border-[#E2E8F0] pt-2 text-[11.5px] text-slate-600">{provenanceStats.map((stat) => <span key={stat.label}>{stat.label}: <span className="font-medium text-slate-800">{stat.value}</span></span>)}</div>}</div>}</section>

      <ActionPreviewDrawer action={selectedAction} onClose={() => setSelectedAction(null)} />
      {rawStateOpen && selectedVm && <Drawer title="Raw VM State" subtitle="Azure control plane response" onClose={() => setRawStateOpen(false)}><pre className="overflow-x-auto rounded-md bg-slate-950 p-3 text-[11px] leading-5 text-slate-100">{JSON.stringify(selectedVm.raw, null, 2)}</pre></Drawer>}
      {selectedChange && <Drawer title={selectedChange.action} subtitle={`${selectedChange.changeId} · ${selectedChange.method}`} onClose={() => setSelectedChange(null)}><div className="space-y-3 text-[12px]"><p className="text-slate-700">{selectedChange.intent}</p><div className="grid grid-cols-2 gap-2"><Meta label="Method" value={selectedChange.method} /><Meta label="Validation" value={selectedChange.validation} /><Meta label="Status" value={selectedChange.status} /><Meta label="Timestamp" value={selectedChange.timestamp} /></div></div></Drawer>}
      </>}
    </div>
  );
}

function Metric({ label, value, good = false }: { label: string; value: string; good?: boolean }) { return <div className="flex items-center gap-1.5 text-[12px]"><span className="text-slate-500">{label}</span><span className={cn("font-semibold", good ? "text-emerald-700" : "text-slate-800")}>{value}</span></div>; }
function Meta({ label, value, tone }: { label: string; value: string; tone?: "warn" }) { return <div className="min-w-0"><div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div><div className={cn("truncate text-[12.5px] font-medium", tone === "warn" ? "text-amber-700" : "text-slate-800")} title={value}>{value}</div></div>; }
function Drawer({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-50 flex justify-end"><button type="button" aria-label="Close drawer" onClick={onClose} className="flex-1 bg-slate-900/20" /><aside className="h-full w-full max-w-[640px] overflow-y-auto border-l border-[#E2E8F0] bg-white p-4"><div className="flex items-start gap-2"><div><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Azure Resources</div><h2 className="text-[15px] font-semibold text-slate-900">{title}</h2><div className="text-[11.5px] text-slate-500">{subtitle}</div></div><button type="button" onClick={onClose} aria-label="Close" className="ml-auto grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="mt-3">{children}</div></aside></div>; }
