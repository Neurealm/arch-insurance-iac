/**
 * Page 14 · Decision, Policy, and Autonomy Designer
 * Route: /runops/runbooks/:runbookId/policy
 *
 * Defines when a runbook may act, what it may do, and when a human must remain
 * in control. All state flows through useOperations() and persists to
 * localStorage keyed by runbook id. No fixture arrays, no `any` types.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle, ArrowLeft, CheckCircle2, GitCompare, Play,
  Plus, Save, Send, ShieldAlert, ShieldCheck, Trash2, XCircle,
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

const AUTONOMY_LADDER = [
  "Documentation Only",
  "Human Guided",
  "AI Recommended",
  "Human Initiated Automation",
  "Approval Gated Automation",
  "Supervised Autonomous",
  "Policy Bounded Autonomous",
] as const;
type Autonomy = (typeof AUTONOMY_LADDER)[number];

const FACT_KEYS = [
  "service_tier", "environment", "region", "action_risk",
  "incident_severity", "business_impact", "error_budget_state",
  "recent_change", "connector_health", "digital_worker_confidence",
  "rollback_readiness", "time_window", "current_role",
] as const;
type FactKey = (typeof FACT_KEYS)[number];

type FactValue = string | number | boolean;
type Facts = Record<FactKey, FactValue>;

const OPERATORS = ["equals", "not-equals", "in", "not-in", "gte", "lte"] as const;
type Operator = (typeof OPERATORS)[number];

interface Condition { id: string; fact: FactKey; op: Operator; value: string; }
interface RuleGroup {
  id: string;
  combinator: "all" | "any";
  conditions: Condition[];
  groups: RuleGroup[];
}
interface DecisionRule {
  id: string;
  label: string;
  effect: "allow" | "allow-with-approval" | "block";
  autonomy: Autonomy;
  requiredApprovers: string;   // csv roles
  confidenceMin: number;       // 0-100
  reason: string;
  group: RuleGroup;
  priority: number;
}

interface ApprovalRule { id: string; when: string; approverRole: string; quorum: number; }
interface MaintenanceWindow { id: string; label: string; days: string; from: string; to: string; block: boolean; }
interface EnvRestriction { environment: string; region: string; maxAutonomy: Autonomy; }
interface SloControl { errorBudgetBelowPct: number; freezeAutonomyAt: Autonomy; }
interface Sod { requesterRolesBlocked: string; approverMustDifferFromRequester: boolean; }

interface Policy {
  runbookId: string;
  version: string;                // e.g. v3-draft
  baseAutonomy: Autonomy;
  rules: DecisionRule[];
  approvals: ApprovalRule[];
  windows: MaintenanceWindow[];
  envRestrictions: EnvRestriction[];
  slo: SloControl;
  sod: Sod;
  confidenceFloor: number;
  escalationPath: string;         // csv roles
  attachedPolicyId: string;       // library reference
  updatedAt: string;
  state: "Draft" | "In Review" | "Published";
}

/* -------------------------------------------------------------------------- */
/* Persistence                                                                 */
/* -------------------------------------------------------------------------- */

const LS_POLICY = (rb: string) => `runops.policy.${rb}.v1`;
const LS_PUBLISHED = (rb: string) => `runops.policy.${rb}.published.v1`;

function newRule(priority: number): DecisionRule {
  return {
    id: `rule-${Math.random().toString(36).slice(2, 8)}`,
    label: "New decision rule",
    effect: "allow-with-approval",
    autonomy: "Approval Gated Automation",
    requiredApprovers: "Change Manager",
    confidenceMin: 80,
    reason: "",
    priority,
    group: {
      id: "g-root", combinator: "all",
      conditions: [{ id: "c1", fact: "environment", op: "equals", value: "Production" }],
      groups: [],
    },
  };
}

function seedPolicy(runbookId: string, baseAutonomy: Autonomy): Policy {
  return {
    runbookId,
    version: "v1-draft",
    baseAutonomy,
    rules: [newRule(10)],
    approvals: [
      { id: "a1", when: "environment=Production AND action_risk>=high", approverRole: "Change Manager", quorum: 1 },
    ],
    windows: [
      { id: "w1", label: "Weekend freeze", days: "Sat,Sun", from: "00:00", to: "23:59", block: true },
    ],
    envRestrictions: [
      { environment: "Production", region: "*", maxAutonomy: "Approval Gated Automation" },
      { environment: "Staging", region: "*", maxAutonomy: "Supervised Autonomous" },
    ],
    slo: { errorBudgetBelowPct: 10, freezeAutonomyAt: "Human Guided" },
    sod: { requesterRolesBlocked: "Auditor,Read Only User", approverMustDifferFromRequester: true },
    confidenceFloor: 70,
    escalationPath: "Service Owner,Incident Commander,Platform Engineer",
    attachedPolicyId: "",
    updatedAt: new Date().toISOString(),
    state: "Draft",
  };
}

function loadPolicy(runbookId: string, baseAutonomy: Autonomy): Policy {
  try {
    const raw = localStorage.getItem(LS_POLICY(runbookId));
    if (raw) return JSON.parse(raw) as Policy;
  } catch { /* ignore */ }
  return seedPolicy(runbookId, baseAutonomy);
}
function loadPublished(runbookId: string): Policy | null {
  try {
    const raw = localStorage.getItem(LS_PUBLISHED(runbookId));
    if (raw) return JSON.parse(raw) as Policy;
  } catch { /* ignore */ }
  return null;
}
function persistPolicy(p: Policy) { localStorage.setItem(LS_POLICY(p.runbookId), JSON.stringify(p)); }

/* -------------------------------------------------------------------------- */
/* Simulation                                                                  */
/* -------------------------------------------------------------------------- */

interface SimResult {
  decision: "Allowed" | "Allowed with approval" | "Blocked" | "Insufficient context";
  reason: string;
  requiredApprover: string;
  blockedCondition: string;
  policyVersion: string;
  facts: Facts;
  alternative: string;
  matchedRuleId: string;
  autonomy: Autonomy;
  conflicts: string[];
  confidence: number;
  uncertainty: string;
  evidence: string[];
  sources: string[];
}

function factValue(f: Facts, k: FactKey): FactValue { return f[k]; }

function evalCondition(c: Condition, f: Facts): boolean {
  const raw = factValue(f, c.fact);
  const rhs = c.value.trim();
  switch (c.op) {
    case "equals":     return String(raw).toLowerCase() === rhs.toLowerCase();
    case "not-equals": return String(raw).toLowerCase() !== rhs.toLowerCase();
    case "in":         return rhs.split(",").map((s) => s.trim().toLowerCase()).includes(String(raw).toLowerCase());
    case "not-in":     return !rhs.split(",").map((s) => s.trim().toLowerCase()).includes(String(raw).toLowerCase());
    case "gte":        return Number(raw) >= Number(rhs);
    case "lte":        return Number(raw) <= Number(rhs);
  }
}
function evalGroup(g: RuleGroup, f: Facts): boolean {
  const results = [
    ...g.conditions.map((c) => evalCondition(c, f)),
    ...g.groups.map((sub) => evalGroup(sub, f)),
  ];
  if (results.length === 0) return true;
  return g.combinator === "all" ? results.every(Boolean) : results.some(Boolean);
}

function inMaintenanceBlock(windows: MaintenanceWindow[], f: Facts): MaintenanceWindow | null {
  const now = String(f.time_window);
  for (const w of windows) if (w.block && (w.label === now || w.days.includes(now))) return w;
  return null;
}

function simulate(p: Policy, facts: Facts): SimResult {
  const missing: FactKey[] = [];
  for (const k of FACT_KEYS) {
    const v = facts[k];
    if (v === "" || v === undefined || v === null) missing.push(k);
  }
  const evidence: string[] = [];
  const sources = [`policy:${p.runbookId}@${p.version}`, "connector:health", "slo:error-budget", "hr:roles"];

  // Window block
  const win = inMaintenanceBlock(p.windows, facts);
  if (win) {
    evidence.push(`Maintenance window "${win.label}" blocks execution`);
    return {
      decision: "Blocked", reason: `Inside maintenance window "${win.label}"`,
      requiredApprover: "", blockedCondition: `time_window ∈ ${win.days}`,
      policyVersion: p.version, facts, alternative: "Wait for window to close or request exception",
      matchedRuleId: "", autonomy: "Documentation Only", conflicts: [],
      confidence: 95, uncertainty: "Deterministic — window-driven", evidence, sources,
    };
  }

  // SLO freeze
  const eb = Number(facts.error_budget_state);
  if (!Number.isNaN(eb) && eb < p.slo.errorBudgetBelowPct) {
    evidence.push(`Error budget ${eb}% below floor ${p.slo.errorBudgetBelowPct}%`);
    return {
      decision: "Allowed with approval",
      reason: `Error budget below ${p.slo.errorBudgetBelowPct}% — autonomy frozen at ${p.slo.freezeAutonomyAt}`,
      requiredApprover: "Service Owner", blockedCondition: "",
      policyVersion: p.version, facts,
      alternative: "Escalate to human-initiated flow", matchedRuleId: "slo",
      autonomy: p.slo.freezeAutonomyAt, conflicts: [],
      confidence: 88, uncertainty: "Freshness of budget signal (last 15m)",
      evidence, sources,
    };
  }

  // Match rules by priority (lower first)
  const sorted = [...p.rules].sort((a, b) => a.priority - b.priority);
  const matches = sorted.filter((r) => evalGroup(r.group, facts));
  const effects = new Set(matches.map((m) => m.effect));
  const conflicts = effects.size > 1 ? matches.map((m) => `${m.id}:${m.effect}`) : [];

  if (matches.length === 0) {
    if (missing.length > 0) {
      return {
        decision: "Insufficient context",
        reason: `Missing facts: ${missing.join(", ")}`,
        requiredApprover: "", blockedCondition: "",
        policyVersion: p.version, facts,
        alternative: "Provide missing facts and re-simulate",
        matchedRuleId: "", autonomy: p.baseAutonomy, conflicts: [],
        confidence: 40, uncertainty: "Facts incomplete", evidence, sources,
      };
    }
    evidence.push(`No rule matched — falling back to base autonomy "${p.baseAutonomy}"`);
    return {
      decision: p.baseAutonomy === "Documentation Only" ? "Blocked" : "Allowed with approval",
      reason: `No matching rule — base autonomy "${p.baseAutonomy}"`,
      requiredApprover: "Change Manager", blockedCondition: "",
      policyVersion: p.version, facts,
      alternative: "Add explicit rule for this context",
      matchedRuleId: "", autonomy: p.baseAutonomy, conflicts,
      confidence: 55, uncertainty: "Fallback path — low specificity", evidence, sources,
    };
  }

  const winner = matches[0];
  evidence.push(`Rule "${winner.label}" matched at priority ${winner.priority}`);
  const dwConf = Number(facts.digital_worker_confidence);
  const confOK = Number.isNaN(dwConf) ? true : dwConf >= winner.confidenceMin;
  const decision: SimResult["decision"] =
    winner.effect === "block" ? "Blocked"
      : winner.effect === "allow" ? (confOK ? "Allowed" : "Allowed with approval")
      : "Allowed with approval";
  const blockedCondition = winner.effect === "block"
    ? winner.group.conditions.map((c) => `${c.fact} ${c.op} ${c.value}`).join(" AND ")
    : "";

  return {
    decision, reason: winner.reason || `Matched "${winner.label}"`,
    requiredApprover: decision === "Allowed with approval" ? winner.requiredApprovers : "",
    blockedCondition,
    policyVersion: p.version, facts,
    alternative: decision === "Blocked"
      ? "Downgrade to Human Guided execution"
      : decision === "Allowed with approval"
        ? "Auto-approve after human verification"
        : "Run in Approval Gated mode for extra assurance",
    matchedRuleId: winner.id, autonomy: winner.autonomy, conflicts,
    confidence: confOK ? 90 : 65,
    uncertainty: confOK ? "Rule-driven — high determinism" : `Digital-worker confidence ${dwConf}% below rule floor ${winner.confidenceMin}%`,
    evidence, sources,
  };
}

/* -------------------------------------------------------------------------- */
/* Plain-language interpretation                                               */
/* -------------------------------------------------------------------------- */

function conditionsToProse(g: RuleGroup): string {
  const parts = [
    ...g.conditions.map((c) => `${c.fact.replace(/_/g, " ")} ${c.op.replace(/-/g, " ")} ${c.value}`),
    ...g.groups.map((sub) => `(${conditionsToProse(sub)})`),
  ];
  return parts.join(g.combinator === "all" ? " and " : " or ");
}
function ruleToProse(r: DecisionRule): string {
  const verb = r.effect === "allow" ? "may run automatically"
    : r.effect === "block" ? "must not run"
    : "may run only with approval";
  return `When ${conditionsToProse(r.group)}, the runbook ${verb} at autonomy "${r.autonomy}"` +
    (r.effect === "allow-with-approval" ? ` requiring ${r.requiredApprovers}.` : ".");
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function RunbookPolicyDesigner() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams();
  const runbookId = params.runbookId ?? "RB-0042";

  const runbook = useMemo(
    () => ops.runbooks.find((r) => r.id === runbookId) ?? null,
    [ops.runbooks, runbookId]
  );
  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";
  const baseAutonomy: Autonomy = (runbook?.autonomy as Autonomy | undefined) ?? "Human Guided";

  const [policy, setPolicy] = useState<Policy>(() => loadPolicy(runbookId, baseAutonomy));
  const [published, setPublished] = useState<Policy | null>(() => loadPublished(runbookId));
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setPolicy(loadPolicy(runbookId, baseAutonomy)); setPublished(loadPublished(runbookId)); setDirty(false); }, [runbookId, baseAutonomy]);

  const patch = useCallback((updater: (p: Policy) => Policy) => {
    setPolicy((prev) => {
      const next = updater(prev);
      next.updatedAt = new Date().toISOString();
      return next;
    });
    setDirty(true);
  }, []);

  /* --- Rule ops ------------------------------------------------------------ */
  const addRule = () => patch((p) => ({ ...p, rules: [...p.rules, newRule((p.rules.length + 1) * 10)] }));
  const removeRule = (id: string) => patch((p) => ({ ...p, rules: p.rules.filter((r) => r.id !== id) }));
  const updateRule = (id: string, u: Partial<DecisionRule>) => patch((p) => ({
    ...p, rules: p.rules.map((r) => (r.id === id ? { ...r, ...u } : r)),
  }));
  const addCondition = (ruleId: string) => patch((p) => ({
    ...p, rules: p.rules.map((r) => r.id === ruleId ? {
      ...r, group: { ...r.group, conditions: [...r.group.conditions, { id: `c-${Math.random().toString(36).slice(2, 6)}`, fact: "action_risk", op: "equals", value: "high" }] },
    } : r),
  }));
  const removeCondition = (ruleId: string, condId: string) => patch((p) => ({
    ...p, rules: p.rules.map((r) => r.id === ruleId ? {
      ...r, group: { ...r.group, conditions: r.group.conditions.filter((c) => c.id !== condId) },
    } : r),
  }));
  const updateCondition = (ruleId: string, condId: string, u: Partial<Condition>) => patch((p) => ({
    ...p, rules: p.rules.map((r) => r.id === ruleId ? {
      ...r, group: { ...r.group, conditions: r.group.conditions.map((c) => c.id === condId ? { ...c, ...u } : c) },
    } : r),
  }));
  const addNestedGroup = (ruleId: string) => patch((p) => ({
    ...p, rules: p.rules.map((r) => r.id === ruleId ? {
      ...r, group: { ...r.group, groups: [...r.group.groups, { id: `g-${Math.random().toString(36).slice(2, 6)}`, combinator: "any", conditions: [{ id: `c-${Math.random().toString(36).slice(2, 6)}`, fact: "region", op: "in", value: "us-east-1,us-west-2" }], groups: [] }] },
    } : r),
  }));

  /* --- Risk score --------------------------------------------------------- */
  const riskScore = useMemo(() => {
    let score = 0;
    if (runbook?.autonomy === "Policy Bounded Autonomous") score += 40;
    else if (runbook?.autonomy === "Supervised Autonomous") score += 30;
    else if (runbook?.autonomy === "Approval Gated Automation") score += 20;
    score += Math.min(policy.rules.filter((r) => r.effect === "allow").length * 10, 30);
    if (policy.confidenceFloor < 60) score += 15;
    if (policy.slo.errorBudgetBelowPct < 5) score += 10;
    return Math.min(score, 100);
  }, [runbook, policy]);
  const riskTone: "success" | "warning" | "critical" = riskScore < 30 ? "success" : riskScore < 65 ? "warning" : "critical";

  /* --- Validation --------------------------------------------------------- */
  const validation = useMemo(() => {
    const issues: { severity: "error" | "warning"; message: string }[] = [];
    if (policy.rules.length === 0) issues.push({ severity: "error", message: "At least one decision rule is required." });
    for (const r of policy.rules) {
      if (!r.label.trim()) issues.push({ severity: "warning", message: `Rule ${r.id} has no label.` });
      if (r.effect === "allow-with-approval" && !r.requiredApprovers.trim())
        issues.push({ severity: "error", message: `Rule "${r.label}" needs an approver role.` });
      if (r.group.conditions.length + r.group.groups.length === 0)
        issues.push({ severity: "error", message: `Rule "${r.label}" has no conditions.` });
    }
    // Env restriction ceiling
    const prodCap = policy.envRestrictions.find((e) => e.environment === "Production");
    if (prodCap) {
      const capIdx = AUTONOMY_LADDER.indexOf(prodCap.maxAutonomy);
      for (const r of policy.rules) {
        if (AUTONOMY_LADDER.indexOf(r.autonomy) > capIdx)
          issues.push({ severity: "error", message: `Rule "${r.label}" exceeds Production cap "${prodCap.maxAutonomy}".` });
      }
    }
    if (policy.confidenceFloor < 0 || policy.confidenceFloor > 100)
      issues.push({ severity: "error", message: "Confidence floor must be between 0 and 100." });
    return issues;
  }, [policy]);
  const errorCount = validation.filter((v) => v.severity === "error").length;
  const warningCount = validation.filter((v) => v.severity === "warning").length;

  /* --- Simulation --------------------------------------------------------- */
  const [facts, setFacts] = useState<Facts>({
    service_tier: runbook ? (ops.services.find((s) => s.id === runbook.serviceId)?.tier ?? "Tier 2") : "Tier 1",
    environment: "Production",
    region: "us-east-1",
    action_risk: "high",
    incident_severity: "Sev-2",
    business_impact: "Medium",
    error_budget_state: 22,
    recent_change: "no",
    connector_health: "Healthy",
    digital_worker_confidence: 82,
    rollback_readiness: "ready",
    time_window: "Weekday",
    current_role: ops.role,
  });
  const sim = useMemo(() => simulate(policy, facts), [policy, facts]);
  const simPublished = useMemo(() => (published ? simulate(published, facts) : null), [published, facts]);

  /* --- Actions ------------------------------------------------------------ */
  const handleSaveDraft = () => {
    persistPolicy(policy);
    setDirty(false);
    ops.pushNotification({
      kind: "info", title: "Policy draft saved",
      detail: `${runbookId} · ${policy.rules.length} rules`, entityRef: runbookId,
    });
  };
  const handleSubmit = () => {
    if (errorCount > 0) {
      ops.pushNotification({ kind: "warning", title: "Cannot submit — validation errors", detail: `${errorCount} errors`, entityRef: runbookId });
      return;
    }
    const next: Policy = { ...policy, state: "In Review" };
    persistPolicy(next);
    setPolicy(next);
    setDirty(false);
    ops.pushNotification({ kind: "info", title: "Policy submitted for governance review", detail: `${runbookId} · ${policy.version}`, entityRef: runbookId });
  };
  const handlePublish = () => {
    if (errorCount > 0 || readOnly) return;
    const nextVersion = policy.version.startsWith("v") && policy.version.includes("-draft")
      ? `v${(parseInt(policy.version.slice(1)) || 1) + 1}`
      : `${policy.version}.published`;
    const next: Policy = { ...policy, state: "Published", version: nextVersion };
    persistPolicy(next);
    localStorage.setItem(LS_PUBLISHED(runbookId), JSON.stringify(next));
    setPolicy(next);
    setPublished(next);
    setDirty(false);
    ops.pushNotification({
      kind: "info", title: "Policy published",
      detail: `${runbookId} · ${nextVersion} — affects Launch Center and Approval Center`,
      entityRef: runbookId,
    });
  };

  /* --- Diff --------------------------------------------------------------- */
  const diff = useMemo(() => {
    if (!published) return null;
    return {
      baseAutonomy: published.baseAutonomy !== policy.baseAutonomy ? [published.baseAutonomy, policy.baseAutonomy] as const : null,
      confidenceFloor: published.confidenceFloor !== policy.confidenceFloor ? [published.confidenceFloor, policy.confidenceFloor] as const : null,
      ruleCount: published.rules.length !== policy.rules.length ? [published.rules.length, policy.rules.length] as const : null,
      windowCount: published.windows.length !== policy.windows.length ? [published.windows.length, policy.windows.length] as const : null,
    };
  }, [policy, published]);

  if (readOnly) {
    return (
      <div className="p-6">
        <PermissionDeniedState title="Read-only role" description="Your current role cannot edit runbook policy." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 md:p-6" aria-label="Decision, policy, and autonomy designer">
      <EntityHeader
        eyebrow="Runbook policy"
        title={`Policy · ${runbook?.title ?? runbookId}`}
        subtitle={`${runbookId} · ${policy.version} · ${policy.state}`}
        meta={
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Tenant: <span className="text-foreground">{ops.tenant.name}</span></span>
            <span>Env context: <span className="text-foreground">{String(facts.environment)}</span></span>
            <span>Role: <span className="text-foreground">{ops.role}</span></span>
            <span aria-live="polite">{dirty ? "Unsaved changes" : "Saved"}</span>
            <span className="flex items-center gap-1">
              {errorCount === 0
                ? <><ShieldCheck className="h-3 w-3 text-emerald-600" aria-hidden />No errors</>
                : <><ShieldAlert className="h-3 w-3 text-destructive" aria-hidden />{errorCount} errors</>}
            </span>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/runops/runbooks/${runbookId}`)} aria-label="Back to runbook detail">
              <ArrowLeft className="h-4 w-4" /> Runbook
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveDraft} aria-label="Save draft"><Save className="h-4 w-4" /> Save draft</Button>
            <Button variant="outline" size="sm" onClick={handleSubmit} aria-label="Submit for governance review" disabled={errorCount > 0}>
              <Send className="h-4 w-4" /> Submit for review
            </Button>
            <Button size="sm" onClick={handlePublish} aria-label="Publish policy" disabled={errorCount > 0}>
              Publish
            </Button>
          </div>
        }
      />

      {/* Status band */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatusChip label="Validation" tone={errorCount === 0 ? "success" : "critical"} text={errorCount === 0 ? `${warningCount} warnings` : `${errorCount} errors`} />
        <StatusChip label="Risk score" tone={riskTone} text={`${riskScore}/100`} />
        <StatusChip label="Base autonomy" tone="neutral" text={policy.baseAutonomy} />
        <StatusChip label="Published" tone={published ? "success" : "warning"} text={published ? `${published.version} live` : "none"} />
      </div>

      <Tabs defaultValue="rules">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="rules">Decision rules</TabsTrigger>
          <TabsTrigger value="autonomy">Autonomy ladder</TabsTrigger>
          <TabsTrigger value="approvals">Approvals · SoD</TabsTrigger>
          <TabsTrigger value="env">Environment · Windows</TabsTrigger>
          <TabsTrigger value="slo">SLO · Confidence</TabsTrigger>
          <TabsTrigger value="escalation">Escalation</TabsTrigger>
          <TabsTrigger value="simulate">Simulation</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="rules">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {policy.rules.length} decision rule(s). Rules evaluate in priority order (lower first).
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => patch((p) => ({ ...p, attachedPolicyId: p.attachedPolicyId ? "" : "POL-baseline-tier1" }))}>
                    {policy.attachedPolicyId ? "Detach policy" : "Attach existing policy"}
                  </Button>
                  <Button size="sm" onClick={addRule}><Plus className="h-4 w-4" /> Add rule</Button>
                </div>
              </div>
              {policy.attachedPolicyId && (
                <div className="rounded border border-border bg-muted/40 px-3 py-2 text-xs">
                  Inheriting from <span className="font-medium">{policy.attachedPolicyId}</span> — local rules override.
                </div>
              )}
              <div className="space-y-3">
                {policy.rules.map((r) => (
                  <RuleEditor
                    key={r.id}
                    rule={r}
                    envOptions={ops.environmentOptions as readonly string[]}
                    onChange={(u) => updateRule(r.id, u)}
                    onRemove={() => removeRule(r.id)}
                    onAddCondition={() => addCondition(r.id)}
                    onRemoveCondition={(cid) => removeCondition(r.id, cid)}
                    onUpdateCondition={(cid, u) => updateCondition(r.id, cid, u)}
                    onAddGroup={() => addNestedGroup(r.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="autonomy">
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 text-sm text-muted-foreground">
                Autonomy ladder — the highest level the runbook may reach, given all rules and restrictions.
              </div>
              <ol className="space-y-2">
                {AUTONOMY_LADDER.map((level, idx) => {
                  const isBase = policy.baseAutonomy === level;
                  const active = AUTONOMY_LADDER.indexOf(policy.baseAutonomy) >= idx;
                  return (
                    <li key={level}>
                      <button
                        type="button"
                        onClick={() => patch((p) => ({ ...p, baseAutonomy: level }))}
                        className={cn(
                          "flex w-full items-center justify-between rounded border p-2 text-left text-sm",
                          isBase ? "border-primary bg-primary/5"
                            : active ? "border-emerald-200 bg-emerald-50/40"
                            : "border-border bg-card"
                        )}
                        aria-pressed={isBase}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-5 text-xs text-muted-foreground">{idx + 1}</span>
                          <span className="font-medium">{level}</span>
                        </span>
                        {isBase && <Badge variant="secondary">Base for this runbook</Badge>}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="approvals">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="text-sm font-medium">Approval rules</div>
              {policy.approvals.map((a, idx) => (
                <div key={a.id} className="grid gap-2 md:grid-cols-4">
                  <Input value={a.when} onChange={(e) => patch((p) => ({ ...p, approvals: p.approvals.map((x, i) => i === idx ? { ...x, when: e.target.value } : x) }))} placeholder="When (expression)" aria-label="Approval when" />
                  <Input value={a.approverRole} onChange={(e) => patch((p) => ({ ...p, approvals: p.approvals.map((x, i) => i === idx ? { ...x, approverRole: e.target.value } : x) }))} placeholder="Approver role" aria-label="Approver role" />
                  <Input type="number" min={1} value={a.quorum} onChange={(e) => patch((p) => ({ ...p, approvals: p.approvals.map((x, i) => i === idx ? { ...x, quorum: Number(e.target.value) } : x) }))} placeholder="Quorum" aria-label="Quorum" />
                  <Button variant="ghost" size="sm" onClick={() => patch((p) => ({ ...p, approvals: p.approvals.filter((x) => x.id !== a.id) }))} aria-label="Remove approval rule">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => patch((p) => ({ ...p, approvals: [...p.approvals, { id: `a-${Math.random().toString(36).slice(2, 6)}`, when: "", approverRole: "Change Manager", quorum: 1 }] }))}>
                <Plus className="h-4 w-4" /> Add approval rule
              </Button>

              <div className="mt-4 space-y-2 border-t pt-3">
                <div className="text-sm font-medium">Separation of duties</div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Roles blocked from requesting</Label>
                    <Input value={policy.sod.requesterRolesBlocked}
                      onChange={(e) => patch((p) => ({ ...p, sod: { ...p.sod, requesterRolesBlocked: e.target.value } }))} />
                  </div>
                  <div className="flex items-center gap-2 self-end">
                    <Checkbox id="sod-diff" checked={policy.sod.approverMustDifferFromRequester}
                      onCheckedChange={(v) => patch((p) => ({ ...p, sod: { ...p.sod, approverMustDifferFromRequester: v === true } }))} />
                    <Label htmlFor="sod-diff" className="cursor-pointer">Approver must differ from requester</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="env">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="text-sm font-medium">Environment restrictions</div>
              {policy.envRestrictions.map((e, idx) => (
                <div key={idx} className="grid gap-2 md:grid-cols-3">
                  <Select value={e.environment} onValueChange={(v) => patch((p) => ({ ...p, envRestrictions: p.envRestrictions.map((x, i) => i === idx ? { ...x, environment: v } : x) }))}>
                    <SelectTrigger aria-label="Environment"><SelectValue /></SelectTrigger>
                    <SelectContent>{ops.environmentOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input value={e.region} onChange={(ev) => patch((p) => ({ ...p, envRestrictions: p.envRestrictions.map((x, i) => i === idx ? { ...x, region: ev.target.value } : x) }))} placeholder="Region (or *)" aria-label="Region" />
                  <Select value={e.maxAutonomy} onValueChange={(v) => patch((p) => ({ ...p, envRestrictions: p.envRestrictions.map((x, i) => i === idx ? { ...x, maxAutonomy: v as Autonomy } : x) }))}>
                    <SelectTrigger aria-label="Max autonomy"><SelectValue /></SelectTrigger>
                    <SelectContent>{AUTONOMY_LADDER.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => patch((p) => ({ ...p, envRestrictions: [...p.envRestrictions, { environment: "Development", region: "*", maxAutonomy: "Policy Bounded Autonomous" }] }))}>
                <Plus className="h-4 w-4" /> Add restriction
              </Button>

              <div className="mt-4 space-y-2 border-t pt-3">
                <div className="text-sm font-medium">Maintenance windows</div>
                {policy.windows.map((w, idx) => (
                  <div key={w.id} className="grid gap-2 md:grid-cols-5">
                    <Input value={w.label} onChange={(e) => patch((p) => ({ ...p, windows: p.windows.map((x, i) => i === idx ? { ...x, label: e.target.value } : x) }))} placeholder="Label" aria-label="Window label" />
                    <Input value={w.days} onChange={(e) => patch((p) => ({ ...p, windows: p.windows.map((x, i) => i === idx ? { ...x, days: e.target.value } : x) }))} placeholder="Days (Sat,Sun)" aria-label="Days" />
                    <Input value={w.from} onChange={(e) => patch((p) => ({ ...p, windows: p.windows.map((x, i) => i === idx ? { ...x, from: e.target.value } : x) }))} placeholder="From" aria-label="From" />
                    <Input value={w.to} onChange={(e) => patch((p) => ({ ...p, windows: p.windows.map((x, i) => i === idx ? { ...x, to: e.target.value } : x) }))} placeholder="To" aria-label="To" />
                    <div className="flex items-center gap-2">
                      <Checkbox checked={w.block} onCheckedChange={(v) => patch((p) => ({ ...p, windows: p.windows.map((x, i) => i === idx ? { ...x, block: v === true } : x) }))} id={`w-${w.id}`} />
                      <Label htmlFor={`w-${w.id}`} className="cursor-pointer">Block</Label>
                      <Button variant="ghost" size="sm" onClick={() => patch((p) => ({ ...p, windows: p.windows.filter((x) => x.id !== w.id) }))} aria-label="Remove window"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => patch((p) => ({ ...p, windows: [...p.windows, { id: `w-${Math.random().toString(36).slice(2, 6)}`, label: "New window", days: "Fri", from: "17:00", to: "23:59", block: true }] }))}>
                  <Plus className="h-4 w-4" /> Add window
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="slo">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="text-sm font-medium">SLO and error-budget controls</div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Freeze autonomy when error budget below (%)</Label>
                  <Input type="number" min={0} max={100} value={policy.slo.errorBudgetBelowPct}
                    onChange={(e) => patch((p) => ({ ...p, slo: { ...p.slo, errorBudgetBelowPct: Number(e.target.value) } }))} />
                </div>
                <div className="space-y-1">
                  <Label>Freeze at level</Label>
                  <Select value={policy.slo.freezeAutonomyAt} onValueChange={(v) => patch((p) => ({ ...p, slo: { ...p.slo, freezeAutonomyAt: v as Autonomy } }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{AUTONOMY_LADDER.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 border-t pt-3">
                <div className="space-y-1">
                  <Label>Global confidence floor (%)</Label>
                  <Input type="number" min={0} max={100} value={policy.confidenceFloor}
                    onChange={(e) => patch((p) => ({ ...p, confidenceFloor: Number(e.target.value) }))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="escalation">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="text-sm font-medium">Escalation path</div>
              <div className="space-y-1">
                <Label>Roles in escalation order (comma-separated)</Label>
                <Input value={policy.escalationPath} onChange={(e) => patch((p) => ({ ...p, escalationPath: e.target.value }))} />
              </div>
              <div className="flex flex-wrap gap-2">
                {policy.escalationPath.split(",").map((r) => r.trim()).filter(Boolean).map((r, i) => (
                  <Badge key={`${r}-${i}`} variant="outline">{i + 1}. {r}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="simulate">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card>
              <CardContent className="space-y-2 p-4">
                <div className="text-sm font-medium">Input facts</div>
                {FACT_KEYS.map((k) => (
                  <div key={k} className="grid grid-cols-3 items-center gap-2">
                    <Label className="col-span-1 text-xs">{k.replace(/_/g, " ")}</Label>
                    <Input
                      className="col-span-2"
                      value={String(facts[k])}
                      onChange={(e) => setFacts((f) => ({ ...f, [k]: e.target.value }))}
                      aria-label={k}
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => setFacts((f) => ({ ...f, environment: "Staging", incident_severity: "Sev-3" }))}>
                    Preset: Staging Sev-3
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setFacts((f) => ({ ...f, environment: "Production", incident_severity: "Sev-1", action_risk: "critical" }))}>
                    Preset: Prod Sev-1 critical
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4" aria-hidden />
                  <div className="text-sm font-medium">Simulation result</div>
                  <Badge variant="outline" className="ml-auto">{policy.version}</Badge>
                </div>
                <DecisionBadge decision={sim.decision} />
                <KV k="Reason" v={sim.reason} />
                <KV k="Autonomy applied" v={sim.autonomy} />
                {sim.requiredApprover && <KV k="Required approver" v={sim.requiredApprover} />}
                {sim.blockedCondition && <KV k="Blocked condition" v={sim.blockedCondition} />}
                <KV k="Alternative allowed action" v={sim.alternative} />
                {sim.conflicts.length > 0 && (
                  <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                    <AlertTriangle className="mr-1 inline h-3 w-3" aria-hidden />
                    Conflicting policies: {sim.conflicts.join(" · ")}
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="text-xs font-medium">AI recommendation</div>
                  <div className="text-xs text-muted-foreground">
                    Confidence <span className="font-medium text-foreground">{sim.confidence}%</span> · Uncertainty: {sim.uncertainty}
                  </div>
                  <div className="mt-1 text-xs">Evidence:</div>
                  <ul className="list-inside list-disc text-xs text-muted-foreground">
                    {sim.evidence.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                  <div className="mt-1 text-xs">Sources: <span className="text-muted-foreground">{sim.sources.join(", ")}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-3">
            <CardContent className="space-y-2 p-4">
              <div className="text-sm font-medium">Plain-language interpretation</div>
              {policy.rules.length === 0
                ? <div className="text-sm text-muted-foreground">No rules defined.</div>
                : (
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {[...policy.rules].sort((a, b) => a.priority - b.priority).map((r) => (
                      <li key={r.id}>{ruleToProse(r)}</li>
                    ))}
                  </ul>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="compare">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <GitCompare className="h-4 w-4" aria-hidden />
                <div className="text-sm font-medium">Current draft vs published</div>
              </div>
              {!published
                ? <div className="text-sm text-muted-foreground">No published policy yet.</div>
                : (
                  <div className="grid gap-2 md:grid-cols-2">
                    <SideCard title={`Published · ${published.version}`}>
                      <DiffLine k="Base autonomy" v={published.baseAutonomy} />
                      <DiffLine k="Confidence floor" v={`${published.confidenceFloor}%`} />
                      <DiffLine k="Rules" v={String(published.rules.length)} />
                      <DiffLine k="Windows" v={String(published.windows.length)} />
                      {simPublished && (
                        <div className="mt-2 border-t pt-2 text-xs">
                          Same facts → <span className="font-medium">{simPublished.decision}</span>
                        </div>
                      )}
                    </SideCard>
                    <SideCard title={`Draft · ${policy.version}`} highlighted>
                      <DiffLine k="Base autonomy" v={policy.baseAutonomy} changed={!!diff?.baseAutonomy} />
                      <DiffLine k="Confidence floor" v={`${policy.confidenceFloor}%`} changed={!!diff?.confidenceFloor} />
                      <DiffLine k="Rules" v={String(policy.rules.length)} changed={!!diff?.ruleCount} />
                      <DiffLine k="Windows" v={String(policy.windows.length)} changed={!!diff?.windowCount} />
                      <div className="mt-2 border-t pt-2 text-xs">
                        Same facts → <span className="font-medium">{sim.decision}</span>
                      </div>
                    </SideCard>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {validation.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="text-sm font-medium">Validation</div>
            <ul className="mt-1 space-y-1 text-xs">
              {validation.map((v, i) => (
                <li key={i} className={cn("flex items-start gap-2", v.severity === "error" ? "text-destructive" : "text-amber-700")}>
                  {v.severity === "error" ? <XCircle className="mt-0.5 h-3 w-3" aria-hidden /> : <AlertTriangle className="mt-0.5 h-3 w-3" aria-hidden />}
                  <span>{v.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

function RuleEditor({
  rule, envOptions, onChange, onRemove, onAddCondition, onRemoveCondition,
  onUpdateCondition, onAddGroup,
}: {
  rule: DecisionRule;
  envOptions: readonly string[];
  onChange: (u: Partial<DecisionRule>) => void;
  onRemove: () => void;
  onAddCondition: () => void;
  onRemoveCondition: (id: string) => void;
  onUpdateCondition: (id: string, u: Partial<Condition>) => void;
  onAddGroup: () => void;
}) {
  return (
    <div className="rounded border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input className="w-64" value={rule.label} onChange={(e) => onChange({ label: e.target.value })} aria-label="Rule label" />
        <Select value={rule.effect} onValueChange={(v) => onChange({ effect: v as DecisionRule["effect"] })}>
          <SelectTrigger className="w-48" aria-label="Effect"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="allow">Allow</SelectItem>
            <SelectItem value="allow-with-approval">Allow with approval</SelectItem>
            <SelectItem value="block">Block</SelectItem>
          </SelectContent>
        </Select>
        <Select value={rule.autonomy} onValueChange={(v) => onChange({ autonomy: v as Autonomy })}>
          <SelectTrigger className="w-56" aria-label="Autonomy"><SelectValue /></SelectTrigger>
          <SelectContent>{AUTONOMY_LADDER.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
        <Input className="w-24" type="number" value={rule.priority} onChange={(e) => onChange({ priority: Number(e.target.value) })} aria-label="Priority" />
        <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove rule"><Trash2 className="h-4 w-4" /></Button>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div>
          <Label className="text-xs">Required approvers (csv roles)</Label>
          <Input value={rule.requiredApprovers} onChange={(e) => onChange({ requiredApprovers: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Rule confidence floor (%)</Label>
          <Input type="number" min={0} max={100} value={rule.confidenceMin} onChange={(e) => onChange({ confidenceMin: Number(e.target.value) })} />
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs">Reason (shown to operators)</Label>
          <Textarea rows={2} value={rule.reason} onChange={(e) => onChange({ reason: e.target.value })} />
        </div>
      </div>

      <div className="mt-3 rounded border border-dashed border-border p-2">
        <div className="mb-2 flex items-center gap-2 text-xs">
          <span>Match</span>
          <Select value={rule.group.combinator} onValueChange={(v) => onChange({ group: { ...rule.group, combinator: v as "all" | "any" } })}>
            <SelectTrigger className="h-7 w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all</SelectItem>
              <SelectItem value="any">any</SelectItem>
            </SelectContent>
          </Select>
          <span>of the following conditions:</span>
        </div>
        <div className="space-y-2">
          {rule.group.conditions.map((c) => (
            <div key={c.id} className="grid gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.5fr)_auto]">
              <Select value={c.fact} onValueChange={(v) => onUpdateCondition(c.id, { fact: v as FactKey })}>
                <SelectTrigger aria-label="Fact"><SelectValue /></SelectTrigger>
                <SelectContent>{FACT_KEYS.map((f) => <SelectItem key={f} value={f}>{f.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={c.op} onValueChange={(v) => onUpdateCondition(c.id, { op: v as Operator })}>
                <SelectTrigger aria-label="Operator"><SelectValue /></SelectTrigger>
                <SelectContent>{OPERATORS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
              {c.fact === "environment"
                ? <Select value={c.value} onValueChange={(v) => onUpdateCondition(c.id, { value: v })}>
                    <SelectTrigger aria-label="Value"><SelectValue /></SelectTrigger>
                    <SelectContent>{envOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                : <Input value={c.value} onChange={(e) => onUpdateCondition(c.id, { value: e.target.value })} aria-label="Value" />}
              <Button variant="ghost" size="sm" onClick={() => onRemoveCondition(c.id)} aria-label="Remove condition"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          {rule.group.groups.map((sub) => (
            <div key={sub.id} className="rounded border border-dashed border-muted-foreground/30 p-2 text-xs text-muted-foreground">
              Nested group ({sub.combinator}): {sub.conditions.map((c) => `${c.fact} ${c.op} ${c.value}`).join(sub.combinator === "all" ? " AND " : " OR ")}
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={onAddCondition}><Plus className="h-4 w-4" /> Condition</Button>
            <Button size="sm" variant="outline" onClick={onAddGroup}><Plus className="h-4 w-4" /> Nested group</Button>
          </div>
        </div>
      </div>
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

function DecisionBadge({ decision }: { decision: SimResult["decision"] }) {
  const map: Record<SimResult["decision"], { cls: string; icon: React.ReactNode }> = {
    "Allowed": { cls: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: <CheckCircle2 className="h-4 w-4" aria-hidden /> },
    "Allowed with approval": { cls: "border-amber-200 bg-amber-50 text-amber-800", icon: <ShieldAlert className="h-4 w-4" aria-hidden /> },
    "Blocked": { cls: "border-destructive/30 bg-destructive/5 text-destructive", icon: <XCircle className="h-4 w-4" aria-hidden /> },
    "Insufficient context": { cls: "border-border bg-muted text-muted-foreground", icon: <AlertTriangle className="h-4 w-4" aria-hidden /> },
  };
  const m = map[decision];
  return (
    <div className={cn("inline-flex items-center gap-2 rounded border px-2 py-1 text-sm font-medium", m.cls)}>
      {m.icon}{decision}
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-2 text-xs">
      <span className="text-muted-foreground">{k}</span>
      <span>{v}</span>
    </div>
  );
}
function SideCard({ title, highlighted, children }: { title: string; highlighted?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("rounded border p-3 text-sm", highlighted ? "border-primary/40 bg-primary/5" : "border-border bg-card")}>
      <div className="mb-2 text-xs font-medium">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function DiffLine({ k, v, changed }: { k: string; v: string; changed?: boolean }) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-2 text-xs">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn(changed && "font-medium text-primary")}>{v}{changed ? " ·" : ""}</span>
    </div>
  );
}
