/**
 * Persona Validation — governed validation and approval control plane for Team Personas.
 * Operational enterprise page inside the Enterprise Cognitive Fabric shell.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronRight, Filter, RefreshCw, Search as SearchIcon } from "lucide-react";
import { FilterSelect, Pill } from "./persona-studio/primitives";
import { exportCsv, exportJson, downloadBlob } from "@/lib/operations/exports";
import {
  ActivityPanel, ApprovalChainPanel, ConflictPanel, DependencyPanel, DownstreamPanel,
  EvidenceValidationPanel, GapPanel, HistoryPanel, LifecyclePanel, Panel, PortfolioRiskPanel,
  QualityPanel, SectionMatrixPanel, SelectedStagePanel, ThinkingPanel, ValidationKpiCard,
  ValidationQueuePanel, type Density,
} from "./persona-validation/panels";
import { ValidationWorkbench, initialWorkbenchState, type WorkbenchState } from "./persona-validation/workbench";
import {
  ApprovalDialog, BulkActionsDialog, ConflictResolutionDialog, ExportDialog, NotificationsDrawer,
  QualityDrawer, ReviewDrawer, SearchDialog, StartValidationDialog, VersionDialog,
  type SearchResultRow,
} from "./persona-validation/dialogs";
import {
  activeValidationFilterCount, applyValidationFilters, defaultValidationFilters,
  reviewToRecord, validationActivity, validationConflicts, validationFilterLabels,
  validationFilterOptions, validationGaps, validationKpis, validationNotifications,
  validationReviews, validationScenarios, validationStages, validationStory,
  type QualityMetric, type ValidationActivity, type ValidationConflict, type ValidationFilters,
  type ValidationGap, type ValidationNotification, type ValidationReview, type ValidationView,
} from "./persona-validation/data";

const PREF_KEY = "ecf.persona-validation.prefs.v1";

const views: { id: ValidationView; label: string }[] = [
  { id: "review-queue", label: "Review Queue" },
  { id: "workbench", label: "Validation Workbench" },
  { id: "governance", label: "Governance" },
  { id: "portfolio-risk", label: "Portfolio Risk" },
];

interface Prefs {
  view: ValidationView; filters: ValidationFilters; savedView: string; density: Density;
  hiddenColumns: string[]; selectedReview: string | null; selectedStage: string;
  workbenchSection: string; filtersOpen: boolean;
}

const defaultPrefs: Prefs = {
  view: "review-queue", filters: defaultValidationFilters, savedView: "Default",
  density: "standard", hiddenColumns: [], selectedReview: "PVR 3401",
  selectedStage: "resolve", workbenchSection: "approval-requirements", filtersOpen: false,
};

const loadPrefs = (): Prefs => {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : defaultPrefs;
  } catch { return defaultPrefs; }
};

export default function PersonaValidation() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [announce, setAnnounce] = useState("");

  const [scenarioId, setScenarioId] = useState("healthy");
  const [notifications, setNotifications] = useState<ValidationNotification[]>(validationNotifications);
  const [activity, setActivity] = useState<ValidationActivity[]>(validationActivity);
  const [dependencyStates, setDependencyStates] = useState<Record<string, string>>({});
  const [thinkingStates, setThinkingStates] = useState<Record<string, string>>({});
  const [approvalOverrides, setApprovalOverrides] = useState<Record<string, string>>({});
  const [resolvedConflicts, setResolvedConflicts] = useState<Record<string, string>>({});
  const [resolvedGaps, setResolvedGaps] = useState<Record<string, string>>({});
  const [conflictType, setConflictType] = useState("All");
  const [gapType, setGapType] = useState("All");
  const [workbench, setWorkbench] = useState<WorkbenchState>({ ...initialWorkbenchState, sectionId: prefs.workbenchSection });

  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<ValidationReview | null>(null);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [qualityMetric, setQualityMetric] = useState<QualityMetric | null>(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [activeConflict, setActiveConflict] = useState<ValidationConflict | null>(null);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [storyOn, setStoryOn] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const [savedViews, setSavedViews] = useState<string[]>(["Default", "Overdue reviews", "Critical conflicts"]);
  const [focus, setFocus] = useState<"all" | "warnings" | "blocked" | "overdue" | "downstream">("all");
  const [kpiFocus, setKpiFocus] = useState<string | null>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  const reducedMotion = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 320);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { /* preferences are best effort */ }
  }, [prefs]);

  const say = useCallback((msg: string) => { setAnnounce(msg); }, []);

  const scenario = validationScenarios.find((s) => s.id === scenarioId) ?? validationScenarios[0];

  const reviews = useMemo(() => validationReviews.map((r) => ({ ...r, ...(scenario.reviewOverrides[r.id] ?? {}) })), [scenario]);
  const filtered = useMemo(() => applyValidationFilters(reviews, prefs.filters, search), [reviews, prefs.filters, search]);
  const filterCount = activeValidationFilterCount(prefs.filters);

  const conflicts = useMemo(() => validationConflicts
    .filter((c) => conflictType === "All" || c.conflictType === conflictType)
    .map((c) => ({ ...c, status: resolvedConflicts[c.id] ?? c.status })), [conflictType, resolvedConflicts]);

  const gaps = useMemo(() => {
    const extra = scenario.extraGap ? [scenario.extraGap] : [];
    return [...validationGaps, ...extra]
      .filter((g) => gapType === "All" || g.gapType === gapType)
      .map((g) => ({ ...g, status: resolvedGaps[g.id] ?? g.status }));
  }, [gapType, resolvedGaps, scenario]);

  const stage = validationStages.find((s) => s.id === prefs.selectedStage) ?? validationStages[6];

  const setPref = <K extends keyof Prefs>(key: K, value: Prefs[K]) => setPrefs((p) => ({ ...p, [key]: value }));

  const openReview = (r: ValidationReview) => {
    setActiveReview(r); setReviewOpen(true);
    setPref("selectedReview", r.id);
    setWorkbench((w) => ({ ...w, sectionId: r.sectionId }));
    say(`Review ${r.id} for ${r.persona} selected`);
  };

  const logActivity = (action: string, detail: string, persona = "Payments Platform") => {
    setActivity((a) => [{
      id: `A-${Date.now()}`, at: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      action, persona, section: workbench.sectionId, reviewer: "Jane Smith", result: detail,
      auditId: `AUD ${90000 + a.length}`, reviewId: prefs.selectedReview ?? "PVR 3401",
    }, ...a]);
  };

  const applyScenario = (id: string) => {
    const s = validationScenarios.find((x) => x.id === id);
    if (!s) return;
    setScenarioId(id === "reset" ? "healthy" : id);
    if (id === "reset") {
      setNotifications(validationNotifications); setActivity(validationActivity);
      setDependencyStates({}); setThinkingStates({}); setApprovalOverrides({});
      setResolvedConflicts({}); setResolvedGaps({}); setWorkbench(initialWorkbenchState);
      setSelected(new Set());
    } else {
      setNotifications((n) => (s.extraNotification ? [s.extraNotification, ...n] : n));
      setActivity((a) => (s.extraActivity ? [s.extraActivity, ...a] : a));
      setApprovalOverrides(s.approvalStageOverride ?? {});
    }
    toast.success(s.label, { description: s.banner });
    say(`Scenario ${s.label} applied. ${s.banner}`);
  };

  const kpiValue = (id: string) => scenario.kpiOverrides[id];

  const onKpi = (id: string) => {
    setKpiFocus(id);
    const map: Record<string, string> = {
      "kpi-awaiting": "panel-queue", "kpi-tasks": "panel-queue", "kpi-quality": "panel-quality",
      "kpi-conflicts": "panel-conflicts", "kpi-gaps": "panel-evidence", "kpi-downstream": "panel-downstream",
    };
    document.getElementById(map[id])?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    if (id === "kpi-awaiting") setPref("filters", { ...prefs.filters, reviewStatus: "Pending" });
    say(`Focused ${validationKpis.find((k) => k.id === id)?.name}`);
  };

  const storyTargets: Record<string, string> = {
    kpis: "panel-kpis", lifecycle: "panel-lifecycle", workbench: "panel-workbench",
    conflicts: "panel-conflicts", dependencies: "panel-dependencies", thinking: "panel-thinking",
    approval: "panel-approval", downstream: "panel-downstream",
  };

  const runStoryStep = (index: number) => {
    const step = validationStory[index];
    if (!step) return;
    document.getElementById(storyTargets[step.target])?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    if (step.action === "open-workbench") setWorkbench((w) => ({ ...w, sectionId: "approval-requirements" }));
    if (step.action === "open-conflict") { setActiveConflict(validationConflicts[0]); setConflictOpen(true); }
    if (step.action === "approve") setApprovalOpen(true);
    say(step.caption);
  };

  const exportCurrentView = () => {
    const rows = [
      ["Review ID", "Persona", "Team", "Review Type", "Reason", "Priority", "Stage", "Reviewer", "Quality", "Completeness", "Confidence", "Evidence Coverage", "Conflicts", "Due", "Age", "Downstream Impact", "Status"],
      ...filtered.map((r) => Object.values(reviewToRecord(r)) as (string | number)[]),
    ];
    exportCsv("persona-validation-queue.csv", rows);
    toast.success("Validation queue exported", { description: `${filtered.length} rows exported as CSV.` });
    say("Validation queue exported as CSV");
  };

  const runExport = (format: string, scope: string, options: string[]) => {
    const payload = {
      generatedAt: new Date().toISOString(), scope, options,
      reviews: filtered.map(reviewToRecord),
      conflicts: options.includes("Include Conflicts") ? conflicts : undefined,
      gaps: options.includes("Include Gaps") ? gaps : undefined,
    };
    if (format === "CSV") {
      exportCsv("persona-validation-report.csv", [
        ["Review ID", "Persona", "Review Type", "Priority", "Status", "Due"],
        ...filtered.map((r) => [r.id, r.persona, r.reviewType, r.priority, r.status, r.due]),
      ]);
    } else if (format === "JSON") {
      exportJson("persona-validation-report.json", payload);
    } else if (format === "YAML") {
      const yaml = Object.entries(payload)
        .map(([k, v]) => `${k}: ${typeof v === "object" ? `\n  ${JSON.stringify(v)}` : v}`).join("\n");
      downloadBlob(yaml, "persona-validation-report.yaml", "text/yaml;charset=utf-8");
    } else {
      downloadBlob(
        `Persona Validation Report\nScope: ${scope}\nReviews: ${filtered.length}\nOptions: ${options.join(", ")}`,
        format === "PDF Summary" ? "persona-validation-summary.txt" : "persona-validation-snapshot.txt",
        "text/plain;charset=utf-8",
      );
    }
    toast.success(`${format} export generated`, { description: scope });
    say(`${format} validation report exported`);
  };

  const serviceState = scenario.serviceState;
  const unread = notifications.filter((n) => !n.read).length;
  const spotlight = (target: string) => storyOn && validationStory[storyStep]?.target === target;

  return (
    <div className="min-h-full bg-slate-50 px-5 py-4">
      <div aria-live="polite" role="status" ref={liveRef} className="sr-only">{announce}</div>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <Link to="/" className="hover:text-blue-700">Home</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link to="/enterprise-cognitive-fabric" className="hover:text-blue-700">Enterprise Cognitive Fabric</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span>Persona Studio</span>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="font-medium text-slate-700">Persona Validation</span>
      </nav>

      {/* Header */}
      <header className="mt-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Modeling &amp; Memory</p>
          <h1 className="text-[19px] font-bold text-slate-900">Persona Validation</h1>
          <p className="text-[12px] text-slate-500">
            Review, reconcile, approve, and publish evidence linked Team Personas before enterprise reuse
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex rounded-md border border-slate-200 bg-white p-0.5" role="tablist" aria-label="View selector">
            {views.map((v) => (
              <button key={v.id} role="tab" aria-selected={prefs.view === v.id} type="button"
                onClick={() => { setPref("view", v.id); say(`${v.label} view selected`); }}
                className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  prefs.view === v.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
                {v.label}
              </button>
            ))}
          </div>
          <Pill label={serviceState} tone={serviceState === "Operational" ? "green" : serviceState === "Degraded" || serviceState === "Conflict Detected" ? "red" : "amber"} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setSearchOpen(true)}>
            <SearchIcon className="mr-1 h-3.5 w-3.5" aria-hidden /> Search
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { setLoading(true); setError(false); setTimeout(() => { setLoading(false); toast.success("Validation state refreshed"); say("Validation state refreshed"); }, 300); }}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden /> Refresh
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => openReview(filtered[0] ?? reviews[0])}>Open Next Review</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => setStartOpen(true)}>Start Validation</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setVersionOpen(true)}>Compare Persona</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setExportOpen(true)}>Export Validation Report</Button>
          <Button size="sm" variant="outline" className="relative h-7 text-[11px]" onClick={() => setNotifOpen(true)} aria-label={`Notifications, ${unread} unread`}>
            <Bell className="h-3.5 w-3.5" aria-hidden />
            {unread > 0 && <span className="ml-1 rounded bg-red-600 px-1 text-[9.5px] font-semibold text-white">{unread}</span>}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-[11px]">More</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[420px] w-64 overflow-y-auto">
              <DropdownMenuLabel>Demo Story</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => { setStoryOn(true); setStoryStep(0); runStoryStep(0); }}>Start Demo Story</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setApprovalOpen(true)}>Approve Persona</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setVersionOpen(true)}>Version Validation</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Demo Scenarios</DropdownMenuLabel>
              {validationScenarios.map((s) => (
                <DropdownMenuItem key={s.id} onSelect={() => applyScenario(s.id)}>{s.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {scenarioId !== "healthy" && (
        <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11.5px] text-blue-900">
          <strong>{scenario.label}</strong> — {scenario.banner}
        </div>
      )}

      {storyOn && (
        <div className="mt-2 rounded-lg border border-slate-300 bg-slate-900 px-3 py-2 text-white">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12px]">{validationStory[storyStep].caption}</p>
            <div className="flex items-center gap-1">
              <span className="text-[10.5px] text-slate-300">Step {storyStep + 1} of {validationStory.length}</span>
              <Button size="sm" variant="secondary" className="h-6 text-[10.5px]" disabled={storyStep === 0}
                onClick={() => { const n = storyStep - 1; setStoryStep(n); runStoryStep(n); }}>Previous</Button>
              <Button size="sm" variant="secondary" className="h-6 text-[10.5px]" disabled={storyStep === validationStory.length - 1}
                onClick={() => { const n = storyStep + 1; setStoryStep(n); runStoryStep(n); }}>Next</Button>
              <Button size="sm" variant="destructive" className="h-6 text-[10.5px]" onClick={() => setStoryOn(false)}>Exit Story</Button>
            </div>
          </div>
          <p className="mt-1 text-[10.5px] text-slate-300">Presenter notes: {validationStory[storyStep].notes}</p>
        </div>
      )}

      {/* Filters */}
      <section aria-label="Global filters" className="mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => setPref("filtersOpen", !prefs.filtersOpen)} aria-expanded={prefs.filtersOpen}
            className="flex items-center gap-1.5 rounded border border-slate-200 px-2 py-1 text-[11.5px] text-slate-700 hover:border-blue-300">
            <Filter className="h-3.5 w-3.5" aria-hidden /> Filters
            {filterCount > 0 && <span className="rounded bg-blue-600 px-1 text-[10px] font-semibold text-white">{filterCount}</span>}
          </button>
          <span className="text-[11px] text-slate-500">{filtered.length} of {reviews.length} reviews shown</span>
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { toast.success("Filters applied"); say(`${filtered.length} reviews match the current filters`); }}>Apply Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setPref("filters", defaultValidationFilters); setSearch(""); say("Filters cleared"); }}>Clear Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]"
              onClick={() => { const name = `View ${savedViews.length + 1}`; setSavedViews([...savedViews, name]); setPref("savedView", name); toast.success("View saved", { description: name }); }}>
              Save View
            </Button>
          </div>
        </div>
        {prefs.filtersOpen && (
          <div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-7">
            {(Object.keys(defaultValidationFilters) as (keyof ValidationFilters)[]).map((key) => (
              <FilterSelect key={key} label={validationFilterLabels[key]} value={prefs.filters[key]}
                options={validationFilterOptions[key]}
                onChange={(v) => setPref("filters", { ...prefs.filters, [key]: v })} />
            ))}
          </div>
        )}
      </section>

      {/* KPI row */}
      <section id="panel-kpis" aria-label="Validation indicators"
        className={cn("mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6", spotlight("kpis") && "rounded-xl ring-2 ring-blue-500 ring-offset-2")}>
        {validationKpis.map((k) => (
          <ValidationKpiCard key={k.id} kpi={k} valueOverride={kpiValue(k.id)} spotlight={kpiFocus === k.id} onClick={() => onKpi(k.id)} />
        ))}
      </section>

      <div className="mt-2 space-y-2">
        <LifecyclePanel selected={prefs.selectedStage} onSelect={(id) => { setPref("selectedStage", id); say(`${validationStages.find((s) => s.id === id)?.name} stage selected`); }}
          focus={focus} onFocus={setFocus} spotlight={spotlight("lifecycle")} />

        <SelectedStagePanel stage={stage} reviews={filtered} onOpenReview={openReview} />

        {prefs.view === "portfolio-risk" && <PortfolioRiskPanel rows={filtered} />}

        <ValidationQueuePanel
          rows={filtered} view={prefs.view} density={prefs.density} onDensity={(d) => setPref("density", d)}
          selected={selected} onToggle={(id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; })}
          onToggleAll={() => setSelected((s) => (s.size === filtered.length ? new Set() : new Set(filtered.map((r) => r.id))))}
          onOpen={openReview} search={search} onSearch={setSearch}
          hiddenColumns={new Set(prefs.hiddenColumns)}
          onToggleColumn={(k) => setPref("hiddenColumns", prefs.hiddenColumns.includes(k) ? prefs.hiddenColumns.filter((x) => x !== k) : [...prefs.hiddenColumns, k])}
          onExport={exportCurrentView} savedViews={savedViews} savedView={prefs.savedView}
          onSavedView={(v) => setPref("savedView", v)}
          onSaveView={() => { const name = `View ${savedViews.length + 1}`; setSavedViews([...savedViews, name]); setPref("savedView", name); }}
          onBulk={() => setBulkOpen(true)} loading={loading} error={error}
          onRetry={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 250); }}
        />

        <ValidationWorkbench
          state={workbench}
          onState={(s) => { setWorkbench(s); setPref("workbenchSection", s.sectionId); }}
          onDecision={(action, detail) => { logActivity(action, detail); toast.success(action, { description: detail }); }}
          onAnnounce={say}
          spotlight={spotlight("workbench")}
          highlightConflict={storyOn && storyStep === 3}
        />

        <SectionMatrixPanel onCell={(sectionId, issue) => {
          setWorkbench((w) => ({ ...w, sectionId }));
          document.getElementById("panel-workbench")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
          say(`Workbench focused on ${sectionId}, ${issue}`);
        }} />

        <ConflictPanel conflicts={conflicts} activeType={conflictType} onType={setConflictType}
          spotlight={spotlight("conflicts")}
          onAction={(action, c) => {
            if (action === "Open Comparison") { setActiveConflict(c); setConflictOpen(true); }
            else { toast.success(action, { description: `${c.persona} · ${c.conflictType}` }); say(`${action} for ${c.id}`); }
          }} />

        <GapPanel gaps={gaps} activeType={gapType} onType={setGapType}
          onAction={(action, g) => {
            setResolvedGaps((s) => ({ ...s, [g.id]: action === "Accept Known Gap" ? "Accepted" : "Resolved" }));
            logActivity(action, `${g.persona} · ${g.gapType}`, g.persona);
            toast.success(action, { description: `${g.persona} · ${g.section}` });
            say(`${action} recorded for gap ${g.id}`);
          }} />

        <EvidenceValidationPanel
          onRow={(sectionId) => { setWorkbench((w) => ({ ...w, sectionId })); say(`Evidence opened for ${sectionId}`); }}
          onAction={(action, id) => { toast.success(action, { description: id }); say(`${action} recorded for evidence ${id}`); }} />

        <DependencyPanel states={dependencyStates} spotlight={spotlight("dependencies")}
          onAction={(action, id) => {
            const next = action === "Approve Relationship" ? "Approved" : action === "Reject Relationship" ? "Rejected" : "Pending";
            setDependencyStates((s) => ({ ...s, [id]: next }));
            logActivity(action, `Dependency ${id} ${next.toLowerCase()}`);
            toast.success(action, { description: `Dependency ${id}` });
            say(`${action} recorded for dependency ${id}`);
          }} />

        <ThinkingPanel states={thinkingStates} spotlight={spotlight("thinking")}
          onAction={(action, id) => {
            if (action === "Approve Section") setThinkingStates((s) => ({ ...s, [id]: "Approved" }));
            if (action === "Request Evidence") setThinkingStates((s) => ({ ...s, [id]: "Evidence Required" }));
            if (action === "Request Team Confirmation") setThinkingStates((s) => ({ ...s, [id]: "In Review" }));
            logActivity(action, `How This Team Thinks · ${id}`);
            toast.success(action, { description: id });
            say(`${action} recorded for ${id}`);
          }} />

        <ApprovalChainPanel overrides={approvalOverrides} spotlight={spotlight("approval")}
          onAction={(action, s) => {
            if (action === "Approve") { setApprovalOpen(true); return; }
            setApprovalOverrides((o) => ({ ...o, [s.id]: action === "Request Changes" ? "Changes Requested" : "Pending" }));
            toast.success(action, { description: s.name });
            say(`${action} recorded for ${s.name}`);
          }} />

        <QualityPanel overall={kpiValue("kpi-quality") ?? "91 / 100"} onMetric={(m) => { setQualityMetric(m); setQualityOpen(true); }} />

        <DownstreamPanel note={scenario.downstreamOverride} spotlight={spotlight("downstream")}
          onConsumer={(c) => { toast.info(c, { description: "Consumer awaiting approved Persona context." }); say(`${c} downstream detail opened`); }} />

        <div className="grid gap-2 xl:grid-cols-2">
          <HistoryPanel />
          <ActivityPanel activity={scenario.extraActivity ? [scenario.extraActivity, ...activity] : activity}
            onOpen={(a) => {
              const r = reviews.find((x) => x.id === a.reviewId);
              if (r) openReview(r); else say("Related review is not in the current filter set");
            }} />
        </div>
      </div>

      {/* Dialogs and drawers */}
      <ReviewDrawer open={reviewOpen} onOpenChange={setReviewOpen} review={activeReview}
        onAction={(action) => {
          if (action === "Open Workbench") {
            setReviewOpen(false);
            document.getElementById("panel-workbench")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
          } else if (["Approve", "Approve with Conditions", "Reject", "Request Changes"].includes(action)) {
            setApprovalOpen(true);
          } else {
            toast.success(action, { description: activeReview?.id });
          }
          say(`${action} selected for ${activeReview?.id}`);
        }} />

      <QualityDrawer open={qualityOpen} onOpenChange={setQualityOpen} metric={qualityMetric} />

      <ConflictResolutionDialog open={conflictOpen} onOpenChange={setConflictOpen} conflict={activeConflict}
        onResolve={(choice, reason) => {
          if (!activeConflict) return;
          setResolvedConflicts((s) => ({ ...s, [activeConflict.id]: "Resolved" }));
          if (activeConflict.sectionId === "approval-requirements") {
            setWorkbench((w) => ({ ...w, authoritative: activeConflict.recordAId, excluded: [activeConflict.recordBId] }));
          }
          logActivity("Conflict resolved", `${activeConflict.id}: ${choice}. ${reason}`);
          toast.success("Conflict resolved", { description: `${activeConflict.id} · ${choice}` });
          say(`Conflict ${activeConflict.id} resolved using ${choice}. Persona, quality and downstream impact updated.`);
        }} />

      <ApprovalDialog open={approvalOpen} onOpenChange={setApprovalOpen}
        onDecision={(decision, comments) => {
          const next = decision === "Approve" ? "Complete"
            : decision === "Approve with Conditions" ? "Approved with Conditions"
              : decision === "Reject" ? "Rejected" : "Pending";
          setApprovalOverrides((o) => ({ ...o, "ap-3": next, ...(decision === "Approve" ? { "ap-7": "Complete" } : {}) }));
          logActivity(`Persona ${decision}`, comments || "No comments");
          toast.success(`Persona ${decision}`, { description: "Approval chain and downstream readiness updated." });
          say(`Persona ${decision}. Approval chain and downstream readiness updated.`);
        }} />

      <VersionDialog open={versionOpen} onOpenChange={setVersionOpen}
        onAction={(action, row) => { toast.success(action, { description: row?.section ?? "Payments Platform v3.4 Draft" }); say(`${action} recorded`); }} />

      <StartValidationDialog open={startOpen} onOpenChange={setStartOpen}
        onComplete={(summary) => {
          toast.success("Validation run complete", { description: summary });
          logActivity("Validation run", summary);
          document.getElementById("panel-queue")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
          say(summary);
        }} />

      <BulkActionsDialog open={bulkOpen} onOpenChange={setBulkOpen} count={selected.size}
        onApply={(action) => {
          logActivity(`Bulk ${action}`, `${selected.size} reviews`);
          toast.success(`Bulk action applied: ${action}`, { description: `${selected.size} reviews` });
          say(`Bulk action ${action} applied to ${selected.size} reviews`);
          setSelected(new Set());
        }} />

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} onExport={runExport} />

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen}
        onOpenResult={(r: SearchResultRow) => {
          const review = reviews.find((x) => x.id === r.reviewId);
          if (review) openReview(review);
          else { document.getElementById("panel-conflicts")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" }); say(`${r.type} ${r.reviewId} opened`); }
        }} />

      <NotificationsDrawer open={notifOpen} onOpenChange={setNotifOpen} notifications={notifications}
        onMarkAll={() => { setNotifications((n) => n.map((x) => ({ ...x, read: true }))); say("All notifications marked read"); }}
        onMark={(id) => setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)))}
        onOpenItem={(n) => {
          setNotifOpen(false);
          const review = reviews.find((r) => n.title.includes(r.persona));
          if (review) openReview(review);
          say(`${n.title} opened`);
        }} />
    </div>
  );
}
