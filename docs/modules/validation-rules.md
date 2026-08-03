# Module Validation Rules

Implemented in `src/modules/validate.ts`; exercised by
`src/modules/registry.test.ts`.

## Severities

| Severity | Meaning |
|---|---|
| `valid` | no issue |
| `warning` | should be corrected; does not block |
| `error` | schema or integrity violation; blocks |
| `ownership-conflict` | two modules claim the same thing, or a shared asset has no owner; blocks |
| `missing-reference` | a declared file, route, entity, workflow or permission was not found |
| `unable-to-verify` | the check could not run because no known-reference list was supplied |

`report.ok` is true only when there are no `error` and no `ownership-conflict`
findings.

## Rules

| Rule ID | Severity | Check |
|---|---|---|
| `duplicate-module-id` | error | one `moduleId` declared by more than one manifest |
| `duplicate-capability-id` | error | one `capabilityId` declared more than once registry-wide |
| `schema-version-mismatch` | error | manifest targets a different schema version |
| `conflicting-inclusion-exclusion` | error | a path, route, component, capability, entity, workflow, integration, agent or permission is both included and excluded |
| `invalid-route-ownership` | ownership-conflict | a route is claimed by two modules, or a capability references a route its module does not claim |
| `duplicate-database-ownership` | ownership-conflict | one database entity claimed by two modules |
| `duplicate-workflow-ownership` | ownership-conflict | one workflow claimed by two modules |
| `invalid-shared-capability-ownership` | ownership-conflict / warning | a shared asset with no `primaryOwner`; or a `shared` asset with no consumers |
| `missing-owner` | warning | `productOwner` or `technicalOwner` missing |
| `missing-capability-declaration` | warning | module declares no capabilities |
| `unregistered-implementation` | warning | a capability claims `implemented` with no service/API/entity reference, **or** an application route is claimed by no manifest |
| `missing-referenced-file` | missing-reference | a declared source path was not found |
| `missing-database-entity` | missing-reference | a declared entity is not in the known set |
| `missing-workflow` | missing-reference | a declared workflow is not in the known set |
| `missing-permission` | missing-reference | a declared permission code is not in the known set |
| any of the above | unable-to-verify | the corresponding known-reference list was not supplied |

## Known-reference sets

`validateRegistry({ routes, databaseEntities, workflows, permissions, sourcePaths })`.
Any omitted list downgrades its rules to `unable-to-verify` rather than passing
them silently — absence of evidence is never reported as validity.
