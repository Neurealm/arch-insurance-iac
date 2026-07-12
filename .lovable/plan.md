
# Meridian Digital Twin — Final Readiness Assessment

Consolidated verdict across every prior read-only review (build status, backend, frontend, architectural spec, integration plan, risk review). No code, schema, or config changes.

---

## Readiness Scorecard

| # | Domain | Verdict | Basis |
|---|---|---|---|
| 1 | Project Health | **PASS** | Build green, TS/lint clean, auth healthy, tenant scope working, existing routes/nav/dashboards intact (per July-12 assessment). |
| 2 | Architecture | **PASS** | 13-section Digital Twin spec approved. Providers wrapped locally; Zustand + TanStack Query separation; single lazy route; feature-flag gated. |
| 3 | Database | **CONDITIONAL PASS** | MVP is 100% reuse of `runops_services / _components / _dependencies / _service_owners / _teams / _slos / _incidents / _changes / _runbooks`. Enum additions + optional new tables deferred to Phase 2 with GRANT + tenant-RLS checklist. |
| 4 | Security | **CONDITIONAL PASS** | Reuses existing SECURITY DEFINER helpers, RLS, and role model. Blockers S1/S2/S5/S6 must be honoured (tenant-scoped query keys, `demoMode` presentation, live-ingest confined to Edge Function, no client role gates). |
| 5 | Frontend | **CONDITIONAL PASS** | R3F 8.18 / drei 9.122 / three 0.160 correctly paired for React 18. Requires `three` added to Vite `dedupe`; lazy route additive; no existing route touched. |
| 6 | Performance | **CONDITIONAL PASS** | Budgets defined (≤ 350 KB chunk, ≤ 1.5 s TTFF, ≤ 16 ms/frame, ≤ 60 draw calls, `frameloop="demand"`). Requires explicit dispose on tenant switch + leak test (P7). |
| 7 | Integration | **PASS** | Additive route, one sidebar item, one palette catalog, one Zustand store, one dedupe entry. `useTenantRouteEqualizer` extended additively. |
| 8 | Visual Design | **CONDITIONAL PASS** | Semantic tokens only in shaders (V1), non-colour health encoding (V2), `prefers-reduced-motion` respected (V4). Dark/light parity required. |
| 9 | Reuse Matrix | **PASS** | Reuse-heavy: only new components live under `src/features/meridian/*`. No forks of shadcn, RunOps shell, or existing 3D helpers. |
| 10 | Migration Strategy | **CONDITIONAL PASS** | Zero migrations for MVP. Deferred enum + optional tables each ship as their own PR with GRANTs, tenant-scoped RLS, and post-migration live verification pass. |
| 11 | Rollback Strategy | **PASS** | Flag flip is the kill switch (< 60 s, no rebuild). Every additive change is revertable without data restore. Enum additions are forward-only and deferred. |
| 12 | Regression Strategy | **CONDITIONAL PASS** | ESLint import boundary, bundle-diff gate ≤ +5 KB on `index-*`, existing-route smoke, tenant-switch E2E across all RunOps sections, single-`three`-instance E2E guard, visual regression on `/semiconductor/*`. |

**No domain rated NO GO.**

---

## Remaining Required Actions (18 Blocking Items — to be executed inside the phased build, not before)

These are the conditions carried forward from the risk review. They are **implementation gates**, not pre-approval work.

### Phase 0 — Foundation (must land before any user-visible pixel)
1. **T1** Add `three`, `@react-three/fiber`, `@react-three/drei` to `vite.config.ts` `dedupe`.
2. **T2** Confirm exact pins on R3F 8.x / drei 9.x / three 0.160; no major bumps.
3. **B1** ESLint rule forbidding imports of `src/features/meridian/*` outside the folder and `src/App.tsx`.
4. **A5** ESLint rule restricting `@/integrations/supabase/client` to `src/features/meridian/adapters/*` inside the Meridian folder.
5. **R1** Snapshot test on router tree to prove Meridian's `<Suspense>` does not alter existing error-boundary chains.
6. **R4** Visual-regression baseline captured on `/semiconductor/*` before merging Meridian.
7. **O6** Env-schema validation refusing `meridianTwin.mode="live"` without a configured connector.
8. Register `/runops/twin` lazy route + sidebar entry + palette entries — all behind `meridianTwin.enabled=false`.

### Phase 1 — Static twin
9. **S1** Query keys namespaced under `['twin', tenantId, ...]`; integration test proving 403 on cross-tenant read.
10. **P7** Explicit `dispose()` of geometries/materials on unmount and on `useTenantRouteEqualizer`; Playwright leak test over 20 tenant switches.
11. **V1** CSS-custom-property → shader-uniform bridge; lint forbidding hex in shader files.
12. **V2** `TwinLegend` snapshot test asserting shape + label prefix on every health state.
13. **V4** `prefers-reduced-motion` short-circuits camera easing, LOD cross-fade, and edge flow shader.
14. **D3** All topology queries paginated by subscription/RG; unit test asserting no unbounded selects.
15. **R3** E2E covering tenant switch across every RunOps section, including `/runops/twin/*`.

### Phase 2 — Live data (only when live ingest is scheduled)
16. **D1 / M1** Additive enum migration for Azure CI classes, forward-only, with explicit approval and paired verification pass.
17. **M2 / M3 / M4** Any new tables ship with `GRANT` block + tenant-scoped RLS in the same migration; new named helpers only, no edits to existing ones.
18. **S5** Live-ingest confined to an Edge Function using `service_role`; frontend only calls a narrow RPC.

### Ongoing (every phase)
- **S2 / S6** Presentation mode forces `demoMode: true`; all mutation UI is cosmetic and every write goes through RLS + SECURITY DEFINER RPC.
- **O1** 24 h clean staging burn-in required before the prod flag flip in Phase 5.
- Bundle-diff CI gate (≤ +5 KB on `index-*.js`) enforced on every Meridian PR.

---

## Verdict

**CONDITIONAL GO.**

Meridian is ready to begin implementation, starting at **Phase 0 — Foundation** as scoped above. Every domain has a concrete mitigation path; no unresolved High/High risks remain; no schema changes are required for MVP; rollback is a single flag flip.

Progression past Phase 0 is gated on the numbered actions completing within their phase. No implementation performed. Awaiting user approval to switch to build mode and begin Phase 0.
