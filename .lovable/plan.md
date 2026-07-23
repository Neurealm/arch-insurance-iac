## BP1.1C Remediation — Read-Only Validation Report

Scope: `src/platform/**`, `src/components/auth/PermissionRoute.tsx`, `src/App.tsx` route wiring. No implementation touched.

### Requirement Results

| # | Requirement | Result | Evidence |
|---|---|---|---|
| 1 | Tenant switching (cancellation, cache clear, permission refresh, no stale render) | PASS | `AccessContext.tsx` L80–92: `qc.cancelQueries({queryKey:["platform"]})` then `removeQueries` for context/members/invitations/roles/audit/home-summary before persisting new tenant; `contextQuery` keyed on `activeTenantId` re-fetches permissions; auto-repair L52–66 for suspended/removed memberships. |
| 2 | Route authorization (PermissionRoute, forbidden, no URL bypass) | PASS | `components/auth/PermissionRoute.tsx` wraps `ProtectedRoute` + `PermissionGate` returning `ForbiddenState`; all five platform child routes guarded in `App.tsx` L842–846 (`tenant.view`, `members.view`, `roles.view`, `audit.view`, `tenant.view`). Platform-admin bypass via `hasPermission`. |
| 3 | Create Tenant workflow | PASS | `CreateTenantDialog.tsx`: Zod validation (name/slug/tz/currency), `provision_tenant` RPC, refresh + auto-switch to new tenant on success, disabled state during pending. |
| 4 | Member admin (invite, role assign, suspend, reactivate, deactivate, pagination, filtering, confirms, last-admin) | PARTIAL PASS | `MemberAdmin.tsx`: search + status filter + `PAGE=20` pagination with total_count (L138–147); Invite dialog with Zod + role checkboxes; role editor via `assign_/remove_membership_role`; Suspend/Reactivate/Deactivate via `set_membership_status`; Cancel-invitation wrapped in `ConfirmDialog`; last-admin friendly error string mapping. Defect P2-1: Suspend/Reactivate/Deactivate menu items fire immediately with no `ConfirmDialog` — spec calls for confirmation dialogs on destructive lifecycle actions. |
| 5 | Role admin (editor, matrix, assignment, archive, read-only) | PASS | `RoleAdmin.tsx`: card grid with system/status badges; `Sheet`-based editor with grouped permission matrix; save meta + save perms via RPCs; archive gated by `ConfirmDialog` with member-count guard; system-protected and archived roles rendered read-only via `canManage && !is_system_protected` and disabled inputs. |
| 6 | Platform Home refresh | PASS | `PlatformHome.tsx` keyed on `activeTenantId`; permission-scoped metric cards; loading/error/empty states via shared components. |
| 7 | Tenant Settings validation | PASS | `TenantSettings.tsx`: Zod schema for name/slug/currency/tz, slug-change guarded by `ConfirmDialog`, `update_tenant` RPC, refresh + invalidate on success, disabled when lacking `tenant.update`. |
| 8 | Profile page | PASS | `Profile.tsx`: editable subset with Zod caps; governed fields (approval/category/company/email) rendered read-only; single `profiles` update; success invalidation. |
| 9 | Invitation acceptance states | PASS | `AcceptInvitation.tsx`: discriminated `State` with `auth_required`, `success`, `email_mismatch`, `expired`, `cancelled`, `already_accepted`, `not_found`, generic `error`; success path persists active tenant then navigates to `/platform`; sign-in preserves `next=` deep link. |
| 10 | Audit Explorer filters | PASS | `AuditExplorer.tsx`: search + action + actor + object_type + from/to date range + reset; 25/page with total_count; JSON `before/after` passed through `redact()` for password/token/secret/etc keys before render. |
| 11 | Accessibility improvements | PASS (minor) | `LoadingState` uses `role="status"`/`aria-live`; `ErrorState`/`ForbiddenState` `role="alert"`; audit filter fieldset labelled; every form field wired `htmlFor`/`aria-invalid`/`aria-describedby`; icon-only Buttons carry `aria-label` (member row menu, invite icon, archive). Defect P3-1: audit table rows use `tabIndex+role="button"` on `<tr>` — works but not semantic; consider a proper button. |
| 12 | Regression (BP1.1A/B, RunOps, security) | PASS | No files under `src/runops`, `src/eoc`, `src/silicon`, or `supabase/functions` altered in this remediation window; no migration authored beyond BP1.1B set (latest migration timestamps precede remediation UI work); `provision_tenant`, `set_membership_status`, `list_authorized_tenants`, `get_current_access_context`, `update_tenant`, `assign_/remove_role_permission`, `archive_tenant_role`, `invite_/resend_/cancel_/accept_invitation` all continue to be invoked via `supabase.rpc` with anon-revoked signatures established in BP1.1B. |

### Defects

**Priority 0** — none.

**Priority 1** — none.

**Priority 2**

- **P2-1 Member lifecycle actions lack confirmation dialog.** `MemberAdmin.tsx` L216–226 fires Suspend/Reactivate/Deactivate directly from `DropdownMenuItem.onSelect` without `ConfirmDialog`. Spec requirement #4 lists "Confirmation dialogs" as a first-class check. Deactivate is destructive and irreversible from the UI — must be confirmed.

**Priority 3**

- **P3-1 Audit table row is a `<tr>` with `role="button"`.** `AuditExplorer.tsx` L124–127. Screen-reader semantics are ambiguous; prefer a nested button or `<tr>` + inline action button in the last column.
- **P3-2 Success path in `AcceptInvitation.tsx` L72 writes `localStorage` directly** (`platform:activeTenant`) instead of going through `AccessContext.switchTenant`, so cache-clearing side effects are skipped for the first navigation. Cosmetic — next mount reconciles via `contextQuery`, but couples to internal storage key.
- **P3-3 `MemberAdmin` invitations list is not paginated** (fetches up to 50). Fine at current volume; add pagination if invitation volume grows.
- **P3-4 `CreateTenantDialog` timezone/currency are free-text.** Zod validates shape only; a datalist or Select would prevent typos before hitting the RPC.

### Conclusion

Not Ready for Product Organization Review

Blocking: P2-1 (missing confirmation dialogs on member Suspend/Reactivate/Deactivate) contradicts requirement #4. Once wrapped in `ConfirmDialog` (component already exists and is used for invitation cancel and role archive), the remediation meets the BP1.1C bar.
