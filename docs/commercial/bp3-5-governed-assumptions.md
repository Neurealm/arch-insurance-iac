# BP3.5 · Governed Assumption Editing, Change Sets, Validation & Runtime Readiness

## Purpose
Provide a controlled path for authorized users to change Project Momentous scenario assumptions and refresh downstream models — without ever mutating historical Revenue, P&L, or Cash runs.

## Lifecycle

```
Draft ── validate ──▶ Validated ── apply ──▶ Applied
  │                       │
  └────────── cancel ─────┴──▶ Cancelled  (terminal)
```

- **Draft** — items can be added, edited, removed. `change_count` and `content_hash` are recomputed automatically.
- **Validated** — snapshot of proposed values passes server-side rules. Header becomes immutable except through `apply` / `cancel`.
- **Applied** — `commercial_scenario_assumptions` is updated in a single transaction. Historical model runs are untouched. Cash / P&L / Revenue pages show a staleness banner until re-executed.
- **Cancelled** — permanent.

## Server-Authoritative Access

| Action                              | Permission                                 |
| ----------------------------------- | ------------------------------------------ |
| Create Draft change set             | `commercial.assumption.change.create`      |
| Add/edit/remove Draft items         | `commercial.assumption.change.create`      |
| Validate                            | `commercial.assumption.change.validate`    |
| Apply                               | `commercial.assumption.change.apply`       |
| Cancel                              | `commercial.assumption.change.cancel`      |

Platform admins bypass all permission checks. RLS restricts SELECT to the owning tenant. All writes go through `SECURITY DEFINER` RPCs (direct INSERT/UPDATE is blocked by policies).

## Runtime Readiness (staleness)

`commercial_program_run_staleness(program_id)` compares the timestamp of the latest completed run per `(run_scope, scenario)` against the last apply for the program. Any scope whose latest run predates the last apply is flagged `is_stale = true`. The Assumptions page renders this as a banner and the Revenue / P&L / Cash pages can re-run to refresh outputs.

## Immutability & Audit

- Apply persists a full JSON snapshot of items into `commercial_assumption_apply_log` (content-hashed).
- Every lifecycle transition emits an `audit_events` row (`commercial.assumption.change_set.*`).
- Content-hash mismatch between validation and apply (someone edited the underlying assumption in the meantime) reverts the set to Draft and refuses to apply — preventing silent divergence.

## Impact Classification

`commercial_classify_impact(code)` mirrors the client-side classifier. It maps codes to `{revenue, pnl, cash, unknown}` so users can see which downstream scopes will need re-execution before applying.

## Files

- Database: `commercial_assumption_change_sets`, `commercial_assumption_change_set_items`, `commercial_assumption_apply_log`
- RPCs: `commercial_change_set_create`, `_upsert_item`, `_remove_item`, `_validate`, `_apply`, `_cancel`, `commercial_program_run_staleness`, `commercial_classify_impact`, `commercial_change_set_hash`
- UI: `src/commercial/pages/CommercialAssumptions.tsx`, `src/commercial/pages/CommercialAssumptionChangeSet.tsx`
- Hook: `src/commercial/hooks/useAssumptionChangeSets.ts`
- Routes: `/commercial/model/assumptions`, `/commercial/model/assumptions/change-sets/:id`
