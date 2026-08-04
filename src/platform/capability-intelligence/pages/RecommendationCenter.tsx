import { useState } from "react";
import { useCapabilityIntelligence } from "../CapabilityIntelligenceProvider";
import { RecommendationList } from "../components/RecommendationList";
import { EntityDrawer } from "../components/EntityDrawer";
import { EmptyState } from "@/platform/components/States";

/** Screen 3 — advisory recommendation center. Read-only, no approvals. */
export default function RecommendationCenter() {
  const { snapshot } = useCapabilityIntelligence();
  const [selected, setSelected] = useState<string | null>(null);
  if (!snapshot) return <EmptyState title="No analysis available" />;
  return (
    <>
      <RecommendationList
        recommendations={snapshot.intelligence.recommendations}
        onSelectEntity={setSelected}
      />
      <EntityDrawer
        nodeId={selected}
        engine={snapshot.queryEngine}
        intelligence={snapshot.intelligence}
        onOpenChange={(open) => !open && setSelected(null)}
        onSelectEntity={setSelected}
      />
    </>
  );
}
