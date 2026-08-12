# Stage 3.5.3.3 — Graph Intelligence and Recommendation Layer

Status: complete. Source of truth for how reasoning findings become prioritized,
explainable, advisory recommendations.

## Purpose and boundaries

The intelligence layer converts Stage 3.5.3.2 reasoning output into operational,
architectural, governance and registration recommendations. It is a **consumer**
of reasoning, not a re-implementation of it.

It does **not** contain: LLMs, embeddings, probabilistic inference, graph
mutation, automated remediation, external data ingestion, network calls,
randomness, wall-clock dependence, or any user interface.

Entry point: `src/modules/graph/intelligence/`, re-exported from
`src/modules/graph/index.ts`.

```ts
import { getIntelligenceEngine } from "@/modules/graph";

const result = getIntelligenceEngine().analyzeGraph();
const critical = result.recommendations.filter((r) => r.priority === "critical");
```

## Architecture

| File | Responsibility |
| --- | --- |
| `IntelligenceTypes.ts` | Findings, recommendations, priority bands, remediation, summaries, envelope |
| `Prioritization.ts` | The published priority formula and factor table |
| `Policies.ts` | The typed policy set and its evaluation contracts |
| `Consolidation.ts` | Deduplication, cross-policy suppression, recommendation construction |
| `Remediation.ts` | Deterministic remediation-plan builder |
| `Summaries.ts` | Statistics and the seven structured summary views |
| `IntelligenceEngine.ts` | The `GraphIntelligenceEngine` facade and scoping |
| `intelligence.test.ts` | 41 tests across fixtures and the real graph |

Execution order per run: reasoning analyses → policy evaluation → consolidation
→ cross-policy suppression → scoring → ordering → filtering → summaries.

## Public API

`GraphIntelligenceEngine`

- `analyzeGraph(options)` — whole graph
- `analyzeNode(id)`, `analyzeRoute(route)`, `analyzeModule(moduleId)`,
  `analyzeCapability(id)`, `analyzePlatform(id)`, `analyzeOwner(owner)`
- `analyze(scopeKind, subject, options)` — the shared execution path
- `filterRecommendations(result, filter)` — post-filter without re-running

Options: `includeCandidateRelationships`, `filter` (category, priority,
severity, confidence, status, policy id, minimum score), `lineageSampleLimit`
(default 150), `nodeTypes`.

Helpers: `INTELLIGENCE_POLICIES`, `policyById`, `scorePriority`,
`PRIORITY_FACTORS`, `consolidateCandidates`, `buildRemediationPlan`,
`buildStatistics`, `buildSummaries`, `bandForScore`.

## Recommendation taxonomy

Categories: `ownership`, `registration`, `traceability`, `resilience`,
`architecture`, `governance`, `operations`.
Severities: `info`, `advisory`, `warning`, `critical`.
Statuses: `open`, `expected-by-design`, `informational`, `consolidated`.
Priority bands: `critical`, `high`, `medium`, `low`, `informational`.
Remediation complexity: `trivial`, `low`, `moderate`, `high`.

## Policy definitions

| Policy | Category | Trigger | Deduplication |
| --- | --- | --- | --- |
| `POL-ARCH-001` | architecture | Critical node, score ≥ 60, dependants in ≥ 2 modules | Per node |
| `POL-ARCH-002` | architecture | Bottleneck brokerage score ≥ 3 | Per node |
| `POL-ARCH-003` | architecture | Circular dependency of size ≥ 2 | Per strongly connected component |
| `POL-GOV-001` | governance | Graph carries ≥ 1 candidate edge | Single register entry |
| `POL-OWN-001` | ownership | Ownership resolution `unresolved` | Per node type |
| `POL-OWN-002` | governance | Ownership resolution `conflicting` | Per node (never merged) |
| `POL-OWN-003` | governance | Ownership resolution `propagated` | Per resolved owning module |
| `POL-REG-001` | registration | Unexpected route/capability/implementation gap | Per gap kind + owning module |
| `POL-REG-002` | architecture | Unexpected structural gap (unconsumed service, persona-less module, isolated node) | Per gap kind + owning module |
| `POL-REG-003` | governance | Coverage gap flagged expected by design | Per gap kind |
| `POL-RES-001` | resilience | Single point of failure with stranded dependants | Per node |
| `POL-RES-002` | resilience | Critical node score ≥ 40 that is a sole provider or has upstream reach ≥ 5 | Per node; suppressed when a SPOF covers the node |
| `POL-TRACE-001` | traceability | Route traceability chain incomplete | Per missing-layer signature |
| `POL-TRACE-002` | architecture | Capability lineage missing expected layers | Per missing-layer signature |

Every policy declares `trigger`, `exclusions`, `confidenceHandling`,
`evidenceRequirement`, `deduplication`, `escalation` and its source analyses as
typed data, so the policy set is auditable without reading the implementation.

## Priority formula

```
subtotal         = Σ (normalized_i × weight_i)                  // max 100
confidenceScaled = subtotal × confidenceFactor(confidence)
raw              = confidenceScaled − candidatePenalty + remediationLeverage
score            = round(clamp(raw, 0, 100))
score            = min(score, 10) when the issue is expected by design
```

| Factor | Weight | Saturation |
| --- | --- | --- |
| `blast-radius` | 22 | 50 nodes |
| `criticality` | 18 | score 100 |
| `ownership-risk` | 12 | 1 |
| `traceability-risk` | 12 | 1 |
| `coverage-gap` | 10 | 1 |
| `breadth` (routes + modules) | 10 | 25 |
| `dependency-depth` | 8 | 10 |
| `operational-impact` (severity) | 8 | 1 |

Confidence factors: high 1.0, medium 0.85, low 0.7, unable-to-verify 0.5.
Candidate-edge penalty: 10 points. Remediation leverage: trivial +5, low +3,
moderate +1, high 0.

Bands: ≥ 80 critical, ≥ 60 high, ≥ 40 medium, ≥ 20 low, otherwise informational.
Expected-by-design items are always informational.

Ordering is score desc → band → policy id → recommendation id. Insertion order,
array order and runtime timing never affect the result.

## Confidence rules

Recommendation confidence is the weakest confidence across its evidence chain,
inherited from Stage 3.5.3.2 (which already downgrades one step for candidate
participation). It is never upgraded. Every recommendation carries a
`confidenceRationale` naming the evidence count, candidate participation and the
resulting score multiplier.

## Deduplication behaviour

Candidates sharing `policyId + mergeKey` are merged into one recommendation.
Merging unions affected nodes, evidence, source finding ids, analyses and
lineage; takes the worst severity, worst complexity and weakest confidence; and
takes the maximum of each priority signal. `consolidation.rationale` records why
they were merged; `separationRationale` (surfaced when a candidate stands alone)
records why unlike candidates are kept apart.

Cross-policy suppression: a `POL-RES-002` recommendation is superseded when a
`POL-RES-001` recommendation exists for the same node, because the redundancy
action subsumes chain documentation. The suppression is recorded in
`diagnostics.exclusions` with its reason, never dropped silently.

## Remediation-plan structure

```ts
{
  action, requiredUpdates, affected, prerequisites, validationCriteria,
  sequence: [{ order, action, targets }],   // prerequisites → updates → re-run → verify
  expectedGraphImprovement,
  expectedMetricImpact: { coverage, ownership, traceability, resilience },
  complexity, advisoryOnly: true
}
```

Plans never mutate the graph and never generate code.

## Explainability model

Each recommendation exposes: `policyId`, `sourceFindingIds`,
`reasoningAnalyses`, full `evidence`, `confidenceRationale`,
`priorityExplanation` (per-factor contributions plus the assembled formula),
`consolidation`, `exclusions` and `lineage` (graph version, content hash, node
ids, edge ids, architectural layers). Recommendation ids are
`rec:<policyId>:<slugified merge key>` and are stable across runs.

## Determinism guarantees

- Read-only: no graph, index or reasoning result is mutated (test-verified by
  serialising the graph before and after execution).
- The envelope reports `graphContentHashBefore`, `graphContentHashAfter` and
  `graphHashPreserved`.
- No timestamps, randomness, network access or insertion-order dependence in any
  snapshot-sensitive output.
- Repeated execution returns byte-identical recommendations, statistics and
  summaries.

## Real-graph results

Graph `e889b604`, 1,291 nodes, 889 edges. Hash before and after execution:
`e889b604` (preserved).

- Findings consumed: 55 · Recommendations produced: **42**
- By priority: critical 0, high 0, medium 2, low 11, informational 29
- By category: resilience 12, architecture 11, ownership 9, registration 4,
  traceability 3, governance 3, operations 0
- By status: open 41, expected-by-design 1
- Ownership resolution rate 46.2 % · Route traceability rate 9.7 %
- Single points of failure 12 · Dependency cycles 0 · Coverage gaps 880
  (2 expected by design)
- Policies producing nothing on today's graph: `POL-ARCH-001`, `POL-ARCH-002`,
  `POL-ARCH-003`, `POL-OWN-002`, `POL-TRACE-002`

Most significant findings:

1. `rec:POL-REG-001:coverage-route-without-capability-unowned` (medium, 50) —
   unowned routes have no registered capability, the single largest driver of
   the low traceability rate.
2. `rec:POL-TRACE-001:route-traceability-capability-module-page-service`
   (medium, 50) — the dominant route population never reaches page, service,
   capability or module.
3. Registration and isolated-node gaps concentrated in the unowned, commercial,
   platform and runops areas.
4. Twelve single points of failure, predominantly SRE capabilities.
5. Zero dependency cycles and zero ownership conflicts: the graph is acyclic and
   unambiguous where ownership is declared at all.

## Known limitations

- Capability lineage is sampled (`lineageSampleLimit`, default 150 capabilities,
  deterministically the first by id); `diagnostics.lineageSampleTruncated`
  reports when the sample was cut.
- Priority weights are a published judgement, not an empirically fitted model.
- Scoped analysis runs the full reasoning pass and filters afterwards; it is
  correct but not faster than whole-graph analysis.
- The `operations` category is declared but no policy currently emits it; it is
  reserved for a future runtime-telemetry source.
- Absolute scores are low because the current graph's issues are broad and
  shallow rather than deep; bands are comparative, not absolute risk levels.

## Recommended next stage

Stage 3.5.3.4 — Capability Intelligence Presentation and Governance Workflow:
surface these recommendations in the module-registry diagnostics UI, add
acceptance/rejection tracking against the exception register, and close the loop
by re-scoring after each registration change.

## Related documents

- `stage3-5-3-1-query-engine.md` — the read-only query surface
- `stage3-5-3-2-reasoning-engine.md` — the analyses consumed by this layer
- `stage3-5-2-candidate-edges.md` — the weakly-inferred relationship register
