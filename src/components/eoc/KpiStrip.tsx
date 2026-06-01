import { kpis } from "@/data/eoc";
import { KpiCard } from "./KpiCard";

export function KpiStrip() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((k) => (
        <KpiCard key={k.id} kpi={k} />
      ))}
    </div>
  );
}