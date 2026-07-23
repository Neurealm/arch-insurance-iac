# Project Memory

## Core
Product must remain partner-, customer-, industry-, and technology-neutral. Named orgs (Neurealm, Contoso, Meridian, Atlas, Apex, Citrix, Epic) and vertical terms (healthcare, VDI) are tenant data or module fixtures — never product-core logic.
Authorization is permission-based via `has_permission(user, tenant, permission)`. Role-name checks (`is_platform_admin`, `has_role`, `runops_has_role`) are legacy — do not spread them to new code.
Every `CREATE TABLE public.*` migration must include explicit `GRANT` statements in the same migration; RLS alone is not enough.
Roles are always stored in a separate table, never on `profiles` or `users`. Never check admin status from `localStorage` or hardcoded credentials.
Supabase (Lovable Cloud) project ref `esfpbiishpkvhlejnxzq`. Anon-only key on the client; service-role key must never reach the browser.

## Memories
- [BP1.1 scope](mem://constraints/bp1.1-scope) — Platform Foundation boundary; what BP1.1 may add and what it must preserve (RunOps, `app_role`, super-admin bootstrap).
