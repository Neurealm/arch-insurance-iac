// Deterministic sample operational data for the SRE Based Agentic NOC.
// No randomness, no remote requests — all values are authored fixtures.

import type {
  AgenticAction, CapacityPoint, ChangeRecord, Hypothesis, LearningRecord,
  OperationalEvent, OpticalLink, OpticalTerminal, PredictedRisk,
  ServiceReliabilityRecord, Situation, SloRecord,
} from "@/types/agenticOpticalOperations";

export const REGIONS = ["All regions", "North America", "EMEA", "APAC", "LATAM"] as const;
export const TIME_RANGES = ["Last 1 hour", "Last 6 hours", "Last 24 hours", "Last 7 days", "Last 30 days"] as const;
export const CUSTOMERS = ["All customers", "Meridian Bank", "Helix Health", "Northwind Retail", "Consumer Broadband"] as const;
export const SERVICES = [
  "All services", "Global Cloud Connect", "Financial Link Service", "IP Transit Premium",
  "Enterprise Wavelength", "Consumer Broadband Backhaul",
] as const;

export const PLATFORM_STATUS = {
  label: "All Systems Operational",
  agentsActive: 28,
  awaitingApproval: 2,
  investigatingCritical: 1,
};

export const terminals: OpticalTerminal[] = [
  {
    id: "trm-chi", name: "Chicago Gateway", city: "Chicago", country: "United States",
    region: "North America", latitude: 41.8781, longitude: -87.6298, status: "healthy",
    availability: 99.987, sloContribution: 12.4, activeAlarms: 0, connectedLinks: 3,
    customersAffected: 0, services: ["Global Cloud Connect", "IP Transit Premium"],
    activeSituationIds: [], predictedRiskIds: [], agentActivity: "observing",
    lastTelemetryAt: "2026-05-20T08:41:52Z",
  },
  {
    id: "trm-atl", name: "Atlanta Core", city: "Atlanta", country: "United States",
    region: "North America", latitude: 33.749, longitude: -84.388, status: "maintenance",
    availability: 99.961, sloContribution: 8.1, activeAlarms: 1, connectedLinks: 3,
    customersAffected: 0, services: ["IP Transit Premium", "Consumer Broadband Backhaul"],
    activeSituationIds: [], predictedRiskIds: [], agentActivity: "observing",
    lastTelemetryAt: "2026-05-20T08:41:40Z",
  },
  {
    id: "trm-lon", name: "London Docklands", city: "London", country: "United Kingdom",
    region: "EMEA", latitude: 51.5072, longitude: -0.1276, status: "healthy",
    availability: 99.979, sloContribution: 14.2, activeAlarms: 0, connectedLinks: 4,
    customersAffected: 0, services: ["Financial Link Service", "Global Cloud Connect"],
    activeSituationIds: [], predictedRiskIds: ["risk-lon-ams"], agentActivity: "observing",
    lastTelemetryAt: "2026-05-20T08:41:58Z",
  },
  {
    id: "trm-ams", name: "Amsterdam Science Park", city: "Amsterdam", country: "Netherlands",
    region: "EMEA", latitude: 52.3676, longitude: 4.9041, status: "degraded",
    availability: 99.842, sloContribution: 15.6, activeAlarms: 4, connectedLinks: 4,
    customersAffected: 48210, services: ["Global Cloud Connect", "Enterprise Wavelength", "Financial Link Service"],
    activeSituationIds: ["sit-2026-0520-01"], predictedRiskIds: ["risk-ams-mum"],
    weatherCondition: "Storm front, high wind", agentActivity: "investigating",
    lastTelemetryAt: "2026-05-20T08:42:04Z",
  },
  {
    id: "trm-mum", name: "Mumbai Landing Station", city: "Mumbai", country: "India",
    region: "APAC", latitude: 19.076, longitude: 72.8777, status: "critical",
    availability: 99.412, sloContribution: 11.8, activeAlarms: 9, connectedLinks: 3,
    customersAffected: 48210, services: ["Global Cloud Connect", "Enterprise Wavelength", "Financial Link Service"],
    activeSituationIds: ["sit-2026-0520-01"], predictedRiskIds: ["risk-ams-mum", "risk-mum-sin"],
    weatherCondition: "Severe rain, monsoon band", agentActivity: "executing",
    lastTelemetryAt: "2026-05-20T08:42:07Z",
  },
  {
    id: "trm-sin", name: "Singapore Changi Hub", city: "Singapore", country: "Singapore",
    region: "APAC", latitude: 1.3521, longitude: 103.8198, status: "recovery-active",
    availability: 99.914, sloContribution: 13.1, activeAlarms: 2, connectedLinks: 4,
    customersAffected: 0, services: ["Global Cloud Connect", "Enterprise Wavelength"],
    activeSituationIds: ["sit-2026-0520-01"], predictedRiskIds: ["risk-mum-sin"],
    agentActivity: "validating", lastTelemetryAt: "2026-05-20T08:42:06Z",
  },
  {
    id: "trm-syd", name: "Sydney Harbour Terminal", city: "Sydney", country: "Australia",
    region: "APAC", latitude: -33.8688, longitude: 151.2093, status: "at-risk",
    availability: 99.902, sloContribution: 7.4, activeAlarms: 2, connectedLinks: 2,
    customersAffected: 1240, services: ["IP Transit Premium", "Consumer Broadband Backhaul"],
    activeSituationIds: ["sit-2026-0520-02"], predictedRiskIds: ["risk-sin-syd"],
    weatherCondition: "Coastal squall", agentActivity: "recommending",
    lastTelemetryAt: "2026-05-20T08:41:36Z",
  },
  {
    id: "trm-sao", name: "São Paulo Interconnect", city: "São Paulo", country: "Brazil",
    region: "LATAM", latitude: -23.5505, longitude: -46.6333, status: "validated",
    availability: 99.958, sloContribution: 6.2, activeAlarms: 0, connectedLinks: 2,
    customersAffected: 0, services: ["IP Transit Premium", "Consumer Broadband Backhaul"],
    activeSituationIds: [], predictedRiskIds: [], agentActivity: "learning",
    lastTelemetryAt: "2026-05-20T08:41:48Z",
  },
];

export const links: OpticalLink[] = [
  {
    id: "lnk-ams-mum", name: "AMS-MUM", sourceTerminalId: "trm-ams", targetTerminalId: "trm-mum",
    status: "critical", capacityGbps: 4800, utilizationPercent: 92, linkMarginDb: 1.4,
    bitErrorRate: 2.1e-6, packetLossPercent: 0.42, availability: 99.412,
    services: ["Global Cloud Connect", "Enterprise Wavelength", "Financial Link Service"],
    customersAffected: 48210, situationId: "sit-2026-0520-01", riskId: "risk-ams-mum",
    riskLevel: "critical", weatherExposed: true, protectedRouteAvailable: true,
    fallbackLinkIds: ["lnk-mum-sin", "lnk-sin-lon"],
    currentHypothesis: "Severe weather induced link margin reduction on the AMS-MUM span",
    activeActionId: "act-traffic-shift", validationState: "running", agentActivity: "executing",
  },
  {
    id: "lnk-mum-sin", name: "MUM-SIN", sourceTerminalId: "trm-mum", targetTerminalId: "trm-sin",
    status: "recovery-active", capacityGbps: 3200, utilizationPercent: 86, linkMarginDb: 2.2,
    bitErrorRate: 8.7e-7, packetLossPercent: 0.06, availability: 99.914,
    services: ["Global Cloud Connect", "Enterprise Wavelength"], customersAffected: 0,
    situationId: "sit-2026-0520-01", riskId: "risk-mum-sin", riskLevel: "high",
    weatherExposed: true, protectedRouteAvailable: true, fallbackLinkIds: ["lnk-sin-syd"],
    currentHypothesis: "Protected path absorbing shifted traffic within capacity guardrails",
    activeActionId: "act-traffic-shift", validationState: "running", agentActivity: "validating",
  },
  {
    id: "lnk-sin-lon", name: "SIN-LON", sourceTerminalId: "trm-sin", targetTerminalId: "trm-lon",
    status: "validated", capacityGbps: 4000, utilizationPercent: 68, linkMarginDb: 5.8,
    bitErrorRate: 1.1e-9, packetLossPercent: 0.0, availability: 99.972,
    services: ["Global Cloud Connect", "Financial Link Service"], customersAffected: 0,
    riskLevel: "low", weatherExposed: false, protectedRouteAvailable: true,
    fallbackLinkIds: ["lnk-lon-ams"], validationState: "passed", agentActivity: "validating",
  },
  {
    id: "lnk-lon-ams", name: "LON-AMS", sourceTerminalId: "trm-lon", targetTerminalId: "trm-ams",
    status: "degraded", capacityGbps: 2400, utilizationPercent: 81, linkMarginDb: 3.1,
    bitErrorRate: 4.4e-8, packetLossPercent: 0.02, availability: 99.884,
    services: ["Financial Link Service", "Global Cloud Connect"], customersAffected: 3120,
    riskId: "risk-lon-ams", riskLevel: "medium", weatherExposed: true,
    protectedRouteAvailable: true, fallbackLinkIds: ["lnk-sin-lon"],
    currentHypothesis: "Amplifier gain drift at Amsterdam terminal", validationState: "not-started",
    agentActivity: "investigating",
  },
  {
    id: "lnk-chi-lon", name: "CHI-LON", sourceTerminalId: "trm-chi", targetTerminalId: "trm-lon",
    status: "healthy", capacityGbps: 6400, utilizationPercent: 54, linkMarginDb: 6.2,
    bitErrorRate: 1.2e-9, packetLossPercent: 0.0, availability: 99.991,
    services: ["Global Cloud Connect", "Financial Link Service"], customersAffected: 0,
    riskLevel: "low", weatherExposed: false, protectedRouteAvailable: true,
    fallbackLinkIds: ["lnk-atl-lon"], agentActivity: "observing",
  },
  {
    id: "lnk-atl-lon", name: "ATL-LON", sourceTerminalId: "trm-atl", targetTerminalId: "trm-lon",
    status: "healthy", capacityGbps: 4800, utilizationPercent: 61, linkMarginDb: 6.4,
    bitErrorRate: 9.3e-10, packetLossPercent: 0.0, availability: 99.986,
    services: ["IP Transit Premium", "Global Cloud Connect"], customersAffected: 0,
    riskLevel: "low", weatherExposed: false, protectedRouteAvailable: true,
    fallbackLinkIds: ["lnk-chi-lon"], agentActivity: "observing",
  },
  {
    id: "lnk-chi-atl", name: "CHI-ATL", sourceTerminalId: "trm-chi", targetTerminalId: "trm-atl",
    status: "maintenance", capacityGbps: 3200, utilizationPercent: 38, linkMarginDb: 7.1,
    bitErrorRate: 5.0e-10, packetLossPercent: 0.0, availability: 99.968,
    services: ["IP Transit Premium"], customersAffected: 0, riskLevel: "low",
    weatherExposed: false, protectedRouteAvailable: true, fallbackLinkIds: ["lnk-atl-sao"],
    agentActivity: "observing",
  },
  {
    id: "lnk-sin-syd", name: "SIN-SYD", sourceTerminalId: "trm-sin", targetTerminalId: "trm-syd",
    status: "at-risk", capacityGbps: 2800, utilizationPercent: 78, linkMarginDb: 3.1,
    bitErrorRate: 6.1e-8, packetLossPercent: 0.01, availability: 99.902,
    services: ["IP Transit Premium", "Consumer Broadband Backhaul"], customersAffected: 1240,
    situationId: "sit-2026-0520-02", riskId: "risk-sin-syd", riskLevel: "high",
    weatherExposed: true, protectedRouteAvailable: false, fallbackLinkIds: [],
    currentHypothesis: "Capacity headroom erosion driven by shifted APAC traffic",
    validationState: "not-started", agentActivity: "recommending",
  },
  {
    id: "lnk-atl-sao", name: "ATL-SAO", sourceTerminalId: "trm-atl", targetTerminalId: "trm-sao",
    status: "healthy", capacityGbps: 2400, utilizationPercent: 44, linkMarginDb: 6.9,
    bitErrorRate: 7.0e-10, packetLossPercent: 0.0, availability: 99.978,
    services: ["IP Transit Premium", "Consumer Broadband Backhaul"], customersAffected: 0,
    riskLevel: "low", weatherExposed: false, protectedRouteAvailable: true,
    fallbackLinkIds: ["lnk-chi-atl"], agentActivity: "observing",
  },
  {
    id: "lnk-sao-lon", name: "SAO-LON", sourceTerminalId: "trm-sao", targetTerminalId: "trm-lon",
    status: "validated", capacityGbps: 2000, utilizationPercent: 51, linkMarginDb: 5.4,
    bitErrorRate: 1.8e-9, packetLossPercent: 0.0, availability: 99.964,
    services: ["Global Cloud Connect"], customersAffected: 0, riskLevel: "low",
    weatherExposed: false, protectedRouteAvailable: true, fallbackLinkIds: ["lnk-atl-lon"],
    validationState: "passed", agentActivity: "learning",
  },
];

export const situations: Situation[] = [
  {
    id: "sit-2026-0520-01", title: "Mumbai to Amsterdam Optical Corridor Degradation",
    severity: "Critical", status: "Mitigating", region: "APAC",
    startedAt: "2026-05-20T06:58:00Z", durationMinutes: 104, customersAffected: 48210,
    servicesAffected: ["Global Cloud Connect", "Enterprise Wavelength", "Financial Link Service"],
    criticalJourneys: ["Enterprise cloud egress", "Payment settlement transport"],
    sloImpact: "Global Network Availability error budget consumed 12.4% this window",
    phase: "Mitigating",
    rootCauseHypothesis: "Severe rain causing link margin reduction and increasing bit error rate on the AMS-MUM span",
    confidence: 82, currentAction: "Traffic shifted to protected path via Singapore, capacity rebalancing in progress",
    validationState: "running", linkIds: ["lnk-ams-mum", "lnk-mum-sin"],
  },
  {
    id: "sit-2026-0520-02", title: "Singapore to Sydney Capacity Headroom Erosion",
    severity: "Major", status: "Monitoring", region: "APAC",
    startedAt: "2026-05-20T07:46:00Z", durationMinutes: 56, customersAffected: 1240,
    servicesAffected: ["IP Transit Premium", "Consumer Broadband Backhaul"],
    criticalJourneys: ["Consumer broadband peak backhaul"],
    sloImpact: "Low Latency Service burn rate elevated to 1.6x", phase: "Monitoring",
    rootCauseHypothesis: "Shifted APAC traffic reduces protected headroom below the 80% guardrail",
    confidence: 64, currentAction: "Preventive capacity rebalance recommended, awaiting human approval",
    validationState: "not-started", linkIds: ["lnk-sin-syd"],
  },
];

export const hypotheses: Hypothesis[] = [
  {
    id: "hyp-1", situationId: "sit-2026-0520-01",
    hypothesis: "Severe weather impact on the AMS-MUM span", confidence: 82,
    supportingEvidence: [
      "156 optical telemetry signals show correlated margin loss",
      "Meteorological feed reports a monsoon band over the Mumbai landing station",
      "Bit error rate rose 3 orders of magnitude within 40 minutes",
    ],
    contradictingEvidence: ["No amplifier alarms raised at the Mumbai terminal"],
    similarIncidents: ["INC-2025-1104 Mumbai monsoon degradation", "INC-2024-0819 Chennai landing station"],
    investigationState: "converging",
  },
  {
    id: "hyp-2", situationId: "sit-2026-0520-01",
    hypothesis: "Fiber attenuation increase on the submarine segment", confidence: 64,
    supportingEvidence: ["OTDR trace indicates a 0.9 dB step at km 412"],
    contradictingEvidence: ["Attenuation profile recovered partially during the last polling cycle"],
    similarIncidents: ["INC-2025-0227 Red Sea segment attenuation"],
    investigationState: "open",
  },
  {
    id: "hyp-3", situationId: "sit-2026-0520-01",
    hypothesis: "Power degradation at the Mumbai terminal", confidence: 41,
    supportingEvidence: ["Two power supply units reporting derated output"],
    contradictingEvidence: ["Facility power telemetry within nominal band", "No correlated alarms on adjacent shelves"],
    similarIncidents: ["INC-2024-1218 Chennai power derating"], investigationState: "open",
  },
  {
    id: "hyp-4", situationId: "sit-2026-0520-01",
    hypothesis: "Hardware degradation of the EDFA card", confidence: 21,
    supportingEvidence: ["Card temperature 4°C above baseline"],
    contradictingEvidence: ["Card diagnostics passed 12 minutes ago", "No change events on the shelf in 30 days"],
    similarIncidents: [], investigationState: "rejected",
  },
];

export const predictedRisks: PredictedRisk[] = [
  {
    id: "risk-ams-mum", linkId: "lnk-ams-mum", title: "AMS-MUM margin collapse within the storm window",
    riskLevel: "critical", probability: 0.86, predictedImpactAt: "2026-05-20T10:15:00Z",
    primaryDriver: "Severe weather and low optical margin",
    affectedServices: ["Global Cloud Connect", "Financial Link Service"], customersAtRisk: 48210,
    recommendedPreparation: "Hold protected path via Singapore and pre-stage RF fallback",
  },
  {
    id: "risk-mum-sin", linkId: "lnk-mum-sin", title: "MUM-SIN utilisation breach after traffic shift",
    riskLevel: "high", probability: 0.71, predictedImpactAt: "2026-05-20T11:40:00Z",
    primaryDriver: "Shifted corridor traffic against 86% utilisation",
    affectedServices: ["Global Cloud Connect", "Enterprise Wavelength"], customersAtRisk: 12400,
    recommendedPreparation: "Stage wavelength activation on the spare Singapore trunk",
  },
  {
    id: "risk-sin-syd", linkId: "lnk-sin-syd", title: "SIN-SYD headroom exhaustion during APAC peak",
    riskLevel: "high", probability: 0.63, predictedImpactAt: "2026-05-20T13:05:00Z",
    primaryDriver: "No protected route available and rising peak demand",
    affectedServices: ["IP Transit Premium", "Consumer Broadband Backhaul"], customersAtRisk: 1240,
    recommendedPreparation: "Approve preventive rebalance and defer the Sydney change window",
  },
  {
    id: "risk-lon-ams", linkId: "lnk-lon-ams", title: "LON-AMS amplifier gain drift trend",
    riskLevel: "medium", probability: 0.44, predictedImpactAt: "2026-05-20T18:30:00Z",
    primaryDriver: "Gain drift trending 0.4 dB per day",
    affectedServices: ["Financial Link Service"], customersAtRisk: 3120,
    recommendedPreparation: "Schedule amplifier recalibration in the next maintenance window",
  },
];

export const agenticActions: AgenticAction[] = [
  {
    id: "act-traffic-shift", title: "Shift AMS-MUM traffic to the protected Singapore path",
    linkId: "lnk-ams-mum", situationId: "sit-2026-0520-01", activityType: "executing",
    autonomyPolicy: "autonomous-with-guardrails", progressPercent: 68,
    expectedResult: "Restore customer traffic within 6 minutes and recover 48,210 impacted customers",
    riskDescription: "Protected path utilisation rises to 86%, guardrail trips above 90%",
    rollbackReady: true, validationState: "running", approver: "Auto policy, SRE on-call notified",
    validationPlan: "27 post-change validation tests across margin, loss, latency and customer probes",
  },
  {
    id: "act-capacity-rebalance", title: "Preventive capacity rebalance on SIN-SYD",
    linkId: "lnk-sin-syd", situationId: "sit-2026-0520-02", activityType: "awaiting-approval",
    autonomyPolicy: "human-approval", progressPercent: 0,
    expectedResult: "Reduce SIN-SYD peak utilisation from 78% to 63%",
    riskDescription: "Temporary 400 Gbps reduction on the Sydney consumer backhaul trunk",
    rollbackReady: true, validationState: "not-started", approver: "APAC Network Reliability Lead",
    validationPlan: "12 capacity and latency assertions plus a consumer broadband synthetic probe",
  },
  {
    id: "act-amplifier-recal", title: "Schedule amplifier recalibration on LON-AMS",
    linkId: "lnk-lon-ams", activityType: "recommending", autonomyPolicy: "recommend-only",
    progressPercent: 0, expectedResult: "Recover 1.8 dB of optical margin before the next peak",
    riskDescription: "Requires a 20 minute protected maintenance window",
    rollbackReady: true, validationState: "not-started", approver: "EMEA Change Advisory",
    validationPlan: "Pre and post margin comparison with a 30 minute soak",
  },
  {
    id: "act-observe-sao", title: "Observe São Paulo interconnect after validated recovery",
    terminalId: "trm-sao", activityType: "observing", autonomyPolicy: "observe-only",
    progressPercent: 100, expectedResult: "Confirm sustained stability for 24 hours",
    riskDescription: "No customer risk, observation only", rollbackReady: false,
    validationState: "passed", approver: "Not required",
    validationPlan: "Continuous synthetic transaction monitoring",
  },
];

export const sloRecords: SloRecord[] = [
  { id: "slo-1", service: "Global Network Availability", target: 99.5, attainment: 99.63, errorBudgetRemaining: 61, burnRate: 1.9, status: "degraded", owner: "Global Reliability", region: "All regions" },
  { id: "slo-2", service: "Enterprise Connectivity", target: 99.5, attainment: 99.71, errorBudgetRemaining: 74, burnRate: 1.2, status: "healthy", owner: "Enterprise Services", region: "EMEA" },
  { id: "slo-3", service: "Low Latency Service", target: 99.4, attainment: 99.42, errorBudgetRemaining: 38, burnRate: 1.6, status: "degraded", owner: "APAC Reliability", region: "APAC" },
  { id: "slo-4", service: "Packet Delivery", target: 99.9, attainment: 99.88, errorBudgetRemaining: 22, burnRate: 2.4, status: "critical", owner: "Transport Engineering", region: "APAC" },
  { id: "slo-5", service: "Consumer Broadband Backhaul", target: 99.3, attainment: 99.55, errorBudgetRemaining: 82, burnRate: 0.8, status: "healthy", owner: "Consumer Networks", region: "LATAM" },
];

export const serviceReliability: ServiceReliabilityRecord[] = [
  { id: "svc-1", service: "Global Cloud Connect", status: "degraded", customers: 48210, availability: 99.41, region: "APAC", criticalJourney: true },
  { id: "svc-2", service: "Financial Link Service", status: "degraded", customers: 3120, availability: 99.88, region: "EMEA", criticalJourney: true },
  { id: "svc-3", service: "IP Transit Premium", status: "critical", customers: 1240, availability: 99.31, region: "APAC", criticalJourney: false },
  { id: "svc-4", service: "Enterprise Wavelength", status: "healthy", customers: 0, availability: 99.97, region: "EMEA", criticalJourney: true },
  { id: "svc-5", service: "Consumer Broadband Backhaul", status: "healthy", customers: 0, availability: 99.95, region: "LATAM", criticalJourney: false },
];

export const capacitySeries: CapacityPoint[] = [
  { time: "00:00", traffic: 12.4, availableCapacity: 24.1, protectedCapacity: 18.2, predictedDemand: 12.8 },
  { time: "02:00", traffic: 10.8, availableCapacity: 24.1, protectedCapacity: 18.2, predictedDemand: 11.2 },
  { time: "04:00", traffic: 10.1, availableCapacity: 24.1, protectedCapacity: 18.2, predictedDemand: 10.6 },
  { time: "06:00", traffic: 13.6, availableCapacity: 24.1, protectedCapacity: 18.0, predictedDemand: 14.1 },
  { time: "08:00", traffic: 18.7, availableCapacity: 23.4, protectedCapacity: 17.1, predictedDemand: 19.4 },
  { time: "10:00", traffic: 20.2, availableCapacity: 23.4, protectedCapacity: 16.8, predictedDemand: 21.6 },
  { time: "12:00", traffic: 19.4, availableCapacity: 23.4, protectedCapacity: 16.8, predictedDemand: 20.8 },
  { time: "14:00", traffic: 17.9, availableCapacity: 24.1, protectedCapacity: 17.6, predictedDemand: 18.7 },
  { time: "16:00", traffic: 19.8, availableCapacity: 24.1, protectedCapacity: 17.6, predictedDemand: 21.2 },
  { time: "18:00", traffic: 22.1, availableCapacity: 24.1, protectedCapacity: 17.2, predictedDemand: 23.4 },
  { time: "20:00", traffic: 21.3, availableCapacity: 24.1, protectedCapacity: 17.2, predictedDemand: 22.6 },
  { time: "22:00", traffic: 16.4, availableCapacity: 24.1, protectedCapacity: 18.0, predictedDemand: 17.1 },
];

export const CAPACITY_WARNING_TBPS = 19.3;
export const CAPACITY_CRITICAL_TBPS = 21.7;

export const changeRecords: ChangeRecord[] = [
  { id: "chg-1", title: "Amsterdam amplifier firmware upgrade", window: "20 May 22:00 UTC", risk: "medium", predictedSuccess: 94, affectedServices: 3, region: "EMEA" },
  { id: "chg-2", title: "Sydney access ring re-home", window: "21 May 14:00 UTC", risk: "high", predictedSuccess: 78, affectedServices: 6, region: "APAC" },
  { id: "chg-3", title: "Chicago to Atlanta trunk maintenance", window: "20 May 09:30 UTC", risk: "low", predictedSuccess: 98, affectedServices: 2, region: "North America" },
  { id: "chg-4", title: "São Paulo route policy refresh", window: "22 May 03:00 UTC", risk: "low", predictedSuccess: 97, affectedServices: 1, region: "LATAM" },
];

export const learningRecords: LearningRecord[] = [
  { id: "lrn-1", title: "Monsoon margin playbook refined", category: "Post-incident learning", detail: "Margin thresholds tightened for monsoon exposed spans", createdAt: "2026-05-20T07:52:00Z" },
  { id: "lrn-2", title: "Protected path capacity guardrail documented", category: "Knowledge base update", detail: "90% utilisation guardrail added to the APAC corridor article", createdAt: "2026-05-20T08:04:00Z" },
  { id: "lrn-3", title: "Traffic shift runbook shortened", category: "Runbook improvement", detail: "Four manual verification steps replaced with automated assertions", createdAt: "2026-05-20T08:21:00Z" },
  { id: "lrn-4", title: "Weather correlation model retrained", category: "Post-incident learning", detail: "Precision improved from 0.79 to 0.88 on monsoon events", createdAt: "2026-05-19T21:10:00Z" },
];

export const operationalEvents: OperationalEvent[] = [
  { id: "evt-1", timestamp: "2026-05-20T08:42:00Z", event: "Auto remediation progressing", object: "AMS-MUM corridor", agent: "Recovery Agent", result: "Traffic shifted to MUM-SIN", confidence: 0.88, evidence: "27 validation tests running", activityType: "executing", region: "APAC", validationState: "running" },
  { id: "evt-2", timestamp: "2026-05-20T08:41:00Z", event: "Risk mitigated", object: "SIN-SYD", agent: "Prediction Agent", result: "Capacity rebalance recommended", confidence: 0.71, evidence: "Forecast breach at 13:05 UTC", activityType: "recommending", region: "APAC", validationState: "not-started" },
  { id: "evt-3", timestamp: "2026-05-20T08:39:00Z", event: "Investigation update", object: "Situation SIT-2026-0520-01", agent: "Investigation Agent", result: "Root cause confidence raised to 82%", confidence: 0.82, evidence: "156 optical telemetry signals", activityType: "investigating", region: "APAC", validationState: "not-started" },
  { id: "evt-4", timestamp: "2026-05-20T08:37:00Z", event: "Situation escalated", object: "AMS-MUM", agent: "Detection Agent", result: "Severity raised to Critical", confidence: 0.94, evidence: "Bit error rate 2.1e-6", activityType: "observing", region: "EMEA", validationState: "not-started" },
  { id: "evt-5", timestamp: "2026-05-20T08:35:00Z", event: "Anomaly detected", object: "AMS-MUM", agent: "Detection Agent", result: "Link margin drop detected", confidence: 0.9, evidence: "Margin 1.4 dB against 3.0 dB threshold", activityType: "observing", region: "EMEA", validationState: "not-started" },
  { id: "evt-6", timestamp: "2026-05-20T08:28:00Z", event: "Approval requested", object: "SIN-SYD rebalance", agent: "Action Agent", result: "Awaiting APAC reliability lead", confidence: 0.68, evidence: "Predicted breach probability 0.63", activityType: "awaiting-approval", region: "APAC", validationState: "not-started" },
  { id: "evt-7", timestamp: "2026-05-20T08:18:00Z", event: "Validation passed", object: "SAO-LON", agent: "Validation Agent", result: "Post change soak clean", confidence: 0.96, evidence: "18 assertions passed", activityType: "validating", region: "LATAM", validationState: "passed" },
  { id: "evt-8", timestamp: "2026-05-20T08:05:00Z", event: "Learning recorded", object: "Monsoon playbook", agent: "Learning Agent", result: "Runbook updated", confidence: 0.85, evidence: "Post incident review INC-2025-1104", activityType: "learning", region: "APAC", validationState: "not-started" },
];

export const metricSummary = {
  reliability: { attainment: 99.63, target: 99.5, trend30d: 0.13, servicesBelowTarget: 1, errorBudgetRemaining: 61 },
  customerImpact: { customers: 48210, services: 3, criticalJourneys: 2, estimatedDurationMinutes: 42 },
  situations: { critical: 1, major: 1, investigating: 1, mitigating: 1, oldestMinutes: 104 },
  automation: { automatedRecoveries: 24, humanApproved: 18, preventive: 9, validationSuccessRate: 96, rollbackRate: 2.1 },
  predictedRisk: { detected: 128, mitigated: 87, incidentsPrevented: 37, capacityBreachesPrevented: 12, weatherRisksReduced: 21 },
  efficiency: { mttrReduction: 68, toilAvoidedHours: 412, automationRate: 81, costAvoidanceUsd: 2_400_000, engineeringHoursReturned: 1180 },
};
