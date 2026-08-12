import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Bell, CircleHelp, Download, Pause, Play, RefreshCw, Search, Settings2, SlidersHorizontal, Sparkles,
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
  ActivityPanel, ArchitecturePanel, CanonicalArtifactDrawer, CanonicalArtifactPanel, ChunkingPanel,
  CompositionPanel, EntityPanel, ExceptionPanel, FilterSelect, IntegrityPanel, JobDetailDrawer,
  JobTablePanel, LifecyclePanel, QualityDetailDrawer, QualityPanel, ReadinessPanel, SchemaCoveragePanel,
  StageDetailPanel, StatusText, ThroughputPanel, WorkbenchPanel, artifactsToCsv, download,
  exceptionsToCsv, jobsToCsv, nf, viewColumns, type Density,
} from "./artifact-normalization/panels";
import {
  ConfirmDialog, EntityPickerDialog, ExportDialog, HumanReviewDialog, PauseProcessingDialog,
  ReprocessDialog, RetryDialog, SchemaCompareDialog, SchemaManagementDrawer, SearchDialog,
  StartNormalizationDialog,
} from "./artifact-normalization/dialogs";
import {
  activeFilterCount, defaultFilters, demoScenarios, filterLabels, filterOptions, kpiTrends,
  lifecycleCallouts, makeNormalizationJob, qualityDimensions, readiness as seedReadiness,
  resolveActivity, resolveArtifacts, resolveExceptions, resolveJobs, resolveStages, scenarioSnapshots,
  schemaCoverage, seedNotifications, sidebarStatus, type CanonicalArtifact, type DemoScenario,
  type Filters, type NormalizationActivity, type NormalizationException, type NormalizationJob,
  type ThroughputMetric, type ViewMode,
} from "./artifact-normalization/data";

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: "executive", label: "Executive" },
  { id: "operations", label: "Operations" },
  { id: "workbench", label: "Workbench" },
  { id: "architecture", label: "Architecture" },
];

const STORY = [
  { panel: "panel-kpis", caption: "Approved original artifacts are transformed into consistent machine-readable representations without replacing the source evidence.", notes: "Open on volume and canonical records. Emphasise that the original is preserved and only read." },
  { panel: "panel-lifecycle", caption: "Content is parsed, structured, enriched, resolved, permission-aware, validated, and published through measurable operational stages.", notes: "Nine stages. Point out structure detection, entity resolution, and validation as the current constraints." },
  { panel: "panel-workbench", caption: "The original document remains visible while its structure, metadata, entities, relationships, chunks, permissions, and provenance are created beside it.", notes: "Hover the original text to highlight the canonical field it produced." },
  { panel: "panel-entities", caption: "Different names for the same team, service, product, metric, or dependency are reconciled into a shared organizational vocabulary.", notes: "Show the Identity Svc alias conflict and approve the recommended mapping." },
  { panel: "panel-chunking", caption: "Content is divided according to meaning and structure, with its headings, permissions, metadata, entities, and evidence references preserved.", notes: "Compare fixed-size chunking against context-enriched chunking." },
  { panel: "panel-exceptions", caption: "Ambiguity, conflicts, missing context, and low-confidence interpretations are reviewed before they can influence Team Personas or decisions.", notes: "This is the trust boundary. Open a review and show the evidence beside the correction." },
  { panel: "panel-readiness", caption: "Only approved canonical representations move forward to business-condition extraction and organizational modeling.", notes: "Close by proceeding to Business Condition Extraction." },
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

export default function ArtifactNormalization() {
  const navigate = useNavigate();

  /* persisted preferences */
  const [view, setView] = useState<ViewMode>(() =>
    (typeof window !== "undefined" && (localStorage.getItem("ecf.normalization.view") as ViewMode)) || "executive");
  const [density, setDensity] = useState<Density>(() =>
    (typeof window !== "undefined" && (localStorage.getItem("ecf.normalization.density") as Density)) || "compact");
  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window === "undefined") return defaultFilters;
    try { return { ...defaultFilters, ...JSON.parse(localStorage.getItem("ecf.normalization.filters") ?? "{}") }; }
    catch { return defaultFilters; }
  });
  const [draftFilters, setDraftFilters] = useState<Filters>(filters);
  const [columns, setColumns] = useState<string[]>(() => {
    if (typeof window === "undefined") return viewColumns.operations;
    try { return JSON.parse(localStorage.getItem("ecf.normalization.columns") ?? "null") ?? viewColumns.operations; }
    catch { return viewColumns.operations; }
  });
  const [selectedStageId, setSelectedStageId] = useState<string>(() =>
    (typeof window !== "undefined" && localStorage.getItem("ecf.normalization.stage")) || "entities");
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(() =>
    (typeof window !== "undefined" && localStorage.getItem("ecf.normalization.artifact")) || "CAN-90121");
  const [savedView, setSavedView] = useState<string | null>(() =>
    (typeof window !== "undefined" && localStorage.getItem("ecf.normalization.savedView")) || null);

  useEffect(() => { localStorage.setItem("ecf.normalization.view", view); }, [view]);
  useEffect(() => { localStorage.setItem("ecf.normalization.density", density); }, [density]);
  useEffect(() => { localStorage.setItem("ecf.normalization.filters", JSON.stringify(filters)); }, [filters]);
  useEffect(() => { localStorage.setItem("ecf.normalization.columns", JSON.stringify(columns)); }, [columns]);
  useEffect(() => { localStorage.setItem("ecf.normalization.stage", selectedStageId); }, [selectedStageId]);
  useEffect(() => { localStorage.setItem("ecf.normalization.artifact", selectedArtifactId); }, [selectedArtifactId]);

  /* session state */
  const [scenario, setScenario] = useState<DemoScenario>("healthy");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [extraJobs, setExtraJobs] = useState<NormalizationJob[]>([]);
  const [jobOverrides, setJobOverrides] = useState<Record<string, Partial<NormalizationJob>>>({});
  const [artifactOverrides, setArtifactOverrides] = useState<Record<string, Partial<CanonicalArtifact>>>({});
  const [stageOverrides, setStageOverrides] = useState<Record<string, Partial<ReturnType<typeof resolveStages>[number]>>>({});
  const [exceptionStatuses, setExceptionStatuses] = useState<Record<string, string>>({});
  const [conflictStates, setConflictStates] = useState<Record<string, string>>({});
  const [extraActivity, setExtraActivity] = useState<NormalizationActivity[]>([]);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("All");
  const [metric, setMetric] = useState<ThroughputMetric>("Throughput");
  const [lifecycleFocus, setLifecycleFocus] = useState<"all" | "bottlenecks" | "failed" | "review" | "outputs">("all");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeFamily, setActiveFamily] = useState<string | null>(null);
  const [highlightField, setHighlightField] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const [lastUpdated, setLastUpdated] = useState("10:22 AM");

  /* dialogs and drawers */
  const [filterOpen, setFilterOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [retryOpen, setRetryOpen] = useState(false);
  const [retrySource, setRetrySource] = useState("Active Normalization Jobs");
  const [reprocessOpen, setReprocessOpen] = useState(false);
  const [reprocessTarget, setReprocessTarget] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [qualityDetail, setQualityDetail] = useState<string | null>(null);
  const [jobDrawer, setJobDrawer] = useState<NormalizationJob | null>(null);
  const [artifactDrawer, setArtifactDrawer] = useState<CanonicalArtifact | null>(null);
  const [reviewException, setReviewException] = useState<NormalizationException | null>(null);
  const [entityPickerOpen, setEntityPickerOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ title: string; description: string; label: string; reason?: boolean; run: (r: string) => void } | null>(null);
  const [story, setStory] = useState(-1);
  const [presenterNotes, setPresenterNotes] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  const snapshot = scenarioSnapshots[scenario];

  /* derived data */
  const stages = useMemo(() => resolveStages(scenario, stageOverrides), [scenario, stageOverrides]);
  const jobs = useMemo(() => resolveJobs(scenario, filters, jobOverrides, extraJobs)
    .map((j) => (paused ? { ...j, status: "Paused" as const } : j)),
    [scenario, filters, jobOverrides, extraJobs, paused]);
  const artifacts = useMemo(() => {
    const list = resolveArtifacts(scenario, filters, artifactOverrides);
    return activeFamily ? list.filter((a) => a.artifactType === activeFamily || activeFamily.startsWith(a.artifactType)) : list;
  }, [scenario, filters, artifactOverrides, activeFamily]);
  const exceptions = useMemo(() => resolveExceptions(scenario, exceptionStatuses), [scenario, exceptionStatuses]);
  const activity = useMemo(() => resolveActivity(scenario, extraActivity), [scenario, extraActivity]);
  const stage = stages.find((s) => s.id === selectedStageId) ?? stages[4];
  const unread = notifications.filter((n) => !n.read).length;
  const filterCount = activeFilterCount(filters);
  const serviceState = paused ? "Paused" : snapshot.serviceState;

  const readiness = useMemo(() => ({
    ...seedReadiness,
    readyForConditionExtraction: Math.round(seedReadiness.readyForConditionExtraction * (snapshot.readyPercent / 93)),
    awaitingHumanReview: snapshot.humanReview,
    permissionBlocked: snapshot.permissionConflicts,
    entityConflicts: snapshot.entityConflicts,
    lowConfidence: snapshot.lowConfidence,
  }), [snapshot]);

  const focusPanel = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }, []);

  const say = useCallback((message: string) => {
    setAnnounce(message);
    toast(message);
  }, []);

  const activityEntry = useCallback((action: string, description: string, result = "Success"): NormalizationActivity => ({
    id: `NAC-live-${Date.now()}`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    action, description, artifactId: null, jobId: null, schemaId: null, sourceId: "SRC-2001",
    sourceName: "Operator action", teamName: "Knowledge Operations", result, owner: "Alex Valencia",
    auditId: `AUD-${Math.floor(Math.random() * 9000) + 1000}`,
  }), []);

  const record = useCallback((action: string, description: string, result = "Success") => {
    setExtraActivity((a) => [activityEntry(action, description, result), ...a]);
  }, [activityEntry]);

  /* handlers */
  const applyFilters = () => {
    setFilters(draftFilters);
    setFilterOpen(false);
    say(`Filters applied. ${activeFilterCount(draftFilters)} active filter${activeFilterCount(draftFilters) === 1 ? "" : "s"}.`);
  };
  const clearFilters = () => {
    setDraftFilters(defaultFilters); setFilters(defaultFilters); setActiveFamily(null);
    say("Filters cleared.");
  };
  const saveView = () => {
    const name = `${VIEWS.find((v) => v.id === view)?.label} view · ${activeFilterCount(draftFilters)} filters`;
    setSavedView(name); localStorage.setItem("ecf.normalization.savedView", name);
    say(`Saved view: ${name}`);
  };

  const refresh = () => {
    setLoading(true); setError(null);
    setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      say("Normalization data refreshed.");
    }, 380);
  };

  const jobAction = (action: string, job?: NormalizationJob) => {
    const target = job ? job.id : selectedJobs.join(", ") || "selected jobs";
    switch (action) {
      case "Open Artifact Workbench":
        setView("workbench"); focusPanel("panel-workbench"); say("Artifact Workbench opened."); break;
      case "Pause Job":
        setJobOverrides((o) => ({ ...o, ...(job ? { [job.id]: { status: "Paused" } } : {}) }));
        record("Job paused", `${target} paused by operator.`); say(`${target} paused.`); break;
      case "Resume Job":
        setJobOverrides((o) => ({ ...o, ...(job ? { [job.id]: { status: "Running" } } : {}) }));
        record("Job resumed", `${target} resumed.`); say(`${target} resumed.`); break;
      case "Retry Failed":
        setRetrySource(`job ${target}`); setRetryOpen(true); break;
      case "Restart from Stage":
        setRetrySource(`job ${target}`); setRetryOpen(true); break;
      case "Reprocess with New Schema":
        setReprocessTarget(`Job ${target}`); setReprocessOpen(true); break;
      case "Export Job Report":
        download(`normalization-job-${job?.id ?? "selection"}.csv`, jobsToCsv(job ? [job] : jobs), "text/csv");
        say("Job report exported."); break;
      case "Create Incident":
        record("Incident created", `Incident opened for ${target}.`, "Review");
        say(`Incident created for ${target}.`); break;
      case "Cancel Job":
        setJobOverrides((o) => ({ ...o, ...(job ? { [job.id]: { status: "Cancelled" } } : {}) }));
        say(`${target} cancelled.`); break;
      case "Open Artifact Ingestion":
        navigate("/enterprise-cognitive-fabric/discovery/artifact-ingestion"); break;
      default:
        say(`${action} requested for ${target}.`);
    }
  };

  const stageAction = (action: string) => {
    switch (action) {
      case "Pause Stage":
        setStageOverrides((o) => ({ ...o, [stage.id]: { status: "Paused" } }));
        record("Stage paused", `${stage.name} paused.`); say(`${stage.name} paused.`); break;
      case "Resume Stage":
        setStageOverrides((o) => ({ ...o, [stage.id]: { status: "Running" } }));
        record("Stage resumed", `${stage.name} resumed.`); say(`${stage.name} resumed.`); break;
      case "Retry Failures":
        setRetrySource(`stage ${stage.name}`); setRetryOpen(true); break;
      case "Drain Queue":
        setStageOverrides((o) => ({ ...o, [stage.id]: { pendingCount: 0, status: "Running" } }));
        say(`${stage.name} queue drained.`); break;
      case "Approve Suggested Mappings":
        setConflictStates(Object.fromEntries(["ECF-1", "ECF-2", "ECF-3"].map((id) => [id, "Resolved"])));
        record("Entity mappings approved", "All suggested canonical mappings approved.");
        say("Suggested entity mappings approved."); break;
      case "Open Human Review":
        focusPanel("panel-exceptions"); say("Human review queue opened."); break;
      case "Edit Configuration":
        setSchemaOpen(true); break;
      case "Reprocess Selected":
        setReprocessTarget(`Stage ${stage.name}`); setReprocessOpen(true); break;
      case "Create Incident":
        record("Incident created", `Incident opened for ${stage.name}.`, "Review");
        say(`Incident created for ${stage.name}.`); break;
      default:
        say(`${action} requested for ${stage.name}.`);
    }
  };

  const exceptionAction = (action: string, e: NormalizationException) => {
    switch (action) {
      case "Open Workbench":
        setView("workbench"); focusPanel("panel-workbench"); say("Workbench opened for review."); break;
      case "Select Entity":
        setReviewException(e); setEntityPickerOpen(true); break;
      case "Reprocess":
        setReprocessTarget(e.artifactTitle); setReprocessOpen(true); break;
      case "Change Schema":
        setSchemaOpen(true); break;
      case "Resolve Permission":
        setExceptionStatuses((s) => ({ ...s, [e.id]: "Resolved" }));
        setArtifactOverrides((o) => ({ ...o, "CAN-90126": { permissionStatus: "Preserved", normalizationStatus: "Published" } }));
        record("Permission resolved", `${e.artifactTitle} permission restored to ingestion-time membership.`);
        say("Permission conflict resolved."); break;
      case "Apply Owner":
        setExceptionStatuses((s) => ({ ...s, [e.id]: "Resolved" }));
        record("Owner applied", `${e.artifactTitle} owner set to ${e.teamName}.`);
        say("Owner applied to the canonical artifact."); break;
      case "Reject Representation":
        setConfirm({
          title: "Reject representation", description: `${e.artifactTitle} will not proceed to condition extraction.`,
          label: "Reject", reason: true,
          run: (reason) => {
            setExceptionStatuses((s) => ({ ...s, [e.id]: "Rejected" }));
            record("Representation rejected", `${e.artifactTitle} rejected. ${reason}`, "Review");
            say("Representation rejected.");
          },
        });
        break;
      case "Create Incident":
        record("Incident created", `Incident opened for ${e.artifactTitle}.`, "Review");
        say("Incident created."); break;
      default:
        setExceptionStatuses((s) => ({ ...s, [e.id]: action === "Acknowledge" ? "Acknowledged" : action === "Assign" ? "In Review" : s[e.id] ?? e.status }));
        say(`${action} applied to ${e.artifactTitle}.`);
    }
  };

  const reviewDecision = (decision: string, correction: string, comments: string) => {
    if (!reviewException) return;
    const resolved = ["Accept Suggested Correction", "Approve Representation", "Select Canonical Entity", "Approve with Exception"].includes(decision);
    setExceptionStatuses((s) => ({ ...s, [reviewException.id]: resolved ? "Resolved" : decision === "Escalate" ? "Escalated" : "In Review" }));
    if (reviewException.exceptionType === "Entity Conflict") {
      setConflictStates((c) => ({ ...c, "ECF-2": resolved ? "Resolved" : "In Review" }));
    }
    setArtifactOverrides((o) => ({
      ...o,
      ...(resolved ? { "CAN-90123": { humanReviewStatus: "Completed", entityResolutionStatus: "Human reviewed", qualityScore: 91, confidence: 93 } } : {}),
    }));
    record("Human review completed", `${decision} — ${reviewException.artifactTitle}. Correction: ${correction}. ${comments}`, resolved ? "Success" : "Review");
    say(`Human review ${decision.toLowerCase()} recorded for ${reviewException.artifactTitle}.`);
    setReviewException(null);
  };

  const workbenchAction = (action: string) => {
    switch (action) {
      case "Approve Representation":
        setArtifactOverrides((o) => ({ ...o, [selectedArtifactId]: { approvalStatus: "Approved", normalizationStatus: "Published" } }));
        record("Representation approved", `${selectedArtifactId} approved for condition extraction.`);
        say("Canonical representation approved."); break;
      case "Request Correction":
        record("Correction requested", `Correction requested for ${selectedArtifactId}.`, "Review");
        say("Correction requested."); break;
      case "Reprocess Artifact":
        setReprocessTarget(selectedArtifactId); setReprocessOpen(true); break;
      case "Compare Schema Versions":
        setCompareOpen(true); break;
      case "Export Canonical Record":
        download(`canonical-${selectedArtifactId}.json`,
          JSON.stringify(artifacts.find((a) => a.id === selectedArtifactId), null, 2), "application/json");
        say("Canonical record exported."); break;
      case "Edit Mapping":
        setEntityPickerOpen(true); break;
      case "Open Original Evidence":
        navigate("/enterprise-cognitive-fabric/discovery/artifact-ingestion");
        break;
      default:
        say(`${action} requested.`);
    }
  };

  const exportRows = (scope: string): Record<string, unknown>[] => {
    const parse = (csv: string) => {
      const [head, ...rest] = csv.split("\n");
      if (!head) return [];
      const headers = head.split(",");
      return rest.filter(Boolean).map((line) => {
        const cells = line.split('","').map((c) => c.replace(/^"|"$/g, ""));
        return Object.fromEntries(headers.map((h, i) => [h.replace(/"/g, ""), cells[i]]));
      });
    };
    switch (scope) {
      case "Selected Jobs": return parse(jobsToCsv(jobs.filter((j) => selectedJobs.includes(j.id))));
      case "Selected Artifacts": return parse(artifactsToCsv(artifacts));
      case "Quality Metrics": return qualityDimensions.map((d) => ({ Dimension: d.name, Current: d.current, Target: d.target, Affected: d.affected, Status: d.status }));
      case "Schema Coverage": return schemaCoverage.map((c) => ({ Family: c.family, Coverage: c.coverage, Target: c.target, Artifacts: c.artifacts, Schema: c.schema }));
      case "Exceptions": return parse(exceptionsToCsv(exceptions));
      case "Readiness Summary": return [{ ...readiness }];
      default: return parse(jobsToCsv(jobs));
    }
  };

  /* demo story keyboard */
  const storyRef = useRef(story);
  storyRef.current = story;
  useEffect(() => {
    if (story < 0) return;
    focusPanel(STORY[story].panel);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setStory((s) => Math.min(STORY.length - 1, s + 1));
      if (e.key === "ArrowLeft") setStory((s) => Math.max(0, s - 1));
      if (e.key === "Escape") setStory(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [story, focusPanel]);

  const spotlight = (id: string) => story >= 0 && STORY[story].panel === id;

  const showJobs = true;
  const showWorkbench = view === "workbench" || view === "executive" || view === "operations" || view === "architecture";

  return (
    <div className="min-h-full bg-slate-50">
      <p aria-live="polite" className="sr-only">{announce}</p>

      {/* header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-2.5 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <a href="/enterprise-cognitive-fabric" className="hover:text-blue-700">Enterprise Cognitive Fabric</a>
              <span aria-hidden>/</span><span>Discovery</span>
              <span aria-hidden>/</span><span className="font-medium text-slate-700">Artifact Normalization</span>
            </nav>
            <div className="mt-0.5 flex items-center gap-2">
              <h1 className="text-[19px] font-bold leading-tight text-slate-900">Artifact Normalization</h1>
              <StatusText status={serviceState} />
              {snapshot.banner && <Badge variant="outline" className="text-[10.5px]">{scenario.replace(/-/g, " ")}</Badge>}
            </div>
            <p className="text-[12px] text-slate-500">
              Convert approved enterprise artifacts into consistent, traceable, machine-readable organizational knowledge
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-[11.5px]" onClick={() => setSearchOpen(true)}>
              <Search className="h-3.5 w-3.5" aria-hidden /> Search
            </Button>
            <Button size="sm" variant="outline" className="relative h-7 w-7 p-0" aria-label={`Notifications, ${unread} unread`}
              onClick={() => setNotifOpen(true)}>
              <Bell className="h-3.5 w-3.5" aria-hidden />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1 text-[9px] font-semibold text-white">{unread}</span>
              )}
            </Button>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" aria-label="Help" onClick={() => setHelpOpen(true)}>
              <CircleHelp className="h-3.5 w-3.5" aria-hidden />
            </Button>
            <div className="flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-1">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-[10px] font-semibold text-white" aria-hidden>AV</span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-[11.5px] font-medium text-slate-800">Alex Valencia</span>
                <span className="block text-[10px] text-slate-500">Chief Architect</span>
              </span>
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <div className="flex rounded-md border border-slate-200 p-0.5" role="tablist" aria-label="View selector">
            {VIEWS.map((v) => (
              <button key={v.id} role="tab" aria-selected={view === v.id} type="button"
                onClick={() => { setView(v.id); setColumns(viewColumns[v.id]); }}
                className={cn("rounded px-2 py-1 text-[11.5px]",
                  view === v.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100")}>
                {v.label}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-[11.5px]" onClick={() => { setDraftFilters(filters); setFilterOpen(true); }}>
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden /> Filters
            {filterCount > 0 && <Badge className="ml-1 h-4 px-1 text-[10px]">{filterCount}</Badge>}
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-[11.5px]" onClick={refresh}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Refresh
          </Button>
          <Button size="sm" className="h-7 gap-1.5 text-[11.5px]" onClick={() => setStartOpen(true)} disabled={paused}>
            <Play className="h-3.5 w-3.5" aria-hidden /> Start Normalization
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-[11.5px]" onClick={() => setSchemaOpen(true)}>
            <Settings2 className="h-3.5 w-3.5" aria-hidden /> Configure Schemas
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-[11.5px]" onClick={() => setPauseOpen(true)}>
            <Pause className="h-3.5 w-3.5" aria-hidden /> {paused ? "Resume Processing" : "Pause Processing"}
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-[11.5px]" onClick={() => setExportOpen(true)}>
            <Download className="h-3.5 w-3.5" aria-hidden /> Export Normalization Report
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-[11.5px]">More</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto">
              <DropdownMenuItem className="text-[11.5px]" onClick={() => setStory(0)}>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Demo Story
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11.5px]" onClick={() => setCompareOpen(true)}>Compare Schema Versions</DropdownMenuItem>
              <DropdownMenuItem className="text-[11.5px]" onClick={() => { setRetrySource("More menu"); setRetryOpen(true); }}>Retry and Reprocess</DropdownMenuItem>
              <DropdownMenuItem className="text-[11.5px]" onClick={saveView}>Save View</DropdownMenuItem>
              <DropdownMenuItem className="text-[11.5px]" onClick={() => setError(error ? null : "Normalization telemetry endpoint is unreachable.")}>
                {error ? "Clear simulated error" : "Simulate service error"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px] text-slate-500">Demo scenarios</DropdownMenuLabel>
              {demoScenarios.map((s) => (
                <DropdownMenuItem key={s.id} className="text-[11.5px]"
                  onClick={() => {
                    setScenario(s.id === "reset" ? "healthy" : s.id);
                    if (s.id === "reset") {
                      setJobOverrides({}); setArtifactOverrides({}); setStageOverrides({}); setExceptionStatuses({});
                      setConflictStates({}); setExtraActivity([]); setExtraJobs([]); setPaused(false);
                      setNotifications(seedNotifications); setSelectedJobs([]);
                    }
                    if (s.id === "paused") setPaused(true);
                    const snap = scenarioSnapshots[s.id === "reset" ? "healthy" : s.id];
                    if (snap.focusPanel) setTimeout(() => focusPanel(snap.focusPanel!), 60);
                    say(`Demo scenario: ${s.label}.`);
                  }}>
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="ml-auto text-[11px] text-slate-500">
            Normalization Service {sidebarStatus.service} · Active jobs {snapshot.activeJobs} · Queue {nf(sidebarStatus.queued)} · Human review {snapshot.humanReview} · Updated {lastUpdated}
          </span>
        </div>

        {snapshot.banner && (
          <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11.5px] text-amber-800">
            {snapshot.banner}
          </div>
        )}
        {paused && (
          <div className="mt-2 rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-[11.5px] text-slate-700">
            Normalization is paused. Approved artifacts remain preserved and queued; condition extraction will wait.
          </div>
        )}
      </header>

      <main className="space-y-3 px-5 py-3">
        {/* KPIs */}
        <section id="panel-kpis" aria-label="Key metrics"
          className={cn("grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", spotlight("panel-kpis") && "rounded-xl ring-2 ring-blue-500 ring-offset-2")}>
          <Kpi label="Artifacts Normalized" value={snapshot.normalizedLabel} sub={snapshot.normalizedChange}
            trend={kpiTrends.normalized} tone="green" tooltip="Canonical representations produced beside preserved originals"
            onClick={() => focusPanel("panel-composition")} />
          <Kpi label="Active Normalization Jobs" value={String(snapshot.activeJobs)}
            sub={`${snapshot.jobsHealthy} healthy · ${snapshot.jobsWarning} warning · ${snapshot.jobsBlocked} blocked`}
            trend={kpiTrends.jobs} tooltip="Jobs currently processing approved artifacts"
            onClick={() => { setJobStatusFilter("All"); focusPanel("panel-jobs"); }} />
          <Kpi label="Canonical Records Produced" value={snapshot.canonicalLabel}
            sub="Metadata, sections, entities, chunks, relationships, permissions" trend={kpiTrends.canonical}
            tooltip="All canonical record types" onClick={() => focusPanel("panel-composition")} />
          <Kpi label="Normalization Quality" value={`${snapshot.qualityScore}`} sub={`Target 95 · ${snapshot.qualityStatus}`}
            trend={kpiTrends.quality} tone={snapshot.qualityScore >= 95 ? "green" : snapshot.qualityScore >= 90 ? "amber" : "red"}
            tooltip="Composite quality across eight dimensions" onClick={() => focusPanel("panel-quality")} />
          <Kpi label="Ready for Condition Extraction" value={snapshot.readyLabel} sub={`${snapshot.readyPercent}% of normalized artifacts`}
            trend={kpiTrends.ready} tone="green" tooltip="Approved canonical representations"
            onClick={() => focusPanel("panel-readiness")} />
          <Kpi label="Artifacts Requiring Review" value={nf(snapshot.requiringReview)}
            sub={`${snapshot.humanReview} human review · ${snapshot.entityConflicts} entity · ${snapshot.missingStructure} structure · ${snapshot.permissionConflicts} permission · ${snapshot.lowConfidence} low confidence`}
            trend={kpiTrends.review} tone="amber" tooltip="Representations blocked from downstream use"
            onClick={() => focusPanel("panel-exceptions")} />
        </section>

        <LifecyclePanel stages={stages} selectedId={stage.id} onSelect={(id) => { setSelectedStageId(id); say(`${stages.find((s) => s.id === id)?.name} selected.`); }}
          loading={loading} error={error} degraded={snapshot.degradedCharts ? "Metrics degraded under the current scenario." : null}
          spotlight={spotlight("panel-lifecycle")} callouts={lifecycleCallouts} focus={lifecycleFocus} onFocus={setLifecycleFocus} />

        {(view === "operations" || view === "architecture") && (
          <StageDetailPanel stage={stage} exceptions={exceptions} onAction={stageAction} />
        )}

        {showJobs && (
          <JobTablePanel
            jobs={jobs} view={view} density={density} onDensity={setDensity} columns={columns} onColumns={setColumns}
            selected={selectedJobs} onSelected={setSelectedJobs} onOpen={setJobDrawer} onAction={jobAction}
            loading={loading} error={error} spotlight={spotlight("panel-jobs")} highlight={snapshot.highlightJobIds}
            search={jobSearch} onSearch={setJobSearch} statusFilter={jobStatusFilter} onStatusFilter={setJobStatusFilter}
            onExport={() => { download("normalization-jobs.csv", jobsToCsv(jobs), "text/csv"); say("Current job view exported."); }}
            paused={paused}
          />
        )}

        {showWorkbench && (
          <WorkbenchPanel artifacts={artifacts} selectedId={selectedArtifactId} onSelect={setSelectedArtifactId}
            onAction={workbenchAction} spotlight={spotlight("panel-workbench")}
            highlightField={highlightField} onHighlightField={setHighlightField} />
        )}

        <div className="grid gap-3 xl:grid-cols-2">
          <SchemaCoveragePanel activeFamily={activeFamily}
            onFamily={(f) => { setActiveFamily(activeFamily === f ? null : f); say(`Filtered by ${f}.`); }}
            onManage={() => setSchemaOpen(true)} />
          <QualityPanel onOpenDetail={setQualityDetail} spotlight={spotlight("panel-quality")} />
        </div>

        {view !== "executive" && (
          <div className="grid gap-3 xl:grid-cols-2">
            <ThroughputPanel metric={metric} onMetric={setMetric} range={filters.timeRange} degraded={snapshot.degradedCharts} />
            <CompositionPanel onSegment={(t) => { say(`${t} selected.`); focusPanel("panel-workbench"); }} />
          </div>
        )}

        <EntityPanel spotlight={spotlight("panel-entities")} conflictStates={conflictStates}
          onAction={(action, id) => {
            setConflictStates((c) => ({ ...c, [id]: action === "Approve mapping" ? "Resolved" : "Escalated" }));
            record(action, `${action} for conflict ${id}.`, action === "Approve mapping" ? "Success" : "Review");
            say(`${action} recorded for ${id}.`);
          }} />

        <ChunkingPanel spotlight={spotlight("panel-chunking")} onSelectChunk={(id) => say(`Chunk ${id} selected.`)} />

        <div className="grid gap-3 xl:grid-cols-2">
          <IntegrityPanel spotlight={spotlight("panel-integrity")} />
          <CanonicalArtifactPanel artifacts={artifacts} onOpen={setArtifactDrawer} view={view}
            loading={loading} paused={paused} onClear={clearFilters} />
        </div>

        <ExceptionPanel exceptions={exceptions} onAction={exceptionAction} onOpenReview={setReviewException}
          spotlight={spotlight("panel-exceptions")} activeCategory={activeCategory} onCategory={setActiveCategory} />

        <div className="grid gap-3 xl:grid-cols-2">
          <ReadinessPanel readiness={readiness} spotlight={spotlight("panel-readiness")}
            onProceed={() => navigate("/enterprise-cognitive-fabric/discovery/business-condition-extraction")}
            onFocus={focusPanel} />
          <ActivityPanel activity={activity} onOpen={(a) => say(`${a.action} — audit ${a.auditId}.`)} />
        </div>

        {view === "architecture" && <ArchitecturePanel />}
      </main>

      {/* filter drawer */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="text-[15px]">Filters</SheetTitle>
            <SheetDescription className="text-[12px]">
              Filters update KPI cards, lifecycle stages, jobs, artifacts, quality, exceptions, and readiness.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {(Object.keys(defaultFilters) as (keyof Filters)[]).map((k) => (
              <FilterSelect key={k} label={filterLabels[k]} value={draftFilters[k]}
                options={filterOptions[k]} onChange={(v) => setDraftFilters((f) => ({ ...f, [k]: v }))} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Button size="sm" className="h-7 text-[11.5px]" onClick={applyFilters}>Apply Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={clearFilters}>Clear Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={saveView}>Save View</Button>
            {savedView && <span className="self-center text-[11px] text-slate-500">Saved: {savedView}</span>}
          </div>
        </SheetContent>
      </Sheet>

      {/* notifications */}
      <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-[15px]">Notifications</SheetTitle>
            <SheetDescription className="text-[12px]">{unread} unread</SheetDescription>
          </SheetHeader>
          <div className="mt-2 flex gap-1.5">
            <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]"
              onClick={() => { setNotifications((n) => n.map((x) => ({ ...x, read: true }))); say("All notifications marked read."); }}>
              Mark All Read
            </Button>
          </div>
          <ul className="mt-2 space-y-1">
            {notifications.map((n) => (
              <li key={n.id} className={cn("rounded border px-2 py-1.5", n.read ? "border-slate-200" : "border-blue-200 bg-blue-50/60")}>
                <div className="flex items-start gap-2">
                  <span className="flex-1">
                    <span className="block text-[11.5px] font-medium text-slate-800">{n.title}</span>
                    <span className="block text-[11px] text-slate-500">{n.detail}</span>
                    <span className="block text-[10.5px] text-slate-400">{n.category} · {n.timestamp}</span>
                  </span>
                  <StatusText status={n.severity} />
                </div>
                <div className="mt-1 flex gap-1">
                  <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]"
                    onClick={() => setNotifications((s) => s.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}>Mark Read</Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]"
                    onClick={() => { setNotifOpen(false); focusPanel(n.jobId ? "panel-jobs" : "panel-exceptions"); }}>Open Item</Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]"
                    onClick={() => say(`${n.title} assigned.`)}>Assign</Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]"
                    onClick={() => say(`${n.title} acknowledged.`)}>Acknowledge</Button>
                </div>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      {/* help */}
      <Sheet open={helpOpen} onOpenChange={setHelpOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-[15px]">About Artifact Normalization</SheetTitle>
            <SheetDescription className="text-[12px]">Preserve the original evidence. Create a normalized representation beside it.</SheetDescription>
          </SheetHeader>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-[11.5px] text-slate-600">
            <li>The original artifact is read from the evidence vault and never modified.</li>
            <li>Every canonical field carries an evidence reference back to the original passage.</li>
            <li>Permissions and classifications are inherited and can never be widened.</li>
            <li>Ambiguity and conflicts are held for human review before downstream use.</li>
            <li>Only approved canonical representations reach Business Condition Extraction.</li>
          </ul>
        </SheetContent>
      </Sheet>

      {/* dialogs */}
      <StartNormalizationDialog open={startOpen} onOpenChange={setStartOpen}
        onComplete={({ artifacts: count, records, schema, scope }) => {
          const job = makeNormalizationJob(extraJobs.length + 1, scope, schema.replace(/ v[\d.]+$/, ""), schema.split(" ").pop() ?? "v1", count, "Knowledge Operations");
          setExtraJobs((j) => [job, ...j]);
          record("Normalization completed", `${nf(count)} artifacts normalized into ${nf(records)} canonical records using ${schema}.`);
          say(`Normalization completed. ${nf(count)} artifacts normalized.`);
        }}
        onProceed={() => navigate("/enterprise-cognitive-fabric/discovery/business-condition-extraction")}
        onOpenJob={() => { focusPanel("panel-jobs"); setJobDrawer(extraJobs[0] ?? jobs[0]); }} />

      <SchemaManagementDrawer open={schemaOpen} onOpenChange={setSchemaOpen} onCompare={() => setCompareOpen(true)}
        onAction={(action, schemaName) => { record(action, `${action} — ${schemaName}.`); say(`${action} — ${schemaName}.`); }} />

      <SchemaCompareDialog open={compareOpen} onOpenChange={setCompareOpen}
        onAction={(action) => { record(action, `${action} for Document Canonical Model v3.4.`); say(`${action}.`); }} />

      <PauseProcessingDialog open={pauseOpen} onOpenChange={setPauseOpen} paused={paused}
        onPause={(mode, reason) => { setPaused(true); record("Processing paused", `${mode}. ${reason}`, "Review"); say("Normalization processing paused."); }}
        onResume={() => { setPaused(false); record("Processing resumed", "Health checks and schema validation passed."); say("Normalization processing resumed."); }} />

      <RetryDialog open={retryOpen} onOpenChange={setRetryOpen} source={retrySource}
        onConfirm={(mode) => { record("Retry started", `${mode} from ${retrySource}.`); say(`${mode} started.`); }} />

      <ReprocessDialog open={reprocessOpen} onOpenChange={setReprocessOpen} target={reprocessTarget}
        onConfirm={(mode, schema, reason) => {
          record("Reprocessing started", `${mode} using ${schema}. ${reason}`);
          say(`Reprocessing started with ${schema}. Historical versions preserved.`);
        }} />

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} buildRows={exportRows}
        onExported={(format, scope) => { record("Report exported", `${format} export of ${scope}.`); say(`${format} export generated.`); }} />

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen}
        onSelect={(type, id) => {
          if (type === "Normalization Job") { const j = jobs.find((x) => x.id === id); if (j) setJobDrawer(j); focusPanel("panel-jobs"); }
          else if (type === "Artifact") { const a = artifacts.find((x) => x.artifactId === id); if (a) { setSelectedArtifactId(a.id); setArtifactDrawer(a); } focusPanel("panel-workbench"); }
          else if (type === "Exception") focusPanel("panel-exceptions");
          else if (type === "Schema") setSchemaOpen(true);
          else focusPanel("panel-entities");
          say(`${type} ${id} opened.`);
        }} />

      <HumanReviewDialog exception={reviewException} open={!!reviewException && !entityPickerOpen}
        onOpenChange={(v) => !v && setReviewException(null)} onDecision={reviewDecision} />

      <EntityPickerDialog open={entityPickerOpen} onOpenChange={setEntityPickerOpen}
        onPick={(name) => { record("Canonical entity selected", `Resolved to ${name}.`); say(`Resolved to ${name}.`); }} />

      <JobDetailDrawer job={jobDrawer} open={!!jobDrawer} onOpenChange={(v) => !v && setJobDrawer(null)}
        artifacts={artifacts} exceptions={exceptions}
        onAction={(action, job) => { jobAction(action, job); if (action === "Open Artifact Workbench") setJobDrawer(null); }} />

      <CanonicalArtifactDrawer artifact={artifactDrawer} open={!!artifactDrawer}
        onOpenChange={(v) => !v && setArtifactDrawer(null)}
        onAction={(action, a) => {
          setSelectedArtifactId(a.id);
          if (action === "Open in Workbench") { setArtifactDrawer(null); setView("workbench"); focusPanel("panel-workbench"); }
          else workbenchAction(action);
        }} />

      <QualityDetailDrawer name={qualityDetail} open={!!qualityDetail} onOpenChange={(v) => !v && setQualityDetail(null)} />

      {confirm && (
        <ConfirmDialog open onOpenChange={(v) => !v && setConfirm(null)} title={confirm.title}
          description={confirm.description} confirmLabel={confirm.label} requireReason={confirm.reason}
          onConfirm={(r) => { confirm.run(r); setConfirm(null); }} />
      )}

      {/* demo story */}
      {story >= 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/97 px-5 py-2.5 shadow-lg backdrop-blur"
          role="region" aria-label="Demo story">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">
              Step {story + 1} of {STORY.length}
            </span>
            <p className="flex-1 text-[12.5px] text-slate-800">{STORY[story].caption}</p>
            <Button size="sm" variant="outline" className="h-7 text-[11.5px]" disabled={story === 0} onClick={() => setStory((s) => s - 1)}>Previous</Button>
            <Button size="sm" className="h-7 text-[11.5px]" disabled={story === STORY.length - 1} onClick={() => setStory((s) => s + 1)}>Next</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => setPresenterNotes((p) => !p)}>
              {presenterNotes ? "Hide" : "Show"} Presenter Notes
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-[11.5px]" onClick={() => setStory(-1)}>Exit Story</Button>
          </div>
          {presenterNotes && <p className="mt-1 text-[11.5px] text-slate-500">{STORY[story].notes}</p>}
        </div>
      )}
    </div>
  );
}
