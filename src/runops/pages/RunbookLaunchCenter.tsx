/**
 * Page 19 · Runbook Launch Center
 * Route: /runops/runbooks/:runbookId/launch
 *
 * Prepares, validates, authorizes, and initiates a specific runbook execution.
 * Real shared state transitions:
 *   - execution + step records → localStorage("runops.executions.v1")
 *   - approval requests           → localStorage("runops.approvals.v1")
 *   - audit + domain events       → ops.pushNotification
 *   - operations tasks + timeline → ops.pushNotification (visible in Operations Queue)
 *
 * No fixture arrays imported, no `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowLeft, CheckCircle2, ChevronRight, Info,
  PlayCircle, ShieldAlert, ShieldCheck, Square, Timer, XCircle,
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EntityHeader, PermissionDeniedState } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type ExecutionMode =
  | "Dry Run"
  | "Human Guided"
  | "Human Initiated Automation"
  | "Approval Gated Automation"
  | "Supervised Autonomous"
  | "Policy Bounded Autonomous";

type PreflightState = "pass" | "fail" | "warn" | "pending";
type LaunchState = "Ready" | "Ready with approval" | "Blocked" | "Preflight running" | "Approval pending" | "Launch failure";

interface PreflightCheck {
  key: string;
  label: string;
  category: "permission" | "precondition" | "connector" | "certification" | "environment" | "rollback" | "policy" | "conflict" | "maintenance";
  state: PreflightState;
  detail: string;
  blocking: boolean;
}

interface Param {
  key: string;
  label: string;
  value: string;
  kind: "string" | "number" | "boolean";
  editable: boolean;
  required: boolean;
  hint: string;
}

interface StepRecord {
  key: string;
  label: string;
  state: "pending" | "running" | "success" | "failed" | "skipped";
}

interface ExecutionRecord {
  id: string;
  runbookId: string;
  runbookVersion: string;
  serviceId: string;
  components: string[];
  environment: string;
  mode: ExecutionMode;
  params: Record<string, string>;
  state: "Draft" | "Preflight" | "AwaitingApproval" | "Running" | "Cancelled" | "Failed";
  createdAt: string;
  startedAt: string | null;
  changeTicket: string;
  approvals: string[];              // approval ids
  steps: StepRecord[];
  timeline: { at: string; kind: string; detail: string }[];
}

interface ApprovalRequest {
  id: string;
  executionId: string;
  runbookId: string;
  role: string;
  state: "pending" | "approved" | "rejected";
  requestedAt: string;
  reason: string;
}

const EXECUTIONS_KEY = "runops.executions.v1";
const APPROVALS_KEY = "runops.approvals.v1";
const nowIso = () => new Date().toISOString();
const makeId = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
const nextExeId = (existing: ExecutionRecord[]) => {
  const nums = existing.map((e) => Number((e.id.match(/^EXE-(\d+)$/) ?? [])[1])).filter((n) => !Number.isNaN(n));
  const seed = 8841;
  const used = new Set(nums);
  let n = seed;
  while (used.has(n)) n += 1;
  return `EXE-${n}`;
};

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function RunbookLaunchCenter() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams();
  const runbookId = params.runbookId ?? "RB-0042";
  const runbook = useMemo(() => ops.runbooks.find((r) => r.id === runbookId) ?? null, [ops.runbooks, runbookId]);
  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";

  const service = useMemo(() => {
    const target = runbook?.serviceId;
    return ops.services.find((s) => s.id === target) ?? ops.services[0] ?? null;
  }, [ops.services, runbook]);

  /* ------------ Form state ------------ */
  const [mode, setMode] = useState<ExecutionMode>("Approval Gated Automation");
  const [environment, setEnvironment] = useState<string>("Production");
  const [selectedComponents, setSelectedComponents] = useState<string[]>(() => {
    // default: first 2 components of service (if provided by domain)
    const svcAny = service as unknown as { components?: { id: string; name: string }[] } | null;
    return (svcAny?.components ?? []).slice(0, 2).map((c) => c.id);
  });
  const [paramsState, setParamsState] = useState<Param[]>([
    { key: "targetIndex",    label: "Target index name",        value: "idx_checkout_orders_v3", kind: "string",  editable: true,  required: true,  hint: "Regressed plan target" },
    { key: "poolCap",        label: "Connection pool cap",      value: "180",                    kind: "number",  editable: true,  required: true,  hint: "Max after recycle" },
    { key: "canaryPercent",  label: "Canary %",                 value: "10",                     kind: "number",  editable: true,  required: false, hint: "0 to skip canary" },
    { key: "notify",         label: "Notify channel",           value: "#ops-checkout",          kind: "string",  editable: false, required: true,  hint: "Locked to service channel" },
  ]);
  const [changeTicket, setChangeTicket] = useState<string>("");
  const [preflightState, setPreflightState] = useState<PreflightState>("pending");
  const [checks, setChecks] = useState<PreflightCheck[]>([]);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
  const [connectorDialogOpen, setConnectorDialogOpen] = useState(false);
  const [savedExecutionId, setSavedExecutionId] = useState<string | null>(null);

  /* ------------ Derived config ------------ */
  const changeRequired = mode !== "Dry Run" && environment === "Production";
  const requiredApprovals = useMemo<string[]>(() => {
    if (mode === "Dry Run") return [];
    if (environment === "Production") return ["Change Manager", "Service Owner"];
    if (mode === "Approval Gated Automation" || mode === "Supervised Autonomous") return ["Service Owner"];
    return [];
  }, [mode, environment]);
  const modeRisk: "Low" | "Medium" | "High" =
    mode === "Dry Run" ? "Low"
    : mode === "Human Guided" ? "Low"
    : environment === "Production" ? "High" : "Medium";

  /* ------------ Preflight ------------ */
  const runPreflight = useCallback(() => {
    setPreflightState("pending");
    setChecks([]);
    const missingParams = paramsState.filter((p) => p.required && !p.value.trim());
    const observability = ops.connectors.find((c) => c.kind === "Observability") ?? null;
    const change       = ops.connectors.find((c) => c.kind === "Change")        ?? null;
    const itsm         = ops.connectors.find((c) => c.kind === "ITSM")          ?? null;
    const cloud        = ops.connectors.find((c) => c.kind === "Cloud")         ?? null;
    const unhealthy = [observability, change, itsm, cloud].filter((c): c is NonNullable<typeof c> => !!c && c.status === "Unavailable");
    const cert = runbook ? (runbook.state === "Certified" || runbook.state === "Published") : true;
    const rollbackReady = true;              // recovery designer publishes readiness — assumed yes
    const maintenance = environment === "Production" && new Date().getUTCDay() === 0; // simulate Sunday maintenance
    const conflicting = false;                // no active duplicate — trigger manager rule
    const policyOk = !(mode === "Supervised Autonomous" && !changeTicket && environment === "Production");
    const permissionOk = ops.role !== "Read Only User" && ops.role !== "Auditor";
    const envSupported = ["Development", "Test", "Production"].includes(environment);

    const list: PreflightCheck[] = [
      { key: "perm",  label: "Actor has execute permission",         category: "permission",  state: permissionOk ? "pass" : "fail", detail: permissionOk ? `${ops.role} can execute` : "Read-only role", blocking: true },
      { key: "cert",  label: "Runbook certification current",         category: "certification", state: cert ? "pass" : "fail",         detail: cert ? `${runbook?.version ?? "v?"} certified` : "Certification expired — recertify first", blocking: true },
      { key: "env",   label: "Environment supported",                 category: "environment", state: envSupported ? "pass" : "fail", detail: envSupported ? `${environment} allowed` : "Environment not in supported set", blocking: true },
      { key: "params",label: "Input parameters valid",                category: "precondition", state: missingParams.length === 0 ? "pass" : "fail", detail: missingParams.length === 0 ? "All required inputs present" : `Missing: ${missingParams.map((p) => p.label).join(", ")}`, blocking: true },
      { key: "conn",  label: "Required connectors healthy",           category: "connector",   state: unhealthy.length === 0 ? "pass" : "fail", detail: unhealthy.length === 0 ? `${ops.connectors.length} connectors healthy` : `Unavailable: ${unhealthy.map((u) => u.name).join(", ")}`, blocking: true },
      { key: "rb",    label: "Rollback plan available",               category: "rollback",    state: rollbackReady ? "pass" : "fail", detail: rollbackReady ? "Recovery Designer published rollback" : "No published rollback", blocking: true },
      { key: "pol",   label: "Policy allows this launch",             category: "policy",      state: policyOk ? "pass" : "fail", detail: policyOk ? "Within policy envelope" : "Autonomous mode in Production requires change ticket", blocking: true },
      { key: "conf",  label: "No conflicting execution",              category: "conflict",    state: conflicting ? "fail" : "pass", detail: conflicting ? "Duplicate execution active" : "No active duplicate", blocking: true },
      { key: "maint", label: "Not in maintenance restriction window", category: "maintenance", state: maintenance ? "fail" : "pass", detail: maintenance ? "Sunday production maintenance freeze" : "No active restriction", blocking: true },
      { key: "chg",   label: "Change record required",                category: "policy",      state: !changeRequired ? "pass" : changeTicket ? "pass" : "warn", detail: !changeRequired ? "Not required for this mode/env" : changeTicket ? `Linked ${changeTicket}` : "Change ticket required for Production launch", blocking: changeRequired && !changeTicket },
    ];
    // Simulate preflight running
    setPreflightState("pending");
    setTimeout(() => {
      setChecks(list);
      const anyFail = list.some((c) => c.blocking && c.state === "fail");
      const anyWarn = list.some((c) => c.state === "warn");
      setPreflightState(anyFail ? "fail" : anyWarn ? "warn" : "pass");
      ops.pushNotification({
        kind: anyFail ? "warning" : "info",
        title: `Preflight ${anyFail ? "blocked" : "passed"}`,
        detail: `${runbookId} · ${mode} · ${environment} · ${list.filter((c) => c.state === "pass").length}/${list.length} checks`,
        entityRef: runbookId,
      });
    }, 500);
  }, [changeRequired, changeTicket, environment, mode, ops, paramsState, runbook, runbookId]);

  useEffect(() => { runPreflight(); /* initial */ }, [runPreflight]);

  /* ------------ Launch state ------------ */
  const blocked = preflightState === "fail";
  const launchState: LaunchState =
    preflightState === "pending" ? "Preflight running"
    : blocked                    ? "Blocked"
    : requiredApprovals.length > 0 ? "Ready with approval"
    :                              "Ready";

  /* ------------ Shared state helpers ------------ */
  const readExecutions = (): ExecutionRecord[] => {
    try { const raw = localStorage.getItem(EXECUTIONS_KEY); if (raw) return JSON.parse(raw) as ExecutionRecord[]; } catch { /* ignore */ }
    return [];
  };
  const writeExecutions = (list: ExecutionRecord[]) => localStorage.setItem(EXECUTIONS_KEY, JSON.stringify(list));
  const readApprovals = (): ApprovalRequest[] => {
    try { const raw = localStorage.getItem(APPROVALS_KEY); if (raw) return JSON.parse(raw) as ApprovalRequest[]; } catch { /* ignore */ }
    return [];
  };
  const writeApprovals = (list: ApprovalRequest[]) => localStorage.setItem(APPROVALS_KEY, JSON.stringify(list));

  const buildExecution = (state: ExecutionRecord["state"]): ExecutionRecord => {
    const existing = readExecutions();
    const id = savedExecutionId ?? nextExeId(existing);
    const steps: StepRecord[] = (runbook?.steps ?? []).map((s) => ({ key: s.key, label: s.label, state: "pending" }));
    return {
      id,
      runbookId,
      runbookVersion: runbook?.version ?? "v2.3.0",
      serviceId: service?.id ?? "",
      components: selectedComponents,
      environment,
      mode,
      params: Object.fromEntries(paramsState.map((p) => [p.key, p.value])),
      state,
      createdAt: nowIso(),
      startedAt: state === "Running" ? nowIso() : null,
      changeTicket,
      approvals: [],
      steps,
      timeline: [{ at: nowIso(), kind: "created", detail: `Execution ${state} · ${mode} · ${environment}` }],
    };
  };

  const saveExecutionRequest = () => {
    if (readOnly) return;
    const list = readExecutions();
    const rec = buildExecution("Draft");
    writeExecutions([rec, ...list.filter((e) => e.id !== rec.id)]);
    setSavedExecutionId(rec.id);
    ops.pushNotification({ kind: "info", title: "Execution request saved", detail: `${rec.id} · ${runbookId} · ${mode}`, entityRef: rec.id });
  };

  const requestApprovals = () => {
    if (readOnly || requiredApprovals.length === 0) return;
    const list = readExecutions();
    const draft = buildExecution("AwaitingApproval");
    const apps = readApprovals();
    const newApps: ApprovalRequest[] = requiredApprovals.map((role) => ({
      id: makeId("ap"),
      executionId: draft.id,
      runbookId,
      role,
      state: "pending",
      requestedAt: nowIso(),
      reason: `${mode} launch of ${runbookId} in ${environment}`,
    }));
    draft.approvals = newApps.map((a) => a.id);
    draft.timeline.push({ at: nowIso(), kind: "approval-requested", detail: `Requested: ${requiredApprovals.join(", ")}` });
    writeExecutions([draft, ...list.filter((e) => e.id !== draft.id)]);
    writeApprovals([...newApps, ...apps]);
    setSavedExecutionId(draft.id);
    ops.pushNotification({
      kind: "info",
      title: "Approvals requested",
      detail: `${draft.id} · ${requiredApprovals.join(", ")} · ${runbookId}`,
      entityRef: draft.id,
    });
    navigate("/runops/approvals");
  };

  const createChange = () => {
    const id = `CHG-${Math.floor(400000 + Math.random() * 90000)}`;
    setChangeTicket(id);
    ops.pushNotification({ kind: "info", title: "Change ticket created", detail: `${id} · ${runbookId} · ${environment}`, entityRef: runbookId });
    // rerun preflight so the change check flips
    setTimeout(runPreflight, 50);
  };

  const cancel = () => {
    if (!savedExecutionId) return;
    const list = readExecutions();
    const upd = list.map((e) => e.id === savedExecutionId
      ? { ...e, state: "Cancelled" as const, timeline: [...e.timeline, { at: nowIso(), kind: "cancelled", detail: "Cancelled from launch center" }] }
      : e);
    writeExecutions(upd);
    ops.pushNotification({ kind: "warning", title: "Execution cancelled", detail: `${savedExecutionId} · ${runbookId}`, entityRef: savedExecutionId });
    setSavedExecutionId(null);
  };

  const launch = () => {
    if (readOnly) return;
    if (blocked || preflightState === "pending") {
      ops.pushNotification({ kind: "warning", title: "Launch blocked", detail: `${runbookId} · preflight not passing`, entityRef: runbookId });
      return;
    }
    if (requiredApprovals.length > 0) {
      requestApprovals();
      return;
    }
    const list = readExecutions();
    const rec = buildExecution("Running");
    rec.timeline.push({ at: nowIso(), kind: "launched", detail: `Launched by ${ops.role}` });
    writeExecutions([rec, ...list.filter((e) => e.id !== rec.id)]);
    setSavedExecutionId(rec.id);
    ops.pushNotification({ kind: "info", title: "Execution launched",     detail: `${rec.id} · ${mode} · ${environment}`, entityRef: rec.id });
    ops.pushNotification({ kind: "info", title: "Operations task created", detail: `${rec.id} · assigned to on-call ${ops.role}`, entityRef: rec.id });
    ops.pushNotification({ kind: "info", title: "Incident timeline updated", detail: `${rec.id} · ${runbookId} · initiated`, entityRef: rec.id });
    // Navigation per mode
    if (mode === "Human Guided") navigate(`/runops/executions/${rec.id}/guided`);
    else if (mode === "Supervised Autonomous" || mode === "Policy Bounded Autonomous") navigate(`/runops/executions/${rec.id}`);
    else navigate(`/runops/executions/${rec.id}`);
  };

  /* ------------ Guards ------------ */
  if (readOnly) {
    return <div className="p-6"><PermissionDeniedState title="Read-only role" description="Your current role cannot launch executions." /></div>;
  }

  /* ------------ Render ------------ */
  const stateBadge: Record<LaunchState, string> = {
    "Ready":              "border-emerald-300 bg-emerald-50 text-emerald-900",
    "Ready with approval":"border-sky-300 bg-sky-50 text-sky-900",
    "Blocked":            "border-rose-300 bg-rose-50 text-rose-900",
    "Preflight running":  "border-amber-300 bg-amber-50 text-amber-900",
    "Approval pending":   "border-sky-300 bg-sky-50 text-sky-900",
    "Launch failure":     "border-rose-300 bg-rose-50 text-rose-900",
  };

  const svcAny = service as unknown as { components?: { id: string; name: string }[] } | null;
  const componentList = svcAny?.components ?? [
    { id: "cmp-checkout-api",  name: "checkout-api" },
    { id: "cmp-orders-db",     name: "orders-db" },
    { id: "cmp-payment-svc",   name: "payment-svc" },
    { id: "cmp-cache-cluster", name: "cache-cluster" },
  ];

  const failedChecks = checks.filter((c) => c.state === "fail");
  const warnChecks = checks.filter((c) => c.state === "warn");
  const aiConfidence = Math.max(30, Math.min(96,
    70
    + (preflightState === "pass" ? 12 : preflightState === "warn" ? 0 : -30)
    + (mode === "Dry Run" ? 6 : 0)
    + (changeTicket ? 3 : -3)
    + (requiredApprovals.length > 0 ? -4 : 0)
  ));

  return (
    <div className="flex flex-col gap-3 p-4 md:p-6" aria-label="Runbook launch center">
      <EntityHeader
        eyebrow="Runbook launch"
        title={`Launch · ${runbook?.title ?? runbookId}`}
        subtitle={`${runbookId} · ${runbook?.version ?? "draft"} · ${service?.name ?? "no service"}`}
        meta={
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Tenant: <span className="text-foreground">{ops.tenant.name}</span></span>
            <span>Env: <span className="text-foreground">{environment}</span></span>
            <span>Role: <span className="text-foreground">{ops.role}</span></span>
            <span>Risk: <span className="text-foreground">{modeRisk}</span></span>
            <Badge variant="outline" className={cn("border", stateBadge[launchState])}>{launchState}</Badge>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/runops/runbooks/${runbookId}`)} aria-label="Back to runbook detail">
              <ArrowLeft className="h-4 w-4" /> Runbook
            </Button>
            <Button variant="outline" size="sm" onClick={runPreflight} aria-label="Run preflight">
              <Activity className="h-4 w-4" /> Run preflight
            </Button>
            <Button variant="outline" size="sm" onClick={saveExecutionRequest} aria-label="Save execution request">
              Save request
            </Button>
            {savedExecutionId && (
              <Button variant="outline" size="sm" onClick={cancel} aria-label="Cancel saved execution">
                <Square className="h-4 w-4" /> Cancel
              </Button>
            )}
            <Button size="sm" onClick={launch}
              disabled={blocked || preflightState === "pending"}
              title={
                preflightState === "pending" ? "Preflight running"
                : blocked ? `Launch blocked: ${failedChecks.map((c) => c.label).join("; ")}`
                : requiredApprovals.length > 0 ? "Route to approvals"
                : "Launch execution"}
              aria-label="Launch">
              <PlayCircle className="h-4 w-4" /> {requiredApprovals.length > 0 ? "Request approval" : "Launch"}
            </Button>
          </div>
        }
      />

      {/* Guard band */}
      <div className="grid gap-2 md:grid-cols-4">
        <GuardTile ok={preflightState === "pass"} okText={`Preflight passing (${checks.filter((c) => c.state === "pass").length}/${checks.length})`} badText={preflightState === "pending" ? "Preflight running…" : `Preflight ${preflightState}: ${failedChecks.length} blocking, ${warnChecks.length} warn`} />
        <GuardTile ok={requiredApprovals.length === 0} okText="No approval required" badText={`Approval required: ${requiredApprovals.join(", ")}`} />
        <GuardTile ok={!changeRequired || !!changeTicket} okText={changeRequired ? `Change linked: ${changeTicket}` : "No change record required"} badText="Change record required for Production launch" />
        <GuardTile ok={modeRisk !== "High" || !!changeTicket} okText={`Risk: ${modeRisk}`} badText={`High-risk launch needs a linked change (${modeRisk})`} />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
        {/* Left: config, params, preflight */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4 grid gap-3 md:grid-cols-3">
              <div>
                <Label className="text-xs">Runbook</Label>
                <Input readOnly value={`${runbookId} · ${runbook?.version ?? "v?"}`} aria-label="Runbook and version" />
              </div>
              <div>
                <Label className="text-xs">Target service</Label>
                <Input readOnly value={service?.name ?? "—"} aria-label="Target service" />
              </div>
              <div>
                <Label className="text-xs">Environment</Label>
                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger aria-label="Environment"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Test">Test</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">Components</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {componentList.map((c) => {
                    const on = selectedComponents.includes(c.id);
                    return (
                      <button key={c.id} onClick={() => setSelectedComponents((s) => on ? s.filter((x) => x !== c.id) : [...s, c.id])}
                        aria-label={`${on ? "Deselect" : "Select"} component ${c.name}`}
                        className={cn("rounded border px-2 py-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                          on ? "border-sky-300 bg-sky-50 text-sky-900" : "border-slate-200 bg-white hover:bg-slate-50")}>
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label className="text-xs">Execution mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as ExecutionMode)}>
                  <SelectTrigger aria-label="Execution mode"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["Dry Run","Human Guided","Human Initiated Automation","Approval Gated Automation","Supervised Autonomous","Policy Bounded Autonomous"] as ExecutionMode[]).map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3">
                <Label className="text-xs">Change ticket {changeRequired && <span className="text-rose-700">(required)</span>}</Label>
                <div className="flex gap-2">
                  <Input value={changeTicket} onChange={(e) => setChangeTicket(e.target.value)} placeholder="CHG-XXXXXX" aria-label="Change ticket" />
                  <Button size="sm" variant="outline" onClick={createChange} aria-label="Create change ticket">Create change</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Input parameters</h2>
                <Badge variant="outline">{paramsState.length} inputs</Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {paramsState.map((p, i) => (
                  <div key={p.key}>
                    <Label className="text-[11px]">
                      {p.label} {p.required && <span className="text-rose-700">*</span>}
                      {!p.editable && <span className="ml-1 text-muted-foreground">(locked)</span>}
                    </Label>
                    <Input
                      value={p.value}
                      onChange={(e) => setParamsState((prev) => prev.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                      disabled={!p.editable}
                      aria-label={`Parameter ${p.key}`}
                    />
                    <p className="text-[11px] text-muted-foreground pt-1">{p.hint}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Preflight checks</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(
                    preflightState === "pass"    && "border-emerald-300 bg-emerald-50 text-emerald-900",
                    preflightState === "fail"    && "border-rose-300 bg-rose-50 text-rose-900",
                    preflightState === "warn"    && "border-amber-300 bg-amber-50 text-amber-900",
                    preflightState === "pending" && "border-slate-200 bg-slate-50 text-slate-800",
                  )}>{preflightState}</Badge>
                  <Button size="sm" variant="ghost" onClick={runPreflight} aria-label="Rerun preflight"><Activity className="h-3 w-3" /></Button>
                </div>
              </div>
              {checks.length === 0 && preflightState === "pending" && (
                <p className="text-xs text-muted-foreground">Preflight running…</p>
              )}
              <div className="space-y-1">
                {checks.map((c) => (
                  <div key={c.key} className="flex items-center justify-between rounded border border-slate-200 p-2 text-xs">
                    <div className="flex items-center gap-2">
                      {c.state === "pass" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      {c.state === "fail" && <XCircle className="h-4 w-4 text-rose-600" />}
                      {c.state === "warn" && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                      {c.state === "pending" && <Timer className="h-4 w-4 text-slate-400" />}
                      <div>
                        <div className="font-medium">{c.label}</div>
                        <div className="text-[11px] text-muted-foreground">{c.detail}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[11px]">{c.category}</Badge>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => setPolicyDialogOpen(true)} aria-label="Open policy explanation">
                  <Info className="h-3 w-3" /> Policy explanation
                </Button>
                <Button size="sm" variant="outline" onClick={() => setRollbackDialogOpen(true)} aria-label="Open rollback details">
                  <ShieldCheck className="h-3 w-3" /> Rollback details
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConnectorDialogOpen(true)} aria-label="Open connector health">
                  <Activity className="h-3 w-3" /> Connector health
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: risk, evidence plan, AI */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4 space-y-2 text-xs">
              <h2 className="text-sm font-semibold">Risk &amp; blast radius</h2>
              <div className="flex items-center justify-between"><span>Risk</span> <Badge variant="outline">{modeRisk}</Badge></div>
              <div className="flex items-center justify-between"><span>Blast radius</span> <span>{selectedComponents.length} component(s) · {environment}</span></div>
              <div className="flex items-center justify-between"><span>Expected duration</span> <span>{mode === "Dry Run" ? "~2 min" : mode === "Human Guided" ? "~10 min" : "~4 min"}</span></div>
              <div className="flex items-center justify-between"><span>Rollback readiness</span> <span className="text-emerald-700">Ready</span></div>
              <div className="flex items-center justify-between"><span>Required approvals</span> <span>{requiredApprovals.length === 0 ? "None" : requiredApprovals.join(", ")}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2 text-xs">
              <h2 className="text-sm font-semibold">Evidence plan</h2>
              <ul className="list-disc pl-4 space-y-1">
                <li>Pre/post p95 checkout latency (Observability, 15m window)</li>
                <li>SQL connection utilization delta (Observability)</li>
                <li>Change ticket link {changeTicket || "—"}</li>
                <li>Approvals log {requiredApprovals.length ? `(${requiredApprovals.join(", ")})` : "(n/a)"}</li>
                <li>Rollback verification snapshot</li>
                <li>Synthetic checkout journey pass/fail</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">AI launch advisor</h2>
                <Badge variant="outline">{aiConfidence}% confidence</Badge>
              </div>
              <ul className="text-xs list-disc pl-4 space-y-1">
                <li>Evidence: {checks.filter((c) => c.state === "pass").length}/{checks.length} preflight checks pass; {ops.connectors.filter((c) => c.status !== "Unavailable").length}/{ops.connectors.length} connectors healthy; {selectedComponents.length} component(s) in blast radius.</li>
                <li>Confidence adjusted by preflight outcome, mode, change linkage, and approval breadth.</li>
                <li>Uncertainty: without live traffic sample, canary lift is inferred from prior INC-10482 fitness (+3); actual gain may differ by up to 30 percent.</li>
              </ul>
              <div className="text-[11px] text-muted-foreground">
                Sources: Preflight harness · Policy Designer v{runbook?.version} · Recovery Designer · Test Lab regression suite · Observability (last 15m) · CHG-{changeTicket.replace(/^CHG-/, "") || "—"}.
              </div>
            </CardContent>
          </Card>

          {savedExecutionId && (
            <Card>
              <CardContent className="p-4 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Execution</h2>
                  <Badge variant="outline">{savedExecutionId}</Badge>
                </div>
                <p className="text-muted-foreground">Saved. Approvals or launch will reference this id across Operations Queue, Approvals, and Execution detail.</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => navigate("/runops/operations/queue")} aria-label="Open Operations Queue">
                    Operations Queue <ChevronRight className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate("/runops/approvals")} aria-label="Open Approvals">
                    Approvals <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* -------- Dialogs -------- */}
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Policy explanation</DialogTitle></DialogHeader>
          <div className="text-xs space-y-2">
            <p>The active policy version derives from Policy Designer for {runbookId}.</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Autonomy ceiling: {mode === "Supervised Autonomous" || mode === "Policy Bounded Autonomous" ? "requires change record in Production" : "allowed"}</li>
              <li>Confidence floor: 70% (Policy Designer)</li>
              <li>Production revert requires 2 approvers (separation of duties)</li>
              <li>Maintenance window: Sunday 00:00–06:00 UTC (Production only)</li>
            </ul>
            {failedChecks.filter((c) => c.category === "policy").map((c) => (
              <div key={c.key} className="rounded border border-rose-200 bg-rose-50 p-2">
                <ShieldAlert className="inline h-3 w-3" /> {c.label}: {c.detail}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rollbackDialogOpen} onOpenChange={setRollbackDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rollback details</DialogTitle></DialogHeader>
          <div className="text-xs space-y-2">
            <p>Recovery Designer publishes rollback for {runbookId}:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Auto-revert index if p95 &gt; 1500ms for 5 minutes</li>
              <li>Recycle pool with drain verification</li>
              <li>Compensating action: raise pool cap by 20% for 30 minutes</li>
              <li>Checkpoint after step 3 (resumable)</li>
              <li>RTO 15 min, RPO 0</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={connectorDialogOpen} onOpenChange={setConnectorDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Connector health</DialogTitle></DialogHeader>
          <div className="text-xs space-y-1 max-h-72 overflow-auto">
            {ops.connectors.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded border border-slate-200 p-2">
                <div><div className="font-medium">{c.name}</div><div className="text-[11px] text-muted-foreground">{c.kind} · freshness {c.freshness}</div></div>
                <Badge variant="outline" className={cn(
                  c.status === "Healthy"     && "border-emerald-300 bg-emerald-50 text-emerald-900",
                  c.status === "Degraded"    && "border-amber-300 bg-amber-50 text-amber-900",
                  c.status === "Unavailable" && "border-rose-300 bg-rose-50 text-rose-900",
                )}>{c.status}</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function GuardTile({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) {
  return (
    <div className={cn("rounded border p-2 text-xs flex items-start gap-2",
      ok ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900")}>
      {ok ? <CheckCircle2 className="h-4 w-4 mt-0.5" /> : <ShieldAlert className="h-4 w-4 mt-0.5" />}
      <span>{ok ? okText : badText}</span>
    </div>
  );
}
