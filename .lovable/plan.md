# Plan: Demo → Live data for tenants

## Goal
Today every tenant sees the same seeded mock from `src/data/eoc.ts`. We need a clean path to flip a tenant from "demo" to "live" without forking the app, while keeping the option to put enterprise customers on a dedicated database later.

## Architecture decisions (from your answers)
- **Isolation**: shared Supabase DB + RLS for everyone by default; reserve dedicated Supabase project per customer as a paid enterprise tier (not built now, just don't paint ourselves into a corner).
- **Switch granularity**: one flag per tenant — `tenants.data_mode = 'demo' | 'live'`.
- **Data origin**: external connectors (later) + manual ingestion (CSV upload / forms) now.
- **Scope**: build the full vertical slice for **Incidents** first — schema, RLS, hook, demo/live toggle, CSV upload. Pattern then repeats for KPIs, Alerts, Vendors, Change, SLO, etc.

## High-level shape

```text
┌────────────────────────────────────────────────────────┐
│  tenants.data_mode = 'demo' | 'live'                   │
└───────────────┬────────────────────────────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
   demo mode         live mode
   src/data/eoc.ts   tenant_incidents (RLS by tenant_id)
                          ▲
                ┌─────────┼──────────┐
                │         │          │
              CSV      Connector   Future:
             upload    ingestion   dedicated
            (now)      (later)     Supabase
                                   per customer
```

Every data hook (`useIncidents`, `useKpis`, …) calls one helper `useDataSource()` that returns `"demo" | "live"` based on the current tenant. The hook branches: demo → return seed; live → Supabase query scoped by `tenant_id`.

## Phase 1 — Schema (migration)

1. `ALTER TABLE public.tenants ADD COLUMN data_mode text NOT NULL DEFAULT 'demo' CHECK (data_mode IN ('demo','live'));`
2. New table `public.tenant_incidents` (the template for every future domain table):
   - `id uuid pk`, `tenant_id uuid not null`, `incident_number text`, `title text`, `severity text`, `status text`, `service text`, `owner text`, `opened_at timestamptz`, `resolved_at timestamptz`, `mttr_minutes int generated`, `source text default 'manual'` (`'manual' | 'csv' | 'servicenow' | …`), `external_id text`, `raw jsonb`, `created_at`, `updated_at`.
   - GRANTs: `authenticated` (SELECT/INSERT/UPDATE/DELETE), `service_role` ALL. No `anon`.
   - RLS:
     - SELECT: `is_platform_admin(auth.uid()) OR is_tenant_member(auth.uid(), tenant_id)`
     - INSERT/UPDATE/DELETE: `is_platform_admin OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin')`
   - Index on `(tenant_id, opened_at desc)`, unique `(tenant_id, source, external_id)` when external_id not null.
3. Reuse existing `set_tenant_id_from_membership` trigger so tenant users don't have to send `tenant_id` themselves.

## Phase 2 — Frontend data-source plumbing

New files:
- `src/hooks/useDataSource.ts` — reads current tenant (via `useTenantScope` for tenant users, current selection for platform admins) and returns `"demo" | "live"`. Cached via React Query.
- `src/hooks/data/useIncidents.ts` — single hook the UI uses. Branches on `useDataSource()`. Live branch queries `tenant_incidents` scoped to the current tenant. Demo branch returns seed from `src/data/eoc.ts`.
- Refactor `IncidentsPanel` (and the Incidents page) to consume `useIncidents()` instead of importing seed directly. No visual changes.

This is the template every future dashboard hook copies.

## Phase 3 — First ingestion: CSV upload

New page: `/crm/tenants/:tenantId/data` (platform admin) and `/t/:slug/admin/data` (tenant admin):
- File picker for CSV, expected columns documented inline.
- Client-side parse (`papaparse`), preview first 10 rows, column mapping UI (auto-map by header name).
- "Import" calls a new edge function `tenant-data-import` that:
  - Verifies caller is platform admin or `tenant_admin` of the target tenant.
  - Validates rows with Zod.
  - Bulk inserts into `tenant_incidents` with `source='csv'`, `external_id=<row hash>` for idempotency (`on conflict do update`).
  - Returns counts: inserted / updated / skipped / errors.
- Same page shows current row count and a "Switch to live data" toggle that flips `tenants.data_mode`. Disabled until at least one row exists for that domain.

## Phase 4 — Tenant settings UX

In `src/pages/crm/TenantSettingsPage.tsx`:
- New "Data" tab showing per-domain status: rows in DB, last import, current mode (demo/live), CSV upload entry point.
- Big tenant-level "Demo mode / Live mode" badge in the header. Switching to Live writes `data_mode='live'`.

Tenant preview page (`TenantPreviewPage.tsx`) and tenant workspace already render through hooks, so once hooks branch on `data_mode`, both views automatically reflect the right data.

## Phase 5 — Documented next steps (not built now)

These are wired-up extension points the code will support but we won't implement in this round:
- **Connector ingestion**: edge functions per integration (`tenant-ingest-servicenow`, …) triggered by pg_cron, writing to the same `tenant_*` tables with `source='servicenow'`. `tenant_integrations` already exists.
- **Per-domain `data_mode` override**: if a customer wants Incidents live but Vendors demo, we add `tenant_tool_assignments.data_mode` later; the hook helper already accepts an override arg.
- **Enterprise dedicated DB (Option C)**: `tenants.db_connection_id` column → `useDataSource` picks an alt Supabase client. Stub the column now (nullable) so the eventual switch is additive.

## Rollout
1. Migration (Phase 1) — review SQL together before applying.
2. Hook + Incidents refactor (Phase 2) — zero behavior change for users still in demo mode.
3. CSV upload + edge function + Data tab (Phases 3–4).
4. Pilot with one real customer on Incidents only; everyone else stays in demo. Repeat the pattern for KPIs / Alerts / Vendors once validated.

## Technical notes
- No data is moved out of `src/data/eoc.ts`; it stays as the demo source forever.
- `data_mode` lives on `tenants` (not user-level) so a tenant's whole org sees the same state — no "half the team sees mock numbers" situations.
- All ingestion goes through edge functions, never direct client writes, so we can enforce schema, dedupe, and audit centrally.
- KPI cards that are computed (MTTR, incident count) will derive from `tenant_incidents` in live mode via a SQL view or a small RPC — decided per-KPI when we extend the pattern.
- Stub `tenants.db_connection_id uuid null` now so moving an enterprise customer to a dedicated Supabase project later is a config change, not a refactor.
