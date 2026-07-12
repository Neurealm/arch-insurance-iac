# Meridian Build Status — Three.js Bundle Isolation

Assessment date: 2026-07-12.

## Changed files

| File | Reason | Scope | Backward-compatible |
|---|---|---|---|
| `src/App.tsx` | Convert `SemiDigitalTwin` and `SeadCommandCenter` to `React.lazy`; swap `<Suspense fallback={null}>` for `<LazyRouteBoundary>`. | Shared (router root). | Yes — same paths, same guards. |
| `src/components/routing/LazyRouteBoundary.tsx` | New. Error boundary + accessible Suspense fallback for lazy routes. | Shared (new). | Additive. |
| `eslint.config.js` | Unchanged this pass (already contained the `no-restricted-imports` rule). | — | — |
| `vite.config.ts` | Unchanged this pass (dedupe already in place). | — | — |

No unrelated files were modified.

## Lint delta

- Modified/new files (`src/App.tsx`, `src/components/routing/LazyRouteBoundary.tsx`, `vite.config.ts`, `eslint.config.js`): **0 errors, 0 warnings.**
- Repository total: **899 problems (791 errors, 108 warnings)** — unchanged pre-existing baseline (Supabase edge-function `any`, `tailwind.config.ts` `require()`, etc.). This pass introduced **0 new lint findings**.

## Build measurements

See `meridian-bundle-baseline.md`.

Summary:
- Total emitted JS ≈ 13.85 MB raw (11.68 MB is the eager entry; 0.80 MB is the shared 3D vendor chunk; ~1.4 MB across other route chunks).
- **`three` / R3F / drei are entirely contained in `OrbitControls-*.js`** (817 KB raw / 220 KB gzip).
- **Zero Three.js symbols (`WebGLRenderer`, `isBufferGeometry`) in the entry.**
- **Single bundled Three.js runtime** (grep for `WebGLRenderer` → 43 occurrences in one chunk, 0 elsewhere).

## Runtime route verification

**Not executed in this pass.** Playwright/browser sweep across `/`, `/runops`, CMDB, Business Services, and each of the 7 3D routes was not performed. Static bundle evidence establishes that the 3D vendor chunk is not statically referenced by the entry, but runtime confirmation (that non-3D routes issue no request for `OrbitControls-*.js`, that Canvas mounts cleanly on each 3D route, that no duplicate-THREE warning appears) remains **UNKNOWN**.

## Visual regression

**Not executed.** No snapshot baseline exists in the repo. Screenshots for `SemiCommandCenter`, `SemiDigitalTwin`, `SeadCommandCenter`, and one additional 3D route were not captured.

## Final verdict

**PARTIAL PASS.**

Static analysis and production build confirm:
- All 7 Three.js-touching routes are lazy.
- Single Three.js runtime in the emitted bundle.
- Entry chunk contains zero Three.js code.
- Visible Suspense fallback + route-scoped error boundary in place, auth/tenant guards ordered correctly.
- Zero lint regressions.

Remaining before an unconditional PASS:
1. Playwright runtime sweep of all 4 non-3D routes and all 7 3D routes.
2. Visual-regression capture against a persisted baseline.
3. Follow-up entry code-split (entry is 11.68 MB / 2.73 MB gzip — a Meridian-independent perf issue).
