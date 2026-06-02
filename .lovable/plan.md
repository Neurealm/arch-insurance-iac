The project just got switched to a fresh Supabase backend (`esfpbiishpkvhlejnxzq`). The new database is empty (no tables, functions, triggers, storage buckets, or secrets beyond defaults), but the app code expects the full existing schema (tenants, memberships, tool assignments, CRM, org hierarchy, profiles, user roles, email infra, etc.) that was built up across 26 migrations against the old backend.

I'll rebuild that schema on the new backend so the app works again.

## What I'll do

1. **Replay schema** — Apply the consolidated contents of all 26 files in `supabase/migrations/` as a single new migration against the new Supabase project. This recreates:
  - Auth/role infra: `profiles`, `user_roles` + `app_role` enum, `has_role` / `is_platform_admin` / `is_tenant_member` / `has_tenant_role` security-definer functions
  - Tenancy: `tenants`, `tenant_memberships`, `tenant_tool_assignments`
  - Catalogs: `tools_catalog`, `agents_catalog`, `integrations_catalog`
  - CRM: `crm_companies`, `crm_stakeholders`, `crm_departments`, `crm_teams`, `crm_activities`, `crm_notes`, `stakeholder_registers`
  - Org hierarchy: `org_business_units`, `org_practices`, `org_capability_areas`, `org_service_functions`, `org_workflows`, `org_activities`, `org_tasks`
  - Triggers (`update_updated_at_column`, tenant-id auto-fill, etc.)
  - RLS policies + GRANTs for all of the above
  - Email queue infra (pgmq queue, RPC wrappers, cron job) used by `auth-email-hook` and `process-email-queue`
2. **Storage bucket** — Recreate the `avatars` bucket (public) with the per-tenant path policies the app expects.
3. **Edge functions** — Redeploy the four existing functions (`auth-email-hook`, `process-email-queue`, `tenant-invite`, `tenant-signup`) against the new project. No code changes; just deployment.
4. **Seed minimum admin** — After migrations land, I'll point out that you need to sign up once, then I (or you via SQL) will grant your user the `platform_admin` role so you can reach `/settings` and the NeuRealm workspace. No user data is migrated from the old backend.
5. **Verify** — Run the Supabase linter and a quick read on `tenants` / `tools_catalog` to confirm the schema is reachable through PostgREST with proper GRANTs.

## What I will NOT do

- No app/UI code changes — the frontend already targets the new backend via the auto-updated `.env`.
- No data migration from the old Supabase project (you didn't ask, and credentials for the old DB aren't available here).
- No changes to the plan in `.lovable/plan.md` (tenant-isolation refactor) — that's a separate effort.

## Things to confirm before I start

- **Catalog seed data** (tools_catalog, agents_catalog, integrations_catalog rows) — the old DB likely had seed rows for the sidebar/tool assignments to work. The migration files may or may not include them. If they don't, the sidebar will be empty for tenants until rows are inserted. Want me to also seed a baseline catalog (derived from the routes/keys referenced in the app) as part of this migration? yes
- **Your admin account** — after the schema is up, do you want me to insert a `platform_admin` row for a specific email you'll sign up with, or will you handle that yourself in the SQL editor?   
make below users as super admins  
  
[ryan.blackwell@neurealm.com](mailto:ryan.blackwell@neurealm.com)  
[vidyarth.v@neurealm.com](mailto:vidyarth.v@neurealm.com)  
[bala.janagaraja@neurealm.com](mailto:bala.janagaraja@neurealm.com)  
[srikanth.burra@neurealm.com](mailto:srikanth.burra@neurealm.com)