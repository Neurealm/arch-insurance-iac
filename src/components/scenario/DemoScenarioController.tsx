import { useScenarioState, type JumpTarget } from "@/context/ScenarioStateContext";
import { STATUS_TONE, type Scenario, type ScenarioStatus } from "@/data/demoScenarios";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight, Play, Pause, SkipForward, SkipBack, RefreshCw, Layers,
  Target, AlertOctagon, Sparkles, CheckCircle2, X, Clock, Gauge,
} from "lucide-react";

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-slate-500">{children}</div>
);

const StatusDot = ({ s }: { s: ScenarioStatus }) => (
  <span className={cn("inline-block h-2 w-2 rounded-full", STATUS_TONE[s].dot)} />
);

/* ------------------------------------------------------------------ */
/* DEMO SCENARIO CONTROLLER (floating collapsed control)               */
/* ------------------------------------------------------------------ */
export function DemoScenarioController() {
  const { activeScenario, stepIndex, toggleDrawer } = useScenarioState();
  const tone = STATUS_TONE[activeScenario.status];
  const total = activeScenario.playbackSteps.length;
  return (
    <button
      onClick={toggleDrawer}
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/85 backdrop-blur",
        "px-3 py-2 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)]",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-14px_rgba(15,23,42,0.25)]",
      )}
    >
      <span className={cn("grid h-8 w-8 place-items-center rounded-lg", tone.soft)}>
        <span className={cn("inline-block h-2.5 w-2.5 rounded-full animate-pulse", tone.dot)} />
      </span>
      <div className="text-left">
        <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-wide text-slate-500">
          Demo Mode <span className="text-slate-300">·</span>
          <span className={cn("rounded-full border px-1.5 py-0 text-[9.5px]", tone.chip)}>{tone.label}</span>
        </div>
        <div className="text-[12.5px] font-semibold text-slate-900 leading-tight">{activeScenario.name}</div>
      </div>
      <div className="hidden sm:flex flex-col items-end pl-2 border-l border-slate-200/70">
        <div className="text-[9.5px] uppercase tracking-wide text-slate-500">Step</div>
        <div className="text-[12px] font-semibold tabular-nums text-slate-800">{stepIndex + 1} <span className="text-slate-400">/ {total}</span></div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* SCENARIO CARD                                                       */
/* ------------------------------------------------------------------ */
function ScenarioCard({ scenario, active, onSelect }: { scenario: Scenario; active: boolean; onSelect: () => void }) {
  const tone = STATUS_TONE[scenario.status];
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border bg-white p-3 text-left transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        active
          ? "border-sky-300 ring-2 ring-sky-200/60 bg-sky-50/40"
          : "border-slate-200/70",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <StatusDot s={scenario.status} />
            <span className="truncate text-[12.5px] font-semibold text-slate-900">{scenario.name}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600 leading-snug line-clamp-2">{scenario.demoPurpose}</p>
        </div>
        <span className={cn("shrink-0 rounded-full border px-1.5 py-0 text-[10px] font-medium", tone.chip)}>{tone.label}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5">{scenario.primaryImpactedService ?? "All services"}</span>
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5">{scenario.recommendedLens}</span>
        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5"><Clock className="h-2.5 w-2.5" />{scenario.estimatedDuration}</span>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* PLAYBACK CONTROLS                                                   */
/* ------------------------------------------------------------------ */
export function ScenarioPlaybackControls() {
  const { stepIndex, activeScenario, playback, next, prev, play, pause, reset, jumpTo } = useScenarioState();
  const max = activeScenario.playbackSteps.length;
  const jumpButtons: { label: string; t: JumpTarget }[] = [
    { label: "Impact",         t: "impact" },
    { label: "Root cause",     t: "rootCause" },
    { label: "Recommendation", t: "recommendation" },
    { label: "Approval",       t: "approval" },
    { label: "Return to normal", t: "normal" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        {playback === "playing" ? (
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={pause}><Pause className="mr-1 h-3 w-3" />Pause</Button>
        ) : (
          <Button size="sm" className="h-7 text-[11px]" onClick={play}><Play className="mr-1 h-3 w-3" />Start Demo</Button>
        )}
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={prev} disabled={stepIndex === 0}><SkipBack className="mr-1 h-3 w-3" />Prev</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={next} disabled={stepIndex >= max - 1}><SkipForward className="mr-1 h-3 w-3" />Next</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={reset}><RefreshCw className="mr-1 h-3 w-3" />Reset</Button>
        <span className="ml-auto text-[10.5px] text-slate-500 tabular-nums">Step {stepIndex + 1} / {max}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {jumpButtons.map(j => (
          <button key={j.t} onClick={() => jumpTo(j.t)}
            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] text-slate-600 hover:bg-slate-50">
            Jump · {j.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* STEP TIMELINE                                                       */
/* ------------------------------------------------------------------ */
export function ScenarioStepTimeline() {
  const { activeScenario, stepIndex, setStepIndex } = useScenarioState();
  return (
    <ol className="space-y-1.5">
      {activeScenario.playbackSteps.map((step, i) => {
        const active = i === stepIndex;
        const done = i < stepIndex;
        return (
          <li key={i}>
            <button
              onClick={() => setStepIndex(i)}
              className={cn(
                "flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition",
                active ? "border-sky-300 bg-sky-50/60" : done ? "border-slate-200 bg-white" : "border-slate-200/70 bg-white hover:bg-slate-50",
              )}
            >
              <span className={cn(
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
                active ? "bg-sky-500 text-white" : done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500",
              )}>
                {done ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] font-medium text-slate-800">{step.label}</div>
                {step.description && <div className="text-[10.5px] text-slate-500 leading-snug">{step.description}</div>}
              </div>
              {step.timelineCursor && <span className="text-[10px] tabular-nums text-slate-400">{step.timelineCursor}</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* IMPACT SUMMARY                                                      */
/* ------------------------------------------------------------------ */
export function ScenarioImpactSummary() {
  const { activeScenario } = useScenarioState();
  if (!activeScenario.impactSummary.length) return null;
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {activeScenario.impactSummary.map(item => (
        <div key={item.label} className="rounded-lg border border-slate-200/70 bg-white p-2">
          <div className="text-[9.5px] uppercase tracking-wide text-slate-500">{item.label}</div>
          <div className="mt-0.5 text-[12.5px] font-semibold tabular-nums text-slate-900">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BEFORE / AFTER PANEL                                                */
/* ------------------------------------------------------------------ */
export function BeforeAfterPanel() {
  const { activeScenario } = useScenarioState();
  if (!activeScenario.beforeAndAfterMetrics.length) return null;
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-3">
      <div className="mb-2 flex items-center justify-between text-[10.5px]">
        <span className="font-semibold text-slate-700">Current</span>
        <span className="font-semibold text-emerald-700">After remediation</span>
      </div>
      <div className="space-y-1">
        {activeScenario.beforeAndAfterMetrics.map(m => (
          <div key={m.label} className="grid grid-cols-12 items-center gap-2 rounded-md border border-slate-100 bg-slate-50/60 px-2 py-1.5">
            <div className="col-span-4 text-[11px] text-slate-500">{m.label}</div>
            <div className="col-span-3 text-right text-[11.5px] font-semibold tabular-nums text-slate-900">{m.before}</div>
            <ChevronRight className="col-span-1 mx-auto h-3 w-3 text-slate-400" />
            <div className="col-span-4 text-right text-[11.5px] font-semibold tabular-nums text-emerald-700">{m.after}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SCENARIO DRAWER                                                     */
/* ------------------------------------------------------------------ */
export function ScenarioDrawer() {
  const { scenarios, activeScenario, drawerOpen, setDrawerOpen, applyScenario, resetScenario } = useScenarioState();
  const tone = STATUS_TONE[activeScenario.status];

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="right" className="w-[480px] sm:w-[520px] p-0 bg-gradient-to-b from-white to-slate-50">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-200/70">
          <SheetTitle className="flex items-center gap-2 text-[15px]">
            <span className={cn("grid h-7 w-7 place-items-center rounded-lg", tone.soft)}>
              <Sparkles className={cn("h-3.5 w-3.5", tone.text)} />
            </span>
            Demo Scenario Controller
          </SheetTitle>
          <div className="mt-1 flex items-center gap-2 text-[11.5px] text-slate-600">
            <span className="font-medium text-slate-800">{activeScenario.name}</span>
            <span className={cn("rounded-full border px-1.5 py-0 text-[10px]", tone.chip)}>{tone.label}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{activeScenario.estimatedDuration}</span>
          </div>
        </SheetHeader>

        <Tabs defaultValue="library" className="flex h-[calc(100vh-110px)] flex-col">
          <TabsList className="mx-5 mt-3 grid grid-cols-4 bg-slate-100/80">
            <TabsTrigger value="library" className="text-[11px]">Library</TabsTrigger>
            <TabsTrigger value="current" className="text-[11px]">Current</TabsTrigger>
            <TabsTrigger value="playback" className="text-[11px]">Playback</TabsTrigger>
            <TabsTrigger value="impact" className="text-[11px]">Impact</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-5 py-3">
            <TabsContent value="library" className="mt-0 space-y-2">
              {scenarios.map(s => (
                <ScenarioCard key={s.id} scenario={s} active={s.id === activeScenario.id} onSelect={() => applyScenario(s.id)} />
              ))}
            </TabsContent>

            <TabsContent value="current" className="mt-0 space-y-3">
              <div className="rounded-xl border border-slate-200/70 bg-white p-3">
                <Label>Demo purpose</Label>
                <p className="mt-1 text-[12px] text-slate-700 leading-relaxed">{activeScenario.demoPurpose}</p>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10.5px]">
                  <div className="rounded-md bg-slate-50 p-2">
                    <div className="text-slate-500">Primary view</div>
                    <div className="font-semibold text-slate-800">{activeScenario.recommendedLens}</div>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <div className="text-slate-500">Impacted service</div>
                    <div className="font-semibold text-slate-800">{activeScenario.primaryImpactedService ?? "None"}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-white p-3">
                <Label>Impacted layers</Label>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {(activeScenario.impactedLayers.length ? activeScenario.impactedLayers : ["None"]).map(l => (
                    <Badge key={l} variant="outline" className="text-[10px]">{l}</Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-white p-3">
                <Label>Talking points</Label>
                <ul className="mt-1.5 list-disc pl-4 text-[11.5px] text-slate-700 space-y-1">
                  {activeScenario.talkingPoints.map(t => <li key={t}>{t}</li>)}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-white p-3">
                <Label>NOVA recommended action</Label>
                <div className="mt-1.5 text-[12px] font-medium text-slate-900">{activeScenario.novaResponse.recommended.title}</div>
                <div className="mt-1 flex gap-1.5">
                  <Badge variant="outline" className="text-[10px]">Conf {activeScenario.novaResponse.recommended.confidence}%</Badge>
                  <Badge variant="outline" className="text-[10px]">Risk {activeScenario.novaResponse.recommended.risk}</Badge>
                  <Badge variant="outline" className="text-[10px]">Approval {activeScenario.novaResponse.recommended.approval}</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="playback" className="mt-0 space-y-3">
              <ScenarioPlaybackControls />
              <ScenarioStepTimeline />
            </TabsContent>

            <TabsContent value="impact" className="mt-0 space-y-3">
              <div>
                <Label>Impact summary</Label>
                <div className="mt-1.5"><ScenarioImpactSummary /></div>
              </div>
              <div>
                <Label>Before / after remediation</Label>
                <div className="mt-1.5"><BeforeAfterPanel /></div>
              </div>
            </TabsContent>
          </div>

          <div className="flex items-center gap-2 border-t border-slate-200/70 px-5 py-3">
            <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={resetScenario}>
              <RefreshCw className="mr-1 h-3 w-3" /> Reset
            </Button>
            <Button size="sm" className="h-8 text-[11.5px] ml-auto" onClick={() => setDrawerOpen(false)}>
              <CheckCircle2 className="mr-1 h-3 w-3" /> Apply &amp; Close
            </Button>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
