# User Management

Replace `/settings/approvals` with a richer User Management page that lets platform admins see, in one place, who has access to the platform, what roles & workspaces they hold, their recent sign-in activity, and edit access inline.

## Page layout

`/settings/approvals` (kept as the route to avoid breaking links; nav label changes to "User Management"):

```text
+------------------------------------------------------------+
| User Management                          [Invite user]     |
| Tabs: All  |  Pending  |  Approved  |  Rejected            |
| Search: [______________]                                   |
+------------------------------------------------------------+
| Name / Email | Status | Platform role | Workspaces | Last  |
|              |        |               |            | sign- |
|              |        |               |            | in    |
|--------------+--------+---------------+------------+-------|
| > Ashish N.  | appr.  | support       | NeuRealm   | 2m ago|
|   ashish@... |        |               | +2 tenants |       |
+------------------------------------------------------------+
```

Clicking a row opens a **detail drawer** with three sections:

1. **Profile & status** — email, display name, approval status, created/approved timestamps, approve/reject buttons.
2. **Roles & workspace access** — current platform role (none / `platform_support` / `platform_admin`) with a dropdown to change it; list of tenant memberships with role per tenant and a remove (X) button; "Add to workspace" picker (tenant + role) to grant new access.
3. **Login history** (last 20 attempts) — timestamp, outcome (success / invalid_credentials / refresh_failed / logout), IP, user agent. Live-pulled from Supabase auth logs each time the drawer opens.

## Login history source

Live read from Supabase auth analytics via a new edge function `user-login-history`:
- Verifies caller is `platform_admin` via `user_roles`.
- Accepts `{ userId, email }` and runs an analytics query against `auth_logs` filtered by `actor_id` or `actor_username`, ordered desc, limit 20.
- Returns a normalised list (timestamp, action, status, ip, user_agent).
- No new tables, no auth hooks. Retention follows Supabase defaults (~7 days), which is called out in the UI as "Recent sign-in activity".

## Inline edits

Two new edge functions (admin-gated, service-role) so the UI can mutate roles without loosening RLS on `user_roles` / `tenant_memberships`:

- `admin-set-platform-role` — `{ userId, role: 'platform_admin' | 'platform_support' | null }`. Upserts or deletes the row in `user_roles`. Refuses to remove the last `platform_admin`.
- `admin-set-tenant-membership` — `{ userId, tenantId, role: 'admin' | 'member' | null }`. Upserts or deletes in `tenant_memberships`.

Both verify caller is `platform_admin`, validate input, and return the updated state.

Approve / reject already exists and stays.

## Frontend changes

- `src/pages/settings/UserApprovals.tsx` — rewrite into the table + tabs + search shell, opens a `UserDetailDrawer` on row click.
- New `src/components/users/UserDetailDrawer.tsx` — three stacked sections (Profile, Access, Login history) using existing shadcn `Sheet`, `Select`, `Badge`, `Table`.
- New `src/components/users/AccessEditor.tsx` — platform role dropdown + tenant grant/remove UI; calls the two new edge functions and invalidates the parent query on success.
- New `src/components/users/LoginHistoryList.tsx` — invokes `user-login-history` with React Query, shows skeleton, badges per outcome, relative timestamps.
- Existing `InviteUserDialog` keeps working unchanged.

## Backend changes

New edge functions only — no DB schema changes:
- `supabase/functions/user-login-history/index.ts`
- `supabase/functions/admin-set-platform-role/index.ts`
- `supabase/functions/admin-set-tenant-membership/index.ts`

All three: CORS, admin gate, Zod input validation, service-role client for writes.

## Out of scope (for this iteration)

- Persisting login events to our own table (user picked "Live from Supabase auth logs").
- Per-feature permissions (only platform role + tenant role).
- Audit log of who changed whose role (can be added later if needed).
