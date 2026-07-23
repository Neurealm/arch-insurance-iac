# BP1.1A — Permission Model (Seed)

Authorization for BP1.1A tables uses two decision points:

1. **Platform-wide short-circuit** — `public.is_platform_admin(auth.uid())`. Preserved from the legacy stack; every new policy grants platform admins full access.
2. **Tenant membership check** — `EXISTS (memberships … status='active')`. This is the placeholder used by BP1.1A RLS. It will be **replaced** (not augmented) by `public.has_permission(_user_id, _tenant_id, _permission_code)` in the next increment. No policy in BP1.1A references role names, so the swap is a policy rewrite, not a data migration.

## Seeded permission codes

| Code | For tenant admin baseline | Meaning |
|---|---|---|
| `tenant.view` | yes | Read the tenant record. |
| `tenant.update` | yes | Update tenant metadata (name, timezone, currency, status). |
| `members.view` | yes | List members. |
| `members.invite` | yes | Create tenant invitations. |
| `members.manage` | yes | Change member status, remove members. |
| `roles.view` | yes | Read `tenant_roles` and their permission mappings. |
| `roles.manage` | yes | Create/modify tenant roles and their permissions. |
| `audit.view` | yes | Read `audit_events` for the tenant. |
| `platform.access` | yes | Reach any tenant surface at all (used later by the shell). |
| `profile.update_own` | no | Change own profile fields not blocked by the governance trigger. |

## Seeded role bootstrap intent (not yet materialized as rows)

- `tenant_admin`: every code with `required_for_tenant_administration = true`.
- `tenant_member`: `tenant.view`, `members.view`, `roles.view`, `profile.update_own`.
- `tenant_viewer`: `tenant.view`, `members.view`.

These role rows are created per tenant by the future `provision_tenant()` RPC (next increment), which is why BP1.1A ships the codes but no per-tenant role rows.

## Ownership vs. authority

- Ownership of a tenant record is expressed only through `memberships` + roles; there is no owner column on `tenants`.
- Tenant-admin membership is not privileged in DB code; the future `has_permission()` will resolve it purely through `tenant_role_permissions`. Platform admin remains a strictly separate axis via `user_roles`.

## Interaction rules

- No new RLS policy is allowed to name a role literally. Legacy policies that do (e.g. RunOps) remain as-is until their own module packages migrate them.
- `platform_admin` implicitly satisfies every permission via the `is_platform_admin` short-circuit; it cannot be locked out of a tenant.
- `service_role` bypasses RLS and is used only inside edge functions; it is never handed to the browser.
