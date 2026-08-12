# Meridian Bundle Baseline — Three.js Isolation

Date captured: 2026-07-12. Build: `bun run build` (Vite 5, mode=production).

## Resolved package versions

| Package | Declared | Resolved |
|---|---|---|
| react | ^18.3.1 | 18.3.1 |
| three | ^0.160.0 | 0.160.1 |
| @react-three/fiber | ^8.18.0 | 8.18.0 |
| @react-three/drei | ^9.122.0 | 9.122.0 |
| @types/three | ^0.184.1 | 0.184.x |

On-disk duplication: `node_modules/stats-gl/node_modules/three@0.170.0` remains a transitive nested copy. `vite.config.ts` `resolve.dedupe` includes `three`, `@react-three/fiber`, `@react-three/drei` → the emitted bundle collapses to a single runtime (see single-runtime evidence below).

## Emitted JavaScript chunks (top by raw size)

| Chunk | Raw | Gzip |
|---|---|---|
| `index-*.js` (entry) | 12,244,429 B (11.68 MB) | 2,862,947 B (2.73 MB) |
| `OrbitControls-*.js` (three + R3F + drei vendor) | 817,917 B (799 KB) | 220,099 B |
| `html2canvas.esm-*.js` | 201.42 KB | 47.70 KB |
| `index.es-*.js` | 151.05 KB | 51.46 KB |
| `AWSResilienceArchitectureTwin-*.js` | 70.57 KB | 18.28 KB |
| `CommandCenter-BLFISZiX.js` (Sead) | 54.79 KB | 16.09 KB |
| `Environment-*.js` (drei) | 53.42 KB | 18.98 KB |
| `ScheduleBuilder-*.js` | 47.38 KB | 12.99 KB |
| `CommandCenter-CWbw8MIj.js` (Semi) | 47.37 KB | 13.05 KB |
| `DigitalTwin-*.js` (Semi) | 42.99 KB | 11.90 KB |

3D-adjacent chunks: `OrbitControls-*.js`, `Environment-*.js`, `RoundedBox-*.js`, `Float-*.js`, `Html-*.js`, `DigitalTwinViewport-*.js`, `_DigitalTwinScene-*.js`, plus the 7 lazy route chunks.

## 3D chunk isolation

- `WebGLRenderer` symbol count per chunk: **43 in `OrbitControls-*.js`, 0 in the entry, 0 anywhere else**.
- `isBufferGeometry` symbol count per chunk: **2 in `OrbitControls-*.js`, 0 elsewhere**.
- `REVISION` in the entry is `"PROTECT.REVISIONS"` (spreadsheet library string constant), not the Three.js `REVISION` export.
- Three.js `REVISION:` export appears **only in `OrbitControls-*.js`**.

Conclusion: **exactly one bundled Three.js runtime**, located in the shared vendor chunk that only the 7 lazy 3D routes import.

## Initial-entry preload behaviour

Because the 3D routes are `React.lazy()`, Rollup emits them as async chunks. `dist/index.html` `<link rel="modulepreload">` set is bounded to `index-*.js` + its static dependencies. `OrbitControls-*.js` is **not** in the entry's static import graph (grep of `dist/assets/index-*.js` for `OrbitControls` returns no dynamic-import specifier tied to the initial navigation — it is fetched only when a lazy 3D chunk actually resolves).

## Known limitations / follow-ups

- **Entry chunk is still 11.68 MB / 2.73 MB gzip** — dominated by eager non-3D route imports (CRM, carveout, healthcare, practice-library dashboards). This is orthogonal to Three.js isolation but should be addressed in a follow-up code-split pass before Meridian ships.
- **Runtime Playwright verification not executed in this pass** (see `meridian-build-status.md`).
