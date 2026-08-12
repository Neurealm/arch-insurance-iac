/**
 * Cognitive Readiness Assessment — deterministic readiness engine.
 *
 * The engine recalculates dimension scores, gate status, and the overall
 * readiness classification from local workbench state. A critical gate failure
 * always overrides a favourable average score.
 */

import {
  readinessDimensions, readinessGates, personaStates, dependencyStates,
  type CognitiveReadinessGate, type CognitiveReadinessPersonaState, type GateStatus,
  type ReadinessState,
} from "./data";

export interface WorkbenchState {
  proposedStateDefined: boolean;
  rollbackDefined: boolean;
  trafficExposure: 5 | 15;
  fraudLossAnalysisProvided: boolean;
  stressTestProvided: boolean;
  regionalDependencyValidated: boolean;
  fraudPolicyBound: boolean;
}

export const initialWorkbenchState: WorkbenchState = {
  proposedStateDefined: true,
  rollbackDefined: true,
  trafficExposure: 5,
  fraudLossAnalysisProvided: false,
  stressTestProvided: false,
  regionalDependencyValidated: false,
  fraudPolicyBound: false,
};

export interface ReadinessComputation {
  dimensionScores: Record<string, number>;
  gates: CognitiveReadinessGate[];
  score: number;
  state: ReadinessState;
  confidence: number;
  warnings: string[];
  materialGaps: string[];
  blockingGaps: string[];
  passedGates: number;
  governanceRequired: boolean;
  personas: CognitiveReadinessPersonaState[];
  dependencies: typeof dependencyStates;
  overrideReason: string | null;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function computeReadiness(s: WorkbenchState): ReadinessComputation {
  const base: Record<string, number> = {};
  readinessDimensions.forEach((d) => { base[d.id] = d.score; });

  const warnings: string[] = [];
  const materialGaps: string[] = [];
  const blockingGaps: string[] = [];

  // Evidence
  if (s.fraudLossAnalysisProvided) base.evidence += 7; else materialGaps.push("Fraud Loss Analysis missing");
  if (s.stressTestProvided) { base.evidence += 6; base.scope += 4; } else materialGaps.push("Regional Dependency Stress Test missing");
  if (!s.fraudLossAnalysisProvided || !s.stressTestProvided) warnings.push("Required evidence is incomplete for this work type");

  // Assumptions / exposure
  if (s.trafficExposure === 15) {
    base.assumptions -= 6;
    materialGaps.push("Demand assumption for 15% traffic needs confirmation");
    warnings.push("Traffic above 10% activates joint approval governance context");
  } else {
    materialGaps.push("Demand assumption for 15% traffic needs confirmation");
  }

  // Dependencies
  if (s.regionalDependencyValidated) { base.scope += 6; base.evidence += 3; }
  else warnings.push("Regional Token Vault dependency is unvalidated");

  // Policy binding
  if (s.fraudPolicyBound) base.enterprise += 4;

  // Execution
  if (!s.rollbackDefined) { base.execution = 42; blockingGaps.push("Rollback capability is undefined"); }

  // Required context
  if (!s.proposedStateDefined) { base.state = 38; base.intent -= 10; blockingGaps.push("Proposed state is undefined"); }

  const dimensionScores: Record<string, number> = {};
  Object.keys(base).forEach((k) => { dimensionScores[k] = clamp(base[k]); });

  /* ------------------------------------------------------------- gates -- */
  const gateStatus = (id: string): { status: GateStatus; note: string } => {
    if (id === "required-context") {
      return s.proposedStateDefined
        ? { status: "Passed", note: "All required context elements are present in Intake Package v3." }
        : { status: "Failed", note: "Proposed state is missing. No meaningful analysis is possible." };
    }
    if (id === "material-impact") {
      if (!s.regionalDependencyValidated || s.trafficExposure === 15) {
        return {
          status: s.regionalDependencyValidated ? "Needs Clarification" : "Passed with Warning",
          note: s.trafficExposure === 15
            ? "Exposure above 10% requires confirmed demand assumptions and joint approval context."
            : "Regional Token Vault dependency is unvalidated.",
        };
      }
      return { status: "Passed", note: "Dependencies, Personas, and Conditions are resolved." };
    }
    if (id === "evidence") {
      if (!s.fraudLossAnalysisProvided && !s.stressTestProvided) {
        return s.trafficExposure === 15
          ? { status: "Needs Evidence", note: "At 15% exposure the missing evidence becomes required." }
          : { status: "Passed with Warning", note: "Fraud Loss Analysis and Regional Dependency Stress Test are missing but non blocking at 5% exposure." };
      }
      if (!s.fraudLossAnalysisProvided || !s.stressTestProvided) {
        return { status: "Passed with Warning", note: "One required evidence item is still missing." };
      }
      return { status: "Passed", note: "Evidence classes relevant to this work type are complete." };
    }
    // execution-safety
    return s.rollbackDefined
      ? { status: "Passed", note: "Rollback trigger defined at duplicate authorization >0.2% for five minutes." }
      : { status: "Failed", note: "No rollback capability or stop condition is defined." };
  };

  const gates = readinessGates.map((g) => ({ ...g, ...gateStatus(g.id) }));
  const passedGates = gates.filter((g) => g.status === "Passed" || g.status === "Passed with Warning").length;

  /* ------------------------------------------------------------- score -- */
  const values = readinessDimensions.map((d) => dimensionScores[d.id]);
  const score = clamp(values.reduce((a, b) => a + b, 0) / values.length);

  let state: ReadinessState;
  let overrideReason: string | null = null;

  if (gates.some((g) => g.id === "required-context" && g.status === "Failed")) {
    state = "Blocked";
    overrideReason = "Required Context Gate failed. A favourable average score cannot override missing required context.";
  } else if (gates.some((g) => g.id === "execution-safety" && g.status === "Failed")) {
    state = "Remediation Required";
    overrideReason = "Execution Safety Gate failed. Rollback capability is unknown while operational exposure is High.";
  } else if (gates.some((g) => g.status === "Needs Evidence")) {
    state = "Evidence Required";
    overrideReason = "Evidence Gate requires evidence at the selected exposure level.";
  } else if (gates.some((g) => g.status === "Needs Clarification")) {
    state = "Clarification Required";
    overrideReason = "Material Impact Context Gate requires clarification.";
  } else if (score >= 92 && materialGaps.length === 0) {
    state = "Ready";
  } else {
    state = "Conditionally Ready";
  }

  const confidence = clamp(
    94 - (s.proposedStateDefined ? 0 : 20) - (s.rollbackDefined ? 0 : 12)
    + (s.fraudLossAnalysisProvided ? 2 : 0) + (s.stressTestProvided ? 2 : 0),
  );

  /* ---------------------------------------------------------- personas -- */
  const personas = personaStates.map((p) => {
    if (p.persona === "Fraud Engineering" && s.fraudLossAnalysisProvided) {
      return { ...p, evidenceCoverage: 92, readiness: "Ready", confidence: 93, primaryGap: "None" };
    }
    if (p.persona === "Identity Engineering" && (s.regionalDependencyValidated || s.stressTestProvided)) {
      return { ...p, dependencyCoverage: 92, readiness: "Ready", confidence: 92, primaryGap: "None" };
    }
    if (!s.rollbackDefined && (p.persona === "Site Reliability Engineering" || p.persona === "Release Governance")) {
      return { ...p, readiness: "Not Evaluable — Execution Context Missing", confidence: 58, primaryGap: "Rollback undefined" };
    }
    if (!s.proposedStateDefined) {
      return { ...p, readiness: "Not Evaluable — Proposed State Missing", confidence: 40, primaryGap: "Proposed state undefined" };
    }
    return p;
  });

  const dependencies = dependencyStates.map((d) =>
    d.dependency === "Regional Token Vault" && s.regionalDependencyValidated
      ? { ...d, status: "Validated", confidence: 93, evidenceCoverage: 93, freshness: "Current" }
      : d);

  return {
    dimensionScores, gates, score, state, confidence, warnings, materialGaps, blockingGaps,
    passedGates, governanceRequired: s.trafficExposure === 15, personas, dependencies, overrideReason,
  };
}

export const recommendationFor = (c: ReadinessComputation): string => {
  if (c.state === "Blocked") return "Do not proceed to Persona Impact Analysis. Required context is missing.";
  if (c.state === "Remediation Required") return "Remediate execution context before Persona Impact Analysis can begin.";
  if (c.state === "Evidence Required") return "Obtain the required evidence before proceeding at this exposure level.";
  if (c.state === "Clarification Required") return "Clarify material impact context before proceeding.";
  if (c.state === "Ready") return "Proceed to Persona Impact Analysis.";
  return "Proceed to Persona Impact Analysis with explicit evidence gaps and uncertainty markers.";
};
