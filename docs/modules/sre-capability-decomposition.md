# Stage 2 — SRE Capability Decomposition Recommendation

The Stage 1 manifest declares 8 capabilities across 35 routes. Route ownership
and evidence tracing show that some of those capabilities bundle unrelated
business purposes. This document recommends a decomposition. **It is a
recommendation only — no manifest change was made in Stage 2.**

## Recommended splits

### 1. `sre.transformation-narrative` (8 routes) → split into three

Currently one capability covers presentation decks, an onboarding factory and a
value board with different personas.

| Proposed capability | Routes | Primary persona |
|---|---|---|
| `sre.transformation-story` | `/transformation-journey`, `/measuring-success`, `/interactive-demo-center` | Sales / pre-sales |
| `sre.acquisition-onboarding` | `/acquisition-onboarding-factory`, `/transition-dual-run` | Transition manager |
| `sre.value-and-risk-board` | `/value-creation-board`, `/cyber-resilience-overlay` | Executive sponsor |

### 2. `sre.platform-and-modernization-factories` (5 routes) → split into two

| Proposed capability | Routes |
|---|---|
| `sre.platform-engineering-factory` | `/platform-engineering-factory`, `/hybrid-cloud-workbench` |
| `sre.modernization-factory` | `/modernization-factory`, `/modernization-roadmap`, `/modernization-roadmap-v2` |

### 3. `sre.production-digital-twin` (5 routes) → separate the signal surface

`/signal-intelligence` is an observability surface with a different persona
(SRE on-call) from the topology/product-line twin (service owner). Recommend
`sre.signal-intelligence` as its own capability.

## Recommended consolidations

| Issue | Recommendation |
|---|---|
| `/operational-friction-index` and `/product-reliability-transformation-index` render the same component | Keep one route, redirect the other. Requires a product decision on which URL is canonical. |
| `/modernization-roadmap` and `/modernization-roadmap-v2` are two nav entries with the same label | Retire one. Requires a product decision. |

## Deliberately unchanged

- Boundary membership. No route enters or leaves the SRE module in this
  recommendation.
- Implementation status. Every proposed capability inherits the `mock`/`static`
  ceiling from `sre-evidence-strength-report.md`.
- `/data-orchestration-twin`, `/executive-service-owner-twin`,
  `/delivery-org-twin`, `/engagement-manager-twin` — still outside the boundary
  pending an owner decision.

## Adoption path

Apply during Stage 3, together with owner assignment, so the manifest is edited
once rather than twice. `src/modules/registry.test.ts` will fail on any
duplicate capability ID introduced by the split, which is the intended guard.
