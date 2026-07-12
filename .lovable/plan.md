# Three.js & Bundle Isolation Audit — Neugain.io

**Scope:** Read-only. No files modified. Assessment only.
**Verdict:** **CONDITIONAL GO** — one blocking bundle issue, two high-priority isolation gaps, otherwise healthy.

---

## 1. Dependency Baseline

| Package | Installed | React-18 compat | Notes |
|---|---|---|---|
| `three` | ^0.160.0 | ✅ | Well within R3F v8 support window |
| `@react-three/fiber` | ^8.18.0 | ✅ | Correct major (v9 requires React 19) |
| `@react-three/drei` | ^9.122.0 | ✅ | Correct major (v10 requires R3F v9) |
| `@types/three` | ^0.184.1 | ⚠️ | **Types drift**: types are 24 minor versions ahead of runtime (`0.184` vs `0.160`). Non-blocking but expect surface-level TS mismatches on newer drei helpers. |

Version pinning matches project knowledge constraints. No conflicting `three` copies detected in the surfaced tree.

---

## 2. Three.js Consumer Inventory

Nine files import `three` or `@react-three/*`:

```text
src/features/foc-twin/DigitalTwinViewport.tsx        (FOC twin — canonical, well-isolated)
src/features/foc-twin/scene/SceneObjects.tsx
src/features/foc-twin/scene/CameraController.tsx
src/pages/semiconductor/_DigitalTwinScene.tsx        (semiconductor chamber scene)
src/pages/semiconductor/CommandCenter.tsx
src/pages/sead/EquipmentHealthIntelligence.tsx
src/pages/prod-twin/AWSResilienceArchitectureTwin.tsx
src/pages/data-orchestration-twin/ScheduleBuilder.tsx
src/pages/data-orchestration-twin/DataDogLogProfile.tsx
```

Observation: only **one** consumer (`foc-twin`) lives under `src/features/*` with a proper `scene/` + `store.ts` + `Overlays.tsx` split. The other eight are inline inside page files under `src/pages/**`, mixing route shell + 3D scene in a single module.

---

## 3. Bundle Isolation Findings

### 🔴 BLOCKING — B1. No route-level code splitting for 3D pages

`src/App.tsx` imports every semiconductor / prod-twin / sead / data-orchestration page **statically** (lines 26–56 sampled). There is **zero `React.lazy(...)` usage anywhere in `src/App.tsx` or `src/runops/`**. Consequence: `three` + `@react-three/fiber` + `@react-three/drei` (~500–600 KB gzipped combined) ship in the **main entry chunk** and load on `/`, `/auth`, `/landing`, and every non-3D route.

- **Likelihood:** Certain (already true today)
- **Impact:** High — LCP penalty on marketing/landing routes; violates the "Meridian ≤ +5KB gzip delta" gate declared in the readiness plan (baseline is already inflated)
- **Mitigation:** Wrap all `pages/semiconductor/*`, `pages/prod-twin/*`, `pages/sead/EquipmentHealthIntelligence`, `pages/data-orchestration-twin/*`, and the future Meridian route in `React.lazy` + `<Suspense>`. Verify with `bun run build` chunk report that a dedicated `three` vendor chunk emerges and is absent from the entry graph.
- **Blocking?** **Yes** — must be resolved (or explicitly deferred with sign-off) before Meridian ships another 3D surface.

### 🟠 HIGH — B2. `three` and `@react-three/*` missing from Vite `dedupe`

`vite.config.ts` `resolve.dedupe` includes `react`, `react-dom`, `@tanstack/*`, `d3-*` — but **not** `three`, `@react-three/fiber`, or `@react-three/drei`. If any transitive dep (e.g. a drei helper, a future glTF loader plugin) pulls its own `three`, R3F's `THREE.Object3D instanceof` checks silently break and you get invisible geometry / "R3F: Div is not part of the THREE namespace" runtime errors.

- **Likelihood:** Medium (Meridian will add new 3D deps)
- **Impact:** High — hard-to-diagnose runtime breakage, not caught by TS
- **Mitigation:** Add `"three"`, `"@react-three/fiber"`, `"@react-three/drei"` to `resolve.dedupe`. This is called out in the Meridian readiness plan as Phase 0 action — audit confirms it is **still outstanding**.
- **Blocking?** Yes for Meridian; not blocking for existing state.

### 🟠 HIGH — B3. `<Canvas>` inside statically-imported page modules

Even after B1 is fixed at the route boundary, `_DigitalTwinScene.tsx`, `CommandCenter.tsx`, `EquipmentHealthIntelligence.tsx`, etc. import `Canvas` at the top level. If any of these modules are re-exported from an index barrel, or referenced from a shared component, `three` re-enters the main graph. No barrel re-exports were found in the sample, but there is no lint rule preventing it.

- **Likelihood:** Medium
- **Impact:** Medium — silently undoes B1
- **Mitigation:** ESLint `no-restricted-imports` rule: outside `src/features/foc-twin/**` and `src/pages/{semiconductor,prod-twin,sead,data-orchestration-twin,meridian}/**`, forbid `three`, `@react-three/fiber`, `@react-three/drei`. This is the "ESLint boundaries" Phase 0 action from the readiness plan — audit confirms `eslint.config.js` currently has **no** `no-restricted-imports`, `import/no-restricted-paths`, or boundary rules.
- **Blocking?** Conditional — required to keep B1's win from regressing.

---

## 4. Runtime & Memory Hygiene

Sampled `src/features/foc-twin/DigitalTwinViewport.tsx`:

- ✅ Uses `AdaptiveDpr`, `AdaptiveEvents`, `BakeShadows`, capped `dpr={[1, 1.75]}`, bounded `shadow-mapSize`
- ✅ `Suspense` fallback wraps scene
- ✅ Store-driven camera reset; no obvious leaked `requestAnimationFrame`
- ⚠️ No explicit `dispose()` on unmount / tenant switch — R3F auto-disposes geometry/materials it created, but manually-authored `THREE.Vector3` instances in event handlers (`onZoom`) are fine (stack-allocated). **Custom textures / GLTF assets** (not present today, but likely in Meridian) will need explicit `useEffect` cleanup.
- ⚠️ `_DigitalTwinScene.tsx` uses `<Float>` + always-on `useFrame` animations even when off-screen. No `frameloop="demand"` fallback. Battery/CPU cost on background tabs.

Recommendation: adopt `frameloop="demand"` + `invalidate()` on interaction for scenes without continuous animation, and formalise a per-viewport disposal hook before Meridian adds a fifth `<Canvas>`.

---

## 5. Bundle Risk Register

| ID | Risk | Likelihood | Impact | Blocking |
|---|---|---|---|---|
| B1 | Three.js in main chunk (no lazy routes) | Certain | High | **Yes** |
| B2 | Missing Vite `dedupe` for three/R3F/drei | Medium | High | Yes for Meridian |
| B3 | No ESLint boundary preventing 3D imports leaking | Medium | Medium | Conditional |
| B4 | `@types/three` 24 minors ahead of runtime | Certain | Low | No |
| B5 | Always-on `useFrame` in idle scenes | Medium | Low–Med | No |
| B6 | Multiple `<Canvas>` if user opens two 3D routes in tabs — WebGL context limit (~16) | Low | Medium | No |

---

## 6. Recommendation

**CONDITIONAL GO** for the current state; **NO GO for adding Meridian's `<Canvas>`** until B1 + B2 are resolved.

Remaining required actions (all read-only until build-mode approval):

1. Introduce `React.lazy` for all `/semiconductor/*`, `/prod-twin/*`, `/sead/equipment-health-intelligence`, `/data-orchestration-twin/*` routes in `src/App.tsx`.
2. Add `three`, `@react-three/fiber`, `@react-three/drei` to `vite.config.ts` `resolve.dedupe`.
3. Add ESLint `no-restricted-imports` boundary confining 3D deps to the allow-listed feature folders.
4. Add a `bun run build` chunk-size CI gate that fails if `three` appears in the entry chunk.
5. (Nice-to-have) Align `@types/three` to a version ≤ runtime `three` (`^0.160`).
6. (Nice-to-have) Convert idle 3D scenes to `frameloop="demand"`.

No code, config, or schema changes have been made. Awaiting approval to switch to build mode to execute items 1–4.
