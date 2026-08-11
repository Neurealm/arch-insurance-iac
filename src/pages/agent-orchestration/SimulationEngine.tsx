// Orchestration simulation: runs a failure or happy-path scenario step by step
// and shows state transitions, branch evaluation and policy decisions.

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { SIM_RUNS, SIM_SCENARIOS, type SimStep } from "./data";
import { Btn, Panel, StatePill } from "./parts";

const TONE_BORDER: Record<SimStep["tone"], string> = {
  ok: "border-l-emerald-500", warn: "border-l-amber-500", bad: "border-l-red-500",
};

export function SimulationEngine() {
  const [scenario, setScenario] = useState("happy");
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number>();

  const steps = SIM_RUNS[scenario] ?? [];

  useEffect(() => { setCursor(0); setPlaying(false); }, [scenario]);

  useEffect(() => {
    window.clearInterval(timer.current);
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setCursor((c) => {
        if (c >= steps.length) { setPlaying(false); return c; }
        return c + 1;
      });
    }, 900);
    return () => window.clearInterval(timer.current);
  }, [playing, steps.length]);

  const done = cursor >= steps.length;

  return (
    <Panel
      title="Orchestration Simulation"
      help="Simulation"
      subtitle="Run a scenario against the selected workflow definition. Simulation evaluates policy, branch, state and recovery behaviour without executing any tool against a production system."
      actions={
        <>
          <Btn onClick={() => { setCursor(0); setPlaying(false); }}><RotateCcw className="h-3.5 w-3.5" />Reset</Btn>
          <Btn onClick={() => setCursor((c) => Math.min(steps.length, c + 1))} disabled={done}><SkipForward className="h-3.5 w-3.5" />Step</Btn>
          <Btn variant="primary" onClick={() => (done ? (setCursor(0), setPlaying(true)) : setPlaying((p) => !p))}>
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? "Pause" : done ? "Run again" : "Run simulation"}
          </Btn>
        </>
      }
    >
      <div className="flex flex-wrap gap-1.5">
        {SIM_SCENARIOS.map((s) => (
          <button key={s.id} onClick={() => setScenario(s.id)} disabled={!SIM_RUNS[s.id]}
            className={cn("rounded-md border px-2.5 py-1 text-[11.5px] transition-colors",
              scenario === s.id ? "border-blue-400 bg-blue-50 font-medium text-blue-800" : "border-slate-200 text-slate-600 hover:bg-slate-50",
              !SIM_RUNS[s.id] && "cursor-not-allowed opacity-40")}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-[0.08em] text-slate-500">
              <th className="w-8 border-b border-slate-200 py-1.5">#</th>
              <th className="border-b border-slate-200 py-1.5">Step executed</th>
              <th className="border-b border-slate-200 py-1.5">Workflow state</th>
              <th className="border-b border-slate-200 py-1.5">Branch evaluation</th>
              <th className="border-b border-slate-200 py-1.5">Policy decision</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s, i) => {
              const revealed = i < cursor;
              return (
                <tr key={i} className={cn("align-top transition-opacity", revealed ? "opacity-100" : "opacity-25")}>
                  <td className={cn("border-b border-l-[3px] border-slate-100 py-1.5 pl-2 text-[11px] tabular-nums text-slate-500", revealed ? TONE_BORDER[s.tone] : "border-l-slate-200")}>{i + 1}</td>
                  <td className="border-b border-slate-100 py-1.5 pr-3 text-[12px] text-slate-800">{s.step}</td>
                  <td className="border-b border-slate-100 py-1.5 pr-3 font-mono text-[11px] text-slate-600">{s.state}</td>
                  <td className="border-b border-slate-100 py-1.5 pr-3 text-[11.5px] text-slate-600">{s.branch}</td>
                  <td className="border-b border-slate-100 py-1.5 pr-2 text-[11.5px] text-slate-600">{s.policy}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <StatePill tone={done ? (steps.some((s) => s.tone === "bad") ? "warn" : "ok") : "muted"}
          label={done ? (steps.some((s) => s.tone === "bad") ? "Completed with controlled failure handling" : "Completed successfully") : `Step ${cursor} of ${steps.length}`} />
        <span className="text-[11px] text-slate-500">
          Simulation never executes tools against production systems; tool steps are evaluated at the gateway in simulation mode.
        </span>
      </div>
    </Panel>
  );
}
