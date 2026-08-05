// SRE Based Agentic NOC — Stage 2 deterministic workflow fixtures.
// Authored values only. No randomness and no remote requests.

import type {
  ActionWorkflowDefinition, ErrorBudgetWindow, EvidenceItem, LifecycleStage,
  RerouteSimulation, RiskWorkflowRecord, ScenarioStep, Stage2LearningRecord,
  ValidationTestDefinition,
} from "@/types/agenticNocWorkflow";

export const PRIMARY_SITUATION_ID = "sit-2026-0520-01";
export const PRIMARY_ACTION_ID = "act-traffic-shift";
export const PRIMARY_LINK_ID = "lnk-ams-mum";
export const PROTECTED_LINK_ID = "lnk-mum-sin";

export const SITUATION_OWNERS: Record<LifecycleStage, { owner: string; decision: string }> = {
  Detected: { owner: "Detection Agent", decision: "Confirm the anomaly is customer impacting" },
  Correlated: { owner: "Correlation Agent", decision: "Confirm the correlated blast radius" },
  Investigating: { owner: "Investigation Agent", decision: "Select the leading cause hypothesis" },
  Mitigating: { owner: "Priya Raman, Incident Commander", decision: "Approve the recommended mitigation" },
  Recovering: { owner: "Recovery Agent", decision: "Confirm execution guardrails hold" },
  Validating: { owner: "Validation Agent", decision: "Accept or reject the validation outcome" },
  Monitoring: { owner: "Marcus Hale, Technical Owner", decision: "Confirm the soak period is clean" },
  Resolved: { owner: "Priya Raman, Incident Commander", decision: "Close the situation" },
  Learning: { owner: "Reliability Engineering", decision: "Route learning items into governance" },
};

export const SITUATION_STAGE_TIMESTAMPS: Record<LifecycleStage, string> = {
  Detected: "2026-05-20T06:58:00Z",
  Correlated: "2026-05-20T07:03:00Z",
  Investigating: "2026-05-20T07:11:00Z",
  Mitigating: "2026-05-20T07:36:00Z",
  Recovering: "2026-05-20T08:12:00Z",
  Validating: "2026-05-20T08:29:00Z",
  Monitoring: "2026-05-20T08:44:00Z",
  Resolved: "2026-05-20T09:02:00Z",
  Learning: "2026-05-20T09:14:00Z",
};

export const SITUATION_DETAIL = {
  id: PRIMARY_SITUATION_ID,
  incidentCommander: "Priya Raman, Incident Commander",
  technicalOwner: "Marcus Hale, APAC Transport Engineering",
  errorBudgetImpact: "12.4% of the 30 day Global Network Availability budget",
  estimatedRestoration: "2026-05-20T09:05:00Z",
  affectedTerminalIds: ["trm-ams", "trm-mum", "trm-sin"],
  affectedLinkIds: [PRIMARY_LINK_ID, PROTECTED_LINK_ID],
};

export const evidenceItems: EvidenceItem[] = [
  {
    id: "ev-001", situationId: PRIMARY_SITUATION_ID, category: "Telemetry", source: "Optical telemetry",
    timestamp: "2026-05-20T08:41:00Z", freshnessSeconds: 62,
    signal: "AMS-MUM optical link margin", observedValue: "1.4 dB", expectedValue: "3.0 dB or above",
    supportsHypothesisIds: ["hyp-1", "hyp-2"], contradictsHypothesisIds: [],
    reliability: 0.96, relatedObject: "AMS-MUM",
  },
  {
    id: "ev-002", situationId: PRIMARY_SITUATION_ID, category: "Telemetry", source: "Optical telemetry",
    timestamp: "2026-05-20T08:40:00Z", freshnessSeconds: 118,
    signal: "AMS-MUM bit error rate", observedValue: "2.1e-6", expectedValue: "Below 1.0e-9",
    supportsHypothesisIds: ["hyp-1"], contradictsHypothesisIds: [],
    reliability: 0.94, relatedObject: "AMS-MUM",
  },
  {
    id: "ev-003", situationId: PRIMARY_SITUATION_ID, category: "Weather", source: "Weather data",
    timestamp: "2026-05-20T08:38:00Z", freshnessSeconds: 240,
    signal: "Monsoon band intensity over the Mumbai landing station",
    observedValue: "58 mm per hour", expectedValue: "Below 12 mm per hour",
    supportsHypothesisIds: ["hyp-1"], contradictsHypothesisIds: ["hyp-4"],
    reliability: 0.91, relatedObject: "Mumbai Landing Station",
  },
  {
    id: "ev-004", situationId: PRIMARY_SITUATION_ID, category: "Diagnostic result", source: "Terminal diagnostics",
    timestamp: "2026-05-20T08:30:00Z", freshnessSeconds: 720,
    signal: "Mumbai EDFA card self test", observedValue: "All diagnostics passed",
    expectedValue: "All diagnostics passed",
    supportsHypothesisIds: [], contradictsHypothesisIds: ["hyp-4", "hyp-3"],
    reliability: 0.88, relatedObject: "Mumbai EDFA shelf 2",
  },
  {
    id: "ev-005", situationId: PRIMARY_SITUATION_ID, category: "Telemetry", source: "Terminal diagnostics",
    timestamp: "2026-05-20T08:33:00Z", freshnessSeconds: 540,
    signal: "Mumbai power supply output", observedValue: "Two units derated to 88%",
    expectedValue: "100% rated output",
    supportsHypothesisIds: ["hyp-3"], contradictsHypothesisIds: [],
    reliability: 0.72, relatedObject: "Mumbai Landing Station",
  },
  {
    id: "ev-006", situationId: PRIMARY_SITUATION_ID, category: "Topology", source: "Network telemetry",
    timestamp: "2026-05-20T08:39:00Z", freshnessSeconds: 180,
    signal: "OTDR trace on the submarine segment", observedValue: "0.9 dB step at km 412",
    expectedValue: "No step above 0.3 dB",
    supportsHypothesisIds: ["hyp-2"], contradictsHypothesisIds: [],
    reliability: 0.83, relatedObject: "AMS-MUM submarine segment",
  },
  {
    id: "ev-007", situationId: PRIMARY_SITUATION_ID, category: "Topology", source: "Network telemetry",
    timestamp: "2026-05-20T08:36:00Z", freshnessSeconds: 360,
    signal: "Submarine attenuation profile trend", observedValue: "Partial recovery in the last cycle",
    expectedValue: "Stable attenuation profile",
    supportsHypothesisIds: [], contradictsHypothesisIds: ["hyp-2"],
    reliability: 0.79, relatedObject: "AMS-MUM submarine segment",
  },
  {
    id: "ev-008", situationId: PRIMARY_SITUATION_ID, category: "Customer impact", source: "Customer experience",
    timestamp: "2026-05-20T08:42:00Z", freshnessSeconds: 30,
    signal: "Enterprise cloud egress synthetic probe", observedValue: "48,210 customers degraded",
    expectedValue: "Zero customers degraded",
    supportsHypothesisIds: ["hyp-1"], contradictsHypothesisIds: [],
    reliability: 0.97, relatedObject: "Global Cloud Connect",
  },
  {
    id: "ev-009", situationId: PRIMARY_SITUATION_ID, category: "Change", source: "Change history",
    timestamp: "2026-05-20T08:10:00Z", freshnessSeconds: 1920,
    signal: "Change events on the Mumbai shelf in the last 30 days",
    observedValue: "No change events", expectedValue: "No change events",
    supportsHypothesisIds: [], contradictsHypothesisIds: ["hyp-4"],
    reliability: 0.99, relatedObject: "Mumbai Landing Station",
  },
  {
    id: "ev-010", situationId: PRIMARY_SITUATION_ID, category: "Capacity", source: "Capacity trends",
    timestamp: "2026-05-20T08:41:00Z", freshnessSeconds: 90,
    signal: "MUM-SIN protected path utilisation", observedValue: "86%", expectedValue: "Below 90% guardrail",
    supportsHypothesisIds: [], contradictsHypothesisIds: [],
    reliability: 0.95, relatedObject: "MUM-SIN",
  },
  {
    id: "ev-011", situationId: PRIMARY_SITUATION_ID, category: "Historical incident", source: "Historical incidents",
    timestamp: "2025-11-04T14:20:00Z", freshnessSeconds: 16_800_000,
    signal: "INC-2025-1104 Mumbai monsoon degradation",
    observedValue: "Same margin collapse signature", expectedValue: "Reference pattern",
    supportsHypothesisIds: ["hyp-1"], contradictsHypothesisIds: [],
    reliability: 0.86, relatedObject: "AMS-MUM",
  },
  {
    id: "ev-012", situationId: PRIMARY_SITUATION_ID, category: "Maintenance", source: "Maintenance records",
    timestamp: "2026-05-18T22:00:00Z", freshnessSeconds: 122_520,
    signal: "Last maintenance on the Mumbai amplifier chain",
    observedValue: "Routine inspection, no defects", expectedValue: "No open defects",
    supportsHypothesisIds: [], contradictsHypothesisIds: ["hyp-3"],
    reliability: 0.9, relatedObject: "Mumbai amplifier chain",
  },
  {
    id: "ev-013", situationId: PRIMARY_SITUATION_ID, category: "Weather", source: "Weather data",
    timestamp: "2026-05-20T08:43:00Z", freshnessSeconds: 20,
    signal: "Storm cell forecast for the next three hours",
    observedValue: "Band persists until 10:15 UTC", expectedValue: "Clear conditions",
    supportsHypothesisIds: ["hyp-1"], contradictsHypothesisIds: [],
    reliability: 0.84, relatedObject: "Mumbai Landing Station", requestedOnly: true,
  },
  {
    id: "ev-014", situationId: PRIMARY_SITUATION_ID, category: "Diagnostic result", source: "Terminal diagnostics",
    timestamp: "2026-05-20T08:43:00Z", freshnessSeconds: 15,
    signal: "Requested amplifier gain sweep", observedValue: "Gain within 0.2 dB of nominal",
    expectedValue: "Gain within 0.5 dB of nominal",
    supportsHypothesisIds: [], contradictsHypothesisIds: ["hyp-3", "hyp-4"],
    reliability: 0.93, relatedObject: "Mumbai EDFA shelf 2", requestedOnly: true,
  },
];

export const actionWorkflows: ActionWorkflowDefinition[] = [
  {
    id: "awf-traffic-shift", actionId: PRIMARY_ACTION_ID,
    reason: "Severe weather has driven the AMS-MUM optical margin below the 3.0 dB reliability threshold",
    affectedServices: ["Global Cloud Connect", "Enterprise Wavelength", "Financial Link Service"],
    customersProtected: 48210,
    operationalRisk: "Protected path utilisation rises from 86% to 89%, below the 90% guardrail",
    autonomyPolicy: "human-approval",
    requiredApprover: "APAC Network Reliability Lead",
    rollbackPlan: [
      "Freeze further traffic migration",
      "Restore the original AMS-MUM wavelength assignment",
      "Return protected path utilisation to 86%",
      "Re-run margin and customer probes on the original route",
    ],
    rollbackDurationMinutes: 7,
    rollbackRisk: "Customers return to the degraded corridor until an alternative mitigation is approved",
    rollbackApprovalRequired: true,
    executionPlan: [
      { id: "exe-1", label: "Pre-checks and guardrail verification", progressPercent: 15, customersImpacted: 48210, detail: "Capacity, latency and policy guardrails confirmed" },
      { id: "exe-2", label: "Protected path activation", progressPercent: 35, customersImpacted: 41500, detail: "Singapore protected wavelength brought into service" },
      { id: "exe-3", label: "Traffic migration in controlled tranches", progressPercent: 60, customersImpacted: 24800, detail: "Traffic shifted in four tranches with per tranche checks" },
      { id: "exe-4", label: "Capacity rebalance and policy reapply", progressPercent: 85, customersImpacted: 9400, detail: "Utilisation held at 89%, QoS policy reapplied" },
      { id: "exe-5", label: "Execution complete, validation ready", progressPercent: 100, customersImpacted: 2100, detail: "Corridor stable, validation suite ready to run" },
    ],
    validationPlanSummary: "Eight required post change validation tests across traffic, optical, capacity and customer probes",
    guardrail: "Automatic pause if protected utilisation exceeds 90% or customer impact increases",
  },
  {
    id: "awf-capacity-rebalance", actionId: "act-capacity-rebalance",
    reason: "Predicted SIN-SYD headroom exhaustion during the APAC peak window",
    affectedServices: ["IP Transit Premium", "Consumer Broadband Backhaul"],
    customersProtected: 1240,
    operationalRisk: "Temporary 400 Gbps reduction on the Sydney consumer backhaul trunk",
    autonomyPolicy: "human-approval",
    requiredApprover: "APAC Network Reliability Lead",
    rollbackPlan: ["Restore the original trunk weighting", "Confirm consumer backhaul throughput"],
    rollbackDurationMinutes: 4,
    rollbackRisk: "Peak headroom returns to the forecast breach path",
    rollbackApprovalRequired: false,
    executionPlan: [
      { id: "exe-1", label: "Pre-checks", progressPercent: 25, customersImpacted: 1240, detail: "Peak forecast and guardrails confirmed" },
      { id: "exe-2", label: "Weighting change applied", progressPercent: 70, customersImpacted: 620, detail: "Trunk weighting rebalanced" },
      { id: "exe-3", label: "Execution complete", progressPercent: 100, customersImpacted: 0, detail: "Utilisation reduced to 63%" },
    ],
    validationPlanSummary: "Capacity and latency assertions plus a consumer broadband synthetic probe",
    guardrail: "Pause if consumer backhaul latency exceeds the SLO threshold",
  },
  {
    id: "awf-amplifier-recal", actionId: "act-amplifier-recal",
    reason: "Amplifier gain drift of 0.4 dB per day on the LON-AMS span",
    affectedServices: ["Financial Link Service"],
    customersProtected: 3120,
    operationalRisk: "Requires a 20 minute protected maintenance window",
    autonomyPolicy: "recommend-only",
    requiredApprover: "EMEA Change Advisory",
    rollbackPlan: ["Restore the previous amplifier gain profile"],
    rollbackDurationMinutes: 3,
    rollbackRisk: "Margin returns to the drifting baseline",
    rollbackApprovalRequired: false,
    executionPlan: [
      { id: "exe-1", label: "Maintenance window opened", progressPercent: 40, customersImpacted: 0, detail: "Protected window confirmed" },
      { id: "exe-2", label: "Recalibration complete", progressPercent: 100, customersImpacted: 0, detail: "1.8 dB of margin recovered" },
    ],
    validationPlanSummary: "Pre and post margin comparison with a 30 minute soak",
    guardrail: "Recommendation only, no autonomous execution permitted",
  },
];

export const validationTests: ValidationTestDefinition[] = [
  { id: "vt-1", name: "Customer traffic restored", expected: "Zero degraded customers", observedOnPass: "0 degraded customers", observedOnFail: "18,400 customers still degraded", required: true, evidenceId: "ev-008" },
  { id: "vt-2", name: "Packet loss below threshold", expected: "Below 0.01%", observedOnPass: "0.002%", observedOnFail: "0.180%", required: true, evidenceId: "ev-001" },
  { id: "vt-3", name: "Bit error rate normalised", expected: "Below 1.0e-9", observedOnPass: "6.0e-10", observedOnFail: "4.2e-7", required: true, evidenceId: "ev-002" },
  { id: "vt-4", name: "Link margin stabilised", expected: "3.0 dB or above", observedOnPass: "5.1 dB", observedOnFail: "2.1 dB", required: true, evidenceId: "ev-001" },
  { id: "vt-5", name: "Protected capacity within threshold", expected: "Below the 90% guardrail", observedOnPass: "89%", observedOnFail: "93%", required: true, evidenceId: "ev-010" },
  { id: "vt-6", name: "Latency within SLO", expected: "Below 148 ms", observedOnPass: "141 ms", observedOnFail: "163 ms", required: true, evidenceId: "ev-010" },
  { id: "vt-7", name: "No new critical alarms", expected: "Zero new critical alarms", observedOnPass: "0 new critical alarms", observedOnFail: "2 new critical alarms", required: true, evidenceId: "ev-004" },
  { id: "vt-8", name: "Service health restored", expected: "All customer facing services healthy", observedOnPass: "3 of 3 services healthy", observedOnFail: "1 of 3 services healthy", required: true, evidenceId: "ev-008" },
];

export const rerouteSimulations: RerouteSimulation[] = [
  {
    riskId: "risk-ams-mum",
    currentRoute: "Amsterdam to Mumbai direct submarine corridor",
    proposedRoute: "Amsterdam to Singapore to Mumbai protected path",
    availableCapacityGbps: 620, projectedUtilizationPercent: 89, projectedLatencyMs: 141,
    servicesProtected: ["Global Cloud Connect", "Enterprise Wavelength", "Financial Link Service"],
    customersProtected: 48210,
    newRisksIntroduced: ["MUM-SIN utilisation approaches the 90% guardrail", "Latency rises by 9 ms for cloud egress"],
    rollbackPath: "Return to the direct corridor in 7 minutes",
    recommendation: "Proceed with human approval, guardrails hold at the projected load",
  },
  {
    riskId: "risk-mum-sin",
    currentRoute: "Mumbai to Singapore protected trunk",
    proposedRoute: "Mumbai to Singapore with the spare wavelength activated",
    availableCapacityGbps: 440, projectedUtilizationPercent: 74, projectedLatencyMs: 138,
    servicesProtected: ["Global Cloud Connect", "Enterprise Wavelength"],
    customersProtected: 12400,
    newRisksIntroduced: ["Spare wavelength no longer available for the Sydney corridor"],
    rollbackPath: "Deactivate the spare wavelength in 4 minutes",
    recommendation: "Stage the wavelength now and activate only if utilisation exceeds 88%",
  },
  {
    riskId: "risk-sin-syd",
    currentRoute: "Singapore to Sydney single trunk",
    proposedRoute: "Singapore to Sydney with consumer traffic rebalanced to the secondary ring",
    availableCapacityGbps: 210, projectedUtilizationPercent: 63, projectedLatencyMs: 152,
    servicesProtected: ["IP Transit Premium", "Consumer Broadband Backhaul"],
    customersProtected: 1240,
    newRisksIntroduced: ["Secondary ring latency exceeds the premium transit target by 4 ms"],
    rollbackPath: "Restore the original trunk weighting in 4 minutes",
    recommendation: "Approve as a preventive action before the APAC peak window",
  },
  {
    riskId: "risk-lon-ams",
    currentRoute: "London to Amsterdam primary span",
    proposedRoute: "London to Amsterdam via the Singapore validated ring",
    availableCapacityGbps: 780, projectedUtilizationPercent: 58, projectedLatencyMs: 132,
    servicesProtected: ["Financial Link Service"],
    customersProtected: 3120,
    newRisksIntroduced: ["No new risks identified at the projected load"],
    rollbackPath: "Return to the primary span in 3 minutes",
    recommendation: "Hold the simulation result and recalibrate the amplifier instead",
  },
];

export const riskWorkflowRecords: RiskWorkflowRecord[] = [
  { riskId: "risk-ams-mum", currentMarginDb: 1.4, predictedMarginDb: 0.6, preventiveAction: "Hold the protected Singapore path and pre-stage RF fallback", region: "APAC", riskLevel: "critical" },
  { riskId: "risk-mum-sin", currentMarginDb: 2.2, predictedMarginDb: 1.8, preventiveAction: "Stage wavelength activation on the spare Singapore trunk", region: "APAC", riskLevel: "high" },
  { riskId: "risk-sin-syd", currentMarginDb: 3.1, predictedMarginDb: 2.4, preventiveAction: "Approve the preventive rebalance and defer the Sydney change window", region: "APAC", riskLevel: "high" },
  { riskId: "risk-lon-ams", currentMarginDb: 3.1, predictedMarginDb: 2.7, preventiveAction: "Schedule amplifier recalibration in the next maintenance window", region: "EMEA", riskLevel: "medium" },
];

/** Error budget windows before mitigation and after successful validation. */
export const errorBudgetWindowsDegraded: ErrorBudgetWindow[] = [
  { window: "1 hour", burnRate: 14.2, budgetRemaining: 38, availability: 99.12 },
  { window: "6 hours", burnRate: 6.4, budgetRemaining: 44, availability: 99.34 },
  { window: "24 hours", burnRate: 3.1, budgetRemaining: 52, availability: 99.48 },
  { window: "7 days", burnRate: 2.2, budgetRemaining: 57, availability: 99.57 },
  { window: "30 days", burnRate: 1.9, budgetRemaining: 61, availability: 99.63 },
];

export const errorBudgetWindowsStabilised: ErrorBudgetWindow[] = [
  { window: "1 hour", burnRate: 1.1, budgetRemaining: 47, availability: 99.94 },
  { window: "6 hours", burnRate: 1.3, budgetRemaining: 49, availability: 99.81 },
  { window: "24 hours", burnRate: 1.2, budgetRemaining: 55, availability: 99.72 },
  { window: "7 days", burnRate: 1.1, budgetRemaining: 59, availability: 99.68 },
  { window: "30 days", burnRate: 1.0, budgetRemaining: 63, availability: 99.66 },
];

export const scenarioSteps: ScenarioStep[] = [
  { index: 1, title: "Risk predicted", operationalEffect: "Prediction agent raises a critical margin collapse risk on AMS-MUM", panelsAffected: ["Predictive Link Risk Center", "Digital twin", "Event stream"] },
  { index: 2, title: "Situation created", operationalEffect: "Situation SIT-2026-0520-01 opens at the Detected stage", panelsAffected: ["Active Situation Room", "Event stream"] },
  { index: 3, title: "Digital twin highlights affected route", operationalEffect: "AMS-MUM is marked critical and the corridor is selected on the twin", panelsAffected: ["Digital twin", "Optical network health"] },
  { index: 4, title: "Services and customers identified", operationalEffect: "Three services and 48,210 customers correlated to the corridor", panelsAffected: ["Service reliability", "Customer impact metric"] },
  { index: 5, title: "Agent investigation begins", operationalEffect: "Investigation agent opens the hypothesis workspace", panelsAffected: ["Agentic Investigation Workspace", "Event stream"] },
  { index: 6, title: "Cause hypotheses ranked", operationalEffect: "Four hypotheses ranked by deterministic evidence strength", panelsAffected: ["Agentic Investigation Workspace"] },
  { index: 7, title: "Weather and optical telemetry correlated", operationalEffect: "Weather evidence raises the leading hypothesis confidence", panelsAffected: ["Evidence drawer", "Agentic Investigation Workspace"] },
  { index: 8, title: "Protected route identified", operationalEffect: "Singapore protected path evaluated by the reroute simulation", panelsAffected: ["Reroute simulation", "Digital twin"] },
  { index: 9, title: "Traffic shift recommended", operationalEffect: "Action recommended under the human approval policy", panelsAffected: ["Human Approval and Action Center"] },
  { index: 10, title: "Human approval requested", operationalEffect: "Approval requested from the APAC Network Reliability Lead", panelsAffected: ["Human Approval and Action Center", "Event stream"] },
  { index: 11, title: "Action approved", operationalEffect: "Human approver accepts the risk and records an approval note", panelsAffected: ["Human Approval and Action Center", "Situation lifecycle"] },
  { index: 12, title: "Traffic shift executed", operationalEffect: "Execution runs through five deterministic stages, route becomes recovery active", panelsAffected: ["Digital twin", "Action center", "Customer impact metric"] },
  { index: 13, title: "Validation tests run", operationalEffect: "Eight required validation tests execute against live evidence", panelsAffected: ["Recovery validation", "Event stream"] },
  { index: 14, title: "Customer impact declines", operationalEffect: "Customer impact falls to zero as validation passes", panelsAffected: ["Customer impact metric", "Service reliability"] },
  { index: 15, title: "SLO burn stabilises", operationalEffect: "Burn rate falls and error budget windows stabilise", panelsAffected: ["SLO and error budgets"] },
  { index: 16, title: "Situation moves to monitoring", operationalEffect: "Situation enters the monitoring soak with the route validated", panelsAffected: ["Active Situation Room", "Digital twin"] },
  { index: 17, title: "Learning item generated", operationalEffect: "A governed learning record is created in the Draft state", panelsAffected: ["Learning and improvement", "Event stream"] },
];

export const scenarioLearningRecord: Stage2LearningRecord = {
  id: "lrn-sit-2026-0520-01",
  situationId: PRIMARY_SITUATION_ID,
  title: "Monsoon corridor margin protection improved",
  primaryCause: "Severe weather induced optical margin reduction on the AMS-MUM span",
  successfulAction: "Traffic shift to the Singapore protected path with eight validation tests",
  evidenceUsed: ["ev-001", "ev-002", "ev-003", "ev-008", "ev-011"],
  runbookChange: "Runbook evidence requirements improved, weather evidence is now mandatory before mitigation",
  monitoringImprovement: "Weather threshold updated and link margin warning adjusted to 3.4 dB",
  automationCandidate: "Protected route validation added as a capacity precheck before traffic shifts",
  owner: "Reliability Engineering",
  dueDate: "2026-06-10",
  governanceState: "Draft",
};

export const learningCandidates: Stage2LearningRecord[] = [
  scenarioLearningRecord,
  {
    id: "lrn-cand-2", situationId: PRIMARY_SITUATION_ID, title: "Recurring alert retired",
    primaryCause: "Duplicate amplifier temperature alert with no operational value",
    successfulAction: "Alert suppressed after evidence review",
    evidenceUsed: ["ev-004"],
    runbookChange: "Removed the manual amplifier check step",
    monitoringImprovement: "Recurring alert retired from the APAC alarm policy",
    automationCandidate: "Automated shelf diagnostic replaces the manual check",
    owner: "APAC Reliability", dueDate: "2026-06-02", governanceState: "Under review",
  },
  {
    id: "lrn-cand-3", situationId: "sit-2026-0520-02", title: "Capacity precheck added",
    primaryCause: "Protected headroom erosion during peak shifting",
    successfulAction: "Preventive rebalance recommended before breach",
    evidenceUsed: ["ev-010"],
    runbookChange: "Capacity precheck added to the rebalance runbook",
    monitoringImprovement: "Headroom guardrail alert added at 80% utilisation",
    automationCandidate: "Automatic spare wavelength staging",
    owner: "APAC Reliability", dueDate: "2026-06-14", governanceState: "Draft",
  },
];

export const AUTO_REFRESH_INTERVALS_MS: Record<string, number> = {
  "Off": 0,
  "30 seconds": 30_000,
  "60 seconds": 60_000,
  "5 minutes": 300_000,
};
