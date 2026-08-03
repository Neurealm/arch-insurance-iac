# Stage 3 — Platform Capability Catalog

Source of truth: `src/modules/platform/platformCapabilities.ts`.

Platform capabilities are owned by the platform and consumed by every module. They must never be
counted as a unique capability of a consuming module. A page that renders inside the app shell
and authenticates a user has not thereby implemented authentication or navigation.

| Capability | Consumers | Status | Maturity | Evidence strength | Never a module capability |
| --- | --- | --- | --- | --- | --- |
| Authentication | all | active | hardened | database-backed | yes |
| Tenant Isolation | all | active | hardened | database-backed | yes |
| Role-Based Access Control | all | active | hardened | database-backed | yes |
| Application Shell and Navigation | all | active | established | client-side-functional | yes |
| Platform Administration | platform | active | hardened | database-backed | no |
| Audit Logging | platform, commercial, cae | active | established | database-backed | no |
| In-App Notifications and Email Delivery | all | active | established | database-backed | yes |
| Design System | all | active | hardened | client-side-functional | yes |
| Common Data Access | all | active | hardened | database-backed | yes |
| Feature Flags | runops, cae | proposed | experimental | static-data | no |
| Error Handling | runops, cae, platform | active | emerging | client-side-functional | no |

## Miscounting guard

Eight capabilities are marked `frequentlyMiscounted`. The governance rule
`platform-capability-declared-as-module-owned` raises an **error** whenever a module manifest
claims a file inside a platform source path. This is the rule that stops "our module has
authentication" from ever entering the catalog.

## Honest gaps

- **Feature Flags** is registered as `proposed` / `experimental`: each module keeps its own
  compile-time constants and no flag service exists. It is listed so the gap is visible, not to
  claim the capability.
- **Error Handling** has no application-level boundary — a crash outside RunOps or CAE unmounts
  the app.
- **Audit Logging** coverage is not uniform. ETDM writes to its own `etdm_record_audit_log`
  table rather than the platform audit stream.
- Two authentication controls (`AuthVerificationOverlay.tsx`, `TenantAccessGuard.tsx`) exist but
  have no import sites — implemented but not applied.
