# Automatic Discovery Architecture

## Convention

```text
src/modules/{module-id}/module.manifest.ts
```

A module exists to the platform when — and only when — this file exists and
exports a valid manifest. Developers never edit a central list.

## Mechanism

`src/modules/registry.ts` uses Vite's build-time glob:

```ts
import.meta.glob("./**/module.manifest.ts", { eager: true })
```

Every export of every matched file is shape-checked with an `isManifest` guard,
so both `export const manifest` and `export default` are accepted and unrelated
exports (helpers, constants) are ignored. Results are sorted by `moduleId` and
cached for the process lifetime.

The glob is resolved statically by Vite and by Vitest, so no build step,
codegen artefact or Node filesystem access is required, and the registry works
identically in the browser, in tests and in a future CLI report.

## Runtime API

| Function | Purpose |
|---|---|
| `getModules()` | all discovered manifests |
| `getModule(id)` | one manifest |
| `getCapabilities()` | every capability, tagged with its `moduleId` |
| `resolveRouteOwner(path)` | which module claims a route (exact match, then prefix) |
| `validateRegistry(known?)` | full validation report |
| `__resetRegistryCache()` | test helper |

## Guarantees

- Duplicate module IDs are rejected as errors.
- Duplicate ownership claims (route, database entity, workflow) are reported as `ownership-conflict`.
- Overlapping boundaries are detected by comparing claim sets across manifests.
- The registry is data-only and imports no page or component, so it adds no route or bundle weight.

## Consumers

Stage 2 adds an unregistered-implementation report by passing the application's
route table into `validateRegistry({ routes })`. Stage 4's Module Capability
Intelligence reads `getCapabilities()` and `validateRegistry()` directly; it
requires no new discovery mechanism.
