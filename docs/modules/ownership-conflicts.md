# Stage 2 — Ownership Conflicts

Updates the Stage 1 conflict register with route-table evidence.

## Route-level conflicts: 0

No route is claimed by two module manifests. With one module registered this is
a weak guarantee, but the detection rule (`invalid-route-ownership`) is
implemented, tested and will fire in Stage 3 when modules with adjacent route
families are registered.

## Unowned shared assets: 4 (unchanged from Stage 1, now quantified)

| Shared asset | SRE import sites | Other consumers | Status |
|---|---|---|---|
| `src/components/eoc/*` | 33 | Sidebar, coworkers, practice library | No declared owner |
| `src/context/ScenarioStateContext` + `src/components/scenario` | 1 (`/enterprise-cloud-twin`) | RunOps scenario screens | No declared owner |
| `src/context/GuidedInvestigationContext` + `src/components/investigation` | 1 | RunOps investigation screens | No declared owner |
| `src/context/EvidenceGraphContext` + `src/components/evidence` | 1 | RunOps evidence surfaces | No declared owner |

Each is declared in the SRE manifest as a `sharedDependency` with
`primaryOwner: "unassigned"`, which the validator reports as
`invalid-shared-capability-ownership` (severity `ownership-conflict`). This is
correct behaviour: the framework surfaces the gap instead of silently assigning
the asset to the only module that has been registered.

## Ambiguous boundaries requiring an owner decision

| Item | Question |
|---|---|
| `/data-orchestration-twin/*` (64 items) | Part of the SRE module, or a peer module? Labelled "SRE Data Orchestration" in navigation, implemented as an independent route tree with its own layout. |
| `/executive-service-owner-twin`, `/delivery-org-twin`, `/engagement-manager-twin` | Pages live in `src/pages/prod-twin/` but appear in no navigation group. Currently excluded from SRE. |
| `src/hooks/*` (27 hooks) | Single folder mixing platform, commercial and CRM data access. No module can claim the folder without over-claiming. |
| 25 edge functions | Platform-owned by default, or claimed by `commercial` / `cae`? |

## Non-conflicts confirmed

- No module claims a route that the router does not register (0 missing
  references).
- No module both includes and excludes the same item.
- No duplicate module IDs or capability IDs.
- The two `<computed>` route families are reported as `unable-to-verify`, not
  assigned to a module by guesswork.
