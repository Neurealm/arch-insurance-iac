## Multi-Tenant Module Alignment — Plan

The shared architecture already exists: `RunOpsProviders` swaps `TenantFixtureBundle`/`TenantOperationalProfile`/`TenantPresentationProfile` atomically on tenant change, and all four tenant records (`tenant-contoso`, `tenant-healthcare-amc`, `tenant-saas-production`, `tenant-chip-manufacturing`) are registered. What remains is a coherent alignment pass across every module page + the shell, plus new tenant-specific catalogs (topology node types, readiness categories, story navigator, scenario injections, completeness scorecard).

Given the surface area (50+ pages under `src/runops/pages/`, plus shell, plus new catalogs), I will land this in **six sequenced batches**. Each batch is independently valid, typechecks clean, and preserves Contoso.

---

### Batch 1 — Shell, switching semantics, global scope guards

- Verify `RunOpsProviders.setTenant` performs: shell preservation, default service select, stage reload, story-navigator refresh, drawer-close, tenant-role revalidation, equivalent-route navigation with landing-page fallback.
- Add missing pieces if any: `closeEntityDrawersOnTenantChange`, `navigateToEquivalentRoute(currentPath, newTenantId)`, `revalidateTenantRole`.
- `RunOpsTopBar` tenant selector: unchanged UX, but ensure it triggers the full switch pipeline above.
- `CommandPalette` / Global Search: filter every result set to `selectedTenantId`; add industry-label chip on each result row.
- `AskNovaPanel` retrieval: hard-scope corpus to current tenant; assert no cross-tenant leak.

### Batch 2 — Presentation + topology + readiness catalogs

- Extend `industryProfiles.ts` with per-industry `topologyNodeTypes` for healthcare, saas, chip (lists specified in the request).
- Add `operationalReadinessCategories` per industry (healthcare / saas / chip).
- Add `communicationsAudiences` per industry.
- Add `runbookDesignerTemplates` per industry (patient-safety assessment, downtime decision, ...; SLO burn, canary, ...; tool hold, lot hold, WIP reroute, ...).
- Add `toilCategories` per industry.
- Add `postmortemContributingFactorCategories` per industry.
- Expose all through `TenantPresentationProfile` and `getPresentation(tenantId)`.

### Batch 3 — Reliability Command Center + Service Portfolio + Digital Twin + Topology + Observability

Rewrite these five pages to read from `useTenantPresentation()` + `useOperations()`:
- `Command.tsx` — swap KPI tiles per industry (clinical workflows / customer journeys / production flows) using presentation-driven labels + bundle metrics.
- `ServicePortfolio.tsx` — categories/criticality/owners/SLOs/runbook coverage from presentation + bundle.
- `ServiceDigitalTwin.tsx` — journeys, impact dimensions, topology, telemetry, changes, guardrails from bundle.
- `TopologyExplorer.tsx` — render tenant `topologyNodeTypes` and group components accordingly.
- `ObservabilityExplorer.tsx` — bind metric definitions/units/thresholds to `presentation.metricDefinitions`.

### Batch 4 — Runbook family + Policy + Launch + Execution + Approval + Evidence

- `RunbookLibrary.tsx` — filter to selected-tenant runbooks; industry-domain tags.
- `RunbookDetail.tsx` / `RunbookDigitalTwin` — tenant-specific impact, guardrails, workers, approvals, evidence, validation, rollback, standards, terminology.
- `RunbookDesigner.tsx` — pull node templates from presentation catalog.
- `RunbookStepBuilder.tsx` — filter connectors/commands/targets/permissions to tenant bundle connectors + workers.
- `RunbookPolicyDesigner.tsx` — enforce industry hard guardrails as immutable, layer generic policy on top.
- `RunbookTestLab.tsx` — tenant-specific scenario libraries.
- `RunbookRelease.tsx` — tenant-specific review roles + certification.
- `RunbookTriggers.tsx` — tenant-specific events / metric conditions / sources.
- `RunbookLaunchCenter.tsx` — tenant-specific risk / impact / target types / approvals / connectors / guardrails / validation.
- `GuidedExecution.tsx` / `AutonomousExecutionMonitor.tsx` — tenant workflow state + impact framing.
- `ApprovalCenter.tsx` — industry roles + separation of duties from presentation.
- `EvidenceReplay.tsx` — tenant evidence types + redaction rules + units.

### Batch 5 — Incident lifecycle (Triage → Command → Investigation → Hypothesis → Remediation → Comms → Recovery → Postmortem → Corrective)

Rewrite each page to bind labels, roles, correlations, options, audiences, criteria, and category catalogs to the presentation profile. Every content generator that was tenant-agnostic gets a `presentation`/`bundle` parameter. `StakeholderCommunications.tsx` gains per-industry audience lists.

### Batch 6 — Workers, SLOs, Knowledge, Analytics, Governance, Security, AI Gov, Integration Hub, Platform + Story Navigator + Scenario Injections + Completeness Dashboard

- `DigitalWorkerCatalog.tsx` / `DigitalWorkerStudio.tsx` — show only workers assigned to the tenant; enforce tenant tool grants / authority / prohibitions.
- `SloCenter.tsx` — tenant label, objectives, hard controls.
- `RunbookFitness.tsx` — tenant fitness dimensions.
- `KnowledgeGraph.tsx` — tenant vocabulary + access.
- `ReliabilityValueAnalytics.tsx` — tenant metric catalog.
- `GovernanceCenter.tsx` — standards mappings only (existing profile field).
- `ExecutionSecurity.tsx` — tenant identities/service accounts/workers/zones/high-risk actions.
- `AIGovernance.tsx` — industry-specific worker evaluation tests.
- `IntegrationHub.tsx` — tenant connectors + dependencies only.
- `PlatformHealth.tsx` — tenant runner/integration/profile/completeness.
- **Demo Story Navigator** (`DemoControllerDrawer`) — story selector for the four industries; selecting a story confirms then switches tenant + resets scenario to that story's default service/incident/runbook/execution/change/problem/postmortem/workers/metrics/narrative; "Continue Story" requires the current stage's required-action to be satisfied (advance is gated, not navigational).
- **Scenario failure injections** — extend `ScenarioStore` with per-industry deterministic, `resetScenario`-reversible injections (healthcare: interface down, msg-seq fail, downtime, approval denied, PHI redaction fail; saas: hot shard, canary fail, tenant-iso fail, region down, flag rollback fail; chip: FDC trace unavail, alt chamber unavail, qual fail, checksum mismatch, quality denied, AMHS reroute unavail).
- **Profile Completeness Dashboard** on `/platform/tenant-profiles` — extend `validateTenantProfile` with 18 dimensions (Services, Components, Dependencies, Journeys, Metrics, SLOs, Runbooks, Tests, Scenarios, Incidents, Workers, Connectors, Policies, Knowledge, Analytics, Story, Security, Synthetic-data labeling) and render per-dimension score with drilldown into missing/invalid elements.

---

### Technical notes

- No new provider, scenario store, tenant selector, navigation, or design system is introduced.
- All page changes are presentation-layer: consume `useOperations()` + `useTenantPresentation()` and drop hardcoded arrays.
- Route registry in `src/runops/shell/routes.ts` is preserved; equivalent-route mapping and landing-page fallback added inside `setTenant`.
- Authenticity guardrails: strip generic strings ("Server 1", "Alert triggered", ...) as each page is touched; every metric/incident/runbook/worker must carry the fields listed under Halo of Authenticity.
- Contoso remains the reference tenant and must keep functioning across every batch.

### Deliverables per batch

Each batch: (a) code changes, (b) `tsgo` clean, (c) short list of files touched, (d) a one-line note if anything was deferred to a later batch. No browser testing (per request).

### Ask before starting

This is roughly 60–90 file touches. Do you want me to proceed batch-by-batch (I ship Batch 1, you review, I ship Batch 2, ...), or land Batches 1+2 (foundations + catalogs) in one pass and then proceed?
