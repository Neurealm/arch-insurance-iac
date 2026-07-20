
## Goal

1. Let platform admins see the full profile of a user from the User Management module (currently the drawer only shows name/email/status/role/login history).
2. When a user sets a `company` value on their profile, automatically ensure a matching row exists in `crm_companies`, and link the profile to it.

## 1. Profile details in the admin drawer

Extend `src/components/users/UserDetailDrawer.tsx`:

- Extend `UserRow` and the list query in `src/pages/settings/UserManagement.tsx` to also fetch profile fields already in the `profiles` table: `first_name`, `last_name`, `phone`, `job_title`, `department`, `company`, `location`, `time_zone`, `preferred_language`, `preferred_contact_method`, `working_location_type`, `office_site`, `hybrid_days`, `ooo_enabled`, `ooo_start`, `ooo_end`, `user_category`, `must_change_password`, `profile_completed_at`.
- Add a read-only **Profile details** section in the drawer (above "Platform role") that renders these as a two-column label/value grid, grouped:
  - Identity: first/last name, display name, job title, department, company
  - Contact & location: phone, preferred contact method, working location type, office site, hybrid days, location, time zone, preferred language
  - Status flags: user category, profile completed, must change password, OOO window
- Empty values render as `—`. No editing in this pass (admin edit UI is out of scope unless requested).

## 2. Auto-create `crm_companies` from profile.company

Approach: database-side, so it works for all write paths (self-service profile update, admin edits, signup handler, imports).

New migration:

- Add `public.profiles.company_id uuid references public.crm_companies(id) on delete set null` (nullable, indexed).
- Create `public.sync_profile_company()` trigger function (`SECURITY DEFINER`, `search_path = public`):
  - Runs `BEFORE INSERT OR UPDATE OF company ON public.profiles`.
  - If `NEW.company` is null/blank → set `NEW.company_id = NULL`.
  - Else: case-insensitive lookup `SELECT id FROM crm_companies WHERE lower(name) = lower(trim(NEW.company)) LIMIT 1`.
  - If not found, insert a new `crm_companies` row with `name = trim(NEW.company)`, `company_type = 'Customer'` default, `status = true`, `priority = 'Medium'`, `lifecycle_stage = 'prospect'`, minimal defaults; capture id.
  - Set `NEW.company_id` to the resolved id.
- Attach trigger `trg_profiles_sync_company` on `public.profiles`.
- Backfill: for each existing profile with non-null `company`, run the same resolve/insert logic and populate `company_id`.

Notes:
- `crm_companies` INSERT policy currently gates on admin/tenant membership. Because the trigger runs `SECURITY DEFINER` under a fixed owner, it bypasses RLS safely (only reachable via a profile write the user already owns).
- Do not touch existing CRM UI. The new `company_id` is available for future linking but is not required in the frontend now.

## 3. Surface the linked company in the admin drawer

- In the drawer's Profile section, when `company_id` is present, render the company name as a link to `/crm/companies/{company_id}` (existing CRM route) with a small "View in CRM" affordance.

## Files touched

- `src/pages/settings/UserManagement.tsx` — expand profile select and `UserRow` shape.
- `src/components/users/UserDetailDrawer.tsx` — add Profile details section + company link.
- New migration — add `profiles.company_id`, trigger function, trigger, backfill.

## Out of scope

- Editing profile fields from the admin drawer.
- Merging/deduping existing `crm_companies` rows.
- Tenant-scoping the auto-created company (created without `tenant_id`; admins can promote via existing CRM tools).
