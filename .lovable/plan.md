# Project Health Check — Neugain

I reviewed the Supabase backend, ran the security linter, checked storage, console logs, and the app code. The app is in a good state — no broken code paths, RLS is enabled everywhere, schema and edge functions are in place. Three things stand out as worth fixing.

## Findings

### 1. Missing `avatars` storage bucket  (functional gap)
Profile RLS policies expect a public `avatars` bucket but the bucket itself doesn't exist yet. Any avatar upload from `/profile` will fail until it's created.

### 2. Supabase linter — 14 SECURITY DEFINER warnings  (low risk, noisy)
All your helper functions (`has_role`, `is_platform_admin`, `is_tenant_member`, `has_tenant_role`, `is_user_approved`, `set_tenant_id_from_membership`, `handle_new_user`, `update_updated_at_column`) are flagged because `EXECUTE` is granted to `public` / `authenticated` by default. They're written safely (read-only, scoped `search_path`), but linter best practice is to revoke `EXECUTE FROM public` and grant only to `authenticated` (or nothing for trigger-only functions).

### 3. Leaked password protection disabled  (auth hardening)
Supabase Auth setting — enable "Leaked password protection" in the dashboard so signups/resets reject passwords found in HIBP breach lists. One toggle, no code change.

### Not issues (verified clean)
- RLS is enabled on every public table with sensible policies.
- All public tables have proper GRANTs to `authenticated` / `service_role`.
- `handle_new_user` correctly grants `platform_admin` to the 4 NeuRealm emails and blocks personal-email signups.
- Edge functions (`auth-email-hook`, `process-email-queue`, `tenant-invite`, `tenant-signup`) deployed.
- Frontend: no console errors on `/login`, tenant scope guard + protected routes wired correctly, types file in sync with schema.

## Proposed fixes

1. **Create the `avatars` storage bucket** (public, with the per-user-folder upload policies already implied by the app).
2. **Tighten function EXECUTE grants** — one migration:
   - `REVOKE EXECUTE ... FROM public, anon` on all 8 SECURITY DEFINER functions.
   - `GRANT EXECUTE TO authenticated` only on the ones called from the client/RLS evaluation (`has_role`, `is_platform_admin`, `is_tenant_member`, `has_tenant_role`, `is_user_approved`). Trigger-only functions stay locked down.
3. **Tell you to flip the "Leaked password protection" toggle** in Supabase Auth settings (I can't toggle it from here).

## What I will NOT do
- Touch any frontend code — nothing is broken there.
- Change RLS policies, schema, or seed data.
- Modify edge functions.

## Confirm before I run

- Proceed with all three fixes above? Or skip any of them?
