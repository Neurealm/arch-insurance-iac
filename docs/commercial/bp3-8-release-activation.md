# BP3.8 — Governed Model Activation, Release Lineage, Readiness Certification, and Production Handoff

Status: **Built; Pending Runtime Execution and Independent Validation.**

## 1. Purpose

BP3.8 closes the Project Momentous commercial model lifecycle. It replaces the
placeholder described in `bp3-0-2-model-activation.md` with a governed,
server-authoritative activation workflow that certifies release readiness,
freezes deterministic evidence hashes, records immutable activation lineage, and
supersedes prior active versions atomically.

## 2. Data model

| Object | Role |
|---|---|
| `commercial_release_certifications` | Frozen readiness snapshot + release manifest per model version. Status `draft → ready → certified`, or `invalidated`. Carries `readiness_hash`, `manifest_hash`, `content_hash`, and control counters. |
| `commercial_release_lineage` | Upstream → downstream evidence edges bound to a certification (assumptions, model runs per scope/scenario, comparisons, sensitivity experiments). |
| `commercial_model_activations` | Immutable activation records: activated version, certification reference, prior active version, lineage summary, snapshot hashes, `active`/`superseded` status. |

All three tables are tenant-scoped, RLS-enabled, and readable only by members
holding `commercial.view`. Writes are performed exclusively by
`SECURITY DEFINER` RPCs; direct client `INSERT`/`UPDATE`/`DELETE` is rejected by
immutability guard triggers.

## 3. Permissions

| Permission | Grants |
|---|---|
| `commercial.release.certify` | Create, refresh, certify, and invalidate release certifications. |
| `commercial.model.version.activate` | Activate a certified version and open successor drafts. |

Platform admin bypass follows the existing `commercial_can_write` contract.

## 4. Readiness control framework

`public.commercial_release_readiness(_model_version_id uuid)` returns the
authoritative control set. Controls are grouped by category (Model
configuration, Assumptions, Revenue, P&L, Cash, Comparison, Sensitivity,
Documentation, Security, Lineage) and each carries:

- `status` — `pass` / `warning` / `fail` / `not_applicable`
- `severity` — `info` / `warning` / `blocking`
- `blocking` — activation is refused while any blocking control fails
- `expected_value`, `actual_value`, `evidence_reference`, `remediation_hint`

Readiness is never computed in the browser. The UI renders exactly what the RPC
returns.

## 5. Lifecycle RPCs

| RPC | Contract |
|---|---|
| `commercial_release_certification_create(_model_version_id, _notes)` | Evaluates readiness, writes the snapshot + manifest + lineage, sets status `ready` when zero blocking failures, otherwise `draft`. |
| `commercial_release_certification_refresh(_certification_id)` | Re-evaluates and rewrites a non-certified certification. Certified rows are immutable. |
| `commercial_release_certification_certify(_certification_id, _note)` | Requires `ready` status and zero blocking failures; freezes `content_hash` and stamps `certified_at`. |
| `commercial_release_certification_invalidate(_certification_id, _reason)` | Governed rollback path; reason is mandatory and audited. |
| `commercial_model_version_activate(_model_version_id, _certification_id, _reason)` | Requires a certified, non-invalidated certification for the same version, zero blocking failures, and a `draft` source version. Supersedes the prior active version and its activation record in one transaction. |
| `commercial_model_version_create_successor(_model_version_id, _version_code, _name)` | Opens a new draft version linked to its predecessor. |

Every RPC writes an `audit_events` row (`commercial.release.*`,
`commercial.model.version.activated`) with actor, object, prior state, and
hashes.

## 6. Immutability guarantees

- Certified certifications cannot be mutated except to `invalidated`.
- Activation records are insert-only; only `status`/`superseded_at` may move
  `active → superseded`.
- No historical `commercial_model_runs`, `commercial_model_results`, comparison
  or sensitivity row is touched by any BP3.8 code path. Activation is
  metadata-only.
- The partial unique index on `commercial_model_versions` continues to guarantee
  at most one `active` version per `(tenant_id, program_id)`; a matching partial
  unique index enforces one `active` activation record per program.

## 7. UI surface

- `/commercial/model/release` — version register (status, formula catalog,
  activation timestamps) and program activation history.
- `/commercial/model/release/:versionId` — readiness controls by category,
  certification actions, lineage evidence, and the production handoff tab with
  type-to-confirm activation and successor-draft creation.

Both routes are gated by `commercial.view`; mutating controls are additionally
gated by the BP3.8 permissions.

## 8. Governance notes

- Activation is a deliberate administrative act. Successful calculations are
  never grounds for automatic activation.
- Warnings do not block activation but are persisted on the activation record so
  the handoff carries its own caveat register.
- The directional-model caveat continues to apply to every derived surface.
