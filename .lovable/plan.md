Make org-hierarchy data tenant-isolated. Tenants only see dashboards/tools NeuGain has assigned them (already enforced by `tenant_tool_assignments` + Sidebar + `TenantAccessGuard`). Leave CRM and Settings as NeuGain-only. Leave dashboard visuals (KPIs, charts) as static demo content.

## Scope

In scope (add tenant isolation):
- Org hierarchy: `org_business_units`, `org_practices`, `org_capability_areas`, `org_service_functions`, `org_workflows`, `org_activities`, `org_tasks`
- `avatars` storage bucket: per-tenant path prefix

Stays NeuGain-only (platform admin):
- All CRM tables (`crm_companies`, `crm_stakeholders`, `crm_departments`, `crm_teams`, `crm_activities`, `crm_notes`, `stakeholder_registers`)
- Settings pages (`/settings/*`, user approvals, organization admin)

Left as-is:
- Static dashboards (Practice Library, ITSM, Command Center, KPI strips, charts) — pure demo data
- Sidebar, tenant login, route guard, `useTenantScope`
- NeuGain approval flow: tenants only see the dashboards/tools enabled for them in `tenant_tool_assignments` (no change — already working)
- Global catalogs (`tools_catalog`, `agents_catalog`, `integrations_catalog`)

## Approval / visibility model (no change needed)

A tenant user sees a dashboard only when **all three** are true — already enforced today:
1. NeuGain assigned the tool to the tenant (`tenant_tool_assignments.enabled = true`)
2. Sidebar filters nav by `useTenantScope().keys` / `routes`
3. `TenantAccessGuard` blocks direct URL access to unassigned routes

This plan does not alter that gating. It only ensures the *data* shown inside those dashboards is the tenant's own.

## 1. Lock CRM + Settings to platform admins

Replace current "approved user" RLS on CRM tables with platform-admin-only:

```sql
-- Repeat for crm_companies, crm_stakeholders, crm_departments, crm_teams,
-- crm_activities, crm_notes, stakeholder_registers
DROP POLICY "Approved read <table>"   ON public.<table>;
DROP POLICY "Approved insert <table>" ON public.<table>;
DROP POLICY "Approved update <table>" ON public.<table>;
DROP POLICY "Approved delete <table>" ON public.<table>;

CREATE POLICY "Platform admins manage <table>"
  ON public.<table> FOR ALL TO authenticated
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));
```

## 2. Tenant-scope the org hierarchy

Add `tenant_id uuid` to each org table:

```text
org_business_units      + tenant_id
org_practices           + tenant_id
org_capability_areas    + tenant_id
org_service_functions   + tenant_id
org_workflows           + tenant_id
org_activities          + tenant_id
org_tasks               + tenant_id
```

Backfill: assign existing rows to the first tenant in `tenants` (or leave null until a tenant exists, then add NOT NULL). Indexes on `tenant_id`.

New RLS — read requires tenant membership AND (implicitly via UI) that NeuGain has assigned the relevant dashboard. RLS itself only needs membership; assignment is enforced at the route/sidebar layer.

```sql
-- Repeat for each org_* table
DROP POLICY "Approved read <table>"           ON public.<table>;
DROP POLICY "Platform admins manage <table>"  ON public.<table>;

CREATE POLICY "Tenant members read <table>"
  ON public.<table> FOR SELECT TO authenticated
  USING (is_platform_admin(auth.uid()) OR is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant admins write <table>"
  ON public.<table> FOR INSERT TO authenticated
  WITH CHECK (
    is_platform_admin(auth.uid())
    OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin')
  );

CREATE POLICY "Tenant admins update <table>"
  ON public.<table> FOR UPDATE TO authenticated
  USING (is_platform_admin(auth.uid()) OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'))
  WITH CHECK (is_platform_admin(auth.uid()) OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));

CREATE POLICY "Tenant admins delete <table>"
  ON public.<table> FOR DELETE TO authenticated
  USING (is_platform_admin(auth.uid()) OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));
```

If you'd rather NeuGain be the only editor of org data, swap write policies for `is_platform_admin(auth.uid())` only. Default: tenant admins can edit their own org tree.

## 3. Auto-fill tenant_id on insert

DB trigger `set_tenant_id_from_membership()` on each org table:
- If `NEW.tenant_id IS NULL` and user is a tenant member, set to their tenant.
- If platform admin, require explicit `tenant_id`.

Keeps existing client mutations working.

## 4. Hook updates

- `src/hooks/org/useOrgEntity.ts` — read `tenantId` from `useTenantScope()`; add `.eq("tenant_id", tenantId)` to list/read; include `tenantId` in `queryKey`.
- CRM hooks — no change (platform-admin-only now).

## 5. Storage (`avatars` bucket)

- Path convention: `{tenant_id}/{user_id}/avatar.png` for tenant users; `platform/{user_id}/avatar.png` for platform admins.
- Update avatar upload code to prepend the correct prefix.
- New policies: tenant members read/write under their tenant prefix; platform admins read/write everything; public read stays.

## 6. Edge function

`supabase/functions/tenant-signup/index.ts` — if it seeds any org rows, set `tenant_id` to the new tenant.

## Order of execution

1. Migration: lock CRM/Settings RLS to platform admin
2. Migration: add `tenant_id` to org tables + backfill + NOT NULL + indexes + new RLS + auto-fill trigger
3. Update `useOrgEntity` to filter by tenant
4. Update avatar upload path + storage policies
5. Smoke test:
   - Tenant A user: only sees dashboards NeuGain assigned, only A's org data inside them, no CRM/Settings
   - Tenant B user: only sees their assigned dashboards with B's data
   - Platform admin (NeuGain): sees everything across all tenants
