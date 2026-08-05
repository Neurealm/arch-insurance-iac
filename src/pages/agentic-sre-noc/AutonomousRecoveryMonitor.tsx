/**
 * Autonomous Recovery Monitor — Agentic SRE NOC.
 *
 * A live governed execution environment for the synthetic Chennai recovery
 * EXE-2026-0417-01, continuing situation SIT-2026-0417 and approval
 * APR-2026-0417-03. All data lives in ./data/recoveryFixtures.ts and reuses the
 * shared identifiers from the earlier pages. Every interaction is local and
 * deterministic; no real network, terminal, routing or failover action occurs.
 */

import { Fragment, useCallback, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRightLeft, Bot, CheckCircle2, ChevronRight,
  CircleSlash, Clock, Download, Gauge, Maximize2, Minimize2, Pause, Play,
  Plus, RadioTower, RefreshCw, RotateCcw, ShieldAlert, ShieldCheck,
  SkipForward, Undo2, User, Waypoints,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Field, Panel, Select, ToolbarButton } from "./components/NocPrimitives";
import { ServiceRouteGraph } from "./components/ServiceRouteGraph";
import { situationRoute } from "./data/situationFixtures";
import {
  APPROVAL_ID, beamExecution, beamSequence, controlComparison,
  DEFAULT_RECOVERY_COLUMNS, DIAGNOSTIC_GROUPS, diagnostics, EVIDENCE_GROUPS,
  EXECUTION_ID, EXECUTION_STATES, EXECUTION_TABS, executionActors,
  executionEvidence, executionStateStages, fallbackGuardrails, guardrailPassStatement,
  learningActions, liveGuardrails, marginSeries, opticalRecovery,
  OWNERSHIP_MATRIX_COLUMNS, ownershipMatrix, outcomeDisclaimer, recoveryComparison,
  recoveryExceptions, recoveryHeader, recoveryKpis, recoveryLearning,
  recoveryOperations, recoveryOutcomes, recoveryScenario, RECOVERY_COLUMNS,
  RECOVERY_GROUPINGS, rfFallback, rollbackExecSteps, rollbackReadiness,
  rollbackTriggers, routeObjects, routeSummary, savedRecoveryViews,
  scenarioInjections, selectedExecution, SITUATION_ID, SYNTHETIC_NOTE,
  TIMELINE_EVENT_TYPES, timelineEvents, TRAFFIC_LANES, transitionStages,
  VALIDATION_GROUPS, validationTests, workflowSteps, humanControlNote,
  type Diagnostic, type ExecutionState, type ExecutionTab, type LiveGuardrail,
  type RecoveryColumnKey, type RecoveryException, type RecoveryGrouping,
  type RecoveryOperation, type RouteObject, type StepStatus, type TimelineEvent,
  type ValidationStatus, type ValidationTest, type WorkflowStep,
} from "./data/recoveryFixtures";

/* ------------------------------ primitives ------------------------------- */

const ALL = "All";

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", className)}>
      {children}
    </span>
  );
}

const toneChip = (tone: "good" | "watch" | "risk" | "neutral" | "info") =>
  tone === "good"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : tone === "watch"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : tone === "risk"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : tone === "info"
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-slate-200 bg-slate-50 text-slate-600";

const GOOD = ["Passed", "Complete", "Completed", "Healthy", "Available", "Within policy", "Customer service validated", "Resolved", "Accepted", "Contained", "Low"];
const WATCH = ["Warning", "Running", "Waiting", "Pending", "Pending sustained condition", "In progress", "Monitoring", "Ready", "At risk", "Paused", "Moderate", "Awaiting human input", "Awaiting approval", "Recovery monitoring", "Traffic transition in progress", "Validation in progress", "Beam reacquisition in progress", "Available with reduced capacity"];
const RISK = ["Failed", "Blocked", "Triggered", "Unavailable", "Rolled back", "Rollback initiated", "Rollback in progress", "Cancelled", "Expired", "High", "Critical", "Degraded", "Human intervention required", "Open"];

const statusChip = (s: string) =>
  GOOD.includes(s) ? toneChip("good") : WATCH.includes(s) ? toneChip("watch") : RISK.includes(s) ? toneChip("risk") : toneChip("neutral");

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-2.5 py-2 text-left font-medium text-slate-500">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-2.5 py-2 align-top text-slate-700", className)}>{children}</td>;
}

function Meter({ value, color = "#4f46e5" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100">
      <div className="h-1.5 rounded-full transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }} />
    </div>
  );
}

function SectionNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-[10.5px] text-slate-400">{children}</p>;
}

function KpiCard({ kpi, active, onClick }: { kpi: (typeof recoveryKpis)[number]; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={kpi.explain}
      aria-pressed={active}
      className={cn(
        "flex flex-col rounded-xl border bg-white p-3 text-left shadow-sm transition hover:border-indigo-300",
        active ? "border-indigo-500 ring-2 ring-indigo-100" : "border-slate-200",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium text-slate-600">{kpi.title}</span>
        <Chip className={toneChip(kpi.status)}>{kpi.trend}</Chip>
      </div>
      <span className="mt-1 text-xl font-semibold text-slate-900">{kpi.value}</span>
      <span className="text-[11px] text-slate-500">{kpi.sub}</span>
      <span className="mt-2 text-[10px] text-slate-400">
        Target {kpi.target} · Previous {kpi.previous} · {kpi.at}{kpi.synthetic ? " · Synthetic demonstration data" : ""}
      </span>
    </button>
  );
}

/* -------------------------------- page ----------------------------------- */

export default function AutonomousRecoveryMonitor() {
  /* selection and command state */
  const [selectedId, setSelectedId] = useState(EXECUTION_ID);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [emergencyStopped, setEmergencyStopped] = useState(false);
  const [humanControl, setHumanControl] = useState(false);
  const [owner, setOwner] = useState(recoveryHeader.executionOwner);
  const [notes, setNotes] = useState<string[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [fullScreen, setFullScreen] = useState(false);
  const [brief, setBrief] = useState<string | null>(null);
  const [activeKpi, setActiveKpi] = useState<string | null>(null);

  /* queue */
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<RecoveryColumnKey>("priority");
  const [sortAsc, setSortAsc] = useState(true);
  const [grouping, setGrouping] = useState<RecoveryGrouping>("No grouping");
  const [columns, setColumns] = useState<RecoveryColumnKey[]>(DEFAULT_RECOVERY_COLUMNS);
  const [wideColumns, setWideColumns] = useState(false);
  const [pinFirst, setPinFirst] = useState(true);
  const [accessibleTable, setAccessibleTable] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState(ALL);
  const [regionFilter, setRegionFilter] = useState(ALL);
  const [savedView, setSavedView] = useState<string>(savedRecoveryViews[0].name);
  const [queueExport, setQueueExport] = useState<string | null>(null);

  /* tabs */
  const [tab, setTab] = useState<ExecutionTab>("Summary");

  /* workflow */
  const [stepOverrides, setStepOverrides] = useState<Record<number, StepStatus>>({});
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [stepNotes, setStepNotes] = useState<Record<number, string[]>>({});

  /* route */
  const [routeObjectId, setRouteObjectId] = useState<string | null>("e-primary");
  const [nodeId, setNodeId] = useState<string | null>("n-terminal-a");
  const [edgeId, setEdgeId] = useState<string | null>("e-rf");

  /* traffic */
  const [transitionIdx, setTransitionIdx] = useState(0);
  const [transitionHeld, setTransitionHeld] = useState(false);
  const [comparePlanned, setComparePlanned] = useState(false);
  const [capacityFailed, setCapacityFailed] = useState(false);
  const [latencyRaised, setLatencyRaised] = useState(false);

  /* fallback */
  const [fallbackLoad, setFallbackLoad] = useState(rfFallback.currentThroughput);
  const [fallbackHeld, setFallbackHeld] = useState(true);
  const [fallbackReleased, setFallbackReleased] = useState(false);
  const [fallbackValidatedAt, setFallbackValidatedAt] = useState(rfFallback.lastValidation);
  const [fallbackDegraded, setFallbackDegraded] = useState(false);

  /* beam */
  const [beamIdx, setBeamIdx] = useState<number | null>(null);
  const [beamRunning, setBeamRunning] = useState(false);
  const [beamResult, setBeamResult] = useState<"Succeeded" | "Failed" | null>(null);

  /* diagnostics */
  const [diagGroup, setDiagGroup] = useState<string>(ALL);
  const [diagId, setDiagId] = useState<string | null>(null);
  const [diagRuns, setDiagRuns] = useState<Record<string, Diagnostic["status"]>>({});
  const [diagCompare, setDiagCompare] = useState<"none" | "baseline" | "terminals">("none");

  /* validation */
  const [valGroup, setValGroup] = useState<string>(ALL);
  const [valOverrides, setValOverrides] = useState<Record<string, ValidationStatus>>({});
  const [valId, setValId] = useState<string | null>(null);

  /* guardrails */
  const [guardFailed, setGuardFailed] = useState<string | null>(null);
  const [guardDecision, setGuardDecision] = useState<string | null>(null);

  /* rollback */
  const [rollbackTested, setRollbackTested] = useState(false);
  const [rollbackStage, setRollbackStage] = useState<number | null>(null);
  const [rollbackPaused, setRollbackPaused] = useState(false);
  const [rollbackFailed, setRollbackFailed] = useState(false);

  /* exceptions */
  const [exceptionId, setExceptionId] = useState<string | null>(null);
  const [exceptionStatus, setExceptionStatus] = useState<Record<string, string>>({});
  const [raisedExceptions, setRaisedExceptions] = useState<string[]>([]);

  /* ownership */
  const [actorId, setActorId] = useState<string | null>(null);

  /* timeline */
  const [tlActor, setTlActor] = useState(ALL);
  const [tlType, setTlType] = useState(ALL);
  const [tlValidation, setTlValidation] = useState(ALL);
  const [tlPlayback, setTlPlayback] = useState<number | null>(null);
  const [tlZoom, setTlZoom] = useState(false);
  const [pinnedEvents, setPinnedEvents] = useState<string[]>([]);
  const [tlEventId, setTlEventId] = useState<string | null>(null);
  const [tlExport, setTlExport] = useState<string | null>(null);
  const [extraEvents, setExtraEvents] = useState<TimelineEvent[]>([]);

  /* evidence */
  const [evGroup, setEvGroup] = useState<string>(ALL);
  const [evId, setEvId] = useState<string | null>("re-threshold");

  /* learning */
  const [learningLog, setLearningLog] = useState<string[]>([]);

  /* scenario */
  const [stageIdx, setStageIdx] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [injections, setInjections] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  /* drawer */
  const [drawer, setDrawer] = useState<{ title: string; rows: [string, string][]; body?: string; actions?: { label: string; run: () => void }[] } | null>(null);

  const stage = stageIdx === null ? null : recoveryScenario[stageIdx];
  const selectedRow = recoveryOperations.find((r) => r.id === selectedId) ?? recoveryOperations[0];
  const isDefault = selectedRow.id === EXECUTION_ID;
  const activeInjection = injections.length ? scenarioInjections.find((i) => i.id === injections[injections.length - 1]) ?? null : null;

  /* --------------------------- derived values --------------------------- */

  const effectiveState: ExecutionState = emergencyStopped
    ? "Cancelled"
    : stopped
      ? "Cancelled"
      : humanControl
        ? "Human intervention required"
        : activeInjection
          ? activeInjection.state
          : paused
            ? "Paused"
            : rollbackStage !== null
              ? (rollbackStage >= rollbackExecSteps.length - 1 ? "Rolled back" : "Rollback in progress")
              : stage
                ? stage.state
                : isDefault
                  ? recoveryHeader.state
                  : selectedRow.state;

  const progress = stopped || emergencyStopped ? (stage?.progress ?? recoveryHeader.progress) : stage ? stage.progress : isDefault ? recoveryHeader.progress : selectedRow.progress;

  const currentStepNumber = stage ? stage.step : isDefault ? 9 : 1;
  const currentStepName = stage
    ? workflowSteps[stage.step - 1].name
    : isDefault
      ? recoveryHeader.currentStep
      : selectedRow.currentStep;

  const traffic = useMemo(() => {
    if (capacityFailed) return { optical: 6.9, fallback: 3.1 };
    if (stage) return { optical: stage.optical, fallback: stage.fallback };
    const t = transitionStages[transitionHeld ? 0 : transitionIdx];
    return { optical: t.optical, fallback: t.fallback };
  }, [stage, transitionIdx, transitionHeld, capacityFailed]);

  const guardrailState: LiveGuardrail["status"] = emergencyStopped
    ? "Triggered"
    : guardFailed
      ? "Blocked"
      : activeInjection
        ? activeInjection.guardrail
        : stage
          ? stage.guardrail
          : "Warning";

  const effectiveRollbackReadiness = rollbackFailed ? 45 : stage ? stage.rollbackReadiness : recoveryHeader.rollbackReadiness;

  const validationList: ValidationTest[] = useMemo(
    () => validationTests.map((t) => {
      if (valOverrides[t.id]) return { ...t, status: valOverrides[t.id] };
      if (latencyRaised && t.id === "vt-c-lat") return { ...t, status: "Failed" as ValidationStatus, current: "13.4 ms" };
      if (stage && stage.n >= 10 && t.id === "vt-o-sustain") return { ...t, status: "Passed" as ValidationStatus, current: "15m 00s sustained" };
      return t;
    }),
    [valOverrides, latencyRaised, stage],
  );

  const validationPassed = stage ? stage.validationPassed : validationList.filter((t) => t.status === "Passed").length;

  const steps: WorkflowStep[] = useMemo(
    () => workflowSteps.map((s) => {
      if (stepOverrides[s.n]) return { ...s, status: stepOverrides[s.n] };
      if (!stage) return s;
      if (s.n < stage.step) return { ...s, status: "Passed" as StepStatus };
      if (s.n === stage.step) return { ...s, status: "Running" as StepStatus };
      return { ...s, status: "Not started" as StepStatus };
    }),
    [stepOverrides, stage],
  );

  const evidenceCount = stage ? stage.evidenceCount : selectedExecution.evidenceCount;

  const events: TimelineEvent[] = useMemo(() => {
    const base = timelineEvents.map((e) => {
      if (!stage) return e;
      const idx = timelineEvents.findIndex((x) => x.event === stage.timelineEvent);
      const own = timelineEvents.indexOf(e);
      if (idx >= 0 && own <= idx) return { ...e, status: "Complete" as const, at: e.at === "Pending" ? "Simulated" : e.at };
      return e;
    });
    return [...base, ...extraEvents];
  }, [stage, extraEvents]);

  const addEvent = useCallback((event: string, actor: string, outcome: string, type: TimelineEvent["type"] = "Human decision") => {
    setExtraEvents((prev) => [
      ...prev,
      {
        id: `te-local-${prev.length + 1}`, at: "Local demonstration", event, actor, type,
        step: currentStepName, serviceState: recoveryHeader.customerServiceState,
        traffic: `${traffic.optical} optical, ${traffic.fallback} fallback`,
        validation: "Not applicable", guardrail: guardrailState, evidence: "re-ownership",
        outcome, status: "Complete",
      },
    ]);
  }, [currentStepName, traffic, guardrailState]);

  /* ------------------------------ queue --------------------------------- */

  const rows = useMemo(() => {
    let r = recoveryOperations.filter((o) =>
      (stateFilter === ALL || o.state === stateFilter) &&
      (regionFilter === ALL || o.region === regionFilter) &&
      (!query || `${o.id} ${o.action} ${o.customer} ${o.region} ${o.owner} ${o.agent}`.toLowerCase().includes(query.toLowerCase())));
    if (savedView === "Governed executions") r = r.filter((o) => o.autonomy.startsWith("Level 3"));
    if (savedView === "Autonomous executions") r = r.filter((o) => o.autonomy.startsWith("Level 4") || o.autonomy.startsWith("Level 5"));
    if (savedView === "Needs human control") r = r.filter((o) => o.state === "Human intervention required" || o.state === "Paused");
    if (savedView === "Chennai region") r = r.filter((o) => o.region === "India South");
    const dir = sortAsc ? 1 : -1;
    return [...r].sort((a, b) => String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""), undefined, { numeric: true }) * dir);
  }, [query, stateFilter, regionFilter, savedView, sortKey, sortAsc]);

  const groups = useMemo(() => {
    if (grouping === "No grouping") return [{ key: "All active recoveries", rows }];
    const keyOf = (o: RecoveryOperation) =>
      grouping === "Execution state" ? o.state
        : grouping === "Customer" ? o.customer
          : grouping === "Region" ? o.region
            : grouping === "Product" ? o.product
              : grouping === "Autonomy level" ? o.autonomy
                : `${o.rollbackReadiness} percent rollback readiness`;
    const map = new Map<string, RecoveryOperation[]>();
    rows.forEach((o) => map.set(keyOf(o), [...(map.get(keyOf(o)) ?? []), o]));
    return [...map.entries()].map(([key, r]) => ({ key, rows: r }));
  }, [rows, grouping]);

  const cellValue = (o: RecoveryOperation, key: RecoveryColumnKey): React.ReactNode => {
    if (key === "progress") return (
      <div className="w-24">
        <Meter value={o.id === selectedId ? progress : o.progress} />
        <span className="text-[10px] text-slate-500">{o.id === selectedId ? progress : o.progress}%</span>
      </div>
    );
    if (key === "rollbackReadiness") return <Chip className={statusChip(o.rollbackReadiness === 100 ? "Passed" : "Warning")}>{o.rollbackReadiness}%</Chip>;
    if (["state", "risk", "guardrail", "validation", "serviceState"].includes(key)) {
      const val = String(o[key]);
      return <Chip className={statusChip(val)}>{val}</Chip>;
    }
    return String(o[key]);
  };

  /* ----------------------------- handlers -------------------------------- */

  const resetPage = () => {
    setSelectedId(EXECUTION_ID); setPaused(false); setStopped(false); setEmergencyStopped(false);
    setHumanControl(false); setOwner(recoveryHeader.executionOwner); setNotes([]); setBrief(null);
    setStepOverrides({}); setSelectedStep(null); setStepNotes({}); setTransitionIdx(0);
    setTransitionHeld(false); setCapacityFailed(false); setLatencyRaised(false); setComparePlanned(false);
    setFallbackLoad(rfFallback.currentThroughput); setFallbackHeld(true); setFallbackReleased(false);
    setFallbackDegraded(false); setFallbackValidatedAt(rfFallback.lastValidation);
    setBeamIdx(null); setBeamRunning(false); setBeamResult(null); setDiagRuns({}); setDiagCompare("none");
    setValOverrides({}); setGuardFailed(null); setGuardDecision(null); setRollbackTested(false);
    setRollbackStage(null); setRollbackPaused(false); setRollbackFailed(false);
    setExceptionId(null); setExceptionStatus({}); setRaisedExceptions([]); setExtraEvents([]);
    setPinnedEvents([]); setTlPlayback(null); setStageIdx(null); setRunning(false); setInjections([]);
    setShowComparison(false); setLearningLog([]); setDrawer(null); setActiveKpi(null); setQueueExport(null); setTlExport(null);
  };

  const applyInjection = (id: string) => {
    const inj = scenarioInjections.find((i) => i.id === id)!;
    setInjections((p) => (p.includes(id) ? p : [...p, id]));
    setRaisedExceptions((p) => (p.includes(inj.exceptionId) ? p : [...p, inj.exceptionId]));
    setExceptionId(inj.exceptionId);
    if (id === "inj-rf") { setCapacityFailed(true); setFallbackDegraded(true); }
    if (id === "inj-latency") { setLatencyRaised(true); setValOverrides((p) => ({ ...p, "vt-c-lat": "Failed" })); }
    if (id === "inj-beam") { setBeamResult("Failed"); setBeamRunning(false); }
    if (id === "inj-stale") setDiagRuns((p) => ({ ...p, "dg-t-fresh": "Failed" }));
    if (id === "inj-approval") setPaused(true);
    addEvent(inj.label, "Recovery Orchestrator Agent", inj.narrative, "Guardrail");
  };

  const triggerRollback = () => {
    setRollbackStage(0); setRollbackPaused(false);
    addEvent("Rollback triggered", owner, "Rollback sequence started, traffic movement halted", "Rollback");
  };

  const openStep = (s: WorkflowStep) => {
    setSelectedStep(s.n);
    setDrawer({
      title: `Step ${s.n} · ${s.name}`,
      body: s.purpose,
      rows: [
        ["Status", stepOverrides[s.n] ?? steps[s.n - 1].status],
        ["Execution method", s.method], ["Owner", s.owner], ["Owner type", s.kind],
        ["Input data", s.input], ["Current values", s.output], ["Expected output", s.output],
        ["Policy checks", s.policy], ["Guardrails", s.guardrail], ["Validation criteria", s.validation],
        ["Evidence captured", s.evidence], ["Failure conditions", s.failureResponse],
        ["Retry policy", s.retryPolicy], ["Rollback step", s.rollbackStep],
        ["Start time", s.start], ["Duration", s.duration],
        ["Audit history", `${(stepNotes[s.n] ?? []).length} local notes recorded`],
        ["Current result", stepOverrides[s.n] ?? steps[s.n - 1].status],
      ],
      actions: [
        { label: "Start step", run: () => setStepOverrides((p) => ({ ...p, [s.n]: "Running" })) },
        { label: "Pause step", run: () => setStepOverrides((p) => ({ ...p, [s.n]: "Waiting" })) },
        { label: "Retry step", run: () => setStepOverrides((p) => ({ ...p, [s.n]: "Running" })) },
        { label: "Skip step", run: () => setStepOverrides((p) => ({ ...p, [s.n]: "Skipped" })) },
        { label: "Request human review", run: () => { setStepOverrides((p) => ({ ...p, [s.n]: "Awaiting human input" })); setHumanControl(true); } },
        { label: "Add note", run: () => setStepNotes((p) => ({ ...p, [s.n]: [...(p[s.n] ?? []), "Local reviewer note recorded"] })) },
        { label: "Add evidence", run: () => addEvent(`Evidence attached to step ${s.n}`, owner, "Local evidence reference added", "Evidence") },
        { label: "Mark passed", run: () => setStepOverrides((p) => ({ ...p, [s.n]: "Passed" })) },
        { label: "Mark failed", run: () => { setStepOverrides((p) => ({ ...p, [s.n]: "Failed" })); setHumanControl(true); } },
        { label: "Trigger rollback", run: triggerRollback },
      ],
    });
  };

  const openRouteObject = (id: string) => {
    const o = routeObjects.find((x) => x.id === id);
    if (!o) return;
    setRouteObjectId(id);
    if (o.kind === "Node") setNodeId(id); else setEdgeId(id);
    setDrawer({
      title: `${o.name} · ${o.kind}`,
      body: `${o.operationalState}. Traffic role: ${o.trafficRole}.`,
      rows: [
        ["Health", o.health], ["Operational state", o.operationalState], ["Owner", o.owner],
        ["Capacity", o.capacity], ["Current throughput", o.throughput], ["Latency", o.latency],
        ["Packet loss", o.packetLoss], ["Current execution step", o.step],
        ["Agent activity", o.agentActivity], ["Validation state", o.validation],
        ["Rollback relevance", o.rollbackRelevance], ["Traffic role", o.trafficRole],
      ],
    });
  };

  const fallbackUtil = fallbackDegraded ? 5.6 : fallbackLoad;
  const fallbackHeadroom = Math.round(((rfFallback.totalCapacity - fallbackUtil) / rfFallback.totalCapacity) * 100);

  const filteredDiagnostics = diagnostics
    .map((x) => (diagRuns[x.id] ? { ...x, status: diagRuns[x.id] } : x))
    .filter((x) => diagGroup === ALL || x.group === diagGroup);

  const filteredValidation = validationList.filter((t) => valGroup === ALL || t.group === valGroup);

  const filteredEvents = events.filter((e) =>
    (tlActor === ALL || e.actor === tlActor) &&
    (tlType === ALL || e.type === tlType) &&
    (tlValidation === ALL || e.validation === tlValidation))
    .slice(0, tlPlayback === null ? undefined : tlPlayback + 1);

  const filteredEvidence = executionEvidence.filter((e) => evGroup === ALL || e.group === evGroup);

  const blockingGuardrails = liveGuardrails.map((g) => {
    if (guardFailed === g.id) return { ...g, status: "Blocked" as const };
    if (stage && stage.n >= 10 && g.id === "lg-sustained") return { ...g, status: "Passed" as const, current: "15m 00s sustained" };
    if (capacityFailed && g.id === "lg-headroom") return { ...g, status: "Blocked" as const, current: "12 percent" };
    if (latencyRaised && g.id === "lg-latency") return { ...g, status: "Triggered" as const, current: "13.4 ms" };
    return g;
  });
  const anyBlocked = blockingGuardrails.some((g) => g.enforcement === "Blocking" && (g.status === "Blocked" || g.status === "Triggered"));

  /* -------------------------------- render ------------------------------- */

  const wrap = fullScreen ? "fixed inset-0 z-50 overflow-auto bg-slate-50 p-4" : "space-y-4";

  return (
    <div className={wrap}>
      {/* page identity */}
      <header>
        <p className="text-[11px] text-slate-500">SRE / Agentic SRE NOC / Autonomous Recovery Monitor</p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900">Autonomous Recovery Monitor</h1>
        <p className="text-[12.5px] text-slate-600">
          Observe governed execution, service validation, exception handling, and rollback across optical connectivity operations
        </p>
        <Chip className={cn("mt-2", toneChip("info"))}><ShieldCheck className="h-3 w-3" aria-hidden /> {SYNTHETIC_NOTE}</Chip>
      </header>

      {/* ---------------------- recovery command header ---------------------- */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-slate-900">
              {selectedRow.id} · {selectedRow.action}
            </h2>
            <p className="text-[11.5px] text-slate-500">
              {selectedRow.situation} · {selectedRow.customerService} · Approval {isDefault ? APPROVAL_ID : "Governed approval on file"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Select label="Active recovery" value={selectedId} options={recoveryOperations.map((r) => r.id)} onChange={setSelectedId} />
            <ToolbarButton onClick={() => setBrief(`Execution brief exported for ${selectedRow.id} with ${evidenceCount} evidence records.`)}>
              <Download className="h-3.5 w-3.5" aria-hidden /> Export execution brief
            </ToolbarButton>
            <ToolbarButton onClick={() => setFullScreen((v) => !v)} active={fullScreen}>
              {fullScreen ? <Minimize2 className="h-3.5 w-3.5" aria-hidden /> : <Maximize2 className="h-3.5 w-3.5" aria-hidden />} Full screen
            </ToolbarButton>
            <ToolbarButton onClick={resetPage}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset demonstration state
            </ToolbarButton>
          </div>
        </div>

        <p className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 text-[12.5px] text-slate-800">
          {isDefault ? recoveryHeader.approvedAction : selectedRow.detail}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
          <Field label="Execution" value={selectedRow.id} />
          <Field label="Situation" value={selectedRow.situation} />
          <Field label="Approval request" value={isDefault ? APPROVAL_ID : "On file"} />
          <Field label="Customer" value={selectedRow.customer} />
          <Field label="Customer service" value={selectedRow.customerService} />
          <Field label="Region" value={selectedRow.region} />
          <Field label="Product" value={selectedRow.product} />
          <Field label="Execution state" value={effectiveState} />
          <Field label="Current step" value={currentStepName} />
          <Field label="Progress" value={`${progress}%`} />
          <Field label="Action risk" value={selectedRow.risk} />
          <Field label="Autonomy level" value={selectedRow.autonomy} />
          <Field label="Human execution owner" value={isDefault ? owner : selectedRow.owner} />
          <Field label="Primary digital coworker" value={selectedRow.agent} />
          <Field label="Execution started" value={recoveryHeader.startedAt} />
          <Field label="Elapsed time" value={selectedRow.elapsed} />
          <Field label="Estimated completion" value={recoveryHeader.estimatedCompletion} />
          <Field label="Customer service state" value={stage ? stage.serviceState : selectedRow.serviceState} />
          <Field label="Rollback readiness" value={`${effectiveRollbackReadiness} percent`} />
          <Field label="Guardrail state" value={anyBlocked ? "Blocking guardrail failure" : recoveryHeader.guardrailState} />
          <Field label="Last telemetry update" value={recoveryHeader.lastTelemetry} />
          <Field label="Data confidence" value={recoveryHeader.dataConfidence} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <ToolbarButton onClick={() => { setPaused(true); addEvent("Execution paused", owner, "All agent steps held", "Human decision"); }} active={paused}>
            <Pause className="h-3.5 w-3.5" aria-hidden /> Pause execution
          </ToolbarButton>
          <ToolbarButton onClick={() => { setPaused(false); setHumanControl(false); addEvent("Execution resumed", owner, "Agent execution resumed within guardrails", "Human decision"); }}>
            <Play className="h-3.5 w-3.5" aria-hidden /> Resume execution
          </ToolbarButton>
          <ToolbarButton onClick={() => { setStopped(true); addEvent("Execution stopped", owner, "Execution stopped before further traffic movement", "Human decision"); }} active={stopped}>
            <CircleSlash className="h-3.5 w-3.5" aria-hidden /> Stop execution
          </ToolbarButton>
          <ToolbarButton onClick={triggerRollback} active={rollbackStage !== null}>
            <Undo2 className="h-3.5 w-3.5" aria-hidden /> Trigger rollback
          </ToolbarButton>
          <ToolbarButton onClick={() => { setHumanControl(true); addEvent("Human control requested", owner, humanControlNote, "Human decision"); }} active={humanControl}>
            <User className="h-3.5 w-3.5" aria-hidden /> Request human control
          </ToolbarButton>
          <Select
            label="Reassign execution owner"
            value={owner}
            options={["N. Iyer, Network Operations", "S. Krishnan, Optical Engineering", "R. Venkatesan, Incident Commander", "India South NOC"]}
            onChange={(v) => { setOwner(v); addEvent("Execution owner reassigned", v, `Execution ownership moved to ${v}`, "Human decision"); }}
          />
          <ToolbarButton onClick={() => setDrawer({
            title: "Approval evidence",
            body: "Approval decision record carried forward from the Human Approval and Action Center.",
            rows: [["Approval request", APPROVAL_ID], ["Situation", SITUATION_ID], ["Decision", "Approved with conditions"], ["Valid until", "13:05 UTC"], ["Conditions", "Rollback validation passes and customer validation runs at each increment"]],
          })}>
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Open approval evidence
          </ToolbarButton>
          <ToolbarButton onClick={() => { setEmergencyStopped(true); addEvent("Emergency stop activated", owner, "All agent execution halted immediately", "Human decision"); }} active={emergencyStopped}>
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> Emergency stop
          </ToolbarButton>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            aria-label="Execution note"
            placeholder="Add an execution note"
            className="min-w-[240px] flex-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11.5px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <ToolbarButton onClick={() => { if (noteDraft.trim()) { setNotes((p) => [...p, noteDraft.trim()]); addEvent("Execution note added", owner, noteDraft.trim(), "Human decision"); setNoteDraft(""); } }}>
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add execution note
          </ToolbarButton>
        </div>
        {notes.length > 0 && (
          <ul className="mt-2 space-y-1 text-[11.5px] text-slate-600">
            {notes.map((n, i) => <li key={`${n}-${i}`}>· {n}</li>)}
          </ul>
        )}
        {brief && <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-600">{brief}</p>}
        {(emergencyStopped || humanControl) && (
          <p role="status" className="mt-2 rounded-md border border-rose-200 bg-rose-50 p-2 text-[11.5px] text-rose-700">
            {emergencyStopped ? "Emergency stop is active. No agent step may execute until the demonstration state is reset." : humanControlNote}
          </p>
        )}

        {/* execution state progression */}
        <div className="mt-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Execution state progression</h3>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {EXECUTION_STATES.map((s) => (
              <Chip key={s} className={s === effectiveState ? "border-indigo-400 bg-indigo-50 text-indigo-700" : executionStateStages.some((x) => x.state === s && x.status === "Complete") ? toneChip("good") : toneChip("neutral")}>
                {s}
              </Chip>
            ))}
          </div>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[1100px] text-[11.5px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr><Th>State</Th><Th>Status</Th><Th>Entered</Th><Th>Duration</Th><Th>Owner</Th><Th>Agent</Th><Th>Required input</Th><Th>Validation</Th><Th>Policy</Th><Th>Guardrail</Th><Th>Exit criteria</Th><Th>Failure response</Th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {executionStateStages.map((s) => (
                  <tr key={s.state}>
                    <Td className="font-medium text-slate-900">{s.state}</Td>
                    <Td><Chip className={statusChip(s.status)}>{s.status}</Chip></Td>
                    <Td>{s.entered}</Td><Td>{s.duration}</Td><Td>{s.owner}</Td><Td>{s.agent}</Td>
                    <Td>{s.requiredInput}</Td><Td>{s.validation}</Td>
                    <Td><Chip className={statusChip(s.policyCheck)}>{s.policyCheck}</Chip></Td>
                    <Td><Chip className={statusChip(s.guardrail)}>{s.guardrail}</Chip></Td>
                    <Td>{s.exitCriteria}</Td><Td>{s.failureResponse}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <SectionNote>All execution values are synthetic demonstration data. No real network, terminal or routing action is performed.</SectionNote>
      </section>

      {/* ------------------------- scorecard ------------------------- */}
      <section className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
        {recoveryKpis.map((k) => (
          <KpiCard
            key={k.id}
            kpi={k.id === "kpi-progress" ? { ...k, value: `${progress}%` } : k.id === "kpi-validation" ? { ...k, value: `${validationPassed} of ${validationList.length}` } : k.id === "kpi-rollback" ? { ...k, value: `${effectiveRollbackReadiness}%` } : k.id === "kpi-restored" ? { ...k, value: `${traffic.optical} Gbps`, sub: `${traffic.fallback} Gbps remains on fallback` } : k}
            active={activeKpi === k.id}
            onClick={() => setActiveKpi((p) => (p === k.id ? null : k.id))}
          />
        ))}
      </section>
      {activeKpi && (
        <p className="rounded-md border border-slate-200 bg-white p-2 text-[11.5px] text-slate-600">
          {recoveryKpis.find((k) => k.id === activeKpi)?.explain}
        </p>
      )}

      {/* ------------------------ active recovery queue ---------------------- */}
      <Panel
        title="Active Recovery Operations"
        subtitle="Execution control queue. Selecting a row updates every compatible panel on this page."
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <ToolbarButton onClick={() => setWideColumns((v) => !v)} active={wideColumns}><ArrowRightLeft className="h-3.5 w-3.5" aria-hidden /> Wide columns</ToolbarButton>
            <ToolbarButton onClick={() => setPinFirst((v) => !v)} active={pinFirst}>Pin selected</ToolbarButton>
            <ToolbarButton onClick={() => setAccessibleTable((v) => !v)} active={accessibleTable}>Accessible table mode</ToolbarButton>
            <ToolbarButton onClick={() => setQueueExport(`${rows.length} recovery rows exported as synthetic demonstration data.`)}><Download className="h-3.5 w-3.5" aria-hidden /> Export visible rows</ToolbarButton>
          </div>
        }
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" placeholder="Search"
            className="min-w-[180px] rounded-md border border-slate-200 px-2.5 py-1.5 text-[11.5px] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <Select label="Group by" value={grouping} options={RECOVERY_GROUPINGS} onChange={(v) => setGrouping(v as RecoveryGrouping)} />
          <Select label="Execution state" value={stateFilter} options={[ALL, ...new Set(recoveryOperations.map((r) => r.state))]} onChange={setStateFilter} />
          <Select label="Region" value={regionFilter} options={[ALL, ...new Set(recoveryOperations.map((r) => r.region))]} onChange={setRegionFilter} />
          <Select label="Saved view" value={savedView} options={savedRecoveryViews.map((v) => v.name)} onChange={setSavedView} />
          <Select label="Sort by" value={sortKey} options={RECOVERY_COLUMNS.map((c) => c.key)} onChange={(v) => setSortKey(v as RecoveryColumnKey)} />
          <ToolbarButton onClick={() => setSortAsc((v) => !v)}>{sortAsc ? "Ascending" : "Descending"}</ToolbarButton>
        </div>

        <div className="mb-2 flex flex-wrap gap-1">
          {RECOVERY_COLUMNS.map((c, i) => (
            <div key={c.key} className="flex items-center">
              <button
                type="button"
                aria-pressed={columns.includes(c.key)}
                onClick={() => setColumns((p) => (p.includes(c.key) ? p.filter((k) => k !== c.key) : [...p, c.key]))}
                className={cn("rounded-l border px-1.5 py-0.5 text-[10px]", columns.includes(c.key) ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-500")}
              >
                {c.label}
              </button>
              <button
                type="button"
                aria-label={`Move ${c.label} earlier`}
                onClick={() => setColumns((p) => {
                  const idx = p.indexOf(c.key);
                  if (idx <= 0) return p;
                  const next = [...p]; next[idx - 1] = p[idx]; next[idx] = p[idx - 1]; return next;
                })}
                className="rounded-r border border-l-0 border-slate-200 bg-white px-1 py-0.5 text-[10px] text-slate-400"
              >
                ‹
              </button>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className={cn("w-full text-[11.5px]", wideColumns ? "min-w-[2000px]" : "min-w-[1200px]")}>
            <caption className="sr-only">Active recovery operations with execution state, progress, guardrail and rollback readiness</caption>
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <Th>Select</Th>
                {RECOVERY_COLUMNS.filter((c) => columns.includes(c.key)).map((c) => (
                  <th key={c.key} className={cn("whitespace-nowrap px-2.5 py-2 text-left font-medium text-slate-500", pinFirst && c.key === "priority" && "sticky left-0 bg-slate-50")}>
                    <button type="button" onClick={() => { setSortKey(c.key); setSortAsc((v) => (sortKey === c.key ? !v : true)); }} className="hover:text-slate-800">
                      {c.label}{sortKey === c.key ? (sortAsc ? " ▲" : " ▼") : ""}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map((g) => (
                <Fragment key={g.key}>
                  {grouping !== "No grouping" && (
                    <tr className="bg-slate-50/70"><Td className="font-medium text-slate-700">{g.key}</Td><Td className="text-slate-500">{g.rows.length} recoveries</Td>{columns.slice(1).map((c) => <Td key={c}> </Td>)}</tr>
                  )}
                  {g.rows.map((o) => (
                    <Fragment key={o.id}>
                      <tr className={cn("hover:bg-slate-50", o.id === selectedId && "bg-indigo-50/40")}>
                        <Td>
                          <div className="flex items-center gap-1">
                            <button type="button" aria-label={`Select ${o.id}`} aria-pressed={o.id === selectedId} onClick={() => setSelectedId(o.id)}
                              className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-white">Select</button>
                            <button type="button" aria-label={`Expand ${o.id}`} onClick={() => setExpandedRow((p) => (p === o.id ? null : o.id))}
                              className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500">+</button>
                          </div>
                        </Td>
                        {RECOVERY_COLUMNS.filter((c) => columns.includes(c.key)).map((c) => (
                          <td key={c.key} className={cn("px-2.5 py-2 align-top text-slate-700", pinFirst && c.key === "priority" && "sticky left-0 bg-white", accessibleTable && "whitespace-normal")}>
                            {cellValue(o, c.key)}
                          </td>
                        ))}
                      </tr>
                      {expandedRow === o.id && (
                        <tr className="bg-slate-50/60">
                          <Td className="text-slate-500">Detail</Td>
                          <td className="px-2.5 py-2 text-slate-600" colSpan={columns.length}>
                            <div className="grid gap-2 md:grid-cols-3">
                              <Field label="Action" value={o.action} />
                              <Field label="Traffic state" value={o.trafficState} />
                              <Field label="Situation" value={o.situation} />
                              <Field label="Primary agent" value={o.agent} />
                              <Field label="Execution owner" value={o.owner} />
                              <Field label="Autonomy level" value={o.autonomy} />
                            </div>
                            <p className="mt-2 text-[11.5px]">{o.detail}</p>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {queueExport && <p className="mt-2 text-[11px] text-slate-500">{queueExport}</p>}
      </Panel>

      {/* ---------------------- selected execution summary ------------------- */}
      <Panel title="Selected Recovery Operation" subtitle={`${selectedRow.id} · ${selectedRow.customerService}`}>
        <div className="mb-3 flex flex-wrap gap-1">
          {EXECUTION_TABS.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t}
              className={cn("rounded-md border px-2 py-1 text-[11px]", tab === t ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>
              {t}
            </button>
          ))}
        </div>

        {tab === "Summary" && (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
            <Field label="Execution" value={selectedRow.id} />
            <Field label="Situation" value={selectedRow.situation} />
            <Field label="Approval request" value={isDefault ? APPROVAL_ID : "On file"} />
            <Field label="Customer" value={selectedRow.customer} />
            <Field label="Customer service" value={selectedRow.customerService} />
            <Field label="Optical link" value={isDefault ? recoveryHeader.opticalLink : selectedRow.customerService} />
            <Field label="Product" value={selectedRow.product} />
            <Field label="Region" value={selectedRow.region} />
            <Field label="Execution state" value={effectiveState} />
            <Field label="Current step" value={currentStepName} />
            <Field label="Progress" value={`${progress}%`} />
            <Field label="Customer service state" value={stage ? stage.serviceState : selectedRow.serviceState} />
            <Field label="Traffic distribution" value={`${traffic.optical} Gbps optical, ${traffic.fallback} Gbps fallback`} />
            <Field label="Optical path state" value={selectedExecution.opticalPathState} />
            <Field label="RF fallback state" value={fallbackReleased ? "Released to standby" : selectedExecution.fallbackStateLabel} />
            <Field label="Validation state" value={`${validationPassed} of ${validationList.length} tests passed`} />
            <Field label="Rollback readiness" value={`${effectiveRollbackReadiness} percent`} />
            <Field label="Policy status" value={selectedExecution.policyStatus} />
            <Field label="Guardrail status" value={anyBlocked ? "Blocking guardrail failure" : selectedExecution.guardrailStatus} />
            <Field label="Execution owner" value={isDefault ? owner : selectedRow.owner} />
            <Field label="Assigned agents" value={`${selectedExecution.assignedAgents} digital coworkers`} />
            <Field label="Evidence count" value={`${evidenceCount} records`} />
            <Field label="Expected completion" value={selectedExecution.expectedCompletion} />
            <Field label="Approved action" value={isDefault ? "Governed return to optical transport" : selectedRow.action} />
          </div>
        )}
        {tab === "Workflow" && <p className="text-[11.5px] text-slate-600">The full 22 step execution workflow is shown in the Recovery Execution Workflow section below. Current step: {currentStepName}.</p>}
        {tab === "Traffic" && <p className="text-[11.5px] text-slate-600">Traffic is currently {traffic.optical} Gbps on the primary optical path and {traffic.fallback} Gbps on RF fallback. See the Traffic Transition Monitor below.</p>}
        {tab === "Optical Recovery" && <p className="text-[11.5px] text-slate-600">Link margin {opticalRecovery.linkMargin} against a threshold of {opticalRecovery.recoveryThreshold}. Sustained {opticalRecovery.sustainedTimer}.</p>}
        {tab === "Diagnostics" && <p className="text-[11.5px] text-slate-600">{diagnostics.length} diagnostics across five domains. {filteredDiagnostics.filter((x) => x.status === "Warning").length} warnings currently open.</p>}
        {tab === "Validation" && <p className="text-[11.5px] text-slate-600">{validationPassed} of {validationList.length} validation tests passed. Blocking tests must pass before each traffic increment.</p>}
        {tab === "Rollback" && <p className="text-[11.5px] text-slate-600">Rollback readiness {effectiveRollbackReadiness} percent via {rollbackReadiness.route}. Last tested {rollbackReadiness.lastTest}.</p>}
        {tab === "Evidence" && <p className="text-[11.5px] text-slate-600">{evidenceCount} execution evidence records captured across {EVIDENCE_GROUPS.length} categories.</p>}
        {tab === "Ownership" && <p className="text-[11.5px] text-slate-600">{executionActors.filter((a) => a.kind === "Agent").length} digital coworkers and {executionActors.filter((a) => a.kind === "Human").length} human roles share execution ownership.</p>}
        {tab === "History" && <p className="text-[11.5px] text-slate-600">{events.filter((e) => e.status === "Complete").length} completed execution events recorded on the timeline below.</p>}
      </Panel>

      {/* ---------------------- recovery execution workflow ------------------ */}
      <Panel title="Recovery Execution Workflow" subtitle="Twenty-two governed steps. Selecting a step opens the execution detail drawer.">
        <ol className="space-y-1.5">
          {steps.map((s) => (
            <li key={s.n}>
              <button
                type="button"
                onClick={() => openStep(s)}
                aria-label={`Step ${s.n} ${s.name}, ${s.status}`}
                className={cn(
                  "flex w-full flex-wrap items-center gap-2 rounded-lg border p-2 text-left text-[11.5px] hover:bg-slate-50",
                  selectedStep === s.n ? "border-indigo-400 bg-indigo-50/50" : s.n === currentStepNumber ? "border-indigo-200" : "border-slate-200",
                )}
              >
                <span className="w-6 text-[10px] text-slate-400">{s.n}</span>
                <span className="min-w-[220px] flex-1 font-medium text-slate-900">{s.name}</span>
                <Chip className={statusChip(s.status)}>{s.status}</Chip>
                <Chip className={toneChip(s.kind === "Agent" ? "info" : "neutral")}>{s.kind === "Agent" ? <Bot className="h-3 w-3" aria-hidden /> : <User className="h-3 w-3" aria-hidden />} {s.owner}</Chip>
                <span className="text-slate-500">{s.start}</span>
                <span className="text-slate-400">{s.duration}</span>
                <Chip className={statusChip(s.policy)}>Policy {s.policy}</Chip>
                <Chip className={statusChip(s.guardrail)}>Guardrail {s.guardrail}</Chip>
                <Chip className={statusChip(s.validation)}>{s.validation}</Chip>
                <span className="text-slate-400">Rollback: {s.rollbackStep}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              </button>
            </li>
          ))}
        </ol>
        <SectionNote>Step results are local demonstration state. No step performs a real operational action.</SectionNote>
      </Panel>

      {/* ---------------------- live service and route state ----------------- */}
      <Panel title="Live Service and Route State" subtitle="End to end customer service chain with transport, fallback and rollback routes.">
        <div className="grid gap-2 md:grid-cols-3">
          <Field label="Current active route" value={routeSummary.activeRoute} />
          <Field label="Proposed route" value={routeSummary.proposedRoute} />
          <Field label="Rollback route" value={routeSummary.rollbackRoute} />
        </div>
        <div className="mt-2">
          <ServiceRouteGraph
            route={situationRoute}
            selectedNodeId={nodeId}
            selectedEdgeId={edgeId}
            onSelectNode={(id) => openRouteObject(id)}
            onSelectEdge={(id) => openRouteObject(id)}
          />
        </div>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[1200px] text-[11.5px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><Th>Object</Th><Th>Type</Th><Th>Traffic role</Th><Th>Health</Th><Th>Operational state</Th><Th>Owner</Th><Th>Capacity</Th><Th>Throughput</Th><Th>Latency</Th><Th>Loss</Th><Th>Execution step</Th><Th>Agent activity</Th><Th>Validation</Th><Th>Rollback relevance</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routeObjects.map((o) => (
                <tr key={o.id} className={cn("hover:bg-slate-50", routeObjectId === o.id && "bg-indigo-50/40")}>
                  <Td>
                    <button type="button" onClick={() => openRouteObject(o.id)} className="font-medium text-indigo-700 hover:underline">{o.name}</button>
                  </Td>
                  <Td>{o.kind}</Td>
                  <Td><Chip className={
                    o.trafficRole === "On optical" ? toneChip("good")
                      : o.trafficRole === "On RF fallback" ? toneChip("info")
                        : o.trafficRole === "Transitioning" ? toneChip("watch")
                          : o.trafficRole === "Blocked" ? toneChip("risk") : toneChip("neutral")
                  }>{o.trafficRole}</Chip></Td>
                  <Td><Chip className={statusChip(o.health)}>{o.health}</Chip></Td>
                  <Td>{o.operationalState}</Td><Td>{o.owner}</Td><Td>{o.capacity}</Td><Td>{o.throughput}</Td>
                  <Td>{o.latency}</Td><Td>{o.packetLoss}</Td><Td>{o.step}</Td><Td>{o.agentActivity}</Td>
                  <Td><Chip className={statusChip(o.validation)}>{o.validation}</Chip></Td>
                  <Td>{o.rollbackRelevance}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ------------------------ traffic transition ------------------------- */}
      <Panel
        title="Traffic Transition Monitor"
        subtitle="Coordinated transport distribution across optical, fallback and alternate routes."
        action={
          <div className="flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => setTransitionIdx((i) => Math.min(i + 1, transitionStages.length - 1))}>Advance to next transition stage</ToolbarButton>
            <ToolbarButton onClick={() => setTransitionHeld(true)} active={transitionHeld}>Pause transition</ToolbarButton>
            <ToolbarButton onClick={() => setTransitionHeld(true)} active={transitionHeld}>Hold current distribution</ToolbarButton>
            <ToolbarButton onClick={() => { setTransitionIdx(0); setTransitionHeld(false); addEvent("Traffic returned to fallback", owner, "All priority traffic returned to the RF fallback path", "Traffic change"); }}>Return traffic to fallback</ToolbarButton>
            <ToolbarButton onClick={() => { setCapacityFailed(true); applyInjection("inj-rf"); }} active={capacityFailed}>Simulate capacity failure</ToolbarButton>
            <ToolbarButton onClick={() => { setLatencyRaised(true); applyInjection("inj-latency"); }} active={latencyRaised}>Simulate latency increase</ToolbarButton>
            <ToolbarButton onClick={() => setComparePlanned((v) => !v)} active={comparePlanned}>Compare current and planned distribution</ToolbarButton>
          </div>
        }
      >
        <div className="space-y-2">
          <div className="flex h-6 w-full overflow-hidden rounded-md border border-slate-200">
            {TRAFFIC_LANES.map((l) => {
              const val = l.key === "optical" ? traffic.optical : l.key === "fallback" ? traffic.fallback : 0;
              if (val <= 0) return null;
              return (
                <div key={l.key} style={{ width: `${(val / 10) * 100}%`, backgroundColor: l.color }}
                  className="flex items-center justify-center text-[10px] font-medium text-white transition-[width] duration-500 motion-reduce:transition-none">
                  {val} Gbps
                </div>
              );
            })}
          </div>
          <ul className="flex flex-wrap gap-3 text-[10.5px] text-slate-600">
            {TRAFFIC_LANES.map((l) => (
              <li key={l.key} className="flex items-center gap-1"><span className="h-1.5 w-3 rounded" style={{ backgroundColor: l.color }} aria-hidden />{l.label}</li>
            ))}
          </ul>
          <p className="text-[11.5px] text-slate-600">
            Total customer traffic 10 Gbps · Primary optical {traffic.optical} Gbps · RF fallback {traffic.fallback} Gbps · Alternate fiber 0 Gbps · Alternate optical 0 Gbps
          </p>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[1100px] text-[11.5px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><Th>Stage</Th><Th>Optical</Th><Th>Fallback</Th><Th>Traffic moved</Th><Th>Capacity headroom</Th><Th>Expected latency</Th><Th>Packet loss threshold</Th><Th>Customer impact</Th><Th>Validation</Th><Th>Guardrail</Th><Th>Rollback trigger</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transitionStages.map((t, i) => (
                <tr key={t.id} className={cn("cursor-pointer hover:bg-slate-50", i === transitionIdx && "bg-indigo-50/40")} onClick={() => setTransitionIdx(i)}>
                  <Td>
                    <button type="button" aria-label={`Select ${t.label}`} className="font-medium text-indigo-700 hover:underline">{t.label}</button>
                  </Td>
                  <Td>{t.optical} Gbps</Td><Td>{t.fallback} Gbps</Td><Td>{t.moved}</Td><Td>{t.headroom}</Td>
                  <Td>{t.latency}</Td><Td>{t.lossThreshold}</Td><Td>{t.customerImpact}</Td>
                  <Td><Chip className={statusChip(t.validation)}>{t.validation}</Chip></Td>
                  <Td><Chip className={statusChip(t.guardrail)}>{t.guardrail}</Chip></Td>
                  <Td>{t.rollbackTrigger}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {comparePlanned && (
          <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-600">
            Current distribution {traffic.optical} Gbps optical and {traffic.fallback} Gbps fallback. Planned distribution at {transitionStages[transitionIdx].label}: {transitionStages[transitionIdx].optical} Gbps optical and {transitionStages[transitionIdx].fallback} Gbps fallback.
          </p>
        )}
        <SectionNote>No real traffic change is performed. Transitions are local demonstration state.</SectionNote>
      </Panel>

      {/* -------------------------- RF fallback ------------------------------ */}
      <Panel
        title="RF Fallback Operations"
        subtitle="Temporary transport protecting priority customer classes."
        action={
          <div className="flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => { setFallbackValidatedAt("Revalidated locally"); addEvent("Fallback validated", "RF Fallback Guardian", "Fallback capacity and stability revalidated", "Validation"); }}>Validate fallback</ToolbarButton>
            <ToolbarButton onClick={() => setFallbackHeld(true)} active={fallbackHeld}>Hold fallback</ToolbarButton>
            <ToolbarButton onClick={() => { setFallbackReleased(true); setFallbackHeld(false); addEvent("Fallback released", "RF Fallback Guardian", "Temporary fallback state closed", "Traffic change"); }} active={fallbackReleased}>Release fallback</ToolbarButton>
            <ToolbarButton onClick={() => setFallbackLoad((v) => Math.min(v + 0.8, 6))}>Increase simulated load</ToolbarButton>
            <ToolbarButton onClick={() => setFallbackDegraded(true)} active={fallbackDegraded}>Simulate fallback degradation</ToolbarButton>
            <ToolbarButton onClick={() => { setGuardFailed("lg-headroom"); triggerRollback(); }}>Trigger rollback condition</ToolbarButton>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-5">
          <Field label="Fallback route state" value={fallbackReleased ? "Standby" : rfFallback.state} />
          <Field label="Activation time" value={rfFallback.activatedAt} />
          <Field label="Total capacity" value={`${rfFallback.totalCapacity} Gbps`} />
          <Field label="Current throughput" value={`${fallbackUtil.toFixed(1)} Gbps`} />
          <Field label="Available headroom" value={`${fallbackHeadroom} percent`} />
          <Field label="Latency" value={latencyRaised ? "13.4 ms" : rfFallback.latency} />
          <Field label="Packet loss" value={rfFallback.packetLoss} />
          <Field label="Availability" value={rfFallback.availability} />
          <Field label="Priority traffic protected" value={rfFallback.priorityProtected} />
          <Field label="Services supported" value={rfFallback.servicesSupported} />
          <Field label="Expected safe duration" value={rfFallback.safeDuration} />
          <Field label="Policy status" value={rfFallback.policy} />
          <Field label="Last validation" value={fallbackValidatedAt} />
          <Field label="Release readiness" value={fallbackReleased ? "Released" : rfFallback.releaseReadiness} />
        </div>

        <div className="mt-3">
          <div className="relative h-6 w-full overflow-hidden rounded-md border border-slate-200 bg-slate-50">
            <div className="absolute inset-y-0 left-0 bg-sky-500/80 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${(fallbackUtil / rfFallback.totalCapacity) * 100}%` }} />
            <div className="absolute inset-y-0 border-l-2 border-amber-500" style={{ left: `${(rfFallback.rollbackThreshold / rfFallback.totalCapacity) * 100}%` }} title="Rollback threshold" />
            <div className="absolute inset-y-0 border-l-2 border-rose-500" style={{ left: `${(rfFallback.criticalThreshold / rfFallback.totalCapacity) * 100}%` }} title="Critical threshold" />
          </div>
          <p className="mt-1 text-[10.5px] text-slate-500">
            Total {rfFallback.totalCapacity} Gbps · Reserved {rfFallback.reserved} Gbps · Utilisation {fallbackUtil.toFixed(1)} Gbps · Headroom {fallbackHeadroom} percent · Rollback threshold {rfFallback.rollbackThreshold} Gbps · Critical threshold {rfFallback.criticalThreshold} Gbps
          </p>
        </div>

        <ul className="mt-3 space-y-1 text-[11.5px] text-slate-600">
          {fallbackGuardrails.map((g) => (
            <li key={g} className="flex items-center gap-2">
              <Chip className={statusChip(fallbackDegraded && g.startsWith("Headroom") ? "Blocked" : latencyRaised && g.startsWith("Latency") ? "Triggered" : "Passed")}>
                {fallbackDegraded && g.startsWith("Headroom") ? "Blocked" : latencyRaised && g.startsWith("Latency") ? "Triggered" : "Passed"}
              </Chip>
              {g}
            </li>
          ))}
        </ul>
      </Panel>

      {/* --------------------- beam and optical recovery --------------------- */}
      <Panel
        title="Beam and Optical Recovery"
        subtitle={`${recoveryHeader.opticalLink} · recovery threshold ${opticalRecovery.recoveryThreshold}`}
        action={
          <div className="flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => { setBeamRunning(true); setBeamIdx(0); setBeamResult(null); }} active={beamRunning}>Start beam reacquisition simulation</ToolbarButton>
            <ToolbarButton onClick={() => setBeamRunning(false)}>Pause</ToolbarButton>
            <ToolbarButton onClick={() => { setBeamIdx(0); setBeamRunning(true); setBeamResult(null); }}>Retry</ToolbarButton>
            <ToolbarButton onClick={() => { setBeamIdx(null); setBeamRunning(false); setBeamResult(null); }}>Cancel</ToolbarButton>
            <ToolbarButton onClick={() => applyInjection("inj-beam")}>Simulate failed acquisition</ToolbarButton>
            <ToolbarButton onClick={() => { setBeamIdx(beamSequence.length - 1); setBeamResult("Succeeded"); setBeamRunning(false); }}>Simulate successful acquisition</ToolbarButton>
            <ToolbarButton onClick={triggerRollback}>Trigger rollback</ToolbarButton>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-5">
          <Field label="Terminal A beam state" value={opticalRecovery.terminalA} />
          <Field label="Terminal B beam state" value={opticalRecovery.terminalB} />
          <Field label="Beam lock" value={opticalRecovery.beamLock} />
          <Field label="Reacquisition attempts" value={String(beamIdx === null ? opticalRecovery.reacquisitionAttempts : 1)} />
          <Field label="Reacquisition duration" value={beamIdx === null ? opticalRecovery.reacquisitionDuration : `${beamIdx * 12}s simulated`} />
          <Field label="Received optical power" value={opticalRecovery.receivedPower} />
          <Field label="Link margin" value={opticalRecovery.linkMargin} />
          <Field label="Optical attenuation" value={opticalRecovery.attenuation} />
          <Field label="Pointing error" value={opticalRecovery.pointingError} />
          <Field label="Tracking correction rate" value={opticalRecovery.trackingCorrection} />
          <Field label="Alignment confidence" value={opticalRecovery.alignmentConfidence} />
          <Field label="Weather recovery state" value={opticalRecovery.weatherRecovery} />
          <Field label="Recovery threshold" value={opticalRecovery.recoveryThreshold} />
          <Field label="Sustained recovery timer" value={stage && stage.n >= 10 ? "15m 00s of 15m 00s" : opticalRecovery.sustainedTimer} />
        </div>

        {/* margin trend */}
        <div className="mt-3">
          <svg viewBox="0 0 100 30" className="h-[150px] w-full" role="img" aria-label="Link margin and attenuation trend during recovery">
            <line x1="0" y1={30 - ((8.5 - 6) / 4) * 30} x2="100" y2={30 - ((8.5 - 6) / 4) * 30} stroke="#f59e0b" strokeWidth="0.3" strokeDasharray="1 1" />
            <polyline
              fill="none" stroke="#059669" strokeWidth="0.8"
              points={marginSeries.map((p, i) => `${(i / (marginSeries.length - 1)) * 100},${30 - ((p.margin - 6) / 4) * 30}`).join(" ")}
            />
            <polyline
              fill="none" stroke="#0284c7" strokeWidth="0.6" strokeDasharray="1.5 1"
              points={marginSeries.map((p, i) => `${(i / (marginSeries.length - 1)) * 100},${30 - ((10 - p.attenuation) / 4) * 30}`).join(" ")}
            />
          </svg>
          <ul className="flex flex-wrap gap-3 text-[10.5px] text-slate-600">
            <li className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-emerald-600" aria-hidden />Link margin</li>
            <li className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-sky-600" aria-hidden />Attenuation, inverted</li>
            <li className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-amber-500" aria-hidden />Recovery threshold 8.5 dB</li>
          </ul>
        </div>

        <ul className="mt-2 flex flex-wrap gap-1">
          {opticalRecovery.notes.map((n) => <li key={n}><Chip className={toneChip("neutral")}>{n}</Chip></li>)}
        </ul>

        <div className="mt-3 rounded-lg border border-slate-200 p-2">
          <h3 className="text-[11.5px] font-semibold text-slate-800">{beamExecution.title} · {beamExecution.id}</h3>
          <p className="text-[11px] text-slate-500">Beam reacquisition sequence for the {beamExecution.customer} recovery.</p>
          <ol className="mt-2 space-y-1">
            {beamSequence.map((b) => {
              const status = beamResult === "Failed" && b.n === 6 ? "Failed"
                : beamIdx === null ? "Not started"
                  : b.n < (beamIdx + 1) ? "Passed" : b.n === beamIdx + 1 ? (beamRunning ? "Running" : "Waiting") : "Not started";
              return (
                <li key={b.n}>
                  <button type="button" onClick={() => setDrawer({ title: `Beam stage ${b.n} · ${b.name}`, body: b.detail, rows: [["Status", status], ["Execution", beamExecution.id], ["Customer", beamExecution.customer]] })}
                    className="flex w-full items-center gap-2 rounded-md border border-slate-200 p-1.5 text-left text-[11.5px] hover:bg-slate-50">
                    <span className="w-5 text-[10px] text-slate-400">{b.n}</span>
                    <span className="flex-1 text-slate-800">{b.name}</span>
                    <Chip className={statusChip(status)}>{status}</Chip>
                  </button>
                </li>
              );
            })}
          </ol>
          {beamResult && <p className="mt-2 text-[11.5px] text-slate-600">Simulated beam reacquisition {beamResult.toLowerCase()}.</p>}
        </div>
      </Panel>

      {/* --------------------------- diagnostics ----------------------------- */}
      <Panel
        title="Remote Diagnostics"
        subtitle="Terminal, optical, network, environmental and customer service diagnostics."
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select label="Diagnostic group" value={diagGroup} options={[ALL, ...DIAGNOSTIC_GROUPS]} onChange={setDiagGroup} />
            <ToolbarButton onClick={() => { setDiagRuns(Object.fromEntries(diagnostics.map((x) => [x.id, x.status]))); addEvent("All diagnostics run", "Recovery Orchestrator Agent", `${diagnostics.length} diagnostics executed`, "Diagnostic"); }}>Run all diagnostics</ToolbarButton>
            <ToolbarButton onClick={() => diagId && setDiagRuns((p) => ({ ...p, [diagId]: "Passed" }))}>Run selected diagnostic</ToolbarButton>
            <ToolbarButton onClick={() => setDiagCompare((v) => (v === "baseline" ? "none" : "baseline"))} active={diagCompare === "baseline"}>Compare baseline</ToolbarButton>
            <ToolbarButton onClick={() => setDiagCompare((v) => (v === "terminals" ? "none" : "terminals"))} active={diagCompare === "terminals"}>Compare terminals</ToolbarButton>
            <ToolbarButton onClick={() => diagId && addEvent("Diagnostic attached to evidence", "Evidence Curator", `Diagnostic ${diagId} attached`, "Evidence")}>Attach result to evidence</ToolbarButton>
            <ToolbarButton onClick={() => setDiagRuns((p) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v === "Failed" ? "Passed" : v])))}>Retry failed diagnostic</ToolbarButton>
            <ToolbarButton onClick={() => { setHumanControl(true); addEvent("Human review requested on diagnostics", owner, "Diagnostics escalated for human review", "Human decision"); }}>Request human review</ToolbarButton>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-[11.5px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><Th>Group</Th><Th>Diagnostic</Th><Th>Status</Th><Th>Current value</Th><Th>Expected range</Th><Th>Last run</Th><Th>Duration</Th><Th>Owner</Th><Th>Evidence</Th><Th>Recommended follow-up</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDiagnostics.map((x) => (
                <tr key={x.id} className={cn("cursor-pointer hover:bg-slate-50", diagId === x.id && "bg-indigo-50/40")} onClick={() => setDiagId(x.id)}>
                  <Td>{x.group}</Td>
                  <Td>
                    <button type="button" aria-label={`Select diagnostic ${x.name}`} className="font-medium text-indigo-700 hover:underline">{x.name}</button>
                  </Td>
                  <Td><Chip className={statusChip(x.status)}>{x.status}</Chip></Td>
                  <Td>{x.value}</Td><Td>{x.expected}</Td><Td>{x.lastRun}</Td><Td>{x.duration}</Td><Td>{x.owner}</Td>
                  <Td><button type="button" className="text-indigo-700 hover:underline" onClick={(e) => { e.stopPropagation(); setEvId(x.evidence); }}>{x.evidence}</button></Td>
                  <Td>{x.followUp}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {diagCompare !== "none" && (
          <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-600">
            {diagCompare === "baseline"
              ? "Compared against the pre-action baseline: link margin improved by 2.3 dB, attenuation reduced by 2.9 dB, customer capacity unchanged at 8.6 Gbps."
              : "Terminal A and Terminal B report matched firmware 4.8.1, comparable temperature and identical beam lock state. No asymmetry detected."}
          </p>
        )}
      </Panel>

      {/* -------------------------- validation ------------------------------- */}
      <Panel
        title="Recovery Validation"
        subtitle={`${validationPassed} of ${validationList.length} tests passed. Blocking tests must pass before each traffic increment.`}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select label="Validation group" value={valGroup} options={[ALL, ...VALIDATION_GROUPS]} onChange={setValGroup} />
            <ToolbarButton onClick={() => { setValOverrides(Object.fromEntries(validationTests.map((t) => [t.id, "Passed" as ValidationStatus]))); addEvent("All validation tests run", "Validation Agent", "Validation suite executed", "Validation"); }}>Run all validation tests</ToolbarButton>
            <ToolbarButton onClick={() => valId && setValOverrides((p) => ({ ...p, [valId]: "Passed" }))}>Run selected test</ToolbarButton>
            <ToolbarButton onClick={() => setValOverrides((p) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v === "Failed" ? "Running" : v])))}>Retry failed test</ToolbarButton>
            <ToolbarButton onClick={() => { if (!valId) return; setValOverrides((p) => ({ ...p, [valId]: "Passed" })); addEvent("Validation overridden with human note", owner, `Test ${valId} accepted by the execution owner`, "Human decision"); }}>Override test with human note</ToolbarButton>
            <ToolbarButton onClick={() => valId && setValOverrides((p) => ({ ...p, [valId]: "Not applicable" }))}>Mark not applicable</ToolbarButton>
            <ToolbarButton onClick={() => valId && addEvent("Evidence attached to validation", "Evidence Curator", `Evidence attached to ${valId}`, "Evidence")}>Attach evidence</ToolbarButton>
            <ToolbarButton onClick={triggerRollback}>Trigger rollback on failure</ToolbarButton>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-[11.5px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><Th>Group</Th><Th>Validation</Th><Th>Status</Th><Th>Current value</Th><Th>Required value</Th><Th>Owner</Th><Th>Agent</Th><Th>Evidence</Th><Th>Time tested</Th><Th>Enforcement</Th><Th>Failure response</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredValidation.map((t) => (
                <tr key={t.id} className={cn("cursor-pointer hover:bg-slate-50", valId === t.id && "bg-indigo-50/40")} onClick={() => setValId(t.id)}>
                  <Td>{t.group}</Td>
                  <Td><button type="button" aria-label={`Select validation ${t.name}`} className="font-medium text-indigo-700 hover:underline">{t.name}</button></Td>
                  <Td><Chip className={statusChip(t.status)}>{t.status}</Chip></Td>
                  <Td>{t.current}</Td><Td>{t.required}</Td><Td>{t.owner}</Td><Td>{t.agent}</Td>
                  <Td><button type="button" className="text-indigo-700 hover:underline" onClick={(e) => { e.stopPropagation(); setEvId(t.evidence); }}>{t.evidence}</button></Td>
                  <Td>{t.testedAt}</Td>
                  <Td>{t.blocking ? "Blocking" : "Advisory"}</Td>
                  <Td>{t.failureResponse}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* -------------------------- guardrail monitor ------------------------ */}
      <Panel title="Live Guardrail Monitor" subtitle="Policies and guardrails approved on the Human Approval and Action Center, evaluated live.">
        <p role="status" className={cn("rounded-md border p-2 text-[12px] font-medium", anyBlocked ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700")}>
          {anyBlocked
            ? "Execution paused. A blocking guardrail has failed and a human decision is required."
            : guardrailPassStatement}
        </p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[1200px] text-[11.5px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><Th>Rule</Th><Th>Current value</Th><Th>Required value</Th><Th>Status</Th><Th>Enforcement</Th><Th>Policy source</Th><Th>Evidence</Th><Th>Failure response</Th><Th>Inspect</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blockingGuardrails.map((g) => (
                <tr key={g.id} className={cn("hover:bg-slate-50", guardFailed === g.id && "bg-rose-50/60")}>
                  <Td className="text-slate-800">{g.rule}</Td>
                  <Td>{g.current}</Td><Td>{g.required}</Td>
                  <Td><Chip className={statusChip(g.status)}>{g.status}</Chip></Td>
                  <Td>{g.enforcement}</Td><Td>{g.source}</Td>
                  <Td><button type="button" className="text-indigo-700 hover:underline" onClick={() => setEvId(g.evidence)}>{g.evidence}</button></Td>
                  <Td>{g.failureResponse}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <button type="button" aria-label={`Inspect guardrail ${g.id}`} onClick={() => setDrawer({
                        title: g.rule, body: `${g.enforcement} guardrail from ${g.source}.`,
                        rows: [["Current value", g.current], ["Required value", g.required], ["Status", g.status], ["Evidence", g.evidence], ["Failure response", g.failureResponse], ["Affected steps", g.affectedSteps.length ? g.affectedSteps.join(", ") : "None"]],
                      })} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">Inspect</button>
                      <button type="button" aria-label={`Trigger guardrail failure ${g.id}`} onClick={() => { setGuardFailed(g.id); setPaused(true); addEvent("Guardrail failure simulated", "SLO Guardian", `${g.rule} failed. Execution paused.`, "Guardrail"); }}
                        className="rounded border border-rose-200 px-1.5 py-0.5 text-[10px] text-rose-600">Trigger failure</button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {guardFailed && (
          <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[11.5px] text-rose-800">
            <p className="font-medium">{blockingGuardrails.find((g) => g.id === guardFailed)?.rule}</p>
            <p className="mt-1">Affected steps: {(blockingGuardrails.find((g) => g.id === guardFailed)?.affectedSteps ?? []).join(", ") || "None"}. Execution is paused pending a decision.</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <ToolbarButton onClick={() => { setGuardDecision("Rollback selected"); triggerRollback(); }}>Rollback</ToolbarButton>
              <ToolbarButton onClick={() => { setGuardDecision("Human intervention selected"); setHumanControl(true); }}>Human intervention</ToolbarButton>
              <ToolbarButton onClick={() => { setGuardDecision("Temporary exception accepted"); setGuardFailed(null); setPaused(false); }}>Accept temporary exception</ToolbarButton>
            </div>
            {guardDecision && <p className="mt-1 text-[11px]">{guardDecision}.</p>}
          </div>
        )}
      </Panel>

      {/* --------------------------- rollback -------------------------------- */}
      <Panel
        title="Rollback Readiness"
        subtitle="Rollback remains ready at every stage of the recovery."
        action={
          <div className="flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => { setRollbackTested(true); addEvent("Rollback tested", "Rollback Guardian", "All 11 rollback steps validated in a dry run", "Rollback"); }} active={rollbackTested}>Test rollback</ToolbarButton>
            <ToolbarButton onClick={triggerRollback} active={rollbackStage !== null}>Trigger simulated rollback</ToolbarButton>
            <ToolbarButton onClick={() => setRollbackPaused(true)} active={rollbackPaused}>Pause rollback</ToolbarButton>
            <ToolbarButton onClick={() => { setRollbackPaused(false); setRollbackStage((s) => (s === null ? 0 : Math.min(s + 1, rollbackExecSteps.length - 1))); }}>Resume rollback</ToolbarButton>
            <ToolbarButton onClick={() => { setRollbackStage(null); setRollbackPaused(false); }}>Cancel rollback before traffic movement</ToolbarButton>
            <ToolbarButton onClick={() => { setRollbackFailed(true); addEvent("Rollback failure simulated", "Rollback Guardian", "Rollback route validation failed, readiness reduced", "Rollback"); }} active={rollbackFailed}>Simulate rollback failure</ToolbarButton>
            <ToolbarButton onClick={() => setHumanControl(true)}>Request human control</ToolbarButton>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
          <Field label="Rollback route" value={rollbackReadiness.route} />
          <Field label="Rollback trigger" value={rollbackReadiness.trigger} />
          <Field label="Rollback owner" value={rollbackReadiness.owner} />
          <Field label="Rollback execution time" value={rollbackReadiness.executionTime} />
          <Field label="Route capacity" value={rollbackReadiness.routeCapacity} />
          <Field label="Expected latency" value={rollbackReadiness.expectedLatency} />
          <Field label="Customer impact" value={rollbackReadiness.customerImpact} />
          <Field label="Validation status" value={rollbackFailed ? "Rollback validation failed" : rollbackReadiness.validationStatus} />
          <Field label="Policy status" value={rollbackReadiness.policyStatus} />
          <Field label="Evidence completeness" value={rollbackReadiness.evidenceCompleteness} />
          <Field label="Last rollback test" value={rollbackTested ? "Tested locally in this demonstration" : rollbackReadiness.lastTest} />
          <Field label="Rollback confidence" value={rollbackFailed ? "62 percent" : rollbackReadiness.confidence} />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div>
            <h3 className="text-[11.5px] font-semibold text-slate-800">Approved rollback triggers</h3>
            <ul className="mt-1 space-y-1 text-[11.5px] text-slate-600">
              {rollbackTriggers.map((t) => <li key={t} className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-3 w-3 text-amber-500" aria-hidden />{t}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-[11.5px] font-semibold text-slate-800">Rollback execution steps</h3>
            <ol className="mt-1 space-y-1">
              {rollbackExecSteps.map((s, i) => {
                const status = rollbackFailed && i === 3 ? "Failed"
                  : rollbackStage === null ? (rollbackTested ? "Passed" : "Not started")
                    : i < rollbackStage ? "Passed" : i === rollbackStage ? (rollbackPaused ? "Waiting" : "Running") : "Not started";
                return (
                  <li key={s.id} className="flex items-center gap-2 rounded-md border border-slate-200 p-1.5 text-[11.5px]">
                    <span className="w-5 text-[10px] text-slate-400">{s.n}</span>
                    <span className="flex-1 text-slate-800">{s.name}</span>
                    <span className="text-slate-500">{s.owner}</span>
                    <Chip className={statusChip(status)}>{status}</Chip>
                    {s.irreversibleAfter && <Chip className={toneChip("watch")}>Traffic moved</Chip>}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
        <SectionNote>Rollback is simulated locally. No route, traffic or terminal state is changed.</SectionNote>
      </Panel>

      {/* -------------------------- exceptions ------------------------------- */}
      <Panel title="Execution Exceptions" subtitle="Exception handling and failure response during governed execution.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-[11.5px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><Th>Exception</Th><Th>Severity</Th><Th>Execution step</Th><Th>Customer impact</Th><Th>Current response</Th><Th>Recommended action</Th><Th>Agent confidence</Th><Th>Human intervention</Th><Th>Rollback relationship</Th><Th>Evidence</Th><Th>Status</Th><Th>Actions</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recoveryExceptions.map((x: RecoveryException) => (
                <tr key={x.id} className={cn("hover:bg-slate-50", exceptionId === x.id && "bg-indigo-50/40", raisedExceptions.includes(x.id) && "bg-amber-50/50")}>
                  <Td>
                    <button type="button" aria-label={`Select exception ${x.title}`} onClick={() => setExceptionId(x.id)} className="font-medium text-indigo-700 hover:underline">{x.title}</button>
                  </Td>
                  <Td><Chip className={statusChip(x.severity)}>{x.severity}</Chip></Td>
                  <Td>{x.step}</Td><Td>{x.customerImpact}</Td><Td>{x.response}</Td><Td>{x.recommended}</Td>
                  <Td>{x.confidence}%</Td>
                  <Td>{x.humanRequired ? "Required" : "Not required"}</Td>
                  <Td>{x.rollbackRelation}</Td>
                  <Td><button type="button" className="text-indigo-700 hover:underline" onClick={() => setEvId(x.evidence)}>{x.evidence}</button></Td>
                  <Td><Chip className={statusChip(exceptionStatus[x.id] ?? x.status)}>{exceptionStatus[x.id] ?? x.status}</Chip></Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <button type="button" aria-label={`Retry ${x.id}`} onClick={() => setExceptionStatus((p) => ({ ...p, [x.id]: "Monitoring" }))} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px]">Retry</button>
                      <button type="button" aria-label={`Pause execution for ${x.id}`} onClick={() => setPaused(true)} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px]">Pause</button>
                      <button type="button" aria-label={`Trigger rollback for ${x.id}`} onClick={triggerRollback} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px]">Rollback</button>
                      <button type="button" aria-label={`Assign human owner for ${x.id}`} onClick={() => { setHumanControl(true); setExceptionStatus((p) => ({ ...p, [x.id]: "Contained" })); }} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px]">Assign human owner</button>
                      <button type="button" aria-label={`Request diagnostics for ${x.id}`} onClick={() => setDiagRuns((p) => ({ ...p, "dg-o-margin": "Passed" }))} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px]">Diagnostics</button>
                      <button type="button" aria-label={`Accept exception ${x.id}`} onClick={() => setExceptionStatus((p) => ({ ...p, [x.id]: "Accepted" }))} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px]">Accept</button>
                      <button type="button" aria-label={`Escalate ${x.id}`} onClick={() => { setExceptionStatus((p) => ({ ...p, [x.id]: "Open" })); addEvent("Exception escalated", owner, x.title, "Human decision"); }} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px]">Escalate</button>
                      <button type="button" aria-label={`Add note to ${x.id}`} onClick={() => addEvent("Exception note added", owner, x.title, "Human decision")} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px]">Note</button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* -------------------------- ownership -------------------------------- */}
      <Panel title="Execution Ownership" subtitle="Digital coworkers and human roles sharing execution ownership.">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {executionActors.map((a) => (
            <button key={a.id} type="button" onClick={() => { setActorId(a.id); setDrawer({
              title: a.name,
              body: a.responsibility,
              rows: [["Kind", a.kind], ["Current task", a.currentTask], ["Status", a.status], ["Current step", a.step], ["Last action", a.lastAction], ["Next action", a.nextAction], ["Evidence produced", `${a.evidenceProduced} records`], ["Decision authority", a.authority], ["Guardrail status", a.guardrail], ["Escalation state", a.escalation]],
            }); }}
              className={cn("rounded-lg border p-2.5 text-left text-[11.5px] hover:bg-slate-50", actorId === a.id ? "border-indigo-400 bg-indigo-50/40" : "border-slate-200 bg-white")}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-medium text-slate-900">
                  {a.kind === "Agent" ? <Bot className="h-3.5 w-3.5 text-indigo-600" aria-hidden /> : <User className="h-3.5 w-3.5 text-slate-500" aria-hidden />}
                  {a.name}
                </span>
                <Chip className={statusChip(a.status)}>{a.status}</Chip>
              </div>
              <p className="mt-1 text-slate-600">{a.responsibility}</p>
              <p className="mt-1 text-[11px] text-slate-500">Now: {a.currentTask}</p>
              <p className="text-[11px] text-slate-400">Next: {a.nextAction} · {a.evidenceProduced} evidence records</p>
            </button>
          ))}
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[900px] text-[11.5px]">
            <caption className="sr-only">Ownership matrix across execution, validation, rollback, communication, restoration, evidence and closure</caption>
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><Th>Actor</Th>{OWNERSHIP_MATRIX_COLUMNS.map((c) => <Th key={c}>{c}</Th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ownershipMatrix.map((r) => (
                <tr key={r.actor}>
                  <Td className="font-medium text-slate-900">{r.actor}</Td>
                  {OWNERSHIP_MATRIX_COLUMNS.map((c) => (
                    <Td key={c}><Chip className={r.cells[c] === "Accountable" ? toneChip("info") : r.cells[c] === "Responsible" ? toneChip("good") : toneChip("neutral")}>{r.cells[c]}</Chip></Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ---------------------- timeline and evidence ------------------------ */}
      <Panel
        title="Recovery Execution Timeline"
        subtitle="Live execution events with linked evidence."
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select label="Actor" value={tlActor} options={[ALL, ...new Set(events.map((e) => e.actor))]} onChange={setTlActor} />
            <Select label="Event type" value={tlType} options={[ALL, ...TIMELINE_EVENT_TYPES]} onChange={setTlType} />
            <Select label="Validation result" value={tlValidation} options={[ALL, ...new Set(events.map((e) => e.validation))]} onChange={setTlValidation} />
            <ToolbarButton onClick={() => setTlPlayback(null)} active={tlPlayback === null}>Live mode</ToolbarButton>
            <ToolbarButton onClick={() => setTlPlayback(events.length - 4)}>Pause</ToolbarButton>
            <ToolbarButton onClick={() => setTlPlayback((p) => (p === null ? 0 : Math.min(p + 1, events.length - 1)))}>Playback</ToolbarButton>
            <ToolbarButton onClick={() => setTlZoom((v) => !v)} active={tlZoom}>Zoom</ToolbarButton>
            <ToolbarButton onClick={() => setTlType("Traffic change")}>Show traffic changes</ToolbarButton>
            <ToolbarButton onClick={() => setTlType("Guardrail")}>Show guardrail events</ToolbarButton>
            <ToolbarButton onClick={() => setTlType("Rollback")}>Show rollback events</ToolbarButton>
            <ToolbarButton onClick={() => addEvent("Manual timeline note", owner, "Local reviewer note added to the execution timeline")}>Add manual note</ToolbarButton>
            <ToolbarButton onClick={() => setTlExport(`${filteredEvents.length} timeline events exported as synthetic demonstration data.`)}><Download className="h-3.5 w-3.5" aria-hidden /> Export timeline</ToolbarButton>
          </div>
        }
      >
        <ol className={cn("space-y-1.5", tlZoom && "text-[12.5px]")}>
          {filteredEvents.map((e) => (
            <li key={e.id}>
              <div className={cn("flex flex-wrap items-center gap-2 rounded-lg border p-2 text-[11.5px]", tlEventId === e.id ? "border-indigo-400 bg-indigo-50/40" : "border-slate-200")}>
                <button type="button" onClick={() => setTlEventId((p) => (p === e.id ? null : e.id))} aria-label={`Select event ${e.event}`} className="min-w-[240px] flex-1 text-left font-medium text-slate-900 hover:underline">
                  {e.event}
                </button>
                <span className="text-slate-500">{e.at}</span>
                <Chip className={toneChip("neutral")}>{e.actor}</Chip>
                <Chip className={toneChip("info")}>{e.type}</Chip>
                <Chip className={statusChip(e.status)}>{e.status}</Chip>
                <span className="text-slate-500">{e.traffic}</span>
                <Chip className={statusChip(e.validation)}>{e.validation}</Chip>
                <Chip className={statusChip(e.guardrail)}>{e.guardrail}</Chip>
                <button type="button" onClick={() => setEvId(e.evidence)} className="text-indigo-700 hover:underline">{e.evidence}</button>
                <button type="button" aria-label={`Pin event ${e.event}`} onClick={() => setPinnedEvents((p) => (p.includes(e.id) ? p.filter((x) => x !== e.id) : [...p, e.id]))}
                  className={cn("rounded border px-1.5 py-0.5 text-[10px]", pinnedEvents.includes(e.id) ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500")}>Pin</button>
              </div>
              {tlEventId === e.id && (
                <div className="ml-3 mt-1 grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 md:grid-cols-3">
                  <Field label="Execution step" value={e.step} />
                  <Field label="Customer service state" value={e.serviceState} />
                  <Field label="Outcome" value={e.outcome} />
                </div>
              )}
            </li>
          ))}
        </ol>
        {pinnedEvents.length > 1 && (
          <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-600">
            Comparing {pinnedEvents.length} pinned events: {pinnedEvents.map((id) => events.find((e) => e.id === id)?.event).filter(Boolean).join(" · ")}
          </p>
        )}
        {tlExport && <p className="mt-2 text-[11px] text-slate-500">{tlExport}</p>}
      </Panel>

      <Panel
        title="Execution Evidence"
        subtitle="Every step, validation and decision is evidenced."
        action={<Select label="Evidence group" value={evGroup} options={[ALL, ...EVIDENCE_GROUPS]} onChange={setEvGroup} />}
      >
        <div className="grid gap-2 lg:grid-cols-3">
          <ul className="space-y-1 lg:col-span-1">
            {filteredEvidence.map((e) => (
              <li key={e.id}>
                <button type="button" onClick={() => setEvId(e.id)} aria-pressed={evId === e.id}
                  className={cn("w-full rounded-md border p-2 text-left text-[11.5px] hover:bg-slate-50", evId === e.id ? "border-indigo-400 bg-indigo-50/40" : "border-slate-200")}>
                  <span className="font-medium text-slate-900">{e.title}</span>
                  <span className="block text-[11px] text-slate-500">{e.group} · {e.capturedAt}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="lg:col-span-2">
            {(() => {
              const e = executionEvidence.find((x) => x.id === evId) ?? filteredEvidence[0];
              if (!e) return <p className="text-[11.5px] text-slate-500">No evidence record selected.</p>;
              return (
                <div className="rounded-lg border border-slate-200 p-3">
                  <h3 className="text-[13px] font-semibold text-slate-900">{e.title}</h3>
                  <p className="mt-1 text-[11.5px] text-slate-600">{e.summary}</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                    <Field label="Group" value={e.group} />
                    <Field label="Source" value={e.source} />
                    <Field label="Captured" value={e.capturedAt} />
                    <Field label="Confidence" value={`${e.confidence} percent`} />
                    <Field label="Execution step" value={e.step} />
                    <Field label="Evidence identifier" value={e.id} />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </Panel>

      {/* --------------------------- outcomes -------------------------------- */}
      <Panel title="Recovery Outcomes" subtitle="Customer and SRE outcomes measured across the governed recovery.">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {recoveryOutcomes.map((o) => (
            <div key={o.id} className="rounded-lg border border-slate-200 bg-white p-2.5">
              <div className="text-[10.5px] uppercase tracking-wide text-slate-500">{o.metric}</div>
              <div className="mt-0.5 text-[16px] font-semibold text-slate-900">{o.value}</div>
              <div className="text-[10.5px] text-slate-500">{o.detail}</div>
              <Chip className={cn("mt-1", toneChip(o.tone))}>Synthetic</Chip>
            </div>
          ))}
        </div>
        <SectionNote>{outcomeDisclaimer}</SectionNote>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[900px] text-[11.5px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><Th>Dimension</Th><Th>Traditional manual recovery</Th><Th>Agent assisted recovery</Th><Th>Governed autonomous recovery</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recoveryComparison.map((r) => (
                <tr key={r.dimension}>
                  <Td className="font-medium text-slate-900">{r.dimension}</Td>
                  <Td>{r.manual}</Td><Td>{r.assisted}</Td>
                  <Td className="text-emerald-700">{r.governed}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* --------------------------- learning -------------------------------- */}
      <Panel title="Recovery Learning" subtitle="What the Agentic SRE NOC retains from this recovery.">
        <ul className="grid gap-1 text-[11.5px] text-slate-700 md:grid-cols-2">
          {recoveryLearning.map((l) => (
            <li key={l} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600" aria-hidden />{l}</li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {learningActions.map((a) => (
            <ToolbarButton key={a} onClick={() => setLearningLog((p) => [...p, `${a} — recorded in local demonstration state.`])}>{a}</ToolbarButton>
          ))}
        </div>
        {learningLog.length > 0 && (
          <ul className="mt-2 space-y-1 text-[11px] text-slate-500">{learningLog.map((l, i) => <li key={`${l}-${i}`}>· {l}</li>)}</ul>
        )}
        <SectionNote>No production knowledge system is modified. Learning is recorded locally for the demonstration only.</SectionNote>
      </Panel>

      {/* --------------------------- scenario -------------------------------- */}
      <Panel
        title="Run Controlled Recovery Scenario"
        subtitle="A deterministic 22 stage walkthrough from approved action to recorded outcome."
        action={
          <div className="flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => { setStageIdx(0); setRunning(true); }} active={running}><Play className="h-3.5 w-3.5" aria-hidden /> Start</ToolbarButton>
            <ToolbarButton onClick={() => setRunning(false)}><Pause className="h-3.5 w-3.5" aria-hidden /> Pause</ToolbarButton>
            <ToolbarButton onClick={() => setRunning(true)}>Continue</ToolbarButton>
            <ToolbarButton onClick={() => { setStageIdx(null); setRunning(false); setInjections([]); }}><RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset</ToolbarButton>
            <ToolbarButton onClick={() => setStageIdx((i) => (i === null ? 0 : Math.min(i + 1, recoveryScenario.length - 1)))}><SkipForward className="h-3.5 w-3.5" aria-hidden /> Skip to next stage</ToolbarButton>
            <ToolbarButton onClick={() => setShowComparison((v) => !v)} active={showComparison}>Compare manual and governed recovery</ToolbarButton>
          </div>
        }
      >
        <div className="flex flex-wrap gap-1.5">
          {scenarioInjections.map((i) => (
            <ToolbarButton key={i.id} onClick={() => applyInjection(i.id)} active={injections.includes(i.id)}>
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {i.label}
            </ToolbarButton>
          ))}
          <ToolbarButton onClick={() => setHumanControl(true)} active={humanControl}><User className="h-3.5 w-3.5" aria-hidden /> Request human control</ToolbarButton>
          <ToolbarButton onClick={() => setPaused(true)} active={paused}>Pause execution</ToolbarButton>
          <ToolbarButton onClick={() => setPaused(false)}>Resume execution</ToolbarButton>
          <ToolbarButton onClick={triggerRollback}>Trigger rollback</ToolbarButton>
        </div>

        <div className="mt-3">
          <Meter value={stage ? stage.progress : 0} />
          <ol className="mt-2 space-y-1">
            {recoveryScenario.map((s, i) => (
              <li key={s.n}>
                <button type="button" onClick={() => setStageIdx(i)}
                  className={cn("flex w-full flex-wrap items-center gap-2 rounded-md border p-1.5 text-left text-[11.5px] hover:bg-slate-50",
                    stageIdx === i ? "border-indigo-400 bg-indigo-50/50" : stageIdx !== null && i < stageIdx ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200")}>
                  <span className="w-5 text-[10px] text-slate-400">{s.n}</span>
                  <span className="min-w-[260px] flex-1 font-medium text-slate-900">{s.label}</span>
                  <Chip className={statusChip(s.state)}>{s.state}</Chip>
                  <span className="text-slate-500">{s.optical} / {s.fallback} Gbps</span>
                  <Chip className={statusChip(s.guardrail)}>{s.guardrail}</Chip>
                  <span className="text-slate-400">{s.progress}%</span>
                </button>
              </li>
            ))}
          </ol>
          {stage && <p className="mt-2 rounded-md border border-indigo-100 bg-indigo-50/50 p-2 text-[11.5px] text-slate-700">{stage.narrative}</p>}
          {activeInjection && (
            <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800" role="status">
              <p className="font-medium">{activeInjection.label}</p>
              <p>{activeInjection.narrative}</p>
              <p className="mt-1">Recommended: {activeInjection.recommended}</p>
            </div>
          )}
        </div>

        {showComparison && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[800px] text-[11.5px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr><Th>Dimension</Th><Th>Traditional manual recovery</Th><Th>Governed autonomous recovery</Th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recoveryComparison.map((r) => (
                  <tr key={`cmp-${r.dimension}`}><Td className="font-medium text-slate-900">{r.dimension}</Td><Td>{r.manual}</Td><Td className="text-emerald-700">{r.governed}</Td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <SectionNote>The scenario is local deterministic state. No shared scenario engine is used and no real action is executed.</SectionNote>
      </Panel>

      {/* ------------------ controlled vs uncontrolled ----------------------- */}
      <Panel title="Controlled Recovery Versus Uncontrolled Automation" subtitle="Why governed execution differs from trigger driven automation.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-[11.5px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><Th>Dimension</Th><Th>Uncontrolled automation</Th><Th>Controlled agentic recovery</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {controlComparison.map((r) => (
                <tr key={r.dimension}>
                  <Td className="font-medium text-slate-900">{r.dimension}</Td>
                  <Td className="text-slate-600">{r.uncontrolled}</Td>
                  <Td className="text-emerald-700">{r.controlled}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" aria-hidden /> Step by step observable execution</span>
          <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" aria-hidden /> Continuous customer validation</span>
          <span className="flex items-center gap-1"><Undo2 className="h-3.5 w-3.5" aria-hidden /> Rollback ready at every stage</span>
          <span className="flex items-center gap-1"><RadioTower className="h-3.5 w-3.5" aria-hidden /> Fallback transport protecting priority traffic</span>
          <span className="flex items-center gap-1"><Waypoints className="h-3.5 w-3.5" aria-hidden /> Complete execution evidence</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden /> Outcome and learning recorded</span>
          <span className="flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" aria-hidden /> Deterministic and repeatable</span>
        </div>
      </Panel>

      {/* ---------------------------- drawer --------------------------------- */}
      <Sheet open={drawer !== null} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          {drawer && (
            <div className="space-y-3">
              <SheetTitle className="text-[14px] font-semibold text-slate-900">{drawer.title}</SheetTitle>
              <SheetDescription className="text-[12px] text-slate-600">
                {drawer.body ?? "Synthetic demonstration detail for the selected execution object."}
              </SheetDescription>
              <dl className="grid gap-2">
                {drawer.rows.map(([k, val]) => (
                  <div key={k} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                    <dt className="text-[10px] uppercase tracking-wide text-slate-500">{k}</dt>
                    <dd className="text-[12px] text-slate-900">{val}</dd>
                  </div>
                ))}
              </dl>
              {drawer.actions && (
                <div className="flex flex-wrap gap-1.5">
                  {drawer.actions.map((a) => (
                    <ToolbarButton key={a.label} onClick={a.run}>{a.label}</ToolbarButton>
                  ))}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
