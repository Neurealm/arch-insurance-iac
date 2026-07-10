// DemoController — hidden drawer available only to Demo Controller and
// Platform Engineer roles. Provides deterministic control of the canonical
// scenario: navigate stages, toggle auto-play, switch role/mode, and inject
// controlled failures. There are no random timers or random outcomes.

import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Settings2, SkipForward } from "lucide-react";
import { useScenarioStore } from "@/runops/scenario/ScenarioStore";
import {
  failureInjectionKinds, failureInjectionLabels,
} from "@/runops/scenario/stageDefinitions";
import type { DemoRole } from "@/runops/data/scenario";
import type { Mode } from "@/runops/state/RunOpsProviders";

export function DemoControllerDrawer() {
  const s = useScenarioStore();
  const [open, setOpen] = useState(false);

  if (!s.canControl) return null;

  const next = s.stages[Math.min(s.stageIndex + 1, s.stages.length - 1)];
  const prev = s.stages[Math.max(s.stageIndex - 1, 0)];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open demo controller"
          className="fixed bottom-4 right-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-lg hover:bg-slate-50"
        >
          <Settings2 className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[380px] overflow-y-auto sm:max-w-[380px]">
        <SheetHeader>
          <SheetTitle className="text-base">Demo Controller</SheetTitle>
          <div className="text-xs text-slate-500">Scenario {s.scenarioId} · deterministic</div>
        </SheetHeader>

        {/* Current stage */}
        <section className="mt-4 rounded border border-slate-200 bg-slate-50 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Stage {s.stageIndex} / {s.stages.length - 1}
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{s.stage.label}</div>
          <div className="mt-1 text-xs text-slate-600">{s.stage.description}</div>
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Objects affected
            </div>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-700">
              {s.stage.objectsAffected.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Transitions */}
        <section className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded border border-slate-200 p-2">
            <div className="text-[10px] font-semibold uppercase text-slate-500">Previous</div>
            <div className="mt-1 text-slate-800">{s.stageIndex > 0 ? prev.label : "—"}</div>
          </div>
          <div className="rounded border border-slate-200 p-2">
            <div className="text-[10px] font-semibold uppercase text-slate-500">Next</div>
            <div className="mt-1 text-slate-800">
              {s.stageIndex < s.stages.length - 1 ? next.label : "—"}
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="mt-3 grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" onClick={s.back} disabled={s.stageIndex === 0}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={s.advance}
            disabled={s.stageIndex >= s.stages.length - 1}
          >
            Advance <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          {s.playState === "playing" ? (
            <Button size="sm" variant="outline" onClick={s.pause}>
              <Pause className="mr-1 h-4 w-4" /> Pause
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={s.playState === "paused" ? s.resume : s.start}>
              <Play className="mr-1 h-4 w-4" /> {s.playState === "paused" ? "Resume" : "Start"}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={s.reset}>
            <RotateCcw className="mr-1 h-4 w-4" /> Reset
          </Button>
          {s.autoPlay ? (
            <Button size="sm" variant="outline" className="col-span-2" onClick={s.stopAutoPlay}>
              <Pause className="mr-1 h-4 w-4" /> Stop auto-play
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="col-span-2" onClick={s.startAutoPlay}>
              <SkipForward className="mr-1 h-4 w-4" /> Auto-play
            </Button>
          )}
        </section>

        {/* Jump to stage */}
        <section className="mt-3">
          <Label className="text-[10px] font-semibold uppercase text-slate-500">Jump to stage</Label>
          <Select
            value={String(s.stageIndex)}
            onValueChange={(v) => s.jumpTo(Number(v))}
          >
            <SelectTrigger className="mt-1 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {s.stages.map((st) => (
                <SelectItem key={st.index} value={String(st.index)} className="text-xs">
                  {st.index}. {st.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {/* Role + mode */}
        <section className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] font-semibold uppercase text-slate-500">Role</Label>
            <Select value={s.role} onValueChange={(v) => s.switchRole(v as DemoRole)}>
              <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {s.roles.map((r) => (
                  <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] font-semibold uppercase text-slate-500">Mode</Label>
            <Select value={s.mode} onValueChange={(v) => s.switchMode(v as Mode)}>
              <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="demo" className="text-xs">Demo</SelectItem>
                <SelectItem value="connected" className="text-xs">Connected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Failure injections */}
        <section className="mt-3 rounded border border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Controlled failures
            </div>
            <button
              type="button"
              onClick={s.clearInjections}
              className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {failureInjectionKinds.map((k) => (
              <div key={k} className="flex items-center justify-between gap-2">
                <Label htmlFor={`inj-${k}`} className="text-xs text-slate-700">
                  {failureInjectionLabels[k]}
                </Label>
                <Switch
                  id={`inj-${k}`}
                  checked={s.injections[k]}
                  onCheckedChange={() => s.toggleInjection(k)}
                />
              </div>
            ))}
          </div>
        </section>
      </SheetContent>
    </Sheet>
  );
}
