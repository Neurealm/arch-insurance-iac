/**
 * Agentic Investigation Workspace — page-specific synthetic demonstration data.
 *
 * ALL values are fabricated for demonstration purposes only and are NOT
 * measured Taara results. Customers, services, links, terminals, regions,
 * products, weather, agents and situation identifiers are reused from
 * ./goocFixtures, ./cshFixtures, ./plrFixtures and ./situationFixtures so every
 * Agentic SRE NOC page keeps the same identifiers. This module contains no
 * React so it can later be swapped for live investigation telemetry.
 */

import { agents, links } from "./goocFixtures";
import { customerServices } from "./cshFixtures";
import {
  SITUATION_ID, situationHeader, situationSeries, terminalHealth, weatherContext,
} from "./situationFixtures";

/* ------------------------------- identity -------------------------------- */

export const INVESTIGATION_ID = "INV-2026-0417-A";

const chennaiLink = links.find((l) => l.id === situationHeader.linkId);
const chennaiService = customerServices.find((s) => s.id === situationHeader.serviceId);

export const investigationHeader = {
  id: INVESTIGATION_ID,
  situationId: SITUATION_ID,
  situationTitle: situationHeader.title,
  customer: situationHeader.customer,
  serviceId: situationHeader.serviceId,
  serviceName: chennaiService?.name ?? situationHeader.serviceName,
  linkId: situationHeader.linkId,
  linkName: chennaiLink?.name ?? situationHeader.linkName,
  product: situationHeader.product,
  region: situationHeader.region,
  state: "Validation in progress" as InvestigationState,
  stateLabel: "Leading Cause Identified, Validation in Progress",
  leadingCause: "Atmospheric attenuation caused by dense fog",
  leadingConfidence: 94,
  owner: "M. Dorai, SRE Investigation Owner",
  agentsParticipating: 8,
  evidenceReviewed: 47,
  causesUnderInvestigation: 2,
  causesEliminated: 5,
  openTasks: 3,
  lastEvidenceUpdate: "11:04:22 UTC",
  dataConfidence: "94% evidence completeness",
  conclusionReadiness: 92,
};

/** Other synthetic situations selectable from the command header. */
export const selectableSituations = [
  { id: SITUATION_ID, label: `${SITUATION_ID} · Chennai Mobile Backhaul Service Degradation` },
  { id: "SIT-2026-0402", label: "SIT-2026-0402 · Mumbai Coastal Link Margin Watch" },
  { id: "SIT-2026-0388", label: "SIT-2026-0388 · Nairobi Rain Fade Advisory" },
] as const;

export const investigationParticipants = [
  "M. Dorai, SRE Investigation Owner",
  "R. Venkatesan, Duty Incident Commander",
  "S. Krishnan, Optical Engineering",
  "N. Iyer, Network Operations",
  "A. Rahman, Customer Operations",
];

/* ---------------------------- investigation state ------------------------ */

export const INVESTIGATION_STATES = [
  "Initiated",
  "Evidence collection",
  "Hypotheses generated",
  "Hypotheses ranked",
  "Causes being tested",
  "Leading cause identified",
  "Validation in progress",
  "Ready to conclude",
  "Conclusion approved",
  "Investigation closed",
  "Reopened",
] as const;
export type InvestigationState = (typeof INVESTIGATION_STATES)[number];

export interface InvestigationStateStage {
  state: InvestigationState;
  enteredAt: string;
  duration: string;
  owner: string;
  requiredEvidence: string;
  exitCriteria: string;
  blockers: string;
}

export const investigationStateStages: InvestigationStateStage[] = [
  { state: "Initiated", enteredAt: "10:42:06 UTC", duration: "8 s", owner: "Incident Commander Agent", requiredEvidence: "Situation record and affected service", exitCriteria: "Service, link and terminals identified", blockers: "None" },
  { state: "Evidence collection", enteredAt: "10:42:14 UTC", duration: "42 s", owner: "Optical Path Investigator", requiredEvidence: "Optical, terminal, network, weather, change and customer telemetry", exitCriteria: "All six domains returned data", blockers: "None" },
  { state: "Hypotheses generated", enteredAt: "10:42:56 UTC", duration: "18 s", owner: "Incident Knowledge Agent", requiredEvidence: "Historical cause patterns for optical spans", exitCriteria: "At least five candidate causes proposed", blockers: "None" },
  { state: "Hypotheses ranked", enteredAt: "10:43:14 UTC", duration: "26 s", owner: "Incident Commander Agent", requiredEvidence: "Signal alignment per candidate cause", exitCriteria: "Every hypothesis has a confidence score", blockers: "None" },
  { state: "Causes being tested", enteredAt: "10:43:40 UTC", duration: "1 m 34 s", owner: "Terminal Health Agent", requiredEvidence: "Validation test results per hypothesis", exitCriteria: "Each hypothesis validated or eliminated", blockers: "None" },
  { state: "Leading cause identified", enteredAt: "10:45:14 UTC", duration: "34 s", owner: "Weather Risk Agent", requiredEvidence: "Cross-domain correlation of visibility and attenuation", exitCriteria: "Leading confidence above 90 percent", blockers: "None" },
  { state: "Validation in progress", enteredAt: "10:45:48 UTC", duration: "19 m 12 s", owner: "M. Dorai, SRE", requiredEvidence: "Sustained margin recovery and environmental validation", exitCriteria: "All conclusion readiness checks pass", blockers: "Two validation checks remain" },
  { state: "Ready to conclude", enteredAt: "Pending", duration: "—", owner: "M. Dorai, SRE", requiredEvidence: "Complete evidence package", exitCriteria: "Human reviewer accepts the conclusion", blockers: "Awaiting sustained recovery window" },
  { state: "Conclusion approved", enteredAt: "Pending", duration: "—", owner: "R. Venkatesan, Incident Commander", requiredEvidence: "Signed conclusion record", exitCriteria: "Conclusion published to the situation", blockers: "Conclusion not yet proposed for approval" },
  { state: "Investigation closed", enteredAt: "Pending", duration: "—", owner: "Incident Commander Agent", requiredEvidence: "Knowledge record retained", exitCriteria: "Investigation archived", blockers: "Conclusion not approved" },
  { state: "Reopened", enteredAt: "Not entered", duration: "—", owner: "M. Dorai, SRE", requiredEvidence: "New contradicting evidence", exitCriteria: "New hypothesis evaluated", blockers: "Not applicable" },
];

/* ------------------------------- KPI cards -------------------------------- */

export interface InvestigationKpi {
  id: string;
  title: string;
  value: string;
  sub: string;
  status: "good" | "watch" | "risk" | "neutral";
  trend: "up" | "down" | "flat";
  previous: string;
  target: string;
  at: string;
  explain: string;
}

export const investigationKpis: InvestigationKpi[] = [
  { id: "kpi-confidence", title: "Leading Cause Confidence", value: "94%", sub: "Atmospheric attenuation caused by dense fog", status: "good", trend: "up", previous: "88%", target: "90%", at: "11:04:22 UTC", explain: "Confidence in the highest ranked cause after cross-domain correlation." },
  { id: "kpi-evidence", title: "Evidence Reviewed", value: "47", sub: "Across six operational domains", status: "good", trend: "up", previous: "39", target: "45", at: "11:04:22 UTC", explain: "Distinct evidence records assembled by the investigating agents." },
  { id: "kpi-hypotheses", title: "Hypotheses Evaluated", value: "8", sub: "One leading, two monitoring, five eliminated", status: "neutral", trend: "flat", previous: "8", target: "8", at: "11:03:10 UTC", explain: "Candidate causes generated and scored during this investigation." },
  { id: "kpi-eliminated", title: "Causes Eliminated", value: "5", sub: "Hardware, alignment, network, power, software", status: "good", trend: "up", previous: "3", target: "5", at: "11:02:40 UTC", explain: "Causes ruled out with explicit contradicting evidence." },
  { id: "kpi-time", title: "Investigation Time", value: "3m 42s", sub: "From situation creation to leading cause", status: "good", trend: "down", previous: "9m 05s", target: "5m 00s", at: "10:45:48 UTC", explain: "Elapsed time from situation creation to a ranked leading cause." },
  { id: "kpi-services", title: "Customer Services Analyzed", value: "1", sub: "10 Gbps mobile backhaul service", status: "neutral", trend: "flat", previous: "1", target: "1", at: "11:03:41 UTC", explain: "Customer services included in the impact analysis for this investigation." },
  { id: "kpi-tasks", title: "Agent Tasks Completed", value: "31", sub: "Seven agents working in parallel", status: "good", trend: "up", previous: "24", target: "30", at: "11:04:05 UTC", explain: "Investigation tasks completed by digital coworkers." },
  { id: "kpi-readiness", title: "Conclusion Readiness", value: "92%", sub: "Two validation checks remain", status: "watch", trend: "up", previous: "78%", target: "100%", at: "11:04:22 UTC", explain: "Share of conclusion readiness checks currently passing." },
];

/* ---------------------------- cause hypotheses ---------------------------- */

export const HYPOTHESIS_STATUSES = ["Leading Cause", "Monitoring", "Testing", "Eliminated"] as const;
export type HypothesisStatus = (typeof HYPOTHESIS_STATUSES)[number];

export interface CauseHypothesis {
  id: string;
  cause: string;
  confidence: number;
  status: HypothesisStatus;
  supporting: string[];
  contradicting: string[];
  agents: string[];
  lastEvaluated: string;
  requiredValidation: string;
  customerRelevance: string;
  sloRelevance: string;
  nextTest: string;
  domain: EvidenceDomain;
  confidenceHistory: { at: string; value: number }[];
  description: string;
  components: string[];
  evidenceCompleteness: number;
  remainingUncertainty: string;
  recommendedAction: string;
}

export const causeHypotheses: CauseHypothesis[] = [
  {
    id: "hyp-fog",
    cause: "Atmospheric attenuation caused by dense fog",
    confidence: 94,
    status: "Leading Cause",
    domain: "Environmental",
    description:
      "Rapidly increasing coastal fog density raised atmospheric attenuation on the 2.6 km Chennai span, reducing received optical power and link margin until throughput degraded.",
    supporting: [
      "Visibility declined rapidly from 9.6 km to 1.4 km.",
      "Fog density increased from 0.05 to 0.41 g/m3.",
      "Relative humidity increased from 74 to 94 percent.",
      "Optical attenuation increased from 1.1 dB to 7.3 dB.",
      "Received optical power declined by 4.1 dB.",
      "Link margin declined below the 6 dB preventive threshold.",
      "Throughput degradation followed the weather change with a four minute lag.",
      "Similar prior fog incidents show the same signal pattern.",
    ],
    contradicting: ["None material."],
    agents: ["Weather Risk Agent", "Optical Path Investigator", "Incident Knowledge Agent"],
    lastEvaluated: "11:04:10 UTC",
    requiredValidation: "Sustained link margin recovery as visibility improves",
    customerRelevance: "Explains the full 1.4 Gbps throughput reduction on the customer service",
    sloRelevance: "Accounts for 3.4 percent monthly error budget consumption",
    nextTest: "Environmental cause validation across the recovery window",
    confidenceHistory: [
      { at: "10:43", value: 31 }, { at: "10:44", value: 58 }, { at: "10:45", value: 79 },
      { at: "10:50", value: 88 }, { at: "11:00", value: 92 }, { at: "11:04", value: 94 },
    ],
    components: ["lnk-chennai-041", "term-chennai-a", "term-chennai-b", "Chennai coastal weather cell"],
    evidenceCompleteness: 94,
    remainingUncertainty: "Fog dispersal timing remains a forecast, not an observation.",
    recommendedAction: "Maintain RF fallback until visibility and link margin meet the return-to-optical threshold.",
  },
  {
    id: "hyp-hardware",
    cause: "Optical terminal hardware degradation",
    confidence: 8,
    status: "Eliminated",
    domain: "Terminal",
    description: "A progressive optical transmit or receive hardware fault on one of the two terminals.",
    supporting: ["Received optical power declined."],
    contradicting: [
      "Both terminals remain available.",
      "Power is stable.",
      "Internal temperatures are normal.",
      "No hardware alarms exist.",
      "Similar nearby links show environmental degradation.",
      "Performance begins recovering as visibility improves.",
    ],
    agents: ["Terminal Health Agent", "Optical Path Investigator"],
    lastEvaluated: "11:01:55 UTC",
    requiredValidation: "Terminal health validation on both endpoints",
    customerRelevance: "Would require a field visit and extended customer impact",
    sloRelevance: "Would create sustained availability risk",
    nextTest: "Re-run terminal health validation if recovery does not follow visibility",
    confidenceHistory: [
      { at: "10:43", value: 46 }, { at: "10:44", value: 38 }, { at: "10:45", value: 22 },
      { at: "10:50", value: 14 }, { at: "11:00", value: 9 }, { at: "11:04", value: 8 },
    ],
    components: ["term-chennai-a", "term-chennai-b"],
    evidenceCompleteness: 96,
    remainingUncertainty: "None material for this incident.",
    recommendedAction: "Keep eliminated unless recovery diverges from the environmental profile.",
  },
  {
    id: "hyp-alignment",
    cause: "Beam alignment drift",
    confidence: 6,
    status: "Eliminated",
    domain: "Optical",
    description: "Gradual pointing drift reducing coupled optical power at one or both terminals.",
    supporting: ["Link margin declined."],
    contradicting: [
      "Pointing error remains stable at 0.02 mrad.",
      "Tracking correction rate remains normal.",
      "No increase in reacquisition attempts.",
      "Alignment confidence remains high.",
    ],
    agents: ["Optical Path Investigator", "Terminal Health Agent"],
    lastEvaluated: "11:00:38 UTC",
    requiredValidation: "Beam alignment validation on both terminals",
    customerRelevance: "Would require recalibration and repeated service interruption",
    sloRelevance: "Would repeat across future weather-independent periods",
    nextTest: "Compare pointing error against the 30 day baseline",
    confidenceHistory: [
      { at: "10:43", value: 34 }, { at: "10:44", value: 24 }, { at: "10:45", value: 12 },
      { at: "10:50", value: 8 }, { at: "11:00", value: 6 }, { at: "11:04", value: 6 },
    ],
    components: ["term-chennai-a", "term-chennai-b"],
    evidenceCompleteness: 92,
    remainingUncertainty: "None material for this incident.",
    recommendedAction: "Keep eliminated; retain alignment telemetry in the evidence package.",
  },
  {
    id: "hyp-vibration",
    cause: "Mounting vibration or structural movement",
    confidence: 4,
    status: "Eliminated",
    domain: "Terminal",
    description: "Wind or structural movement on the rooftop mast destabilising the optical path.",
    supporting: ["Wind increased slightly."],
    contradicting: [
      "Structural vibration remains normal at 0.18 g.",
      "Wind is below the local operating threshold.",
      "Pointing error remains stable.",
      "The mounting inspection is current.",
    ],
    agents: ["Terminal Health Agent"],
    lastEvaluated: "10:59:14 UTC",
    requiredValidation: "Mounting stability validation",
    customerRelevance: "Would require structural remediation at the Guindy site",
    sloRelevance: "Would create recurring availability risk in monsoon season",
    nextTest: "Compare vibration spectra against the seasonal baseline",
    confidenceHistory: [
      { at: "10:43", value: 22 }, { at: "10:44", value: 15 }, { at: "10:45", value: 8 },
      { at: "10:50", value: 5 }, { at: "11:00", value: 4 }, { at: "11:04", value: 4 },
    ],
    components: ["term-chennai-a", "Chennai Guindy rooftop mast 2"],
    evidenceCompleteness: 90,
    remainingUncertainty: "None material for this incident.",
    recommendedAction: "Keep eliminated; no structural action required.",
  },
  {
    id: "hyp-handoff",
    cause: "Upstream or downstream network handoff degradation",
    confidence: 3,
    status: "Eliminated",
    domain: "Network",
    description: "Partner aggregation, fiber handoff or customer edge degradation reducing delivered throughput.",
    supporting: ["Customer throughput declined."],
    contradicting: [
      "Interfaces remain available.",
      "No port errors are detected.",
      "Routing adjacencies remain healthy.",
      "Packet loss is localized to the optical path period.",
      "The RF fallback route delivers expected performance.",
    ],
    agents: ["Network Path Agent", "Customer Impact Agent"],
    lastEvaluated: "10:58:12 UTC",
    requiredValidation: "Upstream and downstream path validation",
    customerRelevance: "Would require partner escalation and joint troubleshooting",
    sloRelevance: "Would move accountability outside the Taara service boundary",
    nextTest: "Re-validate partner handoff counters after recovery",
    confidenceHistory: [
      { at: "10:43", value: 28 }, { at: "10:44", value: 18 }, { at: "10:45", value: 9 },
      { at: "10:50", value: 5 }, { at: "11:00", value: 3 }, { at: "11:04", value: 3 },
    ],
    components: ["n-partner", "n-handoff", "n-regional", "e-primary"],
    evidenceCompleteness: 93,
    remainingUncertainty: "None material for this incident.",
    recommendedAction: "Keep eliminated; share validation record with the partner owner.",
  },
  {
    id: "hyp-firmware",
    cause: "Firmware or software regression",
    confidence: 2,
    status: "Eliminated",
    domain: "Software and Change",
    description: "A regression introduced by the Lightbridge Pro 4.8.2 firmware deployment seven days earlier.",
    supporting: ["A firmware update occurred seven days earlier."],
    contradicting: [
      "No fleet-wide pattern is present.",
      "Similar terminals on the same release are healthy.",
      "No restart, resource, or beam acquisition anomaly exists.",
      "Degradation aligns with weather onset, not the deployment.",
    ],
    agents: ["Change Risk Agent", "Terminal Health Agent"],
    lastEvaluated: "10:57:30 UTC",
    requiredValidation: "Firmware cohort comparison across the regional fleet",
    customerRelevance: "Would require a fleet-wide rollback affecting many customers",
    sloRelevance: "Would create multi-service error budget exposure",
    nextTest: "Re-run cohort comparison if a second span degrades without fog",
    confidenceHistory: [
      { at: "10:43", value: 19 }, { at: "10:44", value: 12 }, { at: "10:45", value: 6 },
      { at: "10:50", value: 3 }, { at: "11:00", value: 2 }, { at: "11:04", value: 2 },
    ],
    components: ["LB-Pro 4.8.2", "term-chennai-a", "term-chennai-b"],
    evidenceCompleteness: 91,
    remainingUncertainty: "None material for this incident.",
    recommendedAction: "Keep eliminated; no rollback required.",
  },
  {
    id: "hyp-power",
    cause: "Terminal power instability",
    confidence: 2,
    status: "Eliminated",
    domain: "Terminal",
    description: "Utility or battery instability at the remote site causing intermittent terminal behaviour.",
    supporting: ["Remote site power is a known dependency."],
    contradicting: [
      "Voltage remains stable at 48.1 V and 47.9 V.",
      "No terminal resets occurred.",
      "Backup power remains available.",
      "No power events align with the degradation.",
    ],
    agents: ["Terminal Health Agent"],
    lastEvaluated: "10:56:02 UTC",
    requiredValidation: "Power state validation at both sites",
    customerRelevance: "Would require site power remediation",
    sloRelevance: "Would create unpredictable availability risk",
    nextTest: "Re-check battery and generator telemetry after recovery",
    confidenceHistory: [
      { at: "10:43", value: 17 }, { at: "10:44", value: 10 }, { at: "10:45", value: 5 },
      { at: "10:50", value: 3 }, { at: "11:00", value: 2 }, { at: "11:04", value: 2 },
    ],
    components: ["Chennai Guindy Rooftop A", "Chennai Perungudi Aggregation B"],
    evidenceCompleteness: 89,
    remainingUncertainty: "None material for this incident.",
    recommendedAction: "Keep eliminated; power dependencies remain stable.",
  },
  {
    id: "hyp-demand",
    cause: "Unexpected customer capacity demand",
    confidence: 12,
    status: "Monitoring",
    domain: "Customer and SLO",
    description: "A customer traffic surge exceeding available route capacity during the same window.",
    supporting: ["Traffic demand increased during the same period."],
    contradicting: [
      "Available capacity remained sufficient before attenuation increased.",
      "Throughput declined despite remaining route headroom.",
      "RF fallback carried the traffic successfully.",
    ],
    agents: ["Customer Impact Agent", "SLO Guardian"],
    lastEvaluated: "11:03:41 UTC",
    requiredValidation: "Capacity headroom comparison before and during the event",
    customerRelevance: "Would require a capacity policy conversation with the customer",
    sloRelevance: "Would change the error budget attribution",
    nextTest: "Compare demand profile against the 14 day weekday baseline",
    confidenceHistory: [
      { at: "10:43", value: 24 }, { at: "10:44", value: 20 }, { at: "10:45", value: 16 },
      { at: "10:50", value: 14 }, { at: "11:00", value: 13 }, { at: "11:04", value: 12 },
    ],
    components: ["csvc-chennai-041", "n-customer", "n-edge"],
    evidenceCompleteness: 84,
    remainingUncertainty: "Demand remains slightly above baseline and is still being tracked.",
    recommendedAction: "Continue monitoring demand until the optical route is restored.",
  },
];

export const causeStatement =
  "The available evidence indicates that rapidly increasing fog density caused atmospheric attenuation, reducing received optical power and link margin. Terminal, alignment, mounting, power, software, and network handoff evidence does not support an equipment or network failure.";

/* ------------------------ cross-domain evidence --------------------------- */

export const EVIDENCE_DOMAINS = [
  "Optical", "Terminal", "Network", "Environmental", "Software and Change", "Customer and SLO",
] as const;
export type EvidenceDomain = (typeof EVIDENCE_DOMAINS)[number];

export interface DomainSignal {
  id: string;
  domain: EvidenceDomain;
  signal: string;
  value: string;
  baseline: string;
  change: string;
  at: string;
  source: string;
  relation: "Supports" | "Contradicts" | "Neutral";
  hypothesisId: string;
  seriesKey?: string;
  note: string;
}

export const domainSignals: DomainSignal[] = [
  /* Optical */
  { id: "sig-rx", domain: "Optical", signal: "Received optical power", value: "-28.1 dBm", baseline: "-24.0 dBm", change: "-4.1 dB", at: "11:04:12 UTC", source: "Link performance service", relation: "Supports", hypothesisId: "hyp-fog", seriesKey: "rxPower", note: "Decline tracks visibility with a four minute lag." },
  { id: "sig-tx", domain: "Optical", signal: "Transmit optical power", value: "+12.6 dBm", baseline: "+12.5 dBm", change: "Stable", at: "11:04:12 UTC", source: "Terminal telemetry", relation: "Contradicts", hypothesisId: "hyp-hardware", note: "Transmit power unchanged, inconsistent with transmitter degradation." },
  { id: "sig-margin", domain: "Optical", signal: "Link margin", value: "3.7 dB", baseline: "9.4 dB", change: "-5.7 dB", at: "11:04:12 UTC", source: "Link performance service", relation: "Supports", hypothesisId: "hyp-fog", seriesKey: "marginA", note: "Fell below the 6 dB preventive threshold at 10:41 UTC." },
  { id: "sig-atten", domain: "Optical", signal: "Optical attenuation", value: "7.3 dB", baseline: "1.1 dB", change: "+6.2 dB", at: "11:04:12 UTC", source: "Link performance service", relation: "Supports", hypothesisId: "hyp-fog", seriesKey: "attenuation", note: "Attenuation rise matches the modelled fog attenuation curve." },
  { id: "sig-lock", domain: "Optical", signal: "Beam lock", value: "Locked since 06:00 UTC", baseline: "Locked", change: "No change", at: "11:04:12 UTC", source: "Terminal telemetry", relation: "Contradicts", hypothesisId: "hyp-alignment", note: "Continuous lock excludes acquisition loss." },
  { id: "sig-point", domain: "Optical", signal: "Pointing error", value: "0.03 mrad", baseline: "0.02 mrad", change: "Within tolerance", at: "11:04:12 UTC", source: "Terminal telemetry", relation: "Contradicts", hypothesisId: "hyp-alignment", seriesKey: "pointingError", note: "No drift trend across the degradation window." },
  { id: "sig-track", domain: "Optical", signal: "Tracking correction rate", value: "1.4 per minute", baseline: "1.1 per minute", change: "+0.3", at: "11:04:12 UTC", source: "Terminal telemetry", relation: "Neutral", hypothesisId: "hyp-alignment", seriesKey: "trackingRate", note: "Marginal increase consistent with scintillation, not drift." },
  { id: "sig-reacq", domain: "Optical", signal: "Reacquisition attempts", value: "0", baseline: "0", change: "No change", at: "11:04:12 UTC", source: "Terminal telemetry", relation: "Contradicts", hypothesisId: "hyp-alignment", seriesKey: "reacquisitions", note: "No reacquisition events during the event." },

  /* Terminal */
  { id: "sig-avail", domain: "Terminal", signal: "Terminal availability", value: "100 percent in 24 h", baseline: "100 percent", change: "No change", at: "11:04:12 UTC", source: "Terminal health service", relation: "Contradicts", hypothesisId: "hyp-hardware", note: "Neither terminal dropped from service." },
  { id: "sig-temp", domain: "Terminal", signal: "Internal temperature", value: "42.6 C", baseline: "41.8 C", change: "+0.8 C", at: "11:04:12 UTC", source: "Terminal health service", relation: "Contradicts", hypothesisId: "hyp-hardware", note: "Well inside the 65 C operating envelope." },
  { id: "sig-cpu", domain: "Terminal", signal: "CPU utilization", value: "22 percent", baseline: "21 percent", change: "+1 point", at: "11:04:12 UTC", source: "Terminal health service", relation: "Contradicts", hypothesisId: "hyp-firmware", note: "No processing anomaly after the firmware deployment." },
  { id: "sig-mem", domain: "Terminal", signal: "Memory utilization", value: "48 percent", baseline: "47 percent", change: "+1 point", at: "11:04:12 UTC", source: "Terminal health service", relation: "Contradicts", hypothesisId: "hyp-firmware", note: "No memory growth trend across seven days." },
  { id: "sig-power", domain: "Terminal", signal: "Power state", value: "Utility, battery 100 percent", baseline: "Utility", change: "No change", at: "11:04:12 UTC", source: "Site power telemetry", relation: "Contradicts", hypothesisId: "hyp-power", note: "No transfer to battery occurred." },
  { id: "sig-volt", domain: "Terminal", signal: "Voltage stability", value: "47.9 V", baseline: "48.0 V", change: "-0.1 V", at: "11:04:12 UTC", source: "Site power telemetry", relation: "Contradicts", hypothesisId: "hyp-power", note: "Variation inside the 1 V stability band." },
  { id: "sig-vib", domain: "Terminal", signal: "Mounting vibration", value: "0.21 g", baseline: "0.19 g", change: "+0.02 g", at: "11:04:12 UTC", source: "Structural telemetry", relation: "Contradicts", hypothesisId: "hyp-vibration", note: "Tolerance is 0.35 g." },
  { id: "sig-drift", domain: "Terminal", signal: "Configuration drift", value: "None detected", baseline: "None", change: "No change", at: "11:04:12 UTC", source: "Configuration service", relation: "Contradicts", hypothesisId: "hyp-firmware", note: "Both terminals match the approved baseline." },
  { id: "sig-fresh", domain: "Terminal", signal: "Telemetry freshness", value: "14 s", baseline: "15 s", change: "Fresh", at: "11:04:12 UTC", source: "Telemetry pipeline", relation: "Neutral", hypothesisId: "hyp-fog", note: "Evidence is current for all terminal signals." },

  /* Network */
  { id: "sig-iface", domain: "Network", signal: "Interface state", value: "All up", baseline: "All up", change: "No change", at: "11:03:50 UTC", source: "Network telemetry", relation: "Contradicts", hypothesisId: "hyp-handoff", note: "No interface transitions in the last 24 hours." },
  { id: "sig-iferr", domain: "Network", signal: "Interface errors", value: "0 errors", baseline: "0 errors", change: "No change", at: "11:03:50 UTC", source: "Network telemetry", relation: "Contradicts", hypothesisId: "hyp-handoff", note: "Clean counters on partner and customer handoffs." },
  { id: "sig-route", domain: "Network", signal: "Routing state", value: "All adjacencies established", baseline: "Established", change: "No change", at: "11:03:50 UTC", source: "Routing telemetry", relation: "Contradicts", hypothesisId: "hyp-handoff", note: "No route flaps recorded." },
  { id: "sig-thr", domain: "Network", signal: "Throughput", value: "8.6 Gbps", baseline: "9.8 Gbps", change: "-1.2 Gbps", at: "11:03:41 UTC", source: "Service delivery telemetry", relation: "Supports", hypothesisId: "hyp-fog", seriesKey: "throughput", note: "Decline begins after attenuation crosses 4 dB." },
  { id: "sig-lat", domain: "Network", signal: "Latency", value: "5.6 ms", baseline: "4.2 ms", change: "+1.4 ms", at: "11:03:41 UTC", source: "Service delivery telemetry", relation: "Neutral", hypothesisId: "hyp-fog", seriesKey: "latency", note: "Increase attributable to the RF fallback path." },
  { id: "sig-loss", domain: "Network", signal: "Packet loss", value: "0.008 percent", baseline: "0.010 percent", change: "Improved", at: "11:03:41 UTC", source: "Service delivery telemetry", relation: "Contradicts", hypothesisId: "hyp-handoff", seriesKey: "packetLoss", note: "Loss localized to the optical path window only." },
  { id: "sig-handoff", domain: "Network", signal: "Network handoff state", value: "Healthy", baseline: "Healthy", change: "No change", at: "10:58:12 UTC", source: "Service dependency graph", relation: "Contradicts", hypothesisId: "hyp-handoff", note: "Partner aggregation validated at 10:47 UTC." },
  { id: "sig-rf", domain: "Network", signal: "RF fallback performance", value: "3.1 Gbps at 7.8 ms", baseline: "6 Gbps usable", change: "48 percent headroom", at: "11:04:20 UTC", source: "Fallback readiness service", relation: "Contradicts", hypothesisId: "hyp-handoff", note: "Fallback delivers expected performance end to end." },
  { id: "sig-head", domain: "Network", signal: "Capacity headroom", value: "38 percent", baseline: "42 percent", change: "-4 points", at: "11:03:50 UTC", source: "Capacity service", relation: "Contradicts", hypothesisId: "hyp-demand", note: "Headroom remained available throughout the event." },

  /* Environmental */
  { id: "sig-vis", domain: "Environmental", signal: "Visibility", value: "1.4 km", baseline: "9.6 km", change: "-8.2 km", at: "11:04:10 UTC", source: "Synthetic regional weather forecast", relation: "Supports", hypothesisId: "hyp-fog", seriesKey: "visibility", note: "Steepest decline between 10:35 and 10:50 UTC." },
  { id: "sig-fog", domain: "Environmental", signal: "Fog density", value: "0.41 g/m3", baseline: "0.05 g/m3", change: "+0.36 g/m3", at: "11:04:10 UTC", source: "Synthetic regional weather forecast", relation: "Supports", hypothesisId: "hyp-fog", seriesKey: "fogDensity", note: "Above the 0.30 g/m3 high attenuation threshold." },
  { id: "sig-hum", domain: "Environmental", signal: "Relative humidity", value: "94 percent", baseline: "74 percent", change: "+20 points", at: "11:04:10 UTC", source: "Synthetic regional weather forecast", relation: "Supports", hypothesisId: "hyp-fog", seriesKey: "humidity", note: "Consistent with coastal advection fog." },
  { id: "sig-rain", domain: "Environmental", signal: "Rainfall", value: "0.0 mm/h", baseline: "0.0 mm/h", change: "No change", at: "11:04:10 UTC", source: "Synthetic regional weather forecast", relation: "Neutral", hypothesisId: "hyp-fog", seriesKey: "rainfall", note: "Rain fade excluded as a contributing mechanism." },
  { id: "sig-wind", domain: "Environmental", signal: "Wind speed", value: "9 km/h", baseline: "8 km/h", change: "+1 km/h", at: "11:04:10 UTC", source: "Synthetic regional weather forecast", relation: "Contradicts", hypothesisId: "hyp-vibration", seriesKey: "windSpeed", note: "Below the 45 km/h structural operating threshold." },
  { id: "sig-dir", domain: "Environmental", signal: "Wind direction", value: "East north east", baseline: "East", change: "Onshore", at: "11:04:10 UTC", source: "Synthetic regional weather forecast", relation: "Supports", hypothesisId: "hyp-fog", note: "Onshore flow carries marine moisture across the span." },
  { id: "sig-tmp", domain: "Environmental", signal: "Temperature", value: "26.9 C", baseline: "28.4 C", change: "-1.5 C", at: "11:04:10 UTC", source: "Synthetic regional weather forecast", relation: "Supports", hypothesisId: "hyp-fog", seriesKey: "temperature", note: "Cooling toward the dew point supports fog formation." },
  { id: "sig-risk", domain: "Environmental", signal: "Atmospheric risk", value: "High attenuation risk", baseline: "Low", change: "Escalated", at: "11:04:10 UTC", source: "Weather Risk Agent", relation: "Supports", hypothesisId: "hyp-fog", note: "Risk escalated 12 minutes before margin crossed the threshold." },

  /* Software and Change */
  { id: "sig-fw", domain: "Software and Change", signal: "Firmware version", value: "LB-Pro 4.8.2 on both terminals", baseline: "LB-Pro 4.8.2", change: "No change", at: "10:44:00 UTC", source: "Configuration service", relation: "Contradicts", hypothesisId: "hyp-firmware", note: "Matches the approved regional release." },
  { id: "sig-fwdep", domain: "Software and Change", signal: "Recent firmware deployment", value: "7 days ago, successful", baseline: "Quarterly cadence", change: "Completed", at: "7 days ago", source: "Change service", relation: "Supports", hypothesisId: "hyp-firmware", note: "Only supporting signal for the firmware hypothesis." },
  { id: "sig-cfg", domain: "Software and Change", signal: "Configuration changes", value: "None in 14 days on the link", baseline: "None", change: "No change", at: "11:04:00 UTC", source: "Configuration service", relation: "Contradicts", hypothesisId: "hyp-firmware", note: "Link configuration untouched during the window." },
  { id: "sig-restart", domain: "Software and Change", signal: "Restart history", value: "No restarts in 30 days", baseline: "No restarts", change: "No change", at: "11:04:00 UTC", source: "Terminal health service", relation: "Contradicts", hypothesisId: "hyp-firmware", note: "Excludes crash-loop and watchdog behaviour." },
  { id: "sig-res", domain: "Software and Change", signal: "Resource anomalies", value: "None detected", baseline: "None", change: "No change", at: "11:04:00 UTC", source: "Terminal health service", relation: "Contradicts", hypothesisId: "hyp-firmware", note: "CPU and memory flat across the release window." },
  { id: "sig-known", domain: "Software and Change", signal: "Known software issues", value: "No open issues for 4.8.2", baseline: "None", change: "No change", at: "11:04:00 UTC", source: "Knowledge service", relation: "Contradicts", hypothesisId: "hyp-firmware", note: "No advisory affects optical power reporting." },
  { id: "sig-chg", domain: "Software and Change", signal: "Change success status", value: "4 of 4 changes successful", baseline: "Successful", change: "No change", at: "11:04:00 UTC", source: "Change service", relation: "Contradicts", hypothesisId: "hyp-firmware", note: "All recent changes completed without rollback." },
  { id: "sig-fleet", domain: "Software and Change", signal: "Similar fleet behavior", value: "36 of 36 peers healthy", baseline: "Healthy", change: "No change", at: "11:02:10 UTC", source: "Change Risk Agent", relation: "Contradicts", hypothesisId: "hyp-firmware", note: "No fleet-wide regression pattern on the same release." },

  /* Customer and SLO */
  { id: "sig-commit", domain: "Customer and SLO", signal: "Committed capacity", value: "10 Gbps", baseline: "10 Gbps", change: "No change", at: "11:03:41 UTC", source: "Service catalogue", relation: "Neutral", hypothesisId: "hyp-demand", note: "Contract capacity for the mobile backhaul service." },
  { id: "sig-deliv", domain: "Customer and SLO", signal: "Delivered throughput", value: "8.6 Gbps", baseline: "9.8 Gbps", change: "-1.2 Gbps", at: "11:03:41 UTC", source: "Service delivery telemetry", relation: "Supports", hypothesisId: "hyp-fog", note: "Reduction begins after the attenuation increase." },
  { id: "sig-savail", domain: "Customer and SLO", signal: "Availability", value: "Service available", baseline: "Available", change: "No change", at: "11:03:41 UTC", source: "Service delivery telemetry", relation: "Contradicts", hypothesisId: "hyp-hardware", note: "No outage occurred at any point." },
  { id: "sig-slat", domain: "Customer and SLO", signal: "Latency", value: "5.6 ms", baseline: "4.2 ms", change: "+1.4 ms", at: "11:03:41 UTC", source: "Service delivery telemetry", relation: "Neutral", hypothesisId: "hyp-fog", note: "Within the 12 ms customer objective." },
  { id: "sig-sloss", domain: "Customer and SLO", signal: "Packet loss", value: "0.008 percent", baseline: "0.010 percent", change: "Improved", at: "11:03:41 UTC", source: "Service delivery telemetry", relation: "Neutral", hypothesisId: "hyp-fog", note: "Loss objective maintained throughout." },
  { id: "sig-budget", domain: "Customer and SLO", signal: "Error budget", value: "3.4 percent consumed this month", baseline: "1.1 percent", change: "+2.3 points", at: "11:03:00 UTC", source: "SLO Guardian", relation: "Supports", hypothesisId: "hyp-fog", note: "Burn attributable to the degradation window." },
  { id: "sig-impact", domain: "Customer and SLO", signal: "Customer impact", value: "42,000 synthetic downstream users", baseline: "None", change: "Moderate", at: "11:03:41 UTC", source: "Customer Impact Agent", relation: "Supports", hypothesisId: "hyp-fog", note: "Best effort classes see reduced capacity." },
  { id: "sig-fbtraf", domain: "Customer and SLO", signal: "Fallback traffic", value: "3.1 Gbps on RF fallback", baseline: "0 Gbps", change: "Activated", at: "11:04:20 UTC", source: "Fallback readiness service", relation: "Contradicts", hypothesisId: "hyp-demand", note: "Fallback absorbed priority demand successfully." },
  { id: "sig-down", domain: "Customer and SLO", signal: "Downstream service effect", value: "34 tower clusters degraded", baseline: "None", change: "Moderate", at: "11:03:41 UTC", source: "Customer Impact Agent", relation: "Supports", hypothesisId: "hyp-fog", note: "No tower cluster lost service." },
];

/* ---------------------- optical and terminal findings --------------------- */

export const opticalFindings = [
  "Both terminals remain operational.",
  "No power instability is detected.",
  "No excessive terminal temperature is detected.",
  "No configuration drift is detected.",
  "No alignment drift is detected.",
  "No mounting vibration anomaly is detected.",
  "Optical attenuation increased during the visibility decline.",
  "Received optical power and link margin declined together.",
];

export interface ValidationTest {
  id: string;
  name: string;
  scope: string;
  hypothesisId: string;
  result: "Passed" | "Failed" | "Inconclusive" | "Not run";
  detail: string;
  runBy: string;
  at: string;
}

export const validationTests: ValidationTest[] = [
  { id: "vt-terminal", name: "Terminal health validation", scope: "term-chennai-a, term-chennai-b", hypothesisId: "hyp-hardware", result: "Passed", detail: "No hardware fault. Availability, temperature, voltage and beam lock nominal on both terminals.", runBy: "Terminal Health Agent", at: "11:01:55 UTC" },
  { id: "vt-align", name: "Beam alignment validation", scope: "term-chennai-a, term-chennai-b", hypothesisId: "hyp-alignment", result: "Passed", detail: "Pointing error 0.02 to 0.03 mrad with no drift trend and zero reacquisitions.", runBy: "Optical Path Investigator", at: "11:00:38 UTC" },
  { id: "vt-mount", name: "Mounting stability validation", scope: "Chennai Guindy rooftop mast 2", hypothesisId: "hyp-vibration", result: "Passed", detail: "Vibration 0.18 to 0.21 g against a 0.35 g tolerance with current inspection record.", runBy: "Terminal Health Agent", at: "10:59:14 UTC" },
  { id: "vt-network", name: "Upstream and downstream path validation", scope: "n-partner to n-downstream", hypothesisId: "hyp-handoff", result: "Passed", detail: "All interfaces up, zero errors, adjacencies established, 38 percent headroom.", runBy: "Network Path Agent", at: "10:58:12 UTC" },
  { id: "vt-cohort", name: "Firmware cohort comparison", scope: "36 regional Lightbridge Pro terminals", hypothesisId: "hyp-firmware", result: "Passed", detail: "No peer on LB-Pro 4.8.2 shows comparable degradation without weather.", runBy: "Change Risk Agent", at: "10:57:30 UTC" },
  { id: "vt-power", name: "Power state validation", scope: "Both Chennai sites", hypothesisId: "hyp-power", result: "Passed", detail: "Voltage stable, no transfers, backup reserves intact.", runBy: "Terminal Health Agent", at: "10:56:02 UTC" },
  { id: "vt-env", name: "Environmental cause validation", scope: "Chennai coastal weather cell", hypothesisId: "hyp-fog", result: "Passed", detail: "Visibility, fog density and attenuation correlate at 0.94 across the event window.", runBy: "Weather Risk Agent", at: "11:04:10 UTC" },
  { id: "vt-recovery", name: "Sustained recovery validation", scope: "lnk-chennai-041", hypothesisId: "hyp-fog", result: "Not run", detail: "Requires link margin above 8.5 dB for 15 continuous minutes.", runBy: "Global Link Health Agent", at: "Pending" },
  { id: "vt-demand", name: "Capacity headroom comparison", scope: "csvc-chennai-041", hypothesisId: "hyp-demand", result: "Inconclusive", detail: "Demand remains 6 percent above the weekday baseline and is still being tracked.", runBy: "Customer Impact Agent", at: "11:03:41 UTC" },
];

/* ------------------------- network path investigation --------------------- */

export interface RouteSegmentEvidence {
  nodeId: string;
  segment: string;
  interfaceState: string;
  routingState: string;
  capacity: string;
  throughput: string;
  latency: string;
  packetLoss: string;
  errors: string;
  owner: string;
  activeChanges: string;
  incidents: string;
  finding: string;
  health: "Healthy" | "At risk" | "Degraded";
}

export const routeSegmentEvidence: RouteSegmentEvidence[] = [
  { nodeId: "n-customer", segment: "Customer network", interfaceState: "Up", routingState: "Established", capacity: "10 Gbps", throughput: "8.6 Gbps", latency: "0.3 ms", packetLoss: "0.000 percent", errors: "0", owner: "Customer operations", activeChanges: "None", incidents: "None", finding: "Customer network is healthy and not contributing.", health: "Healthy" },
  { nodeId: "n-edge", segment: "Customer edge", interfaceState: "Up", routingState: "Established", capacity: "10 Gbps", throughput: "8.6 Gbps", latency: "0.4 ms", packetLoss: "0.000 percent", errors: "0", owner: "Customer operations", activeChanges: "None", incidents: "None", finding: "Edge counters clean throughout the event.", health: "Healthy" },
  { nodeId: "n-partner", segment: "Partner aggregation", interfaceState: "Up", routingState: "Established", capacity: "20 Gbps", throughput: "8.6 Gbps", latency: "1.1 ms", packetLoss: "0.001 percent", errors: "0", owner: "Coastal Transit Partners", activeChanges: "Maintenance completed 12 h earlier", incidents: "None", finding: "Partner maintenance completed successfully before degradation.", health: "Healthy" },
  { nodeId: "n-handoff", segment: "Fiber handoff", interfaceState: "Up", routingState: "Established", capacity: "20 Gbps", throughput: "8.6 Gbps", latency: "0.6 ms", packetLoss: "0.000 percent", errors: "0", owner: "Coastal Transit Partners", activeChanges: "None", incidents: "None", finding: "Fiber handoff validated at 10:47 UTC.", health: "Healthy" },
  { nodeId: "n-terminal-a", segment: "Terminal A", interfaceState: "Up", routingState: "Not applicable", capacity: "10 Gbps", throughput: "5.5 Gbps optical", latency: "0.1 ms", packetLoss: "0.002 percent", errors: "0", owner: "Taara operations", activeChanges: "None", incidents: SITUATION_ID, finding: "Terminal healthy, optical span attenuated.", health: "At risk" },
  { nodeId: "n-terminal-b", segment: "Terminal B", interfaceState: "Up", routingState: "Not applicable", capacity: "10 Gbps", throughput: "5.5 Gbps optical", latency: "0.1 ms", packetLoss: "0.002 percent", errors: "0", owner: "Taara operations", activeChanges: "None", incidents: SITUATION_ID, finding: "Terminal healthy, optical span attenuated.", health: "At risk" },
  { nodeId: "n-regional", segment: "Regional aggregation", interfaceState: "Up", routingState: "Established", capacity: "20 Gbps", throughput: "8.6 Gbps", latency: "1.6 ms", packetLoss: "0.001 percent", errors: "0", owner: "Taara operations", activeChanges: "Traffic policy applied 10:51 UTC", incidents: "None", finding: "Aggregation absorbed the fallback transition cleanly.", health: "Healthy" },
  { nodeId: "n-towers", segment: "Mobile tower clusters", interfaceState: "Up", routingState: "Established", capacity: "10 Gbps", throughput: "8.6 Gbps", latency: "0.4 ms", packetLoss: "0.008 percent", errors: "0", owner: "Customer operations", activeChanges: "None", incidents: "None", finding: "34 clusters see reduced best effort capacity only.", health: "At risk" },
  { nodeId: "n-downstream", segment: "Downstream traffic", interfaceState: "Up", routingState: "Established", capacity: "10 Gbps", throughput: "8.6 Gbps", latency: "0.4 ms", packetLoss: "0.008 percent", errors: "0", owner: "Customer operations", activeChanges: "None", incidents: "None", finding: "No downstream service loss recorded.", health: "Healthy" },
];

export const networkConclusion =
  "The customer and partner network handoffs remain healthy. The performance degradation is isolated to the optical path during the environmental event.";

/* -------------------------- environmental analysis ------------------------ */

export const environmentalConditions = {
  ...weatherContext,
  expectedRecovery: "Between 12:05 and 13:05 UTC",
};

export const CORRELATION_PAIRS = [
  { id: "corr-vis-atten", label: "Visibility versus optical attenuation", x: "visibility", y: "attenuation", coefficient: -0.94, note: "Strongest observed relationship in this investigation." },
  { id: "corr-fog-margin", label: "Fog density versus link margin", x: "fogDensity", y: "marginA", coefficient: -0.92, note: "Margin falls as fog density rises above 0.30 g/m3." },
  { id: "corr-hum-rx", label: "Humidity versus received optical power", x: "humidity", y: "rxPower", coefficient: -0.89, note: "Consistent with moisture driven scattering." },
  { id: "corr-risk-thr", label: "Environmental risk versus throughput", x: "fogDensity", y: "throughput", coefficient: -0.81, note: "Throughput follows the environmental profile with a lag." },
] as const;
export type CorrelationPairId = (typeof CORRELATION_PAIRS)[number]["id"];

export const environmentalConclusion =
  "The strongest correlation is between declining visibility, increasing fog density, increasing optical attenuation, and declining link margin.";

/* --------------------------- software and change -------------------------- */

export interface RecentChange {
  id: string;
  type: string;
  object: string;
  at: string;
  owner: string;
  status: string;
  risk: "Low" | "Medium" | "High";
  relationship: string;
  agentAssessment: string;
  evidence: string;
  rollbackReadiness: string;
}

export const recentChanges: RecentChange[] = [
  { id: "CHG-2026-1188", type: "Firmware deployment", object: "Lightbridge Pro terminals, India South cohort", at: "7 days earlier", owner: "S. Krishnan, Optical Engineering", status: "Completed successfully", risk: "Medium", relationship: "Unrelated", agentAssessment: "The firmware update does not show a matching fleet-wide pattern.", evidence: "36 of 36 peer terminals on 4.8.2 remain healthy.", rollbackReadiness: "Rollback package available, not required" },
  { id: "CHG-2026-1204", type: "Monitoring configuration change", object: "Link margin telemetry thresholds", at: "2 days earlier", owner: "M. Dorai, SRE", status: "Completed successfully", risk: "Low", relationship: "Alert timing only", agentAssessment: "The telemetry threshold change affected alert timing but not service performance.", evidence: "Threshold moved from 5.5 dB to 6.0 dB, no telemetry gaps.", rollbackReadiness: "Reversible in configuration service" },
  { id: "CHG-2026-1211", type: "Capacity policy change", object: "csvc-chennai-041 traffic classes", at: "1 day earlier", owner: "A. Rahman, Customer Operations", status: "Completed successfully", risk: "Low", relationship: "Unrelated", agentAssessment: "The capacity policy change did not create congestion.", evidence: "Headroom remained at 38 percent throughout the event.", rollbackReadiness: "Reversible without customer impact" },
  { id: "CHG-2026-1219", type: "Network partner maintenance", object: "Partner aggregation, Coastal Transit Partners", at: "12 hours earlier", owner: "Coastal Transit Partners duty manager", status: "Completed successfully", risk: "Medium", relationship: "Unrelated", agentAssessment: "The partner maintenance completed successfully before the degradation.", evidence: "Handoff counters clean, adjacencies stable since completion.", rollbackReadiness: "Not applicable, maintenance closed" },
  { id: "CHG-2026-1223", type: "Routing change", object: "Regional aggregation traffic policy", at: "10:51 UTC today", owner: "N. Iyer, Network Operations", status: "Completed successfully", risk: "Low", relationship: "Response action", agentAssessment: "Applied as part of the RF fallback mitigation, not a cause.", evidence: "Applied 9 minutes after degradation onset.", rollbackReadiness: "Reverts with return-to-optical" },
  { id: "CHG-2026-1226", type: "Weather model update", object: "India South coastal fog model", at: "3 days earlier", owner: "Weather Risk Agent", status: "Completed successfully", risk: "Low", relationship: "Forecast accuracy", agentAssessment: "Model update improved detection but did not affect the optical path.", evidence: "Forecast lead time improved from 6 to 12 minutes.", rollbackReadiness: "Model version pinned and reversible" },
];

export const changeConclusions = [
  "The firmware update does not show a matching fleet-wide pattern.",
  "No terminal instability began after the firmware change.",
  "The telemetry threshold change affected alert timing but not service performance.",
  "The capacity policy change did not create congestion.",
  "The partner maintenance completed successfully before the degradation.",
];

/* ---------------------------- similar incidents --------------------------- */

export interface SimilarIncident {
  id: string;
  title: string;
  similarity: number;
  matchingSignals: string[];
  differentSignals: string[];
  confirmedCause: string;
  customerImpact: string;
  resolution: string;
  timeToRestore: string;
  evidenceQuality: string;
  runbook: string;
  knowledge: string;
  outcome: string;
}

export const similarIncidents: SimilarIncident[] = [
  { id: "SIT-2025-1142", title: "Mumbai Fog Related Link Margin Degradation", similarity: 91, matchingSignals: ["Visibility collapse", "Attenuation rise above 6 dB", "Margin below 4 dB", "RF fallback activation"], differentSignals: ["Shorter 1.8 km span", "Fog arrived on forecast"], confirmedCause: "Atmospheric attenuation", customerImpact: "Priority traffic protected, best effort reduced", resolution: "Preventive fallback then return to optical", timeToRestore: "1 h 46 m", evidenceQuality: "High", runbook: "RB-OPT-014 Preventive fallback for atmospheric attenuation", knowledge: "Preventive transition before margin reaches 4 dB avoids packet loss.", outcome: "Preventive fallback protected service" },
  { id: "SIT-2025-0977", title: "Chennai Seasonal Visibility Degradation", similarity: 88, matchingSignals: ["Same span", "Coastal advection fog", "Humidity above 90 percent", "Attenuation rise"], differentSignals: ["Slower onset over 40 minutes", "No fallback required"], confirmedCause: "Dense fog", customerImpact: "Capacity reduced for 55 minutes", resolution: "Monitored until weather recovery", timeToRestore: "0 h 55 m", evidenceQuality: "High", runbook: "RB-OPT-009 Seasonal visibility watch", knowledge: "Chennai fog events cluster between 04:00 and 11:00 UTC in winter.", outcome: "Optical service restored after weather recovery" },
  { id: "SIT-2025-0641", title: "Nairobi Heavy Rain Optical Attenuation", similarity: 72, matchingSignals: ["Attenuation rise", "Margin decline", "Fallback activation"], differentSignals: ["Rainfall driven, not fog", "Wind above 30 km/h", "Different region and product mix"], confirmedCause: "Heavy rain", customerImpact: "Temporary capacity reduction", resolution: "Temporary fallback then automatic return", timeToRestore: "0 h 38 m", evidenceQuality: "Medium", runbook: "RB-OPT-011 Rain fade response", knowledge: "Rain fade recovers faster than fog and needs a shorter validation window.", outcome: "Temporary fallback activation" },
  { id: "SIT-2025-0503", title: "Mumbai Alignment Drift", similarity: 41, matchingSignals: ["Margin decline", "Received power decline"], differentSignals: ["Pointing error trend present", "Reacquisition attempts increased", "No weather correlation"], confirmedCause: "Mechanical alignment drift", customerImpact: "Repeated degradation over three days", resolution: "Field recalibration", timeToRestore: "9 h 12 m", evidenceQuality: "High", runbook: "RB-OPT-021 Alignment drift recalibration", knowledge: "Alignment drift always shows a pointing error trend, absent here.", outcome: "Field recalibration required" },
  { id: "SIT-2025-0388", title: "California Terminal Power Instability", similarity: 22, matchingSignals: ["Throughput decline"], differentSignals: ["Terminal resets present", "Voltage excursions", "No weather correlation", "Availability lost"], confirmedCause: "Local power system", customerImpact: "Two service outages", resolution: "Site power repair", timeToRestore: "14 h 05 m", evidenceQuality: "Medium", runbook: "RB-SITE-004 Site power fault response", knowledge: "Power faults present as resets and voltage excursions, absent here.", outcome: "Power repair required" },
];

/* -------------------------- eliminated cause register --------------------- */

export interface EliminatedCause {
  hypothesisId: string;
  cause: string;
  originalConfidence: number;
  currentConfidence: number;
  status: "Eliminated" | "Permanently excluded" | "Reopened";
  evidenceReviewed: number;
  keyContradicting: string;
  agentOwner: string;
  humanReviewer: string;
  eliminatedAt: string;
  reopenCriteria: string;
  rationale: string;
}

export const eliminatedCauses: EliminatedCause[] = [
  { hypothesisId: "hyp-hardware", cause: "Terminal hardware degradation", originalConfidence: 46, currentConfidence: 8, status: "Eliminated", evidenceReviewed: 12, keyContradicting: "No hardware alarms, stable power and temperature on both terminals", agentOwner: "Terminal Health Agent", humanReviewer: "S. Krishnan, Optical Engineering", eliminatedAt: "11:01:55 UTC", reopenCriteria: "Degradation persists after visibility recovers above 6 km", rationale: "Terminal hardware degradation was eliminated because both terminals remained available with nominal temperature, voltage and transmit power, and no hardware alarm was raised at any point during the degradation period." },
  { hypothesisId: "hyp-alignment", cause: "Beam alignment drift", originalConfidence: 34, currentConfidence: 6, status: "Eliminated", evidenceReviewed: 9, keyContradicting: "Pointing error, tracking correction rate and reacquisition behaviour all normal", agentOwner: "Optical Path Investigator", humanReviewer: "S. Krishnan, Optical Engineering", eliminatedAt: "11:00:38 UTC", reopenCriteria: "Pointing error exceeds 0.06 mrad or reacquisition attempts begin", rationale: "Beam alignment drift was eliminated because pointing error, tracking correction rate, and beam reacquisition behavior remained within normal operating ranges throughout the degradation period." },
  { hypothesisId: "hyp-vibration", cause: "Mounting vibration", originalConfidence: 22, currentConfidence: 4, status: "Eliminated", evidenceReviewed: 6, keyContradicting: "Vibration 0.21 g against a 0.35 g tolerance with wind below threshold", agentOwner: "Terminal Health Agent", humanReviewer: "S. Krishnan, Optical Engineering", eliminatedAt: "10:59:14 UTC", reopenCriteria: "Vibration exceeds 0.30 g or wind exceeds 45 km/h", rationale: "Mounting vibration was eliminated because structural vibration stayed well inside tolerance while wind remained below the local operating threshold and pointing error stayed stable." },
  { hypothesisId: "hyp-handoff", cause: "Network handoff failure", originalConfidence: 28, currentConfidence: 3, status: "Eliminated", evidenceReviewed: 11, keyContradicting: "All interfaces up with zero errors and healthy routing adjacencies", agentOwner: "Network Path Agent", humanReviewer: "N. Iyer, Network Operations", eliminatedAt: "10:58:12 UTC", reopenCriteria: "Interface errors appear or RF fallback performance degrades", rationale: "Network handoff failure was eliminated because every upstream and downstream interface remained available with clean error counters, established routing adjacencies, and packet loss confined to the optical path window." },
  { hypothesisId: "hyp-firmware", cause: "Firmware regression", originalConfidence: 19, currentConfidence: 2, status: "Eliminated", evidenceReviewed: 10, keyContradicting: "36 of 36 peer terminals on the same release remain healthy", agentOwner: "Change Risk Agent", humanReviewer: "M. Dorai, SRE", eliminatedAt: "10:57:30 UTC", reopenCriteria: "A second span on 4.8.2 degrades without an environmental trigger", rationale: "Firmware regression was eliminated because the release cohort shows no comparable degradation, no restarts or resource anomalies occurred, and the degradation aligned with weather onset rather than the deployment." },
  { hypothesisId: "hyp-power", cause: "Power instability", originalConfidence: 17, currentConfidence: 2, status: "Eliminated", evidenceReviewed: 7, keyContradicting: "Voltage stable with no transfers and no terminal resets", agentOwner: "Terminal Health Agent", humanReviewer: "N. Iyer, Network Operations", eliminatedAt: "10:56:02 UTC", reopenCriteria: "A voltage excursion or unplanned terminal reset is observed", rationale: "Power instability was eliminated because supply voltage remained inside the stability band at both sites, backup reserves stayed intact, and no power event coincided with the degradation." },
];

/* --------------------- investigation agents and tasks --------------------- */

const nameOf = (id: string, fallback: string) => agents.find((a) => a.id === id)?.name ?? fallback;

export interface InvestigationAgent {
  id: string;
  name: string;
  objective: string;
  task: string;
  status: "Investigating" | "Monitoring" | "Awaiting review" | "Complete";
  confidence: number;
  evidenceReviewed: number;
  supports: string[];
  contradicts: string[];
  tasksCompleted: number;
  openTask: string;
  lastFinding: string;
  guardrail: string;
  lastUpdate: string;
}

export const investigationAgents: InvestigationAgent[] = [
  { id: "agent-path", name: nameOf("agent-path", "Optical Path Investigator"), objective: "Establish or exclude optical path causes", task: "Correlating attenuation with terminal optical power", status: "Complete", confidence: 95, evidenceReviewed: 12, supports: ["hyp-fog"], contradicts: ["hyp-alignment", "hyp-hardware"], tasksCompleted: 6, openTask: "None", lastFinding: "Attenuation, not terminal optics, explains the received power decline.", guardrail: "Within guardrails", lastUpdate: "11:01:55 UTC" },
  { id: "agent-weather", name: nameOf("agent-weather", "Weather Risk Agent"), objective: "Correlate atmospheric conditions with optical behaviour", task: "Validating fog dispersal against attenuation recovery", status: "Investigating", confidence: 94, evidenceReviewed: 11, supports: ["hyp-fog"], contradicts: ["hyp-vibration"], tasksCompleted: 5, openTask: "Confirm environmental recovery", lastFinding: "Visibility and attenuation correlate at 0.94 across the window.", guardrail: "Within guardrails", lastUpdate: "11:04:10 UTC" },
  { id: "agent-network", name: nameOf("agent-network", "Network Path Agent"), objective: "Validate every non-optical route segment", task: "Re-checking partner handoff counters", status: "Complete", confidence: 92, evidenceReviewed: 9, supports: [], contradicts: ["hyp-handoff"], tasksCompleted: 5, openTask: "None", lastFinding: "All nine route segments healthy outside the optical span.", guardrail: "Within guardrails", lastUpdate: "10:58:12 UTC" },
  { id: "agent-terminal", name: nameOf("agent-terminal", "Terminal Health Agent"), objective: "Prove or exclude terminal hardware, power and mounting causes", task: "Holding terminal telemetry watch during recovery", status: "Monitoring", confidence: 96, evidenceReviewed: 14, supports: [], contradicts: ["hyp-hardware", "hyp-power", "hyp-vibration"], tasksCompleted: 7, openTask: "Validate both terminal power states", lastFinding: "Both terminals healthy with no drift, reset or thermal anomaly.", guardrail: "Within guardrails", lastUpdate: "11:03:12 UTC" },
  { id: "agent-change", name: nameOf("agent-change", "Change Risk Agent"), objective: "Test whether any recent change contributed", task: "Comparing firmware cohort behaviour", status: "Complete", confidence: 93, evidenceReviewed: 10, supports: [], contradicts: ["hyp-firmware"], tasksCompleted: 4, openTask: "None", lastFinding: "No change in the last 14 days correlates with the degradation.", guardrail: "Within guardrails", lastUpdate: "10:57:30 UTC" },
  { id: "agent-customer", name: nameOf("agent-customer", "Customer Impact Agent"), objective: "Quantify customer service impact", task: "Tracking demand against route headroom", status: "Investigating", confidence: 91, evidenceReviewed: 9, supports: ["hyp-fog"], contradicts: ["hyp-demand"], tasksCompleted: 4, openTask: "Calculate customer SLO impact", lastFinding: "42,000 synthetic downstream users see reduced best effort capacity.", guardrail: "Within guardrails", lastUpdate: "11:03:41 UTC" },
  { id: "agent-slo", name: nameOf("agent-slo", "SLO Guardian"), objective: "Protect the service objective and error budget", task: "Recalculating burn attribution for the event", status: "Awaiting review", confidence: 92, evidenceReviewed: 6, supports: ["hyp-fog"], contradicts: [], tasksCompleted: 3, openTask: "Validate fallback performance", lastFinding: "3.4 percent of the monthly error budget consumed.", guardrail: "Approval gate engaged", lastUpdate: "11:03:00 UTC" },
  { id: "agent-knowledge", name: "Incident Knowledge Agent", objective: "Find comparable prior situations and reusable diagnostics", task: "Ranking historical matches by signal similarity", status: "Complete", confidence: 90, evidenceReviewed: 8, supports: ["hyp-fog"], contradicts: ["hyp-alignment", "hyp-power"], tasksCompleted: 2, openTask: "None", lastFinding: "Two fog incidents above 88 percent similarity confirm the pattern.", guardrail: "Within guardrails", lastUpdate: "11:02:22 UTC" },
];

export const TASK_COLUMNS = [
  "Requested", "Running", "Awaiting Evidence", "Human Review", "Completed", "Blocked",
] as const;
export type TaskColumn = (typeof TASK_COLUMNS)[number];

export interface InvestigationTask {
  id: string;
  title: string;
  status: TaskColumn;
  owner: string;
  humanOwner: string;
  priority: "High" | "Medium" | "Low";
  hypothesisId: string;
  domain: EvidenceDomain;
  result: string;
  at: string;
}

export const investigationTasks: InvestigationTask[] = [
  { id: "task-power", title: "Validate both terminal power states", status: "Completed", owner: "Terminal Health Agent", humanOwner: "S. Krishnan", priority: "High", hypothesisId: "hyp-power", domain: "Terminal", result: "Voltage stable at both sites, no transfers recorded.", at: "10:56:02 UTC" },
  { id: "task-align", title: "Compare alignment telemetry", status: "Completed", owner: "Optical Path Investigator", humanOwner: "S. Krishnan", priority: "High", hypothesisId: "hyp-alignment", domain: "Optical", result: "Pointing error flat, zero reacquisitions.", at: "11:00:38 UTC" },
  { id: "task-corr", title: "Correlate visibility and link margin", status: "Completed", owner: "Weather Risk Agent", humanOwner: "M. Dorai", priority: "High", hypothesisId: "hyp-fog", domain: "Environmental", result: "Correlation coefficient -0.92 across the event window.", at: "11:04:10 UTC" },
  { id: "task-upstream", title: "Validate upstream network handoff", status: "Completed", owner: "Network Path Agent", humanOwner: "N. Iyer", priority: "Medium", hypothesisId: "hyp-handoff", domain: "Network", result: "All interfaces up with zero errors.", at: "10:58:12 UTC" },
  { id: "task-cohort", title: "Compare firmware cohort behavior", status: "Completed", owner: "Change Risk Agent", humanOwner: "M. Dorai", priority: "Medium", hypothesisId: "hyp-firmware", domain: "Software and Change", result: "36 of 36 peers healthy on the same release.", at: "10:57:30 UTC" },
  { id: "task-similar", title: "Search similar incidents", status: "Completed", owner: "Incident Knowledge Agent", humanOwner: "M. Dorai", priority: "Medium", hypothesisId: "hyp-fog", domain: "Environmental", result: "Five comparable situations ranked by similarity.", at: "11:02:22 UTC" },
  { id: "task-slo", title: "Calculate customer SLO impact", status: "Running", owner: "Customer Impact Agent", humanOwner: "A. Rahman", priority: "High", hypothesisId: "hyp-fog", domain: "Customer and SLO", result: "Burn rate recalculation in progress.", at: "11:03:41 UTC" },
  { id: "task-fallback", title: "Validate fallback performance", status: "Human Review", owner: "SLO Guardian", humanOwner: "N. Iyer", priority: "High", hypothesisId: "hyp-demand", domain: "Network", result: "Fallback stable with 48 percent headroom, awaiting sign-off.", at: "11:04:20 UTC" },
  { id: "task-recovery", title: "Confirm environmental recovery", status: "Awaiting Evidence", owner: "Weather Risk Agent", humanOwner: "M. Dorai", priority: "High", hypothesisId: "hyp-fog", domain: "Environmental", result: "Requires 15 continuous minutes above 8.5 dB margin.", at: "Pending" },
  { id: "task-conclude", title: "Prepare investigation conclusion", status: "Requested", owner: "Incident Knowledge Agent", humanOwner: "M. Dorai", priority: "Medium", hypothesisId: "hyp-fog", domain: "Customer and SLO", result: "Conclusion draft assembled, pending final validation.", at: "Pending" },
];

/* ---------------------------- investigation timeline ---------------------- */

export interface InvestigationEvent {
  id: string;
  at: string;
  event: string;
  actor: string;
  actorKind: "Agent" | "Human";
  hypothesisId: string;
  domain: EvidenceDomain;
  evidenceAdded: string;
  confidenceChange: string;
  decision: string;
  outcome: string;
  status: "Complete" | "In progress" | "Pending";
}

export const investigationEvents: InvestigationEvent[] = [
  { id: "iev-1", at: "10:42:06", event: "Situation created", actor: "Incident Commander Agent", actorKind: "Agent", hypothesisId: "", domain: "Customer and SLO", evidenceAdded: "Situation record", confidenceChange: "—", decision: "Open investigation", outcome: "Investigation initiated", status: "Complete" },
  { id: "iev-2", at: "10:42:56", event: "Initial hypotheses generated", actor: "Incident Knowledge Agent", actorKind: "Agent", hypothesisId: "", domain: "Optical", evidenceAdded: "Historical cause patterns", confidenceChange: "8 causes scored", decision: "Rank candidates", outcome: "Eight hypotheses proposed", status: "Complete" },
  { id: "iev-3", at: "10:43:40", event: "Terminal health validation started", actor: "Terminal Health Agent", actorKind: "Agent", hypothesisId: "hyp-hardware", domain: "Terminal", evidenceAdded: "Terminal telemetry snapshot", confidenceChange: "Hardware 46 to 38", decision: "Test hardware cause", outcome: "Validation running", status: "Complete" },
  { id: "iev-4", at: "10:43:58", event: "Weather correlation started", actor: "Weather Risk Agent", actorKind: "Agent", hypothesisId: "hyp-fog", domain: "Environmental", evidenceAdded: "Fog observation series", confidenceChange: "Fog 31 to 58", decision: "Test environmental cause", outcome: "Correlation running", status: "Complete" },
  { id: "iev-5", at: "10:44:20", event: "Network path validation started", actor: "Network Path Agent", actorKind: "Agent", hypothesisId: "hyp-handoff", domain: "Network", evidenceAdded: "Route validation record", confidenceChange: "Handoff 28 to 18", decision: "Test handoff cause", outcome: "Validation running", status: "Complete" },
  { id: "iev-6", at: "10:45:02", event: "Recent changes reviewed", actor: "Change Risk Agent", actorKind: "Agent", hypothesisId: "hyp-firmware", domain: "Software and Change", evidenceAdded: "Change register extract", confidenceChange: "Firmware 19 to 12", decision: "Assess change relationship", outcome: "No change correlates", status: "Complete" },
  { id: "iev-7", at: "10:45:30", event: "Similar incidents found", actor: "Incident Knowledge Agent", actorKind: "Agent", hypothesisId: "hyp-fog", domain: "Environmental", evidenceAdded: "Five historical situations", confidenceChange: "Fog 58 to 79", decision: "Apply prior diagnostics", outcome: "Fog pattern matched at 91 percent", status: "Complete" },
  { id: "iev-8", at: "10:52:14", event: "Hardware cause confidence reduced", actor: "Terminal Health Agent", actorKind: "Agent", hypothesisId: "hyp-hardware", domain: "Terminal", evidenceAdded: "Terminal validation result", confidenceChange: "Hardware 38 to 14", decision: "Lower hypothesis", outcome: "Hardware cause deprioritised", status: "Complete" },
  { id: "iev-9", at: "11:00:38", event: "Alignment cause eliminated", actor: "Optical Path Investigator", actorKind: "Agent", hypothesisId: "hyp-alignment", domain: "Optical", evidenceAdded: "Alignment validation result", confidenceChange: "Alignment 12 to 6", decision: "Eliminate cause", outcome: "Alignment excluded", status: "Complete" },
  { id: "iev-10", at: "10:58:12", event: "Network handoff cause eliminated", actor: "Network Path Agent", actorKind: "Agent", hypothesisId: "hyp-handoff", domain: "Network", evidenceAdded: "Handoff validation result", confidenceChange: "Handoff 9 to 3", decision: "Eliminate cause", outcome: "Handoff excluded", status: "Complete" },
  { id: "iev-11", at: "11:01:10", event: "Environmental cause promoted", actor: "Weather Risk Agent", actorKind: "Agent", hypothesisId: "hyp-fog", domain: "Environmental", evidenceAdded: "Correlation analysis", confidenceChange: "Fog 88 to 92", decision: "Promote hypothesis", outcome: "Fog becomes the leading cause", status: "Complete" },
  { id: "iev-12", at: "11:02:40", event: "Human reviewer agreed with the leading cause", actor: "S. Krishnan, Optical Engineering", actorKind: "Human", hypothesisId: "hyp-fog", domain: "Optical", evidenceAdded: "Human assessment note", confidenceChange: "Fog 92 to 93", decision: "Endorse leading cause", outcome: "Engineering endorsement recorded", status: "Complete" },
  { id: "iev-13", at: "11:03:20", event: "Additional validation requested", actor: "M. Dorai, SRE", actorKind: "Human", hypothesisId: "hyp-fog", domain: "Environmental", evidenceAdded: "Validation request", confidenceChange: "—", decision: "Request more evidence", outcome: "Sustained recovery validation queued", status: "In progress" },
  { id: "iev-14", at: "11:04:10", event: "Leading cause confidence reached 94 percent", actor: "Weather Risk Agent", actorKind: "Agent", hypothesisId: "hyp-fog", domain: "Environmental", evidenceAdded: "Recovery correlation update", confidenceChange: "Fog 93 to 94", decision: "Maintain leading cause", outcome: "Threshold for conclusion met", status: "Complete" },
  { id: "iev-15", at: "Pending", event: "Investigation marked ready to conclude", actor: "M. Dorai, SRE", actorKind: "Human", hypothesisId: "hyp-fog", domain: "Customer and SLO", evidenceAdded: "Conclusion package", confidenceChange: "—", decision: "Await sustained recovery", outcome: "Two validation checks remain", status: "Pending" },
];

/* --------------------------- conclusion readiness ------------------------- */

export const investigationConclusion = {
  proposedCause: "Atmospheric attenuation caused by dense fog",
  statement:
    "Dense fog caused atmospheric attenuation on Chennai Mobile Backhaul 041, reducing received optical power and link margin. Both terminals, beam alignment, mounting structure, power systems, network handoffs, and firmware remained healthy. The resulting optical degradation reduced service throughput and required temporary RF fallback.",
  confidence: 94,
  evidenceCompleteness: 94,
  supportingCount: 24,
  contradictingCount: 23,
  causesEliminated: 5,
  remainingUncertainty: "Fog dispersal timing remains a forecast until sustained margin recovery is observed.",
  customerImpactUnderstood: "Confirmed — 8.6 Gbps of 10 Gbps delivered, 42,000 synthetic downstream users affected",
  dependenciesValidated: "Confirmed — all nine route segments validated",
  correctiveAction: "Maintain RF fallback and return to optical after sustained margin recovery",
  humanReview: "Awaiting investigation owner acceptance",
};

export interface ReadinessCheck {
  id: string;
  label: string;
  status: "Passed" | "Pending" | "Failed" | "Not applicable";
  detail: string;
  owner: string;
}

export const readinessChecks: ReadinessCheck[] = [
  { id: "rc-confidence", label: "Leading cause confidence above required threshold", status: "Passed", detail: "94 percent against a 90 percent threshold.", owner: "Weather Risk Agent" },
  { id: "rc-impact", label: "Customer impact confirmed", status: "Passed", detail: "Throughput, latency, loss and downstream users quantified.", owner: "Customer Impact Agent" },
  { id: "rc-terminal", label: "Terminal health validated", status: "Passed", detail: "Both terminals passed health validation.", owner: "Terminal Health Agent" },
  { id: "rc-network", label: "Network path validated", status: "Passed", detail: "Nine route segments validated end to end.", owner: "Network Path Agent" },
  { id: "rc-env", label: "Environmental correlation validated", status: "Passed", detail: "Correlation coefficient -0.94 for visibility against attenuation.", owner: "Weather Risk Agent" },
  { id: "rc-change", label: "Software and change review complete", status: "Passed", detail: "Six recent changes reviewed, none related.", owner: "Change Risk Agent" },
  { id: "rc-similar", label: "Similar incidents reviewed", status: "Passed", detail: "Five historical situations compared.", owner: "Incident Knowledge Agent" },
  { id: "rc-alt", label: "Alternative causes eliminated", status: "Passed", detail: "Five causes eliminated with explicit contradicting evidence.", owner: "Optical Path Investigator" },
  { id: "rc-action", label: "Corrective action identified", status: "Passed", detail: "Maintain RF fallback until return-to-optical validation passes.", owner: "RF Fallback Guardian" },
  { id: "rc-package", label: "Evidence package complete", status: "Pending", detail: "Awaiting sustained recovery validation record.", owner: "M. Dorai, SRE" },
  { id: "rc-reviewer", label: "Human reviewer assigned", status: "Passed", detail: "M. Dorai assigned as investigation owner.", owner: "R. Venkatesan" },
  { id: "rc-slo", label: "SRE impact calculated", status: "Pending", detail: "Error budget attribution recalculation in progress.", owner: "SLO Guardian" },
];

/* --------------------------- recommended actions -------------------------- */

export const primaryAction = {
  title: "Maintain RF fallback until visibility and link margin meet the return-to-optical validation threshold.",
  confidence: 93,
  outcomeProtected: "10 Gbps mobile backhaul service and priority traffic classes",
  expectedDuration: "60 to 120 minutes",
  validationCriteria: "Link margin above 8.5 dB for 15 continuous minutes with visibility above 6 km",
  approvalRequirement: "Investigation owner acceptance",
  rollbackCondition: "Fallback capacity falls below 2.5 Gbps or margin recovery stalls",
  evidenceCount: 18,
};

export const additionalActions = [
  { id: "aa-monitor", title: "Continue environmental monitoring", detail: "Track visibility and fog density until dispersal completes.", owner: "Weather Risk Agent" },
  { id: "aa-margin", title: "Validate sustained link margin recovery", detail: "Require 15 continuous minutes above 8.5 dB before any transition.", owner: "Global Link Health Agent" },
  { id: "aa-return", title: "Return traffic incrementally to the optical route", detail: "Move priority classes first, then best effort after validation.", owner: "RF Fallback Guardian" },
  { id: "aa-knowledge", title: "Record the environmental signature in operational knowledge", detail: "Retain the visibility to attenuation curve as a diagnostic pattern.", owner: "Incident Knowledge Agent" },
  { id: "aa-profile", title: "Update the Chennai seasonal risk profile", detail: "Add this event to the India South winter fog profile.", owner: "Weather Risk Agent" },
  { id: "aa-threshold", title: "Refine the preventive threshold for similar links", detail: "Evaluate moving the preventive trigger from 6.0 dB to 6.4 dB.", owner: "M. Dorai, SRE" },
  { id: "aa-close", title: "Close eliminated hardware and software investigations", detail: "Archive the five eliminated causes with their evidence records.", owner: "Incident Commander Agent" },
  { id: "aa-approve", title: "Prepare the incident conclusion for human approval", detail: "Assemble the evidence package for investigation owner acceptance.", owner: "Incident Knowledge Agent" },
];

/* -------------------------------- scenario -------------------------------- */

export interface InvestigationStage {
  id: string;
  title: string;
  detail: string;
  actor: string;
  state: InvestigationState;
  leadingConfidence: number;
  evidenceReviewed: number;
  eliminated: number;
  readiness: number;
  domain: EvidenceDomain;
  hypothesisId: string;
  requiresApproval?: boolean;
}

export const investigationScenario: InvestigationStage[] = [
  { id: "is-1", title: "Investigation initiated", detail: "The situation record opens an investigation across six evidence domains.", actor: "Incident Commander Agent", state: "Initiated", leadingConfidence: 0, evidenceReviewed: 2, eliminated: 0, readiness: 4, domain: "Customer and SLO", hypothesisId: "" },
  { id: "is-2", title: "Eight cause hypotheses generated", detail: "Historical cause patterns produce eight candidate causes for the optical span.", actor: "Incident Knowledge Agent", state: "Hypotheses generated", leadingConfidence: 31, evidenceReviewed: 6, eliminated: 0, readiness: 10, domain: "Optical", hypothesisId: "" },
  { id: "is-3", title: "Optical evidence collected", detail: "Received power, margin, attenuation, pointing error and beam lock retrieved.", actor: "Optical Path Investigator", state: "Evidence collection", leadingConfidence: 38, evidenceReviewed: 12, eliminated: 0, readiness: 16, domain: "Optical", hypothesisId: "hyp-fog" },
  { id: "is-4", title: "Terminal evidence collected", detail: "Availability, temperature, power, vibration and configuration drift retrieved.", actor: "Terminal Health Agent", state: "Evidence collection", leadingConfidence: 44, evidenceReviewed: 18, eliminated: 0, readiness: 22, domain: "Terminal", hypothesisId: "hyp-hardware" },
  { id: "is-5", title: "Network evidence collected", detail: "Interfaces, routing, throughput, latency, loss and headroom retrieved.", actor: "Network Path Agent", state: "Evidence collection", leadingConfidence: 49, evidenceReviewed: 24, eliminated: 0, readiness: 28, domain: "Network", hypothesisId: "hyp-handoff" },
  { id: "is-6", title: "Environmental evidence collected", detail: "Visibility, fog density, humidity, wind and atmospheric risk retrieved.", actor: "Weather Risk Agent", state: "Evidence collection", leadingConfidence: 58, evidenceReviewed: 30, eliminated: 0, readiness: 34, domain: "Environmental", hypothesisId: "hyp-fog" },
  { id: "is-7", title: "Software and change evidence collected", detail: "Firmware, configuration, restarts and change register reviewed.", actor: "Change Risk Agent", state: "Evidence collection", leadingConfidence: 61, evidenceReviewed: 35, eliminated: 0, readiness: 39, domain: "Software and Change", hypothesisId: "hyp-firmware" },
  { id: "is-8", title: "Customer and SLO evidence collected", detail: "Committed capacity, delivered throughput, error budget and impact retrieved.", actor: "Customer Impact Agent", state: "Evidence collection", leadingConfidence: 64, evidenceReviewed: 40, eliminated: 0, readiness: 44, domain: "Customer and SLO", hypothesisId: "hyp-demand" },
  { id: "is-9", title: "Similar incidents identified", detail: "Five comparable situations ranked, two above 88 percent similarity.", actor: "Incident Knowledge Agent", state: "Hypotheses ranked", leadingConfidence: 72, evidenceReviewed: 43, eliminated: 0, readiness: 50, domain: "Environmental", hypothesisId: "hyp-fog" },
  { id: "is-10", title: "Hardware cause confidence reduced", detail: "Terminal validation removes support for a hardware fault.", actor: "Terminal Health Agent", state: "Causes being tested", leadingConfidence: 78, evidenceReviewed: 44, eliminated: 0, readiness: 55, domain: "Terminal", hypothesisId: "hyp-hardware" },
  { id: "is-11", title: "Alignment cause eliminated", detail: "Pointing error, tracking rate and reacquisition behaviour remain normal.", actor: "Optical Path Investigator", state: "Causes being tested", leadingConfidence: 81, evidenceReviewed: 45, eliminated: 1, readiness: 60, domain: "Optical", hypothesisId: "hyp-alignment" },
  { id: "is-12", title: "Vibration cause eliminated", detail: "Structural vibration inside tolerance with wind below threshold.", actor: "Terminal Health Agent", state: "Causes being tested", leadingConfidence: 83, evidenceReviewed: 45, eliminated: 2, readiness: 64, domain: "Terminal", hypothesisId: "hyp-vibration" },
  { id: "is-13", title: "Network handoff cause eliminated", detail: "All upstream and downstream segments validated as healthy.", actor: "Network Path Agent", state: "Causes being tested", leadingConfidence: 85, evidenceReviewed: 46, eliminated: 3, readiness: 68, domain: "Network", hypothesisId: "hyp-handoff" },
  { id: "is-14", title: "Software cause eliminated", detail: "Firmware cohort comparison shows no fleet-wide regression.", actor: "Change Risk Agent", state: "Causes being tested", leadingConfidence: 87, evidenceReviewed: 46, eliminated: 4, readiness: 72, domain: "Software and Change", hypothesisId: "hyp-firmware" },
  { id: "is-15", title: "Power cause eliminated", detail: "Voltage stable at both sites with no resets or transfers.", actor: "Terminal Health Agent", state: "Causes being tested", leadingConfidence: 88, evidenceReviewed: 46, eliminated: 5, readiness: 76, domain: "Terminal", hypothesisId: "hyp-power" },
  { id: "is-16", title: "Environmental cause promoted", detail: "Fog becomes the leading cause after cross-domain correlation.", actor: "Weather Risk Agent", state: "Leading cause identified", leadingConfidence: 92, evidenceReviewed: 46, eliminated: 5, readiness: 82, domain: "Environmental", hypothesisId: "hyp-fog" },
  { id: "is-17", title: "Additional weather validation completed", detail: "Forecast dispersal cross-checked against observed attenuation recovery.", actor: "Weather Risk Agent", state: "Validation in progress", leadingConfidence: 93, evidenceReviewed: 47, eliminated: 5, readiness: 86, domain: "Environmental", hypothesisId: "hyp-fog" },
  { id: "is-18", title: "Leading confidence reaches 94 percent", detail: "All supporting signals align and no material contradiction remains.", actor: "Optical Path Investigator", state: "Validation in progress", leadingConfidence: 94, evidenceReviewed: 47, eliminated: 5, readiness: 92, domain: "Optical", hypothesisId: "hyp-fog" },
  { id: "is-19", title: "Human review requested", detail: "The investigation owner is asked to accept the proposed conclusion.", actor: "M. Dorai, SRE", state: "Ready to conclude", leadingConfidence: 94, evidenceReviewed: 47, eliminated: 5, readiness: 96, domain: "Customer and SLO", hypothesisId: "hyp-fog", requiresApproval: true },
  { id: "is-20", title: "Investigation conclusion accepted", detail: "The evidence-backed conclusion is recorded and shared with the situation.", actor: "M. Dorai, SRE", state: "Conclusion approved", leadingConfidence: 94, evidenceReviewed: 47, eliminated: 5, readiness: 100, domain: "Customer and SLO", hypothesisId: "hyp-fog" },
];

export const firmwareAnomalyEvent = {
  title: "Simulated firmware anomaly",
  detail:
    "A synthetic resource anomaly appears on three peer terminals running LB-Pro 4.8.2. The firmware hypothesis is reopened at 38 percent confidence, a cohort re-comparison task is queued, and conclusion readiness falls until the anomaly is explained.",
  hypothesisId: "hyp-firmware",
  confidence: 38,
};

export const handoffFailureEvent = {
  title: "Simulated network handoff failure",
  detail:
    "Synthetic input error counters appear on the partner aggregation interface. The network handoff hypothesis is reopened at 34 percent confidence, upstream validation is re-queued, and the leading cause confidence is reduced pending re-validation.",
  hypothesisId: "hyp-handoff",
  confidence: 34,
};

/* --------------------- manual versus agentic comparison ------------------- */

export interface ComparisonRow {
  dimension: string;
  traditional: string;
  agentic: string;
}

export const investigationComparison: ComparisonRow[] = [
  { dimension: "Monitoring tools reviewed", traditional: "7 separate tools", agentic: "1 investigation workspace" },
  { dimension: "Evidence assembly time", traditional: "28 minutes", agentic: "42 seconds" },
  { dimension: "Teams involved", traditional: "5 teams", agentic: "1 owner with 8 digital coworkers" },
  { dimension: "Time to generate hypotheses", traditional: "18 minutes", agentic: "18 seconds" },
  { dimension: "Time to eliminate hardware cause", traditional: "22 minutes", agentic: "1 minute 34 seconds" },
  { dimension: "Time to correlate weather", traditional: "35 minutes", agentic: "2 minutes" },
  { dimension: "Time to find similar incidents", traditional: "26 minutes", agentic: "48 seconds" },
  { dimension: "Time to calculate customer impact", traditional: "16 minutes", agentic: "35 seconds" },
  { dimension: "Time to identify leading cause", traditional: "54 minutes", agentic: "3 minutes 42 seconds" },
  { dimension: "Documentation completeness", traditional: "Partial, assembled after the event", agentic: "Complete evidence package at conclusion" },
];

export const comparisonDisclaimer =
  "Synthetic demonstration values only. These are not measured Taara results.";

/* ------------------------------ shared series ----------------------------- */

/** The investigation reuses the Active Situation Room telemetry series. */
export const investigationSeries = situationSeries;
export const investigationTerminals = terminalHealth;
