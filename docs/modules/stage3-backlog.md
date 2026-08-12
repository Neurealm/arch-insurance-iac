# Stage 3 — Recommended Backlog

Ordered by dependency, not by size. Each item states what unblocks it.

## S3.1 — Assign owners to the four unowned shared assets (blocker)

`src/components/eoc/*`, `ScenarioStateContext`, `GuidedInvestigationContext`,
`EvidenceGraphContext`. Until each has a `primaryOwner`, every module that
consumes them registers an `ownership-conflict`. Requires a human decision, not
code.

## S3.2 — Resolve the four ambiguous boundaries

- `/data-orchestration-twin/*` — SRE sub-module or peer module?
- `/executive-service-owner-twin`, `/delivery-org-twin`, `/engagement-manager-twin` — owner?
- `src/hooks/*` — split by owning module or declare platform-owned?
- 25 edge functions — platform, commercial or cae?

## S3.3 — Register the high-confidence modules

In this order, largest and best-bounded first:

| Module | Unregistered items | Notes |
|---|---|---|
| `commercial` | 99 | Clean `/commercial/*` prefix, own layout, `commercial_*` tables, real permissions. Will be the first module with `implemented` capabilities. |
| `runops` | 169 | Own shell and providers; large surface. |
| `platform` | 17 | Should be registered early so the platform-prefix policy becomes a declaration instead of a hard-coded list in `routeOwnership.ts`. |
| `cae` | 34 | Depends on `platform` being registered first. |
| `avep` | 79 | Requires declaring the computed route family to clear one `unable-to-verify`. |
| `practice-library` | 65 | |
| `coworkers` | 85 | Overlaps conceptually with SRE; boundary must be stated explicitly. |

## S3.4 — Replace hard-coded platform policy with declarations

`PLATFORM_ROUTE_PREFIXES` in `src/modules/routeOwnership.ts` is a Stage 2
expedient. Once `platform` has a manifest, delete the constant and let the
manifest drive the classification.

## S3.5 — Apply the SRE capability decomposition

Per `sre-capability-decomposition.md`: 8 capabilities → 12, plus two product
decisions (canonical friction-index route, surviving modernization roadmap).

## S3.6 — Triage the orphan report

230 unused files and ~20 genuinely unreferenced flat routes. Handle
`src/components/auth/TenantAccessGuard.tsx` and `AuthVerificationOverlay.tsx`
as a security review item first — unused guards may be an unapplied control.

## S3.7 — Drift protection in CI

Add a check that regenerates the three artefacts and fails if the working tree
changes, so a new route cannot be added without the registry noticing.

## S3.8 — Coverage target

Exit criterion for Stage 3: every route classified as `module-owned`,
`platform-owned` or `shared`; `unregistered` at 0; `unable-to-verify` at 0 or
documented with an owner-approved reason. Only then is Stage 4 (Module
Capability Intelligence) able to report on the whole product rather than on one
module.
