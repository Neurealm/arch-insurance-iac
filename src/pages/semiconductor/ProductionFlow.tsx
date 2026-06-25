import { useMemo, useState } from "react";
import { SemiShell } from "../../features/semiconductor/components/SemiShell";
import { KpiRibbon } from "../../features/semiconductor/components/KpiRibbon";
import { useScenario } from "../../features/semiconductor/state/ScenarioContext";

const LOTS = [
  { id: "LOT A10482", family: "Power Mgmt A", op: "PHOTO-37", prio: "Hot", due: "+8h", queue: 142, maxQ: 180, tool: "LITHO 21", risk: "High" },
  { id: "LOT B20731", family: "Precision Signal A", op: "ETCH-12", prio: "Std", due: "+22h", queue: 64, maxQ: 240, tool: "ETCH 14", risk: "Low" },
  { id: "LOT C31106", family: "Embedded Ctrl A", op: "METR-08", prio: "Critical", due: "+4h", queue: 188, maxQ: 200, tool: "MET 044", risk: "Critical" },
  { id: "LOT P45018", family: "Automotive Sensing A", op: "DIFF-19", prio: "Hot", due: "+11h", queue: 92, maxQ: 220, tool: "DIFF 06", risk: "Med" },
  { id: "LOT D60127", family: "Industrial Interface A", op: "CMP-04", prio: "Std", due: "+30h", queue: 38, maxQ: 200, tool: "CMP 09", risk: "Low" },
  { id: "LOT E71210", family: "Power Mgmt A", op: "METR-08", prio: "Hot", due: "+6h", queue: 165, maxQ: 200, tool: "MET 038", risk: "High" },
];

const OBJ_DEFAULT = { otd: 25, cycle: 15, queue: 15, change: 10, util: 10, quality: 15, energy: 5, transport: 5 };

export default function ProductionFlow() {
  const s = useScenario();
  const [strategy, setStrategy] = useState("multi");
  const [w, setW] = useState(OBJ_DEFAULT);
  const total = useMemo(() => Object.values(w).reduce((a, b) => a + b, 0), [w]);

  return (
    <SemiShell>
      <div className="p-4 lg:p-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold">Production Flow & Dispatch Optimization</h1>
          <p className="text-sm text-muted-foreground">Workshop optimization simulation — not a production solver.</p>
        </header>
        <KpiRibbon />

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-2 flex-wrap">
              <div className="text-sm font-semibold">Lot Queue — Top 6 candidates</div>
              <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="h-7 text-xs border border-border rounded px-2 bg-background">
                <option value="current">Current Rule Set</option>
                <option value="fifo">FIFO</option>
                <option value="edd">Earliest Due Date</option>
                <option value="critical">Critical Ratio</option>
                <option value="hot">Hot Lot Priority</option>
                <option value="maxq">Max Queue Protection</option>
                <option value="bottleneck">Bottleneck Protection</option>
                <option value="batch">Batch & Campaign</option>
                <option value="energy">Energy-Aware</option>
                <option value="multi">Multi-Objective Optimization</option>
              </select>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-muted-foreground">
                <tr>
                  {["Lot", "Family", "Operation", "Priority", "Due", "Q (min)", "Tool", "Risk"].map(h => <th key={h} className="text-left px-3 py-1.5 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {LOTS.map((l) => (
                  <tr key={l.id} className="border-t border-border hover:bg-slate-50">
                    <td className="px-3 py-1.5 font-mono">{l.id}</td>
                    <td className="px-3 py-1.5">{l.family}</td>
                    <td className="px-3 py-1.5">{l.op}</td>
                    <td className="px-3 py-1.5">{l.prio}</td>
                    <td className="px-3 py-1.5">{l.due}</td>
                    <td className="px-3 py-1.5 tabular-nums">{l.queue}/{l.maxQ}</td>
                    <td className="px-3 py-1.5 font-mono">{l.tool}</td>
                    <td className="px-3 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        l.risk === "Critical" ? "bg-red-50 text-red-700"
                        : l.risk === "High" ? "bg-amber-50 text-amber-800"
                        : l.risk === "Med" ? "bg-blue-50 text-blue-700"
                        : "bg-emerald-50 text-emerald-700"
                      }`}>{l.risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-sm font-semibold">Objective Weights</div>
            <div className={`text-[11px] mb-2 ${total === 100 ? "text-emerald-700" : "text-amber-700"}`}>Total {total}% (target 100%)</div>
            <div className="space-y-2">
              {(Object.keys(w) as (keyof typeof w)[]).map((k) => (
                <label key={k} className="block text-[11.5px]">
                  <div className="flex justify-between"><span className="capitalize">{k}</span><span className="tabular-nums text-muted-foreground">{w[k]}%</span></div>
                  <input type="range" min={0} max={50} value={w[k]} onChange={(e) => setW({ ...w, [k]: Number(e.target.value) })} className="w-full" />
                </label>
              ))}
            </div>
            <button onClick={() => setW(OBJ_DEFAULT)} className="mt-2 h-7 px-2 text-xs rounded border border-border bg-background hover:bg-accent">Reset</button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-sm font-semibold mb-1">Decision Explanation — why this sequence</div>
          <ul className="text-[12px] text-foreground/80 space-y-0.5 list-disc pl-4">
            <li>LOT C31106 promoted: critical-ratio binding, max-queue 200m within 12 min of breach</li>
            <li>LOT A10482 routed to LITHO 21: only qualified tool with reticle availability in window</li>
            <li>Bottleneck protection active at metrology: dispatch adherence {s.currentKpis.dispatchAdherence}%</li>
            <li>Energy-aware tiebreaker: avoided LITHO 18 (idle preheat would lift peak by 0.4 MW)</li>
          </ul>
          <div className="mt-2 flex gap-2 text-xs">
            <button className="h-7 px-2 rounded border border-border bg-background hover:bg-accent">Explain Recommendation</button>
            <button className="h-7 px-2 rounded border border-border bg-background hover:bg-accent">Compare with Current</button>
            <button className="h-7 px-2 rounded border border-border bg-background hover:bg-accent">Run in Digital Twin</button>
            <button className="h-7 px-2 rounded bg-indigo text-white">Request Manufacturing Approval</button>
          </div>
        </div>
      </div>
    </SemiShell>
  );
}
