import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ChevronDown, ChevronRight, Cloud, Folder, FolderTree, RefreshCw, Search, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { AzureControlPlaneError, getAzureScopes, listAzureResources, listAzureVirtualMachines, type AzureResource, type AzureVirtualMachine } from "./azureControlPlane";

type AzureScopeGroup = { name: string; location: string };
type AzureScopeSubscription = { id: string; displayName: string; resourceGroups: AzureScopeGroup[] };
type ResourceGroupNode = AzureScopeGroup & { resources: AzureResource[] };
type SubscriptionNode = { id: string; displayName: string; resourceGroups: ResourceGroupNode[] };

function nodeId(...parts: string[]) { return parts.join("/"); }
function isRunning(vm: AzureVirtualMachine) { return /running/i.test(vm.powerState); }
function detailPath(vm: AzureVirtualMachine) { return `/agentic-iac-engineering/resources/virtual-machines/${encodeURIComponent(vm.name)}`; }

function scopeSubscriptions(payload: Record<string, unknown>): AzureScopeSubscription[] {
  const subscriptions = Array.isArray(payload.subscriptions) ? payload.subscriptions : [];
  return subscriptions.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const value = item as Record<string, unknown>;
    const id = typeof value.subscriptionId === "string" ? value.subscriptionId : "";
    if (!id) return [];
    const resourceGroups = Array.isArray(value.resourceGroups) ? value.resourceGroups.flatMap((group) => {
      if (!group || typeof group !== "object" || Array.isArray(group)) return [];
      const details = group as Record<string, unknown>;
      return typeof details.name === "string" ? [{ name: details.name, location: typeof details.location === "string" ? details.location : "Not reported" }] : [];
    }) : [];
    return [{ id, displayName: typeof value.displayName === "string" ? value.displayName : id, resourceGroups }];
  });
}

function resourceTypeLabel(type: string) { return type.split("/").at(-1)?.replace(/([a-z])([A-Z])/g, "$1 $2") ?? type; }
function resourcesByType(resources: AzureResource[]) {
  const grouped = new Map<string, AzureResource[]>();
  resources.forEach((resource) => grouped.set(resource.type, [...(grouped.get(resource.type) ?? []), resource]));
  return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right));
}
function buildHierarchy(scopes: AzureScopeSubscription[], resources: AzureResource[]): SubscriptionNode[] {
  const subscriptions = new Map<string, { displayName: string; groups: Map<string, ResourceGroupNode> }>();
  scopes.forEach((subscription) => subscriptions.set(subscription.id, {
    displayName: subscription.displayName,
    groups: new Map(subscription.resourceGroups.map((group) => [group.name, { ...group, resources: [] }])),
  }));
  resources.forEach((resource) => {
    const subscription = subscriptions.get(resource.subscriptionId) ?? { displayName: resource.subscriptionName, groups: new Map<string, ResourceGroupNode>() };
    const group = subscription.groups.get(resource.resourceGroup) ?? { name: resource.resourceGroup, location: resource.location, resources: [] };
    group.resources.push(resource);
    subscription.groups.set(resource.resourceGroup, group);
    subscriptions.set(resource.subscriptionId, subscription);
  });
  return [...subscriptions.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([id, subscription]) => ({
    id,
    displayName: subscription.displayName,
    resourceGroups: [...subscription.groups.values()].sort((left, right) => left.name.localeCompare(right.name)).map((group) => ({
      ...group,
      resources: [...group.resources].sort((left, right) => left.name.localeCompare(right.name)),
    })),
  }));
}

export default function AzureResources() {
  const [virtualMachines, setVirtualMachines] = useState<AzureVirtualMachine[]>([]);
  const [resources, setResources] = useState<AzureResource[]>([]);
  const [subscriptions, setSubscriptions] = useState<AzureScopeSubscription[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [discoveredResources, discoveredVms, scopes] = await Promise.all([listAzureResources(), listAzureVirtualMachines(), getAzureScopes()]);
      setResources(discoveredResources);
      setVirtualMachines(discoveredVms);
      const discoveredScopes = scopeSubscriptions(scopes);
      setSubscriptions(discoveredScopes);
      setExpandedNodes([
        ...discoveredScopes.flatMap((subscription) => [
          nodeId("subscription", subscription.id),
          ...subscription.resourceGroups.map((group) => nodeId("group", subscription.id, group.name)),
        ]),
        ...[...new Set(discoveredResources.map((resource) => nodeId("type", resource.subscriptionId, resource.resourceGroup, resource.type)))],
      ]);
      setRefreshedAt(new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date()));
    } catch (reason) {
      setError(reason instanceof AzureControlPlaneError ? reason.message : "Unable to load Azure resources.");
      setVirtualMachines([]);
      setResources([]);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const hierarchy = useMemo(() => buildHierarchy(subscriptions, resources), [subscriptions, resources]);
  const filteredHierarchy = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return hierarchy;
    return hierarchy.map((subscription) => ({
      ...subscription,
      resourceGroups: subscription.resourceGroups.flatMap((group) => {
        const groupMatches = `${subscription.id} ${subscription.displayName} ${group.name} ${group.location}`.toLowerCase().includes(term);
        const visibleResources = groupMatches ? group.resources : group.resources.filter((resource) => `${resource.name} ${resource.type} ${resource.location}`.toLowerCase().includes(term));
        return visibleResources.length ? [{ ...group, resources: visibleResources }] : [];
      }),
    })).filter((subscription) => subscription.resourceGroups.length);
  }, [hierarchy, query]);

  const toggle = (id: string) => setExpandedNodes((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const isExpanded = (id: string) => expandedNodes.includes(id) || !!query.trim();
  const resourceGroupCount = hierarchy.reduce((total, subscription) => total + subscription.resourceGroups.length, 0);

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-4">
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] text-slate-500"><span>Azure Resources</span><span>/</span><span className="font-medium text-slate-700">Resource Explorer</span></nav>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-slate-900">Azure Resource Explorer</h1>
          <p className="mt-1 text-[13px] text-slate-600">Browse the Azure hierarchy first: subscription, resource group, then the resources inside it.</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />Refresh Azure</button>
      </div>

      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <Summary icon={Cloud} label="Azure connection" value={error ? "Needs attention" : loading ? "Checking" : "Connected"} note={error ?? "Managed Identity discovery"} tone={error ? "warn" : "good"} />
        <Summary icon={Folder} label="Resource groups" value={loading ? "—" : String(resourceGroupCount)} note={loading ? "Loading pilot scope" : "Groups in discovered subscriptions"} />
        <Summary icon={Server} label="Virtual machines" value={loading ? "—" : String(virtualMachines.length)} note={refreshedAt ? `Last refreshed ${refreshedAt}` : "Awaiting discovery"} />
      </section>

      {error && <section className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><span className="font-semibold">Azure discovery is unavailable.</span> {error}</div></section>}

      <section className="mt-3 overflow-hidden rounded-md border border-[#E2E8F0] bg-white">
        <header className="flex flex-wrap items-center gap-3 border-b border-[#E2E8F0] px-4 py-3">
          <div><h2 className="text-[13px] font-semibold text-slate-900">Azure hierarchy</h2><p className="mt-0.5 text-[11.5px] text-slate-500">Expand a folder to see what it contains. The Digital Twin opens only when you choose a VM.</p></div>
          <label className="relative ml-auto w-full max-w-[300px]"><Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subscription, group, resource..." className="h-8 w-full rounded-md border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 text-[12px] outline-none focus:border-[#1B4F91]/40 focus:bg-white" /></label>
        </header>

        <div className="min-h-[360px] p-3">
          {loading && <div className="grid min-h-[320px] place-items-center text-[12px] text-slate-500">Discovering Azure subscriptions and resources…</div>}
          {!loading && !error && filteredHierarchy.length === 0 && <div className="grid min-h-[320px] place-items-center text-[12px] text-slate-500">{virtualMachines.length ? "No resources match this search." : "No virtual machines were discovered in the pilot scope."}</div>}
          {!loading && filteredHierarchy.map((subscription) => {
            const subscriptionNode = nodeId("subscription", subscription.id);
            return <div key={subscriptionNode} className="rounded-md border border-[#E2E8F0] bg-[#FBFDFF]">
              <TreeButton open={isExpanded(subscriptionNode)} onClick={() => toggle(subscriptionNode)} icon={<FolderTree className="h-4 w-4 text-[#1B4F91]" />} title={subscription.displayName} detail={`${subscription.id} · ${subscription.resourceGroups.length} resource group${subscription.resourceGroups.length === 1 ? "" : "s"}`} strong />
              {isExpanded(subscriptionNode) && <div className="border-t border-[#EAF0F6] py-1">{subscription.resourceGroups.map((group) => {
                const groupNode = nodeId("group", subscription.id, group.name);
                const resourceTypes = resourcesByType(group.resources);
                return <div key={groupNode} className="ml-5 border-l border-[#D9E4EF] pl-2">
                  <TreeButton open={isExpanded(groupNode)} onClick={() => toggle(groupNode)} icon={<Folder className="h-4 w-4 text-amber-600" />} title={group.name} detail={`Resource group · ${group.location}`} />
                  {isExpanded(groupNode) && <div className="ml-5 border-l border-[#D9E4EF] pl-2">{resourceTypes.length === 0 && <div className="px-2 py-2 text-[11.5px] text-slate-500">No resources discovered</div>}{resourceTypes.map(([type, typedResources]) => {
                    const typeNode = nodeId("type", subscription.id, group.name, type);
                    return <div key={typeNode}><TreeButton open={isExpanded(typeNode)} onClick={() => toggle(typeNode)} icon={<Server className="h-3.5 w-3.5 text-[#1B4F91]" />} title={resourceTypeLabel(type)} detail={`${typedResources.length} discovered`} />
                      {isExpanded(typeNode) && <div className="ml-5 border-l border-[#D9E4EF] pl-2 pb-1">{typedResources.map((resource) => { const vm = virtualMachines.find((item) => item.id === resource.id); return <div key={resource.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded px-2 py-2 text-[12px] hover:bg-[#F4F8FC]"><div className="flex min-w-[220px] items-center gap-2"><Server className="h-3.5 w-3.5 text-[#1B4F91]" /><span className="font-medium text-slate-800">{resource.name}</span></div><span className="text-[11px] text-slate-500">{resource.location}{resource.kind ? ` · ${resource.kind}` : ""}</span>{vm ? <><span className={cn("rounded-full px-1.5 py-0.5 text-[10.5px] font-medium", isRunning(vm) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{vm.powerState}</span><Link to={detailPath(vm)} className="ml-auto text-[11.5px] font-medium text-[#1B4F91] hover:underline">Open Digital Twin</Link></> : <span className="ml-auto text-[11px] text-slate-400">Azure resource</span>}</div>; })}</div>}
                    </div>;
                  })}</div>}
                </div>;
              })}</div>}
            </div>;
          })}
        </div>
      </section>

      <section className="mt-3 rounded-md border border-[#E2E8F0] bg-white px-4 py-3 text-[12px] text-slate-600"><span className="font-medium text-slate-800">Discovery:</span> resources are read from the Azure control plane and grouped by subscription, resource group, and Azure resource type. Actions remain governed separately from discovery.</section>
    </div>
  );
}

function TreeButton({ open, onClick, icon, title, detail, strong = false }: { open: boolean; onClick: () => void; icon: React.ReactNode; title: string; detail: string; strong?: boolean }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-[#F4F8FC]"><span className="text-slate-500">{open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</span>{icon}<span className={cn("text-[12px]", strong ? "font-semibold text-slate-900" : "font-medium text-slate-800")}>{title}</span><span className="text-[11px] text-slate-500">{detail}</span></button>;
}

function Summary({ icon: Icon, label, value, note, tone }: { icon: typeof Cloud; label: string; value: string; note: string; tone?: "good" | "warn" }) {
  return <section className="rounded-md border border-[#E2E8F0] bg-white p-3"><div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><Icon className="h-4 w-4 text-[#1B4F91]" />{label}</div><div className={cn("mt-2 text-[16px] font-semibold", tone === "good" ? "text-emerald-700" : tone === "warn" ? "text-amber-700" : "text-slate-900")}>{value}</div><div className="mt-0.5 truncate text-[11.5px] text-slate-500" title={note}>{note}</div></section>;
}
