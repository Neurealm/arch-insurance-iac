## Root cause (verified)

The "Send invitation" error `function gen_random_bytes(integer) does not exist` comes from the database function `public.invite_member`.

- `pgcrypto` is installed in the **`extensions`** schema (confirmed via `pg_extension`), not `public`.
- `invite_member` is declared with `SET search_path TO 'public'`, so unqualified `gen_random_bytes(...)` and `digest(...)` can't be resolved — the call fails before any invitation row is written.
- Same defect exists in two sibling functions, confirmed unqualified: `resend_invitation` and `accept_invitation`.
- The commercial hashing functions (`commercial_release_hash`, `commercial_comparison_compute_hash`, `commercial_comparison_save`, `commercial_sensitivity_compute_hash`, `commercial_sensitivity_start_execution`) already call `extensions.digest(...)` — that's the correct pattern and they are unaffected.

## Fix

One migration that recreates the three invitation functions with schema-qualified crypto calls, keeping all other logic, signatures, security, and permission checks byte-for-byte identical:

1. `public.invite_member` — `extensions.gen_random_bytes(32)`, `extensions.digest(...)`
2. `public.resend_invitation` — same two substitutions
3. `public.accept_invitation` — `extensions.digest(...)`

No signature changes, no new tables, no RLS/grant changes, no frontend changes.

## Verification

- Re-run the invitation for `amit.daga@neurealm.com` and `vidur.suri@neurealm.com` with the Commercial Administrator role selected.
- Confirm a `pending` row appears in `tenant_invitations` for each, with the linked `commercial_admin` role in `tenant_invitation_roles`.

## Note

Once they accept, their memberships land in NeuGAIN Commercial with the Commercial Administrator role automatically — no separate role step needed.

## Unrelated (not fixing unless you want)

The console shows a React `forwardRef` warning from `DialogFooter` in `InviteMemberDialog`. It's cosmetic and unrelated to this failure.
