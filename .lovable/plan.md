
# Architecture Readiness Review (ARR)
## Neugain.io (Pre-Sales PRD) → Meridian University Epic EHR PRD Azure CMDB Digital Twin

Read-only assessment. No code, schema, config, docs, or UI changes. Consolidates the prior six approved reviews (build status, backend, frontend, spec, integration plan, risk review, final readiness).

---

## SECTION 1 — EXECUTIVE SUMMARY

- **Overall readiness score:** **82 / 100**
- **Overall rating:** **CONDITIONAL GO**
- **Executive summary:** The Neugain.io codebase is a mature, tenant-scoped RunOps platform on React 18 / Vite 5 / TS 5.8 / Tailwind 3 / shadcn / Zustand 5 / TanStack Query 5 / react-router 7, backed by Supabase with row-level multi-tenancy on a `runops_*` domain model. Auth, tenant isolation, RLS, and the RunOps shell are production-shaped. Three.js/R3F/drei are already installed at the correct React-18-compatible pins. Meridian can land as an **additive, lazy-loaded, feature-flagged route** with **zero MVP migrations** — every capability the twin needs is already present as `runops_services / _components / _dependencies / _service_owners / _teams / _slos / _incidents / _changes / _runbooks`. The residual risk is concentrated in three areas — bundle hygiene (no lazy loading exists today), tenant cache scoping for the twin, and enum/table additions deferred to Phase 2 for Azure CI classes. All are mitigable with the roadmap and risk register already approved.
- **Biggest strengths**
  1. Backend domain model already covers CMDB, services, incidents, changes, runbooks, telemetry, and audit.
  2. Auth, roles (`app_role` + `runops_role`), and RLS helpers (`runops_has_tenant_access`, `runops_can_write`, `has_role`) are correct and battle-tested.
  3. R3F 8.18 / drei 9.122 / three 0.160 are already pinned for React 18 — no dependency bump required.
  4. RunOps shell (providers, right drawer, command palette, error boundary, tenant equalizer) is directly reusable.
- **Biggest risks**
  1. No lazy loading anywhere in `App.tsx` today — Meridian must introduce the first `React.lazy` boundary without breaking existing error boundaries.
  2. `three` is not in Vite `dedupe` — a nested dep could produce "Multiple instances of Three.js".
  3. `runops_bootstrap_current_user` self-grants every role on `tenant-contoso`; presentation mode must force `demoMode: true` to keep this safe.
  4. Supabase 1000-row default limit vs. potentially thousands of Azure CIs — pagination is mandatory.
- **Estimated implementation complexity:** **Medium-High.** Six-phase build; MVP is UI + adapters only, no schema. Live ingest adds enum + Edge Function scope in Phase 2.
- **Estimated project risk:** **Medium.** No unresolved High/High risks; every mitigation is additive; kill-switch is a single flag.

---

## SECTION 2 — CURRENT APPLICATION INVENTORY

| Subsystem | State |
|---|---|
| Authentication | Supabase Auth, `localStorage` session, `handle_new_user` trigger, `RESEND_API_KEY`, `auth-email-hook`. `AuthContext` + `ProtectedRoute` + `TenantAccessGuard`. Personal-email domains blocked. |
| Authorization | Two-layer: `app_role` (`platform_admin`, `platform_support`, …) + `runops_role` (`sre_engineer`, `noc_operator`, `incident_commander`, `service_owner`, `runbook_author`, `change_manager`, `digital_worker_administrator`, `platform_engineer`, `demo_controller`). All checks flow through SECURITY DEFINER helpers. |
| Tenant model | Row-level multi-tenancy via `tenant_id` on all `runops_*` tables; `runops_profiles` binds user↔tenant; `runops_tenants` + `runops_bootstrap_current_user`; `useTenantRouteEqualizer` keeps URLs tenant-safe. |
| Navigation | `src/runops/shell/routes.ts` central route registry; `RunOpsSidebar` + `RunOpsTopBar` + `CommandPalette` + `AskNovaPanel`. Sections: Command, Services, Runbooks, Operations, Incidents, Digital Workers, Reliability, Knowledge, Analytics, Governance, Integrations, Platform. |
| Application shell | `src/components/eoc/AppShell.tsx` + `src/runops/shell/RunOpsLayout.tsx` (nested router w/ providers + mobile drawer). |
| Layouts | `AppShell`, `RunOpsLayout`, `AuthLayout`, `OrganizationLayout`, `DataOrchLayout`, `SemiShell`. |
| Routes | ~140 routes in `src/App.tsx` (~839 lines); every one **eagerly imported**. Sub-router under `/runops/*`. |
| Providers | `AuthContext`, `PersonaContext`, `ScenarioStateContext`, `EvidenceGraphContext`, `GuidedInvestigationContext`, RunOps `DemoOperationsProvider`, `DemoAiProvider`, `RightDrawerProvider`, `ScenarioStoreProvider`, `AskNovaProvider`, `CommandPaletteProvider`. |
| State management | Zustand 5 (`useTwinStore`-style patterns already in `foc-twin/store`), TanStack Query 5 for server state, `useTenantScope` retired. |
| Database integration | `@supabase/supabase-js@2.107` client at `src/integrations/supabase/client.ts`; generated types in `src/integrations/supabase/types.ts`. |
| Shared UI | Full shadcn set, `RunOpsErrorBoundary`, `RunOpsRightDrawer`, `CommandPalette`, `AskNovaPanel`, `SimulationBadge`, `DemoControllerDrawer`, `EntityQuickView`. |
| CMDB | `runops_components`, `runops_dependencies`, `runops_services`, `runops_service_owners`, `runops_teams`, `runops_connectors`. |
| Business Services | `runops_services` (18 cols), service portfolio + topology + observability + readiness pages. |
| Runbooks | `runops_runbooks`, `_versions`, `_steps`, `_certifications`, `_tests`, `_triggers`; full designer + fitness + release + launch. |
| Incidents | `runops_incidents`, `_events`, `_hypotheses`, `_remediation_options`, `_communications`, `_postmortems`, `_corrective_actions`, `runops_problems`, `runops_known_errors`. |
| Changes | `runops_changes` + approve/deny RPCs. |
| Audit | `runops_audit_events`, `runops_domain_events`, `runops_evidence_items` (+ `evidence` storage bucket). |
| Telemetry | `runops_telemetry_snapshots`, `runops_slis`, `runops_slos`, `runops_error_budgets`, `runops_alerts`. |
| Existing Digital Twin | `foc-twin` (buildings, camera, overlays, selection), `sre-twin`, `semiconductor/DigitalTwin`, `_DigitalTwinScene.tsx`. All eager-imported. |
| Graph visualization | ReactFlow 11.11.4, d3-geo, react-simple-maps, custom SVG panels in `runops/components/graphs.tsx`. |
| Digital Coworkers | `runops_digital_workers`, `_worker_capabilities`, `_worker_sessions`, `_worker_events`, `_worker_evaluations`, `_worker_tool_grants`, `agents_catalog`, `tools_catalog`. Multiple `Coworkers*` pages. |
| Search | `src/runops/search/searchCatalog.ts` feeds command palette. |
| Settings | Full profile + org + stakeholder register + change-password flow. |
| Feature flags | `src/runops/domain/featureFlags.ts` (existing). |
| Browser testing | Playwright available in the sandbox; no committed E2E suite. |
| Testing | Vitest 3 + `@testing-library/react` 16 + `jsdom`; one example test. |

---

## SECTION 3 — REUSE MATRIX

| Subsystem | Classification | Rationale |
|---|---|---|
| Supabase client | **Reuse unchanged** | Correct tenant scoping via RLS. |
| Auth + `ProtectedRoute` + `TenantAccessGuard` | **Reuse unchanged** | Meets Meridian's needs. |
| RLS helpers (`runops_has_tenant_access`, `runops_can_write`, `runops_has_role`, `runops_has_any_role`) | **Reuse unchanged** | Never edit; add new named helpers if a twin-specific gate is required. |
| RunOps shell (layout, top bar, sidebar, right drawer, palette, error boundary, tenant equalizer) | **Reuse unchanged** | Meridian mounts inside. Extend equalizer's `check(...)` list additively. |
| Route registry (`routes.ts`) | **Extend** | Add one `RouteMeta` entry for `/runops/twin`. |
| Feature flags module | **Extend** | Add `meridianTwin.*` flags. |
| shadcn primitives | **Reuse unchanged** | Sheet, Tabs, Card, Command, Toast, etc. |
| ReactFlow (for 2D fallback) | **Reuse unchanged** | Already in root deps. |
| `runops_services / _components / _dependencies / _service_owners / _teams` | **Reuse (with data extensions via `metadata`)** | Meridian ownership + Epic tags in `metadata` jsonb. |
| `runops_components.kind` enum | **Extend (Phase 2)** | Additive enum values for Azure CI classes. |
| `runops_connectors` | **Wrap (Phase 2)** | Runtime Azure Resource Graph adapter runs in Edge Function. |
| Runbook / incident / change / telemetry tables | **Reuse unchanged** | Twin's Context Panel reads via existing shapes. |
| CI-class registry table | **Create new (optional, deferred)** | Only if hard-coded taxonomy proves insufficient. |
| Component-to-component edges | **Create new (optional, deferred)** | Only if `runops_dependencies` cardinality is inadequate. |
| Twin scene, glyphs, hulls, cartouche, camera rig, layer rail, LOD badge, presentation bar, 2D twin graph, twin context panel | **Create new** | Folder-isolated under `src/features/meridian/*`. |
| Twin adapters | **Create new** | Pure functions in `adapters/*`; only path allowed to import Supabase client from Meridian. |
| Twin Zustand store | **Create new** | Scoped local store; not global. |
| Vite `dedupe` list | **Extend** | Add `three`, `@react-three/fiber`, `@react-three/drei`. |
| Existing 3D pages (`foc-twin`, `semiconductor`, `sre-twin`) | **Reuse unchanged** | No refactor as part of Meridian. Visual regression baseline required before merge. |

---

## SECTION 4 — DATABASE REVIEW

- **Schema:** single `public` schema, ~85 tables, 20 migrations.
- **Tenant isolation:** row-level via `tenant_id`; RLS on every `runops_*` table (2 policies each — read + write).
- **RLS:** consistent pattern using `runops_has_tenant_access` (read) + `runops_can_write` (write) + role helpers.
- **Relationships:** `runops_components → runops_services` via ownership + `runops_dependencies` graph; `runops_service_owners` join.
- **Functions:** all `has_role` / `is_*_admin` / `runops_*` helpers are SECURITY DEFINER with `SET search_path = public`. Correct.
- **RPCs:** `runops_bootstrap_current_user`, `_advance_scenario`, `_reset_scenario`, `_resolve_incident`, `_approve_change`, `_approve_execution`, `_deny_execution`, `_certify_runbook_version`, plus admin RPCs.
- **Views:** none observed.
- **Indexes:** not fully audited; verify composite index on `(tenant_id, kind)` for `runops_components` before Phase 2 live ingest.
- **Generated types:** `src/integrations/supabase/types.ts` current; regenerated on every migration.
- **Migration history:** 20 migrations, forward-only, additive.
- **Compatibility:** MVP requires **zero migrations**.
- **Rollback capability:** additive migrations only; enum additions are forward-only (documented); new tables would ship with paired down-migrations.
- **Duplicate structures:** none material.
- **Unused structures:** none blocking Meridian.
- **Missing structures:** (a) Azure CI-class enum values, (b) optional `runops_ci_classes` registry, (c) optional `runops_component_edges`. All deferred to Phase 2.
- **Migration risks:** GRANTs on new tables, forward-only enum, cross-tenant policy correctness — mitigated by the migration checklist (§6 of risk review).

---

## SECTION 5 — SECURITY REVIEW

- **Authentication:** Supabase Auth, sessions in `localStorage`; `handle_new_user` blocks personal domains and marks approval state.
- **Authorization:** two-layer role model; all checks server-side via SECURITY DEFINER helpers.
- **RLS:** enabled on every `runops_*` and user-facing table; consistent read/write policies.
- **RPCs:** every mutating RPC re-verifies `auth.uid()`, `runops_can_write`, and role; several enforce **no self-approval** (`_approve_change`, `_approve_execution`, `_certify_runbook_version`).
- **Edge Functions:** 15 functions, secrets-driven, only use `service_role` server-side.
- **Service role usage:** confined to Edge Functions; never referenced client-side.
- **Secrets:** `LOVABLE_API_KEY`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWKS`, etc. All in Supabase secret store, none in DB rows.
- **Tenant isolation:** RLS enforced on all reads/writes.
- **Cross-tenant risks:** two flagged — (a) frontend caches (mitigation: tenant-keyed TanStack keys), (b) `runops_bootstrap_current_user` self-grants every role on `tenant-contoso` (mitigation: gated by `demoMode`, must be retired before `autonomousExecution`/`realInfrastructureActions` flip).
- **Browser exposure:** anon key only; publishable keys OK in code.
- **Security Center findings:** none new introduced by Meridian's design.

| Severity | Item | Notes |
|---|---|---|
| **Critical** | — | None. |
| **High** | Bootstrap over-privilege on `tenant-contoso` (S2) | Acceptable under demo, must be retired before autonomous execution. |
| **High** | Cross-tenant cache leakage risk (S1) | Mitigation: tenant-keyed query keys + integration test. |
| **Medium** | Presentation markdown XSS (S3) | Sanitised markdown pipeline. |
| **Medium** | Unbounded deep-link params (S4) | Zod-parse + clamp. |
| **Low** | Presentation export PII leak (S7) | Allow-list strip on export. |

---

## SECTION 6 — FRONTEND REVIEW

- **React:** 18.3.1 — correct for R3F 8 / drei 9 pair.
- **Vite:** 5.4.19 + SWC. `hmr.overlay: false` (dev-only concern).
- **TypeScript:** 5.8.3, strict-ish config.
- **Tailwind:** 3.4.17 + typography + animate. Semantic tokens in `src/index.css` (must be honoured by Meridian shaders).
- **shadcn:** slate baseline; full Radix set installed.
- **Charts:** Recharts 2.15, ReactFlow 11.11, d3-geo, react-simple-maps.
- **Routing:** react-router-dom 7.9.5.
- **State:** Zustand 5, TanStack Query 5.
- **Bundle:** no `manualChunks`; three/drei/fiber ride main entry today via eager semiconductor imports.
- **Code organization:** feature folders exist (`runops/*`, `features/*`, `components/*`); Meridian will follow.
- **Component hierarchy:** shallow, provider-nested, mobile drawer patterns already in shell.
- **Accessibility:** shadcn primitives provide correct ARIA; hand-rolled bits need per-page audits. Meridian's a11y plan covers the 3D canvas via 2D fallback as source of truth.
- **Responsive:** mobile drawer implemented in `AppShell` and `RunOpsLayout`.
- **Lazy loading:** **absent** — every route eagerly imported. Meridian introduces the first `React.lazy` boundary.

---

## SECTION 7 — 3D READINESS

- **Three.js:** installed at 0.160.
- **React Three Fiber:** 8.18.0 (correct for React 18).
- **drei:** 9.122.0 (correct pair).
- **Postprocessing:** not installed. Not required for MVP (glyph emissives + halos are enough). Add only if bloom pass is later needed.
- **ELK:** not installed. Not required — Meridian uses deterministic hierarchical roll-up, not force layout.
- **Instancing:** supported natively via R3F `<instancedMesh>`; already used in existing 3D pages.
- **LOD / Semantic Zoom:** must be built in Meridian.
- **Business Service Overlay:** must be built (Quickhull in worker).
- **Relationship rendering:** must be built (batched tubes per class).
- **Camera system:** drei `CameraControls` in scope; existing `foc-twin` uses `OrbitControls` — Meridian upgrades locally.
- **Context panels:** reuse `RunOpsRightDrawer`.
- **Performance:** budgets defined; enforced via `frameloop="demand"` + instancing + LOD.
- **Accessibility:** 2D fallback (ReactFlow) is the a11y source of truth.
- **Presentation mode:** must be built; cues stored in `runops_services.metadata.presentation`.

**Already exists:** three/R3F/drei, `foc-twin` scene patterns, `_DigitalTwinScene`, ReactFlow for 2D fallback, right drawer, error boundary.
**Reuse:** all of the above.
**Must be created:** `TwinCanvas`, `TwinCameraRig`, `TwinLayers`, `TwinNodesInstanced`, `TwinEdges`, `TwinServiceHulls`, `TwinCartouche`, `TwinLodBadge`, `TwinLayerRail`, `TwinLegend`, `TwinPresentBar`, `Twin2DGraph`, `TwinContextPanel`, `TwinStoreProvider`, adapters, worker.

---

## SECTION 8 — PACKAGE REVIEW

- **Potential conflicts:** none blocking. Watchlist: `three` not in Vite `dedupe`.
- **Duplicate libraries:** none observed; `overrides`/`resolutions` pin `lodash` and `d3-color`.
- **Outdated libraries:** none blocking; `@types/three` 0.184 is types-only over-pin vs. `three@0.160` — noise, not risk.
- **Unused libraries:** not audited exhaustively; no removals required for Meridian.
- **Version incompatibilities:** none — R3F 8 / drei 9 correctly paired with React 18. Do **not** bump R3F to 9 (needs React 19).
- **Recommended additions (each optional, none blocking MVP):**
  - `size-limit` — CI bundle-diff gate.
  - `@axe-core/playwright` — a11y checks on 2D fallback + panel.
  - `@react-three/test-renderer` — 3D smoke tests.
  - `dagre` — hierarchical layout for the 2D fallback (or use ReactFlow's built-in).
- **Recommended removals:** none as part of Meridian.

---

## SECTION 9 — PERFORMANCE REVIEW

- **Bundle:** monolithic today (no lazy routes); Meridian must be first lazy chunk.
- **Chunking:** no `manualChunks`; rely on Vite dynamic-import splitting for `meridian-*.js`.
- **Lazy loading:** absent → Meridian introduces it (additive).
- **Performance targets:** ≤ 350 KB gzip chunk, ≤ 1.5 s TTFF (500 nodes), ≤ 16 ms/frame at Service LOD, ≤ 60 draw calls at 5k nodes, `frameloop="demand"` idle.
- **Memory:** must dispose geometries/materials on tenant switch; Playwright leak test over 20 switches.
- **Large components:** `App.tsx` 839 lines — a maintenance smell but not blocking.
- **Render bottlenecks:** none current; potential in twin — mitigated by LOD + instancing + worker for hulls.
- **Three.js risks:** duplicate-instance (dedupe fix), `<Html>` overhead at scale (LOD gate), `frameloop="always"` starvation (only during cue transitions).

---

## SECTION 10 — DESIGN REVIEW

- **Design system:** semantic tokens in `src/index.css` + `tailwind.config.ts`; shadcn defaults; slate palette.
- **Typography:** shadcn baseline; no custom font pair defined project-wide.
- **Spacing:** Tailwind scale; consistent in RunOps shell.
- **Cards / Buttons / Dialogs / Tables / Drawers / Context panels:** all shadcn primitives — Meridian reuses.
- **Visual hierarchy:** RunOps shell is dense but consistent (sidebar + top bar + right drawer + main).
- **Meridian fit:** Meridian will fit if it (a) sources all colours from CSS custom properties → shader uniforms, (b) uses shape + label prefix (not colour alone) for health, (c) mounts the Context Panel into the existing `RightDrawerProvider`, (d) respects `prefers-reduced-motion`. All three are already in the risk register as blocking (V1/V2/V4).

---

## SECTION 11 — TECHNICAL DEBT

| Severity | Debt | Impact | Recommendation | Fix before Meridian? |
|---|---|---|---|---|
| **Critical** | — | — | — | — |
| **High** | Zero lazy loading; monolithic `App.tsx` (839 lines) | Every route ships together; bundle grows with each feature | Introduce `React.lazy` starting with Meridian; do not retrofit others in the same PR | **No — solve within Meridian PR** |
| **High** | `three` missing from Vite `dedupe` | Latent "Multiple instances of Three.js" risk | Add to `dedupe` in Meridian's Phase 0 | **Yes, in Phase 0** |
| **High** | `runops_bootstrap_current_user` grants every role on `tenant-contoso` | Over-privilege risk once autonomous actions ship | Retire before `autonomousExecution`; enforce `demoMode` in presentation | Track; not required to fix before Meridian |
| **Medium** | No committed E2E suite; only one Vitest example | Regression detection is manual | Ship Meridian E2E + reuse for existing-route smoke | **Yes — as part of Meridian test plan** |
| **Medium** | `hmr.overlay: false` hides dev errors | Slower feedback in development | Flip to true during Meridian iteration; leave prod behaviour untouched | Track |
| **Medium** | No bundle-size CI gate | Silent bundle bloat | Add `size-limit` gate in Meridian Phase 0 | **Yes** |
| **Medium** | `@types/three@0.184` over-pinned vs `three@0.160` | Types drift from runtime | Align in a future maintenance PR | No |
| **Low** | `App.tsx` monolith | Cognitive load | Extract route groups over time | No |
| **Low** | `useTenantScope` retired but presumably still referenced | Dead-code | Sweep during Meridian regression pass | No |

---

## SECTION 12 — RISK MATRIX (consolidated top items)

| # | Risk | Likelihood | Impact | Mitigation | Blocking |
|---|---|---|---|---|---|
| T1 | Multiple `three` instances | Med | High | Vite `dedupe` + E2E guard | **Yes** |
| T2 | Accidental R3F v9 bump | Low | High | Pinned versions | **Yes** |
| P7 | Memory leak on tenant switch | High | High | Explicit `dispose()` + leak test | **Yes** |
| S1 | Cross-tenant cache leakage | Med | High | Tenant-keyed query keys + 403 test | **Yes** |
| S2 | Bootstrap over-privilege bleeds into presentation | High | High | Force `demoMode` in presentation | **Yes** |
| S5 | Live-ingest exposed to client | Low | High | Confine to Edge Function | **Yes (Phase 2)** |
| S6 | Client-side role gates for writes | Med | High | RLS + SECURITY DEFINER RPCs only | **Yes** |
| B1 | Meridian eagerly imported → main bundle bloat | High | High | ESLint import boundary + bundle diff gate | **Yes** |
| D1 | Missing Azure CI enum values | High | Med | Additive enum in Phase 2 | **Yes (Phase 2)** |
| D3 | 1000-row query limit hit on topology | High | High | Paginated queries | **Yes** |
| M2 | New tables shipped without GRANTs | Med | High | Migration checklist | **Yes (if tables added)** |
| M3 | RLS on new tables allows cross-tenant read | Low | High | Tenant-scoped policies + live verification | **Yes** |
| M4 | Editing existing helpers cascades to all policies | Med | High | Add new named helpers only | **Yes** |
| A5 | Adapter bypass | Med | High | Lint-restricted Supabase import in Meridian folder | **Yes** |
| R1 | Suspense boundary breaks existing error chains | Low | High | Route-scoped Suspense + router snapshot test | **Yes** |
| R3 | Tenant equalizer mis-redirects | Med | High | New checks scoped to `/runops/twin/*` only + full-section E2E | **Yes** |
| R4 | Dedupe change destabilises existing 3D pages | Low | High | Pre-merge visual regression on `/semiconductor/*` | **Yes** |
| V1 | Hex colours bypass theme in shaders | High | Med | CSS custom-property → uniform bridge | **Yes** |
| V2 | Colour-only health encoding | High | High | Shape + label prefix; snapshot-enforced | **Yes** |
| V4 | Reduced-motion ignored | High | Med | Global short-circuit in camera + shaders | **Yes** |
| O1 | Flag flipped in prod without staging burn | Med | High | 24 h clean staging | **Yes** |
| O6 | `mode=live` without connectors | Low | High | Env schema refuses combo | **Yes** |

Full 60-item register lives in the previously approved risk review.

---

## SECTION 13 — READINESS CHECKLIST

| Area | Status |
|---|---|
| Git | **PASS** — repo healthy; managed externally per Lovable rules. |
| Database | **PASS** — no MVP migrations needed. |
| Security | **CONDITIONAL PASS** — S1/S2/S5/S6 are blocking within their phase. |
| Architecture | **PASS** — spec + integration plan approved. |
| Performance | **CONDITIONAL PASS** — budgets and dispose blockers must land. |
| Frontend | **CONDITIONAL PASS** — dedupe + lazy boundary required. |
| Backend | **PASS** — reuse-only for MVP. |
| Testing | **CONDITIONAL PASS** — E2E + leak + a11y suites must ship with Meridian. |
| Accessibility | **CONDITIONAL PASS** — V1/V2/V4 blocking; 2D fallback is the source of truth. |
| 3D | **CONDITIONAL PASS** — installed and paired; new twin components must be created. |
| Documentation | **PASS** — plan artefacts in `.lovable/plan.md` cover the design and risks. |
| Feature flags | **PASS** — module exists; extend additively. |
| Regression | **CONDITIONAL PASS** — existing-route smoke + `semiconductor` visual regression required. |
| Bundle | **CONDITIONAL PASS** — first lazy boundary + size-limit gate. |
| Navigation | **PASS** — one route + one sidebar item + palette entries, flag-gated. |
| Tenant model | **PASS** — reuse `useOperations().tenant` + RLS. |
| Authentication | **PASS** — reuse-only. |
| Rollback | **PASS** — flag flip < 60 s; no data-restore required. |

---

## SECTION 14 — IMPLEMENTATION READINESS

### Blocking (must be done inside Phase 0 before any user-visible pixel)
1. Add `three`, `@react-three/fiber`, `@react-three/drei` to Vite `dedupe`.
2. ESLint rule: `src/features/meridian/*` imports restricted to Meridian folder + `App.tsx`.
3. ESLint rule: `@/integrations/supabase/client` importable only from `src/features/meridian/adapters/*` inside the Meridian folder.
4. Register `/runops/twin` lazy route, sidebar item, palette entries — all behind `meridianTwin.enabled=false`.
5. Env-schema refuses `meridianTwin.mode="live"` without a configured connector.
6. Router snapshot test proving Suspense boundary isolation.
7. Visual-regression baseline for `/semiconductor/*` captured before Meridian merges.
8. Bundle-size CI gate on `dist/assets/index-*.js` (≤ +5 KB gzip delta).

### Strongly Recommended (should be done in Phase 0 or early Phase 1)
- Playwright leak test scaffold for tenant-switch (used by P7 later).
- `@axe-core/playwright` integrated for the 2D fallback.
- Extract fixture bundles at three sizes (500 / 2k / 5k nodes) for perf CI.
- Confirm indexes on `runops_components(tenant_id, kind)` and `runops_dependencies(tenant_id, source_id)` via EXPLAIN.
- Sweep dead `useTenantScope` references.

### Optional
- Postprocessing (bloom) once glyphs are stable and there's a visual case for it.
- ELK / dagre only if hierarchical roll-up proves insufficient.
- `size-limit` config extension to also cover Meridian chunk (not just entry).
- Postmortem/incident deep links from twin nodes (Phase 3+).

---

## SECTION 15 — RECOMMENDATIONS (Chief Architect)

### Before starting
- Lock the Phase 0 blocking list above; treat every item as a merge gate.
- Freeze the R3F pair versions and add a Renovate/CI rule blocking major bumps of `react`, `@react-three/fiber`, `@react-three/drei`, `three`.
- Publish the "what Meridian uses" section of the Reuse Matrix as the definitive read-map for developers so no one accidentally rebuilds existing capability.
- Author the `runops_services.metadata.presentation` JSON schema (Zod) so cues stop being free-form.

### Postpone
- Any changes to existing routes' loading strategy — Meridian's lazy boundary should not trigger a wider refactor.
- New `runops_ci_classes` / `runops_component_edges` tables — MVP works with `metadata.ciClass` string and `runops_dependencies` alone.
- Live Azure Resource Graph ingestion — Phase 2, gated by explicit approval.
- Postprocessing effects and camera cinematics beyond `fitToBox` easing.

### Redesign
- Nothing structural. The proposed additive, adapter-mediated, flag-gated design is the right shape for this codebase.
- Minor: replace the ad-hoc `useTenantRouteEqualizer` list with a small registry so per-feature route equalisers plug in without editing the shell.

### Leave unchanged
- Auth flow, role model, RLS helpers, RunOps shell, `runops_*` schema for MVP, `App.tsx` routing style (aside from adding one lazy route), Vite core config beyond `dedupe`, all existing 3D pages.

---

## SECTION 16 — FINAL DECISION

**CONDITIONAL GO.**

**Reasoning.** Neugain.io is architecturally ready to host the Meridian Digital Twin as an **additive, tenant-scoped, feature-flagged, lazy-loaded capability**. The backend already models everything the twin needs; the frontend stack is on the correct React-18-compatible 3D pair; auth, tenancy, and RLS are sound; the shell is directly reusable. There are no unresolved High/High risks. Every blocking item has a concrete, additive mitigation and belongs inside the phased build — not before it. The single kill-switch (flag flip) makes the rollback story trivial and de-risks progression to prod.

The "conditional" qualifier reflects three real gates the team must honour:
1. **Phase 0 must land the eight blocking items above** before any user-visible Meridian pixel.
2. **Phase 2 (live ingest) is a separate approval** — enum additions and Edge Function scope carry their own migration + security checklist.
3. **Regression discipline is required** — router snapshot, tenant-switch E2E, existing-route smoke, and `semiconductor` visual regression on every Meridian PR.

If those gates hold, Meridian can proceed to build. Absent them, the same architecture flips to NO GO.

No implementation performed. Awaiting user approval to switch to build mode and begin Phase 0.
