# Demo Scenario Controller — Plan

Add a scenario-driven operating layer on top of the existing Enterprise Cloud Application Digital Twin page. Existing functionality stays. A new central scenario store becomes the source of truth that every section of the page reads from.

## What the user will see

- A small glass card pinned upper-right near the top command bar showing: "Demo Mode", current scenario name, status dot, and "Step X of N".
- Clicking it opens a right-aligned drawer (~480px wide) with: Scenario Library (9 cards), Current Scenario Summary, Impacted Layers, Talking Points, Playback Controls, Impact Summary, and a Before/After comparison.
- Selecting a scenario smoothly re-skins the entire page: top KPI strip, business / transaction / app service / AWS cards, dependency highlight path, right detail panel, NOVA Copilot text, operational timeline events, and active view.
- Hero scenario (Payment Latency Incident) is fully wired with 9 playback steps. Other scenarios apply curated overrides at a lighter fidelity.

## Files to add

```text
src/data/demoScenarios.ts            -- 9 scenarios + types + helpers
src/context/ScenarioStateContext.tsx -- provider, reducer, useScenarioState hook
src/components/scenario/DemoScenarioController.tsx
src/components/scenario/ScenarioDrawer.tsx
src/components/scenario/ScenarioCard.tsx
src/components/scenario/ScenarioPlaybackControls.tsx
src/components/scenario/ScenarioImpactSummary.tsx
src/components/scenario/ScenarioStepTimeline.tsx
src/components/scenario/BeforeAfterPanel.tsx
```

## Files to edit (surgical, no behavior removed)

- `src/App.tsx` — wrap the `/enterprise-cloud-twin` route in `ScenarioStateProvider`.
- `src/pages/prod-twin/EnterpriseCloudTwin.tsx` — replace local hard-coded constants (`GLOBAL_KPIS`, `BUSINESS_SERVICES`, `TRANSACTIONS`, `APP_SERVICES`, `AWS_GROUPS`, `HIGHLIGHT_PATH`, NOVA copy, timeline events) with values derived from `useScenarioState()` overlaid on the existing baseline. Mount `<DemoScenarioController />` in the top command bar.

## Scenario data model

```ts
type ScenarioStatus = "healthy" | "warning" | "critical" | "simulation" | "resolved";

interface Scenario {
  id: string;
  name: string;
  status: ScenarioStatus;
  severity: "none" | "low" | "medium" | "high" | "critical";
  demoPurpose: string;
  primaryView: ViewId;            // reuses existing ViewId
  recommendedLens: string;
  primaryImpactedService: string | null;
  estimatedDuration: string;      // "7 minutes"
  talkingPoints: string[];
  activeSelection: string | null; // node id to auto-select
  globalMetricOverrides: Partial<Record<KpiId, { value: string; tone: Health }>>;
  businessServiceOverrides: Record<string, Partial<BusinessService>>;
  transactionOverrides: Record<string, Partial<Transaction>>;
  applicationServiceOverrides: Record<string, Partial<AppService>>;
  awsResourceOverrides: Record<string /*groupId*/, {
    worst?: Health;
    resources?: Record<string, Partial<AwsResource>>;
  }>;
  securityOverrides?: { findings: number; notes: string[] };
  finOpsOverrides?: { spend: string; variance: string; notes: string[] };
  reliabilityOverrides?: { sloBurn: string; errorBudget: string };
  highlightedDependencyPath: string[];     // ordered node ids
  criticalEdges: Array<[string, string]>;  // rose-colored edges
  warningEdges: Array<[string, string]>;   // amber-colored edges
  timelineEvents: Array<{ t: string; label: string; tone: Health; affects: string[]; evidence?: string }>;
  novaResponse: {
    summary: string;
    evidence: string[];
    rootCause: string;
    blastRadius: string[];
    recommended: { title: string; confidence: number; risk: "Low"|"Medium"|"High"; approval: "Required"|"Auto" };
    secondary?: string;
    nextBestAction: string;
  };
  recommendedActions: Array<{ title: string; confidence: number; risk: "Low"|"Medium"|"High" }>;
  playbackSteps: Array<{
    label: string;
    focusIds: string[];     // nodes to focus
    selectId?: string;      // right panel selection
    openNova?: boolean;
    view?: ViewId;
    timelineCursor?: string;
  }>;
  beforeAndAfterMetrics?: Array<{ label: string; before: string; after: string; toneBefore: Health; toneAfter: Health }>;
  impactSummary?: Array<{ label: string; value: string }>;
  availableReports: string[];
  acceptanceChecks: string[];
}
```

All 9 scenarios are seeded. Normal Operations and Payment Latency Incident are fully populated per spec; the other 7 carry curated overrides for the primary impacted service / AWS group, NOVA copy, timeline events, and 3-5 playback steps.

## State management

`ScenarioStateContext` exposes:

```ts
const {
  scenarios,                  // Scenario[]
  activeScenario,             // Scenario
  stepIndex,                  // number
  playback,                   // "idle" | "playing" | "paused"
  setActiveScenario(id),
  setStepIndex(n),
  next(), prev(), play(), pause(), reset(),
  jumpTo("impact"|"rootCause"|"recommendation"|"approval"|"normal"),
  selectedId, setSelectedId,
  derived: {                  // memoized merge of baseline + overrides + current step
    globalKpis, businessServices, transactions, appServices, awsGroups,
    highlightedNodes, criticalEdges, warningEdges, novaResponse, timelineEvents,
    activeView,
  }
} = useScenarioState();
```

A `derive(baseline, scenario, stepIndex)` pure function merges the static baseline (current hard-coded data, moved into `data/demoScenarios.ts` as `BASELINE`) with the active scenario's overrides and the current playback step's focus. The page renders entirely from `derived.*`.

## Page wiring

In `EnterpriseCloudTwin.tsx`:

- Replace `BUSINESS_SERVICES`, `TRANSACTIONS`, `APP_SERVICES`, `AWS_GROUPS`, `GLOBAL_KPIS` reads with `derived` values.
- Replace the static `HIGHLIGHT_PATH` and `CRIT_EDGES` sets with `derived.highlightedNodes` and `derived.criticalEdges` / `derived.warningEdges`.
- Replace the static NOVA recommendation block in the right panel with `derived.novaResponse` (typed reveal animation on scenario change).
- Replace the static `Timeline` events with `derived.timelineEvents`; clicking an event calls `setSelectedId(event.affects[0])` and advances `stepIndex` to the matching step.
- `view` state becomes `activeScenario.primaryView` on selection (user can still override).
- Mount `<DemoScenarioController />` inside the top command bar, right side.

Existing components (`DigitalTwinCanvas`, `RightPanel`, `NovaCopilot`, `RCAPreview`, `Timeline`, sub-views) keep their props; we only change what data flows in.

## DemoScenarioController visual

Collapsed (floating, top-right of command bar):

```text
┌────────────────────────────────────────┐
│ ● Demo Mode      Step 4 / 9     ▸     │
│   Payment Latency Incident  Critical   │
└────────────────────────────────────────┘
```

Glass card: `bg-white/85 backdrop-blur border-slate-200/70 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] rounded-xl`. Status dot color from scenario.status. Hover lifts -1px.

## ScenarioDrawer

Uses existing shadcn `Sheet` (`side="right"`, `w-[480px]`). Sections, top to bottom:

1. Header: scenario name, status pill, duration, "Apply Scenario" + "Reset" buttons.
2. Tabs: `Library | Current | Playback | Impact`.
   - **Library**: vertical list of `ScenarioCard`s with status accent (rose/amber/blue/violet/emerald soft tints, 1px border, active card gets `ring-2 ring-sky-300/60 bg-sky-50/60`).
   - **Current**: demoPurpose, recommendedLens, primaryImpactedService, impacted layers chips, talking points (bullet list), NOVA recommended action card.
   - **Playback**: `ScenarioPlaybackControls` (Start, Pause, Prev, Next, Reset, Jump-to chips) + `ScenarioStepTimeline` (vertical numbered steps with current step highlighted, click to jump).
   - **Impact**: `ScenarioImpactSummary` grid + `BeforeAfterPanel` side-by-side comparison.

Soft motion via Tailwind utilities (`animate-fade-in`, `transition-all duration-300`).

## Canvas / NOVA / timeline behavior

- Highlighted nodes raise via `-translate-y-1 shadow-lg ring-2`; unrelated nodes drop to `opacity-30`.
- Critical edges render rose with flowing dash particles (already in place); warning edges render amber.
- On scenario change, KPI numbers animate via CSS transition on color + `animate-fade-in` on the value text.
- NOVA copy in the right panel renders with a brief reveal (`animate-fade-in` per line, staggered).
- Timeline events render from `derived.timelineEvents`; the current playback step's cursor marker is visually emphasized.

## Hero scenario fully wired

Payment Latency Incident receives the full spec: all KPI overrides, full Payment Services / Process Payment / Payment Service / Aurora / SQS state, dependency path `bs-pay → tx-pay → svc-pay → g-data → g-event → svc-noti → bs-om`, NOVA response verbatim from Section 7, all 12 timeline events, all 9 playback steps, before/after table from Section 11, impact summary from Section 10.

Normal Operations receives the full reset spec from Section 12 (no highlighted path, no critical pulses, NOVA "all healthy" copy).

## Constraints honored

- Light theme only, white/near-white, glass cards, soft borders and shadows.
- No dark backgrounds, no neon, no cyberpunk, no flashing.
- Mock data only, no external integrations; data model is extensible for future telemetry / ServiceNow / AWS wiring.
- No existing functionality removed; the controller is additive and the page reads from a derived view of baseline + scenario.
