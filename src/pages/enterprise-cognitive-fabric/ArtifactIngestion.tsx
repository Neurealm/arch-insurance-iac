import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Bell, CircleHelp, Download, Pause, Play, RefreshCw, Search, SlidersHorizontal, UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import {
  AccessPanel, ActivityPanel, ArtifactEvidenceDrawer, ArtifactQueuePanel, BatchDetailDrawer,
  BatchTablePanel, CompositionPanel, DownstreamImpactPanel, DuplicatePanel, EvidencePanel,
  ExceptionPanel, FilterSelect, LifecyclePanel, ProvenancePanel, QualityDetailDrawer, QualityPanel,
  ReadinessPanel, StageDetailPanel, StatusText, ThroughputPanel, artifactsToCsv, batchesToCsv,
  download, nf, viewColumns, type Density,
} from "./artifact-ingestion/panels";
import {
  ConfirmDialog, ExportDialog, PauseIntakeDialog, RetryDialog, SearchDialog,
  StartIngestionDialog, UploadArtifactsDialog,
} from "./artifact-ingestion/dialogs";
import {
  activeFilterCount, defaultFilters, demoScenarios, filterLabels, filterOptions, kpiTrends,
  makeDiscoveryBatch, makeManualArtifact, makeManualBatch, readiness as seedReadiness,
  resolveActivity, resolveArtifacts, resolveBatches, resolveExceptions, resolveStages,
  scenarioSnapshots, searchCatalog, seedNotifications, sidebarStatus, type ArtifactRecord, type DemoScenario,
  type Filters, type IngestionActivity, type IngestionBatch, type IngestionException,
  type ThroughputMetric, type ViewMode,
} from "./artifact-ingestion/data";

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: "executive", label: "Executive" },
  { id: "operations", label: "Operations" },
  { id: "governance", label: "Governance" },
  { id: "evidence", label: "Evidence" },
];

const STORY = [
  { panel: "panel-kpis", caption: "Approved enterprise sources continuously contribute original artifacts to the Enterprise Cognitive Fabric.", notes: "Start with volume and active batches. Every artifact arrives through an approved connector or an authorized manual submission." },
  { panel: "panel-lifecycle", caption: "Each artifact is authenticated, preserved, inventoried, classified, versioned, checked for duplicates, validated, and registered as evidence.", notes: "Nine stages. Nothing is modified. Permission preservation and validation are the current bottlenecks." },
  { panel: "panel-queue", caption: "The original artifact remains unchanged while its ownership, permissions, version, source, content hash, and provenance are preserved.", notes: "Open an artifact to show the evidence record, hash, and immutable evidence identifier." },
  { panel: "panel-duplicates", caption: "The Fabric determines whether information is new, revised, duplicated, conflicting, or historical before downstream analysis begins.", notes: "Point out the authority conflict between the SLO notes and the authoritative requirements." },
  { panel: "panel-access", caption: "Source permissions and security classifications are preserved so agents can use knowledge only within approved boundaries.", notes: "418 permission reviews are pending. Nothing proceeds until access is validated." },
  { panel: "panel-exceptions", caption: "Unreadable, unsupported, stale, restricted, incomplete, or conflicting artifacts are stopped before they influence Team Personas or decisions.", notes: "This is the trust boundary of the platform." },
  { panel: "panel-readiness", caption: "Only qualified artifacts move forward to normalization, where their content becomes consistently machine readable.", notes: "Close by proceeding to Artifact Normalization." },
];

function Kpi({ label, value, sub, trend, tone = "slate", onClick, tooltip }: {
  label: string; value: string; sub: string; trend: number[];
  tone?: "green" | "amber" | "red" | "slate"; onClick: () => void; tooltip: string;
}) {
  const max = Math.max(...trend, 1); const min = Math.min(...trend);
  const points = trend.map((v, i) => `${(i / Math.max(1, trend.length - 1)) * 100},${28 - ((v - min) / Math.max(0.001, max - min)) * 24}`).join(" ");
  return (
    <button type="button" onClick={onClick} title={tooltip}
      className="rounded-xl border border-slate-200 bg-white p-2.5 text-left shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50">
      <p className="text-[10.5px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn("mt-0.5 text-[22px] font-semibold leading-none",
        tone === "green" ? "text-emerald-700" : tone === "amber" ? "text-amber-700" : tone === "red" ? "text-red-700" : "text-slate-900")}>{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>
      <svg viewBox="0 0 100 30" className="mt-1 h-7 w-full" preserveAspectRatio="none" aria-hidden>
        <polyline points={points} fill="none" stroke="#94a3b8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </button>
  );
}

export default function ArtifactIngestion() {
  const navigate = useNavigate();

  /* persisted preferences */
  const [view, setView] = useState<ViewMode>(() =>
    (typeof window !== "undefined" && (localStorage.getItem("ecf.ingestion.view") as ViewMode)) || "executive");
  const [density, setDensity] = useState<Density>(() =>
    (typeof window !== "undefined" && (localStorage.getItem("ecf.ingestion.density") as Density)) || "compact");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(defaultFilters);

  useEffect(() => { localStorage.setItem("ecf.ingestion.view", view); }, [view]);
  useEffect(() => { localStorage.setItem("ecf.ingestion.density", density); }, [density]);

  /* local operational state */
  const [scenario, setScenario] = useState<DemoScenario>("healthy");
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [stageId, setStageId] = useState("duplicate");
  const [focusBottlenecks, setFocusBottlenecks] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [metric, setMetric] = useState<ThroughputMetric>("Throughput");
  const [range, setRange] = useState("Last hour");
  const [batchColumns, setBatchColumns] = useState<string[]>([
    "Batch ID", "Source", "Category", "Ingestion Method", "Status", "Artifacts", "Current Stage",
    "Started", "Elapsed Time", "Success Rate", "Queue", "Owner", "Warnings",
  ]);
  const [artifactColumns, setArtifactColumns] = useState<string[]>(viewColumns.executive);
  useEffect(() => { setArtifactColumns(viewColumns[view]); }, [view]);

  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedArtifacts, setSelectedArtifacts] = useState<string[]>([]);
  const [batchOverrides, setBatchOverrides] = useState<Record<string, Partial<IngestionBatch>>>({});
  const [artifactOverrides, setArtifactOverrides] = useState<Record<string, Partial<ArtifactRecord>>>({});
  const [extraBatches, setExtraBatches] = useState<IngestionBatch[]>([]);
  const [extraArtifacts, setExtraArtifacts] = useState<ArtifactRecord[]>([]);
  const [extraActivity, setExtraActivity] = useState<IngestionActivity[]>([]);
  const [exceptionStatuses, setExceptionStatuses] = useState<Record<string, string>>({});
  const [duplicateDecisions, setDuplicateDecisions] = useState<Record<string, string>>({});
  const [permissionStates, setPermissionStates] = useState<Record<string, string>>({});
  const [exceptionCategory, setExceptionCategory] = useState("All");
  const [notifications, setNotifications] = useState(() => seedNotifications.map((n) => ({ ...n })));

  /* dialogs and drawers */
  const [startOpen, setStartOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [batchDrawer, setBatchDrawer] = useState<IngestionBatch | null>(null);
  const [artifactDrawer, setArtifactDrawer] = useState<ArtifactRecord | null>(null);
  const [qualityDrawer, setQualityDrawer] = useState<string | null>(null);
  const [activityDrawer, setActivityDrawer] = useState<IngestionActivity | null>(null);
  const [retryContext, setRetryContext] = useState<{ origin: string; label: string; affected: number; reason: string; retryable: boolean; attempts: number } | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; description: string; confirmLabel: string; onConfirm: (reason: string) => void; requireReason?: boolean } | null>(null);

  /* demo story */
  const [story, setStory] = useState(-1);
  const [presenterNotes, setPresenterNotes] = useState(false);

  const snap = scenarioSnapshots[scenario];
  const stages = useMemo(() => resolveStages(scenario, {}), [scenario]);
  const stage = stages.find((s) => s.id === stageId) ?? stages[0];
  const batches = useMemo(() => resolveBatches(scenario, filters, batchOverrides, extraBatches), [scenario, filters, batchOverrides, extraBatches]);
  const artifacts = useMemo(() => resolveArtifacts(scenario, filters, artifactOverrides, extraArtifacts), [scenario, filters, artifactOverrides, extraArtifacts]);
  const activity = useMemo(() => resolveActivity(scenario, extraActivity), [scenario, extraActivity]);
  const allExceptions = useMemo(() => resolveExceptions(scenario, exceptionStatuses), [scenario, exceptionStatuses]);
  const exceptionRows = useMemo<IngestionException[]>(
    () => (exceptionCategory === "All" ? allExceptions : allExceptions.filter((e) => e.exceptionType === exceptionCategory)),
    [allExceptions, exceptionCategory]);

  const readiness = useMemo(() => ({
    ...seedReadiness,
    humanReviewCount: snap.requiringAction,
    permissionBlockedCount: snap.permissionReview,
    quarantinedCount: snap.quarantined,
    unsupportedCount: snap.unsupported,
    duplicateReviewCount: snap.duplicateReview,
  }), [snap]);

  const unread = notifications.filter((n) => !n.read).length;
  const filterCount = activeFilterCount(filters);
  const ingestionState = paused ? "Paused" : snap.ingestionState;

  const focusPanel = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }, []);

  useEffect(() => { if (snap.focusPanel) focusPanel(snap.focusPanel); }, [snap.focusPanel, focusPanel]);

  const announce = (message: string) => toast.success(message);

  const refresh = () => {
    setLoading(true);
    window.setTimeout(() => { setLoading(false); announce("Ingestion data refreshed."); }, 600);
  };

  const logActivity = (action: string, description: string, result: string, extra?: Partial<IngestionActivity>) => {
    setExtraActivity((p) => [{
      id: `ACT-L${p.length + 1}`, timestamp: "just now", action, description, artifactId: null, batchId: null,
      sourceId: "SRC-LOCAL", sourceName: "Artifact Ingestion", teamName: "Ingestion Operations",
      result, owner: "Alex Valencia", auditId: `AUD-L${5000 + p.length}`, ...extra,
    }, ...p]);
  };

  /* ----------------------------- action handlers ---------------------------- */

  const openRetry = (ctx: { origin: string; label: string; affected: number; reason: string; retryable: boolean; attempts: number }) => setRetryContext(ctx);

  const artifactAction = (action: string, a: ArtifactRecord) => {
    switch (action) {
      case "Approve for Normalization":
        setArtifactOverrides((p) => ({ ...p, [a.id]: { ...p[a.id], ingestionStatus: "Ready for Normalization", normalizationQueueId: "NRM-9001" } }));
        logActivity("Approved for normalization", `${a.title} approved for normalization.`, "Success", { artifactId: a.id });
        announce(`${a.title} approved for normalization.`);
        break;
      case "Quarantine":
        setArtifactOverrides((p) => ({ ...p, [a.id]: { ...p[a.id], ingestionStatus: "Quarantined", normalizationQueueId: null } }));
        logActivity("Quarantined", `${a.title} quarantined pending review.`, "Warning", { artifactId: a.id });
        announce(`${a.title} quarantined.`);
        break;
      case "Retry":
        openRetry({ origin: "Artifact", label: a.title, affected: 1, reason: a.permissionStatus, retryable: true, attempts: 1 });
        break;
      case "Request Augmentation":
        setArtifactOverrides((p) => ({ ...p, [a.id]: { ...p[a.id], ingestionStatus: "Review Required" } }));
        announce(`Augmentation requested for ${a.title}.`);
        break;
      case "Mark Duplicate":
        setArtifactOverrides((p) => ({ ...p, [a.id]: { ...p[a.id], duplicateStatus: "Exact Duplicate", ingestionStatus: "Review Required" } }));
        announce(`${a.title} marked as a duplicate.`);
        break;
      case "Merge Evidence Family":
        announce(`Evidence family merged for ${a.title}. Prior versions retained for lineage.`);
        break;
      case "Export Evidence Record":
        download(`${a.id}-evidence.json`, JSON.stringify(a, null, 2), "application/json");
        announce("Evidence record exported.");
        break;
      default:
        announce(`${action} recorded for ${a.title}.`);
    }
  };

  const batchAction = (action: string, b: IngestionBatch) => {
    if (action === "Retry Failed" || action === "Restart from Stage") {
      openRetry({ origin: "Batch", label: b.id, affected: b.failedCount || b.pendingCount, reason: `${b.currentStageName} failures`, retryable: b.status !== "Blocked" || true, attempts: 1 });
      return;
    }
    const status = action === "Pause Batch" ? "Paused" : action === "Resume Batch" ? "Running" : action === "Cancel Batch" ? "Cancelled" : null;
    if (status) setBatchOverrides((p) => ({ ...p, [b.id]: { ...p[b.id], status: status as IngestionBatch["status"] } }));
    if (action === "Export Batch Report") download(`${b.id}-report.csv`, batchesToCsv([b]), "text/csv");
    if (action === "Open Source Registry") navigate("/enterprise-cognitive-fabric/discovery/source-registry");
    logActivity(action, `${action} on batch ${b.id}.`, status === "Cancelled" ? "Warning" : "Success", { batchId: b.id });
    announce(`${action} applied to ${b.id}.`);
  };

  const exceptionAction = (e: IngestionException, action: string) => {
    if (action === "Open Artifact") {
      const target = artifacts.find((a) => a.id === e.artifactId);
      if (target) setArtifactDrawer(target);
      return;
    }
    if (action === "Retry") {
      openRetry({ origin: "Exception", label: e.artifactTitle, affected: 1, reason: e.description, retryable: e.exceptionType !== "Policy Violation", attempts: 2 });
      return;
    }
    const map: Record<string, string> = {
      Acknowledge: "Acknowledged", Assign: "Investigating", "Release from Quarantine": "Resolved",
      Reject: "Rejected", "Validate Permission": "Resolved", "Apply Classification": "Resolved",
      "Correct Metadata": "Resolved", "Request Augmentation": "Investigating",
      "Create Review Task": "Investigating", "Create Incident": "Investigating",
    };
    if (map[action]) setExceptionStatuses((p) => ({ ...p, [e.id]: map[action] }));
    if (action === "Release from Quarantine" && e.artifactId) {
      setArtifactOverrides((p) => ({ ...p, [e.artifactId]: { ...p[e.artifactId], ingestionStatus: "Ready for Normalization" } }));
    }
    logActivity(action, `${action} on ${e.artifactTitle}.`, action === "Reject" ? "Warning" : "Success", { artifactId: e.artifactId });
    announce(`${action} applied to ${e.artifactTitle}.`);
  };

  const duplicateDecision = (id: string, action: string) => {
    const map: Record<string, string> = {
      "Confirm Version": "Confirmed", "Mark Duplicate": "Duplicate", "Mark Related": "Related",
      "Keep Both": "Resolved", "Merge Family": "Merged", "Request Review": "Human Review",
    };
    setDuplicateDecisions((p) => ({ ...p, [id]: map[action] ?? action }));
    logActivity(action, `Duplicate candidate ${id} resolved as ${map[action] ?? action}.`, "Success");
    announce(`${action} recorded for ${id}.`);
  };

  const permissionAction = (artifactId: string, action: string) => {
    setPermissionStates((p) => ({ ...p, [artifactId]: "Resolved" }));
    setArtifactOverrides((p) => ({ ...p, [artifactId]: { ...p[artifactId], permissionStatus: "Preserved", ingestionStatus: "Ready for Normalization" } }));
    logActivity(action, `${action} completed for ${artifactId}.`, "Success", { artifactId });
    announce(`${action} completed for ${artifactId}.`);
  };

  const proceedToNormalization = () => navigate("/enterprise-cognitive-fabric/discovery/artifact-normalization");

  /* -------------------------------- render --------------------------------- */

  const spotlight = (id: string) => story >= 0 && STORY[story].panel === id;

  return (
    <div className="space-y-3 pb-10">
      {/* header */}
      <header className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1 text-[11px] text-slate-500">
                <li>Enterprise Cognitive Fabric</li><li aria-hidden>/</li><li>Discovery</li><li aria-hidden>/</li>
                <li className="font-medium text-slate-700">Artifact Ingestion</li>
              </ol>
            </nav>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h1 className="text-[19px] font-semibold text-slate-900">Artifact Ingestion</h1>
              <StatusText status={ingestionState} />
              {filterCount > 0 && <Badge variant="secondary" className="text-[10.5px]">{filterCount} filters active</Badge>}
            </div>
            <p className="mt-0.5 text-[12px] text-slate-600">
              Securely collect, preserve, inventory, classify, and prepare enterprise artifacts for normalization
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => setSearchOpen(true)}>
              <Search className="mr-1 h-3.5 w-3.5" aria-hidden />Search
            </Button>
            <Button size="sm" variant="outline" className="relative h-7 text-[11.5px]" onClick={() => setNotifOpen(true)} aria-label={`Notifications, ${unread} unread`}>
              <Bell className="mr-1 h-3.5 w-3.5" aria-hidden />Notifications
              {unread > 0 && <span className="ml-1 rounded-full bg-red-600 px-1.5 text-[10px] font-semibold text-white">{unread}</span>}
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => setHelpOpen(true)} aria-label="Help">
              <CircleHelp className="h-3.5 w-3.5" aria-hidden />
            </Button>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-white" aria-hidden>AV</span>
              <span className="leading-tight">
                <span className="block text-[11.5px] font-medium text-slate-800">Alex Valencia</span>
                <span className="block text-[10.5px] text-slate-500">Chief Architect</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2">
          <div className="flex rounded-lg border border-slate-200 p-0.5" role="tablist" aria-label="View selector">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" role="tab" aria-selected={view === v.id} onClick={() => setView(v.id)}
                className={cn("rounded px-2 py-1 text-[11.5px] transition-colors",
                  view === v.id ? "bg-slate-900 font-medium text-white" : "text-slate-600 hover:bg-slate-100")}>
                {v.label}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => { setDraft(filters); setFiltersOpen(true); }}>
            <SlidersHorizontal className="mr-1 h-3.5 w-3.5" aria-hidden />Filters{filterCount > 0 ? ` (${filterCount})` : ""}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={refresh}><RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden />Refresh</Button>
          <Button size="sm" className="h-7 text-[11.5px]" onClick={() => setStartOpen(true)}>Start Ingestion</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => setUploadOpen(true)}>
            <UploadCloud className="mr-1 h-3.5 w-3.5" aria-hidden />Upload Artifacts
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => setPauseOpen(true)}>
            {paused ? <Play className="mr-1 h-3.5 w-3.5" aria-hidden /> : <Pause className="mr-1 h-3.5 w-3.5" aria-hidden />}
            {paused ? "Resume Intake" : "Pause Intake"}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => setExportOpen(true)}>
            <Download className="mr-1 h-3.5 w-3.5" aria-hidden />Export Ingestion Report
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-7 text-[11.5px]">More</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-96 w-64 overflow-auto">
              <DropdownMenuItem className="text-[11.5px]" onSelect={() => { setStory(0); focusPanel(STORY[0].panel); }}>Demo Story</DropdownMenuItem>
              <DropdownMenuItem className="text-[11.5px]" onSelect={() => setPresenterNotes((p) => !p)}>{presenterNotes ? "Hide" : "Show"} presenter notes</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px]">Demo scenarios</DropdownMenuLabel>
              {demoScenarios.map((s) => (
                <DropdownMenuItem key={s.id} className="text-[11.5px]" onSelect={() => {
                  setScenario(s.id === "reset" ? "healthy" : s.id);
                  if (s.id === "reset") {
                    setBatchOverrides({}); setArtifactOverrides({}); setExtraBatches([]); setExtraArtifacts([]);
                    setExtraActivity([]); setExceptionStatuses({}); setDuplicateDecisions({}); setPermissionStates({});
                    setPaused(false); setFilters(defaultFilters);
                  }
                  if (s.id === "paused") setPaused(true);
                  announce(`Scenario applied: ${s.label}.`);
                }}>{s.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {snap.banner && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11.5px] text-amber-800" role="status">{snap.banner}</p>
        )}
      </header>

      {/* filters drawer */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-[15px]">Filters</SheetTitle>
            <SheetDescription className="text-[12px]">Filters apply to KPI cards, batches, artifacts, charts, exceptions, readiness, and activity.</SheetDescription>
          </SheetHeader>
          <div className="mt-3 space-y-2">
            {(Object.keys(defaultFilters) as (keyof Filters)[]).map((k) => (
              <div key={k} className="flex items-center justify-between gap-2">
                <span className="text-[11.5px] text-slate-600">{filterLabels[k]}</span>
                <FilterSelect label={filterLabels[k]} value={draft[k]} options={filterOptions[k]}
                  onChange={(v) => setDraft((p) => ({ ...p, [k]: v }))} className="w-48" />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-1.5">
            <Button size="sm" className="h-7 text-[11.5px]" onClick={() => { setFilters(draft); setFiltersOpen(false); announce("Filters applied."); }}>Apply Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => { setDraft(defaultFilters); setFilters(defaultFilters); announce("Filters cleared."); }}>Clear Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => { localStorage.setItem("ecf.ingestion.savedView", JSON.stringify(draft)); announce("View saved."); }}>Save View</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* KPI cards */}
      <section id="panel-kpis" className={cn("grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
        spotlight("panel-kpis") && "rounded-xl ring-2 ring-blue-500 ring-offset-2")} aria-label="Ingestion key performance indicators">
        <Kpi label="Artifacts Received" value={snap.artifactsReceived} sub={snap.artifactsReceivedChange} trend={kpiTrends.received}
          tooltip="Total artifacts received from approved sources and authorized manual submissions." onClick={() => focusPanel("panel-composition")} />
        <Kpi label="Active Ingestion Batches" value={String(snap.activeBatches)}
          sub={`${snap.batchesHealthy} healthy · ${snap.batchesWarning} warning · ${snap.batchesBlocked} blocked`} trend={kpiTrends.batches}
          tooltip="Batches currently moving artifacts through the ingestion lifecycle." onClick={() => focusPanel("panel-batches")} />
        <Kpi label="Artifacts in Queue" value={nf(snap.queueDepth)} sub={`${snap.queueChange} · ${snap.queueStatus}`} trend={kpiTrends.queue}
          tone={snap.queueStatus === "Within Capacity" ? "slate" : "amber"}
          tooltip="Artifacts waiting to be processed across the ingestion lifecycle." onClick={() => focusPanel("panel-throughput")} />
        <Kpi label="Ingestion Success Rate" value={`${snap.successRate}%`} sub="Target 98% · Healthy" trend={kpiTrends.success}
          tone={snap.successRate >= 98 ? "green" : "amber"}
          tooltip="Share of artifacts completing the lifecycle without failure." onClick={() => focusPanel("panel-quality")} />
        <Kpi label="Ready for Normalization" value={snap.readyLabel} sub={`${snap.readyPercent}% of received artifacts`} trend={kpiTrends.ready} tone="green"
          tooltip="Artifacts validated, registered as evidence, and queued for normalization." onClick={() => focusPanel("panel-readiness")} />
        <Kpi label="Artifacts Requiring Action" value={nf(snap.requiringAction)}
          sub={`${nf(snap.quarantined)} quarantined · ${nf(snap.duplicateReview)} duplicate · ${nf(snap.permissionReview)} permission · ${nf(snap.unsupported)} unsupported`}
          trend={kpiTrends.action} tone="amber"
          tooltip="Artifacts stopped pending human review, permission validation, or remediation." onClick={() => focusPanel("panel-exceptions")} />
      </section>

      <LifecyclePanel stages={stages} selectedId={stageId} onSelect={setStageId} loading={loading}
        focusBottlenecks={focusBottlenecks} onToggleBottlenecks={() => setFocusBottlenecks((p) => !p)}
        showBlocked={showBlocked} onToggleBlocked={() => setShowBlocked((p) => !p)}
        spotlight={spotlight("panel-lifecycle")} paused={paused} />

      <StageDetailPanel stage={stage} artifacts={artifacts} exceptions={allExceptions}
        onAction={(action) => {
          if (action === "Retry Failures") openRetry({ origin: "Stage", label: stage.name, affected: stage.failedCount * 84, reason: stage.bottleneck ?? "Stage failures", retryable: true, attempts: 1 });
          else announce(`${action} applied to ${stage.name}.`);
        }} />

      <BatchTablePanel batches={batches} loading={loading} onOpen={setBatchDrawer} selected={selectedBatches}
        onSelect={setSelectedBatches} density={density} onDensity={setDensity} columns={batchColumns}
        onColumns={setBatchColumns} onExport={() => { download("ingestion-batches.csv", batchesToCsv(batches), "text/csv"); announce("Batch view exported."); }}
        onBulk={(a) => { announce(`${a} applied to ${selectedBatches.length} batches.`); setSelectedBatches([]); }}
        view={view} highlight={snap.highlightBatchIds} spotlight={spotlight("panel-batches")} paused={paused}
        onStart={() => setStartOpen(true)} />

      <ArtifactQueuePanel artifacts={artifacts} loading={loading} onOpen={setArtifactDrawer} density={density}
        onDensity={setDensity} columns={artifactColumns} onColumns={setArtifactColumns}
        onBulk={(a) => {
          if (a === "Export Selected") download("artifacts.csv", artifactsToCsv(artifacts.filter((x) => selectedArtifacts.includes(x.id))), "text/csv");
          else selectedArtifacts.forEach((id) => { const t = artifacts.find((x) => x.id === id); if (t) artifactAction(a, t); });
          setSelectedArtifacts([]);
        }}
        selected={selectedArtifacts} onSelect={setSelectedArtifacts} highlight={snap.highlightArtifactIds}
        spotlight={spotlight("panel-queue")} onUpload={() => setUploadOpen(true)} paused={paused} />

      <div className="grid gap-3 xl:grid-cols-2">
        <ThroughputPanel metric={metric} onMetric={setMetric} range={range} onRange={setRange}
          degraded={snap.degradedCharts} spotlight={spotlight("panel-throughput")} />
        <CompositionPanel onSegment={(label, mode) => {
          setFilters((p) => (mode === "format" ? { ...p, format: label } : { ...p, sourceCategory: p.sourceCategory }));
          focusPanel("panel-queue");
          announce(`Artifact queue filtered by ${label}.`);
        }} />
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <QualityPanel onOpenDetail={setQualityDrawer} />
        <ProvenancePanel spotlight={spotlight("panel-provenance")} />
      </div>

      <DuplicatePanel decisions={duplicateDecisions} onDecision={duplicateDecision}
        spotlight={spotlight("panel-duplicates")} highlight={snap.highlightArtifactIds} />

      <AccessPanel onReviewAction={permissionAction} reviewStates={permissionStates} spotlight={spotlight("panel-access")} />

      <ExceptionPanel exceptions={exceptionRows} onAction={exceptionAction} spotlight={spotlight("panel-exceptions")}
        onCategory={setExceptionCategory} activeCategory={exceptionCategory} />

      <ReadinessPanel readiness={readiness} onProceed={proceedToNormalization} onFocus={focusPanel} spotlight={spotlight("panel-readiness")} />

      {view === "evidence" && <EvidencePanel />}

      <div className="grid gap-3 xl:grid-cols-2">
        <ActivityPanel activity={activity} onOpen={setActivityDrawer} />
        <DownstreamImpactPanel />
      </div>

      {/* sidebar ingestion status (compact, in-page) */}
      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm" aria-label="Ingestion service status">
        <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", paused ? "bg-slate-400" : "bg-emerald-500")} aria-hidden />
            Ingestion Service: {paused ? "Paused" : sidebarStatus.service}
          </span>
          <span>Active Batches: {snap.activeBatches}</span>
          <span>Artifacts in Queue: {nf(snap.queueDepth)}</span>
          <span>Quarantined: {nf(snap.quarantined)}</span>
          <span>Last Updated: 10:22 AM</span>
          <Button size="sm" variant="outline" className="ml-auto h-6 text-[11px]" onClick={refresh}>Refresh status</Button>
        </div>
      </section>

      {/* demo story overlay */}
      {story >= 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur" role="dialog" aria-label="Demo story">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
            <span className="text-[11px] font-medium text-slate-500">Step {story + 1} of {STORY.length}</span>
            <p className="flex-1 text-[12.5px] text-slate-800">{STORY[story].caption}</p>
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="h-7 text-[11.5px]" disabled={story === 0}
                onClick={() => { const n = story - 1; setStory(n); focusPanel(STORY[n].panel); }}>Previous</Button>
              <Button size="sm" className="h-7 text-[11.5px]" disabled={story === STORY.length - 1}
                onClick={() => { const n = story + 1; setStory(n); focusPanel(STORY[n].panel); }}>Next</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => setPresenterNotes((p) => !p)}>Presenter notes</Button>
              <Button size="sm" variant="ghost" className="h-7 text-[11.5px]" onClick={() => setStory(-1)}>Exit Story</Button>
            </div>
            {presenterNotes && <p className="w-full text-[11px] text-slate-500">{STORY[story].notes}</p>}
          </div>
        </div>
      )}

      {/* drawers and dialogs */}
      <BatchDetailDrawer batch={batchDrawer} open={Boolean(batchDrawer)} onOpenChange={(v) => !v && setBatchDrawer(null)}
        artifacts={artifacts} exceptions={allExceptions} onAction={batchAction} onOpenArtifact={(a) => { setBatchDrawer(null); setArtifactDrawer(a); }} />
      <ArtifactEvidenceDrawer artifact={artifactDrawer} open={Boolean(artifactDrawer)}
        onOpenChange={(v) => !v && setArtifactDrawer(null)} onAction={artifactAction} />
      <QualityDetailDrawer name={qualityDrawer} open={Boolean(qualityDrawer)} onOpenChange={(v) => !v && setQualityDrawer(null)} />

      <Sheet open={Boolean(activityDrawer)} onOpenChange={(v) => !v && setActivityDrawer(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-[15px]">{activityDrawer?.action}</SheetTitle>
            <SheetDescription className="text-[12px]">{activityDrawer?.description}</SheetDescription>
          </SheetHeader>
          {activityDrawer && (
            <dl className="mt-3 rounded-lg border border-slate-200 p-2 text-[11.5px]">
              <div className="flex justify-between py-0.5"><dt className="text-slate-500">Timestamp</dt><dd>{activityDrawer.timestamp}</dd></div>
              <div className="flex justify-between py-0.5"><dt className="text-slate-500">Source</dt><dd>{activityDrawer.sourceName}</dd></div>
              <div className="flex justify-between py-0.5"><dt className="text-slate-500">Team</dt><dd>{activityDrawer.teamName}</dd></div>
              <div className="flex justify-between py-0.5"><dt className="text-slate-500">Result</dt><dd>{activityDrawer.result}</dd></div>
              <div className="flex justify-between py-0.5"><dt className="text-slate-500">Owner</dt><dd>{activityDrawer.owner}</dd></div>
              <div className="flex justify-between py-0.5"><dt className="text-slate-500">Audit ID</dt><dd>{activityDrawer.auditId}</dd></div>
            </dl>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-[15px]">Notifications</SheetTitle>
            <SheetDescription className="text-[12px]">{unread} unread ingestion notifications</SheetDescription>
          </SheetHeader>
          <div className="mt-2 flex gap-1.5">
            <Button size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => setNotifications((p) => p.map((n) => ({ ...n, read: true })))}>Mark All Read</Button>
          </div>
          <ul className="mt-2 divide-y divide-slate-100">
            {notifications.map((n) => (
              <li key={n.id} className={cn("py-1.5", !n.read && "bg-blue-50/40")}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11.5px] font-medium text-slate-800">{n.title}</p>
                    <p className="text-[11px] text-slate-600">{n.detail}</p>
                    <p className="text-[10.5px] text-slate-500">{n.category} · {n.timestamp}</p>
                  </div>
                  <StatusText status={n.severity} />
                </div>
                <div className="mt-1 flex gap-1.5">
                  <Button size="sm" variant="ghost" className="h-5 px-1 text-[11px]" onClick={() => setNotifications((p) => p.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}>Mark Read</Button>
                  <Button size="sm" variant="ghost" className="h-5 px-1 text-[11px]" onClick={() => {
                    setNotifOpen(false);
                    if (n.batchId) { const b = batches.find((x) => x.id === n.batchId); if (b) setBatchDrawer(b); }
                    if (n.artifactId) { const a = artifacts.find((x) => x.id === n.artifactId); if (a) setArtifactDrawer(a); }
                  }}>Open Item</Button>
                  <Button size="sm" variant="ghost" className="h-5 px-1 text-[11px]" onClick={() => announce(`${n.title} acknowledged.`)}>Acknowledge</Button>
                </div>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      <Sheet open={helpOpen} onOpenChange={setHelpOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-[15px]">How organizational knowledge safely enters the Fabric</SheetTitle>
            <SheetDescription className="text-[12px]">Artifact Ingestion is the controlled entry point for every enterprise artifact.</SheetDescription>
          </SheetHeader>
          <ol className="mt-3 list-decimal space-y-1 pl-4 text-[11.5px] text-slate-700">
            <li>Artifacts arrive from approved connectors or authorized manual submissions.</li>
            <li>The delivering source is authenticated before anything is retained.</li>
            <li>The original artifact is preserved unchanged and given an immutable evidence identifier.</li>
            <li>Metadata, permissions, ownership, and classification are captured with the artifact.</li>
            <li>Versions and duplicates are detected so conflicting knowledge never reaches personas.</li>
            <li>Validation stops unreadable, unsupported, stale, or incomplete artifacts.</li>
            <li>Only qualified artifacts are queued for normalization.</li>
          </ol>
        </SheetContent>
      </Sheet>

      <StartIngestionDialog open={startOpen} onOpenChange={setStartOpen} onOpenBatch={setBatchDrawer}
        onProceed={proceedToNormalization}
        onComplete={(r) => {
          const b = makeDiscoveryBatch(extraBatches.length, r.sourceName, r.method, r.received, "Engineering Operations");
          setExtraBatches((p) => [b, ...p]);
          logActivity("Ingestion completed", `${nf(r.received)} artifacts received from ${r.sourceName}. ${nf(r.ready)} ready for normalization.`, "Success", { batchId: b.id });
          return b;
        }} />

      <UploadArtifactsDialog open={uploadOpen} onOpenChange={setUploadOpen}
        onSubmit={(p) => {
          const b = makeManualBatch(extraBatches.length, p.files.length, p.owner);
          const created = p.files.map((f, i) => makeManualArtifact({
            title: p.files.length === 1 ? (p.description ? p.description.slice(0, 48) : f) : f,
            description: p.description, sourceName: p.sourceName, teamName: p.teamName,
            businessUnit: p.businessUnit, knowledgeDomain: p.knowledgeDomain, owner: p.owner,
            authorityLevel: p.authorityLevel, accessClassification: p.accessClassification,
            artifactType: p.artifactType, format: (f.split(".").pop() ?? "PDF").toUpperCase(),
            version: p.version, tags: p.tags, index: extraArtifacts.length + i, batchId: b.id,
          }));
          setExtraBatches((x) => [b, ...x]);
          setExtraArtifacts((x) => [...created, ...x]);
          logActivity("Manual artifact upload submitted", `${created.length} artifacts submitted by ${p.owner}. ${p.requiresReview ? "Review task created." : "Queued for validation."}`, "Review", { batchId: b.id });
          announce(`${created.length} artifacts submitted. Registered as Manual Submission.`);
        }} />

      <PauseIntakeDialog open={pauseOpen} onOpenChange={setPauseOpen} paused={paused}
        onConfirm={({ mode, reason }) => { setPaused(true); logActivity("Intake paused", `${mode}. Reason: ${reason}`, "Warning"); announce("Intake paused."); }}
        onResume={() => { setPaused(false); logActivity("Intake resumed", "Health checks passed. Intake resumed.", "Success"); announce("Intake resumed."); }} />

      <RetryDialog open={Boolean(retryContext)} onOpenChange={(v) => !v && setRetryContext(null)} context={retryContext}
        onConfirm={(mode) => { logActivity("Retry started", `${mode} started for ${retryContext?.label}.`, "Success"); announce(`${mode} started.`); setRetryContext(null); }} />

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} currentArtifacts={artifacts} currentBatches={batches}
        selectedArtifactIds={selectedArtifacts} selectedBatchIds={selectedBatches} />

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} catalog={searchCatalog}
        onOpenResult={(id, type) => {
          if (type === "Batch") { const b = batches.find((x) => x.id === id); if (b) setBatchDrawer(b); }
          else { const a = artifacts.find((x) => x.id === id); if (a) setArtifactDrawer(a); else focusPanel("panel-exceptions"); }
        }} />

      {confirm && (
        <ConfirmDialog open onOpenChange={(v) => !v && setConfirm(null)} title={confirm.title}
          description={confirm.description} confirmLabel={confirm.confirmLabel}
          onConfirm={confirm.onConfirm} requireReason={confirm.requireReason} />
      )}
    </div>
  );
}
