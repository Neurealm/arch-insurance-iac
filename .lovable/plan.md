This is a diagnostic report on the full account creation and login flow for `jdoucette@archgroup.com` and `tflock@archgroup.com`, plus the fixes I recommend. Nothing has been changed yet — approve the fix list at the bottom and I'll implement.

## 1. Account creation (both users)

Both accounts were created identically, via admin invite from `neugain.io`:

| Field | jdoucette | tflock |
|---|---|---|
| `auth.users.created_at` | 2026-07-02 18:37:15 | 2026-07-02 18:42:29 |
| `invited_at` | 2026-07-02 18:37:15 | 2026-07-02 18:42:29 |
| `raw_user_meta_data.invited_to_tenant` | true | true |
| `profiles.approval_status` | approved (auto) | approved (auto) |
| `user_roles` | platform_support | platform_support |
| `user_category` | customer | customer |
| `email_confirmed_at` | 2026-07-02 18:56:27 | 2026-07-02 19:03:43 |

Creation flow works as designed: `admin-users.invite_user` → `auth.admin.inviteUserByEmail` → `handle_new_user` trigger auto-approves and assigns `platform_support`. Both users got the invite mail and confirmed within ~15–20 min. No errors.

## 2. First sign-in (recovery / invite link)

Both users completed the invite by clicking the emailed link, which routes through `/verify` → `/reset-password`. Auth-log evidence:

- **jdoucette** — single successful `login` (implicit) at 19:19:19 from IP `206.204.42.105`. Clean.
- **tflock** — first successful implicit login at 19:18:05 from IP `104.223.88.175`, followed by:
  - `GET /verify` → `403 email link expired` at 19:18:14, 19:19:14, 19:20:07 (same one-time recovery token re-clicked)
  - `PUT /user` → `403 session_not_found` at 19:19:45 and 19:20:58 (client held the pre-rotation session id)

## 3. Durable `user_login_events` (recorded by `record-login` edge function)

- **tflock**: 5 rows, all `login` / method=`email` / IP `199.254.79.44` / source=`portal`, from 19:03:47 through 19:31:50 → the `record-login` invoke fires reliably for tflock.
- **jdoucette**: **0 rows** → `record-login` never fired for this account, even though he successfully signed in.

Root cause: in `AuthContext.tsx` we only invoke `record-login` inside `onAuthStateChange` when `event === "SIGNED_IN"`. A recovery-link sign-in emits `PASSWORD_RECOVERY` (and later `USER_UPDATED` after the password is set) but frequently no explicit `SIGNED_IN` on the same page load, so the durable event is missed. This also explains why the login-history UI looks empty for anyone who set their password via the invite/recovery flow and hasn't signed out and back in with password since.

## 4. `user_page_activity`

Neither user has any rows — so the page-activity tracker did not record for either session. Either they closed the tab before the first tracked route mounted, or the `usePageActivityTracker` hook doesn't run on the reset-password / verify path. Not blocking, but worth verifying.

## 5. Recommended fixes

- **Fix A — Record login events for recovery/invite completions.** In `src/context/AuthContext.tsx`, also invoke `record-login` on `PASSWORD_RECOVERY` and on the first `USER_UPDATED` following recovery, guarded by a session-scoped dedupe flag so we don't double-count on the same tab.
- **Fix B — Stop the noisy 403 loop after recovery.** In `src/pages/auth/ResetPassword.tsx`, after `updateUser({ password })` succeeds, immediately `navigate("/app", { replace: true })` and clear the URL hash so a browser back/refresh can't re-hit `/verify` with the already-consumed token, and add a one-time guard so the page won't re-attempt `getUser()` / `updateUser()` after a `session_not_found` — instead surface "Your reset link was already used, please sign in" and redirect to `/login`.
- **Fix C — Suppress the `AuthSessionMissingError` toast.** Detect that specific error class in the reset-password page's catch block and show a friendly "session expired, please sign in again" instead of the raw string that reads like a bug.
- **Fix D (optional) — Track page activity on auth routes.** Verify `usePageActivityTracker` mounts on `/verify` and `/reset-password`, or explicitly log a synthetic `auth_flow` entry on completion so we can see recovery-link usage in the admin activity tab.

## Technical notes

- `admin-users` edge function is fine; no change needed.
- `record-login` edge function is fine; no change needed — only the client-side trigger conditions in `AuthContext` need widening.
- `ResetPassword.tsx` and `AuthContext.tsx` are the only files touched by fixes A–C.
- No database migration required.

Reply "go" (or point to which fixes to apply) and I'll implement.
