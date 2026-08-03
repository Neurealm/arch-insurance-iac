# Module Ownership Conflicts and Architectural Issues

Findings recorded during Stage 1. None is fixed in Stage 1; each is either
resolved by an owner decision or by a later stage.

## Ownership conflicts

| ID | Conflict | Evidence | Disposition |
|---|---|---|---|
| OC-01 | `src/components/eoc/*` has no owner but is consumed by at least four page areas | 33 imports from `src/pages/prod-twin/` alone | Assign to Platform in Stage 3 |
| OC-02 | Scenario / investigation / evidence contexts shared between SRE Practice and RunOps with no owner | `src/context/*Context.tsx` import sites | Assign to RunOps in Stage 3 |
| OC-03 | `/data-orchestration-twin` sits in the SRE navigation region but is an independent route tree | `src/components/eoc/Sidebar.tsx` key `sre-data-orch`; nested routes in `src/App.tsx` | Unable to verify — owner decision required |
| OC-04 | "SRE" appears in three unrelated places: SRE Practice, `/coworkers/site-reliability-engineering`, `/practice-library/observability-resilience-sre` | routes in `src/App.tsx` lines 560, 566, 805 | Explicitly excluded from the SRE manifest |

## Architectural issues

| ID | Issue | Evidence |
|---|---|---|
| AI-01 | Module name/folder mismatch: "Site Resilience Engineering" implemented in `src/pages/prod-twin/` | directory listing |
| AI-02 | No route namespace: 25 of 35 SRE routes are flat root paths | `src/App.tsx` 639–706 |
| AI-03 | Duplicate capability surface: `/operational-friction-index` and `/product-reliability-transformation-index` render the same `OperationalFrictionIndex` component | `src/App.tsx` 639, 652 |
| AI-04 | Duplicate nav labels: `sre-mrm` and `sre-mrm2` are both "Modernization Roadmap" | `src/components/eoc/Sidebar.tsx` |
| AI-05 | Orphaned-from-navigation pages: `/executive-service-owner-twin`, `/delivery-org-twin`, `/engagement-manager-twin` are routed but absent from every nav group | `src/App.tsx` 707–709 |
| AI-06 | No RBAC coverage for the SRE surface — no `sre.*` permission, no `PermissionRoute` wrapper | permission catalogue, route registrations |
| AI-07 | Entire SRE surface is mock/static; no Supabase access anywhere under `src/pages/prod-twin/` | import scan |
| AI-08 | `src/App.tsx` is a single ~900-line route registry with no module segmentation | file length |
| AI-09 | Cross-module data fixtures live in a flat `src/data/` directory with no ownership metadata | directory listing |
| AI-10 | Functionality that cannot currently be assigned to a module: the three `*-twin` routes in AI-05, plus `/data-orchestration-twin` | see OC-03 |

## Reporting

Stage 2 emits these findings automatically where they are machine-detectable
(AI-03, AI-05, AI-10, OC-01, OC-02) through `validateRegistry()` once the
application route table is supplied as a known-reference set.
