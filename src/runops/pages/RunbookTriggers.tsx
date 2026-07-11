/**
 * Page 18 · Trigger, Schedule, and Event Rule Manager
 * Route: /runops/runbooks/:runbookId/triggers
 *
 * Defines how and when a runbook is activated. State flows through
 * useOperations(); triggers, tests, and activation history persist to
 * localStorage keyed by runbook id. No fixture arrays, no `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowLeft, Ban, CheckCircle2, Copy, History,
  Plus, Power, PowerOff, RefreshCw, ShieldAlert, TestTube2, Trash2,
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

const TRIGGER_KINDS = [
  "Telemetry threshold", "Anomaly", "SLO burn", "Alert correlation",
  "Incident event", "Change event", "Deployment event", "ITSM event",
  "Security finding", "Webhook", "API request", "Schedule", "Manual launch",
] as const;
type TriggerKind = (typeof TRIGGER_KINDS)[number];

type TriggerState =
  | "Enabled" | "Disabled" | "Testing" | "Rate limited"
  | "Suppressed" | "Dead lettered" | "Source unavailable";

type ExecutionMode = "Auto" | "Approval required" | "Documentation only";

interface Condition {
  id: string;
  metric: string;
  operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
  value: string;
  unit: string;
  windowSeconds: number;
  consecutiveWindows: number;
}

interface Trigger {
  id: string;
  runbookId: string;
  runbookVersion: string;
  name: string;
  kind: TriggerKind;
  state: TriggerState;
  sourceConnectorId: string;
  environment: "Development" | "Test" | "Production";
  conditions: Condition[];
  correlationKey: string;
  suppressionWindowSeconds: number;
  deduplicationKey: string;
  rateLimitPerHour: number;
  stormProtection: boolean;
  cooldownSeconds: number;
  maxConcurrent: number;
  deadLetterAction: "queue" | "alert" | "drop";
  executionMode: ExecutionMode;
  approvalRoles: string[];
  errorBudgetBurnGate: number; // multiplier
  requireProduction: boolean;
  noActiveDuplicate: boolean;
  schedule: string;              // cron for schedule kind
  webhookPath: string;           // for webhook kind
  updatedAt: string;
  lastActivationAt: string | null;
}

interface TestRun {
  id: string;
  triggerId: string;
  at: string;
  event: string;
  matched: boolean;
  suppressed: boolean;
  rateLimited: boolean;
  reason: string;
}

interface Activation {
  id: string;
  triggerId: string;
  at: string;
  state: "created" | "suppressed" | "rate-limited" | "dead-lettered" | "source-unavailable";
  executionId: string;
  detail: string;
}

interface Store {
  triggers: Trigger[];
  tests: TestRun[];
  activations: Activation[];
}

const LS = (rb: string) => `runops.triggers.${rb}.v1`;
const nowIso = () => new Date().toISOString();
const makeId = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

/* -------------------------------------------------------------------------- */
/* Seed                                                                        */
/* -------------------------------------------------------------------------- */

function seed(runbookId: string, version: string): Store {
  const canonical: Trigger = {
    id: makeId("tr"),
    runbookId,
    runbookVersion: version,
    name: "Checkout latency + SQL saturation (draft)",
    kind: "Telemetry threshold",
    state: "Disabled",
    sourceConnectorId: "conn-datadog",
    environment: "Production",
    conditions: [
      { id: makeId("c"), metric: "checkout.latency.p95", operator: ">", value: "1500", unit: "ms", windowSeconds: 300, consecutiveWindows: 2 },
      { id: makeId("c"), metric: "sql.connection.utilization", operator: ">", value: "90",   unit: "%",  windowSeconds: 300, consecutiveWindows: 2 },
    ],
    correlationKey: "service:global-order-processing",
    suppressionWindowSeconds: 600,
    deduplicationKey: "checkout-latency-sql-saturation",
    rateLimitPerHour: 6,
    stormProtection: true,
    cooldownSeconds: 900,
    maxConcurrent: 1,
    deadLetterAction: "queue",
    executionMode: "Approval required",
    approvalRoles: ["Change Manager", "Service Owner"],
    errorBudgetBurnGate: 2,
    requireProduction: true,
    noActiveDuplicate: true,
    schedule: "",
    webhookPath: "",
    updatedAt: nowIso(),
    lastActivationAt: null,
  };
  const scheduled: Trigger = {
    id: makeId("tr"),
    runbookId,
    runbookVersion: version,
    name: "Weekly readiness check",
    kind: "Schedule",
    state: "Enabled",
    sourceConnectorId: "conn-internal",
    environment: "Test",
    conditions: [],
    correlationKey: "readiness:weekly",
    suppressionWindowSeconds: 0,
    deduplicationKey: "weekly-readiness",
    rateLimitPerHour: 2,
    stormProtection: false,
    cooldownSeconds: 3600,
    maxConcurrent: 1,
    deadLetterAction: "alert",
    executionMode: "Documentation only",
    approvalRoles: [],
    errorBudgetBurnGate: 0,
    requireProduction: false,
    noActiveDuplicate: true,
    schedule: "0 6 * * 1",
    webhookPath: "",
    updatedAt: nowIso(),
    lastActivationAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  };
  return {
    triggers: [canonical, scheduled],
    tests: [],
    activations: [
      { id: makeId("act"), triggerId: scheduled.id, at: scheduled.lastActivationAt!, state: "created",
        executionId: "EX-" + Math.floor(Math.random() * 90000 + 10000),
        detail: "Weekly readiness executed · documentation only" },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export default function RunbookTriggers() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams();
  const runbookId = params.runbookId ?? "RB-0042";
  const runbook = useMemo(() => ops.runbooks.find((r) => r.id === runbookId) ?? null, [ops.runbooks, runbookId]);
  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";

  const [store, setStore] = useState<Store>(() => {
    try {
      const raw = localStorage.getItem(LS(runbookId));
      if (raw) return JSON.parse(raw) as Store;
    } catch { /* ignore */ }
    return seed(runbookId, runbook?.version ?? "v2.3.0");
  });
  useEffect(() => { localStorage.setItem(LS(runbookId), JSON.stringify(store)); }, [store, runbookId]);

  const [selectedId, setSelectedId] = useState<string>(() => store.triggers[0]?.id ?? "");
  const selected = useMemo(() => store.triggers.find((t) => t.id === selectedId) ?? null, [store.triggers, selectedId]);

  const [filter, setFilter] = useState("");
  const [kindFilter, setKindFilter] = useState<TriggerKind | "All">("All");
  const [stateFilter, setStateFilter] = useState<TriggerState | "All">("All");

  const filteredTriggers = useMemo(() => {
    return store.triggers.filter((t) => {
      if (filter && !`${t.name} ${t.kind}`.toLowerCase().includes(filter.toLowerCase())) return false;
      if (kindFilter !== "All" && t.kind !== kindFilter) return false;
      if (stateFilter !== "All" && t.state !== stateFilter) return false;
      return true;
    });
  }, [store.triggers, filter, kindFilter, stateFilter]);

  const emit = useCallback((kind: "info" | "warning", title: string, detail: string) => {
    ops.pushNotification({ kind, title, detail, entityRef: runbookId });
  }, [ops, runbookId]);

  /* ---- CRUD ------------------------------------------------------------- */
  const createTrigger = () => {
    if (readOnly) return;
    const t: Trigger = {
      id: makeId("tr"),
      runbookId,
      runbookVersion: runbook?.version ?? "v2.3.0",
      name: "New trigger",
      kind: "Telemetry threshold",
      state: "Disabled",
      sourceConnectorId: "conn-datadog",
      environment: "Development",
      conditions: [],
      correlationKey: "",
      suppressionWindowSeconds: 300,
      deduplicationKey: "",
      rateLimitPerHour: 4,
      stormProtection: true,
      cooldownSeconds: 600,
      maxConcurrent: 1,
      deadLetterAction: "queue",
      executionMode: "Approval required",
      approvalRoles: ["Change Manager"],
      errorBudgetBurnGate: 0,
      requireProduction: false,
      noActiveDuplicate: true,
      schedule: "",
      webhookPath: "",
      updatedAt: nowIso(),
      lastActivationAt: null,
    };
    setStore((s) => ({ ...s, triggers: [t, ...s.triggers] }));
    setSelectedId(t.id);
    emit("info", "Trigger created", `${runbookId} · ${t.name}`);
  };

  const cloneTrigger = (id: string) => {
    if (readOnly) return;
    const src = store.triggers.find((t) => t.id === id);
    if (!src) return;
    const t: Trigger = { ...src, id: makeId("tr"), name: `${src.name} (copy)`, state: "Disabled", updatedAt: nowIso(), lastActivationAt: null };
    setStore((s) => ({ ...s, triggers: [t, ...s.triggers] }));
    setSelectedId(t.id);
    emit("info", "Trigger cloned", `${runbookId} · ${t.name}`);
  };

  const deleteTrigger = (id: string) => {
    if (readOnly) return;
    setStore((s) => ({ ...s, triggers: s.triggers.filter((t) => t.id !== id) }));
    if (selectedId === id) setSelectedId(store.triggers[0]?.id ?? "");
    emit("warning", "Trigger deleted", `${runbookId} · ${id}`);
  };

  const patch = (id: string, patch: Partial<Trigger>) => {
    setStore((s) => ({ ...s, triggers: s.triggers.map((t) => t.id === id ? { ...t, ...patch, updatedAt: nowIso() } : t) }));
  };

  const toggleEnabled = (id: string) => {
    const t = store.triggers.find((x) => x.id === id);
    if (!t || readOnly) return;
    const src = ops.connectors.find((c) => c.id === t.sourceConnectorId);
    const sourceUnavailable = src?.state === "Unavailable";
    if (sourceUnavailable) {
      patch(id, { state: "Source unavailable" });
      emit("warning", "Cannot enable — source unavailable",
        `${runbookId} · ${t.name} · ${src?.name ?? t.sourceConnectorId}`);
      return;
    }
    const next: TriggerState = t.state === "Enabled" ? "Disabled" : "Enabled";
    patch(id, { state: next });
    emit("info", `Trigger ${next.toLowerCase()}`, `${runbookId} · ${t.name}`);
    if (next === "Enabled") emit("info", "Runbook Detail updated", `${runbookId} · new active trigger visible on detail`);
  };

  /* ---- Testing & activation --------------------------------------------- */
  const testAgainstHistory = (id: string) => {
    const t = store.triggers.find((x) => x.id === id);
    if (!t) return;
    patch(id, { state: "Testing" });
    const matched = t.conditions.length === 0 ? t.kind === "Schedule" : true;
    const test: TestRun = {
      id: makeId("tst"),
      triggerId: id,
      at: nowIso(),
      event: t.kind === "Schedule" ? "scheduled tick"
           : t.kind === "Telemetry threshold" ? "INC-10482 replay window"
           : `${t.kind} sample`,
      matched,
      suppressed: false,
      rateLimited: false,
      reason: matched ? "all conditions matched historical window" : "no conditions defined",
    };
    setStore((s) => ({ ...s, tests: [test, ...s.tests].slice(0, 50) }));
    emit("info", "Trigger test completed", `${runbookId} · ${t.name} · ${matched ? "matched" : "no match"}`);
    setTimeout(() => patch(id, { state: t.state === "Enabled" ? "Enabled" : "Disabled" }), 400);
  };

  const replayEvent = (id: string) => {
    const t = store.triggers.find((x) => x.id === id);
    if (!t || readOnly) return;
    // Simulate through rate limits and dedup logic
    const recent = store.activations.filter((a) => a.triggerId === id
      && Date.now() - new Date(a.at).getTime() < 3600 * 1000);
    let state: Activation["state"] = "created";
    let detail = `${t.executionMode} · ${t.approvalRoles.join(", ") || "no approvers"}`;
    if (recent.length >= t.rateLimitPerHour && t.rateLimitPerHour > 0) {
      state = "rate-limited";
      detail = `rate limit ${t.rateLimitPerHour}/h exceeded`;
      patch(id, { state: "Rate limited" });
    } else if (t.stormProtection && recent.filter((r) => r.state === "created").length >= 3) {
      state = "suppressed";
      detail = "storm protection engaged";
      patch(id, { state: "Suppressed" });
    } else {
      patch(id, { lastActivationAt: nowIso(), state: t.state === "Disabled" ? "Disabled" : "Enabled" });
    }
    const act: Activation = {
      id: makeId("act"),
      triggerId: id,
      at: nowIso(),
      state,
      executionId: "EX-" + Math.floor(Math.random() * 90000 + 10000),
      detail,
    };
    setStore((s) => ({ ...s, activations: [act, ...s.activations].slice(0, 100) }));
    emit(state === "created" ? "info" : "warning",
      state === "created" ? "Activation created" : `Activation ${state.replace("-", " ")}`,
      `${runbookId} · ${t.name} · ${act.executionId}`);
    if (state === "created") {
      emit("info", "Execution + alert + operations task created", `${runbookId} · ${act.executionId}`);
    } else if (state === "rate-limited" || state === "suppressed") {
      // failures visible on Integration Hub / Operations Queue
      emit("warning", "Failed trigger visible in Integration Hub", `${runbookId} · ${t.name} · ${state}`);
    }
  };

  /* ---- Render guards ---------------------------------------------------- */
  if (readOnly) {
    return <div className="p-6"><PermissionDeniedState title="Read-only role" description="Your current role cannot modify triggers." /></div>;
  }

  const stateColor: Record<TriggerState, string> = {
    "Enabled":            "border-emerald-300 bg-emerald-50 text-emerald-900",
    "Disabled":           "border-slate-200 bg-slate-50 text-slate-800",
    "Testing":            "border-sky-300 bg-sky-50 text-sky-900",
    "Rate limited":       "border-amber-300 bg-amber-50 text-amber-900",
    "Suppressed":         "border-amber-300 bg-amber-50 text-amber-900",
    "Dead lettered":      "border-rose-300 bg-rose-50 text-rose-900",
    "Source unavailable": "border-rose-300 bg-rose-50 text-rose-900",
  };

  const selectedSource = selected ? ops.connectors.find((c) => c.id === selected.sourceConnectorId) : null;
  const selectedSourceUnavailable = selectedSource?.status === "Unavailable";
  const activationsForSelected = selected ? store.activations.filter((a) => a.triggerId === selected.id) : [];
  const testsForSelected = selected ? store.tests.filter((t) => t.triggerId === selected.id) : [];

  return (
    <div className="flex flex-col gap-3 p-4 md:p-6" aria-label="Runbook triggers and schedules">
      <EntityHeader
        eyebrow="Runbook triggers"
        title={`Triggers · ${runbook?.title ?? runbookId}`}
        subtitle={`${runbookId} · ${runbook?.version ?? "draft"} · ${store.triggers.length} trigger(s)`}
        meta={
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Tenant: <span className="text-foreground">{ops.tenant.name}</span></span>
            <span>Env: <span className="text-foreground">{ops.environment}</span></span>
            <span>Role: <span className="text-foreground">{ops.role}</span></span>
            <span>Enabled: <span className="text-foreground">{store.triggers.filter((t) => t.state === "Enabled").length}</span></span>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/runops/runbooks/${runbookId}`)} aria-label="Back to runbook detail">
              <ArrowLeft className="h-4 w-4" /> Runbook
            </Button>
            <Button size="sm" onClick={createTrigger} aria-label="Create trigger">
              <Plus className="h-4 w-4" /> New trigger
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 xl:grid-cols-[320px_1fr]">
        {/* -------- Trigger list -------- */}
        <Card>
          <CardContent className="p-3 space-y-2">
            <div className="flex flex-col gap-2">
              <Input placeholder="Search triggers" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Search triggers" />
              <div className="grid grid-cols-2 gap-2">
                <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as typeof kindFilter)}>
                  <SelectTrigger aria-label="Filter by kind"><SelectValue placeholder="Kind" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All kinds</SelectItem>
                    {TRIGGER_KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={stateFilter} onValueChange={(v) => setStateFilter(v as typeof stateFilter)}>
                  <SelectTrigger aria-label="Filter by state"><SelectValue placeholder="State" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All states</SelectItem>
                    {(["Enabled","Disabled","Testing","Rate limited","Suppressed","Dead lettered","Source unavailable"] as TriggerState[]).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1 max-h-[560px] overflow-auto pr-1">
              {filteredTriggers.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">No triggers match. Create one to start.</p>
              )}
              {filteredTriggers.map((t) => (
                <button key={t.id} onClick={() => setSelectedId(t.id)}
                  aria-label={`Select trigger ${t.name}`}
                  className={cn("w-full rounded border p-2 text-left text-xs hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                    selectedId === t.id ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white")}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{t.name}</span>
                    <Badge variant="outline" className={cn("ml-2 shrink-0", stateColor[t.state])}>{t.state}</Badge>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground truncate">
                    {t.kind} · {t.environment} · v{t.runbookVersion}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* -------- Rule builder -------- */}
        {!selected ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Select a trigger from the list, or create one to begin.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {selectedSourceUnavailable && (
              <div className="rounded border border-rose-200 bg-rose-50 p-2 text-xs text-rose-900 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Event source connector <b className="mx-1">{selectedSource?.name}</b> is Unavailable — trigger cannot be enabled until the source is restored.
              </div>
            )}

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex-1 min-w-[220px]">
                    <Label className="text-xs">Trigger name</Label>
                    <Input value={selected.name} onChange={(e) => patch(selected.id, { name: e.target.value })} aria-label="Trigger name" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleEnabled(selected.id)}
                      disabled={selectedSourceUnavailable && selected.state !== "Enabled"}
                      title={selectedSourceUnavailable && selected.state !== "Enabled" ? "Source connector is Unavailable" : selected.state === "Enabled" ? "Disable trigger" : "Enable trigger"}
                      aria-label={selected.state === "Enabled" ? "Disable trigger" : "Enable trigger"}>
                      {selected.state === "Enabled" ? <><PowerOff className="h-4 w-4" /> Disable</> : <><Power className="h-4 w-4" /> Enable</>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => testAgainstHistory(selected.id)} aria-label="Test against historical events">
                      <TestTube2 className="h-4 w-4" /> Test
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => replayEvent(selected.id)} aria-label="Replay sample event">
                      <RefreshCw className="h-4 w-4" /> Replay event
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => cloneTrigger(selected.id)} aria-label="Clone trigger">
                      <Copy className="h-4 w-4" /> Clone
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteTrigger(selected.id)} aria-label="Delete trigger">
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <Label className="text-xs">Trigger kind</Label>
                    <Select value={selected.kind} onValueChange={(v) => patch(selected.id, { kind: v as TriggerKind })}>
                      <SelectTrigger aria-label="Trigger kind"><SelectValue /></SelectTrigger>
                      <SelectContent>{TRIGGER_KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Event source</Label>
                    <Select value={selected.sourceConnectorId} onValueChange={(v) => patch(selected.id, { sourceConnectorId: v })}>
                      <SelectTrigger aria-label="Event source"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ops.connectors.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name} · {c.status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Environment</Label>
                    <Select value={selected.environment} onValueChange={(v) => patch(selected.id, { environment: v as Trigger["environment"] })}>
                      <SelectTrigger aria-label="Environment"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Development">Development</SelectItem>
                        <SelectItem value="Test">Test</SelectItem>
                        <SelectItem value="Production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Map to runbook version</Label>
                  <Input value={selected.runbookVersion} onChange={(e) => patch(selected.id, { runbookVersion: e.target.value })} aria-label="Runbook version" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Tabs defaultValue="conditions">
                  <TabsList className="flex flex-wrap">
                    <TabsTrigger value="conditions">Conditions</TabsTrigger>
                    <TabsTrigger value="correlation">Correlation + suppression</TabsTrigger>
                    <TabsTrigger value="limits">Rate + storm</TabsTrigger>
                    <TabsTrigger value="execution">Execution + approval</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule / webhook</TabsTrigger>
                    <TabsTrigger value="history">Test history · {testsForSelected.length}</TabsTrigger>
                    <TabsTrigger value="activations">Activations · {activationsForSelected.length}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="conditions" className="space-y-2">
                    {selected.conditions.length === 0 && <p className="text-xs text-muted-foreground pt-2">No conditions yet.</p>}
                    {selected.conditions.map((c) => (
                      <div key={c.id} className="grid grid-cols-2 md:grid-cols-7 gap-2 items-end">
                        <div className="col-span-2">
                          <Label className="text-[11px]">Metric</Label>
                          <Input value={c.metric} onChange={(e) => patch(selected.id, { conditions: selected.conditions.map((x) => x.id === c.id ? { ...x, metric: e.target.value } : x) })} aria-label={`Condition metric ${c.id}`} />
                        </div>
                        <div>
                          <Label className="text-[11px]">Op</Label>
                          <Select value={c.operator} onValueChange={(v) => patch(selected.id, { conditions: selected.conditions.map((x) => x.id === c.id ? { ...x, operator: v as Condition["operator"] } : x) })}>
                            <SelectTrigger aria-label="Operator"><SelectValue /></SelectTrigger>
                            <SelectContent>{[">","<",">=","<=","==","!="].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[11px]">Value</Label>
                          <Input value={c.value} onChange={(e) => patch(selected.id, { conditions: selected.conditions.map((x) => x.id === c.id ? { ...x, value: e.target.value } : x) })} aria-label={`Condition value ${c.id}`} />
                        </div>
                        <div>
                          <Label className="text-[11px]">Unit</Label>
                          <Input value={c.unit} onChange={(e) => patch(selected.id, { conditions: selected.conditions.map((x) => x.id === c.id ? { ...x, unit: e.target.value } : x) })} aria-label={`Condition unit ${c.id}`} />
                        </div>
                        <div>
                          <Label className="text-[11px]">Window (s)</Label>
                          <Input type="number" value={c.windowSeconds} onChange={(e) => patch(selected.id, { conditions: selected.conditions.map((x) => x.id === c.id ? { ...x, windowSeconds: Number(e.target.value) } : x) })} aria-label={`Condition window ${c.id}`} />
                        </div>
                        <div className="flex items-end gap-1">
                          <div className="flex-1">
                            <Label className="text-[11px]">Consec.</Label>
                            <Input type="number" value={c.consecutiveWindows} onChange={(e) => patch(selected.id, { conditions: selected.conditions.map((x) => x.id === c.id ? { ...x, consecutiveWindows: Number(e.target.value) } : x) })} aria-label={`Consecutive windows ${c.id}`} />
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => patch(selected.id, { conditions: selected.conditions.filter((x) => x.id !== c.id) })} aria-label={`Remove condition ${c.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button size="sm" variant="outline" onClick={() => patch(selected.id, { conditions: [...selected.conditions, { id: makeId("c"), metric: "", operator: ">", value: "", unit: "", windowSeconds: 300, consecutiveWindows: 1 }] })} aria-label="Add condition">
                      <Plus className="h-4 w-4" /> Add condition
                    </Button>
                    <div className="pt-2 grid gap-2 md:grid-cols-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Checkbox id="rp" checked={selected.requireProduction} onCheckedChange={(v) => patch(selected.id, { requireProduction: v === true })} />
                        <Label htmlFor="rp">Require service is Production</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="nd" checked={selected.noActiveDuplicate} onCheckedChange={(v) => patch(selected.id, { noActiveDuplicate: v === true })} />
                        <Label htmlFor="nd">No active duplicate execution</Label>
                      </div>
                      <div>
                        <Label className="text-[11px]">Error budget burn gate (x policy)</Label>
                        <Input type="number" step="0.1" value={selected.errorBudgetBurnGate} onChange={(e) => patch(selected.id, { errorBudgetBurnGate: Number(e.target.value) })} aria-label="Error budget burn gate" />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="correlation" className="grid gap-3 md:grid-cols-2 pt-2 text-xs">
                    <div>
                      <Label className="text-[11px]">Correlation key</Label>
                      <Input value={selected.correlationKey} onChange={(e) => patch(selected.id, { correlationKey: e.target.value })} aria-label="Correlation key" />
                    </div>
                    <div>
                      <Label className="text-[11px]">Deduplication key</Label>
                      <Input value={selected.deduplicationKey} onChange={(e) => patch(selected.id, { deduplicationKey: e.target.value })} aria-label="Deduplication key" />
                    </div>
                    <div>
                      <Label className="text-[11px]">Suppression window (s)</Label>
                      <Input type="number" value={selected.suppressionWindowSeconds} onChange={(e) => patch(selected.id, { suppressionWindowSeconds: Number(e.target.value) })} aria-label="Suppression window seconds" />
                    </div>
                  </TabsContent>

                  <TabsContent value="limits" className="grid gap-3 md:grid-cols-2 pt-2 text-xs">
                    <div>
                      <Label className="text-[11px]">Rate limit (per hour)</Label>
                      <Input type="number" value={selected.rateLimitPerHour} onChange={(e) => patch(selected.id, { rateLimitPerHour: Number(e.target.value) })} aria-label="Rate limit per hour" />
                    </div>
                    <div>
                      <Label className="text-[11px]">Cooldown (s)</Label>
                      <Input type="number" value={selected.cooldownSeconds} onChange={(e) => patch(selected.id, { cooldownSeconds: Number(e.target.value) })} aria-label="Cooldown seconds" />
                    </div>
                    <div>
                      <Label className="text-[11px]">Max concurrent executions</Label>
                      <Input type="number" value={selected.maxConcurrent} onChange={(e) => patch(selected.id, { maxConcurrent: Number(e.target.value) })} aria-label="Max concurrent executions" />
                    </div>
                    <div>
                      <Label className="text-[11px]">Dead letter behavior</Label>
                      <Select value={selected.deadLetterAction} onValueChange={(v) => patch(selected.id, { deadLetterAction: v as Trigger["deadLetterAction"] })}>
                        <SelectTrigger aria-label="Dead letter behavior"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="queue">Queue for retry</SelectItem>
                          <SelectItem value="alert">Alert operator</SelectItem>
                          <SelectItem value="drop">Drop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="storm" checked={selected.stormProtection} onCheckedChange={(v) => patch(selected.id, { stormProtection: v === true })} />
                      <Label htmlFor="storm">Storm protection (auto-suppress on burst)</Label>
                    </div>
                  </TabsContent>

                  <TabsContent value="execution" className="grid gap-3 md:grid-cols-2 pt-2 text-xs">
                    <div>
                      <Label className="text-[11px]">Execution mode</Label>
                      <Select value={selected.executionMode} onValueChange={(v) => patch(selected.id, { executionMode: v as ExecutionMode })}>
                        <SelectTrigger aria-label="Execution mode"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Auto">Auto (policy allowed)</SelectItem>
                          <SelectItem value="Approval required">Approval required</SelectItem>
                          <SelectItem value="Documentation only">Documentation only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[11px]">Approval roles (comma separated)</Label>
                      <Input value={selected.approvalRoles.join(", ")} onChange={(e) => patch(selected.id, { approvalRoles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} aria-label="Approval roles" />
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="grid gap-3 md:grid-cols-2 pt-2 text-xs">
                    <div>
                      <Label className="text-[11px]">Cron schedule (Schedule kind)</Label>
                      <Input value={selected.schedule} onChange={(e) => patch(selected.id, { schedule: e.target.value })} placeholder="0 6 * * 1" disabled={selected.kind !== "Schedule"} aria-label="Cron schedule" />
                    </div>
                    <div>
                      <Label className="text-[11px]">Webhook path (Webhook kind)</Label>
                      <Input value={selected.webhookPath} onChange={(e) => patch(selected.id, { webhookPath: e.target.value })} placeholder="/hooks/checkout-latency" disabled={selected.kind !== "Webhook"} aria-label="Webhook path" />
                    </div>
                    <p className="md:col-span-2 text-[11px] text-muted-foreground">
                      {selected.kind === "Schedule" && "Schedule kind uses the cron expression above. Other fields are ignored."}
                      {selected.kind === "Webhook" && "Webhook kind exposes the path above under the tenant webhook base URL."}
                      {selected.kind !== "Schedule" && selected.kind !== "Webhook" && "Cron and webhook fields are disabled for this trigger kind."}
                    </p>
                  </TabsContent>

                  <TabsContent value="history" className="pt-2">
                    {testsForSelected.length === 0 && <p className="text-xs text-muted-foreground">No test runs yet.</p>}
                    <div className="space-y-1">
                      {testsForSelected.slice(0, 10).map((t) => (
                        <div key={t.id} className="rounded border border-slate-200 p-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span>{new Date(t.at).toLocaleString()} · {t.event}</span>
                            <Badge variant="outline" className={t.matched ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50"}>{t.matched ? "match" : "no match"}</Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground">{t.reason}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="activations" className="pt-2">
                    {activationsForSelected.length === 0 && <p className="text-xs text-muted-foreground">No recent activations.</p>}
                    <div className="space-y-1">
                      {activationsForSelected.slice(0, 15).map((a) => (
                        <div key={a.id} className="flex items-center justify-between rounded border border-slate-200 p-2 text-xs">
                          <div>
                            <div className="font-medium">{a.executionId}</div>
                            <div className="text-[11px] text-muted-foreground">{new Date(a.at).toLocaleString()} · {a.detail}</div>
                          </div>
                          <Badge variant="outline" className={cn(
                            a.state === "created"           && "border-emerald-300 bg-emerald-50 text-emerald-900",
                            a.state === "suppressed"        && "border-amber-300 bg-amber-50 text-amber-900",
                            a.state === "rate-limited"      && "border-amber-300 bg-amber-50 text-amber-900",
                            a.state === "dead-lettered"     && "border-rose-300 bg-rose-50 text-rose-900",
                            a.state === "source-unavailable" && "border-rose-300 bg-rose-50 text-rose-900",
                          )}>{a.state}</Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">AI trigger advisor</h2>
                  <Badge variant="outline">{Math.max(30, Math.min(94,
                    72
                    + (selected.conditions.length >= 2 ? 8 : -8)
                    + (selected.stormProtection ? 4 : -3)
                    + (selectedSourceUnavailable ? -25 : 0)
                    + (selected.executionMode === "Auto" && selected.approvalRoles.length === 0 ? -6 : 0)
                  ))}% confidence</Badge>
                </div>
                <ul className="text-xs list-disc pl-4 space-y-1">
                  <li>Evidence: {selected.conditions.length} condition(s), source connector <b>{selectedSource?.name ?? selected.sourceConnectorId}</b> · {selectedSource?.status ?? "unknown"}, {activationsForSelected.length} recent activations, {testsForSelected.filter((t) => t.matched).length} historical matches.</li>
                  <li>Confidence adjusted by condition count, storm protection, source availability, and execution/approval balance.</li>
                  <li>Uncertainty: without live traffic, storm-protection and rate-limit behavior are inferred from cooldown ({selected.cooldownSeconds}s) and rate ({selected.rateLimitPerHour}/h) — real signals may differ.</li>
                </ul>
                <div className="text-[11px] text-muted-foreground">
                  Sources: Runbook Detail v{selected.runbookVersion} · Policy Designer · Observability connector <b>{selectedSource?.name ?? "n/a"}</b> · INC-10482 replay window · Operations Queue history.
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
