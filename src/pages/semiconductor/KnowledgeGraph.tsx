import { useState } from "react";
import { SemiShell } from "../../features/semiconductor/components/SemiShell";

const NODES = [
  { id: "MET 041", group: "Tool", x: 380, y: 180, status: "crit" },
  { id: "Metrology Group", group: "Tool Group", x: 380, y: 90, status: "warn" },
  { id: "MET 038", group: "Tool", x: 260, y: 240, status: "ok" },
  { id: "MET 044", group: "Tool", x: 500, y: 240, status: "ok" },
  { id: "37 Queue-Risk Lots", group: "Lots", x: 200, y: 320, status: "warn" },
  { id: "12 Priority Lots", group: "Lots", x: 380, y: 360, status: "crit" },
  { id: "AMHS Bay 3", group: "Material", x: 560, y: 320, status: "warn" },
  { id: "VSN 4.8", group: "Vision", x: 640, y: 200, status: "warn" },
  { id: "Chilled Water B", group: "Utility", x: 140, y: 200, status: "warn" },
  { id: "Balanced Recovery", group: "Simulation", x: 380, y: 30, status: "ok" },
  { id: "Mfg Approval", group: "Approval", x: 540, y: 30, status: "warn" },
  { id: "Dispatch Agent", group: "Agent", x: 220, y: 30, status: "ok" },
];

const EDGES: [string, string][] = [
  ["MET 041", "Metrology Group"],
  ["MET 038", "Metrology Group"],
  ["MET 044", "Metrology Group"],
  ["MET 041", "37 Queue-Risk Lots"],
  ["MET 041", "12 Priority Lots"],
  ["AMHS Bay 3", "37 Queue-Risk Lots"],
  ["VSN 4.8", "12 Priority Lots"],
  ["Chilled Water B", "Metrology Group"],
  ["Metrology Group", "Balanced Recovery"],
  ["Balanced Recovery", "Mfg Approval"],
  ["Dispatch Agent", "Metrology Group"],
];

const COLOR = { ok: "#10b981", warn: "#f59e0b", crit: "#ef4444" } as const;

const QUERIES = [
  "Why are priority lots at risk?",
  "Which tools can accept LOT A10482?",
  "What is the downstream impact of MET 041?",
  "Which recommendation reduces both cycle time and peak demand?",
  "Which vision endpoints are affected by VSN 4.8?",
  "What evidence supports Balanced Recovery?",
];

const ANSWERS: Record<string, string> = {
  "Why are priority lots at risk?": "12 priority lots route through Metrology Group; MET 041 calibration fault has reduced effective capacity by 18%. AMHS Bay 3 congestion adds 14 min transport delay; combined slack now negative for 12 lots.",
  "Which tools can accept LOT A10482?": "Qualified set: LITHO 21 (selected), LITHO 18 (reticle conflict), LITHO 24 (PM window).",
  "What is the downstream impact of MET 041?": "Direct: 37 lots in queue-time risk window. Indirect: Litho dispatch adherence −3.8 pp; OTD forecast falls 3.8 pp to 89.6%.",
  "Which recommendation reduces both cycle time and peak demand?": "Balanced Recovery: cycle time 47.4 → 46.6d and forecast peak 74.8 → 70.9 MW.",
  "Which vision endpoints are affected by VSN 4.8?": "12 endpoints on wafer backside macro inspection; false rejects +1.7 pp since illumination calibration change.",
  "What evidence supports Balanced Recovery?": "Digital twin runs (n=4), golden dataset comparison VSN 4.8 vs 4.7, AMHS route simulation, utility envelope check, policy evaluation.",
};

export default function KnowledgeGraph() {
  const [sel, setSel] = useState<string | null>("MET 041");
  const [q, setQ] = useState(QUERIES[0]);

  return (
    <SemiShell>
      <div className="p-4 lg:p-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold">Manufacturing Knowledge Graph</h1>
          <p className="text-sm text-muted-foreground">Cross-domain dependencies, evidence, and blast radius.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-3 py-2 border-b border-border text-sm font-semibold flex justify-between">
              <span>Blast radius — MET 041 calibration fault</span>
              <span className="text-[11px] text-muted-foreground">12 nodes · 11 relationships</span>
            </div>
            <svg viewBox="0 0 760 400" className="w-full h-[420px] bg-[linear-gradient(180deg,#f8fafc,#eef2ff)]">
              {EDGES.map(([a, b], i) => {
                const na = NODES.find(n => n.id === a)!;
                const nb = NODES.find(n => n.id === b)!;
                return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="#cbd5e1" strokeWidth="1.5" />;
              })}
              {NODES.map(n => (
                <g key={n.id} onClick={() => setSel(n.id)} style={{ cursor: "pointer" }}>
                  <circle cx={n.x} cy={n.y} r={sel === n.id ? 14 : 10} fill={COLOR[n.status as keyof typeof COLOR]} opacity={0.85} stroke="#fff" strokeWidth={2} />
                  <text x={n.x} y={n.y - 16} fontSize="10" fill="#0f172a" textAnchor="middle" fontWeight={sel === n.id ? 700 : 500}>{n.id}</text>
                  <text x={n.x} y={n.y + 24} fontSize="9" fill="#64748b" textAnchor="middle">{n.group}</text>
                </g>
              ))}
            </svg>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="text-sm font-semibold mb-1">Selected: {sel}</div>
              {sel && (() => {
                const n = NODES.find(x => x.id === sel)!;
                const rel = EDGES.filter(([a, b]) => a === sel || b === sel).map(([a, b]) => a === sel ? b : a);
                return (
                  <div className="text-xs space-y-1">
                    <div><span className="text-muted-foreground">Type:</span> {n.group}</div>
                    <div><span className="text-muted-foreground">Status:</span> {n.status}</div>
                    <div><span className="text-muted-foreground">Related ({rel.length}):</span> {rel.join(", ")}</div>
                  </div>
                );
              })()}
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="text-sm font-semibold mb-1">Ask the graph</div>
              <select value={q} onChange={(e) => setQ(e.target.value)} className="w-full h-8 text-xs border border-border rounded px-2 bg-background mb-2">
                {QUERIES.map(x => <option key={x}>{x}</option>)}
              </select>
              <div className="text-[12px] bg-slate-50 p-2 rounded border border-border">{ANSWERS[q]}</div>
            </div>
          </div>
        </div>
      </div>
    </SemiShell>
  );
}
