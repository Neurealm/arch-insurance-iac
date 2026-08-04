/**
 * Stage 3.5.4.1.2 — authoritative Capability Intelligence route configuration.
 *
 * `src/App.tsx` renders this element inside the existing `/platform` shell, and
 * integration tests mount the very same element. There is therefore one and
 * only one definition of the guard, the child paths and the lazy boundaries —
 * a test cannot drift from the application wiring.
 *
 * Lazy loading, route paths and the Platform shell are unchanged.
 */

import { lazy } from "react";
import { Route } from "react-router-dom";
import { PlatformAdminRoute } from "@/components/auth/PermissionRoute";

const CapabilityIntelligenceLayout = lazy(() => import("./CapabilityIntelligenceLayout"));
const CapabilityOverview = lazy(() => import("./pages/CapabilityOverview"));
const CapabilityExplorer = lazy(() => import("./pages/CapabilityExplorer"));
const RecommendationCenter = lazy(() => import("./pages/RecommendationCenter"));
const GraphExplorer = lazy(() => import("./pages/GraphExplorer"));


/** Path segment of the route group, relative to `/platform`. */
export const CAPABILITY_INTELLIGENCE_PATH = "capability-intelligence";

/**
 * The route group element. Rendered as a child of `<Route path="/platform">`.
 */
export const capabilityIntelligenceRoutes = (
  <Route
    path={CAPABILITY_INTELLIGENCE_PATH}
    element={
      <PlatformAdminRoute>
        <CapabilityIntelligenceLayout />
      </PlatformAdminRoute>
    }
  >
    <Route index element={<CapabilityOverview />} />
    <Route path="explorer" element={<CapabilityExplorer />} />
    <Route path="recommendations" element={<RecommendationCenter />} />
    <Route path="graph" element={<GraphExplorer />} />

  </Route>
);
