# NOVA multi-industry tenant profiles — implementation plan

## Current state (grounding, not proposals)

The exploration confirmed the shape of what exists today. Highlights that shape this plan:

- `OperationsProvider` interface at `src/runops/providers/OperationsProvider.ts` **already takes `tenantId` on every list method** — but the sole implementation (`DemoOperationsProvider` inside `src/runops/state/RunOpsProviders.tsx`) ignores it and returns a single global fixture from `src/runops/data/scenario.ts` ("Contoso Global").
- Only one tenant is wired (`tenant-contoso`). The tenant `<Select>` in `RunOpsTopBar.tsx` calls `setTenant` but nothing downstream re-scopes.
- `ScenarioStore` is module-scoped, not tenant-keyed. `AskNova` engine reads global `OperationsState` and has no `tenantId`. No centralized label/vocabulary layer exists. No TTS code exists yet.
- `queryKeys.ts` is already tenant-parameterized but largely unused (fixtures are read directly from context).
- Backend `runops_*` tables are multi-tenant-ready and unreferenced by the client — we will keep it that way for this pass and stay in-memory, matching the existing demo architecture.
- Hardcoded Contoso literals to clean up: `DesignSystem.tsx:433`, `AutonomousExecutionMonitor.tsx:787`, `AutomationRegistry.tsx:398-422`, `StepCodeBuilder.tsx:251`.

## Scope boundary

This plan **extends existing modules**. No second provider, no new shell, no new route registry, no new design system. All tenant-specific content moves behind a profile resolver consumed via `useOperations()` / a new `useTenantProfile()` hook that lives inside the existing provider.

Because there is no server persistence for demo fixtures today, tenant profiles will be **in-memory profile modules** consumed by the existing `DemoOperationsProvider`. Backend migrations are **not** part of this pass (the current app never writes to `runops_*` tables). A follow-up can wire persistence when Connected mode is turned on.

## Deliverables

### 1. Domain model (types-only additions)
Extend `src/runops/domain/models.ts` with strict types (no runtime values):

- `IndustryProfile` — journey/service/component/incident/impact/SLO/error-budget labels, criticality levels, impact dimensions, hard guardrails, standards mappings, default metric/runbook/worker/connector categories, presentation guidance, glossary.
- `TenantOperationalProfile` — tenantId, industryProfileId, displayName, shortName, industry, businessDescription, operatingModel, operatingHours, geographicScope, defaultServiceId, defaultScenarioId, defaultStoryId, defaultEnvironment/Region/TimeRange, tenantAccent, dataClassification, complianceContext, operationalPriorities, hardGuardrails, terminologyOverrides, scenarioMode, syntheticDataNotice, profileVersion, profileState.
- Supporting types: `TenantVocabulary`, `TenantImpactModel`, `TenantCriticalityModel`, `TenantReliabilityPolicy`, `TenantSafetyGuardrail`, `TenantStandardsMapping`, `TenantMetricDefinition`, `TenantTopologyProfile`, `TenantScenarioProfile`, `TenantStoryProfile`, `TenantConnectorProfile`, `TenantWorkerProfile`, `TenantRunbookProfile`, `TenantDisplayPreference`, `TenantSourceSystemAlias`, `GlossaryTerm`.

### 2. Industry profile catalog
New folder `src/runops/profiles/` containing:

- `industryProfiles.ts` — the four industry profiles (generic, healthcare-amc, saas-production, chip-manufacturing) with labels, guardrails, impact dimensions, criticality levels, default categories, glossary entries.
- `contosoProfile.ts` — wraps the existing `src/runops/data/scenario.ts` fixture as a `TenantOperationalProfile` + tenant-scoped fixture bundle (no data change; just re-export in profile shape). Preserves all existing Contoso behavior.
- `meridianHealthProfile.ts` — Meridian University Health (Healthcare AMC): clinical services (EHR, PACS, ADT/HL7 interface engine, patient portal, medication administration, lab), clinical workflow journeys, HL7/FHIR system aliases, HIPAA compliance context, patient-safety hard guardrail, sample incident (interface engine ADT backlog), runbooks with clinical validation steps, digital workers scoped to clinical technology, connectors labeled synthetic, glossary (ADT, HL7, FHIR, EHR, PACS, MPI, RCM, HIS).
- `atlasCloudProfile.ts` — AtlasCloud Production (SaaS): multi-tenant API gateway, ingestion pipeline, control plane, customer-facing dashboards, checkout, auth service; customer-journey SLOs, error-budget policy, security-bypass guardrail; sample incident (ingestion queue backpressure); glossary (SLO, SLI, MTTR, MTTA, RPO, RTO, tenant isolation).
- `apexFabProfile.ts` — Apex Semiconductor Fab 12 (Chip Manufacturing): MES, EAP, RMS, SPC, FDC, WIP tracker, tool controllers, recipe management; production-flow journeys; safety-interlock guardrail; sample incident (photolithography tool FDC excursion / WIP at risk); glossary (MES, EAP, FDC, SPC, WIP, RMS, OEE, CIM).
- `index.ts` — exports `tenantProfiles: Record<TenantId, TenantOperationalProfile>` and helpers `getIndustryProfile(code)`, `getTenantProfile(tenantId)`.
- `presentation.ts` — the single shared `TenantPresentationProfile` resolver: `resolvePresentation(tenantProfile, industryProfile) → { journeyLabel, serviceLabel, componentLabel, incidentLabel, impactLabel, sloLabel, errorBudgetLabel, criticalityLevels, topologyNodeTypes, metricDefinitions, runbookCategories, workerCategories, governanceMappings, glossary, syntheticDataNotice, tenantAccent }`.

All new-tenant fixtures carry `syntheticDataNotice: "Synthetic demonstration data — not a live customer integration."` and connectors are marked as demo simulators.

### 3. OperationsProvider extension (no new provider)
Modify `src/runops/state/RunOpsProviders.tsx` `DemoOperationsProvider` in place:

- Replace the single canonical bundle with a `Map<TenantId, TenantFixtureBundle>` keyed off `tenantProfiles`.
- `getContext()`, `listServices/Incidents/Runbooks/Changes/DigitalWorkers/AuditLog/Notifications/ScenarioStages` route through the map by the arg's `tenantId` (each call already receives it — currently ignored).
- `setTenant(id)` now, in order: (a) persist to `localStorage("runops.selectedTenantId")`; (b) close any open right drawer / entity quick view / command palette selection; (c) reset `selectedServiceId`, `selectedIncident`, `selectedRunbook`, `selectedExecution` to the new tenant's defaults from its profile; (d) re-seed scenario state for that tenant (see §4); (e) emit `TenantSwitched` domain event; (f) append audit event only when acting role is `platform_admin` or `demo_controller`.
- Extend `OperationsProvider` interface with `getTenantProfile(tenantId): ProviderResponse<TenantOperationalProfile>` and `getIndustryProfile(code): ProviderResponse<IndustryProfile>` — both read-only, no persistence dependency.
- Add cross-tenant guard: any `get*(id)` method that finds an entity whose `tenantId` does not match the currently selected tenant returns `{ ok: false, error: "TenantContextMismatch" }` — pages already handle `ProviderResponse` unions.

### 4. Scenario isolation
Modify `src/runops/scenario/ScenarioStore.tsx`:

- Change the state shape from a single `{stageIndex, playState, injections}` to `Record<TenantId, ScenarioSessionState>`.
- Selectors take current tenant from `useOperations().context.tenant.id`.
- Persist per-tenant scenario stage in `localStorage("runops.scenario.<tenantId>")`.
- `resetScenario()` resets only the current tenant. Add `resetAllScenarios()` behind a Demo Controller-only action for the "Reset All Demo Tenants" affordance.
- No `ScenarioStoreProvider` re-instantiation; state simply becomes keyed.

### 5. Ask NOVA tenant scoping
- Extend `AiProvider` interface with a `tenantId: TenantId` param on all retrieval methods.
- Update `askNovaEngine.ts` so the `ops` argument is filtered to only the selected tenant's entities before classification, and the response uses `resolvePresentation(...)`-derived labels (impact label, incident label, SLO/error-budget label, guardrails). Evidence lookup only inspects the current tenant's fixture bundle — cross-tenant evidence is unreachable by construction.
- Update `AskNovaPanel.tsx` to pass `ops.tenant.id` explicitly.

### 6. Tenant selector & context indicator
Modify `src/runops/shell/RunOpsTopBar.tsx`:

- Populate the `<Select>` from `useOperations().listTenants()` (already returns the full canonical tenant list — will now include four entries).
- Add an inline tenant-context indicator chip next to the selector: tenant `shortName` + industry label + a small "Synthetic demo data" badge for the three new tenants.
- Emit an audit event via `OperationsProvider.appendAudit` only for admin/impersonation switches (role check).

### 7. Tenant Profile Manager page
- Register route in `src/runops/shell/routes.ts`: `platform/tenant-profiles`, section `Platform`, gated to `platform_engineer` and `demo_controller` roles.
- New page `src/runops/pages/platform/TenantProfileManager.tsx` using existing `shell.tsx`, `panels.tsx`, `data.tsx` primitives. Sections: All Profiles list → open one → tabs for Business Context, Terminology, Services & Components, Metrics & SLOs, Scenarios, Runbooks, Digital Workers, Policies & Guardrails, Connectors, Standards Mappings, Data Completeness.
- Actions (calling profile validator and `OperationsProvider` mutations): Activate/Deactivate profile, Set default service, Set default scenario, Set default story, Validate integrity. Never renders secrets/credentials fields.

### 8. Profile integrity validator
New `src/runops/profiles/validate.ts` — pure function `validateTenantProfile(profile, bundle): ValidationReport` covering the checklist from the request (default service/scenario/story exist, runbooks have owners, prod runbooks have validation+rollback or exception, SLOs have source metrics, workers have tool grants and authority boundaries, connectors have owners, incidents reference valid services, topology edges reference valid entities, analytics metrics have definitions, standards mappings labeled as mappings not certifications, synthetic-data notices present, no cross-tenant references). Consumed by the Tenant Profile Manager and by a dev-time assertion in `RunOpsProviders.tsx` (console warning in dev only).

### 9. Presentation cleanup
Replace the four hardcoded Contoso literals with values sourced from the resolver:
- `src/runops/pages/DesignSystem.tsx:433` → `ops.tenant.name`.
- `src/runops/pages/AutonomousExecutionMonitor.tsx:787` → drop or generalize the note.
- `src/runops/pages/AutomationRegistry.tsx:398-422` → `publisher` sourced from tenant profile.
- `src/runops/components/StepCodeBuilder.tsx:251` → derive AG listener TTL note from the current tenant's `sourceSystemAliases` / topology profile.

### 10. Audit + domain events
- Extend the local `DomainEvent` union in `src/runops/domain/events.ts` with `TenantSwitched`, `TenantProfileActivated`, `TenantProfileDeactivated`, `DefaultScenarioChanged`, `StandardsMappingChanged`, `GuardrailChanged`, `ProfileValidationOverridden`.
- Emit through the existing in-memory bus and `appendAudit` — same wiring the app already uses.

## Non-goals for this pass

- No Supabase migrations, no new backend tables, no edge functions. The existing app never writes to `runops_*` tables; adding server persistence is a separate task once Connected mode is enabled.
- No new speech/TTS provider. The spec says "where speech is enabled" — since no TTS exists today, we only expose the tenant-aware narration text via the resolver (`resolvePresentation(...).narrationTemplates`) so a future TTS layer can consume it without another refactor.
- No browser end-to-end tests (per the request).
- No visual redesign — same tokens, same layout, industry authenticity comes from data.

## Risks / trade-offs

- The existing `DemoOperationsProvider` is one ~420-line function. Refactoring to a per-tenant map without breaking the current Contoso flow is the highest-risk edit. Mitigation: keep the Contoso bundle identical (built from `data/scenario.ts` unchanged) and add the three new bundles alongside; the map-lookup path collapses to the current behavior when only Contoso is selected.
- The `Tenant` fixture in `data/scenario.ts` currently omits `slug` and is force-cast. This plan reconciles the type by adding `slug` to the fixture (non-breaking) rather than loosening the domain type.
- `ProviderResponse` error path for cross-tenant mismatch is new; a handful of pages currently assume `ok: true`. We'll add a shared "tenant context mismatch" empty-state component in `runops/components/states.tsx` and route mismatches through it.

## Rollout order (single PR, incremental commits)

1. Types in `models.ts` + profiles folder scaffolding (no behavior change).
2. Contoso profile wrapper — verify app still renders identically.
3. Meridian / AtlasCloud / Apex profiles + selector wiring.
4. Scenario store keying by tenant.
5. Ask NOVA scoping + presentation cleanup.
6. Tenant Profile Manager route + validator.
7. Audit/domain events + hardcoded-literal cleanup.

Confirm this plan (or point at sections to change) and I'll implement.
