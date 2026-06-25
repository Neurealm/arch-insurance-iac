import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ScenarioId =
  | "baseline"
  | "metrology-loss"
  | "amhs-congestion"
  | "vision-drift"
  | "utility-peak"
  | "demand-surge"
  | "compound";

export type WorkshopMode = "guided" | "explore" | "co-design";
export type ScenarioStatus =
  | "Baseline"
  | "Scenario Running"
  | "Recommendation Pending"
  | "Approval Required"
  | "Candidate Applied"
  | "Scenario Reset";

export type Kpis = {
  waferStartsToday: number;
  waferStartsTarget: number;
  wipLots: number;
  onTimeCompletion: number; // %
  cycleTimeDays: number;
  dispatchAdherence: number; // %
  toolAvailability: number; // %
  bottleneckUtil: number; // %
  forecastPeakMW: number;
  electricalNowMW: number;
  lotsAtQueueRisk: number;
  priorityAtRisk: number;
  visionWarnings: number;
  pendingApprovals: number;
};

export type CandidateId = "balanced" | "throughput" | null;

export type TimelineEvent = {
  id: string;
  ts: string;
  domain: "Equipment" | "Production" | "Material" | "Vision" | "Utility" | "Simulation" | "Agent" | "Approval" | "Workflow" | "Evidence";
  title: string;
  severity: "info" | "warning" | "critical" | "success";
  entity?: string;
  status?: string;
};

export type Recommendation = {
  id: string;
  title: string;
  detail: string;
  expected: string;
  confidence: number;
  approver: string;
  status: "Pending" | "Approved" | "Rejected" | "Simulating";
};

const BASELINE_KPIS: Kpis = {
  waferStartsToday: 742,
  waferStartsTarget: 1180,
  wipLots: 2260,
  onTimeCompletion: 93.4,
  cycleTimeDays: 46.1,
  dispatchAdherence: 92.7,
  toolAvailability: 94.2,
  bottleneckUtil: 90.6,
  forecastPeakMW: 69.1,
  electricalNowMW: 62.8,
  lotsAtQueueRisk: 6,
  priorityAtRisk: 0,
  visionWarnings: 1,
  pendingApprovals: 0,
};

const COMPOUND_KPIS: Kpis = {
  waferStartsToday: 742,
  waferStartsTarget: 1180,
  wipLots: 2260,
  onTimeCompletion: 89.6,
  cycleTimeDays: 47.4,
  dispatchAdherence: 88.9,
  toolAvailability: 92.8,
  bottleneckUtil: 96.8,
  forecastPeakMW: 74.8,
  electricalNowMW: 67.3,
  lotsAtQueueRisk: 37,
  priorityAtRisk: 12,
  visionWarnings: 12,
  pendingApprovals: 3,
};

export const CANDIDATES: Record<Exclude<CandidateId, null>, { label: string; kpis: Kpis; risk: string; confidence: number; bullets: string[] }> = {
  balanced: {
    label: "Candidate A — Balanced Recovery",
    confidence: 87,
    risk: "Low",
    kpis: {
      ...COMPOUND_KPIS,
      onTimeCompletion: 92.8,
      cycleTimeDays: 46.6,
      bottleneckUtil: 92.3,
      lotsAtQueueRisk: 18,
      priorityAtRisk: 4,
      forecastPeakMW: 70.9,
      dispatchAdherence: 91.4,
      visionWarnings: 4,
    },
    bullets: [
      "Rebalance metrology sampling across MET 038 and MET 044",
      "Activate alternate AMHS route around Bay 3 stocker",
      "Roll back vision model VSN 4.8 → VSN 4.7 on 12 endpoints; 4-endpoint canary",
      "Shift eligible facility loads; preserve queue-time guardrails",
    ],
  },
  throughput: {
    label: "Candidate B — Throughput Priority",
    confidence: 74,
    risk: "Medium",
    kpis: {
      ...COMPOUND_KPIS,
      onTimeCompletion: 93.1,
      cycleTimeDays: 46.3,
      bottleneckUtil: 94.9,
      lotsAtQueueRisk: 21,
      priorityAtRisk: 6,
      forecastPeakMW: 73.5,
      dispatchAdherence: 92.0,
      visionWarnings: 9,
    },
    bullets: [
      "Prioritize hot & critical lots; increase campaign batching",
      "Delay selected engineering lots; reduce noncritical metrology sampling",
      "Maintain current vision model; collect additional evidence",
      "Accept higher utility peak within envelope",
    ],
  },
};

export const SCENARIOS: Record<ScenarioId, { label: string; kpis: Kpis }> = {
  "baseline": { label: "Baseline Operations", kpis: BASELINE_KPIS },
  "metrology-loss": { label: "Metrology Capacity Loss", kpis: { ...BASELINE_KPIS, bottleneckUtil: 95.1, lotsAtQueueRisk: 22, onTimeCompletion: 91.2, pendingApprovals: 1 } },
  "amhs-congestion": { label: "AMHS Congestion", kpis: { ...BASELINE_KPIS, dispatchAdherence: 89.6, lotsAtQueueRisk: 19, cycleTimeDays: 46.8, pendingApprovals: 1 } },
  "vision-drift": { label: "Vision Model Drift", kpis: { ...BASELINE_KPIS, visionWarnings: 12, pendingApprovals: 1 } },
  "utility-peak": { label: "Utility Peak Risk", kpis: { ...BASELINE_KPIS, electricalNowMW: 66.4, forecastPeakMW: 73.9, pendingApprovals: 1 } },
  "demand-surge": { label: "Priority Demand Surge", kpis: { ...BASELINE_KPIS, priorityAtRisk: 9, dispatchAdherence: 90.1, pendingApprovals: 1 } },
  "compound": { label: "Compound Operational Event", kpis: COMPOUND_KPIS },
};

const DEFAULT_RECS: Recommendation[] = [
  {
    id: "rec-1",
    title: "Rebalance 18 eligible lots across MET 038 and MET 044",
    detail: "Distributes metrology load away from MET 041 calibration fault; preserves max-queue-time guardrails.",
    expected: "Queue −31% • Cycle time −0.5d",
    confidence: 87,
    approver: "Manufacturing Control",
    status: "Pending",
  },
  {
    id: "rec-2",
    title: "Roll back vision model VSN 4.8 → VSN 4.7 on 12 endpoints",
    detail: "Begin 4-endpoint canary validation against current golden dataset.",
    expected: "False rejects −1.6 pp",
    confidence: 94,
    approver: "Quality Engineering",
    status: "Pending",
  },
  {
    id: "rec-3",
    title: "Precondition chilled-water loop B; shift maintenance/charging loads",
    detail: "Production-aware load shift to keep forecast peak under 71.0 MW envelope.",
    expected: "Peak −3.7 MW",
    confidence: 81,
    approver: "Facilities Operations",
    status: "Pending",
  },
];

const DEFAULT_TIMELINE: TimelineEvent[] = [
  { id: "ev-1", ts: "13:42", domain: "Equipment", title: "MET 041 optical stage calibration fault detected", severity: "critical", entity: "MET 041", status: "Open" },
  { id: "ev-2", ts: "13:46", domain: "Material", title: "Bay 3 AMHS congestion — stocker maintenance event", severity: "warning", entity: "Bay 3 / STK 07", status: "Active" },
  { id: "ev-3", ts: "13:51", domain: "Vision", title: "VSN 4.8 drift warning — false reject +1.7 pp", severity: "warning", entity: "VSN 4.8", status: "Investigating" },
  { id: "ev-4", ts: "13:54", domain: "Utility", title: "Site electrical peak forecast 74.8 MW at 15:30", severity: "warning", entity: "Main Substation", status: "Forecast" },
  { id: "ev-5", ts: "13:58", domain: "Agent", title: "Factory Operations Coordinator drafted 3 cross-domain recommendations", severity: "info", entity: "Coordinator", status: "Pending Approval" },
];

type Ctx = {
  scenarioId: ScenarioId;
  setScenario: (id: ScenarioId) => void;
  scenarioStatus: ScenarioStatus;
  setScenarioStatus: (s: ScenarioStatus) => void;
  workshopMode: WorkshopMode;
  setWorkshopMode: (m: WorkshopMode) => void;
  paused: boolean;
  setPaused: (b: boolean) => void;
  clock: Date;
  shift: string;
  appliedCandidate: CandidateId;
  applyCandidate: (c: CandidateId) => void;
  baselineKpis: Kpis;
  currentKpis: Kpis;
  recommendations: Recommendation[];
  updateRecommendation: (id: string, status: Recommendation["status"]) => void;
  timeline: TimelineEvent[];
  pushTimeline: (ev: Omit<TimelineEvent, "id" | "ts"> & { ts?: string }) => void;
  reset: () => void;
};

const ScenarioCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "neugain.semiconductor.v1";

type Persisted = {
  scenarioId: ScenarioId;
  appliedCandidate: CandidateId;
  workshopMode: WorkshopMode;
  notes?: string;
};

function loadPersisted(): Partial<Persisted> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const persisted = loadPersisted();
  const [scenarioId, setScenarioId] = useState<ScenarioId>(persisted.scenarioId ?? "compound");
  const [scenarioStatus, setScenarioStatus] = useState<ScenarioStatus>("Recommendation Pending");
  const [workshopMode, setWorkshopMode] = useState<WorkshopMode>(persisted.workshopMode ?? "guided");
  const [paused, setPaused] = useState(false);
  const [appliedCandidate, setAppliedCandidate] = useState<CandidateId>(persisted.appliedCandidate ?? null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(DEFAULT_RECS);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(DEFAULT_TIMELINE);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ scenarioId, appliedCandidate, workshopMode } satisfies Persisted)
    );
  }, [scenarioId, appliedCandidate, workshopMode]);

  const baselineKpis = SCENARIOS.baseline.kpis;
  const currentKpis = useMemo(() => {
    if (appliedCandidate) return CANDIDATES[appliedCandidate].kpis;
    return SCENARIOS[scenarioId].kpis;
  }, [scenarioId, appliedCandidate]);

  const setScenario = useCallback((id: ScenarioId) => {
    setScenarioId(id);
    setAppliedCandidate(null);
    setScenarioStatus(id === "baseline" ? "Baseline" : "Recommendation Pending");
    setRecommendations(DEFAULT_RECS);
  }, []);

  const applyCandidate = useCallback((c: CandidateId) => {
    setAppliedCandidate(c);
    setScenarioStatus(c ? "Candidate Applied" : "Recommendation Pending");
    if (c) {
      const label = CANDIDATES[c].label;
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      setTimeline((t) => [
        { id: `ev-${Date.now()}`, ts, domain: "Workflow", title: `${label} applied across affected domains`, severity: "success", entity: "Coordinator", status: "Executed" },
        ...t,
      ]);
    }
  }, []);

  const updateRecommendation = useCallback((id: string, status: Recommendation["status"]) => {
    setRecommendations((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    const rec = DEFAULT_RECS.find((x) => x.id === id);
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setTimeline((t) => [
      {
        id: `ev-${Date.now()}`,
        ts,
        domain: "Approval",
        title: `${status}: ${rec?.title ?? id}`,
        severity: status === "Approved" ? "success" : status === "Rejected" ? "warning" : "info",
        entity: rec?.approver,
        status,
      },
      ...t,
    ]);
  }, []);

  const pushTimeline: Ctx["pushTimeline"] = useCallback((ev) => {
    const now = new Date();
    const ts = ev.ts ?? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setTimeline((t) => [{ id: `ev-${Date.now()}`, ts, ...ev }, ...t]);
  }, []);

  const reset = useCallback(() => {
    setScenarioId("compound");
    setAppliedCandidate(null);
    setScenarioStatus("Recommendation Pending");
    setRecommendations(DEFAULT_RECS);
    setTimeline(DEFAULT_TIMELINE);
    setPaused(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const shift = clock.getHours() >= 7 && clock.getHours() < 19 ? "Day Shift A" : "Night Shift B";

  const value: Ctx = {
    scenarioId,
    setScenario,
    scenarioStatus,
    setScenarioStatus,
    workshopMode,
    setWorkshopMode,
    paused,
    setPaused,
    clock,
    shift,
    appliedCandidate,
    applyCandidate,
    baselineKpis,
    currentKpis,
    recommendations,
    updateRecommendation,
    timeline,
    pushTimeline,
    reset,
  };

  return <ScenarioCtx.Provider value={value}>{children}</ScenarioCtx.Provider>;
}

export function useScenario() {
  const c = useContext(ScenarioCtx);
  if (!c) throw new Error("useScenario must be used within ScenarioProvider");
  return c;
}
