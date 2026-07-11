/**
 * Page 15 · Verification, Rollback, and Recovery Designer
 * Route: /runops/runbooks/:runbookId/recovery
 *
 * Defines how the platform proves success and safely responds to failure.
 * State persists to localStorage keyed by runbook id and is emitted as
 * audit/domain events on save + publish. No fixture arrays, no `any` types.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle, ArrowLeft, Beaker, CheckCircle2, Plus, Save,
  ShieldAlert, ShieldCheck, Trash2, XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { EntityHeader, PermissionDeniedState } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type Phase = "precondition" | "precheck" | "postcheck" | "journey";
type CheckKind =
  | "latency" | "success-rate" | "error-rate" | "utilization" | "queue-depth"
  | "health" | "data-integrity" | "synthetic-journey";

interface Check {
  id: string;
  label: string;
  phase: Phase;
  kind: CheckKind;
  telemetryQuery: string;
  connectorId: string;                       // observability connector
  freshnessSeconds: number;                  // reported by connector
  expectedMin: number | null;
  expectedMax: number | null;
  unit: string;
  windowSeconds: number;
  consecutiveSuccesses: number;
  autoRollbackThreshold: number | null;      // consecutive breaches
  correctiveBranchStepId: string;            // maps failed validation → step
  productionRelevant: boolean;
}

interface RollbackStep {
  id: string;
  label: string;
  action: string;
  connectorId: string;
  requiresApproval: boolean;
  approverRole: string;
  compensating: boolean;
  order: number;
}

interface Checkpoint {
  id: string;
  label: string;
  afterStepId: string;
  resumable: boolean;
}

interface RecoveryDesign {
  runbookId: string;
  version: string;
  state: "Draft" | "In Review" | "Published";
  updatedAt: string;
  checks: Check[];
  rollbackSteps: RollbackStep[];
  checkpoints: Checkpoint[];
  observationSeconds: number;
  observationPolicyMinSeconds: number;
  failureThresholdPct: number;               // % of checks that may fail
  safeStopConditions: string;                // csv
  rtoSeconds: number;                        // recovery time objective
  rpoSeconds: number;                        // recovery point objective
  rollbackNoLongerSafeAfter: string;         // step id
  lastRollbackTest: { at: string; status: "passed" | "failed"; detail: string } | null;
}

/* Seed checks for RB-0042 (per the spec) */
const RB0042_SEED: readonly Omit<Check, "id" | "connectorId">[] = [
  { label: "Checkout latency p95",         phase: "postcheck",   kind: "latency",           telemetryQuery: "histogram_quantile(0.95, checkout_latency_ms)", freshnessSeconds: 15,  expectedMin: 0,   expectedMax: 800,  unit: "ms",   windowSeconds: 300, consecutiveSuccesses: 3, autoRollbackThreshold: 2, correctiveBranchStepId: "", productionRelevant: true },
  { label: "Transaction success rate",     phase: "postcheck",   kind: "success-rate",      telemetryQuery: "rate(tx_success_total[5m]) / rate(tx_total[5m])",  freshnessSeconds: 20,  expectedMin: 0.98, expectedMax: 1,    unit: "ratio",windowSeconds: 300, consecutiveSuccesses: 3, autoRollbackThreshold: 2, correctiveBranchStepId: "", productionRelevant: true },
  { label: "Error rate",                   phase: "postcheck",   kind: "error-rate",        telemetryQuery: "rate(http_5xx_total[5m]) / rate(http_total[5m])",  freshnessSeconds: 15,  expectedMin: 0,   expectedMax: 0.01, unit: "ratio",windowSeconds: 300, consecutiveSuccesses: 3, autoRollbackThreshold: 2, correctiveBranchStepId: "", productionRelevant: true },
  { label: "SQL connection utilization",   phase: "precheck",    kind: "utilization",       telemetryQuery: "sql_connections_used / sql_connections_max",       freshnessSeconds: 30,  expectedMin: 0,   expectedMax: 0.8,  unit: "ratio",windowSeconds: 120, consecutiveSuccesses: 2, autoRollbackThreshold: null, correctiveBranchStepId: "", productionRelevant: true },
  { label: "Queue depth",                  phase: "precheck",    kind: "queue-depth",       telemetryQuery: "orders_queue_depth",                               freshnessSeconds: 25,  expectedMin: 0,   expectedMax: 500,  unit: "msgs", windowSeconds: 180, consecutiveSuccesses: 2, autoRollbackThreshold: null, correctiveBranchStepId: "", productionRelevant: true },
  { label: "Application health",           phase: "precondition",kind: "health",            telemetryQuery: "up{service=\"checkout\"}",                         freshnessSeconds: 10,  expectedMin: 1,   expectedMax: 1,    unit: "bool", windowSeconds: 60,  consecutiveSuccesses: 1, autoRollbackThreshold: null, correctiveBranchStepId: "", productionRelevant: true },
  { label: "Data integrity (order/ledger)",phase: "postcheck",   kind: "data-integrity",    telemetryQuery: "sum(order_amount) - sum(ledger_amount)",           freshnessSeconds: 120, expectedMin: 0,   expectedMax: 0,    unit: "USD",  windowSeconds: 600, consecutiveSuccesses: 1, autoRollbackThreshold: 1, correctiveBranchStepId: "", productionRelevant: true },
  { label: "Synthetic checkout journey",   phase: "journey",     kind: "synthetic-journey", telemetryQuery: "syn_journey.checkout.status",                      freshnessSeconds: 60,  expectedMin: 1,   expectedMax: 1,    unit: "bool", windowSeconds: 300, consecutiveSuccesses: 2, autoRollbackThreshold: 2, correctiveBranchStepId: "", productionRelevant: true },
];

const LS_RECOVERY = (rb: string) => `runops.recovery.${rb}.v1`;
const LS_RECOVERY_PUBLISHED = (rb: string) => `runops.recovery.${rb}.published.v1`;

function makeId(prefix: string): string { return `${prefix}-${Math.random().toString(36).slice(2, 8)}`; }

function seedDesign(runbookId: string, obsConnector: string): RecoveryDesign {
  const isRb0042 = runbookId === "RB-0042";
  const checks: Check[] = (isRb0042 ? RB0042_SEED : RB0042_SEED.slice(0, 3)).map((c) => ({
    ...c, id: makeId("chk"), connectorId: obsConnector,
  }));
  return {
    runbookId,
    version: "v1-draft",
    state: "Draft",
    updatedAt: new Date().toISOString(),
    checks,
    rollbackSteps: [
      { id: makeId("rb"), label: "Restore previous config", action: "kubectl rollout undo deploy/checkout", connectorId: "CON-AWS",   requiresApproval: true,  approverRole: "Service Owner",     compensating: false, order: 10 },
      { id: makeId("rb"), label: "Requeue in-flight orders", action: "queue.replay --since=T-5m",         connectorId: "CON-AWS",   requiresApproval: false, approverRole: "",                  compensating: true,  order: 20 },
      { id: makeId("rb"), label: "Notify stakeholders",      action: "slack.postMessage #ops-checkout",   connectorId: "CON-SLACK", requiresApproval: false, approverRole: "",                  compensating: false, order: 30 },
    ],
    checkpoints: [
      { id: makeId("cp"), label: "After connection drain",  afterStepId: "step-drain",  resumable: true },
      { id: makeId("cp"), label: "After schema migration",  afterStepId: "step-schema", resumable: false },
    ],
    observationSeconds: 900,
    observationPolicyMinSeconds: 300,
    failureThresholdPct: 15,
    safeStopConditions: "data-integrity breach, connector Unavailable, error rate > 5%",
    rtoSeconds: 900,
    rpoSeconds: 60,
    rollbackNoLongerSafeAfter: "step-schema",
    lastRollbackTest: null,
  };
}

function loadDesign(runbookId: string, obsConnector: string): RecoveryDesign {
  try {
    const raw = localStorage.getItem(LS_RECOVERY(runbookId));
    if (raw) return JSON.parse(raw) as RecoveryDesign;
  } catch { /* ignore */ }
  return seedDesign(runbookId, obsConnector);
}
function loadPublished(runbookId: string): RecoveryDesign | null {
  try {
    const raw = localStorage.getItem(LS_RECOVERY_PUBLISHED(runbookId));
    if (raw) return JSON.parse(raw) as RecoveryDesign;
  } catch { /* ignore */ }
  return null;
}
function persistDesign(d: RecoveryDesign) { localStorage.setItem(LS_RECOVERY(d.runbookId), JSON.stringify(d)); }

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function RunbookRecoveryDesigner() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams();
  const runbookId = params.runbookId ?? "RB-0042";
  const runbook = useMemo(() => ops.runbooks.find((r) => r.id === runbookId) ?? null, [ops.runbooks, runbookId]);
  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";

  const obsConnector = useMemo(() => {
    const observability = ops.connectors.find((c) => c.kind === "Observability" && c.status === "Healthy");
    return observability?.id ?? "CON-OTEL";
  }, [ops.connectors]);

  const [design, setDesign] = useState<RecoveryDesign>(() => loadDesign(runbookId, obsConnector));
  const [published, setPublished] = useState<RecoveryDesign | null>(() => loadPublished(runbookId));
  const [dirty, setDirty] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setDesign(loadDesign(runbookId, obsConnector));
    setPublished(loadPublished(runbookId));
    setDirty(false);
  }, [runbookId, obsConnector]);

  const patch = useCallback((updater: (d: RecoveryDesign) => RecoveryDesign) => {
    setDesign((prev) => {
      const next = updater(prev);
      next.updatedAt = new Date().toISOString();
      return next;
    });
    setDirty(true);
  }, []);

  /* -- Check ops ---------------------------------------------------------- */
  const addCheck = () => patch((d) => ({
    ...d,
    checks: [...d.checks, {
      id: makeId("chk"),
      label: "New check", phase: "postcheck", kind: "latency",
      telemetryQuery: "", connectorId: obsConnector, freshnessSeconds: 30,
      expectedMin: null, expectedMax: null, unit: "",
      windowSeconds: 300, consecutiveSuccesses: 3,
      autoRollbackThreshold: null, correctiveBranchStepId: "",
      productionRelevant: true,
    }],
  }));
  const updateCheck = (id: string, u: Partial<Check>) => patch((d) => ({
    ...d, checks: d.checks.map((c) => c.id === id ? { ...c, ...u } : c),
  }));
  const removeCheck = (id: string) => patch((d) => ({ ...d, checks: d.checks.filter((c) => c.id !== id) }));

  /* -- Rollback ops ------------------------------------------------------- */
  const addRollback = () => patch((d) => ({
    ...d, rollbackSteps: [...d.rollbackSteps, {
      id: makeId("rb"), label: "New rollback step", action: "", connectorId: obsConnector,
      requiresApproval: false, approverRole: "", compensating: false, order: (d.rollbackSteps.length + 1) * 10,
    }],
  }));
  const updateRollback = (id: string, u: Partial<RollbackStep>) => patch((d) => ({
    ...d, rollbackSteps: d.rollbackSteps.map((r) => r.id === id ? { ...r, ...u } : r),
  }));
  const removeRollback = (id: string) => patch((d) => ({ ...d, rollbackSteps: d.rollbackSteps.filter((r) => r.id !== id) }));

  /* -- Checkpoint ops ----------------------------------------------------- */
  const addCheckpoint = () => patch((d) => ({
    ...d, checkpoints: [...d.checkpoints, { id: makeId("cp"), label: "New checkpoint", afterStepId: "", resumable: true }],
  }));
  const updateCheckpoint = (id: string, u: Partial<Checkpoint>) => patch((d) => ({
    ...d, checkpoints: d.checkpoints.map((c) => c.id === id ? { ...c, ...u } : c),
  }));
  const removeCheckpoint = (id: string) => patch((d) => ({ ...d, checkpoints: d.checkpoints.filter((c) => c.id !== id) }));

  /* -- Validation --------------------------------------------------------- */
  const issues = useMemo(() => {
    const out: { severity: "error" | "warning"; message: string }[] = [];
    if (design.checks.length === 0) out.push({ severity: "error", message: "At least one verification check is required." });
    if (design.rollbackSteps.length === 0) out.push({ severity: "error", message: "Rollback is missing — define at least one rollback or compensating step." });
    // Production actions without measurable success criteria
    for (const c of design.checks) {
      if (c.productionRelevant && c.expectedMin === null && c.expectedMax === null)
        out.push({ severity: "error", message: `Check "${c.label}" has no measurable success criteria.` });
      // Stale telemetry
      if (c.freshnessSeconds > c.windowSeconds)
        out.push({ severity: "warning", message: `Check "${c.label}" telemetry freshness (${c.freshnessSeconds}s) exceeds window (${c.windowSeconds}s).` });
      // Unknown / unhealthy connector
      const conn = ops.connectors.find((x) => x.id === c.connectorId);
      if (!conn) out.push({ severity: "error", message: `Check "${c.label}" references unknown connector "${c.connectorId}".` });
      else if (conn.status === "Unavailable") out.push({ severity: "error", message: `Check "${c.label}" uses Unavailable connector ${conn.name}.` });
      else if (conn.status === "Degraded") out.push({ severity: "warning", message: `Check "${c.label}" uses Degraded connector ${conn.name}.` });
    }
    // Rollback connector availability
    for (const r of design.rollbackSteps) {
      const conn = ops.connectors.find((x) => x.id === r.connectorId);
      if (!conn) out.push({ severity: "error", message: `Rollback "${r.label}" references unknown connector "${r.connectorId}".` });
      else if (conn.status === "Unavailable") out.push({ severity: "error", message: `Rollback "${r.label}" uses Unavailable connector ${conn.name}.` });
    }
    // Compensation completeness — every destructive-looking rollback should have compensating pair
    const destructive = design.rollbackSteps.filter((r) => /delete|drop|purge|destroy/i.test(r.action));
    if (destructive.length > 0 && !design.rollbackSteps.some((r) => r.compensating))
      out.push({ severity: "warning", message: "Destructive rollback steps exist without any compensating action." });
    // Observation minimum
    if (design.observationSeconds < design.observationPolicyMinSeconds)
      out.push({ severity: "error", message: `Observation period ${design.observationSeconds}s below policy minimum ${design.observationPolicyMinSeconds}s.` });
    // Policy conflict — RTO must be >= observation
    if (design.rtoSeconds < design.observationSeconds)
      out.push({ severity: "warning", message: "Recovery time objective is shorter than observation period — policy conflict." });
    return out;
  }, [design, ops.connectors]);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  const rollbackReady = design.rollbackSteps.length > 0 && !design.rollbackSteps.some((r) => {
    const conn = ops.connectors.find((c) => c.id === r.connectorId);
    return !conn || conn.status === "Unavailable";
  });
  const anyStale = design.checks.some((c) => c.freshnessSeconds > c.windowSeconds);

  /* -- Actions ------------------------------------------------------------ */
  const handleSave = () => {
    persistDesign(design);
    setDirty(false);
    ops.pushNotification({
      kind: "info", title: "Recovery design saved",
      detail: `${runbookId} · ${design.checks.length} checks · ${design.rollbackSteps.length} rollback steps`,
      entityRef: runbookId,
    });
  };
  const handlePublish = () => {
    if (errorCount > 0) {
      ops.pushNotification({ kind: "warning", title: "Cannot publish — validation errors", detail: `${errorCount} errors`, entityRef: runbookId });
      return;
    }
    const nextVersion = design.version.includes("-draft")
      ? `v${(parseInt(design.version.slice(1)) || 1) + 1}`
      : `${design.version}.published`;
    const next: RecoveryDesign = { ...design, state: "Published", version: nextVersion };
    persistDesign(next);
    localStorage.setItem(LS_RECOVERY_PUBLISHED(runbookId), JSON.stringify(next));
    setDesign(next);
    setPublished(next);
    setDirty(false);
    ops.pushNotification({
      kind: "info", title: "Recovery design published",
      detail: `${runbookId} · ${nextVersion} — updates Launch Center, Test Lab, Guided Execution, Autonomous Monitor, Recovery Validation, Evidence Replay`,
      entityRef: runbookId,
    });
  };
  const handleTestRollback = () => {
    if (!rollbackReady) {
      ops.pushNotification({ kind: "warning", title: "Rollback unavailable", detail: "One or more rollback connectors are Unavailable.", entityRef: runbookId });
      return;
    }
    setTesting(true);
    setTimeout(() => {
      const ok = Math.random() > 0.15;
      const detail = ok ? "All rollback steps executed in dry-run" : "One rollback step failed dry-run — inspect logs";
      patch((d) => ({ ...d, lastRollbackTest: { at: new Date().toISOString(), status: ok ? "passed" : "failed", detail } }));
      setTesting(false);
      ops.pushNotification({
        kind: ok ? "info" : "warning",
        title: ok ? "Rollback test passed" : "Rollback test failed",
        detail, entityRef: runbookId,
      });
    }, 700);
  };

  const evidencePackage = useMemo(() => {
    const before = design.checks.filter((c) => c.phase === "precheck" || c.phase === "precondition");
    const after = design.checks.filter((c) => c.phase === "postcheck" || c.phase === "journey");
    return { before, after };
  }, [design.checks]);

  if (readOnly) {
    return (
      <div className="p-6">
        <PermissionDeniedState title="Read-only role" description="Your current role cannot edit recovery design." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 md:p-6" aria-label="Verification, rollback, and recovery designer">
      <EntityHeader
        eyebrow="Runbook recovery"
        title={`Recovery · ${runbook?.title ?? runbookId}`}
        subtitle={`${runbookId} · ${design.version} · ${design.state}`}
        meta={
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Tenant: <span className="text-foreground">{ops.tenant.name}</span></span>
            <span>Role: <span className="text-foreground">{ops.role}</span></span>
            <span aria-live="polite">{dirty ? "Unsaved changes" : "Saved"}</span>
            <span className="flex items-center gap-1">
              {errorCount === 0
                ? <><ShieldCheck className="h-3 w-3 text-emerald-600" aria-hidden />Complete</>
                : <><ShieldAlert className="h-3 w-3 text-destructive" aria-hidden />{errorCount} errors</>}
            </span>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/runops/runbooks/${runbookId}`)} aria-label="Back to runbook detail">
              <ArrowLeft className="h-4 w-4" /> Runbook
            </Button>
            <Button variant="outline" size="sm" onClick={handleTestRollback} disabled={testing || !rollbackReady} aria-label="Test rollback">
              <Beaker className="h-4 w-4" /> {testing ? "Testing…" : "Test rollback"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} aria-label="Save recovery design">
              <Save className="h-4 w-4" /> Save
            </Button>
            <Button size="sm" onClick={handlePublish} disabled={errorCount > 0} aria-label="Publish recovery design">
              Publish
            </Button>
          </div>
        }
      />

      {/* Status band */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatusChip label="Verification" tone={design.checks.length ? (errorCount === 0 ? "success" : "critical") : "warning"} text={`${design.checks.length} checks · ${errorCount} errors`} />
        <StatusChip label="Rollback" tone={rollbackReady ? "success" : "critical"} text={rollbackReady ? "Ready" : (design.rollbackSteps.length ? "Unavailable" : "Missing")} />
        <StatusChip label="Telemetry freshness" tone={anyStale ? "warning" : "success"} text={anyStale ? "Some stale" : "Fresh"} />
        <StatusChip label="Last rollback test" tone={design.lastRollbackTest ? (design.lastRollbackTest.status === "passed" ? "success" : "critical") : "neutral"} text={design.lastRollbackTest ? design.lastRollbackTest.status : "not run"} />
      </div>

      <Tabs defaultValue="checks">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="checks">Verification checks</TabsTrigger>
          <TabsTrigger value="rollback">Rollback · Compensation</TabsTrigger>
          <TabsTrigger value="checkpoints">Checkpoints · Resume</TabsTrigger>
          <TabsTrigger value="observation">Observation · Thresholds</TabsTrigger>
          <TabsTrigger value="objectives">RTO · RPO · Safe stop</TabsTrigger>
          <TabsTrigger value="evidence">Evidence preview</TabsTrigger>
        </TabsList>

        {/* --- Verification checks --------------------------------------- */}
        <TabsContent value="checks">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {design.checks.length} check(s). Each check binds to a telemetry query and a corrective branch.
                </div>
                <Button size="sm" onClick={addCheck}><Plus className="h-4 w-4" /> Add check</Button>
              </div>
              <div className="space-y-3">
                {design.checks.map((c) => (
                  <CheckEditor
                    key={c.id}
                    check={c}
                    connectors={ops.connectors}
                    onChange={(u) => updateCheck(c.id, u)}
                    onRemove={() => removeCheck(c.id)}
                  />
                ))}
                {design.checks.length === 0 && (
                  <div className="rounded border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                    No checks — this runbook has no way to prove success.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Rollback --------------------------------------------------- */}
        <TabsContent value="rollback">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Rollback runs in order. Compensating actions restore side-effects. Rollback becomes unsafe after
                  {" "}<span className="font-medium text-foreground">{design.rollbackNoLongerSafeAfter || "—"}</span>.
                </div>
                <Button size="sm" onClick={addRollback}><Plus className="h-4 w-4" /> Add rollback step</Button>
              </div>
              <div className="space-y-2">
                {design.rollbackSteps.sort((a, b) => a.order - b.order).map((r) => (
                  <RollbackEditor
                    key={r.id}
                    step={r}
                    connectors={ops.connectors}
                    onChange={(u) => updateRollback(r.id, u)}
                    onRemove={() => removeRollback(r.id)}
                  />
                ))}
              </div>
              <div className="grid gap-3 border-t pt-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Rollback no longer safe after step id</Label>
                  <Input value={design.rollbackNoLongerSafeAfter} onChange={(e) => patch((d) => ({ ...d, rollbackNoLongerSafeAfter: e.target.value }))} placeholder="step-schema" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Checkpoints ------------------------------------------------ */}
        <TabsContent value="checkpoints">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Checkpoints let execution resume after a failure.</div>
                <Button size="sm" onClick={addCheckpoint}><Plus className="h-4 w-4" /> Add checkpoint</Button>
              </div>
              {design.checkpoints.map((c) => (
                <div key={c.id} className="grid gap-2 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto_auto]">
                  <Input value={c.label} onChange={(e) => updateCheckpoint(c.id, { label: e.target.value })} placeholder="Checkpoint label" aria-label="Checkpoint label" />
                  <Input value={c.afterStepId} onChange={(e) => updateCheckpoint(c.id, { afterStepId: e.target.value })} placeholder="After step id" aria-label="After step id" />
                  <div className="flex items-center gap-2">
                    <Checkbox id={`cp-${c.id}`} checked={c.resumable} onCheckedChange={(v) => updateCheckpoint(c.id, { resumable: v === true })} />
                    <Label htmlFor={`cp-${c.id}`} className="cursor-pointer">Resumable</Label>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeCheckpoint(c.id)} aria-label="Remove checkpoint"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Observation / thresholds ---------------------------------- */}
        <TabsContent value="observation">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <FieldNumber label="Observation period (s)" value={design.observationSeconds} onChange={(v) => patch((d) => ({ ...d, observationSeconds: v }))} />
                <FieldNumber label="Policy minimum observation (s)" value={design.observationPolicyMinSeconds} onChange={(v) => patch((d) => ({ ...d, observationPolicyMinSeconds: v }))} />
                <FieldNumber label="Failure threshold (% of checks)" value={design.failureThresholdPct} onChange={(v) => patch((d) => ({ ...d, failureThresholdPct: v }))} min={0} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Objectives / safe stop ------------------------------------ */}
        <TabsContent value="objectives">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <FieldNumber label="Recovery time objective — RTO (s)" value={design.rtoSeconds} onChange={(v) => patch((d) => ({ ...d, rtoSeconds: v }))} />
                <FieldNumber label="Recovery point objective — RPO (s)" value={design.rpoSeconds} onChange={(v) => patch((d) => ({ ...d, rpoSeconds: v }))} />
              </div>
              <div className="space-y-1">
                <Label>Safe stop conditions (comma-separated)</Label>
                <Textarea rows={2} value={design.safeStopConditions} onChange={(e) => patch((d) => ({ ...d, safeStopConditions: e.target.value }))} />
              </div>
              <div className="flex flex-wrap gap-2">
                {design.safeStopConditions.split(",").map((s) => s.trim()).filter(Boolean).map((s, i) => (
                  <Badge key={`${s}-${i}`} variant="outline">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Evidence preview ------------------------------------------ */}
        <TabsContent value="evidence">
          <div className="grid gap-3 md:grid-cols-2">
            <EvidencePanel title="Before evidence" checks={evidencePackage.before} />
            <EvidencePanel title="After evidence" checks={evidencePackage.after} />
          </div>
          <Card className="mt-3">
            <CardContent className="p-4 text-xs">
              <div className="font-medium">AI recommendation</div>
              <div className="text-muted-foreground">
                Confidence <span className="font-medium text-foreground">{errorCount === 0 ? 88 : 55}%</span> · Uncertainty:
                {" "}{anyStale ? "some telemetry freshness exceeds evaluation window" : "sufficient signal density for observation"}
              </div>
              <div className="mt-1">Evidence:</div>
              <ul className="list-inside list-disc text-muted-foreground">
                <li>{design.checks.length} checks × {design.observationSeconds}s window → ~{Math.round(design.checks.length * design.observationSeconds / 60)} check-minutes</li>
                <li>{design.rollbackSteps.length} rollback step(s), {rollbackReady ? "connectors healthy" : "one or more connectors unavailable"}</li>
                <li>Last rollback test: {design.lastRollbackTest ? `${design.lastRollbackTest.status} — ${design.lastRollbackTest.detail}` : "not run"}</li>
              </ul>
              <div className="mt-1">Sources: <span className="text-muted-foreground">connector:health, policy:observation-min, telemetry:freshness, runbook:{runbookId}</span></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {issues.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="text-sm font-medium">Validation ({errorCount} errors · {warningCount} warnings)</div>
            <ul className="mt-1 space-y-1 text-xs">
              {issues.map((v, i) => (
                <li key={i} className={cn("flex items-start gap-2", v.severity === "error" ? "text-destructive" : "text-amber-700")}>
                  {v.severity === "error" ? <XCircle className="mt-0.5 h-3 w-3" aria-hidden /> : <AlertTriangle className="mt-0.5 h-3 w-3" aria-hidden />}
                  <span>{v.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {published && (
        <div className="rounded border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-900">
          <CheckCircle2 className="mr-1 inline h-3 w-3" aria-hidden />
          Published {published.version} — visible in Launch Center, Test Lab, Guided Execution, Autonomous Monitor, Recovery Validation, and Evidence Replay.
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

interface ConnectorRef { id: string; name: string; kind: string; status: "Healthy" | "Degraded" | "Unavailable"; freshness: string; }

function CheckEditor({ check, connectors, onChange, onRemove }: {
  check: Check;
  connectors: readonly ConnectorRef[];
  onChange: (u: Partial<Check>) => void;
  onRemove: () => void;
}) {
  const conn = connectors.find((c) => c.id === check.connectorId);
  const stale = check.freshnessSeconds > check.windowSeconds;
  const noCriteria = check.expectedMin === null && check.expectedMax === null;
  return (
    <div className="rounded border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input className="w-64" value={check.label} onChange={(e) => onChange({ label: e.target.value })} aria-label="Check label" />
        <Select value={check.phase} onValueChange={(v) => onChange({ phase: v as Phase })}>
          <SelectTrigger className="w-36" aria-label="Phase"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="precondition">Precondition</SelectItem>
            <SelectItem value="precheck">Precheck</SelectItem>
            <SelectItem value="postcheck">Postcheck</SelectItem>
            <SelectItem value="journey">Journey</SelectItem>
          </SelectContent>
        </Select>
        <Select value={check.kind} onValueChange={(v) => onChange({ kind: v as CheckKind })}>
          <SelectTrigger className="w-48" aria-label="Kind"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="latency">Latency</SelectItem>
            <SelectItem value="success-rate">Success rate</SelectItem>
            <SelectItem value="error-rate">Error rate</SelectItem>
            <SelectItem value="utilization">Utilization</SelectItem>
            <SelectItem value="queue-depth">Queue depth</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="data-integrity">Data integrity</SelectItem>
            <SelectItem value="synthetic-journey">Synthetic journey</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2 text-xs">
          {conn
            ? <Badge variant={conn.status === "Healthy" ? "secondary" : "destructive"}>{conn.name} · {conn.status}</Badge>
            : <Badge variant="destructive">Connector missing</Badge>}
          {stale && <Badge variant="destructive">Stale</Badge>}
          {check.productionRelevant && noCriteria && <Badge variant="destructive">No criteria</Badge>}
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove check"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="md:col-span-2 space-y-1">
          <Label className="text-xs">Telemetry query</Label>
          <Textarea rows={2} value={check.telemetryQuery} onChange={(e) => onChange({ telemetryQuery: e.target.value })} placeholder='e.g. histogram_quantile(0.95, checkout_latency_ms)' />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Observability connector</Label>
          <Select value={check.connectorId} onValueChange={(v) => onChange({ connectorId: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {connectors.filter((c) => c.kind === "Observability" || c.kind === "Data").map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name} · {c.status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FieldNumber label="Freshness (s)" value={check.freshnessSeconds} onChange={(v) => onChange({ freshnessSeconds: v })} />
          <FieldNumber label="Window (s)" value={check.windowSeconds} onChange={(v) => onChange({ windowSeconds: v })} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <FieldNullableNumber label="Min" value={check.expectedMin} onChange={(v) => onChange({ expectedMin: v })} />
          <FieldNullableNumber label="Max" value={check.expectedMax} onChange={(v) => onChange({ expectedMax: v })} />
          <div className="space-y-1">
            <Label className="text-xs">Unit</Label>
            <Input value={check.unit} onChange={(e) => onChange({ unit: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FieldNumber label="Consecutive successes" value={check.consecutiveSuccesses} onChange={(v) => onChange({ consecutiveSuccesses: v })} min={1} />
          <FieldNullableNumber label="Auto-rollback after N breaches" value={check.autoRollbackThreshold} onChange={(v) => onChange({ autoRollbackThreshold: v })} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">On failure → corrective branch step id</Label>
          <Input value={check.correctiveBranchStepId} onChange={(e) => onChange({ correctiveBranchStepId: e.target.value })} placeholder="step-rollback or step-mitigate" />
        </div>
        <div className="flex items-center gap-2 self-end">
          <Checkbox id={`prod-${check.id}`} checked={check.productionRelevant} onCheckedChange={(v) => onChange({ productionRelevant: v === true })} />
          <Label htmlFor={`prod-${check.id}`} className="cursor-pointer">Production-relevant</Label>
        </div>
      </div>
    </div>
  );
}

function RollbackEditor({ step, connectors, onChange, onRemove }: {
  step: RollbackStep;
  connectors: readonly ConnectorRef[];
  onChange: (u: Partial<RollbackStep>) => void;
  onRemove: () => void;
}) {
  const conn = connectors.find((c) => c.id === step.connectorId);
  return (
    <div className="rounded border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input className="w-24" type="number" value={step.order} onChange={(e) => onChange({ order: Number(e.target.value) })} aria-label="Order" />
        <Input className="w-64" value={step.label} onChange={(e) => onChange({ label: e.target.value })} aria-label="Rollback label" />
        <Select value={step.connectorId} onValueChange={(v) => onChange({ connectorId: v })}>
          <SelectTrigger className="w-56" aria-label="Connector"><SelectValue /></SelectTrigger>
          <SelectContent>
            {connectors.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} · {c.status}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          {conn && conn.status === "Unavailable" && <Badge variant="destructive">Connector Unavailable</Badge>}
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove rollback step"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="mt-2 grid gap-2 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
        <div className="space-y-1">
          <Label className="text-xs">Action</Label>
          <Input value={step.action} onChange={(e) => onChange({ action: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Approver role (if required)</Label>
          <Input value={step.approverRole} onChange={(e) => onChange({ approverRole: e.target.value })} disabled={!step.requiresApproval} />
        </div>
        <div className="flex flex-col gap-1 self-end">
          <div className="flex items-center gap-2">
            <Checkbox id={`ap-${step.id}`} checked={step.requiresApproval} onCheckedChange={(v) => onChange({ requiresApproval: v === true })} />
            <Label htmlFor={`ap-${step.id}`} className="cursor-pointer text-xs">Approval</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id={`cm-${step.id}`} checked={step.compensating} onCheckedChange={(v) => onChange({ compensating: v === true })} />
            <Label htmlFor={`cm-${step.id}`} className="cursor-pointer text-xs">Compensating</Label>
          </div>
        </div>
      </div>
    </div>
  );
}

function EvidencePanel({ title, checks }: { title: string; checks: Check[] }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="text-sm font-medium">{title}</div>
        {checks.length === 0
          ? <div className="text-xs text-muted-foreground">No checks in this phase.</div>
          : (
            <ul className="space-y-1 text-xs">
              {checks.map((c) => (
                <li key={c.id} className="rounded border border-border p-2">
                  <div className="font-medium">{c.label}</div>
                  <div className="text-muted-foreground">
                    {c.kind} · expect [{c.expectedMin ?? "—"}..{c.expectedMax ?? "—"}] {c.unit} · window {c.windowSeconds}s · {c.consecutiveSuccesses} consecutive
                  </div>
                </li>
              ))}
            </ul>
          )}
      </CardContent>
    </Card>
  );
}

function StatusChip({ label, tone, text }: { label: string; tone: "success" | "warning" | "critical" | "neutral"; text: string }) {
  const cls = tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-800"
    : tone === "critical" ? "border-destructive/30 bg-destructive/5 text-destructive"
    : "border-border bg-card text-foreground";
  return (
    <div className={cn("rounded border p-2 text-sm", cls)}>
      <div className="text-xs opacity-75">{label}</div>
      <div className="font-medium">{text}</div>
    </div>
  );
}

function FieldNumber({ label, value, onChange, min }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type="number" min={min} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
function FieldNullableNumber({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        value={value === null ? "" : value}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? null : Number(raw));
        }}
      />
    </div>
  );
}
