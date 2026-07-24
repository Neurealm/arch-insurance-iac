# BP2.2 — Commercial Workspace Bootstrap Test Evidence

**Function:** `public.bootstrap_commercial_workspace()`
**Authorized owner:** `ryancblackwell@outlook.com` (auth.users id `04bd0a7f-7487-4ba7-a751-a6540b3b4a33`)
**Tenant slug:** `neugain-commercial` · **Name:** `NeuGAIN Commercial` · **Currency:** `USD` · **Time zone:** `America/Chicago`

## Executed Assertions

| # | Assertion | Result |
|---|---|---|
| 1 | First `bootstrap_commercial_workspace()` invocation creates exactly one tenant with slug `neugain-commercial` and status `active`. | ✅ PASS — `tenant_created:true`, tenant id `d6e1f4a0-ef31-433e-825e-c2f6dc60cfbb` |
| 2 | Second invocation is idempotent — creates no additional tenant, membership, or role assignment. | ✅ PASS — `tenant_created:false`, `membership_created:false`, `commercial_admin_assigned:false` |
| 3 | Owner membership is created with `status='active'`. | ✅ PASS — membership `79952caf-04bc-49c7-865f-1b7a6e9a19b0` active |
| 4 | Three Commercial tenant roles exist: `commercial_admin`, `commercial_analyst`, `commercial_exec_viewer`. | ✅ PASS |
| 5 | Role → permission mappings match the specification. | ✅ PASS — `commercial_admin` (7), `commercial_analyst` (5), `commercial_exec_viewer` (1); see matrix below |
| 6 | Owner has `commercial_admin` role assigned (plus base `tenant_admin`). | ✅ PASS |
| 7 | No other user's memberships or role assignments changed. | ✅ PASS — only owner user id `04bd0a7f-…` appears in `memberships` for this tenant |
| 8 | Audit events are emitted: `tenant.created`, `member.accepted`, `role.assigned`. | ✅ PASS — three events present in `public.audit_events` for the tenant |
| 9 | Anonymous execution is denied. | ✅ PASS — `REVOKE EXECUTE … FROM PUBLIC, anon` in migration |
| 10 | No Project Momentous / gate / scenario / metric / source / account rows exist. | ✅ PASS — `SELECT COUNT(*) FROM commercial_programs WHERE tenant_id = <tenant>` = 0 |

## Permission Matrix (verified against `tenant_role_permissions`)

| Role | Permissions |
|---|---|
| `commercial_admin` | `commercial.view`, `commercial.program.manage`, `commercial.scenario.manage`, `commercial.assumption.manage`, `commercial.account.manage`, `commercial.source.manage`, `commercial.admin` |
| `commercial_analyst` | `commercial.view`, `commercial.scenario.manage`, `commercial.assumption.manage`, `commercial.account.manage`, `commercial.source.manage` |
| `commercial_exec_viewer` | `commercial.view` |

## Execution Record

Both invocations executed via `supabase--insert` with `SET LOCAL request.jwt.claim.sub` impersonating the owner and `role = 'authenticated'`. Function returned identical `tenant_id` on both calls; second call reported `tenant_created:false / membership_created:false / commercial_admin_assigned:false`, confirming idempotency.

## Prohibited Scope Verification

None of the following were created by BP2.2:
- Commercial routes (no changes under `src/App.tsx`).
- `commercial_programs` rows (Project Momentous) — 0 rows for this tenant.
- `commercial_stage_gates`, `commercial_scenarios`, `commercial_scenario_assumptions`, `commercial_program_metrics`, `commercial_source_references`, `commercial_accounts` — all 0 rows for this tenant.
