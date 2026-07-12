# Meridian Runtime Test Baseline — Three.js Bundle Isolation

Date: 2026-07-12. Build: local `bun run build` (Vite 5, prod). Served via `vite preview` on `http://127.0.0.1:4173`. Browser: Playwright-bundled Chromium (headless). Viewport: 1280×1800.

## Environment constraint

`LOVABLE_BROWSER_AUTH_STATUS=external_unmanaged`. The project uses a BYO Supabase instance the sandbox cannot mint a session for. Per sandbox policy, credentials must not be requested. **Every route behind `ProtectedRoute` was reachable only up to its `/login` redirect** — the authenticated interior (Canvas mount, camera controls, selection, WebGL context, in-app navigation) could not be exercised from this environment.

## Runtime probe results (production preview)

For each URL the browser was launched fresh, navigated directly, awaited `networkidle`, and every `.js` request recorded.

| Route | Final URL | HTTP | JS requests | `OrbitControls*` requests | Console errors | Page errors |
|---|---|---|---|---|---|---|
| `/` (Landing) | `/` | 200 | 1 (entry only) | 0 | 0 | 0 |
| `/login` | `/login` | 200 | 1 | 0 | 0 | 0 |
| `/signup` | `/signup` | 200 | 1 | 0 | 0 | 0 |
| `/forgot-password` | `/forgot-password` | 200 | 1 | 0 | 0 | 0 |
| `/runops` | redirect → `/login` | 200 | 1 | 0 | 0 | 0 |
| `/app` | redirect → `/login` | 200 | 1 | 0 | 0 | 0 |
| `/semiconductor/command-center` | redirect → `/login` | 200 | 1 | 0 | 0 | 0 |
| `/semiconductor/digital-twin` | redirect → `/login` | 200 | 1 | 0 | 0 | 0 |
| `/sead/command-center` | redirect → `/login` | 200 | 1 | 0 | 0 | 0 |
| `/sead/equipment-health-intelligence` | redirect → `/login` | 200 | 1 | 0 | 0 | 0 |

Interpretation: on every public/redirected surface the browser fetches exactly the entry chunk (`index-*.js`). The 3D vendor chunk (`OrbitControls-*.js`) is never a static dependency of the initial navigation. This corroborates the static-analysis finding that Three.js is only reachable through a lazy dynamic import.

## Items that could NOT be verified in this environment

Authenticated interior of 7 lazy 3D routes and any non-3D authenticated route (CMDB, Business Services, Incidents, Runbooks, Settings, RunOps landing). All of the following remain UNKNOWN under this sandbox:

1. Accessible loading fallback on chunk resolution.
2. Post-mount Canvas presence and camera controls.
3. Selection interactions on 3D routes.
4. WebGL error surface, duplicate-THREE warning, React Suspense warning at runtime.
5. Refresh / back / forward navigation with an authenticated session.
6. LazyRouteBoundary chunk-load failure surface exercised end-to-end.
7. Visual regression against `SemiCommandCenter`, `SemiDigitalTwin`, `SeadCommandCenter`, one additional 3D route.

These are not defects — they are gated by the external Supabase session that this sandbox is not permitted to mint or request credentials for.

## Lint baseline reconciliation

- Command: `bunx eslint . --max-warnings=0` over the full repo.
- Previous readiness report cited **791 errors**; current run reports **899 problems (791 errors + 108 warnings)** — the same 791 errors, plus 108 warnings that the earlier count excluded. The delta is a reporting change, not a regression.
- Files modified in this workstream (`src/App.tsx`, `src/components/routing/LazyRouteBoundary.tsx`, `vite.config.ts`, `eslint.config.js`): **0 errors, 0 warnings**.
- Authoritative rule going forward:
  1. New/modified Meridian files MUST report 0 errors and 0 warnings.
  2. Total repository problems MUST NOT exceed 899 without an explicit follow-up ticket.
  3. Generated files remain out of scope; no broad rewrites.

## Consolidated findings

| Category | Count (public + redirect surface) | Classification |
|---|---|---|
| Console errors | 0 | — |
| Console warnings | 0 | — |
| Failed requests | 0 | — |
| Chunk-load failures | 0 | — |
| Auth failures | 0 (redirects behave correctly) | — |
| Tenant failures | 0 | — |
| WebGL errors | Not observable (no 3D route reached) | UNKNOWN |
| Duplicate-THREE warnings | Not observable | UNKNOWN |
| React Suspense warnings | 0 on reachable surface | — |
| Error-boundary activations | 0 (not triggered) | — |
