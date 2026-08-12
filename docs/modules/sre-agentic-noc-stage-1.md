# SRE Based Agentic NOC — Stage 1 Completion Record

Module: **Global Optical Operations Center**
Operating model: **SRE Based Agentic NOC**
Supporting statement: **Observe. Understand. Predict. Act. Learn.**

## Route

- `/operations/sre-agentic-noc/global-optical-operations` (primary)
- `/operations/sre-agentic-noc` (alias to the overview)
- 15 additional navigation destinations registered as Stage 1 placeholders

Routes are registered in `src/App.tsx` inside the `SreAgenticNocLayout` shell so the
left navigation stays visible on every destination.

## Files delivered

| Path | Purpose |
| --- | --- |
| `src/types/agenticOpticalOperations.ts` | Typed operational domain model |
| `src/data/agenticOpticalNetworkData.ts` | Deterministic sample data (8 terminals, 10 links, 2 situations, 4 hypotheses, 4 risks, 4 actions, SLOs, capacity series, changes, learnings, events) |
| `src/components/operations/AgenticGlobalOpticalMap.tsx` | Global Reliability Digital Twin (d3-geo + world-atlas, local geography only) |
| `src/components/operations/AgenticMapLayerControls.tsx` | Eight independent overlay toggles |
| `src/pages/operations/sre-agentic-noc/SreAgenticNocLayout.tsx` | Module shell, 16 item navigation, platform and agent status footer |
| `src/pages/operations/sre-agentic-noc/SreAgenticOpticalOperationsCenter.tsx` | Stage 1 dashboard |
| `src/pages/operations/sre-agentic-noc/panels.tsx` | Eleven read only operational panels |
| `src/pages/operations/sre-agentic-noc/SreAgenticNocPlaceholder.tsx` | Stage 1 placeholder for later sections |
| `src/pages/operations/sre-agentic-noc/__tests__/SreAgenticOpticalOperationsCenter.test.tsx` | Stage 1 test suite |

## Layout

- Metric strip: six cards (reliability compliance, customer and user impact, active
  situations, automated resolutions, predicted risk reduction, operational efficiency)
- Row 1: Global Reliability Digital Twin (6), Active Situation Room (3), Agentic
  Investigation Workspace (3)
- Row 2: Predictive Link Risk Center, Human Approval and Action Center, SLO and Error
  Budgets, Service Reliability Summary (3 each)
- Row 3: Optical Network Health (4), Capacity and Traffic Intelligence (4), Change
  Intelligence (2), Learning and Improvement (2)
- Row 4: AI Native Operational Event Stream (12)

The Executive View reorders and re-emphasises the same panels (reliability and value
first, tactical investigation later); the SRE View is the default.

## Map

- Geography from the locally installed `world-atlas/countries-110m.json`
- `geoNaturalEarth1().fitExtent([[18,18],[1182,522]])` inside a `0 0 1200 540` view box
- Routes drawn as `geoInterpolate` great circles with 64 segments
- Invalid coordinates are rejected by `projectTerminal` before rendering
- Restrained animation only for critical terminal pulse, recovery route flow and
  automation orbit, all disabled under `prefers-reduced-motion: reduce`

## Filters

Twelve filters (time range, region, country, customer, service, terminal, link,
situation status, network status, risk level, agent activity, validation state) drive
the metric strip, map, situation, risk, approval, SLO, service, network health, change
and event panels. Non-default values are persisted in URL query parameters.

## Verification

| Check | Result |
| --- | --- |
| TypeScript typecheck (`tsgo -p tsconfig.app.json`) | Pass, no errors |
| Stage 1 tests (`vitest run src/pages/operations/sre-agentic-noc`) | 13 / 13 pass |
| Route registration | Verified in the running preview |
| White background and light shell | Verified visually |
| Map geography | 177 country paths rendered |
| Curved route paths | 10 great circle routes rendered |
| Map filtering and layer toggles | Covered by tests |
| Panel content | Realistic authored fixtures in every panel |
| Remote map requests | None; only the pre-existing application font request |
| Console errors | None from this module |
| Horizontal page scrolling | None at 1280 px |

`resolveJsonModule` is enabled in `tsconfig.app.json`; `d3-geo`, `topojson-client`,
`world-atlas` and their type packages were already installed.

## Deferred to Stage 2

Action approvals, demo scenario workflows and autonomous execution.
