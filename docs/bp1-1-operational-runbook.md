# BP1.1 Platform Foundation — Operational Runbook

Audience: platform administrators and on-call engineers operating the
NeuGAIN / Neurealm Commercial Digital Twin platform foundation delivered by
Build Packages BP1.1A / BP1.1B / BP1.1C.

## 1. Provision a tenant

1. Sign in as a `platform_admin`.
2. Open **/platform** → click **New Workspace**.
3. Enter name, slug, currency (ISO 4217), timezone (IANA).
4. Confirm. `provision_tenant` runs transactionally — on failure nothing is
   persisted. Success writes a `tenant.provisioned` audit event.

## 2. Add a tenant administrator

1. In **/platform/members**, click **Invite Member**, enter the email, and
   assign the tenant `admin` role.
2. Recipient accepts via `/invitations/:token`.
3. Verify `count_active_tenant_admins(<tenant>)` returned by the platform
   home matches expectation.

## 3. Invite / resend / cancel

- Resend: **Invitations** table → row action → Resend. Rotates token, extends
  expiry, writes `invitation.resent`.
- Cancel: row action → Cancel with confirmation. Writes `invitation.cancelled`.

## 4. Invitation failure

| Symptom | Likely cause | Action |
|---|---|---|
| `INVITATION_NOT_FOUND` | Bad or already-cancelled token | Ask admin to resend |
| `INVITATION_EXPIRED` | Past `expires_at` | Resend to rotate token |
| `INVITATION_ALREADY_ACCEPTED` | Replay | No action; membership exists |
| `INVITATION_EMAIL_MISMATCH` | Wrong signed-in user | Sign in as the invited email |

## 5. Suspend / reactivate / deactivate

All three actions require confirmation and go through `set_membership_status`.
The last-administrator safeguard rejects the change with
`LAST_LOCAL_ADMIN_PROTECTED` when it would leave the tenant with zero
active local admins. Resolution: grant admin to another member first, then
retry.

## 6. Resolve last-administrator protection

1. In **/platform/members**, invite or promote another user to the tenant
   admin role.
2. Confirm `count_active_tenant_admins()` ≥ 2.
3. Retry the suspend / deactivate action.

## 7. Create and maintain roles

- **/platform/roles** → **New Role**. Set `code`, `name`, permissions.
- `code` is immutable after first use.
- Archive is blocked when the role is the only bearer of an administrative
  permission on any active membership.

## 8. Review audit events

**/platform/audit** supports date, actor, object, and action filters.
Detail view redacts keys matching `password|token|secret|invitation`.
Audit rows are append-only — UPDATE and DELETE are rejected at the
database.

## 9. Diagnose permission errors

1. Open **/platform/profile** and confirm active tenant.
2. In **/platform/audit**, filter by actor and action prefix to find the
   attempted operation.
3. Cross-check assigned roles → permissions in **/platform/roles**.
4. Remember: authorization is by **permission code**, not role name.

## 10. Diagnose tenant-switch issues

- Force refresh via the tenant selector — `AccessContext` cancels in-flight
  queries and removes tenant-scoped cache keys.
- If a stale tenant appears, clear `localStorage['platform:activeTenant']`
  and reload; the next mount server-revalidates authorized tenants.

## 11. Restore application code

- Frontend: revert to the tagged `pre-bp1.1-foundation` version via
  Lovable Edit History and click **Publish → Update**.
- Backend: migrations are additive; use forward-fix migrations rather
  than destructive rollback.

## 12. Migration failure

1. Do **not** run `supabase db reset` against production.
2. Capture the error and the migration filename.
3. Author a forward-fix migration.
4. Re-run `./scripts/validate-bp1-1.sh` locally with a disposable DB.

## 13. Full BP1.1 validation

```bash
# Local
./scripts/validate-bp1-1.sh
# With DB regression:
SUPABASE_DB_URL=postgres://postgres:postgres@localhost:5432/postgres \
  ./scripts/validate-bp1-1.sh
```

CI runs the same suite via `.github/workflows/bp1-1-platform-foundation.yml`.
