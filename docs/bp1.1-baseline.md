# BP1.1 Baseline (pre-foundation)

**Purpose:** Freeze the project state immediately before Build Package **BP1.1 Platform Foundation** is applied, so that any regression during BP1.1 can be identified and rolled back.

_This document is descriptive only — it is not a migration and does not change anything._

---

## Baseline markers

| Item | Value |
|---|---|
| Lovable project | `cf41b1c7-eed7-4ec8-8c7a-bb33fbe7ed6b` |
| Supabase project ref | `esfpbiishpkvhlejnxzq` |
| Latest applied migration | `20260720161028_d5b18dcc-584b-428d-997c-08cc932ebf45.sql` |
| Applied migrations count | 20 |
| Public tables | 89 (all with RLS enabled) |
| Edge functions | 17 |
| Storage buckets | `avatars` (public), `evidence` (private), `etdm-assets` (private) |
| Published domains | `neugain.io`, `www.neugain.io`, `neugain-connect-dream.lovable.app` |
| Security scan | 26 warn-level findings, **0 Critical / 0 High** (see below) |

## Security scan snapshot

Taken immediately before this document. See `security--run_security_scan` for the live result.

- 22 × `SUPA_authenticated_security_definer_function_executable` (warn) — expected: our RunOps / ETDM SECURITY DEFINER helpers are intended to be callable by signed-in users and rely on internal auth.uid() / role checks.
- 1 × `SUPA_auth_leaked_password_protection` (warn) — leaked-password protection currently off in Supabase Auth; enable via dashboard when convenient.
- 3 × `MISSING_RLS_POLICY` (warn) — ETDM technology catalog, CRM tables, and questionnaire share links are admin-gated by design today; tenant-scoped policies will land with BP1.2 tenant-scoping.

## Manual restore-point actions requested from the user

These cannot be performed from tools:

1. Open the Lovable editor and click **Publish → Update** so the current frontend state is frozen on the live URL.
2. Open **Edit History** (top of the chat) and pin the current version with the label `pre-bp1.1-foundation`.

If BP1.1 needs to be rolled back, use either of those two anchors.

## Tables BP1.1 must NOT drop or repurpose

- `profiles`, `user_roles`, `user_login_events`, `user_page_activity`, `user_contact_methods`, `user_notification_rules`
- All `runops_*` tables (module-owned, preserved)
- All `etdm_*` tables
- All `crm_*` tables
- All `questionnaire*` tables
- `org_*`, `programs`, `workstreams`, `stakeholder_registers`, `action_items`, `evidence_files`, `answers`, `answer_notes`, `nova_knowledge_base`, `agents_catalog`, `tools_catalog`, `integrations_catalog`

## Enums / functions BP1.1 must NOT alter

- `app_role` enum (`platform_admin`, `platform_support`) and `has_role`, `is_platform_admin`, `is_user_approved`.
- `runops_role` enum and the `runops_*` helper functions.
- `handle_new_user` trigger (super-admin bootstrap emails accepted for BP1.1; relocation deferred to BP1.2).
- `sync_profile_company` trigger (BP1.2 will decouple profile → CRM auto-linking once tenants exist).

## Edge functions BP1.1 must preserve

`admin-users`, `admin-set-platform-role`, `admin-set-tenant-membership`, `admin-reset-password`, `admin-delete-user`, `invite-user`, `tenant-invite`, `tenant-signup`, `auth-email-hook`, `process-email-queue`, `forgot-password`, `record-login`, `user-login-history`, `tenant-data-import`, `public-questionnaire-get`, `public-questionnaire-save`, `public-questionnaire-upload`.

## What BP1.1 is allowed to add

New product-level canonical objects:
- `public.tenants`
- `public.tenant_memberships`
- `public.roles`
- `public.permissions`
- `public.role_permissions`
- `public.tenant_invitations`
- `public.audit_events`

Plus RLS helpers `is_tenant_member(_user_id, _tenant_id)`, `has_permission(_user_id, _tenant_id, _permission text)`, `current_tenant_id()`, and a unified audit-write helper. Every `CREATE TABLE public.*` must be paired with explicit `GRANT` statements in the same migration.
