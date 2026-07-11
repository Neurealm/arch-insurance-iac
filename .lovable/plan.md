# Multi-Industry Tenant Verification & Hardening

This is a verification + hardening pass, not a redesign. I'll audit the existing implementation, produce a defect list, and fix defects in place. No new providers, stores, tenants, or design system.

## Approach

Six sequential passes. Each pass produces a defect list + fixes + a short verification note. I'll ship fixes at the end of each pass so you can review incrementally rather than in one giant diff.

### Pass 1 — Isolation audit (read-only)

Static audit across the codebase for tenant-leak vectors. Deliverable: defect list categorized by severity.

- Grep every `runops/pages/**` for: hardcoded tenant IDs, direct fixture imports (`contosoProfile`, `meridianProfile`, `atlasCloudProfile`, `apexFabProfile`), industry-string literals (`"healthcare"`, `"saas"`, `"fab"`), and hardcoded arrays that should come from `TenantPresentationProfile` / `TenantOperationalProfile`.
- Confirm every page consumes `useOperations()` + `useTenantPresentation()` and filters by `selectedTenantId`.
- Confirm `GlobalSearch`, `AskNovaPanel`, `SpeechProvider` scope to `selectedTenantId`.
- Confirm `RunOpsProviders.setTenant` performs: drawer close, default-service reselect, stage reload, story-navigator refresh, role revalidation, equivalent-route navigation with landing fallback.
- Confirm query keys include `selectedTenantId` so React Query caches don't bleed.
- Confirm RLS: `runops_has_tenant_access`, `runops_can_write`, `runops_has_role` are used by every mutation RPC and every table policy references `tenant_id`.

### Pass 2 — Fix cross-tenant leakage & stale data

- Add `selectedTenantId` to any query key missing it.
- Replace direct fixture imports in pages with profile-driven lookups.
- Ensure `setTenant` invalidates prior-tenant caches and closes drawers.
- Fix any page that renders arrays not scoped by `tenant_id`.

### Pass 3 — Terminology, units, guardrails, roles

- Replace generic strings ("service X", "team Y") with presentation-profile labels.
- Verify metric units per industry (ms, %, wafers/hr, WIP, lots, defect PPM, HL7 msg/s).
- Verify hard guardrails are immutable in scenario execution paths:
  - Healthcare: no autonomous med-order changes, no PHI in narration.
  - SaaS: change-freeze + approver-not-requester enforced.
  - Fab: recipe changes, interlock bypass, lot release, chamber release require human authority.
- Verify role restrictions on `runops_approve_execution`, `runops_certify_runbook_version`, `runops_resolve_incident` cover industry-specific roles.

### Pass 4 — Dead buttons, fake mutations, console/network hygiene

- Wire any dead action buttons to their store mutations or hide them.
- Confirm each mutation call returns a real domain/audit event.
- Fix console errors and unexpected 4xx/5xx network calls surfaced during audit.

### Pass 5 — Story dry-run (code trace, no browser)

For each of the three stories (Healthcare, SaaS, Fab), trace the 20+ steps through the code:
- Scenario stages present and ordered correctly.
- Each step's target entity exists in the profile bundle.
- Approvals require the right roles.
- Postmortem + improvement actions land in the right tables.

I'll flag any story step that isn't code-reachable and fix it.

### Pass 6 — Final report

Markdown report at `docs/multi-tenant-verification-report.md` with:
- Profiles tested, routes audited, stories traced.
- Defects found, defects fixed, defects deferred with rationale.
- Simulated integrations catalog.
- Remaining limitations and production work required.
- Security matrix (per-tenant read/write × role).

## Explicit non-goals (per your instructions)

- No redesign of pages, providers, stores, selectors, or design system.
- No new tenants or industries.
- No browser testing this build (you deferred it).
- Responsive/a11y checks are static (source review of Tailwind breakpoints, aria props, focus rings) — no live viewport testing.
- Speech tests are code-trace only (voice provider config + tenant-scoped narration source).

## Technical details

- Audit tool: `rg` across `src/runops/**`, plus `supabase--read_query` for policy inspection on the ~50 `runops_*` tables.
- No schema migrations expected unless the audit finds a missing `tenant_id` filter in an RLS policy — in which case I'll surface the exact SQL and ask before applying.
- Fixes stay in presentation + query-key + provider-glue layers.
- Expected file touches: 20–40, concentrated in `src/runops/pages/**`, `src/runops/state/**`, `src/runops/shell/**`.

## Deliverable per pass

Code changes + `tsgo` clean + a short "what I found, what I fixed, what I deferred" note. I'll ask before starting a pass that requires schema or policy changes.

Ready to start Pass 1?