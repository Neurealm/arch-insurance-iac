import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck, Bell, Database, Download, Filter, Gauge, HelpCircle, Layers, RefreshCw,
  Search, ShieldAlert, Sparkles, TriangleAlert, Upload, X,
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
import { Drawer, Pill, Row } from "./pipeline/panels";
import {
  ActivityDetailDrawer, ActivityPanel, AuthorityMatrixPanel, CategoryDistributionPanel,
  ExceptionsPanel, LifecyclePanel, QualityOverviewPanel, RegistryTable, RelationshipSummaryPanel,
  ReviewQueuePanel, SourceRecordDrawer, download, nf, sourcesToCsv,
} from "./registry/panels";
import {
  BulkActionDialog, DuplicateComparisonDialog, ExportRegistryDialog, ImportRegistryDialog,
  MergeSourcesDialog, ReconcileRegistryDialog, RegisterSourceDialog, type ReconciliationResult,
} from "./registry/dialogs";
import {
  activeFilterCount, defaultFilters, demoScenarios, duplicateCandidates, exceptionSummary,
  filterOptions, kpiTrends, notificationSeed, resolveActivities, resolveExceptions, resolveReviews,
  resolveSources, scenarioSnapshots, searchCatalog, sourceQualityDetail,
  type ApprovalState, type AuthorityLevel, type DemoScenario, type Filters, type RegistryActivity,
  type RegistryException, type SourceRegistryRecord, type SourceReview, type ViewMode,
} from "./registry/data";

const VIEW_LABEL: Record<ViewMode, string> = {
  catalog: "Catalog View",
  operations: "Operations View",
  governance: "Governance View",
  relationships: "Relationship View",
};

const STORY = [
  { targets: ["kpi-total", "kpi-approved"], caption: "The registry is the authoritative catalog of every organizational knowledge source the fabric is permitted to reason over.", notes: "147 registered sources, 128 approved for downstream use." },
  { targets: ["panel-registry"], caption: "Every source carries ownership, business context, authority, classification, and operational state.", notes: "Ownership and authority are what make evidence defensible." },
  { targets: ["panel-authority"], caption: "Authority separates authoritative sources from supporting, historical, reference, and unconfirmed evidence.", notes: "Unconfirmed sources cannot outrank a Primary source." },
  { targets: ["panel-exceptions"], caption: "Exceptions surface the sources that must be corrected before they influence decisions.", notes: "Duplicates, missing owners, drift, and stale content are governed as work items." },
  { targets: ["panel-reviews"], caption: "Approval and review keep the registry accountable to named humans on a defined cadence.", notes: "Reviews are assigned, dated, and audited." },
  { targets: ["panel-relationships"], caption: "Registered sources connect to teams, artifacts, conditions, personas, and decisions across the fabric.", notes: "The registry is the entry point to enterprise reasoning." },
];

const PREF_KEY = "ecf.sourceRegistry.prefs";

function loadPrefs(): { view: ViewMode; filters: Filters; density: "compact" | "comfortable" } {
  const fallback = { view: "catalog" as ViewMode, filters: defaultFilters, density: "compact" as const };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (!raw) return fallback;
    const p = JSON.parse(raw) as { view?: ViewMode; filters?: Partial<Filters>; density?: "compact" | "comfortable" };
    return { view: p.view ?? "catalog", filters: { ...defaultFilters, ...(p.filters ?? {}) }, density: p.density ?? "compact" };
  } catch {
    return fallback;
  }
}

const nowLabel = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const FILTER_LABELS: Record<keyof Filters, string> = {
  businessUnit: "Business unit", team: "Team", knowledgeDomain: "Knowledge domain",
  sourceCategory: "Source category", platform: "Platform", sourceOwner: "Source owner",
  technicalOwner: "Technical owner", registryStatus: "Registry status", connectorStatus: "Connector status",
  authorityLevel: "Authority level", approvalState: "Approval state", accessClassification: "Access classification",
  freshness: "Freshness", qualityBand: "Quality band", discoveryMode: "Discovery mode",
  environment: "Environment", region: "Region", dataResidency: "Data residency", dateRange: "Date range",
};

export default function DiscoveryRegistry() {
  const navigate = useNavigate();
  const initial = useRef(loadPrefs());

  const [view, setView] = useState<ViewMode>(initial.current.view);
  const [filters, setFilters] = useState<Filters>(initial.current.filters);
  const [draftFilters, setDraftFilters] = useState<Filters>(initial.current.filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [density, setDensity] = useState<"compact" | "comfortable">(initial.current.density);
  const [savedViews, setSavedViews] = useState<Record<string, Filters>>({});
  const [scenario, setScenario] = useState<DemoScenario>("healthy");
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(nowLabel);
  const [announce, setAnnounce] = useState("");

  const [sourceOverrides, setSourceOverrides] = useState<Record<string, Partial<SourceRegistryRecord>>>({});
  const [extraSources, setExtraSources] = useState<SourceRegistryRecord[]>([]);
  const [exceptionStatuses, setExceptionStatuses] = useState<Record<string, RegistryException["status"]>>({});
  const [reviewOverrides, setReviewOverrides] = useState<Record<string, Partial<SourceReview>>>({});
  const [extraActivities, setExtraActivities] = useState<RegistryActivity[]>([]);
  const [reconciliation, setReconciliation] = useState<ReconciliationResult | null>(null);
  const [reconLabel, setReconLabel] = useState<string | null>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [openSource, setOpenSource] = useState<SourceRegistryRecord | null>(null);
  const [openActivity, setOpenActivity] = useState<RegistryActivity | null>(null);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [reconOpen, setReconOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationSeed);
  const [storyStep, setStoryStep] = useState(-1);

  const snapshot = scenarioSnapshots[scenario];

  useEffect(() => {
    try {
      window.localStorage.setItem(PREF_KEY, JSON.stringify({ view, filters, density }));
    } catch { /* storage unavailable */ }
  }, [view, filters, density]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setStoryStep(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const rows = useMemo(
    () => resolveSources(scenario, filters, sourceOverrides, extraSources),
    [scenario, filters, sourceOverrides, extraSources],
  );
  const exceptions = useMemo(() => resolveExceptions(scenario, exceptionStatuses), [scenario, exceptionStatuses]);
  const reviews = useMemo(() => resolveReviews(scenario, reviewOverrides), [scenario, reviewOverrides]);
  const activities = useMemo(() => resolveActivities(scenario, extraActivities), [scenario, extraActivities]);

  const spotlight = storyStep >= 0 ? STORY[storyStep].targets : [];
  const isSpot = (id: string) => spotlight.includes(id);

  const refresh = useCallback(() => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setUpdatedAt(nowLabel());
      setAnnounce("Registry data refreshed");
    }, 550);
  }, []);

  const logActivity = useCallback((action: string, s: { id: string; sourceName: string }, description: string) => {
    setExtraActivities((cur) => [
      {
        id: `ACT-LIVE-${cur.length + 1}`,
        timestamp: nowLabel(),
        sourceId: s.id,
        sourceName: s.sourceName,
        action,
        description,
        changedBy: "Current operator",
        previousValue: null,
        newValue: null,
        status: "Completed",
        auditId: `AUD-${9000 + cur.length}`,
      } as RegistryActivity,
      ...cur,
    ]);
  }, []);

  const applyFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setDraftFilters((f) => ({ ...f, [key]: value }));
    setAnnounce(`${FILTER_LABELS[key]} filter set to ${value}`);
  }, []);

  /* -------------------------------- actions ------------------------------- */

  const handleRowAction = useCallback((action: string, s: SourceRegistryRecord) => {
    switch (action) {
      case "Open Record":
        setOpenSource(s);
        return;
      case "Approve":
        setSourceOverrides((o) => ({ ...o, [s.id]: { ...o[s.id], approvalState: "Approved" as ApprovalState, registryStatus: "Active" } }));
        logActivity("Source approved", s, "Approval state changed to Approved.");
        toast.success(`${s.sourceName} approved`);
        return;
      case "Request Review":
        setSourceOverrides((o) => ({ ...o, [s.id]: { ...o[s.id], approvalState: "Review Required" as ApprovalState } }));
        logActivity("Review requested", s, "A review task was created for this source.");
        toast.success(`Review requested for ${s.sourceName}`);
        return;
      case "Restrict":
        setSourceOverrides((o) => ({ ...o, [s.id]: { ...o[s.id], accessClassification: "Restricted" } }));
        logActivity("Classification changed", s, "Access classification changed to Restricted.");
        toast.success(`${s.sourceName} restricted`);
        return;
      case "Pause Discovery":
        setSourceOverrides((o) => ({ ...o, [s.id]: { ...o[s.id], registryStatus: "Paused" } }));
        logActivity("Discovery paused", s, "Scheduled discovery paused by operator.");
        toast.success(`Discovery paused for ${s.sourceName}`);
        return;
      case "Resume Discovery":
        setSourceOverrides((o) => ({ ...o, [s.id]: { ...o[s.id], registryStatus: "Active" } }));
        logActivity("Discovery resumed", s, "Scheduled discovery resumed by operator.");
        toast.success(`Discovery resumed for ${s.sourceName}`);
        return;
      case "Run Discovery":
        logActivity("Discovery run started", s, "Manual discovery run queued.");
        toast.success(`Discovery run queued for ${s.sourceName}`);
        return;
      case "Reconcile":
        setReconOpen(true);
        return;
      case "Compare Duplicate":
      case "Mark Duplicate":
        setDuplicateOpen(true);
        return;
      case "Deprecate":
        setSourceOverrides((o) => ({ ...o, [s.id]: { ...o[s.id], registryStatus: "Deprecated", lifecycleStage: "Deprecated" } }));
        logActivity("Source deprecated", s, "Source deprecated; historical references retained.");
        toast.success(`${s.sourceName} deprecated`);
        return;
      case "Reactivate":
        setSourceOverrides((o) => ({ ...o, [s.id]: { ...o[s.id], registryStatus: "Active", lifecycleStage: "Active" } }));
        logActivity("Source reactivated", s, "Source restored to active lifecycle.");
        toast.success(`${s.sourceName} reactivated`);
        return;
      case "View Connector":
        navigate("/enterprise-cognitive-fabric/discovery/configuration");
        return;
      case "Export Record":
        download(`${s.id}.json`, JSON.stringify(s, null, 2), "application/json");
        toast.success(`${s.id} exported`);
        return;
      default:
        toast.success(`${action} applied to ${s.sourceName}`);
    }
  }, [logActivity, navigate]);

  const handleBulkAction = useCallback((action: string, ids: string[]) => {
    setSelected(ids);
    if (action === "Export") { setExportOpen(true); return; }
    if (action === "Reconcile") { setReconOpen(true); return; }
    setBulkAction(action);
  }, []);

  const confirmBulk = useCallback((action: string, value: string) => {
    setSourceOverrides((cur) => {
      const next = { ...cur };
      selected.forEach((id) => {
        const patch: Partial<SourceRegistryRecord> = {};
        if (action === "Approve") { patch.approvalState = "Approved"; patch.registryStatus = "Active"; }
        if (action === "Assign Owner") patch.businessOwner = value;
        if (action === "Assign Technical Owner") patch.technicalOwner = value;
        if (action === "Apply Classification") patch.accessClassification = value as SourceRegistryRecord["accessClassification"];
        if (action === "Apply Retention Policy") patch.retentionPolicy = value;
        if (action === "Change Review Date") patch.nextReviewDate = value;
        if (action === "Pause Discovery") patch.registryStatus = "Paused";
        if (action === "Resume Discovery") patch.registryStatus = "Active";
        if (action === "Mark for Review") patch.approvalState = "Review Required";
        if (action === "Deprecate") { patch.registryStatus = "Deprecated"; patch.lifecycleStage = "Deprecated"; }
        next[id] = { ...next[id], ...patch };
      });
      return next;
    });
    toast.success(`${action} applied to ${selected.length} source${selected.length === 1 ? "" : "s"}`);
    setAnnounce(`${action} applied to ${selected.length} sources`);
    setSelected([]);
  }, [selected]);

  const handleExceptionAction = useCallback((action: string, e: RegistryException) => {
    if (action === "Open Source") {
      const s = rows.find((r) => r.id === e.sourceId);
      if (s) setOpenSource(s);
      return;
    }
    const status = action === "Resolve" ? "Resolved" : action === "Acknowledge" ? "Acknowledged" : action === "Snooze" ? "Snoozed" : "Assigned";
    setExceptionStatuses((cur) => ({ ...cur, [e.id]: status as RegistryException["status"] }));
    toast.success(`${e.exceptionType} marked ${status.toLowerCase()}`);
  }, [rows]);

  const handleReviewAction = useCallback((action: string, r: SourceReview) => {
    if (action === "Open Review") {
      const s = rows.find((x) => x.id === r.sourceId);
      if (s) setOpenSource(s);
      return;
    }
    const status = action === "Approve" ? "Approved" : action === "Reject" ? "Rejected" : "In Review";
    setReviewOverrides((cur) => ({ ...cur, [r.id]: { ...cur[r.id], status: status as SourceReview["status"] } }));
    toast.success(`${r.sourceName}: ${action}`);
  }, [rows]);

  const unread = notifications.filter((n) => !n.read).length;
  const scenarioBanner = snapshot.banner;

  const kpis = [
    { id: "kpi-total", label: "Registered Sources", value: nf(snapshot.totalSources), change: "+4 this month", icon: Database, trend: kpiTrends.total, color: "#2563eb", tooltip: "Total sources under registry governance.", onClick: () => applyFilter("registryStatus", "All") },
    { id: "kpi-approved", label: "Approved Sources", value: nf(snapshot.approvedSources), change: "87% of registry", icon: BadgeCheck, trend: kpiTrends.approved, color: "#059669", tooltip: "Sources approved for downstream reasoning.", onClick: () => applyFilter("approvalState", "Approved") },
    { id: "kpi-pending", label: "Pending Review", value: String(snapshot.pendingReview), change: "2 due this week", icon: Layers, trend: kpiTrends.pending, color: "#d97706", tooltip: "Sources awaiting an approval decision.", onClick: () => applyFilter("approvalState", "Pending Review") },
    { id: "kpi-restricted", label: "Restricted Sources", value: String(snapshot.restrictedSources), change: "Access controlled", icon: ShieldAlert, trend: kpiTrends.restricted, color: "#7c3aed", tooltip: "Sources with restricted or highly restricted classification.", onClick: () => applyFilter("accessClassification", "Restricted") },
    { id: "kpi-quality", label: "Registry Quality", value: `${snapshot.qualityScore}`, change: "+3 vs last month", icon: Gauge, trend: kpiTrends.quality, color: "#0891b2", tooltip: "Composite registry trust score.", onClick: () => setQualityOpen(true) },
    { id: "kpi-action", label: "Action Required", value: String(snapshot.actionRequired), change: "9 open exceptions", icon: TriangleAlert, trend: kpiTrends.action, color: "#dc2626", tooltip: "Sources blocked or needing correction.", onClick: () => applyFilter("registryStatus", "Action Required") },
  ];

  const filterControls = (
    <>
      <Button variant="outline" size="sm" className="h-7 gap-1 text-[11.5px]" onClick={() => { setDraftFilters(filters); setFiltersOpen(true); }}>
        <Filter className="h-3.5 w-3.5" aria-hidden />
        Filters{activeFilterCount(filters) > 0 ? ` (${activeFilterCount(filters)})` : ""}
      </Button>
      {activeFilterCount(filters) > 0 && (
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11.5px]" onClick={() => { setFilters(defaultFilters); setDraftFilters(defaultFilters); }}>
          <X className="h-3.5 w-3.5" aria-hidden />
          Clear
        </Button>
      )}
    </>
  );

  const searchGroups = useMemo(() => {
    const groups = new Map<string, typeof searchCatalog>();
    searchCatalog.forEach((c) => {
      groups.set(c.type, [...(groups.get(c.type) ?? []), c]);
    });
    return Array.from(groups.entries());
  }, []);

  return (
    <div className="space-y-3 pb-8">
      <p aria-live="polite" className="sr-only">{announce}</p>

      {/* header */}
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-[19px] font-semibold leading-tight text-slate-900">Enterprise Source Registry</h1>
          <p className="mt-0.5 text-[12px] text-slate-600">
            Authoritative catalog of every approved, pending, restricted, inactive, and deprecated organizational knowledge source.
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Registry state {snapshot.registryState} · {nf(snapshot.totalSources)} sources · updated {updatedAt}
            {reconLabel ? ` · reconciliation: ${reconLabel}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Select value={view} onValueChange={(v) => setView(v as ViewMode)}>
            <SelectTrigger className="h-8 w-[168px] text-[12px]" aria-label="Viewing mode"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(VIEW_LABEL) as ViewMode[]).map((v) => (
                <SelectItem key={v} value={v} className="text-[12px]">{VIEW_LABEL[v]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-[12px]" onClick={() => setSearchOpen(true)}>
            <Search className="h-3.5 w-3.5" aria-hidden />Search
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-[12px]" onClick={refresh}>
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} aria-hidden />Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-[12px]" onClick={() => setReconOpen(true)}>
            <Layers className="h-3.5 w-3.5" aria-hidden />Reconcile Registry
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-[12px]" onClick={() => setImportOpen(true)}>
            <Upload className="h-3.5 w-3.5" aria-hidden />Import
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-[12px]" onClick={() => setExportOpen(true)}>
            <Download className="h-3.5 w-3.5" aria-hidden />Export
          </Button>
          <Button size="sm" className="h-8 gap-1 text-[12px]" onClick={() => setRegisterOpen(true)}>
            <Database className="h-3.5 w-3.5" aria-hidden />Register Source
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-[12px]" aria-label={`Notifications, ${unread} unread`}>
                <Bell className="h-3.5 w-3.5" aria-hidden />{unread}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 text-[12px]">
              <DropdownMenuLabel className="text-[12px]">Registry notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5" onSelect={() => setNotifications((cur) => cur.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}>
                  <span className="text-[11px] text-slate-500">{n.type} · {n.time}</span>
                  <span className={cn("text-[12px]", n.read ? "text-slate-600" : "font-medium text-slate-900")}>{n.title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Registry help" onClick={() => setHelpOpen(true)}>
            <HelpCircle className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      </header>

      {/* demo story */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
        <Sparkles className="h-3.5 w-3.5 text-blue-600" aria-hidden />
        <span className="text-[11.5px] font-medium text-slate-700">Demo scenario</span>
        <Select value={scenario} onValueChange={(v) => { setScenario(v as DemoScenario); setAnnounce(`Scenario ${v} applied`); }}>
          <SelectTrigger className="h-7 w-[248px] text-[11.5px]" aria-label="Demo scenario"><SelectValue /></SelectTrigger>
          <SelectContent>
            {demoScenarios.map((d) => <SelectItem key={d.id} value={d.id} className="text-[12px]">{d.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-7 text-[11.5px]" onClick={() => setScenario("reset")}>Reset Demo</Button>
        <span className="mx-1 h-4 w-px bg-slate-200" aria-hidden />
        {storyStep < 0 ? (
          <Button variant="outline" size="sm" className="h-7 text-[11.5px]" onClick={() => setStoryStep(0)}>Start Guided Story</Button>
        ) : (
          <>
            <span className="text-[11.5px] text-slate-700">Step {storyStep + 1} of {STORY.length}</span>
            <Button variant="outline" size="sm" className="h-7 text-[11.5px]" disabled={storyStep === 0} onClick={() => setStoryStep((s) => s - 1)}>Back</Button>
            <Button
              size="sm" className="h-7 text-[11.5px]"
              onClick={() => setStoryStep((s) => (s + 1 >= STORY.length ? -1 : s + 1))}
            >
              {storyStep + 1 === STORY.length ? "Finish" : "Next"}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-[11.5px]" onClick={() => setStoryStep(-1)}>Exit</Button>
          </>
        )}
      </div>

      {storyStep >= 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2" aria-live="polite">
          <p className="text-[12.5px] font-medium text-blue-900">{STORY[storyStep].caption}</p>
          <p className="mt-0.5 text-[11.5px] text-blue-800">{STORY[storyStep].notes}</p>
        </div>
      )}

      {scenarioBanner && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-[12px] text-amber-900">{scenarioBanner}</p>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => document.getElementById(snapshot.focusPanel ?? "panel-registry")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
              Go to details
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setScenario("reset")}>Dismiss</Button>
          </div>
        </div>
      )}

      {/* KPIs */}
      <section aria-label="Registry key metrics" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.id} id={k.id}>
            <KpiCard
              label={k.label} value={k.value} change={k.change} icon={k.icon} trend={k.trend}
              color={k.color} tooltip={k.tooltip} onClick={k.onClick} loading={loading} spotlight={isSpot(k.id)}
            />
          </div>
        ))}
      </section>

      {/* registry table */}
      <RegistryTable
        view={view} rows={rows} loading={loading} error={null} spotlight={isSpot("panel-registry")}
        highlightIds={snapshot.highlightSourceIds} selected={selected} onSelected={setSelected}
        onOpen={setOpenSource} onRowAction={handleRowAction} onBulkAction={handleBulkAction}
        onExport={() => setExportOpen(true)} density={density} onDensity={setDensity}
        savedViews={Object.keys(savedViews)}
        onSaveView={() => {
          const name = `Saved view ${Object.keys(savedViews).length + 1}`;
          setSavedViews((v) => ({ ...v, [name]: filters }));
          toast.success(`${name} saved`);
        }}
        onLoadView={(name) => { const f = savedViews[name]; if (f) { setFilters(f); setDraftFilters(f); } }}
        filterControls={filterControls}
        emptyAction={() => { setFilters(defaultFilters); setDraftFilters(defaultFilters); }}
      />

      {/* analysis grid */}
      <div className="grid gap-2 lg:grid-cols-2">
        <QualityOverviewPanel
          score={snapshot.qualityScore} loading={loading} spotlight={isSpot("panel-quality")}
          onDimension={applyFilter} onFooter={() => setQualityOpen(true)}
        />
        <CategoryDistributionPanel activeCategory={filters.sourceCategory} onSelect={(c) => applyFilter("sourceCategory", c)} loading={loading} />
      </div>

      <AuthorityMatrixPanel
        loading={loading} spotlight={isSpot("panel-authority")}
        onCell={(authority: AuthorityLevel, approval: ApprovalState) => {
          setFilters((f) => ({ ...f, authorityLevel: authority, approvalState: approval }));
          setDraftFilters((f) => ({ ...f, authorityLevel: authority, approvalState: approval }));
          setAnnounce(`Filtered to ${authority} sources with ${approval} approval`);
        }}
      />

      <div className="grid gap-2 lg:grid-cols-2">
        <ExceptionsPanel
          exceptions={exceptions} summary={exceptionSummary} onAction={handleExceptionAction}
          loading={loading} spotlight={isSpot("panel-exceptions")}
          degraded={scenario === "connector-degradation" ? "Connector telemetry is degraded. Exception counts may lag." : null}
        />
        <ReviewQueuePanel reviews={reviews} onAction={handleReviewAction} loading={loading} spotlight={isSpot("panel-reviews")} />
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <RelationshipSummaryPanel
          loading={loading} spotlight={isSpot("panel-relationships")}
          onNode={(id, route) => { if (route) navigate(route); else applyFilter("registryStatus", "All"); }}
        />
        <LifecyclePanel loading={loading} onStage={(stage) => applyFilter("registryStatus", stage === "Active" ? "Active" : "All")} />
      </div>

      <ActivityPanel activities={activities} onOpen={setOpenActivity} loading={loading} />

      {duplicateCandidates.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <p className="text-[12px] text-slate-700">
            {duplicateCandidates.length} duplicate candidate under review — {duplicateCandidates[0].recommendation}.
          </p>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setDuplicateOpen(true)}>Compare Sources</Button>
        </div>
      )}

      {reconciliation && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-900">
          Last reconciliation evaluated {nf(reconciliation.sourcesEvaluated)} sources, identified {reconciliation.duplicatesIdentified} duplicates,
          repaired {reconciliation.relationshipsRepaired} relationships, and created {reconciliation.reviewTasksCreated} review tasks.
        </div>
      )}

      {/* filters sheet */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader><SheetTitle className="text-[15px]">Registry Filters</SheetTitle></SheetHeader>
          <div className="mt-3 grid gap-2">
            {(Object.keys(FILTER_LABELS) as (keyof Filters)[]).map((key) => (
              <div key={key} className="grid gap-1">
                <label htmlFor={`f-${key}`} className="text-[11px] text-slate-600">{FILTER_LABELS[key]}</label>
                <Select value={draftFilters[key]} onValueChange={(v) => setDraftFilters((f) => ({ ...f, [key]: v }))}>
                  <SelectTrigger id={`f-${key}`} className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {filterOptions[key].map((o) => <SelectItem key={o} value={o} className="text-[12px]">{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-1.5">
            <Button size="sm" className="h-8 text-[12px]" onClick={() => { setFilters(draftFilters); setFiltersOpen(false); }}>Apply Filters</Button>
            <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => setDraftFilters(defaultFilters)}>Reset</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* quality drawer */}
      <Drawer open={qualityOpen} onOpenChange={setQualityOpen} title="Registry Quality Details" description="Quality dimensions across the registered source population">
        <dl>
          <Row label="Composite score" value={`${snapshot.qualityScore} of 100`} />
          <Row label="Ownership confidence" value="91%" />
          <Row label="Metadata completeness" value="88%" />
          <Row label="Authority confidence" value="86%" />
          <Row label="Freshness compliance" value="93%" />
          <Row label="Relationship coverage" value="84%" />
        </dl>
        <h3 className="mt-2 text-[12px] font-semibold text-slate-900">Lowest scoring sources</h3>
        <ul className="mt-1 space-y-1">
          {Object.entries(sourceQualityDetail)
            .sort((a, b) => a[1].composite - b[1].composite)
            .slice(0, 5)
            .map(([id, q]) => (
              <li key={id} className="flex items-center justify-between text-[11.5px]">
                <span className="text-slate-700">{id}</span>
                <Pill label={`${q.composite}`} tone={q.composite >= 90 ? "green" : q.composite >= 75 ? "amber" : "red"} />
              </li>
            ))}
        </ul>
      </Drawer>

      {/* help */}
      <Drawer open={helpOpen} onOpenChange={setHelpOpen} title="How the Source Registry works" description="Registry roles, states, and governance model">
        <ul className="list-disc space-y-1 pl-4 text-[12px] text-slate-700">
          <li>Sources move through Discovered, Registered, Approved, Active, Restricted, Inactive, and Deprecated lifecycle stages.</li>
          <li>Authority determines precedence when sources disagree. Primary outranks Supporting, Historical, Reference, and Unconfirmed.</li>
          <li>Only approved sources contribute evidence to conditions, personas, and decisions.</li>
          <li>Exceptions and reviews are named work items with owners, due dates, and audit history.</li>
          <li>Reconciliation compares the registry against the current enterprise state and raises exceptions for drift.</li>
        </ul>
      </Drawer>

      <SourceRecordDrawer source={openSource} onOpenChange={() => setOpenSource(null)} onAction={handleRowAction} />
      <ActivityDetailDrawer activity={openActivity} onOpenChange={() => setOpenActivity(null)} />

      {/* command search */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search sources, platforms, owners, teams, domains, conditions, personas…" />
        <CommandList>
          <CommandEmpty>No registry entities match this search.</CommandEmpty>
          {searchGroups.map(([type, items]) => (
            <CommandGroup key={type} heading={type}>
              {items.slice(0, 8).map((i) => (
                <CommandItem
                  key={i.id}
                  value={`${i.title} ${i.platform} ${i.owner}`}
                  onSelect={() => {
                    const s = rows.find((r) => r.id === i.id);
                    if (s) setOpenSource(s);
                    setSearchOpen(false);
                  }}
                >
                  <span className="flex-1 truncate">{i.title}</span>
                  <span className="ml-2 text-[11px] text-slate-500">{i.owner}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>

      {/* dialogs */}
      <RegisterSourceDialog
        open={registerOpen} onOpenChange={setRegisterOpen} nextIndex={extraSources.length}
        onRegistered={(record, followUp) => {
          setExtraSources((cur) => (cur.some((c) => c.id === record.id) ? cur : [...cur, record]));
          logActivity("Source registered", record, `${record.sourceName} registered through the registration workflow.`);
          if (followUp === "View Source Record") setOpenSource(record);
          if (followUp === "Run Initial Discovery") toast.success(`Initial discovery queued for ${record.sourceName}`);
          if (followUp === "Submit for Approval") toast.success(`${record.sourceName} submitted for approval`);
        }}
      />

      <DuplicateComparisonDialog
        open={duplicateOpen} onOpenChange={setDuplicateOpen}
        onResolve={(action) => toast.success(`Duplicate review: ${action}`)}
        onMerge={() => setMergeOpen(true)}
      />

      <MergeSourcesDialog
        open={mergeOpen} onOpenChange={setMergeOpen}
        onComplete={(surviving, reason) => {
          const removed = surviving === "SRC-1011" ? "SRC-1010" : "SRC-1011";
          setSourceOverrides((o) => ({ ...o, [removed]: { ...o[removed], registryStatus: "Deprecated", lifecycleStage: "Deprecated", replacementSourceId: surviving } }));
          logActivity("Registry records merged", { id: surviving, sourceName: "Retry Policy Repository v1" }, `Merged ${removed} into ${surviving}. Reason: ${reason}`);
          toast.success(`Records merged into ${surviving}`);
        }}
      />

      <ReconcileRegistryDialog
        open={reconOpen} onOpenChange={setReconOpen} selectedCount={selected.length}
        onProgress={setReconLabel}
        onComplete={(r) => { setReconciliation(r); setReconLabel(null); setUpdatedAt(nowLabel()); }}
        onOpenExceptions={() => document.getElementById("panel-exceptions")?.scrollIntoView({ behavior: "smooth", block: "center" })}
      />

      <ExportRegistryDialog
        open={exportOpen} onOpenChange={setExportOpen} rows={rows} selectedIds={selected}
        payload={{ scenario, filters, view }}
      />

      <ImportRegistryDialog
        open={importOpen} onOpenChange={setImportOpen}
        onImport={(mode, count) => toast.success(`${count} records imported as ${mode}`)}
      />

      <BulkActionDialog
        action={bulkAction} count={selected.length}
        personaImpact={Math.max(1, Math.round(selected.length * 1.6))}
        onOpenChange={() => setBulkAction(null)}
        onConfirm={confirmBulk}
      />

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="h-7 text-[11.5px]" onClick={() => download("source-registry.csv", sourcesToCsv(rows), "text/csv")}>
          Quick CSV export of current view
        </Button>
      </div>
    </div>
  );
}
