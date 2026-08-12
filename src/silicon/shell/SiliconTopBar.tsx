// Top bar with scenario, persona, time, Reset Demo, and Ctrl+K hint.

import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { useSiliconStore } from "@/silicon/state/SiliconStore";
import { SCENARIOS } from "@/silicon/data/scenarios";
import { PERSONAS } from "@/silicon/data/personas";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const SiliconTopBar: React.FC = () => {
  const scenario = useSiliconStore(s => s.selectedScenarioId);
  const persona = useSiliconStore(s => s.selectedPersonaId);
  const setScenario = useSiliconStore(s => s.setScenario);
  const setPersona = useSiliconStore(s => s.setPersona);
  const setPalette = useSiliconStore(s => s.setPaletteOpen);
  const resetDemo = useSiliconStore(s => s.resetDemo);
  const time = useSiliconStore(s => s.selectedTime);

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-2">
      <div className="text-sm font-semibold text-slate-800">Silicon Verification Foundation</div>
      <TooltipProvider delayDuration={150}>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          {SCENARIOS.map(s => (
            <Tooltip key={s.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setScenario(s.id)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition ${scenario === s.id ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-white"}`}>
                  {s.label}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-xs">{s.description}<div className="mt-1 text-[10px] italic opacity-70">Selecting a scenario re-derives all visible data from the repository overlay. Canonical seed data is never mutated.</div></TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <label className="flex items-center gap-1 text-xs text-slate-600">
        <span>Persona</span>
        <select
          value={persona}
          onChange={e => setPersona(e.target.value as any)}
          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs">
          {PERSONAS.map(p => <option key={p.id} value={p.id}>{p.label} — {p.role}</option>)}
        </select>
      </label>

      <div className="text-xs tabular-nums text-slate-500">t = {time}</div>

      <button
        onClick={() => setPalette(true)}
        className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
        <Search className="h-3.5 w-3.5" />
        Search entities…
        <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </button>

      <button
        onClick={() => { if (confirm("Reset demo to defaults? Canonical data is preserved.")) resetDemo(); }}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
        <RotateCcw className="h-3.5 w-3.5" /> Reset Demo
      </button>
    </header>
  );
};
