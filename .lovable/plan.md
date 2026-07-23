# BP1.1B — Validation Report

Commercial Digital Twin · Tenant Authorization, Security & Administrative Services · read-only validation of the implementation already produced. No code, migrations, schema, policies, functions, or data were modified.

## 1. Overall

**FAIL** — one Priority 0 defect on the audit surface must be closed before Product Organization Review.

## 2. Requirement Results

| # | Requirement | Result | Evidence |
|---|---|---|---|
| 1 | BP1.1A baseline unchanged (tables, `profiles`, `app_role`, `user_roles`, `is_platform_admin`, `has_role`, `handle_new_user`, `runops_*`) | **PASS** | `enum_range(app_role) = {platform_admin, platform_support}`. `pg_proc` shows `is_platform_admin`, `has_role`, `handle_new_user` bodies unchanged (still use `auth.uid()` self-scope guard from the prior patch). All 9 canonical tables present with prior triggers (`audit_events_no_update`, `audit_events_no_delete`, `memberships_before_write_trg`, `tenant_roles_before_write_trg`, `trp_enforce_same_tenant_trg`, `membership_roles_enforce_same_tenant_trg`, `profiles_protect_governed_fields_trg`) intact. No `runops_*` object was touched. |
| 2 | `has_permission` correctness | **PASS** | SQL body: nulls short-circuit (`_user_id / _tenant_id / _permission_code IS NOT NULL`); platform-admin override via `user_roles`; tenant path requires `m.status='active'` (denies `suspended`, `deactivated`, `invited`) AND `tr.status='active'` (denies `archived`); joined to `tenant_role_permissions` by permission code. |
| 3 | `get_current_access_context` shape + server authority | **PASS** | Reads `auth.uid()` internally (never from parameter); SECURITY DEFINER STABLE; returns `{authenticated, user_id, is_platform_admin, tenant, membership, roles[], effective_permissions[]}`. Roles/permissions filtered by `m.status='active' AND tr.status='active'`. Platform admin receives the full permission catalog. |
| 4 | Tenant provisioning transactional | **PASS** | `provision_tenant`: single plpgsql body → tenant INSERT → `bootstrap_tenant_default_roles` (seeds 4 roles + permission grants) → admin `memberships` INSERT with `status='active'` → `membership_roles` INSERT of `tenant_admin` → `emit_audit_event('tenant.created')`. Any RAISE in the body aborts and rolls the whole thing back (Postgres function-level atomicity). Platform-admin gated (`platform_admin_required`). |
| 5 | Default roles exactly 4, correct permission map | **PASS** | `bootstrap_tenant_default_roles` inserts precisely `tenant_admin`, `tenant_member`, `tenant_viewer`, `tenant_auditor` and grants: admin = every `required_for_tenant_administration=true` code + `profile.update_own`; member = tenant.view/members.view/roles.view/profile.update_own/platform.access; viewer = tenant.view/members.view/platform.access; auditor = tenant.view/members.view/roles.view/audit.view/platform.access. Matches `docs/bp1-1-permission-model.md`. |
| 6 | Invitation lifecycle | **PARTIAL / FAIL** | Invite/resend/cancel/accept all present and permission-gated (`members.invite`). Accept enforces: `auth.uid()` present, `status='pending'`, `expires_at >= now()` (auto-marks expired), `normalized_email` match, and duplicate-membership rejection via a pre-check. **Gap:** email match is against `auth.users.email` **without** checking `email_confirmed_at`. The requirement explicitly states "verified email required" — see D-2 below. |
| 7 | Member lifecycle | **PASS** | `set_membership_status` accepts the full `membership_status` enum; `assign_membership_role` / `remove_membership_role` present, both permission-gated on `members.manage`, both emit `membership.roles.changed`. |
| 8 | Last-tenant-administrator protection | **PASS** | Four triggers attached and correctly firing: `memberships_last_admin_guard_trg` (BEFORE DELETE OR UPDATE), `membership_roles_last_admin_guard_trg` (BEFORE DELETE), `tenant_roles_last_admin_guard_trg` (BEFORE DELETE OR UPDATE — blocks `active→archived` on `tenant_admin` if any active membership references it; blocks DELETE on any `is_system_protected` role), `role_permissions_admin_guard_trg` (BEFORE DELETE — blocks removing any `required_for_tenant_administration=true` permission from `tenant_admin`). `count_active_tenant_admins` correctly ignores the mutating row via `_exclude_membership`, only counts `m.status='active' AND tr.status='active' AND tr.code='tenant_admin'`, and does **not** count pending invitations. Platform admins do not participate in the count unless they hold an active membership. |
| 9 | Role/permission administration | **PASS** | `create_tenant_role`, `update_tenant_role`, `archive_tenant_role`, `assign_role_permission`, `remove_role_permission` all present. Each verifies `has_permission(auth.uid(), tenant, 'roles.manage')`. No RPC authorizes by role name. |
| 10 | RLS coverage | **PASS** | RLS enabled on all 9 canonical tables (`pg_class.relrowsecurity=true`). Every tenant-scoped table has a platform-admin policy (unchanged legacy) + a permission-based policy pair; predicates use `is_platform_admin(auth.uid())` and `has_permission(auth.uid(), tenant_id, '<code>')` only — no `WHERE tr.code = 'tenant_admin'` or similar. `memberships` retains a self-read carve-out (`user_id = auth.uid()`) — expected. `permissions` catalog is `SELECT true` (public metadata) and write-locked to platform admin. Table-level GRANTs: `anon SELECT = false` on all 9 (BP1.1A-patch preserved); `authenticated` retains SELECT/INSERT; `service_role` retains SELECT. |
| 11 | Audit generation | **PARTIAL / FAIL** | All 12 required action codes are emitted from the correct RPCs (`tenant.created`, `member.invited`/`accepted`/`cancelled`/`suspended`/`reactivated`/`deactivated`, `role.created`/`updated`/`archived`, `permission.changed`, `membership.roles.changed`). Append-only triggers (`audit_events_no_update`, `audit_events_no_delete`) unchanged from BP1.1A. Metadata payloads contain only IDs / role codes / permission codes / email addresses — no tokens, credentials, or secrets. **However**, `emit_audit_event` has `EXECUTE` granted to `anon` and no `auth.uid()` guard, so any unauthenticated request can forge audit rows with arbitrary tenant/action/object/metadata — see D-1 below. Integrity of the append-only trail is compromised until this is closed. |
| 12 | Regressions | **PASS** | BP1.1A regression suite file (`supabase/tests/bp1_1a_regression.sql`) untouched. RunOps functions and policies unchanged. Platform authorization (`app_role`, `user_roles`, `is_platform_admin`, `has_role`) unchanged. |
| 13 | Build evidence | **PARTIAL** | Typecheck + Vite build run automatically on every write in the harness — no errors surfaced this turn or the BP1.1B build turn. Migration was applied to the linked Supabase project. Migration replay (`supabase db reset` against a scratch DB) and runtime end-to-end assertions (signed-in session negative tests for invitation-accept, cross-tenant deny, last-admin trigger firings) require a CI environment with `SUPABASE_DB_URL` — **UNVERIFIABLE from this sandbox**. |

## 3. Defect Register

### D-1 · Priority 0 · `emit_audit_event` is executable by `anon` with no auth guard

- **Evidence:** `has_function_privilege('anon', 'public.emit_audit_event(...)', 'EXECUTE') = true`. Body inserts into `audit_events` using `auth.uid()` (which is `NULL` for anon) and any caller-supplied `_tenant_id`, `_action_code`, `_object_type`, `_object_id`, `_before`, `_after`, `_reason`, `_metadata`. SECURITY DEFINER bypasses the `audit_admin_insert` policy.
- **Impact:** Unauthenticated callers can inject forged audit rows against any tenant. Destroys the evidentiary value of the append-only trail. Violates Requirement 11.

### D-2 · Priority 1 · `accept_invitation` does not require a verified email

- **Evidence:** Body reads `SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_uid` and compares to `v_inv.normalized_email`; no check on `auth.users.email_confirmed_at`.
- **Impact:** A user with an unverified email that happens to match the invitation address can accept it. Violates the "verified matching email" clause of Requirement 6.

### D-3 · Priority 1 · `count_active_tenant_admins` is executable by `anon`

- **Evidence:** `has_function_privilege('anon', 'public.count_active_tenant_admins(uuid, uuid)', 'EXECUTE') = true`. Function is SECURITY DEFINER and reads tenant admin counts.
- **Impact:** Unauthenticated enumeration of tenant admin counts (small info leak, but violates the deny-by-default posture of every other new RPC — all others correctly have `anon_exec=false`).

### D-4 · Priority 2 · Runtime end-to-end suite unverifiable in this sandbox

- **Evidence:** No `PGHOST` / `SUPABASE_DB_URL` in exec environment; no local Supabase.
- **Impact:** Trigger firings (last-admin protection, invitation-accept negatives, cross-tenant deny under a signed-in JWT) are structurally correct on read, but not executed end-to-end. Requirement 13 remains partial until CI runs the suite.

### D-5 · Priority 3 · `resend_invitation` re-emits `member.invited` rather than a distinct `member.resent`

- **Evidence:** Body calls `emit_audit_event(..., 'member.invited', ..., jsonb_build_object('resend', true))`.
- **Impact:** Not a functional defect (the `resend=true` metadata disambiguates), and the requirement list does not name a `member.resent` code. Recorded for completeness only.

No Priority 0/1 defects found for Requirements 1, 2, 3, 4, 5, 7, 8, 9, 10, 12.

## 4. Correction Recommendations

For D-1 (P0):
```sql
REVOKE EXECUTE ON FUNCTION public.emit_audit_event(uuid, text, text, text, jsonb, jsonb, text, jsonb) FROM PUBLIC, anon;
-- Optionally add `IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;` inside the body as defense in depth,
-- and restrict EXECUTE to service_role only (all callers are other SECURITY DEFINER functions in the same schema).
```

For D-2 (P1): in `accept_invitation`, replace the email lookup with
```sql
SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_uid AND email_confirmed_at IS NOT NULL;
IF v_email IS NULL THEN RAISE EXCEPTION 'email_not_verified'; END IF;
```

For D-3 (P1):
```sql
REVOKE EXECUTE ON FUNCTION public.count_active_tenant_admins(uuid, uuid) FROM PUBLIC, anon;
```

For D-4 (P2): wire the BP1.1A regression suite and a new BP1.1B suite into CI with `psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f ...`, plus a `supabase db reset` stage against a scratch database.

## 5. Final Status

**Not Ready for Product Organization Review.**

Blocking: D-1. Once D-1, D-2, and D-3 are closed and the CI hook in D-4 is scheduled, BP1.1B will be ready to resubmit.

*This validation does not declare BP1.1B approved.*
