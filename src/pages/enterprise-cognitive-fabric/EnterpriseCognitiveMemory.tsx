/**
 * Enterprise Cognitive Memory — governed organizational memory layer of the
 * Enterprise Cognitive Fabric. Operational page inside the existing ECF shell.
 */

import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, Filter, RefreshCw } from "lucide-react";
import { FilterSelect, Pill } from "./persona-studio/primitives";
import { exportCsv, exportJson, downloadBlob } from "@/lib/operations/exports";
import {
  ArchitecturePanel, CompositionPanel, ContextGraphPanel, ExplorerPanel, FreshnessAuthorityPanel,
  IndexingPanel, LifecyclePanel, MemoryKpiCard, Panel, ProvenancePanel, QualityPanel,
  SelectedStagePanel, explorerColumns, type Density,
} from "./cognitive-memory/panels";
import { MemoryWorkbench, initialWorkbenchState, type WorkbenchState } from "./cognitive-memory/workbench";
import { IndexingDrawer, QualityDrawer, RecordDrawer } from "./cognitive-memory/drawers";
import {
  activeMemoryFilterCount, applyMemoryFilters, defaultMemoryFilters, memoryFilterLabels,
  memoryFilterOptions, memoryIndexingJobs, memoryKpis, memoryLifecycleStages, memoryRecords,
  recordToRow, savedViews,
  type MemoryFilters, type MemoryIndexingJob, type MemoryRecord, type MemoryServiceState,
  type MemoryView, type FlowMode,
} from "./cognitive-memory/data";
import {
  GovernanceOverviewPanel, GovernanceQueuePanel, ConflictsPanel, DriftPanel, AccessPanel,
  RetentionPanel, PublishingPanel, McpServicesPanel, UsagePanel, LearningPanel, ActivityPanel,
  QualityDetailBody, StateBanner, defaultQueueFilters, type QueueFilters,
} from "./cognitive-memory/governance-panels";
import {
  CurationWorkbench, PointInTimePanel, SnapshotsPanel, AccessSimulator, AgentContextSimulator,
  buildAgentSimulation, initialCurationDecision, type CurationDecisionState,
} from "./cognitive-memory/curation";
import {
  ReviewDrawer, ConflictDrawer, DriftDrawer, MergeDialog, SupersessionDialog, RefreshDialog,
  CreateSnapshotDialog, PublishDialog, GlobalSearchDialog, NotificationsDrawer, ExportDialog,
  DemoStoryOverlay,
} from "./cognitive-memory/workflows";
import {
  governanceReviews as seedReviews, memoryConflicts as seedConflicts, memoryDrifts as seedDrifts,
  retentionRows as seedRetention, memorySnapshots as seedSnapshots, seedNotifications,
  memoryActivities as seedActivities, publishDestinations as seedDestinations, demoScenarios,
  demoSteps, curationCandidates, supersessionCases, simIdentities, simRecords, simulateAccess,
  simAgents, simTasks, pointInTimeEvents, toYaml, governanceDimensions,
  type MemoryGovernanceReview, type MemoryConflict, type MemoryDrift, type RetentionRow,
  type MemorySnapshot, type MemoryNotification, type ScenarioId, type CurationCandidate,
} from "./cognitive-memory/governance-data";


const PREF_KEY = "ecf.cognitive-memory.prefs.v1";

const views: { id: MemoryView; label: string }[] = [
  { id: "executive", label: "Executive" },
  { id: "explorer", label: "Memory Explorer" },
  { id: "architecture", label: "Architecture" },
  { id: "governance", label: "Governance" },
];

interface Prefs {
  view: MemoryView; filters: MemoryFilters; savedView: string; density: Density;
  hiddenColumns: string[]; selectedRecord: string | null; selectedLayer: string;
  selectedStage: string; filtersOpen: boolean;
}

const defaultPrefs: Prefs = {
  view: "explorer", filters: defaultMemoryFilters, savedView: "Default", density: "standard",
  hiddenColumns: [], selectedRecord: null, selectedLayer: "evidence-vault",
  selectedStage: "validate", filtersOpen: false,
};

const loadPrefs = (): Prefs => {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : defaultPrefs;
  } catch { return defaultPrefs; }
};

const savePrefs = (p: Prefs) => {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
};

export default function EnterpriseCognitiveMemory() {
  const navigate = useNavigate();
  const [prefs, setPrefsState] = useState<Prefs>(loadPrefs);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [kpiFocus, setKpiFocus] = useState<string | null>(null);
  const [flowMode, setFlowMode] = useState<FlowMode>("data");
  const [focusOnly, setFocusOnly] = useState(false);
  const [stagePaused, setStagePaused] = useState(false);
  const [workbench, setWorkbench] = useState<WorkbenchState>(initialWorkbenchState);
  const [activeRecord, setActiveRecord] = useState<MemoryRecord | null>(null);
  const [recordTab, setRecordTab] = useState<string>("Overview");
  const [recordOpen, setRecordOpen] = useState(false);
  const [activeJob, setActiveJob] = useState<MemoryIndexingJob | null>(null);
  const [jobOpen, setJobOpen] = useState(false);
  const [jobPaused, setJobPaused] = useState(false);
  const [qualityKey, setQualityKey] = useState<string | null>(null);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [serviceStateBase] = useState<MemoryServiceState>("Operational");

  /* ---------------- Prompt 2 state ---------------- */
  const [reviews, setReviews] = useState<MemoryGovernanceReview[]>(seedReviews);
  const [conflicts, setConflicts] = useState<MemoryConflict[]>(seedConflicts);
  const [drifts, setDrifts] = useState<MemoryDrift[]>(seedDrifts);
  const [retention, setRetention] = useState<RetentionRow[]>(seedRetention);
  const [snapshots, setSnapshots] = useState<MemorySnapshot[]>(seedSnapshots);
  const [destinations, setDestinations] = useState(seedDestinations);
  const [notifications, setNotifications] = useState<MemoryNotification[]>(seedNotifications);
  const [activities, setActivities] = useState(seedActivities);
  const [queueFilters, setQueueFilters] = useState<QueueFilters>(defaultQueueFilters);
  const [queueSearch, setQueueSearch] = useState("");
  const [activeDimension, setActiveDimension] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState(curationCandidates[0].id);
  const [curationState, setCurationState] = useState<CurationDecisionState>(initialCurationDecision);
  const [pitId, setPitId] = useState("pit-approval");
  const [simIdentityId, setSimIdentityId] = useState(simIdentities[4].id);
  const [simRecordId, setSimRecordId] = useState(simRecords[0].id);
  const [simResult, setSimResult] = useState<ReturnType<typeof simulateAccess> | null>(null);
  const [agent, setAgent] = useState(simAgents[1]);
  const [agentTask, setAgentTask] = useState(simTasks[0]);
  const [agentIdentityId, setAgentIdentityId] = useState(simIdentities[4].id);
  const [agentPitId, setAgentPitId] = useState("pit-approval");
  const [agentOutput, setAgentOutput] = useState<ReturnType<typeof buildAgentSimulation> | null>(null);
  const [scenario, setScenario] = useState<ScenarioId | null>(null);
  const [storyStep, setStoryStep] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeReview, setActiveReview] = useState<MemoryGovernanceReview | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeConflict, setActiveConflict] = useState<MemoryConflict | null>(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [activeDrift, setActiveDrift] = useState<MemoryDrift | null>(null);
  const [driftOpen, setDriftOpen] = useState(false);
  const [mergeCandidate, setMergeCandidate] = useState<CurationCandidate | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [supersedeId, setSupersedeId] = useState(supersessionCases[0].id);
  const [supersedeOpen, setSupersedeOpen] = useState(false);
  const [refreshOpen, setRefreshOpen] = useState(false);
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const overlay = scenario ? demoScenarios.find((s) => s.id === scenario) ?? null : null;
  const serviceState = (overlay?.serviceState ?? serviceStateBase) as MemoryServiceState;
  const simIdentity = simIdentities.find((i) => i.id === simIdentityId) ?? simIdentities[0];
  const unread = notifications.filter((n) => !n.read).length;


  const setPrefs = useCallback((updater: (p: Prefs) => Prefs) => {
    setPrefsState((p) => { const next = updater(p); savePrefs(next); return next; });
  }, []);
  const setPref = <K extends keyof Prefs>(key: K, value: Prefs[K]) => setPrefs((p) => ({ ...p, [key]: value }));

  const say = (msg: string) => setAnnounce(msg);

  const filtered = useMemo(() => applyMemoryFilters(memoryRecords, prefs.filters, search), [prefs.filters, search]);
  const filterCount = activeMemoryFilterCount(prefs.filters);
  const stage = memoryLifecycleStages.find((s) => s.id === prefs.selectedStage) ?? memoryLifecycleStages[7];

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const openRecord = (r: MemoryRecord, tab = "Overview") => {
    setActiveRecord(r); setRecordTab(tab); setRecordOpen(true);
    setPref("selectedRecord", r.id);
    say(`Memory record ${r.id} opened`);
  };

  const openRecordById = (id: string, tab = "Overview") => {
    const r = memoryRecords.find((x) => x.id === id || x.id.startsWith(id));
    if (r) openRecord(r, tab);
    else toast.info("Record not in the seeded demonstration set", { description: id });
  };

  const setFilter = (key: keyof MemoryFilters, value: string) => {
    setPrefs((p) => ({ ...p, filters: { ...p.filters, [key]: value } }));
    setPage(1);
  };

  const onKpi = (id: string) => {
    setKpiFocus(id);
    if (id === "kpi-records") scrollTo("panel-composition");
    if (id === "kpi-evidence") { setFilter("memoryType", "Evidence Record"); scrollTo("panel-explorer"); }
    if (id === "kpi-conditions") { setFilter("memoryType", "Business Condition"); scrollTo("panel-explorer"); }
    if (id === "kpi-personas") { setFilter("memoryType", "Team Persona"); scrollTo("panel-explorer"); }
    if (id === "kpi-relationships") scrollTo("panel-graph");
    if (id === "kpi-quality") scrollTo("panel-quality");
    say(`${memoryKpis.find((k) => k.id === id)?.name} focused`);
  };

  const exportCurrentView = () => {
    const cols = explorerColumns[prefs.view].map((c) => c.label);
    exportCsv("enterprise-cognitive-memory.csv", [
      ["Memory ID", "Record", "Memory Type", "Domain", "Owner", "Authority", "Approval", "Confidence", "Freshness", "Evidence", "Relationships", "Access", "Version", "Updated"],
      ...filtered.map(recordToRow),
    ]);
    toast.success("Memory view exported", { description: `${filtered.length} records · ${cols.length} columns in view` });
    say("Memory view exported as CSV");
  };

  const exportSummary = () => {
    exportJson("enterprise-memory-summary.json", {
      generatedAt: new Date().toISOString(), view: prefs.view, filters: prefs.filters,
      kpis: memoryKpis.map((k) => ({ name: k.name, value: k.value, status: k.status })),
      records: filtered.map(recordToRow),
    });
    toast.success("Memory summary exported");
  };

  const refresh = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); toast.success("Enterprise memory refreshed"); say("Enterprise memory refreshed"); }, 300);
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAll = (ids: string[]) =>
    setSelected((s) => {
      const all = ids.every((i) => s.has(i));
      const n = new Set(s);
      ids.forEach((i) => (all ? n.delete(i) : n.add(i)));
      return n;
    });

  const onSort = (k: string) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  /* ---------------- Prompt 2 handlers ---------------- */

  const logActivity = (action: string, description: string, result: "Success" | "Warning" | "Denied" | "Conflict" = "Success", recordId = "MEM 100422") => {
    setActivities((a) => [{
      id: `ACT ${5100 + a.length}`, timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      memoryRecordId: recordId, action, description, memoryType: "Memory Record", domain: "Payments",
      result, owner: "Memory Operations", auditId: `AUD ${90400 + a.length}`,
    }, ...a]);
  };

  const notify = (category: string, title: string, detail: string, severity: "info" | "warning" | "critical" = "info") => {
    setNotifications((n) => [{
      id: `NTF ${800 + n.length}`, category, title, detail,
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      severity, read: false, targetId: "MEM 100422",
    }, ...n]);
  };

  const onGovernanceAction = (action: string, r: MemoryGovernanceReview) => {
    if (action === "Merge Records") { setMergeCandidate(curationCandidates[0]); setMergeOpen(true); return; }
    if (action === "Supersede") { setSupersedeOpen(true); return; }
    if (action === "Refresh Record") { setRefreshOpen(true); return; }
    const nextStatus =
      action === "Acknowledge" ? "Acknowledged" :
      action === "Escalate" ? "Escalated" :
      action.startsWith("Resolve") || action === "Resolve" ? "Resolved" : "In Review";
    setReviews((rs) => rs.map((x) => x.id === r.id
      ? { ...x, status: nextStatus as MemoryGovernanceReview["status"], resolvedAt: nextStatus === "Resolved" ? new Date().toISOString() : null }
      : x));
    logActivity(action, `${action} applied to ${r.id} · ${r.memoryRecord}`, nextStatus === "Escalated" ? "Warning" : "Success", r.memoryRecordId);
    toast.success(`${action} · ${r.id}`, { description: r.memoryRecord });
    say(`${action} applied to review ${r.id}. Status ${nextStatus}.`);
  };

  const onConflictResolve = (c: MemoryConflict, option: string) => {
    if (option === "Merge") {
      const cand = curationCandidates.find((x) => x.id === c.curationId) ?? curationCandidates[0];
      setMergeCandidate(cand); setMergeOpen(true); return;
    }
    if (option === "Create Effective Date Transition") { setSupersedeOpen(true); return; }
    setConflicts((cs) => cs.map((x) => x.id === c.id
      ? { ...x, reviewStatus: option === "Escalate" ? "Escalated" : "Resolved", resolution: option, resolvedAt: new Date().toISOString() }
      : x));
    logActivity("Conflict Resolved", `${c.id} resolved with ${option}`, "Success", c.recordAId);
    toast.success(`Conflict ${c.id} · ${option}`);
    say(`Conflict ${c.id} resolved with ${option}`);
  };

  const onDriftAction = (action: string, d: MemoryDrift) => {
    const status = action === "Accept Update" ? "Accepted" : action === "Dismiss as Nonmaterial" ? "Dismissed" : "Under Review";
    setDrifts((ds) => ds.map((x) => x.id === d.id ? { ...x, status: status as MemoryDrift["status"] } : x));
    if (action === "Create Version") setSupersedeOpen(true);
    logActivity(action, `${action} applied to drift ${d.id}`, "Success", d.memoryRecordId);
    toast.success(`${action} · ${d.id}`);
    say(`${action} applied to drift ${d.id}`);
  };

  const onRetentionAction = (action: string, r: RetentionRow) => {
    setRetention((rs) => rs.map((x) => x.id === r.id ? {
      ...x,
      legalHold: action === "Place Legal Hold" ? true : action === "Release Legal Hold" ? false : x.legalHold,
      status: action === "Archive" ? "Archived"
        : action === "Place Legal Hold" ? "Legal Hold"
        : action === "Release Legal Hold" ? "Active"
        : action === "Extend Retention" ? "Active" : x.status,
    } : x));
    logActivity(action, `${action} applied to ${r.record}`, "Success", r.recordId);
    toast.success(`${action} · ${r.record}`, { description: "No seeded data is physically deleted" });
    say(`${action} applied to ${r.record}`);
  };

  const applyScenario = (id: ScenarioId | null) => {
    setScenario(id);
    if (!id) {
      setReviews(seedReviews); setConflicts(seedConflicts); setDrifts(seedDrifts);
      setRetention(seedRetention); setSnapshots(seedSnapshots); setDestinations(seedDestinations);
      setNotifications(seedNotifications); setActivities(seedActivities);
      toast.success("Demo data reset"); say("Demo data reset to the baseline state");
      return;
    }
    const s = demoScenarios.find((x) => x.id === id);
    if (!s) return;
    logActivity("Scenario Applied", s.activity, s.bannerTone === "red" ? "Warning" : "Success");
    notify(s.notification, s.name, s.description, s.bannerTone === "red" ? "critical" : s.bannerTone === "amber" ? "warning" : "info");
    scrollTo(s.focusPanel);
    toast.success(s.name, { description: s.description });
    say(`${s.name} scenario applied. ${s.banner}`);
  };

  const governedExport = (cfg: { format: string; scope: string; options: string[]; includeRestricted: boolean }) => {
    const payload = {
      generatedAt: new Date().toISOString(), scope: cfg.scope, options: cfg.options,
      identity: simIdentity.name, restrictedIncluded: cfg.includeRestricted,
      governanceQueue: reviews.map((r) => ({ id: r.id, record: r.memoryRecord, issue: r.issueType, severity: r.severity, status: r.status })),
      conflicts: conflicts.map((c) => ({ id: c.id, type: c.conflictType, severity: c.severity, status: c.reviewStatus })),
      drift: drifts.map((d) => ({ id: d.id, type: d.driftType, materiality: d.materiality, status: d.status })),
      records: filtered.filter((r) => cfg.includeRestricted || r.accessClassification !== "Restricted").map(recordToRow),
    };
    if (cfg.format === "CSV") {
      exportCsv("enterprise-memory-governed.csv", [
        ["ID", "Record", "Issue", "Severity", "Status"],
        ...reviews.map((r) => [r.id, r.memoryRecord, r.issueType, r.severity, r.status]),
      ]);
    } else if (cfg.format === "JSON") {
      exportJson("enterprise-memory-governed.json", payload);
    } else if (cfg.format === "YAML") {
      downloadBlob(toYaml(payload), "enterprise-memory-governed.yaml", "text/yaml;charset=utf-8");
    } else {
      downloadBlob(
        `Enterprise Cognitive Memory — ${cfg.format}\nScope: ${cfg.scope}\nIdentity: ${simIdentity.name}\nRestricted content: ${cfg.includeRestricted ? "included" : "excluded"}\nGenerated: ${new Date().toISOString()}\n`,
        `enterprise-memory-${cfg.format.toLowerCase().replace(/\s+/g, "-")}.txt`, "text/plain;charset=utf-8");
    }
    toast.success(`Export generated · ${cfg.format}`, { description: cfg.includeRestricted ? "Restricted content included" : "Restricted content excluded by policy" });
    say(`Governed export generated as ${cfg.format}`);
  };

  const filterKeys = Object.keys(memoryFilterOptions) as (keyof MemoryFilters)[];


  return (
    <div className="min-h-full bg-slate-50 px-5 py-4">
      <div aria-live="polite" role="status" className="sr-only">{announce}</div>

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <Link to="/" className="hover:text-blue-700">Home</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link to="/enterprise-cognitive-fabric" className="hover:text-blue-700">Enterprise Cognitive Fabric</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span>Cognitive Memory</span>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="font-medium text-slate-700">Enterprise Cognitive Memory</span>
      </nav>

      <header className="mt-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Modeling &amp; Memory</p>
          <h1 className="text-[19px] font-bold text-slate-900">Enterprise Cognitive Memory</h1>
          <p className="text-[12px] text-slate-500">
            Preserve, connect, govern, and reuse trusted organizational knowledge across every enterprise decision
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex rounded-md border border-slate-200 bg-white p-0.5" role="tablist" aria-label="View selector">
            {views.map((v) => (
              <button key={v.id} role="tab" aria-selected={prefs.view === v.id} type="button"
                onClick={() => { setPref("view", v.id); setPage(1); say(`${v.label} view selected`); }}
                className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  prefs.view === v.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
                {v.label}
              </button>
            ))}
          </div>
          <Pill label={serviceState} tone={serviceState === "Operational" ? "green" : serviceState === "Degraded" ? "red" : "amber"} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={refresh}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden /> Refresh Memory
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => scrollTo("panel-explorer")}>Explore Memory</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => scrollTo("panel-workbench")}>Run Memory Query</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setSearchOpen(true)}>Global Search</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setNotificationsOpen(true)}
            aria-label={`Notifications, ${unread} unread`}>
            Notifications{unread > 0 && <span className="ml-1 rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">{unread}</span>}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { scrollTo("panel-indexing"); toast.success("Indexing job queued", { description: "IDX 60453 · Semantic Index · current filter scope" }); }}>Start Indexing</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setExportOpen(true)}>Export</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-7 text-[11px]">More</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto">
              <DropdownMenuLabel className="text-[11px]">Memory operations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-governance")}>Memory Governance</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-curation")}>Curation Workbench</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-conflicts")}>Conflict Resolution</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => { setMergeCandidate(curationCandidates[0]); setMergeOpen(true); }}>Record Merge</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => setSupersedeOpen(true)}>Supersession</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => setRefreshOpen(true)}>Memory Refresh</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-pit")}>Point in Time Memory</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => setSnapshotOpen(true)}>Create Snapshot</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-access-sim")}>Access Simulation</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-retention")}>Retention &amp; Legal Hold</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => setPublishOpen(true)}>Publish Memory</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-mcp")}>MCP Context Services</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => setExportOpen(true)}>Governed Export</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[11px]" onClick={() => { setStoryStep(0); say("Demo story started"); }}>Demo Story</DropdownMenuItem>
              <DropdownMenuLabel className="text-[11px]">Demo scenarios</DropdownMenuLabel>
              {demoScenarios.map((s) => (
                <DropdownMenuItem key={s.id} className="text-[11px]" onClick={() => applyScenario(s.id)}>{s.name}</DropdownMenuItem>
              ))}
              <DropdownMenuItem className="text-[11px]" onClick={() => applyScenario(null)}>Reset Demo Data</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      {/* Filters */}
      <section className="mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm" aria-label="Global filters">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <button type="button" onClick={() => setPref("filtersOpen", !prefs.filtersOpen)}
            aria-expanded={prefs.filtersOpen}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-800">
            <Filter className="h-3.5 w-3.5" aria-hidden /> Filters
            {filterCount > 0 && <span className="rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">{filterCount}</span>}
          </button>
          <div className="flex flex-wrap items-center gap-1.5">
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search Enterprise Memory" aria-label="Search Enterprise Memory"
              className="h-7 w-56 rounded-md border border-slate-200 px-2 text-[11px] focus:border-blue-400 focus:outline-none" />
            <FilterSelect label="Saved View" value={prefs.savedView} options={savedViews} onChange={(v) => setPref("savedView", v)} />
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setPage(1); toast.success("Filters applied", { description: `${filtered.length} records match` }); }}>Apply Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setPref("filters", defaultMemoryFilters); setSearch(""); setPage(1); toast.success("Filters cleared"); }}>Clear Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success("View saved", { description: `${prefs.savedView} updated with ${filterCount} active filters` })}>Save View</Button>
          </div>
        </div>
        {prefs.filtersOpen && (
          <div className="mt-2 grid gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            {filterKeys.map((k) => (
              <FilterSelect key={k} label={memoryFilterLabels[k]} value={prefs.filters[k]}
                options={memoryFilterOptions[k]} onChange={(v) => setFilter(k, v)} />
            ))}
          </div>
        )}
      </section>

      {/* KPIs */}
      <div id="panel-kpis" className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {memoryKpis.map((k) => <MemoryKpiCard key={k.id} kpi={k} onClick={() => onKpi(k.id)} focused={kpiFocus === k.id} />)}
      </div>

      <div className="mt-2 space-y-2">
        <ArchitecturePanel
          selectedLayer={prefs.selectedLayer} onSelect={(id) => setPref("selectedLayer", id)}
          flowMode={flowMode} onFlowMode={setFlowMode} focusOnly={focusOnly} onFocusOnly={setFocusOnly}
          onOpenLayerRecords={(layer) => {
            const match = memoryRecords.find((r) => r.memoryLayer === layer.name);
            if (match) { setFilter("memoryType", match.recordType); scrollTo("panel-explorer"); }
            else toast.info(`${layer.name} records are aggregated in this demonstration data set`);
          }} />

        <LifecyclePanel selectedStage={prefs.selectedStage} onSelect={(id) => { setPref("selectedStage", id); scrollTo("panel-stage"); }} />

        <SelectedStagePanel stage={stage} paused={stagePaused}
          onPause={() => { setStagePaused(true); toast.success(`${stage.name} paused`); }}
          onResume={() => { setStagePaused(false); toast.success(`${stage.name} resumed`); }}
          onRetry={() => toast.success(`Retry queued for ${stage.name}`)}
          onReprocess={() => toast.success(`Reprocess queued for ${stage.name}`)}
          onOpenExplorer={() => scrollTo("panel-explorer")}
          onViewLogs={() => toast.info(`${stage.name} logs`, { description: `config ${stage.configurationVersion} · owner ${stage.owner}` })}
          onOpenRecord={(id) => openRecordById(id)} />

        <ExplorerPanel
          records={filtered} view={prefs.view} density={prefs.density} hiddenColumns={prefs.hiddenColumns}
          selected={selected} onToggleSelect={toggleSelect} onToggleAll={toggleAll}
          onOpenRecord={(r) => openRecord(r)} loading={loading}
          page={page} pageSize={8} onPage={setPage} sortKey={sortKey} sortDir={sortDir} onSort={onSort}
          actions={
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-7 text-[11px]">Columns</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
                  {explorerColumns[prefs.view].map((c) => (
                    <DropdownMenuCheckboxItem key={c.key} className="text-[11px]"
                      checked={!prefs.hiddenColumns.includes(c.key)}
                      onCheckedChange={() => setPref("hiddenColumns",
                        prefs.hiddenColumns.includes(c.key)
                          ? prefs.hiddenColumns.filter((x) => x !== c.key)
                          : [...prefs.hiddenColumns, c.key])}>
                      {c.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <FilterSelect label="Density" value={prefs.density} options={["compact", "standard", "comfortable"]}
                onChange={(v) => setPref("density", v as Density)} />
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={exportCurrentView}>Export Current View</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={selected.size === 0}
                onClick={() => { setCandidateId(curationCandidates[0].id); scrollTo("panel-curation"); }}>Bulk Actions</Button>
            </>
          } />

        <MemoryWorkbench state={workbench} onChange={setWorkbench}
          onOpenRecord={(id) => openRecordById(id)}
          onOpenEvidence={(id) => openRecordById(id, "Evidence")}
          onOpenGraph={() => scrollTo("panel-graph")}
          onSaveContextSet={() => toast.success("Context set saved", { description: `${workbench.question.slice(0, 60)}…` })}
          onExportBrief={() => downloadBlob(
            `Enterprise Memory Brief\n\nQuestion: ${workbench.question}\n\nExcluded records: ${workbench.excluded.length}\nGenerated: ${new Date().toISOString()}\n`,
            "enterprise-memory-brief.txt", "text/plain;charset=utf-8")}
          onNavigate={(t) => navigate(t === "intake"
            ? "/enterprise-cognitive-fabric/cognitive-intake"
            : "/enterprise-cognitive-fabric/persona-impact-analysis")} />

        <div className="grid gap-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <ContextGraphPanel onOpenRecord={(id) => openRecordById(id)} />
          <div className="space-y-2">
            <CompositionPanel onFilterType={(t) => { setFilter("memoryType", t); scrollTo("panel-explorer"); }} />
            <QualityPanel onOpenDimension={(k) => { setQualityKey(k); setQualityOpen(true); }} />
          </div>
        </div>

        <div className="grid gap-2 xl:grid-cols-2">
          <FreshnessAuthorityPanel
            onOpenRecord={(id) => openRecordById(id)}
            onOpenEvidence={(id) => openRecordById(id, "Evidence")}
            onAssignReview={() => scrollTo("panel-governance-queue")} />
          <IndexingPanel jobs={memoryIndexingJobs} onOpenJob={(j) => { setActiveJob(j); setJobPaused(false); setJobOpen(true); }} />
        </div>

        <ProvenancePanel onOpenRecord={(id) => openRecordById(id)} />

        <GovernanceOverviewPanel loading={loading} activeDimension={activeDimension}
          onDimension={(d) => {
            setActiveDimension(d.id);
            setQueueFilters({ ...defaultQueueFilters, issueType: d.issueTypes[0] ?? "All" });
            scrollTo("panel-governance-queue");
            say(`${d.name} dimension selected. Governance queue filtered.`);
          }} />

        <GovernanceQueuePanel reviews={reviews} filters={queueFilters} onFilters={setQueueFilters}
          search={queueSearch} onSearch={setQueueSearch} loading={loading}
          onAction={onGovernanceAction}
          onOpen={(r) => { setActiveReview(r); setReviewOpen(true); }} />

        <CurationWorkbench candidateId={candidateId} onCandidate={setCandidateId}
          state={curationState} onState={setCurationState}
          onSubmit={(c) => {
            toast.success(`${curationState.decision} · ${c.title}`, { description: curationState.reason });
            logActivity("Curation Decision", `${curationState.decision} applied to ${c.id}`, "Success", c.recordAId);
            setCurationState(initialCurationDecision);
            say(`${curationState.decision} applied to ${c.title}`);
          }}
          onMerge={(c) => { setMergeCandidate(c); setMergeOpen(true); }}
          onSupersede={() => setSupersedeOpen(true)} />

        <ConflictsPanel conflicts={conflicts} loading={loading}
          onOpen={(c) => { setActiveConflict(c); setConflictOpen(true); }}
          onResolve={onConflictResolve} />

        <DriftPanel drifts={drifts} loading={loading}
          onOpen={(d) => { setActiveDrift(d); setDriftOpen(true); }}
          onAction={onDriftAction} />

        <PointInTimePanel eventId={pitId} onEvent={(id) => { setPitId(id); say(`Point in time changed to ${id}`); }}
          onCompare={(e) => toast.info("Compared with current memory", { description: `${e.facts.filter((f) => f.differs).length} facts differ` })}
          onOpenDecision={(e) => toast.info(e.decision)}
          onOpenEvidence={(e) => toast.info(`Evidence known at ${e.date} ${e.time}`, { description: "Future evidence excluded" })} />

        <SnapshotsPanel snapshots={snapshots} onCreate={() => setSnapshotOpen(true)}
          onOpen={(s) => toast.info(`${s.id} · ${s.name}`, { description: `${s.recordCount} records · index ${s.indexVersion}` })}
          onCompare={(s) => toast.info(`Compared ${s.id} to current memory`)}
          onExport={(s) => exportJson(`${s.id.replace(/\s/g, "-").toLowerCase()}-metadata.json`, s)}
          onRestore={(s) => { toast.success(`${s.id} restored as simulation`, { description: "Live current memory unchanged" }); say(`${s.name} restored as simulation`); }} />

        <AccessPanel onOpenPolicy={(id) => toast.info(`Access policy ${id}`)}
          onOpenConflict={() => { const c = conflicts.find((x) => x.conflictType === "Access Conflict"); if (c) { setActiveConflict(c); setConflictOpen(true); } }} />

        <AccessSimulator identityId={simIdentityId} recordId={simRecordId}
          onIdentity={setSimIdentityId} onRecord={setSimRecordId} result={simResult}
          onRun={(i, r) => { const res = simulateAccess(i, r); setSimResult(res); say(`Access ${res.decision} for ${i.name} on ${r.id}`); }} />

        <RetentionPanel rows={retention} loading={loading} onAction={onRetentionAction} />

        <PublishingPanel destinations={destinations} onPublish={() => setPublishOpen(true)}
          onRepublish={(d) => { toast.success(`Republish queued · ${d.name}`); logActivity("Republish", `${d.name} republish queued`); }}
          onPause={(d) => setDestinations((ds) => ds.map((x) => x.id === d.id ? { ...x, status: x.status === "Paused" ? "Healthy" : "Paused" } : x))}
          onHistory={(d) => toast.info(`${d.name} publishing history`, { description: `Last published ${d.lastPublished} · ${d.version}` })} />

        <McpServicesPanel
          onOpen={(s) => toast.info(`${s.id} · ${s.name}`, { description: s.description })}
          onTest={(s) => { toast.success(`Synthetic request to ${s.name}`, { description: `${s.averageLatency} · access validated` }); say(`Synthetic request executed against ${s.name}`); }}
          onPolicy={(s) => toast.info(`Access policy ${s.accessPolicyId}`)}
          onAudit={(s) => toast.info(`${s.name} audit history`, { description: `Last invocation ${s.lastInvocation}` })} />

        <AgentContextSimulator agent={agent} task={agentTask} identityId={agentIdentityId} pitId={agentPitId}
          onAgent={setAgent} onTask={setAgentTask} onIdentity={setAgentIdentityId} onPit={setAgentPitId}
          output={agentOutput} onOpenRecord={(id) => openRecordById(id)}
          onRun={() => {
            const identity = simIdentities.find((i) => i.id === agentIdentityId) ?? simIdentities[0];
            const pit = pointInTimeEvents.find((e) => e.id === agentPitId) ?? pointInTimeEvents[1];
            const out = buildAgentSimulation(agent, agentTask, identity, pit);
            setAgentOutput(out);
            say(`Agent simulation complete. ${out.allowed.length} records allowed, ${out.denied.length} denied.`);
          }} />

        <UsagePanel onOpenRecord={(id) => openRecordById(id)} />

        <LearningPanel onOpenRecord={(id) => openRecordById(id)} onOpenPointInTime={() => scrollTo("panel-pit")} />

        <ActivityPanel activities={activities} onOpen={(a) => openRecordById(a.memoryRecordId)} />

      </div>

      <RecordDrawer open={recordOpen} onOpenChange={setRecordOpen} record={activeRecord} initialTab={recordTab}
        onOpenWorkbench={() => { setRecordOpen(false); scrollTo("panel-workbench"); }}
        onOpenGraph={() => { setRecordOpen(false); scrollTo("panel-graph"); }}
        onExport={(r) => exportJson(`${r.id.replace(/\s/g, "-").toLowerCase()}.json`, r)}
        onNavigate={(t) => {
          if (t === "persona") openRecordById("MEM 100422");
          if (t === "decision") openRecordById("MEM 100424");
          if (t === "outcome") openRecordById("MEM 100427");
        }} />

      <IndexingDrawer open={jobOpen} onOpenChange={setJobOpen} job={activeJob} paused={jobPaused}
        onPause={() => { setJobPaused(true); toast.success(`${activeJob?.id} paused`); }}
        onResume={() => { setJobPaused(false); toast.success(`${activeJob?.id} resumed`); }}
        onRetry={() => toast.success(`Retry queued for ${activeJob?.id}`)}
        onReindex={() => toast.success(`Reindex queued for ${activeJob?.id}`)}
        onOpenExplorer={() => { setJobOpen(false); scrollTo("panel-explorer"); }}
        onViewLogs={() => toast.info(`${activeJob?.id} logs available in the Logs tab`)} />

      <QualityDrawer open={qualityOpen} onOpenChange={setQualityOpen} dimensionKey={qualityKey} />

      <ReviewDrawer open={reviewOpen} onOpenChange={setReviewOpen} review={activeReview}
        onAction={(a, r) => { onGovernanceAction(a, r); setReviewOpen(false); }} />

      <ConflictDrawer open={conflictOpen} onOpenChange={setConflictOpen} conflict={activeConflict}
        onResolve={(c, o) => { onConflictResolve(c, o); setConflictOpen(false); }}
        onMerge={(c) => {
          setConflictOpen(false);
          setMergeCandidate(curationCandidates.find((x) => x.id === c.curationId) ?? curationCandidates[0]);
          setMergeOpen(true);
        }} />

      <DriftDrawer open={driftOpen} onOpenChange={setDriftOpen} drift={activeDrift}
        onAction={(a, d) => { onDriftAction(a, d); setDriftOpen(false); }} />

      <MergeDialog open={mergeOpen} onOpenChange={setMergeOpen} candidate={mergeCandidate}
        onComplete={(summary) => { toast.success("Merge completed", { description: summary }); logActivity("Merge", summary); say(`Merge completed. ${summary}`); }} />

      <SupersessionDialog open={supersedeOpen} onOpenChange={setSupersedeOpen} caseId={supersedeId} onCaseId={setSupersedeId}
        onComplete={(summary) => { toast.success("Supersession applied", { description: summary }); logActivity("Supersession", summary); say(`Supersession applied. ${summary}`); }} />

      <RefreshDialog open={refreshOpen} onOpenChange={setRefreshOpen}
        onComplete={(summary) => { toast.success("Memory refresh completed", { description: summary }); logActivity("Refresh", summary); say(summary); }} />

      <CreateSnapshotDialog open={snapshotOpen} onOpenChange={setSnapshotOpen}
        onCreate={(p) => {
          const snap: MemorySnapshot = {
            id: `SNP ${1005 + snapshots.length}`, name: p.name, timestamp: `${p.pointInTime} 00:00`,
            domains: [p.scope], recordCount: "12.4M", relationshipCount: "38.2M", indexVersion: "v412",
            accessPolicyVersion: "v10", createdBy: simIdentity.name, reason: p.reason, status: "Immutable",
          };
          setSnapshots((s) => [snap, ...s]);
          logActivity("Snapshot Created", `${snap.id} · ${snap.name}`);
          notify("Snapshot Created", snap.name, `${snap.recordCount} records captured`);
          toast.success("Snapshot created", { description: `${snap.id} · live memory unchanged` });
          say(`Snapshot ${snap.id} created`);
        }} />

      <PublishDialog open={publishOpen} onOpenChange={setPublishOpen}
        onComplete={(summary) => {
          setDestinations((ds) => ds.map((d) => ({ ...d, status: d.status === "Paused" ? "Paused" : "Healthy", pending: "0" })));
          logActivity("Published", summary);
          notify("Publishing Completed", "Memory publication completed", summary);
          toast.success("Publishing completed", { description: summary });
          say(`Publishing completed. ${summary}`);
        }} />

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen}
        identityAllowsRestricted={simIdentity.restrictedEvidence}
        onOpenResult={(id) => { setSearchOpen(false); openRecordById(id); }} />

      <NotificationsDrawer open={notificationsOpen} onOpenChange={setNotificationsOpen} notifications={notifications}
        onMarkRead={(n) => setNotifications((ns) => ns.map((x) => x.id === n.id ? { ...x, read: true } : x))}
        onMarkAll={() => { setNotifications((ns) => ns.map((x) => ({ ...x, read: true }))); say("All notifications marked read"); }}
        onOpenItem={(n) => { setNotificationsOpen(false); openRecordById(n.targetId); }}
        onAssign={(n) => toast.success(`${n.id} assigned`, { description: "Assigned to Memory Operations" })}
        onAcknowledge={(n) => { setNotifications((ns) => ns.map((x) => x.id === n.id ? { ...x, read: true } : x)); toast.success(`${n.id} acknowledged`); }} />

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen}
        restrictedAllowed={simIdentity.restrictedEvidence} onExport={governedExport} />

      {storyStep !== null && (
        <DemoStoryOverlay step={storyStep} reducedMotion={reducedMotion} onToggleMotion={setReducedMotion}
          onNext={() => setStoryStep((s) => Math.min((s ?? 0) + 1, demoSteps.length - 1))}
          onPrev={() => setStoryStep((s) => Math.max((s ?? 0) - 1, 0))}
          onExit={() => { setStoryStep(null); say("Demo story exited"); }} />
      )}
    </div>

  );
}
