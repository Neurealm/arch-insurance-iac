# Fix the preview: production build is failing

## What's actually happening

The page you're on is fine. I loaded `/acquisition-onboarding-factory` against the running app and it renders completely — sidebar, KPI strip, onboarding pipeline, portfolio, maturity scorecard, all of it. The route is registered in `src/App.tsx` and the component is healthy.

The "Preview has not been built yet" screen you're seeing on **both** the preview and neugain.io is a **whole-app build failure**, not a problem with this page. Nothing will be viewable until the production build succeeds again. This is the same class of failure we hit before and patched twice with memory workarounds (Node heap raised to 12 GB, manual chunk splitting).

## Why the workarounds keep running out

`src/App.tsx` eagerly imports **541 modules** at the top of the file — essentially every page in the app. That makes one giant module graph that Rollup must hold in memory all at once. The source tree is now 86 MB across ~1,478 files, with several very large areas:

```text
src/pages/enterprise-cognitive-fabric   6.2M
src/pages/agentic-sre-noc               2.7M
src/pages/prod-twin                     2.3M
src/pages/data-orchestration-twin       1.4M
src/pages/coworkers                     1.1M
```

Raising the heap and splitting output chunks reduces the symptom but not the cause: everything is still loaded and transformed in a single pass. Every new module pushes it back over the edge.

## The fix

### 1. Confirm the failure and capture the real error

Run the production build and read the actual output. If it's an out-of-memory kill, proceed to step 2. If it's a genuine compile/import error introduced by a recent change, fix that directly instead — this step decides which path we take.

### 2. Convert routes to lazy loading

Replace the eager page imports in `src/App.tsx` with `React.lazy(() => import(...))`. The project already has the infrastructure for this: `src/components/routing/LazyRouteBoundary.tsx` provides both a Suspense fallback and a per-route error boundary, and six routes already use it.

Approach:
- Keep eager: the shell, layouts, auth pages, and the landing/`/app` routes (needed on first paint).
- Make lazy: all heavy feature-area pages — `enterprise-cognitive-fabric`, `agentic-sre-noc`, `prod-twin`, `data-orchestration-twin`, `coworkers`, `agentic-iac`, `carveout`, `enterprise-cert`, `sead`, `practice-library`, and the admin planes.
- Wrap the router's route tree in `LazyRouteBoundary` so every lazy chunk gets the existing loading state and failure surface.

This cuts peak build memory substantially and also makes the app load faster for users, since visiting one module no longer downloads all of them.

### 3. Simplify the chunk config

With route-level lazy loading in place, the hand-written `manualChunks` function in `vite.config.ts` becomes mostly redundant and can fight the natural splitting. Keep only the vendor rules (maplibre, three, charts, react) and drop the per-page rules, so Rollup splits by dynamic-import boundary.

### 4. Lower the heap back to a safe level

`--max-old-space-size=12288` in `package.json` likely exceeds what the build container actually has, which can itself cause a hard kill instead of a graceful GC. Once the graph is split, bring it back to a value that fits the build environment.

### 5. Verify

Run the production build to completion, then load `/acquisition-onboarding-factory` plus a couple of routes from other modules (SRE NOC, ECF, IAM admin) in a browser against the built output, checking for console errors and confirming the lazy fallback resolves.

## Notes

- No page content, layout, or business logic changes — this is purely how modules are loaded.
- Route paths and URLs stay identical.
- Users will briefly see the existing "Loading view…" indicator when entering a module for the first time.
