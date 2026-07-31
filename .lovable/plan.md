## Goal

Grant `vidur.suri@neurealm.com` and `amit.daga@neurealm.com` the **Commercial Administrator** role in the **NeuGAIN Commercial** workspace.

## Verified current state

- Tenant `NeuGAIN Commercial` exists (slug `neugain-commercial`, id `d6e1f4a0-…`).
- The role exists in that tenant: code `commercial_admin`, name "Commercial Administrator" (id `58503804-…`).
- Neither `vidur.suri@neurealm.com` nor `amit.daga@neurealm.com` has an `auth.users` record or a `profiles` row — no account exists yet.
- Roles are applied via `memberships` + `membership_roles` (this is how `nitin.naveen@neurealm.com` was granted the same role).

Because no accounts exist, no membership row can be created for them today.

## Plan (per your choice: prepare role assignment only)

1. **You onboard them** through the existing admin UI (Platform → Members / invitation flow) so each gets an `auth.users` account and a profile.
2. **I then apply the role**: for each user, create an active `memberships` row in tenant `d6e1f4a0-…` (if not created by onboarding), and insert the matching `membership_roles` row pointing at role `58503804-…` (Commercial Administrator).
3. **Verification**: query memberships + membership_roles for both emails and confirm each shows status `active` with `commercial_admin`, matching Nitin's configuration exactly.

## Notes

- No schema changes, no new tables, no code changes — data-only role assignment once the accounts exist.
- If you'd prefer, I can also pre-create pending tenant invitations now so accepting automatically lands them in the Commercial workspace; say the word and I'll add that step.
