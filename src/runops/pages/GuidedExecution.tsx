/**
 * Page 20 · Guided Operator Execution
 * Route: /runops/executions/:executionId/guided
 *
 * Guides a human operator through a controlled runbook while collecting
 * evidence and maintaining operational context.
 *
 * Real shared state transitions:
 *   - execution + step records + evidence + notes → localStorage("runops.executions.v1")
 *   - audit + domain events + incident timeline    → ops.pushNotification
 *
 * No fixture arrays imported. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowLeft, CheckCircle2, ChevronRight, FileText,
  MessageSquare, Pause, Play, RotateCcw, ShieldAlert, SkipForward, Square,
  Timer as TimerIcon, Undo2, Upload, UserPlus, Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EntityHeader, PermissionDeniedState } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type StepState = "pending" | "running" | "awaiting-input" | "success" | "failed" | "skipped";
type ExecutionState = "NotStarted" | "Running" | "AwaitingInput" | "AwaitingApproval"
  | "Paused" | "StepFailed" | "RollbackActive" | "Completed" | "Cancelled";

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
  state: StepState;
  startedAt: string | null;
  completedAt: string | null;
  attempts: number;
  actualResult: string;
  expectedResult: string;
  skipJustification: string | null;
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
  state: string;                    // Draft | Preflight | AwaitingApproval | Running | Cancelled | Failed | Completed
  createdAt: string;
  startedAt: string | null;
  changeTicket: string;
  approvals: string[];
  steps: StepRecord[];
  timeline: { at: string; kind: string; detail: string }[];
  evidence?: EvidenceItem[];
  notes?: { id: string; stepKey: string; text: string; at: string; by: string }[];
  incidentId?: string;
  collaborators?: string[];
  pausedAt?: string | null;
  rollbackActive?: boolean;
  currentStepKey?: string;
  chat?: { id: string; at: string; by: string; text: string }[];
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

/* Step expectation library — derived from step.kind + key, no external fixtures. */
function expectedFor(stepKey: string, stepLabel: string, kind: string): string {
  switch (kind) {
    case "diagnose":
      return `${stepLabel} identifies the deviation and produces evidence (logs, metrics, plan).`;
    case "mitigate":
      return `${stepLabel} applies the change without touching out-of-scope components; error rate < 2%.`;
    case "validate":
      return `Synthetic journey passes and p95 latency returns within SLO on the affected components.`;
    case "rollback":
      return `Prior state is restored; SLIs return to green baseline; no data loss.`;
    default:
      return `${stepKey} completes without error.`;
  }
}

function requiresEvidence(kind: string): boolean {
  return kind === "validate" || kind === "mitigate" || kind === "rollback";
}

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

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function GuidedExecution() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams();
  const executionId = params.executionId ?? "EXE-8841";
  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";

  const [record, setRecord] = useState<ExecutionRecord | null>(null);
  const [tick, setTick] = useState(0);
  const [dialog, setDialog] = useState<null | "skip" | "rollback" | "escalate" | "cancel" | "chat" | "evidence">(null);
  const [pendingStepKey, setPendingStepKey] = useState<string | null>(null);
  const [justification, setJustification] = useState("");
  const [noteText, setNoteText] = useState("");
  const [chatDraft, setChatDraft] = useState("");
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [evidenceDetail, setEvidenceDetail] = useState("");

  /* Bootstrap: read persisted execution or seed from canonical runbook. */
  useEffect(() => {
    const list = loadExecutions();
    let found = list.find((e) => e.id === executionId) ?? null;
    if (!found) {
      const rb = ops.runbooks.find((r) => r.id === "RB-0042") ?? ops.runbooks[0];
      const svcId = rb?.serviceId ?? "svc-global-order-processing";
      const rbSteps = rb?.steps ?? [];
      const steps: StepRecord[] = rbSteps.map((s) => ({
        key: s.key,
        label: s.label,
        state: "pending",
        startedAt: null,
        completedAt: null,
        attempts: 0,
        actualResult: "",
        expectedResult: expectedFor(s.key, s.label, s.kind),
        skipJustification: null,
      }));
      found = {
        id: executionId,
        runbookId: rb?.id ?? "RB-0042",
        runbookVersion: rb?.version ?? "v3.2",
        serviceId: svcId,
        components: ["cmp-checkout-api", "cmp-orders-db"],
        environment: "Production",
        mode: "Human Guided",
        params: {},
        state: "Running",
        createdAt: nowIso(),
        startedAt: nowIso(),
        changeTicket: "",
        approvals: [],
        steps,
        timeline: [{ at: nowIso(), kind: "seeded", detail: `Guided execution seeded from ${rb?.id ?? "RB-0042"}` }],
        evidence: [],
        notes: [],
        incidentId: "INC-10482",
        collaborators: [ops.role, "DW-IC-01"],
        pausedAt: null,
        rollbackActive: false,
        currentStepKey: steps[0]?.key ?? null,
        chat: [],
      };
      saveExecutions([found, ...list]);
    }
    // Ensure derived fields exist on older persisted records.
    const rb = ops.runbooks.find((r) => r.id === found?.runbookId);
    const stepMeta = new Map<string, { kind: string; description: string }>();
    (rb?.steps ?? []).forEach((s) => stepMeta.set(s.key, { kind: s.kind, description: s.description }));
    const patched: ExecutionRecord = {
      ...found,
      evidence: found.evidence ?? [],
      notes: found.notes ?? [],
      chat: found.chat ?? [],
      incidentId: found.incidentId ?? "INC-10482",
      collaborators: found.collaborators ?? [ops.role, "DW-IC-01"],
      pausedAt: found.pausedAt ?? null,
      rollbackActive: found.rollbackActive ?? false,
      currentStepKey: found.currentStepKey ?? found.steps.find((s) => s.state !== "success" && s.state !== "skipped")?.key ?? found.steps[0]?.key ?? null,
      steps: found.steps.map((s) => ({
        ...s,
        expectedResult: s.expectedResult && s.expectedResult.length > 0
          ? s.expectedResult
          : expectedFor(s.key, s.label, stepMeta.get(s.key)?.kind ?? "diagnose"),
        attempts: s.attempts ?? 0,
        skipJustification: s.skipJustification ?? null,
        startedAt: s.startedAt ?? null,
        completedAt: s.completedAt ?? null,
        actualResult: s.actualResult ?? "",
      })),
    };
    setRecord(patched);
    // Persist patched shape so the record is stable across navigation.
    const merged = [patched, ...loadExecutions().filter((e) => e.id !== patched.id)];
    saveExecutions(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionId]);

  /* Live timer */
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const runbook = useMemo(() => ops.runbooks.find((r) => r.id === record?.runbookId) ?? null, [ops.runbooks, record?.runbookId]);
  const service = useMemo(() => ops.services.find((s) => s.id === record?.serviceId) ?? null, [ops.services, record?.serviceId]);
  const stepMetaMap = useMemo(() => {
    const m = new Map<string, { kind: string; description: string }>();
    (runbook?.steps ?? []).forEach((s) => m.set(s.key, { kind: s.kind, description: s.description }));
    return m;
  }, [runbook]);

  const persist = useCallback((next: ExecutionRecord) => {
    setRecord(next);
    const list = loadExecutions();
    saveExecutions([next, ...list.filter((e) => e.id !== next.id)]);
  }, []);

  const audit = useCallback((title: string, detail: string, kind: "info" | "warning" | "critical" = "info") => {
    ops.pushNotification({ kind, title, detail, entityRef: executionId });
  }, [ops, executionId]);

  /* Derived execution state (from step outcomes + flags). */
  const derivedState: ExecutionState = useMemo(() => {
    if (!record) return "NotStarted";
    if (record.state === "Cancelled") return "Cancelled";
    if (record.pausedAt) return "Paused";
    if (record.rollbackActive) return "RollbackActive";
    const anyFailed = record.steps.some((s) => s.state === "failed");
    const allDone = record.steps.every((s) => s.state === "success" || s.state === "skipped");
    const anyRunning = record.steps.some((s) => s.state === "running");
    const anyAwait = record.steps.some((s) => s.state === "awaiting-input");
    if (allDone && record.steps.length > 0) return "Completed";
    if (anyAwait) return "AwaitingInput";
    if (anyFailed) return "StepFailed";
    if (anyRunning) return "Running";
    return record.startedAt ? "Running" : "NotStarted";
  }, [record]);

  /* Timer against startedAt */
  const elapsed = useMemo(() => {
    if (!record?.startedAt) return 0;
    // include tick in deps so it re-renders
    void tick;
    return Date.now() - new Date(record.startedAt).getTime();
  }, [record?.startedAt, tick]);

  if (!record) {
    return <div className="p-6 text-sm text-muted-foreground">Loading execution {executionId}…</div>;
  }

  if (readOnly) {
    return <div className="p-6">
      <PermissionDeniedState
        title="Read-only role"
        description="Your current role cannot drive a guided execution. You may open Evidence Replay to review outcomes." />
    </div>;
  }

  const currentStep = record.steps.find((s) => s.key === record.currentStepKey)
    ?? record.steps.find((s) => s.state !== "success" && s.state !== "skipped")
    ?? record.steps[record.steps.length - 1];

  const completed = record.steps.filter((s) => s.state === "success" || s.state === "skipped").length;
  const remaining = record.steps.length - completed;
  const progressPct = record.steps.length === 0 ? 0 : Math.round((completed / record.steps.length) * 100);

  /* ------------------ Step interactions ------------------ */

  const updateStep = (key: string, patch: Partial<StepRecord>) => {
    const next: ExecutionRecord = {
      ...record,
      steps: record.steps.map((s) => (s.key === key ? { ...s, ...patch } : s)),
    };
    persist(next);
    return next;
  };

  const pushTimeline = (next: ExecutionRecord, kind: string, detail: string) => {
    const merged: ExecutionRecord = {
      ...next,
      timeline: [...next.timeline, { at: nowIso(), kind, detail }],
    };
    persist(merged);
    return merged;
  };

  const startStep = (key: string) => {
    if (record.pausedAt) return;
    const step = record.steps.find((s) => s.key === key);
    if (!step) return;
    if (step.state === "success" || step.state === "skipped") return;
    const next = updateStep(key, {
      state: "running",
      startedAt: step.startedAt ?? nowIso(),
      attempts: step.attempts + 1,
    });
    pushTimeline({ ...next, currentStepKey: key }, "step.start", `${key} · ${step.label} started`);
    audit("Step started", `${executionId} · ${key} · ${step.label}`);
  };

  const confirmStep = (key: string, result: "success" | "failed") => {
    const step = record.steps.find((s) => s.key === key);
    if (!step) return;
    const meta = stepMetaMap.get(key);
    const needsEv = requiresEvidence(meta?.kind ?? "diagnose");
    const hasEv = (record.evidence ?? []).some((e) => e.stepKey === key);
    if (result === "success" && needsEv && !hasEv) {
      audit("Validation blocked", `${key} requires evidence before confirmation`, "warning");
      return;
    }
    const actual = step.actualResult.trim().length > 0
      ? step.actualResult
      : result === "success"
        ? "Confirmed by operator"
        : "Operator marked failed";
    const next = updateStep(key, {
      state: result,
      completedAt: nowIso(),
      actualResult: actual,
    });
    // Advance current step pointer to next pending step
    const nextPending = next.steps.find((s) => s.state === "pending");
    const withPointer: ExecutionRecord = { ...next, currentStepKey: nextPending?.key ?? key };
    pushTimeline(withPointer, `step.${result}`, `${key} · ${step.label} · ${actual}`);
    audit(result === "success" ? "Step completed" : "Step failed",
      `${executionId} · ${key} · ${step.label}`,
      result === "failed" ? "warning" : "info");
    // Auto-capture output as evidence for validated/mitigation steps
    if (result === "success" && (meta?.kind === "validate" || meta?.kind === "mitigate")) {
      // already ensured evidence exists above; no-op
    }
    // Full completion?
    const doneCount = withPointer.steps.filter((s) => s.state === "success" || s.state === "skipped").length;
    if (doneCount === withPointer.steps.length) {
      const finished: ExecutionRecord = { ...withPointer, state: "Completed" };
      pushTimeline(finished, "execution.completed", `${executionId} completed by ${ops.role}`);
      audit("Execution completed", `${executionId} · ${finished.runbookId}`);
      audit("Incident timeline updated", `${executionId} · completion posted to ${finished.incidentId ?? "INC-10482"}`);
      if (finished.incidentId) {
        // Move to recovery validation for linked incidents
        setTimeout(() => navigate(`/runops/incidents/${finished.incidentId}/recovery`), 300);
      }
    }
  };

  const retryStep = (key: string) => {
    const step = record.steps.find((s) => s.key === key);
    if (!step) return;
    const next = updateStep(key, {
      state: "running",
      completedAt: null,
      startedAt: nowIso(),
      attempts: step.attempts + 1,
      actualResult: "",
    });
    pushTimeline({ ...next, currentStepKey: key }, "step.retry", `${key} · attempt ${step.attempts + 1}`);
    audit("Step retried", `${executionId} · ${key}`);
  };

  const openSkip = (key: string) => { setPendingStepKey(key); setJustification(""); setDialog("skip"); };

  const confirmSkip = () => {
    if (!pendingStepKey || justification.trim().length < 8) return;
    const step = record.steps.find((s) => s.key === pendingStepKey);
    if (!step) return;
    const meta = stepMetaMap.get(pendingStepKey);
    if (meta?.kind === "validate") {
      audit("Skip blocked", `Validation steps cannot be silently skipped`, "warning");
      setDialog(null);
      return;
    }
    const next = updateStep(pendingStepKey, {
      state: "skipped",
      completedAt: nowIso(),
      skipJustification: justification.trim(),
      actualResult: `Skipped: ${justification.trim()}`,
    });
    const pointer = next.steps.find((s) => s.state === "pending")?.key ?? pendingStepKey;
    pushTimeline({ ...next, currentStepKey: pointer }, "step.skipped", `${pendingStepKey} · ${justification.trim()}`);
    audit("Step skipped", `${executionId} · ${pendingStepKey} · ${justification.trim()}`, "warning");
    setDialog(null);
    setPendingStepKey(null);
    setJustification("");
  };

  const attachEvidence = (kind: EvidenceItem["kind"], auto: boolean, label?: string, detail?: string) => {
    if (!currentStep) return;
    const item: EvidenceItem = {
      id: rid("EV"),
      stepKey: currentStep.key,
      kind,
      label: label ?? (auto ? `Auto-captured ${kind}` : `Operator ${kind}`),
      detail: detail ?? (auto ? `Captured from step ${currentStep.key}` : ""),
      capturedAt: nowIso(),
      capturedBy: auto ? "system" : ops.role,
      auto,
    };
    const next: ExecutionRecord = { ...record, evidence: [...(record.evidence ?? []), item] };
    pushTimeline(next, "evidence.captured", `${item.kind} · ${item.label} · step ${currentStep.key}`);
    audit("Evidence captured", `${executionId} · ${currentStep.key} · ${item.kind}`);
  };

  const addNote = () => {
    if (!currentStep || noteText.trim().length === 0) return;
    const note = { id: rid("NT"), stepKey: currentStep.key, text: noteText.trim(), at: nowIso(), by: ops.role };
    const next: ExecutionRecord = { ...record, notes: [...(record.notes ?? []), note] };
    pushTimeline(next, "note.added", `${currentStep.key} · ${note.text.slice(0, 80)}`);
    audit("Operator note added", `${executionId} · ${currentStep.key}`);
    setNoteText("");
  };

  const requestDigitalWorker = () => {
    if (!currentStep) return;
    const next = pushTimeline(record, "assist.requested",
      `Digital worker requested for ${currentStep.key} · ${currentStep.label}`);
    persist({
      ...next,
      collaborators: Array.from(new Set([...(next.collaborators ?? []), "DW-Assist-02"])),
    });
    audit("Digital worker assistance requested", `${executionId} · ${currentStep.key}`);
  };

  const escalate = () => {
    if (!currentStep) return;
    const next = pushTimeline(record, "escalated",
      `Escalated at ${currentStep.key} to Incident Commander`);
    persist({
      ...next,
      collaborators: Array.from(new Set([...(next.collaborators ?? []), "Incident Commander"])),
    });
    audit("Execution escalated", `${executionId} · ${currentStep?.key} · Incident Commander paged`, "warning");
    setDialog(null);
  };

  const pauseExec = () => {
    if (record.pausedAt) return;
    const next: ExecutionRecord = { ...record, pausedAt: nowIso() };
    pushTimeline(next, "execution.paused", `Paused by ${ops.role}`);
    audit("Execution paused", `${executionId}`, "warning");
  };
  const resumeExec = () => {
    if (!record.pausedAt) return;
    const next: ExecutionRecord = { ...record, pausedAt: null };
    pushTimeline(next, "execution.resumed", `Resumed by ${ops.role}`);
    audit("Execution resumed", `${executionId}`);
  };

  const initiateRollback = () => {
    // rollback allowed only after at least one mitigation attempted
    const canRollback = record.steps.some((s) => {
      const k = stepMetaMap.get(s.key)?.kind;
      return (k === "mitigate") && (s.state === "success" || s.state === "failed" || s.state === "running");
    });
    if (!canRollback) {
      audit("Rollback unavailable", `${executionId} · no mitigation performed yet`, "warning");
      setDialog(null);
      return;
    }
    const rollbackStep = record.steps.find((s) => stepMetaMap.get(s.key)?.kind === "rollback");
    let next: ExecutionRecord = { ...record, rollbackActive: true, currentStepKey: rollbackStep?.key ?? record.currentStepKey };
    if (rollbackStep) {
      next = {
        ...next,
        steps: next.steps.map((s) => s.key === rollbackStep.key ? { ...s, state: "running", startedAt: nowIso(), attempts: s.attempts + 1 } : s),
      };
    }
    pushTimeline(next, "rollback.started", `Rollback initiated by ${ops.role}`);
    audit("Rollback initiated", `${executionId} · service ${service?.name ?? record.serviceId}`, "critical");
    audit("Service state updated", `${service?.name ?? record.serviceId} · rollback in progress`);
    setDialog(null);
  };

  const cancelExec = () => {
    const next: ExecutionRecord = { ...record, state: "Cancelled" };
    pushTimeline(next, "execution.cancelled", `Cancelled by ${ops.role}`);
    audit("Execution cancelled", `${executionId}`, "warning");
    setDialog(null);
  };

  const sendChat = () => {
    if (chatDraft.trim().length === 0) return;
    const msg = { id: rid("CH"), at: nowIso(), by: ops.role, text: chatDraft.trim() };
    const next: ExecutionRecord = { ...record, chat: [...(record.chat ?? []), msg] };
    pushTimeline(next, "collab.chat", `${ops.role}: ${msg.text.slice(0, 60)}`);
    setChatDraft("");
  };

  /* ------------------ AI (NOVA) recommendation ------------------ */

  const nova = useMemo(() => {
    const meta = currentStep ? stepMetaMap.get(currentStep.key) : undefined;
    const kind = meta?.kind ?? "diagnose";
    const attempts = currentStep?.attempts ?? 0;
    const hasEv = (record.evidence ?? []).some((e) => e.stepKey === currentStep?.key);
    let confidence = 78;
    let action = "Proceed with the current step as documented.";
    const evidence: string[] = [
      `Runbook ${record.runbookId} ${record.runbookVersion} fitness ${runbook?.fitnessScore ?? "n/a"}%`,
      `${completed}/${record.steps.length} steps completed · elapsed ${fmtClock(elapsed)}`,
      hasEv ? "Evidence captured for current step" : "No evidence captured yet for current step",
    ];
    if (kind === "mitigate" && attempts >= 2) { action = "Escalate: two mitigation attempts indicate a deeper regression."; confidence = 62; }
    if (kind === "validate" && !hasEv) { action = "Capture synthetic-journey evidence before confirming validation."; confidence = 71; }
    if (record.rollbackActive) { action = "Complete rollback validation and re-check SLIs before resuming."; confidence = 66; }
    if (record.pausedAt) { action = "Resume when the incident bridge is present; timer is running against SLO."; confidence = 58; }
    if (derivedState === "Completed") { action = "Move to Recovery Validation on the linked incident."; confidence = 88; }
    const uncertainty = [
      "Model has limited visibility into third-party payment provider latency",
      attempts >= 2 ? "Multiple attempts suggest ambiguous root cause" : "Single-tenant sample only",
    ];
    const sources = [
      `Runbook ${record.runbookId} ${record.runbookVersion}`,
      `Service ${service?.id ?? record.serviceId}`,
      `Incident ${record.incidentId ?? "INC-10482"}`,
      "Execution Evidence Store",
    ];
    return { action, confidence, evidence, uncertainty, sources };
  }, [currentStep, stepMetaMap, record, runbook, service, completed, elapsed, derivedState]);

  /* ------------------ Render ------------------ */

  const stateBadge: Record<ExecutionState, string> = {
    NotStarted:       "border-slate-300 bg-slate-50 text-slate-900",
    Running:          "border-emerald-300 bg-emerald-50 text-emerald-900",
    AwaitingInput:    "border-amber-300 bg-amber-50 text-amber-900",
    AwaitingApproval: "border-sky-300 bg-sky-50 text-sky-900",
    Paused:           "border-amber-300 bg-amber-50 text-amber-900",
    StepFailed:       "border-rose-300 bg-rose-50 text-rose-900",
    RollbackActive:   "border-rose-300 bg-rose-50 text-rose-900",
    Completed:        "border-emerald-300 bg-emerald-50 text-emerald-900",
    Cancelled:        "border-slate-300 bg-slate-50 text-slate-900",
  };
  const stepBadge: Record<StepState, string> = {
    "pending":          "border-slate-300 bg-slate-50 text-slate-900",
    "running":          "border-emerald-300 bg-emerald-50 text-emerald-900",
    "awaiting-input":   "border-amber-300 bg-amber-50 text-amber-900",
    "success":          "border-emerald-300 bg-emerald-50 text-emerald-900",
    "failed":           "border-rose-300 bg-rose-50 text-rose-900",
    "skipped":          "border-slate-300 bg-slate-50 text-slate-700",
  };

  const currentMeta = currentStep ? stepMetaMap.get(currentStep.key) : undefined;
  const currentKind = currentMeta?.kind ?? "diagnose";
  const currentDesc = currentMeta?.description ?? "Follow the runbook instruction.";
  const currentNeedsEv = requiresEvidence(currentKind);
  const currentEv = (record.evidence ?? []).filter((e) => e.stepKey === currentStep?.key);
  const currentNotes = (record.notes ?? []).filter((n) => n.stepKey === currentStep?.key);
  const canRollback = record.steps.some((s) => stepMetaMap.get(s.key)?.kind === "mitigate"
    && (s.state === "success" || s.state === "failed" || s.state === "running"));
  const isTerminal = derivedState === "Completed" || derivedState === "Cancelled";

  return (
    <div className="flex flex-col gap-3 p-4 md:p-6" aria-label="Guided operator execution">
      <EntityHeader
        eyebrow="Guided execution"
        title={`${record.id} · ${runbook?.title ?? record.runbookId}`}
        subtitle={`${record.runbookId} ${record.runbookVersion} · ${service?.name ?? record.serviceId} · ${record.environment}`}
        meta={
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Tenant: <span className="text-foreground">{ops.tenant.name}</span></span>
            <span>Role: <span className="text-foreground">{ops.role}</span></span>
            <span>Scenario: <span className="text-foreground">{ops.stages[ops.stageIndex]?.label ?? "—"}</span></span>
            <span className="inline-flex items-center gap-1"><TimerIcon className="h-3 w-3" /> {fmtClock(elapsed)}</span>
            <span>Incident: <span className="text-foreground">{record.incidentId ?? "—"}</span></span>
            <Badge variant="outline" className={cn("border", stateBadge[derivedState])}>{derivedState}</Badge>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/runops/runbooks/${record.runbookId}`)} aria-label="Back to runbook">
              <ArrowLeft className="h-4 w-4" /> Runbook
            </Button>
            {record.pausedAt
              ? <Button variant="outline" size="sm" onClick={resumeExec} disabled={isTerminal} aria-label="Resume execution"><Play className="h-4 w-4" /> Resume</Button>
              : <Button variant="outline" size="sm" onClick={pauseExec} disabled={isTerminal} aria-label="Pause execution"><Pause className="h-4 w-4" /> Pause</Button>}
            <Button variant="outline" size="sm" onClick={() => setDialog("chat")} aria-label="Open collaborator chat"><MessageSquare className="h-4 w-4" /> Chat</Button>
            <Button variant="outline" size="sm" onClick={() => setDialog("escalate")} disabled={isTerminal} aria-label="Escalate"><UserPlus className="h-4 w-4" /> Escalate</Button>
            <Button variant="outline" size="sm" onClick={() => setDialog("rollback")}
              disabled={!canRollback || isTerminal}
              title={!canRollback ? "Rollback becomes available once a mitigation step has run" : "Initiate rollback"}
              aria-label="Initiate rollback">
              <Undo2 className="h-4 w-4" /> Rollback
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDialog("cancel")} disabled={isTerminal} aria-label="Cancel execution"><Square className="h-4 w-4" /> Cancel</Button>
          </div>
        }
      />

      {/* Progress + service context */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <span className="font-medium">{completed}</span> completed ·{" "}
              <span className="font-medium">{remaining}</span> remaining ·{" "}
              <span className="text-muted-foreground">step {(record.steps.findIndex((s) => s.key === currentStep?.key) + 1) || 1} of {record.steps.length}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline">Service · {service?.name ?? record.serviceId}</Badge>
              <Badge variant="outline">Health · {service?.health ?? "n/a"}</Badge>
              <Badge variant="outline">Env · {record.environment}</Badge>
              <Badge variant="outline">Mode · {record.mode}</Badge>
              <Badge variant="outline">Change · {record.changeTicket || "none"}</Badge>
            </div>
          </div>
          <Progress value={progressPct} aria-label="Execution progress" />
        </CardContent>
      </Card>

      {/* Guard bands */}
      {record.pausedAt && (
        <Card><CardContent className="p-3 text-sm flex items-center gap-2 text-amber-900 bg-amber-50 border border-amber-200 rounded-md">
          <Pause className="h-4 w-4" /> Execution paused — timer keeps running against SLO. Resume when ready.
        </CardContent></Card>
      )}
      {derivedState === "StepFailed" && (
        <Card><CardContent className="p-3 text-sm flex items-center gap-2 text-rose-900 bg-rose-50 border border-rose-200 rounded-md">
          <AlertTriangle className="h-4 w-4" /> A step has failed. Retry, capture additional evidence, or initiate rollback.
        </CardContent></Card>
      )}
      {record.rollbackActive && (
        <Card><CardContent className="p-3 text-sm flex items-center gap-2 text-rose-900 bg-rose-50 border border-rose-200 rounded-md">
          <ShieldAlert className="h-4 w-4" /> Rollback active — validate service state before resuming forward progress.
        </CardContent></Card>
      )}
      {derivedState === "Completed" && (
        <Card><CardContent className="p-3 text-sm flex items-center gap-2 text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-md">
          <CheckCircle2 className="h-4 w-4" /> Execution complete. Redirecting to Recovery Validation for {record.incidentId ?? "linked incident"}…
        </CardContent></Card>
      )}

      {/* Main split */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-3">
        {/* Left column: current step + step list */}
        <div className="flex flex-col gap-3">
          {/* Current step card */}
          {currentStep && (
            <Card>
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Current step · {currentKind}</div>
                    <div className="text-base font-medium">{currentStep.label}</div>
                    <div className="text-sm text-muted-foreground">{currentDesc}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn("border", stepBadge[currentStep.state])}>{currentStep.state}</Badge>
                    <Badge variant="outline">Attempts · {currentStep.attempts}</Badge>
                    <Badge variant="outline">Risk · {currentKind === "rollback" ? "High" : currentKind === "mitigate" ? "Medium" : "Low"}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-md border p-3 bg-muted/30">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Command / action preview</div>
                    <pre className="text-xs whitespace-pre-wrap font-mono leading-5">
{currentKind === "mitigate"
  ? `ops.apply --runbook ${record.runbookId} --step ${currentStep.key} \\\n  --components ${record.components.join(",")} \\\n  --env ${record.environment} --change ${record.changeTicket || "TBD"}`
  : currentKind === "validate"
  ? `ops.validate --runbook ${record.runbookId} --step ${currentStep.key} \\\n  --synthetic checkout_journey --slo p95`
  : currentKind === "rollback"
  ? `ops.rollback --runbook ${record.runbookId} --step ${currentStep.key} \\\n  --restore-prior --components ${record.components.join(",")}`
  : `ops.diagnose --runbook ${record.runbookId} --step ${currentStep.key} \\\n  --service ${record.serviceId}`}
                    </pre>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Expected result</div>
                    <div className="text-sm">{currentStep.expectedResult}</div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mt-3 mb-1">Actual result</div>
                    <Textarea
                      value={currentStep.actualResult}
                      onChange={(e) => updateStep(currentStep.key, { actualResult: e.target.value })}
                      placeholder="Record the observed outcome…"
                      className="text-sm"
                      aria-label="Actual result"
                      disabled={currentStep.state === "success" || currentStep.state === "skipped" || isTerminal || !!record.pausedAt}
                    />
                    {currentStep.state !== "pending" && currentStep.actualResult.trim().length > 0 && (
                      <div className={cn("mt-2 text-xs rounded px-2 py-1 inline-block border",
                        currentStep.actualResult.toLowerCase().includes(currentStep.expectedResult.toLowerCase().slice(0, 12))
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : "border-amber-300 bg-amber-50 text-amber-900")}>
                        {currentStep.actualResult.toLowerCase().includes(currentStep.expectedResult.toLowerCase().slice(0, 12))
                          ? "Actual matches expected"
                          : "Actual differs from expected — verify before proceeding"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Evidence panel */}
                <div className="rounded-md border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Evidence {currentNeedsEv && <span className="text-rose-700 normal-case tracking-normal">(required to complete)</span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => attachEvidence("log", true)} disabled={isTerminal} aria-label="Capture log evidence">
                        <Activity className="h-4 w-4" /> Auto-capture output
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEvidenceLabel(""); setEvidenceDetail(""); setDialog("evidence"); }} disabled={isTerminal} aria-label="Attach evidence">
                        <Upload className="h-4 w-4" /> Attach
                      </Button>
                    </div>
                  </div>
                  {currentEv.length === 0
                    ? <div className="text-xs text-muted-foreground">No evidence captured for this step yet.</div>
                    : <ul className="text-xs space-y-1">
                        {currentEv.map((e) => (
                          <li key={e.id} className="flex items-center justify-between gap-2 border rounded px-2 py-1">
                            <span className="truncate">
                              <Badge variant="outline" className="mr-2">{e.kind}</Badge>
                              {e.label} <span className="text-muted-foreground">· {e.auto ? "auto" : e.capturedBy}</span>
                            </span>
                            <span className="text-muted-foreground">{new Date(e.capturedAt).toLocaleTimeString()}</span>
                          </li>
                        ))}
                      </ul>}
                </div>

                {/* Notes */}
                <div className="rounded-md border p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Operator notes</div>
                  <div className="flex gap-2">
                    <Input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note visible on the incident timeline…" aria-label="Note" disabled={isTerminal} />
                    <Button size="sm" variant="outline" onClick={addNote} disabled={isTerminal || !noteText.trim()} aria-label="Add note"><FileText className="h-4 w-4" /> Add</Button>
                  </div>
                  {currentNotes.length > 0 && (
                    <ul className="mt-2 text-xs space-y-1">
                      {currentNotes.map((n) => (
                        <li key={n.id} className="border rounded px-2 py-1"><span className="text-muted-foreground">{new Date(n.at).toLocaleTimeString()} · {n.by}:</span> {n.text}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Step actions */}
                <div className="flex flex-wrap gap-2">
                  {currentStep.state === "pending" && (
                    <Button size="sm" onClick={() => startStep(currentStep.key)} disabled={!!record.pausedAt || isTerminal} aria-label="Start step">
                      <Play className="h-4 w-4" /> Start step
                    </Button>
                  )}
                  {currentStep.state === "running" && (
                    <>
                      <Button size="sm" onClick={() => confirmStep(currentStep.key, "success")}
                        disabled={isTerminal || !!record.pausedAt || (currentNeedsEv && currentEv.length === 0)}
                        title={currentNeedsEv && currentEv.length === 0 ? "Capture evidence before confirming" : "Confirm success"}
                        aria-label="Confirm success">
                        <CheckCircle2 className="h-4 w-4" /> Confirm success
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => confirmStep(currentStep.key, "failed")} disabled={isTerminal} aria-label="Mark step failed">
                        <AlertTriangle className="h-4 w-4" /> Mark failed
                      </Button>
                    </>
                  )}
                  {(currentStep.state === "failed" || currentStep.state === "running") && (
                    <Button size="sm" variant="outline" onClick={() => retryStep(currentStep.key)} disabled={isTerminal} aria-label="Retry step">
                      <RotateCcw className="h-4 w-4" /> Retry
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => openSkip(currentStep.key)}
                    disabled={isTerminal || currentStep.state === "success" || currentStep.state === "skipped" || currentKind === "validate"}
                    title={currentKind === "validate" ? "Validation steps cannot be skipped" : "Skip with required justification"}
                    aria-label="Skip step">
                    <SkipForward className="h-4 w-4" /> Skip
                  </Button>
                  <Button size="sm" variant="outline" onClick={requestDigitalWorker} disabled={isTerminal} aria-label="Request digital worker assistance">
                    <Zap className="h-4 w-4" /> Digital worker assist
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step list */}
          <Card>
            <CardContent className="p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">All steps</div>
              <ul className="divide-y">
                {record.steps.map((s, i) => {
                  const meta = stepMetaMap.get(s.key);
                  const isCurrent = s.key === currentStep?.key;
                  return (
                    <li key={s.key} className={cn("flex items-center justify-between gap-2 py-2 text-sm", isCurrent && "bg-muted/40 -mx-4 px-4")}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
                        <ChevronRight className={cn("h-3 w-3", isCurrent ? "text-foreground" : "text-muted-foreground/40")} />
                        <span className="truncate">{s.label}</span>
                        <Badge variant="outline" className="text-[10px]">{meta?.kind ?? "step"}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.attempts > 0 && <span className="text-xs text-muted-foreground">×{s.attempts}</span>}
                        <Badge variant="outline" className={cn("border", stepBadge[s.state])}>{s.state}</Badge>
                        <Button size="sm" variant="ghost" onClick={() => persist({ ...record, currentStepKey: s.key })} aria-label={`Focus ${s.label}`}>Focus</Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right column: NOVA + timeline + collaborators */}
        <div className="flex flex-col gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">NOVA recommendation</div>
                <Badge variant="outline">{nova.confidence}% confidence</Badge>
              </div>
              <div className="text-sm font-medium mb-2">{nova.action}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-2">Evidence</div>
              <ul className="text-xs list-disc pl-4 space-y-0.5">{nova.evidence.map((e, i) => <li key={i}>{e}</li>)}</ul>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-2">Uncertainty</div>
              <ul className="text-xs list-disc pl-4 space-y-0.5">{nova.uncertainty.map((e, i) => <li key={i}>{e}</li>)}</ul>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-2">Sources</div>
              <ul className="text-xs list-disc pl-4 space-y-0.5">{nova.sources.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Collaborators</div>
              <div className="flex flex-wrap gap-1">
                {(record.collaborators ?? []).map((c) => <Badge key={c} variant="outline">{c}</Badge>)}
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-3 mb-1">Rollback readiness</div>
              <div className="text-xs">{canRollback ? "Available — mitigation performed" : "Unavailable — no mitigation yet"}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-3 mb-1">Incident</div>
              <div className="text-xs">
                {record.incidentId
                  ? <button className="underline underline-offset-2" onClick={() => navigate(`/runops/incidents/${record.incidentId}`)}>{record.incidentId}</button>
                  : "Not linked"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Timeline</div>
              <ul className="text-xs space-y-1 max-h-72 overflow-auto">
                {record.timeline.slice().reverse().map((t, i) => (
                  <li key={i} className="border rounded px-2 py-1"><span className="text-muted-foreground">{new Date(t.at).toLocaleTimeString()} · {t.kind}:</span> {t.detail}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={dialog === "skip"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Skip step with justification</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="just">Justification (min 8 characters)</Label>
            <Textarea id="just" value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Explain why this step is safe to skip…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={confirmSkip} disabled={justification.trim().length < 8}>Skip step</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "rollback"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Initiate rollback?</DialogTitle></DialogHeader>
          <div className="text-sm">
            Rollback restores prior state for <span className="font-medium">{service?.name ?? record.serviceId}</span>.
            Rollback is only available after a mitigation step has run.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={initiateRollback} disabled={!canRollback}>Initiate rollback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "escalate"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Escalate execution</DialogTitle></DialogHeader>
          <div className="text-sm">Page the Incident Commander and attach the current execution context.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={escalate}>Escalate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "cancel"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel execution?</DialogTitle></DialogHeader>
          <div className="text-sm">Cancellation is only allowed when no rollback is in progress. This is auditable.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Keep running</Button>
            <Button onClick={cancelExec} disabled={record.rollbackActive}>Cancel execution</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "chat"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Collaborator chat</DialogTitle></DialogHeader>
          <div className="max-h-64 overflow-auto space-y-1 text-xs border rounded p-2">
            {(record.chat ?? []).length === 0 && <div className="text-muted-foreground">No messages yet.</div>}
            {(record.chat ?? []).map((m) => (
              <div key={m.id}><span className="text-muted-foreground">{new Date(m.at).toLocaleTimeString()} · {m.by}:</span> {m.text}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={chatDraft} onChange={(e) => setChatDraft(e.target.value)} placeholder="Message the bridge…" aria-label="Chat message" />
            <Button onClick={sendChat} disabled={!chatDraft.trim()}>Send</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "evidence"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Attach evidence</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ev-label">Label</Label>
            <Input id="ev-label" value={evidenceLabel} onChange={(e) => setEvidenceLabel(e.target.value)} placeholder="e.g. checkout p95 dashboard 10:34" />
            <Label htmlFor="ev-detail">Detail</Label>
            <Textarea id="ev-detail" value={evidenceDetail} onChange={(e) => setEvidenceDetail(e.target.value)} placeholder="Paste log excerpt, metric value, or link…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => { attachEvidence("note", false, evidenceLabel || "Operator evidence", evidenceDetail); setDialog(null); }} disabled={!evidenceLabel.trim()}>Attach</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
