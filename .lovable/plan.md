# Plan: Build Prompts 0A–0F, then 0G

Prompts 0A–0F were never executed in this project. Before I can build 0G (global state, scenario/persona controls, search palette, entity drawer, shared components, Foundation gallery), I need a canonical data foundation for a semiconductor verification / silicon program management platform (tenants → portfolios → programs → IPs, with Requirements, Specifications, RTL modules, Interfaces, Registers, Tests, Regressions, Formal properties, Static findings, Defects, AI analyses, Changes, Milestones, Sign-off gates, People, Teams).

The existing project (EOC/RunOps/NeuGAIN + Supabase) will be **left completely untouched**. All new work goes under a new namespace `src/silicon/` with a new mount point `/silicon/*` in `App.tsx`. No routes, sidebars, or auth flows outside that namespace change.

## Scope of this plan

Build 0A → 0F → 0G in one pass. Frontend-only, deterministic in-memory canonical repository. No new Supabase tables — 0G explicitly says data comes from a repository overlay driven by the scenario selector.

## Structure

```text
src/silicon/
  domain/
    types.ts              # entity type definitions (0A)
    ids.ts                # branded IDs
  data/
    canonical/            # seed data (0B)
      tenants.ts, portfolios.ts, programs.ts, ips.ts
      requirements.ts, specifications.ts
      modules.ts, interfaces.ts, registers.ts
      tests.ts, regressions.ts, coverage.ts
      formal.ts, static.ts, defects.ts
      aiAnalyses.ts, changes.ts, milestones.ts, signoffs.ts
      people.ts, teams.ts
    scenarios/            # 0C: 4 scenario overlays
      baselineGreen.ts, regression.ts, aiRootCause.ts, fixValidated.ts
      index.ts            # applyScenario(entity, scenarioId)
    personas.ts           # 0D: 4-5 personas incl. priya-nair
    repository.ts         # 0E: typed selectors, memoized
    index.ts              # public API
  state/
    SiliconStore.tsx      # 0G global state (Zustand or reducer)
    persistence.ts        # localStorage sync
    urlSync.ts            # deep-link query params
    resetDemo.ts
  components/             # 0G: 30+ reusable components
    KpiCard.tsx, KpiTrendCard.tsx, StatusBadge.tsx,
    ThresholdIndicator.tsx, EngineeringGauge.tsx,
    TraceabilityMatrix.tsx, DependencyGraph.tsx,
    LifecycleTimeline.tsx, RequirementCard.tsx,
    SpecificationSectionCard.tsx, ModuleHierarchyTree.tsx,
    InterfaceDiagram.tsx, RegisterMapTable.tsx,
    RegressionHeatmap.tsx, FailureClusterCard.tsx,
    CoverageProgressCard.tsx, CoverageSunburst.tsx,
    FormalPropertyTable.tsx, StaticFindingTable.tsx,
    WaveformPreview.tsx (lazy-loaded synthetic data),
    LogEvidencePanel.tsx, CodeDiffViewer.tsx,
    ChangeImpactGraph.tsx, SignoffGateCard.tsx,
    MilestoneTimeline.tsx, ComputeQueueChart.tsx,
    AIReasoningPanel.tsx, ConfidenceIndicator.tsx,
    EvidenceCitationList.tsx, HumanApprovalPanel.tsx,
    AuditTimeline.tsx, ScenarioTimelineControl.tsx,
    ScreenContextPanel.tsx,
    filters/FilterBar.tsx, filters/useFilters.ts
    index.ts              # barrel; no page-specific seeds inside
  shell/
    SiliconLayout.tsx     # top bar (scenario, persona, time, reset), sidebar shell
    ScenarioSelector.tsx
    PersonaSelector.tsx
    CommandPalette.tsx    # Ctrl/Cmd+K, arrow nav, Esc, Enter
    EntityDetailDrawer.tsx (7 tabs; supports 16 entity types)
    ResetDemoButton.tsx
  pages/
    FoundationStatus.tsx  # 0F + gallery, one example per component category
    NotFoundSilicon.tsx
  manifest.ts             # 0A–0G completion markers
  README.md
```

## Prompt 0A — domain types
Type definitions for all 16 entity kinds plus supporting shapes (Coverage bins, EvidenceCitation, Confidence, ApprovalDecision, ScenarioId, PersonaId, FilterKey, etc.). Branded IDs (`RequirementId`, `DefectId`, …) so palette results and drawer routing are type-safe.

## Prompt 0B — canonical data
One representative program (`tenant-panw-demo` → `portfolio-nsse` → `program-aegis-240` → `ip-ddmac-240`) with enough breadth to demonstrate every component:
- 12–20 requirements across categories, ≥6 specification sections, ≥8 RTL modules with a hierarchy, 4 interfaces, register map with RO/RW/W1C examples, ≥30 tests, 3 regression suites with pass/fail/abort mix, formal property list (proven/failed/inconclusive/vacuous), static findings, ~10 defects with lifecycle states, AI analyses linking evidence, changes, 6 milestones, 4 sign-off gates, ~12 people incl. `person-priya-nair`, 4 teams.
- Waveform bundle in a **separate file** (`waveformSamples.ts`) that is dynamically `import()`-ed only when `WaveformPreview` opens, labeled synthetic.

## Prompt 0C — scenario overlays
`baseline-green`, `t2-regression`, `t3-ai-rootcause`, `t4-fix-validated`. Each overlay is a pure function `(entity, scenarioId) => entity'` applied inside the repository selectors — pages never compute their own scenario math. Scenario selector on the top bar is the only mutation surface.

## Prompt 0D — personas
`priya-nair` (verification lead, default), `chip-architect`, `dv-engineer`, `program-manager`, `signoff-reviewer`. Persona affects default filter chips, emphasis flags on cards, contextual tooltips, and which approval actions are available — never the canonical data.

## Prompt 0E — repository
Single `useRepository()` hook returning memoized, scenario-aware selectors: `getRequirement(id)`, `listRegressions({filters})`, `getEntity(kind, id)`, `searchIndex()`, etc. Selectors memoize on `(scenarioId, filters, args)`. No page imports canonical files directly.

## Prompt 0F — Foundation Status page
Route `/silicon`. Shows manifest of prompts 0A–0G, and — per 0G item 14 — a restrained gallery rendering one example of every shared component category using canonical data. Not a business dashboard.

## Prompt 0G — deliverables (the actual ask)

**Global state** (Zustand): `selectedTenantId`, `selectedPortfolioId`, `selectedProgramId`, `selectedIpId`, `selectedScenarioId`, `selectedPersonaId`, `selectedTime`, `selectedEntity`, `activeFilters`, `navigationState`, `drawerState`, `reducedMotionPreference`. Defaults per spec (`tenant-panw-demo`, …, `2026-07-14T15:30:00Z`). Persisted to `localStorage` under `silicon:state:v1`. `resetDemo()` restores defaults without touching canonical data.

**Scenario + persona controls** — top-bar selectors bound to store; changing scenario re-derives all visible data via repository overlay.

**Entity drawer** — 7 tabs (Summary, Relationships, Telemetry, History, Evidence, AI analysis, Audit). Renders per-tab content dispatched by entity kind. Same ID from any surface opens the same record.

**Command palette** — Ctrl/Cmd+K. Local index over all entity kinds listed in item 5. Arrow keys + Enter. Result actions: open drawer or navigate to owning route inside `/silicon/*`.

**Filter framework** — `useFilters()` + `<FilterBar/>`. Filters synchronize all components on a page via context. Filter state also lives in URL query.

**Reusable components** — all 30+ from item 7, typed props only. Waveform preview lazy-loads synthetic data. AI reasoning panel structured per item 9 with no hidden CoT.

**Tooltips** — per item 10, meaningful help on coverage KPI, regression counts, formal states, register access classes, scenario freeze behavior.

**Deep links** — `?scenario=…&entity=<kind>:<id>&tab=…` reopens the exact same state.

**Keyboard** — Ctrl/Cmd+K, Esc, arrows, Enter, Tab, visible focus rings.

**Performance** — memoized selectors, virtualized tables (react-window on large lists), chart props stable so unrelated filter changes do not rerender.

## Out of scope for this pass
- Business pages beyond Foundation Status (explicit in item 1 of the prompt).
- Any Supabase schema changes.
- Any change to EOC, RunOps, CRM, NeuGAIN, or auth code.

## Verification
1. `/silicon` renders, gallery shows every component category with canonical data.
2. Changing scenario updates KPI/regression/formal cards on the gallery.
3. Ctrl+K opens palette; picking a requirement opens drawer at Summary; deep link `?entity=requirement:REQ-…&tab=evidence` reopens same tab.
4. `localStorage.clear()` + reload → defaults restored. `Reset Demo` → defaults restored, canonical data intact.
5. `tsgo` clean. Existing routes (`/`, `/app`, `/runops/*`, `/login`, etc.) unaffected.

## Delivery note
This is a large single-pass build (~40+ new files). I'll implement it in one message with parallel writes, keeping every file tight and typed. Nothing here touches the existing NeuGAIN/RunOps/auth code paths.
