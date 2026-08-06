import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell, CircleUser, Database, Download, Filter, Gauge, HelpCircle, Plug, RefreshCw,
  Save, Search, ShieldCheck, SlidersHorizontal, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { KpiCard } from "./command-center/panels";
import {
  AccessMatrixDrawer, AccessPanel, AdvancedOptionsDrawer, AlertDrawer, AlertsPanel,
  ChangeDrawer, ChangesPanel, ClassificationDrawer, ClassificationPanel,
  ConnectorConfigurationPanel, ConnectorManagementDrawer, ConnectorSummaryDrawer,
  DiscoveryOptionsPanel, FooterNote, GovernanceSummaryPanel, PolicyDrawer, PolicyOverviewPanel,
  ScheduleDrawer, SchedulePanel, SourceConfigurationPanel, SourceDrawer,
} from "./configuration/panels";
import {
  AddSourceDialog, ExportConfigurationDialog, NewAlertDialog, NewClassificationDialog,
  NewScheduleDialog, SaveChangesDialog, type PendingChange,
} from "./configuration/dialogs";
import {
  accessBreakdown as baseAccessBreakdown, activeFilterCount, alertRules as seedAlerts,
  classificationRules as seedClassifications, configuration, defaultFilters, demoScenarios,
  discoveryOptions as seedOptions, filterOptions, kpiTrends, notificationSeed,
  policies as seedPolicies, recentChanges, resolveSources, scenarioSnapshots,
  schedules as seedSchedules, searchCatalog,
  type AccessState, type AlertRule, type ConfigurationChange, type ConnectorSummaryRow,
  type DataClassificationRule, type DemoScenario, type DiscoveryOption, type DiscoveryPolicy,
  type Filters, type ScheduleProfile, type SourceConfiguration, type ViewMode,
} from "./configuration/data";

const VIEW_LABEL: Record<ViewMode, string> = {
  executive: "Executive View",
  operations: "Operations View",
  governance: "Governance View",
};

const STORY = [
  { target: "kpi-sources", caption: "Discovery begins with an explicit, governed set of configured enterprise sources.", notes: "147 sources with named owners define the discovery boundary." },
  { target: "panel-policies", caption: "Policies determine what may be discovered, classified, retained, and excluded.", notes: "Policy coverage is the governance control plane for discovery." },
  { target: "panel-sources", caption: "Every source carries ownership, authentication, access, schedule, and operational configuration.", notes: "The source table is the operating record for discovery configuration." },
  { target: "panel-connectors", caption: "Connectors define how the platform authenticates and reads from each system.", notes: "Credentials are referenced; scope and throughput are constrained." },
  { target: "panel-schedules", caption: "Schedules control discovery cadence, freshness, and system load.", notes: "Real-time, hourly, and daily profiles balance freshness against cost." },
  { target: "panel-access", caption: "Access configuration ensures the Fabric never exceeds enterprise permission boundaries.", notes: "Restricted and pending sources are held back from ingestion." },
  { target: "panel-changes", caption: "Every configuration change is versioned, attributed, and reversible.", notes: "The audit trail supports enterprise change review." },
];

const PREF_KEY = "ecf.discoveryConfiguration.prefs";

function loadPrefs(): { view: ViewMode; filters: Filters } {
  if (typeof window === "undefined") return { view: "executive", filters: defaultFilters };
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (!raw) return { view: "executive", filters: defaultFilters };
    const parsed = JSON.parse(raw) as { view?: ViewMode; filters?: Partial<Filters> };
    return { view: parsed.view ?? "executive", filters: { ...defaultFilters, ...(parsed.filters ?? {}) } };
  } catch {
    return { view: "executive", filters: defaultFilters };
  }
}

const nowLabel = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function DiscoveryConfiguration() {
  const navigate = useNavigate();
  const initial = useRef(loadPrefs());
  const [view, setView] = useState<ViewMode>(initial.current.view);
  const [filters, setFilters] = useState<Filters>(initial.current.filters);
  const [draftFilters, setDraftFilters] = useState<Filters>(initial.current.filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(nowLabel);
  const [scenario, setScenario] = useState<DemoScenario>("healthy");
  const [announce, setAnnounce] = useState("");

  const [policies, setPolicies] = useState<DiscoveryPolicy[]>(seedPolicies);
  const [schedules, setSchedules] = useState<ScheduleProfile[]>(seedSchedules);
  const [classifications, setClassifications] = useState<DataClassificationRule[]>(seedClassifications);
  const [alerts, setAlerts] = useState<AlertRule[]>(seedAlerts);
  const [options, setOptions] = useState<DiscoveryOption[]>(seedOptions);
  const [extraSources, setExtraSources] = useState<SourceConfiguration[]>([]);
  const [pending, setPending] = useState<PendingChange[]>([]);
  const [changes, setChanges] = useState<ConfigurationChange[]>(recentChanges);

  const [policy, setPolicy] = useState<DiscoveryPolicy | null>(null);
  const [source, setSource] = useState<SourceConfiguration | null>(null);
  const [connectorRow, setConnectorRow] = useState<ConnectorSummaryRow | null>(null);
  const [connectorMgmt, setConnectorMgmt] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleProfile | null>(null);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [classification, setClassification] = useState<DataClassificationRule | null>(null);
  const [alert, setAlert] = useState<AlertRule | null>(null);
  const [change, setChange] = useState<ConfigurationChange | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [newScheduleOpen, setNewScheduleOpen] = useState(false);
  const [newClassOpen, setNewClassOpen] = useState(false);
  const [newAlertOpen, setNewAlertOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationSeed);
  const [storyStep, setStoryStep] = useState<number | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [accessState, setAccessState] = useState<string>("All");

  useEffect(() => {
    window.localStorage.setItem(PREF_KEY, JSON.stringify({ view, filters }));
  }, [view, filters]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") setStoryStep(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const snapshot = scenarioSnapshots[scenario];

  useEffect(() => {
    setNotifications([...snapshot.extraNotifications, ...notificationSeed]);
    setChanges([...snapshot.extraChanges, ...recentChanges]);
  }, [snapshot]);

  const sources = useMemo(
    () => [...resolveSources(scenario, filters), ...extraSources],
    [scenario, filters, extraSources],
  );
  const allSources = useMemo(() => resolveSources(scenario, defaultFilters), [scenario]);

  const visibleSources = useMemo(
    () => (accessState === "All" ? sources : sources.filter((s) => s.access === accessState)),
    [sources, accessState],
  );

  const ratio = allSources.length ? sources.length / allSources.length : 1;
  const scale = (n: number) => Math.max(1, Math.round(n * (0.55 + 0.45 * ratio)));

  const accessBreakdown = useMemo(() => {
    const o = snapshot.accessOverride;
    if (!o) return baseAccessBreakdown;
    const map: Record<string, number> = { Approved: o.approved, Restricted: o.restricted, Pending: o.pending, Denied: o.denied };
    return baseAccessBreakdown.map((b) => ({ ...b, value: map[b.label] ?? b.value }));
  }, [snapshot]);

  const refresh = useCallback(() => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setUpdatedAt(nowLabel());
      setAnnounce("Configuration refreshed");
      toast.success("Configuration refreshed");
    }, 700);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  useEffect(() => {
    if (storyStep === null) return;
    scrollTo(STORY[storyStep].target);
    setAnnounce(STORY[storyStep].caption);
  }, [storyStep, scrollTo]);

  const spotlight = (id: string) => storyStep !== null && STORY[storyStep].target === id;
  const degraded = (key: keyof typeof snapshot.degradedPanels) => snapshot.degradedPanels[key] ?? null;

  const track = (objectType: string, object: string, previous: string, next: string, affectedSources: number, impact: string, highRisk = false) => {
    setPending((p) => [
      ...p.filter((c) => c.object !== object),
      { id: `${object}-${Date.now()}`, objectType, object, previous, next, affectedSources, impact, highRisk },
    ]);
  };

  const unsaved = pending.length > 0;

  const applySave = (mode: "draft" | "activate", reason: string) => {
    const stamped: ConfigurationChange[] = pending.map((c, i) => ({
      id: `chg-live-${Date.now()}-${i}`, time: nowLabel(), objectType: c.objectType, objectId: c.object,
      changeType: "Modified", description: `${c.object} changed from ${c.previous} to ${c.next}`,
      previousValue: c.previous, newValue: c.next, changedBy: "Alex Valencia",
      changeReason: reason || "Operator update",
      approvalStatus: mode === "activate" ? "Approved" : "Pending",
      auditId: `AUD-${Math.floor(Math.random() * 90000 + 10000)}`,
    }));
    setChanges((c) => [...stamped, ...c]);
    setPending([]);
    toast.success(mode === "activate" ? "Configuration saved and activated" : "Configuration saved as draft");
    setAnnounce(mode === "activate" ? "Configuration activated" : "Configuration saved as draft");
  };

  const sourceAction = (action: string, s: SourceConfiguration) => {
    if (action === "Pause Discovery" || action === "Resume Discovery") {
      track("Source", s.name, s.status, action.startsWith("Pause") ? "Paused" : "Healthy", 1, "Discovery cadence changes for this source");
    }
    toast.success(`${action} — ${s.name}`);
  };

  return (
    <div className="min-h-full bg-slate-50">
      <div className="sr-only" role="status" aria-live="polite">{announce}</div>

      {/* header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-2.5 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Link to="/enterprise-cognitive-fabric" className="hover:text-blue-700">Enterprise Cognitive Fabric</Link>
              <span aria-hidden>/</span>
              <Link to="/enterprise-cognitive-fabric/discovery/source-discovery" className="hover:text-blue-700">Discovery</Link>
              <span aria-hidden>/</span>
              <span className="font-medium text-slate-700">Discovery Configuration</span>
            </nav>
            <h1 className="truncate text-[19px] font-bold text-slate-900">Discovery Configuration</h1>
            <p className="text-[11.5px] text-slate-500">
              Governed control plane for what the Enterprise Cognitive Fabric is allowed to discover · {configuration.version} · Updated {updatedAt}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Select value={view} onValueChange={(v) => setView(v as ViewMode)}>
              <SelectTrigger className="h-8 w-[152px] text-[12px]" aria-label="View mode"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(VIEW_LABEL) as ViewMode[]).map((v) => (
                  <SelectItem key={v} value={v} className="text-[12px]">{VIEW_LABEL[v]}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={scenario} onValueChange={(v) => { setScenario(v as DemoScenario); setAnnounce(`Scenario ${v}`); }}>
              <SelectTrigger className="h-8 w-[190px] text-[12px]" aria-label="Demonstration scenario"><SelectValue /></SelectTrigger>
              <SelectContent>
                {demoScenarios.map((s) => <SelectItem key={s.id} value={s.id} className="text-[12px]">{s.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => { setDraftFilters(filters); setFiltersOpen(true); }}>
              <Filter className="mr-1 h-3.5 w-3.5" aria-hidden /> Filters
              {activeFilterCount(filters) > 0 && (
                <span className="ml-1 rounded bg-blue-100 px-1 text-[10px] font-semibold text-blue-700">{activeFilterCount(filters)}</span>
              )}
            </Button>

            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setSearchOpen(true)}>
              <Search className="mr-1 h-3.5 w-3.5" aria-hidden /> Search
            </Button>

            <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Refresh configuration" onClick={refresh}>
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} aria-hidden />
            </Button>

            <Button variant="outline" size="sm" className="relative h-8 w-8 p-0" aria-label="Notifications" onClick={() => setNotifOpen(true)}>
              <Bell className="h-3.5 w-3.5" aria-hidden />
              {notifications.some((n) => !n.read) && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />}
            </Button>

            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setExportOpen(true)}>
              <Download className="mr-1 h-3.5 w-3.5" aria-hidden /> Export
            </Button>

            <Button size="sm" className="h-8 text-[12px]" onClick={() => setAddOpen(true)}>Add Source</Button>

            <Button size="sm" variant={unsaved ? "default" : "outline"} className="h-8 text-[12px]" disabled={!unsaved} onClick={() => setSaveOpen(true)}>
              <Save className="mr-1 h-3.5 w-3.5" aria-hidden /> Save Changes{unsaved ? ` (${pending.length})` : ""}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Account and help"><CircleUser className="h-3.5 w-3.5" aria-hidden /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-[12px]">
                <DropdownMenuLabel>Alex Valencia · Configuration Admin</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setStoryStep(0)}>Start guided demo story</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setShowNotes((v) => !v)}>{showNotes ? "Hide" : "Show"} presenter notes</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { setFilters(defaultFilters); setAccessState("All"); toast.success("Filters cleared"); }}>Reset filters</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Guided demo story" onClick={() => setStoryStep(0)}>
              <HelpCircle className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>
        </div>

        {snapshot.banner && (
          <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11.5px] text-amber-800" role="status">
            {snapshot.banner}
          </div>
        )}
        {unsaved && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11.5px] text-blue-800">
            <span>{pending.length} unsaved configuration change{pending.length === 1 ? "" : "s"}.</span>
            <span className="flex gap-1.5">
              <Button size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => setPending([])}>Discard</Button>
              <Button size="sm" className="h-6 text-[11px]" onClick={() => setSaveOpen(true)}>Review</Button>
            </span>
          </div>
        )}
      </header>

      <main className="space-y-3 px-5 py-4">
        {/* KPIs */}
        <section aria-label="Configuration key metrics" className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard
            label="Configured Sources" value={String(scale(snapshot.configuredSources))} change="+6 this month"
            status={`${sources.length} in current filter`} icon={Database} trend={kpiTrends.sources} color="#2563eb"
            tooltip="Enterprise sources registered in the governed discovery configuration."
            onClick={() => scrollTo("panel-sources")} loading={loading} spotlight={spotlight("kpi-sources")}
          />
          <KpiCard
            label="Active Connectors" value={String(snapshot.activeConnectors)}
            change={`${snapshot.healthyConnectors} healthy`} status={`${snapshot.degradedConnectors} degraded`}
            icon={Plug} trend={kpiTrends.connectors} color="#0d9488"
            tooltip="Connectors currently authorized to read from enterprise systems."
            onClick={() => scrollTo("panel-connectors")} loading={loading}
          />
          <KpiCard
            label="Scheduled Jobs" value={String(snapshot.scheduledJobs)} change="Next run 2:00 AM"
            status="America/New_York" icon={Gauge} trend={kpiTrends.jobs} color="#7c3aed"
            tooltip="Discovery jobs scheduled across all cadence profiles."
            onClick={() => scrollTo("panel-schedules")} loading={loading}
          />
          <KpiCard
            label="Policy Coverage" value={`${snapshot.policyCoverage}%`} change="Target 95%"
            status={snapshot.policyCoverage < 85 ? "Below target" : "On track"} icon={ShieldCheck}
            trend={kpiTrends.policy} color="#ea580c"
            tooltip="Share of sources covered by every required discovery policy."
            onClick={() => scrollTo("panel-policies")} loading={loading}
          />
          <KpiCard
            label="Permission Validations" value={String(snapshot.permissionValidations)}
            change="Last 24 hours" status={snapshot.permissionStatus} icon={SlidersHorizontal}
            trend={kpiTrends.permissions} color="#dc2626"
            tooltip="Permission checks executed before any artifact is queued for ingestion."
            onClick={() => scrollTo("panel-access")} loading={loading}
          />
        </section>

        {/* policies + connectors */}
        <section className="grid gap-3 lg:grid-cols-2">
          <PolicyOverviewPanel
            policies={policies}
            onToggle={(id, next) => {
              const p = policies.find((x) => x.id === id);
              setPolicies((cur) => cur.map((x) => (x.id === id ? { ...x, enabled: next } : x)));
              if (p) track("Policy", p.name, p.enabled ? "Enabled" : "Disabled", next ? "Enabled" : "Disabled", p.coveredSources, next ? "Policy applied to covered sources" : "Policy no longer enforced", !next);
            }}
            onOpen={setPolicy}
            onFooter={() => toast.info("Policy management workspace opened")}
            loading={loading} degraded={degraded("policies")} spotlight={spotlight("panel-policies")}
            governance={view === "governance"}
          />
          <ConnectorConfigurationPanel
            onOpenSummary={setConnectorRow}
            onManage={() => setConnectorMgmt(true)}
            loading={loading} degraded={degraded("connectors")} spotlight={spotlight("panel-connectors")}
          />
        </section>

        {/* source configuration */}
        <section>
          <SourceConfigurationPanel
            sources={visibleSources}
            onOpenSource={setSource}
            onAddSource={() => setAddOpen(true)}
            onRowAction={sourceAction}
            loading={loading} degraded={degraded("sources")} spotlight={spotlight("panel-sources")}
            operations={view === "operations"}
            categoryFilter={filters.sourceCategory}
            statusFilter={filters.connectorStatus}
            accessFilter={accessState}
            ownerFilter={filters.owner}
            onCategoryFilter={(v) => setFilters((f) => ({ ...f, sourceCategory: v }))}
            onStatusFilter={(v) => setFilters((f) => ({ ...f, connectorStatus: v }))}
            onAccessFilter={setAccessState}
            onOwnerFilter={(v) => setFilters((f) => ({ ...f, owner: v }))}
          />
        </section>

        {/* schedules + access */}
        <section className="grid gap-3 lg:grid-cols-2">
          <SchedulePanel
            schedules={schedules}
            onOpen={setSchedule}
            onNew={() => setNewScheduleOpen(true)}
            onFooter={() => toast.info("Schedule management workspace opened")}
            loading={loading} degraded={degraded("schedules")} spotlight={spotlight("panel-schedules")}
          />
          <AccessPanel
            breakdown={accessBreakdown}
            onSelect={(state: AccessState) => { setAccessState(state); setAnnounce(`Filtered to ${state} sources`); scrollTo("panel-sources"); }}
            onMatrix={() => setMatrixOpen(true)}
            loading={loading} degraded={degraded("access")} spotlight={spotlight("panel-access")}
            activeState={accessState}
          />
        </section>

        {/* classification + options */}
        <section className="grid gap-3 lg:grid-cols-2">
          <ClassificationPanel
            rules={classifications}
            onOpen={setClassification}
            onNew={() => setNewClassOpen(true)}
            onFooter={() => toast.info("Classification workspace opened")}
            loading={loading} degraded={degraded("classification")}
          />
          <DiscoveryOptionsPanel
            options={options}
            onToggle={(id, next) => {
              const o = options.find((x) => x.id === id);
              setOptions((cur) => cur.map((x) => (x.id === id ? { ...x, enabled: next } : x)));
              if (o) track("Discovery Option", o.name, o.enabled ? "Enabled" : "Disabled", next ? "Enabled" : "Disabled", sources.length, "Applies to every discovery run");
            }}
            onAdvanced={() => setAdvancedOpen(true)}
            loading={loading}
          />
        </section>

        {/* alerts + changes */}
        <section className="grid gap-3 lg:grid-cols-2">
          <AlertsPanel
            rules={alerts}
            onToggle={(id, next) => {
              const a = alerts.find((x) => x.id === id);
              setAlerts((cur) => cur.map((x) => (x.id === id ? { ...x, enabled: next } : x)));
              if (a) track("Alert Rule", a.name, a.enabled ? "Active" : "Paused", next ? "Active" : "Paused", 0, "Notification routing changes");
            }}
            onOpen={setAlert}
            onNew={() => setNewAlertOpen(true)}
            onFooter={() => toast.info("Alert management workspace opened")}
            loading={loading} degraded={degraded("alerts")}
          />
          <ChangesPanel
            changes={changes}
            onOpen={setChange}
            onFooter={() => toast.info("Full change history opened")}
            loading={loading} spotlight={spotlight("panel-changes")}
          />
        </section>

        {view === "governance" && (
          <section><GovernanceSummaryPanel pendingApproval={snapshot.pendingApproval} loading={loading} /></section>
        )}

        <FooterNote onNext={() => navigate("/enterprise-cognitive-fabric/discovery/pipelines")} />
      </main>

      {/* filters */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader><SheetTitle className="text-[15px]">Filters</SheetTitle></SheetHeader>
          <div className="mt-3 space-y-2.5">
            {(Object.keys(filterOptions) as (keyof Filters)[]).map((key) => (
              <div key={key} className="grid gap-1">
                <label htmlFor={`flt-${key}`} className="text-[11px] capitalize text-slate-600">
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                </label>
                <Select value={draftFilters[key]} onValueChange={(v) => setDraftFilters((f) => ({ ...f, [key]: v }))}>
                  <SelectTrigger id={`flt-${key}`} className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {filterOptions[key].map((o) => <SelectItem key={o} value={o} className="text-[12px]">{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-1.5">
            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setDraftFilters(defaultFilters)}>Clear All</Button>
            <Button size="sm" className="h-8 text-[12px]" onClick={() => { setFilters(draftFilters); setFiltersOpen(false); setAnnounce("Filters applied"); }}>Apply Filters</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* notifications */}
      <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader><SheetTitle className="text-[15px]">Notifications</SheetTitle></SheetHeader>
          <div className="mt-2 flex justify-end">
            <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}>Mark all read</Button>
          </div>
          <ul className="mt-2 divide-y divide-slate-100">
            {notifications.map((n) => (
              <li key={n.id} className="py-2">
                <div className="flex items-start gap-2">
                  {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" aria-hidden />}
                  <div className="min-w-0">
                    <p className="text-[12px] text-slate-800">{n.title}</p>
                    <p className="text-[11px] text-slate-500">{n.type} · {n.time}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      {/* search */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search sources, connectors, schedules, policies, rules…" />
        <CommandList>
          <CommandEmpty>No configuration objects found.</CommandEmpty>
          {["Sources", "Connectors", "Schedules", "Policies", "Classifications", "Alert Rules", "Recent Changes"].map((group) => (
            <CommandGroup key={group} heading={group}>
              {searchCatalog.filter((c) => c.type === group).slice(0, 6).map((c) => (
                <CommandItem
                  key={`${c.type}-${c.id}`} value={`${c.name} ${c.type} ${c.owner}`}
                  onSelect={() => {
                    setSearchOpen(false);
                    const map: Record<string, string> = {
                      Sources: "panel-sources", Connectors: "panel-connectors", Schedules: "panel-schedules",
                      Policies: "panel-policies", Classifications: "panel-classification",
                      "Alert Rules": "panel-alerts", "Recent Changes": "panel-changes",
                    };
                    scrollTo(map[c.type]);
                  }}
                >
                  <span className="truncate text-[12px]">{c.name}</span>
                  <span className="ml-auto text-[11px] text-slate-500">{c.status}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>

      {/* drawers */}
      <PolicyDrawer policy={policy} onOpenChange={(v) => !v && setPolicy(null)} />
      <SourceDrawer source={source} onOpenChange={(v) => !v && setSource(null)} onAction={sourceAction} />
      <ConnectorSummaryDrawer row={connectorRow} onOpenChange={(v) => !v && setConnectorRow(null)} />
      <ConnectorManagementDrawer open={connectorMgmt} onOpenChange={setConnectorMgmt} onAction={(a, c) => toast.success(`${a} — ${c.name}`)} />
      <ScheduleDrawer schedule={schedule} onOpenChange={(v) => !v && setSchedule(null)} onAction={(a, s) => { toast.success(`${a} — ${s.name}`); if (a.startsWith("Pause") || a.startsWith("Resume")) track("Schedule", s.name, s.status, a.startsWith("Pause") ? "Paused" : "Active", s.sources, "Affects discovery freshness"); }} />
      <AccessMatrixDrawer open={matrixOpen} onOpenChange={setMatrixOpen} onChangeAccess={(team, category) => track("Access Policy", `${team} · ${category}`, "Approved", "Restricted", 4, "Team loses discovery visibility", true)} />
      <ClassificationDrawer rule={classification} onOpenChange={(v) => !v && setClassification(null)} />
      <AlertDrawer rule={alert} onOpenChange={(v) => !v && setAlert(null)} />
      <ChangeDrawer
        change={change} onOpenChange={(v) => !v && setChange(null)}
        onRollback={(c) => { track("Configuration", c.description, c.newValue, c.previousValue, 1, "Reverts a previously applied change", true); setChange(null); }}
      />
      <AdvancedOptionsDrawer open={advancedOpen} onOpenChange={setAdvancedOpen} onChange={() => track("Advanced Option", "Advanced discovery options", "Baseline", "Modified", sources.length, "Applies globally to discovery runs")} />

      {/* dialogs */}
      <AddSourceDialog
        open={addOpen} onOpenChange={setAddOpen}
        onCreated={(d) => {
          const created: SourceConfiguration = {
            ...resolveSources("healthy", defaultFilters)[0],
            id: `src-new-${Date.now()}`, name: d.name || "New Source", category: d.category, platform: d.platform,
            businessOwner: d.businessOwner, technicalOwner: d.technicalOwner, businessUnit: d.businessUnit,
            team: d.team, knowledgeDomains: [d.knowledgeDomain], environment: d.environment,
            authenticationMethod: d.authMethod as SourceConfiguration["authenticationMethod"],
            authorizationScope: d.scopes,
            discoveryMode: d.mode as SourceConfiguration["discoveryMode"],
            scheduleLabel: d.frequency,
            accessClassification: d.classification as SourceConfiguration["accessClassification"],
            status: "Healthy", access: d.classification === "Highly Restricted" ? "Pending" : "Approved",
            lastRun: "Never", warnings: [],
          };
          setExtraSources((cur) => [created, ...cur]);
          track("Source", created.name, "Not registered", "Registered", 1, "New source added to the discovery boundary");
          setSource(created);
        }}
      />
      <NewScheduleDialog
        open={newScheduleOpen} onOpenChange={setNewScheduleOpen}
        onCreate={(s) => { setSchedules((cur) => [...cur, s]); track("Schedule", s.name, "None", s.frequency, s.sources, "New discovery cadence activated"); toast.success("Schedule created"); }}
      />
      <NewClassificationDialog
        open={newClassOpen} onOpenChange={setNewClassOpen}
        onCreate={(r) => { setClassifications((cur) => [...cur, r]); track("Classification", r.name, "None", "Active", 0, "New classification applied before ingestion", true); toast.success("Classification rule created"); }}
      />
      <NewAlertDialog
        open={newAlertOpen} onOpenChange={setNewAlertOpen}
        onCreate={(r) => { setAlerts((cur) => [...cur, r]); track("Alert Rule", r.name, "None", "Active", 0, "New notification routing"); toast.success("Alert rule created"); }}
      />
      <SaveChangesDialog
        open={saveOpen} onOpenChange={setSaveOpen} changes={pending}
        onSave={applySave} onDiscard={() => { setPending([]); toast.info("Changes discarded"); }}
      />
      <ExportConfigurationDialog open={exportOpen} onOpenChange={setExportOpen} sources={visibleSources} />

      {/* story mode */}
      {storyStep !== null && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-4 py-2.5 shadow-lg">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
              Step {storyStep + 1} of {STORY.length}
            </span>
            <p className="min-w-0 flex-1 text-[12.5px] text-slate-800">{STORY[storyStep].caption}</p>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-7 text-[11px]" disabled={storyStep === 0} onClick={() => setStoryStep((s) => (s ?? 0) - 1)}>Previous</Button>
              <Button size="sm" className="h-7 text-[11px]" disabled={storyStep === STORY.length - 1} onClick={() => setStoryStep((s) => (s ?? 0) + 1)}>Next</Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="Exit demo story" onClick={() => setStoryStep(null)}><X className="h-3.5 w-3.5" aria-hidden /></Button>
            </div>
            {showNotes && <p className="w-full text-[11px] italic text-slate-500">{STORY[storyStep].notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
