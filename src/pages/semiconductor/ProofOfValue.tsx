import { useState } from "react";
import { SemiShell } from "../../features/semiconductor/components/SemiShell";
import { Printer } from "lucide-react";

type Opp = { id: string; name: string; scores: number[] };
const CRIT = ["Bus. Value", "Op. Impact", "Feasibility", "Data Ready", "Integration", "Op. Risk", "Time-to-Value", "Exec Sponsor", "Differentiation", "Scalability"];
const WEIGHTS = [0.20, 0.15, 0.15, 0.10, 0, 0.05, 0.15, 0, 0.10, 0.10];

const INITIAL: Opp[] = [
  { id: "twin", name: "Factory Digital Twin & Simulation", scores: [5, 4, 4, 3, 3, 2, 4, 4, 5, 5] },
  { id: "flow", name: "Production Flow & Dispatch Optimization", scores: [5, 5, 4, 4, 3, 3, 4, 4, 4, 5] },
  { id: "phys", name: "Physical Automation Validation", scores: [3, 3, 4, 3, 4, 3, 3, 3, 4, 3] },
  { id: "vision", name: "Vision Operations at Scale", scores: [4, 4, 4, 4, 3, 2, 4, 4, 4, 5] },
  { id: "ops", name: "Factory Operations Intelligence", scores: [5, 5, 4, 4, 4, 2, 4, 5, 5, 5] },
  { id: "util", name: "Resource & Utility Optimization", scores: [4, 4, 4, 3, 3, 2, 4, 4, 3, 4] },
  { id: "kg", name: "Manufacturing Knowledge Graph", scores: [4, 4, 3, 3, 4, 2, 3, 4, 5, 4] },
];

function score(o: Opp) {
  let s = 0;
  o.scores.forEach((v, i) => { s += v * (WEIGHTS[i] || 0); });
  // Op risk is inverse
  s -= o.scores[5] * 0.05;
  s += o.scores[5] * 0.05; // already added 0
  return +s.toFixed(2);
}

export default function ProofOfValue() {
  const [opps] = useState(INITIAL);
  const ranked = [...opps].sort((a, b) => score(b) - score(a));

  function print() { window.print(); }

  return (
    <SemiShell>
      <div className="p-4 lg:p-6 space-y-4">
        <header className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">Proof of Value Prioritization & Roadmap</h1>
            <p className="text-sm text-muted-foreground">Score, prioritize, and generate a 90-day plan.</p>
          </div>
          <button onClick={print} className="h-9 px-3 rounded-md bg-indigo text-white text-sm inline-flex items-center gap-2"><Printer className="h-4 w-4" />Generate 90-Day PoV</button>
        </header>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-3 py-2 border-b border-border text-sm font-semibold">Opportunity Scorecard</div>
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-muted-foreground">
              <tr>
                <th className="px-3 py-1.5 text-left font-medium">Opportunity</th>
                {CRIT.map(c => <th key={c} className="px-2 py-1.5 text-center font-medium">{c}</th>)}
                <th className="px-3 py-1.5 text-right font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((o, i) => (
                <tr key={o.id} className={`border-t border-border ${i === 0 ? "bg-emerald-50/40" : ""}`}>
                  <td className="px-3 py-1.5 font-medium">{o.name} {i === 0 && <span className="ml-1 text-[10px] text-emerald-700">PRIMARY</span>}{i === 1 && <span className="ml-1 text-[10px] text-blue-700">SECONDARY</span>}</td>
                  {o.scores.map((v, j) => <td key={j} className="px-2 py-1.5 text-center tabular-nums">{v}</td>)}
                  <td className="px-3 py-1.5 text-right font-semibold tabular-nums">{score(o)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {[["30-Day Plan", [
            "Confirm baseline KPIs and source systems",
            "Wire reference factory data into shared context graph",
            "Stand up Balanced Recovery scenario in twin",
            "Define approval roles, evidence package, rollback policy",
          ]],
          ["60-Day Plan", [
            "Operate cross-domain workflow on synthetic incidents",
            "Pilot dispatch objective tuning with manufacturing control",
            "Vision canary lifecycle on 4 endpoints",
            "Production-aware utility recommendation review cycle",
          ]],
          ["90-Day Plan", [
            "Run 5 governed scenarios end-to-end with verified evidence",
            "Measure cycle time, OTD, peak, approval latency lift",
            "Decision pack for next-phase production integration",
            "Define expansion roadmap to additional bays / sites",
          ]]].map(([title, items]) => (
            <div key={title as string} className="rounded-lg border border-border bg-card p-3">
              <div className="text-sm font-semibold mb-1">{title as string}</div>
              <ul className="text-[12px] space-y-1 list-disc pl-4">
                {(items as string[]).map(x => <li key={x}>{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </SemiShell>
  );
}
