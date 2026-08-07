import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight, Copy, Database, Filter, Gauge, Layers, MoreHorizontal, Play, Plus,
  RefreshCw, ShieldCheck, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { KpiCard, Panel, StatusBadge } from "./command-center/panels";
import {
  CadencePanel, ChangeDetectionPanel, ContentTypePolicyPanel, DiscoveryRulesPanel,
  DuplicatePolicyPanel, EnterpriseScopePanel, EvidencePanel, FreshnessPanel, LifecyclePanel,
  PermissionPolicyPanel, PreviewBreakdownPanel, PreviewPanel, ProcessingHandoffPanel,
  Prompt2Placeholder, QualityPanel, SamplingPanel, SourcePlatformPanel, TraversalPanel,
  WorkbenchHandoffRegion, WorkbenchPolicyRegion, WorkbenchScopeRegion, WorkbenchSourceRegion,
  AuthorityPanel,
} from "./discovery-config/panels";
import {
  ConfigurationDetailDrawer, DryRunDialog, NewConfigurationDialog, RuleBuilderDialog,
  RuleTestDialog, SourceScopeDetailDrawer,
} from "./discovery-config/dialogs";
import {
  activeFilterCount, buildDraft, computePreview, defaultFilters, dryRunSteps, filterOptions, fmt,
  kpiTrends, runDryRun, savedViews, seedConfigurations, seedScopeEntries, seedStages,
  VIEW_LABEL,
  type AuthorityBand, type ContentTypePolicyRow, type DiscoveryConfiguration,
  type DiscoveryPreviewWarning, type DiscoveryRule, type DraftState, type DryRunResult,
  type Filters, type ScopeState, type ViewMode,
} from "./discovery-config/data";

const PREF_KEY = "ecf.discoveryConfiguration.v2.prefs";

interface Prefs {
  view: ViewMode;
  filters: Filters;
  savedView: string;
  density: "comfortable" | "compact";
  columns: Record<string, boolean>;
  selectedConfiguration: string;
  selectedStage: string;
}

const ALL_COLUMNS = [
  "Configuration ID", "Configuration Name", "Scope", "Business Units", "Knowledge Domains",
  "Sources", "Rules", "Discovery Mode", "Cadence", "Projected Volume", "Owner", "Version",
  "Last Updated", "Status",
];

const defaultPrefs: Prefs = {
  view: "configuration",
  filters: defaultFilters,
  savedView: "Enterprise default",
  density: "comfortable",
  columns: Object.fromEntries(ALL_COLUMNS.map((c) => [c, true])),
  selectedConfiguration: "DISC-CFG-001",
  selectedStage: "STG-11",
};

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return defaultPrefs;
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (!raw) return defaultPrefs;
    const p = JSON.parse(raw) as Partial<Prefs>;
    return {
      ...defaultPrefs, ...p,
      filters: { ...defaultFilters, ...(p.filters ?? {}) },
      columns: { ...defaultPrefs.columns, ...(p.columns ?? {}) },
    };
  } catch {
    return defaultPrefs;
  }
}

export default function DiscoveryConfiguration() {
  const initial = useRef(loadPrefs());
  const [view, setView] = useState<ViewMode>(initial.current.view);
  const [filters, setFilters] = useState<Filters>(initial.current.filters);
  const [draftFilters, setDraftFilters] = useState<Filters>(initial.current.filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [savedView, setSavedView] = useState(initial.current.savedView);
  const [density, setDensity] = useState<Prefs["density"]>(initial.current.density);
  const [columns, setColumns] = useState<Record<string, boolean>>(initial.current.columns);
  const [selectedConfigId, setSelectedConfigId] = useState(initial.current.selectedConfiguration);
  const [selectedStage, setSelectedStage] = useState(initial.current.selectedStage);

  const [configurations, setConfigurations] = useState<DiscoveryConfiguration[]>(seedConfigurations);
  const [draft, setDraft] = useState<DraftState>(() => buildDraft());
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "Configuration ID", dir: "asc" });
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [refreshedAt, setRefreshedAt] = useState(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailConfig, setDetailConfig] = useState<DiscoveryConfiguration | null>(null);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DiscoveryRule | null>(null);
  const [testRule, setTestRule] = useState<DiscoveryRule | null>(null);
  const [testOpen, setTestOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [newMode, setNewMode] = useState<"new" | "clone">("new");
  const [platformDetail, setPlatformDetail] = useState<string | null>(null);
  const [platformDetailOpen, setPlatformDetailOpen] = useState(false);
  const [dryRunOpen, setDryRunOpen] = useState(false);
  const [dryRunning, setDryRunning] = useState(false);
  const [dryRunStep, setDryRunStep] = useState(0);
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [spotlight, setSpotlight] = useState<string | null>(null);

  const preview = useMemo(() => computePreview(draft), [draft]);

  useEffect(() => {
    const prefs: Prefs = { view, filters, savedView, density, columns, selectedConfiguration: selectedConfigId, selectedStage };
    try { window.localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { /* preferences are best effort */ }
  }, [view, filters, savedView, density, columns, selectedConfigId, selectedStage]);

  const focusPanel = useCallback((id: string) => {
    setSpotlight(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => setSpotlight((s) => (s === id ? null : s)), 2600);
  }, []);

  /* ------------------------------------------------------------- mutators */

  const setScopeState = (id: string, state: ScopeState) => {
    setDraft((d) => ({ ...d, scope: { ...d.scope, [id]: state } }));
    const entry = seedScopeEntries.find((e) => e.id === id);
    toast.success(`${entry?.scopeName ?? "Scope"} set to ${state}`, { description: "Preview and downstream estimates recalculated" });
  };
  const setScopePriority = (id: string, p: "Standard" | "High" | "Critical") =>
    setDraft((d) => ({ ...d, scopePriority: { ...d.scopePriority, [id]: p } }));
  const resetScope = (id: string) => {
    const entry = seedScopeEntries.find((e) => e.id === id);
    if (!entry) return;
    setDraft((d) => ({ ...d, scope: { ...d.scope, [id]: entry.state }, scopePriority: { ...d.scopePriority, [id]: entry.priority } }));
    toast.success(`${entry.scopeName} reset to inherited state`);
  };

  const togglePlatform = (id: string) =>
    setDraft((d) => ({ ...d, platforms: { ...d.platforms, [id]: { ...d.platforms[id], enabled: !d.platforms[id].enabled } } }));
  const restrictPlatform = (id: string) =>
    setDraft((d) => ({ ...d, platforms: { ...d.platforms, [id]: { ...d.platforms[id], restricted: !d.platforms[id].restricted } } }));
  const setPlatformDepth = (id: string, depth: 1 | 2 | 3 | 99) =>
    setDraft((d) => ({ ...d, platforms: { ...d.platforms, [id]: { ...d.platforms[id], depth } } }));
  const setPlatformPermission = (id: string, permissionMode: "Preserve Source ACL" | "Metadata Only" | "Governed Access") =>
    setDraft((d) => ({ ...d, platforms: { ...d.platforms, [id]: { ...d.platforms[id], permissionMode } } }));
  const setPlatformCadence = (id: string, cadenceOverride: string) =>
    setDraft((d) => ({ ...d, platforms: { ...d.platforms, [id]: { ...d.platforms[id], cadenceOverride } } }));
  const setPlatformAuthority = (id: string, authority: AuthorityBand) =>
    setDraft((d) => ({ ...d, platforms: { ...d.platforms, [id]: { ...d.platforms[id], authority } } }));

  const setContentType = (ct: string, patch: Partial<ContentTypePolicyRow>) =>
    setDraft((d) => ({ ...d, contentTypes: { ...d.contentTypes, [ct]: { ...d.contentTypes[ct], ...patch } } }));

  const togglePermission = (key: keyof DraftState["permission"]) =>
    setDraft((d) => ({ ...d, permission: { ...d.permission, [key]: !d.permission[key] } }));

  const setAuthorityMapping = (sourceType: string, authority: AuthorityBand) =>
    setDraft((d) => ({
      ...d,
      authority: { ...d.authority, sourceTypeMappings: d.authority.sourceTypeMappings.map((m) => (m.sourceType === sourceType ? { ...m, authority } : m)) },
    }));

  const setFreshness = (id: string, patch: Partial<DraftState["freshness"][number]>) =>
    setDraft((d) => ({ ...d, freshness: d.freshness.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));

  const setCadenceMode = (mode: DraftState["cadence"]["mode"]) =>
    setDraft((d) => ({ ...d, cadence: { ...d.cadence, mode } }));
  const setCadenceSchedule = (incrementalSchedule: string) =>
    setDraft((d) => ({ ...d, cadence: { ...d.cadence, incrementalSchedule } }));
  const setFullSchedule = (fullSchedule: string) =>
    setDraft((d) => ({ ...d, cadence: { ...d.cadence, fullSchedule } }));

  const toggleChangeDetection = (id: string, key: "metadataRefresh" | "fullReingestion" | "permissionRevalidation" | "downstreamReassessment") =>
    setDraft((d) => ({ ...d, changeDetection: d.changeDetection.map((c) => (c.id === id ? { ...c, [key]: !c[key] } : c)) }));
  const setChangeDiscovery = (id: string, triggerDiscovery: string) =>
    setDraft((d) => ({ ...d, changeDetection: d.changeDetection.map((c) => (c.id === id ? { ...c, triggerDiscovery } : c)) }));

  const toggleIdentityStrategy = (name: string) =>
    setDraft((d) => ({
      ...d,
      duplicate: { ...d.duplicate, identityStrategies: d.duplicate.identityStrategies.map((s) => (s.name === name ? { ...s, enabled: !s.enabled } : s)) },
    }));
  const setDuplicateThreshold = (key: "autoLinkThreshold" | "humanReviewThreshold", v: number) =>
    setDraft((d) => ({ ...d, duplicate: { ...d.duplicate, [key]: v } }));

  const setTraversalDepth = (maxDepth: 1 | 2 | 3 | 99) => {
    setDraft((d) => ({ ...d, traversal: { ...d.traversal, maxDepth } }));
    toast.success(`Traversal depth set to ${maxDepth === 99 ? "unlimited within approved scope" : `depth ${maxDepth}`}`, {
      description: "Projected artifact volume recalculated",
    });
  };
  const toggleFollow = (key: keyof DraftState["traversal"]) =>
    setDraft((d) => ({ ...d, traversal: { ...d.traversal, [key]: !d.traversal[key] } }));

  const setSampling = (id: string, patch: Partial<DraftState["sampling"][number]>) =>
    setDraft((d) => ({ ...d, sampling: d.sampling.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));

  const toggleHandoff = (id: string) =>
    setDraft((d) => ({ ...d, handoffs: d.handoffs.map((h) => (h.id === id ? { ...h, enabled: !h.enabled } : h)) }));
  const setHandoffQuality = (id: string, qualityThreshold: number) =>
    setDraft((d) => ({ ...d, handoffs: d.handoffs.map((h) => (h.id === id ? { ...h, qualityThreshold } : h)) }));
  const toggleHandoffReview = (id: string) =>
    setDraft((d) => ({ ...d, handoffs: d.handoffs.map((h) => (h.id === id ? { ...h, humanReviewRequired: !h.humanReviewRequired } : h)) }));

  const toggleEvidence = (key: keyof DraftState["evidence"]) =>
    setDraft((d) => ({ ...d, evidence: { ...d.evidence, [key]: !d.evidence[key] } }));

  const saveRule = (r: DiscoveryRule) =>
    setDraft((d) => ({
      ...d,
      rules: d.rules.some((x) => x.id === r.id) ? d.rules.map((x) => (x.id === r.id ? r : x)) : [...d.rules, r],
    }));
  const toggleRule = (id: string) =>
    setDraft((d) => ({ ...d, rules: d.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) }));
  const duplicateRule = (r: DiscoveryRule) => {
    const copy = { ...r, id: `RULE-${Math.floor(2000 + Math.random() * 7000)}`, name: `${r.name} (copy)` };
    setDraft((d) => ({ ...d, rules: [...d.rules, copy] }));
    toast.success(`Rule duplicated as ${copy.id}`);
  };

  /* ---------------------------------------------------------- dry run */

  const startDryRun = () => {
    setDryRunOpen(true);
    setDryRunning(true);
    setDryRunStep(0);
    setDryRunResult(null);
    let i = 0;
    const tick = window.setInterval(() => {
      i += 1;
      setDryRunStep(i);
      if (i >= dryRunSteps.length) {
        window.clearInterval(tick);
        setDryRunning(false);
        setDryRunResult(runDryRun(draft, preview));
      }
    }, 180);
  };

  /* ---------------------------------------------------------- inventory */

  const filtered = useMemo(() => {
    let rows = configurations.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) || c.id.toLowerCase().includes(query.toLowerCase()));
    if (filters.status !== "All") rows = rows.filter((c) => c.status === filters.status);
    if (filters.businessUnit !== "All") rows = rows.filter((c) => c.businessUnitIds.includes(filters.businessUnit));
    if (filters.team !== "All") rows = rows.filter((c) => c.teamIds.includes(filters.team));
    if (filters.knowledgeDomain !== "All") rows = rows.filter((c) => c.knowledgeDomainIds.includes(filters.knowledgeDomain));
    if (filters.region !== "All") rows = rows.filter((c) => c.region === filters.region);
    if (filters.environment !== "All") rows = rows.filter((c) => c.environment === filters.environment);
    if (filters.accessClassification !== "All") rows = rows.filter((c) => c.accessClassification === filters.accessClassification);
    if (filters.cadence !== "All") rows = rows.filter((c) => c.cadence === filters.cadence);
    if (filters.discoveryMode !== "All") rows = rows.filter((c) => c.discoveryMode === filters.discoveryMode);
    if (filters.owner !== "All") rows = rows.filter((c) => c.owner === filters.owner);
    if (filters.version !== "All") rows = rows.filter((c) => c.version === filters.version);

    const dir = sort.dir === "asc" ? 1 : -1;
    const val = (c: DiscoveryConfiguration) => {
      switch (sort.key) {
        case "Configuration Name": return c.name;
        case "Sources": return c.sourceCount;
        case "Rules": return c.ruleCount;
        case "Projected Volume": return c.projectedVolume;
        case "Owner": return c.owner;
        case "Version": return c.version;
        case "Last Updated": return c.updatedAt;
        case "Status": return c.status;
        default: return c.id;
      }
    };
    return [...rows].sort((a, b) => (val(a) > val(b) ? dir : val(a) < val(b) ? -dir : 0));
  }, [configurations, query, filters, sort]);

  const pageSize = 4;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [query, filters]);

  const openDetail = (c: DiscoveryConfiguration) => { setDetailConfig(c); setDetailOpen(true); setSelectedConfigId(c.id); };

  const serviceState = preview.blockingIssues.length ? "Validation Required" : "Draft Changes";

  const showConfiguration = view === "configuration";
  const showPreviewView = view === "preview";
  const showPolicy = view === "policy";
  const showProcessing = view === "processing";

  /* -------------------------------------------------------------- render */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1800px] px-4 py-4 xl:px-6">
        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
            <li><Link to="/app" className="hover:text-slate-800">Home</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li><Link to="/enterprise-cognitive-fabric" className="hover:text-slate-800">Enterprise Cognitive Fabric</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li><Link to="/enterprise-cognitive-fabric/enterprise-source-discovery" className="hover:text-slate-800">Discovery &amp; Understanding</Link></li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li aria-current="page" className="font-medium text-slate-800">Discovery Configuration</li>
          </ol>
        </nav>

        {/* header */}
        <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">Discovery &amp; Understanding</div>
            <h1 className="text-[20px] font-bold leading-tight text-slate-900">Discovery Configuration</h1>
            <p className="mt-0.5 max-w-3xl text-[12.5px] text-slate-600">
              Define where ECF may discover enterprise knowledge, what it may preserve, and how discovery should operate
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Select value={view} onValueChange={(v) => setView(v as ViewMode)}>
              <SelectTrigger className="h-8 w-[168px] text-[12px]" aria-label="View selector"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(VIEW_LABEL) as ViewMode[]).map((v) => (
                  <SelectItem key={v} value={v} className="text-[12px]">{VIEW_LABEL[v]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => {
              setRefreshedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
              toast.success("Configuration refreshed");
            }}>
              <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden /> Refresh
            </Button>
            <Button size="sm" className="h-8 text-[12px]" onClick={() => { setNewMode("new"); setNewOpen(true); }}>
              <Plus className="mr-1 h-3.5 w-3.5" aria-hidden /> New Configuration
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => { setNewMode("clone"); setNewOpen(true); }}>
              <Copy className="mr-1 h-3.5 w-3.5" aria-hidden /> Clone
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-[12px]"
              onClick={() => toast.info("Validation arrives with configuration governance", { description: "Prompt 2 adds validation, review, and policy conflict analysis." })}>
              Validate Configuration
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={startDryRun}>
              <Play className="mr-1 h-3.5 w-3.5" aria-hidden /> Run Preview
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-[12px]"
              onClick={() => toast.info("Activation arrives with configuration governance", { description: "Approval, publishing, activation, and rollback are Prompt 2 capabilities." })}>
              Activate
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0" aria-label="More configuration actions">
                  <MoreHorizontal className="h-4 w-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-[11px]">Configuration</DropdownMenuLabel>
                <DropdownMenuItem className="text-[12px]" onClick={() => focusPanel("panel-workbench")}>Open workbench</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onClick={() => focusPanel("panel-preview")}>Open preview</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onClick={() => focusPanel("panel-quality")}>Open quality</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[12px]" onClick={() => toast.info("Governed export arrives with configuration governance")}>Governed export</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onClick={() => toast.info("Version history arrives with configuration governance")}>Version history</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <span className="text-[11px] text-slate-500">Configuration service state</span>
          <StatusBadge tone={preview.blockingIssues.length ? "red" : "amber"}>{serviceState}</StatusBadge>
          <StatusBadge tone="green">Active v4.2 in Production</StatusBadge>
          <StatusBadge tone="blue">{draft.name}</StatusBadge>
          <span className="ml-auto text-[11px] text-slate-500">Refreshed {refreshedAt}</span>
        </div>

        {/* filters */}
        <section className="mb-3 rounded-xl border border-slate-200 bg-white" aria-label="Global filters">
          <div className="flex flex-wrap items-center gap-2 px-3 py-2">
            <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>
              <Filter className="mr-1 h-3.5 w-3.5" aria-hidden /> Filters
              {activeFilterCount(filters) > 0 && (
                <span className="ml-1.5 rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">{activeFilterCount(filters)}</span>
              )}
            </Button>
            <Select value={savedView} onValueChange={setSavedView}>
              <SelectTrigger className="h-7 w-[186px] text-[11.5px]" aria-label="Saved view"><SelectValue /></SelectTrigger>
              <SelectContent>{savedViews.map((v) => <SelectItem key={v} value={v} className="text-[12px]">{v}</SelectItem>)}</SelectContent>
            </Select>
            <span className="text-[11px] text-slate-500">{filtered.length} of {configurations.length} configurations</span>
          </div>
          {filtersOpen && (
            <div className="border-t border-slate-100 px-3 py-2.5">
              <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
                {filterOptions.map((f) => (
                  <label key={f.key} className="block">
                    <span className="text-[10.5px] font-medium text-slate-600">{f.label}</span>
                    <Select value={draftFilters[f.key]} onValueChange={(v) => setDraftFilters((d) => ({ ...d, [f.key]: v }))}>
                      <SelectTrigger className="mt-0.5 h-7 text-[11px]" aria-label={f.label}><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-64">
                        {f.options.map((o) => <SelectItem key={o} value={o} className="text-[12px]">{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </label>
                ))}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Button size="sm" className="h-7 text-[11.5px]" onClick={() => { setFilters(draftFilters); toast.success("Filters applied"); }}>Apply Filters</Button>
                <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => { setDraftFilters(defaultFilters); setFilters(defaultFilters); toast.success("Filters cleared"); }}>Clear Filters</Button>
                <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => toast.success(`View saved to "${savedView}"`)}>Save View</Button>
              </div>
            </div>
          )}
        </section>

        {/* KPI row */}
        <section aria-label="Configuration key performance indicators" className="mb-3 grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            label="Active Configurations" value="12" change="8 Production · 3 Business Unit Scoped · 1 Restricted Domain"
            icon={Layers} trend={kpiTrends.configurations} color="#2563eb"
            tooltip="Active discovery configurations across the enterprise. 8 production, 3 business unit scoped, 1 restricted domain."
            onClick={() => { setFilters({ ...filters, status: "Active" }); setDraftFilters({ ...filters, status: "Active" }); focusPanel("panel-inventory"); }}
          />
          <KpiCard
            label="Configured Sources" value={String(preview.sourcesEvaluated)} change={`${preview.includedSources} included · ${preview.excludedSources} excluded`}
            icon={Database} trend={kpiTrends.sources} color="#0f766e"
            tooltip="Sources evaluated by the active configuration, with included and explicitly excluded counts."
            onClick={() => focusPanel("panel-platforms")}
          />
          <KpiCard
            label="Knowledge Domains Covered" value="22" change="18 Full Coverage · 4 Partial Coverage"
            icon={Layers} trend={kpiTrends.domains} color="#7c3aed"
            tooltip="Knowledge domains inside the discovery boundary. 18 have full coverage, 4 are partial."
            onClick={() => focusPanel("panel-scope")}
          />
          <KpiCard
            label="Discovery Rules" value={String(draft.rules.length + 140)} change="118 Include · 30 Exclude or Restrict"
            icon={SlidersHorizontal} trend={kpiTrends.rules} color="#b45309"
            tooltip="Discovery rules governing include, exclude, restrict, prioritize, sample, and traversal behavior."
            onClick={() => focusPanel("panel-rules")}
          />
          <KpiCard
            label="Estimated Discovery Volume" value={`${fmt(preview.discoverableArtifacts)} Artifacts`} change={`+${fmt(preview.projectedIngestionVolume)} projected next cycle`}
            icon={Gauge} trend={kpiTrends.volume} color="#0369a1"
            tooltip="Projected discoverable artifacts under the current draft configuration."
            onClick={() => focusPanel("panel-preview")}
          />
          <KpiCard
            label="Configuration Quality" value="96 / 100" status={preview.blockingIssues.length ? "Attention" : "Healthy"}
            change="Target 97 · Scope, Policy, Ownership, Permission, Processing"
            icon={ShieldCheck} trend={kpiTrends.quality} color="#15803d"
            tooltip="Composite configuration quality across scope, policy, ownership, permission, and processing coverage."
            onClick={() => focusPanel("panel-quality")}
          />
        </section>

        {/* lifecycle */}
        <div className="mb-3">
          <LifecyclePanel stages={seedStages} selected={selectedStage} onSelect={setSelectedStage} />
        </div>

        {/* inventory */}
        <div className="mb-3">
          <Panel
            id="panel-inventory"
            title="Discovery Configurations"
            subtitle="Configuration inventory across the enterprise, business units, domains, team groups, and policy domains"
            spotlight={spotlight === "panel-inventory"}
          >
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search configurations" className="h-7 w-56 text-[11.5px]" aria-label="Search configurations" />
              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger className="h-7 w-[128px] text-[11px]" aria-label="Status filter"><SelectValue /></SelectTrigger>
                <SelectContent>{filterOptions[0].options.map((o) => <SelectItem key={o} value={o} className="text-[12px]">{o}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={filters.owner} onValueChange={(v) => setFilters({ ...filters, owner: v })}>
                <SelectTrigger className="h-7 w-[168px] text-[11px]" aria-label="Owner filter"><SelectValue /></SelectTrigger>
                <SelectContent>{filterOptions.find((f) => f.key === "owner")!.options.map((o) => <SelectItem key={o} value={o} className="text-[12px]">{o}</SelectItem>)}</SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="h-7 text-[11px]">Columns</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                  {ALL_COLUMNS.map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c} className="text-[12px]" checked={columns[c]}
                      onCheckedChange={(v) => setColumns((cols) => ({ ...cols, [c]: Boolean(v) }))}
                    >
                      {c}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="outline" className="h-7 text-[11px]"
                onClick={() => setDensity((d) => (d === "comfortable" ? "compact" : "comfortable"))}>
                Density: {density}
              </Button>
              {selectedRows.length > 0 && (
                <span className="text-[11px] text-slate-600">{selectedRows.length} selected</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1280px] text-[11.5px]">
                <caption className="sr-only">Discovery configuration inventory</caption>
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th scope="col" className="w-8 px-2 py-1.5">
                      <span className="sr-only">Select</span>
                    </th>
                    {ALL_COLUMNS.filter((c) => columns[c]).map((c) => (
                      <th key={c} scope="col" className="whitespace-nowrap px-2 py-1.5 text-left font-medium">
                        <button
                          type="button"
                          className="hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                          onClick={() => setSort((s) => ({ key: c, dir: s.key === c && s.dir === "asc" ? "desc" : "asc" }))}
                          aria-label={`Sort by ${c}`}
                        >
                          {c}{sort.key === c ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
                        </button>
                      </th>
                    ))}
                    <th scope="col" className="px-2 py-1.5 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageRows.map((c) => (
                    <tr
                      key={c.id}
                      className={cn("cursor-pointer hover:bg-slate-50", density === "compact" ? "[&>td]:py-1" : "[&>td]:py-2",
                        selectedConfigId === c.id && "bg-blue-50/50")}
                      onClick={() => openDetail(c)}
                    >
                      <td className="px-2" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.includes(c.id)}
                          onCheckedChange={(v) => setSelectedRows((r) => (v ? [...r, c.id] : r.filter((x) => x !== c.id)))}
                          aria-label={`Select ${c.name}`}
                        />
                      </td>
                      {columns["Configuration ID"] && <td className="px-2 font-mono text-[10.5px] text-slate-600">{c.id}</td>}
                      {columns["Configuration Name"] && <td className="px-2 font-medium text-slate-800">{c.name}</td>}
                      {columns.Scope && <td className="px-2 text-slate-600">{c.scopeType}</td>}
                      {columns["Business Units"] && <td className="px-2 text-slate-700">{c.businessUnitCount}</td>}
                      {columns["Knowledge Domains"] && <td className="px-2 text-slate-700">{c.domainCount}</td>}
                      {columns.Sources && <td className="px-2 text-slate-700">{c.sourceCount}</td>}
                      {columns.Rules && <td className="px-2 text-slate-700">{c.ruleCount}</td>}
                      {columns["Discovery Mode"] && <td className="px-2 text-slate-600">{c.discoveryMode}</td>}
                      {columns.Cadence && <td className="px-2 text-slate-600">{c.cadence}</td>}
                      {columns["Projected Volume"] && <td className="px-2 font-medium text-slate-800">{fmt(c.projectedVolume)}</td>}
                      {columns.Owner && <td className="px-2 text-slate-600">{c.owner}</td>}
                      {columns.Version && <td className="px-2 text-slate-600">{c.version}</td>}
                      {columns["Last Updated"] && <td className="px-2 text-slate-600">{c.updatedAt}</td>}
                      {columns.Status && (
                        <td className="px-2">
                          <StatusBadge tone={c.status === "Active" ? "green" : c.status === "Draft" ? "slate" : "amber"}>{c.status}</StatusBadge>
                        </td>
                      )}
                      <td className="whitespace-nowrap px-2" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => openDetail(c)}>Open</Button>
                        <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => { setNewMode("clone"); setDetailConfig(c); setNewOpen(true); }}>Clone</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">Page {page} of {pages}</span>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          </Panel>
        </div>

        {/* workbench */}
        <div className="mb-3">
          <Panel
            id="panel-workbench"
            title="Discovery Configuration Workbench"
            subtitle={`${draft.name} · based on ${draft.basedOn}. Define the boundaries before discovering the knowledge.`}
            spotlight={spotlight === "panel-workbench"}
          >
            <div className="grid gap-2.5 lg:grid-cols-2 2xl:grid-cols-4">
              <WorkbenchScopeRegion
                draft={draft} onScopeChange={setScopeState}
                onSelectScope={(id) => focusPanel("panel-scope")}
                highlight={showConfiguration}
              />
              <WorkbenchSourceRegion
                draft={draft}
                onTogglePlatform={togglePlatform}
                onDepthChange={setPlatformDepth}
                onContentStateChange={(ct, state) => setContentType(ct, { discoveryState: state })}
                onSelectPlatform={(id) => { setPlatformDetail(id); setPlatformDetailOpen(true); }}
                highlight={showConfiguration}
              />
              <WorkbenchPolicyRegion draft={draft} onPermissionToggle={togglePermission} highlight={showPolicy} />
              <WorkbenchHandoffRegion
                draft={draft} preview={preview} onHandoffToggle={toggleHandoff}
                onWarningSelect={(w: DiscoveryPreviewWarning) => focusPanel(w.element)}
                highlight={showPreviewView || showProcessing}
              />
            </div>
          </Panel>
        </div>

        {/* view-driven panel stack */}
        <div className="space-y-3">
          {(showConfiguration || showPreviewView) && (
            <EnterpriseScopePanel
              draft={draft} onScopeChange={setScopeState} onPriorityChange={setScopePriority}
              onReset={resetScope} spotlight={spotlight === "panel-scope"}
            />
          )}
          {(showConfiguration || showPreviewView || showProcessing) && (
            <SourcePlatformPanel
              draft={draft} preview={preview}
              onTogglePlatform={togglePlatform} onRestrictPlatform={restrictPlatform}
              onDepthChange={setPlatformDepth} onPermissionModeChange={setPlatformPermission}
              onCadenceOverrideChange={setPlatformCadence} onAuthorityChange={setPlatformAuthority}
              onOpenDetail={(id) => { setPlatformDetail(id); setPlatformDetailOpen(true); }}
              spotlight={spotlight === "panel-platforms"}
            />
          )}
          {(showConfiguration || showPolicy) && (
            <DiscoveryRulesPanel
              rules={draft.rules}
              onAdd={() => { setEditingRule(null); setRuleDialogOpen(true); }}
              onEdit={(r) => { setEditingRule(r); setRuleDialogOpen(true); }}
              onDuplicate={duplicateRule}
              onToggle={toggleRule}
              onTest={(r) => { setTestRule(r); setTestOpen(true); }}
              spotlight={spotlight === "panel-rules"}
            />
          )}
          {(showConfiguration || showPolicy || showProcessing) && (
            <ContentTypePolicyPanel draft={draft} onChange={setContentType} spotlight={spotlight === "panel-content-types"} />
          )}
          {(showPolicy || showConfiguration) && (
            <>
              <PermissionPolicyPanel draft={draft} onToggle={togglePermission} spotlight={spotlight === "panel-permissions"} />
              <AuthorityPanel draft={draft} onMappingChange={setAuthorityMapping} spotlight={spotlight === "panel-authority"} />
              <FreshnessPanel draft={draft} onChange={setFreshness} spotlight={spotlight === "panel-freshness"} />
            </>
          )}
          {(showConfiguration || showPolicy) && (
            <>
              <CadencePanel
                draft={draft} preview={preview} onModeChange={setCadenceMode}
                onScheduleChange={setCadenceSchedule} onFullScheduleChange={setFullSchedule}
                spotlight={spotlight === "panel-cadence"}
              />
              <ChangeDetectionPanel
                draft={draft} onToggle={toggleChangeDetection} onDiscoveryChange={setChangeDiscovery}
                spotlight={spotlight === "panel-change-detection"}
              />
              <DuplicatePolicyPanel
                draft={draft} onStrategyToggle={toggleIdentityStrategy} onThresholdChange={setDuplicateThreshold}
                spotlight={spotlight === "panel-duplicates"}
              />
              <TraversalPanel
                draft={draft} preview={preview} onDepthChange={setTraversalDepth} onFollowToggle={toggleFollow}
                spotlight={spotlight === "panel-traversal"}
              />
              <SamplingPanel draft={draft} onChange={setSampling} spotlight={spotlight === "panel-sampling"} />
            </>
          )}
          {(showProcessing || showConfiguration || showPolicy) && (
            <>
              <ProcessingHandoffPanel
                draft={draft} onToggle={toggleHandoff} onQualityChange={setHandoffQuality}
                onReviewToggle={toggleHandoffReview} spotlight={spotlight === "panel-handoffs"}
              />
              <EvidencePanel draft={draft} onToggle={toggleEvidence} spotlight={spotlight === "panel-evidence"} />
            </>
          )}

          <PreviewPanel
            preview={preview}
            onWarningSelect={(w) => focusPanel(w.element)}
            onDryRun={startDryRun}
            spotlight={spotlight === "panel-preview"}
          />
          {(showPreviewView || showConfiguration || showProcessing) && (
            <PreviewBreakdownPanel draft={draft} preview={preview} spotlight={spotlight === "panel-breakdown"} />
          )}
          <QualityPanel draft={draft} preview={preview} spotlight={spotlight === "panel-quality"} />

          <Prompt2Placeholder />

          <p className="pb-6 text-[11px] text-slate-500">
            Discovery Configuration is the policy and scope control plane. Enterprise Source Discovery executes approved
            configuration, Source Registry holds discovered and approved sources, and Connector Health reports operations.
            All data on this page is synthetic demonstration data.
          </p>
        </div>
      </div>

      {/* dialogs and drawers */}
      <ConfigurationDetailDrawer
        open={detailOpen} onOpenChange={setDetailOpen}
        config={detailConfig} draft={draft} preview={preview}
      />
      <SourceScopeDetailDrawer
        open={platformDetailOpen} onOpenChange={setPlatformDetailOpen}
        platformId={platformDetail} draft={draft} preview={preview}
        onToggleRestrict={restrictPlatform} onDepthChange={setPlatformDepth}
      />
      <RuleBuilderDialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen} initial={editingRule} onSave={(r) => { saveRule(r); toast.success(`Rule ${r.id} saved`); }} />
      <RuleTestDialog open={testOpen} onOpenChange={setTestOpen} rule={testRule} />
      <NewConfigurationDialog
        open={newOpen} onOpenChange={setNewOpen} mode={newMode} sourceName={detailConfig?.name}
        onCreate={(name, description, scopeType) => {
          const id = `DISC-CFG-${String(configurations.length + 1).padStart(3, "0")}`;
          setConfigurations((c) => [...c, {
            ...seedConfigurations[0], id, name, description,
            scopeType: scopeType as DiscoveryConfiguration["scopeType"],
            status: "Draft", version: "0.1", environment: "Preproduction",
            createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10),
          }]);
          toast.success(`${name} created as a draft configuration`);
        }}
      />
      <DryRunDialog
        open={dryRunOpen} onOpenChange={setDryRunOpen} result={dryRunResult} running={dryRunning} step={dryRunStep}
        onOpenResults={() => { setDryRunOpen(false); focusPanel("panel-preview"); }}
        onOpenRules={() => { setDryRunOpen(false); focusPanel("panel-rules"); }}
        onOpenWarnings={() => { setDryRunOpen(false); focusPanel("panel-breakdown"); }}
        onSaveDraft={() => toast.success("Draft configuration saved locally", { description: "No downstream ECF state was changed." })}
      />
    </div>
  );
}
