# BP1.1 Release Notes — Platform Foundation

## Overview

BP1.1 delivers the Commercial Digital Twin platform foundation: tenants,
memberships, tenant-scoped roles and permissions, invitations, audit
events, and the `/platform` administration experience. BP1.1D adds
production hardening: repeatable tests, CI workflow, operational runbook,
release / rollback docs, and a technical-debt register.

## New capabilities

- Tenant provisioning (`provision_tenant`) with default roles / permissions.
- Tenant switcher (`/platform`) with query cancellation and cache clearing
  on switch.
- Members admin: invite, resend, cancel, role assignment, suspend /
  reactivate / deactivate (all with confirmation and last-administrator
  protection).
- Roles admin: create, edit metadata, permission matrix, archive with
  safeguards.
- Audit Explorer: date / actor / object / action filters, sensitive-key
  redaction in detail view.
- Tenant Settings and User Profile.
- Invitation acceptance at `/invitations/:token` with explicit states for
  expired / cancelled / already-used / email-mismatch.

## Security

- `anon` EXECUTE revoked on all BP1.1 privileged RPCs.
- Every `SECURITY DEFINER` function has an explicit `search_path`.
- Actor identity resolved via `auth.uid()`; browser-supplied actor IDs
  are not trusted.
- `audit_events` is append-only (UPDATE / DELETE rejected by trigger).
- User-safe error rendering; raw PostgREST messages are sanitized before
  display.

## Compatibility

- `app_role` / `user_roles` semantics unchanged.
- All RunOps, AVEP, CRM, ETDM, questionnaire, and settings routes
  preserved.

## Known technical debt

See `docs/bp1-1-technical-debt.md`.

## How to validate

```bash
./scripts/validate-bp1-1.sh
# With DB regression:
SUPABASE_DB_URL=postgres://postgres:postgres@localhost:5432/postgres \
  ./scripts/validate-bp1-1.sh
```
