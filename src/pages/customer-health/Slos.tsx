import { PageHeader, useImpactDrawer } from "./primitives";
import { SloTiles } from "./SloStatusPanel";
import { BudgetTacticsPanel, EarlySurveillancePanel } from "./SloEarlySignals";

export default function CustomerHealthSlos() {
  const { open } = useImpactDrawer();
  return (
    <div className="space-y-4">
      <PageHeader
        title="Service Level Objectives"
        subtitle="The commitments we make to you, how we are performing against them, and how much error budget remains."
      />
      <SloTiles onOpen={open} size="lg" className="xl:grid-cols-4" />
      <p className="text-[11.5px] leading-snug text-slate-500">
        Select an objective to see its reliability history over 24 hours, 7, 30 and 90 days, how the error budget is
        being consumed, and which events contributed. Infrastructure event time is kept distinct from
        customer-impacting time.
      </p>
      <BudgetTacticsPanel />
      <EarlySurveillancePanel />
    </div>
  );
}

