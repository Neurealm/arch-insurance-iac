/**
 * Page 13 · Step, Connector, and Parameter Builder
 * Route: /runops/runbooks/:runbookId/steps/:stepId
 *
 * Configures the technical behavior of a single runbook step. Reads and
 * writes the same designer state as page 12, so workflow visualization stays
 * in sync. All context flows through useOperations(); no fixture arrays,
 * no `any` types.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle, ArrowLeft, Beaker, EyeOff, KeyRound, Lock, Play,
  Save, ShieldAlert, ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  EntityHeader, PermissionDeniedState,
} from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

const IMPL_TYPES = [
  "Human Instruction", "REST API", "Webhook", "SSH", "PowerShell",
  "Command Line", "Ansible", "Terraform", "Kubernetes", "Database Query",
  "ITSM Action", "Collaboration Message", "Digital Worker Task", "Subrunbook",
] as const;
type ImplType = (typeof IMPL_TYPES)[number];

interface InputBinding { key: string; type: "string" | "number" | "boolean" | "object"; source: "literal" | "prior-step" | "variable"; value: string; required: boolean; }
interface OutputSchema { key: string; type: "string" | "number" | "boolean" | "object"; description: string; }
interface Validation { code: string; severity: "error" | "warning"; message: string; }

interface StepConfig {
  runbookId: string;
  stepId: string;
  impl: ImplType;
  label: string;
  description: string;
  connectorId: string;
  targetEnv: string;
  targetComponent: string;
  runnerId: string;
  inputs: InputBinding[];
  outputs: OutputSchema[];
  variables: string;        // comma list
  secretRefs: string;       // comma list, secret:*
  timeoutSeconds: number;
  retries: number;
  retryBackoffMs: number;
  idempotencyKey: string;
  maxConcurrency: number;
  rateLimitPerMinute: number;
  onFailure: "abort" | "continue" | "rollback" | "notify";
  evidenceCapture: string;  // comma list
  requiredRole: string;
  destructive: boolean;
  commandTemplate: string;  // rendered preview source
  savedReusable: boolean;
  usageRefs: string[];      // other runbook IDs where used
  lastTest: { at: string; status: "passed" | "failed"; detail: string } | null;
}

/* Blocked / unsupported commands (defense-in-depth) */
const BLOCKED_PATTERNS: readonly RegExp[] = [
  /\brm\s+-rf\s+\//i,
  /\bmkfs\b/i,
  /:\(\)\s*\{\s*:\|\:&\s*\};/,
  /\bshutdown\b/i,
  /\bdd\s+if=/i,
];

/* -------------------------------------------------------------------------- */
/* Persistence                                                                 */
/* -------------------------------------------------------------------------- */

const LS_STEP = (rb: string, id: string) => `runops.step.${rb}.${id}.v1`;
const LS_DESIGNER = (rb: string) => `runops.designer.${rb}.v1`;

interface DesignerLikeNode { id: string; type: string; label: string; description: string; timeoutSeconds: number | null; hasFailureHandler: boolean; hasRollback: boolean; requiresConnector: string; }
interface DesignerLikeState { nodes: DesignerLikeNode[]; }

function loadConfig(rb: string, id: string, seed: Partial<StepConfig>): StepConfig {
  try {
    const raw = localStorage.getItem(LS_STEP(rb, id));
    if (raw) return JSON.parse(raw) as StepConfig;
  } catch { /* ignore */ }
  return {
    runbookId: rb, stepId: id,
    impl: (seed.impl ?? "REST API") as ImplType,
    label: seed.label ?? id,
    description: seed.description ?? "",
    connectorId: seed.connectorId ?? "",
    targetEnv: "Production",
    targetComponent: "",
    runnerId: "runner-primary",
    inputs: [{ key: "endpoint", type: "string", source: "literal", value: "", required: true }],
    outputs: [{ key: "statusCode", type: "number", description: "HTTP status" }],
    variables: "",
    secretRefs: "",
    timeoutSeconds: seed.timeoutSeconds ?? 60,
    retries: 2, retryBackoffMs: 500,
    idempotencyKey: "",
    maxConcurrency: 1, rateLimitPerMinute: 30,
    onFailure: "abort",
    evidenceCapture: "request,response",
    requiredRole: "SRE Engineer",
    destructive: false,
    commandTemplate: "",
    savedReusable: false,
    usageRefs: [],
    lastTest: null,
  };
}
function saveConfig(cfg: StepConfig) { localStorage.setItem(LS_STEP(cfg.runbookId, cfg.stepId), JSON.stringify(cfg)); }

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

function validateConfig(cfg: StepConfig, connectorHealthy: boolean, connectorKnown: boolean): Validation[] {
  const v: Validation[] = [];
  if (!cfg.label.trim()) v.push({ code: "no-label", severity: "error", message: "Label is required." });
  if (cfg.impl !== "Human Instruction" && !cfg.connectorId)
    v.push({ code: "no-connector", severity: "error", message: "Missing connector." });
  if (cfg.connectorId && !connectorKnown)
    v.push({ code: "unknown-connector", severity: "error", message: `Connector "${cfg.connectorId}" not registered in tenant.` });
  if (cfg.connectorId && connectorKnown && !connectorHealthy)
    v.push({ code: "connector-degraded", severity: "warning", message: `Connector "${cfg.connectorId}" is not Healthy.` });
  if (cfg.timeoutSeconds <= 0) v.push({ code: "bad-timeout", severity: "error", message: "Timeout must be > 0s." });
  if (cfg.retries < 0) v.push({ code: "bad-retry", severity: "error", message: "Retries cannot be negative." });
  if (cfg.destructive && !cfg.idempotencyKey.trim())
    v.push({ code: "idem", severity: "warning", message: "Destructive actions should declare an idempotency key." });
  if (cfg.destructive && cfg.onFailure !== "rollback")
    v.push({ code: "dest-rollback", severity: "warning", message: "Destructive actions should route failures to rollback." });

  // Secret references
  for (const s of cfg.secretRefs.split(",").map((x) => x.trim()).filter(Boolean)) {
    if (!/^secret:[a-z0-9._-]+$/i.test(s))
      v.push({ code: "bad-secret", severity: "error", message: `Invalid secret reference "${s}" (expected secret:*).` });
  }
  // Blocked commands in preview template
  const src = `${cfg.commandTemplate}\n${cfg.inputs.map((i) => i.value).join("\n")}`;
  for (const r of BLOCKED_PATTERNS) {
    if (r.test(src)) {
      v.push({ code: "blocked-cmd", severity: "error", message: "Unsupported / dangerous command detected." });
      break;
    }
  }
  // Prior-step outputs referenced
  for (const inp of cfg.inputs) {
    if (inp.required && !inp.value.trim())
      v.push({ code: "missing-input", severity: "error", message: `Input "${inp.key}" is required.` });
  }
  // Undefined variables ${...}
  const decl = new Set(cfg.variables.split(",").map((s) => s.trim()).filter(Boolean));
  for (const inp of cfg.inputs) {
    const refs = [...inp.value.matchAll(/\$\{([a-zA-Z0-9_.-]+)\}/g)].map((m) => m[1]);
    for (const r of refs) {
      if (r.startsWith("steps.")) continue; // prior-step reference
      if (!decl.has(r))
        v.push({ code: "undef-var", severity: "warning", message: `Input "${inp.key}" references undefined variable \${${r}}.` });
    }
  }
  return v;
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function RunbookStepBuilder() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams();
  const runbookId = params.runbookId ?? "RB-0042";
  const stepId = params.stepId ?? "step-new";

  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";

  /* Seed from designer node if present */
  const designerSeed = useMemo<Partial<StepConfig>>(() => {
    try {
      const raw = localStorage.getItem(LS_DESIGNER(runbookId));
      if (!raw) return {};
      const d = JSON.parse(raw) as DesignerLikeState;
      const node = d.nodes.find((n) => n.id === stepId);
      if (!node) return {};
      const mapType = (t: string): ImplType => {
        if (t === "Command") return "Command Line";
        if (t === "API Call") return "REST API";
        if (t === "Query") return "Database Query";
        if (t === "Notification") return "Collaboration Message";
        if (t === "Human Instruction") return "Human Instruction";
        if (t === "Digital Worker") return "Digital Worker Task";
        if (t === "Subrunbook") return "Subrunbook";
        return "REST API";
      };
      return {
        label: node.label,
        description: node.description,
        impl: mapType(node.type),
        connectorId: node.requiresConnector || "",
        timeoutSeconds: node.timeoutSeconds ?? 60,
      };
    } catch { return {}; }
  }, [runbookId, stepId]);

  const [cfg, setCfg] = useState<StepConfig>(() => loadConfig(runbookId, stepId, designerSeed));
  const [dirty, setDirty] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [issues, setIssues] = useState<Validation[]>([]);

  useEffect(() => { if (!readOnly) saveConfig(cfg); }, [cfg, readOnly]);

  /* Provider-derived */
  const runbook = ops.runbooks.find((r) => r.id === runbookId);
  const connector = ops.connectors.find((c) => c.id === cfg.connectorId);
  const connectorHealthy = connector?.status === "Healthy";
  const connectorKnown = Boolean(connector);
  const targetService = ops.services.find((s) => s.id === runbook?.serviceId);
  const roleAllowed = !readOnly; // authoring roles allowed; audit blocked above

  /* Cross-runbook usage — reusable step marker */
  const usageRefs = useMemo(() => {
    if (!cfg.savedReusable) return [];
    return ops.runbooks
      .filter((r) => r.id !== runbookId && r.state !== "Retired")
      .slice(0, 3)
      .map((r) => r.id);
  }, [cfg.savedReusable, ops.runbooks, runbookId]);

  const patch = useCallback(<K extends keyof StepConfig>(k: K, v: StepConfig[K]) => {
    setCfg((c) => ({ ...c, [k]: v }));
    setDirty(true);
  }, []);

  const updateInput = useCallback((idx: number, patchIn: Partial<InputBinding>) => {
    setCfg((c) => ({ ...c, inputs: c.inputs.map((inp, i) => i === idx ? { ...inp, ...patchIn } : inp) }));
    setDirty(true);
  }, []);
  const addInput = useCallback(() => {
    setCfg((c) => ({ ...c, inputs: [...c.inputs, { key: `input_${c.inputs.length + 1}`, type: "string", source: "literal", value: "", required: false }] }));
    setDirty(true);
  }, []);
  const removeInput = useCallback((idx: number) => {
    setCfg((c) => ({ ...c, inputs: c.inputs.filter((_, i) => i !== idx) }));
    setDirty(true);
  }, []);

  const updateOutput = useCallback((idx: number, patchOut: Partial<OutputSchema>) => {
    setCfg((c) => ({ ...c, outputs: c.outputs.map((o, i) => i === idx ? { ...o, ...patchOut } : o) }));
    setDirty(true);
  }, []);
  const addOutput = useCallback(() => {
    setCfg((c) => ({ ...c, outputs: [...c.outputs, { key: `output_${c.outputs.length + 1}`, type: "string", description: "" }] }));
    setDirty(true);
  }, []);
  const removeOutput = useCallback((idx: number) => {
    setCfg((c) => ({ ...c, outputs: c.outputs.filter((_, i) => i !== idx) }));
    setDirty(true);
  }, []);

  const runValidation = useCallback(() => {
    const list = validateConfig(cfg, connectorHealthy, connectorKnown);
    setIssues(list);
    return list;
  }, [cfg, connectorHealthy, connectorKnown]);

  const handleSave = useCallback(() => {
    if (readOnly) return;
    const list = runValidation();
    if (list.some((i) => i.severity === "error")) {
      ops.pushNotification({ kind: "warning", title: "Cannot save — validation errors", detail: `${list.filter((i) => i.severity === "error").length} errors`, entityRef: stepId });
      return;
    }
    saveConfig(cfg);
    setDirty(false);
    // Update the designer node so workflow stays in sync
    try {
      const raw = localStorage.getItem(LS_DESIGNER(runbookId));
      if (raw) {
        const d = JSON.parse(raw) as DesignerLikeState;
        const nextNodes = d.nodes.map((n) => n.id === stepId
          ? { ...n, label: cfg.label, description: cfg.description, timeoutSeconds: cfg.timeoutSeconds, requiresConnector: cfg.connectorId, hasFailureHandler: cfg.onFailure !== "abort" || cfg.retries > 0, hasRollback: cfg.onFailure === "rollback" }
          : n);
        localStorage.setItem(LS_DESIGNER(runbookId), JSON.stringify({ ...d, nodes: nextNodes }));
      }
    } catch { /* ignore */ }
    ops.pushNotification({ kind: "info", title: "Step saved", detail: `${cfg.label} · ${cfg.impl}`, entityRef: stepId });
  }, [cfg, ops, readOnly, runValidation, runbookId, stepId]);

  const handleSaveAndReturn = useCallback(() => {
    handleSave();
    navigate(`/runops/runbooks/${runbookId}/designer`);
  }, [handleSave, navigate, runbookId]);

  const handleSaveReusable = useCallback(() => {
    patch("savedReusable", true);
    ops.pushNotification({ kind: "info", title: "Reusable step saved", detail: cfg.label, entityRef: stepId });
  }, [cfg.label, ops, patch, stepId]);

  const runTest = useCallback((forceDestructive: boolean) => {
    if (!roleAllowed) return;
    if (cfg.destructive && !forceDestructive) { setTestOpen(true); return; }
    const list = runValidation();
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      const status: "passed" | "failed" = list.some((i) => i.severity === "error") || !connectorHealthy ? "failed" : "passed";
      const detail = status === "passed"
        ? "Sandbox executed the configured step against a stubbed connector."
        : list.find((i) => i.severity === "error")?.message ?? "Connector unhealthy or unavailable.";
      setCfg((c) => ({ ...c, lastTest: { at: new Date().toISOString(), status, detail } }));
      ops.pushNotification({
        kind: status === "passed" ? "info" : "warning",
        title: `Sandbox test ${status}`,
        detail: `${cfg.label} · ${detail}`,
        entityRef: stepId,
      });
    }, 500);
  }, [cfg.destructive, cfg.label, connectorHealthy, ops, roleAllowed, runValidation, stepId]);

  /* Preview render — mask secrets */
  const renderedPreview = useMemo(() => {
    const kv = new Map<string, string>();
    for (const inp of cfg.inputs) kv.set(inp.key, inp.value);
    const masked = cfg.secretRefs.split(",").map((s) => s.trim()).filter(Boolean);
    let out = cfg.commandTemplate || defaultTemplate(cfg.impl, kv);
    for (const s of masked) out = out.split(s).join("••••••");
    return out;
  }, [cfg]);

  if (readOnly) {
    return (
      <div className="p-6">
        <PermissionDeniedState
          title="Read-only role"
          description="Your current role cannot edit runbook steps."
        />
      </div>
    );
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  return (
    <div className="flex flex-col gap-3 p-4 md:p-6" aria-label="Step, connector, and parameter builder">
      <EntityHeader
        eyebrow="Runbook step"
        title={`${cfg.label || stepId}`}
        subtitle={`${runbookId} · ${cfg.impl}${targetService ? ` · ${targetService.name}` : ""}`}
        meta={
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Tenant: <span className="text-foreground">{ops.tenant.name}</span></span>
            <span>Env: <span className="text-foreground">{cfg.targetEnv}</span></span>
            <span>Role: <span className="text-foreground">{ops.role}</span></span>
            <span aria-live="polite">{dirty ? "Unsaved changes" : "Saved"}</span>
            <span className="flex items-center gap-1">
              {connector
                ? (connectorHealthy
                  ? <><ShieldCheck className="h-3 w-3 text-emerald-600" aria-hidden />{connector.name} healthy</>
                  : <><ShieldAlert className="h-3 w-3 text-amber-600" aria-hidden />{connector.name} {connector.status}</>)
                : <><ShieldAlert className="h-3 w-3 text-amber-600" aria-hidden />No connector selected</>}
            </span>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/runops/runbooks/${runbookId}/designer`)} aria-label="Back to workflow">
              <ArrowLeft className="h-4 w-4" /> Workflow
            </Button>
            <Button variant="outline" size="sm" onClick={runValidation} aria-label="Validate step">Validate</Button>
            <Button variant="outline" size="sm" onClick={() => runTest(false)} disabled={running} aria-label="Test in sandbox">
              <Beaker className="h-4 w-4" /> {running ? "Running…" : "Test"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveReusable}>Save reusable</Button>
            <Button variant="outline" size="sm" onClick={handleSave} aria-label="Save step">
              <Save className="h-4 w-4" /> Save
            </Button>
            <Button size="sm" onClick={handleSaveAndReturn} aria-label="Save and return">
              Save & return
            </Button>
          </div>
        }
      />

      {/* Status band */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatusChip label="Configuration" tone={errorCount === 0 ? "success" : "critical"} text={errorCount === 0 ? "Valid" : `${errorCount} errors`} />
        <StatusChip label="Connector" tone={connector ? (connectorHealthy ? "success" : "warning") : "critical"} text={connector ? `${connector.status}` : "Missing"} />
        <StatusChip label="Target" tone={targetService ? "success" : "warning"} text={targetService ? "Authorized" : "Unauthorized"} />
        <StatusChip label="Last test" tone={cfg.lastTest ? (cfg.lastTest.status === "passed" ? "success" : "critical") : "neutral"} text={cfg.lastTest ? cfg.lastTest.status : "not run"} />
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="target">Target</TabsTrigger>
          <TabsTrigger value="connector">Connector</TabsTrigger>
          <TabsTrigger value="io">Inputs · Outputs</TabsTrigger>
          <TabsTrigger value="vars">Variables · Secrets</TabsTrigger>
          <TabsTrigger value="policy">Timeout · Retry · Concurrency</TabsTrigger>
          <TabsTrigger value="failure">Failure · Evidence</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SectionCard>
            <div className="grid gap-3 md:grid-cols-2">
              <FieldSelect label="Implementation" value={cfg.impl} onChange={(v) => patch("impl", v as ImplType)} options={IMPL_TYPES} />
              <FieldInput label="Label" value={cfg.label} onChange={(v) => patch("label", v)} />
              <div className="md:col-span-2">
                <Label htmlFor="s-desc">Description</Label>
                <Textarea id="s-desc" rows={2} value={cfg.description} onChange={(e) => patch("description", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="s-template">Command / request template</Label>
                <Textarea id="s-template" rows={3} value={cfg.commandTemplate} onChange={(e) => patch("commandTemplate", e.target.value)}
                  placeholder="e.g. GET https://api/${host}/status  or  kubectl rollout restart deploy/${service}" />
              </div>
              <div className="md:col-span-2">
                <Label>Rendered preview (secrets masked)</Label>
                <pre className="mt-1 overflow-auto rounded border border-border bg-muted/40 p-2 text-xs" aria-label="Rendered preview">{renderedPreview}</pre>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="target">
          <SectionCard>
            <div className="grid gap-3 md:grid-cols-2">
              <FieldSelect label="Environment" value={cfg.targetEnv} onChange={(v) => patch("targetEnv", v)} options={ops.environmentOptions} />
              <FieldSelect label="Component"
                value={cfg.targetComponent}
                onChange={(v) => patch("targetComponent", v)}
                options={targetService ? targetService.componentIds : []}
                placeholder={targetService ? "Select component" : "No service on this runbook"}
              />
              <FieldInput label="Runner" value={cfg.runnerId} onChange={(v) => patch("runnerId", v)} />
              <div className="flex items-center gap-2 pt-6">
                <Checkbox id="s-destructive" checked={cfg.destructive} onCheckedChange={(v) => patch("destructive", Boolean(v))} />
                <Label htmlFor="s-destructive">Destructive action (requires confirmation to test)</Label>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="connector">
          <SectionCard>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="s-conn">Connector</Label>
                <Select value={cfg.connectorId || "none"} onValueChange={(v) => patch("connectorId", v === "none" ? "" : v)}>
                  <SelectTrigger id="s-conn"><SelectValue placeholder="Select connector" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (human step)</SelectItem>
                    {ops.connectors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} · {c.kind} · {c.status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded border border-border bg-card p-3 text-sm">
                {connector
                  ? (
                    <>
                      <div className="font-medium">{connector.name}</div>
                      <div className="text-xs text-muted-foreground">Status: {connector.status} · Fresh {connector.freshness}</div>
                      {!connectorHealthy && <div className="mt-1 text-xs text-amber-700">Connector is not Healthy — sandbox tests will fail.</div>}
                    </>
                  )
                  : <div className="text-xs text-muted-foreground">No connector selected — this step will run as a human instruction.</div>}
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="io">
          <SectionCard>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Typed inputs</div>
              <Button size="sm" variant="outline" onClick={addInput}>Add input</Button>
            </div>
            <div className="space-y-2">
              {cfg.inputs.map((inp, i) => (
                <div key={i} className="grid gap-2 rounded border border-border bg-card p-2 md:grid-cols-[1fr_140px_160px_2fr_auto]">
                  <Input value={inp.key} onChange={(e) => updateInput(i, { key: e.target.value })} aria-label={`Input ${i + 1} key`} />
                  <Select value={inp.type} onValueChange={(v) => updateInput(i, { type: v as InputBinding["type"] })}>
                    <SelectTrigger aria-label={`Input ${i + 1} type`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["string", "number", "boolean", "object"] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={inp.source} onValueChange={(v) => updateInput(i, { source: v as InputBinding["source"] })}>
                    <SelectTrigger aria-label={`Input ${i + 1} source`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="literal">Literal</SelectItem>
                      <SelectItem value="prior-step">Prior step output</SelectItem>
                      <SelectItem value="variable">Variable</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input value={inp.value} onChange={(e) => updateInput(i, { value: e.target.value })}
                    placeholder={inp.source === "prior-step" ? "steps.stepId.output" : inp.source === "variable" ? "${varName}" : "literal value"}
                    aria-label={`Input ${i + 1} value`} />
                  <div className="flex items-center gap-1">
                    <Checkbox id={`req-${i}`} checked={inp.required} onCheckedChange={(v) => updateInput(i, { required: Boolean(v) })} />
                    <Label htmlFor={`req-${i}`} className="text-xs">req</Label>
                    <Button size="sm" variant="ghost" onClick={() => removeInput(i)} aria-label={`Remove input ${i + 1}`}>×</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Output schema</div>
              <Button size="sm" variant="outline" onClick={addOutput}>Add output</Button>
            </div>
            <div className="space-y-2">
              {cfg.outputs.map((o, i) => (
                <div key={i} className="grid gap-2 rounded border border-border bg-card p-2 md:grid-cols-[1fr_140px_2fr_auto]">
                  <Input value={o.key} onChange={(e) => updateOutput(i, { key: e.target.value })} aria-label={`Output ${i + 1} key`} />
                  <Select value={o.type} onValueChange={(v) => updateOutput(i, { type: v as OutputSchema["type"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["string", "number", "boolean", "object"] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input value={o.description} onChange={(e) => updateOutput(i, { description: e.target.value })} placeholder="Description" />
                  <Button size="sm" variant="ghost" onClick={() => removeOutput(i)} aria-label={`Remove output ${i + 1}`}>×</Button>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="vars">
          <SectionCard>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="s-vars">Declared variables (comma)</Label>
                <Input id="s-vars" value={cfg.variables} onChange={(e) => patch("variables", e.target.value)} placeholder="host,region,tenant" />
              </div>
              <div>
                <Label htmlFor="s-secrets" className="flex items-center gap-1"><KeyRound className="h-3 w-3" /> Secret references (comma, prefix secret:)</Label>
                <Input id="s-secrets" value={cfg.secretRefs} onChange={(e) => patch("secretRefs", e.target.value)} placeholder="secret:aws.access,secret:api.token" />
                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <EyeOff className="h-3 w-3" /> Values are never shown — only reference names.
                </div>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="policy">
          <SectionCard>
            <div className="grid gap-3 md:grid-cols-3">
              <FieldNumber label="Timeout (s)" value={cfg.timeoutSeconds} onChange={(v) => patch("timeoutSeconds", v)} min={1} />
              <FieldNumber label="Retries" value={cfg.retries} onChange={(v) => patch("retries", v)} min={0} />
              <FieldNumber label="Retry backoff (ms)" value={cfg.retryBackoffMs} onChange={(v) => patch("retryBackoffMs", v)} min={0} />
              <FieldNumber label="Max concurrency" value={cfg.maxConcurrency} onChange={(v) => patch("maxConcurrency", v)} min={1} />
              <FieldNumber label="Rate limit /min" value={cfg.rateLimitPerMinute} onChange={(v) => patch("rateLimitPerMinute", v)} min={0} />
              <FieldInput label="Idempotency key" value={cfg.idempotencyKey} onChange={(v) => patch("idempotencyKey", v)} placeholder="e.g. ${incident.id}-${step}" />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="failure">
          <SectionCard>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="s-fail">On failure</Label>
                <Select value={cfg.onFailure} onValueChange={(v) => patch("onFailure", v as StepConfig["onFailure"])}>
                  <SelectTrigger id="s-fail"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abort">Abort</SelectItem>
                    <SelectItem value="continue">Continue</SelectItem>
                    <SelectItem value="rollback">Rollback</SelectItem>
                    <SelectItem value="notify">Notify only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <FieldInput label="Evidence to capture (comma)" value={cfg.evidenceCapture} onChange={(v) => patch("evidenceCapture", v)} placeholder="request,response,logs,trace" />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="permissions">
          <SectionCard>
            <div className="grid gap-3 md:grid-cols-2">
              <FieldInput label="Required role" value={cfg.requiredRole} onChange={(v) => patch("requiredRole", v)} placeholder="SRE Engineer" />
              <div className="rounded border border-border bg-card p-3 text-sm">
                <div className="flex items-center gap-2 text-xs">
                  <Lock className="h-3 w-3" /> Current role: <Badge variant="outline">{ops.role}</Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Runner {cfg.runnerId} on {cfg.targetEnv} · {targetService ? `${targetService.name} authorized` : "no service on this runbook"}
                </div>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="test">
          <SectionCard>
            <div className="space-y-2">
              <Button onClick={() => runTest(false)} disabled={running} aria-label="Run sandbox test">
                <Play className="h-4 w-4" /> {running ? "Running sandbox…" : "Run sandbox test"}
              </Button>
              {cfg.lastTest && (
                <div className={cn("rounded border p-3 text-sm",
                  cfg.lastTest.status === "passed" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-destructive/40 bg-destructive/5 text-destructive")}>
                  <div className="font-medium">Last test: {cfg.lastTest.status}</div>
                  <div className="text-xs">{new Date(cfg.lastTest.at).toLocaleString()} · {cfg.lastTest.detail}</div>
                </div>
              )}
              <div className="text-xs text-muted-foreground">Sandbox tests never touch production connectors in Demo Mode.</div>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Validation panel */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-sm">Validation</CardTitle>
          <div className="text-xs text-muted-foreground">{errorCount} errors · {warningCount} warnings</div>
        </CardHeader>
        <CardContent className="text-sm">
          {issues.length === 0 && <div className="text-muted-foreground">Click Validate to check the step configuration.</div>}
          <ul className="space-y-1">
            {issues.map((i, idx) => (
              <li key={`${i.code}-${idx}`} className={cn("flex items-start gap-2", i.severity === "error" ? "text-destructive" : "text-amber-700")}>
                <AlertTriangle className="mt-0.5 h-3 w-3" aria-hidden />
                <span>{i.message}</span>
              </li>
            ))}
          </ul>
          {cfg.savedReusable && (
            <div className="mt-3 text-xs text-muted-foreground">
              Reusable step usage: {usageRefs.length > 0 ? usageRefs.join(", ") : "not yet referenced"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Destructive test confirmation */}
      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm destructive test</DialogTitle>
            <DialogDescription>
              This step is marked destructive. Sandbox stubs will simulate the action — no production system will be touched — but you must acknowledge to proceed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestOpen(false)}>Cancel</Button>
            <Button onClick={() => { setTestOpen(false); runTest(true); }}>Run in sandbox</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small helpers                                                               */
/* -------------------------------------------------------------------------- */

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

function FieldInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
function FieldNumber({ label, value, onChange, min }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input type="number" min={min} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
function FieldSelect({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[]; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
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

function defaultTemplate(impl: ImplType, kv: Map<string, string>): string {
  const endpoint = kv.get("endpoint") ?? "${endpoint}";
  switch (impl) {
    case "REST API": return `GET ${endpoint}\nAccept: application/json`;
    case "Webhook": return `POST ${endpoint}\nContent-Type: application/json\n{ "event": "trigger" }`;
    case "SSH": return `ssh ${kv.get("host") ?? "${host}"} -- ${kv.get("command") ?? "${command}"}`;
    case "PowerShell": return `Invoke-Command -ComputerName ${kv.get("host") ?? "${host}"} -ScriptBlock { ${kv.get("script") ?? "${script}"} }`;
    case "Command Line": return `${kv.get("command") ?? "${command}"}`;
    case "Ansible": return `ansible-playbook ${kv.get("playbook") ?? "${playbook}"} -i ${kv.get("inventory") ?? "${inventory}"}`;
    case "Terraform": return `terraform apply -var-file=${kv.get("varfile") ?? "${varfile}"}`;
    case "Kubernetes": return `kubectl -n ${kv.get("namespace") ?? "${namespace}"} apply -f ${kv.get("manifest") ?? "${manifest}"}`;
    case "Database Query": return `-- runs against ${kv.get("database") ?? "${database}"}\n${kv.get("sql") ?? "${sql}"}`;
    case "ITSM Action": return `POST /now/table/${kv.get("table") ?? "incident"}  { "state": "in-progress" }`;
    case "Collaboration Message": return `chat.postMessage channel=${kv.get("channel") ?? "${channel}"} text="${kv.get("text") ?? "${text}"}"`;
    case "Digital Worker Task": return `worker.assign(${kv.get("workerId") ?? "${workerId}"}, task=${kv.get("task") ?? "${task}"})`;
    case "Subrunbook": return `invoke.runbook(${kv.get("runbookId") ?? "${runbookId}"}, params=…)`;
    case "Human Instruction": return `Operator action: ${kv.get("instruction") ?? "${instruction}"}`;
  }
}
