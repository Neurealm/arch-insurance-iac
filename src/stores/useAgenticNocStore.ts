// SRE Based Agentic NOC — Stage 2 workflow state store.
// Deterministic: every transition is an explicit operator or scenario action.
// No random values are generated anywhere in this store.

import { create } from "zustand";
import type {
  ActionRuntime, ActionState, AutoRefreshOption, ErrorBudgetWindow,
  EventStreamFilter, EvidenceItem, LifecycleEntry, LifecycleStage,
  Stage2LearningRecord, ValidationTestResult, WorkflowEvent, WorkflowEventType,
} from "@/types/agenticNocWorkflow";
import { SITUATION_LIFECYCLE } from "@/types/agenticNocWorkflow";
import type {
  AgenticFilters, MapLayers, NetworkStatus, ViewMode,
} from "@/types/agenticOpticalOperations";
import {
  PRIMARY_ACTION_ID, PRIMARY_LINK_ID, PROTECTED_LINK_ID, SITUATION_OWNERS,
  SITUATION_STAGE_TIMESTAMPS, actionWorkflows, errorBudgetWindowsDegraded,
  errorBudgetWindowsStabilised, evidenceItems, scenarioLearningRecord,
  scenarioSteps, validationTests,
} from "@/data/agenticNocWorkflowData";
import { agenticActions, hypotheses } from "@/data/agenticOpticalNetworkData";

export const DEFAULT_FILTERS: AgenticFilters = {
  timeRange: "Last 24 hours",
  region: "All regions",
  country: "All countries",
  customer: "All customers",
  service: "All services",
  terminal: "All terminals",
  link: "All links",
  situationStatus: "All statuses",
  networkStatus: "All network states",
  riskLevel: "All risk levels",
  agentActivity: "All agent activity",
  validationState: "All validation states",
};

export const DEFAULT_MAP_LAYERS: MapLayers = {
  terminals: true, links: true, customerImpact: true, predictedRisk: true,
  weatherExposure: true, protectedRoutes: false, automationActivity: true, maintenance: true,
};

export const BASE_CUSTOMER_IMPACT = 48210;

const EVENT_CATEGORY: Record<WorkflowEventType, WorkflowEvent["category"]> = {
  "Anomaly detected": "Situations",
  "Risk predicted": "Risks",
  "Situation created": "Situations",
  "Investigation started": "Investigations",
  "Hypothesis updated": "Investigations",
  "Evidence added": "Investigations",
  "Action recommended": "Actions",
  "Approval requested": "Actions",
  "Action approved": "Actions",
  "Action rejected": "Actions",
  "Automation started": "Actions",
  "Traffic shifted": "Actions",
  "Validation started": "Validation",
  "Validation passed": "Validation",
  "Validation failed": "Validation",
  "Rollback initiated": "Actions",
  "Situation resolved": "Situations",
  "Learning generated": "Learning",
};

/** Deterministic clock: events use a fixed base time plus the event sequence number. */
const EVENT_BASE_MS = Date.parse("2026-05-20T08:45:00Z");
export const eventTimestamp = (sequence: number) =>
  new Date(EVENT_BASE_MS + sequence * 60_000).toISOString();

function makeEvent(
  sequence: number, type: WorkflowEventType, object: string, agent: string,
  result: string, extra: Partial<WorkflowEvent> = {},
): WorkflowEvent {
  return {
    id: `wfe-${sequence}`,
    timestamp: eventTimestamp(sequence),
    type, object, agent, result,
    category: EVENT_CATEGORY[type],
    ...extra,
  };
}

function initialRuntime(actionId: string): ActionRuntime {
  const action = agenticActions.find((a) => a.id === actionId);
  const state: ActionState =
    action?.activityType === "awaiting-approval" ? "Awaiting approval"
      : action?.activityType === "executing" ? "Recommended"
        : action?.activityType === "observing" ? "Completed"
          : "Recommended";
  return {
    state,
    progressPercent: 0,
    executionStageIndex: -1,
    validationState: "not-started",
    rollbackReady: action?.rollbackReady ?? false,
  };
}

function initialRuntimes(): Record<string, ActionRuntime> {
  return Object.fromEntries(agenticActions.map((a) => [a.id, initialRuntime(a.id)]));
}

function initialValidation(): ValidationTestResult[] {
  return validationTests.map((t) => ({
    id: t.id, name: t.name, status: "Not started", expected: t.expected,
    observed: "Not observed", evidenceId: t.evidenceId, required: t.required,
  }));
}

export interface AgenticNocState {
  // View, filters and map
  view: ViewMode;
  filters: AgenticFilters;
  layers: MapLayers;
  selectedTerminalId: string | null;
  selectedLinkId: string | null;
  selectedRiskId: string | null;
  selectedSituationId: string | null;
  selectedActionId: string | null;
  selectedHypothesisId: string | null;
  selectedPanel: string | null;
  openDrawer: null | "evidence" | "action" | "simulation" | "validation";

  // Investigation
  eliminatedHypothesisIds: string[];
  promotedHypothesisId: string | null;
  requestedEvidence: boolean;

  // Actions
  actionRuntimes: Record<string, ActionRuntime>;
  dismissedRiskIds: string[];

  // Validation
  validationResults: ValidationTestResult[];
  validationState: "Not started" | "Running" | "Passed" | "Failed";

  // Situation lifecycle
  lifecycleStage: LifecycleStage;

  // Learning
  learningRecords: Stage2LearningRecord[];

  // Events
  events: WorkflowEvent[];
  eventFilter: EventStreamFilter;
  eventSequence: number;

  // Scenario
  scenarioStep: number;
  autoPlay: boolean;

  // Refresh
  autoRefresh: AutoRefreshOption;
  refreshTick: number;
  lastTelemetryAt: string;
  lastTwinSyncAt: string;
  lastAgentReasoningAt: string;
  lastActionStateAt: string;

  // Actions
  setView: (view: ViewMode) => void;
  setFilter: (key: keyof AgenticFilters, value: string) => void;
  setFilters: (filters: AgenticFilters) => void;
  resetFilters: () => void;
  toggleLayer: (key: keyof MapLayers) => void;
  resetLayers: () => void;
  setSelectedPanel: (panel: string | null) => void;
  setOpenDrawer: (drawer: AgenticNocState["openDrawer"]) => void;
  setEventFilter: (filter: EventStreamFilter) => void;

  selectTerminal: (id: string | null) => void;
  selectLink: (id: string | null) => void;
  selectRisk: (id: string | null) => void;
  openSituation: (id: string | null) => void;
  selectAction: (id: string | null) => void;
  selectHypothesis: (id: string | null) => void;

  eliminateHypothesis: (id: string) => void;
  restoreHypothesis: (id: string) => void;
  promoteHypothesis: (id: string) => void;
  requestAdditionalEvidence: () => void;

  approveAction: (id: string, approval: { approver: string; note: string; riskAcknowledged: boolean }) => void;
  rejectAction: (id: string, rejection: { reason: string; alternative: string }) => void;
  requestMoreEvidence: (id: string, note: string) => void;
  modifyAction: (id: string, note: string) => void;
  executeAction: (id: string) => void;
  pauseAction: (id: string) => void;
  resumeAction: (id: string) => void;
  rollbackAction: (id: string) => void;
  dismissRisk: (id: string) => void;

  startValidation: () => void;
  completeValidation: () => void;
  failValidation: () => void;

  advanceScenario: () => void;
  previousScenarioStep: () => void;
  setAutoPlay: (value: boolean) => void;
  resetScenario: () => void;

  setAutoRefresh: (value: AutoRefreshOption) => void;
  refreshData: () => void;
}

const INITIAL: Omit<AgenticNocState,
  | "setView" | "setFilter" | "setFilters" | "resetFilters" | "toggleLayer" | "resetLayers"
  | "setSelectedPanel" | "setOpenDrawer" | "setEventFilter" | "selectTerminal" | "selectLink"
  | "selectRisk" | "openSituation" | "selectAction" | "selectHypothesis" | "eliminateHypothesis"
  | "restoreHypothesis" | "promoteHypothesis" | "requestAdditionalEvidence" | "approveAction"
  | "rejectAction" | "requestMoreEvidence" | "modifyAction" | "executeAction" | "pauseAction"
  | "resumeAction" | "rollbackAction" | "dismissRisk" | "startValidation" | "completeValidation"
  | "failValidation" | "advanceScenario" | "previousScenarioStep" | "setAutoPlay"
  | "resetScenario" | "setAutoRefresh" | "refreshData"
> = {
  view: "SRE View",
  filters: { ...DEFAULT_FILTERS },
  layers: { ...DEFAULT_MAP_LAYERS },
  selectedTerminalId: null,
  selectedLinkId: null,
  selectedRiskId: null,
  selectedSituationId: null,
  selectedActionId: null,
  selectedHypothesisId: null,
  selectedPanel: null,
  openDrawer: null,
  eliminatedHypothesisIds: ["hyp-4"],
  promotedHypothesisId: null,
  requestedEvidence: false,
  actionRuntimes: initialRuntimes(),
  dismissedRiskIds: [],
  validationResults: initialValidation(),
  validationState: "Not started",
  lifecycleStage: "Investigating",
  learningRecords: [],
  events: [],
  eventFilter: "All",
  eventSequence: 0,
  scenarioStep: 0,
  autoPlay: false,
  autoRefresh: "Off",
  refreshTick: 0,
  lastTelemetryAt: "2026-05-20T08:42:07Z",
  lastTwinSyncAt: "2026-05-20T08:42:05Z",
  lastAgentReasoningAt: "2026-05-20T08:41:58Z",
  lastActionStateAt: "2026-05-20T08:41:44Z",
};

/** Pure reducer for one scenario step. Backward navigation replays from the start. */
function applyScenarioStep(
  state: AgenticNocState, step: number,
): Partial<AgenticNocState> {
  const sequence = state.eventSequence + 1;
  const push = (event: WorkflowEvent): Partial<AgenticNocState> => ({
    events: [...state.events, event],
    eventSequence: sequence,
    lastActionStateAt: event.timestamp,
  });
  const runtime = state.actionRuntimes[PRIMARY_ACTION_ID];
  const workflow = actionWorkflows.find((w) => w.actionId === PRIMARY_ACTION_ID)!;
  const withRuntime = (next: Partial<ActionRuntime>) => ({
    actionRuntimes: { ...state.actionRuntimes, [PRIMARY_ACTION_ID]: { ...runtime, ...next } },
  });

  switch (step) {
    case 1:
      return {
        selectedRiskId: "risk-ams-mum",
        ...push(makeEvent(sequence, "Risk predicted", "AMS-MUM", "Prediction Agent",
          "Critical margin collapse predicted at 10:15 UTC", { confidence: 0.86, evidenceRef: "ev-001" })),
      };
    case 2:
      return {
        selectedSituationId: "sit-2026-0520-01",
        lifecycleStage: "Detected",
        ...push(makeEvent(sequence, "Situation created", "SIT-2026-0520-01", "Detection Agent",
          "Critical situation opened for the AMS-MUM corridor", { evidenceRef: "ev-002" })),
      };
    case 3:
      return {
        selectedLinkId: PRIMARY_LINK_ID,
        lifecycleStage: "Correlated",
        ...push(makeEvent(sequence, "Anomaly detected", "AMS-MUM", "Correlation Agent",
          "Digital twin highlights the affected corridor", { confidence: 0.9, evidenceRef: "ev-001" })),
      };
    case 4:
      return push(makeEvent(sequence, "Anomaly detected", "Global Cloud Connect", "Correlation Agent",
        "Three services and 48,210 customers correlated to the corridor",
        { confidence: 0.97, evidenceRef: "ev-008" }));
    case 5:
      return {
        lifecycleStage: "Investigating",
        ...push(makeEvent(sequence, "Investigation started", "SIT-2026-0520-01", "Investigation Agent",
          "Hypothesis workspace opened with nine evidence sources")),
      };
    case 6:
      return {
        selectedHypothesisId: "hyp-1",
        ...push(makeEvent(sequence, "Hypothesis updated", "SIT-2026-0520-01", "Investigation Agent",
          "Four hypotheses ranked by evidence strength", { confidence: 0.74 })),
      };
    case 7:
      return {
        requestedEvidence: true,
        ...push(makeEvent(sequence, "Evidence added", "Mumbai Landing Station", "Investigation Agent",
          "Weather and optical telemetry correlated, leading hypothesis strengthened",
          { confidence: 0.77, evidenceRef: "ev-013" })),
      };
    case 8:
      return {
        selectedRiskId: "risk-ams-mum",
        ...push(makeEvent(sequence, "Risk predicted", "MUM-SIN", "Prediction Agent",
          "Protected Singapore path identified with 620 Gbps available",
          { confidence: 0.89, evidenceRef: "ev-010" })),
      };
    case 9:
      return {
        selectedActionId: PRIMARY_ACTION_ID,
        ...withRuntime({ state: "Recommended" }),
        ...push(makeEvent(sequence, "Action recommended", workflow.actionId, "Action Agent",
          "Traffic shift to the protected Singapore path recommended", { confidence: 0.88 })),
      };
    case 10:
      return {
        ...withRuntime({ state: "Awaiting approval" }),
        ...push(makeEvent(sequence, "Approval requested", workflow.actionId, "Action Agent",
          `Approval requested from ${workflow.requiredApprover}`)),
      };
    case 11:
      return {
        lifecycleStage: "Mitigating",
        ...withRuntime({
          state: "Approved", approverName: "APAC Network Reliability Lead",
          approvalNote: "Guardrails reviewed, protected path capacity accepted",
          approvedAt: eventTimestamp(sequence), riskAcknowledged: true,
        }),
        ...push(makeEvent(sequence, "Action approved", workflow.actionId, "Action Agent",
          "Human approver accepted the operational risk",
          { humanActor: "APAC Network Reliability Lead" })),
      };
    case 12:
      return {
        lifecycleStage: "Recovering",
        ...withRuntime({
          state: "Executing", progressPercent: 100,
          executionStageIndex: workflow.executionPlan.length - 1,
        }),
        ...push(makeEvent(sequence, "Traffic shifted", workflow.actionId, "Recovery Agent",
          "Traffic shifted to the protected path across five controlled stages",
          { humanActor: "APAC Network Reliability Lead", confidence: 0.93 })),
      };
    case 13:
      return {
        lifecycleStage: "Validating",
        validationState: "Running",
        validationResults: validationTests.map((t) => ({
          id: t.id, name: t.name, status: "Running", expected: t.expected,
          observed: "Measuring", evidenceId: t.evidenceId, required: t.required,
        })),
        ...withRuntime({ state: "Validating", validationState: "running" }),
        ...push(makeEvent(sequence, "Validation started", workflow.actionId, "Validation Agent",
          "Eight required validation tests started")),
      };
    case 14:
      return {
        validationState: "Passed",
        validationResults: validationTests.map((t) => ({
          id: t.id, name: t.name, status: "Passed", expected: t.expected,
          observed: t.observedOnPass, timestamp: eventTimestamp(sequence),
          evidenceId: t.evidenceId, required: t.required,
        })),
        ...withRuntime({ state: "Completed", validationState: "passed" }),
        ...push(makeEvent(sequence, "Validation passed", workflow.actionId, "Validation Agent",
          "All required validation tests passed, customer impact cleared", { confidence: 0.96 })),
      };
    case 15:
      return push(makeEvent(sequence, "Validation passed", "Global Network Availability",
        "Reliability Agent", "Burn rate stabilised at 1.0x across all error budget windows",
        { confidence: 0.94 }));
    case 16:
      return {
        lifecycleStage: "Monitoring",
        ...push(makeEvent(sequence, "Situation resolved", "SIT-2026-0520-01", "Recovery Agent",
          "Situation moved to monitoring with the corridor validated",
          { humanActor: "Marcus Hale, Technical Owner" })),
      };
    case 17:
      return {
        lifecycleStage: "Learning",
        learningRecords: [scenarioLearningRecord],
        ...push(makeEvent(sequence, "Learning generated", "SIT-2026-0520-01", "Learning Agent",
          "Governed learning record created in the Draft state", { evidenceRef: "ev-011" })),
      };
    default:
      return {};
  }
}

export const useAgenticNocStore = create<AgenticNocState>((set, get) => ({
  ...INITIAL,

  setView: (view) => set({ view }),
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  setFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
  toggleLayer: (key) => set((s) => ({ layers: { ...s.layers, [key]: !s.layers[key] } })),
  resetLayers: () => set({ layers: { ...DEFAULT_MAP_LAYERS }, selectedLinkId: null, selectedTerminalId: null }),
  setSelectedPanel: (selectedPanel) => set({ selectedPanel }),
  setOpenDrawer: (openDrawer) => set({ openDrawer }),
  setEventFilter: (eventFilter) => set({ eventFilter }),

  selectTerminal: (id) => set((s) => ({
    selectedTerminalId: id === s.selectedTerminalId ? null : id,
    selectedLinkId: null,
  })),
  selectLink: (id) => set((s) => ({
    selectedLinkId: id === s.selectedLinkId ? null : id,
    selectedTerminalId: null,
  })),
  selectRisk: (id) => set({ selectedRiskId: id }),
  openSituation: (id) => set({ selectedSituationId: id, selectedPanel: id ? "situation" : null }),
  selectAction: (id) => set({ selectedActionId: id }),
  selectHypothesis: (id) => set({ selectedHypothesisId: id }),

  eliminateHypothesis: (id) => set((s) => {
    const sequence = s.eventSequence + 1;
    return {
      eliminatedHypothesisIds: s.eliminatedHypothesisIds.includes(id)
        ? s.eliminatedHypothesisIds : [...s.eliminatedHypothesisIds, id],
      eventSequence: sequence,
      events: [...s.events, makeEvent(sequence, "Hypothesis updated", id, "Investigation Agent",
        "Hypothesis eliminated by the operator", { humanActor: "SRE on call" })],
    };
  }),
  restoreHypothesis: (id) => set((s) => {
    const sequence = s.eventSequence + 1;
    return {
      eliminatedHypothesisIds: s.eliminatedHypothesisIds.filter((h) => h !== id),
      eventSequence: sequence,
      events: [...s.events, makeEvent(sequence, "Hypothesis updated", id, "Investigation Agent",
        "Hypothesis restored to the active set", { humanActor: "SRE on call" })],
    };
  }),
  promoteHypothesis: (id) => set((s) => {
    const sequence = s.eventSequence + 1;
    return {
      promotedHypothesisId: id, selectedHypothesisId: id,
      eventSequence: sequence,
      events: [...s.events, makeEvent(sequence, "Hypothesis updated", id, "Investigation Agent",
        "Hypothesis promoted as the working cause", { humanActor: "SRE on call" })],
    };
  }),
  requestAdditionalEvidence: () => set((s) => {
    const sequence = s.eventSequence + 1;
    return {
      requestedEvidence: true,
      eventSequence: sequence,
      events: [...s.events, makeEvent(sequence, "Evidence added", "SIT-2026-0520-01",
        "Investigation Agent", "Additional evidence collected on operator request",
        { humanActor: "SRE on call", evidenceRef: "ev-013" })],
    };
  }),

  approveAction: (id, approval) => set((s) => {
    const sequence = s.eventSequence + 1;
    const runtime = s.actionRuntimes[id];
    return {
      actionRuntimes: {
        ...s.actionRuntimes,
        [id]: {
          ...runtime, state: "Approved", approverName: approval.approver,
          approvalNote: approval.note, riskAcknowledged: approval.riskAcknowledged,
          approvedAt: eventTimestamp(sequence),
        },
      },
      lifecycleStage: id === PRIMARY_ACTION_ID ? "Mitigating" : s.lifecycleStage,
      eventSequence: sequence,
      lastActionStateAt: eventTimestamp(sequence),
      events: [...s.events, makeEvent(sequence, "Action approved", id, "Action Agent",
        `Approved by ${approval.approver}`, { humanActor: approval.approver })],
    };
  }),

  rejectAction: (id, rejection) => set((s) => {
    const sequence = s.eventSequence + 1;
    const runtime = s.actionRuntimes[id];
    return {
      actionRuntimes: {
        ...s.actionRuntimes,
        [id]: {
          ...runtime, state: "Rejected", rejectionReason: rejection.reason,
          alternativeRequested: rejection.alternative,
        },
      },
      eventSequence: sequence,
      lastActionStateAt: eventTimestamp(sequence),
      events: [...s.events, makeEvent(sequence, "Action rejected", id, "Action Agent",
        `Rejected: ${rejection.reason}`, { humanActor: "SRE on call" })],
    };
  }),

  requestMoreEvidence: (id, note) => set((s) => {
    const sequence = s.eventSequence + 1;
    const runtime = s.actionRuntimes[id];
    return {
      requestedEvidence: true,
      actionRuntimes: { ...s.actionRuntimes, [id]: { ...runtime, evidenceRequested: note } },
      eventSequence: sequence,
      events: [...s.events, makeEvent(sequence, "Evidence added", id, "Action Agent",
        `More evidence requested: ${note}`, { humanActor: "SRE on call" })],
    };
  }),

  modifyAction: (id, note) => set((s) => {
    const sequence = s.eventSequence + 1;
    const runtime = s.actionRuntimes[id];
    return {
      actionRuntimes: {
        ...s.actionRuntimes,
        [id]: { ...runtime, modificationNote: note, state: "Awaiting approval" },
      },
      eventSequence: sequence,
      events: [...s.events, makeEvent(sequence, "Action recommended", id, "Action Agent",
        `Action modified and returned for approval: ${note}`, { humanActor: "SRE on call" })],
    };
  }),

  executeAction: (id) => set((s) => {
    const runtime = s.actionRuntimes[id];
    const workflow = actionWorkflows.find((w) => w.actionId === id);
    if (!workflow || (runtime.state !== "Approved" && runtime.state !== "Executing")) return {};
    const nextIndex = Math.min(runtime.executionStageIndex + 1, workflow.executionPlan.length - 1);
    const stage = workflow.executionPlan[nextIndex];
    const sequence = s.eventSequence + 1;
    const isFirst = runtime.executionStageIndex < 0;
    return {
      actionRuntimes: {
        ...s.actionRuntimes,
        [id]: {
          ...runtime, state: "Executing", executionStageIndex: nextIndex,
          progressPercent: stage.progressPercent,
        },
      },
      lifecycleStage: id === PRIMARY_ACTION_ID ? "Recovering" : s.lifecycleStage,
      eventSequence: sequence,
      lastActionStateAt: eventTimestamp(sequence),
      events: [...s.events, makeEvent(sequence,
        isFirst ? "Automation started" : "Traffic shifted", id, "Recovery Agent",
        `${stage.label} · ${stage.progressPercent}% complete`,
        { humanActor: runtime.approverName, confidence: 0.93 })],
    };
  }),

  pauseAction: (id) => set((s) => {
    const runtime = s.actionRuntimes[id];
    if (runtime.state !== "Executing") return {};
    const sequence = s.eventSequence + 1;
    return {
      actionRuntimes: { ...s.actionRuntimes, [id]: { ...runtime, state: "Paused" } },
      eventSequence: sequence,
      events: [...s.events, makeEvent(sequence, "Automation started", id, "Recovery Agent",
        "Execution paused by the operator", { humanActor: "SRE on call" })],
    };
  }),

  resumeAction: (id) => set((s) => {
    const runtime = s.actionRuntimes[id];
    if (runtime.state !== "Paused") return {};
    const sequence = s.eventSequence + 1;
    return {
      actionRuntimes: { ...s.actionRuntimes, [id]: { ...runtime, state: "Executing" } },
      eventSequence: sequence,
      events: [...s.events, makeEvent(sequence, "Automation started", id, "Recovery Agent",
        "Execution resumed by the operator", { humanActor: "SRE on call" })],
    };
  }),

  rollbackAction: (id) => set((s) => {
    const runtime = s.actionRuntimes[id];
    const sequence = s.eventSequence + 1;
    return {
      actionRuntimes: {
        ...s.actionRuntimes,
        [id]: {
          ...runtime, state: "Rolled back", progressPercent: 0, executionStageIndex: -1,
          validationState: "not-started",
        },
      },
      lifecycleStage: id === PRIMARY_ACTION_ID ? "Mitigating" : s.lifecycleStage,
      validationState: "Not started",
      validationResults: initialValidation(),
      eventSequence: sequence,
      lastActionStateAt: eventTimestamp(sequence),
      events: [...s.events, makeEvent(sequence, "Rollback initiated", id, "Recovery Agent",
        "Action rolled back, route returned to its prior status", { humanActor: "SRE on call" })],
    };
  }),

  dismissRisk: (id) => set((s) => ({
    dismissedRiskIds: s.dismissedRiskIds.includes(id) ? s.dismissedRiskIds : [...s.dismissedRiskIds, id],
    selectedRiskId: s.selectedRiskId === id ? null : s.selectedRiskId,
  })),

  startValidation: () => set((s) => {
    const sequence = s.eventSequence + 1;
    const id = s.selectedActionId ?? PRIMARY_ACTION_ID;
    const runtime = s.actionRuntimes[id];
    return {
      validationState: "Running",
      validationResults: validationTests.map((t) => ({
        id: t.id, name: t.name, status: "Running", expected: t.expected,
        observed: "Measuring", evidenceId: t.evidenceId, required: t.required,
      })),
      actionRuntimes: {
        ...s.actionRuntimes,
        [id]: { ...runtime, state: "Validating", validationState: "running" },
      },
      lifecycleStage: "Validating",
      eventSequence: sequence,
      events: [...s.events, makeEvent(sequence, "Validation started", id, "Validation Agent",
        "Validation suite started")],
    };
  }),

  completeValidation: () => set((s) => {
    const sequence = s.eventSequence + 1;
    const id = s.selectedActionId ?? PRIMARY_ACTION_ID;
    const runtime = s.actionRuntimes[id];
    return {
      validationState: "Passed",
      validationResults: validationTests.map((t) => ({
        id: t.id, name: t.name, status: "Passed", expected: t.expected,
        observed: t.observedOnPass, timestamp: eventTimestamp(sequence),
        evidenceId: t.evidenceId, required: t.required,
      })),
      actionRuntimes: {
        ...s.actionRuntimes,
        [id]: { ...runtime, state: "Completed", validationState: "passed", progressPercent: 100 },
      },
      lifecycleStage: "Monitoring",
      eventSequence: sequence,
      lastActionStateAt: eventTimestamp(sequence),
      events: [...s.events, makeEvent(sequence, "Validation passed", id, "Validation Agent",
        "All required validation tests passed", { confidence: 0.96 })],
    };
  }),

  failValidation: () => set((s) => {
    const sequence = s.eventSequence + 1;
    const id = s.selectedActionId ?? PRIMARY_ACTION_ID;
    const runtime = s.actionRuntimes[id];
    return {
      validationState: "Failed",
      validationResults: validationTests.map((t, index) => ({
        id: t.id, name: t.name,
        status: index < 5 ? "Passed" : "Failed",
        expected: t.expected,
        observed: index < 5 ? t.observedOnPass : t.observedOnFail,
        timestamp: eventTimestamp(sequence),
        evidenceId: t.evidenceId, required: t.required,
      })),
      actionRuntimes: {
        ...s.actionRuntimes,
        [id]: { ...runtime, state: "Failed", validationState: "failed" },
      },
      lifecycleStage: "Mitigating",
      eventSequence: sequence,
      lastActionStateAt: eventTimestamp(sequence),
      events: [...s.events, makeEvent(sequence, "Validation failed", id, "Validation Agent",
        "Required validation tests failed, rollback recommended", { confidence: 0.92 })],
    };
  }),

  advanceScenario: () => {
    const state = get();
    if (state.scenarioStep >= scenarioSteps.length) {
      set({ autoPlay: false });
      return;
    }
    const next = state.scenarioStep + 1;
    set({ ...applyScenarioStep(state, next), scenarioStep: next });
    if (next >= scenarioSteps.length) set({ autoPlay: false });
  },

  previousScenarioStep: () => {
    const target = get().scenarioStep - 1;
    if (target < 0) return;
    // Deterministic replay from the initial state.
    let working: AgenticNocState = { ...get(), ...INITIAL };
    for (let step = 1; step <= target; step += 1) {
      working = { ...working, ...applyScenarioStep(working, step), scenarioStep: step } as AgenticNocState;
    }
    set({ ...working, scenarioStep: target, autoPlay: false });
  },

  setAutoPlay: (autoPlay) => set((s) => ({
    autoPlay: s.scenarioStep >= scenarioSteps.length ? false : autoPlay,
  })),

  resetScenario: () => set({ ...INITIAL, actionRuntimes: initialRuntimes(), validationResults: initialValidation() }),

  setAutoRefresh: (autoRefresh) => set({ autoRefresh }),

  refreshData: () => set((s) => ({
    refreshTick: s.refreshTick + 1,
    lastTelemetryAt: eventTimestamp(s.eventSequence + s.refreshTick + 1),
    lastTwinSyncAt: eventTimestamp(s.eventSequence + s.refreshTick + 1),
    lastAgentReasoningAt: eventTimestamp(s.eventSequence + s.refreshTick),
  })),
}));

/* ------------------------------------------------------------------ */
/* Deterministic derived selectors                                      */
/* ------------------------------------------------------------------ */

export function availableEvidence(situationId: string, requestedEvidence: boolean): EvidenceItem[] {
  return evidenceItems.filter((e) =>
    e.situationId === situationId && (!e.requestedOnly || requestedEvidence));
}

/** Evidence weighted confidence. Deterministic — identical inputs give identical output. */
export function computeConfidence(hypothesisId: string, evidence: EvidenceItem[]): number {
  const support = evidence
    .filter((e) => e.supportsHypothesisIds.includes(hypothesisId))
    .reduce((sum, e) => sum + e.reliability, 0);
  const contra = evidence
    .filter((e) => e.contradictsHypothesisIds.includes(hypothesisId))
    .reduce((sum, e) => sum + e.reliability, 0);
  if (support === 0) return 3;
  return Math.max(3, Math.min(97, Math.round((support / (support + contra + 1.6)) * 100)));
}

export interface RankedHypothesis {
  id: string;
  rank: number;
  hypothesis: string;
  confidence: number;
  evidenceStrength: "Strong" | "Moderate" | "Weak";
  supportingSignals: EvidenceItem[];
  contradictingSignals: EvidenceItem[];
  similarIncidents: string[];
  recentChanges: string[];
  eliminated: boolean;
  investigationStatus: string;
}

export function rankHypotheses(
  situationId: string, requestedEvidence: boolean, eliminated: string[], promoted: string | null,
): RankedHypothesis[] {
  const evidence = availableEvidence(situationId, requestedEvidence);
  const changes = evidence.filter((e) => e.category === "Change").map((e) => e.observedValue);
  return hypotheses
    .filter((h) => h.situationId === situationId)
    .map((h) => {
      const confidence = computeConfidence(h.id, evidence);
      const isEliminated = eliminated.includes(h.id);
      return {
        id: h.id,
        rank: 0,
        hypothesis: h.hypothesis,
        confidence,
        evidenceStrength: confidence >= 60 ? "Strong" : confidence >= 30 ? "Moderate" : "Weak",
        supportingSignals: evidence.filter((e) => e.supportsHypothesisIds.includes(h.id)),
        contradictingSignals: evidence.filter((e) => e.contradictsHypothesisIds.includes(h.id)),
        similarIncidents: h.similarIncidents,
        recentChanges: changes,
        eliminated: isEliminated,
        investigationStatus: isEliminated ? "Eliminated"
          : promoted === h.id ? "Promoted"
            : confidence >= 60 ? "Converging" : "Open",
      } satisfies RankedHypothesis;
    })
    .sort((a, b) => Number(a.eliminated) - Number(b.eliminated) || b.confidence - a.confidence)
    .map((h, index) => ({ ...h, rank: index + 1 }));
}

export function evidenceCoveragePercent(situationId: string, requestedEvidence: boolean): number {
  const total = evidenceItems.filter((e) => e.situationId === situationId).length;
  return Math.round((availableEvidence(situationId, requestedEvidence).length / total) * 100);
}

export function lifecycleEntries(current: LifecycleStage): LifecycleEntry[] {
  const currentIndex = SITUATION_LIFECYCLE.indexOf(current);
  return SITUATION_LIFECYCLE.map((stage, index) => ({
    stage,
    state: index < currentIndex ? "completed" : index === currentIndex ? "current" : "pending",
    timestamp: index <= currentIndex ? SITUATION_STAGE_TIMESTAMPS[stage] : undefined,
    owner: SITUATION_OWNERS[stage].owner,
    decision: SITUATION_OWNERS[stage].decision,
  }));
}

/** Customer impact falls deterministically with execution progress and validation. */
export function customersImpacted(state: AgenticNocState): number {
  if (state.validationState === "Passed") return 0;
  const runtime = state.actionRuntimes[PRIMARY_ACTION_ID];
  const workflow = actionWorkflows.find((w) => w.actionId === PRIMARY_ACTION_ID)!;
  if (!runtime || runtime.executionStageIndex < 0) return BASE_CUSTOMER_IMPACT;
  if (runtime.state === "Rolled back") return BASE_CUSTOMER_IMPACT;
  return workflow.executionPlan[runtime.executionStageIndex].customersImpacted;
}

export function errorBudgetWindows(state: AgenticNocState): ErrorBudgetWindow[] {
  return state.validationState === "Passed" ? errorBudgetWindowsStabilised : errorBudgetWindowsDegraded;
}

/** Map status overrides driven by the workflow state. */
export function linkStatusOverrides(state: AgenticNocState): Record<string, NetworkStatus> {
  const runtime = state.actionRuntimes[PRIMARY_ACTION_ID];
  if (!runtime) return {};
  if (state.validationState === "Passed" || runtime.state === "Completed") {
    return { [PRIMARY_LINK_ID]: "validated", [PROTECTED_LINK_ID]: "validated" };
  }
  if (runtime.state === "Executing" || runtime.state === "Validating" || runtime.state === "Paused") {
    return { [PRIMARY_LINK_ID]: "recovery-active", [PROTECTED_LINK_ID]: "recovery-active" };
  }
  if (runtime.state === "Rolled back" || runtime.state === "Failed") {
    return { [PRIMARY_LINK_ID]: "critical", [PROTECTED_LINK_ID]: "degraded" };
  }
  return {};
}

export function rollbackAvailable(state: AgenticNocState, actionId: string): boolean {
  const runtime = state.actionRuntimes[actionId];
  if (!runtime) return false;
  return runtime.state === "Executing" || runtime.state === "Paused"
    || runtime.state === "Validating" || runtime.state === "Failed"
    || state.validationState === "Failed";
}
