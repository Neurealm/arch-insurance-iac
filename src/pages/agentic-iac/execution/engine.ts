import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STEPS, EXEC_PACKAGE, PREFLIGHT_CHECKS } from "./data";

export type ExecutionStatus =
  | "ready" | "running" | "pause_requested" | "paused" | "halted" | "failed" | "execution_complete";

export type StepStatus = "waiting" | "running" | "passed" | "warning" | "failed" | "blocked";

export type ExecutionScenario =
  | "success" | "sql_backup_failure" | "log_backup_persists" | "ebs_delay"
  | "windows_extension_failure" | "application_validation_failure";

export type EventSeverity = "INFO" | "ACTION" | "PASS" | "WARNING" | "FAIL" | "GATE" | "AUTHORIZATION";

export type ExecutionEvent = {
  id: number;
  t: string;
  step: number;
  severity: EventSeverity;
  message: string;
};

export type StepState = {
  id: number;
  status: StepStatus;
  gateStatus: StepStatus;
  progress: number;
  startedAt?: string;
  completedAt?: string;
  note?: string;
};

type Milestone = { at: number; sev: EventSeverity; msg: string };

const BASE_CLOCK = new Date();
BASE_CLOCK.setHours(12, 41, 0, 0);

function stamp(simSeconds: number) {
  const d = new Date(BASE_CLOCK.getTime() + simSeconds * 1000);
  return d.toTimeString().slice(0, 8);
}

export function fmtDuration(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
}

/** Deterministic per-step narration. Milestones are workflow decisions, not noise. */
function milestonesFor(stepId: number, scenario: ExecutionScenario): Milestone[] {
  switch (stepId) {
    case 1:
      return [
        { at: 0.02, sev: "AUTHORIZATION", msg: `Execution authorization ${EXEC_PACKAGE.authorization} validated` },
        { at: 0.08, sev: "AUTHORIZATION", msg: "Package signature verified" },
        { at: 0.14, sev: "INFO", msg: `Package ${EXEC_PACKAGE.packageId} v${EXEC_PACKAGE.packageVersion} locked (immutable)` },
        { at: 0.2, sev: "ACTION", msg: "Preflight started" },
        { at: 0.4, sev: "PASS", msg: "SQL-PROD-07 health PASSED" },
        { at: 0.52, sev: "PASS", msg: "OrdersDB state ONLINE PASSED" },
        { at: 0.64, sev: "PASS", msg: "Windows system health PASSED" },
        { at: 0.76, sev: "PASS", msg: "AWS EBS eligibility PASSED" },
        { at: 0.86, sev: "PASS", msg: "IAM permissions and Terraform state PASSED" },
      ];
    case 2:
      return [
        { at: 0.05, sev: "ACTION", msg: "Transaction-log backup started (T-SQL, OrdersDB)" },
        { at: 0.35, sev: "INFO", msg: "Backup streaming to approved destination" },
        ...(scenario === "sql_backup_failure"
          ? [{ at: 0.7, sev: "FAIL" as EventSeverity, msg: "BACKUP FAILED — backup destination temporarily unavailable" }]
          : [
              { at: 0.72, sev: "PASS" as EventSeverity, msg: "Transaction-log backup completed" },
              { at: 0.85, sev: "PASS" as EventSeverity, msg: "Backup checksum PASSED" },
            ]),
      ];
    case 3:
      return [
        { at: 0.1, sev: "ACTION", msg: "Log reuse validation started — re-querying sys.databases" },
        ...(scenario === "log_backup_persists"
          ? [{ at: 0.7, sev: "FAIL" as EventSeverity, msg: "log_reuse_wait_desc still reports LOG_BACKUP" }]
          : [{ at: 0.7, sev: "PASS" as EventSeverity, msg: "LOG_BACKUP cleared — log reuse available" }]),
      ];
    case 4:
      return [
        { at: 0.04, sev: "PASS", msg: "Terraform plan verified — 0 add, 1 change, 0 destroy" },
        { at: 0.1, sev: "ACTION", msg: "Applying EBS modification via AWS Provider" },
        { at: 0.18, sev: "PASS", msg: "AWS ModifyVolume accepted (vol-0a81f2c4e7b9d1234)" },
        { at: 0.24, sev: "INFO", msg: "Volume state: modifying" },
        { at: 0.55, sev: "INFO", msg: "Volume state: optimizing" },
        ...(scenario === "ebs_delay"
          ? [{ at: 0.72, sev: "WARNING" as EventSeverity, msg: "Expected optimization transition window exceeded — continuing to monitor" }]
          : []),
        { at: 0.9, sev: "PASS", msg: "Volume capacity 750 GB available to instance" },
      ];
    case 5:
      return [
        { at: 0.1, sev: "ACTION", msg: "Windows storage cache refreshed (PowerShell)" },
        { at: 0.35, sev: "INFO", msg: "New capacity detected on disk backing L:" },
        ...(scenario === "windows_extension_failure"
          ? [{ at: 0.72, sev: "FAIL" as EventSeverity, msg: "NTFS extension failed — L: remains 500 GB. EBS retained at 750 GB (no shrink attempted)" }]
          : [
              { at: 0.55, sev: "ACTION" as EventSeverity, msg: "NTFS extension started" },
              { at: 0.85, sev: "PASS" as EventSeverity, msg: "NTFS extension complete — L: 750 GB" },
            ]),
      ];
    case 6:
      return [
        { at: 0.1, sev: "ACTION", msg: "SQL validation started" },
        { at: 0.4, sev: "PASS", msg: "Database read test PASSED" },
        { at: 0.62, sev: "PASS", msg: "Database write test PASSED" },
        { at: 0.85, sev: "PASS", msg: "Log reuse available, backup current, blocking normal" },
      ];
    case 7:
      return [
        { at: 0.1, sev: "ACTION", msg: "Application synthetic test started (Order Processing Service)" },
        { at: 0.35, sev: "PASS", msg: "Health endpoint PASSED" },
        { at: 0.5, sev: "PASS", msg: "Database connectivity PASSED" },
        ...(scenario === "application_validation_failure"
          ? [{ at: 0.75, sev: "FAIL" as EventSeverity, msg: "Synthetic order transaction FAILED — infrastructure change succeeded, business service validation failed" }]
          : [
              { at: 0.75, sev: "PASS" as EventSeverity, msg: "Synthetic order transaction PASSED" },
              { at: 0.88, sev: "PASS" as EventSeverity, msg: "Latency and error rate within baseline" },
            ]),
      ];
    default:
      return [
        { at: 0.1, sev: "ACTION", msg: "Evidence collection started" },
        { at: 0.5, sev: "INFO", msg: "SQL, AWS, Windows and application evidence reconciled" },
        { at: 0.8, sev: "PASS", msg: "evidence-manifest.json generated" },
        { at: 0.92, sev: "PASS", msg: "Asset Digital Twin reconciled" },
      ];
  }
}

function stepFails(stepId: number, scenario: ExecutionScenario) {
  return (
    (stepId === 2 && scenario === "sql_backup_failure") ||
    (stepId === 3 && scenario === "log_backup_persists") ||
    (stepId === 5 && scenario === "windows_extension_failure") ||
    (stepId === 7 && scenario === "application_validation_failure")
  );
}

const TOTAL_WEIGHT = STEPS.reduce((a, s) => a + s.weight, 0);

export function useExecutionEngine() {
  const [status, setStatus] = useState<ExecutionStatus>("ready");
  const [scenario, setScenario] = useState<ExecutionScenario>("success");
  const [speed, setSpeed] = useState(2);
  const [simTime, setSimTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepElapsed, setStepElapsed] = useState(0);
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const [steps, setSteps] = useState<StepState[]>(
    STEPS.map((s) => ({ id: s.id, status: "waiting", gateStatus: "waiting", progress: 0 })),
  );
  const [safetyState, setSafetyState] = useState<"CONTINUE" | "PAUSE" | "HALT">("CONTINUE");
  const [haltReason, setHaltReason] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const eventId = useRef(0);
  const fired = useRef<Set<string>>(new Set());

  const push = useCallback((step: number, severity: EventSeverity, message: string, at: number) => {
    eventId.current += 1;
    setEvents((prev) => [...prev, { id: eventId.current, t: stamp(at), step, severity, message }]);
  }, []);

  const durationFor = useCallback(
    (stepId: number) => {
      const base = STEPS[stepId - 1].seconds;
      return stepId === 4 && scenario === "ebs_delay" ? base * 2.2 : base;
    },
    [scenario],
  );

  const start = useCallback(() => {
    setStatus("running");
    setSafetyState("CONTINUE");
    setSteps((prev) => prev.map((s) => (s.id === 1 ? { ...s, status: "running", startedAt: stamp(0) } : s)));
  }, []);

  const reset = useCallback(() => {
    setStatus("ready");
    setSimTime(0);
    setCurrentStep(1);
    setStepElapsed(0);
    setEvents([]);
    setWarning(null);
    setHaltReason(null);
    setSafetyState("CONTINUE");
    fired.current = new Set();
    eventId.current = 0;
    setSteps(STEPS.map((s) => ({ id: s.id, status: "waiting", gateStatus: "waiting", progress: 0 })));
  }, []);

  const requestPause = useCallback(() => {
    if (status !== "running") return;
    setStatus("pause_requested");
    push(currentStep, "INFO", "Pause requested — execution will stop after the current step", simTime);
  }, [status, currentStep, push, simTime]);

  const resume = useCallback(() => {
    if (status !== "paused" && status !== "pause_requested") return;
    setStatus("running");
    setSafetyState("CONTINUE");
    push(currentStep, "ACTION", "Execution resumed by operator", simTime);
  }, [status, currentStep, push, simTime]);

  const halt = useCallback(
    (reason: string) => {
      setStatus("halted");
      setSafetyState("HALT");
      setHaltReason(reason);
      push(currentStep, "FAIL", `EMERGENCY HALT — ${reason} (actor: Current Demo User)`, simTime);
      setSteps((prev) => prev.map((s) => (s.status === "running" ? { ...s, status: "blocked" } : s)));
    },
    [currentStep, push, simTime],
  );

  // Simulation tick
  useEffect(() => {
    if (status !== "running" && status !== "pause_requested") return;
    const iv = window.setInterval(() => {
      const delta = 0.2 * speed;
      setSimTime((t) => t + delta);
      setStepElapsed((e) => e + delta);
    }, 200);
    return () => window.clearInterval(iv);
  }, [status, speed]);

  // Step progression
  useEffect(() => {
    if (status !== "running" && status !== "pause_requested") return;
    const def = STEPS[currentStep - 1];
    if (!def) return;
    const dur = durationFor(currentStep);
    const frac = Math.min(1, stepElapsed / dur);

    setSteps((prev) => prev.map((s) => (s.id === currentStep ? { ...s, progress: Math.round(frac * 100) } : s)));

    for (const m of milestonesFor(currentStep, scenario)) {
      const key = `${currentStep}:${m.at}`;
      if (frac >= m.at && !fired.current.has(key)) {
        fired.current.add(key);
        push(currentStep, m.sev, m.msg, simTime);
        if (m.sev === "WARNING") setWarning(m.msg);
      }
    }

    if (frac < 1) return;

    const failed = stepFails(currentStep, scenario);
    const gateKey = `gate:${currentStep}`;
    if (fired.current.has(gateKey)) return;
    fired.current.add(gateKey);

    if (failed) {
      push(currentStep, "GATE", `${def.name} gate FAILED — execution halted`, simTime);
      setSteps((prev) =>
        prev.map((s) =>
          s.id === currentStep
            ? { ...s, status: "failed", gateStatus: "failed", progress: 100, completedAt: stamp(simTime) }
            : s,
        ),
      );
      setSafetyState("HALT");
      setStatus("failed");
      return;
    }

    const evidence = currentStep === 1 ? `${PREFLIGHT_CHECKS.length}/${PREFLIGHT_CHECKS.length} checks` : def.requiredEvidence;
    push(currentStep, "GATE", `${def.name} gate PASSED — ${evidence}`, simTime);
    setSteps((prev) =>
      prev.map((s) =>
        s.id === currentStep
          ? { ...s, status: "passed", gateStatus: "passed", progress: 100, completedAt: stamp(simTime) }
          : s,
      ),
    );
    setWarning(null);

    if (currentStep === STEPS.length) {
      setStatus("execution_complete");
      push(currentStep, "INFO", "EXECUTION COMPLETE — final outcome verification pending", simTime);
      return;
    }

    if (status === "pause_requested") {
      setStatus("paused");
      setSafetyState("PAUSE");
      push(currentStep, "INFO", "EXECUTION PAUSED — operator requested pause after current step", simTime);
      return;
    }

    const next = currentStep + 1;
    setCurrentStep(next);
    setStepElapsed(0);
    setSteps((prev) => prev.map((s) => (s.id === next ? { ...s, status: "running", startedAt: stamp(simTime) } : s)));
  }, [stepElapsed, status, currentStep, scenario, durationFor, push, simTime]);

  const completedWeight = useMemo(
    () =>
      steps.reduce((acc, s) => {
        const def = STEPS[s.id - 1];
        return acc + (def.weight * s.progress) / 100;
      }, 0),
    [steps],
  );

  const overallProgress = Math.round((completedWeight / TOTAL_WEIGHT) * 100);
  const completedCount = steps.filter((s) => s.status === "passed").length;
  const remainingSeconds = useMemo(() => {
    if (status === "execution_complete") return 0;
    const remainingWeight = TOTAL_WEIGHT - completedWeight;
    // Weighted estimate expressed in "operational" minutes for the demo header.
    return Math.round((remainingWeight / TOTAL_WEIGHT) * 810);
  }, [completedWeight, status]);

  return {
    status, setStatus, scenario, setScenario, speed, setSpeed,
    simTime, currentStep, steps, events, safetyState, haltReason, warning,
    overallProgress, completedCount, remainingSeconds,
    startedAtLabel: stamp(0),
    start, reset, requestPause, resume, halt,
    durationFor,
  };
}

export type ExecutionEngine = ReturnType<typeof useExecutionEngine>;
