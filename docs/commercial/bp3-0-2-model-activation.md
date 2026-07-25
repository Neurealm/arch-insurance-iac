# BP3.0.2 — Commercial Model Version Activation Workflow

## Status
**Not implemented.** No governed `commercial_model_version_activate` RPC exists in
the database. The `commercial_model_versions` table supports a `status` column
and a partial unique index guaranteeing at most one `active` version per
`(tenant_id, program_id)`, but no RPC, permission, UI control, or audit hook
performs the transition.

Draft-to-active promotion must therefore be treated as a future controlled
build, not an in-page shortcut. Calculations succeeding is **not** grounds for
automatic activation.

## Required capability (future BP)
1. **Permission** — introduce `commercial.model.version.activate`, granted only
   to a Commercial Model Administrator role. Platform admin bypass acceptable.
2. **RPC** — `public.commercial_model_version_activate(_version_id uuid, _note text)`
   as `SECURITY DEFINER`:
   - Verify caller holds the permission for the version's tenant.
   - Verify the version is currently `draft` and belongs to a program the caller
     can access.
   - Verify at least one completed revenue run exists for the version across all
     baseline scenarios (Conservative, Base, Upside).
   - `UPDATE commercial_model_versions SET status='superseded' WHERE ... status='active'`
     for the same `(tenant_id, program_id)`.
   - `UPDATE commercial_model_versions SET status='active', activated_at=now(),
     activated_by=auth.uid() WHERE id=_version_id`.
   - Insert an `audit_events` row with `action='commercial.model.version.activated'`,
     capturing prior status, actor, note, and version code.
   - Reject if any historical `commercial_model_runs` row for this version would
     be mutated — activation must be metadata-only.
3. **UI** — an "Activate model version" button on `/commercial/model/revenue`
   gated on the permission, opening a confirmation dialog that requires the
   admin to type the version code and optionally provide a note. Disabled
   whenever any baseline scenario lacks a completed run.
4. **Immutability** — no run inputs, results, or hashes may be modified as a
   side effect. The existing immutability triggers on
   `commercial_model_runs` / `commercial_model_results` already enforce this;
   the activation RPC must not touch those tables.

## Interim behavior (BP3.0.2)
- The draft warning banner remains visible whenever
  `commercial_model_versions.status <> 'active'`, and its wording explicitly
  states that a governed activation workflow is required.
- The Run button remains available so drafts can be exercised for review, but
  produced runs remain associated with the draft version.
- No client-side or edge-function code path may set `status='active'`.
