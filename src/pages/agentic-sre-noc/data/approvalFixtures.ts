/**
 * Human Approval and Action Center — page-specific synthetic demonstration data.
 *
 * ALL values are fabricated for demonstration purposes only and are NOT
 * measured Taara results. Customers, customer services, optical links,
 * terminals, regions, products, situations, topology relationships, agents and
 * human owners are reused from ./goocFixtures, ./cshFixtures, ./plrFixtures,
 * ./situationFixtures and ./investigationFixtures so every Agentic SRE NOC page
 * keeps the same identifiers. This module contains no React so it can later be
 * swapped for a live governance and policy service.
 */

import { agents, links } from "./goocFixtures";
import { customerServices } from "./cshFixtures";
import {
  fallbackState, SITUATION_ID, situationHeader, terminalHealth, weatherContext,
} from "./situationFixtures";
import { investigationConclusion, INVESTIGATION_ID } from "./investigationFixtures";

export const SYNTHETIC_NOTE = "Synthetic Taara aligned demonstration environment";

/* ------------------------------- identity -------------------------------- */

export const APPROVAL_ID = "APR-2026-0417-03";

const chennaiLink = links.find((l) => l.id === situationHeader.linkId);
const chennaiService = customerServices.find((s) => s.id === situationHeader.serviceId);

const nameOf = (id: string, fallback: string) => agents.find((a) => a.id === id)?.name ?? fallback;

export const RECOMMENDATION_STATEMENT =
  "Maintain priority traffic on RF fallback until optical link margin remains above the validated recovery threshold for 15 continuous minutes, then restore traffic incrementally to the primary optical path.";

export const approvalHeader = {
  id: APPROVAL_ID,
  situationId: SITUATION_ID,
  situationTitle: situationHeader.title,
  investigationId: INVESTIGATION_ID,
  customer: situationHeader.customer,
  serviceId: situationHeader.serviceId,
  serviceName: chennaiService?.name ?? situationHeader.serviceName,
  linkId: situationHeader.linkId,
  linkName: chennaiLink?.name ?? situationHeader.linkName,
  product: situationHeader.product,
  region: situationHeader.region,
  recommendation: RECOMMENDATION_STATEMENT,
  actionType: "Governed traffic transition",
  state: "Awaiting required approver" as ApprovalState,
  stateLabel: "Awaiting Service Reliability Approver",
  actionRisk: "Moderate" as ActionRisk,
  customerRisk: "Low during fallback, high if traffic returns prematurely",
  confidence: 94,
  autonomyLevel: 3,
  autonomyPolicy: "Recommend and request approval",
  requiredApprovers: 2,
  approversCompleted: 0,
  awaitingFor: "4m 12s",
  executionWindow: "12:05 to 13:05 UTC",
  latestSafeDecision: "12:35 UTC",
  dataConfidence: "96% evidence completeness",
  lastUpdate: "11:06:18 UTC",
};

export const approvalParticipants = [
  "M. Dorai, SRE Investigation Owner",
  "R. Venkatesan, Duty Incident Commander",
  "S. Krishnan, Optical Engineering",
  "N. Iyer, Network Operations",
  "A. Rahman, Customer Operations",
];

export const assignableApprovers = [
  "P. Nandakumar, Service Reliability Owner",
  "N. Iyer, Network Operations Approver",
  "S. Krishnan, Optical Engineering Owner",
  "A. Rahman, Customer Operations Owner",
  "L. Fernandes, Regional Operations Owner",
];

/* ---------------------------- approval states ---------------------------- */

export const APPROVAL_STATES = [
  "Recommendation created",
  "Policy evaluation",
  "Awaiting required approver",
  "Awaiting additional evidence",
  "Partially approved",
  "Approved",
  "Rejected",
  "Deferred",
  "Escalated",
  "Execution authorized",
  "Execution in progress",
  "Validation in progress",
  "Completed",
  "Rolled back",
  "Expired",
  "Cancelled",
] as const;
export type ApprovalState = (typeof APPROVAL_STATES)[number];

export type ActionRisk = "Low" | "Moderate" | "High";

export interface ApprovalStateStage {
  state: ApprovalState;
  status: "Complete" | "Active" | "Pending";
  enteredAt: string;
  owner: string;
  requiredCondition: string;
  evidenceRequirement: string;
  decisionRequirement: string;
  exitCriteria: string;
  blockers: string;
}

export const approvalStateStages: ApprovalStateStage[] = [
  { state: "Recommendation created", status: "Complete", enteredAt: "11:02:04 UTC", owner: "Incident Commander Agent", requiredCondition: "Investigation leading cause identified", evidenceRequirement: "Investigation conclusion attached", decisionRequirement: "None", exitCriteria: "Recommendation published with evidence package", blockers: "None" },
  { state: "Policy evaluation", status: "Complete", enteredAt: "11:02:21 UTC", owner: "Policy Guardian Agent", requiredCondition: "Action classified against autonomy policy", evidenceRequirement: "Risk, reversibility and rollback records", decisionRequirement: "None", exitCriteria: "Policy result issued", blockers: "None" },
  { state: "Awaiting required approver", status: "Active", enteredAt: "11:02:34 UTC", owner: "P. Nandakumar, Service Reliability Owner", requiredCondition: "Two independent approvers assigned", evidenceRequirement: "Evidence completeness at or above 90 percent", decisionRequirement: "Service reliability and network operations approval", exitCriteria: "Both required approvals recorded", blockers: "Service Reliability Owner decision pending" },
  { state: "Awaiting additional evidence", status: "Pending", enteredAt: "—", owner: "Requesting approver", requiredCondition: "Evidence request raised by an approver", evidenceRequirement: "Named evidence item supplied", decisionRequirement: "None", exitCriteria: "Requested evidence attached", blockers: "Not entered" },
  { state: "Partially approved", status: "Pending", enteredAt: "—", owner: "Remaining approver", requiredCondition: "At least one required approval recorded", evidenceRequirement: "Unchanged", decisionRequirement: "Remaining approver decision", exitCriteria: "All required approvals recorded", blockers: "Not entered" },
  { state: "Approved", status: "Pending", enteredAt: "—", owner: "Incident Commander", requiredCondition: "All required approvals recorded", evidenceRequirement: "Complete evidence package", decisionRequirement: "No open blocking guardrail", exitCriteria: "Execution authorization issued", blockers: "Not entered" },
  { state: "Rejected", status: "Pending", enteredAt: "—", owner: "Deciding approver", requiredCondition: "Approver declines the action", evidenceRequirement: "Rejection rationale recorded", decisionRequirement: "Named human decision", exitCriteria: "Recommendation returned to investigation", blockers: "Not entered" },
  { state: "Deferred", status: "Pending", enteredAt: "—", owner: "Deciding approver", requiredCondition: "Decision postponed within the safe window", evidenceRequirement: "Deferral reason recorded", decisionRequirement: "Named human decision", exitCriteria: "Re-evaluation before latest safe decision time", blockers: "Not entered" },
  { state: "Escalated", status: "Pending", enteredAt: "—", owner: "R. Venkatesan, Duty Incident Commander", requiredCondition: "Approver unavailable or policy exception raised", evidenceRequirement: "Escalation rationale", decisionRequirement: "Incident commander acknowledgement", exitCriteria: "Alternate approver assigned", blockers: "Not entered" },
  { state: "Execution authorized", status: "Pending", enteredAt: "—", owner: "Network Operations", requiredCondition: "Approval complete and rollback ready", evidenceRequirement: "Rollback test record", decisionRequirement: "Authorization issued by a named human", exitCriteria: "Action handed to the recovery workflow", blockers: "Not entered" },
  { state: "Execution in progress", status: "Pending", enteredAt: "—", owner: "Traffic Transition Agent", requiredCondition: "Guardrails continuously satisfied", evidenceRequirement: "Live telemetry stream", decisionRequirement: "None while guardrails hold", exitCriteria: "Traffic transition steps complete", blockers: "Not entered" },
  { state: "Validation in progress", status: "Pending", enteredAt: "—", owner: "SLO Guardian", requiredCondition: "Validation criteria evaluated", evidenceRequirement: "Customer service validation record", decisionRequirement: "None", exitCriteria: "All validation criteria pass", blockers: "Not entered" },
  { state: "Completed", status: "Pending", enteredAt: "—", owner: "Incident Commander", requiredCondition: "Validation passed and audit complete", evidenceRequirement: "Full audit history", decisionRequirement: "Closure acknowledgement", exitCriteria: "Approval request closed", blockers: "Not entered" },
  { state: "Rolled back", status: "Pending", enteredAt: "—", owner: "RF Fallback Guardian", requiredCondition: "Rollback trigger met", evidenceRequirement: "Rollback evidence record", decisionRequirement: "Rollback owner acknowledgement", exitCriteria: "Traffic returned to the safest available route", blockers: "Not entered" },
  { state: "Expired", status: "Pending", enteredAt: "—", owner: "Policy Guardian Agent", requiredCondition: "Latest safe decision time passed", evidenceRequirement: "Expiry record", decisionRequirement: "None", exitCriteria: "Recommendation regenerated", blockers: "Not entered" },
  { state: "Cancelled", status: "Pending", enteredAt: "—", owner: "Incident Commander", requiredCondition: "Situation resolved or superseded", evidenceRequirement: "Cancellation rationale", decisionRequirement: "Named human decision", exitCriteria: "Approval request closed without execution", blockers: "Not entered" },
];

/* ------------------------------- KPI cards -------------------------------- */

export interface ApprovalKpi {
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

export const approvalKpis: ApprovalKpi[] = [
  { id: "kpi-pending", title: "Pending Approvals", value: "7", sub: "Three high priority, four standard", status: "watch", trend: "flat", previous: "6", target: "5 or fewer", at: "11:06:18 UTC", explain: "Synthetic demonstration value. Governed actions currently waiting on a named human decision." },
  { id: "kpi-ready", title: "Approval Ready", value: "5", sub: "Evidence, policy, and rollback complete", status: "good", trend: "up", previous: "4", target: "All pending", at: "11:06:18 UTC", explain: "Synthetic demonstration value. Requests whose evidence, policy evaluation and rollback plan are complete." },
  { id: "kpi-autonomous", title: "Actions Executable Autonomously", value: "18", sub: "Within current policy guardrails", status: "good", trend: "up", previous: "16", target: "Grow with proven reliability", at: "11:05:40 UTC", explain: "Synthetic demonstration value. Low risk, reversible actions permitted without human approval at the current autonomy level." },
  { id: "kpi-human", title: "Human Review Required", value: "7", sub: "Customer or service impact exceeds policy threshold", status: "watch", trend: "flat", previous: "7", target: "Reduce only with evidence", at: "11:05:40 UTC", explain: "Synthetic demonstration value. Actions that policy holds back for a named human approver." },
  { id: "kpi-time", title: "Average Approval Time", value: "3m 16s", sub: "Synthetic demonstration value", status: "good", trend: "down", previous: "4m 02s", target: "Under 5m", at: "11:06:00 UTC", explain: "Synthetic demonstration value. Median time from recommendation to recorded decision today." },
  { id: "kpi-rejected", title: "Actions Rejected Today", value: "2", sub: "Both retained for investigation", status: "neutral", trend: "flat", previous: "2", target: "No target", at: "10:58:12 UTC", explain: "Synthetic demonstration value. Rejections are evidence, not failures — both remain attached to their investigations." },
  { id: "kpi-rollback", title: "Rollback Ready", value: "100%", sub: "For all pending high impact actions", status: "good", trend: "flat", previous: "100%", target: "100%", at: "11:04:55 UTC", explain: "Synthetic demonstration value. Every high impact pending action has a tested rollback plan." },
  { id: "kpi-policy", title: "Policy Compliance", value: "98.9%", sub: "One approval exception under review", status: "watch", trend: "down", previous: "99.4%", target: "100%", at: "11:00:10 UTC", explain: "Synthetic demonstration value. Share of decisions today that satisfied every policy rule without exception." },
];

/* --------------------------- pending action queue ------------------------- */

export type Reversibility = "Fully reversible" | "Reversible with coordination" | "Partially reversible" | "Not reversible";
export type PolicyStatus = "Within policy" | "Approval required" | "Policy exception" | "Blocked";
export type QueuePriority = "P1" | "P2" | "P3";

export interface PendingAction {
  id: string;
  priority: QueuePriority;
  action: string;
  actionType: string;
  customer: string;
  serviceId: string;
  serviceName: string;
  region: string;
  product: string;
  situationId: string;
  expectedResult: string;
  actionRisk: ActionRisk;
  customerRisk: ActionRisk;
  servicesAffected: number;
  capacityAffected: string;
  sloImpact: string;
  reversibility: Reversibility;
  rollbackReadiness: string;
  policyStatus: PolicyStatus;
  requiredApprover: string;
  state: ApprovalState;
  latestSafeDecision: string;
  confidence: number;
  agent: string;
  lastUpdate: string;
  autonomyLevel: number;
}

export const pendingActions: PendingAction[] = [
  {
    id: APPROVAL_ID, priority: "P1", action: "Maintain Chennai priority traffic on RF fallback",
    actionType: "Governed traffic transition", customer: situationHeader.customer,
    serviceId: situationHeader.serviceId, serviceName: chennaiService?.name ?? situationHeader.serviceName,
    region: "India South", product: "Lightbridge Pro", situationId: SITUATION_ID,
    expectedResult: "Priority traffic protected while optical margin recovers",
    actionRisk: "Moderate", customerRisk: "Low", servicesAffected: 1, capacityAffected: "10 Gbps",
    sloImpact: "Error budget preserved by 22 percent", reversibility: "Fully reversible",
    rollbackReadiness: "Tested 11:04 UTC", policyStatus: "Approval required",
    requiredApprover: "Service Reliability Owner", state: "Awaiting required approver",
    latestSafeDecision: "12:35 UTC", confidence: 94, agent: nameOf("agent-fallback", "RF Fallback Guardian"),
    lastUpdate: "11:06:18 UTC", autonomyLevel: 3,
  },
  {
    id: "APR-2026-0417-04", priority: "P1", action: "Return Chennai traffic incrementally to optical transport",
    actionType: "Governed traffic transition", customer: situationHeader.customer,
    serviceId: situationHeader.serviceId, serviceName: chennaiService?.name ?? situationHeader.serviceName,
    region: "India South", product: "Lightbridge Pro", situationId: SITUATION_ID,
    expectedResult: "Full 10 Gbps optical capacity restored after sustained recovery",
    actionRisk: "High", customerRisk: "High", servicesAffected: 1, capacityAffected: "10 Gbps",
    sloImpact: "Budget risk if restored early", reversibility: "Fully reversible",
    rollbackReadiness: "Tested 11:04 UTC", policyStatus: "Approval required",
    requiredApprover: "Network Operations Approver", state: "Awaiting additional evidence",
    latestSafeDecision: "13:05 UTC", confidence: 62, agent: nameOf("agent-path", "Optical Path Investigator"),
    lastUpdate: "11:05:02 UTC", autonomyLevel: 3,
  },
  {
    id: "APR-2026-0402-01", priority: "P2", action: "Reacquire Mumbai beam alignment",
    actionType: "Optical alignment", customer: "Mumbai Metro Carrier", serviceId: "csvc-mumbai-118",
    serviceName: "Mumbai Metro Transport 118", region: "India West", product: "Lightbridge Pro",
    situationId: "SIT-2026-0402", expectedResult: "Beam lock margin restored to nominal",
    actionRisk: "Moderate", customerRisk: "Moderate", servicesAffected: 1, capacityAffected: "6 Gbps",
    sloImpact: "Neutral", reversibility: "Reversible with coordination", rollbackReadiness: "Tested 09:40 UTC",
    policyStatus: "Approval required", requiredApprover: "Optical Engineering Owner",
    state: "Partially approved", latestSafeDecision: "12:10 UTC", confidence: 81,
    agent: nameOf("agent-path", "Optical Path Investigator"), lastUpdate: "10:58:44 UTC", autonomyLevel: 3,
  },
  {
    id: "APR-2026-0391-02", priority: "P2", action: "Reroute Rio beam mesh traffic",
    actionType: "Mesh reroute", customer: "Rio Metro Broadband", serviceId: "csvc-rio-072",
    serviceName: "Rio Metro Access 072", region: "Brazil South East", product: "Lightbridge Mesh",
    situationId: "SIT-2026-0391", expectedResult: "Congested mesh hop bypassed without capacity loss",
    actionRisk: "Moderate", customerRisk: "Low", servicesAffected: 3, capacityAffected: "12 Gbps",
    sloImpact: "Latency objective protected", reversibility: "Fully reversible",
    rollbackReadiness: "Tested 08:22 UTC", policyStatus: "Approval required",
    requiredApprover: "Network Operations Approver", state: "Awaiting required approver",
    latestSafeDecision: "12:45 UTC", confidence: 88, agent: nameOf("agent-capacity", "Capacity Planner"),
    lastUpdate: "10:52:19 UTC", autonomyLevel: 3,
  },
  {
    id: "APR-2026-0388-01", priority: "P2", action: "Increase Nairobi fallback capacity allocation",
    actionType: "Capacity allocation", customer: "Nairobi Regional ISP", serviceId: "csvc-nairobi-055",
    serviceName: "Nairobi Regional Backhaul 055", region: "Kenya Central", product: "Lightbridge Pro",
    situationId: "SIT-2026-0388", expectedResult: "Fallback headroom raised ahead of forecast rain fade",
    actionRisk: "Low", customerRisk: "Low", servicesAffected: 2, capacityAffected: "4 Gbps",
    sloImpact: "Preventive", reversibility: "Fully reversible", rollbackReadiness: "Tested 10:11 UTC",
    policyStatus: "Within policy", requiredApprover: "Autonomous within policy",
    state: "Execution authorized", latestSafeDecision: "13:30 UTC", confidence: 91,
    agent: nameOf("agent-fallback", "RF Fallback Guardian"), lastUpdate: "10:47:31 UTC", autonomyLevel: 5,
  },
  {
    id: "APR-2026-0417-05", priority: "P1", action: "Roll back terminal firmware 4.8.2 on the Chennai pair",
    actionType: "Firmware rollback", customer: situationHeader.customer,
    serviceId: situationHeader.serviceId, serviceName: chennaiService?.name ?? situationHeader.serviceName,
    region: "India South", product: "Lightbridge Pro", situationId: SITUATION_ID,
    expectedResult: "Firmware returned to 4.8.1 baseline",
    actionRisk: "High", customerRisk: "High", servicesAffected: 1, capacityAffected: "10 Gbps",
    sloImpact: "Direct budget consumption during reload", reversibility: "Partially reversible",
    rollbackReadiness: "Not tested for this pair", policyStatus: "Blocked",
    requiredApprover: "Product Engineering Approver", state: "Rejected",
    latestSafeDecision: "Expired", confidence: 18, agent: nameOf("agent-change", "Change Correlation Agent"),
    lastUpdate: "10:44:09 UTC", autonomyLevel: 3,
  },
  {
    id: "APR-2026-0417-06", priority: "P3", action: "Restart the telemetry ingestion component",
    actionType: "Platform restart", customer: "Taara internal", serviceId: "csvc-internal-telemetry",
    serviceName: "Optical telemetry ingestion", region: "Global", product: "Platform services",
    situationId: SITUATION_ID, expectedResult: "Ingestion lag returned below 20 seconds",
    actionRisk: "Low", customerRisk: "Low", servicesAffected: 0, capacityAffected: "None",
    sloImpact: "Observability only", reversibility: "Fully reversible", rollbackReadiness: "Tested 09:05 UTC",
    policyStatus: "Within policy", requiredApprover: "Autonomous within policy",
    state: "Completed", latestSafeDecision: "Not applicable", confidence: 96,
    agent: nameOf("agent-telemetry", "Telemetry Integrity Agent"), lastUpdate: "10:31:52 UTC", autonomyLevel: 4,
  },
  {
    id: "APR-2026-0417-07", priority: "P2", action: "Dispatch a field technician for mounting inspection",
    actionType: "Field dispatch", customer: situationHeader.customer,
    serviceId: situationHeader.serviceId, serviceName: chennaiService?.name ?? situationHeader.serviceName,
    region: "India South", product: "Lightbridge Pro", situationId: SITUATION_ID,
    expectedResult: "On site confirmation of terminal mounting stability",
    actionRisk: "Low", customerRisk: "Low", servicesAffected: 1, capacityAffected: "None",
    sloImpact: "None", reversibility: "Not reversible", rollbackReadiness: "Not applicable",
    policyStatus: "Approval required", requiredApprover: "Regional Operations Owner",
    state: "Deferred", latestSafeDecision: "16:00 UTC", confidence: 24,
    agent: nameOf("agent-path", "Optical Path Investigator"), lastUpdate: "10:39:18 UTC", autonomyLevel: 3,
  },
  {
    id: "APR-2026-0417-08", priority: "P2", action: "Pause the planned Chennai terminal change window",
    actionType: "Change control", customer: situationHeader.customer,
    serviceId: situationHeader.serviceId, serviceName: chennaiService?.name ?? situationHeader.serviceName,
    region: "India South", product: "Lightbridge Pro", situationId: SITUATION_ID,
    expectedResult: "No planned change collides with the active situation",
    actionRisk: "Low", customerRisk: "Low", servicesAffected: 1, capacityAffected: "None",
    sloImpact: "Protects budget", reversibility: "Fully reversible", rollbackReadiness: "Not required",
    policyStatus: "Approval required", requiredApprover: "Network Operations Approver",
    state: "Approved", latestSafeDecision: "11:45 UTC", confidence: 93,
    agent: nameOf("agent-change", "Change Correlation Agent"), lastUpdate: "10:55:27 UTC", autonomyLevel: 3,
  },
  {
    id: "APR-2026-0417-09", priority: "P3", action: "Increase monitoring frequency for a high risk link",
    actionType: "Monitoring change", customer: situationHeader.customer,
    serviceId: situationHeader.serviceId, serviceName: chennaiService?.name ?? situationHeader.serviceName,
    region: "India South", product: "Lightbridge Pro", situationId: SITUATION_ID,
    expectedResult: "Telemetry cadence raised from 30 s to 5 s on the affected link",
    actionRisk: "Low", customerRisk: "Low", servicesAffected: 1, capacityAffected: "None",
    sloImpact: "None", reversibility: "Fully reversible", rollbackReadiness: "Automatic",
    policyStatus: "Within policy", requiredApprover: "Autonomous within policy",
    state: "Execution in progress", latestSafeDecision: "Not applicable", confidence: 97,
    agent: nameOf("agent-telemetry", "Telemetry Integrity Agent"), lastUpdate: "11:03:12 UTC", autonomyLevel: 4,
  },
];

export const QUEUE_COLUMNS = [
  { key: "priority", label: "Priority" },
  { key: "id", label: "Approval request" },
  { key: "action", label: "Recommended action" },
  { key: "customer", label: "Customer" },
  { key: "serviceName", label: "Customer service" },
  { key: "region", label: "Region" },
  { key: "product", label: "Product" },
  { key: "situationId", label: "Situation" },
  { key: "expectedResult", label: "Expected result" },
  { key: "actionRisk", label: "Action risk" },
  { key: "customerRisk", label: "Customer risk" },
  { key: "servicesAffected", label: "Services affected" },
  { key: "capacityAffected", label: "Capacity affected" },
  { key: "sloImpact", label: "SLO impact" },
  { key: "reversibility", label: "Reversibility" },
  { key: "rollbackReadiness", label: "Rollback readiness" },
  { key: "policyStatus", label: "Policy status" },
  { key: "requiredApprover", label: "Required approver" },
  { key: "state", label: "Approval state" },
  { key: "latestSafeDecision", label: "Latest safe decision" },
  { key: "confidence", label: "Confidence" },
  { key: "agent", label: "Assigned agent" },
  { key: "lastUpdate", label: "Last update" },
] as const;
export type QueueColumnKey = (typeof QUEUE_COLUMNS)[number]["key"];

export const DEFAULT_QUEUE_COLUMNS: QueueColumnKey[] = [
  "priority", "id", "action", "customer", "region", "actionRisk", "customerRisk",
  "reversibility", "rollbackReadiness", "policyStatus", "requiredApprover", "state",
  "latestSafeDecision", "confidence",
];

export const QUEUE_GROUPINGS = [
  "No grouping", "Risk", "Approver", "Autonomy level", "Customer", "Region", "Action type",
] as const;
export type QueueGrouping = (typeof QUEUE_GROUPINGS)[number];

export const savedQueueViews = [
  { id: "view-all", name: "All pending actions", columns: DEFAULT_QUEUE_COLUMNS, grouping: "No grouping" as QueueGrouping },
  { id: "view-high", name: "High risk awaiting approval", columns: DEFAULT_QUEUE_COLUMNS, grouping: "Risk" as QueueGrouping },
  { id: "view-governance", name: "Governance review", columns: ["id", "action", "policyStatus", "requiredApprover", "state", "reversibility", "rollbackReadiness"] as QueueColumnKey[], grouping: "Approver" as QueueGrouping },
  { id: "view-autonomy", name: "Autonomy candidates", columns: ["id", "action", "actionRisk", "reversibility", "policyStatus", "state", "confidence"] as QueueColumnKey[], grouping: "Autonomy level" as QueueGrouping },
];

/* ------------------------ selected recommendation ------------------------ */

export const selectedRecommendation = {
  reason:
    "The primary optical path has not yet met the sustained recovery criteria. Fog dispersal timing remains a forecast rather than an observation, and returning traffic early would very likely cause a second customer impact.",
  expectedResult: "Priority traffic stays protected on the validated RF fallback while optical margin recovers, then returns incrementally under validation.",
  evidenceCompleteness: 96,
  estimatedDuration: "38 minutes of continued fallback, then a 6 minute incremental return",
  validationReadiness: "12 criteria defined, 7 already passing",
  rollbackReadiness: "Rollback plan tested at 11:04 UTC with 10 of 10 steps passing",
  conclusionReference: investigationConclusion.statement ?? "Investigation conclusion attached",
  fallbackReference: `RF fallback active since ${fallbackState.activatedAt} with ${fallbackState.headroom} headroom`,
  weatherReference: `${weatherContext.forecast}. ${weatherContext.confidence}.`,
  terminalReference: `${terminalHealth.length} terminals monitored, both reporting healthy`,
};

export const RECOMMENDATION_TABS = [
  "Summary", "Expected Outcome", "Risk", "Affected Services", "Alternatives",
  "Rollback", "Evidence", "Policy", "Approvers", "History",
] as const;
export type RecommendationTab = (typeof RECOMMENDATION_TABS)[number];

/* --------------------- expected result and outcomes ---------------------- */

export const expectedOutcomes = [
  "Customer service remains available",
  "Priority traffic remains protected",
  "Temporary latency remains within the fallback objective",
  "Premature optical restoration is avoided",
  "The 10 Gbps committed service remains protected",
  "Error budget consumption is minimized",
  "Customer communications remain precautionary",
  "Full optical traffic resumes after sustained recovery",
  "No terminal restart is required",
  "No field dispatch is required",
];

export interface MeasuredOutcome {
  label: string;
  value: string;
  note: string;
}

export const measuredOutcomes: MeasuredOutcome[] = [
  { label: "Capacity protected", value: "10 Gbps", note: "Full committed capacity of the customer service" },
  { label: "Availability protected", value: "99.95% objective maintained", note: "No availability breach expected" },
  { label: "Expected latency", value: "7.2 ms", note: "During fallback, within the 12 ms fallback objective" },
  { label: "Expected packet loss", value: "0.008%", note: "Below the 0.2 percent threshold" },
  { label: "Expected fallback duration", value: "38 minutes", note: "Until sustained recovery criteria are met" },
  { label: "Error budget preserved", value: "22%", note: "Compared with an immediate optical return" },
  { label: "Outage minutes avoided", value: "45", note: "Modelled against the premature restoration path" },
  { label: "Field visit avoided", value: "1", note: "No mounting inspection dispatch required" },
  { label: "Service credit exposure avoided", value: "USD 18,400", note: "Synthetic contractual exposure estimate" },
  { label: "Customer impact probability after action", value: "4%", note: "With the recommended action approved" },
  { label: "Customer impact probability without action", value: "68%", note: "If traffic returns to optical now" },
];

export interface DecisionOption {
  id: string;
  option: string;
  customerOutcome: string;
  sreOutcome: string;
  impactProbability: string;
  errorBudget: string;
  risk: ActionRisk;
  recommended?: boolean;
}

export const decisionOptions: DecisionOption[] = [
  { id: "opt-approve", option: "Approve now", customerOutcome: "Priority traffic protected, service available throughout", sreOutcome: "Controlled fallback with validated return criteria", impactProbability: "4%", errorBudget: "22% preserved", risk: "Moderate", recommended: true },
  { id: "opt-defer", option: "Defer 15 minutes", customerOutcome: "Unchanged for 15 minutes, decision window narrows", sreOutcome: "Fallback continues without a governed return plan", impactProbability: "11%", errorBudget: "18% preserved", risk: "Moderate" },
  { id: "opt-reject", option: "Reject and return to optical immediately", customerOutcome: "Likely second degradation within 20 minutes", sreOutcome: "Repeat incident and renewed investigation", impactProbability: "68%", errorBudget: "9% preserved", risk: "High" },
  { id: "opt-none", option: "Take no action", customerOutcome: "Best effort classes stay shaped indefinitely", sreOutcome: "Fallback held with no return criteria and an open situation", impactProbability: "31%", errorBudget: "14% preserved", risk: "Moderate" },
];

/* ------------------------- risk and alternatives ------------------------- */

export interface ActionOption {
  id: string;
  name: string;
  recommended?: boolean;
  customerOutcome: string;
  actionRisk: ActionRisk;
  customerRisk: ActionRisk;
  sloImpact: string;
  capacityEffect: string;
  latencyEffect: string;
  complexity: "Low" | "Moderate" | "High";
  timeToExecute: string;
  reversibility: Reversibility;
  rollbackComplexity: "Low" | "Moderate" | "High";
  policyStatus: PolicyStatus;
  requiredApprover: string;
  confidence: number;
  evidenceSupport: string;
  rank: number;
  /** risk matrix placement, 1 to 5 */
  likelihood: number;
  impact: number;
  operationalEffect: string;
}

export const actionOptions: ActionOption[] = [
  { id: "act-recommended", name: "Maintain fallback and restore optical traffic incrementally after validation", recommended: true, customerOutcome: "Service available, priority classes protected, controlled return", actionRisk: "Moderate", customerRisk: "Low", sloImpact: "Budget preserved by 22 percent", capacityEffect: "10 Gbps protected", latencyEffect: "+3.6 ms during fallback", complexity: "Moderate", timeToExecute: "38 min then 6 min return", reversibility: "Fully reversible", rollbackComplexity: "Low", policyStatus: "Approval required", requiredApprover: "Service Reliability Owner and Network Operations Approver", confidence: 94, evidenceSupport: "38 supporting evidence items", rank: 1, likelihood: 2, impact: 2, operationalEffect: "Single governed transition with continuous validation" },
  { id: "act-return-now", name: "Return all traffic to optical immediately", customerOutcome: "Full capacity briefly restored, second degradation likely", actionRisk: "High", customerRisk: "High", sloImpact: "Further budget consumption likely", capacityEffect: "10 Gbps at risk", latencyEffect: "Returns to 1.4 ms then degrades", complexity: "Low", timeToExecute: "6 min", reversibility: "Fully reversible", rollbackComplexity: "Low", policyStatus: "Approval required", requiredApprover: "Network Operations Approver", confidence: 21, evidenceSupport: "4 supporting evidence items", rank: 5, likelihood: 4, impact: 4, operationalEffect: "Repeat incident and renewed investigation" },
  { id: "act-all-rf", name: "Remain entirely on RF fallback", customerOutcome: "Priority protected, best effort classes shaped indefinitely", actionRisk: "Moderate", customerRisk: "Moderate", sloImpact: "Latency objective at risk over time", capacityEffect: "6 Gbps ceiling", latencyEffect: "+6.4 ms sustained", complexity: "Low", timeToExecute: "10 min", reversibility: "Fully reversible", rollbackComplexity: "Low", policyStatus: "Approval required", requiredApprover: "Service Reliability Owner", confidence: 58, evidenceSupport: "17 supporting evidence items", rank: 3, likelihood: 3, impact: 3, operationalEffect: "Open situation with no defined exit" },
  { id: "act-fiber", name: "Move traffic to the alternate fiber route", customerOutcome: "Full capacity through the partner with a brief transition", actionRisk: "Moderate", customerRisk: "Moderate", sloImpact: "Neutral", capacityEffect: "10 Gbps via partner", latencyEffect: "+3.6 ms", complexity: "High", timeToExecute: "26 min", reversibility: "Reversible with coordination", rollbackComplexity: "High", policyStatus: "Approval required", requiredApprover: "Network Operations Approver and partner", confidence: 64, evidenceSupport: "12 supporting evidence items", rank: 2, likelihood: 3, impact: 2, operationalEffect: "Partner dependency and coordination overhead" },
  { id: "act-restart", name: "Restart the terminal pair", customerOutcome: "Full interruption for approximately 4 minutes with no expected benefit", actionRisk: "High", customerRisk: "High", sloImpact: "Direct budget consumption", capacityEffect: "0 Gbps during restart", latencyEffect: "Service unavailable", complexity: "Moderate", timeToExecute: "9 min", reversibility: "Partially reversible", rollbackComplexity: "High", policyStatus: "Blocked", requiredApprover: "Optical Engineering Owner", confidence: 8, evidenceSupport: "0 supporting evidence items", rank: 7, likelihood: 5, impact: 5, operationalEffect: "Guardrail prohibits simultaneous restart during an active incident" },
  { id: "act-beam", name: "Reacquire the optical beam", customerOutcome: "Brief optical interruption, unlikely to change attenuation", actionRisk: "Moderate", customerRisk: "Moderate", sloImpact: "Minor consumption", capacityEffect: "Optical offline for 90 s", latencyEffect: "Fallback only during reacquisition", complexity: "Moderate", timeToExecute: "4 min", reversibility: "Fully reversible", rollbackComplexity: "Low", policyStatus: "Approval required", requiredApprover: "Optical Engineering Owner", confidence: 19, evidenceSupport: "2 supporting evidence items", rank: 6, likelihood: 3, impact: 4, operationalEffect: "Alignment is already nominal, so benefit is improbable" },
  { id: "act-field", name: "Dispatch a field technician", customerOutcome: "No customer change, on site confirmation only", actionRisk: "Low", customerRisk: "Low", sloImpact: "None", capacityEffect: "None", latencyEffect: "None", complexity: "Low", timeToExecute: "3 h 20 min", reversibility: "Not reversible", rollbackComplexity: "Moderate", policyStatus: "Approval required", requiredApprover: "Regional Operations Owner", confidence: 12, evidenceSupport: "1 supporting evidence item", rank: 4, likelihood: 1, impact: 1, operationalEffect: "Cost and travel with no telemetry indication of a mounting fault" },
];

export const RISK_MATRIX_AXES = {
  likelihood: ["Rare", "Unlikely", "Possible", "Likely", "Almost certain"],
  impact: ["Negligible", "Minor", "Moderate", "Major", "Severe"],
};

export const riskComparisonNote =
  "The recommended action offers the best balance of customer protection, technical risk, reversibility and policy compliance. All comparison values are synthetic demonstration data.";

/* --------------------- affected services and topology -------------------- */

export const blastRadius = [
  { label: "Customer services directly affected", value: "1" },
  { label: "Committed capacity governed by the action", value: "10 Gbps" },
  { label: "Downstream mobile tower clusters protected", value: "3" },
  { label: "Synthetic downstream users protected", value: "Approximately 42,000" },
  { label: "SLOs affected", value: "1" },
  { label: "Terminals monitored", value: "2" },
  { label: "RF fallback routes used", value: "1" },
];

export const affectedInventory = [
  { label: "Primary customer", value: situationHeader.customer, owner: "A. Rahman, Customer Operations", role: "Directly affected" },
  { label: "Customer service", value: chennaiService?.name ?? situationHeader.serviceName, owner: "P. Nandakumar, Service Reliability Owner", role: "Directly affected" },
  { label: "Committed capacity", value: "10 Gbps", owner: "Commercial", role: "Protected" },
  { label: "Downstream mobile tower clusters", value: "3 clusters, 34 sites", owner: "Customer operations", role: "Indirectly affected" },
  { label: "Synthetic downstream users", value: "Approximately 42,000", owner: "Customer operations", role: "Protected" },
  { label: "Terminal A", value: terminalHealth[0]?.name ?? "Terminal A", owner: "S. Krishnan, Optical Engineering", role: "Monitored" },
  { label: "Terminal B", value: terminalHealth[1]?.name ?? "Terminal B", owner: "S. Krishnan, Optical Engineering", role: "Monitored" },
  { label: "Primary optical path", value: chennaiLink?.name ?? situationHeader.linkName, owner: "Taara operations", role: "Directly changed" },
  { label: "RF fallback path", value: "Chennai RF fallback", owner: "Taara operations", role: "Directly changed" },
  { label: "Alternate fiber path", value: "Partner fiber backup", owner: "Network partner", role: "Contingency" },
  { label: "Partner aggregation network", value: "Chennai partner aggregation", owner: "Network partner", role: "Indirectly affected" },
  { label: "SLO", value: "99.95% monthly availability", owner: "SLO Guardian", role: "Affected" },
  { label: "Error budget", value: "3.4% consumed this month", owner: "SLO Guardian", role: "Affected" },
  { label: "Current incident", value: SITUATION_ID, owner: "R. Venkatesan, Duty Incident Commander", role: "Source" },
  { label: "Active changes", value: "1 planned change paused", owner: "Change Correlation Agent", role: "Held" },
];

/** Role of each shared route object under the recommended action. */
export const topologyImpactRoles: Record<string, "Directly changed" | "Indirectly affected" | "Protected" | "At risk" | "Rollback path"> = {
  "n-customer": "Protected",
  "n-edge": "Indirectly affected",
  "n-partner": "Indirectly affected",
  "n-handoff": "Indirectly affected",
  "n-terminal-a": "Directly changed",
  "n-terminal-b": "Directly changed",
  "n-regional": "Indirectly affected",
  "n-towers": "Protected",
  "n-downstream": "Protected",
  "e-primary": "At risk",
  "e-rf": "Directly changed",
  "e-alt": "Rollback path",
  "e-fiber": "Rollback path",
};

export const trafficPaths = {
  current: "Terminal A to Terminal B over RF fallback for priority classes",
  proposed: "RF fallback retained, then incremental return to the primary optical path",
  rollback: "Return priority traffic to the most stable available route, fiber backup if optical remains degraded",
};

/* ------------------------------ rollback plan ---------------------------- */

export const rollbackPlan = {
  trigger:
    "If RF fallback latency exceeds 12 ms, packet loss exceeds 0.5%, available fallback headroom falls below 20%, or customer service validation fails, return priority traffic to the most stable available route and escalate to the incident commander.",
  owner: "N. Iyer, Network Operations with RF Fallback Guardian",
  action: "Return priority traffic to the most stable available route and escalate",
  duration: "6 minutes expected",
  preconditions: "Alternate fiber route validated, incident commander reachable, telemetry stream healthy",
  validationChecks: "Customer reachability, throughput, latency, packet loss, fallback headroom",
  customerImpact: "Sub second traffic movement, no expected loss of service availability",
  dataRequired: "Live optical, RF and customer service telemetry at 5 second cadence",
  policyStatus: "Within policy" as PolicyStatus,
  lastTested: "11:04:55 UTC today",
  confidence: "97 percent rollback confidence",
  evidenceCompleteness: "100 percent, 10 of 10 steps evidenced",
};

export interface RollbackStep {
  id: string;
  step: string;
  owner: string;
  actor: "Agent" | "Human";
  status: "Ready" | "Passed" | "Pending" | "Failed";
  evidence: string;
  duration: string;
  failureHandling: string;
}

export const rollbackSteps: RollbackStep[] = [
  { id: "rb-1", step: "Detect rollback threshold", owner: nameOf("agent-fallback", "RF Fallback Guardian"), actor: "Agent", status: "Ready", evidence: "Threshold monitor configuration", duration: "5 s", failureHandling: "Escalate to incident commander if telemetry is stale" },
  { id: "rb-2", step: "Pause further traffic movement", owner: "Traffic Transition Agent", actor: "Agent", status: "Ready", evidence: "Transition control lock", duration: "3 s", failureHandling: "Hard stop and require human control" },
  { id: "rb-3", step: "Validate the primary optical route", owner: nameOf("agent-path", "Optical Path Investigator"), actor: "Agent", status: "Ready", evidence: "Optical margin sample", duration: "20 s", failureHandling: "Mark route ineligible and continue" },
  { id: "rb-4", step: "Validate the alternate fiber route", owner: "Network partner liaison", actor: "Human", status: "Ready", evidence: "Partner handoff validation", duration: "90 s", failureHandling: "Fall back to RF only and escalate" },
  { id: "rb-5", step: "Select the safest available route", owner: "N. Iyer, Network Operations", actor: "Human", status: "Ready", evidence: "Route comparison record", duration: "30 s", failureHandling: "Escalate to incident commander" },
  { id: "rb-6", step: "Transition traffic", owner: "Traffic Transition Agent", actor: "Agent", status: "Ready", evidence: "Transition execution log", duration: "60 s", failureHandling: "Revert to the prior route and stop" },
  { id: "rb-7", step: "Validate the customer service", owner: nameOf("agent-customer", "Customer Impact Agent"), actor: "Agent", status: "Ready", evidence: "Customer service validation record", duration: "45 s", failureHandling: "Declare rollback failed and escalate" },
  { id: "rb-8", step: "Notify operations", owner: "A. Rahman, Customer Operations", actor: "Human", status: "Ready", evidence: "Operations notification record", duration: "30 s", failureHandling: "Escalate to the duty incident commander" },
  { id: "rb-9", step: "Record rollback evidence", owner: "Incident Commander Agent", actor: "Agent", status: "Ready", evidence: "Rollback evidence package", duration: "15 s", failureHandling: "Flag audit gap for governance review" },
  { id: "rb-10", step: "Reopen the investigation", owner: "M. Dorai, SRE Investigation Owner", actor: "Human", status: "Ready", evidence: `Investigation ${INVESTIGATION_ID}`, duration: "20 s", failureHandling: "Escalate to governance review" },
];

/* ---------------------------- validation criteria ------------------------ */

export interface ValidationCriterion {
  id: string;
  criterion: string;
  status: "Ready" | "Passed" | "Pending" | "Failed" | "Not applicable";
  current: string;
  required: string;
  owner: string;
  evidence: string;
  failureResponse: string;
}

export const validationCriteria: ValidationCriterion[] = [
  { id: "vc-reach", criterion: "Customer service remains reachable", status: "Passed", current: "Reachable", required: "Reachable", owner: nameOf("agent-customer", "Customer Impact Agent"), evidence: "Service reachability probe 11:06 UTC", failureResponse: "Trigger rollback immediately" },
  { id: "vc-throughput", criterion: "Delivered throughput remains above the temporary minimum", status: "Passed", current: "8.6 Gbps", required: "At or above 8.0 Gbps", owner: "SLO Guardian", evidence: "Service delivery telemetry", failureResponse: "Pause transition and reassess capacity" },
  { id: "vc-latency", criterion: "Latency remains within the fallback objective", status: "Passed", current: "7.2 ms", required: "Below 12 ms", owner: nameOf("agent-fallback", "RF Fallback Guardian"), evidence: "Fallback latency series", failureResponse: "Trigger rollback" },
  { id: "vc-loss", criterion: "Packet loss remains below threshold", status: "Passed", current: "0.008%", required: "Below 0.2%", owner: "SLO Guardian", evidence: "Loss measurement window", failureResponse: "Trigger rollback" },
  { id: "vc-headroom", criterion: "RF fallback capacity remains above minimum headroom", status: "Passed", current: fallbackState.headroom, required: "Above 20 percent", owner: nameOf("agent-fallback", "RF Fallback Guardian"), evidence: "Fallback capacity record", failureResponse: "Stop traffic movement and escalate" },
  { id: "vc-terma", criterion: "Terminal A remains healthy", status: "Passed", current: "Healthy", required: "Healthy", owner: "S. Krishnan, Optical Engineering", evidence: "Terminal A telemetry snapshot", failureResponse: "Halt and reopen the investigation" },
  { id: "vc-termb", criterion: "Terminal B remains healthy", status: "Passed", current: "Healthy", required: "Healthy", owner: "S. Krishnan, Optical Engineering", evidence: "Terminal B telemetry snapshot", failureResponse: "Halt and reopen the investigation" },
  { id: "vc-margin", criterion: "Optical link margin continues recovering", status: "Pending", current: "7.9 dB and rising", required: "Above 8.5 dB for 15 continuous minutes", owner: nameOf("agent-path", "Optical Path Investigator"), evidence: "Optical margin series", failureResponse: "Hold fallback and extend the window" },
  { id: "vc-others", criterion: "No additional customer services are affected", status: "Passed", current: "0 additional services", required: "0", owner: nameOf("agent-customer", "Customer Impact Agent"), evidence: "Service health sweep", failureResponse: "Escalate and widen the situation scope" },
  { id: "vc-budget", criterion: "Error budget calculation is updated", status: "Pending", current: "Recalculation in progress", required: "Updated within 5 minutes", owner: "SLO Guardian", evidence: "Error budget attribution record", failureResponse: "Flag governance review" },
  { id: "vc-comms", criterion: "Customer communication is current", status: "Ready", current: "Precautionary notice issued 10:58 UTC", required: "Issued within 30 minutes", owner: "A. Rahman, Customer Operations", evidence: "Customer communication log", failureResponse: "Issue an immediate update" },
  { id: "vc-evidence", criterion: "Evidence package is complete", status: "Pending", current: "96 percent", required: "At or above 90 percent", owner: "Incident Commander Agent", evidence: "Evidence completeness score", failureResponse: "Request the missing evidence item" },
];

/* -------------------------------- evidence ------------------------------- */

export const EVIDENCE_CATEGORIES = [
  "Investigation conclusion", "Optical telemetry", "Terminal telemetry", "Weather data",
  "Network validation", "Customer service performance", "RF fallback validation",
  "Similar incidents", "Recent changes", "SLO analysis", "Error budget analysis",
  "Action simulation", "Rollback test", "Policy evaluation", "Human notes",
] as const;
export type EvidenceCategory = (typeof EVIDENCE_CATEGORIES)[number];

export interface ApprovalEvidence {
  id: string;
  title: string;
  category: EvidenceCategory;
  source: string;
  at: string;
  reliability: "High" | "Medium" | "Low";
  freshness: string;
  relevance: "Decisive" | "Supporting" | "Contextual";
  hypothesisSupported: string;
  actionSupported: string;
  addedBy: string;
  detail: string;
}

export const approvalEvidence: ApprovalEvidence[] = [
  { id: "ae-conclusion", title: "Investigation conclusion: atmospheric attenuation", category: "Investigation conclusion", source: INVESTIGATION_ID, at: "11:04:22 UTC", reliability: "High", freshness: "2 m", relevance: "Decisive", hypothesisSupported: "Atmospheric attenuation caused by dense fog", actionSupported: "Maintain fallback", addedBy: "M. Dorai, SRE Investigation Owner", detail: "Leading cause confirmed at 94 percent confidence with six causes eliminated." },
  { id: "ae-optical", title: "Optical margin recovery series", category: "Optical telemetry", source: "Optical path telemetry", at: "11:06:02 UTC", reliability: "High", freshness: "16 s", relevance: "Decisive", hypothesisSupported: "Atmospheric attenuation caused by dense fog", actionSupported: "Maintain fallback", addedBy: nameOf("agent-path", "Optical Path Investigator"), detail: "Margin at 7.9 dB and rising, still below the 8.5 dB sustained recovery threshold." },
  { id: "ae-terminal", title: "Terminal pair health snapshot", category: "Terminal telemetry", source: "Terminal telemetry", at: "11:05:12 UTC", reliability: "High", freshness: "1 m", relevance: "Supporting", hypothesisSupported: "Equipment fault eliminated", actionSupported: "No terminal restart", addedBy: "S. Krishnan, Optical Engineering", detail: "Both terminals healthy with nominal alignment, power and temperature." },
  { id: "ae-weather", title: "Fog dispersal forecast", category: "Weather data", source: "Atmospheric model", at: "11:03:48 UTC", reliability: "Medium", freshness: "3 m", relevance: "Supporting", hypothesisSupported: "Atmospheric attenuation caused by dense fog", actionSupported: "Delay optical return", addedBy: nameOf("agent-weather", "Weather Risk Agent"), detail: weatherContext.forecast },
  { id: "ae-network", title: "Partner handoff validation", category: "Network validation", source: "Network validation probe", at: "10:47:10 UTC", reliability: "High", freshness: "19 m", relevance: "Contextual", hypothesisSupported: "Partner fault eliminated", actionSupported: "Retain current route topology", addedBy: "N. Iyer, Network Operations", detail: "Upstream handoff clean in both directions with no errored seconds." },
  { id: "ae-service", title: "Customer service performance window", category: "Customer service performance", source: "Service delivery telemetry", at: "11:05:44 UTC", reliability: "High", freshness: "34 s", relevance: "Decisive", hypothesisSupported: "Customer impact contained", actionSupported: "Maintain fallback", addedBy: nameOf("agent-customer", "Customer Impact Agent"), detail: "Availability objective maintained. Priority classes unaffected." },
  { id: "ae-fallback", title: "RF fallback validation record", category: "RF fallback validation", source: "Fallback validation", at: "10:49:02 UTC", reliability: "High", freshness: "17 m", relevance: "Decisive", hypothesisSupported: "Fallback capacity sufficient", actionSupported: "Maintain fallback", addedBy: nameOf("agent-fallback", "RF Fallback Guardian"), detail: `Fallback carrying ${fallbackState.currentThroughput} with ${fallbackState.headroom} headroom.` },
  { id: "ae-similar", title: "Similar incident SIT-2025-1188", category: "Similar incidents", source: "Incident knowledge base", at: "11:01:20 UTC", reliability: "Medium", freshness: "5 m", relevance: "Supporting", hypothesisSupported: "Atmospheric attenuation caused by dense fog", actionSupported: "Delay optical return", addedBy: "Incident Knowledge Agent", detail: "Premature restoration in a comparable fog event caused a second impact within 18 minutes." },
  { id: "ae-change", title: "Change window review", category: "Recent changes", source: "Change register", at: "10:44:09 UTC", reliability: "High", freshness: "22 m", relevance: "Contextual", hypothesisSupported: "Change related cause eliminated", actionSupported: "Pause planned change", addedBy: nameOf("agent-change", "Change Correlation Agent"), detail: "No configuration changes on the path in the last 14 days." },
  { id: "ae-slo", title: "SLO impact analysis", category: "SLO analysis", source: "SLO Guardian", at: "11:03:00 UTC", reliability: "High", freshness: "3 m", relevance: "Supporting", hypothesisSupported: "Customer impact contained", actionSupported: "Maintain fallback", addedBy: "SLO Guardian", detail: "Availability objective of 99.95 percent maintained under fallback." },
  { id: "ae-budget", title: "Error budget attribution", category: "Error budget analysis", source: "SLO Guardian", at: "11:05:55 UTC", reliability: "Medium", freshness: "25 s", relevance: "Supporting", hypothesisSupported: "Customer impact contained", actionSupported: "Maintain fallback", addedBy: "SLO Guardian", detail: "3.4 percent of the monthly budget consumed. Recalculation in progress." },
  { id: "ae-sim", title: "Action outcome simulation", category: "Action simulation", source: "Governed action simulator", at: "11:05:31 UTC", reliability: "Medium", freshness: "48 s", relevance: "Decisive", hypothesisSupported: "Recommended action optimal", actionSupported: "Maintain fallback", addedBy: "Incident Commander Agent", detail: "Simulated impact probability of 4 percent with the action against 68 percent without it." },
  { id: "ae-rollback", title: "Rollback plan test result", category: "Rollback test", source: "Rollback simulator", at: "11:04:55 UTC", reliability: "High", freshness: "1 m", relevance: "Decisive", hypothesisSupported: "Action reversible", actionSupported: "Maintain fallback", addedBy: "N. Iyer, Network Operations", detail: "10 of 10 rollback steps passed in the deterministic test." },
  { id: "ae-policy", title: "Policy evaluation record", category: "Policy evaluation", source: "Policy Guardian Agent", at: "11:02:21 UTC", reliability: "High", freshness: "4 m", relevance: "Decisive", hypothesisSupported: "Approval required", actionSupported: "Route to human approvers", addedBy: "Policy Guardian Agent", detail: "Traffic transition on a critical customer service requires two independent approvers." },
  { id: "ae-note", title: "Optical engineering reviewer note", category: "Human notes", source: "Reviewer note", at: "11:03:33 UTC", reliability: "High", freshness: "3 m", relevance: "Supporting", hypothesisSupported: "Atmospheric attenuation caused by dense fog", actionSupported: "Maintain fallback", addedBy: "S. Krishnan, Optical Engineering", detail: "Recovery criteria of 8.5 dB for 15 minutes agreed as the correct restoration gate." },
];

export const decisionRationale =
  "The evidence supports maintaining RF fallback because the primary optical path has not yet met sustained recovery criteria. Both terminals are healthy, fallback capacity is sufficient, customer impact remains controlled, and the action is reversible.";

/* ---------------------------- autonomy and policy ------------------------ */

export interface AutonomyLevel {
  level: number;
  name: string;
  description: string;
}

export const autonomyLevels: AutonomyLevel[] = [
  { level: 1, name: "Observe Only", description: "Agents detect and explain conditions but cannot recommend operational actions." },
  { level: 2, name: "Recommend", description: "Agents generate actions but cannot initiate approval." },
  { level: 3, name: "Recommend and Request Approval", description: "Agents generate recommendations and route them to required human approvers." },
  { level: 4, name: "Execute Low Risk Actions", description: "Agents may execute reversible, low impact actions within policy." },
  { level: 5, name: "Execute Within Approved Policy", description: "Agents may execute actions within approved customer, service, risk, and technical boundaries." },
  { level: 6, name: "Autonomous Within Defined Guardrails", description: "Agents may detect, decide, execute, validate, and roll back within explicitly approved guardrails." },
];

export const policyEvaluation = [
  { label: "Action type", value: "Governed traffic transition" },
  { label: "Risk classification", value: "Moderate" },
  { label: "Customer impact classification", value: "Critical customer service" },
  { label: "SLO impact", value: "Availability objective in scope" },
  { label: "Service criticality", value: "Tier 1" },
  { label: "Reversibility", value: "Fully reversible in 6 minutes" },
  { label: "Rollback readiness", value: "Tested, 10 of 10 steps passing" },
  { label: "Evidence completeness", value: "96 percent" },
  { label: "Required autonomy level", value: "Level 5 to execute without approval" },
  { label: "Current autonomy level", value: "Level 3, Recommend and Request Approval" },
  { label: "Human approval requirement", value: "Two independent approvers" },
  { label: "Separation of duties", value: "Satisfied, recommending agent excluded" },
  { label: "Emergency restriction", value: "Emergency stop available to any named authority" },
  { label: "Policy result", value: "Human approval required" },
];

export const policyResult =
  "Human approval required because the action changes the active customer traffic path for a critical customer service.";

export interface PolicyRule {
  id: string;
  rule: string;
  applies: "Applies" | "Does not apply";
  effect: string;
  source: string;
}

export const policyRules: PolicyRule[] = [
  { id: "pr-traffic", rule: "Traffic transitions affecting critical services require human approval.", applies: "Applies", effect: "Routes the action to named human approvers", source: "Service governance policy 2.1" },
  { id: "pr-capacity", rule: "Actions affecting more than 5 Gbps require network operations approval.", applies: "Applies", effect: "Adds the Network Operations Approver", source: "Capacity governance policy 3.4" },
  { id: "pr-customer", rule: "Actions with customer impact require service reliability approval.", applies: "Applies", effect: "Adds the Service Reliability Owner", source: "Customer governance policy 1.2" },
  { id: "pr-irreversible", rule: "Nonreversible actions require two approvers.", applies: "Does not apply", effect: "Action is fully reversible", source: "Change governance policy 4.0" },
  { id: "pr-restart", rule: "Terminal restarts during active incidents require optical engineering approval.", applies: "Does not apply", effect: "No terminal restart in this action", source: "Optical governance policy 2.6" },
  { id: "pr-firmware", rule: "Firmware rollback requires product engineering approval.", applies: "Does not apply", effect: "No firmware change in this action", source: "Product governance policy 5.1" },
  { id: "pr-monitoring", rule: "Low risk monitoring changes may execute autonomously.", applies: "Does not apply", effect: "This action is not a monitoring change", source: "Autonomy policy 1.0" },
  { id: "pr-emergency", rule: "Emergency stop overrides every autonomy level.", applies: "Applies", effect: "Emergency controls remain available throughout", source: "Safety policy 0.1" },
];

/* ------------------------------- guardrails ------------------------------ */

export const GUARDRAIL_GROUPS = [
  "Customer", "Service", "Technical", "Capacity", "SLO", "Security", "Change", "Time window", "Ownership", "Evidence",
] as const;
export type GuardrailGroup = (typeof GUARDRAIL_GROUPS)[number];

export interface Guardrail {
  id: string;
  group: GuardrailGroup;
  guardrail: string;
  status: "Passed" | "Warning" | "Blocked" | "Not applicable";
  current: string;
  required: string;
  evidence: string;
  source: string;
  enforcement: "Blocking" | "Advisory";
}

export const guardrails: Guardrail[] = [
  { id: "gr-capacity-min", group: "Customer", guardrail: "Do not reduce customer capacity below the temporary minimum.", status: "Passed", current: "8.6 Gbps delivered", required: "At or above 8.0 Gbps", evidence: "ae-service", source: "Customer governance policy 1.2", enforcement: "Blocking" },
  { id: "gr-fallback-cap", group: "Capacity", guardrail: "Do not exceed fallback route capacity.", status: "Passed", current: `${fallbackState.currentThroughput} of ${fallbackState.totalCapacity}`, required: "Below 6 Gbps", evidence: "ae-fallback", source: "Capacity governance policy 3.4", enforcement: "Blocking" },
  { id: "gr-headroom", group: "Capacity", guardrail: "Do not transition traffic if fallback headroom is below 20%.", status: "Passed", current: fallbackState.headroom, required: "Above 20 percent", evidence: "ae-fallback", source: "Capacity governance policy 3.5", enforcement: "Blocking" },
  { id: "gr-margin", group: "Technical", guardrail: "Do not return traffic to optical until link margin is stable for 15 minutes.", status: "Warning", current: "7.9 dB, 0 minutes sustained", required: "Above 8.5 dB for 15 minutes", evidence: "ae-optical", source: "Optical governance policy 2.2", enforcement: "Blocking" },
  { id: "gr-restart", group: "Technical", guardrail: "Do not restart both terminals simultaneously.", status: "Not applicable", current: "No restart in this action", required: "Never simultaneous", evidence: "ae-terminal", source: "Optical governance policy 2.6", enforcement: "Blocking" },
  { id: "gr-firmware", group: "Change", guardrail: "Do not change firmware during an active customer incident.", status: "Not applicable", current: "No firmware change", required: "No firmware change while a situation is open", evidence: "ae-change", source: "Change governance policy 4.2", enforcement: "Blocking" },
  { id: "gr-rollback", group: "Technical", guardrail: "Do not execute without rollback readiness.", status: "Passed", current: "Rollback tested 11:04:55 UTC", required: "Tested within 24 hours", evidence: "ae-rollback", source: "Change governance policy 4.0", enforcement: "Blocking" },
  { id: "gr-confidence", group: "Evidence", guardrail: "Do not proceed if customer impact confidence is below 80%.", status: "Passed", current: "94 percent", required: "At or above 80 percent", evidence: "ae-sim", source: "Evidence policy 6.1", enforcement: "Blocking" },
  { id: "gr-approvers", group: "Ownership", guardrail: "Do not proceed if required approvers are unavailable.", status: "Warning", current: "1 of 2 approvers ready", required: "All required approvers available", evidence: "ae-policy", source: "Service governance policy 2.1", enforcement: "Blocking" },
  { id: "gr-validation", group: "Service", guardrail: "Stop execution immediately if validation fails.", status: "Passed", current: "7 of 12 criteria passing, none failed", required: "No failed criteria", evidence: "ae-service", source: "Service governance policy 2.3", enforcement: "Blocking" },
  { id: "gr-slo", group: "SLO", guardrail: "Do not consume more than 10 percent of the monthly error budget in one action.", status: "Passed", current: "3.4 percent consumed", required: "Below 10 percent", evidence: "ae-budget", source: "SLO policy 7.1", enforcement: "Advisory" },
  { id: "gr-window", group: "Time window", guardrail: "Do not execute outside the recommended execution window without escalation.", status: "Passed", current: "Window 12:05 to 13:05 UTC", required: "Inside the window or escalated", evidence: "ae-policy", source: "Change governance policy 4.5", enforcement: "Advisory" },
  { id: "gr-security", group: "Security", guardrail: "Every execution authorization must be attributable to a named human identity.", status: "Passed", current: "Named approvers assigned", required: "Named identity recorded", evidence: "ae-policy", source: "Safety policy 0.2", enforcement: "Blocking" },
];

/* -------------------------------- approvers ------------------------------ */

export type ApproverDecision = "Pending" | "Ready to Approve" | "Approved" | "Approved with conditions" | "Rejected" | "Deferred" | "Reviewed" | "Optional Review Complete" | "Unavailable";

export interface Approver {
  id: string;
  name: string;
  role: string;
  responsibility: string;
  kind: "Required" | "Reviewer";
  status: ApproverDecision;
  assignedAt: string;
  evidenceReviewed: number;
  note: string;
  availability: string;
  escalationPath: string;
  sodStatus: string;
}

export const approvers: Approver[] = [
  { id: "apv-reliability", name: "P. Nandakumar, Service Reliability Owner", role: "Service Reliability Owner", responsibility: "Confirm customer, SLO, and reliability impact", kind: "Required", status: "Pending", assignedAt: "11:02:34 UTC", evidenceReviewed: 9, note: "Reviewing the error budget attribution before deciding.", availability: "Available", escalationPath: "R. Venkatesan, Duty Incident Commander", sodStatus: "Independent of the recommending agent" },
  { id: "apv-network", name: "N. Iyer, Network Operations Approver", role: "Network Operations Approver", responsibility: "Confirm traffic path, capacity, and rollback readiness", kind: "Required", status: "Ready to Approve", assignedAt: "11:02:34 UTC", evidenceReviewed: 12, note: "Rollback test passed. Fallback headroom is sufficient.", availability: "Available", escalationPath: "L. Fernandes, Regional Operations Owner", sodStatus: "Independent of the action owner" },
  { id: "apv-optical", name: "S. Krishnan, Optical Engineering Owner", role: "Optical Engineering Owner", responsibility: "Confirm optical recovery criteria", kind: "Reviewer", status: "Reviewed", assignedAt: "11:02:50 UTC", evidenceReviewed: 7, note: "Recovery gate of 8.5 dB for 15 minutes is correct.", availability: "Available", escalationPath: "Optical engineering duty roster", sodStatus: "Advisory only, no approval authority for this action" },
  { id: "apv-customer", name: "A. Rahman, Customer Operations Owner", role: "Customer Operations Owner", responsibility: "Confirm customer communication and operational acceptance", kind: "Reviewer", status: "Optional Review Complete", assignedAt: "11:03:02 UTC", evidenceReviewed: 5, note: "Precautionary customer notice issued at 10:58 UTC.", availability: "Available", escalationPath: "Customer operations duty roster", sodStatus: "Advisory only" },
  { id: "apv-regional", name: "L. Fernandes, Regional Operations Owner", role: "Regional Operations Owner", responsibility: "Confirm regional operational readiness", kind: "Reviewer", status: "Pending", assignedAt: "11:03:15 UTC", evidenceReviewed: 2, note: "No regional constraint identified.", availability: "Available until 13:00 UTC", escalationPath: "R. Venkatesan, Duty Incident Commander", sodStatus: "Advisory only" },
];

export const separationOfDutiesRules = [
  { id: "sod-agent", rule: "The recommending agent cannot approve its own action.", status: "Satisfied", detail: "RF Fallback Guardian recommended the action and holds no approval authority." },
  { id: "sod-owner", rule: "The action owner cannot be the only approver for a customer-impacting action.", status: "Satisfied", detail: "Two independent approvers are assigned from different functions." },
  { id: "sod-two", rule: "High risk actions require two independent approvers.", status: "Satisfied", detail: "Service Reliability and Network Operations approvals are both required." },
  { id: "sod-emergency", rule: "Emergency override requires a named human authority.", status: "Satisfied", detail: "Emergency controls record the acting human identity and reason." },
  { id: "sod-exception", rule: "Policy exceptions require additional governance review.", status: "Satisfied", detail: "No policy exception is currently raised for this request." },
];

export interface ApprovalCondition {
  id: string;
  condition: string;
  owner: string;
  measurement: string;
  currentState: string;
  expiration: string;
  failureResponse: string;
}

export const availableConditions: ApprovalCondition[] = [
  { id: "cond-margin", condition: "Optical link margin remains below the restoration threshold.", owner: nameOf("agent-path", "Optical Path Investigator"), measurement: "Link margin, 5 s cadence", currentState: "7.9 dB, condition holds", expiration: "13:05 UTC", failureResponse: "Re-evaluate the return plan with the approver" },
  { id: "cond-headroom", condition: "RF fallback headroom remains above 25%.", owner: nameOf("agent-fallback", "RF Fallback Guardian"), measurement: "Fallback headroom", currentState: `${fallbackState.headroom}, condition holds`, expiration: "13:05 UTC", failureResponse: "Trigger rollback and escalate" },
  { id: "cond-latency", condition: "Latency remains below 10 ms.", owner: "SLO Guardian", measurement: "Round trip latency", currentState: "7.2 ms, condition holds", expiration: "13:05 UTC", failureResponse: "Pause the transition" },
  { id: "cond-loss", condition: "Packet loss remains below 0.2%.", owner: "SLO Guardian", measurement: "Loss ratio", currentState: "0.008 percent, condition holds", expiration: "13:05 UTC", failureResponse: "Trigger rollback" },
  { id: "cond-services", condition: "No additional services enter a degraded state.", owner: nameOf("agent-customer", "Customer Impact Agent"), measurement: "Service health sweep", currentState: "0 additional services", expiration: "13:05 UTC", failureResponse: "Escalate and widen the situation" },
  { id: "cond-commander", condition: "The incident commander remains active.", owner: "R. Venkatesan, Duty Incident Commander", measurement: "Commander presence", currentState: "Active", expiration: "13:05 UTC", failureResponse: "Escalate to the duty roster" },
  { id: "cond-comms", condition: "Customer operations has been notified.", owner: "A. Rahman, Customer Operations", measurement: "Communication log", currentState: "Notified 10:58 UTC", expiration: "13:05 UTC", failureResponse: "Issue an immediate update" },
  { id: "cond-rollback", condition: "Rollback validation passes.", owner: "N. Iyer, Network Operations", measurement: "Rollback test result", currentState: "10 of 10 steps passed", expiration: "13:05 UTC", failureResponse: "Withhold execution authorization" },
];

/* ---------------------------- audit timeline ----------------------------- */

export const AUDIT_EVENT_TYPES = [
  "Recommendation", "Evidence", "Impact", "Risk", "Alternatives", "Rollback",
  "Policy", "Approver", "Decision", "Execution", "Validation", "Closure", "Emergency",
] as const;
export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];

export interface AuditEvent {
  id: string;
  at: string;
  event: string;
  type: AuditEventType;
  actor: string;
  decision: string;
  evidence: string;
  policy: string;
  state: ApprovalState;
  outcome: string;
  status: "Complete" | "In progress" | "Blocked";
}

export const auditEvents: AuditEvent[] = [
  { id: "aud-1", at: "11:02:04 UTC", event: "Recommendation generated", type: "Recommendation", actor: nameOf("agent-fallback", "RF Fallback Guardian"), decision: "Recommend maintaining fallback", evidence: "ae-conclusion", policy: "Autonomy level 3", state: "Recommendation created", outcome: "Approval request created", status: "Complete" },
  { id: "aud-2", at: "11:02:09 UTC", event: "Investigation conclusion attached", type: "Evidence", actor: "M. Dorai, SRE Investigation Owner", decision: "Attach conclusion", evidence: "ae-conclusion", policy: "Evidence policy 6.1", state: "Recommendation created", outcome: "Evidence completeness raised to 88 percent", status: "Complete" },
  { id: "aud-3", at: "11:02:14 UTC", event: "Customer impact calculated", type: "Impact", actor: nameOf("agent-customer", "Customer Impact Agent"), decision: "No decision required", evidence: "ae-service", policy: "Customer governance policy 1.2", state: "Recommendation created", outcome: "1 customer service, 10 Gbps in scope", status: "Complete" },
  { id: "aud-4", at: "11:02:18 UTC", event: "Risk assessment completed", type: "Risk", actor: "Incident Commander Agent", decision: "Moderate action risk", evidence: "ae-sim", policy: "Risk policy 8.0", state: "Policy evaluation", outcome: "Risk classified as moderate", status: "Complete" },
  { id: "aud-5", at: "11:02:20 UTC", event: "Alternative actions evaluated", type: "Alternatives", actor: "Incident Commander Agent", decision: "Rank 7 candidate actions", evidence: "ae-sim", policy: "Risk policy 8.1", state: "Policy evaluation", outcome: "Recommended action ranked first", status: "Complete" },
  { id: "aud-6", at: "11:02:21 UTC", event: "Policy evaluation completed", type: "Policy", actor: "Policy Guardian Agent", decision: "Human approval required", evidence: "ae-policy", policy: "Service governance policy 2.1", state: "Policy evaluation", outcome: "Two independent approvers required", status: "Complete" },
  { id: "aud-7", at: "11:02:34 UTC", event: "Required approvers assigned", type: "Approver", actor: "Policy Guardian Agent", decision: "Assign two approvers", evidence: "ae-policy", policy: "Service governance policy 2.1", state: "Awaiting required approver", outcome: "Service Reliability and Network Operations assigned", status: "Complete" },
  { id: "aud-8", at: "11:03:33 UTC", event: "Reviewer note added", type: "Approver", actor: "S. Krishnan, Optical Engineering", decision: "Confirm recovery criteria", evidence: "ae-note", policy: "Optical governance policy 2.2", state: "Awaiting required approver", outcome: "Recovery gate confirmed", status: "Complete" },
  { id: "aud-9", at: "11:04:55 UTC", event: "Rollback plan validated", type: "Rollback", actor: "N. Iyer, Network Operations", decision: "Accept rollback plan", evidence: "ae-rollback", policy: "Change governance policy 4.0", state: "Awaiting required approver", outcome: "10 of 10 rollback steps passed", status: "Complete" },
  { id: "aud-10", at: "11:05:31 UTC", event: "Action outcome simulated", type: "Risk", actor: "Incident Commander Agent", decision: "No decision required", evidence: "ae-sim", policy: "Risk policy 8.1", state: "Awaiting required approver", outcome: "Impact probability 4 percent with the action", status: "Complete" },
  { id: "aud-11", at: "11:06:18 UTC", event: "Awaiting service reliability decision", type: "Decision", actor: "P. Nandakumar, Service Reliability Owner", decision: "Pending", evidence: "ae-budget", policy: "Customer governance policy 1.2", state: "Awaiting required approver", outcome: "Decision outstanding", status: "In progress" },
];

/* ------------------------- progressive autonomy -------------------------- */

export const AUTONOMY_MATRIX_COLUMNS = [
  "Observe", "Recommend", "Approval required", "Low risk autonomous", "Policy autonomous", "Prohibited",
] as const;
export type AutonomyMatrixColumn = (typeof AUTONOMY_MATRIX_COLUMNS)[number];

export interface AutonomyMatrixRow {
  id: string;
  action: string;
  assignment: AutonomyMatrixColumn;
  rationale: string;
}

export const autonomyMatrix: AutonomyMatrixRow[] = [
  { id: "am-monitor", action: "Monitor link health", assignment: "Policy autonomous", rationale: "Read only with no customer effect" },
  { id: "am-telemetry", action: "Increase telemetry frequency", assignment: "Low risk autonomous", rationale: "Reversible observability change" },
  { id: "am-investigate", action: "Open an investigation", assignment: "Low risk autonomous", rationale: "No operational change to the service" },
  { id: "am-diagnostics", action: "Collect diagnostics", assignment: "Low risk autonomous", rationale: "Read only diagnostic collection" },
  { id: "am-notify", action: "Notify operations", assignment: "Policy autonomous", rationale: "Communication within approved templates" },
  { id: "am-validate", action: "Validate fallback capacity", assignment: "Low risk autonomous", rationale: "Non disruptive validation probe" },
  { id: "am-noncritical", action: "Transition noncritical traffic", assignment: "Policy autonomous", rationale: "Reversible with defined capacity guardrails" },
  { id: "am-critical", action: "Transition critical traffic", assignment: "Approval required", rationale: "Changes the active path of a critical customer service" },
  { id: "am-restart", action: "Restart a terminal", assignment: "Approval required", rationale: "Service interrupting and only partially reversible" },
  { id: "am-beam", action: "Reacquire a beam", assignment: "Approval required", rationale: "Brief optical interruption during an active situation" },
  { id: "am-firmware", action: "Roll back firmware", assignment: "Prohibited", rationale: "Prohibited during an active customer incident" },
  { id: "am-field", action: "Dispatch field service", assignment: "Approval required", rationale: "Cost and safety accountability requires a named human" },
];

export const maturityStages = [
  { stage: 1, name: "Observe and Explain", state: "Complete", detail: "Agents detect, correlate and explain conditions across the estate." },
  { stage: 2, name: "Recommend and Assist", state: "Complete", detail: "Agents produce evidence backed recommendations with alternatives." },
  { stage: 3, name: "Governed Execution", state: "Current", detail: "Actions execute only after named human approval with tested rollback." },
  { stage: 4, name: "Policy-Based Autonomy", state: "Planned", detail: "Low risk, reversible actions execute inside approved policy boundaries." },
  { stage: 5, name: "Closed Loop Reliability Operations", state: "Planned", detail: "Detect, decide, execute, validate and roll back within explicit guardrails." },
];

export const autonomyReadiness = [
  { id: "rd-evidence", label: "Evidence quality", value: 96, target: 90, note: "Evidence completeness across governed actions today" },
  { id: "rd-prediction", label: "Prediction accuracy", value: 91, target: 90, note: "Predicted against observed outcomes for closed actions" },
  { id: "rd-rollback", label: "Rollback success", value: 100, target: 99, note: "Rollback tests passing for pending high impact actions" },
  { id: "rd-policy", label: "Policy compliance", value: 98.9, target: 100, note: "One approval exception under governance review" },
  { id: "rd-override", label: "Human override rate", value: 7, target: 10, note: "Lower is better. Share of recommendations overridden by humans" },
  { id: "rd-impact", label: "Customer impact from agentic actions", value: 0, target: 0, note: "Lower is better. Customer impacting outcomes caused by agentic actions" },
  { id: "rd-audit", label: "Audit completeness", value: 100, target: 100, note: "Decisions with a complete, attributable audit record" },
  { id: "rd-agent", label: "Agent reliability", value: 94, target: 95, note: "Agent tasks completing without human correction" },
];

export const autonomyDimensions = [
  "Action type", "Customer", "Service criticality", "Region", "Product",
  "Risk level", "Reversibility", "Time window", "Agent", "Evidence quality",
];

/* ---------------------------- emergency controls ------------------------- */

export interface EmergencyControl {
  id: string;
  control: string;
  effect: string;
  servicesAffected: string;
  currentOwner: string;
  requiredAuthority: string;
  auditRequirement: string;
  severity: "high" | "medium";
}

export const emergencyControls: EmergencyControl[] = [
  { id: "ec-pause-all", control: "Pause all agent execution", effect: "All agentic execution stops estate wide, observation continues", servicesAffected: "All governed services", currentOwner: "R. Venkatesan, Duty Incident Commander", requiredAuthority: "Incident commander", auditRequirement: "Reason and named authority recorded", severity: "high" },
  { id: "ec-stop", control: "Stop selected action", effect: "The selected approval request halts before any execution step", servicesAffected: "Chennai Mobile Backhaul Service 041", currentOwner: "N. Iyer, Network Operations", requiredAuthority: "Any required approver", auditRequirement: "Reason recorded", severity: "high" },
  { id: "ec-revoke", control: "Revoke execution authorization", effect: "Authorization is withdrawn and the request returns to approval", servicesAffected: "Chennai Mobile Backhaul Service 041", currentOwner: "P. Nandakumar, Service Reliability Owner", requiredAuthority: "Authorizing approver", auditRequirement: "Reason and evidence recorded", severity: "high" },
  { id: "ec-human", control: "Force human control", effect: "Autonomy drops to Level 1 for the affected service", servicesAffected: "Chennai Mobile Backhaul Service 041", currentOwner: "R. Venkatesan, Duty Incident Commander", requiredAuthority: "Incident commander", auditRequirement: "Reason recorded", severity: "high" },
  { id: "ec-rollback", control: "Trigger rollback", effect: "Rollback plan runs immediately and traffic returns to the safest route", servicesAffected: "Chennai Mobile Backhaul Service 041", currentOwner: "N. Iyer, Network Operations", requiredAuthority: "Rollback owner", auditRequirement: "Rollback evidence package", severity: "high" },
  { id: "ec-lock", control: "Lock customer traffic path", effect: "No further transport change is permitted without two person approval", servicesAffected: "Chennai Mobile Backhaul Service 041", currentOwner: "P. Nandakumar, Service Reliability Owner", requiredAuthority: "Service reliability owner", auditRequirement: "Lock reason recorded", severity: "medium" },
  { id: "ec-escalate", control: "Escalate to incident commander", effect: "The decision is raised to the duty incident commander", servicesAffected: "Chennai Mobile Backhaul Service 041", currentOwner: "R. Venkatesan, Duty Incident Commander", requiredAuthority: "Any approver or reviewer", auditRequirement: "Escalation rationale", severity: "medium" },
  { id: "ec-twoperson", control: "Require two-person approval", effect: "All actions on this service require two independent approvers", servicesAffected: "Chennai Mobile Backhaul Service 041", currentOwner: "Policy Guardian Agent", requiredAuthority: "Service reliability owner", auditRequirement: "Policy change recorded", severity: "medium" },
  { id: "ec-disable", control: "Disable selected digital coworker", effect: "The named agent stops recommending and executing", servicesAffected: "All services in the agent scope", currentOwner: "Platform governance", requiredAuthority: "Incident commander", auditRequirement: "Reason and duration recorded", severity: "medium" },
  { id: "ec-override", control: "Record emergency override reason", effect: "A named human override is recorded against the audit history", servicesAffected: "Selected approval request", currentOwner: "Acting authority", requiredAuthority: "Named human authority", auditRequirement: "Mandatory written reason", severity: "medium" },
];

/* ------------------------------- scenario -------------------------------- */

export interface ApprovalStage {
  id: string;
  index: number;
  title: string;
  narrative: string;
  state: ApprovalState;
  approversCompleted: number;
  evidenceCompleteness: number;
  rollbackReadiness: number;
  validationPassed: number;
  policyResult: string;
  auditEvent: string;
  actor: string;
  autonomyReadiness: number;
}

export const approvalScenario: ApprovalStage[] = [
  { id: "sc-1", index: 1, title: "Agentic recommendation created", narrative: "The RF Fallback Guardian publishes a governed recommendation with the investigation conclusion attached.", state: "Recommendation created", approversCompleted: 0, evidenceCompleteness: 82, rollbackReadiness: 0, validationPassed: 3, policyResult: "Not yet evaluated", auditEvent: "Recommendation generated", actor: nameOf("agent-fallback", "RF Fallback Guardian"), autonomyReadiness: 78 },
  { id: "sc-2", index: 2, title: "Expected customer outcome calculated", narrative: "Customer impact probability is modelled with and without the action.", state: "Recommendation created", approversCompleted: 0, evidenceCompleteness: 85, rollbackReadiness: 0, validationPassed: 4, policyResult: "Not yet evaluated", auditEvent: "Customer impact calculated", actor: nameOf("agent-customer", "Customer Impact Agent"), autonomyReadiness: 79 },
  { id: "sc-3", index: 3, title: "Action risk scored", narrative: "Risk is classified as moderate with low customer risk during fallback.", state: "Policy evaluation", approversCompleted: 0, evidenceCompleteness: 87, rollbackReadiness: 0, validationPassed: 4, policyResult: "Evaluation in progress", auditEvent: "Risk assessment completed", actor: "Incident Commander Agent", autonomyReadiness: 80 },
  { id: "sc-4", index: 4, title: "Affected services identified", narrative: "One customer service, two terminals and three tower clusters are placed in scope.", state: "Policy evaluation", approversCompleted: 0, evidenceCompleteness: 88, rollbackReadiness: 0, validationPassed: 5, policyResult: "Evaluation in progress", auditEvent: "Blast radius calculated", actor: nameOf("agent-customer", "Customer Impact Agent"), autonomyReadiness: 81 },
  { id: "sc-5", index: 5, title: "Alternatives compared", narrative: "Seven candidate actions are ranked. The recommended action leads on reversibility and customer protection.", state: "Policy evaluation", approversCompleted: 0, evidenceCompleteness: 89, rollbackReadiness: 0, validationPassed: 5, policyResult: "Evaluation in progress", auditEvent: "Alternative actions evaluated", actor: "Incident Commander Agent", autonomyReadiness: 82 },
  { id: "sc-6", index: 6, title: "Rollback plan assembled", narrative: "A ten step rollback plan is assembled with named owners for every step.", state: "Policy evaluation", approversCompleted: 0, evidenceCompleteness: 90, rollbackReadiness: 60, validationPassed: 5, policyResult: "Evaluation in progress", auditEvent: "Rollback plan assembled", actor: "N. Iyer, Network Operations", autonomyReadiness: 84 },
  { id: "sc-7", index: 7, title: "Validation criteria confirmed", narrative: "Twelve validation criteria are confirmed with owners and failure responses.", state: "Policy evaluation", approversCompleted: 0, evidenceCompleteness: 91, rollbackReadiness: 70, validationPassed: 6, policyResult: "Evaluation in progress", auditEvent: "Validation criteria confirmed", actor: "SLO Guardian", autonomyReadiness: 85 },
  { id: "sc-8", index: 8, title: "Evidence package completed", narrative: "Fifteen evidence categories reach 96 percent completeness.", state: "Policy evaluation", approversCompleted: 0, evidenceCompleteness: 96, rollbackReadiness: 80, validationPassed: 6, policyResult: "Evaluation in progress", auditEvent: "Evidence package completed", actor: "Incident Commander Agent", autonomyReadiness: 87 },
  { id: "sc-9", index: 9, title: "Policy evaluated", narrative: "Policy determines that a critical service traffic transition needs human approval.", state: "Policy evaluation", approversCompleted: 0, evidenceCompleteness: 96, rollbackReadiness: 85, validationPassed: 6, policyResult: "Human approval required", auditEvent: "Policy evaluation completed", actor: "Policy Guardian Agent", autonomyReadiness: 88 },
  { id: "sc-10", index: 10, title: "Human approval required", narrative: "The action is held. No execution is possible without two named approvals.", state: "Awaiting required approver", approversCompleted: 0, evidenceCompleteness: 96, rollbackReadiness: 85, validationPassed: 6, policyResult: "Human approval required", auditEvent: "Approval gate engaged", actor: "Policy Guardian Agent", autonomyReadiness: 88 },
  { id: "sc-11", index: 11, title: "Service Reliability Owner assigned", narrative: "P. Nandakumar is assigned to confirm customer, SLO and reliability impact.", state: "Awaiting required approver", approversCompleted: 0, evidenceCompleteness: 96, rollbackReadiness: 88, validationPassed: 7, policyResult: "Human approval required", auditEvent: "Required approver assigned", actor: "Policy Guardian Agent", autonomyReadiness: 89 },
  { id: "sc-12", index: 12, title: "Network Operations Approver assigned", narrative: "N. Iyer is assigned to confirm traffic path, capacity and rollback readiness.", state: "Awaiting required approver", approversCompleted: 0, evidenceCompleteness: 96, rollbackReadiness: 90, validationPassed: 7, policyResult: "Human approval required", auditEvent: "Required approver assigned", actor: "Policy Guardian Agent", autonomyReadiness: 89 },
  { id: "sc-13", index: 13, title: "Additional evidence requested", narrative: "The Service Reliability Owner asks for the updated error budget attribution.", state: "Awaiting additional evidence", approversCompleted: 0, evidenceCompleteness: 93, rollbackReadiness: 90, validationPassed: 7, policyResult: "Human approval required", auditEvent: "Additional evidence requested", actor: "P. Nandakumar, Service Reliability Owner", autonomyReadiness: 88 },
  { id: "sc-14", index: 14, title: "Evidence supplied", narrative: "The SLO Guardian supplies the recalculated error budget attribution.", state: "Awaiting required approver", approversCompleted: 0, evidenceCompleteness: 98, rollbackReadiness: 92, validationPassed: 8, policyResult: "Human approval required", auditEvent: "Evidence received", actor: "SLO Guardian", autonomyReadiness: 90 },
  { id: "sc-15", index: 15, title: "Conditional approval added", narrative: "Network Operations approves on condition that fallback headroom stays above 25 percent.", state: "Partially approved", approversCompleted: 1, evidenceCompleteness: 98, rollbackReadiness: 95, validationPassed: 9, policyResult: "Human approval required", auditEvent: "Conditional approval added", actor: "N. Iyer, Network Operations Approver", autonomyReadiness: 91 },
  { id: "sc-16", index: 16, title: "Final approval recorded", narrative: "The Service Reliability Owner approves. Separation of duties is satisfied.", state: "Approved", approversCompleted: 2, evidenceCompleteness: 98, rollbackReadiness: 97, validationPassed: 10, policyResult: "Approved under policy", auditEvent: "Final approval recorded", actor: "P. Nandakumar, Service Reliability Owner", autonomyReadiness: 93 },
  { id: "sc-17", index: 17, title: "Execution authorization issued", narrative: "A named human issues execution authorization with the rollback plan armed.", state: "Execution authorized", approversCompleted: 2, evidenceCompleteness: 98, rollbackReadiness: 100, validationPassed: 10, policyResult: "Approved under policy", auditEvent: "Execution authorized", actor: "N. Iyer, Network Operations", autonomyReadiness: 94 },
  { id: "sc-18", index: 18, title: "Action handed to the recovery workflow", narrative: "The traffic transition is handed to the recovery workflow under continuous guardrails.", state: "Execution in progress", approversCompleted: 2, evidenceCompleteness: 98, rollbackReadiness: 100, validationPassed: 11, policyResult: "Approved under policy", auditEvent: "Execution started", actor: "Traffic Transition Agent", autonomyReadiness: 95 },
  { id: "sc-19", index: 19, title: "Validation results received", narrative: "All twelve validation criteria pass. Customer service remains available throughout.", state: "Validation in progress", approversCompleted: 2, evidenceCompleteness: 100, rollbackReadiness: 100, validationPassed: 12, policyResult: "Approved under policy", auditEvent: "Validation completed", actor: "SLO Guardian", autonomyReadiness: 96 },
  { id: "sc-20", index: 20, title: "Approval request completed", narrative: "The request closes with a complete, attributable audit history.", state: "Completed", approversCompleted: 2, evidenceCompleteness: 100, rollbackReadiness: 100, validationPassed: 12, policyResult: "Approved under policy", auditEvent: "Action closed", actor: "R. Venkatesan, Duty Incident Commander", autonomyReadiness: 97 },
];

export const policyBlockEvent = {
  title: "Policy block simulated",
  detail: "A guardrail exception is raised: fallback headroom is reported below 20 percent. The action is blocked until the guardrail clears.",
  state: "Escalated" as ApprovalState,
};

export const approverUnavailableEvent = {
  title: "Approver unavailable simulated",
  detail: "The Service Reliability Owner is marked unavailable. The request escalates to the duty incident commander for reassignment.",
  state: "Escalated" as ApprovalState,
};

export const rollbackFailureEvent = {
  title: "Rollback failure simulated",
  detail: "Rollback step 4, alternate fiber route validation, fails. Execution authorization is withheld and the incident commander is engaged.",
  state: "Escalated" as ApprovalState,
};

/* ---------------------- governed versus ungoverned ----------------------- */

export interface GovernanceComparisonRow {
  dimension: string;
  ungoverned: string;
  governed: string;
}

export const governanceComparison: GovernanceComparisonRow[] = [
  { dimension: "Customer context", ungoverned: "Trigger fires without knowing which customer is affected", governed: "Customer, service and committed capacity identified before any decision" },
  { dimension: "Service criticality", ungoverned: "All services treated the same", governed: "Tier 1 criticality raises the approval requirement" },
  { dimension: "Risk assessment", ungoverned: "No risk classification", governed: "Action and customer risk scored with a likelihood and impact matrix" },
  { dimension: "Alternative evaluation", ungoverned: "Single scripted response", governed: "Seven alternatives compared and ranked with rationale" },
  { dimension: "Evidence completeness", ungoverned: "Limited to the triggering signal", governed: "Fifteen evidence categories at 96 percent completeness" },
  { dimension: "Policy validation", ungoverned: "None", governed: "Eight policy rules evaluated with a recorded result" },
  { dimension: "Required approvers", ungoverned: "None", governed: "Two independent named approvers required" },
  { dimension: "Separation of duties", ungoverned: "Not enforced", governed: "The recommending agent cannot approve its own action" },
  { dimension: "Rollback readiness", ungoverned: "Minimal or untested", governed: "Ten step rollback plan tested before authorization" },
  { dimension: "Validation criteria", ungoverned: "Success assumed", governed: "Twelve criteria with owners and failure responses" },
  { dimension: "Emergency control", ungoverned: "Stop requires engineering intervention", governed: "Emergency stop overrides every autonomy level" },
  { dimension: "Audit history", ungoverned: "Incomplete or scattered", governed: "Every decision attributable to a named actor with evidence" },
];

export const comparisonDisclaimer =
  "Ungoverned automation is shown only as a contrast. It is not a recommended operating model. All values are synthetic demonstration data.";
