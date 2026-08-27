import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowDown, ArrowLeft, ArrowUp, ArrowUpDown, Cloud, Folder, RefreshCw, Search, Server, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AzureControlPlaneError, getAzureScopes, listAzureResources, listAzureVirtualMachines, type AzureResource, type AzureVirtualMachine } from "./azureControlPlane";
import { detailPathFor, resourceKindFor } from "./resourceKinds";

type AzureScopeGroup = { name: string; location: string };
type AzureScopeSubscription = { id: string; displayName: string; resourceGroups: AzureScopeGroup[] };

type SortKey = "name" | "type" | "resourceGroup" | "subscriptionName" | "location";
type SortDir = "asc" | "desc";
const ALL = "all";

// Kept outside React state so it survives this page unmounting when the user drills
// into a resource's Digital Twin, then restores on Back/breadcrumb return instead
// of every filter, sort, and scroll position resetting on each visit.
type ResourcesViewState = {
  query: string;
  subscriptionFilter: string;
  resourceGroupFilter: string;
  typeFilter: string;
  sortKey: SortKey;
  sortDir: SortDir;
  scrollY: number;
};
let viewStateCache: ResourcesViewState | null = null;

function isRunning(vm: AzureVirtualMachine) { return /running/i.test(vm.powerState); }

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

function resourceTypeLabel(type: string) {
  const raw = type.split("/").at(-1) ?? type;
  const spaced = raw.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function sortValue(resource: AzureResource, key: SortKey): string {
  return key === "type" ? resourceTypeLabel(resource.type) : resource[key];
}

export default function AzureResources() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusType = searchParams.get("type");
  // Snapshot once at mount: this is what a Back/breadcrumb return should restore,
  // independent of whatever this same instance later writes to the module cache.
  const restoredViewRef = useRef(viewStateCache);

  const [virtualMachines, setVirtualMachines] = useState<AzureVirtualMachine[]>([]);
  const [resources, setResources] = useState<AzureResource[]>([]);
  const [subscriptions, setSubscriptions] = useState<AzureScopeSubscription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);
  const [resourcesError, setResourcesError] = useState<string | null>(null);

  const [query, setQuery] = useState(() => restoredViewRef.current?.query ?? "");
  const [subscriptionFilter, setSubscriptionFilter] = useState(() => restoredViewRef.current?.subscriptionFilter ?? ALL);
  const [resourceGroupFilter, setResourceGroupFilter] = useState(() => restoredViewRef.current?.resourceGroupFilter ?? ALL);
  // An explicit ?type= link (e.g. a "Virtual Machines" breadcrumb) always wins over
  // whatever was cached — that link is a deliberate request to focus on one kind.
  const [typeFilter, setTypeFilter] = useState(() => focusType ?? restoredViewRef.current?.typeFilter ?? ALL);
  const [sortKey, setSortKey] = useState<SortKey>(() => restoredViewRef.current?.sortKey ?? "name");
  const [sortDir, setSortDir] = useState<SortDir>(() => restoredViewRef.current?.sortDir ?? "asc");
  const scrollRestoredRef = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResourcesError(null);
    try {
      const [discoveredVms, scopes] = await Promise.all([listAzureVirtualMachines(), getAzureScopes()]);
      setVirtualMachines(discoveredVms);
      setSubscriptions(scopeSubscriptions(scopes));

      let discoveredResources: AzureResource[] = [];
      try {
        discoveredResources = await listAzureResources();
      } catch (resourceReason) {
        // Resource discovery is a separate, still-maturing endpoint. Its failure
        // shouldn't take down the VM list and subscription data, which work today.
        setResourcesError(resourceReason instanceof AzureControlPlaneError ? resourceReason.message : "Unable to load the full resource inventory.");
      }
      setResources(discoveredResources);
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

  // Keep the latest filter/sort state readable from the unmount cleanup below
  // without re-running that effect (and re-registering scroll capture) on every change.
  const latestViewRef = useRef({ query, subscriptionFilter, resourceGroupFilter, typeFilter, sortKey, sortDir });
  useEffect(() => {
    latestViewRef.current = { query, subscriptionFilter, resourceGroupFilter, typeFilter, sortKey, sortDir };
  }, [query, subscriptionFilter, resourceGroupFilter, typeFilter, sortKey, sortDir]);

  useEffect(() => {
    return () => {
      viewStateCache = { ...latestViewRef.current, scrollY: window.scrollY };
    };
  }, []);

  // Restore scroll position once the table has real height to scroll into, so a
  // Back/breadcrumb return lands where the user left off instead of at the top.
  useEffect(() => {
    if (loading || scrollRestoredRef.current) return;
    scrollRestoredRef.current = true;
    const targetY = restoredViewRef.current?.scrollY;
    if (targetY) window.requestAnimationFrame(() => window.scrollTo(0, targetY));
  }, [loading]);

  // A subscription/resource-group filter that no longer applies (subscription
  // changed, or a cached value that no longer exists) is reset rather than left
  // silently matching nothing.
  const resourceGroupOptions = useMemo(() => {
    const groups = subscriptionFilter === ALL
      ? subscriptions.flatMap((s) => s.resourceGroups.map((g) => g.name))
      : subscriptions.find((s) => s.id === subscriptionFilter)?.resourceGroups.map((g) => g.name) ?? [];
    return [...new Set(groups)].sort((a, b) => a.localeCompare(b));
  }, [subscriptions, subscriptionFilter]);
  useEffect(() => {
    // Skip while still loading: an empty options list before data has arrived
    // doesn't mean a restored filter is invalid, just that we don't know yet.
    if (loading) return;
    if (resourceGroupFilter !== ALL && !resourceGroupOptions.includes(resourceGroupFilter)) setResourceGroupFilter(ALL);
  }, [loading, resourceGroupOptions, resourceGroupFilter]);

  const typeOptions = useMemo(
    () => [...new Set(resources.map((r) => r.type))]
      .map((type) => ({ value: type, label: resourceTypeLabel(type) }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [resources],
  );

  const resourceGroupCount = useMemo(
    () => subscriptions.reduce((total, s) => total + s.resourceGroups.length, 0),
    [subscriptions],
  );

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return resources.filter((resource) => {
      if (subscriptionFilter !== ALL && resource.subscriptionId !== subscriptionFilter) return false;
      if (resourceGroupFilter !== ALL && resource.resourceGroup !== resourceGroupFilter) return false;
      if (typeFilter !== ALL && resource.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
      if (!term) return true;
      return `${resource.name} ${resourceTypeLabel(resource.type)} ${resource.resourceGroup} ${resource.subscriptionName} ${resource.location}`.toLowerCase().includes(term);
    });
  }, [resources, subscriptionFilter, resourceGroupFilter, typeFilter, query]);

  const sortedRows = useMemo(() => {
    const rows = [...filteredRows].sort((a, b) => sortValue(a, sortKey).localeCompare(sortValue(b, sortKey)));
    return sortDir === "asc" ? rows : rows.reverse();
  }, [filteredRows, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtersActive = query.trim() !== "" || subscriptionFilter !== ALL || resourceGroupFilter !== ALL || typeFilter !== ALL;
  const clearFilters = () => { setQuery(""); setSubscriptionFilter(ALL); setResourceGroupFilter(ALL); setTypeFilter(ALL); };

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-4">
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 hover:text-slate-800"><ArrowLeft className="h-3.5 w-3.5" />Back</button>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-slate-900">Azure Resource Explorer</h1>
          <p className="mt-1 text-[13px] text-slate-600">Every discovered resource in one filterable list — narrow by subscription, resource group, or type, then sort any column.</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />Refresh Azure</button>
      </div>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Summary icon={Cloud} label="Azure connection" value={error ? "Needs attention" : loading ? "Checking" : "Connected"} note={error ?? "Managed Identity discovery"} tone={error ? "warn" : "good"} />
        <Summary icon={Folder} label="Resource groups" value={loading ? "—" : String(resourceGroupCount)} note={loading ? "Loading pilot scope" : "Groups in discovered subscriptions"} />
        <Summary icon={Server} label="Virtual machines" value={loading ? "—" : String(virtualMachines.length)} note={refreshedAt ? `Last refreshed ${refreshedAt}` : "Awaiting discovery"} />
        <Summary icon={Server} label="All resources" value={loading ? "—" : String(resources.length)} note={resourcesError ? "Partial — see notice below" : "Total discovered"} tone={resourcesError ? "warn" : undefined} />
      </section>

      {error && <section className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><span className="font-semibold">Azure discovery is unavailable.</span> {error}</div></section>}

      {!error && resourcesError && <section className="mt-3 flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-[12px] text-slate-600"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div><span className="font-semibold text-slate-700">Full resource inventory unavailable.</span> {resourcesError} Virtual machines and subscriptions above are still live.</div></section>}

      <section className="mt-3 overflow-hidden rounded-md border border-[#E2E8F0] bg-white">
        <header className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] px-4 py-3">
          <FilterSelect label="Subscription" value={subscriptionFilter} onChange={setSubscriptionFilter} options={subscriptions.map((s) => ({ value: s.id, label: s.displayName }))} />
          <FilterSelect label="Resource group" value={resourceGroupFilter} onChange={setResourceGroupFilter} options={resourceGroupOptions.map((name) => ({ value: name, label: name }))} />
          <FilterSelect label="Type" value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
          <label className="relative w-full max-w-[260px]"><Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resources..." className="h-8 w-full rounded-md border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 text-[12px] outline-none focus:border-[#1B4F91]/40 focus:bg-white" /></label>
          {filtersActive && <button type="button" onClick={clearFilters} className="inline-flex h-8 items-center gap-1 rounded-md border border-[#E2E8F0] px-2.5 text-[11.5px] font-medium text-slate-600 hover:bg-slate-50"><X className="h-3.5 w-3.5" />Clear filters</button>}
          <span className="ml-auto text-[11.5px] text-slate-500">{loading ? "Loading…" : `${sortedRows.length} of ${resources.length} resources`}</span>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-[12px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left text-[10.5px] uppercase tracking-wider text-slate-500">
                <SortableHeader label="Name" sortKey="name" active={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableHeader label="Type" sortKey="type" active={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableHeader label="Resource group" sortKey="resourceGroup" active={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableHeader label="Subscription" sortKey="subscriptionName" active={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableHeader label="Location" sortKey="location" active={sortKey} dir={sortDir} onClick={toggleSort} />
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Digital twin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading && <tr><td colSpan={7} className="px-3 py-10 text-center text-slate-500">Discovering Azure subscriptions and resources…</td></tr>}
              {!loading && !error && sortedRows.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-10 text-center text-slate-500">{resources.length ? "No resources match these filters." : "No resources were discovered in the pilot scope."}</td></tr>
              )}
              {!loading && sortedRows.map((resource) => {
                const vm = virtualMachines.find((item) => item.id === resource.id);
                const kind = resourceKindFor(resource.type);
                return (
                  <tr key={resource.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-3 py-2"><div className="flex items-center gap-2"><Server className="h-3.5 w-3.5 shrink-0 text-[#1B4F91]" /><span className="font-medium text-slate-800">{resource.name}</span></div></td>
                    <td className="px-3 py-2 text-slate-600">{resourceTypeLabel(resource.type)}{resource.kind ? ` · ${resource.kind}` : ""}</td>
                    <td className="px-3 py-2 text-slate-600">{resource.resourceGroup}</td>
                    <td className="px-3 py-2 text-slate-600">{resource.subscriptionName}</td>
                    <td className="px-3 py-2 text-slate-600">{resource.location}</td>
                    <td className="px-3 py-2">{vm ? <span className={cn("inline-flex rounded-full px-1.5 py-0.5 text-[10.5px] font-medium", isRunning(vm) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{vm.powerState}</span> : <span className="text-slate-300">—</span>}</td>
                    <td className="px-3 py-2">{kind ? <Link to={detailPathFor(kind, resource.name)} className="font-medium text-[#1B4F91] hover:underline">Open Digital Twin</Link> : <span className="text-slate-300">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-3 rounded-md border border-[#E2E8F0] bg-white px-4 py-3 text-[12px] text-slate-600"><span className="font-medium text-slate-800">Discovery:</span> resources are read from the Azure control plane; filters narrow what's shown, they don't change what's discovered. Actions remain governed separately from discovery.</section>
    </div>
  );
}

function SortableHeader({ label, sortKey, active, dir, onClick }: { label: string; sortKey: SortKey; active: SortKey; dir: SortDir; onClick: (key: SortKey) => void }) {
  const isActive = active === sortKey;
  const Icon = isActive ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className="px-3 py-2">
      <button type="button" onClick={() => onClick(sortKey)} className={cn("inline-flex items-center gap-1 hover:text-slate-800", isActive && "text-[#1B4F91]")}>
        {label}<Icon className="h-3 w-3" />
      </button>
    </th>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
      <span className="hidden sm:inline">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-8 max-w-[180px] rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px] text-slate-700 outline-none focus:border-[#1B4F91]/40">
        <option value={ALL}>All {label.toLowerCase()}s</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function Summary({ icon: Icon, label, value, note, tone }: { icon: typeof Cloud; label: string; value: string; note: string; tone?: "good" | "warn" }) {
  return <section className="rounded-md border border-[#E2E8F0] bg-white p-3"><div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><Icon className="h-4 w-4 text-[#1B4F91]" />{label}</div><div className={cn("mt-2 text-[16px] font-semibold", tone === "good" ? "text-emerald-700" : tone === "warn" ? "text-amber-700" : "text-slate-900")}>{value}</div><div className="mt-0.5 truncate text-[11.5px] text-slate-500" title={note}>{note}</div></section>;
}
