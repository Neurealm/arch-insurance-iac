## Root cause

The `etdm_enforce_practice` BEFORE UPDATE trigger on `public.etdm_technologies` blocks any update to a row that has `is_active = true` (or `approval_status = 'Approved'`) while `neurealm_practice` is null/blank. The sample "Microsoft Windows Server" record was activated earlier without a practice being set, so the branding-asset UPDATE now fails at the trigger with a check_violation. The dialog catches the error and shows a generic "Save failed" toast.

## Fix

Two small changes:

1. **Make the trigger transition-aware** so it only blocks the *transition into* Approved/Active without a practice, not routine edits to already-active records. New logic:
   - On UPDATE, raise only if `NEW.neurealm_practice` is null/blank AND either `NEW.approval_status = 'Approved'` and `OLD.approval_status <> 'Approved'`, or `NEW.is_active = true` and `OLD.is_active = false`.
   - On INSERT, keep the existing rule (blocks creating an already-Approved/Active row without a practice).
   
   This preserves the governance intent (you still can't approve or activate without a practice) but lets branding uploads, edits, etc. go through on rows that are already active.

2. **Surface the real database error** in `TechnologyBrandUploadDialog.onSave` so future trigger/RLS failures show the actual message (`error.message`) instead of "Save failed". Same for `useRemoveTechnologyBrand` consumers if applicable.

## Verification

- Reload the Windows Server edit page and click Save branding — upload should succeed and the toast should read "Branding asset saved".
- Try to activate a Draft technology that has no `neurealm_practice` — the trigger should still block it.
- Try to set `approval_status` to Approved on a Draft with no practice — still blocked.

## Files touched

- New migration: redefine `public.etdm_enforce_practice()` with the transition-aware logic above (trigger definition unchanged).
- `src/components/etdm/TechnologyBrandUploadDialog.tsx`: keep `e.message` fallback but ensure Supabase `PostgrestError`/`StorageError` messages are shown (they already have `.message`, so no change needed unless we want a nicer prefix like `Save failed: <message>`).

No schema, RLS, storage, or type changes required.
