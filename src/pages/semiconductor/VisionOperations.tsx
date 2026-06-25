import { SemiShell } from "../../features/semiconductor/components/SemiShell";
import { KpiRibbon } from "../../features/semiconductor/components/KpiRibbon";
import { useScenario } from "../../features/semiconductor/state/ScenarioContext";

const MODELS = [
  { v: "VSN 4.8", use: "Wafer backside macro", endpoints: 18, drift: "1.7 pp ↑", state: "Warning", owner: "QE-3" },
  { v: "VSN 4.7", use: "Wafer backside macro", endpoints: 0, drift: "—", state: "Rollback candidate", owner: "QE-3" },
  { v: "VSN 6.2", use: "Frontside particle", endpoints: 32, drift: "0.1 pp", state: "Healthy", owner: "QE-1" },
  { v: "VSN 7.1", use: "Wire bond inspection", endpoints: 24, drift: "0.0 pp", state: "Healthy", owner: "QE-2" },
  { v: "VSN 3.4", use: "Pad alignment", endpoints: 18, drift: "0.3 pp", state: "Healthy", owner: "QE-2" },
  { v: "VSN 5.0", use: "Bevel inspection", endpoints: 22, drift: "0.0 pp", state: "Healthy", owner: "QE-1" },
];

const STEPS = [
  "Detect drift",
  "Correlate process & environmental context",
  "Identify affected endpoints",
  "Collect representative edge cases",
  "Validate against golden data",
  "Compare candidate vs current",
  "Request canary approval",
  "Deploy canary",
  "Monitor",
  "Promote or roll back",
  "Create evidence package",
];

export default function VisionOperations() {
  const s = useScenario();
  return (
    <SemiShell>
      <div className="p-4 lg:p-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold">Vision Operations Center</h1>
          <p className="text-sm text-muted-foreground">Operate, govern, deploy, monitor and scale vision intelligence — not a defect detector.</p>
        </header>
        <KpiRibbon />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            ["Inspection Endpoints", "114"],
            ["Deployed Model Versions", "18"],
            ["Endpoint Availability", "99.94%"],
            ["Median Inference", "34 ms"],
            ["Endpoints in Warning", String(s.currentKpis.visionWarnings)],
            ["Active Drift Events", "1"],
            ["Canary Slots", "4"],
            ["Model Families", "6"],
          ].map(([l, v]) => (
            <div key={l} className="rounded-lg border border-border bg-card p-3">
              <div className="text-[10.5px] uppercase text-muted-foreground">{l}</div>
              <div className="font-semibold tabular-nums">{v}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-3 py-2 border-b border-border text-sm font-semibold">Model Registry</div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-muted-foreground">
                <tr>{["Version", "Use case", "Endpoints", "Drift", "State", "Owner"].map(h => <th key={h} className="px-3 py-1.5 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {MODELS.map(m => (
                  <tr key={m.v} className="border-t border-border hover:bg-slate-50">
                    <td className="px-3 py-1.5 font-mono">{m.v}</td>
                    <td className="px-3 py-1.5">{m.use}</td>
                    <td className="px-3 py-1.5 tabular-nums">{m.endpoints}</td>
                    <td className="px-3 py-1.5">{m.drift}</td>
                    <td className="px-3 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        m.state === "Warning" ? "bg-amber-50 text-amber-800"
                        : m.state === "Rollback candidate" ? "bg-blue-50 text-blue-700"
                        : "bg-emerald-50 text-emerald-700"
                      }`}>{m.state}</span>
                    </td>
                    <td className="px-3 py-1.5">{m.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-sm font-semibold mb-2">Vision Reliability Workflow</div>
            <ol className="text-[11.5px] space-y-1">
              {STEPS.map((st, i) => (
                <li key={st} className="flex gap-2">
                  <span className="inline-grid place-items-center h-4 w-4 rounded-full bg-indigo text-white text-[9px] shrink-0">{i + 1}</span>
                  <span>{st}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3 text-[11.5px] text-muted-foreground">
          Compatible with industrial edge vision and video analytics platforms, including Metropolis and DeepStream based architectures, subject to engagement validation.
        </div>
      </div>
    </SemiShell>
  );
}
