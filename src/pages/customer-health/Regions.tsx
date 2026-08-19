import { PageHeader, Panel } from "./primitives";
import { RegionList, RegionMap } from "./RegionHealthPanel";

export default function CustomerHealthRegions() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Regions"
        subtitle="Azure infrastructure health and your own service health are tracked separately for every region."
      />
      <Panel
        title="Azure Region Map"
        subtitle="Hover a marker for regional context, select it to see whether anything you run there is affected"
      >
        <RegionMap />
      </Panel>
      <Panel title="Region List" subtitle="Infrastructure condition and customer service health, side by side">
        <RegionList />
      </Panel>
    </div>
  );
}
