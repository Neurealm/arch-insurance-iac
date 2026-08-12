# Meridian University Epic EHR / Azure CMDB Digital Twin — Pre-Implementation Readiness Assessment

**Mode:** Read-only. No code, schema, RLS, route, config, dependency, or UI changes were made during this assessment.
**Date:** 2026-07-12
**Target:** Add a Meridian University tenant twin (Epic EHR on Azure, CMDB-driven) to the existing Neugain.io (Pre-Sales PRD) project.

---

## Executive summary

**Overall status: 🟢 Green — ready to implement.**

The project already contains a scaffolded `meridianProfile.ts` (686 lines) alongside `contoso`, `atlasCloud`, and `apexFab`, wired into the tenant registry. Multi-tenant seams (providers, RLS helpers, query keys, route guard, presentation profiles) are in place and were verified as intact after the recent RLS helper repair. No blockers were identified. A short list of items must be extended (not created) during implementation — enumerated below.

---

## Pass 1 — Build & tooling baseline

| Check | Status | Notes |
| --- | --- | --- |
| `bun run build` | 🟢 Passed | Built in 42s. Only pre-existing warning is the >500 kB main chunk (`index-*.js` 13.4 MB / 3.2 MB gzipped) — not new. |
| `tsgo --noEmit` | 🟢 Passed | Clean (from prior verification pass, unchanged). |
| ESLint | 🟡 Pre-existing debt | ~791 pre-existing errors, unrelated to this work. Documented as accepted baseline. |
| Vitest | 🟢 Passed | 1/1 test passing (`src/test/example.test.ts`). No dedicated auth-authorization suite. |
| Preview / console / network | 🟢 Clean | No 4xx/5xx or console errors at `/` baseline. |

**Pre-existing debt to be aware of:** oversized main bundle; ESLint backlog; no dedicated auth test suite.

---

## Pass 2 — Recent security repair state (RLS helper grants)

Verified via `pg_proc` + `has_function_privilege` matrix during the prior repair verification. Still current.

| Function | `authenticated` | `anon` | `service_role` |
| --- | --- | --- | --- |
| `is_platform_admin(uuid)` | ✅ EXECUTE | ❌ | ✅ |
| `runops_has_tenant_access(uuid)` | ✅ EXECUTE | ❌ | ✅ |
| `runops_can_write(uuid)` | ✅ EXECUTE | ❌ | ✅ |
| `has_role`, `is_user_approved`, `runops_has_role`, `runops_has_any_role` | ❌ | ❌ | ✅ |
| All 8 mutation RPCs (`runops_advance_scenario`, `runops_reset_scenario`, `runops_resolve_incident`, `runops_approve_change`, `runops_approve_execution`, `runops_deny_execution`, `runops_certify_runbook_version`, `runops_bootstrap_current_user`) | ❌ | ❌ | ✅ |

- `profiles` / `user_roles` reads: 🟢 return 200 for authenticated users.
- Mutation RPCs: 🟢 remain locked to `service_role`; no client `.rpc()` call sites in `src/` or `supabase/functions/`.

**No re-work required to accommodate Meridian.** New Meridian-scoped RLS policies can reuse the existing three helpers unchanged.

---

## Pass 3 — Multi-tenant architecture fit

Inspected seams:

| Seam | File(s) | Status |
| --- | --- | --- |
| Tenant registry | `src/runops/profiles/index.ts` | 🟢 `meridianRecord` + `meridianTenant` already registered alongside Contoso/Atlas/Apex. |
| Presentation profile | `src/runops/profiles/presentation.ts` + `types.ts` | 🟢 `TenantPresentationProfile` / `TenantOperationalProfile` shape supports Meridian's needs. |
| Profile validation | `src/runops/profiles/validate.ts` | 🟢 Available; will validate the Meridian bundle at load. |
| Operations provider | `src/runops/providers/OperationsProvider.ts` + `ConnectedOperationsProvider.ts` | 🟢 `setTenant` contract (drawer close, default-service reselect, stage reload, story-navigator refresh, role revalidation, equivalent-route navigation with landing fallback) already established. |
| Scenario stages | `src/runops/scenario/stageDefinitions.ts`, `ScenarioStore.tsx` | 🟢 Structure supports per-tenant stage sets. Meridian-specific 20+ step story stages will need to be added to the profile bundle. |
| Global search / Nova / speech | `src/runops/search/searchCatalog.ts`, `src/runops/nova/askNovaEngine.ts`, `src/runops/shell/AskNovaPanel.tsx` | 🟢 Scoped by `selectedTenantId`. |
| Route allow-list | `src/hooks/useTenantScope.ts`, `src/components/auth/TenantAccessGuard.tsx`, `src/runops/shell/routes.ts` | 🟢 Ready — Meridian route entries will register through the same table. |
| Query keys | `src/runops/domain/queryKeys.ts` | 🟢 Accept `selectedTenantId`. New Meridian queries must continue the convention. |

**Implementation implication:** the Meridian twin plugs into existing seams without any provider or shell code changes — only content (profile fixtures, scenario stages, route entries, sidebar labels).

---

## Pass 4 — Domain-specific readiness (Epic EHR / Azure CMDB / Higher-Ed Health System)

| Concern | Status | Notes |
| --- | --- | --- |
| Healthcare guardrails (no autonomous med-order changes, no PHI in narration) | 🟡 Applies conceptually | Codified in the multi-tenant verification plan (Pass 3 in `.lovable/plan.md`). Must be re-asserted at the Meridian profile's guardrail declaration. |
| Closest architectural template | 🟢 `foc-twin` and `sre-twin` are the closest for CMDB + topology; `data-orchestration-twin` for integration flows; `prod-twin` for production topology views. | Pick from existing patterns — no new twin framework required. |
| CI/CMDB modeling primitives | 🟡 Partial | `src/runops/domain/models.ts` covers services + components + dependencies; a proper CMDB (CI classes, relationships, environments, change/incident linkage) may need additional fixture-level structures in the Meridian bundle. No new global tables required for a demo/pre-sales twin. |
| Role set (Epic Analyst, HIM, Clinical Informaticist, Azure Platform Eng, HIPAA Compliance) | 🟢 Maps onto existing `runops_role` enum | Existing roles (`service_owner`, `platform_engineer`, `change_manager`, `sre_engineer`, `incident_commander`, `runbook_author`, `noc_operator`, `digital_worker_administrator`, `demo_controller`) cover the write-permitted seat set. Domain-specific *labels* live in the presentation profile, not the enum. **No `app_role` or `runops_role` enum change required.** |
| Feature flags | 🟢 `demoMode: true`, `connectedMode: false`, `autonomousExecution: false` remain the default posture for the new twin. |

---

## Pass 5 — Database & RLS readiness

- Existing `runops_*` tables are tenant-scoped via `tenant_id` and gated by `runops_has_tenant_access` / `runops_can_write` / `runops_has_role`.
- Adding Meridian requires **data-level seeding only**: a `runops_tenants` row + membership seeds — not new tables, functions, or policies.
- If future Meridian phases add CMDB-specific tables, they must follow the standard four-step pattern (CREATE → GRANT → RLS → POLICY) using the three restored helpers.

---

## Pass 6 — Routing & navigation surface

- New Meridian routes attach via `src/runops/shell/routes.ts` (same table other tenants use). No collision with existing paths.
- `TenantAccessGuard` allow-list is data-driven off `useTenantScope` → tool/dashboard assignments; no code change to the guard itself.
- Tenant switcher (`setTenant`) already handles arbitrary tenant IDs from the registry — a fifth entry needs no switcher change.

---

## Pass 7 — Design system readiness

- Semantic tokens in `src/index.css` + `tailwind.config.ts` are sufficient. Do not hardcode Tailwind color utilities (`text-white`, `bg-blue-500`, `bg-[#...]`) — any Meridian healthcare accent must be added as a semantic token variant, not inline.
- shadcn surface (cards, badges, tabs, drawers, tables, sheets, dialogs) already covers CMDB explorer / topology / change-management patterns used by `foc-twin`, `sre-twin`, `prod-twin`.

---

## Pass 8 — Risk register

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Cross-tenant leakage via missing `selectedTenantId` in a new query key | Medium | Every new Meridian query must include the tenant ID (mirror Contoso pattern). Reviewed at PR time. |
| PHI in Nova narration or speech provider | Medium | Reassert healthcare guardrail in the Meridian profile's guardrail declaration; audit narrations for PHI-leak strings. |
| Role escalation via `profiles` instead of `user_roles` | Low | Existing separation is enforced; Meridian must follow the same pattern. |
| Connected-mode drift | Low | Keep `defaultFeatureFlags` unchanged; Meridian must remain a demo tenant. |
| Bundle size regression | Medium | Main chunk is already 13.4 MB. Meridian scenario fixtures should be lazy-loaded or code-split where feasible. |
| Pre-existing 791 ESLint errors masking new regressions | Medium | Fail Meridian PRs on **new** lint errors only; track the delta explicitly. |

---

## Prerequisites the Meridian build must satisfy

1. **Profile fixtures** — flesh out `src/runops/profiles/meridianProfile.ts` bundle with Epic EHR / Azure CMDB entities, scenario stages, guardrails, and industry metadata.
2. **Presentation labels** — Meridian-specific service names, unit labels (HL7 msg/s, chart open latency, EHR downtime, etc.), and industry-appropriate metric copy in `presentation.ts` / the profile itself.
3. **Scenario stages** — Add Meridian's 20+ step story to `stageDefinitions.ts` or the profile bundle following the Contoso pattern.
4. **Route entries** — Register any Meridian-specific routes in `src/runops/shell/routes.ts`; tie them into `useTenantScope`.
5. **Sidebar labels** — Add Meridian-scoped nav entries via existing `RunOpsSidebar` mechanism (data-driven).
6. **Tenant seed** — Insert a `runops_tenants` row for Meridian + demo membership seeds (data migration, not schema).
7. **Guardrails** — Reassert healthcare guardrails (no autonomous med-order changes, no PHI in narration) at the profile level.
8. **Query keys** — Every Meridian query must include `selectedTenantId`.

---

## Items NOT ready / follow-up needed before build

- Deeper **CMDB CI-class modeling** (CI classes, relationships, environments, change/incident linkage graphs) may need extension of `src/runops/domain/models.ts` types if the pre-sales story requires a real CMDB explorer surface. To be decided at story-scoping time.
- **Bundle splitting** for tenant fixtures should be planned before Meridian's fixture data lands, to avoid worsening the >500 kB warning.
- **Dedicated auth/authorization test suite** is still absent; adding Meridian is a good moment to introduce at least a smoke suite that exercises the RLS helper grant matrix through the client.

---

## Confirmation

**Nothing was modified during this assessment.** No files edited, no migrations run, no policies changed, no dependencies added, no routes touched, no UI updated. The build was executed only as a read-only verification of the current baseline.
