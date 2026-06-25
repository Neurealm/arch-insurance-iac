import { SemiShell } from "../../features/semiconductor/components/SemiShell";
import { KpiRibbon } from "../../features/semiconductor/components/KpiRibbon";
import { useScenario } from "../../features/semiconductor/state/ScenarioContext";

const OPPS = [
  { t: "Precondition chilled water loop B", benefit: "−1.4 MW peak", prod: "None", risk: "Low", appr: "Facilities" },
  { t: "Shift eligible charging loads", benefit: "−0.8 MW peak", prod: "None", risk: "Low", appr: "Facilities" },
  { t: "Move selected maintenance activity", benefit: "−0.6 MW peak", prod: "Minor", risk: "Low", appr: "Maintenance" },
  { t: "Coordinate idle mode for qualified tools", benefit: "−0.9 MW peak", prod: "None", risk: "Low", appr: "Manufacturing" },
  { t: "Delay noncritical engineering runs", benefit: "Throughput +0.4%", prod: "Eng delay", risk: "Medium", appr: "Engineering" },
  { t: "Detect compressed dry air anomaly", benefit: "Energy −1.2%", prod: "None", risk: "Low", appr: "Facilities" },
];

export default function ResourceOptimization() {
  const s = useScenario();
  return (
    <SemiShell>
      <div className="p-4 lg:p-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold">Resource & Utility Optimization</h1>
          <p className="text-sm text-muted-foreground">Production-aware utility optimization complementing OT and facilities platforms.</p>
        </header>
        <KpiRibbon />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            ["Electrical Demand", `${s.currentKpis.electricalNowMW} MW`],
            ["Forecast Peak", `${s.currentKpis.forecastPeakMW} MW`],
            ["Peak Target", "71.0 MW"],
            ["Chilled Water", "86%"],
            ["CDA Variance", "+4.8%"],
            ["Process Vacuum Cap.", "14%"],
            ["UPW Reclaim", "68%"],
            ["Open Recommendations", "3"],
          ].map(([l, v]) => (
            <div key={l} className="rounded-lg border border-border bg-card p-3">
              <div className="text-[10.5px] uppercase text-muted-foreground">{l}</div>
              <div className="font-semibold tabular-nums">{v}</div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-3 py-2 border-b border-border text-sm font-semibold">Optimization Opportunities — recommendation only</div>
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-muted-foreground">
              <tr>{["Action", "Benefit", "Production effect", "Risk", "Approver"].map(h => <th key={h} className="px-3 py-1.5 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {OPPS.map(o => (
                <tr key={o.t} className="border-t border-border">
                  <td className="px-3 py-1.5">{o.t}</td>
                  <td className="px-3 py-1.5 text-emerald-700">{o.benefit}</td>
                  <td className="px-3 py-1.5">{o.prod}</td>
                  <td className="px-3 py-1.5">{o.risk}</td>
                  <td className="px-3 py-1.5">{o.appr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-border bg-card p-3 text-[11.5px] text-muted-foreground">
          Can complement Rockwell-based operations, historian, facilities, and optimization environments through approved integration patterns. NeuGAIN does not replace or directly control these systems.
        </div>
      </div>
    </SemiShell>
  );
}
