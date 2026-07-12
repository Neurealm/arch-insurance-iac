
# Meridian Digital Twin — Architectural Specification

Read-only design. No implementation. All references below map to the existing frontend stack (React 18 / R3F 8.18 / drei 9.122 / three 0.160 / Zustand 5 / TanStack Query 5 / Tailwind + shadcn) and the confirmed backend (Supabase, `runops_*` tables, tenant-scoped RLS).

---

## 1. 3D Camera

- **Type:** Single `PerspectiveCamera` (fov 45°, near 0.1, far 5000) driven by drei `CameraControls` (not `OrbitControls` — needed for smooth `moveTo` / `fitToBox` transitions).
- **Modes:**
  - `Overview` — orthographic-feeling top-down tilt (pitch ≈ 60°), frames the entire Meridian estate.
  - `Service` — orbits a business-service cluster; pitch ≈ 45°.
  - `Component` — close orbit around a single CI; pitch 20–35°.
  - `Presentation` — cinematic dolly along a scripted spline (see §13).
- **Transitions:** all camera moves are `cameraControls.fitToBox(target, true, { paddingTop: 0.2, ... })` with 600 ms ease-out; interrupted by any user input.
- **Constraints:** minDistance 4, maxDistance 800, polar clamp [10°, 85°], azimuth free. Damping 0.08.
- **Determinism:** camera pose (position, target, zoom) is a serialisable `CameraPose` struct persisted in URL query (`?pose=…`) so deep-links and presentation cues restore the exact frame.

## 2. Node System

- **Node domain model** (frontend only, sourced from `runops_components` + `runops_services`):
  ```
  TwinNode {
    id, tenantId, kind ('service'|'component'|'group'|'tier'),
    ciClass (Subscription|RG|VNet|AKS|AppService|Function|Storage|Cosmos|KeyVault|PrivateLink|ExpressRoute|EpicModule|...),
    parentId, layerKey, position (Vec3 | null → auto-layout),
    healthState, changeState, incidentState,
    metrics: { latencyP95, errorRate, saturation, budgetBurn },
    tags, ownerTeamId
  }
  ```
- **Render primitives:** each `ciClass` maps to a **glyph** (instanced mesh) — cube, prism, disc, ring, torus — never a bespoke model. All glyphs share one `InstancedMesh` per class for O(1) draw calls.
- **Labels:** drei `<Html occlude="blending">` at zoom ≥ Service; hidden at Overview.
- **State channels** (independent, composable, each a shader uniform on the glyph):
  1. `healthState` → base emissive hue (green/amber/red/grey-unknown)
  2. `changeState` → outline pulse (blue = change window active)
  3. `incidentState` → red bloom halo when tied to open incident
  4. `selection` → white rim-light
- **Identity:** every node is picked via GPU picking (`raycaster` on instance IDs). No per-node React components in the scene graph.

## 3. Layer System

Layers are **toggleable semantic slices** rendered as sibling groups under one root `<group name="twin-root">`. Each layer has its own visibility flag, opacity, and z-offset so layers can be stacked or exploded vertically.

| Layer | Source | Default |
|---|---|---|
| `L0-Ground` | static grid + tenant label | on |
| `L1-Cloud` | Azure subscriptions / RGs from `runops_components.kind='cloud'` | on |
| `L2-Network` | VNets, subnets, PrivateLink, ExpressRoute | on |
| `L3-Compute` | AKS, App Service, Function, VM | on |
| `L4-Data` | Cosmos, SQL, Storage, KeyVault | on |
| `L5-BusinessServices` | `runops_services` overlay (see §4) | on |
| `L6-Traffic` | live edges from telemetry (animated) | off |
| `L7-Incidents` | red halos + blast-radius volume | on when incident open |
| `L8-Change` | change-window prisms | off |
| `L9-SLO` | error-budget columns (height = burn rate) | off |

Layer state lives in a **Zustand store** (`useTwinStore`) — never React context — because glyph shaders read it every frame.

## 4. Business Service Overlay

- Business services (`runops_services`) render as **translucent convex hulls** enclosing their member components. Hulls are computed with a Quickhull pass on the union of member positions + padding.
- Hull colour = service `healthState`; hull opacity = 0.12 idle, 0.28 hovered, 0.4 selected.
- Each hull carries a floating `ServiceCartouche` (drei `<Billboard>` + `<Html>`) with: service name, owner team badge, SLO burn, active incident chip.
- Multiple overlapping services (a component belongs to N services) are rendered as **stacked ribbons** on the top face of the hull rather than nested hulls — avoids z-fighting.
- Overlay is a pure derivation of `runops_service_owners` + component membership; no new tables required.

## 5. Relationship Rendering

- **Source:** `runops_dependencies` (directed edges) + a derived `runops_component_edges`-style projection computed client-side from `metadata.links`.
- **Edge classes:**
  - `depends_on` — solid cyan tube, arrowhead at target
  - `traffic` — animated dashed shader (flow direction, thickness = RPS bucket)
  - `data_flow` — magenta dashed
  - `identity` — grey dotted (KeyVault / managed identity)
  - `change_impact` — orange, only visible in `L8-Change`
- **Geometry:** cubic Bezier tubes with control points offset perpendicular to the parent layer plane; batched into one `MeshLine`-style buffer per edge class (single draw call per class).
- **Culling:** edges are hidden when either endpoint is outside the frustum OR the current LOD is Overview (replaced with an aggregate arc between parent groups).
- **Directionality:** arrowhead is a separate instanced cone; opacity fades with distance.

## 6. Semantic Zoom

Zoom levels are **discrete LODs**, not continuous, chosen from camera distance to nearest node:

| LOD | Distance | Shows | Hides |
|---|---|---|---|
| `Estate` | > 300 | subscription + business-service hulls, aggregate arcs | components, edges, labels |
| `Domain` | 120–300 | RGs, tiers, service cartouches | individual CIs, traffic edges |
| `Service` | 40–120 | components, `depends_on` edges, health colour | traffic shader animation |
| `Component` | 10–40 | full detail, traffic + data_flow, metric sparklines on Html tags | — |
| `Inspector` | < 10 | opens Context Panel (§9) automatically; camera locked to node | other layers dimmed to 0.15 |

LOD transitions cross-fade over 250 ms via a shared `uLodBlend` uniform to avoid pop-in.

## 7. Clustering

- At `Estate` and `Domain` LODs, nodes collapse into **super-nodes** by `parentId → tier → ciClass`. Super-node label shows count + worst child health.
- Clustering algorithm: deterministic hierarchical roll-up (no k-means / force). Order: `subscription → resourceGroup → tier → ciClass`. This mirrors the Azure hierarchy so the twin is legible without physics.
- Super-nodes explode on click via animated child-position tween from super-node origin to their real positions (400 ms stagger).
- Force layout is **not used** for cluster placement — positions come from a stable, seeded grid layout keyed by `parentId` so the twin looks identical on every load (critical for demos).

## 8. Selection

- **Selection model:** `useTwinStore.selection = { primary: NodeId|null, secondary: NodeId[], hover: NodeId|null }`. Multi-select via shift-click; lasso via drag on empty space (2D screen-space rectangle → GPU pick).
- **Focus-and-context:** on selection, non-related nodes drop to `opacity 0.15`, related edges highlight, camera `fitToBox` on the selection + its 1-hop neighbourhood.
- **Keyboard:** ↑/↓/←/→ walks the dependency graph; `Esc` clears; `F` frames selection; `.` cycles LOD.
- **URL binding:** `?select=<nodeId>&hop=1` — deep-linkable, presentation-safe.

## 9. Context Panel

- Right-hand shadcn `Sheet` (drawer), width 420 px desktop / full-width mobile, driven by existing `RightDrawerProvider` in `RunOpsLayout` — reused, not duplicated.
- **Tabs:** `Overview`, `Health`, `Dependencies`, `Runbooks`, `Incidents`, `Changes`, `Evidence`.
- Data via TanStack Query keys `['twin','node',nodeId]`, `['twin','node',nodeId,'runbooks']`, etc. All queries tenant-scoped through the existing Supabase client + RLS — no new endpoints required for MVP.
- Actions surface (only when `runops_can_write`): "Attach runbook", "Open incident", "Simulate failure" (calls existing scenario store).
- Panel never blocks the canvas — canvas re-fits to the visible viewport (canvas width = viewport − panel width) so selection stays framed.

## 10. Performance Strategy

- **Draw calls:** one `InstancedMesh` per `ciClass`, one `LineSegments`/tube batch per edge class, one hull mesh per business service. Target ≤ 60 draw calls for a 5k-node estate.
- **Frustum + distance culling** on instances via a compute pass in the animation loop (CPU-side; GPU instancing hides invisible instances by setting matrix to zero-scale).
- **LOD gating** (see §6) — traffic shaders, Html labels, and edge arrowheads are the expensive items and are only enabled at `Service`+.
- **On-demand rendering:** `frameloop="demand"` on the R3F `<Canvas>`. Frames are only requested on state change, camera move, or animation tick. Idle = 0 fps.
- **Data pagination:** components fetched per subscription/RG on demand; the twin never queries the full estate in one call. Cache in TanStack Query with `staleTime: 60s`.
- **Web worker** for hull computation and layout roll-ups (Quickhull + hierarchical grid) — keeps main thread free.
- **Texture atlas** for glyph icons; no per-node textures.
- **Budget:** first paint < 1.5 s for 500 visible nodes; interaction < 16 ms/frame at Service LOD on M1-class hardware.
- **Memory:** dispose geometries + materials on tenant switch (hook into existing `useTenantRouteEqualizer`).

## 11. Accessibility

- The 3D canvas is decorative-primary; every state visible in 3D is also present in the **2D fallback** (§12) which is the a11y source of truth.
- Canvas element gets `role="application"` + `aria-label="Meridian digital twin (interactive 3D). Press T to switch to accessible list view."` and `aria-describedby` pointing to a live region.
- **Keyboard-first:** all selection, navigation, LOD, and layer toggles have shortcuts (documented in a `?` overlay). No interaction is mouse-only.
- **Live region** (`aria-live="polite"`) announces selection changes: "Selected AKS cluster meridian-prod-aks. Health: degraded. 2 open incidents."
- **Colour:** health states use hue + shape + label prefix (`● GREEN`, `▲ AMBER`, `■ RED`) — never colour alone. All tokens sourced from `index.css` semantic tokens; no hardcoded hex in glyph shaders (uniforms pull from CSS custom properties via a small bridge).
- **Reduced motion:** `prefers-reduced-motion` disables camera easing, edge flow animation, and LOD cross-fade; snaps instead.
- **Focus ring:** visible 2 px outline on the canvas when keyboard-focused.
- WCAG 2.2 AA target for panel + fallback; 3D canvas exempted under WCAG "canvas content is provided in accessible alternative form".

## 12. 2D Fallback

- Toggle in top bar (`View: 3D | 2D | Split`). Persisted per-user.
- 2D view is a **ReactFlow** graph (already in dependencies) driven by the same `useTwinStore` selectors — one source of truth.
- Layout: dagre hierarchical (subscription → RG → tier → CI), collapsible group nodes matching §7 clustering.
- Business services rendered as ReactFlow group nodes with the same cartouche.
- Edges use the same class taxonomy (§5).
- 2D is the **default** on:
  - `prefers-reduced-motion` users
  - devices without WebGL2 (feature-detect on mount)
  - viewport < 768 px
  - screen reader detected (heuristic: focus-visible + no pointer events for 5 s after mount → suggest 2D)

## 13. Presentation Mode

- Entered via `P` or top-bar "Present" button. Full-viewport, chrome hidden, sidebar collapsed.
- **Scene script:** ordered list of `TwinCue` items, stored in `runops_services.metadata.presentation.cues` (no new table). Each cue:
  ```
  TwinCue {
    id, label, cameraPose, layerState, selection,
    narration (markdown), dwellMs, transitionMs
  }
  ```
- **Playback:** `←/→` steps, `Space` play/pause, `Esc` exits. A thin progress rail shows cue index / total.
- **Narration** renders as a bottom-centre teleprompter card (shadcn `Card`, semi-transparent). Optional TTS via Lovable AI Gateway (not required for MVP).
- **Determinism:** cues capture the full `TwinViewState` (camera + layers + selection + LOD); replay is pixel-stable regardless of tenant data changes (data is snapshotted per cue when authored).
- **Guardrails:** presentation mode forces `demoMode: true`, disables mutation actions in the context panel, and pins the tenant — safe for customer demos.
- **Recording:** an "Export" action serialises the cue list to JSON for check-in with the tenant profile; no video export in MVP.

---

## Cross-Cutting Contracts

- **State ownership:** Zustand (`useTwinStore`) owns view state (camera, layers, selection, LOD, mode). TanStack Query owns server state. React context owns nothing in the twin.
- **Data source:** reuses `runops_services`, `runops_components`, `runops_dependencies`, `runops_service_owners` verbatim (per prior Backend Reuse Matrix — Reuse / Extend-data-only). No schema changes required to ship MVP.
- **Routing:** single lazy route (per approved frontend plan) — e.g. `/runops/twin` with sub-selectors as query params, so deep-links do not multiply routes.
- **Feature flag:** gated behind `featureFlags.meridianTwin` in `src/runops/domain/featureFlags.ts` (extension, not new module).
- **Tenant isolation:** all queries go through the tenant-scoped Supabase client; twin renders empty scaffold with a "No data for this tenant" state rather than falling back to another tenant's bundle.

---

**Deliverable:** architectural specification only. No code, schema, dependency, or route changes performed. Awaiting approval before switching to build mode for any subsequent implementation task.
