/**
 * Cognitive Readiness Assessment — Prompt 2 operations engine.
 *
 * Pure deterministic functions layered on top of the Prompt 1 readiness engine.
 * Nothing here approves work and nothing here computes Persona impact.
 */

import {
  ambiguities, assumptions, conditionStates, constraints, contradictions, dependencyStates,
  evidenceItems, personaStates, qualityDimensions, workContext,
  type CognitiveReadinessGate, type CognitiveReadinessPersonaState,
} from "./data";
import type { ReadinessComputation } from "./engine";
import {
  handoffReadinessBaseline, observationRequirements, policyVariables, protectedOverrideItems,
  seedActivity, seedAmbiguityStates, seedAssumptionStates, seedConditionStates, seedConstraintStates,
  seedDependencyStates, seedNotifications, seedPersonaScope, seedRemediations, seedReviews, seedVersions,
  type CognitiveReadinessActivity, type CognitiveReadinessAddedEvidence,
  type CognitiveReadinessAssessmentVersion, type CognitiveReadinessClarification,
  type CognitiveReadinessEvidenceRequest, type CognitiveReadinessException,
  type CognitiveReadinessHandoffPackage, type CognitiveReadinessNotification,
  type CognitiveReadinessOverride, type CognitiveReadinessRemediation, type CognitiveReadinessReview,
  type OperationalState, type Severity,
} from "./ops-data";

/* ------------------------------------------------------------------ state -- */

export interface OpsState {
  operationalState: OperationalState;
  remediations: CognitiveReadinessRemediation[];
  clarifications: CognitiveReadinessClarification[];
  evidenceRequests: CognitiveReadinessEvidenceRequest[];
  addedEvidence: CognitiveReadinessAddedEvidence[];
  dependencies: Record<string, { status: string; confidence: number }>;
  personaScope: Record<string, { included: boolean; primary: boolean }>;
  conditions: Record<string, string>;
  policyBindings: Record<string, string>;
  assumptionStates: Record<string, string>;
  acceptedAssumptions: string[];
  constraintStates: Record<string, string>;
  ambiguityStates: Record<string, { status: string; interpretation: string; confidence: string }>;
  contradictionResolutions: Record<string, { choice: string; value: string; reason: string }>;
  acceptedUncertainty: string[];
  reviews: CognitiveReadinessReview[];
  exceptions: CognitiveReadinessException[];
  overrides: CognitiveReadinessOverride[];
  versions: CognitiveReadinessAssessmentVersion[];
  activity: CognitiveReadinessActivity[];
  notifications: CognitiveReadinessNotification[];
  historicalViolations: number;
  routed: boolean;
  routedPackageVersion: string | null;
  scenario: string;
}

export const initialOpsState: OpsState = {
  operationalState: "Conditionally Ready",
  remediations: seedRemediations,
  clarifications: [],
  evidenceRequests: [],
  addedEvidence: [],
  dependencies: { ...seedDependencyStates },
  personaScope: { ...seedPersonaScope },
  conditions: { ...seedConditionStates },
  policyBindings: {},
  assumptionStates: { ...seedAssumptionStates },
  acceptedAssumptions: [],
  constraintStates: { ...seedConstraintStates },
  ambiguityStates: { ...seedAmbiguityStates },
  contradictionResolutions: {},
  acceptedUncertainty: [],
  reviews: seedReviews,
  exceptions: [],
  overrides: [],
  versions: seedVersions,
  activity: seedActivity,
  notifications: seedNotifications,
  historicalViolations: 0,
  routed: false,
  routedPackageVersion: null,
  scenario: "Healthy Assessment Portfolio",
};

/* ----------------------------------------------------------------- helpers -- */

let seq = 0;
export const nextId = (prefix: string) => `${prefix} ${String(++seq).padStart(4, "0")}`;
export const resetIdSequence = () => { seq = 0; };

export const clockLabel = (d = new Date()) =>
  d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export const activityEntry = (category: string, entry: string): CognitiveReadinessActivity => ({
  id: nextId("ACT"), time: clockLabel(), category, entry,
});

export const notification = (
  category: string, title: string, detail: string, severity: Severity = "Medium",
): CognitiveReadinessNotification => ({
  id: nextId("NTF"), category, title, detail, severity, time: clockLabel(), read: false, acknowledged: false,
});

/* -------------------------------------------------- 2. remediation summary -- */

export interface RemediationSummary {
  open: number; blocking: number; critical: number; high: number; medium: number; low: number;
  byCategory: Record<string, number>;
}

export function remediationSummary(rows: CognitiveReadinessRemediation[]): RemediationSummary {
  const open = rows.filter((r) => r.status !== "Resolved" && r.status !== "Cancelled");
  const byCategory: Record<string, number> = {};
  open.forEach((r) => { byCategory[r.category] = (byCategory[r.category] ?? 0) + 1; });
  return {
    open: open.length,
    blocking: open.filter((r) => r.blocking).length,
    critical: open.filter((r) => r.severity === "Critical").length,
    high: open.filter((r) => r.severity === "High").length,
    medium: open.filter((r) => r.severity === "Medium").length,
    low: open.filter((r) => r.severity === "Low").length,
    byCategory,
  };
}

/* ---------------------------------------------- 5. clarification responses -- */

export interface ClarificationOutcome {
  response: string;
  effect: string;
  patch: { trafficExposure?: 5 | 15; boundedInterpretation?: string; ambiguityId?: string };
}

/** Deterministic synthetic responses for the demonstration clarifications. */
export function simulateClarificationResponse(question: string): ClarificationOutcome {
  const q = question.toLowerCase();
  if (q.includes("all payment transactions") || q.includes("transaction class") || q.includes("transient")) {
    return {
      response: "Only transient failure classes eligible for retry.",
      effect: "Scope ambiguity resolved. Applicable conditions and Persona readiness recalculated.",
      patch: { boundedInterpretation: "Network timeout and recoverable provider error codes only.", ambiguityId: "AM 01" },
    };
  }
  if (q.includes("traffic exposure") || q.includes("maximum planned")) {
    return {
      response: "15%",
      effect: "Traffic >10% Joint Approval condition activated. Release Governance Persona readiness recalculated.",
      patch: { trafficExposure: 15 },
    };
  }
  return {
    response: "Owner confirmed the stated context is accurate.",
    effect: "Clarification recorded. Affected dimension recalculated.",
    patch: {},
  };
}

/* ----------------------------------------------------- 13/15 uncertainty -- */

export const uncertaintyMarkersFor = (s: OpsState): string[] => {
  const markers: string[] = [];
  s.acceptedAssumptions.forEach((id) => {
    const a = assumptions.find((x) => x.id === id);
    if (a) markers.push(`Accepted assumption — ${a.assumption} (${a.confidence} confidence)`);
  });
  Object.entries(s.ambiguityStates).forEach(([id, v]) => {
    if (v.status === "Accepted for Evaluation" && v.interpretation) {
      const a = ambiguities.find((x) => x.id === id);
      markers.push(`Bounded interpretation — “${a?.text ?? id}” read as ${v.interpretation} (${v.confidence || "Moderate"} confidence)`);
    }
  });
  s.acceptedUncertainty.forEach((u) => markers.push(`Accepted nonblocking uncertainty — ${u}`));
  s.exceptions.filter((e) => e.status === "Approved").forEach((e) =>
    markers.push(`Governed exception — ${e.blockingItem} (expires ${e.expiration})`));
  return markers;
};

/* ------------------------------------------------ 28. downstream warnings -- */

export interface DownstreamWarning {
  persona: string;
  reason: string;
  marker: string;
}

export function downstreamWarnings(
  s: OpsState, computation: ReadinessComputation,
): DownstreamWarning[] {
  const out: DownstreamWarning[] = [];
  const fraudResolved = s.addedEvidence.some((e) => /fraud loss/i.test(e.name));
  if (!fraudResolved) {
    out.push({ persona: "Fraud Engineering", reason: "Fraud Loss Analysis incomplete", marker: "Evidence Limited" });
  }
  const identity = s.dependencies["Regional Token Vault"];
  if (identity && identity.status !== "Validated") {
    out.push({ persona: "Identity Engineering", reason: `Dependency confidence ${identity.confidence}%`, marker: "Dependency Validation Warning" });
  }
  if (computation.governanceRequired) {
    out.push({ persona: "Release Governance", reason: "Traffic exposure 15%", marker: "Governance Review Required" });
  }
  return out;
}

/* -------------------------------------------------- 26. handoff readiness -- */

export interface HandoffReadiness {
  areas: { area: string; value: number }[];
  allGatesPassed: boolean;
  warnings: number;
  handoffState: string;
  enabled: boolean;
  blockedReason: string | null;
}

export function handoffReadiness(
  s: OpsState, computation: ReadinessComputation,
): HandoffReadiness {
  const evidenceBoost = Math.min(16, s.addedEvidence.length * 8);
  const depBoost = s.dependencies["Regional Token Vault"]?.status === "Validated" ? 8 : 0;
  const personaCount = Object.values(s.personaScope).filter((p) => p.included).length;

  const areas = handoffReadinessBaseline.map((a) => {
    if (a.area === "Evidence") return { ...a, value: Math.min(100, a.value + evidenceBoost) };
    if (a.area === "Dependencies") return { ...a, value: Math.min(100, a.value + depBoost) };
    if (a.area === "Persona Context") return { ...a, value: personaCount >= 4 ? a.value : Math.max(40, a.value - 25) };
    if (a.area === "Execution Context") return { ...a, value: computation.gates.find((g) => g.id === "execution-safety")?.status === "Failed" ? 42 : a.value };
    return a;
  });

  const allGatesPassed = computation.gates.every(
    (g) => g.status === "Passed" || g.status === "Passed with Warning" || g.status === "Not Applicable",
  );
  const warnings = computation.gates.filter((g) => g.status === "Passed with Warning").length
    + computation.warnings.length;

  const integrityBlocked = s.historicalViolations > 0;
  const handoffState = integrityBlocked
    ? "Blocked — Historical Context Integrity"
    : allGatesPassed
      ? (warnings > 0 ? "Ready with Explicit Uncertainty" : "Ready for Persona Impact Analysis")
      : "Not Ready for Persona Impact Analysis";

  return {
    areas, allGatesPassed, warnings, handoffState,
    enabled: !integrityBlocked && allGatesPassed,
    blockedReason: integrityBlocked
      ? "Historical Context Rewrite Violations detected. Handoff is disabled until integrity is restored."
      : allGatesPassed ? null : "One or more required Readiness Gates have not passed.",
  };
}

/* ------------------------------------------------- 27. routing validation -- */

export interface RoutingValidation {
  allowed: boolean;
  reasons: string[];
  gateResults: { gate: string; status: string; verdict: "OK" | "Warning" | "Blocking" }[];
}

export function validateRouting(
  s: OpsState, gates: CognitiveReadinessGate[], stage: "Architecture" | "Implementation" = "Implementation",
): RoutingValidation {
  const reasons: string[] = [];
  const gateResults = gates.map((g) => {
    let verdict: "OK" | "Warning" | "Blocking" = "OK";
    if (g.id === "required-context" && g.status !== "Passed") {
      verdict = "Blocking"; reasons.push("Required Context Gate must pass before routing.");
    } else if (g.id === "material-impact" && g.status !== "Passed") {
      const governed = s.acceptedUncertainty.length > 0 || s.exceptions.some((e) => e.status === "Approved");
      verdict = governed ? "Warning" : "Blocking";
      if (!governed) reasons.push("Material Impact Context Gate must pass or carry governed explicit uncertainty.");
    } else if (g.id === "evidence" && g.status !== "Passed") {
      if (g.status === "Needs Evidence") { verdict = "Blocking"; reasons.push("Evidence Gate requires evidence at the selected exposure level."); }
      else verdict = "Warning";
    } else if (g.id === "execution-safety" && g.status !== "Passed") {
      if (stage === "Architecture") verdict = "Warning";
      else { verdict = "Blocking"; reasons.push("Execution Safety Gate must pass for implementation level analysis."); }
    }
    return { gate: g.name, status: stage === "Architecture" && g.id === "execution-safety" && g.status !== "Passed" ? "Not Applicable at this stage" : g.status, verdict };
  });

  if (s.historicalViolations > 0) reasons.push("Historical Context Rewrite Violations block handoff.");
  return { allowed: reasons.length === 0, reasons, gateResults };
}

/* ------------------------------------------------------- 21. override rules -- */

export const isProtectedOverride = (item: string) =>
  protectedOverrideItems.some((p) => item.toLowerCase().includes(p.toLowerCase()));

/* ---------------------------------------------------- 20. exception expiry -- */

export function expireExceptions(
  list: CognitiveReadinessException[], today = new Date(),
): CognitiveReadinessException[] {
  return list.map((e) =>
    e.status === "Approved" && new Date(e.expiration) < today ? { ...e, status: "Expired" as const } : e);
}

/* ------------------------------------------------------- 29. quality model -- */

export interface QualityModel {
  dimensions: { name: string; score: number }[];
  overall: number;
  historicalIntegrity: number;
  violations: number;
  blocked: boolean;
}

export function qualityModel(s: OpsState): QualityModel {
  const violations = s.historicalViolations;
  const evidenceLift = Math.min(10, s.addedEvidence.length * 5);
  const ambiguityResolved = Object.values(s.ambiguityStates).filter((a) => a.status !== "Open").length;
  const contradictionResolved = Object.keys(s.contradictionResolutions).length;

  const dims = qualityDimensions.map((d) => {
    if (d.name.includes("Evidence Quality")) return { ...d, score: Math.min(100, d.score + evidenceLift) };
    if (d.name.includes("Ambiguity")) return { ...d, score: Math.min(100, d.score + ambiguityResolved * 4) };
    if (d.name.includes("Contradiction")) return { ...d, score: Math.min(100, d.score + contradictionResolved * 8) };
    if (d.name.includes("Historical")) return { ...d, score: violations > 0 ? 0 : 100 };
    return d;
  });
  const withIntegrity = dims.some((d) => d.name.includes("Historical"))
    ? dims
    : [...dims, { name: "Historical Context Integrity", score: violations > 0 ? 0 : 100 }];

  const overall = Math.round(withIntegrity.reduce((a, b) => a + b.score, 0) / withIntegrity.length);
  return {
    dimensions: withIntegrity,
    overall: violations > 0 ? Math.min(overall, 55) : overall,
    historicalIntegrity: violations > 0 ? 0 : 100,
    violations,
    blocked: violations > 0,
  };
}

/* -------------------------------------------- 25. persona impact handoff -- */

export function buildHandoffPackage(
  s: OpsState, computation: ReadinessComputation, version: string,
): CognitiveReadinessHandoffPackage {
  const includedPersonas = Object.entries(s.personaScope)
    .filter(([, v]) => v.included).map(([k]) => k);
  const providedEvidence = evidenceItems.filter((e) => e.provided).map((e) => e.evidence)
    .concat(s.addedEvidence.map((e) => e.name));
  const gaps = evidenceItems
    .filter((e) => e.required && !e.provided)
    .filter((e) => !s.addedEvidence.some((a) => a.name.toLowerCase().includes(e.evidence.toLowerCase().slice(0, 10))))
    .map((e) => e.evidence);

  return {
    workItem: workContext.workItem ?? "Checkout Retry Policy Update",
    intakePackageVersion: workContext.intakePackageVersion,
    assessmentVersion: version,
    readinessState: computation.state,
    readinessScore: computation.score,
    readinessConfidence: computation.confidence,
    intent: workContext.intent,
    currentState: workContext.currentState,
    proposedState: workContext.proposedState,
    scope: `${workContext.initialScope} initial · ${workContext.potentialExpansion} potential`,
    systems: workContext.systems,
    services: workContext.systems,
    dependencies: dependencyStates.map((d) => `${d.dependency} · ${s.dependencies[d.dependency]?.status ?? d.status}`),
    candidatePersonas: includedPersonas,
    personaReadiness: computation.personas
      .filter((p) => includedPersonas.includes(p.persona))
      .map((p) => ({ persona: p.persona, readiness: p.readiness })),
    applicableConditions: conditionStates
      .filter((c) => s.conditions[c.condition] !== "Not Applicable")
      .map((c) => `${c.condition} · ${s.conditions[c.condition] ?? c.status}`),
    policyBindings: Object.entries(s.policyBindings).map(([variable, value]) => ({ variable, value })),
    evidence: providedEvidence,
    evidenceGaps: gaps,
    assumptions: assumptions.map((a) => `${a.id} · ${a.assumption}`),
    acceptedAssumptions: s.acceptedAssumptions.map((id) =>
      `${id} · ${assumptions.find((a) => a.id === id)?.assumption ?? ""} (carried forward as uncertainty, not as truth)`),
    constraints: constraints.map((c) => `${c.constraint} · ${s.constraintStates[c.id] ?? c.status}`),
    ambiguities: ambiguities.map((a) => `${a.id} · “${a.text}” · ${s.ambiguityStates[a.id]?.status ?? a.status}`),
    acceptedInterpretations: Object.entries(s.ambiguityStates)
      .filter(([, v]) => v.status === "Accepted for Evaluation" && v.interpretation)
      .map(([id, v]) => `${id} · ${v.interpretation}`),
    contradictions: contradictions.map((c) => `${c.id} · ${c.conflictType} · ${c.severity}`),
    resolvedContradictions: Object.entries(s.contradictionResolutions)
      .map(([id, r]) => `${id} · ${r.choice}${r.value ? ` = ${r.value}` : ""} · ${r.reason}`),
    exceptions: s.exceptions.map((e) => `${e.id} · ${e.blockingItem} · ${e.status} · expires ${e.expiration}`),
    rollout: workContext.rollout,
    rollback: workContext.rollback,
    expectedOutcomes: workContext.expectedOutcome,
    observationRequirements,
    uncertaintyMarkers: uncertaintyMarkersFor(s),
    criticalDownstreamWarnings: downstreamWarnings(s, computation).map((w) => `${w.persona} · ${w.marker} · ${w.reason}`),
    historicalContextVersion: workContext.historicalContextVersion,
  };
}

/* --------------------------------------------------- 24. version comparison -- */

export type DiffKind = "Added" | "Removed" | "Changed" | "Resolved" | "New Gap" | "Unchanged";

export interface DiffRow { area: string; from: string; to: string; kind: DiffKind }

const listDiff = (area: string, a: string[], b: string[]): DiffRow[] => {
  const added = b.filter((x) => !a.includes(x));
  const removed = a.filter((x) => !b.includes(x));
  if (!added.length && !removed.length) return [{ area, from: `${a.length} items`, to: `${b.length} items`, kind: "Unchanged" }];
  const rows: DiffRow[] = [];
  added.forEach((x) => rows.push({ area, from: "—", to: x, kind: "Added" }));
  removed.forEach((x) => rows.push({ area, from: x, to: "—", kind: "Removed" }));
  return rows;
};

export function compareVersions(
  a: CognitiveReadinessAssessmentVersion, b: CognitiveReadinessAssessmentVersion,
): DiffRow[] {
  const rows: DiffRow[] = [
    { area: "Intake Package Version", from: a.intakePackageVersion, to: b.intakePackageVersion, kind: a.intakePackageVersion === b.intakePackageVersion ? "Unchanged" : "Changed" },
    ...listDiff("Personas", a.personaScope, b.personaScope),
    ...listDiff("Conditions", a.conditionSet, b.conditionSet),
    { area: "Evidence Coverage", from: `${a.evidenceCoverage}%`, to: `${b.evidenceCoverage}%`, kind: a.evidenceCoverage === b.evidenceCoverage ? "Unchanged" : b.evidenceCoverage > a.evidenceCoverage ? "Resolved" : "New Gap" },
    { area: "Dependency Coverage", from: `${a.dependencyCoverage}%`, to: `${b.dependencyCoverage}%`, kind: a.dependencyCoverage === b.dependencyCoverage ? "Unchanged" : b.dependencyCoverage > a.dependencyCoverage ? "Resolved" : "New Gap" },
  ];
  Object.keys(a.dimensionScores).forEach((k) => {
    const from = a.dimensionScores[k], to = b.dimensionScores[k];
    rows.push({ area: `Dimension · ${k}`, from: String(from), to: String(to), kind: from === to ? "Unchanged" : to > from ? "Resolved" : "New Gap" });
  });
  Object.keys(a.gateStates).forEach((k) => {
    rows.push({ area: `Gate · ${k}`, from: a.gateStates[k], to: b.gateStates[k], kind: a.gateStates[k] === b.gateStates[k] ? "Unchanged" : "Changed" });
  });
  rows.push({ area: "Readiness Score", from: String(a.score), to: String(b.score), kind: a.score === b.score ? "Unchanged" : b.score > a.score ? "Resolved" : "New Gap" });
  rows.push({ area: "Recommendation", from: a.state, to: b.state, kind: a.state === b.state ? "Unchanged" : "Changed" });
  rows.push({ area: "Open Findings", from: String(a.openFindings), to: String(b.openFindings), kind: a.openFindings === b.openFindings ? "Unchanged" : b.openFindings < a.openFindings ? "Resolved" : "New Gap" });
  return rows;
}

/* -------------------------------------------------------- 22. reassessment -- */

export const reassessmentScopes = [
  "Full Assessment", "Evidence Only", "Dependencies Only", "Persona Scope Only", "Conditions Only",
  "Assumptions Only", "Execution Context Only", "Expected Outcomes Only",
];

export function createVersion(
  s: OpsState, computation: ReadinessComputation, reason: string, createdBy: string,
): CognitiveReadinessAssessmentVersion {
  const prior = s.versions.filter((v) => v.assessment === "CRA 7001");
  const version = prior.length + 1;
  return {
    id: `CRA 7001 v${version}`, assessment: "CRA 7001", version,
    label: reason, timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
    intakePackageVersion: workContext.intakePackageVersion,
    personaScope: Object.entries(s.personaScope).filter(([, v]) => v.included).map(([k]) => k),
    conditionSet: conditionStates.filter((c) => s.conditions[c.condition] !== "Not Applicable").map((c) => c.condition),
    evidenceCoverage: Math.min(100, 84 + s.addedEvidence.length * 5),
    dependencyCoverage: s.dependencies["Regional Token Vault"]?.status === "Validated" ? 94 : 87,
    dimensionScores: computation.dimensionScores,
    gateStates: Object.fromEntries(computation.gates.map((g) => [g.id, g.status])),
    score: computation.score, state: computation.state,
    openFindings: computation.materialGaps.length + computation.blockingGaps.length,
    createdBy, reason,
  };
}

/* ---------------------------------------------------------- 30. global search -- */

export interface SearchResult {
  type: string;
  assessment: string;
  workItem: string;
  issue: string;
  severity: string;
  owner: string;
  status: string;
  target: string;
}

export function globalSearch(s: OpsState, query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/);
  const match = (...fields: (string | undefined)[]) => {
    const hay = fields.filter(Boolean).join(" ").toLowerCase();
    return tokens.some((t) => hay.includes(t));
  };
  const out: SearchResult[] = [];

  s.remediations.forEach((r) => {
    if (match(r.id, r.description, r.gapType, r.category, r.workItem, r.owner, r.status, r.affectedDimension))
      out.push({ type: "Remediation", assessment: r.assessment, workItem: r.workItem, issue: r.description, severity: r.severity, owner: r.owner, status: r.status, target: "panel-remediation" });
  });
  evidenceItems.forEach((e) => {
    if (match(e.evidence, e.status, e.group, e.source))
      out.push({ type: "Evidence", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update", issue: `${e.evidence} · ${e.status}`, severity: e.required && !e.provided ? "High" : "Low", owner: e.source, status: e.status, target: "panel-evidence" });
  });
  personaStates.forEach((p) => {
    if (match(p.persona, p.readiness, p.primaryGap))
      out.push({ type: "Persona", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update", issue: `${p.persona} · ${p.readiness}`, severity: p.readiness === "Ready" ? "Low" : "Medium", owner: p.persona, status: p.readiness, target: "panel-persona-scope" });
  });
  conditionStates.forEach((c) => {
    if (match(c.condition, c.status, c.type, c.policyBinding))
      out.push({ type: "Business Condition", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update", issue: `${c.condition} · ${s.conditions[c.condition] ?? c.status}`, severity: c.confidence < 75 ? "High" : "Low", owner: c.source, status: s.conditions[c.condition] ?? c.status, target: "panel-condition-validation" });
  });
  dependencyStates.forEach((d) => {
    const st = s.dependencies[d.dependency] ?? { status: d.status, confidence: d.confidence };
    if (match(d.dependency, st.status, d.owner, d.relationship))
      out.push({ type: "Dependency", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update", issue: `${d.dependency} · ${st.status} · ${st.confidence}%`, severity: st.status === "Validated" ? "Low" : "High", owner: d.owner, status: st.status, target: "panel-dependency-review" });
  });
  assumptions.forEach((a) => {
    if (match(a.assumption, a.category, s.assumptionStates[a.id], a.evidence))
      out.push({ type: "Assumption", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update", issue: `${a.assumption}`, severity: a.materiality as string, owner: a.source, status: s.assumptionStates[a.id] ?? a.validationState, target: "panel-assumption-register" });
  });
  constraints.forEach((c) => {
    if (match(c.constraint, c.type, s.constraintStates[c.id]))
      out.push({ type: "Constraint", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update", issue: c.constraint, severity: "Low", owner: c.source, status: s.constraintStates[c.id] ?? c.status, target: "panel-constraint-management" });
  });
  ambiguities.forEach((a) => {
    if (match(a.text, a.whyAmbiguous, s.ambiguityStates[a.id]?.status))
      out.push({ type: "Ambiguity", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update", issue: `“${a.text}”`, severity: a.materiality, owner: a.source, status: s.ambiguityStates[a.id]?.status ?? a.status, target: "panel-ambiguity-resolution" });
  });
  contradictions.forEach((c) => {
    if (match(c.statementA, c.statementB, c.conflictType, c.status))
      out.push({ type: "Contradiction", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update", issue: c.conflictType, severity: c.severity, owner: "Release Governance", status: s.contradictionResolutions[c.id] ? "Resolved" : c.status, target: "panel-contradiction-workbench" });
  });
  s.exceptions.forEach((e) => {
    if (match(e.id, e.blockingItem, e.reason, e.status, "exception", "expiring"))
      out.push({ type: "Exception", assessment: e.assessment, workItem: "Checkout Retry Policy Update", issue: e.blockingItem, severity: "High", owner: e.owner, status: e.status, target: "panel-exceptions" });
  });
  s.overrides.forEach((o) => {
    if (match(o.id, o.businessReason, o.status, "override"))
      out.push({ type: "Override", assessment: o.assessment, workItem: "Checkout Retry Policy Update", issue: o.businessReason, severity: "Critical", owner: o.decisionOwner, status: o.status, target: "panel-overrides" });
  });
  s.versions.forEach((v) => {
    if (match(v.id, v.label, v.state, v.reason))
      out.push({ type: "Assessment Version", assessment: v.assessment, workItem: "Checkout Retry Policy Update", issue: `${v.id} · ${v.label}`, severity: "Low", owner: v.createdBy, status: v.state, target: "panel-version-history" });
  });
  return out;
}

/* ------------------------------------------------------------- 33. export -- */

const csvEscape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  return [keys.join(","), ...rows.map((r) => keys.map((k) => csvEscape(r[k])).join(","))].join("\n");
}

export function toYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return `${pad}[]`;
    return value.map((v) =>
      typeof v === "object" && v !== null
        ? `${pad}-\n${toYaml(v, indent + 1)}`
        : `${pad}- ${String(v)}`).join("\n");
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Record<string, unknown>).map(([k, v]) =>
      typeof v === "object" && v !== null
        ? `${pad}${k}:\n${toYaml(v, indent + 1)}`
        : `${pad}${k}: ${String(v)}`).join("\n");
  }
  return `${pad}${String(value)}`;
}

export function downloadFile(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/* ---------------------------------------------------------- persona helpers -- */

export function personaRowsFor(
  s: OpsState, personas: CognitiveReadinessPersonaState[],
): (CognitiveReadinessPersonaState & { included: boolean; primary: boolean; version: string; matchReason: string })[] {
  const known = personas.map((p) => ({
    ...p,
    included: s.personaScope[p.persona]?.included ?? true,
    primary: s.personaScope[p.persona]?.primary ?? false,
    version: "v4",
    matchReason: `${p.candidateMatch} match from Intake scope and dependency graph`,
  }));
  const extra = Object.keys(s.personaScope)
    .filter((k) => !personas.some((p) => p.persona === k))
    .map((k) => ({
      persona: k, candidateMatch: "Added", contextCoverage: 62, applicableConditions: 2,
      dependencyCoverage: 60, evidenceCoverage: 55, readiness: "Context Required", confidence: 60,
      primaryGap: "Persona context not yet gathered",
      included: s.personaScope[k].included, primary: s.personaScope[k].primary,
      version: "v1", matchReason: "Manually added during readiness scope validation",
    }));
  return [...known, ...extra];
}
