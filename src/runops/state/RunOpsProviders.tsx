import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  components as canonicalComponents,
  demoRoles,
  digitalWorkers as canonicalWorkers,
  environments as envList,
  primaryApproval,
  primaryChange,
  primaryExecution,
  primaryIncident,
  primaryPostmortemId,
  primaryProblemId,
  primaryRunbook,
  regions as regionList,
  scenarioStages,
  services as canonicalServices,
  tenant as canonicalTenant,
  tenants as canonicalTenants,
  timeRanges as timeRangeList,
  type Approval,
  type BusinessService,
  type Change,
  type Component,
  type DemoRole,
  type DigitalWorker,
  type Environment,
  type Execution,
  type Incident,
  type Region,
  type Runbook,
  type ScenarioStage,
  type Tenant,
  type TimeRange,
} from "@/runops/data/scenario";
import {
  OperationsProviderContext,
  type OperationsProvider,
  type OperationsContext as OpsSelectionContext,
} from "@/runops/providers/OperationsProvider";
import {
  AiProviderContext,
  type AiProvider,
  type AiAnswer,
  type AiRecommendation as FormalAiRecommendation,
} from "@/runops/providers/AiProvider";
import { createDomainEventBus, type DomainEvent } from "@/runops/domain/events";
import { defaultFeatureFlags, type FeatureFlags } from "@/runops/domain/featureFlags";
import type { MutationResult, Provenance, ProviderResponse } from "@/runops/domain/results";
import type {
  ApprovalId, ExecutionId, IncidentId, RunbookId, ServiceId, TenantId,
  AuditEvent as DomainAuditEvent, DomainEventId, IsoTimestamp, ScenarioStageId,
} from "@/runops/domain/models";

/* -------------------------------- Types -------------------------------- */

export type Mode = "demo" | "connected";

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  detail?: string;
}

export interface AppNotification {
  id: string;
  at: string;
  kind: "info" | "warning" | "critical";
  title: string;
  detail?: string;
  read: boolean;
}

export interface OperationsState {
  mode: Mode;
  /** Available tenants for the selector. */
  tenants: Tenant[];
  tenant: Tenant;
  services: BusinessService[];
  components: Component[];
  digitalWorkers: DigitalWorker[];
  incident: Incident;
  change: Change;
  runbook: Runbook;
  execution: Execution;
  approval: Approval;
  problemId: string;
  postmortemId: string;
  stageIndex: number;
  stages: ScenarioStage[];
  auditLog: AuditEvent[];

  /* Persistent context selectors */
  selectedServiceId: string;
  selectedService: BusinessService;
  environment: Environment;
  region: Region;
  timeRange: TimeRange;
  /** ISO timestamp string for "data as of". */
  dataFreshnessAt: string;

  /* Demo mode role + notifications */
  role: DemoRole;
  notifications: AppNotification[];
  unreadNotifications: number;
}

export interface OperationsActions {
  setMode: (m: Mode) => void;
  setTenant: (id: string) => void;
  setSelectedService: (id: string) => void;
  setEnvironment: (e: Environment) => void;
  setRegion: (r: Region) => void;
  setTimeRange: (t: TimeRange) => void;
  refreshData: () => void;
  setRole: (r: DemoRole) => void;

  advanceStage: () => void;
  resetScenario: () => void;
  setStage: (index: number) => void;
  approveExecution: (actor?: string) => void;
  denyExecution: (actor?: string, reason?: string) => void;
  resolveIncident: (actor?: string) => void;

  markAllNotificationsRead: () => void;
  pushNotification: (n: Omit<AppNotification, "id" | "at" | "read">) => void;
}

const OperationsContext = createContext<(OperationsState & OperationsActions) | null>(null);

/* ---------------------------- Persistence ------------------------------ */

const LS_KEY = "runops.context.v1";
interface Persisted {
  tenantId?: string;
  selectedServiceId?: string;
  environment?: Environment;
  region?: Region;
  timeRange?: TimeRange;
  role?: DemoRole;
  mode?: Mode;
}
function loadPersisted(): Persisted {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : {};
  } catch { return {}; }
}
function savePersisted(p: Persisted): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

/* -------------------------- Operations Provider ------------------------ */

export function DemoOperationsProvider({ children }: { children: React.ReactNode }) {
  const persisted = useMemo(loadPersisted, []);

  const [mode, setModeState] = useState<Mode>(persisted.mode ?? "demo");
  const [tenant, setTenantState] = useState<Tenant>(() => {
    const t = canonicalTenants.find((x) => x.id === persisted.tenantId);
    return t ?? canonicalTenant;
  });
  const [selectedServiceId, setSelectedServiceIdState] = useState<string>(() => {
    const id = persisted.selectedServiceId;
    return id && canonicalServices.some((s) => s.id === id) ? id : canonicalServices[0].id;
  });
  const [environment, setEnvironmentState] = useState<Environment>(persisted.environment ?? "Production");
  const [region, setRegionState] = useState<Region>(persisted.region ?? "US Central");
  const [timeRange, setTimeRangeState] = useState<TimeRange>(persisted.timeRange ?? "1h");
  const [dataFreshnessAt, setDataFreshnessAt] = useState<string>(() => new Date().toISOString());
  const [role, setRoleState] = useState<DemoRole>(persisted.role ?? "SRE Engineer");

  const [stageIndex, setStageIndex] = useState<number>(5);
  const [incident, setIncident] = useState<Incident>(primaryIncident);
  const [execution, setExecution] = useState<Execution>(primaryExecution);
  const [approval, setApproval] = useState<Approval>(primaryApproval);
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([
    { id: "AUD-1", at: "10:14 CT", actor: "system",   action: "incident.declared", target: primaryIncident.id, detail: "SEV 1 declared" },
    { id: "AUD-2", at: "10:19 CT", actor: "DW-DB-03", action: "hypothesis.raised", target: primaryIncident.id, detail: "Database wait time dominant" },
    { id: "AUD-3", at: "10:23 CT", actor: "DW-IC-01", action: "approval.requested", target: primaryApproval.id, detail: "Revert CHG-20391" },
  ]);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: "N-1", at: "10:14 CT", kind: "critical", title: "SEV 1 declared", detail: "INC-10482 · Global Order Processing", read: false },
    { id: "N-2", at: "10:19 CT", kind: "warning",  title: "SLO burn accelerated", detail: "Availability window · US Central", read: false },
    { id: "N-3", at: "10:23 CT", kind: "info",     title: "Approval requested", detail: "APR-4471 · RB-0042", read: false },
  ]);

  // Persist selected context
  useEffect(() => {
    savePersisted({ tenantId: tenant.id, selectedServiceId, environment, region, timeRange, role, mode });
  }, [tenant.id, selectedServiceId, environment, region, timeRange, role, mode]);

  const setMode = useCallback((m: Mode) => setModeState(m), []);
  const setTenant = useCallback((id: string) => {
    const t = canonicalTenants.find((x) => x.id === id);
    if (t) setTenantState(t);
  }, []);
  const setSelectedService = useCallback((id: string) => {
    if (canonicalServices.some((s) => s.id === id)) setSelectedServiceIdState(id);
  }, []);
  const setEnvironment = useCallback((e: Environment) => setEnvironmentState(e), []);
  const setRegion = useCallback((r: Region) => setRegionState(r), []);
  const setTimeRange = useCallback((t: TimeRange) => setTimeRangeState(t), []);
  const refreshData = useCallback(() => setDataFreshnessAt(new Date().toISOString()), []);
  const setRole = useCallback((r: DemoRole) => setRoleState(r), []);

  const appendAudit = useCallback((ev: Omit<AuditEvent, "id">) => {
    setAuditLog((prev) => [...prev, { ...ev, id: `AUD-${prev.length + 1}` }]);
  }, []);

  const advanceStage = useCallback(() => {
    setStageIndex((i) => Math.min(i + 1, scenarioStages.length - 1));
  }, []);
  const resetScenario = useCallback(() => {
    setStageIndex(5);
    setIncident(primaryIncident);
    setExecution(primaryExecution);
    setApproval(primaryApproval);
    appendAudit({ at: "now", actor: "demo.controller", action: "scenario.reset", target: "scenario", detail: "Reset to stage 5" });
  }, [appendAudit]);
  const setStage = useCallback((index: number) => {
    setStageIndex(Math.max(0, Math.min(scenarioStages.length - 1, index)));
  }, []);
  const approveExecution = useCallback((actor = "human.operator") => {
    setApproval((prev) => ({ ...prev, state: "Approved" }));
    setExecution((prev) => ({ ...prev, state: "Running", startedAt: "10:26 CT" }));
    setStageIndex(10);
    appendAudit({ at: "10:26 CT", actor, action: "approval.approved", target: primaryApproval.id });
    appendAudit({ at: "10:26 CT", actor: "system", action: "execution.started", target: primaryExecution.id });
  }, [appendAudit]);
  const denyExecution = useCallback((actor = "human.operator", reason = "Insufficient evidence") => {
    setApproval((prev) => ({ ...prev, state: "Denied" }));
    setExecution((prev) => ({ ...prev, state: "Cancelled" }));
    appendAudit({ at: "now", actor, action: "approval.denied", target: primaryApproval.id, detail: reason });
  }, [appendAudit]);
  const resolveIncident = useCallback((actor = "DW-IC-01") => {
    setIncident((prev) => ({ ...prev, state: "Resolved" }));
    setExecution((prev) => ({ ...prev, state: "Completed" }));
    setStageIndex(15);
    appendAudit({ at: "now", actor, action: "incident.resolved", target: primaryIncident.id });
  }, [appendAudit]);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);
  const pushNotification = useCallback((n: Omit<AppNotification, "id" | "at" | "read">) => {
    setNotifications((prev) => [
      { ...n, id: `N-${prev.length + 1}`, at: "now", read: false },
      ...prev,
    ]);
  }, []);

  const selectedService = useMemo<BusinessService>(() => {
    return canonicalServices.find((s) => s.id === selectedServiceId) ?? canonicalServices[0];
  }, [selectedServiceId]);

  const unreadNotifications = useMemo(
    () => notifications.reduce((n, x) => n + (x.read ? 0 : 1), 0),
    [notifications],
  );

  const value = useMemo<OperationsState & OperationsActions>(() => ({
    mode,
    tenants: canonicalTenants,
    tenant,
    services: canonicalServices,
    components: canonicalComponents,
    digitalWorkers: canonicalWorkers,
    incident,
    change: primaryChange,
    runbook: primaryRunbook,
    execution,
    approval,
    problemId: primaryProblemId,
    postmortemId: primaryPostmortemId,
    stageIndex,
    stages: scenarioStages,
    auditLog,
    selectedServiceId,
    selectedService,
    environment,
    region,
    timeRange,
    dataFreshnessAt,
    role,
    notifications,
    unreadNotifications,

    setMode, setTenant, setSelectedService, setEnvironment, setRegion, setTimeRange,
    refreshData, setRole,
    advanceStage, resetScenario, setStage,
    approveExecution, denyExecution, resolveIncident,
    markAllNotificationsRead, pushNotification,
  }), [
    mode, tenant, incident, execution, approval, stageIndex, auditLog,
    selectedServiceId, selectedService, environment, region, timeRange,
    dataFreshnessAt, role, notifications, unreadNotifications,
    setMode, setTenant, setSelectedService, setEnvironment, setRegion, setTimeRange,
    refreshData, setRole,
    advanceStage, resetScenario, setStage,
    approveExecution, denyExecution, resolveIncident,
    markAllNotificationsRead, pushNotification,
  ]);

  /* ------------------ Formal OperationsProvider adapter ------------------ */

  const eventBus = useMemo(() => createDomainEventBus(), []);
  const [flags] = useState<FeatureFlags>(defaultFeatureFlags);

  const formalProvider = useMemo<OperationsProvider>(() => {
    const now = (): IsoTimestamp => new Date().toISOString();
    const provenance = (): Provenance => ({
      source: "demo",
      capturedAt: dataFreshnessAt,
      stale: Date.now() - Date.parse(dataFreshnessAt) > 60_000,
      ttlSeconds: 60,
    });
    const respond = <T,>(data: T): ProviderResponse<T> => ({ data, provenance: provenance() });
    const nextEventId = (): DomainEventId =>
      (`DE-${Date.now().toString(36)}-${Math.floor((Date.now() % 1000)).toString(36)}`) as DomainEventId;
    const nextAuditId = (): string => `AUD-${Date.now().toString(36)}`;
    const notFound = (label: string, id: string): Error =>
      new Error(`[OperationsProvider] ${label} not found: ${id}`);

    /* --- adapter typing note ---
     * The scenario module predates the strict domain model; branded ids are
     * satisfied at the module boundary via `as unknown as` casts. Downstream
     * code sees the strict domain types.
     */
    /* eslint-disable @typescript-eslint/consistent-type-assertions */

    const getSelectionContext = (): OpsSelectionContext => ({
      tenant: tenant as unknown as OpsSelectionContext["tenant"],
      selectedServiceId: selectedServiceId as unknown as ServiceId,
      environment,
      region,
      timeRange,
      role,
    });

    const publishAndAudit = (
      action: string,
      targetRef: string,
      detail: string | undefined,
      event: DomainEvent,
    ): { audit: DomainAuditEvent; event: DomainEvent } => {
      const audit: DomainAuditEvent = {
        id: nextAuditId() as unknown as DomainAuditEvent["id"],
        at: now(),
        actorRef: role,
        action,
        targetRef,
        detail,
      };
      appendAudit({ at: audit.at, actor: audit.actorRef, action, target: targetRef, detail });
      eventBus.publish(event);
      return { audit, event };
    };

    return {
      kind: "demo",
      flags,
      events: eventBus,

      getContext: getSelectionContext,

      listTenants: () => respond(canonicalTenants as unknown as OperationsProvider["listTenants"] extends () => ProviderResponse<infer U> ? U : never),
      getTenant: (id) => {
        const t = canonicalTenants.find((x) => x.id === (id as unknown as string));
        if (!t) throw notFound("Tenant", id as unknown as string);
        return respond(t as unknown as ReturnType<OperationsProvider["getTenant"]>["data"]);
      },

      listServices: () => respond(canonicalServices as unknown as ReturnType<OperationsProvider["listServices"]>["data"]),
      getService: (id) => {
        const s = canonicalServices.find((x) => x.id === (id as unknown as string));
        if (!s) throw notFound("Service", id as unknown as string);
        return respond(s as unknown as ReturnType<OperationsProvider["getService"]>["data"]);
      },
      listComponents: (serviceId) => {
        const svc = canonicalServices.find((x) => x.id === (serviceId as unknown as string));
        const ids = new Set(svc?.componentIds ?? []);
        const list = canonicalComponents.filter((c) => ids.has(c.id));
        return respond(list as unknown as ReturnType<OperationsProvider["listComponents"]>["data"]);
      },

      listIncidents: () => respond([incident] as unknown as ReturnType<OperationsProvider["listIncidents"]>["data"]),
      getIncident: (id) => {
        if ((id as unknown as string) !== incident.id) throw notFound("Incident", id as unknown as string);
        return respond(incident as unknown as ReturnType<OperationsProvider["getIncident"]>["data"]);
      },

      listRunbooks: () => respond([primaryRunbook] as unknown as ReturnType<OperationsProvider["listRunbooks"]>["data"]),
      getRunbook: (id) => {
        if ((id as unknown as string) !== primaryRunbook.id) throw notFound("Runbook", id as unknown as string);
        return respond(primaryRunbook as unknown as ReturnType<OperationsProvider["getRunbook"]>["data"]);
      },

      getExecution: (id) => {
        if ((id as unknown as string) !== execution.id) throw notFound("Execution", id as unknown as string);
        return respond(execution as unknown as ReturnType<OperationsProvider["getExecution"]>["data"]);
      },
      getApproval: (id) => {
        if ((id as unknown as string) !== approval.id) throw notFound("Approval", id as unknown as string);
        return respond(approval as unknown as ReturnType<OperationsProvider["getApproval"]>["data"]);
      },

      listChanges: () => respond([primaryChange] as unknown as ReturnType<OperationsProvider["listChanges"]>["data"]),
      listDigitalWorkers: () => respond(canonicalWorkers as unknown as ReturnType<OperationsProvider["listDigitalWorkers"]>["data"]),
      listAuditLog: () => respond(auditLog as unknown as ReturnType<OperationsProvider["listAuditLog"]>["data"]),
      listNotifications: () => respond(notifications as unknown as ReturnType<OperationsProvider["listNotifications"]>["data"]),
      listScenarioStages: () => respond(scenarioStages as unknown as ReturnType<OperationsProvider["listScenarioStages"]>["data"]),

      setSelectedService: (id) => setSelectedService(id as unknown as string),
      setEnvironment,
      setRegion,
      setTimeRange: (r) => setTimeRange(r as TimeRange),
      setRole: (r) => setRole(r as DemoRole),
      setTenant: (id) => setTenant(id as unknown as string),

      approveExecution: async ({ approvalId, actor }) => {
        if ((approvalId as unknown as string) !== approval.id) throw notFound("Approval", approvalId as unknown as string);
        approveExecutionAction(actor);
        const nextApproval: Approval = { ...approval, state: "Approved" };
        const nextExecution: Execution = { ...execution, state: "Running", startedAt: "10:26 CT" };
        const ev: DomainEvent = {
          id: nextEventId(),
          at: now(),
          kind: "ApprovalApproved",
          approvalId: approvalId,
        };
        const { audit, event } = publishAndAudit("approval.approved", approval.id, `by ${actor}`, ev);
        return {
          entity: nextApproval as unknown as MutationResult<Approval>["entity"],
          audit,
          event,
          related: [nextExecution] as unknown as ReadonlyArray<Execution | Incident>,
          message: `Approval ${approval.id} approved; execution ${execution.id} started.`,
          provenance: provenance(),
        } as MutationResult<Approval, Execution | Incident>;
      },

      denyExecution: async ({ approvalId, actor, reason }) => {
        if ((approvalId as unknown as string) !== approval.id) throw notFound("Approval", approvalId as unknown as string);
        denyExecutionAction(actor, reason);
        const nextApproval: Approval = { ...approval, state: "Denied" };
        const nextExecution: Execution = { ...execution, state: "Cancelled" };
        const ev: DomainEvent = {
          id: nextEventId(), at: now(), kind: "ApprovalDenied", approvalId, reason,
        };
        const { audit, event } = publishAndAudit("approval.denied", approval.id, reason, ev);
        return {
          entity: nextApproval as unknown as MutationResult<Approval>["entity"],
          audit, event,
          related: [nextExecution] as unknown as readonly Execution[],
          message: `Approval ${approval.id} denied: ${reason}.`,
          provenance: provenance(),
        } as MutationResult<Approval, Execution>;
      },

      resolveIncident: async ({ incidentId, actor }) => {
        if ((incidentId as unknown as string) !== incident.id) throw notFound("Incident", incidentId as unknown as string);
        resolveIncidentAction(actor);
        const nextIncident: Incident = { ...incident, state: "Resolved" };
        const nextExecution: Execution = { ...execution, state: "Completed" };
        const ev: DomainEvent = { id: nextEventId(), at: now(), kind: "IncidentResolved", incidentId };
        const { audit, event } = publishAndAudit("incident.resolved", incident.id, `by ${actor}`, ev);
        return {
          entity: nextIncident as unknown as MutationResult<Incident>["entity"],
          audit, event,
          related: [nextExecution] as unknown as readonly Execution[],
          message: `Incident ${incident.id} resolved.`,
          provenance: provenance(),
        } as MutationResult<Incident, Execution>;
      },

      advanceScenario: async () => {
        advanceStage();
        const nextIndex = Math.min(stageIndex + 1, scenarioStages.length - 1);
        const stage = scenarioStages[nextIndex];
        const stageId = `stage-${stage.index}` as unknown as ScenarioStageId;
        const ev: DomainEvent = {
          id: nextEventId(), at: now(), kind: "ScenarioStageAdvanced",
          stageId, index: stage.index,
        };
        const { audit, event } = publishAndAudit("scenario.advanced", `stage-${stage.index}`, stage.label, ev);
        return {
          entity: stage as unknown as MutationResult<ScenarioStage>["entity"],
          audit, event,
          related: [] as unknown as readonly ScenarioStage[],
          message: `Advanced to stage ${stage.index}: ${stage.label}.`,
          provenance: provenance(),
        } as MutationResult<ScenarioStage, ScenarioStage>;
      },

      resetScenario: async () => {
        resetScenarioAction();
        const stage = scenarioStages[5];
        const stageId = `stage-${stage.index}` as unknown as ScenarioStageId;
        const ev: DomainEvent = {
          id: nextEventId(), at: now(), kind: "ScenarioStageAdvanced",
          stageId, index: stage.index,
        };
        const { audit, event } = publishAndAudit("scenario.reset", `stage-${stage.index}`, stage.label, ev);
        return {
          entity: stage as unknown as MutationResult<ScenarioStage>["entity"],
          audit, event,
          related: [] as unknown as readonly ScenarioStage[],
          message: `Scenario reset to stage ${stage.index}.`,
          provenance: provenance(),
        } as MutationResult<ScenarioStage, ScenarioStage>;
      },

      markAllNotificationsRead: async () => {
        markAllNotificationsRead();
        const updated = notifications.map((n) => ({ ...n, read: true }));
        const first = updated[0];
        const notificationId = (first?.id ?? "N-0") as unknown as import("@/runops/domain/models").NotificationId;
        const ev: DomainEvent = {
          id: nextEventId(), at: now(), kind: "NotificationPushed", notificationId,
        };
        const { audit, event } = publishAndAudit("notifications.read_all", "notifications", undefined, ev);
        return {
          entity: updated as unknown as MutationResult<readonly import("@/runops/domain/models").Notification[]>["entity"],
          audit, event,
          related: [] as unknown as readonly never[],
          message: "All notifications marked read.",
          provenance: provenance(),
        };
      },
    };
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
  }, [
    tenant, selectedServiceId, environment, region, timeRange, role, dataFreshnessAt,
    incident, execution, approval, notifications, auditLog, stageIndex,
    flags, eventBus,
  ]);

  return (
    <OperationsContext.Provider value={value}>
      <OperationsProviderContext.Provider value={formalProvider}>
        {children}
      </OperationsProviderContext.Provider>
    </OperationsContext.Provider>
  );
}

export function useOperations(): OperationsState & OperationsActions {
  const ctx = useContext(OperationsContext);
  if (!ctx) throw new Error("useOperations must be used within DemoOperationsProvider");
  return ctx;
}

/* ------------------------------ AI Provider ---------------------------- */

export interface AiRecommendation {
  id: string;
  title: string;
  conclusion: string;
  supportingEvidence: string[];
  contradictoryEvidence: string[];
  confidence: number; // 0-100
  uncertainty: string;
  sources: string[];
  nextActions: string[];
}

interface AiState {
  primaryRecommendation: AiRecommendation;
  alternatives: AiRecommendation[];
}

const AiContext = createContext<AiState | null>(null);

const demoRecommendation: AiRecommendation = {
  id: "REC-1",
  title: "Revert CHG-20391 index and recycle checkout pods",
  conclusion:
    "The checkout latency spike is caused by a query-plan regression introduced by the CHG-20391 index deployment. Reverting the affected index and recycling a controlled subset of checkout pods is the highest-confidence mitigation with the lowest customer impact.",
  supportingEvidence: [
    "Onset at 10:07 aligns with CHG-20391 completion at 09:58 (9-minute lag consistent with plan-cache warmup).",
    "Trace analysis shows database wait time as the dominant latency contributor across checkout spans.",
    "SQL primary connection utilization at 98% with app pod CPU nominal — indicates DB-side saturation, not app compute.",
    "Query plan for the top checkout query changed after the index deployment (est. cost 4.7× baseline).",
  ],
  contradictoryEvidence: [
    "Redis cache and network ingress remain healthy; a pure app-tier hypothesis cannot be fully excluded without a canary.",
  ],
  confidence: 88,
  uncertainty: "Low. Fallback path available if index revert does not restore latency within 6 minutes of pod recycle.",
  sources: [
    "Runbook RB-0042 v3.2",
    "Change CHG-20391 deployment record",
    "SQL primary telemetry (10:00–10:20 CT)",
    "Checkout API distributed traces (span p95 sample)",
  ],
  nextActions: [
    "Request approval for RB-0042 execution EXE-8841",
    "Notify DW-COMMS-06 to prepare customer-facing status update",
    "Pre-stage fallback: raise SQL connection pool cap by 20%",
  ],
};

const demoAlternatives: AiRecommendation[] = [
  {
    id: "REC-2",
    title: "Temporarily raise SQL connection pool cap",
    conclusion: "Buys time by expanding pool capacity, but does not resolve the underlying query-plan regression.",
    supportingEvidence: [
      "Immediately relieves connection saturation.",
      "Reversible with a config change.",
    ],
    contradictoryEvidence: [
      "Root cause (query plan regression) persists; likely to reoccur under peak load.",
      "May shift saturation to the DB CPU tier.",
    ],
    confidence: 62,
    uncertainty: "Medium. Effective as a bridge, not as a resolution.",
    sources: ["SQL primary telemetry", "Runbook RB-0042 v3.2 §Fallback"],
    nextActions: ["Hold as fallback if primary recommendation validation fails at step s5"],
  },
];

export function DemoAiProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<AiState>(() => ({
    primaryRecommendation: demoRecommendation,
    alternatives: demoAlternatives,
  }), []);
  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}

export function useAi(): AiState {
  const ctx = useContext(AiContext);
  if (!ctx) throw new Error("useAi must be used within DemoAiProvider");
  return ctx;
}

/* ---------------------- Right Context Drawer state --------------------- */

export interface DrawerPayload {
  title: string;
  subtitle?: string;
  body: React.ReactNode;
}

interface DrawerState {
  open: boolean;
  payload: DrawerPayload | null;
  openDrawer: (p: DrawerPayload) => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerState | null>(null);

export function RightDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<DrawerPayload | null>(null);
  const value = useMemo<DrawerState>(() => ({
    open,
    payload,
    openDrawer: (p) => { setPayload(p); setOpen(true); },
    closeDrawer: () => setOpen(false),
  }), [open, payload]);
  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

export function useRightDrawer(): DrawerState {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useRightDrawer must be used within RightDrawerProvider");
  return ctx;
}

/* ------------------ Re-exports for convenience ------------------------- */

export {
  demoRoles,
  envList as environments,
  regionList as regions,
  timeRangeList as timeRanges,
};
export type { Environment, Region, TimeRange, DemoRole } from "@/runops/data/scenario";
