import { SemiShell } from "../../features/semiconductor/components/SemiShell";
import { KpiRibbon } from "../../features/semiconductor/components/KpiRibbon";

const TASKS = [
  { id: "T1", platform: "AMR", task: "FOUP support movement", area: "Material staging", readiness: "Operationally Approved", evidence: "Validated" },
  { id: "T2", platform: "Cobot Arm", task: "Consumables handoff", area: "Subfab corridor", readiness: "Controlled Pilot", evidence: "Partially Validated" },
  { id: "T3", platform: "Bipedal Mobile Manipulator (Reference)", task: "Facilities inspection round", area: "Subfab service corridor", readiness: "Simulation Validated", evidence: "Reference Pattern" },
  { id: "T4", platform: "Bipedal Mobile Manipulator (Reference)", task: "Gauge & display reading", area: "Warehouse", readiness: "Lab Validated", evidence: "Evidence Required" },
  { id: "T5", platform: "Fixed Inspection", task: "Routine visual inspection", area: "Inspection cell", readiness: "Operationally Approved", evidence: "Validated" },
];

const VALIDATIONS = [
  "Collision risk", "Path feasibility", "Reachability", "Payload", "Sensor occlusion",
  "Cycle time", "Battery state", "Restricted zone compliance", "Fail-safe behavior",
  "Human interaction boundary", "Cleanroom compatibility", "Network dependency", "Recovery behavior",
];

export default function PhysicalAutomation() {
  return (
    <SemiShell>
      <div className="p-4 lg:p-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold">Physical Automation & Robotics Validation</h1>
          <p className="text-sm text-muted-foreground">Simulation, validation, orchestration and operational readiness across robotics platforms.</p>
        </header>
        <KpiRibbon />

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-3 py-2 border-b border-border text-sm font-semibold">Task Library — Readiness Matrix</div>
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-muted-foreground">
              <tr>{["ID", "Platform", "Task", "Area", "Readiness", "Evidence"].map(h => <th key={h} className="px-3 py-1.5 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {TASKS.map(t => (
                <tr key={t.id} className="border-t border-border hover:bg-slate-50">
                  <td className="px-3 py-1.5 font-mono">{t.id}</td>
                  <td className="px-3 py-1.5">{t.platform}</td>
                  <td className="px-3 py-1.5">{t.task}</td>
                  <td className="px-3 py-1.5">{t.area}</td>
                  <td className="px-3 py-1.5">{t.readiness}</td>
                  <td className="px-3 py-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      t.evidence === "Validated" ? "bg-emerald-50 text-emerald-700"
                      : t.evidence === "Partially Validated" ? "bg-amber-50 text-amber-800"
                      : t.evidence === "Reference Pattern" ? "bg-blue-50 text-blue-700"
                      : "bg-red-50 text-red-700"
                    }`}>{t.evidence}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-sm font-semibold mb-2">Validation Dimensions</div>
            <ul className="grid grid-cols-2 gap-y-1 text-[11.5px] text-foreground/80">
              {VALIDATIONS.map(v => <li key={v}>• {v}</li>)}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-sm font-semibold mb-2">Simulation vs Physical Test</div>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-border"><td className="py-1">Cycle time (sim)</td><td className="text-right tabular-nums">42.1s</td></tr>
                <tr className="border-b border-border"><td className="py-1">Cycle time (lab)</td><td className="text-right tabular-nums">44.6s</td></tr>
                <tr className="border-b border-border"><td className="py-1">Task completion</td><td className="text-right tabular-nums">98.4%</td></tr>
                <tr className="border-b border-border"><td className="py-1">Required adjustment</td><td className="text-right">Re-tune gripper preload</td></tr>
                <tr><td className="py-1">Production readiness</td><td className="text-right text-amber-700">Controlled Pilot</td></tr>
              </tbody>
            </table>
            <p className="mt-2 text-[11px] text-muted-foreground">Humanoid evidence defaults to "Evidence Required" until entered in Facilitator Mode.</p>
          </div>
        </div>
      </div>
    </SemiShell>
  );
}
