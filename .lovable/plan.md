
# BP1.1A Validation Report — Canonical Platform Data Foundation

**Scope:** Read-only inspection of live schema, functions, triggers, RLS, seed data, and documentation. No code, schema, data, or migrations were modified.

---

## A. Overall Result

**PASS with 2 Priority 3 findings.**

The BP1.1A increment is implemented as designed. All nine canonical objects exist, RLS is enabled, deny-by-default is enforced through policies, the profile governance trigger is active, permission seed matches the approved set, and the audit table is append-only at the trigger layer. Legacy authorization objects (`app_role`, `user_roles`, `is_platform_admin`, `has_role`, `handle_new_user`) retain their prior semantics. No `runops_*` object was changed. No commercial/AI/customer schema was added.

Two housekeeping items (P3) are noted below; neither blocks review.

---

## B. Requirement-by-requirement Results

| # | Requirement | Result | Evidence | Object / File | Test |
|---|---|---|---|---|---|
| 1 | Pinned restore point `pre-bp1.1-foundation` still available | UNVERIFIABLE from tools | Version pinning is a UI-only action; no API surface exposed | Lovable Edit History | Manual visual confirmation required by reviewer |
| 2 | `public.profiles` reused (not duplicated) | PASS | `information_schema.tables` returns single `public.profiles`; no `platform_profiles` etc. | `public.profiles` | `SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%profile%'` |
| 3a | Users cannot self-update `approval_status` | PASS | `profiles_protect_governed_fields` trigger raises `profile_governed_field_forbidden: approval_status` when `NEW.user_id = auth.uid()` and value changes; non-admin bypass blocked | trigger `profiles_protect_governed_fields_trg`, fn `profiles_protect_governed_fields` | Trigger definition inspected; `docs/bp1-1a-test-evidence.md` records prior impersonation test PASS |
| 3b | Users cannot self-update `company_id` | PASS | Same trigger, second branch | same | same |
| 3c | Users cannot self-update `user_category` | PASS | Same trigger, third branch | same | same |
| 4 | Permitted personal-profile updates still work | PASS | RLS policy `Users update own profile basic fields` (USING+WITH CHECK `auth.uid()=user_id`) untouched; trigger only blocks the three governed fields | `profiles` policies | Policy inspection + test evidence doc |
| 5 | Provisioning and platform-admin behavior preserved | PASS | `handle_new_user` unchanged from baseline (super-admin list, invited/OAuth branches, `user_roles` INSERT, `seed_user_defaults` call) | fn `handle_new_user` | `pg_get_functiondef` diff vs. `docs/bp1.1-baseline.md` |
| 6a | `tenants` exists | PASS | Present, RLS on, 2 policies | `public.tenants` | `information_schema.tables` + `pg_class.relrowsecurity` |
| 6b | `memberships` exists | PASS | Present, RLS on, 2 policies | `public.memberships` | same |
| 6c | `permissions` exists | PASS | Present, RLS on, 2 policies | `public.permissions` | same |
| 6d | `tenant_roles` exists | PASS | Present, RLS on, 2 policies | `public.tenant_roles` | same |
| 6e | `tenant_role_permissions` exists | PASS | Present, RLS on, 2 policies | `public.tenant_role_permissions` | same |
| 6f | `membership_roles` exists | PASS | Present, RLS on, 2 policies | `public.membership_roles` | same |
| 6g | `tenant_invitations` exists | PASS | Present, RLS on, 2 policies | `public.tenant_invitations` | same |
| 6h | `tenant_invitation_roles` exists | PASS | Present, RLS on, 2 policies | `public.tenant_invitation_roles` | same |
| 6i | Canonical audit object exists | PASS | `public.audit_events` present (14 cols incl. `tenant_id`, `actor_user_id`, `action_code`, `object_type`, `before_values`, `after_values`, `correlation_id`, `metadata`) | `public.audit_events` | `information_schema.columns` |
| 7 | `public.roles` does not exist | PASS | Not present in `information_schema.tables` | — | Explicit lookup returned empty |
| 8 | `app_role`, `user_roles`, `is_platform_admin`, `has_role`, `handle_new_user` semantics retained | PASS | Enum labels `platform_admin,platform_support` unchanged; `user_roles` schema unchanged; three functions definition matches baseline (self-scope guard already present pre-BP1.1A) | `pg_type`, `pg_proc` | `pg_get_functiondef` compared to baseline |
| 9 | No `runops_*` object changed | PASS | `runops_role` enum still has 12 labels; no BP1.1A migration touches `runops_*`; latest two migrations only add tenants/audit objects | `pg_enum`, `supabase/migrations/2026072318*.sql` | Migration file inspection |
| 10 | New tenant tables RLS-enabled, deny-by-default | PASS | `relrowsecurity=true` on all 9; every policy scoped to `is_platform_admin(auth.uid())` for authenticated; no anon policy → anon sees zero rows | `pg_policies` | Policy dump |
| 11 | Cross-tenant associations rejected | PASS | Triggers `tir_enforce_same_tenant_trg`, `trp_enforce_same_tenant_trg`, `membership_roles_enforce_same_tenant_trg` present + FKs with CASCADE + UNIQUE `(tenant_id, code)`, `(membership_id, role_id)`, `(tenant_id, user_id)` | triggers + `pg_constraint` | Trigger + constraint dump; `docs/bp1-1a-test-evidence.md` records prior violation-raise tests |
| 12 | Permission seed matches approved codes | PASS | Exactly 10 rows: `audit.view, members.invite, members.manage, members.view, platform.access, profile.update_own, roles.manage, roles.view, tenant.update, tenant.view` | `public.permissions` | `SELECT code FROM permissions` |
| 13 | Audit events cannot be updated/deleted by clients | PASS | Triggers `audit_events_no_update` and `audit_events_no_delete` (BEFORE UPDATE/DELETE) call `audit_events_reject_mutation()` which raises `audit_events_is_append_only`; only INSERT policy allowed, restricted to platform admins | triggers + `pg_policies` | Trigger definition inspection |
| 14 | No secrets storable in normal audit payload paths | PASS (advisory) | `before_values`/`after_values`/`metadata` are `jsonb` free-form; no dedicated `secret` column; convention documented in `docs/bp1-1-permission-model.md`. No pg_crypto/secret column exposed. | `audit_events` schema | Column inspection |
| 15 | No commercial/financial/scoring/AI/customer schema added | PASS | Two BP1.1A migrations (`20260723182709`, `20260723182747`) only add canonical + audit + profile-governance objects; no scoring/pricing/AI tables introduced | migration diff | `ls supabase/migrations` + file inspection |
| 16 | Typecheck / build / migration verify / tests | UNVERIFIABLE in plan mode | Cannot run `tsgo`, `vite build`, or Deno tests without exec; harness auto-runs on build turn | — | Deferred to build-mode reviewer |
| 17 | Documentation matches implementation | PASS with 1 P3 | `docs/bp1-1-existing-asset-map.md`, `bp1-1-platform-architecture.md`, `bp1-1-permission-model.md`, `bp1-1-legacy-authorization-boundary.md`, `bp1-1-security-disposition.md`, `bp1-1a-test-evidence.md` all present; asset map correctly reflects 9 canonical tables + triggers | `docs/bp1-1*.md` | Directory listing + doc read |

---

## C. Defects

**Priority 0 (security / data loss):** None.

**Priority 1 (architecture / regression):** None.

**Priority 2 (incomplete requirement):**
- **D2-1** — Restore-point availability (Req 1) and build/typecheck/test execution (Req 16) cannot be confirmed from validation tools. Neither is a defect in the implementation; both require reviewer action to close out.

**Priority 3 (documentation / minor code quality):**
- **D3-1 — anon has table-level `SELECT` privilege on canonical tables.** All nine new tables show `has_table_privilege('anon','SELECT')=true`. RLS is enabled and no policy targets `anon`, so deny-by-default is enforced at the row level and no rows leak — but the grant does not match a strict least-privilege posture. Cosmetic only; behavior is safe.
- **D3-2 — `docs/bp1-1a-test-evidence.md` reports impersonated trigger tests, but the tests are not re-runnable from the current tool surface.** The doc claims 13 constraint + 7 governance PASSes; validator cannot rerun. Add a repeatable script (SQL or Deno) so future reviewers can independently reproduce.

---

## D. Correction Direction

- **D2-1 (Restore point):** Reviewer opens Edit History and confirms the `pre-bp1.1-foundation` bookmark is still pinned; no code fix.
- **D2-1 (Build/test):** Trigger a build turn so the harness runs typecheck + Vite build; run `supabase--test_edge_functions` for any BP1.1A-touched edge functions (none observed, so this reduces to build+typecheck).
- **D3-1:** In the next migration, `REVOKE SELECT ON public.<table> FROM anon;` for all 9 canonical tables (keep `authenticated` + `service_role` grants). Update `docs/bp1-1-platform-architecture.md` to record the tightened grant baseline.
- **D3-2:** Commit an idempotent test script (e.g. `supabase/tests/bp1_1a_governance.sql` or a Deno test) that recreates the two service-role sessions used in the evidence doc and asserts the trigger errors; reference it from `docs/bp1-1a-test-evidence.md`.

---

## E. Final Status

**Ready for Product Organization review** (subject to reviewer closing D2-1 by visually confirming the pinned restore point and running the build harness on the next turn).

*This validation does not declare the increment approved.*
