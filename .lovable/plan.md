## What's happening

Clicking **Approve** does call the database, but the `audio_version_transition` function rejects it: v2 and v3 of `CAE.COMMERCIAL.DEAL_OVERVIEW.001` were authored by the signed-in user, and the separation-of-duties rule blocks an author from approving their own version. The failure is shown as `[object Object]` because the Supabase error object isn't an `Error` instance, so the toast stringifies it badly — making it look like nothing happened.

## Fix

1. **Database migration** — update `audio_version_transition`:
   - Keep separation of duties for regular reviewers.
   - Add an exemption: if the caller is a platform admin (or tenant owner/admin), they may approve a version they authored.
   - Record the exemption in the audit event metadata (`self_approved: true`) so governance evidence stays intact.

2. **Error surfacing (frontend)** — in `src/platform/cae/admin/lifecycle.tsx`, extract the message from Supabase error objects (`error.message` / `details` / `hint`) instead of `String(err)`, so any future rejection shows readable wording rather than `[object Object]`. Apply the same to the narrative-level actions in `NarrativeDetail.tsx`.

3. **Verify** — after the migration, approve v2 in the UI and confirm the row moves to `approved`, the version list refreshes, and an audit entry is written.

## Technical notes

- Function is `SECURITY DEFINER` with `search_path = public`; only the SoD guard block changes.
- Admin check uses the existing `is_platform_admin`/tenant-role helpers already used elsewhere in the CAE layer.
- No table/RLS changes; list refresh already works via query invalidation.
