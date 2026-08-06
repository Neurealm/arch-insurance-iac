/**
 * AIM-006 — synthetic demonstration fixtures.
 *
 * Base fixtures are frozen. Scenario and failure simulations derive new
 * objects and never mutate these records.
 */

import type {
  ComparisonMetric, ComparisonStage, EvidenceItem, ScenarioFailureOption, ScenarioStageDefinition,
  SimilarEvent,
} from "./scenarioTypes";

export const SCENARIO_LINK_ID = "CHN-MBL-041";
export const SYNTHETIC_LABEL = "Synthetic demonstration value";

export const modelOverview = Object.freeze({
  objective:
    "Estimate the probability, timing, customer impact, and preventability of optical-link degradation.",
  targetVariable: "Qualifying optical-link degradation within the selected forecast horizon.",
  horizons: "2, 6, 12 and 24 hours",
  validationStrategy: "Rolling-origin backtesting with regional and seasonal holdout segments",
  outputStructure:
    "Risk score, risk class, confidence, ETA to impact, exposed capacity, exposed services, ranked actions",
  operationalOwner: "Network Operations, Optical Reliability",
  technicalOwner: "Predictive Reliability Engineering",
  deploymentState: "Active, human-governed",
});

export const ensembleComponents = Object.freeze([
  { key: "det", kind: "Deterministic calculation", name: "Link budget and margin computation", detail: "Received power, path loss and reserve margin computed from telemetry." },
  { key: "det2", kind: "Deterministic calculation", name: "Atmospheric attenuation model", detail: "Visibility and humidity converted to expected dB loss over path distance." },
  { key: "stat", kind: "Statistical model", name: "Degradation-rate trend estimator", detail: "Rolling regression over margin decline with seasonal correction." },
  { key: "stat2", kind: "Statistical model", name: "Historical similarity scorer", detail: "Cohort distance against labelled prior degradation events." },
  { key: "rule", kind: "Rule-based engineering constraint", name: "Fallback readiness gate", detail: "RF headroom, latency and loss thresholds must pass before any traffic action." },
  { key: "rule2", kind: "Rule-based engineering constraint", name: "Critical-service policy gate", detail: "Critical customer services require human approval for traffic-path change." },
  { key: "infer", kind: "Model-based inference", name: "Risk and ETA ensemble", detail: "Weighted blend producing the risk score, confidence band and ETA to impact." },
  { key: "human", kind: "Human-governed action decision", name: "Approval and execution", detail: "Network Operations approves, rejects or requests more evidence before execution." },
] as const);

export const currentPrediction = Object.freeze({
  linkId: SCENARIO_LINK_ID,
  riskScore: 0.94,
  riskClass: "High",
  confidencePct: 94,
  eta: "5h 42m",
  capacityExposedGbps: 10,
  servicesExposed: 1,
  primaryDriver: "Fog Attenuation",
  secondaryDrivers: ["Declining link margin", "Rising humidity", "Historical seasonal similarity"],
  fallbackReadiness: "Ready",
  preventability: "High",
  recommendedAction: "Move Priority Traffic",
  approvalRequirement: "Required",
  validationRequirement: "Customer service and SLO validation at each increment",
  rollbackReadiness: "Ready",
});

export const evidenceItems: readonly EvidenceItem[] = Object.freeze([
  {
    id: "EV-001", category: "Weather Evidence", source: "Regional forecast provider A",
    observation: "Visibility forecast falls from 8.6 km to 1.8 km", value: "1.8", unit: "km",
    timestamp: "2026-08-05T21:40:00Z", freshness: "current", reliability: "high", relevance: 0.94,
    stance: "supports", interpretation: "Visibility below 2 km drives fog attenuation above the link reserve margin.",
    provenance: "Forecast run 21:00Z, ingested 21:04Z, quality checks passed",
    relatedFeature: "visibility-distance-ratio", relatedHypothesis: "Fog attenuation", relatedSignal: "wx.visibility.forecast",
  },
  {
    id: "EV-002", category: "Weather Evidence", source: "Regional forecast provider B",
    observation: "Fog probability rises to 88%", value: "88", unit: "%",
    timestamp: "2026-08-05T21:38:00Z", freshness: "current", reliability: "high", relevance: 0.91,
    stance: "supports", interpretation: "Two independent providers agree on fog formation within the horizon.",
    provenance: "Provider B ensemble mean, 12-member run",
    relatedFeature: "atmospheric-attenuation-index", relatedHypothesis: "Fog attenuation", relatedSignal: "wx.fog.probability",
  },
  {
    id: "EV-003", category: "Weather Evidence", source: "Chennai site weather station",
    observation: "Relative humidity rises to 94%", value: "94", unit: "%",
    timestamp: "2026-08-05T21:36:00Z", freshness: "recent", reliability: "medium", relevance: 0.78,
    stance: "supports", interpretation: "Near-saturation humidity is consistent with imminent fog formation.",
    provenance: "Local sensor, 4-minute reporting delay",
    relatedFeature: "atmospheric-attenuation-index", relatedHypothesis: "Fog attenuation", relatedSignal: "wx.humidity.local",
  },
  {
    id: "EV-004", category: "Optical Evidence", source: "Link telemetry",
    observation: "Link margin declines to 3.7 dB", value: "3.7", unit: "dB",
    timestamp: "2026-08-05T21:42:00Z", freshness: "current", reliability: "high", relevance: 0.96,
    stance: "supports", interpretation: "Reserve margin is below the 4.5 dB engineering comfort band for this distance.",
    provenance: "Terminal telemetry stream, 30-second cadence",
    relatedFeature: "optical-reserve-margin", relatedHypothesis: "Fog attenuation", relatedSignal: "opt.link.margin",
  },
  {
    id: "EV-005", category: "Optical Evidence", source: "Link telemetry",
    observation: "Optical attenuation rises to 5.8 dB", value: "5.8", unit: "dB",
    timestamp: "2026-08-05T21:42:00Z", freshness: "current", reliability: "high", relevance: 0.93,
    stance: "supports", interpretation: "Attenuation growth rate matches the modelled fog onset curve.",
    provenance: "Terminal telemetry stream, 30-second cadence",
    relatedFeature: "atmospheric-attenuation-index", relatedHypothesis: "Fog attenuation", relatedSignal: "opt.link.attenuation",
  },
  {
    id: "EV-006", category: "Optical Evidence", source: "Link telemetry",
    observation: "Received optical power falls to -28.4 dBm", value: "-28.4", unit: "dBm",
    timestamp: "2026-08-05T21:41:00Z", freshness: "current", reliability: "high", relevance: 0.9,
    stance: "supports", interpretation: "Received power is trending toward the -32 dBm qualifying degradation threshold.",
    provenance: "Terminal telemetry stream, 30-second cadence",
    relatedFeature: "optical-reserve-margin", relatedHypothesis: "Fog attenuation", relatedSignal: "opt.rx.power",
  },
  {
    id: "EV-007", category: "Historical Evidence", source: "Similar-event library",
    observation: "Historical similarity score is 0.88", value: "0.88", unit: "score",
    timestamp: "2026-08-05T21:43:00Z", freshness: "current", reliability: "medium", relevance: 0.85,
    stance: "supports", interpretation: "Signature closely matches three labelled Chennai seasonal fog events.",
    provenance: "Cohort match over 41 labelled events, 2024 to 2026",
    relatedFeature: "historical-similarity-score", relatedHypothesis: "Fog attenuation", relatedSignal: "hist.cohort.match",
  },
  {
    id: "EV-008", category: "Fallback Evidence", source: "RF fallback controller",
    observation: "RF fallback headroom is 42%", value: "42", unit: "%",
    timestamp: "2026-08-05T21:39:00Z", freshness: "current", reliability: "high", relevance: 0.88,
    stance: "supports", interpretation: "Headroom is sufficient to carry the exposed 10 Gbps priority traffic.",
    provenance: "Fallback capacity probe, validated 21:39Z",
    relatedFeature: "fallback-readiness", relatedHypothesis: "Preventable with traffic move", relatedSignal: "rf.headroom",
  },
  {
    id: "EV-009", category: "Terminal Evidence", source: "Terminal health service",
    observation: "Terminal health remains normal", value: "Normal", unit: "state",
    timestamp: "2026-08-05T21:42:00Z", freshness: "current", reliability: "high", relevance: 0.72,
    stance: "contradicts", interpretation: "Normal terminal health reduces the likelihood of a hardware cause.",
    provenance: "Terminal self-test, last run 21:30Z",
    relatedFeature: "terminal-health-index", relatedHypothesis: "Hardware fault", relatedSignal: "term.health",
  },
  {
    id: "EV-010", category: "Terminal Evidence", source: "Beam control service",
    observation: "Beam alignment remains stable", value: "0.02", unit: "mrad drift",
    timestamp: "2026-08-05T21:41:00Z", freshness: "current", reliability: "high", relevance: 0.7,
    stance: "contradicts", interpretation: "Stable alignment argues against pointing or tracking degradation.",
    provenance: "Beam control telemetry, 10-second cadence",
    relatedFeature: "beam-alignment-stability", relatedHypothesis: "Alignment drift", relatedSignal: "term.beam.drift",
  },
  {
    id: "EV-011", category: "Network Evidence", source: "Routing telemetry",
    observation: "Routing and handoffs remain healthy", value: "0", unit: "flaps",
    timestamp: "2026-08-05T21:40:00Z", freshness: "current", reliability: "high", relevance: 0.64,
    stance: "contradicts", interpretation: "No routing instability, so the cause is not a network-layer event.",
    provenance: "Route reflector telemetry, 1-minute cadence",
    relatedFeature: "multi-signal-correlation", relatedHypothesis: "Network fault", relatedSignal: "net.route.flaps",
  },
  {
    id: "EV-012", category: "Network Evidence", source: "Change management",
    observation: "No firmware-change correlation exists", value: "0", unit: "changes",
    timestamp: "2026-08-05T21:20:00Z", freshness: "recent", reliability: "high", relevance: 0.58,
    stance: "contradicts", interpretation: "No firmware or configuration change in the correlation window.",
    provenance: "Change record query, 72-hour window",
    relatedFeature: "change-correlation", relatedHypothesis: "Change-induced fault", relatedSignal: "chg.records",
  },
  {
    id: "EV-013", category: "Customer and SLO Evidence", source: "Service health service",
    observation: "One critical customer service is exposed", value: "1", unit: "service",
    timestamp: "2026-08-05T21:43:00Z", freshness: "current", reliability: "high", relevance: 0.95,
    stance: "supports", interpretation: "A critical-tier service rides the exposed 10 Gbps path.",
    provenance: "Service topology mapping, refreshed 21:43Z",
    relatedFeature: "customer-exposure", relatedHypothesis: "Customer impact", relatedSignal: "svc.exposure",
  },
  {
    id: "EV-014", category: "Customer and SLO Evidence", source: "SLO service",
    observation: "Error budget remaining is 68%", value: "68", unit: "%",
    timestamp: "2026-08-05T21:43:00Z", freshness: "current", reliability: "high", relevance: 0.8,
    stance: "supports", interpretation: "An unmitigated 45-minute degradation would consume roughly a third of the budget.",
    provenance: "SLO ledger, current 30-day window",
    relatedFeature: "error-budget", relatedHypothesis: "Customer impact", relatedSignal: "slo.budget",
  },
  {
    id: "EV-015", category: "Data Quality", source: "Ingest quality service",
    observation: "Forecast-provider disagreement remains below 7%", value: "6.2", unit: "%",
    timestamp: "2026-08-05T21:40:00Z", freshness: "current", reliability: "medium", relevance: 0.6,
    stance: "neutral", interpretation: "Provider spread is within the acceptable band but is not zero.",
    provenance: "Cross-provider variance check",
    relatedFeature: "forecast-agreement", relatedHypothesis: "Forecast uncertainty", relatedSignal: "wx.provider.variance",
  },
  {
    id: "EV-016", category: "Remaining Uncertainty", source: "Chennai site weather station",
    observation: "Local site sensor has a 4-minute delay", value: "4", unit: "minutes",
    timestamp: "2026-08-05T21:36:00Z", freshness: "recent", reliability: "medium", relevance: 0.44,
    stance: "neutral", interpretation: "Local humidity readings lag the forecast by one reporting interval.",
    provenance: "Ingest latency monitor",
    relatedFeature: "data-freshness", relatedHypothesis: "Forecast uncertainty", relatedSignal: "wx.humidity.local",
  },
  {
    id: "EV-017", category: "Remaining Uncertainty", source: "Similar-event library",
    observation: "Similar Beam cohort history is limited", value: "6", unit: "events",
    timestamp: "2026-08-05T21:43:00Z", freshness: "current", reliability: "low", relevance: 0.4,
    stance: "neutral", interpretation: "Cohort support for this product variant is thinner than the regional average.",
    provenance: "Cohort coverage report",
    relatedFeature: "historical-similarity-score", relatedHypothesis: "Cohort coverage", relatedSignal: "hist.cohort.coverage",
  },
  {
    id: "EV-018", category: "Historical Evidence", source: "Runbook outcomes",
    observation: "Prior priority-traffic moves succeeded in 9 of 10 cases", value: "90", unit: "%",
    timestamp: "2026-08-05T21:43:00Z", freshness: "current", reliability: "medium", relevance: 0.75,
    stance: "supports", interpretation: "The recommended action has strong historical effectiveness on this route type.",
    provenance: "Runbook outcome ledger",
    relatedFeature: "action-effectiveness", relatedHypothesis: "Preventable with traffic move", relatedSignal: "rb.outcomes",
  },
] as const);

export const similarEvents: readonly SimilarEvent[] = Object.freeze([
  {
    id: "SE-001", name: "Chennai Seasonal Fog Event", region: "India South", product: "Lightbridge Terminal",
    linkDistanceKm: 7.4, primaryDriver: "Fog attenuation",
    environmentalSignature: "Visibility 8.4 km to 1.6 km over 5 hours, humidity 93%",
    opticalSignature: "Margin 8.9 dB to 3.2 dB, attenuation +5.4 dB", similarity: 0.92, predictionScore: 0.91,
    actualOutcome: "Degradation occurred as predicted", customerImpact: "None, traffic pre-moved",
    actionTaken: "Move Priority Traffic", recoveryResult: "Optical restored in 68 minutes",
    predictionAccuracy: "Correct", evidenceQuality: "High",
    operationalLesson: "Early priority-traffic move fully protected the critical service.",
  },
  {
    id: "SE-002", name: "Mumbai Visibility Degradation", region: "India West", product: "Metro Backhaul",
    linkDistanceKm: 5.1, primaryDriver: "Fog attenuation",
    environmentalSignature: "Visibility 9.2 km to 2.4 km over 3 hours",
    opticalSignature: "Margin 9.6 dB to 4.4 dB, attenuation +4.1 dB", similarity: 0.84, predictionScore: 0.79,
    actualOutcome: "Partial degradation", customerImpact: "4 minutes of elevated latency",
    actionTaken: "Monitor Closely then partial move", recoveryResult: "Optical restored in 41 minutes",
    predictionAccuracy: "Correct, late action", evidenceQuality: "Medium",
    operationalLesson: "Delaying the move until breach cost four minutes of customer impact.",
  },
  {
    id: "SE-003", name: "Nairobi Heavy Rain Event", region: "Africa East", product: "Lightbridge Terminal",
    linkDistanceKm: 6.2, primaryDriver: "Rain attenuation",
    environmentalSignature: "Rain rate 48 mm/h, visibility 4.1 km",
    opticalSignature: "Margin 10.1 dB to 5.0 dB, attenuation +3.8 dB", similarity: 0.71, predictionScore: 0.74,
    actualOutcome: "Degradation occurred", customerImpact: "None", actionTaken: "Move Priority Traffic",
    recoveryResult: "Optical restored in 22 minutes", predictionAccuracy: "Correct", evidenceQuality: "High",
    operationalLesson: "Rain events recover faster than fog, so return criteria can be tightened.",
  },
  {
    id: "SE-004", name: "Gulf of Guinea Rain Attenuation", region: "Africa West", product: "Metro Backhaul",
    linkDistanceKm: 8.8, primaryDriver: "Rain attenuation",
    environmentalSignature: "Rain rate 61 mm/h, sustained 90 minutes",
    opticalSignature: "Margin 7.8 dB to 2.9 dB, attenuation +6.2 dB", similarity: 0.66, predictionScore: 0.83,
    actualOutcome: "Degradation occurred", customerImpact: "None", actionTaken: "Move All Traffic",
    recoveryResult: "Optical restored in 95 minutes", predictionAccuracy: "Correct, over-mitigated",
    evidenceQuality: "Medium",
    operationalLesson: "Moving all traffic was unnecessary; priority-only would have sufficed.",
  },
  {
    id: "SE-005", name: "Rio High-Humidity Event", region: "Americas", product: "Enterprise Access",
    linkDistanceKm: 4.3, primaryDriver: "Humidity and haze",
    environmentalSignature: "Humidity 96%, visibility 5.8 km",
    opticalSignature: "Margin 11.2 dB to 8.7 dB, attenuation +1.9 dB", similarity: 0.52, predictionScore: 0.62,
    actualOutcome: "No qualifying degradation", customerImpact: "None", actionTaken: "Monitor Closely",
    recoveryResult: "Not required", predictionAccuracy: "False positive", evidenceQuality: "Medium",
    operationalLesson: "Humidity alone without visibility collapse rarely qualifies as degradation.",
  },
  {
    id: "SE-006", name: "Mumbai Alignment Drift Event", region: "India West", product: "Lightbridge Terminal",
    linkDistanceKm: 6.7, primaryDriver: "Beam alignment drift",
    environmentalSignature: "Clear conditions, visibility 12 km",
    opticalSignature: "Margin 9.4 dB to 3.1 dB with stable attenuation", similarity: 0.31, predictionScore: 0.68,
    actualOutcome: "Degradation occurred", customerImpact: "11 minutes degraded",
    actionTaken: "Reacquire Beam", recoveryResult: "Restored after reacquisition",
    predictionAccuracy: "Correct, different cause", evidenceQuality: "High",
    operationalLesson: "Margin decline without attenuation growth indicates alignment, not weather.",
  },
] as const);

export const comparisonStages: readonly ComparisonStage[] = Object.freeze([
  {
    key: "detection", stage: "Detection",
    traditional: "Threshold breach or alarm after degradation begins",
    agentic: "Risk identified before expected customer impact",
    systemsInvolved: "Optical NMS, alarm manager, predictive risk service",
    engineeringOwner: "Network Operations",
    operationalRisk: "Detection after impact leaves no preventive window",
    customerEffect: "Customer experiences degradation before the operator reacts",
    evidenceCreated: "Alarm record versus a timestamped risk prediction with confidence",
    modernizationRequirement: "Streaming telemetry and forecast ingestion with horizon scoring",
  },
  {
    key: "evidence", stage: "Evidence Assembly",
    traditional: "Engineer opens multiple systems manually",
    agentic: "Evidence package assembled automatically",
    systemsInvolved: "Weather, optical, terminal, routing, service and change systems",
    engineeringOwner: "Optical Reliability Engineering",
    operationalRisk: "Manual assembly is slow and inconsistent between engineers",
    customerEffect: "Longer time before any protective decision is possible",
    evidenceCreated: "Structured evidence index with provenance, freshness and stance",
    modernizationRequirement: "Cross-domain evidence schema and provenance capture",
  },
  {
    key: "correlation", stage: "Cross-Domain Correlation",
    traditional: "Dependent on individual expertise",
    agentic: "Optical, weather, network, service, and historical context",
    systemsInvolved: "Correlation service and similar-event library",
    engineeringOwner: "Predictive Reliability Engineering",
    operationalRisk: "Cause elimination varies with who is on shift",
    customerEffect: "Inconsistent diagnosis quality across incidents",
    evidenceCreated: "Supporting, contradicting and missing evidence classification",
    modernizationRequirement: "Labelled historical event cohort with similarity scoring",
  },
  {
    key: "impact", stage: "Customer-Impact Calculation",
    traditional: "Calculated after service degradation or incident creation",
    agentic: "Calculated before action",
    systemsInvolved: "Service topology, SLO ledger, customer registry",
    engineeringOwner: "Service Reliability",
    operationalRisk: "Actions taken without knowing who is affected",
    customerEffect: "Impact is discovered by the customer first",
    evidenceCreated: "Exposed services, capacity and error-budget projection",
    modernizationRequirement: "Live service-to-path mapping with SLO linkage",
  },
  {
    key: "fallback", stage: "Fallback Validation",
    traditional: "Separate manual activity",
    agentic: "Capacity and service readiness checked before recommendation",
    systemsInvolved: "RF fallback controller, capacity probe",
    engineeringOwner: "Transport Engineering",
    operationalRisk: "Traffic moved onto a path that cannot carry it",
    customerEffect: "Mitigation itself can cause an outage",
    evidenceCreated: "Headroom, latency, loss and last-validation record",
    modernizationRequirement: "Automated pre-action fallback readiness probe",
  },
  {
    key: "recommendation", stage: "Recommendation",
    traditional: "Runbook or engineer judgment",
    agentic: "Ranked by outcome, risk, policy, and reversibility",
    systemsInvolved: "Recommendation engine, runbook ledger",
    engineeringOwner: "Network Operations",
    operationalRisk: "Chosen action may not be the lowest-risk option",
    customerEffect: "Over-mitigation or under-mitigation of customer traffic",
    evidenceCreated: "Ranked action set with rationale and reversibility flags",
    modernizationRequirement: "Outcome-weighted action ranking with policy inputs",
  },
  {
    key: "approval", stage: "Approval",
    traditional: "Manual coordination",
    agentic: "Embedded human-governed workflow",
    systemsInvolved: "Policy engine, approval workflow",
    engineeringOwner: "Network Operations management",
    operationalRisk: "Approval delay consumes the preventive window",
    customerEffect: "Protective action arrives after impact begins",
    evidenceCreated: "Policy evaluation, approver identity and decision record",
    modernizationRequirement: "Policy-as-configuration with in-context approval",
  },
  {
    key: "execution", stage: "Execution",
    traditional: "Separate tools and teams",
    agentic: "Controlled, incremental, and auditable",
    systemsInvolved: "Traffic controller, RF fallback controller",
    engineeringOwner: "Transport Engineering",
    operationalRisk: "Large single-step changes with weak rollback",
    customerEffect: "Change-induced disruption during mitigation",
    evidenceCreated: "Preflight results, increment records and rollback readiness",
    modernizationRequirement: "Incremental execution with validation gates",
  },
  {
    key: "validation", stage: "Validation",
    traditional: "Often device focused",
    agentic: "Customer service and SLO focused",
    systemsInvolved: "Service health, SLO service, synthetic probes",
    engineeringOwner: "Service Reliability",
    operationalRisk: "Device recovery declared while the service is still degraded",
    customerEffect: "Customer-visible degradation persists after closure",
    evidenceCreated: "Per-increment throughput, latency and loss validation",
    modernizationRequirement: "Service-level validation embedded in the action path",
  },
  {
    key: "learning", stage: "Learning",
    traditional: "Incident notes and postmortem",
    agentic: "Outcome updates model, rules, runbooks, and operational knowledge",
    systemsInvolved: "Lifecycle governance, similar-event library, runbook ledger",
    engineeringOwner: "Predictive Reliability Engineering",
    operationalRisk: "Lessons stay in documents nobody reads",
    customerEffect: "The same failure recurs unchanged",
    evidenceCreated: "Proposed lifecycle updates with review and approval states",
    modernizationRequirement: "Governed feedback loop from outcome to model lifecycle",
  },
] as const);

export const comparisonMetrics: readonly ComparisonMetric[] = Object.freeze([
  { key: "detect", label: "Time to detect", traditional: "After impact", agentic: "5h 42m before expected impact" },
  { key: "assemble", label: "Time to assemble evidence", traditional: "35 minutes", agentic: "Under 2 minutes" },
  { key: "impact", label: "Time to estimate impact", traditional: "20 minutes", agentic: "Under 30 seconds" },
  { key: "recommend", label: "Time to recommendation", traditional: "15 minutes", agentic: "Under 1 minute" },
  { key: "approve", label: "Time to approval", traditional: "18 minutes", agentic: "Under 4 minutes" },
  { key: "mitigate", label: "Time to mitigation", traditional: "62 minutes", agentic: "Under 9 minutes" },
  { key: "completeness", label: "Evidence completeness", traditional: "62%", agentic: "98%" },
  { key: "impact-minutes", label: "Customer-impact minutes", traditional: "45", agentic: "0" },
  { key: "handoffs", label: "Manual handoffs", traditional: "6", agentic: "2" },
  { key: "audit", label: "Audit completeness", traditional: "54%", agentic: "100%" },
] as const);

export const scenarioStages: readonly ScenarioStageDefinition[] = Object.freeze([
  {
    index: 1, key: "baseline", title: "Baseline", actor: "Link Health Agent", focus: "map",
    summary: "All Chennai links healthy and no action required.",
    state: ["All Chennai links healthy", "Customer service healthy", "RF fallback ready but inactive", "Model risk below threshold", "No action required"],
  },
  {
    index: 2, key: "weather", title: "Weather Forecast Update", actor: "Weather Risk Agent", focus: "pipeline",
    summary: "Visibility forecast declines and the Weather Risk Agent becomes active.",
    state: ["Visibility forecast declines", "Fog probability rises", "Weather-provider agreement remains high", "Data-quality checks pass", "Weather Risk Agent becomes active"],
  },
  {
    index: 3, key: "optical", title: "Optical Trend Change", actor: "Optical Path Investigator", focus: "pipeline",
    summary: "Optical trend turns negative while terminal health stays normal.",
    state: ["Link margin begins declining", "Optical attenuation rises", "Received optical power falls", "Beam lock remains stable", "Terminal health remains normal", "Hardware cause becomes less likely"],
  },
  {
    index: 4, key: "anomaly", title: "Anomaly Detected", actor: "Link Health Agent", focus: "analytics",
    summary: "Baseline deviation exceeds threshold and CHN-MBL-041 becomes the primary risk.",
    state: ["Baseline deviation exceeds threshold", "Degradation rate rises", "Six links enter watch", "Three links enter high risk", "CHN-MBL-041 becomes primary risk"],
  },
  {
    index: 5, key: "risk", title: "Risk Prediction", actor: "Recommendation Engine", focus: "analytics",
    summary: "Risk reaches 0.94 with 94% confidence and a 5h 42m ETA.",
    state: ["Risk score reaches 0.94", "Confidence reaches 94%", "ETA becomes 5h 42m", "Fog attenuation becomes leading cause", "Customer impact remains preventable"],
  },
  {
    index: 6, key: "impact", title: "Customer Impact Calculation", actor: "Customer Impact Agent", focus: "analytics",
    summary: "One critical service and 10 Gbps of capacity are exposed.",
    state: ["One critical customer service exposed", "10 Gbps capacity exposed", "Three downstream clusters identified", "SLO exposure elevated", "Error-budget risk calculated"],
  },
  {
    index: 7, key: "fallback", title: "Fallback Validation", actor: "RF Fallback Guardian", focus: "evidence",
    summary: "RF fallback is validated with 42% headroom and a ready rollback path.",
    state: ["RF path available", "Headroom 42%", "Latency acceptable", "Packet loss acceptable", "Last validation current", "Rollback path ready"],
  },
  {
    index: 8, key: "recommendation", title: "Recommendation", actor: "Recommendation Engine", focus: "analytics",
    summary: "Move Priority Traffic becomes the top-ranked action.",
    state: ["Move Priority Traffic becomes top-ranked action", "Monitor Closely remains alternative", "Move All Traffic is higher risk", "Reacquire Beam is not yet justified", "Recommendation confidence is high"],
  },
  {
    index: 9, key: "policy", title: "Policy and Approval", actor: "Policy Engine", focus: "governance",
    summary: "Critical-service policy requires Network Operations approval.",
    state: ["Traffic-path change classified as governed action", "Critical service policy applies", "Network Operations approval required", "Evidence package complete", "Approval control enabled"],
  },
  {
    index: 10, key: "execution", title: "Controlled Execution", actor: "Recovery Orchestrator", focus: "map",
    summary: "Priority traffic moves to RF incrementally with rollback ready.",
    state: ["Preflight checks pass", "25% of priority traffic moves to RF", "Customer service validates", "Remaining approved traffic moves", "Optical route remains under observation", "Rollback remains ready"],
  },
  {
    index: 11, key: "protected", title: "Customer Service Protected", actor: "Validation Agent", focus: "outcome",
    summary: "Customer service stays within every objective through the action.",
    state: ["Service remains available", "Throughput remains within objective", "Latency remains within objective", "Packet loss remains within objective", "No customer-impact incident is opened", "Error budget is preserved"],
  },
  {
    index: 12, key: "degradation", title: "Predicted Degradation Occurs", actor: "Link Health Agent", focus: "map",
    summary: "The optical route degrades as forecast while traffic stays protected.",
    state: ["Optical route degrades as forecast", "Customer traffic remains protected", "Prediction is classified as correct", "Preventive action is classified as effective", "No emergency action is required"],
  },
  {
    index: 13, key: "recovery", title: "Optical Recovery", actor: "Recovery Orchestrator", focus: "map",
    summary: "Conditions improve and return-to-optical criteria are evaluated.",
    state: ["Visibility improves", "Link margin recovers", "Attenuation declines", "Optical route enters recovering state", "Customer traffic remains on fallback", "Return-to-optical criteria are evaluated"],
  },
  {
    index: 14, key: "restoration", title: "Traffic Restoration", actor: "Recovery Orchestrator", focus: "map",
    summary: "Traffic returns incrementally and RF fallback becomes inactive.",
    state: ["Optical health passes validation", "Traffic returns incrementally", "Customer service validates", "RF fallback becomes inactive", "Rollback remains available until completion"],
  },
  {
    index: 15, key: "learning", title: "Outcome and Learning", actor: "Learning Agent", focus: "outcome",
    summary: "The outcome is recorded as reusable operational knowledge.",
    state: ["Customer service remained healthy", "10 Gbps protected", "Outage minutes avoided", "Prediction accuracy updated", "Similar-event library updated", "Runbook outcome updated", "Model activity updated", "Evidence package closed", "Operational knowledge recorded"],
  },
] as const);

export const APPROVAL_STAGE_INDEX = 9;
export const EXECUTION_STAGE_INDEX = 10;

export const failureOptions: readonly ScenarioFailureOption[] = Object.freeze([
  { key: "none", label: "No simulation (default successful scenario)", effects: ["Default successful predictive protection scenario."] },
  {
    key: "stale-weather", label: "Stale Weather Data",
    effects: ["Weather freshness declines", "Confidence decreases", "Autonomy level reduces", "Additional evidence required", "Recommendation remains advisory", "Scenario pauses before approval"],
  },
  {
    key: "missing-telemetry", label: "Missing Terminal Telemetry",
    effects: ["Terminal evidence becomes incomplete", "Hardware cause cannot be fully eliminated", "Confidence decreases", "Diagnostics become recommended", "Traffic action may require additional approval"],
  },
  {
    key: "conflicting-forecasts", label: "Conflicting Weather Forecasts",
    effects: ["Source agreement decreases", "Confidence decreases", "ETA range widens", "Risk remains visible", "Additional observation becomes recommended"],
  },
  {
    key: "insufficient-fallback", label: "Insufficient RF Fallback Capacity",
    effects: ["Fallback readiness fails", "Move Priority Traffic is demoted or blocked", "Alternative route or capacity action becomes recommended", "Customer-risk status increases", "Policy blocks execution"],
  },
  {
    key: "validation-failure", label: "Execution Validation Failure",
    effects: ["Traffic movement pauses", "Customer validation fails", "Rollback triggers", "Traffic returns to optical or previous state", "Timeline records failed action", "Human escalation required"],
  },
  {
    key: "false-positive", label: "False Positive",
    effects: ["Predicted degradation does not occur", "Preventive action outcome is reviewed", "False-positive rate updates", "Learning event is recorded", "Threshold review becomes recommended"],
  },
  {
    key: "missed-event", label: "Missed Event",
    effects: ["A degradation event occurs without sufficient prediction", "Model gap is recorded", "Governance review opens", "Retraining recommendation updates", "Similar-event library updates", "Model status changes to Review"],
  },
  {
    key: "successful-protection", label: "Successful Protection",
    effects: ["Complete normal scenario", "Customer remains healthy", "Prediction is validated", "Preventive action is effective", "Outcome metrics update"],
  },
] as const);

export const performanceNorms = Object.freeze([
  { key: "confidence", label: "Confidence is 4.8 percentage points above the model median" },
  { key: "warning", label: "Warning time is 42 minutes above median" },
  { key: "support", label: "Historical support is stronger than 81% of current high-risk predictions" },
  { key: "quality", label: "Data quality is in the top quartile" },
]);

export const approvalRationale = Object.freeze([
  "Critical customer service",
  "10 Gbps capacity",
  "Active traffic-path change",
  "Reversible action",
  "RF fallback validated",
  "Human approval required by policy",
]);

export const limitations = Object.freeze([
  "Predictions are probabilistic",
  "Confidence decreases when data is stale",
  "Rare conditions may have limited support",
  "Forecast disagreement increases uncertainty",
  "New product cohorts may have limited historical evidence",
  "Model output does not replace native protection systems",
  "Customer traffic movement requires operational validation",
  "High-impact actions require human approval",
  "Similarity does not prove causality",
  "Engineering judgment remains required",
  "Synthetic demonstration logic differs from production implementation",
  "Production thresholds require Taara validation",
]);

export const evidenceCategories: readonly string[] = Object.freeze([
  "Weather Evidence", "Optical Evidence", "Terminal Evidence", "Network Evidence",
  "Customer and SLO Evidence", "Historical Evidence", "Fallback Evidence", "Data Quality",
  "Contradicting Evidence", "Remaining Uncertainty",
]);
