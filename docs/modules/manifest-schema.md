# Module Manifest Schema

Source of truth: `src/modules/types.ts`. Schema version `1.0.0`.

A manifest is declarative data only: no imports of application components, no
side effects, no I/O.

## Top level

```ts
interface ModuleManifest {
  schemaVersion: "1.0.0";
  identity: ModuleIdentity;
  boundaries: ModuleBoundaries;
  capabilities: CapabilityDeclaration[];
  sharedOwnership: SharedOwnershipDeclaration[];   // shared assets this module owns
  sharedDependencies: DependencyDeclaration[];     // shared assets it consumes
  platformDependencies: DependencyDeclaration[];   // platform capabilities it consumes
  exclusions: ModuleExclusions;
  unableToVerify: string[];
}
```

## Identity

`moduleId`, `name`, `description`, `moduleVersion`, `status`
(`active | prototype | deprecated | planned`), `businessDomain`, `productOwner`,
`technicalOwner`, `identificationConfidence`
(`high | medium | low | unable-to-verify`).

## Boundaries

Reference lists only — nothing is imported:
`sourcePaths`, `routePrefixes`, `routes`, `navigationIds`, `pageIds`,
`componentRefs`, `serviceRefs`, `apiPrefixes`, `databaseEntities`,
`workflowIds`, `integrationIds`, `aiAgentIds`, `automationActionIds`,
`dashboardIds`, `reportIds`, `permissionIds`.

Files may be referenced from their current location; a module does not have to
be physically relocated into `src/modules/{id}/` to be registered.

## Capabilities

`capabilityId`, `name`, `description`, `domain`, `subdomain`, `businessPurpose`,
`primaryPersona`, `secondaryPersonas`, `implementationStatus`, the `related*`
reference lists (pages, routes, components, services, workflows, entities, APIs,
integrations, agents, automation actions), `evidenceHints`, `dependencies`,
`knownLimitations`.

`implementationStatus` is one of:

| Value | Meaning |
|---|---|
| `implemented` | Backed by a real service, API or database entity. Requires at least one such reference — enforced by the validator. |
| `partial` | Some flows are real, others are not. |
| `mock` | Renders fixture data that imitates real behaviour. |
| `static` | Editorial or diagrammatic content only. |
| `planned` | Declared, not built. |

A navigation entry, a mock page or a static visualisation never justifies
`implemented`.

## Ownership

`OwnershipKind` is `module-owned | shared | platform-owned`. A shared asset
declares `primaryOwner`, `consumingModules`, `relationship`
(`consumes | extends | co-owns | delegates-to`) and `implementationRefs`.

## Exclusions

Explicit negative boundary for `sourcePaths`, `routes`, `components`,
`capabilities`, `databaseEntities`, `workflows`, `integrations`, `agents`,
`permissions`, plus a free-text `reason`. Anything listed in both an inclusion
and an exclusion list is a validation error.

## Authoring a manifest

1. Create `src/modules/{module-id}/module.manifest.ts`.
2. Export the manifest object (named or default — discovery accepts either).
3. Run the registry tests; fix every `error` and `ownership-conflict` finding.

No other registration step exists and no second module list is maintained.
