/**
 * Page 45 · Integration & Connector Hub
 * Route: /runops/integrations
 *
 * Manages connections to enterprise systems and exposes connector health
 * to operational workflows. Credentials are never rendered — only secret
 * references and rotation state. Health is deterministic in Demo Mode
 * (seeded from tenant + scenario).
 *
 * Persistence (localStorage):
 *   runops.integrations.connectors.v1     → Connector[]
 *   runops.integrations.custom.v1         → CustomConnector[]
 *   runops.integrations.dlq.v1            → DlqEvent[]
 *   runops.integrations.field_maps.v1     → FieldMap[]
 *   runops.integrations.logs.v1           → ConnectorLog[]
 *   runops.audit.events.v1                → audit stream
 *   runops.domain.events.v1               → domain event stream
 *   runops.launch.restrictions.v1         → Launch Center cross-screen
 *   runops.step.permissions.v1            → Step Builder cross-screen
 *   runops.operations.queue.tasks.v1      → Operations Queue cross-screen
 *   runops.platform.health.v1             → Platform Health cross-screen
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowUpCircle, Ban, CheckCircle2, Filter,
  KeyRound, Link2, Plug, PlugZap, PlusCircle, RefreshCw, Rewind,
  Search, Settings, Sparkles, TestTube2,
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

/* -------------------------------- Types --------------------------------- */

type Category =
  | "itsm" | "observability" | "cloud" | "kubernetes" | "network"
  | "database" | "identity" | "security" | "endpoint" | "backup"
  | "collaboration" | "cicd" | "event_streaming" | "rpa" | "mcp";

type Env = "dev" | "staging" | "prod";
type Health = "Healthy" | "Degraded" | "Unavailable" | "Authentication expired" | "Rate limited" | "Upgrade required" | "Testing";
type AuthType = "oauth2" | "api_key" | "mtls" | "iam_role" | "basic" | "webhook_signed";

interface Connector {
  id: string;                    // CN-XXXX
  name: string;
  category: Category;
  owner: string;
  environments: Env[];
  authType: AuthType;
  secretRef: string | null;      // reference only — never a value
  health: Health;
  version: string;
  schemaVersion: string;
  rateLimitPerMin: number;
  lastActivityAt: string;
  errorRatePct: number;          // 0..100
  retryState: "idle" | "backoff" | "circuit_open";
  dataFreshnessSec: number;
  dependentRunbookIds: string[];
  dependentWorkerIds: string[];
  enabled: boolean;
  createdAt: string;
  builtin: boolean;
}

interface CustomConnector {
  id: string;                    // CC-XXXX
  name: string;
  baseUrl: string;
  authType: AuthType;
  category: Category;
  createdBy: string;
  createdAt: string;
  status: "draft" | "review" | "approved";
}

interface DlqEvent {
  id: string;                    // DLQ-XXXX
  connectorId: string;
  operation: string;
  attemptedAt: string;
  attempts: number;
  reason: string;
  payloadDigest: string;
  state: "pending" | "replaying" | "resolved" | "dropped";
}

interface FieldMap {
  id: string;                    // FM-XXXX
  connectorId: string;
  source: string;
  target: string;
  transform: string;
  updatedAt: string;
}

interface ConnectorLog {
  id: string;
  connectorId: string;
  at: string;
  level: "info" | "warn" | "error";
  message: string;
}

type Tab = "registry" | "health" | "dlq" | "custom" | "logs";

/* ---------------------------- Keys / constants -------------------------- */

const K_CONN = "runops.integrations.connectors.v1";
const K_CUSTOM = "runops.integrations.custom.v1";
const K_DLQ = "runops.integrations.dlq.v1";
const K_FMAP = "runops.integrations.field_maps.v1";
const K_LOGS = "runops.integrations.logs.v1";
const K_AUD = "runops.audit.events.v1";
const K_DOM = "runops.domain.events.v1";
const K_LAUNCH = "runops.launch.restrictions.v1";
const K_STEP = "runops.step.permissions.v1";
const K_OPS = "runops.operations.queue.tasks.v1";
const K_PLAT = "runops.platform.health.v1";

const CATEGORY_LABEL: Record<Category, string> = {
  itsm: "ITSM",
  observability: "Observability",
  cloud: "Cloud",
  kubernetes: "Kubernetes",
  network: "Network",
  database: "Database",
  identity: "Identity",
  security: "Security",
  endpoint: "Endpoint",
  backup: "Backup",
  collaboration: "Collaboration",
  cicd: "CI / CD",
  event_streaming: "Event Streaming",
  rpa: "RPA",
  mcp: "MCP Tools",
};

const HEALTH_STATES: readonly Health[] = [
  "Healthy", "Degraded", "Unavailable", "Authentication expired",
  "Rate limited", "Upgrade required", "Testing",
] as const;

const AI_RECOMMENDATION = {
  id: "REC-INT-1",
  title: "Rotate ServiceNow credentials before nightly change window",
  conclusion:
    "ServiceNow ITSM connector shows Authentication expired with rising 401 rates. Rotating the OAuth client secret via the server-side workflow before 23:00 UTC prevents change-record sync failure during the nightly emergency change window.",
  confidence: 82,
  uncertainty:
    "Rotation could briefly interrupt in-flight change syncs (est. 30–90s). Historical rotations completed within 45s (n=6).",
  supportingEvidence: [
    "9 of the last 12 requests to /now/table/change_request returned HTTP 401.",
    "Access token issued 92 days ago; provider policy expires at 90 days.",
    "3 runbooks in the emergency change catalog depend on this connector.",
  ],
  contradictoryEvidence: [
    "Health-check endpoint /now/ping still returns 200 (cache-served up to 5 minutes).",
  ],
  sources: [
    "connector://servicenow-prod (last activity, error rate)",
    "audit://runops.audit.events (rotation history for CN-1001)",
    "policy://identity/rotation-cadence-90d",
  ],
};

/* ------------------------------ Time helpers ---------------------------- */

const now = () => new Date().toISOString();
const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();
const inDays = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();

/* --------------------------- Deterministic seed ------------------------- */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

function seededHealth(name: string, scenario: string): Health {
  const h = hash(`${name}::${scenario}`);
  const bucket = h % 100;
  // deterministic distribution biased to Healthy
  if (bucket < 55) return "Healthy";
  if (bucket < 70) return "Degraded";
  if (bucket < 78) return "Rate limited";
  if (bucket < 85) return "Authentication expired";
  if (bucket < 92) return "Upgrade required";
  if (bucket < 97) return "Unavailable";
  return "Testing";
}

function seedConnectors(scenario: string): Connector[] {
  const rows: Array<Omit<Connector, "health" | "createdAt" | "lastActivityAt" | "errorRatePct" | "dataFreshnessSec" | "retryState">> = [
    { id: "CN-1001", name: "servicenow-prod", category: "itsm", owner: "sre-platform",
      environments: ["prod","staging"], authType: "oauth2", secretRef: "SR::SNOW_OAUTH_CLIENT",
      version: "24.2.1", schemaVersion: "v1", rateLimitPerMin: 600,
      dependentRunbookIds: ["RB-1001","RB-1004","RB-1010"], dependentWorkerIds: ["W-nova-triage"],
      enabled: true, builtin: true },
    { id: "CN-1002", name: "pagerduty", category: "observability", owner: "sre-platform",
      environments: ["prod","staging","dev"], authType: "api_key", secretRef: "SR::PD_TOKEN",
      version: "2.1.4", schemaVersion: "v2", rateLimitPerMin: 1200,
      dependentRunbookIds: ["RB-1002"], dependentWorkerIds: ["W-nova-triage","W-atlas-alerts"],
      enabled: true, builtin: true },
    { id: "CN-1003", name: "datadog", category: "observability", owner: "observability-eng",
      environments: ["prod","staging"], authType: "api_key", secretRef: "SR::DD_API_KEY",
      version: "7.55", schemaVersion: "v1", rateLimitPerMin: 3000,
      dependentRunbookIds: ["RB-1003","RB-1007"], dependentWorkerIds: ["W-atlas-alerts"],
      enabled: true, builtin: true },
    { id: "CN-1004", name: "aws-control-plane", category: "cloud", owner: "cloud-platform",
      environments: ["prod","staging","dev"], authType: "iam_role", secretRef: null,
      version: "sdk-3.635", schemaVersion: "v1", rateLimitPerMin: 5000,
      dependentRunbookIds: ["RB-1005","RB-1009"], dependentWorkerIds: ["W-cirrus-cloud"],
      enabled: true, builtin: true },
    { id: "CN-1005", name: "eks-prod-us", category: "kubernetes", owner: "cloud-platform",
      environments: ["prod"], authType: "mtls", secretRef: "SR::EKS_CLIENT_CERT",
      version: "1.29", schemaVersion: "v1", rateLimitPerMin: 2000,
      dependentRunbookIds: ["RB-1006"], dependentWorkerIds: ["W-cirrus-cloud"],
      enabled: true, builtin: true },
    { id: "CN-1006", name: "cisco-nx-fabric", category: "network", owner: "network-eng",
      environments: ["prod"], authType: "basic", secretRef: "SR::NX_ADMIN",
      version: "9.3(11)", schemaVersion: "v1", rateLimitPerMin: 60,
      dependentRunbookIds: ["RB-1008"], dependentWorkerIds: [],
      enabled: true, builtin: true },
    { id: "CN-1007", name: "postgres-payments", category: "database", owner: "payments-eng",
      environments: ["prod","staging"], authType: "mtls", secretRef: "SR::PG_CLIENT",
      version: "16.3", schemaVersion: "v1", rateLimitPerMin: 300,
      dependentRunbookIds: ["RB-1011"], dependentWorkerIds: [],
      enabled: true, builtin: true },
    { id: "CN-1008", name: "okta-idp", category: "identity", owner: "identity-eng",
      environments: ["prod","staging"], authType: "oauth2", secretRef: "SR::OKTA_OAUTH",
      version: "2024.08", schemaVersion: "v1", rateLimitPerMin: 400,
      dependentRunbookIds: [], dependentWorkerIds: ["W-atlas-alerts"],
      enabled: true, builtin: true },
    { id: "CN-1009", name: "crowdstrike-falcon", category: "security", owner: "security-eng",
      environments: ["prod"], authType: "oauth2", secretRef: "SR::CS_OAUTH",
      version: "6.58", schemaVersion: "v1", rateLimitPerMin: 500,
      dependentRunbookIds: ["RB-1012"], dependentWorkerIds: [],
      enabled: true, builtin: true },
    { id: "CN-1010", name: "intune-endpoint", category: "endpoint", owner: "endpoint-eng",
      environments: ["prod"], authType: "oauth2", secretRef: "SR::INTUNE_OAUTH",
      version: "2024.09", schemaVersion: "v1", rateLimitPerMin: 300,
      dependentRunbookIds: [], dependentWorkerIds: [],
      enabled: true, builtin: true },
    { id: "CN-1011", name: "veeam-backup", category: "backup", owner: "infra-eng",
      environments: ["prod"], authType: "api_key", secretRef: "SR::VEEAM_TOKEN",
      version: "12.1", schemaVersion: "v1", rateLimitPerMin: 120,
      dependentRunbookIds: ["RB-1013"], dependentWorkerIds: [],
      enabled: true, builtin: true },
    { id: "CN-1012", name: "slack-runops", category: "collaboration", owner: "sre-platform",
      environments: ["prod","staging","dev"], authType: "oauth2", secretRef: "SR::SLACK_OAUTH",
      version: "web-api", schemaVersion: "v1", rateLimitPerMin: 200,
      dependentRunbookIds: [], dependentWorkerIds: ["W-nova-triage"],
      enabled: true, builtin: true },
    { id: "CN-1013", name: "github-actions", category: "cicd", owner: "devx-eng",
      environments: ["prod","staging","dev"], authType: "oauth2", secretRef: "SR::GH_OAUTH",
      version: "api-2022-11-28", schemaVersion: "v1", rateLimitPerMin: 5000,
      dependentRunbookIds: ["RB-1014"], dependentWorkerIds: [],
      enabled: true, builtin: true },
    { id: "CN-1014", name: "kafka-events", category: "event_streaming", owner: "platform-eng",
      environments: ["prod","staging"], authType: "mtls", secretRef: "SR::KAFKA_CLIENT",
      version: "3.7", schemaVersion: "v1", rateLimitPerMin: 10000,
      dependentRunbookIds: [], dependentWorkerIds: ["W-atlas-alerts"],
      enabled: true, builtin: true },
    { id: "CN-1015", name: "uipath-orchestrator", category: "rpa", owner: "automation-eng",
      environments: ["prod","staging"], authType: "oauth2", secretRef: "SR::UIPATH_OAUTH",
      version: "2024.4", schemaVersion: "v1", rateLimitPerMin: 240,
      dependentRunbookIds: ["RB-1015"], dependentWorkerIds: [],
      enabled: true, builtin: true },
    { id: "CN-1016", name: "mcp-github-tools", category: "mcp", owner: "platform-ai",
      environments: ["prod","staging"], authType: "oauth2", secretRef: "SR::MCP_GH",
      version: "0.4.1", schemaVersion: "mcp/2025-06-18", rateLimitPerMin: 300,
      dependentRunbookIds: [], dependentWorkerIds: ["W-nova-triage"],
      enabled: true, builtin: true },
    { id: "CN-1017", name: "mcp-jira-tools", category: "mcp", owner: "platform-ai",
      environments: ["prod","staging"], authType: "oauth2", secretRef: "SR::MCP_JIRA",
      version: "0.3.2", schemaVersion: "mcp/2025-06-18", rateLimitPerMin: 200,
      dependentRunbookIds: [], dependentWorkerIds: ["W-nova-triage"],
      enabled: true, builtin: true },
  ];
  return rows.map((r) => {
    const health = seededHealth(r.name, scenario);
    const errH = hash(`err::${r.name}::${scenario}`) % 1000;
    const fresh = hash(`fresh::${r.name}::${scenario}`) % 900;
    const errorRatePct = health === "Healthy" ? errH / 500 : health === "Degraded" ? 3 + (errH / 200) : health === "Rate limited" ? 8 + (errH / 200) : health === "Unavailable" ? 100 : health === "Authentication expired" ? 40 + (errH / 40) : 2;
    const retryState: Connector["retryState"] =
      health === "Unavailable" ? "circuit_open" : health === "Rate limited" || health === "Degraded" ? "backoff" : "idle";
    return {
      ...r,
      health,
      errorRatePct: Math.round(errorRatePct * 10) / 10,
      dataFreshnessSec: 5 + fresh,
      retryState,
      lastActivityAt: inHours(-((hash(r.name) % 12) + 1) / 6),
      createdAt: inDays(-(hash(r.name) % 400) - 30),
    };
  });
}

function seedDlq(): DlqEvent[] {
  return [
    { id: "DLQ-2001", connectorId: "CN-1001", operation: "table.change_request.upsert",
      attemptedAt: inHours(-2), attempts: 5, reason: "HTTP 401 Unauthorized",
      payloadDigest: "sha256:d8…c1", state: "pending" },
    { id: "DLQ-2002", connectorId: "CN-1002", operation: "incidents.create",
      attemptedAt: inHours(-6), attempts: 3, reason: "429 rate_limited",
      payloadDigest: "sha256:a4…9f", state: "pending" },
    { id: "DLQ-2003", connectorId: "CN-1006", operation: "interface.acl.update",
      attemptedAt: inDays(-1), attempts: 2, reason: "socket timeout",
      payloadDigest: "sha256:71…22", state: "pending" },
  ];
}

function seedFieldMaps(): FieldMap[] {
  return [
    { id: "FM-3001", connectorId: "CN-1001", source: "runops.incident.id", target: "sn.change_request.correlation_id",
      transform: "identity", updatedAt: inDays(-14) },
    { id: "FM-3002", connectorId: "CN-1002", source: "runops.service.name", target: "pd.service.name",
      transform: "lowercase", updatedAt: inDays(-30) },
    { id: "FM-3003", connectorId: "CN-1003", source: "runops.execution.id", target: "dd.tags.execution",
      transform: "prefix:exec-", updatedAt: inDays(-7) },
  ];
}

function seedLogs(connectors: Connector[]): ConnectorLog[] {
  const logs: ConnectorLog[] = [];
  for (const c of connectors.slice(0, 6)) {
    const seed = hash(c.id);
    logs.push({
      id: `LOG-${seed % 10000}-1`, connectorId: c.id, at: inHours(-1),
      level: c.health === "Healthy" ? "info" : c.health === "Unavailable" ? "error" : "warn",
      message: `${c.name}: ${c.health.toLowerCase()} — retryState=${c.retryState}`,
    });
    logs.push({
      id: `LOG-${seed % 10000}-2`, connectorId: c.id, at: inHours(-3),
      level: "info", message: `${c.name}: schema=${c.schemaVersion} version=${c.version}`,
    });
  }
  return logs;
}

/* ------------------------------ Storage --------------------------------- */

function loadOr<T>(key: string, fallback: () => T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback();
    return JSON.parse(raw) as T;
  } catch { return fallback(); }
}
function save<T>(key: string, v: T): void {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
}

interface AuditEvent { id: string; at: string; kind: string; actor: string; target: string; detail: Record<string, string | number | boolean | string[] | null>; }
interface DomainEvent { id: string; at: string; kind: string; payload: Record<string, string | number | boolean | string[] | null>; }

function appendEvents(auditKind: string, actor: string, target: string, detail: AuditEvent["detail"], domainKind: string, payload: DomainEvent["payload"]): void {
  const aud = loadOr<AuditEvent[]>(K_AUD, () => []);
  const dom = loadOr<DomainEvent[]>(K_DOM, () => []);
  aud.unshift({ id: `AUD-${Date.now()}-${Math.floor(Math.random()*1e4)}`, at: now(), kind: auditKind, actor, target, detail });
  dom.unshift({ id: `DOM-${Date.now()}-${Math.floor(Math.random()*1e4)}`, at: now(), kind: domainKind, payload });
  save(K_AUD, aud.slice(0, 500));
  save(K_DOM, dom.slice(0, 500));
}

/* ------------------------------ Tone maps ------------------------------- */

function healthTone(h: Health): string {
  switch (h) {
    case "Healthy":                 return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "Degraded":                return "border-amber-200 bg-amber-50 text-amber-800";
    case "Unavailable":             return "border-red-200 bg-red-50 text-red-800";
    case "Authentication expired":  return "border-orange-200 bg-orange-50 text-orange-800";
    case "Rate limited":            return "border-amber-200 bg-amber-50 text-amber-800";
    case "Upgrade required":        return "border-blue-200 bg-blue-50 text-blue-800";
    case "Testing":                 return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

/* ------------------------------- Component ------------------------------ */

export default function IntegrationHub() {
  const ops = useOperations();
  const scenario = (ops as unknown as { scenario?: string }).scenario ?? "baseline";
  const role = (ops as unknown as { role?: string }).role ?? "sre-operator";
  const actor = String(role);

  const [connectors, setConnectors] = useState<Connector[]>(() =>
    loadOr<Connector[]>(K_CONN, () => seedConnectors(scenario)));
  const [customs, setCustoms] = useState<CustomConnector[]>(() =>
    loadOr<CustomConnector[]>(K_CUSTOM, () => []));
  const [dlq, setDlq] = useState<DlqEvent[]>(() =>
    loadOr<DlqEvent[]>(K_DLQ, () => seedDlq()));
  const [fieldMaps, setFieldMaps] = useState<FieldMap[]>(() =>
    loadOr<FieldMap[]>(K_FMAP, () => seedFieldMaps()));
  const [logs, setLogs] = useState<ConnectorLog[]>(() =>
    loadOr<ConnectorLog[]>(K_LOGS, () => seedLogs(seedConnectors(scenario))));

  useEffect(() => { save(K_CONN, connectors); }, [connectors]);
  useEffect(() => { save(K_CUSTOM, customs); }, [customs]);
  useEffect(() => { save(K_DLQ, dlq); }, [dlq]);
  useEffect(() => { save(K_FMAP, fieldMaps); }, [fieldMaps]);
  useEffect(() => { save(K_LOGS, logs.slice(0, 200)); }, [logs]);

  /* --- Cross-screen propagation on every render of connectors --- */
  useEffect(() => {
    const failing = connectors.filter((c) => !c.enabled || c.health === "Unavailable" || c.health === "Authentication expired");
    const runbookRestrictions = failing.flatMap((c) => c.dependentRunbookIds.map((rb) => ({
      runbookId: rb, reason: `Connector ${c.name} is ${c.enabled ? c.health : "disabled"}.`, connectorId: c.id,
    })));
    const stepPerms = failing.flatMap((c) => c.dependentRunbookIds.map((rb) => ({
      runbookId: rb, connectorId: c.id, permit: false, reason: c.health,
    })));
    const platformHealth = connectors.map((c) => ({
      component: `connector:${c.name}`, category: c.category, health: c.enabled ? c.health : "Unavailable", errorRatePct: c.errorRatePct,
    }));
    save(K_LAUNCH, runbookRestrictions);
    save(K_STEP, stepPerms);
    save(K_PLAT, platformHealth);
  }, [connectors]);

  /* ------------------------ Filter & search state ------------------------ */

  const [tab, setTab] = useState<Tab>("registry");
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<Category | "all">("all");
  const [healthFilter, setHealthFilter] = useState<Health | "all">("all");
  const [envFilter, setEnvFilter] = useState<Env | "all">("all");
  const [sortKey, setSortKey] = useState<"name" | "category" | "health" | "errorRatePct" | "dataFreshnessSec">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    const rows = connectors.filter((c) => {
      if (catFilter !== "all" && c.category !== catFilter) return false;
      if (healthFilter !== "all" && c.health !== healthFilter) return false;
      if (envFilter !== "all" && !c.environments.includes(envFilter)) return false;
      if (!qn) return true;
      return c.name.toLowerCase().includes(qn) || c.owner.toLowerCase().includes(qn) || c.id.toLowerCase().includes(qn);
    });
    rows.sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [connectors, q, catFilter, healthFilter, envFilter, sortKey, sortDir]);

  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => { setPage(0); }, [q, catFilter, healthFilter, envFilter]);

  /* --------------------------- Dialog state ------------------------------ */

  type DialogKind =
    | { kind: "none" }
    | { kind: "add" }
    | { kind: "configure"; id: string }
    | { kind: "test"; id: string; result?: { ok: boolean; latencyMs: number; message: string } }
    | { kind: "rotate"; id: string }
    | { kind: "mapFields"; id: string }
    | { kind: "dependencies"; id: string }
    | { kind: "custom" }
    | { kind: "dlqReplay"; id: string }
    | { kind: "aiRec" };

  const [dialog, setDialog] = useState<DialogKind>({ kind: "none" });

  /* --------------------------- Mutations --------------------------------- */

  const updateConnector = useCallback((id: string, patch: Partial<Connector>, auditKind: string, domainKind: string) => {
    setConnectors((prev) => prev.map((c) => c.id === id ? { ...c, ...patch } : c));
    const target = connectors.find((c) => c.id === id);
    appendEvents(auditKind, actor, `connector:${id}`,
      { connectorId: id, name: target?.name ?? id, patchKeys: Object.keys(patch) },
      domainKind, { connectorId: id, ...patch });
  }, [actor, connectors]);

  const runTest = useCallback((id: string) => {
    const c = connectors.find((x) => x.id === id);
    if (!c) return;
    // deterministic simulated result
    const seed = hash(`test::${c.name}::${scenario}::${Date.now() % 5}`);
    const latencyMs = 40 + (seed % 400);
    const ok = c.health === "Healthy" || c.health === "Degraded";
    const message = ok ? `${c.name} responded OK in ${latencyMs}ms` : `${c.name}: ${c.health}`;
    updateConnector(id, { health: c.health === "Testing" ? "Healthy" : c.health, lastActivityAt: now() },
      "connector.test", "ConnectorTested");
    setLogs((prev) => [{ id: `LOG-${Date.now()}`, connectorId: id, at: now(),
      level: ok ? "info" : "warn", message }, ...prev].slice(0, 200));
    setDialog({ kind: "test", id, result: { ok, latencyMs, message } });
  }, [connectors, scenario, updateConnector]);

  const enable = useCallback((id: string, v: boolean) => {
    updateConnector(id, { enabled: v, health: v ? "Testing" : "Unavailable" },
      v ? "connector.enable" : "connector.disable", v ? "ConnectorEnabled" : "ConnectorDisabled");
  }, [updateConnector]);

  const upgrade = useCallback((id: string) => {
    const c = connectors.find((x) => x.id === id); if (!c) return;
    const [maj, min] = c.version.split(".").map((s) => parseInt(s, 10));
    const nextV = Number.isFinite(maj) && Number.isFinite(min) ? `${maj}.${min + 1}` : `${c.version}-next`;
    updateConnector(id, { version: nextV, health: "Testing" }, "connector.upgrade", "ConnectorUpgraded");
  }, [connectors, updateConnector]);

  const rotate = useCallback((id: string) => {
    const c = connectors.find((x) => x.id === id); if (!c) return;
    // secret value never touches the client; server-side workflow is simulated
    updateConnector(id, { health: "Testing" }, "connector.rotate_secret", "SecretRotationRequested");
    setTimeout(() => {
      updateConnector(id, { health: "Healthy" }, "connector.rotate_secret_complete", "SecretRotationCompleted");
    }, 800);
    setDialog({ kind: "none" });
  }, [connectors, updateConnector]);

  const replayDlq = useCallback((id: string) => {
    setDlq((prev) => prev.map((e) => e.id === id ? { ...e, state: "replaying" } : e));
    const ev = dlq.find((e) => e.id === id);
    appendEvents("dlq.replay", actor, `dlq:${id}`,
      { dlqId: id, connectorId: ev?.connectorId ?? "" },
      "DlqReplayRequested", { dlqId: id, connectorId: ev?.connectorId ?? "" });
    // enqueue a follow-up task in the Operations Queue
    const opsTasks = loadOr<Array<{ id: string; kind: string; at: string; ref: string }>>(K_OPS, () => []);
    opsTasks.unshift({ id: `OPS-DLQ-${Date.now()}`, kind: "dlq.replay", at: now(), ref: id });
    save(K_OPS, opsTasks.slice(0, 200));
    setTimeout(() => {
      setDlq((prev) => prev.map((e) => e.id === id ? { ...e, state: "resolved" } : e));
      appendEvents("dlq.replay_complete", actor, `dlq:${id}`, { dlqId: id }, "DlqReplayCompleted", { dlqId: id });
    }, 900);
    setDialog({ kind: "none" });
  }, [actor, dlq]);

  /* ------------------------ Add / custom connector ---------------------- */

  const [addName, setAddName] = useState("");
  const [addCategory, setAddCategory] = useState<Category>("observability");
  const [addOwner, setAddOwner] = useState("");
  const [addAuth, setAddAuth] = useState<AuthType>("oauth2");

  const submitAdd = () => {
    if (!addName.trim() || !addOwner.trim()) return;
    const c: Connector = {
      id: `CN-${9000 + connectors.length}`,
      name: addName.trim(),
      category: addCategory,
      owner: addOwner.trim(),
      environments: ["staging"],
      authType: addAuth,
      secretRef: null,
      health: "Testing",
      version: "0.1.0",
      schemaVersion: "v1",
      rateLimitPerMin: 60,
      lastActivityAt: now(),
      errorRatePct: 0,
      retryState: "idle",
      dataFreshnessSec: 0,
      dependentRunbookIds: [],
      dependentWorkerIds: [],
      enabled: false,
      createdAt: now(),
      builtin: false,
    };
    setConnectors((prev) => [c, ...prev]);
    appendEvents("connector.create", actor, `connector:${c.id}`,
      { connectorId: c.id, name: c.name, category: c.category },
      "ConnectorCreated", { connectorId: c.id, name: c.name });
    setAddName(""); setAddOwner("");
    setDialog({ kind: "none" });
  };

  const [ccName, setCcName] = useState("");
  const [ccUrl, setCcUrl] = useState("");
  const [ccCat, setCcCat] = useState<Category>("observability");
  const [ccAuth, setCcAuth] = useState<AuthType>("api_key");

  const submitCustom = () => {
    if (!ccName.trim() || !ccUrl.trim()) return;
    const cc: CustomConnector = {
      id: `CC-${5000 + customs.length}`,
      name: ccName.trim(), baseUrl: ccUrl.trim(),
      authType: ccAuth, category: ccCat, createdBy: actor,
      createdAt: now(), status: "draft",
    };
    setCustoms((prev) => [cc, ...prev]);
    appendEvents("custom_connector.create", actor, `custom:${cc.id}`,
      { customId: cc.id, name: cc.name, baseUrl: cc.baseUrl },
      "CustomConnectorCreated", { customId: cc.id, name: cc.name });
    setCcName(""); setCcUrl("");
    setDialog({ kind: "none" });
  };

  /* ---------------------------- Field mapping --------------------------- */

  const [fmSrc, setFmSrc] = useState("");
  const [fmTgt, setFmTgt] = useState("");
  const [fmTx, setFmTx] = useState("identity");

  const submitFieldMap = (connectorId: string) => {
    if (!fmSrc.trim() || !fmTgt.trim()) return;
    const fm: FieldMap = {
      id: `FM-${4000 + fieldMaps.length}`,
      connectorId, source: fmSrc.trim(), target: fmTgt.trim(),
      transform: fmTx.trim() || "identity", updatedAt: now(),
    };
    setFieldMaps((prev) => [fm, ...prev]);
    appendEvents("connector.map_fields", actor, `connector:${connectorId}`,
      { connectorId, source: fm.source, target: fm.target, transform: fm.transform },
      "FieldMappingUpdated", { connectorId, source: fm.source, target: fm.target });
    setFmSrc(""); setFmTgt(""); setFmTx("identity");
  };

  /* ------------------------------ Render -------------------------------- */

  const openConnector = (id: string): Connector | undefined => connectors.find((c) => c.id === id);
  const openCustom = (id: string): CustomConnector | undefined => customs.find((c) => c.id === id);

  const dlgConnector = dialog.kind === "configure" || dialog.kind === "test" || dialog.kind === "rotate" || dialog.kind === "mapFields" || dialog.kind === "dependencies"
    ? openConnector(dialog.id) : undefined;

  const dlqRow = dialog.kind === "dlqReplay" ? dlq.find((e) => e.id === dialog.id) : undefined;

  const healthSummary = useMemo(() => {
    const counts: Record<Health, number> = {
      "Healthy": 0, "Degraded": 0, "Unavailable": 0, "Authentication expired": 0,
      "Rate limited": 0, "Upgrade required": 0, "Testing": 0,
    };
    for (const c of connectors) counts[c.enabled ? c.health : "Unavailable"] += 1;
    return counts;
  }, [connectors]);

  return (
    <div className="space-y-6 p-6">
      <EntityHeader
        eyebrow="Platform"
        title="Integration & Connector Hub"
        subtitle="Manage enterprise system connections. Health is visible across Launch Center, Step Builder, Operations Queue, and Platform Health. Credentials are references only — rotation runs server-side."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setDialog({ kind: "aiRec" })}>
              <Sparkles className="mr-2 h-4 w-4" /> AI recommendation
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog({ kind: "custom" })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Custom connector
            </Button>
            <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
              <Plug className="mr-2 h-4 w-4" /> Add connector
            </Button>
          </div>
        }
      />

      {/* Health summary cards */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
        {HEALTH_STATES.map((h) => (
          <Card key={h} className="border-slate-200">
            <CardContent className="p-3">
              <div className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium", healthTone(h))}>
                {h}
              </div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{healthSummary[h]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList aria-label="Integration hub sections">
          <TabsTrigger value="registry">Registry</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="dlq">Dead Letter Queue</TabsTrigger>
          <TabsTrigger value="custom">Custom Connectors</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* ------------------------------ Registry ---------------------------- */}
        <TabsContent value="registry" className="space-y-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
                  <Input
                    aria-label="Search connectors"
                    className="h-8 w-56 pl-7 text-xs"
                    placeholder="Search name, owner, id"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <Select value={catFilter} onValueChange={(v) => setCatFilter(v as Category | "all")}>
                  <SelectTrigger className="h-8 w-40 text-xs" aria-label="Category filter">
                    <Filter className="mr-1 h-3.5 w-3.5" />
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                      <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={healthFilter} onValueChange={(v) => setHealthFilter(v as Health | "all")}>
                  <SelectTrigger className="h-8 w-40 text-xs" aria-label="Health filter">
                    <SelectValue placeholder="All health" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All health</SelectItem>
                    {HEALTH_STATES.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={envFilter} onValueChange={(v) => setEnvFilter(v as Env | "all")}>
                  <SelectTrigger className="h-8 w-32 text-xs" aria-label="Environment filter">
                    <SelectValue placeholder="All envs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All environments</SelectItem>
                    <SelectItem value="prod">prod</SelectItem>
                    <SelectItem value="staging">staging</SelectItem>
                    <SelectItem value="dev">dev</SelectItem>
                  </SelectContent>
                </Select>
                <div className="ml-auto text-[11px] text-slate-500">
                  {filtered.length} of {connectors.length} connectors
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                    <tr>
                      {([
                        ["name","Name"],["category","Category"],["health","Health"],
                        ["errorRatePct","Err %"],["dataFreshnessSec","Freshness"],
                      ] as const).map(([k, label]) => (
                        <th key={k} className="px-3 py-2">
                          <button
                            className="inline-flex items-center gap-1 hover:text-slate-900"
                            onClick={() => {
                              if (sortKey === k) setSortDir((d) => d === "asc" ? "desc" : "asc");
                              else { setSortKey(k); setSortDir("asc"); }
                            }}
                            aria-label={`Sort by ${label}`}
                          >
                            {label}{sortKey === k ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                          </button>
                        </th>
                      ))}
                      <th className="px-3 py-2">Owner</th>
                      <th className="px-3 py-2">Env</th>
                      <th className="px-3 py-2">Auth</th>
                      <th className="px-3 py-2">Version</th>
                      <th className="px-3 py-2">Rate/min</th>
                      <th className="px-3 py-2">Retry</th>
                      <th className="px-3 py-2">Last activity</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 && (
                      <tr><td colSpan={12} className="px-3 py-8 text-center text-slate-500">
                        No connectors match these filters.
                      </td></tr>
                    )}
                    {pageRows.map((c) => (
                      <tr key={c.id} className="border-t border-slate-100">
                        <td className="px-3 py-2">
                          <div className="font-medium text-slate-900">{c.name}</div>
                          <div className="text-[10px] text-slate-500">{c.id}</div>
                        </td>
                        <td className="px-3 py-2 text-slate-700">{CATEGORY_LABEL[c.category]}</td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={cn("text-[10px]", healthTone(c.enabled ? c.health : "Unavailable"))}>
                            {c.enabled ? c.health : "Disabled"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 tabular-nums text-slate-700">{c.errorRatePct.toFixed(1)}%</td>
                        <td className="px-3 py-2 tabular-nums text-slate-700">{c.dataFreshnessSec}s</td>
                        <td className="px-3 py-2 text-slate-700">{c.owner}</td>
                        <td className="px-3 py-2 text-slate-700">{c.environments.join(", ")}</td>
                        <td className="px-3 py-2 text-slate-700">{c.authType}</td>
                        <td className="px-3 py-2 text-slate-700">{c.version}</td>
                        <td className="px-3 py-2 tabular-nums text-slate-700">{c.rateLimitPerMin}</td>
                        <td className="px-3 py-2 text-slate-700">{c.retryState}</td>
                        <td className="px-3 py-2 text-slate-500">{new Date(c.lastActivityAt).toLocaleTimeString()}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setDialog({ kind: "configure", id: c.id })} title="Configure">
                              <Settings className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => runTest(c.id)} title="Test">
                              <TestTube2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm" variant="ghost"
                              onClick={() => enable(c.id, !c.enabled)}
                              title={c.enabled ? "Disable" : "Enable"}
                            >
                              {c.enabled ? <Ban className="h-3.5 w-3.5" /> : <PlugZap className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                              size="sm" variant="ghost"
                              onClick={() => upgrade(c.id)}
                              disabled={c.builtin === false}
                              title="Upgrade"
                            >
                              <ArrowUpCircle className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm" variant="ghost"
                              onClick={() => setDialog({ kind: "rotate", id: c.id })}
                              disabled={c.secretRef === null}
                              title={c.secretRef === null ? "No secret bound — nothing to rotate" : "Rotate credentials (server-side)"}
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setDialog({ kind: "mapFields", id: c.id })} title="Map fields">
                              <Link2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setDialog({ kind: "dependencies", id: c.id })} title="View dependencies">
                              <Activity className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 p-2 text-[11px] text-slate-600">
                <div>Page {page + 1} of {pageCount}</div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
                  <Button size="sm" variant="outline" disabled={page + 1 >= pageCount} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------------- Health ----------------------------- */}
        <TabsContent value="health" className="space-y-3">
          <Card><CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {connectors.map((c) => (
                <div key={c.id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-900">{c.name}</div>
                    <Badge variant="outline" className={cn("text-[10px]", healthTone(c.enabled ? c.health : "Unavailable"))}>
                      {c.enabled ? c.health : "Disabled"}
                    </Badge>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">{CATEGORY_LABEL[c.category]} · {c.owner}</div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-700">
                    <div><div className="text-slate-500">Error rate</div><div className="tabular-nums">{c.errorRatePct.toFixed(1)}%</div></div>
                    <div><div className="text-slate-500">Freshness</div><div className="tabular-nums">{c.dataFreshnessSec}s</div></div>
                    <div><div className="text-slate-500">Retry</div><div>{c.retryState}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* --------------------------------- DLQ ------------------------------ */}
        <TabsContent value="dlq" className="space-y-3">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Event</th>
                    <th className="px-3 py-2">Connector</th>
                    <th className="px-3 py-2">Operation</th>
                    <th className="px-3 py-2">Attempts</th>
                    <th className="px-3 py-2">Reason</th>
                    <th className="px-3 py-2">Payload</th>
                    <th className="px-3 py-2">State</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dlq.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-500">No failed events. </td></tr>}
                  {dlq.map((e) => {
                    const c = openConnector(e.connectorId);
                    return (
                      <tr key={e.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-mono text-[11px]">{e.id}</td>
                        <td className="px-3 py-2">{c?.name ?? e.connectorId}</td>
                        <td className="px-3 py-2">{e.operation}</td>
                        <td className="px-3 py-2 tabular-nums">{e.attempts}</td>
                        <td className="px-3 py-2 text-slate-700">{e.reason}</td>
                        <td className="px-3 py-2 font-mono text-[10px] text-slate-500">{e.payloadDigest}</td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={cn("text-[10px]",
                            e.state === "resolved" ? "border-emerald-200 bg-emerald-50 text-emerald-800" :
                            e.state === "replaying" ? "border-blue-200 bg-blue-50 text-blue-800" :
                            e.state === "dropped" ? "border-slate-200 bg-slate-50 text-slate-700" :
                            "border-amber-200 bg-amber-50 text-amber-800"
                          )}>{e.state}</Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Button
                            size="sm" variant="ghost"
                            disabled={e.state !== "pending"}
                            onClick={() => setDialog({ kind: "dlqReplay", id: e.id })}
                            title={e.state === "pending" ? "Replay this event" : "Not replayable in this state"}
                          >
                            <Rewind className="mr-1 h-3.5 w-3.5" /> Replay
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------- Custom ------------------------------ */}
        <TabsContent value="custom" className="space-y-3">
          <Card><CardContent className="p-4">
            {customs.length === 0 ? (
              <div className="text-sm text-slate-600">
                No custom connectors yet. Use <em>Custom connector</em> in the header to define one.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Base URL</th>
                    <th className="px-3 py-2">Auth</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Created by</th>
                  </tr>
                </thead>
                <tbody>
                  {customs.map((c) => (
                    <tr key={c.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-medium">{c.name}</td>
                      <td className="px-3 py-2">{CATEGORY_LABEL[c.category]}</td>
                      <td className="px-3 py-2 font-mono text-[10px]">{c.baseUrl}</td>
                      <td className="px-3 py-2">{c.authType}</td>
                      <td className="px-3 py-2">{c.status}</td>
                      <td className="px-3 py-2">{c.createdBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* ----------------------------- Logs ------------------------------ */}
        <TabsContent value="logs" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">At</th>
                  <th className="px-3 py-2">Connector</th>
                  <th className="px-3 py-2">Level</th>
                  <th className="px-3 py-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-500">No log entries.</td></tr>}
                {logs.map((l) => {
                  const c = openConnector(l.connectorId);
                  return (
                    <tr key={l.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-500">{new Date(l.at).toLocaleString()}</td>
                      <td className="px-3 py-2">{c?.name ?? l.connectorId}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={cn("text-[10px]",
                          l.level === "error" ? "border-red-200 bg-red-50 text-red-800" :
                          l.level === "warn" ? "border-amber-200 bg-amber-50 text-amber-800" :
                          "border-slate-200 bg-slate-50 text-slate-700"
                        )}>{l.level}</Badge>
                      </td>
                      <td className="px-3 py-2 font-mono text-[11px]">{l.message}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* -------------------------- Add connector dialog -------------------- */}
      <Dialog open={dialog.kind === "add"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add connector</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-600">Name</label>
                <Input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="datadog-eu" />
              </div>
              <div>
                <label className="text-[11px] text-slate-600">Owner team</label>
                <Input value={addOwner} onChange={(e) => setAddOwner(e.target.value)} placeholder="observability-eng" />
              </div>
              <div>
                <label className="text-[11px] text-slate-600">Category</label>
                <Select value={addCategory} onValueChange={(v) => setAddCategory(v as Category)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                      <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[11px] text-slate-600">Authentication</label>
                <Select value={addAuth} onValueChange={(v) => setAddAuth(v as AuthType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["oauth2","api_key","mtls","iam_role","basic","webhook_signed"] as AuthType[]).map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Credentials are entered through the secure server-side workflow after creation. This form never accepts secret values.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>Cancel</Button>
            <Button onClick={submitAdd} disabled={!addName.trim() || !addOwner.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------------- Configure / dependencies -------------------- */}
      <Dialog open={dialog.kind === "configure" || dialog.kind === "dependencies"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.kind === "configure" ? "Configure" : "Dependencies"} — {dlgConnector?.name}</DialogTitle>
          </DialogHeader>
          {dlgConnector && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><div className="text-slate-500">Owner</div><div>{dlgConnector.owner}</div></div>
                <div><div className="text-slate-500">Category</div><div>{CATEGORY_LABEL[dlgConnector.category]}</div></div>
                <div><div className="text-slate-500">Version</div><div>{dlgConnector.version}</div></div>
                <div><div className="text-slate-500">Schema</div><div>{dlgConnector.schemaVersion}</div></div>
                <div><div className="text-slate-500">Rate limit</div><div>{dlgConnector.rateLimitPerMin}/min</div></div>
                <div><div className="text-slate-500">Auth</div><div>{dlgConnector.authType}</div></div>
                <div><div className="text-slate-500">Secret ref</div><div className="font-mono text-[11px]">{dlgConnector.secretRef ?? "—"}</div></div>
                <div><div className="text-slate-500">Environments</div><div>{dlgConnector.environments.join(", ")}</div></div>
              </div>
              <div>
                <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Dependent runbooks</div>
                {dlgConnector.dependentRunbookIds.length === 0
                  ? <div className="text-xs text-slate-500">No runbooks depend on this connector.</div>
                  : <div className="flex flex-wrap gap-1">{dlgConnector.dependentRunbookIds.map((r) => (
                      <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>
                    ))}</div>}
              </div>
              <div>
                <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Dependent workers</div>
                {dlgConnector.dependentWorkerIds.length === 0
                  ? <div className="text-xs text-slate-500">No digital workers depend on this connector.</div>
                  : <div className="flex flex-wrap gap-1">{dlgConnector.dependentWorkerIds.map((w) => (
                      <Badge key={w} variant="outline" className="text-[10px]">{w}</Badge>
                    ))}</div>}
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setDialog({ kind: "none" })}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ----------------------------- Test dialog -------------------------- */}
      <Dialog open={dialog.kind === "test"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Test — {dlgConnector?.name}</DialogTitle></DialogHeader>
          {dialog.kind === "test" && dialog.result && (
            <div className="space-y-2 text-sm">
              <div className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs",
                dialog.result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800")}>
                {dialog.result.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {dialog.result.ok ? "OK" : "Failed"}
              </div>
              <div className="text-xs text-slate-700">Latency: {dialog.result.latencyMs}ms</div>
              <div className="text-xs text-slate-700">{dialog.result.message}</div>
              <div className="text-[11px] text-slate-500">
                Result written to logs and audit stream. Deterministic in Demo Mode (seeded by tenant + scenario).
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setDialog({ kind: "none" })}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -------------------------- Rotate credentials --------------------- */}
      <Dialog open={dialog.kind === "rotate"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rotate credentials — {dlgConnector?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <p>
              Rotation runs through the server-side secret workflow. This UI never accepts, displays, or
              transmits credential values. Bound secret reference:{" "}
              <span className="font-mono text-xs">{dlgConnector?.secretRef ?? "—"}</span>.
            </p>
            <p className="text-[11px] text-slate-500">
              Health becomes Testing during rotation. A rotation completion event is emitted to the audit and domain streams.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>Cancel</Button>
            <Button onClick={() => dialog.kind === "rotate" && rotate(dialog.id)} disabled={!dlgConnector?.secretRef}>
              <RefreshCw className="mr-2 h-4 w-4" /> Start rotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------------------- Field mapping ------------------------ */}
      <Dialog open={dialog.kind === "mapFields"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Map fields — {dlgConnector?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <Input aria-label="Source" placeholder="runops.incident.id" value={fmSrc} onChange={(e) => setFmSrc(e.target.value)} />
              <Input aria-label="Target" placeholder="sn.change_request.correlation_id" value={fmTgt} onChange={(e) => setFmTgt(e.target.value)} />
              <Input aria-label="Transform" placeholder="identity" value={fmTx} onChange={(e) => setFmTx(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => dialog.kind === "mapFields" && submitFieldMap(dialog.id)} disabled={!fmSrc.trim() || !fmTgt.trim()}>
                Save mapping
              </Button>
            </div>
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Current mappings</div>
              <table className="w-full text-xs">
                <thead className="text-left text-slate-500">
                  <tr><th className="py-1">Source</th><th className="py-1">Target</th><th className="py-1">Transform</th><th className="py-1">Updated</th></tr>
                </thead>
                <tbody>
                  {fieldMaps.filter((fm) => fm.connectorId === (dialog.kind === "mapFields" ? dialog.id : "")).map((fm) => (
                    <tr key={fm.id} className="border-t border-slate-100">
                      <td className="py-1 font-mono text-[10px]">{fm.source}</td>
                      <td className="py-1 font-mono text-[10px]">{fm.target}</td>
                      <td className="py-1">{fm.transform}</td>
                      <td className="py-1 text-slate-500">{new Date(fm.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {fieldMaps.filter((fm) => fm.connectorId === (dialog.kind === "mapFields" ? dialog.id : "")).length === 0 && (
                    <tr><td colSpan={4} className="py-2 text-center text-slate-500">No mappings yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500">
              Saved mappings update telemetry projections and ITSM synchronization on next connector cycle.
            </p>
          </div>
          <DialogFooter><Button onClick={() => setDialog({ kind: "none" })}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------- Custom connector ------------------------ */}
      <Dialog open={dialog.kind === "custom"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create custom connector</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <label className="text-[11px] text-slate-600">Name</label>
              <Input value={ccName} onChange={(e) => setCcName(e.target.value)} placeholder="internal-pricing-api" />
            </div>
            <div>
              <label className="text-[11px] text-slate-600">Base URL</label>
              <Input value={ccUrl} onChange={(e) => setCcUrl(e.target.value)} placeholder="https://api.example.internal" />
            </div>
            <div>
              <label className="text-[11px] text-slate-600">Category</label>
              <Select value={ccCat} onValueChange={(v) => setCcCat(v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] text-slate-600">Authentication</label>
              <Select value={ccAuth} onValueChange={(v) => setCcAuth(v as AuthType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["oauth2","api_key","mtls","iam_role","basic","webhook_signed"] as AuthType[]).map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="text-[11px] text-slate-600">Notes</label>
              <Textarea placeholder="Purpose, owner, expected schema" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>Cancel</Button>
            <Button onClick={submitCustom} disabled={!ccName.trim() || !ccUrl.trim()}>Create draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --------------------------- DLQ replay ---------------------------- */}
      <Dialog open={dialog.kind === "dlqReplay"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Replay failed event</DialogTitle></DialogHeader>
          {dlqRow && (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><div className="text-slate-500">Event</div><div className="font-mono">{dlqRow.id}</div></div>
                <div><div className="text-slate-500">Connector</div><div>{openConnector(dlqRow.connectorId)?.name}</div></div>
                <div><div className="text-slate-500">Operation</div><div>{dlqRow.operation}</div></div>
                <div><div className="text-slate-500">Attempts</div><div>{dlqRow.attempts}</div></div>
                <div className="col-span-2"><div className="text-slate-500">Reason</div><div>{dlqRow.reason}</div></div>
              </div>
              <p className="text-[11px] text-slate-500">
                Replay enqueues an Operations Queue task and emits audit + domain events. Payload contents remain on the server.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>Cancel</Button>
            <Button onClick={() => dialog.kind === "dlqReplay" && replayDlq(dialog.id)}>
              <Rewind className="mr-2 h-4 w-4" /> Replay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------ AI recommendation ------------------------ */}
      <Dialog open={dialog.kind === "aiRec"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>{AI_RECOMMENDATION.title}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p>{AI_RECOMMENDATION.conclusion}</p>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-800">Confidence {AI_RECOMMENDATION.confidence}%</Badge>
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">{AI_RECOMMENDATION.sources.length} sources</Badge>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Supporting evidence</div>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {AI_RECOMMENDATION.supportingEvidence.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Contradictory evidence</div>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {AI_RECOMMENDATION.contradictoryEvidence.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Uncertainty</div>
              <div className="mt-1 text-xs">{AI_RECOMMENDATION.uncertainty}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Sources</div>
              <ul className="mt-1 list-disc pl-5 font-mono text-[11px]">
                {AI_RECOMMENDATION.sources.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          </div>
          <DialogFooter><Button onClick={() => setDialog({ kind: "none" })}>Dismiss</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
