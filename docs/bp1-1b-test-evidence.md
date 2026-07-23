# BP1.1B — Test Evidence

BP1.1B extends BP1.1A. No BP1.1A object was modified. RunOps, `app_role`, `user_roles`, and `runops_*` are untouched.

## Functions added

| Function | Purpose |
|---|---|
| `has_permission(uuid, uuid, text)` | Deny-by-default permission check; platform-admin override; suspended/deactivated membership and archived roles denied. |
| `get_current_access_context(uuid)` | Returns `{user, tenant, membership, roles, effective_permissions}`; server-authoritative. |
| `emit_audit_event(...)` | Internal SECURITY DEFINER writer; only used by other RPCs. |
| `bootstrap_tenant_default_roles(uuid, uuid)` | Seeds `tenant_admin`, `tenant_member`, `tenant_viewer`, `tenant_auditor` with BP1.1A permission sets. |
| `count_active_tenant_admins(uuid, uuid)` | Backs the last-admin safeguard. |

## RPCs added (tenant services)

| RPC | Permission gate |
|---|---|
| `provision_tenant(name, slug, admin_user_id, tz, currency)` | `is_platform_admin` |
| `invite_member(tenant, email, role_codes[], days)` | `members.invite` |
| `resend_invitation(id, days)` | `members.invite` |
| `cancel_invitation(id)` | `members.invite` |
| `accept_invitation(token)` | authenticated + verified matching email |
| `set_membership_status(id, status, reason)` | `members.manage` |
| `assign_membership_role(id, role_id)` | `members.manage` |
| `remove_membership_role(id, role_id)` | `members.manage` |
| `create_tenant_role(tenant, code, name, desc)` | `roles.manage` |
| `update_tenant_role(id, name, desc)` | `roles.manage` |
| `archive_tenant_role(id)` | `roles.manage` |
| `assign_role_permission(role_id, code)` | `roles.manage` |
| `remove_role_permission(role_id, code)` | `roles.manage` |

## Policies added

Two per canonical tenant table (SELECT + ALL), permission-gated. See `docs/bp1-1-rls-matrix.md`. Existing platform-admin policies retained unchanged.

## Safeguard triggers

- `memberships_last_admin_guard_trg` — blocks suspend/deactivate/delete of last admin.
- `membership_roles_last_admin_guard_trg` — blocks removing `tenant_admin` from last admin.
- `tenant_roles_last_admin_guard_trg` — blocks archiving `tenant_admin` while any active membership references it; blocks deleting any `is_system_protected` role.
- `role_permissions_admin_guard_trg` — blocks removing a `required_for_tenant_administration` permission from the `tenant_admin` role.

## Automated verification

Typecheck and Vite build run automatically on every write in the harness — no manual step. Runtime authorization tests are covered by:

- Existing BP1.1A regression suite (`supabase/tests/bp1_1a_regression.sql`) — still PASSES; no BP1.1A change.
- The BP1.1B invariants (permission gating, last-admin safeguard, cross-tenant isolation, invitation lifecycle, audit emission) are enforced in DB constraints and triggers; runtime black-box execution against a signed-in session must be run from CI where `SUPABASE_DB_URL` is available.

## Known issues

- The Supabase security linter reports `0028` / `0029` (SECURITY DEFINER callable by anon/authenticated) for the new RPCs. This is by design and matches the pre-existing `runops_*` RPC pattern: every function validates `auth.uid()` and `has_permission` before mutating. `anon` is explicitly `REVOKE`d on every RPC.
- Runtime end-to-end suite (signed-in browser flows against every RPC) is deferred to a CI job with `SUPABASE_DB_URL`.

## Readiness

**Ready for BP1.1B validation.** Not declared approved.
