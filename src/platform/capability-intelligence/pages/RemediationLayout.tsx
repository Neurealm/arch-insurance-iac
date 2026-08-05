/**
 * Stage 3.5.4.4 — remediation route-group layout.
 *
 * The smallest backward-compatible extraction that lets the Simulation and
 * Change Planning workspace and the Change Review Readiness screen share one
 * `RemediationWorkspaceProvider`, and therefore one session-local plan.
 *
 * It owns no state and runs no engine. The Capability Intelligence provider
 * above it is untouched, so `analyzeGraph()` still executes exactly once per
 * provider lifecycle and navigating between the two children recomputes
 * nothing.
 */

import { Outlet } from "react-router-dom";
import { EmptyState } from "@/platform/components/States";
import { useCapabilityIntelligence } from "../CapabilityIntelligenceProvider";
import { RemediationWorkspaceProvider } from "../RemediationWorkspaceProvider";

export default function RemediationLayout() {
  const { snapshot } = useCapabilityIntelligence();
  if (!snapshot) return <EmptyState title="No analysis available" />;
  return (
    <RemediationWorkspaceProvider recommendations={snapshot.intelligence.recommendations}>
      <Outlet />
    </RemediationWorkspaceProvider>
  );
}
