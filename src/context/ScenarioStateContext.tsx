import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  SCENARIOS,
  DEFAULT_SCENARIO_ID,
  deriveTwinState,
  type Scenario,
  type DerivedTwinState,
  type ViewId,
} from "@/data/demoScenarios";

export type PlaybackState = "idle" | "playing" | "paused";
export type JumpTarget = "impact" | "rootCause" | "recommendation" | "approval" | "normal";

interface ScenarioContextValue {
  scenarios: Scenario[];
  activeScenario: Scenario;
  stepIndex: number;
  playback: PlaybackState;
  drawerOpen: boolean;
  selectedId: string | null;
  view: ViewId | "biz" | "tx";
  derived: DerivedTwinState;

  setActiveScenario: (id: string) => void;
  applyScenario: (id: string) => void;
  resetScenario: () => void;
  setStepIndex: (n: number) => void;
  next: () => void;
  prev: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  jumpTo: (target: JumpTarget) => void;

  setDrawerOpen: (b: boolean) => void;
  toggleDrawer: () => void;

  setSelectedId: (id: string | null) => void;
  setView: (v: ViewId | "biz" | "tx") => void;
}

const ScenarioStateContext = createContext<ScenarioContextValue | null>(null);

const findScenario = (id: string) => SCENARIOS.find(s => s.id === id) ?? SCENARIOS[0];

// Map free-text "jump" targets to step indices for the Payment Latency scenario;
// other scenarios fall back to closest match by step label.
function jumpToStep(scenario: Scenario, target: JumpTarget): number {
  if (target === "normal") return 0;
  const labels = scenario.playbackSteps.map(s => s.label.toLowerCase());
  const match = (re: RegExp) => labels.findIndex(l => re.test(l));
  switch (target) {
    case "impact":         return Math.max(match(/downstream|impact|latency|aurora|backlog|finding|variance|drain/), 0);
    case "rootCause":      return Math.max(match(/hypothesis|nova|correlation|saturation|recommend|action/), 0);
    case "recommendation": return Math.max(match(/decision|recommend|action|plan|rollback|scale/), 0);
    case "approval":       return Math.max(match(/approval|change|runbook/), 0);
    default:               return 0;
  }
}

export function ScenarioStateProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string>(DEFAULT_SCENARIO_ID);
  const [stepIndex, setStepIndexState] = useState(0);
  const [playback, setPlayback] = useState<PlaybackState>("idle");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedIdState] = useState<string | null>(findScenario(DEFAULT_SCENARIO_ID).activeSelection);
  const [view, setViewState] = useState<ViewId | "biz" | "tx">(findScenario(DEFAULT_SCENARIO_ID).primaryView);

  const activeScenario = useMemo(() => findScenario(activeId), [activeId]);
  const derived = useMemo(() => deriveTwinState(activeScenario, stepIndex), [activeScenario, stepIndex]);

  // Auto playback advances stepIndex while "playing"
  const tickRef = useRef<number | null>(null);
  useEffect(() => {
    if (playback !== "playing") {
      if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
      return;
    }
    tickRef.current = window.setInterval(() => {
      setStepIndexState(prev => {
        const max = activeScenario.playbackSteps.length - 1;
        if (prev >= max) {
          setPlayback("paused");
          return prev;
        }
        return prev + 1;
      });
    }, 2200);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, [playback, activeScenario]);

  // When the playback step changes, sync selection + view if the step opinions on them
  useEffect(() => {
    const step = activeScenario.playbackSteps[stepIndex];
    if (!step) return;
    if (step.selectId !== undefined) setSelectedIdState(step.selectId);
    if (step.view) setViewState(step.view);
  }, [stepIndex, activeScenario]);

  const setActiveScenario = useCallback((id: string) => {
    const next = findScenario(id);
    setActiveId(id);
    setStepIndexState(0);
    setPlayback("idle");
    setSelectedIdState(next.activeSelection);
    setViewState(next.primaryView);
  }, []);

  const applyScenario = setActiveScenario;

  const resetScenario = useCallback(() => {
    setStepIndexState(0);
    setPlayback("idle");
    setSelectedIdState(activeScenario.activeSelection);
    setViewState(activeScenario.primaryView);
  }, [activeScenario]);

  const setStepIndex = useCallback((n: number) => {
    const max = activeScenario.playbackSteps.length - 1;
    setStepIndexState(Math.max(0, Math.min(n, max)));
  }, [activeScenario]);

  const next = useCallback(() => setStepIndex(stepIndex + 1), [stepIndex, setStepIndex]);
  const prev = useCallback(() => setStepIndex(stepIndex - 1), [stepIndex, setStepIndex]);
  const play = useCallback(() => setPlayback("playing"), []);
  const pause = useCallback(() => setPlayback("paused"), []);
  const reset = resetScenario;
  const jumpTo = useCallback((t: JumpTarget) => {
    if (t === "normal") { setActiveScenario("normal-ops"); return; }
    setStepIndex(jumpToStep(activeScenario, t));
  }, [activeScenario, setActiveScenario, setStepIndex]);

  const setSelectedId = useCallback((id: string | null) => setSelectedIdState(id), []);
  const setView = useCallback((v: ViewId | "biz" | "tx") => setViewState(v), []);
  const toggleDrawer = useCallback(() => setDrawerOpen(v => !v), []);

  const value: ScenarioContextValue = {
    scenarios: SCENARIOS,
    activeScenario,
    stepIndex,
    playback,
    drawerOpen,
    selectedId,
    view,
    derived,
    setActiveScenario, applyScenario, resetScenario,
    setStepIndex, next, prev, play, pause, reset, jumpTo,
    setDrawerOpen, toggleDrawer,
    setSelectedId, setView,
  };

  return <ScenarioStateContext.Provider value={value}>{children}</ScenarioStateContext.Provider>;
}

export function useScenarioState(): ScenarioContextValue {
  const ctx = useContext(ScenarioStateContext);
  if (!ctx) throw new Error("useScenarioState must be used within ScenarioStateProvider");
  return ctx;
}
