
# Frontend Architecture Inspection — Neugain.io (Pre-Sales PRD)

Read-only assessment. No files modified.

## Stack Versions (from package.json / vite.config.ts)

| Area | Version | Status |
|---|---|---|
| React / ReactDOM | 18.3.1 | PASS |
| TypeScript | 5.8.3 | PASS |
| Vite | 5.4.19 (`@vitejs/plugin-react-swc` 3.11) | PASS |
| Tailwind CSS | 3.4.17 (+ typography, animate) | PASS |
| shadcn/ui | slate baseline, `components.json` present, full Radix set | PASS |
| Zustand | 5.0.14 | PASS |
| TanStack Query | 5.83.0 | PASS |
| Framer Motion | 12.40.0 | PASS |
| Charts | Recharts 2.15.4, ReactFlow 11.11.4, d3-geo, react-simple-maps | PASS |
| Routing | react-router-dom 7.9.5 | PASS |
| 3D | three 0.160.0, @react-three/fiber 8.18, @react-three/drei 9.122 | PASS (matches Lovable R3F pinning rules) |

## Bundle & Routing Structure

- Single `src/App.tsx` (~839 lines) declares every route with **eager `import`** — no `React.lazy` / `Suspense` anywhere in `App.tsx`.
- RunOps foundation lives under `/runops/*` mounted from `src/runops/shell/RunOpsLayout.tsx` with its own nested router and providers (`DemoOperationsProvider`, `DemoAiProvider`, `ScenarioStoreProvider`, `AskNovaProvider`, `CommandPaletteProvider`).
- Existing 3D surfaces already in the bundle:
  - `src/pages/semiconductor/_DigitalTwinScene.tsx` (R3F Canvas + drei OrbitControls/Float)
  - `src/features/foc-twin/DigitalTwinViewport.tsx` + `scene/*`
  - Semiconductor pages (10 routes) eager-imported into `App.tsx`.
- Vite config: `hmr.overlay: false`, alias `@ → src`, `dedupe` for react/tanstack/d3 — no manualChunks configured, so three/drei/fiber currently ship in the main entry chunk via the semiconductor imports.

## Lazy Loading — Current State

- **None applied.** Every page is statically imported. Three.js/R3F/drei are therefore already in the initial bundle regardless of route.
- Consequence: adding a *new* Meridian 3D route with `React.lazy` will actually **reduce** initial bundle weight vs. the current semiconductor pattern, provided we don't also eager-import it from `App.tsx`.

## Meridian 3D Isolation Feasibility

Target: mount Meridian under a dedicated route (likely `/runops/services/:serviceId/twin` or a top-level `/meridian/*`) as a lazy chunk.

Isolation requirements — all satisfiable without touching existing code:

1. New route registered via `React.lazy(() => import('./pages/meridian/...'))` + `<Suspense fallback>` — additive change to `App.tsx` only.
2. All Meridian modules confined to a new folder (`src/pages/meridian/` or `src/features/meridian/`) so Vite's code-splitter emits a separate chunk.
3. Reuse existing `three@0.160`, `@react-three/fiber@8.18`, `@react-three/drei@9.122` — no version bump needed.
4. Providers (`ScenarioProvider`, RunOps providers) can be wrapped locally at the Meridian route, mirroring the semiconductor pattern.
5. Data path uses existing Supabase client + TanStack Query — no new global state.

## Dependency Conflicts — Scan Result

| Risk | Finding |
|---|---|
| React 19 mismatch | None — pinned to 18.3.1; R3F 8.x / drei 9.x are the correct pair per Lovable rules. PASS |
| react-router v7 vs v6 APIs | Project already on v7; new lazy routes use v7 semantics. PASS |
| three version drift | Single `three@0.160` resolution; `@types/three@0.184` is a types-only over-pin — no runtime impact, but worth noting. WATCH |
| Duplicate three instances | None detected; `dedupe` list does not include `three` — if a nested dep pulls a different three, R3F throws "Multiple instances of Three.js". Recommend adding `three` to `vite.config.ts` `dedupe` when the Meridian module lands. WATCH |
| TanStack Query duplication | Already deduped. PASS |
| Framer Motion 12 + React 18 | Supported. PASS |
| Zustand 5 | Compatible with React 18. PASS |
| Bundle bloat | Current build eagerly loads semiconductor 3D pages; new Meridian route must NOT be added to that eager import list. Enforce lazy. WATCH |
| `hmr.overlay: false` | Hides runtime errors during dev — Meridian dev iterations should temporarily flip to true. NOTE |

No blocking version conflicts were found.

## Category Results

| # | Category | Result |
|---|---|---|
| 1 | React 18.3.1 | PASS |
| 2 | Vite 5.4 + SWC | PASS |
| 3 | TypeScript 5.8 | PASS |
| 4 | Tailwind 3.4 | PASS |
| 5 | shadcn/ui | PASS |
| 6 | Zustand 5 | PASS |
| 7 | TanStack Query 5 | PASS |
| 8 | Framer Motion 12 | PASS |
| 9 | Charts (Recharts/ReactFlow/d3) | PASS |
| 10 | Routing (react-router 7) | PASS |
| 11 | Bundle structure | CONDITIONAL — no manualChunks; three/drei ride main entry today |
| 12 | Lazy loading | FAIL — not used anywhere; must be introduced for Meridian |

## Verdict

**CONDITIONAL GO** for isolating the Meridian 3D module into a lazy-loaded route.

Conditions to enforce at implementation time (not now, plan-mode only):

1. Introduce `React.lazy` + `Suspense` exclusively for the Meridian route; do not retrofit existing routes in the same change.
2. Confine all Meridian sources to one new folder so Vite emits a dedicated chunk.
3. Add `three` (and optionally `@react-three/fiber`, `@react-three/drei`) to `vite.config.ts` `dedupe` in the same PR to prevent "Multiple instances of Three.js".
4. Reuse the pinned R3F pair (`fiber 8.18` / `drei 9.122` / `three 0.160`) — no version bumps.
5. Do NOT import the Meridian entry from any eagerly-loaded module (sidebar, command palette catalog) — reference by route path only.
6. Wrap providers locally at the Meridian route boundary; do not hoist into `App.tsx`.
7. Verify with `vite build` output that a distinct `meridian-*.js` chunk appears and that `index-*.js` size does not grow materially.

No implementation performed. Awaiting approval before switching to build mode.
