/**
 * Step Code Builder — per-runbook-step Infrastructure-as-Code authoring surface.
 *
 * Two synchronized views:
 *  • Blocks view    — object-oriented visualization of the IaC resources
 *                     (Resource classes with typed properties and methods).
 *  • Code editor    — direct HCL / Terraform-style editor bound to the same
 *                     underlying block model.
 *
 * An AI assist panel proposes a generation with evidence, confidence, and
 * cited sources. Persisted per (runbookId, stepKey) in localStorage so the
 * authored artifact survives navigation and scenario advancement — never
 * overwritten by a scenario reset unless the user explicitly regenerates.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bot, Boxes, Code2, RotateCcw, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { RunbookStep } from "@/runops/data/scenario";

const LS_KEY = "runops.runbook.stepCode.v1";

/* --------------------------------- Types --------------------------------- */

interface ResourceProperty {
  name: string;
  value: string;
  kind: "string" | "number" | "bool" | "ref" | "list";
}
interface ResourceMethod {
  name: string;
  signature: string;
  description: string;
}
export interface ResourceBlock {
  kind: string;              // e.g. terraform "azurerm_mssql_failover_group"
  className: string;         // OO class alias, e.g. "FailoverGroup"
  name: string;              // instance name
  properties: ResourceProperty[];
  methods: ResourceMethod[];
}
export interface AiRationale {
  summary: string;
  confidence: number;        // 0-1
  uncertainty: string;
  evidence: string[];
  sources: { id: string; label: string }[];
}
export interface StepCodeTemplate {
  blocks: ResourceBlock[];
  code: string;
  rationale: AiRationale;
}

/* ----------------------- Deterministic templates ------------------------ */

function buildTemplate(runbookId: string, step: RunbookStep, stepIndex: number): StepCodeTemplate {
  // Seeded by (runbookId, step.key). Deterministic — no runtime randomness.
  const key = `${runbookId}::${step.key}`;

  if (runbookId === "RB-0039") {
    return RB_0039_TEMPLATES[step.key] ?? genericTemplate(step, stepIndex, key);
  }
  return genericTemplate(step, stepIndex, key);
}

const RB_0039_TEMPLATES: Record<string, StepCodeTemplate> = {
  s1: {
    blocks: [
      {
        kind: "runops_health_probe",
        className: "SqlPrimaryHealthProbe",
        name: "sql_primary_probe",
        properties: [
          { name: "target",            value: "\"sql-primary.contoso.internal:1433\"", kind: "string" },
          { name: "interval_seconds",  value: "10",                                     kind: "number" },
          { name: "failure_threshold", value: "3",                                      kind: "number" },
          { name: "signals",           value: "[\"tcp\",\"login\",\"replication_lag\"]", kind: "list"   },
        ],
        methods: [
          { name: "evaluate",           signature: "evaluate() -> HealthReport",           description: "Runs probe and returns latency, error rate, and lag." },
          { name: "isPrimaryUnhealthy", signature: "isPrimaryUnhealthy() -> bool",         description: "Returns true when failure threshold is exceeded." },
        ],
      },
      {
        kind: "runops_metric_query",
        className: "ConnectionErrorRate",
        name: "checkout_conn_errors",
        properties: [
          { name: "source",     value: "\"prometheus\"",                                                                    kind: "string" },
          { name: "expression", value: "\"sum(rate(sql_client_login_failures_total{service=\\\"checkout\\\"}[1m]))\"",       kind: "string" },
          { name: "threshold",  value: "5",                                                                                  kind: "number" },
        ],
        methods: [
          { name: "current", signature: "current() -> float", description: "Returns instantaneous connection error rate." },
        ],
      },
    ],
    code: `# Step 1 — Confirm primary is unhealthy
resource "runops_health_probe" "sql_primary_probe" {
  target             = "sql-primary.contoso.internal:1433"
  interval_seconds   = 10
  failure_threshold  = 3
  signals            = ["tcp", "login", "replication_lag"]
}

resource "runops_metric_query" "checkout_conn_errors" {
  source     = "prometheus"
  expression = "sum(rate(sql_client_login_failures_total{service=\\"checkout\\"}[1m]))"
  threshold  = 5
}

output "primary_unhealthy" {
  value = runops_health_probe.sql_primary_probe.unhealthy
}
`,
    rationale: {
      summary: "Compose a TCP + login + replication-lag probe with a Prometheus error-rate corroboration query. Two-signal confirmation avoids false positives from transient network blips.",
      confidence: 0.86,
      uncertainty: "Replication-lag signal depends on AG DMV availability; falls back to log-shipping latency if unavailable.",
      evidence: [
        "KE-217 documents plan-cache warmup that masquerades as primary failure — probe alone is insufficient.",
        "Postmortem PM-10471 recommended dual-signal confirmation before failover.",
      ],
      sources: [
        { id: "KE-217",    label: "Known Error KE-217" },
        { id: "PM-10471",  label: "Postmortem PM-10471" },
      ],
    },
  },
  s2: {
    blocks: [
      {
        kind: "runops_replica_inspector",
        className: "ReplicaReadinessInspector",
        name: "replica_check",
        properties: [
          { name: "availability_group", value: "\"ag-checkout-primary\"",              kind: "string" },
          { name: "max_lag_seconds",    value: "5",                                     kind: "number" },
          { name: "require_quorum",     value: "true",                                  kind: "bool"   },
          { name: "candidates",         value: "[\"sql-replica-01\",\"sql-replica-02\"]", kind: "list" },
        ],
        methods: [
          { name: "selectPromotionCandidate", signature: "selectPromotionCandidate() -> Replica", description: "Returns healthiest replica meeting lag and quorum." },
          { name: "hasQuorum",                signature: "hasQuorum() -> bool",                    description: "True when quorum can be maintained post-failover." },
        ],
      },
    ],
    code: `# Step 2 — Assess replica readiness
resource "runops_replica_inspector" "replica_check" {
  availability_group = "ag-checkout-primary"
  max_lag_seconds    = 5
  require_quorum     = true
  candidates         = ["sql-replica-01", "sql-replica-02"]
}

output "promotion_candidate" {
  value = runops_replica_inspector.replica_check.selected
}
`,
    rationale: {
      summary: "Inspect all AG replicas, filter by lag and quorum, return the healthiest promotion candidate. Blocks failover if quorum cannot be maintained.",
      confidence: 0.91,
      uncertainty: "Quorum arithmetic assumes 3-node AG; single-replica topologies require manual override.",
      evidence: [
        "RB-0039 v2.1 certification test asserted quorum gate.",
        "Change history shows sql-replica-02 recently added — verify seeded catalog.",
      ],
      sources: [
        { id: "RB-0039-cert", label: "RB-0039 v2.1 Certification" },
        { id: "CHG-19844",    label: "CHG-19844 Replica Provisioning" },
      ],
    },
  },
  s3: {
    blocks: [
      {
        kind: "runops_traffic_gate",
        className: "WriteQuiesceGate",
        name: "checkout_write_gate",
        properties: [
          { name: "targets",             value: "[\"checkout-api\",\"orders-api\"]", kind: "list"   },
          { name: "mode",                value: "\"read_only\"",                     kind: "string" },
          { name: "drain_timeout_sec",   value: "30",                                kind: "number" },
        ],
        methods: [
          { name: "engage", signature: "engage() -> DrainReport",   description: "Enables read-only mode and drains in-flight writes." },
          { name: "release", signature: "release() -> void",         description: "Restores write mode after successful failover." },
        ],
      },
    ],
    code: `# Step 3 — Quiesce application writes
resource "runops_traffic_gate" "checkout_write_gate" {
  targets           = ["checkout-api", "orders-api"]
  mode              = "read_only"
  drain_timeout_sec = 30
}
`,
    rationale: {
      summary: "Set both write-path APIs to read-only and drain in-flight transactions before promotion, preventing split-brain writes.",
      confidence: 0.89,
      uncertainty: "30s drain may be insufficient during peak; retry loop handles residual in-flight writes.",
      evidence: [
        "Feature flag `checkout.readonly-banner` already wired for customer-facing UI.",
      ],
      sources: [
        { id: "FF-checkout-readonly", label: "Feature flag: checkout.readonly-banner" },
      ],
    },
  },
  s4: {
    blocks: [
      {
        kind: "runops_sql_failover",
        className: "AgFailoverOperation",
        name: "ag_failover",
        properties: [
          { name: "availability_group", value: "\"ag-checkout-primary\"",                                     kind: "string" },
          { name: "target_replica",     value: "runops_replica_inspector.replica_check.selected",              kind: "ref"    },
          { name: "mode",               value: "\"forced_with_data_loss_disallowed\"",                         kind: "string" },
          { name: "listener_endpoint",  value: "\"sql-primary.contoso.internal\"",                             kind: "string" },
          { name: "approval_id",        value: "var.approval_id",                                              kind: "ref"    },
        ],
        methods: [
          { name: "promote", signature: "promote() -> FailoverResult", description: "Executes controlled promotion and updates the listener." },
          { name: "verify",  signature: "verify() -> bool",             description: "Confirms new primary accepts writes." },
        ],
      },
    ],
    code: `# Step 4 — Promote secondary replica
resource "runops_sql_failover" "ag_failover" {
  availability_group = "ag-checkout-primary"
  target_replica     = runops_replica_inspector.replica_check.selected
  mode               = "forced_with_data_loss_disallowed"
  listener_endpoint  = "sql-primary.contoso.internal"
  approval_id        = var.approval_id
}
`,
    rationale: {
      summary: "Controlled AG failover with data-loss guard. Listener endpoint is updated atomically so clients reconnect transparently.",
      confidence: 0.82,
      uncertainty: "Forced failover mode with data-loss disallowed will error out if replica lag exceeded thresholds mid-drain — falls to step 8 rollback branch.",
      evidence: [
        "Approval APR-4471 pattern applies — requires SoD from Change Manager.",
        "AG listener DNS TTL is 30s in this deployment.",
      ],
      sources: [
        { id: "SEP-DUTY-POL", label: "Separation-of-duties policy" },
        { id: "AG-LISTENER",  label: "AG listener DNS config" },
      ],
    },
  },
  s5: {
    blocks: [
      {
        kind: "runops_pod_recycler",
        className: "ConnectionPoolRecycler",
        name: "checkout_pool_recycle",
        properties: [
          { name: "namespace",           value: "\"checkout-prod\"",                    kind: "string" },
          { name: "selector",            value: "\"app in (checkout-api,orders-api)\"", kind: "string" },
          { name: "strategy",            value: "\"rolling\"",                          kind: "string" },
          { name: "max_unavailable",     value: "\"25%\"",                              kind: "string" },
        ],
        methods: [
          { name: "recycle",   signature: "recycle() -> RolloutStatus", description: "Rolling restart to rebind connection pools." },
          { name: "waitReady", signature: "waitReady() -> bool",        description: "Blocks until all pods are Ready." },
        ],
      },
    ],
    code: `# Step 5 — Repoint application connections
resource "runops_pod_recycler" "checkout_pool_recycle" {
  namespace       = "checkout-prod"
  selector        = "app in (checkout-api,orders-api)"
  strategy        = "rolling"
  max_unavailable = "25%"
}
`,
    rationale: {
      summary: "Rolling recycle with 25% max-unavailable rebinds connection pools to the new primary without dropping customer traffic entirely.",
      confidence: 0.9,
      uncertainty: "AKS surge budget must allow +25% pods; verified against HPA config.",
      evidence: [
        "HPA config allows surge to 130% of desired replicas.",
      ],
      sources: [
        { id: "HPA-checkout", label: "Checkout HPA manifest" },
      ],
    },
  },
  s6: {
    blocks: [
      {
        kind: "runops_slo_validator",
        className: "PostFailoverValidator",
        name: "post_failover_validate",
        properties: [
          { name: "service_id",          value: "\"svc-global-order-processing\"", kind: "string" },
          { name: "window_seconds",      value: "180",                             kind: "number" },
          { name: "sli_error_rate_max",  value: "0.005",                           kind: "number" },
          { name: "sli_p95_ms_max",      value: "750",                             kind: "number" },
        ],
        methods: [
          { name: "validate", signature: "validate() -> ValidationReport", description: "Compares live SLIs to baseline for the window." },
        ],
      },
    ],
    code: `# Step 6 — Validate service telemetry
resource "runops_slo_validator" "post_failover_validate" {
  service_id         = "svc-global-order-processing"
  window_seconds     = 180
  sli_error_rate_max = 0.005
  sli_p95_ms_max     = 750
}
`,
    rationale: {
      summary: "Validate write success, p95 latency, and replication resynchronization over a 3-minute window against the SLO envelope.",
      confidence: 0.88,
      uncertainty: "Short window may miss slow replay tails; step 7 synthetic journey provides customer-perceived confirmation.",
      evidence: [
        "SLO SLO-GOP-AV window is 28d — 3m validation is transient gate, not SLO judgment.",
      ],
      sources: [
        { id: "SLO-GOP-AV", label: "Checkout availability SLO" },
        { id: "SLO-GOP-LT", label: "Checkout latency SLO" },
      ],
    },
  },
  s7: {
    blocks: [
      {
        kind: "runops_synthetic_journey",
        className: "CheckoutSyntheticJourney",
        name: "e2e_checkout_probe",
        properties: [
          { name: "journey_id", value: "\"checkout-e2e-v3\"",                          kind: "string" },
          { name: "assertions", value: "[\"place_order\",\"payment_captured\",\"receipt_email\"]", kind: "list" },
          { name: "sla_ms",     value: "2500",                                         kind: "number" },
        ],
        methods: [
          { name: "run",      signature: "run() -> JourneyResult",     description: "Executes the E2E checkout journey." },
          { name: "capture",  signature: "capture() -> EvidenceRef",   description: "Attaches trace + screenshots to evidence graph." },
        ],
      },
    ],
    code: `# Step 7 — Run synthetic checkout journey
resource "runops_synthetic_journey" "e2e_checkout_probe" {
  journey_id = "checkout-e2e-v3"
  assertions = ["place_order", "payment_captured", "receipt_email"]
  sla_ms     = 2500
}
`,
    rationale: {
      summary: "End-to-end synthetic order proves the customer path works, not just infrastructure telemetry. Attaches evidence for audit.",
      confidence: 0.93,
      uncertainty: "Payment provider sandbox must be reachable; connector health is checked pre-run.",
      evidence: [
        "Synthetic v3 was certified alongside RB-0042 execution EXE-8841.",
      ],
      sources: [
        { id: "EXE-8841",      label: "Prior execution EXE-8841 evidence chain" },
        { id: "CON-Payments",  label: "Payments Provider connector" },
      ],
    },
  },
  s8: {
    blocks: [
      {
        kind: "runops_failback_plan",
        className: "FailbackRollback",
        name: "ag_failback",
        properties: [
          { name: "trigger",              value: "\"validation_failed OR original_primary_recovered\"", kind: "string" },
          { name: "maintenance_window",   value: "\"next_scheduled\"",                                  kind: "string" },
          { name: "requires_approval",    value: "true",                                                kind: "bool"   },
          { name: "post_checks",          value: "runops_slo_validator.post_failover_validate.id",      kind: "ref"    },
        ],
        methods: [
          { name: "plan",    signature: "plan() -> FailbackPlan",    description: "Produces failback plan and impact review." },
          { name: "execute", signature: "execute() -> RollbackResult", description: "Runs during maintenance window after approval." },
        ],
      },
    ],
    code: `# Step 8 — Rollback: fail back to original primary
resource "runops_failback_plan" "ag_failback" {
  trigger             = "validation_failed OR original_primary_recovered"
  maintenance_window  = "next_scheduled"
  requires_approval   = true
  post_checks         = runops_slo_validator.post_failover_validate.id
}
`,
    rationale: {
      summary: "Conditional fail-back guarded by approval and a maintenance window. Reuses the step-6 validator to gate the restoration.",
      confidence: 0.78,
      uncertainty: "Fail-back timing depends on business-hours change freeze; auto-schedules to next available window.",
      evidence: [
        "Change policy CHG-POL-04 requires maintenance-window fail-back for Tier 1 services.",
      ],
      sources: [
        { id: "CHG-POL-04", label: "Change policy CHG-POL-04" },
      ],
    },
  },
};

function genericTemplate(step: RunbookStep, stepIndex: number, key: string): StepCodeTemplate {
  const className =
    step.kind === "diagnose" ? "DiagnosticProbe" :
    step.kind === "mitigate" ? "MitigationAction" :
    step.kind === "validate" ? "ValidationCheck" :
    "RollbackAction";
  const resourceKind =
    step.kind === "diagnose" ? "runops_probe" :
    step.kind === "mitigate" ? "runops_action" :
    step.kind === "validate" ? "runops_validator" :
    "runops_rollback";
  const instanceName = `step_${stepIndex + 1}_${step.kind}`;
  return {
    blocks: [{
      kind: resourceKind,
      className,
      name: instanceName,
      properties: [
        { name: "step_key",    value: `"${step.key}"`,                              kind: "string" },
        { name: "label",       value: `"${step.label.replace(/"/g, "\\\"")}"`,      kind: "string" },
        { name: "kind",        value: `"${step.kind}"`,                              kind: "string" },
        { name: "timeout_sec", value: "60",                                          kind: "number" },
      ],
      methods: [
        { name: "execute", signature: "execute() -> StepResult", description: "Runs the step and emits an audit + domain event." },
      ],
    }],
    code: `# ${step.label}
resource "${resourceKind}" "${instanceName}" {
  step_key    = "${step.key}"
  label       = "${step.label.replace(/"/g, "\\\"")}"
  kind        = "${step.kind}"
  timeout_sec = 60
}
`,
    rationale: {
      summary: `Deterministic generic ${step.kind} scaffold for step "${step.label}". Refine with runbook-specific inputs.`,
      confidence: 0.55,
      uncertainty: "Generic scaffold — replace resource kind and inputs to match the target platform.",
      evidence: [`Seed: ${key}`],
      sources: [{ id: "generic-template", label: "Generic step template" }],
    },
  };
}

/* -------------------------------- Storage -------------------------------- */

interface StoredCode { code: string; savedAt: string; }

function readStore(): Record<string, StoredCode> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredCode>) : {};
  } catch { return {}; }
}
function writeStore(next: Record<string, StoredCode>): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
}
function storeKey(runbookId: string, stepKey: string): string {
  return `${runbookId}::${stepKey}`;
}

/* --------------------------------- View --------------------------------- */

interface Props {
  runbookId: string;
  step: RunbookStep;
  stepIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StepCodeBuilder({ runbookId, step, stepIndex, open, onOpenChange }: Props) {
  const template = useMemo(
    () => buildTemplate(runbookId, step, stepIndex),
    [runbookId, step, stepIndex],
  );

  const [view, setView] = useState<"blocks" | "code">("blocks");
  const [code, setCode] = useState<string>(template.code);
  const [dirty, setDirty] = useState<boolean>(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Load persisted code (or fall back to template) whenever the target step changes.
  useEffect(() => {
    const store = readStore();
    const rec = store[storeKey(runbookId, step.key)];
    if (rec) {
      setCode(rec.code);
      setSavedAt(rec.savedAt);
    } else {
      setCode(template.code);
      setSavedAt(null);
    }
    setDirty(false);
  }, [runbookId, step.key, template.code]);

  const handleSave = useCallback(() => {
    const store = readStore();
    const stamp = new Date().toISOString();
    store[storeKey(runbookId, step.key)] = { code, savedAt: stamp };
    writeStore(store);
    setSavedAt(stamp);
    setDirty(false);
  }, [code, runbookId, step.key]);

  const handleRegenerate = useCallback(() => {
    setCode(template.code);
    setDirty(true);
  }, [template.code]);

  const handleAiAssist = useCallback(() => {
    // Deterministic AI-assist: reapply the seeded template. In production this
    // would call the AI gateway with the same evidence bundle and return a
    // signed generation.
    setCode(template.code);
    setDirty(true);
  }, [template.code]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-4 w-4" aria-hidden />
            Step {stepIndex + 1} · {step.label}
            <Badge variant="outline" className="ml-2 capitalize">{step.kind}</Badge>
          </DialogTitle>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 border-b pb-2">
          <Button
            size="sm"
            variant={view === "blocks" ? "default" : "outline"}
            onClick={() => setView("blocks")}
          >
            <Boxes className="mr-1 h-3 w-3" aria-hidden /> Blocks
          </Button>
          <Button
            size="sm"
            variant={view === "code" ? "default" : "outline"}
            onClick={() => setView("code")}
          >
            <Code2 className="mr-1 h-3 w-3" aria-hidden /> Code
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleAiAssist}>
              <Sparkles className="mr-1 h-3 w-3" aria-hidden /> AI assist
            </Button>
            <Button size="sm" variant="outline" onClick={handleRegenerate}>
              <RotateCcw className="mr-1 h-3 w-3" aria-hidden /> Reset
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            {view === "blocks" ? (
              <BlocksView blocks={template.blocks} />
            ) : (
              <CodeView code={code} onChange={(v) => { setCode(v); setDirty(true); }} />
            )}
          </div>
          <AiRationalePanel rationale={template.rationale} />
        </div>

        <DialogFooter className="items-center">
          <div className="mr-auto text-[11px] text-slate-500">
            {savedAt ? `Saved ${new Date(savedAt).toLocaleString()}` : "Unsaved"}
            {dirty && <span className="ml-1 text-amber-700">· modified</span>}
          </div>
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button size="sm" onClick={handleSave} disabled={!dirty}>
            <Save className="mr-1 h-3 w-3" aria-hidden /> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Sub-views ------------------------------ */

function BlocksView({ blocks }: { blocks: ResourceBlock[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((b) => (
        <div key={b.name} className="rounded border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b bg-slate-50 px-3 py-2">
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-800">class</span>
            <span className="text-xs font-semibold">{b.className}</span>
            <span className="text-[10px] text-slate-500">extends</span>
            <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">{b.kind}</code>
            <span className="ml-auto text-[10px] text-slate-500">#{b.name}</span>
          </div>
          <div className="grid gap-0 md:grid-cols-2">
            <div className="border-r p-2">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Properties</div>
              <ul className="space-y-0.5 font-mono text-[11px]">
                {b.properties.map((p) => (
                  <li key={p.name} className="flex items-start gap-1">
                    <span className="text-slate-700">{p.name}</span>
                    <span className="text-slate-400">:</span>
                    <span className={cn(
                      "truncate",
                      p.kind === "string" && "text-emerald-700",
                      p.kind === "number" && "text-sky-700",
                      p.kind === "bool"   && "text-purple-700",
                      p.kind === "ref"    && "text-amber-700",
                      p.kind === "list"   && "text-slate-700",
                    )}>{p.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-2">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Methods</div>
              <ul className="space-y-1 text-[11px]">
                {b.methods.map((m) => (
                  <li key={m.name}>
                    <code className="text-slate-800">{m.signature}</code>
                    <div className="text-[10px] text-slate-500">{m.description}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CodeView({ code, onChange }: { code: string; onChange: (v: string) => void }) {
  return (
    <Textarea
      value={code}
      onChange={(e) => onChange(e.target.value)}
      className="h-[380px] resize-none rounded border border-slate-200 bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-emerald-100"
      spellCheck={false}
      aria-label="Infrastructure as code editor"
    />
  );
}

function AiRationalePanel({ rationale }: { rationale: AiRationale }) {
  const pct = Math.round(rationale.confidence * 100);
  return (
    <aside className="rounded border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center gap-1 text-xs font-semibold">
        <Bot className="h-3.5 w-3.5 text-indigo-600" aria-hidden /> AI rationale
      </div>
      <p className="text-[11px] text-slate-700">{rationale.summary}</p>
      <div className="mt-2">
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>Confidence</span><span className="font-semibold text-slate-700">{pct}%</span>
        </div>
        <div className="mt-0.5 h-1.5 w-full rounded bg-slate-200">
          <div
            className={cn(
              "h-1.5 rounded",
              pct >= 85 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-rose-500",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="mt-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Uncertainty</div>
        <div className="text-[11px] text-slate-700">{rationale.uncertainty}</div>
      </div>
      <div className="mt-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Evidence</div>
        <ul className="list-disc pl-4 text-[11px] text-slate-700">
          {rationale.evidence.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>
      <div className="mt-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Sources</div>
        <ul className="space-y-0.5 text-[11px]">
          {rationale.sources.map((s) => (
            <li key={s.id}>
              <code className="rounded bg-white px-1 py-0.5 text-[10px]">{s.id}</code>
              <span className="ml-1 text-slate-700">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
