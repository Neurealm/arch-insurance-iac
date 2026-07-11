/**
 * Page 44 · AI Governance, Model Registry & Evaluations
 * Route: /runops/ai-governance
 *
 * Governs models, prompts, retrieval sources, memory, tools, and digital
 * worker behavior. Every AI recommendation surfaced anywhere in the app
 * is expected to carry evidence, confidence, uncertainty, and sources —
 * this page defines the registry and evaluations those recommendations
 * are traced back to.
 *
 * Persistence (localStorage):
 *   runops.ai.models.v1              → ModelEntry[]
 *   runops.ai.usecases.v1            → ApprovedUseCase[]
 *   runops.ai.prompts.v1             → PromptVersion[]
 *   runops.ai.retrieval.v1           → RetrievalSource[]
 *   runops.ai.memory.v1              → MemoryPolicy[]
 *   runops.ai.evals.v1               → EvaluationSuite[]
 *   runops.ai.redteam.v1             → RedTeamResult[]
 *   runops.ai.incidents.v1           → AIIncident[]
 *   runops.ai.routing.v1             → RoutingRule[]
 *   runops.ai.killswitch.v1          → KillSwitch[]
 *   runops.audit.events.v1           → audit stream
 *   runops.domain.events.v1          → domain event stream
 *   runops.operations.tasks.v1       → cross-screen for Operations Queue
 *   runops.workers.suspensions.v1    → cross-screen for Worker Studio
 *   runops.workers.tool_grants.v1    → cross-screen for Worker Studio
 *   runops.workers.paused.v1         → cross-screen: pause live worker sessions
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, BadgeCheck, Ban, Beaker, BookOpen, Bot, Boxes, CheckCircle2,
  ClipboardList, Cpu, DollarSign, ExternalLink, FlaskConical, Gauge, GitBranch, Layers,
  PlayCircle, PlusCircle, RefreshCw, Route, ShieldAlert, ShieldCheck, Sparkles, XCircle,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EntityHeader } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* --------------------------------- Types -------------------------------- */

type ModelStatus =
  | "Approved" | "Restricted" | "Experimental"
  | "Evaluation failed" | "Suspended" | "Kill switch active";

type DataClass = "public" | "internal" | "confidential" | "restricted";
type Residency = "us" | "eu" | "in" | "global";
type Provider = "openai" | "google" | "anthropic" | "lovable" | "internal";

interface ModelEntry {
  id: string;                    // MDL-XXXX
  provider: Provider;
  model: string;                 // "gpt-5-nano"
  version: string;               // "2026-07"
  approvedUseCaseIds: string[];  // UC-XXXX
  dataClassification: DataClass;
  residency: Residency;
  routingPolicyId: string | null;
  promptVersionId: string | null;
  retrievalScope: string[];      // service refs / doc scopes
  memoryPolicyId: string | null;
  latestEvalId: string | null;
  costPerKTokUsd: number;        // observed
  latencyP95Ms: number;          // observed
  status: ModelStatus;
  ownerRef: string;
  createdAt: string;
}

interface ApprovedUseCase {
  id: string;                    // UC-XXXX
  name: string;
  description: string;
  allowedDataClasses: DataClass[];
  requiresHumanReview: boolean;
  active: boolean;
  createdAt: string;
}

interface PromptVersion {
  id: string;                    // PV-XXXX
  name: string;                  // "nova.triage.system"
  version: string;               // "v14"
  parentId: string | null;
  templateHash: string;          // "sha256:…"
  variables: string[];           // ["service","window"]
  ownerRef: string;
  createdAt: string;
}

interface RetrievalSource {
  id: string;                    // RS-XXXX
  name: string;                  // "runbooks:certified"
  scopeRef: string;              // e.g. "runops.runbooks.v1"
  dataClassification: DataClass;
  freshnessSlaHours: number;
  active: boolean;
  createdAt: string;
}

interface MemoryPolicy {
  id: string;                    // MP-XXXX
  name: string;
  retentionDays: number;
  allowedPurposes: string[];     // ["session-scoped","task-scoped"]
  crossSessionSharing: boolean;
  redactPII: boolean;
  active: boolean;
  createdAt: string;
}

type EvalDimension =
  | "grounding" | "evidence_citation" | "confidence_calibration"
  | "tool_selection" | "unsafe_action_prevention" | "prompt_injection_resistance"
  | "data_leakage" | "memory_poisoning" | "parameter_validation"
  | "escalation_behavior";

interface EvalScore {
  dimension: EvalDimension;
  score: number;       // 0..100
  passThreshold: number;
  samples: number;
  ci95: [number, number];
}

interface EvaluationSuite {
  id: string;                    // EV-XXXX
  modelId: string;               // MDL-XXXX
  ranAt: string;
  ranBy: string;
  scores: EvalScore[];
  overallPass: boolean;
  notes: string;
}

interface RedTeamResult {
  id: string;                    // RT-XXXX
  modelId: string;
  ranAt: string;
  ranBy: string;
  attackVector: "prompt_injection" | "data_exfiltration" | "unsafe_action" | "memory_poisoning";
  attempts: number;
  successes: number;             // model *failed* to resist
  notes: string;
}

interface AIIncident {
  id: string;                    // AII-XXXX
  modelId: string;
  workerId: string | null;
  severity: "SEV1" | "SEV2" | "SEV3";
  summary: string;
  detectedAt: string;
  state: "Open" | "Investigating" | "Contained" | "Closed";
  linkedOperationTaskId: string | null;
}

interface RoutingRule {
  id: string;                    // RR-XXXX
  name: string;
  match: string;                 // human-readable predicate
  primaryModelId: string;
  fallbackModelId: string | null;
  costCeilingUsdPer1k: number | null;
  latencyCeilingMs: number | null;
  active: boolean;
  createdAt: string;
}

interface KillSwitch {
  id: string;                    // KS-XXXX
  modelId: string;
  reason: string;
  activatedBy: string;
  activatedAt: string;
  restoredBy: string | null;
  restoredAt: string | null;
  state: "Active" | "Restored";
}

interface AuditEvt { id: string; at: string; actor: string; action: string; target: string; detail?: string; }
interface DomainEvt { id: string; at: string; kind: string; payload: unknown; }
interface OperationsTaskLite { id: string; title: string; createdAt: string; source: string; linkedRef: string; }
interface WorkerSuspensionLite { id: string; workerId: string; modelId: string; reason: string; at: string; }
interface WorkerPausedLite { id: string; workerId: string; reason: string; at: string; }
interface WorkerToolGrantLite { id: string; workerId: string; toolRef: string; at: string; effect: "grant" | "revoke"; }

/* --------------------------- Storage helpers ---------------------------- */

const MDL_KEY = "runops.ai.models.v1";
const UC_KEY  = "runops.ai.usecases.v1";
const PV_KEY  = "runops.ai.prompts.v1";
const RS_KEY  = "runops.ai.retrieval.v1";
const MP_KEY  = "runops.ai.memory.v1";
const EV_KEY  = "runops.ai.evals.v1";
const RT_KEY  = "runops.ai.redteam.v1";
const AII_KEY = "runops.ai.incidents.v1";
const RR_KEY  = "runops.ai.routing.v1";
const KS_KEY  = "runops.ai.killswitch.v1";
const AUD_KEY = "runops.audit.events.v1";
const DOM_KEY = "runops.domain.events.v1";
const OPS_KEY = "runops.operations.tasks.v1";
const WSU_KEY = "runops.workers.suspensions.v1";
const WPA_KEY = "runops.workers.paused.v1";
const WT_KEY  = "runops.workers.tool_grants.v1";

function readList<T>(k: string): T[] {
  try { const v = JSON.parse(localStorage.getItem(k) ?? "[]"); return Array.isArray(v) ? (v as T[]) : []; }
  catch { return []; }
}
function writeList<T>(k: string, v: T[]) { localStorage.setItem(k, JSON.stringify(v)); }

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${(Math.floor(Math.random() * 9000) + 1000).toString()}`;
const inDays = (d: number) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString(); };
const inHours = (h: number) => { const t = new Date(); t.setHours(t.getHours() + h); return t.toISOString(); };

function ensureSeed<T>(key: string, seed: () => T[]): T[] {
  const raw = localStorage.getItem(key);
  if (raw !== null) { try { const v = JSON.parse(raw); if (Array.isArray(v)) return v as T[]; } catch { /* fall */ } }
  const s = seed(); writeList(key, s); return s;
}

/* --------------------------- Seed --------------------------------------- */

function seedUseCases(): ApprovedUseCase[] {
  return [
    { id: "UC-1001", name: "Alert triage summarization", description: "Summarize alert bursts into candidate incidents.",
      allowedDataClasses: ["internal","confidential"], requiresHumanReview: false, active: true, createdAt: inDays(-90) },
    { id: "UC-1002", name: "Runbook recommendation", description: "Recommend certified runbooks with evidence.",
      allowedDataClasses: ["internal","confidential"], requiresHumanReview: true, active: true, createdAt: inDays(-90) },
    { id: "UC-1003", name: "Postmortem drafting", description: "Draft postmortems from incident timelines.",
      allowedDataClasses: ["internal","confidential"], requiresHumanReview: true, active: true, createdAt: inDays(-60) },
    { id: "UC-1004", name: "Customer communications", description: "Draft external status updates.",
      allowedDataClasses: ["internal"], requiresHumanReview: true, active: true, createdAt: inDays(-30) },
    { id: "UC-1005", name: "Data classification", description: "Classify unstructured operational logs.",
      allowedDataClasses: ["internal","confidential","restricted"], requiresHumanReview: false, active: false, createdAt: inDays(-15) },
  ];
}

function seedPrompts(): PromptVersion[] {
  return [
    { id: "PV-2001", name: "nova.triage.system", version: "v14", parentId: "PV-2000",
      templateHash: "sha256:d2c1…7a", variables: ["service","window","recent_incidents"],
      ownerRef: "platform-ai", createdAt: inDays(-6) },
    { id: "PV-2002", name: "nova.runbook.recommend", version: "v9", parentId: "PV-2003",
      templateHash: "sha256:9ac4…11", variables: ["incident","service","evidence_refs"],
      ownerRef: "platform-ai", createdAt: inDays(-14) },
    { id: "PV-2003", name: "nova.runbook.recommend", version: "v8", parentId: null,
      templateHash: "sha256:8bb0…c2", variables: ["incident","service"],
      ownerRef: "platform-ai", createdAt: inDays(-30) },
  ];
}

function seedRetrieval(): RetrievalSource[] {
  return [
    { id: "RS-3001", name: "runbooks:certified", scopeRef: "runops.runbooks.certified.v1",
      dataClassification: "internal", freshnessSlaHours: 24, active: true, createdAt: inDays(-120) },
    { id: "RS-3002", name: "postmortems:all", scopeRef: "runops.postmortems.v1",
      dataClassification: "confidential", freshnessSlaHours: 48, active: true, createdAt: inDays(-120) },
    { id: "RS-3003", name: "service:catalog", scopeRef: "runops.services.v1",
      dataClassification: "internal", freshnessSlaHours: 24, active: true, createdAt: inDays(-120) },
    { id: "RS-3004", name: "external:web", scopeRef: "external.web",
      dataClassification: "public", freshnessSlaHours: 168, active: false, createdAt: inDays(-90) },
  ];
}

function seedMemory(): MemoryPolicy[] {
  return [
    { id: "MP-4001", name: "Session-scoped only", retentionDays: 0,
      allowedPurposes: ["session-scoped"], crossSessionSharing: false, redactPII: true, active: true, createdAt: inDays(-120) },
    { id: "MP-4002", name: "Task memory (14d)", retentionDays: 14,
      allowedPurposes: ["task-scoped","incident-scoped"], crossSessionSharing: false, redactPII: true, active: true, createdAt: inDays(-90) },
    { id: "MP-4003", name: "Long-term ops memory (90d)", retentionDays: 90,
      allowedPurposes: ["task-scoped","incident-scoped","learning"], crossSessionSharing: true, redactPII: true, active: false, createdAt: inDays(-30) },
  ];
}

function seedEvals(): EvaluationSuite[] {
  const dims: [EvalDimension, number, number][] = [
    ["grounding",                     92, 80],
    ["evidence_citation",             88, 80],
    ["confidence_calibration",        84, 75],
    ["tool_selection",                90, 80],
    ["unsafe_action_prevention",      97, 95],
    ["prompt_injection_resistance",   82, 80],
    ["data_leakage",                  99, 98],
    ["memory_poisoning",              91, 85],
    ["parameter_validation",          94, 85],
    ["escalation_behavior",           89, 80],
  ];
  const scores1: EvalScore[] = dims.map(([d, s, t]) => ({
    dimension: d, score: s, passThreshold: t, samples: 240, ci95: [Math.max(0, s - 3), Math.min(100, s + 3)],
  }));
  const scores2: EvalScore[] = dims.map(([d, s, t]) => ({
    dimension: d, score: d === "prompt_injection_resistance" ? 68 : d === "grounding" ? 74 : s - 5,
    passThreshold: t, samples: 240, ci95: [Math.max(0, s - 8), Math.min(100, s - 2)],
  }));
  return [
    { id: "EV-5001", modelId: "MDL-100", ranAt: inDays(-2), ranBy: "eval-runner",
      scores: scores1, overallPass: true, notes: "Baseline suite v3." },
    { id: "EV-5002", modelId: "MDL-102", ranAt: inDays(-4), ranBy: "eval-runner",
      scores: scores2, overallPass: false, notes: "Failed prompt-injection resistance (< threshold)." },
  ];
}

function seedRedTeam(): RedTeamResult[] {
  return [
    { id: "RT-6001", modelId: "MDL-100", ranAt: inDays(-2), ranBy: "red-team",
      attackVector: "prompt_injection", attempts: 120, successes: 4, notes: "Two escapes via nested tool-call injection; both blocked by policy." },
    { id: "RT-6002", modelId: "MDL-102", ranAt: inDays(-4), ranBy: "red-team",
      attackVector: "prompt_injection", attempts: 120, successes: 21, notes: "Fails on nested markdown; do not deploy without prompt fix." },
    { id: "RT-6003", modelId: "MDL-100", ranAt: inDays(-2), ranBy: "red-team",
      attackVector: "data_exfiltration", attempts: 80, successes: 0, notes: "Retrieval scope enforced." },
  ];
}

function seedRouting(): RoutingRule[] {
  return [
    { id: "RR-7001", name: "Triage & summarization → fast/cheap", match: "usecase=UC-1001 OR usecase=UC-1004",
      primaryModelId: "MDL-100", fallbackModelId: "MDL-101",
      costCeilingUsdPer1k: 0.20, latencyCeilingMs: 1200, active: true, createdAt: inDays(-30) },
    { id: "RR-7002", name: "Runbook recommend → higher-quality", match: "usecase=UC-1002",
      primaryModelId: "MDL-101", fallbackModelId: "MDL-100",
      costCeilingUsdPer1k: 1.50, latencyCeilingMs: 4000, active: true, createdAt: inDays(-30) },
    { id: "RR-7003", name: "Postmortem drafting → highest-quality", match: "usecase=UC-1003",
      primaryModelId: "MDL-101", fallbackModelId: null,
      costCeilingUsdPer1k: 3.00, latencyCeilingMs: 8000, active: true, createdAt: inDays(-30) },
  ];
}

function seedModels(): ModelEntry[] {
  return [
    { id: "MDL-100", provider: "google", model: "gemini-3-flash-preview", version: "2026-07",
      approvedUseCaseIds: ["UC-1001","UC-1002","UC-1004"], dataClassification: "confidential", residency: "us",
      routingPolicyId: "RR-7001", promptVersionId: "PV-2001", retrievalScope: ["RS-3001","RS-3003"],
      memoryPolicyId: "MP-4002", latestEvalId: "EV-5001", costPerKTokUsd: 0.15, latencyP95Ms: 900,
      status: "Approved", ownerRef: "platform-ai", createdAt: inDays(-90) },
    { id: "MDL-101", provider: "openai", model: "gpt-5-nano", version: "2026-05",
      approvedUseCaseIds: ["UC-1002","UC-1003"], dataClassification: "confidential", residency: "us",
      routingPolicyId: "RR-7002", promptVersionId: "PV-2002", retrievalScope: ["RS-3001","RS-3002","RS-3003"],
      memoryPolicyId: "MP-4002", latestEvalId: null, costPerKTokUsd: 1.20, latencyP95Ms: 3200,
      status: "Approved", ownerRef: "platform-ai", createdAt: inDays(-60) },
    { id: "MDL-102", provider: "anthropic", model: "claude-opus-4", version: "2026-06",
      approvedUseCaseIds: [], dataClassification: "confidential", residency: "us",
      routingPolicyId: null, promptVersionId: "PV-2003", retrievalScope: ["RS-3001"],
      memoryPolicyId: "MP-4001", latestEvalId: "EV-5002", costPerKTokUsd: 2.80, latencyP95Ms: 4500,
      status: "Evaluation failed", ownerRef: "platform-ai", createdAt: inDays(-14) },
    { id: "MDL-103", provider: "internal", model: "runops-classifier", version: "v0.7",
      approvedUseCaseIds: ["UC-1005"], dataClassification: "restricted", residency: "us",
      routingPolicyId: null, promptVersionId: null, retrievalScope: [],
      memoryPolicyId: "MP-4001", latestEvalId: null, costPerKTokUsd: 0.02, latencyP95Ms: 300,
      status: "Experimental", ownerRef: "platform-ai", createdAt: inDays(-7) },
  ];
}

function seedIncidents(): AIIncident[] {
  return [
    { id: "AII-8001", modelId: "MDL-102", workerId: "worker-nova-triage",
      severity: "SEV2", summary: "Elevated prompt-injection rate on nested markdown inputs.",
      detectedAt: inDays(-1), state: "Investigating", linkedOperationTaskId: null },
  ];
}

function seedKillSwitches(): KillSwitch[] {
  return [];
}

/* --------------------------- Helpers ------------------------------------ */

function statusTone(s: ModelStatus): string {
  switch (s) {
    case "Approved":           return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "Restricted":         return "border-amber-200 bg-amber-50 text-amber-800";
    case "Experimental":       return "border-blue-200 bg-blue-50 text-blue-800";
    case "Evaluation failed":  return "border-red-200 bg-red-50 text-red-800";
    case "Suspended":          return "border-orange-200 bg-orange-50 text-orange-800";
    case "Kill switch active": return "border-red-200 bg-red-50 text-red-800";
  }
}

function DimBar({ score, threshold, ci }: { score: number; threshold: number; ci: [number, number] }) {
  const pass = score >= threshold;
  return (
    <div className="w-40">
      <div className="relative h-1.5 rounded bg-muted overflow-hidden">
        <div className={cn("absolute inset-y-0 left-0", pass ? "bg-emerald-500" : "bg-red-500")}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
        <div className="absolute inset-y-0 border-l border-foreground/40" style={{ left: `${threshold}%` }} />
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">
        {score} / t≥{threshold} · 95% CI [{ci[0]}, {ci[1]}]
      </div>
    </div>
  );
}

const DIM_LABEL: Record<EvalDimension, string> = {
  grounding: "Grounding",
  evidence_citation: "Evidence citation",
  confidence_calibration: "Confidence calibration",
  tool_selection: "Tool selection",
  unsafe_action_prevention: "Unsafe-action prevention",
  prompt_injection_resistance: "Prompt-injection resistance",
  data_leakage: "Data leakage",
  memory_poisoning: "Memory poisoning",
  parameter_validation: "Parameter validation",
  escalation_behavior: "Escalation behavior",
};

/* --------------------------- Component ---------------------------------- */

type Tab =
  | "models" | "usecases" | "prompts" | "retrieval" | "memory"
  | "evals" | "redteam" | "incidents" | "routing" | "cost" | "killswitch";

const TAB_LABEL: Record<Tab, string> = {
  models: "Model Registry",
  usecases: "Approved Use Cases",
  prompts: "Prompt Versions",
  retrieval: "Retrieval Sources",
  memory: "Memory Policies",
  evals: "Evaluation Suites",
  redteam: "Red Team Results",
  incidents: "AI Incidents",
  routing: "Routing",
  cost: "Cost & Latency",
  killswitch: "Kill Switches",
};

export default function AIGovernance() {
  const ops = useOperations();

  const roleLabel = ops.role ?? "viewer";
  const canWrite = !(roleLabel === "Read Only User" || roleLabel === "Auditor");
  const isGovernor =
    roleLabel === "Change Manager" ||
    roleLabel === "Incident Commander" ||
    roleLabel === "Platform Engineer";

  const [tab, setTab] = useState<Tab>("models");
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [useCases, setUseCases] = useState<ApprovedUseCase[]>([]);
  const [prompts, setPrompts] = useState<PromptVersion[]>([]);
  const [retrieval, setRetrieval] = useState<RetrievalSource[]>([]);
  const [memory, setMemory] = useState<MemoryPolicy[]>([]);
  const [evals, setEvals] = useState<EvaluationSuite[]>([]);
  const [redteam, setRedteam] = useState<RedTeamResult[]>([]);
  const [incidents, setIncidents] = useState<AIIncident[]>([]);
  const [routing, setRouting] = useState<RoutingRule[]>([]);
  const [killSwitches, setKillSwitches] = useState<KillSwitch[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ModelStatus | "all">("all");
  const [detail, setDetail] = useState<ModelEntry | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerDraft, setRegisterDraft] = useState<{
    provider: Provider; model: string; version: string; data: DataClass; residency: Residency;
  }>({ provider: "google", model: "", version: "", data: "internal", residency: "us" });
  const [evalOpen, setEvalOpen] = useState<ModelEntry | null>(null);
  const [redteamOpen, setRedteamOpen] = useState<ModelEntry | null>(null);
  const [ksOpen, setKsOpen] = useState<ModelEntry | null>(null);
  const [ksReason, setKsReason] = useState("");
  const [routingOpen, setRoutingOpen] = useState<RoutingRule | null>(null);
  const [routingDraft, setRoutingDraft] = useState({ primaryModelId: "", fallbackModelId: "", apply: "future" as "future" | "now" });

  const audit = useCallback((action: string, target: string, detailStr?: string) => {
    const list = readList<AuditEvt>(AUD_KEY);
    writeList(AUD_KEY, [{ id: rid("AUD"), at: nowIso(), actor: roleLabel, action, target, detail: detailStr }, ...list].slice(0, 1000));
    const dom = readList<DomainEvt>(DOM_KEY);
    writeList(DOM_KEY, [{ id: rid("DEV"), at: nowIso(), kind: action, payload: { target, detail: detailStr } }, ...dom].slice(0, 1000));
  }, [roleLabel]);

  useEffect(() => {
    setUseCases(ensureSeed<ApprovedUseCase>(UC_KEY, seedUseCases));
    setPrompts(ensureSeed<PromptVersion>(PV_KEY, seedPrompts));
    setRetrieval(ensureSeed<RetrievalSource>(RS_KEY, seedRetrieval));
    setMemory(ensureSeed<MemoryPolicy>(MP_KEY, seedMemory));
    setEvals(ensureSeed<EvaluationSuite>(EV_KEY, seedEvals));
    setRedteam(ensureSeed<RedTeamResult>(RT_KEY, seedRedTeam));
    setRouting(ensureSeed<RoutingRule>(RR_KEY, seedRouting));
    setModels(ensureSeed<ModelEntry>(MDL_KEY, seedModels));
    setIncidents(ensureSeed<AIIncident>(AII_KEY, seedIncidents));
    setKillSwitches(ensureSeed<KillSwitch>(KS_KEY, seedKillSwitches));
  }, []);

  const filteredModels = useMemo(() => {
    const q = search.trim().toLowerCase();
    return models.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [m.id, m.provider, m.model, m.version, m.status, m.residency, m.dataClassification].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [models, search, statusFilter]);

  /* --------------------------- Cross-screen writers --------------------- */

  const suspendWorkersForModel = useCallback((modelId: string, reason: string) => {
    const suspensions = readList<WorkerSuspensionLite>(WSU_KEY);
    const row: WorkerSuspensionLite = { id: rid("WSU"), workerId: "*", modelId, reason, at: nowIso() };
    writeList(WSU_KEY, [row, ...suspensions].slice(0, 200));
  }, []);

  const pauseWorkerSessionsForModel = useCallback((modelId: string, reason: string) => {
    const paused = readList<WorkerPausedLite>(WPA_KEY);
    // Simulated: pause "all live worker sessions" tied to model.
    writeList(WPA_KEY, [
      { id: rid("WPA"), workerId: `bound:${modelId}`, reason, at: nowIso() },
      ...paused,
    ].slice(0, 200));
  }, []);

  const disableToolForWorkers = useCallback((toolRef: string, reason: string) => {
    const grants = readList<WorkerToolGrantLite>(WT_KEY);
    writeList(WT_KEY, [
      { id: rid("WT"), workerId: "*", toolRef, at: nowIso(), effect: "revoke" },
      ...grants,
    ].slice(0, 500));
    audit("worker.tool.disabled", toolRef, reason);
  }, [audit]);

  const openOperationsTask = useCallback((title: string, source: string, linkedRef: string) => {
    const tasks = readList<OperationsTaskLite>(OPS_KEY);
    const id = rid("OT");
    writeList(OPS_KEY, [{ id, title, createdAt: nowIso(), source, linkedRef }, ...tasks].slice(0, 500));
    return id;
  }, []);

  /* --------------------------- Mutations -------------------------------- */

  const setModelStatus = useCallback((id: string, status: ModelStatus, action: string, note?: string) => {
    const next = models.map((m) => m.id === id ? { ...m, status } : m);
    setModels(next); writeList(MDL_KEY, next);
    audit(action, id, note);
  }, [models, audit]);

  const registerModel = useCallback(() => {
    if (!isGovernor) return;
    if (!registerDraft.model.trim() || !registerDraft.version.trim()) return;
    const m: ModelEntry = {
      id: rid("MDL"), provider: registerDraft.provider, model: registerDraft.model.trim(),
      version: registerDraft.version.trim(), approvedUseCaseIds: [],
      dataClassification: registerDraft.data, residency: registerDraft.residency,
      routingPolicyId: null, promptVersionId: null, retrievalScope: [], memoryPolicyId: "MP-4001",
      latestEvalId: null, costPerKTokUsd: 0, latencyP95Ms: 0, status: "Experimental",
      ownerRef: roleLabel, createdAt: nowIso(),
    };
    const next = [m, ...models]; setModels(next); writeList(MDL_KEY, next);
    audit("model.registered", m.id, `${m.provider}/${m.model}@${m.version}`);
    ops.pushNotification({ kind: "info", title: "Model registered",
      detail: `${m.id} — ${m.provider}/${m.model}@${m.version}`, entityRef: m.id, route: "/runops/ai-governance" });
    setRegisterOpen(false);
    setRegisterDraft({ provider: "google", model: "", version: "", data: "internal", residency: "us" });
  }, [registerDraft, models, isGovernor, roleLabel, audit, ops]);

  const approveUseCase = useCallback((modelId: string, useCaseId: string) => {
    if (!isGovernor) return;
    const uc = useCases.find((u) => u.id === useCaseId);
    if (!uc) return;
    const m = models.find((x) => x.id === modelId);
    if (!m) return;
    if (!uc.allowedDataClasses.includes(m.dataClassification)) {
      ops.pushNotification({ kind: "warning", title: "Approval blocked",
        detail: `Data class ${m.dataClassification} not permitted by ${uc.id}.`, entityRef: modelId, route: "/runops/ai-governance" });
      audit("usecase.approval.blocked", modelId, `data-class=${m.dataClassification}`);
      return;
    }
    const next = models.map((x) => x.id === modelId
      ? { ...x, approvedUseCaseIds: Array.from(new Set([...x.approvedUseCaseIds, useCaseId])),
          status: x.status === "Restricted" || x.status === "Experimental" ? "Approved" as ModelStatus : x.status }
      : x);
    setModels(next); writeList(MDL_KEY, next);
    audit("usecase.approved", modelId, useCaseId);
    ops.pushNotification({ kind: "info", title: "Use case approved", detail: `${modelId} → ${useCaseId}`, entityRef: modelId, route: "/runops/ai-governance" });
  }, [models, useCases, isGovernor, audit, ops]);

  const restrictUseCase = useCallback((modelId: string, useCaseId: string) => {
    if (!isGovernor) return;
    const next = models.map((x) => x.id === modelId
      ? { ...x, approvedUseCaseIds: x.approvedUseCaseIds.filter((u) => u !== useCaseId) }
      : x);
    setModels(next); writeList(MDL_KEY, next);
    audit("usecase.restricted", modelId, useCaseId);
    // Cross-screen: any workers relying on this pairing get a suspension record.
    suspendWorkersForModel(modelId, `use-case ${useCaseId} restricted`);
    ops.pushNotification({ kind: "warning", title: "Use case restricted", detail: `${modelId} ↛ ${useCaseId}`, entityRef: modelId, route: "/runops/ai-governance" });
  }, [models, isGovernor, audit, suspendWorkersForModel, ops]);

  const runEvaluation = useCallback((m: ModelEntry) => {
    if (!isGovernor) return;
    const now = new Date();
    const seed = m.id.charCodeAt(m.id.length - 1) % 5;
    const dims: [EvalDimension, number, number][] = [
      ["grounding", 85 + seed, 80],
      ["evidence_citation", 82 + seed, 80],
      ["confidence_calibration", 78 + seed, 75],
      ["tool_selection", 84 + seed, 80],
      ["unsafe_action_prevention", 96, 95],
      ["prompt_injection_resistance", 76 + seed, 80],
      ["data_leakage", 98, 98],
      ["memory_poisoning", 87 + seed, 85],
      ["parameter_validation", 88 + seed, 85],
      ["escalation_behavior", 84 + seed, 80],
    ];
    const scores: EvalScore[] = dims.map(([d, s, t]) => ({
      dimension: d, score: s, passThreshold: t, samples: 200,
      ci95: [Math.max(0, s - 3), Math.min(100, s + 3)],
    }));
    const overallPass = scores.every((s) => s.score >= s.passThreshold);
    const evaluation: EvaluationSuite = {
      id: rid("EV"), modelId: m.id, ranAt: now.toISOString(), ranBy: roleLabel,
      scores, overallPass, notes: overallPass ? "All dimensions passing." : "One or more dimensions below threshold.",
    };
    const nextEvals = [evaluation, ...evals]; setEvals(nextEvals); writeList(EV_KEY, nextEvals);
    const nextModels = models.map((x) => x.id === m.id
      ? { ...x, latestEvalId: evaluation.id, status: overallPass ? x.status : ("Evaluation failed" as ModelStatus) }
      : x);
    setModels(nextModels); writeList(MDL_KEY, nextModels);
    audit("model.evaluated", m.id, `pass=${overallPass}`);
    ops.pushNotification({ kind: overallPass ? "info" : "warning",
      title: overallPass ? "Evaluation passed" : "Evaluation failed",
      detail: `${m.id} — ${evaluation.id}`, entityRef: m.id, route: "/runops/ai-governance" });
    if (!overallPass) {
      suspendWorkersForModel(m.id, `evaluation ${evaluation.id} failed`);
      openOperationsTask(`Evaluation failed for ${m.id}`, "ai.governance.eval", evaluation.id);
    }
    setEvalOpen(null);
  }, [evals, models, isGovernor, roleLabel, audit, suspendWorkersForModel, openOperationsTask, ops]);

  const runRedTeam = useCallback((m: ModelEntry, vector: RedTeamResult["attackVector"]) => {
    if (!isGovernor) return;
    const seed = (m.id.charCodeAt(m.id.length - 1) + vector.length) % 6;
    const attempts = 100;
    const successes = Math.max(0, 12 - seed * 2);
    const r: RedTeamResult = {
      id: rid("RT"), modelId: m.id, ranAt: nowIso(), ranBy: roleLabel,
      attackVector: vector, attempts, successes, notes: `Adversarial suite ${vector}.`,
    };
    const next = [r, ...redteam]; setRedteam(next); writeList(RT_KEY, next);
    audit("model.redteam.ran", m.id, `${vector}: ${successes}/${attempts}`);
    if (successes / attempts > 0.15) {
      setModelStatus(m.id, "Restricted", "model.restricted", `red-team ${vector} > 15%`);
      openOperationsTask(`Red-team ${vector} regression on ${m.id}`, "ai.governance.redteam", r.id);
    }
    ops.pushNotification({ kind: "info", title: "Red-team run", detail: `${m.id} · ${vector}: ${successes}/${attempts}`, entityRef: m.id, route: "/runops/ai-governance" });
    setRedteamOpen(null);
  }, [redteam, isGovernor, roleLabel, audit, setModelStatus, openOperationsTask, ops]);

  const activateKillSwitch = useCallback(() => {
    if (!ksOpen || !isGovernor) return;
    if (!ksReason.trim()) return;
    const ks: KillSwitch = {
      id: rid("KS"), modelId: ksOpen.id, reason: ksReason,
      activatedBy: roleLabel, activatedAt: nowIso(),
      restoredBy: null, restoredAt: null, state: "Active",
    };
    const next = [ks, ...killSwitches]; setKillSwitches(next); writeList(KS_KEY, next);
    setModelStatus(ksOpen.id, "Kill switch active", "model.killswitch.activated", ksReason);
    suspendWorkersForModel(ksOpen.id, `kill switch: ${ksReason}`);
    pauseWorkerSessionsForModel(ksOpen.id, `kill switch: ${ksReason}`);
    openOperationsTask(`Kill switch active for ${ksOpen.id}`, "ai.governance.killswitch", ks.id);
    ops.pushNotification({ kind: "warning", title: "Kill switch activated",
      detail: `${ksOpen.id} — ${ksReason}`, entityRef: ksOpen.id, route: "/runops/ai-governance" });
    setKsOpen(null); setKsReason("");
  }, [ksOpen, ksReason, killSwitches, isGovernor, roleLabel, setModelStatus, suspendWorkersForModel, pauseWorkerSessionsForModel, openOperationsTask, ops]);

  const restoreKillSwitch = useCallback((ks: KillSwitch) => {
    if (!isGovernor) return;
    if (ks.state !== "Active") return;
    // SoD: restorer ≠ activator
    if (ks.activatedBy === roleLabel) {
      ops.pushNotification({ kind: "warning", title: "Blocked by SoD",
        detail: "Restorer must not be the activator.", entityRef: ks.id, route: "/runops/ai-governance" });
      audit("model.killswitch.blocked.sod", ks.id, "activator=restorer");
      return;
    }
    const next = killSwitches.map((k) => k.id === ks.id
      ? { ...k, state: "Restored" as const, restoredBy: roleLabel, restoredAt: nowIso() } : k);
    setKillSwitches(next); writeList(KS_KEY, next);
    setModelStatus(ks.modelId, "Approved", "model.killswitch.restored", ks.id);
    ops.pushNotification({ kind: "info", title: "Kill switch restored", detail: ks.modelId, entityRef: ks.modelId, route: "/runops/ai-governance" });
  }, [killSwitches, isGovernor, roleLabel, setModelStatus, audit, ops]);

  const suspendModel = useCallback((m: ModelEntry) => {
    if (!isGovernor) return;
    setModelStatus(m.id, "Suspended", "model.suspended");
    suspendWorkersForModel(m.id, "manual suspend");
    ops.pushNotification({ kind: "warning", title: "Model suspended", detail: m.id, entityRef: m.id, route: "/runops/ai-governance" });
  }, [isGovernor, setModelStatus, suspendWorkersForModel, ops]);

  const investigateIncident = useCallback((i: AIIncident) => {
    if (!canWrite) return;
    const linkedId = i.linkedOperationTaskId ?? openOperationsTask(
      `Investigate AI incident ${i.id}`, "ai.governance.incident", i.id);
    const next = incidents.map((x) => x.id === i.id
      ? { ...x, state: "Investigating" as const, linkedOperationTaskId: linkedId } : x);
    setIncidents(next); writeList(AII_KEY, next);
    audit("ai.incident.investigating", i.id, linkedId);
    ops.pushNotification({ kind: "info", title: "AI incident investigation started",
      detail: `${i.id} → task ${linkedId}`, entityRef: i.id, route: "/runops/ai-governance" });
  }, [incidents, canWrite, openOperationsTask, audit, ops]);

  const changeRouting = useCallback(() => {
    if (!routingOpen || !isGovernor) return;
    const next = routing.map((r) => r.id === routingOpen.id
      ? { ...r, primaryModelId: routingDraft.primaryModelId || r.primaryModelId,
              fallbackModelId: routingDraft.fallbackModelId || r.fallbackModelId }
      : r);
    setRouting(next); writeList(RR_KEY, next);
    audit("routing.changed", routingOpen.id, `apply=${routingDraft.apply}`);
    ops.pushNotification({ kind: "info", title: "Routing changed",
      detail: `${routingOpen.id} · applies to ${routingDraft.apply === "now" ? "existing + future" : "future"} sessions`,
      entityRef: routingOpen.id, route: "/runops/ai-governance" });
    if (routingDraft.apply === "now") {
      // Explicit "apply now" pauses live sessions bound to old model so they re-bind.
      pauseWorkerSessionsForModel(routingOpen.primaryModelId, `routing rule ${routingOpen.id} re-applied`);
    }
    setRoutingOpen(null); setRoutingDraft({ primaryModelId: "", fallbackModelId: "", apply: "future" });
  }, [routing, routingOpen, routingDraft, isGovernor, audit, pauseWorkerSessionsForModel, ops]);

  const disableTool = useCallback((toolRef: string) => {
    if (!isGovernor) return;
    disableToolForWorkers(toolRef, "AI governance disabled tool");
    ops.pushNotification({ kind: "warning", title: "Tool disabled", detail: toolRef, entityRef: toolRef, route: "/runops/ai-governance" });
  }, [isGovernor, disableToolForWorkers, ops]);

  const toggleCompareId = (id: string) => {
    setCompareIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : (prev.length < 3 ? [...prev, id] : prev));
  };

  /* --------------------------- Render ----------------------------------- */

  const summary = useMemo(() => ({
    total: models.length,
    approved: models.filter((m) => m.status === "Approved").length,
    experimental: models.filter((m) => m.status === "Experimental").length,
    failed: models.filter((m) => m.status === "Evaluation failed").length,
    killed: models.filter((m) => m.status === "Kill switch active").length,
    openIncidents: incidents.filter((i) => i.state !== "Closed").length,
  }), [models, incidents]);

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Governance"
        title="AI Governance, Model Registry & Evaluations"
        subtitle="Govern models, prompts, retrieval, memory, tools, and digital-worker behavior. Every AI recommendation must carry evidence, confidence, uncertainty, and sources — traced back to entries here."
        meta={
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{summary.total} models</Badge>
            <Badge variant="outline">{summary.approved} approved</Badge>
            <Badge variant="outline">{summary.experimental} experimental</Badge>
            <Badge variant="outline" className={cn(summary.failed > 0 && statusTone("Evaluation failed"))}>{summary.failed} eval-failed</Badge>
            <Badge variant="outline" className={cn(summary.killed > 0 && statusTone("Kill switch active"))}>{summary.killed} killed</Badge>
            <Badge variant="outline" className={cn(summary.openIncidents > 0 && statusTone("Restricted"))}>{summary.openIncidents} open incidents</Badge>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setRegisterOpen(true)} disabled={!isGovernor}>
              <PlusCircle className="h-4 w-4 mr-1.5" /> Register model
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCompareOpen(true)} disabled={compareIds.length < 2}>
              <GitBranch className="h-4 w-4 mr-1.5" /> Compare ({compareIds.length})
            </Button>
          </div>
        }
      />

      {!canWrite && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-sm text-amber-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> You have <strong className="mx-1">read-only</strong> access. Mutations disabled.
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="flex flex-wrap gap-1 h-auto">
          {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
            <TabsTrigger key={t} value={t} aria-label={`Switch to ${TAB_LABEL[t]} tab`}>{TAB_LABEL[t]}</TabsTrigger>
          ))}
        </TabsList>

        {/* Model Registry */}
        <TabsContent value="models" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search provider, model, version…" aria-label="Search models" className="w-64" />
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ModelStatus | "all")}>
                  <SelectTrigger className="w-48" aria-label="Filter by status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {(["Approved","Restricted","Experimental","Evaluation failed","Suspended","Kill switch active"] as ModelStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground ml-auto">
                  {filteredModels.length} of {models.length} · select up to 3 to compare
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-2 w-8"></th>
                      <th className="py-2 pr-2">Model</th>
                      <th className="py-2 pr-2">Version</th>
                      <th className="py-2 pr-2">Data class</th>
                      <th className="py-2 pr-2">Residency</th>
                      <th className="py-2 pr-2">Approved</th>
                      <th className="py-2 pr-2">Eval</th>
                      <th className="py-2 pr-2">$/1k tok</th>
                      <th className="py-2 pr-2">P95 latency</th>
                      <th className="py-2 pr-2">Status</th>
                      <th className="py-2 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModels.map((m) => {
                      const ev = evals.find((e) => e.id === m.latestEvalId);
                      return (
                        <tr key={m.id} className="border-t border-border">
                          <td className="py-2 pr-2">
                            <input type="checkbox" checked={compareIds.includes(m.id)}
                              onChange={() => toggleCompareId(m.id)}
                              aria-label={`Select ${m.model} for comparison`} />
                          </td>
                          <td className="py-2 pr-2">
                            <div className="font-mono text-xs">{m.provider}/{m.model}</div>
                            <div className="text-[10px] text-muted-foreground">{m.id}</div>
                          </td>
                          <td className="py-2 pr-2 font-mono text-xs">{m.version}</td>
                          <td className="py-2 pr-2">{m.dataClassification}</td>
                          <td className="py-2 pr-2">{m.residency.toUpperCase()}</td>
                          <td className="py-2 pr-2 text-xs">
                            {m.approvedUseCaseIds.length > 0
                              ? m.approvedUseCaseIds.map((u) => <Badge key={u} variant="outline" className="mr-1 text-[10px]">{u}</Badge>)
                              : <span className="text-muted-foreground">none</span>}
                          </td>
                          <td className="py-2 pr-2 text-xs">
                            {ev
                              ? <Badge variant="outline" className={cn(ev.overallPass ? statusTone("Approved") : statusTone("Evaluation failed"))}>
                                  {ev.overallPass ? "pass" : "fail"}
                                </Badge>
                              : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="py-2 pr-2 text-xs">${m.costPerKTokUsd.toFixed(2)}</td>
                          <td className="py-2 pr-2 text-xs">{m.latencyP95Ms} ms</td>
                          <td className="py-2 pr-2"><Badge variant="outline" className={cn(statusTone(m.status))}>{m.status}</Badge></td>
                          <td className="py-2 pr-2 text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setDetail(m)}>Open</Button>
                              <Button size="sm" variant="outline" onClick={() => setEvalOpen(m)} disabled={!isGovernor}>
                                <FlaskConical className="h-3.5 w-3.5 mr-1" /> Eval
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setRedteamOpen(m)} disabled={!isGovernor}>
                                <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Red team
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setKsOpen(m)} disabled={!isGovernor}>
                                <Ban className="h-3.5 w-3.5 mr-1" /> Kill
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredModels.length === 0 && (
                      <tr><td colSpan={11} className="py-8 text-center text-sm text-muted-foreground">No models match the filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Use Cases */}
        <TabsContent value="usecases" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {useCases.map((u) => (
              <Card key={u.id}>
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{u.name}</div>
                    <Badge variant={u.active ? "default" : "outline"}>{u.active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{u.id}</div>
                  <div className="text-xs">{u.description}</div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {u.allowedDataClasses.map((d) => <Badge key={d} variant="outline">{d}</Badge>)}
                    <Badge variant="outline">{u.requiresHumanReview ? "human review required" : "no human review"}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Prompt Versions */}
        <TabsContent value="prompts" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              {prompts.map((p) => (
                <div key={p.id} className="rounded-md border border-border p-3 text-sm flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-xs">{p.name}<span className="text-muted-foreground"> @ {p.version}</span></div>
                    <div className="text-[11px] text-muted-foreground">
                      {p.id}{p.parentId ? ` · parent ${p.parentId}` : " · root"} · hash <span className="font-mono">{p.templateHash}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Variables: {p.variables.map((v) => <code key={v} className="font-mono mr-1">{`{${v}}`}</code>)}
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">owner: {p.ownerRef}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retrieval Sources */}
        <TabsContent value="retrieval" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {retrieval.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4 space-y-1 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{r.name}</div>
                    <Badge variant={r.active ? "default" : "outline"}>{r.active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{r.id} · scope <span className="font-mono">{r.scopeRef}</span></div>
                  <div className="text-xs">Data: {r.dataClassification} · Freshness SLA: {r.freshnessSlaHours}h</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Memory Policies */}
        <TabsContent value="memory" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {memory.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4 space-y-1 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{m.name}</div>
                    <Badge variant={m.active ? "default" : "outline"}>{m.active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{m.id}</div>
                  <div className="text-xs">Retention: {m.retentionDays === 0 ? "session only" : `${m.retentionDays}d`}</div>
                  <div className="text-xs">Purposes: {m.allowedPurposes.join(", ")}</div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <Badge variant="outline">{m.crossSessionSharing ? "cross-session" : "no cross-session"}</Badge>
                    <Badge variant="outline">{m.redactPII ? "PII redacted" : "no PII redaction"}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Evaluation Suites */}
        <TabsContent value="evals" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              {evals.length === 0 && <div className="text-sm text-muted-foreground">No evaluations recorded.</div>}
              {evals.map((e) => {
                const m = models.find((x) => x.id === e.modelId);
                return (
                  <div key={e.id} className="rounded-md border border-border p-3 space-y-2 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">{e.id} · {m ? `${m.provider}/${m.model}` : e.modelId}</div>
                      <Badge variant="outline" className={cn(e.overallPass ? statusTone("Approved") : statusTone("Evaluation failed"))}>
                        {e.overallPass ? "Overall pass" : "Overall fail"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ran {new Date(e.ranAt).toLocaleString()} by {e.ranBy} · {e.notes}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {e.scores.map((s) => (
                        <div key={s.dimension} className="flex items-center justify-between gap-2 text-xs">
                          <span className="min-w-[180px]">{DIM_LABEL[s.dimension]}</span>
                          <DimBar score={s.score} threshold={s.passThreshold} ci={s.ci95} />
                          <span className="text-[10px] text-muted-foreground">n={s.samples}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Red Team */}
        <TabsContent value="redteam" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              {redteam.length === 0 && <div className="text-sm text-muted-foreground">No red-team runs recorded.</div>}
              {redteam.map((r) => {
                const m = models.find((x) => x.id === r.modelId);
                const rate = r.successes / Math.max(1, r.attempts);
                return (
                  <div key={r.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">{r.id} · {m ? `${m.provider}/${m.model}` : r.modelId}</div>
                      <Badge variant="outline" className={cn(rate > 0.15 ? statusTone("Evaluation failed") : statusTone("Approved"))}>
                        {r.attackVector}: {r.successes}/{r.attempts}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(r.ranAt).toLocaleString()} by {r.ranBy}</div>
                    <div className="text-xs">{r.notes}</div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Incidents */}
        <TabsContent value="incidents" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              {incidents.length === 0 && <div className="text-sm text-muted-foreground">No AI incidents.</div>}
              {incidents.map((i) => (
                <div key={i.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{i.id} · {i.severity} · {i.modelId}</div>
                    <Badge variant="outline" className={cn(
                      i.state === "Open" && statusTone("Evaluation failed"),
                      i.state === "Investigating" && statusTone("Restricted"),
                      i.state === "Contained" && statusTone("Experimental"),
                      i.state === "Closed" && statusTone("Approved"),
                    )}>{i.state}</Badge>
                  </div>
                  <div className="text-xs">{i.summary}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Detected {new Date(i.detectedAt).toLocaleString()}
                    {i.workerId ? ` · worker ${i.workerId}` : ""}
                    {i.linkedOperationTaskId ? ` · task ${i.linkedOperationTaskId}` : ""}
                  </div>
                  <div className="pt-1 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => investigateIncident(i)}
                      disabled={!canWrite || i.state === "Closed"}>
                      <Activity className="h-3.5 w-3.5 mr-1" /> Investigate
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Routing */}
        <TabsContent value="routing" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              {routing.map((r) => {
                const primary = models.find((m) => m.id === r.primaryModelId);
                const fallback = r.fallbackModelId ? models.find((m) => m.id === r.fallbackModelId) : null;
                return (
                  <div key={r.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">{r.name}</div>
                      <Badge variant={r.active ? "default" : "outline"}>{r.active ? "Active" : "Inactive"}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{r.id} · match <span className="font-mono">{r.match}</span></div>
                    <div className="text-xs">
                      Primary: <span className="font-mono">{primary ? `${primary.provider}/${primary.model}` : r.primaryModelId}</span>
                      {fallback && <> · fallback: <span className="font-mono">{fallback.provider}/{fallback.model}</span></>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.costCeilingUsdPer1k !== null && <>Cost ≤ ${r.costCeilingUsdPer1k.toFixed(2)}/1k tok · </>}
                      {r.latencyCeilingMs !== null && <>Latency ≤ {r.latencyCeilingMs}ms</>}
                    </div>
                    <div className="pt-1">
                      <Button size="sm" variant="outline" onClick={() => {
                        setRoutingOpen(r);
                        setRoutingDraft({ primaryModelId: r.primaryModelId, fallbackModelId: r.fallbackModelId ?? "", apply: "future" });
                      }} disabled={!isGovernor}>
                        <Route className="h-3.5 w-3.5 mr-1" /> Change routing
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost & Latency */}
        <TabsContent value="cost" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-2">Model</th>
                      <th className="py-2 pr-2">$/1k tok</th>
                      <th className="py-2 pr-2">P95 latency</th>
                      <th className="py-2 pr-2">Approved use cases</th>
                      <th className="py-2 pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((m) => (
                      <tr key={m.id} className="border-t border-border">
                        <td className="py-2 pr-2 font-mono text-xs">{m.provider}/{m.model}@{m.version}</td>
                        <td className="py-2 pr-2 text-xs">${m.costPerKTokUsd.toFixed(2)}</td>
                        <td className="py-2 pr-2 text-xs">{m.latencyP95Ms} ms</td>
                        <td className="py-2 pr-2 text-xs">{m.approvedUseCaseIds.join(", ") || "—"}</td>
                        <td className="py-2 pr-2"><Badge variant="outline" className={cn(statusTone(m.status))}>{m.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kill Switches */}
        <TabsContent value="killswitch" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5" /> Activating a kill switch pauses live worker sessions and
                creates an operations task. Restoring requires a different actor (SoD).
              </div>
              {killSwitches.length === 0 && <div className="text-sm text-muted-foreground">No kill switches recorded.</div>}
              {killSwitches.map((k) => (
                <div key={k.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{k.id} · {k.modelId}</div>
                    <Badge variant="outline" className={cn(k.state === "Active" ? statusTone("Kill switch active") : statusTone("Approved"))}>{k.state}</Badge>
                  </div>
                  <div className="text-xs">{k.reason}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Activated by {k.activatedBy} · {new Date(k.activatedAt).toLocaleString()}
                    {k.restoredBy && <> · Restored by {k.restoredBy} · {k.restoredAt ? new Date(k.restoredAt).toLocaleString() : ""}</>}
                  </div>
                  {k.state === "Active" && (
                    <div className="pt-1">
                      <Button size="sm" onClick={() => restoreKillSwitch(k)}
                        disabled={!isGovernor || k.activatedBy === roleLabel}
                        title={k.activatedBy === roleLabel ? "SoD: restorer must not be activator" : undefined}>
                        <RefreshCw className="h-3.5 w-3.5 mr-1" /> Restore after approval
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail drawer */}
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{detail ? `${detail.provider}/${detail.model} @ ${detail.version}` : ""}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={cn(statusTone(detail.status))}>{detail.status}</Badge>
                <Badge variant="outline">{detail.dataClassification}</Badge>
                <Badge variant="outline">residency: {detail.residency.toUpperCase()}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-medium mb-1">Approved use cases</div>
                  <div className="space-y-1">
                    {useCases.map((u) => {
                      const isApproved = detail.approvedUseCaseIds.includes(u.id);
                      return (
                        <div key={u.id} className="flex items-center justify-between gap-2">
                          <div>
                            <span className="font-mono">{u.id}</span> · {u.name}
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant={isApproved ? "outline" : "default"}
                              onClick={() => approveUseCase(detail.id, u.id)}
                              disabled={!isGovernor || isApproved}>Approve</Button>
                            <Button size="sm" variant="outline"
                              onClick={() => restrictUseCase(detail.id, u.id)}
                              disabled={!isGovernor || !isApproved}>Restrict</Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="font-medium mb-1">Prompt lineage</div>
                    {(() => {
                      const chain: PromptVersion[] = [];
                      let cur = prompts.find((p) => p.id === detail.promptVersionId) ?? null;
                      while (cur) { chain.push(cur); cur = cur.parentId ? prompts.find((p) => p.id === cur!.parentId) ?? null : null; }
                      if (chain.length === 0) return <div className="text-muted-foreground">No prompt bound.</div>;
                      return (
                        <ol className="list-decimal list-inside space-y-0.5">
                          {chain.map((p) => (
                            <li key={p.id} className="font-mono text-[11px]">{p.name} @ {p.version} <span className="text-muted-foreground">({p.templateHash})</span></li>
                          ))}
                        </ol>
                      );
                    })()}
                  </div>
                  <div>
                    <div className="font-medium mb-1">Retrieval scope</div>
                    <div className="flex flex-wrap gap-1">
                      {detail.retrievalScope.length === 0 && <span className="text-muted-foreground">none</span>}
                      {detail.retrievalScope.map((r) => <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Memory policy</div>
                    <div className="text-[11px]">{detail.memoryPolicyId ?? "none"}</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Tools</div>
                    <div className="text-[11px] text-muted-foreground">
                      Tool grants live in Worker Studio. Disable propagates to worker tool grants.
                    </div>
                    <div className="flex gap-1 mt-1">
                      <Button size="sm" variant="outline" onClick={() => disableTool(`model:${detail.id}:tool.external.web`)}
                        disabled={!isGovernor}>
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Disable external web
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => detail && setEvalOpen(detail)} disabled={!isGovernor || !detail}>
              <FlaskConical className="h-4 w-4 mr-1.5" /> Run evaluation
            </Button>
            <Button variant="outline" onClick={() => detail && setRedteamOpen(detail)} disabled={!isGovernor || !detail}>
              <ShieldAlert className="h-4 w-4 mr-1.5" /> Run adversarial test
            </Button>
            <Button variant="outline" onClick={() => detail && suspendModel(detail)} disabled={!isGovernor || !detail}>
              <Ban className="h-4 w-4 mr-1.5" /> Suspend
            </Button>
            <Button variant="ghost" onClick={() => setDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register model */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Register model</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Provider</label>
                <Select value={registerDraft.provider} onValueChange={(v) => setRegisterDraft({ ...registerDraft, provider: v as Provider })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["openai","google","anthropic","lovable","internal"] as Provider[]).map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Model</label>
                <Input value={registerDraft.model} onChange={(e) => setRegisterDraft({ ...registerDraft, model: e.target.value })} placeholder="gemini-3-flash-preview" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Version</label>
                <Input value={registerDraft.version} onChange={(e) => setRegisterDraft({ ...registerDraft, version: e.target.value })} placeholder="2026-07" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Data classification</label>
                <Select value={registerDraft.data} onValueChange={(v) => setRegisterDraft({ ...registerDraft, data: v as DataClass })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["public","internal","confidential","restricted"] as DataClass[]).map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Residency</label>
                <Select value={registerDraft.residency} onValueChange={(v) => setRegisterDraft({ ...registerDraft, residency: v as Residency })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["us","eu","in","global"] as Residency[]).map((r) => (
                      <SelectItem key={r} value={r}>{r.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Newly registered models start as <strong>Experimental</strong>. Approve use cases and run an evaluation before promoting.
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRegisterOpen(false)}>Cancel</Button>
            <Button onClick={registerModel} disabled={!registerDraft.model.trim() || !registerDraft.version.trim()}>Register</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Run evaluation */}
      <Dialog open={evalOpen !== null} onOpenChange={(o) => !o && setEvalOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Run evaluation suite</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <div>Run the standard 10-dimension evaluation on <span className="font-mono">{evalOpen?.provider}/{evalOpen?.model}@{evalOpen?.version}</span>?</div>
            <div className="text-xs text-muted-foreground">
              Dimensions: grounding · evidence citation · confidence calibration · tool selection · unsafe-action prevention ·
              prompt-injection resistance · data leakage · memory poisoning · parameter validation · escalation behavior.
              Failure suspends downstream workers and opens an operations task.
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEvalOpen(null)}>Cancel</Button>
            <Button onClick={() => evalOpen && runEvaluation(evalOpen)}>
              <FlaskConical className="h-4 w-4 mr-1.5" /> Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Run red team */}
      <Dialog open={redteamOpen !== null} onOpenChange={(o) => !o && setRedteamOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Run adversarial test</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <div>Pick a vector to run against <span className="font-mono">{redteamOpen?.provider}/{redteamOpen?.model}</span>:</div>
          </div>
          <DialogFooter className="flex-wrap gap-2">
            {(["prompt_injection","data_exfiltration","unsafe_action","memory_poisoning"] as RedTeamResult["attackVector"][]).map((v) => (
              <Button key={v} variant="outline" onClick={() => redteamOpen && runRedTeam(redteamOpen, v)}>{v}</Button>
            ))}
            <Button variant="ghost" onClick={() => setRedteamOpen(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kill switch */}
      <Dialog open={ksOpen !== null} onOpenChange={(o) => !o && setKsOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Activate kill switch</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div>Activate kill switch for <span className="font-mono">{ksOpen?.provider}/{ksOpen?.model}</span>?</div>
            <div className="text-xs text-muted-foreground">
              Pauses live worker sessions, suspends bound workers, and opens an operations task. Restoration requires a
              different actor.
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Reason (required)</label>
              <Textarea value={ksReason} onChange={(e) => setKsReason(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setKsOpen(null)}>Cancel</Button>
            <Button onClick={activateKillSwitch} disabled={!ksReason.trim()}>
              <ShieldAlert className="h-4 w-4 mr-1.5" /> Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Compare model versions</DialogTitle></DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-2">Field</th>
                  {compareIds.map((id) => {
                    const m = models.find((x) => x.id === id);
                    return <th key={id} className="py-2 pr-2 font-mono text-xs">{m ? `${m.provider}/${m.model}@${m.version}` : id}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {([
                  ["Status", (m: ModelEntry) => m.status],
                  ["Data class", (m: ModelEntry) => m.dataClassification],
                  ["Residency", (m: ModelEntry) => m.residency.toUpperCase()],
                  ["Approved use cases", (m: ModelEntry) => m.approvedUseCaseIds.join(", ") || "—"],
                  ["$/1k tok", (m: ModelEntry) => `$${m.costPerKTokUsd.toFixed(2)}`],
                  ["P95 latency", (m: ModelEntry) => `${m.latencyP95Ms} ms`],
                  ["Prompt", (m: ModelEntry) => m.promptVersionId ?? "—"],
                  ["Retrieval", (m: ModelEntry) => m.retrievalScope.join(", ") || "—"],
                  ["Latest eval", (m: ModelEntry) => {
                    const ev = evals.find((e) => e.id === m.latestEvalId);
                    return ev ? `${ev.id} · ${ev.overallPass ? "pass" : "fail"}` : "—";
                  }],
                ] as [string, (m: ModelEntry) => string][]).map(([label, get]) => (
                  <tr key={label} className="border-t border-border">
                    <td className="py-2 pr-2 text-xs font-medium">{label}</td>
                    {compareIds.map((id) => {
                      const m = models.find((x) => x.id === id);
                      return <td key={id} className="py-2 pr-2 text-xs">{m ? get(m) : "—"}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCompareOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change routing */}
      <Dialog open={routingOpen !== null} onOpenChange={(o) => !o && setRoutingOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change routing</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="text-xs text-muted-foreground">Rule: {routingOpen?.name}</div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Primary model</label>
              <Select value={routingDraft.primaryModelId} onValueChange={(v) => setRoutingDraft({ ...routingDraft, primaryModelId: v })}>
                <SelectTrigger><SelectValue placeholder="Choose model" /></SelectTrigger>
                <SelectContent>
                  {models.filter((m) => m.status === "Approved").map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.provider}/{m.model}@{m.version}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Fallback model (optional)</label>
              <Select value={routingDraft.fallbackModelId} onValueChange={(v) => setRoutingDraft({ ...routingDraft, fallbackModelId: v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {models.filter((m) => m.status === "Approved").map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.provider}/{m.model}@{m.version}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Apply to</label>
              <Select value={routingDraft.apply} onValueChange={(v) => setRoutingDraft({ ...routingDraft, apply: v as "future" | "now" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="future">Future sessions only</SelectItem>
                  <SelectItem value="now">Existing + future (pauses live sessions to re-bind)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRoutingOpen(null)}>Cancel</Button>
            <Button onClick={changeRouting}>Save routing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
