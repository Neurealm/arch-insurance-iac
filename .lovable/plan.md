
# NeuGAIN Account/Profile Panel — Build Plan

Goal: add a rich account panel and supporting data without touching any existing auth path. Everything is additive and skippable.

## Non-negotiable guardrails
- No edits to `AuthContext.tsx`, `ProtectedRoute.tsx`, or the `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/set-password`, `/pending-approval` pages.
- No renames/drops on `profiles`, `user_roles`, `tenant_memberships`. Only `ADD COLUMN` / new tables.
- `profile_completed_at` is informational only — never gates routing.
- `full_name` stays authoritative; when first/last are saved we also write `full_name = first + " " + last` and mirror it to `auth.updateUser({ data: { full_name } })` exactly like `UpdateProfile.tsx` does today.

## 1. Database migration (single migration, additive)

**Alter `profiles`** — add: `first_name`, `last_name`, `preferred_contact_method` (check-constrained), `working_location_type` (check-constrained), `office_site`, `hybrid_days text[]`, `weekly_hours jsonb`, `ooo_enabled bool default false`, `ooo_start date`, `ooo_end date`, `ooo_delegate_user_id uuid` (FK → profiles.user_id, ON DELETE SET NULL), `profile_completed_at timestamptz`. No existing RLS changes.

**New table `user_contact_methods`** — owner-only RLS (`auth.uid() = user_id`) for select/insert/update/delete. Full GRANT block per house rules. Unique index on `(user_id, method_type, lower(value))` to avoid dupes.

**New table `user_notification_rules`** — owner-only RLS. `unique(user_id, priority)`. Full GRANT block.

**Update `handle_new_user()` trigger function** — after inserting the profile, also insert the 4 default `user_notification_rules` rows (P1 sms+push+phone / immediate / escalate 3m; P2 sms+push / immediate / 10m; P3 email+push / within 30m / null; P4 email / daily digest / null) and one `user_contact_methods` row with the user's email (`verified=true`). Existing profile-insert logic is preserved exactly; we only append inserts.

**Backfill** — `UPDATE profiles SET first_name = split_part(full_name,' ',1), last_name = NULLIF(regexp_replace(full_name,'^\S+\s*',''),'')` only where first_name IS NULL. Seed notification rules + email contact method for existing users via one-time `INSERT ... ON CONFLICT DO NOTHING`.

## 2. Frontend — `AccountPanel` bottom sheet

New file `src/components/account/AccountPanel.tsx` using existing shadcn `Drawer` (vaul) + `Tabs`. Four tabs:

- **Profile** — first/last (new), email (read-only + Verified badge), phone, job_title, department, company, location, preferred_language, avatar upload. Save path reuses the exact update flow from `src/pages/auth/UpdateProfile.tsx` (same `profiles` update + `supabase.auth.updateUser({ data: { full_name } })`, same `avatars` bucket). full_name is derived on save.
- **Availability & Hours** — segmented Remote/Hybrid/Onsite, office_site select (short static list), hybrid day chips (shown only when Hybrid), time_zone (reuse existing selector list), Mon–Sun start/end/off grid → `weekly_hours` jsonb with "same schedule Mon–Fri" checkbox, OOO toggle + dates + delegate select (populated from `profiles` in same tenant scope; falls back to platform-admin visible list if tenant scoping unavailable).
- **Notifications & Paging** — contact methods list from `user_contact_methods` with add/remove/verify-badge; preferred_contact_method select; P1–P4 rules table editing `user_notification_rules` (channel checkboxes, timing text, escalate-after minutes). Small hint clarifies this is per-user routing, not company SLA.
- **Security** — "Last password change ~X days ago" (from `user.updated_at`), "Send reset link" button calling `supabase.auth.resetPasswordForEmail(user.email, { redirectTo: ... })`; TOTP MFA using `supabase.auth.mfa.enroll/challenge/verify/unenroll` with QR display; "Sign out of all other sessions" via `supabase.auth.signOut({ scope: 'others' })`; recent activity list of last 5 rows from the existing `user-login-history` edge function (already used by `LoginHistoryList.tsx`); a visible **Sign out** button; disabled Slack/Teams "Connect" placeholders.

**Wiring** — `UserMenu.tsx`'s avatar chip becomes the trigger for `AccountPanel` instead of the dropdown. Keep the file (still imported elsewhere) but its trigger opens the drawer. Change password + sign out remain reachable from inside the panel so no path is lost.

## 3. Invite flow additions (non-blocking)

- **New route `/complete-profile`** (skippable). After `/set-password` succeeds for an invited user, if `profiles.profile_completed_at IS NULL`, redirect there once. Fields: first/last/phone/job_title/working_location_type/time_zone/preferred_contact_method. Two buttons: **Skip for now** (navigates to `/`, leaves `profile_completed_at` null) and **Save** (writes fields, sets `profile_completed_at = now()`). ProtectedRoute is NOT modified — this redirect is a one-shot inside the set-password success handler, and the user can navigate away freely.
- **AccountPanel entry banner** — if `profile_completed_at IS NULL`, show a dismissible "Finish setting up your profile" hint at the top of the Profile tab.
- **Admin invite forms** — add optional First name / Last name / Job title / Department inputs to the invite dialog in `src/pages/settings/UserManagement.tsx` (and tenant invite form if present). Pass them through to `supabase/functions/invite-user/index.ts` and `supabase/functions/tenant-invite/index.ts`, which upsert them onto the profile row (in addition to full_name they already accept). Existing callers that don't send the new fields keep working — all params optional.

## 4. Out of scope (leave hooks/placeholders only)
Manager/reports-to, cost center, presence status, on-call rotation binding, Slack/Teams OAuth, per-device session revoke.

## 5. Verification checklist before finishing
1. `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/set-password`, `/pending-approval` all render and function unchanged (tsgo + spot-check routes).
2. A user who never opens AccountPanel or `/complete-profile` sees no new required fields and no forced redirects beyond the existing must_change_password / approval gates.
3. `supabase--linter` clean on the new migration; RLS on new tables restricts to `auth.uid() = user_id`.
4. Saving first/last in AccountPanel updates `full_name` in `profiles` AND `auth.user_metadata.full_name`, so `UserMenu` displayName updates immediately.
5. Existing `UpdateProfile.tsx` page still works (shared save path).

## Technical notes
- Push notifications: for this pass, "push" contact method just stores a label + `verified=false` placeholder unless `Notification.permission` is granted, in which case we mark verified=true. No service worker changes.
- MFA UI: shadcn `InputOTP` for the 6-digit code, QR from `enroll()` response's `totp.qr_code` (SVG string).
- Delegate select query: `select user_id, full_name, email from profiles where user_id <> auth.uid() order by full_name limit 50`. Sufficient for v1 given existing RLS on profiles.
- No new dependencies; vaul, shadcn Drawer/Tabs, and Supabase MFA APIs are already available.

Approve and I'll implement in a single pass (migration first, then frontend + edge function tweaks).
