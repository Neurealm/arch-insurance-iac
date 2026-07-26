# CDT Permission Catalogue

Status: Foundation (CDT-REFERENCE-FOUNDATION, 2026-07-26).
Confidence C2 (application source) unless noted. Permission enforcement is layered;
the manual must always describe all three layers, never only the UI layer.

---

## 1. Enforcement layers

| Layer | Mechanism | Effect |
|---|---|---|
| 1. Authentication | `ProtectedRoute` | Unauthenticated users are redirected to `/login`; unapproved users to `/pending-approval` |
| 2. Route authorization | `PermissionRoute permission="commercial.view"` | Renders `ForbiddenState` when the active tenant lacks the permission |
| 3. Tenant context | `AccessProvider` / `CommercialLayout` | No active tenant → "No active workspace" state; all queries are keyed by tenant |
| 4. Control-level gating | `hasPermission(...)` in each page | Buttons hidden or disabled; e.g. badge "View-only (missing commercial.model.run)" |
| 5. Database | RLS on all `commercial_*` tables + `SECURITY DEFINER` RPCs with pinned `search_path` | Authoritative enforcement; UI gating is convenience only (C3/C5) |

Platform-admin bypass: `isPlatformAdmin` short-circuits layers 2 and 4
(`PermissionRoute` returns children; each page ORs `isPlatformAdmin` into its
capability flags). Database-level tenant scoping still applies.

**Rule for authors:** never describe a hidden button as a security control. The
security control is the RPC and RLS.

---

## 2. Permission codes

| Code | Grants | Screens | Actions |
|---|---|---|---|
| `commercial.view` | Read access to the entire module | SCR-01…SCR-16 (all route guards) | `ACT-04`…`ACT-11` |
| `commercial.program.manage` | Program management capability | SCR-02 | (no mutating control currently rendered — `GAP-03`) |
| `commercial.scenario.manage` | Scenario management capability | SCR-03 | Scenario/assumption maintenance |
| `commercial.account.manage` | Portfolio account management | SCR-04 | Account maintenance / seeding |
| `commercial.source.manage` | Source register management | SCR-05 | Source maintenance / seeding |
| `commercial.admin` | Commercial administrative capability | module-wide | Administrative operations |
| `commercial.assumption.change.create` | Create change sets | SCR-09 | `ACT-16`, `ACT-17` |
| `commercial.assumption.change.validate` | Validate change sets | SCR-09, SCR-10 | `ACT-19` |
| `commercial.assumption.change.apply` | Apply change sets | SCR-09, SCR-10 | `ACT-20` |
| `commercial.assumption.change.cancel` | Cancel change sets | SCR-10 | `ACT-21` |
| `commercial.model.run` | Execute the engine | SCR-06, SCR-07, SCR-08 | `ACT-22`, `ACT-23`, `ACT-24` |
| `commercial.comparison.create` | Create comparison drafts | SCR-11 | `ACT-25` |
| `commercial.comparison.save` | Freeze comparison snapshots | SCR-12 | `ACT-27` |
| `commercial.comparison.archive` | Archive comparisons | SCR-12 | `ACT-28` |
| `commercial.sensitivity.create` | Create experiments | SCR-13 | `ACT-29` |
| `commercial.sensitivity.execute` | Execute and reset experiments | SCR-14 | `ACT-30`, `ACT-31` |
| `commercial.sensitivity.archive` | Archive experiments | SCR-14 | `ACT-32` |
| `commercial.release.certify` | Create, refresh, certify, invalidate certifications | SCR-16 | `ACT-34`…`ACT-37` |
| `commercial.model.version.activate` | Activate a version and create a successor | SCR-16 | `ACT-38`, `ACT-39` |

---

## 3. Screen-to-permission matrix

| Screen | Required to open | Additional for mutation |
|---|---|---|
| SCR-01 Overview | `commercial.view` | — |
| SCR-02 Program | `commercial.view` | `commercial.program.manage` |
| SCR-03 Scenarios | `commercial.view` | `commercial.scenario.manage` |
| SCR-04 Portfolio | `commercial.view` | `commercial.account.manage` |
| SCR-05 Sources | `commercial.view` | `commercial.source.manage` |
| SCR-06 Revenue | `commercial.view` | `commercial.model.run` |
| SCR-07 P&L | `commercial.view` | `commercial.model.run` |
| SCR-08 Cash | `commercial.view` | `commercial.model.run` |
| SCR-09 Assumptions | `commercial.view` | `…change.create` / `.validate` / `.apply` |
| SCR-10 Change-Set Detail | `commercial.view` | `…change.validate` / `.apply` / `.cancel` |
| SCR-11 Compare | `commercial.view` | `commercial.comparison.create` |
| SCR-12 Compare Detail | `commercial.view` | `commercial.comparison.save` / `.archive` |
| SCR-13 Sensitivity | `commercial.view` | `commercial.sensitivity.create` |
| SCR-14 Sensitivity Detail | `commercial.view` | `commercial.sensitivity.execute` / `.archive` |
| SCR-15 Release | `commercial.view` | — |
| SCR-16 Release Detail | `commercial.view` | `commercial.release.certify`, `commercial.model.version.activate` |

---

## 4. Role-oriented capability profiles

These are interpretation profiles for training, not implemented role definitions
(`GAP-09` — the mapping of tenant roles to these codes is not inspected in this pass).

| Reader role | Typically needs | Typically must not have |
|---|---|---|
| Executive | `commercial.view` | any mutating code |
| CFO | `commercial.view` | run/apply/activate |
| FP&A analyst | `commercial.view`, `commercial.model.run`, comparison and sensitivity codes | `…activate` |
| Commercial leader | `commercial.view`, `…change.create` | `…change.apply`, `…activate` |
| Program owner | `commercial.view`, `commercial.program.manage`, `…change.create`/`.validate` | `…activate` |
| Model owner | run, change apply, comparison, sensitivity, `commercial.release.certify` | `…activate` (segregation of duties) |
| Platform administrator | platform-admin bypass, `commercial.model.version.activate` | — |
| Auditor | `commercial.view` only | all mutating codes |
| Operational support | `commercial.view` + escalation per `bp3-operational-handoff.md` | `…apply`, `…certify`, `…activate` |

Segregation-of-duties note for Volume 1: certification (`commercial.release.certify`)
and activation (`commercial.model.version.activate`) are separate codes and should be
held by different people wherever the tenant's control environment permits (C6).

---

## 5. Database security posture (C3/C5)

1. RLS is enabled on every `commercial_*` table; policies scope rows by tenant
   membership.
2. All 28 UI-invoked functions are `SECURITY DEFINER` with pinned `search_path`.
3. `PUBLIC` / `anon` EXECUTE is revoked on the release lifecycle RPCs.
4. 37 functions retain `anon` EXECUTE grants but fail closed via authentication and
   tenant-membership checks; hardening is deferred item `DEF-05` — the manual must
   describe this as a known accepted item, never as a vulnerability finding and never
   as fully hardened.
5. Immutability guards prevent updates to completed runs, results, saved comparison
   snapshots, certifications, activations and lineage.

---

## 6. Permission-denied user experience (for chapter §18)

| Situation | What the user sees | What the manual must say |
|---|---|---|
| Not signed in | Redirect to `/login` | Sign in and retry |
| Signed in, not approved | Redirect to `/pending-approval` | Await approval |
| No `commercial.view` on active tenant | `ForbiddenState` naming the permission | Request the permission from a tenant administrator |
| No active tenant | "No active workspace" with "Open Platform" | Select or create the NeuGAIN Commercial workspace |
| Missing mutating permission | Control hidden or disabled; on run screens a "View-only" badge | Read the data; request the capability to act |
| Permission present in UI but RPC rejects | Error toast from the RPC | The database is authoritative; escalate per operational handoff |
