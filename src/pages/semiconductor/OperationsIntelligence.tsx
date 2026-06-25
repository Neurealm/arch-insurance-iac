import { SemiShell } from "../../features/semiconductor/components/SemiShell";
import { KpiRibbon } from "../../features/semiconductor/components/KpiRibbon";
import { useScenario } from "../../features/semiconductor/state/ScenarioContext";

const AGENTS = [
  { name: "Factory Operations Coordinator", autonomy: "Human Approval Required", state: "Active" },
  { name: "Dispatch Optimization Agent", autonomy: "Recommendation Only", state: "Active" },
  { name: "Vision Reliability Agent", autonomy: "Human Approval Required", state: "Active" },
  { name: "Physical Automation Validation Agent", autonomy: "Observe Only", state: "Idle" },
  { name: "Utility Optimization Agent", autonomy: "Recommendation Only", state: "Active" },
  { name: "Incident & Root Cause Agent", autonomy: "Recommendation Only", state: "Active" },
  { name: "Change Governance Agent", autonomy: "Human Approval Required", state: "Active" },
];

const LIFECYCLE = ["Observe", "Correlate", "Analyze", "Simulate", "Recommend", "Approve", "Execute", "Verify", "Document", "Learn"];

export default function OperationsIntelligence() {
  const s = useScenario();
  return (
    <SemiShell>
      <div className="p-4 lg:p-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold">Factory Operations Intelligence</h1>
          <p className="text-sm text-muted-foreground">NeuGAIN RunOps for manufacturing — governed cross-domain orchestration.</p>
        </header>
        <KpiRibbon />

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-sm font-semibold mb-2">Agentic Lifecycle</div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            {LIFECYCLE.map((l, i) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="px-2 py-1 rounded border border-border bg-background">{l}</span>
                {i < LIFECYCLE.length - 1 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-3 py-2 border-b border-border text-sm font-semibold">Digital Operations Agents</div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-muted-foreground">
                <tr>{["Agent", "Autonomy", "State"].map(h => <th key={h} className="px-3 py-1.5 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {AGENTS.map(a => (
                  <tr key={a.name} className="border-t border-border">
                    <td className="px-3 py-1.5">{a.name}</td>
                    <td className="px-3 py-1.5">{a.autonomy}</td>
                    <td className="px-3 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${a.state === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{a.state}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-3 py-2 border-b border-border text-sm font-semibold">Operations Decision Inbox</div>
            <ul className="divide-y divide-border">
              {s.recommendations.map(r => (
                <li key={r.id} className="px-3 py-2 text-xs">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-muted-foreground">{r.expected} · Confidence {r.confidence}% · {r.approver}</div>
                  <div className="mt-1 flex gap-1.5">
                    <button onClick={() => s.updateRecommendation(r.id, "Approved")} className="h-6 px-2 text-[11px] rounded bg-emerald-600 text-white">Approve</button>
                    <button onClick={() => s.updateRecommendation(r.id, "Rejected")} className="h-6 px-2 text-[11px] rounded border border-border bg-background">Reject</button>
                    <span className="text-[11px] text-muted-foreground ml-auto">{r.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-sm font-semibold mb-2">Cross-Domain Workflow — Compound Event</div>
          <ol className="text-[11.5px] grid md:grid-cols-2 gap-y-1 list-decimal pl-4">
            {[
              "Metrology capacity falls",
              "Queue risk increases",
              "RTD recommendations change",
              "AMHS congestion limits preferred route",
              "Vision drift increases quality risk",
              "Utility peak limits one recovery option",
              "Digital twin evaluates alternatives",
              "Balanced Recovery becomes preferred",
              "Three approvals requested",
              "Approved workflows simulated",
              "Outcomes verified",
              "Evidence recorded",
            ].map(t => <li key={t}>{t}</li>)}
          </ol>
        </div>
      </div>
    </SemiShell>
  );
}
