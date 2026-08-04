import { useCapabilityIntelligence } from "../CapabilityIntelligenceProvider";
import { CapabilityOverviewCards } from "../components/CapabilityOverviewCards";
import { EmptyState } from "@/platform/components/States";

/** Screen 1 — executive overview of platform capability health. */
export default function CapabilityOverview() {
  const { snapshot } = useCapabilityIntelligence();
  if (!snapshot) return <EmptyState title="No analysis available" description="The capability graph produced no snapshot." />;
  return (
    <CapabilityOverviewCards
      intelligence={snapshot.intelligence}
      statistics={snapshot.statistics}
      graph={snapshot.graph}
      analysisDurationMs={snapshot.analysisDurationMs}
      computedAt={snapshot.computedAt}
    />
  );
}
