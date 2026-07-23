# BP1.1A — Platform Architecture (Canonical Layer)

## Object graph

```text
                              ┌──────────────────────┐
                              │  auth.users (Supa)   │
                              └──────────┬───────────┘
                                         │
                              ┌──────────▼───────────┐
                              │  public.profiles     │  ← governed-fields trigger
                              └──────────────────────┘
                                         │
   ┌─────────────────┐       ┌───────────▼───────────┐       ┌────────────────────────┐
   │ public.tenants  │◄──────┤ public.memberships    │──────►│ public.membership_roles│
   └────────┬────────┘       └───────────┬───────────┘       └────────────┬───────────┘
            │                            │                                │
            │                            │                                │
            │             ┌──────────────▼──────────────┐   ┌─────────────▼─────────────┐
            │             │ public.tenant_invitations   │   │ public.tenant_roles       │
            │             │ ┌─────────────────────────┐ │   │ (data-configurable)       │
            │             │ │ tenant_invitation_roles │─┼──►│                           │
            │             │ └─────────────────────────┘ │   └─────────────┬─────────────┘
            │             └─────────────────────────────┘                 │
            │                                                             ▼
            │                                            ┌────────────────────────────────┐
            │                                            │ public.tenant_role_permissions │
            │                                            └───────────────┬────────────────┘
            │                                                            ▼
            │                                            ┌────────────────────────────────┐
            │                                            │       public.permissions       │
            │                                            └────────────────────────────────┘
            │
            ▼
   ┌────────────────────┐
   │ public.audit_events│  (append-only, tenant-scoped)
   └────────────────────┘
```

## Tenants

- `slug`: normalized (lowercased, non-alphanumerics → `-`, collapsed, trimmed) by `tenants_before_write` trigger; **case-insensitive unique**.
- `status`: `active | suspended | archived`; setting `archived` stamps `archived_at`.
- `default_currency_code`: `CHECK (~ '^[A-Z]{3}$')` (ISO 4217 shape).
- `default_timezone`: validated by `public.is_valid_timezone(text)` against Postgres' IANA database.

## Memberships

- Unique on `(tenant_id, user_id)`; duplicate assignment rejected.
- Lifecycle: `invited → active → deactivated`. Transitions to `active` stamp `joined_at`; transitions to `deactivated` stamp `deactivated_at`.
- Cascading: deleting the tenant cascades memberships; deleting the user restricts (safety).

## Permissions & roles

- `permissions.code` is the stable canonical identifier used by `has_permission` (added in a later increment). `required_for_tenant_administration` marks the minimum baseline for the seeded `tenant_admin` role.
- `tenant_roles`: `code` unique per tenant, immutable once referenced by any assignment/grant/invitation-role (guarded in `tenant_roles_before_write`).
- Both `tenant_role_permissions` and `membership_roles` carry `tenant_id` and enforce **cross-tenant consistency** via BEFORE-INSERT triggers.

## Invitations

- `email` lower-trimmed into `normalized_email` by trigger.
- Only one pending invitation per `(tenant_id, normalized_email)` (partial unique index on `status='pending'`).
- Token stored as `bytea` hash (never plaintext).

## Audit events

- Every mutation is `INSERT` only; `audit_events_reject_mutation` trigger raises on `UPDATE` / `DELETE`. RLS additionally denies write outside of platform admins.
- Reads restricted to platform admins in BP1.1A. Tenant-scoped reader policies arrive with `has_permission`.

## Interaction with legacy layer

- `is_platform_admin(auth.uid())` is the short-circuit branch of every new SELECT/UPDATE policy — platform admins retain full visibility without a new membership.
- Ordinary tenant reads/writes route through `EXISTS (memberships WHERE tenant_id = … AND user_id = auth.uid() AND status = 'active')` in BP1.1A. `has_permission` will replace these EXISTS predicates in the next increment without breaking the object graph.
- RunOps remains its own authority island; no policy in BP1.1A references any `runops_*` object.
