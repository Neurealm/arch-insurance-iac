import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight, Copy, Database, Filter, Gauge, Layers, MoreHorizontal, Play, Plus,
  RefreshCw, Search, ShieldCheck, SlidersHorizontal,

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
import {
  ActivationPanel, ActivityPanel, AccessValidationPanel, ApprovalChainPanel, AuditHistoryPanel,
  ChangeImpactPanel, ConflictsPanel, DriftPanel, EnvironmentPromotionPanel, ExceptionsPanel,
  GovernanceSummaryPanel, InheritancePanel, NotificationsPanel, OwnershipPanel, PrecheckPanel,
  PublishingHistoryPanel, ResidencyPanel, ReviewQueuePanel, ReviewWorkbench, RollbackPanel,
  RuntimeCompatibilityPanel, ScenarioBanner, ValidationPanel, ValidationResultsPanel,
  VersionComparisonPanel, VersionHistoryPanel,
} from "./discovery-config/gov-panels";
import {
  ActivationWizard, ConflictResolutionDialog, DemoStoryOverlay, ExceptionDialog, ExportDialog,
  GlobalSearchDialog, ReviewDecisionDialog, RollbackDialog, VersionDetailDialog,
  type ActivationPlan,
} from "./discovery-config/gov-dialogs";
import {
  activationExecutionSteps, buildSearchIndex, demoScenarios, demoStory, downloadFile,
  scenarioStates, seedActivity, seedApprovals, seedAudit, seedDrift, seedExceptions, seedImpact,
  seedNotifications, seedOwnership, seedReviews, seedRuleConflicts, seedValidation,
  seedValidationResults, seedVersions, toCsv, toYaml,
  type DemoScenario, type DiscoveryConfigurationApproval, type DiscoveryConfigurationAuditEvent,
  type DiscoveryConfigurationDrift, type DiscoveryConfigurationException,
  type DiscoveryConfigurationNotification, type DiscoveryConfigurationReview,
  type DiscoveryConfigurationValidation, type DiscoveryConfigurationVersion,
  type DiscoveryRuleConflict, type DiscoveryValidationResult, type SearchResult,
} from "./discovery-config/gov-data";


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

  /* ---------------------------------------------- prompt 2 governance state */

  const [scenario, setScenario] = useState<DemoScenario>("Review Pending");
  const scenarioState = scenarioStates[scenario];

  const [validation, setValidation] = useState<DiscoveryConfigurationValidation>(seedValidation);
  const [validating, setValidating] = useState(false);
  const [results, setResults] = useState<DiscoveryValidationResult[]>(seedValidationResults);
  const [conflicts, setConflicts] = useState<DiscoveryRuleConflict[]>(seedRuleConflicts);
  const [ownership, setOwnership] = useState(seedOwnership);
  const [reviews, setReviews] = useState<DiscoveryConfigurationReview[]>(seedReviews);
  const [selectedReview, setSelectedReview] = useState("DCR-4201");
  const [approvals, setApprovals] = useState<DiscoveryConfigurationApproval[]>(seedApprovals);
  const [versions, setVersions] = useState<DiscoveryConfigurationVersion[]>(seedVersions);
  const [compareFrom, setCompareFrom] = useState("4.2");
  const [compareTo, setCompareTo] = useState("4.3");
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [exceptions, setExceptions] = useState<DiscoveryConfigurationException[]>(seedExceptions);
  const [promoted, setPromoted] = useState<Record<string, string>>({});
  const [drift, setDrift] = useState<DiscoveryConfigurationDrift[]>(seedDrift);
  const [audit, setAudit] = useState<DiscoveryConfigurationAuditEvent[]>(seedAudit);
  const [notifications, setNotifications] = useState<DiscoveryConfigurationNotification[]>(seedNotifications);
  const [activity, setActivity] = useState(seedActivity);
  const [rollbacks, setRollbacks] = useState<{ id: string; fromVersion: string; toVersion: string; rollbackType: string; reason: string; owner: string; status: string; completedAt: string }[]>([]);
  const [activation, setActivation] = useState({
    status: "Draft" as string, mode: "Immediate", scheduledAt: "", scope: "Enterprise",
    rollbackOwner: "Discovery Operations", rollbackVersion: "v4.2", activatedBy: "", completedAt: "",
  });
  const [activationStep, setActivationStep] = useState(0);
  const [activating, setActivating] = useState(false);
  const [rollbackRunning, setRollbackRunning] = useState(false);

  const [conflictDialog, setConflictDialog] = useState<DiscoveryRuleConflict | null>(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [reviewDialog, setReviewDialog] = useState<{ id: string; action: string } | null>(null);
  const [exceptionOpen, setExceptionOpen] = useState(false);
  const [activationOpen, setActivationOpen] = useState(false);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [versionDetail, setVersionDetail] = useState<DiscoveryConfigurationVersion | null>(null);
  const [versionDetailOpen, setVersionDetailOpen] = useState(false);
  const [storyStep, setStoryStep] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const preview = useMemo(() => computePreview(draft), [draft]);


  useEffect(() => {
    const prefs: Prefs = { view, filters, savedView, density, columns, selectedConfiguration: selectedConfigId, selectedStage };
    try { window.localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { /* preferences are best effort */ }
  }, [view, filters, savedView, density, columns, selectedConfigId, selectedStage]);

  const focusPanel = useCallback((id: string) => {
    setSpotlight(id);
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    window.setTimeout(() => setSpotlight((s) => (s === id ? null : s)), 2600);
  }, [reducedMotion]);

  /* --------------------------------------------------- governance helpers */

  const nowLabel = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const logActivity = useCallback((text: string, kind: string) => {
    setActivity((a) => [{ id: `ACT-${Date.now()}`, time: nowLabel(), text, kind }, ...a].slice(0, 40));
  }, []);

  const logAudit = useCallback((action: string, elementType: string, elementId: string, previousState: string, newState: string, reason: string) => {
    setAudit((a) => [{
      id: `AE-${Date.now()}`, configurationId: "DISC-CFG-001", configurationVersion: "4.3",
      timestamp: nowLabel(), actor: "Discovery Operations", actorRole: "Configuration Owner",
      action, elementType, elementId, previousState, newState, reason, auditId: `AUD-${90000 + a.length}`,
    }, ...a]);
  }, []);

  const notify = useCallback((type: string, title: string, description: string, severity: "Low" | "Medium" | "High" | "Critical") => {
    setNotifications((n) => [{
      id: `NTF-${Date.now()}`, configurationId: "DISC-CFG-001", configurationVersion: "4.3",
      type, title, description, severity, owner: "Discovery Operations", status: "Unread", createdAt: nowLabel(),
    }, ...n]);
  }, []);

  const activationBlocked = scenarioState.activationBlocked || validation.blockedCount > 0
    || reviews.some((r) => r.severity === "High" && ["Open", "In Review", "Escalated"].includes(r.status));
  const blockReason = validation.blockedCount > 0
    ? "Validation reported blocking issues"
    : scenarioState.blockReason
      || (reviews.some((r) => r.severity === "High" && ["Open", "In Review", "Escalated"].includes(r.status))
        ? "High severity governance reviews are still open"
        : "");

  const runValidation = useCallback(() => {
    setValidating(true);
    setValidation((v) => ({ ...v, status: "Running", startedAt: nowLabel(), completedAt: "" }));
    window.setTimeout(() => {
      setValidating(false);
      setValidation({
        ...seedValidation,
        validationScore: scenarioState.validationScore,
        passedCount: scenarioState.passedCount,
        warningCount: scenarioState.warningCount,
        reviewRequiredCount: scenarioState.reviewRequiredCount,
        blockedCount: scenarioState.blockedCount,
        status: scenarioState.blockedCount > 3 ? "Failed" : "Completed",
        startedAt: nowLabel(), completedAt: nowLabel(),
      });
      logActivity(`Enterprise Knowledge Discovery v4.3 validation completed at ${scenarioState.validationScore} / 100`, "Validation");
      logAudit("Validation Run", "Configuration", "DISC-CFG-001", "Validation Required", scenarioState.blockedCount > 3 ? "Validation Failed" : "Validation Warning", "Preapproval validation");
      notify(scenarioState.blockedCount > 3 ? "Validation Failed" : "Validation Completed",
        `Validation ${scenarioState.blockedCount > 3 ? "failed" : "completed"} at ${scenarioState.validationScore} / 100`,
        `${scenarioState.warningCount} warnings and ${scenarioState.reviewRequiredCount} review required items`, "Medium");
      toast.success("Configuration validation completed", { description: `Score ${scenarioState.validationScore} / 100. No downstream state was changed.` });
    }, 900);
  }, [scenarioState, logActivity, logAudit, notify]);

  const runActivation = (plan: ActivationPlan) => {
    if (plan.mode === "Scheduled") {
      const when = plan.scheduledDate ? `${plan.scheduledDate}${plan.scheduledTime ? ` ${plan.scheduledTime}` : ""}` : "Awaiting date selection";
      setActivation((a) => ({ ...a, status: "Scheduled", mode: plan.mode, scheduledAt: when, scope: plan.scope, rollbackOwner: plan.rollbackOwner }));
      logActivity(`Activation scheduled for v${plan.version} (${when})`, "Activation");
      logAudit("Activated", "Activation", "ACT-4301", "Approved", "Scheduled", "Scheduled activation created");
      notify("Activation Scheduled", `Activation scheduled for v${plan.version}`, `Window ${when} · scope ${plan.scope}`, "Medium");
      toast.success("Activation scheduled", { description: `${when} · rollback owner ${plan.rollbackOwner}` });
      setActivationOpen(false);
      return;
    }
    setActivating(true);
    setActivation((a) => ({ ...a, status: "Activating", mode: plan.mode, scope: plan.scope, rollbackOwner: plan.rollbackOwner }));
    let i = 0;
    const tick = window.setInterval(() => {
      i += 1;
      setActivationStep(i);
      if (i >= activationExecutionSteps.length) {
        window.clearInterval(tick);
        setActivating(false);
        if (scenario === "Activation Failed") {
          setActivation((a) => ({ ...a, status: "Activation Failed" }));
          logActivity("Activation failed during scheduler update. v4.2 remains active.", "Activation");
          notify("Activation Failed", "Activation halted on critical error", "Scheduler update failed. Previous version remains active.", "High");
          toast.error("Activation failed", { description: "Paused on critical error. v4.2 remains the active configuration." });
          return;
        }
        setVersions((vs) => vs.map((v) =>
          v.version === plan.version
            ? { ...v, status: "Active", approvalState: "Active", effectiveDate: new Date().toISOString().slice(0, 10) }
            : v.status === "Active"
              ? { ...v, status: "Superseded", approvalState: "Superseded", supersededDate: new Date().toISOString().slice(0, 10) }
              : v));
        setActivation((a) => ({ ...a, status: "Active", activatedBy: "Discovery Operations", completedAt: nowLabel(), rollbackVersion: "v4.2" }));
        logActivity(`Enterprise Knowledge Discovery v${plan.version} activated. v4.2 preserved as superseded.`, "Activation");
        logAudit("Activated", "Configuration", "DISC-CFG-001", "Approved", "Active", "Configuration published to discovery execution layer");
        notify("Configuration Activated", `v${plan.version} is now active`, "Enterprise Source Discovery now executes this configuration reference.", "Medium");
        toast.success(`Configuration v${plan.version} activated`, { description: "v4.2 preserved as superseded. Enterprise Source Discovery reference updated." });
        setActivationOpen(false);
      }
    }, 160);
  };

  const runRollback = (payload: { toVersion: string; type: string; scope: string; reason: string; owner: string }) => {
    setRollbackRunning(true);
    const from = versions.find((v) => v.status === "Active")?.version ?? "4.3";
    window.setTimeout(() => {
      setRollbackRunning(false);
      setVersions((vs) => vs.map((v) =>
        v.version === payload.toVersion ? { ...v, status: "Active", approvalState: "Active", supersededDate: "" }
          : v.version === from ? { ...v, status: "Rolled Back", approvalState: "Rolled Back" } : v));
      setRollbacks((r) => [{
        id: `RBK-${900 + r.length}`, fromVersion: from, toVersion: payload.toVersion,
        rollbackType: payload.type, reason: payload.reason, owner: payload.owner,
        status: "Rolled Back", completedAt: nowLabel(),
      }, ...r]);
      setActivation((a) => ({ ...a, status: "Active", rollbackVersion: `v${payload.toVersion}` }));
      logActivity(`Rollback from v${from} to v${payload.toVersion} completed. Reconciliation job created.`, "Rollback");
      logAudit("Rolled Back", "Configuration", "DISC-CFG-001", `v${from} Active`, `v${payload.toVersion} Active`, payload.reason);
      notify("Rollback Completed", `Rolled back to v${payload.toVersion}`, "Historical versions preserved. Reconciliation job created.", "High");
      toast.success(`Rolled back to v${payload.toVersion}`, { description: "Prior versions preserved. No historical record was modified." });
      setRollbackOpen(false);
    }, 900);
  };

  const searchIndex: SearchResult[] = useMemo(
    () => buildSearchIndex({ reviews, conflicts, results, exceptions, drift, versions, approvals, draft }),
    [reviews, conflicts, results, exceptions, drift, versions, approvals, draft]);

  const applyScenario = (s: DemoScenario) => {
    setScenario(s);
    const st = scenarioStates[s];
    setValidation((v) => ({
      ...v, validationScore: st.validationScore, passedCount: st.passedCount, warningCount: st.warningCount,
      reviewRequiredCount: st.reviewRequiredCount, blockedCount: st.blockedCount,
      status: st.serviceState === "Validation Failed" ? "Failed" : st.validationScore === 0 ? "Not Run" : "Completed",
    }));
    setActivation((a) => ({ ...a, status: st.activationStatus }));
    if (s === "Reset Demo Data") {
      setResults(seedValidationResults); setConflicts(seedRuleConflicts); setReviews(seedReviews);
      setApprovals(seedApprovals); setVersions(seedVersions); setExceptions(seedExceptions);
      setDrift(seedDrift); setNotifications(seedNotifications); setActivity(seedActivity);
      setAudit(seedAudit); setRollbacks([]); setOverrides({}); setPromoted({});
      setActivation({ status: "Draft", mode: "Immediate", scheduledAt: "", scope: "Enterprise", rollbackOwner: "Discovery Operations", rollbackVersion: "v4.2", activatedBy: "", completedAt: "" });
      setActivationStep(0); setOwnership(seedOwnership);
    }
    if (s === "Configuration Drift") {
      setDrift([...seedDrift,
        { ...seedDrift[0], id: "DRF-003", elementType: "Permission Policy", elementId: "Unknown permission handling", approvedState: "Restrict", observedState: "Metadata only", driftType: "Permission Policy Drift", severity: "High", detectedAt: nowLabel() },
        { ...seedDrift[1], id: "DRF-004", elementType: "Owner", elementId: "Condition eligibility handoff", approvedState: "Assigned", observedState: "Unassigned", driftType: "Owner Drift", severity: "Medium", detectedAt: nowLabel() }]);
    }
    if (s === "Exception Expiring") {
      setExceptions((e) => e.map((x) => (x.id === "EXC-502" ? { ...x, status: "Expiring" } : x)));
    }
    if (s === "Configuration Activated") {
      setVersions((vs) => vs.map((v) => v.version === "4.3" ? { ...v, status: "Active", approvalState: "Active", effectiveDate: new Date().toISOString().slice(0, 10) }
        : v.version === "4.2" ? { ...v, status: "Superseded", approvalState: "Superseded", supersededDate: new Date().toISOString().slice(0, 10) } : v));
    }
    logActivity(`Demo scenario applied: ${s}`, "Scenario");
    toast.success(`Scenario: ${s}`, { description: st.note });
  };

  const doExport = (format: string, scope: string, options: string[]) => {
    const rows: Record<string, unknown>[] = [
      ...results.map((r) => ({ recordType: "Validation Result", id: r.id, category: r.category, element: r.configurationElementId, issue: r.issue, severity: r.severity, status: r.status, owner: r.owner })),
      ...conflicts.map((c) => ({ recordType: "Rule Conflict", id: c.id, category: c.conflictType, element: `${c.ruleAId} vs ${c.ruleBId}`, issue: c.overlapScope, severity: c.severity, status: c.status, owner: "Discovery Governance" })),
      ...reviews.map((r) => ({ recordType: "Review", id: r.id, category: r.reviewType, element: r.issue, issue: r.scope, severity: r.severity, status: r.status, owner: r.reviewer })),
      ...versions.map((v) => ({ recordType: "Version", id: v.id, category: "Version", element: `v${v.version}`, issue: v.changeReason, severity: "Low", status: v.status, owner: v.createdBy })),
    ];
    const stamp = new Date().toISOString().slice(0, 10);
    const name = `discovery-configuration-${scope.toLowerCase().replace(/\s+/g, "-")}-${stamp}`;
    if (format === "CSV") downloadFile(`${name}.csv`, toCsv(rows), "text/csv");
    else if (format === "JSON") downloadFile(`${name}.json`, JSON.stringify({ scope, options, generatedAt: stamp, records: rows }, null, 2), "application/json");
    else if (format === "YAML") downloadFile(`${name}.yaml`, `scope: ${scope}\nrecords:\n${toYaml(rows)}`, "text/yaml");
    else downloadFile(`${name}.txt`, `${format} — ${scope}\nIncluded: ${options.join(", ")}\n\n${rows.map((r) => Object.values(r).join(" · ")).join("\n")}`, "text/plain");
    logActivity(`Governed export generated (${format} · ${scope})`, "Export");
    toast.success(`Export generated as ${format}`, { description: `${rows.length} governed records · scope ${scope}` });
  };

  useEffect(() => {
    if (storyStep === null) return;
    focusPanel(demoStory[storyStep].target);
  }, [storyStep, focusPanel]);



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
            <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={runValidation} disabled={validating}>
              {validating ? "Validating…" : "Validate Configuration"}
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={startDryRun}>
              <Play className="mr-1 h-3.5 w-3.5" aria-hidden /> Run Preview
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => setSearchOpen(true)} aria-label="Global search">
              <Search className="mr-1 h-3.5 w-3.5" aria-hidden /> Search
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => setActivationOpen(true)}>
              Activate
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0" aria-label="More configuration actions">
                  <MoreHorizontal className="h-4 w-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-[70vh] overflow-y-auto">
                <DropdownMenuLabel className="text-[11px]">Configuration</DropdownMenuLabel>
                <DropdownMenuItem className="text-[12px]" onClick={() => focusPanel("panel-workbench")}>Open workbench</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onClick={() => focusPanel("panel-preview")}>Open preview</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onClick={() => focusPanel("panel-quality")}>Open quality</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[11px]">Governance</DropdownMenuLabel>
                <DropdownMenuItem className="text-[12px]" onClick={() => focusPanel("panel-validation")}>Validation</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onClick={() => focusPanel("panel-reviews")}>Review queue</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onClick={() => focusPanel("panel-approvals")}>Approval chain</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onClick={() => focusPanel("panel-versions")}>Version history</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onClick={() => focusPanel("panel-comparison")}>Version comparison</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onClick={() => focusPanel("panel-drift")}>Configuration drift</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onClick={() => setRollbackOpen(true)}>Rollback configuration</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[12px]" onClick={() => setExportOpen(true)}>Governed export</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onClick={() => setStoryStep(0)}>Demo Story</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[11px]">Demo scenarios</DropdownMenuLabel>
                {demoScenarios.map((s) => (
                  <DropdownMenuItem key={s} className="text-[12px]" onClick={() => applyScenario(s)}>{s}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <span className="text-[11px] text-slate-500">Configuration service state</span>
          <StatusBadge tone={activationBlocked ? "red" : preview.blockingIssues.length ? "red" : "amber"}>{scenarioState.serviceState}</StatusBadge>
          <StatusBadge tone="green">
            {versions.find((v) => v.status === "Active")?.version === "4.3" ? "Active v4.3 in Production" : "Active v4.2 in Production"}
          </StatusBadge>
          <StatusBadge tone="blue">{draft.name}</StatusBadge>
          <StatusBadge tone="slate">{serviceState}</StatusBadge>
          <span className="ml-auto text-[11px] text-slate-500">Refreshed {refreshedAt}</span>
        </div>

        <ScenarioBanner scenario={scenario} state={scenarioState} />


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

          {/* ---------------------------- prompt 2 governance control plane */}

          <GovernanceSummaryPanel state={scenarioState} draft={draft} onFocus={focusPanel} spotlight={spotlight === "panel-governance-summary"} />

          <ValidationPanel
            validation={validation} running={validating} onRun={runValidation}
            onOpenResults={() => focusPanel("panel-validation-results")}
            blocked={activationBlocked} spotlight={spotlight === "panel-validation"}
          />
          <ValidationResultsPanel
            results={results}
            spotlight={spotlight === "panel-validation-results"}
            onAction={(r, action) => {
              if (action === "Open") { focusPanel("panel-conflicts"); return; }
              if (action === "Create Exception") { setExceptionOpen(true); return; }
              if (action === "Request Review") {
                setReviews((rs) => [{
                  id: `DCR-${4300 + rs.length}`, configurationId: "DISC-CFG-001", configurationVersion: "4.3",
                  reviewType: `${r.category} Review`, issue: r.issue, scope: r.affectedScopeIds.join(", ") || "Enterprise",
                  severity: r.severity, reviewer: r.owner, reviewerRole: r.owner, status: "Open",
                  decision: "", conditions: "", comments: "", requestedAt: nowLabel(), dueAt: "In 3 days", completedAt: "",
                }, ...rs]);
                notify("Review Requested", `Review requested for ${r.id}`, r.issue, r.severity);
                toast.success("Review requested", { description: `${r.category} routed to ${r.owner}` });
                return;
              }
              const status = action === "Resolve" ? "Resolved" : action === "Accept Warning" ? "Accepted" : r.status;
              setResults((rs) => rs.map((x) => (x.id === r.id ? { ...x, status, owner: action === "Assign Owner" ? "Discovery Operations" : x.owner } : x)));
              logAudit(action === "Accept Warning" ? "Warning Accepted" : "Validation Run", r.configurationElementType, r.configurationElementId, r.currentState, r.expectedState, `${action} on ${r.id}`);
              logActivity(`${action} applied to validation finding ${r.id}`, "Validation");
              toast.success(`${action} recorded for ${r.id}`);
            }}
          />
          <ConflictsPanel
            conflicts={conflicts}
            spotlight={spotlight === "panel-conflicts"}
            onResolve={(c) => { setConflictDialog(c); setConflictOpen(true); }}
          />
          <AccessValidationPanel spotlight={spotlight === "panel-access"} onReview={() => focusPanel("panel-reviews")} />
          <ResidencyPanel spotlight={spotlight === "panel-residency"} />
          <OwnershipPanel
            rows={ownership} spotlight={spotlight === "panel-ownership"}
            onAction={(id, action) => {
              setOwnership((rows) => rows.map((o) => (o.id === id
                ? { ...o, owner: action === "Assign Synthetic Owner" ? "Discovery Operations" : o.owner, status: action === "Assign Synthetic Owner" ? "Confirmed" : "Pending" }
                : o)));
              logActivity(`${action} for ownership record ${id}`, "Ownership");
              toast.success(`${action} recorded`);
            }}
          />

          <ChangeImpactPanel impact={seedImpact} spotlight={spotlight === "panel-impact"} onOpenComparison={() => focusPanel("panel-comparison")} />

          <ReviewQueuePanel
            reviews={reviews} selected={selectedReview} onSelect={setSelectedReview}
            spotlight={spotlight === "panel-reviews"}
            onAction={(r, action) => {
              if (action === "Open Review") { focusPanel("panel-review-workbench"); return; }
              if (action === "Assign") {
                setReviews((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: "In Review" } : x)));
                toast.success(`${r.id} assigned to ${r.reviewer}`);
                return;
              }
              if (action === "Approve") {
                setReviews((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: "Approved", decision: "Approved", completedAt: nowLabel() } : x)));
                logAudit("Approved", "Review", r.id, "Open", "Approved", "Reviewer approval");
                logActivity(`${r.id} approved by ${r.reviewer}`, "Review");
                notify("Review Approved", `${r.id} approved`, r.issue, r.severity);
                toast.success(`${r.id} approved`);
                return;
              }
              setReviewDialog({ id: r.id, action });
            }}
          />
          <ReviewWorkbench
            review={reviews.find((r) => r.id === selectedReview) ?? null}
            impact={seedImpact} preview={preview}
            spotlight={spotlight === "panel-review-workbench"}
            onAction={(action) => {
              if (action === "Create Exception") { setExceptionOpen(true); return; }
              if (action === "Approve") {
                setReviews((rs) => rs.map((x) => (x.id === selectedReview ? { ...x, status: "Approved", decision: "Approved", completedAt: nowLabel() } : x)));
                logActivity(`${selectedReview} approved from review workbench`, "Review");
                toast.success(`${selectedReview} approved`);
                return;
              }
              setReviewDialog({ id: selectedReview, action });
            }}
          />
          <ApprovalChainPanel
            approvals={approvals} approvalState={scenarioState.approvalState}
            spotlight={spotlight === "panel-approvals"}
            onDecide={(a, action) => {
              setApprovals((as) => as.map((x) => (x.id === a.id
                ? {
                  ...x,
                  status: action === "Approve" ? "Approved" : action === "Approve with Conditions" ? "Approved with Conditions" : "Rejected",
                  decision: action,
                  conditions: action === "Approve with Conditions" ? "Restricted transcript pilot must remain inside approved channels" : x.conditions,
                  completedAt: nowLabel(),
                }
                : x)));
              logAudit(action === "Reject" ? "Rejected" : "Approved", "Approval", a.id, a.status, action, `${a.approvalStage} decision`);
              logActivity(`${a.approvalStage} ${action.toLowerCase()}`, "Approval");
              notify("Configuration Approved", `${a.approvalStage} ${action.toLowerCase()}`, "Approved is not the same as Active. Activation remains a separate step.", "Medium");
              toast.success(`${a.approvalStage}: ${action}`);
            }}
          />

          <VersionHistoryPanel
            versions={versions} spotlight={spotlight === "panel-versions"}
            onOpen={(v) => { setVersionDetail(v); setVersionDetailOpen(true); }}
            onCompare={(v) => { setCompareTo(v.version); focusPanel("panel-comparison"); }}
            onClone={(v) => { setNewMode("clone"); setNewOpen(true); toast.info(`Cloning from v${v.version}`); }}
            onExport={(v) => doExport("JSON", `Selected Version v${v.version}`, ["Scope", "Rules", "Validation"])}
          />
          <VersionComparisonPanel
            fromVersion={compareFrom} toVersion={compareTo} versions={versions}
            onFrom={setCompareFrom} onTo={setCompareTo}
            onOpenElement={(row) => focusPanel(row.panel)}
            spotlight={spotlight === "panel-comparison"}
          />
          <InheritancePanel
            overrides={overrides} spotlight={spotlight === "panel-inheritance"}
            onCreateOverride={(id, value) => { setOverrides((o) => ({ ...o, [id]: value })); toast.success("Draft override created", { description: `${value} · pending validation` }); }}
            onRemoveOverride={(id) => { setOverrides((o) => { const n = { ...o }; delete n[id]; return n; }); toast.success("Draft override removed"); }}
            onResetInherited={(id) => { setOverrides((o) => { const n = { ...o }; delete n[id]; return n; }); toast.success("Reset to inherited value"); }}
          />
          <ExceptionsPanel
            exceptions={exceptions} spotlight={spotlight === "panel-exceptions"}
            onCreate={() => setExceptionOpen(true)}
            onAction={(e, action) => {
              if (action === "Expire Now") {
                setExceptions((xs) => xs.map((x) => (x.id === e.id ? { ...x, status: "Expired" } : x)));
                toast.success(`${e.id} expired`);
              } else if (action === "Extend") {
                const next = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
                setExceptions((xs) => xs.map((x) => (x.id === e.id ? { ...x, expirationDate: next, status: "Active" } : x)));
                toast.success(`${e.id} extended to ${next}`, { description: "Extension recorded with governance review requirement" });
              } else {
                focusPanel("panel-reviews");
              }
              logActivity(`${action} on exception ${e.id}`, "Exception");
            }}
          />

          <EnvironmentPromotionPanel
            promoted={promoted} spotlight={spotlight === "panel-promotion"}
            canPromoteProduction={!activationBlocked && validation.blockedCount === 0}
            onPromote={(env) => {
              setPromoted((p) => ({ ...p, [env]: "4.3 Draft" }));
              logActivity(`Configuration promoted to ${env}`, "Promotion");
              toast.success(`Promoted to ${env}`);
            }}
            onScheduleProduction={() => setActivationOpen(true)}
          />
          <PrecheckPanel blocked={activationBlocked} spotlight={spotlight === "panel-precheck"} onContinue={() => setActivationOpen(true)} />
          <RuntimeCompatibilityPanel spotlight={spotlight === "panel-runtime"} />
          <ActivationPanel
            activation={activation} blocked={activationBlocked} blockReason={blockReason}
            executionStep={activationStep} spotlight={spotlight === "panel-activation"}
            onActivate={() => setActivationOpen(true)}
            onCancelSchedule={() => { setActivation((a) => ({ ...a, status: "Draft", scheduledAt: "" })); toast.success("Scheduled activation cancelled"); }}
            onReschedule={() => setActivationOpen(true)}
            onRunValidation={runValidation}
          />
          <RollbackPanel history={rollbacks} spotlight={spotlight === "panel-rollback"} onRollback={() => setRollbackOpen(true)} />
          <DriftPanel
            drift={drift} spotlight={spotlight === "panel-drift"}
            onAction={(d, action) => {
              const status = action === "Reconcile to Approved" ? "Reconciled"
                : action === "Accept Temporary Exception" ? "Exception Accepted"
                  : action === "Escalate" ? "Escalated" : "Investigating";
              setDrift((ds) => ds.map((x) => (x.id === d.id ? { ...x, status, resolution: action } : x)));
              if (action === "Accept Temporary Exception") setExceptionOpen(true);
              logAudit("Drift Detected", d.elementType, d.elementId, d.approvedState, d.observedState, action);
              logActivity(`${action} on drift ${d.id}`, "Drift");
              toast.success(`${action} recorded for ${d.id}`);
            }}
          />

          <PublishingHistoryPanel
            spotlight={spotlight === "panel-publishing"}
            onOpen={(id, kind) => {
              if (kind === "Open Version") focusPanel("panel-versions");
              else if (kind === "Open Audit") focusPanel("panel-audit");
              else toast.info(`Publishing event ${id}`);
            }}
          />
          <AuditHistoryPanel audit={audit} spotlight={spotlight === "panel-audit"} />
          <NotificationsPanel
            notifications={notifications} spotlight={spotlight === "panel-notifications"}
            onMarkAll={() => { setNotifications((ns) => ns.map((n) => ({ ...n, status: "Read" }))); toast.success("All notifications marked read"); }}
            onAction={(n, action) => {
              if (action === "Open") { focusPanel("panel-reviews"); return; }
              const status = action === "Acknowledge" ? "Acknowledged" : "Read";
              setNotifications((ns) => ns.map((x) => (x.id === n.id ? { ...x, status } : x)));
              toast.success(`${action} · ${n.title}`);
            }}
          />
          <ActivityPanel activity={activity} spotlight={spotlight === "panel-activity"} />


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

      {/* ------------------------------------------- prompt 2 governance overlays */}
      <ConflictResolutionDialog
        open={conflictOpen} onOpenChange={setConflictOpen} conflict={conflictDialog}
        onResolve={(id, payload) => {
          const c = conflicts.find((x) => x.id === id);
          setConflicts((cs) => cs.map((x) => (x.id === id ? { ...x, status: "Resolved", resolution: payload.action, resolvedBy: payload.reviewer } : x)));
          logAudit("Conflict Resolved", "Rule", id, c?.status ?? "Open", "Resolved", payload.reason || payload.action);
          logActivity(`Conflict ${id} resolved as ${payload.action}`, "Conflict");
          notify("Conflict Detected", `${id} resolved`, payload.action, c?.severity ?? "Medium");
          toast.success(`Conflict ${id} resolved`, { description: `${payload.action} · effective ${payload.effectiveDate || "immediately"}` });
          setConflictOpen(false);
        }}
      />
      <ReviewDecisionDialog
        open={!!reviewDialog} onOpenChange={(o) => !o && setReviewDialog(null)}
        reviewId={reviewDialog?.id ?? ""} action={reviewDialog?.action ?? ""}
        onSubmit={({ comments, conditions }) => {
          const id = reviewDialog?.id ?? "";
          const action = reviewDialog?.action ?? "";
          const status = action === "Approve with Conditions" ? "Approved with Conditions"
            : action === "Reject" ? "Rejected" : action === "Escalate" ? "Escalated" : "In Review";
          setReviews((rs) => rs.map((x) => (x.id === id ? { ...x, status, decision: action, comments, conditions, completedAt: nowLabel() } : x)));
          logAudit(action === "Reject" ? "Rejected" : action === "Escalate" ? "Escalated" : "Approved", "Review", id, "In Review", status, comments || action);
          logActivity(`${id} ${status.toLowerCase()}`, "Review");
          notify(action === "Escalate" ? "Escalation Raised" : "Review Approved", `${id} ${status}`, comments || action, action === "Escalate" ? "High" : "Medium");
          toast.success(`${id}: ${status}`);
          setReviewDialog(null);
        }}
      />
      <ExceptionDialog
        open={exceptionOpen} onOpenChange={setExceptionOpen}
        onCreate={(e) => {
          const id = `EXC-${600 + exceptions.length}`;
          setExceptions((xs) => [{ ...e, id }, ...xs]);
          logAudit("Exception Created", "Exception", id, "None", "Active", e.reason);
          logActivity(`Exception ${id} created (${e.exceptionType})`, "Exception");
          notify("Exception Created", `${id} created`, e.reason, "Medium");
          toast.success(`Exception ${id} created`, { description: `Expires ${e.expirationDate} · approver ${e.approver}` });
          setExceptionOpen(false);
        }}
      />
      <ActivationWizard
        open={activationOpen} onOpenChange={setActivationOpen} impact={seedImpact}
        blocked={activationBlocked} blockReason={blockReason}
        running={activating} executionStep={activationStep}
        onActivate={runActivation}
      />
      <RollbackDialog
        open={rollbackOpen} onOpenChange={setRollbackOpen} versions={versions} running={rollbackRunning}
        onRollback={runRollback}
      />
      <GlobalSearchDialog
        open={searchOpen} onOpenChange={setSearchOpen} index={searchIndex}
        onOpenResult={(r) => { setSearchOpen(false); focusPanel(r.panel); }}
      />
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} onExport={(f, s, o) => { doExport(f, s, o); setExportOpen(false); }} />
      <VersionDetailDialog open={versionDetailOpen} onOpenChange={setVersionDetailOpen} version={versionDetail} />
      {storyStep !== null && (
        <DemoStoryOverlay
          step={storyStep} reducedMotion={reducedMotion}
          onToggleMotion={(v) => setReducedMotion(v)}
          onNext={() => setStoryStep((s) => Math.min((s ?? 0) + 1, demoStory.length - 1))}
          onPrev={() => setStoryStep((s) => Math.max((s ?? 0) - 1, 0))}
          onExit={() => setStoryStep(null)}
        />
      )}


    </div>
  );
}
