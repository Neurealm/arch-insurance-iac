
# Meridian Digital Twin — Integration Plan / Implementation Roadmap

Read-only planning artefact. No code, no schema, no config changes. Builds on the previously approved:
- Frontend architecture verdict (**CONDITIONAL GO**)
- Backend reuse matrix (**CONDITIONAL GO**)
- Digital Twin architectural specification (13 sections)

---

## 1. Routes

Single **lazy-loaded** entry, added additively to `src/App.tsx`. No existing route touched.

| Path | Purpose | Lazy chunk |
|---|---|---|
| `/runops/twin` | Meridian twin canvas (default LOD = `Estate`) | `meridian` |
| `/runops/twin/services/:serviceId` | Deep-link to a business service; sets selection + `fitToBox` | same |
| `/runops/twin/components/:componentId` | Deep-link to a CI; opens Context Panel | same |
| `/runops/twin/present/:cueSetId?` | Presentation mode (§13 of spec) | same |

Query-param sub-state (not new routes): `?pose=…&layers=…&lod=…&select=…&hop=1&view=3d|2d|split`.

**Placement in nav tree:** under existing RunOps section (`src/runops/shell/routes.ts` — add one `RouteMeta` entry with `section: "Services"`, `title: "Digital Twin"`, `status: "Built"`). No changes to `navSections` order.

## 2. Tenant Behavior

- Reuses the existing tenant resolution via `useOperations().tenant` from `RunOpsProviders` — no new tenant plumbing.
- Twin data queries carry `tenant_id` explicitly; RLS enforces isolation server-side.
- On tenant switch, `useTenantRouteEqualizer` (already in `RunOpsLayout`) will bump the user to `/runops/twin` landing if a `:serviceId` / `:componentId` does not exist in the new tenant's dataset — extend its `check(...)` list additively.
- Empty-tenant state: renders "No topology data for `<tenant>` yet — connect Azure Resource Graph in Integrations" rather than falling back to any other tenant's data.
- Presentation cues are tenant-scoped (`runops_services.metadata.presentation.cues`) — never cross-tenant.

## 3. Feature Flags

Extend the existing `src/runops/domain/featureFlags.ts` — no new flag module.

| Flag | Default | Purpose |
|---|---|---|
| `meridianTwin.enabled` | `false` | Master gate; when off, route + nav entry are hidden. |
| `meridianTwin.mode` | `"demo"` | `demo` (bundled fixtures) \| `live` (Supabase-backed) \| `hybrid`. |
| `meridianTwin.threeD` | `true` | When false, force 2D fallback regardless of device. |
| `meridianTwin.presentation` | `true` | Enables `/runops/twin/present/*`. |
| `meridianTwin.layerDefaults` | `[L0..L5]` | Layers visible on first mount. |
| `meridianTwin.perf.maxNodes` | `5000` | Hard cap; above this the twin renders a stub with a "Filter by service" prompt. |
| `meridianTwin.perf.frameloop` | `"demand"` | `"demand"` \| `"always"` for stress tests. |

Flags flow: env → featureFlags module → `useTwinStore` initialiser. No React context added.

## 4. Navigation

- Add one sidebar item in `RunOpsSidebar` under **Services**: "Digital Twin" — visible only when `meridianTwin.enabled`.
- Command Palette (`src/runops/shell/CommandPalette.tsx`): add search entries for "Open Digital Twin", "Present Twin", "Twin: focus service …", "Twin: 2D view". Registered via existing `searchCatalog` extension point — no new palette host.
- Breadcrumbs: reuse existing route-title resolver in `routes.ts`. No new breadcrumb component.
- Top bar: no changes. Twin-local controls (LOD, layer toggles, view mode, Present) live inside the twin surface as an overlay panel, not in `RunOpsTopBar`.

## 5. Providers

Wrapped **locally at the Meridian route**, not hoisted into `App.tsx` or `RunOpsLayout`.

```
<Suspense fallback={<TwinSkeleton/>}>
  <MeridianRoute>
    <TwinStoreProvider>            // Zustand bootstrap (view state)
      <TwinDataProvider>            // TanStack Query keys + tenant scope
        <TwinCanvasErrorBoundary>
          <TwinShell />              // renders <Canvas> + panel + 2D fallback
        </TwinCanvasErrorBoundary>
      </TwinDataProvider>
    </TwinStoreProvider>
  </MeridianRoute>
</Suspense>
```

- Reuses ambient providers already provided by `RunOpsLayout`: `DemoOperationsProvider`, `DemoAiProvider`, `RightDrawerProvider`, `ScenarioStoreProvider`, `AskNovaProvider`, `CommandPaletteProvider`.
- `RightDrawerProvider` is the mount point for the Context Panel — **reused**, not duplicated.
- No new global context; `TwinStoreProvider` is a thin Zustand bootstrap.

## 6. Adapters

All external data crosses **one** adapter layer so the twin never talks to Supabase or a cloud API directly.

| Adapter | Reads | Writes | Notes |
|---|---|---|---|
| `TwinTopologyAdapter` | `runops_services`, `runops_components`, `runops_dependencies`, `runops_service_owners`, `runops_teams` | none | Projects to `TwinNode` / `TwinEdge` domain types. Reuse-only. |
| `TwinHealthAdapter` | `runops_slos`, `runops_error_budgets`, `runops_telemetry_snapshots`, `runops_incidents` | none | Merges into `healthState`, `incidentState`, `budgetBurn`. |
| `TwinChangeAdapter` | `runops_changes` | none | Feeds `L8-Change` layer + change-window prisms. |
| `TwinRunbookAdapter` | `runops_runbooks`, `runops_runbook_certifications`, `runops_executions` | via existing RPCs | Context Panel "Runbooks" tab; write path already exists (`runops_approve_execution`, etc.). |
| `TwinPresentationAdapter` | `runops_services.metadata.presentation` | update `metadata` only | Cue authoring lands in `metadata` JSON — no schema change. |
| `TwinCloudConnectorAdapter` | `runops_connectors` | none | Runtime CI enrichment via Edge Functions (Azure Resource Graph) — **future**, gated by `meridianTwin.mode = "live"`. |

Adapters live in `src/features/meridian/adapters/*` and export pure functions returning `TwinNode[] / TwinEdge[] / TwinOverlay[]`. No JSX in adapters.

## 7. Shared Components

**Reused as-is (no fork):**
- shadcn primitives: `Sheet`, `Tabs`, `Badge`, `Button`, `Card`, `Tooltip`, `Command`, `Toast`.
- `RunOpsErrorBoundary`, `RunOpsRightDrawer`, `CommandPalette`, `AskNovaPanel`, `SimulationBadge`, `DemoControllerDrawer`.
- Route registry `src/runops/shell/routes.ts`.
- Tenant scope + auth guards: `ProtectedRoute`, `TenantAccessGuard`.
- 3D helpers already in `@react-three/drei@9.122`.

**New, Meridian-only (folder-isolated):**
- `TwinCanvas`, `TwinScene`, `TwinCameraRig`, `TwinLayers`, `TwinNodesInstanced`, `TwinEdges`, `TwinServiceHulls`, `TwinCartouche`, `TwinLegend`, `TwinLayerRail`, `TwinLodBadge`, `TwinPresentBar`, `Twin2DGraph` (ReactFlow), `TwinContextPanel` (mounted into `RightDrawerProvider`).

## 8. Database Reuse

Per prior Backend Reuse Matrix — **no schema migration required for MVP**.

| Capability | Table | Classification |
|---|---|---|
| Services / hulls | `runops_services` | Reuse (put Meridian tags in `metadata`) |
| CIs / glyphs | `runops_components` | Extend data-only (new `kind` enum values require an additive enum migration — deferred until Meridian ingestion needs them) |
| Edges | `runops_dependencies` | Reuse |
| Ownership | `runops_service_owners`, `runops_teams` | Reuse |
| Health/SLOs | `runops_slos`, `runops_error_budgets`, `runops_telemetry_snapshots` | Reuse |
| Incidents / halos | `runops_incidents`, `runops_incident_events` | Reuse |
| Changes | `runops_changes` | Reuse |
| Runbooks (Context Panel) | `runops_runbooks`, `_versions`, `_certifications`, `_executions` | Reuse |
| Presentation cues | `runops_services.metadata->'presentation'->'cues'` | Reuse (JSON extension) |
| CI-class registry (optional) | `runops_ci_classes` | **Deferred** — only if hard-coded taxonomy proves insufficient |
| Component-to-component edges (optional) | `runops_component_edges` | **Deferred** — start with `runops_dependencies` |

**Deferred migrations** are scheduled but not part of MVP. When needed, each must include GRANTs + tenant-scoped RLS per project rules.

## 9. Authentication Reuse

- 100% reuse of Supabase Auth flow already wired via `AuthContext` + `ProtectedRoute`.
- Route `/runops/twin/*` wrapped in `<ProtectedRoute><TenantAccessGuard>…</TenantAccessGuard></ProtectedRoute>` — same pattern as every other RunOps route.
- Anonymous users: 302 to existing `/auth/login`.
- Unapproved users: existing `PendingApproval` page (unchanged).
- Presentation mode without an active session: falls back to the demo tenant (`tenant-contoso`) when `meridianTwin.mode = "demo"`, otherwise blocks with existing `NoAccess` page.

## 10. Authorization Reuse

Reuses the two-layer model — no new roles.

| Action | Gate |
|---|---|
| View twin | `runops_has_tenant_access(tenant_id)` |
| Toggle layers / change LOD / lasso / present | tenant access only |
| "Attach runbook" from Context Panel | `runops_can_write(tenant_id)` + `runbook_author`/`service_owner` |
| "Open incident" from a node | `runops_can_write` + `incident_commander`/`sre_engineer` |
| "Simulate failure" (scenario) | `runops_has_role(tenant_id, 'demo_controller')` |
| Author presentation cues | `runops_can_write` + `demo_controller` |
| Live ingestion via `TwinCloudConnectorAdapter` | `platform_engineer` (Edge Function bearer) |

All checks routed through existing SECURITY DEFINER helpers (`runops_has_tenant_access`, `runops_can_write`, `runops_has_role`, `runops_has_any_role`). Frontend never reads roles directly — it lets RLS + RPC responses drive UI affordances.

## 11. Performance

Concrete budgets and gates (numbers align with §10 of the architectural spec).

| Metric | Budget | Enforcement |
|---|---|---|
| Route chunk size (`meridian-*.js`) | ≤ 350 KB gzip | CI `size-limit` check on `dist/assets/meridian-*` |
| Time-to-first-frame (500 visible nodes) | ≤ 1.5 s p95 | Playwright perf run in CI |
| Frame time at Service LOD | ≤ 16 ms p95 (M1) | React DevTools profile + `stats.js` check |
| Draw calls | ≤ 60 for 5k nodes | Instanced meshes + edge batching |
| Idle frame rate | 0 fps | `frameloop="demand"` on `<Canvas>` |
| Data fetch | Per subscription/RG on demand | TanStack Query, `staleTime: 60s` |
| Layout compute | Off main thread | Web worker (`twin.worker.ts`) |
| Bundle dedupe | Single `three` instance | Add `three`, `@react-three/fiber`, `@react-three/drei` to `vite.config.ts` `dedupe` |
| Above-cap protection | `nodes > maxNodes` → stub | `meridianTwin.perf.maxNodes` flag |

Regressions on any budget block the PR merge.

## 12. Testing

Layered strategy, all layers required for GA.

| Layer | Tool | Scope |
|---|---|---|
| Unit | Vitest | Adapters (topology → `TwinNode[]`), Zustand selectors, hull math, LOD selector. |
| Component | Vitest + Testing Library + jsdom | `TwinContextPanel`, `TwinLegend`, `Twin2DGraph`, keyboard nav. |
| 3D smoke | Vitest + `@react-three/test-renderer` | Scene mounts, instanced meshes attach, camera pose serialises. |
| Integration | Vitest with mocked Supabase | Tenant switch clears cache, empty tenant renders stub, RLS-forbidden query surfaces error state. |
| E2E | Playwright | Auth → land on `/runops/twin` → select service → 3D→2D toggle → keyboard walk → presentation mode step-through. |
| Perf | Playwright + `page.metrics()` | First-frame budget, frame time under 500/2k/5k node fixtures. |
| Accessibility | `@axe-core/playwright` on 2D fallback + panel; manual NVDA/VoiceOver pass on selection announcements. |
| Visual regression | Playwright screenshot compare on canvas element at fixed camera poses (deterministic thanks to seeded layout). |
| Contract | `supabase--test_edge_functions` on any new Edge Functions (deferred until live-ingest phase). |

CI matrix: Node 20 + jsdom + Chromium. Fixtures live in `src/features/meridian/fixtures/*` (three sizes: `small.json`, `medium.json`, `large.json`).

## 13. Regression Strategy

Prevents Meridian from breaking anything else.

1. **Additive-only** frontend edits: one new route, one new sidebar item, one new palette catalog entry, one Zustand store, one `dedupe` list update. No changes to existing pages.
2. **Lazy import boundary** enforced by lint: a repo-level ESLint rule forbids `import` of `src/features/meridian/*` from any file outside `src/features/meridian/` and `src/App.tsx` (the route registration). Prevents accidental bundle bloat.
3. **Bundle diff gate** in CI: `dist/assets/index-*.js` size delta must be ≤ +5 KB gzip after Meridian merges. Fails the PR otherwise.
4. **Feature flag off in prod** at merge time; enabled via env for staging QA. Prod flip after all §12 layers pass on staging for 24 h.
5. **Existing route smoke** in CI: Playwright hits `/`, `/app`, `/runops`, `/runops/services`, `/runops/incidents`, `/runops/runbooks` and asserts 200 + no console errors after Meridian merges.
6. **Tenant regression**: run `useTenantRouteEqualizer` E2E over `tenant-contoso` and `tenant-meridian` (once seeded) to confirm no dangling routes leak across tenants.
7. **RLS regression**: re-run the July-12 live verification pass (200s on `profiles`/`user_roles` for authed user, 403 on cross-tenant reads) after any adapter change.
8. **Three.js instance check** in E2E: `expect(window.__THREE__ ?? []).toHaveLength(1)` guard to catch dedupe drift.

## 14. Rollback Strategy

Every artefact is reversible without a migration or a data restore.

| Change | Rollback |
|---|---|
| New lazy route + Suspense wrapper | Remove the `<Route>` entry in `App.tsx`; the chunk is orphaned and stops being served. Zero user impact. |
| Sidebar + palette entries | Guarded by `meridianTwin.enabled`; flip flag to `false` to hide instantly. |
| `vite.config.ts` `dedupe` additions | Additive; safe to revert. Only affects bundling. |
| `useTenantRouteEqualizer` new `check()` entries | Additive; safe to revert. |
| `runops_services.metadata.presentation` writes | `UPDATE runops_services SET metadata = metadata - 'presentation' WHERE tenant_id = …` — reversible per-tenant. |
| Any deferred enum additions (CI classes) | **Forward-only**; guarded by not shipping until absolutely required. Compensating cleanup migration must be authored *before* the enum lands. |
| Deferred new tables (`runops_ci_classes`, `runops_component_edges`) | Only added if MVP proves insufficient; each ships with a paired down-migration in the plan (drop policy → revoke grants → drop table). |
| Feature-flag flip | Instant rollback via env; no redeploy required. |
| Presentation mode | Independently flag-gated (`meridianTwin.presentation`); can be disabled without disabling the twin. |
| Fixture drift | Fixtures under `src/features/meridian/fixtures` are versioned; roll back by reverting the file. |

**Kill-switch:** flipping `meridianTwin.enabled=false` in env hides the route from the router (`ProtectedRoute` returns to `/runops`), removes the nav entry, and drops the palette actions — full rollback in < 60 s with no rebuild.

---

## Delivery Phasing (for reference — not a build order approval)

1. **Phase 0 — Foundation (no user-visible change):** `vite.config.ts` dedupe additions, feature flag stubs, folder scaffold, route registered behind `meridianTwin.enabled=false`.
2. **Phase 1 — Static twin:** demo-mode fixtures, glyphs, hulls, LOD 3/4, Context Panel skeleton, 2D fallback.
3. **Phase 2 — Live data:** adapters wired to `runops_*` tables, TanStack Query pagination, tenant switch.
4. **Phase 3 — Interactivity:** selection, keyboard nav, lasso, layer rail, presentation cues (author + play).
5. **Phase 4 — Performance & a11y hardening:** perf budgets, axe pass, NVDA/VoiceOver pass, visual regression baselines.
6. **Phase 5 — GA:** flag flip on prod after 24 h clean staging.

Each phase is independently mergeable, each ends with a green regression suite, and each is rollback-safe under §14.

---

**Deliverable:** integration plan / implementation roadmap only. No code, migration, dependency, or route changes performed. Awaiting per-phase approval before any subsequent build-mode work.
