import { useState } from "react";
import { SemiShell } from "../../features/semiconductor/components/SemiShell";
import { KpiRibbon, CandidateCompare } from "../../features/semiconductor/components/KpiRibbon";
import { FactoryMap } from "../../features/semiconductor/components/FactoryMap";
import { useScenario } from "../../features/semiconductor/state/ScenarioContext";
import { AlertTriangle, Play, CheckCircle2, XCircle, FlaskConical, Activity, Workflow, Zap, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const DISRUPTIONS = [
  { id: "d1", icon: AlertTriangle, tone: "crit", area: "Metrology", title: "MET 041 optical stage calibration fault", meta: "Owner: Quality Eng · ETA 2.5h · 37 lots in window" },
  { id: "d2", icon: Workflow, tone: "warn", area: "AMHS", title: "Bay 3 route congestion — stocker maintenance", meta: "Owner: Material Logistics · ETA 1.2h · +14m transport" },
  { id: "d3", icon: Eye, tone: "warn", area: "Vision", title: "VSN 4.8 drift on 12 endpoints", meta: "Owner: Quality Eng · canary ready · FR +1.7 pp" },
  { id: "d4", icon: Zap, tone: "warn", area: "Utilities", title: "Forecast peak 74.8 MW at 15:30", meta: "Owner: Facilities · envelope 71.0 MW" },
  { id: "d5", icon: Activity, tone: "warn", area: "Priority Lots", title: "12 priority lots at completion risk", meta: "Owner: Production Control" },
] as const;

const SIMS = [
  { id: "s1", title: "MET Capacity Recovery", state: "Running", progress: 68, kpi: "−31% queue est." },
  { id: "s2", title: "Bay 3 Alternate Route", state: "Completed", progress: 100, kpi: "−31% transport queue" },
  { id: "s3", title: "Utility Load Shift", state: "Queued", progress: 0, kpi: "Pending compute" },
  { id: "s4", title: "Balanced Recovery Scenario", state: "Ready for review", progress: 100, kpi: "OTD 92.8%" },
];

const AGENDA = [
  ["0–10", "Command Center & goals"],
  ["10–25", "Current architecture & constraints"],
  ["25–45", "Factory Digital Twin"],
  ["45–70", "Production Flow & Dispatch"],
  ["70–85", "Physical Automation & Vision"],
  ["85–105", "Operations Intelligence & Utilities"],
  ["105–115", "Opportunity Prioritization"],
  ["115–120", "Proof of Value & next action"],
];

export default function SemiCommandCenter() {
  const s = useScenario();
  const [guided, setGuided] = useState(false);

  function startGuided() {
    setGuided(true);
    s.setScenario("compound");
    s.pushTimeline({ domain: "Simulation", title: "Guided Compound Scenario started", severity: "info", entity: "Workshop", status: "Running" });
  }

  return (
    <SemiShell>
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Enterprise Semiconductor Operations Command Center</h1>
            <p className="text-sm text-muted-foreground">North Texas Reference Fab 01 · 300 mm analog & embedded · synthetic workshop environment</p>
          </div>
          <button
            onClick={startGuided}
            className="h-9 px-4 rounded-md bg-indigo text-white text-sm font-semibold hover:bg-indigo/90 inline-flex items-center gap-2"
          >
            <Play className="h-4 w-4" /> Start Guided Compound Scenario
          </button>
        </div>

        <KpiRibbon />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <FactoryMap />

            <section className="rounded-lg border border-border bg-card">
              <Header title="Operations Intelligence Recommendations" right={<span className="text-[11px] text-amber-700">{s.recommendations.filter(r => r.status === "Pending").length} pending approval</span>} />
              <div className="divide-y divide-border">
                {s.recommendations.map((r) => (
                  <div key={r.id} className="px-3 py-2.5 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{r.title}</div>
                      <div className="text-xs text-muted-foreground">{r.detail}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
                        <span className="text-emerald-700 font-medium">{r.expected}</span>
                        <span className="text-muted-foreground">Confidence {r.confidence}%</span>
                        <span className="text-muted-foreground">Approver: {r.approver}</span>
                        <StatusChip status={r.status} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => s.updateRecommendation(r.id, "Simulating")}
                        className="h-7 px-2 text-xs rounded border border-border bg-background hover:bg-accent inline-flex items-center gap-1">
                        <FlaskConical className="h-3.5 w-3.5" /> Simulate
                      </button>
                      <button onClick={() => s.updateRecommendation(r.id, "Approved")}
                        className="h-7 px-2 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button onClick={() => s.updateRecommendation(r.id, "Rejected")}
                        className="h-7 px-2 text-xs rounded border border-border bg-background hover:bg-accent inline-flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-3">
              <div className="text-sm font-semibold mb-2">Candidate Recovery — choose & apply</div>
              <CandidateCompare />
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-lg border border-border bg-card">
              <Header title="Current Disruptions" right={<span className="text-[11px] text-red-700">{DISRUPTIONS.length} active</span>} />
              <ul className="divide-y divide-border">
                {DISRUPTIONS.map((d) => (
                  <li key={d.id} className="px-3 py-2 flex gap-3 items-start">
                    <d.icon className={cn(
                      "h-4 w-4 mt-0.5 shrink-0",
                      d.tone === "crit" ? "text-red-600" : "text-amber-600"
                    )} />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-muted-foreground">{d.area}</div>
                      <div className="text-sm leading-tight">{d.title}</div>
                      <div className="text-[11px] text-muted-foreground">{d.meta}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-border bg-card">
              <Header title="Active Simulations" />
              <ul className="divide-y divide-border">
                {SIMS.map((sim) => (
                  <li key={sim.id} className="px-3 py-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{sim.title}</span>
                      <span className="text-[11px] text-muted-foreground">{sim.state}</span>
                    </div>
                    <div className="mt-1 h-1.5 bg-slate-100 rounded overflow-hidden">
                      <div className={cn(
                        "h-full",
                        sim.progress === 100 ? "bg-emerald-500" : sim.progress > 0 ? "bg-indigo" : "bg-slate-300"
                      )} style={{ width: `${sim.progress}%` }} />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{sim.kpi}</div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-border bg-card">
              <Header title="Workshop Agenda" right={<span className="text-[11px] text-muted-foreground">{s.workshopMode}</span>} />
              <ol className="px-3 py-2 space-y-1 text-xs">
                {AGENDA.map(([time, label], i) => (
                  <li key={i} className={cn("flex justify-between gap-3 py-0.5", guided && i === 0 && "text-indigo font-semibold")}>
                    <span className="text-muted-foreground tabular-nums w-12">{time}</span>
                    <span className="flex-1">{label}</span>
                  </li>
                ))}
              </ol>
              <div className="px-3 py-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <Link to="/semiconductor/digital-twin" className="text-indigo hover:underline">Jump to Digital Twin →</Link>
                <Link to="/semiconductor/proof-of-value" className="text-indigo hover:underline">Skip to PoV →</Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </SemiShell>
  );
}

function Header({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="px-3 py-2 border-b border-border flex items-center justify-between">
      <span className="text-sm font-semibold">{title}</span>
      {right}
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const tone =
    status === "Approved" ? "bg-emerald-50 text-emerald-700"
    : status === "Rejected" ? "bg-red-50 text-red-700"
    : status === "Simulating" ? "bg-blue-50 text-blue-700"
    : "bg-amber-50 text-amber-800";
  return <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", tone)}>{status}</span>;
}
