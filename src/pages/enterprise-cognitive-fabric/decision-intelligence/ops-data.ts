/**
 * Decision Intelligence — Prompt 2 operational models and deterministic logic.
 *
 * Everything here is a pure function of the Prompt 1 seeds plus local
 * scenario parameters. No enterprise system is called. An enterprise decision
 * service can replace the `scenario*`, `sensitivity*` and `threshold*` helpers
 * without changing any interface consumed by the UI.
 */

import {
  alternativeRisks, alternatives, alternativesFor, constraintsFor, deriveDecisionState,
  diPersonas, evidenceFor, evidenceById, evaluations, outcomesFor, personaPositions,
  priorDecisions, sharedDependencies, tradeoffsFor,
  type DecisionPosture, type DerivedDecisionState, type Magnitude, type PersonaPosition,
  type ProposalParams,
} from "./data";

/* ================================================================ scenario = */

export type DeploymentTiming = "Normal Window" | "Quarter End Restricted Window" | "Maintenance Window";
export type ObservationWindow = "6 Hours" | "24 Hours" | "48 Hours" | "72 Hours";

export interface DecisionScenarioParams extends ProposalParams {
  alternativeId: string;
  deploymentTiming: DeploymentTiming;
  idempotencyEvidence: "Validated" | "Missing";
  fraudLossAnalysis: "Provided" | "Missing";
  dependencyStressTest: "Provided" | "Missing";
  rollbackCapability: "Available" | "Unavailable";
  observationWindow: ObservationWindow;
}

export const baselineScenario: DecisionScenarioParams = {
  alternativeId: "ALT 5001 B",
  trafficExposure: 5,
  progressiveRollout: true,
  deploymentWindow: "Standard",
  retryAttempts: 3,
  removedEvidence: [],
  addedEvidence: [],
  deploymentTiming: "Normal Window",
  idempotencyEvidence: "Validated",
  fraudLossAnalysis: "Missing",
  dependencyStressTest: "Missing",
  rollbackCapability: "Available",
  observationWindow: "24 Hours",
};

export const trafficOptions = [5, 10, 15, 25, 50, 100];
export const retryOptions = [2, 3, 4];
export const timingOptions: DeploymentTiming[] = ["Normal Window", "Quarter End Restricted Window", "Maintenance Window"];
export const observationOptions: ObservationWindow[] = ["6 Hours", "24 Hours", "48 Hours", "72 Hours"];

/** Map the extended scenario onto the Prompt 1 proposal contract. */
export function toProposal(p: DecisionScenarioParams): ProposalParams {
  const added = new Set(p.addedEvidence);
  const removed = new Set(p.removedEvidence);
  if (p.fraudLossAnalysis === "Provided") added.add("EVD 8"); else added.delete("EVD 8");
  if (p.dependencyStressTest === "Provided") added.add("EVD 9"); else added.delete("EVD 9");
  if (p.idempotencyEvidence === "Missing") removed.add("EVD 5"); else removed.delete("EVD 5");
  if (p.rollbackCapability === "Unavailable") removed.add("EVD 11"); else removed.delete("EVD 11");
  return {
    trafficExposure: p.trafficExposure,
    progressiveRollout: p.progressiveRollout,
    deploymentWindow: p.deploymentTiming === "Quarter End Restricted Window" ? "Quarter End Restricted" : "Standard",
    retryAttempts: p.retryAttempts,
    removedEvidence: [...removed],
    addedEvidence: [...added],
  };
}

const rank: Record<string, number> = {
  None: 0, Low: 1, "Low to Medium": 2, Medium: 3, "Medium High": 4, High: 5, Critical: 6,
};
const byRank = (n: number): Magnitude =>
  (["Low", "Low", "Low to Medium", "Medium", "Medium High", "High", "Critical"][Math.max(0, Math.min(6, n))] as Magnitude);
export const magnitudeRank = (m: string) => rank[m] ?? 3;

export interface DecisionScenarioState extends DerivedDecisionState {
  reversibilityAdjusted: Magnitude;
  fraudRisk: Magnitude;
  dependencyRisk: Magnitude;
  duplicateAuthRisk: Magnitude;
  coordinationCost: Magnitude;
  operationalComplexity: Magnitude;
  financialExposure: Magnitude;
  customerBenefit: Magnitude;
  businessBenefit: Magnitude;
  timeToBenefit: string;
  governanceRequirements: string[];
  approvalRequirements: string[];
  evidenceGaps: string[];
  expectedCompletionLift: string;
  personaPositions: Record<string, PersonaPosition>;
}

/** Deterministic scenario derivation layered on top of Prompt 1 derivation. */
export function scenarioState(p: DecisionScenarioParams): DecisionScenarioState {
  const base = deriveDecisionState(toProposal(p));
  const t = p.trafficExposure;
  const broad = t >= 50;

  let fraud = t >= 100 ? 6 : t >= 50 ? 5 : t > 10 ? 5 : 4;
  if (p.fraudLossAnalysis === "Provided") fraud -= 2;
  if (!p.progressiveRollout) fraud += 1;
  const fraudRisk = byRank(fraud);

  let dep = t >= 100 ? 5 : t >= 25 ? 4 : 3;
  if (p.dependencyStressTest === "Provided") dep -= 2;
  if (!p.progressiveRollout) dep += 1;
  const dependencyRisk = byRank(dep);

  let dup = p.retryAttempts >= 4 ? 5 : p.retryAttempts === 3 ? 4 : 2;
  if (p.idempotencyEvidence === "Validated") dup -= 2;
  if (broad) dup += 1;
  const duplicateAuthRisk = byRank(dup);

  const reversibilityAdjusted: Magnitude =
    p.rollbackCapability === "Unavailable" ? (broad ? "Low" : "Low to Medium")
      : p.progressiveRollout ? (broad ? "Medium" : "High") : broad ? "Low" : "Medium";

  const coordinationCost = byRank(p.progressiveRollout ? (t > 15 ? 4 : 3) : 2);
  const operationalComplexity = byRank(
    (p.progressiveRollout ? 3 : 2) + (p.observationWindow === "72 Hours" ? 1 : 0) + (t > 25 ? 1 : 0));
  const financialExposure = byRank(Math.max(1, Math.round(t / 20) + (p.fraudLossAnalysis === "Provided" ? 0 : 1)));
  const customerBenefit = byRank(Math.min(6, 2 + Math.round(t / 25) + (p.retryAttempts >= 3 ? 2 : 0)));
  const businessBenefit = byRank(Math.min(6, 2 + Math.round(t / 30) + (p.retryAttempts >= 3 ? 1 : 0)));

  const timeToBenefit = !p.progressiveRollout ? "Immediate at full exposure"
    : t <= 5 ? "3 to 4 weeks staged"
      : t <= 15 ? "2 to 3 weeks staged"
        : t <= 50 ? "10 to 14 days staged" : "5 to 7 days staged";

  const governanceRequirements = [
    t > 10 ? "Release Governance approval required above 10% traffic" : "Release Governance advisory only at current exposure",
    p.deploymentTiming === "Quarter End Restricted Window"
      ? "Quarter end restriction blocks deployment in the final three business days"
      : "Deployment window is unrestricted",
    p.rollbackCapability === "Unavailable" ? "Change Advisory review required without automated rollback" : "Automated rollback control satisfied",
  ];

  const approvalRequirements = [
    "Decision Owner, Commerce Architecture Council",
    "Team Review, Checkout Engineering, Payments Reliability, Fraud Engineering, Site Reliability Engineering",
    ...(t > 10 ? ["Governance Approval, Release Governance"] : []),
    ...(p.rollbackCapability === "Unavailable" || t >= 100 ? ["Executive Approval, Commerce Executive Sponsor"] : []),
  ];

  const evidenceGaps = [
    ...(p.fraudLossAnalysis === "Provided" ? [] : ["Fraud Loss Analysis not yet produced"]),
    ...(p.dependencyStressTest === "Provided" ? [] : ["Regional Dependency Stress Test not yet produced"]),
    ...(p.idempotencyEvidence === "Validated" ? [] : ["Idempotency validation evidence removed"]),
    ...(p.rollbackCapability === "Available" ? [] : ["Rollback validation unavailable"]),
  ];

  const liftLow = (0.6 + t / 100).toFixed(1);
  const liftHigh = (1.4 + t / 60).toFixed(1);
  const expectedCompletionLift = `+${liftLow}% to +${liftHigh}%`;

  const positions: Record<string, PersonaPosition> = {
    "PER 4101": t >= 25 ? "Support" : "Support",
    "PER 4102": p.idempotencyEvidence === "Validated" ? (broad ? "Concerned" : "Conditional Support") : "Concerned",
    "PER 4103": p.fraudLossAnalysis === "Provided" ? (t > 15 ? "Conditional Support" : "Support with Concern") : t > 10 ? "Oppose" : "Conditional",
    "PER 4104": p.progressiveRollout && p.rollbackCapability === "Available" ? "Conditional Support" : "Concerned",
    "PER 4105": p.dependencyStressTest === "Provided" ? "Conditional Support" : "Concerned",
    "PER 4107": p.deploymentTiming === "Quarter End Restricted Window" ? "Oppose" : t > 10 ? "Conditional" : "Neutral",
  };

  return {
    ...base,
    reversibilityAdjusted, fraudRisk, dependencyRisk, duplicateAuthRisk, coordinationCost,
    operationalComplexity, financialExposure, customerBenefit, businessBenefit, timeToBenefit,
    governanceRequirements, approvalRequirements, evidenceGaps, expectedCompletionLift,
    personaPositions: positions,
  };
}

/* ====================================================== scenario comparison = */

export interface NamedScenario { id: string; name: string; description: string; params: DecisionScenarioParams }

export const seedScenarios: NamedScenario[] = [
  {
    id: "SCN A", name: "Scenario A", description: "Three retries · 5% traffic · progressive rollout",
    params: { ...baselineScenario, trafficExposure: 5, progressiveRollout: true },
  },
  {
    id: "SCN B", name: "Scenario B", description: "Three retries · 15% traffic · progressive rollout",
    params: { ...baselineScenario, trafficExposure: 15, progressiveRollout: true },
  },
  {
    id: "SCN C", name: "Scenario C", description: "Three retries · 100% traffic · no progressive rollout",
    params: { ...baselineScenario, trafficExposure: 100, progressiveRollout: false },
  },
];

export const comparisonDimensions = [
  "Customer Benefit", "Business Benefit", "Financial Exposure", "Reliability", "Fraud Risk",
  "Dependency Risk", "Operational Complexity", "Coordination Cost", "Governance Requirements",
  "Evidence Sufficiency", "Reversibility", "Expected Time to Benefit", "Recommendation Posture",
  "Recommendation Confidence",
] as const;
export type ComparisonDimension = (typeof comparisonDimensions)[number];

export function scenarioDimensionValue(d: ComparisonDimension, s: DecisionScenarioState): string {
  switch (d) {
    case "Customer Benefit": return s.customerBenefit;
    case "Business Benefit": return s.businessBenefit;
    case "Financial Exposure": return s.financialExposure;
    case "Reliability": return s.duplicateAuthRisk === "Low" ? "High" : s.duplicateAuthRisk === "Medium" ? "Medium" : "At Risk";
    case "Fraud Risk": return s.fraudRisk;
    case "Dependency Risk": return s.dependencyRisk;
    case "Operational Complexity": return s.operationalComplexity;
    case "Coordination Cost": return s.coordinationCost;
    case "Governance Requirements": return `${s.approvalRequirements.length} stages`;
    case "Evidence Sufficiency": return `${s.evidenceCoverage}%`;
    case "Reversibility": return s.reversibilityAdjusted;
    case "Expected Time to Benefit": return s.timeToBenefit;
    case "Recommendation Posture": return s.posture;
    case "Recommendation Confidence": return `${s.confidence}%`;
  }
}

export type DeltaLabel = "Improved" | "Worsened" | "New Requirement" | "Resolved Requirement" | "Unchanged";

export function positionDelta(before: PersonaPosition, after: PersonaPosition): DeltaLabel {
  const order: PersonaPosition[] = ["Oppose", "Concerned", "Review Required", "Conditional", "Neutral", "Conditional Support", "Support with Concern", "Support"];
  const a = order.indexOf(before);
  const b = order.indexOf(after);
  if (a === b) return "Unchanged";
  if (before !== "Conditional" && after === "Conditional") return "New Requirement";
  if (before === "Conditional" && after !== "Conditional") return "Resolved Requirement";
  return b > a ? "Improved" : "Worsened";
}

/* ==================================================== sensitivity analysis = */

export interface DecisionSensitivity {
  id: string;
  evaluationId: string;
  variable: string;
  currentValue: string;
  threshold: string;
  sensitivity: "Critical" | "High" | "Medium" | "Low";
  affectedAlternativeIds: string[];
  affectedPersonaIds: string[];
  affectedConditionIds: string[];
  recommendationEffect: string;
}

export function sensitivityAnalysis(p: DecisionScenarioParams): DecisionSensitivity[] {
  const s = scenarioState(p);
  const mk = (
    variable: string, currentValue: string, threshold: string,
    sensitivity: DecisionSensitivity["sensitivity"], alts: string[], personas: string[],
    conds: string[], effect: string, i: number,
  ): DecisionSensitivity => ({
    id: `DSN ${5600 + i}`, evaluationId: "DIA 5001", variable, currentValue, threshold, sensitivity,
    affectedAlternativeIds: alts, affectedPersonaIds: personas, affectedConditionIds: conds,
    recommendationEffect: effect,
  });

  return [
    mk("Traffic Exposure", `${p.trafficExposure}%`, "10%", p.trafficExposure > 10 ? "High" : "High",
      ["ALT 5001 B", "ALT 5001 C"], ["PER 4103", "PER 4107"], ["DCN 1"],
      p.trafficExposure > 10 ? "Joint approval is active at the current exposure" : "Activates joint approval above 10%", 1),
    mk("Fraud Loss", p.fraudLossAnalysis === "Provided" ? "Analysed" : "Unknown", "Any material increase",
      p.fraudLossAnalysis === "Provided" ? "Medium" : "Critical",
      ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"], ["PER 4103", "PER 4102"], ["DCN 2"],
      p.fraudLossAnalysis === "Provided" ? "Evidence present, no longer able to change posture on its own"
        : "Could change Conditional Proceed to Defer Pending Evidence", 2),
    mk("Duplicate Authorization", "0.08% observed", "0.2% for 5 minutes", "High",
      ["ALT 5001 B", "ALT 5001 C"], ["PER 4102"], ["DCN 3"], "Crossing the threshold triggers automated rollback", 3),
    mk("Dependency Capacity", p.dependencyStressTest === "Provided" ? "Validated" : "EU margin below target",
      "12% headroom", p.dependencyStressTest === "Provided" ? "Medium" : "High",
      ["ALT 5001 B", "ALT 5001 C"], ["PER 4104", "PER 4105"], ["DCN 4"],
      "Insufficient headroom removes Option C and constrains Option B expansion", 4),
    mk("Latency", "P95 218 ms", "250 ms", "High", ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"],
      ["PER 4101", "PER 4104"], ["DCN 5"], "Breach violates the checkout performance condition", 5),
    mk("Checkout Completion Improvement", s.expectedCompletionLift, "+1.0% minimum", "Medium",
      ["ALT 5001 B", "ALT 5001 D"], ["PER 4101"], ["DCN 6"],
      "Below the minimum lift the business case for expansion weakens", 6),
    mk("Rollback Availability", p.rollbackCapability, "Available within 5 minutes",
      p.rollbackCapability === "Available" ? "High" : "Critical",
      ["ALT 5001 B", "ALT 5001 C"], ["PER 4104", "PER 4107"], ["DCN 7"],
      "If unavailable, Option B reversibility worsens materially", 7),
    mk("Idempotency Confidence", p.idempotencyEvidence === "Validated" ? "Validated, 92%" : "Not validated",
      "Validated", p.idempotencyEvidence === "Validated" ? "Medium" : "Critical",
      ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"], ["PER 4102"], ["DCN 8"],
      "Without validation the duplicate authorization risk cannot be controlled", 8),
    mk("Deployment Window", p.deploymentTiming, "Quarter end final three business days",
      p.deploymentTiming === "Quarter End Restricted Window" ? "High" : "Medium",
      ["ALT 5001 B", "ALT 5001 C"], ["PER 4107"], ["DCN 9"],
      "Restricted window blocks deployment and can force escalation", 9),
    mk("Evidence Confidence", `${s.evidenceCoverage}%`, "90%", s.evidenceCoverage < 90 ? "High" : "Medium",
      ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"], ["PER 4103", "PER 4104"], ["DCN 10"],
      "Below 90% the recommendation moves toward Defer Pending Evidence", 10),
  ];
}

/* ====================================================== threshold analysis = */

export interface DecisionThreshold {
  id: string;
  threshold: string;
  currentValue: string;
  distance: string;
  crossed: boolean;
  affectedAlternativeIds: string[];
  affectedPersonaIds: string[];
  actionIfCrossed: string;
  evidence: string;
}

export function thresholdAnalysis(p: DecisionScenarioParams): DecisionThreshold[] {
  return [
    {
      id: "DTH 1", threshold: "Traffic above 10%", currentValue: `${p.trafficExposure}%`,
      distance: p.trafficExposure > 10 ? `${p.trafficExposure - 10} points above` : `${10 - p.trafficExposure} points below`,
      crossed: p.trafficExposure > 10, affectedAlternativeIds: ["ALT 5001 B", "ALT 5001 C"],
      affectedPersonaIds: ["PER 4102", "PER 4107"], actionIfCrossed: "Activates joint approval",
      evidence: "EVD 3 Cross Team Impact Matrix",
    },
    {
      id: "DTH 2", threshold: "Duplicate Authorization above 0.2% for 5 minutes", currentValue: "0.08%",
      distance: "0.12 points below", crossed: false, affectedAlternativeIds: ["ALT 5001 B", "ALT 5001 C"],
      affectedPersonaIds: ["PER 4102"], actionIfCrossed: "Triggers automated rollback",
      evidence: "EVD 11 Rollback Threshold Definition",
    },
    {
      id: "DTH 3", threshold: "P95 Latency at or above 250 ms", currentValue: "218 ms",
      distance: "32 ms below", crossed: false, affectedAlternativeIds: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"],
      affectedPersonaIds: ["PER 4101", "PER 4104"], actionIfCrossed: "Violates the performance condition",
      evidence: "EVD 6 Current Retry Metrics",
    },
    {
      id: "DTH 4", threshold: "Availability below 99.95%", currentValue: "99.982%",
      distance: "0.032 points above", crossed: false, affectedAlternativeIds: ["ALT 5001 B", "ALT 5001 C"],
      affectedPersonaIds: ["PER 4104"], actionIfCrossed: "Violates the service objective",
      evidence: "EVD 6 Current Retry Metrics",
    },
    {
      id: "DTH 5", threshold: "Fraud decision timeout above 1.2 seconds", currentValue: "0.9 seconds",
      distance: "0.3 seconds below", crossed: false, affectedAlternativeIds: ["ALT 5001 B", "ALT 5001 D"],
      affectedPersonaIds: ["PER 4103"], actionIfCrossed: "Triggers graceful degradation",
      evidence: "EVD 2 Persona Impact Analysis",
    },
    {
      id: "DTH 6", threshold: "Quarter end final three business days", currentValue: p.deploymentTiming,
      distance: p.deploymentTiming === "Quarter End Restricted Window" ? "Inside the restricted period" : "Outside the restricted period",
      crossed: p.deploymentTiming === "Quarter End Restricted Window",
      affectedAlternativeIds: ["ALT 5001 B", "ALT 5001 C"], affectedPersonaIds: ["PER 4107"],
      actionIfCrossed: "Activates the deployment restriction",
      evidence: "DCN 9 Release Governance calendar",
    },
  ];
}

/* ==================================================== alternative refinement */

export interface RefinedAlternative {
  id: string;
  derivedFromId: string;
  code: string;
  name: string;
  changes: string[];
  trafficCap: number;
  observationWindow: ObservationWindow;
  requiredEvidence: string[];
  createdAt: string;
}

export const seedRefinements: RefinedAlternative[] = [
  {
    id: "ALT 5001 B2", derivedFromId: "ALT 5001 B", code: "Option B2",
    name: "Three Retries, Maximum 10% Traffic Until Fraud Validation",
    changes: ["Cap exposure at 10%", "Require 24 hour observation", "Require fraud analysis before expansion"],
    trafficCap: 10, observationWindow: "24 Hours", requiredEvidence: ["EVD 8"],
    createdAt: "2026-08-06 09:47",
  },
];

export const refinedParams = (r: RefinedAlternative, p: DecisionScenarioParams): DecisionScenarioParams => ({
  ...p,
  alternativeId: r.id,
  trafficExposure: Math.min(p.trafficExposure, r.trafficCap),
  observationWindow: r.observationWindow,
  progressiveRollout: true,
});

/* ============================================================= mitigations = */

export type MitigationStatus = "Proposed" | "Accepted" | "Rejected" | "Evidence Requested" | "Assigned";

export interface DecisionMitigation {
  id: string;
  evaluationId: string;
  alternativeId: string;
  title: string;
  description: string;
  owner: string;
  affectedRiskIds: string[];
  benefitingPersonaIds: string[];
  adverselyAffectedPersonaIds: string[];
  requiredEvidenceIds: string[];
  rawSeverity: Magnitude;
  residualSeverity: Magnitude;
  confidence: number;
  status: MitigationStatus;
  benefits: string[];
  costs: string[];
  tradeoffsCreated: string[];
  recommendationEffect: string;
}

export const seedMitigations: DecisionMitigation[] = [
  {
    id: "DMT 1", evaluationId: "DIA 5001", alternativeId: "ALT 5001 B", title: "Idempotency Validation",
    description: "Validate that a third retry cannot create a duplicate authorization under partial failure.",
    owner: "Payments Platform", affectedRiskIds: ["RSK 2"], benefitingPersonaIds: ["PER 4102", "PER 4101"],
    adverselyAffectedPersonaIds: [], requiredEvidenceIds: ["EVD 5"], rawSeverity: "High",
    residualSeverity: "Medium", confidence: 93, status: "Accepted",
    benefits: ["Duplicate authorization becomes controllable"], costs: ["Additional validation cycle before rollout"],
    tradeoffsCreated: ["Delays initial rollout by one sprint"], recommendationEffect: "Supports Conditional Proceed",
  },
  {
    id: "DMT 2", evaluationId: "DIA 5001", alternativeId: "ALT 5001 B", title: "Progressive Rollout",
    description: "Expose the policy change in staged increments with an explicit gate between stages.",
    owner: "Site Reliability Engineering", affectedRiskIds: ["RSK 4", "RSK 5"],
    benefitingPersonaIds: ["PER 4104", "PER 4107", "PER 4102"], adverselyAffectedPersonaIds: ["PER 4101"],
    requiredEvidenceIds: ["EVD 6"], rawSeverity: "Medium", residualSeverity: "Low to Medium", confidence: 91,
    status: "Accepted", benefits: ["Blast radius stays contained", "Reversibility remains high"],
    costs: ["Slower time to benefit", "Higher coordination cost"],
    tradeoffsCreated: ["Checkout benefit is realised later"], recommendationEffect: "Raises confidence by 3 points",
  },
  {
    id: "DMT 3", evaluationId: "DIA 5001", alternativeId: "ALT 5001 B", title: "Traffic Segmentation",
    description: "Restrict the change to a defined customer segment before broader exposure.",
    owner: "Checkout Engineering", affectedRiskIds: ["RSK 3"], benefitingPersonaIds: ["PER 4103", "PER 4104", "PER 4107"],
    adverselyAffectedPersonaIds: ["PER 4101", "PER 4102"], requiredEvidenceIds: ["EVD 8"], rawSeverity: "High",
    residualSeverity: "Medium", confidence: 88, status: "Accepted",
    benefits: ["Lower fraud and governance exposure"], costs: ["Slower learning and time to benefit"],
    tradeoffsCreated: ["Smaller sample reduces statistical confidence per stage"],
    recommendationEffect: "Keeps posture at Conditional Proceed with a lower exposure ceiling",
  },
  {
    id: "DMT 4", evaluationId: "DIA 5001", alternativeId: "ALT 5001 B", title: "Fraud Loss Monitoring",
    description: "Continuous fraud loss measurement per rollout stage with an explicit stop condition.",
    owner: "Fraud Engineering", affectedRiskIds: ["RSK 3"], benefitingPersonaIds: ["PER 4103"],
    adverselyAffectedPersonaIds: [], requiredEvidenceIds: ["EVD 8"], rawSeverity: "High",
    residualSeverity: "Medium", confidence: 84, status: "Evidence Requested",
    benefits: ["Fraud exposure becomes observable rather than assumed"],
    costs: ["Monitoring overhead for Fraud Engineering"],
    tradeoffsCreated: ["Adds an evidence dependency to the expansion gate"],
    recommendationEffect: "Required before exceeding 10% traffic",
  },
  {
    id: "DMT 5", evaluationId: "DIA 5001", alternativeId: "ALT 5001 B", title: "Dependency Load Validation",
    description: "Stress test Payments API, Fraud Decision Service and Regional Token Vault at projected retry volume.",
    owner: "Site Reliability Engineering", affectedRiskIds: ["RSK 4"], benefitingPersonaIds: ["PER 4104", "PER 4105"],
    adverselyAffectedPersonaIds: [], requiredEvidenceIds: ["EVD 9"], rawSeverity: "Medium",
    residualSeverity: "Low to Medium", confidence: 86, status: "Evidence Requested",
    benefits: ["Dependency saturation risk quantified"], costs: ["Test environment capacity and scheduling"],
    tradeoffsCreated: ["Adds two days to the readiness path"],
    recommendationEffect: "Raises dependency confidence when accepted",
  },
  {
    id: "DMT 6", evaluationId: "DIA 5001", alternativeId: "ALT 5001 B", title: "Automated Rollback",
    description: "Automated rollback on duplicate authorization exceeding 0.2% for five minutes.",
    owner: "Release Governance", affectedRiskIds: ["RSK 2", "RSK 5"], benefitingPersonaIds: ["PER 4102", "PER 4104", "PER 4107"],
    adverselyAffectedPersonaIds: [], requiredEvidenceIds: ["EVD 11"], rawSeverity: "High",
    residualSeverity: "Medium", confidence: 93, status: "Accepted",
    benefits: ["Reversibility preserved under adverse outcome"], costs: ["Rollback automation maintenance"],
    tradeoffsCreated: ["False positive rollbacks are possible at low volume"],
    recommendationEffect: "Necessary condition for any exposure above 5%",
  },
  {
    id: "DMT 7", evaluationId: "DIA 5001", alternativeId: "ALT 5001 B", title: "Observation Window",
    description: "Hold each rollout stage for a defined observation period before expansion.",
    owner: "Decision Facilitation", affectedRiskIds: ["RSK 3", "RSK 4"],
    benefitingPersonaIds: ["PER 4103", "PER 4104", "PER 4107"], adverselyAffectedPersonaIds: ["PER 4101", "PER 4102"],
    requiredEvidenceIds: ["EVD 6"], rawSeverity: "Medium", residualSeverity: "Low to Medium", confidence: 90,
    status: "Proposed", benefits: ["Stronger operational evidence per stage"], costs: ["Longer rollout"],
    tradeoffsCreated: ["Delays the checkout completion benefit"],
    recommendationEffect: "Increases evidence confidence at each gate",
  },
  {
    id: "DMT 8", evaluationId: "DIA 5001", alternativeId: "ALT 5001 B", title: "Approval Before Expansion",
    description: "Require joint Payments Reliability and Fraud Engineering approval before exceeding 10% traffic.",
    owner: "Commerce Architecture Council", affectedRiskIds: ["RSK 3"], benefitingPersonaIds: ["PER 4103", "PER 4107"],
    adverselyAffectedPersonaIds: ["PER 4101"], requiredEvidenceIds: ["EVD 8"], rawSeverity: "High",
    residualSeverity: "Medium", confidence: 92, status: "Accepted",
    benefits: ["Governance exposure is explicit and owned"], costs: ["Coordination delay at the expansion gate"],
    tradeoffsCreated: ["Adds a human gate to an otherwise automated rollout"],
    recommendationEffect: "Converts an implicit risk into an explicit condition",
  },
  {
    id: "DMT 9", evaluationId: "DIA 5001", alternativeId: "ALT 5001 B", title: "Quarter End Scheduling",
    description: "Schedule deployment outside the final three business days of the financial quarter.",
    owner: "Release Governance", affectedRiskIds: ["RSK 5"], benefitingPersonaIds: ["PER 4107", "PER 4102"],
    adverselyAffectedPersonaIds: ["PER 4101"], requiredEvidenceIds: [], rawSeverity: "Medium",
    residualSeverity: "Low", confidence: 95, status: "Accepted",
    benefits: ["Avoids financial close risk"], costs: ["Reduced scheduling flexibility"],
    tradeoffsCreated: ["Delivery may slip into the next release train"],
    recommendationEffect: "Removes the governance restriction from the critical path",
  },
];

export function residualWithMitigations(rawSeverity: Magnitude, applied: DecisionMitigation[], alternativeId: string): Magnitude {
  if (alternativeId === "ALT 5001 C") return rawSeverity; // blast radius remains broad
  const drop = applied.filter((m) => m.status === "Accepted").length > 0 ? Math.min(2, applied.filter((m) => m.status === "Accepted").length) : 0;
  return byRank(Math.max(1, magnitudeRank(rawSeverity) - drop));
}

export interface RawVsMitigatedRow {
  alternativeId: string;
  alternative: string;
  risk: string;
  rawSeverity: Magnitude;
  mitigation: string;
  residualSeverity: Magnitude;
  confidence: number;
  note: string;
}

export function rawVsMitigated(applied: string[]): RawVsMitigatedRow[] {
  const accepted = seedMitigations.filter((m) => applied.includes(m.id));
  return alternativeRisks.map((r) => {
    const relevant = accepted.filter((m) => m.affectedRiskIds.includes(r.riskId) &&
      (m.alternativeId === r.alternativeId || r.alternativeId === "ALT 5001 B"));
    const residual = relevant.length
      ? residualWithMitigations(r.rawSeverity, relevant, r.alternativeId)
      : r.residualSeverity;
    return {
      alternativeId: r.alternativeId,
      alternative: alternatives.find((a) => a.id === r.alternativeId)?.code ?? r.alternativeId,
      risk: r.risk,
      rawSeverity: r.rawSeverity,
      mitigation: relevant.length ? relevant.map((m) => m.title).join(", ") : r.control,
      residualSeverity: residual,
      confidence: r.confidence,
      note: r.alternativeId === "ALT 5001 C"
        ? "Residual severity remains because the blast radius stays broad"
        : relevant.length ? "Residual severity reduced by accepted mitigations" : "Baseline control only",
    };
  });
}

/* ============================================================== evidence op = */

export const evidenceTypes = [
  "Financial Analysis", "Fraud Analysis", "Load Test", "Dependency Capacity Test", "Security Review",
  "Compliance Review", "Customer Analysis", "Rollback Validation", "Architecture Review", "Operational Readiness",
];

export type EvidenceAction = "Request Evidence" | "Add Evidence" | "Link Existing Evidence" | "Mark Not Applicable" | "Open Evidence";

/* ================================================================= reviews = */

export type ReviewStatus = "Pending" | "In Review" | "Acknowledged" | "Evidence Requested" | "Challenged" | "Complete" | "Escalated";
export type ReviewDecision =
  | "Not Started" | "Agree with Recommendation" | "Agree with Conditions" | "Disagree"
  | "Challenge Assumption" | "Request Evidence" | "Recommend Alternative" | "Add Condition" | "Escalate";

export interface DecisionReview {
  id: string;
  evaluationId: string;
  decisionName: string;
  reviewType: string;
  reviewer: string;
  reviewerRole: string;
  issue: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  evidenceCoverage: number;
  status: ReviewStatus;
  decision: ReviewDecision;
  comments: string;
  requestedAt: string;
  dueAt: string;
  completedAt: string | null;
}

export const seedReviews: DecisionReview[] = [
  { id: "DIR 5501", evaluationId: "DIA 5001", decisionName: "Checkout Retry Decision", reviewType: "Fraud Evidence Review", reviewer: "Fraud Engineering Lead", reviewerRole: "Evidence Owner", issue: "Incremental fraud exposure cannot be estimated without the Fraud Loss Analysis", severity: "High", evidenceCoverage: 78, status: "Pending", decision: "Not Started", comments: "", requestedAt: "2026-08-05 14:02", dueAt: "2026-08-07", completedAt: null },
  { id: "DIR 5502", evaluationId: "DIA 5001", decisionName: "Checkout Retry Decision", reviewType: "Reliability Review", reviewer: "Site Reliability Engineering", reviewerRole: "Dependency Owner", issue: "Regional dependency headroom below the required margin", severity: "High", evidenceCoverage: 84, status: "In Review", decision: "Not Started", comments: "", requestedAt: "2026-08-05 14:06", dueAt: "2026-08-07", completedAt: null },
  { id: "DIR 5503", evaluationId: "DIA 5001", decisionName: "Checkout Retry Decision", reviewType: "Governance Review", reviewer: "Commerce Architecture Council", reviewerRole: "Decision Owner", issue: "Joint approval condition activates above 10% traffic", severity: "High", evidenceCoverage: 91, status: "In Review", decision: "Not Started", comments: "", requestedAt: "2026-08-05 15:20", dueAt: "2026-08-08", completedAt: null },
  { id: "DIR 5504", evaluationId: "DIA 5003", decisionName: "Token Vault Migration", reviewType: "Executive Tradeoff Review", reviewer: "Platform Executive Sponsor", reviewerRole: "Executive", issue: "Regional availability tradeoff requires executive judgement", severity: "Critical", evidenceCoverage: 79, status: "Pending", decision: "Not Started", comments: "", requestedAt: "2026-08-04 09:11", dueAt: "2026-08-08", completedAt: null },
  { id: "DIR 5505", evaluationId: "DIA 5003", decisionName: "Token Vault Migration", reviewType: "Dependency Review", reviewer: "Payments Platform", reviewerRole: "Dependency Owner", issue: "Dual write feasibility unproven in EU", severity: "Critical", evidenceCoverage: 74, status: "Evidence Requested", decision: "Request Evidence", comments: "Dual write proof required before any cutover sequencing decision", requestedAt: "2026-08-04 10:40", dueAt: "2026-08-09", completedAt: null },
  { id: "DIR 5506", evaluationId: "DIA 5004", decisionName: "Fraud Timeout Adjustment", reviewType: "Customer Impact Review", reviewer: "Customer Experience", reviewerRole: "Customer Advocate", issue: "300 ms additional latency at peak", severity: "Medium", evidenceCoverage: 88, status: "In Review", decision: "Not Started", comments: "", requestedAt: "2026-08-05 11:02", dueAt: "2026-08-09", completedAt: null },
  { id: "DIR 5507", evaluationId: "DIA 5002", decisionName: "Identity Token Cache", reviewType: "Security Review", reviewer: "Security Architecture", reviewerRole: "Security Owner", issue: "Revocation path must stay immediate under longer TTL", severity: "High", evidenceCoverage: 96, status: "In Review", decision: "Not Started", comments: "", requestedAt: "2026-08-05 08:30", dueAt: "2026-08-08", completedAt: null },
  { id: "DIR 5508", evaluationId: "DIA 5001", decisionName: "Checkout Retry Decision", reviewType: "Financial Review", reviewer: "Finance Partner", reviewerRole: "Financial Owner", issue: "Incremental revenue recovery estimate not independently validated", severity: "Medium", evidenceCoverage: 82, status: "Pending", decision: "Not Started", comments: "", requestedAt: "2026-08-06 08:15", dueAt: "2026-08-10", completedAt: null },
  { id: "DIR 5509", evaluationId: "DIA 5005", decisionName: "Observability Expansion", reviewType: "Operational Readiness Review", reviewer: "Site Reliability Engineering", reviewerRole: "Operations Owner", issue: "Alert routing ownership not yet assigned", severity: "Medium", evidenceCoverage: 98, status: "In Review", decision: "Not Started", comments: "", requestedAt: "2026-08-06 09:05", dueAt: "2026-08-11", completedAt: null },
];

export const reviewActions = [
  "Agree with Recommendation", "Agree with Conditions", "Disagree", "Challenge Assumption",
  "Request Evidence", "Recommend Alternative", "Add Condition", "Escalate",
] as const;

export const commentRequired = (d: ReviewDecision) =>
  ["Disagree", "Challenge Assumption", "Add Condition", "Recommend Alternative", "Escalate"].includes(d);

/* ======================================================= acknowledgements = */

export type AckStatus = "Acknowledged" | "Evidence Required" | "Approval Required" | "Pending";

export interface DecisionAcknowledgement {
  id: string;
  evaluationId: string;
  personaId: string;
  team: string;
  personaVersion: string;
  position: PersonaPosition;
  requiredCondition: string;
  status: AckStatus;
  comments: string;
  acknowledgedAt: string | null;
}

export const seedAcknowledgements: DecisionAcknowledgement[] = [
  { id: "DAK 1", evaluationId: "DIA 5001", personaId: "PER 4102", team: "Payments Platform", personaVersion: "v3.4", position: "Conditional Support", requiredCondition: "Validated idempotency before any expansion", status: "Acknowledged", comments: "Conditions understood and accepted for the 5% stage", acknowledgedAt: "2026-08-06 10:06" },
  { id: "DAK 2", evaluationId: "DIA 5001", personaId: "PER 4101", team: "Checkout Engineering", personaVersion: "v4.1", position: "Support", requiredCondition: "Rollback threshold defined", status: "Acknowledged", comments: "Supports Option B and prefers faster expansion once evidence lands", acknowledgedAt: "2026-08-06 09:58" },
  { id: "DAK 3", evaluationId: "DIA 5001", personaId: "PER 4103", team: "Fraud Engineering", personaVersion: "v2.9", position: "Conditional", requiredCondition: "Fraud Loss Analysis complete before exceeding 10%", status: "Evidence Required", comments: "Cannot acknowledge expansion beyond 10% without fraud evidence", acknowledgedAt: null },
  { id: "DAK 4", evaluationId: "DIA 5001", personaId: "PER 4104", team: "Site Reliability Engineering", personaVersion: "v3.7", position: "Conditional Support", requiredCondition: "Progressive rollout and automated rollback", status: "Acknowledged", comments: "Progressive rollout mitigation approved", acknowledgedAt: "2026-08-06 10:09" },
  { id: "DAK 5", evaluationId: "DIA 5001", personaId: "PER 4105", team: "Identity Engineering", personaVersion: "v2.6", position: "Concerned", requiredCondition: "EU capacity margin restored before the 15% gate", status: "Acknowledged", comments: "Acknowledged with a recorded concern about EU headroom", acknowledgedAt: "2026-08-06 09:44" },
  { id: "DAK 6", evaluationId: "DIA 5001", personaId: "PER 4107", team: "Release Governance", personaVersion: "v1.8", position: "Conditional", requiredCondition: "Governance approval before exceeding 10% traffic", status: "Approval Required", comments: "Approval gate is active while exposure exceeds 10%", acknowledgedAt: null },
];

/* ============================================================== approvals = */

export type ApprovalStatus = "Not Required" | "Pending" | "Submitted" | "Approved" | "Approved with Conditions" | "Changes Requested" | "Rejected" | "Deferred" | "Escalated";

export interface DecisionApproval {
  id: string;
  evaluationId: string;
  approvalStage: string;
  approver: string;
  approverRole: string;
  status: ApprovalStatus;
  decision: string;
  conditions: string[];
  comments: string;
  submittedAt: string | null;
  dueAt: string;
  completedAt: string | null;
}

export const seedApprovals: DecisionApproval[] = [
  { id: "DAP 1", evaluationId: "DIA 5001", approvalStage: "Decision Owner", approver: "Commerce Architecture Council", approverRole: "Decision Owner", status: "Pending", decision: "", conditions: [], comments: "", submittedAt: "2026-08-06 09:30", dueAt: "2026-08-08", completedAt: null },
  { id: "DAP 2", evaluationId: "DIA 5001", approvalStage: "Team Review", approver: "Checkout Engineering", approverRole: "Submitting Team", status: "Approved", decision: "Approve", conditions: [], comments: "Supports Option B", submittedAt: "2026-08-06 09:31", dueAt: "2026-08-07", completedAt: "2026-08-06 09:58" },
  { id: "DAP 3", evaluationId: "DIA 5001", approvalStage: "Team Review", approver: "Payments Reliability", approverRole: "Dependency Owner", status: "Approved with Conditions", decision: "Approve with Conditions", conditions: ["Validated idempotency", "Automated rollback armed"], comments: "Conditional on idempotency evidence remaining valid", submittedAt: "2026-08-06 09:31", dueAt: "2026-08-07", completedAt: "2026-08-06 10:06" },
  { id: "DAP 4", evaluationId: "DIA 5001", approvalStage: "Team Review", approver: "Fraud Engineering", approverRole: "Risk Owner", status: "Pending", decision: "", conditions: ["Fraud Loss Analysis accepted"], comments: "Awaiting fraud evidence", submittedAt: "2026-08-06 09:31", dueAt: "2026-08-07", completedAt: null },
  { id: "DAP 5", evaluationId: "DIA 5001", approvalStage: "Team Review", approver: "Site Reliability Engineering", approverRole: "Operations Owner", status: "Approved with Conditions", decision: "Approve with Conditions", conditions: ["Progressive rollout", "24 hour observation between stages"], comments: "Approved with staged observation", submittedAt: "2026-08-06 09:31", dueAt: "2026-08-07", completedAt: "2026-08-06 10:09" },
  { id: "DAP 6", evaluationId: "DIA 5001", approvalStage: "Governance Approval", approver: "Release Governance", approverRole: "Governance Authority", status: "Not Required", decision: "", conditions: ["Required above 10% traffic exposure"], comments: "", submittedAt: null, dueAt: "2026-08-09", completedAt: null },
  { id: "DAP 7", evaluationId: "DIA 5001", approvalStage: "Security Approval", approver: "Security Architecture", approverRole: "Security Authority", status: "Not Required", decision: "", conditions: ["Not required in the default scenario"], comments: "", submittedAt: null, dueAt: "—", completedAt: null },
  { id: "DAP 8", evaluationId: "DIA 5001", approvalStage: "Executive Approval", approver: "Commerce Executive Sponsor", approverRole: "Executive", status: "Not Required", decision: "", conditions: ["Not required in the default scenario"], comments: "", submittedAt: null, dueAt: "—", completedAt: null },
];

export const approvalDecisions = ["Approve", "Approve with Conditions", "Request Changes", "Reject", "Defer", "Escalate"] as const;

export const conditionLibrary = [
  "Maximum initial exposure 5%",
  "Expansion to 15% only after 24 hour observation",
  "Fraud Loss Analysis accepted",
  "Duplicate Authorization at or below 0.2%",
  "P95 Latency below 250 ms",
  "No availability degradation",
  "Joint Payments Reliability and Fraud approval",
  "Automated rollback armed before deployment",
  "Do not deploy in the final three business days of the quarter",
  "Dependency monitoring active for Payments API and Regional Token Vault",
];

export const conditionCategories = [
  "Traffic Limits", "Evidence Conditions", "Approval Conditions", "Observation Conditions",
  "Rollback Conditions", "Scheduling Conditions",
];

/* ================================================================= dissent = */

export interface DecisionDissent {
  id: string;
  evaluationId: string;
  personaId: string;
  team: string;
  position: string;
  reason: string;
  evidenceReferenceIds: string[];
  preferredAlternativeId: string;
  changeCondition: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Preserved" | "Resolved";
  createdAt: string;
}

export const seedDissents: DecisionDissent[] = [
  {
    id: "DDS 1", evaluationId: "DIA 5001", personaId: "PER 4103", team: "Fraud Engineering",
    position: "Prefer maximum 10% traffic until fraud analysis completed",
    reason: "Current evidence is insufficient to estimate incremental fraud exposure",
    evidenceReferenceIds: ["EVD 8"], preferredAlternativeId: "ALT 5001 B2",
    changeCondition: "Fraud Loss Analysis shows no material increase at the 10% stage",
    severity: "High", status: "Preserved", createdAt: "2026-08-06 10:03",
  },
  {
    id: "DDS 2", evaluationId: "DIA 5001", personaId: "PER 4105", team: "Identity Engineering",
    position: "Expansion beyond 10% should wait for EU capacity restoration",
    reason: "Regional Token Vault margin in EU is below the required threshold",
    evidenceReferenceIds: ["EVD 9"], preferredAlternativeId: "ALT 5001 B",
    changeCondition: "EU headroom returns to 12% or above",
    severity: "Medium", status: "Preserved", createdAt: "2026-08-06 09:44",
  },
];

/* ================================================ recommendation challenges = */

export const challengeTypes = [
  "Unsupported Assumption", "Missing Alternative", "Evidence Concern", "Risk Concern",
  "Customer Concern", "Financial Concern", "Governance Concern",
];

export interface RecommendationChallenge {
  id: string;
  evaluationId: string;
  challenger: string;
  role: string;
  challengeType: string;
  description: string;
  proposedChange: string;
  evidence: string;
  impact: "Recalculate Recommendation" | "Human Review Only" | "Escalate";
  createdAt: string;
  status: "Open" | "Accepted" | "Rejected";
}

export const seedChallenges: RecommendationChallenge[] = [
  {
    id: "DCH 1", evaluationId: "DIA 5001", challenger: "Fraud Engineering Lead", role: "Risk Owner",
    challengeType: "Evidence Concern",
    description: "The recommendation assumes fraud exposure scales linearly with traffic without evidence.",
    proposedChange: "Cap exposure at 10% until the Fraud Loss Analysis is accepted",
    evidence: "EVD 8 Fraud Loss Analysis (missing)", impact: "Human Review Only",
    createdAt: "2026-08-06 10:03", status: "Open",
  },
];

/* ============================================================= escalations = */

export const escalationReasons = [
  "Critical Customer Impact", "Critical Financial Exposure", "Security Conflict", "Compliance Conflict",
  "Unresolved Persona Conflict", "Critical Dependency", "Evidence Unavailable", "Recommendation Split",
  "Executive Tradeoff Required", "Governance Override Requested",
];

export interface DecisionEscalation {
  id: string;
  evaluationId: string;
  issueType: string;
  title: string;
  description: string;
  severity: "Critical" | "High" | "Medium";
  affectedTeams: string[];
  alternativeIds: string[];
  businessImpact: string;
  customerImpact: string;
  riskImpact: string;
  evidenceReferenceIds: string[];
  recommendedLevel: string;
  owner: string;
  dueDate: string;
  status: "Open" | "In Review" | "Resolved";
  createdAt: string;
}

export const seedEscalations: DecisionEscalation[] = [
  {
    id: "DES 1", evaluationId: "DIA 5003", issueType: "Critical Dependency",
    title: "Regional Token Vault capacity blocks migration sequencing",
    description: "EU vault margin is below threshold and no alternative satisfies the peak season constraint.",
    severity: "Critical", affectedTeams: ["Payments Platform", "Site Reliability Engineering", "Identity Engineering"],
    alternativeIds: ["ALT 5003 B", "ALT 5003 C"], businessImpact: "EU peak season readiness at risk",
    customerImpact: "Potential authorisation failures in EU", riskImpact: "Critical availability dependency",
    evidenceReferenceIds: ["EVD 9"], recommendedLevel: "Platform Governance Board",
    owner: "Platform Governance Board", dueDate: "2026-08-09", status: "Open", createdAt: "2026-08-05 08:55",
  },
];

/* ========================================================= decision record = */

export interface RecordedDecisionCondition { id: string; category: string; text: string }

export interface DecisionRecord {
  id: string;
  evaluationId: string;
  decisionNumber: string;
  decision: string;
  selectedAlternativeId: string;
  decisionRationale: string;
  conditions: RecordedDecisionCondition[];
  approvalIds: string[];
  dissentIds: string[];
  expectedOutcomeIds: string[];
  decisionOwner: string;
  decisionDate: string;
  confidence: number;
  contextSnapshotId: string;
  status: "Recorded" | "Amended" | "Superseded";
}

export const seedDecisionConditions: RecordedDecisionCondition[] = [
  { id: "DCD 1", category: "Traffic Limits", text: "Initial traffic 5%, maximum preapproval traffic 10%" },
  { id: "DCD 2", category: "Evidence Conditions", text: "Expansion to 15% requires Fraud Loss Analysis and Dependency Stress Validation" },
  { id: "DCD 3", category: "Approval Conditions", text: "Expansion to 15% requires Payments Reliability and Fraud Engineering approval" },
  { id: "DCD 4", category: "Observation Conditions", text: "24 hour observation window between rollout stages" },
  { id: "DCD 5", category: "Rollback Conditions", text: "Automated rollback when Duplicate Authorization exceeds 0.2% for five minutes" },
  { id: "DCD 6", category: "Scheduling Conditions", text: "Do not deploy during the final three business days of the financial quarter" },
];

export const seedDecisionRecord: DecisionRecord = {
  id: "DEC 5001", evaluationId: "DIA 5001", decisionNumber: "DEC 5001",
  decision: "Approve Option B with Conditions",
  selectedAlternativeId: "ALT 5001 B",
  decisionRationale:
    "Option B captures the checkout completion opportunity while keeping the blast radius contained and reversible. "
    + "Fraud evidence is incomplete, so the reviewers capped initial exposure more conservatively than the recommendation and "
    + "attached an evidence gate before any expansion.",
  conditions: seedDecisionConditions,
  approvalIds: ["DAP 1", "DAP 2", "DAP 3", "DAP 5"],
  dissentIds: ["DDS 1", "DDS 2"],
  expectedOutcomeIds: ["DEO 1", "DEO 2", "DEO 3", "DEO 4", "DEO 5", "DEO 6", "DEO 7"],
  decisionOwner: "Commerce Architecture Council", decisionDate: "2026-08-06 11:04",
  confidence: 94, contextSnapshotId: "DCS 5001", status: "Recorded",
};

export const requiredControls = ["Idempotency", "Progressive Rollout", "Automated Rollback", "Dependency Monitoring"];

/* ================================================= recommendation vs decision */

export interface RecVsDecisionRow { field: string; recommendation: string; decision: string; difference: string }

export function recommendationVsDecision(s: DecisionScenarioState, record: DecisionRecord | null): RecVsDecisionRow[] {
  const recAlt = alternatives.find((a) => a.id === s.preferredAlternativeId);
  const decAlt = record ? alternatives.find((a) => a.id === record.selectedAlternativeId) : null;
  return [
    { field: "Alternative", recommendation: `${recAlt?.code ?? "—"} ${recAlt?.name ?? ""}`, decision: decAlt ? `${decAlt.code} ${decAlt.name}` : "Not yet recorded", difference: !record ? "Decision not yet recorded" : recAlt?.id === decAlt?.id ? "None" : "Different alternative selected" },
    { field: "Posture", recommendation: s.posture, decision: record?.decision ?? "Not yet recorded", difference: record ? "Human decision adds explicit conditions" : "—" },
    { field: "Initial exposure", recommendation: "Up to 15% with joint approval", decision: record ? "5% initial, 10% maximum before expansion approval" : "—", difference: record ? "Initial expansion capped more conservatively by human reviewers" : "—" },
    { field: "Conditions", recommendation: `${s.activeConditions.length} derived conditions`, decision: record ? `${record.conditions.length} recorded conditions` : "—", difference: record ? "Reviewers added an evidence gate before expansion" : "—" },
    { field: "Confidence", recommendation: `${s.confidence}%`, decision: record ? `${record.confidence}%` : "—", difference: record ? `${record.confidence - s.confidence >= 0 ? "+" : ""}${record.confidence - s.confidence} points` : "—" },
    { field: "Rationale", recommendation: "Derived from supporting factors, counterarguments and evidence", decision: record?.decisionRationale ?? "—", difference: record ? "Human rationale cites incomplete fraud evidence" : "—" },
    { field: "Dissent", recommendation: "Not applicable to a recommendation", decision: record ? `${record.dissentIds.length} preserved dissent records` : "—", difference: record ? "Dissent preserved after the decision" : "—" },
  ];
}

/* ========================================================= version history = */

export interface DecisionVersion {
  id: string;
  kind: "Analysis" | "Recommendation" | "Review Event" | "Decision Record";
  version: string;
  timestamp: string;
  question: string;
  alternatives: string;
  recommendation: string;
  evidenceCoverage: number;
  approvals: string;
  decisionOutcome: string;
  conditions: string;
  changedBy: string;
  reason: string;
}

export const seedVersions: DecisionVersion[] = [
  { id: "DIA 5001 v1", kind: "Analysis", version: "v1", timestamp: "2026-08-03 09:12", question: "Should automated payment retries increase from two to three?", alternatives: "Option A, Option B, Option C", recommendation: "Undetermined", evidenceCoverage: 64, approvals: "None", decisionOutcome: "Not recorded", conditions: "None", changedBy: "Decision Facilitation", reason: "Initial decision analysis" },
  { id: "DIA 5001 v2", kind: "Analysis", version: "v2", timestamp: "2026-08-04 11:38", question: "Should automated payment retries increase from two to three, and under what rollout conditions?", alternatives: "Option A, Option B, Option C, Option D", recommendation: "Conditional Proceed, Option B", evidenceCoverage: 82, approvals: "None", decisionOutcome: "Not recorded", conditions: "Idempotency, rollback threshold", changedBy: "Payments Platform", reason: "After idempotency evidence" },
  { id: "DIA 5001 v3", kind: "Recommendation", version: "v3", timestamp: "2026-08-06 10:14", question: "Should automated payment retries increase from two to three, and under what rollout conditions?", alternatives: "Option A, Option B, Option C, Option D", recommendation: "Conditional Proceed, Option B", evidenceCoverage: 82, approvals: "Joint approval activated", decisionOutcome: "Not recorded", conditions: "Joint approval above 10%", changedBy: "Checkout Engineering", reason: "Traffic increased to 15%" },
  { id: "DIA 5001 v4", kind: "Review Event", version: "v4", timestamp: "2026-08-06 10:41", question: "Should automated payment retries increase from two to three, and under what rollout conditions?", alternatives: "Option A, Option B, Option C, Option D, Option B2", recommendation: "Conditional Proceed, Option B", evidenceCoverage: 91, approvals: "3 of 6 complete", decisionOutcome: "Not recorded", conditions: "Fraud evidence gate added", changedBy: "Fraud Engineering", reason: "After fraud review" },
  { id: "DEC 5001 v1", kind: "Decision Record", version: "v1", timestamp: "2026-08-06 11:04", question: "Should automated payment retries increase from two to three, and under what rollout conditions?", alternatives: "Option A, Option B, Option C, Option D, Option B2", recommendation: "Conditional Proceed, Option B", evidenceCoverage: 91, approvals: "4 recorded", decisionOutcome: "Approve Option B with Conditions", conditions: "6 recorded conditions", changedBy: "Commerce Architecture Council", reason: "Recorded human decision" },
];

export type DiffState = "Added" | "Removed" | "Changed" | "Unchanged" | "Material Change";
export interface VersionDiffRow { field: string; left: string; right: string; state: DiffState }

const versionFields: { field: string; get: (v: DecisionVersion) => string; material?: boolean }[] = [
  { field: "Decision Question", get: (v) => v.question, material: true },
  { field: "Alternatives", get: (v) => v.alternatives },
  { field: "Recommendation", get: (v) => v.recommendation, material: true },
  { field: "Evidence Coverage", get: (v) => `${v.evidenceCoverage}%` },
  { field: "Approvals", get: (v) => v.approvals },
  { field: "Human Decision", get: (v) => v.decisionOutcome, material: true },
  { field: "Decision Conditions", get: (v) => v.conditions, material: true },
  { field: "Changed By", get: (v) => v.changedBy },
  { field: "Reason", get: (v) => v.reason },
];

export function compareVersions(a: DecisionVersion, b: DecisionVersion): VersionDiffRow[] {
  return versionFields.map((f) => {
    const left = f.get(a);
    const right = f.get(b);
    let state: DiffState = "Unchanged";
    if (left === right) state = "Unchanged";
    else if (!left || left === "None") state = "Added";
    else if (!right || right === "None") state = "Removed";
    else state = f.material ? "Material Change" : "Changed";
    return { field: f.field, left, right, state };
  });
}

/* ====================================================== expected outcomes = */

export interface RegisteredOutcome {
  id: string;
  metric: string;
  baseline: string;
  expectedValue: string;
  acceptableRange: string;
  observationWindow: string;
  evidenceSource: string;
  owner: string;
  escalationThreshold: string;
  outcomeType: "Customer" | "Business" | "Technical" | "Operational" | "Risk";
}

export const registeredOutcomes: RegisteredOutcome[] = [
  { id: "DEO 1", metric: "Checkout Completion", baseline: "94.1%", expectedValue: "+1.0% to +2.0%", acceptableRange: "+0.5% to +2.5%", observationWindow: "Per rollout stage", evidenceSource: "Checkout telemetry", owner: "Checkout Engineering", escalationThreshold: "Below +0.5% after two stages", outcomeType: "Customer" },
  { id: "DEO 2", metric: "Duplicate Authorization", baseline: "0.08%", expectedValue: "At or below 0.2%", acceptableRange: "0% to 0.2%", observationWindow: "Continuous", evidenceSource: "Payments ledger", owner: "Payments Platform", escalationThreshold: "Above 0.2% for five minutes", outcomeType: "Risk" },
  { id: "DEO 3", metric: "Availability", baseline: "99.982%", expectedValue: "At or above 99.95%", acceptableRange: "99.95% to 100%", observationWindow: "Rolling 24 hours", evidenceSource: "SRE service objectives", owner: "Site Reliability Engineering", escalationThreshold: "Below 99.95%", outcomeType: "Technical" },
  { id: "DEO 4", metric: "P95 Latency", baseline: "218 ms", expectedValue: "Below 250 ms", acceptableRange: "0 to 250 ms", observationWindow: "Rolling 1 hour", evidenceSource: "Checkout tracing", owner: "Checkout Engineering", escalationThreshold: "At or above 250 ms", outcomeType: "Technical" },
  { id: "DEO 5", metric: "Fraud Loss", baseline: "Current quarter baseline", expectedValue: "No material increase", acceptableRange: "Within 5% of baseline", observationWindow: "Per rollout stage", evidenceSource: "Fraud loss ledger", owner: "Fraud Engineering", escalationThreshold: "Material increase at any stage", outcomeType: "Business" },
  { id: "DEO 6", metric: "Dependency Health", baseline: "12% headroom", expectedValue: "No sustained saturation", acceptableRange: "Headroom at or above 10%", observationWindow: "Continuous", evidenceSource: "Dependency telemetry", owner: "Site Reliability Engineering", escalationThreshold: "Headroom below 10% for 15 minutes", outcomeType: "Operational" },
  { id: "DEO 7", metric: "Rollback", baseline: "Validated in staging", expectedValue: "Available within five minutes of threshold breach", acceptableRange: "0 to 5 minutes", observationWindow: "Per deployment", evidenceSource: "Release automation", owner: "Release Governance", escalationThreshold: "Above five minutes", outcomeType: "Operational" },
];

/* ======================================================= execution handoff = */

export const workExecutionRoute = "/enterprise-cognitive-fabric/execution/work-execution";

export interface ExecutionHandoff {
  id: string;
  decisionRecordId: string;
  selectedAlternativeId: string;
  scope: string;
  conditionIds: string[];
  controls: string[];
  trafficLimits: string;
  monitoringRequirements: string[];
  rollbackTriggers: string[];
  approvalIds: string[];
  deploymentWindow: string;
  expectedOutcomeIds: string[];
  owners: string[];
  status: "Not Prepared" | "Prepared" | "Handed Off";
  createdAt: string | null;
}

export const emptyHandoff: ExecutionHandoff = {
  id: "DEH 5001", decisionRecordId: "DEC 5001", selectedAlternativeId: "ALT 5001 B",
  scope: "Checkout retry policy for the Purchase journey in Production, global regions",
  conditionIds: seedDecisionConditions.map((c) => c.id), controls: requiredControls,
  trafficLimits: "5% initial, 10% maximum before expansion approval, 15% only after evidence and joint approval",
  monitoringRequirements: ["Duplicate authorization rate", "Fraud loss per stage", "Dependency headroom", "P95 checkout latency"],
  rollbackTriggers: ["Duplicate Authorization above 0.2% for five minutes", "Availability below 99.95%"],
  approvalIds: ["DAP 1", "DAP 2", "DAP 3", "DAP 5"],
  deploymentWindow: "Standard release window, excluding the final three business days of the quarter",
  expectedOutcomeIds: registeredOutcomes.map((o) => o.id),
  owners: ["Checkout Engineering", "Payments Platform", "Site Reliability Engineering"],
  status: "Not Prepared", createdAt: null,
};

/* ==================================================== observation contract = */

export interface ObservationContract {
  id: string;
  decisionRecordId: string;
  expectedOutcomeIds: string[];
  metrics: string[];
  observationWindows: string[];
  evidenceSources: string[];
  owners: string[];
  escalationThresholds: string[];
  outcomeCaptureRequirements: string[];
  learningTrigger: string;
  status: "Not Created" | "Created";
  createdAt: string | null;
}

export const emptyObservationContract: ObservationContract = {
  id: "DOC 5001", decisionRecordId: "DEC 5001",
  expectedOutcomeIds: registeredOutcomes.map((o) => o.id),
  metrics: registeredOutcomes.map((o) => o.metric),
  observationWindows: [...new Set(registeredOutcomes.map((o) => o.observationWindow))],
  evidenceSources: [...new Set(registeredOutcomes.map((o) => o.evidenceSource))],
  owners: [...new Set(registeredOutcomes.map((o) => o.owner))],
  escalationThresholds: registeredOutcomes.map((o) => `${o.metric}: ${o.escalationThreshold}`),
  outcomeCaptureRequirements: [
    "Capture observed value per rollout stage",
    "Capture unexpected outcomes not present in the expected set",
    "Capture evidence reference for each observation",
  ],
  learningTrigger: "Compare expected versus observed outcomes after the final rollout stage completes",
  status: "Not Created", createdAt: null,
};

/* ============================================================ audit trail = */

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  previousState: string;
  newState: string;
  reason: string;
}

export const seedAudit: AuditEvent[] = [
  { id: "AUD 88101", timestamp: "2026-08-03 09:12", actor: "Decision Facilitation", role: "Facilitator", action: "Decision Context Created", previousState: "None", newState: "DIA 5001 v1", reason: "Cross Team package CTA 4401 routed for decision" },
  { id: "AUD 88104", timestamp: "2026-08-04 11:38", actor: "Architecture Council", role: "Decision Owner", action: "Alternative Added", previousState: "3 alternatives", newState: "4 alternatives", reason: "Option D added after error classification proposal" },
  { id: "AUD 88110", timestamp: "2026-08-05 16:22", actor: "Payments Platform", role: "Dependency Owner", action: "Evidence Added", previousState: "Evidence coverage 64%", newState: "Evidence coverage 82%", reason: "Idempotency test results published" },
  { id: "AUD 88118", timestamp: "2026-08-06 10:14", actor: "Checkout Engineering", role: "Submitting Team", action: "Recommendation Changed", previousState: "Proceed with Guardrails", newState: "Conditional Proceed", reason: "Traffic exposure changed to 15%" },
  { id: "AUD 88121", timestamp: "2026-08-06 10:18", actor: "Fraud Engineering Lead", role: "Risk Owner", action: "Reviewer Commented", previousState: "Pending", newState: "Challenged", reason: "Fraud exposure assumption unsupported" },
  { id: "AUD 88126", timestamp: "2026-08-06 10:24", actor: "Commerce Architecture Council", role: "Decision Owner", action: "Approval Requested", previousState: "Not Required", newState: "Pending", reason: "Joint approval activated above 10% traffic" },
];

/* ======================================================= context snapshot = */

export interface DecisionContextSnapshot {
  id: string;
  decisionRecordId: string;
  timestamp: string;
  personaVersions: { persona: string; version: string; position: string }[];
  conditionVersions: { condition: string; version: string }[];
  crossTeamAnalysisVersionId: string;
  evidenceReferenceIds: string[];
  alternativeIds: string[];
  recommendationVersion: string;
  approvalState: string;
  dissentIds: string[];
  expectedOutcomeIds: string[];
  accessPolicyVersion: string;
}

export function buildSnapshot(record: DecisionRecord, s: DecisionScenarioState): DecisionContextSnapshot {
  return {
    id: record.contextSnapshotId, decisionRecordId: record.id, timestamp: record.decisionDate,
    personaVersions: seedAcknowledgements.map((a) => ({ persona: a.team, version: a.personaVersion, position: a.position })),
    conditionVersions: constraintsFor("DIA 5001").map((c, i) => ({ condition: c.title, version: `v${2 + (i % 3)}.${1 + (i % 5)}` })),
    crossTeamAnalysisVersionId: "CTA 4401 v4",
    evidenceReferenceIds: evidenceFor("DIA 5001").filter((e) => e.status === "Available").map((e) => e.id),
    alternativeIds: [...alternativesFor("DIA 5001").map((a) => a.id), "ALT 5001 B2"],
    recommendationVersion: `DIA 5001 v4 · ${s.posture} · ${s.confidence}%`,
    approvalState: "4 recorded, Release Governance conditional",
    dissentIds: seedDissents.map((d) => d.id),
    expectedOutcomeIds: registeredOutcomes.map((o) => o.id),
    accessPolicyVersion: "ACL v2.6",
  };
}

/* ============================================================== readiness = */

export type ReadinessState =
  | "Analysis Complete" | "Review In Progress" | "Approval Pending" | "Decision Ready"
  | "Decision Recorded" | "Execution Ready";

export interface ReadinessMetric { name: string; value: number; target: number; dynamic?: boolean }

export function readinessMetrics(
  s: DecisionScenarioState,
  reviews: DecisionReview[],
  approvals: DecisionApproval[],
  record: DecisionRecord | null,
): ReadinessMetric[] {
  const active = reviews.filter((r) => r.evaluationId === "DIA 5001");
  const reviewCoverage = active.length
    ? Math.round((active.filter((r) => r.status === "Complete" || r.status === "Acknowledged").length / active.length) * 100) : 0;
  const required = approvals.filter((a) => a.status !== "Not Required");
  const approvalCoverage = required.length
    ? Math.round((required.filter((a) => a.status === "Approved" || a.status === "Approved with Conditions").length / required.length) * 100) : 0;
  return [
    { name: "Decision Definition", value: 100, target: 100 },
    { name: "Alternative Coverage", value: 95, target: 100 },
    { name: "Persona Coverage", value: 100, target: 100 },
    { name: "Condition Coverage", value: 94, target: 100 },
    { name: "Dependency Coverage", value: 91, target: 95 },
    { name: "Evidence Coverage", value: s.evidenceCoverage, target: 95, dynamic: true },
    { name: "Review Coverage", value: reviewCoverage, target: 100, dynamic: true },
    { name: "Approval Coverage", value: approvalCoverage, target: 100, dynamic: true },
    { name: "Expected Outcome Coverage", value: record ? 100 : 86, target: 100, dynamic: true },
    { name: "Decision Context Integrity", value: 98, target: 100 },
  ];
}

export function readinessState(
  metrics: ReadinessMetric[], record: DecisionRecord | null, handoff: ExecutionHandoff,
): ReadinessState {
  if (handoff.status === "Handed Off" || handoff.status === "Prepared") return "Execution Ready";
  if (record) return "Decision Recorded";
  const approval = metrics.find((m) => m.name === "Approval Coverage")?.value ?? 0;
  const review = metrics.find((m) => m.name === "Review Coverage")?.value ?? 0;
  if (approval >= 100) return "Decision Ready";
  if (review >= 100) return "Approval Pending";
  if (review > 0) return "Review In Progress";
  return "Analysis Complete";
}

/* ========================================================== notifications = */

export const notificationTypes = [
  "Decision Analysis Started", "Decision Context Ready", "Evidence Requested", "Evidence Added",
  "Recommendation Changed", "Review Requested", "Reviewer Challenged Recommendation", "Approval Requested",
  "Approval Granted", "Approval Rejected", "Conditional Approval", "Dissent Recorded", "Escalation Created",
  "Decision Ready", "Decision Recorded", "Execution Handoff Created", "Observation Contract Created",
  "Decision Reassessment Required",
];

export interface DecisionNotification {
  id: string;
  evaluationId: string;
  decisionRecordId: string | null;
  type: string;
  title: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  owner: string;
  status: "Unread" | "Read" | "Acknowledged";
  createdAt: string;
}

export const seedNotifications: DecisionNotification[] = [
  { id: "DNT 1", evaluationId: "DIA 5001", decisionRecordId: null, type: "Evidence Requested", title: "Fraud Loss Analysis requested", description: "Requested from Fraud Engineering before the 15% expansion gate", severity: "High", owner: "Fraud Engineering", status: "Unread", createdAt: "10:18" },
  { id: "DNT 2", evaluationId: "DIA 5001", decisionRecordId: null, type: "Approval Requested", title: "Joint approval activated", description: "Traffic exposure above 10% activates Release Governance approval", severity: "High", owner: "Release Governance", status: "Unread", createdAt: "10:14" },
  { id: "DNT 3", evaluationId: "DIA 5001", decisionRecordId: null, type: "Reviewer Challenged Recommendation", title: "Fraud Engineering challenged the broad rollout alternative", description: "Challenge type Evidence Concern recorded against Option C", severity: "High", owner: "Decision Facilitation", status: "Unread", createdAt: "10:03" },
  { id: "DNT 4", evaluationId: "DIA 5001", decisionRecordId: null, type: "Review Requested", title: "Three reviews outstanding on Checkout Retry", description: "Fraud, Reliability and Governance reviews are open", severity: "Medium", owner: "Decision Facilitation", status: "Read", createdAt: "09:52" },
  { id: "DNT 5", evaluationId: "DIA 5003", decisionRecordId: null, type: "Escalation Created", title: "Token Vault migration escalated", description: "Critical dependency escalation raised to the Platform Governance Board", severity: "Critical", owner: "Platform Governance Board", status: "Unread", createdAt: "08:55" },
];

/* ============================================================== activity = */

export interface OpsActivity {
  id: string;
  timestamp: string;
  evaluationId: string;
  action: string;
  description: string;
  result: string;
  owner: string;
  auditId: string;
}

export const seedOpsActivity: OpsActivity[] = [
  { id: "DOA 1", timestamp: "10:22 AM", evaluationId: "DIA 5001", action: "Recommendation reviewed", description: "Checkout Retry recommendation remains Conditional Proceed", result: "Unchanged", owner: "Decision Facilitation", auditId: "AUD 88130" },
  { id: "DOA 2", timestamp: "10:18 AM", evaluationId: "DIA 5001", action: "Evidence requested", description: "Fraud Loss Analysis requested", result: "Open", owner: "Fraud Engineering", auditId: "AUD 88129" },
  { id: "DOA 3", timestamp: "10:14 AM", evaluationId: "DIA 5001", action: "Scenario changed", description: "Traffic exposure changed to 15%, joint approval activated", result: "Approval Required", owner: "Checkout Engineering", auditId: "AUD 88128" },
  { id: "DOA 4", timestamp: "10:09 AM", evaluationId: "DIA 5001", action: "Mitigation accepted", description: "SRE approved Progressive Rollout mitigation", result: "Accepted", owner: "Site Reliability Engineering", auditId: "AUD 88127" },
  { id: "DOA 5", timestamp: "10:06 AM", evaluationId: "DIA 5001", action: "Acknowledgement recorded", description: "Payments Platform acknowledged Option B conditions", result: "Acknowledged", owner: "Payments Platform", auditId: "AUD 88126" },
  { id: "DOA 6", timestamp: "10:03 AM", evaluationId: "DIA 5001", action: "Recommendation challenged", description: "Fraud Engineering challenged broad rollout alternative", result: "Open", owner: "Fraud Engineering", auditId: "AUD 88125" },
  { id: "DOA 7", timestamp: "9:58 AM", evaluationId: "DIA 5001", action: "Evidence gap raised", description: "Regional dependency evidence marked incomplete", result: "Open", owner: "Site Reliability Engineering", auditId: "AUD 88124" },
  { id: "DOA 8", timestamp: "9:52 AM", evaluationId: "DIA 5001", action: "Confidence updated", description: "Option B recommendation confidence increased to 94%", result: "Updated", owner: "Decision Facilitation", auditId: "AUD 88123" },
];

/* ================================================================= search = */

export interface SearchHit {
  type: string;
  decision: string;
  alternative: string;
  issue: string;
  owner: string;
  status: string;
  confidence: string;
  action: string;
  target: string;
}

export const searchExamples = [
  "Decisions awaiting Fraud Engineering review",
  "Decisions requiring Release Governance",
  "Conditional decisions involving Payments",
  "Alternatives with Critical dependency risk",
  "Recorded decisions with unresolved dissent",
  "Decisions using Payments Persona v3.4",
  "Decisions with missing financial evidence",
];

export function searchEverything(
  q: string,
  reviews: DecisionReview[],
  approvals: DecisionApproval[],
  dissents: DecisionDissent[],
  record: DecisionRecord | null,
): SearchHit[] {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  const hit = (h: SearchHit) => h;
  const match = (...parts: (string | number | undefined | null)[]) =>
    parts.filter(Boolean).join(" ").toLowerCase().includes(term);
  const out: SearchHit[] = [];

  evaluations.forEach((e) => {
    if (match(e.id, e.workItem, e.decisionQuestion, e.decisionOwner, e.submittingTeam, e.status, e.approvalRequirement, e.knowledgeDomain))
      out.push(hit({ type: "Decision Evaluation", decision: e.id, alternative: e.recommendedAlternativeId ?? "—", issue: e.decisionQuestion, owner: e.decisionOwner, status: e.status, confidence: `${e.recommendationConfidence}%`, action: "Open decision", target: "panel-queue" }));
  });
  alternatives.forEach((a) => {
    if (match(a.id, a.code, a.name, a.description, a.dependencyImpact, a.status))
      out.push(hit({ type: "Alternative", decision: a.evaluationId, alternative: `${a.code} ${a.name}`, issue: a.strategicIntent, owner: "Architecture Council", status: a.status, confidence: `${a.confidence}%`, action: "Open comparison", target: "panel-comparison" }));
  });
  diPersonas.forEach((p) => {
    if (match(p.id, p.name))
      out.push(hit({ type: "Persona", decision: "DIA 5001", alternative: "—", issue: `${p.name} decision position`, owner: p.name, status: "Active", confidence: "—", action: "Open positions", target: "panel-positions" }));
  });
  constraintsFor("DIA 5001").forEach((c) => {
    if (match(c.id, c.title, c.description, c.authority, c.constraintType))
      out.push(hit({ type: "Condition", decision: c.evaluationId, alternative: c.affectedAlternativeIds.join(", "), issue: c.title, owner: c.authority, status: c.status, confidence: `${c.confidence}%`, action: "Open constraints", target: "panel-constraints" }));
  });
  sharedDependencies.forEach((d) => {
    if (match(d.id, d.name, d.criticality, d.exposure))
      out.push(hit({ type: "Dependency", decision: "DIA 5001", alternative: d.alternatives.join(", "), issue: d.exposure, owner: "Coordination Office", status: d.criticality, confidence: `${d.confidence}%`, action: "Open dependencies", target: "panel-dependencies" }));
  });
  tradeoffsFor("DIA 5001").forEach((t) => {
    if (match(t.id, t.title, t.description, t.benefit, t.cost, t.tradeoffType))
      out.push(hit({ type: "Tradeoff", decision: t.evaluationId, alternative: t.alternativeIds.join(", "), issue: t.title, owner: "Decision Facilitation", status: t.status, confidence: `${t.confidence}%`, action: "Open tradeoffs", target: "panel-tradeoffs" }));
  });
  alternativeRisks.forEach((r) => {
    if (match(r.id, r.risk, r.control, r.rawSeverity, r.residualSeverity, r.status))
      out.push(hit({ type: "Risk", decision: r.evaluationId, alternative: r.alternativeId, issue: `${r.risk} · control ${r.control}`, owner: "Risk Committee", status: r.status, confidence: `${r.confidence}%`, action: "Open risks", target: "panel-risks" }));
  });
  evidenceFor("DIA 5001").forEach((e) => {
    if (match(e.id, e.name, e.evidenceType, e.decisionDimension, e.authority, e.status))
      out.push(hit({ type: "Evidence", decision: e.evaluationId, alternative: e.alternativesAffected.join(", "), issue: `${e.name} · ${e.status}`, owner: e.authority, status: e.status, confidence: `${e.confidence}%`, action: "Open evidence", target: "panel-evidence" }));
  });
  seedMitigations.forEach((m) => {
    if (match(m.id, m.title, m.description, m.owner, m.status))
      out.push(hit({ type: "Mitigation", decision: m.evaluationId, alternative: m.alternativeId, issue: m.title, owner: m.owner, status: m.status, confidence: `${m.confidence}%`, action: "Open mitigations", target: "panel-mitigations" }));
  });
  reviews.forEach((r) => {
    if (match(r.id, r.reviewType, r.reviewer, r.reviewerRole, r.issue, r.status, r.decision, r.decisionName))
      out.push(hit({ type: "Review", decision: r.evaluationId, alternative: "—", issue: `${r.reviewType} · ${r.issue}`, owner: r.reviewer, status: r.status, confidence: `${r.evidenceCoverage}%`, action: "Open review queue", target: "panel-review-queue" }));
  });
  approvals.forEach((a) => {
    if (match(a.id, a.approvalStage, a.approver, a.approverRole, a.status, a.decision, a.conditions.join(" ")))
      out.push(hit({ type: "Approval", decision: a.evaluationId, alternative: "ALT 5001 B", issue: `${a.approvalStage} · ${a.approver}`, owner: a.approver, status: a.status, confidence: "—", action: "Open approvals", target: "panel-approvals" }));
  });
  dissents.forEach((d) => {
    if (match(d.id, d.team, d.position, d.reason, d.status, d.severity))
      out.push(hit({ type: "Dissent", decision: d.evaluationId, alternative: d.preferredAlternativeId, issue: d.position, owner: d.team, status: d.status, confidence: "—", action: "Open dissent", target: "panel-dissent" }));
  });
  seedEscalations.forEach((e) => {
    if (match(e.id, e.title, e.description, e.issueType, e.owner, e.status))
      out.push(hit({ type: "Escalation", decision: e.evaluationId, alternative: e.alternativeIds.join(", "), issue: e.title, owner: e.owner, status: e.status, confidence: "—", action: "Open escalations", target: "panel-escalation" }));
  });
  priorDecisions.forEach((p) => {
    if (match(p.id, p.name, p.decision, p.lesson))
      out.push(hit({ type: "Prior Decision", decision: p.id, alternative: "—", issue: p.lesson, owner: "Organizational Learning", status: p.currentRelevance, confidence: `${p.similarity}%`, action: "Open prior decisions", target: "panel-prior" }));
  });
  registeredOutcomes.forEach((o) => {
    if (match(o.id, o.metric, o.expectedValue, o.owner, o.outcomeType))
      out.push(hit({ type: "Expected Outcome", decision: "DEC 5001", alternative: "ALT 5001 B", issue: `${o.metric} expected ${o.expectedValue}`, owner: o.owner, status: "Registered", confidence: "—", action: "Open expected outcomes", target: "panel-registered-outcomes" }));
  });
  seedVersions.forEach((v) => {
    if (match(v.id, v.kind, v.reason, v.changedBy, v.decisionOutcome))
      out.push(hit({ type: "Decision Version", decision: v.id, alternative: "—", issue: v.reason, owner: v.changedBy, status: v.kind, confidence: `${v.evidenceCoverage}%`, action: "Open version history", target: "panel-versions" }));
  });
  if (record && match(record.id, record.decision, record.decisionRationale, record.decisionOwner))
    out.push(hit({ type: "Decision Record", decision: record.id, alternative: record.selectedAlternativeId, issue: record.decision, owner: record.decisionOwner, status: record.status, confidence: `${record.confidence}%`, action: "Open decision record", target: "panel-decision-record" }));

  return out.slice(0, 60);
}

/* ================================================================ exports = */

export const exportFormats = ["CSV", "JSON", "YAML", "PDF Summary", "Presentation Snapshot", "Decision Record Snapshot"];
export const exportScopes = [
  "Current Decision", "Selected Decisions", "Alternative Comparison", "Tradeoffs", "Risks", "Evidence",
  "Recommendation", "Reviews", "Approvals", "Dissent", "Decision Record", "Expected Outcomes",
  "Execution Handoff", "Decision Version Comparison", "Full Decision Context Package",
];
export const exportOptions = [
  "Decision Question", "Alternatives", "Persona Positions", "Conditions", "Dependencies", "Tradeoffs",
  "Risks", "Controls", "Mitigations", "Evidence", "Recommendation", "Approvals", "Dissent",
  "Decision Rationale", "Expected Outcomes", "Audit History",
];

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const head = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [head.join(","), ...rows.map((r) => head.map((h) => esc(r[h])).join(","))].join("\n");
}

export function toYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) return value.map((v) => `${pad}- ${typeof v === "object" && v ? `\n${toYaml(v, indent + 1)}` : String(v)}`).join("\n");
  if (value && typeof value === "object")
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => (typeof v === "object" && v ? `${pad}${k}:\n${toYaml(v, indent + 1)}` : `${pad}${k}: ${String(v)}`))
      .join("\n");
  return `${pad}${String(value)}`;
}

export function buildExportRows(
  scope: string,
  s: DecisionScenarioState,
  reviews: DecisionReview[],
  approvals: DecisionApproval[],
  dissents: DecisionDissent[],
  record: DecisionRecord | null,
): Record<string, unknown>[] {
  switch (scope) {
    case "Alternative Comparison":
      return alternativesFor("DIA 5001").map((a) => ({
        alternative: a.code, name: a.name, customerBenefit: a.customerBenefit, businessBenefit: a.businessBenefit,
        residualRisk: a.residualRisk, reversibility: a.reversibility, confidence: a.confidence, status: a.status,
      }));
    case "Tradeoffs":
      return tradeoffsFor("DIA 5001").map((t) => ({ id: t.id, type: t.tradeoffType, title: t.title, benefit: t.benefit, cost: t.cost, confidence: t.confidence, status: t.status }));
    case "Risks":
      return alternativeRisks.map((r) => ({ id: r.id, alternative: r.alternativeId, risk: r.risk, raw: r.rawSeverity, control: r.control, residual: r.residualSeverity, status: r.status }));
    case "Evidence":
      return evidenceFor("DIA 5001").map((e) => ({ id: e.id, name: e.name, type: e.evidenceType, authority: e.authority, required: e.required, status: e.status, confidence: e.confidence }));
    case "Reviews":
      return reviews.map((r) => ({ id: r.id, decision: r.decisionName, type: r.reviewType, reviewer: r.reviewer, severity: r.severity, status: r.status, outcome: r.decision, due: r.dueAt }));
    case "Approvals":
      return approvals.map((a) => ({ id: a.id, stage: a.approvalStage, approver: a.approver, status: a.status, decision: a.decision, conditions: a.conditions.join("; ") }));
    case "Dissent":
      return dissents.map((d) => ({ id: d.id, team: d.team, position: d.position, reason: d.reason, severity: d.severity, status: d.status, preferred: d.preferredAlternativeId }));
    case "Decision Record":
      return record ? [{ id: record.id, decision: record.decision, alternative: record.selectedAlternativeId, rationale: record.decisionRationale, conditions: record.conditions.map((c) => c.text).join("; "), owner: record.decisionOwner, confidence: record.confidence, date: record.decisionDate }] : [];
    case "Expected Outcomes":
      return registeredOutcomes.map((o) => ({ id: o.id, metric: o.metric, baseline: o.baseline, expected: o.expectedValue, range: o.acceptableRange, window: o.observationWindow, owner: o.owner, escalation: o.escalationThreshold }));
    case "Execution Handoff":
      return [{ decision: "DEC 5001", alternative: "ALT 5001 B", trafficLimits: emptyHandoff.trafficLimits, controls: requiredControls.join("; "), rollback: emptyHandoff.rollbackTriggers.join("; "), window: emptyHandoff.deploymentWindow }];
    case "Decision Version Comparison":
      return compareVersions(seedVersions[0], seedVersions[seedVersions.length - 1]).map((r) => ({ field: r.field, from: r.left, to: r.right, state: r.state }));
    case "Recommendation":
      return [{ posture: s.posture, alternative: s.preferredAlternativeId, confidence: s.confidence, evidenceCoverage: s.evidenceCoverage, conditions: s.activeConditions.join("; ") }];
    case "Full Decision Context Package":
      return [
        { section: "Decision Question", value: evaluations[0].decisionQuestion },
        { section: "Alternatives", value: alternativesFor("DIA 5001").map((a) => a.code).join(", ") },
        { section: "Recommendation", value: `${s.posture} · ${s.confidence}%` },
        { section: "Evidence Coverage", value: `${s.evidenceCoverage}%` },
        { section: "Approvals", value: approvals.map((a) => `${a.approver}:${a.status}`).join("; ") },
        { section: "Dissent", value: dissents.map((d) => `${d.team}:${d.position}`).join("; ") },
        { section: "Decision", value: record ? record.decision : "Not yet recorded" },
      ];
    default:
      return evaluations.map((e) => ({ id: e.id, workItem: e.workItem, question: e.decisionQuestion, status: e.status, posture: e.recommendationPosture, confidence: e.recommendationConfidence, evidence: e.evidenceCoverage }));
  }
}

/* ============================================================ start wizard = */

export const startSteps = [
  "Select Input Context", "Define Decision", "Select Alternatives", "Analysis Scope",
  "Context Rules", "Quality Controls", "Review", "Execute",
];

export const inputPackages = [
  { id: "CTA 3001", name: "Checkout Retry Policy Update", team: "Checkout Engineering", personas: 6, completedAt: "2026-08-06 09:12" },
  { id: "CTA 2988", name: "Identity Token Cache Optimization", team: "Identity Engineering", personas: 4, completedAt: "2026-08-05 16:40" },
  { id: "CTA 2979", name: "Regional Token Vault Migration", team: "Payments Platform", personas: 5, completedAt: "2026-08-04 12:02" },
  { id: "CTA 2995", name: "Fraud Decision Timeout Adjustment", team: "Fraud Engineering", personas: 4, completedAt: "2026-08-05 09:31" },
];

export const suggestedAlternatives = [
  { id: "SUG 1", code: "Option A", name: "Maintain Current State", description: "The do nothing alternative retained for explicit comparison" },
  { id: "SUG 2", code: "Option B", name: "Controlled Change", description: "Three retries with segmented progressive rollout" },
  { id: "SUG 3", code: "Option C", name: "Broad Change", description: "Three retries at full exposure" },
  { id: "SUG 4", code: "Option D", name: "Alternative Design", description: "Error classification aware retry policy" },
];

export const analysisScopeOptions = [
  "Customer", "Business", "Financial", "Operational", "Reliability", "Security", "Compliance",
  "Dependencies", "Risk", "Controls", "Coordination", "Reversibility", "Evidence",
];

export const contextRuleOptions = [
  "Use Current Approved Personas", "Use Current Business Conditions", "Include Historical Decisions",
  "Include Outcomes", "Include Learning Records", "Respect Access", "Allow Supporting Evidence",
];

export const qualityControlDefaults = {
  minimumEvidenceCoverage: 90,
  minimumPersonaCoverage: 100,
  minimumDependencyCoverage: 90,
  humanReviewThreshold: 85,
  materialRiskThreshold: "High",
  recommendationConfidenceTarget: 95,
};

export const executionSteps = [
  "Loading Decision Context", "Defining Decision Scope", "Loading Alternatives", "Retrieving Enterprise Memory",
  "Evaluating Personas", "Evaluating Conditions", "Evaluating Risks", "Evaluating Expected Outcomes",
  "Comparing Tradeoffs", "Synthesizing Recommendation", "Preparing Decision Context", "Completed",
];

/* ============================================================ decision scope */

export interface DecisionScope {
  question: string;
  owner: string;
  deadline: string;
  businessObjective: string;
  inScope: string[];
  outOfScope: string[];
  affectedTeams: string[];
  affectedSystems: string[];
  affectedServices: string[];
  customerJourneys: string[];
  boundaries: string[];
  assumptions: string[];
}

export const seedScope: DecisionScope = {
  question: evaluations[0].decisionQuestion,
  owner: "Commerce Architecture Council",
  deadline: "Before next commerce release window",
  businessObjective: "Recover transient payment failures without increasing fraud loss or reducing availability",
  inScope: evaluations[0].scope,
  outOfScope: evaluations[0].outOfScope,
  affectedTeams: diPersonas.map((p) => p.name),
  affectedSystems: ["Order Management", "Ledger", "Token Vault"],
  affectedServices: sharedDependencies.map((d) => d.name),
  customerJourneys: ["Purchase", "Refund"],
  boundaries: ["No provider contract change", "No fraud model redesign", "No checkout UI change"],
  assumptions: evaluations[0].assumptions,
};

/** Scope changes recalculate the dependent decision context deterministically. */
export function scopeRecalculation(scope: DecisionScope) {
  return [
    { area: "Relevant Personas", value: `${scope.affectedTeams.length} Personas in scope` },
    { area: "Conditions", value: `${constraintsFor("DIA 5001").length} enterprise conditions apply` },
    { area: "Alternatives", value: `${alternativesFor("DIA 5001").length + seedRefinements.length} alternatives evaluated` },
    { area: "Tradeoffs", value: `${tradeoffsFor("DIA 5001").length} material tradeoffs` },
    { area: "Evidence", value: `${evidenceFor("DIA 5001").filter((e) => e.required).length} required evidence records` },
    { area: "Recommendation", value: `${scope.inScope.length} in scope dimensions feed the synthesis` },
  ];
}

/* ============================================================== demo story = */

export interface StoryStep { id: number; title: string; caption: string; notes: string; target: string; action?: string }

export const storySteps: StoryStep[] = [
  { id: 1, title: "Decision Portfolio", caption: "Decision Intelligence does not begin by asking what answer the enterprise wants. It begins by making the decision and its tradeoffs explicit.", notes: "Highlight Active Decision Evaluations and Material Tradeoffs in the KPI row.", target: "panel-kpis" },
  { id: 2, title: "Checkout Retry Decision", caption: "The Fabric brings together the Intake Package, Persona Impact Analysis, Cross Team Impact Analysis, enterprise conditions, dependencies, evidence, prior decisions, and observed outcomes.", notes: "Open DIA 5001 in the queue.", target: "panel-queue", action: "open-decision" },
  { id: 3, title: "Four Alternatives", caption: "The decision is not reduced to yes or no. Multiple viable alternatives can be evaluated against the same enterprise context.", notes: "Option A is the explicit do nothing alternative.", target: "panel-comparison" },
  { id: 4, title: "Team Persona Positions", caption: "Each team retains its own perspective. Checkout may favor customer recovery while Fraud remains concerned about financial exposure.", notes: "Positions are distinct, not averaged.", target: "panel-positions" },
  { id: 5, title: "Tradeoff Analysis", caption: "The Fabric makes visible what each alternative optimizes and what it asks the enterprise to sacrifice.", notes: "Every tradeoff names both the benefit and the cost.", target: "panel-tradeoffs" },
  { id: 6, title: "Prior Decision Intelligence", caption: "The enterprise can reuse what happened after similar decisions instead of rediscovering the same lessons.", notes: "DEC 4812 produced an unexpected duplicate authorization increase.", target: "panel-prior" },
  { id: 7, title: "Traffic Exposure 15%", caption: "As the proposed rollout changes, a governed approval condition activates before that change becomes another team's problem.", notes: "Watch the approval chain and constraints update.", target: "panel-scenario-simulator", action: "traffic-15" },
  { id: 8, title: "Progressive Rollout Off", caption: "The recommendation changes because reversibility and containment have changed.", notes: "Reversibility and residual risk both worsen.", target: "panel-scenario-simulator", action: "rollout-off" },
  { id: 9, title: "Evidence Added", caption: "New evidence increases confidence where uncertainty actually existed rather than simply making the score look better.", notes: "Fraud Loss Analysis and Dependency Stress Test are added.", target: "panel-evidence", action: "add-evidence" },
  { id: 10, title: "Recommendation Synthesis", caption: "The recommendation is explainable: supporting factors, counterarguments, conditions, assumptions, and evidence gaps remain visible.", notes: "Nothing collapses into a single score.", target: "panel-recommendation" },
  { id: 11, title: "Human Decision Review", caption: "Decision Intelligence supports human judgment rather than replacing it. Reviewers can agree, disagree, add conditions, or preserve dissent.", notes: "Nine reviews are outstanding across the portfolio.", target: "panel-review-queue" },
  { id: 12, title: "Record Decision", caption: "The final human decision is recorded together with its rationale, conditions, evidence, approvals, and expected outcomes.", notes: "Approve Option B with Conditions.", target: "panel-decision-record", action: "record-decision" },
  { id: 13, title: "Context Snapshot", caption: "The enterprise preserves exactly what was known and believed when the decision was made.", notes: "Later knowledge does not rewrite the snapshot.", target: "panel-snapshot" },
  { id: 14, title: "Execution and Observation", caption: "The decision becomes actionable, and the expected outcomes become measurable inputs for future Organizational Learning.", notes: "Prepare for Execution then create the Observation Contract.", target: "panel-handoff", action: "handoff" },
];

/* ========================================================== demo scenarios = */

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  note: string;
  params?: Partial<DecisionScenarioParams>;
  state?: "record" | "reset" | "handoff" | "contract" | "escalate" | "dissent" | "review" | "approve" | "conditional" | "reassess" | "new" | "portfolio";
}

export const demoScenarios: DemoScenario[] = [
  { id: "healthy", name: "Healthy Decision Portfolio", description: "Balanced portfolio, no blocking gaps", note: "Baseline portfolio posture", params: { trafficExposure: 5, progressiveRollout: true, fraudLossAnalysis: "Provided", dependencyStressTest: "Provided" }, state: "portfolio" },
  { id: "new", name: "New Decision Evaluation", description: "Freshly routed decision context", note: "Analysis has just started", params: { ...baselineScenario }, state: "new" },
  { id: "proceed", name: "Recommendation Proceed", description: "Evidence complete at low exposure", note: "Proceed with guardrails", params: { trafficExposure: 5, progressiveRollout: true, fraudLossAnalysis: "Provided", dependencyStressTest: "Provided", idempotencyEvidence: "Validated", rollbackCapability: "Available" } },
  { id: "conditional", name: "Conditional Proceed", description: "Fraud evidence outstanding", note: "Default Checkout Retry posture", params: { ...baselineScenario } },
  { id: "defer", name: "Defer Pending Evidence", description: "Critical evidence removed", note: "Recommendation withheld", params: { idempotencyEvidence: "Missing", fraudLossAnalysis: "Missing", dependencyStressTest: "Missing", rollbackCapability: "Unavailable" } },
  { id: "donot", name: "Do Not Proceed", description: "Full exposure without containment", note: "Revise proposal", params: { trafficExposure: 100, progressiveRollout: false, rollbackCapability: "Unavailable" } },
  { id: "fraud", name: "High Fraud Risk", description: "Broad exposure without fraud analysis", note: "Fraud residual risk stays high", params: { trafficExposure: 50, fraudLossAnalysis: "Missing" } },
  { id: "dependency", name: "Critical Dependency", description: "Dependency evidence unavailable", note: "EU headroom below target", params: { trafficExposure: 25, dependencyStressTest: "Missing" } },
  { id: "approval", name: "Approval Threshold Triggered", description: "Traffic above 10%", note: "Joint approval activates", params: { trafficExposure: 15 } },
  { id: "quarter", name: "Quarter End Restriction Triggered", description: "Restricted deployment window", note: "Governance restriction active", params: { deploymentTiming: "Quarter End Restricted Window" } },
  { id: "norollout", name: "Progressive Rollout Disabled", description: "Containment removed", note: "Reversibility worsens", params: { progressiveRollout: false } },
  { id: "evidence", name: "Evidence Added", description: "Fraud and dependency evidence provided", note: "Confidence rises where uncertainty existed", params: { fraudLossAnalysis: "Provided", dependencyStressTest: "Provided" } },
  { id: "recchange", name: "Recommendation Changed", description: "Exposure and containment changed together", note: "Posture moves", params: { trafficExposure: 100, progressiveRollout: false } },
  { id: "disagree", name: "Reviewer Disagrees", description: "Fraud review records disagreement", note: "Comment is mandatory", state: "review" },
  { id: "dissent", name: "Dissent Recorded", description: "Minority position preserved", note: "Dissent is never hidden", state: "dissent" },
  { id: "pending", name: "Approval Pending", description: "Governance approval outstanding", note: "Approval chain incomplete", params: { trafficExposure: 15 }, state: "approve" },
  { id: "approved", name: "Approved with Conditions", description: "Conditional approval recorded", note: "Conditions attached to the approval", state: "conditional" },
  { id: "escalated", name: "Decision Escalated", description: "Escalation raised", note: "Executive tradeoff required", state: "escalate" },
  { id: "recorded", name: "Decision Recorded", description: "DEC 5001 recorded", note: "Recommendation and decision remain separate", state: "record" },
  { id: "handoff", name: "Execution Handoff Ready", description: "Governed execution conditions prepared", note: "Handoff record created", state: "handoff" },
  { id: "contract", name: "Observation Contract Created", description: "Learning observation contract created", note: "No outcomes are fabricated", state: "contract" },
  { id: "reassess", name: "Decision Reassessment Required", description: "Context changed after recording", note: "Reassessment notification raised", state: "reassess" },
  { id: "reset", name: "Reset Demo Data", description: "Return to the seeded baseline", note: "All operational state resets", state: "reset" },
];

/* ================================================================= states = */

export const operationalStates = [
  "Loading", "Empty", "Error", "Analyzing", "Evidence Required", "Review Required",
  "Recommendation Ready", "Approval Pending", "Approved", "Approved with Conditions", "Rejected",
  "Deferred", "Escalated", "Dissent Recorded", "Decision Ready", "Decision Recorded",
  "Execution Ready", "Observation Contract Ready", "Blocked", "Paused",
];

export const outcomeById = (id: string) => registeredOutcomes.find((o) => o.id === id);
export const personaNameById = (id: string) => diPersonas.find((p) => p.id === id)?.name ?? id;
export const evidenceName = (id: string) => evidenceById(id)?.name ?? id;
export const alternativeCode = (id: string) =>
  alternatives.find((a) => a.id === id)?.code ?? (id === "ALT 5001 B2" ? "Option B2" : id);
export const outcomesForDecision = () => outcomesFor("DIA 5001");
export const positionsForDecision = () => personaPositions.filter((p) => p.evaluationId === "DIA 5001");
