# BP1.1A — Security Disposition

## Findings introduced by this package

None. All new tables ship with:

- RLS enabled.
- Explicit `GRANT`s to `authenticated` and `service_role` only (no `anon` grants — every new policy scopes to `auth.uid()`).
- Platform-admin short-circuit for full access.
- Membership-scoped policies for tenant users.
- Cross-tenant integrity triggers on `tenant_role_permissions`, `membership_roles`, `tenant_invitation_roles`.
- Append-only enforcement on `audit_events`.

## Findings addressed by this package

| # | Finding | Disposition in BP1.1A |
|---|---|---|
| 1 | `profiles_missing_insert_update_role_gating` — signed-in users could self-set `approval_status`, `company_id`, `user_category`. | **Fixed.** Added `profiles_protect_governed_fields_trg` BEFORE INSERT/UPDATE trigger. Verified end-to-end: attempted self-elevation raises `profile_governed_field_forbidden`; personal-field updates still succeed; `handle_new_user` (where `auth.uid()` is NULL) is short-circuited unchanged; platform admins are exempt via `is_platform_admin` short-circuit. |
| 2 | `questionnaire_responses_no_public_insert_policy` — no anon insert path; server-mediated by edge function. | **Accept as intentional.** Documented in security memory. |

## Pre-existing warnings not touched by this package

The Supabase linter reports 23 warnings after BP1.1A (down from 28 during migration). All are pre-existing:

- `Function Search Path Mutable` warnings against RunOps and ETDM SECURITY DEFINER helpers.
- `Extension in Public` for standard extensions.
- `Auth OTP long expiry` / `Leaked Password Protection Disabled` — Supabase Auth product settings (not a schema issue).
- `Current Postgres version has security patches available` — Supabase-side patch.

None of these were introduced or worsened by BP1.1A. They will be addressed by their owning modules or by a Supabase Auth configuration pass, which are out of scope for this increment.

## Grants audit

Every new table's grants match its policy shape:

```text
tenants, memberships, permissions, tenant_roles, tenant_role_permissions,
membership_roles, tenant_invitations, tenant_invitation_roles, audit_events
  → GRANT SELECT, INSERT, UPDATE, DELETE ON … TO authenticated;
  → GRANT ALL ON … TO service_role;
  → anon: NOT granted (every policy scopes to auth.uid())
```

Confirmed against pg_catalog after migration.

## Secret handling

No new secrets required. `SUPABASE_SERVICE_ROLE_KEY` remains available only to edge functions (never exposed to the browser). The publishable/anon key is the only key present in client code.
