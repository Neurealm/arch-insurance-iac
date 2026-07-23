# BP1.1A — Legacy Authorization Boundary

BP1.1A introduces the product-neutral canonical layer **alongside** two legacy authority islands. Neither island is modified in this package.

## Island 1 — Platform-wide (`app_role` / `user_roles`)

- **Preserved verbatim.** Enum values, table shape, and helper functions (`has_role`, `is_platform_admin`, `is_user_approved`) unchanged.
- **Bridge into new layer:** every BP1.1A RLS policy calls `is_platform_admin(auth.uid())` as its first branch. Platform admins therefore see and manage every tenant with no additional grants.
- **No new writers.** BP1.1A does not add rows to `user_roles`. The 4-email super-admin bootstrap in `handle_new_user` remains the sole automatic path for platform admin promotion. Relocation of that list to config remains deferred.

## Island 2 — RunOps module (`runops_*`)

- **Preserved verbatim.** The 12-value `runops_role` enum, `runops_role_assignments`, `runops_profiles`, `runops_tenants`, and every `runops_can_write` / `runops_has_role` / `runops_has_any_role` helper remain intact.
- **No shared tables.** `public.tenants` is not `public.runops_tenants`. A later work package may add an optional `runops_tenants.canonical_tenant_id uuid REFERENCES public.tenants(id)` to project the two together; until then RunOps operates as an isolated authority.
- **No RLS crossover.** No BP1.1A policy references any `runops_*` object; no `runops_*` policy references any BP1.1A object.

## Boundary rules for future increments

1. Any new business surface that is *product-neutral* must gate on `has_permission(auth.uid(), _tenant_id, _permission_code)` and never on a role name.
2. Any module-specific authority (RunOps, ETDM, CRM…) may keep its module enum but must expose a `<module>_can(_tenant_id, _permission_code)` helper that resolves through `has_permission` for compatibility.
3. Platform-admin authority is expressed exactly one way: `is_platform_admin(auth.uid())`. Do not introduce a second predicate.
4. Nobody promotes themselves to platform admin through the canonical layer — that path is intentionally absent so the two islands never merge accidentally.

## Reason to preserve rather than merge

Merging RunOps roles into the new tenant-role model would either (a) collapse RunOps's fine-grained 12-role RBAC into coarser codes, or (b) explode the shared `permissions` table with RunOps-specific codes and lock the platform layer into RunOps semantics. Both violate the product-neutrality rule. Coexistence is the correct terminal state until a dedicated RunOps modernization package rewrites its module.
