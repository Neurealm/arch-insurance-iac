# Three.js Bundle-Isolation Verification — Evidence-Only Readout

Read-only assessment. No files, config, deps, or artifacts changed. Production build was **not** executed (state-changing action, not permitted in plan mode without approval), so bundle-size items are marked UNKNOWN with an explicit reason.

---

## 1. Dependency Resolution

Evidence: `node_modules/<pkg>/package.json` (installed/resolved), `package.json` (declared), `find node_modules -path '*/three/package.json'`.

| Package | Declared | Resolved |
|---|---|---|
| react | ^18.3.1 | **18.3.1** |
| three | ^0.160.0 | **0.160.1** |
| @react-three/fiber | ^8.18.0 | **8.18.0** |
| @react-three/drei | ^9.122.0 | **9.122.0** |
| @types/three | ^0.184.1 | 0.184.x (24 minors ahead of runtime) |

**Single-runtime check:** ❌ **NOT single-copy on disk.** Two `three` package.json files exist:

- `node_modules/three/package.json` → `three@0.160.1` (top-level, app-facing)
- `node_modules/stats-gl/node_modules/three/package.json` → `three@0.170.0` (nested, drei transitive)

`node_modules/maath/three/` and `node_modules/@react-spring/three/` are **subpath entries / distinct packages**, not nested `three` copies (name field is `@react-spring/three` / not a real `three` package).

`vite.config.ts` `resolve.dedupe` now includes `"three"`, `"@react-three/fiber"`, `"@react-three/drei"` (lines 22), which **collapses the stats-gl nested copy to the top-level `three@0.160.1` at bundle time**. This is the correct mitigation, but on-disk duplication remains and must be re-verified in the emitted bundle.

## 2. Production Bundle — **UNKNOWN**

Not executed. Plan mode forbids state-changing commands, and running `bun run build` writes to `dist/`. No prior build artifact is checked in.

Cannot report: total JS output, entry raw/gzip size, largest chunks, `three`/R3F/drei chunk names & sizes, or whether these are fetched on `/`, `/runops`, CMDB, Business Services routes. **Requires build-mode approval to run `bun run build` and inspect `dist/assets/*.js` and the Rollup output report.**

## 3. Lazy Route Verification — **PARTIAL / UNKNOWN**

**Static evidence (from `src/App.tsx`):**

| Route symbol | Line | Lazy? |
|---|---|---|
| SemiCommandCenter | 27 | ✅ `lazy(() => import(...))` |
| SeadEquipmentHealth | 29 | ✅ lazy |
| DataDogLogProfile | 274 | ✅ lazy |
| ScheduleBuilder | 284 | ✅ lazy |
| AWSResilienceArchitectureTwin | 307 | ✅ lazy |
| **SemiDigitalTwin** | 48 | ❌ **STATIC `import`** — regresses B1 |
| **SeadCommandCenter** | 28 | ❌ **STATIC `import`** — regresses B1 |

`SemiDigitalTwin` (`src/pages/semiconductor/DigitalTwin.tsx`) and `SeadCommandCenter` (`src/pages/sead/CommandCenter.tsx`) are not in the lazy set. If either transitively imports `three`/R3F/drei (their sibling pages do), the vendor chunk re-enters the entry graph and defeats the isolation.

Runtime navigation results (loading state, final render, back/forward/refresh, network 4xx on chunks) require a live browser session against the built bundle — **UNKNOWN** without build + Playwright.

## 4. Suspense & Error Boundaries

- Suspense wrap: **`src/App.tsx` line 407 (`<Suspense fallback={null}>`) → 835 (`</Suspense>`)**, wrapping `<Routes>`.
- `fallback={null}` means **no visible loading state** during chunk fetch. Shell (AppShell, RunOpsLayout) sits **outside** `<Routes>` for RunOps? Actually RunOps shell is rendered via `<Route element={<RunOpsLayout>...}>` and therefore lives **inside** Suspense — during a lazy child fetch the RunOps shell stays mounted (outlet is what suspends), so shell visibility during load: ✅ preserved for nested routes; ❓ top-level lazy routes render blank until chunk arrives.
- `ProtectedRoute` (line 76 import; wraps every lazy route at lines 419, 479, 480, …) runs **before** the lazy component mounts — auth/tenant guards remain active.
- `RunOpsErrorBoundary` exists (`src/runops/shell/RunOpsErrorBoundary.tsx`) but is **not visibly wired around `<Suspense>` in `App.tsx`** — a lazy-import failure (network drop of a chunk) will bubble to React's default and blank the tree unless an outer boundary catches it. **This is a gap.**

## 5. Existing 3D Regression — **UNKNOWN**

No runtime navigation performed. Static code (`_DigitalTwinScene.tsx`, `DigitalTwinViewport.tsx`) is unchanged by this work, so no source-level regression is expected, but Canvas/controls/materials/WebGL/duplicate-THREE warnings require a live check.

## 6. ESLint Boundary

Rule: `no-restricted-imports` (`eslint.config.js` lines 30–43).

Restricted specifiers: `three`, `@react-three/fiber`, `@react-three/drei` + patterns `three/*`, `@react-three/fiber/*`, `@react-three/drei/*`.

Approved folders (`ignores`):
- `src/features/foc-twin/**`
- `src/pages/semiconductor/**`
- `src/pages/prod-twin/**`
- `src/pages/sead/EquipmentHealthIntelligence.tsx`
- `src/pages/data-orchestration-twin/**`
- `src/features/meridian/**`

**Coverage gaps vs. actual importers audited previously:**
- `src/pages/sead/EquipmentHealthIntelligence.tsx` is allow-listed, but **other sead files that import three** (if any beyond the audited one) are not covered by `src/pages/sead/**`.
- No allow-list entry for `src/features/semiconductor/**` — currently no `three` imports there, safe.

Lint counts (before / after / delta): **UNKNOWN** — plan mode cannot run `bun run lint`.

## 7. Changed Files (per prior turns)

| File | Change |
|---|---|
| `vite.config.ts` | Added `three`, `@react-three/fiber`, `@react-three/drei` to `resolve.dedupe`. |
| `eslint.config.js` | Added `no-restricted-imports` block confining 3D deps to 6 allow-listed folders. |
| `src/App.tsx` | Imported `lazy`, `Suspense`; converted 5 routes to `lazy(...)`; wrapped `<Routes>` in `<Suspense fallback={null}>`. |
| `.lovable/plan.md` | Audit report (docs only). |

---

## Final Table

| Item | Status |
|---|---|
| Dependency versions | **PASS** |
| Single Three.js runtime | **PARTIAL PASS** (nested `three@0.170.0` in `stats-gl` on disk; dedupe collapses at bundle time — unverified) |
| Vite dedupe | **PASS** |
| Production build | **UNKNOWN** (not run) |
| Initial-route bundle isolation | **UNKNOWN** |
| Non-3D route behavior | **UNKNOWN** |
| Lazy 3D routes | **PARTIAL PASS** (5/7 lazy; `SemiDigitalTwin` & `SeadCommandCenter` still static) |
| Direct links | **UNKNOWN** |
| Suspense isolation | **PARTIAL PASS** (`fallback={null}`; top-level lazy routes render blank on slow chunk) |
| Error boundaries | **PARTIAL PASS** (`ProtectedRoute` intact; no outer boundary wraps `<Suspense>` — a chunk-load failure will blank the app) |
| Existing 3D rendering | **UNKNOWN** |
| Console | **UNKNOWN** |
| Network | **UNKNOWN** |
| ESLint boundary | **PASS** (rule present, patterns correct, allow-list matches audited importers) |
| Lint baseline | **UNKNOWN** (not run) |

---

## Verdict

**PARTIAL PASS — Bundle isolation is not fully verified.**

Remaining required evidence / corrections:

1. **Convert `SemiDigitalTwin` (App.tsx line 48) and `SeadCommandCenter` (App.tsx line 28) to `React.lazy`** — both are Three.js-adjacent routes and their static imports can pull the 3D vendor graph back into the entry chunk.
2. **Run `bun run build`** and capture: total JS, entry raw + gzip, top 10 chunks, and chunk name(s) containing `three` / R3F / drei. Confirm no `three*.js` chunk appears in the entry preload set.
3. **Verify at runtime** (Playwright against built bundle) that `/`, `/runops`, `/itsm/business-services`, and the CMDB page do **not** request the `three` chunk; and that each of the 7 named 3D routes fetches it on first navigation only.
4. **Add an error boundary around `<Suspense>`** (or reuse `RunOpsErrorBoundary` at the App level) so a failed lazy chunk import does not blank the shell.
5. **Consider a non-null Suspense fallback** (skeleton or shell placeholder) so first-paint of a lazy route is not a blank frame.
6. **Run `bun run lint`** before and after to record the baseline delta.
7. **Confirm the emitted bundle contains only one `three` runtime** (grep `dist/assets/*.js` for `REVISION` marker) — resolves the on-disk `stats-gl` nested copy question.

Once items 1–6 are completed and item 7 confirmed, this can be re-run for a PASS.
