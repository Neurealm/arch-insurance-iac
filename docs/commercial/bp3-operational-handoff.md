# BP3 — Commercial Digital Twin Operational Handoff

Status: Closeout Documentation Authored, Pending Closeout Execution and Independent Validation.
Companion to `docs/commercial/operator-guide.md` (workspace navigation) and
`docs/commercial/bp3-program-closeout.md` (authoritative closeout record).

## 1. Purpose

This guide hands the BP3 Commercial Digital Twin to production operations. It defines what an
operator may observe, what they may do, what they must never do, and how to escalate.
All queries below are read-only and tenant-scoped.

## 2. Production release identity

| Field | Value |
|---|---|
| Tenant | NeuGAIN Commercial — `d6e1f4a0-ef31-433e-825e-c2f6dc60cfbb` |
| Program | Project Momentous — `877dcf86-24a4-443f-95bd-28e24952bb80` (`PROJECT_MOMENTOUS`) |
| Active model version | PM-FIN-2026.1 — `5097c3a9-021e-4b2c-9377-540a5d18ada6` |
| Activated | 2026-07-26 21:18:52.696359+00 |
| Certification | `86f09fd7-39f9-4994-bb09-a7ace339634c` |
| Activation | `eefc6c50-b73f-41d3-8def-f6ff244000d9` |
| Successor | Not created |

## 3. Active model-version lookup

UI: `/commercial/model/release` — the register shows the `active` badge.

```sql
select id, version_code, status, formula_catalog_version, updated_at
from public.commercial_model_versions
where program_id = '877dcf86-24a4-443f-95bd-28e24952bb80';
```

## 4. Release evidence lookup

UI: `/commercial/model/release/5097c3a9-021e-4b2c-9377-540a5d18ada6` — Readiness,
Certification, Lineage and Handoff tabs.

```sql
select id, status, readiness_hash, manifest_hash, content_hash, certified_at
from public.commercial_release_certifications
order by created_at;
```

## 5. Model-run monitoring

```sql
select run_scope, scenario_id, status, input_hash, completed_at
from public.commercial_model_runs
order by completed_at desc nulls last
limit 50;
```

Expected steady state: 18 completed runs, 9 of them authoritative (one per scope × scenario),
zero runs in `queued` or `running` for longer than a few minutes.

## 6. Readiness monitoring

UI: Readiness tab KPI cards (controls / passing / warnings / blocking failures).
Expected: 22 controls, 0 blocking failures, 1 warning (`SENS-LABEL-FMT`). A post-activation
display of 20 passes instead of 21 is expected and non-defective — see DEF-02.

## 7. Certification history

Two records exist and both must remain: one invalidated
(`4bfd28b0-0d5c-4a1b-a670-66895150ee4b`) and one certified
(`86f09fd7-39f9-4994-bb09-a7ace339634c`). Invalidated history is evidence, not noise.

## 8. Activation history

```sql
select id, status, activated_at, activation_reason, prior_active_version_id
from public.commercial_model_activations;
```

Exactly one row with `status = 'active'` is expected.

## 9. Audit-event review

```sql
select action_code, count(*), max(created_at)
from public.audit_events
where action_code like 'commercial.%'
group by action_code
order by action_code;
```

## 10. Comparison evidence review

UI: `/commercial/model/compare`. Two comparisons exist (1 saved, 1 archived) with 996 result
rows. Comparison never triggers model execution.

## 11. Sensitivity evidence review

UI: `/commercial/model/sensitivity`. One completed experiment
(`e2b3499e-a96a-4fd2-8aeb-b8b0fb8fffb9`), 5 perturbations, 15 sensitivity runs, 1,660 results.

## 12. Active-version immutability

The Active version's formulas, assumptions, runs, inputs, results and hashes are frozen.
There is no supported path to edit them in place. Any change requires a successor version.

## 13. Successor-version workflow

1. Register a successor model version (for example PM-FIN-2026.2) with
   `commercial.model.manage`.
2. Apply governed assumption change sets as required.
3. Execute Revenue, P&L and Cash for all scenarios.
4. Refresh readiness until blocking failures are zero.
5. Certify the release.
6. Activate with a typed confirmation of the successor version code; the prior version is
   superseded atomically.

## 14. Allowed operator actions

1. View all commercial routes with `commercial.view`.
2. Run read-only monitoring queries.
3. Create and save comparisons (with the appropriate permission).
4. Create and execute sensitivity experiments (with `commercial.sensitivity.run`).
5. Recover a failed sensitivity experiment via the governed reset control.
6. Export nothing — export is not implemented.

## 15. Prohibited operator actions

1. Direct SQL INSERT, UPDATE or DELETE against any `commercial_*` table.
2. Editing hashes, manifests, snapshots or lineage.
3. Deleting failed, superseded or invalidated evidence.
4. Forcing a model-version status change outside the activation RPC.
5. Re-activating an already-active version.
6. Creating a successor version without certification.
7. Using service-role credentials from a browser context.

## 16. Incident classification

| Class | Example | First response |
|---|---|---|
| SEV-1 | Active version missing, duplicated, or activation row inconsistent | Escalate immediately to platform administrator; take no corrective write |
| SEV-2 | Model run stuck in `running`, or readiness shows a new blocking failure | Capture run ID and readiness output; escalate to model owner |
| SEV-3 | Sensitivity experiment `failed` | Use governed failed→draft reset and re-execute |
| SEV-4 | Presentation defect (for example BP3.7.4 labels) | Log against the deferred-item register |

## 17. Recovery boundaries

Recovery is limited to governed RPC paths: sensitivity failed→draft reset, re-execution of a
scope through the UI, and certification refresh/invalidate. There is no supported manual
data-repair path. Superseded and failed records are never deleted.

## 18. Escalation matrix

| Level | Role | Scope |
|---|---|---|
| 1 | Commercial operator | Monitoring, read-only queries, sensitivity recovery |
| 2 | Model owner (`commercial.model.manage`) | Assumption change sets, re-runs, certification |
| 3 | Platform administrator | Permissions, tenant membership, activation authority |
| 4 | Engineering | Function, migration or Edge Function defects |

## 19. Security and permission model

All governed functions are `SECURITY DEFINER`, owned by `postgres`, with `search_path`
pinned to `public`. Permissions in use: `commercial.view`, `commercial.model.run`,
`commercial.model.manage`, `commercial.sensitivity.run`,
`commercial.model.version.activate`. Actor and tenant are always derived server-side.
No credentials, tokens or service-role material appear in this guide or in audit payloads.

## 20. Tenant-isolation expectations

Every commercial table has RLS enabled with `authenticated`-scoped, tenant-gated policies.
Anonymous reads return zero rows. Cross-tenant reads are not possible through the application
runtime.

## 21. Audit-query guidance

Query `public.audit_events` filtered by `action_code like 'commercial.%'` and by time window.
Audit payloads intentionally exclude financial values; use the run and result tables for
figures and the audit trail for lifecycle chronology.

## 22. Data-retention expectations

Model runs, run inputs, results, comparison snapshots, sensitivity results, certifications,
activations, lineage and audit events are retained indefinitely. Purging any of these
destroys release evidence and is prohibited.

## 23. Evidence-preservation rules

1. Never delete a failed run, superseded run or invalidated certification.
2. Never rewrite a hash.
3. Never edit a historical evidence document; add a dated reconciliation note instead.
4. Preserve the association between each certification and its lineage rows.

## 24. Known warnings

| ID | Warning |
|---|---|
| BP3.7.4 | Perturbation percentage-label formatting (presentation only) |
| DEF-02 | Post-activation readiness pass count displays 20 rather than 21 |
| DEF-05 | 37 `commercial_*` functions remain anonymously executable but fail closed |
| DEF-09 | Release-lineage source-hash coverage is 4 of 22 rows |

## 25. Support ownership

Ownership is expressed by role, not by named individual: commercial operators (level 1),
the Project Momentous model owner (level 2), platform administrators (level 3), and
engineering (level 4).

## 26. Handoff checklist

1. Confirm PM-FIN-2026.1 is the only Active version.
2. Confirm certification `86f09fd7-39f9-4994-bb09-a7ace339634c` is `certified`.
3. Confirm activation `eefc6c50-b73f-41d3-8def-f6ff244000d9` is `active`.
4. Confirm 22 lineage rows with zero broken references.
5. Confirm 9 authoritative runs, 0 stale scopes.
6. Confirm 0 open assumption change sets.
7. Confirm readiness shows 0 blocking failures.
8. Confirm operators hold `commercial.view` and no unnecessary write permissions.
9. Confirm the deferred-item register has been reviewed.
10. Confirm escalation contacts are populated in the operations directory.
