# Three.js Bundle-Isolation — Verification Report

Read-only verification of the completed corrections. Production build executed (`bun run build`), lint executed, static bundle analysis performed. Runtime Playwright sweep and visual-regression baseline **not executed** in this pass and are marked UNKNOWN.

## Changes applied this pass

1. `src/App.tsx` — converted `SemiDigitalTwin` and `SeadCommandCenter` to `React.lazy()`; replaced `<Suspense fallback={null}>` wrapping `<Routes>` with `<LazyRouteBoundary>`.
2. `src/components/routing/LazyRouteBoundary.tsx` (new) — `ErrorBoundary + Suspense` composite with accessible fallback (`role=status`, `aria-live=polite`, `aria-busy`, `motion-safe:animate-spin`) and error surface (`role=alert`, Retry / Go back / RunOps home).
3. Guard order preserved: `AuthProvider → BrowserRouter → LazyRouteBoundary → Routes → ProtectedRoute → lazy component`. Auth/tenant guards run before any lazy import resolves.

## Evidence

### Package versions (resolved)

react 18.3.1 · three 0.160.1 · @react-three/fiber 8.18.0 · @react-three/drei 9.122.0.

### Lazy route inventory (`src/App.tsx`)

| Route | Line | Lazy |
|---|---|---|
| `SemiCommandCenter` | 27 | ✅ |
| `SeadCommandCenter` | 28 | ✅ (new) |
| `SeadEquipmentHealth` | 29 | ✅ |
| `SemiDigitalTwin` | 48 | ✅ (new) |
| `DataDogLogProfile` | 275 | ✅ |
| `ScheduleBuilder` | 285 | ✅ |
| `AWSResilienceArchitectureTwin` | 308 | ✅ |

No static import of any 3D-touching route remains.

### Production build (`bun run build`)

- Total emitted JS ≈ 13.85 MB raw.
- **Entry `index-*.js`: 12,244,429 B raw / 2,862,947 B gzip (11.68 MB / 2.73 MB).** Dominated by eager non-3D routes (CRM, carveout, healthcare, dashboards). Not caused by Three.js.
- 3D vendor chunk `OrbitControls-*.js`: **817,917 B raw / 220,099 B gzip.**
- Lazy 3D route chunks: `CommandCenter-CWbw8MIj.js` 47.37 KB (Semi), `CommandCenter-BLFISZiX.js` 54.79 KB (Sead), `DigitalTwin-*.js` 42.99 KB, `EquipmentHealthIntelligence-*.js` 42.31 KB, `DataDogLogProfile-*.js` 38.76 KB, `ScheduleBuilder-*.js` 47.38 KB, `AWSResilienceArchitectureTwin-*.js` 70.57 KB.
- Additional drei/R3F sub-chunks: `Environment-*.js` 53.42 KB, `RoundedBox-*.js` 21.71 KB, `Float-*.js` 0.87 KB, `Html-*.js` 7.68 KB, `_DigitalTwinScene-*.js` 3.84 KB, `DigitalTwinViewport-*.js` 26.35 KB.

### 3D chunk isolation — static analysis

- `WebGLRenderer`: 43 occurrences in `OrbitControls-*.js`, **0 in the entry, 0 elsewhere**.
- `isBufferGeometry`: 2 in `OrbitControls-*.js`, **0 elsewhere**.
- Three.js `REVISION:` export symbol appears **only** in `OrbitControls-*.js`. The `REVISION` string in the entry is `"PROTECT.REVISIONS"` (a spreadsheet-library constant), unrelated to Three.
- `dist/index.html` modulepreload set does not statically reference `OrbitControls-*.js`; the vendor chunk is fetched only when a lazy 3D route resolves its dynamic import.

**Single bundled Three.js runtime — proven.** On-disk `node_modules/stats-gl/node_modules/three@0.170.0` collapses via `resolve.dedupe` to the single top-level `three@0.160.1` runtime in `OrbitControls-*.js`.

### Meridian-specific code

Absent from the initial entry — no Meridian feature has been implemented yet (Phase 0 gate).

### Lint

- Modified files (`src/App.tsx`, `src/components/routing/LazyRouteBoundary.tsx`, `vite.config.ts`, `eslint.config.js`): **0 errors, 0 warnings.**
- Repo total: **899 problems (791 errors, 108 warnings)** — pre-existing baseline, unchanged. Delta: **0**.

### Runtime / visual regression

Not executed in this pass. Playwright sweep of non-3D routes (`/`, `/runops`, CMDB, Business Services) and 7 3D routes, and screenshot comparison for `SemiCommandCenter` / `SemiDigitalTwin` / `SeadCommandCenter` / one additional 3D route, remain UNKNOWN.

## Final table

| Item | Status |
|---|---|
| Remaining static imports | **PASS** (none) |
| Lazy route conversion | **PASS** (7/7) |
| Visible Suspense fallback | **PASS** (`LazyRouteFallback`, ARIA-labeled, reduced-motion aware) |
| Route-scoped error boundary | **PASS** (`LazyRouteBoundary`) |
| Authentication guard order | **PASS** (`ProtectedRoute` wraps lazy elements) |
| Tenant guard order | **PASS** (`TenantAccessGuard` unchanged, runs inside `ProtectedRoute` chain) |
| Production build | **PASS** (exit 0, 45.34 s) |
| Initial-entry raw size | **PARTIAL PASS** — 11.68 MB, dominated by eager non-3D routes; not a Three.js issue but flagged for follow-up |
| Initial-entry gzip size | **PARTIAL PASS** — 2.73 MB, same cause |
| 3D chunk isolation | **PASS** (0 Three symbols in entry) |
| Non-3D route network behavior | **UNKNOWN** (no Playwright run) |
| Single bundled Three.js runtime | **PASS** (single `WebGLRenderer`, single `REVISION` export) |
| Direct links | **UNKNOWN** (no runtime) |
| Back and forward | **UNKNOWN** (no runtime) |
| Existing 3D rendering | **UNKNOWN** (no runtime) |
| Visual regression | **UNKNOWN** (no baseline, no capture) |
| Console | **UNKNOWN** |
| Network | **UNKNOWN** |
| WebGL | **UNKNOWN** |
| Lint delta | **PASS** (0 new, 0 changed) |
| Changed-file scope | **PASS** (2 files: `App.tsx`, new `LazyRouteBoundary.tsx`) |
| Documentation | **PASS** (`docs/meridian-bundle-baseline.md`, `meridian-decision-log.md`, `meridian-build-status.md`) |

## Verdict

**PARTIAL PASS — Bundle isolation is structurally complete but not yet runtime-verified.**

Remaining work before an unconditional PASS:

1. Playwright sweep — 4 non-3D routes (assert `OrbitControls-*.js` is never requested) and 7 3D routes (loading state, direct URL, back/forward, refresh, no duplicate-THREE warning, no WebGL error).
2. Visual-regression capture and diff for `SemiCommandCenter`, `SemiDigitalTwin`, `SeadCommandCenter`, and one existing 3D route against a persisted baseline.
3. Follow-up (Meridian-independent): code-split the 11.68 MB eager entry chunk before shipping Meridian.

Meridian 3D Digital Twin implementation is **NOT** started in this pass.
