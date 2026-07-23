# BP1.1B — Build Report

BP1.1B extends the approved BP1.1A foundation. No BP1.1A schema, `app_role`, `user_roles`, or `runops_*` object was modified. No UI shipped.

## Summary

- Added the permission evaluation layer (`has_permission`, `get_current_access_context`) that replaces the BP1.1A membership-EXISTS placeholder.
- Added transactional tenant provisioning (`provision_tenant`) that creates the tenant, seeds the four default roles with BP1.1A-approved permission sets, bootstraps the first admin membership, and audits.
- Added the full member lifecycle service surface (invite / resend / cancel / accept / suspend / reactivate / deactivate / assign role / remove role), all `SECURITY DEFINER` and gated by permission codes.
- Added the role administration surface (create / update / archive / assign permission / remove permission), gated by `roles.manage`.
- Added the last-tenant-administrator safeguard as four BEFORE triggers covering membership state changes, membership-role removal, tenant-role archive, and permission removal from `tenant_admin`.
- Added permission-based Row Level Security policies to every BP1.1A tenant table — deny-by-default, no role names in predicates. Platform-admin policies retained.
- Added server-side audit generation for every tenant/member/role/permission mutation via `emit_audit_event`.

## Functions created

`has_permission`, `get_current_access_context`, `emit_audit_event`, `bootstrap_tenant_default_roles`, `count_active_tenant_admins`, `trg_memberships_last_admin_guard`, `trg_membership_roles_last_admin_guard`, `trg_tenant_roles_last_admin_guard`, `trg_role_permissions_admin_guard`.

## RPCs created

`provision_tenant`, `invite_member`, `resend_invitation`, `cancel_invitation`, `accept_invitation`, `set_membership_status`, `assign_membership_role`, `remove_membership_role`, `create_tenant_role`, `update_tenant_role`, `archive_tenant_role`, `assign_role_permission`, `remove_role_permission`.

## Policies created

Two per canonical tenant table (SELECT + ALL), all permission-gated — see `docs/bp1-1-rls-matrix.md`.

## Tests run

- Typecheck + Vite build — automatic in harness, no errors surfaced.
- Migration applied successfully against the linked Supabase project.
- BP1.1A regression suite (`supabase/tests/bp1_1a_regression.sql`) — unchanged and still PASSES.
- Runtime permission/last-admin/invitation/audit assertions require a signed-in session; deferred to CI with `SUPABASE_DB_URL`.

## Known issues

- Linter `0028`/`0029` warnings on new SECURITY DEFINER RPCs — expected pattern (matches `runops_*`); `anon` is revoked, `authenticated` executes only after `has_permission` gates.
- Runtime end-to-end suite deferred to CI.

## Readiness

**Ready for BP1.1B validation.** Not declared approved.
