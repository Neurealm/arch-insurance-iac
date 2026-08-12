# BP1.1 UX Evidence Checklist (UX-001 – UX-025)

Authoritative persona-driven evidence checklist for BP1.1E release
readiness. Each item is independently executable against the deployed
release-candidate build. Do not substitute static code inspection for a
required live walkthrough.

## Personas

| Persona | Description | Preconditions |
|---|---|---|
| **P-ADMIN** | Platform administrator | Seeded super-admin (has `platform.access`). |
| **T-ADMIN-A** | Tenant A administrator | Active membership in Tenant A with all `members.*`, `roles.*`, `tenant.*`, `audit.view` permissions. |
| **T-ADMIN-B** | Tenant B administrator | Same as T-ADMIN-A but for a distinct Tenant B. |
| **T-MEMBER-A** | Tenant A member | Active membership in Tenant A with only `members.view`, `tenant.view`, `profile.update_own`. |
| **DENIED** | Signed-in user with no membership | Approved auth user, no `memberships` row. |
| **INVITEE** | Prospective member | Unauthenticated recipient of an active invitation email. |

## Sensitive-data handling (applies to every item)

Before capturing any screenshot the reviewer MUST redact or avoid: raw
passwords, session tokens, invitation `token_hash`, service-role keys,
personal email addresses outside the seeded persona set, and any audit
payload key matching `password|token|secret|invitation`.

## Fields captured per item

`Actual result` · `Pass / Fail / Blocked` · `Evidence file` ·
`Reviewer` · `Execution date`.

Screenshot file naming: `UX-###_<persona>_<short-description>_<YYYY-MM-DD>.png`
stored under `docs/evidence/bp1-1/ux/`.

---

## UX-001 — Authenticated approved user reaches the platform

- **Persona**: P-ADMIN
- **Preconditions**: valid credentials; `profiles.approval_status = 'approved'`.
- **Tenant context**: none required.
- **Route / workflow**: `/login` → sign in → redirected to `/platform` (or default landing).
- **Actions**: enter email/password, submit.
- **Expected**: authenticated session, redirected away from `/login`, no console errors, platform shell visible.
- **Screenshot**: landing page after auth.

## UX-002 — Platform landing shows access context

- **Persona**: P-ADMIN
- **Preconditions**: UX-001 complete.
- **Route**: `/platform`
- **Actions**: observe header/side rail; note active-tenant chip.
- **Expected**: shell renders active tenant, user identity, and available navigation reflecting held permissions.
- **Screenshot**: shell with tenant selector visible.

## UX-003 — Tenant selection populates from memberships

- **Persona**: P-ADMIN
- **Preconditions**: P-ADMIN is a member of at least two tenants (Tenant A, Tenant B).
- **Route**: `/platform` — tenant selector.
- **Actions**: open the selector.
- **Expected**: selector lists exactly the tenants for which the user has active memberships; no third-party tenants leak.
- **Screenshot**: opened tenant selector.

## UX-004 — Tenant switching swaps context

- **Persona**: P-ADMIN
- **Preconditions**: UX-003 complete.
- **Route**: `/platform/*` (any tenant-scoped page, e.g. Members).
- **Actions**: on Tenant A → open Members and note listing → switch to Tenant B via selector.
- **Expected**: URL/context reflects Tenant B; header chip updates; the Members list reloads for Tenant B.
- **Screenshot**: Members page after switch, showing Tenant B members.

## UX-005 — Stale tenant-scoped data is dropped on switch

- **Persona**: P-ADMIN
- **Preconditions**: UX-004 complete.
- **Route**: `/platform/members` before and after switch.
- **Actions**: observe React Query devtools or the list content itself; confirm Tenant A entries do not appear after switching to Tenant B; confirm no in-flight query returns Tenant A data after switch.
- **Expected**: only Tenant B rows visible; loading skeleton appears during refetch.
- **Screenshot**: before/after side-by-side or two sequential captures.

## UX-006 — Permission-gated route blocks caller without permission

- **Persona**: T-MEMBER-A
- **Route**: `/platform/roles` (requires `roles.manage`).
- **Actions**: navigate directly via URL.
- **Expected**: `ForbiddenState` (or equivalent) rendered by `PermissionRoute`; no role admin data fetched.
- **Screenshot**: forbidden state page.

## UX-007 — Platform administrator can reach platform-only routes

- **Persona**: P-ADMIN
- **Route**: `/platform` administrator surfaces (e.g. tenant provisioning entry point).
- **Actions**: open Create Tenant dialog.
- **Expected**: dialog opens; controls enabled; currency/timezone `Select` populated from curated list.
- **Screenshot**: opened `CreateTenantDialog`.

## UX-008 — Tenant administrator can access tenant admin surfaces

- **Persona**: T-ADMIN-A
- **Route**: `/platform/members`, `/platform/roles`, `/platform/tenant-settings`, `/platform/audit`.
- **Actions**: navigate to each route.
- **Expected**: each page renders successfully with admin actions visible.
- **Screenshot**: one representative admin page (e.g. Members).

## UX-009 — Tenant member has read-only tenant surfaces

- **Persona**: T-MEMBER-A
- **Route**: `/platform/members`, `/platform/tenant-settings`.
- **Actions**: navigate; attempt to invoke admin controls (buttons should be absent or disabled).
- **Expected**: read-only surfaces render; no invite / suspend / role-edit affordances present.
- **Screenshot**: Members list without admin action buttons.

## UX-010 — Denied user is bounced from tenant surfaces

- **Persona**: DENIED
- **Route**: `/platform` (attempt any tenant-scoped URL).
- **Actions**: navigate.
- **Expected**: user sees a no-membership state or is redirected to a safe landing; no tenant data loaded.
- **Screenshot**: the denied/empty state.

## UX-011 — Invitation creation succeeds

- **Persona**: T-ADMIN-A
- **Route**: `/platform/members` → Invite.
- **Actions**: open invite dialog, enter a fresh email + role assignment, submit.
- **Expected**: success toast; new row appears in Pending Invitations; audit event `invitation.created` visible in Audit Explorer.
- **Screenshot**: pending invitations table with new row.

## UX-012 — Invitation acceptance completes

- **Persona**: INVITEE (email from UX-011)
- **Route**: `/accept-invitation?token=...`
- **Actions**: open link (in same or fresh session), complete signup/sign-in flow, accept.
- **Expected**: user lands on tenant with active membership; invitation moves to accepted state; `invitation.accepted` audit event recorded.
- **Screenshot**: post-acceptance landing.

## UX-013 — Expired invitation is rejected

- **Persona**: INVITEE
- **Preconditions**: invitation whose `expires_at < now()`.
- **Route**: `/accept-invitation?token=<expired>`
- **Actions**: open link.
- **Expected**: `INVITATION_EXPIRED` state rendered by `AcceptInvitation.tsx`; user offered recovery navigation (contact admin / return to sign-in).
- **Screenshot**: expired-state page.

## UX-014 — Already-accepted invitation is rejected

- **Persona**: INVITEE
- **Preconditions**: invitation from UX-012 (already accepted).
- **Route**: `/accept-invitation?token=<used>`
- **Actions**: reopen link.
- **Expected**: `INVITATION_ALREADY_ACCEPTED` state; user routed to sign-in.
- **Screenshot**: already-accepted state page.

## UX-015 — Email-mismatch invitation is rejected

- **Persona**: INVITEE signed in as different email
- **Preconditions**: valid invitation for `alice@example.com`; caller session belongs to `bob@example.com`.
- **Route**: `/accept-invitation?token=...`
- **Actions**: open link while signed in as mismatched account.
- **Expected**: `INVITATION_EMAIL_MISMATCH` state; no membership created; instructions to sign out.
- **Screenshot**: email-mismatch state page.

## UX-016 — Member suspension requires confirmation

- **Persona**: T-ADMIN-A
- **Route**: `/platform/members` — pick an active non-admin member.
- **Actions**: click Suspend → `ConfirmDialog` opens → Confirm.
- **Expected**: dialog appears with explicit consequences; on confirm status becomes `suspended`; audit event recorded.
- **Screenshot**: `ConfirmDialog` open, then updated row.

## UX-017 — Member reactivation requires confirmation

- **Persona**: T-ADMIN-A
- **Preconditions**: suspended member from UX-016.
- **Actions**: click Reactivate → `ConfirmDialog` → Confirm.
- **Expected**: status returns to `active`; audit event recorded; dialog cannot be bypassed.
- **Screenshot**: confirm dialog + reactivated row.

## UX-018 — Member deactivation requires confirmation

- **Persona**: T-ADMIN-A
- **Route**: `/platform/members`
- **Actions**: click Deactivate → `ConfirmDialog` → Confirm.
- **Expected**: status becomes `deactivated`; row moves out of active list; audit event recorded.
- **Screenshot**: confirm dialog + result.

## UX-019 — Last active administrator cannot be removed

- **Persona**: T-ADMIN-A (the only active admin in Tenant A)
- **Route**: `/platform/members` — attempt to suspend, deactivate, or remove the admin role from self.
- **Actions**: initiate the destructive action; confirm.
- **Expected**: `count_active_tenant_admins` safeguard triggers; action rejected with clear error; admin remains active.
- **Screenshot**: error toast / inline error.

## UX-020 — Tenant role administration works

- **Persona**: T-ADMIN-A
- **Route**: `/platform/roles`
- **Actions**: create a new tenant role, assign at least one permission, edit its name, archive it.
- **Expected**: each mutation succeeds; role list reflects changes; permission grants reflected via `has_permission`.
- **Screenshot**: role editor after successful update.

## UX-021 — Audit explorer filters and detail

- **Persona**: T-ADMIN-A (or P-ADMIN)
- **Route**: `/platform/audit`
- **Actions**: apply filters (action code, actor, date range); click explicit **View** button on a row; inspect detail drawer.
- **Expected**: filtering narrows results; detail opens via keyboard-accessible button; row is not opened by whole-row click.
- **Screenshot**: filtered list + open detail panel.

## UX-022 — Audit payload redaction

- **Persona**: T-ADMIN-A
- **Route**: `/platform/audit` → detail for an event with a sensitive payload (e.g. invitation created).
- **Actions**: inspect the JSON payload.
- **Expected**: values under keys matching `password|token|secret|invitation` render as redacted placeholders; no raw token exposed.
- **Screenshot**: detail panel showing redacted values.

## UX-023 — Tenant settings behavior

- **Persona**: T-ADMIN-A
- **Route**: `/platform/tenant-settings`
- **Actions**: edit tenant name / default currency / default timezone via curated `Select`; save.
- **Expected**: update succeeds; `tenant.updated` audit event recorded; readback matches submitted values.
- **Screenshot**: settings form after successful save.

## UX-024 — Profile behavior and governed fields

- **Persona**: T-MEMBER-A
- **Route**: `/platform/profile`
- **Actions**: edit personal fields (display name, phone); attempt to modify governed fields (`approval_status`, `company_id`, `user_category`).
- **Expected**: personal edits persist; governed fields are read-only in UI and rejected by `profiles_protect_governed_fields` trigger if bypassed.
- **Screenshot**: profile form with governed fields disabled.

## UX-025 — Loading / empty / error / forbidden states and recovery

- **Persona**: mixed (T-MEMBER-A for forbidden; T-ADMIN-A for empty/loading; DENIED for recovery).
- **Route**: various — force each state:
  - `LoadingState` on Members list (slow network).
  - `EmptyState` on a freshly provisioned tenant with no invitations.
  - `ErrorState` by simulating a failed fetch (offline).
  - `ForbiddenState` on `/platform/roles` as T-MEMBER-A.
- **Actions**: for each state confirm the escape/recovery affordance (return to `/platform`, retry, or sign out).
- **Expected**: each state renders accessibly (announced via `role="status"`/`role="alert"`), has visible focus, and provides at least one recovery action.
- **Screenshot**: one capture per state (4 images acceptable as a single evidence file collage).

---

## Reconciliation note

If the BP1.1D validation source is subsequently republished and it
enumerates additional or renumbered evidence items, preserve the source
IDs and append a reconciliation table here mapping BP1.1D IDs to UX-001
– UX-025. Do not silently renumber this checklist once execution has
started.
