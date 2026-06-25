import { useState } from "react";
import { SemiShell } from "../../features/semiconductor/components/SemiShell";
import { FactoryMap } from "../../features/semiconductor/components/FactoryMap";
import { KpiRibbon, CandidateCompare } from "../../features/semiconductor/components/KpiRibbon";
import { useScenario, CANDIDATES } from "../../features/semiconductor/state/ScenarioContext";
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react";

export default function DigitalTwin() {
  const s = useScenario();
  const [speed, setSpeed] = useState(1);
  const [layer, setLayer] = useState("flow");

  return (
    <SemiShell>
      <div className="p-4 lg:p-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold">Factory Digital Twin & Simulation Studio</h1>
          <p className="text-sm text-muted-foreground">Representative simulation output, not a live production model.</p>
        </header>

        <KpiRibbon />

        <div className="grid xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-3">
            <FactoryMap />
            <div className="rounded-lg border border-border bg-card p-3 flex flex-wrap items-center gap-2 text-xs">
              <button className="h-7 w-7 rounded border border-border bg-background inline-grid place-items-center"><ChevronLeft className="h-3.5 w-3.5" /></button>
              <button onClick={() => s.setPaused(!s.paused)} className="h-7 w-7 rounded border border-border bg-background inline-grid place-items-center">
                {s.paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
              <button className="h-7 w-7 rounded border border-border bg-background inline-grid place-items-center"><ChevronRight className="h-3.5 w-3.5" /></button>
              <button onClick={s.reset} className="h-7 px-2 rounded border border-border bg-background inline-flex items-center gap-1"><RotateCcw className="h-3.5 w-3.5" />Restart</button>
              <div className="h-5 w-px bg-border mx-1" />
              {[0.5, 1, 2, 4].map((v) => (
                <button key={v} onClick={() => setSpeed(v)} className={`h-7 px-2 rounded border ${speed === v ? "border-indigo bg-indigo text-white" : "border-border bg-background"}`}>{v}×</button>
              ))}
              <div className="h-5 w-px bg-border mx-1" />
              <span className="text-muted-foreground">Layer:</span>
              {["flow", "material", "sensors", "robotics", "utilities", "risk", "agents"].map((l) => (
                <button key={l} onClick={() => setLayer(l)} className={`h-7 px-2 rounded border capitalize ${layer === l ? "border-indigo bg-indigo text-white" : "border-border bg-background"}`}>{l}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Panel title="Scenario Event Timeline">
              <ol className="text-xs space-y-1.5">
                {[
                  ["13:42", "MET 041 calibration fault"],
                  ["13:46", "Bay 3 AMHS congestion"],
                  ["13:51", "VSN 4.8 drift"],
                  ["13:54", "Utility peak forecast"],
                  ["14:02", "Balanced Recovery generated"],
                ].map(([t, l]) => (
                  <li key={t} className="flex gap-2"><span className="text-muted-foreground tabular-nums w-12">{t}</span><span>{l}</span></li>
                ))}
              </ol>
            </Panel>

            <Panel title="Outcome Comparison — Baseline vs Candidate">
              <CandidateCompare />
            </Panel>

            <Panel title="Simulation Assumptions">
              <ul className="text-[11.5px] space-y-0.5 text-muted-foreground">
                <li>Tool availability sampled from current state</li>
                <li>Lot arrival profile: rolling 24h</li>
                <li>Max queue times preserved per recipe family</li>
                <li>Human approval required for all candidate apply</li>
                <li>Utility envelope: 71.0 MW peak</li>
              </ul>
            </Panel>

            <Panel title="Architecture compatibility">
              <p className="text-[11.5px] text-muted-foreground">
                Can integrate with industrial simulation environments, including OpenUSD and Isaac Sim based workflows, when validated for the engagement.
              </p>
            </Panel>
          </div>
        </div>
      </div>
    </SemiShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-3 py-2 border-b border-border text-sm font-semibold">{title}</div>
      <div className="p-3">{children}</div>
    </div>
  );
}
