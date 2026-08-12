# AWS COTS Digital Twin — Implementation Blueprint

## Scope
A modular feature area rendering a production Commercial Off-The-Shelf application hosted in one AWS Region (`us-east-1`) across two Availability Zones (`us-east-1a`, `us-east-1b`) for tenant "Meridian Enterprise", business service "Enterprise Resource Management", application "Atlas COTS Platform".

## Existing components to reuse
- Layout / shell: `src/runops/shell/RunOpsLayout.tsx`, `RunOpsSidebar.tsx`, `RunOpsTopBar.tsx`, `RunOpsRightDrawer.tsx`
- Providers: `src/runops/state/RunOpsProviders` (tenant, service, environment, region, mode)
- Design tokens: `src/runops/tokens.ts`, Tailwind + shadcn/ui (`src/components/ui/*`)
- Panels / cards / drawers: `src/runops/components/panels.tsx`, `dialogs.tsx`, `indicators.tsx`, `metrics.tsx`, `states.tsx`, `timeline.tsx`, `telemetry.tsx`, `graphs.tsx`
- Route registry: `src/runops/shell/routes.ts`
- Data fetching: `@tanstack/react-query` (already used across app)
- Supabase client: `src/integrations/supabase/client.ts`
- 3D engine (optional, already present): `@react-three/fiber`, `@react-three/drei` — used only if Prompt 3 explicitly needs it. Default 2D visualization approach.

## New components to create (later prompts)
- `pages/AwsCotsDigitalTwin.tsx` — page shell
- `features/aws-cots-twin/components/` — `ResourceInventory`, `ArchitectureCanvas`, `ResourceHoverCard`, `ResourceDetailsPanel`, `TelemetryPanel`, `AlertsPanel`, `DependenciesPanel`, `BlastRadiusPanel`, `ConfigDriftPanel`, `SecurityPosturePanel`, `CostPanel`, `RunbooksPanel`, `FailureSimulationPanel`, `SyntheticImpactPanel`, `EbsExpansionScenario`, `FiltersBar`
- `features/aws-cots-twin/repositories/` — typed repository interfaces + demo-data implementations
- `features/aws-cots-twin/adapters/aws/` — placeholder for future AWS SDK / adapter code (server-side only)
- `features/aws-cots-twin/types.ts` — resource, relationship, telemetry, alert, runbook, simulation types

## New data entities (Prompt 1)
`business_services`, `applications`, `aws_accounts`, `aws_regions`, `availability_zones`, `aws_resources`, `aws_resource_configurations`, `resource_relationships`, `telemetry_definitions`, `telemetry_observations`, `alerts`, `incidents`, `changes`, `runbooks`, `automation_actions`, `security_findings`, `compliance_findings`, `backup_status_records`, `cost_observations`, `simulation_scenarios`, `simulation_events`, `synthetic_impact_results`. Every entity tenant-scoped; RLS + GRANTs mandated when introduced.

## State management
- Global: existing `RunOpsProviders` (tenant, environment, region, mode)
- Server cache: React Query (query keys namespaced `["aws-cots", ...]`)
- Page-local: `useReducer` for selection, view mode, canvas viewport, simulation state
- URL state: `?resource=<id>&view=<view>&env=<env>` via `useSearchParams`

## Data loading
- Repositories return Promises; wired through React Query
- Demo mode: deterministic seeded data (no network)
- Live mode (future): repositories swap to Supabase / server-side AWS adapter — UI unchanged
- No component ever imports demo files directly; only through repository interfaces

## Simulation state
- Local reducer holds current scenario, step, applied deltas
- `SimulationEngine` service applies deltas to a cloned in-memory graph; original repository data is not mutated
- Reset restores base state

## Dependency graph
- Adjacency list in `resource_relationships`
- Traversal helpers: `getUpstream`, `getDownstream`, `getBlastRadius(depth)`
- Cycle-safe BFS with visited set
- Memoized selectors keyed by resource id

## Charting
- Reuse existing chart primitives / `recharts` if present in project; keep sparklines in hover cards SVG-only for performance

## Testing
- Unit: repositories deterministic; traversal helpers; simulation deltas — `vitest`
- Component: hover card + details panel snapshot / role-based tests
- Regression: existing `src/test/*` suite must still pass

## Performance risks
- Canvas rendering many nodes — mitigate with memoization, level-of-detail, cluster labels
- Telemetry re-renders — separate subscriptions per resource; short polling in demo mode only

## Security risks
- Never expose AWS credentials, secrets, tokens in client bundle
- All privileged AWS calls must be server-side (edge function) with least-privilege IAM
- Raw JSON tab must sanitize secret fields
- Tenant isolation enforced at repository + RLS layer

## Integration assumptions
- Future AWS integration flows through server-side adapters (Supabase edge function or backend service)
- No direct browser → AWS SDK calls with privileged credentials
- Adapters normalize AWS payloads into the repository types defined in Prompt 1
