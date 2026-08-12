# Stage 3 — SRE Capability Hierarchy

Source of truth: `src/modules/sre/capabilityHierarchy.ts`. The Stage 1 manifest is unchanged;
every derived node records `supersedesCapabilityId` so lineage is traceable and no Stage 1
capability ID is lost (asserted by `src/modules/stage3.test.ts`).

## Why decompose

The eight flat Stage 1 capabilities bundle materially different screens. "Production Resilience
Digital Twin" covered a command centre, a topology view, a product line map, a golden workflow
map and a signal intelligence page. Asked "does the platform support golden workflow mapping?",
a flat model can only answer at the granularity of the bundle.

## Structure

Four levels: `domain` → `capability` → `sub-capability` → `feature`.

```text
sre  (domain)
├── sre.operating-model
├── sre.enablement
│   ├── sre.enablement.google-sre
│   ├── sre.enablement.team-topologies
│   ├── sre.enablement.platform-engineering
│   └── sre.enablement.finops
├── sre.assessment
├── sre.digital-twin
│   ├── sre.digital-twin.production
│   │   ├── sre.digital-twin.production.topology
│   │   ├── sre.digital-twin.production.product-lines
│   │   ├── sre.digital-twin.production.golden-workflows
│   │   └── sre.digital-twin.production.signals
│   ├── sre.digital-twin.cloud
│   └── sre.digital-twin.aws-resilience
├── sre.modernization
│   ├── sre.modernization.platform-factory
│   └── sre.modernization.app-factory
├── sre.automation
└── sre.value-narrative
    ├── sre.value-narrative.journey
    ├── sre.value-narrative.transition
    └── sre.value-narrative.value-board
```

## Stage 1 → Stage 3 mapping

| Stage 1 capability | Stage 3 nodes |
| --- | --- |
| sre.operating-model-cockpit | sre.operating-model |
| sre.reliability-foundations | sre.enablement + 4 sub-capabilities |
| sre.friction-index | sre.assessment |
| sre.production-digital-twin | sre.digital-twin.production + 4 features |
| sre.cloud-architecture-twins | sre.digital-twin.cloud, sre.digital-twin.aws-resilience |
| sre.platform-and-modernization-factories | sre.modernization + 2 sub-capabilities |
| sre.automation-marketplace | sre.automation |
| sre.transformation-narrative | sre.value-narrative + 3 sub-capabilities |

## Implementation classification

Each node carries two independent fields so a polished prototype is never mistaken for a running
service:

- `declaredMaturity` — what the manifest claims (`static`, `mock`, …).
- `implementationClassification` — `product-representation`, `interactive-prototype` or
  `operational-implementation`.

**No SRE node is an `operational-implementation`.** The module makes no database, edge-function
or agent calls anywhere; every screen renders in-repo fixture or editorial content. This is
enforced by a test, so a future change that claims otherwise must also produce the evidence.

## Cross-boundary notes carried into the hierarchy

- `sre.digital-twin.production` links out to a RunOps service twin — a real cross-module edge.
- `sre.automation` overlaps the Digital Coworkers candidate module.
- `sre.value-narrative.transition` is conceptually adjacent to the carve-out candidate.
- `sre.modernization.app-factory` carries two live competing roadmap implementations.
