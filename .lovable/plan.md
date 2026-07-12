
# Meridian Implementation — Risk Review

Read-only assessment against the approved architectural specification + integration roadmap. No code, schema, or config changes. Scale: Likelihood/Impact = **Low / Med / High**. Blocking = "must be resolved before code merges to main".

---

## 1. Technical Risks

| # | Risk | Likelihood | Impact | Mitigation | Blocking |
|---|---|---|---|---|---|
| T1 | Multiple `three` instances (nested dep pulls its own copy) → R3F throws "Multiple instances of Three.js" | Med | High | Add `three`, `@react-three/fiber`, `@react-three/drei` to `vite.config.ts` `dedupe`; add an E2E guard asserting a single `THREE` instance. | **Yes** |
| T2 | R3F 8 / drei 9 pairing accidentally bumped to v9/v10 (needs React 19) | Low | High | Pin exact versions in `package.json`; block major bumps via Renovate config. | **Yes** |
| T3 | Zustand store re-renders whole scene on any state change | Med | Med | Selector-based subscriptions (`useTwinStore(s => s.selection.primary)`); shader uniforms updated imperatively, not via React state. | No |
| T4 | GPU picking misses on high-DPI or after canvas resize | Med | Med | Use raycaster on instance IDs, not colour-buffer picking; recompute on `ResizeObserver`. | No |
| T5 | Web worker for hull/layout breaks in older Safari / iframe | Low | Med | Fallback to main-thread compute behind capability detect. | No |
| T6 | `frameloop="demand"` starves animated shaders (traffic edges) | Med | Low | Invalidate on animation tick from a `useFrame` inside animated layers; disable when layer hidden. | No |

## 2. Performance Risks

| # | Risk | Likelihood | Impact | Mitigation | Blocking |
|---|---|---|---|---|---|
| P1 | 5k+ node estates blow the 16 ms frame budget | Med | High | Hard cap via `meridianTwin.perf.maxNodes`; instanced meshes; frustum + distance culling; LOD gating. | No |
| P2 | drei `<Html>` labels cost DOM reflows at scale | High | Med | Only render at LOD ≥ Service; cap visible labels to N=200; virtualise off-screen. | No |
| P3 | Convex-hull recompute on every service change | Med | Med | Memoise per service; recompute in worker; debounce 250 ms. | No |
| P4 | TanStack Query storm on tenant switch | Med | Med | Cancel in-flight queries; use query key with `tenant_id`; `staleTime: 60s`. | No |
| P5 | Presentation-mode cinematic paths keep GPU pegged | Low | Med | Force `frameloop="always"` only while a cue is transitioning; return to `"demand"` on dwell. | No |
| P6 | First paint > 1.5 s on cold Meridian tenant | Med | Med | Preload topology query on route hover; render 2D fallback under Suspense while 3D warms. | No |
| P7 | Memory leak on repeated tenant switches (three geometries/materials) | High | High | Explicit `dispose()` in unmount + on `useTenantRouteEqualizer` hook; leak test in Playwright over 20 switches. | **Yes** |

## 3. Security Risks

| # | Risk | Likelihood | Impact | Mitigation | Blocking |
|---|---|---|---|---|---|
| S1 | Cross-tenant leakage via cached topology after tenant switch | Med | High | Query keys include `tenant_id`; RLS enforces server-side; add integration test asserting 403 on cross-tenant read. | **Yes** |
| S2 | `runops_bootstrap_current_user` grants every role on `tenant-contoso` — presentation mode inherits over-privilege | High | High | Presentation mode forces `demoMode: true` and disables all mutation actions. Retire bootstrap once `autonomousExecution` flips on. | **Yes** |
| S3 | Presentation cues stored in `metadata` could carry XSS in narration markdown | Med | Med | Render narration through the existing sanitised markdown pipeline; no `dangerouslySetInnerHTML`. | No |
| S4 | Deep-link `?pose=` / `?select=` parameters trigger unbounded state | Low | Low | Zod-parse query params; clamp numeric ranges; reject unknown node IDs silently. | No |
| S5 | Live-ingest Azure Resource Graph adapter exposed to client | Low | High | Runs only in Edge Function with `service_role`; frontend calls a narrow RPC; anon key never sees Azure creds. | **Yes** when Phase 2 lands |
| S6 | Client-side role checks used to gate write actions | Med | High | Never trust client; every write goes through RLS + SECURITY DEFINER RPC; UI affordances are cosmetic. | **Yes** |
| S7 | Screen-recorded presentation exports leak sensitive tenant data | Low | Med | "Export cue JSON" strips PII fields via allow-list; document in tenant profile. | No |

## 4. Bundle Risks

| # | Risk | Likelihood | Impact | Mitigation | Blocking |
|---|---|---|---|---|---|
| B1 | Meridian chunk imported eagerly from a shared file → lands in main bundle | High | High | ESLint rule forbidding `import` of `src/features/meridian/*` outside the folder + `App.tsx`; CI bundle-diff gate ≤ +5 KB on `index-*.js`. | **Yes** |
| B2 | ReactFlow (used by 2D fallback) shipped twice — once via existing routes, once via Meridian | Low | Med | Reuse the existing `reactflow` dep; do not fork. Confirmed already in root deps. | No |
| B3 | drei's tree-shaking regressions (v9 exports everything from `index`) | Med | Med | Import from deep paths (`@react-three/drei/core/CameraControls`); check bundle analyser output. | No |
| B4 | Fixture JSON files inflate the Meridian chunk | Med | Med | Ship fixtures as `?url` imports fetched at runtime, not bundled statically. | No |
| B5 | Source maps ship to prod | Low | Low | Vite default already excludes; verify in CI. | No |
| B6 | Meridian chunk > 350 KB gzip budget | Med | Med | `size-limit` CI check; three/drei are the biggest — mitigated by dedupe (shared with existing 3D pages). | No |

## 5. Database Risks

| # | Risk | Likelihood | Impact | Mitigation | Blocking |
|---|---|---|---|---|---|
| D1 | `runops_components.kind` enum lacks Azure CI classes → ingestion fails silently | High | Med | Ship additive enum migration **before** live ingest; MVP uses free-form `metadata.ciClass` string. | **Yes** at Phase 2 |
| D2 | `runops_services.metadata->'presentation'` writes conflict across editors | Med | Med | Optimistic concurrency via `updated_at` compare-and-set; last-writer-wins with toast warning. | No |
| D3 | Query for full topology hits Supabase 1000-row default limit | High | High | Paginate by subscription/RG; never `.select('*')` without `.range()`; add integration test. | **Yes** |
| D4 | `runops_dependencies` graph cycles crash layout | Med | Med | Cycle detection in adapter; render cyclic edges as dashed and skip layout iteration. | No |
| D5 | JSONB `metadata` schema drift breaks presentation cues over time | Med | Med | Zod schema for `TwinCue` at read boundary; migration script versions the payload. | No |
| D6 | Missing indexes on `runops_components(tenant_id, kind)` slow twin cold load | Med | Med | Verify indexes exist; add composite index if EXPLAIN shows seq scan. | No |

## 6. Migration Risks

| # | Risk | Likelihood | Impact | Mitigation | Blocking |
|---|---|---|---|---|---|
| M1 | Enum-value addition rolled back → breaks any row already using it | High | High | Enum additions are **forward-only**; document that no rollback exists; delay enum change until Phase 2 with explicit approval. | **Yes** at Phase 2 |
| M2 | New `runops_ci_classes` / `runops_component_edges` tables shipped without GRANTs → PostgREST returns permission error | Med | High | Enforced by project rule: every `CREATE TABLE` in `public` must be paired with GRANTs in the same migration. Code review checklist. | **Yes** if/when tables are added |
| M3 | RLS policy on new tables allows cross-tenant read | Low | High | Every policy scopes to `runops_has_tenant_access(tenant_id)`; live verification pass (200 same-tenant, 403 cross-tenant) required post-migration. | **Yes** |
| M4 | Modifying `runops_can_write` or other helpers to add roles cascades to every dependent policy | Med | High | Never modify existing helpers — add new named helpers (`runops_can_author_twin`) instead. | **Yes** |
| M5 | Presentation JSON migration script runs against wrong tenant | Low | High | Migration runs per-tenant with explicit `tenant_id` filter; dry-run first. | No |
| M6 | Deferred migrations pile up and ship together | Med | Med | Ship each deferred migration as its own PR with its own verification pass. | No |

## 7. Architecture Risks

| # | Risk | Likelihood | Impact | Mitigation | Blocking |
|---|---|---|---|---|---|
| A1 | Two sources of truth (Zustand view state + URL query params) diverge | High | Med | URL is authoritative on mount; Zustand mirrors it via a subscribe→history.replaceState bridge. Single write-through. | No |
| A2 | 2D fallback drifts from 3D over time (features only added in 3D) | High | Med | Both views bind the same selectors from `useTwinStore`; component tests assert feature parity for a whitelist of interactions. | No |
| A3 | Context Panel duplicates existing RunOps entity panels | Med | Med | Reuse the existing `RunOpsRightDrawer` mount; share tab components with `/runops/services/:id` where identical. | No |
| A4 | Presentation cues become a proprietary format nobody else can edit | Med | Low | JSON schema documented + versioned; import/export round-trip test. | No |
| A5 | Adapter layer bypassed for "one small direct query" | Med | High | Lint rule: only `src/features/meridian/adapters/*` may import `@/integrations/supabase/client` inside the Meridian folder. | **Yes** |
| A6 | Feature flags accumulate without cleanup | Med | Low | Track flags in `.lovable/plan.md`; retire `meridianTwin.enabled` post-GA. | No |

## 8. Regression Risks

| # | Risk | Likelihood | Impact | Mitigation | Blocking |
|---|---|---|---|---|---|
| R1 | Adding lazy Suspense boundary to `App.tsx` breaks an existing route's error boundary chain | Low | High | Wrap only the Meridian route in Suspense; leave existing routes untouched; snapshot test on router tree. | **Yes** |
| R2 | Sidebar/palette entries push existing items off-screen on mobile | Low | Med | Feature-flag gated; visual regression test on mobile viewport. | No |
| R3 | `useTenantRouteEqualizer` extension mis-classifies existing entity IDs as missing → redirects users mid-flow | Med | High | New `check()` entries scoped to `/runops/twin/*` prefix only; existing checks untouched. E2E on tenant switch across every RunOps section. | **Yes** |
| R4 | `dedupe` list change alters how existing 3D pages resolve `three` | Low | High | Existing semiconductor pages already use the same `three@0.160` — dedupe is additive. Visual regression on `/semiconductor/*` after merge. | **Yes** |
| R5 | Query key naming (`['twin','node',id]`) collides with existing key | Low | Med | Namespace all Meridian keys under `['twin',...]`; grep existing keys to confirm no collision. | No |
| R6 | ESLint rule change (import boundary) fails lint on unrelated legacy files | Low | Low | Rule scoped to `src/features/meridian/*` only. | No |

## 9. Visual Risks

| # | Risk | Likelihood | Impact | Mitigation | Blocking |
|---|---|---|---|---|---|
| V1 | Hardcoded hex colours in glyph shaders bypass theme | High | Med | Bridge CSS custom properties (from `index.css`) → shader uniforms at mount; forbid hex in shader code via lint. | **Yes** |
| V2 | Health colour communicated by hue alone (fails WCAG 1.4.1) | High | High | Every health state carries shape + label prefix (● ▲ ■) — enforced in `TwinLegend` snapshot test. | **Yes** |
| V3 | Text on translucent hulls fails contrast | Med | Med | Cartouche renders on solid Card background above the hull, not on it. | No |
| V4 | `prefers-reduced-motion` ignored by camera easing / edge flow | High | Med | Global check at `TwinCameraRig` and edge shader init; snap transitions when reduced-motion is on. | **Yes** |
| V5 | Presentation teleprompter overflows on 4:3 projectors | Low | Low | Max-width clamp + line-height responsive to viewport. | No |
| V6 | Dark-mode canvas washes out against dark chrome | Med | Med | Canvas background token from `--background`; test in both themes. | No |

## 10. Operational Risks

| # | Risk | Likelihood | Impact | Mitigation | Blocking |
|---|---|---|---|---|---|
| O1 | Flag-flip on prod without staging burn-in | Med | High | 24 h clean staging required in Phase 5; documented in `.lovable/plan.md`. | **Yes** |
| O2 | Support has no visibility into why a tenant sees empty twin | Med | Med | Empty-state message includes tenant name + "connect Azure Resource Graph"; log a `runops_domain_events` row on empty-render. | No |
| O3 | Rollback via flag flip leaves stale cached chunks in browsers | Low | Low | Route is lazy and gated; users hit nav entry only when flag on. Stale chunk becomes orphaned. | No |
| O4 | Live-ingest Edge Function rate-limited by Azure | Med | Med | Backoff + jitter; cache in `runops_telemetry_snapshots`; alert on 429. | No |
| O5 | Presentation-mode demo fails at customer meeting (network, data drift) | Med | High | `demoMode: true` uses bundled fixtures; presentation cues are self-contained; pre-flight check button. | No |
| O6 | Feature-flag misconfiguration in an environment enables live mode against demo data | Low | High | Env schema validation on boot; refuse to render twin if `mode="live"` but no connectors configured. | **Yes** |
| O7 | On-call has no runbook for "twin canvas frozen" | Med | Low | Add a knowledge-base entry with reload + 2D-fallback steps; link from empty state. | No |

---

## Summary — Blocking Items

The following **must** be resolved before Meridian code merges to main (or before the phase they belong to):

- **T1** dedupe `three` in `vite.config.ts`
- **T2** version-pin R3F pair
- **P7** dispose geometries on tenant switch (leak test)
- **S1** tenant-scoped query keys + 403 integration test
- **S2** presentation mode forces `demoMode: true` and disables mutations
- **S5** live-ingest confined to Edge Function (Phase 2)
- **S6** no client-side role gates for writes
- **B1** ESLint import-boundary rule + bundle-diff gate
- **D1** enum additions deferred until Phase 2 with explicit approval
- **D3** paginated topology queries; no unbounded selects
- **M1–M4** migration checklist (GRANTs, tenant-scoped RLS, new helpers only)
- **A5** adapter-only Supabase access (lint enforced)
- **R1, R3, R4** regression tests on router tree, tenant equalizer, existing 3D pages
- **V1, V2, V4** semantic tokens in shaders, non-colour health encoding, reduced-motion support
- **O1** 24 h staging burn-in
- **O6** env-schema refuses `live` without connectors

Non-blocking items are tracked for phase-appropriate mitigation but do not gate merge.

---

## Verdict

**CONDITIONAL GO.**

Rationale: no risk in the review is unresolvable, and every High-impact / High-likelihood item has a concrete mitigation that fits within the additive, feature-flagged architecture already approved. Conditions are the 18 blocking items above, applied per phase per the roadmap. Meridian may proceed to Phase 0 (foundation scaffolding behind `meridianTwin.enabled=false`) once these are acknowledged.

No implementation performed. Awaiting phase approval to switch to build mode.
