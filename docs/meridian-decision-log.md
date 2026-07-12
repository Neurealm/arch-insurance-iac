# Meridian Decision Log

## 2026-07-12 — Three.js bundle isolation (Phase 0)

### Decisions

1. **Lazy-load every route that transitively imports `three`/R3F/drei.**
   Converted routes: `SemiCommandCenter`, `SeadCommandCenter`, `SeadEquipmentHealth`, `SemiDigitalTwin`, `DataDogLogProfile`, `ScheduleBuilder`, `AWSResilienceArchitectureTwin`.

2. **New component: `src/components/routing/LazyRouteBoundary.tsx`.**
   Composite `ErrorBoundary + Suspense` wrapper. Sits **inside** `AuthProvider` but **outside** `<Routes>` so auth/tenant guards fire before any lazy component mounts. A chunk-download failure now renders a scoped surface (Retry / Go back / RunOps home) instead of blanking the shell.

3. **Suspense fallback = `<LazyRouteFallback />`** (centered `Loader2` with `role="status"`, `aria-live="polite"`, `aria-busy="true"`, `motion-safe:animate-spin`). Replaces `fallback={null}`.

4. **ESLint boundary retained.** `no-restricted-imports` confines `three`, `@react-three/fiber`, `@react-three/drei` to 6 allow-listed folders. No new files added Three.js imports outside those folders.

5. **Vite `resolve.dedupe` retained.** `three`, `@react-three/fiber`, `@react-three/drei` present.

### Rejected / deferred

- Full code-split of the 11.68 MB entry chunk — out of scope for Phase 0 isolation. Tracked as follow-up.
- Visual-regression baseline snapshots — no snapshot infrastructure exists in-repo; deferred until CI is chosen.
- Playwright end-to-end route sweep — see `meridian-build-status.md`.
