## Goal

Create a new route/page **Enterprise Cloud Application Digital Twin** and add a sidebar link directly below **Signal Intelligence**. The page is a light, premium, transactional SRE command center for a mock Enterprise Commerce Platform on AWS, with an organic 3D-feeling digital twin canvas and full operating context (APM, Infra, Security, FinOps, Reliability, Incidents, Changes, Simulation, NOVA copilot).

## Navigation changes

- `src/components/eoc/Sidebar.tsx` — insert a new nav item `{ label: "Enterprise Cloud Application Digital Twin", to: "/enterprise-cloud-twin" }` immediately after the existing **Signal Intelligence** entry.
- `src/App.tsx` — import the new page and register `<Route path="/enterprise-cloud-twin" element={<EnterpriseCloudTwin />} />`.

## New files

```
src/pages/prod-twin/EnterpriseCloudTwin.tsx          # page shell + state
src/pages/prod-twin/enterprise-cloud-twin/
  components/
    TopCommandBar.tsx
    LeftSubNav.tsx                # in-page view switcher (Digital Twin / APM / Infra / Security / FinOps / Reliability / Incidents / Changes / Simulation)
    DigitalTwinCanvas.tsx         # main organic twin (SVG + CSS 3D + framer-motion; no R3F dependency)
    BusinessServiceLayer.tsx
    TransactionFlowLayer.tsx
    ApplicationServiceLayer.tsx
    AwsResourceLayer.tsx
    DependencyPaths.tsx           # animated curved paths shown on hover/select
    RightDetailPanel.tsx          # golden signals, SLO, traces, logs, infra, security, finops, resilience, ownership, actions
    OperationalTimeline.tsx       # 24h timeline w/ filters + playback
    NovaCopilot.tsx               # persistent SRE copilot dock
    APMView.tsx
    InfrastructureView.tsx
    SecurityView.tsx
    FinOpsView.tsx
    ReliabilityView.tsx
    IncidentCommandView.tsx
    ChangeImpactView.tsx
    SimulationView.tsx
    RCAPreview.tsx
    primitives/                   # MetricCard, SLOCard, TelemetryChart, TraceWaterfall, ResourceNode, ActionCard, StatusBadge, RiskScore, OwnerCard
  data/
    businessServices.ts
    transactions.ts
    applicationServices.ts
    awsResources.ts
    incidents.ts
    changes.ts
    securityFindings.ts
    costAnomalies.ts
    recommendations.ts
    timelineEvents.ts
    traces.ts
    logs.ts
    metrics.ts
  state/useTwinState.ts           # selected object, view, env, region, time window, filters, investigation path, sim, NOVA, playback
```

## Visual system

- Background: warm white `#F8FAFC` base with very soft radial gradients in blue/lavender/mint (CSS only, no images).
- Cards: white/near-white glass — `bg-white/80 backdrop-blur border border-slate-200/70 rounded-2xl shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]`.
- Status palette (Tailwind semantic): healthy emerald-500, warning amber-500, critical rose-500, info sky-500, automation violet-500, security indigo-500, cost teal-500, unknown slate-400 — all muted, not neon.
- Typography: existing project font stack, small uppercase tracked metadata labels, large numeric KPIs.
- No black backgrounds, no dark-mode panels, no neon.

## Digital twin canvas (organic, no new heavy deps)

- Implementation: SVG layer for curved dependency paths + absolutely-positioned glass nodes with `transform: translate3d / perspective(1200px) rotateX()` and `framer-motion` springs (already in project).
- Four stacked floating layers with subtle parallax z-depth:
  1. Business Services (top, large cards, gentle breathing scale animation)
  2. Transaction lanes (horizontal organic flows; animated particles via SVG `<animateMotion>` on selected lanes)
  3. Application Services (mid nodes, halos by status)
  4. AWS Resource clusters (grouped: Edge, API, Compute, Data, Eventing, Network, Security, Observability, Cost)
- Dependency lines hidden by default; appear on hover/select/search/investigation with bezier curves; thickness = traffic, color = health, moving dots = active traffic; unrelated nodes fade to ~25% opacity.
- Camera behavior simulated via container transforms (default → focus → deep zoom → reset) with eased transitions.

## Page layout

```text
┌──────────────────────────── TopCommandBar ────────────────────────────┐
│ Title • Env • Region • App • View • Search • 10 global KPI chips      │
├──────────┬──────────────────────────────────────┬─────────────────────┤
│ Left     │                                      │ RightDetailPanel    │
│ SubNav   │       DigitalTwinCanvas              │ (sticky summary +   │
│ (views)  │       (or active view component)     │  scrollable sections)│
├──────────┴──────────────────────────────────────┴─────────────────────┤
│                     OperationalTimeline (24h, filters, playback)      │
└───────────────────────────────────────────────────────────────────────┘
                         NovaCopilot dock (bottom-right, expandable)
```

Uses existing `AppShell` so the global left sidebar stays consistent. Canvas region is the centerpiece; right panel is ~380px; timeline ~140px; optimized for 16:9 with responsive collapsing (right panel → drawer, timeline → collapsible) below `lg`.

## Active scenario on load

State is pre-seeded with the Payment Services incident:
- Payment Services = Critical, Process Payment lane = Critical (soft red pulse), Aurora PostgreSQL saturation, SQS backlog, Order Service + Notification Service warning.
- Highlighted dependency path: Payment Services → Payment Service → Aurora → SQS → Notification with animated flow.
- Timeline shows deploy v2.14.7 marker, latency anomaly, Aurora CPU alert, SLO burn, SQS backlog, autoscale event, incident open, NOVA recommendation, emergency change pending.
- NOVA panel pre-populated with the rollback recommendation (87% confidence, medium risk, human approval).

## Interactivity

- All objects (business service, transaction, app service, AWS resource, incident, change, security finding, cost anomaly, SLO, alert, recommendation, runbook, owner, timeline event) support hover (elevate + tooltip + neighbor highlight), click (open right panel with full context), double-click (deep investigation mode with breadcrumb `Payment Services › Process Payment › Payment Service › Aurora › SQS › Notification`).
- Global KPI chips and left sub-nav filter the canvas + overlays + right panel + timeline.
- Simulated real-time: a `useEffect` interval gently nudges selected metrics (±2–5%) with animated counters; active scenario remains stable.

## Views

Switching the view selector swaps the canvas region (timeline + right panel remain). Each view is its own component using shared primitives and mock data, rendered as light glass cards:
- **APM** — service map, trace waterfall (CloudFront → API GW → Payment Service → Aurora → KMS → SQS → Notification), latency/error distributions, endpoint table with P50/P95/P99/Apdex/cost.
- **Infrastructure** — Account → Region → AZ → VPC topology, resource cards, utilization heatmaps.
- **Security** — posture map, findings list with blast radius, KPI strip.
- **FinOps** — monthly/forecast/variance, cost by service/business service/transaction, unit economics, recommendations.
- **Reliability** — SLI/SLO cards, error budgets, burn rate, MTTD/MTTR, change failure rate.
- **Incident Command** — transforms layout into incident workspace with tabs (Overview, Impact, Timeline, Traces, Logs, Metrics, Changes, Dependencies, Runbook, Comms, RCA) and action buttons.
- **Change Impact** — recent changes table with before/after deltas, correlation confidence.
- **Simulation** — scenario picker; running a scenario propagates a soft animated impact wave through the twin and shows estimated downtime/cost/RTO/RPO.

## NOVA copilot

Persistent collapsible dock with prompt input, suggested prompts, and a structured response card (Summary, Evidence, Probable Root Cause, Blast Radius, Recommended Actions, Risk, Confidence, Next Best Action). Action buttons: Create Incident/Change/Ticket, Run Diagnostic, Run Simulation, Approve Automation, Execute Runbook, Rollback Deployment, Scale Resource, Generate RCA/Exec Summary/SRE/FinOps/Security Report, Export Evidence. Pre-seeded with the Payment Services analysis; other prompts produce deterministic mock responses from a lookup map.

## Reporting actions

Global action menu in TopCommandBar + per-object Recommended Actions in the right panel. Each action opens a confirmation sheet (Owner, Risk, Expected Impact, Approval, Rollback, Execution Status). **Generate RCA** opens `RCAPreview` populated from the active Payment Services incident with all required sections.

## Data model

All mock data files export typed objects matching the Section 25 schema (business services, app services, AWS resources, transactions, incidents, recommendations) so that real AWS/observability/ServiceNow/FinOps APIs can be wired in later by swapping the data module.

## Acceptance check before finishing

- Light theme throughout, no black/dark panels.
- Sidebar shows the new link directly below Signal Intelligence and route renders.
- On load, the Payment Services incident is visible with highlighted dependency path, NOVA recommendation, and timeline markers.
- Hover/click/double-click flows update canvas, right panel, NOVA, and timeline.
- All 9 view modes render without errors; simulation wave animates; RCA preview opens.
- Layout holds at 16:9 and degrades gracefully below `lg`.

## Out of scope

- No real AWS/observability/ServiceNow integrations (mock data only, swap-ready).
- No new heavy 3D libraries — organic depth done with SVG + CSS 3D + framer-motion already present.
- No changes to other pages or the global sidebar layering behavior.