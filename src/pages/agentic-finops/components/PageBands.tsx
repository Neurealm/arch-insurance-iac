import { EnvironmentFabricBand, MaturityJourneyBand, LifecycleRail, defaultFabric, defaultMaturity, type LifecycleStep, type MaturityLevel, type FabricNode } from "./bands";
import SyntheticFooter from "./SyntheticFooter";

/** Shared bottom band stack used by every FinOps workspace. */
export default function PageBands({
  fabric = defaultFabric,
  maturity = defaultMaturity,
  lifecycle,
  fabricNote,
  tagline,
}: {
  fabric?: FabricNode[];
  maturity?: MaturityLevel[];
  lifecycle?: LifecycleStep[];
  fabricNote?: string;
  tagline?: string;
}) {
  return (
    <div className="space-y-5">
      <EnvironmentFabricBand nodes={fabric} note={fabricNote} />
      <MaturityJourneyBand levels={maturity} />
      <LifecycleRail steps={lifecycle} />
      <SyntheticFooter tagline={tagline} />
    </div>
  );
}

export function lifecycleWithActive(active: string): LifecycleStep[] {
  const labels = [
    "Observe", "Contextualize", "Investigate", "Simulate", "Decide",
    "Govern", "Execute", "Validate", "Realize", "Learn",
  ];
  const idx = Math.max(labels.indexOf(active), 0);
  return labels.map((label, i) => ({
    label,
    state: i < idx ? "done" : i === idx ? "active" : "todo",
  }));
}
