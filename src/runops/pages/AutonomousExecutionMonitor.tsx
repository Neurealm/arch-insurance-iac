/**
 * Page 21 · Autonomous Execution Monitor
 * Route: /runops/executions/:executionId
 *
 * Real-time view of an automated / digital-worker driven execution.
 * Shared state:
 *   - Reads / mutates localStorage("runops.executions.v1")
 *   - All interventions push audit + domain events via ops.pushNotification
 *   - Deterministic progress is derived from ops.stageIndex + step ordering.
 *
 * No fixture arrays imported. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowLeft, CheckCircle2, ChevronRight, DollarSign,
  ExternalLink, Lock, Pause, Play, Radio, RotateCcw, ShieldAlert, ShieldCheck,
  Square, Timer as TimerIcon, Undo2, UserCog, Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EntityHeader } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* -------------------------------------------------------------------------- */
/* Types (mirrors persisted shape written by Launch + Guided)                  */
/* -------------------------------------------------------------------------- */

type MonitorState =
  | "Queued" | "Running" | "Paused" | "AwaitingApproval"
  | "ValidationFailed" | "CorrectiveBranch" | "RollingBack"
  | "Completed" | "Failed";

type StepPersistedState = "pending" | "running" | "awaiting-input" | "success" | "failed" | "skipped";

interface EvidenceItem {
  id: string;
  stepKey: string;
  kind: "log" | "screenshot" | "metric" | "note";
  label: string;
  detail: string;
  capturedAt: string;
  capturedBy: string;
  auto: boolean;
}

interface StepRecord {
  key: string;
  label: string;
  state: StepPersistedState;
  startedAt: string | null;
  completedAt: string | null;
  attempts?: number;
  actualResult?: string;
  expectedResult?: string;
  skipJustification?: string | null;
}

interface ExecutionRecord {
  id: string;
  runbookId: string;
  runbookVersion: string;
  serviceId: string;
  components: string[];
  environment: string;
  mode: string;
  params: Record<string, string>;
  state: string;
  createdAt: string;
  startedAt: string | null;
  changeTicket: string;
  approvals: string[];
  steps: StepRecord[];
  timeline: { at: string; kind: string; detail: string }[];
  evidence?: EvidenceItem[];
  incidentId?: string;
  collaborators?: string[];
  pausedAt?: string | null;
  rollbackActive?: boolean;
  currentStepKey?: string;
  correctiveActive?: boolean;
  awaitingApproval?: boolean;
  validationFailed?: boolean;
  humanControl?: boolean;
  costUsd?: number;
  checkpoints?: { key: string; label: string; at: string }[];
  toolCalls?: { id: string; stepKey: string; tool: string; args: string; result: string; at: string; ms: number; cost: number }[];
  workerAssignments?: { workerId: string; stepKey: string; role: string; at: string }[];
  resourceLocks?: { id: string; resource: string; heldBy: string; acquiredAt: string }[];
}

const EXECUTIONS_KEY = "runops.executions.v1";
const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
const fmtClock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};
const fmtUsd = (n: number) => `$${n.toFixed(2)}`;

function loadExecutions(): ExecutionRecord[] {
  try {
    const raw = localStorage.getItem(EXECUTIONS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ExecutionRecord[]) : [];
  } catch { return []; }
}
function saveExecutions(list: ExecutionRecord[]) {
  localStorage.setItem(EXECUTIONS_KEY, JSON.stringify(list));
}

function expectedFor(_key: string, label: string, kind: string): string {
  switch (kind) {
    case "diagnose":  return `${label} identifies deviation and captures evidence.`;
    case "mitigate":  return `${label} applies the change within scope; error rate < 2%.`;
    case "validate":  return `Synthetic journey passes; p95 within SLO on affected components.`;
    case "rollback":  return `Prior state restored; SLIs return to baseline.`;
    default:          return `${label} completes without error.`;
  }
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function AutonomousExecutionMonitor() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams();
  const executionId = params.executionId ?? "EXE-8841";
  const canIntervene = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [record, setRecord] = useState<ExecutionRecord | null>(null);
  const [selectedStepKey, setSelectedStepKey] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [dialog, setDialog] = useState<null | "rollback" | "cancel" | "transfer" | "exception" | "worker" | "evidence">(null);
  const [reason, setReason] = useState("");
  const [drawerStepKey, setDrawerStepKey] = useState<string | null>(null);

  const runbook = useMemo(() => ops.runbooks.find((r) => r.id === record?.runbookId) ?? null, [ops.runbooks, record?.runbookId]);
  const service = useMemo(() => ops.services.find((s) => s.id === record?.serviceId) ?? null, [ops.services, record?.serviceId]);

  const stepMeta = useMemo(() => {
    const m = new Map<string, { kind: string; description: string }>();
    (runbook?.steps ?? []).forEach((s) => m.set(s.key, { kind: s.kind, description: s.description }));
    return m;
  }, [runbook]);

  const persist = useCallback((next: ExecutionRecord) => {
    setRecord(next);
    saveExecutions([next, ...loadExecutions().filter((e) => e.id !== next.id)]);
  }, []);

  const audit = useCallback((title: string, detail: string, kind: "info" | "warning" | "critical" = "info") => {
    ops.pushNotification({ kind, title, detail, entityRef: executionId });
  }, [ops, executionId]);

  const pushTimeline = useCallback((rec: ExecutionRecord, kind: string, detail: string): ExecutionRecord => {
    const next = { ...rec, timeline: [...rec.timeline, { at: nowIso(), kind, detail }] };
    persist(next);
    return next;
  }, [persist]);

  /* Seed / load. */
  useEffect(() => {
    const list = loadExecutions();
    let found = list.find((e) => e.id === executionId) ?? null;
    if (!found) {
      const rb = ops.runbooks.find((r) => r.id === "RB-0042") ?? ops.runbooks[0];
      const rbSteps = rb?.steps ?? [];
      const steps: StepRecord[] = rbSteps.map((s) => ({
        key: s.key, label: s.label, state: "pending", startedAt: null, completedAt: null,
        attempts: 0, actualResult: "", expectedResult: expectedFor(s.key, s.label, s.kind), skipJustification: null,
      }));
      found = {
        id: executionId,
        runbookId: rb?.id ?? "RB-0042",
        runbookVersion: rb?.version ?? "v3.2",
        serviceId: rb?.serviceId ?? "svc-global-order-processing",
        components: ["cmp-checkout-api", "cmp-orders-db"],
        environment: "Production",
        mode: "Approval Gated Automation",
        params: {},
        state: "Running",
        createdAt: nowIso(),
        startedAt: nowIso(),
        changeTicket: "CHG-20391",
        approvals: [],
        steps,
        timeline: [{ at: nowIso(), kind: "seeded", detail: `Autonomous monitor seeded for ${rb?.id ?? "RB-0042"}` }],
        evidence: [],
        incidentId: "INC-10482",
        collaborators: ["DW-IC-01", "DW-APP-02", "DW-DB-03"],
        pausedAt: null,
        rollbackActive: false,
        currentStepKey: steps[0]?.key ?? null,
        correctiveActive: false,
        validationFailed: false,
        humanControl: false,
        costUsd: 0,
        checkpoints: [],
        toolCalls: [],
        workerAssignments: [],
        resourceLocks: [],
      };
      saveExecutions([found, ...list]);
    }
    const patched: ExecutionRecord = {
      ...found,
      evidence: found.evidence ?? [],
      checkpoints: found.checkpoints ?? [],
      toolCalls: found.toolCalls ?? [],
      workerAssignments: found.workerAssignments ?? [],
      resourceLocks: found.resourceLocks ?? [],
      collaborators: found.collaborators ?? ["DW-IC-01", "DW-APP-02"],
      costUsd: found.costUsd ?? 0,
      correctiveActive: found.correctiveActive ?? false,
      validationFailed: found.validationFailed ?? false,
      humanControl: found.humanControl ?? false,
      incidentId: found.incidentId ?? "INC-10482",
    };
    setRecord(patched);
    setSelectedStepKey(patched.currentStepKey ?? patched.steps[0]?.key ?? null);
    saveExecutions([patched, ...loadExecutions().filter((e) => e.id !== patched.id)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionId]);

  /* Timer */
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  /* Deterministic progress: advance one pending step per scenario stage tick past 5. */
  useEffect(() => {
    if (!record) return;
    if (record.pausedAt || record.humanControl || record.state === "Cancelled") return;
    if (record.rollbackActive || record.correctiveActive || record.validationFailed) return;
    if (record.awaitingApproval) return;

    // number of steps that should be complete by this scenario stage
    const target = Math.max(0, Math.min(record.steps.length, ops.stageIndex - 4));
    const done = record.steps.filter((s) => s.state === "success" || s.state === "skipped").length;
    if (done >= target) return;
    // Advance one pending step to success (autonomous execution).
    const idx = record.steps.findIndex((s) => s.state === "pending" || s.state === "running");
    if (idx < 0) return;
    const step = record.steps[idx];
    const kind = stepMeta.get(step.key)?.kind ?? "diagnose";

    // Approval-gated: pause before mitigation until approvals is non-empty
    if (kind === "mitigate" && record.mode === "Approval Gated Automation" && (record.approvals?.length ?? 0) === 0 && !record.humanControl && !record.awaitingApproval) {
      const paused: ExecutionRecord = { ...record, awaitingApproval: true };
      pushTimeline(paused, "approval.awaiting", `${step.key} · awaiting approval before mitigation`);
      audit("Approval required", `${executionId} · ${step.key} · mitigation gated`, "warning");
      return;
    }

    const toolCall = {
      id: rid("TC"), stepKey: step.key,
      tool: kind === "diagnose" ? "observability.query" : kind === "mitigate" ? "db.index.revert" : kind === "validate" ? "synthetic.checkout" : "recovery.restore",
      args: JSON.stringify({ step: step.key, env: record.environment }),
      result: "ok",
      at: nowIso(),
      ms: 800 + Math.floor(Math.random() * 900),
      cost: 0.03 + Math.random() * 0.12,
    };
    const evidenceAuto: EvidenceItem | null = kind === "validate" || kind === "mitigate"
      ? { id: rid("EV"), stepKey: step.key, kind: "log", label: `Auto ${kind} output`, detail: `Captured by ${toolCall.tool}`, capturedAt: nowIso(), capturedBy: "system", auto: true }
      : null;
    const checkpoint = { key: step.key, label: `Post-${step.key} checkpoint`, at: nowIso() };

    const updatedSteps = record.steps.map((s, i) => i === idx
      ? { ...s, state: "success" as StepPersistedState, startedAt: s.startedAt ?? nowIso(), completedAt: nowIso(), attempts: (s.attempts ?? 0) + 1, actualResult: "Autonomous success (deterministic)" }
      : s);
    const nextPointerIdx = updatedSteps.findIndex((s) => s.state === "pending");
    let next: ExecutionRecord = {
      ...record,
      steps: updatedSteps,
      currentStepKey: nextPointerIdx >= 0 ? updatedSteps[nextPointerIdx].key : step.key,
      toolCalls: [...(record.toolCalls ?? []), toolCall],
      evidence: evidenceAuto ? [...(record.evidence ?? []), evidenceAuto] : (record.evidence ?? []),
      checkpoints: [...(record.checkpoints ?? []), checkpoint],
      costUsd: Number(((record.costUsd ?? 0) + toolCall.cost).toFixed(2)),
    };
    next = pushTimeline(next, `step.${kind}.completed`, `${step.key} · ${step.label} · ${toolCall.tool}`);
    audit("Autonomous step completed", `${executionId} · ${step.key} · ${step.label}`);
    // Completion check
    const allDone = next.steps.every((s) => s.state === "success" || s.state === "skipped");
    if (allDone) {
      const finished: ExecutionRecord = { ...next, state: "Completed" };
      pushTimeline(finished, "execution.completed", `${executionId} completed autonomously`);
      audit("Execution completed", `${executionId} · ${finished.runbookId}`);
      audit("Runbook Detail updated", `${finished.runbookId} · execution ${executionId} appended`);
      audit("Analytics updated", `Fitness / MTTR metrics recomputed for ${finished.runbookId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, ops.stageIndex, stepMeta]);

  if (!record) return <div className="p-6 text-sm text-muted-foreground">Loading execution {executionId}…</div>;

  /* ------ Derived monitor state ------ */
  const derived: MonitorState = (() => {
    if (record.state === "Cancelled") return "Failed";
    if (record.state === "Completed") return "Completed";
    if (record.rollbackActive) return "RollingBack";
    if (record.correctiveActive) return "CorrectiveBranch";
    if (record.validationFailed) return "ValidationFailed";
    if (record.pausedAt) return "Paused";
    if (record.awaitingApproval) return "AwaitingApproval";
    if (record.steps.some((s) => s.state === "failed")) return "ValidationFailed";
    if (!record.startedAt) return "Queued";
    return "Running";
  })();

  const completed = record.steps.filter((s) => s.state === "success" || s.state === "skipped").length;
  const progressPct = record.steps.length === 0 ? 0 : Math.round((completed / record.steps.length) * 100);

  const elapsedMs = (() => {
    if (!record.startedAt) return 0;
    void tick;
    return Date.now() - new Date(record.startedAt).getTime();
  })();
  const perStepMs = completed > 0 ? elapsedMs / completed : 0;
  const remaining = record.steps.length - completed;
  const etaMs = perStepMs * remaining;

  const currentStep = record.steps.find((s) => s.key === record.currentStepKey)
    ?? record.steps.find((s) => s.state !== "success" && s.state !== "skipped")
    ?? record.steps[record.steps.length - 1];

  const selectedStep = record.steps.find((s) => s.key === selectedStepKey) ?? currentStep;

  // Confidence heuristic: higher when validated steps pass w/ evidence and no failures.
  const failed = record.steps.filter((s) => s.state === "failed").length;
  const validatedWithEv = record.steps.filter((s) => {
    const k = stepMeta.get(s.key)?.kind;
    return k === "validate" && s.state === "success" && (record.evidence ?? []).some((e) => e.stepKey === s.key);
  }).length;
  const confidence = Math.max(30, Math.min(97,
    75
    + validatedWithEv * 6
    - failed * 18
    + (record.rollbackActive ? -12 : 0)
    + (record.awaitingApproval ? -6 : 0)
    + (record.humanControl ? -4 : 0)
    + (progressPct === 100 ? 8 : 0)
  ));
  const confidenceBelowThreshold = confidence < 60;

  const workers = ops.digitalWorkers.slice(0, 4);
  const assignmentsByStep = new Map<string, string[]>();
  (record.workerAssignments ?? []).forEach((a) => {
    const list = assignmentsByStep.get(a.stepKey) ?? [];
    list.push(a.workerId);
    assignmentsByStep.set(a.stepKey, list);
  });

  const canRollback = record.steps.some((s) => stepMeta.get(s.key)?.kind === "mitigate"
    && (s.state === "success" || s.state === "failed" || s.state === "running"));
  const cancelAllowed = !record.rollbackActive && derived !== "Completed" && derived !== "Failed";
  const isTerminal = derived === "Completed" || derived === "Failed";

  /* ------ Intervention actions ------ */
  const pauseExec = () => {
    if (!canIntervene || record.pausedAt) return;
    const next: ExecutionRecord = { ...record, pausedAt: nowIso() };
    pushTimeline(next, "execution.paused", `Paused by ${ops.role}`);
    audit("Execution paused", `${executionId}`, "warning");
  };
  const resumeExec = () => {
    if (!canIntervene || !record.pausedAt) return;
    const next: ExecutionRecord = { ...record, pausedAt: null };
    pushTimeline(next, "execution.resumed", `Resumed by ${ops.role}`);
    audit("Execution resumed", `${executionId}`);
  };
  const approveException = () => {
    if (!canIntervene) return;
    if (!record.awaitingApproval) {
      audit("Nothing to approve", `${executionId} · no pending exception`, "warning");
      setDialog(null); setReason(""); return;
    }
    const apId = rid("AP");
    const next: ExecutionRecord = { ...record, awaitingApproval: false, approvals: [...record.approvals, apId] };
    pushTimeline(next, "approval.granted", `${apId} · ${reason || "Exception approved"} by ${ops.role}`);
    audit("Exception approved", `${executionId} · ${apId} · live graph resumed`);
    setDialog(null); setReason("");
  };
  const transferToHuman = () => {
    if (!canIntervene) return;
    const next: ExecutionRecord = { ...record, humanControl: true, pausedAt: null };
    pushTimeline(next, "control.transferred", `Control transferred to human operator (${ops.role})`);
    audit("Control transferred to human", `${executionId} · guided mode`, "warning");
    setDialog(null); setReason("");
    setTimeout(() => navigate(`/runops/executions/${executionId}/guided`), 250);
  };
  const initiateRollback = () => {
    if (!canIntervene) return;
    if (!canRollback) {
      audit("Rollback unavailable", `${executionId} · no mitigation performed`, "warning");
      setDialog(null); return;
    }
    const rbStep = record.steps.find((s) => stepMeta.get(s.key)?.kind === "rollback");
    let next: ExecutionRecord = {
      ...record, rollbackActive: true, awaitingApproval: false,
      currentStepKey: rbStep?.key ?? record.currentStepKey,
    };
    if (rbStep) {
      next = { ...next, steps: next.steps.map((s) => s.key === rbStep.key
        ? { ...s, state: "running" as StepPersistedState, startedAt: nowIso(), attempts: (s.attempts ?? 0) + 1 }
        : s) };
    }
    pushTimeline(next, "rollback.started", `Rollback initiated by ${ops.role}`);
    audit("Rollback initiated", `${executionId} · ${service?.name ?? record.serviceId}`, "critical");
    audit("Service state updated", `${service?.name ?? record.serviceId} · rollback in progress`);
    audit("Telemetry response", `${executionId} · recovery telemetry stream opened`);
    setDialog(null);
  };
  const cancelExec = () => {
    if (!canIntervene || !cancelAllowed) return;
    const next: ExecutionRecord = { ...record, state: "Cancelled" };
    pushTimeline(next, "execution.cancelled", `Cancelled by ${ops.role} · ${reason || "policy allows"}`);
    audit("Execution cancelled", `${executionId}`, "warning");
    setDialog(null); setReason("");
  };
  const assignWorker = (workerId: string) => {
    if (!canIntervene || !currentStep) return;
    const worker = ops.digitalWorkers.find((w) => w.id === workerId);
    if (!worker) return;
    const assignment = { workerId, stepKey: currentStep.key, role: worker.role, at: nowIso() };
    const lock = { id: rid("LK"), resource: `${record.serviceId}/${currentStep.key}`, heldBy: workerId, acquiredAt: nowIso() };
    const next: ExecutionRecord = {
      ...record,
      workerAssignments: [...(record.workerAssignments ?? []), assignment],
      resourceLocks: [...(record.resourceLocks ?? []), lock],
      collaborators: Array.from(new Set([...(record.collaborators ?? []), workerId])),
    };
    pushTimeline(next, "worker.assigned", `${workerId} (${worker.role}) → ${currentStep.key}`);
    audit("Digital worker assigned", `${executionId} · ${workerId} · ${currentStep.key}`);
    setDialog(null);
  };

  /* ------ Render ------ */

  const stateBadge: Record<MonitorState, string> = {
    Queued:            "border-slate-300 bg-slate-50 text-slate-900",
    Running:           "border-emerald-300 bg-emerald-50 text-emerald-900",
    Paused:            "border-amber-300 bg-amber-50 text-amber-900",
    AwaitingApproval:  "border-sky-300 bg-sky-50 text-sky-900",
    ValidationFailed:  "border-rose-300 bg-rose-50 text-rose-900",
    CorrectiveBranch:  "border-amber-300 bg-amber-50 text-amber-900",
    RollingBack:       "border-rose-300 bg-rose-50 text-rose-900",
    Completed:         "border-emerald-300 bg-emerald-50 text-emerald-900",
    Failed:            "border-slate-300 bg-slate-50 text-slate-900",
  };
  const stepBadge: Record<StepPersistedState, string> = {
    "pending":        "border-slate-300 bg-slate-50 text-slate-900",
    "running":        "border-emerald-300 bg-emerald-50 text-emerald-900",
    "awaiting-input": "border-amber-300 bg-amber-50 text-amber-900",
    "success":        "border-emerald-300 bg-emerald-50 text-emerald-900",
    "failed":         "border-rose-300 bg-rose-50 text-rose-900",
    "skipped":        "border-slate-300 bg-slate-50 text-slate-700",
  };

  // Deviation: any step is failed or in corrective, or approvals came after mitigation-start
  const deviationSteps = record.steps.filter((s) => s.state === "failed" || (s.attempts ?? 0) > 1);

  const evidenceForSelected = (record.evidence ?? []).filter((e) => e.stepKey === selectedStep?.key);
  const toolCallsForSelected = (record.toolCalls ?? []).filter((t) => t.stepKey === selectedStep?.key);

  const rationale = (() => {
    if (!selectedStep) return { action: "", policy: "", evidence: "" };
    const kind = stepMeta.get(selectedStep.key)?.kind ?? "diagnose";
    return {
      action: kind === "diagnose"
        ? "Autonomously correlate telemetry against pre-execution baseline."
        : kind === "mitigate"
        ? `Apply approved mitigation for ${selectedStep.label}. Change ticket ${record.changeTicket || "TBD"}.`
        : kind === "validate"
        ? "Run synthetic checkout journey and compare SLIs to baseline."
        : "Restore prior configuration and validate SLIs.",
      policy: kind === "mitigate"
        ? "Approval-gated · Production requires Change Manager + Service Owner."
        : kind === "rollback"
        ? "Emergency policy · rollback pre-authorized for this runbook."
        : "Read-only telemetry access · no state change.",
      evidence: `${toolCallsForSelected.length} tool call(s), ${evidenceForSelected.length} evidence artifact(s), ${(record.checkpoints ?? []).length} checkpoint(s).`,
    };
  })();

  return (
    <div className="flex flex-col gap-3 p-4 md:p-6" aria-label="Autonomous execution monitor">
      <EntityHeader
        eyebrow="Autonomous execution"
        title={`${record.id} · ${runbook?.title ?? record.runbookId}`}
        subtitle={`${record.runbookId} ${record.runbookVersion} · ${service?.name ?? record.serviceId} · ${record.environment}`}
        meta={
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Tenant: <span className="text-foreground">{ops.tenant.name}</span></span>
            <span>Role: <span className="text-foreground">{ops.role}</span></span>
            <span>Scenario: <span className="text-foreground">{ops.stages[ops.stageIndex]?.label ?? "—"}</span></span>
            <span className="inline-flex items-center gap-1"><TimerIcon className="h-3 w-3" /> {fmtClock(elapsedMs)}</span>
            <span>ETA: <span className="text-foreground">{completed === 0 ? "—" : fmtClock(etaMs)}</span></span>
            <span className="inline-flex items-center gap-1"><DollarSign className="h-3 w-3" /> {fmtUsd(record.costUsd ?? 0)}</span>
            <Badge variant="outline" className={cn("border", stateBadge[derived])}>{derived}</Badge>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/runops/runbooks/${record.runbookId}`)} aria-label="Open runbook detail">
              <ArrowLeft className="h-4 w-4" /> Runbook
            </Button>
            {record.incidentId && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/runops/incidents/${record.incidentId}`)} aria-label="Open incident">
                <ExternalLink className="h-4 w-4" /> Incident
              </Button>
            )}
            {record.changeTicket && (
              <Button variant="outline" size="sm" onClick={() => audit("Change opened", `${record.changeTicket} · from monitor`)} aria-label="Open related change">
                <ExternalLink className="h-4 w-4" /> {record.changeTicket}
              </Button>
            )}
            {record.pausedAt
              ? <Button variant="outline" size="sm" onClick={resumeExec} disabled={!canIntervene || isTerminal} aria-label="Resume execution"><Play className="h-4 w-4" /> Resume</Button>
              : <Button variant="outline" size="sm" onClick={pauseExec} disabled={!canIntervene || isTerminal} aria-label="Pause execution"><Pause className="h-4 w-4" /> Pause</Button>}
            <Button size="sm" variant="outline" onClick={() => setDialog("exception")}
              disabled={!canIntervene || !record.awaitingApproval || isTerminal}
              title={!record.awaitingApproval ? "No pending exception" : "Approve exception and resume"}
              aria-label="Approve exception">
              <ShieldCheck className="h-4 w-4" /> Approve exception
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog("transfer")}
              disabled={!canIntervene || isTerminal || record.humanControl}
              aria-label="Transfer control to human">
              <UserCog className="h-4 w-4" /> Transfer to human
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog("rollback")}
              disabled={!canIntervene || !canRollback || isTerminal}
              title={!canRollback ? "Rollback available once a mitigation step has run" : "Initiate rollback"}
              aria-label="Initiate rollback">
              <Undo2 className="h-4 w-4" /> Rollback
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog("cancel")}
              disabled={!canIntervene || !cancelAllowed}
              title={!cancelAllowed ? "Cancellation blocked while rollback is active" : "Cancel execution"}
              aria-label="Cancel execution">
              <Square className="h-4 w-4" /> Cancel
            </Button>
          </div>
        }
      />

      {/* Progress + intervention gates */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <span className="font-medium">{completed}</span> completed · <span className="font-medium">{remaining}</span> remaining
              <span className="text-muted-foreground"> · step {(record.steps.findIndex((s) => s.key === currentStep?.key) + 1) || 1} of {record.steps.length}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline">Mode · {record.mode}</Badge>
              <Badge variant="outline">Env · {record.environment}</Badge>
              <Badge variant="outline">Change · {record.changeTicket || "none"}</Badge>
              <Badge variant="outline">Confidence · {confidence}%</Badge>
              {confidenceBelowThreshold && (
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">
                  Below threshold — human intervention required
                </Badge>
              )}
              {record.humanControl && <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-900">Human control</Badge>}
            </div>
          </div>
          <Progress value={progressPct} aria-label="Execution progress" />
        </CardContent>
      </Card>

      {/* Guard bands */}
      {record.awaitingApproval && (
        <Card><CardContent className="p-3 text-sm flex items-center gap-2 text-sky-900 bg-sky-50 border border-sky-200 rounded-md">
          <ShieldAlert className="h-4 w-4" /> Awaiting approval before mitigation — approve exception, transfer to human, or roll back.
        </CardContent></Card>
      )}
      {record.pausedAt && (
        <Card><CardContent className="p-3 text-sm flex items-center gap-2 text-amber-900 bg-amber-50 border border-amber-200 rounded-md">
          <Pause className="h-4 w-4" /> Paused — SLO timer keeps running.
        </CardContent></Card>
      )}
      {record.rollbackActive && (
        <Card><CardContent className="p-3 text-sm flex items-center gap-2 text-rose-900 bg-rose-50 border border-rose-200 rounded-md">
          <ShieldAlert className="h-4 w-4" /> Rollback in progress — telemetry recovery stream active.
        </CardContent></Card>
      )}
      {deviationSteps.length > 0 && (
        <Card><CardContent className="p-3 text-sm flex items-center gap-2 text-amber-900 bg-amber-50 border border-amber-200 rounded-md">
          <AlertTriangle className="h-4 w-4" /> Deviation from approved workflow: {deviationSteps.map((s) => s.key).join(", ")}
        </CardContent></Card>
      )}
      {derived === "Completed" && (
        <Card><CardContent className="p-3 text-sm flex items-center gap-2 text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-md">
          <CheckCircle2 className="h-4 w-4" /> Execution complete — Runbook Detail and Analytics updated.
        </CardContent></Card>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-3">
        <div className="flex flex-col gap-3">
          {/* Live workflow graph (linear) */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Live workflow</div>
                <Badge variant="outline" className="text-[10px]"><Radio className="h-3 w-3 mr-1" /> streaming</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {record.steps.map((s, i) => {
                  const kind = stepMeta.get(s.key)?.kind ?? "diagnose";
                  const isCurrent = s.key === currentStep?.key;
                  const isSelected = s.key === selectedStepKey;
                  return (
                    <div key={s.key} className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedStepKey(s.key)}
                        aria-label={`Select ${s.label}`}
                        className={cn(
                          "text-left rounded-md border px-2 py-1.5 text-xs min-w-[140px] max-w-[220px]",
                          stepBadge[s.state],
                          isSelected && "ring-2 ring-primary/40",
                          isCurrent && "shadow"
                        )}>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">{i + 1}.</span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0">{kind}</Badge>
                        </div>
                        <div className="truncate font-medium">{s.label}</div>
                        <div className="flex items-center gap-2 text-[10px] mt-0.5">
                          <span>{s.state}</span>
                          {(s.attempts ?? 0) > 0 && <span>×{s.attempts}</span>}
                          {(assignmentsByStep.get(s.key)?.length ?? 0) > 0 && <span>· {assignmentsByStep.get(s.key)!.length} DW</span>}
                        </div>
                      </button>
                      {i < record.steps.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected step detail */}
          {selectedStep && (
            <Card>
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Selected step · {stepMeta.get(selectedStep.key)?.kind ?? "step"}
                    </div>
                    <div className="text-base font-medium">{selectedStep.label}</div>
                    <div className="text-sm text-muted-foreground">{stepMeta.get(selectedStep.key)?.description ?? "Runbook step."}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={cn("border", stepBadge[selectedStep.state])}>{selectedStep.state}</Badge>
                    <Badge variant="outline">Attempts · {selectedStep.attempts ?? 0}</Badge>
                    <Button size="sm" variant="outline" onClick={() => setDrawerStepKey(selectedStep.key)} aria-label="Open supporting evidence">
                      Evidence
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setDialog("worker")} aria-label="Open worker activity">
                      <Zap className="h-4 w-4" /> Assign DW
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-md border p-3 bg-muted/30">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Action rationale</div>
                    <div className="text-sm">{rationale.action}</div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mt-3 mb-1">Policy decision</div>
                    <div className="text-sm">{rationale.policy}</div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mt-3 mb-1">Evidence citations</div>
                    <div className="text-sm">{rationale.evidence}</div>
                    <div className="text-[10px] text-muted-foreground mt-2 italic">Model internal reasoning is not exposed.</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Tool calls</div>
                    {toolCallsForSelected.length === 0
                      ? <div className="text-xs text-muted-foreground">No tool calls yet for this step.</div>
                      : <ul className="text-xs space-y-1">
                          {toolCallsForSelected.slice(-6).map((t) => (
                            <li key={t.id} className="border rounded px-2 py-1 flex items-center justify-between gap-2">
                              <span className="font-mono truncate">{t.tool}</span>
                              <span className="text-muted-foreground">{t.ms}ms · {fmtUsd(t.cost)}</span>
                            </li>
                          ))}
                        </ul>}
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mt-3 mb-1">Expected vs actual</div>
                    <div className="text-xs">
                      <div><span className="text-muted-foreground">Expected: </span>{selectedStep.expectedResult}</div>
                      <div><span className="text-muted-foreground">Actual: </span>{selectedStep.actualResult || "—"}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Telemetry response */}
          <Card>
            <CardContent className="p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Telemetry response · pre-execution baseline vs live</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                {(() => {
                  const stage = ops.stageIndex;
                  const recovery = record.rollbackActive || completed >= record.steps.length - 1;
                  const p95Base = 420;
                  const p95Live = recovery ? 480 : Math.max(600, 2800 - stage * 90);
                  const errBase = 0.3;
                  const errLive = recovery ? 0.6 : Math.max(1.5, 8.6 - stage * 0.4);
                  const poolBase = 62;
                  const poolLive = recovery ? 74 : Math.min(98, 78 + stage * 1.2);
                  const row = (label: string, unit: string, base: number, live: number, higherIsBad = true) => {
                    const delta = live - base;
                    const bad = higherIsBad ? delta > base * 0.15 : delta < -base * 0.15;
                    return (
                      <div className="rounded-md border p-2">
                        <div className="text-muted-foreground">{label}</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-medium">{live.toFixed(1)}{unit}</span>
                          <span className={cn("text-[10px]", bad ? "text-rose-700" : "text-emerald-700")}>Δ {delta > 0 ? "+" : ""}{delta.toFixed(1)}{unit}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">baseline {base}{unit}</div>
                      </div>
                    );
                  };
                  return (
                    <>
                      {row("Checkout p95 latency", "ms", p95Base, p95Live)}
                      {row("Error rate", "%", errBase, errLive)}
                      {row("Pool utilization", "%", poolBase, poolLive)}
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">AI monitor · confidence & recommendation</div>
                <Badge variant="outline">{confidence}% confidence</Badge>
              </div>
              <div className="text-sm font-medium mb-1">
                {confidenceBelowThreshold
                  ? "Human intervention required — confidence below threshold."
                  : record.awaitingApproval
                  ? "Approve exception or transfer to a human before mitigation."
                  : record.rollbackActive
                  ? "Rollback in progress — monitor SLI recovery before releasing controls."
                  : derived === "Completed"
                  ? "Execution complete. Recovery Validation is next for the linked incident."
                  : "Proceed with autonomous execution — thresholds satisfied."}
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-2">Evidence</div>
              <ul className="text-xs list-disc pl-4 space-y-0.5">
                <li>Runbook {record.runbookId} {record.runbookVersion} fitness {runbook?.fitnessScore ?? "n/a"}%</li>
                <li>{completed}/{record.steps.length} steps · elapsed {fmtClock(elapsedMs)} · {fmtUsd(record.costUsd ?? 0)}</li>
                <li>{validatedWithEv} validation step(s) evidenced · {failed} failure(s)</li>
              </ul>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-2">Uncertainty</div>
              <ul className="text-xs list-disc pl-4 space-y-0.5">
                <li>Third-party payment latency partially observable</li>
                <li>Single-tenant sample from Contoso only</li>
              </ul>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-2">Sources</div>
              <ul className="text-xs list-disc pl-4 space-y-0.5">
                <li>Runbook {record.runbookId} {record.runbookVersion}</li>
                <li>Service {service?.id ?? record.serviceId}</li>
                <li>Incident {record.incidentId ?? "—"}</li>
                <li>Evidence Replay Store</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Digital worker assignments</div>
              {(record.workerAssignments ?? []).length === 0 && <div className="text-xs text-muted-foreground">No workers assigned yet.</div>}
              <ul className="text-xs space-y-1">
                {(record.workerAssignments ?? []).slice(-6).map((a, i) => (
                  <li key={i} className="border rounded px-2 py-1"><span className="font-medium">{a.workerId}</span> · {a.role} → {a.stepKey}</li>
                ))}
              </ul>

              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-3 mb-1">Resource locks</div>
              {(record.resourceLocks ?? []).length === 0 && <div className="text-xs text-muted-foreground">None held.</div>}
              <ul className="text-xs space-y-1">
                {(record.resourceLocks ?? []).slice(-4).map((l) => (
                  <li key={l.id} className="border rounded px-2 py-1 flex items-center gap-1"><Lock className="h-3 w-3" /> {l.resource} · {l.heldBy}</li>
                ))}
              </ul>

              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-3 mb-1">Checkpoints</div>
              {(record.checkpoints ?? []).length === 0 && <div className="text-xs text-muted-foreground">None yet.</div>}
              <ul className="text-xs space-y-1">
                {(record.checkpoints ?? []).slice(-4).map((c, i) => (
                  <li key={i} className="border rounded px-2 py-1">{c.label} · {new Date(c.at).toLocaleTimeString()}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Audit activity</div>
              <ul className="text-xs space-y-1 max-h-72 overflow-auto">
                {record.timeline.slice().reverse().slice(0, 40).map((t, i) => (
                  <li key={i} className="border rounded px-2 py-1"><span className="text-muted-foreground">{new Date(t.at).toLocaleTimeString()} · {t.kind}:</span> {t.detail}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={dialog === "rollback"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Initiate rollback?</DialogTitle></DialogHeader>
          <div className="text-sm">Rollback restores prior state for <span className="font-medium">{service?.name ?? record.serviceId}</span>. Only available after a mitigation step has run.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={initiateRollback} disabled={!canRollback}>Initiate rollback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "cancel"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel execution?</DialogTitle></DialogHeader>
          <div className="text-sm">Cancellation is blocked while a rollback is active. Provide a policy-justified reason.</div>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (audit-only)…" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Keep running</Button>
            <Button onClick={cancelExec} disabled={!cancelAllowed}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "transfer"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Transfer control to human</DialogTitle></DialogHeader>
          <div className="text-sm">Autonomous execution pauses and the operator takes over in guided mode. This is auditable.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Keep autonomous</Button>
            <Button onClick={transferToHuman}>Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "exception"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Approve exception</DialogTitle></DialogHeader>
          <div className="text-sm">Approving unblocks the pending mitigation. This is auditable and appears on the live graph.</div>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Justification (required for audit)…" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={approveException} disabled={reason.trim().length < 4}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "worker"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign digital worker to {currentStep?.key}</DialogTitle></DialogHeader>
          <ul className="space-y-1 max-h-72 overflow-auto">
            {workers.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-2 border rounded px-2 py-1">
                <div className="text-sm">
                  <div className="font-medium">{w.name}</div>
                  <div className="text-xs text-muted-foreground">{w.role} · {w.autonomy} · {w.status}</div>
                </div>
                <Button size="sm" onClick={() => assignWorker(w.id)}>Assign</Button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog open={!!drawerStepKey} onOpenChange={(o) => !o && setDrawerStepKey(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supporting evidence — {drawerStepKey}</DialogTitle></DialogHeader>
          {(() => {
            const list = (record.evidence ?? []).filter((e) => e.stepKey === drawerStepKey);
            if (list.length === 0) return <div className="text-sm text-muted-foreground">No evidence for this step yet.</div>;
            return (
              <ul className="text-sm space-y-2 max-h-72 overflow-auto">
                {list.map((e) => (
                  <li key={e.id} className="border rounded px-2 py-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{e.kind}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(e.capturedAt).toLocaleTimeString()} · {e.auto ? "auto" : e.capturedBy}</span>
                    </div>
                    <div className="font-medium mt-1">{e.label}</div>
                    <div className="text-xs text-muted-foreground">{e.detail}</div>
                  </li>
                ))}
              </ul>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDrawerStepKey(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="sr-only" aria-live="polite">{derived}</div>

      {!canIntervene && (
        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <Activity className="h-3 w-3" /> View-only role — intervention controls are disabled.
        </div>
      )}
    </div>
  );
}
