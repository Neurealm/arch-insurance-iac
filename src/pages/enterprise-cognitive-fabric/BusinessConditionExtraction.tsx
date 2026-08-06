import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bell, CircleHelp, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
  AuthorityPanel, BaselineTargetPanel, ConditionDetailDrawer, ConditionsInventoryPanel, DependencyGraphPanel,
  DownstreamReadinessPanel, JobDetailDrawer, JobTablePanel, LifecyclePanel, Panel, QualityDetailDrawer,
  QualityPanel, RegistryReadinessPanel, StageDetailPanel, StatusPill, TaxonomyPanel, TypeDistributionPanel,
  WorkbenchPanel, compact, jobColumns, nf, type Density, type DistMetric,
} from "./business-condition-extraction/panels";
import {
  ConfirmDialog, GlobalSearchDialog, PlaceholderDialog, StartExtractionDialog,
} from "./business-condition-extraction/dialogs";
import {
  activeFilterCount, candidates as seedCandidates, conditions as allConditions, defaultFilters, filterLabels,
  filterOptions, kpiTrends, lifecycleCallouts, makeExtractionJob, metricModels, notificationsSeed, readiness as seedReadiness,
  resolveConditions, resolveJobs, resolveStages, sidebarStatus,
  type BusinessCondition, type ConditionCandidate, type ExtractionJob, type Filters, type ServiceState, type ViewMode,
} from "./business-condition-extraction/data";
import {
  ActivityPanel, ApprovalGovernancePanel, ConflictGapPanel, DemoStoryOverlay, PublishingPanel,
  ReviewQueuePanel, ScenarioBanner, TaxonomyAdminPanel, VersionHistoryPanel,
} from "./business-condition-extraction/governance-panels";
import {
  ApprovalDialog, BulkActionsDialog, ConflictResolutionDialog, DownstreamImpactDialog, ExportConditionsDialog,
  GovernanceSearchDialog, MergeSplitDialog, PauseResumeDialog, PublishHistoryDialog, PublishWizardDialog,
  ReprocessDialog, ReviewWorkbenchDialog, SupersedeDialog, TaxonomyCompareDialog, TaxonomyTestDialog,
  VersionCompareDialog,
} from "./business-condition-extraction/governance-dialogs";
import {
  activitySeed, conditionVersions, conflictRows as seedConflictRows, demoSteps, governanceNotifications,
  publishDestinations, reviewsSeed, scenarioById, scenarios,
  type ConditionReview, type ConditionVersion, type ConflictRow, type ExtractionActivity, type ScenarioId,
} from "./business-condition-extraction/governance-data";


const VIEWS: { id: ViewMode; label: string }[] = [
  { id: "executive", label: "Executive" },
  { id: "operations", label: "Operations" },
  { id: "workbench", label: "Workbench" },
  { id: "governance", label: "Governance" },
];

const LS = (k: string) => `ecf.bce.${k}`;

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
      <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">{sub}</p>
      <svg viewBox="0 0 100 30" className="mt-1 h-7 w-full" preserveAspectRatio="none" aria-hidden>
        <polyline points={points} fill="none" stroke="#94a3b8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </button>
  );
}

export default function BusinessConditionExtraction() {
  const navigate = useNavigate();

  /* persisted preferences */
  const [view, setView] = useState<ViewMode>(() =>
    (typeof window !== "undefined" && (localStorage.getItem(LS("view")) as ViewMode)) || "executive");
  const [density, setDensity] = useState<Density>(() =>
    (typeof window !== "undefined" && (localStorage.getItem(LS("density")) as Density)) || "compact");
  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window === "undefined") return defaultFilters;
    try { return { ...defaultFilters, ...JSON.parse(localStorage.getItem(LS("filters")) ?? "{}") }; }
    catch { return defaultFilters; }
  });
  const [draftFilters, setDraftFilters] = useState<Filters>(filters);
  const [columns, setColumns] = useState<string[]>(() => {
    if (typeof window === "undefined") return jobColumns;
    try { return JSON.parse(localStorage.getItem(LS("columns")) ?? "null") ?? jobColumns; } catch { return jobColumns; }
  });
  const [selectedStageId, setSelectedStageId] = useState<string>(() =>
    (typeof window !== "undefined" && localStorage.getItem(LS("stage"))) || "conflicts");
  const [selectedConditionId, setSelectedConditionId] = useState<string>(() =>
    (typeof window !== "undefined" && localStorage.getItem(LS("condition"))) || "COND-100421");
  const [metricId, setMetricId] = useState<string>(() =>
    (typeof window !== "undefined" && localStorage.getItem(LS("metric"))) || "error-rate");
  const [savedView, setSavedView] = useState<string | null>(() =>
    (typeof window !== "undefined" && localStorage.getItem(LS("savedView"))) || null);

  useEffect(() => { localStorage.setItem(LS("view"), view); }, [view]);
  useEffect(() => { localStorage.setItem(LS("density"), density); }, [density]);
  useEffect(() => { localStorage.setItem(LS("filters"), JSON.stringify(filters)); }, [filters]);
  useEffect(() => { localStorage.setItem(LS("columns"), JSON.stringify(columns)); }, [columns]);
  useEffect(() => { localStorage.setItem(LS("stage"), selectedStageId); }, [selectedStageId]);
  useEffect(() => { localStorage.setItem(LS("condition"), selectedConditionId); }, [selectedConditionId]);
  useEffect(() => { localStorage.setItem(LS("metric"), metricId); }, [metricId]);

  /* session state */
  const [serviceState, setServiceState] = useState<ServiceState>("Operational");
  const [lastUpdated, setLastUpdated] = useState("10:04");
  const [extraJobs, setExtraJobs] = useState<ExtractionJob[]>([]);
  const [jobOverrides, setJobOverrides] = useState<Record<string, Partial<ExtractionJob>>>({});
  const [candidateStates, setCandidateStates] = useState<Record<string, ConditionCandidate["candidateStatus"]>>({});
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>("CAND-1");
  const [highlightField, setHighlightField] = useState<string | null>(null);
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatus, setJobStatus] = useState("All");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [conditionSearch, setConditionSearch] = useState("");
  const [activeFamily, setActiveFamily] = useState<string | null>(null);
  const [lifecycleFocus, setLifecycleFocus] = useState("all");
  const [lifecycleZoom, setLifecycleZoom] = useState(1);
  const [distMetric, setDistMetric] = useState<DistMetric>("Condition Count");
  const [relFilter, setRelFilter] = useState("All");
  const [directOnly, setDirectOnly] = useState(false);
  const [notifications, setNotifications] = useState(notificationsSeed);
  const [announce, setAnnounce] = useState("");

  /* dialogs and drawers */
  const [filterOpen, setFilterOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState<{ title: string; detail: string } | null>(null);
  const [qualityDetail, setQualityDetail] = useState<string | null>(null);
  const [jobDrawer, setJobDrawer] = useState<ExtractionJob | null>(null);
  const [conditionDrawer, setConditionDrawer] = useState<BusinessCondition | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; description: string; label: string; run: () => void } | null>(null);

  const say = useCallback((message: string) => { setAnnounce(message); toast(message); }, []);
  const focusPanel = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start",
    });
  }, []);

  /* derived */
  const stages = useMemo(() => resolveStages(), []);
  const stage = stages.find((s) => s.id === selectedStageId) ?? stages[7];
  const jobs = useMemo(() => resolveJobs(filters, jobOverrides, extraJobs), [filters, jobOverrides, extraJobs]);
  const conditionRows = useMemo(() => {
    const list = resolveConditions(filters);
    return activeFamily ? list.filter((c) => c.conditionTypeId.includes(activeFamily.replace(/s$/, ""))) : list;
  }, [filters, activeFamily]);
  const workbenchCondition = allConditions.find((c) => c.id === selectedConditionId) ?? allConditions[0];
  const metric = metricModels.find((m) => m.id === metricId) ?? metricModels[0];
  const filterCount = activeFilterCount(filters);
  const unread = notifications.filter((n) => !n.read).length;
  const readiness = seedReadiness;

  const applyFilters = () => {
    setFilters(draftFilters);
    say(`${activeFilterCount(draftFilters)} filters applied`);
  };
  const clearFilters = () => { setDraftFilters(defaultFilters); setFilters(defaultFilters); say("Filters cleared"); };
  const saveView = () => {
    const name = `View ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    setSavedView(name); localStorage.setItem(LS("savedView"), name); say(`Saved view ${name}`);
  };

  const candidateAction = (id: string, action: string) => {
    const candidate = seedCandidates.find((c) => c.id === id);
    if (action === "Accept") setCandidateStates((s) => ({ ...s, [id]: "Accepted" }));
    else if (action === "Reject") setCandidateStates((s) => ({ ...s, [id]: "Rejected" }));
    else if (action === "Mark assumption") setCandidateStates((s) => ({ ...s, [id]: "Review Required" }));
    else if (action === "Open evidence") setSelectedCandidateId(id);
    say(`${action} — ${candidate?.candidateStatement ?? id}`);
  };

  /* ---------------------------------------------------------- prompt 2 state */
  const [scenario, setScenario] = useState<ScenarioId | null>(null);
  const sc = scenario ? scenarioById(scenario) : null;
  const kpi = sc?.kpi ?? { extracted: 94_812, approved: 87_442, jobs: "14", quality: "93/100", review: 427, ready: 82_906 };
  const conflictCount = sc?.conflicts ?? 148;
  const reviewCount = sc?.reviews ?? 427;
  const publishState = sc?.publishingState ?? "Healthy";
  const operationalState = sc?.operationalState ?? "Healthy";

  const [reviews, setReviews] = useState<ConditionReview[]>(reviewsSeed);
  const [reviewCategory, setReviewCategory] = useState("All");
  const [reviewSearch, setReviewSearch] = useState("");
  const [activeReview, setActiveReview] = useState<ConditionReview | null>(null);
  const [conflictRows, setConflictRows] = useState<ConflictRow[]>(seedConflictRows);
  const [issueFilter, setIssueFilter] = useState("All");
  const [activeConflict, setActiveConflict] = useState<ConflictRow | null>(null);
  const [mergeMode, setMergeMode] = useState<"merge" | "split" | null>(null);
  const [taxonomyTypeId, setTaxonomyTypeId] = useState("service-level-objective");
  const [taxonomyTest, setTaxonomyTest] = useState<string | null>(null);
  const [taxonomyCompare, setTaxonomyCompare] = useState(false);
  const [versions, setVersions] = useState<ConditionVersion[]>(conditionVersions);
  const [versionSelection, setVersionSelection] = useState<string[]>(["VER-3.1", "VER-3.2"]);
  const [versionCompareOpen, setVersionCompareOpen] = useState(false);
  const [supersedeVersion, setSupersedeVersion] = useState<ConditionVersion | null>(null);
  const [approvalStage, setApprovalStage] = useState("Governance Review");
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [pausedDestinations, setPausedDestinations] = useState<string[]>([]);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishHistoryOpen, setPublishHistoryOpen] = useState(false);
  const [impactOpen, setImpactOpen] = useState(false);
  const [impactAfter, setImpactAfter] = useState<(() => void) | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [reprocessOpen, setReprocessOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [extractionPaused, setExtractionPaused] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [govSearchOpen, setGovSearchOpen] = useState(false);
  const [activity, setActivity] = useState<ExtractionActivity[]>(activitySeed);
  const [govNotifications, setGovNotifications] = useState(governanceNotifications);
  const [notifCategory, setNotifCategory] = useState("All");
  const [demoStep, setDemoStep] = useState<number | null>(null);
  const [loadingGovernance, setLoadingGovernance] = useState(false);

  const govUnread = govNotifications.filter((n) => !n.read).length;

  const logActivity = useCallback((action: string, description: string, extra: Partial<ExtractionActivity> = {}) => {
    setActivity((list) => [{
      id: `ACT-${Math.floor(Math.random() * 9000 + 1000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      action, description, conditionId: null, candidateId: null, jobId: null, conflictId: null, reviewId: null,
      sourceId: "Extraction Service", teamId: "Knowledge Governance", result: "Success",
      owner: "Alex Valencia", auditId: `AUD-${Math.floor(Math.random() * 90000 + 10000)}`,
      ...extra,
    } as ExtractionActivity, ...list].slice(0, 24));
  }, []);

  const requireImpact = (run: () => void) => { setImpactAfter(() => run); setImpactOpen(true); };

  const reviewAction = (action: string, r: ConditionReview) => {
    setReviews((list) => list.map((x) => x.id !== r.id ? x : {
      ...x,
      status: action === "Approve" ? "Approved" : action === "Reject" ? "Rejected"
        : action === "Escalate" ? "Escalated" : action === "Request Clarification" ? "Clarification Requested" : x.status,
      completedAt: action === "Approve" || action === "Reject" ? "now" : x.completedAt,
    }));
    logActivity(`Review ${action}`, `${action} — ${r.conditionCandidate}`, { reviewId: r.id, conditionId: r.conditionId, result: action === "Reject" ? "Warning" : "Success" });
    say(`${action} — review ${r.id}`);
  };

  const reviewDecision = (action: string, r: ConditionReview, comment: string) => {
    const approved = action === "Approve Candidate";
    setReviews((list) => list.map((x) => x.id !== r.id ? x : {
      ...x, status: approved ? "Approved" : action === "Reject Candidate" ? "Rejected" : "In Review",
      decision: action, comments: comment ? [...x.comments, comment] : x.comments,
      completedAt: approved || action === "Reject Candidate" ? "now" : null,
    }));
    logActivity(approved ? "Condition Approved" : "Review Decision", `${action} — ${r.conditionCandidate}${comment ? ` · ${comment}` : ""}`,
      { reviewId: r.id, conditionId: r.conditionId, result: approved ? "Success" : "Pending" });
    say(`${action} recorded for ${r.id}. Condition state, quality, confidence, and readiness recalculated.`);
  };

  const conflictAction = (action: string, c: ConflictRow) => {
    if (action === "Merge") { setMergeMode("merge"); return; }
    if (action === "Supersede") { setSupersedeVersion(versions[1]); return; }
    setConflictRows((list) => list.map((x) => x.id !== c.id ? x : {
      ...x, status: action === "Acknowledge" ? "Acknowledged" : action === "Assign" ? "Assigned" : x.status,
    }));
    if (action === "Create Review Task") {
      setReviews((list) => [{
        ...reviewsSeed[1], id: `REV-${2400 + list.length + 1}`, conditionCandidate: c.condition,
        reviewType: "Conflict Resolution", reason: c.detail, status: "Open", conflictId: c.id,
      }, ...list]);
    }
    logActivity(`Conflict ${action}`, `${action} — ${c.condition}`, { conflictId: c.id, result: "Pending" });
    say(`${action} — ${c.id}`);
  };

  const resolveConflict = (choice: string, c: ConflictRow, details: { reason: string }) => {
    setConflictRows((list) => list.map((x) => x.id === c.id ? { ...x, status: "Resolved" } : x));
    setReviews((list) => list.map((x) => x.conflictId === c.id ? { ...x, status: "Approved", decision: choice } : x));
    setVersions((list) => [{
      ...list[0], id: `VER-${(Number(list[0].version) + 0.1).toFixed(1)}`,
      version: (Number(list[0].version) + 0.1).toFixed(1), previousVersionId: list[0].id,
      changeType: "Value Change", changeSummary: `${choice} — ${details.reason}`, status: "Current",
      changedBy: "Alex Valencia", changedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    }, ...list.map((v) => v.id === list[0].id ? { ...v, status: "Superseded" as const } : v)]);
    logActivity("Conflict Resolved", `${choice} — ${c.condition} · ${details.reason}`, { conflictId: c.id, result: "Success" });
    setScenario("conflict-resolved");
    say(`Conflict ${c.id} resolved with ${choice}. Versions created, conflict counts, quality, registry readiness, persona readiness, and context graph updated.`);
  };

  const applyScenario = (id: ScenarioId) => {
    setLoadingGovernance(true);
    const s = scenarioById(id);
    setScenario(id === "reset" ? null : id);
    setServiceState(s.serviceState as ServiceState);
    setExtractionPaused(id === "paused");
    if (id === "reset") {
      setReviews(reviewsSeed); setConflictRows(seedConflictRows); setVersions(conditionVersions);
      setActivity(activitySeed); setGovNotifications(governanceNotifications); setPausedDestinations([]);
    }
    setGovNotifications((list) => [{
      id: `N-${Math.floor(Math.random() * 9000)}`, category: s.notification, title: s.label,
      detail: s.banner, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false, targetId: null, targetKind: "panel" as const,
    }, ...list]);
    logActivity("Scenario Applied", s.activity, { result: s.operationalState === "Healthy" ? "Success" : "Warning" });
    setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setTimeout(() => setLoadingGovernance(false), 220);
    say(`Scenario ${s.label} applied. ${s.banner}`);
  };

  const versionAction = (action: string, v: ConditionVersion) => {
    if (action === "Compare") { setVersionCompareOpen(true); return; }
    if (action === "Supersede") { setSupersedeVersion(v); return; }
    if (action === "Export") { setExportOpen(true); return; }
    if (action === "Mark Historical") {
      setVersions((list) => list.map((x) => x.id === v.id ? { ...x, status: "Historical" } : x));
    }
    if (action === "Restore as Draft") {
      setVersions((list) => [{ ...v, id: `${v.id}-draft`, version: `${v.version}-draft`, status: "Draft" }, ...list]);
    }
    logActivity(`Version ${action}`, `${action} — ${v.conditionId} v${v.version}`, { conditionId: v.conditionId });
    say(`${action} — version ${v.version}`);
  };


  const jobAction = (action: string, job: ExtractionJob) => {
    if (action === "Pause Job") setJobOverrides((o) => ({ ...o, [job.id]: { status: "Paused" } }));
    if (action === "Resume Job") setJobOverrides((o) => ({ ...o, [job.id]: { status: "Running" } }));
    if (action === "Cancel Job") setJobOverrides((o) => ({ ...o, [job.id]: { status: "Queued" } }));
    if (action === "Open Condition Workbench") { setJobDrawer(null); focusPanel("panel-workbench"); }
    say(`${action} — ${job.id}`);
  };

  const showKpiDetail = (title: string, detail: string, panel?: string) => {
    if (panel) focusPanel(panel);
    setPlaceholder({ title, detail });
  };

  const refresh = () => {
    setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setServiceState("Operational");
    say("Extraction service status refreshed");
  };

  return (
    <div className="min-h-full bg-slate-50">
      <p aria-live="polite" className="sr-only">{announce}</p>

      {/* header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Link to="/enterprise-cognitive-fabric" className="hover:text-blue-700">Enterprise Cognitive Fabric</Link>
              <span aria-hidden>/</span>
              <Link to="/enterprise-cognitive-fabric/enterprise-source-discovery" className="hover:text-blue-700">Discovery</Link>
              <span aria-hidden>/</span>
              <span className="font-medium text-slate-700">Business Condition Extraction</span>
            </nav>
            <h1 className="text-[19px] font-bold leading-tight text-slate-900">Business Condition Extraction</h1>
            <p className="text-[12px] text-slate-500">
              Convert normalized organizational knowledge into traceable, reusable business conditions
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setSearchOpen(true)}>
              <Search className="mr-1 h-3.5 w-3.5" />Search
            </Button>
            <Button size="sm" variant="outline" className="relative h-7 w-7 p-0" aria-label="Notifications" onClick={() => setNotifOpen(true)}>
              <Bell className="h-3.5 w-3.5" />
              {unread > 0 && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-red-600 text-[9px] font-semibold text-white">{unread}</span>}
            </Button>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" aria-label="Help" onClick={() => setHelpOpen(true)}>
              <CircleHelp className="h-3.5 w-3.5" />
            </Button>
            <div className="flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-1">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">AV</span>
              <span className="hidden text-[11px] leading-tight sm:block">
                <span className="block font-medium text-slate-800">Alex Valencia</span>
                <span className="block text-slate-500">Chief Architect</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <div className="flex rounded-md border border-slate-200 p-0.5" role="tablist" aria-label="Page view">
            {VIEWS.map((v) => (
              <button key={v.id} role="tab" aria-selected={view === v.id} onClick={() => { setView(v.id); say(`${v.label} view`); }}
                className={cn("rounded px-2 py-1 text-[11px]", view === v.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100")}>
                {v.label}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={refresh}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => setStartOpen(true)}>Start Extraction</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { focusPanel("panel-taxonomy-admin"); say("Taxonomy management opened"); }}>Configure Taxonomy</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { focusPanel("panel-reviews"); say("Human review queue focused"); }}>Review Queue</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setExportOpen(true)}>Export Conditions</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setPauseOpen(true)}>
            {extractionPaused ? "Resume Extraction" : "Pause Extraction"}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setFilterOpen((v) => !v)}>
            <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />Filters{filterCount > 0 && <Badge className="ml-1 h-4 px-1 text-[10px]">{filterCount}</Badge>}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-7 text-[11px]">More</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[70vh] overflow-y-auto">
              <DropdownMenuItem className="text-[11.5px] font-medium" onClick={() => setDemoStep(0)}>Demo Story</DropdownMenuItem>
              <DropdownMenuItem className="text-[11.5px]" onClick={() => setGovSearchOpen(true)}>Search conditions</DropdownMenuItem>
              <DropdownMenuItem className="text-[11.5px]" onClick={() => setReprocessOpen(true)}>Reprocess with Updated Taxonomy</DropdownMenuItem>
              <DropdownMenuItem className="text-[11.5px]" onClick={() => setMergeMode("merge")}>Merge Conditions</DropdownMenuItem>
              <DropdownMenuItem className="text-[11.5px]" onClick={() => setMergeMode("split")}>Split Condition</DropdownMenuItem>
              <DropdownMenuItem className="text-[11.5px]" onClick={() => setImpactOpen(true)}>Downstream Impact Preview</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px]">Demo scenarios</DropdownMenuLabel>
              {scenarios.map((s) => (
                <DropdownMenuItem key={s.id} className="text-[11.5px]" onClick={() => applyScenario(s.id)}>{s.label}</DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px]">Extraction service</DropdownMenuLabel>
              {(["Operational", "Extracting", "Degraded", "Paused", "Backlogged", "Review Required", "Maintenance"] as ServiceState[]).map((s) => (
                <DropdownMenuItem key={s} className="text-[11.5px]" onClick={() => { setServiceState(s); say(`Service state ${s}`); }}>{s}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <StatusPill status={serviceState} />
          <span className="text-[11px] text-slate-500">Last updated {lastUpdated}</span>
        </div>

        {filterOpen && (
          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="grid gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
              {Object.keys(filterOptions).map((key) => (
                <label key={key} className="text-[10px] uppercase tracking-wide text-slate-500">
                  {filterLabels[key]}
                  <select value={draftFilters[key]} onChange={(e) => setDraftFilters({ ...draftFilters, [key]: e.target.value })}
                    className="mt-0.5 h-7 w-full rounded-md border border-slate-200 bg-white px-1.5 text-[11px] normal-case text-slate-700">
                    {filterOptions[key].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <Button size="sm" className="h-7 text-[11px]" onClick={applyFilters}>Apply Filters</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={clearFilters}>Clear Filters</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={saveView}>Save View</Button>
              <span className="text-[11px] text-slate-500">{activeFilterCount(draftFilters)} filters selected</span>
            </div>
          </div>
        )}
      </header>

      <main className="space-y-3 px-4 py-3">
        {sc && <ScenarioBanner label={sc.label} message={sc.banner} state={operationalState} onReset={() => applyScenario("reset")} />}

        {/* KPIs */}
        <div id="panel-kpis" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
          <Kpi label="Conditions Extracted" value={nf(kpi.extracted)} sub="+6,240 this week" trend={kpiTrends.extracted}
            tooltip="Total condition records produced across all extraction jobs"
            onClick={() => showKpiDetail("Conditions Extracted", "By condition type, source, team, domain, and authority — see Condition Type Distribution and Taxonomy panels.", "panel-distribution")} />
          <Kpi label="Approved Conditions" value={nf(kpi.approved)} sub="92 percent · Healthy" tone="green" trend={kpiTrends.approved}
            tooltip="Conditions approved and eligible for publication"
            onClick={() => { setFilters({ ...filters, approvalState: "Approved" }); setDraftFilters({ ...filters, approvalState: "Approved" }); focusPanel("panel-inventory"); say("Inventory filtered to approved conditions"); }} />
          <Kpi label="Active Extraction Jobs" value={kpi.jobs} sub="11 Healthy · 2 Warning · 1 Blocked" trend={kpiTrends.jobs}
            tooltip="Jobs currently executing extraction stages"
            onClick={() => { focusPanel("panel-jobs"); say("Focused active extraction jobs"); }} />
          <Kpi label="Extraction Quality" value={kpi.quality} sub="Target 95 · Near Target" tone="amber" trend={kpiTrends.quality}
            tooltip="Composite quality across ten measured dimensions"
            onClick={() => { focusPanel("panel-quality"); say("Focused extraction quality"); }} />
          <Kpi label="Conditions Requiring Review" value={nf(reviewCount)} sub="148 conflicts · 92 missing owners · 74 low confidence · 61 missing evidence · 52 ambiguous values" tone="amber" trend={kpiTrends.review}
            tooltip="Candidates blocked pending human validation"
            onClick={() => { setSelectedStageId("validation"); focusPanel("panel-stage"); say("Focused review and exception summary"); }} />
          <Kpi label="Ready for Persona and Impact Use" value={nf(kpi.ready)} sub="87 percent · approved, current, evidence linked, conflict free" tone="green" trend={kpiTrends.ready}
            tooltip="Approved, current, evidence linked, and conflict free"
            onClick={() => { focusPanel("panel-downstream"); say("Focused downstream readiness"); }} />
        </div>

        {/* lifecycle + stage detail (all views except executive-lite) */}
        {view !== "workbench" && (
          <>
            <LifecyclePanel stages={stages} selectedId={stage.id} onSelect={(id) => { setSelectedStageId(id); focusPanel("panel-stage"); }}
              focus={lifecycleFocus} onFocus={setLifecycleFocus} zoom={lifecycleZoom} onZoom={setLifecycleZoom} callouts={lifecycleCallouts} />
            {view === "operations" && (
              <StageDetailPanel stage={stage} onAction={(a) => {
                if (a === "Open Workbench") focusPanel("panel-workbench");
                else if (a === "Retry Failures") setConfirm({ title: "Retry failures", description: `Retry ${nf(stage.failedCount)} failed items in ${stage.name}?`, label: "Retry", run: () => say("Retry requested") });
                else say(`${a} — ${stage.name}`);
              }} />
            )}
          </>
        )}

        {view === "governance" && <StageDetailPanel stage={stage} onAction={(a) => say(`${a} — ${stage.name}`)} />}

        {(view === "operations" || view === "workbench") && (
          <JobTablePanel jobs={jobs} density={density} onDensity={setDensity} columns={columns} onColumns={setColumns}
            search={jobSearch} onSearch={setJobSearch} statusFilter={jobStatus} onStatusFilter={setJobStatus}
            selected={selectedJobs} onSelected={setSelectedJobs} onOpen={setJobDrawer}
            onExport={() => setPlaceholder({ title: "Export current view", detail: "Job export is delivered in Prompt 2." })} />
        )}

        <WorkbenchPanel
          candidateStates={candidateStates} onCandidateAction={candidateAction}
          selectedCandidateId={selectedCandidateId} onSelectCandidate={setSelectedCandidateId}
          highlightField={highlightField} onHighlightField={setHighlightField}
          condition={workbenchCondition}
          onEntity={(name) => say(`Canonical entity: ${name}`)}
          onEvidence={(id) => say(`Evidence reference ${id} opened`)}
          onSaveDraft={() => say(`Draft saved for ${workbenchCondition.id}`)}
        />

        <ConditionsInventoryPanel conditionsList={conditionRows} view={view} density={density}
          search={conditionSearch} onSearch={setConditionSearch}
          onOpen={(c) => { setConditionDrawer(c); setSelectedConditionId(c.id); }}
          onBulk={() => setBulkOpen(true)}
          savedView={savedView} onSaveView={saveView} />

        <div className="grid gap-3 xl:grid-cols-2">
          <TaxonomyPanel activeFamily={activeFamily} onFamily={(f) => { setActiveFamily(f); focusPanel("panel-inventory"); }} />
          <TypeDistributionPanel metric={distMetric} onMetric={setDistMetric}
            onSelect={(type) => { setActiveFamily(type); focusPanel("panel-inventory"); say(`Inventory filtered to ${type}`); }} />
        </div>

        <BaselineTargetPanel metric={metric} onMetric={setMetricId}
          onAction={(a) => { if (a === "View Related Conditions") focusPanel("panel-inventory"); say(`${a} — ${metric.name}`); }} />

        <div className="grid gap-3 xl:grid-cols-2">
          <AuthorityPanel onAction={(a) => say(`${a} — ${workbenchCondition.id}`)} />
          <DependencyGraphPanel relFilter={relFilter} onRelFilter={setRelFilter} directOnly={directOnly} onDirectOnly={setDirectOnly}
            onOpenNode={(label) => say(`Opened related record: ${label}`)} />
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          <QualityPanel onOpenDetail={setQualityDetail} />
          <RegistryReadinessPanel readiness={readiness} onFocus={(what) => { focusPanel(what === "approved" ? "panel-inventory" : "panel-stage"); }} />
        </div>

        <ReviewQueuePanel reviews={reviews} density={density} loading={loadingGovernance}
          categoryFilter={reviewCategory} onCategoryFilter={setReviewCategory}
          search={reviewSearch} onSearch={setReviewSearch}
          onOpen={(r) => setActiveReview(r)} onAction={reviewAction} />

        <ConflictGapPanel rows={conflictRows} density={density} loading={loadingGovernance}
          issueFilter={issueFilter} onIssueFilter={setIssueFilter}
          onOpenComparison={(c) => setActiveConflict(c)} onAction={conflictAction} />

        <TaxonomyAdminPanel selectedId={taxonomyTypeId} onSelect={setTaxonomyTypeId}
          onAction={(a, name) => {
            if (a === "Test Against Sample") setTaxonomyTest(name);
            else if (a === "Compare Versions") setTaxonomyCompare(true);
            else { logActivity("Taxonomy Updated", `${a} — ${name}`); say(`${a} — ${name}`); }
          }} />

        <VersionHistoryPanel versions={versions} density={density} selectedIds={versionSelection}
          onToggle={(id) => setVersionSelection((sel) => sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id].slice(-2))}
          onAction={versionAction} />

        <ApprovalGovernancePanel stage={approvalStage} onStage={setApprovalStage}
          onAction={() => setApprovalOpen(true)} />

        <PublishingPanel destinations={publishDestinations} pausedIds={pausedDestinations} publishState={publishState}
          onPublish={() => requireImpact(() => setPublishOpen(true))}
          onRepublish={() => setPublishOpen(true)}
          onHistory={() => setPublishHistoryOpen(true)}
          onPause={(id) => {
            setPausedDestinations((list) => list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
            say(`Destination ${id} ${pausedDestinations.includes(id) ? "resumed" : "paused"}`);
          }} />

        <ActivityPanel activity={activity} density={density}
          onOpen={(a) => {
            if (a.conditionId) { const c = allConditions.find((x) => x.id === a.conditionId); if (c) { setConditionDrawer(c); return; } }
            if (a.reviewId) { const r = reviews.find((x) => x.id === a.reviewId); if (r) { setActiveReview(r); return; } }
            if (a.conflictId) { const cf = conflictRows.find((x) => x.id === a.conflictId); if (cf) { setActiveConflict(cf); return; } }
            say(`Audit ${a.auditId} — ${a.description}`);
          }} />

        <DownstreamReadinessPanel readiness={readiness}
          onProceed={() => navigate("/enterprise-cognitive-fabric/persona-studio/team-persona-construction")}
          onRegistry={() => navigate("/enterprise-cognitive-fabric/cognitive-memory/conditions-registry")} />
      </main>

      {/* dialogs and drawers */}
      <StartExtractionDialog open={startOpen} onOpenChange={setStartOpen}
        onComplete={(s) => {
          setExtraJobs((j) => [makeExtractionJob({
            scope: "Operator initiated extraction", source: "Confluence Cloud", knowledgeDomain: "Payments and Reliability",
            artifactCount: s.artifacts, candidateCount: s.candidates, approvedConditionCount: s.conditions,
            conflictCount: s.conflicts, gapCount: s.gaps, humanReviewCount: s.reviews, status: "Running",
            currentStageId: "detect", currentStageName: "Detect Condition Candidates", startedAt: "10:06", elapsedTime: "0m",
          }), ...j]);
          say(`Extraction complete — ${nf(s.conditions)} conditions prepared`);
        }}
        onOpenJob={() => focusPanel("panel-jobs")}
        onOpenWorkbench={() => focusPanel("panel-workbench")} />

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen}
        onSelect={(id, kind) => {
          if (kind === "Condition") { const c = allConditions.find((x) => x.id === id); if (c) { setConditionDrawer(c); setSelectedConditionId(c.id); } }
          else if (kind === "Job") { const j = jobs.find((x) => x.id === id); if (j) setJobDrawer(j); }
          else if (kind === "Stage") { setSelectedStageId(id); focusPanel("panel-stage"); }
          else focusPanel("panel-workbench");
        }} />

      <PlaceholderDialog open={!!placeholder} onOpenChange={(o) => !o && setPlaceholder(null)}
        title={placeholder?.title ?? ""} detail={placeholder?.detail ?? ""} />

      <ConfirmDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.title ?? ""} description={confirm?.description ?? ""} confirmLabel={confirm?.label ?? "Confirm"}
        onConfirm={() => confirm?.run()} />

      <QualityDetailDrawer id={qualityDetail} open={!!qualityDetail} onOpenChange={(o) => !o && setQualityDetail(null)} />
      <JobDetailDrawer job={jobDrawer} open={!!jobDrawer} onOpenChange={(o) => !o && setJobDrawer(null)} onAction={jobAction} />
      <ConditionDetailDrawer condition={conditionDrawer} open={!!conditionDrawer} onOpenChange={(o) => !o && setConditionDrawer(null)}
        onAction={(a, c) => {
          if (a === "Open Related Persona") navigate("/enterprise-cognitive-fabric/persona-studio/team-persona-construction");
          else if (a === "Open Impact Analysis") setPlaceholder({ title: "Impact Analysis", detail: "Impact evaluation opens from the Cognitive Memory module." });
          else say(`${a} — ${c.id}`);
        }} />

      <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle className="text-[14px]">Notifications</SheetTitle>
            <SheetDescription className="text-[11.5px]">{unread} unread</SheetDescription>
          </SheetHeader>
          <ul className="mt-3 space-y-1.5">
            {notifications.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => setNotifications((list) => list.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                  className={cn("w-full rounded-md border px-2 py-1.5 text-left", n.read ? "border-slate-200" : "border-blue-200 bg-blue-50")}>
                  <p className="text-[11.5px] font-medium text-slate-800">{n.title}</p>
                  <p className="text-[11px] text-slate-500">{n.detail}</p>
                </button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      <Sheet open={helpOpen} onOpenChange={setHelpOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle className="text-[14px]">About this stage</SheetTitle>
            <SheetDescription className="text-[11.5px]">
              Business Condition Extraction turns normalized organizational knowledge into atomic, structured,
              traceable business conditions. Every condition keeps passage-level evidence, resolved ownership,
              authority scoring, and dependency context.
            </SheetDescription>
          </SheetHeader>
          <ul className="mt-3 space-y-1 text-[11.5px] text-slate-600">
            <li>· Service status: {serviceState} · {compact(sidebarStatus.approvedConditions)} approved conditions</li>
            <li>· Active jobs: {sidebarStatus.activeJobs} · Candidates in review: {sidebarStatus.candidatesInReview}</li>
            <li>· Conflict resolution, approval governance, publication, and export arrive in Prompt 2.</li>
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}
