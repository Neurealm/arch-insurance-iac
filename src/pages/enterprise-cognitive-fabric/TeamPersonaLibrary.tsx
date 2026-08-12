/**
 * Team Persona Library — operational catalog of governed team operating models.
 * Route: /enterprise-cognitive-fabric/persona-studio/team-persona-library
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bell, Download, Plus, RefreshCw, Search, SlidersHorizontal, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FilterSelect, Pill } from "./persona-studio/primitives";
import {
  ActivityPanel, AttentionPanel, CoveragePanel, DriftPanel, EvidencePanel, ImpactPreviewPanel,
  InventoryPanel, LibraryKpiCard, Panel, QualityPanel, RelationshipExplorer, StatusDistributionPanel,
  UsagePanel, statusTone, viewColumns, type Density,
} from "./persona-library/panels";
import {
  BulkActionDialog, ComparisonDialog, DemoStoryOverlay, ExportLibraryDialog, GlobalSearchDialog,
  LineageNodeDrawer, NotificationDrawer, PersonaDetailDrawer, QualityDetailDrawer,
  RefreshPersonaDialog, RelationshipNodeDrawer, VersionComparisonDialog, type PersonaTab,
} from "./persona-library/dialogs";
import {
  activeLibraryFilterCount, applyLibraryFilters, attentionItems as seedAttention,
  defaultLibraryFilters, evidenceLineage, libraryActivity as seedActivity, libraryDrift as seedDrift,
  libraryFilterLabels, libraryFilterOptions, libraryKpis, libraryNotifications as seedNotifications,
  libraryPersonas, libraryScenarios, libraryStory, personaToRecord,
  type AttentionItem, type LibraryActivity, type LibraryDrift, type LibraryFilters,
  type LibraryNotification, type LibraryPersona, type LibraryView, type QualityDimension,
  type RelationshipEdge, type RelationshipNode,
} from "./persona-library/data";

const VIEWS: { id: LibraryView; label: string }[] = [
  { id: "portfolio", label: "Portfolio" },
  { id: "operating-model", label: "Operating Model" },
  { id: "relationship", label: "Relationship" },
  { id: "governance", label: "Governance" },
];

const LS = {
  view: "ecf.personaLibrary.view",
  filters: "ecf.personaLibrary.filters",
  density: "ecf.personaLibrary.density",
  columns: "ecf.personaLibrary.columns",
  savedView: "ecf.personaLibrary.savedView",
  persona: "ecf.personaLibrary.persona",
  compare: "ecf.personaLibrary.compare",
};

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try { const raw = window.localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
};
const write = (key: string, value: unknown) => {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
};

const toCsv = (rows: LibraryPersona[]) => {
  const head = ["Persona ID", "Team", "Business Unit", "Mission", "Status", "Approval", "Quality", "Completeness", "Confidence", "Freshness", "Conditions", "Dependencies", "Owner", "Version"];
  const body = rows.map((p) => Object.values(personaToRecord(p)));
  return [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
};

const toYaml = (rows: LibraryPersona[]) =>
  rows.map((p) => {
    const rec = personaToRecord(p);
    return `- ${Object.entries(rec).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("\n  ")}`;
  }).join("\n");

const downloadFile = (name: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};

export default function TeamPersonaLibrary() {
  const navigate = useNavigate();

  /* ----------------------------- preferences ---------------------------- */
  const [view, setView] = useState<LibraryView>(() => read<LibraryView>(LS.view, "portfolio"));
  const [filters, setFilters] = useState<LibraryFilters>(() => read<LibraryFilters>(LS.filters, defaultLibraryFilters));
  const [draftFilters, setDraftFilters] = useState<LibraryFilters>(filters);
  const [density, setDensity] = useState<Density>(() => read<Density>(LS.density, "standard"));
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => new Set(read<string[]>(LS.columns, [])));
  const [savedView, setSavedView] = useState<string | null>(() => read<string | null>(LS.savedView, null));
  const [compareIds, setCompareIds] = useState<string[]>(() => read<string[]>(LS.compare, ["PERSONA 1001", "PERSONA 1002", "PERSONA 1003"]));

  useEffect(() => write(LS.view, view), [view]);
  useEffect(() => write(LS.filters, filters), [filters]);
  useEffect(() => write(LS.density, density), [density]);
  useEffect(() => write(LS.columns, [...hiddenColumns]), [hiddenColumns]);
  useEffect(() => write(LS.compare, compareIds), [compareIds]);

  /* -------------------------------- state ------------------------------- */
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("quality");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [scenarioId, setScenarioId] = useState("healthy");
  const [notifications, setNotifications] = useState<LibraryNotification[]>(seedNotifications);
  const [activity, setActivity] = useState<LibraryActivity[]>(seedActivity);
  const [attention, setAttention] = useState<AttentionItem[]>(seedAttention);
  const [drift, setDrift] = useState<LibraryDrift[]>(seedDrift);
  const [attentionType, setAttentionType] = useState<string | null>(null);

  const [openPersona, setOpenPersona] = useState<LibraryPersona | null>(null);
  const [personaTab, setPersonaTab] = useState<PersonaTab>("Overview");
  const [qualityDetail, setQualityDetail] = useState<QualityDimension | null>(null);
  const [graphNode, setGraphNode] = useState<RelationshipNode | null>(null);
  const [graphEdge, setGraphEdge] = useState<RelationshipEdge | null>(null);
  const [lineageNode, setLineageNode] = useState<typeof evidenceLineage[number] | null>(null);

  const [compareOpen, setCompareOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [refreshOpen, setRefreshOpen] = useState(false);
  const [refreshTarget, setRefreshTarget] = useState("Payments Platform");
  const [exportOpen, setExportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string | null>(null);

  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const [presenterNotes, setPresenterNotes] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const announce = useCallback((msg: string) => setAnnouncement(msg), []);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(t);
  }, []);

  /* ------------------------------ scenarios ----------------------------- */
  const scenario = libraryScenarios.find((s) => s.id === scenarioId) ?? libraryScenarios[0];

  const scenarioPersonas = useMemo(
    () => libraryPersonas.map((p) => ({ ...p, ...(scenario.personaOverrides[p.id] ?? {}) })),
    [scenario],
  );

  const applyScenario = (id: string) => {
    const s = libraryScenarios.find((x) => x.id === id)!;
    setScenarioId(id === "reset" ? "healthy" : id);
    setNotifications(id === "reset" ? seedNotifications : s.extraNotification ? [s.extraNotification, ...seedNotifications] : seedNotifications);
    setActivity(id === "reset" ? seedActivity : s.extraActivity ? [s.extraActivity, ...seedActivity] : seedActivity);
    setAttention(id === "reset" ? seedAttention : s.extraAttention ? [s.extraAttention, ...seedAttention] : seedAttention);
    setDrift(id === "reset" ? seedDrift : s.driftOverride ?? seedDrift);
    setPage(1);
    announce(`Scenario applied: ${s.label}`);
    toast.message(s.label, { description: s.banner });
  };

  /* ------------------------------- derived ------------------------------ */
  const filtered = useMemo(
    () => applyLibraryFilters(scenarioPersonas, filters, search),
    [scenarioPersonas, filters, search],
  );
  const filteredAttention = useMemo(
    () => attention.filter((a) => (!attentionType || a.issueType === attentionType)
      && (filters.team === "All" || a.persona === filters.team)),
    [attention, attentionType, filters.team],
  );
  const activeFilters = activeLibraryFilterCount(filters);
  const unread = notifications.filter((n) => !n.read).length;
  const story = storyIndex === null ? null : libraryStory[storyIndex];
  const spotlight = story?.target ?? null;

  const focusPanel = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  };

  /* -------------------------------- actions ----------------------------- */
  const clearFilters = () => {
    setFilters(defaultLibraryFilters); setDraftFilters(defaultLibraryFilters);
    setSearch(""); setAttentionType(null); setPage(1); announce("Filters cleared");
  };
  const setFilter = (key: keyof LibraryFilters, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next); setDraftFilters(next); setPage(1);
    announce(`${libraryFilterLabels[key]} filtered to ${value}`);
  };

  const onKpi = (id: string) => {
    if (id === "kpi-personas") { setFilter("personaStatus", "All"); focusPanel("panel-inventory"); }
    else if (id === "kpi-teams") focusPanel("panel-coverage");
    else if (id === "kpi-quality") focusPanel("panel-quality");
    else if (id === "kpi-evidence") focusPanel("panel-evidence");
    else if (id === "kpi-attention") { focusPanel("panel-attention"); setAttentionType(null); }
    else focusPanel("panel-usage");
  };

  const onPersonaAction = (action: string, p: LibraryPersona) => {
    if (action === "Open in Persona Construction") navigate("/enterprise-cognitive-fabric/persona-studio/team-persona-construction");
    else if (action === "Compare") { setCompareIds([p.id, ...compareIds.filter((x) => x !== p.id)].slice(0, 3)); setCompareOpen(true); }
    else if (action === "Refresh Persona") { setRefreshTarget(p.teamName); setRefreshOpen(true); }
    else if (action === "Export Persona") { downloadFile(`${p.id.replace(/\s+/g, "-")}.json`, JSON.stringify(p, null, 2), "application/json"); toast.success(`${p.teamName} Persona exported`); }
    else if (action === "Create Draft Version") { setVersionOpen(true); toast.success(`Draft version created for ${p.teamName}`); }
    else if (action === "Open Context Graph") { setOpenPersona(null); focusPanel("panel-relationships"); }
    else if (action === "Open Impact Analysis") { setOpenPersona(null); focusPanel("panel-impact"); }
    else toast.success(`${action} — ${p.teamName}`);
  };

  const onExport = (format: string, scope: string, options: string[], data: LibraryPersona[]) => {
    const stamp = "persona-library";
    if (format === "CSV") downloadFile(`${stamp}.csv`, toCsv(data), "text/csv;charset=utf-8");
    else if (format === "JSON") downloadFile(`${stamp}.json`, JSON.stringify({ scope, options, personas: data.map(personaToRecord) }, null, 2), "application/json");
    else if (format === "YAML") downloadFile(`${stamp}.yaml`, toYaml(data), "text/yaml");
    else downloadFile(`${stamp}-${format.toLowerCase().replace(/\s+/g, "-")}.txt`,
      `${format} — ${scope}\n\n${data.map((p) => `${p.id} ${p.teamName} — ${p.mission}`).join("\n")}`, "text/plain");
    announce(`${format} export generated for ${data.length} Personas`);
    toast.success(`${format} export generated`, { description: `${data.length} Personas, scope ${scope}` });
  };

  const runBulk = () => {
    const count = selectedRows.size;
    announce(`${bulkAction} applied to ${count} Personas`);
    toast.success(`${bulkAction} applied`, { description: `${count} Personas affected` });
    if (bulkAction === "Compare Selected") { setCompareIds([...selectedRows].slice(0, 4)); setCompareOpen(true); }
    if (bulkAction === "Export") setExportOpen(true);
    setBulkAction(null);
  };

  /* ------------------------------ demo story ---------------------------- */
  useEffect(() => {
    if (storyIndex === null || !story) return;
    if (story.action === "open-persona") {
      const p = scenarioPersonas.find((x) => x.id === "PERSONA 1001") ?? null;
      setOpenPersona(p); setPersonaTab("Overview");
    }
    if (story.target === "thinking") setPersonaTab("How This Team Thinks");
    if (story.target === "evidence") setPersonaTab("Evidence");
    if (story.action === "open-compare") { setOpenPersona(null); setCompareIds(["PERSONA 1001", "PERSONA 1002", "PERSONA 1003"]); setCompareOpen(true); }
    if (["kpis", "inventory", "relationships", "drift", "usage", "impact"].includes(story.target)) {
      setCompareOpen(false);
      if (story.target !== "inventory" || !story.action) setOpenPersona((cur) => (story.target === "inventory" && story.action ? cur : null));
      focusPanel(story.target === "kpis" ? "panel-kpis" : `panel-${story.target === "relationships" ? "relationships" : story.target}`);
    }
    announce(story.caption);
  }, [storyIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  /* --------------------------------- render ----------------------------- */
  const kpiValue = (id: string) => scenario.kpiOverrides[id];

  const inventoryToolbar = (
    <>
      <select
        aria-label="Saved views" value={savedView ?? ""}
        onChange={(e) => { setSavedView(e.target.value || null); write(LS.savedView, e.target.value || null); announce("Saved view applied"); }}
        className="h-7 rounded-md border border-slate-200 px-1 text-[11px] text-slate-700"
      >
        <option value="">Saved Views</option>
        <option value="attention">Attention required</option>
        <option value="approved">Approved and current</option>
      </select>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"><Columns3 className="mr-1 h-3.5 w-3.5" aria-hidden />Columns</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-72 overflow-auto">
          <DropdownMenuLabel className="text-[11px]">Column visibility</DropdownMenuLabel>
          {viewColumns[view].map((c) => (
            <DropdownMenuCheckboxItem
              key={c.key} checked={!hiddenColumns.has(c.key)}
              onCheckedChange={() => setHiddenColumns((s) => { const n = new Set(s); n.has(c.key) ? n.delete(c.key) : n.add(c.key); return n; })}
              className="text-[11px]"
            >{c.label}</DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <select
        aria-label="Table density" value={density} onChange={(e) => setDensity(e.target.value as Density)}
        className="h-7 rounded-md border border-slate-200 px-1 text-[11px] text-slate-700"
      >
        {["compact", "standard", "comfortable"].map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { downloadFile("persona-library-view.csv", toCsv(filtered), "text/csv;charset=utf-8"); toast.success("Current view exported"); }}>
        Export Current View
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={selectedRows.size === 0}>Bulk Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {["Request Review", "Assign Persona Owner", "Refresh Personas", "Export", "Compare Selected",
            "Mark for Governance Review", "Create Draft Versions", "Open Relationship Summary"].map((a) => (
            <DropdownMenuItem key={a} className="text-[11px]" onSelect={() => setBulkAction(a)}>{a}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <div className="min-h-full bg-slate-50 px-5 py-4">
      <div aria-live="polite" className="sr-only" ref={liveRef}>{announcement}</div>

      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
        <Link to="/" className="hover:text-blue-700">Home</Link>
        <span aria-hidden>/</span>
        <Link to="/enterprise-cognitive-fabric" className="hover:text-blue-700">Enterprise Cognitive Fabric</Link>
        <span aria-hidden>/</span>
        <span>Persona Studio</span>
        <span aria-hidden>/</span>
        <span className="font-medium text-slate-700">Team Persona Library</span>
      </nav>

      {/* header */}
      <header className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-400">Modeling &amp; Memory</p>
          <h1 className="text-[19px] font-bold text-slate-900">Team Persona Library</h1>
          <p className="text-[12px] text-slate-500">
            Explore evidence linked team operating models and understand how each team evaluates change
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Pill label={scenario.libraryState} tone={statusTone(scenario.libraryState)} />
          <div className="flex rounded-md border border-slate-200 bg-white p-0.5" role="tablist" aria-label="View selector">
            {VIEWS.map((v) => (
              <button
                key={v.id} type="button" role="tab" aria-selected={view === v.id}
                onClick={() => { setView(v.id); setPage(1); announce(`${v.label} view selected`); }}
                className={cn("rounded px-2 py-1 text-[11px]", view === v.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}
              >{v.label}</button>
            ))}
          </div>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setSearchOpen(true)}>
            <Search className="mr-1 h-3.5 w-3.5" aria-hidden />Search
          </Button>
          <Button
            size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { setLoading(true); setError(false); window.setTimeout(() => { setLoading(false); toast.success("Library refreshed"); announce("Library refreshed"); }, 350); }}
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden />Refresh
          </Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => navigate("/enterprise-cognitive-fabric/persona-studio/team-persona-construction")}>
            <Plus className="mr-1 h-3.5 w-3.5" aria-hidden />Create Persona
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setCompareOpen(true)}>Compare Personas</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setExportOpen(true)}>
            <Download className="mr-1 h-3.5 w-3.5" aria-hidden />Export Library
          </Button>
          <Button size="sm" variant="outline" className="relative h-7 text-[11px]" onClick={() => setNotifyOpen(true)} aria-label={`Notifications, ${unread} unread`}>
            <Bell className="h-3.5 w-3.5" aria-hidden />
            {unread > 0 && <span className="ml-1 rounded bg-rose-600 px-1 text-[9px] font-semibold text-white">{unread}</span>}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-7 text-[11px]">More</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-96 overflow-auto">
              <DropdownMenuItem className="text-[11px]" onSelect={() => { setStoryIndex(0); setPresenterNotes(false); }}>Demo Story</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onSelect={() => setVersionOpen(true)}>Compare Persona Versions</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onSelect={() => { setRefreshTarget("Payments Platform"); setRefreshOpen(true); }}>Refresh Persona</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onSelect={() => { setError(true); announce("Error state simulated"); }}>Simulate Error State</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px]">Demo Scenarios</DropdownMenuLabel>
              {libraryScenarios.map((s) => (
                <DropdownMenuItem key={s.id} className="text-[11px]" onSelect={() => applyScenario(s.id)}>{s.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {scenarioId !== "healthy" && (
        <div role="status" className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11.5px] text-blue-900">
          <Pill label={scenario.label} tone="blue" />
          <span>{scenario.banner}</span>
          <Button size="sm" variant="outline" className="ml-auto h-6 text-[10.5px]" onClick={() => applyScenario("reset")}>Reset Demo Data</Button>
        </div>
      )}

      {/* filters */}
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}>
            <SlidersHorizontal className="mr-1 h-3.5 w-3.5" aria-hidden />Filters
            {activeFilters > 0 && <span className="ml-1 rounded bg-blue-600 px-1 text-[9.5px] text-white">{activeFilters}</span>}
          </Button>
          <span className="text-[11px] text-slate-500">{filtered.length} of {scenarioPersonas.length} Personas shown</span>
          <div className="ml-auto flex gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setFilters(draftFilters); setPage(1); announce("Filters applied"); }}>Apply Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={clearFilters}>Clear Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setSavedView("custom"); write(LS.savedView, "custom"); toast.success("View saved"); }}>Save View</Button>
          </div>
        </div>
        {filtersOpen && (
          <div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {(Object.keys(defaultLibraryFilters) as (keyof LibraryFilters)[]).map((k) => (
              <FilterSelect
                key={k} label={libraryFilterLabels[k]} value={draftFilters[k]} options={libraryFilterOptions[k]}
                onChange={(v) => setDraftFilters((s) => ({ ...s, [k]: v }))}
              />
            ))}
          </div>
        )}
      </div>

      {/* KPIs */}
      <div id="panel-kpis" className={cn("mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", spotlight === "kpis" && "rounded-xl ring-2 ring-blue-500 ring-offset-2")}>
        {libraryKpis.map((k) => (
          <LibraryKpiCard key={k.id} kpi={k} valueOverride={kpiValue(k.id)} onClick={() => onKpi(k.id)} />
        ))}
      </div>

      <div className="mt-3 space-y-3">
        <InventoryPanel
          personas={filtered} view={view} density={density} search={search} onSearch={(v) => { setSearch(v); setPage(1); }}
          onOpen={(p) => { setOpenPersona(p); setPersonaTab("Overview"); write(LS.persona, p.id); announce(`${p.teamName} Persona opened`); }}
          selected={selectedRows}
          onToggle={(id) => setSelectedRows((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; })}
          onToggleAll={() => setSelectedRows((s) => (s.size === filtered.length ? new Set() : new Set(filtered.map((p) => p.id))))}
          sortKey={sortKey} sortDir={sortDir}
          onSort={(k) => { if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir("desc"); } }}
          hiddenColumns={hiddenColumns} page={page} pageSize={6} onPage={setPage}
          loading={loading} error={error} onRetry={() => { setError(false); setLoading(true); window.setTimeout(() => setLoading(false), 300); }}
          onClearFilters={clearFilters} onCreate={() => navigate("/enterprise-cognitive-fabric/persona-studio/team-persona-construction")}
          spotlight={spotlight === "inventory"} toolbar={inventoryToolbar}
        />

        <div className="grid gap-3 xl:grid-cols-3">
          <div className="xl:col-span-2"><CoveragePanel onSelect={(k, v) => setFilter(k as keyof LibraryFilters, v)} /></div>
          <StatusDistributionPanel onSelect={(s) => setFilter("personaStatus", s)} />
        </div>

        <QualityPanel onDimension={(d) => setQualityDetail(d)} />

        <RelationshipExplorer
          onNode={(n) => { setGraphEdge(null); setGraphNode(n); }}
          onEdge={(e) => { setGraphNode(null); setGraphEdge(e); }}
          spotlight={spotlight === "relationships"}
        />

        <DriftPanel
          drift={drift} spotlight={spotlight === "drift"}
          onAction={(d, a) => {
            if (a === "Open Comparison") setVersionOpen(true);
            else if (a === "Refresh Persona") { setRefreshTarget(d.personaName); setRefreshOpen(true); }
            else if (a === "Dismiss as Nonmaterial") { setDrift((s) => s.filter((x) => x.id !== d.id)); toast.message("Drift dismissed as nonmaterial"); }
            else toast.success(`${a} — ${d.personaName}`);
            announce(`${a} on ${d.personaName}`);
          }}
        />

        <div className="grid gap-3 xl:grid-cols-2">
          <UsagePanel
            spotlight={spotlight === "usage"}
            onPersona={(id) => { const p = scenarioPersonas.find((x) => x.id === id); if (p) { setOpenPersona(p); setPersonaTab("Usage"); } }}
          />
          <ImpactPreviewPanel spotlight={spotlight === "impact"} onOpen={() => navigate("/enterprise-cognitive-fabric/persona-impact-analysis")} />
        </div>

        <EvidencePanel spotlight={spotlight === "evidence"} onNode={setLineageNode} />

        <AttentionPanel
          items={filteredAttention} activeType={attentionType} onType={setAttentionType}
          onAction={(item, a) => {
            const p = scenarioPersonas.find((x) => x.id === item.personaId);
            if (a === "Open Persona" && p) { setOpenPersona(p); setPersonaTab("Overview"); }
            else if (a === "Open Evidence" && p) { setOpenPersona(p); setPersonaTab("Evidence"); }
            else if (a === "Refresh Persona") { setRefreshTarget(item.persona); setRefreshOpen(true); }
            else toast.success(`${a} — ${item.persona}`);
            announce(`${a} on ${item.persona}`);
          }}
        />

        <ActivityPanel
          activity={activity}
          onOpen={(a) => { const p = scenarioPersonas.find((x) => x.id === a.persona); if (p) { setOpenPersona(p); setPersonaTab("Audit History"); } else toast.message(a.result); }}
        />
      </div>

      {/* drawers and dialogs */}
      <PersonaDetailDrawer
        persona={openPersona} tab={personaTab} onTab={setPersonaTab}
        onClose={() => setOpenPersona(null)} onAction={onPersonaAction}
        spotlightThinking={spotlight === "thinking"} spotlightEvidence={spotlight === "evidence"}
      />
      <QualityDetailDrawer
        dimension={qualityDetail} onClose={() => setQualityDetail(null)}
        onFilter={() => { setFilter("qualityBand", "Below 80"); setQualityDetail(null); focusPanel("panel-inventory"); }}
      />
      <RelationshipNodeDrawer node={graphNode} edge={graphEdge} onClose={() => { setGraphNode(null); setGraphEdge(null); }} />
      <LineageNodeDrawer node={lineageNode} onClose={() => setLineageNode(null)} />
      <ComparisonDialog
        open={compareOpen} onOpenChange={setCompareOpen} selectedIds={compareIds} onSelectedIds={setCompareIds}
        onAction={(a) => {
          if (a === "Export Comparison") { downloadFile("persona-comparison.json", JSON.stringify(compareIds, null, 2), "application/json"); toast.success("Comparison exported"); }
          else if (a === "Open Cross Team Impact Matrix") navigate("/enterprise-cognitive-fabric/cross-team-impact-matrix");
          else toast.success(a);
        }}
      />
      <VersionComparisonDialog open={versionOpen} onOpenChange={setVersionOpen} />
      <RefreshPersonaDialog
        open={refreshOpen} onOpenChange={setRefreshOpen} personaName={refreshTarget}
        onComplete={() => { applyScenario("new-version"); announce("Persona refresh completed and draft version created"); }}
      />
      <ExportLibraryDialog
        open={exportOpen} onOpenChange={setExportOpen} rows={filtered}
        selected={filtered.filter((p) => selectedRows.has(p.id))} onExport={onExport}
      />
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} onOpenPersona={(p) => { setOpenPersona(p); setPersonaTab("Overview"); }} />
      <NotificationDrawer
        open={notifyOpen} onOpenChange={setNotifyOpen} notifications={notifications}
        onMarkAll={() => { setNotifications((s) => s.map((n) => ({ ...n, read: true }))); announce("All notifications marked read"); }}
        onMarkRead={(id) => setNotifications((s) => s.map((n) => (n.id === id ? { ...n, read: true } : n)))}
        onAction={(n, a) => toast.success(`${a} — ${n.title}`)}
      />
      <BulkActionDialog
        open={!!bulkAction} onOpenChange={(v) => { if (!v) setBulkAction(null); }}
        action={bulkAction ?? ""} count={selectedRows.size} onConfirm={runBulk}
      />

      {story && (
        <DemoStoryOverlay
          step={story} index={storyIndex!} total={libraryStory.length}
          onNext={() => setStoryIndex((i) => Math.min(libraryStory.length - 1, (i ?? 0) + 1))}
          onPrev={() => setStoryIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onExit={() => { setStoryIndex(null); setCompareOpen(false); announce("Demo story exited"); }}
          notes={presenterNotes} onToggleNotes={() => setPresenterNotes((v) => !v)}
        />
      )}
    </div>
  );
}
