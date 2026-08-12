/**
 * Stage 3.5.3.3 — deterministic remediation planning.
 *
 * Plans are advisory: they describe the registration, ownership or governance
 * change required, in a fixed execution order. Nothing here mutates the graph
 * or generates source changes.
 */

import type { PolicyCandidate } from "./Policies";
import type { RemediationPlan, RemediationStep } from "./IntelligenceTypes";

/** Builds the fixed remediation sequence for a consolidated candidate. */
export function buildRemediationPlan(candidate: PolicyCandidate): RemediationPlan {
  const sequence: RemediationStep[] = [];
  let order = 1;
  for (const prerequisite of candidate.prerequisites) {
    sequence.push({ order: order++, action: `Prerequisite: ${prerequisite}`, targets: [] });
  }
  for (const update of candidate.requiredUpdates) {
    sequence.push({ order: order++, action: update, targets: candidate.affected.nodeIds.slice(0, 25) });
  }
  sequence.push({
    order: order++,
    action: "Re-run graph population, validation and the reasoning analyses that produced this recommendation.",
    targets: [],
  });
  for (const criterion of candidate.validationCriteria) {
    sequence.push({ order: order++, action: `Verify: ${criterion}`, targets: [] });
  }

  return {
    action: candidate.action,
    requiredUpdates: candidate.requiredUpdates,
    affected: candidate.affected,
    sequence,
    prerequisites: candidate.prerequisites,
    validationCriteria: candidate.validationCriteria,
    expectedGraphImprovement: candidate.expectedGraphImprovement,
    expectedMetricImpact: candidate.metricImpact,
    complexity: candidate.complexity,
    advisoryOnly: true,
  };
}
