import { useState } from "react";
import { useCapabilityIntelligence } from "../CapabilityIntelligenceProvider";
import { CapabilityExplorerTable } from "../components/CapabilityExplorerTable";
import { EntityDrawer } from "../components/EntityDrawer";
import { EmptyState } from "@/platform/components/States";

/** Screen 2 — browse platform entities with search, filters, sorting, paging. */
export default function CapabilityExplorer() {
  const { snapshot } = useCapabilityIntelligence();
  const [selected, setSelected] = useState<string | null>(null);
  if (!snapshot) return <EmptyState title="No analysis available" />;
  return (
    <>
      <CapabilityExplorerTable engine={snapshot.queryEngine} onSelect={setSelected} />
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
