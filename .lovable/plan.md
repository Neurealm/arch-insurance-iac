
# Execute All BP1.1 Preconditions

Run the six preconditions from the preflight report, in order. No product-code, schema, RLS, or route changes — this is baseline hardening + confirmation only.

## Steps

1. **Security rescan** — call `security--run_security_scan` and record results. If new Critical/High findings appear, stop and report before continuing.

2. **Confirm RunOps stack preserved** — record in the security memory that `runops_tenants`, `runops_role_assignments`, `runops_profiles`, and the `runops_role` enum remain module-owned and will NOT be repurposed by BP1.1. No code change.

3. **Confirm platform-admin mechanism preserved** — record that `app_role` enum + `user_roles` remain the platform-admin path. BP1.1 will add tenant-scoped `roles` as a separate table (not by altering the enum). No code change.

4. **Restore point** — since I cannot tag Lovable version history or trigger republish from tools, I will:
   - Write `docs/bp1.1-baseline.md` capturing: current git-equivalent state marker (latest migration `20260720161028`, 89 public tables, 17 edge functions, 20 migrations), a "restore instructions" section pointing to Lovable version history, and a list of tables/functions BP1.1 must not drop.
   - Ask the user to click **Publish** in the Lovable UI and to open **Version History → pin current version** as `pre-bp1.1-foundation`. These two actions cannot be executed from tools.

5. **Seed `mem://index.md`** with the product-neutrality Core rule + a reference memory:
   - Core: "Product must remain partner-, customer-, industry-, and technology-neutral. Named orgs (Neurealm, Contoso, Meridian, Citrix, Epic, healthcare, VDI) are tenant data or module fixtures, never product-core logic."
   - Core: "Authorization is permission-based via `has_permission(user, tenant, permission)`. Role-name checks (`is_platform_admin`, `has_role`, `runops_has_role`) are legacy and must not spread to new code."
   - Core: "Every `CREATE TABLE public.*` migration must include explicit `GRANT` statements in the same migration."
   - Memory file `mem://constraints/bp1.1-scope.md` documenting the BP1.1 boundary and the RunOps/`app_role` preservation decisions from steps 2–3.

6. **Confirm super-admin bootstrap untouched in BP1.1** — record in security memory that the four hard-coded super-admin emails in `handle_new_user` are accepted for BP1.1 and slated for BP1.2 relocation to a config table or secret.

## Files touched

- `docs/bp1.1-baseline.md` (new)
- `mem://index.md` (new)
- `mem://constraints/bp1.1-scope.md` (new)
- Security memory (via `security--update_memory`)

## Not touched

- No migrations, RLS, functions, routes, navigation, or app code.
- No package installs.
- No republish or version-history pin (user must do these in the Lovable UI).

## Exit criteria

- Security scan results captured.
- Baseline doc written.
- Project memory seeded.
- Security memory updated with BP1.1 accepted-risk posture.
- User told which two manual UI actions to perform before pasting the BP1.1 Build Prompt.
