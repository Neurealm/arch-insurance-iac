
# Backend Inspection & Migration Readiness (Neugain.io Pre-Sales PRD)

Read-only inspection oriented toward the upcoming Meridian Epic EHR / Azure CMDB Digital Twin. No files, schema, policies, or data will be modified.

## Backend Inventory

### 1. Backend platform
Supabase (managed) — project ref `esfpbiishpkvhlejnxzq`. Frontend uses `@supabase/supabase-js` 2.107 via `src/integrations/supabase/client.ts`. Edge Functions run on Deno. Lovable Cloud is not enabled on this project (external Supabase connection).

### 2. Shared or isolated database
**Shared** single Postgres database, single `public` schema. Multi-tenancy is row-level, keyed by `tenant_id` on every `runops_*` domain table. No per-tenant schemas or databases.

### 3. Current migrations
20 migrations in `supabase/migrations/` between `20260604134024` and `20260712005358_c1ebba5d…` (the RLS helper-grant repair). Managed exclusively via the Lovable migration tool.

### 4. Existing tenant isolation
- `runops_tenants` (id, external_id, name, data_mode, …).
- `runops_profiles(tenant_id, user_id, display_name)` — tenant membership.
- `runops_role_assignments(tenant_id, user_id, role runops_role)` — per-tenant roles.
- Every `runops_*` domain table carries `tenant_id uuid NOT NULL`.
- RLS policies gate reads/writes via `runops_has_tenant_access(_tenant_id)` and mutations via `runops_can_write(_tenant_id)` / `runops_has_role` / `runops_has_any_role`.

### 5. Existing RLS
All ~85 public tables have RLS enabled with ≥2 policies each. Verified after the recent helper-grant repair: `is_platform_admin`, `runops_has_tenant_access`, `runops_can_write` have `EXECUTE` on `authenticated`; `has_role`, `is_user_approved`, `runops_has_role`, `runops_has_any_role` are locked to `service_role`; all mutation RPCs (`runops_resolve_incident`, `_approve_change`, `_approve_execution`, `_deny_execution`, `_certify_runbook_version`, `_advance_scenario`, `_reset_scenario`, `_bootstrap_current_user`) are `SECURITY DEFINER` and `service_role`-only from the client. Live 200s confirmed on `profiles`/`user_roles`; cross-tenant reads blocked.

### 6. Existing authentication
Supabase Auth. Client uses `localStorage` session with autoRefresh. `handle_new_user` trigger seeds `profiles` (approval workflow) and grants `platform_admin` / `platform_support` roles for super-admins/invited users; blocks personal email domains. Email flows via `auth-email-hook` + Resend (`RESEND_API_KEY` present).

### 7. Existing authorization
Two-layer:
- **Platform layer** — `app_role` enum (`platform_admin`, `platform_support`, …) in `user_roles`, checked via `has_role` / `is_platform_admin`.
- **Tenant layer** — `runops_role` enum (`sre_engineer`, `noc_operator`, `incident_commander`, `service_owner`, `runbook_author`, `change_manager`, `digital_worker_administrator`, `platform_engineer`, `demo_controller`, …) in `runops_role_assignments`, checked via `runops_has_role` / `runops_has_any_role` / `runops_can_write`.
- Frontend: `ProtectedRoute` (approved+admin) + `TenantAccessGuard` (route allow-list, currently retired).

### 8. Existing helper functions
`is_platform_admin`, `is_user_approved`, `has_role`, `runops_has_tenant_access`, `runops_has_role`, `runops_has_any_role`, `runops_can_write`, `update_updated_at_column`, `set_user_category_from_email`, `handle_new_user`. All `SECURITY DEFINER` with `SET search_path = public` where applicable.

### 9. Existing RPCs (mutation)
`runops_resolve_incident`, `runops_approve_change`, `runops_approve_execution`, `runops_deny_execution`, `runops_certify_runbook_version`, `runops_advance_scenario`, `runops_reset_scenario`, `runops_bootstrap_current_user`, `record_user_login_event`, `admin_get_user_login_history`, `admin_user_page_activity`. All enforce `auth.uid()`, tenant access, role, and self-approval prohibitions where relevant.

### 10. Existing Edge Functions
16 deployed: `admin-users`, `admin-delete-user`, `admin-reset-password`, `admin-set-platform-role`, `admin-set-tenant-membership`, `auth-email-hook`, `forgot-password`, `invite-user`, `process-email-queue`, `public-questionnaire-{get,save,upload}`, `record-login`, `tenant-data-import`, `tenant-invite`, `tenant-signup`, `user-login-history`. Required secrets all set (`LOVABLE_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SUPABASE_*`).

## CMDB Table Review

| Table | Columns of note | Classification | Rationale |
|---|---|---|---|
| `runops_services` | `tenant_id`, `external_id`, `name`, `tier`, `environment`, `region`, `health`, `owner_team_id`, `slo_availability`, `slo_latency_ms`, `error_budget_remaining`, `metadata jsonb`, `source_system`, `data_freshness` | **Reuse** | Business-service row for Epic-facing services fits verbatim; put Meridian-specific tags in `metadata`. |
| `runops_components` | `tenant_id`, `service_id`, `name`, `kind` (enum), `health`, `metadata jsonb`, `source_system`, `data_freshness` | **Extend** (data-only) | The `kind` enum values must be inspected before adding Azure CI classes (subscription, RG, VNet, AKS, App Service, Function App, Storage, Cosmos, Key Vault, PrivateLink, ExpressRoute…) and Epic modules (Chart Review, Orders, HIM, RevCycle, MyChart, Bridges). Add values via migration only if enum lacks them; otherwise reuse. Metadata jsonb absorbs cloud attributes. |
| `runops_dependencies` | `tenant_id`, `from_service_id`, `to_service_id`, `criticality`, `metadata jsonb` | **Reuse** | Edge model supports directional service-to-service dependency; component-to-component edges must piggyback through their parent services or via metadata. |
| `runops_service_owners` | `tenant_id`, `service_id`, `team_id`, `primary_user_id`, `secondary_user_id` | **Reuse** | Fits Meridian ownership. |
| `runops_connectors` | `tenant_id`, `kind`, `state`, `metadata jsonb` | **Adapter** | Azure Resource Graph / Epic API surface implemented as connector rows; runtime code lives in an Edge Function adapter — no schema change. |
| `runops_teams` | tenant-scoped teams | **Reuse** | Epic teams (Ancillary, Revenue Cycle, Infrastructure) as team rows. |
| CI-class taxonomy | not currently a table | **New table (optional)** | If structured CI classification is required beyond the `kind` enum + `metadata`, introduce `runops_ci_classes(tenant_id, key, label, parent_key, attributes_schema jsonb)` and a `runops_components.ci_class_key` FK. Only needed if we plan to enforce per-class attribute schemas server-side; otherwise `metadata jsonb` + a domain-side registry in `src/runops/domain/models.ts` is sufficient. |
| Component-to-component edges | not currently a table | **New table (optional)** | If Azure CMDB needs first-class component graph (e.g. VM → NIC → NSG → Subnet → VNet), add `runops_component_edges(tenant_id, from_component_id, to_component_id, relation, metadata)` rather than overloading `runops_dependencies`. Optional if graph density is low. |
| Epic module registry | not currently a table | **Reuse via `runops_services`** | Epic modules modeled as services with `metadata.epic_module = true`. |

## Migration Risk Review

| Risk | Severity | Mitigation |
|---|---|---|
| Adding enum values to `component_kind` / `service_tier` / `service_environment` | Low | `ALTER TYPE ... ADD VALUE` is non-blocking in Postgres 12+; must run outside a transaction — Lovable migration tool handles this. Never `DROP` existing values. |
| Adding nullable columns to `runops_*` tables | Low | Backward compatible; frontend types regenerate after apply. |
| Adding new tables (`runops_ci_classes`, `runops_component_edges`) | Low–Medium | Must include GRANTs (`authenticated`, `service_role`), RLS, and tenant-scoped policies using existing helpers. Skipping GRANTs is the top failure mode — same class as the just-repaired regression. |
| RLS policy changes on existing hot tables | High | Any redefinition of policies on `runops_components` / `_services` / `_dependencies` risks blocking live 200s; require a follow-up verification pass mirroring the recent RLS repair. |
| Modifying existing helper functions (`runops_has_tenant_access`, `_can_write`) | High | These are on the read path for every runops table. Prefer adding new helpers over altering existing ones. |
| Backfill of tenant seed data (Meridian) | Low | Use `insert` tool, not migration; must scope to Meridian tenant id. |
| Enum value ordering | Low | Additions must be appended, not reordered. |
| Foreign keys to `auth.users` | N/A | Not proposed; profiles pattern is already correct. |
| Storage bucket changes | N/A | No changes proposed. |

## Rollback Strategy

- **Migrations are forward-only** in Lovable. There is no automated `down` migration.
- Practical rollback options:
  1. **Additive-only migrations** (columns, new tables, new enum values, new policies): revert by writing a compensating migration that drops the added object. Enum values cannot be removed in Postgres — plan additions with care.
  2. **Data seed changes**: revert via a targeted `DELETE` scoped by `tenant_id` (Meridian tenant only) through the `insert` tool.
  3. **RLS policy changes**: keep prior policy definitions in the migration comment header and re-issue them in a compensating migration if regression occurs.
  4. **Helper function changes**: never modify in place; introduce `runops_has_tenant_access_v2` etc., swap policies, retire the old function after a soak period.
- Verification gate: every migration touching RLS/helpers must run the same live check used in the July 12 repair (200 on `profiles`/`user_roles` for authed user, 403 for cross-tenant read).

## Tenant Isolation Review

- Every domain table is `tenant_id`-scoped, and no domain policy is currently written against `auth.uid()` alone.
- `runops_has_tenant_access` short-circuits for platform admins and otherwise requires a `runops_profiles` row; `runops_can_write` additionally requires a writer role.
- Client Query keys must include `selectedTenantId` (already the convention in `queryKeys.ts`); Meridian additions must follow this.
- Two soft caveats:
  - `runops_bootstrap_current_user` self-grants **every** `runops_role` on `tenant-contoso` to any authed user. Acceptable under `demoMode: true`; unacceptable once `autonomousExecution` or `realInfrastructureActions` are enabled.
  - `useTenantScope` is currently retired (returns unscoped); tenant enforcement relies on RLS at the data layer, not the route layer.
- No cross-tenant data leakage observed in the previous verification pass.

## Verdict

**CONDITIONAL GO**

Sufficient backend foundation exists to add the Meridian Epic EHR / Azure CMDB Digital Twin without new tables. Conditions:

1. Any new migration must include GRANTs, RLS, and tenant-scoped policies keyed off the existing helpers (do not modify the helpers).
2. Enum additions (component kinds, if needed) must be additive and appended.
3. Prefer `metadata jsonb` + domain-side CI-class registry over new tables; only add `runops_ci_classes` / `runops_component_edges` if the Meridian requirements specifically demand server-enforced class attributes or first-class component graphs.
4. Before Meridian rows are inserted, seed the tenant via `runops_tenants` + `runops_profiles` + `runops_role_assignments` using the `insert` tool, not a migration.
5. Do not alter `runops_bootstrap_current_user` yet, but track it for gating before leaving demo mode.
6. Every migration that touches RLS or helpers must be followed by the same live verification pass used on July 12.

No implementation will be performed from this plan — approval simply acknowledges the backend readiness baseline.
