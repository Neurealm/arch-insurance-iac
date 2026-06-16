import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  GUIDED_INVESTIGATIONS,
  type GuidedInvestigation,
  type InvestigationStep,
  type StepStatus,
  getInvestigationForScenario,
} from "@/data/guidedInvestigations";

export type InvestigationStatus = "idle" | "active" | "paused" | "completed";

interface GuidedInvestigationContextValue {
  status: InvestigationStatus;
  investigation: GuidedInvestigation | null;
  currentStep: InvestigationStep | null;
  currentStepIndex: number;
  stepStatuses: StepStatus[];
  elapsedSeconds: number;

  canStart: boolean;
  scenarioId: string | null;

  start: (scenarioId: string) => void;
  exit: () => void;
  complete: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  restart: () => void;
  goTo: (index: number) => void;
  pause: () => void;
  resume: () => void;
}

const Ctx = createContext<GuidedInvestigationContextValue | null>(null);

export function GuidedInvestigationProvider({
  scenarioId,
  children,
}: {
  scenarioId: string | null;
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<InvestigationStatus>("idle");
  const [investigation, setInvestigation] = useState<GuidedInvestigation | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  const canStart = useMemo(() => !!getInvestigationForScenario(scenarioId ?? ""), [scenarioId]);

  // tick elapsed
  useEffect(() => {
    if (status !== "active") return;
    const t = window.setInterval(() => {
      if (startedAtRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, [status]);

  // if scenario changes while active, reset
  useEffect(() => {
    if (status === "idle") return;
    if (!investigation) return;
    if (investigation.scenarioId !== scenarioId) {
      // scenario changed → exit investigation gracefully
      setStatus("idle");
      setInvestigation(null);
      setStepStatuses([]);
      setCurrentStepIndex(0);
      setElapsedSeconds(0);
      startedAtRef.current = null;
    }
  }, [scenarioId, investigation, status]);

  const start = useCallback((sid: string) => {
    const inv = getInvestigationForScenario(sid);
    if (!inv) return;
    const statuses: StepStatus[] = inv.steps.map((_, i) => (i === 0 ? "active" : "not_started"));
    setInvestigation(inv);
    setStepStatuses(statuses);
    setCurrentStepIndex(0);
    setStatus("active");
    setElapsedSeconds(0);
    startedAtRef.current = Date.now();
  }, []);

  const exit = useCallback(() => {
    setStatus("idle");
    setInvestigation(null);
    setStepStatuses([]);
    setCurrentStepIndex(0);
    setElapsedSeconds(0);
    startedAtRef.current = null;
  }, []);

  const complete = useCallback(() => {
    setStepStatuses(prev => prev.map(s => (s === "active" || s === "not_started" ? "completed" : s)));
    setStatus("completed");
  }, []);

  const goTo = useCallback((index: number) => {
    if (!investigation) return;
    const max = investigation.steps.length - 1;
    const next = Math.max(0, Math.min(index, max));
    setCurrentStepIndex(next);
    setStepStatuses(prev => prev.map((s, i) => {
      if (i < next) return s === "skipped" ? "skipped" : "completed";
      if (i === next) return "active";
      return "not_started";
    }));
  }, [investigation]);

  const next = useCallback(() => {
    if (!investigation) return;
    if (currentStepIndex >= investigation.steps.length - 1) {
      complete();
      return;
    }
    goTo(currentStepIndex + 1);
  }, [investigation, currentStepIndex, goTo, complete]);

  const prev = useCallback(() => goTo(currentStepIndex - 1), [currentStepIndex, goTo]);

  const skip = useCallback(() => {
    if (!investigation) return;
    setStepStatuses(prev => prev.map((s, i) => (i === currentStepIndex ? "skipped" : s)));
    next();
  }, [investigation, currentStepIndex, next]);

  const restart = useCallback(() => {
    if (!investigation) return;
    start(investigation.scenarioId);
  }, [investigation, start]);

  const pause = useCallback(() => setStatus(s => (s === "active" ? "paused" : s)), []);
  const resume = useCallback(() => setStatus(s => (s === "paused" ? "active" : s)), []);

  const currentStep = investigation?.steps[currentStepIndex] ?? null;

  const value: GuidedInvestigationContextValue = {
    status,
    investigation,
    currentStep,
    currentStepIndex,
    stepStatuses,
    elapsedSeconds,
    canStart,
    scenarioId,
    start, exit, complete, next, prev, skip, restart, goTo, pause, resume,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGuidedInvestigation() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGuidedInvestigation must be used within GuidedInvestigationProvider");
  return ctx;
}
