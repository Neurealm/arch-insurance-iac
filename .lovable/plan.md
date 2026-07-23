
# BP1.1 Authorization Model Reconciliation

Analysis only — no code changes. All findings verified against the live database (enums, columns, RLS policies) and the security scanner.

---

## A. Authorization-Model Recommendation

**Conclusion: Reuse and extend the existing authorization model — with a permission-code layer added on top.**

The BP1.1 preflight's earlier statement that "BP1.1 will add a separate `roles` table" is **incorrect** and must be amended. Adding a generic `public.roles` table alongside `public.user_roles` creates two overlapping platform-role systems and violates the product-neutrality memory rule. The RunOps role model (`runops_role` / `runops_role_assignments`) is legitimately domain-specific and stays as-is, but there is no justification for a second *platform* role table.

### 1. Existing authorization model — verified state

| # | Object | Type | Values / Fields | Tenant scope | Purpose |
|---|---|---|---|---|---|
| 1 | `public.app_role` | enum | `platform_admin`, `platform_support` | None (global) | Platform-wide role classification |
| 2 | `public.user_roles` | table | `id, user_id, role app_role, created_at` | None | One-to-many user → platform role |
| 3 | `public.runops_role` | enum | 12 values (`sre_engineer`, `noc_operator`, `incident_commander`, `service_owner`, `runbook_author`, `change_manager`, `digital_worker_administrator`, `platform_engineer`, `auditor`, `executive`, `read_only_user`, `demo_controller`) | Tenant-scoped | RunOps domain roles |
| 4 | `public.runops_role_assignments` | table | `tenant_id, user_id, role runops_role, team_id, …` | Yes (`tenant_id`) | Per-tenant RunOps role grants |
| 5 | `public.runops_tenants` | table | `id, external_id, name, slug, …` | Self | RunOps tenant registry |
| 6 | `public.runops_profiles` | table | `tenant_id, user_id, display_name, …` | Yes | RunOps tenant membership |

**Authorization functions:** `is_platform_admin(uuid)`, `has_role(uuid, app_role)`, `is_user_approved(uuid)`, `runops_can_write(uuid)`, `runops_has_tenant_access(uuid)`, `runops_has_role(uuid, runops_role)`, `runops_has_any_role(uuid, runops_role[])`. All are `SECURITY DEFINER` and now self-scoped (verified — the earlier `rls_helper_arbitrary_uid` finding is patched).

**RLS reality:** Platform-admin writes across the schema are guarded by `is_platform_admin(auth.uid())` (verified on ~40 policies including `user_roles`, `etdm_*`, `crm_*`, `stakeholder_registers`, `questionnaire_*`, `agents_catalog`, `tools_catalog`, `nova_knowledge_base`, `programs`). RunOps tables are guarded by `runops_can_write` / `runops_has_tenant_access`.

**Answers to the 10 required questions about the existing model:**
1. Physical types: two enums + two grant tables (one global, one tenant-scoped).
2. Fields: as above.
3. Tenant scope: `user_roles` = none; `runops_role_assignments` = yes.
4. Business purpose: `user_roles` = platform admin/support gating; `runops_role_assignments` = per-tenant RunOps duties.
5. Consumers: `is_platform_admin` (used by ~40 RLS policies + `handle_new_user`); `runops_*` helpers (used by RunOps RLS + SECURITY DEFINER RPCs).
6. Direct role-name authorization: **yes** — RLS references role names literally, not permission codes.
7. Multiple roles per user: yes (both tables allow multiple rows per user).
8. Tenant-specific roles: only for RunOps; `user_roles` is global.
9. Configurable permissions: **no** — there is no `permissions` or `role_permissions` table anywhere.
10. Safe to extend: yes for `user_roles` (add new enum values; extend via a companion `role_permissions` table).

### 2. Duplication assessment — proof that a separate `public.roles` table would duplicate semantics

- `public.user_roles.role app_role` already **is** the canonical platform-role assignment.
- ~40 RLS policies already resolve platform authority through `is_platform_admin(auth.uid())`.
- A new `public.roles` table would either (a) leave RLS pointing at `user_roles` and be dead weight, or (b) force a schema-wide RLS rewrite mid-BP1.1 that the preflight explicitly deferred.
- The five preservation tests required by the prompt for a "separate platform RBAC model" **cannot all be satisfied** — specifically test 3 ("non-overlapping responsibilities") fails: both models would answer "is this user a platform admin of tenant X".

Therefore the answer is #1 (Reuse and extend), not #2.

---

## B. Canonical Logical-to-Physical Mapping

| Logical concept | Physical object (BP1.1) | Notes |
|---|---|---|
| User profile | `public.profiles` (existing) | Keep; add nothing in BP1.1. |
| Tenant | **new** `public.tenants` | Product-neutral; distinct from `runops_tenants` (which becomes a RunOps-specific projection). |
| Tenant membership | **new** `public.memberships (tenant_id, user_id, status, …)` | Replaces the ad-hoc "if you're in `runops_profiles` you're in the tenant" pattern for the product-neutral layer. |
| Permission | **new** `public.permissions (code text PK, description)` | Permission-code-based authz (memory rule). |
| Role | **reuse** `public.user_roles` + extend `app_role` enum with tenant-scoped values as needed, OR add `public.tenant_roles (code, name)` if roles must be data-configurable. Recommended: **`public.tenant_roles`** as a data table so tenants can add roles without a migration. `app_role` stays for the two platform-wide roles only. | See naming section. |
| Role permission | **new** `public.tenant_role_permissions (role_code, permission_code)` | Maps role → permission codes. |
| Membership role | **new** `public.membership_roles (membership_id, role_code)` | Grants tenant roles to memberships. |

`app_role` / `user_roles` remain the **platform-wide** authority (`platform_admin`, `platform_support`). `tenant_roles` / `membership_roles` are the **per-tenant** authority. No overlap.

---

## C. How Existing RunOps Authorization Is Preserved

- `runops_role`, `runops_role_assignments`, `runops_profiles`, `runops_tenants`, and all `runops_*` SECURITY DEFINER helpers are **untouched** in BP1.1.
- No RLS policy referencing `runops_*` is modified.
- The new `public.tenants` is not the same row set as `public.runops_tenants`; a later package (not BP1.1) may add a nullable `tenants.runops_tenant_id` FK to project RunOps tenants into the canonical layer. Until then, RunOps operates unchanged.

---

## D. How Duplicate Authorization Semantics Are Prevented

1. **Namespaced roles.** Platform-wide roles live only in `app_role`/`user_roles`. Tenant-scoped roles live only in `tenant_roles`/`membership_roles`. Neither table stores the other's rows.
2. **Single decision point per scope.** Platform decisions call `is_platform_admin(auth.uid())`. Tenant decisions call a new `has_permission(auth.uid(), _tenant_id, _permission_code)` SECURITY DEFINER helper that resolves through `memberships → membership_roles → tenant_role_permissions → permissions`.
3. **No new RLS policy in BP1.1 uses raw role names.** All new tables gate on `has_permission(...)`. Only legacy tables continue to name roles directly.
4. **Compatibility boundary:** platform_admin is granted an implicit tenant-admin equivalent inside `has_permission` (short-circuit `is_platform_admin` → true) so a platform admin cannot be locked out and cannot receive contradictory decisions.
5. **Convergence path documented in `.lovable/plan.md`:** RunOps role assignments will later be projected as tenant roles via a view, and `runops_can_write` will be re-expressed on top of `has_permission` in a future package (not BP1.1).

---

## E. Tenant-Administrator Bootstrap Recommendation

**Conclusion: #2 — BP1.1 must implement initial tenant-administrator bootstrap.** The preflight's deferral of this to BP1.2 is rejected per the prompt's explicit rule.

Distinctions:
1. Platform super-admin — exists (`handle_new_user` hard-codes 4 emails to `platform_admin`).
2. Initial tenant administrator — **does not exist** for the new `public.tenants` layer.
3. Tenant provisioning — no product-neutral RPC exists (only `runops_bootstrap_current_user`).
4. Existing application administrator — `is_platform_admin` covers this globally.
5. RunOps administrator — `runops_bootstrap_current_user` grants every RunOps role to the caller for `tenant-contoso` only.

BP1.1 must add:
- `public.provision_tenant(_name text, _slug text)` SECURITY DEFINER — creates a `tenants` row, creates a `memberships` row for `auth.uid()`, assigns the seeded `tenant_admin` role. Callable only by `is_platform_admin(auth.uid())` OR the caller becomes the first admin of a tenant they created (self-bootstrap allowed when the tenant has zero admins).
- Seed rows: `permissions` (initial code set), `tenant_roles` (`tenant_admin`, `tenant_member`, `tenant_viewer` at minimum), `tenant_role_permissions` mapping.

## F. Platform Super-Admin Recommendation

Existing `handle_new_user` super-admin bootstrap (4 hardcoded emails) is **sufficient for BP1.1**. Do not remove or rewrite it in BP1.1. Its refactor (moving the list to config/env or a `platform_super_admins` table) is correctly deferred to a later package. The security memory already records this as an accepted risk.

---

## G. Warning Findings — Reconciled

The prior preflight cited 26 warnings from an earlier scan generation. The current authoritative scanner (`supabase_lov v3.2`, timestamp 2026-07-23T17:24:14Z, `up_to_date: true`) returns **2** active warnings. The delta is expected: prior scan generations produced a broader taxonomy; the current generation dedupes and re-scopes. The 24 no-longer-reported items are treated as stale.

| # | Finding ID | Component | Description | Severity | BP1.1 touches? | Must fix before BP1.1? | Regression risk? | Disposition |
|---|---|---|---|---|---|---|---|---|
| 1 | `profiles_missing_insert_update_role_gating` | `public.profiles` UPDATE policy | Users can update their own row without column-level `WITH CHECK`; could self-set `approval_status` or `company_id`. | warn | Yes — BP1.1 memberships will read `profiles`. | **Yes** — add trigger blocking self-writes to `approval_status`/`company_id`/`user_category` (memberships take over these decisions). | Yes — verify approval flow still works. | Fix in BP1.1 preamble migration. |
| 2 | `questionnaire_responses_no_public_insert_policy` | `questionnaire_responses` | No anon INSERT policy; relies on edge-function service role. | warn | No | No | No | Accept — add to security memory as intentional (already server-mediated). |

Older (stale) warnings from the prior scan generation are considered superseded; if any resurface after BP1.1 they will be re-triaged then.

---

## H. Required Amendments to the BP1.1 Build Prompt

1. **Replace** "add a separate `roles` table" with "add `tenant_roles` (data-driven), `permissions`, `tenant_role_permissions`, `memberships`, `membership_roles`; keep `user_roles`/`app_role` for platform-wide roles only".
2. **Add** `public.tenants` explicitly to the BP1.1 object list (distinct from `runops_tenants`).
3. **Add** `has_permission(_user_id uuid, _tenant_id uuid, _permission_code text)` SECURITY DEFINER helper, and require all new-table RLS to gate on it (not on role names).
4. **Add** `provision_tenant(...)` RPC + seed data for permissions/roles/mappings.
5. **Add** the `profiles` column-gating trigger described in G#1 as a BP1.1 preamble step.
6. **Remove** the deferral of initial tenant-admin bootstrap to BP1.2. Keep only platform-super-admin refactor deferred.
7. **Add** a compatibility clause: no BP1.1 migration alters `runops_*` objects or `user_roles`/`app_role` semantics; `is_platform_admin` short-circuits `has_permission` to true.

---

## I. Final Readiness Result

**Ready for BP1.1 Build Prompt with documented mapping** — conditional on the amendments in section H being applied to the Build Prompt before you paste it.
