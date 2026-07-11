/**
 * Page 16 · Test, Simulation, and Historical Replay Lab
 * Route: /runops/runbooks/:runbookId/test
 *
 * Non-destructive validation harness for runbook behaviour. All context flows
 * through useOperations(); scenarios, results, and regression suite entries
 * persist to localStorage keyed by runbook id. No fixture arrays, no `any`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle, ArrowLeft, Beaker, Bookmark, CheckCircle2, ClipboardCheck,
  FileWarning, Pause, Play, RefreshCw, Square, XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { EntityHeader, PermissionDeniedState } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

const TEST_MODES = [
  "Step Unit Test",
  "Connector Contract Test",
  "Workflow Integration Test",
  "Dry Run",
  "Sandbox Execution",
  "Historical Event Replay",
  "Digital Twin Simulation",
  "Rollback Test",
  "Canary Test",
  "Load and Concurrency Test",
  "Failure Injection",
] as const;
type TestMode = (typeof TEST_MODES)[number];

const SCENARIO_LIB = [
  "Healthy — no action required",
  "SQL connection saturation",
  "Recent index deployment",
  "Connector unavailable",
  "Approval denied",
  "Validation failure",
  "Rollback required",
  "Low confidence digital worker",
  "Runner interruption",
] as const;
type Scenario = (typeof SCENARIO_LIB)[number];

type ResultState = "Not run" | "Running" | "Passed" | "Failed" | "Cancelled" | "Partial" | "Test environment unavailable";

interface StepTrace {
  key: string;
  label: string;
  status: "pending" | "running" | "pass" | "fail" | "skipped";
  durationMs: number;
  expected: string;
  actual: string;
  evidenceIds: string[];
}

interface TestRun {
  id: string;
  runbookId: string;
  mode: TestMode;
  scenario: Scenario;
  environment: string;
  incidentRef: string;              // for replay mode
  startedAt: string;
  finishedAt: string | null;
  state: ResultState;
  progress: number;                 // 0..100
  pathTaken: string[];
  stepsCovered: number;
  totalSteps: number;
  policiesEvaluated: number;
  approvalsSimulated: number;
  evidenceCaptured: string[];
  rollbackResult: "not-triggered" | "passed" | "failed";
  untestedPaths: string[];
  productionFitnessDelta: number;   // fitness score delta
  steps: StepTrace[];
  failures: string[];
  promotedToRegression: boolean;
}

const LS_HISTORY = (rb: string) => `runops.testlab.${rb}.history.v1`;
const LS_REGRESSION = (rb: string) => `runops.testlab.${rb}.regression.v1`;

function nowIso() { return new Date().toISOString(); }
function makeId(prefix: string) { return `${prefix}-${Math.random().toString(36).slice(2, 8)}`; }

/* -------------------------------------------------------------------------- */
/* Deterministic scenario tuning                                               */
/* -------------------------------------------------------------------------- */

interface ScenarioOutcome {
  expectedState: ResultState;
  policiesEvaluated: number;
  approvalsSimulated: number;
  rollbackResult: TestRun["rollbackResult"];
  fitnessDelta: number;
  stepPlan: { key: string; label: string; result: StepTrace["status"]; expected: string; actual: string; evidenceIds: string[] }[];
  failures: string[];
  untestedPaths: string[];
}

function planScenario(
  scenario: Scenario, mode: TestMode,
  runbookSteps: { key: string; label: string }[],
  incidentId: string,
): ScenarioOutcome {
  const evidenceForIncident = ["EV-101", "EV-102", "EV-103", "EV-104", "EV-105"];
  const passAll = runbookSteps.map((s, i) => ({
    key: s.key, label: s.label, result: "pass" as StepTrace["status"],
    expected: "success", actual: "success",
    evidenceIds: mode === "Historical Event Replay" && incidentId ? [evidenceForIncident[i % evidenceForIncident.length]] : [],
  }));

  switch (scenario) {
    case "Healthy — no action required":
      return {
        expectedState: "Passed",
        policiesEvaluated: 4, approvalsSimulated: 0,
        rollbackResult: "not-triggered", fitnessDelta: 1,
        stepPlan: passAll.map((s, i) => i === 0 ? { ...s, actual: "no-op — baseline healthy" } : { ...s, result: "skipped", expected: "skipped", actual: "skipped" }),
        failures: [], untestedPaths: ["s6-fallback"],
      };
    case "SQL connection saturation":
      return {
        expectedState: "Passed",
        policiesEvaluated: 6, approvalsSimulated: 1,
        rollbackResult: "not-triggered", fitnessDelta: 2,
        stepPlan: passAll.map((s) => ({ ...s, actual: `applied · ${s.label.toLowerCase()}` })),
        failures: [], untestedPaths: ["s6-fallback"],
      };
    case "Recent index deployment":
      return {
        expectedState: "Passed",
        policiesEvaluated: 5, approvalsSimulated: 1,
        rollbackResult: "not-triggered", fitnessDelta: 3,
        stepPlan: passAll.map((s) => ({ ...s, actual: "matched historical path" })),
        failures: [], untestedPaths: [],
      };
    case "Connector unavailable":
      return {
        expectedState: "Test environment unavailable",
        policiesEvaluated: 2, approvalsSimulated: 0,
        rollbackResult: "not-triggered", fitnessDelta: 0,
        stepPlan: passAll.map((s, i) => i < 2 ? { ...s } : { ...s, result: "skipped", expected: "connector call", actual: "skipped — connector Unavailable" }),
        failures: ["Connector Azure DevOps reported Unavailable during precheck."],
        untestedPaths: ["s3-mitigate", "s5-validate"],
      };
    case "Approval denied":
      return {
        expectedState: "Cancelled",
        policiesEvaluated: 5, approvalsSimulated: 1,
        rollbackResult: "not-triggered", fitnessDelta: 0,
        stepPlan: passAll.map((s, i) => i < 2 ? { ...s } : i === 2 ? { ...s, result: "fail", expected: "approved", actual: "denied by Change Manager" } : { ...s, result: "skipped", expected: "skipped", actual: "skipped" }),
        failures: ["Approval denied at s3 — execution halted per policy."],
        untestedPaths: ["s3-mitigate", "s4-mitigate", "s5-validate"],
      };
    case "Validation failure":
      return {
        expectedState: "Failed",
        policiesEvaluated: 5, approvalsSimulated: 1,
        rollbackResult: "passed", fitnessDelta: -1,
        stepPlan: passAll.map((s, i) => i < 4 ? { ...s } : i === 4 ? { ...s, result: "fail", expected: "p95 < 800ms", actual: "p95 = 1420ms" } : { ...s, result: "pass", actual: "rollback executed" }),
        failures: ["Postcheck: checkout latency p95 above threshold."],
        untestedPaths: [],
      };
    case "Rollback required":
      return {
        expectedState: "Partial",
        policiesEvaluated: 5, approvalsSimulated: 1,
        rollbackResult: "passed", fitnessDelta: 0,
        stepPlan: passAll.map((s, i) => i < 3 ? { ...s } : i === 3 ? { ...s, result: "fail", expected: "success", actual: "connection recycle timed out" } : { ...s, result: "pass", actual: "rollback executed" }),
        failures: ["Mitigation step s4 timed out; rollback triggered and passed."],
        untestedPaths: [],
      };
    case "Low confidence digital worker":
      return {
        expectedState: "Partial",
        policiesEvaluated: 6, approvalsSimulated: 2,
        rollbackResult: "not-triggered", fitnessDelta: 0,
        stepPlan: passAll.map((s, i) => i < 3 ? { ...s } : { ...s, actual: "escalated to human — confidence 61% below floor" }),
        failures: ["Digital worker confidence 61% below rule floor 70% — extra approval simulated."],
        untestedPaths: ["s6-fallback"],
      };
    case "Runner interruption":
      return {
        expectedState: "Failed",
        policiesEvaluated: 4, approvalsSimulated: 1,
        rollbackResult: "failed", fitnessDelta: -2,
        stepPlan: passAll.map((s, i) => i < 3 ? { ...s } : i === 3 ? { ...s, result: "fail", expected: "success", actual: "runner disconnected" } : { ...s, result: "skipped", expected: "skipped", actual: "unable to resume" }),
        failures: ["Runner heartbeat lost during s4; rollback also failed."],
        untestedPaths: ["s5-validate", "s6-fallback"],
      };
  }
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function RunbookTestLab() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams();
  const runbookId = params.runbookId ?? "RB-0042";
  const runbook = useMemo(() => ops.runbooks.find((r) => r.id === runbookId) ?? null, [ops.runbooks, runbookId]);
  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";

  const runbookSteps = useMemo(() => {
    if (runbook && runbook.steps.length) return runbook.steps.map((s) => ({ key: s.key, label: s.label }));
    return [
      { key: "s1", label: "Confirm degradation signature" },
      { key: "s2", label: "Identify offending index" },
      { key: "s3", label: "Revert affected index" },
      { key: "s4", label: "Recycle checkout app connections" },
      { key: "s5", label: "Validate journey and SLIs" },
      { key: "s6", label: "Fallback: raise connection pool cap" },
    ];
  }, [runbook]);

  /* Config */
  const [mode, setMode] = useState<TestMode>("Sandbox Execution");
  const [scenario, setScenario] = useState<Scenario>("SQL connection saturation");
  const [environment, setEnvironment] = useState<string>("Staging");
  const [incidentRef, setIncidentRef] = useState<string>("INC-10482");

  /* Persistent history + regression */
  const [history, setHistory] = useState<TestRun[]>(() => {
    try { const raw = localStorage.getItem(LS_HISTORY(runbookId)); if (raw) return JSON.parse(raw) as TestRun[]; } catch { /* ignore */ }
    return [];
  });
  const [regression, setRegression] = useState<TestRun[]>(() => {
    try { const raw = localStorage.getItem(LS_REGRESSION(runbookId)); if (raw) return JSON.parse(raw) as TestRun[]; } catch { /* ignore */ }
    return [];
  });
  useEffect(() => { localStorage.setItem(LS_HISTORY(runbookId), JSON.stringify(history)); }, [history, runbookId]);
  useEffect(() => { localStorage.setItem(LS_REGRESSION(runbookId), JSON.stringify(regression)); }, [regression, runbookId]);

  /* Active run */
  const [run, setRun] = useState<TestRun | null>(null);
  const timerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const cancelledRef = useRef(false);

  const stopTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  useEffect(() => stopTimer, []);

  /* -- Start run ----------------------------------------------------------- */
  const startRun = useCallback(() => {
    if (readOnly) return;
    const outcome = planScenario(scenario, mode, runbookSteps, incidentRef);
    const isReplayMissing = mode === "Historical Event Replay" && !incidentRef.trim();
    const initial: TestRun = {
      id: makeId("run"),
      runbookId,
      mode, scenario,
      environment,
      incidentRef: mode === "Historical Event Replay" ? incidentRef : "",
      startedAt: nowIso(),
      finishedAt: null,
      state: isReplayMissing ? "Failed" : "Running",
      progress: 0,
      pathTaken: [],
      stepsCovered: 0,
      totalSteps: outcome.stepPlan.length,
      policiesEvaluated: 0,
      approvalsSimulated: 0,
      evidenceCaptured: [],
      rollbackResult: "not-triggered",
      untestedPaths: outcome.untestedPaths,
      productionFitnessDelta: 0,
      steps: outcome.stepPlan.map((s) => ({
        key: s.key, label: s.label, status: "pending",
        durationMs: 0, expected: s.expected, actual: "",
        evidenceIds: [],
      })),
      failures: isReplayMissing ? ["Historical Event Replay requires an incident id."] : [],
      promotedToRegression: false,
    };
    setRun(initial);
    ops.pushNotification({
      kind: "info", title: `Test started · ${scenario}`,
      detail: `${runbookId} · ${mode} · ${environment}${initial.incidentRef ? ` · ${initial.incidentRef}` : ""}`,
      entityRef: runbookId,
    });
    if (isReplayMissing) return;
    pausedRef.current = false;
    cancelledRef.current = false;

    let stepIndex = 0;
    stopTimer();
    timerRef.current = window.setInterval(() => {
      if (pausedRef.current) return;
      if (cancelledRef.current) {
        stopTimer();
        setRun((prev) => prev ? { ...prev, state: "Cancelled", finishedAt: nowIso(), progress: 100 } : prev);
        return;
      }
      const planned = outcome.stepPlan[stepIndex];
      if (!planned) {
        stopTimer();
        setRun((prev) => {
          if (!prev) return prev;
          const failed = prev.steps.some((s) => s.status === "fail");
          const anySkipped = prev.steps.some((s) => s.status === "skipped");
          const finalState: ResultState = outcome.expectedState;
          const finished: TestRun = {
            ...prev,
            state: finalState,
            finishedAt: nowIso(),
            progress: 100,
            stepsCovered: prev.steps.filter((s) => s.status === "pass" || s.status === "fail").length,
            policiesEvaluated: outcome.policiesEvaluated,
            approvalsSimulated: outcome.approvalsSimulated,
            rollbackResult: outcome.rollbackResult,
            productionFitnessDelta: outcome.fitnessDelta,
            failures: outcome.failures,
            pathTaken: prev.steps.filter((s) => s.status !== "skipped" && s.status !== "pending").map((s) => s.key),
            evidenceCaptured: prev.steps.flatMap((s) => s.evidenceIds),
          };
          setHistory((h) => [finished, ...h].slice(0, 25));
          ops.pushNotification({
            kind: finished.state === "Passed" ? "info" : finished.state === "Failed" ? "warning" : "info",
            title: `Test ${finished.state.toLowerCase()} · ${finished.scenario}`,
            detail: `${runbookId} · covered ${finished.stepsCovered}/${finished.totalSteps} · fitness Δ ${finished.productionFitnessDelta >= 0 ? "+" : ""}${finished.productionFitnessDelta}`,
            entityRef: runbookId,
          });
          if (finished.state === "Failed") {
            ops.pushNotification({
              kind: "warning", title: "Review task created",
              detail: `Failed test on ${runbookId} — investigate ${finished.failures[0] ?? "results"}.`,
              entityRef: runbookId,
            });
          }
          if (finished.state === "Passed") {
            ops.pushNotification({
              kind: "info", title: "Runbook Detail + Release updated",
              detail: `${runbookId} fitness Δ ${finished.productionFitnessDelta >= 0 ? "+" : ""}${finished.productionFitnessDelta} · gate advanced`,
              entityRef: runbookId,
            });
          }
          return finished;
        });
        void anySkipped; void failed;
        return;
      }
      const idx = stepIndex;
      setRun((prev) => {
        if (!prev) return prev;
        const nextSteps = prev.steps.slice();
        nextSteps[idx] = {
          ...nextSteps[idx],
          status: planned.result,
          durationMs: 120 + Math.floor(Math.random() * 300),
          actual: planned.actual,
          evidenceIds: planned.evidenceIds,
        };
        return {
          ...prev,
          steps: nextSteps,
          progress: Math.round(((idx + 1) / outcome.stepPlan.length) * 100),
        };
      });
      stepIndex += 1;
    }, 550);
  }, [environment, incidentRef, mode, ops, readOnly, runbookId, runbookSteps, scenario]);

  const pauseRun = () => { pausedRef.current = true; setRun((r) => r ? { ...r, state: "Running" } : r); };
  const resumeRun = () => { pausedRef.current = false; };
  const cancelRun = () => { cancelledRef.current = true; };

  /* -- Promote / regression / defect -------------------------------------- */
  const promoteToRegression = () => {
    if (!run || run.promotedToRegression) return;
    const marked: TestRun = { ...run, promotedToRegression: true };
    setRun(marked);
    setRegression((r) => [marked, ...r].slice(0, 50));
    setHistory((h) => h.map((x) => x.id === marked.id ? marked : x));
    ops.pushNotification({
      kind: "info", title: "Scenario added to regression suite",
      detail: `${runbookId} · ${marked.scenario} · visible in certification`,
      entityRef: runbookId,
    });
  };
  const promoteEvidence = () => {
    if (!run || run.evidenceCaptured.length === 0) return;
    ops.pushNotification({
      kind: "info", title: "Evidence promoted",
      detail: `${run.evidenceCaptured.length} artifact(s) attached to ${runbookId}`,
      entityRef: runbookId,
    });
  };
  const createDefect = () => {
    if (!run) return;
    ops.pushNotification({
      kind: "warning", title: "Defect created",
      detail: `${run.scenario} → ${run.failures[0] ?? "no failure detail"}`,
      entityRef: runbookId,
    });
  };
  const updateWorkflow = () => {
    ops.pushNotification({ kind: "info", title: "Workflow update queued", detail: `${runbookId} · updated corrective branch mapping`, entityRef: runbookId });
    navigate(`/runops/runbooks/${runbookId}/designer`);
  };

  /* -- Coverage ----------------------------------------------------------- */
  const coverage = useMemo(() => {
    const passed = new Set(regression.filter((r) => r.state === "Passed" || r.state === "Partial").flatMap((r) => r.pathTaken));
    return { covered: passed.size, total: runbookSteps.length };
  }, [regression, runbookSteps.length]);

  if (readOnly) {
    return (
      <div className="p-6">
        <PermissionDeniedState title="Read-only role" description="Your current role cannot run tests." />
      </div>
    );
  }

  const demoBlocked = ops.tenant.name.toLowerCase().includes("demo") || environment === "Production";
  const productionActionBlocked = demoBlocked && (mode === "Sandbox Execution" || mode === "Canary Test" || mode === "Load and Concurrency Test");

  return (
    <div className="flex flex-col gap-3 p-4 md:p-6" aria-label="Test, simulation, and historical replay lab">
      <EntityHeader
        eyebrow="Runbook test lab"
        title={`Test · ${runbook?.title ?? runbookId}`}
        subtitle={`${runbookId} · ${runbook?.version ?? "draft"}`}
        meta={
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Tenant: <span className="text-foreground">{ops.tenant.name}</span></span>
            <span>Env: <span className="text-foreground">{environment}</span></span>
            <span>Role: <span className="text-foreground">{ops.role}</span></span>
            <span>History: <span className="text-foreground">{history.length}</span></span>
            <span>Regression: <span className="text-foreground">{regression.length}</span></span>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/runops/runbooks/${runbookId}`)} aria-label="Back to runbook detail">
              <ArrowLeft className="h-4 w-4" /> Runbook
            </Button>
            {run?.state === "Running" ? (
              <>
                <Button variant="outline" size="sm" onClick={pausedRef.current ? resumeRun : pauseRun} aria-label={pausedRef.current ? "Resume" : "Pause"}>
                  <Pause className="h-4 w-4" /> {pausedRef.current ? "Resume" : "Pause"}
                </Button>
                <Button variant="outline" size="sm" onClick={cancelRun} aria-label="Cancel test">
                  <Square className="h-4 w-4" /> Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={startRun} disabled={productionActionBlocked} aria-label="Run test">
                <Play className="h-4 w-4" /> Run test
              </Button>
            )}
          </div>
        }
      />

      {productionActionBlocked && (
        <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
          <ShieldGuard /> Demo Mode blocks real infrastructure actions — switch to a non-production environment or use Dry Run / Digital Twin Simulation.
        </div>
      )}

      {/* Config band */}
      <div className="grid gap-3 md:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-xs">Test mode</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as TestMode)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TEST_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Scenario</Label>
          <Select value={scenario} onValueChange={(v) => setScenario(v as Scenario)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{SCENARIO_LIB.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Environment</Label>
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ops.environmentOptions.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Incident (Historical Replay)</Label>
          <Input value={incidentRef} onChange={(e) => setIncidentRef(e.target.value)} placeholder="INC-10482" disabled={mode !== "Historical Event Replay"} />
        </div>
      </div>

      {/* Status band */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatusChip label="State" tone={toneFor(run?.state ?? "Not run")} text={run?.state ?? "Not run"} />
        <StatusChip label="Steps covered" tone="neutral" text={`${run?.stepsCovered ?? 0}/${run?.totalSteps ?? runbookSteps.length}`} />
        <StatusChip label="Rollback" tone={run?.rollbackResult === "failed" ? "critical" : run?.rollbackResult === "passed" ? "success" : "neutral"} text={run?.rollbackResult ?? "not-triggered"} />
        <StatusChip label="Fitness Δ" tone={((run?.productionFitnessDelta ?? 0) >= 0) ? "success" : "critical"} text={`${(run?.productionFitnessDelta ?? 0) >= 0 ? "+" : ""}${run?.productionFitnessDelta ?? 0}`} />
      </div>

      <Tabs defaultValue="run">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="run">Run · Output</TabsTrigger>
          <TabsTrigger value="path">Workflow path</TabsTrigger>
          <TabsTrigger value="expected">Expected vs actual</TabsTrigger>
          <TabsTrigger value="evidence">Evidence · Coverage</TabsTrigger>
          <TabsTrigger value="failures">Failures</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="regression">Regression suite</TabsTrigger>
        </TabsList>

        <TabsContent value="run">
          <Card>
            <CardContent className="space-y-3 p-4">
              <Progress value={run?.progress ?? 0} aria-label="Test progress" />
              {run ? (
                <ul className="space-y-1 text-xs">
                  {run.steps.map((s) => (
                    <li key={s.key} className="flex items-center gap-2 rounded border border-border bg-card px-2 py-1">
                      <StepIcon status={s.status} />
                      <span className="w-8 text-muted-foreground">{s.key}</span>
                      <span className="flex-1">{s.label}</span>
                      <span className="text-muted-foreground">{s.durationMs}ms</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Not run — configure and press Run test.
                </div>
              )}

              {run && run.state !== "Running" && (
                <div className="flex flex-wrap gap-2 border-t pt-2">
                  <Button variant="outline" size="sm" onClick={promoteEvidence} disabled={!run.evidenceCaptured.length}>
                    <ClipboardCheck className="h-4 w-4" /> Promote evidence
                  </Button>
                  <Button variant="outline" size="sm" onClick={createDefect} disabled={run.state === "Passed"}>
                    <FileWarning className="h-4 w-4" /> Create defect
                  </Button>
                  <Button variant="outline" size="sm" onClick={updateWorkflow}>
                    <RefreshCw className="h-4 w-4" /> Update workflow
                  </Button>
                  <Button variant="outline" size="sm" onClick={promoteToRegression} disabled={run.promotedToRegression}>
                    <Bookmark className="h-4 w-4" /> {run.promotedToRegression ? "In regression" : "Save to regression"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="path">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium">Path taken</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {runbookSteps.map((s) => {
                  const trace = run?.steps.find((t) => t.key === s.key);
                  const state = trace?.status ?? "pending";
                  return (
                    <div key={s.key} className={cn(
                      "rounded border px-2 py-1 text-xs",
                      state === "pass" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : state === "fail" ? "border-destructive/30 bg-destructive/5 text-destructive"
                        : state === "skipped" ? "border-border bg-muted text-muted-foreground line-through"
                        : "border-border bg-card text-foreground",
                    )}>
                      <div className="text-[10px] text-muted-foreground">{s.key}</div>
                      <div>{s.label}</div>
                    </div>
                  );
                })}
              </div>
              {run && run.untestedPaths.length > 0 && (
                <div className="mt-3 text-xs">
                  <span className="text-muted-foreground">Untested paths:</span>{" "}
                  {run.untestedPaths.map((p) => <Badge key={p} variant="outline" className="mr-1">{p}</Badge>)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expected">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="p-2">Step</th>
                    <th className="p-2">Expected</th>
                    <th className="p-2">Actual</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {(run?.steps ?? []).map((s) => (
                    <tr key={s.key} className="border-t">
                      <td className="p-2 align-top">
                        <div className="font-medium">{s.label}</div>
                        <div className="text-[10px] text-muted-foreground">{s.key}</div>
                      </td>
                      <td className="p-2 align-top text-muted-foreground">{s.expected || "—"}</td>
                      <td className="p-2 align-top">{s.actual || "—"}</td>
                      <td className="p-2 align-top"><StepIcon status={s.status} labelled /></td>
                      <td className="p-2 align-top">{s.durationMs}ms</td>
                    </tr>
                  ))}
                  {!run && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No comparison yet — run a test.</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence">
          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardContent className="space-y-2 p-4">
                <div className="text-sm font-medium">Captured evidence</div>
                {run?.evidenceCaptured.length
                  ? <ul className="space-y-1 text-xs">
                      {run.evidenceCaptured.map((ev) => (
                        <li key={ev} className="rounded border border-border p-2">
                          <div className="font-medium">{ev}</div>
                          <div className="text-muted-foreground">Linked to {run.incidentRef || runbookId}</div>
                        </li>
                      ))}
                    </ul>
                  : <div className="text-xs text-muted-foreground">Run a Historical Event Replay against INC-10482 to capture evidence.</div>}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 p-4">
                <div className="text-sm font-medium">Regression coverage</div>
                <Progress value={(coverage.covered / Math.max(coverage.total, 1)) * 100} aria-label="Coverage" />
                <div className="text-xs text-muted-foreground">
                  {coverage.covered} of {coverage.total} step keys covered by regression scenarios.
                </div>
                <div className="mt-2 border-t pt-2 text-xs">
                  <div className="font-medium">AI recommendation</div>
                  <div className="text-muted-foreground">
                    Confidence <span className="font-medium text-foreground">{run ? 84 : 60}%</span> · Uncertainty:
                    {" "}{run ? (run.state === "Passed" ? "deterministic scenario tree" : "failure paths partially exercised") : "no active run"}
                  </div>
                  <div className="mt-1">Evidence:</div>
                  <ul className="list-inside list-disc text-muted-foreground">
                    <li>Scenario library covers {SCENARIO_LIB.length} canonical outcomes</li>
                    <li>Regression suite contains {regression.length} saved run(s)</li>
                    <li>Historical replay tied to {incidentRef || "no incident"}</li>
                  </ul>
                  <div className="mt-1">Sources: <span className="text-muted-foreground">scenario-library, evidence:{incidentRef || "—"}, runbook:{runbookId}, regression-suite</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="failures">
          <Card>
            <CardContent className="p-4">
              {run?.failures.length
                ? <ul className="space-y-1 text-xs">
                    {run.failures.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-destructive">
                        <XCircle className="mt-0.5 h-3 w-3" aria-hidden /><span>{f}</span>
                      </li>
                    ))}
                  </ul>
                : <div className="text-xs text-muted-foreground">No failures recorded.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="p-2">Started</th>
                    <th className="p-2">Mode</th>
                    <th className="p-2">Scenario</th>
                    <th className="p-2">Env</th>
                    <th className="p-2">State</th>
                    <th className="p-2">Covered</th>
                    <th className="p-2">Fitness Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-t">
                      <td className="p-2">{new Date(h.startedAt).toLocaleTimeString()}</td>
                      <td className="p-2">{h.mode}</td>
                      <td className="p-2">{h.scenario}</td>
                      <td className="p-2">{h.environment}</td>
                      <td className="p-2"><Badge variant="outline">{h.state}</Badge></td>
                      <td className="p-2">{h.stepsCovered}/{h.totalSteps}</td>
                      <td className="p-2">{h.productionFitnessDelta >= 0 ? "+" : ""}{h.productionFitnessDelta}</td>
                    </tr>
                  ))}
                  {history.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-muted-foreground">No test history yet.</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regression">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="p-2">Scenario</th>
                    <th className="p-2">Mode</th>
                    <th className="p-2">State</th>
                    <th className="p-2">Fitness Δ</th>
                    <th className="p-2">Saved</th>
                  </tr>
                </thead>
                <tbody>
                  {regression.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">{r.scenario}</td>
                      <td className="p-2">{r.mode}</td>
                      <td className="p-2"><Badge variant="outline">{r.state}</Badge></td>
                      <td className="p-2">{r.productionFitnessDelta >= 0 ? "+" : ""}{r.productionFitnessDelta}</td>
                      <td className="p-2">{new Date(r.startedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {regression.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Regression suite is empty. Promote a passing scenario.</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small subcomponents                                                         */
/* -------------------------------------------------------------------------- */

function StepIcon({ status, labelled }: { status: StepTrace["status"]; labelled?: boolean }) {
  if (status === "pass") return <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-3 w-3" aria-hidden />{labelled && "pass"}</span>;
  if (status === "fail") return <span className="inline-flex items-center gap-1 text-destructive"><XCircle className="h-3 w-3" aria-hidden />{labelled && "fail"}</span>;
  if (status === "running") return <span className="inline-flex items-center gap-1 text-primary"><Beaker className="h-3 w-3 animate-pulse" aria-hidden />{labelled && "running"}</span>;
  if (status === "skipped") return <span className="inline-flex items-center gap-1 text-muted-foreground"><AlertTriangle className="h-3 w-3" aria-hidden />{labelled && "skipped"}</span>;
  return <span className="inline-flex items-center gap-1 text-muted-foreground">·{labelled && "pending"}</span>;
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

function toneFor(state: ResultState): "success" | "warning" | "critical" | "neutral" {
  switch (state) {
    case "Passed": return "success";
    case "Failed":
    case "Test environment unavailable":
      return "critical";
    case "Partial":
    case "Cancelled":
    case "Running":
      return "warning";
    default: return "neutral";
  }
}

function ShieldGuard() {
  return <AlertTriangle className="mr-1 inline h-3 w-3" aria-hidden />;
}
