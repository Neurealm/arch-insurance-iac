---
name: BP1.1 Platform Foundation scope
description: What BP1.1 is allowed to add, what it must preserve as-is, and the reconciliation decisions with existing RunOps and platform-admin stacks.
type: constraint
---

## BP1.1 boundary (in scope)

BP1.1 delivers only the platform foundation:
- Authentication, user profiles, tenants, tenant memberships, roles, permissions, tenant switching, member admin, role admin, application shell, audit foundation, RLS, route/component authorization, error/loading/forbidden/empty states.

## Out of scope for BP1.1

Accounts, portfolios, programs, imports, scoring, readiness, approvals, financial modeling, AI recommendations, delivery operations, and any customer-specific workflow.

## Preservation decisions (do NOT change in BP1.1)

- **RunOps module stack** — `runops_tenants`, `runops_profiles`, `runops_role_assignments`, the `runops_role` enum, and every `runops_*` helper function remain module-owned. BP1.1 introduces product-level `tenants`; it does not repurpose or rename `runops_tenants`. Bridging RunOps to product-level tenants is a later work package.
- **Platform admin path** — the `app_role` enum + `public.user_roles` table remain the mechanism for `platform_admin` / `platform_support`. BP1.1 adds a **separate** tenant-scoped `roles` table; it does not alter the enum.
- **Super-admin bootstrap** — the four hard-coded super-admin emails in `handle_new_user` are accepted for BP1.1. Relocation to a config table or `SUPER_ADMIN_EMAILS` secret is deferred to BP1.2.
- **Existing modules must not regress** — RunOps, AVEP, SEAD, Silicon, Agentic AI Studio, CRM, ETDM, questionnaires, settings, coworkers, prod-twin, data-orchestration-twin, carveout.

## New helpers BP1.1 will introduce

- `public.is_tenant_member(_user_id uuid, _tenant_id uuid)` — SECURITY DEFINER, `stable`, `search_path = public`.
- `public.has_permission(_user_id uuid, _tenant_id uuid, _permission text)` — SECURITY DEFINER, `stable`.
- `public.current_tenant_id()` — read from JWT claim or session.
- Unified audit-write helper writing to `public.audit_events`.

## Grants rule reminder

Every new public-schema table must include explicit `GRANT` in the same migration, tuned to the RLS policies (drop `anon` when every policy scopes to `auth.uid()`; always include `service_role` for tables touched by edge functions).
