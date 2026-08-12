# BP1.1A — Existing Asset Map

Snapshot of platform-relevant objects that existed **before** BP1.1A and how BP1.1A relates to each. All references are live-database facts, not inferences.

## Authentication & identity

| Object | Type | Purpose | BP1.1A relationship |
|---|---|---|---|
| `auth.users` | Supabase-managed | Identity of record | Referenced by `public.memberships.user_id`, `tenant_invitations.invited_by`, `audit_events.actor_user_id`. Not modified. |
| `public.profiles` | table (33 cols) | Public projection of user (display name, contact, `approval_status`, `company_id`, `user_category`, …) | Governed columns (`approval_status`, `company_id`, `user_category`) protected by the new `profiles_protect_governed_fields_trg`. All other columns and existing RLS untouched. |
| `public.handle_new_user()` | trigger fn | Provisions `profiles` row + super-admin bootstrap for 4 hard-coded emails | Untouched. Runs with `auth.uid() IS NULL`, so the new trigger explicitly short-circuits for it. |
| `public.user_login_events` | table | Login/audit trail | Untouched. Reserved for auth telemetry; distinct from the new `audit_events` (business-domain audit). |

## Platform-wide authority (legacy, preserved)

| Object | BP1.1A relationship |
|---|---|
| `public.app_role` enum (`platform_admin`, `platform_support`) | Preserved. Remains the only global role classifier. |
| `public.user_roles(user_id, role)` | Preserved. Continues to be consulted by ~40 existing RLS policies via `is_platform_admin(auth.uid())`. |
| `public.is_platform_admin(uuid)` | Preserved. New RLS policies on BP1.1A tables call it as the short-circuit for platform admins so admins are never locked out of tenant data. |
| `public.has_role(uuid, app_role)` | Preserved. |
| `public.is_user_approved(uuid)` | Preserved. |

## RunOps module (preserved intact)

`runops_tenants`, `runops_profiles`, `runops_role_assignments`, `runops_role` enum, and every `runops_*` SECURITY DEFINER helper are untouched. `public.tenants` is a **separate** row-set from `runops_tenants`; no FK, no rename, no data copy.

## Product-neutral canonical layer (added by BP1.1A)

| New object | Purpose |
|---|---|
| `public.tenants` | Product-level customer/workspace record; slug is case-insensitive unique, `default_currency_code` ISO 4217, `default_timezone` IANA. |
| `public.memberships` | User membership in a tenant (`status`, `invited_by`, `joined_at`, `deactivated_at`). Unique on `(tenant_id, user_id)`. |
| `public.permissions` | 10 seeded permission codes; 9 marked `required_for_tenant_administration`. |
| `public.tenant_roles` | Per-tenant, data-configurable roles. `code` is immutable once used. |
| `public.tenant_role_permissions` | Tenant-scoped role→permission grants. |
| `public.membership_roles` | Membership→role grants. Cross-tenant assignment blocked by trigger. |
| `public.tenant_invitations` | Case-insensitive email invitations, token-hashed, one active pending per email/tenant. |
| `public.tenant_invitation_roles` | Roles to grant on invitation acceptance. |
| `public.audit_events` | Append-only, tenant-scoped domain audit trail. |

## What BP1.1A did **not** touch

- No changes to any RunOps table, function, policy, or enum.
- No changes to `user_roles`, `app_role`, or `is_platform_admin` behaviour.
- No changes to `handle_new_user` or the super-admin bootstrap list.
- No modification of any existing table's RLS policies except the added `profiles` governance trigger.
- No changes to `user_login_events` or the auth telemetry pipeline.
