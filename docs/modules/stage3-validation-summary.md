# Stage 3 — Validation Summary

## What Stage 3 delivered

| Deliverable | Location |
| --- | --- |
| Classification type model (13 kinds) | `src/modules/classificationTypes.ts` |
| Deterministic classifier over 1,247 items | `src/modules/classification.ts` |
| Domain signal scanner and generated signals | `scripts/scan-domain-signals.mjs`, `src/modules/generated/domainSignals.ts` |
| Candidate module discovery (12 candidates) | `src/modules/candidates.ts` |
| Shared capability registry (7) | `src/modules/shared/sharedCapabilities.ts` |
| Platform capability registry (11) | `src/modules/platform/platformCapabilities.ts` |
| SRE capability hierarchy (22 nodes, 4 levels) | `src/modules/sre/capabilityHierarchy.ts` |
| Governance engine (10 rules) | `src/modules/governance.ts` |
| Diagnostics UI (6 new tabs) | `src/platform/pages/ModuleRegistryStage3.tsx` |
| Stage 3 test suite | `src/modules/stage3.test.ts` |
| Reports (12) | `docs/modules/stage3-*.md` |

## Verification

- Typecheck: clean.
- Module test suite: 72 tests passing across 5 files (53 Stage 1–2, 19 Stage 3).
- Governance: 0 errors, 748 warnings, 2 info. `blocksRelease` is false.

Stage 3 tests assert properties, not snapshots:

- every inventory item is classified exactly once, with evidence;
- classification counts sum to the item total;
- every low-confidence disposition is flagged for human review;
- no candidate is "ready" without route, file and navigation evidence;
- every shared and platform capability ID is unique and every shared capability has a consumer;
- every `shared.*` dependency declared by the SRE manifest resolves;
- the capability hierarchy has one domain root, resolvable parents and full Stage 1 lineage;
- no SRE node claims to be an operational implementation;
- every governance finding carries a subject, message and remediation;
- release gating depends on errors only.

## What Stage 3 deliberately did not do

- **No module was registered.** Stage 3 proposes; Stage 4 registers. Registering a module with an
  unresolved boundary would encode the wrong answer permanently.
- **No boundary conflict was resolved.** All ten are product or architecture decisions.
- **No file was moved.** Five candidates need code to move; moving it here would have mixed
  discovery with refactoring.
- **Nothing was marked deprecated.** No code signal justifies it.
- **No capability was invented to fill a category.** Reporting, workflow execution and
  operational communications are absent from the registries because they are absent from the
  codebase.

## Known limitations of the Stage 3 output

1. 367 items remain `unable-to-determine` and need human classification.
2. Two route families are generated at runtime and cannot be statically owned.
3. Only SRE has a capability hierarchy.
4. Candidate boundaries are pattern-based; a file moved without updating
   `scripts/scan-domain-signals.mjs` and `src/modules/candidates.ts` will silently reclassify.
5. Agent and workflow signals are string matches over catalogue content — no runtime exists to
   validate them against.

## Status

Stage 3 is **complete and internally consistent**. The catalog is not yet complete as a
description of the product, and the reports say so explicitly rather than implying coverage that
does not exist.
