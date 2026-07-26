# BP3.6 — Test Evidence (BUILD stage)

## Implementation summary
- Migration `20260725-214656` created: 3 tables, 4 permissions, 9 SECURITY DEFINER functions, 5 triggers, seed directionality.
- Migration `20260725-214826` patched `commercial_comparison_readiness` to use canonical staleness columns.
- Frontend: `useComparisons.ts` hook module + `CommercialCompare.tsx` list/config + `CommercialCompareDetail.tsx`.
- Routes registered under `/commercial/model/compare` and `/commercial/model/compare/:id`.
- Sidebar link added in `CommercialLayout.tsx`.

## Schema inventory
| Object | Type |
|---|---|
| `commercial_scenario_comparisons` | table |
| `commercial_scenario_comparison_results` | table |
| `commercial_metric_directionality` | table (20 seed rows) |
| `commercial_comparison_create` | RPC |
| `commercial_comparison_update_draft` | RPC |
| `commercial_comparison_calculate` | RPC |
| `commercial_comparison_save` | RPC |
| `commercial_comparison_archive` | RPC |
| `commercial_comparison_readiness` | RPC |
| `commercial_comparison_assumptions` | RPC |
| `commercial_comparison_list_selectable_runs` | RPC |
| `commercial_comparison_build_manifest` | RPC (internal) |
| `commercial_comparison_compute_hash` | RPC (internal) |
| `commercial_enforce_same_tenant_comparison` | trigger fn |
| `commercial_comparison_header_guard` | trigger fn |
| `commercial_comparison_result_guard` | trigger fn |

## Test matrix (pending runtime execution)
| # | Test | Method | Status |
|---|---|---|---|
| 1 | Pairwise comparison | RPC create+calculate | pending BP3.6.EXECUTE |
| 2 | Three-way comparison | RPC create+calculate | pending |
| 3 | Baseline selection | RPC create | pending |
| 4 | Current run selection | build_manifest | pending |
| 5 | Historical run rejection when incomplete | build_manifest | pending |
| 6 | Failed/superseded rejection | build_manifest filter | schema-enforced |
| 7 | Cross-tenant rejection | trigger `enforce_same_tenant_comparison` | schema-enforced |
| 8 | Cross-program rejection | tenant/program FK + trigger | schema-enforced |
| 9 | Cross-model-version rejection | manifest filter | schema-enforced |
| 10 | Metric alignment | calculate join | pending |
| 11 | Missing metric handling | LEFT-JOIN absent | pending |
| 12 | Unit mismatch handling | unit in join key | schema-enforced |
| 13 | Absolute variance | SQL expression | pending |
| 14 | Percentage variance | SQL expression | pending |
| 15 | Zero-baseline handling | CASE expression | pending |
| 16 | Favorable/unfavorable | direction table + CASE | pending |
| 17 | Effective assumptions | assumptions RPC | pending |
| 18 | Draft proposals excluded | reads scenario_assumptions only | design |
| 19 | Cancelled proposals excluded | same | design |
| 20 | Applied values included | same | design |
| 21 | Scope-aware staleness | readiness RPC | pending |
| 22 | Missing-run behavior | manifest status=missing | pending |
| 23 | Stale-at-creation persisted | save RPC | pending |
| 24 | Source-run manifest correctness | jsonb inspection | pending |
| 25 | Deterministic hashing | compute_hash | pending |
| 26 | Draft mutability | update_draft | pending |
| 27 | Saved immutability | header_guard | trigger-enforced |
| 28 | Archived immutability | header_guard | trigger-enforced |
| 29 | Permission enforcement | can_write + explicit RPC checks | schema-enforced |
| 30 | Tenant isolation | RLS `commercial_is_member_with_view` | schema-enforced |
| 31 | Canonical audit events | emit_audit_event per lifecycle | pending |
| 32 | No auto model execution | zero calls to run scenario | design |
| 33 | No historical-run mutation | no writes to runs/results | design |

## Regression
- Revenue/P&L/Cash formulas: **unchanged**.
- Completed runs, hashes, lineage, supersession: **unchanged**.
- Effective assumptions: **unchanged**.
- Staleness helper: **unchanged**.
- Golden baselines: **unchanged**.

## Build results
- `tsgo --noEmit`: clean.
- Supabase linter: pre-existing 101 project-wide warnings; no new categories introduced by BP3.6 (all new SECURITY DEFINER functions revoke from PUBLIC/anon, pin search_path).

## Known limitations
- No visualization charts in BP3.6 (table-first UI); recharts can be added incrementally.
- Historical mode UI surfaces the same manifest builder; ability to hand-pick prior runs is deferred to a follow-up UI enhancement.
- BP3.7 sensitivity analysis and BP3.8 activation/lineage enrichment not started.

## Runtime execution — PENDING BP3.6.EXECUTE
End-to-end test evidence (Draft → Save → Archive; hash stability; stale flag persistence) must be captured against a signed-in analyst session in BP3.6.EXECUTE.

## BP3.6.1 — Snapshot Hashing Repair
- **Observed error:** `function digest(text, unknown) does not exist` on Save Snapshot.
- **Root cause:** `pgcrypto` is installed in schema `extensions`; BP3.6 Save + hash functions called unqualified `digest()` under `SET search_path=public`, so the overload was unresolvable and PostgreSQL reported the `text, unknown` signature error.
- **Preflight rollback:** Failed Save rolled back atomically — comparison remained `draft`, `saved_by/saved_at` null, no snapshot rows, no manifest freeze, no audit event, no model run.
- **Installed hash capability:** `pgcrypto` present in `extensions`; `extensions.digest(bytea, text)` available.
- **Affected BP3.6 functions:** `public.commercial_comparison_compute_hash`, `public.commercial_comparison_save` (manifest hash line).
- **Remediation:** Replaced both call sites with the canonical pattern `encode(extensions.digest(convert_to(<text>, 'UTF8'), 'sha256'::text), 'hex')`. RPC signatures, transaction ordering, permissions, and immutability guards unchanged. EXECUTE revoked from PUBLIC/anon, granted to `authenticated`.
- **Sanity check:** `encode(extensions.digest(convert_to('test','UTF8'),'sha256'::text),'hex')` returns the canonical SHA-256 `9f86d081…0a08`.
- **Authenticated Save verification:** Pending — requires browser action by an analyst on the existing Draft `BP3.6 Three-Way Runtime Test` to capture PASS evidence (comparison hash, manifest hash, snapshot row count, stale-at-creation, audit event).

## BP3.6.2 — Result Tenant Propagation Repair
- **Observed error:** `null value in column "tenant_id" of relation "commercial_scenario_comparison_results" violates not-null constraint` on Save Snapshot for comparison `89cd8566-ef82-48a0-806c-6a2a719c2419`.
- **Preflight rollback:** Save transaction rolled back atomically — comparison remained `draft`, `saved_by/saved_at` null, no snapshot rows, no manifest freeze, no audit event, no model run.
- **Root cause:** `public.commercial_comparison_save` insert into `commercial_scenario_comparison_results` omitted the NOT NULL `tenant_id` column (and passed NULL for the NOT NULL `comparison_rule` column, which is defaulted).
- **Remediation:** Replaced `commercial_comparison_save` to server-derive `tenant_id` from the parent `commercial_scenario_comparisons.tenant_id` (`v_row.tenant_id`) and propagate it into every inserted result row. Set explicit `comparison_rule = 'compared_minus_baseline'`. Function signature, SECURITY DEFINER, `search_path=public`, permission gate (`commercial.comparison.save`), Draft-only guard, transaction ordering, deterministic manifest + content hashing (BP3.6.1), stale-at-creation flag, lifecycle marker, canonical `commercial.comparison.saved` audit event, and rollback semantics all preserved. EXECUTE revoked from PUBLIC/anon; granted to `authenticated`.
- **Tenant contract:** Result row `tenant_id` is derived exclusively server-side from the parent comparison header — never accepted from client input.
- **Authenticated Save verification:** Pending — requires analyst to click Save snapshot → Confirm save on the existing Draft `BP3.6 Three-Way Runtime Test`, then run `BP3.6.2.PATCH-VERIFY`.
