# BP2.3 — Commercial Application Shell Test Evidence

## Scope
Navigable Commercial module with route guards and intentional empty states. No Project Momentous business data introduced.

## Route Matrix
| Route | Guard | Component | State |
|---|---|---|---|
| `/commercial` | Auth + Active Tenant + `commercial.view` | `CommercialOverview` | Empty: "No Commercial program configured" |
| `/commercial/program` | Auth + Active Tenant + `commercial.view` | `CommercialProgram` | Empty: "No program selected" |
| `/commercial/scenarios` | Auth + Active Tenant + `commercial.view` | `CommercialScenarios` | Empty: "No scenarios configured" |
| `/commercial/portfolio` | Auth + Active Tenant + `commercial.view` | `CommercialPortfolio` | Empty: "No account records imported" |
| `/commercial/sources` | Auth + Active Tenant + `commercial.view` | `CommercialSources` | Empty: "No source references configured" |

All routes use the canonical `PermissionRoute` (`src/components/auth/PermissionRoute.tsx`) — no role-name checks in routing.

## Navigation
- Global left-side sidebar (`src/components/eoc/Sidebar.tsx`): "Commercial" link added directly above "Platform".
- Commercial-local navigation inside `CommercialLayout`: Overview / Program / Scenarios / Portfolio / Sources with active state via `NavLink`.
- Header shows: active workspace name, workspace switcher, Platform Admin badge (when applicable), and a "Platform" back-link visible only to Platform Administrators.

## Access Guards
- Unauthenticated → `ProtectedRoute` redirects to `/login`.
- Authenticated, no active tenant, non-admin → `TenantRequiredState` empty screen with link back to `/platform`.
- Authenticated with active tenant but missing `commercial.view` → `ForbiddenState`.
- Platform Admin bypass handled inside `AccessContext` and `PermissionRoute`.

## Empty States
All five pages render `EmptyState` cards with the exact copy required by the prompt. No mock rows, no fabricated program.

## Query Cache Contract
- Query key helper `commercialQueryKey(tenantId, ...)` in `src/commercial/hooks/useCommercialAccess.ts` — every commercial query MUST start with `["commercial", tenantId]`.
- `AccessContext.switchTenant` now cancels `["commercial"]` and removes `["commercial"]` cache entries before switching (in addition to existing `["platform"]` cleanup).
- No mutations implemented in BP2.3.

## Existing Module Regression
- Platform routes unchanged (`/platform`, `/platform/members`, `/platform/roles`, `/platform/audit`, `/platform/settings`, `/platform/profile`, `/platform/test-hub`).
- AVEP, SEAD, RunOps, enterprise-cert, and Neurealm route trees untouched.
- Only additive edits: new imports, new `<Route path="/commercial">` block, one Sidebar entry, one AccessContext cache-drop line.

## Preview Links
Verify against NeuGAIN Commercial workspace:
- `/commercial`
- `/commercial/program`
- `/commercial/scenarios`
- `/commercial/portfolio`
- `/commercial/sources`

## Files Added / Modified
Added:
- `src/commercial/shell/CommercialLayout.tsx`
- `src/commercial/hooks/useCommercialAccess.ts`
- `src/commercial/pages/CommercialOverview.tsx`
- `src/commercial/pages/CommercialProgram.tsx`
- `src/commercial/pages/CommercialScenarios.tsx`
- `src/commercial/pages/CommercialPortfolio.tsx`
- `src/commercial/pages/CommercialSources.tsx`
- `docs/commercial/bp2-3-test-evidence.md`

Modified:
- `src/App.tsx` — imports + `/commercial` route block.
- `src/components/eoc/Sidebar.tsx` — added "Commercial" top-level link above "Platform".
- `src/platform/access/AccessContext.tsx` — extended `switchTenant` cache cleanup to include `["commercial"]`.
- `.lovable/plan.md` — BP2.3 status updated.
