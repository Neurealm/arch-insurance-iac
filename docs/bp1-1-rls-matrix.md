# BP1.1 — RLS Matrix (post BP1.1B)

Every BP1.1A table carries two authorization axes:

1. **Platform admin** — unchanged legacy short-circuit via `public.is_platform_admin(auth.uid())`. Retains full read/write on every canonical table.
2. **Permission-based** — added in BP1.1B via `public.has_permission(auth.uid(), tenant_id, <code>)`. Deny-by-default; no policy names a role.

`anon` has no policy on any BP1.1A table and no table-level `SELECT` grant. `service_role` bypasses RLS.

| Table | SELECT | INSERT / UPDATE / DELETE |
|---|---|---|
| `tenants` | `tenant.view` | `tenant.update` (update only; create/delete = platform admin) |
| `memberships` | `members.view` **or** `user_id = auth.uid()` | `members.manage` |
| `tenant_roles` | `roles.view` | `roles.manage` |
| `tenant_role_permissions` | `roles.view` | `roles.manage` |
| `membership_roles` | `members.view` | `members.manage` |
| `tenant_invitations` | `members.view` | `members.invite` |
| `tenant_invitation_roles` | `members.view` | `members.invite` |
| `audit_events` | `audit.view` (tenant-scoped rows only) | platform admin only (writes flow through `emit_audit_event` SECURITY DEFINER) |
| `permissions` | public read (metadata catalog) | platform admin only |

## Notes

- Every tenant-scoped mutation in code flows through a SECURITY DEFINER RPC that re-checks `has_permission` **before** touching a row, so RLS is defense in depth, not the sole gate.
- The self-read carve-out on `memberships` exists so a user can always resolve their own membership without needing `members.view`.
- `audit_events` writes remain restricted; server-side helpers assume the caller is trusted (RPC entry points authorize first).
