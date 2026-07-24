import { EmptyState } from "@/platform/components/States";

export default function CommercialSources() {
  return (
    <EmptyState
      title="No source references configured"
      description="Source-of-truth references (SRC-001…SRC-006 and variances) will appear here once registered."
    />
  );
}
