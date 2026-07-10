// ScenarioStore — the single, deterministic engine that drives the canonical
// Global Order Processing demonstration. Every page subscribes to the same
// scenario state through useScenarioStore(). All stage transitions route
// operational side effects through the existing OperationsProvider so that
// data changes propagate to every subscriber without a page refresh.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { scenarioStages, demoRoles, type DemoRole } from "@/runops/data/scenario";
import { useOperations, type Mode } from "@/runops/state/RunOpsProviders";
import {
  stageDescriptors,
  failureInjectionKinds,
  type FailureInjectionKind,
  type StageDescriptor,
} from "@/runops/scenario/stageDefinitions";

export type PlayState = "idle" | "playing" | "paused";

export interface ScenarioStoreState {
  scenarioId: "SCN-GOP-01";
  stageIndex: number;
  stage: StageDescriptor;
  stages: readonly StageDescriptor[];
  playState: PlayState;
  autoPlay: boolean;
  role: DemoRole;
  mode: Mode;
  injections: Record<FailureInjectionKind, boolean>;
  roles: readonly DemoRole[];
  isSimulation: boolean;
  canControl: boolean;
}

export interface ScenarioStoreApi {
  start(): void;
  pause(): void;
  resume(): void;
  advance(): void;
  back(): void;
  jumpTo(index: number): void;
  reset(): void;
  startAutoPlay(): void;
  stopAutoPlay(): void;
  switchRole(role: DemoRole): void;
  switchMode(mode: Mode): void;
  toggleInjection(kind: FailureInjectionKind): void;
  clearInjections(): void;
}

type Ctx = ScenarioStoreState & ScenarioStoreApi;

const ScenarioContext = createContext<Ctx | null>(null);

const BASELINE_STAGE = 5;
const AUTO_PLAY_INTERVAL_MS = 4000;

function makeEmptyInjections(): Record<FailureInjectionKind, boolean> {
  const out = {} as Record<FailureInjectionKind, boolean>;
  for (const k of failureInjectionKinds) out[k] = false;
  return out;
}

export function ScenarioStoreProvider({ children }: { children: React.ReactNode }) {
  const ops = useOperations();
  const {
    stageIndex,
    setStage,
    advanceStage,
    resetScenario,
    approveExecution,
    denyExecution,
    resolveIncident,
    role,
    setRole,
    mode,
    setMode,
  } = ops;

  const [playState, setPlayState] = useState<PlayState>("idle");
  const [autoPlay, setAutoPlay] = useState(false);
  const [injections, setInjections] = useState<Record<FailureInjectionKind, boolean>>(
    makeEmptyInjections,
  );

  // Apply per-stage side effects deterministically. `setStage` is idempotent
  // for the same target, so this only fires when the target actually changes.
  const applyStageEffects = useCallback(
    (target: number) => {
      // Approval + execution + incident lifecycle mirror the stage grid.
      if (target >= 10 && target < 15) {
        approveExecution("demo.controller");
      }
      if (target >= 15) {
        // Executes approve-then-resolve so downstream state is coherent.
        approveExecution("demo.controller");
        resolveIncident("demo.controller");
      }
      if (injections.approval_denied && target === 10) {
        denyExecution("demo.controller", "Injected: approval denied");
      }
    },
    [approveExecution, denyExecution, resolveIncident, injections.approval_denied],
  );

  const jumpTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(scenarioStages.length - 1, index));
      setStage(clamped);
      applyStageEffects(clamped);
    },
    [setStage, applyStageEffects],
  );

  const advance = useCallback(() => {
    const next = Math.min(stageIndex + 1, scenarioStages.length - 1);
    advanceStage();
    applyStageEffects(next);
  }, [stageIndex, advanceStage, applyStageEffects]);

  const back = useCallback(() => {
    const prev = Math.max(0, stageIndex - 1);
    setStage(prev);
  }, [stageIndex, setStage]);

  const reset = useCallback(() => {
    setPlayState("idle");
    setAutoPlay(false);
    setInjections(makeEmptyInjections());
    resetScenario();
  }, [resetScenario]);

  const start = useCallback(() => {
    setPlayState("playing");
    if (stageIndex < BASELINE_STAGE) jumpTo(BASELINE_STAGE);
  }, [stageIndex, jumpTo]);

  const pause = useCallback(() => {
    setPlayState("paused");
    setAutoPlay(false);
  }, []);

  const resume = useCallback(() => {
    setPlayState("playing");
  }, []);

  const startAutoPlay = useCallback(() => {
    setAutoPlay(true);
    setPlayState("playing");
  }, []);

  const stopAutoPlay = useCallback(() => {
    setAutoPlay(false);
  }, []);

  const switchRole = useCallback((r: DemoRole) => setRole(r), [setRole]);
  const switchMode = useCallback((m: Mode) => setMode(m), [setMode]);

  const toggleInjection = useCallback((kind: FailureInjectionKind) => {
    setInjections((prev) => ({ ...prev, [kind]: !prev[kind] }));
  }, []);
  const clearInjections = useCallback(() => setInjections(makeEmptyInjections()), []);

  // Auto-play driver. Fixed interval — not random. Stops at the terminal stage.
  const autoPlayRef = useRef<number | null>(null);
  useEffect(() => {
    if (autoPlayRef.current !== null) {
      window.clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
    if (!autoPlay) return;
    autoPlayRef.current = window.setInterval(() => {
      // Read latest stage via functional call
      if (stageIndex >= scenarioStages.length - 1) {
        setAutoPlay(false);
        return;
      }
      advance();
    }, AUTO_PLAY_INTERVAL_MS);
    return () => {
      if (autoPlayRef.current !== null) {
        window.clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [autoPlay, advance, stageIndex]);

  const stage = stageDescriptors[stageIndex] ?? stageDescriptors[0];
  const canControl = role === "Demo Controller" || role === "Platform Engineer";

  const value = useMemo<Ctx>(
    () => ({
      scenarioId: "SCN-GOP-01",
      stageIndex,
      stage,
      stages: stageDescriptors,
      playState,
      autoPlay,
      role,
      mode,
      injections,
      roles: demoRoles,
      isSimulation: mode === "demo",
      canControl,
      start,
      pause,
      resume,
      advance,
      back,
      jumpTo,
      reset,
      startAutoPlay,
      stopAutoPlay,
      switchRole,
      switchMode,
      toggleInjection,
      clearInjections,
    }),
    [
      stageIndex, stage, playState, autoPlay, role, mode, injections, canControl,
      start, pause, resume, advance, back, jumpTo, reset,
      startAutoPlay, stopAutoPlay, switchRole, switchMode, toggleInjection, clearInjections,
    ],
  );

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

export function useScenarioStore(): Ctx {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error("useScenarioStore must be used within ScenarioStoreProvider");
  return ctx;
}
